// Search across topics, drugs, crisis cards, calculators and scenarios. Built once, on first use.
import { plain, esc } from './md.js';
import { MODULES } from './content/index.js';
import { DRUGS } from './data/drugs.js';
import { CRISES } from './data/crises.js';
import { SCENARIOS } from './data/scenarios.js';
import { TOOLS } from './tools.js';

// words people type that should find each other
const SYN = [
  ['adrenaline', 'epinephrine'], ['noradrenaline', 'norepinephrine'], ['lignocaine', 'lidocaine'], ['paracetamol', 'acetaminophen'],
  ['suxamethonium', 'succinylcholine', 'sux', 'scoline'], ['ponv', 'nausea', 'vomiting'], ['pacu', 'recovery'], ['ett', 'tube', 'intubation'],
  ['lma', 'supraglottic', 'sga', 'igel'], ['rsi', 'rapid sequence'], ['last', 'toxicity'], ['mh', 'malignant hyperthermia'],
  ['bp', 'blood pressure'], ['desaturation', 'hypoxia', 'spo2'], ['hypotension', 'low blood pressure'], ['tiva', 'tci'],
  ['nmb', 'muscle relaxant', 'neuromuscular'], ['nbm', 'fasting', 'nil by mouth'], ['asa', 'asa grade'], ['ga', 'general anaesthetic'],
];

let INDEX = null;
function text(blocks) {
  const out = [];
  const walk = bs => (bs || []).forEach(b => {
    ['text', 'title', 'caption'].forEach(k => b[k] && out.push(plain(b[k])));
    ['items', 'lines'].forEach(k => Array.isArray(b[k]) && b[k].forEach(x => out.push(typeof x === 'string' ? plain(x) : plain([x.title, x.text, x.term, x.def, x.q, ...(x.options || []), x.explain].filter(Boolean).join(' ')))));
    if (b.rows) b.rows.forEach(r => out.push(r.map(plain).join(' ')));
    if (b.head) out.push(b.head.map(plain).join(' '));
    if (b.cols) b.cols.forEach(c => out.push(plain(c.title), ...(c.items || []).map(plain)));
    if (b.blocks) walk(b.blocks);
  });
  walk(blocks);
  return out.join(' ');
}

export function buildIndex() {
  if (INDEX) return INDEX;
  INDEX = [];
  for (const m of MODULES) for (const t of m.topics) INDEX.push({ kind: 'Topic', title: t.title, sub: m.title, route: `#/learn/${m.id}/${t.id}`, summary: t.summary || '', body: text(t.blocks) });
  for (const d of DRUGS) INDEX.push({ kind: 'Drug', title: d.name, sub: d.cls || '', route: `#/drugs/${d.id}`, summary: [d.aka?.join(' '), d.cls].filter(Boolean).join(' '), body: plain([d.presentation, d.prep, ...(d.notes || []), ...(d.cautions || []), d.local, ...(d.doses || []).map(x => [x.label, x.text, x.note].join(' '))].filter(Boolean).join(' ')) });
  for (const c of CRISES) INDEX.push({ kind: 'Crisis', title: c.title, sub: 'Crisis card', route: `#/crisis/${c.id}`, summary: c.summary || '', body: plain([...(c.recognise || []), ...(c.steps || []).flatMap(s => s.items || [])].join(' ')) });
  for (const [id, t] of Object.entries(TOOLS)) INDEX.push({ kind: 'Tool', title: t.title, sub: 'Calculator', route: `#/tools/${id}`, summary: t.summary, body: '' });
  for (const s of SCENARIOS) INDEX.push({ kind: 'Scenario', title: s.title, sub: s.setting, route: `#/practice/scenario/${s.id}`, summary: s.summary || '', body: '' });
  INDEX.forEach(e => { e._t = e.title.toLowerCase(); e._s = (e.summary + ' ' + e.sub).toLowerCase(); e._b = e.body.toLowerCase(); });
  return INDEX;
}

const reEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// what the person typed matches anywhere in a word; the synonyms it brings in match whole words only
// (so "toxicity" finding "last" doesn't match "she last ate", and "tube" finding "ett" doesn't match "setting")
function expand(term) {
  const row = SYN.find(r => r.includes(term)) || [term];
  return row.map(a => a === term ? (s => s.includes(a)) : (re => s => re.test(s))(new RegExp(`\\b${reEsc(a)}\\b`)));
}

export function search(q, limit = 40) {
  const terms = String(q || '').toLowerCase().split(/\s+/).filter(t => t.length > 1);
  if (!terms.length) return [];
  const res = [];
  for (const e of buildIndex()) {
    let score = 0, all = true;
    for (const term of terms) {
      const alts = expand(term);
      const hit = (s, w) => alts.some(a => a(s)) ? w : 0;
      const s = Math.max(hit(e._t, 10), hit(e._s, 4), hit(e._b, 1));
      if (!s) { all = false; break; }
      score += s + (e._t.startsWith(term) ? 5 : 0);
    }
    if (all) res.push({ e, score: score + (e.kind === 'Crisis' ? 2 : 0) });
  }
  return res.sort((a, b) => b.score - a.score).slice(0, limit).map(r => ({ ...r.e, snippet: snippet(r.e, terms) }));
}

function snippet(e, terms) {
  const b = e.body, lb = e._b;
  for (const t of terms) {
    const i = lb.indexOf(t);
    if (i < 0 || e._t.includes(t)) continue;
    // highlight on the raw text, then escape each piece (escaping first would split things like &quot;)
    const raw = b.slice(Math.max(0, i - 50), i + 90);
    return '…' + raw.split(new RegExp(`(${reEsc(t)})`, 'i')).map((part, k) => k % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('') + '…';
  }
  return esc(e.summary || '');
}
