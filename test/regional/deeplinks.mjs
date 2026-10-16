#!/usr/bin/env node
// Regional anaesthesia app: every old URL and hash still lands on the right visible element (plan §3 "URLs", §11.2).
//
//   node test/regional/deeplinks.mjs              all checks (fresh page load per deep link, phone viewport)
//   options: --viewports=390,1440 (default 390)   --workers=6   --pages=truncal/back/,…   --quick (hashchange instead of
//            a fresh load for step / injection links)   --json=<file>   --failsOnly
//
// Checks:
//   1. engine pages: every #ch-* chapter (from the WP0 baseline and the live page), every #<block>-step-<key> and
//      #<block>-inj-<id>: the chapter is shown, the target (or its data-scroll-to element) is visible, on screen and
//      not under the sticky bar; step buttons become the current step, injection buttons become pressed;
//   2. #op-<id> on the three landings selects that operation and brings the result into view;
//   3. every same-site link with a hash on any regional page points at an id that exists on its target page;
//   4. brachial #block=…&el=…&tab=…, plexus #plexus=…&block=…&el=…;
//   5. the spinal anchors used by mo/ (and any other spinal/#… link in the repo);
//   6. /ra.html, /draft-ra.html, /popliteal.html redirect where they should;
//   7. every old shim (/truncal/shared/js/*.js, truncal.css, head-neck/shared/js/head.js, lower-limb/shared/js/leg.js)
//      returns 200 and re-exports exactly what its target exports;
//   8. edit.html?page=/<page>/ loads each regional page in its frame without errors.

import fs from 'node:fs';
import path from 'node:path';
import {
  args, BASE, BASEDIR, ROOT, ENGINE_PAGES, LANDINGS, PAGES, listArg, slug, launch, openContext, waitReady, pool, reporter, readJson, walk,
} from './lib.mjs';

const VPS = listArg('viewports', ['390']);
const ONLY = listArg('pages', null);
const want = (p) => !ONLY || ONLY.includes(p);
const R = reporter('Deep links');
const STEP_KEYS = ['scan', 'identify', 'needle', 'inject'];

// ------------------------------------------------------------------ in-page landing check
/** Runs in the page: is element `id` (or what it scrolls to) shown, on screen and clear of the sticky bar? */
function landedFn(id) {
  const el = document.getElementById(id);
  if (!el) return { ok: false, why: 'no element with this id' };
  const vis = (n) => !!n && n.getClientRects().length > 0 && !n.closest('[hidden]') && getComputedStyle(n).visibility !== 'hidden';
  const ch = el.closest('.tb-chapter, .sp-chapter');
  if (ch && !vis(ch)) return { ok: false, why: `its chapter #${ch.id} is not shown` };
  const tgt = (el.dataset.scrollTo && document.getElementById(el.dataset.scrollTo)) || el;
  if (!vis(el)) return { ok: false, why: 'element is not visible (hidden, collapsed or level-hidden)' };
  // A chapter link lands on the chapter: its first heading must be on screen.
  const probe = /^ch-/.test(id) ? (el.querySelector('h1, h2') || el) : tgt;
  const r = probe.getBoundingClientRect();
  // Bottom of whatever is stuck to the top of the screen (the app bar), excluding the target's own ancestors.
  const barBottom = Math.max(0, ...[...document.querySelectorAll('body *')].filter((n) => { const p = getComputedStyle(n).position; if (p !== 'sticky' && p !== 'fixed') return false; const b = n.getBoundingClientRect(); return b.height > 0 && b.top <= 1 && b.top > -2 && b.bottom < innerHeight * 0.5 && !n.contains(probe) && !n.closest('[hidden]'); }).map((n) => n.getBoundingClientRect().bottom));
  const maxScroll = document.documentElement.scrollHeight - innerHeight;
  const atBottom = scrollY >= maxScroll - 2;
  if (r.bottom <= barBottom + 4) return { ok: false, why: `target is above the screen or under the sticky bar (top ${Math.round(r.top)}, bar ${Math.round(barBottom)})` };
  if (r.top >= innerHeight - 20) return { ok: false, why: `target is below the screen (top ${Math.round(r.top)}, viewport ${innerHeight}, scrollY ${Math.round(scrollY)})` };
  if (r.top < barBottom - 4 && !atBottom && r.height < innerHeight - barBottom) return { ok: false, why: `target top is hidden under the sticky bar (top ${Math.round(r.top)}, bar ${Math.round(barBottom)})` };
  const m = id.match(/-step-(scan|identify|needle|inject)$/);
  if (m && el.getAttribute('aria-current') !== 'step') return { ok: false, why: 'step button is not the current step' };
  if (/-inj-/.test(id) && el.matches('button') && el.getAttribute('aria-pressed') !== 'true') return { ok: false, why: 'injection button is not pressed' };
  return { ok: true, top: Math.round(r.top) };
}

