#!/usr/bin/env node
// Regional anaesthesia app: smoke test and content baseline (plan §10 WP0, §11.1).
//
//   node shared/regional/test/smoke.mjs                 compare every regional page with shared/regional/test/baseline/
//   node shared/regional/test/smoke.mjs --strict        also fail on the §11.1 polish targets (text, tap targets, one sticky
//                                                bar ≤ 56 px, scan on screen after Next, axe, interactive < 2.5 s)
//   node shared/regional/test/smoke.mjs --baseline      (re)write the baseline (only before a change, never to make a test pass)
//   options: --pages=truncal/back/,spinal/   --viewports=390,1440   --base=http://localhost:8765/   --workers=4
//            --shots=<dir> (screenshots of each page's first screen)   --json=<file>   --summary (polish table only)
//            axe: set AXE=/path/to/axe.min.js (or install axe-core globally) to run the accessibility check
//
// Needs the global Playwright (chromium) and a static server on the repo root:
//   cd <repo> && python3 -m http.server 8765
//
// What it does on each page, at 390x844 (touch, DPR 2) and 1440x900:
//   - loads it with no saved level (first-visit picker dismissed), waits for the app to boot, records console errors, page errors, responses
//     >= 400, failed requests and every three.js / GLB / Draco request;
//   - checks horizontal overflow on the first screen, with the chapter menu open, and on every chapter;
//   - steps every scan through its 4 steps in each image type (Ultrasound / Diagram / Real) and records the step text
//     and whether the image is still on screen after Next;
//   - records the §11.1 polish metrics: text under 12 px (SVG text by its rendered height), tap targets under 44 px
//     (inline links under 24 px), sticky/fixed bars at the top after scrolling, axe serious/critical violations,
//     time until the app is interactive;
//   - the only service worker is /regional-sw.js (the regional offline worker); no three.js before "Open here" on block pages; no animation iframe before "Watch"
//     (lower-limb); plexus: rapid tab switching leaves one 3D canvas;
//   - captures the text of every chapter / section (all chapters shown, every <details> open) and every dose / volume /
//     concentration string.
// Compare mode fails on: any console or page error, any response >= 400, new failed requests (any failed HEAD),
// new horizontal overflow, a service worker other than /regional-sw.js, early three.js or animation iframes, extra plexus canvases, any baseline
// text line missing (except the reviewed ones in parity-allow.json), any change in the dose strings.

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import {
  args, BASE, BASEDIR, PAGES, VIEWPORTS, LANDINGS, ENGINE_PAGES, listArg, slug, normLines, doses, allTextOf, compareText,
  launch, attachLog, waitReady, pool, captureText, stepScans, brachialText, plexusText, readJson,
} from './lib.mjs';

const pages = listArg('pages', PAGES);
const vps = listArg('viewports', Object.keys(VIEWPORTS));
const WRITE = !!args.baseline;
const STRICT = !!args.strict;
const SHOTS = args.shots ? path.resolve(String(args.shots)) : null;
const AXE = (() => {
  const cands = [process.env.AXE, args.axe].filter(Boolean);
  try { cands.push(`${execSync('npm root -g').toString().trim()}/axe-core/axe.min.js`); } catch { /* none */ }
  return cands.find((f) => f && fs.existsSync(f)) || null;
})();

