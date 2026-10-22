import { NextResponse } from 'next/server';
import {
  getReviewById,
  approveReviewReply,
  updateReviewReplyDraft,
  INITIAL_LOCATION,
} from '@/lib/store/db';
import { generateReviewReply } from '@/lib/ai/reply-engine';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;
    const body = await request.json();
    const { action, text, styleMode } = body;

    const review = getReviewById(reviewId);
    if (!review || !review.reply) {
      return NextResponse.json(
        { success: false, error: 'Review or reply not found' },
        { status: 404 }
      );
    }

    // Action 1: Approve reply
    if (action === 'approve') {
      const updated = approveReviewReply(reviewId, text);
      return NextResponse.json({
        success: true,
        message: 'Reply successfully approved and published to Google Maps!',
        data: updated,
      });
    }

    // Action 2: Regenerate with style modifier (shorter, warmer, firmer)
    if (action === 'regenerate') {
      const aiResult = generateReviewReply({
        review,
        settings: INITIAL_LOCATION,
        styleMode: styleMode || 'default',
      });

      const updated = updateReviewReplyDraft(reviewId, aiResult.text);
      return NextResponse.json({
        success: true,
        message: `Regenerated reply in ${styleMode || 'default'} tone!`,
        data: updated,
      });
    }

    // Action 3: Edit draft manually
    if (action === 'edit' && text) {
      const updated = updateReviewReplyDraft(reviewId, text);
      return NextResponse.json({
        success: true,
        message: 'Draft reply updated!',
        data: updated,
      });
    }

    // Action 4: Undo draft
    if (action === 'undo') {
      if (review.reply.previousVersions && review.reply.previousVersions.length > 0) {
        const prevText = review.reply.previousVersions.pop()!;
        review.reply.draftText = prevText;
        return NextResponse.json({
          success: true,
          message: 'Reverted to previous draft version.',
          data: review,
        });
      }
      return NextResponse.json(
        { success: false, error: 'No previous version available' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update reply' },
      { status: 500 }
    );
  }
}
