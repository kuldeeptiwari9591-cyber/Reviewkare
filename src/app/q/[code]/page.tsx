'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Star,
  Copy,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Languages,
} from 'lucide-react';
import { INITIAL_LOCATION } from '@/lib/store/db';
import { CustomerQRSubmission } from '@/types';
import { generateCustomerQRDraft } from '@/lib/ai/qr-draft-engine';
import confetti from 'canvas-confetti';

export default function CustomerQRPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const shortCode = params.code;

  // Step state
  const [rating, setRating] = useState<number>(5);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Root Canal Treatment']);
  const [customService, setCustomService] = useState<string>('');
  const [qualityTags, setQualityTags] = useState<string[]>(['Painless Procedure', 'Clean & Hygienic']);
  const [staffName, setStaffName] = useState<string>('Dr. Sneha');
  const [ambienceTags, setAmbienceTags] = useState<string[]>(['Modern Equipment', 'Calm Ambience']);
  const [recommend, setRecommend] = useState<'yes' | 'maybe' | 'no'>('yes');
  const [language, setLanguage] = useState<'hi-en' | 'en' | 'hi'>('hi-en');
  const [length, setLength] = useState<'short' | 'detailed'>('short');

  const [aiDraft, setAiDraft] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Available options from clinic settings
  const clinicServices = INITIAL_LOCATION.services;
  const staffOptions = ['Dr. Sneha', 'Dr. Ananya Sharma', 'Reception Staff', 'Clinic Assistant'];
  const qualityOptions = [
    'Painless Procedure',
    'Gentle & Caring',
    'Clean & Hygienic',
    'Quick Service',
    'Affordable / Value',
    'Detailed Explanation',
  ];
  const ambienceOptions = ['Modern Equipment', 'Calm Ambience', 'Child Friendly', 'Hassle-Free Parking'];

  // Toggle helpers
  const toggleService = (item: string) => {
    setSelectedServices((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const toggleQuality = (tag: string) => {
    setQualityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleAmbience = (tag: string) => {
    setAmbienceTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Generate draft
  const handleGenerateDraft = () => {
    const allServices = [...selectedServices];
    if (customService.trim()) {
      allServices.push(customService.trim());
    }

    const submission: CustomerQRSubmission = {
      rating,
      selectedServices: allServices,
      qualityTags,
      staffName: staffName || undefined,
      ambienceTags,
      recommend,
      language,
      length,
    };

    const draft = generateCustomerQRDraft(submission, INITIAL_LOCATION.name);
    setAiDraft(draft);
    setIsEditing(false);
  };

  // Give review action: Copy text & open Google review URL
  const handleGiveReview = async () => {
    const textToCopy = aiDraft || 'Great clinic and service!';

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
      }
    } catch (err) {
      // Fallback
    }

    setIsCopied(true);

    // Fire celebratory confetti for happy customers
    if (rating >= 4) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fail
      }
    }

    // Google Place review write URL
    const googleWriteReviewUrl = `https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}`;

    // Open Google in new tab after 800ms
    setTimeout(() => {
      window.open(googleWriteReviewUrl, '_blank');
      router.push(`/q/${shortCode}/done?text=${encodeURIComponent(textToCopy)}`);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-md mx-auto space-y-5">
        {/* Business Header Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-black text-xl shadow-inner">
            D
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg">{INITIAL_LOCATION.name}</h1>
            <p className="text-xs text-slate-500">{INITIAL_LOCATION.area}, {INITIAL_LOCATION.city}</p>
          </div>
          <p className="text-xs text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-block font-medium">
            ✨ Quick 30-Second Google Review Helper
          </p>
        </div>

        {/* STEP 1: Star Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            1. How was your experience today?
          </label>
          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 rounded-lg hover:scale-115 transition-transform"
              >
                <Star
                  className={`w-9 h-9 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-semibold text-slate-700">
            {rating === 5 && '🌟 Outstanding experience!'}
            {rating === 4 && '😊 Very good experience'}
            {rating === 3 && '😐 Average experience'}
            {rating === 2 && '🙁 Below expectations'}
            {rating === 1 && '😡 Disappointed'}
          </p>
        </div>

        {/* STEP 2: What did you visit for? */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            2. What service / treatment did you receive?
          </label>
          <div className="flex flex-wrap gap-2">
            {clinicServices.map((service) => {
              const active = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Other treatment (optional)..."
            value={customService}
            onChange={(e) => setCustomService(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* STEP 3: Quality Highlights */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            3. What stood out about the service?
          </label>
          <div className="flex flex-wrap gap-2">
            {qualityOptions.map((tag) => {
              const active = qualityTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleQuality(tag)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 4: Staff & Ambience (Optional) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              4. Staff Mention (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {staffOptions.map((staff) => (
                <button
                  key={staff}
                  type="button"
                  onClick={() => setStaffName(staffName === staff ? '' : staff)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    staffName === staff
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {staff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Ambience Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {ambienceOptions.map((amb) => {
                const active = ambienceTags.includes(amb);
                return (
                  <button
                    key={amb}
                    type="button"
                    onClick={() => toggleAmbience(amb)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                      active
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {amb}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Would you recommend us to friends & family?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['yes', 'maybe', 'no'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRecommend(opt)}
                  className={`text-xs py-2 rounded-lg font-bold border capitalize transition-all ${
                    recommend === opt
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt === 'yes' ? '👍 Yes' : opt === 'maybe' ? '🤷 Maybe' : '👎 No'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* STEP 5: Language & Length Preference */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              5. Language & Length
            </label>
            <span className="text-[11px] text-slate-400">Your choice</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('hi-en')}
              className={`text-xs py-2 rounded-lg font-semibold border transition-all ${
                language === 'hi-en'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Hinglish
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`text-xs py-2 rounded-lg font-semibold border transition-all ${
                language === 'en'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`text-xs py-2 rounded-lg font-semibold border transition-all ${
                language === 'hi'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              हिंदी (Hindi)
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => setLength('short')}
              className={`text-xs py-1.5 rounded-lg font-medium border ${
                length === 'short'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              ⚡ Short & Punchy (1-2 lines)
            </button>
            <button
              type="button"
              onClick={() => setLength('detailed')}
              className={`text-xs py-1.5 rounded-lg font-medium border ${
                length === 'detailed'
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              📝 Detailed Review
            </button>
          </div>

          {/* Trigger button */}
          <button
            type="button"
            onClick={handleGenerateDraft}
            className="w-full mt-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" /> Generate AI Draft from My Choices
          </button>
        </div>

        {/* STEP 6: Review Draft & Google Handoff */}
        {aiDraft && (
          <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your Customized Review Draft
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-emerald-700 hover:text-emerald-900 font-semibold underline"
              >
                {isEditing ? 'Done Editing' : 'Edit Text'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                rows={4}
                value={aiDraft}
                onChange={(e) => setAiDraft(e.target.value)}
                className="w-full p-3 text-sm rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            ) : (
              <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal shadow-inner">
                {aiDraft}
              </div>
            )}

            <p className="text-[11px] text-emerald-800/90 leading-tight">
              💡 <em>This text was created strictly from the options you selected above. You can change any word before submitting on Google.</em>
            </p>

            {/* BIG ACTION: COPY & OPEN GOOGLE */}
            <button
              type="button"
              onClick={handleGiveReview}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Text Copied! Opening Google...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Give Review on Google Maps &rarr;
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 pb-8 space-y-1">
          <p>Powered by ReviewKaro • Zero Login • Direct Google Maps Handoff</p>
          <p>No rewards or discounts are given in exchange for reviews.</p>
        </div>
      </div>
    </div>
  );
}
