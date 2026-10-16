// Start presets (js/model/presets.js) against MODEL.md / DESIGN.md "Start presets". Run: node ot/test/presets.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { applyPreset, PRESET_NAMES } from '../js/model/presets.js';

const band = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in [${lo}, ${hi}]`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3, paceThresh: 70 };
const at = name => applyPreset(createSim({ seed: 1, profile: { fixed } }), name, {}).state;

// awake: the warm-start state, nothing applied
{
  const s = at('awake');
  assert.equal(s.t, 0, 'awake is t=0'); assert.equal(s.pd.asleep, false, 'awake'); band(s.gas.sao2, 96, 100, 'awake SpO2');
}
// pre-oxygenated: a mask on 100% O2 denitrogenates (high end-tidal O2), still awake
{
  const s = at('preoxygenated');
  assert.equal(s.aw.device, 'mask', 'on a mask'); assert.ok(s.gas.etO2 > 80, `denitrogenated (etO2 ${s.gas.etO2.toFixed(0)})`);
  assert.equal(s.pd.asleep, false, 'still awake');
}
// sedation: a light propofol target, breathing spontaneously, not paralysed
{
  const s = at('sedation');
  assert.equal(s.pd.nmb.tofCount, 4, 'not paralysed'); assert.equal(s.resp.mode, 'spont', 'breathing spontaneously');
  assert.ok(s.pd.bisLike < 90, `lightly sedated (BIS-like ${s.pd.bisLike.toFixed(0)})`);
}
// induced: asleep, paralysed, intubated and ventilated, well oxygenated
{
  const s = at('induced');
  assert.equal(s.pd.asleep, true, 'asleep'); assert.equal(s.pd.nmb.tofCount, 0, 'paralysed');
  assert.equal(s.aw.device, 'ett', 'intubated'); assert.equal(s.resp.mode, 'vc', 'ventilated'); assert.ok(s.gas.sao2 > 97, 'oxygenated');
}
// maintenance: asleep on the vaporiser, around a surgical depth, oxygenated, some minutes in
{
  const s = at('maintenance');
  assert.equal(s.pd.asleep, true, 'asleep'); band(s.vol.mac, 0.5, 1.3, 'about 1 MAC'); assert.ok(s.t > 900, 'minutes in');
  assert.ok(s.gas.sao2 > 97, 'oxygenated');
}
// emergence: the agent is washing out (falling MAC) and the block is recovering
{
  const s = at('emergence');
  assert.ok(s.vol.mac < 0.5, `agent washing out (MAC ${s.vol.mac.toFixed(2)})`); assert.ok(s.pd.nmb.tofCount >= 2, 'block recovering');
}
// every preset is deterministic (same seed, same state) and finite
for (const name of PRESET_NAMES) {
  const a = at(name), b = at(name);
  assert.equal(a.cv.map.toFixed(4), b.cv.map.toFixed(4), `${name} deterministic`);
  assert.ok(Number.isFinite(a.cv.map) && Number.isFinite(a.gas.sao2), `${name} finite`);
}

console.log('ot-sim presets: ok');
