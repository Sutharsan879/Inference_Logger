/**
 * Generate Prisma client + push schema to MongoDB.
 * Run from frontend/: npm run db:setup
 */
import { config } from 'dotenv';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const root = resolve(process.cwd());
config({ path: resolve(root, '.env.local') });
config({ path: resolve(root, '../backend/.env') });

const clientIndex = resolve(root, 'node_modules/.prisma/client/index.d.ts');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', cwd: root });
}

const url = process.env.DATABASE_URL ?? '';
if (!url.startsWith('mongodb')) {
  console.error('\n✗ Set DATABASE_URL in frontend/.env.local (MongoDB Atlas or mongodb://127.0.0.1:27017/inference_logs)\n');
  process.exit(1);
}

try {
  run('npx prisma generate');
} catch (e) {
  if (existsSync(clientIndex)) {
    console.warn('⚠ generate had a warning but client exists — continuing');
  } else {
    console.error('\n✗ Stop `npm run dev` (Ctrl+C), then run: npm run db:setup\n');
    process.exit(1);
  }
}

try {
  run('npx prisma db push --skip-generate');
} catch {
  console.warn('⚠ db push failed — check DATABASE_URL and Atlas IP allowlist');
}

console.log('\n✓ Prisma ready\n');
