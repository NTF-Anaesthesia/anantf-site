// Local mode: the same interface as cloud.js, but everything lives in this browser (localStorage). Used for the demo
// (?demo) and whenever firebase-config.js has no project yet. Nothing here is shared between devices.

// The questions are not here: they come from the shared bank (../qbank/), in demo mode too.

export const enabled = false;
const KEY = 'mo-local-v2', SESSION = 'mo-local-session', FACULTY = 'mo-local-faculty';
const memory = {};   // fallback when storage is blocked (private window)
const read = k => { try { return localStorage.getItem(k); } catch { return memory[k] ?? null; } };
const write = (k, v) => { try { localStorage.setItem(k, v); } catch { memory[k] = v; } };
const drop = k => { try { localStorage.removeItem(k); } catch { delete memory[k]; } };
const fail = (code, msg) => Object.assign(new Error(msg || code), { code });

function load() {
  let d = null;
  try { d = JSON.parse(read(KEY) || 'null'); } catch { d = null; }
  if (!d || typeof d !== 'object') {
    // no count, pass mark or minutes: the paper's are used, as in a new Firebase project
    d = { attempts: [], settings: { review: 'full', cohort: 'Demo cohort', intro: 'This is the demo. Your answers stay on this phone and nobody else sees them.' }, passphrase: 'demo', members: [{ email: 'demo@example.com', role: 'admin', name: 'Demo faculty' }], requests: [], attemptCounts: {} };
    save(d);
  }
  if (!Array.isArray(d.requests)) d.requests = [];   // saved by an older version
  if (!d.attemptCounts || typeof d.attemptCounts !== 'object') d.attemptCounts = {};   // saved by an older version
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

// ---- attempts ----
export async function submitAttempt(att) {
  const d = load();
  if (!d.attempts.some(a => a.id === att.id)) d.attempts.push(clone(att));   // a retry of the same attempt is not saved twice
  save(d);
}
export async function listAttempts({ limit = 500 } = {}) { return clone(load().attempts).sort((a, b) => b.submittedAt - a.submittedAt).slice(0, limit); }
export async function deleteAttempt(id) { const d = load(); d.attempts = d.attempts.filter(a => a.id !== id); save(d); }

// ---- attempt counters (same names and errors as cloud.js) ----
const countOf = (d, key) => Number.isFinite(d.attemptCounts[key]) ? d.attemptCounts[key] : 0;
export async function getAttemptCount(key) { return countOf(load(), String(key || '')); }
export async function bumpAttempt(key) {
  const d = load(), k = String(key || ''), s = d.settings || {};
  const max = Number.isInteger(s.maxAttempts) ? s.maxAttempts : 2, n = countOf(d, k);
  if (n >= max) throw fail('limit', 'No attempts left.');
  d.attemptCounts[k] = n + 1; save(d); return n + 1;
}
export async function grantAttempt(key) {
  const d = load(), k = String(key || ''), n = Math.max(0, countOf(d, k) - 1);
  if (n === 0) delete d.attemptCounts[k]; else d.attemptCounts[k] = n;
  save(d); return n;
}
export async function setAttemptCount(key, n) {
  const d = load(), k = String(key || ''), v = Math.min(10, Math.max(0, n | 0));
  if (v === 0) delete d.attemptCounts[k]; else d.attemptCounts[k] = v;
  save(d); return v;
}
export async function listAttemptCounts() { const d = load(); return Object.keys(d.attemptCounts).map(key => ({ key, n: d.attemptCounts[key] })); }

// ---- members ----
export async function listMembers() { return clone(load().members); }
export async function saveMember(email, { role, name }) {
  const d = load(), e = String(email).toLowerCase(), i = d.members.findIndex(m => m.email === e);
  const m = { email: e, role, name: name || '' }; if (i >= 0) d.members[i] = m; else d.members.push(m); save(d);
}
export async function removeMember(email) { const d = load(); d.members = d.members.filter(m => m.email !== String(email).toLowerCase()); save(d); }

// ---- requests for faculty access ----
const DEMO_EMAIL = 'demo@example.com';
export async function requestAccess(name) {
  const d = load(), r = { email: DEMO_EMAIL, name: String(name || '').trim().slice(0, 100) || 'Demo faculty', requestedAt: Date.now() };
  d.requests = d.requests.filter(x => x.email !== r.email); d.requests.push(r); save(d); return clone(r);
}
export async function myRequest() { const r = load().requests.find(x => x.email === DEMO_EMAIL); return r ? clone(r) : null; }
export async function cancelRequest() { const d = load(); d.requests = d.requests.filter(x => x.email !== DEMO_EMAIL); save(d); }
export async function listRequests() { return clone(load().requests).sort((a, b) => b.requestedAt - a.requestedAt); }
export async function approveRequest(email, role = 'editor') {
  const d = load(), e = String(email).toLowerCase(), r = d.requests.find(x => x.email === e);
  if (!r) throw fail('not-found', 'That request is no longer there.');
  const m = { email: e, role: role === 'admin' ? 'admin' : 'editor', name: r.name };
  const i = d.members.findIndex(x => x.email === e); if (i >= 0) d.members[i] = m; else d.members.push(m);
  d.requests = d.requests.filter(x => x.email !== e); save(d); return clone(m);
}
export async function declineRequest(email) { const d = load(); d.requests = d.requests.filter(x => x.email !== String(email).toLowerCase()); save(d); }
