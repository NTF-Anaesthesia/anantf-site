// Reads the 10-week SAQ programme from the Exam Prep page (const studyPlan in exams/index.html, its source of truth) and
// gives each question a stable id from its wording.
// Editing a question's wording gives it a new id: old attempts keep their own copy of the question and stay in history.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

export function readProgramme(examsHtml) {
  const s = readFileSync(examsHtml, 'utf8');
  const a = s.indexOf('const studyPlan');
  if (a < 0) throw new Error('const studyPlan not found in ' + examsHtml);
  const start = s.indexOf('{', a);
  let depth = 0, end = -1;
  for (let i = start; i < s.length && end < 0; i++) { if (s[i] === '{') depth++; else if (s[i] === '}' && --depth === 0) end = i + 1; }
  const plan = Function(`"use strict";return (${s.slice(start, end)})`)();
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
