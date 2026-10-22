"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PATCH = PATCH;
const server_1 = require("next/server");
const db_1 = require("@/lib/store/db");
const reply_engine_1 = require("@/lib/ai/reply-engine");
async function PATCH(request, { params }) {
    try {
        const reviewId = params.id;
        const body = await request.json();
        const { action, text, styleMode } = body;
        const review = (0, db_1.getReviewById)(reviewId);
        if (!review || !review.reply) {
            return server_1.NextResponse.json({ success: false, error: 'Review or reply not found' }, { status: 404 });
        }
        // Action 1: Approve reply
        if (action === 'approve') {
            const updated = (0, db_1.approveReviewReply)(reviewId, text);
            return server_1.NextResponse.json({
                success: true,
                message: 'Reply successfully approved and published to Google Maps!',
                data: updated,
            });
        }
        // Action 2: Regenerate with style modifier (shorter, warmer, firmer)
        if (action === 'regenerate') {
            const aiResult = (0, reply_engine_1.generateReviewReply)({
                review,
                settings: db_1.INITIAL_LOCATION,
                styleMode: styleMode || 'default',
            });
            const updated = (0, db_1.updateReviewReplyDraft)(reviewId, aiResult.text);
            return server_1.NextResponse.json({
                success: true,
                message: `Regenerated reply in ${styleMode || 'default'} tone!`,
                data: updated,
            });
        }
        // Action 3: Edit draft manually
        if (action === 'edit' && text) {
            const updated = (0, db_1.updateReviewReplyDraft)(reviewId, text);
            return server_1.NextResponse.json({
                success: true,
                message: 'Draft reply updated!',
                data: updated,
            });
        }
        // Action 4: Undo draft
        if (action === 'undo') {
            if (review.reply.previousVersions && review.reply.previousVersions.length > 0) {
                const prevText = review.reply.previousVersions.pop();
                review.reply.draftText = prevText;
                return server_1.NextResponse.json({
                    success: true,
                    message: 'Reverted to previous draft version.',
                    data: review,
                });
            }
            return server_1.NextResponse.json({ success: false, error: 'No previous version available' }, { status: 400 });
        }
        return server_1.NextResponse.json({ success: false, error: 'Invalid action specified' }, { status: 400 });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: 'Failed to update reply' }, { status: 500 });
    }
}
