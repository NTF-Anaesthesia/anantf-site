// The D1 database. Tables are created on first use, so a fresh database needs no migration.
//   users     a candidate, keyed by their (lowercase) email
//   codes     sign-in codes waiting to be typed in (hashed, 15 minutes)
//   sessions  signed-in devices (hashed tokens, 180 days from last use)
//   attempts  every answer, its timing and its marking
//   keys      model answers drafted by AI for questions with none (one per question, reused for every candidate)

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, joined_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS codes (email TEXT PRIMARY KEY, hash TEXT NOT NULL, expires_at TEXT NOT NULL, tries INTEGER NOT NULL DEFAULT 0, sent INTEGER NOT NULL DEFAULT 1, window_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_at TEXT NOT NULL, used_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY, uid TEXT NOT NULL, qid TEXT NOT NULL, question TEXT NOT NULL,
    started_at TEXT, submitted_at TEXT NOT NULL, seconds INTEGER, answer TEXT NOT NULL,
    status TEXT NOT NULL, raw INTEGER, adjusted INTEGER, marking TEXT, model TEXT, keyed INTEGER, usage TEXT)`,
  `CREATE TABLE IF NOT EXISTS keys (qid TEXT PRIMARY KEY, text TEXT NOT NULL, model TEXT, created_at TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS attempts_uid ON attempts (uid, submitted_at)`,
  `CREATE INDEX IF NOT EXISTS attempts_day ON attempts (submitted_at)`,
  `CREATE INDEX IF NOT EXISTS sessions_email ON sessions (email)`,
];
const ready = new WeakMap();
export function ensure(db) {
  if (!ready.has(db)) ready.set(db, db.batch(SCHEMA.map(s => db.prepare(s))).catch(e => { ready.delete(db); throw e; }));
  return ready.get(db);
}

// sign-in
export const getCode = (db, email) => db.prepare('SELECT * FROM codes WHERE email = ?').bind(email).first();
export const putCode = (db, c) => db.prepare(
  'INSERT INTO codes (email, hash, expires_at, tries, sent, window_at) VALUES (?, ?, ?, 0, ?, ?) ON CONFLICT(email) DO UPDATE SET hash = excluded.hash, expires_at = excluded.expires_at, tries = 0, sent = excluded.sent, window_at = excluded.window_at',
).bind(c.email, c.hash, c.expires_at, c.sent, c.window_at).run();
export const triedCode = (db, email) => db.prepare('UPDATE codes SET tries = tries + 1 WHERE email = ?').bind(email).run();
export const dropCode = (db, email) => db.prepare('DELETE FROM codes WHERE email = ?').bind(email).run();
export const addSession = (db, hash, email, at) => db.prepare('INSERT INTO sessions (hash, email, created_at, used_at) VALUES (?, ?, ?, ?)').bind(hash, email, at, at).run();
export const getSession = (db, hash) => db.prepare('SELECT * FROM sessions WHERE hash = ?').bind(hash).first();
export const touchSession = (db, hash, at) => db.prepare('UPDATE sessions SET used_at = ? WHERE hash = ?').bind(at, hash).run();
export const dropSession = (db, hash) => db.prepare('DELETE FROM sessions WHERE hash = ?').bind(hash).run();

// candidates
export const getUser = (db, uid) => db.prepare('SELECT uid, email, name, joined_at FROM users WHERE uid = ?').bind(uid).first();
export const addUser = (db, u) => db.prepare('INSERT INTO users (uid, email, name, joined_at) VALUES (?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET name = excluded.name').bind(u.uid, u.email, u.name, u.joined_at).run();
export const deleteUser = (db, uid) => db.batch([
  db.prepare('DELETE FROM attempts WHERE uid = ?').bind(uid),
  db.prepare('DELETE FROM sessions WHERE email = ?').bind(uid),
  db.prepare('DELETE FROM users WHERE uid = ?').bind(uid),
]);

// attempts
const SUMMARY = 'id, qid, started_at, submitted_at, seconds, status, raw, adjusted, keyed';
export const attemptsFor = async (db, uid) => (await db.prepare(`SELECT ${SUMMARY} FROM attempts WHERE uid = ? ORDER BY submitted_at`).bind(uid).all()).results;
export const getAttempt = (db, id) => db.prepare('SELECT * FROM attempts WHERE id = ?').bind(id).first();
export const addAttempt = (db, a) => db.prepare(
  'INSERT INTO attempts (id, uid, qid, question, started_at, submitted_at, seconds, answer, status, keyed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
).bind(a.id, a.uid, a.qid, a.question, a.started_at, a.submitted_at, a.seconds, a.answer, 'marking', a.keyed ? 1 : 0).run();
export const saveMarking = (db, id, m) => db.prepare(
  'UPDATE attempts SET status = ?, raw = ?, adjusted = ?, marking = ?, model = ?, usage = ?, keyed = COALESCE(?, keyed) WHERE id = ?',
).bind(m.status, m.raw ?? null, m.adjusted ?? null, m.marking ? JSON.stringify(m.marking) : null, m.model ?? null, m.usage ? JSON.stringify(m.usage) : null, m.keyed == null ? null : m.keyed ? 1 : 0, id).run();
export const countSince = async (db, since, uid) => (uid
  ? await db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE submitted_at >= ? AND uid = ?').bind(since, uid).first()
  : await db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE submitted_at >= ?').bind(since).first()).n;

// AI-drafted model answers: the first one written for a question is kept
export const getKey = (db, qid) => db.prepare('SELECT * FROM keys WHERE qid = ?').bind(qid).first();
export const putKey = (db, k) => db.prepare('INSERT INTO keys (qid, text, model, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(qid) DO NOTHING').bind(k.qid, k.text, k.model, k.created_at).run();
export const allKeys = async db => (await db.prepare('SELECT * FROM keys ORDER BY qid').all()).results;

// faculty
export const cohort = async db => (await db.prepare(`
  SELECT u.uid, u.name, u.email, u.joined_at,
         COUNT(DISTINCT a.qid) AS done, COUNT(a.id) AS attempts, ROUND(AVG(a.adjusted), 2) AS avg_adjusted,
         MAX(a.submitted_at) AS last_at
  FROM users u LEFT JOIN attempts a ON a.uid = u.uid AND a.status = 'marked'
  GROUP BY u.uid ORDER BY u.name`).all()).results;
export const allAttempts = async db => (await db.prepare('SELECT a.*, u.name FROM attempts a JOIN users u ON u.uid = a.uid ORDER BY a.submitted_at').all()).results;
