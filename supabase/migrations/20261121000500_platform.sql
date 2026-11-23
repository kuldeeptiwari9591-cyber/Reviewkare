SET search_path = reviewkare_runtime, pg_catalog;

CREATE TABLE milestones (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  reached_at TEXT NOT NULL DEFAULT (now()::text),
  seen INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id,event)
);
-- Backfill existing achievements without showing old activity as new notifications.
INSERT INTO milestones(tenant_id,event,seen)
SELECT id,'workspace_ready',1 FROM tenants WHERE document::jsonb->'location'->>'placeId' <> '';
INSERT INTO milestones(tenant_id,event,seen)
SELECT tenant_id,'first_scan',1 FROM qr_codes WHERE scans > 0;
INSERT INTO milestones(tenant_id,event,seen)
SELECT tenant_id,'google_connected',1 FROM google_connections;
INSERT INTO milestones(tenant_id,event,seen)
SELECT tenant_id, key, 1
FROM (SELECT tenant_id,count(*) AS reviews,count(published_at) FILTER (WHERE google_reply_state='posted') AS replies
      FROM reviews GROUP BY tenant_id) AS counts
CROSS JOIN (VALUES(1,'first_review',false),(25,'reviews_25',false),(100,'reviews_100',false),
                 (1,'first_reply',true),(10,'replies_10',true),(50,'replies_50',true),(100,'replies_100',true))
  AS limits(n,key,is_reply)
WHERE CASE WHEN is_reply THEN counts.replies ELSE counts.reviews END >= n;
CREATE TABLE site_metrics (
  day TEXT NOT NULL,
  page TEXT NOT NULL,
  metric TEXT NOT NULL,
  bucket TEXT NOT NULL,
  hits INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (day,page,metric,bucket)
);
CREATE TABLE platform_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires BIGINT NOT NULL,
  support_tenant TEXT,
  support_expires BIGINT
);
CREATE INDEX platform_sessions_expires ON platform_sessions(expires);
CREATE TABLE platform_audit (
  id TEXT PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  tenant_id TEXT,
  reason TEXT,
  created BIGINT NOT NULL
);
CREATE INDEX platform_audit_created ON platform_audit(created DESC);

CREATE FUNCTION reviewkare.is_platform_admin(subject UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog AS $body$
  SELECT EXISTS (
    SELECT 1 FROM reviewkare.profiles WHERE id=subject AND is_platform_admin
  );
$body$;
REVOKE ALL ON FUNCTION reviewkare.is_platform_admin(UUID) FROM PUBLIC, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA reviewkare TO reviewkare_app;
GRANT EXECUTE ON FUNCTION reviewkare.is_platform_admin(UUID) TO reviewkare_app;

CREATE FUNCTION record_review_milestones() RETURNS trigger LANGUAGE plpgsql
SET search_path = reviewkare_runtime, pg_catalog AS $body$
DECLARE total int;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT count(*) INTO total FROM reviews WHERE tenant_id=NEW.tenant_id;
    INSERT INTO milestones(tenant_id,event)
    SELECT NEW.tenant_id, key FROM (VALUES(1,'first_review'),(25,'reviews_25'),(100,'reviews_100')) AS limits(n,key)
    WHERE total >= n ON CONFLICT DO NOTHING;
  ELSIF OLD.published_at IS NULL AND NEW.published_at IS NOT NULL AND NEW.google_reply_state='posted' THEN
    SELECT count(*) INTO total FROM reviews WHERE tenant_id=NEW.tenant_id AND published_at IS NOT NULL AND google_reply_state='posted';
    INSERT INTO milestones(tenant_id,event)
    SELECT NEW.tenant_id, key FROM (VALUES(1,'first_reply'),(10,'replies_10'),(50,'replies_50'),(100,'replies_100')) AS limits(n,key)
    WHERE total >= n ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$body$;
REVOKE ALL ON FUNCTION record_review_milestones() FROM PUBLIC, anon, authenticated, service_role;
CREATE TRIGGER milestone_review_insert AFTER INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION record_review_milestones();
CREATE TRIGGER milestone_reply_publish AFTER UPDATE OF published_at ON reviews
FOR EACH ROW EXECUTE FUNCTION record_review_milestones();

DO $body$
DECLARE name text;
BEGIN
  FOREACH name IN ARRAY ARRAY['milestones','site_metrics','platform_sessions','platform_audit'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', name);
    EXECUTE format('REVOKE ALL ON TABLE %I FROM PUBLIC, anon, authenticated, service_role', name);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO reviewkare_app', name);
    EXECUTE format('CREATE POLICY backend_access ON %I TO reviewkare_app USING (true) WITH CHECK (true)', name);
  END LOOP;
END;
$body$;
REVOKE UPDATE, DELETE ON platform_audit FROM reviewkare_app;
RESET search_path;
