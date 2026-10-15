// Unit tests for js/logic.js, with questions in the shared bank's format. Run: node babymo/test/logic.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as L from '../js/logic.js';
import { resolvePaper, clean } from '../../qbank/js/bank.js';

let n = 0;
const t = (name, fn) => { try { fn(); n++; } catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; } };
// a ready bank question as resolvePaper() gives it (must and level come from the paper)
const q = (o = {}) => ({ ...clean({ id: 'qa', stem: 'Which?', options: ['one', 'two', 'three', 'four'], answer: 1, status: 'active', topics: ['Airway'], ...o }), must: !!o.must, level: o.level || 'standard' });

t('drawTest takes at most count, no repeats, snapshots each question', () => {
  const pool = ['1', '5', '6'].map(id => q({ id }));
  const d = L.drawTest(pool, { count: 2 });
  assert.equal(d.length, 2); assert.equal(new Set(d.map(x => x.qid)).size, 2);
  assert.ok(d.every(x => ['1', '5', '6'].includes(x.qid)));
  assert.equal(L.drawTest(pool, { count: 20 }).length, 3);
  assert.ok(d.every(x => x.picked === null));
  assert.deepEqual(Object.keys(d[0]).sort(), ['answer', 'explain', 'image', 'options', 'picked', 'qid', 'stem', 'topic']);
  assert.equal(d[0].topic, 'Airway');
});
t('drawTest copies, so a later change to the bank does not change a drawn sitting', () => {
  const src = q({ id: 'x', options: ['a', 'b', 'c'] }), d = L.drawTest([src], { count: 1 });
  src.options.push('d'); src.stem = 'changed';
  assert.deepEqual(d[0].options, ['a', 'b', 'c']); assert.equal(d[0].stem, 'Which?');
});
t('2 to 6 choices are fine; broken questions are never drawn', () => {
  const pool = [q({ id: 'two', options: ['yes', 'no'], answer: 0 }), q({ id: 'six', options: ['a', 'b', 'c', 'd', 'e', 'f'], answer: 5 }), { id: 'bad', stem: 'x', options: ['a'], answer: 0 }, { ...q({ id: 'noans' }), answer: -1 }];
  const ids = L.drawTest(pool, { count: 10 }).map(x => x.qid).sort();
  assert.deepEqual(ids, ['six', 'two']);
  assert.equal(L.drawTest(pool, { count: 10 }).find(x => x.qid === 'six').options.length, 6);
});
t('every sitting has all must-ask questions and the set number of hard ones', () => {
  const pool = [
    ...Array.from({ length: 3 }, (_, i) => q({ id: 'm' + i, must: true })),
    ...Array.from({ length: 6 }, (_, i) => q({ id: 'h' + i, level: 'hard' })),
    ...Array.from({ length: 30 }, (_, i) => q({ id: 's' + i })),
  ];
  for (let k = 0; k < 40; k++) {
    const ids = L.drawTest(pool, { count: 20, hardCount: 4 }).map(x => x.qid);
    assert.equal(ids.length, 20); assert.equal(new Set(ids).size, 20);
    for (const m of ['m0', 'm1', 'm2']) assert.ok(ids.includes(m), 'must-ask missing');
    assert.equal(ids.filter(i => i.startsWith('h')).length, 4);
  }
});
t('draw copes with too many must-ask, too few hard, and a small pool', () => {
  const musts = Array.from({ length: 25 }, (_, i) => q({ id: 'm' + i, must: true }));
  assert.equal(L.drawTest(musts, { count: 20, hardCount: 4 }).length, 20);
  const few = [q({ id: 'a' }), q({ id: 'b', level: 'hard' }), q({ id: 'c' })];
  const d = L.drawTest(few, { count: 20, hardCount: 4 });
  assert.equal(d.length, 3); assert.ok(d.some(x => x.qid === 'b'));
  const mix = [...Array.from({ length: 5 }, (_, i) => q({ id: 'h' + i, level: 'hard' })), q({ id: 's1' })];
  assert.equal(L.drawTest(mix, { count: 6, hardCount: 1 }).length, 6);   // standard ran out: leftover hard fill the sitting
  assert.equal(L.drawTest(mix, { count: 3, hardCount: 0 }).filter(x => x.qid === 's1').length, 1);
});
t('the real paper: only ready questions, must-ask from the paper, a full sitting draws every must-ask one', () => {
  const root = new URL('../../qbank/', import.meta.url);
  const bank = JSON.parse(fs.readFileSync(new URL('bank/questions.json', root), 'utf8'));
  const paper = JSON.parse(fs.readFileSync(new URL('papers/babymo.json', root), 'utf8'));
  const { pool, settings } = resolvePaper(paper, bank.questions);
  assert.ok(pool.length > 0); assert.ok(pool.every(x => x.status === 'active'));
  const st = L.effectiveSettings({ ...settings, title: paper.title }, null);
  const d = L.drawTest(pool, st), ids = d.map(x => x.qid);
  assert.equal(d.length, Math.min(paper.count, pool.length));
  for (const m of paper.must.filter(id => pool.some(p => p.id === id))) assert.ok(ids.includes(m));
  const byId = new Map(bank.questions.map(x => [x.id, x]));
  for (const it of d) { assert.equal(it.stem, byId.get(it.qid).stem); assert.equal(it.answer, byId.get(it.qid).answer); }
});
t('effectiveSettings: the paper first, then what faculty saved in Firebase', () => {
  const paper = { count: 20, passMark: 80, minutes: 20, maxAttempts: 2, hardCount: 4, title: 'Baby MO Test' };
  const a = L.effectiveSettings(paper, null);
  assert.deepEqual(a, { title: 'Baby MO Test', count: 20, passMark: 80, minutes: 20, maxAttempts: 2, hardCount: 4, review: 'marks', cohort: '', intro: '' });
  const b = L.effectiveSettings(paper, { count: 5, passMark: 60, minutes: 10, review: 'full', cohort: 'Oct', intro: 'Hi', maxAttempts: 3 });
  assert.equal(b.count, 5); assert.equal(b.passMark, 60); assert.equal(b.minutes, 10); assert.equal(b.review, 'full'); assert.equal(b.maxAttempts, 3); assert.equal(b.hardCount, 4);
  assert.equal(L.effectiveSettings(paper, { review: 'weird', count: '7' }).review, 'marks');
  assert.equal(L.effectiveSettings(paper, { count: '7' }).count, 20, 'only whole numbers override');
  assert.equal(L.effectiveSettings({}, null).count, 20, 'defaults when the paper has none');
});
t('passCount and paperSummary', () => {
  assert.equal(L.passCount(14, 80), 12); assert.equal(L.passCount(20, 80), 16); assert.equal(L.passCount(15, 80), 12);
  const s = L.paperSummary([q({ id: '1', must: true }), q({ id: '2', level: 'hard' }), q({ id: '3' })], { count: 20, hardCount: 4 });
  assert.deepEqual(s, { ready: 3, must: 1, hard: 1, perSitting: 3, short: 17, mustFit: true, hardShort: 3 });
});
t('attemptKey: same name and cohort = same person', () => {
  assert.equal(L.attemptKey('Oct 2026 intake', 'Dr  Tan, Wei'), 'oct2026intake__drtanwei');
  assert.equal(L.attemptKey('', 'A'), 'general__a');
  assert.equal(L.attemptKey('X', 'dr tan wei'), L.attemptKey('x', 'DR TAN WEI'));
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
  assert.equal(L.minutesTaken(30), 'under a minute'); assert.equal(L.minutesTaken(600), '10 min');
});
t('questionStats: lowest first, picks per choice (up to 6), Difficult only with 5 or more answers', () => {
  const att = (p1, p2) => ({ items: [{ qid: 'a', stem: 'A', options: ['x', 'y'], answer: 0, picked: p1 }, { qid: 'b', stem: 'B', options: ['1', '2', '3', '4', '5', '6'], answer: 1, picked: p2 }] });
  const s = L.questionStats([att(0, 0), att(0, null), att(0, 5)]);
  assert.equal(s[0].qid, 'b'); assert.equal(s[0].pct, 0); assert.equal(s[0].skipped, 1); assert.deepEqual(s[0].picks, [1, 0, 0, 0, 0, 1]); assert.equal(s[1].pct, 100);
  assert.equal(L.isDifficult(s[0]), false, 'only 3 answers');
  const five = L.questionStats(Array.from({ length: 5 }, () => att(1, 1)));
  assert.equal(L.isDifficult(five.find(x => x.qid === 'a')), true); assert.equal(L.isDifficult(five.find(x => x.qid === 'b')), false);
});
t('topicStats: weakest first, several topics per question', () => {
  const s = L.topicStats([{ items: [{ topic: 'Airway; Drugs', answer: 0, picked: 0 }, { topic: 'Drugs', answer: 0, picked: 1 }, { topic: '', answer: 0, picked: 0 }] }]);
  assert.deepEqual(s.map(x => [x.topic, x.n, x.pct]), [['Drugs', 2, 50], ['Airway', 1, 100], ['(no topic)', 1, 100]]);
});
t('people: one row per person, best score, attempts used, needs help', () => {
  const att = (name, k, at, cohort = 'Oct') => ({ id: name + at, name, cohort, submittedAt: at, settings: { passMark: 80 }, items: Array.from({ length: 5 }, (_, i) => ({ answer: 0, picked: i < k ? 0 : 1 })) });
  const rows = L.people([att('Dr A', 2, 1), att('dr a', 3, 2), att('Dr B', 5, 3), att('Dr C', 1, 4)], [{ key: 'oct__dra', n: 2 }, { key: 'oct__drc', n: 1 }], 2);
  const a = rows.find(r => r.key === 'oct__dra'), bb = rows.find(r => r.key === 'oct__drb'), c = rows.find(r => r.key === 'oct__drc');
  assert.equal(a.attempts.length, 2); assert.equal(a.best.score, 3); assert.equal(a.used, 2); assert.equal(a.needsHelp, true); assert.equal(a.left, 0);
  assert.equal(bb.pass, true); assert.equal(bb.needsHelp, false);
  assert.equal(c.needsHelp, false); assert.equal(c.left, 1);
  assert.equal(rows[0].key, 'oct__drc', 'most recent first');
});
t('attempt CSV guards formulas in names and has the attempt number', () => {
  const csv = L.attemptsToCSV([{ name: '=cmd()', attemptNo: 2, items: [{ answer: 0, picked: 0 }], settings: { passMark: 80 }, submittedAt: 0 }]);
  assert.ok(csv.startsWith('﻿')); assert.ok(csv.includes("'=cmd()")); assert.ok(csv.includes('Pass')); assert.match(csv, /,2,1,1,100,Pass/);
});
t('newId makes distinct ids', () => assert.equal(new Set(Array.from({ length: 200 }, L.newId)).size, 200));
t('letters go up to F', () => assert.deepEqual(L.LETTERS, ['A', 'B', 'C', 'D', 'E', 'F']));
console.log(`logic: ${n} tests ok`);
