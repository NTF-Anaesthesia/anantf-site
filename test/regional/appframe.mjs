#!/usr/bin/env node
// Regional anaesthesia app: the shared app frame (shared/regional/js/appnav.js, css/appnav.css; ENGINE.md §2 "App frame").
//
//   node test/regional/appframe.mjs        options: --base=<url>  --json=<file>  --failsOnly
//
// Checks:
//   1. /blocks/settings/: loads without errors, noindex, credit line, level control, both switches with their defaults
//      (bar auto-hide off, "/" on), each switch saves its choice ('ra-autohide', 'ra-slash'), the app version lines;
//   2. every kind of regional page reaches Settings from its app bar (a visible link, or one inside the bar's menu);
//   3. "Hide the bar while scrolling down": off by default (the bar never moves); when on, it slides away on a scroll
//      down, comes back on a scroll up, stays while a menu is open, and the phone scan column follows it;
//   4. desktop rail at 1024 and 1440 (current chapter marked, follows chapter changes), none at 390; no horizontal
//      overflow; the document (not an inner box) scrolls; a scan chapter at 1440 keeps its scan teacher in view;
//   5. keyboard: "/" and Ctrl+K open search (not "/" while typing, not when turned off); arrow keys on a step button;
//   6. speculation rules are added where the browser has them; view transitions are named for the header and the bar
//      and switched off with reduced motion.

import { BASE, launch, waitReady, reporter, attachLog } from './lib.mjs';

const R = reporter('App frame');
const browser = await launch();
const VP = {
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  1024: { viewport: { width: 1024, height: 800 }, deviceScaleFactor: 1 },
  1440: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};
async function open(path, { vp = 1440, storage = {}, reducedMotion = 'reduce' } = {}) {
  const ctx = await browser.newContext({ ...VP[vp], reducedMotion });
  await ctx.addInitScript((kv) => {
    try { if (!sessionStorage.getItem('__ra_seeded')) { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem('__ra_seeded', '1'); } } catch { /* blocked */ }
  }, { 'ra-level-picker': 'dismissed', ...storage });
  const page = await ctx.newPage();
  const log = attachLog(page);
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await waitReady(page, { idle: false });
  // spinal/ boots its chapters after load (body[data-sp-ready]); its widgets re-measure on resize while it does.
  await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(300);
  return { ctx, page, log };
}
const errs = (log) => [...log.console, ...log.pageErrors, ...log.bad];
const barState = (page) => page.evaluate(() => {
  const bar = document.querySelector('.ra-appbar');
  return { hidden: document.documentElement.dataset.raBar === 'hidden', top: bar ? Math.round(bar.getBoundingClientRect().top) : null };
});
async function scrollSteps(page, dy, n = 6) { for (let i = 0; i < n; i++) { await page.evaluate((d) => window.scrollBy(0, d), dy); await page.waitForTimeout(40); } await page.waitForTimeout(250); }

// ------------------------------------------------------------------ 1. settings page
{
  const { ctx, page, log } = await open('blocks/settings/', { vp: 390 });
  const s = await page.evaluate(() => ({
    noindex: /noindex/.test(document.querySelector('meta[name=robots]')?.content || ''),
    credit: /Created by Dr Koh Wenjun and Dr Chew Shi Hao, NTF Anaesthesia/.test(document.body.innerText.replace(/\s+/g, ' ')) && !!document.querySelector('a[href^="https://chewshihao.com"]'),
    crumbs: [...document.querySelectorAll('.ntf-crumbs a, .ntf-crumbs [aria-current]')].map((n) => n.textContent.trim()).join(' / '),
    level: document.querySelectorAll('#st-level .ra-level-btn').length,
    autohide: document.getElementById('st-autohide')?.checked, autohideRole: document.getElementById('st-autohide')?.getAttribute('role'),
    slash: document.getElementById('st-slash')?.checked,
    appver: !!document.querySelector('#ra-appver [data-appver-btn]') && /Not updating\? Get the latest version/.test(document.getElementById('ra-appver')?.textContent || ''),
  }));
  R.check('settings: loads without errors', !errs(log).length, errs(log).join(' | '));
  R.check('settings: noindex and the credit line', s.noindex && s.credit, JSON.stringify(s));
  R.check('settings: breadcrumb Resources / Regional anaesthesia / Blocks / Settings', s.crumbs === 'Resources / Regional anaesthesia / Blocks / Settings', s.crumbs);
  R.check('settings: the MO · Resident · Consultant control', s.level === 3, `${s.level} level buttons`);
  R.check('settings: "Hide the bar while scrolling down" is off by default (a switch)', s.autohide === false && s.autohideRole === 'switch', JSON.stringify(s));
  R.check('settings: "Press / to search" is on by default', s.slash === true, JSON.stringify(s));
  R.check('settings: app version lines ("Not updating? Get the latest version")', s.appver);
  await page.locator('label[for="st-autohide"]').click();
  await page.locator('label[for="st-slash"]').click();
  const saved = await page.evaluate(() => ({ a: localStorage.getItem('ra-autohide'), s: localStorage.getItem('ra-slash') }));
  R.check('settings: the switches save ra-autohide=on and ra-slash=off', saved.a === 'on' && saved.s === 'off', JSON.stringify(saved));
  await page.locator('#st-level .ra-level-btn[data-level="mo"]').click();
  R.check('settings: the level control saves ra-level', await page.evaluate(() => localStorage.getItem('ra-level')) === 'mo');
  await ctx.close();
}

