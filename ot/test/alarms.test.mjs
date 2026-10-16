// Alarms (monitor.js, M3.3): default limits, three priorities, the onset debounce, logging in simulated time, and the
// 2-minute silence. Onset timing is a function of simulated time only, so it is identical at any display speed.

import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { ALARM_LIMITS, PRIORITY_RANK, SILENCE } from '../js/model/monitor.js';

// the limit table is well-formed: each side names a priority the rank table knows, with a message
for (const p in ALARM_LIMITS) {
  const L = ALARM_LIMITS[p];
  if (L.loPr) { assert.ok(PRIORITY_RANK[L.loPr], `${p} low priority known`); assert.ok(L.loMsg, `${p} low message`); }
  if (L.hiPr) { assert.ok(PRIORITY_RANK[L.hiPr], `${p} high priority known`); assert.ok(L.hiMsg, `${p} high message`); }
}

// a healthy awake adult on air raises no alarm
{
  const sim = createSim({ seed: 1 });
  sim.step(50);
  assert.deepEqual(sim.state.mon.alarms, [], 'no alarms at a normal baseline');
}

// drive hypoxia (induce, paralyse, apnoea on air, natural airway obstructs): SpO2 falls and a high-priority SpO2
// alarm latches
function induceApnoea(sim) {
  sim.act({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' });
  sim.act({ type: 'bolus', drug: 'rocuronium', dose: 100, unit: 'mg', route: 'iv' });
  sim.act({ type: 'o2', fio2: 0.21 });
}
function hypoxic(seed = 1) {
  const sim = createSim({ seed });
  induceApnoea(sim);
  sim.runTo(sim.state.t + 600);                            // long enough to desaturate on air, apnoeic
  return sim;
}
{
  const sim = hypoxic();
  const spo2 = sim.state.mon.alarms.find(a => a.param === 'spo2');
  assert.ok(spo2, 'an SpO2 alarm is active after apnoea on air');
  assert.equal(spo2.priority, 'high', 'SpO2 low is high priority');
  assert.ok(sim.state.mon.spo2 < 90, `SpO2 is actually below the limit (${Math.round(sim.state.mon.spo2)})`);
  // it was logged on, in simulated time
  const on = sim.state.log.find(e => e.kind === 'alarm' && e.param === 'spo2' && e.state === 'on');
  assert.ok(on && on.t > 0, 'the SpO2 alarm onset is logged with a simulated time');
}

// onset time is identical whether stepped one at a time or in bulk (so 1x and 20x agree)
{
  const a = hypoxic(2), b = createSim({ seed: 2 });
  induceApnoea(b);
  const target = b.state.t + 600;
  while (b.state.t < target) b.step(1);                    // one step at a time
  const ta = a.state.log.find(e => e.kind === 'alarm' && e.param === 'spo2' && e.state === 'on').t;
  const tb = b.state.log.find(e => e.kind === 'alarm' && e.param === 'spo2' && e.state === 'on').t;
  assert.equal(ta, tb, 'SpO2 alarm onset time is the same stepped bulk vs one-by-one');
}

// the silence action sets the silence window (audio pause), without clearing the alarm itself
{
  const sim = hypoxic();
  assert.ok(sim.state.mon.alarms.length, 'alarm present before silence');
  sim.act({ type: 'alarmSilence' });
  sim.step(1);
  assert.ok(sim.state.mon.silencedUntil >= sim.state.t + SILENCE - 1, 'silence window set ~2 min ahead');
  assert.ok(sim.state.mon.alarms.length, 'the alarm stays active while silenced');
}

// technical: an oesophageal tube on the ventilator → "No CO₂" high-priority alarm (no gas reaches the lungs)
{
  const sim = createSim({ seed: 1 });
  sim.act({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' });
  sim.act({ type: 'bolus', drug: 'rocuronium', dose: 100, unit: 'mg', route: 'iv' });
  sim.act({ type: 'intubate', placement: 'oesophageal' });
  sim.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, fio2: 1 });
  sim.runTo(sim.state.t + 60);
  const noco2 = sim.state.mon.alarms.find(a => a.param === 'noco2');
  assert.ok(noco2, 'a "No CO₂" technical alarm with an oesophageal tube on the ventilator');
  assert.equal(noco2.priority, 'high', 'No CO₂ is high priority');
  assert.ok(noco2.tech, 'flagged as technical');
  assert.ok(sim.state.mon.etco2 < 2, `EtCO₂ is essentially zero (${sim.state.mon.etco2})`);
}

// technical: VF → "SpO₂ no pulse" (a non-perfusing rhythm), and no numeric SpO₂ alarm while there is no pulse to read
{
  const sim = createSim({ seed: 1 });
  sim.act({ type: 'rhythm', to: 'vf' });
  sim.runTo(sim.state.t + 60);
  assert.ok(sim.state.mon.alarms.some(a => a.param === 'spo2sig'), '"SpO₂ no pulse" technical alarm in VF');
  assert.ok(!sim.state.mon.alarms.some(a => a.param === 'spo2' && a.dir === 'lo'), 'no numeric SpO₂ alarm while there is no pulse to read');
}

console.log('ot-sim alarms: ok');
