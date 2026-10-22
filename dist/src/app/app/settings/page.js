"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
function SettingsPage() {
    const [settings, setSettings] = (0, react_1.useState)(db_1.INITIAL_LOCATION);
    const [saved, setSaved] = (0, react_1.useState)(false);
    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "space-y-6 max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-black text-slate-900 tracking-tight", children: "Business Settings & Autopilot" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "Configure response tone, safety thresholds, and manager escalation contacts" })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Zap, { className: "w-5 h-5 text-emerald-600" }), (0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-sm text-slate-900", children: "Autopilot Level" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "Control how much autonomous authority Replyo has to publish directly to your Google profile." }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2", children: [
                                    {
                                        id: 'negatives_held',
                                        title: 'Smart Autopilot (Recommended)',
                                        badge: 'Default',
                                        desc: '4–5 star reviews auto-post in minutes. 1–3 star negative reviews are held for your 1-tap approval.',
                                    },
                                    {
                                        id: 'full',
                                        title: 'Full Autopilot',
                                        badge: 'Hands-off',
                                        desc: 'Auto-publishes all ratings with safety-validated responses. Best for high-volume cafes.',
                                    },
                                    {
                                        id: 'approve_all',
                                        title: 'Manual Approval Only',
                                        badge: 'Maximum Control',
                                        desc: 'Nothing is published without explicit owner sign-off. Best for strict corporate chains.',
                                    },
                                ].map((mode) => {
                                    const active = settings.autopilotLevel === mode.id;
                                    return ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setSettings({ ...settings, autopilotLevel: mode.id }), className: `text-left p-4 rounded-2xl border text-xs transition-all flex flex-col justify-between ${active
                                            ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                                            : 'border-slate-200 hover:bg-slate-50'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-bold text-slate-900", children: mode.title }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700", children: mode.badge })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-[11px] text-slate-500 leading-relaxed", children: mode.desc })] }), active && ((0, jsx_runtime_1.jsxs)("span", { className: "mt-3 text-[11px] font-bold text-emerald-700 flex items-center gap-1", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-600" }), " Active Selection"] }))] }, mode.id));
                                }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-sm text-slate-900", children: "Brand Persona & Tone" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "Select the voice and character that represents your business across all languages." }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs", children: [
                                    { id: 'professional_clinical', name: 'Professional & Clinical', hint: 'Doctors, Dentists, Clinics' },
                                    { id: 'warm_friendly', name: 'Warm & Friendly', hint: 'Family restaurants, Salons' },
                                    { id: 'casual_modern', name: 'Casual & Modern', hint: 'Cafes, Gyms, Youth studios' },
                                    { id: 'traditional_polite', name: 'Traditional Polite', hint: 'Formal Hindi & English respect' },
                                ].map((t) => ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => setSettings({ ...settings, brandTone: t.id }), className: `p-3 rounded-xl border text-left transition-all ${settings.brandTone === t.id
                                        ? 'border-emerald-600 bg-emerald-50/60 shadow-sm font-bold text-slate-900'
                                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`, children: [(0, jsx_runtime_1.jsx)("p", { className: "font-bold", children: t.name }), (0, jsx_runtime_1.jsx)("p", { className: "text-[10px] text-slate-400 mt-1", children: t.hint })] }, t.id))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Phone, { className: "w-5 h-5 text-blue-600" }), (0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-sm text-slate-900", children: "De-escalation Manager Contacts" })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-500", children: "When a negative review is detected, the AI invites the unhappy customer to resolve their concern offline through this phone/email." }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Manager Mobile (For SMS & Public Reply)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: settings.managerPhone, onChange: (e) => setSettings({ ...settings, managerPhone: e.target.value }), className: "w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-semibold text-slate-700 mb-1", children: "Manager Support Email" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: settings.managerEmail, onChange: (e) => setSettings({ ...settings, managerEmail: e.target.value }), className: "w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between pt-2", children: [saved ? ((0, jsx_runtime_1.jsxs)("span", { className: "text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }), " Settings successfully saved!"] })) : ((0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-400", children: "All changes apply instantly to next review" })), (0, jsx_runtime_1.jsxs)("button", { type: "submit", className: "px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Save, { className: "w-4 h-4" }), " Save Business Profile"] })] })] })] }));
}
