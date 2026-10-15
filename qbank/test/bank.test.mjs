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
t('drawPaper: every must-ask, the hard count, then standard ones, no repeats', () => {
  let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pool = Array.from({ length: 30 }, (_, i) => ({ id: 'q' + i, must: i < 3, level: i >= 3 && i < 10 ? 'hard' : 'standard' }));
  const got = B.drawPaper(pool, { count: 12, hardCount: 4 }, rng);
  assert.equal(got.length, 12); assert.equal(new Set(got.map(q => q.id)).size, 12);
  for (const id of ['q0', 'q1', 'q2']) assert.ok(got.some(q => q.id === id));
  assert.equal(got.filter(q => q.level === 'hard').length, 4);
  assert.equal(B.drawPaper(pool.slice(0, 5), { count: 20 }, rng).length, 5, 'a short pool gives a shorter sitting');
  assert.equal(B.drawPaper(pool.filter(q => q.level === 'hard'), { count: 6, hardCount: 1 }, rng).length, 6, 'leftover hard ones fill in');
});
t('shuffle keeps every item and does not change the input', () => {
  const a = [1, 2, 3, 4, 5]; const s = B.shuffle(a);
  assert.deepEqual([...s].sort(), a); assert.deepEqual(a, [1, 2, 3, 4, 5]);
});
t('matchesQuery searches stem, choices, explanation and topics; every word must match', () => {
  const q = B.clean({ id: 'qsearch1', stem: 'Which drug reverses rocuronium?', options: ['Sugammadex', 'Neostigmine'], explain: 'Encapsulation', topics: ['Pharmacology'] });
  assert.ok(B.matchesQuery(q, 'sugammadex')); assert.ok(B.matchesQuery(q, 'ROCURONIUM encaps')); assert.ok(B.matchesQuery(q, 'pharmacology'));
  assert.ok(B.matchesQuery(q, '  ')); assert.ok(!B.matchesQuery(q, 'rocuronium propofol'));
});
t('readyQuestions: only active, complete questions; the first copy of an id wins', () => {
  const ok = { id: 'qready01', stem: 'A ready question', options: ['a', 'b'], answer: 0, status: 'active' };
  const r = B.readyQuestions([ok, { ...ok, id: 'qdraft02', status: 'draft' }, { ...ok, id: 'qarch003', status: 'archived' }, { ...ok, id: 'qnoans04', answer: null }], [{ ...ok, stem: 'Other source, same id' }]);
  assert.deepEqual(r.map(q => q.id), ['qready01']); assert.equal(r[0].stem, 'A ready question');
});
t('the real bank and papers pass the check', () => {
  const dir = new URL('../', import.meta.url).pathname;
  const c = B.checkBank(JSON.parse(fs.readFileSync(dir + 'bank/questions.json', 'utf8')));
  assert.deepEqual(c.errors, []);
  const r = B.resolvePaper(JSON.parse(fs.readFileSync(dir + 'papers/babymo.json', 'utf8')), c.questions);
  assert.deepEqual(r.errors, []); assert.ok(r.pool.length > 0);
});
console.log(`qbank: ${n} tests ok`);
