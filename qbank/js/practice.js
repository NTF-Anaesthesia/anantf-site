// Practice logic for the qbank app: what to ask next, sessions, scores and progress. Pure (no page, no storage) so the
// Node tests can check it; js/app.js keeps the state in localStorage and draws the screens.
//
// progress: { [questionId]: { n: times answered, c: times right, h: [[time, 1|0], ...] (the last 5, oldest first) } }
// flags:    { [questionId]: time flagged }
// A question that leaves the bank (archived, back to draft, or removed) simply stops showing: progress is looked up by id
// for the questions that are still there, never the other way round.
import { shuffle, drawPaper, LETTERS } from './bank.js';

export const COUNTS = [5, 10, 20, 0];          // 0 = all
export const countLabel = n => (n ? String(n) : 'All');
export const HISTORY_MAX = 20;

export function record(progress, id, correct, at = Date.now()) {
  const p = progress[id] || { n: 0, c: 0, h: [] };
  const h = [...(p.h || []), [at, correct ? 1 : 0]].slice(-5);
  return { ...progress, [id]: { n: (p.n || 0) + 1, c: (p.c || 0) + (correct ? 1 : 0), h } };
}
export const lastResult = p => (p?.h?.length ? !!p.h[p.h.length - 1][1] : null);
// 'unseen' | 'missed' (the last answer was wrong) | 'right'
export function statusOf(progress, id) {
  const r = lastResult(progress[id]);
  return r == null ? 'unseen' : r ? 'right' : 'missed';
}

// Topics in the pool, most questions first, then A to Z.
export function topicsOf(pool) {
  const m = new Map();
  for (const q of pool) for (const t of q.topics.length ? q.topics : ['General']) m.set(t, (m.get(t) || 0) + 1);
  return [...m].map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic));
}
export const inTopic = (q, t) => (q.topics.length ? q.topics : ['General']).includes(t);

// Custom filter: topics (none = all), status 'all' | 'unseen' | 'missed' | 'flagged'
export function filterPool(pool, { topics = [], status = 'all' } = {}, progress = {}, flags = {}) {
  return pool.filter(q => (!topics.length || topics.some(t => inTopic(q, t)))
    && (status === 'all' || (status === 'flagged' ? !!flags[q.id] : statusOf(progress, q.id) === status)));
}

// "Start 10 questions": up to half from the ones missed last time, then unseen ones, then any more missed ones, then
// the ones already right, those seen longest ago first. The order is shuffled at the end.
export function pickPractice(pool, progress, count = 10, rng = Math.random) {
  const n = count > 0 ? Math.min(count, pool.length) : pool.length;
  const missed = shuffle(pool.filter(q => statusOf(progress, q.id) === 'missed'), rng);
  const unseen = shuffle(pool.filter(q => statusOf(progress, q.id) === 'unseen'), rng);
  const lastSeen = q => { const h = progress[q.id]?.h; return h?.length ? h[h.length - 1][0] : 0; };
  const rest = shuffle(pool.filter(q => statusOf(progress, q.id) === 'right'), rng).sort((a, b) => lastSeen(a) - lastSeen(b));
  const out = missed.slice(0, Math.ceil(n / 2));
  for (const list of [unseen, missed.slice(out.length), rest]) for (const q of list) if (out.length < n && !out.includes(q)) out.push(q);
  return shuffle(out, rng);
}

// What a session keeps of each question, so a later change to the bank never changes a session already started.
export const snap = q => ({ id: q.id, stem: q.stem, options: q.options.slice(), answer: q.answer, explain: q.explain || '', topics: q.topics.slice(), image: q.image || '', source: q.source || '', level: q.level || 'standard' });

let seq = 0;
export function newSession({ kind = 'quick', label = 'Practice', mode = 'practice', questions, minutes = 0, paper = null }, now = Date.now()) {
  return {
    id: 's' + now.toString(36) + (seq++).toString(36), kind, label, mode, minutes: mode === 'exam' ? minutes : 0, paper,
    startedAt: now, finishedAt: 0, pos: 0, timerHidden: false,
    items: questions.map(q => ({ q: snap(q), picked: null, flagged: false })),
  };
}
export function paperSession(paper, resolved, now = Date.now(), rng = Math.random) {
  const questions = drawPaper(resolved.pool, resolved.settings, rng);
  const s = resolved.settings;
  return newSession({ kind: 'paper', label: paper.title, mode: 'exam', questions, minutes: s.minutes, paper: { id: paper.id, title: paper.title, passMark: s.passMark } }, now);
}

export const secondsLeft = (s, now = Date.now()) => (s.mode === 'exam' && s.minutes ? Math.max(0, Math.round(s.minutes * 60 - (now - s.startedAt) / 1000)) : null);
export const clock = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
export const duration = ms => { const m = Math.round(ms / 60000); return m < 1 ? 'under a minute' : m === 1 ? '1 minute' : `${m} minutes`; };

export function score(s) {
  const items = s.items, total = items.length;
  const right = items.filter(i => i.picked === i.q.answer).length;
  const answered = items.filter(i => i.picked != null).length;
  const pct = total ? Math.round(right / total * 100) : 0;
  const pass = s.paper ? total > 0 && right / total * 100 >= s.paper.passMark - 1e-9 : null;
  return { right, total, answered, unanswered: total - answered, wrong: answered - right, flagged: items.filter(i => i.flagged).length, pct, pass };
}
export const itemState = i => (i.picked == null ? 'unanswered' : i.picked === i.q.answer ? 'right' : 'wrong');

// Per topic in one session: [{ topic, right, total }]
export function sessionTopics(s) {
  const m = new Map();
  for (const i of s.items) for (const t of i.q.topics.length ? i.q.topics : ['General']) {
    const e = m.get(t) || { topic: t, right: 0, total: 0 }; e.total++; if (i.picked === i.q.answer) e.right++; m.set(t, e);
  }
  return [...m.values()].sort((a, b) => b.total - a.total || a.topic.localeCompare(b.topic));
}

// Mastery of a topic: 0 Not started, 1 Learning, 2 Mastered (at least 3 answers in the topic and the last 3 right).
export const MASTERY = ['Not started', 'Learning', 'Mastered'];
export function topicMastery(pool, progress, topic) {
  const qs = pool.filter(q => inTopic(q, topic));
  const log = qs.flatMap(q => progress[q.id]?.h || []).sort((a, b) => a[0] - b[0]);
  const level = !log.length ? 0 : log.length >= 3 && log.slice(-3).every(x => x[1]) ? 2 : 1;
  const right = qs.filter(q => statusOf(progress, q.id) === 'right').length;
  return { topic, total: qs.length, level, label: MASTERY[level], right, share: qs.length ? right / qs.length : 0 };
}

export function totals(pool, progress) {
  let answered = 0, correct = 0;
  for (const q of pool) { const p = progress[q.id]; if (p) { answered += p.n || 0; correct += p.c || 0; } }
  return { answered, correct, pct: answered ? Math.round(correct / answered * 100) : 0, seen: pool.filter(q => progress[q.id]).length };
}

// Days practised: local dates 'YYYY-MM-DD'. This week runs Monday to Sunday.
export const localDate = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function addDay(days, t = Date.now()) { const d = localDate(t); return days.includes(d) ? days : [...days, d].slice(-90); }
export function week(days, now = Date.now()) {
  const d = new Date(now); d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((name, i) => {
    const day = new Date(d); day.setDate(d.getDate() + i);
    const key = localDate(day.getTime());
    return { name, key, on: days.includes(key), today: key === localDate(now) };
  });
}

export const letter = i => LETTERS[i] || '?';
