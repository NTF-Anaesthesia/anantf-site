// Browser test of the installable part of the qbank app: manifest and icons, the first install (no reload), the offline
// copy (app, fonts, questions), questions arriving without a new release, "Get the latest version", and the update rules
// (a new version never reloads the page during a session or while typing; it applies when the app is idle).
// Run from the repo root: node qbank/test/pwa.e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', webmanifest: 'application/manifest+json', woff2: 'font/woff2' };
let swVersion = null, swExtra = '', swDown = false, bankEdit = null;   // what the test server says: a new release, a broken file list, no signal, an edited bank
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  const f = path.join(root, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  if (swDown && rel === 'qbank/sw.js') return req.socket.destroy();
  let body = fs.readFileSync(f);
  if (rel === 'qbank/sw.js' && (swVersion || swExtra)) {
    let t = body.toString('utf8');
    if (swVersion) t = t.replace(/const VERSION = '[^']*';/, `const VERSION = '${swVersion}';`);
    if (swExtra) t = t.replace('const SHELL = [', `const SHELL = ['${swExtra}', `);
    body = Buffer.from(t);
  }
  if (rel === 'qbank/bank/questions.json' && bankEdit) body = Buffer.from(JSON.stringify(bankEdit(JSON.parse(body.toString('utf8')))));
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/qbank/`;

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; throw e; } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const versions = () => page.evaluate(async () => (await caches.keys()).filter(k => k.startsWith('qbank-')).sort());
const update = () => page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); await r.update(); });
const activeVersion = v => page.waitForFunction(async v => { const r = await navigator.serviceWorker.getRegistration(); const k = await caches.keys(); return r?.active && k.includes(v) && !k.some(x => x.startsWith('qbank-') && x !== v); }, v, { timeout: 15000 });
const reloaded = () => page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 });
const swText = fs.readFileSync(path.join(root, 'qbank/sw.js'), 'utf8');
const SW0 = swText.match(/const VERSION = '([^']*)'/)[1];
const list = name => [...swText.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'([^']+)'/g)].map(m => m[1]);

try {
  await step('manifest, icons and page tags', async () => {
    const m = await (await fetch(BASE + 'manifest.webmanifest')).json();
    assert.equal(m.display, 'standalone'); assert.equal(m.start_url, './'); assert.equal(m.scope, './'); assert.ok(m.name && m.short_name);
    assert.equal(m.theme_color, '#f1ede4'); assert.equal(m.background_color, '#f1ede4');   // the kit's ground (DESIGN-APP.md)
    assert.ok(m.icons.some(i => i.sizes === '192x192') && m.icons.some(i => i.sizes === '512x512') && m.icons.some(i => i.purpose === 'maskable'));
    for (const i of m.icons) {
      const r = await fetch(BASE + i.src); assert.equal(r.status, 200, i.src);
      const buf = Buffer.from(await r.arrayBuffer()); assert.equal(`${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`, i.sizes, i.src + ' size');
    }
    const html = await (await fetch(BASE)).text();
    for (const re of [/rel="manifest"/, /apple-touch-icon/, /noindex, nofollow/, /viewport-fit=cover/, /apple-mobile-web-app-capable/, /data-theme="light"/]) assert.match(html, re);
  });
  await step('first visit: the worker installs and takes over without reloading the page', async () => {
    await page.goto(BASE); await page.locator('#quick').waitFor();
    await page.evaluate(() => { window.__marker = 1; });
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 1, 'the page reloaded on first install');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('the app, its fonts, the questions and the papers are all in the one version cache', async () => {
    const urls = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => new URL(r.url).pathname), SW0);
    for (const f of [...list('SHELL'), ...list('DATA')]) assert.ok(urls.includes('/qbank/' + (f === './' ? '' : f)), 'not cached: ' + f);
    const hrefs = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => r.url), SW0);
    for (const f of list('SITE')) assert.ok(hrefs.includes(new URL(f, BASE).href), 'not cached: ' + f);
    assert.ok(list('DATA').includes('bank/questions.json') && list('DATA').includes('papers/babymo.json'));
    assert.ok(list('SITE').includes('https://design.anantf.com/v1/app.css') && list('SITE').includes('https://design.anantf.com/v1/fonts/inter.woff2'), 'the app kit and its fonts are in the offline copy');
  });
  await step('Progress shows the app version and "Get the latest version"', async () => {
    const [, d, h] = SW0.match(/^qbank-(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    await page.click('.app-tab[data-tab=progress]'); await page.locator('#appver:not([hidden])').waitFor();
    assert.equal(await page.textContent('#appver'), `App version ${d} (${h})`);
    assert.equal(await page.textContent('#getlatest'), 'Not updating? Get the latest version');
  });
  await step('"Get the latest version" with no signal changes nothing', async () => {
    swDown = true; await page.evaluate(() => { window.__marker = 6; });
    await page.click('#getlatest');
    await page.waitForFunction(() => /No signal/.test(document.querySelector('#appver-msg')?.textContent));
    swDown = false;
    assert.equal(await page.evaluate(() => window.__marker), 6, 'the page reloaded');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('"Get the latest version" with a signal clears only qbank- caches and keeps progress', async () => {
    await page.evaluate(async () => { localStorage.setItem('qbank.v1.flags', '{"qkeep001":1}'); await caches.open('qbank-old'); await caches.open('other-app'); window.__marker = 5; });
    await page.click('#getlatest'); await reloaded();
    await page.locator('#reset').waitFor();
    const keys = await page.evaluate(() => caches.keys());
    assert.ok(!keys.includes('qbank-old')); assert.ok(keys.includes('other-app'), "another app's cache was deleted");
    assert.equal(await page.evaluate(() => localStorage.getItem('qbank.v1.flags')), '{"qkeep001":1}');
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await activeVersion(SW0);
    await page.evaluate(async () => { localStorage.removeItem('qbank.v1.flags'); await caches.delete('other-app'); });
  });
  await step('offline: the app opens from the cache and practice works', async () => {
    await ctx.setOffline(true);
    await page.goto(BASE + '#/practise'); await page.locator('#quick').waitFor();
    assert.equal(await page.locator('#offline').isVisible(), true);
    await page.click('#quick'); await page.locator('#navpill').waitFor();
    await page.locator('.app-choice').first().click(); await page.locator('dialog[open]').waitFor();
    await ctx.setOffline(false);
    await page.goto(BASE + '#/practise'); await page.locator('#resume').waitFor();
    await page.click('#discard');
  });
  await step('a corrected question arrives without a new release (questions are network first)', async () => {
    bankEdit = bank => { const q = bank.questions.find(x => x.status === 'active'); q.stem = 'Freshly corrected question text zebra'; return bank; };
    await page.goto(BASE + '#/browse'); await page.reload(); await page.locator('#find').waitFor();
    await page.fill('#find', 'zebra');
    await page.waitForFunction(() => /^1 question/.test(document.querySelector('#blist .qb-count')?.textContent || ''));
    bankEdit = null;
    await page.fill('#find', '');
  });
  await step('a broken release (a file missing) leaves the working version in place', async () => {
    swVersion = 'qbank-broken'; swExtra = 'js/does-not-exist.js';
    await update(); await sleep(2000);
    swVersion = null; swExtra = '';
    assert.ok((await versions()).includes(SW0), 'working cache was removed');
    await ctx.setOffline(true); await page.reload(); await page.locator('#find').waitFor(); await ctx.setOffline(false);
  });
  await step('an update never reloads the page during a session', async () => {
    await page.goto(BASE + '#/practise'); await page.locator('#quick').waitFor();
    await page.click('#quick'); await page.locator('#navpill').waitFor();
    await page.evaluate(() => { window.__marker = 2; });
    swVersion = 'qbank-update1'; await update(); await activeVersion('qbank-update1');
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded in the middle of a session');
    await page.locator('.app-choice').first().click(); await page.locator('dialog[open]').waitFor(); await sleep(500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded with a sheet open');
  });
  await step('...and offers "Update ready / Restart" at the next safe moment', async () => {
    await page.click('#fnext'); await page.locator('#navpill').waitFor();
    await page.click('#leave'); await page.click('#goaway');         // back on a top-level screen, nothing open
    await page.locator('#toast.is-visible', { hasText: 'Update ready' }).waitFor({ timeout: 5000 });
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded without asking');
    await page.locator('#toast.is-visible .app-toast-action', { hasText: 'Restart' }).click();
    await reloaded(); await page.locator('#resume').waitFor();          // the open session survives the restart
    await page.click('#discard');
  });
  await step('an update does not reload while a search is half typed', async () => {
    await page.click('.app-tab[data-tab=browse]'); await page.locator('#find').waitFor();
    await page.evaluate(() => { window.__marker = 3; });
    await page.click('#find'); await page.keyboard.type('airw');
    swVersion = 'qbank-update2'; await update(); await activeVersion('qbank-update2'); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 3, 'reloaded while typing');
    assert.equal(await page.inputValue('#find'), 'airw');
  });
  await step('an update found while idle on a top-level screen applies by itself', async () => {
    await page.goto(BASE + '#/papers'); await page.locator('main a.app-row[href="#/paper/babymo"]').waitFor();
    await page.evaluate(() => { window.__marker = 4; });
    swVersion = 'qbank-update3'; await update(); await activeVersion('qbank-update3');
    await reloaded();
    assert.deepEqual(await versions(), ['qbank-update3']);
  });
  assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
  console.log('qbank pwa e2e: all steps ok');
} catch { /* reported */ } finally { await b.close(); server.close(); }
