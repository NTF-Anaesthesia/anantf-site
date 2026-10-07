// Brachial plexus schematic: original, labelled, interactive inline SVG.
// Left to right: roots -> trunks -> divisions -> cords -> terminal branches,
// with collateral branches as labelled stubs. Colour-coded by cord.
//
// API:
//   mount(containerEl, bus) -> { destroy() }
//   CORD_COLOURS, CORD_COLOURS_DARK  : palette (hex) by colour key
//   colourKeyFor(id)                 : 'lateral' | 'posterior' | 'medial' | 'median' | 'neutral' | 'related'
//   colourFor(id, dark=false)        : hex colour for an element id
//   LEVEL_BANDS                      : x-ranges (SVG user units) of each block band
//
// Bus events (all with source: 'diagram'): 'hover' {id}, 'select' {id}. Listens to 'select', 'hover', 'block'.

import {
  ELEMENTS, ELEMENT_ORDER, LEVELS, BLOCKS, getPathway, blockStatus,
} from './data.js';

const SOURCE = 'diagram';
const SVGNS = 'http://www.w3.org/2000/svg';

export const CORD_COLOURS = {
  // Nerves are yellow throughout the app (arteries red, veins blue); the
  // cord families keep separate keys so a cord palette can be restored later.
  lateral: '#a87d00',
  posterior: '#a87d00',
  medial: '#a87d00',
  median: '#a87d00',
  neutral: '#a87d00',  // roots and trunks
  related: '#7c5a3a',  // nerves outside the plexus
};
export const CORD_COLOURS_DARK = {
  lateral: '#facc15',
  posterior: '#facc15',
  medial: '#facc15',
  median: '#facc15',
  neutral: '#facc15',
  related: '#d6b08c',
};

const KEY_CLASS = { lateral: 'k-lat', posterior: 'k-post', medial: 'k-med', median: 'k-median', neutral: 'k-neutral', related: 'k-related' };

const COLOUR_KEY = {
  'div-sup-ant': 'lateral', 'div-mid-ant': 'lateral', 'cord-lat': 'lateral',
  'div-sup-post': 'posterior', 'div-mid-post': 'posterior', 'div-inf-post': 'posterior', 'cord-post': 'posterior',
  'div-inf-ant': 'medial', 'cord-med': 'medial',
  'n-median': 'median',
};

export function colourKeyFor(id) {
  if (COLOUR_KEY[id]) return COLOUR_KEY[id];
  const el = ELEMENTS[id];
  if (!el) return 'neutral';
  if (el.level === 'related') return 'related';
  if (el.level === 'root' || el.level === 'trunk') return 'neutral';
  const p = el.parents[0];
  return p ? colourKeyFor(p) : 'neutral';
}

export function colourFor(id, dark = false) {
  return (dark ? CORD_COLOURS_DARK : CORD_COLOURS)[colourKeyFor(id)];
}

// ---------------------------------------------------------------------------
// Geometry (SVG user units). viewBox: 0 -72 1220 836
// ---------------------------------------------------------------------------
const VB = { x: 0, y: -72, w: 1220, h: 836 };
const Y = { sup: 200, mid: 380, inf: 560, c5: 120, c6: 270, c7: 380, c8: 490, t1: 640 };

const COLUMNS = [
  { level: 'root', x0: 14, x1: 250, sub: 'Between the scalenes' },
  { level: 'trunk', x0: 250, x1: 430, sub: 'Over the 1st rib' },
  { level: 'division', x0: 430, x1: 600, sub: 'Behind the clavicle' },
  { level: 'cord', x0: 600, x1: 860, sub: 'Around axillary a. (2nd part)' },
  { level: 'terminal', x0: 860, x1: 1206, sub: 'Axilla (3rd part of artery)' },
];

export const LEVEL_BANDS = {
  interscalene: { x0: 64, x1: 250 },
  supraclavicular: { x0: 250, x1: 600 },
  infraclavicular: { x0: 600, x1: 860 },
  axillary: { x0: 860, x1: 1206 },
};

const ROOT_CURVES = {
  'root-c5': [[80, Y.c5], [170, Y.c5], [210, 150], [250, Y.sup]],
  'root-c6': [[80, Y.c6], [170, Y.c6], [210, 250], [250, Y.sup]],
  'root-c8': [[80, Y.c8], [170, Y.c8], [210, 510], [250, Y.inf]],
  'root-t1': [[80, Y.t1], [170, Y.t1], [210, 610], [250, Y.inf]],
};
const cubicPath = (c) => `M${c[0]} C${c[1]} ${c[2]} ${c[3]}`;
function cubicYAtX(c, x) {
  let lo = 0, hi = 1;
  const bx = (t) => (1 - t) ** 3 * c[0][0] + 3 * (1 - t) ** 2 * t * c[1][0] + 3 * (1 - t) * t * t * c[2][0] + t ** 3 * c[3][0];
  for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
  const t = (lo + hi) / 2;
  return (1 - t) ** 3 * c[0][1] + 3 * (1 - t) ** 2 * t * c[1][1] + 3 * (1 - t) * t * t * c[2][1] + t ** 3 * c[3][1];
}
const c5At = (x) => cubicYAtX(ROOT_CURVES['root-c5'], x);
const c6At = (x) => cubicYAtX(ROOT_CURVES['root-c6'], x);

