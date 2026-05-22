import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import { cancelConversation } from '@backend/controllers/conversations.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await ensureServer();
  return runHandler(cancelConversation, {
    method: 'POST',
    url: `/api/conversations/${params.id}/cancel`,
    params: { id: params.id },
  });
}
