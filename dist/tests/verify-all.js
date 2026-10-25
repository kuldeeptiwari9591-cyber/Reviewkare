"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var safety_validator_1 = require("../src/lib/ai/safety-validator");
var reply_engine_1 = require("../src/lib/ai/reply-engine");
var qr_draft_engine_1 = require("../src/lib/ai/qr-draft-engine");
var db_1 = require("../src/lib/store/db");
var passed = 0;
var failed = 0;
function assert(condition, msg) {
    if (condition) {
        console.log("  \u2713 PASS: ".concat(msg));
        passed++;
    }
    else {
        console.error("  \u2717 FAIL: ".concat(msg));
        failed++;
    }
}
console.log('\n--- 1. Testing Safety Validator ---');
var refundTest = (0, safety_validator_1.validateReplyContent)('We will refund your money completely', '+91 98450 12345');
assert(!refundTest.passed, 'Blocks unauthorized refund promises');
assert(refundTest.safeDraft.includes('+91 98450 12345'), 'Enforces manager telephone in fallback');
var liabilityTest = (0, safety_validator_1.validateReplyContent)('It was our doctor fault and our staff mistake', '+91 98450 12345');
assert(!liabilityTest.passed, 'Blocks legal liability / fault admissions');
var safeReplyTest = (0, safety_validator_1.validateReplyContent)('Thank you for visiting Dr. Sharma Clinic!', '+91 98450 12345');
assert(safeReplyTest.passed, 'Allows safe polite replies');
console.log('\n--- 2. Testing Language & Tone Detection ---');
var hinglishDet = (0, reply_engine_1.detectLanguageAndScript)('Root canal karwaya tha, bohot accha experience tha!');
assert(hinglishDet.lang === 'hi-en', 'Detects Hinglish conversational dialect');
var hindiDet = (0, reply_engine_1.detectLanguageAndScript)('डॉक्टर साहब का व्यवहार बहुत अच्छा और विनम्र था।');
assert(hindiDet.lang === 'hi', 'Detects Devanagari Hindi script');
var englishDet = (0, reply_engine_1.detectLanguageAndScript)('Painless procedure and clean clinic in Bangalore.');
assert(englishDet.lang === 'en', 'Detects standard English');
console.log('\n--- 3. Testing Autonomous Review Reply Engine ---');
// Positive 5-star review (Should Auto-Post + Weave SEO Keyword)
var positiveReview = {
    id: 'test-pos',
    locationId: db_1.INITIAL_LOCATION.id,
    googleReviewId: 'gbp_pos_1',
    reviewerName: 'Rohit K',
    rating: 5,
    text: 'Root canal procedure bohot painless tha, clean hospital!',
    isStarOnly: false,
    detectedLanguage: 'hi-en',
    detectedTone: 'enthusiastic',
    createdAt: 'Just now',
};
var posOutput = (0, reply_engine_1.generateReviewReply)({
    review: positiveReview,
    settings: db_1.INITIAL_LOCATION,
    styleMode: 'default',
});
assert(posOutput.isAutoPostEligible === true, '5-star positive review is auto-post eligible');
assert(posOutput.text.includes('best dental clinic in Indiranagar'), 'Weaves local SEO target keyword into positive reply');
assert(posOutput.validation.passed, 'Generated reply passed safety validator');
// Negative 1-star review (Must Hold + Quarantine + Enforce De-escalation)
var negativeReview = {
    id: 'test-neg',
    locationId: db_1.INITIAL_LOCATION.id,
    googleReviewId: 'gbp_neg_1',
    reviewerName: 'Kavita M',
    rating: 1,
    text: 'Doctor rushed through consultation, receptionist was completely rude.',
    isStarOnly: false,
    detectedLanguage: 'en',
    detectedTone: 'frustrated',
    createdAt: 'Just now',
};
var negOutput = (0, reply_engine_1.generateReviewReply)({
    review: negativeReview,
    settings: db_1.INITIAL_LOCATION,
    styleMode: 'default',
});
assert(negOutput.isAutoPostEligible === false, '1-star review is quarantined and NOT auto-posted');
assert(negOutput.text.includes(db_1.INITIAL_LOCATION.managerPhone), 'Includes direct manager telephone');
// Star-only review (No comment left)
var starOnlyReview = {
    id: 'test-star',
    locationId: db_1.INITIAL_LOCATION.id,
    googleReviewId: 'gbp_star_1',
    reviewerName: 'Manoj P',
    rating: 5,
    text: '',
    isStarOnly: true,
    detectedLanguage: 'en',
    detectedTone: 'positive',
    createdAt: 'Just now',
};
var starOutput = (0, reply_engine_1.generateReviewReply)({
    review: starOnlyReview,
    settings: db_1.INITIAL_LOCATION,
});
assert(starOutput.isAutoPostEligible === true, '5-star star-only review is auto-replied with gratitude');
assert(starOutput.text.includes('5-star rating'), 'Politely acknowledges rating without text');
console.log('\n--- 4. Testing Customer QR Review Booster ---');
var customerSubmission = {
    rating: 5,
    selectedServices: ['Dental Implants', 'Teeth Whitening'],
    qualityTags: ['Painless Procedure', 'Clean & Hygienic'],
    staffName: 'Dr. Sneha',
    ambienceTags: ['Modern Equipment'],
    recommend: 'yes',
    language: 'hi-en',
    length: 'short',
};
var qrDraft = (0, qr_draft_engine_1.generateCustomerQRDraft)(customerSubmission, db_1.INITIAL_LOCATION.name);
assert(qrDraft.includes('Dental Implants'), 'Draft includes selected service strictly from customer choice');
assert(qrDraft.includes('Dr. Sneha'), 'Draft includes staff mention from customer pick');
assert(qrDraft.includes('Painless Procedure'), 'Draft mirrors quality tags');
assert(!qrDraft.includes('refund') && !qrDraft.includes('discount'), 'No promotional bribe or discount');
console.log('\n--- 5. Testing Mock Store & 1-Tap Mobile Approvals ---');
var initialHeld = (0, db_1.getHeldReviews)();
assert(initialHeld.length >= 2, 'Initial held reviews queue loaded');
var tokenToApprove = 'sharma-appr-priya-01';
var apprResult = (0, db_1.approveByToken)(tokenToApprove);
assert(apprResult.success === true, '1-Tap mobile approval by token succeeds');
assert(((_b = (_a = apprResult.review) === null || _a === void 0 ? void 0 : _a.reply) === null || _b === void 0 ? void 0 : _b.status) === 'posted', 'Reply status updated to posted');
console.log('\n--- 6. Testing Enterprise Modules & Integrations ---');
var fs = require('fs');
var path = require('path');
var storeJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/store.json'), 'utf8'));
assert(storeJson.posIntegrations && storeJson.posIntegrations.length === 3, 'All 3 POS integrations loaded (Petpooja, Zenoti, Practo)');
assert(storeJson.whatsappStudio && storeJson.whatsappStudio.status === 'connected', 'WhatsApp Business Cloud API connected');
assert(storeJson.whatsappStudio.templates.length === 4, '4 vertical WhatsApp message templates configured');
assert(storeJson.disputes && storeJson.disputes.length >= 2, 'AI Google Policy violation disputes loaded');
assert(storeJson.sentimentAspects && storeJson.sentimentAspects.length === 6, '6 aspect-based sentiment operational metrics verified');
assert(storeJson.hardwareCatalog && storeJson.hardwareCatalog.length === 4, '4 NFC countertop stands & bill cards in hardware catalog');
assert(storeJson.servicesByVertical && storeJson.servicesByVertical.cafe.includes('Single-Origin Pour Over'), 'Multi-vertical cafe services populated');
assert(storeJson.servicesByVertical.salon.includes('Balayage Hair Color'), 'Multi-vertical salon services populated');
assert(storeJson.servicesByVertical.gym.includes('Strength & Conditioning'), 'Multi-vertical gym services populated');
console.log("\n========================================");
console.log("TEST SUMMARY: ".concat(passed, " Passed, ").concat(failed, " Failed"));
console.log("========================================\n");
if (failed > 0) {
    process.exit(1);
}
else {
    process.exit(0);
}
