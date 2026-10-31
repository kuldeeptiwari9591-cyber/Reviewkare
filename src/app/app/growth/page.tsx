'use client';

import React from 'react';
import {
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Search,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { COMPETITORS, INITIAL_LOCATION } from '@/lib/store/db';

export default function GrowthAndCompetitorsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Growth & Competitor Benchmark
        </h1>
        <p className="text-xs text-slate-500">
          Local search visibility, competitor response gaps, and sentiment analysis for {INITIAL_LOCATION.name}
        </p>
      </div>

      {/* 1. COMPETITOR LEADERBOARD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Indiranagar Dental Market Benchmark
            </h2>
            <p className="text-xs text-slate-500">
              Comparing your Google Maps metrics against top 3 local competitors
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Rank: #1 in Response Velocity
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Clinic / Business</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Total Reviews</th>
                <th className="py-3 px-4">Unanswered Gap</th>
                <th className="py-3 px-4">Response Rate</th>
                <th className="py-3 px-4">Avg Velocity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {COMPETITORS.map((comp, idx) => {
                const isYou = idx === 0;
                return (
                  <tr
                    key={comp.name}
                    className={isYou ? 'bg-emerald-50/50 font-semibold' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      {isYou && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                      <span className={isYou ? 'text-emerald-950 font-bold' : 'text-slate-800'}>
                        {comp.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">★ {comp.rating}</td>
                    <td className="py-3.5 px-4 text-slate-600">{comp.totalReviews}</td>
                    <td className="py-3.5 px-4">
                      {comp.unansweredReviews === 0 ? (
                        <span className="text-emerald-600 font-bold">0 (Clean)</span>
                      ) : (
                        <span className="text-amber-600 font-bold">
                          {comp.unansweredReviews} unreplied
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">{comp.responseRate}%</td>
                    <td className="py-3.5 px-4 text-slate-600">{comp.averageResponseTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. LOCAL SEO KEYWORD WEAVING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              Local SEO Keyword Weaving
            </h2>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Active in Replies
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            ReviewKaro naturally embeds these search terms into positive replies, signaling geographic relevance to Google Maps Local 3-Pack:
          </p>

          <div className="space-y-2.5">
            {INITIAL_LOCATION.targetKeywords.map((kw, i) => (
              <div
                key={kw}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-slate-800">{kw}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">94 matches</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SENTIMENT THEMES ANALYSIS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            AI Review Sentiment Themes
          </h2>

          <p className="text-xs text-slate-500">
            Automated clustering of recurring topics mentioned by customers this month:
          </p>

          <div className="space-y-3 text-xs">
            {/* Topic 1 */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Painless Root Canal & Implants</span>
                <span className="text-emerald-600">92% Positive</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[92%]"></div>
              </div>
            </div>

            {/* Topic 2 */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Clinic Cleanliness & Hygiene</span>
                <span className="text-emerald-600">98% Positive</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[98%]"></div>
              </div>
            </div>

            {/* Topic 3 */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Appointment Punctuality</span>
                <span className="text-amber-600">68% Positive (Improvement Area)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[68%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
