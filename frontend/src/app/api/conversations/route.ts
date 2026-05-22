import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import {
  listConversations,
  createConversation,
} from '@backend/controllers/conversations.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureServer();
  const url = new URL(request.url);
  return runHandler(listConversations, {
    method: 'GET',
    url: `/api/conversations${url.search}`,
  });
}

export async function POST(request: Request) {
  await ensureServer();
  const body = await request.json();
  return runHandler(createConversation, {
    method: 'POST',
    url: '/api/conversations',
    body,
  });
}
