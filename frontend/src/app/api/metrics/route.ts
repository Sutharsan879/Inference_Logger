import { ensureServer } from '@/server/init';
import { runHandler } from '@/server/express-adapter';
import { getMetrics } from '@backend/controllers/metrics.controller';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await ensureServer();
  return runHandler(getMetrics, { method: 'GET', url: '/api/metrics' });
}
