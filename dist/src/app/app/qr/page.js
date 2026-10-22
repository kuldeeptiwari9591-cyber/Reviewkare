"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QRStudioPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
const qrcode_1 = __importDefault(require("qrcode"));
function QRStudioPage() {
    const [qrList, setQrList] = (0, react_1.useState)((0, db_1.getQRCodes)());
    const [selectedQR, setSelectedQR] = (0, react_1.useState)(qrList[0]);
    const [previewDataUrl, setPreviewDataUrl] = (0, react_1.useState)('');
    const [selectedTemplate, setSelectedTemplate] = (0, react_1.useState)('counter_card');
    const [languageOption, setLanguageOption] = (0, react_1.useState)('bilingual');
    const [copiedLink, setCopiedLink] = (0, react_1.useState)(false);
    // Re-generate QR preview when selectedQR changes
    (0, react_1.useEffect)(() => {
        async function updateQR() {
            if (selectedQR) {
                try {
                    const url = `${window.location.origin}/q/${selectedQR.shortCode}`;
                    const dataUrl = await qrcode_1.default.toDataURL(url, {
                        errorCorrectionLevel: 'H',
                        margin: 2,
                        width: 400,
                        color: {
                            dark: '#0f172a',
                            light: '#ffffff',
                        },
                    });
                    setPreviewDataUrl(dataUrl);
                }
                catch (e) {
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
        if (!previewDataUrl)
            return;
        const a = document.createElement('a');
        a.href = previewDataUrl;
        a.download = `replyo-${selectedQR.shortCode}.png`;
        a.click();
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "AI QR Studio" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-slate-500", children: ["Generate print-ready physical collateral with dynamic short-links for ", db_1.INITIAL_LOCATION.name] })] }), (0, jsx_runtime_1.jsxs)(link_1.default, { href: `/q/${selectedQR.shortCode}`, target: "_blank", className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-4 h-4" }), " Test Customer Mobile Flow"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "Active QR Touchpoints" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: qrList.map((item) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setSelectedQR(item), className: `w-full text-left p-3 rounded-xl border text-xs transition-all ${selectedQR.id === item.id
                                                ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                                                : 'border-slate-200 hover:bg-slate-50'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between font-bold text-slate-900", children: [(0, jsx_runtime_1.jsx)("span", { children: item.name }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded", children: [item.scansCount, " scans"] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-slate-500 mt-0.5", children: ["Code: ", (0, jsx_runtime_1.jsxs)("code", { className: "text-slate-700 font-mono", children: ["/q/", item.shortCode] })] }), item.staffName && ((0, jsx_runtime_1.jsxs)("span", { className: "inline-block mt-1 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded", children: ["Staff: ", item.staffName] }))] }, item.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "Print Template Preset" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
                                            { id: 'counter_card', name: 'A6 Counter Card' },
                                            { id: 'table_tent', name: 'A4 Table Tent' },
                                            { id: 'bill_sticker', name: '5×5 cm Bill Sticker' },
                                            { id: 'standee', name: 'Rollup Standee' },
                                        ].map((tpl) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setSelectedTemplate(tpl.id), className: `py-2 px-3 rounded-xl border font-semibold text-center transition-all ${selectedTemplate === tpl.id
                                                ? 'bg-slate-900 text-white border-slate-900'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: tpl.name }, tpl.id))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "lg:col-span-2 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between border-b border-slate-100 pb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h3", { className: "font-bold text-sm text-slate-900", children: ["Print Preview (", selectedTemplate.replace('_', ' ').toUpperCase(), ")"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "High-resolution QR with quiet zone & bleed safe margins" })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-1.5 text-xs", children: ['bilingual', 'english', 'hindi'].map((l) => ((0, jsx_runtime_1.jsx)("button", { onClick: () => setLanguageOption(l), className: `capitalize px-2.5 py-1 rounded-lg border font-medium ${languageOption === l
                                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: l }, l))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "max-w-sm mx-auto bg-gradient-to-b from-white via-slate-50 to-emerald-50/30 rounded-3xl p-6 border-2 border-slate-300 shadow-xl text-center space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-widest text-emerald-600", children: "Google Verified Partner" }), (0, jsx_runtime_1.jsx)("h4", { className: "font-extrabold text-base text-slate-900", children: db_1.INITIAL_LOCATION.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-slate-500", children: [db_1.INITIAL_LOCATION.area, ", ", db_1.INITIAL_LOCATION.city] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsx)("h5", { className: "font-black text-sm text-slate-900", children: languageOption === 'hindi'
                                                            ? 'अपनी राय साझा करें • 30 सेकंड में'
                                                            : languageOption === 'bilingual'
                                                                ? 'Loved your visit? Share feedback in 30s'
                                                                : 'Loved your visit? Leave a Google Review' }), (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] text-slate-600", children: languageOption === 'hindi'
                                                            ? 'QR स्कैन करें और आसान टैप से गूगल समीक्षा दें'
                                                            : 'Scan QR with phone camera • No typing required' })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white p-4 rounded-2xl border-2 border-slate-200 inline-block shadow-sm", children: previewDataUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                (0, jsx_runtime_1.jsx)("img", { src: previewDataUrl, alt: "Replyo Dynamic Google Review QR Code", className: "w-48 h-48 mx-auto" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-48 h-48 bg-slate-100 flex items-center justify-center text-xs text-slate-400", children: "Generating QR..." })) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 pt-1", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] font-bold text-slate-700", children: ["Powered by ", (0, jsx_runtime_1.jsx)("span", { className: "text-emerald-700", children: "Replyo" }), " \u2022 Zero Login"] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[10px] text-slate-400 font-mono", children: ["replyo.in/q/", selectedQR.shortCode] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-2", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: handleCopyShortLink, className: "px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "w-3.5 h-3.5" }), copiedLink ? 'Link Copied!' : 'Copy Short Link'] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: downloadPNG, className: "px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Download, { className: "w-3.5 h-3.5" }), " Download PNG (High-Res)"] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => window.print(), className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Printer, { className: "w-3.5 h-3.5" }), " Print PDF (with Bleed)"] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-3 gap-4 text-center", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 font-medium", children: "Total Scans" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-slate-900 mt-1", children: selectedQR.scansCount })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 font-medium", children: "AI Drafts Created" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-emerald-600 mt-1", children: selectedQR.draftsGeneratedCount })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 font-medium", children: "Reviews Posted" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-slate-900 mt-1", children: selectedQR.reviewsCompletedCount })] })] })] })] })] }));
}
