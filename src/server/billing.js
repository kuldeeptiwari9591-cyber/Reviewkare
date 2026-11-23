"use strict";
const crypto = require("node:crypto");
const S = require("./security");
const { money, paymentPeriod, termKey } = require("./catalog");

const paymentRef = /^pay_[a-zA-Z0-9]+$/;
const orderRef = /^order_[a-zA-Z0-9]+$/;

function receiptText(receipt, defaults = {}) {
  const singleLine = (text) => String(text || "").replace(/[\r\n]+/g, " ");
  const details = [
    "ReviewKare payment receipt",
    "Reference: " + (receipt.number || receipt.id),
    "Operator: " + singleLine(receipt.operatorName || defaults.operatorName),
    "Business: " + singleLine(receipt.businessName || defaults.businessName),
    "Plan: " + singleLine(receipt.planName),
    "Amount paid: " + money(receipt.amount),
    "Payment date: " + receipt.paidAt,
    "Payment reference: " + receipt.paymentId,
    "Order reference: " + receipt.orderId,
  ];
  if (receipt.startsAt && receipt.expiresAt)
    details.push("Access starts: " + receipt.startsAt, "Access ends: " + receipt.expiresAt);
  if (receipt.term) details.push("Term: " + receipt.term);
  if (receipt.refundAmount) details.push("Refunded: " + money(receipt.refundAmount));
  if (receipt.footer) details.push(singleLine(receipt.footer));
  return details.join("\n") + "\n";
}

async function enqueue(db, { id, kind, tenantId = null, payload = {}, runAt = Date.now(), createdAt = runAt }) {
  await db.prepare(
    "INSERT INTO jobs(id,kind,tenant_id,payload,run_at,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
  ).run(id, kind, tenantId, JSON.stringify(payload), runAt, createdAt);
}

