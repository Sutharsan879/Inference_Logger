import { PrismaClient } from '@prisma/client';

type GlobalPrisma = typeof globalThis & { __llmPrisma?: PrismaClient };

const globalForPrisma = globalThis as GlobalPrisma;

function createClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.__llmPrisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__llmPrisma = prisma;
}
