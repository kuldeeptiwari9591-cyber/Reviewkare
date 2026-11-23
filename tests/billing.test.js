"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { PGlite } = require("@electric-sql/pglite");
const { createApplication } = require("../src/server/application");
const { digest } = require("../src/server/security");
const { createBilling } = require("../src/server/billing");
const { createJobs, accessPhase } = require("../src/server/jobs");
const { pricedPlans, planTerms } = require("../src/server/catalog");
const { openStorage } = require("../src/server/storage");
const { postgresStorage } = require("../src/server/postgres");
const { migratePostgres } = require("../scripts/migrate-postgres");

const DAY = 86400000;
const prices = JSON.stringify(Object.fromEntries(["basic", "growth", "pro"].map((id, index) => [
  id, Object.fromEntries([1, 3, 6, 12].map(months => [months, (index + 1) * months * 10000])),
])));
const plans = pricedPlans(prices);
const tenant = {
  id: "phase-two", location: { name: "Test Business" }, user: { email: "owner@example.test" },
  plan: { status: "unpaid", expiresAt: null }, qr: { code: "billing-qr" }, receipts: [], usage: { month: "2028-01", drafts: 0, replies: 0 },
};
const webhookSecret = "test-webhook-secret";

async function resetWorkspace(storage, store = tenant) {
  await storage.db.prepare("INSERT INTO tenants(id,document) VALUES(?,?)").run(store.id, JSON.stringify(store));
}
async function addOrder(storage, suffix, cycle, now) {
  const [term] = planTerms(plans.basic).filter(term => term.key === cycle);
  const order = { id: "order_" + suffix, paymentId: "pay_" + suffix, amount: term.amount, cycle };
  await storage.db.prepare("INSERT INTO orders(id,tenant_id,plan_id,cycle,amount,currency,expires) VALUES(?,?,?,?,?,?,?)")
    .run(order.id, tenant.id, "basic", cycle, order.amount, "INR", now + DAY);
  return order;
}
function captured(order) {
  return { id: order.paymentId, order_id: order.id, currency: "INR", amount: order.amount, captured: true, status: "captured" };
}

test("Postgres migrations, paid access and receipts survive a disposable restore", async () => {
  const engine = new PGlite();
  let restored;
  try {
    await engine.exec("CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY)");
    const client = {
      query: (sql, params) => params ? engine.query(sql, params) : engine.exec(sql),
      release() {},
    };
    const pool = { connect: async () => client };
    const recorded = [];
    const options = { report: message => recorded.push(message) };
    await migratePostgres(pool, options);
    const count = (await engine.query("SELECT count(*) AS total FROM reviewkare_migrations.applied")).rows[0].total;
    assert.equal(recorded.length, count);
    assert.ok(recorded.every(message => message.startsWith("Applied ")));
    recorded.length = 0;
    await migratePostgres(pool, options);
    assert.equal(recorded.length, count);
    assert.ok(recorded.every(message => message.startsWith("Verified ")));
    const first = (await engine.query("SELECT version,checksum FROM reviewkare_migrations.applied ORDER BY version LIMIT 1")).rows[0];
    await engine.query("UPDATE reviewkare_migrations.applied SET checksum='changed' WHERE version=$1", [first.version]);
    await assert.rejects(migratePostgres(pool, options), /Migration checksum mismatch/);
    await engine.query("UPDATE reviewkare_migrations.applied SET checksum=$1 WHERE version=$2", [first.checksum, first.version]);
    const owner = crypto.randomUUID();
    await engine.query("INSERT INTO auth.users VALUES($1)", [owner]);
    await engine.exec("SET ROLE reviewkare_app");

    function connectStorage(database) {
      const query = async (sql, params) => {
        const result = await database.query(sql, params);
        return { ...result, rowCount: result.affectedRows };
      };
      return postgresStorage({ query, connect: async () => ({ query, release() {} }) });
    }
    const storage = connectStorage(engine);
    await resetWorkspace(storage);
    await storage.db.prepare("INSERT INTO users(email,tenant_id,auth_user_id,verified) VALUES(?,?,?,1)")
      .run(tenant.user.email, tenant.id, owner);
    const today = Date.parse("2028-01-31T06:00:00Z");
    const orders = [];
    const billing = createBilling({ storage, plans, provider: {}, operatorName: "Test Operator" });
    const dates = ["2028-02-29", "2028-05-29", "2028-11-29", "2029-11-29"];
    for (const [i, term] of ["1", "3", "6", "12"].entries()) {
      const order = await addOrder(storage, "Cal" + term, term, today);
      assert.equal(await billing.confirm(order.id, captured(order), { now: today }), true);
      orders.push(order);
      const current = await storage.tenant(tenant.id);
      assert.equal(current.plan.expiresAt, dates[i] + "T06:00:00.000Z");
      assert.equal(current.receipts[0].number, "RK-202801-00000" + (i + 1));
      assert.equal(current.receipts[0].amount, order.amount);
    }
    assert.equal((await storage.db.prepare("SELECT count(*) AS total FROM jobs").get()).total, 4);
    assert.equal(await billing.confirm(orders[0].id, captured(orders[0]), { repeat: true, now: today }), false);
    const missed = await addOrder(storage, "MissedWebhook", "1", today);
    const reconciliation = createBilling({
      storage, plans, operatorName: "Test Operator",
      provider: { razorpay: async (endpoint) => {
        assert.equal(endpoint, "orders/" + missed.id + "/payments");
        return { items: [captured(missed)] };
      } },
    });
    await reconciliation.reconcile(missed.id, today);
    assert.equal((await storage.tenant(tenant.id)).receipts.length, 5);
    await engine.exec("RESET ROLE; SET ROLE anon");
    await assert.rejects(engine.query("SELECT * FROM reviewkare_runtime.jobs"), /permission denied/);
    await engine.exec("RESET ROLE");
    const snapshot = await engine.dumpDataDir();
    restored = new PGlite({ loadDataDir: snapshot });
    await restored.exec("SET ROLE reviewkare_app");
    const recovered = connectStorage(restored);
    const recoveredWorkspace = await recovered.tenant(tenant.id);
    assert.equal(recoveredWorkspace.receipts.length, 5);
    assert.equal((await recovered.publicTenant(tenant.id)).qr.code, tenant.qr.code);
    assert.equal((await recovered.db.prepare("SELECT auth_user_id FROM users WHERE tenant_id=?").get(tenant.id)).auth_user_id, owner);
    assert.equal((await recovered.db.prepare("SELECT status FROM orders WHERE id=?").get(missed.id)).status, "paid");
    assert.equal((await recovered.db.prepare("SELECT count(*) AS total FROM jobs").get()).total, 5);
    assert.throws(() => pricedPlans('{"basic":{"1":100}}'), /each plan and duration/);
  } finally {
    await restored?.close();
    await engine.close();
  }
});

