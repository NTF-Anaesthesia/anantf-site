// The NTF question bank: one format for every quiz on anantf.com. Pure logic (no page, no network) so the apps, the
// tools in qbank/tools and the Node tests all share it. Format and rules: qbank/NOTES.md.
//
// Bank file (qbank/bank/questions.json):
//   { kind: 'ntf-qbank', version: 1, questions: [Question] }
// Question:
//   { id, stem, options: [2-6 strings], answer: index, explain, topics: [..], level: 'standard'|'hard',
//     status: 'draft'|'active'|'archived', image: '' | 'img/<file>', source, review, updated: 'YYYY-MM-DD' }
//   - id never changes and is never reused (ids are how papers, results and imports find a question).
//   - status: draft = still being written or checked (never given to learners); active = ready; archived = retired.
//   - review: open notes for the checker ("answer key doubtful because ..."); empty once checked.
// Paper (qbank/papers/<id>.json): which questions one test uses, see resolvePaper().

export const KIND = 'ntf-qbank';
export const STATUSES = ['draft', 'active', 'archived'];
export const STATUS_LABEL = { draft: 'Draft', active: 'Ready', archived: 'Archived' };
export const LEVELS = ['standard', 'hard'];
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const MIN_OPTIONS = 2, MAX_OPTIONS = 6;
export const LIMITS = { stem: 3000, option: 500, explain: 4000, topic: 60, review: 2000, source: 200 };
export const REPO = 'NTF-Anaesthesia/anantf-site';

const str = v => (v == null ? '' : String(v));
const tidy = s => str(s).replace(/\r\n?/g, '\n').replace(/[ \t]+\n/g, '\n').trim();

// A short id from text, the same every time for the same text (used once, when a question first enters the bank).
export function idFor(text, taken = new Set()) {
  let h = 2166136261 >>> 0;
  for (const c of str(text)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619) >>> 0; }
  let id = 'q' + h.toString(36).padStart(7, '0').slice(0, 7);
  for (let n = 2; taken.has(id); n++) id = 'q' + (h + n).toString(36).padStart(7, '0').slice(0, 7);
  return id;
}

export function splitTopics(v) {
  const out = [], seen = new Set();
  for (const raw of (Array.isArray(v) ? v : str(v).split(';'))) {
    const t = str(raw).replace(/\s+/g, ' ').trim().slice(0, LIMITS.topic);
    if (t && !seen.has(t.toLowerCase())) { seen.add(t.toLowerCase()); out.push(t); }
  }
  return out;
}

// Every field present and tidy, whatever came in (a CSV row, an older format, a half-filled form).
export function clean(q = {}) {
  const options = (Array.isArray(q.options) ? q.options : []).map(tidy);
  while (options.length > MIN_OPTIONS && !options[options.length - 1]) options.pop();   // trailing blanks
  const ans = Number.isInteger(q.answer) ? q.answer : /^[A-Fa-f]$/.test(str(q.answer).trim()) ? LETTERS.indexOf(str(q.answer).trim().toUpperCase()) : parseInt(q.answer, 10);
  return {
    id: str(q.id).trim(),
    stem: tidy(q.stem),
    options,
    answer: Number.isInteger(ans) && ans >= 0 && ans < options.length ? ans : -1,
    explain: tidy(q.explain),
    topics: splitTopics(q.topics ?? q.topic),
    level: LEVELS.includes(q.level) ? q.level : 'standard',
    status: STATUSES.includes(q.status) ? q.status : 'draft',
    image: str(q.image).trim(),
    source: tidy(q.source).slice(0, LIMITS.source),
    review: tidy(q.review),
    updated: /^\d{4}-\d{2}-\d{2}$/.test(str(q.updated)) ? str(q.updated) : '',
  };
}

// Plain-English problems with one question. Drafts only need some text; ready questions must be complete.
export function problems(q, forStatus = q.status) {
  const out = [], add = (field, text) => out.push({ field, text });
  if (!q.id) add('id', 'No id.');
  else if (!/^[a-z0-9][a-z0-9-]{2,40}$/.test(q.id)) add('id', `The id "${q.id}" should be lower-case letters, digits and dashes.`);
  if (!q.stem) add('stem', 'Type the question.');
  if (q.stem.length > LIMITS.stem) add('stem', 'The question is too long.');
  if (q.explain.length > LIMITS.explain) add('explain', 'The explanation is too long.');
  if (q.options.length > MAX_OPTIONS) add('options', `At most ${MAX_OPTIONS} choices.`);
  q.options.forEach((o, i) => { if (o.length > LIMITS.option) add('opt' + i, `Choice ${LETTERS[i]} is too long.`); });
  if (q.image && !/^img\/[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|svg)$/.test(q.image)) add('image', 'A picture is a file in qbank/img/, written as img/<file>.');
  if (forStatus === 'active') {
    if (q.options.length < MIN_OPTIONS) add('options', `At least ${MIN_OPTIONS} choices.`);
    q.options.forEach((o, i) => { if (!o) add('opt' + i, `Fill in choice ${LETTERS[i]}.`); });
    const seen = new Map();
    q.options.forEach((o, i) => { const k = o.toLowerCase(); if (o && seen.has(k)) add('opt' + i, `Choices ${LETTERS[seen.get(k)]} and ${LETTERS[i]} are the same.`); else seen.set(k, i); });
    if (q.answer < 0) add('answer', 'Pick the correct answer.');
  }
  return out;
}
export const isReady = q => q.status === 'active' && problems(q, 'active').length === 0;

