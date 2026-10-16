#!/usr/bin/env node
// Regional anaesthesia app: the two skins, website look and app look (shared/regional/js/skin.js, css/skin-app.css,
// the tab bar in js/appnav.js; ENGINE.md §2 "Skins").
//
//   node test/regional/skin.mjs        options: --base=<url>  --json=<file>  --failsOnly  --pages=a/,b/  --viewports=390,1440
//
// Checks:
//   1. repository: every regional page carries the same inline skin script in its <head>, before its first stylesheet,
//      and links css/skin-app.css (not lower-limb/anim/); every rule in skin-app.css is under html[data-skin="app"]
//      (so the website look cannot change); no page sets the skin any other way;
//   2. skin resolution (html[data-skin] before the app starts): a plain visit is the website look; home-screen mode
//      (display-mode: standalone, emulated, and a matchMedia stub) is the app look; /blocks/?app sets the tab's
//      "opened as app" flag, so a page opened later in the same tab is the app look and a fresh tab is the website look;
//      ?app on any other page does nothing; an explicit 'web' beats standalone and the flag; an explicit 'app' works on a
//      plain visit; 'auto' is the default; blocked storage gives the website look with no errors;
//   3. in the app look, on each page at 390 and 1440 px: no console errors, no horizontal overflow, the tab bar (five tabs,
//      one current, words as well as icons, 12px labels, along the bottom at 390 and a 96px rail at 1440), the NTF site
//      header and breadcrumbs hidden, the desktop navigation rail hidden (the tab rail replaces it), the app bar ≤ 56px,
//      the page clears the tab bar; the right tab is current; Search opens the page's search (or /blocks/ search);
//   4. the content is the same in both looks: the text of <main> (textContent, and the visible text lowercased) is
//      identical in the website look and the app look, apart from the "Showing the … look now" line in Settings;
//   5. the website look has no tab bar and no app-look styling (computed: square controls, the site header shown).

import fs from 'node:fs';
import path from 'node:path';
import { BASE, ROOT, VIEWPORTS, PAGES, launch, waitReady, reporter, attachLog, args, listArg } from './lib.mjs';

const R = reporter('Skins');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

/** The inline script every regional page carries in its <head> (the same text on every page; ENGINE.md §2 "Skins"). */
export const HEAD_SNIPPET = `<script>(function(){var d=document.documentElement,p='auto',a=0;try{p=localStorage.getItem('ra-skin')||'auto'}catch(e){}try{var s=sessionStorage;if(/\\/blocks\\/(index\\.html)?$/.test(location.pathname)&&/[?&]app(&|=|$)/.test(location.search))s.setItem('ra-in-app','1');a=s.getItem('ra-in-app')?1:0}catch(e){}try{if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)a=1}catch(e){}d.dataset.skin=p==='app'||p==='web'?p:a?'app':'web'})()</script>`;

