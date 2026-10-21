// Pump emulator: state machine and number equality with the engine (pure parts, no DOM).
import { describe, expect, test } from 'vitest';
import { PUMP_DEFAULTS, eleveldPk, pumpInduction, schniderPk, bmi, jamesPeakWeight } from '../src/engine';
import {
  PumpState, act, advanceRun, ce, cp, comparison, initialState, loadScenario, nowLine, plannedBolus, predict, rateMlH,
  summaryFor, tick, timeToFall, timeToTarget, TARGET_CONFIRM, WAKE_CE,
} from '../src/pump/sim';
import { PRESETS } from '../src/pump/presets';

const keys = (st: PumpState, s: string) => { for (const c of s) act(st, `key:${c}`); };

/** Walk the real set-up flow: power, self-test, syringe, drug, TCI, model, (opioid), preset, summary, target, ready. */
function setUp(model: 'schnider' | 'eleveld', preset: string, target: string, conc: '10' | '20' = '10', opioid = true): PumpState {
  const st = initialState();
  expect(st.screen).toBe('off');
  act(st, 'power');
  expect(st.screen).toBe('selftest');
  tick(st, 1, 0); expect(st.screen).toBe('selftest');
  tick(st, 1.5, 0); expect(st.screen).toBe('syringe');
  act(st, 'ok'); expect(st.screen).toBe('drug');
  act(st, `row:${conc}`); expect(st.screen).toBe('mode'); expect(st.setup.conc).toBe(+conc);
  act(st, 'row:standard'); expect(st.screen).toBe('standard'); act(st, 'back'); expect(st.screen).toBe('mode');
  act(st, 'row:tci'); expect(st.screen).toBe('model');
  act(st, `row:${model}`);
  if (model === 'eleveld') { expect(st.screen).toBe('opioid'); act(st, opioid ? 'row:yes' : 'row:no'); }
  expect(st.screen).toBe('patient');
  act(st, `preset:${preset}`); expect(st.screen).toBe('summary');
  act(st, 'ok'); expect(st.screen).toBe('target');
  keys(st, target);
  act(st, 'ok');
  return st;
}

