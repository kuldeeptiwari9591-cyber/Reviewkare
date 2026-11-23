"use strict";
const crypto = require("node:crypto");
const S = require("./security");
const { enqueue } = require("./billing");
const DAY = 86400000;
const MINUTE = 60000;
const INDIA_OFFSET = 19800000;
const HEARTBEAT = "worker:heartbeat";

function accessPhase(plan, now = Date.now()) {
  const expiry = Date.parse(plan.expiresAt);
  if (!Number.isFinite(expiry)) return "unpaid";
  if (now < expiry) return "active";
  const days = Math.floor((now - expiry) / DAY);
  if (days >= 180) return "delete_due";
  if (days >= 61) return "suspended";
  return days >= 1 ? "readonly" : "expired";
}

function indiaMorning(timestamp) {
  const date = new Date(timestamp + INDIA_OFFSET).toISOString().slice(0, 10);
  return Date.parse(date + "T09:00:00+05:30");
}

function createJobs({ storage, provider, billing, config, syncGoogle, accountAuth }) {
  const { db } = storage;
  const syncInterval = (store) => (config.plans?.[store.plan.tier]?.syncMinutes || 20) * MINUTE;
  async function schedule(now, { lifecycle, payments, google, deletes }) {
    if (payments) {
      let cursor = "";
      const day = Math.floor(now / DAY);
      while (true) {
        const orders = await db.prepare(
          "SELECT id FROM orders WHERE id>? AND ((status IN ('created','failed') AND expires>?) OR (status IN ('paid','partially_refunded') AND expires>?)) ORDER BY id LIMIT 100",
        ).all(cursor, now - 30 * DAY, now - 180 * DAY);
        if (!orders.length) break;
        for (const { id } of orders) {
          cursor = id;
          await enqueue(db, {
            id: "reconcile:" + day + ":" + id, kind: "razorpay.reconcile",
            payload: { orderId: id }, runAt: now,
          });
        }
      }
    }
    if (lifecycle || google) {
      let cursor = "";
      while (true) {
        const batch = await db.prepare("SELECT id FROM tenants WHERE id>? ORDER BY id LIMIT 100").all(cursor);
        if (!batch.length) break;
        for (const { id } of batch) {
          cursor = id;
          const store = await storage.tenant(id);
          if (!store) continue;
          const { plan } = store;
          const expires = Date.parse(plan.expiresAt);
          const paid = ["active", "expired", "readonly", "suspended", "deleting"].includes(plan.status);
          const key = id + ":" + expires;
          if (lifecycle && paid && Number.isFinite(expires)) {
            const phase = accessPhase(plan, now);
            const payload = { expires };
            if (phase !== "active") {
              const next = phase === "delete_due" ? "suspended" : phase;
              if (plan.status !== next && plan.status !== "deleting")
                await enqueue(db, { id: "lifecycle:" + key + ":" + next, kind: "plan.transition", tenantId: id, payload, runAt: now });
              if (phase === "delete_due" && deletes)
                await enqueue(db, { id: "delete:" + key, kind: "account.delete", tenantId: id, payload, runAt: now });
            }
            for (const offset of [-15, -7, -3, -1, 150, 170]) {
              const runAt = indiaMorning(expires + offset * DAY);
              if (runAt > now || now >= runAt + DAY ||
                  (offset < 0 && expires <= now) || (offset > 0 && !deletes))
                continue;
              await enqueue(db, {
                id: "notice:" + key + ":" + offset, kind: offset < 0 ? "plan.reminder" : "account.notice",
                tenantId: id, payload: { expires, offset }, runAt,
              });
            }
          }
          if (google && !plan.suspendedByAdmin && accessPhase(plan, now) === "active" && await storage.google.get(id))
            await enqueue(db, {
              id: "google:" + id + ":" + Math.floor(now / syncInterval(store)),
              kind: "google.sync", tenantId: id, runAt: now,
            });
        }
      }
    }
  }

  async function claim(now) {
    return storage.transaction(async () => {
      const job = await db.prepare(
        "SELECT * FROM jobs WHERE finished_at IS NULL AND run_at<=? AND locked_until<=? ORDER BY run_at,id LIMIT 1",
      ).get(now, now);
      if (!job) return null;
      const lease = crypto.randomUUID();
      await db.prepare("UPDATE jobs SET attempts=attempts+1,lease=?,locked_until=? WHERE id=?")
        .run(lease, now + 20 * MINUTE, job.id);
      return { ...job, lease, attempts: job.attempts + 1 };
    });
  }

  async function run(job, now, flags) {
    const payload = JSON.parse(job.payload);
    if (job.kind === "razorpay.reconcile") {
      if (flags.payments) await billing.reconcile(payload.orderId, now);
      return;
    }
    if (job.kind === "email.outbox") {
      // Resend retains an idempotency key for 24 hours. Leave a retry window
      // within that period after the first possible delivery.
      if (now >= job.created_at + DAY) throw new Error("Email delivery window closed.");
      await provider.sendMail(payload.to, payload.subject, payload.text, { idempotencyKey: job.id });
      return;
    }
    const store = await storage.tenant(job.tenant_id);
    if (!store) return;
    if (job.kind === "google.sync") {
      const connection = flags.google && await storage.google.get(store.id);
      const last = Date.parse(connection?.lastSync);
      if (connection && !store.plan.suspendedByAdmin && accessPhase(store.plan, now) === "active" &&
          (!Number.isFinite(last) || now - last >= syncInterval(store) - 2 * MINUTE))
        await syncGoogle(store);
      return;
    }
    if (!flags.lifecycle || Date.parse(store.plan.expiresAt) !== payload.expires) return;
    const phase = accessPhase(store.plan, now);
    if (job.kind === "plan.transition") {
      await storage.transaction(async () => {
        const fresh = await storage.tenant(store.id);
        if (!fresh || fresh.plan.status === "deleting" || Date.parse(fresh.plan.expiresAt) !== payload.expires) return;
        const next = phase === "delete_due" ? "suspended" : phase;
        if (fresh.plan.status === next) return;
        fresh.plan.status = next;
        fresh.plan.deleteAt = new Date(payload.expires + 180 * DAY).toISOString();
        await storage.save(fresh);
        await storage.event(fresh.id, "plan_" + next);
      });
      return;
    }
    if (job.kind === "plan.reminder" || job.kind === "account.notice") {
      const deleting = job.kind === "account.notice";
      if ((deleting && !flags.deletes) || now >= job.created_at + DAY) return;
      const date = new Date(payload.expires + (deleting ? 180 * DAY : 0)).toISOString();
      const subject = deleting ? "Your ReviewKare workspace deletion date" : "Your ReviewKare access is ending";
      const text = deleting
        ? "Your workspace is scheduled for deletion on " + date + ". Contact " + config.supportEmail + " to request an export before that date."
        : "Your paid access ends on " + date + ". Open " + config.origin + "/app/billing to renew or export your workspace.";
      await provider.sendMail(store.user.email, subject, text, { idempotencyKey: job.id });
      return job.kind === "account.notice" ? { delivered: true } : undefined;
      return;
    }
    if (job.kind === "account.delete" && flags.deletes && phase === "delete_due") {
      for (const offset of [150, 170]) {
        const notice = await db.prepare("SELECT finished_at,failed,payload FROM jobs WHERE id=?")
          .get("notice:" + store.id + ":" + payload.expires + ":" + offset);
        if (!notice?.finished_at || notice.failed || !JSON.parse(notice.payload).delivered)
          throw new Error("Required deletion notice has no delivery record.");
      }
      const owner = await storage.transaction(async () => {
        const fresh = await storage.tenant(store.id);
        if (!fresh || Date.parse(fresh.plan.expiresAt) !== payload.expires) return null;
        const fields = accountAuth ? "email,auth_user_id" : "email";
        const user = await db.prepare("SELECT " + fields + " FROM users WHERE tenant_id=?").get(store.id);
        if (!user || (accountAuth && !user.auth_user_id))
          S.fail(409, "Workspace owner could not be verified for deletion.");
        if (fresh.plan.status !== "deleting") {
          fresh.plan.status = "deleting";
          await storage.save(fresh);
          await storage.event(null, "workspace_retention_deletion_started");
        }
        if (!accountAuth) {
          await db.prepare("UPDATE orders SET tenant_id=? WHERE tenant_id=?").run("deleted_" + S.random(), store.id);
          await db.prepare("DELETE FROM requests WHERE tenant_id=?").run(store.id);
          await db.prepare("DELETE FROM ai_usage WHERE tenant_id=?").run(store.id);
          await db.prepare("UPDATE audit SET tenant_id=NULL WHERE tenant_id=?").run(store.id);
          await db.prepare("DELETE FROM tenants WHERE id=?").run(store.id);
        }
        return user;
      });
      if (owner && accountAuth) await accountAuth.deleteUser(owner.auth_user_id);
      if (owner) await storage.event(null, "workspace_retention_deleted");
    }
  }

  async function tick(now, flags, { limit = 20, budget = 45000 } = {}) {
    await schedule(now, flags);
    const deadline = Date.now() + budget;
    const result = { completed: 0, retried: 0, failed: 0 };
    for (let i = 0; i < limit && Date.now() < deadline; i++) {
      const job = await claim(now);
      if (!job) break;
      try {
        const metadata = await run(job, now, flags);
        await db.prepare("UPDATE jobs SET finished_at=?,payload=?,lease=NULL,locked_until=0 WHERE id=? AND lease=?")
          .run(now, JSON.stringify(metadata || {}), job.id, job.lease);
        result.completed++;
      } catch {
        const next = now + 2 ** job.attempts * MINUTE;
        const failed = job.attempts >= 8 || (job.kind === "email.outbox" && next >= job.created_at + DAY);
        await db.prepare("UPDATE jobs SET run_at=?,finished_at=?,failed=?,payload=CASE WHEN ?=1 AND kind NOT IN ('google.sync','razorpay.reconcile') THEN '{}' ELSE payload END,lease=NULL,locked_until=0 WHERE id=? AND lease=?")
          .run(next, failed ? now : null, Number(failed), Number(failed), job.id, job.lease);
        result[failed ? "failed" : "retried"]++;
      }
    }
    await db.prepare("DELETE FROM jobs WHERE finished_at<? AND failed=0 AND id<>?")
      .run(now - 90 * DAY, HEARTBEAT);
    const completedAt = Math.max(now, Date.now());
    await db.prepare(
      `INSERT INTO jobs(id,kind,payload,run_at,created_at,finished_at) VALUES(?,'worker.heartbeat','{}',?,?,?)
       ON CONFLICT(id) DO UPDATE SET finished_at=excluded.finished_at
       WHERE jobs.finished_at < excluded.finished_at`,
    ).run(HEARTBEAT, completedAt, completedAt, completedAt);
    return result;
  }

  return { tick };
}

module.exports = { createJobs, accessPhase, HEARTBEAT };