// ------------------------------------------------------------------ 2. Settings from every app bar
const KINDS = ['truncal/back/', 'lower-limb/hip/', 'truncal/', 'upper-limb/', 'blocks/', 'blocks/calculator/', 'spinal/', 'brachial-plexus/', 'plexus/'];
for (const vp of [390, 1440]) {
  for (const p of KINDS) {
    const { ctx, page } = await open(p, { vp });
    const r = await page.evaluate(() => {
      const bar = document.querySelector('.ra-appbar');
      if (!bar) return { bar: false };
      const links = [...bar.querySelectorAll('a[href$="blocks/settings/"]')];
      const visible = links.some((a) => a.getClientRects().length && getComputedStyle(a).visibility !== 'hidden');
      const inMenu = links.some((a) => a.closest('[hidden]'));
      const h = Math.round(bar.getBoundingClientRect().height);
      return { bar: true, visible, inMenu, h };
    });
    let ok = r.bar && (r.visible || r.inMenu);
    // A link inside a closed menu must show once the menu opens.
    if (ok && !r.visible) {
      const btn = page.locator('.ra-appbar [aria-expanded="false"][aria-controls]:visible').first();
      if (await btn.count()) { await btn.click(); await page.waitForTimeout(150); }
      ok = await page.evaluate(() => [...document.querySelectorAll('.ra-appbar a[href$="blocks/settings/"]')].some((a) => a.getClientRects().length));
    }
    R.check(`${p} @${vp}: Settings is reachable from the app bar`, ok, JSON.stringify(r));
    if (vp === 390) R.check(`${p} @390: the app bar is at most 56px tall`, r.h <= 57, `${r.h}px`);
    await ctx.close();
  }
}