describe('set-up flow', () => {
  test('Schnider, young man, target 4: reaches ready, start runs', () => {
    const st = setUp('schnider', 'young', '4');
    expect(st.screen).toBe('ready');
    expect(st.pendingTarget).toBe(4);
    act(st, 'start');
    expect(st.screen).toBe('run');
    expect(st.run?.target).toBe(4);
  });
  test('keypad: decimal entry, delete, length limit', () => {
    const st = setUp('schnider', 'young', '3.5');
    expect(st.pendingTarget).toBe(3.5);
    act(st, 'back'); expect(st.screen).toBe('target'); expect(st.buffer).toBe('3.5');
    act(st, 'key:del'); act(st, 'key:del'); act(st, 'key:7'); expect(st.buffer).toBe('37');
    act(st, 'ok'); expect(st.screen).toBe('target'); expect(st.message).toMatch(/0\.5 to 8/);
  });
  test('target above 6 asks to confirm; below 0.5 refused', () => {
    const st = setUp('eleveld', 'young', '7');
    expect(st.screen).toBe('target');
    expect(st.confirmHigh).toBe(true);
    expect(st.message).toMatch(new RegExp(`above ${TARGET_CONFIRM}`));
    act(st, 'ok');
    expect(st.screen).toBe('ready');
    const st2 = setUp('eleveld', 'young', '0.4');
    expect(st2.screen).toBe('target');
  });
  test('obese woman: Schnider refused (past the James peak), Eleveld accepted with a BMI note', () => {
    const st = initialState();
    act(st, 'power'); tick(st, 2, 0); act(st, 'ok'); act(st, 'row:10'); act(st, 'row:tci'); act(st, 'row:schnider'); act(st, 'preset:obese');
    expect(st.screen).toBe('summary');
    const sm = summaryFor(st.setup, st.settings);
    expect(sm.refused).toBe(true);
    expect(bmi(st.setup.patient)).toBeCloseTo(38.6, 1);
    expect(st.setup.patient.weight).toBeGreaterThan(jamesPeakWeight(st.setup.patient));
    act(st, 'ok'); expect(st.screen).toBe('summary'); // stays
    const e = setUp('eleveld', 'obese', '4');
    expect(e.screen).toBe('ready');
    expect(summaryFor(e.setup, e.settings).warnings.some((w) => /BMI/.test(w.text))).toBe(true);
  });
  test('custom patient entry and validation', () => {
    const st = initialState();
    act(st, 'power'); tick(st, 2, 0); act(st, 'ok'); act(st, 'row:20'); act(st, 'row:tci'); act(st, 'row:eleveld'); act(st, 'row:no');
    act(st, 'row:custom'); expect(st.screen).toBe('custom');
    act(st, 'ok'); expect(st.custom.field).toBe(1); // sex preset from the default patient
    act(st, 'sex:F'); keys(st, '60'); act(st, 'ok'); expect(st.custom.field).toBe(2);
    keys(st, '99'); act(st, 'ok'); expect(st.custom.field).toBe(2); expect(st.message).toMatch(/100 to 230/);
    act(st, 'key:del'); act(st, 'key:del'); keys(st, '160'); act(st, 'ok'); expect(st.custom.field).toBe(3);
    keys(st, '70'); act(st, 'ok');
    expect(st.screen).toBe('summary');
    expect(st.setup.patient).toEqual({ sex: 'F', age: 60, height: 160, weight: 70 });
    expect(st.setup.opioid).toBe(false);
    expect(st.setup.presetId).toBeNull();
  });
  test('home during set-up returns to the drug library; On/Off asks to confirm, Stop and keys are inert when off', () => {
    const st = setUp('schnider', 'older', '3');
    act(st, 'home'); expect(st.screen).toBe('drug');
    act(st, 'power'); expect(st.screen).toBe('confirmOff');
    act(st, 'back'); expect(st.screen).toBe('drug');
    act(st, 'power'); act(st, 'ok'); expect(st.screen).toBe('off');
    act(st, 'stop'); act(st, 'ok'); expect(st.screen).toBe('off');
  });
  test('scenario loader jumps to the summary', () => {
    const st = initialState();
    loadScenario(st, 'frail', 'schnider');
    expect(st.screen).toBe('summary');
    expect(st.setup.model).toBe('schnider');
    expect(nowLine(st)).toMatch(/Patient accepted/);
  });
});

describe('induction bolus equals the engine', () => {
  for (const model of ['schnider', 'eleveld'] as const) for (const p of PRESETS) {
    if (model === 'schnider' && p.id === 'obese') continue;
    test(`${model}, ${p.id}: delivered bolus = ceBolus with the rate limit, within one update interval of drug`, () => {
      const st = setUp(model, p.id, '4');
      act(st, 'start');
      const run = st.run!;
      const pk = model === 'schnider' ? schniderPk(p.patient) : eleveldPk(p.patient, { opioid: true });
      expect(st.settings.maxRateMlH).toBe(800); // VERIFIED department default
      const rMax = (st.settings.maxRateMlH * st.setup.conc) / 60;
      const expected = pumpInduction(pk, 4, { concMgMl: st.setup.conc, maxRateMlH: 800, updateSec: 10, cpMaxRatio: 4 }).mg;
      expect(run.plannedBolusMg).toBeCloseTo(expected, 6);
      expect(plannedBolus(st.setup, st.settings, 4).mg).toBeCloseTo(expected, 6);
      advanceRun(st, 600);
      expect(run.inInduction).toBe(false);
      const tol = rMax * (st.settings.updateSec / 60);
      expect(Math.abs(run.inductionGivenMg - expected)).toBeLessThan(tol);
      expect(Math.abs(run.inductionGivenMg - expected)).toBeLessThan(1e-6); // same controller, same steps: identical
      // the peak Ce reached is at the target (the bolus was sized for it)
      const peak = Math.max(...run.samples.map((s) => s.ce));
      expect(peak).toBeGreaterThan(3.9);
      expect(peak).toBeLessThan(4.15);
      // plasma overshoot limit 400%: Cp never above 4 x target (one update interval of slack)
      expect(Math.max(...run.samples.map((s) => s.cp))).toBeLessThan(16.05);
    });
  }
  test('2% syringe: half the mL, same mg', () => {
    const a = setUp('eleveld', 'young', '4', '10'), b = setUp('eleveld', 'young', '4', '20');
    const pa = plannedBolus(a.setup, a.settings, 4), pb = plannedBolus(b.setup, b.settings, 4);
    expect(pb.ml).toBeLessThan(pa.ml); // the 2% syringe at the same mL/h gives drug twice as fast, so the bolus (mg) differs slightly
    expect(Math.abs(pb.mg - pa.mg) / pa.mg).toBeLessThan(0.03);
  });
});

