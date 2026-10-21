// The SAQ marker (README.md): serves the app in public/ and its API at saq.anantf.com.
//
//   GET    /api/config          Firebase web config (public by design)
//   GET    /api/programme       the 10-week plan and the bank, without keys
//   GET    /api/me              the signed-in candidate, whether they are faculty, and their attempts (summaries)
//   POST   /api/join            { passphrase, name } once, to join the cohort
//   DELETE /api/me              delete the candidate and every attempt
//   POST   /api/attempts        { qid, answer, seconds, started_at } -> saved, then marked
//   POST   /api/attempts/:id/mark   mark a saved answer again (after a failure)
//   GET    /api/attempts/:id    one attempt in full (its owner or faculty)
//   GET    /api/cohort          faculty: every candidate's completion and scores
//   GET    /api/cohort/:uid     faculty: one candidate's attempts
//   GET    /api/export          faculty: every attempt, in full
//
// Signed in = a Firebase ID token in "Authorization: Bearer". Faculty = a verified email in FACULTY_EMAILS.
// Secrets: ANTHROPIC_API_KEY, SAQ_PASSPHRASE, FACULTY_EMAILS. Vars: FIREBASE_CONFIG. Bindings: DB (D1), ASSETS.
import { verifyFirebase } from './auth.js';
import { markWithClaude } from './mark.js';
import { QUESTIONS, PUBLIC, PROGRAMME_COUNT } from './questions.js';
import * as store from './db.js';

const MAX_ANSWER = 20000;

export default {
  fetch: (request, env) => handle(request, env, { mark: markWithClaude, verify: token => verifyFirebase(token, firebaseConfig(env).projectId) }),
};

export async function handle(request, env, deps) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/api/')) return env.ASSETS ? env.ASSETS.fetch(request) : new Response('Not found', { status: 404 });

  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  const fail = (status, error) => json({ error }, status);
  const route = `${request.method} ${url.pathname.replace(/\/[0-9a-f-]{36}$/, '/:id').replace(/\/[0-9a-f-]{36}\/mark$/, '/:id/mark').replace(/^\/api\/cohort\/[^/]+$/, '/api/cohort/:uid')}`;
  const param = url.pathname.split('/')[3];

  try {
    if (route === 'GET /api/config') return json({ firebase: firebaseConfig(env) });
    if (route === 'GET /api/programme') return json(PUBLIC);

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const who = await deps.verify(token);
    if (!who) return fail(401, 'Please sign in again.');
    const db = env.DB;
    await store.ensure(db);
    const faculty = who.emailVerified && String(env.FACULTY_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean).includes(who.email);
    const user = await store.getUser(db, who.uid);

    if (route === 'GET /api/me') return json({ user, faculty, email: who.email, attempts: user ? await store.attemptsFor(db, who.uid) : [], programmeCount: PROGRAMME_COUNT });

    if (route === 'POST /api/join') {
      const body = await request.json().catch(() => ({}));
      if (!faculty && (!env.SAQ_PASSPHRASE || !(await same(String(body.passphrase || '').trim(), env.SAQ_PASSPHRASE)))) return fail(403, 'That cohort passphrase is not right. Ask your programme lead for it.');
      const name = String(body.name || who.name || '').trim().slice(0, 80);
      if (!name) return fail(400, 'Enter your name, as your programme lead knows you.');
      await store.addUser(db, { uid: who.uid, email: who.email, name, joined_at: user?.joined_at || now() });
      return json({ user: await store.getUser(db, who.uid) });
    }

    if (route.startsWith('GET /api/cohort') || route === 'GET /api/export') {
      if (!faculty) return fail(403, 'Faculty only.');
      if (route === 'GET /api/cohort') return json({ candidates: await store.cohort(db), programmeCount: PROGRAMME_COUNT });
      if (route === 'GET /api/export') return json({ attempts: (await store.allAttempts(db)).map(parse) });
      return json({ user: await store.getUser(db, param), attempts: await store.attemptsFor(db, param) });
    }

    if (route === 'GET /api/attempts/:id' && (user || faculty)) {
      const a = await store.getAttempt(db, param);
      if (!a || (a.uid !== who.uid && !faculty)) return fail(404, 'Not found.');
      return json({ attempt: parse(a) });
    }

    if (!user) return fail(403, 'Join the cohort first.');

    if (route === 'DELETE /api/me') { await store.deleteUser(db, who.uid); return json({ deleted: true }); }

    if (route === 'POST /api/attempts') {
      const body = await request.json().catch(() => ({}));
      const q = QUESTIONS[String(body.qid || '')];
      if (!q) return fail(400, 'Unknown question.');
      const answer = String(body.answer || '').trim();
      if (!answer) return fail(400, 'Write your answer first.');
      if (answer.length > MAX_ANSWER) return fail(400, 'That answer is too long to be a 15-minute SAQ.');
      const limit = await overLimit(db, env, who.uid);
      if (limit) return fail(429, limit);
      const a = {
        id: crypto.randomUUID(), uid: who.uid, qid: q.id, question: q.text, answer, keyed: !!q.key,
        started_at: validDate(body.started_at), submitted_at: now(), seconds: Math.max(0, Math.min(6 * 3600, Math.round(Number(body.seconds) || 0))),
      };
      await store.addAttempt(db, a);
      return await markAndSave(db, env, deps, a.id, q, answer, json, fail);
    }

    if (route === 'POST /api/attempts/:id/mark') {
      const a = await store.getAttempt(db, param);
      if (!a || a.uid !== who.uid) return fail(404, 'Not found.');
      if (a.status === 'marked') return json({ attempt: parse(a) });
      const limit = await overLimit(db, env, who.uid);
      if (limit) return fail(429, limit);
      const q = QUESTIONS[a.qid] || { text: a.question, key: '' };
      return await markAndSave(db, env, deps, a.id, q, a.answer, json, fail);
    }

    return fail(404, 'Not found.');
  } catch (err) {
    console.error(err);
    return fail(500, 'Something went wrong on our side. Your answer is saved if it got this far; try again in a minute.');
  }
}

