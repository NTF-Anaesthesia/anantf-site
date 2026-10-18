// Regional anaesthesia app: helpers shared by the shared/regional/test suites (plan §11).
//
// Every suite runs against a static server on the repo root (default http://localhost:8765/):
//   cd <repo> && python3 -m http.server 8765
// and the global Playwright (chromium). Common options: --base=<url>  --pages=a/,b/  --viewports=390,1440
// --workers=<n>  --json=<file> (write the machine-readable result as well).

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let pw = null;
/** The global Playwright module (loaded on first use, so static suites run without it). */
export function playwright() {
  if (!pw) pw = require(`${execSync('npm root -g').toString().trim()}/playwright`);
  return pw;
}

export const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '../../..');
export const BASEDIR = path.join(HERE, 'baseline');

/** Every regional page (plan §1): truncal ×4, head-neck ×6, lower-limb ×5, upper-limb ×4, brachial-plexus, plexus, spinal, regional.html, settings, Safety, Indication and Ultrasound anatomy (the three screens added 16 Oct 2026). */
export const PAGES = [
  'truncal/', 'truncal/back/', 'truncal/chest-wall/', 'truncal/abdominal-wall/',
  'head-neck/', 'head-neck/cervical/', 'head-neck/scalp/', 'head-neck/face/', 'head-neck/airway/', 'head-neck/eye/',
  'lower-limb/', 'lower-limb/hip/', 'lower-limb/knee/', 'lower-limb/foot-ankle/', 'lower-limb/thigh/',
  'upper-limb/', 'upper-limb/shoulder/', 'upper-limb/arm/', 'upper-limb/forearm-hand/',
  'brachial-plexus/', 'plexus/', 'spinal/', 'regional.html', 'blocks/settings/',
  'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/',
];
/** Pages built on the shared engine (bootPage + renderBlock), with their block data module. */
export const ENGINE_PAGES = [
  'truncal/back/', 'truncal/chest-wall/', 'truncal/abdominal-wall/',
  'head-neck/cervical/', 'head-neck/scalp/', 'head-neck/face/', 'head-neck/airway/', 'head-neck/eye/',
  'lower-limb/hip/', 'lower-limb/knee/', 'lower-limb/foot-ankle/', 'lower-limb/thigh/',
  'upper-limb/shoulder/', 'upper-limb/arm/', 'upper-limb/forearm-hand/',
];
export const LANDINGS = ['truncal/', 'head-neck/', 'lower-limb/', 'upper-limb/'];
/** Region apps that mount the level control (engine pages + the three own apps). */
export const LEVEL_PAGES = [...ENGINE_PAGES, 'brachial-plexus/', 'plexus/', 'spinal/'];

export const VIEWPORTS = {
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
export const DOSE_RE = /\d+(?:\.\d+)?\s*(?:mg\/kg|mL|ml|mg|%)/g;

// ------------------------------------------------------------------ arguments
export const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
export const BASE = String(args.base || 'http://localhost:8765/').replace(/\/?$/, '/');
export const listArg = (name, dflt) => (args[name] ? String(args[name]).split(',').filter(Boolean) : dflt);

export const slug = (p) => p.replace(/\.html$/, '').replace(/\/$/, '').replace(/\//g, '__') || 'index';

// ------------------------------------------------------------------ text helpers (shared with the WP0 baseline)
/** Lines whose presence depends on layout timing (shown only while a figure is wider than its box). */
export const VOLATILE = [/^Scroll sideways to see the whole/];
export const normLines = (t) => String(t || '').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1 && !VOLATILE.some((re) => re.test(l)));
export function doses(texts) {
  const out = {};
  for (const t of texts) for (const m of String(t).match(DOSE_RE) || []) { const k = m.replace(/\s+/g, ' '); out[k] = (out[k] || 0) + 1; }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}
/** All the text a page run captured (chapters, app panels, scan step text). */
// Keys starting with "~" hold extra views of text already counted (e.g. one ultrasound view at a time): they count for
// line presence but not for dose-string counts, so the counts stay comparable with the baseline.
export const allTextOf = (r, { forDoses = false } = {}) => [
  ...Object.values(r?.text || {}),
  ...Object.entries(r?.extra || {}).filter(([k]) => !(forDoses && k.startsWith('~'))).map(([, v]) => v),
  ...Object.values(r?.scans || {}).flatMap((v) => Object.entries(v).filter(([k]) => !(forDoses && k.startsWith('~'))).flatMap(([, t]) => t)),
];

// ------------------------------------------------------------------ server + browser
export async function ensureServer() {
  try {
    const res = await fetch(BASE, { method: 'GET' });
    if (res.ok) return true;
  } catch { /* fall through */ }
  console.error(`No server at ${BASE}. Start one on the repo root:\n  cd ${ROOT} && python3 -m http.server 8765`);
  process.exit(2);
}

export async function launch() {
  await ensureServer();
  return playwright().chromium.launch();
}

/**
 * A fresh context + page with logging. opts: { vp: '390'|'1440', level?: 'mo'|'resident'|'consultant', storage?: {k: v},
 * dismissPicker = true }. Returns { ctx, page, log }.
 */
export async function openContext(browser, { vp = '390', level = null, storage = null, dismissPicker = true, reducedMotion = 'reduce' } = {}) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion });
  const init = { ...(storage || {}) };
  // RA_SKIN=app (or web) runs any suite in that look (the default is the website look, as a visitor gets it).
  if (process.env.RA_SKIN && !('ra-skin' in init)) init['ra-skin'] = process.env.RA_SKIN;
  if (level) init['ra-level'] = level;
  if (dismissPicker && !('ra-level-picker' in init)) init['ra-level-picker'] = 'dismissed';
  if (Object.keys(init).length) {
    await ctx.addInitScript((kv) => {
      // Only seed once per context (a reload must keep what the page saved).
      try { if (!sessionStorage.getItem('__ra_seeded')) { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem('__ra_seeded', '1'); } } catch { /* blocked */ }
    }, init);
  }
  const page = await ctx.newPage();
  const log = attachLog(page);
  return { ctx, page, log };
}

