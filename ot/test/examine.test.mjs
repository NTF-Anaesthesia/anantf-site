// Examine (ui/examine.js) reads the model into bedside findings, and the Help list (ui/help.js) is well-formed.
// Pure read + data; a real sim is driven into a few states to check the findings follow it.

import assert from 'node:assert/strict';
import { examine } from '../js/ui/examine.js';
import { HELP, HELP_EVENT } from '../js/ui/help.js';
import { createSim } from '../js/model/sim.js';
import { applyPreset } from '../js/model/presets.js';

const find = (rows, region) => rows.find(r => r[0] === region)[1];

// every region is reported, with text
function regions(rows) { return rows.map(r => r[0]); }

// awake, healthy adult, breathing air: pink, warm, breath sounds clear, reactive, can move
{
  const sim = createSim({ seed: 1 });
  const rows = examine(sim.state);
  assert.deepEqual(regions(rows), ['Chest movement', 'Breath sounds', 'Skin', 'Pupils', 'Movement and tone']);
  assert.match(find(rows, 'Breath sounds'), /equal on both sides/);
  assert.match(find(rows, 'Skin'), /Pink/);
  assert.match(find(rows, 'Pupils'), /reactive|open the eyes/);
  assert.match(find(rows, 'Movement and tone'), /Moving|move to voice/);
}

// induced, intubated, ventilated and paralysed (the elective GA start): ventilator breaths, sluggish pupils, no movement
{
  const sim = createSim({ seed: 1 });
  applyPreset(sim, 'induced');
  const rows = examine(sim.state);
  assert.match(find(rows, 'Chest movement'), /ventilator/);
  assert.match(find(rows, 'Pupils'), /sluggishly|anaesthetised/);
  assert.match(find(rows, 'Movement and tone'), /paralysed|neuromuscular block/);
}

// a tube in the oesophagus: no breath sounds, gurgling over the stomach
{
  const sim = createSim({ seed: 1 });
  sim.act({ type: 'intubate', placement: 'oesophageal' });
  sim.step(5);
  assert.equal(sim.state.aw.placement, 'oesophageal', 'tube placed in the oesophagus');
  assert.match(find(examine(sim.state), 'Breath sounds'), /not in the trachea|stomach/);
}

// Help list is well-formed and every action has an events label
assert.equal(HELP.length, 4, 'four help actions');
for (const h of HELP) {
  for (const k of ['do', 'label', 'ack']) assert.ok(typeof h[k] === 'string' && h[k].length, `help.${k} filled`);
  assert.ok(HELP_EVENT[h.do], `an events label for ${h.do}`);
}
assert.ok(HELP.some(h => /help/i.test(h.label)), 'call for help is present');
assert.ok(HELP.some(h => /haemorrhage/i.test(h.label)), 'major haemorrhage protocol is present');

console.log('ot-sim examine: ok');