// ------------------------------------------------------------------ 3. auto-hide
for (const p of ['truncal/back/#ch-esp', 'truncal/', 'spinal/#ch-technique', 'brachial-plexus/', 'plexus/', 'blocks/']) {
  {
    const { ctx, page, log } = await open(p, { vp: 390 });
    await scrollSteps(page, 120);
    const s = await barState(page);
    R.check(`${p} @390: off by default, the bar stays on a scroll down`, !s.hidden && s.top === 0, JSON.stringify(s));
    R.check(`${p} @390: no errors`, !errs(log).length, errs(log).join(' | '));
    await ctx.close();
  }
  {
    const { ctx, page } = await open(p, { vp: 390, storage: { 'ra-autohide': 'on' } });
    await scrollSteps(page, 120);
    const down = await barState(page);
    await page.evaluate(() => window.scrollBy(0, -12)); await page.waitForTimeout(300);
    const up = await barState(page);
    R.check(`${p} @390 auto-hide on: hides on a scroll down, back on a scroll up`, down.hidden && down.top < -40 && !up.hidden && up.top === 0, `down ${JSON.stringify(down)} up ${JSON.stringify(up)}`);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    R.check(`${p} @390 auto-hide on: shown at the top of the page`, !(await barState(page)).hidden);
    await ctx.close();
  }
}
{
  // A menu open in the bar keeps it; the phone scan column moves up with the bar (never left a gap or overlap).
  const { ctx, page } = await open('truncal/back/#ch-esp', { vp: 390, storage: { 'ra-autohide': 'on' } });
  await scrollSteps(page, 120);
  const btn = page.locator('#tb-chmenu-btn');
  await page.evaluate(() => window.scrollBy(0, -5)); await page.waitForTimeout(250);
  await btn.click(); await page.waitForTimeout(200);
  await scrollSteps(page, 80, 4);
  R.check('truncal/back/ @390 auto-hide on: stays while the chapter menu is open', !(await barState(page)).hidden);
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.getElementById('esp-scan')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await scrollSteps(page, 60, 6);
  const s = await page.evaluate(() => {
    const col = document.querySelector('#esp-scan .ra-scan-col');
    const bar = document.querySelector('.ra-appbar').getBoundingClientRect();
    return { hidden: document.documentElement.dataset.raBar === 'hidden', colTop: Math.round(col.getBoundingClientRect().top), barBottom: Math.round(bar.bottom), sticky: getComputedStyle(col).position };
  });
  R.check('truncal/back/ @390 auto-hide on: the sticky scan image follows the bar (top of the screen when it hides)', s.sticky === 'sticky' && (s.hidden ? s.colTop <= 2 : Math.abs(s.colTop - s.barBottom) <= 2), JSON.stringify(s));
  await ctx.close();
}

// ------------------------------------------------------------------ 4. rail, overflow, docked scan
for (const vp of [390, 1024, 1440]) {
  for (const p of ['truncal/back/#ch-esp', 'head-neck/', 'blocks/', 'spinal/#ch-technique', 'blocks/settings/']) {
    const { ctx, page, log } = await open(p, { vp });
    const r = await page.evaluate(() => {
      const rail = document.querySelector('.ra-rail');
      const de = document.documentElement;
      return {
        shown: !!rail && rail.getClientRects().length > 0 && getComputedStyle(rail).display !== 'none',
        current: rail ? [...rail.querySelectorAll('a[aria-current]')].map((a) => a.textContent.trim()) : [],
        overflow: de.scrollWidth - de.clientWidth,
        docScrolls: de.scrollHeight > innerHeight + 100,
      };
    });
    R.check(`${p} @${vp}: ${vp >= 1024 ? 'rail shown with the current item marked' : 'no rail on phones'}`, vp >= 1024 ? r.shown && r.current.length >= 1 : !r.shown, JSON.stringify(r));
    R.check(`${p} @${vp}: no horizontal overflow, the page itself scrolls`, r.overflow <= 1 && r.docScrolls, JSON.stringify(r));
    R.check(`${p} @${vp}: no errors`, !errs(log).length, errs(log).join(' | '));
    await ctx.close();
  }
}
{
  const { ctx, page } = await open('truncal/back/#ch-esp', { vp: 1440 });
  const a = await page.evaluate(() => [...document.querySelectorAll('.ra-rail a[aria-current="location"]')].map((x) => x.getAttribute('href')));
  await page.evaluate(() => { location.hash = 'ch-pvb'; }); await page.waitForTimeout(300);
  const b = await page.evaluate(() => [...document.querySelectorAll('.ra-rail a[aria-current="location"]')].map((x) => x.getAttribute('href')));
  R.check('truncal/back/ @1440: the rail marks the current chapter and follows chapter changes', a.join() === '#ch-esp' && b.join() === '#ch-pvb', `${a} → ${b}`);
  await page.evaluate(() => { location.hash = 'ch-esp'; }); await page.waitForTimeout(400);
  const before = await page.evaluate(() => { const w = document.querySelector('#ch-esp > .tb-scan-wrap'); return { pos: getComputedStyle(w).position, col: getComputedStyle(w).gridColumnStart }; });
  await page.evaluate(() => window.scrollTo(0, 2400)); await page.waitForTimeout(300);
  const after = await page.evaluate(() => { const r = document.querySelector('#esp-scan .tb-scan-stage').getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight, y: Math.round(scrollY) }; });
  R.check('truncal/back/ @1440: the scan teacher is docked beside the text and stays in view while reading', before.pos === 'sticky' && before.col === '2' && after.top >= 56 && after.bottom <= after.h && after.y > 1500, `${JSON.stringify(before)} ${JSON.stringify(after)}`);
  await ctx.close();
}

