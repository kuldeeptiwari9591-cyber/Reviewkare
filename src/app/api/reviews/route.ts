import { NextResponse } from 'next/server';
import { getAllReviews, INITIAL_LOCATION } from '@/lib/store/db';
import { generateReviewReply } from '@/lib/ai/reply-engine';
import { Review } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status');
  const starFilter = searchParams.get('stars');

  let reviews = getAllReviews();

  if (statusFilter) {
    reviews = reviews.filter((r) => r.reply?.status === statusFilter);
  }

  if (starFilter) {
    const stars = parseInt(starFilter, 10);
    if (!isNaN(stars)) {
      reviews = reviews.filter((r) => r.rating === stars);
    }
  }

  return NextResponse.json({
    success: true,
    data: reviews,
    meta: {
      total: reviews.length,
      averageRating: 4.8,
      unansweredCount: reviews.filter((r) => r.reply?.status === 'held').length,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reviewerName, rating, text, isStarOnly } = body;

    if (!reviewerName || !rating) {
      return NextResponse.json(
        { success: false, error: 'Reviewer name and rating are required' },
        { status: 400 }
      );
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      locationId: INITIAL_LOCATION.id,
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
    const aiResult = generateReviewReply({
      review: newReview,
      settings: INITIAL_LOCATION,
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

    return NextResponse.json({
      success: true,
      message:
        replyStatus === 'posted'
          ? 'Review ingested and 5-star reply auto-posted!'
          : 'Review held for 1-tap owner approval.',
      data: newReview,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process incoming review' },
      { status: 500 }
    );
  }
}
