// Browser test of the OT simulator at phone and desktop size, with an axe accessibility check.
// Run from the repo root with a static server on port 8080 (python3 -m http.server 8080): node ot/test/e2e.mjs
// (tools/test-ot-sim.sh starts the server for you.) ?test exposes window.otsim so the test steps the model directly.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';

const AXE = new URL('../../tools/vendor/axe.min.js', import.meta.url).pathname;
const ORIGIN = `http://localhost:${process.env.PORT || 8080}`;
const BASE = `${ORIGIN}/ot/`;
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH, args: ['--no-sandbox'] } : {});
const errors = [], outside = [];

async function axe(page, what) {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ content: fs.readFileSync(AXE, 'utf8') });
  const res = await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa'] }));
  assert.deepEqual(res.violations.map(v => v.id + ' ' + v.nodes.map(n => n.target).join(',')), [], `axe violations (${what})`);
}
// lit pixels in a lane canvas (anything drawn)
const lit = (page, id) => page.$eval(id, c => {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let n = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
  return n;
});

try {
  for (const [viewport, deviceScaleFactor, name] of [[{ width: 390, height: 844 }, 3, 'phone'], [{ width: 1280, height: 900 }, 1, 'desktop']]) {
    const page = await b.newPage({ viewport, deviceScaleFactor });
    page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    page.on('request', r => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:')) outside.push(r.url()); });

    // library (the default screen)
    await page.goto(BASE);
    assert.equal(await page.title(), 'OT Simulator');
    assert.equal(await page.$eval('meta[name=robots]', e => e.content), 'noindex, nofollow');
    assert.equal(page.url(), BASE, 'the old-address forward does nothing here');
    assert.ok(await page.isVisible('#library') && !(await page.isVisible('#theatre')));
    await axe(page, `${name} library`);
    await page.click('a.card[href="#theatre"]');
    await page.waitForSelector('#theatre', { state: 'visible', timeout: 3000 });

    // theatre, driven by the test hooks
    await page.goto(BASE + '?test&seed=3#theatre');
    await page.waitForFunction(() => window.otsim && document.getElementById('n-hr').textContent !== '--');
    await page.waitForTimeout(400);
    for (const id of ['#c-ecg', '#c-pleth', '#c-co2']) assert.ok((await lit(page, id)) > 500, `${name}: ${id} draws`);
    // backing store at device density (capped at 2x), not grown each frame
    const dims = await page.$eval('#c-ecg', c => [c.width, c.clientWidth, c.height, c.clientHeight]);
    const dpr = Math.min(2, deviceScaleFactor);
    assert.equal(dims[0], Math.round(dims[1] * dpr)); assert.equal(dims[2], Math.round(dims[3] * dpr));
    await page.waitForTimeout(300);
    assert.equal((await page.$eval('#c-ecg', c => c.height)), dims[2], 'canvas height stable');

    // numerics are numbers in a sensible range
    const n = await page.evaluate(() => ['n-hr', 'n-spo2', 'n-etco2', 'n-rr', 'n-temp'].map(id => parseFloat(document.getElementById(id).textContent)));
    assert.ok(n[0] > 50 && n[0] < 100 && n[1] >= 94 && n[1] <= 100 && n[2] > 30 && n[2] < 45 && n[3] > 8 && n[3] < 20 && n[4] > 36 && n[4] < 37.5, `${name}: numerics ${n}`);

    // pause: the model stops
    await page.click('#pause');
    assert.equal(await page.getAttribute('#pause', 'aria-label'), 'Resume');
    const t0 = await page.evaluate(() => otsim.state.t);
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => otsim.state.t), t0, 'paused model does not move');
    // wipe the lane, resume and pause again, count, all in one evaluation (Chrome may repaint a GPU canvas between
    // evaluations): the lane is refilled from history, not left blank
    const [wiped, refilled] = await page.evaluate(() => {
      const c = document.getElementById('c-ecg'), x = c.getContext('2d');
      const count = () => { const d = x.getImageData(0, 0, c.width, c.height).data; let k = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) k++; return k; };
      x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.restore();
      const w = count();
      document.getElementById('pause').click(); document.getElementById('pause').click();
      return [w, count()];
    });
    assert.equal(wiped, 0);
    assert.ok(refilled > 500, `${name}: lane refilled after pause`);
    await page.click('#pause'); // running again

    // speed keys: 20x runs the model about 20 times faster, shows the note, and is remembered on the device
    await page.click('[data-speed="20"]');
    assert.equal(await page.getAttribute('[data-speed="20"]', 'aria-pressed'), 'true');
    assert.ok(await page.isVisible('#fastnote'));
    const s0 = await page.evaluate(() => otsim.state.t);
    await page.waitForTimeout(1000);
    const ds = (await page.evaluate(() => otsim.state.t)) - s0;
    assert.ok(ds > 8 && ds < 30, `${name}: 20x ran ${ds} s in about 1 s`);
    assert.equal(await page.evaluate(() => localStorage.getItem('otsim.speed')), '20');
    assert.ok((await lit(page, '#c-pleth')) > 500, `${name}: pleth draws at 20x`);
    await page.click('[data-speed="1"]');
    assert.ok(!(await page.isVisible('#fastnote')));

    // five simulated minutes by the test hook: the clock and an NIBP reading
    await page.click('#pause');
    await page.evaluate(() => otsim.step(3000));
    const clock = await page.textContent('#clock');
    assert.match(clock, /^0[5-9]:\d\d$/, `${name}: clock ${clock}`);
    assert.match(await page.textContent('#n-nibp'), /^\d{2,3}\/\d{2,3}$/);
    // NIBP controls live on the Circulation tab (arrow keys move between tabs)
    await page.focus('#tab-drugs');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.getAttribute('#tab-circ', 'aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tab-circ');
    assert.ok(await page.isVisible('#nibp-go') && !(await page.isVisible('#panel-drugs')));
    // the button stops a running measurement and starts an idle one
    if ((await page.textContent('#nibp-go')) === 'Stop NIBP') await page.click('#nibp-go');
    assert.equal(await page.textContent('#nibp-go'), 'Start NIBP');
    await page.click('#nibp-go');
    assert.equal(await page.textContent('#nibp-go'), 'Stop NIBP');
    assert.match(await page.textContent('#n-nibp-age'), /Measuring/);
    await page.selectOption('#nibp-cycle', '0');
    await page.evaluate(() => otsim.step(400));
    assert.match(await page.textContent('#n-nibp-age'), /min ago|just now/);
    assert.ok(!/cycle/.test(await page.textContent('#n-nibp-age')), 'manual mode shows no cycle');

    // vasoactive drugs on the Circulation tab: phenylephrine raises the pressure within a minute
    const mapBefore = await page.evaluate(() => otsim.state.cv.map);
    await page.click('[data-bolus="phenylephrine"][data-dose="100"]');
    await page.evaluate(() => otsim.step(450));
    assert.ok(await page.evaluate(m => otsim.state.cv.map > m + 5, mapBefore), `${name}: phenylephrine raises MAP`);
    await page.click('[data-inf="noradrenaline"]');
    assert.match(await page.textContent('#inf-state-noradrenaline'), /Running 0.05 mcg\/kg\/min/);
    await page.click('[data-infstop="noradrenaline"]');
    // fluids: a bolus runs and is counted; bleeding lowers the blood volume
    await page.click('[data-fluid="crystalloid"][data-ml="250"]');
    await page.evaluate(() => otsim.step(20));
    assert.match(await page.textContent('#fluid-state'), /Running: crystalloid \d+ mL to go/);
    await page.evaluate(() => otsim.step(3000));
    assert.match(await page.textContent('#fluid-state'), /Given: crystalloid 250 mL/);
    await axe(page, `${name} theatre, Circulation tab`);
    await page.click('#tab-pt');
    const bv1 = await page.evaluate(() => otsim.state.cv.bloodVol);
    await page.selectOption('#bleed', '100');
    await page.evaluate(() => otsim.step(600));
    assert.ok(await page.evaluate(v => otsim.state.cv.bloodVol < v - 50, bv1), `${name}: bleeding lowers blood volume`);
    // the forced-air warmer toggles (on the Patient tab, beside bleeding)
    await page.click('#warmer');
    assert.equal(await page.getAttribute('#warmer', 'aria-pressed'), 'true');
    assert.ok(await page.evaluate(() => otsim.state.temp.warming), 'warmer on');
    await page.click('#warmer');
    await page.selectOption('#bleed', '0');
    await page.click('#tab-circ');

    // Drugs: a propofol bolus raises the plasma level at once and the effect site over the next minute and a half
    await page.click('#tab-drugs');
    const map0 = await page.evaluate(() => otsim.state.cv.map);
    await page.click('[data-bolus="propofol"][data-dose="140"]');
    const cp0 = await page.evaluate(() => otsim.state.pk.d.propofol.a1 / otsim.state.pk.p.propofol.V1);
    assert.ok(cp0 > 20, `${name}: propofol Cp after 140 mg: ${cp0}`);
    await page.evaluate(() => otsim.step(900));
    assert.ok(await page.evaluate(() => otsim.state.pk.d.propofol.ce) > 4, `${name}: effect site rises`);
    await page.evaluate(() => otsim.step(300));
    assert.ok(await page.evaluate(m => otsim.state.cv.map < m - 5, map0), `${name}: blood pressure falls after propofol`);
    assert.match(await page.textContent('#given'), /Propofol 140 mg/);
    // the Breathing tab: volume-control ventilation gives a plateau pressure and a minute volume; 100% O2 raises SpO2
    await page.click('#tab-breath');
    await page.evaluate(() => otsim.sim.act({ type: 'bolus', drug: 'rocuronium', dose: 0.6, unit: 'mg/kg', route: 'iv' }));
    await page.selectOption('#vmode', 'vc');
    await page.click('[data-fio2="1"]');
    await page.click('#v-apply');
    await page.evaluate(() => otsim.step(3000));
    assert.match(await page.textContent('#vent-state'), /Volume control: Vt \d+ mL, Ppeak \d+/);
    assert.ok(await page.evaluate(() => parseFloat(document.getElementById('n-ppeak').textContent)) > 8, `${name}: airway pressure shown`);
    await page.evaluate(() => otsim.step(3000));
    assert.ok(await page.evaluate(() => otsim.state.gas.sao2) > 98, `${name}: oxygenated on 100% (got ${await page.evaluate(() => otsim.state.gas.sao2)})`);
    // the vaporiser: sevoflurane washes in, raising the agent numeric and MAC
    await page.selectOption('#vap-agent', 'sevoflurane');
    await page.fill('#vap-dial', '6'); await page.click('#vap-apply');
    await page.fill('#fgf-o2', '4'); await page.click('#fgf-apply');
    await page.evaluate(() => otsim.step(12000));
    assert.ok(await page.evaluate(() => otsim.state.vol.mac) > 0.8, `${name}: sevoflurane raises MAC`);
    assert.match(await page.textContent('#n-agent'), /^\d/);
    await axe(page, `${name} theatre, Breathing tab`);
    // the Airway tab: laryngoscopy shows a view; an oesophageal tube reads no CO2, a tracheal tube restores it
    await page.click('#tab-aw');
    await page.click('#aw-laryn');
    await page.evaluate(() => otsim.step(10));
    assert.ok(await page.evaluate(() => otsim.state.aw.view >= 1), `${name}: laryngoscopy shows a view`);
    await page.selectOption('#aw-place', 'oesophageal');
    await page.click('#aw-intubate');
    await page.evaluate(() => otsim.step(600));
    assert.ok(await page.evaluate(() => otsim.state.gas.etco2 < 5), `${name}: oesophageal tube shows no CO2`);
    await page.selectOption('#aw-place', 'tracheal');
    await page.click('#aw-intubate');
    await page.evaluate(() => otsim.step(900));
    assert.ok(await page.evaluate(() => otsim.state.gas.etco2 > 25), `${name}: tracheal tube restores CO2`);
    assert.match(await page.textContent('#aw-state'), /Tracheal tube/);
    await axe(page, `${name} theatre, Airway tab`);
    await page.click('#tab-drugs');
    // the Patient tab: asleep under TCI; a stimulus shows in the events
    await page.evaluate(() => { otsim.sim.act({ type: 'tci', drug: 'propofol', target: 4 }); otsim.step(3000); });
    await page.click('#tab-pt');
    await page.click('#talk');
    assert.match(await page.textContent('#talk-reply'), /No answer|No response/);
    await page.click('[data-stim="incision"]');
    assert.match(await page.textContent('#events'), /Incision/);
    assert.match(await page.textContent('#events'), /No longer responds to voice/);
    await axe(page, `${name} theatre, Patient tab`);
    // the operation timeline: Start fires the incision, Skip fast-forwards model time to each next step (ongoing
    // surgery stimulus, then a stronger phase), and the last step ends it
    await page.click('#surg-start');
    assert.match(await page.textContent('#surg-state'), /incision|Surgery/i, `${name}: operation started`);
    await page.click('#surg-skip');
    assert.ok(await page.evaluate(() => otsim.state.pd.stim && otsim.state.pd.stim.kind === 'surgery' && otsim.state.pd.stim.ongoing), `${name}: skip reaches the ongoing surgery stimulus`);
    const surgT = await page.evaluate(() => otsim.state.t);
    const surgI = await page.evaluate(() => otsim.state.pd.stim.I);
    await page.click('#surg-skip');
    assert.ok(await page.evaluate(() => otsim.state.t) > surgT, `${name}: skip fast-forwards model time`);
    assert.ok(await page.evaluate(() => otsim.state.pd.stim.I) > surgI, `${name}: the next step is a stronger stimulus`);
    await page.click('#surg-skip'); // closing
    await page.click('#surg-skip'); // finished
    assert.ok(await page.evaluate(() => !otsim.state.pd.stim || !otsim.state.pd.stim.ongoing), `${name}: the operation ends the surgery stimulus`);
    assert.match(await page.textContent('#surg-state'), /complete/i, `${name}: timeline shows complete`);
    assert.ok(await page.evaluate(() => document.getElementById('surg-skip').disabled), `${name}: skip is disabled at the end`);
    // Examine: findings read from the model (the patient is asleep under TCI here), refreshed live
    await page.click('#tab-exam');
    await page.evaluate(() => otsim.step(1));
    const exam = await page.textContent('#exam-list');
    assert.match(exam, /Chest movement|Breath sounds/, `${name}: examine shows the chest/breath findings`);
    assert.match(exam, /Pupils/, `${name}: examine shows pupils`);
    assert.match(exam, /sluggishly|anaesthetised/, `${name}: an asleep patient's pupils`);
    await axe(page, `${name} theatre, Examine tab`);
    // Help: each button is a logged action that confirms and lands in the events feed
    await page.click('#tab-help');
    assert.ok((await page.$$('#help-acts [data-help]')).length >= 4, `${name}: help actions present`);
    await page.click('[data-help="callHelp"]');
    assert.match(await page.textContent('#help-ack'), /help is on the way/i, `${name}: help confirms`);
    await page.click('[data-help="majorHaemorrhage"]');
    await page.evaluate(() => otsim.step(2));
    await axe(page, `${name} theatre, Help tab`);
    await page.click('#tab-pt');
    await page.evaluate(() => otsim.step(2));
    assert.match(await page.textContent('#events'), /Called for help|major haemorrhage/i, `${name}: help actions show in the events feed`);
    // Log tab: a timestamped record of what happened (the help actions just taken, newest first)
    await page.click('#tab-log');
    await page.evaluate(() => otsim.step(1));
    assert.ok((await page.$$('#log-feed li')).length >= 1, `${name}: log has entries`);
    assert.match(await page.textContent('#log-feed'), /help|haemorrhage/i, `${name}: log records the help actions`);
    await axe(page, `${name} theatre, Log tab`);
    await page.click('#tab-pt');
    // Rhythms: impose each from the Patient tab. The ECG keeps drawing and the circulation responds.
    await page.selectOption('#rhythm', 'vt');
    await page.evaluate(() => otsim.step(400));
    assert.equal(await page.evaluate(() => otsim.state.rh.rhythm), 'vt', `${name}: VT set`);
    assert.ok((await lit(page, '#c-ecg')) > 500, `${name}: VT draws`);
    await page.selectOption('#rhythm', 'vf');
    await page.evaluate(() => otsim.step(400));
    assert.ok(await page.evaluate(() => otsim.state.cv.co < 0.3), `${name}: VF makes no output`);
    assert.ok((await lit(page, '#c-ecg')) > 500, `${name}: VF draws`);
    assert.equal(await page.textContent('#n-hr'), '--', `${name}: VF has no readable HR`);
    assert.match(await page.textContent('#n-rhythm'), /fibrillation/i, `${name}: rhythm labelled`);
    await page.selectOption('#rhythm', 'asystole');
    await page.evaluate(() => otsim.step(300));
    assert.equal(await page.textContent('#n-hr'), '0', `${name}: asystole HR 0`);
    await page.selectOption('#rhythm', 'flutter');
    await page.evaluate(() => otsim.step(400));
    assert.ok((await lit(page, '#c-ecg')) > 500, `${name}: flutter draws`);
    // resuscitation: VF, then compressions make an output and raise EtCO2; a shock records an outcome; pacing an
    // asystolic heart at a high output captures and drives a paced rhythm
    await page.selectOption('#rhythm', 'vf');
    await page.evaluate(() => otsim.step(200));
    const etcoVF = await page.evaluate(() => otsim.state.gas.etco2);
    await page.click('#cpr');
    assert.equal(await page.getAttribute('#cpr', 'aria-pressed'), 'true');
    await page.evaluate(() => otsim.step(900));
    assert.ok(await page.evaluate(() => otsim.state.cv.co > 0.5), `${name}: compressions make an output`);
    assert.ok(await page.evaluate(e => otsim.state.gas.etco2 > e, etcoVF), `${name}: EtCO2 rises with CPR`);
    assert.match(await page.textContent('#resus-state'), /Compressions/);
    await page.click('#defib');
    await page.evaluate(() => otsim.step(5));
    assert.match(await page.textContent('#resus-state'), /shock/);
    await page.click('#cpr'); // stop compressions
    await page.selectOption('#rhythm', 'asystole');
    await page.evaluate(() => otsim.step(100));
    await page.fill('#pace-ma', '140');
    await page.click('#pace');
    await page.evaluate(() => otsim.step(150));
    assert.ok(await page.evaluate(() => otsim.state.resus.pace.capturing), `${name}: pacing captures at a high output`);
    assert.equal(await page.evaluate(() => otsim.state.rh.rhythm), 'paced', `${name}: paced rhythm`);
    await page.click('#pace'); // pacer off
    await page.selectOption('#rhythm', 'sinus'); // back to sinus for the rest of the run
    await page.evaluate(() => otsim.step(400));
    await page.click('#tab-drugs');
    // a custom dose
    await page.fill('#bd-fentanyl', '75');
    await page.click('[data-give="fentanyl"]');
    assert.match(await page.textContent('#given'), /Fentanyl 75 mcg/);
    // remifentanil TCI: the pump runs and says what it predicts
    await page.fill('#tt-remifentanil', '3');
    await page.click('[data-tci="remifentanil"]');
    await page.evaluate(() => otsim.step(1200));
    assert.ok(await page.evaluate(() => otsim.state.pump.remifentanil.rate > 0), `${name}: remifentanil pump running`);
    assert.match(await page.textContent('#tci-state-remifentanil'), /Minto, effect site target 3 ng\/mL: pump predicts Ce 3\.0\d/);
    // propofol infusion shows as running, and stops
    await page.click('[data-inf="propofol"]');
    assert.match(await page.textContent('#inf-state-propofol'), /Running 6 mg\/kg\/h/);
    await page.click('[data-infstop="propofol"]');
    assert.equal(await page.textContent('#inf-state-propofol'), '');
    // neuromuscular block: rocuronium takes the TOF to 0/4, a PTC can be counted, sugammadex brings it back
    await page.click('[data-bolus="rocuronium"]');
    await page.evaluate(() => otsim.step(1800));
    assert.equal(await page.textContent('#n-tof'), '0/4');
    await page.click('[data-tof="ptc"]');
    assert.match(await page.textContent('#n-ptc'), /^PTC \d+$/);
    await page.click('[data-bolus="sugammadex"][data-dose="1100"]');
    await page.evaluate(() => otsim.step(1800));
    assert.equal(await page.textContent('#n-tof'), '4/4');
    assert.match(await page.textContent('#n-tofr'), /^\d+%$/);
    // Behind the monitor: closed by default, shows the pump's prediction beside the true level, remembered
    assert.equal(await page.$eval('#behind-box', d => d.open), false);
    await page.click('#behind-box summary');
    await page.evaluate(() => otsim.step(1));
    const rows = await page.$$eval('.behind tbody tr', trs => trs.map(tr => tr.textContent));
    assert.ok(rows.some(r => /^Remifentanil3\.0/.test(r)) && rows.some(r => /^Propofol/.test(r)), `${name}: behind drug rows ${rows}`);
    assert.ok(rows.some(r => /^Twitch \(T1\)/.test(r)), `${name}: neuromuscular rows in Behind the monitor`);
    assert.ok(rows.some(r => /^To voice \(asleep\)/.test(r)), `${name}: depth rows in Behind the monitor`);
    assert.ok(rows.some(r => /^Cardiac output/.test(r)), `${name}: circulation rows in Behind the monitor`);
    // the open state is persisted on the details' `toggle` event, which fires asynchronously after the click, so wait
    // for it rather than reading localStorage straight away (that race flaked on a loaded CI runner)
    await page.waitForFunction(() => { try { return localStorage.getItem('otsim.behind') === '1'; } catch { return false; } }, null, { timeout: 3000 });

    // no horizontal scroll; axe on the paused theatre
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: no horizontal scroll`);
    await axe(page, `${name} theatre, Drugs tab and Behind the monitor`);

    // Alarms (M3.3): on a fresh theatre, drive hypoxia (induce, paralyse, apnoea on air) and the SpO2 high-priority
    // alarm shows on the bar; Silence pauses the audio (label + class) without clearing the alarm
    await page.goto(BASE + '?test&seed=1#theatre');
    await page.waitForFunction(() => window.otsim && document.getElementById('n-hr').textContent !== '--');
    assert.ok(!(await page.isVisible('#alarmbar')), `${name}: no alarm bar when all is well (really not drawn)`);
    await page.evaluate(() => {
      otsim.sim.act({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' });
      otsim.sim.act({ type: 'bolus', drug: 'rocuronium', dose: 100, unit: 'mg', route: 'iv' });
      otsim.sim.act({ type: 'o2', fio2: 0.21 });
      otsim.step(6000);
    });
    assert.ok(await page.evaluate(() => otsim.state.mon.alarms.some(a => a.param === 'spo2' && a.priority === 'high')), `${name}: SpO2 high alarm active`);
    assert.ok(await page.isVisible('#alarmbar'), `${name}: alarm bar shown`);
    assert.ok(await page.evaluate(() => document.getElementById('alarmbar').classList.contains('high')), `${name}: alarm bar is high priority`);
    assert.match(await page.textContent('#alarm-msg'), /SpO/, `${name}: alarm bar names SpO2`);
    assert.equal(await page.getAttribute('#alarmbar', 'aria-live'), 'assertive', `${name}: high alarm is assertive`);
    await axe(page, `${name} theatre, alarm active`);
    await page.click('#alarm-silence');
    await page.evaluate(() => otsim.step(2));
    assert.ok(await page.evaluate(() => otsim.state.mon.silencedUntil > otsim.state.t), `${name}: silence window set`);
    assert.ok(await page.evaluate(() => document.getElementById('alarmbar').classList.contains('silenced')), `${name}: bar shows silenced`);
    assert.match(await page.textContent('#alarm-silence'), /Silenced/, `${name}: silence button counts down`);
    assert.ok(await page.evaluate(() => otsim.state.mon.alarms.length > 0), `${name}: alarm stays active while silenced`);
    // technical alarm: an oesophageal tube on the ventilator → a high-priority "No CO₂" alarm on the bar
    await page.goto(BASE + '?test&seed=1#theatre');
    await page.waitForFunction(() => window.otsim && document.getElementById('n-hr').textContent !== '--');
    await page.evaluate(() => {
      otsim.sim.act({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' });
      otsim.sim.act({ type: 'bolus', drug: 'rocuronium', dose: 100, unit: 'mg', route: 'iv' });
      otsim.sim.act({ type: 'intubate', placement: 'oesophageal' });
      otsim.sim.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, fio2: 1 });
      otsim.step(900);
    });
    assert.ok(await page.evaluate(() => otsim.state.mon.alarms.some(a => a.param === 'noco2' && a.tech)), `${name}: "No CO₂" technical alarm with an oesophageal tube`);
    assert.match(await page.textContent('#alarm-msg'), /No CO|SpO|low/, `${name}: alarm bar shows the technical alarm`);

    // the library's Elective GA card opens the pre-op briefing (patient summary + sign-in), which begins the theatre
    await page.goto(BASE);
    assert.ok(await page.$('a.card[href="?case=electiveGA#preop"]'), `${name}: Elective GA card goes to pre-op`);
    await page.goto(BASE + '?test&seed=3&case=electiveGA#preop');
    await page.waitForSelector('#preop', { state: 'visible', timeout: 3000 });
    assert.ok(!(await page.isVisible('#theatre')), `${name}: theatre hidden on pre-op`);
    assert.match(await page.textContent('#preop-sum'), /Age|years/, `${name}: pre-op shows the patient summary`);
    assert.match(await page.textContent('#preop-clin'), /ASA/, `${name}: pre-op shows the ASA grade`);
    assert.ok((await page.$$('#preop-list input[type=checkbox]')).length >= 5, `${name}: pre-op sign-in checklist present`);
    const box = page.locator('#preop-list input[type=checkbox]').first();
    await box.check(); assert.ok(await box.isChecked(), `${name}: a sign-in item ticks`);
    await axe(page, `${name} pre-op`);
    assert.ok(/[?&]case=electiveGA#theatre$/.test(await page.getAttribute('#preop-begin', 'href')), `${name}: Begin goes to the theatre`);
    await page.click('#preop-begin');
    await page.waitForFunction(() => window.otsim && document.getElementById('n-hr').textContent !== '--');
    assert.ok(await page.evaluate(() => otsim.state.pd.asleep && otsim.state.aw.device === 'ett' && otsim.state.resp.mode === 'vc'), `${name}: Elective GA starts induced, intubated, ventilated`);
    assert.ok(await page.evaluate(() => otsim.state.gas.sao2 > 97), `${name}: Elective GA oxygenated`);

    // the deep link straight to the theatre still works; an unknown screen (or an unknown case) falls back to the library
    await page.goto(BASE + '?test&seed=3&case=electiveGA#theatre');
    await page.waitForFunction(() => window.otsim && document.getElementById('n-hr').textContent !== '--');
    assert.ok(await page.evaluate(() => otsim.state.aw.device === 'ett'), `${name}: direct ?case=electiveGA#theatre still induced`);
    await page.goto(BASE + '?case=nope#preop');
    await page.waitForSelector('#library', { state: 'visible', timeout: 3000 });
    await page.goto(BASE + '#nowhere');
    await page.waitForSelector('#library', { state: 'visible', timeout: 3000 });
    await page.close();
  }
  assert.deepEqual(errors, [], 'console errors');
  assert.deepEqual(outside, [], 'no requests outside the folder');
  console.log('ot-sim e2e: ok');
} finally { await b.close(); }
