#!/usr/bin/env node
// Regional anaesthesia app: smoke test and content baseline (plan §10 WP0, §11.1).
//
//   node test/regional/smoke.mjs                 compare every regional page with test/regional/baseline/
//   node test/regional/smoke.mjs --baseline      (re)write the baseline (only before a change, never to make a test pass)
//   options: --pages=truncal/back/,spinal/   --viewports=390,1440   --base=http://localhost:8765/
//            --shots=<dir> (screenshots of each page's first screen)   --strict (also fail on the §11 polish checks)
//
// Needs the global Playwright (chromium) and a static server on the repo root:
//   cd <repo> && python3 -m http.server 8765
//
// What it does on each page, at 390x844 (touch, DPR 2) and 1440x900:
//   - loads it, waits for the app to finish booting, records console errors, page errors, responses >= 400
//     and failed requests;
//   - checks horizontal overflow on the first screen, with the chapter menu open, and on every chapter;
//   - steps every scan through its 4 steps in each image type (Ultrasound / Diagram / Real) and records the step text
//     and whether the image is still on screen after Next;
//   - records the §11 polish metrics (text under 12px, small tap targets, sticky bars) as numbers;
//   - captures the text of every chapter / section (all chapters shown, every <details> open), and every
//     dose / volume / concentration string.
// Compare mode fails on: new console or page errors, new responses >= 400 or failed requests, new horizontal
// overflow, any baseline text line missing, any change in the dose strings. --strict adds the polish checks.

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require(`${execSync('npm root -g').toString().trim()}/playwright`);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASEDIR = path.join(HERE, 'baseline');

export const PAGES = [
  'truncal/', 'truncal/back/', 'truncal/chest-wall/', 'truncal/abdominal-wall/',
  'head-neck/', 'head-neck/cervical/', 'head-neck/scalp/', 'head-neck/face/', 'head-neck/airway/', 'head-neck/eye/',
  'lower-limb/', 'lower-limb/hip/', 'lower-limb/knee/', 'lower-limb/foot-ankle/', 'lower-limb/thigh/',
  'brachial-plexus/', 'plexus/', 'spinal/', 'regional.html',
];
export const VIEWPORTS = {
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
export const DOSE_RE = /\d+(?:\.\d+)?\s*(?:mg\/kg|mL|ml|mg|%)/g;

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const BASE = (args.base || 'http://localhost:8765/').replace(/\/?$/, '/');
const pages = args.pages ? String(args.pages).split(',').filter(Boolean) : PAGES;
const vps = args.viewports ? String(args.viewports).split(',') : Object.keys(VIEWPORTS);
const WRITE = !!args.baseline;
const STRICT = !!args.strict;
const SHOTS = args.shots ? path.resolve(String(args.shots)) : null;

export const slug = (p) => p.replace(/\.html$/, '').replace(/\/$/, '').replace(/\//g, '__') || 'index';
// Lines whose presence depends on layout timing (shown only while a figure is wider than its box).
export const VOLATILE = [/^Scroll sideways to see the whole/];
export const normLines = (t) => String(t || '').split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 1 && !VOLATILE.some((re) => re.test(l)));
export function doses(texts) {
  const out = {};
  for (const t of texts) for (const m of String(t).match(DOSE_RE) || []) { const k = m.replace(/\s+/g, ' '); out[k] = (out[k] || 0) + 1; }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
}

// ------------------------------------------------------------------ in-page helpers (run in the browser)
const FORCE_CSS = '.tb-chapter,.sp-chapter{display:block!important}';

async function waitReady(page) {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => {
    const b = document.body;
    if (!b) return false;
    if (b.classList.contains('tb-app') && document.querySelector('#tb-bar, .tb-chapter')) return b.dataset.tbReady === 'true' || !document.querySelector('.tb-chapter');
    return true;
  }, null, { timeout: 30000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function metrics(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    let small = 0; const smallEx = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const e = n.parentElement; if (!e || seen.has(e) || !n.textContent.trim()) continue; seen.add(e);
      if (e.closest('canvas,script,style,noscript,.tb-sr,.sr-only,[aria-hidden="true"] title')) continue;
      if (!vis(e)) continue;
      let px;
      if (e instanceof SVGElement) { const r = e.getBoundingClientRect(); px = r.height; } else px = parseFloat(getComputedStyle(e).fontSize);
      if (px && px < 11.5) { small++; if (smallEx.length < 5) smallEx.push(`${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ')[0]} ${px.toFixed(1)}px "${n.textContent.trim().slice(0, 24)}"`); }
    }
    let tiny = 0; const tinyEx = [];
    for (const e of document.querySelectorAll('a[href],button,input,select,summary,[role=button],[role=tab]')) {
      if (!vis(e)) continue;
      const r = e.getBoundingClientRect();
      const inline = e.tagName === 'A' && getComputedStyle(e).display === 'inline';
      const min = inline ? 24 : 44;
      if (Math.min(r.width, r.height) < min - 0.5) { tiny++; if (tinyEx.length < 5) tinyEx.push(`${e.tagName.toLowerCase()}#${e.id || ''}.${String(e.className).split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)}`); }
    }
    const sticky = [...document.querySelectorAll('body *')].filter((e) => { const p = getComputedStyle(e).position; return (p === 'sticky' || p === 'fixed') && vis(e) && e.getBoundingClientRect().top < 120; });
    return {
      overflow: de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0,
      smallText: small, smallTextEx: smallEx, smallTargets: tiny, smallTargetsEx: tinyEx,
      stickyTop: sticky.length, stickyEx: sticky.slice(0, 4).map((e) => `${e.tagName.toLowerCase()}#${e.id}.${String(e.className).split(' ')[0]} h${Math.round(e.getBoundingClientRect().height)}`),
    };
  });
}

