"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OneTapApprovalPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const lucide_react_1 = require("lucide-react");
function OneTapApprovalPage({ params }) {
    const token = params.token;
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [reviewData, setReviewData] = (0, react_1.useState)(null);
    const [replyText, setReplyText] = (0, react_1.useState)('');
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [approved, setApproved] = (0, react_1.useState)(false);
    const [errorMsg, setErrorMsg] = (0, react_1.useState)('');
    // Fetch token details
    (0, react_1.useEffect)(() => {
        async function loadToken() {
            try {
                const res = await fetch(`/api/approvals/${token}`);
                const json = await res.json();
                if (json.success) {
                    setReviewData(json.data);
                    setReplyText(json.data.draftReply);
                    if (json.data.status === 'posted') {
                        setApproved(true);
                    }
                }
                else {
                    setErrorMsg(json.error || 'Token expired or not found.');
                }
            }
            catch (e) {
                setErrorMsg('Network error connecting to approval server.');
            }
            finally {
                setLoading(false);
            }
        }
        loadToken();
    }, [token]);
    // Handle 1-Tap Approve
    const handleApprove = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/approvals/${token}`, {
                method: 'POST',
            });
            const json = await res.json();
            if (json.success) {
                setApproved(true);
            }
            else {
                setErrorMsg(json.error || 'Could not approve reply.');
            }
        }
        catch (e) {
            setErrorMsg('Failed to approve reply.');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading && !reviewData) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" }) }));
    }
    if (errorMsg) {
        return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-slate-50 flex items-center justify-center p-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md w-full bg-white rounded-3xl p-6 border border-slate-200 shadow-md text-center space-y-4", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-12 h-12 text-amber-500 mx-auto" }), (0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-bold text-slate-900", children: "Approval Link Expired" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: errorMsg }), (0, jsx_runtime_1.jsx)(link_1.default, { href: "/app/approvals", className: "inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold", children: "Open Approvals Dashboard \u2192" })] }) }));
    }
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-slate-100 py-8 px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md mx-auto space-y-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-amber-600 shrink-0 mt-0.5" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-amber-900", children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold", children: "Held Review Needs Owner Approval" }), (0, jsx_runtime_1.jsx)("p", { className: "text-amber-800/90 mt-0.5", children: "This review received a low rating. Replyo held it to protect your legal and brand reputation." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-sm text-slate-900", children: reviewData.reviewerName }), (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] text-slate-400", children: reviewData.createdAt })] }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-0.5", children: [1, 2, 3, 4, 5].map((star) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: `w-4 h-4 ${star <= reviewData.rating
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-200'}` }, star))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed italic", children: ["\"", reviewData.comment, "\""] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold uppercase tracking-wider text-slate-500", children: "AI Proposed Response" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setIsEditing(!isEditing), className: "text-emerald-700 font-semibold underline hover:text-emerald-900", children: isEditing ? 'Save Changes' : 'Edit Text' })] }), isEditing ? ((0, jsx_runtime_1.jsx)("textarea", { rows: 5, value: replyText, onChange: (e) => setReplyText(e.target.value), className: "w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" })) : ((0, jsx_runtime_1.jsx)("div", { className: "p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-slate-800 text-xs leading-relaxed", children: replyText })), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1.5 pt-1", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold uppercase tracking-wider text-slate-400", children: "Zero-Liability Safety Verification" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1 text-xs", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-emerald-700 font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { className: "w-4 h-4 text-emerald-600" }), "No legal fault admitted or blame placed on staff"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-emerald-700 font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { className: "w-4 h-4 text-emerald-600" }), "No unauthorized financial refund promised"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 text-emerald-700 font-medium", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "w-4 h-4 text-emerald-600" }), "Directs customer to manager phone for offline resolution"] })] })] }), approved ? ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-xl bg-emerald-100 border border-emerald-300 text-center space-y-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-8 h-8 text-emerald-600 mx-auto" }), (0, jsx_runtime_1.jsx)("h3", { className: "font-bold text-sm text-emerald-900", children: "Reply Approved & Published to Google Maps!" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-emerald-700", children: "The customer has been notified and Google algorithm recorded the response." })] })) : ((0, jsx_runtime_1.jsxs)("button", { type: "button", disabled: loading, onClick: handleApprove, className: "w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-5 h-5" }), "Approve & Post to Google Maps (1-Tap)"] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "text-center", children: (0, jsx_runtime_1.jsx)(link_1.default, { href: "/app/approvals", className: "text-xs font-semibold text-slate-500 hover:text-slate-800", children: "Or open full approvals desk in Replyo \u2192" }) })] }) }));
}
