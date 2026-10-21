// The Part B SAQ programme's API (saq/README.md), at saq.anantf.com. The app is anantf.com/exams/part-b/.
//
//   POST   /api/login           { email } -> a 6-digit code by email
//   POST   /api/verify          { email, code } -> { token } (send as "Authorization: Bearer <token>")
//   POST   /api/logout          forget this device
//   GET    /api/programme       the 10-week plan, without keys
//   GET    /api/me              the candidate, whether they are faculty, and their attempts (summaries)
//   POST   /api/join            { passphrase, name } once, to join the cohort
//   DELETE /api/me              delete the candidate and every attempt
//   POST   /api/attempts        { qid, answer, seconds, started_at } -> saved, marked, emailed
//   POST   /api/attempts/:id/mark   mark a saved answer again (after a failure)
//   GET    /api/attempts/:id    one attempt in full (its owner or faculty)
//   GET    /api/cohort          faculty: every candidate's completion and scores
//   GET    /api/cohort/:uid     faculty: one candidate's attempts
//   GET    /api/export          faculty: every attempt, in full
//   GET    /api/keys            faculty: the model answers drafted by AI, for review
//
// Secrets: ANTHROPIC_API_KEY, RESEND_API_KEY, SAQ_PASSPHRASE, FACULTY_EMAILS, COPY_TO. Binding: DB (D1).
import { markWithClaude, draftModelAnswer } from './mark.js';
import { sendEmail, codeEmail, scriptEmail } from './email.js';
import { QUESTIONS, PUBLIC, PROGRAMME_COUNT } from './questions.js';
import * as store from './db.js';

const APP = 'https://anantf.com/exams/part-b/';
const MAX_ANSWER = 20000;
const CODE_MINUTES = 15, CODES_PER_HOUR = 5, CODE_TRIES = 5, SESSION_DAYS = 180;

export default {
  fetch: (request, env, ctx) => handle(request, env, ctx, { mark: markWithClaude, draft: draftModelAnswer, email: sendEmail }),
};

