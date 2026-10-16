// Patient covariates against the worked examples in MODEL.md section 1, and the between-patient variation.
// Run: node ot/test/patient.test.mjs
import assert from 'node:assert/strict';
import { makePatient, jamesLbm, jamesPeakWeight, pkLbm, mosteller, devine, bloodVolume, frc, intrinsicHr } from '../js/model/patient.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);

// default patient: man, 40 y, 70 kg, 170 cm
near(jamesLbm('M', 70, 170), 55.3, 0.05, 'James LBM');
near(mosteller(70, 170), 1.82, 0.005, 'Mosteller BSA');
near(devine('M', 170), 65.9, 0.05, 'Devine IBW');
near(bloodVolume('M', 70, 170), 4.9, 0.001, 'blood volume');
near(frc('M', 70, 170), 1.98, 0.01, 'FRC');
near(intrinsicHr(40), 95.3, 0.05, 'intrinsic HR');
// women and the James paradox
near(devine('F', 158), 45.5 + 0.9055 * 5.6, 1e-9, 'Devine woman');
near(jamesPeakWeight('M', 170), 124.2, 0.1, 'James peak at 170 cm');
assert.ok(jamesLbm('M', 160, 170) < jamesLbm('M', 124, 170), 'James LBM falls past its peak');
near(pkLbm('M', 160, 170), jamesLbm('M', jamesPeakWeight('M', 170), 170), 1e-9, 'capped LBM above BMI 42');
near(pkLbm('M', 100, 170), jamesLbm('M', 100, 170), 1e-9, 'no cap at BMI 34.6');
// obesity: blood volume per kg and FRC fall
assert.ok(bloodVolume('M', 130, 170) / 130 < 0.07 * 0.8, 'obese blood volume under 56 mL/kg');
near(frc('M', 150, 170), frc('M', 70, 170) * 0.5, 1e-9, 'FRC floor at half in severe obesity');

// variation: deterministic per seed, inside its bounds, and fixable
const p1 = createSim({ seed: 3 }).state.patient, p2 = createSim({ seed: 3 }).state.patient;
assert.deepEqual(p1, p2);
let qs = 0;
for (let s = 1; s <= 200; s++) {
  const p = createSim({ seed: s, warmup: 0 }).state.patient;
  assert.ok(p.q >= 0 && p.q < 1);
  assert.ok(p.baroGain >= 0.5 && p.baroGain <= 1.5);
  assert.ok(p.ihr >= intrinsicHr(40) * 0.85 - 1e-9 && p.ihr <= intrinsicHr(40) * 1.15 + 1e-9);
  assert.ok(p.pkV1 > 0.3 && p.pkV1 < 3 && p.pkCL > 0.3 && p.pkCL < 3);
  qs += p.q;
}
near(qs / 200, 0.5, 0.06, 'mean sensitivity quantile over 200 seeds');
const fixed = makePatient({ fixed: { q: 0.5, pkV1: 1, pkCL: 1 } }, { uniform: () => 0.9, normal: () => 2 });
assert.equal(fixed.q, 0.5); assert.equal(fixed.pkV1, 1); assert.equal(fixed.pkCL, 1);

console.log('ot-sim patient: ok');