async function landing(browser, url, id, vp) {
  const { ctx, page, log } = await openContext(browser, { vp });
  try {
    const resp = await page.goto(BASE + url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    if (resp && resp.status() >= 400) return { ok: false, why: `HTTP ${resp.status()}` };
    await waitReady(page, { idle: false });
    await page.waitForTimeout(500);
    let res = await page.evaluate(landedFn, id);
    if (!res.ok) { await page.waitForTimeout(1200); res = await page.evaluate(landedFn, id); }
    const errs = [...log.pageErrors, ...log.console];
    if (errs.length) res = { ok: false, why: `${res.ok ? '' : `${res.why}; `}errors: ${errs.slice(0, 2).join(' | ')}` };
    return res;
  } finally { await ctx.close(); }
}

// ------------------------------------------------------------------ harvest ids and links from each page
async function harvest(browser, p) {
  const { ctx, page } = await openContext(browser, { vp: '1440' });
  try {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitReady(page);
    return await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((e) => e.id);
      const links = [...document.querySelectorAll('a[href*="#"]')].map((a) => a.href).filter((h) => h.startsWith(location.origin));
      const ops = [...document.querySelectorAll('input[type=radio][value], [data-op]')].map((i) => i.value || i.dataset.op).filter(Boolean);
      const scans = [...document.querySelectorAll('.tb-scan[id]')].map((e) => e.id);
      return { ids, links: [...new Set(links)], ops: [...new Set(ops)], scans };
    });
  } finally { await ctx.close(); }
}

