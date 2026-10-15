// Pure logic for the Baby MO test: no page, no network, so test/logic.test.mjs can check it in Node.
// The questions come from the shared question bank (../../qbank/js/bank.js): a paper (qbank/papers/babymo.json) says
// which bank questions the test uses, which are must-ask and which are hard. resolvePaper() there gives the ready ones.
//
// Attempt (saved to Firebase, and kept on the phone until the server has it):
//   { id, uid, name, cohort, startedAt, submittedAt, durationSec, attemptNo?,
//     items: [{ qid, stem, options: [2-6], answer, topic, explain, picked }], settings: { count, passMark, minutes } }
//   Each item is a snapshot of the question as the MO saw it, so a later change to the bank never changes a result.

import { LETTERS, PAPER_DEFAULTS, splitTopics } from '../../qbank/js/bank.js';
export { LETTERS };

// What the faculty can set in Firebase (config/test). Count, pass mark, minutes and attempts default to the paper's.
export const REVIEW = [['score', 'Score only'], ['marks', 'Right or wrong'], ['full', 'Full review']];
export const DEFAULT_SETTINGS = { title: 'Baby MO test', review: 'marks', cohort: '', intro: '', ...PAPER_DEFAULTS };

const str = v => (v == null ? '' : String(v));
const int = (v, d) => (Number.isInteger(v) ? v : d);

export function newId() {
  const a = new Uint8Array(8);
  (globalThis.crypto || { getRandomValues: x => x.map(() => Math.random() * 256) }).getRandomValues(a);
  return [...a].map(b => (b % 36).toString(36)).join('');
}

// The settings a sitting uses: the paper's numbers, then whatever the faculty saved in Firebase on top.
// paper: resolvePaper(...).settings plus the paper's title; stored: config/test (or null).
export function effectiveSettings(paper = {}, stored = {}) {
  const p = { ...DEFAULT_SETTINGS, ...pick(paper, ['count', 'passMark', 'minutes', 'maxAttempts', 'hardCount']), title: paper.title || DEFAULT_SETTINGS.title };
  const s = stored || {};
  return {
    title: p.title,
    count: int(s.count, p.count),
    passMark: int(s.passMark, p.passMark),
    minutes: int(s.minutes, p.minutes),
    maxAttempts: int(s.maxAttempts, p.maxAttempts),
    hardCount: int(s.hardCount, p.hardCount),
    review: REVIEW.some(([k]) => k === s.review) ? s.review : p.review,
    cohort: str(s.cohort),
    intro: str(s.intro),
  };
}
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));

// How many right answers pass: 80% of 14 is 11.2, so 12.
export const passCount = (n, passMark) => Math.ceil(n * passMark / 100 - 1e-9);

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// The questions for one sitting (settings.count of them), from the paper's ready questions (resolvePaper().pool:
// bank questions with `must` and `level` from the paper):
//  1. every must-ask question (if there are more than fit, a random few of them);
//  2. settings.hardCount hard questions (fewer if there are fewer), at random;
//  3. the rest at random from the standard ones (leftover hard ones only if the standard ones run out).
// Then shuffled, so must-ask and hard questions are mixed in. Choices keep the order they were written in
// ("all of the above" works). Each item is a snapshot: later changes to the bank don't change it.
export function drawTest(pool, settings, rng = Math.random) {
  const count = Math.max(1, settings.count | 0);
  const hardWanted = Math.max(0, (settings.hardCount ?? PAPER_DEFAULTS.hardCount) | 0);
  const ok = pool.filter(q => q && q.stem && Array.isArray(q.options) && q.options.length >= 2 && q.answer >= 0 && q.answer < q.options.length);
  const must = shuffle(ok.filter(q => q.must), rng).slice(0, count);
  const rest = ok.filter(q => !q.must);
  const hard = shuffle(rest.filter(q => q.level === 'hard'), rng);
  const std = shuffle(rest.filter(q => q.level !== 'hard'), rng);
  let slots = count - must.length;
  const hardHave = must.filter(q => q.level === 'hard').length;
  const takeHard = Math.min(Math.max(hardWanted - hardHave, 0), hard.length, slots);
  const pickedHard = hard.slice(0, takeHard); slots -= takeHard;
  const fromStd = std.slice(0, slots); slots -= fromStd.length;
  const extra = hard.slice(takeHard, takeHard + slots);
  return shuffle([...must, ...pickedHard, ...fromStd, ...extra], rng).map(snapshot);
}
export const snapshot = q => ({
  qid: q.id, stem: q.stem, options: q.options.slice(), answer: q.answer,
  topic: (q.topics || splitTopics(q.topic)).join('; '), explain: q.explain || '', image: q.image || '', picked: null,
});

// What a sitting would be made of, for the faculty Paper page.
export function paperSummary(pool, settings) {
  const count = Math.max(1, settings.count | 0), hardWanted = Math.max(0, settings.hardCount | 0);
  const must = pool.filter(q => q.must).length, hard = pool.filter(q => !q.must && q.level === 'hard').length;
  return { ready: pool.length, must, hard, perSitting: Math.min(count, pool.length), short: Math.max(0, count - pool.length), mustFit: must <= count, hardShort: Math.max(0, hardWanted - hard) };
}

