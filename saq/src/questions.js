// Every question a candidate can attempt: the 10-week programme (ids from their wording) and the 29-question bank (b01–b29).
import BUNDLE from './bundle.js';

const all = [];
for (const w of BUNDLE.weeks) w.sessions.forEach((s, si) => s.questions.forEach((q, qi) => all.push({
  id: q.id, kind: 'programme', week: w.num, session: si, order: qi, sessionLabel: s.label, tag: q.tag,
  stem: q.stem, q: q.q, text: [q.stem, q.q.split(' · ').join('\n')].filter(Boolean).join('\n\n'),
  key: q.key || '', keySource: q.keySource || null,
})));
for (const b of BUNDLE.bank) all.push({ id: b.id, kind: 'bank', title: b.title, stem: '', q: b.stem, text: b.stem, key: b.key, keySource: b.id, pdf: b.pdf });

export const QUESTIONS = Object.fromEntries(all.map(q => [q.id, q]));
export const PROGRAMME_COUNT = all.filter(q => q.kind === 'programme').length;

// what the page gets: the plan and the questions, no keys
export const PUBLIC = {
  blocks: BUNDLE.blocks,
  weeks: BUNDLE.weeks.map(w => ({
    num: w.num, block: w.block,
    sessions: w.sessions.map(s => ({ label: s.label, dur: s.dur, questions: s.questions.map(q => ({ id: q.id, tag: q.tag, stem: q.stem, q: q.q, keyed: !!q.key })) })),
  })),
  bank: BUNDLE.bank.map(b => ({ id: b.id, title: b.title, q: b.stem, pdf: b.pdf, keyed: true })),
};
