'use client';

import React, { useState } from 'react';
import {
  Star,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Edit3,
  Languages,
} from 'lucide-react';
import { getAllReviews } from '@/lib/store/db';
import { Review } from '@/types';
import { getLanguageLabel } from '@/lib/utils';

export default function AllReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(getAllReviews());
  const [filterRating, setFilterRating] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Apply filters
  const filtered = reviews.filter((r) => {
    if (filterRating !== 'all') {
      if (filterRating === 'star-only') {
        if (!r.isStarOnly) return false;
      } else {
        const ratingNum = parseInt(filterRating, 10);
        if (r.rating !== ratingNum) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.reviewerName.toLowerCase().includes(q);
      const matchText = r.text.toLowerCase().includes(q);
      const matchReply = (r.reply?.finalText || r.reply?.draftText || '').toLowerCase().includes(q);
      if (!matchName && !matchText && !matchReply) return false;
    }
    return true;
  });

  // Action: Regenerate
  const handleRegenerate = async (
    reviewId: string,
    styleMode: 'default' | 'shorter' | 'warmer' | 'firmer'
  ) => {
    setLoadingAction(`${reviewId}-${styleMode}`);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate', styleMode }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(reviews.map((r) => (r.id === reviewId ? json.data : r)));
      }
    } catch (err) {
      // Handle err
    } finally {
      setLoadingAction(null);
    }
  };

  // Action: Save Manual Edit
  const handleSaveEdit = async (reviewId: string) => {
    setLoadingAction(`${reviewId}-save`);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', text: editText }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(reviews.map((r) => (r.id === reviewId ? json.data : r)));
        setEditingReviewId(null);
      }
    } catch (err) {
      // Handle err
    } finally {
      setLoadingAction(null);
    }
  };

  // Action: Approve
  const handleApprove = async (reviewId: string) => {
    setLoadingAction(`${reviewId}-approve`);
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
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Google Reviews Feed</h1>
          <p className="text-xs text-slate-500">
            Total {reviews.length} reviews synchronized with Google Maps Business Profile
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Star Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: '5', label: '5 Stars ★' },
              { id: '4', label: '4 Stars ★' },
              { id: '3', label: '3 Stars ★' },
              { id: '2', label: '2 Stars ★' },
              { id: '1', label: '1 Star ★' },
              { id: 'star-only', label: 'Star-Only' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterRating(tab.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filterRating === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviewer or reply..."
              className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Review List Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            No reviews match the selected filter.
          </div>
        ) : (
          filtered.map((review) => {
            const isEditing = editingReviewId === review.id;
            const reply = review.reply;
            return (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {review.reviewerName}
                        </span>
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
                      <span className="text-[11px] text-slate-400">{review.createdAt}</span>
                    </div>
                  </div>

                  {/* Status & Language Badges */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {getLanguageLabel(review.detectedLanguage)}
                    </span>

                    {reply?.status === 'posted' ? (
                      <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {reply.isAutoPosted ? 'Auto-Posted' : 'Approved & Posted'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Held for Owner Approval
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Text */}
                {review.text ? (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
                    &quot;{review.text}&quot;
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No text left (Star-only Google review)
                  </p>
                )}

                {/* Reply Section */}
                {reply && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Official Reply:</span>
                      <div className="flex items-center gap-2">
                        {reply.status === 'held' && (
                          <button
                            type="button"
                            onClick={() => handleApprove(review.id)}
                            disabled={loadingAction === `${review.id}-approve`}
                            className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                          >
                            Approve & Post Now &rarr;
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (isEditing) {
                              setEditingReviewId(null);
                            } else {
                              setEditingReviewId(review.id);
                              setEditText(reply.draftText || reply.finalText || '');
                            }
                          }}
                          className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          {isEditing ? 'Cancel Edit' : 'Edit Reply'}
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(review.id)}
                          disabled={loadingAction === `${review.id}-save`}
                          className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold"
                        >
                          Save Draft
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
                        {reply.finalText || reply.draftText}
                      </p>
                    )}

                    {/* Quick Regenerate Modifiers */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                      <span className="text-[11px] text-slate-400 font-medium">Regenerate style:</span>
                      {(['shorter', 'warmer', 'firmer'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleRegenerate(review.id, mode)}
                          disabled={loadingAction !== null}
                          className="text-[11px] capitalize px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors"
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