const overflowNow = (page) => page.evaluate(() => { const de = document.documentElement; return de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0; });

/** Text of each chapter / section with every chapter shown and every <details> open. */
async function captureText(page) {
  await page.addStyleTag({ content: FORCE_CSS });
  return page.evaluate(() => {
    document.querySelectorAll('details').forEach((d) => { d.open = true; });
    const SEL = '.tb-chapter, .sp-chapter, main section[id], main [role=tabpanel]';
    const root = document.querySelector('main') || document.body;
    const secs = [...root.querySelectorAll(SEL)].filter((e) => !e.parentElement.closest(SEL));
    const out = {};
    if (!secs.length) out.main = root.innerText;
    else {
      // Text in <main> outside any section (intro, credits) is kept as "_main".
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
}

/** Engine pages: step every scan through its steps in each image type. */
async function stepScans(page, isPhone) {
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
          // After Next from step 1, is the image still on screen?
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
        out[sid][v] = texts;
      }
    }
  }
  return { scans: out, offscreen };
}

async function chapterOverflow(page) {
  const ids = await page.evaluate(() => [...document.querySelectorAll('.tb-chapter[id], .sp-chapter[id]')].map((c) => c.id));
  const bad = {};
  for (const id of ids) {
    await page.evaluate((h) => { location.hash = h; }, id);
    await page.waitForTimeout(120);
    let o = await overflowNow(page);
    // Scans and figures size themselves after a resize tick; only count overflow that persists.
    if (o) { await page.waitForTimeout(700); o = await overflowNow(page); }
    if (o) bad[id] = o;
  }
  return bad;
}

/** Read text until two reads 150 ms apart agree (panels re-render after a click; slow under load). */
async function stableText(page, fn) {
  let prev = await page.evaluate(fn);
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(150);
    const now = await page.evaluate(fn);
    if (now === prev) return now;
    prev = now;
  }
  return prev;
}

