"use strict";
const { escape: e } = require("../security");
const { money } = require("../catalog");
const V = require("../views");

const when = value => value ? new Date(value).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—";
const field = (name, label, type = "text", attrs = "") => V.input(name, label, type, "", attrs);
const form = (action, body, label) => V.form(action, body, label, 'data-reload="true"');
const link = (path, label) => `<a href="${e(path)}">${e(label)}</a>`;
const reason = () => field("reason", "Reason (keep customer data out)", "text", 'required maxlength="240"');
const hidden = (key, value) => V.input(key, "", "hidden", value);
const table = (head, rows) => rows.length
  ? `<div class="table-scroll"><table><thead><tr>${head.map(label => `<th scope="col">${e(label)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
  : '<p class="muted">No records found.</p>';

function signin() {
  return `<section class="settings-block"><h1>Administrator sign-in</h1><p>Use your administrator account and authenticator code.</p>${V.form("/api/admin/sign-in",
    field("email", "Email", "email", 'required autocomplete="username"') +
    field("password", "Password", "password", 'required autocomplete="current-password"') +
    field("code", "Authenticator code", "text", 'required inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"'),
    "Sign in")}</section>`;
}

function adminAction(id, action, text, fields = "") {
  return `<details><summary>${e(text)}</summary>${form("/api/admin/action",
    hidden("tenantId", id) + hidden("action", action) + fields + reason(), text)}</details>`;
}

function workspaceDetails(data, plans) {
  const { store, reviews, google, usage, support } = data;
  const planSelect = `<label>Plan<select name="planId">${Object.entries(plans).map(([id, plan]) => `<option value="${e(id)}">${e(plan.name)}</option>`).join("")}</select></label>`;
  const days = field("days", "Additional days", "number", 'required min="1" max="365" step="1"');
  const details = `<h1>${e(store.location.name)}</h1><p>${support ? "Read-only support view" : "Workspace record"}</p>
    <dl><dt>Workspace ID</dt><dd>${e(store.id)}</dd><dt>Location</dt><dd>${e(store.location.city || "—")}</dd>
    <dt>Plan</dt><dd>${e(store.plan.name)} · ${e(store.plan.suspendedByAdmin ? "suspended by administrator" : store.plan.status)}</dd>
    <dt>Access end</dt><dd>${e(when(store.plan.expiresAt))}</dd><dt>QR scans</dt><dd>${e(store.qr.scans)}</dd>
    <dt>Review records</dt><dd>${e(reviews.total)}</dd><dt>Replies published</dt><dd>${e(reviews.published)}</dd>
    <dt>AI requests this month</dt><dd>${e(usage.generations)}</dd><dt>Google connection</dt><dd>${google ? e(google.last_error ? "Sync needs attention" : "Connected") : "Disconnected"}</dd>
    ${support ? "" : `<dt>Owner email</dt><dd>${e(store.user.email)}</dd><dt>QR link</dt><dd>${link("/q/" + encodeURIComponent(store.qr.code), "Open workspace QR")}</dd>`}</dl>`;
  if (support) return details;
  return details + `<h2>Receipts</h2>${table(["Receipt", "Amount", "Date", "Refunded"], store.receipts.map(receipt => [
    e(receipt.number || receipt.id), e(money(receipt.amount)), e(when(receipt.paidAt)), e(money(receipt.refundAmount || 0)),
  ]))}<h2>Actions</h2>
    ${adminAction(store.id, "support", "Start read-only support view")}
    ${adminAction(store.id, "extend", "Extend access", days)}
    ${adminAction(store.id, "comp", "Grant complimentary access", planSelect + days)}
    ${adminAction(store.id, "change_plan", "Change plan", planSelect)}
    ${adminAction(store.id, "refund", "Submit approved refund", field("paymentId", "Payment ID", "text", "required") +
      field("confirmation", "Retype the payment ID", "text", "required") + field("amount", "Refund amount in paise", "number", 'required min="100" step="1"'))}
    ${adminAction(store.id, "reset", "Send a password recovery link")}
    ${adminAction(store.id, "revoke", "Revoke workspace sessions")}
    <details><summary>Export workspace records</summary>${V.form("/api/admin/action",
      hidden("tenantId", store.id) + hidden("action", "export") + reason(), "Download export", 'data-admin-export="true"')}</details>
    ${adminAction(store.id, "suspend", "Suspend workspace")}
    ${adminAction(store.id, "restore", "Lift administrator suspension")}
    ${adminAction(store.id, "delete", "Permanently delete workspace", field("confirmation", "Type " + store.id, "text", "required"))}`;
}

function render(data, plans) {
  const nav = `<nav aria-label="Administration"><ul class="meta-list">${[
    ["", "Overview"], ["/workspaces", "Workspaces"], ["/billing", "Billing"], ["/jobs", "Jobs"], ["/audit", "Audit"], ["/analytics", "Analytics"],
  ].map(([path, text]) => `<li>${link("/admin" + path, text)}</li>`).join("")}</ul></nav>`;
  const logOut = form("/api/admin/sign-out", "", "Sign out of administration");
  const leaveSupport = form("/api/admin/action", hidden("action", "end_support"), "End support view");
  if (data.support || data.supportOnly)
    return (data.support ? workspaceDetails(data, plans) : `<h1>Support view is active</h1><p>${link("/admin/support", "Return to support view")}</p>`) +
      leaveSupport + logOut;
  let body;
  if (data.store) body = workspaceDetails(data, plans);
  else if (data.stats) {
    const stats = data.stats;
    body = `<h1>Administration</h1><dl><dt>Signups this month</dt><dd>${stats.signups}</dd><dt>Workspaces with a payment</dt><dd>${stats.activated}</dd>
    <dt>Active access monthly equivalent</dt><dd>${e(money(stats.monthlyEquivalent))}</dd><dt>Expiring within seven days</dt><dd>${stats.expiring}</dd>
    <dt>Paid periods ended this month</dt><dd>${stats.churn}</dd></dl>`;
  } else if (data.entries) {
    body = `<h1>Workspaces</h1><form method="get"><label>Search by ID, business name or owner email<input type="search" name="q" value="${e(data.search)}"></label><button>Search</button></form>` +
      table(["Workspace", "Plan", "Status", "Days left", "Location", "QR scans", "Reviews", "Published", "AI", "Google"], data.entries.map(record => {
        const { store, reviews, google, usage } = record;
        const days = Math.ceil((Date.parse(store.plan.expiresAt) - Date.now()) / 86400000);
        return [link("/admin/workspaces/" + encodeURIComponent(store.id), store.location.name),
          e(store.plan.name), e(store.plan.suspendedByAdmin ? "suspended" : store.plan.status), e(Math.max(0, days || 0)),
          e(store.location.city), e(store.qr.scans), e(reviews.total), e(reviews.published), e(usage.generations),
          e(google ? google.last_error ? "Needs attention" : "Connected" : "Disconnected")];
      })) + (data.next ? `<p>${link("/admin/workspaces?q=" + encodeURIComponent(data.search) + "&after=" + encodeURIComponent(data.next), "Next page")}</p>` : "");
  } else if (data.orders) {
    body = `<h1>Billing</h1><p>Webhook processing failures in the last 24 hours: ${e(data.hookFailures.total)}</p><h2>Orders and refunds</h2>` +
      table(["Order", "Workspace", "Plan", "Term", "Amount", "Status", "Payment", "Refunded"], data.orders.map(x => [
        e(x.id), e(x.tenant_id), e(x.plan_id), e(x.cycle), e(money(x.amount)), e(x.status), e(x.payment_id), e(money(x.refund_amount)),
      ])) + "<h2>Recent webhook events</h2>" + table(["Event", "Type", "Processed"], data.hooks.map(x => [e(x.id), e(x.kind), e(when(x.processed_at))])) +
      "<h2>Failed reconciliation jobs</h2>" + table(["Job", "Queued"], data.failures.map(x => [e(x.id), e(when(x.created_at))]));
  } else if (data.jobs) {
    body = `<h1>Jobs</h1><p>Pending: ${e(data.pending)} · Last worker tick: ${e(when(data.lastRanAt))}</p>` +
      table(["Job", "Due", "Attempts", "Status", "Action"], data.jobs.map(x => [e(x.id), e(when(x.run_at)), e(x.attempts),
        e(x.failed ? "Failed" : x.finished_at ? "Complete" : "Pending"),
        x.failed && ["google.sync", "razorpay.reconcile"].includes(x.kind)
          ? form("/api/admin/action", hidden("action", "retry_job") + hidden("jobId", x.id) + reason(), "Retry job") : "",
      ]));
  } else if (data.metrics) {
    body = "<h1>Consented site metrics</h1>" + table(["Date", "Page", "Metric", "Bucket", "Count"],
      data.metrics.map(x => [e(x.day), e(x.page), e(x.metric), e(x.bucket), e(x.hits)]));
  } else {
    body = `<h1>Audit log</h1><form method="get"><label>Action<input name="action" value="${e(data.action)}"></label><button>Filter</button></form>` +
      table(["Time", "Administrator", "Action", "Workspace", "Reason"],
        data.audit.map(x => [e(when(x.created)), e(x.admin_id), e(x.action), e(x.tenant_id), e(x.reason)]));
  }
  return nav + body + logOut;
}

module.exports = { signin, render };
