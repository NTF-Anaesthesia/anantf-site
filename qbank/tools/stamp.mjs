// Writes the offline file lists and a VERSION made from their contents into qbank/sw.js, and the list of papers into
// qbank/papers.json, so a phone that has the app gets new files whenever any of them changes.
//   SHELL: the app (page, manifest, icons, ui/, js/)   SITE: shared files it uses (outside this folder: the app kit
//   ../assets/app/app.css and the fonts it loads)
//   DATA:  the questions and papers (bank/, sources.json, papers.json, papers/, img/)
// Run after changing anything in qbank/ (questions and papers included):
//     node qbank/tools/stamp.mjs          rewrites papers.json, SHELL, SITE, DATA and VERSION
//     node qbank/tools/stamp.mjs --check  only checks (test/version.test.mjs); exits 1 if anything is stale
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const swPath = path.join(dir, 'sw.js'), indexPath = path.join(dir, 'papers.json');
const sw = fs.readFileSync(swPath, 'utf8');
const posix = f => f.split(path.sep).join('/');
const walk = d => !fs.existsSync(path.join(dir, d)) ? [] : fs.readdirSync(path.join(dir, d), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [posix(path.join(d, e.name))]);

// the papers the app lists (every papers/<id>.json)
const papers = walk('papers').filter(f => f.endsWith('.json')).map(f => path.basename(f, '.json')).sort();
const index = JSON.stringify({ about: 'Written by qbank/tools/stamp.mjs: the papers the qbank app lists. Do not edit by hand.', papers }, null, 1) + '\n';
const indexStale = !fs.existsSync(indexPath) || fs.readFileSync(indexPath, 'utf8') !== index;

const shell = ['index.html', 'manifest.webmanifest', ...walk('icons').filter(f => f.endsWith('.png')), ...walk('ui').filter(f => /\.(js|css)$/.test(f)), ...walk('js').filter(f => f.endsWith('.js'))].sort();
// fonts and other files outside this folder that the page or its styles use
const rel = (from, ref) => posix(path.relative(dir, path.resolve(path.dirname(path.join(dir, from)), ref.replace(/[?#].*$/, ''))));
const site = new Set();
for (const m of fs.readFileSync(path.join(dir, 'index.html'), 'utf8').matchAll(/(?:href|src)="(\.\.\/[^"]+\.(?:css|js|svg|png|woff2))"/g)) site.add(rel('index.html', m[1]));
for (const f of shell.filter(f => f.endsWith('.css'))) for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/url\(\s*["']?([^"')]+\.(?:woff2|svg|png))["']?\s*\)/g)) if (!/^(data:|https?:)/.test(m[1])) site.add(rel(f, m[1]));
// and what those outside files use in turn (the app kit's fonts)
for (const f of [...site].filter(f => f.endsWith('.css'))) for (const m of fs.readFileSync(path.join(dir, f), 'utf8').matchAll(/url\(\s*["']?([^"')]+\.(?:woff2|svg|png))["']?\s*\)/g)) if (!/^(data:|https?:)/.test(m[1])) site.add(rel(f, m[1]));
const siteList = [...site].filter(f => f.startsWith('../')).sort();
const data = ['bank/questions.json', 'sources.json', 'papers.json', ...papers.map(p => `papers/${p}.json`), ...walk('img').filter(f => /\.(png|jpe?g|webp|svg)$/.test(f))].sort();
for (const f of [...shell, ...siteList, ...data]) if (f !== 'papers.json' && !fs.existsSync(path.join(dir, f))) { console.error('missing ' + f); process.exit(1); }

const list = a => '[' + a.map(f => `'${f}'`).join(', ') + ']';
const withLists = sw.replace(/const SHELL = \[[\s\S]*?\];/, `const SHELL = ${list(['./', ...shell])};`).replace(/const SITE = \[[\s\S]*?\];/, `const SITE = ${list(siteList)};`).replace(/const DATA = \[[\s\S]*?\];/, `const DATA = ${list(data)};`);

export function versionOf(text) {
  const h = crypto.createHash('sha256');
  for (const f of [...shell, ...siteList, ...data]) h.update(f + '\0').update(f === 'papers.json' ? index : fs.readFileSync(path.join(dir, f))).update('\0');
  h.update(text.replace(/const VERSION = '[^']*';/, '')); // the worker's own code counts too
  return h.digest('hex').slice(0, 8);
}
// VERSION is qbank-<date stamped>-<hash>; the app shows it as "App version <date> (<hash>)". Only the hash is checked.
const hash = versionOf(withLists), have = sw.match(/const VERSION = '([^']*)'/)?.[1];
const ok = !indexStale && withLists === sw && (have || '').endsWith('-' + hash);
const want = `qbank-${new Date().toISOString().slice(0, 10)}-${hash}`;
if (process.argv.includes('--check')) {
  if (!ok) { console.error(`qbank/sw.js is stale (VERSION ${have}, files give ${hash}${withLists === sw ? '' : ', file list changed'}${indexStale ? ', papers.json out of date' : ''}). Run: node qbank/tools/stamp.mjs`); process.exit(1); }
  console.log(`qbank sw.js VERSION ok (${have})`);
} else if (!ok) {
  if (indexStale) fs.writeFileSync(indexPath, index);
  fs.writeFileSync(swPath, withLists.replace(/const VERSION = '[^']*';/, `const VERSION = '${want}';`));
  console.log(`qbank sw.js VERSION ${have} -> ${want} (${shell.length} app files, ${siteList.length} site files, ${data.length} data files)`);
} else console.log(`qbank sw.js VERSION already ${have}`);
