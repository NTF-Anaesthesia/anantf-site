// Shared storage for the Baby MO portal: Google sign-in for faculty, a name + passphrase for MOs, Cloud Firestore.
// Only used when firebase-config.js has a project configured (js/store.js picks this or js/local.js).
// Access is limited by firestore.rules. Every failure is thrown as an Error with a .code:
// 'permission', 'offline', 'conflict', 'not-found', 'bad-passphrase', 'cancelled', 'limit' or 'error'.
//
// Data:
//   members/{email}                 { role: 'admin' | 'editor', name }
//   accessRequests/{email}          { email, name, requestedAt }         (a Google user asking to become faculty; approved or declined by faculty)
//   config/access                   { passphrase }                       (admins only)
//   config/test                     { title, count, passMark, minutes, review, cohort, intro, updatedAt, updatedBy } (count, pass mark and minutes override the paper's)
//   sessions/{uid}                  { name, pass, at }                   (an MO's login; created once, never changed)
//   attempts/{id}                   { uid, name, cohort, startedAt, submittedAt, durationSec, items[], settings, score, total, pass, attemptNo? }
//                                   items: [{ qid, stem, options[2-6], answer, topic, explain, picked }], a snapshot of each question as the MO saw it
//   attemptCounts/{key}             { n, updatedAt }                     (key = <cohort-slug>__<name-key>; sittings started; an MO can only raise it by 1, up to config/test maxAttempts)
// config/test also has optional maxAttempts (default 2) and hardCount (from the paper when missing).
// The questions are NOT in Firebase any more (15 Oct 2026): they come from the shared bank, ../qbank/bank/questions.json,
// and the paper ../qbank/papers/babymo.json. The rules no longer allow the old questions and config/topics paths
// (closed to everyone since the owner pasted the 15 Oct 2026 rules).

import { FIREBASE_CONFIG } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
// TEST ONLY (test/cloud.e2e.mjs): on localhost with ?emu=1 the page talks to the local Firebase emulators with a dummy
// project, so the browser test needs no real config. Never true on a real host, whatever the query string says.
const EMU = ['localhost', '127.0.0.1'].includes(location.hostname) && new URLSearchParams(location.search).has('emu');
const CONFIG = EMU ? { apiKey: 'demo-key', authDomain: 'localhost', projectId: 'demo-moportal', appId: 'demo' } : FIREBASE_CONFIG;
// demo mode (?demo) never signs in or touches the real data
export const enabled = EMU || (!!(FIREBASE_CONFIG && FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.projectId) && !new URLSearchParams(location.search).has('demo'));

let fb = null;
async function sdk() {
  if (fb) return fb;
  const [app, auth, fs] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-firestore.js'),
  ]);
  const a = app.initializeApp(CONFIG);
  fb = { auth: auth.getAuth(a), db: fs.getFirestore(a), A: auth, F: fs };
  if (EMU) {
    // TEST ONLY: local emulators, and a fake "Google" sign-in (the Auth emulator accepts an unsigned id token)
    const ports = Object.assign({ auth: 9099, firestore: 8085 }, window.__MO_EMU);
    auth.connectAuthEmulator(fb.auth, 'http://127.0.0.1:' + ports.auth, { disableWarnings: true });
    fs.connectFirestoreEmulator(fb.db, '127.0.0.1', ports.firestore);
    window.__moTestSignIn = email => auth.signInWithCredential(fb.auth, auth.GoogleAuthProvider.credential(
      JSON.stringify({ sub: 'g-' + email, email, email_verified: true, name: email.split('@')[0] })));
  }
  return fb;
}

// Firestore rejects undefined values; a JSON round trip drops them.
const plain = o => JSON.parse(JSON.stringify(o));

