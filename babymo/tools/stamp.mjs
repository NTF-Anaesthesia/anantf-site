// Stamps sw.js with a version made from the files it caches, so a phone that has the app gets the new files when any of
// them changes. Run after changing any file the worker caches (the lists SHELL and SITE in sw.js; SITE includes the
// question bank's code, ../qbank/js/bank.js, and the app kit and its fonts on https://design.anantf.com/v1/, hashed by
// URL). DATA (the bank and the paper) is not hashed: the worker always fetches it fresh when there is a signal, so a
// change to a question never needs a new version.
//     node babymo/tools/stamp.mjs          writes the new VERSION into sw.js
//     node babymo/tools/stamp.mjs --check  only checks (used by test/version.test.mjs); exits 1 if stale
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isKit, kitRefs } from '../../tools/app-kit.mjs';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(dir, 'sw.js');
const read = fs.readFileSync(swPath, 'utf8');
const list = (text, name) => [...(text.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`)) || ['', ''])[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
// SITE is kept by hand, except the app kit: its URLs (with the fonts app.css loads) come from index.html and app-kit.mjs
const site = [...list(read, 'SITE').filter(f => !isKit(f)), ...kitRefs(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'))];
const sw = read.replace(/const SITE = \[[\s\S]*?\];/, `const SITE = [${site.map(f => `'${f}'`).join(', ')}];`);
const files = [...list(sw, 'SHELL'), ...site].filter(f => f !== './');
export function versionOf() {
  const h = crypto.createHash('sha256');
  for (const f of files.slice().sort()) h.update(f + '\0').update(isKit(f) ? '' : fs.readFileSync(path.join(dir, f))).update('\0'); // the app kit by its URL (../../tools/app-kit.mjs)
  // the worker's own code counts too (everything except the VERSION line)
  h.update(sw.replace(/const VERSION = '[^']*';/, ''));
  return h.digest('hex').slice(0, 8);
}
// VERSION is babymo-<date stamped>-<hash>; the app shows it as "App version <date> (<hash>)". Only the hash is checked,
// so the date stays the day the files last changed.
const hash = versionOf(), have = sw.match(/const VERSION = '([^']*)'/)?.[1];
const ok = sw === read && (have || '').endsWith('-' + hash), want = `babymo-${new Date().toISOString().slice(0, 10)}-${hash}`;
if (process.argv.includes('--check')) {
  if (!ok) { console.error(`sw.js VERSION is ${have}, but the files give ${hash}${sw === read ? '' : ' (app kit list changed)'}. Run: node babymo/tools/stamp.mjs`); process.exit(1); }
  console.log(`sw.js VERSION ok (${have})`);
} else if (!ok) {
  fs.writeFileSync(swPath, sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${want}';`));
  console.log(`sw.js VERSION ${have} -> ${want}`);
} else console.log(`sw.js VERSION already ${have}`);
