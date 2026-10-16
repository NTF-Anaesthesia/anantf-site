// Temperature (js/model/temp.js) against MODEL.md section 10. Run: node ot/test/temp.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const anaesthetised = () => {
  const s = createSim({ seed: 1, profile: { fixed } });
  s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 });
  s.act({ type: 'bolus', drug: 'rocuronium', dose: 1, unit: 'mg/kg', route: 'iv' });
  s.act({ type: 'tci', drug: 'propofol', target: 4 });
  return s;
};
const to = (s, mins) => { while (s.state.t < mins * 60) s.step(50); return s.state.temp.core; };

// awake, the core sits near 37 and the periphery a few degrees cooler
{
  const s = createSim({ seed: 1, profile: { fixed } });
  near(s.state.temp.core, 36.8, 0.3, 'awake core'); assert.ok(s.state.temp.periph > 31 && s.state.temp.periph < 35, 'periphery cooler');
  s.step(36000);
  near(s.state.temp.core, 36.8, 0.4, 'awake core stays near 37');
}
// under anaesthesia the core falls (redistribution): about -0.5 to -1.5 C in the first hour, then about -0.5 C/h, and
// it does not run away (plateau-ish)
{
  const s = anaesthetised(), t0 = s.state.temp.core;
  const t30 = to(s, 30), t60 = to(s, 60), t120 = to(s, 120), t180 = to(s, 180);
  assert.ok(t0 - t60 > 0.5 && t0 - t60 < 1.6, `fall in the first hour ${t0 - t60}`);
  assert.ok(t30 < t0 - 0.2, 'already falling by 30 min');
  assert.ok(t120 < t60 && t60 - t120 < t0 - t60, 'the fall slows after the first hour');
  assert.ok(t180 > 34, `does not run away ${t180}`);
}
// forced-air warming lifts the nadir and the patient rewarms
{
  const cold = anaesthetised(), warm = anaesthetised();
  warm.act({ type: 'warming', on: true });
  const tc = to(cold, 120), tw = to(warm, 120);
  assert.ok(tw > tc + 0.5, `warming keeps the patient warmer (${tw} vs ${tc})`);
}
// cold fluid cools: 1 L of crystalloid lowers the mean body temperature about 0.28 C (0.83 kcal/kg/°C)
{
  const s = createSim({ seed: 1, profile: { fixed } });
  const mean = x => x.state.temp.core * 0.66 + x.state.temp.periph * 0.34;
  const m0 = mean(s);
  s.act({ type: 'fluid', product: 'crystalloid', ml: 1000 });
  while ((s.state.cv.fl.given.crystalloid || 0) < 999) s.step(10);
  s.step(50);
  // compare against a no-fluid run over the same time, to isolate the fluid's effect
  const ref = createSim({ seed: 1, profile: { fixed } }); while (ref.state.t < s.state.t) ref.step(50);
  const drop = (mean(ref) - m0) - (mean(s) - m0);
  near(drop, 0.28, 0.12, '1 L crystalloid cools the mean body temperature');
}
// a warmer theatre and the temperature plumbing survive a long run without NaN
{
  const s = anaesthetised(); s.step(100000);
  assert.ok(Number.isFinite(s.state.temp.core) && Number.isFinite(s.state.temp.periph) && s.state.temp.core > 30, 'long run stable');
}

console.log('ot-sim temp: ok');
