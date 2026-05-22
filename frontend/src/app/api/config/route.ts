import { NextResponse } from 'next/server';
import { ensureServer } from '@/server/init';
import { getConfigPayload } from '@backend/controllers/config.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureServer();
  return NextResponse.json(getConfigPayload());
}
