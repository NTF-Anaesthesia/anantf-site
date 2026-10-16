// The airway (js/model/airway.js, with resp.js and gas.js) against MODEL.md section 9. Run: node ot/test/airway.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';

const band = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in [${lo}, ${hi}]`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
// an induced, paralysed, pre-oxygenated patient on a natural airway
const induced = (profile = {}) => {
  const s = createSim({ seed: 1, profile: { fixed, ...profile } });
  s.act({ type: 'o2', fio2: 1 }); s.step(1800);
  s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act({ type: 'bolus', drug: 'rocuronium', dose: 1.2, unit: 'mg/kg', route: 'iv' }); s.step(600);
  return s;
};
const adv = (s, sec) => { s.step(Math.round(sec / s.state.dt)); return s; };
const vent = (s, fio2 = 1) => { s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2 }); return s; };

// the hidden Cormack-Lehane view is drawn per patient, mostly grade 1-2 with occasional 3-4 (research/crises.md)
{
  const dist = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let seed = 1; seed <= 300; seed++) dist[createSim({ seed, warmup: 0 }).state.aw.features.clDirect]++;
  assert.ok(dist[1] + dist[2] > 255, `most airways are grade 1-2 (${dist[1] + dist[2]}/300)`);
  assert.ok(dist[3] + dist[4] >= 8 && dist[3] + dist[4] < 90, `some are difficult (${dist[3] + dist[4]}/300)`);
  // a videolaryngoscope never gives a worse view than direct
  for (let seed = 1; seed <= 50; seed++) { const f = createSim({ seed, warmup: 0 }).state.aw.features; assert.ok(f.clVideo <= f.clDirect, 'video view no worse than direct'); }
  // same seed, same airway (deterministic)
  assert.equal(createSim({ seed: 5, warmup: 0 }).state.aw.features.clDirect, createSim({ seed: 5, warmup: 0 }).state.aw.features.clDirect);
}
// a laryngoscopy reports the patient's grade; repeated attempts worsen the view
{
  const s = induced();
  s.act({ type: 'laryngoscopy' }); adv(s, 1);
  assert.equal(s.state.aw.view, s.state.aw.features.clDirect, 'direct laryngoscopy shows the patient grade');
  const vid = induced(); vid.act({ type: 'laryngoscopy', video: true }); adv(vid, 1);
  assert.ok(vid.state.aw.view <= s.state.aw.view, 'video view no worse');
}
// a tracheal tube ventilates and reads a capnograph; an oesophageal tube shows no CO2 (the catch) within the first breaths
{
  const tr = vent(induced()); tr.act({ type: 'intubate', placement: 'tracheal' }); adv(tr, 60);
  band(tr.state.gas.etco2, 28, 42, 'tracheal ETT EtCO2'); assert.ok(tr.state.gas.sao2 > 97, 'tracheal ETT oxygenates');
  const oe = vent(induced()); oe.act({ type: 'intubate', placement: 'oesophageal' }); adv(oe, 45);
  assert.ok(oe.state.gas.etco2 < 3, `oesophageal ETT shows no CO2 (${oe.state.gas.etco2.toFixed(1)})`);
  assert.equal(oe.state.resp.open, false, 'no gas reaches the lungs');
  // and it desaturates (closed system) given time (the real catch is the absent CO2 above, long before this)
  adv(oe, 840); assert.ok(oe.state.gas.sao2 < 92, `oesophageal ETT eventually desaturates (${oe.state.gas.sao2.toFixed(0)})`);
}
// endobronchial (one lung): a shunt is added, so oxygenation is worse than a tracheal tube on the same FiO2
{
  const eb = vent(induced(), 0.3); eb.act({ type: 'intubate', placement: 'endobronchial' }); adv(eb, 480);
  const tr = vent(induced(), 0.3); tr.act({ type: 'intubate', placement: 'tracheal' }); adv(tr, 480);
  assert.equal(eb.state.aw.oneLung, true, 'endobronchial is one-lung');
  assert.ok(eb.state.gas.sao2 < tr.state.gas.sao2 - 1, `one lung oxygenates worse (${eb.state.gas.sao2.toFixed(0)} vs ${tr.state.gas.sao2.toFixed(0)})`);
}
// a natural airway obstructs under anaesthesia and paralysis; a manoeuvre or an airway device relieves it
{
  const s = induced();
  assert.ok(s.state.aw.obstruction > 0.6 && s.state.resp.open === false, `paralysed natural airway obstructs (${s.state.aw.obstruction.toFixed(2)})`);
  const j = induced(); j.act({ type: 'manoeuvre', to: 'opa' }); adv(j, 1);
  assert.ok(j.state.aw.obstruction < s.state.aw.obstruction, 'an oropharyngeal airway relieves obstruction');
  const sad = induced(); sad.act({ type: 'device', to: 'sad' }); adv(sad, 1);
  assert.ok(sad.state.aw.toLungs > 0.8, 'a supraglottic airway bypasses the obstruction');
}
// pre-oxygenation through a leaky mask entrains room air, so the end-tidal O2 reaches less than a good seal
{
  // find a sealed (grade 1) and a leaky (grade >= 2) patient
  let sealed = null, leaky = null;
  for (let seed = 1; seed <= 40 && !(sealed && leaky); seed++) {
    const g = createSim({ seed, warmup: 0 }).state.aw.features.maskGrade;
    if (g === 1 && !sealed) sealed = seed; if (g >= 2 && !leaky) leaky = seed;
  }
  const pre = seed => { const s = createSim({ seed, profile: { fixed } }); s.act({ type: 'device', to: 'mask' }); s.act({ type: 'o2', fio2: 1 }); s.step(1800); return s; };
  const a = pre(sealed), b = pre(leaky);
  assert.equal(a.state.aw.entrain, 0, 'a good mask seal entrains no room air');
  assert.ok(b.state.aw.entrain > 0, 'a leaky mask entrains room air');
  assert.ok(b.state.gas.etO2 < a.state.gas.etO2 - 5, `a leaky mask pre-oxygenates less (${b.state.gas.etO2.toFixed(0)} vs ${a.state.gas.etO2.toFixed(0)})`);
}
// a patent, intubated airway on oxygen gives apnoeic oxygenation (SpO2 holds far longer than a closed system)
{
  const s = vent(induced()); s.act({ type: 'intubate' }); s.act({ type: 'vent', mode: 'spont' }); // tube in, no mandatory breaths
  // (the apnoea/apnoeic-oxygenation split itself is covered in gas.test.mjs; here just confirm the tube keeps the airway open)
  adv(s, 5); assert.equal(s.state.resp.open, true, 'a tube keeps the airway open');
}
// long run with devices stays finite
{
  const s = vent(induced()); s.act({ type: 'intubate', placement: 'endobronchial' }); s.step(12000);
  assert.ok(Number.isFinite(s.state.gas.sao2) && Number.isFinite(s.state.cv.map), 'long airway run stable');
}

console.log('ot-sim airway: ok');
