// Circulation (js/model/cardio.js, rhythm.js) against MODEL.md section 5. Run: node ot/test/cardio.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { bloodVolume, BARO, CV } from '../js/model/cardio.js';
import { exp } from '../js/model/fmath.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const mk = (o = {}) => createSim({ seed: 1, profile: { fixed, ...(o.profile || {}) }, ...o.sim });
// mean over `secs` seconds (beat-to-beat jitter averages out)
function avg(s, secs = 10) {
  const a = { hr: 0, sbp: 0, dbp: 0, map: 0, co: 0, cvp: 0 }, n = Math.round(secs / s.state.dt);
  for (let i = 0; i < n; i++) { s.step(1); for (const k in a) a[k] += s.state.cv[k] / n; }
  return a;
}

// steady state for the default patient: HR 72, 120/75, MAP 90, CO 5.4, CVP 4, LAP 8 (MODEL.md section 5)
{
  const s = mk(), a = avg(s, 60);
  near(a.hr, 72, 1, 'HR'); near(a.map, 90, 1.5, 'MAP'); near(a.sbp, 120, 2, 'SBP'); near(a.dbp, 75, 2, 'DBP');
  near(a.co, 5.4, 0.1, 'CO'); near(a.cvp, 4, 0.3, 'CVP'); near(s.state.cv.lap, 8, 0.5, 'LAP');
  near(s.state.cv.svr, 15.9, 0.6, 'SVR (Wood units)');
  // the monitor's HR follows the beats
  near(s.state.mon.hr, 72, 3, 'monitor HR');
  // beats reach the event ring with stroke volume and pressures
  const beats = s.state.ev.ring.filter(e => e.kind === 'beat');
  assert.ok(beats.length > 50 && beats.every(b => b.sv > 60 && b.sv < 90 && b.sbp > b.dbp));
}
// blood volume is conserved: drift under 1e-6 mL in an hour, through an induction and a stimulus
{
  const s = mk(), v0 = bloodVolume(s.state.cv);
  s.act({ type: 'bolus', drug: 'propofol', dose: 2, unit: 'mg/kg', route: 'iv' });
  s.step(3000);
  s.act({ type: 'stimulus', kind: 'laryngoscopy' });
  s.step(33000);
  assert.ok(Math.abs(bloodVolume(s.state.cv) - v0) < 1e-6, `volume drift ${bloodVolume(s.state.cv) - v0} mL`);
}
// dt 0.1 s against 0.01 s through an induction: within 1 mmHg and 1 beat/min
{
  const run = dt => { const s = mk({ sim: { dt, warmup: 120 } }); s.act({ type: 'bolus', drug: 'propofol', dose: 2, unit: 'mg/kg', route: 'iv' }); s.runTo(180); return avg(s, 20); };
  const a = run(0.1), b = run(0.01);
  near(a.map, b.map, 1, 'MAP dt 0.1 vs 0.01 s'); near(a.hr, b.hr, 1, 'HR dt 0.1 vs 0.01 s');
}
// baroreflex: open-loop slope at the set point about 19 ms/mmHg; heart-rate range about 47-158
{
  const s = mk(), fx = s.state.cv.fx;
  const hpAt = p => { const sy = 1 / (1 + exp((p - fx.set) / fx.k)); return fx.T0 + fx.aV * (1 - sy) - fx.aS * sy; };
  near(((hpAt(91) - hpAt(89)) / 2) * 1000, 19, 1, 'open-loop baroreflex slope (ms/mmHg)');
  near(60 / hpAt(200), 47, 3, 'slowest reflex HR'); near(60 / hpAt(0), 158, 5, 'fastest reflex HR');
  // a patient with a lower intrinsic rate still rests at 72
  const t = createSim({ seed: 1, profile: { fixed: { ...fixed, ihr: 82 } } });
  near(avg(t, 30).hr, 72, 1.5, 'resting HR with intrinsic rate 82');
  assert.equal(BARO.k, 12);
}
// propofol 2 mg/kg at 40 y: SBP -13 to -19 mmHg at 2 min, HR little changed (Rolly 1985); steady Ce 1 mcg/mL MAP
// about -10% (Nieuwenhuijs: -9.9%); the elderly fall further (Kazama 1999)
{
  const fall = age => { const s = mk({ profile: { age } }), b = avg(s); s.act({ type: 'bolus', drug: 'propofol', dose: 2, unit: 'mg/kg', route: 'iv' }); s.step(1100); const a = avg(s); return { sbp: a.sbp - b.sbp, hr: a.hr - b.hr }; };
  const y = fall(40), o = fall(75);
  assert.ok(y.sbp < -13 && y.sbp > -19.5, `SBP at 2 min: ${y.sbp}`); assert.ok(Math.abs(y.hr) < 6, `HR at 2 min: ${y.hr}`);
  assert.ok(o.sbp < y.sbp, `75 y falls further: ${o.sbp} vs ${y.sbp}`);
  const s = mk(), b = avg(s); s.act({ type: 'tci', drug: 'propofol', target: 1 }); s.step(9000);
  near(avg(s).map / b.map - 1, -0.10, 0.03, 'propofol Ce 1 steady MAP');
}
// remifentanil slows the heart (about 60/min at 4-8 ng/mL with propofol at P_TOL 0.9), and laryngoscopy at P_TOL 0.9
// raises SBP 19-32 mmHg and HR 6-10 (van den Berg 2021; HR wider here: 5-16)
for (const [p, r] of [[6.65, 1], [4.67, 2], [2.93, 4], [1.68, 8]]) {
  const s = mk();
  s.act({ type: 'tci', drug: 'propofol', target: p }); s.act({ type: 'tci', drug: 'remifentanil', target: r });
  s.step(9000);
  const pre = avg(s);
  if (r >= 4) assert.ok(pre.hr > 52 && pre.hr < 64, `HR at remifentanil ${r}: ${pre.hr}`);
  s.act({ type: 'stimulus', kind: 'laryngoscopy' });
  let sbp = 0, hr = 0;
  for (let i = 0; i < 1200; i++) { s.step(1); sbp = Math.max(sbp, s.state.cv.sbp); hr = Math.max(hr, s.state.cv.hr); }
  assert.ok(sbp - pre.sbp > 19 && sbp - pre.sbp < 34, `laryngoscopy at ${p}/${r}: SBP +${sbp - pre.sbp}`);
  assert.ok(hr - pre.hr > 4 && hr - pre.hr < 17, `laryngoscopy at ${p}/${r}: HR +${hr - pre.hr}`);
  // and it fades within 5 minutes
  s.step(3000);
  assert.ok(Math.abs(avg(s).sbp - pre.sbp) < 5, 'laryngoscopy response fades');
}
// after induction, before surgery, HR and SBP drift down (Roizen 1981: towards about 63 and 88 whatever the agent):
// a loose sanity check
{
  const s = mk();
  s.act({ type: 'tci', drug: 'propofol', target: 3.5 }); s.act({ type: 'tci', drug: 'remifentanil', target: 3 });
  s.step(6000);
  const a = avg(s);
  assert.ok(a.hr > 52 && a.hr < 70 && a.sbp > 80 && a.sbp < 110, `after induction: HR ${a.hr}, SBP ${a.sbp}`);
}
// the default constants close (solved at creation)
assert.equal(CV.Ca, 1.5);

console.log('ot-sim cardio: ok');
