// Browser test of the installable part: manifest and icons, the service worker's first install (no reload), offline start
// (the app's own files and the shared site files), "Get the latest version", a broken release, and the update rules (a new
// version takes over by itself but the page never reloads mid-scenario or with half-typed text).
// Run from anywhere: node mo/guide/test/pwa.e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = new URL('../../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
let swVersion = null, swExtra = '', swDown = false;
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  const f = path.join(root, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  if (swDown && rel === 'mo/guide/sw.js') return req.socket.destroy();
  let body = fs.readFileSync(f);
  if (rel === 'mo/guide/sw.js' && (swVersion || swExtra)) {
    let t = body.toString('utf8');
    if (swVersion) t = t.replace(/const VERSION = '[^']*';/, `const VERSION = '${swVersion}';`);
    if (swExtra) t = t.replace('const SHELL = [', `const SHELL = ['${swExtra}', `);
    body = Buffer.from(t);
  }
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/mo/guide/`;
const { SCENARIOS } = await import('../js/data/scenarios.js');

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; throw e; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const versions = () => page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('mo-')).sort());
const update = () => page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
const activeVersion = async v => { await page.waitForFunction(async v => { const r = await navigator.serviceWorker.getRegistration(); return r?.active && (await caches.keys()).includes(v) && !(await caches.keys()).some(k => k.startsWith('mo-') && k !== v); }, v, { timeout: 15000 }); };
const ready = () => page.waitForSelector('body[data-ready]');
const sw = () => fs.readFileSync(path.join(root, 'mo/guide/sw.js'), 'utf8');
const list = name => [...sw().match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'([^']+)'/g)].map(m => m[1]);

try {
  await step('manifest and icons are valid', async () => {
    const m = await (await fetch(BASE + 'manifest.webmanifest')).json();
    assert.equal(m.display, 'standalone'); assert.equal(m.start_url, './'); assert.equal(m.scope, './'); assert.ok(m.name && m.short_name);
    assert.ok(m.icons.some(i => i.sizes === '192x192') && m.icons.some(i => i.sizes === '512x512') && m.icons.some(i => i.purpose === 'maskable'));
    for (const i of m.icons) {
      const r = await fetch(BASE + i.src); assert.equal(r.status, 200, i.src); assert.equal(r.headers.get('content-type'), 'image/png');
      const buf = Buffer.from(await r.arrayBuffer()); assert.equal(`${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`, i.sizes, i.src + ' size');
    }
    const html = await (await fetch(BASE)).text();
    assert.match(html, /rel="manifest"/); assert.match(html, /apple-touch-icon/); assert.match(html, /noindex/);
  });
  const SW0 = sw().match(/const VERSION = '([^']*)'/)[1];
  await step('first visit: the worker installs and takes over without reloading the page', async () => {
    await page.goto(BASE); await ready();
    await page.evaluate(() => { window.__marker = 1; });
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 1, 'the page reloaded on first install');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('every app file and shared site file is in the one version cache', async () => {
    const urls = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => new URL(r.url).pathname), SW0);
    for (const f of list('SHELL')) assert.ok(urls.includes('/mo/guide/' + (f === './' ? '' : f)), 'not cached: ' + f);
    const hrefs = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => r.url), SW0);
    for (const f of list('SITE')) assert.ok(hrefs.includes(new URL(f, BASE).href), 'not cached: ' + f);
  });
  await step('start page shows the app version and "Get the latest version"', async () => {
    const [, d, h] = SW0.match(/^mo-(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    await page.reload(); await page.locator('#appver:not([hidden])').waitFor();
    assert.equal(await page.textContent('#appver'), `App version ${d} (${h})`);
    assert.equal(await page.textContent('#getlatest'), 'Not updating? Get the latest version');
    await page.goto(BASE + '#/about'); await page.locator('#appver:not([hidden])').waitFor();
  });
  await step('offline: the guide opens from the cache with the app kit styled and the fonts loaded', async () => {
    await page.goto(BASE); await ready();
    await ctx.setOffline(true);
    const failed = []; const onFail = r => failed.push(r.url()); page.on('requestfailed', onFail);
    await page.reload(); await ready();
    await page.goto(BASE + '#/drugs'); await page.waitForSelector('#drug-list');
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.app-tabbar')).position), 'fixed', 'app kit styles missing offline');
    assert.ok(await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('16px "NTF Sans"'); }), 'font missing offline');
    page.off('requestfailed', onFail);
    assert.deepEqual(failed.filter(u => u.startsWith('http://localhost') || u.startsWith('https://design.anantf.com/')), [], 'files that failed to load offline');
    await ctx.setOffline(false);
  });
  await step('"Get the latest version" with no signal changes nothing', async () => {
    await page.goto(BASE); await ready(); await page.locator('#appver:not([hidden])').waitFor();
    swDown = true; await page.evaluate(() => { window.__marker = 6; });
    await page.click('#getlatest');
    await page.waitForFunction(() => /No signal/.test(document.querySelector('#appver-msg')?.textContent));
    swDown = false;
    assert.equal(await page.evaluate(() => window.__marker), 6, 'the page reloaded');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('"Get the latest version" with a signal clears only mo- caches and keeps progress', async () => {
    await page.evaluate(async () => { localStorage.setItem('mo-keep', 'yes'); await caches.open('mo-old'); await caches.open('other-app'); window.__marker = 5; });
    await page.click('#getlatest');
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
    await ready();
    const keys = await page.evaluate(() => caches.keys());
    assert.ok(!keys.includes('mo-old'), 'old mo- cache kept'); assert.ok(keys.includes('other-app'), "another app's cache was deleted");
    assert.equal(await page.evaluate(() => localStorage.getItem('mo-keep')), 'yes');
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await activeVersion(SW0);
    await page.evaluate(async () => { localStorage.removeItem('mo-keep'); await caches.delete('other-app'); });
  });
  await step('a broken release (a file missing) leaves the working version in place', async () => {
    swVersion = 'mo-broken'; swExtra = 'js/does-not-exist.js';
    await update(); await sleep(2000);
    swVersion = null; swExtra = '';
    assert.ok((await versions()).includes(SW0), 'working cache was removed');
    await ctx.setOffline(true); await page.reload(); await ready(); await ctx.setOffline(false);
  });
  await step('an update never reloads the page with a calculator half filled', async () => {
    await page.goto(BASE + '#/tools/fluids'); await ready();
    await page.fill('form.tool input[type=number] >> nth=0', '70');
    await page.evaluate(() => { window.__marker = 2; });
    swVersion = 'mo-update1'; await update(); await activeVersion('mo-update1'); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded with a half-filled form');
    assert.equal(await page.inputValue('form.tool input[type=number] >> nth=0'), '70');
  });
  await step('an update never reloads the page with boxes ticked in a score', async () => {
    await page.goto(BASE + '#/tools/stopbang'); await ready();
    await page.locator('form.tool label.app-row').first().click();
    await page.evaluate(() => { window.__marker = 7; });
    swVersion = 'mo-update1b'; await update(); await activeVersion('mo-update1b'); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 7, 'reloaded with boxes ticked');
  });
  await step('...and applies when the person moves on', async () => {
    await page.evaluate(() => { location.hash = '#/learn'; });
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
    await ready();
  });
  if (SCENARIOS[0]) await step('an update never reloads mid-scenario', async () => {
    await page.goto(BASE + `#/practice/scenario/${SCENARIOS[0].id}`); await ready();
    await page.evaluate(() => { window.__marker = 3; });
    swVersion = 'mo-update2'; await update(); await activeVersion('mo-update2'); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 3, 'reloaded mid-scenario');
    await page.evaluate(() => { location.hash = '#/'; });
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
  });
  await step('an update found while idle reloads by itself', async () => {
    await page.goto(BASE + '#/learn'); await ready(); await page.evaluate(() => { window.__marker = 4; });
    swVersion = 'mo-update3'; await update(); await activeVersion('mo-update3');
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
    assert.deepEqual(await versions(), ['mo-update3']);
  });
  assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
  console.log('mo pwa e2e: all steps ok');
} catch { /* reported */ } finally { await b.close(); server.close(); }
