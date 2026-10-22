'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Save,
  CheckCircle2,
  Zap,
  Phone,
  Mail,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { INITIAL_LOCATION } from '@/lib/store/db';
import { AutopilotLevel } from '@/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState(INITIAL_LOCATION);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Business Settings & Autopilot
        </h1>
        <p className="text-xs text-slate-500">
          Configure response tone, safety thresholds, and manager escalation contacts
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. AUTOPILOT MODE SELECTOR */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-sm text-slate-900">Autopilot Level</h2>
          </div>
          <p className="text-xs text-slate-500">
            Control how much autonomous authority Replyo has to publish directly to your Google profile.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              {
                id: 'negatives_held' as AutopilotLevel,
                title: 'Smart Autopilot (Recommended)',
                badge: 'Default',
                desc: '4–5 star reviews auto-post in minutes. 1–3 star negative reviews are held for your 1-tap approval.',
              },
              {
                id: 'full' as AutopilotLevel,
                title: 'Full Autopilot',
                badge: 'Hands-off',
                desc: 'Auto-publishes all ratings with safety-validated responses. Best for high-volume cafes.',
              },
              {
                id: 'approve_all' as AutopilotLevel,
                title: 'Manual Approval Only',
                badge: 'Maximum Control',
                desc: 'Nothing is published without explicit owner sign-off. Best for strict corporate chains.',
              },
            ].map((mode) => {
              const active = settings.autopilotLevel === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, autopilotLevel: mode.id })}
                  className={`text-left p-4 rounded-2xl border text-xs transition-all flex flex-col justify-between ${
                    active
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{mode.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {mode.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{mode.desc}</p>
                  </div>
                  {active && (
                    <span className="mt-3 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active Selection
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. BRAND TONE */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-sm text-slate-900">Brand Persona & Tone</h2>
          <p className="text-xs text-slate-500">
            Select the voice and character that represents your business across all languages.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {[
              { id: 'professional_clinical', name: 'Professional & Clinical', hint: 'Doctors, Dentists, Clinics' },
              { id: 'warm_friendly', name: 'Warm & Friendly', hint: 'Family restaurants, Salons' },
              { id: 'casual_modern', name: 'Casual & Modern', hint: 'Cafes, Gyms, Youth studios' },
              { id: 'traditional_polite', name: 'Traditional Polite', hint: 'Formal Hindi & English respect' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSettings({ ...settings, brandTone: t.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.brandTone === t.id
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-sm font-bold text-slate-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <p className="font-bold">{t.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{t.hint}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 3. ESCALATION CONTACTS */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">De-escalation Manager Contacts</h2>
          </div>
          <p className="text-xs text-slate-500">
            When a negative review is detected, the AI invites the unhappy customer to resolve their concern offline through this phone/email.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Mobile (For SMS & Public Reply)
              </label>
              <input
                type="text"
                value={settings.managerPhone}
                onChange={(e) => setSettings({ ...settings, managerPhone: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manager Support Email
              </label>
              <input
                type="email"
                value={settings.managerEmail}
                onChange={(e) => setSettings({ ...settings, managerEmail: e.target.value })}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 4. SAVE BUTTON BAR */}
        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Settings successfully saved!
            </span>
          ) : (
            <span className="text-xs text-slate-400">All changes apply instantly to next review</span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" /> Save Business Profile
          </button>
        </div>
      </form>
    </div>
  );
}
