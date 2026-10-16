// Hypnosis, stimulus response, BIS-like index and autonomic drive (js/model/pd.js) against MODEL.md section 4.
// Run: node ot/test/pd.test.mjs
import assert from 'node:assert/strict';
import { uHypnosis, uStimulus, pNo, bisLike, c50Loc, macAt, ceREq, STIMULI } from '../js/model/pd.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const pAsleep = L => pNo(uHypnosis(L), 4.5);
const pTol = (L, I = 1) => pNo(uStimulus(L, I), 5.22);

// loss of response to voice: C50 2.35 / 1.80 / 1.25 mcg/mL at 25 / 50 / 75 y (Schnider 1999)
for (const [age, c] of [[25, 2.35], [50, 1.80], [75, 1.25]]) {
  near(c50Loc(age), c, 0.01, `C50LOC at ${age}`);
  near(pAsleep({ ceP: c, age }), 0.5, 1e-9, `half asleep at C50LOC, ${age} y`);
}
// 5-95% range at 40 y about 1.05-3.9 mcg/mL
near(pAsleep({ ceP: 1.05, age: 40 }), 0.05, 0.02, '5% asleep'); near(pAsleep({ ceP: 3.9, age: 40 }), 0.95, 0.02, '95% asleep');
// fentanyl 3 ng/mL lowers MAC-awake about 21% (Katoh & Ikeda 1998: -24%)
{
  const mac = macAt(1.8, 40), base = 0.34 * mac;
  // find the sevoflurane level for half asleep, with and without fentanyl
  const half = ceR => { let lo = 0, hi = 3; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (pAsleep({ ceP: 0, ceS: m, ceR, age: 40 }) < 0.5) lo = m; else hi = m; } return lo; };
  near(half(0), base, 1e-6, 'MAC-awake 0.34 MAC'); near(base, 0.61, 0.01, 'MAC-awake about 0.61% at 40 y');
  near(1 - half(ceREq(0, 3)) / half(0), 0.21, 0.03, 'fentanyl 3 ng/mL lowers MAC-awake');
}
// MAC by age: about -6% a decade
near(macAt(1.8, 50) / macAt(1.8, 40), 0.94, 0.005, 'MAC age slope');

// stimulus: the P_TOL 0.9 isobole for laryngoscopy (Hannivoort parameters)
for (const [p, r] of [[6.65, 1], [4.67, 2], [2.93, 4], [1.68, 8]]) near(pTol({ ceP: p, ceR: r, age: 40 }), 0.9, 0.01, `P_TOL propofol ${p} remifentanil ${r}`);
// van den Berg's own pairs give 0.95-0.98 here
for (const [p, r] of [[8.6, 1], [5.9, 2], [3.6, 4], [2.0, 8]]) { const v = pTol({ ceP: p, ceR: r, age: 40 }); assert.ok(v > 0.94 && v < 0.985, `van den Berg pair ${p}/${r}: ${v}`); }
// propofol alone: half respond to intubation at about 13.5 mcg/mL
near(pTol({ ceP: 13.5, age: 40 }, STIMULI.intubation), 0.5, 0.01, 'propofol alone for intubation');
// sevoflurane 1 MAC alone: half move at incision (the definition of MAC)
near(pTol({ ceP: 0, ceS: macAt(1.8, 40), age: 40 }, STIMULI.incision), 0.5, 1e-9, '1 MAC at incision');
near(pTol({ ceP: 0, ceS: macAt(1.8, 70), age: 70 }, STIMULI.incision), 0.5, 1e-9, '1 MAC at 70 y');
// remifentanil 32 ng/mL lowers MAC about 96% (Lang: 91%)
{
  const half = ceR => { let lo = 0, hi = 5; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (pTol({ ceP: 0, ceS: m, ceR, age: 40 }, STIMULI.incision) < 0.5) lo = m; else hi = m; } return lo; };
  near(1 - half(32) / half(0), 0.96, 0.01, 'remifentanil 32 ng/mL MAC reduction');
  // fentanyl 3 ng/mL: MAC about -61% (here -64%)
  near(1 - half(ceREq(0, 3)) / half(0), 0.62, 0.04, 'fentanyl 3 ng/mL MAC reduction');
}

// BIS-like table (MODEL.md section 4)
for (const [p, r, v] of [[2, 0, 74], [3, 0, 62], [4, 0, 53], [6, 0, 39], [2, 4, 63], [3, 4, 53], [4, 4, 45], [6, 4, 34]]) near(bisLike({ ceP: p, ceR: r }), v, 1.5, `BIS-like propofol ${p} remifentanil ${r}`);
assert.equal(bisLike({ ceP: 0 }), 97.4);

// in the sim: a propofol bolus puts the patient to sleep; a stimulus raises the autonomic drive, which fades;
// movement at incision depends on depth and on paralysis
{
  const s = createSim({ seed: 8, profile: { fixed: { q: 0.5, pkV1: 1, pkCL: 1 } } });
  assert.equal(s.state.pd.asleep, false); near(s.state.pd.bisLike, 97.4, 0.01, 'awake BIS-like');
  s.act({ type: 'bolus', drug: 'propofol', dose: 2, unit: 'mg/kg', route: 'iv' });
  s.step(900);
  assert.equal(s.state.pd.asleep, true);
  assert.ok(s.state.log.some(e => e.kind === 'asleep'));
  assert.ok(s.state.pd.bisLike < 60);
  // light propofol alone: laryngoscopy produces a large autonomic response that rises over a minute and fades
  s.act({ type: 'stimulus', kind: 'laryngoscopy' });
  s.step(300);
  const peak = s.state.pd.auto;
  assert.ok(peak > 0.5, `autonomic drive at 30 s: ${peak}`);
  s.step(3000);
  assert.ok(s.state.pd.auto < 0.05, 'faded 5 min later');
  // awake again after the bolus wears off
  s.step(12000);
  assert.equal(s.state.pd.asleep, false);
  assert.ok(s.state.log.some(e => e.kind === 'awake'));
}
{
  const incision = (drugs, seed = 1) => {
    const s = createSim({ seed, profile: { fixed: { q: 0.5, pkV1: 1, pkCL: 1 } } });
    for (const d of drugs) s.act(d);
    s.step(3000);
    s.act({ type: 'stimulus', kind: 'incision' });
    s.step(1);
    return s.state.log.some(e => e.kind === 'movement');
  };
  const tci = (drug, target) => ({ type: 'tci', drug, target });
  assert.equal(incision([tci('propofol', 3)]), true, 'propofol 3 alone: moves at incision');
  assert.equal(incision([tci('propofol', 3), tci('remifentanil', 4)]), false, 'with remifentanil 4: still');
  assert.equal(incision([tci('propofol', 3), { type: 'bolus', drug: 'rocuronium', dose: 0.6, unit: 'mg/kg', route: 'iv' }]), false, 'paralysed: no movement');
}
// one quantile for every endpoint: a resistant patient needs more for sleep and for stillness
{
  const at = q => { const s = createSim({ seed: 1, profile: { fixed: { q, pkV1: 1, pkCL: 1 } } }); s.act({ type: 'tci', drug: 'propofol', target: 2.2 }); s.step(3000); return s.state.pd.asleep; };
  assert.equal(at(0.1), true); assert.equal(at(0.9), false);
}

console.log('ot-sim pd: ok');
