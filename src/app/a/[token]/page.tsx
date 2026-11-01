'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { INITIAL_LOCATION } from '@/lib/store/db';

export default function OneTapApprovalPage({ params }: { params: { token: string } }) {
  const token = params.token;
  const [loading, setLoading] = useState(true);
  const [reviewData, setReviewData] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch token details
  useEffect(() => {
    async function loadToken() {
      try {
        const res = await fetch(`/api/approvals/${token}`);
        const json = await res.json();
        if (json.success) {
          setReviewData(json.data);
          setReplyText(json.data.draftReply);
          if (json.data.status === 'posted') {
            setApproved(true);
          }
        } else {
          setErrorMsg(json.error || 'Token expired or not found.');
        }
      } catch (e) {
        setErrorMsg('Network error connecting to approval server.');
      } finally {
        setLoading(false);
      }
    }
    loadToken();
  }, [token]);

  // Handle 1-Tap Approve
  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/${token}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setApproved(true);
      } else {
        setErrorMsg(json.error || 'Could not approve reply.');
      }
    } catch (e) {
      setErrorMsg('Failed to approve reply.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !reviewData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Approval Link Expired</h2>
          <p className="text-xs text-slate-500">{errorMsg}</p>
          <Link
            href="/app/approvals"
            className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
          >
            Open Approvals Dashboard &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-5">
        {/* Top Alert Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <p className="font-bold">Held Review Needs Owner Approval</p>
            <p className="text-amber-800/90 mt-0.5">
              This review received a low rating. ReviewKare held it to protect your legal and brand reputation.
            </p>
          </div>
        </div>

        {/* The Incoming Negative Review */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-slate-900">{reviewData.reviewerName}</span>
              <p className="text-[11px] text-slate-400">{reviewData.createdAt}</p>
            </div>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star: number) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= reviewData.rating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed italic">
            &quot;{reviewData.comment}&quot;
          </div>
        </div>

        {/* The AI Proposed Reply Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-500">
              AI Proposed Response
            </span>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-emerald-700 font-semibold underline hover:text-emerald-900"
            >
              {isEditing ? 'Save Changes' : 'Edit Text'}
            </button>
          </div>

          {isEditing ? (
            <textarea
              rows={5}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-slate-800 text-xs leading-relaxed">
              {replyText}
            </div>
          )}

          {/* Safety Checklist Badges */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Zero-Liability Safety Verification
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                No legal fault admitted or blame placed on staff
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                No unauthorized financial refund promised
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-medium">
                <Phone className="w-4 h-4 text-emerald-600" />
                Directs customer to manager phone for offline resolution
              </div>
            </div>
          </div>

          {/* THE 1-TAP APPROVAL BUTTON */}
          {approved ? (
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-emerald-900">
                Reply Approved & Published to Google Maps!
              </h3>
              <p className="text-xs text-emerald-700">
                The customer has been notified and Google algorithm recorded the response.
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleApprove}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve & Post to Google Maps (1-Tap)
            </button>
          )}
        </div>

        {/* Dashboard link */}
        <div className="text-center">
          <Link
            href="/app/approvals"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Or open full approvals desk in ReviewKare &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
