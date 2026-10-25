"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomerQRDraft = generateCustomerQRDraft;
function generateCustomerQRDraft(submission, businessName) {
    var rating = submission.rating, selectedServices = submission.selectedServices, qualityTags = submission.qualityTags, staffName = submission.staffName, ambienceTags = submission.ambienceTags, recommend = submission.recommend, _a = submission.language, language = _a === void 0 ? 'en' : _a, _b = submission.length, length = _b === void 0 ? 'short' : _b;
    var servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : 'services';
    var qualityText = qualityTags.length > 0 ? qualityTags.join(' and ') : 'great';
    var ambienceText = ambienceTags.length > 0 ? ambienceTags.join(', ') : '';
    // 1. Hinglish Drafts
    if (language === 'hi-en') {
        if (rating >= 4) {
            var staffMention = staffName ? " Special mention to ".concat(staffName, " for being so helpful.") : '';
            var ambienceMention = ambienceText ? " Ambience was really ".concat(ambienceText, ".") : '';
            var recommendMention = recommend === 'yes'
                ? ' Definitely recommend karta hoon sabko!'
                : recommend === 'maybe'
                    ? ' Overall accha experience tha.'
                    : '';
            if (length === 'short') {
                var staffShort = staffName ? "aur ".concat(staffName, " bohot helpful the.") : 'aur staff bohot polite tha.';
                return "Visited ".concat(businessName, " for ").concat(servicesText, ". Experience ").concat(qualityText, " tha ").concat(staffShort).concat(recommendMention);
            }
            else {
                return "".concat(businessName, " me visit kiya tha for ").concat(servicesText, ". Overall quality was ").concat(qualityText, ".").concat(ambienceMention).concat(staffMention, " Procedure bohot smoothly hua.").concat(recommendMention);
            }
        }
        else {
            return "Visited ".concat(businessName, " for ").concat(servicesText, ". Quality felt ").concat(qualityText, ". Some things need attention and improvement.");
        }
    }
    // 2. Hindi Drafts
    if (language === 'hi') {
        if (rating >= 4) {
            var staffMention = staffName ? " \u0935\u093F\u0936\u0947\u0937 \u0930\u0942\u092A \u0938\u0947 ".concat(staffName, " \u0915\u093E \u0935\u094D\u092F\u0935\u0939\u093E\u0930 \u092C\u0939\u0941\u0924 \u0938\u0930\u093E\u0939\u0928\u0940\u092F \u0925\u093E\u0964") : '';
            var ambienceMention = ambienceText ? " \u092F\u0939\u093E\u0902 \u0915\u093E \u0935\u093E\u0924\u093E\u0935\u0930\u0923 \u0915\u093E\u092B\u0940 ".concat(ambienceText, " \u0939\u0948\u0964") : '';
            var recommendMention = recommend === 'yes' ? ' मैं निश्चित रूप से दूसरों को इसकी सिफारिश करूंगा।' : '';
            if (length === 'short') {
                return "".concat(businessName, " \u092E\u0947\u0902 ").concat(servicesText, " \u0915\u0947 \u0932\u093F\u090F \u0917\u092F\u093E \u0925\u093E\u0964 \u0938\u0947\u0935\u093E \u092C\u0939\u0941\u0924 ").concat(qualityText, " \u0914\u0930 \u0938\u0902\u0924\u094B\u0937\u091C\u0928\u0915 \u0930\u0939\u0940\u0964").concat(recommendMention);
            }
            else {
                return "".concat(businessName, " \u092E\u0947\u0902 \u092E\u0947\u0930\u093E \u0905\u0928\u0941\u092D\u0935 \u092C\u0939\u0941\u0924 \u0905\u091A\u094D\u091B\u093E \u0930\u0939\u093E\u0964 \u092E\u0948\u0902\u0928\u0947 ").concat(servicesText, " \u0915\u0940 \u0938\u0947\u0935\u093E \u0932\u0940 \u091C\u094B \u0915\u093E\u092B\u0940 ").concat(qualityText, " \u0925\u0940\u0964").concat(ambienceMention).concat(staffMention, " \u0938\u092D\u0940 \u0938\u0941\u0935\u093F\u0927\u093E\u090F\u0902 \u0909\u0924\u094D\u0924\u092E \u0939\u0948\u0902\u0964").concat(recommendMention);
            }
        }
        else {
            return "".concat(businessName, " \u092E\u0947\u0902 ").concat(servicesText, " \u0915\u093E \u0905\u0928\u0941\u092D\u0935 \u0914\u0938\u0924 \u0930\u0939\u093E\u0964 \u0938\u0947\u0935\u093E ").concat(qualityText, " \u0925\u0940 \u0932\u0947\u0915\u093F\u0928 \u0907\u0938\u092E\u0947\u0902 \u0938\u0941\u0927\u093E\u0930 \u0915\u0940 \u0906\u0935\u0936\u094D\u092F\u0915\u0924\u093E \u0939\u0948\u0964");
        }
    }
    // 3. English Drafts (Default)
    if (rating >= 4) {
        var staffMention = staffName ? " Special shoutout to ".concat(staffName, " for their attentive support.") : '';
        var ambienceMention = ambienceText ? " The atmosphere was distinctly ".concat(ambienceText, ".") : '';
        var recommendMention = recommend === 'yes'
            ? ' Highly recommended to anyone in the area!'
            : recommend === 'maybe'
                ? ' A solid and reliable option.'
                : '';
        if (length === 'short') {
            return "Had a great experience at ".concat(businessName, " for ").concat(servicesText, ". The service was genuinely ").concat(qualityText, ".").concat(recommendMention);
        }
        else {
            return "Recently visited ".concat(businessName, " for ").concat(servicesText, ". Everything was handled with high standards, and the quality was ").concat(qualityText, ".").concat(ambienceMention).concat(staffMention, " Very pleased with the care and attention.").concat(recommendMention);
        }
    }
    else {
        return "Visited ".concat(businessName, " for ").concat(servicesText, ". The experience was ").concat(qualityText, ", but there is room for improvement in promptness and customer communication.");
    }
}
