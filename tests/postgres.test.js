"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { PGlite } = require("@electric-sql/pglite");
const { postgresStorage } = require("../src/server/postgres");
const { createApplication } = require("../src/server/application");
const { createAuth } = require("../src/server/auth");

test("Postgres routes and Supabase account lifecycle", async () => {
  const engine = new PGlite();
  const env = { ...process.env };
  const id = crypto.randomUUID();
  const identity = {
    id, email: "owner@example.test", email_confirmed_at: new Date().toISOString(),
    user_metadata: { rk_business_name: "Postgres Café", rk_owner_name: "Owner" },
  };
  let password = "original password";
  let verified = false;
  let signup;
  let oauthVerifier;
  const calls = [];
  const api = createAuth("https://reviewkare.example", {
    SUPABASE_URL: "https://supabase.example",
    SUPABASE_ANON_KEY: "test-public",
    SUPABASE_SERVICE_ROLE_KEY: "test-private",
  }, async (url, options) => {
    const { pathname, searchParams } = new URL(url);
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push(pathname);
    if (pathname.endsWith("/signup")) {
      signup = body;
      return Response.json({ id, email: body.email });
    }
    if (pathname.endsWith("/verify")) {
      if (body.type === "email") {
        assert.equal(body.token_hash, "verify-token");
        verified = true;
      } else assert.equal(body.token_hash, "reset-token");
      return Response.json({ user: identity, access_token: "test-access" });
    }
    if (searchParams.get("grant_type") === "password") {
      if (!verified || body.password !== password)
        return Response.json({}, { status: 400 });
      return Response.json({ user: identity, access_token: "test-access" });
    }
    if (searchParams.get("grant_type") === "pkce") {
      assert.equal(body.auth_code, "oauth-code");
      assert.equal(crypto.createHash("sha256").update(body.code_verifier).digest("base64url"), oauthVerifier);
      return Response.json({ user: identity });
    }
    if (pathname.endsWith("/recover")) return Response.json({});
    if (pathname.endsWith("/user")) {
      assert.equal(options.headers.Authorization, "Bearer test-access");
      password = body.password;
      return Response.json(identity);
    }
    if (pathname.endsWith("/admin/users/" + id)) {
      assert.equal(options.headers.Authorization, "Bearer test-private");
      await engine.query("DELETE FROM auth.users WHERE id=$1", [id]);
      return Response.json({});
    }
    throw new Error("Unexpected Auth test request");
  });
  let app;
  try {
    await engine.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY)");
    for (const migration of fs.readdirSync("supabase/migrations").sort())
      await engine.exec(fs.readFileSync("supabase/migrations/" + migration, "utf8"));
    const { rows } = await engine.query("SELECT rowsecurity FROM pg_tables WHERE schemaname IN ('reviewkare','reviewkare_runtime')");
    assert.ok(rows.length > 25 && rows.every(row => row.rowsecurity));
    await engine.query("INSERT INTO auth.users VALUES($1)", [id]);
    const query = async (sql, params) => {
      const result = await engine.query(sql, params);
      return { ...result, rowCount: result.affectedRows };
    };
    const storage = postgresStorage({
      query, connect: async () => ({ query, release() {} }), end: async () => {},
    });
    process.env.NODE_ENV = "development";
    process.env.BASE_URL = "https://reviewkare.example";
    process.env.SUPABASE_GOOGLE_SIGN_IN = "true";
    process.env.BILLING_ENABLED = "false";
    app = createApplication({ storage, accountAuth: api });
    await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
    const base = "http://127.0.0.1:" + app.server.address().port;
    const cookies = new Map();
    async function request(path, body) {
      const headers = { cookie: [...cookies].map(([k, v]) => k + "=" + v).join("; ") };
      if (body) {
        headers["content-type"] = "application/json";
        headers["x-csrf-token"] = cookies.get("reviewkare_csrf");
      }
      const res = await fetch(base + path, { method: body ? "POST" : "GET", headers, body: body ? JSON.stringify(body) : undefined, redirect: "manual" });
      for (const value of res.headers.getSetCookie()) {
        const pair = value.split(";")[0], separator = pair.indexOf("=");
        cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
      }
      return res;
    }
    assert.equal((await (await request("/api/health")).json()).storage, "postgres");
    await request("/signup");
    assert.equal((await request("/api/auth/signup", {
      email: identity.email, password, clinicName: "Postgres Café", ownerName: "Owner", termsAccepted: true,
    })).status, 201);
    assert.equal(signup.data.rk_business_name, "Postgres Café");
    assert.equal((await request("/api/auth/login", { email: identity.email, password })).status, 401);
    assert.equal((await request("/auth/callback?token_hash=verify-token&type=email")).headers.get("location"), "/verify-email?token=verify-token");
    assert.equal((await request("/api/auth/verify-email", { token: "verify-token" })).status, 200);
    assert.equal((await request("/api/auth/login", { email: identity.email, password })).status, 200);
    assert.equal((await request("/app")).status, 200);
    const { workspace } = await (await request("/api/account/export")).json();
    assert.equal(workspace.location.name, "Postgres Café");
    assert.equal((await storage.publicTenant(workspace.id)).qr.code, workspace.qr.code);
    await storage.transaction(async () => {
      await storage.reviews.upsertGoogle(workspace.id, { googleReviewId: "test-review", rating: 4 });
      await storage.reviews.upsertGoogle(workspace.id, { googleReviewId: "test-review", rating: 5 });
      await storage.aiUsage.add(workspace.id, "2026-11", { generations: 2 });
      await storage.aiUsage.add(workspace.id, "2026-11", { generations: 3 });
    });
    assert.equal((await storage.reviews.list(workspace.id)).total, 1);
    assert.equal((await storage.aiUsage.month(workspace.id, "2026-11")).generations, 5);
    assert.equal((await request("/api/auth/logout", {})).status, 200);
    assert.equal((await request("/api/account/export")).status, 401);
    const oauth = await (await request("/api/auth/google", {})).json();
    oauthVerifier = new URL(oauth.redirect).searchParams.get("code_challenge");
    assert.equal((await request("/auth/callback?code=oauth-code")).status, 303);
    assert.equal((await request("/api/account/export")).status, 200);
    assert.equal((await request("/api/auth/forgot-password", { email: identity.email })).status, 200);
    assert.equal((await request("/api/auth/reset-password", { token: "reset-token", password: "replacement password" })).status, 200);
    assert.equal((await request("/api/account/export")).status, 401);
    assert.equal((await request("/api/auth/login", { email: identity.email, password })).status, 200);
    assert.equal((await request("/api/account/delete", { confirmation: "DELETE", password })).status, 200);
    assert.equal(await storage.tenant(workspace.id), null);
    assert.ok(calls.includes("/auth/v1/recover"));
  } finally {
    if (app) {
      await new Promise(resolve => app.server.close(resolve));
      await app.close();
    }
    await engine.close();
    process.env = env;
  }
});

