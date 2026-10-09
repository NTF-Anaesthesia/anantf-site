// Page search: indexes the text of every chapter (plus ui.registerSearch items) and lists matches.
import { $, $$, el, getSearchExtras } from './ui.js?v=1';

// Each row is one group of terms that mean the same thing for a reader.
const SYN = [
  ['pdph', 'post dural puncture headache', 'post-dural puncture headache', 'headache', 'blood patch', 'epidural blood patch'],
  ['hypotension', 'low bp', 'low blood pressure', 'vasopressor', 'phenylephrine', 'metaraminol', 'ephedrine', 'noradrenaline'],
  ['anticoag', 'anticoagulant', 'anticoagulation', 'heparin', 'apixaban', 'rivaroxaban', 'clopidogrel', 'lmwh', 'enoxaparin', 'warfarin', 'dabigatran', 'antiplatelet'],
  ['dry tap', 'no csf', 'no flow', 'cannot find the space', "can't find the space"],
  ['high block', 'total spinal', 'high spinal'],
  ['bupivacaine', 'marcaine', 'heavy', 'hyperbaric'],
  ['scoliosis', 'kyphosis', 'elderly', 'difficult back', 'difficult backs'],
  ['last', 'toxicity', 'lipid', 'local anaesthetic systemic toxicity'],
  ['anaesthesia', 'anesthesia'], ['paediatric', 'pediatric'], ['haematoma', 'hematoma'], ['oedema', 'edema'],
  ['bloody tap', 'blood in the hub', 'blood stained csf'],
  ['paraesthesia', 'paresthesia', 'electric shock'],
];

const norm = (s) => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Short terms (last, bp, csf) must match whole words; longer ones match word starts (headache ~ headaches).
const termRe = (t) => new RegExp(`(^|[^a-z0-9])${esc(t)}${t.length <= 4 ? '(?![a-z0-9])' : ''}`, 'i');

/** Query -> units; a unit is the list of alternative terms any one of which satisfies it. */
function parse(q) {
  const words = norm(q).split(' ').filter(Boolean);
  const units = [];
  for (let i = 0; i < words.length;) {
    let done = false;
    for (let n = Math.min(4, words.length - i); n >= 1 && !done; n--) {
      const phrase = words.slice(i, i + n).join(' ');
      const g = SYN.find((row) => row.some((t) => t === phrase));
      if (g) { units.push([...new Set([phrase, ...g])]); i += n; done = true; }
    }
    if (!done) { units.push([words[i]]); i += 1; }
  }
  return units.map((alts) => alts.map(termRe));
}

let entries = [];
let builtAt = 0;
const HEAD = 'h2,h3,h4,summary';
const TEXT = 'h2,h3,h4,p,li,td,th,summary,figcaption,dt,dd';

function chapterLabel(chapter) { return chapter?.dataset.title || ''; }

function ensureId(node, n) {
  if (!node.id) node.id = `srch-h-${n}`;
  return node.id;
}

/** (Re)build the index from the DOM. */
export function buildIndex() {
  const out = [];
  let hid = 0;
  for (const chapter of $$('main .sp-chapter')) {
    if (chapter.id === 'ch-home') continue;
    let head = null;
    for (const node of $$(TEXT, chapter)) {
      if (node.closest('.sp-adv-digest,.sp-pager,.sp-sr,[aria-hidden="true"],script,style')) continue;
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length < 3) continue;
      const isHead = node.matches(HEAD);
      if (isHead) { hid += 1; ensureId(node, hid); head = node; }
      let target = node.closest('[id]') || head;
      if (!isHead && target && (/^(ch-|mount-)/.test(target.id) || target.tagName === 'SECTION' || target.matches('[role=tabpanel]')) && head && chapter.contains(head)) target = head;
      if (isHead) target = node;
      if (!target) continue;
      const title = isHead ? text : (head ? head.textContent.replace(/\s+/g, ' ').trim() : chapterLabel(chapter));
      out.push({ title, text: isHead ? '' : text, id: target.id, chapter: chapterLabel(chapter), head: isHead, tl: norm(title), xl: norm(isHead ? '' : text) });
    }
  }
  for (const x of getSearchExtras()) {
    const t = document.getElementById(x.id);
    out.push({ title: x.title, text: x.text, id: x.id, chapter: chapterLabel(t?.closest('.sp-chapter')), head: !x.text, tl: norm(x.title), xl: norm(x.text) });
  }
  entries = out;
  builtAt = Date.now();
}

