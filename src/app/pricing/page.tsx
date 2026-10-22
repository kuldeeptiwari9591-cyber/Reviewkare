'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Sparkles, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { PLANS } from '@/lib/store/db';
import { formatINR } from '@/lib/utils';

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(false);

  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Transparent Indian Pricing
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Invest in your Reputation, not USD conversion fees.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Priced in Indian Rupees (INR) for local clinics, salons, and restaurants. No locked annual contracts required. Pay month-to-month via UPI AutoPay.
        </p>

        {/* Toggle */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-3 p-1.5 rounded-xl bg-slate-200/80 border border-slate-300">
            <button
              onClick={() => setAnnualBilling(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !annualBilling ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnualBilling(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                annualBilling ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              Annual Billing{' '}
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold">
                2 Months Free
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {PLANS.map((plan) => {
          const isEnterprise = plan.id === 'enterprise';
          const isGrowth = plan.isPopular;
          const displayPrice = isEnterprise
            ? 'Contact Us'
            : formatINR(annualBilling ? plan.annualPrice / 12 : plan.monthlyPrice);

          return (
            <div
              key={plan.id}
              className={`p-6 rounded-3xl flex flex-col justify-between transition-all ${
                isGrowth
                  ? 'bg-emerald-950 text-white border-2 border-emerald-500 shadow-xl relative scale-105'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-sm'
              }`}
            >
              {isGrowth && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Most Popular in India
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className={`font-bold text-xl ${isGrowth ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-3">
                    <span className="text-3xl font-black">{displayPrice}</span>
                    {!isEnterprise && (
                      <span className={`text-xs ${isGrowth ? 'text-emerald-300' : 'text-slate-500'}`}>
                        {' '}
                        / month
                      </span>
                    )}
                    {annualBilling && !isEnterprise && (
                      <p className={`text-[11px] font-semibold mt-1 ${isGrowth ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{plan.annualPrice.toLocaleString('en-IN')} billed annually
                      </p>
                    )}
                  </div>
                </div>

                <ul
                  className={`space-y-2.5 text-xs pt-4 border-t ${
                    isGrowth ? 'border-emerald-800 text-emerald-100' : 'border-slate-100 text-slate-600'
                  }`}
                >
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          isGrowth ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link
                  href="/app"
                  className={`w-full block py-2.5 text-center rounded-xl font-bold text-xs transition-colors ${
                    isGrowth
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isEnterprise ? 'Talk to Sales &rarr;' : `Start with ${plan.name} &rarr;`}
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add-ons & Indian Trust */}
      <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 max-w-4xl mx-auto space-y-4">
        <h3 className="font-bold text-base text-slate-900">Optional Add-ons for Growing Brands</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900">Extra Location</p>
            <p className="text-emerald-600 font-black text-sm">₹699 / month</p>
            <p className="text-slate-500 text-[11px]">Add additional clinic branches on Pro plan</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900">SMS Alert Booster Pack</p>
            <p className="text-emerald-600 font-black text-sm">₹199 / 500 alerts</p>
            <p className="text-slate-500 text-[11px]">DLT-compliant transactional SMS in India</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
            <p className="font-bold text-slate-900">Done-for-You Setup</p>
            <p className="text-emerald-600 font-black text-sm">₹1,999 one-time</p>
            <p className="text-slate-500 text-[11px]">Custom tone calibration + QR printing shipment</p>
          </div>
        </div>
      </div>
    </div>
  );
}
