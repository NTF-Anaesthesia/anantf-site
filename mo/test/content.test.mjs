// Checks every content and data file against CONTENT.md: ids, links, drug/tool/crisis/scenario/figure names, block
// fields, scenario graphs, and the writing rules (British spelling, no phone numbers, no emoji, no HTML).
// Run from anywhere: node mo/test/content.test.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const { MODULES, GROUPS } = await import('../js/content/index.js');
const { DRUGS, DRUG_GROUPS } = await import('../js/data/drugs.js');
const { CRISES } = await import('../js/data/crises.js');
const { SCENARIOS } = await import('../js/data/scenarios.js');
const { DECKS, CARDS } = await import('../js/data/cards.js');
const { TOOLS } = await import('../js/tools.js');
const { FIGURES } = await import('../js/figures.js');
const { LABELS } = await import('../js/drugs-ui.js');

const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const ids = new Map();
const uniq = (kind, id, where) => { const k = `${kind}:${id}`; if (ids.has(k)) err(where, `${kind} id "${id}" also used at ${ids.get(k)}`); else ids.set(k, where); };
const isStr = x => typeof x === 'string' && x.trim().length > 0;

const drugIds = new Set(DRUGS.map(d => d.id)), crisisIds = new Set(CRISES.map(c => c.id)), scenIds = new Set(SCENARIOS.map(s => s.id));
const deckIds = new Set(DECKS.map(d => d.id));
const topicIds = new Set(MODULES.flatMap(m => m.topics.map(t => `${m.id}/${t.id}`))), modIds = new Set(MODULES.map(m => m.id));

// ---------------------------------------------------------------- text rules
const AMERICAN = [
  [/\banesthe/i, 'anaesthe-'], [/\bhemorrh/i, 'haemorrh-'], [/\bhemato/i, 'haemato-'], [/\bhemoglobin/i, 'haemoglobin'], [/\besophag/i, 'oesophag-'],
  [/\bcolor/i, 'colour'], [/\bcenter\b/i, 'centre'], [/\bliters?\b/i, 'litre'], [/\bprogram\b/i, 'programme'], [/\b\w+iz(e|es|ed|ing|ation)\b/i, '-ise/-isation'],
  [/\bfavor/i, 'favour'], [/\bbehavior/i, 'behaviour'], [/\bpediatric/i, 'paediatric'], [/\bedema/i, 'oedema'],
  [/\bischemi/i, 'ischaemi-'], [/\bleukocyte/i, 'leucocyte'], [/\bepinephrine/i, 'adrenaline'], [/\bnorepinephrine/i, 'noradrenaline'], [/\bacetaminophen/i, 'paracetamol'],
  [/\bsuccinylcholine/i, 'suxamethonium'], [/\bcheck local (policy|guidelines)/i, 'this is the local guide'], [/µg|\bug\b/, 'mcg'], [/mcg\/kg\/hr\b|mg\/kg\/hr\b|mL\/hr\b/i, '/h not /hr'],
];
const OK_WORDS = /\b(size|sizes|sized|seize\w*|prize\w*|capsize)\b|Clinical Anesthesia/gi;
const ARROWS = /[↗↘↔↩▶]/u;
const EMOJI = /\p{Extended_Pictographic}/u;
const PHONE = /(?<![\d.,])(?:\+65\s?)?[689]\d{3}\s?\d{4}(?![\d.,])/;
const HTML = /<\s*[a-z/!]/i;

