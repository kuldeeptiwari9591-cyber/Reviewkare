"use strict";
const { AsyncLocalStorage } = require("node:async_hooks");
const { Pool } = require("pg");
const { createStorage } = require("./storage");

const tables =
  "tenants|users|sessions|capabilities|orders|requests|audit|public_profiles|qr_codes|reviews|review_candidates|ai_usage|google_connections|rate_limits|billing_receipt_counters|webhook_events|jobs|milestones|site_metrics|platform_sessions|platform_audit";
const tableReference = new RegExp(
  `\\b(FROM|JOIN|UPDATE|INTO)\\s+(${tables})\\b`,
  "gi",
);

// All statements are internal SQL literals. User values are always parameters.
function postgresSql(sql) {
  let index = 0;
  return sql
    .replace(tableReference, "$1 reviewkare_runtime.$2")
    .replace(
      /json_extract\(document,'\$\.paymentId'\)/g,
      "(document::jsonb->>'paymentId')",
    )
    .replaceAll("?", () => "$" + ++index);
}

function postgresStorage(pool) {
  const context = new AsyncLocalStorage();
  function query(sql, values) {
    const executor = context.getStore()?.client || pool;
    return executor.query(postgresSql(sql), values);
  }

  async function transaction(fn) {
    if (context.getStore()?.client) return fn();
    const client = await pool.connect();
    const scope = { client };
    let releaseError;
    try {
      await client.query("BEGIN");
      // Serialize multi-statement writes that used a SQLite writer lock.
      await client.query("SELECT pg_advisory_xact_lock(782044796)");
      const result = await context.run(scope, fn);
      scope.client = null;
      await client.query("COMMIT");
      return result;
    } catch (error) {
      scope.client = null;
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        releaseError = rollbackError;
      }
      throw error;
    } finally {
      client.release(releaseError);
    }
  }

  function numericRows(result) {
    const numbers = (result.fields || [])
      .filter((field) => field.dataTypeID === 20)
      .map((field) => field.name);
    for (const row of result.rows) {
      for (const name of numbers) {
        if (row[name] === null) continue;
        const value = Number(row[name]);
        if (!Number.isSafeInteger(value))
          throw new Error("Postgres integer exceeds the supported range.");
        row[name] = value;
      }
    }
    return result.rows;
  }

  const db = {
    prepare(sql) {
      return {
        get: async (...values) => numericRows(await query(sql, values))[0],
        all: async (...values) => numericRows(await query(sql, values)),
        run: async (...values) => ({
          changes: (await query(sql, values)).rowCount,
        }),
      };
    },
  };
  return createStorage({
    db,
    transaction,
    dialect: "postgres",
    ready: async () => {
      const {
        rows: [row],
      } = await pool.query(`
        SELECT NOT current_setting('transaction_read_only')::boolean
           AND has_table_privilege('reviewkare_runtime.tenants', 'INSERT')
           AND has_table_privilege('reviewkare_runtime.rate_limits', 'UPDATE')
           AND has_table_privilege('reviewkare_runtime.jobs', 'INSERT')
           AND has_column_privilege('reviewkare_runtime.users', 'auth_user_id', 'SELECT') AS writable
      `);
      if (!row?.writable)
        throw new Error("Postgres is read-only or missing application grants.");
    },
    close: () => pool.end(),
  });
}

function createPool(connectionString, { max = 5, queryTimeout = 12000 } = {}) {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol))
    throw new Error("DATABASE_URL must be a PostgreSQL URL.");
  for (const key of ["sslmode", "sslcert", "sslkey", "sslrootcert", "ssl"])
    url.searchParams.delete(key);
  const pool = new Pool({
    connectionString: url.href,
    ssl: {
      rejectUnauthorized: true,
      ...(process.env.DATABASE_CA_CERT
        ? { ca: process.env.DATABASE_CA_CERT }
        : {}),
    },
    max,
    connectionTimeoutMillis: 8000,
    query_timeout: queryTimeout,
  });
  pool.on("error", () =>
    console.error(JSON.stringify({ event: "postgres_idle_connection_error" })),
  );
  return pool;
}

async function openPostgres(connectionString) {
  const pool = createPool(connectionString);
  const storage = postgresStorage(pool);
  try {
    await storage.ready();
    return storage;
  } catch {
    await storage.close();
    throw new Error(
      "Postgres startup failed. Check the connection, TLS, migrations and grants.",
    );
  }
}

module.exports = { createPool, openPostgres, postgresStorage };
