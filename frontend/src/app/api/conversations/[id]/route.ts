import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import {
  getConversation,
  deleteConversation,
} from '@backend/controllers/conversations.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await ensureServer();
  return runHandler(getConversation, {
    method: 'GET',
    url: `/api/conversations/${params.id}`,
    params: { id: params.id },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await ensureServer();
  return runHandler(deleteConversation, {
    method: 'DELETE',
    url: `/api/conversations/${params.id}`,
    params: { id: params.id },
  });
}
