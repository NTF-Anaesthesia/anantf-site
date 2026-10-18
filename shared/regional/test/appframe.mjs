#!/usr/bin/env node
// Regional anaesthesia app: the shared app frame (shared/regional/js/appnav.js, css/appnav.css; ENGINE.md §2 "App frame").
//
//   node shared/regional/test/appframe.mjs        options: --base=<url>  --json=<file>  --failsOnly
//
// Checks:
//   1. /blocks/settings/: loads without errors, noindex, credit line, level control, both switches with their defaults
//      (bar auto-hide off, "/" on), each switch saves its choice ('ra-autohide', 'ra-slash'), the app version lines;
//   2. every kind of regional page reaches Settings from its app bar (a visible link, or one inside the bar's menu);
//   3. "Hide the bar while scrolling down": off by default (the bar never moves); when on, it slides away on a scroll
//      down, comes back on a scroll up, stays while a menu is open, and the phone scan column follows it;
//   4. desktop rail at 1024 and 1440 on the block pages, spinal and Settings (current chapter marked, follows chapter
//      changes), none at 390 and none on the region landings and /blocks/ (their choosers need the width); the frame
//      keeps the site's 1240px column (bar and breadcrumbs line up with the site header); no horizontal overflow;
//      the document (not an inner box) scrolls; the scan teacher stays in the page flow (no inner scroll box);
//   5. keyboard: "/" and Ctrl+K open search (not "/" while typing, not when turned off); arrow keys on a step button;
//   6. speculation rules (prefetch only, regional pages on this site, never the animation player) are added where the
//      browser has them; view transitions are named for the header and the bar and switched off with reduced motion.
//   7. auto-hide on: a scroll the page makes itself (a jump to a section) never hides the bar.

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
  // /blocks/ultrasound/ builds its list from the block pages' data after load (body[data-us-ready]).
  await page.waitForFunction(() => !document.getElementById('us-list') || document.body.dataset.usReady === 'true', null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(300);
  return { ctx, page, log };
}
const errs = (log) => [...log.console, ...log.pageErrors, ...log.bad];
const barState = (page) => page.evaluate(() => {
  const bar = document.querySelector('.ra-appbar');
  return { hidden: document.documentElement.dataset.raBar === 'hidden', top: bar ? Math.round(bar.getBoundingClientRect().top) : null };
});
// The reader scrolling (mouse wheel), not the page scrolling itself: only the reader's own scroll may hide the bar.
async function scrollSteps(page, dy, n = 6) {
  const vp = page.viewportSize();
  await page.mouse.move(6, Math.round(vp.height * 0.7)); // in the side gutter: not on a 3D model or scan, which take the wheel themselves
  for (let i = 0; i < n; i++) { await page.mouse.wheel(0, dy); await page.waitForTimeout(60); }
  await page.waitForTimeout(250);
}

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
const KINDS = ['truncal/back/', 'lower-limb/hip/', 'truncal/', 'upper-limb/', 'blocks/', 'spinal/', 'brachial-plexus/', 'plexus/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/'];
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

