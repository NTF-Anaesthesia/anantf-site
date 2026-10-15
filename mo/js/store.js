// Progress kept on this phone only (localStorage): topics read, checklist ticks, check-yourself answers, flashcard boxes,
// scenario results. The patient's weight is kept for this browser tab only (sessionStorage) and forgotten after 6 hours,
// so yesterday's patient is never used for today's doses.

const KEY = 'mo-guide:v1';
const PKEY = 'mo-guide:patient';
const PATIENT_TTL = 6 * 60 * 60 * 1000;

const blank = () => ({ read: {}, checks: {}, quiz: {}, cards: {}, scen: {}, last: null });
let S = load();

function load() {
  try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch { return blank(); }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* private mode or full: progress just isn't kept */ }
}
const today = () => new Date().toISOString().slice(0, 10);

export const progress = () => S;

export function markRead(key, on = true) {
  if (on) S.read[key] = today(); else delete S.read[key];
  save();
}
export const isRead = key => !!S.read[key];

export function setLast(route, title) { S.last = { route, title, at: Date.now() }; save(); }

export function getChecks(id) { return S.checks[id] || []; }
export function setCheck(id, i, on) {
  const set = new Set(S.checks[id] || []);
  if (on) set.add(i); else set.delete(i);
  S.checks[id] = [...set].sort((a, b) => a - b);
  if (!S.checks[id].length) delete S.checks[id];
  save();
}

/** Record a check-yourself answer: key = `${quizId}:${index}`. */
export function setQuiz(key, correct) { S.quiz[key] = { ok: !!correct, at: today() }; save(); }
export const getQuiz = key => S.quiz[key] || null;

/** Flashcards: Leitner boxes 1–5. Box n is due again after INTERVALS[n] days. */
export const INTERVALS = [0, 0, 1, 3, 7, 16];
export function getCard(id) { return S.cards[id] || null; }
export function gradeCard(id, knew) {
  const c = S.cards[id] || { box: 1 };
  const box = knew ? Math.min(5, (c.box || 1) + 1) : 1;
  const due = new Date(); due.setDate(due.getDate() + INTERVALS[box]);
  S.cards[id] = { box, due: due.toISOString().slice(0, 10) };
  save();
  return S.cards[id];
}
export const isDue = id => { const c = S.cards[id]; return !c || c.due <= today(); };

export function setScenario(id, result) {
  const old = S.scen[id];
  S.scen[id] = { ...result, at: today(), best: Math.max(result.score ?? 0, old?.best ?? 0), runs: (old?.runs || 0) + 1 };
  save();
}
export const getScenario = id => S.scen[id] || null;

export function resetAll() { S = blank(); save(); }

// ---------------------------------------------------------------- the patient (this tab only)
let P = loadPatient();
function loadPatient() {
  try {
    const p = JSON.parse(sessionStorage.getItem(PKEY) || 'null');
    if (p && Date.now() - p.at < PATIENT_TTL) return p;
  } catch { /* blocked */ }
  return { weight: null, height: null, sex: null, at: 0 };
}
export const patient = () => P;
export function setPatient(p) {
  P = { weight: p.weight ?? null, height: p.height ?? null, sex: p.sex ?? null, at: Date.now() };
  try { sessionStorage.setItem(PKEY, JSON.stringify(P)); } catch { /* blocked */ }
  window.dispatchEvent(new CustomEvent('patientchange'));
}
export function clearPatient() { setPatient({}); }
