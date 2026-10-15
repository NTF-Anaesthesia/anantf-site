// Unit tests for qbank/js/bank.js: node qbank/test/bank.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as B from '../js/bank.js';
let n = 0; const t = (name, fn) => { fn(); n++; };

t('clean fills every field and reads letter answers', () => {
  const q = B.clean({ id: 'qabc123', stem: ' Hi ', options: ['a', 'b', 'c', ''], answer: 'B', topic: 'Airway; airway; Drugs' });
  assert.deepEqual(q.options, ['a', 'b', 'c']); assert.equal(q.answer, 1); assert.deepEqual(q.topics, ['Airway', 'Drugs']);
  assert.equal(q.status, 'draft'); assert.equal(q.level, 'standard');
});
t('ids are stable and never collide', () => {
  const a = B.idFor('same text'); assert.equal(a, B.idFor('same text'));
  assert.notEqual(B.idFor('same text', new Set([a])), a); assert.match(a, /^q[0-9a-z]{7}$/);
});
t('ready questions must be complete; drafts need text only', () => {
  const d = B.clean({ id: 'qdraft01', stem: 'x', options: ['a', ''], status: 'draft' });
  assert.equal(B.problems(d).length, 0);
  assert.ok(B.problems({ ...d, status: 'active' }).some(p => p.field === 'answer'));
  assert.ok(B.problems(B.clean({ id: 'qdup0001', stem: 'x', options: ['a', 'A'], answer: 0, status: 'active' })).some(p => /same/.test(p.text)));
});
t('sameQuestion catches copies and reworded endings, not short look-alikes', () => {
  const s = 'Which drug is the first-line treatment for anaphylaxis in theatre?';
  assert.ok(B.sameQuestion({ stem: s }, { stem: s + ' (reworded)' }));
  assert.ok(!B.sameQuestion({ stem: 'Atracurium:' }, { stem: 'Atracurium: is broken down by what?' }));
});
t('checkBank finds repeated ids and duplicate questions', () => {
  const q = { id: 'qaaaaaaa', stem: 'A long enough question about the airway?', options: ['a', 'b'], answer: 0, status: 'active' };
  const r = B.checkBank({ kind: B.KIND, questions: [q, { ...q }, { ...q, id: 'qbbbbbbb' }] });
  assert.ok(r.errors.some(e => /used twice/.test(e))); assert.ok(r.errors.some(e => /same question/.test(e)));
});
t('resolvePaper applies must and hard lists and drops unready questions', () => {
  const qs = [1, 2, 3].map(i => B.clean({ id: 'qpaper0' + i, stem: 'Question number ' + i + ' about something different ' + 'x'.repeat(i * 9), options: ['a', 'b'], answer: 0, status: i === 3 ? 'draft' : 'active' }));
  const r = B.resolvePaper({ id: 'p', questions: ['qpaper01', 'qpaper02', 'qpaper03', 'qmissing'], must: ['qpaper01'], hard: ['qpaper02'], count: 10 }, qs);
  assert.equal(r.pool.length, 2); assert.ok(r.pool.find(q => q.id === 'qpaper01').must); assert.equal(r.pool.find(q => q.id === 'qpaper02').level, 'hard');
  assert.equal(r.errors.length, 1); assert.equal(r.settings.count, 10); assert.equal(r.settings.passMark, 80);
});
t('CSV round trip keeps every field, quotes commas and guards formulas', () => {
  const q = B.clean({ id: 'qcsv0001', stem: 'Dose, in mg?\nSecond line "quoted"', options: ['=SUM(1)', 'b', 'c', 'd', 'e'], answer: 4, explain: 'because', topics: ['A', 'B'], level: 'hard', status: 'active', source: 's', review: 'r' });
  const back = B.fromCSV(B.toCSV([q]))[0];
  assert.deepEqual(back, { ...q, image: '', updated: '' });
});
t('mergeById updates by id, adds new rows with ids, deletes nothing', () => {
  const a = B.clean({ id: 'qmerge01', stem: 'First question here for merging', options: ['a', 'b'], answer: 0, updated: '2026-01-01' });
  const b = B.clean({ id: 'qmerge02', stem: 'Second question here for merging', options: ['a', 'b'], answer: 1 });
  const r = B.mergeById([a, b], [{ ...a, answer: 1 }, { stem: 'Brand new question', options: ['x', 'y'] }], '2026-10-15');
  assert.equal(r.added, 1); assert.equal(r.changed, 1); assert.equal(r.questions.length, 3);
  assert.equal(r.questions[0].answer, 1); assert.equal(r.questions[0].updated, '2026-10-15'); assert.ok(r.questions[2].id);
});
t('suggestion text and issue link carry the question and the change', () => {
  const q = B.clean({ id: 'qsugg001', stem: 'Stem?', options: ['a', 'b'], answer: 0 });
  const txt = B.suggestionText(q, { comment: 'Answer should be B', question: { answer: 1 } }, 'Dr Test');
  assert.match(txt, /Suggested by: Dr Test/); assert.match(txt, /B\. b {2}\(answer\)/);
  assert.match(B.suggestionIssueUrl(q, { comment: 'x' }, 'Dr Test'), /^https:\/\/github\.com\/NTF-Anaesthesia\/anantf-site\/issues\/new\?title=Question%20edit/);
});
t('the real bank and papers pass the check', () => {
  const dir = new URL('../', import.meta.url).pathname;
  const c = B.checkBank(JSON.parse(fs.readFileSync(dir + 'bank/questions.json', 'utf8')));
  assert.deepEqual(c.errors, []);
  const r = B.resolvePaper(JSON.parse(fs.readFileSync(dir + 'papers/babymo.json', 'utf8')), c.questions);
  assert.deepEqual(r.errors, []); assert.ok(r.pool.length > 0);
});
console.log(`qbank: ${n} tests ok`);