// Two questions that are probably the same one (copied, or reworded at the end). Short stems must match exactly.
const stemKey = s => str(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function sameQuestion(a, b) {
  const x = stemKey(a.stem), y = stemKey(b.stem);
  if (!x || !y) return false;
  if (x === y) return true;
  if (Math.min(x.length, y.length) < 25) return false;
  return x.startsWith(y) || y.startsWith(x) || x.slice(0, 60) === y.slice(0, 60);
}

// Check a whole bank: -> { errors: [text], warnings: [text], questions: [clean] }. Errors must be fixed before merging.
export function checkBank(bank) {
  const errors = [], warnings = [];
  if (!bank || bank.kind !== KIND || !Array.isArray(bank.questions)) return { errors: ['Not a question bank file (kind "ntf-qbank" with a questions list).'], warnings, questions: [] };
  const questions = bank.questions.map(clean), ids = new Map();
  questions.forEach((q, i) => {
    const where = `${q.id || '#' + (i + 1)}`;
    if (q.id && ids.has(q.id)) errors.push(`${where}: the id is used twice.`); else ids.set(q.id, i);
    for (const p of problems(q)) (q.status === 'active' || p.field === 'id' ? errors : warnings).push(`${where}: ${p.text}`);
    if (q.status === 'active' && q.review) warnings.push(`${where}: ready but still has review notes.`);
  });
  for (let i = 0; i < questions.length; i++) for (let j = i + 1; j < questions.length; j++) {
    if (questions[i].status !== 'archived' && questions[j].status !== 'archived' && sameQuestion(questions[i], questions[j])) errors.push(`${questions[i].id} and ${questions[j].id} look like the same question.`);
  }
  return { errors, warnings, questions };
}

// ---- papers: one test made from the bank ----
// { id, title, questions: [ids] | 'all', topics: [..] (optional filter), must: [ids], hard: [ids] (optional; else the
//   question's own level), count, passMark, minutes, maxAttempts, hardCount }
export const PAPER_DEFAULTS = { count: 20, passMark: 80, minutes: 20, maxAttempts: 2, hardCount: 4 };

// The paper's questions, ready to draw from: [{ ...question, must, level }] (only ready ones), plus problems found.
export function resolvePaper(paper, bankQuestions) {
  const byId = new Map(bankQuestions.map(q => [q.id, clean(q)]));
  const errors = [];
  const ids = paper.questions === 'all' || !paper.questions ? [...byId.keys()] : paper.questions;
  for (const list of ['questions', 'must', 'hard']) for (const id of (Array.isArray(paper[list]) ? paper[list] : [])) if (!byId.has(id)) errors.push(`${paper.id}: ${list} lists "${id}", which is not in the bank.`);
  const must = new Set(paper.must || []), hard = Array.isArray(paper.hard) ? new Set(paper.hard) : null;
  const topics = (paper.topics || []).map(t => t.toLowerCase());
  const pool = ids.map(id => byId.get(id)).filter(Boolean)
    .filter(q => !topics.length || q.topics.some(t => topics.includes(t.toLowerCase())))
    .map(q => ({ ...q, must: must.has(q.id), level: hard ? (hard.has(q.id) ? 'hard' : 'standard') : q.level }));
  return { pool: pool.filter(isReady), all: pool, settings: { ...PAPER_DEFAULTS, ...pick(paper, Object.keys(PAPER_DEFAULTS)) }, errors };
}
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] != null).map(k => [k, o[k]]));

// ---- suggesting a change (faculty without a GitHub account can copy the text instead) ----
export function suggestionText(q, change, name) {
  const lines = [`Suggested by: ${str(name).trim() || '(no name given)'}`, `Question: ${q.id}`, '', `Was: ${q.stem}`];
  q.options.forEach((o, i) => lines.push(`  ${LETTERS[i]}. ${o}${i === q.answer ? '  (answer)' : ''}`));
  lines.push('', 'Change:', tidy(change.comment) || '(no comment)');
  if (change.question) {
    const n = clean({ ...q, ...change.question });
    lines.push('', `New: ${n.stem}`);
    n.options.forEach((o, i) => lines.push(`  ${LETTERS[i]}. ${o}${i === n.answer ? '  (answer)' : ''}`));
    if (n.explain !== q.explain) lines.push(`Explanation: ${n.explain}`);
  }
  return lines.join('\n');
}
export function suggestionIssueUrl(q, change, name) {
  const title = `Question edit: ${q.id} (${str(name).trim() || 'faculty'})`;
  return `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(suggestionText(q, change, name))}`;
}

