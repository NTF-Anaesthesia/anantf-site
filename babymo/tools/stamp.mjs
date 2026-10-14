// Stamps sw.js with a version made from the files it caches, so a phone that has the app gets the new files when any of
// them changes. Run after changing any file the worker caches (the list SHELL in sw.js):
//     node babymo/tools/stamp.mjs          writes the new VERSION into sw.js
//     node babymo/tools/stamp.mjs --check  only checks (used by test/version.test.mjs); exits 1 if stale
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(dir, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]).filter(f => f !== './');
export function versionOf() {
  const h = crypto.createHash('sha256');
  for (const f of shell.slice().sort()) h.update(f + '\0').update(fs.readFileSync(path.join(dir, f))).update('\0');
  // the worker's own code counts too (everything except the VERSION line)
  h.update(sw.replace(/const VERSION = '[^']*';/, ''));
  return 'babymo-' + h.digest('hex').slice(0, 8);
}
const want = versionOf(), have = sw.match(/const VERSION = '([^']*)'/)?.[1];
if (process.argv.includes('--check')) {
  if (have !== want) { console.error(`sw.js VERSION is ${have}, but the files give ${want}. Run: node babymo/tools/stamp.mjs`); process.exit(1); }
  console.log(`sw.js VERSION ok (${have})`);
} else if (have !== want) {
  fs.writeFileSync(swPath, sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${want}';`));
  console.log(`sw.js VERSION ${have} -> ${want}`);
} else console.log(`sw.js VERSION already ${have}`);
