/**
 * Frees port 8000 (or PORT env) on Windows — run before npm run dev if EADDRINUSE.
 */
import { execSync } from 'child_process';

const port = process.env.PORT || '8000';

try {
  const out = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  const pids = new Set();
  for (const line of out.split('\n')) {
    if (!line.includes('LISTENING')) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid)) pids.add(pid);
  }
  if (pids.size === 0) {
    console.log(`No process listening on port ${port}`);
    process.exit(0);
  }
  for (const pid of pids) {
    console.log(`Stopping PID ${pid} on port ${port}...`);
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
  }
  console.log(`Port ${port} is free`);
} catch {
  console.log(`Port ${port} appears free (no listener found)`);
}
