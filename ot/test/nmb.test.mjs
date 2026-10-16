// Neuromuscular block (js/model/nmb.js and the readout in pd.js) against MODEL.md section 2's targets.
// Run: node ot/test/nmb.test.mjs
import assert from 'node:assert/strict';
import { stepNm, emptyNm, freeRoc } from '../js/model/nmb.js';
import { readNmb } from '../js/model/pd.js';
import { createSim } from '../js/model/sim.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const P = { weightKg: 70, che: 1 };

// run doses [{ t (min), drug, mg }] and return the first time (min) pred(readout, t) holds
function first(doses, minutes, pred, p = P, dtS = 0.1) {
  let nm = emptyNm(), k = 0;
  const ev = [...doses].sort((a, b) => a.t - b.t), per = 60 / dtS;
  for (let i = 0; i <= minutes * per; i++) {
    const t = i / per, add = {};
    while (k < ev.length && ev[k].t <= t + 1e-9) { add[ev[k].drug] = (add[ev[k].drug] || 0) + ev[k].mg; k++; }
    nm = stepNm(nm, add, p, dtS / 60);
    const r = readNmb(nm, p.weightKg);
    if (pred(r, t + dtS / 60, nm)) return t + dtS / 60;
  }
  return NaN;
}
const roc = (mgkg, t = 0) => ({ t, drug: 'rocuronium', mg: mgkg * 70 });
const sgx = (mgkg, t) => ({ t, drug: 'sugammadex', mg: mgkg * 70 });

// rocuronium 0.6 mg/kg: 80% block at about 1.0 min (label), 95% at about 1.5 (Magorian 89 s), T1 25% about 31 min
// (label median; range 15-85)
near(first([roc(0.6)], 10, r => r.t1 < 0.2), 1.0, 0.2, 'roc 0.6: 80% block');
near(first([roc(0.6)], 10, r => r.t1 < 0.05), 1.5, 0.3, 'roc 0.6: 95% block');
near(first([roc(0.6)], 120, (r, t) => t > 5 && r.t1 > 0.25), 31, 6, 'roc 0.6: T1 25%');
// 1.2 mg/kg: maximum block about 1.0 min (label; Magorian 55 s), T1 25% about 60-67 min
near(first([roc(1.2)], 10, r => r.t1 < 0.05), 0.92, 0.3, 'roc 1.2: 95% block');
const dur12 = first([roc(1.2)], 200, (r, t) => t > 5 && r.t1 > 0.25);
assert.ok(dur12 > 55 && dur12 < 72, `roc 1.2: T1 25% at ${dur12}`);
// TOF: twitches go in the order T4, T3, T2, T1 and the count is never more than one twitch away from T1's state
{
  let seen = [];
  first([roc(0.6)], 3, r => { if (seen.at(-1) !== r.tofCount) seen.push(r.tofCount); return false; });
  assert.deepEqual(seen, [4, 3, 2, 1, 0], 'twitches disappear one by one');
  // the acceleromyography anchors (Kopman 2002): TOFR 0.9 at T1 about 86%, TOFR 0.7 at T1 about 69%
  const t1When = ratio => { let v = 0; first([roc(0.6)], 200, (r, t) => { if (t > 5 && r.tofr != null && r.tofr >= ratio) { v = r.t1; return true; } return false; }); return v; };
  near(t1When(0.9), 0.86, 0.03, 'T1 at TOFR 0.9'); near(t1When(0.7), 0.69, 0.08, 'T1 at TOFR 0.7');
  // and T4 disappears at T1 about 25% (Lee 1975)
  let t1T4 = 0; first([roc(0.6)], 3, r => { if (r.tofCount < 4 && !t1T4) t1T4 = r.t1; return false; });
  near(t1T4, 0.25, 0.05, 'T1 when T4 disappears');
}

