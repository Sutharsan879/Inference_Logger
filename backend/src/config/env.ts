import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  DATABASE_URL: z.string().min(1).refine(
    (u) => u.startsWith('mongodb://') || u.startsWith('mongodb+srv://'),
    { message: 'DATABASE_URL must be a MongoDB connection string' }
  ),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  ANTHROPIC_API_KEY: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  OPENAI_API_KEY: z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
  MOCK_LLM: z
    .string()
    .optional()
    .transform((v) => v === 'true' || v === '1'),
  INGESTION_BASE_URL: z.string().url().optional(),
  INGESTION_MODE: z.enum(['http', 'queue']).default('queue'),
  MAX_CONTEXT_MESSAGES: z.coerce.number().default(20),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  const data = parsed.data;
  if (!data.INGESTION_BASE_URL) {
    (data as Env & { INGESTION_BASE_URL: string }).INGESTION_BASE_URL =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://localhost:${data.PORT}`;
  }
  return data as Env;
}

export const env = loadEnv();
