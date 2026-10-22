import { NextResponse } from 'next/server';
import { getAllReviews, approveByToken } from '@/lib/store/db';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  const reviews = getAllReviews();
  const matched = reviews.find((r) => r.reply?.approvalToken === token);

  if (!matched || !matched.reply) {
    return NextResponse.json(
      { success: false, error: 'Approval link has expired or is invalid.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
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

export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  const token = params.token;
  const result = approveByToken(token);

  if (!result.success || !result.review) {
    return NextResponse.json(
      { success: false, error: 'Invalid or already processed approval token.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Reply approved and published to Google Maps in 1-tap!',
    data: result.review,
  });
}