// ---- errors ----
const OWN_CODES = ['permission', 'offline', 'conflict', 'not-found', 'bad-passphrase', 'cancelled', 'limit', 'error'];
function fail(e, fallback) {
  if (e && OWN_CODES.includes(e.code) && e.isMoPortal) return e;
  const c = String((e && e.code) || '').replace(/^(auth|firestore)\//, '');
  let code = 'error';
  if (c === 'permission-denied' || c === 'unauthenticated') code = 'permission';
  else if (c === 'unavailable' || c === 'deadline-exceeded' || c === 'network-request-failed') code = 'offline';
  else if (c === 'not-found') code = 'not-found';
  else if (c === 'aborted') code = 'conflict';
  else if (c === 'popup-closed-by-user' || c === 'cancelled-popup-request' || c === 'popup-blocked') code = 'cancelled';
  const err = new Error(fallback || (e && e.message) || 'Something went wrong.');
  err.code = code; err.isMoPortal = true; err.cause = e;
  return err;
}
function own(code, message) {
  const err = new Error(message); err.code = code; err.isMoPortal = true; return err;
}
// run an async function and turn any failure into an Error with a .code
async function guard(fn) {
  try { return await fn(); } catch (e) { throw fail(e); }
}

// Firestore queues a write while offline and never answers; give up after a while so the page can say so.
// (The write may still go through later: submitAttempt with an id is safe to retry.)
function withTimeout(p, ms = 20000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(own('offline', 'No connection: please try again.')), ms);
    p.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

const who = user => {
  const email = String((user && user.email) || '').toLowerCase();
  return { email, name: (user && (user.name || user.displayName)) || email };
};
const str = (v, max) => String(v == null ? '' : v).slice(0, max);
const int = (v, d) => Number.isFinite(Number(v)) ? Math.trunc(Number(v)) : d;

// ---- who is signed in ----
const listeners = new Set();
let started = false, haveFirst = false, lastUser = null, sessionName = '', seq = 0;

async function describe(u) {
  if (!u) return null;
  if (u.isAnonymous) {
    let name = sessionName || u.displayName || '';
    if (!name) {
      try {
        const { db, F } = await sdk();
        const s = await F.getDoc(F.doc(db, 'sessions', u.uid));
        if (s.exists()) name = s.data().name || '';
      } catch (e) { /* offline or signed out meanwhile: no name yet */ }
    }
    return { uid: u.uid, email: null, anonymous: true, name };
  }
  const email = (u.email || '').toLowerCase();
  return { uid: u.uid, email, anonymous: false, name: u.displayName || email };
}
async function emit(u) {
  const mine = ++seq;
  const user = await describe(u);
  if (mine !== seq) return; // a newer sign-in change arrived while this one was being described
  lastUser = user; haveFirst = true;
  for (const cb of [...listeners]) { try { cb(lastUser); } catch (e) { console.error(e); } }
}

// Calls cb(null | { uid, email|null, anonymous, name }) now and whenever sign-in changes. Returns an unsubscribe function.
export async function watchUser(cb) {
  if (!enabled) { cb(null); return () => {}; }
  const { auth, A } = await sdk();
  listeners.add(cb);
  if (!started) {
    started = true;
    A.onAuthStateChanged(auth, u => { if (!u || !u.isAnonymous) sessionName = ''; emit(u); });
  } else if (haveFirst) {
    cb(lastUser); // already running: tell the new listener the current state
  }
  return () => listeners.delete(cb);
}

async function ready() {
  const s = await sdk();
  if (s.auth.authStateReady) await s.auth.authStateReady();
  return s;
}

export async function facultySignIn() {
  return guard(async () => {
    const { auth, A } = await sdk();
    if (EMU && window.__moTestEmail) { await window.__moTestSignIn(window.__moTestEmail); return; } // TEST ONLY: no popup
    const provider = new A.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await A.signInWithPopup(auth, provider);
  });
}

export async function signOut() {
  return guard(async () => {
    const { auth, A } = await sdk();
    await A.signOut(auth);
  });
}

// ---- faculty list ----
export async function memberRole(email) {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDoc(F.doc(db, 'members', String(email || '').toLowerCase()));
    const role = snap.exists() ? snap.data().role : null;
    return role === 'admin' || role === 'editor' ? role : null;
  });
}