async function markAndSave(db, env, deps, id, q, answer, json, fail) {
  const r = await deps.mark(env, q, answer);
  if (!r.ok) {
    await store.saveMarking(db, id, { status: 'failed' });
    const body = { error: r.error, attempt: parse(await store.getAttempt(db, id)) };
    return new Response(JSON.stringify(body), { status: r.status || 502, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  await store.saveMarking(db, id, { status: 'marked', raw: r.marking.raw, adjusted: r.marking.adjusted, marking: r.marking, model: r.model, usage: r.usage });
  return json({ attempt: parse(await store.getAttempt(db, id)) });
}

// a ceiling on the bill: per candidate and across everyone, per day (Singapore time)
async function overLimit(db, env, uid) {
  const since = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10) + 'T00:00:00+08:00';
  const from = new Date(since).toISOString();
  if (await store.countSince(db, from, uid) >= Number(env.USER_DAILY_CAP || 25)) return 'You have reached today’s marking limit. Your progress is saved; carry on tomorrow.';
  if (await store.countSince(db, from) >= Number(env.DAILY_CAP || 400)) return 'The marker has reached its limit for today. Try again tomorrow.';
  return null;
}

function parse(a) {
  if (!a) return a;
  const { usage, ...rest } = a;
  return { ...rest, marking: a.marking ? JSON.parse(a.marking) : null, keyed: !!a.keyed };
}

function firebaseConfig(env) {
  try { return typeof env.FIREBASE_CONFIG === 'string' ? JSON.parse(env.FIREBASE_CONFIG) : env.FIREBASE_CONFIG || {}; } catch { return {}; }
}
const now = () => new Date().toISOString();
const validDate = s => (s && !isNaN(Date.parse(s)) ? new Date(s).toISOString() : null);

// compares digests, so the time taken doesn't depend on how much of the passphrase was right
async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}
