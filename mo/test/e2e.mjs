// Browser test of the MO guide at phone size, with an axe accessibility check on every kind of screen.
// Files are served from this checkout by route (no server). Run from anywhere:
//   node mo/test/e2e.mjs            SHOTS=<dir> also saves phone screenshots
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const AXE = process.env.AXE_PATH || path.join(root, 'babymo/test/vendor/axe.min.js');
const BASE = 'https://anantf.com/mo/';
const SHOTS = process.env.SHOTS;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };

const { MODULES } = await import('../js/content/index.js');
const { DRUGS } = await import('../js/data/drugs.js');
const { CRISES } = await import('../js/data/crises.js');
const { SCENARIOS } = await import('../js/data/scenarios.js');
const { DECKS } = await import('../js/data/cards.js');
const { TOOLS } = await import('../js/tools.js');

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block' });
await ctx.route(/^https:\/\/(www\.)?anantf\.com\//, async route => {
  const u = new URL(route.request().url());
  let rel = decodeURIComponent(u.pathname).replace(/^\//, '');
  if (rel.endsWith('/') || rel === '') rel += 'index.html';
  const f = path.join(root, rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: 'not found' });
  await route.fulfill({ status: 200, contentType: MIME[f.split('.').pop()] || 'application/octet-stream', body: fs.readFileSync(f) });
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', d => d.accept());
page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });

const shot = async name => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `mo-${name}.png`), fullPage: true }); } };
const axe = async label => {
  if (!fs.existsSync(AXE)) return;
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(() => window.axe.run(document, { preload: false, runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
  const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  assert.equal(bad.length, 0, `axe (${label}): ` + bad.map(v => v.id + ' ' + v.nodes[0]?.target + ' ' + v.nodes[0]?.failureSummary?.slice(0, 160)).join('; '));
};
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); await shot('fail-' + name.replace(/\W+/g, '-')); process.exitCode = 1; } };
const go = async hash => { await page.goto(BASE + hash); await page.waitForSelector('body[data-ready]'); await page.waitForTimeout(50); };
const text = sel => page.locator(sel).first().innerText();
// nothing sticks out sideways at phone width
const noSideScroll = async label => {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  assert.ok(w[0] <= w[1] + 1, `${label}: page is ${w[0]} px wide at ${w[1]} px`);
};
// every direct child of each matching element sits on one line: rows of buttons must not wrap on a phone
const oneRow = async sel => {
  const bad = await page.evaluate(s => [...document.querySelectorAll(s)].filter(el => { const k = [...el.children].filter(c => c.offsetParent); if (k.length < 2) return false; const m = k.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.max(...m) - Math.min(...m) > 12; }).map(el => el.className || el.id), sel);
  assert.deepEqual(bad, [], `wraps onto a second line at phone width: ${sel}`);
};

