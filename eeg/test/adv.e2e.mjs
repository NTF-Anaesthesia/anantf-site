// Browser test of the BIS Advance screen (the 'advance' skin): channel modes, numeric panels, trends, the real menu tree, dialogs,
// alarms (bar, list, pill, sound), messages, sensor check, snapshot, chart view, case review, demo mode. Run with a static server
// on port 8080: node eeg/test/adv.e2e.mjs  (also run by e2e.mjs)
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';

const AXE = new URL('../../tools/vendor/axe.min.js', import.meta.url).pathname;
const BASE = `http://localhost:${process.env.PORT || 8080}/eeg/`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {});
const errors = [];
const txt = (p, sel) => p.$eval(sel, e => e.textContent.trim());
try {
  for (const [viewport, deviceScaleFactor] of [[{ width: 1100, height: 900 }, 1], [{ width: 390, height: 844 }, 2]].filter(([v]) => !process.env.BIS_VIEW || (process.env.BIS_VIEW === 'phone') === (v.width === 390))) { // BIS_VIEW=phone or desktop runs one size (the Checks run each as its own job)
    const phone = viewport.width === 390;
    const page = await b.newPage({ viewport, deviceScaleFactor });
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push(m.text()); });
    await page.goto(BASE);
    await page.click('#skinSeg [data-skin="advance"]');
    // start-up: modal messages first (then the sensor check by itself); Skip start-up under the screen starts the case with 35 minutes of earlier trend
    assert.equal(await page.evaluate(() => !ADV.boot && ADV.layout[4]), 'dsa,asym,eeg', 'the monitor opens on the main screen (DSA, ASYM and EEG), not the start-up'); await page.click('#advBootBtn');
    assert.ok(await page.evaluate(() => !!ADV.boot), 'Replay start-up shows the boot messages');
    assert.deepEqual(await page.evaluate(() => ADV_BOOT.map(x => x[0])), ['Connect BISx to start monitoring', 'Initializing BISx', 'Connect sensor to start monitoring']); // the first two are brief; a slow machine can miss them, so only the last is awaited
    await page.waitForFunction(() => /Connect sensor to start monitoring/.test(document.querySelector('#advBoot').textContent) && document.querySelector('#advBoot [data-a="alarms"]'), null, { timeout: 5000 });
    await page.waitForFunction(() => ADV.sensor && document.querySelector('#advOv .th'), null, { timeout: 6000 }); // the sensor check opens by itself
    await page.click('#advSkip'); assert.equal(await page.evaluate(() => ADV.boot), null); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advBoot', true], { timeout: 5000 });
    assert.ok(await page.evaluate(() => ADV.t0 < simT - 1800 && ADV.pre.L.length >= 400 && ADV.pre.R.length >= 400), 'the case starts with 35 minutes of earlier trend');
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advWrap', false], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#vistaWrap', true], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedWrap', true], { timeout: 5000 });
    // the screen is 16:10 and scales as a unit
    { const r = await page.$eval('#advS', e => { const q = e.getBoundingClientRect(); return q.width / q.height; }); assert.ok(Math.abs(r - 1.6) < 0.02, `16:10 screen (${r})`); }
    assert.ok(await page.evaluate(() => document.fonts.check('16px Selawik')), 'bundled Selawik font loads');
    // two BIS panels (bilateral sensor by default), awake: both numbers in the 80s-90s, SQI bars lit, EMG bar, canvas drawn
    await page.waitForFunction(() => /^\d+$/.test(document.querySelector('#aBisL').textContent) && /^\d+$/.test(document.querySelector('#aBisR').textContent), null, { timeout: 8000 });
    assert.ok(+(await txt(page, '#aBisL')) >= 80 && +(await txt(page, '#aBisR')) >= 80, 'awake BIS on both sides');
    assert.ok(await page.$$eval('#aSqiL i.on', e => e.length) >= 4, 'SQI bars');
    assert.match(await txt(page, '#aStL'), /^\d\d:\d\d$/); assert.match(await txt(page, '#aSefL'), /^\d+Hz$/); assert.match(await txt(page, '#aMfL'), /^\d+Hz$/);
    assert.match(await txt(page, '#aBcL'), /^\d+$/);
    { const lit = await page.$eval('#advCv', c => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < x.length; i += 4) if (x[i] + x[i + 1] + x[i + 2] > 60) n++; return n / (x.length / 4); }); assert.ok(lit > 0.03, `trend canvas drawn (${lit})`); }
    assert.match(await txt(page, '#bilSum'), /L: BIS \d+.*R: BIS \d+/);
    // top bar: date DD MMM YYYY in capitals, 24 h time, alarm pill, ID link; message bar starts with the two latching messages
    assert.match(await txt(page, '#aDate'), /^\d{1,2} [A-Z]{3} \d{4}$/); assert.match(await txt(page, '#aTime'), /^\d\d:\d\d$/);
    await page.evaluate(() => { ADV.msgI = 0; ADV.msgT = Date.now() + 60000; }); await page.waitForTimeout(150);
    assert.equal(await txt(page, '#aMsgT'), 'Audio reminder is off'); assert.equal(await txt(page, '#aMbd'), '2'); assert.match(await txt(page, '#aMc'), /^1\/2$/);
    { const t = await page.evaluate(() => { const d = ADV.d; return { bis: d.bis.filter(p => p[1] != null).length, asym: d.asym.filter(p => p[1] != null).length }; }); assert.ok(t.bis >= 200 && t.asym >= 200, `trends start filled (${JSON.stringify(t)})`); }
    await page.click('#aNext'); await page.evaluate(() => { ADV.msgT = Date.now() + 60000; }); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Institutional settings restored'], { timeout: 5000 }); await page.click('#aCheck'); await page.waitForFunction(() => document.querySelector('#aMbd').textContent === '1');
    // L | R pill: the BIS trend, the SEF and MF panel and the badge follow the side
    assert.equal(await page.evaluate(() => ADV.hemi), 'L'); await page.click('#aLr'); assert.equal(await page.evaluate(() => ADV.hemi), 'R'); assert.equal(await txt(page, '#aBadgeLow'), 'R');
    await page.click('#aLr');
    // graph / chart toggle: the chart is a table with the real column heads
    await page.click('#aGt'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advChart', false], { timeout: 5000 });
    assert.match(await txt(page, '#advChart thead'), /Time\s*BIS L\s*BIS R\s*EMG L dB\s*EMG R dB\s*SR L %\s*SR R %\s*ASYM %\s*SQI L %\s*SQI R %/);
    assert.ok(await page.$$eval('#advChart tbody tr', e => e.length) >= 2, 'chart rows'); assert.match(await txt(page, '#advChart .hdr'), /BEGIN: \d+ [A-Z]{3} \d{4} \d\d:\d\d:\d\d.*Chart Interval: 1 min/); assert.ok(await page.$$eval('#advChart tbody tr', e => e.length) >= 30, 'the chart lists the case back to its start');
    await page.click('#aGt'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advChart', true], { timeout: 5000 });
    // the main menu: six tiles in the real order; ALARMS is dimmed while monitoring; Escape closes
    await page.click('#aMenu'); assert.equal(await page.$eval('#advOv .mm', e => !!e), true);
    assert.deepEqual(await page.$$eval('#advOv .mm button', bs => bs.map(x => x.textContent.replace(/\s+/g, ' ').trim())), ['ALARMS', 'DISPLAY SETTINGS', 'SETTINGS & MAINTENANCE', 'DOWNLOAD', 'INFO', 'CASE REVIEW']);
    assert.deepEqual(await page.$$eval('#advOv .mm button[aria-disabled="true"]', bs => bs.map(x => x.textContent.trim())), ['ALARMS', 'CASE REVIEW'], 'ALARMS and CASE REVIEW are dimmed during live monitoring');
    await page.click('#advOv .mm button[data-a="m_alarms"]', { force: true }); assert.equal(await page.$$eval('#advOv .dlg', e => e.length), 0, 'a dimmed tile does nothing');
    await page.click('#aMenu'); assert.equal(await page.$$eval('#advOv .mm', e => e.length), 0, 'the hamburger stays active over the menu and toggles it');
    await page.click('#aMenu'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('Escape'); assert.equal(await page.$$eval('#advOv .mm', e => e.length), 0, 'Escape closes the menu wherever the focus is');
    // Display Settings: the 4-channel layouts; choosing BIS, DSA, ASYM redraws with the DSA pair and the ASYM strip between; Secondary
    await page.click('#aMenu'); await page.click('[data-a="m_display"]');
    assert.deepEqual(await page.$$eval('#advOv .rail.lay button span', e => e.map(x => x.textContent)), ['BIS, EEG', 'BIS', 'BIS, ASYM, EEG', 'BIS, DSA, ASYM', 'DSA, ASYM, EEG', 'EEG', 'DSA, ASYM']);
    assert.equal(await page.$eval('[data-a="dapply"]', e => e.disabled), true);
    await page.click('[data-v="bis,dsa,asym"]'); assert.equal(await page.$eval('[data-a="dapply"]', e => e.disabled), false);
    await page.selectOption('#advSecSel', 'sr'); await page.click('[data-a="dapply"]');
    assert.equal(await page.evaluate(() => ADV.layout[4] + '|' + ADV.sec), 'bis,dsa,asym|sr'); assert.match(await txt(page, '#advHdr'), /DSA\s*&\s*ASYM/);
    await page.evaluate(() => { const L = advLay(); if (!(L.rect.dsaL && L.rect.asymP && L.rect.dsaR)) throw new Error('layout'); });
    // the BIS time scale, the secondary trend and the EEG selectors are real menus
    await page.click('#aWin'); assert.deepEqual(await page.$$eval('#advPop button', e => e.map(x => x.textContent)), ['1 h', '6 h', '12 h', '24 h']); await page.click('#advPop button:nth-child(2)');
    assert.equal(await page.evaluate(() => ADV.win), 360);
    await page.click('#aSecB'); assert.deepEqual(await page.$$eval('#advPop button', e => e.map(x => x.textContent)), ['EMG', 'SR', 'SQI', 'NONE', 'BURST', 'BIS R']); await page.keyboard.press('Escape');
    await page.evaluate(() => { ADV.layout[4] = 'bis,asym,eeg'; ADV.sec = 'emg'; ADV.win = 60; advRelayout(); });
    await page.click('#aUv'); assert.deepEqual(await page.$$eval('#advPop button', e => e.map(x => x.textContent)), ['2 µV/mm', '5 µV/mm', '10 µV/mm']); await page.keyboard.press('Escape');
    await page.click('#aSw'); assert.deepEqual(await page.$$eval('#advPop button', e => e.map(x => x.textContent)), ['6.25 mm/sec', '12.5 mm/sec', '25 mm/sec', '50 mm/sec']); await page.click('#advPop button:nth-child(4)');
    assert.equal(await page.evaluate(() => ADV.sweep), 50); await page.click('#aSw'); await page.click('#advPop button:nth-child(3)');
    // Alarm Settings: BIS range 40-60 off by default; enable, APPLY; label shows the range; the message "BIS alarm enabled"
    await page.click('#aAlarms'); assert.match(await txt(page, '#advOv .rail'), /BIS\s*\[40 - 60\]\s*OFF/); assert.equal(await txt(page, '#advOv .drum .cu'), '40');
    await page.click('[data-a="dtog"][data-v="bis"]'); await page.click('[data-a="dapply"]');
    await page.waitForFunction(() => document.querySelector('#aBisLblL').textContent.replace(/\s+/g, '') === 'BIS40-60', null, { timeout: 5000 }); assert.equal(await page.evaluate(() => ADV.msgs.some(m => m.text === 'BIS alarm enabled')), true);
    assert.equal(await page.evaluate(() => mon.alo + '-' + mon.ahi), '40-60');
    // awake BIS is above 60: after 10 s the BIS ALARM raises (red bar, list, red digit box, sound), the pill pauses then silences
    await page.click('#speedSeg [data-speed="10"]');
    await page.waitForFunction(() => !document.querySelector('#aAbar').hidden && /BIS ALARM/.test(document.querySelector('#aAl1').textContent), null, { timeout: 20000 });
    await page.click('#speedSeg [data-speed="1"]');
    assert.ok(await page.$eval('#aAbar', e => e.classList.contains('hi')), 'high priority is red'); assert.equal(await txt(page, '#aAl2'), 'BIS above defined range');
    assert.equal(await page.$eval('#aBisL', e => e.classList.contains('box')), true, 'digits on a red box');
    await page.waitForFunction(() => ADV.sounding === true && ADV.beeps > 0, null, { timeout: 4000 });
    await page.click('#aAcnt'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aAlist', false], { timeout: 5000 }); assert.match(await txt(page, '#aAlist'), /START\s*ALARM\s*\d\d:\d\d\s*BIS ALARM/); await page.click('#aAcnt');
    await page.click('#aSilent'); assert.equal(await page.evaluate(() => ADV.audio), 1); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Alarm Pause Mode On'], { timeout: 5000 }); assert.match(await txt(page, '#aPillT'), /^[12]:\d\d$/); await page.waitForFunction(() => ADV.sounding === false, null, { timeout: 5000 });
    await page.click('#aSilent'); assert.equal(await txt(page, '#aPillT'), 'SILENT'); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Alarm Silent Mode On'], { timeout: 5000 }); assert.equal(await page.evaluate(() => ADV.msgs.filter(m => /^Alarm (Pause|Silent) Mode/.test(m.text)).length), 1, 'only the newest audio message is kept'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aAbar', false], { timeout: 5000 });
    await page.click('#aDrop'); assert.equal(await page.$$eval('#aCtl button', e => e.length), 4); await page.click('#aCt0'); assert.equal(await page.evaluate(() => ADV.audio), 0); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Alarm Silent Mode Off'], { timeout: 5000 });
    // alarm off again: bar goes
    await page.click('#aAlarms'); await page.click('[data-a="dtog"][data-v="bis"]'); await page.click('[data-a="dapply"]');
    await page.waitForFunction(() => document.querySelector('#aAbar').hidden, null, { timeout: 5000 });
    // Snapshot: dialog with a name; OK makes the message
    await page.click('#aSnap'); assert.equal(await page.$eval('#advSnapName', e => e.value), 'Snapshot 1'); await page.click('[data-a="dok"]');
    assert.equal(await page.evaluate(() => ADV.msgs.some(m => m.text === 'Snapshot created')), true); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Snapshot created'], { timeout: 5000 });
    // Settings and maintenance: smoothing rate drives the monitor; logs without USB say so; Administrator mode asks for a password
    await page.click('#aMenu'); await page.click('[data-a="m_settings"]'); await page.click('[data-a="dsel"][data-v="advanced"]'); await page.click('[data-a="st_smooth"][data-v="10"]');
    assert.equal(await page.evaluate(() => mon.smooth), 10); assert.equal(await page.evaluate(() => ADV.msgs.some(m => m.text === 'Smoothing rate changed to 10 seconds')), true); await page.waitForFunction(([sel, t]) => document.querySelector(sel).textContent.replace(/\s+/g, ' ').trim() === t, ['#aMsgT', 'Smoothing rate changed to 10 seconds'], { timeout: 5000 });
    await page.click('[data-a="st_nch"][data-v="1"]'); assert.equal(await page.evaluate(() => ADV.nch[4]), 2, 'EEG Trends are staged until APPLY'); await page.click('[data-a="eeg_apply"]'); assert.equal(await page.evaluate(() => ADV.nch[4]), 1); await page.click('[data-a="st_nch"][data-v="2"]'); await page.click('[data-a="eeg_apply"]'); assert.equal(await page.evaluate(() => ADV.nch[4]), 2);
    await page.click('[data-a="dsel"][data-v="logs"]'); await page.click('[data-a="st_dl"]'); assert.equal(await page.evaluate(() => ADV.msgs.some(m => m.text === 'Export failed - USB drive removed')), true);
    await page.click('[data-a="dsel"][data-v="advanced"]'); await page.click('[data-a="st_admin"]'); await page.fill('#advPw', 'x'); await page.click('[data-a="dok"]'); assert.match(await txt(page, '#advOv [role="alert"]'), /Incorrect/);
    await page.fill('#advPw', '1234'); await page.click('[data-a="dok"]'); assert.equal(await page.evaluate(() => ADV.admin), true); assert.match(await txt(page, '#advOv .pane'), /Erase Trend Data/); await page.click('[data-a="st_logout"]');
    await page.click('[data-a="st_reset"]'); assert.equal(await page.evaluate(() => mon.smooth), 15); await page.click('[data-a="dclose"]');
    // Info help and Download without a USB drive
    await page.click('#aInfo'); await page.click('[data-a="dsel"][data-v="ASYM"]'); assert.match(await txt(page, '#advOv .help'), /Asymmetry/); await page.click('[data-a="dclose"]');
    await page.click('#aMenu'); await page.click('[data-a="m_download"]'); await page.click('[data-a="dl_rec"]'); await page.click('[data-a="dclose"]');
    // ID: a read-only window that closes itself
    await page.click('#aId'); assert.match(await txt(page, '#advOv .dlg'), /Case ID\s*[A-Z0-9]{4}/); assert.equal(await page.$$eval('#advOv .dlg input', e => e.length), 0); await page.click('[data-a="dclose"]');
    // sensor check: window with the six bilateral electrodes that resolve from the live SQI, closes itself and gives a new case ID
    const id0 = await page.evaluate(() => ADV.caseId);
    await page.click('#aSensor'); assert.match(await txt(page, '#advOv .th'), /SENSOR TYPE: BILATERAL/); assert.match(await page.$eval('#advOv svg.sk', e => e.textContent), /LT.*LE.*G.*C.*RE.*RT/);
    await page.waitForFunction(() => !document.querySelector('#advOv .dlg'), null, { timeout: 15000 }); assert.equal(await page.evaluate(() => ADV.caseId), id0, 'a check mid-case keeps the case ID');
    // sensor disconnected (Simulate row): yellow bar, BIS blank, POOR CONTACT in a sensor check
    await page.click('[data-sim="disc"]'); await page.waitForFunction(() => /SENSOR DISCONNECTED/.test(document.querySelector('#aAl1').textContent) && document.querySelector('#aBisL').textContent === '', null, { timeout: 5000 });
    assert.equal(await txt(page, '#aAl2'), 'Connect sensor or cable'); await page.click('#aSensor'); await page.waitForFunction(() => /POOR CONTACT/.test(document.querySelector('#advOv svg.sk').textContent), null, { timeout: 10000 });
    await page.waitForFunction(() => /TEMPORARILY UNABLE TO MEASURE ELECTRODES/.test(document.querySelector('#aAl1').textContent), null, { timeout: 9000 }); await page.click('[data-a="sc_close"]'); await page.click('[data-sim="disc"]');
    await page.waitForFunction(() => !document.querySelector('#aAbar') || document.querySelector('#aAbar').hidden || !/SENSOR DISCONNECTED/.test(document.querySelector('#aAl1').textContent), null, { timeout: 5000 });
    await page.click('[data-sim="expired"]'); await page.waitForFunction(() => /SENSOR EXPIRED/.test(document.querySelector('#aAl1').textContent), null, { timeout: 5000 }); await page.click('[data-sim="expired"]');
    await page.click('[data-sim="batt"]'); await page.waitForFunction(() => /BATTERY LOW/.test(document.querySelector('#aAl1').textContent), null, { timeout: 5000 });
    assert.equal(await txt(page, '#aBatT'), '10%'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aBolt', true], { timeout: 5000 }); assert.equal(await page.evaluate(() => ADV.msgs.some(m => m.text === 'AC power disconnected')), true);
    await page.click('[data-sim="batt"]'); await page.waitForFunction(() => document.querySelector('#aBatT').textContent === '100%', null, { timeout: 3000 }); assert.equal(await txt(page, '#aBatT'), '100%'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aBolt', false], { timeout: 5000 });
    // the USB icon is in the bar; the hard keys on the case: function opens the main menu, home closes it, power does nothing
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aUsb', false], { timeout: 5000 });
    await page.click('#aHkFn'); assert.equal(await page.$$eval('#advOv .mm', e => e.length), 1); await page.click('#aHkHome'); assert.equal(await page.$$eval('#advOv .mm', e => e.length), 0); await page.click('#aHkPw'); assert.equal(await page.$$eval('#advOv .mm', e => e.length), 0);
    // the EEG frame scale stays at +-50 uV whatever the uV/mm gain (the gain changes the trace, not the labels)
    assert.equal(await page.evaluate(() => { ADV.uvmm[4] = 5; advRelayout(); return ADV.uvmm[4]; }), 5); await page.evaluate(() => { ADV.uvmm[4] = 10; advRelayout(); });
    // diathermy: SQI falls, the SQI alarm raises (yellow) and the BIS number goes blank under SQI 15
    await page.evaluate(() => { mods.diathermy = true; applyTarget(); }); await page.click('#speedSeg [data-speed="10"]');
    await page.waitForFunction(() => !document.querySelector('#aAbar').hidden && /SQI/.test(document.querySelector('#aAl1').textContent), null, { timeout: 30000 });
    assert.ok(await page.$eval('#aAbar', e => e.classList.contains('lo')), 'low priority is yellow');
    await page.waitForFunction(() => document.querySelector('#aBisL').textContent === '', null, { timeout: 40000 });
    await page.evaluate(() => { mods.diathermy = false; applyTarget(); });
    await page.waitForFunction(() => /^\d+$/.test(document.querySelector('#aBisL').textContent), null, { timeout: 60000 }); await page.click('#speedSeg [data-speed="1"]');
    // case review (the menu tile works only with the sensor disconnected): list, review mode with the left bar CASES LIST / CASE LOG / EXIT, numerics follow the cursor, EXIT returns
    await page.click('[data-sim="disc"]'); await page.click('#aMenu'); assert.equal(await page.$$eval('#advOv .mm button[aria-disabled="true"]', e => e.length), 0, 'no sensor: every tile works');
    await page.click('[data-a="m_review"]'); assert.match(await txt(page, '#advOv .lst thead'), /Case Start\s*Case ID.*Duration \[hh:mm\]/); await page.click('[data-a="rvopen"]');
    assert.equal(await page.evaluate(() => !!ADV.review), true); assert.deepEqual(await page.$$eval('#advLeft .rb .l', e => e.map(x => x.textContent)), ['CASES LIST', 'CASE LOG', 'EXIT']);
    await page.waitForFunction(() => document.querySelector('#advWm .tip'), null, { timeout: 3000 }); assert.match(await txt(page, '#advWm .tip'), /^\d\d:\d\d:\d\d$/);
    // review keeps the alarm bar and pill and the message bar, shows no title and no date block, and prints the case facts on the trend
    assert.match(await txt(page, '#aAl1'), /SENSOR DISCONNECTED/); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aPill', false], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aDate', true], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#aNetx', false], { timeout: 5000 });
    assert.ok(!/CASE REVIEW/.test(await txt(page, '#advTop')), 'no CASE REVIEW title in the top bar'); assert.notEqual(await txt(page, '#aMsgT'), '', 'the message bar stays live');
    assert.equal(await page.$eval('#aCases', e => e.classList.contains('sq')), true, 'rounded-square review buttons');
    await page.click('#aLog'); assert.match(await txt(page, '#advOv .lst'), /Case start/); await page.click('[data-a="dclose"]');
    await page.click('#aExitRv'); assert.equal(await page.evaluate(() => !!ADV.review), false); await page.click('[data-sim="disc"]');
    // demo mode for the unilateral sensor: 2-channel screen with one BIS panel, EEG selector shows one channel, SET RANGE, watermark, EXIT DEMO MODE
    await page.click('#aInfo'); await page.click('[data-a="demo"][data-v="2"]');
    assert.equal(await page.$$eval('#aBisR', e => e.length), 0); assert.equal(await page.evaluate(() => ADV.ch + '|' + ADV.layout[2]), '2|dsa,eeg'); assert.match(await txt(page, '#advHdr'), /DSA.*EEG/);
    assert.equal(await page.$$eval('#aLr', e => e.length), 0, 'no L|R pill with a unilateral sensor'); assert.ok(await page.evaluate(() => ADV.demo));
    { const h = await page.evaluate(() => ({ a: ADV.pre.L[0].bis, z: ADV.pre.L[ADV.pre.L.length - 1].bis, e0: ADV.pre.L[0].emg, e1: ADV.pre.L[ADV.pre.L.length - 1].emg, off: !ADV.alarm.bis.on && !ADV.alarm.sr.on && !ADV.alarm.sef.on, live: bisS })); assert.ok(h.a > 90 && h.z < 55 && h.e0 > 40 && h.e1 < 34 && h.off, `the demo case runs from BIS ~97 to the low 40s (${JSON.stringify(h)})`); }
    assert.match(await txt(page, '#advHdr'), /DSA.*EEG/); assert.equal(await txt(page, '#advLeft .rb:last-child .l'), 'EXIT DEMO MODE');
    await page.click('#speedSeg [data-speed="10"]'); await page.waitForFunction(() => COLS[COLS.length - 1].sqi >= 60, null, { timeout: 60000 }); await page.click('#speedSeg [data-speed="1"]');
    await page.click('#aSensor'); assert.match(await txt(page, '#advOv .th'), /UNILATERAL/); assert.match(await page.$eval('#advOv svg.sk', e => e.textContent), /1.*2.*4.*3/); await page.waitForFunction(() => !document.querySelector('#advOv .dlg'), null, { timeout: 15000 });
    await page.click('#aExitDemo'); assert.equal(await page.evaluate(() => ADV.ch), 4); assert.ok(await page.evaluate(() => !!ADV.boot), 'exiting the demo restarts the monitor'); await page.click('#advSkip');
    // accessibility of the screen's chrome (the plots are canvases; contrast is left to the real monitor's colours)
    await page.addScriptTag({ path: AXE });
    { const r = await page.evaluate(() => axe.run(document.querySelector('#advS'), { runOnly: ['wcag2a', 'wcag2aa'], rules: { 'color-contrast': { enabled: false } } })); assert.deepEqual(r.violations.map(v => `${v.id}: ${v.nodes.length}`), [], 'axe on the BIS Advance screen'); }
    // other skins still work after leaving the Advance screen
    await page.click('#skinSeg [data-skin="vista"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advWrap', true], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#vistaWrap', false], { timeout: 5000 });
    await page.close();
  }
  assert.deepEqual(errors, [], 'page errors');
  console.log('bis-dsa advance e2e: ok');
} finally { await b.close(); }