// ------------------------------------------------------------------ in-page helpers
async function metrics(page, isPhone) {
  return page.evaluate(async (isPhone) => {
    const de = document.documentElement;
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0'; };
    let small = 0; const smallEx = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const e = n.parentElement; if (!e || seen.has(e) || !n.textContent.trim()) continue; seen.add(e);
      if (e.closest('canvas,script,style,noscript,.tb-sr,.sr-only,.ra-sr,[aria-hidden="true"] title')) continue;
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
      if (Math.min(r.width, r.height) < min - 0.5) { tiny++; if (tinyEx.length < 5) tinyEx.push(`${e.tagName.toLowerCase()}#${e.id || ''}.${String(e.className?.baseVal ?? e.className).split(' ')[0]} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 20)}" ${Math.round(r.width)}x${Math.round(r.height)}`); }
    }
    // Sticky/fixed bars that stay at the top once the reader has scrolled (skip links and off-screen things excluded).
    const y0 = scrollY;
    window.scrollTo({ top: Math.min(1200, Math.max(0, de.scrollHeight - innerHeight)), behavior: 'instant' });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const stuck = [...document.querySelectorAll('body *')].filter((e) => {
      const p = getComputedStyle(e).position;
      if (p !== 'sticky' && p !== 'fixed') return false;
      if (!vis(e)) return false;
      const r = e.getBoundingClientRect();
      return r.bottom > 0 && r.top < 120 && r.top > -2 && !e.closest('[role=dialog],dialog');
    }).filter((e, _, all) => !all.some((o) => o !== e && o.contains(e)));
    const barBottom = stuck.reduce((m, e) => Math.max(m, e.getBoundingClientRect().bottom), 0);
    window.scrollTo({ top: y0, behavior: 'instant' });
    // Service workers on this page: every registration and the controller (script URLs). Only /regional-sw.js may appear.
    let sw = [];
    try {
      const regs = await navigator.serviceWorker?.getRegistrations?.() || [];
      sw = regs.map((r) => (r.active || r.waiting || r.installing)?.scriptURL || '(none)');
      if (navigator.serviceWorker?.controller) sw.push(navigator.serviceWorker.controller.scriptURL);
    } catch { /* none */ }
    return {
      overflow: de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0,
      smallText: small, smallTextEx: smallEx, smallTargets: tiny, smallTargetsEx: tinyEx,
      stickyTop: stuck.length, barHeight: Math.round(barBottom),
      stickyEx: stuck.slice(0, 4).map((e) => `${e.tagName.toLowerCase()}#${e.id}.${String(e.className).split(' ')[0]} h${Math.round(e.getBoundingClientRect().height)}`),
      serviceWorkers: sw,
      readyMs: Math.round(window.__raReadyAt || 0),
      animFrames: document.querySelectorAll('iframe[src*="lower-limb/anim"], iframe[src*="/anim/"]').length,
      canvases: document.querySelectorAll('canvas').length,
    };
  }, isPhone);
}

const overflowNow = (page) => page.evaluate(() => { const de = document.documentElement; return de.scrollWidth > de.clientWidth + 1 ? de.scrollWidth - de.clientWidth : 0; });

async function chapterOverflow(page) {
  const ids = await page.evaluate(() => [...document.querySelectorAll('.tb-chapter[id], .sp-chapter[id]')].map((c) => c.id));
  const bad = {};
  for (const id of ids) {
    await page.evaluate((h) => { location.hash = h; }, id);
    await page.waitForTimeout(120);
    let o = await overflowNow(page);
    if (o) { await page.waitForTimeout(700); o = await overflowNow(page); }
    if (o) bad[id] = o;
  }
  return bad;
}

