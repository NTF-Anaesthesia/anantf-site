// Vasoactive drugs (js/model/vaso.js through pk.js and cardio.js) against MODEL.md section 5's table. Wide
// tolerances: the populations differ and the mapping is our design. GA here is the MAC-1.6 test state set by hand until
// volatile.js (M2.5). Run: node ot/test/vaso.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';

const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const ga = () => { const s = createSim({ seed: 1, profile: { fixed, macStub: 1.6 } }); s.step(3000); return s; };
const awake = () => createSim({ seed: 1, profile: { fixed } });
const avg = (s, secs = 10) => { const a = { hr: 0, map: 0, co: 0, dbp: 0 }, n = secs * 10; for (let i = 0; i < n; i++) { s.step(1); for (const k in a) a[k] += s.state.cv[k] / n; } return a; };
const bol = (drug, dose, unit = 'mcg') => ({ type: 'bolus', drug, dose, unit, route: 'iv' });
function course(mkS, acts, minutes) {
  const s = mkS(), b = avg(s, 20);
  for (const a of acts) s.act(a);
  const r = { mapMax: -1e9, tMax: 0, hrMin: 1e9, hrMax: -1e9, coMin: 1e9, dbpMin: 1e9, at: {} };
  for (let i = 1; i <= minutes * 600; i++) {
    s.step(1);
    const c = s.state.cv;
    if (c.map > r.mapMax) { r.mapMax = c.map; r.tMax = i / 10; }
    r.hrMin = Math.min(r.hrMin, c.hr); r.hrMax = Math.max(r.hrMax, c.hr); r.coMin = Math.min(r.coMin, c.co); r.dbpMin = Math.min(r.dbpMin, c.dbp);
    if (i % 600 === 0) r.at[i / 600] = { map: c.map - b.map, hr: c.hr - b.hr };
  }
  return { ...r, mapRise: r.mapMax - b.map, hrFall: r.hrMin - b.hr, hrRise: r.hrMax - b.hr, coFall: r.coMin - b.co, dbpFall: r.dbpMin - b.dbp };
}
const inRange = (x, lo, hi, what) => assert.ok(x >= lo && x <= hi, `${what}: ${x} not in ${lo}..${hi}`);

