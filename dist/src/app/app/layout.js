"use strict";
'use client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const db_1 = require("@/lib/store/db");
function AppLayout({ children }) {
    const pathname = (0, navigation_1.usePathname)();
    const navigation = [
        { name: 'Dashboard', href: '/app', icon: lucide_react_1.LayoutDashboard },
        { name: 'All Reviews', href: '/app/reviews', icon: lucide_react_1.MessageSquare },
        {
            name: 'Held Approvals',
            href: '/app/approvals',
            icon: lucide_react_1.AlertTriangle,
            badge: '2',
            badgeColor: 'bg-amber-100 text-amber-800',
        },
        { name: 'QR Studio', href: '/app/qr', icon: lucide_react_1.QrCode },
        { name: 'Growth & Competitors', href: '/app/growth', icon: lucide_react_1.TrendingUp },
        { name: 'Settings & Tone', href: '/app/settings', icon: lucide_react_1.Settings },
        { name: 'Billing & Plans', href: '/app/billing', icon: lucide_react_1.CreditCard },
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen bg-slate-50 flex flex-col md:flex-row", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "w-full md:w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-b border-slate-100", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm", children: "D" }), (0, jsx_runtime_1.jsxs)("div", { className: "overflow-hidden", children: [(0, jsx_runtime_1.jsx)("h2", { className: "font-bold text-xs text-slate-900 truncate", children: db_1.INITIAL_LOCATION.name }), (0, jsx_runtime_1.jsxs)("p", { className: "text-[11px] text-slate-500 truncate", children: [db_1.INITIAL_LOCATION.area, ", ", db_1.INITIAL_LOCATION.city] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ShieldCheck, { className: "w-3 h-3 text-emerald-600" }), " Google Business Profile Connected"] })] }), (0, jsx_runtime_1.jsx)("nav", { className: "p-3 space-y-1", children: navigation.map((item) => {
                                    const active = pathname === item.href;
                                    const Icon = item.icon;
                                    return ((0, jsx_runtime_1.jsxs)(link_1.default, { href: item.href, className: `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${active
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`, children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2.5", children: [(0, jsx_runtime_1.jsx)(Icon, { className: `w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}` }), (0, jsx_runtime_1.jsx)("span", { children: item.name })] }), item.badge && ((0, jsx_runtime_1.jsx)("span", { className: `text-[10px] font-bold px-1.5 py-0.2 rounded-full ${active ? 'bg-white text-emerald-800' : item.badgeColor}`, children: item.badge }))] }, item.name));
                                }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "p-4 border-t border-slate-100 space-y-2", children: [(0, jsx_runtime_1.jsxs)(link_1.default, { href: "/q/sharma-dent-01", target: "_blank", className: "w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.QrCode, { className: "w-3.5 h-3.5 text-emerald-600" }), "Open Customer QR ", (0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { className: "w-3 h-3 text-slate-400" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-[10px] text-center text-slate-400", children: ["Autopilot: ", (0, jsx_runtime_1.jsx)("span", { className: "text-emerald-600 font-bold", children: "ACTIVE (4-5\u2605)" })] })] })] }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto", children: children })] }));
}
