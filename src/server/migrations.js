// @ts-check
"use strict";
const crypto = require("node:crypto");

// Each migration is applied once and recorded with a checksum. Editing an
// already-applied migration is a startup error: add a new numbered migration
// instead so production databases stay verifiable.
const MIGRATIONS = [
  {
    version: 1,
    name: "baseline",
    up(db) {
      db.exec(`CREATE TABLE IF NOT EXISTS tenants(id TEXT PRIMARY KEY, document TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS users(email TEXT PRIMARY KEY, tenant_id TEXT NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE, hash TEXT NOT NULL, salt TEXT NOT NULL, verified INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY, email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS session_expiry ON sessions(expires);
CREATE TABLE IF NOT EXISTS capabilities(hash TEXT PRIMARY KEY, kind TEXT NOT NULL, email TEXT, tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE, review_id TEXT, draft_hash TEXT, expires INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, plan_id TEXT NOT NULL, cycle TEXT NOT NULL, amount INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'created', expires INTEGER NOT NULL, payment_id TEXT UNIQUE);
CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY, kind TEXT NOT NULL, tenant_id TEXT, document TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, tenant_id TEXT, action TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS readiness(id INTEGER PRIMARY KEY CHECK(id=1), checked_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS public_profiles(tenant_id TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE, document TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS qr_codes(code TEXT PRIMARY KEY, tenant_id TEXT NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE, scans INTEGER NOT NULL DEFAULT 0, drafts INTEGER NOT NULL DEFAULT 0, usage_month TEXT NOT NULL DEFAULT '', monthly_drafts INTEGER NOT NULL DEFAULT 0);
CREATE TRIGGER IF NOT EXISTS tenant_public_insert AFTER INSERT ON tenants BEGIN
  INSERT INTO public_profiles VALUES(NEW.id,json_object('id',NEW.id,'location',json_extract(NEW.document,'$.location'),'plan',json_extract(NEW.document,'$.plan'),'qr',json_extract(NEW.document,'$.qr')));
  INSERT INTO qr_codes(code,tenant_id) VALUES(json_extract(NEW.document,'$.qr.code'),NEW.id);
END;
CREATE TRIGGER IF NOT EXISTS tenant_public_update AFTER UPDATE ON tenants BEGIN
  UPDATE public_profiles SET document=json_object('id',NEW.id,'location',json_extract(NEW.document,'$.location'),'plan',json_extract(NEW.document,'$.plan'),'qr',json_extract(NEW.document,'$.qr')) WHERE tenant_id=NEW.id;
END;
INSERT OR IGNORE INTO public_profiles SELECT id,json_object('id',id,'location',json_extract(document,'$.location'),'plan',json_extract(document,'$.plan'),'qr',json_extract(document,'$.qr')) FROM tenants;
INSERT OR IGNORE INTO qr_codes(code,tenant_id,scans,drafts) SELECT json_extract(document,'$.qr.code'),id,coalesce(json_extract(document,'$.qr.scans'),0),coalesce(json_extract(document,'$.qr.drafts'),0) FROM tenants;`);
    },
  },
  {
    version: 2,
    name: "normalize-reviews",
    up(db) {
      db.exec(`CREATE TABLE IF NOT EXISTS reviews (
  id TEXT NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  location_id TEXT,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  body TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'draft',
  draft_text TEXT,
  final_text TEXT,
  model TEXT,
  validator_passed INTEGER NOT NULL DEFAULT 0,
  is_auto_posted INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (tenant_id, id)
);
CREATE INDEX IF NOT EXISTS reviews_tenant_created ON reviews(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_tenant_status ON reviews(tenant_id, status, created_at DESC);
CREATE TABLE IF NOT EXISTS reviews_legacy_backup (
  tenant_id TEXT NOT NULL,
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);`);

      const tenants = db.prepare("SELECT id, document FROM tenants").all();
      const insert = db.prepare(`INSERT OR IGNORE INTO reviews
        (id,tenant_id,location_id,reviewer_name,rating,body,source,status,draft_text,final_text,model,validator_passed,is_auto_posted,created_at,updated_at)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
      const backup = db.prepare(
        "INSERT INTO reviews_legacy_backup(tenant_id,payload,created_at) VALUES(?,?,?)",
      );
      const strip = db.prepare(
        "UPDATE tenants SET document=json_remove(document,'$.reviews'),version=version+1 WHERE id=?",
      );
      for (const tenant of tenants) {
        const document = JSON.parse(tenant.document);
        const legacy = Array.isArray(document.reviews) ? document.reviews : [];
        if (!legacy.length) continue;
        backup.run(tenant.id, JSON.stringify(legacy), Date.now());
        for (const review of legacy) {
          const rating = Number.isInteger(Number(review.rating))
            ? Math.min(5, Math.max(1, Number(review.rating)))
            : 1;
          const created = Date.parse(review.createdAt || "") || Date.now();
          insert.run(
            String(review.id || crypto.randomUUID()),
            tenant.id,
            review.locationId || document.location?.id || tenant.id,
            String(review.reviewerName || "Anonymous").slice(0, 100),
            rating,
            String(review.text || "").slice(0, 4000),
            String(review.source || "manual").slice(0, 40),
            String(review.reply?.status || "draft").slice(0, 40),
            review.reply?.draftText || null,
            review.reply?.finalText || null,
            review.reply?.model || null,
            review.reply?.validatorPassed ? 1 : 0,
            review.reply?.isAutoPosted ? 1 : 0,
            created,
            created,
          );
        }
        strip.run(tenant.id);
      }
    },
  },
  {
    version: 3,
    name: "ai-review-candidates",
    up(db) {
      db.exec(`CREATE TABLE IF NOT EXISTS review_candidates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  model TEXT NOT NULL,
  style TEXT NOT NULL,
  draft_text TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  batch TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  cost_micros INTEGER NOT NULL DEFAULT 0,
  selected_at INTEGER,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (tenant_id, review_id) REFERENCES reviews(tenant_id, id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS review_candidates_review ON review_candidates(tenant_id, review_id, created_at DESC);
CREATE INDEX IF NOT EXISTS review_candidates_hash ON review_candidates(tenant_id, review_id, input_hash, created_at DESC);
CREATE TABLE IF NOT EXISTS ai_usage (
  tenant_id TEXT NOT NULL,
  month TEXT NOT NULL,
  generations INTEGER NOT NULL DEFAULT 0,
  candidates INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0,
  cost_micros INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, month)
);`);
    },
  },
  {
    version: 4,
    name: "google-business-profile",
    up(db) {
      db.exec(`CREATE TABLE IF NOT EXISTS google_connections (
  tenant_id TEXT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  google_email TEXT,
  account_name TEXT,
  location_name TEXT,
  location_title TEXT,
  scopes TEXT NOT NULL DEFAULT '',
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  access_expires INTEGER NOT NULL DEFAULT 0,
  connected_at INTEGER NOT NULL,
  last_sync INTEGER,
  last_error TEXT
);
ALTER TABLE reviews ADD COLUMN google_review_id TEXT;
ALTER TABLE reviews ADD COLUMN google_reply_state TEXT;
ALTER TABLE reviews ADD COLUMN published_at INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_google_id ON reviews(tenant_id, google_review_id) WHERE google_review_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS reviews_source ON reviews(tenant_id, source, created_at DESC);
-- The customer page reads its attribute chips from the public profile. The
-- baseline triggers did not copy the guest block, so replace them and refill
-- every existing row.
DROP TRIGGER IF EXISTS tenant_public_insert;
DROP TRIGGER IF EXISTS tenant_public_update;
CREATE TRIGGER tenant_public_insert AFTER INSERT ON tenants BEGIN
  INSERT INTO public_profiles VALUES(NEW.id,json_object('id',NEW.id,'location',json_extract(NEW.document,'$.location'),'plan',json_extract(NEW.document,'$.plan'),'qr',json_extract(NEW.document,'$.qr'),'guest',json_extract(NEW.document,'$.guest')));
  INSERT INTO qr_codes(code,tenant_id) VALUES(json_extract(NEW.document,'$.qr.code'),NEW.id);
END;
CREATE TRIGGER tenant_public_update AFTER UPDATE ON tenants BEGIN
  UPDATE public_profiles SET document=json_object('id',NEW.id,'location',json_extract(NEW.document,'$.location'),'plan',json_extract(NEW.document,'$.plan'),'qr',json_extract(NEW.document,'$.qr'),'guest',json_extract(NEW.document,'$.guest')) WHERE tenant_id=NEW.id;
END;
UPDATE public_profiles AS p SET document=json_object('id',p.tenant_id,'location',json_extract(t.document,'$.location'),'plan',json_extract(t.document,'$.plan'),'qr',json_extract(t.document,'$.qr'),'guest',json_extract(t.document,'$.guest')) FROM tenants AS t WHERE t.id=p.tenant_id;`);
    },
  },
];

function checksum(migration) {
  return crypto
    .createHash("sha256")
    .update(`${migration.version}:${migration.name}:${migration.up.toString()}`)
    .digest("hex");
}

function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    checksum TEXT NOT NULL,
    applied_at INTEGER NOT NULL
  )`);
  const applied = new Map(
    db
      .prepare("SELECT version, checksum FROM schema_migrations")
      .all()
      .map((row) => [row.version, row.checksum]),
  );
  for (const migration of MIGRATIONS) {
    const sum = checksum(migration);
    if (applied.has(migration.version)) {
      if (applied.get(migration.version) !== sum)
        throw new Error(
          `Migration ${migration.version} (${migration.name}) was modified after being applied.`,
        );
      continue;
    }
    db.exec("BEGIN IMMEDIATE");
    try {
      migration.up(db);
      db.prepare(
        "INSERT INTO schema_migrations(version,name,checksum,applied_at) VALUES(?,?,?,?)",
      ).run(migration.version, migration.name, sum, Date.now());
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
}

module.exports = { MIGRATIONS, migrate };