export function attachLog(page) {
  const log = { console: [], pageErrors: [], bad: [], failed: [], three: [], requests: [] };
  page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message || e).slice(0, 300)));
  page.on('request', (r) => log.requests.push(r.url().replace(BASE, '/')));
  page.on('response', (r) => {
    const u = r.url().replace(BASE, '/');
    if (r.status() >= 400) log.bad.push(`${r.status()} ${u}`);
    if (/\.glb(\?|$)|draco|three\.module/i.test(u)) log.three.push(`${r.status()} ${u}`);
  });
  page.on('requestfailed', (r) => { const f = r.failure()?.errorText || ''; log.failed.push(`${f} ${r.method()} ${r.url().replace(BASE, '/')}`); });
  return log;
}

/** Wait until the app has booted: engine pages set body[data-tb-ready]; others wait for load + network idle. */
export async function waitReady(page, { idle = true } = {}) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => {
    const b = document.body;
    if (!b) return false;
    if (b.classList.contains('tb-app') && document.querySelector('#tb-bar, .tb-chapter')) return b.dataset.tbReady === 'true' || !document.querySelector('.tb-chapter');
    return true;
  }, null, { timeout: 30000 }).catch(() => {});
  if (idle) await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
}

/** Run jobs with N parallel workers; fn(job) → result. Progress on stderr. */
export async function pool(jobs, N, fn, label = (j) => String(j)) {
  const out = new Array(jobs.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, Math.min(N, jobs.length)) }, async () => {
    while (next < jobs.length) {
      const i = next++;
      const t0 = Date.now();
      try { out[i] = await fn(jobs[i]); } catch (err) { out[i] = { error: String(err?.message || err).split('\n')[0] }; }
      if (!args.quiet) process.stderr.write(`  ${label(jobs[i])} ${Date.now() - t0}ms${out[i]?.error ? ` ERROR ${out[i].error}` : ''}\n`);
    }
  }));
  return out;
}

// ------------------------------------------------------------------ reporting
/** A tiny reporter: r.check(name, ok, detail) / r.warn(name, detail); r.finish() prints and returns the exit code. */
export function reporter(title) {
  const rows = [];
  return {
    rows,
    check(name, ok, detail = '') { rows.push({ name, ok: !!ok, detail: ok ? '' : detail }); return !!ok; },
    fail(name, detail) { rows.push({ name, ok: false, detail }); },
    pass(name, detail = '') { rows.push({ name, ok: true, detail, note: detail }); },
    warn(name, detail) { rows.push({ name, ok: true, warn: true, detail }); },
    finish() {
      const fails = rows.filter((r) => !r.ok);
      const warns = rows.filter((r) => r.warn);
      if (!args.failsOnly) for (const r of rows) {
        if (!r.ok) continue;
        console.log(`${r.warn ? 'WARN' : 'PASS'} ${r.name}${r.detail ? `\n   · ${r.detail}` : ''}`);
      }
      for (const r of fails) console.log(`FAIL ${r.name}\n   ✗ ${String(r.detail).split('\n').join('\n     ')}`);
      console.log(`\n${title}: ${rows.length - fails.length}/${rows.length} checks pass${warns.length ? `, ${warns.length} warning(s)` : ''}.`);
      if (args.json) fs.writeFileSync(String(args.json), `${JSON.stringify({ title, rows }, null, 1)}\n`);
      return fails.length ? 1 : 0;
    },
  };
}

