import { NextResponse } from 'next/server';
import { generateCustomerQRDraft } from '@/lib/ai/qr-draft-engine';
import { INITIAL_LOCATION, recordDraftGenerated } from '@/lib/store/db';
import { CustomerQRSubmission } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { submission, shortCode } = body as {
      submission: CustomerQRSubmission;
      shortCode?: string;
    };

    if (!submission || !submission.rating) {
      return NextResponse.json(
        { success: false, error: 'Valid review submission parameters required' },
        { status: 400 }
      );
    }

    const draftText = generateCustomerQRDraft(submission, INITIAL_LOCATION.name);

    if (shortCode) {
      recordDraftGenerated(shortCode);
    }

    return NextResponse.json({
      success: true,
      draftText,
      googlePlaceUrl: `https://search.google.com/local/writereview?placeid=${INITIAL_LOCATION.googlePlaceId}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate customer review draft' },
      { status: 500 }
    );
  }
}
