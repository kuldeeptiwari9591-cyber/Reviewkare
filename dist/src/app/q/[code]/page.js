"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CustomerQRPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
const qr_draft_engine_1 = require("@/lib/ai/qr-draft-engine");
const canvas_confetti_1 = __importDefault(require("canvas-confetti"));
function CustomerQRPage({ params }) {
    const router = (0, navigation_1.useRouter)();
    const shortCode = params.code;
    // Step state
    const [rating, setRating] = (0, react_1.useState)(5);
    const [selectedServices, setSelectedServices] = (0, react_1.useState)(['Root Canal Treatment']);
    const [customService, setCustomService] = (0, react_1.useState)('');
    const [qualityTags, setQualityTags] = (0, react_1.useState)(['Painless Procedure', 'Clean & Hygienic']);
    const [staffName, setStaffName] = (0, react_1.useState)('Dr. Sneha');
    const [ambienceTags, setAmbienceTags] = (0, react_1.useState)(['Modern Equipment', 'Calm Ambience']);
    const [recommend, setRecommend] = (0, react_1.useState)('yes');
    const [language, setLanguage] = (0, react_1.useState)('hi-en');
    const [length, setLength] = (0, react_1.useState)('short');
    const [aiDraft, setAiDraft] = (0, react_1.useState)('');
    const [isEditing, setIsEditing] = (0, react_1.useState)(false);
    const [isCopied, setIsCopied] = (0, react_1.useState)(false);
    // Available options from clinic settings
    const clinicServices = db_1.INITIAL_LOCATION.services;
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
    const toggleService = (item) => {
        setSelectedServices((prev) => prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]);
    };
    const toggleQuality = (tag) => {
        setQualityTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };
    const toggleAmbience = (tag) => {
        setAmbienceTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };
    // Generate draft
    const handleGenerateDraft = () => {
        const allServices = [...selectedServices];
        if (customService.trim()) {
            allServices.push(customService.trim());
        }
        const submission = {
            rating,
            selectedServices: allServices,
            qualityTags,
            staffName: staffName || undefined,
            ambienceTags,
            recommend,
            language,
            length,
        };
        const draft = (0, qr_draft_engine_1.generateCustomerQRDraft)(submission, db_1.INITIAL_LOCATION.name);
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
        }
        catch (err) {
            // Fallback
        }
        setIsCopied(true);
        // Fire celebratory confetti for happy customers
        if (rating >= 4) {
            try {
                (0, canvas_confetti_1.default)({
                    particleCount: 80,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            }
            catch (e) {
                // Safe fail
            }
        }
        // Google Place review write URL
        const googleWriteReviewUrl = `https://search.google.com/local/writereview?placeid=${db_1.INITIAL_LOCATION.googlePlaceId}`;
        // Open Google in new tab after 800ms
        setTimeout(() => {
            window.open(googleWriteReviewUrl, '_blank');
            router.push(`/q/${shortCode}/done?text=${encodeURIComponent(textToCopy)}`);
        }, 700);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen bg-slate-100 py-6 px-4 sm:px-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-md mx-auto space-y-5", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center space-y-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-black text-xl shadow-inner", children: "D" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "font-extrabold text-slate-900 text-lg", children: db_1.INITIAL_LOCATION.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-slate-500", children: [db_1.INITIAL_LOCATION.area, ", ", db_1.INITIAL_LOCATION.city] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-emerald-700 bg-emerald-50 py-1 px-3 rounded-full inline-block font-medium", children: "\u2728 Quick 30-Second Google Review Helper" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500", children: "1. How was your experience today?" }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center justify-center gap-2 py-1", children: [1, 2, 3, 4, 5].map((star) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setRating(star), className: "p-1 rounded-lg hover:scale-115 transition-transform", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Star, { className: `w-9 h-9 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}` }) }, star))) }), (0, jsx_runtime_1.jsxs)("p", { className: "text-center text-xs font-semibold text-slate-700", children: [rating === 5 && '🌟 Outstanding experience!', rating === 4 && '😊 Very good experience', rating === 3 && '😐 Average experience', rating === 2 && '🙁 Below expectations', rating === 1 && '😡 Disappointed'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500", children: "2. What service / treatment did you receive?" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: clinicServices.map((service) => {
                                const active = selectedServices.includes(service);
                                return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => toggleService(service), className: `text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: service }, service));
                            }) }), (0, jsx_runtime_1.jsx)("input", { type: "text", placeholder: "Other treatment (optional)...", value: customService, onChange: (e) => setCustomService(e.target.value), className: "w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500", children: "3. What stood out about the service?" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: qualityOptions.map((tag) => {
                                const active = qualityTags.includes(tag);
                                return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => toggleQuality(tag), className: `text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${active
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: tag }, tag));
                            }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2", children: "4. Staff Mention (Optional)" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: staffOptions.map((staff) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setStaffName(staffName === staff ? '' : staff), className: `text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${staffName === staff
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: staff }, staff))) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2", children: "Ambience Tags" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: ambienceOptions.map((amb) => {
                                        const active = ambienceTags.includes(amb);
                                        return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => toggleAmbience(amb), className: `text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${active
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: amb }, amb));
                                    }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2", children: "Would you recommend us to friends & family?" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: ['yes', 'maybe', 'no'].map((opt) => ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setRecommend(opt), className: `text-xs py-2 rounded-lg font-bold border capitalize transition-all ${recommend === opt
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`, children: opt === 'yes' ? '👍 Yes' : opt === 'maybe' ? '🤷 Maybe' : '👎 No' }, opt))) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("label", { className: "text-xs font-bold uppercase tracking-wider text-slate-500", children: "5. Language & Length" }), (0, jsx_runtime_1.jsx)("span", { className: "text-[11px] text-slate-400", children: "Your choice" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setLanguage('hi-en'), className: `text-xs py-2 rounded-lg font-semibold border transition-all ${language === 'hi-en'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'}`, children: "Hinglish" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setLanguage('en'), className: `text-xs py-2 rounded-lg font-semibold border transition-all ${language === 'en'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'}`, children: "English" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setLanguage('hi'), className: `text-xs py-2 rounded-lg font-semibold border transition-all ${language === 'hi'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'}`, children: "\u0939\u093F\u0902\u0926\u0940 (Hindi)" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setLength('short'), className: `text-xs py-1.5 rounded-lg font-medium border ${length === 'short'
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: "\u26A1 Short & Punchy (1-2 lines)" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setLength('detailed'), className: `text-xs py-1.5 rounded-lg font-medium border ${length === 'detailed'
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-slate-50 text-slate-600 border-slate-200'}`, children: "\uD83D\uDCDD Detailed Review" })] }), (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: handleGenerateDraft, className: "w-full mt-3 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Sparkles, { className: "w-4 h-4 text-emerald-400" }), " Generate AI Draft from My Choices"] })] }), aiDraft && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in slide-in-from-bottom-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between text-xs", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-bold text-emerald-900 flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-emerald-600" }), "Your Customized Review Draft"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setIsEditing(!isEditing), className: "text-emerald-700 hover:text-emerald-900 font-semibold underline", children: isEditing ? 'Done Editing' : 'Edit Text' })] }), isEditing ? ((0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: aiDraft, onChange: (e) => setAiDraft(e.target.value), className: "w-full p-3 text-sm rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" })) : ((0, jsx_runtime_1.jsx)("div", { className: "p-3.5 rounded-xl bg-white border border-emerald-200 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-normal shadow-inner", children: aiDraft })), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-emerald-800/90 leading-tight", children: ["\uD83D\uDCA1 ", (0, jsx_runtime_1.jsx)("em", { children: "This text was created strictly from the options you selected above. You can change any word before submitting on Google." })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleGiveReview, className: "w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]", children: isCopied ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-5 h-5 text-white" }), "Text Copied! Opening Google..."] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-5 h-5" }), "Give Review on Google Maps \u2192"] })) })] })), (0, jsx_runtime_1.jsxs)("div", { className: "text-center text-[11px] text-slate-400 pb-8 space-y-1", children: [(0, jsx_runtime_1.jsx)("p", { children: "Powered by Replyo \u2022 Zero Login \u2022 Direct Google Maps Handoff" }), (0, jsx_runtime_1.jsx)("p", { children: "No rewards or discounts are given in exchange for reviews." })] })] }) }));
}
