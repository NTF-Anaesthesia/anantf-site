// Breathing and gas exchange (js/model/resp.js, gas.js) against MODEL.md sections 7-8. Tolerant bounds: the model is a
// teaching approximation. Run: node ot/test/gas.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { sat, content, GAS } from '../js/model/gas.js';
import { ventBreath, RESP } from '../js/model/resp.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const inRange = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in ${lo}..${hi}`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const mk = (profile = {}) => createSim({ seed: 1, profile: { fixed, ...profile } });
const bol = (drug, dose, unit) => ({ type: 'bolus', drug, dose, unit, route: 'iv' });

// Severinghaus ODC [V]: 50% at about 26.6 mmHg, 90% at about 58, near 100 at 100
near(sat(26.6) * 100, 50, 2, 'ODC P50'); near(sat(100) * 100, 98, 2, 'ODC at 100 mmHg'); assert.ok(sat(58) > 0.88 && sat(58) < 0.92, 'ODC at 58');

// awake steady state breathing air: SaO2 about 97-99, PaCO2 about 40, EtCO2 a few mmHg below, RR about 13
{
  const s = mk(); const g = s.state.gas, r = s.state.resp;
  inRange(g.sao2, 96, 100, 'awake SaO2'); near(g.paco2, 40, 3, 'awake PaCO2');
  inRange(g.paco2 - g.etco2, 1.5, 5, 'PaCO2 - EtCO2 gap'); inRange(r.rr, 10, 17, 'awake RR');
}

// apnoea after induction and paralysis: time to SaO2 90% (gas, not the display). Preoxygenated healthy about 8 min;
// breathing air about 1 min; obese faster; the fall is quick once it starts
function apnoeaTo90(profile, pre, during, obstruct = true, maxMin = 25) {
  const s = mk(profile);
  s.act({ type: 'o2', fio2: pre }); s.step(1800);
  s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act(bol('rocuronium', 1.2, 'mg/kg')); s.step(300);
  // obstruct = closed-system apnoea: a paralysed natural airway obstructs, so no apnoeic oxygenation (airway.js).
  // Otherwise secure the airway (a tube) so a patent airway on oxygen gives apnoeic oxygenation.
  if (!obstruct) s.act({ type: 'intubate' });
  s.act({ type: 'o2', fio2: during });
  const t0 = s.state.t;
  for (let i = 0; i < maxMin * 600; i++) { s.step(1); if (s.state.gas.sao2 < 90) return (s.state.t - t0) / 60; }
  return Infinity;
}
inRange(apnoeaTo90({}, 1, 1), 6, 11, 'healthy preoxygenated apnoea to SaO2 90%');
inRange(apnoeaTo90({}, 0.21, 0.21), 0.4, 1.5, 'healthy breathing air apnoea to SaO2 90%');
inRange(apnoeaTo90({ weightKg: 130 }, 1, 1), 1.8, 4.5, 'obese preoxygenated apnoea');
assert.equal(apnoeaTo90({}, 1, 1, false, 12), Infinity, 'apnoeic oxygenation through an open airway holds SaO2 up');

// CO2 with an occluded airway rises about 3-4 mmHg a minute (Stock 1989); it is faster in the first minute
{
  const s = mk();
  s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act(bol('rocuronium', 1.2, 'mg/kg')); s.step(600);
  // the paralysed natural airway obstructs (airway.js), so this is apnoea: CO2 rises
  const p0 = s.state.gas.paco2; s.step(600); const p1 = s.state.gas.paco2; s.step(2400); const p5 = s.state.gas.paco2;
  inRange(p1 - p0, 2.5, 12, 'PaCO2 rise in the first minute (the venous-equilibration jump is not modelled: a known miss)'); inRange((p5 - p1) / 4, 2.5, 4.5, 'PaCO2 rise per minute after');
}

// pre-oxygenation: breathing 100% O2 washes nitrogen out, raising end-tidal O2 above 0.8 within a few minutes
{
  const s = mk(); s.act({ type: 'o2', fio2: 1 }); s.step(1800);
  assert.ok(s.state.gas.fa.o2 > 0.85, `end-tidal O2 after pre-oxygenation: ${s.state.gas.fa.o2}`);
  assert.ok(s.state.gas.fa.n2 < 0.1, 'nitrogen washed out');
}