// ------------------------------------------------------------------ 5. keyboard
{
  const { ctx, page } = await open('truncal/back/#ch-esp', { vp: 1440 });
  await page.locator('h1:visible').first().click();
  await page.keyboard.press('/'); await page.waitForTimeout(150);
  const s1 = await page.evaluate(() => ({ sheet: !document.getElementById('tb-sheet').hidden, focus: document.activeElement?.id }));
  R.check('"/" opens search on a block page', s1.sheet && s1.focus === 'tb-sheet-q', JSON.stringify(s1));
  await page.keyboard.type('a/b');
  R.check('"/" types normally inside the search box', await page.evaluate(() => document.getElementById('tb-sheet-q').value) === 'a/b');
  await page.keyboard.press('Escape'); await page.waitForTimeout(100);
  await page.locator('h1:visible').first().click();
  await page.keyboard.press('Control+k'); await page.waitForTimeout(150);
  R.check('Ctrl+K opens search', await page.evaluate(() => document.activeElement?.id === 'tb-sheet-q'));
  await page.keyboard.press('Escape');
  await page.locator('#esp-step-scan').focus();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100);
  const st = await page.evaluate(() => ({ cur: document.querySelector('#esp-scan .tb-scan-step[aria-current="step"]')?.id, focus: document.activeElement?.id }));
  R.check('arrow keys on a scan step button go to the next step (focus follows)', st.cur === 'esp-step-identify' && st.focus === 'esp-step-identify', JSON.stringify(st));
  await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(100);
  R.check('ArrowLeft goes back a step', await page.evaluate(() => document.querySelector('#esp-scan .tb-scan-step[aria-current="step"]')?.id) === 'esp-step-scan');
  const spec = await page.evaluate(() => { const s = document.querySelector('script[type="speculationrules"][data-ra]'); if (!s) return null; try { return JSON.parse(s.textContent); } catch { return 'bad json'; } });
  R.check('speculation rules: prerender for regional pages, prefetch only for the 3D apps', spec && spec.prerender?.[0]?.eagerness === 'moderate' && JSON.stringify(spec.prefetch).includes('plexus/') && !JSON.stringify(spec.prerender).includes('plexus/'), JSON.stringify(spec));
  await ctx.close();
}
{
  const { ctx, page } = await open('blocks/', { vp: 1440, storage: { 'ra-slash': 'off' } });
  await page.locator('h1:visible').first().click();
  await page.keyboard.press('/'); await page.waitForTimeout(150);
  R.check('"/" does nothing when turned off in Settings', await page.evaluate(() => document.activeElement?.id) !== 'bd-q');
  await page.keyboard.press('Control+k'); await page.waitForTimeout(150);
  R.check('Ctrl+K still focuses search with "/" turned off', await page.evaluate(() => document.activeElement?.id) === 'bd-q');
  await ctx.close();
}
{
  const { ctx, page } = await open('spinal/', { vp: 1440 });
  await page.locator('h1:visible').first().click();
  await page.keyboard.press('/'); await page.waitForTimeout(150);
  R.check('spinal: "/" focuses search', await page.evaluate(() => ['sp-hub-q', 'sp-sheet-q'].includes(document.activeElement?.id)));
  await ctx.close();
}

// ------------------------------------------------------------------ 6. view transitions
{
  const names = async (rm) => {
    const { ctx, page } = await open('truncal/back/', { vp: 1440, reducedMotion: rm });
    const n = await page.evaluate(() => ({ header: getComputedStyle(document.querySelector('.ntf-header')).viewTransitionName, bar: getComputedStyle(document.getElementById('tb-bar')).viewTransitionName }));
    await ctx.close();
    return n;
  };
  const on = await names('no-preference');
  const off = await names('reduce');
  R.check('view transitions: the site header and the app bar are named (they stay still)', on.header === 'ra-site-header' && on.bar === 'ra-appbar', JSON.stringify(on));
  R.check('view transitions: off with reduced motion', off.header === 'none' && off.bar === 'none', JSON.stringify(off));
}

await browser.close();
process.exit(R.finish());
