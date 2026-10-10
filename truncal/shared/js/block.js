// Truncal blocks: renders one block chapter from a data object (schema: shared/DATA.md, "Block schema").
// Order: header + at a glance, scan viewer, position, equipment, landmarks and scanning, approach, sonoanatomy,
// target and deposition, dose (+ LAST reminder), coverage (map, mechanism, density), complications, pearls,
// exam corner. Element ids are prefixed with the block id, e.g. #tap-dose, #tap-exam, #tap-step-needle.
import { el, fill, callout } from './ui.js';
import { mountScan } from './scan.js';
import { coverageMap } from './dermatomes.js';
import { prepare } from './scene.js';

export const LAST_LINE = 'Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks or when combining blocks.';

const list = (items, cls) => { const ul = el('ul', { class: cls }); (items || []).forEach((it) => ul.append(fill(el('li'), it))); return ul; };
const asNode = (content, tag = 'div', cls) => (Array.isArray(content) ? list(content, cls) : fill(el(tag, { class: cls }), content));

function section(b, key, title, ...content) {
  const s = el('section', { class: `tb-bsec tb-bsec--${key}`, id: `${b.id}-${key}`, 'aria-labelledby': `${b.id}-${key}-h` });
  s.append(el('h3', { id: `${b.id}-${key}-h`, text: title }));
  content.forEach((c) => c != null && s.append(c));
  return s;
}

/** The dose line as a Node: "20 ml of 0.3% ropivacaine per side" + note + LAST reminder (a `source` field is ignored). */
export function doseBox(b) {
  const d = b.dose || {};
  const box = el('div', { class: 'tb-dose', id: `${b.id}-dose-box` });
  const line = el('p', { class: 'tb-dose-line' });
  if (d.html) fill(line, d.html);
  else {
    line.append(el('span', { class: 'tb-dose-v', text: d.volume || '' }));
    if (d.conc || d.drug) line.append(' of ', el('span', { class: 'tb-dose-v', text: `${d.conc || ''}` }), ` ${d.drug || ''}`);
    if (d.per) line.append(` ${d.per}`);
  }
  box.append(el('p', { class: 'tb-dose-k', text: 'Usual volume and concentration' }), line);
  if (d.note) box.append(fill(el('p', { class: 'tb-dose-note' }), d.note));
  box.append(el('p', { class: 'tb-dose-last' }, el('strong', { text: 'Local anaesthetic toxicity: ' }), b.last || LAST_LINE));
  return box;
}

