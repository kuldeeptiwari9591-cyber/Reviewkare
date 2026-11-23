// @ts-check
"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { AsyncLocalStorage } = require("node:async_hooks");
const { DatabaseSync: Database } = require("node:sqlite");
const { migrate } = require("./migrations");

function openStorage(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = path.join(directory, "reviewkare.sqlite");
  const rawDb = new Database(filename);
  try {
    fs.chmodSync(filename, 0o600);
  } catch (error) {
    if (process.platform !== "win32") throw error;
  }
  rawDb.exec("PRAGMA journal_mode = WAL");
  rawDb.exec("PRAGMA synchronous = FULL");
  rawDb.exec("PRAGMA foreign_keys = ON");
  rawDb.exec("PRAGMA busy_timeout = 5000");
  migrate(rawDb);
  const context = new AsyncLocalStorage();
  let queue = Promise.resolve();
  function schedule(fn) {
    if (context.getStore()?.active) return Promise.resolve().then(fn);
    const result = queue.then(fn);
    queue = result.then(
      () => {},
      () => {},
    );
    return result;
  }
  const db = {
    prepare(sql) {
      return Object.fromEntries(
        ["get", "all", "run"].map((method) => [
          method,
          (...args) => schedule(() => rawDb.prepare(sql)[method](...args)),
        ]),
      );
    },
  };
  function transaction(fn) {
    if (context.getStore()?.active) return fn();
    return schedule(async () => {
      rawDb.exec("BEGIN IMMEDIATE");
      const scope = { active: true };
      try {
        const result = await context.run(scope, fn);
        rawDb.exec("COMMIT");
        return result;
      } catch (error) {
        rawDb.exec("ROLLBACK");
        throw error;
      } finally {
        scope.active = false;
      }
    });
  }
  return createStorage({
    db,
    transaction,
    filename,
    rawDb,
    dialect: "sqlite",
    ready: () =>
      schedule(() => {
        const stats = fs.statfsSync(directory);
        if (stats.bavail * stats.bsize < 5 * 1024 * 1024)
          throw new Error("Insufficient disk capacity");
        rawDb.exec("CREATE TEMP TABLE IF NOT EXISTS _readiness(x INTEGER)");
        rawDb.exec("INSERT INTO _readiness VALUES(1); DELETE FROM _readiness");
      }),
    close: () => schedule(() => rawDb.close()),
  });
}

