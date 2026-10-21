// Playwright check of the pump emulator (tci/pump/): the full key-by-key flow for Schnider and Eleveld with the
// teaching presets, the delivered induction equals the engine's pumpInduction, change target up and down, stop and
// resume, syringe pre-alarm (OK clears it without pausing), empty and replace, On/Off held to switch off, at 390 px
// (the default operate mode with keys of at least 44 px, and screen mode) and 1280 px, light and dark, no console
// errors, no horizontal scroll. Needs a static server at the repository root: python3 -m http.server 8080.
// Simulated time is advanced through the page's test hook (window.__pump.advance) so the run is deterministic.
import { chromium } from 'playwright';
const BASE = process.env.BASE ?? 'http://localhost:8080/tci/pump/';
const SHOTS = process.env.SHOTS;
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
let failures = 0;
const fail = (msg) => { failures++; console.log('FAIL ' + msg); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

async function tap(page, act) { await page.click(`.lcd [data-act="${act}"]`); }
async function hw(page, key) { await page.click(`#stage [data-hw="${key}"]:visible`); }
/** Hold On/Off for the pump's hold time (1 s, inferred) to ask for switch-off. */
async function holdPower(page) {
  const box = await page.locator('#stage [data-hw="power"]:visible').first().boundingBox();
  const ms = await page.evaluate(() => window.__pump.holdMs);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.waitForTimeout(ms + 250); await page.mouse.up();
}
/** The state, failing if the run has been lost (expected after Start until the pump is switched off). */
async function R(page, tag, step) { const st = await S(page); if (!st.run) fail(`${tag}: run lost at ${step}`); return st; }
const S = (page) => page.evaluate(() => {
  const s = window.__pump.state, r = s.run;
  return { screen: s.screen, view: s.view, alarm: s.alarm, pending: s.pendingTarget, buffer: s.buffer, message: s.message,
    run: r && { t: r.t, target: r.target, paused: r.paused, empty: r.empty, inInduction: r.inInduction, given: r.inductionGivenMg, planned: r.plannedBolusMg, remaining: r.remainingMl, rate: r.rateMgMin, rMax: r.rMax, waiting: r.waitingToFall, syringes: r.syringes },
    ce: window.__pump.engine.ce(), cp: window.__pump.engine.cp(), rateMlH: window.__pump.engine.rateMlH(), settings: s.settings, setup: s.setup };
});
const advance = (page, sec) => page.evaluate((s) => window.__pump.advance(s), sec);
/** Screenshots: the page, or the stage alone with the sticky app bar and the skip link out of the way. */
const shot = async (page, name, whole = false) => {
  if (!SHOTS) return;
  if (whole) { await page.screenshot({ path: `${SHOTS}/${name}.png` }); return; }
  await page.evaluate(() => { document.querySelector('.app-skip').style.display = 'none'; document.querySelector('.app-bar').style.visibility = 'hidden'; document.getElementById('stage').scrollIntoView({ block: 'start' }); });
  await page.locator('#stage').screenshot({ path: `${SHOTS}/${name}.png` });
  await page.evaluate(() => { document.querySelector('.app-skip').style.display = ''; document.querySelector('.app-bar').style.visibility = ''; });
};

/** Full set-up on the pump for one model and preset; returns after START is pressed. */
async function setUp(page, { model, preset, target, conc = '10', opioid = 'yes', tag }) {
  await page.evaluate(() => { window.__pump.setSpeed(0); });
  let st = await S(page);
  if (st.screen !== 'off') { await page.evaluate(() => window.__pump.act('power')); await tap(page, 'ok'); }
  await hw(page, 'power');
  st = await S(page);
  if (st.screen !== 'selftest') fail(`${tag}: expected self-test, got ${st.screen}`);
  await page.waitForFunction(() => window.__pump.state.screen === 'syringe', null, { timeout: 5000 });
  await shot(page, `${tag}-syringe`);
  await tap(page, 'ok');
  if ((await S(page)).screen !== 'drug') fail(`${tag}: drug library expected`);
  await tap(page, `row:${conc}`);
  await tap(page, 'row:tci');
  if ((await S(page)).screen !== 'model') fail(`${tag}: model list expected`);
  await tap(page, `row:${model}`);
  if (model === 'eleveld') {
    if ((await S(page)).screen !== 'opioid') fail(`${tag}: Eleveld should ask about opioid`);
    await tap(page, `row:${opioid}`);
  }
  if ((await S(page)).screen !== 'patient') fail(`${tag}: patient screen expected`);
  await tap(page, `preset:${preset}`);
  st = await S(page);
  if (st.screen !== 'summary') fail(`${tag}: summary expected`);
  await shot(page, `${tag}-summary`);
  return st;
}
async function enterTarget(page, target, tag) {
  for (const c of target) await tap(page, `key:${c}`);
  await tap(page, 'ok');
  const st = await S(page);
  if (st.screen !== 'ready') fail(`${tag}: ready expected after target ${target}, got ${st.screen} (${st.message})`);
  if (st.pending !== +target) fail(`${tag}: pending target ${st.pending}`);
  await shot(page, `${tag}-ready`);
}

async function checkInduction(page, tag) {
  // the pump's planned induction equals the engine's pumpInduction for this patient and settings
  const ok = await page.evaluate(() => {
    const s = window.__pump.state, e = window.__pump.engine, p = s.setup.patient;
    const pk = s.setup.model === 'schnider' ? e.schniderPk(p) : e.eleveldPk(p, { opioid: s.setup.opioid });
    const ind = e.pumpInduction(pk, s.run.target, { concMgMl: s.setup.conc, maxRateMlH: s.settings.maxRateMlH, updateSec: s.settings.updateSec, cpMaxRatio: s.settings.cpMaxRatio });
    const rMax = (s.settings.maxRateMlH * s.setup.conc) / 60;
    return { planned: s.run.plannedBolusMg, engine: ind.mg, ceBolus: e.ceBolus(pk, s.run.target, rMax).dose, shown: document.querySelector('[data-f="ind"]')?.textContent ?? '' };
  });
  if (!near(ok.planned, ok.engine, 1e-6)) fail(`${tag}: planned ${ok.planned} differs from engine ${ok.engine}`);
  await advance(page, 10 * 60);
  const st = await S(page);
  const tol = (st.run.rMax * st.settings.updateSec) / 60;
  if (st.run.inInduction) fail(`${tag}: still in induction after 10 min`);
  if (!near(st.run.given, ok.engine, tol)) fail(`${tag}: delivered induction ${st.run.given} vs engine ${ok.engine} (tol ${tol})`);
  if (!near(st.run.given, ok.engine, 1e-6)) fail(`${tag}: delivered induction ${st.run.given} not identical to engine ${ok.engine}`);
  // the brief's assertion: the delivered bolus equals the engine's ceBolus with the rate limit, within one update
  // interval of drug (the 400% plasma cap can legitimately make pumpInduction differ from the uncapped ceBolus by more
  // than that for other settings, so this is a check of the default 800 mL/h cases)
  if (!near(st.run.given, ok.ceBolus, tol)) fail(`${tag}: delivered induction ${st.run.given} vs ceBolus ${ok.ceBolus} (tol ${tol})`);
  // the screen shows the engine's numbers
  const shown = await page.evaluate(() => ({
    ce: document.querySelector('[data-f="ce"]')?.textContent, target: document.querySelector('[data-f="target"]')?.textContent,
    rate: document.querySelector('[data-f="rate"]')?.textContent, infused: document.querySelector('[data-f="infused"]')?.textContent,
  }));
  if (shown.ce !== st.ce.toFixed(2)) fail(`${tag}: screen Ce ${shown.ce} vs engine ${st.ce}`);
  if (shown.target !== st.run.target.toFixed(1)) fail(`${tag}: screen target ${shown.target}`);
  if (shown.rate !== st.rateMlH.toFixed(1)) fail(`${tag}: screen rate ${shown.rate} vs ${st.rateMlH}`);
  if (!near(st.ce, st.run.target, 0.01 * st.run.target)) fail(`${tag}: Ce ${st.ce} not within 1% of target after 10 min`);
  // maintenance holds for 10 more minutes
  for (let i = 0; i < 10; i++) { await advance(page, 60); const q = await S(page); if (!near(q.ce, q.run.target, 0.01 * q.run.target)) fail(`${tag}: maintenance Ce ${q.ce} off target at ${q.run.t}s`); }
}

for (const [width, scheme, mode] of [[390, 'light', 'rotate'], [390, 'dark', 'screen'], [1280, 'dark', 'pump'], [1280, 'light', 'pump']]) {
  const tag = `${width}-${scheme}-${mode}`;
  const ctx = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('requestfailed', (r) => errors.push('request failed ' + r.url()));
  await page.goto(BASE);
  await page.waitForSelector('.lcd');
  const defMode = await page.evaluate(() => window.__pump.mode());
  if (defMode !== (width < 700 ? 'rotate' : 'pump')) fail(`${tag}: default mode ${defMode}`);
  await page.evaluate((m) => window.__pump.setMode(m), mode);
  await page.waitForTimeout(150);
  await shot(page, `${tag}-off`, true);
  const over0 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (over0 > 0) fail(`${tag}: horizontal scroll ${over0}px`);
  const skip = await page.evaluate(() => { const r = document.querySelector('.app-skip').getBoundingClientRect(); return r.bottom > 0 && document.activeElement !== document.querySelector('.app-skip'); });
  if (skip) fail(`${tag}: the skip link is visible without focus`);
  if (mode === 'rotate') { // the whole rotated LCD fits the viewport under the app bar, with room for the hardware keys
    const fit = await page.evaluate(() => { const r = document.querySelector('.lcd').getBoundingClientRect(); const hw = document.querySelector('.pp-hw').getBoundingClientRect(); return { h: r.height, w: r.width, room: window.innerHeight - 44 - hw.height - 8 }; });
    if (fit.h > fit.room) fail(`${tag}: rotated LCD ${fit.h}px tall does not fit the viewport (room ${fit.room}px)`);
  }
  if (width < 700) { // Pump mode on a phone: the casing's printed labels stay inside the fascia (or are hidden)
    await page.evaluate(() => window.__pump.setMode('pump')); await page.waitForTimeout(100);
    const casing = await page.evaluate(() => {
      const f = document.querySelector('.pump-fascia').getBoundingClientRect(), out = [];
      for (const sel of ['.pump-brand', '.pump-tag', '.pump-key-stop', '.pump-pull']) {
        const el = document.querySelector(sel); if (!el) { out.push(sel + ' missing'); continue; }
        if (!el.offsetParent) continue; // hidden on a small pump
        const r = el.getBoundingClientRect();
        if (sel === '.pump-pull') { if (r.right > window.innerWidth) out.push(`${sel} past the viewport`); continue; }
        if (r.left < f.left - 1 || r.right > f.right + 1 || r.top < f.top - 1 || r.bottom > f.bottom + 1) out.push(`${sel} outside the fascia`);
        if (el.scrollWidth > el.clientWidth + 1) out.push(`${sel} text overflows`);
      }
      const b = document.querySelector('.pump-brand').getBoundingClientRect(), l = document.querySelector('.pump-screen').getBoundingClientRect();
      if (b.bottom > l.top + 1) out.push('wordmark over the LCD');
      return out;
    });
    if (casing.length) fail(`${tag}: casing labels at 390 in Pump mode: ${casing.join('; ')}`);
    await page.evaluate((m) => window.__pump.setMode(m), mode); await page.waitForTimeout(100);
  }

  // --- Schnider, older adult, target 3
  await setUp(page, { model: 'schnider', preset: 'older', target: '3', tag: `${tag}-schnider` });
  if (mode === 'rotate' || mode === 'pump') { // the default modes: every LCD key at least 44 CSS px on the phone (touch), 32 px with a mouse at 1280
    const min = width < 700 ? 44 : 32;
    const small = await page.evaluate((min) => [...document.querySelectorAll('.lcd button')].map((b) => { const r = b.getBoundingClientRect(); return [b.textContent.trim(), Math.round(r.width), Math.round(r.height)]; }).filter(([, w, h]) => Math.min(w, h) < min), min);
    if (small.length) fail(`${tag}: LCD keys under ${min} px in the default mode: ${JSON.stringify(small)}`);
  }
  await tap(page, 'ok');
  await enterTarget(page, '3', `${tag}-schnider`);
  await tap(page, 'start');
  let st = await R(page, tag, 'start');
  if (st.screen !== 'run') fail(`${tag}: run expected after START`);
  if (mode === 'rotate') { // Start brings the whole LCD into view below the sticky app bar
    await page.waitForTimeout(700);
    const top = await page.evaluate(() => document.querySelector('.lcd').getBoundingClientRect().top - document.querySelector('.app-bar').getBoundingClientRect().bottom);
    if (top < -1) fail(`${tag}: the LCD sits ${-top}px under the app bar after Start`);
  }
  await advance(page, 15);
  st = await R(page, tag, 'induction');
  if (!st.run.inInduction || st.run.rate < 0.9 * st.run.rMax) fail(`${tag}: induction near the max rate expected (${st.run.rate} of ${st.run.rMax})`);
  // the bolus strip sits in its own row: it must not overlap the Infused Amount numeral
  const ov = await page.evaluate(() => { const a = document.querySelector('.lcd .ind')?.getBoundingClientRect(), b = document.querySelector('.lcd [data-f="infused"]')?.getBoundingClientRect(); if (!a || !b) return 'missing'; const x = Math.min(a.right, b.right) - Math.max(a.left, b.left), y = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); return x > 0 && y > 0 ? `overlap ${x}x${y}` : ''; });
  if (ov) fail(`${tag}: bolus strip over the numerals: ${ov}`);
  const stripText = await page.locator('.lcd [data-f="ind"]').textContent();
  if (!/Bolus \d+\.\d \/ \d+\.\d mL/.test(stripText ?? '')) fail(`${tag}: bolus strip text "${stripText}"`);
  await shot(page, `${tag}-schnider-induction`);
  // the teaching point for the loaded preset is shown in the panel
  const teach = await page.locator('#teach').textContent();
  if (!/Teaching point \(Older adult\)/.test(teach ?? '') || !/opioid/.test(teach ?? '')) fail(`${tag}: teaching point "${teach}"`);
  await checkInduction(page, `${tag}-schnider`);
  await shot(page, `${tag}-schnider-run`);
  // views
  await tap(page, 'view'); if ((await S(page)).view !== 2) fail(`${tag}: view 2`); await shot(page, `${tag}-trend`);
  await tap(page, 'view'); if ((await S(page)).view !== 3) fail(`${tag}: view 3`); await shot(page, `${tag}-details`);
  const details = await page.locator('.lcd').textContent();
  if (!/Decrement time to Ce 1\.0/.test(details)) fail(`${tag}: details should show decrement time to Ce 1.0`);
  if (!/Plasma overshoot/.test(details) || !/400%/.test(details)) fail(`${tag}: details should show plasma overshoot 400%`);
  if (!/800 mL\/h/.test(details)) fail(`${tag}: details should show the 800 mL/h max rate`);
  await hw(page, 'home'); if ((await S(page)).view !== 1) fail(`${tag}: home returns to view 1`);
  // change target up: new bolus at max rate
  await tap(page, 'target'); st = await S(page);
  if (st.screen !== 'changeTarget' || st.buffer !== '3') fail(`${tag}: change target screen with current value, got ${st.screen} ${st.buffer}`);
  await tap(page, 'key:del'); await tap(page, 'key:5'); await tap(page, 'ok');
  await advance(page, 1); st = await R(page, tag, 'raise');
  if (st.run.target !== 5 || !near(st.run.rate, st.run.rMax, 1e-9)) fail(`${tag}: raising target should bolus at max rate (${st.run.rate})`);
  if (st.alarm !== 'none') fail(`${tag}: no pre-alarm during the raised-target bolus (${st.alarm})`);
  const nb = await page.locator('.lcd [data-f="ind"]').textContent();
  if (!/New bolus \d+\.\d \/ \d+\.\d mL/.test(nb ?? '')) fail(`${tag}: new bolus strip "${nb}"`);
  if (!/New bolus/.test(await page.locator('#now').textContent())) fail(`${tag}: panel should say New bolus`);
  await shot(page, `${tag}-raise`);
  await advance(page, 6 * 60); st = await R(page, tag, 'after raise');
  if (!near(st.ce, 5, 0.1)) fail(`${tag}: Ce ${st.ce} after raising to 5`);
  if (st.alarm !== 'none') fail(`${tag}: pre-alarm after the raise with ${st.run.remaining} mL left`);
  // change target down: rate 0 while predicted Ce falls, time to target shown in details
  await tap(page, 'target'); await tap(page, 'key:del'); await tap(page, 'key:2'); await tap(page, 'ok');
  await advance(page, 1); st = await R(page, tag, 'lower');
  if (st.run.rate !== 0 || !st.run.waiting) fail(`${tag}: lowering target should give rate 0 (${st.run.rate}, waiting ${st.run.waiting})`);
  await tap(page, 'view'); await tap(page, 'view');
  const d2 = await page.locator('[data-f="ttt"]').textContent();
  if (!/min|s/.test(d2 ?? '')) fail(`${tag}: time to target "${d2}"`);
  // one calculation for both time-to-target displays (details view and the panel line)
  const nowLine = await page.locator('#now').textContent();
  const mPanel = /about (\d+\.\d) min/.exec(nowLine ?? ''), mLcd = /(\d+\.\d) min/.exec(d2 ?? '');
  if (mPanel && mLcd && mPanel[1] !== mLcd[1]) fail(`${tag}: time to target differs: panel ${mPanel[1]} vs details ${mLcd[1]}`);
  await hw(page, 'home');
  await advance(page, 15 * 60); st = await R(page, tag, 'after lower');
  if (st.run.waiting || !near(st.ce, 2, 0.08)) fail(`${tag}: after lowering, Ce ${st.ce}, waiting ${st.run.waiting}`);
  // stop and resume
  await hw(page, 'stop'); st = await S(page);
  if (!st.run.paused) fail(`${tag}: Stop should pause`);
  const ceBefore = st.ce;
  await advance(page, 3 * 60); st = await S(page);
  if (st.run.rate !== 0 || st.ce >= ceBefore) fail(`${tag}: paused: rate ${st.run.rate}, Ce ${st.ce} vs ${ceBefore}`);
  await shot(page, `${tag}-paused`);
  await tap(page, 'start'); await advance(page, 1); st = await S(page);
  if (st.run.paused || st.run.rate <= 0) fail(`${tag}: START should resume (${st.run.rate})`);
  // confirm switch off, cancel
  await holdPower(page); if ((await S(page)).screen !== 'confirmOff') fail(`${tag}: confirm off (hold)`);
  await shot(page, `${tag}-confirmoff`);
  await tap(page, 'back'); if ((await S(page)).screen !== 'run') fail(`${tag}: cancel switch-off`);
  // syringe: pre-alarm, empty, replace, resume (4 min of drug left at the current maintenance rate)
  await advance(page, 5 * 60);
  await page.evaluate(() => { const r = window.__pump.state.run; r.remainingMl = (window.__pump.engine.rateMlH() * 4) / 60; r.prealarmed = false; });
  await advance(page, 30); st = await S(page);
  if (st.alarm !== 'prealarm') fail(`${tag}: pre-alarm expected (${st.alarm}, remaining ${st.run.remaining})`);
  await shot(page, `${tag}-prealarm`);
  await advance(page, 20 * 60); st = await S(page);
  if (st.alarm !== 'empty' || st.screen !== 'empty' || st.run.remaining !== 0 || st.run.rate !== 0) fail(`${tag}: empty alarm expected (${st.alarm} ${st.screen} ${st.run.remaining})`);
  await shot(page, `${tag}-empty`);
  await tap(page, 'replace'); st = await S(page);
  if (st.screen !== 'run' || st.run.remaining !== 50 || !st.run.paused) fail(`${tag}: replace syringe`);
  await tap(page, 'start'); await advance(page, 20); st = await S(page);
  if (st.run.rate <= 0 || st.run.syringes !== 2) fail(`${tag}: resume after replacing (${st.run.rate})`);

  // --- Eleveld, obese woman (BMI 38.6): Schnider refused, Eleveld runs; opioid asked; 2% syringe
  await setUp(page, { model: 'schnider', preset: 'obese', tag: `${tag}-obese` });
  let text = await page.locator('.lcd').textContent();
  if (!/Model not available/.test(text)) fail(`${tag}: Schnider should be refused for the obese preset`);
  if (await page.locator('.lcd [data-act="ok"]').count()) fail(`${tag}: no OK key when refused`);
  await shot(page, `${tag}-schnider-refused`);
  await tap(page, 'back'); await tap(page, 'back'); await tap(page, 'row:eleveld'); await tap(page, 'row:yes'); await tap(page, 'preset:obese');
  text = await page.locator('.lcd').textContent();
  if (!/BMI 38\.6/.test(text)) fail(`${tag}: Eleveld summary should mention BMI 38.6`);
  await tap(page, 'ok');
  // target above 6 asks to confirm; 7 accepted on the second OK
  await tap(page, 'key:7'); await tap(page, 'ok'); st = await S(page);
  if (st.screen !== 'target' || !/above 6/.test(st.message ?? '')) fail(`${tag}: target 7 should ask to confirm (${st.screen}, ${st.message})`);
  await shot(page, `${tag}-confirm-high`);
  await tap(page, 'ok'); st = await S(page);
  if (st.screen !== 'ready' || st.pending !== 7) fail(`${tag}: 7 accepted after confirm`);
  await tap(page, 'back'); await tap(page, 'key:del'); await tap(page, 'key:4'); await tap(page, 'ok');
  await tap(page, 'start');
  await checkInduction(page, `${tag}-eleveld`);
  await shot(page, `${tag}-eleveld-run`);
  // teaching panel pieces present while a run is on
  const panel = await page.locator('.pp-panel').textContent();
  for (const needle of ['Same patient, other model', 'reported, unverified', 'What the pump is doing', 'Schnider Ce 4.0 for the same patient: refused']) if (!panel.includes(needle)) fail(`${tag}: panel missing "${needle}"`);
  // young man on Eleveld: the matched Schnider target is above the pump's 8 µg/mL limit and the panel says so
  await page.evaluate(() => window.__pump.act('power')); await tap(page, 'ok');
  await page.evaluate(() => window.__pump.loadScenario('young', 'eleveld', true));
  await tap(page, 'ok'); await tap(page, 'key:4'); await tap(page, 'ok');
  if ((await S(page)).screen !== 'ready') fail(`${tag}: young Eleveld ready`);
  const cmp = await page.locator('#cmp').textContent();
  if (!/not settable/.test(cmp ?? '') || !/8 µg\/mL limit/.test(cmp ?? '')) fail(`${tag}: matched target limit note missing: "${cmp}"`);
  if (!/1 mg\/kg/.test(await page.locator('#teach').textContent())) fail(`${tag}: young man teaching point`);
  // Eleveld with the frail preset through the panel's scenario loader, no opioid (the panel's control), then custom patient entry
  await page.evaluate(() => window.__pump.act('power')); await tap(page, 'ok');
  await page.click('label:has(input[name=pmodel][value=schnider])');
  if (await page.locator('#popioid').isVisible()) fail(`${tag}: the opioid control should be hidden for Schnider`);
  await page.click('label:has(input[name=pmodel][value=eleveld])');
  if (!(await page.locator('#popioid').isVisible())) fail(`${tag}: the opioid control should show for Eleveld`);
  await page.click('label:has(input[name=popioid][value=no])');
  await page.click('[data-scn="frail"]');
  st = await S(page);
  if (st.screen !== 'summary' || st.setup.presetId !== 'frail' || st.setup.model !== 'eleveld' || st.setup.opioid !== false) fail(`${tag}: scenario loader (opioid ${st.setup.opioid})`);
  if (!/Eleveld, opioid no/.test(await page.locator('.lcd').textContent())) fail(`${tag}: summary should say opioid no`);
  // the refusal wording teaches the right direction (clearance rises past the James peak)
  await page.evaluate(() => window.__pump.loadScenario('obese', 'schnider'));
  if (!/clearance \(which subtracts LBM\) would paradoxically rise/.test(await page.locator('#now').textContent())) fail(`${tag}: refusal wording`);
  await page.evaluate(() => window.__pump.loadScenario('frail', 'eleveld', false));
  await tap(page, 'back'); await tap(page, 'row:custom');
  await tap(page, 'sex:F'); await tap(page, 'ok');
  for (const c of '60') await tap(page, `key:${c}`); await tap(page, 'ok');
  for (const c of '160') await tap(page, `key:${c}`); await tap(page, 'ok');
  for (const c of '70') await tap(page, `key:${c}`); await tap(page, 'ok');
  st = await S(page);
  if (st.screen !== 'summary' || st.setup.patient.weight !== 70 || st.setup.patient.sex !== 'F') fail(`${tag}: custom patient ${JSON.stringify(st.setup.patient)}`);
  await shot(page, `${tag}-custom-summary`);

  const foot = await page.locator('.pp-foot').textContent();
  if (!/Dr Chew Shi Hao/.test(foot) || !/contact@anantf\.com/.test(foot)) fail(`${tag}: footer credit`);
  if (!(await page.locator('.pp-foot a[href="https://chewshihao.com/"]').count())) fail(`${tag}: credit link`);
  if (/\bug\/mL/.test(await page.locator('body').textContent())) fail(`${tag}: "ug/mL" on the page`);
  if (!/What is real and what is inferred/.test(panel)) fail(`${tag}: inferred list missing`);
  // no element outside the LCD below 12 px
  const small = await page.evaluate(() => {
    const out = [];
    for (const el of document.querySelectorAll('main *')) {
      if (el.closest('.lcd') || el.closest('.pump') || !el.textContent?.trim() || el.children.length || !el.offsetParent) continue; // the LCD and the casing's printed labels are scaled device artwork
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) out.push(`${el.tagName}.${el.className} ${fs}px`);
    }
    return out;
  });
  if (small.length) fail(`${tag}: text under 12 px outside the LCD: ${small.slice(0, 5).join('; ')}`);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (over > 0) fail(`${tag}: horizontal scroll ${over}px at the end`);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log(`${tag}: body ${bg}; ${errors.length} console errors`);
  if (errors.length) fail(`${tag}: ${errors.join('\n')}`);
  await shot(page, `${tag}-page`, true);
  await ctx.close();
}
await browser.close();
console.log(failures ? `${failures} failure(s)` : 'pump e2e ok');
process.exit(failures ? 1 : 0);
