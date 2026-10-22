"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metadata = void 0;
exports.default = RootLayout;
const jsx_runtime_1 = require("react/jsx-runtime");
require("./globals.css");
const Navbar_1 = __importDefault(require("@/components/Navbar"));
const Footer_1 = __importDefault(require("@/components/Footer"));
exports.metadata = {
    title: 'Replyo - AI Google Review Autopilot & In-Clinic AI QR Flow for Indian Businesses',
    description: 'Auto-reply to Google reviews in Hindi, Hinglish & English in your brand tone. Auto-post 5-star replies, hold 1-3 star reviews for 1-tap owner approval. 100% Google policy compliant.',
    keywords: [
        'google review management software India',
        'auto reply to google reviews Hindi Hinglish',
        'AI review reply tool India',
        'QR code for google reviews clinic salon',
    ],
};
function RootLayout({ children, }) {
    return ((0, jsx_runtime_1.jsx)("html", { lang: "en", children: (0, jsx_runtime_1.jsxs)("body", { className: "min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white", children: [(0, jsx_runtime_1.jsx)(Navbar_1.default, {}), (0, jsx_runtime_1.jsx)("main", { className: "flex-1", children: children }), (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }) }));
}
