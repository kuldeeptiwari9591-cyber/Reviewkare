// @ts-check
"use strict";
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { migrate } = require("./migrations");

function openStorage(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = path.join(directory, "reviewkare.sqlite");
  const db = new Database(filename);
  try {
    fs.chmodSync(filename, 0o600);
  } catch (error) {
    if (process.platform !== "win32") throw error;
  }
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = FULL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);

  function transaction(fn) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  function tenant(id) {
    const row = db
      .prepare("SELECT document, version FROM tenants WHERE id=?")
      .get(id);
    if (!row) return null;
    const value = JSON.parse(row.document);
    const counts = db
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
  function save(value) {
    // Reviews live in their own table. Never re-serialize them into the
    // tenant document, even if a caller attached a transient copy.
    const { reviews, ...document } = value;
    const result = db
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
  function event(tenantId, action) {
    db.prepare("INSERT INTO audit(tenant_id,action,created) VALUES(?,?,?)").run(
      tenantId || null,
      action,
      Date.now(),
    );
  }
  function cleanup() {
    const now = Date.now();
    transaction(() => {
      db.prepare("DELETE FROM sessions WHERE expires < ?").run(now);
      db.prepare("DELETE FROM capabilities WHERE expires < ?").run(
        now - 86400000,
      );
      db.prepare(
        "DELETE FROM orders WHERE status='created' AND expires < ?",
      ).run(now - 30 * 86400000);
      db.prepare("DELETE FROM requests WHERE created < ?").run(
        now - 90 * 86400000,
      );
      db.prepare("DELETE FROM audit WHERE created < ?").run(
        now - 365 * 86400000,
      );
      db.prepare(
        "DELETE FROM review_candidates WHERE selected_at IS NULL AND created_at < ?",
      ).run(now - 180 * 86400000);
      const usageCutoff = new Date(now);
      usageCutoff.setUTCMonth(usageCutoff.getUTCMonth() - 24);
      db.prepare("DELETE FROM ai_usage WHERE month < ?").run(
        usageCutoff.toISOString().slice(0, 7),
      );
    });
  }
  cleanup();

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
    list(tenantId, { page = 1, pageSize = 20, status = null } = {}) {
      const size = Math.min(100, Math.max(1, pageSize));
      const offset = (Math.max(1, page) - 1) * size;
      const where = status ? "tenant_id=? AND status=?" : "tenant_id=?";
      const params = status ? [tenantId, status] : [tenantId];
      const rows = db
        .prepare(
          `SELECT * FROM reviews WHERE ${where} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
        )
        .all(...params, size, offset)
        .map(toReview);
      const total = db
        .prepare(`SELECT count(*) AS n FROM reviews WHERE ${where}`)
        .get(...params).n;
      return { rows, total, page: Math.max(1, page), pageSize: size };
    },
    all(tenantId) {
      return db
        .prepare(
          "SELECT * FROM reviews WHERE tenant_id=? ORDER BY created_at DESC, id DESC",
        )
        .all(tenantId)
        .map(toReview);
    },
    get(tenantId, id) {
      const row = db
        .prepare("SELECT * FROM reviews WHERE tenant_id=? AND id=?")
        .get(tenantId, id);
      return row ? toReview(row) : null;
    },
    create(tenantId, review) {
      const created = Date.parse(review.createdAt || "") || Date.now();
      db.prepare(`INSERT INTO reviews
        (id,tenant_id,location_id,reviewer_name,rating,body,source,status,draft_text,final_text,model,validator_passed,is_auto_posted,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
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
      return reviews.get(tenantId, review.id);
    },
    updateReply(tenantId, id, reply) {
      const result = db
        .prepare(`UPDATE reviews SET
          status=?,draft_text=?,final_text=?,model=?,validator_passed=?,is_auto_posted=?,updated_at=?
          WHERE tenant_id=? AND id=?`).run(
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
    upsertGoogle(tenantId, review) {
      const now = Date.now();
      const created = Date.parse(review.createdAt || "") || now;
      db.prepare(`INSERT INTO reviews
        (id,tenant_id,location_id,reviewer_name,rating,body,source,status,draft_text,final_text,model,validator_passed,is_auto_posted,created_at,updated_at,google_review_id,google_reply_state,published_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tenant_id, google_review_id) DO UPDATE SET
          reviewer_name=excluded.reviewer_name,
          rating=excluded.rating,
          body=excluded.body,
          updated_at=excluded.updated_at,
          google_reply_state=coalesce(reviews.google_reply_state, excluded.google_reply_state)`).run(
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
      return db
        .prepare(
          "SELECT * FROM reviews WHERE tenant_id=? AND google_review_id=?",
        )
        .get(tenantId, review.googleReviewId);
    },
    markPublished(tenantId, id, state) {
      return (
        db
          .prepare(
            "UPDATE reviews SET google_reply_state=?,published_at=?,updated_at=? WHERE tenant_id=? AND id=?",
          )
          .run(state, Date.now(), Date.now(), tenantId, id).changes === 1
      );
    },
    remove(tenantId, id) {
      return (
        db
          .prepare("DELETE FROM reviews WHERE tenant_id=? AND id=?")
          .run(tenantId, id).changes === 1
      );
    },
    count(tenantId, status = null) {
      const where = status ? "tenant_id=? AND status=?" : "tenant_id=?";
      const params = status ? [tenantId, status] : [tenantId];
      return db
        .prepare(`SELECT count(*) AS n FROM reviews WHERE ${where}`)
        .get(...params).n;
    },
    stats(tenantId) {
      const row = db
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
    list(tenantId, reviewId) {
      const latest = db
        .prepare(
          "SELECT batch FROM review_candidates WHERE tenant_id=? AND review_id=? ORDER BY created_at DESC LIMIT 1",
        )
        .get(tenantId, reviewId);
      if (!latest) return [];
      return db
        .prepare(
          "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND batch=? ORDER BY score DESC, created_at ASC",
        )
        .all(tenantId, reviewId, latest.batch)
        .map(toCandidate);
    },
    byHash(tenantId, reviewId, inputHash, since) {
      const latest = db
        .prepare(
          "SELECT batch, count(*) AS n FROM review_candidates WHERE tenant_id=? AND review_id=? AND input_hash=? AND created_at>=? GROUP BY batch ORDER BY max(created_at) DESC LIMIT 1",
        )
        .get(tenantId, reviewId, inputHash, since);
      if (!latest || latest.n < 3) return [];
      return db
        .prepare(
          "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND batch=? ORDER BY score DESC, created_at ASC",
        )
        .all(tenantId, reviewId, latest.batch)
        .map(toCandidate);
    },
    get(tenantId, reviewId, id) {
      const row = db
        .prepare(
          "SELECT * FROM review_candidates WHERE tenant_id=? AND review_id=? AND id=?",
        )
        .get(tenantId, reviewId, id);
      return row ? toCandidate(row) : null;
    },
    replace(tenantId, reviewId, inputHash, items) {
      const batch = crypto.randomUUID(),
        created = Date.now();
      transaction(() => {
        // Keep a previously selected draft for the audit trail; replace the
        // comparison set so the owner never sees stale models mixed in.
        db.prepare(
          "DELETE FROM review_candidates WHERE tenant_id=? AND review_id=? AND selected_at IS NULL",
        ).run(tenantId, reviewId);
        const insert = db.prepare(`INSERT INTO review_candidates
          (id,tenant_id,review_id,model,style,draft_text,prompt_version,input_hash,batch,score,latency_ms,prompt_tokens,completion_tokens,cost_micros,created_at)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
        for (const item of items) {
          insert.run(
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
      return candidates.list(tenantId, reviewId);
    },
    select(tenantId, reviewId, id) {
      const now = Date.now();
      return transaction(() => {
        const found = db
          .prepare(
            "SELECT id FROM review_candidates WHERE tenant_id=? AND review_id=? AND id=?",
          )
          .get(tenantId, reviewId, id);
        if (!found) return null;
        db.prepare(
          "UPDATE review_candidates SET selected_at=NULL WHERE tenant_id=? AND review_id=?",
        ).run(tenantId, reviewId);
        db.prepare(
          "UPDATE review_candidates SET selected_at=? WHERE tenant_id=? AND review_id=? AND id=?",
        ).run(now, tenantId, reviewId, id);
        return candidates.get(tenantId, reviewId, id);
      });
    },
  };

  const aiUsage = {
    month(tenantId, month) {
      const row = db
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
    total(month) {
      const row = db
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
    add(tenantId, month, delta) {
      db.prepare(
        `INSERT INTO ai_usage(tenant_id,month,generations,candidates,failures,cost_micros)
         VALUES(?,?,?,?,?,?)
         ON CONFLICT(tenant_id,month) DO UPDATE SET
           generations=generations+excluded.generations,
           candidates=candidates+excluded.candidates,
           failures=failures+excluded.failures,
           cost_micros=cost_micros+excluded.cost_micros`,
      ).run(
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
    get(tenantId) {
      const row = db
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
    save(tenantId, connection) {
      db.prepare(
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
      ).run(
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
      return google.get(tenantId);
    },
    update(tenantId, patch) {
      const current = google.get(tenantId);
      if (!current) return null;
      return google.save(tenantId, { ...current, ...patch });
    },
    remove(tenantId) {
      return (
        db
          .prepare("DELETE FROM google_connections WHERE tenant_id=?")
          .run(tenantId).changes === 1
      );
    },
  };

  function ready() {
    const stats = fs.statfsSync(directory);
    if (stats.bavail * stats.bsize < 5 * 1024 * 1024)
      throw new Error("Insufficient disk capacity");
    // Exercise the connection's write path on a TEMP table: this detects a
    // read-only or broken connection without writing to the application data.
    db.exec("CREATE TEMP TABLE IF NOT EXISTS _readiness(x INTEGER)");
    db.prepare("INSERT INTO _readiness VALUES(1)").run();
    db.exec("DELETE FROM _readiness");
  }
  return {
    db,
    filename,
    transaction,
    tenant,
    publicTenant: (id) => {
      const row = db
        .prepare("SELECT document FROM public_profiles WHERE tenant_id=?")
        .get(id);
      return row ? JSON.parse(row.document) : null;
    },
    save,
    event,
    cleanup,
    ready,
    reviews,
    candidates,
    aiUsage,
    google,
    close: () => db.close(),
  };
}
module.exports = { openStorage };
