// Regional anaesthesia app: renders one block chapter from a data object (schema: shared/regional/DATA.md, "Block schema").
// Order: header + at a glance, scan viewer, position, equipment, landmarks and scanning, approach, sonoanatomy,
// target and deposition, dose (+ LAST reminder), coverage (map, mechanism, density), Anatomy in 3D, Watch the
// animation, complications, "If it goes wrong" decision guides, pearls, extra sections, exam corner. Element ids are prefixed with the block id,
// e.g. #tap-dose, #tap-exam, #tap-step-needle.
//
// Levels (plan §5): every section gets data-tier="1|2|3" from DEFAULT_TIERS (or the block's `tiers` map, a section's
// own `tier`, or `safety: true`). Dose, LAST line, complications and the "If it goes wrong" guides are always tier 1. Pearls: the first 3 are tier 1,
// the rest tier 2. Array items may be {tier, html} (or {safety: true, html}) instead of a plain string.
import { el, fill, callout } from './ui.js';
import { mountScan } from './scan.js';
import { coverageMap } from './dermatomes.js';
import { prepare } from './scene.js';
import { tierBadge } from './levels.js?v=20261015'; // same URL as brachial-plexus, plexus, spinal and /blocks/: one level state per page
import { getBlock } from './registry.js';
import { doseQuery } from './la.js';
import { guideList } from './decide.js';
import { guidesFor } from './data/decisions.js';

export const LAST_LINE = 'Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks or when combining blocks.';

/** Site root (…/), worked out from this module's own URL so it holds on every page depth. */
const ROOT = new URL('../../../', import.meta.url).href;

/** Default tier for each top-level section key (plan §5). */
export const DEFAULT_TIERS = Object.freeze({
  head: 1, intro: 1, rapid: 1, scan: 1, position: 1, equipment: 1, dose: 1, complications: 1, wrong: 1, pearls: 1, warning: 1,
  landmarks: 2, approach: 2, sonoanatomy: 2, target: 2, coverage: 2, anatomy3d: 2, watch: 2, exam: 2, sections: 2,
});
/** Sections that can never be hidden at MO level (enforced here and by shared/regional/test/levels.mjs). */
export const SAFETY_KEYS = Object.freeze(['dose', 'complications', 'wrong']);
/** Pearls shown at MO level before the rest become Resident. */
export const MO_PEARLS = 3;

// Extra sections[] default to tier 2; these are Consultant (tier 3) by id or title, and these are safety (tier 1).
const TIER3_ID = /^(consultant|frontier|catheters?|nerve-?stim\w*|landmarks?|landmark-\w+|approaches|alt|alternatives?)$/i;
const TIER3_TITLE = /^(consultant corner|frontier|catheters?\b|nerve stimulat|alternative:|landmark (technique|field|approach)|before ultrasound: landmark)/i;
const SAFETY_TITLE = /contraindication/i;

const clampTier = (t) => (t === 1 || t === 2 || t === 3 ? t : null);
const isObj = (v) => v != null && typeof v === 'object' && !Array.isArray(v) && !(typeof Node !== 'undefined' && v instanceof Node);
/** A section value or list item may be {tier, safety, html}: split it into its content and its own tier. */
function unwrap(v) {
  if (isObj(v) && ('html' in v || 'tier' in v || 'safety' in v)) return { content: v.html, tier: v.safety ? 1 : clampTier(Number(v.tier)) };
  return { content: v, tier: null };
}
const tag = (node, tier) => { if (node && tier) node.dataset.tier = String(tier); return node; };

/** The tier of a top-level section key on block b (a block's `tiers` map overrides; safety keys stay at 1). */
export function sectionTier(b, key, own = null) {
  if (SAFETY_KEYS.includes(key)) return 1;
  return clampTier(Number(b.tiers?.[key])) || own || DEFAULT_TIERS[key] || 2;
}

/** Default tier of an extra `sections[]` entry. */
export function extraTier(x) {
  if (x.safety) return 1;
  const own = clampTier(Number(x.tier));
  if (own) return own;
  if (SAFETY_TITLE.test(x.title || '')) return 1;
  if (TIER3_ID.test(x.id || '') || TIER3_TITLE.test(x.title || '')) return 3;
  return 2;
}

