#!/usr/bin/env node
// Regional anaesthesia app: unit tests for the local anaesthetic dose maths (shared/regional/js/la.js). No browser.
//   node shared/regional/test/la.test.mjs
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const LA = await import(pathToFileURL(path.resolve(HERE, '../js/la.js')).href);
const {
  AGENTS, AGENT_IDS, NOTES, FORMULAS, agentId, maxMgPerKg, capMg, maxMg, cappedByCeiling, mgFromMl, mlForMg, bmi,
  leanBodyWeight, idealBodyWeight, doseWeight, combinedFraction, fractionStatus, parseDose, doseQuery, parseQuery,
} = LA;

let pass = 0; let fail = 0;
const quiet = process.argv.includes('--quiet');
function test(name, fn) {
  try { fn(); pass += 1; if (!quiet) console.log(`ok   ${name}`); } catch (err) { fail += 1; console.log(`FAIL ${name}: ${err.message.split('\n')[0]}`); }
}
const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

// ------------------------------------------------------------------ data
test('agents and their mg/kg maxima (plain, with adrenaline)', () => {
  assert.deepEqual(AGENT_IDS, ['lidocaine', 'bupivacaine', 'levobupivacaine', 'ropivacaine', 'prilocaine', 'chloroprocaine']);
  const want = { lidocaine: [3, 7], bupivacaine: [2, 2], levobupivacaine: [2, 2], ropivacaine: [3, 3], prilocaine: [6, 8], chloroprocaine: [11, 11] };
  for (const [a, [p, x]] of Object.entries(want)) {
    assert.equal(maxMgPerKg(a, false), p, `${a} plain`);
    assert.equal(maxMgPerKg(a, true), x, `${a} with adrenaline`);
  }
});
test('every agent has a positive ceiling, never lower with adrenaline', () => {
  for (const a of AGENT_IDS) {
    assert.ok(capMg(a, false) > 0 && capMg(a, true) >= capMg(a, false), a);
    assert.ok(AGENTS[a].mgPerKg[1] >= AGENTS[a].mgPerKg[0], a);
    assert.ok(AGENTS[a].strengths.every((s) => s > 0 && s <= 10), a);
  }
  assert.ok(Object.isFrozen(AGENTS) && Object.isFrozen(AGENTS.lidocaine));
});
test('notes cover additivity, lean weight, reductions and infants', () => {
  const t = NOTES.join(' ').toLowerCase();
  for (const w of ['additive', 'lean', 'elderly', 'frail', 'pregnancy', 'liver', 'kidney', 'heart', 'infants']) assert.ok(t.includes(w), w);
  assert.ok(/janmahasatian/i.test(FORMULAS.lbw) && /9270/.test(FORMULAS.lbw));
  assert.ok(!/FRCA/.test(JSON.stringify({ NOTES, FORMULAS })));
});
test('agentId: names, case and aliases', () => {
  assert.equal(agentId('Ropivacaine'), 'ropivacaine');
  assert.equal(agentId(' lignocaine '), 'lidocaine');
  assert.equal(agentId('levobupivacaine'), 'levobupivacaine');
  assert.equal(agentId('cocaine'), null);
  assert.equal(agentId(''), null);
  assert.equal(agentId(undefined), null);
  assert.equal(maxMgPerKg('nonsense'), null);
});

// ------------------------------------------------------------------ maxima
test('maxMg: weight × mg/kg below the ceiling', () => {
  assert.equal(maxMg('ropivacaine', 50, false), 150);
  assert.equal(maxMg('bupivacaine', 60, false), 120);
  assert.equal(maxMg('lidocaine', 50, false), 150);
  assert.equal(maxMg('lidocaine', 50, true), 350);
  assert.equal(maxMg('prilocaine', 50, false), 300);
  assert.equal(maxMg('prilocaine', 50, true), 400);
  assert.equal(maxMg('chloroprocaine', 50, false), 550);
  assert.equal(maxMg('levobupivacaine', 20, true), 40);
});
test('maxMg: the ceiling wins at high weight', () => {
  assert.equal(maxMg('ropivacaine', 100, false), 225);
  assert.equal(maxMg('bupivacaine', 100, true), 150);
  assert.equal(maxMg('lidocaine', 100, false), 200);
  assert.equal(maxMg('lidocaine', 100, true), 500);
  assert.equal(maxMg('chloroprocaine', 100, true), 800);
  assert.equal(cappedByCeiling('ropivacaine', 100), true);
  assert.equal(cappedByCeiling('ropivacaine', 70), false);
  assert.equal(maxMg('ropivacaine', 75), 225); // 3 × 75 = 225, exactly the ceiling
});
test('maxMg: adrenaline only raises lidocaine and prilocaine', () => {
  for (const a of ['bupivacaine', 'levobupivacaine', 'ropivacaine', 'chloroprocaine']) assert.equal(maxMg(a, 40, true), maxMg(a, 40, false), a);
  assert.ok(maxMg('lidocaine', 40, true) > maxMg('lidocaine', 40, false));
  assert.ok(maxMg('prilocaine', 40, true) > maxMg('prilocaine', 40, false));
});
test('maxMg: bad input gives null', () => {
  assert.equal(maxMg('ropivacaine', 0), null);
  assert.equal(maxMg('ropivacaine', -5), null);
  assert.equal(maxMg('ropivacaine', 'abc'), null);
  assert.equal(maxMg('ropivacaine', null), null);
  assert.equal(maxMg('xylo', 70), null);
  assert.equal(maxMg('ropivacaine', '70'), 210);
});

