// Browser walk-through against test/serve.mjs: node test/e2e.mjs [outdir]  (server must be running on :8787)
import { chromium } from 'playwright';
const PORT = process.env.PORT || 8787;
const out = process.argv[2] || '.';
const exe = process.env.CHROMIUM || (await import("node:fs")).existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") && "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" || undefined;
const b = await chromium.launch({ executablePath: exe });
const errors = [];
const page = async (who, w = 390, h = 844) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('console', m => m.type() === 'error' && errors.push(`${who}: ${m.text()}`)); p.on('pageerror', e => errors.push(`${who}: ${e.message}`));
  await p.goto(`http://localhost:${PORT}/?test=${who}#/`); return p;
};
const assert = (c, m) => { if (!c) throw new Error(m); };

// a candidate joins
const p = await page('ann');
await p.waitForSelector('#join');
await p.fill('#nm', 'Ann Tan'); await p.fill('#pp', 'wrong'); await p.check('#ok'); await p.click('#join button[type=submit]');
await p.waitForSelector('#err:not([hidden])'); assert(/passphrase/i.test(await p.textContent('#err')), 'wrong passphrase message');
await p.fill('#pp', 'cohort26'); await p.click('#join button[type=submit]');
await p.waitForSelector('.week'); assert(await p.locator('.week').count() === 10, '10 week cards');
await p.screenshot({ path: `${out}/1-home.png`, fullPage: true });

// first question: start, write, reload keeps the draft and the clock, submit
await p.click('a.btn:has-text("Next")');
await p.waitForSelector('#ans');
await p.click('#startStop'); await p.waitForTimeout(2200);
await p.fill('#ans', 'Pre-op\n- Assess airway\nIntra-op\n- RSI');
await p.reload(); await p.waitForSelector('#ans');
assert((await p.inputValue('#ans')).includes('RSI'), 'draft kept on reload');
const clock = await p.textContent('#clock'); assert(clock < '15:00' && clock.startsWith('14:'), 'clock kept running: ' + clock);
await p.screenshot({ path: `${out}/2-question.png`, fullPage: false });
p.once('dialog', d => d.accept());
await p.click('#submit');
await p.waitForSelector('.scores'); assert(await p.locator('.annotated .c').count() >= 1, 'annotated comment shown');
await p.screenshot({ path: `${out}/3-result.png`, fullPage: true });

// second answer, then progress
await p.click('a:has-text("Next question")'); await p.waitForSelector('#ans');
await p.fill('#ans', 'A. something longer than before\nB. more'); p.once('dialog', d => d.accept()); await p.click('#submit'); await p.waitForSelector('.scores');
await p.goto(`http://localhost:${PORT}/?test=ann#/`); await p.waitForSelector('.stat');
assert((await p.textContent('.stat b')).startsWith('2'), 'home shows 2 done');
await p.goto(`http://localhost:${PORT}/?test=ann#/progress`); await p.waitForSelector('#cTrend svg');
assert(await p.locator('#cWeeks path.mark').count() === 1, 'week 1 bar'); assert(await p.locator('#cTrend circle').count() === 2, '2 trend points');
await p.hover('#cTrend rect.hit >> nth=1'); assert(!(await p.locator('#cTrend .tip').isHidden()), 'tooltip shows');
await p.screenshot({ path: `${out}/4-progress.png`, fullPage: true });
const sw = await p.evaluate(() => document.documentElement.scrollWidth); assert(sw <= 390, 'no sideways scroll on a phone: ' + sw);

// another candidate can't see Ann's work; no faculty link
const bob = await page('bob'); await bob.waitForSelector('#join');
assert(await bob.locator('#navFaculty').isHidden(), 'no cohort link for candidates');

// faculty
const lead = await page('lead', 1280, 900); await lead.waitForSelector('#join');
await lead.fill('#nm', 'Lead'); await lead.check('#ok'); await lead.click('#join button[type=submit]');
await lead.waitForSelector('.week'); await lead.click('#navFaculty'); await lead.waitForSelector('table');
assert((await lead.textContent('table')).includes('Ann Tan'), 'cohort lists Ann');
await lead.click('a:has-text("Ann Tan")'); await lead.waitForSelector('td a'); await lead.click('td a >> nth=0'); await lead.waitForSelector('.scores');
await lead.screenshot({ path: `${out}/5-faculty.png`, fullPage: true });

// dark mode renders
const dark = await b.newPage({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
await dark.goto(`http://localhost:${PORT}/?test=ann#/progress`); await dark.waitForSelector('#cTrend svg');
await dark.screenshot({ path: `${out}/6-progress-dark.png`, fullPage: true });

await b.close();
// the wrong-passphrase step answers 403 on purpose
const real = errors.filter(e => !/status of 403/.test(e));
if (real.length) { console.error(real); process.exit(1); }
console.log('e2e ok');
