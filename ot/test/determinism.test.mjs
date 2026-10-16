// The model loop is deterministic (DESIGN.md, "Determinism"): the same seed and actions give a deep-equal state
// whether run in 1-step or 200-step chunks, after a snapshot and restore, or replayed from {seed, profile, actions}.
// Strict mode freezes the previous state each step, so a subsystem that mutates what it reads fails here.
// Run: node ot/test/determinism.test.mjs
import assert from 'node:assert/strict';
import { createSim, replay, Sim, DT } from '../js/model/sim.js';

const N = 3000; // 5 simulated minutes

// 1-step vs 200-step chunks, strict mode on
const a = createSim({ seed: 42, strict: true });
for (let i = 0; i < N; i++) a.step(1);
const b = createSim({ seed: 42 });
for (let i = 0; i < N / 200; i++) b.step(200);
assert.deepEqual(a.state, b.state, '1-step and 200-step chunks give the same state');

// a different seed gives a different run (and a different patient)
const c = createSim({ seed: 43 }).step(N);
assert.notDeepEqual(c.state.cv, b.state.cv);
assert.notEqual(c.state.patient.q, b.state.patient.q);

// snapshot and restore: running on from a restored snapshot equals never stopping
const d = createSim({ seed: 7 }).step(1000);
const snap = d.snapshot();
const e = Sim.restore(snap).step(2000);
d.step(2000);
assert.deepEqual(e.state, d.state, 'snapshot + restore + run equals an uninterrupted run');
assert.deepEqual(JSON.parse(JSON.stringify(snap)), snap, 'state is plain data (survives JSON)');

// actions are stamped with their step and replay exactly
const f = createSim({ seed: 9, profile: { age: 60, sex: 'F', weightKg: 62, heightCm: 158 } });
f.step(100); f.act({ type: 'note', text: 'first' });
f.step(250); f.act({ type: 'bolus', drug: 'propofol', dose: 2, unit: 'mg/kg', route: 'iv' });
f.step(400);
const rec = f.replayRecord();
assert.equal(rec.actions.length, 2);
assert.deepEqual(rec.actions.map(x => x.step), [100, 350]);
const g = replay(rec, {}, f.state.t);
assert.deepEqual(g.state, f.state, 'replay from the record reproduces the run');
assert.ok(f.state.pk.d.propofol.ce > 0, 'the replayed run includes the drug');

// time comes from the step count (no drift), and the warm start leaves the clock at zero
const h = createSim({ seed: 1 });
assert.equal(h.state.t, 0);
h.step(36000);
assert.equal(h.state.t, 3600, `one hour is exactly 3600 s, got ${h.state.t}`);
assert.equal(h.state.step * DT, 3600);

// events: beats and breaths arrive with exact times and increasing sequence numbers; the ring is bounded
const beats = h.state.ev.ring.filter(x => x.kind === 'beat');
assert.ok(beats.length > 100);
for (let i = 1; i < beats.length; i++) assert.ok(beats[i].t > beats[i - 1].t && beats[i].seq > beats[i - 1].seq);
assert.ok(h.state.ev.ring.length <= 512);
assert.ok(h.eventsSince(h.state.ev.seq - 5).length === 5);
// trends every 5 s of simulated time, bounded by the run length
assert.equal(h.state.trend.length, 3600 / 5);

// a new random consumer does not shift another consumer's numbers: the vitals stream is named and independent
const i1 = createSim({ seed: 5 }).step(500).state.gas;
const sysPlus = (await import('../js/model/systems.js')).SYSTEMS.concat([{ name: 'extra', init: () => ({ x: 0 }), step: (p, ctx) => ({ x: ctx.rand('extra') }) }]);
const i2 = createSim({ seed: 5, systems: sysPlus }).step(500).state.gas;
assert.deepEqual(i2, i1, 'adding a consumer leaves the vitals draws unchanged');

console.log('ot-sim determinism: ok');
