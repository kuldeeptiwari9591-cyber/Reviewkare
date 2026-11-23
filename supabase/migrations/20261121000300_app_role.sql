-- Grant access to an explicit backend-only group role. The deployment login
-- inherits this role and must not be a table owner, superuser, or BYPASSRLS role.
CREATE ROLE reviewkare_app NOLOGIN NOBYPASSRLS;
GRANT USAGE ON SCHEMA reviewkare_runtime TO reviewkare_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA reviewkare_runtime TO reviewkare_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA reviewkare_runtime TO reviewkare_app;

DO $body$
DECLARE relation record;
BEGIN
  FOR relation IN SELECT tablename FROM pg_tables WHERE schemaname = 'reviewkare_runtime'
  LOOP
    EXECUTE format('CREATE POLICY backend_access ON reviewkare_runtime.%I TO reviewkare_app USING (true) WITH CHECK (true)', relation.tablename);
  END LOOP;
END;
$body$;
