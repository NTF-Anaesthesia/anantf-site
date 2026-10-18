#!/usr/bin/env node
// Regional anaesthesia app: offline use through /regional-sw.js, in a real browser.
//
//   node shared/regional/test/offline.e2e.mjs        options: --json=<file>  --failsOnly  (--base and --quiet are ignored)
//
// It starts its own static server on a free port (so it can switch the "network" off by stopping it, as well as
// with context.setOffline), then:
//   1. opens /blocks/ with signal: the worker registers, takes control and saves the app; the "App version" line
//      shows the saved version, read from the cache name; a block page is opened too;
//   2. a non-regional page (/index.html, /mo/guide/) is not answered by the worker;
//   3. with no signal: /blocks/, the block page and a page never opened (precached) still render after a reload, and
//      the homepage is not served from the worker (it fails, as it would with no worker);
//   4. "Not updating? Get the latest version" with no signal changes nothing; with signal it removes only the regional
//      worker and caches (the saved level, the mo/guide/ worker and its caches stay) and reloads.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, reporter, playwright } from './lib.mjs';

const R = reporter('Offline');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf',
};

/** A tiny static server on the repo root (GitHub Pages-like: folders redirect to "folder/", index.html inside). */
function makeServer() {
  return http.createServer((req, res) => {
    let p;
    try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    let f = path.join(ROOT, p);
    if (!f.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    fs.stat(f, (err, st) => {
      if (!err && st.isDirectory()) {
        if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }).end(); return; }
        f = path.join(f, 'index.html');
      }
      fs.readFile(f, (e2, buf) => {
        if (e2) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found'); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(buf);
      });
    });
  });
}
let server = makeServer();
const listen = (port = 0) => new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', () => resolve(server.address().port)); });
const stop = () => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); });

const PORT = await listen();
const BASE = `http://localhost:${PORT}/`;
const swSrc = fs.readFileSync(path.join(ROOT, 'regional-sw.js'), 'utf8');
const VERSION = swSrc.match(/const VERSION = '([^']*)'/)?.[1] || '';

const browser = await playwright().chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
await ctx.addInitScript(() => { try { if (!localStorage.getItem('ra-level-picker')) { localStorage.setItem('ra-level-picker', 'dismissed'); localStorage.setItem('ra-level', 'resident'); } } catch { /* blocked */ } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(`${page.url().replace(BASE, '/')}: ${String(e.message || e).split('\n')[0]}`));

const until = async (fn, arg, ms = 30000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    try { const v = await page.evaluate(fn, arg); if (v) return v; } catch { /* navigating */ }
    await page.waitForTimeout(250);
  }
  return null;
};
const swState = () => page.evaluate(async () => ({
  controller: navigator.serviceWorker.controller?.scriptURL || '',
  regs: (await navigator.serviceWorker.getRegistrations()).map((r) => ({ scope: r.scope, script: (r.active || r.waiting || r.installing)?.scriptURL || '' })),
  caches: await caches.keys(),
}));
const blocksReady = () => page.waitForFunction(() => document.body?.dataset.bdReady === 'true' && document.querySelectorAll('#bd-cards li').length > 0, null, { timeout: 20000 }).then(() => true).catch(() => false);
const engineReady = () => page.waitForFunction(() => document.body?.dataset.tbReady === 'true' && !!document.querySelector('.tb-chapter'), null, { timeout: 20000 }).then(() => true).catch(() => false);

