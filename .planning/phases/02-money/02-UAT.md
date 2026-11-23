# Phase 2 billing reverification

Reviewed against the original specification on 21 November 2026. Local behavior is verifiable with disposable SQLite and embedded PostgreSQL. Staging provider acceptance remains open.

| Requirement | Evidence and boundary |
| --- | --- |
| Server-priced prepaid terms | All four calendar terms are covered on Postgres. The public pricing page and order endpoint consume the same catalog. The HTTP test submits a forged amount and receives the configured term price. Production requires all 12 confirmed quote values. Existing 30- and 365-day orders retain their original terms. |
| Exact dates and renewal stacking | Tests cover Jan 31, February in a leap year, month-end clamping, and an early renewal starting exactly at existing expiry. Term calculations use UTC and receipt numbering uses the calendar month in India. |
| Capture and isolation | The order is bound to its workspace, amount, currency, captured payment, and provider signature. Tests reject an incorrect tenant, wrong amount, incorrect payment ID, and authorization without capture. Browser and webhook retries converge on one receipt and one extension. |
| Webhooks and reconciliation | Tests cover raw-body HMAC failure, failed payment followed by capture, replay of one event ID, a second event ID for one payment, and missed capture reconciliation. Signed events that fail processing now add an operator-visible audit metric. |
| Receipts and refunds | The monthly receipt sequence is allocated transactionally. Tests check an owner-only, non-cacheable download, one queued delivery, and cumulative partial and full refund receipts. The tax footer is operator-configured. A refund updates receipt status and does not automatically change access. |
| Expiry and retention | Time-travel tests prove expiry, read-only, suspension on day 61, notice retries, and day-180 deletion only after the email provider has accepted both notices. Email acceptance does not establish delivery to a mailbox. |
| Durable job recovery | Queue rows are claimed with a lease and retry backoff. Provider email retries reuse an idempotency key within its supported window. Failed reconciliation jobs keep their minimal order payload so an administrator can safely retry. |
| Launch inputs | Approved prices and receipt wording, hosted migrations, Razorpay Test Mode, Resend sender verification, and a running external job trigger are required to demonstrate provider behavior. Live checkout and automatic deletion remain off in the deployment template. |

Run the billing-focused test suite with node --test tests/billing.test.js tests/launch.test.js on Node 24.22.1. Use the Supabase deployment guide for staging and provider acceptance.

The disposable PostgreSQL restore preserved the paid order, its receipt, the workspace QR and owner mapping, and the queued email jobs. The private operations endpoint reports a worker heartbeat even on an empty tick.