// ------------------------------------------------------------------ 1. repository
{
  const pages = PAGES.filter((p) => p !== 'regional.html').map((p) => (p.endsWith('/') ? `${p}index.html` : p));
  const bad = [];
  for (const f of pages) {
    const src = read(f);
    const head = src.slice(0, src.indexOf('</head>'));
    const n = head.split(HEAD_SNIPPET).length - 1;
    if (n !== 1) { bad.push(`${f}: the skin script is ${n ? 'there ' + n + ' times' : 'missing or different'}`); continue; }
    const firstCss = head.search(/<link[^>]+rel=["']stylesheet["']/);
    if (firstCss !== -1 && head.indexOf(HEAD_SNIPPET) > firstCss) bad.push(`${f}: the skin script comes after the first stylesheet`);
    if (head.indexOf('skin.js') !== -1) bad.push(`${f}: the page loads skin.js itself (appnav.js does)`);
    const links = [...head.matchAll(/<link[^>]+href=["']([^"']*shared\/regional\/css\/skin-app\.css\?v=\d+)["']/g)];
    if (links.length !== 1) bad.push(`${f}: ${links.length} link(s) to skin-app.css`);
  }
  R.check(`every regional page (${pages.length}) has the same inline skin script before its stylesheets and links skin-app.css once`, !bad.length, bad.join('\n'));
  const anim = read('lower-limb/anim/index.html');
  R.check('lower-limb/anim/ (not regional pages) is untouched by the skin', !/ra-skin|skin-app/.test(anim));

  // Every rule in skin-app.css sits under html[data-skin="app"].
  const css = read('shared/regional/css/skin-app.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const loose = [];
  const scan = (text) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i);
      if (open === -1) break;
      const head = text.slice(i, open).trim();
      let depth = 1; let j = open + 1;
      while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
      const body = text.slice(open + 1, j - 1);
      if (head.startsWith('@')) { if (/^@(media|supports|layer)/.test(head)) scan(body); else loose.push(`at-rule ${head.slice(0, 40)}`); }
      else {
        let d = 0; let cur = ''; const sels = [];
        for (const ch of head) { if (ch === '(' || ch === '[') d++; if (ch === ')' || ch === ']') d--; if (ch === ',' && !d) { sels.push(cur.trim()); cur = ''; } else cur += ch; }
        sels.push(cur.trim());
        for (const s of sels) if (!s.startsWith('html[data-skin="app"]')) loose.push(s.slice(0, 70));
      }
      i = j;
    }
  };
  scan(css);
  R.check('every rule in skin-app.css is under html[data-skin="app"] (the website look cannot change)', !loose.length, loose.join('\n'));
  R.check('no regional page or script sets data-skin except the inline script and skin.js', (() => {
    const hits = [];
    for (const f of ['shared/regional/js/appnav.js', 'shared/regional/js/shell.js', 'blocks/settings/settings.js', 'blocks/blocks.js']) if (/dataset\.skin\s*=(?!=)|setAttribute\(['"]data-skin/.test(read(f))) hits.push(f);
    return !hits.length;
  })());
}

const browser = await launch();
const only = listArg('pages', null);
const VPS = listArg('viewports', ['390', '1440']);
const errs = (log) => [...log.console, ...log.pageErrors, ...log.bad];

/** A context + page; opts: storage (localStorage seeded once per tab), standalone ('stub': matchMedia says display-mode:
 *  standalone; Chromium cannot emulate that media feature, so the CSS-only part of home-screen mode is not testable here),
 *  blocked (storage throws). */
async function open(url, { vp = '1440', storage = {}, standalone = null, blocked = false, ctx = null, reducedMotion = 'reduce' } = {}) {
  const own = !ctx;
  ctx = ctx || await browser.newContext({ ...VIEWPORTS[vp], reducedMotion });
  await ctx.addInitScript(([kv, stub, block]) => {
    if (block) {
      for (const k of ['localStorage', 'sessionStorage']) Object.defineProperty(window, k, { get() { throw new DOMException('blocked', 'SecurityError'); } });
    } else {
      try { if (!sessionStorage.getItem('__seeded')) { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); sessionStorage.setItem('__seeded', '1'); } } catch { /* blocked */ }
    }
    if (stub) { const mm = window.matchMedia.bind(window); window.matchMedia = (q) => (/display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null } : mm(q)); }
  }, [{ 'ra-level-picker': 'dismissed', ...storage }, standalone === 'stub', blocked]);
  const page = await ctx.newPage();
  const log = attachLog(page);
  await page.goto(BASE + url, { waitUntil: 'domcontentloaded' });
  return { ctx, page, log, own };
}
const skinNow = (page) => page.evaluate(() => document.documentElement.dataset.skin);

// ------------------------------------------------------------------ 2. resolution
{
  const cases = [
    ['a plain visit is the website look', 'truncal/back/', {}, 'web'],
    ['the default is Automatic (ra-skin=auto behaves the same)', 'truncal/back/', { storage: { 'ra-skin': 'auto' } }, 'web'],
    ['home-screen mode (display-mode: standalone, matchMedia stubbed) is the app look', 'truncal/back/', { standalone: 'stub' }, 'app'],
    ['home-screen mode is the app look on every kind of page', 'spinal/', { standalone: 'stub' }, 'app'],
    ['home-screen mode opened at /blocks/ is the app look', 'blocks/', { standalone: 'stub' }, 'app'],
    ['an explicit "web" beats home-screen mode', 'truncal/back/', { standalone: 'stub', storage: { 'ra-skin': 'web' } }, 'web'],
    ['an explicit "web" beats the stub', 'plexus/', { standalone: 'stub', storage: { 'ra-skin': 'web' } }, 'web'],
    ['an explicit "app" works on a plain visit', 'lower-limb/hip/', { storage: { 'ra-skin': 'app' } }, 'app'],
    ['an explicit "app" works on a deep link', 'truncal/back/#ch-esp', { storage: { 'ra-skin': 'app' } }, 'app'],
    ['/blocks/?app is the app look', 'blocks/?app', {}, 'app'],
    ['/blocks/?app&x=1 is the app look', 'blocks/?x=1&app', {}, 'app'],
    ['/blocks/?apple is not the link (the website look)', 'blocks/?apple=1', {}, 'web'],
    ['an explicit "web" beats /blocks/?app', 'blocks/?app', { storage: { 'ra-skin': 'web' } }, 'web'],
    ['?app on a page that is not /blocks/ does nothing', 'truncal/back/?app', {}, 'web'],
    ['blocked storage gives the website look, with no errors', 'blocks/?app', { blocked: true }, 'web'],
  ];
  for (const [name, url, opts, want] of cases) {
    const { ctx, page, log } = await open(url, opts);
    await waitReady(page, { idle: false });
    const got = await skinNow(page);
    const e = errs(log);
    R.check(`resolution: ${name}`, got === want && !e.length, `data-skin=${got}, wanted ${want}${e.length ? `; errors: ${e.join(' | ')}` : ''}`);
    await ctx.close();
  }
  // The block-app link: /blocks/?app sets a flag for this tab; the next page in the same tab is the app look; a fresh tab is not.
  {
    const { ctx, page, log } = await open('blocks/?app', {});
    await waitReady(page, { idle: false });
    const first = await skinNow(page);
    const flag = await page.evaluate(() => sessionStorage.getItem('ra-in-app'));
    await page.goto(`${BASE}truncal/back/`, { waitUntil: 'domcontentloaded' });
    const second = await skinNow(page);
    await page.goto(`${BASE}spinal/#ch-technique`, { waitUntil: 'domcontentloaded' });
    const third = await skinNow(page);
    await page.goto(`${BASE}blocks/`, { waitUntil: 'domcontentloaded' });
    const fourth = await skinNow(page); // /blocks/ without ?app, same tab
    R.check('resolution: /blocks/?app sets the "opened as app" flag; later pages in the same tab (even /blocks/ without ?app) are the app look',
      first === 'app' && flag === '1' && second === 'app' && third === 'app' && fourth === 'app', JSON.stringify({ first, flag, second, third, fourth }));
    const fresh = await ctx.newPage(); // a new tab: its own sessionStorage
    const log2 = attachLog(fresh);
    await fresh.goto(`${BASE}truncal/back/`, { waitUntil: 'domcontentloaded' });
    const f1 = await skinNow(fresh);
    await fresh.goto(`${BASE}blocks/`, { waitUntil: 'domcontentloaded' });
    const f2 = await skinNow(fresh);
    R.check('resolution: a fresh tab (a shared link, a normal visit) is the website look', f1 === 'web' && f2 === 'web', JSON.stringify({ f1, f2 }));
    R.check('resolution: no errors in those tabs', !errs(log).length && !errs(log2).length, [...errs(log), ...errs(log2)].join(' | '));
    await ctx.close();
  }
  // A page whose script is blocked still gets a skin from skin.js (appnav.js imports it), and Settings can change it live.
  {
    const { ctx, page } = await open('truncal/back/', { storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    const r = await page.evaluate(async () => {
      const m = await import(new URL('shared/regional/js/skin.js?v=20261018', location.origin + '/').href);
      const out = { pref: m.getSkinPref(), skin: m.getSkin() };
      m.setSkinPref('web'); out.afterWeb = [m.getSkin(), document.documentElement.dataset.skin, localStorage.getItem('ra-skin'), document.querySelectorAll('.ra-tabbar').length];
      m.setSkinPref('app'); out.afterApp = [m.getSkin(), document.documentElement.dataset.skin, localStorage.getItem('ra-skin'), document.querySelectorAll('.ra-tabbar').length];
      m.setSkinPref('auto'); out.afterAuto = [m.getSkin(), localStorage.getItem('ra-skin'), document.querySelectorAll('.ra-tabbar').length];
      m.setSkinPref('nonsense'); out.afterBad = localStorage.getItem('ra-skin');
      return out;
    });
    R.check('skin.js: getSkinPref / setSkinPref switch the page live (the tab bar is drawn and removed) and ignore a bad value',
      r.pref === 'app' && r.skin === 'app' && r.afterWeb.join() === 'web,web,web,0' && r.afterApp.join() === 'app,app,app,1' && r.afterAuto.join() === 'web,auto,0' && r.afterBad === 'auto', JSON.stringify(r));
    await ctx.close();
  }
}

// ------------------------------------------------------------------ 3. the app look on each page
const APP_PAGES = (only || ['blocks/', 'truncal/back/', 'blocks/settings/', 'spinal/', 'brachial-plexus/', 'plexus/', 'blocks/calculator/', 'truncal/', 'lower-limb/hip/']);
const WANT_CURRENT = { 'blocks/settings/': 'Settings', 'blocks/calculator/': 'Calculator', 'blocks/#wrong': 'Guides' };
const TAB_WORDS = ['Blocks', 'Search', 'Guides', 'Calculator', 'Settings'];
for (const vp of VPS) {
  for (const p of [...APP_PAGES, ...(!only ? ['blocks/#wrong'] : [])]) {
    const { ctx, page, log } = await open(p, { vp, storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(250);
    const s = await page.evaluate(() => {
      const vis = (n) => !!n && n.getClientRects().length > 0 && getComputedStyle(n).visibility !== 'hidden';
      const nav = document.querySelector('nav.ra-tabbar');
      const tabs = [...document.querySelectorAll('.ra-tabbar .ra-tab')];
      const r = nav?.getBoundingClientRect();
      const bar = document.querySelector('.ra-appbar');
      const body = getComputedStyle(document.body);
      const last = [...document.body.children].filter((n) => n !== nav && n.getClientRects().length).pop();
      return {
        skin: document.documentElement.dataset.skin,
        tabbars: document.querySelectorAll('nav.ra-tabbar').length,
        labels: tabs.map((t) => t.querySelector('.ra-tab-label')?.textContent.trim()),
        icons: tabs.map((t) => !!t.querySelector('svg')),
        current: tabs.filter((t) => t.getAttribute('aria-current') === 'page').map((t) => t.querySelector('.ra-tab-label').textContent.trim()),
        fontPx: [...new Set(tabs.map((t) => getComputedStyle(t.querySelector('.ra-tab-label')).fontSize))],
        tabH: tabs.map((t) => Math.round(t.getBoundingClientRect().height)),
        box: r && { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        vw: innerWidth, vh: innerHeight,
        header: vis(document.querySelector('.ntf-header')), crumbs: vis(document.querySelector('.ntf-crumbs')),
        rail: vis(document.querySelector('.ra-rail')),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bar: bar ? Math.round(bar.getBoundingClientRect().height) : null, barSticky: bar ? getComputedStyle(bar).position : null,
        padB: parseFloat(body.paddingBottom), padL: parseFloat(body.paddingLeft),
        lastBottom: last ? Math.round(last.getBoundingClientRect().bottom + scrollY) : null, docH: document.documentElement.scrollHeight,
        bg: getComputedStyle(document.documentElement).backgroundColor,
        emoji: /\p{Extended_Pictographic}/u.test(nav?.textContent || ''),
        nav: nav?.getAttribute('aria-label'),
      };
    });
    const at = `${p} @${vp}`;
    const wide = Number(vp) >= 1024;
    R.check(`${at}: app look, no console errors`, s.skin === 'app' && !errs(log).length, `${s.skin}; ${errs(log).join(' | ')}`);
    R.check(`${at}: no horizontal overflow`, s.overflow <= 0, `${s.overflow}px`);
    R.check(`${at}: one tab bar with five tabs (Blocks, Search, Guides, Calculator, Settings), each an icon and a word`, s.tabbars === 1 && JSON.stringify(s.labels) === JSON.stringify(TAB_WORDS) && s.icons.every(Boolean) && !s.emoji && !!s.nav, JSON.stringify(s));
    const wantCur = p.includes('#wrong') ? 'Guides' : (WANT_CURRENT[p] || 'Blocks');
    R.check(`${at}: exactly one tab is current (${wantCur})`, s.current.length === 1 && s.current[0] === wantCur, JSON.stringify(s.current));
    R.check(`${at}: tab labels are 12px and tabs are at least 44px (52px tall below 1024px)`, s.fontPx.join() === '12px' && s.tabH.every((h) => h >= (wide ? 44 : 50)), `${s.fontPx} ${s.tabH}`);
    if (wide) {
      R.check(`${at}: the tab bar is a 96px rail down the left`, s.box && s.box.x === 0 && s.box.w === 96 && s.box.h >= s.vh - 2 && s.padL === 96, JSON.stringify(s.box));
      R.check(`${at}: the desktop navigation rail is hidden (the tab rail replaces it)`, !s.rail, 'the old rail shows');
    } else {
      R.check(`${at}: the tab bar is along the bottom, 52px tall`, s.box && s.box.x === 0 && s.box.w === s.vw && s.box.h >= 52 && s.box.h <= 54 && Math.abs(s.box.y + s.box.h - s.vh) <= 1, JSON.stringify(s.box));
      R.check(`${at}: the page clears the tab bar (bottom padding ≥ 52px)`, s.padB >= 52, `${s.padB}px`);
    }
    R.check(`${at}: the NTF site header and the breadcrumbs are hidden`, !s.header && !s.crumbs, JSON.stringify({ header: s.header, crumbs: s.crumbs }));
    if (s.bar != null) R.check(`${at}: one sticky app bar at the top, at most 56px`, s.bar <= 57 && s.barSticky === 'sticky', `${s.bar}px ${s.barSticky}`);
    R.check(`${at}: the ground is the app's warm ground`, s.bg === 'rgb(241, 237, 228)', s.bg);
    await ctx.close();
  }
}

// Tab behaviour at 390.
{
  const { ctx, page } = await open('truncal/back/', { vp: '390', storage: { 'ra-skin': 'app' } });
  await waitReady(page, { idle: false });
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('.ra-tabbar .ra-tab')].map((t) => t.getAttribute('href') || t.tagName));
  R.check('tabs: Blocks, Guides, Calculator and Settings are links to /blocks/, /blocks/#wrong, /blocks/calculator/ and /blocks/settings/; Search is a button',
    JSON.stringify(hrefs.map((h) => h.replace(/^.*?(\/blocks\/)/, '$1'))) === JSON.stringify(['/blocks/', 'BUTTON', '/blocks/#wrong', '/blocks/calculator/', '/blocks/settings/']), JSON.stringify(hrefs));
  await page.locator('.ra-tab[data-tab="search"]').click();
  await page.waitForTimeout(250);
  const open1 = await page.evaluate(() => ({ focus: document.activeElement?.id, sheet: !document.getElementById('tb-sheet')?.hidden }));
  R.check('tabs: Search opens the block page’s own search (the same as the app bar search)', open1.focus === 'tb-sheet-q' || open1.focus === 'tb-hub-q' || open1.sheet, JSON.stringify(open1));
  await ctx.close();
}
{
  const { ctx, page } = await open('truncal/', { vp: '390', storage: { 'ra-skin': 'app' } });
  await waitReady(page, { idle: false });
  await page.locator('.ra-tab[data-tab="search"]').click();
  await page.waitForURL(/blocks\/#search/, { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({ url: location.pathname + location.hash, focus: document.activeElement?.id, skin: document.documentElement.dataset.skin }));
  R.check('tabs: Search on a page with no search of its own goes to the search box on /blocks/', /\/blocks\/#search$/.test(r.url) && r.focus === 'bd-q' && r.skin === 'app', JSON.stringify(r));
  await page.locator('.ra-tab[data-tab="guides"]').click();
  await page.waitForTimeout(400);
  const g = await page.evaluate(() => ({ cur: document.querySelector('.ra-tab[aria-current="page"] .ra-tab-label')?.textContent, hash: location.hash }));
  R.check('tabs: Guides goes to "If it goes wrong" on /blocks/ and becomes the current tab', g.cur === 'Guides' && g.hash === '#wrong', JSON.stringify(g));
  await ctx.close();
}
{
  // Ctrl+K and "/" still open the page's search in the app look.
  const { ctx, page } = await open('truncal/back/', { vp: '1440', storage: { 'ra-skin': 'app' } });
  await waitReady(page, { idle: false });
  await page.keyboard.press('Control+k');
  await page.waitForTimeout(200);
  const f = await page.evaluate(() => document.activeElement?.id);
  R.check('app look: Ctrl+K still opens the page search', ['tb-sheet-q', 'tb-hub-q'].includes(f), String(f));
  await ctx.close();
}

// ------------------------------------------------------------------ 4. the same content in both looks
{
  const PAGES_SAME = (only || ['blocks/', 'truncal/back/', 'blocks/settings/', 'spinal/', 'brachial-plexus/', 'plexus/', 'blocks/calculator/', 'truncal/', 'lower-limb/hip/', 'upper-limb/']);
  const grab = async (p, vp, skin) => {
    const { ctx, page } = await open(p, { vp, storage: { 'ra-skin': skin } });
    await waitReady(page, { idle: true });
    await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
    // Wait until the text of <main> stops changing (3D models, the app version line and scans fill in after load).
    for (let i = 0, prev = -1; i < 14; i++) {
      await page.waitForTimeout(500);
      const n = await page.evaluate(() => document.querySelector('main').textContent.length);
      if (n === prev) break;
      prev = n;
    }
    const t = await page.evaluate(() => {
      // Left out: the "Showing the … look now" line (it says which look), and text drawn to fit the width of a scan image
      // or the 3D model (short or long structure names, which labels are visible, "Loading 3D model… 100%"): that follows
      // the width the page has, which differs between the looks (the app look has no desktop rail), not the content.
      const SKIP = '#st-skin-now,script,style,.tb-scan svg,.ra-rs svg,.v3d-labels,.v3d-loading,.px-loading,[class*="loading"]';
      const main = document.querySelector('main').cloneNode(true);
      main.querySelectorAll(SKIP).forEach((n) => n.remove());
      const norm = (s) => s.replace(/\s+/g, ' ').trim();
      const live = document.querySelector('main');
      const hid = [...live.querySelectorAll(SKIP)].map((n) => [n, n.style.display]);
      for (const [n] of hid) n.style.display = 'none';
      const visible = norm(live.innerText).toLowerCase();
      for (const [n, d] of hid) n.style.display = d;
      return { text: norm(main.textContent), visible, skin: document.documentElement.dataset.skin };
    });
    await ctx.close();
    return t;
  };
  for (const vp of VPS) {
    for (const p of PAGES_SAME) {
      const web = await grab(p, vp, 'web');
      const app = await grab(p, vp, 'app');
      const same = web.text === app.text;
      const first = same ? -1 : [...web.text].findIndex((c, i) => c !== app.text[i]);
      R.check(`${p} @${vp}: the text of <main> is the same in both looks (${web.text.length} characters)`, web.skin === 'web' && app.skin === 'app' && same,
        `differs at ${first}: web «${web.text.slice(Math.max(0, first - 30), first + 50)}» app «${app.text.slice(Math.max(0, first - 30), first + 50)}»`);
      R.check(`${p} @${vp}: the visible text is the same in both looks`, web.visible === app.visible,
        (() => { const i = [...web.visible].findIndex((c, k) => c !== app.visible[k]); return `differs at ${i}: web «${web.visible.slice(Math.max(0, i - 30), i + 50)}» app «${app.visible.slice(Math.max(0, i - 30), i + 50)}»`; })());
    }
  }
}

// ------------------------------------------------------------------ 5. the website look is untouched
{
  for (const p of ['blocks/', 'truncal/back/', 'spinal/']) {
    const { ctx, page } = await open(p, { vp: '1440', storage: { 'ra-skin': 'web' } });
    await waitReady(page, { idle: false });
    const s = await page.evaluate(() => {
      const btn = document.querySelector('.ra-appbar :is(.tb-bar-home,.sp-bar-home)');
      const bar = document.querySelector('.ra-appbar');
      return {
        skin: document.documentElement.dataset.skin, tabbar: document.querySelectorAll('.ra-tabbar').length,
        header: document.querySelector('.ntf-header')?.getClientRects().length > 0,
        radius: btn ? getComputedStyle(btn).borderTopLeftRadius : null,
        blur: bar ? (getComputedStyle(bar).backdropFilter || 'none') : null,
        bodyBg: getComputedStyle(document.body).backgroundColor, padL: getComputedStyle(document.body).paddingLeft,
      };
    });
    R.check(`${p}: the website look has no tab bar, the site header, square controls, no blur and the paper ground`,
      s.skin === 'web' && s.tabbar === 0 && s.header && s.radius === '0px' && s.blur === 'none' && s.bodyBg === 'rgb(247, 245, 239)' && s.padL === '0px', JSON.stringify(s));
    await ctx.close();
  }
  // (Home-screen mode itself, the CSS media query display-mode: standalone, cannot be emulated in Chromium: appnav.css keeps
  //  hiding the header and breadcrumbs there only while no skin is set, and "Website look" shows them again.)
}

await browser.close();
process.exit(R.finish());
