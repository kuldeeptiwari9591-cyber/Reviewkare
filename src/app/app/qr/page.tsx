'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  ExternalLink,
  Plus,
  Users,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getQRCodes, INITIAL_LOCATION } from '@/lib/store/db';
import { QRCodeItem } from '@/types';
import QRCode from 'qrcode';

export default function QRStudioPage() {
  const [qrList, setQrList] = useState<QRCodeItem[]>(getQRCodes());
  const [selectedQR, setSelectedQR] = useState<QRCodeItem>(qrList[0]);
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<'counter_card' | 'table_tent' | 'bill_sticker' | 'standee'>('counter_card');
  const [languageOption, setLanguageOption] = useState<'bilingual' | 'english' | 'hindi'>('bilingual');
  const [copiedLink, setCopiedLink] = useState(false);

  // Re-generate QR preview when selectedQR changes
  useEffect(() => {
    async function updateQR() {
      if (selectedQR) {
        try {
          const url = `${window.location.origin}/q/${selectedQR.shortCode}`;
          const dataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 400,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          setPreviewDataUrl(dataUrl);
        } catch (e) {
          // Safe fail
        }
      }
    }
    updateQR();
  }, [selectedQR]);

  const handleCopyShortLink = async () => {
    const url = `${window.location.origin}/q/${selectedQR.shortCode}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const downloadPNG = () => {
    if (!previewDataUrl) return;
    const a = document.createElement('a');
    a.href = previewDataUrl;
    a.download = `replyo-${selectedQR.shortCode}.png`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI QR Studio</h1>
          <p className="text-xs text-slate-500">
            Generate print-ready physical collateral with dynamic short-links for {INITIAL_LOCATION.name}
          </p>
        </div>

        <Link
          href={`/q/${selectedQR.shortCode}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <ExternalLink className="w-4 h-4" /> Test Customer Mobile Flow
        </Link>
      </div>

      {/* Main Grid: Collateral Selector & Live Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: QR Codes List & Staff Badges */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active QR Touchpoints
            </h3>
            <div className="space-y-2">
              {qrList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedQR(item)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedQR.id === item.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                      {item.scansCount} scans
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Code: <code className="text-slate-700 font-mono">/q/{item.shortCode}</code>
                  </p>
                  {item.staffName && (
                    <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      Staff: {item.staffName}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Print Presets */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Print Template Preset
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'counter_card', name: 'A6 Counter Card' },
                { id: 'table_tent', name: 'A4 Table Tent' },
                { id: 'bill_sticker', name: '5×5 cm Bill Sticker' },
                { id: 'standee', name: 'Rollup Standee' },
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id as any)}
                  className={`py-2 px-3 rounded-xl border font-semibold text-center transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center / Right Column: Live Printable Card Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Print Preview ({selectedTemplate.replace('_', ' ').toUpperCase()})</h3>
                <p className="text-xs text-slate-500">High-resolution QR with quiet zone & bleed safe margins</p>
              </div>

              {/* Language toggle for print collateral */}
              <div className="flex items-center gap-1.5 text-xs">
                {(['bilingual', 'english', 'hindi'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLanguageOption(l)}
                    className={`capitalize px-2.5 py-1 rounded-lg border font-medium ${
                      languageOption === l
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* THE PHYSICAL CARD DESIGN PREVIEW */}
            <div className="max-w-sm mx-auto bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 rounded-3xl p-6 border-2 border-slate-300 shadow-xl text-center space-y-4">
              {/* Clinic Branding */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                  Google Verified Partner
                </span>
                <h4 className="font-extrabold text-base text-slate-900">{INITIAL_LOCATION.name}</h4>
                <p className="text-[11px] text-slate-500">{INITIAL_LOCATION.area}, {INITIAL_LOCATION.city}</p>
              </div>

              {/* Call to action heading */}
              <div className="space-y-1">
                <h5 className="font-black text-sm text-slate-900">
                  {languageOption === 'hindi'
                    ? 'अपनी राय साझा करें • 30 सेकंड में'
                    : languageOption === 'bilingual'
                    ? 'Loved your visit? Share feedback in 30s'
                    : 'Loved your visit? Leave a Google Review'}
                </h5>
                <p className="text-[11px] text-slate-600">
                  {languageOption === 'hindi'
                    ? 'QR स्कैन करें और आसान टैप से गूगल समीक्षा दें'
                    : 'Scan QR with phone camera • No typing required'}
                </p>
              </div>

              {/* QR Image */}
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 inline-block shadow-sm">
                {previewDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewDataUrl}
                    alt="Replyo Dynamic Google Review QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-1 pt-1">
                <p className="text-[11px] font-bold text-slate-700">
                  Powered by <span className="text-emerald-700">Replyo</span> • Zero Login
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  replyo.in/q/{selectedQR.shortCode}
                </p>
              </div>
            </div>

            {/* Export & Download Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyShortLink}
                  className="px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? 'Link Copied!' : 'Copy Short Link'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadPNG}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download PNG (High-Res)
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PDF (with Bleed)
                </button>
              </div>
            </div>
          </div>

          {/* QR Analytics Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Scans</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{selectedQR.scansCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">AI Drafts Created</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {selectedQR.draftsGeneratedCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Reviews Posted</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {selectedQR.reviewsCompletedCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