// ------------------------------------------------------------------ mg and ml
test('mgFromMl: percent × 10 = mg/ml', () => {
  assert.equal(mgFromMl(20, 0.375), 75);
  assert.equal(mgFromMl(30, 0.3), 90);
  assert.equal(mgFromMl(10, 1), 100);
  assert.equal(mgFromMl(5, 4), 200);
  assert.equal(mgFromMl(20, 0.2), 40);
  assert.equal(mgFromMl(0, 0.5), 0);
  assert.equal(mgFromMl(15, 0.25), 37.5);
});
test('mgFromMl: no floating-point tails', () => {
  assert.equal(mgFromMl(3, 0.1), 3);
  assert.equal(mgFromMl(7, 0.3), 21);
});
test('mgFromMl / mlForMg: bad input gives null', () => {
  assert.equal(mgFromMl(-1, 0.5), null);
  assert.equal(mgFromMl(10, 0), null);
  assert.equal(mgFromMl(10, null), null);
  assert.equal(mgFromMl('x', 0.5), null);
  assert.equal(mlForMg(100, 0), null);
  assert.equal(mlForMg(-1, 0.5), null);
});
test('mlForMg is the inverse of mgFromMl', () => {
  assert.equal(mlForMg(225, 0.375), 60);
  assert.equal(mlForMg(150, 0.25), 60);
  assert.equal(mlForMg(75, 0.375), 20);
  for (const [ml, p] of [[20, 0.375], [17, 0.5], [12.5, 0.2], [3, 2]]) near(mlForMg(mgFromMl(ml, p), p), ml, 0.01);
});

// ------------------------------------------------------------------ weights
test('bmi', () => {
  near(bmi(70, 175), 22.9);
  near(bmi(120, 170), 41.5);
  assert.equal(bmi(70, null), null);
});
test('lean body weight (Janmahasatian)', () => {
  // 120 kg, 170 cm: BMI 41.52. Male 9270×120 ÷ (6680 + 216×41.52) = 71.1; female 9270×120 ÷ (8780 + 244×41.52) = 58.8.
  near(leanBodyWeight(120, 170, 'male'), 71.1, 0.1);
  near(leanBodyWeight(120, 170, 'female'), 58.8, 0.1);
  near(leanBodyWeight(70, 175, 'm'), 55.9, 0.1);
  assert.ok(leanBodyWeight(70, 175, 'female') < leanBodyWeight(70, 175, 'male'));
  assert.equal(leanBodyWeight(120, 170, null), null);
  assert.equal(leanBodyWeight(120, null, 'male'), null);
  assert.ok(leanBodyWeight(40, 150, 'male') <= 40);
});
test('ideal body weight (Devine)', () => {
  near(idealBodyWeight(175, 'male'), 70.6, 0.1);
  near(idealBodyWeight(165, 'female'), 57, 0.1);
  assert.equal(idealBodyWeight(175, null), null);
  assert.equal(idealBodyWeight(50, 'female'), null);
});
test('doseWeight: actual weight unless BMI ≥ 30, then lean body weight', () => {
  const a = doseWeight({ kg: 70, cm: 175, sex: 'male' });
  assert.equal(a.basis, 'actual'); assert.equal(a.kg, 70); assert.equal(a.obese, false);
  const b = doseWeight({ kg: 120, cm: 170, sex: 'female' });
  assert.equal(b.basis, 'lean'); near(b.kg, 58.8, 0.1); assert.equal(b.obese, true);
  const c = doseWeight({ kg: 70 });
  assert.equal(c.basis, 'actual'); assert.equal(c.needsHeight, false);
  const d = doseWeight({ kg: 130 });
  assert.equal(d.basis, 'actual'); assert.equal(d.needsHeight, true);
  const e = doseWeight({ kg: 120, cm: 170 }); // obese but no sex: no lean weight, so prompt for it
  assert.equal(e.basis, 'actual'); assert.equal(e.obese, true); assert.equal(e.needsHeight, true);
  assert.equal(doseWeight({}).kg, null);
  assert.equal(doseWeight({ kg: 'x' }).kg, null);
});
test('obese patient: the maximum comes from lean weight', () => {
  const w = doseWeight({ kg: 120, cm: 170, sex: 'female' });
  near(maxMg('ropivacaine', w.kg), 176.4, 0.3); // 3 × 58.8, not the 225 mg actual-weight answer
  near(maxMg('bupivacaine', w.kg), 117.6, 0.2);
});

