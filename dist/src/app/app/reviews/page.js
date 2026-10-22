"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AllReviewsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
const utils_1 = require("@/lib/utils");
function AllReviewsPage() {
    const [reviews, setReviews] = (0, react_1.useState)((0, db_1.getAllReviews)());
    const [filterRating, setFilterRating] = (0, react_1.useState)('all');
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [editingReviewId, setEditingReviewId] = (0, react_1.useState)(null);
    const [editText, setEditText] = (0, react_1.useState)('');
    const [loadingAction, setLoadingAction] = (0, react_1.useState)(null);
    // Apply filters
    const filtered = reviews.filter((r) => {
        if (filterRating !== 'all') {
            if (filterRating === 'star-only') {
                if (!r.isStarOnly)
                    return false;
            }
            else {
                const ratingNum = parseInt(filterRating, 10);
                if (r.rating !== ratingNum)
                    return false;
            }
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchName = r.reviewerName.toLowerCase().includes(q);
            const matchText = r.text.toLowerCase().includes(q);
            const matchReply = (r.reply?.finalText || r.reply?.draftText || '').toLowerCase().includes(q);
            if (!matchName && !matchText && !matchReply)
                return false;
        }
        return true;
    });
    // Action: Regenerate
    const handleRegenerate = async (reviewId, styleMode) => {
        setLoadingAction(`${reviewId}-${styleMode}`);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'regenerate', styleMode }),
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
            setLoadingAction(null);
        }
    };
    // Action: Save Manual Edit
    const handleSaveEdit = async (reviewId) => {
        setLoadingAction(`${reviewId}-save`);
        try {
            const res = await fetch(`/api/reviews/${reviewId}/reply`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit', text: editText }),
            });
            const json = await res.json();
            if (json.success && json.data) {
                setReviews(reviews.map((r) => (r.id === reviewId ? json.data : r)));
                setEditingReviewId(null);
            }
        }
        catch (err) {
            // Handle err
        }
        finally {
            setLoadingAction(null);
        }
    };
    // Action: Approve
    const handleApprove = async (reviewId) => {
        setLoadingAction(`${reviewId}-approve`);
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
            setLoadingAction(null);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 max-w-6xl mx-auto", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Google Reviews Feed" }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-slate-500", children: ["Total ", reviews.length, " reviews synchronized with Google Maps Business Profile"] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap items-center gap-1.5", children: [
                                { id: 'all', label: 'All Reviews' },
                                { id: '5', label: '5 Stars ★' },
                                { id: '4', label: '4 Stars ★' },
                                { id: '3', label: '3 Stars ★' },
                                { id: '2', label: '2 Stars ★' },
                                { id: '1', label: '1 Star ★' },
                                { id: 'star-only', label: 'Star-Only' },
                            ].map((tab) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setFilterRating(tab.id), className: `text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${filterRating === tab.id
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'}`, children: tab.label }, tab.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Search, { className: "w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search reviewer or reply...", className: "text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500" })] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: filtered.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400", children: "No reviews match the selected filter." })) : (filtered.map((review) => {
                    const isEditing = editingReviewId === review.id;
                    const reply = review.reply;
                    return ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-all", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center", children: review.reviewerName.charAt(0) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-sm text-slate-900", children: review.reviewerName }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center", children: [1, 2, 3, 4, 5].map((s) => ((0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: `w-3.5 h-3.5 ${s <= review.rating
                                                                        ? 'text-amber-400 fill-amber-400'
                                                                        : 'text-slate-200'}` }, s))) })] }), (0, jsx_runtime_1.jsx)("span", { className: "text-[11px] text-slate-400", children: review.createdAt })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200", children: (0, utils_1.getLanguageLabel)(review.detectedLanguage) }), reply?.status === 'posted' ? ((0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-600" }), reply.isAutoPosted ? 'Auto-Posted' : 'Approved & Posted'] })) : ((0, jsx_runtime_1.jsxs)("span", { className: "text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.AlertTriangle, { className: "w-3.5 h-3.5 text-amber-600" }), " Held for Owner Approval"] }))] })] }), review.text ? ((0, jsx_runtime_1.jsxs)("p", { className: "text-xs sm:text-sm text-slate-800 leading-relaxed font-normal", children: ["\"", review.text, "\""] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400 italic", children: "No text left (Star-only Google review)" })), reply && ((0, jsx_runtime_1.jsxs)("div", { className: "p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-semibold text-slate-700", children: "Official Reply:" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [reply.status === 'held' && ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleApprove(review.id), disabled: loadingAction === `${review.id}-approve`, className: "text-xs font-bold px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all", children: "Approve & Post Now \u2192" })), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => {
                                                            if (isEditing) {
                                                                setEditingReviewId(null);
                                                            }
                                                            else {
                                                                setEditingReviewId(review.id);
                                                                setEditText(reply.draftText || reply.finalText || '');
                                                            }
                                                        }, className: "text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Edit3, { className: "w-3 h-3" }), isEditing ? 'Cancel Edit' : 'Edit Reply'] })] })] }), isEditing ? ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsx)("textarea", { rows: 3, value: editText, onChange: (e) => setEditText(e.target.value), className: "w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleSaveEdit(review.id), disabled: loadingAction === `${review.id}-save`, className: "text-xs px-3 py-1.5 rounded-lg bg-slate-900 text-white font-bold", children: "Save Draft" })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-wrap", children: reply.finalText || reply.draftText })), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 text-xs", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-[11px] text-slate-400 font-medium", children: "Regenerate style:" }), ['shorter', 'warmer', 'firmer'].map((mode) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleRegenerate(review.id, mode), disabled: loadingAction !== null, className: "text-[11px] capitalize px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors", children: mode }, mode)))] })] }))] }, review.id));
                })) })] }));
}
