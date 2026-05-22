import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import { listLogs } from '@backend/controllers/logs.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureServer();
  const url = new URL(request.url);
  return runHandler(listLogs, {
    method: 'GET',
    url: `/api/logs${url.search}`,
  });
}
