// Pure logic for the Baby MO test: no page, no network, so test/logic.test.mjs can check it in Node.
// Question: { id, stem, options:[A,B,C,D], answer:0-3, explain, topic, image, status, rev }
// Attempt:  { id, uid, name, cohort, startedAt, submittedAt, durationSec, items:[{qid,stem,options,answer,topic,explain,picked}], settings }

export const LETTERS = ['A', 'B', 'C', 'D'];
export const STATUSES = ['draft', 'active', 'archived'];
export const STATUS_LABEL = { draft: 'Draft', active: 'In the test', archived: 'Archived' };
export const DEFAULT_SETTINGS = { title: 'Baby MO Test', count: 20, passMark: 80, minutes: 20, review: 'marks', cohort: '', intro: '', maxAttempts: 2, hardCount: 4 };
export const LEVELS = ['standard', 'hard'];
export const LEVEL_LABEL = { standard: 'Standard', hard: 'Hard' };
export const LIMITS = { stem: 2000, option: 500, explain: 3000, topic: 60, topics: 240, image: 400000 };

const str = v => (v == null ? '' : String(v));
const tidy = s => str(s).replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

export function newId() {
  const a = new Uint8Array(8);
  (globalThis.crypto || { getRandomValues: x => x.map(() => Math.random() * 256) }).getRandomValues(a);
  return [...a].map(b => (b % 36).toString(36)).join('');
}

// A question can be in several topics. They are stored in the single `topic` text as "Airway; Drugs" and used as the
// list `topics` everywhere else.
export function splitTopics(v) {
  const out = [], seen = new Set();
  for (const raw of (Array.isArray(v) ? v : str(v).split(';'))) {
    const t = str(raw).replace(/\s+/g, ' ').trim().slice(0, LIMITS.topic);
    if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
  }
  return out;
}
export const joinTopics = list => splitTopics(list).join('; ').slice(0, LIMITS.topics).replace(/;\s*$/, '');
// every topic in use plus the saved list, no repeats (case-insensitive), A to Z
export function allTopics(questions, saved = []) {
  const m = new Map();
  for (const t of [...saved, ...questions.flatMap(q => splitTopics(q.topics || q.topic))]) { const k = t.toLowerCase(); if (!m.has(k)) m.set(k, t); }
  return [...m.values()].sort((a, b) => a.localeCompare(b));
}

// A question with every field present and tidy, whatever came in (old data, a CSV row, a half-filled form).
export function cleanQuestion(q = {}) {
  const opts = Array.isArray(q.options) ? q.options : [];
  const ans = Number.isInteger(q.answer) ? q.answer : parseInt(q.answer, 10);
  return {
    id: str(q.id),
    stem: tidy(q.stem),
    options: [0, 1, 2, 3].map(i => tidy(opts[i])),
    answer: ans >= 0 && ans <= 3 ? ans : -1,
    explain: tidy(q.explain),
    topic: joinTopics(Array.isArray(q.topics) ? q.topics : q.topic),
    topics: splitTopics(Array.isArray(q.topics) ? q.topics : q.topic),
    image: str(q.image),
    status: STATUSES.includes(q.status) ? q.status : 'draft',
    must: q.must === true || q.must === 'true',
    level: LEVELS.includes(q.level) ? q.level : 'standard',
    rev: Number.isInteger(q.rev) ? q.rev : 0,
    updatedAt: Number(q.updatedAt) || 0,
    updatedBy: q.updatedBy && typeof q.updatedBy === 'object' ? { email: str(q.updatedBy.email), name: str(q.updatedBy.name) } : null,
  };
}

// Plain-English problems. A draft may be unfinished (it only needs some text); a question put in the test must be complete.
// -> [{ field, text }]
export function problems(q, forStatus = q.status) {
  const out = [];
  const add = (field, text) => out.push({ field, text });
  if (!q.stem) add('stem', 'Type the question.');
  if (q.stem.length > LIMITS.stem) add('stem', 'The question is too long.');
  q.options.forEach((o, i) => { if (o.length > LIMITS.option) add('opt' + i, `Choice ${LETTERS[i]} is too long.`); });
  if (q.explain.length > LIMITS.explain) add('explain', 'The explanation is too long.');
  if (q.image.length > LIMITS.image) add('image', 'The picture is too big. Try a smaller one.');
  if (q.image && !/^data:image\/(jpeg|png|webp|gif);base64,/.test(q.image)) add('image', 'The picture is not a usable image.');
  if (forStatus === 'active') {
    q.options.forEach((o, i) => { if (!o) add('opt' + i, `Fill in choice ${LETTERS[i]}.`); });
    const seen = new Map();
    q.options.forEach((o, i) => { if (o) { const k = o.toLowerCase(); if (seen.has(k)) add('opt' + i, `Choices ${LETTERS[seen.get(k)]} and ${LETTERS[i]} are the same.`); else seen.set(k, i); } });
    if (q.answer < 0) add('answer', 'Pick the correct answer.');
  }
  return out;
}