describe('maintenance, target changes, stop and resume', () => {
  test('Ce holds within 1% of target in maintenance', () => {
    const st = setUp('eleveld', 'young', '4');
    act(st, 'start');
    advanceRun(st, 10 * 60);
    for (let i = 0; i < 10; i++) { advanceRun(st, 60); expect(Math.abs(ce(st.run!) - 4) / 4).toBeLessThan(0.01); }
    expect(st.alarm).toBe('none'); // the pre-alarm is not judged during the bolus
    expect(rateMlH(st.run!, 10)).toBeGreaterThan(0);
    expect(timeToTarget(st)).toBe(0);
  });
  test('raising the target gives a new bolus at the maximum rate', () => {
    const st = setUp('schnider', 'older', '3');
    act(st, 'start'); advanceRun(st, 15 * 60);
    act(st, 'target'); expect(st.screen).toBe('changeTarget'); expect(st.buffer).toBe('3');
    act(st, 'key:del'); keys(st, '5'); act(st, 'ok');
    expect(st.screen).toBe('run'); expect(st.run!.target).toBe(5);
    advanceRun(st, 1);
    expect(st.run!.rateMgMin).toBeCloseTo(st.run!.rMax, 6);
    const ttt = timeToTarget(st);
    expect(ttt).not.toBeNull(); expect(ttt!).toBeGreaterThan(0); expect(ttt!).toBeLessThan(5);
    advanceRun(st, 5 * 60);
    expect(Math.abs(ce(st.run!) - 5) / 5).toBeLessThan(0.02);
  });
  test('lowering the target: rate 0 until the predicted Ce falls, then maintenance resumes', () => {
    const st = setUp('eleveld', 'young', '4');
    act(st, 'start'); advanceRun(st, 15 * 60);
    act(st, 'target'); act(st, 'key:del'); keys(st, '2'); act(st, 'ok');
    advanceRun(st, 1);
    expect(st.run!.rateMgMin).toBe(0);
    expect(st.run!.waitingToFall).toBe(true);
    const tf = timeToFall(st.run!, 2);
    expect(tf).not.toBeNull(); expect(tf!).toBeGreaterThan(1);
    advanceRun(st, (tf! + 3) * 60);
    expect(st.run!.waitingToFall).toBe(false);
    expect(st.run!.rateMgMin).toBeGreaterThan(0);
    expect(Math.abs(ce(st.run!) - 2) / 2).toBeLessThan(0.03);
  });
  test('Stop pauses delivery, the model keeps running; Start resumes with a catch-up', () => {
    const st = setUp('eleveld', 'young', '4');
    act(st, 'start'); advanceRun(st, 15 * 60);
    const before = ce(st.run!);
    act(st, 'stop');
    expect(st.run!.paused).toBe(true);
    advanceRun(st, 5 * 60);
    expect(st.run!.rateMgMin).toBe(0);
    expect(ce(st.run!)).toBeLessThan(before * 0.9);
    const infused = st.run!.infusedMg;
    act(st, 'start');
    expect(st.run!.paused).toBe(false);
    advanceRun(st, 1);
    expect(st.run!.rateMgMin).toBeGreaterThan(st.run!.rMax * 0.5);
    advanceRun(st, 5 * 60);
    expect(st.run!.infusedMg).toBeGreaterThan(infused);
    expect(Math.abs(ce(st.run!) - 4) / 4).toBeLessThan(0.02);
  });
  test('view cycles 1-2-3-1; home returns to view 1', () => {
    const st = setUp('eleveld', 'young', '4'); act(st, 'start');
    act(st, 'view'); expect(st.view).toBe(2); act(st, 'view'); expect(st.view).toBe(3); act(st, 'view'); expect(st.view).toBe(1);
    act(st, 'view'); act(st, 'home'); expect(st.view).toBe(1); expect(st.screen).toBe('run');
  });
  test('prediction and decrement time are finite and sensible', () => {
    const st = setUp('schnider', 'young', '4'); act(st, 'start'); advanceRun(st, 10 * 60);
    const p = predict(st, 10);
    expect(p.length).toBeGreaterThan(50);
    for (const q of p) expect(Math.abs(q.ce - 4) / 4).toBeLessThan(0.02);
    const dec = timeToFall(st.run!, 1.2);
    expect(dec!).toBeGreaterThan(3); expect(dec!).toBeLessThan(30);
  });
});

