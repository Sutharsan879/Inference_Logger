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
    const { getEnv } = await import('@backend/config/env');
    getEnv();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid environment';
    throw new Error(`${message}. Set DATABASE_URL and other vars in Vercel → Settings → Environment Variables.`);
  }

  try {
    await prisma.$connect();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Database connection failed';
    throw new Error(
      `${message}. Check Atlas Network Access (0.0.0.0/0) and DATABASE_URL on Vercel.`
    );
  }

  const { startQueueWorker } = await import('@backend/ingestion/eventQueue');
  startQueueWorker();
  initialized = true;
}
