// Truncal blocks: page search. Indexes the text of every chapter (plus registerSearch items) and lists matches.
// Synonyms: each row is a group of terms that mean the same thing to a reader. Pages may add rows with addSynonyms().
import { $, $$, el, getSearchExtras } from './ui.js';

const SYN = [
  ['tap', 'transversus abdominis plane', 'transversus abdominis', 'tap block'],
  ['ql', 'quadratus lumborum', 'ql block', 'qlb'],
  ['ql1', 'lateral ql', 'type 1'], ['ql2', 'posterior ql', 'type 2'], ['ql3', 'transmuscular', 'anterior ql', 'type 3'],
  ['rsb', 'rectus sheath', 'rectus sheath block'],
  ['ilioinguinal', 'iliohypogastric', 'ii/ih', 'iih', 'groin', 'inguinal', 'hernia'],
  ['esp', 'erector spinae', 'erector spinae plane'],
  ['pvb', 'paravertebral', 'tpvb', 'thoracic paravertebral'],
  ['mtp', 'mid-point transverse process', 'midpoint transverse process'],
  ['sap', 'serratus', 'serratus anterior', 'serratus anterior plane'],
  ['pecs', 'pec', 'pecs 1', 'pecs 2', 'pecs i', 'pecs ii', 'interpectoral', 'pectoserratus'],
  ['parasternal', 'transversus thoracis', 'ttp', 'sternotomy'],
  ['sctl', 'superior costotransverse ligament'], ['iim', 'internal intercostal membrane'],
  ['tp', 'transverse process'],
  ['eo', 'external oblique'], ['io', 'internal oblique'], ['ta', 'transversus abdominis muscle'],
  ['last', 'toxicity', 'local anaesthetic systemic toxicity', 'maximum dose', 'max dose'],
  ['dose', 'volume', 'ml', 'concentration', 'ropivacaine', 'bupivacaine', 'levobupivacaine'],
  ['laparotomy', 'midline', 'midline incision', 'upper abdominal'],
  ['lap chole', 'cholecystectomy', 'laparoscopic cholecystectomy'],
  ['hepatectomy', 'liver resection', 'whipple', 'upper gi'],
  ['rib fracture', 'rib fractures', 'chest trauma'],
  ['thoracotomy', 'vats', 'thoracic surgery'],
  ['mastectomy', 'breast surgery'],
  ['nephrectomy', 'kidney'],
  ['dermatome', 'dermatomes', 'coverage', 'spread'],
  ['pneumothorax', 'pleural puncture', 'pleura'],
  ['anaesthesia', 'anesthesia'], ['haematoma', 'hematoma'], ['oedema', 'edema'],
  ['osce', 'exam', 'mmed', 'viva', 'exam corner'],
];
export function addSynonyms(rows = []) { rows.forEach((r) => Array.isArray(r) && SYN.push(r.map((t) => String(t).toLowerCase()))); }

const norm = (s) => String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(^|[^a-z0-9])${escRe(t)}${t.length <= 4 ? '(?![a-z0-9])' : ''}`, 'i');

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
const HEAD = 'h1,h2,h3,h4,summary';
const TEXT = 'h1,h2,h3,h4,p,li,td,th,summary,figcaption,dt,dd';

export function buildIndex() {
  const out = [];
  let hid = 0;
  for (const chapter of $$('main .tb-chapter')) {
    if (chapter.id === 'ch-home') continue;
    const chTitle = chapter.dataset.title || '';
    let head = null;
    for (const node of $$(TEXT, chapter)) {
      if (node.closest('.tb-pager,.tb-sr,[aria-hidden="true"],script,style,.tb-scan-stage')) continue;
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (text.length < 3) continue;
      const isHead = node.matches(HEAD);
      if (isHead) { hid += 1; if (!node.id) node.id = `srch-h-${hid}`; head = node; }
      let target = isHead ? node : (node.closest('[id]') || head);
      if (!isHead && target && (/^(ch-|mount-)/.test(target.id) || target.tagName === 'SECTION') && head && chapter.contains(head)) target = head;
      if (!target) continue;
      const title = isHead ? text : (head ? head.textContent.replace(/\s+/g, ' ').trim() : chTitle);
      out.push({ title, text: isHead ? '' : text, id: target.id, chapter: chTitle, head: isHead, tl: norm(title), xl: norm(isHead ? '' : text) });
    }
  }
  for (const x of getSearchExtras()) {
    const t = document.getElementById(x.id);
    out.push({ title: x.title, text: x.text, id: x.id, chapter: t?.closest('.tb-chapter')?.dataset.title || '', head: !x.text, tl: norm(x.title), xl: norm(x.text) });
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
    frag.append(piece.slice(0, rel), el('mark', { text: piece.slice(rel, rel + Math.max(len, 1)) }), piece.slice(rel + Math.max(len, 1)));
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
    const key = `${r.e.chapter}|${r.e.tl}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...r.e, units });
    if (out.length >= 30) break;
  }
  return out;
}

/** Wire an input + results list. */
export function attachSearch(input, list, { onPick, onEscape } = {}) {
  let timer = 0;
  // One polite status line ("12 results") instead of a live region on the whole list.
  const status = el('p', { class: 'tb-sr', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  list.after(status);
  let lastMsg = '';
  const say = (msg) => { if (msg === lastMsg) return; lastMsg = msg; status.textContent = msg; };
  const render = () => {
    const q = input.value.trim();
    list.textContent = '';
    if (!q) { say(''); return; }
    if (Date.now() - builtAt > 4000) buildIndex();
    const res = runSearch(q);
    if (!res.length) { list.append(el('li', { class: 'tb-sres-none', text: 'No results. Try another word, for example a block, a muscle or an operation.' })); say('No results'); return; }
    say(`${res.length} result${res.length === 1 ? '' : 's'}`);
    for (const r of res) {
      const a = el('a', { class: 'tb-sres', href: `#${r.id}` },
        el('span', { class: 'tb-sres-t', text: r.title }),
        el('span', { class: 'tb-sres-c', text: r.chapter }),
        el('span', { class: 'tb-sres-s' }, snippet(r.head && !r.text ? r.title : (r.text || r.title), r.units)));
      a.addEventListener('click', () => onPick?.());
      list.append(el('li', {}, a));
    }
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 160); });
  input.addEventListener('focus', () => { if (Date.now() - builtAt > 4000) buildIndex(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); render(); $('a', list)?.click(); }
    else if (e.key === 'ArrowDown') { const f = $('a', list); if (f) { e.preventDefault(); f.focus(); } }
    else if (e.key === 'Escape') { input.value = ''; list.textContent = ''; say(''); onEscape?.(); }
  });
  input.addEventListener('search', () => { if (!input.value) { list.textContent = ''; say(''); } });
  list.addEventListener('keydown', (e) => {
    const links = $$('a', list);
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(i + 1, links.length - 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i ? links[i - 1] : input).focus(); }
    else if (e.key === 'Escape') { input.focus(); input.value = ''; list.textContent = ''; say(''); onEscape?.(); }
  });
  return { render };
}