// The key that counts one person's attempts in one intake: same name and cohort = same person.
export function attemptKey(cohort, name) {
  const slug = s => str(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '').slice(0, 50);
  return `${slug(cohort) || 'general'}__${slug(name) || 'unknown'}`;
}

export function mark(items) {
  let score = 0;
  for (const it of items) if (it.picked === it.answer) score++;
  return { score, total: items.length };
}

// Always worked out from the saved answers, never from a stored score.
export function summarise(att) {
  const { score, total } = mark(att.items || []);
  const pct = total ? Math.round((score / total) * 1000) / 10 : 0;
  const passMark = att.settings?.passMark ?? DEFAULT_SETTINGS.passMark;
  return { score, total, pct, pass: total > 0 && score / total * 100 >= passMark - 1e-9, answered: (att.items || []).filter(i => i.picked != null).length };
}

export function secondsLeft(startedAt, minutes, now = Date.now()) {
  return Math.max(0, Math.round(minutes * 60 - (now - startedAt) / 1000));
}
export const clock = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
export const minutesTaken = sec => (sec == null ? '' : sec < 60 ? 'under a minute' : `${Math.round(sec / 60)} min`);

// ---- results for the faculty ----

// Per question across attempts, hardest first. picks[k] = how many chose choice k.
export function questionStats(attempts) {
  const m = new Map();
  for (const a of attempts) for (const it of a.items || []) {
    const s = m.get(it.qid) || { qid: it.qid, stem: it.stem, options: it.options || [], topic: it.topic, n: 0, right: 0, skipped: 0, picks: [], answer: it.answer };
    s.n++; s.stem = it.stem; s.options = it.options || s.options; s.answer = it.answer;
    while (s.picks.length < s.options.length) s.picks.push(0);
    if (it.picked === it.answer) s.right++;
    if (it.picked == null) s.skipped++; else s.picks[it.picked] = (s.picks[it.picked] || 0) + 1;
    m.set(it.qid, s);
  }
  return [...m.values()].map(s => ({ ...s, pct: Math.round(s.right / s.n * 100) })).sort((a, b) => a.pct - b.pct || b.n - a.n);
}
// "Difficult": under 35% right, and only once at least 5 people have answered it.
export const isDifficult = s => s.n >= 5 && s.pct < 35;

// Per topic across attempts, weakest first.
export function topicStats(attempts) {
  const m = new Map();
  for (const a of attempts) for (const it of a.items || []) {
    const ts = splitTopics(it.topic);
    for (const t of ts.length ? ts : ['(no topic)']) { const o = m.get(t) || { topic: t, n: 0, right: 0 }; o.n++; if (it.picked === it.answer) o.right++; m.set(t, o); }
  }
  return [...m.values()].map(o => ({ ...o, pct: Math.round(o.right / o.n * 100) })).sort((a, b) => a.pct - b.pct || b.n - a.n);
}

// One row per person (same name and cohort): their sittings, best score, attempts used and whether they need help
// (not passed and no attempts left). counts: [{ key, n }] from attemptCounts (may be empty).
export function people(attempts, counts = [], maxAttempts = DEFAULT_SETTINGS.maxAttempts) {
  const used = new Map(counts.map(c => [c.key, c.n]));
  const m = new Map();
  for (const a of attempts) {
    const key = attemptKey(a.cohort, a.name);
    const p = m.get(key) || { key, name: a.name, cohort: a.cohort || '', attempts: [] };
    p.attempts.push(a); m.set(key, p);
  }
  return [...m.values()].map(p => {
    p.attempts.sort((x, y) => (y.submittedAt || 0) - (x.submittedAt || 0));
    const sums = p.attempts.map(summarise), best = sums.reduce((b, s) => (!b || s.pct > b.pct ? s : b), null);
    const n = Math.max(used.get(p.key) || 0, p.attempts.length), pass = sums.some(s => s.pass);
    return { ...p, best, pass, used: n, left: Math.max(0, maxAttempts - n), needsHelp: !pass && n >= maxAttempts, last: p.attempts[0] };
  }).sort((a, b) => (b.last?.submittedAt || 0) - (a.last?.submittedAt || 0));
}

// ---- spreadsheet of results (opens in Excel and Google Sheets) ----
export function csvCell(v) { const s = str(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
// Spreadsheets treat a cell starting with = + - @ as a formula: a leading apostrophe keeps it as text.
const safe = v => (/^[=+\-@]/.test(str(v)) ? "'" + str(v) : str(v));
export function attemptsToCSV(attempts) {
  const rows = [['name', 'cohort', 'submitted', 'attempt', 'score', 'out of', 'percent', 'result', 'minutes taken']];
  for (const a of attempts) {
    const s = summarise(a);
    rows.push([a.name, a.cohort || '', a.submittedAt ? new Date(a.submittedAt).toISOString().slice(0, 16).replace('T', ' ') : '', a.attemptNo || '', s.score, s.total, s.pct, s.pass ? 'Pass' : 'Not yet', a.durationSec != null ? Math.round(a.durationSec / 6) / 10 : '']);
  }
  return '﻿' + rows.map(r => r.map(v => csvCell(safe(v))).join(',')).join('\r\n') + '\r\n';
}

export function fmtDate(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}
export const fmtDay = ms => (ms ? new Date(ms).toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) : '');