/** <ul>/<ol> from items (strings, Nodes or {tier, html}); `tierFor(i)` gives the default tier of item i (or null). */
function list(items, cls, tierFor, parentTier = 1) {
  const ul = el('ul', { class: cls });
  (items || []).forEach((it, i) => {
    const { content, tier } = unwrap(it);
    const t = tier || tierFor?.(i) || null;
    ul.append(tag(fill(el('li'), content), t && t > parentTier ? t : null));
  });
  return ul;
}
const asNode = (content, tag_ = 'div', cls, parentTier = 1) => {
  const { content: c } = unwrap(content);
  return Array.isArray(c) ? list(c, cls, null, parentTier) : fill(el(tag_, { class: cls }), c);
};

/**
 * Long prose at tier 2 or 3 (more than 3 paragraphs, prose only): keep the first paragraph and fold the rest into a
 * <details> (the generic version of the thigh page's more()). Sections with figures, tables, canvases or their own
 * <details> are left alone.
 */
function foldLong(body, title) {
  if (!body || body.nodeType !== 1) return;
  const kids = [...body.children];
  if (kids.length < 3 || kids.some((k) => !/^(P|UL|OL|H4|BLOCKQUOTE)$/.test(k.tagName))) return;
  if (body.querySelector('details,figure,table,canvas,svg,iframe,button,input,select')) return;
  const paras = kids.reduce((n, k) => n + (k.tagName === 'P' ? 1 : (k.tagName === 'UL' || k.tagName === 'OL') ? k.children.length : 0), 0);
  if (paras <= 3) return;
  const d = el('details', { class: 'tb-details ra-more' });
  d.append(el('summary', { text: `Read more: ${title}` }));
  const inner = el('div', { class: 'tb-details-body tb-prose' });
  kids.slice(1).forEach((k) => inner.append(k));
  d.append(inner);
  body.append(d);
}

function section(b, key, title, tier, ...content) {
  const s = el('section', { class: `tb-bsec tb-bsec--${key}`, id: `${b.id}-${key}`, 'aria-labelledby': `${b.id}-${key}-h` });
  tag(s, tier);
  s.append(el('h3', { id: `${b.id}-${key}-h`, text: title }));
  content.forEach((c) => c != null && s.append(c));
  return s;
}

/** The dose line as a Node: "20 ml of 0.3% ropivacaine per side" + note + LAST reminder (a `source` field is ignored). */
export function doseBox(b) {
  const d = b.dose || {};
  const box = el('div', { class: 'tb-dose', id: `${b.id}-dose-box`, 'data-safety': 'dose' });
  const line = el('p', { class: 'tb-dose-line' });
  if (d.html) fill(line, d.html);
  else {
    line.append(el('span', { class: 'tb-dose-v', text: d.volume || '' }));
    if (d.conc || d.drug) line.append(' of ', el('span', { class: 'tb-dose-v', text: `${d.conc || ''}` }), ` ${d.drug || ''}`);
    if (d.per) line.append(` ${d.per}`);
  }
  box.append(el('p', { class: 'tb-dose-k', text: 'Usual volume and concentration' }), line);
  if (d.note) box.append(fill(el('p', { class: 'tb-dose-note' }), d.note));
  box.append(el('p', { class: 'tb-dose-last', 'data-safety': 'last' }, el('strong', { text: 'Local anaesthetic toxicity: ' }), b.last || LAST_LINE));
  return box;
}

/** URL of the dose calculator (the Safety page's Dose calculator half), prefilled with what the block's dose box says where that reads unambiguously. */
export function doseCheckHref(b) {
  let q = '';
  try { q = doseQuery(b?.dose); } catch { q = ''; }
  return `${ROOT}blocks/safety/${q ? `?${q}` : ''}#calculator`;
}

