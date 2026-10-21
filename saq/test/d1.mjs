// A stand-in for Cloudflare D1 on Node's built-in SQLite, enough for the tests and the local stub server.
import { DatabaseSync } from 'node:sqlite';

export function fakeD1() {
  const db = new DatabaseSync(':memory:');
  const stmt = (sql, args = []) => ({
    bind: (...a) => stmt(sql, a),
    first: async () => db.prepare(sql).get(...args) ?? null,
    all: async () => ({ results: db.prepare(sql).all(...args) }),
    run: async () => { db.prepare(sql).run(...args); return { success: true }; },
    _run: () => db.prepare(sql).run(...args),
  });
  return {
    prepare: sql => stmt(sql),
    batch: async list => { db.exec('BEGIN'); try { for (const s of list) s._run(); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } return []; },
  };
}