// Can a question go into a test?
export const isUsable = q => q.status === 'active' && problems(q, 'active').length === 0;

// ---- drawing and marking a test ----

export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// The questions for one sitting (settings.count of them, 20 by default):
//  1. every must-ask question that is ready (if there are more than fit, a random few of them);
//  2. settings.hardCount hard questions (fewer if the bank has fewer), chosen at random;
//  3. the rest at random from the standard questions (leftover hard ones only if standard ones run out).
// Then shuffled, so must-ask and hard questions are mixed in. Only active, complete questions are used.
export function drawTest(questions, settings, rng = Math.random) {
  const count = Math.max(1, settings.count | 0);
  const hardWanted = Math.max(0, (settings.hardCount ?? DEFAULT_SETTINGS.hardCount) | 0);
  const pool = questions.map(cleanQuestion).filter(isUsable);
  const must = shuffle(pool.filter(q => q.must), rng).slice(0, count);
  const rest = pool.filter(q => !q.must);
  const hard = shuffle(rest.filter(q => q.level === 'hard'), rng);
  const std = shuffle(rest.filter(q => q.level !== 'hard'), rng);
  let slots = count - must.length;
  const hardHave = must.filter(q => q.level === 'hard').length;
  const takeHard = Math.min(Math.max(hardWanted - hardHave, 0), hard.length, slots);
  const pickedHard = hard.slice(0, takeHard); slots -= takeHard;
  const fromStd = std.slice(0, slots); slots -= fromStd.length;
  const extra = hard.slice(takeHard, takeHard + slots);
  return shuffle([...must, ...pickedHard, ...fromStd, ...extra], rng).map(q => ({
    qid: q.id, stem: q.stem, options: q.options, answer: q.answer, topic: q.topic, explain: q.explain, image: q.image, picked: null,
  }));
}

