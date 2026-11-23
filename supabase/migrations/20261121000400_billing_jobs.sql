SET search_path = reviewkare_runtime, pg_catalog;
CREATE TABLE IF NOT EXISTS billing_receipt_counters (
  month TEXT PRIMARY KEY,
  value BIGINT NOT NULL CHECK (value > 0)
);
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  processed_at BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  tenant_id TEXT REFERENCES tenants(id) ON DELETE CASCADE,
  payload TEXT NOT NULL,
  run_at BIGINT NOT NULL,
  created_at BIGINT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  lease TEXT,
  locked_until BIGINT NOT NULL DEFAULT 0,
  finished_at BIGINT,
  failed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS jobs_due ON jobs(run_at,locked_until) WHERE finished_at IS NULL;
ALTER TABLE orders ADD COLUMN refund_amount BIGINT NOT NULL DEFAULT 0;

DO $body$
DECLARE name text;
BEGIN
  FOREACH name IN ARRAY ARRAY['billing_receipt_counters','webhook_events','jobs'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', name);
    EXECUTE format('REVOKE ALL ON TABLE %I FROM PUBLIC, anon, authenticated, service_role', name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO reviewkare_app', name);
    EXECUTE format('CREATE POLICY backend_access ON %I TO reviewkare_app USING (true) WITH CHECK (true)', name);
  END LOOP;
END;
$body$;
RESET search_path;