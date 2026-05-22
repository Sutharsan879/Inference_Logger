import { NextResponse } from 'next/server';
import { ensureServer } from '@/server/init';
import { cancelStreamByConversationId } from '@backend/services/stream-chat.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await ensureServer();
  const { conversationId } = await request.json();
  await cancelStreamByConversationId(conversationId);
  return NextResponse.json({ cancelled: true });
}
