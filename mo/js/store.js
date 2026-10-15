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
// Change progress: read the latest copy first, so two tabs (or the installed app and a browser tab) don't overwrite each other.
function change(fn) { S = load(); fn(S); save(); }
// the phone's own calendar date (not UTC), so "due today" turns over at local midnight
const localDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => localDate(new Date());
if (typeof window !== 'undefined') window.addEventListener('storage', e => { if (e.key === KEY) S = load(); });

export const progress = () => S;

export function markRead(key, on = true) {
  change(S => { if (on) S.read[key] = today(); else delete S.read[key]; });
}
export const isRead = key => !!S.read[key];

export function setLast(route, title) { change(S => { S.last = { route, title, at: Date.now() }; }); }

export function getChecks(id) { return S.checks[id] || []; }
export function setCheck(id, i, on) {
  change(S => {
    const set = new Set(S.checks[id] || []);
    if (on) set.add(i); else set.delete(i);
    S.checks[id] = [...set].sort((a, b) => a - b);
    if (!S.checks[id].length) delete S.checks[id];
  });
}

/** Record a check-yourself answer: key = `${quizId}:${index}`. */
export function setQuiz(key, correct) { change(S => { S.quiz[key] = { ok: !!correct, at: today() }; }); }
export const getQuiz = key => S.quiz[key] || null;

/** Flashcards: Leitner boxes 1–5. A card in box n is due again INTERVALS[n] days later (a missed card goes back to box 1: tomorrow). */
export const INTERVALS = [0, 1, 2, 4, 8, 16];
export function getCard(id) { return S.cards[id] || null; }
export function gradeCard(id, knew) {
  let out;
  change(S => {
    const c = S.cards[id] || { box: 1 };
    const box = knew ? Math.min(5, (c.box || 1) + 1) : 1;
    const due = new Date(); due.setDate(due.getDate() + INTERVALS[box]);
    out = S.cards[id] = { box, due: localDate(due) };
  });
  return out;
}
export const isDue = id => { const c = S.cards[id]; return !c || c.due <= today(); };

export function setScenario(id, result) {
  change(S => {
    const old = S.scen[id];
    S.scen[id] = { ...result, at: today(), best: Math.max(result.score ?? 0, old?.best ?? 0), runs: (old?.runs || 0) + 1 };
  });
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
const expired = p => p.at && Date.now() - p.at >= PATIENT_TTL;
/** The patient now; a weight older than 6 hours is forgotten here, on every read, even if the app stayed open. */
export function patient() {
  if (expired(P)) {
    P = { weight: null, height: null, sex: null, at: 0 };
    try { sessionStorage.removeItem(PKEY); } catch { /* blocked */ }
  }
  return P;
}
/** True if a weight was set but is now too old (the screen showing it should redraw). */
export const patientExpired = () => !!expired(P);
export function setPatient(p) {
  P = { weight: p.weight ?? null, height: p.height ?? null, sex: p.sex ?? null, at: Date.now() };
  try { sessionStorage.setItem(PKEY, JSON.stringify(P)); } catch { /* blocked */ }
  window.dispatchEvent(new CustomEvent('patientchange'));
}
export function clearPatient() { setPatient({}); }
