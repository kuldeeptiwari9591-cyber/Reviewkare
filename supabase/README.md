# ReviewKare on Supabase and Render Free

The Node app uses Postgres and Supabase Auth when DATABASE_URL is set. Without it, local development uses SQLite. The active Postgres schema is reviewkare_runtime and preserves the existing workspace IDs and data model. The normalized reviewkare schema is reserved for later lifecycle and billing work. Keep both schemas out of the Supabase Data API.

## Staging setup

1. Create a staging Supabase project in the intended database region. Record the actual Supabase region and Render region independently. The Render Blueprint sets the web service to Singapore.
2. Set MIGRATION_DATABASE_URL to the direct or session pooler URL from Supabase, using the project database owner. Run npm run migrate:postgres under Node 24.22.1. Use the repository migration runner consistently so its recorded checksums match the applied migrations. Keep the migration connection string outside Render.
3. As the database owner, create a dedicated login and grant it the backend role. Set its password interactively with psql using \password reviewkare_web. Use the dashboard's transaction pooler hostname and port 6543 with username reviewkare_web.<project-ref> in the app connection string. URL-encode the password. The app uses verified TLS and at most five connections. [Supabase connection guide](https://supabase.com/docs/guides/database/connecting-to-postgres)

```sql
CREATE ROLE reviewkare_web LOGIN INHERIT NOBYPASSRLS;
GRANT reviewkare_app TO reviewkare_web;
```

4. Set Supabase Auth Site URL to the project’s app origin. Allow that site's exact /auth/callback URL under Auth Redirect URLs. Use https://reviewkare.in/auth/callback for production and the exact staging equivalent on the staging project. Enable email confirmation and set up Resend as custom SMTP. In the email confirmation and password recovery templates, respectively, use these application links. [Supabase email templates](https://supabase.com/docs/guides/auth/auth-email-templates)

```text
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery
```

5. To enable Google sign-in, configure the Supabase Google provider and register the Supabase callback URL shown in its dashboard with Google. This is separate from the Google Business Profile grant at /api/google/callback. Enable SUPABASE_GOOGLE_SIGN_IN after configuration. [Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-sign-in/auth-google)

## Render environment

Set DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY. Keep the database URL and service-role key server-side. The service-role key is used for account deletion. Set BASE_URL to the exact site origin, OPERATOR_NAME to the legal operator, SUPPORT_EMAIL to the operator's support or grievance email, HOSTING_REGION to the actual Render region, and DATABASE_REGION to the actual Supabase region. Remove DATA_DIR from the Render Free service. Start with node server.js and confirm /api/health reports storage postgres. For an existing service created manually, enter these settings in its Render dashboard. Use npm ci --include=dev && npm run build && npm run typecheck && npm test as the build command.

