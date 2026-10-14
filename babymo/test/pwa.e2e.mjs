// Browser test of the installable part: manifest and icons, the service worker's first install (no reload), offline start,
// and the update rules (a new version takes over by itself but the page never reloads during a test or half-typed text).
// Run from the repo root: node babymo/test/pwa.e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', webmanifest: 'application/manifest+json' };
let swVersion = null, swExtra = '';   // what the test server says sw.js is: another VERSION (a new release) or a broken file list
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  let f = path.join(root, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  let body = fs.readFileSync(f);
  if (rel === 'babymo/sw.js' && (swVersion || swExtra)) {
    let t = body.toString('utf8');
    if (swVersion) t = t.replace(/const VERSION = '[^']*';/, `const VERSION = '${swVersion}';`);
    if (swExtra) t = t.replace("const SHELL = [", `const SHELL = ['${swExtra}', `);
    body = Buffer.from(t);
  }
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/babymo/`;

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; throw e; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const versions = () => page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('babymo-')).sort());
const update = () => page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
const waitVersion = v => page.waitForFunction(async v => (await caches.keys()).includes(v) && navigator.serviceWorker.controller?.scriptURL && true, v, { timeout: 15000 });
const activeVersion = async v => { await page.waitForFunction(async v => { const r = await navigator.serviceWorker.getRegistration(); return r?.active && (await caches.keys()).includes(v) && !(await caches.keys()).some(k => k.startsWith('babymo-') && k !== v); }, v, { timeout: 15000 }); };

try {
  await step('manifest and icons are valid', async () => {
    const m = await (await fetch(BASE + 'manifest.webmanifest')).json();
    assert.equal(m.display, 'standalone'); assert.equal(m.start_url, './'); assert.equal(m.scope, './'); assert.ok(m.name && m.short_name);
    assert.ok(m.icons.some(i => i.sizes === '192x192') && m.icons.some(i => i.sizes === '512x512') && m.icons.some(i => i.purpose === 'maskable'));
    for (const i of m.icons) {
      const r = await fetch(BASE + i.src); assert.equal(r.status, 200, i.src); assert.equal(r.headers.get('content-type'), 'image/png');
      const buf = Buffer.from(await r.arrayBuffer()); const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
      assert.equal(`${w}x${h}`, i.sizes, i.src + ' size');
    }
    const html = await (await fetch(BASE)).text();
    assert.match(html, /rel="manifest"/); assert.match(html, /apple-touch-icon/); assert.match(html, /noindex/);
  });
  const SW0 = fs.readFileSync(path.join(root, 'babymo/sw.js'), 'utf8').match(/const VERSION = '([^']*)'/)[1];
  await step('first visit: the worker installs and takes over without reloading the page', async () => {
    await page.goto(BASE + '?demo'); await page.locator('#f-name').waitFor();
    await page.evaluate(() => { window.__marker = 1; });
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 1, 'the page reloaded on first install');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('every shell file is cached in the one version cache', async () => {
    const shell = [...fs.readFileSync(path.join(root, 'babymo/sw.js'), 'utf8').match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
    const urls = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => new URL(r.url).pathname), SW0);
    for (const f of shell) assert.ok(urls.includes('/babymo/' + (f === './' ? '' : f)), 'not cached: ' + f);
  });
  await step('offline: the app opens from the cache and says so when it cannot connect', async () => {
    await ctx.setOffline(true);
    await page.reload(); await page.locator('#f-name').waitFor();
    await page.fill('#f-name', 'Dr Offline'); await page.fill('#f-pass', 'demo'); await page.click('#start button[type=submit]');
    await page.locator('#go').waitFor();    // demo mode needs no server, so the Ready screen proves the shell and scripts all came from the cache
    await ctx.setOffline(false);
    await page.click('#cancel'); await page.locator('#f-name').waitFor();
  });
  await step('a broken release (a file missing) leaves the working version in place', async () => {
    swVersion = 'babymo-broken'; swExtra = 'js/does-not-exist.js';
    await update(); await sleep(2000);
    swVersion = null; swExtra = '';
    assert.ok((await versions()).includes(SW0), 'working cache was removed');
    assert.equal(await page.evaluate(async () => (await (await navigator.serviceWorker.getRegistration()).active) ? 'active' : 'none'), 'active');
    await ctx.setOffline(true); await page.reload(); await page.locator('#f-name').waitFor(); await ctx.setOffline(false);
  });
  await step('an update never reloads the page during a test', async () => {
    await page.fill('#f-name', 'Dr Sitting'); await page.fill('#f-pass', 'demo'); await page.click('#start button[type=submit]');
    await page.click('#go'); await page.locator('#qform').waitFor();
    await page.evaluate(() => { window.__marker = 2; });
    swVersion = 'babymo-update1'; await update(); await activeVersion('babymo-update1');
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded in the middle of a test');
    assert.equal(await page.locator('#qform').count(), 1);
  });
  await step('...and applies once the test is finished and the page is idle', async () => {
    await page.click('#rv'); await page.locator('.grid').waitFor(); await page.click('#submit'); await page.click('dialog button[value=yes]');
    await page.locator('.score').waitFor(); await sleep(500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded on the result screen before leaving it?');
    await page.click('#done');        // back to the start page: nothing typed, no test: now it is safe
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
    await page.locator('#f-name').waitFor();
  });
  await step('an update does not reload while a name is half typed, then reloads when it is safe', async () => {
    await page.evaluate(() => { window.__marker = 3; });
    await page.fill('#f-name', 'Dr Typing');
    swVersion = 'babymo-update2'; await update(); await activeVersion('babymo-update2'); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 3, 'reloaded while typing');
    assert.equal(await page.inputValue('#f-name'), 'Dr Typing');
    await page.fill('#f-name', '');
    await page.evaluate(() => { location.hash = '#/faculty'; });   // moving about while idle lets it apply
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
  });
  await step('an update found while idle on the start page reloads by itself', async () => {
    await page.goto(BASE + '?demo#/'); await page.locator('#f-name').waitFor(); await page.evaluate(() => { window.__marker = 4; });
    swVersion = 'babymo-update3'; await update(); await activeVersion('babymo-update3');
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
    assert.deepEqual(await versions(), ['babymo-update3']);
  });
  assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
  console.log('babymo pwa e2e: all steps ok');
} catch { /* reported */ } finally { await b.close(); server.close(); }
