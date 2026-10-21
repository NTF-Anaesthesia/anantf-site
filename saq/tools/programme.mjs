// Reads the 10-week SAQ programme (keys/programme.json) and gives each question a stable id from its wording.
// Editing a question's wording gives it a new id: old attempts keep their own copy of the question and stay in history.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function readProgramme(file) {
  const plan = JSON.parse(readFileSync(file, 'utf8'));
  const weeks = plan.weeks.map(w => ({
    num: w.num,
    block: (plan.blocks.find(b => b.weeks.includes(w.num)) || {}).name || '',
    sessions: w.sessions.map(se => ({
      label: se.label, dur: se.dur,
      questions: se.essays.map(e => ({ id: idFor(e), tag: e.tag, stem: (e.stem || '').trim(), q: e.q.trim() })),
    })),
  }));
  return { blocks: plan.blocks, weeks };
}

export const idFor = e => createHash('sha1').update(norm(`${e.stem || ''} ${e.q}`)).digest('hex').slice(0, 8);
export const norm = s => String(s).toLowerCase().replace(/[^a-z0-9%]+/g, ' ').trim();
const words = s => new Set(norm(s).split(' ').filter(w => w.length > 2));
export function overlap(a, b) {
  const x = words(a), y = words(b);
  let n = 0; for (const w of x) if (y.has(w)) n++;
  return n / Math.min(x.size, y.size || 1);
}