function createStorage(driver) {
  const { db, transaction } = driver;
  async function tenant(id) {
    const row = await db
      .prepare("SELECT document, version FROM tenants WHERE id=?")
      .get(id);
    if (!row) return null;
    const value = JSON.parse(row.document);
    const counts = await db
      .prepare(
        "SELECT scans,drafts,usage_month,monthly_drafts FROM qr_codes WHERE tenant_id=?",
      )
      .get(id);
    if (counts) {
      value.qr.scans = counts.scans;
      value.qr.drafts = counts.drafts;
      if (value.usage.month === counts.usage_month)
        value.usage.drafts = counts.monthly_drafts;
    }
    Object.defineProperty(value, "_version", {
      value: row.version,
      writable: true,
    });
    return value;
  }
  async function save(value) {
    // Reviews live in their own table. Never re-serialize them into the
    // tenant document, even if a caller attached a transient copy.
    const { reviews, ...document } = value;
    const result = await db
      .prepare(
        "UPDATE tenants SET document=?,version=version+1 WHERE id=? AND version=?",
      )
      .run(JSON.stringify(document), value.id, value._version);
    if (result.changes !== 1) {
      const error = /** @type {Error & { status?: number }} */ (
        new Error("Your data changed. Reload and try again.")
      );
      error.status = 409;
      throw error;
    }
    value._version++;
  }
  async function event(tenantId, action) {
    await db
      .prepare("INSERT INTO audit(tenant_id,action,created) VALUES(?,?,?)")
      .run(tenantId || null, action, Date.now());
  }
  async function cleanup({ googleRetention = false } = {}) {
    const now = Date.now();
    await transaction(async () => {
      if (driver.dialect === "postgres")
        await db
          .prepare("DELETE FROM rate_limits WHERE window_end < ?")
          .run(now - 60000);
      if (driver.dialect === "postgres")
        await db.prepare("DELETE FROM platform_sessions WHERE expires<=?").run(now);
      if (googleRetention)
        await db.prepare("DELETE FROM reviews WHERE source='google' AND created_at<=?")
          .run(now - 30 * 86400000);
      await db.prepare("DELETE FROM site_metrics WHERE day < ?")
        .run(new Date(now - 90 * 86400000).toISOString().slice(0, 10));
      await db.prepare("DELETE FROM sessions WHERE expires < ?").run(now);
      await db
        .prepare("DELETE FROM capabilities WHERE expires < ?")
        .run(now - 86400000);
      await db
        .prepare("DELETE FROM orders WHERE status='created' AND expires < ?")
        .run(now - 30 * 86400000);
      await db
        .prepare("DELETE FROM requests WHERE created < ?")
        .run(now - 90 * 86400000);
      await db
        .prepare("DELETE FROM audit WHERE created < ?")
        .run(now - 365 * 86400000);
      await db
        .prepare(
          "DELETE FROM review_candidates WHERE selected_at IS NULL AND created_at < ?",
        )
        .run(now - 180 * 86400000);
      const usageCutoff = new Date(now);
      usageCutoff.setUTCMonth(usageCutoff.getUTCMonth() - 24);
      await db
        .prepare("DELETE FROM ai_usage WHERE month < ?")
        .run(usageCutoff.toISOString().slice(0, 7));
    });
  }
  function toReview(row) {
    return {
      id: row.id,
      locationId: row.location_id,
      reviewerName: row.reviewer_name,
      rating: row.rating,
      text: row.body,
      source: row.source,
      googleReviewId: row.google_review_id || null,
      googleReplyState: row.google_reply_state || null,
      publishedAt: row.published_at
        ? new Date(row.published_at).toISOString()
        : null,
      createdAt: new Date(row.created_at).toISOString(),
      reply: {
        draftText: row.draft_text,
        finalText: row.final_text,
        status: row.status,
        model: row.model,
        validatorPassed: Boolean(row.validator_passed),
        isAutoPosted: Boolean(row.is_auto_posted),
      },
    };
  }

  const reviews = {
    async list(tenantId, { page = 1, pageSize = 20, status = null } = {}) {
      const size = Math.min(100, Math.max(1, pageSize));
      const offset = (Math.max(1, page) - 1) * size;
      const where = status ? "tenant_id=? AND status=?" : "tenant_id=?";
      const params = status ? [tenantId, status] : [tenantId];
      const rows = (
        await db
          .prepare(
            `SELECT * FROM reviews WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
          )
          .all(...params, size, offset)
      ).map(toReview);
      const total = (
        await db
          .prepare(`SELECT count(*) AS n FROM reviews WHERE ${where}`)
          .get(...params)
      ).n;
      return { rows, total, page: Math.max(1, page), pageSize: size };
    },
    async all(tenantId) {
      return (
        await db
          .prepare(
            "SELECT * FROM reviews WHERE tenant_id=? ORDER BY created_at DESC, id DESC",
          )
          .all(tenantId)
      ).map(toReview);
    },
    async get(tenantId, id) {
      const row = await db
        .prepare("SELECT * FROM reviews WHERE tenant_id=? AND id=?")
        .get(tenantId, id);
      return row ? toReview(row) : null;
    },
    async create(tenantId, review) {
      const created = Date.parse(review.createdAt || "") || Date.now();
      await db
        .prepare(
          `INSERT INTO reviews
        (id,tenant_id,location_id,reviewer_name,rating,body,source,status,draft_text,final_text,model,validator_passed,is_auto_posted,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          review.id,
          tenantId,
          review.locationId || null,
          review.reviewerName,
          review.rating,
          review.text || "",
          review.source || "manual",
          review.reply?.status || "draft",
          review.reply?.draftText || null,
          review.reply?.finalText || null,
          review.reply?.model || null,
          review.reply?.validatorPassed ? 1 : 0,
          review.reply?.isAutoPosted ? 1 : 0,
          created,
          created,
        );
      return await reviews.get(tenantId, review.id);
    },
    async updateReply(tenantId, id, reply) {
      const result = await db
        .prepare(
          `UPDATE reviews SET
          status=?,draft_text=?,final_text=?,model=?,validator_passed=?,is_auto_posted=?,updated_at=?
          WHERE tenant_id=? AND id=?`,
        )
        .run(
          reply.status,
          reply.draftText || null,
          reply.finalText || null,
          reply.model || null,
          reply.validatorPassed ? 1 : 0,
          reply.isAutoPosted ? 1 : 0,
          Date.now(),
          tenantId,
          id,
        );
      return result.changes === 1;
    },
    async upsertGoogle(tenantId, review) {
      const now = Date.now();
      const created = Date.parse(review.createdAt || "") || now;
      await db
        .prepare(
          `INSERT INTO reviews
        (id,tenant_id,location_id,reviewer_name,rating,body,source,status,draft_text,final_text,model,validator_passed,is_auto_posted,created_at,updated_at,google_review_id,google_reply_state,published_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tenant_id, google_review_id) DO UPDATE SET
          reviewer_name=excluded.reviewer_name,
          rating=excluded.rating,
          body=excluded.body,
          updated_at=excluded.updated_at,
          google_reply_state=coalesce(reviews.google_reply_state, excluded.google_reply_state)`,
        )
        .run(
          crypto.randomUUID(),
          tenantId,
          review.locationId || null,
          String(review.reviewerName || "Google reviewer").slice(0, 120),
          Math.min(5, Math.max(1, Number(review.rating) || 1)),
          String(review.text || "").slice(0, 4000),
          "google",
          review.hasReply ? "approved" : "draft",
          null,
          null,
          null,
          0,
          0,
          created,
          now,
          review.googleReviewId,
          review.hasReply ? "posted" : null,
          null,
        );
      return await db
        .prepare(
          "SELECT * FROM reviews WHERE tenant_id=? AND google_review_id=?",
        )
        .get(tenantId, review.googleReviewId);
    },
    async markPublished(tenantId, id, state) {
      return (
        (
          await db
            .prepare(
              "UPDATE reviews SET google_reply_state=?,published_at=?,updated_at=? WHERE tenant_id=? AND id=?",
            )
            .run(state, Date.now(), Date.now(), tenantId, id)
        ).changes === 1
      );
    },
    async remove(tenantId, id) {
      return (
        (
          await db
            .prepare("DELETE FROM reviews WHERE tenant_id=? AND id=?")
            .run(tenantId, id)
        ).changes === 1
      );
    },
    async count(tenantId, status = null) {
      const where = status ? "tenant_id=? AND status=?" : "tenant_id=?";
      const params = status ? [tenantId, status] : [tenantId];
      return (
        await db
          .prepare(`SELECT count(*) AS n FROM reviews WHERE ${where}`)
          .get(...params)
      ).n;
    },
    async stats(tenantId) {
      const row = await db
        .prepare(
          `SELECT count(*) AS total,
            coalesce(sum(CASE WHEN status='held' THEN 1 ELSE 0 END),0) AS held,
            coalesce(sum(CASE WHEN status='approved' THEN 1 ELSE 0 END),0) AS approved,
            coalesce(sum(CASE WHEN status='draft' THEN 1 ELSE 0 END),0) AS draft
          FROM reviews WHERE tenant_id=?`,
        )
        .get(tenantId);
      return {
        total: row.total,
        held: row.held,
        approved: row.approved,
        draft: row.draft,
      };
    },
  };

  function toCandidate(row) {
    return {
      id: row.id,
      reviewId: row.review_id,
      model: row.model,
      style: row.style,
      draftText: row.draft_text,
      promptVersion: row.prompt_version,
      inputHash: row.input_hash,
      batch: row.batch,
      score: row.score,
      latencyMs: row.latency_ms,
      promptTokens: row.prompt_tokens,
      completionTokens: row.completion_tokens,
      costMicros: row.cost_micros,
      selected: Boolean(row.selected_at),
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  const candidates = {
    async list(tenantId, reviewId) {
      const latest = await db
        .prepare(
          "SELECT batch FROM review_candidates WHERE tenant_id=? AND review_id=? ORDER BY created_at DESC LIMIT 1",
        )
        .get(tenantId, reviewId);
      if (!latest) return [];
      return (
        await db
          .prepare(
            "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND batch=? ORDER BY score DESC, created_at ASC",
          )
          .all(tenantId, reviewId, latest.batch)
      ).map(toCandidate);
    },
    async byHash(tenantId, reviewId, inputHash, since) {
      const latest = await db
        .prepare(
          "SELECT batch, count(*) AS n FROM review_candidates WHERE tenant_id=? AND review_id=? AND input_hash=? AND created_at>=? GROUP BY batch ORDER BY max(created_at) DESC LIMIT 1",
        )
        .get(tenantId, reviewId, inputHash, since);
      if (!latest || latest.n < 3) return [];
      return (
        await db
          .prepare(
            "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND batch=? ORDER BY score DESC, created_at ASC",
          )
          .all(tenantId, reviewId, latest.batch)
      ).map(toCandidate);
    },
    async get(tenantId, reviewId, id) {
      const row = await db
        .prepare(
          "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND id=?",
        )
        .get(tenantId, reviewId, id);
      return row ? toCandidate(row) : null;
    },
    async replace(tenantId, reviewId, inputHash, items) {
      const batch = crypto.randomUUID(),
        created = Date.now();
      await transaction(async () => {
        // Keep a previously selected draft for the audit trail; replace the
        // comparison set so the owner never sees stale models mixed in.
        await db
          .prepare(
            "DELETE FROM review_candidates WHERE tenant_id=? AND review_id=? AND selected_at IS NULL",
          )
          .run(tenantId, reviewId);
        const insert = db.prepare(`INSERT INTO review_candidates
          (id,tenant_id,review_id,model,style,draft_text,prompt_version,input_hash,batch,score,latency_ms,prompt_tokens,completion_tokens,cost_micros,created_at)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
        for (const item of items) {
          await insert.run(
            crypto.randomUUID(),
            tenantId,
            reviewId,
            item.model,
            item.style,
            item.draftText,
            item.promptVersion,
            item.inputHash || inputHash,
            batch,
            item.score || 0,
            item.latencyMs || 0,
            item.promptTokens || 0,
            item.completionTokens || 0,
            item.costMicros || 0,
            created,
          );
        }
      });
      return await candidates.list(tenantId, reviewId);
    },
    async select(tenantId, reviewId, id) {
      const now = Date.now();
      return await transaction(async () => {
        const found = await db
          .prepare(
            "SELECT id FROM review_candidates WHERE tenant_id=? AND review_id=? AND id=?",
          )
          .get(tenantId, reviewId, id);
        if (!found) return null;
        await db
          .prepare(
            "UPDATE review_candidates SET selected_at=NULL WHERE tenant_id=? AND review_id=?",
          )
          .run(tenantId, reviewId);
        await db
          .prepare(
            "UPDATE review_candidates SET selected_at=? WHERE tenant_id=? AND review_id=? AND id=?",
          )
          .run(now, tenantId, reviewId, id);
        return await candidates.get(tenantId, reviewId, id);
      });
    },
  };

  const aiUsage = {
    async month(tenantId, month) {
      const row = await db
        .prepare(
          "SELECT generations,candidates,failures,cost_micros FROM ai_usage WHERE tenant_id=? AND month=?",
        )
        .get(tenantId, month);
      return {
        generations: row ? row.generations : 0,
        candidates: row ? row.candidates : 0,
        failures: row ? row.failures : 0,
        costMicros: row ? row.cost_micros : 0,
      };
    },
    async total(month) {
      const row = await db
        .prepare(
          "SELECT coalesce(sum(generations),0) AS generations,coalesce(sum(candidates),0) AS candidates,coalesce(sum(failures),0) AS failures,coalesce(sum(cost_micros),0) AS cost_micros FROM ai_usage WHERE month=?",
        )
        .get(month);
      return {
        generations: row.generations,
        candidates: row.candidates,
        failures: row.failures,
        costMicros: row.cost_micros,
      };
    },
    async add(tenantId, month, delta) {
      await db
        .prepare(
          `INSERT INTO ai_usage(tenant_id,month,generations,candidates,failures,cost_micros)
         VALUES(?,?,?,?,?,?)
         ON CONFLICT(tenant_id,month) DO UPDATE SET
          generations=ai_usage.generations+excluded.generations,
           candidates=ai_usage.candidates+excluded.candidates,
           failures=ai_usage.failures+excluded.failures,
           cost_micros=ai_usage.cost_micros+excluded.cost_micros`,
        )
        .run(
          tenantId,
          month,
          delta.generations || 0,
          delta.candidates || 0,
          delta.failures || 0,
          delta.costMicros || 0,
        );
    },
  };

  const google = {
    async get(tenantId) {
      const row = await db
        .prepare("SELECT * FROM google_connections WHERE tenant_id=?")
        .get(tenantId);
      if (!row) return null;
      return {
        tenantId: row.tenant_id,
        googleEmail: row.google_email || "",
        accountName: row.account_name || "",
        locationName: row.location_name || "",
        locationTitle: row.location_title || "",
        scopes: row.scopes || "",
        refreshToken: row.refresh_token,
        accessToken: row.access_token || "",
        accessExpires: Number(row.access_expires) || 0,
        connectedAt: new Date(row.connected_at).toISOString(),
        lastSync: row.last_sync ? new Date(row.last_sync).toISOString() : null,
        lastError: row.last_error || "",
      };
    },
    async save(tenantId, connection) {
      await db
        .prepare(
          `INSERT INTO google_connections
         (tenant_id,google_email,account_name,location_name,location_title,scopes,refresh_token,access_token,access_expires,connected_at,last_sync,last_error)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(tenant_id) DO UPDATE SET
           google_email=excluded.google_email,
           account_name=excluded.account_name,
           location_name=excluded.location_name,
           location_title=excluded.location_title,
           scopes=excluded.scopes,
           refresh_token=excluded.refresh_token,
           access_token=excluded.access_token,
           access_expires=excluded.access_expires,
           connected_at=excluded.connected_at,
           last_sync=excluded.last_sync,
           last_error=excluded.last_error`,
        )
        .run(
          tenantId,
          connection.googleEmail || null,
          connection.accountName || null,
          connection.locationName || null,
          connection.locationTitle || null,
          connection.scopes || "",
          connection.refreshToken,
          connection.accessToken || null,
          Number(connection.accessExpires) || 0,
          Date.now(),
          connection.lastSync ? Date.parse(connection.lastSync) : null,
          connection.lastError || null,
        );
      return await google.get(tenantId);
    },
    async update(tenantId, patch) {
      const current = await google.get(tenantId);
      if (!current) return null;
      return await google.save(tenantId, { ...current, ...patch });
    },
    async remove(tenantId) {
      return (
        (
          await db
            .prepare("DELETE FROM google_connections WHERE tenant_id=?")
            .run(tenantId)
        ).changes === 1
      );
    },
  };

  return {
    db,
    rawDb: driver.rawDb,
    dialect: driver.dialect,
    filename: driver.filename,
    transaction,
    tenant,
    publicTenant: async (id) => {
      const row = await db
        .prepare("SELECT document FROM public_profiles WHERE tenant_id=?")
        .get(id);
      return row ? JSON.parse(row.document) : null;
    },
    save,
    event,
    cleanup,
    ready: driver.ready,
    reviews,
    candidates,
    aiUsage,
    google,
    close: driver.close,
  };
}
module.exports = { openStorage, createStorage };