async function main() {
  const browser = await launch();
  const t0 = Date.now();

  // 1. Harvest every regional page once.
  const harvestPages = PAGES.filter((p) => !p.endsWith('.html'));
  const H = {};
  const hv = await pool(harvestPages, 6, (p) => harvest(browser, p), (p) => `harvest ${p}`);
  harvestPages.forEach((p, i) => { H[p] = hv[i]; });

  // 2. Engine deep links: chapters (baseline ∪ live), steps, injections.
  const jobs = [];
  for (const p of ENGINE_PAGES.filter(want)) {
    const base = readJson(path.join(BASEDIR, `${slug(p)}.json`), {});
    const bv = base.viewports?.['390'] || base.viewports?.['1440'] || {};
    const live = H[p]?.ids || [];
    const chapters = new Set([...Object.keys(bv.text || {}).filter((k) => k.startsWith('ch-')), ...live.filter((i) => /^ch-[\w-]+$/.test(i) && !/-h$/.test(i))]);
    chapters.delete('ch-refs'); // engine pages: the removed References chapter lands on the hub (checked below)
    const scans = new Set([...Object.keys(bv.scans || {}), ...(H[p]?.scans || [])].map((s) => s.replace(/-scan$/, '')));
    const steps = [...scans].flatMap((b) => STEP_KEYS.map((k) => `${b}-step-${k}`));
    const injs = live.filter((i) => /-inj-[\w-]+$/.test(i));
    for (const id of chapters) jobs.push({ p, id, kind: 'chapter' });
    for (const id of steps) jobs.push({ p, id, kind: 'step' });
    for (const id of injs) jobs.push({ p, id, kind: 'injection' });
    // Steps the live page lacks entirely are a broken old link.
    for (const id of steps) if (!live.includes(id) && live.length) R.fail(`${p}#${id}`, 'old step link: no such step button on the page (scan removed or renamed?)');
  }
  const runnable = jobs.filter((j) => (H[j.p]?.ids || []).includes(j.id) || j.kind === 'chapter');
  for (const vp of VPS) {
    const res = await pool(runnable, Number(args.workers || 6), async (j) => {
      if (args.quick && j.kind !== 'chapter') return quickLanding(browser, j, vp);
      return landing(browser, `${j.p}#${j.id}`, j.id, vp);
    }, (j) => `${j.p}#${j.id} @${vp}`);
    runnable.forEach((j, i) => R.check(`${j.kind} ${j.p}#${j.id} @${vp}`, res[i]?.ok, res[i]?.why || res[i]?.error));
  }

  // Old #ch-refs / #ref-… links on engine pages land on the hub without errors.
  if (want('truncal/back/')) {
    const r = await landing(browser, 'truncal/back/#ch-refs', 'ch-home', '390');
    R.check('removed References chapter: truncal/back/#ch-refs lands on the hub', r.ok, r.why);
  }

  // 3. #op-<id> on the landings.
  for (const p of LANDINGS.filter(want)) {
    const ops = H[p]?.ops || [];
    R.check(`${p}: chooser lists operations`, ops.length > 0, 'no operation radios found');
    const res = await pool(ops, Number(args.workers || 6), (op) => opLanding(browser, p, op, VPS[0]), (op) => `${p}#op-${op}`);
    ops.forEach((op, i) => R.check(`operation ${p}#op-${op}`, res[i]?.ok, res[i]?.why || res[i]?.error));
  }

  // 4. Every same-site link with a hash on a regional page resolves to an id on its target page.
  const idCache = new Map(Object.entries(H).map(([p, h]) => [p, new Set(h.ids)]));
  const linkJobs = [];
  for (const [p, h] of Object.entries(H)) {
    for (const href of h.links || []) {
      const u = new URL(href);
      let target = u.pathname.replace(/^\//, '').replace(/index\.html$/, '');
      const hash = decodeURIComponent(u.hash.slice(1));
      if (!hash || hash.includes('=')) continue; // app state hashes (brachial, plexus) are checked below
      if (/^(main|top|content)$/.test(hash)) continue;
      linkJobs.push({ from: p, target, hash, href: href.replace(BASE, '/') });
    }
  }
  const needPages = [...new Set(linkJobs.map((j) => j.target))].filter((t) => !idCache.has(t));
  const extra = await pool(needPages, 6, async (t) => { try { return await harvest(browser, t); } catch (e) { return { ids: [], error: String(e) }; } }, (t) => `harvest ${t}`);
  needPages.forEach((t, i) => idCache.set(t, new Set(extra[i]?.ids || [])));
  const seenLinks = new Set();
  for (const j of linkJobs) {
    const key = `${j.target}#${j.hash}`;
    if (seenLinks.has(key)) continue;
    seenLinks.add(key);
    const ids = idCache.get(j.target);
    const ok = ids?.has(j.hash) || (j.hash.startsWith('op-') && LANDINGS.includes(j.target) && (H[j.target]?.ops || []).includes(j.hash.slice(3))) || (j.hash === 'ch-home');
    R.check(`link ${j.href} (on ${j.from})`, ok, `no element #${j.hash} on /${j.target}`);
  }

  // 5. Brachial plexus and plexus app hashes.
  if (want('brachial-plexus/')) {
    for (const [hash, expect] of [
      ['block=axillary&el=n-musculocutaneous&tab=ultrasound', { block: 'axillary', el: 'n-musculocutaneous', tab: 'ultrasound' }],
      ['block=axillary&el=n-musculocutaneous&tab=us', { block: 'axillary', el: 'n-musculocutaneous' }],
      ['block=interscalene&tab=coverage', { block: 'interscalene', tab: 'coverage' }],
      ['block=supraclavicular&tab=guide', { block: 'supraclavicular', tab: 'guide' }],
      ['block=costoclavicular', { block: 'costoclavicular' }],
      ['el=n-radial', { el: 'n-radial' }],
    ]) {
      const r = await brachial(browser, hash, expect);
      R.check(`brachial-plexus/#${hash}`, r.ok, r.why);
    }
  }
  if (want('plexus/')) {
    for (const [hash, expect] of [
      ['plexus=lumbar&block=peng', { plexus: 'lumbar', block: 'peng' }],
      ['plexus=lumbar&block=sifi', { plexus: 'lumbar', block: 'sifi' }],
      ['plexus=sacral', { plexus: 'sacral' }],
      ['plexus=cervical', { plexus: 'cervical' }],
      ['plexus=lumbar&el=n-femoral', { plexus: 'lumbar', el: 'n-femoral' }],
    ]) {
      const r = await plexus(browser, hash, expect);
      R.check(`plexus/#${hash}`, r.ok, r.why);
    }
  }

  // 6. Spinal anchors used by mo/ and anywhere else in the repo.
  if (want('spinal/')) {
    const anchors = new Set(['tq-anticoag']);
    for (const f of walk(['mo', 'babymo', 'truncal', 'head-neck', 'lower-limb', 'upper-limb', 'brachial-plexus', 'plexus', 'shared', 'blocks'], ['.js', '.mjs', '.html', '.json', '.md'])) {
      const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
      for (const m of src.matchAll(/spinal\/(?:index\.html)?#([\w-]+)/g)) anchors.add(m[1]);
    }
    const sp = [...anchors].sort();
    const res = await pool(sp, Number(args.workers || 6), (a) => landing(browser, `spinal/#${a}`, a, VPS[0]), (a) => `spinal/#${a}`);
    sp.forEach((a, i) => R.check(`spinal anchor spinal/#${a}`, res[i]?.ok, res[i]?.why || res[i]?.error));
    // Spinal chapters from the baseline.
    const bv = readJson(path.join(BASEDIR, 'spinal.json'), {}).viewports?.['390'] || {};
    const chs = Object.keys(bv.text || {}).filter((k) => k.startsWith('ch-'));
    const rc = await pool(chs, Number(args.workers || 6), (a) => landing(browser, `spinal/#${a}`, a, VPS[0]), (a) => `spinal/#${a}`);
    chs.forEach((a, i) => R.check(`spinal chapter spinal/#${a}`, rc[i]?.ok, rc[i]?.why || rc[i]?.error));
  }

  // 7. Redirects.
  for (const [from, to] of [['ra.html', /\/lower-limb\/foot-ankle\/#ch-popliteal$/], ['draft-ra.html', /\/lower-limb\/$/], ['popliteal.html', /\/popliteal\/$/], ['popliteal.html#x', /\/popliteal\/#x$/]]) {
    const { ctx, page, log } = await openContext(browser, { vp: '390' });
    try {
      await page.goto(BASE + from, { waitUntil: 'load', timeout: 30000 });
      await page.waitForURL(to, { timeout: 8000 }).catch(() => {});
      await waitReady(page, { idle: false });
      const ok = to.test(page.url()) && !log.bad.length && !log.pageErrors.length;
      R.check(`redirect /${from} → ${to.source.replace(/\\/g, '')}`, ok, `ended at ${page.url().replace(BASE, '/')}; ${[...log.bad, ...log.pageErrors].join(', ')}`);
      if (from === 'ra.html') { const l = await page.evaluate(landedFn, 'ch-popliteal'); R.check('redirect /ra.html lands on the popliteal chapter', l.ok, l.why); }
    } finally { await ctx.close(); }
  }

  // 8. Shims: 200 + same exports as the module they point at.
  const shimDir = path.join(ROOT, 'truncal/shared/js');
  const shims = fs.existsSync(shimDir) ? fs.readdirSync(shimDir).filter((f) => f.endsWith('.js')).map((f) => [`truncal/shared/js/${f}`, `shared/regional/js/${f}`]) : [];
  // head.js is imported with ?v= everywhere (head-neck pages, scan.js, ops-headneck.js): compare with that instance.
  shims.push(['head-neck/shared/js/head.js', 'shared/regional/js/figures/head.js?v=20261015'], ['lower-limb/shared/js/leg.js', 'shared/regional/js/figures/leg.js']);
  {
    const { ctx, page } = await openContext(browser, { vp: '1440' });
    try {
      await page.goto(`${BASE}test/regional/harness.html`, { waitUntil: 'load' });
      for (const [shim, real] of shims) {
        const r = await page.evaluate(async ([a, b]) => {
          const ra = await fetch(`/${a}`); if (!ra.ok) return { ok: false, why: `HTTP ${ra.status}` };
          try {
            const [ma, mb] = await Promise.all([import(`/${a}`), import(`/${b}`)]);
            const ka = Object.keys(ma).sort().join(','); const kb = Object.keys(mb).sort().join(',');
            if (ka !== kb) return { ok: false, why: `exports differ: shim [${ka}] vs [${kb}]` };
            const types = Object.keys(ma).every((k) => typeof ma[k] === typeof mb[k]);
            const same = Object.keys(ma).every((k) => ma[k] === mb[k]);
            return types ? { ok: true, note: same ? '' : 'same exports, but from a second module instance (the shim imports a different URL, e.g. without ?v=)' } : { ok: false, why: 'export types differ' };
          } catch (e) { return { ok: false, why: String(e.message || e) }; }
        }, [shim, real]);
        R.check(`shim /${shim} re-exports /${real}`, r.ok, r.why);
        if (r.ok && r.note) R.warn(`shim /${shim}`, r.note);
      }
      const css = await page.evaluate(async () => { const r = await fetch('/truncal/shared/css/truncal.css'); return { s: r.status, t: await r.text() }; });
      R.check('shim /truncal/shared/css/truncal.css imports regional.css', css.s === 200 && /@import\s+url\(["']?[./]*shared\/regional\/css\/regional\.css/.test(css.t), `HTTP ${css.s}: ${css.t.slice(0, 120)}`);
    } finally { await ctx.close(); }
  }

  // 9. edit.html?page=… loads every regional page.
  const editPages = PAGES.filter(want);
  const er = await pool(editPages, 4, async (p) => {
    const { ctx, page, log } = await openContext(browser, { vp: '1440' });
    try {
      await page.goto(`${BASE}edit.html?page=${encodeURIComponent(`/${p}`)}`, { waitUntil: 'load', timeout: 30000 });
      const frame = page.frameLocator('#frame');
      await page.waitForFunction(() => { try { const d = document.getElementById('frame').contentDocument; return d && d.readyState === 'complete' && d.body && d.body.innerText.length > 200; } catch { return false; } }, null, { timeout: 30000 });
      await page.waitForTimeout(1500);
      void frame;
      const info = await page.evaluate(() => { const d = document.getElementById('frame').contentDocument; return { path: d.location.pathname, hint: document.getElementById('hint')?.textContent || '', ready: d.body.dataset.tbReady || '' }; });
      const errs = [...log.pageErrors, ...log.console, ...log.bad];
      const ok = info.path === `/${p}` && !/outside anantf|can’t be edited/.test(info.hint) && !errs.length;
      return { ok, why: `frame at ${info.path}; hint "${info.hint.slice(0, 80)}"; ${errs.slice(0, 3).join(' | ')}` };
    } finally { await ctx.close(); }
  }, (p) => `edit.html?page=/${p}`);
  editPages.forEach((p, i) => R.check(`edit.html?page=/${p}`, er[i]?.ok, er[i]?.why || er[i]?.error));

  await browser.close();
  console.error(`  done in ${Math.round((Date.now() - t0) / 1000)} s`);
  return R.finish();
}

// ------------------------------------------------------------------ app-specific checks
async function quickLanding(browser, j, vp) {
  // Same-document navigation (hashchange) instead of a fresh load.
  const { ctx, page } = await openContext(browser, { vp });
  try {
    await page.goto(BASE + j.p, { waitUntil: 'domcontentloaded' });
    await waitReady(page, { idle: false });
    await page.evaluate((id) => { location.hash = id; }, j.id);
    await page.waitForTimeout(600);
    return await page.evaluate(landedFn, j.id);
  } finally { await ctx.close(); }
}

async function opLanding(browser, p, op, vp) {
  const { ctx, page, log } = await openContext(browser, { vp });
  try {
    await page.goto(`${BASE}${p}#op-${op}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitReady(page, { idle: false });
    await page.waitForTimeout(500);
    const r = await page.evaluate((op) => {
      const input = document.querySelector(`input[type=radio][value="${CSS.escape(op)}"]`);
      if (!input) return { ok: false, why: 'no radio for this operation' };
      if (!input.checked) return { ok: false, why: 'operation not selected' };
      const label = (input.closest('label')?.innerText || '').trim().replace(/\s+/g, ' ');
      const t = document.getElementById('tb-res-title') || document.querySelector('[id$="res-title"], .tb-res h2, .tb-res h3');
      if (!t) return { ok: false, why: 'no result title' };
      const title = t.innerText.trim().replace(/\s+/g, ' ');
      const rr = t.getBoundingClientRect();
      if (rr.top < -2 || rr.top > innerHeight - 40) return { ok: false, why: `result title off screen (top ${Math.round(rr.top)})` };
      const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (label && !norm(title).includes(norm(label).slice(0, 20)) && !norm(label).includes(norm(title).slice(0, 20))) return { ok: false, why: `result "${title}" does not match "${label}"` };
      return { ok: true };
    }, op);
    if (log.pageErrors.length || log.console.length) return { ok: false, why: `${r.why || ''} errors: ${[...log.pageErrors, ...log.console].slice(0, 2).join(' | ')}` };
    return r;
  } finally { await ctx.close(); }
}

async function brachial(browser, hash, expect) {
  const { ctx, page, log } = await openContext(browser, { vp: VPS[0] });
  try {
    await page.goto(`${BASE}brachial-plexus/#${hash}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitReady(page);
    await page.waitForTimeout(800);
    const s = await page.evaluate(() => {
      const pressed = document.querySelector('#block-chips [data-block][aria-pressed="true"], #block-chips [data-block][aria-checked="true"], #block-chips [data-block].is-active');
      const tab = document.querySelector('[id^="tab-"][aria-selected="true"]');
      const h = new URLSearchParams(location.hash.slice(1));
      const band = document.querySelector('#sec-diagram [data-band].is-active, #sec-diagram .is-band-active, #sec-diagram [data-block-band][aria-current]');
      return { block: pressed?.dataset.block || h.get('block') || null, chip: pressed?.dataset.block ?? null, tab: tab?.id?.replace(/^tab-/, '') || null, el: h.get('el'), hash: location.hash, band: !!band };
    });
    const why = [];
    if (expect.block && s.chip !== expect.block) why.push(`block chip pressed: ${s.chip}`);
    if (expect.tab && s.tab !== expect.tab) why.push(`tab selected: ${s.tab}`);
    if (expect.el && s.el !== expect.el) why.push(`selected element in URL: ${s.el} (hash now ${s.hash})`);
    const errs = [...log.pageErrors, ...log.console];
    if (errs.length) why.push(`errors: ${errs.slice(0, 2).join(' | ')}`);
    return { ok: !why.length, why: why.join('; ') };
  } finally { await ctx.close(); }
}

async function plexus(browser, hash, expect) {
  const { ctx, page, log } = await openContext(browser, { vp: VPS[0] });
  try {
    await page.goto(`${BASE}plexus/#${hash}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitReady(page);
    await page.waitForTimeout(800);
    const s = await page.evaluate(() => {
      const h = new URLSearchParams(location.hash.slice(1));
      const blk = document.querySelector('button[data-block][aria-pressed="true"]');
      const info = document.getElementById('sec-info')?.innerText || '';
      return { plexus: h.get('plexus'), block: blk?.dataset.block ?? h.get('block'), el: h.get('el'), info: info.slice(0, 200) };
    });
    const why = [];
    for (const k of Object.keys(expect)) if (s[k] !== expect[k]) why.push(`${k}: ${s[k]}`);
    const errs = [...log.pageErrors, ...log.console];
    if (errs.length) why.push(`errors: ${errs.slice(0, 2).join(' | ')}`);
    return { ok: !why.length, why: why.join('; ') };
  } finally { await ctx.close(); }
}

main().then((code) => process.exit(code), (err) => { console.error(err); process.exit(2); });