// ------------------------------------------------------------------ combined
test('combinedFraction: one agent', () => {
  const r = combinedFraction([{ agent: 'ropivacaine', percent: 0.375, ml: 20 }], 70);
  assert.equal(r.rows[0].mg, 75); assert.equal(r.rows[0].max, 210);
  near(r.total, 75 / 210, 0.0001); assert.equal(r.over, false); assert.equal(r.valid, 1);
});
test('combinedFraction: agents are additive', () => {
  // 70 kg: lidocaine 1% 10 ml = 100 mg of 200 mg (0.5); bupivacaine 0.5% 15 ml = 75 mg of 140 mg (0.536). Sum 1.036: over.
  const r = combinedFraction([{ agent: 'lidocaine', percent: 1, ml: 10 }, { agent: 'bupivacaine', percent: 0.5, ml: 15 }], 70);
  assert.equal(r.rows[0].max, 200); assert.equal(r.rows[1].max, 140);
  near(r.total, 0.5 + 75 / 140, 0.0001);
  assert.equal(r.over, true);
  assert.equal(fractionStatus(r.total, r.valid), 'over');
});
test('combinedFraction: bilateral block, same agent, adds up', () => {
  // 60 kg: 2 × 20 ml 0.375% ropivacaine = 150 mg of 180 mg.
  const r = combinedFraction([{ agent: 'ropivacaine', percent: 0.375, ml: 20 }, { agent: 'ropivacaine', percent: 0.375, ml: 20 }], 60);
  near(r.total, 150 / 180, 0.0001); assert.equal(r.over, false); assert.equal(fractionStatus(r.total, r.valid), 'near');
});
test('combinedFraction: exactly at the maximum is not over; a hair above is', () => {
  const at = combinedFraction([{ agent: 'ropivacaine', percent: 0.5, ml: 42 }], 70); // 210 mg of 210
  assert.equal(at.total, 1); assert.equal(at.over, false);
  const above = combinedFraction([{ agent: 'ropivacaine', percent: 0.5, ml: 42.2 }], 70);
  assert.equal(above.over, true);
});
test('combinedFraction: adrenaline per row, mg rows, and incomplete rows', () => {
  const r = combinedFraction([
    { agent: 'lidocaine', percent: 1, ml: 20, adrenaline: true }, // 200 of 490 (7 × 70)
    { agent: 'lidocaine', mg: 70 }, // 70 of 200 (plain, capped)
    { agent: '', percent: 1, ml: 5 },
    { agent: 'ropivacaine', percent: null, ml: 10 },
  ], 70);
  assert.equal(r.rows[0].max, 490);
  assert.equal(r.rows[1].max, 200);
  assert.equal(r.rows[2].error, 'agent');
  assert.equal(r.rows[3].error, 'amount');
  assert.equal(r.valid, 2);
  near(r.total, 200 / 490 + 70 / 200, 0.0001);
});
test('combinedFraction: no weight means no maximum', () => {
  const r = combinedFraction([{ agent: 'ropivacaine', percent: 0.2, ml: 20 }], null);
  assert.equal(r.rows[0].error, 'weight'); assert.equal(r.valid, 0); assert.equal(r.total, 0);
  assert.equal(fractionStatus(r.total, r.valid), 'none');
});
test('fractionStatus thresholds', () => {
  assert.equal(fractionStatus(0.5), 'ok');
  assert.equal(fractionStatus(0.8), 'near');
  assert.equal(fractionStatus(1), 'near');
  assert.equal(fractionStatus(1.0001), 'over');
});

