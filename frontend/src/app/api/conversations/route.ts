import { NextResponse } from 'next/server';
import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import {
  listConversations,
  createConversation,
} from '@backend/controllers/conversations.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await ensureServer();
    const url = new URL(request.url);
    return runHandler(listConversations, {
      method: 'GET',
      url: `/api/conversations${url.search}`,
    });
  } catch (err) {
    console.error('[api/conversations GET]', err);
    const message = err instanceof Error ? err.message : 'Database unavailable';
    return NextResponse.json({ error: message, conversations: [], total: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureServer();
    const body = await request.json();
    return runHandler(createConversation, {
      method: 'POST',
      url: '/api/conversations',
      body,
    });
  } catch (err) {
    console.error('[api/conversations POST]', err);
    const message = err instanceof Error ? err.message : 'Database unavailable';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
