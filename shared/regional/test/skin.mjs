#!/usr/bin/env node
// Regional anaesthesia app: the two skins, website look and app look (shared/regional/js/skin.js, css/skin-app.css,
// the tab bar in js/appnav.js; ENGINE.md §2 "Skins").
//
//   node shared/regional/test/skin.mjs        options: --base=<url>  --json=<file>  --failsOnly  --pages=a/,b/  --viewports=390,1440
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
//   3. in the app look, on each page at 390 and 1440 px: no console errors, no horizontal overflow, the tab bar (five topic
//      tabs: Blocks, 3D anatomy, Ultrasound, Indication, Settings; one current, words as well as icons, 12px labels, along
//      the bottom at 390 and a 96px rail at 1440), the NTF site header and breadcrumbs hidden, the desktop navigation rail
//      hidden (the tab rail replaces it), the app bar ≤ 56px, the page clears the tab bar; the right tab is current;
//      3a. the top bar on every regional page: a search button (44px; it opens the page's own search, or /blocks/#search),
//      the red Safety button (the word, 44px, danger colours, to /blocks/safety/), fits at 360px with no overflow, and the
//      website look has neither;
//   3b. polish in the app look: no text under 12px, no button or block link under 44px, every link and button 4.5:1;
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
const APP_PAGES = (only || ['blocks/', 'truncal/back/', 'blocks/settings/', 'spinal/', 'brachial-plexus/', 'plexus/', 'truncal/', 'lower-limb/hip/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/']);
const WANT_CURRENT = { 'blocks/settings/': 'Settings', 'plexus/': '3D anatomy', 'blocks/ultrasound/': 'Ultrasound', 'blocks/indication/': 'Indication' };
const TAB_WORDS = ['Blocks', '3D anatomy', 'Ultrasound', 'Indication', 'Settings'];
for (const vp of VPS) {
  for (const p of APP_PAGES) {
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
    R.check(`${at}: one tab bar with five tabs (Blocks, 3D anatomy, Ultrasound, Indication, Settings), each an icon and a word`, s.tabbars === 1 && JSON.stringify(s.labels) === JSON.stringify(TAB_WORDS) && s.icons.every(Boolean) && !s.emoji && !!s.nav, JSON.stringify(s));
    const wantCur = WANT_CURRENT[p] || 'Blocks';
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

// 3b. Polish in the app look (the review of 16 Oct 2026): no text under 12px, no tap target under 44px (inline links in a sentence
// excepted), and every link and button readable (4.5:1 against what is behind it: a link inside the wine dose card was wine on wine).
const POLISH_PAGES = (only || ['truncal/back/#ch-esp', 'lower-limb/thigh/#ch-sciatic', 'blocks/', 'spinal/#ch-technique', 'plexus/', 'brachial-plexus/', 'blocks/settings/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/']);
for (const vp of VPS) {
  for (const p of POLISH_PAGES) {
    const { ctx, page } = await open(p, { vp, storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(400);
    const s = await page.evaluate(() => {
      const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !e.closest('[hidden],svg,canvas,.sr-only,.tb-sr,.sp-sr,.ra-sr'); };
      const nm = (e) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}.${String(e.className).split(' ')[0]} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 18)}"`;
      const small = [], tiny = [], dim = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const e = n.parentElement; if (!e || !n.textContent.trim() || e.closest('script,style,noscript')) continue; if (!vis(e)) continue;
        if (parseFloat(getComputedStyle(e).fontSize) < 11.95) small.push(nm(e));
      }
      const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const q = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [q[0], q[1], q[2], q.length > 3 ? q[3] : 1]; };
      const mix = (f, b) => [f[0] * f[3] + b[0] * (1 - f[3]), f[1] * f[3] + b[1] * (1 - f[3]), f[2] * f[3] + b[2] * (1 - f[3])];
      const lum = (c) => { const g = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * g(c[0]) + 0.7152 * g(c[1]) + 0.0722 * g(c[2]); };
      const back = (e) => { const st = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c && c[3] > 0) { st.push(c); if (c[3] >= 1) break; } } let b = [255, 255, 255]; for (let i = st.length - 1; i >= 0; i--) b = mix(st[i], b); return b; };
      for (const e of document.querySelectorAll('a[href],button,summary,select,input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]),textarea,[role=button],[role=tab]')) {
        if (!vis(e)) continue; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
        if (e.matches('.tb-skip,.skip,.sr-only') || e.closest('.sr-only')) continue;
        const inline = e.tagName === 'A' && cs.display === 'inline';
        if (!inline && Math.min(r.width, r.height) < 43.5) tiny.push(`${nm(e)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        if (e.tagName === 'A' || e.tagName === 'BUTTON') {
          const fg = parse(cs.color), bg = back(e); if (!fg || !bg || !(e.textContent || '').trim()) continue;
          const f = mix([fg[0], fg[1], fg[2], fg[3]], bg); const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          if (ratio < 4.5) dim.push(`${nm(e)} ${ratio.toFixed(2)}`);
        }
      }
      return { small: [...new Set(small)].slice(0, 5), tiny: [...new Set(tiny)].slice(0, 6), dim: [...new Set(dim)].slice(0, 5) };
    });
    const at = `${p} @${vp}`;
    R.check(`${at}: app look, no text under 12px`, !s.small.length, s.small.join('; '));
    R.check(`${at}: app look, no button or block link under 44px (inline links in a sentence excepted)`, !s.tiny.length, s.tiny.join('; '));
    R.check(`${at}: app look, every link and button is readable (4.5:1 against what is behind it)`, !s.dim.length, s.dim.join('; '));
    await ctx.close();
  }
}

// Tab behaviour and the top bar's search and Safety buttons.
{
  const { ctx, page } = await open('truncal/back/', { vp: '390', storage: { 'ra-skin': 'app' } });
  await waitReady(page, { idle: false });
  const hrefs = await page.evaluate(() => [...document.querySelectorAll('.ra-tabbar .ra-tab')].map((t) => t.getAttribute('href') || t.tagName));
  R.check('tabs: Blocks, 3D anatomy, Ultrasound, Indication and Settings are links to /blocks/, /plexus/, /blocks/ultrasound/, /blocks/indication/ and /blocks/settings/',
    JSON.stringify(hrefs.map((h) => h.replace(/^https?:\/\/[^/]+/, ''))) === JSON.stringify(['/blocks/', '/plexus/', '/blocks/ultrasound/', '/blocks/indication/', '/blocks/settings/']), JSON.stringify(hrefs));
  // A block page reached from Ultrasound or Indication is Blocks again: the tab only marks those two screens.
  const cur = await page.evaluate(() => document.querySelector('.ra-tab[aria-current="page"]')?.dataset.tab);
  R.check('tabs: a block page (truncal/back/) is the Blocks tab, whichever screen it was reached from', cur === 'blocks', String(cur));
  await ctx.close();
}
{
  // Every regional page: the bar has a search button and the Safety button in the app look, and neither in the website look.
  const BAR_PAGES = only || ['blocks/', 'truncal/', 'truncal/back/', 'lower-limb/hip/', 'upper-limb/', 'head-neck/', 'lower-limb/', 'spinal/', 'brachial-plexus/', 'plexus/', 'blocks/settings/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/'];
  for (const vp of ['320', '360', '390', '1440']) {
    for (const p of BAR_PAGES) {
      const { ctx, page, log } = await open(p, { vp: vp === '1440' ? '1440' : '390', storage: { 'ra-skin': 'app' } });
      if (vp === '320' || vp === '360') await page.setViewportSize({ width: Number(vp), height: 780 });
      await waitReady(page, { idle: false });
      await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(300);
      const b = await page.evaluate(() => {
        const bar = document.querySelector('.ra-appbar');
        const r = (n) => { if (!n) return null; const q = n.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height), l: Math.round(q.left), r: Math.round(q.right), vis: n.getClientRects().length > 0 }; };
        const saf = bar?.querySelector('a.ra-safety');
        const sbtn = bar?.querySelector('#tb-search-open, #sp-search-open, .ra-bsearch');
        const cs = saf && getComputedStyle(saf);
        const level = bar?.querySelector('.ra-level-seg');
        const inner = bar?.firstElementChild;
        const kids = [...bar.querySelectorAll('a,button')].filter((n) => n.getClientRects().length && !n.closest('[hidden],.tb-sheet,.sp-sheet,.tb-chmenu-panel,.sp-chmenu-panel,.bp-blockmenu-panel'));
        return {
          safety: r(saf), href: saf?.getAttribute('href'), text: saf?.textContent.trim(), fg: cs?.color, bg: cs?.backgroundColor,
          search: r(sbtn), level: level ? r(level) : null, bar: r(bar), vw: innerWidth,
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          outside: kids.filter((n) => { const q = n.getBoundingClientRect(); return q.right > innerWidth + 0.5 || q.left < -0.5; }).map((n) => n.className || n.id).slice(0, 3),
          small: kids.filter((n) => { const q = n.getBoundingClientRect(); return Math.min(q.width, q.height) < 43.5; }).map((n) => `${n.id || n.className} ${Math.round(n.getBoundingClientRect().width)}x${Math.round(n.getBoundingClientRect().height)}`).slice(0, 4),
          tabClipped: [...document.querySelectorAll('.ra-tabbar .ra-tab-label')].filter((l) => l.scrollWidth > l.clientWidth + 0.5).map((l) => l.textContent.trim()),
          menuInBar: !!bar.querySelector('.tb-chmenu,.sp-chmenu,.bp-blockmenu'), menuRow: !!document.querySelector('.ra-titlerow .tb-chmenu,.ra-titlerow .sp-chmenu,.ra-titlerow .bp-blockmenu'),
        };
      });
      const at = `${p} @${vp}`;
      R.check(`${at}: the bar has the Safety button (the word, a link to /blocks/safety/, at least 44px) and a search button of 44px`,
        b.safety?.vis && b.text === 'Safety' && /\/blocks\/safety\/$/.test(b.href || '') && b.safety.h >= 44 && b.safety.w >= 44 && b.search?.vis && b.search.w >= 44 && b.search.h >= 44, JSON.stringify(b));
      R.check(`${at}: Safety is a danger-colour pair (red on pale red)`, b.fg === 'rgb(161, 42, 28)' && b.bg === 'rgb(246, 225, 223)', `${b.fg} on ${b.bg}`);
      R.check(`${at}: the bar fits (nothing outside the window, no sideways scroll, every target at least 44px, bar ≤ 56px)`, !b.outside.length && b.overflow <= 0 && !b.small.length && b.bar.h <= 57, JSON.stringify({ outside: b.outside, overflow: b.overflow, small: b.small, bar: b.bar }));
      if (vp !== '1440') R.check(`${at}: below 480px the chapter menu is the row under the bar, not in it`, !b.menuInBar || !b.menuRow || (b.menuRow && !b.menuInBar), JSON.stringify({ inBar: b.menuInBar, row: b.menuRow }));
      R.check(`${at}: every tab label is shown in full (no ellipsis on "3D anatomy", the longest)`, !b.tabClipped.length, b.tabClipped.join(', '));
      R.check(`${at}: no console errors`, !errs(log).length, errs(log).join(' | '));
      await ctx.close();
    }
  }
  // The Indication result at 1440 beside the tab rail: the text beside the figure was squeezed to one word a line.
  {
    const { ctx, page } = await open('blocks/indication/#op-upper-limb-arthroscopy', { vp: '1440', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.waitForFunction(() => document.body.dataset.bdReady === 'true', null, { timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(500);
    const w = await page.evaluate(() => ({ dd: [...document.querySelectorAll('#bd-result-col .bd-facts dd')].map((d) => Math.round(d.getBoundingClientRect().width)), fig: Math.round(document.querySelector('#bd-result-col .tb-cov')?.getBoundingClientRect().width || 0) }));
    R.check('blocks/indication/ @1440 (app look): the facts beside an operation are wide enough to read and the figure is not enlarged', w.dd.length > 0 && w.dd.every((x) => x >= 240) && w.fig > 0 && w.fig <= 441, JSON.stringify(w));
    await ctx.close();
  }
  // The website look has neither button, and the menu is back in the bar.
  for (const p of ['truncal/back/', 'blocks/', 'spinal/', 'truncal/', 'blocks/safety/']) {
    const { ctx, page } = await open(p, { vp: '390', storage: { 'ra-skin': 'web' } });
    await waitReady(page, { idle: false });
    const n = await page.evaluate(() => ({ safety: document.querySelectorAll('.ra-safety').length, bsearch: document.querySelectorAll('.ra-bsearch').length, row: document.querySelectorAll('.ra-titlerow').length }));
    R.check(`${p}: the website look has no Safety button, no extra search button and no menu row`, n.safety === 0 && n.bsearch === 0 && n.row === 0, JSON.stringify(n));
    await ctx.close();
  }
  // Switching the look live adds and removes them (and puts the menu back).
  {
    const { ctx, page } = await open('truncal/back/', { vp: '390', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    const r = await page.evaluate(async () => {
      const m = await import(new URL('shared/regional/js/skin.js?v=20261018', location.origin + '/').href);
      const q = () => [document.querySelectorAll('.ra-safety').length, document.querySelectorAll('.ra-titlerow').length, document.querySelectorAll('.ra-appbar .tb-chmenu').length];
      const a = q(); m.setSkinPref('web'); const w = q(); m.setSkinPref('app'); const a2 = q();
      return { a, w, a2 };
    });
    R.check('switching the look live adds and removes the Safety button and the menu row, and puts the chapter menu back in the bar', r.a.join() === '1,1,0' && r.w.join() === '0,0,1' && r.a2.join() === '1,1,0', JSON.stringify(r));
    await ctx.close();
  }
  // The search button opens the page's own search; on a page with none it goes to /blocks/#search.
  for (const [p, want] of [['truncal/back/', (f) => f.id === 'tb-sheet-q' || f.id === 'tb-hub-q'], ['spinal/', (f) => ['sp-sheet-q', 'sp-hub-q'].includes(f.id)], ['plexus/', (f) => f.type === 'search' || /search|sheet/i.test(f.id)]]) {
    const { ctx, page } = await open(p, { vp: '390', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.waitForFunction(() => !document.body.classList.contains('spinal-app') || document.body.dataset.spReady === 'true', null, { timeout: 20000 }).catch(() => {});
    await page.locator('.ra-appbar #tb-search-open, .ra-appbar #sp-search-open, .ra-appbar .ra-bsearch').first().click();
    await page.waitForTimeout(350);
    const f = await page.evaluate(() => ({ id: document.activeElement?.id || '', type: document.activeElement?.type || '' }));
    R.check(`${p}: the bar's search button opens this page's own search`, want(f), JSON.stringify(f));
    await ctx.close();
  }
  for (const p of ['truncal/', 'brachial-plexus/', 'blocks/settings/']) {
    const { ctx, page } = await open(p, { vp: '390', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.locator('.ra-appbar .ra-bsearch').click();
    await page.waitForURL(/blocks\/#search$/, { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => ({ url: location.pathname + location.hash, focus: document.activeElement?.id, skin: document.documentElement.dataset.skin }));
    R.check(`${p}: with no search of its own, the bar's search button goes to the search box on /blocks/`, /\/blocks\/#search$/.test(r.url) && r.focus === 'bd-q' && r.skin === 'app', JSON.stringify(r));
    await ctx.close();
  }
  // Safety goes to /blocks/safety/ and opens on the emergency guides.
  {
    const { ctx, page } = await open('lower-limb/hip/', { vp: '390', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.locator('.ra-appbar a.ra-safety').click();
    await page.waitForURL(/blocks\/safety\/$/, { timeout: 8000 }).catch(() => {});
    await page.waitForFunction(() => document.body.dataset.sfReady === 'true', null, { timeout: 10000 }).catch(() => {});
    const r = await page.evaluate(() => ({ url: location.pathname, guides: !document.getElementById("guides").hidden, calc: document.getElementById('calculator').hidden, first: document.querySelector('.ra-dg-item')?.dataset.guide, aria: document.querySelector('.ra-safety')?.getAttribute('aria-current') }));
    R.check('the Safety button opens /blocks/safety/ on the emergency guides, LAST first', /\/blocks\/safety\/$/.test(r.url) && r.guides && r.calc && r.first === 'last' && r.aria === 'page', JSON.stringify(r));
    await ctx.close();
  }
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
  const PAGES_SAME = (only || ['blocks/', 'truncal/back/', 'blocks/settings/', 'spinal/', 'brachial-plexus/', 'plexus/', 'truncal/', 'lower-limb/hip/', 'upper-limb/', 'blocks/safety/', 'blocks/indication/', 'blocks/ultrasound/']);
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

// ------------------------------------------------------------------ 6. the front door is short: nothing listed twice (owner, 17 Oct 2026)
{
  for (const skin of ['app', 'web']) {
    const { ctx, page } = await open('blocks/', { vp: '390', storage: { 'ra-skin': skin } });
    await waitReady(page, { idle: false });
    const s = await page.evaluate(() => {
      const main = document.getElementById('main');
      const rows = [...main.querySelectorAll('#principles .bd-ch-link')].map((a) => a.getAttribute('href'));
      const txt = (re) => [...main.querySelectorAll('a')].filter((a) => re.test(a.textContent)).length;
      return {
        rows, nRows: main.querySelectorAll('#principles .bd-ch').length, guides: main.querySelectorAll('.ra-dg-item, #bd-wrong, #wrong').length,
        settings: [...main.querySelectorAll('a')].filter((a) => /\/settings\/?$/.test(a.getAttribute('href') || '')).length,
        chooser: txt(/which block for which operation/i), us: txt(/^\s*\d*\s*Ultrasound anatomy/i), safety: txt(/emergency guides and dose calculator/i),
        indexFolds: main.querySelectorAll('#index details').length, indexLinks: main.querySelectorAll('#index > a, #index .bd-idx-a').length, doses: main.querySelectorAll('#doses').length,
        partFolds: [...main.querySelectorAll('.bd-part[data-region]')].map((p) => p.querySelectorAll('details').length),
        last: main.querySelector('#principles a.bd-alert')?.getAttribute('href'),
      };
    });
    R.check(`blocks/ (${skin} look): Part I has four rows, each once (Safety, Indication, Ultrasound, Anatomy in 3D), no guide rows, no dose fold, no Settings row; the Index is the A to Z only; at most one "All N blocks" fold per region`,
      JSON.stringify(s.rows) === JSON.stringify(['safety/', 'indication/', 'ultrasound/', '../plexus/']) && s.nRows === 4 && s.guides === 0 && s.settings === 0 && s.chooser === 1 && s.us === 1 && s.safety === 1
        && s.indexFolds === 1 && s.indexLinks === 0 && s.doses === 0 && s.partFolds.every((n) => n <= 1) && /safety\/#wrong-last$/.test(s.last || ''), JSON.stringify(s));
    await ctx.close();
  }
  // The old front-door hashes move to the screens that hold them, hash kept (deeplinks.mjs checks the target is on screen).
  for (const h of ['#wrong', '#wrong-pneumo', '#doses']) {
    const { ctx, page } = await open(`blocks/${h}`, { vp: '390', storage: { 'ra-skin': 'app' } });
    await page.waitForURL(/blocks\/safety\//, { timeout: 8000 }).catch(() => {});
    R.check(`blocks/${h} moves to blocks/safety/${h}`, page.url().endsWith(`/blocks/safety/${h}`), page.url());
    await ctx.close();
  }
  // The bar and the tab bar are fully opaque: text scrolling under them must not show through (owner, 17 Oct 2026).
  for (const p of ['blocks/', 'truncal/back/', 'blocks/safety/']) {
    const { ctx, page } = await open(p, { vp: '390', storage: { 'ra-skin': 'app' } });
    await waitReady(page, { idle: false });
    await page.evaluate(() => scrollTo(0, 600));
    await page.waitForTimeout(500);
    const a = await page.evaluate(() => {
      const alpha = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return 0; const v = m[1].split(/[ ,/]+/).filter(Boolean); return v.length > 3 ? Number(v[3]) : 1; };
      const bar = document.querySelector('.ra-appbar');
      return { collapsed: document.documentElement.hasAttribute('data-ra-collapsed'), bar: alpha(getComputedStyle(bar, '::before').backgroundColor), barOn: getComputedStyle(bar, '::before').opacity, tab: alpha(getComputedStyle(document.querySelector('.ra-tabbar')).backgroundColor) };
    });
    R.check(`${p}: scrolled, the app bar and the tab bar are fully opaque`, a.collapsed && a.bar === 1 && Number(a.barOn) === 1 && a.tab === 1, JSON.stringify(a));
    await ctx.close();
  }
}

await browser.close();
process.exit(R.finish());
