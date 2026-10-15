// Browser test of the installable part: manifest and icons, the service worker's first install (no reload), offline start
// with the question bank from the cache, and the safe-update rules (a new version waits; the page switches to it only when
// no test is open and nothing is being typed).
// Run from the repo root: node babymo/test/pwa.e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
let swVersion = null, swExtra = '', swDown = false;   // what the test server says sw.js is: another VERSION (a new release) or a broken file list
let paperTitle = null;                                  // a changed paper on the server (the bank changes without a new app version)
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  let f = path.join(root, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  if (swDown && rel === 'babymo/sw.js') return req.socket.destroy();   // no signal for the worker's script
  let body = fs.readFileSync(f);
  if (rel === 'babymo/sw.js' && (swVersion || swExtra)) {
    let t = body.toString('utf8');
    if (swVersion) t = t.replace(/const VERSION = '[^']*';/, `const VERSION = '${swVersion}';`);
    if (swExtra) t = t.replace("const SHELL = [", `const SHELL = ['${swExtra}', `);
    body = Buffer.from(t);
  }
  if (rel === 'qbank/papers/babymo.json' && paperTitle) body = Buffer.from(JSON.stringify({ ...JSON.parse(body), title: paperTitle }));
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const ORIGIN = `http://localhost:${server.address().port}`, BASE = ORIGIN + '/babymo/';

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
const said = what => e => { throw new Error(what + ': ' + e.message.split('\n')[0]); };
const activeVersion = async v => { await page.waitForFunction(async v => { const r = await navigator.serviceWorker.getRegistration(); return r?.active && (await caches.keys()).includes(v) && !(await caches.keys()).some(k => k.startsWith('babymo-') && k !== v); }, v, { timeout: 15000 }).catch(said(v + ' never became the only active version')); };
const waitingVersion = async v => { await page.waitForFunction(async v => { const r = await navigator.serviceWorker.getRegistration(); return r?.waiting && (await caches.keys()).includes(v); }, v, { timeout: 15000 }).catch(said(v + ' never installed and waited')); };
const sw = () => fs.readFileSync(path.join(root, 'babymo/sw.js'), 'utf8');
const list = name => [...sw().match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))[1].matchAll(/'([^']+)'/g)].map(m => m[1]);
const submitTest = async () => { await page.click('#qpill'); await page.click('#nav-finish'); await page.click('#submit'); await page.locator('#score').waitFor(); };

