"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectLanguageAndScript = detectLanguageAndScript;
exports.generateReviewReply = generateReviewReply;
const safety_validator_1 = require("./safety-validator");
// Lightweight linguistic detector
function detectLanguageAndScript(text) {
    if (!text || text.trim().length === 0) {
        return { lang: 'en', tone: 'neutral' };
    }
    // Devanagari script (Hindi, Marathi)
    const devanagariRegex = /[\u0900-\u097F]/;
    // Tamil
    const tamilRegex = /[\u0B80-\u0BFF]/;
    // Telugu
    const teluguRegex = /[\u0C00-\u0C7F]/;
    // Kannada
    const kannadaRegex = /[\u0C80-\u0CFF]/;
    if (kannadaRegex.test(text))
        return { lang: 'kn', tone: 'positive' };
    if (tamilRegex.test(text))
        return { lang: 'ta', tone: 'positive' };
    if (teluguRegex.test(text))
        return { lang: 'te', tone: 'positive' };
    if (devanagariRegex.test(text))
        return { lang: 'hi', tone: 'positive' };
    // Hinglish detection (Latin script with common Hindi words)
    const hinglishKeywords = [
        'bahut', 'bohot', 'accha', 'achha', 'badiya', 'badhiya', 'shandar', 'dhanyawad',
        'kripya', 'bekaar', 'bekar', 'ganda', 'paisa', 'wasool', 'bhai', 'ekdum',
        'sahi', 'mast', 'swaad', 'mujhe', 'hum', 'sir', 'madam', 'kaam', 'hoga'
    ];
    const words = text.toLowerCase().split(/\s+/);
    const hinglishMatch = words.some((w) => hinglishKeywords.includes(w));
    if (hinglishMatch) {
        return { lang: 'hi-en', tone: 'positive' };
    }
    // Default English
    return { lang: 'en', tone: 'positive' };
}
function generateReviewReply(options) {
    const { review, settings, styleMode = 'default' } = options;
    const { lang } = detectLanguageAndScript(review.text);
    const isPositive = review.rating >= 4;
    let keywordToWeave = '';
    if (settings.autoKeywordWeaving && settings.targetKeywords.length > 0 && isPositive) {
        // Pick the most relevant keyword or primary area keyword
        keywordToWeave = settings.targetKeywords[0];
    }
    let replyText = '';
    // Case 1: Star-only review (No comment provided)
    if (review.isStarOnly || !review.text || review.text.trim().length === 0) {
        if (isPositive) {
            if (lang === 'hi') {
                replyText = `नमस्ते ${review.reviewerName}! हमारे ${settings.name} को ${review.rating}-स्टार रेटिंग देने के लिए आपका बहुत-बहुत धन्यवाद। हम आपकी सेवा के लिए हमेशा तत्पर हैं!`;
            }
            else if (lang === 'hi-en') {
                replyText = `Thank you so much ${review.reviewerName} ji for the ${review.rating}-star rating! ${settings.name} me aane ke liye shukriya, hamesha khushi hoti hai aapki service karke.`;
            }
            else {
                replyText = `Thank you so much ${review.reviewerName} for the ${review.rating}-star rating! The entire team at ${settings.name} truly appreciates your support.`;
            }
        }
        else {
            replyText = `Thank you for leaving a rating. We always strive for 5-star experiences at ${settings.name}. Please connect directly with our manager at ${settings.managerPhone} so we can understand how to serve you better.`;
        }
    }
    // Case 2: Negative / Critical Review (1-3 stars)
    else if (!isPositive) {
        const contactMethod = settings.managerPhone || settings.managerEmail || 'our customer care team';
        if (lang === 'hi') {
            replyText = `नमस्ते ${review.reviewerName}, अपनी प्रतिक्रिया साझा करने के लिए धन्यवाद। हम आपकी असुविधा को समझते हैं और हर मरीज/ग्राहक के अनुभव को गंभीरता से लेते हैं। कृपया हमारे प्रबंधक से सीधे ${contactMethod} पर संपर्क करें ताकि हम इस मामले को व्यक्तिगत रूप से समझ सकें।`;
        }
        else if (lang === 'hi-en') {
            replyText = `Hello ${review.reviewerName}, feedback share karne ke liye thank you. We deeply value our patients and customers at ${settings.name}. Hum chahte hain ki aapka issue turant address ho. Please directly contact our manager at ${contactMethod} so hum aapse personally baat karke assist kar sakein.`;
        }
        else {
            if (styleMode === 'firmer') {
                replyText = `Dear ${review.reviewerName}, thank you for bringing this to our attention. At ${settings.name}, we follow strict clinical and hygiene protocols. We take all feedback with utmost seriousness. Please contact our management team directly at ${contactMethod} to discuss your visit in detail.`;
            }
            else if (styleMode === 'shorter') {
                replyText = `Thank you for your feedback, ${review.reviewerName}. We take this seriously and would like to understand more. Please connect with our manager at ${contactMethod}.`;
            }
            else {
                replyText = `Dear ${review.reviewerName}, thank you for your feedback. Providing a high standard of care and comfort at ${settings.name} is our top priority. We would appreciate the opportunity to speak with you directly. Please reach out to our manager at ${contactMethod}.`;
            }
        }
    }
    // Case 3: Positive Review (4-5 stars)
    else {
        const keywordPhrase = keywordToWeave ? ` Our team works hard every day to remain the ${keywordToWeave}.` : '';
        if (lang === 'hi') {
            if (styleMode === 'shorter') {
                replyText = `नमस्ते ${review.reviewerName}! इतनी शानदार समीक्षा के लिए आपका दिल से धन्यवाद। ${settings.name} में आपका फिर से स्वागत है!`;
            }
            else {
                replyText = `नमस्ते ${review.reviewerName} जी! अपनी बहुमूल्य समीक्षा साझा करने के लिए बहुत-बहुत धन्यवाद। हमारी टीम को यह जानकर बेहद खुशी हुई कि आपका अनुभव बेहतरीन रहा।${keywordPhrase} हम आपके उत्तम स्वास्थ्य और मुस्कान की कामना करते हैं!`;
            }
        }
        else if (lang === 'hi-en') {
            if (styleMode === 'shorter') {
                replyText = `Thank you ${review.reviewerName}! Bohot accha laga aapka review padhke. See you again at ${settings.name}!`;
            }
            else {
                replyText = `Thank you so much ${review.reviewerName} ji for this wonderful review! Aapka visit hamare liye bohot special tha aur pure staff ko aapka feedback padhkar bohot khushi hui.${keywordPhrase} Looking forward to serving you again at ${settings.name}!`;
            }
        }
        else if (lang === 'kn') {
            replyText = `ಧನ್ಯವಾದಗಳು ${review.reviewerName}! ನಮ್ಮ ${settings.name} ಕ್ಕೆ ಭೇಟಿ ನೀಡಿದ್ದಕ್ಕಾಗಿ ಮತ್ತು ಅದ್ಭುತ ವಿಮರ್ಶೆಯನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ತುಂಬಾ ಧನ್ಯವಾದಗಳು. ಮತ್ತೆ ಭೇಟಿ ನೀಡಿ!`;
        }
        else if (lang === 'ta') {
            replyText = `மிக்க நன்றி ${review.reviewerName}! ${settings.name}க்கு வருகை தந்து உங்கள் அன்பான கருத்தைப் பகிர்ந்ததற்கு நன்றி. மீண்டும் வாருங்கள்!`;
        }
        else {
            if (styleMode === 'shorter') {
                replyText = `Thank you ${review.reviewerName}! We truly appreciate your kind review and look forward to welcoming you back to ${settings.name}.`;
            }
            else if (styleMode === 'warmer') {
                replyText = `Dear ${review.reviewerName}, your heartwarming words truly made our team's day! Providing thoughtful and comfortable care is what we love doing most.${keywordPhrase} We can't wait to see your bright smile again at ${settings.name}!`;
            }
            else {
                replyText = `Thank you so much ${review.reviewerName} for taking the time to share your review! The entire team at ${settings.name} is delighted to hear about your great experience.${keywordPhrase} We look forward to serving you again soon!`;
            }
        }
    }
    // Run Safety Validation
    const validation = (0, safety_validator_1.validateReplyContent)(replyText, settings.managerPhone, settings.managerEmail);
    const finalText = validation.safeDraft;
    // Determine auto-post eligibility:
    // Must be 4+ stars, autopilot enabled, and validation passed
    const isAutoPostEligible = isPositive &&
        settings.autopilotLevel !== 'approve_all' &&
        review.rating >= settings.minStarAutoPost &&
        validation.passed;
    return {
        text: finalText,
        detectedLanguage: lang,
        detectedTone: isPositive ? 'positive' : 'frustrated',
        isAutoPostEligible,
        validation,
    };
}
