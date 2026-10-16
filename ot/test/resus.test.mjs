// Resuscitation (js/model/resus.js, with cardio.js and gas.js) against MODEL.md section 13. Run: node ot/test/resus.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { shockSuccess, CPR_QUAL } from '../js/model/resus.js';

const band = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in [${lo}, ${hi}]`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3, paceThresh: 70 };
// a ventilated patient at steady state, then an arrest
const mk = () => { const s = createSim({ seed: 1, profile: { fixed } }); s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }); s.step(600); return s; };
const adv = (s, sec) => { s.step(Math.round(sec / s.state.dt)); return s; };
const co = s => s.state.cv.co, map = s => s.state.cv.map, etco2 = s => s.state.gas.etco2, spo2 = s => s.state.gas.sao2;

// baseline: no CPR, a perfusing rhythm, cprFrac 0
{
  const s = mk();
  assert.equal(s.state.resus.cprFrac, 0, 'no compressions at baseline');
  band(etco2(s), 30, 42, 'baseline EtCO2'); band(spo2(s), 98, 100, 'baseline SpO2');
}
// unassisted VF: no output, and now SpO2 falls over minutes (the M2.7 known miss, closed here), EtCO2 drops as no
// blood carries CO2 to the lungs
{
  const s = mk(); s.act({ type: 'rhythm', to: 'vf' });
  adv(s, 30); const sp30 = spo2(s);
  adv(s, 150); // 180 s total
  assert.ok(co(s) < 0.1, 'VF: no output');
  assert.ok(spo2(s) < sp30 - 10 && spo2(s) < 80, `SpO2 falls in arrest (${sp30.toFixed(0)} -> ${spo2(s).toFixed(0)})`);
  assert.ok(etco2(s) < 12, `EtCO2 low with no circulation (${etco2(s).toFixed(0)})`);
}
// CPR gives an output and an EtCO2 that rise with compression quality (MODEL.md section 8: typical EtCO2 ~10-20,
// excellent over 25; DBP over 30 reachable); a pause drops the flow at once
{
  const run = q => { const c = mk(); c.act({ type: 'rhythm', to: 'vf' }); adv(c, 20); c.act({ type: 'cpr', on: true, quality: q }); adv(c, 120); return c; };
  const poor = run('poor'), good = run('good'), exc = run('excellent');
  assert.ok(co(poor) < co(good) && co(good) < co(exc), 'output rises with quality');
  band(etco2(good), 12, 26, 'good-CPR EtCO2'); assert.ok(etco2(exc) >= etco2(good) && etco2(exc) > 24, `excellent-CPR EtCO2 ${etco2(exc).toFixed(0)}`);
  assert.ok(map(good) > 30, `DBP/MAP reachable with good CPR (${map(good).toFixed(0)})`);
  assert.ok(spo2(exc) > spo2(poor), 'better compressions oxygenate better');
  // a pause drops the output at once
  const c = run('good'); const coOn = co(c); c.act({ type: 'cpr', on: false }); adv(c, 5);
  assert.ok(co(c) < coOn * 0.3, `a pause drops the flow (${coOn.toFixed(2)} -> ${co(c).toFixed(2)})`);
}
// the shock-success curve (pure function): high in the first minute of VF, falling with time, higher with perfusion
{
  const vf = t => ({ rhythm: 'vf', since: 0 });
  const p0 = shockSuccess(vf(), { buildup: 0, amio: false, defib: { shocks: 0 } }, 0);
  const p5 = shockSuccess(vf(), { buildup: 0, amio: false, defib: { shocks: 0 } }, 300); // 5 min in VF
  assert.ok(p0 > 0.45 && p0 <= 0.97, `first-second success ${p0.toFixed(2)}`);
  assert.ok(p5 < p0, 'success falls with time in VF');
  const perf = shockSuccess(vf(), { buildup: 1, amio: false, defib: { shocks: 0 } }, 0);
  assert.ok(perf > p0, 'good perfusion before the shock helps');
  assert.equal(shockSuccess({ rhythm: 'asystole', since: 0 }, { buildup: 0 }, 0), 0, 'asystole is not shockable');
}
// defibrillation in the sim: a shock early in VF (with a seed that succeeds) converts to an organised rhythm and the
// circulation returns; a shock in asystole does nothing
{
  let converted = false;
  for (let seed = 1; seed <= 8 && !converted; seed++) {
    const s = createSim({ seed, profile: { fixed } }); s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }); s.step(600);
    s.act({ type: 'rhythm', to: 'vf' }); adv(s, 10); s.act({ type: 'cpr', on: true, quality: 'good' }); adv(s, 20);
    s.act({ type: 'defib', joules: 200 }); adv(s, 3);
    if (s.state.rh.rhythm === 'sinus') { converted = true; s.act({ type: 'cpr', on: false }); adv(s, 30); assert.ok(co(s) > 3 && map(s) > 55, `ROSC restores circulation (MAP ${map(s).toFixed(0)}, CO ${co(s).toFixed(2)})`); }
  }
  assert.ok(converted, 'an early shock converts VF on at least one seed');
  const a = mk(); a.act({ type: 'rhythm', to: 'asystole' }); adv(a, 10); a.act({ type: 'defib', joules: 200 }); adv(a, 3);
  assert.equal(a.state.rh.rhythm, 'asystole', 'a shock does not convert asystole');
  assert.match(a.state.resus.defib.lastOutcome, /not a shockable/, 'and says so');
}
// transcutaneous pacing: below the capture threshold nothing, at or above it the ventricles are paced
{
  const s = mk(); s.act({ type: 'rhythm', to: 'asystole' }); adv(s, 10);
  s.act({ type: 'pace', on: true, mA: 50 }); adv(s, 10);
  assert.equal(s.state.resus.pace.capturing, false, 'below threshold: no capture'); assert.equal(s.state.rh.rhythm, 'asystole', 'still asystole');
  s.act({ type: 'pace', on: true, mA: 85 }); adv(s, 10);
  assert.equal(s.state.resus.pace.capturing, true, 'at/above threshold: capture'); assert.equal(s.state.rh.rhythm, 'paced', 'paced rhythm');
  band(s.state.mon.hr, 64, 76, 'paced rate ~70');
  assert.ok(co(s) > 2, 'pacing makes an output');
}
// a long CPR run stays finite
{
  const s = mk(); s.act({ type: 'rhythm', to: 'vf' }); s.act({ type: 'cpr', on: true, quality: 'good' }); s.step(20000);
  assert.ok(Number.isFinite(map(s)) && Number.isFinite(co(s)) && Number.isFinite(spo2(s)), 'long CPR run stable');
}

console.log('ot-sim resus: ok');
