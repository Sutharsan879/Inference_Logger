import { rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.next');
rmSync(dir, { recursive: true, force: true });
console.log('Removed .next cache');
