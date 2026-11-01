'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Languages,
  Zap,
  PhoneCall,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { detectLanguageAndScript, generateReviewReply } from '@/lib/ai/reply-engine';
import { INITIAL_LOCATION } from '@/lib/store/db';
import { Review } from '@/types';
import { formatINR } from '@/lib/utils';

export default function HomePage() {
  // Playground state
  const [testRating, setTestRating] = useState<number>(5);
  const [testName, setTestName] = useState<string>('Rahul Sharma');
  const [testText, setTestText] = useState<string>(
    'Root canal treatment karwaya Dr. Sharma se. Bohot hi smooth aur painless tha, staff is very polite and clinic is clean.'
  );
  const [testStyle, setTestStyle] = useState<'default' | 'shorter' | 'warmer' | 'firmer'>('default');

  const [annualBilling, setAnnualBilling] = useState<boolean>(false);

  // Generate reply for sandbox
  const simulatedReview: Review = {
    id: 'test-sandbox',
    locationId: INITIAL_LOCATION.id,
    googleReviewId: 'gbp_sandbox',
    reviewerName: testName || 'Customer',
    rating: testRating,
    text: testText,
    isStarOnly: testText.trim().length === 0,
    detectedLanguage: 'hi-en',
    detectedTone: testRating >= 4 ? 'positive' : 'frustrated',
    createdAt: 'Just now',
  };

  const output = generateReviewReply({
    review: simulatedReview,
    settings: INITIAL_LOCATION,
    styleMode: testStyle,
  });

  const loadPreset = (rating: number, name: string, text: string) => {
    setTestRating(rating);
    setTestName(name);
    setTestText(text);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold tracking-wide border border-emerald-300/60 shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Engineered for Indian Clinics, Salons & Restaurants
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Turn Google Reviews on Autopilot.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500">
              In Hindi, Hinglish & English.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed">
            Never let a review sit unanswered. <strong className="text-slate-900 font-semibold">4–5 star reviews</strong> get warm, SEO-optimized replies posted automatically in minutes. <strong className="text-slate-900 font-semibold">1–3 star negative reviews</strong> are safely held for 1-tap owner approval with zero liability admission. Plus, collect 3x more genuine reviews using our 30-second in-clinic AI QR flow.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Open Owner Dashboard <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="/q/sharma-dent-01"
              target="_blank"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition-all hover:border-slate-400"
            >
              <QrCode className="w-5 h-5 text-emerald-600" /> Try Customer QR Flow
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Google Policy Compliant
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> UPI AutoPay (No Credit Card Needed)
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Plans from ₹749/mo + GST Invoices
            </span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE AI ENGINE PLAYGROUND */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="font-bold text-base">Live Interactive Engine Sandbox</h3>
              </div>
              <p className="text-xs text-slate-400">
                Experience how ReviewKare detects language, mirrors tone, and guards your reputation in real time.
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() =>
                  loadPreset(
                    5,
                    'Rohit Kulkarni',
                    'Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                Hinglish 5★ (Clinic)
              </button>
              <button
                onClick={() =>
                  loadPreset(
                    5,
                    'मनोज कुमार',
                    'डॉक्टर शर्मा जी बहुत ही अनुभवी हैं। दांत में बहुत दर्द था लेकिन इलाज के बाद तुरंत राहत मिल गई। बहुत बढ़िया अस्पताल।'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                Hindi 5★ (Hospital)
              </button>
              <button
                onClick={() =>
                  loadPreset(
                    1,
                    'Priya Narang',
                    'Waited 45 mins past appointment time. Receptionist was completely dismissive and the doctor rushed through the consultation without explaining the procedure.'
                  )
                }
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 transition-colors"
              >
                Negative 1★ (Held)
              </button>
              <button
                onClick={() => loadPreset(5, 'Suresh Verma', '')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                Star-Only 5★ (No Text)
              </button>
            </div>
          </div>

          {/* Grid Layout: Input vs AI Response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left: Input Review Simulator */}
            <div className="p-6 sm:p-8 space-y-5 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Simulate Google Review Input
                </span>
                <span className="text-xs text-slate-400">Untrusted User Input</span>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setTestRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= testRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-slate-700">
                    {testRating} Star{testRating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="e.g. Anjali Mehta"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Comment (Hindi, Hinglish, English, or blank)
                </label>
                <textarea
                  rows={4}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  placeholder="Leave blank for star-only reviews..."
                />
              </div>

              {/* Style regeneration modifier */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tone Regeneration Modifier
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['default', 'shorter', 'warmer', 'firmer'] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTestStyle(style)}
                      className={`text-xs capitalize py-1.5 rounded-lg border font-medium transition-all ${
                        testStyle === style
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: AI Engine Output */}
            <div className="p-6 sm:p-8 space-y-5 bg-white flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Engine Pipeline Output
                  </span>

                  {/* Autopilot Status Badge */}
                  {output.isAutoPostEligible ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      AUTOPILOT: AUTO-POSTED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      HELD FOR OWNER APPROVAL
                    </span>
                  )}
                </div>

                {/* Linguistic & Safety Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                    <Languages className="w-3 h-3 text-slate-500" /> Language: {output.detectedLanguage.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-blue-600" /> Local SEO Weaved
                  </span>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Safety Check: PASSED
                  </span>
                </div>

                {/* The Generated Reply Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Official Reply from Dr. Sharma Dental:</span>
                    <span>Gemini 1.5 Flash</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {output.text}
                  </p>
                </div>

                {/* Safety notes explanation */}
                {!output.isAutoPostEligible && (
                  <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-800">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                      Zero-Liability Defense Active:
                    </p>
                    <p className="text-amber-800/90">
                      Negative 1–3 star reviews are never auto-posted. An instant SMS alert is dispatched to the clinic owner with a 1-tap approval link. No legal fault is admitted, and complaints are smoothly routed to the manager.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Preview */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Location: Indiranagar, Bengaluru</span>
                <Link
                  href="/app/approvals"
                  className="font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View Approvals Queue &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO CORE JOBS DETAILED */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for How India Actually Does Business
          </h2>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Traditional US software costs $300/mo, speaks only English, and locks you into annual contracts. ReviewKare solves the two hardest local reputation jobs in INR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Core Job 1 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">The Autonomous Review Responder</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Connect your Google Business Profile once. ReviewKare monitors incoming reviews 24/7 and crafts human-sounding replies matching the customer&apos;s exact language and slang.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Language & Dialect Mirroring:</strong> Fluent in Hindi, Hinglish, English, Tamil, Telugu, Kannada, Bengali & Marathi.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Star-Based Autopilot:</strong> 4–5 star reviews auto-post in minutes. 1–3 star negative reviews wait for your 1-tap approval.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero-Liability Safety Validator:</strong> Blocks refund promises, legal admissions of fault, or invented medical facts.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Tap SMS & Email Approvals:</strong> Approve or edit held replies on your phone in 3 seconds without logging in.
                </span>
              </li>
            </ul>
          </div>

          {/* Core Job 2 */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">In-Clinic AI QR Review Booster</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Happy customers rarely write reviews because typing on a phone is tedious. Our 30-second AI QR flow solves this completely without login.
              </p>
            </div>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>30-Second Tap Flow:</strong> Customer scans, taps what treatment they had, quality tags, and staff name.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>AI Draft Built ONLY from Customer Picks:</strong> Never invents dishes or praise. Generates authentic Hindi, Hinglish, or English.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>1-Tap Google Maps Handoff:</strong> Text copies automatically to clipboard and opens Google&apos;s direct review modal.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Print-Ready QR Studio:</strong> Download high-res A4 table tents, A6 counter cards, and staff QR badges.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. PLANS & PRICING PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple INR Pricing. No USD Shock.
          </h2>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            Month-to-month flexibility. Pay via UPI AutoPay. Full 18% GST invoices for tax credit.
          </p>

          {/* Toggle */}
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
              Annual Billing <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-extrabold">2 Months Free</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Basic */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">Basic</h3>
              <p className="text-xs text-slate-500">For single clinics & shops starting out</p>
              <div className="pt-2">
                <span className="text-4xl font-black text-slate-900">
                  {formatINR(annualBilling ? 7490 / 12 : 749)}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
                {annualBilling && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">₹7,490 billed annually</p>
                )}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1 Location
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 80 AI replies / month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1 AI QR Code
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hindi, Hinglish & English
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Email & Web Push alerts
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="mt-6 w-full py-2.5 text-center rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Choose Basic
            </Link>
          </div>

          {/* Growth (Popular) */}
          <div className="p-7 rounded-3xl bg-emerald-950 text-white border-2 border-emerald-500 flex flex-col justify-between shadow-xl relative scale-105">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Most Popular in India
            </div>
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-white">Growth</h3>
              <p className="text-xs text-emerald-200/80">For busy clinics, salons & cafes</p>
              <div className="pt-2">
                <span className="text-4xl font-black text-white">
                  {formatINR(annualBilling ? 13490 / 12 : 1349)}
                </span>
                <span className="text-xs text-emerald-300"> / month</span>
                {annualBilling && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">₹13,490 billed annually</p>
                )}
              </div>
              <ul className="space-y-2.5 text-xs text-emerald-100 pt-4 border-t border-emerald-800/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> <strong>Unlimited</strong> AI review replies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 3 Branch & Staff QR Codes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> One-tap SMS & Email approval links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Local SEO Keyword Weaving
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Weekly Report Card (PDF)
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="mt-6 w-full py-2.5 text-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-colors"
            >
              Get Started with Growth
            </Link>
          </div>

          {/* Pro */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <h3 className="font-bold text-xl text-slate-900">Pro</h3>
              <p className="text-xs text-slate-500">For multi-doctor clinics & franchises</p>
              <div className="pt-2">
                <span className="text-4xl font-black text-slate-900">
                  {formatINR(annualBilling ? 19490 / 12 : 1949)}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
                {annualBilling && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">₹19,490 billed annually</p>
                )}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> <strong>Up to 3 Locations</strong>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited AI replies & QR codes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Competitor Tracker (5 Competitors)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 5-Star Social Poster Generator
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Multi-seat team access (5 seats)
                </li>
              </ul>
            </div>
            <Link
              href="/pricing"
              className="mt-6 w-full py-2.5 text-center rounded-xl border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Choose Pro
            </Link>
          </div>
        </div>
      </section>

      {/* 5. INDIAN FOUNDER FAQ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions by Indian Business Owners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Everything you need to know about safety, compliance, and billing.
          </p>
        </div>

        <div className="space-y-3">
          <details className="p-5 rounded-2xl bg-white border border-slate-200/80 group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer flex justify-between items-center">
              Does this violate Google Maps or local review policies?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              No. ReviewKare connects directly via Google’s official Business Profile API. For customer reviews, the customer taps their choices, the AI drafts their text, and the customer copies and posts it themselves from their own personal Google account. We never publish fake reviews, gate negative reviews, or incentivize ratings.
            </p>
          </details>

          <details className="p-5 rounded-2xl bg-white border border-slate-200/80 group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer flex justify-between items-center">
              What if a customer leaves an angry 1-star review? Will the AI apologize blindly?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Never. Our Zero-Liability Guardrail blocks all admissions of fault, malpractice, or financial refunds. Furthermore, 1–3 star reviews are automatically held in drafts and sent to your phone via SMS/email with a 1-tap approval link so you always have the final say.
            </p>
          </details>

          <details className="p-5 rounded-2xl bg-white border border-slate-200/80 group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer flex justify-between items-center">
              Does the AI really understand Hinglish and Indian regional terms?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes. ReviewKare is natively tuned for Indian colloquialisms. It understands terms like <em>&quot;paisa wasool&quot;</em>, <em>&quot;ekdum badiya service&quot;</em>, <em>&quot;bohot time lagaya&quot;</em>, and replies respectfully with appropriate cultural phrasing.
            </p>
          </details>

          <details className="p-5 rounded-2xl bg-white border border-slate-200/80 group">
            <summary className="font-bold text-sm text-slate-900 cursor-pointer flex justify-between items-center">
              How does billing work? Can I pay with UPI?
              <span className="text-slate-400 group-open:rotate-180 transition-transform">&darr;</span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Yes, we support recurring UPI AutoPay (Google Pay, PhonePe, Paytm) and Indian debit/credit cards. Every invoice includes your GSTIN for full input tax credit claim.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
}
