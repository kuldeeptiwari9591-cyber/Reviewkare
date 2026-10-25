"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguageAndScript = detectLanguageAndScript;
exports.generateReviewReply = generateReviewReply;
var safety_validator_1 = require("./safety-validator");
// Lightweight linguistic detector
function detectLanguageAndScript(text) {
    if (!text || text.trim().length === 0) {
        return { lang: 'en', tone: 'neutral' };
    }
    // Devanagari script (Hindi, Marathi)
    var devanagariRegex = /[\u0900-\u097F]/;
    // Tamil
    var tamilRegex = /[\u0B80-\u0BFF]/;
    // Telugu
    var teluguRegex = /[\u0C00-\u0C7F]/;
    // Kannada
    var kannadaRegex = /[\u0C80-\u0CFF]/;
    if (kannadaRegex.test(text))
        return { lang: 'kn', tone: 'positive' };
    if (tamilRegex.test(text))
        return { lang: 'ta', tone: 'positive' };
    if (teluguRegex.test(text))
        return { lang: 'te', tone: 'positive' };
    if (devanagariRegex.test(text))
        return { lang: 'hi', tone: 'positive' };
    // Hinglish detection (Latin script with common Hindi words)
    var hinglishKeywords = [
        'bahut', 'bohot', 'accha', 'achha', 'badiya', 'badhiya', 'shandar', 'dhanyawad',
        'kripya', 'bekaar', 'bekar', 'ganda', 'paisa', 'wasool', 'bhai', 'ekdum',
        'sahi', 'mast', 'swaad', 'mujhe', 'hum', 'sir', 'madam', 'kaam', 'hoga'
    ];
    var words = text.toLowerCase().split(/\s+/);
    var hinglishMatch = words.some(function (w) { return hinglishKeywords.includes(w); });
    if (hinglishMatch) {
        return { lang: 'hi-en', tone: 'positive' };
    }
    // Default English
    return { lang: 'en', tone: 'positive' };
}
function generateReviewReply(options) {
    var review = options.review, settings = options.settings, _a = options.styleMode, styleMode = _a === void 0 ? 'default' : _a;
    var lang = detectLanguageAndScript(review.text).lang;
    var isPositive = review.rating >= 4;
    var keywordToWeave = '';
    if (settings.autoKeywordWeaving && settings.targetKeywords.length > 0 && isPositive) {
        // Pick the most relevant keyword or primary area keyword
        keywordToWeave = settings.targetKeywords[0];
    }
    var replyText = '';
    // Case 1: Star-only review (No comment provided)
    if (review.isStarOnly || !review.text || review.text.trim().length === 0) {
        if (isPositive) {
            if (lang === 'hi') {
                replyText = "\u0928\u092E\u0938\u094D\u0924\u0947 ".concat(review.reviewerName, "! \u0939\u092E\u093E\u0930\u0947 ").concat(settings.name, " \u0915\u094B ").concat(review.rating, "-\u0938\u094D\u091F\u093E\u0930 \u0930\u0947\u091F\u093F\u0902\u0917 \u0926\u0947\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u093E \u092C\u0939\u0941\u0924-\u092C\u0939\u0941\u0924 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u0939\u092E \u0906\u092A\u0915\u0940 \u0938\u0947\u0935\u093E \u0915\u0947 \u0932\u093F\u090F \u0939\u092E\u0947\u0936\u093E \u0924\u0924\u094D\u092A\u0930 \u0939\u0948\u0902!");
            }
            else if (lang === 'hi-en') {
                replyText = "Thank you so much ".concat(review.reviewerName, " ji for the ").concat(review.rating, "-star rating! ").concat(settings.name, " me aane ke liye shukriya, hamesha khushi hoti hai aapki service karke.");
            }
            else {
                replyText = "Thank you so much ".concat(review.reviewerName, " for the ").concat(review.rating, "-star rating! The entire team at ").concat(settings.name, " truly appreciates your support.");
            }
        }
        else {
            replyText = "Thank you for leaving a rating. We always strive for 5-star experiences at ".concat(settings.name, ". Please connect directly with our manager at ").concat(settings.managerPhone, " so we can understand how to serve you better.");
        }
    }
    // Case 2: Negative / Critical Review (1-3 stars)
    else if (!isPositive) {
        var contactMethod = settings.managerPhone || settings.managerEmail || 'our customer care team';
        if (lang === 'hi') {
            replyText = "\u0928\u092E\u0938\u094D\u0924\u0947 ".concat(review.reviewerName, ", \u0905\u092A\u0928\u0940 \u092A\u094D\u0930\u0924\u093F\u0915\u094D\u0930\u093F\u092F\u093E \u0938\u093E\u091D\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u0939\u092E \u0906\u092A\u0915\u0940 \u0905\u0938\u0941\u0935\u093F\u0927\u093E \u0915\u094B \u0938\u092E\u091D\u0924\u0947 \u0939\u0948\u0902 \u0914\u0930 \u0939\u0930 \u092E\u0930\u0940\u091C/\u0917\u094D\u0930\u093E\u0939\u0915 \u0915\u0947 \u0905\u0928\u0941\u092D\u0935 \u0915\u094B \u0917\u0902\u092D\u0940\u0930\u0924\u093E \u0938\u0947 \u0932\u0947\u0924\u0947 \u0939\u0948\u0902\u0964 \u0915\u0943\u092A\u092F\u093E \u0939\u092E\u093E\u0930\u0947 \u092A\u094D\u0930\u092C\u0902\u0927\u0915 \u0938\u0947 \u0938\u0940\u0927\u0947 ").concat(contactMethod, " \u092A\u0930 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902 \u0924\u093E\u0915\u093F \u0939\u092E \u0907\u0938 \u092E\u093E\u092E\u0932\u0947 \u0915\u094B \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0930\u0942\u092A \u0938\u0947 \u0938\u092E\u091D \u0938\u0915\u0947\u0902\u0964");
        }
        else if (lang === 'hi-en') {
            replyText = "Hello ".concat(review.reviewerName, ", feedback share karne ke liye thank you. We deeply value our patients and customers at ").concat(settings.name, ". Hum chahte hain ki aapka issue turant address ho. Please directly contact our manager at ").concat(contactMethod, " so hum aapse personally baat karke assist kar sakein.");
        }
        else {
            if (styleMode === 'firmer') {
                replyText = "Dear ".concat(review.reviewerName, ", thank you for bringing this to our attention. At ").concat(settings.name, ", we follow strict clinical and hygiene protocols. We take all feedback with utmost seriousness. Please contact our management team directly at ").concat(contactMethod, " to discuss your visit in detail.");
            }
            else if (styleMode === 'shorter') {
                replyText = "Thank you for your feedback, ".concat(review.reviewerName, ". We take this seriously and would like to understand more. Please connect with our manager at ").concat(contactMethod, ".");
            }
            else {
                replyText = "Dear ".concat(review.reviewerName, ", thank you for your feedback. Providing a high standard of care and comfort at ").concat(settings.name, " is our top priority. We would appreciate the opportunity to speak with you directly. Please reach out to our manager at ").concat(contactMethod, ".");
            }
        }
    }
    // Case 3: Positive Review (4-5 stars)
    else {
        var keywordPhrase = keywordToWeave ? " Our team works hard every day to remain the ".concat(keywordToWeave, ".") : '';
        if (lang === 'hi') {
            if (styleMode === 'shorter') {
                replyText = "\u0928\u092E\u0938\u094D\u0924\u0947 ".concat(review.reviewerName, "! \u0907\u0924\u0928\u0940 \u0936\u093E\u0928\u0926\u093E\u0930 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u093E \u0926\u093F\u0932 \u0938\u0947 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 ").concat(settings.name, " \u092E\u0947\u0902 \u0906\u092A\u0915\u093E \u092B\u093F\u0930 \u0938\u0947 \u0938\u094D\u0935\u093E\u0917\u0924 \u0939\u0948!");
            }
            else {
                replyText = "\u0928\u092E\u0938\u094D\u0924\u0947 ".concat(review.reviewerName, " \u091C\u0940! \u0905\u092A\u0928\u0940 \u092C\u0939\u0941\u092E\u0942\u0932\u094D\u092F \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0938\u093E\u091D\u093E \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F \u092C\u0939\u0941\u0924-\u092C\u0939\u0941\u0924 \u0927\u0928\u094D\u092F\u0935\u093E\u0926\u0964 \u0939\u092E\u093E\u0930\u0940 \u091F\u0940\u092E \u0915\u094B \u092F\u0939 \u091C\u093E\u0928\u0915\u0930 \u092C\u0947\u0939\u0926 \u0916\u0941\u0936\u0940 \u0939\u0941\u0908 \u0915\u093F \u0906\u092A\u0915\u093E \u0905\u0928\u0941\u092D\u0935 \u092C\u0947\u0939\u0924\u0930\u0940\u0928 \u0930\u0939\u093E\u0964").concat(keywordPhrase, " \u0939\u092E \u0906\u092A\u0915\u0947 \u0909\u0924\u094D\u0924\u092E \u0938\u094D\u0935\u093E\u0938\u094D\u0925\u094D\u092F \u0914\u0930 \u092E\u0941\u0938\u094D\u0915\u093E\u0928 \u0915\u0940 \u0915\u093E\u092E\u0928\u093E \u0915\u0930\u0924\u0947 \u0939\u0948\u0902!");
            }
        }
        else if (lang === 'hi-en') {
            if (styleMode === 'shorter') {
                replyText = "Thank you ".concat(review.reviewerName, "! Bohot accha laga aapka review padhke. See you again at ").concat(settings.name, "!");
            }
            else {
                replyText = "Thank you so much ".concat(review.reviewerName, " ji for this wonderful review! Aapka visit hamare liye bohot special tha aur pure staff ko aapka feedback padhkar bohot khushi hui.").concat(keywordPhrase, " Looking forward to serving you again at ").concat(settings.name, "!");
            }
        }
        else if (lang === 'kn') {
            replyText = "\u0CA7\u0CA8\u0CCD\u0CAF\u0CB5\u0CBE\u0CA6\u0C97\u0CB3\u0CC1 ".concat(review.reviewerName, "! \u0CA8\u0CAE\u0CCD\u0CAE ").concat(settings.name, " \u0C95\u0CCD\u0C95\u0CC6 \u0CAD\u0CC7\u0C9F\u0CBF \u0CA8\u0CC0\u0CA1\u0CBF\u0CA6\u0CCD\u0CA6\u0C95\u0CCD\u0C95\u0CBE\u0C97\u0CBF \u0CAE\u0CA4\u0CCD\u0CA4\u0CC1 \u0C85\u0CA6\u0CCD\u0CAD\u0CC1\u0CA4 \u0CB5\u0CBF\u0CAE\u0CB0\u0CCD\u0CB6\u0CC6\u0CAF\u0CA8\u0CCD\u0CA8\u0CC1 \u0CB9\u0C82\u0C9A\u0CBF\u0C95\u0CCA\u0C82\u0CA1\u0CBF\u0CA6\u0CCD\u0CA6\u0C95\u0CCD\u0C95\u0CBE\u0C97\u0CBF \u0CA4\u0CC1\u0C82\u0CAC\u0CBE \u0CA7\u0CA8\u0CCD\u0CAF\u0CB5\u0CBE\u0CA6\u0C97\u0CB3\u0CC1. \u0CAE\u0CA4\u0CCD\u0CA4\u0CC6 \u0CAD\u0CC7\u0C9F\u0CBF \u0CA8\u0CC0\u0CA1\u0CBF!");
        }
        else if (lang === 'ta') {
            replyText = "\u0BAE\u0BBF\u0B95\u0BCD\u0B95 \u0BA8\u0BA9\u0BCD\u0BB1\u0BBF ".concat(review.reviewerName, "! ").concat(settings.name, "\u0B95\u0BCD\u0B95\u0BC1 \u0BB5\u0BB0\u0BC1\u0B95\u0BC8 \u0BA4\u0BA8\u0BCD\u0BA4\u0BC1 \u0B89\u0B99\u0BCD\u0B95\u0BB3\u0BCD \u0B85\u0BA9\u0BCD\u0BAA\u0BBE\u0BA9 \u0B95\u0BB0\u0BC1\u0BA4\u0BCD\u0BA4\u0BC8\u0BAA\u0BCD \u0BAA\u0B95\u0BBF\u0BB0\u0BCD\u0BA8\u0BCD\u0BA4\u0BA4\u0BB1\u0BCD\u0B95\u0BC1 \u0BA8\u0BA9\u0BCD\u0BB1\u0BBF. \u0BAE\u0BC0\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD \u0BB5\u0BBE\u0BB0\u0BC1\u0B99\u0BCD\u0B95\u0BB3\u0BCD!");
        }
        else {
            if (styleMode === 'shorter') {
                replyText = "Thank you ".concat(review.reviewerName, "! We truly appreciate your kind review and look forward to welcoming you back to ").concat(settings.name, ".");
            }
            else if (styleMode === 'warmer') {
                replyText = "Dear ".concat(review.reviewerName, ", your heartwarming words truly made our team's day! Providing thoughtful and comfortable care is what we love doing most.").concat(keywordPhrase, " We can't wait to see your bright smile again at ").concat(settings.name, "!");
            }
            else {
                replyText = "Thank you so much ".concat(review.reviewerName, " for taking the time to share your review! The entire team at ").concat(settings.name, " is delighted to hear about your great experience.").concat(keywordPhrase, " We look forward to serving you again soon!");
            }
        }
    }
    // Run Safety Validation
    var validation = (0, safety_validator_1.validateReplyContent)(replyText, settings.managerPhone, settings.managerEmail);
    var finalText = validation.safeDraft;
    // Determine auto-post eligibility:
    // Must be 4+ stars, autopilot enabled, and validation passed
    var isAutoPostEligible = isPositive &&
        settings.autopilotLevel !== 'approve_all' &&
        review.rating >= settings.minStarAutoPost &&
        validation.passed;
    return {
        text: finalText,
        detectedLanguage: lang,
        detectedTone: isPositive ? 'positive' : 'frustrated',
        isAutoPostEligible: isAutoPostEligible,
        validation: validation,
    };
}