const LT_X = 186;
const stub = (x, y0, x1, y1) => `M${x} ${y0} Q${x} ${y1} ${x1} ${y1}`;

// label: {x, y, a(nchor), t(ype): root|struct|term|coll, text?, sp?: bool (second line with spinal), k?: use colour}
const GEOM = {
  // Roots
  'root-c5': { d: [cubicPath(ROOT_CURVES['root-c5'])], w: 'w-xl', label: { x: 28, y: Y.c5 + 9, t: 'root' } },
  'root-c6': { d: [cubicPath(ROOT_CURVES['root-c6'])], w: 'w-xl', label: { x: 28, y: Y.c6 + 9, t: 'root' } },
  'root-c7': { d: [`M80 ${Y.c7} L250 ${Y.c7}`], w: 'w-xl', label: { x: 28, y: Y.c7 + 9, t: 'root' } },
  'root-c8': { d: [cubicPath(ROOT_CURVES['root-c8'])], w: 'w-xl', label: { x: 28, y: Y.c8 + 9, t: 'root' } },
  'root-t1': { d: [cubicPath(ROOT_CURVES['root-t1'])], w: 'w-xl', label: { x: 28, y: Y.t1 + 9, t: 'root' } },
  // Trunks
  'trunk-sup': { d: [`M250 ${Y.sup} L430 ${Y.sup}`], w: 'w-xl', label: { x: 340, y: Y.sup + 26, a: 'middle', t: 'struct', text: 'Superior trunk' } },
  'trunk-mid': { d: [`M250 ${Y.mid} L430 ${Y.mid}`], w: 'w-xl', label: { x: 340, y: Y.mid + 26, a: 'middle', t: 'struct', text: 'Middle trunk' } },
  'trunk-inf': { d: [`M250 ${Y.inf} L430 ${Y.inf}`], w: 'w-xl', label: { x: 340, y: Y.inf + 26, a: 'middle', t: 'struct', text: 'Inferior trunk' } },
  // Divisions (badge A / P placed along the path)
  'div-sup-ant': { d: [`M430 ${Y.sup} L600 ${Y.sup}`], w: 'w-m', badge: { text: 'A', at: 0.3, dy: -14 } },
  'div-sup-post': { d: [`M430 ${Y.sup} C500 ${Y.sup} 530 ${Y.mid} 600 ${Y.mid}`], w: 'w-m', badge: { text: 'P', at: 0.3 } },
  'div-mid-ant': { d: [`M430 ${Y.mid} C500 ${Y.mid} 530 ${Y.sup} 600 ${Y.sup}`], w: 'w-m', badge: { text: 'A', at: 0.3 } },
  'div-mid-post': { d: [`M430 ${Y.mid} L600 ${Y.mid}`], w: 'w-m', badge: { text: 'P', at: 0.3, dy: 16 } },
  'div-inf-post': { d: [`M430 ${Y.inf} C500 ${Y.inf} 530 ${Y.mid} 600 ${Y.mid}`], w: 'w-m', badge: { text: 'P', at: 0.3 } },
  'div-inf-ant': { d: [`M430 ${Y.inf} L600 ${Y.inf}`], w: 'w-m', badge: { text: 'A', at: 0.3, dy: 16 } },
  // Cords
  'cord-lat': { d: [`M600 ${Y.sup} L860 ${Y.sup}`], w: 'w-xl', label: { x: 612, y: Y.sup - 14, t: 'struct', text: 'Lateral cord', k: true } },
  'cord-post': { d: [`M600 ${Y.mid} L860 ${Y.mid}`], w: 'w-xl', label: { x: 612, y: Y.mid + 28, t: 'struct', text: 'Posterior cord', k: true } },
  'cord-med': { d: [`M600 ${Y.inf} L860 ${Y.inf}`], w: 'w-xl', label: { x: 612, y: Y.inf - 14, t: 'struct', text: 'Medial cord', k: true } },
  // Terminal branches
  'n-musculocutaneous': { d: [`M860 ${Y.sup} L1030 ${Y.sup}`], w: 'w-l', label: { x: 1040, y: Y.sup + 2, t: 'term', sp: true, k: true, text: 'Musculocutaneous' } },
  'n-axillary': { d: [`M860 ${Y.mid} C915 ${Y.mid} 945 300 1030 300`], w: 'w-l', label: { x: 1040, y: 302, t: 'term', sp: true, k: true, text: 'Axillary' } },
  'n-radial': { d: [`M860 ${Y.mid} L1030 ${Y.mid}`], w: 'w-l', label: { x: 1040, y: Y.mid + 2, t: 'term', sp: true, k: true, text: 'Radial' } },
  'n-median': {
    d: [
      { d: `M860 ${Y.sup} C900 ${Y.sup} 920 470 960 470`, k: 'lateral' },
      { d: `M860 ${Y.inf} C900 ${Y.inf} 920 470 960 470`, k: 'medial' },
      { d: 'M960 470 L1030 470' },
    ],
    w: 'w-l', label: { x: 1040, y: 472, t: 'term', sp: true, text: 'Median' },
  },
  'n-ulnar': { d: [`M860 ${Y.inf} L1030 ${Y.inf}`], w: 'w-l', label: { x: 1040, y: Y.inf + 2, t: 'term', sp: true, k: true, text: 'Ulnar' } },
  // Collaterals
  'n-phrenic': { d: [stub(100, c5At(100), 112, 62)], w: 'w-s', label: { x: 117, y: 50, t: 'coll', sp: true, text: 'Phrenic' } },
  'n-dorsal-scapular': { d: [stub(144, c5At(144), 166, 96)], w: 'w-s', label: { x: 171, y: 88, t: 'coll', sp: true, text: 'Dorsal scapular' } },
  'n-long-thoracic': {
    d: [`M${LT_X} ${c5At(LT_X)} L${LT_X} ${Y.c7} Q${LT_X} 424 ${LT_X + 14} 426`],
    dots: [[LT_X, c5At(LT_X)], [LT_X, c6At(LT_X)], [LT_X, Y.c7]],
    w: 'w-s', label: { x: LT_X + 19, y: 430, t: 'coll', sp: true, text: 'Long thoracic' },
  },
  'n-suprascapular': { d: [stub(285, Y.sup, 297, 130)], w: 'w-s', label: { x: 302, y: 128, t: 'coll', sp: true, text: 'Suprascapular' } },
  'n-subclavius': { d: [stub(372, Y.sup, 384, 162)], w: 'w-s', label: { x: 389, y: 160, t: 'coll', sp: true, text: 'Nerve to subclavius' } },
  'n-lat-pectoral': { d: [stub(770, Y.sup, 782, 146)], w: 'w-s', label: { x: 787, y: 144, t: 'coll', sp: true, text: 'Lateral pectoral' } },
  'n-upper-subscap': { d: [stub(640, Y.mid, 652, 288)], w: 'w-s', label: { x: 657, y: 286, t: 'coll', sp: true, text: 'Upper subscapular' } },
  'n-lower-subscap': { d: [stub(826, Y.mid, 814, 342)], w: 'w-s', label: { x: 809, y: 340, a: 'end', t: 'coll', sp: true, text: 'Lower subscapular' } },
  'n-thoracodorsal': { d: [stub(752, Y.mid, 764, 452)], w: 'w-s', label: { x: 769, y: 456, t: 'coll', sp: true, text: 'Thoracodorsal' } },
  'n-med-pectoral': { d: [stub(650, Y.inf, 662, 684)], w: 'w-s', label: { x: 667, y: 688, t: 'coll', sp: true, text: 'Medial pectoral' } },
  'n-mcn-arm': { d: [stub(740, Y.inf, 752, 640)], w: 'w-s', label: { x: 757, y: 644, t: 'coll', sp: true, text: 'Med. cutaneous n. of arm' } },
  'n-mcn-forearm': { d: [stub(820, Y.inf, 832, 600)], w: 'w-s', label: { x: 837, y: 604, t: 'coll', sp: true, text: 'Med. cutaneous n. of forearm' } },
  // Outside the plexus
  'n-supraclavicular-cx': { d: ['M200 740 L248 740'], w: 'w-s', label: { x: 256, y: 745, t: 'coll', inlineSp: true, text: 'Supraclavicular nn (cervical plexus)' } },
  'n-intercostobrachial': { d: ['M700 740 L748 740'], w: 'w-s', label: { x: 756, y: 745, t: 'coll', inlineSp: true, text: 'Intercostobrachial' } },
};

