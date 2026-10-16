// IV pharmacokinetics against MODEL.md section 2's calibration targets (the prototype's numbers in brackets).
// Run: node ot/test/pk.test.mjs
import assert from 'node:assert/strict';
import { MODELS, rates, advance, empty, cp, ce, ceHaemo } from '../js/model/pk.js';
import { doseAmount, rateAmount } from '../js/model/drugs.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const man = (age = 40, weightKg = 70, heightCm = 170) => ({ age, sex: 'M', weightKg, heightCm });

// run a model: bolus amount at t = 0, then an optional infusion (amount/min) for `infMin` minutes; returns a sampler
function run(k, { bolus = 0, rate = 0, infMin = 0, minutes, dt = 0.1 }) {
  let s = { ...empty(k), a1: bolus };
  const out = [{ t: 0, cp: s.a1 / k.V1, ce: s.ce }];
  const n = Math.round((minutes * 60) / dt);
  for (let i = 1; i <= n; i++) {
    const t = (i * dt) / 60;
    s = advance(k, s, t <= infMin + 1e-12 ? rate : 0, dt / 60);
    out.push({ t, cp: s.a1 / k.V1, ce: s.ce });
  }
  return out;
}
const peak = (rows, key = 'ce') => rows.reduce((m, r) => (r[key] > m[key] ? r : m));
const at = (rows, t) => rows.reduce((m, r) => (Math.abs(r.t - t) < Math.abs(m.t - t) ? r : m));
const ttpe = k => peak(run(k, { bolus: 100, minutes: 15 })).t;

// Marsh 70 kg, 2 mg/kg [Cp0 8.77; ke0 0.26: 3.21 at 3.92 min; ke0 1.2: 5.70 at 1.62 min]
{
  const k26 = rates(MODELS.marsh(man(), 0.26)), k12 = rates(MODELS.marsh(man(), 1.2));
  const r26 = run(k26, { bolus: 140, minutes: 10 }), r12 = run(k12, { bolus: 140, minutes: 10 });
  near(r26[0].cp, 8.8, 0.05, 'Marsh Cp0');
  near(at(r26, 1).cp, 6.70, 0.1, 'Marsh Cp 1 min'); near(at(r26, 5).cp, 2.51, 0.1, 'Marsh Cp 5 min');
  const p26 = peak(r26), p12 = peak(r12);
  near(p26.ce, 3.2, 0.1, 'Marsh ke0 0.26 Ce peak'); near(p26.t, 3.9, 0.1, 'Marsh ke0 0.26 time');
  near(p12.ce, 5.7, 0.1, 'Marsh ke0 1.2 Ce peak'); near(p12.t, 1.6, 0.1, 'Marsh ke0 1.2 time');
}

// time to peak effect: Schnider 1.52 (1.45 at 25 y, 1.71 at 75 y), Minto 1.43 (1.23 at 20 y, 2.26 at 80 y),
// fentanyl 3.16, alfentanil about 1.4 (Miller), ketamine about 1 min
near(ttpe(rates(MODELS.schnider(man()))), 1.52, 0.05, 'Schnider TTPE 40 y');
near(ttpe(rates(MODELS.schnider(man(25)))), 1.45, 0.05, 'Schnider TTPE 25 y');
near(ttpe(rates(MODELS.schnider(man(75)))), 1.71, 0.05, 'Schnider TTPE 75 y');
near(ttpe(rates(MODELS.minto(man()))), 1.43, 0.05, 'Minto TTPE 40 y');
near(ttpe(rates(MODELS.minto(man(20)))), 1.23, 0.05, 'Minto TTPE 20 y');
near(ttpe(rates(MODELS.minto(man(80)))), 2.26, 0.06, 'Minto TTPE 80 y');
near(ttpe(rates(MODELS.shafer())), 3.16, 0.05, 'fentanyl TTPE');
// alfentanil: Miller's 1.4 min comes from Scott's PK; Maitre's slower distribution with ke0 0.77 peaks at about 2.6 min
// (recorded, not tuned, like midazolam; listed for the clinical read-through)
near(ttpe(rates(MODELS.maitre(man()))), 2.6, 0.2, 'alfentanil TTPE (Maitre)');
near(ttpe(rates(MODELS.domino(man()))), 1.0, 0.3, 'ketamine TTPE');
assert.ok(ttpe(rates(MODELS.albrecht())) > 4, 'midazolam peaks slowly in this model (recorded, not tuned)');

// Schnider default patient covariates (research/pk.md): CL1 1.64, V2 24.0, k10 0.384, k12 0.375
{
  const m = MODELS.schnider(man()), k = rates(m);
  near(m.CL1, 1.64, 0.01, 'Schnider CL1'); near(m.V2, 24.0, 0.05, 'Schnider V2');
  near(k.k10, 0.384, 0.002, 'Schnider k10'); near(k.k12, 0.375, 0.002, 'Schnider k12');
  // the James paradox: above BMI 42 a man's clearance uses the LBM at the peak, so it stops climbing
  const fat = MODELS.schnider(man(40, 160, 170)), peakW = MODELS.schnider(man(40, 124.2, 170));
  assert.ok(fat.CL1 < 5.24 - 0.2, `capped Schnider CL1 at 160 kg below the uncapped 5.24: ${fat.CL1}`);
  near(fat.CL1 - peakW.CL1, 0.0456 * (160 - 124.2), 0.01, 'only the weight term moves above the cap');
  // the haemodynamic effect site slows with age
  assert.ok(MODELS.schnider(man(30)).keH > MODELS.schnider(man(75)).keH);
}

