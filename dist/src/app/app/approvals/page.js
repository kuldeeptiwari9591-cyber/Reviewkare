"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HeldApprovalsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
function HeldApprovalsPage() {
    const [reviews, setReviews] = (0, react_1.useState)((0, db_1.getAllReviews)());
    const [copiedToken, setCopiedToken] = (0, react_1.useState)(null);
    const [loadingId, setLoadingId] = (0, react_1.useState)(null);
    const heldReviews = reviews.filter((r) => r.reply?.status === 'held');
    const handleApprove = async (reviewId) => {
        setLoadingId(reviewId);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });
            const json = await res.json();
            if (json.success && json.data) {
                setReviews(reviews.map((r) => (r.id === reviewId ? json.data : r)));
            }
        }
        catch (err) {
            // Handle err
        }
        finally {
            setLoadingId(null);
        }
    };
    const handleCopyLink = async (token) => {
        const fullUrl = `${window.location.origin}/a/${token}`;
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedToken(token);
            setTimeout(() => setCopiedToken(null), 2500);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 max-w-5xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center", children: (0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5" }) }), (0, jsx_runtime_1.jsxs)("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: ["Held Approvals Desk (", heldReviews.length, ")"] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 mt-1", children: "Reviews rated 1\u20133 stars are quarantined here to prevent tone-deaf automated responses or legal liabilities." })] }), heldReviews.length === 0 ? ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-12 h-12 text-emerald-600 mx-auto" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-base font-bold text-slate-900", children: "All Reviews Clear!" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500 max-w-sm mx-auto", children: "There are no pending held reviews. All positive 4\u20135 star reviews are being handled automatically by Autopilot." }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/app/reviews", className: "inline-block mt-2 text-xs font-bold text-emerald-600 hover:underline", children: "View all Google reviews \u2192" })] })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-5", children: heldReviews.map((review) => {
                    const reply = review.reply;
                    const token = reply?.approvalToken;
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl border-2 border-amber-200/90 shadow-md p-6 space-y-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-sm text-slate-900", children: review.reviewerName }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: [1, 2, 3, 4, 5].map((s) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: `w-3.5 h-3.5 ${s <= review.rating
                                                                ? 'text-amber-400 fill-amber-400'
                                                                : 'text-slate-200'}` }, s))) })] }), (0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] text-slate-400", children: ["Received ", review.createdAt, " \u2022 Google Review ID: ", review.googleReviewId] })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300", children: "Awaiting Owner Decision" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed italic", children: ["\"", review.text, "\""] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-bold text-slate-700 flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-4 h-4 text-emerald-600" }), "De-escalating AI Draft:"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-slate-400", children: "Model: Gemini 1.5 Flash" })] }), (0, jsx_runtime_1.jsx)("div", { className: "p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal", children: reply?.draftText }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1", children: [(0, jsx_runtime_1.jsxs)("p", { className: "font-bold text-[11px] text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { className: "w-4 h-4 text-emerald-600" }), "Zero-Liability Safety Verification Passed"] }), (0, jsx_runtime_1.jsxs)("ul", { className: "list-disc list-inside text-[11px] text-slate-600 space-y-0.5", children: [(0, jsx_runtime_1.jsx)("li", { children: "No legal liability or negligence admitted." }), (0, jsx_runtime_1.jsx)("li", { children: "No unauthorized refund or compensation offered." }), (0, jsx_runtime_1.jsx)("li", { children: "Directs customer to manager telephone for offline de-escalation." })] })] })] }), token && ((0, jsx_runtime_1.jsxs)("div", { className: "p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-0.5", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold text-blue-900", children: "\uD83D\uDCF1 Instant SMS / Email One-Tap Approval Link:" }), (0, jsx_runtime_1.jsx)("p", { className: "text-blue-700 text-[11px]", children: "This link is sent to the owner's phone. Opens with zero login required." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => handleCopyLink(token), className: "px-3 py-1.5 rounded-lg border border-blue-300 bg-white hover:bg-blue-50 text-blue-800 font-semibold flex items-center gap-1 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { className: "w-3.5 h-3.5" }), copiedToken === token ? 'Link Copied!' : 'Copy SMS Link'] }), (0, jsx_runtime_1.jsxs)(link_1.default, { href: `/a/${token}`, target: "_blank", className: "px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors", children: ["Open ", (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-3.5 h-3.5" })] })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "pt-2 flex flex-col sm:flex-row items-center justify-end gap-3", children: [(0, jsx_runtime_1.jsx)(link_1.default, { href: `/app/reviews`, className: "w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 text-center hover:bg-slate-50 transition-colors", children: "Edit Draft in Feed" }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => handleApprove(review.id), disabled: loadingId === review.id, className: "w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }), loadingId === review.id ? 'Publishing to Google...' : 'Approve & Post to Google Maps'] })] })] }, review.id));
                }) }))] }));
}