export async function handle(request, env, ctx, deps) {
  const url = new URL(request.url);
  const cors = corsHeaders(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (!url.pathname.startsWith('/api/')) return Response.redirect(APP, 302);

  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  const fail = (status, error, extra) => json({ error, ...extra }, status);
  const path = url.pathname.replace(/\/[0-9a-f-]{36}(?=\/mark$|$)/, '/:id').replace(/^\/api\/cohort\/[^/]+$/, '/api/cohort/:uid');
  const route = `${request.method} ${path}`;
  const param = decodeURIComponent(url.pathname.split('/')[3] || '');
  const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};

  try {
    const db = env.DB;
    await store.ensure(db);

    if (route === 'POST /api/login') {
      const email = cleanEmail(body.email);
      if (!email) return fail(400, 'That email address looks wrong.');
      const now = Date.now(), prev = await store.getCode(db, email);
      const fresh = !prev || now - Date.parse(prev.window_at) > 3600e3;
      if (!fresh && prev.sent >= CODES_PER_HOUR) return fail(429, 'Too many codes for this email. Use the latest one, or try again in an hour.');
      const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1e6).padStart(6, '0');
      await store.putCode(db, { email, hash: await sha(`${email}:${code}:${env.CODE_PEPPER || ''}`), expires_at: iso(now + CODE_MINUTES * 60e3), sent: fresh ? 1 : prev.sent + 1, window_at: fresh ? iso(now) : prev.window_at });
      const sent = await deps.email(env, { to: email, ...codeEmail(code) });
      if (!sent && !env.DEV_SHOW_CODE) return fail(502, 'The email could not be sent. Try again in a minute.');
      return json({ sent: true, ...(env.DEV_SHOW_CODE ? { code } : {}) });
    }

    if (route === 'POST /api/verify') {
      const email = cleanEmail(body.email), code = String(body.code || '').replace(/\D/g, '');
      const c = email && await store.getCode(db, email);
      if (!c || Date.parse(c.expires_at) < Date.now() || c.tries >= CODE_TRIES) return fail(400, 'That code has expired. Ask for a new one.');
      if (await sha(`${email}:${code}:${env.CODE_PEPPER || ''}`) !== c.hash) {
        await store.triedCode(db, email);
        return fail(400, c.tries + 1 >= CODE_TRIES ? 'Too many wrong codes. Ask for a new one.' : 'That code is not right. Check the latest email.');
      }
      await store.dropCode(db, email);
      const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
      await store.addSession(db, await sha(token), email, iso(Date.now()));
      return json({ token });
    }

    // everything below needs a signed-in device
    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    const tokenHash = token && await sha(token);
    const session = tokenHash && await store.getSession(db, tokenHash);
    if (!session || Date.now() - Date.parse(session.used_at) > SESSION_DAYS * 864e5) return fail(401, 'Please sign in again.');
    if (Date.now() - Date.parse(session.used_at) > 864e5) await store.touchSession(db, tokenHash, iso(Date.now()));
    const uid = session.email;
    const faculty = String(env.FACULTY_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean).includes(uid);
    const user = await store.getUser(db, uid);

    if (route === 'POST /api/logout') { await store.dropSession(db, tokenHash); return json({ signedOut: true }); }
    if (route === 'GET /api/me') return json({ user, faculty, email: uid, attempts: user ? await store.attemptsFor(db, uid) : [], programmeCount: PROGRAMME_COUNT });

    if (route === 'POST /api/join') {
      if (!faculty && (!env.SAQ_PASSPHRASE || !(await same(String(body.passphrase || '').trim(), env.SAQ_PASSPHRASE)))) return fail(403, 'That cohort passphrase is not right. Ask your programme lead for it.');
      const name = String(body.name || '').trim().slice(0, 80);
      if (!name) return fail(400, 'Enter your name, as your programme lead knows you.');
      await store.addUser(db, { uid, email: uid, name, joined_at: user?.joined_at || iso(Date.now()) });
      return json({ user: await store.getUser(db, uid) });
    }

    if (route.startsWith('GET /api/cohort') || route === 'GET /api/export' || route === 'GET /api/keys') {
      if (!faculty) return fail(403, 'Faculty only.');
      if (route === 'GET /api/cohort') return json({ candidates: await store.cohort(db), programmeCount: PROGRAMME_COUNT });
      if (route === 'GET /api/export') return json({ attempts: (await store.allAttempts(db)).map(parse) });
      if (route === 'GET /api/keys') return json({ keys: (await store.allKeys(db)).map(k => ({ ...k, question: QUESTIONS[k.qid]?.text || null })) });
      return json({ user: await store.getUser(db, param), attempts: await store.attemptsFor(db, param) });
    }

    if (route === 'GET /api/attempts/:id' && (user || faculty)) {
      const a = await store.getAttempt(db, param);
      if (!a || (a.uid !== uid && !faculty)) return fail(404, 'Not found.');
      return json({ attempt: parse(a), modelAnswer: a.status === 'marked' ? await modelAnswerFor(a.qid) : null });
    }

    if (!user) return fail(403, 'Join the cohort first.');

    if (route === 'GET /api/programme') return json(PUBLIC);
    if (route === 'DELETE /api/me') { await store.deleteUser(db, uid); return json({ deleted: true }); }

    if (route === 'POST /api/attempts') {
      const q = QUESTIONS[String(body.qid || '')];
      if (!q || (q.kind === 'bank' && !faculty)) return fail(400, 'Unknown question.');
      const answer = String(body.answer || '').trim();
      if (!answer) return fail(400, 'Write your answer first.');
      if (answer.length > MAX_ANSWER) return fail(400, 'That answer is too long to be a 15-minute SAQ.');
      const limit = await overLimit(db, env, uid);
      if (limit) return fail(429, limit);
      const a = {
        id: crypto.randomUUID(), uid, qid: q.id, question: q.text, answer, keyed: !!q.key,
        started_at: validDate(body.started_at), submitted_at: iso(Date.now()), seconds: Math.max(0, Math.min(6 * 3600, Math.round(Number(body.seconds) || 0))),
      };
      await store.addAttempt(db, a);
      return await markAndSend(a.id, q, answer);
    }

    if (route === 'POST /api/attempts/:id/mark') {
      const a = await store.getAttempt(db, param);
      if (!a || a.uid !== uid) return fail(404, 'Not found.');
      if (a.status === 'marked') return json({ attempt: parse(a), modelAnswer: await modelAnswerFor(a.qid) });
      const limit = await overLimit(db, env, uid);
      if (limit) return fail(429, limit);
      return await markAndSend(a.id, QUESTIONS[a.qid] || { id: a.qid, text: a.question, key: '' }, a.answer);
    }

    return fail(404, 'Not found.');

    // mark against the question's key, drafting one first if it has none, then email the script
    async function markAndSend(id, q, answer) {
      let key = q.key, keySource = q.key ? q.keySource : null;
      if (!key && q.id && QUESTIONS[q.id]) {
        const saved = await store.getKey(db, q.id);
        if (saved) { key = saved.text; keySource = 'ai'; }
        else {
          const d = await deps.draft(env, q);
          if (d.ok) {
            await store.putKey(db, { qid: q.id, text: d.text, model: d.model, created_at: iso(Date.now()) });
            key = (await store.getKey(db, q.id)).text; keySource = 'ai';
          }
        }
      }
      const r = await deps.mark(env, { ...q, key, keySource }, answer);
      if (!r.ok) {
        await store.saveMarking(db, id, { status: 'failed' });
        return fail(r.status || 502, r.error, { attempt: parse(await store.getAttempt(db, id)) });
      }
      await store.saveMarking(db, id, { status: 'marked', raw: r.marking.raw, adjusted: r.marking.adjusted, marking: r.marking, model: r.model, usage: r.usage, keyed: !!key });
      const attempt = parse(await store.getAttempt(db, id));
      const label = q.week ? `Week ${q.week} · ${q.sessionLabel} · ${q.tag}` : (q.title || 'SAQ');
      const copy = String(env.COPY_TO || '').split(',').map(s => s.trim()).filter(Boolean).filter(e => e !== uid);
      const sending = deps.email(env, { to: uid, bcc: copy, ...scriptEmail({ name: user.name, label, attempt, key, keySource }) }).catch(e => console.error('script email', e));
      if (ctx?.waitUntil) ctx.waitUntil(sending); else await sending;
      return json({ attempt, modelAnswer: key ? { text: key, source: keySource } : null });
    }

    // shown once an answer is marked: the bank's, an approved draft, or the one AI drafted for this question
    async function modelAnswerFor(qid) {
      const q = QUESTIONS[qid];
      if (q?.key) return { text: q.key, source: q.keySource };
      const k = await store.getKey(db, qid);
      return k ? { text: k.text, source: 'ai' } : null;
    }
  } catch (err) {
    console.error(err);
    return fail(500, 'Something went wrong on our side. Your answer is saved if it got this far; try again in a minute.');
  }
}

