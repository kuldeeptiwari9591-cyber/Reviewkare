'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, QrCode, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const isApp = pathname?.startsWith('/app');
  const isQR = pathname?.startsWith('/q/');
  const isApproval = pathname?.startsWith('/a/');

  // If on customer QR or 1-tap approval page, show minimal top bar
  if (isQR || isApproval) {
    return (
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 py-3 px-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              R
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base">Replyo</span>
          </div>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Feedback
          </span>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">Replyo</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  India
                </span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-0.5 font-medium">Google Review Autopilot & AI QR</p>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className={`hover:text-emerald-600 transition-colors ${
                pathname === '/' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Overview
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-emerald-600 transition-colors ${
                pathname === '/pricing' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Pricing (INR)
            </Link>
            <Link
              href="/free-audit"
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1 ${
                pathname === '/free-audit' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Free Audit
            </Link>
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/q/sharma-dent-01"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" /> Try Customer QR
          </Link>

          <Link
            href="/app"
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Owner App <span className="hidden sm:inline font-normal opacity-90">Dashboard</span> &rarr;
          </Link>
        </div>
      </div>
    </header>
  );
}