describe('syringe alarms', () => {
  test('pre-alarm at 5 min left, empty stops the pump, replace and Start resume', () => {
    const st = setUp('eleveld', 'young', '4'); act(st, 'start'); advanceRun(st, 10 * 60);
    const run = st.run!;
    const r = rateMlH(run, 10);
    run.remainingMl = (r * 6) / 60; // 6 min of drug at this rate
    advanceRun(st, 90);
    expect(st.alarm).toBe('prealarm');
    expect(st.screen).toBe('run');
    const infusedBefore = run.infusedMg;
    advanceRun(st, 20 * 60);
    expect(st.alarm).toBe('empty'); expect(st.screen).toBe('empty');
    expect(run.remainingMl).toBe(0); expect(run.rateMgMin).toBe(0); expect(run.empty).toBe(true);
    expect(run.infusedMg).toBeGreaterThan(infusedBefore);
    const infusedAtEmpty = run.infusedMg;
    advanceRun(st, 60); expect(run.infusedMg).toBe(infusedAtEmpty); // nothing delivered while empty
    act(st, 'replace'); expect(st.screen).toBe('run'); expect(run.remainingMl).toBe(50); expect(run.paused).toBe(true);
    act(st, 'start'); advanceRun(st, 30);
    expect(run.rateMgMin).toBeGreaterThan(0);
    expect(run.syringes).toBe(2);
    expect(st.alarm).toBe('none'); // the catch-up bolus at 800 mL/h with a fresh 50 mL syringe is not a pre-alarm
    advanceRun(st, 5 * 60);
    expect(st.alarm).toBe('none');
  });
  test('raising the target with a full syringe gives no pre-alarm (the bolus runs at the maximum rate)', () => {
    const st = setUp('schnider', 'young', '3'); act(st, 'start'); advanceRun(st, 15 * 60);
    st.run!.remainingMl = 50; // a fresh syringe, as in the review's reproduction
    act(st, 'target'); act(st, 'key:del'); keys(st, '6'); act(st, 'ok');
    advanceRun(st, 5);
    expect(st.run!.rateMgMin).toBeCloseTo(st.run!.rMax, 6);
    expect(st.run!.inBolus).toBe(true);
    expect(st.run!.bolusPlannedMg).toBeGreaterThan(st.run!.bolusGivenMg);
    expect(nowLine(st)).toMatch(/New bolus/);
    advanceRun(st, 10 * 60);
    expect(st.alarm).toBe('none');
    expect(st.run!.prealarmed).toBe(false);
    expect(st.run!.inBolus).toBe(false);
    expect(Math.abs(st.run!.bolusGivenMg - st.run!.bolusPlannedMg)).toBeLessThan(1e-6); // the strip's planned mL is the engine's
  });
  test('pre-alarm: OK acknowledges without pausing; it clears by itself when the time left rises', () => {
    const st = setUp('eleveld', 'older', '3'); act(st, 'start'); advanceRun(st, 10 * 60);
    const run = st.run!;
    run.remainingMl = (rateMlH(run, 10) * 4.5) / 60;
    advanceRun(st, 15);
    expect(st.alarm).toBe('prealarm');
    act(st, 'ack');
    expect(st.alarm).toBe('none'); expect(run.paused).toBe(false); expect(run.rateMgMin).toBeGreaterThan(0);
    advanceRun(st, 60); expect(st.alarm).toBe('none'); // stays acknowledged
    // a new run: the warning clears itself when the remaining time rises (the syringe is topped up by the teaching panel)
    const st2 = setUp('eleveld', 'older', '3'); act(st2, 'start'); advanceRun(st2, 10 * 60);
    st2.run!.remainingMl = (rateMlH(st2.run!, 10) * 4.5) / 60;
    advanceRun(st2, 15); expect(st2.alarm).toBe('prealarm');
    st2.run!.remainingMl = 50; advanceRun(st2, 15);
    expect(st2.alarm).toBe('none'); expect(st2.run!.prealarmed).toBe(false);
  });
  test('messages use the micro sign, not "ug"', () => {
    const st = setUp('schnider', 'young', '9');
    expect(st.message).toContain('\u00b5g/mL'); expect(st.message).not.toContain('ug/mL');
    const st2 = setUp('schnider', 'young', '7'); expect(st2.message).toContain('\u00b5g/mL');
    act(st2, 'ok'); act(st2, 'back'); expect(nowLine(st2)).not.toMatch(/\bug\/mL/);
  });
});

