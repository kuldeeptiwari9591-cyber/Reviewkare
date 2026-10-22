"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QRConfirmationPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
function QRConfirmationPage() {
    const searchParams = (0, navigation_1.useSearchParams)();
    const reviewText = searchParams?.get('text') || '';
    const [copied, setCopied] = (0, react_1.useState)(false);
    const handleCopyAgain = async () => {
        if (reviewText && navigator.clipboard) {
            await navigator.clipboard.writeText(reviewText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };
    const googleWriteReviewUrl = `https://search.google.com/local/writereview?placeid=${db_1.INITIAL_LOCATION.googlePlaceId}`;
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-slate-50 py-12 px-4 flex items-center justify-center", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "w-8 h-8 fill-emerald-600 text-emerald-600" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Thank You for Supporting Us!" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-sm text-slate-600 leading-relaxed", children: ["Your review helps local patients and visitors discover genuine care at", ' ', (0, jsx_runtime_1.jsx)("strong", { className: "text-slate-900", children: db_1.INITIAL_LOCATION.name }), "."] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2 text-xs text-amber-900", children: [(0, jsx_runtime_1.jsxs)("p", { className: "font-bold flex items-center gap-1.5 text-amber-800", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-4 h-4 text-amber-600" }), " Reminder: Paste your text on Google"] }), (0, jsx_runtime_1.jsx)("p", { className: "text-amber-800/90 leading-relaxed", children: "Your draft was copied to your clipboard. If Google\u2019s review window did not open, or if you need to paste again, tap the button below." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 pt-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: handleCopyAgain, className: "w-full py-3 px-4 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "w-4 h-4 text-slate-500" }), copied ? 'Copied to Clipboard!' : 'Copy Review Text Again'] }), (0, jsx_runtime_1.jsxs)("a", { href: googleWriteReviewUrl, target: "_blank", rel: "noopener noreferrer", className: "w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-4 h-4" }), " Open Google Maps Review Page"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "pt-4 border-t border-slate-100 text-[11px] text-slate-400", children: "Powered by Replyo \u2022 Fair & Transparent Local Feedback" })] }) }));
}