/** "Check the dose for this patient →" under the dose box (tier 1 with it). `dose.calc: false` leaves it out. */
function doseCheck(b) {
  if (b.dose?.calc === false) return null;
  return el('p', { class: 'tb-dose-check', id: `${b.id}-dose-check`, style: { margin: '14px 0 0' } },
    el('a', { class: 'tb-btn', href: doseCheckHref(b) }, 'Check the dose for this patient ', el('span', { 'aria-hidden': 'true', text: '→' })));
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

function exam(b, parentTier) {
  const box = el('div', { class: 'tb-exam' });
  (b.exam || []).forEach((q, i) => {
    const art = el('article', { class: 'tb-exam-q', id: q.id || `${b.id}-exam-${i + 1}` });
    const t = q.safety ? 1 : clampTier(Number(q.tier));
    if (t && t > parentTier) art.dataset.tier = String(t);
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

// ---------------------------------------------------------------- Anatomy in 3D card (§6, §8)
/** {plexus, block?, el?} → '/plexus/#…'; {app:'brachial-plexus', block, el?, tab?} → '/brachial-plexus/#…'. Site-root relative. */
export function anatomyHref(a) {
  if (!a) return null;
  if (a.app === 'brachial-plexus' || a.app === 'brachial') {
    const p = new URLSearchParams();
    if (a.block) p.set('block', a.block);
    if (a.el) p.set('el', a.el);
    if (a.tab) p.set('tab', a.tab);
    const h = p.toString();
    return `${ROOT}brachial-plexus/${h ? `#${h}` : ''}`;
  }
  if (!a.plexus) return null;
  const p = new URLSearchParams({ plexus: a.plexus });
  if (a.el) p.set('el', a.el);
  if (a.block) p.set('block', a.block);
  return `${ROOT}plexus/#${p}`;
}

/** Open inline explorers: only one lives on a page (each holds a WebGL context and the model). */
const liveA3d = new Set();

function anatomyCard(b, a, tier) {
  const href = anatomyHref(a);
  if (!href) return null;
  const isPlexus = !!a.plexus && a.app !== 'brachial-plexus' && a.app !== 'brachial';
  const name = isPlexus ? `the ${a.plexus} plexus` : 'the brachial plexus';
  const body = el('div', { class: 'ra-a3d' });
  body.append(el('p', { class: 'ra-a3d-lead', text: `See the nerves in 3D: turn ${name} around, tap a nerve to see where it goes, and see which nerves this block reaches.` }));
  const actions = el('div', { class: 'ra-a3d-actions' });
  actions.append(el('a', { class: 'tb-btn', href }, isPlexus ? 'Open the 3D explorer ' : 'Open the brachial plexus app ', el('span', { 'aria-hidden': 'true', text: '→' })));
  const host = el('div', { class: 'ra-a3d-host', hidden: true });
  if (isPlexus) {
    // "Open here": the explorer (and three.js) is only fetched when this is tapped. Hidden on phones (≤600px), where
    // the explorer page itself works better than an explorer inside a narrow card. Close unloads it.
    const open = el('button', { type: 'button', class: 'tb-btn ra-a3d-open', 'aria-expanded': 'false', text: 'Open here' });
    let api = null;
    let busy = false;
    const closer = { close() {
      host.hidden = true; open.setAttribute('aria-expanded', 'false'); open.textContent = 'Open here';
      try { api?.destroy?.(); } catch { /* already gone */ }
      api = null; host.textContent = ''; liveA3d.delete(closer);
    } };
    open.addEventListener('click', async () => {
      if (!host.hidden) { closer.close(); return; }
      if (busy) return;
      [...liveA3d].forEach((c) => c.close());
      liveA3d.add(closer);
      host.hidden = false; open.setAttribute('aria-expanded', 'true'); open.textContent = 'Close';
      busy = true;
      host.textContent = '';
      host.append(el('p', { class: 'ra-a3d-loading', role: 'status', text: 'Loading the 3D model…' }));
      try {
        const mod = await import(`${ROOT}plexus/js/explorer.js`);
        if (typeof mod.mountExplorer !== 'function') throw new Error('mountExplorer missing');
        if (host.hidden) return; // closed while loading
        host.textContent = '';
        api = await mod.mountExplorer(host, { plexus: a.plexus, block: a.block, el: a.el });
        if (host.hidden) closer.close();
      } catch (err) {
        console.warn('[regional] inline 3D explorer unavailable', err);
        host.textContent = '';
        host.append(el('p', { class: 'ra-a3d-error', role: 'status' }, 'The 3D view could not load here. ', el('a', { href }, 'Open the 3D explorer ', el('span', { 'aria-hidden': 'true', text: '→' }))));
      } finally { busy = false; }
    });
    actions.append(open);
  }
  // Upper-limb blocks also open in the brachial plexus app (its 3D model, labelled diagram and coverage for this block):
  // anatomy3d.brachialApp = {block?, el?, tab?}.
  if (isPlexus && a.brachialApp) {
    const href2 = anatomyHref({ app: 'brachial-plexus', ...a.brachialApp });
    actions.append(el('a', { class: 'tb-btn ra-a3d-app', href: href2 }, 'Open in the brachial plexus app ', el('span', { 'aria-hidden': 'true', text: '→' })));
  }
  body.append(actions, host);
  return section(b, 'anatomy3d', 'Anatomy in 3D', tier, body);
}

// ---------------------------------------------------------------- Watch the animation (§6)
const ANIM_ROOT = `${ROOT}lower-limb/anim/`;
let animListener = false;
function listenAnimHeights() {
  if (animListener) return;
  animListener = true;
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin) return;
    const h = e.data && e.data.raEmbedHeight;
    if (!h) return;
    for (const f of document.querySelectorAll('iframe.ra-watch-frame')) if (f.contentWindow === e.source) f.style.height = `${Math.ceil(h)}px`;
  });
}
/** Only one animation iframe lives on a page: opening one closes (and unloads) any other. */
function closeOtherWatches(keep) {
  document.querySelectorAll('details.ra-watch[open], details.ll-anim[open]').forEach((d) => { if (d !== keep) d.open = false; });
}

function watchCard(b, w, tier) {
  if (!w?.anim) return null;
  const d = el('details', { class: 'tb-details ra-watch', id: `${b.id}-watch-anim` });
  d.append(el('summary', { text: w.label || 'Watch the animation' }));
  const body = el('div', { class: 'tb-details-body' });
  d.append(body);
  d.addEventListener('toggle', () => {
    if (d.open) {
      closeOtherWatches(d);
      listenAnimHeights();
      const src = `${ANIM_ROOT}?embed=1#${encodeURIComponent(w.anim)}${w.variant ? `/${encodeURIComponent(w.variant)}` : ''}`;
      body.textContent = '';
      body.append(el('figure', { class: 'ra-watch-fig' },
        el('iframe', { class: 'ra-watch-frame', src, title: `${w.title || b.title}: press Play to watch the needle and the spread`, allow: 'fullscreen' }),
        fill(el('figcaption', { class: 'ra-watch-cap' }), `${w.caption ? `${w.caption} ` : ''}Animation by <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>. Tap Full screen and turn the phone sideways for the largest view.`)));
    } else {
      body.textContent = ''; // unload the iframe so only one animation runs
    }
  });
  return section(b, 'watch', 'Watch it done', tier, d);
}

/** Badge the first section of each run of tier ≥ 2 among the chapter's top-level sections. */
function badgeRuns(host) {
  let prev = 1;
  for (const s of host.querySelectorAll(':scope > .tb-bsec, :scope > .tb-bgrid > .tb-bsec')) {
    const t = Number(s.dataset.tier || 1);
    if (t > 1 && t !== prev) { const bd = tierBadge(t); if (bd) s.prepend(bd); }
    prev = t;
  }
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
  if (b.rapid) host.append(tag(callout('key', { label: 'The 20-second version', body: Array.isArray(b.rapid) ? `<ul>${b.rapid.map((x) => `<li>${x}</li>`).join('')}</ul>` : b.rapid }), 1));
  if (b.intro) {
    const { content, tier } = unwrap(b.intro);
    host.append(tag(asNode(content, 'div', 'tb-prose'), tier && tier > 1 ? tier : null));
  }

  let scan = null;
  if (b.scene) {
    const wrap = el('div', { class: 'tb-scan-wrap', 'data-tier': '1' });
    host.append(wrap);
    scan = mountScan(wrap, b.scene, { blockId: b.id });
  }

  // A plain section from a data key: its value may be a string, an array or {tier, html}.
  const plain = (key, title, cls = 'tb-prose') => {
    const { content, tier } = unwrap(b[key]);
    const t = sectionTier(b, key, tier);
    const body = asNode(content, 'div', cls, t);
    if (t >= 2) foldLong(body, title);
    return section(b, key, title, t, body);
  };

  const setup = el('div', { class: 'tb-bgrid' });
  if (b.position) setup.append(plain('position', 'Position'));
  if (b.equipment) setup.append(plain('equipment', 'Equipment'));
  if (setup.children.length) host.append(setup);
  if (b.landmarks) host.append(plain('landmarks', b.landmarksTitle || 'Landmarks and scanning'));
  if (b.approach) host.append(plain('approach', 'Needle approach'));
  if (b.sonoanatomy || b.scene) {
    const { content, tier } = unwrap(b.sonoanatomy);
    const t = sectionTier(b, 'sonoanatomy', tier);
    host.append(section(b, 'sonoanatomy', 'Sonoanatomy', t, content ? asNode(content, 'div', 'tb-prose', t) : null, b.scene ? layerList(b.scene) : null));
  }
  if (b.target) host.append(plain('target', 'Target and deposition'));
  if (b.dose) host.append(section(b, 'dose', 'Dose', 1, doseBox(b), doseCheck(b)));
  if (b.coverage) {
    const c = b.coverage;
    const t = sectionTier(b, 'coverage', clampTier(Number(c.tier)));
    const text = el('div', { class: 'tb-cov-text' });
    if (c.summary) text.append(el('p', { class: 'tb-cov-sum' }, el('strong', { text: 'Covers: ' }), c.summary));
    if (c.mechanism) text.append(el('h4', { text: 'Mechanism' }), asNode(c.mechanism, 'div', 'tb-prose', t));
    if (c.density) text.append(el('h4', { text: 'How dense, how reliable' }), asNode(c.density, 'div', 'tb-prose', t));
    if (c.misses) text.append(el('h4', { text: 'What it misses' }), asNode(c.misses, 'div', 'tb-prose', t));
    // c.map: a page's own map function (same arguments as coverageMap), or false for no map.
    const map = c.map === false ? null : (typeof c.map === 'function' ? c.map : coverageMap)(c, { id: `${b.id}-covmap`, title: b.title });
    host.append(section(b, 'coverage', 'Coverage', t, el('div', { class: `tb-cov-grid${map ? '' : ' tb-cov-grid--text'}` }, ...(map ? [map] : []), text)));
  }
  const a3d = b.anatomy3d === false ? null : (b.anatomy3d || getBlock(b.id)?.anatomy3d);
  if (a3d) { const card = anatomyCard(b, a3d, sectionTier(b, 'anatomy3d', clampTier(Number(a3d.tier)))); if (card) host.append(card); }
  const w = b.watch === false ? null : (b.watch || getBlock(b.id)?.watch);
  if (w) { const card = watchCard(b, w, sectionTier(b, 'watch', clampTier(Number(w.tier)))); if (card) host.append(card); }
  if (b.complications) host.append(section(b, 'complications', 'Complications and how to avoid them', 1, asNode(unwrap(b.complications).content, 'div', 'tb-prose tb-list', 1)));
  // "If it goes wrong": the decision guides for this block (shared/regional/js/data/decisions.js), always MO level.
  // b.wrong: false hides the section; an array of guide ids adds guides to the ones the block id and region give.
  const wrong = b.wrong === false ? [] : guidesFor(b.id, getBlock(b.id)?.region || null, Array.isArray(b.wrong) ? b.wrong : []);
  if (wrong.length) {
    host.append(section(b, 'wrong', 'If it goes wrong', 1,
      el('p', { class: 'ra-dg-lead', text: 'Step-by-step guides for the problems this block can cause. Open one and answer each question: it shows the next thing to do.' }),
      guideList(wrong, { idPrefix: `${b.id}-wrong`, headingLevel: 4 }),
      el('p', { class: 'ra-dg-more' }, el('a', { href: `${ROOT}blocks/safety/` }, 'Every guide on one page ', el('span', { 'aria-hidden': 'true', text: '→' })))));
  }
  if (b.pearls?.length) {
    // First MO_PEARLS plain pearls are MO; the rest Resident. A pearl's own {tier} or {safety:true} wins.
    host.append(section(b, 'pearls', 'Practical pearls', 1, list(b.pearls, 'tb-pearls', (i) => (i < MO_PEARLS ? 1 : 2), 1)));
  }
  (b.sections || []).forEach((x) => {
    const t = extraTier(x);
    const s = section(b, x.id, x.title, t);
    if (x.html) {
      const body = asNode(x.html, 'div', 'tb-prose', t);
      if (t >= 2 && typeof x.render !== 'function') foldLong(body, x.title);
      s.append(body);
    }
    if (typeof x.render === 'function') x.render(s);
    host.append(s);
  });
  if (b.exam?.length) {
    const t = sectionTier(b, 'exam');
    const s = section(b, 'exam', 'Exam corner', t, exam(b, t));
    s.classList.add('tb-bsec--examcorner');
    host.append(s);
  }
  if (b.warning) host.append(tag(callout('warn', b.warning), 1));
  badgeRuns(host);
  return { scan };
}
