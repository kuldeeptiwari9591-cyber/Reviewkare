"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReplyContent = validateReplyContent;
var FORBIDDEN_REFUND_PATTERNS = [
    /\b(refund|refunds|money back|reimburse|reimbursement|free treatment|free meal|compensation|compensate)\b/i,
    /\b(पैसे वापस|रिफंड|मुफ्त|फ्री|मुआवजा)\b/i,
];
var FORBIDDEN_LIABILITY_PATTERNS = [
    /\b(our fault|we were negligent|our mistake|doctor('s)? fault|staff('s)? fault|admit that we|malpractice|we messed up)\b/i,
    /\b(हमारी गलती|हमारी लापरवाही|डॉक्टर की गलती|स्टाफ की गलती)\b/i,
];
var FORBIDDEN_MEDICAL_CLAIMS = [
    /\b(guaranteed cure|cure 100%|guaranteed results|no pain guaranteed|promise to heal)\b/i,
    /\b(सौ प्रतिशत इलाज|गारंटीड)\b/i,
];
function validateReplyContent(text, managerPhone, managerEmail) {
    var violations = [];
    // 1. Check for refund or compensation promises
    for (var _i = 0, FORBIDDEN_REFUND_PATTERNS_1 = FORBIDDEN_REFUND_PATTERNS; _i < FORBIDDEN_REFUND_PATTERNS_1.length; _i++) {
        var pattern = FORBIDDEN_REFUND_PATTERNS_1[_i];
        if (pattern.test(text)) {
            violations.push('Blocked: Contains unauthorized refund or financial compensation offer.');
            break;
        }
    }
    // 2. Check for legal liability or admission of fault
    for (var _a = 0, FORBIDDEN_LIABILITY_PATTERNS_1 = FORBIDDEN_LIABILITY_PATTERNS; _a < FORBIDDEN_LIABILITY_PATTERNS_1.length; _a++) {
        var pattern = FORBIDDEN_LIABILITY_PATTERNS_1[_a];
        if (pattern.test(text)) {
            violations.push('Blocked: Contains admission of legal fault or negligence.');
            break;
        }
    }
    // 3. Check for unauthorized medical/guarantee claims
    for (var _b = 0, FORBIDDEN_MEDICAL_CLAIMS_1 = FORBIDDEN_MEDICAL_CLAIMS; _b < FORBIDDEN_MEDICAL_CLAIMS_1.length; _b++) {
        var pattern = FORBIDDEN_MEDICAL_CLAIMS_1[_b];
        if (pattern.test(text)) {
            violations.push('Blocked: Contains unsubstantiated medical guarantee or claim.');
            break;
        }
    }
    // 4. Check length (must be punchy, under 650 characters)
    if (text.length > 700) {
        violations.push('Warning: Reply is unusually long (>700 characters). Recommended <500 characters.');
    }
    var safeDraft = text;
    // If liability was flagged, enforce de-escalation fallback template
    if (violations.some(function (v) { return v.includes('legal fault') || v.includes('compensation'); })) {
        var contactInfo = managerPhone || managerEmail || 'our clinic manager';
        safeDraft = "Thank you for sharing your feedback. We take all patient experiences seriously and adhere to strict clinical care standards. Please reach out directly to ".concat(contactInfo, " so we can understand your concerns personally and assist you.");
    }
    return {
        passed: violations.filter(function (v) { return v.startsWith('Blocked'); }).length === 0,
        violations: violations,
        safeDraft: safeDraft,
    };
}
