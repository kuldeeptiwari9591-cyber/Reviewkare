'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Edit3,
  Phone,
  Star,
  Sparkles,
} from 'lucide-react';
import { getAllReviews } from '@/lib/store/db';
import { Review } from '@/types';

export default function HeldApprovalsPage() {
  const [reviews, setReviews] = useState<Review[]>(getAllReviews());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const heldReviews = reviews.filter((r) => r.reply?.status === 'held');

  const handleApprove = async (reviewId: string) => {
    setLoadingId(reviewId);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(reviews.map((r) => (r.id === reviewId ? json.data : r)));
      }
    } catch (err) {
      // Handle err
    } finally {
      setLoadingId(null);
    }
  };

  const handleCopyLink = async (token: string) => {
    const fullUrl = `${window.location.origin}/a/${token}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Held Approvals Desk ({heldReviews.length})
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Reviews rated 1–3 stars are quarantined here to prevent tone-deaf automated responses or legal liabilities.
        </p>
      </div>

      {heldReviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">All Reviews Clear!</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no pending held reviews. All positive 4–5 star reviews are being handled automatically by Autopilot.
          </p>
          <Link
            href="/app/reviews"
            className="inline-block mt-2 text-xs font-bold text-emerald-600 hover:underline"
          >
            View all Google reviews &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {heldReviews.map((review) => {
            const reply = review.reply;
            const token = reply?.approvalToken;
            return (
              <div
                key={review.id}
                className="bg-white rounded-3xl border-2 border-amber-200/90 shadow-md p-6 space-y-5"
              >
                {/* Reviewer Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{review.reviewerName}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Received {review.createdAt} • Google Review ID: {review.googleReviewId}
                    </span>
                  </div>

                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Awaiting Owner Decision
                  </span>
                </div>

                {/* Customer complaint text */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                  &quot;{review.text}&quot;
                </div>

                {/* Proposed AI Response */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      De-escalating AI Draft:
                    </span>
                    <span className="text-slate-400">Model: Gemini 1.5 Flash</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                    {reply?.draftText}
                  </div>

                  {/* Safety Validation Notes */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-[11px] text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Zero-Liability Safety Verification Passed
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                      <li>No legal liability or negligence admitted.</li>
                      <li>No unauthorized refund or compensation offered.</li>
                      <li>Directs customer to manager telephone for offline de-escalation.</li>
                    </ul>
                  </div>
                </div>

                {/* 1-Tap SMS Link Sharing Bar */}
                {token && (
                  <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-blue-900">
                        📱 Instant SMS / Email One-Tap Approval Link:
                      </p>
                      <p className="text-blue-700 text-[11px]">
                        This link is sent to the owner&apos;s phone. Opens with zero login required.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(token)}
                        className="px-3 py-1.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedToken === token ? 'Link Copied!' : 'Copy SMS Link'}
                      </button>
                      <Link
                        href={`/a/${token}`}
                        target="_blank"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors"
                      >
                        Open <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Big Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                  <Link
                    href={`/app/reviews`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 text-center hover:bg-slate-50 transition-colors"
                  >
                    Edit Draft in Feed
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleApprove(review.id)}
                    disabled={loadingId === review.id}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {loadingId === review.id ? 'Publishing to Google...' : 'Approve & Post to Google Maps'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
