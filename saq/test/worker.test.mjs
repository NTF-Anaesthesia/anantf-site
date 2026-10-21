// Tests for the SAQ marker's Worker, with Claude replaced by a stub: node saq/test/worker.test.mjs
import assert from 'node:assert/strict';
import { handle, QUESTIONS } from '../worker.js';
import { systemFor, SCHEMA } from '../prompt.js';
import KEYS from '../keys/bundle.js';

const kv = () => { const m = new Map(); return { m, get: async k => m.get(k) ?? null, put: async (k, v) => void m.set(k, v), list: async ({ prefix }) => ({ keys: [...m.keys()].filter(k => k.startsWith(prefix)).map(name => ({ name })), list_complete: true }) }; };
const env = (over = {}) => ({ SAQ_PASSPHRASE: 'pass', ADMIN_TOKEN: 'admin', SAQ_LOG: kv(), ...over });
const marking = { transcription: 'x', legible: true, annotated: 'x', raw: 6, adjusted: 5, summary: 'a. b. c.', top_fixes: [] };
let calls = [];
const deps = { mark: async (_e, args) => { calls.push(args); return { ok: true, model: 'stub', marking, usage: {} }; } };
const post = (body, origin = 'https://anantf.com') => new Request('https://saq.example/api/mark', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
let n = 0;
const test = async (name, fn) => { calls = []; await fn(); n++; console.log('ok', name); };

await test('29 questions, each with a stem and a key', () => {
  assert.equal(KEYS.length, 29);
  assert.deepEqual(KEYS.map(q => q.id), Array.from({ length: 29 }, (_, i) => String(i + 1).padStart(2, '0')));
  for (const q of KEYS) { assert.ok(q.stem.length > 40, q.id); assert.ok(q.key.length > 800, q.id); assert.ok(systemFor(q).includes(q.key)); }
  assert.ok(!('key' in QUESTIONS[0]));
});
await test('question list hides the keys', async () => {
  const r = await handle(new Request('https://saq.example/api/questions'), env(), deps);
  const { questions } = await r.json();
  assert.equal(questions.length, 29);
  assert.ok(!JSON.stringify(questions).includes(KEYS[0].key.slice(-200)));
});
await test('wrong passphrase is refused before Claude is called', async () => {
  const r = await handle(post({ passphrase: 'nope', qid: '01', answer: 'a' }), env(), deps);
  assert.equal(r.status, 401); assert.equal(calls.length, 0);
});
await test('marks a typed answer and stores it without identifiers', async () => {
  const e = env();
  const r = await handle(post({ passphrase: 'pass', qid: '28', answer: 'TOF ratio >0.9' }), e, deps);
  assert.equal(r.status, 200);
  assert.deepEqual((await r.json()).marking, marking);
  assert.equal(calls[0].q.id, '28');
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), 'https://anantf.com');
  const stored = [...e.SAQ_LOG.m.entries()].filter(([k]) => k.startsWith('mark:'));
  assert.equal(stored.length, 1);
  const rec = JSON.parse(stored[0][1]);
  assert.equal(rec.qid, '28'); assert.equal(rec.adjusted, 5);
  assert.ok(!('passphrase' in rec) && !('ip' in rec));
});
await test('own stem without a key', async () => {
  const r = await handle(post({ passphrase: 'pass', stem: 'Discuss TIVA.', answer: 'propofol' }), env(), deps);
  assert.equal(r.status, 200); assert.equal(calls[0].q, null); assert.equal(calls[0].stem, 'Discuss TIVA.');
});
await test('rejects bad input', async () => {
  for (const [body, status] of [
    [{ passphrase: 'pass', qid: '99', answer: 'a' }, 400],
    [{ passphrase: 'pass', qid: '01' }, 400],
    [{ passphrase: 'pass', answer: 'a' }, 400],
    [{ passphrase: 'pass', qid: '01', answer: 'a'.repeat(20001) }, 400],
    [{ passphrase: 'pass', qid: '01', images: [{ media_type: 'image/gif', data: 'x' }] }, 400],
    [{ passphrase: 'pass', qid: '01', images: Array(5).fill({ media_type: 'image/jpeg', data: 'x' }) }, 400],
  ]) assert.equal((await handle(post(body), env(), deps)).status, status, JSON.stringify(body).slice(0, 80));
  assert.equal(calls.length, 0);
});
await test('daily cap', async () => {
  const e = env({ DAILY_CAP: '1' });
  assert.equal((await handle(post({ passphrase: 'pass', qid: '01', answer: 'a' }), e, deps)).status, 200);
  assert.equal((await handle(post({ passphrase: 'pass', qid: '01', answer: 'a' }), e, deps)).status, 429);
});
await test('rate limit binding', async () => {
  const e = env({ MARK_LIMIT: { limit: async () => ({ success: false }) } });
  assert.equal((await handle(post({ passphrase: 'pass', qid: '01', answer: 'a' }), e, deps)).status, 429);
});
await test('other origins get no CORS grant', async () => {
  const r = await handle(post({ passphrase: 'pass', qid: '01', answer: 'a' }, 'https://evil.example'), env(), deps);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'), null);
});
await test('faculty export needs the admin token', async () => {
  const e = env();
  await handle(post({ passphrase: 'pass', qid: '01', answer: 'a' }), e, deps);
  const get = auth => handle(new Request('https://saq.example/api/log', { headers: auth ? { Authorization: auth } : {} }), e, deps);
  assert.equal((await get()).status, 401);
  assert.equal((await get('Bearer wrong')).status, 401);
  const r = await get('Bearer admin');
  assert.equal((await r.json()).markings.length, 1);
});
await test('schema scores are 3 to 8', () => { assert.deepEqual(SCHEMA.properties.adjusted.enum, [3, 4, 5, 6, 7, 8]); });
console.log(`${n} tests passed`);
