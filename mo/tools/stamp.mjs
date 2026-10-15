// Writes the offline file lists (SHELL: this app's files; SITE: the shared header, styles and fonts it uses) and a VERSION
// made from their contents into sw.js, so a phone that has the guide gets the new files whenever any of them changes.
// Run after changing anything in mo/ (content included):
//     node mo/tools/stamp.mjs          rewrites SHELL, SITE and VERSION in sw.js
//     node mo/tools/stamp.mjs --check  only checks (test/version.test.mjs); exits 1 if anything is stale
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(dir, 'sw.js');
const sw = fs.readFileSync(swPath, 'utf8');

// this app's files: the page, styles, manifest, icons and every script
const walk = d => fs.readdirSync(path.join(dir, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const shell = ['index.html', 'style.css', 'manifest.webmanifest', ...walk('icons').filter(f => f.endsWith('.png')), ...walk('js').filter(f => f.endsWith('.js'))]
  .map(f => f.split(path.sep).join('/')).sort();
// shared site files the page uses (outside this folder): what index.html links to, and what those stylesheets (and ours)
// pull in with @import and url(), followed all the way down, so the guide looks the same with no signal
const rel = (from, ref) => path.relative(dir, path.resolve(path.dirname(path.join(dir, from)), ref.replace(/[?#].*$/, ''))).split(path.sep).join('/');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const found = new Set();
const queue = [...html.matchAll(/(?:href|src)="(\.\.\/[^"]+)"/g)].map(m => rel('index.html', m[1])).concat(['style.css']);
while (queue.length) {
  const f = queue.shift();
  // resources only (styles, scripts, images, fonts), not links to other pages or folders
  if (found.has(f) || !/\.(css|js|svg|png|webp|woff2)$/.test(f) || !fs.existsSync(path.join(dir, f))) continue;
  found.add(f);
  if (f.endsWith('.css')) {
    const css = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of css.matchAll(/@import\s+url\(\s*["']?([^"')]+)["']?\s*\)|url\(\s*["']?([^"')]+\.woff2)["']?\s*\)/g)) {
      const ref = m[1] || m[2];
      if (!/^(data:|https?:)/.test(ref)) queue.push(rel(f, ref));
    }
  }
}
const site = [...found].filter(f => f.startsWith('../')).sort();
for (const f of [...shell, ...site]) if (!fs.existsSync(path.join(dir, f))) { console.error('missing ' + f); process.exit(1); }

const list = a => '[' + a.map(f => `'${f}'`).join(', ') + ']';
const withLists = sw.replace(/const SHELL = \[[\s\S]*?\];/, `const SHELL = ${list(['./', ...shell])};`).replace(/const SITE = \[[\s\S]*?\];/, `const SITE = ${list(site)};`);

export function versionOf(text) {
  const h = crypto.createHash('sha256');
  for (const f of [...shell, ...site]) h.update(f + '\0').update(fs.readFileSync(path.join(dir, f))).update('\0');
  h.update(text.replace(/const VERSION = '[^']*';/, '')); // the worker's own code counts too
  return h.digest('hex').slice(0, 8);
}
const hash = versionOf(withLists), have = sw.match(/const VERSION = '([^']*)'/)?.[1];
const ok = withLists === sw && (have || '').endsWith('-' + hash);
const want = `mo-${new Date().toISOString().slice(0, 10)}-${hash}`;
if (process.argv.includes('--check')) {
  if (!ok) { console.error(`sw.js is stale (VERSION ${have}, files give ${hash}${withLists === sw ? '' : ', file list changed'}). Run: node mo/tools/stamp.mjs`); process.exit(1); }
  console.log(`sw.js VERSION ok (${have})`);
} else if (!ok) {
  fs.writeFileSync(swPath, withLists.replace(/const VERSION = '[^']*';/, `const VERSION = '${want}';`));
  console.log(`sw.js VERSION ${have} -> ${want} (${shell.length} app files, ${site.length} site files)`);
} else console.log(`sw.js VERSION already ${have}`);
