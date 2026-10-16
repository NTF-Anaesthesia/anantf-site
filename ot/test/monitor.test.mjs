// The monitor's averaging and NIBP cycle (js/model/monitor.js). Run: node ot/test/monitor.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { NIBP_TAKES } from '../js/model/monitor.js';

const s = createSim({ seed: 11 });
const m0 = s.state.mon;
// after the warm start the averages sit near the model's values
assert.ok(Math.abs(m0.hr - s.state.cv.hr) < 5 && Math.abs(m0.spo2 - s.state.gas.sao2) < 2);
assert.equal(m0.rrs.length, 4); assert.equal(m0.cycles.length, 4);
// the warm start leaves a reading and the events of the last minutes (negative times) for the lanes
assert.ok(m0.nibp.last && m0.nibp.last.t < 0);
const ev = s.state.ev.ring;
assert.ok(ev.length > 100 && ev.every(e => e.t <= 0) && ev[0].t < -60, 'warm-start history kept, rebased');

// HR is the mean of the last 4 beat intervals
s.step(600);
const m = s.state.mon;
const mean = m.rrs.reduce((a, b) => a + b, 0) / m.rrs.length;
assert.ok(Math.abs(m.hr - 60 / mean) < 1e-9);
// EtCO2 holds between breaths (latched per breath), unlike the model's moving value
const et = [];
for (let i = 0; i < 20; i++) { s.step(1); et.push(s.state.mon.etco2); }
assert.ok(new Set(et).size <= 2, 'EtCO2 changes only at breaths');

// NIBP: a manual start takes NIBP_TAKES seconds, logs the reading, and restarts the cycle timer
const a = createSim({ seed: 2 });
a.act({ type: 'nibp', do: 'start' });
a.step(1);
assert.equal(a.state.mon.nibp.start, 0.1);
assert.equal(a.state.mon.nibp.next, 0.1 + 300);
a.step(NIBP_TAKES * 10);
const n = a.state.mon.nibp;
assert.equal(n.start, null);
assert.ok(Math.abs(n.last.t - (0.1 + NIBP_TAKES)) < 1e-9);
assert.equal(a.state.log.filter(e => e.kind === 'nibp').length, 1);
// cycle 1 minute: a measurement starts every 60 s and reads 30 s later (starts at 1-5 min, readings at 1.5-4.5 min)
const count = () => a.state.log.filter(e => e.kind === 'nibp').length;
a.act({ type: 'nibp', cycle: 1 });
a.step(3000);
assert.equal(count(), 1 + 4);
// manual: a measurement already running finishes, then no more
a.act({ type: 'nibp', cycle: 0 });
a.step(400);
const after = count();
assert.ok(after === 5 || after === 6);
a.step(3000);
assert.equal(count(), after, 'no readings in manual mode');
// an unknown cycle is ignored
a.act({ type: 'nibp', cycle: 7 });
a.step(1);
assert.equal(a.state.mon.nibp.cycle, 0);

console.log('ot-sim monitor: ok');
