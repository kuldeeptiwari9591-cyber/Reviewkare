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

const BILLING_DAYS = Object.freeze({ monthly: 30, annual: 365 });
const PREPAID_MONTHS = Object.freeze([1, 3, 6, 12]);
function pricedPlans(raw) {
  if (!raw) return PLANS;
  let prices;
  try { prices = JSON.parse(raw); } catch {}
  const plans = {};
  for (const [id, plan] of Object.entries(PLANS)) {
    const terms = PREPAID_MONTHS.map(months => {
      const amount = prices?.[id]?.[months];
      if (!Number.isSafeInteger(amount) || amount < 100 || amount > 100000000)
        throw new Error("BILLING_TERM_PRICES must provide valid paise amounts for each plan and duration.");
      return { key: String(months), months, amount, label: months + (months === 1 ? " month" : " months") };
    });
    const replies = { basic: 50, growth: 300, pro: 1000 }[id];
    plans[id] = { ...plan, name: id === "basic" ? "Starter" : plan.name, reviews: replies, ai: id !== "basic", syncMinutes: id === "basic" ? 25 : 15, terms };
  }
  return plans;
}

function planTerms(plan) {
  return plan.terms || Object.entries(BILLING_DAYS).map(([key, days]) => ({
    key, days, amount: plan[key], label: days + " days",
  }));
}

function termKey(value) {
  if (typeof value !== "string") return null;
  if (Object.hasOwn(BILLING_DAYS, value)) return value;
  return /^[136]$|^12$/.test(value) ? Number(value) : null;
}

function paymentPeriod(term, currentExpiry, now = Date.now()) {
  const previous = Date.parse(currentExpiry);
  const start = new Date(Math.max(now, Number.isFinite(previous) ? previous : 0));
  const end = new Date(start);
  if (Object.hasOwn(BILLING_DAYS, term)) {
    end.setUTCDate(end.getUTCDate() + BILLING_DAYS[term]);
  } else if (PREPAID_MONTHS.includes(term)) {
    const day = end.getUTCDate();
    end.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + term);
    const lastDay = new Date(end);
    lastDay.setUTCMonth(lastDay.getUTCMonth() + 1, 0);
    end.setUTCDate(Math.min(day, lastDay.getUTCDate()));
  } else {
    throw new Error("Unsupported prepaid period.");
  }
  return { startsAt: start.toISOString(), expiresAt: end.toISOString() };
}

function entitlement(store, plans = PLANS) {
  const active = !store.plan.suspendedByAdmin && Date.parse(store.plan.expiresAt) > Date.now();
  return { active, ...(plans[store.plan.tier] || plans.basic) };
}
module.exports = { PLANS, planTerms, pricedPlans, termKey, paymentPeriod, money, entitlement };
