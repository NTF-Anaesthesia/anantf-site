// Tests for the Worker with SQLite standing in for D1 and Claude and Firebase stubbed: npm test
import assert from 'node:assert/strict';
import { handle } from '../src/worker.js';
import { QUESTIONS, PUBLIC, PROGRAMME_COUNT } from '../src/questions.js';
import { systemFor } from '../src/prompt.js';
import { fakeD1 } from './d1.mjs';

const marking = { annotated: 'x [*y*]', raw: 6, adjusted: 5, summary: 'a. b. c.', top_fixes: ['z'] };
const people = {
  'tok-ann': { uid: 'ann', email: 'ann@example.com', emailVerified: true, name: 'Ann' },
  'tok-bob': { uid: 'bob', email: 'bob@example.com', emailVerified: true, name: 'Bob' },
  'tok-fac': { uid: 'fac', email: 'lead@example.com', emailVerified: true, name: 'Lead' },
  'tok-fake': { uid: 'fake', email: 'lead@example.com', emailVerified: false, name: 'Not lead' },
};
let calls, markResult;
const deps = { verify: async t => people[t] || null, mark: async (_e, q, answer) => { calls.push({ q, answer }); return markResult; } };
const env = over => ({ DB: fakeD1(), SAQ_PASSPHRASE: 'cohort26', FACULTY_EMAILS: 'Lead@example.com, other@example.com', ...over });
const api = (e, method, path, token, body) => handle(new Request('https://saq.example' + path, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }), e, deps);
const ok = async (r, status = 200) => { const b = await r.json(); assert.equal(r.status, status, JSON.stringify(b)); return b; };
const firstQ = PUBLIC.weeks[0].sessions[0].questions[0].id;
let n = 0;
const test = async (name, fn) => { calls = []; markResult = { ok: true, model: 'stub', marking, usage: { input_tokens: 1 } }; await fn(); n++; console.log('ok', name); };

await test('programme: 165 questions in 10 weeks, 11 keyed, ids unique; bank of 29', () => {
  assert.equal(PROGRAMME_COUNT, 165);
  assert.equal(PUBLIC.weeks.length, 10);
  const ids = PUBLIC.weeks.flatMap(w => w.sessions.flatMap(s => s.questions.map(q => q.id)));
  assert.equal(new Set(ids).size, 165);
  assert.equal(PUBLIC.weeks.flatMap(w => w.sessions.flatMap(s => s.questions)).filter(q => q.keyed).length, 11);
  assert.equal(PUBLIC.bank.length, 29);
  assert.ok(!JSON.stringify(PUBLIC).includes(QUESTIONS.b28.key.slice(-300)), 'keys never reach the page');
  assert.ok(systemFor(QUESTIONS.b28).includes(QUESTIONS.b28.key));
  assert.ok(systemFor(QUESTIONS[firstQ]).includes(QUESTIONS[firstQ].text));
});

await test('signed out: config and programme only', async () => {
  const e = env();
  assert.equal((await api(e, 'GET', '/api/programme')).status, 200);
  assert.equal((await api(e, 'GET', '/api/me')).status, 401);
  assert.equal((await api(e, 'GET', '/api/me', 'tok-bad')).status, 401);
  assert.equal((await api(e, 'POST', '/api/attempts', null, { qid: firstQ, answer: 'a' })).status, 401);
});

await test('joining needs the cohort passphrase and a name', async () => {
  const e = env();
  assert.equal((await ok(await api(e, 'GET', '/api/me', 'tok-ann'))).user, null);
  await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'wrong', name: 'Ann' }), 403);
  await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'a' }), 403);
  const { user } = await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'cohort26', name: 'Ann Tan' }));
  assert.equal(user.name, 'Ann Tan');
  assert.equal((await ok(await api(e, 'GET', '/api/me', 'tok-ann'))).user.uid, 'ann');
});

await test('an attempt is saved, marked and listed; time is recorded', async () => {
  const e = env();
  await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'cohort26', name: 'Ann' }));
  const { attempt } = await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: '  My answer  ', seconds: 1012.4, started_at: '2026-10-21T01:00:00Z' }));
  assert.equal(attempt.status, 'marked'); assert.equal(attempt.adjusted, 5); assert.equal(attempt.seconds, 1012);
  assert.deepEqual(attempt.marking, marking); assert.equal(attempt.answer, 'My answer'); assert.ok(!('usage' in attempt));
  assert.equal(calls[0].q.id, firstQ); assert.equal(calls[0].answer, 'My answer');
  const me = await ok(await api(e, 'GET', '/api/me', 'tok-ann'));
  assert.equal(me.attempts.length, 1); assert.equal(me.attempts[0].qid, firstQ); assert.ok(!('answer' in me.attempts[0]));
  const again = await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: 'b28', answer: 'TOFR' }));
  assert.equal(again.attempt.keyed, true);
  assert.equal((await ok(await api(e, 'GET', '/api/me', 'tok-ann'))).attempts.length, 2);
});

