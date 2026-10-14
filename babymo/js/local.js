// Local mode: the same interface as cloud.js, but everything lives in this browser (localStorage). Used for the demo
// (?demo) and whenever firebase-config.js has no project yet. Nothing here is shared between devices.

import { DEFAULT_SETTINGS, cleanQuestion, newId } from './logic.js';

export const enabled = false;
const KEY = 'mo-local-v1', SESSION = 'mo-local-session', FACULTY = 'mo-local-faculty';
const memory = {};   // fallback when storage is blocked (private window)
const read = k => { try { return localStorage.getItem(k); } catch { return memory[k] ?? null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { memory[k] = v; } };
const drop = k => { try { localStorage.removeItem(k); } catch { delete memory[k]; } };
const fail = (code, msg) => Object.assign(new Error(msg || code), { code });

const SAMPLE = [
  ['Airway', 'Which drug is the first-line treatment for anaphylaxis?', ['Adrenaline', 'Hydrocortisone', 'Chlorphenamine', 'Salbutamol'], 0, 'Adrenaline first, in all anaphylaxis; the others are adjuncts.'],
  ['Monitoring', 'What is the normal range of arterial blood pH?', ['7.15 to 7.25', '7.25 to 7.35', '7.35 to 7.45', '7.45 to 7.55'], 2, ''],
  ['Airway', 'Which finding is the most reliable confirmation that a tracheal tube is in the trachea?', ['Misting in the tube', 'Equal chest movement', 'A sustained end-tidal CO2 trace', 'Absence of gastric sounds'], 2, 'A continuous capnography waveform.'],
  ['Regional', 'What is the usual maximum dose of plain lignocaine for local infiltration?', ['1 mg/kg', '3 mg/kg', '7 mg/kg', '10 mg/kg'], 1, 'Plain lignocaine 3 mg/kg (7 mg/kg with adrenaline).'],
  ['Monitoring', 'Which is NOT part of standard monitoring for a general anaesthetic?', ['ECG', 'Pulse oximetry', 'Capnography', 'Central venous pressure'], 3, ''],
  ['Drugs', 'Sugammadex reverses neuromuscular blockade from which drug?', ['Suxamethonium', 'Atracurium', 'Rocuronium', 'Mivacurium'], 2, 'It encapsulates rocuronium (and vecuronium).'],
];

function load() {
  let d = null;
  try { d = JSON.parse(read(KEY) || 'null'); } catch { d = null; }
  if (!d || typeof d !== 'object') {
    d = { questions: [], attempts: [], settings: { ...DEFAULT_SETTINGS, count: 5, minutes: 5 }, passphrase: 'demo', members: [{ email: 'demo@example.com', role: 'admin', name: 'Demo faculty' }], history: {} };
    d.questions = SAMPLE.map(([topic, stem, options, answer, explain], i) => cleanQuestion({ id: 's' + (i + 1), topic, stem, options, answer, explain, status: 'active', rev: 1, updatedAt: Date.now(), updatedBy: { email: 'demo@example.com', name: 'Sample' } }));
    save(d);
  }
  return d;
}
const save = d => write(KEY, JSON.stringify(d));
const clone = o => JSON.parse(JSON.stringify(o));

// ---- sign-in ----
let listeners = [];
const facultyUser = () => (read(FACULTY) === '1' ? { uid: 'demo-faculty', email: 'demo@example.com', anonymous: false, name: 'Demo faculty' } : null);
export async function watchUser(cb) { listeners.push(cb); cb(facultyUser()); }
export async function facultySignIn() { write(FACULTY, '1'); listeners.forEach(f => f(facultyUser())); }
export async function signOut() { drop(FACULTY); drop(SESSION); listeners.forEach(f => f(null)); }
export async function memberRole(email) { const m = load().members.find(x => x.email === String(email).toLowerCase()); return m ? m.role : null; }

// ---- MO session ----
export async function startSession(name, passphrase) {
  if (String(passphrase).trim() !== load().passphrase) throw fail('bad-passphrase');
  write(SESSION, JSON.stringify({ name, at: Date.now() }));
}
export async function hasSession() { return !!read(SESSION); }

// ---- settings ----
export async function getSettings() { return clone(load().settings); }
export async function saveSettings(s, user) { const d = load(); d.settings = { ...s, updatedAt: Date.now(), updatedBy: user ? { email: user.email, name: user.name } : null }; save(d); }
export async function getPassphrase() { return load().passphrase; }
export async function setPassphrase(p) { const d = load(); d.passphrase = String(p); save(d); }

// ---- questions ----
export async function listQuestions({ activeOnly = false } = {}) {
  return clone(load().questions).filter(q => !activeOnly || q.status === 'active');
}
export async function saveQuestion(q, user) {
  const d = load();
  const incoming = cleanQuestion(q);
  const i = incoming.id ? d.questions.findIndex(x => x.id === incoming.id) : -1;
  if (i >= 0 && d.questions[i].rev !== incoming.rev) throw fail('conflict');
  const saved = { ...incoming, id: incoming.id || newId(), rev: (i >= 0 ? d.questions[i].rev : 0) + 1, updatedAt: Date.now(), updatedBy: user ? { email: user.email, name: user.name } : null };
  if (i >= 0) d.questions[i] = saved; else d.questions.push(saved);
  (d.history[saved.id] ||= []).unshift({ ...saved, savedAt: saved.updatedAt });
  save(d);
  return clone(saved);
}
export async function listHistory(id) { return clone(load().history[id] || []); }
export async function bulkSaveQuestions(list, user) {
  const d = load(); let n = 0;
  for (const q0 of list) {
    const q = cleanQuestion(q0), t = Date.now();
    const saved = { ...q, id: newId(), rev: 1, updatedAt: t, updatedBy: user ? { email: user.email, name: user.name } : null };
    d.questions.push(saved); (d.history[saved.id] ||= []).unshift({ ...saved, savedAt: t }); n++;
  }
  save(d); return n;
}
export async function deleteQuestion(id) { const d = load(); d.questions = d.questions.filter(q => q.id !== id); delete d.history[id]; save(d); }

// ---- attempts ----
export async function submitAttempt(att) {
  const d = load();
  if (!d.attempts.some(a => a.id === att.id)) d.attempts.push(clone(att));   // a retry of the same attempt is not saved twice
  save(d);
}
export async function listAttempts({ limit = 500 } = {}) { return clone(load().attempts).sort((a, b) => b.submittedAt - a.submittedAt).slice(0, limit); }
export async function deleteAttempt(id) { const d = load(); d.attempts = d.attempts.filter(a => a.id !== id); save(d); }

// ---- members ----
export async function listMembers() { return clone(load().members); }
export async function saveMember(email, { role, name }) {
  const d = load(), e = String(email).toLowerCase(), i = d.members.findIndex(m => m.email === e);
  const m = { email: e, role, name: name || '' }; if (i >= 0) d.members[i] = m; else d.members.push(m); save(d);
}
export async function removeMember(email) { const d = load(); d.members = d.members.filter(m => m.email !== String(email).toLowerCase()); save(d); }