/** Brachial plexus: every block x every tab. */
async function brachialText(page) {
  const out = {};
  const blocks = await page.evaluate(() => [...document.querySelectorAll('#block-chips [data-block]')].map((b) => b.dataset.block).filter(Boolean));
  for (const b of blocks) {
    await page.evaluate((b) => document.querySelector(`#block-chips [data-block="${b}"]`).click(), b);
    await page.waitForTimeout(200);
    for (const t of ['ultrasound', 'guide', 'coverage']) {
      await page.evaluate((t) => document.getElementById(`tab-${t}`)?.click(), t);
      await page.waitForTimeout(150);
      out[`${b}/${t}`] = await stableText(page, () => { document.querySelectorAll('#sec-tabs details').forEach((d) => { d.open = true; }); return document.getElementById('sec-tabs')?.innerText || ''; });
    }
  }
  return out;
}

/** Plexus explorer: every plexus x every block (info panel). */
async function plexusText(page) {
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
  return out;
}

// ------------------------------------------------------------------ one page at one viewport
async function runPage(browser, p, vp) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const log = { console: [], pageErrors: [], bad: [], failed: [], three: [] };
  page.on('console', (m) => { if (m.type() === 'error') log.console.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => log.pageErrors.push(String(e.message || e).slice(0, 300)));
  page.on('response', (r) => {
    const u = r.url().replace(BASE, '/');
    if (r.status() >= 400) log.bad.push(`${r.status()} ${u}`);
    if (/\.glb(\?|$)|draco|three\.module/i.test(u)) log.three.push(`${r.status()} ${u}`);
  });
  page.on('requestfailed', (r) => { const f = r.failure()?.errorText || ''; log.failed.push(`${f} ${r.method()} ${r.url().replace(BASE, '/')}`); });
  const res = { page: p, vp: +vp };
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    res.status = resp?.status();
    await waitReady(page);
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${slug(p)}-${vp}.png`) }); }
    res.metrics = await metrics(page);
    // chapter menu open (phones)
    const mb = page.locator('#tb-chmenu-btn');
    if (await mb.count() && await mb.isVisible()) { await mb.click(); await page.waitForTimeout(100); res.menuOverflow = await overflowNow(page); await page.keyboard.press('Escape'); }
    const isEngine = await page.evaluate(() => !!document.querySelector('.tb-chapter[id^="ch-"]'));
    res.chapterOverflow = await chapterOverflow(page);
    if (isEngine) {
      const s = await stepScans(page, vp === '390');
      res.scans = s.scans; res.scanOffscreen = s.offscreen;
      await page.evaluate(() => { location.hash = 'ch-home'; });
      await page.waitForTimeout(100);
    }
    if (p === 'brachial-plexus/') res.extra = await brachialText(page);
    if (p === 'plexus/') res.extra = await plexusText(page);
    res.text = await captureText(page);
  } catch (err) {
    res.error = String(err.message || err).split('\n')[0];
  }
  // A request aborted by navigation/teardown is not a fault of the page; keep everything else.
  res.log = log;
  await ctx.close();
  return res;
}

// ------------------------------------------------------------------ main
function summarise(r) {
  const allText = [...Object.values(r.text || {}), ...Object.values(r.extra || {}), ...Object.values(r.scans || {}).flatMap((v) => Object.values(v).flat())];
  return {
    status: r.status, error: r.error || null,
    console: r.log.console, pageErrors: r.log.pageErrors, bad: r.log.bad, failed: r.log.failed, three: [...new Set(r.log.three)],
    overflow: r.metrics?.overflow ?? null, menuOverflow: r.menuOverflow ?? null, chapterOverflow: r.chapterOverflow || {},
    scanOffscreen: r.scanOffscreen || [],
    polish: r.metrics ? { smallText: r.metrics.smallText, smallTextEx: r.metrics.smallTextEx, smallTargets: r.metrics.smallTargets, smallTargetsEx: r.metrics.smallTargetsEx, stickyTop: r.metrics.stickyTop, stickyEx: r.metrics.stickyEx } : null,
    doses: doses(allText),
    lineCount: normLines(allText.join('\n')).length,
  };
}

async function main() {
  const browser = await chromium.launch();
  const jobs = [];
  for (const p of pages) for (const vp of vps) jobs.push([p, vp]);
  const results = [];
  const N = Number(args.workers || 4);
  let next = 0;
  await Promise.all(Array.from({ length: N }, async () => {
    while (next < jobs.length) {
      const [p, vp] = jobs[next++];
      const t0 = Date.now();
      const r = await runPage(browser, p, vp);
      r.ms = Date.now() - t0;
      results.push(r);
      process.stderr.write(`  ${p} @${vp} ${r.ms}ms${r.error ? ` ERROR ${r.error}` : ''}\n`);
    }
  }));
  await browser.close();
  results.sort((a, b) => pages.indexOf(a.page) - pages.indexOf(b.page) || a.vp - b.vp);

  if (WRITE) {
    fs.mkdirSync(BASEDIR, { recursive: true });
    const smoke = {};
    for (const r of results) {
      const s = slug(r.page);
      const file = path.join(BASEDIR, `${s}.json`);
      const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { url: r.page, viewports: {} };
      if (!prev.viewports) prev.viewports = {};
      prev.url = r.page;
      prev.viewports[r.vp] = { text: r.text || {}, extra: r.extra || {}, scans: r.scans || {}, doses: summarise(r).doses };
      fs.writeFileSync(file, `${JSON.stringify(prev, null, 1)}\n`);
      smoke[`${r.page}@${r.vp}`] = summarise(r);
    }
    const sfile = path.join(BASEDIR, 'smoke.json');
    const prevSmoke = fs.existsSync(sfile) ? JSON.parse(fs.readFileSync(sfile, 'utf8')) : {};
    fs.writeFileSync(sfile, `${JSON.stringify({ ...prevSmoke, ...smoke }, null, 1)}\n`);
    console.log(`Baseline written to ${path.relative(process.cwd(), BASEDIR)} (${results.length} page/viewport runs).`);
    for (const r of results) { const s = summarise(r); console.log(`${r.page}@${r.vp}: console ${s.console.length}, pageErr ${s.pageErrors.length}, >=400 ${s.bad.length}, failed ${s.failed.length}, overflow ${s.overflow}, lines ${s.lineCount}, doses ${Object.keys(s.doses).length}`); }
    return 0;
  }

  // compare
  const smoke0 = fs.existsSync(path.join(BASEDIR, 'smoke.json')) ? JSON.parse(fs.readFileSync(path.join(BASEDIR, 'smoke.json'), 'utf8')) : {};
  let fails = 0;
  const report = [];
  for (const r of results) {
    const key = `${r.page}@${r.vp}`;
    const s = summarise(r);
    const b = smoke0[key];
    const bfile = path.join(BASEDIR, `${slug(r.page)}.json`);
    const bt = fs.existsSync(bfile) ? JSON.parse(fs.readFileSync(bfile, 'utf8')).viewports?.[r.vp] : null;
    const problems = []; const notes = [];
    const fresh = (list, base) => list.filter((x) => !(base || []).includes(x));
    if (s.error) problems.push(`run error: ${s.error}`);
    if (s.status >= 400) problems.push(`page status ${s.status}`);
    const nc = fresh(s.console, b?.console); if (nc.length) problems.push(`new console errors: ${nc.join(' | ')}`);
    const np = fresh(s.pageErrors, b?.pageErrors); if (np.length) problems.push(`new page errors: ${np.join(' | ')}`);
    const nb = fresh(s.bad, b?.bad); if (nb.length) problems.push(`new >=400 responses: ${nb.join(', ')}`);
    const nf = fresh(s.failed.map((x) => x.replace(/\?.*$/, '')), (b?.failed || []).map((x) => x.replace(/\?.*$/, ''))); if (nf.length) problems.push(`new failed requests: ${nf.join(', ')}`);
    if (s.overflow && !(b?.overflow)) problems.push(`horizontal overflow ${s.overflow}px`);
    if (s.menuOverflow && !(b?.menuOverflow)) problems.push(`overflow with chapter menu open ${s.menuOverflow}px`);
    const nco = Object.keys(s.chapterOverflow).filter((k) => !(b?.chapterOverflow || {})[k]); if (nco.length) problems.push(`overflow in chapters: ${nco.join(', ')}`);
    const nso = fresh(s.scanOffscreen, b?.scanOffscreen); if (nso.length) (STRICT ? problems : notes).push(`scan off screen after Next: ${nso.join(', ')}`);
    if (b?.three?.length) { const lost = b.three.filter((x) => x.startsWith('2')).length; const now = s.three.filter((x) => x.startsWith('2')).length; if (now < lost) problems.push(`three.js/GLB/Draco loads dropped from ${lost} to ${now}`); }
    if (bt) {
      const baseLines = new Set(normLines([...Object.values(bt.text || {}), ...Object.values(bt.extra || {}), ...Object.values(bt.scans || {}).flatMap((v) => Object.values(v).flat())].join('\n')));
      const nowLines = new Set(normLines([...Object.values(r.text || {}), ...Object.values(r.extra || {}), ...Object.values(r.scans || {}).flatMap((v) => Object.values(v).flat())].join('\n')));
      const missing = [...baseLines].filter((l) => !nowLines.has(l));
      const added = [...nowLines].filter((l) => !baseLines.has(l));
      if (missing.length) problems.push(`${missing.length} baseline text line(s) missing, e.g. ${missing.slice(0, 4).map((l) => JSON.stringify(l.slice(0, 80))).join('; ')}`);
      if (added.length) notes.push(`${added.length} new text line(s), e.g. ${added.slice(0, 3).map((l) => JSON.stringify(l.slice(0, 60))).join('; ')}`);
      const d0 = JSON.stringify(bt.doses || {}); const d1 = JSON.stringify(s.doses);
      if (d0 !== d1) {
        const all = new Set([...Object.keys(bt.doses || {}), ...Object.keys(s.doses)]);
        const diff = [...all].filter((k) => (bt.doses || {})[k] !== s.doses[k]).map((k) => `${k}: ${(bt.doses || {})[k] || 0}→${s.doses[k] || 0}`);
        problems.push(`dose strings changed: ${diff.slice(0, 8).join(', ')}`);
      }
    } else notes.push('no baseline text for this page/viewport');
    if (b?.polish && s.polish) {
      for (const k of ['smallText', 'smallTargets']) if (s.polish[k] > b.polish[k]) (STRICT ? problems : notes).push(`${k} rose ${b.polish[k]}→${s.polish[k]}`);
    }
    if (STRICT && s.polish) {
      if (s.polish.smallText) problems.push(`text under 12px: ${s.polish.smallText} (${s.polish.smallTextEx.join('; ')})`);
      if (s.polish.smallTargets) problems.push(`targets under 44px: ${s.polish.smallTargets} (${s.polish.smallTargetsEx.join('; ')})`);
      if (r.vp === 390 && s.polish.stickyTop > 1) problems.push(`${s.polish.stickyTop} sticky/fixed bars at the top (${s.polish.stickyEx.join('; ')})`);
    }
    if (problems.length) fails++;
    report.push({ key, ok: !problems.length, problems, notes });
  }
  for (const x of report) {
    console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.key}`);
    x.problems.forEach((m) => console.log(`   ✗ ${m}`));
    x.notes.forEach((m) => console.log(`   · ${m}`));
  }
  console.log(`\n${report.length - fails}/${report.length} page/viewport runs match the baseline${STRICT ? ' (strict)' : ''}.`);
  return fails ? 1 : 0;
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
