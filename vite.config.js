import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';

// Every index.html in the project is a page (homepage, /account, generated /services/* and /store/*).
const SKIP = new Set(['node_modules', 'dist', 'public', '.git', 'src', 'scripts']);
function findPages(dir, out = {}) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { if (!SKIP.has(name)) findPages(path, out); }
    else if (name === 'index.html') out[dir === '.' ? 'main' : dir.replace(/[\\/]/g, '-')] = resolve(path);
  }
  return out;
}

export default defineConfig({
  build: { rollupOptions: { input: findPages('.') } },
});
