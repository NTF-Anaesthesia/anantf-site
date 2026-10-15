// Unit tests for qbank/js/practice.js (what to ask, sessions, scores, progress): node qbank/test/practice.test.mjs
import assert from 'node:assert/strict';
import * as B from '../js/bank.js';
import * as P from '../js/practice.js';
let n = 0; const t = (name, fn) => { fn(); n++; };
let seed = 3; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const mk = (i, topics = ['Airway']) => B.clean({ id: 'qp' + String(i).padStart(6, '0'), stem: `Question ${i} ${'x'.repeat(i)}`, options: ['a', 'b', 'c'], answer: i % 3, topics, status: 'active' });
const pool = Array.from({ length: 20 }, (_, i) => mk(i, i < 8 ? ['Airway'] : i < 14 ? ['Drugs', 'Airway'] : ['Regional']));

t('record keeps counts and the last five answers', () => {
  let p = {};
  for (let k = 0; k < 7; k++) p = P.record(p, 'q1', k % 2 === 0, 1000 + k);
  assert.equal(p.q1.n, 7); assert.equal(p.q1.c, 4); assert.equal(p.q1.h.length, 5); assert.deepEqual(p.q1.h.at(-1), [1006, 1]);
  assert.equal(P.statusOf(p, 'q1'), 'right'); assert.equal(P.statusOf(p, 'nope'), 'unseen');
  assert.equal(P.statusOf(P.record(p, 'q1', false), 'q1'), 'missed');
});
t('topics: counted, most first; a question can be in several', () => {
  const tp = P.topicsOf(pool);
  assert.deepEqual(tp[0], { topic: 'Airway', count: 14 });
  assert.ok(tp.some(x => x.topic === 'Drugs' && x.count === 6));
  assert.deepEqual(P.topicsOf([B.clean({ id: 'qnotopic', stem: 's', options: ['a', 'b'], answer: 0 })]), [{ topic: 'General', count: 1 }]);
});
t('filterPool by topics and status', () => {
  let p = {}; p = P.record(p, pool[0].id, false); p = P.record(p, pool[1].id, true);
  assert.equal(P.filterPool(pool, { topics: ['Regional'] }).length, 6);
  assert.deepEqual(P.filterPool(pool, { status: 'missed' }, p).map(q => q.id), [pool[0].id]);
  assert.equal(P.filterPool(pool, { status: 'unseen' }, p).length, 18);
  assert.deepEqual(P.filterPool(pool, { status: 'flagged' }, p, { [pool[5].id]: 1 }).map(q => q.id), [pool[5].id]);
});
t('pickPractice: up to half missed, then unseen, then more missed, then the right ones seen longest ago', () => {
  let p = {};
  for (let i = 0; i < 8; i++) p = P.record(p, pool[i].id, false, i);      // 8 missed
  for (let i = 8; i < 18; i++) p = P.record(p, pool[i].id, true, i);     // 10 right; 2 unseen
  let got = P.pickPractice(pool, p, 6, rng);
  assert.equal(got.length, 6); assert.equal(new Set(got).size, 6);
  assert.equal(got.filter(q => P.statusOf(p, q.id) === 'missed').length, 4, 'half missed, then unseen');
  assert.equal(got.filter(q => P.statusOf(p, q.id) === 'unseen').length, 2);
  p = {};
  for (let i = 0; i < 4; i++) p = P.record(p, pool[i].id, false, i);      // 4 missed
  for (let i = 4; i < 18; i++) p = P.record(p, pool[i].id, true, i);     // 14 right; 2 unseen
  got = P.pickPractice(pool, p, 10, rng);
  assert.equal(got.filter(q => P.statusOf(p, q.id) === 'missed').length, 4);
  assert.equal(got.filter(q => P.statusOf(p, q.id) === 'unseen').length, 2);
  const right = got.filter(q => P.statusOf(p, q.id) === 'right').map(q => q.id).sort();
  assert.deepEqual(right, [4, 5, 6, 7].map(i => pool[i].id).sort(), 'the right ones seen longest ago come first');
  assert.equal(P.pickPractice(pool, p, 0, rng).length, 20, '0 means all');
  assert.equal(P.pickPractice(pool.slice(0, 3), {}, 10, rng).length, 3);
});
t('a session keeps a copy of each question; scores and topics come from it', () => {
  const s = P.newSession({ questions: pool.slice(0, 4), label: 'Test' }, 5000);
  pool[0].stem = 'changed later';
  assert.notEqual(s.items[0].q.stem, 'changed later');
  s.items[0].picked = s.items[0].q.answer; s.items[1].picked = (s.items[1].q.answer + 1) % 3; s.items[2].flagged = true;
  assert.deepEqual(P.score(s), { right: 1, total: 4, answered: 2, unanswered: 2, wrong: 1, flagged: 1, pct: 25, pass: null });
  assert.deepEqual(P.sessionTopics(s), [{ topic: 'Airway', right: 1, total: 4 }]);
  assert.deepEqual(s.items.map(P.itemState), ['right', 'wrong', 'unanswered', 'unanswered']);
  assert.equal(P.secondsLeft(s), null, 'practice has no clock');
});
t('a paper session draws by the paper rules and knows the pass mark', () => {
  const paper = { id: 'p1', title: 'Paper', questions: pool.map(q => q.id), must: [pool[2].id], count: 5, minutes: 7, passMark: 80 };
  const r = B.resolvePaper(paper, pool);
  const s = P.paperSession(paper, r, 10000, rng);
  assert.equal(s.mode, 'exam'); assert.equal(s.items.length, 5); assert.equal(s.minutes, 7);
  assert.ok(s.items.some(i => i.q.id === pool[2].id));
  s.items.forEach(i => { i.picked = i.q.answer; });
  assert.equal(P.score(s).pass, true);
  s.items[0].picked = null; assert.equal(P.score(s).pass, true, '4 of 5 is 80%');
  s.items[1].picked = null; assert.equal(P.score(s).pass, false);
  assert.equal(P.secondsLeft(s, 10000 + 60000), 360); assert.equal(P.secondsLeft(s, 10000 + 10 * 60000), 0);
  assert.equal(P.clock(65), '1:05');
});
t('mastery: not started, learning, mastered (3+ answers in the topic and the last 3 right)', () => {
  const reg = pool.filter(q => q.topics.includes('Regional'));
  let p = {};
  assert.equal(P.topicMastery(pool, p, 'Regional').label, 'Not started');
  p = P.record(p, reg[0].id, true, 1); p = P.record(p, reg[1].id, true, 2);
  assert.equal(P.topicMastery(pool, p, 'Regional').label, 'Learning');
  p = P.record(p, reg[2].id, true, 3);
  assert.equal(P.topicMastery(pool, p, 'Regional').label, 'Mastered');
  p = P.record(p, reg[0].id, false, 4);
  assert.equal(P.topicMastery(pool, p, 'Regional').label, 'Learning');
  assert.equal(P.topicMastery(pool, p, 'Regional').right, 2);
});
t('totals ignore questions that left the bank', () => {
  let p = P.record({}, pool[0].id, true); p = P.record(p, 'qgone', false);
  assert.deepEqual(P.totals(pool, p), { answered: 1, correct: 1, pct: 100, seen: 1 });
});
t('week runs Monday to Sunday and marks days practised', () => {
  const now = new Date(2026, 9, 15, 9).getTime();     // Thursday 15 Oct 2026
  const days = P.addDay(P.addDay([], new Date(2026, 9, 12, 20).getTime()), now);
  assert.deepEqual(P.addDay(days, now), days, 'the same day is kept once');
  const wk = P.week(days, now);
  assert.deepEqual(wk.map(d => d.name), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  assert.deepEqual(wk.filter(d => d.on).map(d => d.name), ['Mon', 'Thu']); assert.ok(wk[3].today);
});
console.log(`qbank practice: ${n} tests ok`);
