// Syringe pumps and TCI (js/model/pump.js) against MODEL.md section 2 (prototype numbers in brackets).
// Run: node ot/test/pump.test.mjs
import assert from 'node:assert/strict';
import { chooseRate, pumpView, SYRINGE } from '../js/model/pump.js';
import { MODELS, rates, advance, empty, cp, ce } from '../js/model/pk.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const man = { age: 40, sex: 'M', weightKg: 70, heightCm: 170 };

// the controller alone, deciding every `every` seconds for `minutes`
function tci(k, mode, target, max, every = 10, minutes = 10) {
  let s = empty(k), r = 0, t95 = null, cpMax = 0, ceMax = 0;
  const n = minutes * 600, each = Math.round(every * 10);
  for (let i = 0; i < n; i++) {
    if (i % each === 0) r = chooseRate(k, s, mode, target, max);
    s = advance(k, s, r, 0.1 / 3600 * 60);
    cpMax = Math.max(cpMax, s.a1 / k.V1); ceMax = Math.max(ceMax, s.ce);
    if (t95 == null && s.ce >= 0.95 * target) t95 = (i + 1) / 600;
  }
  return { t95, cpMax, ceMax, ce: s.ce, cp: s.a1 / k.V1 };
}
const propMax = (SYRINGE.propofol.maxMlH / 60) * SYRINGE.propofol.perMl;
const sch = rates(MODELS.schnider(man)), mi = rates(MODELS.minto(man));

// Schnider effect-site target 4 mcg/mL: effect site within 5% by about 1.3 min, no overshoot; plasma about 3.4 x [1.26; 3.35]
const e = tci(sch, 'effect', 4, propMax);
near(e.t95, 1.3, 0.1, 'Schnider effect-site 95% time');
assert.ok(e.ceMax < 4 * 1.01, `no effect-site overshoot: ${e.ceMax}`);
near(e.cpMax / 4, 3.4, 0.3, 'Schnider plasma peak as a multiple of target');
near(e.ce, 4, 0.04, 'effect site held at target');
// 10 s and 1 s decisions agree
const e1 = tci(sch, 'effect', 4, propMax, 1);
near(e1.t95, e.t95, 0.1, '10 s vs 1 s updates'); near(e1.ce, e.ce, 0.05, '10 s vs 1 s at 10 min');
// plasma mode: plasma never above target, effect site slow [6.6 min to 95%]
const p = tci(sch, 'plasma', 4, propMax);
assert.ok(p.cpMax <= 4 * 1.01); near(p.t95, 6.6, 0.5, 'plasma-mode effect-site 95% time');
// Minto effect-site target 4 ng/mL [1.09 min; plasma x 3.10]
const m = tci(mi, 'effect', 4, (SYRINGE.remifentanil.maxMlH / 60) * SYRINGE.remifentanil.perMl);
near(m.t95, 1.1, 0.1, 'Minto effect-site 95% time'); near(m.cpMax / 4, 3.1, 0.3, 'Minto plasma peak multiple');

// in the sim: with the patient fixed to the published model, the patient's true levels follow the pump's prediction
{
  const s = createSim({ seed: 3, profile: { fixed: { pkV1: 1, pkCL: 1 } } });
  s.act({ type: 'tci', drug: 'propofol', model: 'schnider', mode: 'effect', target: 4 });
  s.step(3000);
  const v = pumpView(s.state, 'propofol');
  near(ce(s.state, 'propofol'), v.predCe, 0.02 * v.predCe, 'true Ce matches the prediction when the patient is average');
  near(v.predCe, 4, 0.05, 'predicted Ce at target after 5 min');
  assert.ok(v.mlH > 0 && v.ml > 10, `pump running: ${v.mlH} mL/h, ${v.ml} mL given`);
  // a lower target stops the pump until the prediction falls to it
  s.act({ type: 'tci', drug: 'propofol', target: 3 });
  s.step(20);
  assert.equal(pumpView(s.state, 'propofol').mlH, 0, 'stopped while above the new target');
  s.step(3000);
  near(pumpView(s.state, 'propofol').predCe, 3, 0.05, 'settles at the new target');
  assert.ok(pumpView(s.state, 'propofol').mlH > 0, 'running again at the lower target');
  // the model is kept once running
  s.act({ type: 'tci', drug: 'propofol', model: 'marsh', target: 3 });
  s.step(1);
  assert.equal(s.state.pump.propofol.model, 'schnider');
  // stop
  s.act({ type: 'tci', drug: 'propofol', stop: true });
  s.step(20);
  assert.equal(pumpView(s.state, 'propofol').mlH, 0);
}

// with between-patient variation the true level differs from the prediction (the teaching point)
{
  const diffs = [1, 2, 3, 4, 5].map(seed => {
    const s = createSim({ seed });
    s.act({ type: 'tci', drug: 'propofol', target: 4 });
    s.step(3000);
    return ce(s.state, 'propofol') / pumpView(s.state, 'propofol').predCe;
  });
  assert.ok(Math.max(...diffs) - Math.min(...diffs) > 0.1, `true/predicted varies between patients: ${diffs}`);
  assert.ok(diffs.every(x => x > 0.4 && x < 2.5));
}

// Marsh ke0 options and unknown drugs
{
  const s = createSim({ seed: 1 });
  s.act({ type: 'tci', drug: 'propofol', model: 'marsh026', mode: 'plasma', target: 3 });
  s.act({ type: 'tci', drug: 'fentanyl', target: 2 }); // no fentanyl pump: ignored
  s.step(10);
  assert.equal(s.state.pump.propofol.model, 'marsh026');
  assert.equal(s.state.pump.fentanyl, undefined);
  assert.ok(cp(s.state, 'propofol') > 0);
}

console.log('ot-sim pump: ok');