test("Razorpay raw signatures, failed payment recovery, replay and refund are handled over HTTP", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "reviewkare-billing-"));
  const env = { ...process.env };
  const storage = openStorage(directory);
  let app;
  try {
    Object.assign(process.env, { NODE_ENV: "development", RAZORPAY_KEY_ID: "", RAZORPAY_KEY_SECRET: "", BILLING_TERM_PRICES: prices, BILLING_ENABLED: "true", TAX_POLICY_CONFIRMED: "true", OPERATOR_NAME: "Test Operator", SUPPORT_EMAIL: "support@example.test", JOBS_SECRET: "scheduler-test-secret-at-least-32", RAZORPAY_WEBHOOK_SECRET: webhookSecret });
    await resetWorkspace(storage);
    const order = await addOrder(storage, "Webhook", "3", Date.now());
    await storage.db.prepare("INSERT INTO users(email,tenant_id,hash,salt,verified) VALUES(?,?,?,?,1)")
      .run(tenant.user.email, tenant.id, "test", "test");
    await storage.db.prepare("INSERT INTO sessions VALUES(?,?,?)")
      .run(digest("phase2-session"), tenant.user.email, Date.now() + DAY);
    const sent = [];
    let refundAmount = order.amount / 2;
    app = createApplication({ storage, providers: {
      razorpay: async (endpoint, options) => endpoint === "orders"
        ? { id: "order_Priced", amount: options.body.amount, currency: options.body.currency }
        : { ...captured(order), amount_refunded: refundAmount },
      sendMail: async (...args) => { sent.push(args); },
    } });
    await new Promise(resolve => app.server.listen(0, "127.0.0.1", resolve));
    const origin = "http://127.0.0.1:" + app.server.address().port;
    async function post(eventId, event, valid = true) {
      const raw = JSON.stringify(event, null, 2);
      const signature = crypto.createHmac("sha256", webhookSecret).update(valid ? raw : JSON.stringify(event)).digest("hex");
      return fetch(origin + "/api/webhooks/razorpay", { method: "POST", headers: {
        "content-type": "application/json", "x-razorpay-signature": signature, "x-razorpay-event-id": eventId,
      }, body: raw });
    }
    const offered = await fetch(origin + "/pricing");
    const pricing = await offered.text();
    assert.match(pricing, /Starter/);
    assert.match(pricing, /6 months/);
    const checkout = await fetch(origin + "/api/billing/order", {
      method: "POST",
      headers: {
        cookie: "reviewkare_session=phase2-session; reviewkare_csrf=phase2-csrf",
        "x-csrf-token": "phase2-csrf", "content-type": "application/json",
      },
      body: JSON.stringify({ planId: "basic", billingCycle: "6", amount: 1 }),
    });
    assert.equal(checkout.status, 200);
    assert.equal((await checkout.json()).amount, 60000);
    const payment = { payment: { entity: captured(order) } };
    const failed = { event: "payment.failed", payload: { payment: { entity: { ...captured(order), status: "failed" } } } };
    const capture = { event: "payment.captured", payload: payment };
    assert.equal((await post("evt_bad", capture, false)).status, 401);
    assert.equal((await post("evt_failed", failed)).status, 200);
    assert.equal((await storage.db.prepare("SELECT status FROM orders WHERE id=?").get(order.id)).status, "failed");
    const responses = await Promise.all([post("evt_capture", capture), post("evt_capture", capture), post("evt_capture_2", capture)]);
    assert.deepEqual(responses.map(item => item.status), [200, 200, 200]);
    assert.equal((await storage.tenant(tenant.id)).receipts.length, 1);
    const refund = { event: "refund.processed", payload: { refund: { entity: { payment_id: order.paymentId, status: "processed" } } } };
    assert.equal((await post("evt_refund", refund)).status, 200);
    assert.equal((await storage.tenant(tenant.id)).receipts[0].refundAmount, refundAmount);
    refundAmount = order.amount;
    assert.equal((await post("evt_refund", refund)).status, 200);
    assert.equal((await storage.tenant(tenant.id)).receipts[0].refundAmount, order.amount / 2);
    assert.equal((await post("evt_full", refund)).status, 200);
    assert.equal((await storage.tenant(tenant.id)).receipts[0].status, "refunded");
    assert.equal((await storage.db.prepare("SELECT count(*) AS total FROM jobs").get()).total, 1);
    const tick = (token) => fetch(origin + "/api/internal/jobs/tick", {
      method: "POST", headers: { authorization: "Bearer " + token },
    });
    assert.equal((await tick("invalid")).status, 401);
    assert.equal((await tick(process.env.JOBS_SECRET)).status, 200);
    assert.equal((await tick(process.env.JOBS_SECRET)).status, 200);
    assert.equal(sent.length, 1);
    const ops = () => fetch(origin + "/api/internal/ops", {
      headers: { authorization: "Bearer " + process.env.JOBS_SECRET },
    });
    const healthy = await ops();
    assert.equal(healthy.status, 200);
    assert.ok(Date.parse((await healthy.json()).lastWorkerTickAt) >= Date.now() - 10000);
    assert.match(sent[0][1], /^ReviewKare receipt RK-/);
    assert.match(sent[0][2], /Term: 3 calendar/);
  } finally {
    if (app) await new Promise(resolve => app.server.close(resolve));
    await (app ? app.close() : storage.close());
    process.env = env;
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test("expiry, delivery retry and retention notices persist across worker runs", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "reviewkare-jobs-"));
  const storage = openStorage(directory);
  try {
    const expires = Date.parse("2028-01-20T10:00:00Z");
    const plan = { tier: "basic", status: "active", expiresAt: new Date(expires).toISOString() };
    await resetWorkspace(storage, { ...tenant, plan });
    await storage.db.prepare("INSERT INTO users(email,tenant_id,hash,salt,verified) VALUES(?,?,?,?,1)")
      .run(tenant.user.email, tenant.id, "test", "test");
    const deliveries = [];
    let rejectFirst = true;
    const input = {
      storage, billing: {}, config: { origin: "https://example.test", supportEmail: "support@example.test" },
      provider: { sendMail: async (to, subject, text, { idempotencyKey }) => {
        deliveries.push({ to, subject, text, idempotencyKey });
        if (rejectFirst) {
          rejectFirst = false;
          throw new Error("Transient test failure");
        }
      } },
    };
    const flags = { lifecycle: true, deletes: true };
    const tick = (now) => createJobs(input).tick(now, flags);
    assert.equal(accessPhase(plan, expires - 1), "active");
    assert.equal((await tick(expires - 15 * DAY)).retried, 1);
    assert.equal((await tick(expires - 15 * DAY + 180000)).completed, 1);
    assert.equal(deliveries[0].idempotencyKey, deliveries[1].idempotencyKey);
    for (const [offset, state] of [[0, "expired"], [1, "readonly"], [61, "suspended"]]) {
      await tick(expires + offset * DAY);
      assert.equal((await storage.tenant(tenant.id)).plan.status, state);
    }
    await tick(expires + 150 * DAY);
    assert.equal((await tick(expires + 180 * DAY)).retried, 1);
    assert.ok(await storage.tenant(tenant.id));
    await tick(expires + 170 * DAY);
    await tick(expires + 180 * DAY + 180000);
    assert.equal(await storage.tenant(tenant.id), null);
    assert.equal(await storage.db.prepare("SELECT email FROM users WHERE tenant_id=?").get(tenant.id), undefined);
    assert.ok(await storage.db.prepare("SELECT 1 FROM audit WHERE action=?").get("workspace_retention_deleted"));
  } finally {
    await storage.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
