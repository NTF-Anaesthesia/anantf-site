// Unit tests for js/logic.js. Run: node babymo/test/logic.test.mjs
import assert from 'node:assert/strict';
import * as L from '../js/logic.js';

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; } };
const q = (o = {}) => L.cleanQuestion({ id: 'a', stem: 'Which?', options: ['one', 'two', 'three', 'four'], answer: 1, status: 'active', ...o });

t('cleanQuestion fills every field', () => {
  const c = L.cleanQuestion({});
  assert.deepEqual(c.options, ['', '', '', '']); assert.equal(c.answer, -1); assert.equal(c.status, 'draft');
  assert.equal(L.cleanQuestion({ answer: '2' }).answer, 2); assert.equal(L.cleanQuestion({ answer: 9 }).answer, -1);
  assert.equal(L.cleanQuestion({ status: 'weird' }).status, 'draft');
});
t('a draft needs only a stem; an active question needs all of it', () => {
  assert.deepEqual(L.problems(q({ status: 'draft', stem: 'x', options: ['', '', '', ''], answer: -1 })), []);
  assert.equal(L.problems(q({ status: 'draft', stem: '' })).length, 1);
  const p = L.problems(q({ options: ['one', '', 'three', 'four'], answer: -1 }));
  assert.deepEqual(p.map(x => x.field).sort(), ['answer', 'opt1']);
  assert.ok(L.problems(q({ options: ['same', 'Same', 'x', 'y'] })).some(x => /same/.test(x.text)));
  assert.ok(L.problems(q({ image: 'http://evil/x.png' })).some(x => x.field === 'image'));
});
t('drawTest takes only usable questions, at most count, no repeats', () => {
  const bank = [q({ id: '1' }), q({ id: '2', status: 'draft' }), q({ id: '3', status: 'archived' }), q({ id: '4', answer: -1 }), q({ id: '5' }), q({ id: '6' })];
  const d = L.drawTest(bank, { count: 2 });
  assert.equal(d.length, 2); assert.equal(new Set(d.map(x => x.qid)).size, 2);
  assert.ok(d.every(x => ['1', '5', '6'].includes(x.qid)));
  assert.equal(L.drawTest(bank, { count: 20 }).length, 3);
  assert.ok(d.every(x => x.picked === null));
});
t('every sitting has all must-ask questions and the set number of hard ones', () => {
  const bank = [
    ...Array.from({ length: 3 }, (_, i) => q({ id: 'm' + i, must: true })),
    ...Array.from({ length: 6 }, (_, i) => q({ id: 'h' + i, level: 'hard' })),
    ...Array.from({ length: 30 }, (_, i) => q({ id: 's' + i })),
    q({ id: 'draftmust', must: true, status: 'draft' }), q({ id: 'brokenmust', must: true, answer: -1 }),
  ];
  for (let k = 0; k < 40; k++) {
    const d = L.drawTest(bank, { count: 20, hardCount: 4 });
    const ids = d.map(x => x.qid);
    assert.equal(d.length, 20); assert.equal(new Set(ids).size, 20);
    for (const m of ['m0', 'm1', 'm2']) assert.ok(ids.includes(m), 'must-ask missing');
    assert.ok(!ids.includes('draftmust') && !ids.includes('brokenmust'));
    assert.equal(ids.filter(i => i.startsWith('h')).length, 4);
  }
});
t('draw copes with too many must-ask, too few hard, and a small bank', () => {
  const musts = Array.from({ length: 25 }, (_, i) => q({ id: 'm' + i, must: true }));
  assert.equal(L.drawTest(musts, { count: 20, hardCount: 4 }).length, 20);
  const few = [q({ id: 'a' }), q({ id: 'b', level: 'hard' }), q({ id: 'c' })];
  const d = L.drawTest(few, { count: 20, hardCount: 4 });
  assert.equal(d.length, 3); assert.ok(d.some(x => x.qid === 'b'));
  const mix = [...Array.from({ length: 5 }, (_, i) => q({ id: 'h' + i, level: 'hard' })), q({ id: 's1' })];
  assert.equal(L.drawTest(mix, { count: 6, hardCount: 1 }).length, 6);   // standard ran out: leftover hard fill the sitting
  assert.equal(L.drawTest(mix, { count: 3, hardCount: 0 }).filter(x => x.qid === 's1').length, 1);
});
t('bankSummary and attemptKey', () => {
  const b = [q({ id: '1', must: true }), q({ id: '2', level: 'hard' }), q({ id: '3' })];
  const s = L.bankSummary(b, { count: 20, hardCount: 4 });
  assert.equal(s.ready, 3); assert.equal(s.must, 1); assert.equal(s.hard, 1); assert.equal(s.hardShort, 3); assert.equal(s.short, 17);
  assert.equal(L.attemptKey('Oct 2026 intake', 'Dr  Tan, Wei'), 'oct2026intake__drtanwei');
  assert.equal(L.attemptKey('', 'A'), 'general__a');
  assert.equal(L.attemptKey('X', 'dr tan wei'), L.attemptKey('x', 'DR TAN WEI'));
});
t('CSV keeps must-ask and difficulty', () => {
  const back = L.questionsFromCSV(L.questionsToCSV([q({ id: 'x', must: true, level: 'hard' }), q({ id: 'y' })])).questions;
  assert.equal(back[0].must, true); assert.equal(back[0].level, 'hard'); assert.equal(back[1].must, false); assert.equal(back[1].level, 'standard');
  const old = L.questionsFromCSV('Question,a,b,c,d,Correct\r\nWhat?,1,2,3,4,c\r\n').questions[0];
  assert.equal(old.must, false); assert.equal(old.level, 'standard');
});
t('shuffle keeps the same items and respects the rng', () => {
  const a = [1, 2, 3, 4, 5, 6];
  assert.deepEqual(L.shuffle(a, () => 0.5).sort(), a); assert.deepEqual(a, [1, 2, 3, 4, 5, 6]);
});
t('marking and passing at 80%', () => {
  const items = Array.from({ length: 20 }, (_, i) => ({ qid: i, answer: 0, picked: i < 16 ? 0 : i < 18 ? 1 : null }));
  assert.deepEqual(L.mark(items), { score: 16, total: 20 });
  assert.equal(L.summarise({ items, settings: { passMark: 80 } }).pass, true);
  assert.equal(L.summarise({ items: items.map((x, i) => (i === 0 ? { ...x, picked: 3 } : x)), settings: { passMark: 80 } }).pass, false);
  assert.equal(L.summarise({ items: [], settings: {} }).pass, false);
  assert.equal(L.summarise({ items, settings: { passMark: 80 } }).answered, 18);
});
t('pass mark works for 15 questions (80% = 12)', () => {
  const mk = k => ({ items: Array.from({ length: 15 }, (_, i) => ({ answer: 0, picked: i < k ? 0 : 1 })), settings: { passMark: 80 } });
  assert.equal(L.summarise(mk(12)).pass, true); assert.equal(L.summarise(mk(11)).pass, false);
});
t('timer counts down from the saved start and never goes below 0', () => {
  assert.equal(L.secondsLeft(1000, 20, 1000), 1200); assert.equal(L.secondsLeft(1000, 20, 1000 + 600000), 600);
  assert.equal(L.secondsLeft(1000, 20, 1000 + 99999999), 0); assert.equal(L.clock(75), '1:15'); assert.equal(L.clock(0), '0:00');
});
t('questionStats lists the hardest first', () => {
  const att = (p1, p2) => ({ items: [{ qid: 'a', stem: 'A', answer: 0, picked: p1 }, { qid: 'b', stem: 'B', answer: 1, picked: p2 }] });
  const s = L.questionStats([att(0, 0), att(0, null), att(0, 1)]);
  assert.equal(s[0].qid, 'b'); assert.equal(s[0].pct, 33); assert.equal(s[0].skipped, 1); assert.equal(s[1].pct, 100);
});

