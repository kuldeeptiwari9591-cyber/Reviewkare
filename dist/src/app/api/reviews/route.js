"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/store/db");
const reply_engine_1 = require("@/lib/ai/reply-engine");
async function GET(request) {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');
    const starFilter = searchParams.get('stars');
    let reviews = (0, db_1.getAllReviews)();
    if (statusFilter) {
        reviews = reviews.filter((r) => r.reply?.status === statusFilter);
    }
    if (starFilter) {
        const stars = parseInt(starFilter, 10);
        if (!isNaN(stars)) {
            reviews = reviews.filter((r) => r.rating === stars);
        }
    }
    return server_1.NextResponse.json({
        success: true,
        data: reviews,
        meta: {
            total: reviews.length,
            averageRating: 4.8,
            unansweredCount: reviews.filter((r) => r.reply?.status === 'held').length,
        },
    });
}
async function POST(request) {
    try {
        const body = await request.json();
        const { reviewerName, rating, text, isStarOnly } = body;
        if (!reviewerName || !rating) {
            return server_1.NextResponse.json({ success: false, error: 'Reviewer name and rating are required' }, { status: 400 });
        }
        const newReview = {
            id: `rev-${Date.now()}`,
            locationId: db_1.INITIAL_LOCATION.id,
            googleReviewId: `gbp_sim_${Date.now()}`,
            reviewerName,
            rating: Number(rating),
            text: text || '',
            isStarOnly: Boolean(isStarOnly || !text),
            detectedLanguage: 'en',
            detectedTone: rating >= 4 ? 'positive' : 'frustrated',
            createdAt: 'Just now',
        };
        // Generate AI reply using our engine
        const aiResult = (0, reply_engine_1.generateReviewReply)({
            review: newReview,
            settings: db_1.INITIAL_LOCATION,
        });
        newReview.detectedLanguage = aiResult.detectedLanguage;
        const replyStatus = aiResult.isAutoPostEligible ? 'posted' : 'held';
        const approvalToken = !aiResult.isAutoPostEligible ? `appr-token-${Date.now()}` : undefined;
        newReview.reply = {
            id: `rep-${Date.now()}`,
            reviewId: newReview.id,
            draftText: aiResult.text,
            finalText: replyStatus === 'posted' ? aiResult.text : undefined,
            status: replyStatus,
            model: 'gemini-1.5-flash',
            validatorPassed: aiResult.validation.passed,
            validatorNotes: aiResult.validation.violations,
            isAutoPosted: replyStatus === 'posted',
            postedAt: replyStatus === 'posted' ? 'Just now' : undefined,
            approvalToken,
            approvalExpiresAt: approvalToken ? 'In 24 hours' : undefined,
        };
        return server_1.NextResponse.json({
            success: true,
            message: replyStatus === 'posted'
                ? 'Review ingested and 5-star reply auto-posted!'
                : 'Review held for 1-tap owner approval.',
            data: newReview,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: 'Failed to process incoming review' }, { status: 500 });
    }
}