// sugammadex: 2 mg/kg at T2 -> TOFR 0.9 in about 1.5 min (Blobner 2010; Sorgenfrei 2006 4 mg/kg 1.1 min); 4 mg/kg at
// PTC 1-2 -> about 2.9 min (Jones 2008; the model is faster, about 2.2: a known miss); 16 mg/kg 3 min after 1.2 mg/kg
// -> T1 10% about 1.2 min later (Lee 2009; the model about 1.5)
{
  const tT2 = first([roc(0.6)], 200, (r, t) => t > 5 && r.tofCount >= 2);
  near(first([roc(0.6), sgx(2, tT2)], tT2 + 30, (r, t) => t > tT2 && r.tofr != null && r.tofr >= 0.9) - tT2, 1.5, 0.3, 'sugammadex 2 mg/kg at T2');
  const tP = first([roc(0.6)], 200, (r, t) => t > 5 && r.ptc >= 1);
  const deep = first([roc(0.6), sgx(4, tP)], tP + 30, (r, t) => t > tP && r.tofr != null && r.tofr >= 0.9) - tP;
  assert.ok(deep > 1.8 && deep < 3.5, `sugammadex 4 mg/kg at PTC 1: ${deep}`);
  near(first([roc(0.6), sgx(4, tT2)], tT2 + 30, (r, t) => t > tT2 && r.tofr >= 0.9) - tT2, 1.1, 0.4, 'sugammadex 4 mg/kg at T2');
  near(first([roc(1.2), sgx(16, 3)], 30, (r, t) => t > 3 && r.t1 >= 0.1) - 3, 1.2, 0.4, 'sugammadex 16 mg/kg at 3 min');
  // too little sugammadex for a deep block: TOFR stalls, then recurarisation risk is visible as a slow climb
  const small = first([roc(1.2), sgx(1, 10)], 25, (r, t) => t > 10 && r.tofr != null && r.tofr >= 0.9);
  assert.ok(!(small < 25), 'sugammadex 1 mg/kg on a deep block does not reverse it within 15 min');
}
// the binding: free rocuronium from totals is a root and stays tiny with excess sugammadex
for (const [R, S] of [[10, 0], [10, 5], [10, 10], [10, 20], [0.001, 50], [100, 99.99]]) {
  const r = freeRoc(R, S), c = R - r;
  near(c * 1, ((S - c) * r) / 0.0559, 1e-6 * Math.max(1, c), `KD holds for R ${R}, S ${S}`);
  assert.ok(r >= 0 && r <= R);
}
// dt invariance of the binding: a 10 times smaller step gives the same reversal time
{
  const tT2 = first([roc(0.6)], 200, (r, t) => t > 5 && r.tofCount >= 2);
  const a = first([roc(0.6), sgx(2, tT2)], tT2 + 30, (r, t) => t > tT2 && r.tofr >= 0.9);
  const b = first([roc(0.6), sgx(2, tT2)], tT2 + 30, (r, t) => t > tT2 && r.tofr >= 0.9, P, 0.01);
  near(a, b, 0.02, 'reversal time with dt 0.1 vs 0.01 s');
}

// post-tetanic count: first PTC response about 16 min before the first TOF response after 1 mg/kg (Baykara 2002)
{
  const p1 = first([roc(1)], 200, (r, t) => t > 5 && r.ptc >= 1), c1 = first([roc(1)], 200, (r, t) => t > 5 && r.tofCount >= 1);
  near(c1 - p1, 16, 2, 'PTC to TOF interval');
}

// suxamethonium 1 mg/kg: onset under 1 min, T1 10% 7.1 min, T1 90% 10.9 min (Lee 2009); variants scale hydrolysis
{
  const sux = [{ t: 0, drug: 'suxamethonium', mg: 70 }];
  assert.ok(first(sux, 5, r => r.t1 < 0.05) < 1, 'sux onset under 1 min');
  near(first(sux, 60, (r, t) => t > 1 && r.t1 >= 0.1), 7.1, 0.5, 'sux T1 10%');
  near(first(sux, 60, (r, t) => t > 1 && r.t1 >= 0.9), 10.9, 0.8, 'sux T1 90%');
  // phase I: no fade while recovering
  let fade = 1; first(sux, 30, (r, t) => { if (t > 1 && r.tofr != null) fade = Math.min(fade, r.tofr); return false; });
  assert.ok(fade > 0.95, `sux phase I shows no fade: TOFR min ${fade}`);
  const het = first(sux, 120, (r, t) => t > 1 && r.t1 >= 0.9, { weightKg: 70, che: 0.5 });
  assert.ok(het > 12 && het < 20, `heterozygous: T1 90% at ${het}`);
  const hom = first(sux, 900, (r, t) => t > 1 && r.t1 >= 0.9, { weightKg: 70, che: 0.01 });
  assert.ok(hom > 240, `homozygous atypical: hours (${hom} min)`);
  // phase II after 5 mg/kg total: fade appears
  let f2 = 1; first([0, 2, 4, 6, 8].map(t => ({ t, drug: 'suxamethonium', mg: 70 })), 30, (r, t) => { if (t > 9 && r.tofr != null) f2 = Math.min(f2, r.tofr); return false; });
  assert.ok(f2 < 0.7, `phase II fade: TOFR min ${f2}`);
}