// phenylephrine 50 / 100 / 200 mcg: MAP +11.6 / +15.6 / +18.0, peak about 42 s, CO -0.6 to -0.8 L/min, reflex
// bradycardia (Schwinn & Reves 1989, under GA); about half remains at 5 min (Anderson PK: a known miss of "wanes in 5")
{
  const p50 = course(ga, [bol('phenylephrine', 50)], 6), p100 = course(ga, [bol('phenylephrine', 100)], 6), p200 = course(ga, [bol('phenylephrine', 200)], 6);
  inRange(p50.mapRise, 8, 15, 'PE 50 MAP rise'); inRange(p100.mapRise, 11.5, 19.5, 'PE 100 MAP rise'); inRange(p200.mapRise, 14, 22, 'PE 200 MAP rise');
  assert.ok(p50.mapRise < p100.mapRise && p100.mapRise < p200.mapRise, 'dose-response, saturating');
  inRange(p100.tMax, 25, 60, 'PE 100 peak time (s)');
  inRange(p100.coFall, -1.2, -0.5, 'PE 100 CO fall'); inRange(p100.hrFall, -12, -3, 'PE 100 reflex bradycardia');
  assert.ok(p100.at[5].map < p100.mapRise * 0.6, 'PE 100 less than 60% left at 5 min');
}
// noradrenaline: 10 mcg about phenylephrine 100 mcg (Ngan Kee 2017); an infusion's effect falls fast after stopping
{
  const n10 = course(ga, [bol('noradrenaline', 10)], 4);
  inRange(n10.mapRise, 9, 17, 'NA 10 MAP rise');
  const s = ga(), b = avg(s, 20);
  s.act({ type: 'infusion', drug: 'noradrenaline', rate: 0.1, unit: 'mcg/kg/min' }); s.step(6000);
  const on = avg(s).map - b.map;
  s.act({ type: 'infusion', drug: 'noradrenaline', rate: 0 }); s.step(1200);
  const two = avg(s).map - b.map; s.step(1800);
  const five = avg(s).map - b.map;
  inRange(on, 8, 25, 'NA 0.1 mcg/kg/min MAP rise');
  assert.ok(two < on * 0.75 && five < on * 0.3, `NA offset: ${on} -> ${two} at 2 min -> ${five} at 5 min`);
}
// adrenaline: beta at low doses (HR up, DBP down), alpha at high doses (Clutter 1980)
{
  const a10 = course(ga, [bol('adrenaline', 10)], 4), a100 = course(ga, [bol('adrenaline', 100)], 4), a1000 = course(ga, [bol('adrenaline', 1000)], 4);
  assert.ok(a10.hrRise > 8 && a10.dbpFall < -2 && Math.abs(a10.mapRise) < 6, `adrenaline 10: ${JSON.stringify([a10.hrRise, a10.dbpFall, a10.mapRise])}`);
  assert.ok(a100.mapRise > a10.mapRise + 4 && a1000.mapRise > 15, 'alpha effect grows with dose');
}
// vasopressin 1 unit: a sustained rise
{ const v = course(ga, [bol('vasopressin', 1, 'units')], 10); inRange(v.at[2].map, 6, 22, 'vasopressin 1 U at 2 min'); assert.ok(v.at[10].map > 4, 'vasopressin lasts'); }
// atropine 0.6 mg: HR peak at 2-4 min (SmPC), lasting; glycopyrrolate 0.2 mg similar; low-dose atropine first slows a little
{
  const at = course(awake, [bol('atropine', 600)], 10), gl = course(awake, [bol('glycopyrrolate', 200)], 10);
  inRange(at.at[3].hr, 12, 35, 'atropine 0.6 mg HR rise at 3 min'); assert.ok(at.at[10].hr > at.at[3].hr * 0.7, 'atropine lasts');
  inRange(gl.at[3].hr, 8, 30, 'glycopyrrolate 0.2 mg HR rise at 3 min');
  const low = course(awake, [bol('atropine', 300)], 1);
  assert.ok(low.hrFall < -0.5, 'atropine 0.3 mg: a small slowing first');
}
// esmolol blunts the heart-rate response to laryngoscopy; labetalol and GTN lower pressure
{
  const lary = (pre) => {
    const s = awake();
    s.act({ type: 'tci', drug: 'propofol', target: 4 }); s.act({ type: 'tci', drug: 'remifentanil', target: 1 });
    for (const a of pre) s.act(a);
    s.step(6000);
    const b = avg(s);
    s.act({ type: 'stimulus', kind: 'laryngoscopy' });
    let hr = 0; for (let i = 0; i < 1200; i++) { s.step(1); hr = Math.max(hr, s.state.cv.hr); }
    return hr - b.hr;
  };
  const without = lary([]), withEsmolol = lary([{ type: 'infusion', drug: 'esmolol', rate: 200, unit: 'mcg/kg/min' }]);
  assert.ok(withEsmolol < without * 0.75, `esmolol blunts the HR rise: ${withEsmolol} vs ${without}`);
  const lab = course(ga, [bol('labetalol', 20, 'mg')], 10);
  inRange(lab.at[5].map, -15, -3, 'labetalol 20 mg MAP at 5 min');
  const s = ga(), b = avg(s, 20);
  s.act({ type: 'infusion', drug: 'gtn', rate: 50, unit: 'mcg/min' }); s.step(6000);
  inRange(avg(s).map - b.map, -16, -5, 'GTN 50 mcg/min MAP');
}
// ephedrine: repeated doses give less each time (noradrenaline store, tachyphylaxis)
{
  const s = ga(), b = avg(s, 20), peaks = [];
  for (let k = 0; k < 4; k++) { s.act(bol('ephedrine', 6, 'mg')); let mx = -1e9; for (let i = 0; i < 1800; i++) { s.step(1); mx = Math.max(mx, s.state.cv.map); } peaks.push(mx - b.map); }
  inRange(peaks[0], 7, 18, 'ephedrine 6 mg first rise');
  assert.ok(peaks[3] < peaks[0] * 0.8, `tachyphylaxis: ${peaks}`);
  assert.ok(s.state.cv.store < 0.5, 'the store runs down');
}

console.log('ot-sim vaso: ok');