async function axeCheck(page) {
  if (!AXE) return null;
  try {
    await page.addScriptTag({ path: AXE });
    return await page.evaluate(async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'], runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
      return r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.impact} ${v.id} ×${v.nodes.length} (${v.nodes[0]?.target?.join(' ') || ''})`);
    });
  } catch (err) { return [`axe failed to run: ${String(err.message || err).split('\n')[0]}`]; }
}

/** Plexus: switch plexus tabs quickly; the explorer must end with as many canvases as it started with. */
async function plexusCanvas(page) {
  const before = await page.evaluate(() => document.querySelectorAll('canvas').length);
  for (const px of ['lumbar', 'sacral', 'cervical', 'lumbar', 'cervical', 'sacral', 'cervical']) {
    await page.evaluate((px) => { location.hash = `plexus=${px}`; }, px);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(2500);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  const after = await page.evaluate(() => document.querySelectorAll('canvas').length);
  return { before, after };
}

// ------------------------------------------------------------------ one page at one viewport
async function runPage(browser, p, vp) {
  const ctx = await browser.newContext({ ...VIEWPORTS[vp], reducedMotion: 'reduce' });
  await ctx.addInitScript((skin) => {
    // Picker dismissed (levels.mjs tests it), no level saved: the default Consultant view, comparable with the baseline.
    // RA_SKIN=app (or web) runs the whole suite in that look (the default is the website look, as a visitor gets it).
    try { if (!sessionStorage.getItem('__ra_seeded')) { localStorage.setItem('ra-level-picker', 'dismissed'); if (skin) localStorage.setItem('ra-skin', skin); sessionStorage.setItem('__ra_seeded', '1'); } } catch { /* blocked */ }
    const mark = () => { if (!window.__raReadyAt) window.__raReadyAt = performance.now(); };
    document.addEventListener('tb-ready', mark); window.addEventListener('tb-ready', mark);
    new MutationObserver((_, o) => { if (document.body?.dataset.tbReady === 'true') { mark(); o.disconnect(); } }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-tb-ready'] });
    window.addEventListener('load', () => { if (!document.body?.classList.contains('tb-app') || !document.querySelector('.tb-chapter, #tb-bar')) setTimeout(mark, 0); });
  }, process.env.RA_SKIN || '');
  const page = await ctx.newPage();
  const log = attachLog(page);
  const res = { page: p, vp: +vp };
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    res.status = resp?.status();
    await waitReady(page);
    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${slug(p)}-${vp}.png`) }); }
    res.metrics = await metrics(page, vp === '390');
    res.credit = await page.evaluate(() => {
      const t = document.body.innerText.replace(/\s+/g, ' ');
      return { line: /Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia/.test(t), link: !!document.querySelector('a[href^="https://chewshihao.com"]'), frca: /FRCA/.test(t) };
    });
    res.threeEarly = [...new Set(log.three)];
    const mb = page.locator('#tb-chmenu-btn');
    if (await mb.count() && await mb.isVisible()) { await mb.click(); await page.waitForTimeout(150); res.menuOverflow = await overflowNow(page); await page.keyboard.press('Escape'); }
    const isEngine = await page.evaluate(() => !!document.querySelector('.tb-chapter[id^="ch-"]'));
    res.chapterOverflow = await chapterOverflow(page);
    if (isEngine) {
      const s = await stepScans(page, vp === '390');
      res.scans = s.scans; res.scanOffscreen = s.offscreen;
      await page.evaluate(() => { location.hash = 'ch-home'; });
      await page.waitForTimeout(100);
      res.threeAfterScans = [...new Set(log.three)];
      res.animFramesAfterScans = await page.evaluate(() => document.querySelectorAll('iframe[src*="/anim/"]').length);
    }
    if (p === 'brachial-plexus/') res.extra = await brachialText(page);
    if (p === 'plexus/') res.extra = await plexusText(page);
    // Failures after this point come from the capture itself (it opens and closes each "Watch" iframe): not counted.
    res.failedBeforeCapture = log.failed.length;
    res.text = await captureText(page);
    if (p === 'plexus/' && !WRITE) res.canvas = await plexusCanvas(page);
    // axe last: it re-fetches @import'ed stylesheets relative to the page (404s that are axe's, not the page's).
    res.cut = { console: log.console.length, pageErrors: log.pageErrors.length, bad: log.bad.length };
    if (!WRITE) res.axe = await axeCheck(page);
  } catch (err) {
    res.error = String(err.message || err).split('\n')[0];
  }
  res.log = log;
  await ctx.close();
  return res;
}

function summarise(r) {
  const allText = allTextOf(r, { forDoses: true });
  return {
    status: r.status, error: r.error || null,
    console: r.log.console.slice(0, r.cut?.console ?? r.log.console.length), pageErrors: r.log.pageErrors.slice(0, r.cut?.pageErrors ?? r.log.pageErrors.length), bad: r.log.bad.slice(0, r.cut?.bad ?? r.log.bad.length), failed: r.log.failed.slice(0, r.failedBeforeCapture ?? r.log.failed.length), three: [...new Set(r.log.three)],
    overflow: r.metrics?.overflow ?? null, menuOverflow: r.menuOverflow ?? null, chapterOverflow: r.chapterOverflow || {},
    scanOffscreen: r.scanOffscreen || [],
    polish: r.metrics ? { smallText: r.metrics.smallText, smallTextEx: r.metrics.smallTextEx, smallTargets: r.metrics.smallTargets, smallTargetsEx: r.metrics.smallTargetsEx, stickyTop: r.metrics.stickyTop, stickyEx: r.metrics.stickyEx, barHeight: r.metrics.barHeight, readyMs: r.metrics.readyMs } : null,
    doses: doses(allText),
    lineCount: normLines(allText.join('\n')).length,
  };
}