export function readJson(file, dflt = null) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return dflt; }
}

/** Reviewed differences from the baseline: shared/regional/test/parity-allow.json. */
export function parityAllow() {
  const a = readJson(path.join(HERE, 'parity-allow.json'), {});
  const lines = (p) => [...(a['*']?.missing || []), ...(a[p]?.missing || [])].map((x) => (typeof x === 'string' ? x : x.line));
  const patterns = (p) => [...(a['*']?.missingPatterns || []), ...(a[p]?.missingPatterns || [])].map((x) => new RegExp(typeof x === 'string' ? x : x.re));
  const doseKeys = (p) => ({ ...(a['*']?.doses || {}), ...(a[p]?.doses || {}) });
  // A rename allows a missing line only when the renamed line is on the page: {from: regex, to: replacement}.
  const renames = (p) => [...(a['*']?.renames || []), ...(a[p]?.renames || [])].map((x) => ({ re: new RegExp(x.from, 'g'), to: x.to }));
  return { lines, patterns, doseKeys, renames };
}

/**
 * Compare one page/viewport capture with its baseline capture. Returns {missing, added, doseDiff, allowed}.
 * Lines listed in parity-allow.json (exact or pattern) are not counted as missing; dose keys listed there may change.
 */
export function compareText(pageId, baseCapture, nowCapture) {
  const allow = parityAllow();
  const baseLines = new Set(normLines(allTextOf(baseCapture).join('\n')));
  const nowLines = new Set(normLines(allTextOf(nowCapture).join('\n')));
  const al = new Set(allow.lines(pageId));
  const ap = allow.patterns(pageId);
  const missingAll = [...baseLines].filter((l) => !nowLines.has(l));
  const rn = allow.renames(pageId);
  const nowLower = new Set([...nowLines].map((l) => l.toLowerCase())); // CSS text-transform changes case in innerText
  const renamed = (l) => {
    // Apply every matching rename (in order) and see whether the result is on the page now.
    let x = l;
    for (const r of rn) { r.re.lastIndex = 0; if (r.re.test(x)) { r.re.lastIndex = 0; x = x.replace(r.re, r.to); } }
    return x !== l && (nowLines.has(x) || nowLower.has(x.toLowerCase()));
  };
  const allowed = missingAll.filter((l) => al.has(l) || ap.some((re) => re.test(l)) || renamed(l));
  const missing = missingAll.filter((l) => !allowed.includes(l));
  const added = [...nowLines].filter((l) => !baseLines.has(l));
  const d0 = baseCapture?.doses || doses(allTextOf(baseCapture));
  const d1 = doses(allTextOf(nowCapture, { forDoses: true }));
  const okKeys = allow.doseKeys(pageId);
  const keys = new Set([...Object.keys(d0), ...Object.keys(d1)]);
  const doseDiff = [...keys].filter((k) => d0[k] !== d1[k] && !(k in okKeys)).map((k) => `${k}: ${d0[k] || 0}→${d1[k] || 0}`);
  return { missing, added, allowed, doseDiff };
}

// ------------------------------------------------------------------ in-page capture (identical to the WP0 baseline run)
export const FORCE_CSS = '.tb-chapter,.sp-chapter{display:block!important}';

/** Text of each chapter / section with every chapter shown and every <details> open. */
export async function captureText(page) {
  await page.addStyleTag({ content: FORCE_CSS });
  const text = await page.evaluate(() => {
    document.querySelectorAll('details:not(.ra-watch)').forEach((d) => { d.open = true; });
    const SEL = '.tb-chapter, .sp-chapter, main section[id], main [role=tabpanel]';
    const root = document.querySelector('main') || document.body;
    const secs = [...root.querySelectorAll(SEL)].filter((e) => !e.parentElement.closest(SEL));
    const out = {};
    if (!secs.length) out.main = root.innerText;
    else {
      const clone = root.cloneNode(true);
      clone.querySelectorAll(SEL).forEach((e) => e.remove());
      const rest = clone.textContent.replace(/\s+/g, ' ').trim();
      if (rest) out._main = rest;
      secs.forEach((e, i) => { out[e.id || `section-${i}`] = e.innerText; });
    }
    const foot = document.querySelector('.sp-foot, footer:not(.ntf-footer), .tb-foot');
    if (foot && !root.contains(foot)) out._foot = foot.innerText;
    return out;
  });
  // "Watch it done" disclosures build their caption (and iframe) when opened, one at a time: open each, read, close.
  const watches = await page.evaluate(() => [...document.querySelectorAll('details.ra-watch[id]')].map((d) => d.id));
  for (const id of watches) {
    text[`_watch_${id}`] = await page.evaluate(async (id) => {
      const d = document.getElementById(id);
      d.open = true;
      await new Promise((r) => setTimeout(r, 120));
      const t = d.innerText;
      d.open = false;
      return t;
    }, id);
  }
  return text;
}

