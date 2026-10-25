import { validateReplyContent } from '../src/lib/ai/safety-validator';
import { generateReviewReply, detectLanguageAndScript } from '../src/lib/ai/reply-engine';
import { generateCustomerQRDraft } from '../src/lib/ai/qr-draft-engine';
import {
  INITIAL_LOCATION,
  getAllReviews,
  getHeldReviews,
  approveReviewReply,
  approveByToken,
} from '../src/lib/store/db';
import { Review, CustomerQRSubmission } from '../src/types';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    failed++;
  }
}

console.log('\n--- 1. Testing Safety Validator ---');
const refundTest = validateReplyContent('We will refund your money completely', '+91 98450 12345');
assert(!refundTest.passed, 'Blocks unauthorized refund promises');
assert(refundTest.safeDraft.includes('+91 98450 12345'), 'Enforces manager telephone in fallback');

const liabilityTest = validateReplyContent('It was our doctor fault and our staff mistake', '+91 98450 12345');
assert(!liabilityTest.passed, 'Blocks legal liability / fault admissions');

const safeReplyTest = validateReplyContent('Thank you for visiting Dr. Sharma Clinic!', '+91 98450 12345');
assert(safeReplyTest.passed, 'Allows safe polite replies');

console.log('\n--- 2. Testing Language & Tone Detection ---');
const hinglishDet = detectLanguageAndScript('Root canal karwaya tha, bohot accha experience tha!');
assert(hinglishDet.lang === 'hi-en', 'Detects Hinglish conversational dialect');

const hindiDet = detectLanguageAndScript('डॉक्टर साहब का व्यवहार बहुत अच्छा और विनम्र था।');
assert(hindiDet.lang === 'hi', 'Detects Devanagari Hindi script');

const englishDet = detectLanguageAndScript('Painless procedure and clean clinic in Bangalore.');
assert(englishDet.lang === 'en', 'Detects standard English');

console.log('\n--- 3. Testing Autonomous Review Reply Engine ---');
// Positive 5-star review (Should Auto-Post + Weave SEO Keyword)
const positiveReview: Review = {
  id: 'test-pos',
  locationId: INITIAL_LOCATION.id,
  googleReviewId: 'gbp_pos_1',
  reviewerName: 'Rohit K',
  rating: 5,
  text: 'Root canal procedure bohot painless tha, clean hospital!',
  isStarOnly: false,
  detectedLanguage: 'hi-en',
  detectedTone: 'enthusiastic',
  createdAt: 'Just now',
};

const posOutput = generateReviewReply({
  review: positiveReview,
  settings: INITIAL_LOCATION,
  styleMode: 'default',
});
assert(posOutput.isAutoPostEligible === true, '5-star positive review is auto-post eligible');
assert(
  posOutput.text.includes('best dental clinic in Indiranagar'),
  'Weaves local SEO target keyword into positive reply'
);
assert(posOutput.validation.passed, 'Generated reply passed safety validator');

// Negative 1-star review (Must Hold + Quarantine + Enforce De-escalation)
const negativeReview: Review = {
  id: 'test-neg',
  locationId: INITIAL_LOCATION.id,
  googleReviewId: 'gbp_neg_1',
  reviewerName: 'Kavita M',
  rating: 1,
  text: 'Doctor rushed through consultation, receptionist was completely rude.',
  isStarOnly: false,
  detectedLanguage: 'en',
  detectedTone: 'frustrated',
  createdAt: 'Just now',
};

const negOutput = generateReviewReply({
  review: negativeReview,
  settings: INITIAL_LOCATION,
  styleMode: 'default',
});
assert(negOutput.isAutoPostEligible === false, '1-star review is quarantined and NOT auto-posted');
assert(negOutput.text.includes(INITIAL_LOCATION.managerPhone), 'Includes direct manager telephone');

// Star-only review (No comment left)
const starOnlyReview: Review = {
  id: 'test-star',
  locationId: INITIAL_LOCATION.id,
  googleReviewId: 'gbp_star_1',
  reviewerName: 'Manoj P',
  rating: 5,
  text: '',
  isStarOnly: true,
  detectedLanguage: 'en',
  detectedTone: 'positive',
  createdAt: 'Just now',
};

const starOutput = generateReviewReply({
  review: starOnlyReview,
  settings: INITIAL_LOCATION,
});
assert(starOutput.isAutoPostEligible === true, '5-star star-only review is auto-replied with gratitude');
assert(starOutput.text.includes('5-star rating'), 'Politely acknowledges rating without text');

console.log('\n--- 4. Testing Customer QR Review Booster ---');
const customerSubmission: CustomerQRSubmission = {
  rating: 5,
  selectedServices: ['Dental Implants', 'Teeth Whitening'],
  qualityTags: ['Painless Procedure', 'Clean & Hygienic'],
  staffName: 'Dr. Sneha',
  ambienceTags: ['Modern Equipment'],
  recommend: 'yes',
  language: 'hi-en',
  length: 'short',
};

const qrDraft = generateCustomerQRDraft(customerSubmission, INITIAL_LOCATION.name);
assert(qrDraft.includes('Dental Implants'), 'Draft includes selected service strictly from customer choice');
assert(qrDraft.includes('Dr. Sneha'), 'Draft includes staff mention from customer pick');
assert(qrDraft.includes('Painless Procedure'), 'Draft mirrors quality tags');
assert(!qrDraft.includes('refund') && !qrDraft.includes('discount'), 'No promotional bribe or discount');

console.log('\n--- 5. Testing Mock Store & 1-Tap Mobile Approvals ---');
const initialHeld = getHeldReviews();
assert(initialHeld.length >= 2, 'Initial held reviews queue loaded');

const tokenToApprove = 'sharma-appr-priya-01';
const apprResult = approveByToken(tokenToApprove);
assert(apprResult.success === true, '1-Tap mobile approval by token succeeds');
assert(apprResult.review?.reply?.status === 'posted', 'Reply status updated to posted');

console.log('\n--- 6. Testing Enterprise Modules & Integrations ---');
const fs = require('fs');
const path = require('path');
const storeJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/store.json'), 'utf8'));

assert(storeJson.posIntegrations && storeJson.posIntegrations.length === 3, 'All 3 POS integrations loaded (Petpooja, Zenoti, Practo)');
assert(storeJson.whatsappStudio && storeJson.whatsappStudio.status === 'connected', 'WhatsApp Business Cloud API connected');
assert(storeJson.whatsappStudio.templates.length === 4, '4 vertical WhatsApp message templates configured');
assert(storeJson.disputes && storeJson.disputes.length >= 2, 'AI Google Policy violation disputes loaded');
assert(storeJson.sentimentAspects && storeJson.sentimentAspects.length === 6, '6 aspect-based sentiment operational metrics verified');
assert(storeJson.hardwareCatalog && storeJson.hardwareCatalog.length === 4, '4 NFC countertop stands & bill cards in hardware catalog');
assert(storeJson.servicesByVertical && storeJson.servicesByVertical.cafe.includes('Single-Origin Pour Over'), 'Multi-vertical cafe services populated');
assert(storeJson.servicesByVertical.salon.includes('Balayage Hair Color'), 'Multi-vertical salon services populated');
assert(storeJson.servicesByVertical.gym.includes('Strength & Conditioning'), 'Multi-vertical gym services populated');

console.log(`\n========================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