describe('planned bolus and the ready screen', () => {
  test('plannedBolus returns the peak time and whether the plasma limit capped the rate', () => {
    const st = setUp('eleveld', 'young', '4');
    const b = plannedBolus(st.setup, st.settings, 4);
    expect(b.tPeakMin).toBeGreaterThan(1); expect(b.tPeakMin).toBeLessThan(6);
    expect(typeof b.capped).toBe('boolean');
    expect(b.sec).toBeGreaterThanOrEqual((b.mg / (st.run?.rMax ?? (800 * 10) / 60)) * 60 - 1e-6); // never faster than the max rate
  });
  test('capped means the controller held Cp at the plasma limit, not a slower final top-up interval', () => {
    // young man, Schnider, Ce 4 at 800 mL/h: Cp peaks well under 16, so the bolus is not capped even though its last
    // 10 s interval runs below the maximum rate
    const a = setUp('schnider', 'young', '4');
    const pa = plannedBolus(a.setup, a.settings, 4);
    expect(pa.capped).toBe(false);
    expect(pa.mg).toBeLessThan((a.run?.rMax ?? (800 * 10) / 60) * pa.sec / 60 - 1e-6); // the last interval is partial
    act(a, 'start');
    let sawSlow = false, saidCap = false;
    for (let i = 0; i < 12; i++) { advanceRun(a, 10); if (a.run!.inInduction && a.run!.rateMgMin < 0.999 * a.run!.rMax && a.run!.rateMgMin > 0) { sawSlow = true; if (/plasma limit/.test(nowLine(a))) saidCap = true; } }
    expect(sawSlow).toBe(true); expect(saidCap).toBe(false);
    // young man, Eleveld, Ce 4 at 800 mL/h: the cap binds (Cp held at 16), so the bolus is capped and the panel says so
    const b = setUp('eleveld', 'young', '4');
    const pb = plannedBolus(b.setup, b.settings, 4);
    expect(pb.capped).toBe(true);
    act(b, 'start');
    let said = false, cpMax = 0;
    for (let i = 0; i < 30 && b.run!.inInduction; i++) { advanceRun(b, 10); cpMax = Math.max(cpMax, cp(b.run!)); if (b.run!.capped) { expect(nowLine(b)).toMatch(/holding Cp at the 400% plasma limit/); said = true; } }
    expect(said).toBe(true); expect(cpMax).toBeGreaterThan(15.9); expect(cpMax).toBeLessThan(16.01);
  });
  test('the ready screen peak time matches the run the pump gives', () => {
    for (const [model, preset] of [['schnider', 'young'], ['eleveld', 'obese'], ['eleveld', 'frail']] as const) {
      const st = setUp(model, preset, '3');
      const b = plannedBolus(st.setup, st.settings, 3);
      act(st, 'start');
      let best = 0, tBest = 0;
      for (let i = 0; i < 600; i++) { advanceRun(st, 1); const c = ce(st.run!); if (c > best) { best = c; tBest = st.run!.t / 60; } }
      expect(Math.abs(b.tPeakMin - tBest)).toBeLessThan(0.1);
    }
  });
  test('after the bolus, the panel explains the rate-0 wait for the peak (Schnider)', () => {
    const st = setUp('schnider', 'young', '4'); act(st, 'start');
    advanceRun(st, 60);
    if (st.run!.rateMgMin === 0 && !st.run!.inBolus) expect(nowLine(st)).toMatch(/Bolus complete/);
  });
});