/** Read text until two reads 150 ms apart agree (panels re-render after a click; slow under load). */
export async function stableText(page, fn) {
  let prev = await page.evaluate(fn);
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(150);
    const now = await page.evaluate(fn);
    if (now === prev) return now;
    prev = now;
  }
  return prev;
}

/** Engine pages: step every scan through its steps in each image type. */
export async function stepScans(page, isPhone) {
  const chapters = await page.evaluate(() => [...document.querySelectorAll('.tb-chapter')].filter((c) => c.querySelector('.tb-scan')).map((c) => c.id));
  const out = {}; const offscreen = [];
  for (const ch of chapters) {
    await page.evaluate((id) => { location.hash = id; }, ch);
    await page.waitForTimeout(150);
    const scans = await page.evaluate((id) => [...document.getElementById(id).querySelectorAll('.tb-scan')].map((f) => f.id), ch);
    for (const sid of scans) {
      const views = await page.evaluate((sid) => { const f = document.getElementById(sid); const v = [...f.querySelectorAll('.tb-scan-ctrls .tb-seg-btn[data-v]')].map((b) => b.dataset.v); return v.length ? v : ['default']; }, sid);
      out[sid] = {};
      for (const v of views) {
        const texts = [];
        if (v !== 'default') await page.evaluate(({ sid, v }) => document.querySelector(`#${CSS.escape(sid)} .tb-seg-btn[data-v="${v}"]`).click(), { sid, v });
        const n = await page.evaluate((sid) => document.querySelectorAll(`#${CSS.escape(sid)} .tb-scan-step`).length, sid);
        for (let i = 0; i < n; i++) {
          await page.evaluate(({ sid, i }) => document.querySelectorAll(`#${CSS.escape(sid)} .tb-scan-step`)[i].click(), { sid, i });
          await page.waitForTimeout(60);
          texts.push(await page.evaluate((sid) => document.querySelector(`#${CSS.escape(sid)} .tb-scan-text`)?.innerText || '', sid));
        }
        if (isPhone && n) {
          await page.evaluate((sid) => document.querySelectorAll(`#${CSS.escape(sid)} .tb-scan-step`)[0].click(), sid);
          await page.waitForTimeout(80);
          const nb = page.locator(`#${sid} .tb-scan-nav .tb-btn`, { hasText: 'Next' }).first();
          if (await nb.count()) {
            await nb.scrollIntoViewIfNeeded().catch(() => {});
            await nb.click({ timeout: 3000 }).catch(() => {});
            await page.waitForTimeout(120);
            const on = await page.evaluate((sid) => { const s = document.querySelector(`#${CSS.escape(sid)} .tb-scan-stage`); if (!s) return true; const r = s.getBoundingClientRect(); return r.bottom > 40 && r.top < innerHeight - 40; }, sid);
            if (!on) offscreen.push(`${sid}/${v}`);
          }
        }
        out[sid][v === 'real' ? '~real' : v] = texts; // the Real view repeats the same step text: lines only, not doses
      }
      // back to the first view, so the page text captured afterwards shows each scan as it opens (with its overlay)
      if (views.length > 1) await page.evaluate(({ sid, v }) => document.querySelector(`#${CSS.escape(sid)} .tb-seg-btn[data-v="${v}"]`)?.click(), { sid, v: views[0] });
    }
  }
  return { scans: out, offscreen };
}

/** Brachial plexus: every block x every tab. The "If it goes wrong" guides stay closed (as on the engine pages, guide
 *  text isn't captured; data.mjs checks it). */
