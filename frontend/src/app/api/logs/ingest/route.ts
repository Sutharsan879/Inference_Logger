import { NextResponse } from 'next/server';
import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import { ingestLog } from '@backend/controllers/logs.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await ensureServer();
  const body = await request.json();
  const res = await runHandler(ingestLog, {
    method: 'POST',
    url: '/api/logs/ingest',
    body,
  });
  return new NextResponse(res.body, { status: res.status });
}
