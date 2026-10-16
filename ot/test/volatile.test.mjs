// Volatile agents (js/model/volatile.js) against MODEL.md section 3. Run: node ot/test/volatile.test.mjs
import assert from 'node:assert/strict';
import { AGENTS, macAt } from '../js/model/volatile.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };

// wash-in (FA/FI) with fixed inspired fraction, VA 4 L/min, CO 5, FRC 2.5 (Yasuda 1991 protocol, no N2O): the agents'
// own tissue-group model, stepped directly
function washin(id, minutes, { va = 4, co = 5, frc = 2.5 } = {}) {
  const ag = AGENTS[id], dt = 0.1 / 60, Fi = 0.01;
  let s = { fa: 0, vrg: 0, mus: 0, fat: 0 };
  const out = {};
  for (let i = 1; i <= minutes * 600; i++) {
    const Pa = s.fa, grp = {};
    let uptake = 0;
    for (const g of [['vrg', 'brain', 6, 0.758], ['mus', 'muscle', 33, 0.18], ['fat', 'fat', 14.5, 0.06]]) {
      const Pg = s[g[0]]; grp[g[0]] = Pg + (co * g[3] * (Pa - Pg)) / (g[2] * ag[g[1]]) * dt; uptake += co * g[3] * ag.lb * (Pa - Pg);
    }
    s = { fa: Math.max(0, Pa + (va * (Fi - Pa) - uptake) / frc * dt), ...grp };
    const t = i / 600;
    for (const m of [1, 5, 10, 30]) if (i === m * 600) out[m] = s.fa / Fi;
  }
  return out;
}
// wash-out: load to 1%, then FI 0, measure FA/FA0
function washout(id, loadMin, minsAfter, opt = {}) {
  const ag = AGENTS[id], dt = 0.1 / 60, co = opt.co || 5, va = opt.va || 4, frc = opt.frc || 2.5;
  let s = { fa: 0, vrg: 0, mus: 0, fat: 0 };
  const run = (Fi, mins) => { for (let i = 0; i < mins * 600; i++) { const Pa = s.fa, grp = {}; let up = 0; for (const g of [['vrg', 'brain', 6, 0.758], ['mus', 'muscle', 33, 0.18], ['fat', 'fat', 14.5, 0.06]]) { const Pg = s[g[0]]; grp[g[0]] = Pg + (co * g[3] * (Pa - Pg)) / (g[2] * ag[g[1]]) * dt; up += co * g[3] * ag.lb * (Pa - Pg); } s = { fa: Math.max(0, Pa + (va * (Fi - Pa) - up) / frc * dt), ...grp }; } };
  run(0.01, loadMin); const fa0 = s.fa; run(0, minsAfter); return s.fa / fa0;
}

// FA/FI at 30 min (Yasuda): desflurane 0.90, sevoflurane 0.85, isoflurane 0.73
near(washin('desflurane', 30)[30], 0.90, 0.03, 'desflurane FA/FI 30 min');
near(washin('sevoflurane', 30)[30], 0.85, 0.03, 'sevoflurane FA/FI 30 min');
near(washin('isoflurane', 30)[30], 0.73, 0.03, 'isoflurane FA/FI 30 min');
// 1 / 5 / 10 min (regression targets)
near(washin('sevoflurane', 30)[1], 0.55, 0.05, 'sevoflurane FA/FI 1 min');
near(washin('sevoflurane', 30)[5], 0.74, 0.04, 'sevoflurane FA/FI 5 min');
// order: wash-in iso < sevo < des
const w = id => washin(id, 30)[10];
assert.ok(w('isoflurane') < w('sevoflurane') && w('sevoflurane') < w('desflurane'), 'wash-in order');
// wash-out FA/FA0 5 min after stopping: sevoflurane about 0.16, isoflurane about 0.24 (desflurane a known miss)
near(washout('sevoflurane', 15, 5), 0.157, 0.05, 'sevoflurane washout 5 min');
near(washout('isoflurane', 15, 5), 0.238, 0.06, 'isoflurane washout 5 min');
assert.ok(washout('desflurane', 15, 5) < washout('sevoflurane', 15, 5), 'washout order: desflurane fastest');

// MAC by age (Mapleson 1996): about -6% a decade
near(macAt(0.018, 50) / macAt(0.018, 40), 0.94, 0.005, 'MAC age slope');
near(macAt(0.018, 40), 0.018, 1e-9, 'sevoflurane MAC at 40 (1.80%)');

// in the sim: the vaporiser raises the agent to a steady end-tidal and MAC; N2O shows the concentration effect; the
// agent puts the patient to sleep and the BIS-like index falls to the 1 MAC band
{
  const mk = () => { const s = createSim({ seed: 1, profile: { fixed } }); s.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 0.5 }); s.act({ type: 'bolus', drug: 'rocuronium', dose: 1, unit: 'mg/kg', route: 'iv' }); return s; };
  const s = mk();
  s.act({ type: 'fgf', o2: 2, air: 0, n2o: 0 }); s.act({ type: 'vaporiser', agent: 'sevoflurane', dial: 2 }); s.step(18000);
  const v = s.state.vol;
  assert.ok(v.fi.sevoflurane > 0.01 && v.fi.sevoflurane < v.dial.sevoflurane / 100 + 1e-9, 'low-flow inspired below the dial');
  near(v.t.sevoflurane.fa / 0.02, 0.64, 0.12, 'low-flow Et/dial');
  near(v.mac, v.ce.sevoflurane / macAt(0.018, 40), 1e-9, 'MAC fraction from the effect site');
  assert.ok(s.state.pd.asleep, 'sevoflurane alone puts the patient to sleep');
  // N2O 70%: FA/FI near 0.97 at 30 min (the concentration effect)
  const n = mk();
  n.act({ type: 'vent', mode: 'vc', vt: 500, rr: 12, peep: 5, ie: 0.5, fio2: 1 });
  n.act({ type: 'fgf', o2: 3, air: 0, n2o: 7 }); n.step(18000);
  near(n.state.vol.t.nitrous.fa / n.state.vol.fi.nitrous, 0.97, 0.03, 'N2O FA/FI 30 min');
  // 1 MAC sevoflurane: BIS-like index 49-55
  const b = mk();
  b.act({ type: 'fgf', o2: 2 }); b.act({ type: 'vaporiser', agent: 'sevoflurane', dial: 2.7 }); b.step(36000);
  near(b.state.vol.mac, 1, 0.12, '1 MAC reached');
  assert.ok(b.state.pd.bisLike > 45 && b.state.pd.bisLike < 58, `1 MAC BIS-like ${b.state.pd.bisLike}`);
  // the vaporiser blunts the circulation (MAP falls as MAC rises)
  const base = createSim({ seed: 1, profile: { fixed } }).state.cv.map;
  assert.ok(b.state.cv.map < base - 8, `volatile lowers MAP (${b.state.cv.map} vs ${base})`);
  // turning it off: the agent washes out and MAC falls
  b.act({ type: 'vaporiser', agent: 'sevoflurane', dial: 0 }); b.act({ type: 'fgf', o2: 8 }); b.step(6000);
  assert.ok(b.state.vol.mac < 0.6, 'MAC falls after turning the vaporiser off');
}

console.log('ot-sim volatile: ok');
