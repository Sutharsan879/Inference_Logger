import { NextResponse } from 'next/server';
import { loadEnv } from '@/server/init';
import { prisma } from '@backend/db/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Debug MongoDB connection on Vercel — remove in production if desired */
export async function GET() {
  loadEnv();
  const hasUrl = Boolean(process.env.DATABASE_URL?.startsWith('mongodb'));
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    const count = await prisma.conversation.count();
    return NextResponse.json({
      ok: true,
      hasDatabaseUrl: hasUrl,
      conversations: count,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        hasDatabaseUrl: hasUrl,
        error: err instanceof Error ? err.message : 'Ping failed',
      },
      { status: 500 }
    );
  }
}