// What a test would be made of, for the faculty pages: { ready, must, hard, mustFit, hardShort }
export function bankSummary(questions, settings) {
  const pool = questions.map(cleanQuestion).filter(isUsable);
  const count = Math.max(1, settings.count | 0), hardWanted = Math.max(0, (settings.hardCount ?? DEFAULT_SETTINGS.hardCount) | 0);
  const hard = pool.filter(q => !q.must && q.level === 'hard').length;
  return { ready: pool.length, must: pool.filter(q => q.must).length, hard, mustFit: pool.filter(q => q.must).length <= count, hardShort: Math.max(0, hardWanted - hard), short: Math.max(0, count - pool.length) };
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

// Per-question results across attempts, hardest first. Only questions that appeared in an attempt.
export function questionStats(attempts) {
  const m = new Map();
  for (const a of attempts) for (const it of a.items || []) {
    const s = m.get(it.qid) || { qid: it.qid, stem: it.stem, topic: it.topic, n: 0, right: 0, skipped: 0, picks: [0, 0, 0, 0], answer: it.answer };
    s.n++; s.stem = it.stem; s.answer = it.answer;
    if (it.picked === it.answer) s.right++;
    if (it.picked == null) s.skipped++; else s.picks[it.picked]++;
    m.set(it.qid, s);
  }
  return [...m.values()].map(s => ({ ...s, pct: Math.round(s.right / s.n * 100) })).sort((a, b) => a.pct - b.pct || b.n - a.n);
}

// ---- pasting many questions (from Word, an email, a chat) ----
// Accepts:  Q1 stem...  /  1. stem...  then  (A) ...  A) ...  A. ...  lines, optional  "Answer: B"  and  "Explanation: ..."
// -> { questions:[{stem,options,answer(-1 if not given),explain}], warnings:[text] }
export function parsePaste(text) {
  const lines = str(text).replace(/\r\n?/g, '\n').replace(/ /g, ' ').split('\n');
  // "Q1 ...", "Q 16 ...", "Question 3: ..." or "3. ..." / "3) ..." (a bare "3 mg" or "2.5 cm" is not a question number)
  const startRe = /^\s*(?:q(?:uestion)?\s*(\d{1,3})\s*[\.\):\-]?\s+|(\d{1,3})[\.\)]\s+)(?=\S)/i;
  const optRe = /^\s*\(?([A-Da-d])[\)\.]\s*(.*)$/;
  const ansRe = /^\s*(?:correct\s+)?(?:answer|ans|key)\s*[:\-=]?\s*\(?([A-Da-d])\)?\b/i;
  const expRe = /^\s*(?:explanation|rationale|why|note)s?\s*[:\-]\s*(.*)$/i;
  const blocks = [];
  let cur = null, target = null;
  for (let raw of lines) {
    if (!raw.trim()) { if (cur && target === 'stem') cur.stem.push(''); continue; }
    let line = raw;
    const start = startRe.exec(line);
    if (start && !optRe.test(line) && !ansRe.test(line)) {
      cur = { n: start[1] || start[2], stem: [line.slice(start[0].length)], opts: ['', '', '', ''], answer: -1, explain: [] };
      blocks.push(cur); target = 'stem'; continue;
    }
    if (!cur) continue;
    let m = ansRe.exec(line);
    if (m) { cur.answer = 'ABCD'.indexOf(m[1].toUpperCase()); target = null; continue; }
    m = expRe.exec(line);
    if (m) { cur.explain.push(m[1]); target = 'explain'; continue; }
    // several choices on one line: "(A) x(B) y (C) z"
    if (/^\s*\([Aa]\)/.test(line) && /\([Bb]\)/.test(line)) {
      for (const p of line.split(/(?=\([A-Da-d]\))/).filter(x => x.trim())) { const o = optRe.exec(p); if (o) cur.opts['ABCD'.indexOf(o[1].toUpperCase())] = o[2].trim(); }
      target = null; continue;
    }
    m = optRe.exec(line);
    if (m) { const i = 'ABCD'.indexOf(m[1].toUpperCase()); cur.opts[i] = m[2].trim(); target = 'opt' + i; continue; }
    if (target === 'stem') cur.stem.push(line.trim());
    else if (target === 'explain') cur.explain.push(line.trim());
    else if (target && target.startsWith('opt')) { const i = +target[3]; cur.opts[i] = (cur.opts[i] + ' ' + line.trim()).trim(); }
  }
  const warnings = [];
  const questions = blocks.map(b => {
    let opts = b.opts, ans = b.answer, stemLines = b.stem.filter((l, i, a) => l || (i && i < a.length - 1));
    // choices pasted without their letters: the last 4 lines of the question text
    if (!opts.some(Boolean) && stemLines.length >= 5) { opts = stemLines.slice(-4); stemLines = stemLines.slice(0, -4); warnings.push(`Question ${b.n}: the choices had no letters, so I took the last 4 lines as A to D. Check them.`); }
    else if (!opts.every(Boolean)) warnings.push(`Question ${b.n}: I could not find all four choices (A to D). Add them after pasting.`);
    if (ans < 0) warnings.push(`Question ${b.n}: no answer given (write "Answer: B" under it). It will be saved as a draft.`);
    return { stem: tidy(stemLines.join('\n')), options: opts.map(tidy), answer: ans, explain: tidy(b.explain.join('\n')) };
  });
  if (!questions.length) warnings.push('I could not find any questions. Each one should start with "Q1", "1." or similar, followed by choices that start with A), B), C), D).');
  return { questions, warnings };
}

// ---- CSV (opens in Excel and Google Sheets) ----

export function csvCell(v) { const s = str(v); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }

// Spreadsheets treat a cell starting with = + - @ as a formula; a leading apostrophe-free guard: prefix a tab-less space is wrong, so quote with a leading ' only for these.
const safe = v => (/^[=+\-@]/.test(str(v)) ? "'" + str(v) : str(v));
const unsafe = v => (/^'[=+\-@]/.test(str(v)) ? str(v).slice(1) : str(v));

export const QUESTION_COLUMNS = ['id', 'status', 'topic', 'question', 'A', 'B', 'C', 'D', 'answer', 'explanation', 'must-ask', 'difficulty'];

export function questionsToCSV(questions) {
  const rows = [QUESTION_COLUMNS];
  for (const q0 of questions) {
    const q = cleanQuestion(q0);
    rows.push([q.id, q.status, q.topic, q.stem, ...q.options, q.answer >= 0 ? LETTERS[q.answer] : '', q.explain, q.must ? 'yes' : '', q.level].map(safe));
  }
  return '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

export function parseCSV(text) {
  const s = str(text).replace(/^﻿/, '');
  const rows = []; let row = [], cell = '', inQ = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else inQ = false; } else cell += c;
    } else if (c === '"' && cell === '') inQ = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cell); cell = ''; if (row.some(x => x !== '')) rows.push(row); row = []; }
    else cell += c;
  }
  row.push(cell); if (row.some(x => x !== '')) rows.push(row);
  return rows;
}

