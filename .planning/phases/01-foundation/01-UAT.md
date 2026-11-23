# Phase 1 Foundation UAT

Verified 21 November 2026 with Node 24.22.1. Result: local acceptance passed with production sign-off open.

| Acceptance check | Result | Evidence |
| --- | --- | --- |
| Removed shared demo sign-in and legacy demo trees | Pass locally | Launch regression checks the old login path. The build checks active source for legacy credentials and flags. |
| Email signup, confirmation, login, Google sign-in, recovery, logout and deletion | Pass with mocked Supabase Auth | tests/postgres.test.js exercises application routes with embedded PostgreSQL. |
| Postgres row-level security and backend role | Pass on embedded PostgreSQL | The test checks RLS on both schemas, backend access, and denial for the anonymous role. |
| SQLite to Postgres transfer | Pass on a disposable fixture | Dry run and import preserve the workspace and QR data. Legacy hashes and sessions are excluded. |
| Existing behavior on Postgres | Partial | The dedicated Postgres suite covers auth, transfer, QR data, review sync and AI usage. The broad launch regression suite uses SQLite. The active hosted schema preserves existing IDs and record formats. |
| Release checks | Pass locally | Phase 1 baseline had 66 passing tests. The build and configured TypeScript check passed. jsconfig currently scopes compilation and disables semantic JavaScript checking. |
| Live Render and Supabase cutover | Pending | Exercise the real pooler, email confirmation, Resend SMTP, Google OAuth, production rate limits and redirects in staging. Scheduled database checks are pending. |
| Credential rotation and Git history cleanup | Pending | Requires provider access and explicit authorization for a history rewrite. |
| Platform administrator TOTP | Pending | The app has no platform-admin routes. Verify TOTP when that access is implemented. |

The installed GSD skill entry files were available. Their referenced workflow and template files were missing, so this log records acceptance checks performed directly against the supplied phase specification.