describe('verified pump settings', () => {
  test('defaults: 800 mL/h, plasma overshoot 400%, decrement Ce 1.0', () => {
    const st = initialState();
    expect(st.settings.maxRateMlH).toBe(800);
    expect(st.settings.cpMaxRatio).toBe(4);
    expect(WAKE_CE).toBe(1.0);
    expect(PUMP_DEFAULTS.decrementCe).toBe(1.0);
  });
});

describe('comparison and dosing weight', () => {
  test('same patient, other model: matched target reproduces the bolus', () => {
    const st = setUp('eleveld', 'young', '4');
    const c = comparison(st.setup, st.settings, 4);
    expect(c.other).toBe('schnider');
    const ps = { concMgMl: 10, maxRateMlH: 800, updateSec: 10, cpMaxRatio: 4 };
    expect(Math.abs(pumpInduction(schniderPk(PRESETS[0].patient), c.matched, ps).mg - c.thisMg)).toBeLessThan(2); // step-wise dosing: within an interval's rounding
  });
  test('Servin firmware toggle lowers the obese Eleveld bolus', () => {
    const a = setUp('eleveld', 'obese', '4');
    const b = setUp('eleveld', 'obese', '4'); b.settings.servin = true;
    expect(plannedBolus(b.setup, b.settings, 4).mg).toBeLessThan(plannedBolus(a.setup, a.settings, 4).mg);
    expect(summaryFor(b.setup, b.settings).dosingWeight).toBeLessThan(105);
    const c = setUp('eleveld', 'young', '4'); c.settings.servin = true;
    expect(summaryFor(c.setup, c.settings).dosingWeight).toBe(75); // BMI < 30: no change
    // with Servin on, the summary shows the FFM the model actually uses and names the adjusted weight
    const sa = summaryFor(a.setup, a.settings), sb = summaryFor(b.setup, b.settings);
    expect(sb.ffm).toBeLessThan(sa.ffm);
    expect(sb.warnings.some((w) => /Servin, reported Space plus behaviour, unverified/.test(w.text))).toBe(true);
    expect(sa.warnings.some((w) => /unverified/.test(w.text))).toBe(true);
  });
  test('the Schnider refusal line teaches that clearance rises past the James peak', () => {
    const st = initialState(); loadScenario(st, 'obese', 'schnider');
    expect(summaryFor(st.setup, st.settings).refused).toBe(true);
    expect(nowLine(st)).toMatch(/clearance \(which subtracts LBM\) would paradoxically rise/);
    expect(nowLine(st)).not.toMatch(/clearance would fall/);
  });
});
