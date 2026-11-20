"use strict";
// One source for checkout, receipts, entitlements, and public pricing.
const PLANS = {
  basic: {
    name: "Basic",
    monthly: 74900,
    annual: 749000,
    reviews: 80,
    drafts: 50,
  },
  growth: {
    name: "Growth",
    monthly: 134900,
    annual: 1349000,
    reviews: 500,
    drafts: 300,
  },
  pro: {
    name: "Pro",
    monthly: 194900,
    annual: 1949000,
    reviews: 1000,
    drafts: 1000,
  },
};
const money = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
function entitlement(store) {
  const active = Date.parse(store.plan.expiresAt) > Date.now();
  return { active, ...(PLANS[store.plan.tier] || PLANS.basic) };
}
module.exports = { PLANS, money, entitlement };