test("SQLite cutover preserves workspace and QR data without legacy credentials", async () => {
  const { DatabaseSync } = require("node:sqlite");
  const { migrate } = require("../src/server/migrations");
  const { importSqlite } = require("../scripts/import-sqlite-postgres");
  const source = new DatabaseSync(":memory:");
  const target = new PGlite();
  try {
    migrate(source);
    const workspace = { id: "old-workspace", qr: { code: "old-code" }, location: { name: "Original business" } };
    source.prepare("INSERT INTO tenants(id,document) VALUES(?,?)").run(workspace.id, JSON.stringify(workspace));
    source.prepare("INSERT INTO users(email,tenant_id,hash,salt,verified) VALUES(?,?,?,?,1)").run("owner@example.test", workspace.id, "old-hash", "old-salt");
    source.prepare("UPDATE qr_codes SET scans=42 WHERE code=? AND tenant_id=?").run(workspace.qr.code, workspace.id);
    source.prepare("INSERT INTO sessions VALUES(?,?,?)").run("old-session", "owner@example.test", Date.now() + 10000);
    await target.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz)");
    for (const migration of fs.readdirSync("supabase/migrations").sort())
      await target.exec(fs.readFileSync("supabase/migrations/" + migration, "utf8"));
    const db = { query: async (sql, params) => {
      const result = await target.query(sql, params);
      return { ...result, rowCount: result.affectedRows };
    } };
    await assert.rejects(importSqlite(source, db), /verified Supabase account/);
    const id = crypto.randomUUID();
    await target.query("INSERT INTO auth.users VALUES($1,$2,now())", [id, "owner@example.test"]);
    assert.equal((await importSqlite(source, db)).mode, "dry-run");
    assert.equal((await target.query("SELECT * FROM reviewkare_runtime.tenants")).rows.length, 0);
    assert.equal((await importSqlite(source, db, true)).mode, "applied");
    await assert.rejects(importSqlite(source, db, true), /Destination must have no workspaces/);
    await target.exec("SET ROLE reviewkare_app");
    assert.deepEqual((await target.query("SELECT code,scans FROM reviewkare_runtime.qr_codes")).rows, [{ code: "old-code", scans: 42 }]);
    assert.deepEqual((await target.query("SELECT tenant_id,auth_user_id,hash,salt FROM reviewkare_runtime.users")).rows,
      [{ tenant_id: workspace.id, auth_user_id: id, hash: null, salt: null }]);
    assert.equal((await target.query("SELECT * FROM reviewkare_runtime.sessions")).rows.length, 0);
    await target.exec("RESET ROLE; SET ROLE anon");
    await assert.rejects(target.query("SELECT * FROM reviewkare_runtime.users"), /permission denied/);
  } finally {
    source.close();
    await target.close();
  }
});