// neostigmine 50 mcg/kg at TOF count 1: TOFR about 0.55 / 0.71 / 0.81 at 10 / 15 / 20 min (Kopman 2005); at T2 TOFR 0.9
// in about 18.6 min (Blobner 2010); from a deep block it is slow (Jones 2008: 70 mcg/kg at PTC 1-2, 50 min; model
// about 32, a known miss) and far slower than sugammadex
{
  const tc1 = first([roc(0.6)], 200, (r, t) => t > 5 && r.tofCount >= 1);
  const neo = [roc(0.6), { t: tc1, drug: 'neostigmine', mg: 50 * 70 }];
  const tofrAt = m => { let v = null; first(neo, tc1 + m + 0.01, (r, t) => { if (Math.abs(t - (tc1 + m)) < 1e-6) v = r.tofr; return false; }); return v; };
  near(tofrAt(10), 0.55, 0.1, 'neostigmine TOFR at 10 min'); near(tofrAt(15), 0.71, 0.1, 'at 15 min'); near(tofrAt(20), 0.81, 0.1, 'at 20 min');
  const spont = first([roc(0.6)], 200, (r, t) => t > tc1 && r.tofr >= 0.9), withNeo = first(neo, 200, (r, t) => t > tc1 && r.tofr >= 0.9);
  assert.ok(withNeo < spont - 10, `neostigmine speeds recovery: ${withNeo} vs ${spont}`);
  const tT2 = first([roc(0.6)], 200, (r, t) => t > 5 && r.tofCount >= 2);
  near(first([roc(0.6), { t: tT2, drug: 'neostigmine', mg: 50 * 70 }], 200, (r, t) => t > tT2 && r.tofr >= 0.9) - tT2, 18.6, 3, 'neostigmine at T2 (Blobner)');
  const tP = first([roc(0.6)], 200, (r, t) => t > 5 && r.ptc >= 1);
  const jones = first([roc(0.6), { t: tP, drug: 'neostigmine', mg: 70 * 70 }], 200, (r, t) => t > tP && r.tofr >= 0.9) - tP;
  assert.ok(jones > 25 && jones < 60, `neostigmine from a deep block is slow: ${jones} min`);
}

// in the sim: boluses as actions, the readout in pd.nmb, the TOF module every 15 s, PTC on request
{
  const s = createSim({ seed: 2 });
  assert.equal(s.state.pd.nmb.tofCount, 4); assert.equal(s.state.mon.tof.count, 4);
  s.act({ type: 'bolus', drug: 'rocuronium', dose: 0.6, unit: 'mg/kg', route: 'iv' });
  s.step(1800);
  assert.equal(s.state.pd.nmb.tofCount, 0); assert.equal(s.state.mon.tof.count, 0);
  assert.ok(s.state.pd.nmb.diaphragm > s.state.pd.nmb.t1, 'the diaphragm is spared relative to the thumb');
  s.act({ type: 'tof', do: 'ptc' });
  s.step(1);
  assert.ok(Number.isInteger(s.state.mon.tof.ptc), 'PTC reported with no TOF response');
  s.act({ type: 'bolus', drug: 'sugammadex', dose: 16, unit: 'mg/kg', route: 'iv' });
  s.step(3000);
  assert.equal(s.state.mon.tof.count, 4); assert.ok(s.state.mon.tof.ratio > 0.9);
  // a heterozygous patient keeps suxamethonium longer
  const t90 = che => { const x = createSim({ seed: 1, profile: { che } }); x.act({ type: 'bolus', drug: 'suxamethonium', dose: 1, unit: 'mg/kg', route: 'iv' }); let i = 0; do { x.step(10); i++; } while ((i < 30 || x.state.pd.nmb.t1 < 0.9) && i < 2000); return i; };
  assert.ok(t90(0.5) > t90(1) * 1.2);
}

console.log('ot-sim nmb: ok');
