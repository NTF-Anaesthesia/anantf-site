// Browser test of the Philips IntelliVue screen (the 'philips' skin): it opens from the monitor switch, draws the three waves and the
// numerics, Setup BIS changes the shown numerics, the sensor window runs a check, BIS limits raise the yellow alarm and Silence acknowledges it.
// Run with a static server on port 8080: node eeg/test/pv.e2e.mjs  (also run by e2e.mjs)
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';

const BASE = `http://localhost:${process.env.PORT || 8080}/eeg/`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {});
const errors = [];
try {
  for (const [viewport, deviceScaleFactor] of [[{ width: 1100, height: 900 }, 1], [{ width: 390, height: 844 }, 2]].filter(([v]) => !process.env.BIS_VIEW || (process.env.BIS_VIEW === 'phone') === (v.width === 390))) { // BIS_VIEW=phone or desktop runs one size (the Checks run each as its own job)
    const phone = viewport.width === 390;
    const page = await b.newPage({ viewport, deviceScaleFactor });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE);
    await page.click('#monSwitch [data-skin="philips"]');
    await page.waitForFunction(() => !document.querySelector('#pvWrap').hidden && document.querySelector('#vistaWrap').hidden && PV.built);
    // 16:10 screen that fits the phone
    { const r = await page.$eval('#pvS', e => { const q = e.getBoundingClientRect(); return [q.width / q.height, q.width]; }); assert.ok(Math.abs(r[0] - 1.6) < 0.02, `16:10 screen (${r[0]})`); if (phone) assert.ok(r[1] <= 390, 'fits the phone width'); }
    // the waves are drawn: the EEG band has yellow pixels (BIS's colour) and the ECG band green ones
    await page.waitForFunction(() => PV.wv && PV.wv.x > 50, null, { timeout: 8000 });
    const px = await page.evaluate(() => { const cv = PV.cv, k = cv.width / 1440, c = cv.getContext('2d'); const band = (y0, y1, f) => { const d = c.getImageData(Math.round(100 * k), Math.round(y0 * k), Math.round(700 * k), Math.max(1, Math.round((y1 - y0) * k))).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (f(d[i], d[i + 1], d[i + 2])) n++; return n; };
      return { eeg: band(556, 656, (r, g, b) => r > 180 && g > 170 && r - b > 40), ecg: band(110, 290, (r, g, b) => g > 150 && r < 140), pl: band(412, 494, (r, g, b) => b > 150 && r < 120) }; });
    assert.ok(px.eeg > 30 && px.ecg > 30 && px.pl > 30, `EEG, ECG and Pleth waves drawn (${JSON.stringify(px)})`);
    // the numerics and the summary line
    await page.waitForFunction(() => /^BIS \d+, SQI \d+, EMG \d+ dB, SR \d+%/.test(document.querySelector('#bilSum').textContent));
    assert.match(await page.getAttribute('#pvS', 'aria-label'), /Philips IntelliVue monitor screen: BIS/);
    // awake on the factory limits (70 / 20): the yellow BIS High alarm; Silence acknowledges it (a tick before the text)
    await page.waitForFunction(() => pvAlarms().some(m => m.text === '** BIS High'), null, { timeout: 8000 });
    await page.click('.pvhit[data-k="silence"]');
    assert.ok(await page.evaluate(() => PV.ack['** BIS High'] === true), 'Silence acknowledges the alarm');
    // Setup BIS: tapping BIS opens it with the factory defaults; switching EMG off removes it from the summary of shown numerics
    await page.click('.pvhit[data-k="bis"]');
    await page.waitForFunction(() => !document.querySelector('#pvMenu').hidden);
    assert.match(await page.textContent('#pvMenu'), /Setup BIS.*High Limit70.*Low Limit20.*AlarmsOn.*Scale100µV/s);
    await page.click('#pvMenu [data-v="emg"]'); assert.equal(await page.evaluate(() => PV.set.emg), false);
    await page.click('#pvMenu [data-v="scale"]'); assert.equal(await page.evaluate(() => PV.set.scale), 200);
    // the sensor window: Start Sensor Chk runs, then Last Check shows a time
    await page.click('#pvMenu [data-v="sensor"]');
    assert.match(await page.textContent('#pvMenu'), /BIS 4 Electrode Sensor.*Last Check: --/s);
    await page.click('#pvMenu [data-a="chk"]'); assert.match(await page.textContent('#pvMenu'), /Stop Sensor Chk/);
    await page.waitForFunction(() => /Last Check: \d/.test(document.querySelector('#pvMenu').textContent), null, { timeout: 9000 });
    await page.click('.pvhit[data-k="main"]'); assert.ok(await page.$eval('#pvMenu', e => e.hidden), 'Main Screen closes the window');
    // the choice is remembered
    assert.equal(await page.evaluate(() => localStorage.getItem('bisdsa.skin')), 'philips');
    await page.close();
  }
  assert.deepEqual(errors, [], 'no page errors');
  console.log('pv.e2e: ok');
} finally { await b.close(); }
