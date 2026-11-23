"use strict";
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { openStorage } = require("../src/server/storage");
const { createApplication } = require("../src/server/application");

async function main() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "reviewkare-load-"));
  const storage = openStorage(directory);
  let app;
  try {
    Object.assign(process.env, {
      NODE_ENV: "development", BASE_URL: "http://localhost:3000", SENTRY_DSN: "",
      ADMIN_ENABLED: "false", GOOGLE_BUSINESS_ENABLED: "false", BILLING_ENABLED: "false",
      AI_DRAFTS_ENABLED: "false", ANALYTICS_ENABLED: "false", BILLING_TERM_PRICES: "",
    });
    app = createApplication({ storage });
    await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + app.server.address().port;
    const pages = ["/", "/pricing", "/compare/google-review-link", "/sitemap.xml", "/api/health"];
    const results = await Promise.all(Array.from({ length: 100 }, async (_, index) => {
      const start = performance.now();
      try {
        const response = await fetch(base + pages[index % pages.length], { signal: AbortSignal.timeout(10000) });
        await response.arrayBuffer();
        return { ok: response.status === 200, time: performance.now() - start };
      } catch {
        return { ok: false, time: performance.now() - start };
      }
    }));
    const sorted = results.map(result => result.time).sort((a, b) => a - b);
    const failed = results.filter(result => !result.ok).length;
    console.log(JSON.stringify({ requests: results.length, failed, p50Ms: Math.round(sorted[49]), p95Ms: Math.round(sorted[94]) }));
    if (failed) process.exitCode = 1;
  } finally {
    if (app) await new Promise(resolve => app.server.close(resolve));
    await (app ? app.close() : storage.close());
    await fs.rm(directory, { recursive: true, force: true });
  }
}
main().catch(() => {
  console.error("The disposable local load run failed.");
  process.exitCode = 1;
});
