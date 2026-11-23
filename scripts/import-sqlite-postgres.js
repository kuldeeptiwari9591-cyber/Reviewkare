"use strict";
const { DatabaseSync } = require("node:sqlite");
const { createPool } = require("../src/server/postgres");

// Tables are copied in foreign-key order. Existing sessions, approval links,
// password hashes, cached access tokens, and legacy backup tables are excluded.
const tables = [
  "tenants", "qr_codes", "reviews", "review_candidates", "ai_usage",
  "google_connections", "orders", "requests", "audit", "billing_receipt_counters", "milestones",
];

async function importSqlite(source, target, apply = false) {
  const owners = source.prepare("SELECT email,tenant_id FROM users ORDER BY email").all();
  const tenants = source.prepare("SELECT id FROM tenants").all();
  const mappedTenants = new Set(owners.map(owner => owner.tenant_id));
  if (tenants.some(tenant => !mappedTenants.has(tenant.id)))
    throw new Error("Every source workspace must have an owner before import.");

  await target.query("BEGIN");
  try {
    await target.query("SELECT pg_advisory_xact_lock(782044796)");
    const { rows: [state] } = await target.query(
      "SELECT EXISTS (SELECT 1 FROM reviewkare_runtime.tenants) AS occupied",
    );
    if (state.occupied) throw new Error("Destination must have no workspaces.");
    const mappings = [];
    for (const owner of owners) {
      const { rows } = await target.query(
        "SELECT id FROM auth.users WHERE lower(email)=lower($1) AND email_confirmed_at IS NOT NULL",
        [owner.email],
      );
      if (rows.length !== 1)
        throw new Error("Each source owner needs exactly one verified Supabase account with the same email.");
      mappings.push({ ...owner, id: rows[0].id });
    }
    const counts = {};
    for (const table of tables) {
      if (["billing_receipt_counters", "milestones"].includes(table) && !source.prepare("SELECT 1 FROM sqlite_master WHERE name=?").get(table)) continue;
      counts[table] = source.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
      if (!apply) continue;
      // Use target-defined identifiers and only copy matching source columns.
      const { rows: fields } = await target.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema='reviewkare_runtime' AND table_name=$1 ORDER BY ordinal_position",
        [table],
      );
      const sourceFields = new Set(source.prepare(`PRAGMA table_info(${table})`).all().map(field => field.name));
      const columns = fields.map(field => field.column_name).filter(column => sourceFields.has(column));
      if (!columns.length || columns.some(column => !/^[a-z_]+$/.test(column)))
        throw new Error("Unexpected import columns.");
      const updateQr = table === "qr_codes" ? " ON CONFLICT (code) DO UPDATE SET scans=excluded.scans,drafts=excluded.drafts,usage_month=excluded.usage_month,monthly_drafts=excluded.monthly_drafts WHERE qr_codes.tenant_id=excluded.tenant_id" : "";
      const conflict = table === "milestones" ? " ON CONFLICT (tenant_id,event) DO UPDATE SET reached_at=excluded.reached_at,seen=excluded.seen" : updateQr;
      const sql = `INSERT INTO reviewkare_runtime.${table}(${columns.join(",")}) VALUES(${columns.map((_, i) => "$" + (i + 1)).join(",")})${conflict}`;
      for (const record of source.prepare(`SELECT ${columns.join(",")} FROM ${table}`).iterate()) {
        const result = await target.query(sql, columns.map(column => (
          table === "google_connections" && column === "access_token" ? null :
          table === "google_connections" && column === "access_expires" ? 0 :
          record[column]
        )));
        if (result.rowCount !== 1 && table !== "milestones") throw new Error("Import write did not match the source record.");
      }
    }
    if (apply) {
      for (const owner of mappings) await target.query(
        "INSERT INTO reviewkare_runtime.users(email,tenant_id,auth_user_id,verified) VALUES($1,$2,$3,1)",
        [owner.email, owner.tenant_id, owner.id],
      );
      await target.query(`SELECT setval(
        pg_get_serial_sequence('reviewkare_runtime.audit','id'),
        GREATEST(COALESCE(max(id),0),1), count(*)>0
      ) FROM reviewkare_runtime.audit`);
    }
    await target.query(apply ? "COMMIT" : "ROLLBACK");
    return { mode: apply ? "applied" : "dry-run", owners: owners.length, counts };
  } catch (error) {
    await target.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  const filename = process.env.SQLITE_IMPORT_FILE;
  const connection = process.env.MIGRATION_DATABASE_URL;
  if (!filename || !connection) throw new Error("Set SQLITE_IMPORT_FILE and MIGRATION_DATABASE_URL.");
  const source = new DatabaseSync(filename, { readOnly: true });
  try {
    const pool = createPool(connection, { max: 1, queryTimeout: 60000 });
    try {
      const target = await pool.connect();
      try { console.log(JSON.stringify(await importSqlite(source, target, process.argv.includes("--apply")))); }
      finally { target.release(); }
    } finally { await pool.end(); }
  } finally { source.close(); }
}

if (require.main === module) main().catch(error => {
  const safe = /^(Set SQLITE_IMPORT_FILE|Each source owner|Every source workspace|Destination must|Unexpected import|Import write)/.test(error.message);
  console.error(safe ? error.message : `SQLite import failed (${error.code || "connection or data error"}).`);
  process.exitCode = 1;
});
module.exports = { importSqlite };