// ------------------------------------------------------------------ links from block pages
test('parseDose: plain fields', () => {
  assert.deepEqual(parseDose({ volume: '30 ml', conc: 'dilute 0.3%', drug: 'ropivacaine' }), { agent: 'ropivacaine', pct: 0.3, ml: 30 });
  assert.deepEqual(parseDose({ volume: '20 ml', conc: '0.3–0.5%', drug: 'ropivacaine' }), { agent: 'ropivacaine', ml: 20 });
  assert.deepEqual(parseDose({ volume: '20–30 ml', conc: 'dilute 0.3%', drug: 'ropivacaine', per: 'per side' }), { agent: 'ropivacaine', pct: 0.3 });
  assert.deepEqual(parseDose({ volume: '5 ml', conc: '4%', drug: 'lidocaine', per: '(200 mg)' }), { agent: 'lidocaine', pct: 4, ml: 5 });
  assert.deepEqual(parseDose({ volume: '1–2 ml', conc: '', drug: 'local anaesthetic', per: 'per nerve' }), {});
});
test('parseDose: html dose lines', () => {
  assert.deepEqual(parseDose({ html: '<span class="tb-dose-v">15 ml</span> of <span class="tb-dose-v">0.4%</span> ropivacaine (60 mg)' }), { agent: 'ropivacaine', pct: 0.4, ml: 15 });
  assert.deepEqual(parseDose({ html: '<span class="tb-dose-v">0.3–0.4 ml/kg</span> of <span class="tb-dose-v">0.25%</span> levobupivacaine, at least <span class="tb-dose-v">20 ml</span>' }), { agent: 'levobupivacaine', pct: 0.25 });
  // Two agents, two strengths: nothing can be read safely.
  assert.deepEqual(parseDose({ html: '10–20 ml per side of 0.25% bupivacaine or ropivacaine. Deep block: 20 ml of 0.3% ropivacaine per side.' }), {});
  assert.deepEqual(parseDose({ html: '<span class="tb-dose-v">2–5 ml</span> per site', note: 'With adrenaline 1:200 000.' }), {});
});
test('parseDose: bupivacaine is not found inside levobupivacaine; adrenaline is read', () => {
  assert.equal(parseDose({ drug: 'levobupivacaine', conc: '0.25%', volume: '20 ml' }).agent, 'levobupivacaine');
  assert.equal(parseDose({ drug: 'lidocaine with adrenaline', conc: '1%', volume: '10 ml' }).adr, true);
  assert.equal(parseDose({ drug: 'lidocaine', conc: '1%', volume: '10 ml', note: 'Without adrenaline.' }).adr, undefined);
  assert.deepEqual(parseDose(null), {});
  assert.deepEqual(parseDose('20 ml'), {});
});
test('doseQuery builds a query string', () => {
  assert.equal(doseQuery({ volume: '20 ml', conc: '0.375%', drug: 'ropivacaine' }), 'agent=ropivacaine&pct=0.375&ml=20');
  assert.equal(doseQuery({ volume: '1–2 ml', drug: 'local anaesthetic' }), '');
  assert.equal(doseQuery({ drug: 'lidocaine with adrenaline', conc: '2%', volume: '10 ml' }), 'agent=lidocaine&pct=2&ml=10&adr=1');
});
test('parseQuery accepts only known agents and numbers in range', () => {
  assert.deepEqual(parseQuery('?agent=ropivacaine&pct=0.375&ml=20'), { agent: 'ropivacaine', pct: 0.375, ml: 20 });
  assert.deepEqual(parseQuery('?agent=Lignocaine&pct=1&ml=10&adr=1&kg=70'), { agent: 'lidocaine', pct: 1, ml: 10, kg: 70, adr: true });
  assert.deepEqual(parseQuery('?agent=<script>alert(1)</script>&pct=1e3&ml=-4&kg=9999'), {});
  assert.deepEqual(parseQuery('?pct=0.375);alert(1)//&ml=20abc'), {});
  assert.deepEqual(parseQuery('?pct=50&ml=1000'), {});
  assert.deepEqual(parseQuery(''), {});
  assert.deepEqual(parseQuery(null), {});
  // Round trip from a block's dose box.
  assert.deepEqual(parseQuery(`?${doseQuery({ html: '<span>17 ml</span> of <span>0.5%</span> ropivacaine (85 mg)' })}`), { agent: 'ropivacaine', pct: 0.5, ml: 17 });
});
test('la.js is pure: no DOM, no eval', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(path.resolve(HERE, '../js/la.js'), 'utf8');
  assert.ok(!/\b(document|window|eval|Function)\s*[.(]/.test(src.replace(/\/\/.*$/gm, '')), 'la.js touches the DOM or evaluates code');
});

console.log(`${pass}/${pass + fail} la.js tests pass${fail ? ` (${fail} failed)` : ''}`);
process.exit(fail ? 1 : 0);
