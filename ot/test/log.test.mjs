// The Log (ui/log.js): actions and events render to readable, timestamped lines, and a real run produces a sensible
// record. Pure, no browser.

import assert from 'node:assert/strict';
import { actionText, logLines } from '../js/ui/log.js';
import { createSim } from '../js/model/sim.js';

// a spread of actions render the way a trainee would read them
assert.equal(actionText({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' }), 'Propofol 200 mg');
assert.equal(actionText({ type: 'infusion', drug: 'remifentanil', rate: 0.2, unit: 'mcg/kg/min' }), 'Remifentanil infusion 0.2 mcg/kg/min');
assert.equal(actionText({ type: 'infusion', drug: 'propofol', rate: 0 }), 'Propofol infusion stopped');
assert.equal(actionText({ type: 'tci', drug: 'propofol', mode: 'effect', target: 4 }), 'Propofol TCI, effect-site target 4');
assert.equal(actionText({ type: 'tci', drug: 'propofol', mode: 'plasma', target: 4 }), 'Propofol TCI, plasma target 4');
assert.equal(actionText({ type: 'tci', drug: 'propofol', stop: true }), 'Propofol TCI stopped');
assert.equal(actionText({ type: 'intubate', placement: 'oesophageal' }), 'Intubated (oesophageal)');
assert.equal(actionText({ type: 'rhythm', to: 'vf' }), 'Rhythm → VF');
assert.equal(actionText({ type: 'defib', joules: 200 }), 'Defibrillated 200 J');
assert.equal(actionText({ type: 'fluid', product: 'rbc', ml: 280 }), 'Red cells 280 mL');
assert.equal(actionText({ type: 'o2', fio2: 1 }), 'FiO₂ 100%');
assert.equal(actionText({ type: 'help', do: 'callHelp' }), 'Called for help');
assert.equal(actionText({ type: 'alarmSilence' }), 'Alarms silenced');
assert.equal(actionText({ type: 'definitely-unknown' }), null, 'unknown actions are left out');

// a real run: give a drug, intubate, impose VF — all show in the log in order, with times
{
  const sim = createSim({ seed: 1 });
  sim.act({ type: 'bolus', drug: 'propofol', dose: 200, unit: 'mg', route: 'iv' });
  sim.step(5);
  sim.act({ type: 'intubate', placement: 'tracheal' });
  sim.step(5);
  sim.act({ type: 'rhythm', to: 'vf' });
  sim.runTo(sim.state.t + 30);
  const lines = logLines(sim.state);
  const texts = lines.map(l => l.text);
  assert.ok(texts.includes('Propofol 200 mg'), 'the propofol bolus is logged');
  assert.ok(texts.includes('Intubated (tracheal)'), 'the intubation is logged');
  assert.ok(texts.includes('Rhythm → VF'), 'the rhythm change is logged');
  assert.ok(lines.every(l => typeof l.t === 'number'), 'every line has a time');
  // times are non-decreasing (chronological, oldest first)
  for (let i = 1; i < lines.length; i++) assert.ok(lines[i].t >= lines[i - 1].t, 'the log is in time order');
  // VF produced a "SpO₂ no pulse" technical alarm entry
  assert.ok(texts.some(t => /SpO₂ — no pulse/.test(t)), 'the alarm shows in the log');
}

// the cap keeps only the most recent lines
{
  const sim = createSim({ seed: 1 });
  for (let i = 0; i < 50; i++) { sim.act({ type: 'bolus', drug: 'fentanyl', dose: 10, unit: 'mcg', route: 'iv' }); sim.step(1); }
  assert.ok(logLines(sim.state, 20).length <= 20, 'the log is capped to the requested maximum');
}

console.log('ot-sim log: ok');
