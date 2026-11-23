"use strict";
const { openPostgres } = require("../src/server/postgres");
const { razorpay, refundKey } = require("../src/server/providers");

async function main() {
  const [requestId, paise, mode] = process.argv.slice(2);
  const amount = Number(paise);
  if (!/^[0-9a-f-]{36}$/i.test(requestId || "") || !/^\d+$/.test(paise || "") ||
      !Number.isSafeInteger(amount) || amount < 100 || (mode && mode !== "--apply")) {
    throw new Error("Usage: npm run refund:order -- <request-id> <paise> [--apply]");
  }
  if (!process.env.DATABASE_URL) throw new Error("A hosted database is required for this command.");
  const { db, close } = await openPostgres(process.env.DATABASE_URL);
  try {
    const request = await db.prepare("SELECT * FROM requests WHERE id=? AND kind='refund'").get(requestId);
    if (!request) throw new Error("Refund request was not found.");
    const { paymentId } = JSON.parse(request.document);
    if (!/^pay_[A-Za-z0-9]+$/.test(paymentId)) throw new Error("Invalid payment reference.");
    const order = await db.prepare("SELECT * FROM orders WHERE tenant_id=? AND payment_id=?")
      .get(request.tenant_id, paymentId);
    if (!order || !["paid", "partially_refunded", "refunded"].includes(order.status) || amount > order.amount)
      throw new Error("Refund does not match a paid order.");
    const key = refundKey(paymentId, amount);
    if (!mode) {
      console.log(JSON.stringify({ requestId, paymentId, amount, refunded: order.refund_amount, mode: "dry-run" }));
      return;
    }
    const refund = await razorpay("payments/" + paymentId + "/refund", {
      method: "POST", body: { amount, receipt: key }, refundKey: key,
    });
    if (refund.payment_id !== paymentId || refund.amount !== amount || !/^rfnd_[A-Za-z0-9]+$/.test(refund.id))
      throw new Error("Provider response could not be matched. Check Razorpay before retrying.");
    console.log(JSON.stringify({ refundId: refund.id, status: refund.status }));
  } finally {
    await close();
  }
}
main().catch((error) => {
  const safe = /^(Usage:|A hosted database|Refund request|Invalid payment|Refund does not match|Provider response)/.test(error.message);
  console.error(safe ? error.message : "Refund command failed. Check provider state before retrying.");
  process.exitCode = 1;
});
