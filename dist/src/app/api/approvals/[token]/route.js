"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/store/db");
async function GET(request, { params }) {
    const token = params.token;
    const reviews = (0, db_1.getAllReviews)();
    const matched = reviews.find((r) => r.reply?.approvalToken === token);
    if (!matched || !matched.reply) {
        return server_1.NextResponse.json({ success: false, error: 'Approval link has expired or is invalid.' }, { status: 404 });
    }
    return server_1.NextResponse.json({
        success: true,
        data: {
            reviewId: matched.id,
            reviewerName: matched.reviewerName,
            rating: matched.rating,
            comment: matched.text,
            createdAt: matched.createdAt,
            draftReply: matched.reply.draftText,
            status: matched.reply.status,
            expiresAt: matched.reply.approvalExpiresAt,
            validatorNotes: matched.reply.validatorNotes,
        },
    });
}
async function POST(request, { params }) {
    const token = params.token;
    const result = (0, db_1.approveByToken)(token);
    if (!result.success || !result.review) {
        return server_1.NextResponse.json({ success: false, error: 'Invalid or already processed approval token.' }, { status: 400 });
    }
    return server_1.NextResponse.json({
        success: true,
        message: 'Reply approved and published to Google Maps in 1-tap!',
        data: result.review,
    });
}
