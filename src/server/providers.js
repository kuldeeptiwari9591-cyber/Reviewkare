"use strict";
const crypto = require("node:crypto");
const { fail } = require("./security");
async function razorpay(endpoint, { method = "GET", body, refundKey } = {}) {
  const key = process.env.RAZORPAY_KEY_ID,
    secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key || !secret || key.includes("placeholder"))
    fail(503, "Payments are not configured. No payment was taken.");
  let response;
  try {
    response = await fetch("https://api.razorpay.com/v1/" + endpoint, {
      method,
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization:
          "Basic " + Buffer.from(key + ":" + secret).toString("base64"),
        ...(refundKey ? { "X-Refund-Idempotency": refundKey } : {}),
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    fail(503, "Payment provider is temporarily unavailable. Try again later.");
  }
  if (!response.ok)
    fail(
      502,
      "Payment provider rejected the request. Contact support if you were charged.",
    );
  return response.json();
}
function signature(orderId, paymentId, value) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || typeof value !== "string" || !/^[a-f0-9]{64}$/i.test(value))
    return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest();
  return crypto.timingSafeEqual(expected, Buffer.from(value, "hex"));
}
async function sendMail(to, subject, content, { idempotencyKey } = {}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM)
    fail(
      503,
      "Email delivery is not configured. Contact support for account assistance.",
    );
  let result;
  try {
    result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        text: content,
      }),
    });
  } catch {
    fail(
      503,
      "Email delivery is temporarily unavailable. Please try again later.",
    );
  }
  if (!result.ok)
    fail(503, "Email delivery could not be accepted. Please try again later.");
}
function refundKey(paymentId, amount) {
  return "rk-refund-" + crypto.createHash("sha256").update(paymentId + ":" + amount).digest("hex").slice(0, 30);
}
module.exports = { razorpay, signature, sendMail, refundKey };