export async function listMembers() {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDocs(F.collection(db, 'members'));
    return snap.docs.map(d => ({ email: d.id, role: d.data().role, name: d.data().name || '' }))
      .sort((a, b) => a.email.localeCompare(b.email));
  });
}

export async function saveMember(email, { role, name }) {
  return guard(async () => {
    const { db, F } = await ready();
    const id = String(email || '').trim().toLowerCase();
    if (!id) throw own('error', 'An email is needed.');
    await F.setDoc(F.doc(db, 'members', id), plain({ role, name: str(name, 100) }));
  });
}

export async function removeMember(email) {
  return guard(async () => {
    const { db, F } = await ready();
    await F.deleteDoc(F.doc(db, 'members', String(email || '').trim().toLowerCase()));
  });
}

// ---- requests for faculty access ----
// Anyone signed in with Google may ask (requestAccess); any faculty member may approve (as an editor; an admin can
// approve as admin) or decline. A request is keyed by the lower-case email.
async function me() {
  const { auth } = await ready();
  const u = auth.currentUser;
  if (!u || u.isAnonymous || !u.email) throw own('permission', 'Please sign in with Google first.');
  return { email: u.email.toLowerCase(), name: u.displayName || u.email.toLowerCase() };
}

// Files (or updates) the signed-in person's own request. Returns { email, name, requestedAt }.
export async function requestAccess(name) {
  return guard(async () => {
    const { db, F } = await ready();
    const m = await me();
    const doc = plain({ email: m.email, name: str(name, 100).trim() || m.name.slice(0, 100), requestedAt: Date.now() });
    await F.setDoc(F.doc(db, 'accessRequests', m.email), doc);
    return doc;
  });
}

// The signed-in person's own request, or null.
export async function myRequest() {
  return guard(async () => {
    const { db, F } = await ready();
    const m = await me();
    const snap = await F.getDoc(F.doc(db, 'accessRequests', m.email));
    return snap.exists() ? snap.data() : null;
  });
}

export async function cancelRequest() {
  return guard(async () => {
    const { db, F } = await ready();
    const m = await me();
    await F.deleteDoc(F.doc(db, 'accessRequests', m.email));
  });
}

// Faculty only. Newest first.
export async function listRequests() {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDocs(F.collection(db, 'accessRequests'));
    return snap.docs.map(d => ({ email: d.id, name: d.data().name || '', requestedAt: d.data().requestedAt || 0 }))
      .sort((a, b) => b.requestedAt - a.requestedAt);
  });
}

// Faculty only. One batch: adds members/{email} (name from the request) and deletes the request. role 'admin' is
// refused by the rules unless the caller is an admin. Throws 'not-found' if the request is gone.
export async function approveRequest(email, role = 'editor') {
  return guard(async () => {
    const { db, F } = await ready();
    const id = String(email || '').trim().toLowerCase();
    const reqRef = F.doc(db, 'accessRequests', id);
    const snap = await F.getDoc(reqRef);
    if (!snap.exists()) throw own('not-found', 'That request is no longer there.');
    const name = str(snap.data().name, 100);
    const batch = F.writeBatch(db);
    batch.set(F.doc(db, 'members', id), plain({ role: role === 'admin' ? 'admin' : 'editor', name }));
    batch.delete(reqRef);
    await batch.commit();
    return { email: id, role: role === 'admin' ? 'admin' : 'editor', name };
  });
}

export async function declineRequest(email) {
  return guard(async () => {
    const { db, F } = await ready();
    await F.deleteDoc(F.doc(db, 'accessRequests', String(email || '').trim().toLowerCase()));
  });
}

