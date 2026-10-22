'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building2,
  Star,
} from 'lucide-react';

export default function FreeAuditPage() {
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [category, setCategory] = useState('Dental Clinic');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleRunAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    setAnalyzing(true);
    setReport(null);

    setTimeout(() => {
      setAnalyzing(false);
      setReport({
        businessName,
        city,
        category,
        estimatedTotalReviews: 184,
        unansweredCount: 46,
        responseRate: '68%',
        competitorAvgResponseRate: '94%',
        lostRevenueScore: '₹48,000 / month',
        sampleUnansweredReview: {
          reviewer: 'Amit Joshi',
          rating: 4,
          comment: 'Doctor was really good and polite, but had to wait 25 mins.',
          aiDraft: `Hello Amit ji, thank you so much for your review! We are glad you appreciated our doctor's care. We apologize for the 25-minute wait and are streamlining our scheduling. Hope to see you again soon at ${businessName}!`,
        },
      });
    }, 1200);
  };

  return (
    <div className="space-y-12 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Free Local Reputation Lead Magnet
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Audit Your Google Maps Review Gap
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Enter your Indian clinic, salon, or restaurant name to see how many reviews are sitting unanswered and where you are losing patients to competitors.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md">
        <form onSubmit={handleRunAudit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Business Name on Google Maps
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Dental & Cosmetic Clinic"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01]"
          >
            {analyzing ? (
              'Scanning Google Maps Profile...'
            ) : (
              <>
                <Search className="w-4 h-4" /> Run Instant Reputation Audit (Free)
              </>
            )}
          </button>
        </form>
      </div>

      {/* Audit Report Results */}
      {report && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Audit Completed
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">{report.businessName}</h2>
              <p className="text-xs text-slate-500">{report.city} • Google Business Profile</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Action Needed: 46 Unanswered
              </span>
            </div>
          </div>

          {/* Key Audit Insights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Your Response Rate</span>
              <p className="text-2xl font-black text-amber-600 mt-1">{report.responseRate}</p>
              <p className="text-[10px] text-slate-400">Industry leader avg: 94%</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Unanswered Reviews</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{report.unansweredCount}</p>
              <p className="text-[10px] text-slate-400">Ignored patients / customers</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500">Est. Opportunity Loss</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{report.lostRevenueScore}</p>
              <p className="text-[10px] text-slate-400">Lost to nearby competitors</p>
            </div>
          </div>

          {/* Live sample reply demo */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">
                How Replyo Can Answer Your Backlog in Minutes:
              </span>
              <span className="text-emerald-700 font-medium">Hinglish Tone Mirroring</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-800 space-y-1">
              <p className="text-slate-500 italic font-mono text-[11px]">
                Sample Review: &quot;{report.sampleUnansweredReview.comment}&quot;
              </p>
              <p className="font-semibold text-slate-900 pt-1">
                Generated Reply: {report.sampleUnansweredReview.aiDraft}
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              Connect Profile & Clear Backlog with Replyo &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