await test('a failed marking keeps the answer and can be marked again', async () => {
  const e = env();
  await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'cohort26', name: 'Ann' }));
  markResult = { ok: false, status: 502, error: 'down' };
  const r = await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'keep me' });
  assert.equal(r.status, 502);
  const { attempt } = await r.json();
  assert.equal(attempt.status, 'failed'); assert.equal(attempt.answer, 'keep me');
  markResult = { ok: true, model: 'stub', marking, usage: {} };
  const fixed = await ok(await api(e, 'POST', `/api/attempts/${attempt.id}/mark`, 'tok-ann'));
  assert.equal(fixed.attempt.status, 'marked');
  await ok(await api(e, 'POST', `/api/attempts/${attempt.id}/mark`, 'tok-bob'), 403);
});

await test('candidates see only their own attempts; faculty see everyone', async () => {
  const e = env();
  for (const t of ['tok-ann', 'tok-bob']) await ok(await api(e, 'POST', '/api/join', t, { passphrase: 'cohort26', name: t }));
  const { attempt } = await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'ann secret' }));
  await ok(await api(e, 'GET', `/api/attempts/${attempt.id}`, 'tok-bob'), 404);
  assert.equal((await ok(await api(e, 'GET', `/api/attempts/${attempt.id}`, 'tok-ann'))).attempt.answer, 'ann secret');
  await ok(await api(e, 'GET', '/api/cohort', 'tok-bob'), 403);
  await ok(await api(e, 'GET', '/api/export', 'tok-ann'), 403);
  const fac = await ok(await api(e, 'GET', '/api/me', 'tok-fac'));
  assert.equal(fac.faculty, true);
  assert.equal((await ok(await api(e, 'GET', '/api/me', 'tok-fake'))).faculty, false, 'an unverified email is never faculty');
  await ok(await api(e, 'GET', '/api/cohort', 'tok-fake'), 403);
  const { candidates } = await ok(await api(e, 'GET', '/api/cohort', 'tok-fac'));
  const ann = candidates.find(c => c.uid === 'ann');
  assert.equal(ann.done, 1); assert.equal(ann.avg_adjusted, 5);
  assert.equal(candidates.find(c => c.uid === 'bob').done, 0);
  assert.equal((await ok(await api(e, 'GET', '/api/cohort/ann', 'tok-fac'))).attempts.length, 1);
  assert.equal((await ok(await api(e, 'GET', `/api/attempts/${attempt.id}`, 'tok-fac'))).attempt.answer, 'ann secret');
  assert.equal((await ok(await api(e, 'GET', '/api/export', 'tok-fac'))).attempts[0].name, 'tok-ann');
});

await test('faculty join without the passphrase', async () => {
  const e = env();
  await ok(await api(e, 'POST', '/api/join', 'tok-fac', { name: 'Lead' }));
  await ok(await api(e, 'POST', '/api/join', 'tok-fake', { name: 'Fake' }), 403);
});

await test('bad input never reaches Claude', async () => {
  const e = env();
  await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'cohort26', name: 'Ann' }));
  for (const body of [{ qid: 'nope', answer: 'a' }, { qid: firstQ, answer: '   ' }, { qid: firstQ, answer: 'a'.repeat(20001) }]) await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', body), 400);
  assert.equal(calls.length, 0);
});

await test('daily limits per candidate and overall', async () => {
  const e = env({ USER_DAILY_CAP: '2', DAILY_CAP: '3' });
  for (const t of ['tok-ann', 'tok-bob']) await ok(await api(e, 'POST', '/api/join', t, { passphrase: 'cohort26', name: t }));
  await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'a' }));
  await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'a' }));
  await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'a' }), 429);
  await ok(await api(e, 'POST', '/api/attempts', 'tok-bob', { qid: firstQ, answer: 'a' }));
  await ok(await api(e, 'POST', '/api/attempts', 'tok-bob', { qid: firstQ, answer: 'a' }), 429);
});

await test('deleting an account removes its attempts', async () => {
  const e = env();
  await ok(await api(e, 'POST', '/api/join', 'tok-ann', { passphrase: 'cohort26', name: 'Ann' }));
  await ok(await api(e, 'POST', '/api/attempts', 'tok-ann', { qid: firstQ, answer: 'a' }));
  await ok(await api(e, 'DELETE', '/api/me', 'tok-ann'));
  const me = await ok(await api(e, 'GET', '/api/me', 'tok-ann'));
  assert.equal(me.user, null); assert.equal(me.attempts.length, 0);
  assert.equal((await ok(await api(e, 'GET', '/api/export', 'tok-fac'))).attempts.length, 0);
});

console.log(`${n} tests passed`);