// spontaneous breathing is depressed by drugs: remifentanil 1 ng/mL and propofol 1 mcg/mL lower resting minute
// ventilation (Nieuwenhuijs 2003: about -28% and -13%)
for (const [drug, target, lo, hi] of [['remifentanil', 1, -0.4, -0.15], ['propofol', 1, -0.25, -0.05]]) {
  const s = mk(); s.step(600); const ve0 = s.state.resp.mv;
  s.act({ type: 'tci', drug, target }); s.step(18000);
  const d = s.state.resp.mv / ve0 - 1;
  inRange(d, lo, hi, `${drug} ${target} resting ventilation`);
}
// a big induction dose causes apnoea; remifentanil co-induction makes it longer
{
  const dur = acts => { const s = mk(); s.step(100); for (const a of acts) s.act(a); let d = 0; for (let i = 0; i < 6000; i++) { s.step(1); if (s.state.resp.apnoea) d += 0.1; } return d; };
  const alone = dur([bol('propofol', 2, 'mg/kg')]), withRemi = dur([bol('propofol', 2, 'mg/kg'), { type: 'tci', drug: 'remifentanil', target: 2 }]);
  assert.ok(alone > 5, `propofol induction apnoea: ${alone} s`);
  assert.ok(withRemi > alone, 'opioid lengthens induction apnoea');
}

// the ventilator (closed form): volume control Pplat = PEEP + Vt/C, Ppeak above it; pressure control delivers
// Vt = dP x C x (1 - e^-Ti/tau)
{
  const vc = ventBreath({ mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5 }, 50, RESP.rAirway);
  near(vc.pplat, 5 + 500 / 50, 0.5, 'VC plateau pressure'); assert.ok(vc.ppeak > vc.pplat, 'peak above plateau');
  const pc = ventBreath({ mode: 'pc', pinsp: 15, rr: 12, peep: 5, ie: 0.5 }, 50, RESP.rAirway);
  assert.ok(pc.vt > 400 && pc.vt < 800, `PC tidal volume: ${pc.vt}`);
}
// in the sim: volume control ventilates, oxygenates on 50% O2, and gives a sensible Ppeak
{
  const s = mk();
  s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act(bol('rocuronium', 1, 'mg/kg'));
  s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }); s.step(3000);
  inRange(s.state.resp.ppeak, 12, 28, 'VC Ppeak in the sim'); assert.ok(s.state.gas.sao2 > 98, 'oxygenated on 50%');
  inRange(s.state.gas.paco2, 25, 45, 'ventilated PaCO2');
}
// pulse pressure variation: small when full, large after a bleed (the Starling slope)
{
  const s = mk();
  s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act(bol('rocuronium', 1, 'mg/kg'));
  s.act({ type: 'vent', mode: 'vc', vt: 560, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }); s.step(3000);
  const ppv = () => { for (let i = 0; i < 1200; i++) s.step(1); const b = s.state.ev.ring.filter(e => e.kind === 'beat').slice(-12).map(x => x.sbp - x.dbp); const mx = Math.max(...b), mn = Math.min(...b); return (100 * (mx - mn)) / ((mx + mn) / 2); };
  const normo = ppv();
  inRange(normo, 3, 12, 'PPV when normovolaemic');
  const bv0 = s.state.cv.bloodVol; s.act({ type: 'bleed', mlPerMin: bv0 / 100 });
  while ((bv0 - s.state.cv.bloodVol) / bv0 < 0.2) s.step(10);
  s.act({ type: 'bleed', mlPerMin: 0 }); s.step(300);
  assert.ok(ppv() > normo + 6, 'PPV rises with hypovolaemia (responder)');
}
// mass balance: the default constants give the resting gaps
assert.equal(GAS.vdAlv, 0.06);
assert.ok(content(100, 150) > content(40, 150), 'content rises with PO2');

console.log('ot-sim gas: ok');