// ---- MO login ----
// Signs in anonymously and files a session with the passphrase. Always uses a fresh anonymous sign-in, because a
// session can't be changed once made.
export async function startSession(name, passphrase) {
  const clean = str(name, 80).trim();
  if (!clean) throw own('error', 'Please enter your name.');
  try {
    const { auth, db, A, F } = await ready();
    if (auth.currentUser) await A.signOut(auth);
    const cred = await A.signInAnonymously(auth);
    const uid = cred.user.uid;
    sessionName = clean;
    try {
      await withTimeout(F.setDoc(F.doc(db, 'sessions', uid), { name: clean, pass: String(passphrase == null ? '' : passphrase), at: Date.now() }));
    } catch (e) {
      sessionName = '';
      try { await A.signOut(auth); } catch (e2) { /* ignore */ }
      if (e && e.code === 'permission-denied') throw own('bad-passphrase', 'That passphrase is not right.');
      throw e;
    }
    try { await A.updateProfile(cred.user, { displayName: clean }); } catch (e) { /* the name is also in the session */ }
    await emit(auth.currentUser);
    return { uid, name: clean };
  } catch (e) {
    throw fail(e);
  }
}

// True when this browser has an MO login that still matches the current passphrase.
export async function hasSession() {
  try {
    const { auth, db, F } = await ready();
    const u = auth.currentUser;
    if (!u || !u.isAnonymous) return false;
    const s = await F.getDoc(F.doc(db, 'sessions', u.uid));
    if (!s.exists()) return false;
    // the settings are readable only while the session's passphrase is the current one
    await F.getDoc(F.doc(db, 'config', 'test'));
    return true;
  } catch (e) {
    const err = fail(e);
    if (err.code === 'permission') return false;
    throw err;
  }
}

// ---- settings and passphrase ----
export async function getSettings() {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDoc(F.doc(db, 'config', 'test'));
    return snap.exists() ? snap.data() : null;
  });
}

export async function saveSettings(s, user) {
  return guard(async () => {
    const { db, F } = await ready();
    const extra = {};
    if (s.maxAttempts != null) extra.maxAttempts = Math.min(10, Math.max(1, int(s.maxAttempts, 2)));
    if (s.hardCount != null) extra.hardCount = Math.min(100, Math.max(0, int(s.hardCount, 4)));
    const doc = plain({
      title: str(s.title, 100) || 'Baby MO test',
      count: int(s.count, 20),
      passMark: int(s.passMark, 60),
      minutes: int(s.minutes, 30),
      review: ['score', 'marks', 'full'].includes(s.review) ? s.review : 'score',
      cohort: str(s.cohort, 100),
      intro: str(s.intro, 3000),
      ...extra,
      updatedAt: Date.now(),
      updatedBy: who(user),
    });
    await F.setDoc(F.doc(db, 'config', 'test'), doc);
    return doc;
  });
}

export async function getPassphrase() {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDoc(F.doc(db, 'config', 'access'));
    return snap.exists() ? snap.data().passphrase || '' : '';
  });
}

export async function setPassphrase(p) {
  return guard(async () => {
    const { db, F } = await ready();
    await F.setDoc(F.doc(db, 'config', 'access'), { passphrase: String(p == null ? '' : p) });
  });
}

// ---- attempts ----
function attemptFields(a, uid, displayName) {
  return {
    uid,
    name: str(a.name || sessionName || displayName, 80),
    cohort: str(a.cohort, 100),
    startedAt: Number(a.startedAt) || 0,
    submittedAt: Number(a.submittedAt) || Date.now(),
    durationSec: Number(a.durationSec) || 0,
    items: (a.items || []).slice(0, 100).map(i => ({
      qid: str(i.qid, 100),
      stem: str(i.stem, 3000),
      options: (i.options || []).slice(0, 6).map(o => str(o, 500)),
      answer: int(i.answer, 0),
      topic: str(i.topic, 240),
      explain: str(i.explain, 5000),
      picked: i.picked == null ? null : int(i.picked, null),
    })),
    settings: {
      count: int(a.settings && a.settings.count, 0),
      passMark: int(a.settings && a.settings.passMark, 0),
      minutes: int(a.settings && a.settings.minutes, 0),
    },
    score: int(a.score, 0),
    total: int(a.total, 0),
    pass: !!a.pass,
    ...(a.attemptNo != null ? { attemptNo: Math.min(10, Math.max(1, int(a.attemptNo, 1))) } : {}),
  };
}