const M_PATH = `M1030 ${Y.sup} L860 ${Y.sup} C900 ${Y.sup} 920 470 960 470 C920 470 900 ${Y.inf} 860 ${Y.inf} L1030 ${Y.inf}`;

const SPINAL_ORDER = ['C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'T1', 'T2'];
export function formatSpinal(list = []) {
  const s = [...list].sort((a, b) => SPINAL_ORDER.indexOf(a) - SPINAL_ORDER.indexOf(b));
  if (s.length < 2) return s.join('');
  const idx = s.map((x) => SPINAL_ORDER.indexOf(x));
  const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
  return consecutive ? `${s[0]}–${s[s.length - 1]}` : s.join(', ');
}

const LEVEL_NAME = {
  root: 'Root', trunk: 'Trunk', division: 'Division', cord: 'Cord',
  terminal: 'Terminal branch', collateral: 'Collateral branch', related: 'Related nerve (outside the plexus)',
};
const STATUS_TEXT = {
  target: 'Injection target', covers: 'Reliably blocked', variable: 'Variable / inconsistent',
  spares: 'Typically spared', none: 'Not involved at this level',
};

let uidCounter = 0;

function svgEl(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
}
function htmlEl(tag, attrs = {}, parent, text) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v; else n.setAttribute(k, v);
  }
  if (text != null) n.textContent = text;
  if (parent) parent.appendChild(n);
  return n;
}
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ---------------------------------------------------------------------------
export function mount(containerEl, bus) {
  const uid = `bpd${++uidCounter}`;
  const disposers = [];
  const on = (target, ev, fn, opts) => { target.addEventListener(ev, fn, opts); disposers.push(() => target.removeEventListener(ev, fn, opts)); };

  const st = {
    selected: bus?.state?.selected ?? null,
    hovered: bus?.state?.hovered ?? null,
    block: bus?.state?.block ?? null,
    zoomed: true,
  };

  // ---- DOM skeleton ----
  const root = htmlEl('div', { class: 'bpd' });
  root.style.setProperty('--bpd-hatch', `url(#${uid}-hatch)`);
  root.style.setProperty('--bpd-median-grad', `url(#${uid}-median)`);

  const grid = htmlEl('div', { class: 'bpd-grid' }, root);
  const main = htmlEl('div', { class: 'bpd-main' }, grid);
  main.style.minWidth = '0';
  const toolbar = htmlEl('div', { class: 'bpd-toolbar' }, main);
  htmlEl('p', {}, toolbar, 'Tap or hover any segment. Its whole pathway lights up.');
  const zoomBtn = htmlEl('button', { class: 'bpd-btn bpd-zoom', type: 'button', 'aria-pressed': 'true' }, toolbar, 'Fit to screen');

  const stage = htmlEl('div', { class: 'bpd-stage' }, main);
  const scroller = htmlEl('div', { class: 'bpd-scroll' }, stage);
  const tip = htmlEl('div', { class: 'bpd-tip', role: 'tooltip', id: `${uid}-tip` }, stage);
  htmlEl('p', { class: 'bpd-pan-hint' }, main, 'Swipe sideways to see the whole plexus.');

  const legend = htmlEl('ul', { class: 'bpd-legend', 'aria-label': 'Diagram key' }, main);
  legend.style.marginTop = '10px';

  const card = htmlEl('aside', { class: 'bpd-card', 'aria-live': 'polite', 'aria-label': 'Selected structure' }, grid);

  // ---- SVG ----
  const svg = svgEl('svg', {
    class: 'bpd-svg',
    viewBox: `${VB.x} ${VB.y} ${VB.w} ${VB.h}`,
    role: 'group',
    'aria-labelledby': `${uid}-title ${uid}-desc`,
    focusable: 'false',
  });
  svgEl('title', { id: `${uid}-title` }, svg).textContent = 'Brachial plexus schematic';
  svgEl('desc', { id: `${uid}-desc` }, svg).textContent =
    'Roots C5 to T1 form superior, middle and inferior trunks, which split into anterior and posterior divisions, ' +
    'then lateral, posterior and medial cords, then the musculocutaneous, axillary, radial, median and ulnar nerves. ' +
    'Each part is a button. Tab reaches the diagram once; then Left and Right arrows move to the parent or child, Up and Down move within a column, Home and End jump to C5 or the last branch, Enter selects and Escape clears.';
  scroller.appendChild(svg);

  const defs = svgEl('defs', {}, svg);
  const hatch = svgEl('pattern', { id: `${uid}-hatch`, patternUnits: 'userSpaceOnUse', width: 7, height: 7, patternTransform: 'rotate(45)' }, defs);
  svgEl('rect', { width: 7, height: 7, class: 'bpd-hatch-bg' }, hatch);
  svgEl('rect', { width: 3.5, height: 7, class: 'bpd-hatch-fg' }, hatch);
  const grad = svgEl('linearGradient', { id: `${uid}-median`, gradientUnits: 'userSpaceOnUse', x1: 960, y1: 0, x2: 1030, y2: 0 }, defs);
  svgEl('stop', { offset: '0', class: 'bpd-grad-lat' }, grad);
  svgEl('stop', { offset: '1', class: 'bpd-grad-med' }, grad);

  // Column headers
  const heads = svgEl('g', { class: 'bpd-col-head', 'aria-hidden': 'true' }, svg);
  for (const col of COLUMNS) {
    const lv = LEVELS.find((l) => l.id === col.level);
    const g = svgEl('g', {}, heads);
    svgEl('rect', { x: col.x0 + 3, y: -66, width: col.x1 - col.x0 - 6, height: 52, rx: 8 }, g);
    const cx = (col.x0 + col.x1) / 2;
    svgEl('text', { x: cx, y: -43, 'text-anchor': 'middle', class: 't' }, g).textContent = `${lv?.name ?? col.level} × ${lv?.count ?? ''}`;
    svgEl('text', { x: cx, y: -24, 'text-anchor': 'middle', class: 's' }, g).textContent = col.sub;
  }
  const seps = svgEl('g', { 'aria-hidden': 'true' }, svg);
  for (const col of COLUMNS.slice(1)) svgEl('line', { x1: col.x0, x2: col.x0, y1: 0, y2: 712, class: 'bpd-col-sep' }, seps);

  // Block band (behind everything else)
  const band = svgEl('g', { class: 'bpd-band', 'aria-hidden': 'true' }, svg);
  const bandRect = svgEl('rect', { class: 'area', y: -8, height: 722, rx: 10 }, band);
  const bandPill = svgEl('rect', { class: 'pill', y: -6, height: 26, rx: 13 }, band);
  const bandText = svgEl('text', { y: 12, 'text-anchor': 'middle' }, band);

  // The "M"
  svgEl('path', { d: M_PATH, class: 'bpd-m-path', 'aria-hidden': 'true' }, svg);
  svgEl('text', { x: 982, y: 524, class: 'bpd-m-label', 'aria-hidden': 'true' }, svg).textContent = '“M” → median';
  svgEl('text', { x: 20, y: 745, class: 'bpd-outside-label', 'aria-hidden': 'true' }, svg).textContent = 'Outside the plexus:';

  // Elements. Draw order: collaterals and related first, then plexus trunk lines on top.
  const layerLow = svgEl('g', {}, svg);
  const layerHigh = svgEl('g', {}, svg);
  const groups = {};
  const order = Object.keys(GEOM).sort((a, b) => {
    const rank = (id) => (['collateral', 'related'].includes(ELEMENTS[id]?.level) ? 0 : 1);
    return rank(a) - rank(b);
  });

  for (const id of order) {
    const el = ELEMENTS[id];
    const geo = GEOM[id];
    if (!el || !geo) continue;
    const key = colourKeyFor(id);
    const isLow = ['collateral', 'related'].includes(el.level);
    const sp = formatSpinal(el.spinal);
    const g = svgEl('g', {
      class: `el ${KEY_CLASS[key]} ${geo.w}`,
      'data-id': id,
      tabindex: '-1', // roving tabindex: one element (selected, else C5) is in the Tab order
      role: 'button',
      'aria-pressed': 'false',
      'aria-label': `${el.name}, ${sp}`,
      'aria-describedby': `${uid}-tip`,
    }, isLow ? layerLow : layerHigh);

    const paths = geo.d.map((p) => (typeof p === 'string' ? { d: p } : p));
    for (const p of paths) svgEl('path', { d: p.d, class: 'halo', 'data-id': id }, g);
    for (const p of paths) {
      svgEl('path', { d: p.d, class: `main${p.k ? ` ${KEY_CLASS[p.k]}` : ''}`, 'data-id': id }, g);
    }
    for (const [x, y] of geo.dots || []) svgEl('circle', { cx: x, cy: y, r: 4.5, class: 'dot', 'data-id': id }, g);
    for (const p of paths) svgEl('path', { d: p.d, class: 'hit', 'data-id': id }, g);

    if (geo.badge) {
      // positioned after attach (needs getPointAtLength)
      g._badge = geo.badge;
    }
    const L = geo.label;
    if (L) {
      const anchor = L.a || 'start';
      const tcls = { root: 't-root', struct: 't-struct', term: 't-term', coll: 't-coll' }[L.t];
      const txt = svgEl('text', { x: L.x, y: L.y, 'text-anchor': anchor, class: `${tcls}${L.k ? ' lab-k' : ''}`, 'data-id': id }, g);
      if (L.inlineSp) {
        txt.textContent = `${L.text} `;
        const ts = svgEl('tspan', { class: 'sp' }, txt);
        ts.textContent = `(${sp})`;
        ts.style.fill = 'var(--bpd-muted)';
      } else {
        txt.textContent = L.text ?? el.short;
      }
      if (L.sp) {
        const dy = L.t === 'term' ? 19 : 16;
        svgEl('text', { x: L.x, y: L.y + dy, 'text-anchor': anchor, class: 'sp t-sp', 'data-id': id }, g).textContent = sp;
      }
      // Invisible hit box under the label (bigger touch target)
      g._label = txt;
    }
    groups[id] = g;
  }

  containerEl.appendChild(root);

  // Roving tabindex (one tab stop for the whole diagram)
  const TAB_ORDER = ['root', 'trunk', 'division', 'cord', 'terminal', 'collateral', 'related'];
  const tabIds = Object.keys(groups).sort((a, b) => TAB_ORDER.indexOf(ELEMENTS[a].level) - TAB_ORDER.indexOf(ELEMENTS[b].level) || ELEMENT_ORDER.indexOf(a) - ELEMENT_ORDER.indexOf(b));
  let rovingId = null;
  function setRoving(id) {
    if (!groups[id] || id === rovingId) return;
    if (rovingId && groups[rovingId]) groups[rovingId].setAttribute('tabindex', '-1');
    groups[id].setAttribute('tabindex', '0');
    rovingId = id;
  }
  setRoving(groups['root-c5'] ? 'root-c5' : tabIds[0]);

  // Post-layout: division badges and label hit boxes
  for (const [id, g] of Object.entries(groups)) {
    if (g._badge) {
      const p = g.querySelector('path.main');
      const len = p.getTotalLength();
      const pt = p.getPointAtLength(len * g._badge.at);
      const bg = svgEl('g', { class: 'div-badge', transform: `translate(${pt.x} ${pt.y + (g._badge.dy || 0)})` }, g);
      svgEl('circle', { r: 9 }, bg);
      svgEl('text', { y: 4, 'text-anchor': 'middle' }, bg).textContent = g._badge.text;
    }
    if (g._label) {
      try {
        let bb = null;
        for (const t of g.querySelectorAll('text')) {
          const b = t.getBBox();
          bb = bb ? { x: Math.min(bb.x, b.x), y: Math.min(bb.y, b.y), x2: Math.max(bb.x2, b.x + b.width), y2: Math.max(bb.y2, b.y + b.height) } : { x: b.x, y: b.y, x2: b.x + b.width, y2: b.y + b.height };
        }
        if (bb) {
          const r = svgEl('rect', { x: bb.x - 4, y: bb.y - 3, width: bb.x2 - bb.x + 8, height: bb.y2 - bb.y + 6, fill: 'transparent', 'data-id': id });
          g.insertBefore(r, g.firstChild);
        }
      } catch { /* getBBox can throw if not rendered; harmless */ }
    }
    delete g._badge; delete g._label;
  }

  // ---- Legend ----
  const swatchLine = (cls, style = '') => `<svg width="28" height="12" aria-hidden="true"><line x1="3" y1="6" x2="25" y2="6" stroke-linecap="round" stroke-width="5" style="${style}" class="${cls}"/></svg>`;
  legend.innerHTML = [
    `<li class="hdr">Colour:</li>`,
    `<li>${swatchLine('', 'stroke:var(--bpd-neutral)')}Brachial plexus</li>`,
    `<li>${swatchLine('', 'stroke:var(--bpd-related);stroke-dasharray:5 4;stroke-width:3')}Outside plexus</li>`,
    `<li><svg width="28" height="12" aria-hidden="true"><line x1="3" y1="6" x2="25" y2="6" stroke-linecap="round" stroke-width="11" style="stroke:var(--bpd-m);stroke-opacity:.45"/></svg>The “M”</li>`,
    `<li class="grp bpd-lg-block" aria-hidden="true"></li>`,
    `<li class="hdr bpd-lg-block">Block:</li>`,
    `<li class="bpd-lg-block"><svg width="28" height="14" aria-hidden="true"><line x1="5" y1="7" x2="23" y2="7" stroke-linecap="round" stroke-width="12" style="stroke:var(--bpd-band-edge)"/><line x1="5" y1="7" x2="23" y2="7" stroke-linecap="round" stroke-width="5" style="stroke:var(--bpd-text)"/></svg>Injection target</li>`,
    `<li class="bpd-lg-block">${swatchLine('', 'stroke:var(--bpd-text)')}Reliably blocked</li>`,
    `<li class="bpd-lg-block">${swatchLine('', `stroke:url(#${uid}-hatch);stroke-width:7`)}Variable</li>`,
    `<li class="bpd-lg-block">${swatchLine('', 'stroke:var(--bpd-spared);stroke-dasharray:2 6')}<s>Spared</s></li>`,
    `<li class="bpd-lg-block">${swatchLine('', 'stroke:var(--bpd-text);opacity:.28')}Not involved</li>`,
  ].join('');

  // ---- Rendering ----
  function render() {
    if (st.selected && groups[st.selected] && !svg.contains(document.activeElement)) setRoving(st.selected);
    const { selected, hovered, block } = st;
    const path = selected && ELEMENTS[selected] ? new Set(getPathway(selected)) : null;
    root.classList.toggle('has-selection', !!path);
    root.classList.toggle('has-block', !!(block && BLOCKS[block]));

    for (const [id, g] of Object.entries(groups)) {
      g.classList.toggle('on-path', !!path && path.has(id));
      g.classList.toggle('is-selected', id === selected);
      g.classList.toggle('is-hover', id === hovered);
      g.setAttribute('aria-pressed', id === selected ? 'true' : 'false');
      const s = block && BLOCKS[block] ? (blockStatus(block, id) || 'none') : null;
      for (const k of ['target', 'covers', 'variable', 'spares', 'none']) g.classList.toggle(`st-${k}`, s === k);
      // targets are also covered
    }

    if (block && BLOCKS[block] && LEVEL_BANDS[block]) {
      const b = LEVEL_BANDS[block];
      bandRect.setAttribute('x', b.x0 + 2);
      bandRect.setAttribute('width', b.x1 - b.x0 - 4);
      const label = BLOCKS[block].name.replace(/\s*\(.*?\)\s*/g, ' ').trim();
      bandText.textContent = label;
      const cx = (b.x0 + b.x1) / 2;
      bandText.setAttribute('x', cx);
      let tw = label.length * 8.4;
      try { tw = bandText.getComputedTextLength() || tw; } catch { /* not rendered yet */ }
      const w = Math.min(b.x1 - b.x0 - 8, tw + 26);
      bandPill.setAttribute('x', cx - w / 2);
      bandPill.setAttribute('width', w);
    }
    renderCard();
  }

  function statusFor(id) {
    if (!st.block || !BLOCKS[st.block]) return null;
    return blockStatus(st.block, id) || 'none';
  }
  function statusText(id) {
    const s = statusFor(id);
    if (!s) return '';
    const b = BLOCKS[st.block];
    let t = STATUS_TEXT[s];
    if ((b.sideEffectIds || []).includes(id)) t += ' (side effect)';
    if ((b.separateInjectionIds || []).includes(id)) t += ' (needs a separate injection)';
    return t;
  }

  function renderCard() {
    const id = st.selected;
    const el = id && ELEMENTS[id];
    const blk = st.block && BLOCKS[st.block];
    if (!el) {
      if (blk) {
        card.innerHTML = `<p class="lvl">Block shown</p><h3>${esc(blk.name)}</h3>` +
          `<p style="margin:6px 0 0">${esc(blk.coverageText)}</p>` +
          `<p class="hint" style="margin-top:8px">Solid = blocked, hatched = variable, dotted and struck through = spared. Select any segment for detail.</p>`;
      } else {
        card.innerHTML = `<p class="lvl">Brachial plexus</p><h3>Select a structure</h3>` +
          `<p class="hint">Tap, click or press Enter on any root, trunk, division, cord or branch to see its spinal roots, motor and sensory supply. Its whole pathway, from roots to branches, stays lit.</p>` +
          `<p class="hint" style="margin-top:6px">Remember 5 – 3 – 6 – 3 – 5: Roots, Trunks, Divisions, Cords, Branches.</p>`;
      }
      return;
    }
    const s = statusFor(id);
    const chips = el.spinal.map((x) => `<li>${esc(x)}</li>`).join('');
    const parents = el.parents.map((p) => ELEMENTS[p]?.name).filter(Boolean).join(', ');
    card.innerHTML =
      `<p class="lvl">${esc(LEVEL_NAME[el.level] || el.level)}</p>` +
      `<h3>${esc(el.name)}</h3>` +
      `<ul class="chips" aria-label="Spinal roots">${chips}</ul>` +
      (s ? `<span class="status s-${s}">${esc(blk.name)}: ${esc(statusText(id))}</span>` : '') +
      `<dl>` +
      (parents ? `<dt>Arises from</dt><dd>${esc(parents)}</dd>` : '') +
      `<dt>Motor</dt><dd>${esc(el.motor || '—')}</dd>` +
      `<dt>Sensory</dt><dd>${esc(el.sensory || '—')}</dd>` +
      `</dl>` +
      (el.notes ? `<details><summary>Teaching notes</summary><p style="margin:6px 0 0">${esc(el.notes)}</p></details>` : '') +
      `<div class="actions"><button type="button" class="bpd-btn" data-act="clear">Clear selection</button></div>`;
  }

  // ---- Tooltip ----
  function showTip(id, clientX, clientY) {
    const el = ELEMENTS[id];
    if (!el) return hideTip();
    const s = statusFor(id);
    tip.innerHTML = `<b>${esc(el.name)}</b><span>${esc(formatSpinal(el.spinal))}${s ? ` · ${esc(statusText(id))}` : ''}</span>`;
    const sr = stage.getBoundingClientRect();
    let x = clientX - sr.left + 14;
    let y = clientY - sr.top + 16;
    tip.classList.add('is-on');
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    if (x + tw > sr.width - 4) x = Math.max(4, clientX - sr.left - tw - 14);
    if (y + th > sr.height - 4) y = Math.max(4, clientY - sr.top - th - 12);
    tip.style.left = `${x}px`;
    tip.style.top = `${y}px`;
  }
  function hideTip() { tip.classList.remove('is-on'); }

  // ---- Bus helpers ----
  const emit = (ev, id) => { if (bus && typeof bus.emit === 'function') bus.emit(ev, { id, source: SOURCE }); };
  function setHover(id) {
    if (st.hovered === id) return;
    st.hovered = id;
    render();
    emit('hover', id);
  }
  function setSelect(id) {
    st.selected = id;
    render();
    emit('select', id);
  }

  // ---- Pointer & keyboard ----
  const idFrom = (target) => target?.closest?.('[data-id]')?.getAttribute('data-id') || null;
  let lastPointerType = 'mouse';

  on(svg, 'pointermove', (e) => {
    lastPointerType = e.pointerType;
    if (e.pointerType !== 'mouse') return;
    const id = idFrom(e.target);
    if (id) { setHover(id); showTip(id, e.clientX, e.clientY); } else { setHover(null); hideTip(); }
  });
  on(svg, 'pointerleave', () => { setHover(null); hideTip(); });
  let lastDownAt = -1e9;
  on(svg, 'pointerdown', (e) => { lastPointerType = e.pointerType; lastDownAt = performance.now(); });
  // Touch / pen: clear any hover once the finger lifts (taps select; they never hover).
  const clearTouchHover = (e) => { if (e.pointerType !== 'mouse' && st.hovered) setHover(null); };
  on(svg, 'pointerup', clearTouchHover);
  on(svg, 'pointercancel', clearTouchHover);
  on(svg, 'click', (e) => {
    const id = idFrom(e.target);
    if (id) {
      setSelect(st.selected === id ? null : id);
      if (lastPointerType !== 'mouse') {
        // Touch: brief tooltip as feedback, no sticky hover
        showTip(id, e.clientX, e.clientY);
        clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 1600);
      }
    } else if (st.selected) {
      setSelect(null);
    }
  });
  let tipTimer = 0;
  disposers.push(() => clearTimeout(tipTimer));

  function showTipFor(g) {
    const r = g.getBoundingClientRect();
    showTip(g.getAttribute('data-id'), r.left + Math.min(r.width / 2, 60), r.top + r.height / 2);
  }
  on(svg, 'focusin', (e) => {
    const g = e.target.closest?.('.el');
    if (!g) return;
    setRoving(g.getAttribute('data-id'));
    // A tap focuses the element too; on touch that must not leave a sticky hover
    // in the other views (there is no pointerleave to clear it).
    if (performance.now() - lastDownAt < 800 && lastPointerType !== 'mouse') return;
    setHover(g.getAttribute('data-id'));
    showTipFor(g);
    revealInScroll(g);
  });
  on(svg, 'focusout', (e) => {
    if (!svg.contains(e.relatedTarget)) { setHover(null); hideTip(); }
  });

  const levelIds = (lv) => tabIds.filter((k) => ELEMENTS[k].level === lv);
  on(svg, 'keydown', (e) => {
    const g = e.target.closest?.('.el');
    if (!g) return;
    const id = g.getAttribute('data-id');
    const el = ELEMENTS[id];
    let next = null;
    switch (e.key) {
      case 'Enter': case ' ':
        e.preventDefault();
        setSelect(st.selected === id ? null : id);
        return;
      case 'Escape':
        if (st.selected) { e.preventDefault(); setSelect(null); }
        return;
      case 'ArrowLeft': next = el.parents[0]; break;
      case 'ArrowRight': next = el.children[0]; break;
      case 'Home': next = tabIds[0]; break;
      case 'End': next = tabIds.filter((k) => ELEMENTS[k].level === 'terminal').pop() || tabIds[tabIds.length - 1]; break;
      case 'ArrowUp': case 'ArrowDown': {
        const sib = levelIds(el.level);
        const i = sib.indexOf(id);
        next = sib[(i + (e.key === 'ArrowDown' ? 1 : -1) + sib.length) % sib.length];
        break;
      }
      default: return;
    }
    if (next && groups[next]) { e.preventDefault(); groups[next].focus(); }
  });

  on(card, 'click', (e) => {
    if (e.target.closest?.('[data-act="clear"]')) setSelect(null);
  });

  on(zoomBtn, 'click', () => {
    st.zoomed = !st.zoomed;
    root.classList.toggle('is-zoomed', st.zoomed);
    zoomBtn.setAttribute('aria-pressed', String(st.zoomed));
    zoomBtn.textContent = st.zoomed ? 'Fit to screen' : 'Zoom in';
    revealFocus();
  });

  // ---- Narrow layout: horizontal pan ----
  function svgXToScroll(x) {
    const scale = svg.clientWidth / VB.w;
    return (x - VB.x) * scale;
  }
  function revealX(x0, x1) {
    if (scroller.scrollWidth <= scroller.clientWidth + 2) return;
    const a = svgXToScroll(x0), b = svgXToScroll(x1);
    const view0 = scroller.scrollLeft, view1 = view0 + scroller.clientWidth;
    if (a >= view0 && b <= view1) return;
    const target = (a + b) / 2 - scroller.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, target), behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  function revealInScroll(g) {
    if (scroller.scrollWidth <= scroller.clientWidth + 2) return;
    const r = g.getBoundingClientRect(), s = scroller.getBoundingClientRect();
    if (r.left >= s.left && r.right <= s.right) return;
    scroller.scrollBy({ left: (r.left + r.right) / 2 - (s.left + s.right) / 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }
  function revealFocus() {
    if (st.block && LEVEL_BANDS[st.block]) { const b = LEVEL_BANDS[st.block]; revealX(b.x0, b.x1); }
    else if (st.selected && groups[st.selected]) revealInScroll(groups[st.selected]);
  }
  const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect?.width ?? containerEl.clientWidth;
    const narrow = w < 760;
    const was = root.classList.contains('is-narrow');
    root.classList.toggle('is-narrow', narrow);
    root.classList.toggle('is-zoomed', narrow && st.zoomed);
    if (narrow !== was) hideTip();
    applyTextScale();
  });

  // When the 1220-unit drawing is shrunk into a narrow column, enlarge the small
  // print (spinal levels, branch names, column subtitles, A/P badges) so it stays
  // readable (about 11px or more on screen). Up to 1.3x, so nothing collides.
  let textK = 1;
  function applyTextScale() {
    const scale = svg.clientWidth / VB.w;
    if (!scale) return;
    const k = Math.min(1.3, Math.max(1, 0.9 / scale));
    if (Math.abs(k - textK) < 0.01) return;
    textK = k;
    root.style.setProperty('--bpd-up', k.toFixed(3));
    svg.querySelectorAll('text.t-sp').forEach((t) => {
      if (t.dataset.y0 === undefined) t.dataset.y0 = t.getAttribute('y');
      t.setAttribute('y', (+t.dataset.y0 + (k - 1) * 13).toFixed(1));
    });
    svg.querySelectorAll('.div-badge').forEach((b) => {
      if (b.dataset.t0 === undefined) b.dataset.t0 = b.getAttribute('transform');
      b.setAttribute('transform', `${b.dataset.t0} scale(${k.toFixed(3)})`);
    });
  }
  ro.observe(containerEl);
  disposers.push(() => ro.disconnect());

  // ---- Bus subscriptions ----
  const subs = [];
  if (bus && typeof bus.on === 'function') {
    subs.push(bus.on('select', (p) => {
      const id = p?.id ?? null;
      if (p?.source === SOURCE) return; // already applied locally
      st.selected = id && ELEMENTS[id] ? id : null;
      render();
      if (st.selected && groups[st.selected]) revealInScroll(groups[st.selected]);
    }));
    subs.push(bus.on('hover', (p) => {
      if (p?.source === SOURCE) return;
      const id = p?.id ?? null;
      st.hovered = id && ELEMENTS[id] ? id : null;
      render();
    }));
    subs.push(bus.on('block', (p) => {
      const id = p?.id ?? null;
      st.block = id && BLOCKS[id] ? id : null;
      render();
      if (st.block) { const b = LEVEL_BANDS[st.block]; revealX(b.x0, b.x1); }
    }));
  }

  render();

  return {
    destroy() {
      for (const u of subs) { try { if (typeof u === 'function') u(); } catch { /* ignore */ } }
      for (const d of disposers) d();
      root.remove();
    },
  };
}
