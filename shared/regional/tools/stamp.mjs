// Writes the offline file lists (SHELL: the regional app's pages, scripts, styles and data; SITE: the shared site
// header, styles, logos and fonts those pages use; SITE_MEDIA: the site pictures they use, kept on first use) and VERSION / MEDIA hashes into /regional-sw.js, so a phone that
// has the regional app gets the new files whenever any of them changes.
// Run after changing anything in the regional folders (blocks/, truncal/, head-neck/, lower-limb/, brachial-plexus/,
// plexus/, spinal/, shared/regional/, shared/us/) or the shared site files they use:
//     node shared/regional/tools/stamp.mjs          rewrites SHELL, SITE, VERSION and MEDIA in regional-sw.js
//     node shared/regional/tools/stamp.mjs --check  only checks (shared/regional/test/version.test.mjs); exits 1 if stale
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { kitRefs, isKit } from '../../../tools/app-kit.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const swPath = path.join(root, 'regional-sw.js');
const sw = fs.readFileSync(swPath, 'utf8');
const posix = (f) => f.split(path.sep).join('/');
const exists = (f) => fs.existsSync(path.join(root, f));

// The regional folders (the same list as PREFIXES in regional-sw.js).
const DIRS = ['blocks', 'truncal', 'head-neck', 'lower-limb', 'upper-limb', 'brachial-plexus', 'plexus', 'spinal', 'shared/regional', 'shared/us', 'shared/vendor/three-r160'];
const walk = (d) => (exists(d) ? fs.readdirSync(path.join(root, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [posix(path.join(d, e.name))])) : []);
const all = DIRS.flatMap(walk).sort();

// Big or rarely used files are kept on first use instead (cache first in the worker): models, three.js, scans, pictures.
const isMedia = (f) => f.startsWith('shared/vendor/') || f.includes('/model/') || /\.(png|jpe?g|webp|gif|avif|svg|glb|gltf|bin|wasm|mp4|webm|ktx2)$/i.test(f);
const isShell = (f) => !isMedia(f) && /\.(html|js|css|json)$/.test(f) && !f.includes('/tools/') && !f.includes('/test/');
// Pages are saved under their folder ("blocks/"), the way they are opened.
const shell = [...all.filter(isShell), 'regional.html'].map((f) => f.replace(/(^|\/)index\.html$/, '$1')).sort();
const media = all.filter(isMedia);

// Shared site files the pages use (outside the regional folders): what the pages link to, and what those stylesheets
// pull in with @import and url(), followed all the way down, so the pages look the same with no signal.
const inRegional = (f) => DIRS.some((d) => f.startsWith(d + '/')) || f === 'regional.html';
const rel = (from, ref) => posix(path.normalize(path.join(path.dirname(from), ref.replace(/[?#].*$/, ''))));
const found = new Set();
const kit = new Set(); // app kit URLs (with the fonts app.css loads), hashed by URL: tools/app-kit.mjs
const queue = [];
for (const f of shell) {
  const file = f.endsWith('/') ? f + 'index.html' : f;
  if (!/\.(html|css)$/.test(file)) continue;
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of src.matchAll(/(?:href|src)="([^"#:]+)"/g)) queue.push(rel(file, m[1]));
  if (file.endsWith('.html')) for (const u of kitRefs(src)) kit.add(u); // the app kit on design.anantf.com/v1/
  if (file.endsWith('.css')) for (const m of src.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) if (!/^(data:|https?:|#)/.test(m[1])) queue.push(rel(file, m[1]));
}
while (queue.length) {
  const f = queue.shift();
  if (found.has(f) || f.startsWith('..') || inRegional(f) || !/\.(css|js|svg|png|webp|jpe?g|woff2)$/.test(f) || !exists(f)) continue;
  found.add(f);
  if (f.endsWith('.css')) {
    const css = fs.readFileSync(path.join(root, f), 'utf8');
    for (const m of css.matchAll(/@import\s+(?:url\()?\s*["']?([^"')\s;]+)["']?|url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      const ref = m[1] || m[2];
      if (!/^(data:|https?:|#)/.test(ref)) queue.push(rel(f, ref));
    }
  }
}
// Fonts, styles, scripts and logos are precached; the bigger site pictures (banners) are kept on first use.
const site = [...[...found].filter((f) => !/\.(png|webp|jpe?g)$/.test(f)), ...kit].sort();
const siteMedia = [...found].filter((f) => /\.(png|webp|jpe?g)$/.test(f)).sort();
for (const f of [...shell.map((x) => (x.endsWith('/') ? x + 'index.html' : x)), ...site, ...siteMedia]) if (!isKit(f) && !exists(f)) { console.error('missing ' + f); process.exit(1); }

const list = (a) => '[' + a.map((f) => `'${f}'`).join(', ') + ']';
const withLists = sw.replace(/const SHELL = \[[\s\S]*?\];/, `const SHELL = ${list(shell)};`).replace(/const SITE = \[[\s\S]*?\];/, `const SITE = ${list(site)};`).replace(/const SITE_MEDIA = \[[\s\S]*?\];/, `const SITE_MEDIA = ${list(siteMedia)};`);

const hashOf = (files, extra = '') => {
  const h = crypto.createHash('sha256');
  for (const f of files) h.update(f + '\0').update(isKit(f) ? '' : fs.readFileSync(path.join(root, f.endsWith('/') ? f + 'index.html' : f))).update('\0');
  h.update(extra);
  return h.digest('hex').slice(0, 8);
};
// The worker's own code counts too (without its VERSION and MEDIA lines).
const hash = hashOf([...shell, ...site], withLists.replace(/const (VERSION|MEDIA) = '[^']*';/g, ''));
const mediaHash = hashOf([...media, ...siteMedia]);
const have = sw.match(/const VERSION = '([^']*)'/)?.[1] || '';
const haveMedia = sw.match(/const MEDIA = '([^']*)'/)?.[1] || '';
const ok = withLists === sw && have.endsWith('-' + hash) && haveMedia === `regional-media-${mediaHash}`;
const want = `regional-${new Date().toISOString().slice(0, 10)}-${hash}`;
if (process.argv.includes('--check')) {
  if (!ok) { console.error(`regional-sw.js is stale (VERSION ${have}, files give ${hash}; MEDIA ${haveMedia}, files give ${mediaHash}${withLists === sw ? '' : '; file list changed'}). Run: node shared/regional/tools/stamp.mjs`); process.exit(1); }
  console.log(`regional-sw.js VERSION ok (${have}, ${shell.length} app files, ${site.length} site files, media ${mediaHash})`);
} else if (!ok) {
  const out = withLists
    .replace(/const VERSION = '[^']*';/, `const VERSION = '${have.endsWith('-' + hash) ? have : want}';`)
    .replace(/const MEDIA = '[^']*';/, `const MEDIA = 'regional-media-${mediaHash}';`);
  fs.writeFileSync(swPath, out);
  console.log(`regional-sw.js VERSION ${have} -> ${out.match(/const VERSION = '([^']*)'/)[1]}, MEDIA ${haveMedia} -> regional-media-${mediaHash} (${shell.length} app files, ${site.length} site files)`);
} else console.log(`regional-sw.js VERSION already ${have}`);