// ---- spreadsheet round trip (Google Sheets / Excel): one row per question ----
export const COLUMNS = ['id', 'status', 'topics', 'level', 'question', 'A', 'B', 'C', 'D', 'E', 'F', 'answer', 'explanation', 'source', 'review'];
const cell = v => { const s = str(v); return /[",\n\r]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""')}"` : s; };
export function toCSV(questions) {
  const rows = [COLUMNS.join(',')];
  for (const q of questions.map(clean)) rows.push([q.id, q.status, q.topics.join('; '), q.level, q.stem, ...LETTERS.map((_, i) => q.options[i] ?? ''), q.answer >= 0 ? LETTERS[q.answer] : '', q.explain, q.source, q.review].map(cell).join(','));
  return rows.join('\r\n') + '\r\n';
}
export function parseCSV(text) {
  const rows = []; let row = [], f = '', q = false;
  const s = str(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(f); rows.push(row); row = []; f = ''; }
    else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
// rows -> questions in bank format (a leading ' that guarded a formula is dropped)
export function fromCSV(text) {
  const [head, ...rows] = parseCSV(text);
  if (!head) return [];
  const col = name => head.findIndex(h => h.trim().toLowerCase() === name.toLowerCase());
  const get = (r, name) => { const i = col(name); return i < 0 ? '' : str(r[i]).replace(/^'(?=[=+\-@])/, ''); };
  return rows.map(r => clean({
    id: get(r, 'id'), status: get(r, 'status'), topics: get(r, 'topics'), level: get(r, 'level'), stem: get(r, 'question'),
    options: LETTERS.map(l => get(r, l)), answer: get(r, 'answer'), explain: get(r, 'explanation'), source: get(r, 'source'), review: get(r, 'review'),
  }));
}

// Merge edited rows back into the bank by id. New rows (no id) get one. -> { questions, added, changed, unchanged }
export function mergeById(bankQuestions, incoming, today = '') {
  const out = bankQuestions.map(clean), byId = new Map(out.map((q, i) => [q.id, i])), taken = new Set(byId.keys());
  let added = 0, changed = 0, unchanged = 0;
  for (const raw of incoming) {
    const q = clean(raw);
    if (!q.stem) continue;
    if (q.id && byId.has(q.id)) {
      const old = out[byId.get(q.id)], next = { ...q, image: q.image || old.image, updated: old.updated };
      if (JSON.stringify(next) === JSON.stringify(old)) { unchanged++; continue; }
      out[byId.get(q.id)] = { ...next, updated: today || old.updated }; changed++;
    } else {
      const id = q.id || idFor(q.stem, taken); taken.add(id);
      out.push({ ...q, id, updated: today }); byId.set(id, out.length - 1); added++;
    }
  }
  return { questions: out, added, changed, unchanged };
}

export const bankJSON = questions => JSON.stringify({ kind: KIND, version: 1, questions: questions.map(clean) }, null, 1) + '\n';

// ---- drawing and searching (shared by the qbank app and the Baby MO test) ----
export function shuffle(list, rng = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// One sitting of a paper, from resolvePaper(...).pool and .settings:
//  1. every must-ask question (a random few if there are more than fit);
//  2. settings.hardCount hard ones (fewer if the paper has fewer);
//  3. the rest at random from the standard ones (leftover hard ones only if standard ones run out).
// Then shuffled, so must-ask and hard questions are mixed in. Questions keep their own choice order.
export function drawPaper(pool, settings = PAPER_DEFAULTS, rng = Math.random) {
  const count = Math.max(1, (settings.count ?? PAPER_DEFAULTS.count) | 0);
  const hardWanted = Math.max(0, (settings.hardCount ?? PAPER_DEFAULTS.hardCount) | 0);
  const must = shuffle(pool.filter(q => q.must), rng).slice(0, count);
  const rest = pool.filter(q => !q.must);
  const hard = shuffle(rest.filter(q => q.level === 'hard'), rng);
  const std = shuffle(rest.filter(q => q.level !== 'hard'), rng);
  let slots = count - must.length;
  const hardHave = must.filter(q => q.level === 'hard').length;
  const takeHard = Math.min(Math.max(hardWanted - hardHave, 0), hard.length, slots);
  const picked = hard.slice(0, takeHard); slots -= takeHard;
  const fromStd = std.slice(0, slots); slots -= fromStd.length;
  return shuffle([...must, ...picked, ...fromStd, ...hard.slice(takeHard, takeHard + slots)], rng);
}

// Does a question match a search? Every word must appear somewhere in the stem, choices, explanation or topics.
const fold = s => str(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
export function matchesQuery(q, query) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = fold([q.stem, ...(q.options || []), q.explain, ...(q.topics || [])].join('\n'));
  return words.every(w => hay.includes(w));
}

// The questions a learner may see: ready ones only (never drafts or archived), from the bank and any extra sources.
// A later list never replaces an id already taken.
export function readyQuestions(...lists) {
  const seen = new Set(), out = [];
  for (const list of lists) for (const raw of list || []) {
    const q = clean(raw);
    if (!q.id || seen.has(q.id) || !isReady(q)) continue;
    seen.add(q.id); out.push(q);
  }
  return out;
}
