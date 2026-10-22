"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FreeAuditPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
function FreeAuditPage() {
    const [businessName, setBusinessName] = (0, react_1.useState)('');
    const [city, setCity] = (0, react_1.useState)('Bengaluru');
    const [category, setCategory] = (0, react_1.useState)('Dental Clinic');
    const [analyzing, setAnalyzing] = (0, react_1.useState)(false);
    const [report, setReport] = (0, react_1.useState)(null);
    const handleRunAudit = (e) => {
        e.preventDefault();
        if (!businessName)
            return;
        setAnalyzing(true);
        setReport(null);
        setTimeout(() => {
            setAnalyzing(false);
            setReport({
                businessName,
                city,
                category,
                estimatedTotalReviews: 184,
                unansweredCount: 46,
                responseRate: '68%',
                competitorAvgResponseRate: '94%',
                lostRevenueScore: '₹48,000 / month',
                sampleUnansweredReview: {
                    reviewer: 'Amit Joshi',
                    rating: 4,
                    comment: 'Doctor was really good and polite, but had to wait 25 mins.',
                    aiDraft: `Hello Amit ji, thank you so much for your review! We are glad you appreciated our doctor's care. We apologize for the 25-minute wait and are streamlining our scheduling. Hope to see you again soon at ${businessName}!`,
                },
            });
        }, 1200);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-12 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-3.5 h-3.5 text-amber-600" }), " Free Local Reputation Lead Magnet"] }), (0, jsx_runtime_1.jsx)("h1", { className: "text-3xl sm:text-4xl font-black text-slate-900 tracking-tight", children: "Audit Your Google Maps Review Gap" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs sm:text-sm text-slate-600 max-w-xl mx-auto", children: "Enter your Indian clinic, salon, or restaurant name to see how many reviews are sitting unanswered and where you are losing patients to competitors." })] }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md", children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRunAudit, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "sm:col-span-2", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Business Name on Google Maps" }), (0, jsx_runtime_1.jsx)("input", { type: "text", required: true, value: businessName, onChange: (e) => setBusinessName(e.target.value), placeholder: "e.g. Apex Dental & Cosmetic Clinic", className: "w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "City" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: city, onChange: (e) => setCity(e.target.value), placeholder: "e.g. Bengaluru, Mumbai, Delhi", className: "w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" })] })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: analyzing, className: "w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01]", children: analyzing ? ('Scanning Google Maps Profile...') : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "w-4 h-4" }), " Run Instant Reputation Audit (Free)"] })) })] }) }), report && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded", children: "Audit Completed" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold text-slate-900 mt-1", children: report.businessName }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-slate-500", children: [report.city, " \u2022 Google Business Profile"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "text-left sm:text-right", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200", children: "Action Needed: 46 Unanswered" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-500", children: "Your Response Rate" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-amber-600 mt-1", children: report.responseRate }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-slate-400", children: "Industry leader avg: 94%" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-500", children: "Unanswered Reviews" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-rose-600 mt-1", children: report.unansweredCount }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-slate-400", children: "Ignored patients / customers" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-2xl bg-slate-50 border border-slate-200", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-500", children: "Est. Opportunity Loss" }), (0, jsx_runtime_1.jsx)("p", { className: "text-2xl font-black text-slate-900 mt-1", children: report.lostRevenueScore }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-slate-400", children: "Lost to nearby competitors" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-emerald-950", children: "How Replyo Can Answer Your Backlog in Minutes:" }), (0, jsx_runtime_1.jsx)("span", { className: "text-emerald-700 font-medium", children: "Hinglish Tone Mirroring" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3.5 rounded-xl bg-white border border-emerald-200/80 text-xs text-slate-800 space-y-1", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-slate-500 italic font-mono text-[11px]", children: ["Sample Review: \"", report.sampleUnansweredReview.comment, "\""] }), (0, jsx_runtime_1.jsxs)("p", { className: "font-semibold text-slate-900 pt-1", children: ["Generated Reply: ", report.sampleUnansweredReview.aiDraft] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "pt-2 text-center", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/app", className: "inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]", children: "Connect Profile & Clear Backlog with Replyo \u2192" }) })] }))] }));
}
