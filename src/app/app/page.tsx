'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Star,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  QrCode,
  ArrowRight,
  TrendingUp,
  Languages,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { getAllReviews, INITIAL_LOCATION } from '@/lib/store/db';
import { Review } from '@/types';

export default function DashboardOverviewPage() {
  const [reviews, setReviews] = useState<Review[]>(getAllReviews());
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);

  // New review simulation form state
  const [simName, setSimName] = useState<string>('Deepak Sen');
  const [simRating, setSimRating] = useState<number>(5);
  const [simText, setSimText] = useState<string>(
    'Bohot badiya dental clinic hai Indiranagar me. Dr. Sharma and staff treat patients with lot of patience.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const heldReviews = reviews.filter((r) => r.reply?.status === 'held');

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: simName,
          rating: simRating,
          text: simText,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReviews([json.data, ...reviews]);
        setShowSimulateModal(false);
        setSimName('');
        setSimText('');
      }
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time reputation metrics for {INITIAL_LOCATION.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Simulate Incoming Review
          </button>
          <Link
            href="/q/sharma-dent-01"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" /> Open AI QR Page
          </Link>
        </div>
      </div>

      {/* Held Approvals Alert Banner */}
      {heldReviews.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-950">
                {heldReviews.length} Negative Review{heldReviews.length > 1 ? 's' : ''} Held for Approval
              </h3>
              <p className="text-xs text-amber-800/90">
                1–3 star reviews are quarantined with zero-liability AI drafts awaiting your confirmation.
              </p>
            </div>
          </div>
          <Link
            href="/app/approvals"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap self-start sm:self-center transition-colors"
          >
            Review & Approve &rarr;
          </Link>
        </div>
      )}

      {/* 4 CORE KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Google Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">4.8</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +0.2 this month
            </span>
          </div>
          <p className="text-[11px] text-slate-400">482 Total Google Reviews</p>
        </div>

        {/* Response Coverage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Response Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">99.6%</span>
            <span className="text-xs text-slate-400">vs 54% local avg</span>
          </div>
          <p className="text-[11px] text-slate-400">Google Local 3-Pack Priority</p>
        </div>

        {/* Response Velocity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Average Reply Time</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">4 mins</span>
            <span className="text-xs font-semibold text-emerald-600">Autopilot</span>
          </div>
          <p className="text-[11px] text-slate-400">Instant customer engagement</p>
        </div>

        {/* Labor Hours Saved */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">Owner Time Saved</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">18.5 hrs</span>
            <span className="text-xs text-slate-400">this month</span>
          </div>
          <p className="text-[11px] text-slate-400">~ ₹12,000 agency fee saved</p>
        </div>
      </div>

      {/* RECENT REVIEWS FEED */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">Recent Review Activity</h2>
            <p className="text-xs text-slate-500">
              Live updates synced with Google Business Profile
            </p>
          </div>
          <Link
            href="/app/reviews"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All ({reviews.length}) &rarr;
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {reviews.slice(0, 4).map((review) => (
            <div key={review.id} className="py-4 space-y-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900">{review.reviewerName}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {review.detectedLanguage.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{review.createdAt}</span>
                  {review.reply?.status === 'posted' ? (
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-Posted
                    </span>
                  ) : (
                    <Link
                      href="/app/approvals"
                      className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1 hover:bg-amber-200"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-600" /> Needs Approval
                    </Link>
                  )}
                </div>
              </div>

              {/* Review Text */}
              {review.text ? (
                <p className="text-xs text-slate-700 leading-relaxed">&quot;{review.text}&quot;</p>
              ) : (
                <p className="text-xs text-slate-400 italic">No comment left (Star-only review)</p>
              )}

              {/* Reply Preview */}
              {review.reply && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <span className="font-semibold text-slate-800 shrink-0">Reply:</span>
                  <p className="line-clamp-2 leading-relaxed">
                    {review.reply.finalText || review.reply.draftText}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SIMULATE INCOMING REVIEW MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Simulate Google Review Event</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Trigger a mock Google webhook to verify language detection, tone mirroring, and star-based autopilot routing.
            </p>

            <form onSubmit={handleSimulateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Anjali Nair"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSimRating(s)}
                      className="p-1 rounded hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= simRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700">{simRating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comment (Hindi, Hinglish, English)
                </label>
                <textarea
                  rows={3}
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Leave empty for star-only review..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isSubmitting ? 'Processing AI...' : 'Submit to Pipeline &rarr;'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