For client-IP limits, verify that the trusted Render ingress puts the visitor IP in the rightmost X-Forwarded-For position before setting TRUST_PROXY=true. [Render client IP guidance](https://render.com/articles/how-render-handles-ddos-attacks)

Run signup, email confirmation, Google sign-in, recovery, session revocation, exports, QR scans, and account deletion on staging. Google-only owners can set a password via recovery for operations that require password confirmation. Keep any future platform-admin routes behind a dedicated role and MFA enforcement. Review project availability, backups, and scheduling separately before launch.

## Existing SQLite data

Use a consistent SQLite backup and a migrated destination with no app workspaces. Provision each existing owner in Supabase with the same email and verify it before cutover. Ask owners to sign in to ReviewKare after import. Set SQLITE_IMPORT_FILE to the SQLite snapshot and use the migration connection to run npm run import:postgres for a dry run. Run npm run import:postgres -- --apply to copy the records. This preserves workspace IDs, QR codes and counters. Session cookies, SQLite password hashes, approval links, and cached Google access tokens are discarded. Keep the encryption key for existing refresh tokens available for an authorized migration or reconnect Google after cutover.

Run the import against a disposable destination first. Pause writes before taking the production snapshot and verify QR URLs, access for existing owners, review totals, and any billing records before resuming traffic. The local backup, request export, and reconciliation scripts still target SQLite. Use Postgres tooling and the hosted project's backup facilities for hosted data.

## Credential cutover

Rotate provider secrets through their dashboards. For a planned encryption-key rotation, set TOKEN_ENCRYPTION_KEY_ID and TOKEN_ENCRYPTION_KEY for new writes and use TOKEN_ENCRYPTION_PREVIOUS_KEY_ID and TOKEN_ENCRYPTION_PREVIOUS_KEY temporarily for reads. Reconnect or re-encrypt all old connections before removing the old key. Revoke any credentials exposed in Git history and reconnect with fresh credentials. A history rewrite requires separately agreed refs, a collaborator cutover, and explicit authorization to force-push.

## Billing and scheduled jobs

Apply migration 004 through the migration runner before starting this release.

1. Confirm the actual prices and tax treatment. Set BILLING_TERM_PRICES to one JSON object whose keys are basic (Starter), growth, and pro. Give each plan the four string keys "1", "3", "6", and "12" and use integer paise values. Set BILLING_RECEIPT_FOOTER to the approved receipt text and TAX_POLICY_CONFIRMED=true after confirming it. The receipt leaves the tax statement empty until you supply it.
2. Start in Razorpay Test Mode. Add the webhook URL https://reviewkare.in/api/webhooks/razorpay (use the staging origin for staging) and subscribe to payment.captured, payment.failed and refund.processed. Set RAZORPAY_WEBHOOK_SECRET to the endpoint's own secret. RAZORPAY_WEBHOOK_PREVIOUS_SECRET optionally accepts retries signed with the preceding secret during rotation. Supply RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for API lookups and checkout. [Razorpay webhook guidance](https://razorpay.com/blog/payment-gateway-webhooks-india/)
3. Supply RESEND_API_KEY and EMAIL_FROM for receipts and notices. Run npm run jobs:tick from a scheduled worker with the same production env, or call POST /api/internal/jobs/tick once per minute from an external scheduler. The HTTP route accepts Authorization: Bearer <JOBS_SECRET> and takes a random secret of at least 32 characters. Run one trigger per environment and alert on HTTP failures or a response with failed greater than zero. The worker reconciles recent orders daily and queues connected, active Google workspaces for sync approximately every 15–25 minutes, according to the plan. Retries reuse email idempotency keys within Resend's 24-hour window. [Resend idempotency keys](https://resend.com/changelog/idempotency-keys)
4. Enable BILLING_ENABLED=true only after staging checkout, renewal, receipt delivery and refund replay pass. Turn on LIFECYCLE_ENABLED for expiry enforcement and renewal reminders after verifying the job schedule. LIFECYCLE_DELETE_ENABLED separately schedules retention notices and deletion. The job requires records that the email provider accepted both advance notices. If either notice is missed, investigate the failed job and handle the affected workspace through the operator's retention process.
5. To process an approved refund in the hosted environment, run npm run refund:order -- <request-id> <paise> to preview. Add --apply to send the refund. If the response is interrupted, check Razorpay and retry with the same request ID and amount. The signed processed event or reconciliation updates the receipt. This workflow records refunds without modifying the workspace access period. [Razorpay refund idempotency](https://hdfcbank-collectnow-docs.razorpay.com/api/refunds/normal-refunds-idempotent/)

Existing 30- and 365-day orders retain their original terms. A purchased month starts on the UTC day and time of the current expiry, or the purchase time when the old access has expired. If the target month is shorter, the end date falls on its last day. The receipt sequence and notification schedule use India time.

## Platform administration and production gates

Apply migration 005 under the migration owner. Create a named, verified Supabase identity per operator and enroll a verified TOTP device through a trusted enrollment workflow. In the operator SQL console, insert the identity UUID into reviewkare.profiles with is_platform_admin=true. ReviewKare cannot assign this role through signup, its API, or its admin panel. Set ADMIN_ENABLED=true in staging and verify /admin requires both the provider's password and verified TOTP. Revoking the role invalidates further use of the separate admin session immediately. Support view is read-only and limited to the shorter of 30 minutes or the remaining admin session.

Use ANALYTICS_ENABLED=true to expose first-party consent controls on /privacy#analytics. A visitor who opts in contributes aggregate page and Core Web Vitals ratings. There are no unique analytics IDs. Review trends under /admin/analytics. Search Console and Bing field reports need their own verified accounts. [Core Web Vitals collection](https://github.com/GoogleChrome/web-vitals)

Set SENTRY_DSN for redacted server error alerts. The reporter sends fixed event categories and status codes, with no request body, URL, customer record, or exception message. Monitor /api/health externally and poll GET /api/internal/ops with the scheduler bearer secret for database size, failed jobs, payment failures, webhook failures, and lastWorkerTickAt. Check for a missing timestamp or one older than the scheduler interval plus an appropriate grace period. Set an alert threshold appropriate to the deployed database plan. Test each alert destination before launch. [Sentry envelope documentation](https://develop.sentry.dev/sdk/foundations/envelopes/)

For a restore drill, restore the latest Postgres backup to a separate staging project. Reapply or verify the role and migration grants, protect customers from outbound email or billing during the drill, and smoke-test owner access, account export, paid orders, and QR URLs. Record the restore timestamp, age of the restored snapshot, recovery duration, and anomalies. The disposable PostgreSQL backup test restores the owner mapping, workspace, QR, paid order, receipts, and queued email jobs. Hosted recovery timing requires a separate staged drill.

Before enabling Google Business Profile, review the approved Google API project, data flows, downstream recipients, authorization, revocation and backup retention. Production drops review content older than 30 days from the review date and excludes imported Google reviews from third-party AI drafting. Keep GOOGLE_POLICY_VERIFIED=false until the operator completes that review. [Business Profile API policies](https://developers.google.com/my-business/content/policies) · [Google user data policy](https://developers.google.com/terms/api-services-user-data-policy)

Confirm the legal entity, grievance contact, subprocessor and retention records, customer DPA, and incident response contacts with the operator. Publish only case studies whose source data and customer permission are on record. The comparison pages describe workflows and require no customer testimonials.