function snippet(text, units) {
  const low = text.toLowerCase();
  let at = -1; let len = 0;
  for (const alts of units) for (const re of alts) {
    const m = re.exec(low);
    if (m && (at < 0 || m.index < at)) { at = m.index + m[1].length; len = m[0].length - m[1].length; }
  }
  const start = Math.max(0, at - 50);
  const piece = text.slice(start, start + 150);
  const frag = document.createDocumentFragment();
  if (start > 0) frag.append('… ');
  if (at >= 0) {
    const rel = at - start;
    frag.append(piece.slice(0, rel));
    frag.append(el('mark', { text: piece.slice(rel, rel + Math.max(len, 1)) }));
    frag.append(piece.slice(rel + Math.max(len, 1)));
  } else frag.append(piece);
  if (start + 150 < text.length) frag.append(' …');
  return frag;
}

export function runSearch(q) {
  const units = parse(q);
  if (!units.length) return [];
  const best = new Map();
  entries.forEach((e, order) => {
    let score = 0;
    for (const alts of units) {
      let s = 0;
      for (const re of alts) { if (re.test(e.tl)) s = Math.max(s, 3); else if (e.xl && re.test(e.xl)) s = Math.max(s, 1); }
      if (!s) return;
      score += s;
    }
    if (e.head) score += 2;
    const prev = best.get(e.id);
    if (!prev || score > prev.score) best.set(e.id, { e, score, order });
  });
  const seen = new Set();
  const out = [];
  for (const r of [...best.values()].sort((a, b) => b.score - a.score || a.order - b.order)) {
    const key = `${r.e.chapter}|${r.e.tl}`; // one result per heading
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...r.e, units });
    if (out.length >= 30) break;
  }
  return out;
}

/** Wire an input + results list. onPick() is called when a result link is chosen. */
export function attachSearch(input, list, { onPick, onEscape } = {}) {
  let timer = 0;
  const render = () => {
    const q = input.value.trim();
    list.textContent = '';
    if (!q) return;
    if (Date.now() - builtAt > 4000) buildIndex();
    const res = runSearch(q);
    if (!res.length) {
      list.append(el('li', { class: 'sp-sres-none', text: 'No results. Try another word, for example a drug name or a symptom.' }));
      return;
    }
    for (const r of res) {
      const body = r.text || r.title;
      const a = el('a', { class: 'sp-sres', href: `#${r.id}` },
        el('span', { class: 'sp-sres-t', text: r.title }),
        el('span', { class: 'sp-sres-c', text: r.chapter }),
        el('span', { class: 'sp-sres-s' }, snippet(r.head && !r.text ? r.title : body, r.units)));
      a.addEventListener('click', () => onPick?.());
      list.append(el('li', {}, a));
    }
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 160); });
  input.addEventListener('focus', () => { if (Date.now() - builtAt > 4000) buildIndex(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(timer); render();
      const first = $('a', list);
      if (first) first.click();
    } else if (e.key === 'ArrowDown') {
      const first = $('a', list);
      if (first) { e.preventDefault(); first.focus(); }
    } else if (e.key === 'Escape') {
      input.value = ''; list.textContent = '';
      onEscape?.();
    }
  });
  list.addEventListener('keydown', (e) => {
    const links = $$('a', list);
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(i + 1, links.length - 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i ? links[i - 1] : input).focus(); }
    else if (e.key === 'Escape') { input.focus(); input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); }
  });
  return { render };
}