{
  // A jump the page makes itself (a section link, scrollIntoView, a #hash) is not the reader scrolling: the bar stays.
  const { ctx, page } = await open('truncal/back/#ch-esp', { vp: 390, storage: { 'ra-autohide': 'on' } });
  await page.evaluate(() => document.getElementById('esp-scan')?.scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(150);
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(300);
  const s = await barState(page);
  R.check('truncal/back/ @390 auto-hide on: a scroll the page makes itself does not hide the bar', !s.hidden && s.top === 0, JSON.stringify(s));
  await ctx.close();
}

// ------------------------------------------------------------------ 4. rail, overflow, the site column, scan in the flow
const RAIL = new Set(['truncal/back/#ch-esp', 'lower-limb/hip/', 'spinal/#ch-technique', 'blocks/settings/', 'blocks/safety/']);
for (const vp of [390, 1024, 1180, 1440]) {
  for (const p of ['truncal/back/#ch-esp', 'lower-limb/hip/', 'head-neck/', 'upper-limb/', 'blocks/', 'spinal/#ch-technique', 'blocks/settings/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/']) {
    const { ctx, page, log } = await open(p, { vp });
    const r = await page.evaluate(() => {
      const rail = document.querySelector('.ra-rail');
      const de = document.documentElement;
      const left = (sel) => { const n = document.querySelector(sel); if (!n) return null; const st = getComputedStyle(n); return Math.round(n.getBoundingClientRect().left + parseFloat(st.paddingLeft)); };
      return {
        shown: !!rail && rail.getClientRects().length > 0 && getComputedStyle(rail).display !== 'none',
        current: rail ? [...rail.querySelectorAll('a[aria-current]')].map((a) => a.textContent.trim()) : [],
        overflow: de.scrollWidth - de.clientWidth,
        docScrolls: de.scrollHeight > innerHeight + 100,
        header: left('.ntf-header-inner'), crumbs: left('.ntf-crumbs'), bar: left('.ra-appbar :is(.tb-bar-inner,.sp-bar-inner,.ra-sbar-inner)'),
      };
    });
    const want = vp >= 1024 && RAIL.has(p);
    R.check(`${p} @${vp}: ${want ? 'rail shown with the current item marked' : vp >= 1024 ? 'no rail (the page needs its width)' : 'no rail on phones'}`, want ? r.shown && r.current.length >= 1 : !r.shown, JSON.stringify(r));
    R.check(`${p} @${vp}: no horizontal overflow, the page itself scrolls`, r.overflow <= 1 && r.docScrolls, JSON.stringify(r));
    if (vp >= 1024) R.check(`${p} @${vp}: the app bar lines up with the site header (DESIGN.md: 1240px column, 56px gutters)`, r.bar != null && Math.abs(r.bar - r.header) <= 1 && (r.crumbs == null || Math.abs(r.crumbs - r.header) <= 1), JSON.stringify(r));
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
  const w = await page.evaluate(() => {
    const wrap = document.querySelector('#ch-esp > .tb-scan-wrap'); const cs = getComputedStyle(wrap);
    const grid = document.querySelector('#esp-scan .tb-scan-grid');
    return { pos: cs.position, oy: cs.overflowY, cols: getComputedStyle(grid).gridTemplateColumns.split(' ').length };
  });
  R.check('truncal/back/ @1440: the scan teacher stays in the page flow (no inner scroll box), image beside its step panel', w.pos === 'static' && w.oy === 'visible' && w.cols === 2, JSON.stringify(w));
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
  const specS = JSON.stringify(spec);
  R.check('speculation rules: prefetch only (no prerender), regional pages on this site, never the animation player', spec && !spec.prerender && spec.prefetch?.[0]?.eagerness === 'moderate'
    && spec.prefetch[0].where.and[0].or.every((r) => r.relative_to === 'document' && r.href_matches.startsWith('/') && !r.href_matches.startsWith('//'))
    && specS.includes('lower-limb/anim/*') && !/regional\.html|exams|popliteal|mo\/|qbank|babymo/.test(specS), specS);
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

// ------------------------------------------------------------------ 8. Look (skin) in Settings
// (the full skin matrix, tab bar and no-overflow checks are in skin.mjs)
{
  const { ctx, page, log } = await open('blocks/settings/', { vp: 390 });
  const look = () => page.evaluate(() => ({
    skin: document.documentElement.dataset.skin,
    pref: document.querySelector('input[name="st-skin"]:checked')?.value,
    saved: (() => { try { return localStorage.getItem('ra-skin'); } catch { return 'blocked'; } })(),
    tabs: document.querySelectorAll('.ra-tabbar .ra-tab').length,
    header: !!document.querySelector('.ntf-header')?.getClientRects().length,
    rail: [...document.querySelectorAll('.ra-rail a[data-rail]')].map((a) => a.textContent.trim()),
    labels: [...document.querySelectorAll('.st-skin-opt span')].map((s) => s.textContent.trim()),
    now: document.getElementById('st-skin-now')?.textContent,
  }));
  const a = await look();
  R.check('settings: a "Look" section comes first, with Automatic · App look · Website look', JSON.stringify(a.labels) === '["Automatic","App look","Website look"]' && await page.evaluate(() => document.querySelector('main section.st-section')?.id === 'look'), JSON.stringify(a));
  R.check('settings: Look is Automatic by default (a normal tab shows the website look, no tab bar)', a.pref === 'auto' && a.skin === 'web' && a.tabs === 0 && a.header && a.saved === null, JSON.stringify(a));
  await page.locator('.st-skin-opt:has(input[value="app"])').click();
  await page.waitForTimeout(150);
  const b = await look();
  R.check('settings: "App look" switches at once, with no reload: the tab bar appears, the site header goes, ra-skin=app is saved', b.skin === 'app' && b.tabs === 5 && !b.header && b.saved === 'app' && b.pref === 'app', JSON.stringify(b));
  await page.locator('.st-skin-opt:has(input[value="web"])').click();
  await page.waitForTimeout(150);
  const c = await look();
  R.check('settings: "Website look" switches back at once: no tab bar, the site header is back, ra-skin=web is saved', c.skin === 'web' && c.tabs === 0 && c.header && c.saved === 'web' && /website/.test(c.now), JSON.stringify(c));
  await page.locator('.st-skin-opt:has(input[value="auto"])').click();
  await page.waitForTimeout(150);
  const d = await look();
  R.check('settings: "Automatic" goes back to the default (website look in a normal tab)', d.skin === 'web' && d.pref === 'auto', JSON.stringify(d));
  R.check('settings: no errors while switching', !errs(log).length, errs(log).join(' | '));
  await ctx.close();
}
{
  // The rail lists Look first (website look, wide screen); in the app look the tab rail replaces it.
  const { ctx, page } = await open('blocks/settings/', { vp: 1440 });
  const rail = await page.evaluate(() => [...document.querySelectorAll('.ra-rail .ra-rail-g--page a')].map((a) => a.textContent.trim()));
  R.check('settings: the rail lists Look first, then Level of detail', rail[0] === 'Look' && rail[1] === 'Level of detail', JSON.stringify(rail));
  await ctx.close();
}

await browser.close();
process.exit(R.finish());