try {
  await step('manifest and icons are valid; the page is an app shell', async () => {
    const m = await (await fetch(BASE + 'manifest.webmanifest')).json();
    assert.equal(m.display, 'standalone'); assert.equal(m.start_url, './'); assert.equal(m.scope, './'); assert.ok(m.name && m.short_name);
    assert.equal(m.theme_color, '#f1ede4'); assert.equal(m.background_color, '#f1ede4');
    assert.ok(m.icons.some(i => i.sizes === '192x192') && m.icons.some(i => i.sizes === '512x512') && m.icons.some(i => i.purpose === 'maskable'));
    for (const i of m.icons) {
      const r = await fetch(BASE + i.src); assert.equal(r.status, 200, i.src); assert.equal(r.headers.get('content-type'), 'image/png');
      const buf = Buffer.from(await r.arrayBuffer()); const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
      assert.equal(`${w}x${h}`, i.sizes, i.src + ' size');
    }
    const html = await (await fetch(BASE)).text();
    assert.match(html, /rel="manifest"/); assert.match(html, /apple-touch-icon/); assert.match(html, /noindex/); assert.match(html, /viewport-fit=cover/); assert.match(html, /apple-mobile-web-app-capable/);
  });
  const SW0 = sw().match(/const VERSION = '([^']*)'/)[1];
  await step('first visit: the worker installs and takes over without reloading the page', async () => {
    await page.goto(BASE + '?demo'); await page.locator('#f-name').waitFor();
    await page.evaluate(() => { window.__marker = 1; });
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 1, 'the page reloaded on first install');
    assert.deepEqual(await versions(), [SW0]);
  });
  await step('every app file, font, bank code, the bank and the paper are cached in the one version cache', async () => {
    const urls = await page.evaluate(async v => (await (await caches.open(v)).keys()).map(r => new URL(r.url).pathname), SW0);
    for (const f of list('SHELL')) assert.ok(urls.includes('/babymo/' + (f === './' ? '' : f)), 'not cached: ' + f);
    for (const f of [...list('SITE'), ...list('DATA')]) assert.ok(urls.includes(new URL(f, BASE).pathname), 'not cached: ' + f);
    assert.ok(list('DATA').includes('../qbank/bank/questions.json') && list('DATA').includes('../qbank/papers/babymo.json'));
  });
  await step('the worker really answers for the bank files (outside its folder), network first', async () => {
    paperTitle = 'Changed on the server';
    const t1 = await page.evaluate(async () => (await (await fetch('../qbank/papers/babymo.json')).json()).title);
    assert.equal(t1, 'Changed on the server', 'online: the newest file');
    await ctx.setOffline(true);
    const r = await page.evaluate(async () => { const p = await (await fetch('../qbank/papers/babymo.json')).json(); const q = await (await fetch('../qbank/bank/questions.json')).json(); return [p.title, q.questions.length]; });
    await ctx.setOffline(false);
    assert.equal(r[0], 'Changed on the server', 'offline: the copy the worker kept last time'); assert.ok(r[1] > 0);
    paperTitle = null;
    await page.evaluate(() => fetch('../qbank/papers/babymo.json'));   // put the real one back in the cache
  });
  await step('start page shows the app version and "Get the latest version"', async () => {
    const [, d, h] = SW0.match(/^babymo-(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    await page.reload(); await page.locator('#appver:not([hidden])').waitFor();   // the line appears once the offline copy exists
    assert.equal(await page.textContent('#appver'), `App version ${d} (${h})`);
    assert.equal(await page.textContent('#getlatest'), 'Not updating? Get the latest version');
  });
  await step('"Get the latest version" with no signal changes nothing', async () => {
    swDown = true; await page.evaluate(() => { window.__marker = 6; });
    await page.click('#getlatest');
    await page.waitForFunction(() => /No signal/.test(document.querySelector('#appver-msg')?.textContent));
    swDown = false;
    assert.equal(await page.evaluate(() => window.__marker), 6, 'the page reloaded');
    assert.equal(await page.isDisabled('#getlatest'), false);
    assert.deepEqual(await versions(), [SW0]);
    assert.ok(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.active), 'worker was removed');
  });
  await step('"Get the latest version" with a signal clears only babymo- caches and keeps saved data', async () => {
    await page.evaluate(async () => { localStorage.setItem('bm-keep', 'yes'); await caches.open('babymo-old'); await caches.open('other-app'); window.__marker = 5; });
    await page.click('#getlatest');
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 }).catch(said('the page never reloaded into the new version'));
    await page.locator('#f-name').waitFor();
    const keys = await page.evaluate(() => caches.keys());
    assert.ok(!keys.includes('babymo-old'), 'old babymo- cache kept');
    assert.ok(keys.includes('other-app'), 'another app\'s cache was deleted');
    assert.equal(await page.evaluate(() => localStorage.getItem('bm-keep')), 'yes');
    await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });   // re-installed fresh
    await activeVersion(SW0);
    await page.evaluate(async () => { localStorage.removeItem('bm-keep'); await caches.delete('other-app'); });
  });
  await step('offline: the app opens from the cache and a test starts with the cached paper', async () => {
    await ctx.setOffline(true);
    await page.reload(); await page.locator('#f-name').waitFor();
    assert.match(await page.locator('.bm-pills').innerText(), /offline/i);
    await page.fill('#f-name', 'Dr Offline'); await page.fill('#f-pass', 'demo'); await page.click('#start-go');
    await page.locator('#go').waitFor();    // demo mode needs no server, so this proves the shell, scripts and bank came from the cache
    assert.match(await page.textContent('#ready-sum'), /\d+ questions/);
    await page.click('#go'); await page.locator('#stem').waitFor();
    await page.click('#leave'); await page.click('dialog.app-sheet [data-yes]'); await page.locator('#resume').waitFor();
    await ctx.setOffline(false);
    await page.click('#resume-go'); await submitTest(); await page.click('#done'); await page.locator('#f-name').waitFor();
  });
  await step('a broken release (a file missing) leaves the working version in place', async () => {
    swVersion = 'babymo-broken'; swExtra = 'js/does-not-exist.js';
    await update(); await sleep(2000);
    swVersion = null; swExtra = '';
    assert.ok((await versions()).includes(SW0), 'working cache was removed');
    assert.equal(await page.evaluate(async () => (await (await navigator.serviceWorker.getRegistration()).active) ? 'active' : 'none'), 'active');
    await ctx.setOffline(true); await page.reload(); await page.locator('#f-name').waitFor(); await ctx.setOffline(false);
  });
  await step('a new version waits: it never takes over or reloads during a test', async () => {
    await page.fill('#f-name', 'Dr Sitting'); await page.fill('#f-pass', 'demo'); await page.click('#start-go');
    await page.click('#go'); await page.locator('#stem').waitFor();
    await page.evaluate(() => { window.__marker = 2; });
    swVersion = 'babymo-update1'; await update(); await waitingVersion('babymo-update1');
    await sleep(6000);   // past the page's 5-second check
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded in the middle of a test');
    assert.equal(await page.locator('#stem').count(), 1);
    assert.ok(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting), 'the new version should still be waiting');
  });
  await step('...nor on the result screen, and switches once back on the start page', async () => {
    await submitTest(); await sleep(1500);
    assert.equal(await page.evaluate(() => window.__marker), 2, 'reloaded on the result screen');
    await page.click('#done');        // back to the start page: nothing typed, no test: now it is safe
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 }).catch(said('the page never reloaded into the new version'));
    await page.locator('#f-name').waitFor();
    await activeVersion('babymo-update1');
  });
  await step('an update does not switch while a name is being typed, then does when it is safe', async () => {
    await page.evaluate(() => { window.__marker = 3; });
    await page.fill('#f-name', 'Dr Typing');
    swVersion = 'babymo-update2'; await update(); await waitingVersion('babymo-update2'); await sleep(6000);
    assert.equal(await page.evaluate(() => window.__marker), 3, 'reloaded while typing');
    assert.equal(await page.inputValue('#f-name'), 'Dr Typing');
    await page.fill('#f-name', '');
    await page.evaluate(() => { location.hash = '#/faculty'; });   // moving to another top-level screen while idle lets it apply
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 }).catch(said('the page never reloaded into the new version'));
    await activeVersion('babymo-update2');
  });
  await step('an update found while idle on the start page switches by itself', async () => {
    await page.goto(BASE + '?demo#/'); await page.locator('#f-name').waitFor(); await page.evaluate(() => { window.__marker = 4; });
    swVersion = 'babymo-update3'; await update();
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 }).catch(said('the page never reloaded into the new version'));
    await activeVersion('babymo-update3');
    assert.deepEqual(await versions(), ['babymo-update3']);
  });
  await step('on a screen deeper in, an update is offered as "Update ready · Restart"', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.click('#in'); await page.locator('#byperson, .empty').first().waitFor();
    await page.click('#tabs .app-tab:has-text("Paper")'); await page.locator('#paper-ready').waitFor();
    await page.click('#paper-ready .app-row >> nth=0'); await page.locator('#suggest').waitFor();
    await page.evaluate(() => { window.__marker = 7; });
    swVersion = 'babymo-update4'; await update(); await waitingVersion('babymo-update4');
    await page.locator('#toast.is-visible:has-text("Update ready")').waitFor({ timeout: 10000 });
    assert.equal(await page.evaluate(() => window.__marker), 7, 'switched on its own on a pushed screen');
    await page.click('#toast .app-toast-action');
    await page.waitForFunction(() => window.__marker === undefined, null, { timeout: 15000 }).catch(said('the page never reloaded into the new version'));
    await activeVersion('babymo-update4');
  });
  assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
  console.log('babymo pwa e2e: all steps ok');
} catch (e) { if (!process.exitCode) { console.error(e); process.exitCode = 1; } } finally { await b.close(); server.close(); }
