// Browser test of the case timeline (timeline.js): +1 / +5 min run the case on, -1 / -5 min go back to the same patient and the same
// drug controls, and the bar shows the case time. Run with a static server on port 8080: node eeg/test/timeline.e2e.mjs (also run by e2e.mjs)
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';

const BASE = `http://localhost:${process.env.PORT || 8080}/eeg/`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {});
const errors = [];
try {
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE);
  await page.waitForFunction(() => TL.t0 != null && TL.snaps.length === 1);
  const st = () => page.evaluate(() => ({ t: Math.round(simT), n: HIST[HIST.length - 1].n, rn: R.HIST[R.HIST.length - 1].n, dv: $('depth').value }));
  const jump = async j => { await page.click(`#tBtns [data-j="${j}"]`); await page.waitForFunction(() => !TL.busy, null, { timeout: 60000 }); };
  // general anaesthesia, then 5 minutes on: the trend history grows with it, on both sides
  await page.evaluate(() => { const d = $('depth'); d.value = 57; d.dispatchEvent(new Event('input', { bubbles: true })); });
  const a = await st(); await jump(300); const c = await st();
  assert.ok(c.t - a.t >= 300 && c.t - a.t < 303, `+5 min runs the case on (${a.t} to ${c.t})`);
  assert.ok(Math.abs(c.n - c.t) <= 2 && Math.abs(c.rn - c.t) <= 2, 'both sides have trend up to the new time');
  assert.ok(await page.evaluate(() => HIST[HIST.length - 1].bis < 60), 'the patient is asleep after 5 minutes of GA');
  // wake the patient, run on, then go back 5 minutes: the GA setting comes back and the history is cut there
  await page.evaluate(() => { const d = $('depth'); d.value = 0; d.dispatchEvent(new Event('input', { bubbles: true })); });
  await jump(60); const e = await st(); await jump(-300); const f = await st();
  assert.ok(Math.abs(e.t - f.t - 300) <= 1, `back 5 minutes (${e.t} to ${f.t})`);
  assert.equal(f.dv, '57', 'the drug control is put back as it was then');
  assert.ok(Math.abs(f.n - f.t) <= 2, 'the history ends at the new time');
  assert.match(await page.textContent('#tNow'), /^Case \d+:\d\d · (4:59|5:00|5:01) ahead was rewound$/);
  await jump(-60); { const g = await st(); assert.ok(Math.abs(f.t - g.t - 60) <= 1, `back 1 minute (${f.t} to ${g.t})`); }
  // can't go before the start of the case
  await jump(-900); assert.equal(await page.evaluate(() => Math.round(simT - TL.t0)), 0, 'stops at the start of the case');
  assert.ok(await page.$eval('#tBtns [data-j="-60"]', x => x.disabled), 'back buttons are off at the start');
  assert.deepEqual(errors, [], 'no page errors');
  console.log('timeline.e2e: ok');
} finally { await b.close(); }