// a ceiling on the bill: per candidate and across everyone, per day (Singapore time)
async function overLimit(db, env, uid) {
  const from = new Date(new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10) + 'T00:00:00+08:00').toISOString();
  if (await store.countSince(db, from, uid) >= Number(env.USER_DAILY_CAP || 25)) return 'You have reached today’s marking limit. Your progress is saved; carry on tomorrow.';
  if (await store.countSince(db, from) >= Number(env.DAILY_CAP || 400)) return 'The marker has reached its limit for today. Try again tomorrow.';
  return null;
}

function parse(a) {
  if (!a) return a;
  const { usage, ...rest } = a;
  return { ...rest, marking: a.marking ? JSON.parse(a.marking) : null, keyed: !!a.keyed };
}

function corsHeaders(request, env) {
  const allowed = String(env.ALLOWED_ORIGINS || 'https://anantf.com').split(',').map(s => s.trim());
  const origin = request.headers.get('Origin') || '';
  return allowed.includes(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }
    : { Vary: 'Origin' };
}

const iso = ms => new Date(ms).toISOString();
const validDate = s => (s && !isNaN(Date.parse(s)) ? new Date(s).toISOString() : null);
const cleanEmail = s => { const e = String(s || '').trim().toLowerCase(); return e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null; };
const b64url = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function sha(s) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
  return [...d].map(b => b.toString(16).padStart(2, '0')).join('');
}
// compares digests, so the time taken doesn't depend on how much of the passphrase was right
async function same(a, b) { return (await sha(a)) === (await sha(b)); }
