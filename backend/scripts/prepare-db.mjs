/**
 * MongoDB: prisma db push (no SQL migrations).
 */
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

const force = process.argv.includes('--force');
const clientIndex = join(process.cwd(), 'node_modules', '.prisma', 'client', 'index.js');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
}

function tryGenerate() {
  if (!force && existsSync(clientIndex)) {
    console.log('✓ Prisma client already present (skipping generate)');
    return;
  }
  try {
    run('npx prisma generate');
  } catch {
    if (existsSync(clientIndex)) {
      console.warn('⚠ prisma generate skipped (file locked). Using existing client.');
    } else {
      console.error('✗ Run after closing other Node processes: npm run db:setup');
      process.exit(1);
    }
  }
}

const url = process.env.DATABASE_URL ?? '';
if (!url.startsWith('mongodb')) {
  console.error(
    '\n✗ DATABASE_URL must be a MongoDB connection string (mongodb:// or mongodb+srv://)\n' +
      '  Example Atlas: mongodb+srv://user:pass@cluster.mongodb.net/inference_logs?retryWrites=true&w=majority\n' +
      '  Local: mongodb://127.0.0.1:27017/inference_logs\n'
  );
  process.exit(1);
}

tryGenerate();
run('npx prisma db push --skip-generate');
console.log('\n✓ MongoDB schema synced\n');
