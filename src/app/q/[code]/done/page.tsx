'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, ExternalLink, Heart, Sparkles } from 'lucide-react';
import { INITIAL_LOCATION } from '@/lib/store/db';

export default function QRConfirmationPage() {
  const searchParams = useSearchParams();
  const reviewText = searchParams?.get('text') || '';
  const [copied, setCopied] = useState(false);

  const handleCopyAgain = async () => {
    if (reviewText && navigator.clipboard) {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const googleWriteReviewUrl = `https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}`;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
          <Heart className="w-8 h-8 fill-emerald-600 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Thank You for Supporting Us!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your review helps local patients and visitors discover genuine care at{' '}
            <strong className="text-slate-900">{INITIAL_LOCATION.name}</strong>.
          </p>
        </div>

        {/* Reminder Box */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 text-xs text-amber-900">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" /> Reminder: Paste your text on Google
          </p>
          <p className="text-amber-800/90 leading-relaxed">
            Your draft was copied to your clipboard. If Google’s review window did not open, or if you need to paste again, tap the button below.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleCopyAgain}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            {copied ? 'Copied to Clipboard!' : 'Copy Review Text Again'}
          </button>

          <a
            href={googleWriteReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all"
          >
            <ExternalLink className="w-4 h-4" /> Open Google Maps Review Page
          </a>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          Powered by Replyo • Fair & Transparent Local Feedback
        </div>
      </div>
    </div>
  );
}
