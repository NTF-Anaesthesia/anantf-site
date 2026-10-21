// The SAQ marker's Cloudflare Worker (saq/README.md): marks a practice MMed Part B SAQ answer with Claude against the
// department's model answers. The page is exams/marker/ on anantf.com; this Worker is only the API behind it.
//
//   GET  /api/questions   the question list (ids, titles, stems; no keys)
//   POST /api/mark        { passphrase, qid | stem, answer?, images? } -> the marking
//   GET  /api/log         faculty export of stored markings (Authorization: Bearer <ADMIN_TOKEN>)
//
// Secrets: ANTHROPIC_API_KEY, SAQ_PASSPHRASE, ADMIN_TOKEN. Bindings: SAQ_LOG (KV, optional), MARK_LIMIT (rate limit,
// optional). Stored markings carry no name, IP or images: the question, the transcribed answer and the marks.
import Anthropic from '@anthropic-ai/sdk';
import { betaJSONSchemaOutputFormat } from '@anthropic-ai/sdk/helpers/beta/json-schema';
import KEYS from './keys/bundle.js';
import { SCHEMA, systemFor, userText } from './prompt.js';

const MODEL = 'claude-opus-5-5';
const MAX_ANSWER = 20000;              // characters of typed answer
const MAX_IMAGES = 4;                  // pages of handwriting
const MAX_IMAGE_B64 = 5 * 1024 * 1024; // per page, after the page shrinks it
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const QUESTIONS = KEYS.map(({ id, title, stem }) => ({ id, title, stem }));
const BY_ID = Object.fromEntries(KEYS.map(q => [q.id, q]));

export default {
  fetch: (request, env) => handle(request, env, { mark: markWithClaude }),
};

export async function handle(request, env, deps) {
  const url = new URL(request.url);
  const cors = corsHeaders(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  const fail = (status, error) => json({ error }, status);

  try {
    if (url.pathname === '/api/questions' && request.method === 'GET') return json({ questions: QUESTIONS });
    if (url.pathname === '/api/log' && request.method === 'GET') return await exportLog(request, env, json, fail);
    if (url.pathname !== '/api/mark') return fail(404, 'Not found');
    if (request.method !== 'POST') return fail(405, 'Use POST');

    let body;
    try { body = await request.json(); } catch { return fail(400, 'The request was not readable. Reload the page and try again.'); }
    if (!env.SAQ_PASSPHRASE || !(await same(String(body.passphrase || ''), env.SAQ_PASSPHRASE))) return fail(401, 'Wrong passphrase.');

    const q = body.qid ? BY_ID[String(body.qid)] : null;
    if (body.qid && !q) return fail(400, 'Unknown question.');
    const stem = q ? '' : String(body.stem || '').trim().slice(0, 4000);
    if (!q && !stem) return fail(400, 'Choose a question, or paste your own.');
    const answer = String(body.answer || '').trim();
    if (answer.length > MAX_ANSWER) return fail(400, 'That answer is too long to be a 15-minute SAQ.');
    const images = Array.isArray(body.images) ? body.images : [];
    if (images.length > MAX_IMAGES) return fail(400, `Up to ${MAX_IMAGES} pages, please.`);
    for (const im of images) {
      if (!im || !IMAGE_TYPES.includes(im.media_type) || typeof im.data !== 'string' || im.data.length > MAX_IMAGE_B64) return fail(400, 'One of the pages could not be used. Try a JPEG or PNG photo.');
    }
    if (!answer && !images.length) return fail(400, 'Type your answer or add a photo of it.');

    if (env.MARK_LIMIT) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.MARK_LIMIT.limit({ key: ip });
      if (!success) return fail(429, 'Too many markings in a short time. Wait a minute and try again.');
    }
    const day = new Date().toISOString().slice(0, 10);
    if (env.SAQ_LOG) {
      const cap = Number(env.DAILY_CAP || 200);
      const used = Number(await env.SAQ_LOG.get(`count:${day}`)) || 0;
      if (used >= cap) return fail(429, 'The marker has reached its limit for today. Try again tomorrow.');
      await env.SAQ_LOG.put(`count:${day}`, String(used + 1), { expirationTtl: 60 * 60 * 24 * 3 });
    }

    const result = await deps.mark(env, { q, stem, answer, images });
    if (!result.ok) return fail(result.status || 502, result.error);

    const record = { at: new Date().toISOString(), qid: q ? q.id : null, stem: stem || undefined, typed: !!answer, pages: images.length, model: result.model, ...result.marking, usage: result.usage };
    if (env.SAQ_LOG) await env.SAQ_LOG.put(`mark:${record.at}:${crypto.randomUUID().slice(0, 8)}`, JSON.stringify(record));
    return json({ marking: result.marking });
  } catch (err) {
    console.error(err);
    return fail(500, 'Something went wrong on our side. Try again in a minute.');
  }
}

async function markWithClaude(env, { q, stem, answer, images }) {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const content = [
    ...images.map(im => ({ type: 'image', source: { type: 'base64', media_type: im.media_type, data: im.data } })),
    { type: 'text', text: userText(stem, answer, images.length) },
  ];
  try {
    const response = await client.beta.messages.parse({
      model: env.MODEL || MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: env.EFFORT || 'medium', format: betaJSONSchemaOutputFormat(SCHEMA) },
      system: [{ type: 'text', text: systemFor(q), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content }],
    });
    if (response.stop_reason === 'refusal') return { ok: false, status: 422, error: 'This answer could not be marked. Try rephrasing or retyping it.' };
    if (response.stop_reason === 'max_tokens' || !response.parsed_output) return { ok: false, status: 502, error: 'The marking was cut short. Try again.' };
    return { ok: true, model: response.model, marking: response.parsed_output, usage: response.usage };
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return { ok: false, status: 429, error: 'The marker is busy. Try again in a minute.' };
    if (err instanceof Anthropic.BadRequestError) { console.error(err.message); return { ok: false, status: 400, error: 'The marker could not read this submission. If you added photos, try fewer or smaller pages.' }; }
    if (err instanceof Anthropic.APIError) { console.error(err.status, err.message); return { ok: false, status: 502, error: 'The marker is unavailable right now. Try again shortly.' }; }
    throw err;
  }
}

async function exportLog(request, env, json, fail) {
  const auth = request.headers.get('Authorization') || '';
  if (!env.ADMIN_TOKEN || !(await same(auth.replace(/^Bearer\s+/i, ''), env.ADMIN_TOKEN))) return fail(401, 'Not allowed.');
  if (!env.SAQ_LOG) return json({ markings: [] });
  const markings = [];
  let cursor;
  do {
    const page = await env.SAQ_LOG.list({ prefix: 'mark:', cursor });
    for (const k of page.keys) markings.push(JSON.parse(await env.SAQ_LOG.get(k.name)));
    cursor = page.list_complete ? null : page.cursor;
  } while (cursor && markings.length < 5000);
  return json({ markings });
}

function corsHeaders(request, env) {
  const allowed = String(env.ALLOWED_ORIGINS || 'https://anantf.com').split(',').map(s => s.trim());
  const origin = request.headers.get('Origin') || '';
  return allowed.includes(origin) || allowed.includes('*')
    ? { 'Access-Control-Allow-Origin': origin || '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Vary': 'Origin' }
    : { 'Vary': 'Origin' };
}

// compares digests, so the time taken doesn't depend on how much of the passphrase was right
async function same(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([a, b].map(s => crypto.subtle.digest('SHA-256', enc.encode(s))));
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let d = 0;
  for (let i = 0; i < u.length; i++) d |= u[i] ^ v[i];
  return d === 0;
}