// ------------------------------------------------------------------ main
async function main() {
  const browser = await launch();
  const jobs = [];
  for (const p of pages) for (const vp of vps) jobs.push([p, vp]);
  const results = await pool(jobs, Number(args.workers || 4), ([p, vp]) => runPage(browser, p, vp), ([p, vp]) => `${p} @${vp}`);
  await browser.close();
  results.sort((a, b) => pages.indexOf(a.page) - pages.indexOf(b.page) || a.vp - b.vp);

  if (WRITE) {
    fs.mkdirSync(BASEDIR, { recursive: true });
    const smoke = {};
    for (const r of results) {
      const file = path.join(BASEDIR, `${slug(r.page)}.json`);
      const prev = readJson(file, { url: r.page, viewports: {} });
      if (!prev.viewports) prev.viewports = {};
      prev.url = r.page;
      prev.viewports[r.vp] = { text: r.text || {}, extra: r.extra || {}, scans: r.scans || {}, doses: summarise(r).doses };
      fs.writeFileSync(file, `${JSON.stringify(prev, null, 1)}\n`);
      smoke[`${r.page}@${r.vp}`] = summarise(r);
    }
    const sfile = path.join(BASEDIR, 'smoke.json');
    fs.writeFileSync(sfile, `${JSON.stringify({ ...readJson(sfile, {}), ...smoke }, null, 1)}\n`);
    console.log(`Baseline written to ${path.relative(process.cwd(), BASEDIR)} (${results.length} page/viewport runs).`);
    return 0;
  }

  const smoke0 = readJson(path.join(BASEDIR, 'smoke.json'), {});
  let fails = 0;
  const report = [];
  const polishRows = [];
  for (const r of results) {
    const key = `${r.page}@${r.vp}`;
    const s = summarise(r);
    const b = smoke0[key];
    const bt = readJson(path.join(BASEDIR, `${slug(r.page)}.json`))?.viewports?.[r.vp] || null;
    const problems = []; const notes = []; const polish = [];
    const fresh = (list, base) => list.filter((x) => !(base || []).includes(x));
    const m = r.metrics || {};
    if (s.error) problems.push(`run error: ${s.error}`);
    if (s.status >= 400) problems.push(`page status ${s.status}`);
    if (s.console.length) problems.push(`console errors: ${[...new Set(s.console)].join(' | ')}`);
    if (s.pageErrors.length) problems.push(`page errors: ${[...new Set(s.pageErrors)].join(' | ')}`);
    if (s.bad.length) problems.push(`responses >= 400: ${[...new Set(s.bad)].join(', ')}`);
    const nf = fresh(s.failed.map((x) => x.replace(/\?.*$/, '')), (b?.failed || []).map((x) => x.replace(/\?.*$/, ''))); if (nf.length) problems.push(`new failed requests: ${nf.join(', ')}`);
    const heads = s.failed.filter((x) => / HEAD /.test(x)); if (heads.length) problems.push(`failed HEAD requests (plan §8: drop the GLB pre-fetch): ${heads.join(', ')}`);
    if (s.overflow && !(b?.overflow)) problems.push(`horizontal overflow ${s.overflow}px`);
    if (r.menuOverflow && !(b?.menuOverflow)) problems.push(`overflow with chapter menu open ${r.menuOverflow}px`);
    const nco = Object.keys(s.chapterOverflow).filter((k) => !(b?.chapterOverflow || {})[k]); if (nco.length) problems.push(`overflow in chapters: ${nco.map((k) => `${k} ${s.chapterOverflow[k]}px`).join(', ')}`);
    if (r.page !== 'regional.html' && r.credit && !(r.credit.line && r.credit.link)) problems.push(`credit line missing: want "Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia" with Dr Chew Shi Hao linked to https://chewshihao.com/ (line ${r.credit.line ? 'ok' : 'missing'}, link ${r.credit.link ? 'ok' : 'missing'})`);
    if (r.credit?.frca) problems.push('page text says "FRCA" (say exam / MMed)');
    // The same module under two URLs (e.g. levels.js and levels.js?v=…) runs twice: shared state (level, search) splits.
    const byPath = {};
    for (const u of r.log.requests || []) { const m2 = u.match(/^\/?(shared\/regional\/js\/[\w/.-]+\.js)(\?.*)?$/); if (m2) (byPath[m2[1]] ||= new Set()).add(m2[2] || ''); }
    const dups = Object.entries(byPath).filter(([, q]) => q.size > 1).map(([f, q]) => `${f} as ${[...q].map((x) => x || '(no query)').join(' and ')}`);
    const stateDups = dups.filter((d) => /\/(levels|ui|search|registry|status|shell|scan|head|leg|skin|appnav)\.js /.test(d)); // figures/head.js and leg.js keep pattern counters
    if (stateDups.length) problems.push(`stateful engine module loaded twice (two instances): ${stateDups.join('; ')}`);
    if (dups.length > stateDups.length) notes.push(`modules loaded under two URLs: ${dups.filter((d) => !stateDups.includes(d)).join('; ')}`);
    const otherSw = (m.serviceWorkers || []).filter((u) => u !== new URL('regional-sw.js', BASE).href);
    if (otherSw.length) problems.push(`a service worker other than /regional-sw.js is registered (${[...new Set(otherSw)].join(', ')}); regional pages may only register the regional offline worker`);
    // three.js only on brachial-plexus/ and plexus/ (and after "Open here", which the smoke never taps).
    if (!['brachial-plexus/', 'plexus/'].includes(r.page) && (r.threeAfterScans || r.threeEarly || []).length) problems.push(`three.js / GLB requested without "Open here": ${(r.threeAfterScans || r.threeEarly).join(', ')}`);
    if (b?.three?.length) { const lost = b.three.filter((x) => x.startsWith('2')).length; const now = s.three.filter((x) => x.startsWith('2')).length; if (now < lost) problems.push(`three.js/GLB/Draco loads dropped from ${lost} to ${now}`); }
    if (r.page.startsWith('lower-limb/') && (m.animFrames || r.animFramesAfterScans)) problems.push(`animation iframe created before "Watch" (${m.animFrames || r.animFramesAfterScans})`);
    if (r.canvas && r.canvas.after !== r.canvas.before) problems.push(`plexus: rapid tab switching left ${r.canvas.after} canvases (started with ${r.canvas.before})`);
    if (bt) {
      const c = compareText(r.page, bt, r);
      if (c.missing.length) problems.push(`${c.missing.length} baseline text line(s) missing, e.g. ${c.missing.slice(0, 4).map((l) => JSON.stringify(l.slice(0, 80))).join('; ')}`);
      if (c.allowed.length) notes.push(`${c.allowed.length} reviewed line change(s) (parity-allow.json)`);
      if (c.added.length) notes.push(`${c.added.length} new text line(s), e.g. ${c.added.slice(0, 3).map((l) => JSON.stringify(l.slice(0, 60))).join('; ')}`);
      if (c.doseDiff.length) problems.push(`dose strings changed: ${c.doseDiff.slice(0, 8).join(', ')}`);
    } else notes.push('no baseline text for this page/viewport');
    // §11.1 polish targets: failures under --strict, notes otherwise.
    if (m.smallText) polish.push(`text under 12px: ${m.smallText} (${m.smallTextEx.join('; ')})`);
    if (m.smallTargets) polish.push(`targets under 44px: ${m.smallTargets} (${m.smallTargetsEx.join('; ')})`);
    if (r.vp === 390 && m.stickyTop !== 1) polish.push(`${m.stickyTop} sticky/fixed bars at the top after scrolling, want 1 (${m.stickyEx.join('; ')})`);
    if (r.vp === 390 && m.barHeight > 56 + 1) polish.push(`sticky bar ${m.barHeight}px tall, want ≤ 56`);
    if (s.scanOffscreen.length) polish.push(`scan off screen after Next: ${s.scanOffscreen.join(', ')}`);
    if (r.axe?.length) polish.push(`axe: ${r.axe.join('; ')}`);
    if (m.readyMs > 2500) polish.push(`interactive after ${m.readyMs} ms (want < 2500; measured with ${args.workers || 4} pages in parallel)`);
    (STRICT ? problems : notes).push(...polish);
    if (problems.length) fails++;
    report.push({ key, ok: !problems.length, problems, notes });
    polishRows.push({ key, smallText: m.smallText ?? '-', targets: m.smallTargets ?? '-', sticky: r.vp === 390 ? m.stickyTop : '', bar: r.vp === 390 ? m.barHeight : '', scanOff: s.scanOffscreen.length, axe: r.axe ? r.axe.length : 'n/a', readyMs: m.readyMs ?? '-' });
  }
  if (!args.summary) for (const x of report) {
    console.log(`${x.ok ? 'PASS' : 'FAIL'} ${x.key}`);
    x.problems.forEach((msg) => console.log(`   ✗ ${msg}`));
    if (!args.failsOnly) x.notes.forEach((msg) => console.log(`   · ${msg}`));
  }
  console.log('\nPolish targets (§11.1): text<12px · targets<44px · sticky bars (390, want 1) · bar px (want ≤56) · scans off screen · axe serious+critical · ms to interactive');
  for (const p of polishRows) console.log(`  ${p.key.padEnd(30)} ${String(p.smallText).padStart(4)} ${String(p.targets).padStart(4)} ${String(p.sticky).padStart(3)} ${String(p.bar).padStart(4)} ${String(p.scanOff).padStart(3)} ${String(p.axe).padStart(4)} ${String(p.readyMs).padStart(6)}`);
  if (!AXE) console.log('  (axe not run: set AXE=/path/to/axe.min.js)');
  console.log(`\n${report.length - fails}/${report.length} page/viewport runs pass${STRICT ? ' (strict)' : ''}.`);
  if (args.json) fs.writeFileSync(String(args.json), `${JSON.stringify({ report, polish: polishRows }, null, 1)}\n`);
  return fails ? 1 : 0;
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
