"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const Database = require("better-sqlite3");
const { createApplication } = require("../src/server/application");
const realProviders = require("../src/server/providers");

test("production-mode launch regressions with disposable data", async (t) => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "reviewkare-launch-"),
  );
  const original = { ...process.env };
  Object.assign(process.env, {
    NODE_ENV: "production",
    BASE_URL: "http://127.0.0.1:3000",
    DATA_DIR: directory,
    BILLING_ENABLED: "true",
    OPERATOR_NAME: "Test Operator",
    SUPPORT_EMAIL: "support@example.test",
    HOSTING_REGION: "Test Region",
    TAX_POLICY_CONFIRMED: "true",
    RAZORPAY_KEY_ID: "rzp_test_fixture",
    RAZORPAY_KEY_SECRET: "fixture-secret-not-live",
    RESEND_API_KEY: "fixture-not-live",
    EMAIL_FROM: "support@example.test",
  });
  const emails = [],
    orders = new Map();
  let sequence = 0,
    paymentOverride = {};
  const providers = {
    signature: realProviders.signature,
    sendMail: async (to, subject, text) => {
      emails.push({ to, subject, text });
    },
    razorpay: async (endpoint, options) => {
      if (endpoint === "orders") {
        const result = { id: "order_Test" + ++sequence, ...options.body };
        orders.set(result.id, result);
        return result;
      }
      if (endpoint.startsWith("payments/")) {
        const id = endpoint.slice(9);
        const order = [...orders.values()].at(-1);
        return {
          id,
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          status: "captured",
          captured: true,
          amount_refunded: 0,
          ...paymentOverride,
        };
      }
      throw new Error("Unexpected provider endpoint");
    },
  };
  let app = createApplication({ providers, allowHttpForTests: true });
  await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
  let base = "http://127.0.0.1:" + app.server.address().port;
  class Client {
    constructor() {
      this.jar = new Map();
      this.csrf = "";
    }
    async request(url, { method = "GET", body, headers = {} } = {}) {
      const response = await fetch(base + url, {
        method,
        redirect: "manual",
        headers: {
          Cookie: [...this.jar].map(([k, v]) => k + "=" + v).join("; "),
          ...(body === undefined
            ? {}
            : {
                "Content-Type": "application/json",
                "X-CSRF-Token": this.csrf,
              }),
          ...headers,
        },
        body:
          body === undefined
            ? undefined
            : typeof body === "string"
              ? body
              : JSON.stringify(body),
      });
      for (const value of response.headers.getSetCookie()) {
        const pair = value.split(";")[0],
          index = pair.indexOf("=");
        this.jar.set(pair.slice(0, index), pair.slice(index + 1));
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {}
      const token = text.match(/name="csrf-token" content="([^"]*)"/);
      if (token) this.csrf = token[1];
      return { response, status: response.status, text, data };
    }
    post(url, body, headers = {}) {
      return this.request(url, { method: "POST", body, headers });
    }
  }
  const alice = new Client(),
    bob = new Client(),
    anonymous = new Client();
  let aStore, bStore, review, approvalUrl;
  const signup = (client, email, name) =>
    client.post("/api/auth/signup", {
      email,
      password: "An example password 2026!",
      clinicName: name,
      ownerName: "Business Owner",
      termsAccepted: true,
    });
  function grantAccess(tenantId, days = 30) {
    const state = app.storage.tenant(tenantId);
    state.plan = {
      tier: "basic",
      name: "Test access",
      status: "active",
      expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
    };
    app.storage.save(state);
  }
  async function verify(client, email) {
    await client.post("/api/auth/resend-verification", {});
    const token = emails
      .findLast((m) => m.to === email)
      .text.match(/token=([A-Za-z0-9_-]+)/)[1];
    return client.post("/api/auth/verify-email", { token });
  }
  try {
    await t.test(
      "public routes have self canonicals and no unsupported marketing promises",
      async () => {
        const canonicalFor = {
          "/book-demo": "/contact",
        };
        for (const route of [
          "/",
          "/features",
          "/pricing",
          "/privacy",
          "/terms",
          "/security",
          "/faq",
          "/contact",
          "/book-demo",
          "/free-audit",
          "/blog",
          "/blog/reply-to-negative-google-review",
        ]) {
          const result = await anonymous.request(route);
          assert.equal(result.status, 200, route);
          assert.ok(
            result.text.includes(
              `href="http://127.0.0.1:3000${canonicalFor[route] || route}"`,
            ),
            route,
          );
          assert.ok(!result.text.includes("Google Verified Partner"));
          assert.ok(!result.text.includes("4.9/1,420"));
          assert.ok(!result.text.includes("cdn.tailwindcss.com"));
          assert.equal(
            result.response.headers.get("cache-control"),
            "no-store",
          );
          assert.equal(
            (result.text.match(/<title>/g) || []).length,
            1,
            route + " has one title",
          );
          assert.match(result.text, /<meta name="description" content="[^"]{40,}/);
          assert.match(result.text, /application\/ld\+json/);
        }
      },
    );
    await t.test(
      "unknown industry/comparison/integration/QR/token routes are real errors",
      async () => {
        for (const route of [
          "/industries/unknown",
          "/vs/unknown",
          "/integrations/unknown",
          "/q/missing-code-123",
          "/a/invalid-token",
        ])
          assert.equal((await anonymous.request(route)).status, 404, route);
      },
    );
    await t.test(
      "all private read/write routes reject anonymous access first",
      async () => {
        for (const [url, method] of [
          ["/api/reviews", "GET"],
          ["/api/settings", "POST"],
          ["/api/staff", "POST"],
          ["/api/billing/config", "POST"],
          ["/api/billing/create-order", "POST"],
          ["/api/reviews/nope", "DELETE"],
          ["/api/branch/switch", "POST"],
          ["/api/account/export", "GET"],
        ]) {
          const result = await anonymous.request(url, {
            method,
            ...(method === "GET" ? {} : { body: {} }),
          });
          assert.equal(result.status, 401, url);
        }
        assert.equal((await anonymous.request("/app")).status, 303);
      },
    );
    await t.test(
      "malformed cookie and malformed URL do not crash the process",
      async () => {
        assert.equal(
          (
            await anonymous.request("/api/health", {
              headers: {
                Cookie: "reviewkare_session=%ZZ; __Host-reviewkare_session=%ZZ",
              },
            })
          ).status,
          200,
        );
        assert.equal((await anonymous.request("/%zz")).status, 404);
        assert.equal(
          (await anonymous.request("/api/health")).data.status,
          "healthy",
        );
      },
    );
    await alice.request("/signup");
    await bob.request("/signup");
    await t.test(
      "CSRF and origin enforced on public and private unsafe requests",
      async () => {
        assert.equal(
          (await alice.post("/api/auth/signup", {}, { "X-CSRF-Token": "" }))
            .status,
          403,
        );
        assert.equal(
          (
            await alice.post(
              "/api/auth/signup",
              {},
              { Origin: "https://evil.example" },
            )
          ).status,
          403,
        );
      },
    );
    await t.test(
      "email/password validation and explicit terms consent enforced",
      async () => {
        assert.equal(
          (await signup(alice, "not-email", "Alice Clinic")).status,
          400,
        );
        assert.equal(
          (
            await alice.post("/api/auth/signup", {
              email: "short@example.test",
              password: "1",
              clinicName: "Business",
              ownerName: "Owner",
              termsAccepted: true,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await alice.post("/api/auth/signup", {
              email: "terms@example.test",
              password: "A valid long password",
              clinicName: "Business",
              ownerName: "Owner",
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "provision isolated workspaces with secure session cookies and empty state",
      async () => {
        const first = await signup(alice, "alice@example.test", "Alice Clinic");
        assert.equal(first.status, 201);
        const cookie = first.response.headers
          .getSetCookie()
          .find((v) => v.startsWith("__Host-reviewkare_session="));
        assert.ok(cookie.includes("; Secure"));
        assert.ok(cookie.includes("HttpOnly"));
        assert.ok(cookie.includes("SameSite=Lax"));
        assert.ok(!first.text.includes("passwordHash"));
        assert.equal(
          (await signup(bob, "bob@example.test", "Bob Cafe")).status,
          201,
        );
        aStore = (await alice.request("/api/account/export")).data.workspace;
        bStore = (await bob.request("/api/account/export")).data.workspace;
        assert.notEqual(aStore.id, bStore.id);
        assert.notEqual(aStore.qr.code, bStore.qr.code);
        assert.deepEqual(aStore.reviews, []);
        assert.deepEqual(aStore.staff, []);
        assert.ok(!JSON.stringify(aStore).includes("Sharma"));
        // Accounts start unpaid; tests grant a fixed access period explicitly.
        grantAccess(aStore.id);
        grantAccess(bStore.id);
        const sessions = app.storage.db
          .prepare("SELECT hash FROM sessions")
          .all();
        for (const row of sessions) assert.match(row.hash, /^[a-f0-9]{64}$/);
      },
    );
    await t.test(
      "settings are allowlisted and stored XSS is encoded in generated HTML",
      async () => {
        assert.equal(
          (await alice.post("/api/settings", { id: bStore.id })).status,
          400,
        );
        const marker = '<img src=x onerror="alert(1)">';
        assert.equal(
          (
            await alice.post("/api/settings", {
              name: marker,
              placeId: "ChIJTestAlice123",
            })
          ).status,
          200,
        );
        assert.equal(
          (await alice.post("/api/staff", { name: marker, role: "Owner" }))
            .status,
          201,
        );
        const page = await alice.request("/app/staff");
        assert.ok(!page.text.includes(marker));
        assert.ok(page.text.includes("&lt;img"));
        assert.ok(!page.text.includes('onerror="alert(1)"'));
        assert.equal(
          (await bob.request("/api/account/export")).data.workspace.location
            .name,
          "Bob Cafe",
        );
        await alice.post("/api/settings", {
          name: "Alice Clinic",
          placeId: "ChIJTestAlice123",
        });
      },
    );
    await t.test(
      "tenant review access cannot cross tenant boundaries; drafts are never falsely posted",
      async () => {
        const result = await alice.post("/api/reviews", {
          reviewerName: "Patient A",
          rating: 1,
          text: "Wait was too long.",
        });
        assert.equal(result.status, 201);
        review = result.data.review;
        assert.equal(review.reply.status, "held");
        assert.equal(review.reply.isAutoPosted, false);
        assert.equal(review.reply.model, "english-template-v1");
        assert.equal((await bob.request("/api/reviews")).data.total, 0);
        assert.equal(
          (
            await bob.request("/api/reviews/" + review.id + "/reply", {
              method: "PATCH",
              body: { action: "approve", text: "Thanks" },
            })
          ).status,
          404,
        );
        assert.ok(
          !(await alice.request("/api/reviews")).text.includes("approvalToken"),
        );
        assert.equal(
          (
            await alice.request("/api/reviews/" + review.id + "/reply", {
              method: "PATCH",
              body: {
                action: "approve",
                text: "We promise to refund everything",
              },
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "approval resolves the actual tenant/review/draft and is single-use",
      async () => {
        const created = await alice.post("/api/approval-links", {
          reviewId: review.id,
        });
        assert.equal(created.status, 201);
        approvalUrl = new URL(created.data.approvalUrl).pathname;
        const page = await anonymous.request(approvalUrl);
        assert.equal(page.status, 200);
        assert.ok(page.text.includes("Patient A"));
        assert.ok(page.text.includes("Wait was too long."));
        assert.ok(!page.text.includes("Priya Narang"));
        assert.equal(
          page.response.headers.get("x-robots-tag"),
          "noindex, nofollow",
        );
        assert.equal(
          page.response.headers.get("referrer-policy"),
          "no-referrer",
        );
        const token = approvalUrl.split("/")[2],
          cap = app.storage.db
            .prepare("SELECT * FROM capabilities WHERE kind=?")
            .get("approval");
        assert.equal(
          cap.hash,
          crypto.createHash("sha256").update(token).digest("hex"),
        );
        assert.ok(!JSON.stringify(cap).includes(token));
        const accepted = await anonymous.post("/api/approvals/" + token, {});
        assert.equal(accepted.status, 200);
        assert.ok(accepted.data.message.includes("Nothing has been posted"));
        assert.equal(
          (await anonymous.post("/api/approvals/" + token, {})).status,
          410,
        );
      },
    );
    await t.test(
      "expired and changed-draft approval links fail closed",
      async () => {
        let result = await alice.post("/api/approval-links", {
          reviewId: review.id,
        });
        let token = new URL(result.data.approvalUrl).pathname.split("/")[2];
        app.storage.db
          .prepare("UPDATE capabilities SET expires=0 WHERE hash=?")
          .run(crypto.createHash("sha256").update(token).digest("hex"));
        assert.equal((await anonymous.request("/a/" + token)).status, 410);
        result = await alice.post("/api/approval-links", {
          reviewId: review.id,
        });
        token = new URL(result.data.approvalUrl).pathname.split("/")[2];
        await alice.request("/api/reviews/" + review.id + "/reply", {
          method: "PATCH",
          body: { action: "approve", text: "An edited exact draft." },
        });
        assert.equal(
          (await anonymous.post("/api/approvals/" + token, {})).status,
          410,
        );
      },
    );
    await t.test(
      "QR flow uses the owner code, neutral native ratings, no invented facts, no text in URLs",
      async () => {
        const page = await anonymous.request("/q/" + aStore.qr.code);
        assert.equal(page.status, 200);
        assert.equal((page.text.match(/type="radio"/g) || []).length, 5);
        assert.ok(
          !/<input[^>]*type="radio"[^>]*\schecked(?:\s|>)/.test(page.text),
        );
        assert.ok(page.text.includes("placeid=ChIJTestAlice123"));
        assert.ok(!page.text.includes("sharma-dent-01"));
        assert.ok(!page.text.includes("q/undefined"));
        assert.ok(!page.text.includes("Proceed Anyway"));
        const draft = await anonymous.post("/api/qr/drafts", {
          shortCode: aStore.qr.code,
          rating: 1,
          attributes: ["Service", "Free champagne"],
          note: "Poor experience. I do not recommend it.",
        });
        assert.equal(draft.status, 200);
        assert.ok(Array.isArray(draft.data.drafts));
        assert.ok(
          draft.data.drafts.length >= 3 && draft.data.drafts.length <= 5,
          "composer returns three to five drafts",
        );
        assert.deepEqual(draft.data.selectedAttributes, ["Service"]);
        for (const item of draft.data.drafts) {
          assert.ok(item.style && item.text.length > 0);
          assert.ok(!/https?:\/\//.test(item.text));
          assert.ok(!/champagne/i.test(item.text));
        }
        assert.equal(
          (
            await anonymous.post("/api/qr/drafts", {
              shortCode: aStore.qr.code,
              rating: 5,
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await anonymous.post("/api/qr/drafts", {
              shortCode: aStore.qr.code,
              attributes: ["Service"],
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await anonymous.post("/api/qr/drafts", {
              shortCode: "unknown-invalid-code",
              rating: 5,
              note: "Nice",
            })
          ).status,
          404,
        );
        assert.ok(
          !(await anonymous.request("/static/app.js")).text.includes("?text="),
        );
        const qr = await alice.request("/api/qr.svg");
        assert.equal(qr.status, 200);
        assert.ok(qr.text.startsWith("<svg"));
        assert.ok(qr.response.headers.get("content-type").includes("svg"));
        const printed = await alice.request("/app/qr/print");
        assert.ok(printed.text.includes(aStore.qr.code));
        assert.ok(printed.text.includes("Print or save as PDF"));
      },
    );
    await t.test(
      "provider stubs and secret editor cannot pretend to succeed",
      async () => {
        for (const endpoint of [
          "/api/simulate-review",
          "/api/whatsapp/test-send",
          "/api/disputes/generate",
          "/api/hardware/order",
          "/api/branch/switch",
          "/api/billing/config",
        ])
          assert.equal((await alice.post(endpoint, {})).status, 404, endpoint);
        assert.equal(
          (await anonymous.post("/api/webhooks/pos/petpooja", {})).status,
          503,
        );
        const page = await alice.request("/app/billing");
        assert.ok(!page.text.includes(process.env.RAZORPAY_KEY_SECRET));
        assert.ok(!page.text.includes("razorpayKeySecret"));
      },
    );
    await t.test(
      "contact/demo requests persist and report receipt, not delivery",
      async () => {
        for (const endpoint of ["/api/contact", "/api/book-demo"]) {
          const response = await anonymous.post(endpoint, {
            name: "Test Name",
            email: "contact@example.test",
            message: "Please explain the product.",
          });
          assert.equal(response.status, 201);
          assert.ok(response.data.message.includes("not yet been scheduled"));
        }
        assert.equal(
          app.storage.db.prepare("SELECT count(*) AS n FROM requests").get().n,
          2,
        );
      },
    );
    await t.test(
      "billing requires email verification and rejects invalid plan/cycle",
      async () => {
        assert.equal(
          (
            await alice.post("/api/billing/create-order", {
              planId: "basic",
              billingCycle: "monthly",
            })
          ).status,
          403,
        );
        assert.equal((await verify(alice, "alice@example.test")).status, 200);
        assert.equal(
          (
            await alice.post("/api/billing/create-order", {
              planId: "__proto__",
              billingCycle: "monthly",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await alice.post("/api/billing/create-order", {
              planId: "basic",
              billingCycle: "quarterly",
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "payment binds stored tenant/price/cycle, verifies capture and prevents replay",
      async () => {
        const order = (
          await alice.post("/api/billing/create-order", {
            planId: "basic",
            billingCycle: "annual",
          })
        ).data;
        assert.equal(order.amount, 749000);
        const payment = "pay_TestCapture",
          signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(order.orderId + "|" + payment)
            .digest("hex");
        const body = {
          razorpay_order_id: order.orderId,
          razorpay_payment_id: payment,
          razorpay_signature: signature,
          planId: "pro",
          billingCycle: "monthly",
        };
        assert.equal((await bob.post("/api/billing/verify", body)).status, 404);
        assert.equal(
          (
            await alice.post("/api/billing/verify", {
              ...body,
              razorpay_signature: "0".repeat(64),
            })
          ).status,
          400,
        );
        paymentOverride = { id: "pay_DifferentPayment" };
        assert.equal(
          (await alice.post("/api/billing/verify", body)).status,
          409,
        );
        paymentOverride = { amount: 1 };
        assert.equal(
          (await alice.post("/api/billing/verify", body)).status,
          409,
        );
        paymentOverride = { status: "authorized", captured: false };
        assert.equal(
          (await alice.post("/api/billing/verify", body)).status,
          409,
        );
        paymentOverride = {};
        const concurrent = await Promise.all([
          alice.post("/api/billing/verify", body),
          alice.post("/api/billing/verify", body),
        ]);
        assert.deepEqual(concurrent.map((r) => r.status).sort(), [200, 409]);
        const updated = (await alice.request("/api/account/export")).data
          .workspace;
        assert.equal(updated.plan.tier, "basic");
        assert.equal(updated.plan.billingCycle, "annual");
        assert.equal(updated.receipts.length, 1);
        assert.equal(updated.receipts[0].amount, 749000);
        assert.equal(
          (await alice.post("/api/billing/verify", body)).status,
          409,
        );
        assert.equal(
          (
            await alice.post("/api/billing/refund-request", {
              paymentId: payment,
              reason: "Please review my request.",
            })
          ).status,
          201,
        );
        assert.equal(
          (
            await alice.post("/api/billing/refund-request", {
              paymentId: payment,
              reason: "Duplicate",
            })
          ).status,
          409,
        );
      },
    );
    await t.test(
      "storage optimistic locking rejects stale state and write errors are not successes",
      async () => {
        const first = app.storage.tenant(aStore.id),
          stale = app.storage.tenant(aStore.id);
        first.location.city = "Persisted City";
        app.storage.save(first);
        stale.location.city = "Stale City";
        assert.throws(
          () => app.storage.save(stale),
          (error) => error.status === 409,
        );
        assert.equal(
          app.storage.tenant(aStore.id).location.city,
          "Persisted City",
        );
        assert.equal(app.storage.tenant("missing-tenant"), null);
        app.storage.db.exec("PRAGMA query_only=ON");
        try {
          assert.equal(
            (await alice.post("/api/settings", { city: "Not committed" }))
              .status,
            500,
          );
          assert.equal((await anonymous.request("/api/health")).status, 503);
        } finally {
          app.storage.db.exec("PRAGMA query_only=OFF");
        }
        assert.equal(
          app.storage.tenant(aStore.id).location.city,
          "Persisted City",
        );
      },
    );
    await t.test(
      "data and sessions persist after a complete application restart",
      async () => {
        await new Promise((resolve) => app.server.close(resolve));
        app.close();
        app = createApplication({ providers, allowHttpForTests: true });
        await new Promise((resolve) =>
          app.server.listen(0, "127.0.0.1", resolve),
        );
        base = "http://127.0.0.1:" + app.server.address().port;
        assert.equal(
          (await alice.request("/api/account/export")).data.workspace.location
            .city,
          "Persisted City",
        );
      },
    );
    await t.test(
      "backup restores an intact database with tenant records",
      async () => {
        const file = path.join(directory, "verified-copy.sqlite");
        await app.storage.db.backup(file);
        const copy = new Database(file, { readonly: true });
        assert.equal(
          copy.prepare("PRAGMA integrity_check").get().integrity_check,
          "ok",
        );
        assert.equal(
          copy.prepare("SELECT count(*) AS n FROM tenants").get().n,
          2,
        );
        copy.close();
      },
    );
    await t.test(
      "legacy migration is explicit, isolated, and never trusts demo sessions or paid claims",
      async () => {
        const legacy = path.join(directory, "legacy"),
          destination = path.join(directory, "imported");
        fs.mkdirSync(path.join(legacy, "tenants"), { recursive: true });
        fs.writeFileSync(
          path.join(legacy, "registry.json"),
          JSON.stringify({
            users: {
              "imported@example.test": {
                tenantId: "t_imported",
                passwordHash: "old-weak-hash",
              },
              "demo@example.test": { tenantId: "default" },
            },
            sessions: { "old-token": {} },
          }),
        );
        fs.writeFileSync(
          path.join(legacy, "tenants", "t_imported.json"),
          JSON.stringify({
            location: {
              name: "Imported Business",
              placeId: "UnverifiedLegacyPlace",
            },
            user: { name: "Old Owner", plan: { status: "active" } },
            reviews: [
              {
                reviewerName: "Old Reviewer",
                rating: 5,
                text: "An existing review",
                reply: { status: "posted", finalText: "An old draft" },
              },
            ],
          }),
        );
        const env = {
          ...process.env,
          LEGACY_DATA_DIR: legacy,
          DATA_DIR: destination,
        };
        const dry = spawnSync(process.execPath, ["scripts/migrate-legacy.js"], {
          env,
          encoding: "utf8",
        });
        assert.equal(dry.status, 0, dry.stderr);
        assert.equal(
          fs.existsSync(path.join(destination, "reviewkare.sqlite")),
          false,
        );
        const applied = spawnSync(
          process.execPath,
          ["scripts/migrate-legacy.js", "--apply"],
          { env, encoding: "utf8" },
        );
        assert.equal(applied.status, 0, applied.stderr);
        const copy = new Database(
          path.join(destination, "reviewkare.sqlite"),
          { readonly: true },
        );
        const imported = JSON.parse(
          copy.prepare("SELECT document FROM tenants").get().document,
        );
        assert.equal(imported.plan.status, "migration-review");
        assert.equal(imported.location.placeId, "");
        assert.equal(imported.reviews, undefined);
        const importedReviews = copy
          .prepare("SELECT reviewer_name, status FROM reviews")
          .all();
        assert.equal(importedReviews.length, 1);
        assert.equal(importedReviews[0].reviewer_name, "Old Reviewer");
        assert.equal(importedReviews[0].status, "draft");
        assert.equal(
          copy.prepare("SELECT count(*) AS n FROM sessions").get().n,
          0,
        );
        assert.equal(
          copy.prepare("SELECT count(*) AS n FROM users").get().n,
          1,
        );
        assert.notEqual(
          copy.prepare("SELECT hash FROM users").get().hash,
          "old-weak-hash",
        );
        copy.close();
        assert.equal(
          spawnSync(
            process.execPath,
            ["scripts/migrate-legacy.js", "--apply"],
            { env, encoding: "utf8" },
          ).status,
          1,
        );
      },
    );
    await t.test(
      "missing provider secrets fail closed without mock orders or signature bypass",
      async () => {
        const key = process.env.RAZORPAY_KEY_ID,
          secret = process.env.RAZORPAY_KEY_SECRET;
        delete process.env.RAZORPAY_KEY_ID;
        delete process.env.RAZORPAY_KEY_SECRET;
        try {
          await assert.rejects(
            () =>
              realProviders.razorpay("orders", {
                method: "POST",
                body: { amount: 1 },
              }),
            (error) => error.status === 503,
          );
          assert.equal(
            realProviders.signature("order_Test", "pay_Test", "a".repeat(64)),
            false,
          );
        } finally {
          process.env.RAZORPAY_KEY_ID = key;
          process.env.RAZORPAY_KEY_SECRET = secret;
        }
      },
    );
    await t.test(
      "real public assets, robots, sitemap, and compression are consistent",
      async () => {
        for (const asset of [
          "/static/og-banner.png",
          "/static/logo.png",
          "/favicon.ico",
          "/static/app.css",
          "/static/app.js",
        ])
          assert.equal((await anonymous.request(asset)).status, 200, asset);
        const robots = await anonymous.request("/robots.txt");
        assert.ok(robots.text.includes("Disallow: /app"));
        assert.ok(robots.text.includes("Disallow: /q/"));
        assert.ok(robots.text.includes("User-agent: *"));
        assert.ok(!/^Disallow: \/$/m.test(robots.text));
        assert.ok(robots.text.includes("Sitemap: http://127.0.0.1:3000/sitemap.xml"));
        const sitemap = await anonymous.request("/sitemap.xml");
        assert.ok(sitemap.text.includes("/features"));
        assert.ok(!sitemap.text.includes("/app"));
        assert.ok(sitemap.text.includes("/blog/reply-to-negative-google-review"));
        assert.ok(!sitemap.text.includes("/book-demo"));
        assert.ok(!sitemap.text.includes("/compliance"));
        assert.ok(!sitemap.text.includes("/offline"));
        assert.match(sitemap.text, /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
        const home = await anonymous.request("/", {
          headers: { "Accept-Encoding": "gzip" },
        });
        assert.equal(home.response.headers.get("content-encoding"), "gzip");
        assert.ok(
          home.response.headers
            .get("content-security-policy")
            .includes("script-src-attr 'none'"),
        );
        assert.ok(!home.response.headers.has("access-control-allow-origin"));
        assert.equal(
          home.response.headers.get("strict-transport-security"),
          "max-age=31536000",
        );
      },
    );
    await t.test(
      "seo metadata, schema, and crawl files stay consistent",
      async () => {
        const routes = [
          "/",
          "/features",
          "/pricing",
          "/security",
          "/privacy",
          "/terms",
          "/refund-policy",
          "/faq",
          "/contact",
          "/qr-kit",
          "/for-agencies",
          "/free-audit",
          "/tools/google-review-link-generator",
          "/blog",
          "/blog/reply-to-negative-google-review",
          "/blog/qr-codes-for-google-reviews",
          "/blog/find-google-place-id",
        ];
        const titles = new Set();
        const descriptions = new Set();
        for (const route of routes) {
          const page = await anonymous.request(route);
          assert.equal(page.status, 200, route);
          const title = page.text.match(/<title>([^<]+)<\/title>/)[1];
          const description = page.text.match(
            /<meta name="description" content="([^"]+)"/,
          )[1];
          assert.ok(!titles.has(title), "duplicate title on " + route);
          assert.ok(
            !descriptions.has(description),
            "duplicate description on " + route,
          );
          titles.add(title);
          descriptions.add(description);
          assert.match(
            page.text,
            /<meta name="robots" content="index, follow[^"]*">/,
            route,
          );
          assert.ok(
            page.text.includes('<meta property="og:image"'),
            route + " og:image",
          );
          assert.ok(
            page.text.includes('<meta name="twitter:card"'),
            route + " twitter card",
          );
          const json = page.text.match(
            /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
          );
          assert.ok(json, route + " has json-ld");
          const graph = JSON.parse(json[1])["@graph"];
          const types = graph.map((node) => node["@type"]);
          assert.ok(types.includes("Organization"), route + " organization");
          assert.ok(types.includes("WebSite"), route + " website");
          assert.ok(
            types.includes("WebPage") || types.includes("CollectionPage"),
            route + " webpage",
          );
          assert.ok(
            graph.every((node) => node["@type"] !== "BlogPosting" || route.startsWith("/blog/")),
            route + " article schema only on articles",
          );
          if (route === "/blog/reply-to-negative-google-review")
            assert.ok(types.includes("BlogPosting"));
        }
        const faq = await anonymous.request("/faq");
        const faqGraph = JSON.parse(
          faq.text.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
        )["@graph"];
        const faqPage = faqGraph.find((node) => node["@type"] === "FAQPage");
        assert.ok(faqPage);
        assert.equal(faqPage.mainEntity.length, 18);
        for (const alias of [
          ["/compliance", "/security"],
          ["/dpdp-consent", "/privacy"],
          ["/tools", "/tools/google-review-link-generator"],
        ]) {
          const page = await anonymous.request(alias[0]);
          assert.ok(
            page.text.includes(
              `href="http://127.0.0.1:3000${alias[1]}"`,
            ),
            alias[0] + " canonical",
          );
        }
        assert.equal((await anonymous.request("/blog/unknown-guide")).status, 404);
        for (const blocked of [
          "/docs/OPERATIONS.md",
          "/README.md",
          "/.env",
          "/.git/config",
          "/data/app.sqlite",
          "/docs/",
        ])
          assert.equal(
            (await anonymous.request(blocked)).status,
            404,
            blocked,
          );
        const slash = await anonymous.request("/features/");
        assert.equal(slash.status, 301);
        assert.match(
          slash.response.headers.get("location") || "",
          /\/features$/,
        );
        const llms = await anonymous.request("/llms.txt");
        const full = await anonymous.request("/llms-full.txt");
        assert.ok(llms.text.includes("## Product facts"));
        assert.ok(full.text.includes("## Crawl guidance"));
        assert.notEqual(llms.text, full.text);
        assert.ok(llms.text.includes("http://127.0.0.1:3000/pricing"));
      },
    );
    await t.test(
      "large/invalid bodies and wrong content types fail without process exit",
      async () => {
        assert.equal((await alice.post("/api/settings", "{")).status, 400);
        assert.equal(
          (await alice.post("/api/settings", "x".repeat(33000))).status,
          413,
        );
        assert.equal(
          (
            await alice.post(
              "/api/settings",
              {},
              { "Content-Type": "text/plain" },
            )
          ).status,
          415,
        );
        assert.equal((await anonymous.request("/api/health")).status, 200);
      },
    );
    await t.test(
      "unpaid accounts stay read-only until access is purchased or granted",
      async () => {
        const unpaid = app.storage.tenant(bStore.id);
        unpaid.plan = {
          tier: "none",
          name: "No plan",
          status: "unpaid",
          expiresAt: null,
        };
        app.storage.save(unpaid);
        assert.equal(
          (
            await bob.post("/api/reviews", {
              reviewerName: "Test",
              rating: 5,
              text: "",
            })
          ).status,
          402,
        );
        assert.equal((await bob.request("/api/account/export")).status, 200);
        assert.equal((await bob.request("/app/billing")).status, 200);
        grantAccess(bStore.id);
        assert.equal(
          (
            await bob.post("/api/reviews", {
              reviewerName: "Test",
              rating: 5,
              text: "",
            })
          ).status,
          201,
        );
        const limited = app.storage.tenant(aStore.id);
        limited.usage.replies = 80;
        app.storage.save(limited);
        assert.equal(
          (
            await alice.post("/api/reviews", {
              reviewerName: "Test",
              rating: 5,
              text: "",
            })
          ).status,
          429,
        );
      },
    );
    await t.test(
      "password reset is expiring/single-use and revokes old sessions",
      async () => {
        await anonymous.request("/forgot-password");
        const requested = await anonymous.post("/api/auth/forgot-password", {
          email: "bob@example.test",
        });
        assert.equal(requested.status, 200);
        const token = emails
          .findLast((m) => m.to === "bob@example.test")
          .text.match(/token=([A-Za-z0-9_-]+)/)[1];
        assert.equal(
          (
            await anonymous.post("/api/auth/reset-password", {
              token,
              password: "My new long password 2026!",
            })
          ).status,
          200,
        );
        assert.equal((await bob.request("/api/account/export")).status, 401);
        assert.equal(
          (
            await anonymous.post("/api/auth/reset-password", {
              token,
              password: "My new long password 2026!",
            })
          ).status,
          410,
        );
        assert.equal(
          (
            await bob.post("/api/auth/login", {
              email: "bob@example.test",
              password: "My new long password 2026!",
              redirect: "https://evil.example",
            })
          ).data.redirect,
          "/app",
        );
      },
    );
    await t.test(
      "account deletion needs password and invalidates sessions and QR",
      async () => {
        assert.equal(
          (
            await bob.post("/api/account/delete", {
              password: "wrong",
              confirmation: "DELETE",
            })
          ).status,
          400,
        );
        assert.equal(
          (
            await bob.post("/api/account/delete", {
              password: "My new long password 2026!",
              confirmation: "DELETE",
            })
          ).status,
          200,
        );
        assert.equal((await bob.request("/api/account/export")).status, 401);
        assert.equal(
          (await anonymous.request("/q/" + bStore.qr.code)).status,
          404,
        );
      },
    );
    await t.test(
      "password change and revoke-all terminate every old session",
      async () => {
        assert.equal(
          (
            await alice.post("/api/auth/change-password", {
              currentPassword: "wrong",
              password: "A completely new password 2026!",
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await alice.post("/api/auth/change-password", {
              currentPassword: "An example password 2026!",
              password: "A completely new password 2026!",
            })
          ).status,
          200,
        );
        assert.equal((await alice.request("/api/account/export")).status, 401);
        assert.equal(
          (
            await alice.post("/api/auth/login", {
              email: "alice@example.test",
              password: "An example password 2026!",
            })
          ).status,
          401,
        );
        assert.equal(
          (
            await alice.post("/api/auth/login", {
              email: "alice@example.test",
              password: "A completely new password 2026!",
            })
          ).status,
          200,
        );
        assert.equal(
          (await alice.post("/api/auth/revoke-sessions", {})).status,
          200,
        );
        assert.equal((await alice.request("/api/account/export")).status, 401);
      },
    );
    await t.test(
      "demo login is removed and X-Forwarded-For cannot bypass login limits",
      async () => {
        assert.equal(
          (
            await anonymous.post("/api/auth/login", {
              email: "dr.sharma@sharmadental.in",
              password: "ClinicalDemo@2026",
            })
          ).status,
          401,
        );
        let limited = false;
        for (let n = 0; n < 12; n++) {
          const result = await anonymous.post(
            "/api/auth/login",
            { email: "unknown" + n + "@example.test", password: "wrong" },
            { "X-Forwarded-For": "198.51.100." + n },
          );
          if (result.status === 429) limited = true;
        }
        assert.ok(
          limited,
          "rotated untrusted forwarded IPs must still be limited",
        );
      },
    );
  } finally {
    await new Promise((resolve) => app.server.close(resolve));
    app.close();
    for (const key of Object.keys(process.env))
      if (!(key in original)) delete process.env[key];
    Object.assign(process.env, original);
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
