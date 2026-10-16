// Fluids, blood and haemorrhage (js/model/fluids.js through cardio.js) against MODEL.md section 5.
// Run: node ot/test/fluids.test.mjs
import assert from 'node:assert/strict';
import { createSim } from '../js/model/sim.js';
import { initFluids, stepFluids, fluidActions, hbOf } from '../js/model/fluids.js';

const near = (a, b, tol, what) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} not within ${tol} of ${b}`);
const fixed = { q: 0.5, pkV1: 1, pkCL: 1, baroGain: 1, ihr: 95.3 };
const mk = (o = {}) => createSim({ seed: 1, profile: { fixed, ...(o.profile || {}) } });
const avg = (s, secs = 10) => { const a = { hr: 0, map: 0 }, n = secs * 10; for (let i = 0; i < n; i++) { s.step(1); a.hr += s.state.cv.hr / n; a.map += s.state.cv.map / n; } return a; };

// Hahn's check, kinetics alone at a held MAP of 70: 1 L over 30 min leaves about 80% in the circulation (MODEL.md: 83%)
// and Hb 150 -> about 129 g/L
{
  const p = { bloodVol0: 4.9, hb0: 150 };
  let fl = fluidActions(initFluids(p), [{ type: 'fluid', product: 'crystalloid', ml: 1000 }]);
  fl.running[0] = { ...fl.running[0] };
  let bv = 4900;
  // 1000 mL over 30 min: 33.3 mL/min instead of the bag's 50
  fl = { ...fl, running: [] };
  for (let i = 0; i < 18000; i++) {
    fl = { ...fl, cx: fl.cx + (1000 / 30) * (0.1 / 60) }; bv += (1000 / 30) * (0.1 / 60);
    const r = stepFluids(fl, bv, 3000, 70, 0.1); fl = r.fl; bv += r.dV;
  }
  near((bv - 4900) / 1000, 0.80, 0.05, 'crystalloid retained after 30 min at MAP 70');
  near(hbOf({ ...fl, hbMass: 150 * 4.9 }, bv), 129, 4, 'Hb after 1 L');
}

// in the sim: crystalloid, colloid and red cells; volume accounted for exactly
{
  const s = mk(), c0 = s.state.cv;
  s.act({ type: 'fluid', product: 'crystalloid', ml: 500 });
  s.act({ type: 'fluid', product: 'colloid', ml: 500 });
  s.act({ type: 'fluid', product: 'rbc', ml: 280 });
  s.step(12000);
  const c = s.state.cv, fl = c.fl;
  const given = (fl.given.crystalloid || 0) + (fl.given.colloid || 0) + (fl.given.rbc || 0);
  near(given, 1280, 1e-6, 'all given');
  near(c.bloodVol + fl.isf + fl.urine + fl.bled - given, c0.bloodVol, 1e-6, 'volume balance');
  assert.ok(fl.colloid > 450, `colloid stays: ${fl.colloid}`);
  assert.ok(fl.cx < 450, `crystalloid leaves: ${fl.cx}`);
  near(fl.hbMass, 150 * 4.9 + 56, 1e-6, 'a unit of red cells adds 56 g');
}

// haemorrhage at 1% of blood volume a minute, awake: MAP held to about 20% loss while HR rises; decompensation near
// 30% (relative bradycardia and a steep fall); a volume load at 32% restores MAP (MODEL.md targets, prototype values)
{
  const s = mk(), b = avg(s, 30), bv0 = s.state.cv.bloodVol;
  s.act({ type: 'bleed', mlPerMin: bv0 / 100 });
  const at = pct => { while (((bv0 - s.state.cv.bloodVol) / bv0) * 100 < pct - 0.5) s.step(10); const a = avg(s, 5); return { map: a.map / b.map - 1, hr: a.hr - b.hr }; };
  const r10 = at(10), r20 = at(20), r30 = at(30), r38 = at(38);
  assert.ok(r10.map > -0.07 && r10.hr >= 0 && r10.hr <= 10, `10%: ${JSON.stringify(r10)}`);
  assert.ok(r20.map > -0.12 && r20.map < -0.04 && r20.hr >= 10 && r20.hr <= 25, `20%: ${JSON.stringify(r20)}`);
  assert.ok(r30.map < -0.14 && r30.map > -0.25 && r30.hr > 25, `30%: HR up, MAP down ${JSON.stringify(r30)}`);
  // decompensation: by a severe loss the heart rate has fallen back below its 30% value and the pressure collapses
  assert.ok(r38.hr < r30.hr - 8 && r38.map < r30.map - 0.1, `38%: decompensation ${JSON.stringify(r38)}`);
  // stop, give 1 L colloid: MAP comes back
  s.act({ type: 'bleed', mlPerMin: 0 });
  s.act({ type: 'fluid', product: 'colloid', ml: 1000 });
  s.step(15000);
  assert.ok(avg(s).map / b.map - 1 > -0.12, 'a volume load restores MAP');
  assert.ok(s.state.cv.hb > 90 && s.state.cv.hb < 130, `Hb diluted after loss and colloid: ${s.state.cv.hb}`);
}

// under GA (MAC fraction 1.6 set by hand until volatile.js, M2.5): hypotension from 10-15% loss with a small HR rise
{
  const s = mk({ profile: { macStub: 1.6 } });
  s.step(3000);
  const b = avg(s, 30), bv0 = s.state.cv.bloodVol;
  s.act({ type: 'bleed', mlPerMin: bv0 / 100 });
  const at = pct => { while (((bv0 - s.state.cv.bloodVol) / bv0) * 100 < pct - 0.5) s.step(10); const a = avg(s, 5); return { map: a.map / b.map - 1, hr: a.hr - b.hr }; };
  const r10 = at(10), r15 = at(15), r20 = at(20);
  near(r10.map, -0.09, 0.04, 'GA 10%'); near(r15.map, -0.15, 0.04, 'GA 15%'); near(r20.map, -0.22, 0.04, 'GA 20%');
  assert.ok(r20.hr >= 0 && r20.hr <= 9, `GA HR rise small: ${r20.hr}`);
}

// a single large loss is capped at what the veins hold; nothing goes negative
{
  const s = mk();
  s.act({ type: 'bleed', ml: 10000 });
  s.step(600);
  const c = s.state.cv;
  assert.ok(c.Vv > 0 && c.Va > 0 && c.Vp > 0 && c.map >= 0 && Number.isFinite(c.hr), 'no negative volumes or NaN');
}

console.log('ot-sim fluids: ok');
