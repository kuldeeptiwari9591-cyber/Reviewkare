import { NextResponse } from 'next/server';
import { getQRCodes, INITIAL_LOCATION } from '@/lib/store/db';
import { QRCodeItem } from '@/types';
import QRCode from 'qrcode';

export async function GET() {
  const codes = getQRCodes();
  return NextResponse.json({
    success: true,
    data: codes,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, templateType, staffName, branchName } = body;

    const shortCode = `sharma-${Date.now().toString(36)}`;
    const newQR: QRCodeItem = {
      id: `qr-${Date.now()}`,
      locationId: INITIAL_LOCATION.id,
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
    const qrDataUrl = await QRCode.toDataURL(
      `https://reviewkaro.tech/q/${shortCode}`,
      {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 600,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }
    );

    return NextResponse.json({
      success: true,
      data: newQR,
      qrDataUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