try {
  await step('home', async () => {
    await go('');
    assert.match(await text('h1'), /MO guide/);
    assert.equal(await page.locator('#nav a').count(), 5);
    await oneRow('#nav'); await noSideScroll('home');
    assert.match(await page.content(), /noindex/);
    await shot('home'); await axe('home');
  });

  await step('learn: modules and every topic renders', async () => {
    await go('#/learn'); await axe('learn'); await shot('learn');
    assert.equal(await page.locator('.rows a').count(), MODULES.length);
    for (const m of MODULES) {
      await go(`#/learn/${m.id}`);
      assert.equal(await page.locator('ol.topics > li').count(), m.topics.length, m.id);
      for (const t of m.topics) {
        await go(`#/learn/${m.id}/${t.id}`);
        assert.equal(await text('h1'), t.title, `${m.id}/${t.id} title`);
        assert.ok(await page.locator('.keypts li').count() > 0, `${m.id}/${t.id} key points`);
        await noSideScroll(`${m.id}/${t.id}`);
      }
    }
  });

  const first = MODULES[0], t0 = first.topics[0];
  await step('topic: axe, mark as read, pager', async () => {
    await go(`#/learn/${first.id}/${t0.id}`);
    await shot('topic'); await axe('topic');
    await page.click('#markread');
    assert.equal(await page.getAttribute('#markread', 'aria-pressed'), 'true');
    await go('');
    assert.match(await text('main'), new RegExp(`1 of \\d+ topics read`));
    if (first.topics.length > 1 || MODULES.length > 1) {
      await go(`#/learn/${first.id}/${t0.id}`);
      await page.click('.pager a[rel=next]'); await page.waitForTimeout(80);
      assert.notEqual(await text('h1'), t0.title);
    }
  });

  await step('a checklist tick is kept', async () => {
    const hit = MODULES.flatMap(m => m.topics.map(t => ({ m, t, b: t.blocks.find(x => x.t === 'check') }))).find(x => x.b);
    if (!hit) return;
    await go(`#/learn/${hit.m.id}/${hit.t.id}`);
    await page.locator(`fieldset[data-check="${hit.b.id}"] label.tick`).first().click();
    await go(`#/learn/${hit.m.id}/${hit.t.id}`);
    assert.equal(await page.locator(`fieldset[data-check="${hit.b.id}"] input`).first().isChecked(), true);
    assert.match(await text(`fieldset[data-check="${hit.b.id}"] .check-count`), /^1 of/);
  });

  await step('check yourself: answer, feedback, explanation', async () => {
    const hit = MODULES.flatMap(m => m.topics.map(t => ({ m, t, b: t.blocks.find(x => x.t === 'quiz') }))).find(x => x.b);
    if (!hit) return;
    await go(`#/learn/${hit.m.id}/${hit.t.id}`);
    const f = page.locator(`form.qitem[data-quizid="${hit.b.id}"]`).first();
    await f.locator('button[type=submit]').click();
    assert.match(await f.locator('.qfb').innerText(), /Choose an answer/);
    const q = hit.b.items[0], ans = Array.isArray(q.answer) ? q.answer : [q.answer];
    for (const a of ans) await f.locator('label.qopt').nth(a).click();
    await f.locator('button[type=submit]').click();
    assert.match(await f.locator('.qfb').innerText(), /^Right\./);
    await axe('quiz answered');
  });

  await step('drugs: weight works out doses and volumes', async () => {
    await go('#/drugs'); await axe('drugs, no weight');
    await page.click('#patient-edit'); await page.fill('#p-weight', '70'); await page.fill('#p-height', '175');
    await page.locator('.segopt', { hasText: /^Male$/ }).click();
    await page.click('#patient-form button[type=submit]');
    assert.match(await text('#patient-sum'), /70 kg/);
    await go('#/drugs/propofol');
    const t = await text('.drugcard');
    assert.match(t, /70–140 mg/); assert.match(t, /7–14 mL/);
    await shot('drug'); await axe('drug card');
    await go('#/drugs');
    await page.fill('#drug-q', 'propo');
    assert.equal(await page.locator('#drug-list .dtable > li').count(), DRUGS.filter(d => /propo/i.test(d.name + (d.aka || []).join(' '))).length || 1);
    await shot('drugs'); await noSideScroll('drugs');
  });

  await step('every drug card renders with a weight', async () => {
    for (const d of DRUGS) { await go(`#/drugs/${d.id}`); assert.equal(await text('.drugcard h3'), d.name); assert.doesNotMatch(await text('.drugcard'), /NaN|undefined|Infinity/, d.id); }
  });

  await step('calculators: every tool draws; fluids and LA maximum work', async () => {
    await go('#/tools'); await axe('tools');
    for (const id of Object.keys(TOOLS)) { await go(`#/tools/${id}`); assert.ok(await page.locator('form.tool').count(), id); assert.doesNotMatch(await text('main'), /NaN|undefined|Infinity/, id); await noSideScroll(id); }
    await go('#/tools/fluids');
    await page.fill('form.tool input[type=number] >> nth=0', '70');
    assert.match(await text('.tool-out'), /110 mL\/h/);
    await axe('fluids');
    await go('#/tools/la-max');
    await page.fill('form.tool input[type=number] >> nth=0', '60'); await page.fill('form.tool input[type=number] >> nth=1', '');
    await page.selectOption('form.tool select', 'bupivacaine');
    await page.locator('.segopt', { hasText: '0.5%' }).click();
    assert.match(await text('.tool-out'), /120 mg/); assert.match(await text('.tool-out'), /24 mL/);
    await shot('la-max'); await axe('la-max');
    await oneRow('.segrow');
    await go('#/tools/stopbang');
    for (const i of [0, 1, 2]) await page.locator('form.tool label.tick').nth(i).click();
    assert.match(await text('.tool-out'), /3 of 8/);
    await go('#/tools/aldrete'); await axe('aldrete'); await oneRow('.segrow');
  });

  await step('crisis cards', async () => {
    await go('#/crisis'); await axe('crisis list');
    assert.equal(await page.locator('.crisis-rows a').count(), CRISES.length);
    for (const c of CRISES) { await go(`#/crisis/${c.id}`); assert.equal(await text('h1'), c.title); assert.match(await text('.callfirst'), /Call for help/); await noSideScroll(c.id); }
    if (CRISES[0]) { await go(`#/crisis/${CRISES[0].id}`); await shot('crisis'); await axe('crisis card'); }
  });

  await step('scenarios: play each one through on the good choices', async () => {
    for (const s of SCENARIOS) {
      await go(`#/practice/scenario/${s.id}`);
      for (let n = 0; n < 40; n++) {
        if (await page.locator('#scen-again').count()) break;
        if (await page.locator('#scen-next').count()) { await page.click('#scen-next'); continue; }
        const node = await page.evaluate(() => null);
        const choices = page.locator('.scen .choice');
        const texts = await choices.allInnerTexts();
        // find the current node by its choices and pick the first good one
        const cur = Object.values(s.nodes).find(x => x.choices && x.choices.length === texts.length && x.choices.every((c, i) => texts[i].trim().length && c.text.replace(/\*\*|`/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim() === texts[i].trim()));
        assert.ok(cur, `${s.id}: could not find the node on screen`);
        await choices.nth(cur.choices.findIndex(c => c.good === true)).click();
        void node;
      }
      assert.ok(await page.locator('#scen-again').count(), `${s.id}: did not reach an end`);
    }
    if (SCENARIOS[0]) { await go(`#/practice/scenario/${SCENARIOS[0].id}`); await shot('scenario'); await axe('scenario'); }
  });

  await step('flashcards: show, grade, finish', async () => {
    const d = DECKS[0]; if (!d) return;
    await go(`#/practice/cards/${d.id}`); await axe('cards');
    await page.click('#card-show'); await page.click('#card-yes');
    assert.match(await text('main'), /Card 2 of|Done: you knew/);
    await shot('cards');
  });

  await step('practice hub, drawer game, progress, search, about', async () => {
    await go('#/practice'); await axe('practice'); await shot('practice');
    await go('#/practice/drawers'); await page.locator('.choices .choice').first().click(); assert.match(await text('main'), /2 of 8/); await axe('drawers');
    await go('#/progress'); await axe('progress'); await shot('progress');
    await go('#/search?q=propofol'); assert.ok(await page.locator('#sres .rows li').count() > 0); await axe('search');
    await page.fill('#sq', 'epinephrine'); await page.waitForTimeout(300);
    if (DRUGS.some(d => d.id === 'adrenaline')) assert.match(await text('#sres'), /Adrenaline/);
    await go('#/about'); await axe('about'); assert.match(await text('main'), /Get the latest version/);
    await go('#/nowhere'); assert.match(await text('h1'), /Not found/);
  });

  await step('no console errors', async () => { assert.deepEqual(errors, []); });
} finally {
  await b.close();
}
