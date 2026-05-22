import { NextResponse } from 'next/server';
import { loadEnv } from '@/server/init';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    loadEnv();
    const { getConfigPayload } = await import('@backend/controllers/config.controller');
    return NextResponse.json(getConfigPayload());
  } catch (err) {
    console.error('[api/config]', err);
    const message = err instanceof Error ? err.message : 'Config unavailable';
    return NextResponse.json(
      {
        error: message,
        mockLlmForced: process.env.MOCK_LLM === 'true',
        providers: {},
        defaultProvider: 'openai',
        hint: message,
      },
      { status: 500 }
    );
  }
}
