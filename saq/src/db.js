// The D1 database: candidates and their attempts. Tables are created on first use, so a fresh database needs no migration.

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (uid TEXT PRIMARY KEY, email TEXT NOT NULL, name TEXT NOT NULL, joined_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY, uid TEXT NOT NULL, qid TEXT NOT NULL, question TEXT NOT NULL,
    started_at TEXT, submitted_at TEXT NOT NULL, seconds INTEGER, answer TEXT NOT NULL,
    status TEXT NOT NULL, raw INTEGER, adjusted INTEGER, marking TEXT, model TEXT, keyed INTEGER, usage TEXT)`,
  `CREATE INDEX IF NOT EXISTS attempts_uid ON attempts (uid, submitted_at)`,
  `CREATE INDEX IF NOT EXISTS attempts_day ON attempts (submitted_at)`,
];
const ready = new WeakMap();
export function ensure(db) {
  if (!ready.has(db)) ready.set(db, db.batch(SCHEMA.map(s => db.prepare(s))).catch(e => { ready.delete(db); throw e; }));
  return ready.get(db);
}

export const getUser = (db, uid) => db.prepare('SELECT uid, email, name, joined_at FROM users WHERE uid = ?').bind(uid).first();
export const addUser = (db, u) => db.prepare('INSERT INTO users (uid, email, name, joined_at) VALUES (?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET name = excluded.name, email = excluded.email').bind(u.uid, u.email, u.name, u.joined_at).run();

const SUMMARY = 'id, qid, started_at, submitted_at, seconds, status, raw, adjusted, keyed';
export const attemptsFor = async (db, uid) => (await db.prepare(`SELECT ${SUMMARY} FROM attempts WHERE uid = ? ORDER BY submitted_at`).bind(uid).all()).results;
export const getAttempt = (db, id) => db.prepare('SELECT * FROM attempts WHERE id = ?').bind(id).first();

export const addAttempt = (db, a) => db.prepare(
  'INSERT INTO attempts (id, uid, qid, question, started_at, submitted_at, seconds, answer, status, keyed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
).bind(a.id, a.uid, a.qid, a.question, a.started_at, a.submitted_at, a.seconds, a.answer, 'marking', a.keyed ? 1 : 0).run();

export const saveMarking = (db, id, m) => db.prepare(
  'UPDATE attempts SET status = ?, raw = ?, adjusted = ?, marking = ?, model = ?, usage = ? WHERE id = ?',
).bind(m.status, m.raw ?? null, m.adjusted ?? null, m.marking ? JSON.stringify(m.marking) : null, m.model ?? null, m.usage ? JSON.stringify(m.usage) : null, id).run();

export const countSince = async (db, since, uid) => (uid
  ? await db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE submitted_at >= ? AND uid = ?').bind(since, uid).first()
  : await db.prepare('SELECT COUNT(*) AS n FROM attempts WHERE submitted_at >= ?').bind(since).first()).n;

export const cohort = async db => (await db.prepare(`
  SELECT u.uid, u.name, u.email, u.joined_at,
         COUNT(DISTINCT a.qid) AS done, COUNT(a.id) AS attempts, ROUND(AVG(a.adjusted), 2) AS avg_adjusted,
         MAX(a.submitted_at) AS last_at
  FROM users u LEFT JOIN attempts a ON a.uid = u.uid AND a.status = 'marked'
  GROUP BY u.uid ORDER BY u.name`).all()).results;

export const allAttempts = async db => (await db.prepare(`SELECT a.*, u.name FROM attempts a JOIN users u ON u.uid = a.uid ORDER BY a.submitted_at`).all()).results;

export const deleteUser = (db, uid) => db.batch([db.prepare('DELETE FROM attempts WHERE uid = ?').bind(uid), db.prepare('DELETE FROM users WHERE uid = ?').bind(uid)]);