// -> { questions:[{...cleanQuestion fields, existing:bool}], warnings }
export function questionsFromCSV(text) {
  const rows = parseCSV(text);
  const warnings = [];
  if (rows.length < 2) return { questions: [], warnings: ['The file has no rows.'] };
  const head = rows[0].map(h => h.trim().toLowerCase());
  const col = (...names) => head.findIndex(h => names.includes(h));
  const ix = { id: col('id'), status: col('status'), topic: col('topic'), stem: col('question', 'stem'), A: col('a'), B: col('b'), C: col('c'), D: col('d'), answer: col('answer', 'correct'), explain: col('explanation', 'explain'), must: col('must-ask', 'must', 'must ask'), level: col('difficulty', 'level') };
  if (ix.stem < 0 || ix.A < 0 || ix.D < 0) return { questions: [], warnings: ['I could not find the columns. The first row should have: question, A, B, C, D, answer (and optionally id, status, topic, explanation).'] };
  const get = (r, i) => (i < 0 ? '' : unsafe(r[i] ?? ''));
  const questions = rows.slice(1).map((r, n) => {
    const a = get(r, ix.answer).trim().toUpperCase().replace(/[^A-D]/g, '').slice(0, 1);
    const status = get(r, ix.status).trim().toLowerCase();
    const q = cleanQuestion({
      id: get(r, ix.id).trim(), stem: get(r, ix.stem), options: [get(r, ix.A), get(r, ix.B), get(r, ix.C), get(r, ix.D)],
      answer: a ? 'ABCD'.indexOf(a) : -1, explain: get(r, ix.explain), topic: get(r, ix.topic),
      status: STATUSES.includes(status) ? status : 'draft',
      must: /^(y|yes|true|1|x|must)/i.test(get(r, ix.must).trim()),
      level: /^h/i.test(get(r, ix.level).trim()) ? 'hard' : 'standard',
    });
    if (status && !STATUSES.includes(status)) warnings.push(`Row ${n + 2}: status "${status}" is not draft, active or archived; saved as draft.`);
    if (q.status === 'active' && problems(q, 'active').length) { warnings.push(`Row ${n + 2}: not complete, so saved as a draft.`); q.status = 'draft'; }
    return q;
  }).filter(q => q.stem);
  return { questions, warnings };
}

export function attemptsToCSV(attempts) {
  const rows = [['name', 'cohort', 'submitted', 'score', 'out of', 'percent', 'result', 'minutes taken']];
  for (const a of attempts) {
    const s = summarise(a);
    rows.push([a.name, a.cohort || '', a.submittedAt ? new Date(a.submittedAt).toISOString().slice(0, 16).replace('T', ' ') : '', s.score, s.total, s.pct, s.pass ? 'Pass' : 'Not yet', a.durationSec != null ? Math.round(a.durationSec / 6) / 10 : '']);
  }
  return '﻿' + rows.map(r => r.map(v => csvCell(safe(v))).join(',')).join('\r\n') + '\r\n';
}

// ---- whole-bank backup (JSON) ----
export function bankToJSON(questions, settings) {
  return JSON.stringify({ kind: 'baby-mo-bank', version: 1, exportedAt: new Date().toISOString(), settings: settings || null, questions: questions.map(cleanQuestion) }, null, 1);
}
export function bankFromJSON(text) {
  let o; try { o = JSON.parse(text); } catch { throw new Error('That is not a backup file (it could not be read).'); }
  if (!o || o.kind !== 'baby-mo-bank' || !Array.isArray(o.questions)) throw new Error('That file is not a Baby MO question backup.');
  return { questions: o.questions.map(cleanQuestion).filter(q => q.stem), settings: o.settings || null };
}

// What would importing change? existing = ids already in the bank.
export function planImport(incoming, existing) {
  const have = new Set(existing.map(q => q.id));
  return { add: incoming.filter(q => !q.id || !have.has(q.id)), update: incoming.filter(q => q.id && have.has(q.id)) };
}

export function fmtDate(ms) {
  if (!ms) return '';
  return new Date(ms).toLocaleString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
}

// Near-duplicate check for faculty adding a question that's already there.
export function similar(q, bank, skipId) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const a = new Set(norm(q.stem).split(' ').filter(w => w.length > 3));
  if (a.size < 4) return null;
  for (const o of bank) {
    if (o.id === skipId) continue;
    const b = new Set(norm(o.stem).split(' ').filter(w => w.length > 3));
    let hit = 0; for (const w of a) if (b.has(w)) hit++;
    if (hit / Math.max(a.size, b.size) > 0.8) return o;
  }
  return null;
}
