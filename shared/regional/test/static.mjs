#!/usr/bin/env node
// Regional anaesthesia app: repository checks that need no browser (plan §3, §11.6, §11.8, owner rules).
//
//   node shared/regional/test/static.mjs        options: --json=<file>   --failsOnly
//
// Checks:
//   1. nothing in the repo imports or links through the old-path shims (truncal/shared/**, head-neck/shared/js/head.js,
//      lower-limb/shared/js/leg.js), and nothing points at the old brachial-plexus/vendor/three;
//   2. every regional page keeps its noindex tag;
//   3. no "FRCA" in the regional pages (say exam / MMed);
//   4. the only service worker the regional pages register is /regional-sw.js (from shared/regional/js/offline.js), and
//      that worker only answers the regional paths (loaded in a sandbox and asked about regional and other paths);
//   5. no personal e-mail addresses (only contact@anantf.com) or phone numbers in the regional pages;
//   6. engine entry points are versioned (?v=) once, never "?v=…?v=…";
//   7. every relative import / script / stylesheet in the regional pages points at a file that exists;
//   9. the home-screen manifest (blocks/manifest.webmanifest): valid, icons exist, start_url /blocks/, standalone, and every
//      regional page links it;
//   8. the test allow-lists are valid JSON with a reason for every entry.

import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { ROOT, HERE, PAGES, reporter, walk } from './lib.mjs';

const R = reporter('Static');
const REGIONAL_DIRS = ['truncal', 'head-neck', 'lower-limb', 'upper-limb', 'brachial-plexus', 'plexus', 'spinal', 'shared/regional', 'blocks'];
const EXCLUDE = (f) => f.startsWith('lower-limb/anim/') || f.startsWith('shared/regional/test/') || f.includes('/vendor/') || f.startsWith('shared/vendor/');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const files = walk(REGIONAL_DIRS, ['.js', '.mjs', '.html', '.css']).filter((f) => !EXCLUDE(f));
const htmlFiles = [...files.filter((f) => f.endsWith('.html')), ...['regional.html', 'ra.html', 'draft-ra.html'].filter((f) => fs.existsSync(path.join(ROOT, f)))];
const SHIMS = new Set([
  ...(fs.existsSync(path.join(ROOT, 'truncal/shared/js')) ? fs.readdirSync(path.join(ROOT, 'truncal/shared/js')).map((f) => `truncal/shared/js/${f}`) : []),
  'truncal/shared/css/truncal.css', 'head-neck/shared/js/head.js', 'lower-limb/shared/js/leg.js',
]);
const isShim = (f) => SHIMS.has(f);