function checkText(s, where) {
  if (typeof s !== 'string') return;
  const t = s.replace(OK_WORDS, '');
  for (const [re, want] of AMERICAN) if (re.test(t)) err(where, `spelling/style "${t.match(re)[0]}" (use ${want}): "${s.slice(0, 80)}"`);
  if (ARROWS.test(s)) err(where, `arrow that phones draw as emoji: "${s.slice(0, 60)}"`);
  if (EMOJI.test(s.replace(/[©®™]/g, ''))) err(where, `emoji: "${s.slice(0, 60)}"`);
  if (PHONE.test(s)) err(where, `looks like a phone number: "${s.match(PHONE)[0]}"`);
  if (HTML.test(s)) err(where, `HTML is shown as text, not markup: "${s.slice(0, 60)}"`);
  if (/\bDr\.? [A-Z][a-z]+/.test(s)) err(where, `personal name? "${s.match(/\bDr\.? [A-Z][a-z]+/)[0]}"`);
  if ((s.match(/`/g) || []).length % 2) err(where, `unpaired backtick: "${s.slice(0, 60)}"`);
  if ((s.match(/\*\*/g) || []).length % 2) err(where, `unpaired **: "${s.slice(0, 60)}"`);
  for (const m of s.matchAll(/\[([^\]]+)\]\(([^)\s]*)\)/g)) checkHref(m[2], where);
}

function checkHref(h, where) {
  if (/^https:\/\//.test(h)) return;
  let m;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/([\w-]+)$/))) { if (!topicIds.has(`${m[1]}/${m[2]}`)) err(where, `link to missing topic ${h}`); return; }
  if ((m = h.match(/^#\/learn\/([\w-]+)$/))) { if (!modIds.has(m[1])) err(where, `link to missing module ${h}`); return; }
  if ((m = h.match(/^#\/drugs\/([\w-]+)$/))) { if (!drugIds.has(m[1])) err(where, `link to missing drug ${h}`); return; }
  if ((m = h.match(/^#\/tools\/([\w-]+)$/))) { if (!TOOLS[m[1]]) err(where, `link to missing tool ${h}`); return; }
  if ((m = h.match(/^#\/crisis\/([\w-]+)$/))) { if (!crisisIds.has(m[1])) err(where, `link to missing crisis card ${h}`); return; }
  if ((m = h.match(/^#\/practice\/scenario\/([\w-]+)$/))) { if (!scenIds.has(m[1])) err(where, `link to missing scenario ${h}`); return; }
  if ((m = h.match(/^#\/practice\/cards\/([\w-]+)$/))) { if (!deckIds.has(m[1])) err(where, `link to missing deck ${h}`); return; }
  if (/^#\/(learn|drugs|tools|crisis|practice|progress|about|search)?$/.test(h) || h === '#/practice/drawers') return;
  if (/^\.\.\//.test(h)) {
    const file = h.replace(/[#?].*$/, '');
    const abs = path.resolve(repo, 'mo', file);
    const f = file.endsWith('/') ? path.join(abs, 'index.html') : abs;
    if (!fs.existsSync(f)) err(where, `link to missing site page ${h}`);
    return;
  }
  err(where, `link format not allowed: ${h}`);
}

// walk every string in an object (for the writing rules)
function walkStrings(x, where) {
  if (typeof x === 'string') return checkText(x, where);
  if (Array.isArray(x)) return x.forEach((y, i) => walkStrings(y, `${where}[${i}]`));
  if (x && typeof x === 'object') for (const [k, v] of Object.entries(x)) if (!['id', 'next', 'start', 'href', 'svg'].includes(k)) walkStrings(v, `${where}.${k}`);
}

// ---------------------------------------------------------------- blocks
const NEED = {
  key: ['items'], p: ['text'], h: ['text'], list: ['items'], steps: ['items'], table: ['rows'], callout: [], dl: ['items'], script: ['lines'],
  compare: ['cols'], check: ['id', 'title', 'items'], quiz: ['id', 'items'], drug: ['id'], drugs: ['ids'], tool: ['id'], crisis: ['id'],
  scenario: ['id'], figure: ['id'], details: ['title', 'blocks'], links: ['items'],
};
function checkBlocks(blocks, where, inDetails = false) {
  if (!Array.isArray(blocks) || !blocks.length) return err(where, 'no blocks');
  blocks.forEach((b, i) => {
    const w = `${where}#${i}(${b?.t})`;
    if (!b || !NEED[b.t]) return err(w, `unknown block type "${b?.t}"`);
    for (const f of NEED[b.t]) if (b[f] == null || (Array.isArray(b[f]) && !b[f].length)) err(w, `missing ${f}`);
    if (inDetails && ['key', 'check', 'quiz'].includes(b.t)) err(w, `${b.t} is not allowed inside details`);
    switch (b.t) {
      case 'callout': if (!['stop', 'warn', 'local', 'tip', 'note'].includes(b.kind)) err(w, `callout kind "${b.kind}"`); if (!b.text && !b.items) err(w, 'callout needs text or items'); break;
      case 'table': {
        const n = b.head?.length || b.rows?.[0]?.length;
        (b.rows || []).forEach((r, j) => { if (!Array.isArray(r) || r.length !== n) err(w, `row ${j} has ${r?.length} cells, expected ${n}`); });
        if (n > 4) err(w, `${n} columns: keep tables to 4 or fewer for phones`);
        break;
      }
      case 'check': uniq('check', b.id, w); break;
      case 'quiz':
        uniq('quiz', b.id, w);
        (b.items || []).forEach((q, j) => {
          const wq = `${w} q${j}`;
          if (!isStr(q.q)) err(wq, 'no question');
          if (!Array.isArray(q.options) || q.options.length < 2) err(wq, 'needs 2+ options');
          const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
          if (!ans.length || ans.some(a => !Number.isInteger(a) || a < 0 || a >= (q.options || []).length)) err(wq, `answer ${JSON.stringify(q.answer)} out of range`);
          if (!isStr(q.explain)) err(wq, 'no explanation');
        });
        break;
      case 'drug': if (!drugIds.has(b.id)) err(w, `unknown drug ${b.id}`); break;
      case 'drugs': (b.ids || []).forEach(d => { if (!drugIds.has(d)) err(w, `unknown drug ${d}`); }); break;
      case 'tool': if (!TOOLS[b.id]) err(w, `unknown tool ${b.id}`); break;
      case 'crisis': if (!crisisIds.has(b.id)) err(w, `unknown crisis ${b.id}`); break;
      case 'scenario': if (!scenIds.has(b.id)) err(w, `unknown scenario ${b.id}`); break;
      case 'figure': if (!FIGURES[b.id]) err(w, `unknown figure ${b.id}`); break;
      case 'details': checkBlocks(b.blocks, w, true); break;
      case 'links': (b.items || []).forEach(l => { if (!isStr(l.text) || !isStr(l.href)) err(w, 'link needs text and href'); else checkHref(l.href, w); }); break;
      case 'steps': (b.items || []).forEach(s => { if (typeof s !== 'string' && !isStr(s?.title)) err(w, 'step needs text or {title}'); }); break;
      case 'compare': if (b.cols.length < 2 || b.cols.length > 3) err(w, 'compare needs 2 or 3 columns'); break;
    }
  });
}

// ---------------------------------------------------------------- modules
for (const m of MODULES) {
  const w = `module ${m.id}`;
  uniq('module', m.id, w);
  if (!/^[a-z0-9-]+$/.test(m.id)) err(w, 'id must be kebab-case');
  if (!GROUPS[m.group]) err(w, `group "${m.group}" is not in GROUPS`);
  if (!isStr(m.title) || !isStr(m.summary)) err(w, 'needs title and summary');
  if (!m.topics?.length) err(w, 'no topics');
  const seen = new Set();
  for (const t of m.topics || []) {
    const wt = `${m.id}/${t.id}`;
    if (seen.has(t.id)) err(wt, 'duplicate topic id'); seen.add(t.id);
    if (!/^[a-z0-9-]+$/.test(t.id || '')) err(wt, 'topic id must be kebab-case');
    if (!['core', 'beyond'].includes(t.level)) err(wt, `level "${t.level}"`);
    if (!isStr(t.title) || !isStr(t.summary)) err(wt, 'needs title and summary');
    if (t.blocks?.[0]?.t !== 'key') err(wt, 'first block must be key points');
    checkBlocks(t.blocks, wt);
    walkStrings({ title: t.title, summary: t.summary, blocks: t.blocks }, wt);
  }
  walkStrings({ title: m.title, summary: m.summary }, w);
}

// ---------------------------------------------------------------- drugs
const DOSE_UNITS = ['mg/kg', 'mcg/kg', 'mL/kg', 'U/kg', 'mmol/kg', 'g/kg', 'J/kg', 'mcg/kg/min', 'mcg/kg/h', 'mg/kg/h', 'mcg/min', 'mg/h', 'U/h', 'U/min', 'mL/kg/h'];
for (const d of DRUGS) {
  const w = `drug ${d.id}`;
  uniq('drug', d.id, w);
  if (!/^[a-z0-9-]+$/.test(d.id)) err(w, 'id must be kebab-case');
  if (!isStr(d.name)) err(w, 'no name');
  if (!DRUG_GROUPS[d.group]) err(w, `group "${d.group}"`);
  if (d.label && !LABELS[d.label]) err(w, `label "${d.label}"`);
  if (!['handbook', 'beyond'].includes(d.source)) err(w, `source "${d.source}"`);
  for (const k of ['conc', 'infusionConc']) if (d[k] && (!(d[k].value > 0) || !/^(mg|mcg|g|U|mmol)\/mL$/.test(d[k].unit))) err(w, `${k} ${JSON.stringify(d[k])}`);
  if (!d.doses?.length) err(w, 'no doses');
  (d.doses || []).forEach((x, i) => {
    const wd = `${w} dose ${i}`;
    if (!isStr(x.label)) err(wd, 'no label');
    if (x.text) return;
    if (!Array.isArray(x.per) || !x.per.length || x.per.some(n => typeof n !== 'number' || !(n >= 0))) err(wd, `per ${JSON.stringify(x.per)}`);
    if (x.per?.length === 2 && x.per[0] > x.per[1]) err(wd, 'per min > max');
    if (!DOSE_UNITS.includes(x.unit)) err(wd, `unit "${x.unit}"`);
    if (x.weight && !['TBW', 'IBW', 'LBW', 'ABW'].includes(x.weight)) err(wd, `weight "${x.weight}"`);
    if (x.infusion && !d.conc && !d.infusionConc) err(wd, 'infusion dose needs the drug infusionConc or conc');
    if (x.max && (!(x.max.value > 0) || !isStr(x.max.unit))) err(wd, 'max needs value and unit');
  });
  walkStrings(d, w);
}

// ---------------------------------------------------------------- crises
for (const c of CRISES) {
  const w = `crisis ${c.id}`;
  uniq('crisis', c.id, w);
  if (!isStr(c.title) || !isStr(c.summary)) err(w, 'needs title and summary');
  if (!c.steps?.length) err(w, 'no steps');
  (c.steps || []).forEach((s, i) => { if (!isStr(s.title) || !s.items?.length) err(`${w} step ${i}`, 'needs title and items'); });
  (c.doses || []).forEach((x, i) => { if (!isStr(x.label) || !isStr(x.text)) err(`${w} dose ${i}`, 'needs label and text'); if (x.drug && !drugIds.has(x.drug)) err(`${w} dose ${i}`, `unknown drug ${x.drug}`); });
  (c.related || []).forEach(r => { if (!crisisIds.has(r)) err(w, `related "${r}" is not a crisis id`); });
  walkStrings(c, w);
}

// ---------------------------------------------------------------- scenarios
for (const s of SCENARIOS) {
  const w = `scenario ${s.id}`;
  uniq('scenario', s.id, w);
  if (!isStr(s.title) || !isStr(s.setting)) err(w, 'needs title and setting');
  if (!['core', 'beyond'].includes(s.level)) err(w, `level "${s.level}"`);
  const nodes = s.nodes || {};
  if (!nodes[s.start]) err(w, `start node "${s.start}" missing`);
  let ends = 0;
  for (const [k, n] of Object.entries(nodes)) {
    const wn = `${w} node ${k}`;
    if (!isStr(n.text)) err(wn, 'no text');
    if (n.end) { ends++; if (!['good', 'ok', 'bad'].includes(n.outcome)) err(wn, `outcome "${n.outcome}"`); continue; }
    if (!n.choices || n.choices.length < 2) err(wn, 'needs 2+ choices');
    if (!(n.choices || []).some(c => c.good === true)) err(wn, 'needs at least one good choice');
    (n.choices || []).forEach((c, i) => {
      if (!isStr(c.text) || !isStr(c.feedback)) err(`${wn} choice ${i}`, 'needs text and feedback');
      if (!nodes[c.next]) err(`${wn} choice ${i}`, `next "${c.next}" missing`);
      if (![true, false, 'ok'].includes(c.good)) err(`${wn} choice ${i}`, 'good must be true, false or "ok"');
    });
  }
  if (!ends) err(w, 'no end node');
  // every node reachable, and an end reachable from every node
  const reach = new Set([s.start]), q = [s.start];
  while (q.length) { const n = nodes[q.shift()]; for (const c of n?.choices || []) if (!reach.has(c.next)) { reach.add(c.next); q.push(c.next); } }
  for (const k of Object.keys(nodes)) if (!reach.has(k)) err(w, `node "${k}" can't be reached`);
  for (const k of Object.keys(nodes)) {
    const seen = new Set([k]), qq = [k]; let ok = false;
    while (qq.length && !ok) { const n = nodes[qq.shift()]; if (n?.end) ok = true; for (const c of n?.choices || []) if (!seen.has(c.next)) { seen.add(c.next); qq.push(c.next); } }
    if (!ok) err(w, `no way to finish from node "${k}"`);
  }
  walkStrings(s, w);
}

// ---------------------------------------------------------------- cards
for (const d of DECKS) { uniq('deck', d.id, `deck ${d.id}`); if (!isStr(d.title)) err(`deck ${d.id}`, 'no title'); walkStrings(d, `deck ${d.id}`); }
for (const c of CARDS) {
  const w = `card ${c.id}`;
  uniq('card', c.id, w);
  if (!deckIds.has(c.deck)) err(w, `deck "${c.deck}"`);
  if (!isStr(c.front) || !isStr(c.back)) err(w, 'needs front and back');
  walkStrings(c, w);
}
for (const d of DECKS) if (!CARDS.some(c => c.deck === d.id)) err(`deck ${d.id}`, 'has no cards');

// ---------------------------------------------------------------- figures
for (const [id, f] of Object.entries(FIGURES)) {
  if (!/^<svg[\s\S]*<\/svg>\s*$/.test(f.svg || '')) err(`figure ${id}`, 'svg must be one <svg> element');
  if (!/<title>/.test(f.svg || '')) err(`figure ${id}`, 'svg needs a <title> for screen readers');
  if (!/role="img"/.test(f.svg || '')) err(`figure ${id}`, 'svg needs role="img"');
}

const n = { modules: MODULES.length, topics: topicIds.size, drugs: DRUGS.length, crises: CRISES.length, scenarios: SCENARIOS.length, cards: CARDS.length, figures: Object.keys(FIGURES).length };
if (errors.length) {
  console.error(errors.map(e => 'FAIL ' + e).join('\n'));
  console.error(`\n${errors.length} problem${errors.length === 1 ? '' : 's'} (${JSON.stringify(n)})`);
  process.exitCode = 1;
} else console.log('ok   content', JSON.stringify(n));
