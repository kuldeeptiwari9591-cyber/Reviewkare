"use strict";
// Read-only provider comparison; never activates access or issues a refund implicitly.
const path = require("node:path");
const { DatabaseSync: Database } = require("node:sqlite");
const { razorpay } = require("../src/server/providers");
async function main() {
  if (!process.env.DATA_DIR) throw new Error("DATA_DIR is required.");
  const db = new Database(
    path.join(process.env.DATA_DIR, "reviewkare.sqlite"),
    { readOnly: true },
  );
  const orders = db
    .prepare(
      "SELECT id,status,amount,currency FROM orders ORDER BY expires DESC LIMIT 100",
    )
    .all();
  let mismatch = 0;
  for (const order of orders) {
    const actual = await razorpay("orders/" + encodeURIComponent(order.id));
    const matches =
      actual.amount === order.amount &&
      actual.currency === order.currency &&
      (order.status === "paid") === (actual.status === "paid");
    if (!matches) mismatch++;
    console.log(
      JSON.stringify({
        orderId: order.id,
        local: order.status,
        provider: actual.status,
        matches,
      }),
    );
  }
  db.close();
  if (mismatch) process.exitCode = 1;
}
main().catch(() => {
  console.error("Reconciliation failed. Check configuration/provider access.");
  process.exitCode = 1;
});
