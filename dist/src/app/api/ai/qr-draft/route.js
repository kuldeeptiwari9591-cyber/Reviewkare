"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const server_1 = require("next/server");
const qr_draft_engine_1 = require("@/lib/ai/qr-draft-engine");
const db_1 = require("@/lib/store/db");
async function POST(request) {
    try {
        const body = await request.json();
        const { submission, shortCode } = body;
        if (!submission || !submission.rating) {
            return server_1.NextResponse.json({ success: false, error: 'Valid review submission parameters required' }, { status: 400 });
        }
        const draftText = (0, qr_draft_engine_1.generateCustomerQRDraft)(submission, db_1.INITIAL_LOCATION.name);
        if (shortCode) {
            (0, db_1.recordDraftGenerated)(shortCode);
        }
        return server_1.NextResponse.json({
            success: true,
            draftText,
            googlePlaceUrl: `https://search.google.com/local/writereview?placeid=${db_1.INITIAL_LOCATION.googlePlaceId}`,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: 'Failed to generate customer review draft' }, { status: 500 });
    }
}