// pasting
const WORD = `Q1 The following confirm placement EXCEPT:
(A) Cuff pressure of 60 cm H2O
(B) Ability to pass the nasogastric tube
(C) Leak pressure of less than 25 cm H2O
(D) Unobstructed flow
Answer: A

Q 4 A 78-year old patient with a history of thing. Which is a contraindication?
(A) Facet joint arthropathy(B)Aortic stenosis (C) Posterior shoulder skin infection(D) Clopidogrel stopped for last 8 days
Answer: B
Explanation: Severe aortic stenosis is the big
risk with neuraxial blocks.

3. What are the doses?
A. 1 mg
B. 2.5 mg
   continued line
C. 10 mg
D. 100 mg
`;
t('parsePaste reads Word-style questions', () => {
  const r = L.parsePaste(WORD);
  assert.equal(r.questions.length, 3);
  assert.equal(r.questions[0].answer, 0); assert.equal(r.questions[0].options[2], 'Leak pressure of less than 25 cm H2O');
  assert.deepEqual(r.questions[1].options, ['Facet joint arthropathy', 'Aortic stenosis', 'Posterior shoulder skin infection', 'Clopidogrel stopped for last 8 days']);
  assert.equal(r.questions[1].explain, 'Severe aortic stenosis is the big\nrisk with neuraxial blocks.');
  assert.equal(r.questions[2].options[1], '2.5 mg continued line'); assert.equal(r.questions[2].answer, -1);
  assert.ok(r.warnings.some(w => /Question 3: no answer/.test(w)));
});
t('parsePaste copes with choices that lost their letters', () => {
  const r = L.parsePaste('Q9 What is first?\nAdminister cardioversion\nGive amiodarone\nGive digoxin\nContinue monitoring\n');
  assert.equal(r.questions[0].options[3], 'Continue monitoring'); assert.ok(r.warnings.some(w => /no letters/.test(w)));
});
t('parsePaste: numbers inside choices are not new questions', () => {
  const r = L.parsePaste('Q5 Dose?\nA) 1 mg\nB) 2.5 mg\nC) 10 mg\nD) 100 mg\nAnswer: C\nQ6 Next?\nA) x\nB) y\nC) z\nD) w\nAnswer: D');
  assert.equal(r.questions.length, 2); assert.equal(r.questions[0].options[0], '1 mg'); assert.equal(r.questions[1].answer, 3);
});
t('parsePaste on nonsense warns', () => { const r = L.parsePaste('hello'); assert.equal(r.questions.length, 0); assert.equal(r.warnings.length, 1); });