export async function brachialText(page) {
  const out = {};
  const blocks = await page.evaluate(() => [...document.querySelectorAll('#block-chips [data-block]')].map((b) => b.dataset.block).filter(Boolean));
  for (const b of blocks) {
    await page.evaluate((b) => document.querySelector(`#block-chips [data-block="${b}"]`).click(), b);
    await page.waitForTimeout(200);
    for (const t of ['ultrasound', 'guide', 'coverage']) {
      await page.evaluate((t) => document.getElementById(`tab-${t}`)?.click(), t);
      await page.waitForTimeout(150);
      out[`${b}/${t}`] = await stableText(page, () => { document.querySelectorAll('#sec-tabs details:not(.ra-dg-item):not(.ra-dg-all)').forEach((d) => { d.open = true; }); return document.getElementById('sec-tabs')?.innerText || ''; });
      if (t !== 'ultrasound') continue;
      // Views shown one at a time (phones: Simulated / Diagram / Real scan segmented control): read each, and every real image.
      const views = await page.evaluate(() => [...document.querySelectorAll('#sec-tabs button[aria-pressed]')].filter((x) => /^(Simulated|Diagram|Real scan|Real)$/.test(x.textContent.trim()) && x.getClientRects().length).map((x) => x.textContent.trim()));
      const viewPressed = await page.evaluate(() => [...document.querySelectorAll('#sec-tabs button[aria-pressed="true"]')].filter((x) => /^(Simulated|Diagram|Real scan|Real)$/.test(x.textContent.trim())).map((x) => x.textContent.trim()));
      for (const v of views) {
        await page.evaluate((v) => [...document.querySelectorAll('#sec-tabs button[aria-pressed]')].find((x) => x.textContent.trim() === v)?.click(), v);
        await page.waitForTimeout(150);
        if (await page.evaluate((v) => [...document.querySelectorAll('#sec-tabs button[aria-pressed]')].find((x) => x.textContent.trim() === v)?.getAttribute('aria-pressed') !== 'true', v)) {
          await page.evaluate((v) => [...document.querySelectorAll('#sec-tabs button[aria-pressed]')].find((x) => x.textContent.trim() === v)?.click(), v);
          await page.waitForTimeout(150);
        }
        for (let k = 0; k < 8; k++) {
          out[`~${b}/${t}/${v}/${k}`] = await stableText(page, () => document.getElementById('sec-tabs')?.innerText || '');
          const moved = await page.evaluate(() => { const n = [...document.querySelectorAll('#sec-tabs button')].find((x) => /^Next/.test(x.textContent.trim()) && x.closest('figure, [class*="real"]') && x.getClientRects().length && !x.disabled); if (!n) return false; n.click(); return true; });
          if (!moved) break;
          await page.waitForTimeout(120);
        }
      }
      // Restore the views that were on.
      for (const v of views) {
        const want = viewPressed.includes(v);
        await page.evaluate(({ v, want }) => { const x = [...document.querySelectorAll('#sec-tabs button[aria-pressed]')].find((y) => y.textContent.trim() === v); if (x && (x.getAttribute('aria-pressed') === 'true') !== want) x.click(); }, { v, want });
      }
    }
  }
  return out;
}

/** Plexus explorer: every plexus x every block (info panel). */
export async function plexusText(page) {
  const out = {};
  for (const px of ['cervical', 'lumbar', 'sacral']) {
    await page.evaluate((px) => { location.hash = `plexus=${px}`; }, px);
    await page.waitForTimeout(1200);
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    const blocks = await page.evaluate(() => [...document.querySelectorAll('button[data-block]')].map((b) => b.dataset.block));
    for (const b of blocks) {
      await page.evaluate((b) => document.querySelector(`button[data-block="${b}"]`)?.click(), b);
      await page.waitForTimeout(150);
      out[`${px}/${b || 'none'}`] = await stableText(page, () => document.getElementById('sec-info')?.innerText || '');
    }
  }
  // Layer toggles live in a "Layers" menu: open it so its items are captured with the rest of the page.
  await page.evaluate(() => { const b = [...document.querySelectorAll('button[aria-expanded="false"]')].find((x) => /^Layers/.test(x.textContent.trim())); b?.click(); });
  await page.waitForTimeout(150);
  return out;
}

/** Repo files (relative paths) under dirs, filtered by extension. */
export function walk(dirs, exts = ['.js', '.mjs', '.html', '.css']) {
  const out = [];
  const go = (d) => {
    let ents = [];
    try { ents = fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      const rel = path.join(d, e.name);
      if (e.isDirectory()) go(rel);
      else if (exts.includes(path.extname(e.name))) out.push(rel);
    }
  };
  dirs.forEach(go);
  return out;
}
