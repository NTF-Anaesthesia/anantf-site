// Tests for the Worker with SQLite standing in for D1, and Claude and email stubbed: npm test
import assert from 'node:assert/strict';
import { handle } from '../src/worker.js';
import { QUESTIONS, PUBLIC, PROGRAMME_COUNT } from '../src/questions.js';
import { systemFor } from '../src/prompt.js';
import { fakeD1 } from './d1.mjs';

const marking = { annotated: 'x [*y*]', raw: 6, adjusted: 5, summary: 'a. b. c.', top_fixes: ['z'] };
let calls, markResult, draftResult, mail;
const deps = {
  mark: async (_e, q, answer) => { calls.push({ q, answer }); return markResult; },
  draft: async (_e, q) => { calls.push({ draft: q.id }); return draftResult; },
  email: async (_e, m) => { mail.push(m); return true; },
};
const env = over => ({ DB: fakeD1(), SAQ_PASSPHRASE: 'cohort26', FACULTY_EMAILS: 'Lead@example.com, other@example.com', COPY_TO: 'copy@example.com', ...over });
const call = (e, method, path, token, body, origin = 'https://anantf.com') => handle(new Request('https://saq.example' + path, {
  method, headers: { Origin: origin, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined,
}), e, null, deps);
const ok = async (r, status = 200) => { const b = await r.json(); assert.equal(r.status, status, JSON.stringify(b)); return b; };
const codeIn = m => m.text.match(/\b(\d{6})\b/)[1];
async function signIn(e, email) {
  await ok(await call(e, 'POST', '/api/login', null, { email }));
  const code = codeIn(mail.filter(m => m.to === email.toLowerCase()).at(-1));
  return (await ok(await call(e, 'POST', '/api/verify', null, { email, code }))).token;
}
async function joined(e, email, name = email) {
  const t = await signIn(e, email);
  await ok(await call(e, 'POST', '/api/join', t, { passphrase: 'cohort26', name }));
  return t;
}
const keyed = PUBLIC.weeks.flatMap(w => w.sessions.flatMap(s => s.questions)).find(q => q.keyed).id;
const unkeyed = PUBLIC.weeks[0].sessions[0].questions.find(q => !q.keyed).id;
let n = 0;
const test = async (name, fn) => {
  calls = []; mail = [];
  markResult = { ok: true, model: 'stub', marking, usage: { input_tokens: 1 } };
  draftResult = { ok: true, model: 'stub', text: '**A**\n- drafted point' };
  await fn(); n++; console.log('ok', name);
};

await test('programme: 165 questions in 10 weeks, 11 with a bank model answer; keys and bank never sent', () => {
  assert.equal(PROGRAMME_COUNT, 165);
  assert.equal(PUBLIC.weeks.length, 10);
  const qs = PUBLIC.weeks.flatMap(w => w.sessions.flatMap(s => s.questions));
  assert.equal(new Set(qs.map(q => q.id)).size, 165);
  assert.equal(qs.filter(q => q.keyed).length, 11);
  assert.ok(!('bank' in PUBLIC));
  assert.ok(!JSON.stringify(PUBLIC).includes(QUESTIONS[keyed].key.slice(-300)));
  assert.ok(systemFor(QUESTIONS[keyed]).includes(QUESTIONS[keyed].key));
  assert.ok(systemFor({ text: 'Q', key: 'K', keySource: 'ai' }).includes('not yet reviewed by faculty'));
});

await test('sign in with an emailed code; wrong codes and stale codes fail', async () => {
  const e = env();
  await ok(await call(e, 'POST', '/api/login', null, { email: 'not-an-email' }), 400);
  await ok(await call(e, 'POST', '/api/login', null, { email: ' Ann@Example.com ' }));
  assert.equal(mail.length, 1); assert.equal(mail[0].to, 'ann@example.com'); assert.match(mail[0].subject, /\d{6}/);
  const code = codeIn(mail[0]);
  const wrong = code === '000000' ? '111111' : '000000';
  await ok(await call(e, 'POST', '/api/verify', null, { email: 'ann@example.com', code: wrong }), 400);
  const { token } = await ok(await call(e, 'POST', '/api/verify', null, { email: 'ANN@example.com', code }));
  assert.ok(token.length >= 40);
  await ok(await call(e, 'POST', '/api/verify', null, { email: 'ann@example.com', code }), 400);   // used once only
  const me = await ok(await call(e, 'GET', '/api/me', token));
  assert.equal(me.email, 'ann@example.com'); assert.equal(me.user, null);
  await ok(await call(e, 'GET', '/api/me', 'made-up'), 401);
  await ok(await call(e, 'POST', '/api/logout', token));
  await ok(await call(e, 'GET', '/api/me', token), 401);
});

await test('five wrong tries burn the code; five codes an hour per email', async () => {
  const e = env();
  await ok(await call(e, 'POST', '/api/login', null, { email: 'bob@example.com' }));
  const code = codeIn(mail[0]);
  for (let i = 0; i < 5; i++) await ok(await call(e, 'POST', '/api/verify', null, { email: 'bob@example.com', code: String((Number(code) + 1 + i) % 1e6).padStart(6, '0') }), 400);
  await ok(await call(e, 'POST', '/api/verify', null, { email: 'bob@example.com', code }), 400);
  for (let i = 0; i < 4; i++) await ok(await call(e, 'POST', '/api/login', null, { email: 'bob@example.com' }));
  await ok(await call(e, 'POST', '/api/login', null, { email: 'bob@example.com' }), 429);
});

await test('joining needs the cohort passphrase and a name; the programme needs joining', async () => {
  const e = env();
  const t = await signIn(e, 'ann@example.com');
  await ok(await call(e, 'GET', '/api/programme', t), 403);
  await ok(await call(e, 'POST', '/api/join', t, { passphrase: 'wrong', name: 'Ann' }), 403);
  await ok(await call(e, 'POST', '/api/join', t, { passphrase: 'cohort26', name: ' ' }), 400);
  const { user } = await ok(await call(e, 'POST', '/api/join', t, { passphrase: 'cohort26', name: 'Ann Tan' }));
  assert.equal(user.name, 'Ann Tan');
  assert.equal((await ok(await call(e, 'GET', '/api/programme', t))).weeks.length, 10);
  await ok(await call(e, 'GET', '/api/programme'), 401);
});

await test('a keyed question is marked against its model answer and emailed to the candidate and the copy address', async () => {
  const e = env();
  const t = await joined(e, 'ann@example.com', 'Ann');
  mail = [];
  const { attempt } = await ok(await call(e, 'POST', '/api/attempts', t, { qid: keyed, answer: '  My answer  ', seconds: 1012.4, started_at: '2026-10-21T01:00:00Z' }));
  assert.equal(attempt.status, 'marked'); assert.equal(attempt.adjusted, 5); assert.equal(attempt.seconds, 1012); assert.equal(attempt.keyed, true);
  assert.equal(calls.filter(c => c.draft).length, 0);
  assert.equal(calls[0].q.key, QUESTIONS[keyed].key); assert.equal(calls[0].q.keySource, 'bank');
  assert.equal(mail.length, 1);
  assert.equal(mail[0].to, 'ann@example.com'); assert.deepEqual(mail[0].bcc, ['copy@example.com']);
  assert.match(mail[0].subject, /^SAQ marked: 5/);
  assert.ok(mail[0].html.includes('My answer') || mail[0].html.includes('x <span'), 'annotated answer in the email');
  assert.ok(mail[0].text.includes("Model answer from the department's SAQ bank"));
  const me = await ok(await call(e, 'GET', '/api/me', t));
  assert.equal(me.attempts.length, 1); assert.ok(!('answer' in me.attempts[0]));
  const back = await ok(await call(e, 'GET', `/api/attempts/${attempt.id}`, t));
  assert.equal(back.modelAnswer.source, 'bank'); assert.equal(back.modelAnswer.text, QUESTIONS[keyed].key);
});

await test('a question with no model answer gets one drafted once, reused, and emailed', async () => {
  const e = env();
  const ann = await joined(e, 'ann@example.com'), bob = await joined(e, 'bob@example.com');
  mail = [];
  await ok(await call(e, 'POST', '/api/attempts', ann, { qid: unkeyed, answer: 'a' }));
  await ok(await call(e, 'POST', '/api/attempts', bob, { qid: unkeyed, answer: 'b' }));
  assert.equal(calls.filter(c => c.draft).length, 1, 'drafted once');
  const marks = calls.filter(c => c.q);
  assert.equal(marks[0].q.key, '**A**\n- drafted point'); assert.equal(marks[1].q.key, marks[0].q.key); assert.equal(marks[0].q.keySource, 'ai');
  assert.ok(mail[0].text.includes('drafted by AI, not yet reviewed by faculty'));
  const again = await ok(await call(e, 'POST', '/api/attempts', ann, { qid: unkeyed, answer: 'c' }));
  assert.deepEqual(again.modelAnswer, { text: '**A**\n- drafted point', source: 'ai' });
});

await test('if drafting fails, marking goes ahead against the rubric only', async () => {
  const e = env();
  const t = await joined(e, 'ann@example.com');
  draftResult = { ok: false, status: 502, error: 'x' };
  const { attempt } = await ok(await call(e, 'POST', '/api/attempts', t, { qid: unkeyed, answer: 'a' }));
  assert.equal(attempt.status, 'marked'); assert.equal(attempt.keyed, false);
  assert.ok(!calls.find(c => c.q).q.key);
});

await test('a failed marking keeps the answer and can be marked again', async () => {
  const e = env();
  const t = await joined(e, 'ann@example.com');
  markResult = { ok: false, status: 502, error: 'down' };
  mail = [];
  const r = await call(e, 'POST', '/api/attempts', t, { qid: keyed, answer: 'keep me' });
  assert.equal(r.status, 502);
  const { attempt } = await r.json();
  assert.equal(attempt.status, 'failed'); assert.equal(attempt.answer, 'keep me'); assert.equal(mail.length, 0);
  markResult = { ok: true, model: 'stub', marking, usage: {} };
  assert.equal((await ok(await call(e, 'POST', `/api/attempts/${attempt.id}/mark`, t))).attempt.status, 'marked');
  assert.equal(mail.length, 1);
  const bob = await joined(e, 'bob@example.com');
  await ok(await call(e, 'POST', `/api/attempts/${attempt.id}/mark`, bob), 404);
});

await test('candidates see only their own attempts; faculty see everyone', async () => {
  const e = env();
  const ann = await joined(e, 'ann@example.com', 'Ann'), bob = await joined(e, 'bob@example.com', 'Bob');
  const { attempt } = await ok(await call(e, 'POST', '/api/attempts', ann, { qid: unkeyed, answer: 'ann secret' }));
  await ok(await call(e, 'GET', `/api/attempts/${attempt.id}`, bob), 404);
  assert.equal((await ok(await call(e, 'GET', `/api/attempts/${attempt.id}`, ann))).attempt.answer, 'ann secret');
  for (const p of ['/api/cohort', '/api/export', '/api/keys', '/api/cohort/ann%40example.com']) await ok(await call(e, 'GET', p, bob), 403);
  const lead = await signIn(e, 'lead@example.com');
  assert.equal((await ok(await call(e, 'GET', '/api/me', lead))).faculty, true);
  await ok(await call(e, 'POST', '/api/join', lead, { name: 'Lead' }));   // faculty need no passphrase
  const { candidates } = await ok(await call(e, 'GET', '/api/cohort', lead));
  assert.equal(candidates.find(c => c.uid === 'ann@example.com').done, 1);
  assert.equal((await ok(await call(e, 'GET', '/api/cohort/ann%40example.com', lead))).attempts.length, 1);
  assert.equal((await ok(await call(e, 'GET', `/api/attempts/${attempt.id}`, lead))).attempt.answer, 'ann secret');
  assert.equal((await ok(await call(e, 'GET', '/api/export', lead))).attempts[0].name, 'Ann');
  const { keys } = await ok(await call(e, 'GET', '/api/keys', lead));
  assert.equal(keys.length, 1); assert.equal(keys[0].qid, unkeyed); assert.ok(keys[0].question);
});

await test('candidates cannot attempt bank questions or bad input', async () => {
  const e = env();
  const t = await joined(e, 'ann@example.com');
  for (const body of [{ qid: 'b28', answer: 'a' }, { qid: 'nope', answer: 'a' }, { qid: keyed, answer: '   ' }, { qid: keyed, answer: 'a'.repeat(20001) }]) await ok(await call(e, 'POST', '/api/attempts', t, body), 400);
  assert.equal(calls.length, 0);
});

await test('daily limits per candidate and overall', async () => {
  const e = env({ USER_DAILY_CAP: '2', DAILY_CAP: '3' });
  const ann = await joined(e, 'ann@example.com'), bob = await joined(e, 'bob@example.com');
  await ok(await call(e, 'POST', '/api/attempts', ann, { qid: keyed, answer: 'a' }));
  await ok(await call(e, 'POST', '/api/attempts', ann, { qid: keyed, answer: 'a' }));
  await ok(await call(e, 'POST', '/api/attempts', ann, { qid: keyed, answer: 'a' }), 429);
  await ok(await call(e, 'POST', '/api/attempts', bob, { qid: keyed, answer: 'a' }));
  await ok(await call(e, 'POST', '/api/attempts', bob, { qid: keyed, answer: 'a' }), 429);
});

await test('deleting an account removes its attempts and signs out every device', async () => {
  const e = env();
  const t = await joined(e, 'ann@example.com');
  const other = await signIn(e, 'ann@example.com');
  await ok(await call(e, 'POST', '/api/attempts', t, { qid: keyed, answer: 'a' }));
  await ok(await call(e, 'DELETE', '/api/me', t));
  await ok(await call(e, 'GET', '/api/me', other), 401);
  const fresh = await signIn(e, 'ann@example.com');
  const me = await ok(await call(e, 'GET', '/api/me', fresh));
  assert.equal(me.user, null); assert.equal(me.attempts.length, 0);
});

await test('CORS only for anantf.com; other paths go to the app', async () => {
  const e = env();
  const pre = await handle(new Request('https://saq.example/api/attempts', { method: 'OPTIONS', headers: { Origin: 'https://anantf.com' } }), e, null, deps);
  assert.equal(pre.status, 204); assert.equal(pre.headers.get('Access-Control-Allow-Origin'), 'https://anantf.com');
  assert.match(pre.headers.get('Access-Control-Allow-Headers'), /Authorization/);
  const evil = await call(e, 'POST', '/api/login', null, { email: 'x@example.com' }, 'https://evil.example');
  assert.equal(evil.headers.get('Access-Control-Allow-Origin'), null);
  const home = await handle(new Request('https://saq.example/'), e, null, deps);
  assert.equal(home.status, 302); assert.equal(home.headers.get('Location'), 'https://anantf.com/exams/part-b/');
});

console.log(`${n} tests passed`);
