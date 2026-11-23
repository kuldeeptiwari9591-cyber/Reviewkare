"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");
const { postgresStorage } = require("../src/server/postgres");
const { createApplication } = require("../src/server/application");
const { createAuth } = require("../src/server/auth");
const { digest } = require("../src/server/security");

test("platform permissions, TOTP, support scope, consent and milestone acknowledgements", async () => {
  const engine = new PGlite();
  const env = { ...process.env };
  const owner = crypto.randomUUID();
  const operator = crypto.randomUUID();
  let verified = false;
  let app;
  try {
    await engine.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY)");
    for (const name of fs.readdirSync("supabase/migrations").sort())
      await engine.exec(fs.readFileSync("supabase/migrations/" + name, "utf8"));
    await engine.query("INSERT INTO auth.users VALUES($1),($2)", [owner, operator]);
    await engine.query("INSERT INTO reviewkare.profiles(id,email,name,is_platform_admin) VALUES($1,$2,$3,true)",
      [operator, "admin@example.test", "Operator"]);
    await engine.exec("SET ROLE reviewkare_app");
    const query = async (sql, params) => {
      const result = await engine.query(sql, params);
      return { ...result, rowCount: result.affectedRows };
    };
    const storage = postgresStorage({ query, connect: async () => ({ query, release() {} }), end: async () => {} });
    const { db } = storage;
    const id = "workspace-test";
    const workspace = {
      id, user: { email: "owner@example.test" }, location: { id, name: "Test workspace", placeId: "test" },
      qr: { code: "qr-abc" }, plan: { tier: "basic", name: "Basic", status: "active",
        expiresAt: new Date(Date.now() + 86400000).toISOString() },
      receipts: [], usage: { month: "", replies: 0, drafts: 0 },
    };
    await db.prepare("INSERT INTO tenants(id,document) VALUES(?,?)").run(id, JSON.stringify(workspace));
    await db.prepare("INSERT INTO users(email,tenant_id,auth_user_id,verified) VALUES(?,?,?,1)")
      .run(workspace.user.email, id, owner);
    await db.prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(digest("fixture-owner"), workspace.user.email, Date.now() + 86400000);

    const adminAuth = createAuth("http://localhost:3000", {
      SUPABASE_URL: "https://test.supabase.co", SUPABASE_ANON_KEY: "fake-key",
    }, async (url, options) => {
      const path = new URL(url).pathname;
      const identity = { id: operator, email_confirmed_at: "2026-11-21", factors: [{ id: "factor", status: "verified", factor_type: "totp" }] };
      if (path.endsWith("/token")) return Response.json({ user: identity, access_token: "first-factor" });
      assert.equal(options.headers.Authorization, "Bearer first-factor");
      if (path.endsWith("/user")) return Response.json(identity);
      if (path.endsWith("/challenge")) return Response.json({ id: "totp-challenge" });
      if (path.endsWith("/verify")) {
        const body = JSON.parse(options.body);
        assert.equal(body.challenge_id, "totp-challenge");
        verified = body.code === "654321";
        const payload = Buffer.from(JSON.stringify({ sub: operator, aal: verified ? "aal2" : "aal1" })).toString("base64url");
        return Response.json({ access_token: "fixture." + payload + ".end" });
      }
      throw new Error("Unexpected auth call");
    });
    Object.assign(process.env, { NODE_ENV: "development", BASE_URL: "http://localhost:3000",
      ADMIN_ENABLED: "true", ANALYTICS_ENABLED: "true", BILLING_ENABLED: "false", GOOGLE_BUSINESS_ENABLED: "false", SENTRY_DSN: "" });
    app = createApplication({ storage, accountAuth: adminAuth });
    await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
    const origin = "http://127.0.0.1:" + app.server.address().port;
    const cookies = new Map([["reviewkare_session", "fixture-owner"]]);
    async function request(path, body, extra = {}) {
      const headers = { cookie: [...cookies].map(([k, v]) => k + "=" + v).join("; "), ...extra };
      if (body) {
        headers["content-type"] = "application/json";
        headers["x-csrf-token"] = cookies.get("reviewkare_csrf");
      }
      const res = await fetch(origin + path, { method: body ? "POST" : "GET", headers, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
      for (const raw of res.headers.getSetCookie()) {
        const first = raw.split(";")[0], index = first.indexOf("=");
        cookies.set(first.slice(0, index), first.slice(index + 1));
      }
      return res;
    }
    assert.equal((await request("/admin/workspaces")).status, 303);
    assert.match(await (await request("/admin")).text(), /Administrator sign-in/);
    const creds = { email: "admin@example.test", password: "strong test password" };
    assert.equal((await request("/api/admin/sign-in", { ...creds, code: "000000" })).status, 401);
    assert.equal((await request("/api/admin/sign-in", { ...creds, code: "654321" })).status, 200);
    assert.equal(verified, true);
    assert.ok(cookies.get("reviewkare_admin"));
    assert.equal(cookies.get("reviewkare_session"), "fixture-owner");
    assert.equal((await request("/admin/workspaces?q=Test")).status, 200);
    assert.equal((await request("/api/admin/action", { action: "support", tenantId: id })).status, 400);
    assert.equal((await request("/api/admin/action", { action: "support", tenantId: id, reason: "Reproduce support ticket" })).status, 200);
    const support = await request("/admin/support");
    assert.match(await support.text(), /Read-only support view/);
    assert.equal((await request("/api/admin/action", { action: "suspend", tenantId: id, reason: "Support" })).status, 403);
    assert.equal((await request("/api/admin/action", { action: "end_support" })).status, 200);
    assert.equal((await request("/api/admin/action", { action: "suspend", tenantId: id, reason: "Verified support request" })).status, 200);
    assert.equal((await storage.tenant(id)).plan.suspendedByAdmin, true);
    await assert.rejects(engine.query("DELETE FROM reviewkare_runtime.platform_audit"), /permission denied/);
    assert.equal((await request("/admin/audit?action=suspend")).status, 200);
    await engine.exec("RESET ROLE");
    await engine.query("UPDATE reviewkare.profiles SET is_platform_admin=false WHERE id=$1", [operator]);
    await engine.exec("SET ROLE reviewkare_app");
    assert.equal((await request("/api/admin/action", { action: "restore", tenantId: id, reason: "Test" })).status, 401);

    await storage.reviews.create(id, { id: "test-review", reviewerName: "Fixture", rating: 5 });
    await storage.reviews.markPublished(id, "test-review", "posted");
    const { createMilestones } = require("../src/server/milestones");
    const milestones = createMilestones(db);
    assert.deepEqual((await milestones.notifications(id)).sort(), [
      "Your first reply was published.", "Your workspace recorded its first review.",
    ]);
    assert.deepEqual(await milestones.notifications(id), []);
    await request("/privacy");
    assert.equal((await request("/api/site-metrics", { page: "/pricing", metric: "view", bucket: "count" })).status, 403);
    assert.equal((await request("/api/site-metrics/consent", { enabled: true })).status, 200);
    assert.match(await (await request("/privacy")).text(), /Turn analytics off/);
    assert.equal((await request("/static/web-vitals.js")).status, 200);
    assert.equal((await request("/api/site-metrics", { page: "/admin", metric: "view", bucket: "count" })).status, 400);
    assert.equal((await request("/api/site-metrics", { page: "/pricing", metric: "LCP", bucket: "good" })).status, 204);
    assert.equal((await request("/api/site-metrics/consent", { enabled: false })).status, 200);
    assert.equal((await request("/api/site-metrics", { page: "/pricing", metric: "view", bucket: "count" })).status, 403);
    await storage.reviews.upsertGoogle(id, {
      googleReviewId: "old-google-review", reviewerName: "Fixture", rating: 5,
      createdAt: new Date(Date.now() - 31 * 86400000).toISOString(),
    });
    await storage.cleanup({ googleRetention: true });
    assert.equal(await storage.reviews.count(id), 1);
  } finally {
    if (app) {
      await new Promise(resolve => app.server.close(resolve));
      await app.close();
    }
    await engine.close();
    process.env = env;
  }
});
