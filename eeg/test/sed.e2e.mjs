// Browser test of the Masimo SedLine screen (the 'sedline' skin): the 800 x 1280 Root screen, status bar, the four-channel EEG, trend rows,
// well, DSA with ASYM, scrub bar, Trend and Analog views, electrode strip, alarms (PSi limits, window messages, bell, audio pause), the
// Root-style menu tree with the manual's names and defaults, and the settings that change the picture. Run with a static server on port 8080:
// node eeg/test/sed.e2e.mjs  (also run by e2e.mjs)
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
    await page.click('#skinSeg [data-skin="sedline"]');
    await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedWrap', false], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#vistaWrap', true], { timeout: 5000 }); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#advWrap', true], { timeout: 5000 });
    await page.waitForFunction(() => /PSi \d+/.test(document.querySelector('#bilSum').textContent), null, { timeout: 8000 });
    // the keys and simulator buttons sit in a "Controls" disclosure, closed by default, so the picture is just the Root
    assert.equal(await page.$eval('#sedCtl', e => e.open), false); assert.equal(await page.$eval('#sedCtl summary', e => e.textContent.trim()), 'Controls');
    await page.click('#sedCtl summary'); assert.equal(await page.$eval('#sedCtl', e => e.open), true);
    // nothing on the glass gives the simulator away
    { const t = await page.evaluate(() => { const o = []; for (const id of ['main', 'about', 'layout', 'd_wifi', 'd_eth', 'd_bt', 'd_out', 'add']) { sedDlgOpen(id); o.push(document.querySelector('#sedDlg').textContent); sedDlgClose(); } return o.join(' '); }); assert.ok(!/simulat|teaching|stand-in|Not used/i.test(t), 'no simulator wording on the glass'); }
    // the screen is portrait 5:8 and scales as a unit; the bundled Hind font loads
    { const r = await page.$eval('#sedS', e => { const q = e.getBoundingClientRect(); return [q.width / q.height, q.width]; }); assert.ok(Math.abs(r[0] - 0.625) < 0.01, `5:8 screen (${r[0]})`); if (phone) assert.ok(r[1] <= 390, 'fits the phone width'); }
    assert.ok(await page.evaluate(() => document.fonts.check('16px Hind')), 'bundled Hind font loads');
    // the older, dimmed sweep does not shimmer at 15 mm/s: right of the cursor the trace stays the same from frame to frame
    { const d = await page.evaluate(async () => { const sp = SED.set.eegSpeed; SED.set.eegSpeed = 15; const cv = SED.cvE, N = 1474, raf = () => new Promise(r => requestAnimationFrame(r));
        const grab = () => { sedDrawEeg(); return { pos: SED.eg.n % N, d: cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data }; };
        await raf(); let a = grab(), b = a; for (let tries = 0; tries < 120; tries++) { await raf(); b = grab(); if (b.pos > a.pos && b.pos < N - 200) break; if (b.pos < a.pos || b.pos >= N - 200) a = b; } // wait until the sweep has moved on (a slow machine can draw frames with no new samples)
        SED.set.eegSpeed = sp; const k = cv.width / 800, x0 = Math.round((50 + b.pos * 737 / N + 70) * k), x1 = Math.round(780 * k);
        if (b.pos === a.pos || x1 - x0 < 20) return -1; let n = 0, t = 0; for (let y = 0; y < cv.height; y++) for (let x = x0; x < x1; x++) { const j = (y * cv.width + x) * 4; t++; if (Math.abs(a.d[j] - b.d[j]) > 30) n++; } return n / t; });
      assert.ok(d >= 0 && d < 0.002, `dim EEG sweep is steady between frames (${(d * 100).toFixed(2)}% changed)`); }
    // defaults are the manual's factory defaults
    const d = await page.evaluate(() => ({ s: SED.set, range: SED.range, view: SED.view, exp: Object.keys(SED.exp) }));
    assert.deepEqual([d.s.psiHi, d.s.psiLo, d.s.eegAmp, d.s.eegSpeed, d.s.dsaHi, d.s.dsaLo, d.s.maxHz, d.s.placement, d.s.silence, d.s.monImp, d.s.dispImp, d.range, d.view], [50, 25, 5, 30, 15, -40, 30, 'EEG/PSi/DSA', 120, true, true, 30, 'trend']);
    assert.deepEqual(d.exp.sort(), ['emg', 'psi', 'sr']);
    // an awake patient on the factory limits shows PSI High>50 without having been in range first (yellow, medium priority); the limit is lifted for the rest of the checks below
    await page.waitForFunction(() => SED.alm && SED.alm.text === 'PSI High>50' && SED.alm.par && SED.alm.par.level === 'med', null, { timeout: 20000 });
    await page.screenshot({ path: process.env.SED_SHOT ? `${process.env.SED_SHOT}-awake-alarm${phone ? '-phone' : ''}.png` : undefined }).catch(() => {});
    await page.evaluate(() => { SED.set.psiHi = null; SED.outSince = null; sedInval(); }); await page.waitForFunction(() => SED.alm && !SED.alm.text);
    // awake: PSi in the 80s-90s, the clock in the status bar, 30 minutes of earlier history, the canvas drawn
    const n = await page.evaluate(() => ({ psi: SED.N.v.psi, clock: sedClock(simT, false), start: SED.D.start, now: simT, hz: SED.N.v.sefl }));
    assert.ok(n.psi >= 80, `awake PSi ${n.psi}`); assert.match(n.clock, /^\d{1,2}:\d\d (AM|PM)$/); assert.ok(n.now - n.start >= 1700, 'earlier history'); assert.ok(n.hz > 5);
    { const lit = await page.$eval('#sedCv', c => { const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 0; i < x.length; i += 4) if (x[i] + x[i + 1] + x[i + 2] > 60) k++; return k / (x.length / 4); }); assert.ok(lit > 0.1, `screen drawn (${lit})`); }
    assert.ok(await page.$$eval('#sedHits .hit', e => e.length) > 15, 'hit regions are in place');
    assert.equal(await page.evaluate(() => sedLay().rows.map(r => r.k).join()), 'emg,psi,sr'); assert.equal(await page.evaluate(() => sedLay().well.join()), 'artf,sefl,sefr');
    // action menu: TREND and ANALOG
    await page.click('[data-a="actiontab"]'); assert.equal(await page.evaluate(() => SED.pop && SED.pop.kind), 'action'); await page.waitForFunction(() => document.querySelectorAll('#sedPop .act button').length === 2, null, { timeout: 5000 }); assert.equal(await page.$$eval('#sedPop .spopclose', e => e.length), 1, 'the blue close tab is in the popup layer');
    await page.click('#sedPop [data-v="analog"]'); assert.equal(await page.evaluate(() => SED.view), 'analog'); await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => SED.pop), null);
    await page.click('[data-a="actiontab"]'); await page.click('#sedPop [data-v="trend"]'); assert.equal(await page.evaluate(() => SED.view), 'trend');
    // time range: + and - step through 0:10 0:20 0:30 1:00 2:00; pressing the label resets to 0:30
    await page.click('[data-a="zplus"]'); assert.equal(await page.evaluate(() => SED.range), 60); await page.click('[data-a="zplus"]'); assert.equal(await page.evaluate(() => SED.range), 120); await page.click('[data-a="zplus"]'); assert.equal(await page.evaluate(() => SED.range), 120);
    await page.click('[data-a="zminus"]'); assert.equal(await page.evaluate(() => SED.range), 60); await page.click('[data-a="zreset"]'); assert.equal(await page.evaluate(() => SED.range), 30);
    await page.click('[data-a="zminus"]'); await page.click('[data-a="zminus"]'); assert.equal(await page.evaluate(() => SED.range), 10); await page.click('[data-a="zreset"]');
    // scrub bar: a tap moves the time shown back, a tap at the right end returns to live
    const scrubAt = async f => { const w = await page.$eval('[data-a="scrub"]', e => e.getBoundingClientRect().width); await page.click('[data-a="scrub"]', { position: { x: Math.max(1, Math.min(w - 1, w * f)), y: 8 } }); };
    await scrubAt(0.2); assert.ok(await page.evaluate(() => SED.hold != null && SED.hold < simT - 60), 'scrolled back');
    await scrubAt(0.99); assert.equal(await page.evaluate(() => SED.hold), null);
    // number menu: About, Settings, Expand / Minimise
    await page.click('.hit[data-a="num"][data-v="artf"]'); await page.waitForSelector('#sedPop .num button'); assert.deepEqual(await page.$$eval('#sedPop .num button', e => e.map(x => x.textContent)), ['About', 'Settings']);
    await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => SED.pop), null);
    await page.evaluate(() => sedExpand('artf')); assert.equal(await page.evaluate(() => sedLay().rows.map(r => r.k).join()), 'emg,psi,sr,artf'); assert.equal(await page.evaluate(() => sedLay().well.join()), 'sefl,sefr');
    await page.evaluate(() => sedMinimise('psi')); assert.equal(await page.evaluate(() => sedLay().well.includes('psi')), true);
    await page.evaluate(() => { sedExpand('psi'); sedMinimise('artf'); });
    assert.equal(await page.evaluate(() => sedLay().rows.map(r => r.k).join()), 'emg,psi,sr');
    await page.click('.hit[data-a="num"][data-v="emg"]'); await page.click('#sedPop [data-a="about"]');
    assert.match(await page.$eval('#sedDlg', e => e.textContent), /muscle activity/); await page.click('#sedDlg [data-a="back"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', true], { timeout: 5000 });
    // the bell does nothing when nothing is sounding; the layout puts the PSi into the well when everything else is expanded
    await page.click('[data-a="bell"]'); assert.equal(await page.evaluate(() => [SED.silenceUntil, SED.silenceShown]).then(v => v.join()), '0,false', 'bell with no alarm is ignored');
    await page.evaluate(() => { for (const k of ['sr', 'emg', 'artf', 'sefl', 'sefr']) sedExpand(k); });
    { const L = await page.evaluate(() => sedLay()); assert.deepEqual(L.well, ['psi']); assert.equal(L.rows.length, 5); assert.ok(L.rows.every(r => Math.abs(r.h - L.rows[0].h) < 1), 'even rows'); }
    await page.evaluate(() => { sedExpand('psi'); sedMinimise('artf'); sedMinimise('sefl'); sedMinimise('sefr'); }); assert.equal(await page.evaluate(() => sedLay().rows.map(r => r.k).join()), 'emg,psi,sr');
    // gestures (pointer): a horizontal drag along a trend scrolls everything, a wheel steps the time range, hold-and-drag moves a number, a vertical drag on the handle pulls the strip
    { const box = await page.$eval('#sedS', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width / 800]; }), P = (x, y) => [box[0] + x * box[2], box[1] + y * box[2]];
      await page.evaluate(() => window.scrollTo(0, document.querySelector('#sedS').getBoundingClientRect().top + scrollY - 20)); const b2 = await page.$eval('#sedS', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width / 800]; }), Q = (x, y) => [b2[0] + x * b2[2], b2[1] + y * b2[2]];
      const vis = await page.evaluate(() => innerHeight); if (Q(0, 1280)[1] > vis + 5) await page.setViewportSize({ width: page.viewportSize().width, height: Math.ceil(Q(0, 1280)[1]) + 10 });
      const b3 = await page.$eval('#sedS', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width / 800]; }), R = (x, y) => [b3[0] + x * b3[2], b3[1] + y * b3[2]];
      let [x0, y0] = R(300, 520); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 + 120 * b3[2], y0, { steps: 6 }); await page.mouse.up();
      assert.ok(await page.evaluate(() => SED.hold != null && SED.hold < simT - 60), 'a drag on a trend scrolls back'); assert.equal(await page.evaluate(() => SED.pop), null);
      [x0, y0] = R(400, 900); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0 - 400 * b3[2], y0, { steps: 6 }); await page.mouse.up(); assert.equal(await page.evaluate(() => SED.hold), null, 'a drag the other way returns to live');
      await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', true], { timeout: 5000 });
      [x0, y0] = R(300, 520); await page.mouse.move(x0, y0); await page.mouse.wheel(0, 120); await page.waitForFunction(() => SED.range === 60, null, { timeout: 2000 }); await page.waitForTimeout(300); await page.mouse.wheel(0, -120); await page.waitForFunction(() => SED.range === 30, null, { timeout: 2000 });
      [x0, y0] = R(720, 440); await page.mouse.move(x0, y0); await page.mouse.down(); await page.waitForFunction(() => SED.dimK === 'emg', null, { timeout: 2000 }); const [x1, y1] = R(400, 770); await page.mouse.move(x1, y1, { steps: 5 }); await page.mouse.up();
      assert.equal(await page.evaluate(() => sedLay().well.includes('emg')), true, 'hold and drag into the well minimises'); assert.equal(await page.evaluate(() => SED.dimK), null);
      [x0, y0] = R(150, 770); await page.mouse.move(x0, y0); await page.mouse.down(); await page.waitForFunction(() => SED.dimK != null, null, { timeout: 2000 }); [x0, y0] = R(300, 450); await page.mouse.move(x0, y0, { steps: 5 }); await page.mouse.up();
      await page.evaluate(() => { sedExpand('emg'); sedMinimise('artf'); sedMinimise('sefl'); sedMinimise('sefr'); }); assert.equal(await page.evaluate(() => sedLay().rows.map(r => r.k).join()), 'emg,psi,sr');
      [x0, y0] = R(400, 105); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0, y0 + 50 * b3[2], { steps: 5 }); await page.mouse.up(); assert.equal(await page.evaluate(() => SED.strip), true, 'swipe down on the handle shows the strip');
      [x0, y0] = R(400, 150); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x0, y0 - 60 * b3[2], { steps: 5 }); await page.mouse.up(); assert.equal(await page.evaluate(() => SED.strip), false, 'swipe up hides it'); }
    // a menu left alone returns to the main screen after a minute (shortened here)
    await page.evaluate(() => { SED.idleMs = 300; sedDlgOpen('p_psi_alarms'); }); await page.waitForFunction(() => !SED.dlg, null, { timeout: 3000 }); await page.evaluate(() => { SED.idleMs = 60000; });
    // electrode strip: six electrodes, green with impedances; the simulated faults change colours and messages
    await page.click('#bSensor'); assert.equal(await page.evaluate(() => SED.strip), true);
    { const e = await page.evaluate(() => sedElec()); assert.deepEqual(Object.keys(e.state).sort(), ['CB', 'CT', 'L1', 'L2', 'R1', 'R2']); assert.ok(Object.values(e.state).every(s => s === 'green'), 'all green'); assert.ok(Object.values(e.k).every(v => v > 0 && v < 15)); }
    await page.click('#sedSim [data-sim="hiz"]'); await page.waitForFunction(() => SED.alm && SED.alm.text === 'High Impedance Detected'); assert.equal(await page.evaluate(() => SED.alm.win.level), 'hi'); assert.equal(await page.evaluate(() => SED.elec.state.L2), 'red');
    await page.click('#sedSim [data-sim="hiz"]'); await page.click('#sedSim [data-sim="gel"]'); await page.waitForFunction(() => SED.alm && SED.alm.text === 'Gel Bridging Detected'); assert.equal(await page.evaluate(() => SED.elec.state.CB), 'gel'); await page.click('#sedSim [data-sim="gel"]');
    await page.click('#sedSim [data-sim="off"]'); await page.waitForFunction(() => SED.alm && SED.alm.text === 'Sensor Off Patient'); assert.equal(await page.evaluate(() => SED.elec.state.CT), 'blue');
    await page.waitForFunction(() => /--/.test(document.querySelector('#bilSum').textContent) || SED.N.blank); await page.click('#sedSim [data-sim="off"]');
    await page.click('#sedSim [data-sim="disc"]'); await page.waitForFunction(() => SED.alm && SED.alm.text === 'SedLine is Disconnected'); assert.equal(await page.evaluate(() => SED.elec.state.R1), 'light'); await page.click('#sedSim [data-sim="disc"]');
    await page.waitForFunction(() => !SED.alm.text); assert.ok(await page.evaluate(() => SED.gaps.length >= 2 && SED.gaps.every(g => g[1] != null)), 'no-data gaps were recorded');
    await page.click('#bSensor'); assert.equal(await page.evaluate(() => SED.strip), false);
    // PSi alarm: back on the factory limit, in range first (no alarm), then out of them for 5 s: yellow, "PSI High>50", the bell tile, sound; bell silences; audio pause counts down
    await page.evaluate(() => { SED.set.psiHi = 50; SED.outSince = null; sedInval(); });
    await page.evaluate(() => { document.querySelector('#depth').value = 57; document.querySelector('#depth').dispatchEvent(new Event('input', { bubbles: true })); advPrime(40); });
    await page.waitForFunction(() => SED.N && SED.N.v.psi != null && SED.N.v.psi <= 50 && SED.N.v.psi >= 25, null, { timeout: 8000 });
    assert.equal(await page.evaluate(() => SED.alm.par), null, 'in range: no PSi alarm');
    await page.evaluate(() => { document.querySelector('#depth').value = 0; document.querySelector('#depth').dispatchEvent(new Event('input', { bubbles: true })); advPrime(25); });
    await page.waitForFunction(() => SED.alm && SED.alm.par && SED.alm.text === 'PSI High>50', null, { timeout: 8000 });
    assert.equal(await page.evaluate(() => SED.alm.par.level), 'med'); assert.equal(await page.evaluate(() => SED.alm.curPar), true);
    await page.waitForFunction(() => SED.sounding === true && SED.beeps > 0, null, { timeout: 4000 });
    await page.screenshot({ path: process.env.SED_SHOT ? `${process.env.SED_SHOT}-alarm${phone ? '-phone' : ''}.png` : undefined }).catch(() => {});
    await page.click('[data-a="bell"]'); assert.ok(await page.evaluate(() => SED.silenceUntil > Date.now() + 100000), 'bell silences for 2 min'); await page.waitForFunction(() => SED.sounding === false);
    assert.equal(await page.evaluate(() => SED.alm.par.level), 'med', 'a silenced alarm keeps its visuals');
    await page.click('[data-a="bell"]'); assert.equal(await page.evaluate(() => SED.silenceUntil), 0);
    await page.click('[data-a="pause"]'); assert.ok(await page.evaluate(() => SED.pauseUntil > Date.now() + 100000), 'audio pause 2 min'); await page.waitForFunction(() => SED.sounding === false); await page.click('[data-a="pause"]'); assert.equal(await page.evaluate(() => SED.pauseUntil), 0);
    // a new limit (menu) re-arms; PSi limit stand-in matches the numbers beside the PSI row
    // the Root-style menu: Menu key under the screen and the gear open the Main Menu; the manual's names are all there
    // (the Menu key closes the whole menu when a page is open; Escape and the arrow go back one level; no focus box on the dialog's back arrow)
    await page.click('#bMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', false], { timeout: 5000 }); await page.click('#sedDlg [data-v="sedline"]'); await page.click('#bMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', true], { timeout: 5000 });
    await page.evaluate(() => sedDlgOpen('layout')); assert.equal(await page.$eval('#sedDlg .sdback', e => getComputedStyle(e).outlineStyle), 'none', 'no focus box on the back arrow'); await page.evaluate(() => sedDlgClose());
    await page.click('#bMenu'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', false], { timeout: 5000 });
    assert.deepEqual(await page.$$eval('#sedDlg .sdtile span', e => e.map(x => x.textContent)), ['Layout', 'rainbow', 'Sounds', 'Device Settings', 'About', 'Trend Settings', 'Profiles', 'Iris', 'SedLine']);
    await page.click('#sedDlg [data-v="sedline"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdbar', e => e.map(x => x.textContent)), ['Parameter Settings', 'Additional Settings']);
    await page.click('#sedDlg [data-v="params"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdbar', e => e.map(x => x.textContent)), ['PSi', 'DSA', 'SEFL', 'SEFR', 'EMG', 'SR', 'ARTF']);
    await page.click('#sedDlg [data-v="p_psi"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdbar', e => e.map(x => x.textContent)), ['About', 'Alarms', 'Trends']);
    await page.click('#sedDlg [data-v="p_psi_alarms"]');
    assert.deepEqual(await page.$$eval('#sedDlg .sdrow label', e => e.map(x => x.textContent)), ['High Limit', 'Low Limit', 'High Caution Range', 'Low Caution Range', 'Silence Duration', 'Audible Alarms']);
    assert.deepEqual(await page.$$eval('#sedDlg .sdrow .sdbar', e => e.map(x => x.textContent)), ['50', '25', 'Off', 'Off', '2 min']);
    await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.keyboard.press('Escape'); assert.equal(await page.$eval('#sedDlg h2', e => e.textContent), 'psi alarms', 'Escape closes the list first'); assert.equal(await page.$$eval('#sedDlg .sdlist', e => e.length), 0);
    // Cancel drops a change; OK keeps it; a low limit above the high limit is refused
    await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.click('#sedDlg .sdlist [role="option"]:has-text("60")'); await page.click('#sedDlg .sdcancel'); assert.equal(await page.evaluate(() => SED.set.psiHi), 50);
    await page.click('#sedDlg [data-v="p_psi_alarms"]'); await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("60")'); await page.click('#sedDlg .sdok'); assert.equal(await page.evaluate(() => SED.set.psiHi), 60);
    await page.click('#sedDlg [data-v="p_psi_alarms"]'); await page.click('#sedDlg [data-a="open"][data-v="1"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("70")'); await page.click('#sedDlg .sdok');
    assert.match(await page.$eval('#sedDlg .sderr', e => e.textContent), /Invalid limits/); assert.ok(await page.$$eval('#sedDlg .sdbar.bad', e => e.length) > 0, 'the rows are marked'); assert.equal(await page.evaluate(() => SED.set.psiLo), 25); await page.click('#sedDlg .sdcancel');
    // the numbers beside the PSI row follow the limits
    await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', true], { timeout: 5000 });
    await page.evaluate(() => { SED.set.psiHi = 50; sedInval(); });
    // settings that change the picture: Additional Settings and the DSA pages
    await page.click('.hit[data-a="eegset"] >> nth=0'); assert.deepEqual(await page.$$eval('#sedDlg .sdrow label', e => e.map(x => x.textContent)), ['EEG Amplitude', 'EEG Chart Speed', 'EEG Display Filter', 'DSA Placement', 'Monitor Impedance', 'Display Impedance', 'DSA Artifacts']);
    await page.click('#sedDlg [data-a="open"][data-v="3"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("EEG/DSA/PSi")'); await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("10 µV/mm")'); await page.click('#sedDlg [data-a="open"][data-v="1"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("15 mm/sec")');
    await page.click('#sedDlg [data-a="tog"][data-v="4"]'); await page.click('#sedDlg .sdok');
    { const r = await page.evaluate(() => ({ dsaY: sedLay().dsaY, trendY: sedLay().trendY, a: SED.set.eegAmp, sp: SED.set.eegSpeed, imp: SED.set.monImp, e: sedElec().state.R1 })); assert.deepEqual([r.dsaY, r.trendY, r.a, r.sp, r.imp, r.e], [412, 790, 10, 15, false, 'dark']); }
    await page.evaluate(() => { Object.assign(SED.set, { placement: 'EEG/PSi/DSA', eegAmp: 5, eegSpeed: 30, monImp: true }); sedInval(); });
    await page.click('#bMenu'); await page.click('#sedDlg [data-v="sedline"]'); await page.click('#sedDlg [data-v="params"]'); await page.click('#sedDlg [data-v="p_dsa"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdbar', e => e.map(x => x.textContent)), ['About DSA', 'Trends', 'Additional Settings', 'About ASYM']);
    await page.click('#sedDlg [data-v="p_dsa_add"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdrow label', e => e.map(x => x.textContent)), ['SEF Line Thickness', 'Max Frequency', 'DSA Type']);
    await page.click('#sedDlg [data-a="open"][data-v="1"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("40 Hz")'); await page.click('#sedDlg [data-a="open"][data-v="2"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("Hanning")'); await page.click('#sedDlg .sdok');
    assert.deepEqual(await page.evaluate(() => [SED.set.maxHz, SED.set.dsaType]), [40, 'Hanning']);
    await page.click('#sedDlg [data-v="p_dsa_trends"]'); assert.deepEqual(await page.$$eval('#sedDlg .sdrow .sdbar', e => e.map(x => x.textContent)), ['15', '-40']);
    await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("30")'); await page.click('#sedDlg .sdok'); assert.equal(await page.evaluate(() => SED.set.dsaHi), 30);
    await page.waitForTimeout(400); { const c = await page.evaluate(() => { const t = SED.cvL.cv.getContext('2d').getImageData(10, 100, 1, 1).data; return [t[0], t[1], t[2]]; }); assert.ok(c.some(v => v > 0), 'the DSA is repainted'); }
    // a PEDIATRIC profile: green pill, 0-40 Hz
    await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]'); await page.click('#sedDlg [data-a="back"]');
    await page.click('[data-a="profile"]'); await page.click('#sedDlg [data-a="open"][data-v="0"]'); await page.click('#sedDlg .sdlist [role="option"]:text-is("Pediatric")'); await page.click('#sedDlg .sdok');
    assert.deepEqual(await page.evaluate(() => [SED.set.profile, SED.set.maxHz]), ['PEDIATRIC', 40]);
    // Layout page: six tiles that are buttons; a tap moves the blue ring, OK commits; layouts 1-5 share the screen with a rainbow window and show one view at a time
    await page.evaluate(() => sedDlgOpen('layout')); assert.equal(await page.$$eval('#sedDlg button.sdlt', e => e.length), 6); assert.equal(await page.$eval('#sedDlg .sdlt.on', e => e.dataset.v), '6');
    await page.click('#sedDlg .sdlt[data-v="2"]'); assert.equal(await page.$eval('#sedDlg .sdlt.on', e => e.dataset.v), '2'); assert.equal(await page.evaluate(() => SED.set.layout), 6, 'not committed before OK');
    await page.click('#sedDlg .sdok'); assert.equal(await page.evaluate(() => SED.set.layout), 2); await page.waitForFunction(() => SED.L.compact); assert.equal(await page.evaluate(() => SED.L.view), 'trend');
    await page.waitForTimeout(300); await page.click('[data-a="actiontab"]'); await page.waitForSelector('#sedPop .act button'); assert.deepEqual(await page.$$eval('#sedPop .act button', e => e.map(x => x.textContent)), ['TREND', 'EEG', 'DSA', 'ANALOG']); assert.equal(await page.$eval('#sedPop .act button.cur', e => e.dataset.v), 'trend');
    for (const v of ['dsa', 'eeg', 'analog', 'trend']) { if (!await page.evaluate(() => SED.pop)) await page.click('[data-a="actiontab"]'); await page.click(`#sedPop [data-v="${v}"]`); await page.waitForFunction(v => SED.L.view === v, v); await page.waitForTimeout(150); const L = await page.evaluate(() => ({ v: SED.L.view, e: !!SED.L.eeg, d: !!SED.L.dsa, g: !!SED.L.gauge, r: SED.L.rows.length, w: SED.L.cwell.length })); assert.deepEqual([L.v, L.e, L.d, L.g, L.r > 0, L.w], [v, v === 'eeg', v === 'dsa', v === 'analog', v === 'trend', 6], `shared layout view ${v}`); assert.equal(await page.$eval('#sedEeg', e => e.style.display === 'none'), v !== 'eeg'); }
    await page.evaluate(() => sedDlgOpen('layout')); await page.click('#sedDlg .sdlt[data-v="6"]'); await page.click('#sedDlg .sdok'); await page.waitForFunction(() => !SED.L.compact); assert.equal(await page.evaluate(() => SED.set.layout), 6);
    // the rest of the Root tree opens: Layout, Sounds, Device Settings, About, Trend Settings, Profiles, Iris, Access Control (with its standby toggle that adds the power key)
    for (const id of ['layout', 'sounds', 'device', 'about', 'trendset', 'profiles', 'iris', 'localization', 'access', 'd_wifi', 'd_batt', 'd_bright', 'about_psi', 'about_dsa', 'about_asym', 'about_sefl', 'p_sr_alarms', 'p_emg_add', 'p_artf_trends', 'p_sefl_trends', 'p_psi_trends']) {
      await page.evaluate(i => sedDlgOpen(i), id); assert.equal(await page.$eval('#sedDlg', e => e.hidden), false, id); assert.ok((await page.$eval('#sedDlg', e => e.textContent)).length > 10, id); await page.evaluate(() => sedDlgClose());
    }
    await page.evaluate(() => sedDlgOpen('access')); assert.deepEqual((await page.$$eval('#sedDlg .sdrow label', e => e.map(x => x.textContent))).slice(0, 4), ['power on profile', 'all mute enabled', 'lock alarm volume', 'standby enabled']);
    await page.click('#sedDlg [data-a="tog"][data-v="3"]'); await page.click('#sedDlg .sdok'); await page.click('#sedDlg [data-a="back"]').catch(() => {}); await page.evaluate(() => sedDlgClose());
    assert.equal(await page.evaluate(() => SED.set.standby), true); assert.equal(await page.$$eval('.hit[data-a="standby"]', e => e.length), 1);
    await page.click('.hit[data-a="standby"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedStandby', false], { timeout: 5000 }); await page.click('#sedStandby button'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedStandby', true], { timeout: 5000 });
    assert.equal(await page.evaluate(() => SED.set.layout), 6);
    // Escape leaves the menu; the flag drops an event; the other screens still switch
    await page.click('[data-a="gear"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', false], { timeout: 5000 }); await page.keyboard.press('Escape'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedDlg', true], { timeout: 5000 });
    await page.click('[data-a="flag"]'); assert.equal(await page.evaluate(() => SED.events.length), 1);
    // factory defaults are restorable
    await page.evaluate(() => sedDlgOpen('access')); await page.click('#sedDlg [data-a="btn"][data-v="10"]'); assert.deepEqual(await page.evaluate(() => [SED.set.profile, SED.set.maxHz, SED.set.standby]), ['ADULT', 30, false]); await page.evaluate(() => sedDlgClose());
    // accessibility (the controls are labelled buttons over the canvas; the pages are real dialogs)
    await page.addScriptTag({ path: AXE });
    for (const open of [false, true]) {
      if (open) await page.evaluate(() => sedDlgOpen('p_psi_alarms'));
      const r = await page.evaluate(() => axe.run(document.querySelector('#sedWrap'), { runOnly: ['wcag2a', 'wcag2aa'] })); assert.deepEqual(r.violations.map(v => `${v.id}: ${v.nodes.length}`), [], `axe on the SedLine screen${open ? ' (menu open)' : ''}`);
    }
    await page.evaluate(() => sedDlgClose());
    await page.click('#skinSeg [data-skin="vista"]'); await page.waitForFunction(([sel, v]) => document.querySelector(sel).hidden === v, ['#sedWrap', true], { timeout: 5000 });
    await page.close();
  }
  assert.deepEqual(errors, [], 'no page errors');
  console.log('sed.e2e: ok');
} finally { await b.close(); }