try {
  // ------------------------------------------------------------------ 1. online: install
  let resp = await page.goto(BASE + 'blocks/', { waitUntil: 'load' });
  R.check('/blocks/ loads with signal', resp?.ok() && await blocksReady(), `status ${resp?.status()}`);
  const controlled = await until(() => navigator.serviceWorker.controller?.scriptURL || '');
  R.check('the regional worker registers and controls /blocks/', controlled === BASE + 'regional-sw.js', `controller: ${controlled || 'none'}`);
  const saved = await until((v) => caches.keys().then((k) => k.includes(v)), VERSION);
  R.check(`the app is saved in the cache ${VERSION}`, !!saved);
  let st = await swState();
  R.check('one registration, for /regional-sw.js with scope "/"', st.regs.length === 1 && st.regs[0].script === BASE + 'regional-sw.js' && st.regs[0].scope === BASE, JSON.stringify(st.regs));
  const m = VERSION.match(/^regional-(\d{4}-\d{2}-\d{2})-([0-9a-f]{8})$/);
  const line = await until(() => { const e = document.querySelector('#ra-appver [data-appver-line]'); return e && !e.hidden ? e.textContent.trim() : ''; });
  R.check('the foot of /blocks/ shows "App version <date> (<hash>)" from the cache name', m && line === `App version ${m[1]} (${m[2]})`, `shows: ${line || 'nothing'}`);
  const btn = await page.locator('#ra-appver [data-appver-btn]').textContent().catch(() => '');
  R.check('the foot of /blocks/ has "Not updating? Get the latest version"', btn.trim() === 'Not updating? Get the latest version', btn);

  resp = await page.goto(BASE + 'truncal/back/', { waitUntil: 'load' });
  R.check('a block page (truncal/back/) loads with signal, answered by the worker', resp?.ok() && resp.fromServiceWorker() && await engineReady(), `status ${resp?.status()}, from worker ${resp?.fromServiceWorker()}`);
  await page.waitForTimeout(500);

  // ------------------------------------------------------------------ 2. online: other pages are left alone
  resp = await page.goto(BASE + 'index.html', { waitUntil: 'load' });
  R.check('the homepage is not answered by the regional worker', resp?.ok() && !resp.fromServiceWorker(), `from worker ${resp?.fromServiceWorker()}`);
  resp = await page.goto(BASE + 'mo/guide/', { waitUntil: 'load' });
  R.check('/mo/guide/ is not answered by the regional worker', resp?.ok() && !resp.fromServiceWorker(), `from worker ${resp?.fromServiceWorker()}`);
  const moReg = await until(() => navigator.serviceWorker.getRegistrations().then((rs) => rs.some((r) => /\/mo\/guide\/$/.test(r.scope) && (r.active))));
  st = await swState();
  R.check('mo/guide/ keeps its own worker (scope /mo/guide/) beside the regional one', !!moReg && st.regs.some((r) => r.script === BASE + 'mo/guide/sw.js' && r.scope === BASE + 'mo/guide/') && st.regs.some((r) => r.script === BASE + 'regional-sw.js'), JSON.stringify(st.regs));

  // ------------------------------------------------------------------ 3. offline
  await ctx.setOffline(true);
  await stop();
  resp = await page.goto(BASE + 'blocks/', { waitUntil: 'load' }).catch((e) => ({ err: e }));
  R.check('with no signal, /blocks/ opens from the saved copy', !resp?.err && resp?.ok() && resp.fromServiceWorker() && await blocksReady(), resp?.err ? String(resp.err.message).split('\n')[0] : `status ${resp?.status()}`);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  const h1 = await page.locator('h1').first().textContent().catch(() => '');
  R.check('with no signal, /blocks/ still renders after a reload (title, region cards, contents)', h1.trim() === 'Regional blocks' && await blocksReady() && await page.locator('#bd-cards li').count() > 0, `h1 "${h1}"`);
  for (const [p, ready] of [['blocks/indication/', 'document.querySelectorAll("#bd-chips button").length > 0'], ['blocks/safety/', 'document.body.dataset.sfReady === "true" && document.querySelectorAll("details.ra-dg-item").length === 8'], ['blocks/ultrasound/', 'document.body.dataset.usReady === "true" && document.querySelectorAll(".us-row").length > 30']]) {
    resp = await page.goto(BASE + p, { waitUntil: "load" }).catch((e) => ({ err: e }));
    const ok = !resp?.err && resp?.ok() && await page.waitForFunction(ready, null, { timeout: 25000 }).then(() => true).catch(() => false);
    R.check(`with no signal, ${p} opens from the saved copy and renders`, ok, resp?.err ? String(resp.err.message).split('\n')[0] : `status ${resp?.status()}`);
  }
  resp = await page.goto(BASE + 'truncal/back/', { waitUntil: 'load' }).catch((e) => ({ err: e }));
  R.check('with no signal, the block page opens and renders its chapters', !resp?.err && resp?.ok() && await engineReady(), resp?.err ? String(resp.err.message).split('\n')[0] : `status ${resp?.status()}`);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  R.check('with no signal, the block page still renders after a reload', await engineReady());
  resp = await page.goto(BASE + 'head-neck/scalp/', { waitUntil: 'load' }).catch((e) => ({ err: e }));
  R.check('with no signal, a block page never opened before (precached) renders', !resp?.err && resp?.ok() && await engineReady(), resp?.err ? String(resp.err.message).split('\n')[0] : `status ${resp?.status()}`);
  for (const p of ['spinal/', 'lower-limb/']) {
    resp = await page.goto(BASE + p, { waitUntil: 'load' }).catch((e) => ({ err: e }));
    const ok = !resp?.err && resp?.ok() && await page.waitForFunction(() => (document.querySelector('main')?.innerText || '').length > 200, null, { timeout: 20000 }).then(() => true).catch(() => false);
    R.check(`with no signal, ${p} renders from the saved copy`, ok, resp?.err ? String(resp.err.message).split('\n')[0] : `status ${resp?.status()}`);
  }
  resp = await page.goto(BASE + 'index.html', { waitUntil: 'load' }).then((r) => r, (e) => ({ err: e }));
  R.check('with no signal, the homepage is not served by the regional worker (it fails as without a worker)', !!resp?.err || !resp?.fromServiceWorker?.(), resp?.err ? '' : `served, from worker ${resp?.fromServiceWorker?.()}`);

  // ------------------------------------------------------------------ 4. "Get the latest version"
  await page.waitForTimeout(300);
  await page.goto('about:blank');
  await page.goto(BASE + 'blocks/', { waitUntil: 'load' });
  await blocksReady();
  await page.locator('#ra-appver [data-appver-btn]').click();
  const msgText = () => document.querySelector('#ra-appver [data-appver-msg]')?.textContent || '';
  const noSignal = (await until(() => { const t = document.querySelector('#ra-appver [data-appver-msg]')?.textContent || ''; return /No signal/.test(t) ? t : ''; }, null, 15000)) || await page.evaluate(msgText);
  st = await swState();
  R.check('"Get the latest version" with no signal says so and changes nothing', /No signal: nothing was changed/.test(noSignal || '') && st.regs.some((r) => r.script === BASE + 'regional-sw.js') && st.caches.includes(VERSION), `message "${noSignal}", ${JSON.stringify(st)}`);

  server = makeServer();
  await listen(PORT);
  await ctx.setOffline(false);
  const levelBefore = await page.evaluate(() => localStorage.getItem('ra-level'));
  const moCachesBefore = st.caches.filter((k) => k.startsWith('mo-'));
  // Markers: one in the regional cache (must go) and one in a cache of another app (must stay).
  await page.evaluate(async (v) => {
    await (await caches.open(v)).put('/__regional_marker__', new Response('x'));
    await (await caches.open('other-app-test')).put('/__other_marker__', new Response('x'));
  }, VERSION);
  await Promise.all([page.waitForEvent('load', { timeout: 20000 }).catch(() => null), page.locator('#ra-appver [data-appver-btn]').click()]);
  await blocksReady();
  const after = await swState();
  const levelAfter = await page.evaluate(() => localStorage.getItem('ra-level'));
  const markers = await page.evaluate(async (v) => ({
    regional: !!(await (await caches.open(v)).match('/__regional_marker__')),
    other: !!(await (await caches.open('other-app-test')).match('/__other_marker__')),
  }), VERSION);
  R.check('with signal, it removes the regional caches and reloads', !markers.regional, JSON.stringify(markers));
  R.check('…and keeps another app\'s cache', markers.other, JSON.stringify(markers));
  R.check('…and keeps the saved level, the mo/guide/ worker and the mo- caches', levelAfter === levelBefore && levelAfter === 'resident' && after.regs.some((r) => r.script === BASE + 'mo/guide/sw.js') && moCachesBefore.every((k) => after.caches.includes(k)) && moCachesBefore.length > 0,
    `level ${levelBefore} → ${levelAfter}; mo caches ${moCachesBefore.join(',')} → ${after.caches.join(',')}`);
  const back = await until(() => navigator.serviceWorker.controller?.scriptURL || '');
  R.check('…and the regional worker registers again afterwards', back === BASE + 'regional-sw.js', `controller ${back}`);

  R.check('no page errors on the way', !pageErrors.length, [...new Set(pageErrors)].join('\n'));
} catch (err) {
  R.fail('offline run', String(err?.stack || err));
} finally {
  await browser.close().catch(() => {});
  await stop().catch(() => {});
}
process.exit(R.finish());
