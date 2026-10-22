"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPETITORS = exports.INITIAL_LOCATION = exports.PLANS = void 0;
exports.getAllReviews = getAllReviews;
exports.getHeldReviews = getHeldReviews;
exports.getReviewById = getReviewById;
exports.approveReviewReply = approveReviewReply;
exports.approveByToken = approveByToken;
exports.updateReviewReplyDraft = updateReviewReplyDraft;
exports.getQRCodes = getQRCodes;
exports.getQRCodeByCode = getQRCodeByCode;
exports.recordScan = recordScan;
exports.recordDraftGenerated = recordDraftGenerated;
exports.PLANS = [
    {
        id: 'basic',
        name: 'Basic',
        monthlyPrice: 749,
        annualPrice: 7490,
        locationsLimit: 1,
        repliesPerMonth: 80,
        qrCodesLimit: 1,
        aiDraftsPerMonth: 50,
        alerts: ['Email', 'Web Push'],
        features: [
            '1 Google Business Location',
            '80 AI review replies / month',
            'Hindi, Hinglish & English support',
            'Star-based Autopilot (4-5★ auto)',
            '1 Print-ready AI QR Code',
            'Weekly performance summary',
        ],
    },
    {
        id: 'growth',
        name: 'Growth',
        monthlyPrice: 1349,
        annualPrice: 13490,
        locationsLimit: 1,
        repliesPerMonth: 'unlimited',
        qrCodesLimit: 3,
        aiDraftsPerMonth: 300,
        isPopular: true,
        alerts: ['SMS alerts', 'Email', 'Web Push'],
        features: [
            '1 Google Business Location',
            'Unlimited AI review replies',
            'Language detection & tone mirroring',
            'One-tap SMS & email approval links',
            'Local SEO keyword weaving',
            '3 Branch / Staff QR Codes',
            'Full Weekly Report Card (PDF)',
            'Profile Health Checklist',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 1949,
        annualPrice: 19490,
        locationsLimit: 3,
        repliesPerMonth: 'unlimited',
        qrCodesLimit: 'unlimited',
        aiDraftsPerMonth: 'unlimited',
        alerts: ['SMS alerts', 'Email', 'Web Push'],
        features: [
            'Up to 3 Locations included',
            'Unlimited AI review replies',
            'Unlimited AI QR codes & drafts',
            'Competitor Tracker (up to 5 competitors)',
            '5-Star Poster Maker for Social Media',
            'Multi-seat access (5 team members)',
            'Priority processing queue',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        monthlyPrice: 0,
        annualPrice: 0,
        locationsLimit: 10,
        repliesPerMonth: 'unlimited',
        qrCodesLimit: 'unlimited',
        aiDraftsPerMonth: 'unlimited',
        alerts: ['SMS alerts', 'Email', 'Web Push'],
        features: [
            '5 to unlimited locations',
            'Multi-branch manager dashboard',
            'Head-office approval workflows',
            'Custom brand tone guide & rules',
            'White-label client PDF reports',
            'Dedicated Account Manager & SLA',
        ],
    },
];
exports.INITIAL_LOCATION = {
    id: 'loc-01',
    name: 'Dr. Sharma Dental & Implant Clinic',
    city: 'Bengaluru',
    area: 'Indiranagar',
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    category: 'Dental Clinic',
    services: [
        'Root Canal Treatment',
        'Dental Implants',
        'Teeth Whitening',
        'Invisalign & Braces',
        'Tooth Extraction',
        'Pediatric Dentistry',
    ],
    brandTone: 'professional_clinical',
    managerName: 'Dr. Ananya Sharma',
    managerPhone: '+91 98450 12345',
    managerEmail: 'dr.sharma.clinic@gmail.com',
    bannedWords: ['guarantee', '100% cure', 'free replacement'],
    autopilotLevel: 'negatives_held',
    minStarAutoPost: 4,
    targetKeywords: [
        'best dental clinic in Indiranagar',
        'painless root canal Bangalore',
        'dental implants in Indiranagar',
    ],
    autoKeywordWeaving: true,
    smsAlertsEnabled: true,
    emailAlertsEnabled: true,
    pushAlertsEnabled: true,
};
let reviewsStore = [
    {
        id: 'rev-01',
        locationId: 'loc-01',
        googleReviewId: 'gbp_rev_98124',
        reviewerName: 'Rohit Kulkarni',
        rating: 5,
        text: 'Dr. Sharma ke clinic me root canal karwaya. Bohot hi painless procedure tha aur staff bohot cooperative hai. Ekdum clean clinic!',
        isStarOnly: false,
        detectedLanguage: 'hi-en',
        detectedTone: 'enthusiastic',
        createdAt: '2 hours ago',
        reply: {
            id: 'rep-01',
            reviewId: 'rev-01',
            draftText: 'Thank you so much Rohit ji for this wonderful review! Aapka visit hamare liye bohot special tha aur pure staff ko aapka feedback padhkar bohot khushi hui. Our team works hard every day to remain the best dental clinic in Indiranagar. Looking forward to serving you again at Dr. Sharma Dental & Implant Clinic!',
            finalText: 'Thank you so much Rohit ji for this wonderful review! Aapka visit hamare liye bohot special tha aur pure staff ko aapka feedback padhkar bohot khushi hui. Our team works hard every day to remain the best dental clinic in Indiranagar. Looking forward to serving you again at Dr. Sharma Dental & Implant Clinic!',
            status: 'posted',
            model: 'gemini-1.5-flash',
            validatorPassed: true,
            isAutoPosted: true,
            postedAt: '1 hour ago',
        },
    },
    {
        id: 'rev-02',
        locationId: 'loc-01',
        googleReviewId: 'gbp_rev_98125',
        reviewerName: 'Priya Narang',
        rating: 1,
        text: 'Waited 45 mins past appointment time. Receptionist was completely dismissive and the doctor rushed through the consultation without explaining the procedure.',
        isStarOnly: false,
        detectedLanguage: 'en',
        detectedTone: 'angry',
        createdAt: '4 hours ago',
        reply: {
            id: 'rep-02',
            reviewId: 'rev-02',
            draftText: 'Dear Priya Narang, thank you for sharing your feedback. We sincerely value patient comfort and punctuality at Dr. Sharma Dental & Implant Clinic. We take this seriously and would appreciate the opportunity to speak with you directly. Please contact our clinic manager at +91 98450 12345.',
            status: 'held',
            model: 'gemini-1.5-flash',
            validatorPassed: true,
            isAutoPosted: false,
            approvalToken: 'sharma-appr-priya-01',
            approvalExpiresAt: 'Tomorrow, 5:00 PM',
            validatorNotes: [
                'Safety Check Passed: Zero admission of fault.',
                'Safety Check Passed: Directed to manager phone.',
            ],
        },
    },
    {
        id: 'rev-03',
        locationId: 'loc-01',
        googleReviewId: 'gbp_rev_98126',
        reviewerName: 'Suresh Verma',
        rating: 5,
        text: '',
        isStarOnly: true,
        detectedLanguage: 'en',
        detectedTone: 'positive',
        createdAt: '1 day ago',
        reply: {
            id: 'rep-03',
            reviewId: 'rev-03',
            draftText: 'Thank you so much Suresh Verma for the 5-star rating! The entire team at Dr. Sharma Dental & Implant Clinic truly appreciates your support.',
            finalText: 'Thank you so much Suresh Verma for the 5-star rating! The entire team at Dr. Sharma Dental & Implant Clinic truly appreciates your support.',
            status: 'posted',
            model: 'gemini-1.5-flash',
            validatorPassed: true,
            isAutoPosted: true,
            postedAt: '1 day ago',
        },
    },
    {
        id: 'rev-04',
        locationId: 'loc-01',
        googleReviewId: 'gbp_rev_98127',
        reviewerName: 'मनोज कुमार',
        rating: 5,
        text: 'डॉक्टर शर्मा जी बहुत ही अनुभवी हैं। दांत में बहुत दर्द था लेकिन इलाज के बाद तुरंत राहत मिल गई। बहुत बढ़िया अस्पताल।',
        isStarOnly: false,
        detectedLanguage: 'hi',
        detectedTone: 'enthusiastic',
        createdAt: '2 days ago',
        reply: {
            id: 'rep-04',
            reviewId: 'rev-04',
            draftText: 'नमस्ते मनोज कुमार जी! अपनी बहुमूल्य समीक्षा साझा करने के लिए बहुत-बहुत धन्यवाद। हमारी टीम को यह जानकर बेहद खुशी हुई कि आपका अनुभव बेहतरीन रहा। हम आपके उत्तम स्वास्थ्य और मुस्कान की कामना करते हैं!',
            finalText: 'नमस्ते मनोज कुमार जी! अपनी बहुमूल्य समीक्षा साझा करने के लिए बहुत-बहुत धन्यवाद। हमारी टीम को यह जानकर बेहद खुशी हुई कि आपका अनुभव बेहतरीन रहा। हम आपके उत्तम स्वास्थ्य और मुस्कान की कामना करते हैं!',
            status: 'posted',
            model: 'gemini-1.5-flash',
            validatorPassed: true,
            isAutoPosted: true,
            postedAt: '2 days ago',
        },
    },
    {
        id: 'rev-05',
        locationId: 'loc-01',
        googleReviewId: 'gbp_rev_98128',
        reviewerName: 'Vikram Sundaram',
        rating: 2,
        text: 'Clinic infrastructure is modern but billing department had confusion regarding insurance claim and medicine charges were high.',
        isStarOnly: false,
        detectedLanguage: 'en',
        detectedTone: 'frustrated',
        createdAt: '3 hours ago',
        reply: {
            id: 'rep-05',
            reviewId: 'rev-05',
            draftText: 'Dear Vikram Sundaram, thank you for your feedback regarding your visit. We maintain transparent billing standards and would like to review your invoice details personally. Please connect with our clinic manager at +91 98450 12345 so we can assist you promptly.',
            status: 'held',
            model: 'gemini-1.5-flash',
            validatorPassed: true,
            isAutoPosted: false,
            approvalToken: 'sharma-appr-vikram-02',
            approvalExpiresAt: 'Tomorrow, 6:30 PM',
            validatorNotes: [
                'Safety Check Passed: No refund promised.',
                'Directs patient to offline contact.',
            ],
        },
    },
];
let qrCodesStore = [
    {
        id: 'qr-01',
        locationId: 'loc-01',
        name: 'Reception Counter Card (A6)',
        shortCode: 'sharma-dent-01',
        branchName: 'Indiranagar Main',
        templateType: 'counter_card',
        scansCount: 142,
        draftsGeneratedCount: 98,
        reviewsCompletedCount: 76,
        createdAt: '2026-09-01',
    },
    {
        id: 'qr-02',
        locationId: 'loc-01',
        name: 'Waiting Lounge Standee',
        shortCode: 'sharma-lounge-02',
        branchName: 'Indiranagar Main',
        templateType: 'standee',
        scansCount: 89,
        draftsGeneratedCount: 61,
        reviewsCompletedCount: 48,
        createdAt: '2026-09-10',
    },
    {
        id: 'qr-03',
        locationId: 'loc-01',
        name: 'Dr. Sneha Operatory Card',
        shortCode: 'sharma-dr-sneha',
        staffName: 'Dr. Sneha',
        branchName: 'Indiranagar Main',
        templateType: 'table_tent',
        scansCount: 45,
        draftsGeneratedCount: 38,
        reviewsCompletedCount: 32,
        createdAt: '2026-09-15',
    },
];
exports.COMPETITORS = [
    {
        name: 'Dr. Sharma Dental (Your Clinic)',
        rating: 4.8,
        totalReviews: 482,
        unansweredReviews: 2,
        responseRate: 99.6,
        averageResponseTime: '6 mins',
    },
    {
        name: 'Apollo White Dental - Indiranagar',
        rating: 4.4,
        totalReviews: 310,
        unansweredReviews: 64,
        responseRate: 79.3,
        averageResponseTime: '48 hours',
    },
    {
        name: 'Clove Dental - CMH Road',
        rating: 4.2,
        totalReviews: 245,
        unansweredReviews: 82,
        responseRate: 66.5,
        averageResponseTime: '5 days',
    },
    {
        name: 'Smile Care Center Indiranagar',
        rating: 4.1,
        totalReviews: 120,
        unansweredReviews: 55,
        responseRate: 54.1,
        averageResponseTime: 'Rarely replies',
    },
];
// Helper functions for state mutations
function getAllReviews() {
    return [...reviewsStore];
}
function getHeldReviews() {
    return reviewsStore.filter((r) => r.reply?.status === 'held');
}
function getReviewById(id) {
    return reviewsStore.find((r) => r.id === id);
}
function approveReviewReply(reviewId, customText) {
    const review = reviewsStore.find((r) => r.id === reviewId);
    if (!review || !review.reply)
        return undefined;
    review.reply.status = 'posted';
    review.reply.finalText = customText || review.reply.draftText;
    review.reply.postedAt = 'Just now';
    review.reply.approvedBy = 'Clinic Owner (via Dashboard)';
    return review;
}
function approveByToken(token) {
    const review = reviewsStore.find((r) => r.reply?.approvalToken === token);
    if (!review || !review.reply) {
        return { success: false };
    }
    review.reply.status = 'posted';
    review.reply.finalText = review.reply.draftText;
    review.reply.postedAt = 'Just now';
    review.reply.approvedBy = 'Owner (via 1-Tap SMS Link)';
    return { success: true, review };
}
function updateReviewReplyDraft(reviewId, newDraftText) {
    const review = reviewsStore.find((r) => r.id === reviewId);
    if (!review || !review.reply)
        return undefined;
    if (!review.reply.previousVersions) {
        review.reply.previousVersions = [];
    }
    review.reply.previousVersions.push(review.reply.draftText);
    review.reply.draftText = newDraftText;
    return review;
}
function getQRCodes() {
    return [...qrCodesStore];
}
function getQRCodeByCode(shortCode) {
    return qrCodesStore.find((q) => q.shortCode === shortCode);
}
function recordScan(shortCode) {
    const qr = qrCodesStore.find((q) => q.shortCode === shortCode);
    if (qr) {
        qr.scansCount += 1;
    }
}
function recordDraftGenerated(shortCode) {
    const qr = qrCodesStore.find((q) => q.shortCode === shortCode);
    if (qr) {
        qr.draftsGeneratedCount += 1;
    }
}
