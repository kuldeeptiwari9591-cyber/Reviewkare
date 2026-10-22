'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Download,
  ShieldCheck,
  FileText,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function BillingPage() {
  const [autoPayActive, setAutoPayActive] = useState(true);

  const invoices = [
    { id: 'INV-2026-009', date: '01 Oct 2026', amount: 1592, status: 'Paid', gst: '₹243' },
    { id: 'INV-2026-008', date: '01 Sep 2026', amount: 1592, status: 'Paid', gst: '₹243' },
    { id: 'INV-2026-007', date: '01 Aug 2026', amount: 1592, status: 'Paid', gst: '₹243' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Plans</h1>
        <p className="text-xs text-slate-500">
          Manage your subscription in Indian Rupees (INR) with UPI AutoPay & GST compliance
        </p>
      </div>

      {/* ACTIVE PLAN CARD */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Active Subscription
            </span>
            <h2 className="text-2xl font-black text-white">Growth Plan</h2>
            <p className="text-xs text-slate-400">Next renewal on 15 Nov 2026 via UPI AutoPay</p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-3xl font-black text-white">₹1,349</div>
            <p className="text-[11px] text-slate-400">+ 18% GST (₹242.82)</p>
          </div>
        </div>

        {/* Usage Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400 text-[11px]">AI Review Replies</span>
            <p className="font-bold text-base text-white mt-1">42 / Unlimited</p>
            <p className="text-[10px] text-emerald-400 mt-0.5">100% replied</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400 text-[11px]">Active QR Codes</span>
            <p className="font-bold text-base text-white mt-1">3 of 3 Active</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Table, Counter, Staff</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs">
            <span className="text-slate-400 text-[11px]">Customer AI Drafts</span>
            <p className="font-bold text-base text-white mt-1">197 of 300</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Resets next cycle</p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800">
          <span className="text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> UPI AutoPay Mandate Active (HDFC Bank)
          </span>

          <Link
            href="/pricing"
            className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
          >
            Upgrade to Pro (3 Locations) &rarr;
          </Link>
        </div>
      </div>

      {/* GST & INVOICE DETAILS */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            Tax & GST Invoicing Details
          </h2>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Verified GSTIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span className="text-slate-500 text-[11px]">Registered Legal Entity</span>
            <p className="font-bold text-slate-900 mt-0.5">Dr. Sharma Dental Healthcare Pvt Ltd</p>
          </div>
          <div>
            <span className="text-slate-500 text-[11px]">GSTIN</span>
            <p className="font-mono font-bold text-slate-900 mt-0.5">29AAACD1234F1Z5</p>
          </div>
        </div>
      </div>

      {/* PAST INVOICES */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-sm text-slate-900">Billing History & GST Receipts</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3">GST (18%)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{inv.id}</td>
                  <td className="py-3 px-3 text-slate-600">{inv.date}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{inv.amount}</td>
                  <td className="py-3 px-3 text-slate-500">{inv.gst}</td>
                  <td className="py-3 px-3">
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading GST Invoice ${inv.id} (PDF)`)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-end gap-1 ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
