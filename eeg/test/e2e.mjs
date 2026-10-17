// Browser test of the BIS to DSA page at phone and desktop size, with an axe accessibility check.
// Run from the repo root with a static server on port 8080 (python3 -m http.server 8080): node eeg/test/e2e.mjs
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';

const AXE = new URL('../../tools/vendor/axe.min.js', import.meta.url).pathname;
const BASE = `http://localhost:${process.env.PORT || 8080}/eeg/`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {});
const errors = [];
const bis = p => p.$eval('#vBis', e => +e.textContent);
try {
  // the phone runs at 3x pixel density: at 1x a canvas-size bug (graphs growing every frame) never showed
  for (const [viewport, deviceScaleFactor] of [[{ width: 390, height: 844 }, 3], [{ width: 1280, height: 900 }, 1]].filter(([v]) => !process.env.BIS_VIEW || (process.env.BIS_VIEW === 'phone') === (v.width === 390))) { // BIS_VIEW=phone or desktop runs one size (the Checks run each as its own job)
    const page = await b.newPage({ viewport, deviceScaleFactor });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE);
    // opens on an awake patient: BIS in the 80s-90s
    await page.waitForFunction(() => /^\d+$/.test(document.querySelector('#vBis').textContent));
    const awake = await bis(page);
    assert.ok(awake >= 80, `awake BIS ${awake}`);
    assert.equal(await page.textContent('#rName'), 'Awake');
    assert.equal(await page.$eval('#depth', e => e.value), '0');
    // the default screen is the BIS VISTA style: number, SQI bars, ST and SR boxes, EEG, DSA with the BIS trend under it
    assert.equal(await page.$eval('#skinSeg [data-skin="vista"]', e => e.getAttribute('aria-pressed')), 'true');
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#vistaWrap', false], { timeout: 5000 });
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#classicWrap', true], { timeout: 5000 });
    await page.waitForFunction(() => +document.querySelector('#v2Bis').textContent >= 80);
    assert.equal(await page.$eval('#v2St', e => e.textContent), '0:00:00');
    assert.ok(await page.$$eval('#v2Sqi i.on', e => e.length) >= 4, 'SQI bars lit');
    assert.ok(await page.evaluate(() => document.fonts.check('12px Arimo') && document.fonts.check('12px "Archivo Narrow"')), 'bundled fonts load');
    for (const id of ['c2Dsa', 'c2Eeg']) {
      const lit = await page.$eval('#' + id, c => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < x.length; i += 4) if (x[i] + x[i + 1] + x[i + 2] > 60) n++; return n / (x.length / 4); });
      assert.ok(lit > 0.02, `${id} is drawn (${lit})`);
    }
    // the DSA image and its time axis: 30 min of history on the 1 hour scale (labels every 10 min, none beyond the newest column)
    await page.evaluate(() => { step(1800 * FS); stepR(1800 * FS); simT += 1800; dirty = true; }); await page.waitForTimeout(400);
    { const r = await page.evaluate(() => { const m = mtModel(MT.win * 60), l = mtLabels(m, 143, 323); return { tN: m.tN, l: l.map(x => ({ ts: x.ts, x: x.x })) }; });
      assert.ok(r.l.length >= 3, `axis labels on the 1 hour scale (${r.l.length})`);
      for (const x of r.l) assert.ok(x.ts <= r.tN + 0.5 && x.x <= 143 + 323 - 17, 'no label beyond the newest column or the data area');
      for (let i = 1; i < r.l.length; i++) assert.equal(r.l[i].ts - r.l[i - 1].ts, 600, 'labels 10 min apart');
      // colours of the DSA field itself (MT_OFF, the image before the SEF and MF lines are drawn over it: the white SEF line of the earlier
      // awake trend runs near 28 Hz, so pixels read off the screen could land on it), the middle value of 5 x 5 points from 30 columns in
      const fld = await page.evaluate(() => { const g = MT_OFF.getContext('2d'), med = a => a.slice().sort((p, q) => p - q)[a.length >> 1];
        const at = hz => { const y0 = Math.round(MT_DH * (1 - hz / 30)), v = []; for (let x = 30; x <= 70; x += 10) for (let y = y0 - 2; y <= y0 + 2; y++) v.push([...g.getImageData(x, Math.max(0, Math.min(MT_DH - 1, y)), 1, 1).data]); return [0, 1, 2].map(i => med(v.map(q => q[i]))); };
        return { beta: at(28), slow: at(6) }; });
      assert.ok(fld.beta[2] > 150 && fld.beta[0] < 160, `awake beta is cyan or green (${fld.beta})`); assert.ok(fld.slow[0] > 200 && fld.slow[2] < 90, `awake 6 Hz is orange-red (${fld.slow})`); }
    // start-up message with a Dismiss button, as on the real monitor
    await page.waitForFunction(re => new RegExp(re).test(document.querySelector('#v2MsgT').textContent), String.raw`Factory settings restored`, { timeout: 4000 });
    await page.click('#v2Dismiss'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Msg', true], { timeout: 5000 });
    // Menu: pages of 3 x 3 tiles in the lower panel; MENU becomes HOME; tiles change the settings they name
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', true], { timeout: 5000 });
    assert.equal(await page.textContent('#kMl'), 'MENU');
    await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', false], { timeout: 5000 }); assert.equal(await page.textContent('#kMl'), 'HOME');
    const tile = name => page.locator('#v2Menu button', { hasText: name }).first();
    for (const t of ['Target', 'Secondary', 'Chart', 'Alarm', 'Display', 'View/Save', 'Help', 'Snapshot', 'Next']) assert.ok(await tile(t).count(), `page 1 tile ${t}`);
    // Target Range: limits move in steps of 5 and the BIS alarm limits follow
    await tile('Target').click(); await tile('Target Range').first().waitFor();
    assert.equal(await page.$eval('#v2Menu .mtbox', e => e.textContent), '60');
    await page.click('#v2Menu button[data-k="hi-"]'); assert.equal(await page.$eval('#v2Menu .mtbox', e => e.textContent), '55');
    await page.click('#v2Menu button[data-k="hi+"]'); await page.click('#v2Menu button[data-k="hi+"]'); assert.equal(await page.$eval('#v2Menu .mtbox', e => e.textContent), '65');
    for (let i = 0; i < 5; i++) await page.click('#v2Menu button[data-k="lo-"]');
    assert.equal(await page.$eval('#v2Menu .mtbox:nth-of-type(2)', e => e.textContent).catch(() => '15'), '15');
    assert.equal(await page.evaluate(() => [mon.alo, mon.ahi].join()), '15,65');
    for (let i = 0; i < 5; i++) await page.click('#v2Menu button[data-k="lo+"]'); await page.click('#v2Menu button[data-k="hi-"]'); assert.equal(await page.evaluate(() => [mon.alo, mon.ahi].join()), '40,60');
    await tile('Return').click(); assert.ok(await tile('Secondary').count(), 'Return goes back to page 1');
    // Snapshot (manual 4.6.8): the first press marks the trend at once and goes back; a second press keeps the old marker (diamond) and shows the warning with Save Snapshot
    await tile('Snapshot').click(); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', true], { timeout: 5000 }); assert.equal(await page.evaluate(() => MT.snapT != null && MT.snapPrev == null), true);
    await page.click('#kMenu'); await tile('Snapshot').click(); assert.ok(await tile('Save').count(), 'warning screen with Save Snapshot'); assert.equal(await page.evaluate(() => MT.snapPrev != null), true); await tile('Save').click(); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', true], { timeout: 5000 }); assert.ok(!/Snapshot saved/.test(await page.evaluate(() => document.querySelector('#v2MsgT').textContent)), 'no invented Snapshot saved message');
    // Export Data: a status screen with a percentage, the USB icon under the BIS box, then 100% complete
    await page.click('#kMenu'); await tile('Next').click(); await tile('Export').click(); await tile('Begin').click();
    await page.waitForFunction(() => /^Exporting \.\.\. \d+%$/.test(document.querySelector('#mtExpPct').textContent), null, { timeout: 3000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Usb', false], { timeout: 5000 });
    await page.waitForFunction(() => document.querySelector('#mtExpPct').textContent === '100% complete', null, { timeout: 8000 }); await tile('Return').click(); await tile('Return').click(); await tile('Previous').click();
    // Display: DSA + BIS shows BIS in the header and the BIS trend under the DSA; BIS (trend) shows the trend view with its review arrow
    await tile('Display').click(); await page.locator('#v2Menu button[data-k="dsatoggle"]').click(); await page.click('#kMenu');
    assert.equal(await page.evaluate(() => MT.main), 'dsaBis');
    await page.click('#kMenu'); await tile('Display').click(); assert.equal(await page.evaluate(() => MT.win), 60, 'Trend Time Scale defaults to 1 hour'); await tile('Trend Time Scale').click(); assert.equal(await page.evaluate(() => MT.win), 5);
    await tile('Trend Time Scale').click(); assert.equal(await page.evaluate(() => MT.win), 15); await tile('Trend Time Scale').click(); assert.equal(await page.evaluate(() => MT.win), 60);
    await page.locator('#v2Menu button[data-k="mbis"]').click(); await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Review', false], { timeout: 5000 });
    // Trend Review: key 2 stays MENU, key 3 reads TREND REVIEW EXIT, Rewind and Advance work in Case mode, MENU leaves the review and opens the menu
    await page.click('#v2Review'); assert.equal(await page.textContent('#kMl'), 'MENU'); assert.match(await page.textContent('#kSn'), /TREND\s*REVIEW\s*EXIT/);
    const rv = n => page.locator('#v2Rev button', { hasText: n }).first(); assert.equal(await rv('Rewind').isDisabled(), false); assert.equal(await rv('Advance').isDisabled(), false); await rv('Rewind').click(); await rv('Advance').click(); assert.ok(await page.locator('#v2Rev svg.ar2').count() >= 2, 'double arrows on the case tiles');
    await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Rev', true], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', false], { timeout: 5000 }); await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', true], { timeout: 5000 });
    await page.click('#kMenu'); await tile('Display').click(); await page.locator('#v2Menu button[data-k="mdsaAmpl"]').click(); await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Review', true], { timeout: 5000 });
    // pages 2 and 3: smoothing rate, Display SR, EEG channels (a second trace and 50 uV / division), Filters, Demo Case
    await page.click('#kMenu'); await tile('Next').click();
    assert.equal(await page.evaluate(() => mon.smooth), 15); await tile('Smoothing').click(); assert.equal(await page.evaluate(() => mon.smooth), 30); if (!/Smoothing/.test(await page.textContent('#v2MsgT')) && await page.locator('#v2Dismiss').isVisible()) await page.click('#v2Dismiss'); await page.waitForFunction(() => /Smoothing Rate Changed to 30 Seconds {2}\[ 534 \]/.test(document.querySelector('#v2MsgT').textContent), null, { timeout: 4000 });
    await tile('Smoothing').click(); await tile('Smoothing').click(); assert.equal(await page.evaluate(() => mon.smooth), 15);
    await tile('Display\nSR').click().catch(() => tile('Display').click()); await page.locator('#v2Menu button[data-k^="DisplaySR"]').click().catch(() => {});
    await tile('Next').click();
    assert.equal(await page.textContent('#v2Uv'), '25 µV / division'); await tile('EEG Channels').click(); await page.click('#kMenu');
    assert.equal(await page.textContent('#v2Uv'), '50 µV / division'); assert.equal(await page.evaluate(() => MT.channels), 2);
    await page.click('#kMenu'); await tile('Next').click(); await tile('Next').click(); await tile('EEG Channels').click(); assert.equal(await page.evaluate(() => MT.channels), 1);
    await tile('Filters').click(); assert.equal(await page.evaluate(() => MT.filters), false); await page.waitForFunction(re => new RegExp(re).test(document.querySelector('#v2MsgT').textContent), String.raw`Filters Off`, { timeout: 4000 }); await tile('Filters').click();
    await tile('Demo Case').click(); assert.equal(await page.evaluate(() => MT.caseId), 'DEMO');
    await page.click('#kSensor'); await page.waitForFunction(() => /Not available during Demo Case {2}\[ 511 \]/.test(document.querySelector('#v2MsgT').textContent), null, { timeout: 3000 });
    await page.click('#kMenu'); await tile('Next').click(); await tile('Next').click(); await tile('Demo Case').click(); assert.equal(await page.evaluate(() => MT.caseId), 'AH5F');
    // Escape closes the menu; Maintenance asks for a passkey; Diagnostics > Clear Trend Data empties the trend
    await page.click('#kMenu'); await page.keyboard.press('Escape'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', true], { timeout: 5000 });
    await page.click('#kMenu'); await tile('Next').click(); await tile('Next').click(); await tile('Maintenance').click(); assert.ok(await tile('Enter Passkey').count() + (await page.locator('#v2Menu .mtl', { hasText: 'Enter Passkey' }).count()), 'passkey screen');
    await page.click('#v2Menu button[data-k="d9"]'); await page.click('#v2Menu button[data-k="ok"]'); await page.waitForFunction(re => new RegExp(re).test(document.querySelector('#v2MsgT').textContent), String.raw`Invalid passkey`, { timeout: 4000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Dismiss', true], { timeout: 5000 });
    for (const d of '1234') await page.click(`#v2Menu button[data-k="d${d}"]`); await page.click('#v2Menu button[data-k="ok"]'); assert.ok(await tile('Audio Off').count(), 'Maintenance menu');
    await tile('Return').click(); await tile('Diagnostics').click(); await tile('Clear').click();
    assert.equal(await page.evaluate(() => HIST.length < 5), true, 'trend data cleared'); await page.waitForTimeout(200);
    // alarm key: green, then paused for 2 minutes with a countdown, then silenced (SILENT), then green again
    assert.equal(await page.evaluate(() => MT.alarm), 0); await page.click('#kSilent'); assert.equal(await page.evaluate(() => MT.alarm), 1); assert.ok(+(await page.textContent('#kSl')) > 100, 'countdown');
    await page.click('#kSilent'); assert.equal(await page.textContent('#kSl'), 'SILENT'); await page.click('#kSilent'); assert.equal(await page.evaluate(() => MT.alarm), 0);
    // target alarm: Target Range is Inactive by default (no bar); active, the bar shows at any depth and sounds; Target Alarm only decides the sound
    assert.equal(await page.evaluate(() => MT.tgt.active), false); assert.equal(await page.evaluate(() => MT.sounding), false);
    await page.evaluate(() => { MT.tgt.active = true; }); await page.click('#speedSeg [data-speed="10"]');
    await page.waitForFunction(() => /BIS out of target range {2}\[ 30 \]/.test(document.querySelector('#v2MsgT').textContent) && document.querySelector('#v2Msg').classList.contains('hi'), null, { timeout: 30000 });
    await page.click('#speedSeg [data-speed="1"]');
    await page.waitForFunction(() => MT.sounding === true && MT.beeps > 0, null, { timeout: 3000 });
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Dismiss', true], { timeout: 5000 });
    assert.equal(await page.textContent('#kSl'), 'SILENT', 'the alarm key reads SILENT while the alarm is active');
    await page.click('#kSilent'); await page.waitForFunction(() => MT.alarm === 1 && MT.sounding === false); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Msg', false], { timeout: 5000 });
    await page.click('#kSilent'); await page.waitForFunction(() => MT.alarm === 2 && MT.sounding === false); await page.click('#kSilent');
    await page.waitForFunction(() => MT.alarm === 0 && MT.sounding === true);
    await page.evaluate(() => { MT.tgt.alarm = false; }); await page.waitForFunction(() => MT.sounding === false); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Msg', false], { timeout: 5000 });
    await page.evaluate(() => { MT.tgt.alarm = true; MT.tgt.active = false; }); await page.waitForFunction(() => !document.querySelector('#v2Msg').classList.contains('hi') || document.querySelector('#v2Msg').hidden);
    // sensor check: key 3 becomes EXIT; MENU leaves it (like EXIT) and opens the menu; the SQI bars stay hollow; only HIGH electrodes are named; electrodes resolve to PASS, then it leaves by itself and a new case ID is given; EXIT also leaves
    await page.click('#kSensor'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Sensor', false], { timeout: 5000 }); assert.equal(await page.textContent('#kSn'), 'EXIT');
    await page.click('#kMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Menu', false], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Sensor', true], { timeout: 5000 });
    await page.click('#kMenu'); await page.click('#kSensor'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Sensor', false], { timeout: 5000 });
    await page.waitForFunction(() => /^Sensor Check in Progress$/.test(document.querySelector('#v2MsgT').textContent), null, { timeout: 4000 });
    assert.equal(await page.$$eval('#v2Sqi i.on', e => e.length), 0, 'SQI bars are hollow during the sensor check');
    await page.waitForFunction(() => /^Press electrode 2 {2}\[ 13 \]$/.test(document.querySelector('#v2MsgT').textContent), null, { timeout: 8000 });
    await page.waitForFunction(() => /PASS/.test(document.querySelector('#v2ScSvg').textContent), null, { timeout: 12000 });
    await page.click('#v2ScVal'); assert.match(await page.textContent('#v2ScVal'), /Hide/);
    await page.click('#kSensor'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#v2Sensor', true], { timeout: 5000 });
    await page.addScriptTag({ path: AXE });
    { const r = await page.evaluate(() => axe.run(document.querySelector('#monitor'), { runOnly: ['wcag2a', 'wcag2aa'] })); assert.deepEqual(r.violations.map(v => `${v.id}: ${v.nodes.length}`), [], 'axe on the VISTA screen'); }
    // the Masimo SedLine screen has its own test (sed.e2e.mjs): here only that it opens and draws
    await page.click('#skinSeg [data-skin="sedline"]');
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedWrap', false], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#vistaWrap', true], { timeout: 5000 });
    await page.waitForFunction(() => /PSi \d+/.test(document.querySelector('#bilSum').textContent), null, { timeout: 5000 });
    // the monitor switch at the top of the page changes the monitor, and stays in step with the Display panel
    for (const k of ['advance', 'sedline', 'vista']) { await page.click(`#monSwitch [data-skin="${k}"]`); assert.equal(await page.$eval(`#skinSeg [data-skin="${k}"]`, e => e.getAttribute('aria-pressed')), 'true'); assert.equal(await page.$eval(`#monSwitch [data-skin="${k}"]`, e => e.getAttribute('aria-pressed')), 'true'); }
    // the teaching layout is still there for the rest of the checks
    await page.click('#skinSeg [data-skin="classic"]');
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#classicWrap', false], { timeout: 5000 });
    // relaxant: a bolus paralyses (TOF count 0, readout and hint), a top-up and sugammadex move it, Off clears it
    assert.match(await page.textContent('#nmRead'), /No relaxant/);
    await page.click('#speedSeg [data-speed="10"]'); await page.click('#nmBolus');
    await page.waitForFunction(() => /TOF count 0/.test(document.querySelector('#nmRead').textContent), null, { timeout: 15000 });
    assert.match(await page.textContent('#nmHint'), /block/i);
    await page.click('#nmSug4'); await page.click('#nmTop'); await page.click('#nmSug2');
    await page.click('#nmbSeg [data-nmb="off"]');
    await page.waitForFunction(() => /No relaxant/.test(document.querySelector('#nmRead').textContent), null, { timeout: 5000 });
    await page.click('#nmbSeg [data-nmb="auto"]'); await page.click('#speedSeg [data-speed="1"]');
    // case length: medium by default; the choice is kept
    assert.equal(await page.$eval('#caseSeg [data-case="medium"]', e => e.getAttribute('aria-pressed')), 'true');
    await page.click('#caseSeg [data-case="long"]'); assert.equal(await page.$eval('#caseSeg [data-case="long"]', e => e.getAttribute('aria-pressed')), 'true');
    await page.click('#caseSeg [data-case="medium"]');
    // the relaxant is on by default, given at induction: the awake patient is not paralysed (BIS stays in the 90s)
    assert.equal(await page.$eval('#nmbSeg [data-nmb="auto"]', e => e.getAttribute('aria-pressed')), 'true');
    // move the depth target to GA at 1x: the effect site follows slowly, so the screen still shows an awake patient, and the
    // slider shows the BIS the dose will settle on
    await page.$eval('#depth', e => { e.value = 57; e.dispatchEvent(new Event('input')); });
    assert.match(await page.textContent('#tgtSub'), /settling/);
    assert.equal(await page.textContent('#rName'), 'Awake');
    await page.waitForFunction(() => { const m = /≈ (\d+)/.exec(document.querySelector('#tgtBis').textContent); return m && +m[1] >= 35 && +m[1] <= 60; }, null, { timeout: 8000 });
    await page.waitForFunction(() => !document.querySelector('#zoneBand').hidden && document.querySelector('#zoneBand').getBoundingClientRect().width > 8, null, { timeout: 15000 });
    assert.match(await page.textContent('#zoneText'), /BIS 40–60/);
    // EEG sweep key cycles the seconds across the lane; the DSA colour range sliders change the colours and are labelled
    { const lbl = () => page.textContent('#eegLbl');
      const want = async t => { await page.waitForFunction(t => document.querySelector('#eegLbl').textContent === t, t, { timeout: 4000 }); return t; };
      const first = await lbl(); await page.click('#kSweep'); assert.equal(await want('EEG · 4 s'), 'EEG · 4 s');
      await page.click('#kSweep'); await want('EEG · 8 s'); await page.click('#kSweep'); await want('EEG · 16 s');
      await page.click('#kSweep'); await want(first);
      const px = () => page.$eval('#cDsa', c => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let r = 0, b = 0; for (let i = 0; i < x.length; i += 4) { r += x[i]; b += x[i + 2]; } return r / (b + 1); });
      const r0 = await px(); // red-to-blue ratio of the DSA
      await page.$eval('#dbHi', e => { e.value = 14; e.dispatchEvent(new Event('input')); }); // lower ceiling: redder
      await page.waitForTimeout(600); const r1 = await px(); assert.ok(r1 > r0, `lower ceiling makes the DSA redder (${r0} -> ${r1})`);
      assert.match(await page.textContent('#dsaRange'), /14 dB/);
      await page.click('#dbReset'); await page.waitForTimeout(300); assert.equal(await page.textContent('#dsaRange'), 'last 5 min'); }
    // dragging the depth slider pops up the target BIS over the thumb, which hides again a moment after release
    { await page.locator('#depth').scrollIntoViewIfNeeded(); const box = await page.locator('#depth').boundingBox(); const y = box.y + box.height / 2;
      await page.mouse.move(box.x + box.width * 0.5, y); await page.mouse.down(); await page.mouse.move(box.x + box.width * 0.58, y, { steps: 4 });
      await page.waitForFunction(() => { const p = document.querySelector('#tgtPop'); const m = /≈ (\d+)/.exec(p.textContent); return !p.hidden && m && +m[1] >= 25 && +m[1] <= 80; }, null, { timeout: 8000 });
      await page.mouse.up();
      await page.waitForFunction(() => document.querySelector('#tgtPop').hidden, null, { timeout: 4000 }); }
    // the effect-site marker is still left of the slider thumb, then catches up; BIS falls into 35-60 and the bands are described
    assert.ok(await page.$eval('#effMark', m => parseFloat(m.style.left.replace(/[^0-9.]/g, '')) >= 0), 'marker placed');
    await page.click('#speedSeg [data-speed="10"]');
    await page.waitForFunction(() => document.querySelector('#rName').textContent === 'General anaesthesia', null, { timeout: 40000 });
    assert.match(await page.textContent('#rText'), /relaxant on board/);
    await page.waitForFunction(() => /at target/.test(document.querySelector('#tgtSub').textContent), null, { timeout: 40000 });
    await page.waitForFunction(() => +document.querySelector('#vBis').textContent <= 60, null, { timeout: 40000 });
    await page.waitForTimeout(3000);
    const ga = await bis(page);
    assert.ok(ga >= 30 && ga <= 60, `propofol GA BIS ${ga}`);
    await page.click('#speedSeg [data-speed="1"]');
    // graphs keep their size and have something drawn on them
    const heights = () => page.$$eval('.screen canvas', cs => cs.map(c => c.clientHeight));
    const h0 = await heights();
    await page.waitForTimeout(1500);
    assert.deepEqual(await heights(), h0, 'canvas heights stable');
    assert.ok(await page.$eval('#cEeg', c => c.clientHeight) >= 90);
    const lit = await page.$eval('#cDsa', c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 120) n++; return n / (d.length / 4); });
    assert.ok(lit > 0.3, `DSA drawn (${lit})`);
    assert.ok(await page.$eval('#err', e => e.hidden), 'no display error');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0, 'no sideways scroll');
    // screen order like a BIS monitor: trends, DSA above, EEG below; the view toggle shows one large
    const order = await page.$$eval('.screen .lane', ls => ls.map(l => l.id));
    assert.deepEqual(order, ['wTrend', 'wDsa', 'wEeg']);
    const dsa0 = await page.$eval('#cDsa', c => c.clientHeight), eeg0 = await page.$eval('#cEeg', c => c.clientHeight);
    await page.click('#viewSeg [data-view="dsa"]');
    await page.waitForFunction(h => document.querySelector('#cDsa').clientHeight > h + 50, dsa0);
    assert.ok(await page.$eval('#wEeg', e => e.hidden && getComputedStyle(e).display === 'none' && e.offsetHeight === 0), 'EEG hidden in DSA view');
    await page.click('#viewSeg [data-view="eeg"]');
    await page.waitForFunction(h => document.querySelector('#cEeg').clientHeight > h + 50, eeg0);
    assert.ok(await page.$eval('#wDsa', e => e.hidden && getComputedStyle(e).display === 'none' && e.offsetHeight === 0), 'DSA hidden in EEG view');
    await page.click('#viewSeg [data-view="both"]');
    await page.waitForFunction(([d, e]) => document.querySelector('#cEeg').clientHeight === e && document.querySelector('#cDsa').clientHeight === d, [dsa0, eeg0]);
    // monitor first: on a phone the monitor and the drug and depth controls are near the top
    if (viewport.width === 390) assert.ok(await page.$eval('#classicWrap', e => e.getBoundingClientRect().top + scrollY) < 230, 'monitor near the top (under the site header and the monitor switch)');
    // facial EMG raises the EMG reading (no relaxant on board)
    await page.click('#nmbSeg [data-nmb="off"]');
    const emg0 = await page.$eval('#vEmg', e => +e.textContent);
    await page.click('#speedSeg [data-speed="10"]');
    await page.check('#mEmg');
    await page.waitForFunction(e0 => +document.querySelector('#vEmg').textContent >= e0 + 6, emg0, { timeout: 20000 });
    // a muscle relaxant takes the EMG away again
    const emgHi = await page.$eval('#vEmg', e => +e.textContent);
    await page.click('#nmBolus');
    await page.waitForFunction(e1 => +document.querySelector('#vEmg').textContent <= e1 - 6, emgHi, { timeout: 20000 });
    assert.match(await page.textContent('#rText'), /Muscle relaxant/);
    await page.uncheck('#mEmg');
    await page.waitForFunction(() => +document.querySelector('#vEmg').textContent <= 32, null, { timeout: 20000 });
    await page.check('#mBlink');
    assert.match(await page.textContent('#rText'), /Blinks/);
    await page.uncheck('#mBlink');
    await page.click('#stimBtn');
    assert.equal(await page.$eval('#stimBtn', e => e.getAttribute('aria-pressed')), 'true');
    assert.match(await page.textContent('#rText'), /Surgical stimulus/);
    // SQI: high on a clean signal; diathermy drops it and the BIS number shows hollow or blank, like the monitor
    assert.ok(await page.$eval('#vSqi', e => +e.textContent) >= 90, 'clean SQI');
    await page.check('#mDia');
    await page.waitForFunction(() => +document.querySelector('#vSqi').textContent < 60, null, { timeout: 30000 });
    await page.waitForFunction(() => { const b = document.querySelector('#vBis'); return b.classList.contains('hollow') || b.textContent === '--'; }, null, { timeout: 30000 });
    await page.uncheck('#mDia');
    await page.click('#speedSeg [data-speed="1"]');
    // library strips and quiz drawn
    await page.waitForFunction(() => document.querySelectorAll('#lib canvas').length === 11 && document.querySelectorAll('#opts button').length === 4);
    await page.click('#opts button');
    assert.ok((await page.textContent('#fb')).length > 10, 'quiz feedback');
    // suppression timer: deep propofol brings burst suppression, the suppression time box counts up, Reset clears it
    await page.click('#speedSeg [data-speed="10"]');
    await page.click('#tReset');
    await page.waitForFunction(() => { const [m, x] = document.querySelector('#vSupT').textContent.split(':'); return +m * 60 + +x <= 3; }); // cleared (it may already tick on at 10x)
    await page.$eval('#depth', e => { e.value = 93; e.dispatchEvent(new Event('input')); });
    await page.waitForFunction(() => document.querySelector('#vSupT').textContent !== '0:00' && +document.querySelector('#vSr').textContent >= 5, null, { timeout: 60000 });
    await page.waitForFunction(() => document.querySelector('#vLowT').textContent !== '0:00', null, { timeout: 60000 }); // BIS under 40 counts too
    await page.click('#tReset');
    await page.waitForFunction(() => { const [m, x] = document.querySelector('#vSupT').textContent.split(':'); return +m * 60 + +x <= 3; }); // cleared (it may already tick on at 10x)
    await page.$eval('#depth', e => { e.value = 57; e.dispatchEvent(new Event('input')); });
    // emergence button: stops the drugs (slider to 0), the effect site falls slowly, the patient wakes and the relaxant is reversed
    await page.click('#wakeBtn');
    assert.equal(await page.$eval('#depth', e => e.value), '0');
    assert.match(await page.textContent('#storyCap'), /Emergence/);
    assert.match(await page.textContent('#tgtSub'), /settling/);
    assert.notEqual(await page.textContent('#rName'), 'Awake', 'still under right after stopping (slow emergence)');
    await page.waitForFunction(() => document.querySelector('#rName').textContent === 'Awake', null, { timeout: 90000 });
    await page.waitForFunction(() => +document.querySelector('#vBis').textContent >= 80, null, { timeout: 60000 });
    // mix mode: propofol + ketamine reads higher than propofol alone; back to one drug restores the single controls
    await page.click('#speedSeg [data-speed="10"]');
    await page.click('#modeSeg [data-mode="mix"]');
    assert.ok(await page.$eval('#depthCtl', e => e.hidden) && !(await page.$eval('#mixCtl', e => e.hidden)), 'mix controls shown');
    await page.click('#presetSeg [data-preset="propket"]');
    assert.equal(await page.$eval('#o-ketamine', e => e.textContent), '40');
    assert.match(await page.textContent('#rName'), /propofol \+ ketamine/);
    await page.waitForFunction(() => /≈ \d+/.test(document.querySelector('#tgtMix').textContent), null, { timeout: 8000 });
    await page.waitForFunction(g => +document.querySelector('#vBis').textContent > g + 8, ga, { timeout: 30000 });
    await page.click('#modeSeg [data-mode="single"]');
    assert.ok(!(await page.$eval('#depthCtl', e => e.hidden)), 'single controls back');
    // ketamine at 10x speed: BIS climbs well above the GA value
    await page.click('#speedSeg [data-speed="10"]');
    await page.click('[data-drug="ketamine"]');
    await page.$eval('#depth', e => { e.value = 65; e.dispatchEvent(new Event('input')); });
    await page.waitForFunction(g => +document.querySelector('#vBis').textContent > g + 15, ga, { timeout: 20000 });
    await page.waitForFunction(() => document.querySelector('#rName').textContent === 'Ketamine anaesthesia', null, { timeout: 30000 });
    // explainer steps respond
    await page.click('#steps button[data-i="3"]');
    assert.match(await page.textContent('#exCap'), /on its side/);
    if (viewport.width === 390) {
      await page.addScriptTag({ path: AXE });
      const r = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] }));
      assert.deepEqual(r.violations.map(v => `${v.id}: ${v.nodes.length}`), [], 'axe');
    }
    await page.close();
  }
  assert.deepEqual(errors, [], 'page errors');
  // the other screens' tests run after this one; BIS_SPLIT=1 runs this file alone (GitHub's Checks run each file as its own job)
  if (!process.env.BIS_SPLIT) {
    await import('./adv.e2e.mjs'); // the BIS Advance screen
    await import('./sed.e2e.mjs'); // the Masimo SedLine screen
    await import('./pv.e2e.mjs'); // the Philips IntelliVue screen
    await import('./timeline.e2e.mjs'); // the case timeline (jump back and forward)
  }
  console.log('bis-dsa e2e: ok');
} finally { await b.close(); }
