"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
const server_1 = require("next/server");
const db_1 = require("@/lib/store/db");
const qrcode_1 = __importDefault(require("qrcode"));
async function GET() {
    const codes = (0, db_1.getQRCodes)();
    return server_1.NextResponse.json({
        success: true,
        data: codes,
    });
}
async function POST(request) {
    try {
        const body = await request.json();
        const { name, templateType, staffName, branchName } = body;
        const shortCode = `sharma-${Date.now().toString(36)}`;
        const newQR = {
            id: `qr-${Date.now()}`,
            locationId: db_1.INITIAL_LOCATION.id,
            name: name || 'New QR Standee',
            shortCode,
            staffName,
            branchName: branchName || 'Indiranagar Main',
            templateType: templateType || 'counter_card',
            scansCount: 0,
            draftsGeneratedCount: 0,
            reviewsCompletedCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        // Generate base64 data url
        const qrDataUrl = await qrcode_1.default.toDataURL(`https://replyo.in/q/${shortCode}`, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 600,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        });
        return server_1.NextResponse.json({
            success: true,
            data: newQR,
            qrDataUrl,
        });
    }
    catch (error) {
        return server_1.NextResponse.json({ success: false, error: 'Failed to generate QR code' }, { status: 500 });
    }
}
