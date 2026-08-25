import { NextRequest, NextResponse } from 'next/server';
import { analyzeItem } from '../../../services/itemAnalysis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const imageData: string = body.imageData ?? body.imageUrl ?? '';

    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json(
        { error: 'imageData (base64 data URI) is required.' },
        { status: 400 }
      );
    }

    const result = await analyzeItem(imageData);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/analyze]', msg);
    return NextResponse.json(
      { error: `Analysis failed: ${msg}` },
      { status: 503 }
    );
  }
}