// csv
t('CSV round trip keeps commas, quotes, newlines and formula-like text', () => {
  const qs = [q({ id: 'x1', stem: 'Say "hi", then\nnew line', options: ['=1+1', '-5 mg', 'a,b', 'd'], explain: 'because, yes', topic: 'Airway' })];
  const csv = L.questionsToCSV(qs);
  assert.ok(csv.startsWith('﻿'));
  const back = L.questionsFromCSV(csv).questions[0];
  assert.equal(back.stem, 'Say "hi", then\nnew line'); assert.deepEqual(back.options, ['=1+1', '-5 mg', 'a,b', 'd']);
  assert.equal(back.id, 'x1'); assert.equal(back.answer, 1); assert.equal(back.status, 'active'); assert.equal(back.topic, 'Airway');
});
t('CSV import: other column names, missing status, incomplete active becomes draft', () => {
  const r = L.questionsFromCSV('Question,a,b,c,d,Correct,status\r\nWhat?,1,2,3,4,c,active\r\nHalf?,1,,3,4,b,active\r\n');
  assert.equal(r.questions[0].answer, 2); assert.equal(r.questions[1].status, 'draft'); assert.equal(r.warnings.length, 1);
  assert.equal(L.questionsFromCSV('foo,bar\n1,2').questions.length, 0);
});
t('attempt CSV guards formulas in names', () => {
  const csv = L.attemptsToCSV([{ name: '=cmd()', items: [{ answer: 0, picked: 0 }], settings: { passMark: 80 }, submittedAt: 0 }]);
  assert.ok(csv.includes("'=cmd()")); assert.ok(csv.includes('Pass'));
});
t('backup JSON round trip and rejects other files', () => {
  const b = L.bankFromJSON(L.bankToJSON([q()], { count: 5 }));
  assert.equal(b.questions.length, 1); assert.equal(b.settings.count, 5);
  assert.throws(() => L.bankFromJSON('{"a":1}')); assert.throws(() => L.bankFromJSON('nope'));
});
t('planImport splits new from existing', () => {
  const p = L.planImport([q({ id: 'a' }), q({ id: '' }), q({ id: 'zz' })], [q({ id: 'a' })]);
  assert.equal(p.update.length, 1); assert.equal(p.add.length, 2);
});
t('similar finds a near duplicate but not a different question', () => {
  const bank = [q({ id: '1', stem: 'Which of the following confirm the adequate placement of the Proseal LMA except' })];
  assert.equal(L.similar(q({ stem: 'Which of the following confirm adequate placement of the Proseal LMA EXCEPT?' }), bank)?.id, '1');
  assert.equal(L.similar(q({ stem: 'What is the maximum dose of ropivacaine for a sixty kilogram patient' }), bank), null);
});
t('topics: several per question, stored as one text, no repeats', () => {
  assert.deepEqual(L.splitTopics('Airway;  Drugs ; airway;;'), ['Airway', 'Drugs']);
  const c = L.cleanQuestion({ stem: 'x', topic: 'Airway; Drugs' });
  assert.deepEqual(c.topics, ['Airway', 'Drugs']); assert.equal(c.topic, 'Airway; Drugs');
  const d = L.cleanQuestion({ stem: 'x', topics: ['Regional', 'regional', 'PACU'] });
  assert.equal(d.topic, 'Regional; PACU'); assert.deepEqual(L.cleanQuestion(d).topics, ['Regional', 'PACU']);
  assert.deepEqual(L.cleanQuestion({ stem: 'x' }).topics, []); assert.equal(L.cleanQuestion({ stem: 'x' }).topic, '');
  assert.ok(L.joinTopics(Array.from({ length: 50 }, (_, i) => 'Topic number ' + i)).length <= 240);
  assert.equal(L.splitTopics('a'.repeat(100))[0].length, 60);
  assert.deepEqual(L.allTopics([q({ topic: 'Drugs; Airway' }), q({ topic: 'pacu' })], ['PACU', 'Zeta']), ['Airway', 'Drugs', 'PACU', 'Zeta']);
  const back = L.questionsFromCSV(L.questionsToCSV([q({ topic: 'Airway; Drugs' })])).questions[0];
  assert.deepEqual(back.topics, ['Airway', 'Drugs']);
});
t('newId makes distinct ids', () => assert.equal(new Set(Array.from({ length: 200 }, L.newId)).size, 200));
console.log(`logic: ${n} tests ok`);