// Creates only. With att.id a retry is harmless: if the attempt is already saved it is returned as it is.
export async function submitAttempt(att) {
  return guard(async () => {
    const { auth, db, F } = await ready();
    const u = auth.currentUser;
    const data = plain(attemptFields(att, (u && u.uid) || att.uid, u && u.displayName));
    const ref = att.id ? F.doc(db, 'attempts', att.id) : F.doc(F.collection(db, 'attempts'));
    try {
      await withTimeout(F.setDoc(ref, data));
    } catch (e) {
      if (att.id && e && e.code === 'permission-denied') {
        // an earlier try may have gone through: a second write is refused, but the owner can read it
        let exists = false;
        try { exists = (await F.getDoc(ref)).exists(); } catch (e2) { /* really refused */ }
        if (exists) return { id: ref.id, ...data };
      }
      throw e;
    }
    return { id: ref.id, ...data };
  });
}

// Faculty. Newest first.
export async function listAttempts({ limit = 500 } = {}) {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDocs(F.query(F.collection(db, 'attempts'), F.orderBy('submittedAt', 'desc'), F.limit(limit)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  });
}

export async function deleteAttempt(id) {
  return guard(async () => {
    const { db, F } = await ready();
    await F.deleteDoc(F.doc(db, 'attempts', id));
  });
}

// ---- attempt counters ----
// key = '<cohort-slug>__<name-key>' (lower-case a-z 0-9 _ -, up to 120). The count is how many sittings that MO has
// started in the cohort; the limit is config/test maxAttempts (default 2). The rules enforce both.
const countRef = (db, F, key) => F.doc(db, 'attemptCounts', String(key || ''));
const countOf = snap => (snap.exists() && Number.isFinite(snap.data().n) ? snap.data().n : 0);

// MO or faculty. 0 when there is no counter yet.
export async function getAttemptCount(key) {
  return guard(async () => {
    const { db, F } = await ready();
    return countOf(await F.getDoc(countRef(db, F, key)));
  });
}

// MO: starts a sitting. Reads the count; if it has reached the limit throws code 'limit' without writing, otherwise
// creates the counter at 1 or raises it by 1. Returns the new count.
export async function bumpAttempt(key) {
  return guard(async () => {
    const { db, F } = await ready();
    const ref = countRef(db, F, key);
    let result = 0;
    await F.runTransaction(db, async tx => {
      const cfg = await tx.get(F.doc(db, 'config', 'test'));
      const max = cfg.exists() && Number.isInteger(cfg.data().maxAttempts) ? cfg.data().maxAttempts : 2;
      const n = countOf(await tx.get(ref));
      if (n >= max) throw own('limit', 'No attempts left.');
      tx.set(ref, { n: n + 1, updatedAt: Date.now() });
      result = n + 1;
    });
    return result;
  });
}

// Faculty: give one more attempt (count down by 1, never below 0; the counter is deleted at 0).
export async function grantAttempt(key) {
  return guard(async () => {
    const { db, F } = await ready();
    const ref = countRef(db, F, key);
    let result = 0;
    await F.runTransaction(db, async tx => {
      const n = countOf(await tx.get(ref));
      result = Math.max(0, n - 1);
      if (result === 0) { if (n > 0) tx.delete(ref); } else tx.set(ref, { n: result, updatedAt: Date.now() });
    });
    return result;
  });
}

// Faculty: set the count to n (0 to 10; 0 deletes it). Used to undo "Give another attempt".
export async function setAttemptCount(key, n) {
  return guard(async () => {
    const { db, F } = await ready();
    const ref = countRef(db, F, key), v = Math.min(10, Math.max(0, int(n, 0)));
    if (v === 0) await F.deleteDoc(ref); else await F.setDoc(ref, { n: v, updatedAt: Date.now() });
    return v;
  });
}

// Faculty only ('permission' for an MO). [{ key, n }]
export async function listAttemptCounts() {
  return guard(async () => {
    const { db, F } = await ready();
    const snap = await F.getDocs(F.collection(db, 'attemptCounts'));
    return snap.docs.map(d => ({ key: d.id, n: countOf(d) }));
  });
}
