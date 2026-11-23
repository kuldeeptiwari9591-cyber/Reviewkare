"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { createPool } = require("../src/server/postgres");

async function migratePostgres(pool, {
  directory = path.join(__dirname, "../supabase/migrations"),
  report = console.log,
} = {}) {
  const files = (await fs.readdir(directory)).filter(name => /^\d{14}_[a-z_]+\.sql$/.test(name)).sort();
  for (const name of files) {
    const version = name.split("_", 1)[0];
    const sql = await fs.readFile(path.join(directory, name), "utf8");
    const checksum = crypto.createHash("sha256").update(sql.replace(/\r\n/g, "\n")).digest("hex");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(782044797)");
      await client.query(`
        CREATE SCHEMA IF NOT EXISTS reviewkare_migrations;
        REVOKE ALL ON SCHEMA reviewkare_migrations FROM PUBLIC, anon, authenticated, service_role;
        CREATE TABLE IF NOT EXISTS reviewkare_migrations.applied (
          version text PRIMARY KEY, name text NOT NULL, checksum text NOT NULL,
          applied_at timestamptz NOT NULL DEFAULT now()
        );
        ALTER TABLE reviewkare_migrations.applied ENABLE ROW LEVEL SECURITY;
        REVOKE ALL ON reviewkare_migrations.applied FROM PUBLIC, anon, authenticated, service_role;
      `);
      const { rows: [applied] } = await client.query(
        "SELECT checksum FROM reviewkare_migrations.applied WHERE version=$1", [version],
      );
      if (applied && applied.checksum !== checksum)
        throw new Error("Migration checksum mismatch: " + name);
      if (!applied) {
        await client.query(sql);
        await client.query("INSERT INTO reviewkare_migrations.applied(version,name,checksum) VALUES($1,$2,$3)", [version,name,checksum]);
      }
      await client.query("COMMIT");
      report((applied ? "Verified " : "Applied ") + name);
    } catch (error) {
      await client.query("ROLLBACK");
      const details = error.message === "Migration checksum mismatch: " + name
        ? error.message
        : `Migration failed: ${name} (${error.code || "database error"}).`;
      throw new Error(details);
    } finally {
      client.release();
    }
  }
}

async function main() {
  if (!process.env.MIGRATION_DATABASE_URL)
    throw new Error("Set MIGRATION_DATABASE_URL to the operator-only migration connection.");
  const pool = createPool(process.env.MIGRATION_DATABASE_URL, { max: 1, queryTimeout: 60000 });
  try {
    await migratePostgres(pool);
  } finally {
    await pool.end();
  }
}

if (require.main === module) main().catch(error => {
  const safe = /^(Set MIGRATION_DATABASE_URL|Migration (?:failed|checksum mismatch))/.test(error.message);
  console.error(safe ? error.message : "Could not open the Postgres migration connection. Check TLS and database credentials.");
  process.exitCode = 1;
});

module.exports = { migratePostgres };
