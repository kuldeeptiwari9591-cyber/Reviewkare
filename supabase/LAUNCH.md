# Launch operations and privacy sign-off

Record a responsible operator and evidence for every live launch gate. Complete each gate on staging with disposable accounts before enabling integrations on production.

| Gate | Evidence to record |
| --- | --- |
| Hosting and restore | Project names and regions, database plan and backup schedule, successful restore in a separate project, recovery duration and page/data checks. |
| Payments | Approved prices and tax wording, test-mode captured and failed payments, replayed webhook, early renewal, receipt delivery, and a test-mode refund. |
| Google | Approval for the Business Profile API project and scopes, OAuth on the deployed exact callback, consent and revoke/disconnect tests, cache and backup retention. |
| Operations | Configured uptime, database size, job and provider-failure alerts. Trigger and acknowledge one sample alert per channel. |
| Capacity | Run the 100-concurrent smoke locally with npm run test:load, then measure the actual staging instance and database pool against a service latency/error target before launch. |
| Search | Verify the canonical domain in Google Search Console and Bing, submit its sitemap, and inspect the pricing and comparison URLs. Review consented Core Web Vitals after enough visits accrue. |
| Customer evidence | Written permission covering the business name and each figure or quote in a case study. |

## Local release evidence

- Phase 1: the production migration runner applies the numbered migrations, verifies them when rerun, and refuses a changed checksum. Hosted Auth and pooler sign-off still need staging.
- Phase 2: the disposable PostgreSQL restore preserved the owner mapping, workspace and QR, paid order state, receipts, and queued email jobs. Current prices and tax wording still need operator approval.
- Phase 3: the local 100-concurrent-request smoke and SQLite backup regression passed. The private operations endpoint exposes lastWorkerTickAt even when the queue is empty, so the alerting service can detect a stopped scheduler. An embedded database restore does not measure the hosted backup or restore service.
## Processor and agreement review

Complete the legal name, business/support details, grievance contact, and effective date. Maintain a record of the hosting provider, database and Auth provider, mail provider, payment provider, monitoring provider, and optional AI vendors actually enabled. Capture each processor's role, data categories, processing region, access, backup and retention periods, and contract or DPA status. Confirm the applicable rules and dates with the operator's legal adviser. [MeitY DPDP commencement notification](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf)

The [DPA draft](DPA-DRAFT.md) should identify both parties and their roles and cover instructions and processing scope, confidentiality, subprocessors, security controls, rights requests, incident escalation, cross-border processing, data return, deletion, and audit cooperation. It requires actual entity details, approved terms, and signatures.

## Incident procedure

1. Record time, reporter, severity, affected systems, and an incident lead. Preserve evidence with restricted access.
2. Contain the incident and revoke compromised credentials and sessions. Assess which data and customers were affected. Confirm statutory, customer and provider notification duties and deadlines with the operator.
3. Send approved notices through the responsible legal or support contact. Log timestamps, mitigations, recovery checks, and remediation owners.
4. Run a tabletop exercise before launch using a simulated failed webhook, an expired job lease, and an exposed provider credential.
