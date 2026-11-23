"use strict";
const crypto = require("node:crypto");
const S = require("./security");
const { termKey } = require("./catalog");
const { refundKey } = require("./providers");
const { accessPhase, HEARTBEAT } = require("./jobs");
const DAY = 86400000;
const SCOPE = 30 * 60000;
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function createAdmin({ storage, accountAuth, plans, provider }) {
  const { db } = storage;
  const ready = async (id) => uuid.test(id || "") && Boolean(
    (await db.prepare("SELECT reviewkare.is_platform_admin(?::uuid) AS allowed").get(id))?.allowed,
  );
  const audit = async (id, action, tenant = null, reason = null) =>
    db.prepare("INSERT INTO platform_audit(id,admin_id,action,tenant_id,reason,created) VALUES(?,?,?,?,?,?)")
      .run(crypto.randomUUID(), id, action, tenant, reason, Date.now());

  async function signIn(body) {
    const email = S.email(body.email);
    const password = S.password(body.password);
    const code = S.text(body.code, "authenticator code", 6, true);
    if (!/^\d{6}$/.test(code)) S.fail(400, "Enter a six-digit authenticator code.");
    const id = await accountAuth.authenticateAdmin(email, password, code, ready);
    const token = S.random();
    await storage.transaction(async () => {
      await db.prepare("DELETE FROM platform_sessions WHERE expires<=? OR admin_id=?").run(Date.now(), id);
      await db.prepare("INSERT INTO platform_sessions(token_hash,admin_id,expires) VALUES(?,?,?)")
        .run(S.digest(token), id, Date.now() + SCOPE);
      await audit(id, "sign_in");
    });
    return token;
  }

  async function session(token) {
    if (!/^[a-zA-Z0-9_-]{43}$/.test(token || "")) return null;
    const row = await db.prepare("SELECT * FROM platform_sessions WHERE token_hash=? AND expires>?")
      .get(S.digest(token), Date.now());
    return row && await ready(row.admin_id) ? row : null;
  }

  async function signOut(actor) {
    await storage.transaction(async () => {
      await db.prepare("DELETE FROM platform_sessions WHERE token_hash=?").run(actor.token_hash);
      await audit(actor.admin_id, "sign_out");
    });
  }

  async function workspace(id) {
    const store = await storage.tenant(id);
    if (!store) S.fail(404, "Workspace not found.");
    const reviews = await db.prepare(
      "SELECT count(*) AS total, count(published_at) AS published FROM reviews WHERE tenant_id=?",
    ).get(id);
    const google = await db.prepare("SELECT last_sync,last_error FROM google_connections WHERE tenant_id=?").get(id);
    const usage = await storage.aiUsage.month(id, new Date().toISOString().slice(0, 7));
    return { store, reviews, google, usage };
  }

  async function screen(actor, pathname, params) {
    if (pathname === "/admin/support") {
      if (!actor.support_tenant || actor.support_expires <= Date.now())
        S.fail(403, "Start a support view from a workspace detail page.");
      await audit(actor.admin_id, "support_read", actor.support_tenant);
      return { support: true, ...await workspace(actor.support_tenant) };
    }
    if (actor.support_tenant && actor.support_expires > Date.now())
      return { supportOnly: true };
    const match = /^\/admin\/workspaces\/([a-z0-9_-]{1,80})$/i.exec(pathname);
    if (match) {
      await audit(actor.admin_id, "workspace_viewed", match[1]);
      return workspace(match[1]);
    }
    if (pathname === "/admin/workspaces") {
      const search = S.text(params.get("q") || "", "search", 120);
      const cursor = S.text(params.get("after") || "", "cursor", 80);
      const matches = await db.prepare(
        "SELECT id FROM tenants WHERE id>? AND (id=? OR lower(document::jsonb->'location'->>'name') LIKE ? OR lower(document::jsonb->'user'->>'email')=?) ORDER BY id LIMIT 26",
      ).all(cursor, search, "%" + search.toLowerCase() + "%", search.toLowerCase());
      const entries = await Promise.all(matches.slice(0, 25).map(({ id }) => workspace(id)));
      return { entries, search, next: matches.length > 25 ? matches[24].id : null };
    }
    if (pathname === "/admin/billing") return {
      orders: await db.prepare("SELECT id,tenant_id,plan_id,cycle,amount,status,payment_id,refund_amount FROM orders ORDER BY expires DESC LIMIT 50").all(),
      hooks: await db.prepare("SELECT id,kind,processed_at FROM webhook_events ORDER BY processed_at DESC LIMIT 20").all(),
      failures: await db.prepare("SELECT id,kind,created_at FROM jobs WHERE kind='razorpay.reconcile' AND failed=1 ORDER BY created_at DESC LIMIT 20").all(),
      hookFailures: await db.prepare("SELECT count(*) AS total FROM audit WHERE action='billing_webhook_failed' AND created>?").get(Date.now() - DAY),
    };
    if (pathname === "/admin/jobs") return {
      jobs: await db.prepare("SELECT id,kind,run_at,attempts,finished_at,failed FROM jobs WHERE id<>? ORDER BY failed DESC,created_at DESC LIMIT 50").all(HEARTBEAT),
      pending: (await db.prepare("SELECT count(*) AS total FROM jobs WHERE finished_at IS NULL").get()).total,
      lastRanAt: (await db.prepare("SELECT finished_at FROM jobs WHERE id=?").get(HEARTBEAT))?.finished_at,
    };
    if (pathname === "/admin/analytics") return {
      metrics: await db.prepare("SELECT day,page,metric,bucket,hits FROM site_metrics ORDER BY day DESC,page,metric,bucket LIMIT 150").all(),
    };
    if (pathname === "/admin/audit") {
      const action = S.text(params.get("action") || "", "action", 60);
      return { action, audit: await db.prepare(
        "SELECT * FROM platform_audit WHERE (?='' OR action=?) ORDER BY created DESC LIMIT 100",
      ).all(action, action) };
    }
    if (pathname !== "/admin") S.fail(404, "Administrator page not found.");

    const now = Date.now();
    const month = new Date(now).toISOString().slice(0, 7);
    const stats = { signups: 0, activated: 0, monthlyEquivalent: 0, expiring: 0, churn: 0 };
    const workspaces = await db.prepare("SELECT document FROM tenants").all();
    for (const { document } of workspaces) {
      const store = JSON.parse(document);
      const expiry = Date.parse(store.plan.expiresAt);
      if (String(store.createdAt || "").startsWith(month)) stats.signups++;
      if (store.receipts.length) stats.activated++;
      if (expiry > now && expiry <= now + 7 * DAY) stats.expiring++;
      if (expiry <= now && new Date(expiry).toISOString().startsWith(month) && store.receipts.length) stats.churn++;
      const prior = store.receipts.find(item => Date.parse(item.startsAt) <= now && Date.parse(item.expiresAt) > now);
      if (!prior || store.plan.suspendedByAdmin) continue;
      const term = termKey(/^\d+/.exec(prior.term || "")?.[0]);
      const months = prior.term === "365 days" ? 12 : (typeof term === "number" ? term : 1);
      stats.monthlyEquivalent += Math.max(0, prior.amount - (prior.refundAmount || 0)) / months;
    }
    return { stats };
  }

  async function act(actor, body) {
    const action = S.text(body.action, "action", 40, true);
    if (action === "end_support") {
      await storage.transaction(async () => {
        await db.prepare("UPDATE platform_sessions SET support_tenant=NULL,support_expires=NULL WHERE token_hash=?").run(actor.token_hash);
        await audit(actor.admin_id, "support_ended", actor.support_tenant);
      });
      return { redirect: "/admin" };
    }
    if (actor.support_tenant && actor.support_expires > Date.now()) S.fail(403, "End the support view before taking action.");
    const reason = S.text(body.reason, "reason", 240, true);
    if (action === "retry_job") {
      const id = S.text(body.jobId, "job identifier", 240, true);
      await storage.transaction(async () => {
        const change = await db.prepare(
          "UPDATE jobs SET run_at=?,finished_at=NULL,failed=0,attempts=0,locked_until=0,lease=NULL WHERE id=? AND failed=1 AND kind IN ('google.sync','razorpay.reconcile') AND (kind='google.sync' OR payload<>'{}')",
        ).run(Date.now(), id);
        if (!change.changes) S.fail(409, "This job cannot be retried here.");
        await audit(actor.admin_id, action, null, reason);
      });
      return { redirect: "/admin/jobs" };
    }
    const id = S.text(body.tenantId, "workspace", 80, true);
    const store = await storage.tenant(id);
    if (!store) S.fail(404, "Workspace not found.");
    const back = "/admin/workspaces/" + encodeURIComponent(id);
    if (action === "support") {
      await storage.transaction(async () => {
        await db.prepare("UPDATE platform_sessions SET support_tenant=?,support_expires=? WHERE token_hash=?")
          .run(id, Math.min(actor.expires, Date.now() + SCOPE), actor.token_hash);
        await audit(actor.admin_id, "support_started", id, reason);
      });
      return { redirect: "/admin/support" };
    }
    if (action === "reset") {
      await audit(actor.admin_id, "reset_requested", id, reason);
      await accountAuth.recover(store.user.email);
      await audit(actor.admin_id, "reset_submitted", id, reason);
      return { redirect: back };
    }
    if (action === "delete") {
      if (body.confirmation !== id) S.fail(400, "Type the workspace ID to confirm deletion.");
      const owner = await db.prepare("SELECT auth_user_id FROM users WHERE tenant_id=?").get(id);
      if (!owner?.auth_user_id || await ready(owner.auth_user_id))
        S.fail(409, "This workspace requires database-operator review before deletion.");
      await audit(actor.admin_id, "deletion_requested", id, reason);
      await accountAuth.deleteUser(owner.auth_user_id);
      await audit(actor.admin_id, "workspace_deleted", id, reason);
      return { redirect: "/admin/workspaces" };
    }
    if (action === "refund") {
      const paymentId = S.text(body.paymentId, "payment reference", 100, true);
      const amount = Number(body.amount);
      if (!/^pay_[A-Za-z0-9]+$/.test(paymentId) || body.confirmation !== paymentId ||
          !Number.isSafeInteger(amount) || amount < 100) S.fail(400, "Confirm the payment ID and use a whole paise amount.");
      const order = await db.prepare("SELECT * FROM orders WHERE tenant_id=? AND payment_id=?").get(id, paymentId);
      if (!order || !["paid", "partially_refunded", "refunded"].includes(order.status) || amount > order.amount)
        S.fail(409, "The refund does not match this workspace and payment.");
      const key = refundKey(paymentId, amount);
      await audit(actor.admin_id, "refund_requested", id, reason);
      const refund = await provider.razorpay("payments/" + paymentId + "/refund", {
        method: "POST", body: { amount, receipt: key }, refundKey: key,
      });
      if (refund.payment_id !== paymentId || refund.amount !== amount) S.fail(502, "Refund response could not be matched.");
      await audit(actor.admin_id, "refund_submitted", id, reason);
      return { redirect: back };
    }
    if (action === "export") {
      await audit(actor.admin_id, "exported", id, reason);
      const manualReviews = await db.prepare(
        "SELECT id,reviewer_name,rating,body,status,draft_text,final_text FROM reviews WHERE tenant_id=? AND source='manual' ORDER BY created_at",
      ).all(id);
      return { export: {
        id, location: store.location, plan: store.plan, receipts: store.receipts, reviews: manualReviews,
      } };
    }

    await storage.transaction(async () => {
      const current = await storage.tenant(id);
      if (!current || current.plan.status === "deleting") S.fail(409, "Workspace is unavailable.");
      if (action === "revoke") {
        await db.prepare("DELETE FROM sessions WHERE email=(SELECT email FROM users WHERE tenant_id=?)").run(id);
      } else if (action === "suspend") {
        current.plan.suspendedByAdmin = true;
        await storage.save(current);
        await db.prepare("DELETE FROM sessions WHERE email=(SELECT email FROM users WHERE tenant_id=?)").run(id);
      } else if (action === "restore") {
        delete current.plan.suspendedByAdmin;
        await storage.save(current);
      } else if (["extend", "comp", "change_plan"].includes(action)) {
        const tier = action === "extend" ? current.plan.tier : body.planId;
        if (typeof tier !== "string" || !Object.hasOwn(plans, tier))
          S.fail(400, "Select a valid plan.");
        const now = Date.now();
        const prior = Date.parse(current.plan.expiresAt);
        if (action !== "change_plan") {
          const days = Number(body.days);
          if (!Number.isSafeInteger(days) || days < 1 || days > 365)
            S.fail(400, "Enter between 1 and 365 days.");
          current.plan.startsAt ||= new Date(now).toISOString();
          current.plan.expiresAt = new Date(Math.max(now, prior || 0) + days * DAY).toISOString();
          current.plan.status = action === "comp" ? "granted" : "active";
        } else if (accessPhase(current.plan, now) !== "active") {
          S.fail(409, "Grant access before changing an inactive plan.");
        }
        current.plan.tier = tier;
        current.plan.name = plans[tier].name;
        await storage.save(current);
      } else S.fail(400, "Unknown administrator action.");
      await audit(actor.admin_id, action, id, reason);
    });
    return { redirect: back };
  }
  return { signIn, session, signOut, screen, act };
}

module.exports = { createAdmin };
