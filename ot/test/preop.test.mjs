// Pre-op screen data (ui/preop.js): the case narrative is complete, the sign-in checklist is the paraphrased WHO list,
// and the patient summary reads the model patient. Pure data, no browser.

import assert from 'node:assert/strict';
import { CASES, SIGN_IN, patientSummary, clinicalSummary } from '../js/ui/preop.js';

// the guided case carries every clinical field the pre-op screen shows
const c = CASES.electiveGA;
assert.ok(c, 'electiveGA case exists');
for (const k of ['title', 'operation', 'asa', 'airway', 'history', 'meds', 'allergies', 'fasting', 'plan'])
  assert.ok(typeof c[k] === 'string' && c[k].length, `electiveGA.${k} is a non-empty string`);

// clinicalSummary turns it into labelled rows in reading order
const clin = clinicalSummary(c);
assert.equal(clin.length, 8, 'eight clinical rows');
assert.deepEqual(clin.map(r => r[0]), ['Operation', 'ASA grade', 'Airway', 'History', 'Medications', 'Allergies', 'Fasting', 'Plan']);
for (const [, v] of clin) assert.ok(v && v.length, 'every clinical value filled');

// the sign-in checklist paraphrases the WHO sign-in (the items done before induction)
assert.ok(SIGN_IN.length >= 5, 'sign-in has the core items');
assert.ok(SIGN_IN.every(t => typeof t === 'string' && t.length), 'every sign-in item is text');
assert.ok(SIGN_IN.some(t => /oximeter/i.test(t)), 'pulse oximeter is on the list');
assert.ok(SIGN_IN.some(t => /allerg/i.test(t)), 'allergy check is on the list');

// patientSummary reads the model patient's demographics
const sum = patientSummary({ age: 40, sex: 'M', weightKg: 70, heightCm: 170, bmi: 24.22 });
assert.deepEqual(sum.map(r => r[0]), ['Age', 'Sex', 'Weight', 'Height', 'BMI']);
assert.deepEqual(sum[0], ['Age', '40 years']);
assert.deepEqual(sum[1], ['Sex', 'Male']);
assert.equal(sum[4][1], '24.2 kg/m²', 'BMI to one decimal');
assert.equal(patientSummary({ age: 30, sex: 'F', weightKg: 60, heightCm: 160, bmi: 23.4 })[1][1], 'Female');

console.log('ot-sim preop: ok');
