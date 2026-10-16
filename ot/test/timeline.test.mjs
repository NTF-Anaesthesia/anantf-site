// The operation timeline (ui/timeline.js): a well-formed, ordered surgical-stimulus script, and phaseAt picks the
// right now/next step. Also drives a real sim through the script to show it deterministically changes the surgical
// stimulus (incision at the start, an ongoing surgery stimulus that rises then stops).

import assert from 'node:assert/strict';
import { OPERATION, phaseAt } from '../js/ui/timeline.js';
import { createSim } from '../js/model/sim.js';

// well-formed, strictly increasing offsets; surgery levels in pd.js's 0.6–1.0 range (or 0 to stop)
assert.ok(OPERATION.length >= 4, 'several operation steps');
assert.equal(OPERATION[0].at, 0, 'the first step is at the start');
for (let i = 1; i < OPERATION.length; i++) assert.ok(OPERATION[i].at > OPERATION[i - 1].at, 'offsets strictly increase');
for (const e of OPERATION) {
  assert.equal(e.stim.type, 'stimulus', 'each step is a stimulus action');
  assert.ok(typeof e.label === 'string' && e.label.length, 'each step has a label');
  if (e.stim.kind === 'surgery' && e.stim.level > 0) assert.ok(e.stim.level >= 0.6 && e.stim.level <= 1.0, `surgery level in range (${e.stim.level})`);
}
assert.equal(OPERATION[OPERATION.length - 1].stim.level, 0, 'the last step ends the surgery');

// phaseAt: before the start, between steps, and after the end
assert.equal(phaseAt(-5).index, -1, 'nothing before the start');
assert.equal(phaseAt(0).index, 0, 'the first step at t=0');
assert.equal(phaseAt(0).next, OPERATION[1], 'next points to the second step');
assert.equal(phaseAt(OPERATION[2].at + 1).index, 2, 'the step whose offset has passed');
assert.equal(phaseAt(1e9).next, null, 'no next step after the end');

// drive a real sim through the whole script (as the UI scheduler does) and check the surgical stimulus follows it
const sim = createSim({ seed: 2 });
const startT = sim.state.t;
let fired = 0;
const tick = () => { while (fired < OPERATION.length && sim.state.t >= startT + OPERATION[fired].at - 1e-6) sim.act(OPERATION[fired++].stim); };
tick(); sim.step(2);                                        // incision fired at the start
assert.ok(sim.state.pd.stim && sim.state.pd.stim.kind === 'incision', 'incision stimulus applied at the start');
sim.runTo(startT + 20); tick(); sim.step(2);                // surgery under way
assert.ok(sim.state.pd.stim && sim.state.pd.stim.kind === 'surgery' && sim.state.pd.stim.ongoing, 'ongoing surgery stimulus running');
const midI = sim.state.pd.stim.I;
sim.runTo(startT + 610); tick(); sim.step(2);               // deep dissection: stronger stimulus
assert.ok(sim.state.pd.stim.I > midI, `peak stimulus stronger than steady (${sim.state.pd.stim.I} > ${midI})`);
sim.runTo(startT + 1990); tick(); sim.step(2);              // finished: surgery stimulus cleared
assert.ok(fired === OPERATION.length, 'every step fired');
assert.ok(!sim.state.pd.stim || !sim.state.pd.stim.ongoing, 'surgery stimulus ended');

// determinism: the same script on the same seed gives the same final stimulus surface
const sim2 = createSim({ seed: 2 });
let f2 = 0; const t2 = sim2.state.t;
const tick2 = () => { while (f2 < OPERATION.length && sim2.state.t >= t2 + OPERATION[f2].at - 1e-6) sim2.act(OPERATION[f2++].stim); };
for (const off of [0, 20, 610, 1990]) { if (off) sim2.runTo(t2 + off); tick2(); sim2.step(2); }
assert.equal(sim2.state.pd.auto, sim.state.pd.auto, 'deterministic autonomic drive after the same script');

console.log('ot-sim timeline: ok');
