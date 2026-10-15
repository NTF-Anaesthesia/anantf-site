// Unit tests for the calculations (calc.js). Run: node mo/test/calc.test.mjs
import assert from 'node:assert/strict';
import * as C from '../js/calc.js';

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; } };
const near = (a, b, tol = 0.05, msg = '') => assert.ok(Math.abs(a - b) <= tol, `${msg} ${a} is not ${b} ± ${tol}`);

t('nice rounding', () => {
  assert.equal(C.nice(140), 140); assert.equal(C.nice(14.04), 14); assert.equal(C.nice(1.26), 1.3); assert.equal(C.nice(0.456), 0.46); assert.equal(C.nice(0.0456), 0.046);
  assert.equal(C.nice(NaN), null); assert.equal(C.fmt(null), '–');
});
t('body weights: man 80 kg 175 cm', () => {
  const w = C.bodyWeights({ weight: 80, height: 175, sex: 'm' });
  near(w.bmi, 26.12, 0.01); near(w.ibw, 70.57, 0.01); near(w.lbw, 9270 * 80 / (6680 + 216 * 26.122), 0.01); near(w.abw, 70.57 + 0.4 * (80 - 70.57), 0.01);
});
t('body weights: woman 120 kg 160 cm', () => {
  const w = C.bodyWeights({ weight: 120, height: 160, sex: 'f' });
  near(w.bmi, 46.875, 0.001); near(w.ibw, 45.5 + 0.91 * 7.6, 0.01); near(w.lbw, 9270 * 120 / (8780 + 244 * 46.875), 0.01); near(w.abw, 52.416 + 0.4 * (120 - 52.416), 0.01);
});
t('body weights: ideal never above real weight; no height gives total only', () => {
  const w = C.bodyWeights({ weight: 50, height: 185, sex: 'm' }); assert.equal(w.ibw, 50); assert.equal(w.abw, 50);
  const x = C.bodyWeights({ weight: 70 }); assert.equal(x.tbw, 70); assert.equal(x.ibw, null); assert.equal(x.bmi, null);
  assert.equal(C.bodyWeights({ weight: -1 }).tbw, null); assert.equal(C.bodyWeights({ weight: 'abc' }).tbw, null);
  assert.ok(C.bodyWeights({ weight: 40, height: 140, sex: 'f' }).warnings.length);
});
t('dosing weight falls back to total weight with a flag', () => {
  const w = C.bodyWeights({ weight: 100 });
  assert.deepEqual(C.dosingWeight('LBW', w), { kg: 100, basis: 'TBW', fallback: true });
  assert.deepEqual(C.dosingWeight('TBW', w), { kg: 100, basis: 'TBW', fallback: false });
});
t('doseFor: propofol 1–2 mg/kg at 70 kg', () => {
  const r = C.doseFor({ per: [1, 2], unit: 'mg/kg', weight: 'TBW' }, C.bodyWeights({ weight: 70 }));
  assert.equal(r.min, 70); assert.equal(r.max, 140); assert.equal(r.unit, 'mg'); assert.equal(r.capped, false);
});
t('doseFor: cap applies', () => {
  const r = C.doseFor({ per: [0.05], unit: 'mg/kg', max: { value: 2.5, unit: 'mg' } }, C.bodyWeights({ weight: 90 }));
  assert.equal(r.min, 2.5); assert.equal(r.max, 2.5); assert.equal(r.capped, true);
});
t('doseFor: rocuronium on lean weight uses LBW', () => {
  const w = C.bodyWeights({ weight: 120, height: 170, sex: 'm' });
  const r = C.doseFor({ per: [1], unit: 'mg/kg', weight: 'LBW' }, w);
  near(r.min, w.lbw, 1e-9); assert.equal(r.basis, 'LBW');
});
t('doseFor: not per kg or no weight gives null', () => {
  assert.equal(C.doseFor({ text: '4 mg' }, C.bodyWeights({ weight: 70 })), null);
  assert.equal(C.doseFor({ per: [1], unit: 'mg/kg' }, C.bodyWeights({})), null);
  assert.equal(C.doseFor({ per: [0.1], unit: 'mcg/kg/min', infusion: true }, C.bodyWeights({ weight: 70 })), null);
});
t('volumeFor: unit conversion', () => {
  assert.equal(C.volumeFor(140, 'mg', { value: 10, unit: 'mg/mL' }), 14);
  assert.equal(C.volumeFor(100, 'mcg', { value: 50, unit: 'mcg/mL' }), 2);
  assert.equal(C.volumeFor(500, 'mcg', { value: 1, unit: 'mg/mL' }), 0.5);
  assert.equal(C.volumeFor(5, 'mg', { value: 100, unit: 'mcg/mL' }), 50);
  assert.equal(C.volumeFor(2, 'U', { value: 1, unit: 'U/mL' }), 2);
  assert.equal(C.volumeFor(2, 'U', { value: 1, unit: 'mg/mL' }), null);
  assert.equal(C.volumeFor(2, 'mg', null), null);
});
t('infusion: noradrenaline 4 mg/50 mL, 0.1 mcg/kg/min, 70 kg = 5.25 mL/h', () => {
  const conc = { value: 0.08, unit: 'mg/mL' };
  near(C.infusionRate({ dose: 0.1, unit: 'mcg/kg/min', weight: 70, conc }), 5.25, 1e-9);
  near(C.infusionDose({ rate: 5.25, unit: 'mcg/kg/min', weight: 70, conc }), 0.1, 1e-9);
});
t('infusion: vasopressin 1 U/mL, 2.4 U/h = 2.4 mL/h; dexmedetomidine 4 mcg/mL 0.5 mcg/kg/h 80 kg = 10 mL/h', () => {
  assert.equal(C.infusionRate({ dose: 2.4, unit: 'U/h', conc: { value: 1, unit: 'U/mL' } }), 2.4);
  assert.equal(C.infusionRate({ dose: 0.5, unit: 'mcg/kg/h', weight: 80, conc: { value: 4, unit: 'mcg/mL' } }), 10);
  assert.equal(C.infusionRate({ dose: 0.1, unit: 'mcg/kg/min', weight: null, conc: { value: 0.08, unit: 'mg/mL' } }), null);
  assert.equal(C.infusionRate({ dose: 1, unit: 'furlongs', weight: 70, conc: { value: 1, unit: 'mg/mL' } }), null);
});
t('4-2-1 rule', () => {
  assert.equal(C.maintenance421(5), 20); assert.equal(C.maintenance421(10), 40); assert.equal(C.maintenance421(15), 50);
  assert.equal(C.maintenance421(20), 60); assert.equal(C.maintenance421(70), 110); assert.equal(C.maintenance421(0), null);
  assert.equal(C.fastingDeficit(70, 8), 880); assert.equal(C.fastingDeficit(70, -1), null);
});
t('allowable blood loss', () => {
  const r = C.abl({ weight: 70, group: 'man', hctStart: 40, hctTarget: 30 });
  assert.equal(r.ebv, 4900); near(r.abl, 1225, 1e-9);
  assert.equal(C.abl({ weight: 70, group: 'man', hctStart: 30, hctTarget: 35 }).abl, 0);
  assert.equal(C.abl({ weight: 70, group: 'dragon', hctStart: 40, hctTarget: 30 }), null);
  assert.equal(C.BLOOD_VOLUME.neonate.mlkg, 90); assert.equal(C.BLOOD_VOLUME.infant.mlkg, 80);
});
t('local anaesthetic maximum', () => {
  const lean = C.bodyWeights({ weight: 60 });
  const r = C.laMax({ drug: 'bupivacaine', w: lean, percent: 0.5 });
  assert.equal(r.mg, 120); assert.equal(r.ml, 24); assert.equal(r.basis, 'TBW');
  const big = C.laMax({ drug: 'bupivacaine', w: C.bodyWeights({ weight: 100 }), percent: 0.5 });
  assert.equal(big.mg, 150); assert.equal(big.capped, true); assert.equal(big.ml, 30);
  const lig = C.laMax({ drug: 'lignocaine', w: C.bodyWeights({ weight: 50 }), percent: 1 }); assert.equal(lig.mg, 150); assert.equal(lig.ml, 15);
  const adr = C.laMax({ drug: 'lignocaine-adr', w: C.bodyWeights({ weight: 60 }), percent: 2 }); assert.equal(adr.mg, 420); assert.equal(adr.ml, 21);
  const obese = C.bodyWeights({ weight: 130, height: 165, sex: 'f' });
  const ro = C.laMax({ drug: 'ropivacaine', w: obese, percent: 0.375 }); assert.equal(ro.basis, 'LBW'); near(ro.kg, obese.lbw, 1e-9);
  assert.equal(C.laMax({ drug: 'cocaine', w: lean }), null);
});
t('strength conversions', () => {
  assert.equal(C.percentToMgMl(1), 10); assert.equal(C.percentToMgMl(0.5), 5);
  assert.equal(C.ratioToMgMl(1000), 1); assert.equal(C.ratioToMgMl(10000), 0.1); near(C.ratioToMgMl(200000) * 1000, 5, 1e-9);
});
t('STOP-BANG', () => {
  assert.deepEqual(C.stopBang({}), { score: 0, band: 'low' });
  assert.deepEqual(C.stopBang({ snore: true, age: true, male: true }), { score: 3, band: 'intermediate' });
  assert.deepEqual(C.stopBang({ snore: true, tired: true, male: true }), { score: 3, band: 'high' });
  assert.equal(C.stopBang({ snore: 1, tired: 1, observed: 1, pressure: 1, bmi: 1 }).band, 'high');
});
t('Apfel', () => {
  assert.deepEqual(C.apfel({}), { score: 0, risk: 10 });
  assert.deepEqual(C.apfel({ female: true, nonSmoker: true }), { score: 2, risk: 39 });
  assert.deepEqual(C.apfel({ female: 1, nonSmoker: 1, history: 1, opioids: 1 }), { score: 4, risk: 79 });
});
t('RCRI', () => {
  assert.deepEqual(C.rcri({}), { score: 0, risk: 3.9 });
  assert.deepEqual(C.rcri({ ihd: true }), { score: 1, risk: 6.0 });
  assert.deepEqual(C.rcri({ ihd: 1, hf: 1, cvd: 1, insulin: 1 }), { score: 4, risk: 15.0 });
});
t('Aldrete', () => {
  assert.deepEqual(C.aldrete({ activity: 2, breathing: 2, circulation: 2, consciousness: 2, spo2: 2 }), { score: 10, ready: true, complete: true });
  assert.equal(C.aldrete({ activity: 2, breathing: 2, circulation: 2, consciousness: 1, spo2: 2 }).ready, true);
  assert.equal(C.aldrete({ activity: 2, breathing: 2, circulation: 2, consciousness: 2, spo2: 0 }).ready, false);
  assert.equal(C.aldrete({ activity: 2 }).complete, false);
});
t('children', () => {
  assert.equal(C.paedsWeight({ months: 6 }), 7); assert.equal(C.paedsWeight({ years: 3 }), 14); assert.equal(C.paedsWeight({ years: 8 }), 31);
  assert.equal(C.paedsWeight({ years: 20 }), null);
  assert.deepEqual(C.paedsTube(4), { cuffed: 4.5, uncuffed: 5, oral: 14, nasal: 17 });
  assert.equal(C.paedsTube(1), null);
  assert.equal(C.lmaSize(3), '1'); assert.equal(C.lmaSize(7), '1.5'); assert.equal(C.lmaSize(15), '2'); assert.equal(C.lmaSize(25), '2.5'); assert.equal(C.lmaSize(40), '3'); assert.equal(C.lmaSize(60), '4'); assert.equal(C.lmaSize(80), '5');
});
console.log(process.exitCode ? '' : `ok   calc (${n} tests)`);
