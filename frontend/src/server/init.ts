import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '@backend/db/client';

let initialized = false;

export function loadEnv(): void {
  config({ path: resolve(process.cwd(), '.env.local') });
  config({ path: resolve(process.cwd(), '../backend/.env') });
}

export async function ensureServer(): Promise<void> {
  if (initialized) return;
  loadEnv();

  try {
    await prisma.$connect();
  } catch (err) {
    console.error(
      'Prisma not ready. Stop dev server (Ctrl+C), then run:\n  cd frontend\n  npm run db:setup\n  npm run dev'
    );
    throw err;
  }

  const { startQueueWorker } = await import('@backend/ingestion/eventQueue');
  startQueueWorker();
  initialized = true;
}
