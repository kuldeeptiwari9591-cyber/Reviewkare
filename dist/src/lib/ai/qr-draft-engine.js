"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCustomerQRDraft = generateCustomerQRDraft;
function generateCustomerQRDraft(submission, businessName) {
    const { rating, selectedServices, qualityTags, staffName, ambienceTags, recommend, language = 'en', length = 'short', } = submission;
    const servicesText = selectedServices.length > 0 ? selectedServices.join(', ') : 'services';
    const qualityText = qualityTags.length > 0 ? qualityTags.join(' and ') : 'great';
    const ambienceText = ambienceTags.length > 0 ? ambienceTags.join(', ') : '';
    // 1. Hinglish Drafts
    if (language === 'hi-en') {
        if (rating >= 4) {
            const staffMention = staffName ? ` Special mention to ${staffName} for being so helpful.` : '';
            const ambienceMention = ambienceText ? ` Ambience was really ${ambienceText}.` : '';
            const recommendMention = recommend === 'yes'
                ? ' Definitely recommend karta hoon sabko!'
                : recommend === 'maybe'
                    ? ' Overall accha experience tha.'
                    : '';
            if (length === 'short') {
                const staffShort = staffName ? `aur ${staffName} bohot helpful the.` : 'aur staff bohot polite tha.';
                return `Visited ${businessName} for ${servicesText}. Experience ${qualityText} tha ${staffShort}${recommendMention}`;
            }
            else {
                return `${businessName} me visit kiya tha for ${servicesText}. Overall quality was ${qualityText}.${ambienceMention}${staffMention} Procedure bohot smoothly hua.${recommendMention}`;
            }
        }
        else {
            return `Visited ${businessName} for ${servicesText}. Quality felt ${qualityText}. Some things need attention and improvement.`;
        }
    }
    // 2. Hindi Drafts
    if (language === 'hi') {
        if (rating >= 4) {
            const staffMention = staffName ? ` विशेष रूप से ${staffName} का व्यवहार बहुत सराहनीय था।` : '';
            const ambienceMention = ambienceText ? ` यहां का वातावरण काफी ${ambienceText} है।` : '';
            const recommendMention = recommend === 'yes' ? ' मैं निश्चित रूप से दूसरों को इसकी सिफारिश करूंगा।' : '';
            if (length === 'short') {
                return `${businessName} में ${servicesText} के लिए गया था। सेवा बहुत ${qualityText} और संतोषजनक रही।${recommendMention}`;
            }
            else {
                return `${businessName} में मेरा अनुभव बहुत अच्छा रहा। मैंने ${servicesText} की सेवा ली जो काफी ${qualityText} थी।${ambienceMention}${staffMention} सभी सुविधाएं उत्तम हैं।${recommendMention}`;
            }
        }
        else {
            return `${businessName} में ${servicesText} का अनुभव औसत रहा। सेवा ${qualityText} थी लेकिन इसमें सुधार की आवश्यकता है।`;
        }
    }
    // 3. English Drafts (Default)
    if (rating >= 4) {
        const staffMention = staffName ? ` Special shoutout to ${staffName} for their attentive support.` : '';
        const ambienceMention = ambienceText ? ` The atmosphere was distinctly ${ambienceText}.` : '';
        const recommendMention = recommend === 'yes'
            ? ' Highly recommended to anyone in the area!'
            : recommend === 'maybe'
                ? ' A solid and reliable option.'
                : '';
        if (length === 'short') {
            return `Had a great experience at ${businessName} for ${servicesText}. The service was genuinely ${qualityText}.${recommendMention}`;
        }
        else {
            return `Recently visited ${businessName} for ${servicesText}. Everything was handled with high standards, and the quality was ${qualityText}.${ambienceMention}${staffMention} Very pleased with the care and attention.${recommendMention}`;
        }
    }
    else {
        return `Visited ${businessName} for ${servicesText}. The experience was ${qualityText}, but there is room for improvement in promptness and customer communication.`;
    }
}
