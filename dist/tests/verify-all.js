"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const safety_validator_1 = require("../src/lib/ai/safety-validator");
const reply_engine_1 = require("../src/lib/ai/reply-engine");
const qr_draft_engine_1 = require("../src/lib/ai/qr-draft-engine");
const db_1 = require("../src/lib/store/db");
let passed = 0;
let failed = 0;
function assert(condition, msg) {
    if (condition) {
        console.log(`  ✓ PASS: ${msg}`);
        passed++;
    }
    else {
        console.error(`  ✗ FAIL: ${msg}`);
        failed++;
    }
}
console.log('\n--- 1. Testing Safety Validator ---');
const refundTest = (0, safety_validator_1.validateReplyContent)('We will refund your money completely', '+91 98450 12345');
assert(!refundTest.passed, 'Blocks unauthorized refund promises');
assert(refundTest.safeDraft.includes('+91 98450 12345'), 'Enforces manager telephone in fallback');
const liabilityTest = (0, safety_validator_1.validateReplyContent)('It was our doctor fault and our staff mistake', '+91 98450 12345');
assert(!liabilityTest.passed, 'Blocks legal liability / fault admissions');
const safeReplyTest = (0, safety_validator_1.validateReplyContent)('Thank you for visiting Dr. Sharma Clinic!', '+91 98450 12345');
assert(safeReplyTest.passed, 'Allows safe polite replies');
console.log('\n--- 2. Testing Language & Tone Detection ---');
const hinglishDet = (0, reply_engine_1.detectLanguageAndScript)('Root canal karwaya tha, bohot accha experience tha!');
assert(hinglishDet.lang === 'hi-en', 'Detects Hinglish conversational dialect');
const hindiDet = (0, reply_engine_1.detectLanguageAndScript)('डॉक्टर साहब का व्यवहार बहुत अच्छा और विनम्र था।');
assert(hindiDet.lang === 'hi', 'Detects Devanagari Hindi script');
const englishDet = (0, reply_engine_1.detectLanguageAndScript)('Painless procedure and clean clinic in Bangalore.');
assert(englishDet.lang === 'en', 'Detects standard English');
console.log('\n--- 3. Testing Autonomous Review Reply Engine ---');
// Positive 5-star review (Should Auto-Post + Weave SEO Keyword)
const positiveReview = {
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
const posOutput = (0, reply_engine_1.generateReviewReply)({
    review: positiveReview,
    settings: db_1.INITIAL_LOCATION,
    styleMode: 'default',
});
assert(posOutput.isAutoPostEligible === true, '5-star positive review is auto-post eligible');
assert(posOutput.text.includes('best dental clinic in Indiranagar'), 'Weaves local SEO target keyword into positive reply');
assert(posOutput.validation.passed, 'Generated reply passed safety validator');
// Negative 1-star review (Must Hold + Quarantine + Enforce De-escalation)
const negativeReview = {
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
const negOutput = (0, reply_engine_1.generateReviewReply)({
    review: negativeReview,
    settings: db_1.INITIAL_LOCATION,
    styleMode: 'default',
});
assert(negOutput.isAutoPostEligible === false, '1-star review is quarantined and NOT auto-posted');
assert(negOutput.text.includes(db_1.INITIAL_LOCATION.managerPhone), 'Includes direct manager telephone');
// Star-only review (No comment left)
const starOnlyReview = {
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
const starOutput = (0, reply_engine_1.generateReviewReply)({
    review: starOnlyReview,
    settings: db_1.INITIAL_LOCATION,
});
assert(starOutput.isAutoPostEligible === true, '5-star star-only review is auto-replied with gratitude');
assert(starOutput.text.includes('5-star rating'), 'Politely acknowledges rating without text');
console.log('\n--- 4. Testing Customer QR Review Booster ---');
const customerSubmission = {
    rating: 5,
    selectedServices: ['Dental Implants', 'Teeth Whitening'],
    qualityTags: ['Painless Procedure', 'Clean & Hygienic'],
    staffName: 'Dr. Sneha',
    ambienceTags: ['Modern Equipment'],
    recommend: 'yes',
    language: 'hi-en',
    length: 'short',
};
const qrDraft = (0, qr_draft_engine_1.generateCustomerQRDraft)(customerSubmission, db_1.INITIAL_LOCATION.name);
assert(qrDraft.includes('Dental Implants'), 'Draft includes selected service strictly from customer choice');
assert(qrDraft.includes('Dr. Sneha'), 'Draft includes staff mention from customer pick');
assert(qrDraft.includes('Painless Procedure'), 'Draft mirrors quality tags');
assert(!qrDraft.includes('refund') && !qrDraft.includes('discount'), 'No promotional bribe or discount');
console.log('\n--- 5. Testing Mock Store & 1-Tap Mobile Approvals ---');
const initialHeld = (0, db_1.getHeldReviews)();
assert(initialHeld.length >= 2, 'Initial held reviews queue loaded');
const tokenToApprove = 'sharma-appr-priya-01';
const apprResult = (0, db_1.approveByToken)(tokenToApprove);
assert(apprResult.success === true, '1-Tap mobile approval by token succeeds');
assert(apprResult.review?.reply?.status === 'posted', 'Reply status updated to posted');
console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);
if (failed > 0) {
    process.exit(1);
}
else {
    process.exit(0);
}