function createBilling({ storage, provider, plans, operatorName, receiptFooter }) {
  const { db } = storage;
  const orderById = (id) => db.prepare("SELECT * FROM orders WHERE id=?").get(id);
  const validPayment = (payment, order) => payment &&
    paymentRef.test(payment.id) && payment.order_id === order.id &&
    payment.amount === order.amount && payment.currency === order.currency;
  const paid = (status) => ["paid", "partially_refunded", "refunded"].includes(status);

  async function confirm(orderId, payment, { tenantId, repeat = false, allowPartial = false, now = Date.now() } = {}) {
    return storage.transaction(async () => {
      const order = await orderById(orderId);
      if (!order || (tenantId && tenantId !== order.tenant_id)) S.fail(404, "Order not found.");
      if (paid(order.status)) {
        if (repeat && order.payment_id === payment?.id) return false;
        S.fail(409, "Order has already been processed.");
      }
      if (!validPayment(payment, order) || payment.status !== "captured" ||
          payment.captured !== true || payment.refunded ||
          (payment.amount_refunded > 0 && !allowPartial))
        S.fail(409, "Payment has not been captured for this order and amount. Access was not changed.");
      const current = await storage.tenant(order.tenant_id);
      if (!current || current.plan.status === "deleting") S.fail(409, "Workspace no longer exists. Contact support for reconciliation.");
      const duplicate = await db.prepare("SELECT id FROM orders WHERE payment_id=?").get(payment.id);
      if (duplicate) S.fail(409, "Payment has already been applied.");
      const period = paymentPeriod(
        termKey(order.cycle),
        current.plan.status === "active" ? current.plan.expiresAt : null,
        now,
      );
      const plan = plans[order.plan_id];
      const paidAt = new Date(now).toISOString();
      // Group the customer-facing sequence by the calendar month in India.
      const month = new Date(now + 19800000).toISOString().slice(0, 7).replace("-", "");
      const { value } = await db.prepare(
        "INSERT INTO billing_receipt_counters(month,value) VALUES(?,1) ON CONFLICT(month) DO UPDATE SET value=billing_receipt_counters.value+1 RETURNING value",
      ).get(month);
      const number = "RK-" + month + "-" + String(value).padStart(6, "0");
      const receipt = {
        id: crypto.randomUUID(), number,
        businessName: current.location.name, operatorName, footer: receiptFooter,
        planName: plan.name, amount: order.amount, currency: order.currency,
        term: /^\d+$/.test(order.cycle) ? order.cycle + " calendar month(s)" : (order.cycle === "annual" ? "365 days" : "30 days"),
        ...period, paidAt, paymentId: payment.id, orderId: order.id,
      };
      current.plan = { tier: order.plan_id, name: plan.name, status: "active", billingCycle: order.cycle, ...period,
        ...(current.plan.suspendedByAdmin ? { suspendedByAdmin: true } : {}), };
      current.receipts.unshift(receipt);
      await db.prepare("UPDATE orders SET status='paid',payment_id=? WHERE id=?").run(payment.id, order.id);
      await storage.save(current);
      await storage.event(current.id, "plan_activated");
      await enqueue(db, {
        id: "receipt:" + order.id, kind: "email.outbox", tenantId: current.id,
        payload: { to: current.user.email, subject: "ReviewKare receipt " + number, text: receiptText(receipt) },
        runAt: now,
      });
      return true;
    });
  }

  async function refund(order, payment) {
    if (!validPayment(payment, order) ||
        !Number.isSafeInteger(payment.amount_refunded) || payment.amount_refunded < 1 ||
        payment.amount_refunded > order.amount)
      S.fail(409, "Provider refund could not be matched to this order.");
    if (order.payment_id && order.payment_id !== payment.id)
      S.fail(409, "Refund payment differs from the recorded payment.");
    if (payment.amount_refunded <= order.refund_amount) return;
    if (!order.payment_id && payment.amount_refunded < order.amount) {
      await confirm(order.id, payment, { allowPartial: true });
    }
    const status = payment.amount_refunded === order.amount ? "refunded" : "partially_refunded";
    await db.prepare("UPDATE orders SET status=?,refund_amount=?,payment_id=? WHERE id=?")
      .run(status, payment.amount_refunded, payment.id, order.id);
    const workspace = await storage.tenant(order.tenant_id);
    if (workspace) {
      const receipt = workspace.receipts.find(record => record.paymentId === payment.id);
      if (receipt) {
        receipt.refundAmount = payment.amount_refunded;
        receipt.status = status;
        await storage.save(workspace);
      }
      await storage.event(workspace.id, status === "refunded" ? "payment_refunded" : "payment_partially_refunded");
    }
  }

  async function webhook(eventId, event) {
    if (await db.prepare("SELECT 1 FROM webhook_events WHERE id=?").get(eventId)) return;
    const kind = event?.event;
    if (!["payment.captured", "payment.failed", "refund.processed"].includes(kind)) return;
    let payment = event.payload?.payment?.entity;
    if (kind === "refund.processed") {
      const entity = event.payload?.refund?.entity;
      if (entity?.status !== "processed" || !paymentRef.test(entity.payment_id || ""))
        S.fail(400, "Invalid refund event.");
      payment = await provider.razorpay("payments/" + entity.payment_id);
      if (payment.id !== entity.payment_id) S.fail(409, "Provider refund payment mismatch.");
    }
    if (!paymentRef.test(payment?.id) || !orderRef.test(payment?.order_id))
      S.fail(400, "Invalid payment event.");
    await storage.transaction(async () => {
      const added = await db.prepare(
        "INSERT INTO webhook_events(id,kind,processed_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING",
      ).run(eventId, kind, Date.now());
      if (!added.changes) return;
      const order = await orderById(payment.order_id);
      if (!order) return;
      if (!validPayment(payment, order)) S.fail(409, "Webhook payment does not match this order.");
      if (kind === "payment.captured") {
        await confirm(order.id, payment, { repeat: true });
      } else if (kind === "refund.processed") {
        await refund(order, payment);
      } else if (order.status === "created") {
        await db.prepare("UPDATE orders SET status='failed' WHERE id=?").run(order.id);
      }
    });
  }

  async function reconcile(orderId, now = Date.now()) {
    const order = await orderById(orderId);
    if (!order || !orderRef.test(order.id) || order.status === "refunded") return;
    const response = order.payment_id
      ? { items: [await provider.razorpay("payments/" + encodeURIComponent(order.payment_id))] }
      : await provider.razorpay("orders/" + order.id + "/payments");
    const payment = response.items?.find(item => validPayment(item, order) &&
      (item.status === "captured" || item.status === "refunded"));
    if (!payment) {
      if (response.items?.some(item => validPayment(item, order) && item.status === "failed"))
        await db.prepare("UPDATE orders SET status='failed' WHERE id=? AND status='created'").run(order.id);
      return;
    }
    if (payment.amount_refunded > 0)
      await storage.transaction(async () => refund(await orderById(order.id), payment));
    else await confirm(order.id, payment, { repeat: true, now });
  }
  return { confirm, webhook, reconcile };
}

function webhookSignature(raw, signature, secrets) {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const supplied = Buffer.from(signature, "hex");
  return secrets.filter(Boolean).some(secret => crypto.timingSafeEqual(
    crypto.createHmac("sha256", secret).update(raw).digest(), supplied,
  ));
}

module.exports = { createBilling, receiptText, webhookSignature, enqueue };