// context-sensitive half-times (Hughes 1992: plasma 50% decrement after an infusion holding the plasma level constant
// for 1, 3, 8 h; here a perfect plasma-controlled infusion)
function csht(k, hours) {
  let s = { ...empty(k), a1: k.V1 };
  const dt = 1 / 60; // 1 s
  for (let i = 0; i < hours * 3600; i++) { s = advance(k, s, 0, dt); s.a1 = k.V1; }
  const half = s.a1 / 2;
  for (let i = 1; i < 600 * 60; i++) { s = advance(k, s, 0, dt); if (s.a1 <= half) return i / 60; }
  return Infinity;
}
{
  const sch = rates(MODELS.schnider(man())), mi = rates(MODELS.minto(man())), fe = rates(MODELS.shafer());
  near(csht(sch, 1), 2.0, 0.4, 'Schnider CSHT 1 h'); near(csht(sch, 3), 3.1, 0.6, 'Schnider CSHT 3 h'); near(csht(sch, 8), 8.0, 1.6, 'Schnider CSHT 8 h');
  const m1 = csht(mi, 1), m8 = csht(mi, 8);
  assert.ok(m1 > 1.6 && m1 < 4 && m8 > 1.6 && m8 < 4, `Minto CSHT stays about 2-4 min: ${m1}, ${m8}`);
  near(csht(fe, 1), 17.8, 3.6, 'fentanyl CSHT 1 h'); near(csht(fe, 3), 70, 14, 'fentanyl CSHT 3 h'); near(csht(fe, 8), 256, 51, 'fentanyl CSHT 8 h');
}

// dt 0.1 s against 0.01 s (MODEL.md: within 2-3 decimals)
{
  const k = rates(MODELS.schnider(man()));
  const a = peak(run(k, { bolus: 140, minutes: 6 })), b = peak(run(k, { bolus: 140, minutes: 6, dt: 0.01 }));
  near(a.ce, b.ce, 0.005 * b.ce, 'Schnider Ce peak, dt 0.1 vs 0.01 s'); near(a.t, b.t, 0.01, 'TTPE dt check');
}

// units
near(doseAmount('propofol', 2, 'mg/kg', 70), 140, 1e-12, 'mg/kg');
near(doseAmount('fentanyl', 0.1, 'mg', 70), 100, 1e-12, 'mg of fentanyl in mcg');
near(rateAmount('remifentanil', 0.25, 'mcg/kg/min', 80), 20, 1e-12, 'mcg/kg/min');
near(rateAmount('propofol', 6, 'mg/kg/h', 70), 7, 1e-12, 'mg/kg/h');
assert.throws(() => doseAmount('propofol', 1, 'mL', 70));

// in the sim: a bolus raises Cp at once, the effect site follows, the haemodynamic site lags; infusions stop at rate 0
{
  const fixed = { pkV1: 1, pkCL: 1 };
  const s = createSim({ seed: 4, profile: { fixed } });
  assert.deepEqual(s.state.pk.d, {}, 'nothing given yet');
  s.act({ type: 'bolus', drug: 'propofol', dose: 140, unit: 'mg', route: 'iv' });
  s.step(1);
  near(cp(s.state, 'propofol'), 140 / 4.27, 1e-9, 'Cp after the bolus');
  assert.equal(ce(s.state, 'propofol'), 0);
  s.step(Math.round(1.52 * 600));
  assert.ok(ce(s.state, 'propofol') > 5 && ceHaemo(s.state, 'propofol') < ce(s.state, 'propofol') / 2);
  // remifentanil 0.25 mcg/kg/min for an hour: Cp near rate/CL1 (Minto CL1 2.61 L/min) at steady state
  s.act({ type: 'infusion', drug: 'remifentanil', rate: 0.25, unit: 'mcg/kg/min' });
  s.step(36000);
  near(cp(s.state, 'remifentanil'), 17.5 / 2.61, 0.3, 'remifentanil steady state');
  const ss = cp(s.state, 'remifentanil');
  s.act({ type: 'infusion', drug: 'remifentanil', rate: 0 });
  s.step(2400);
  assert.ok(cp(s.state, 'remifentanil') < ss / 2, 'remifentanil halves within 4 min of stopping');
  assert.ok(s.state.trend.at(-1).cp_remifentanil < ss / 2);
}

// between-patient variation: the same dose gives a different peak in different patients, and fixing removes it
{
  const peakCp = seed => { const s = createSim({ seed, warmup: 0 }); s.act({ type: 'bolus', drug: 'propofol', dose: 140, unit: 'mg', route: 'iv' }); s.step(1); return cp(s.state, 'propofol'); };
  const vals = [1, 2, 3, 4, 5, 6].map(peakCp);
  assert.ok(Math.max(...vals) / Math.min(...vals) > 1.1, `variation in Cp0: ${vals}`);
}

console.log('ot-sim pk: ok');
