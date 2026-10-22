"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cn = cn;
exports.formatINR = formatINR;
exports.getLanguageLabel = getLanguageLabel;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
function formatINR(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
}
function getLanguageLabel(lang) {
    switch (lang) {
        case 'hi':
            return 'Hindi (हिंदी)';
        case 'hi-en':
            return 'Hinglish (हिंग्लिश)';
        case 'en':
            return 'English';
        case 'ta':
            return 'Tamil (தமிழ்)';
        case 'te':
            return 'Telugu (తెలుగు)';
        case 'kn':
            return 'Kannada (ಕನ್ನಡ)';
        case 'mr':
            return 'Marathi (मराठी)';
        case 'bn':
            return 'Bengali (বাংলা)';
        case 'gu':
            return 'Gujarati (ગુજરાતી)';
        default:
            return lang.toUpperCase();
    }
}