function glance(b) {
  const g = b.glance || {};
  const rows = [
    ['Position', g.position], ['Probe', g.probe], ['Needle', g.needle],
    ['Dose', g.dose || (b.dose && !b.dose.html ? `${b.dose.volume || ''}${b.dose.conc ? ` of ${b.dose.conc}` : ''} ${b.dose.drug || ''}`.trim() : null)],
    ['Covers', g.covers || b.coverage?.summary],
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  const dl = el('dl', { class: 'tb-glance', 'aria-label': 'At a glance' });
  rows.forEach(([k, v]) => dl.append(el('div', {}, el('dt', { text: k }), fill(el('dd'), v))));
  return dl;
}

function layerList(scene) {
  const g = prepare(scene);
  const items = g.layers.filter((l) => l.label && !l.nolabel).map((l) => l.label);
  if (!items.length) return null;
  const ol = el('ol', { class: 'tb-layers', 'aria-label': 'Layers from superficial to deep' });
  items.forEach((t) => ol.append(el('li', { text: t })));
  return el('div', { class: 'tb-layers-wrap' }, el('p', { class: 'tb-layers-k', text: 'Superficial to deep' }), ol);
}

function exam(b) {
  const box = el('div', { class: 'tb-exam' });
  (b.exam || []).forEach((q, i) => {
    const art = el('article', { class: 'tb-exam-q', id: q.id || `${b.id}-exam-${i + 1}` });
    art.append(el('p', { class: 'tb-exam-src', text: q.source || 'Exam question' }));
    art.append(fill(el('div', { class: 'tb-exam-text' }), q.q));
    if (q.points?.length) {
      const d = el('details', { class: 'tb-details tb-exam-ans' });
      d.append(el('summary', { text: 'Model answer points' }), list(q.points, 'tb-exam-pts'));
      art.append(d);
    }
    box.append(art);
  });
  return box;
}

/**
 * renderBlock(block, host) → renders the chapter body into host (a .tb-chapter section).
 * Returns {scan} (the scan viewer API) when the block has a scene.
 */
export function renderBlock(b, host) {
  const head = el('header', { class: 'tb-bhead' });
  if (b.kicker) head.append(el('p', { class: 'tb-eyebrow', text: b.kicker }));
  head.append(el('h2', { id: `${b.id}-h`, text: b.title }));
  if (b.summary) head.append(fill(el('p', { class: 'tb-lead' }), b.summary));
  if (b.indications?.length) head.append(el('div', { class: 'tb-ind' }, el('p', { class: 'tb-ind-k', text: 'Use it for' }), list(b.indications, 'tb-ind-list')));
  const gl = glance(b); if (gl) head.append(gl);
  host.append(head);
  if (b.intro) host.append(asNode(b.intro, 'div', 'tb-prose'));

  let scan = null;
  if (b.scene) {
    const wrap = el('div', { class: 'tb-scan-wrap' });
    host.append(wrap);
    scan = mountScan(wrap, b.scene, { blockId: b.id });
  }

  const setup = el('div', { class: 'tb-bgrid' });
  if (b.position) setup.append(section(b, 'position', 'Position', asNode(b.position, 'div', 'tb-prose')));
  if (b.equipment) setup.append(section(b, 'equipment', 'Equipment', asNode(b.equipment, 'div', 'tb-prose')));
  if (setup.children.length) host.append(setup);
  if (b.landmarks) host.append(section(b, 'landmarks', b.landmarksTitle || 'Landmarks and scanning', asNode(b.landmarks, 'div', 'tb-prose')));
  if (b.approach) host.append(section(b, 'approach', 'Needle approach', asNode(b.approach, 'div', 'tb-prose')));
  if (b.sonoanatomy || b.scene) host.append(section(b, 'sonoanatomy', 'Sonoanatomy', b.sonoanatomy ? asNode(b.sonoanatomy, 'div', 'tb-prose') : null, b.scene ? layerList(b.scene) : null));
  if (b.target) host.append(section(b, 'target', 'Target and deposition', asNode(b.target, 'div', 'tb-prose')));
  if (b.dose) host.append(section(b, 'dose', 'Dose', doseBox(b)));
  if (b.coverage) {
    const c = b.coverage;
    const text = el('div', { class: 'tb-cov-text' });
    if (c.summary) text.append(el('p', { class: 'tb-cov-sum' }, el('strong', { text: 'Covers: ' }), c.summary));
    if (c.mechanism) text.append(el('h4', { text: 'Mechanism' }), asNode(c.mechanism, 'div', 'tb-prose'));
    if (c.density) text.append(el('h4', { text: 'How dense, how reliable' }), asNode(c.density, 'div', 'tb-prose'));
    if (c.misses) text.append(el('h4', { text: 'What it misses' }), asNode(c.misses, 'div', 'tb-prose'));
    host.append(section(b, 'coverage', 'Coverage', el('div', { class: 'tb-cov-grid' }, coverageMap(c, { id: `${b.id}-covmap`, title: b.title }), text)));
  }
  if (b.complications) host.append(section(b, 'complications', 'Complications and how to avoid them', asNode(b.complications, 'div', 'tb-prose tb-list')));
  if (b.pearls?.length) host.append(section(b, 'pearls', 'Practical pearls', list(b.pearls, 'tb-pearls')));
  (b.sections || []).forEach((x) => {
    const s = section(b, x.id, x.title);
    if (x.html) s.append(asNode(x.html, 'div', 'tb-prose'));
    if (typeof x.render === 'function') x.render(s);
    host.append(s);
  });
  if (b.exam?.length) {
    const s = section(b, 'exam', 'Exam corner', exam(b));
    s.classList.add('tb-bsec--examcorner');
    host.append(s);
  }
  if (b.warning) host.append(callout('warn', b.warning));
  return { scan };
}