/** Every module / script / stylesheet reference in a file: [{spec, line}]. */
function refsOf(f, src) {
  const out = [];
  const lines = src.split('\n');
  const RE = [
    /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bexport\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /<script[^>]+src=["']([^"']+)["']/g,
    /<link[^>]+href=["']([^"']+\.css[^"']*)["']/g,
    /@import\s+(?:url\()?["']?([^"')\s]+)["']?\)?/g,
  ];
  lines.forEach((line, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
    for (const re of RE) for (const m of line.matchAll(re)) out.push({ spec: m[1], line: i + 1 });
  });
  // Import maps: "three": "../shared/vendor/three-r160/three.module.js"
  for (const m of src.matchAll(/<script type="importmap">([\s\S]*?)<\/script>/g)) {
    try { for (const v of Object.values(JSON.parse(m[1]).imports || {})) out.push({ spec: v, line: 0 }); } catch { out.push({ spec: '<invalid import map>', line: 0 }); }
  }
  return out;
}
function resolveRef(f, spec) {
  if (/^(https?:)?\/\//.test(spec) || /^(data|blob|mailto):/.test(spec) || spec.startsWith('#') || /^[a-z@][\w./-]*$/i.test(spec) && !spec.includes('/') && !spec.endsWith('.js') && !spec.endsWith('.css')) return null;
  if (/^(three|three\/addons\/)/.test(spec)) return null; // bare specifiers resolved by the import map
  if (/^node:/.test(spec)) return null; // Node built-ins (shared/regional/tools/)
  if (spec.includes('${')) return null; // template literal, built at run time
  const clean = spec.split(/[?#]/)[0];
  const abs = clean.startsWith('/') ? clean.slice(1) : path.posix.normalize(path.posix.join(path.posix.dirname(f), clean));
  return abs;
}

// 1 + 7. shims and broken references
{
  const through = []; const broken = []; const oldVendor = []; const doubleV = [];
  const scan = [...files, ...htmlFiles.filter((f) => !files.includes(f)), ...walk(['mo', 'babymo', 'assets'], ['.js', '.mjs', '.html', '.css']).filter((f) => !EXCLUDE(f))];
  for (const f of new Set(scan)) {
    const src = read(f);
    if (/brachial-plexus\/vendor\/three/.test(src) && !isShim(f)) oldVendor.push(f);
    for (const { spec, line } of refsOf(f, src)) {
      if (/\?v=[^'"?]*\?v=/.test(spec)) doubleV.push(`${f}:${line}: ${spec}`);
      const abs = resolveRef(f, spec);
      if (!abs) continue;
      if (SHIMS.has(abs) && !isShim(f)) through.push(`${f}:${line}: ${spec}`);
      if (REGIONAL_DIRS.some((d) => f.startsWith(d)) || htmlFiles.includes(f)) {
        const p = path.join(ROOT, abs);
        const dirOk = spec.split(/[?#]/)[0].endsWith('/') && fs.existsSync(p) && fs.statSync(p).isDirectory(); // import-map prefix
        if (!dirOk && (!fs.existsSync(p) || (fs.statSync(p).isDirectory() && !fs.existsSync(path.join(p, 'index.html'))))) broken.push(`${f}:${line}: ${spec} → /${abs}`);
      }
    }
  }
  R.check('nothing imports or links through the old-path shims', !through.length, through.join('\n'));
  R.check('nothing points at the old brachial-plexus/vendor/three', !oldVendor.length, oldVendor.join('\n'));
  R.check('every relative import, script and stylesheet in the regional pages exists', !broken.length, broken.join('\n'));
  R.check('no doubled cache-busting query (?v=…?v=…)', !doubleV.length, doubleV.join('\n'));
  // Shims themselves still point at real files.
  const badShim = [];
  for (const s of SHIMS) {
    if (!fs.existsSync(path.join(ROOT, s))) { badShim.push(`${s} missing`); continue; }
    for (const { spec } of refsOf(s, read(s))) { const abs = resolveRef(s, spec); if (abs && !fs.existsSync(path.join(ROOT, abs))) badShim.push(`${s} → ${spec} (missing)`); }
  }
  R.check(`all ${SHIMS.size} shims exist and point at real files`, !badShim.length, badShim.join('\n'));
}

// 2. noindex
{
  const pages = htmlFiles.filter((f) => /(^|\/)index\.html$/.test(f) && !f.startsWith('shared/'));
  const missing = pages.filter((f) => !/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(read(f)));
  R.check(`noindex on every regional page (${pages.length} pages)`, pages.length && !missing.length, `missing: ${missing.join(', ')}`);
}

// 2b. home-screen manifest
{
  const m = (() => { try { return JSON.parse(read('blocks/manifest.webmanifest')); } catch (e) { return { error: e.message }; } })();
  const iconsOk = (m.icons || []).every((i) => fs.existsSync(path.join(ROOT, i.src.replace(/^\//, ''))));
  const maskable = (m.icons || []).some((i) => /maskable/.test(i.purpose || ''));
  R.check('manifest: valid, start_url /blocks/, standalone, icons exist (one maskable)', !m.error && m.start_url === '/blocks/' && m.display === 'standalone' && m.scope === '/' && (m.icons || []).length >= 3 && iconsOk && maskable, JSON.stringify(m).slice(0, 200));
  const want = PAGES.filter((p) => p !== 'regional.html').map((p) => (p.endsWith('/') ? p + 'index.html' : p));
  const lacking = want.filter((f) => !/<link\s+rel=["']manifest["']\s+href=["'][^"']*blocks\/manifest\.webmanifest["']/.test(read(f)));
  R.check(`every regional page links the manifest (${want.length} pages)`, !lacking.length, `missing: ${lacking.join(', ')}`);
}

// 3. FRCA
{
  const hits = [];
  for (const f of [...files, 'regional.html'].filter((x) => fs.existsSync(path.join(ROOT, x)))) {
    read(f).split('\n').forEach((l, i) => { if (/FRCA/.test(l)) hits.push(`${f}:${i + 1}: ${l.trim().slice(0, 100)}`); });
  }
  R.check('no "FRCA" in the regional pages (say exam / MMed)', !hits.length, hits.join('\n'));
}

// 4. service workers: only the regional offline worker, and it only claims regional paths
{
  const OFFLINE = 'shared/regional/js/offline.js';
  const hits = [...files, ...htmlFiles].filter((f) => f !== OFFLINE && /serviceWorker\s*\.\s*register\s*\(/.test(read(f)));
  R.check('no regional page registers a service worker except through shared/regional/js/offline.js', !hits.length, hits.join(', '));
  const off = fs.existsSync(path.join(ROOT, OFFLINE)) ? read(OFFLINE) : '';
  const regs = [...off.matchAll(/serviceWorker\s*\.\s*register\s*\(([^,)]+)/g)].map((m) => m[1].trim());
  R.check('offline.js registers only /regional-sw.js', regs.length === 1 && regs[0] === 'SW_URL.href' && /const SW_URL = new URL\('\.\.\/\.\.\/\.\.\/regional-sw\.js', import\.meta\.url\)/.test(off), `registers: ${regs.join(', ') || 'nothing'}`);
  const delOk = off.split('\n').filter((l) => /caches\.delete\(/.test(l)).every((l) => /startsWith\(PREFIX\)/.test(l)) && /const PREFIX = 'regional-';/.test(off);
  R.check('"Get the latest version" deletes only the regional- caches', delOk);

  // Load the worker in a sandbox (as served from https://anantf.com/regional-sw.js) and ask it about paths.
  const src = read('regional-sw.js');
  const ctx = vm.createContext({ self: { location: new URL('https://anantf.com/regional-sw.js'), addEventListener() {} }, URL, Set });
  let sw = null;
  try { vm.runInContext(src, ctx); sw = vm.runInContext('({ claims, strategy, PREFIXES, PAGES, SHELL, SITE, SITE_MEDIA, VERSION, MEDIA, KIT })', ctx); } catch (e) { R.check('regional-sw.js loads', false, e.message); }
  if (sw) {
    const ALLOWED = ['blocks/', 'truncal/', 'head-neck/', 'lower-limb/', 'upper-limb/', 'brachial-plexus/', 'plexus/', 'spinal/', 'shared/regional/', 'shared/us/', 'shared/vendor/three-r160/'];
    const badPrefix = sw.PREFIXES.filter((p) => !ALLOWED.includes(p.replace(/^\//, '')));
    R.check('regional-sw.js claims only the regional folders', !badPrefix.length && sw.PAGES.every((p) => p === '/regional.html'), `extra: ${[...badPrefix, ...sw.PAGES.filter((p) => p !== '/regional.html')].join(', ')}`);
    const inRegional = (f) => ALLOWED.some((d) => f.startsWith(d)) || f === 'regional.html';
    const badShell = sw.SHELL.filter((f) => !inRegional(f));
    // the app kit is the one cross-origin entry: app.css and its fonts on design.anantf.com/v1/
    const isKitUrl = (f) => /^https:\/\/design\.anantf\.com\/v1\/(app\.css|fonts\/[\w.-]+\.woff2)$/.test(f);
    const badSite = [...sw.SITE.filter((f) => !isKitUrl(f)), ...sw.SITE_MEDIA].filter((f) => !/^(assets\/[\w./-]+\.(css|js|svg|png|webp|jpe?g)|fonts\/[\w.-]+\.woff2|[\w.-]+\.svg)$/.test(f));
    R.check('precache lists hold only regional files and shared site styles, scripts, pictures and fonts', !badShell.length && !badSite.length, [...badShell, ...badSite].join(', '));
    const mustClaim = ['/blocks/', '/regional.html', '/shared/regional/js/shell.js', '/shared/us/truncal/esp-1.jpg', '/plexus/model/lumbar.glb', '/shared/vendor/three-r160/build/three.module.min.js',
      ...PAGES.map((p) => '/' + p), '/fonts/inter.woff2'];
    const mustNot = ['/', '/index.html', '/airway.html', '/edit.html', '/draft.html', '/resources.html', '/regional-sw.js', '/mo/', '/mo/index.html', '/mo/sw.js', '/mo/js/app.js', '/mo/style.css',
      '/qbank/', '/qbank/sw.js', '/qbank/bank/questions.json', '/babymo/', '/babymo/sw.js', '/babymo/js/app.js', '/exams/', '/exams/reference/x.pdf', '/pocus/cardiac/',
      '/popliteal/', '/popliteal-animation/', '/assets/app/specimen.html', '/assets/regional-x.css', '/shared/vendor/other/x.js', '/blocks-old/', '/spinalx/'];
    const missed = mustClaim.filter((p) => !sw.claims(p));
    const wrong = mustNot.filter((p) => sw.claims(p));
    R.check(`regional-sw.js answers the regional paths (${mustClaim.length} checked)`, !missed.length, `not claimed: ${missed.join(', ')}`);
    R.check(`regional-sw.js leaves every other path alone (${mustNot.length} checked: home, mo/, qbank/, babymo/, exams/, …)`, !wrong.length, `claimed: ${wrong.join(', ')}`);
    const need = ['blocks/safety/', 'blocks/safety/safety.js', 'blocks/indication/', 'blocks/indication/indication.js', 'blocks/ultrasound/', 'blocks/ultrasound/ultrasound.js', 'blocks/chooser.js', 'blocks/pagebar.js', 'blocks/pages.css'];
    R.check('the three screens added 16 Oct 2026 (Safety, Indication, Ultrasound anatomy) and their shared files are in the offline precache list', need.every((f) => sw.SHELL.includes(f)), need.filter((f) => !sw.SHELL.includes(f)).join(', '));
    const swDel = src.split('\n').filter((l) => /caches\.delete\(/.test(l));
    R.check('regional-sw.js caches are named regional-… and it deletes only those', /^regional-/.test(sw.VERSION) && /^regional-media-/.test(sw.MEDIA) && swDel.length > 0 && swDel.every((l) => /startsWith\('regional-'\)/.test(l)), swDel.join('\n'));
    // other origins: only the app kit URLs in SITE are answered (cache first); everything else returns untouched
    const guard = /addEventListener\('fetch'[\s\S]*?if \(req\.method !== 'GET'\) return;[\s\S]*?if \(url\.origin !== self\.location\.origin\) \{\s*if \(KIT\.has\(url\.origin \+ url\.pathname\)\) e\.respondWith\([^\n]*\);\s*return;\s*\}\s*if \(!claims\(url\.pathname\)\) return;/.test(src);
    const kitOk = sw.KIT.size > 0 && [...sw.KIT].every(isKitUrl) && [...sw.KIT].every((u) => sw.SITE.includes(u)) && sw.SITE.filter((u) => /^https?:/.test(u)).every((u) => sw.KIT.has(u));
    R.check('regional-sw.js returns without respondWith for other origins (apart from the app kit in SITE), non-GET requests and unclaimed paths', guard && kitOk, `guard ${guard}, kit ${[...(sw.KIT || [])].join(', ')}`);
  }
}

// 5. personal contact details
{
  const hits = [];
  for (const f of files) {
    const src = read(f);
    for (const m of src.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g)) if (!/^contact@anantf\.com$/i.test(m[0]) && !/@\d|\.(js|css|png|svg|glb)$/.test(m[0]) && !/^[\w-]+@\d/.test(m[0])) hits.push(`${f}: ${m[0]}`);
    for (const m of src.matchAll(/(?:\+65[\s-]?)?\b[689]\d{3}[\s-]\d{4}\b/g)) hits.push(`${f}: phone-like "${m[0]}"`);
  }
  R.check('no personal e-mail addresses or phone numbers (public contact is contact@anantf.com)', !hits.length, [...new Set(hits)].join('\n'));
}

// 6. versioned entry points
{
  const bad = [];
  for (const f of htmlFiles.filter((x) => /^(truncal|head-neck|lower-limb|upper-limb)\/[\w-]+\/index\.html$/.test(x))) {
    const src = read(f);
    if (!/src=["']js\/page\.js\?v=\d+["']/.test(src)) bad.push(`${f}: js/page.js has no ?v=`);
    if (!/regional\.css\?v=\d+/.test(src)) bad.push(`${f}: regional.css has no ?v=`);
  }
  R.check('engine page entry points carry ?v=', !bad.length, bad.join('\n'));
}

// 8. allow-lists
{
  const why = [];
  for (const name of ['parity-allow.json', 'data-allow.json']) {
    const f = path.join(HERE, name);
    if (!fs.existsSync(f)) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { why.push(`${name}: ${e.message}`); continue; }
    const walkWhy = (o, at) => {
      if (Array.isArray(o)) o.forEach((x, i) => { if (x && typeof x === 'object') { if (!x.why) why.push(`${name} ${at}[${i}] has no "why"`); } });
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!k.startsWith('_')) walkWhy(v, `${at}.${k}`);
    };
    walkWhy(j, '');
    for (const [p, v] of Object.entries(j)) for (const x of [...(v.missingPatterns || []), ...(v.renames || []).map((r) => ({ re: r.from }))]) { try { new RegExp(x.re); } catch (e) { why.push(`${name} ${p}: bad regex ${x.re}`); } }
  }
  R.check('test allow-lists are valid and every entry says why', !why.length, why.join('\n'));
}

process.exit(R.finish());
