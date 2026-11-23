"use strict";
const crypto = require("node:crypto");

function sentryReporter(value, transport = fetch) {
  if (!value) return () => {};
  const dsn = new URL(value);
  if (dsn.protocol !== "https:" || dsn.password || dsn.search || dsn.hash ||
      !/^[a-f0-9]+$/i.test(dsn.username) || !/^\/\d+$/.test(dsn.pathname) ||
      !/^[a-z0-9.-]+\.ingest(?:\.[a-z]{2})?\.sentry\.io$/i.test(dsn.hostname))
    throw new Error("SENTRY_DSN must be a hosted Sentry project DSN.");
  const endpoint = dsn.origin + "/api" + dsn.pathname + "/envelope/";
  const allowed = new Set(["internal", "application", "billing", "jobs", "cleanup"]);
  const last = new Map();
  return (category, status) => {
    if (!allowed.has(category) || !Number.isInteger(status) || status < 500 || status > 599) return;
    const now = Date.now();
    if (now - (last.get(category) || 0) < 60000) return;
    last.set(category, now);
    const eventId = crypto.randomUUID().replaceAll("-", "");
    const event = {
      event_id: eventId, timestamp: now / 1000, platform: "node", level: "error",
      message: "ReviewKare " + category + " failure", tags: { category, status: String(status) },
    };
    const body = [
      JSON.stringify({ dsn: dsn.href, event_id: eventId }),
      JSON.stringify({ type: "event" }),
      JSON.stringify(event),
    ].join("\n");
    transport(endpoint, {
      method: "POST", headers: { "Content-Type": "application/x-sentry-envelope" },
      body, redirect: "error", signal: AbortSignal.timeout(3000),
    }).then(response => {
      if (response.body) return response.body.cancel();
    }).catch(() => {});
  };
}

module.exports = { sentryReporter };
