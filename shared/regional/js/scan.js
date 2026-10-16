// Regional anaesthesia engine: the interactive scan viewer ("scan teacher", plan §7).
// Simulated B-mode ultrasound (bmode.js), idealised diagram (diagram.js) or, where a block has open-licence images,
// a real scan (realscan.js) of one scene, with a label overlay and a four-step walk-through: Scan -> Identify ->
// Needle -> Inject. The needle advances in-plane and local anaesthetic (LA) opens the plane (tissue above lifted,
// tissue below pushed down).
//
// Teaching layer (generalised from the brachial plexus teacher):
//   - "Structures in this view": a chip legend built from the labelled layers, lines and shapes. Tapping a chip or the
//     structure on the image highlights it on both views and shows its one-line `desc` (and "See in 3D" when the
//     item has `ids: ['<plexus>:<elementId>']`). Mouse hover previews; touch never fires hover.
//   - Labels are nudged apart vertically (leader lines join them to their structure) and kept off the depth ruler.
//   - Coverage chips (Blocked / Variable / Spared) at the Inject step, from the block's `coverage`.
//   - Phones (< 760 px): the image and the step buttons stay on screen (sticky) while the step text scrolls under
//     them; swipe the image left or right to change step.
//   - "Test me" (Resident and above): labels hidden, "Tap the <structure>" five times.
//
// API: mountScan(host, scene, {blockId, coverage}) -> {setStep(n), setView('us'|'dia'|'real'), setInjection(id),
//      select(label|null), destroy(), el}
// Deep links: buttons #<blockId>-step-<scan|identify|needle|inject> and #<blockId>-inj-<injectionId>.
// Styles: ../css/scan.css (linked by this module) on top of regional.css; chips use ../css/status.css.
import { el, sv, setupCanvas, whenVisible, onResize, reducedMotion, announce } from './ui.js';
import { prepare, anchorOf, spreadProfile, tentProfile, warpY, planeDelta, yAt, shapePoints, clamp, lerp, easeInOut, easeOut } from './scene.js';
import { buildBMode, buildBModeAsync, isBuilt, shadowDepthAt } from './bmode.js';
import { buildDiagram, COL } from './diagram.js';
import { probeInset, areaWords, coverageMap } from './dermatomes.js';
import { realScansFor, loadRealScans, mountRealScan, ensureScanCss } from './realscan.js';
import { STATUS, DENSITY_STATUS, LA, ensureStatusCss } from './status.js';

ensureScanCss();
ensureStatusCss();

const STEPS = [
  { key: 'scan', title: 'Scan' },
  { key: 'identify', title: 'Identify' },
  { key: 'needle', title: 'Needle' },
  { key: 'inject', title: 'Inject' },
];
const LA_FILL = LA.fill;
const LA_EDGE = LA.edge;
const SHIMMER_MS = 5000; // pleural sliding runs this long after a step change (or while playing)
const STAGGER_MAX = 0.6; // seconds: total label fade-in stagger at the Identify step
const SWIPE_PX = 40;
const TEST_N = 5;
const PHONE_MQ = '(max-width: 759px)';

// Build the ultrasound images of the scans in the open chapter while the browser is idle, one at a time,
// so they are usually ready before the reader scrolls to them.
const idleQueue = [];
let idleBusy = false;
const idle = (fn) => (window.requestIdleCallback ? window.requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 400));
function prebuildSoon(scene, host) {
  idleQueue.push({ scene, host });
  pumpIdle();
}
function pumpIdle() {
  if (idleBusy || !idleQueue.length) return;
  idleBusy = true;
  idle(() => {
    const i = idleQueue.findIndex((q) => q.host.closest('.tb-chapter.is-current'));
    const job = i >= 0 ? idleQueue.splice(i, 1)[0] : null;
    const done = () => { idleBusy = false; if (job) pumpIdle(); };
    if (!job || isBuilt(job.scene)) { done(); return; }
    buildBModeAsync(job.scene).then(done, done);
  });
}
document.addEventListener('tb-chapter', () => pumpIdle());

// ---------------------------------------------------------------- geometry helpers (mm)
function distToSeg(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? clamp(((px - ax) * dx + (py - ay) * dy) / l2) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function distToPolyline(pts, x, y) {
  let d = Infinity;
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distToSeg(x, y, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]));
  return d;
}
function inPoly(pts, x, y) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi) inside = !inside;
  }
  return inside;
}
function boxArea(pts) {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return Math.max(0.01, (c - a) * (d - b));
}

/** "See in 3D" link for a global id '<plexus>:<elementId>'. */
export function anatomyHref(id) {
  const [plexus, elId] = String(id).split(':');
  if (!plexus || !elId) return null;
  if (plexus === 'brachial') return `/brachial-plexus/#el=${encodeURIComponent(elId)}`;
  return `/plexus/#plexus=${encodeURIComponent(plexus)}&el=${encodeURIComponent(elId)}`;
}

// ---------------------------------------------------------------- coverage chips
const cap1 = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const figureMods = {
  legCoverageMap: () => import('./figures/leg.js'),
  armCoverageMap: () => import('./figures/arm.js'),
  headCoverageMap: () => import('./figures/head.js?v=20261015'), // same URL as the head-neck pages: one module instance
};
async function zoneNamer(cov) {
  const load = cov.map && figureMods[cov.map.name];
  if (!load) return null;
  try {
    const m = await load();
    return (z) => m.ZONES?.[z]?.name || cap1(String(z).replace(/-/g, ' '));
  } catch { return (z) => cap1(String(z).replace(/-/g, ' ')); }
}
/** Text of the "What it misses" items: the bold lead of each list item ("Saphenous", "The ankle joint"). */
function sparedFrom(html) {
  if (!html || typeof html !== 'string') return [];
  const t = document.createElement('template');
  t.innerHTML = html;
  return [...t.content.querySelectorAll('li')].map((li) => li.querySelector('strong')?.textContent || '')
    .map((s) => s.replace(/[\s:.,;]+$/, '').trim()).filter(Boolean).map(cap1);
}
/** {covers:[{text, note}], variable:[…], spares:[…]} from a block's coverage data. */
export async function coverageGroups(cov) {
  const out = { covers: [], variable: [], spares: [] };
  if (!cov) return out;
  const map = cov.map === false ? null : (typeof cov.map === 'function' ? cov.map : coverageMap);
  const namer = map === coverageMap ? null : await zoneNamer(cov);
  const seen = new Set();
  for (const a of cov.areas || []) {
    const status = DENSITY_STATUS[a.density] || 'covers';
    const texts = namer ? (a.zones || []).map(namer) : (map === coverageMap ? [areaWords(a)] : []);
    for (const text of texts) {
      if (!text || seen.has(text)) continue;
      seen.add(text);
      out[status].push({ text, note: a.density === 'moderate' ? 'usually' : '' });
    }
  }
  for (const text of sparedFrom(cov.misses)) if (!seen.has(text)) { seen.add(text); out.spares.push({ text }); }
  return out;
}
function coverageChips(groups, bid) {
  const box = el('div', { class: 'ra-cov-chips', role: 'group', 'aria-label': 'What this block covers' });
  box.append(el('p', { class: 'ra-cov-chips-k', text: 'What this block covers' }));
  const names = { covers: 'Blocked', variable: 'Variable', spares: 'Spared' };
  let any = false;
  for (const k of ['covers', 'variable', 'spares']) {
    if (!groups[k].length) continue;
    any = true;
    const ul = el('ul', { class: 'ra-cov-grp', 'aria-label': names[k] });
    ul.append(el('li', { class: 'ra-cov-grp-k', text: names[k] }));
    for (const c of groups[k]) {
      ul.append(el('li', {}, el('span', { class: 'ra-st-chip', dataset: { status: k }, title: STATUS[k].label },
        c.text, c.note ? el('span', { class: 'ra-cov-note', text: ` (${c.note})` }) : null)));
    }
    box.append(ul);
  }
  if (!any) return null;
  box.append(el('a', { class: 'ra-cov-more', href: `#${bid}-coverage`, text: 'See the coverage map' }));
  return box;
}

// ---------------------------------------------------------------- the viewer
export function mountScan(host, scene, { blockId, coverage } = {}) {
  const g = prepare(scene);
  const bid = blockId || scene.id;
  const injections = scene.injections || [];
  const diagramOnly = scene.image === 'diagram'; // landmark blocks: a schematic section, no simulated ultrasound
  let realList = realScansFor(bid, scene);
  const stepTitles = STEPS.map((s, i) => scene.stepTitles?.[i] || s.title);
  const st = {
    step: 0, t: 0, view: diagramOnly ? 'dia' : 'us', labels: true, inj: 0, playing: false, visible: false, raf: 0, last: 0,
    built: false, size: null, shimmer: 0, shimmerUntil: 0, sel: null, hover: null, test: null, phone: false,
  };

  let bmodeImg = isBuilt(scene) ? buildBMode(scene) : null; // cache hit only
  st.built = !!bmodeImg;

  // ---------------------------------------------------------------- structures (chips, hit test, highlight)
  // Items marked nolabel:true (internal names such as "Space for the nerve") are drawn but never named to the reader:
  // they stay out of the image labels, the chip legend, the hit test and "Test me".
  const labelled = [...g.layers, ...g.lines, ...g.shapes].filter((it) => it.label && !it.nolabel);
  const structs = new Map(); // label text -> {key, items[], desc, ids[], kind}
  for (const it of labelled) {
    const key = it.label;
    if (!structs.has(key)) structs.set(key, { key, items: [], desc: '', ids: [], kind: it.kind || '' });
    const s = structs.get(key);
    s.items.push(it);
    if (!s.desc && it.desc) s.desc = it.desc;
    for (const id of it.ids || []) if (!s.ids.includes(id)) s.ids.push(id);
  }
  // Geometry for hit testing and highlight outlines, in mm.
  const geo = new Map(); // item -> {polys:[{pts, closed, w}], band?:true, area}
  for (const it of labelled) {
    if (it.bot) geo.set(it, { polys: [{ pts: it.poly, closed: true, w: 0 }], band: true, area: Infinity });
    else if (it.pts) geo.set(it, { polys: [{ pts: it.pts, closed: false, w: it.w ?? 0.3 }], area: 1e6 });
    else if (it.shapes?.length) {
      const polys = it.shapes.map((sh) => ({ pts: shapePoints(sh, 48), closed: sh.t !== 'l', w: sh.t === 'l' ? sh.w : 0 }));
      geo.set(it, { polys, area: Math.min(...polys.map((p) => boxArea(p.pts))) });
    }
  }

  // ---------------------------------------------------------------- DOM
  const fig = el('figure', { class: 'tb-scan', id: `${bid}-scan` });
  const head = el('div', { class: 'tb-scan-head' });
  const titleEl = el('p', { class: 'tb-scan-title', text: scene.title || (scene.image === 'diagram' ? 'Diagram' : 'Ultrasound') });
  const viewSeg = el('div', { class: 'tb-seg tb-scan-views', role: 'group', 'aria-label': 'Image type' });
  const vBtn = (v, label) => el('button', { type: 'button', class: 'tb-seg-btn', dataset: { v }, 'aria-pressed': 'false', text: label, on: { click: () => setView(v) } });
  const vUs = diagramOnly ? null : vBtn('us', 'Ultrasound');
  let vDia = diagramOnly ? null : vBtn('dia', 'Diagram');
  let vReal = null;
  [vUs, vDia].forEach((b) => b && viewSeg.append(b));
  // A diagram-only scene with real scans gets a "Diagram" button too, so there is something to switch back to.
  function addReal() {
    if (diagramOnly && !vDia) { vDia = vBtn('dia', 'Diagram'); viewSeg.append(vDia); }
    vReal = vBtn('real', 'Real'); viewSeg.append(vReal);
  }
  if (realList.length) addReal();
  const labBtn = el('button', { type: 'button', class: 'tb-seg-btn tb-scan-labbtn', 'aria-pressed': 'true', text: 'Labels', on: { click: () => setLabels(!st.labels) } });
  const testable = [...structs.values()].filter((s) => s.items.some((it) => geo.has(it)));
  const testBtn = testable.length >= 3 ? el('button', { type: 'button', class: 'tb-btn ra-scan-testbtn', dataset: { tier: '2' }, text: 'Test me', 'aria-label': 'Test me: find the structures with the labels hidden', on: { click: () => startTest() } }) : null;
  const ctrls = el('div', { class: 'tb-scan-ctrls' }, ...(viewSeg.children.length > 1 ? [viewSeg] : []), labBtn);
  head.append(titleEl, ctrls);
  // Real scans from shared/us/<region>/sources.json arrive later; the "Real" button appears when they do.
  if (!realList.length) loadRealScans(bid, scene).then((list) => {
    if (!list.length || vReal) return;
    realList = list; addReal();
    if (!viewSeg.isConnected && viewSeg.children.length > 1) ctrls.prepend(viewSeg);
    paintPanel();
  });
  let injSeg = null, injWrap = null;
  if (injections.length > 1) {
    injSeg = el('div', { class: 'tb-seg tb-scan-inj', role: 'group', 'aria-label': 'Injection point' });
    injections.forEach((inj, i) => injSeg.append(el('button', { type: 'button', class: 'tb-seg-btn', id: `${bid}-inj-${inj.id}`, dataset: { activate: '1', scrollTo: `${bid}-scan` }, 'aria-pressed': 'false', text: inj.label || inj.id, on: { click: () => setInjection(i) } })));
    injWrap = el('div', { class: 'tb-scan-injwrap' }, el('p', { class: 'tb-scan-injlab', text: scene.injectionLabel || 'Injection point' }), injSeg);
  }

  // An interactive viewer (arrow keys change step, tapping selects a structure), not a static picture.
  const stageHint = el('p', { class: 'tb-sr', id: `${bid}-scan-hint`, text: `Use the left and right arrow keys to change step.${structs.size ? ' The structures in this view are listed as buttons next to the image.' : ''}` });
  const stage = el('div', { class: 'tb-scan-stage', tabindex: '0', role: 'group', 'aria-roledescription': diagramOnly ? 'diagram viewer' : 'ultrasound viewer', 'aria-describedby': stageHint.id });
  const box = el('div', { class: 'tb-scan-box' });
  const canvas = el('canvas', { 'aria-hidden': 'true' });
  const overlay = sv('svg', { class: 'tb-scan-ov', 'aria-hidden': 'true' });
  const busy = el('p', { class: 'tb-scan-busy', text: 'Drawing the ultrasound image…' });
  box.append(canvas, overlay, busy);
  const realHost = el('div', { class: 'ra-scan-real', hidden: true });
  stage.append(box, realHost);
  let realView = null;

  const stepList = el('ol', { class: 'tb-scan-steps', 'aria-label': 'Steps' });
  const stepBtns = STEPS.map((s, i) => {
    const b = el('button', { type: 'button', class: 'tb-scan-step', id: `${bid}-step-${s.key}`, dataset: { activate: '1', scrollTo: `${bid}-scan` }, on: { click: () => setStep(i, true) } },
      el('span', { class: 'tb-scan-step-n', 'aria-hidden': 'true', text: String(i + 1) }), el('span', { class: 'tb-scan-step-t', text: stepTitles[i] }));
    stepList.append(el('li', {}, b));
    return b;
  });
  const stepText = el('div', { class: 'tb-scan-text', 'aria-live': 'polite' });
  const prevBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Back', on: { click: () => setStep(Math.max(0, st.step - 1), true) } });
  const playBtn = el('button', { type: 'button', class: 'tb-btn tb-btn--primary', text: 'Play', on: { click: togglePlay } });
  const nextBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Next', on: { click: () => setStep(Math.min(3, st.step + 1), true) } });
  const nav = el('div', { class: 'tb-scan-nav' }, prevBtn, playBtn, nextBtn);

  // Structures legend + selected-structure card
  let legend = null; const chipBtns = new Map();
  if (structs.size) {
    legend = el('div', { class: 'ra-scan-legend' });
    const ul = el('ul', { class: 'ra-scan-chips', 'aria-label': 'Structures in this view' });
    for (const s of structs.values()) {
      const kind = /^(nerve|artery|vein|bone|muscle|pleura|fascia|ligament|cartilage|fluid|label)$/.test(s.kind) ? s.kind : 'other';
      const b = el('button', { type: 'button', class: `ra-scan-chip ra-k-${kind}`, 'aria-pressed': 'false', on: { click: () => select(st.sel === s.key ? null : s.key, true) } },
        el('span', { class: 'ra-scan-chip-sw', 'aria-hidden': 'true' }), el('span', { text: s.key }));
      b.addEventListener('focus', () => revealChip(b));
      chipBtns.set(s.key, b);
      ul.append(el('li', {}, b));
    }
    legend.append(el('div', { class: 'ra-scan-legend-h' }, el('p', { class: 'ra-scan-legend-k', text: 'Structures in this view' }), testBtn), ul);
  }
  const info = el('div', { class: 'ra-scan-info', hidden: true, 'aria-live': 'polite' });
  const testBar = el('div', { class: 'ra-scan-test', hidden: true });
  const testMsg = el('p', { class: 'ra-scan-test-msg', 'aria-live': 'assertive' });
  const testFb = el('p', { class: 'ra-scan-test-fb', 'aria-live': 'polite' });
  const testSkip = el('button', { type: 'button', class: 'tb-btn', text: 'Skip', on: { click: () => testNext(false, true) } });
  const testStop = el('button', { type: 'button', class: 'tb-btn', text: 'Stop test', on: { click: () => stopTest() } });
  const testAgain = el('button', { type: 'button', class: 'tb-btn tb-btn--primary', text: 'Try again', hidden: true, on: { click: () => startTest() } });
  testBar.append(testMsg, testFb, el('div', { class: 'ra-scan-test-btns' }, testAgain, testSkip, testStop));

  let probeFig = null;
  if (scene.probe) {
    const inset = scene.probeInset || probeInset; // a page can draw its own body outline (e.g. the head and neck)
    probeFig = el('figure', { class: 'tb-scan-probe' }, inset(scene.probe, { marker: scene.orient?.marker }), el('figcaption', {}, el('span', { class: 'tb-scan-probe-k', text: scene.probe.key || 'Probe' }), ` ${scene.probe.label || ''}`));
  }
  const covHost = el('div', { class: 'ra-scan-cov', hidden: true });
  const cov = coverage || scene.coverage;
  if (cov && injections.length) {
    coverageGroups(cov).then((grp) => { const c = coverageChips(grp, bid); if (c) { covHost.append(c); paintPanel(); } }).catch(() => {});
  }

  const col = el('div', { class: 'ra-scan-col' });
  const panel = el('div', { class: 'tb-scan-panel' });
  const grid = el('div', { class: 'tb-scan-grid' }, col, panel);
  const cap = el('figcaption', { class: 'tb-scan-cap' });
  if (scene.view) cap.append(el('p', { class: 'tb-scan-view' }, el('strong', { text: 'View. ' }), scene.view));
  const keyItems = [...g.layers, ...g.lines, ...g.shapes].filter((it) => it.label && it.short && it.short !== it.label);
  const regions = g.shapes.filter((it) => it.kind === 'label' && it.outline !== false && it.shapes.length)
    .map((it) => it.shapes.map((sh) => ({ pts: shapePoints(sh, 48), open: sh.t === 'l' })));
  if (keyItems.length) {
    const dl = el('dl', { class: 'tb-scan-key' });
    keyItems.forEach((it) => dl.append(el('div', {}, el('dt', { text: it.short }), el('dd', { text: it.label }))));
    cap.append(dl);
  }
  cap.append(el('p', { class: 'tb-scan-note', text: diagramOnly ? 'Schematic section drawn by this page, not to scale. Use the arrow keys on the image to step through.' : 'Simulated image drawn by this page, not a patient scan. Use the arrow keys on the image to step through.' }));
  cap.append(el('p', { class: 'tb-scan-note', text: `On a phone, swipe the image left or right to change step.${structs.size ? ' Tap a structure on the image or in the list to highlight it.' : ''}` }));
  fig.append(head, grid, cap, stageHint);
  host.append(fig);

  /** Phones: image + steps in the sticky column; everything else scrolls. Wider: steps beside the image. */
  function layout() {
    col.append(stage);
    if (st.phone) {
      col.append(stepList);
      // The step text comes straight after the sticky image and step buttons, so tapping a step (or opening a step
      // deep link) shows its teaching text on screen; the legend, injection points and probe follow it.
      panel.append(...[testBar, info, stepText, nav, legend, injWrap, covHost, probeFig].filter(Boolean));
    } else {
      col.append(...[legend, info].filter(Boolean));
      panel.append(...[testBar, injWrap, stepList, stepText, covHost, nav, probeFig].filter(Boolean));
    }
    fig.classList.toggle('is-phone', st.phone);
  }
  const mq = window.matchMedia(PHONE_MQ);
  st.phone = mq.matches;
  layout();
  const onMq = () => { st.phone = mq.matches; layout(); if (stage.clientWidth) { measure(true); draw(); } };
  mq.addEventListener?.('change', onMq);

  const order = [...g.layers].filter((l) => l.label && l.kind !== 'label').map((l) => l.label);
  stage.setAttribute('aria-label', `${scene.title || 'Ultrasound'}. ${scene.view || ''} Screen left is ${scene.orient?.left || 'left'}, screen right is ${scene.orient?.right || 'right'}. From superficial to deep: ${order.join(', ')}.${scene.alt ? ` ${scene.alt}` : ''}`);

  // ---------------------------------------------------------------- sizing
  let ctx = null;
  function measure(force = false) {
    const w = Math.max(200, Math.floor(stage.clientWidth));
    const maxH = st.phone ? Math.max(170, window.innerHeight * 0.45) : Math.max(240, Math.min(window.innerHeight * 0.66, 620));
    let cssW = w, cssH = Math.round(w * g.H / g.W);
    if (cssH > maxH) { cssH = Math.round(maxH); cssW = Math.round(cssH * g.W / g.H); }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const changed = force || !st.size || st.size.cssW !== cssW || st.size.cssH !== cssH || st.size.dpr !== dpr;
    st.size = { cssW, cssH, px: cssW / g.W, dpr, narrow: cssW < 520 };
    if (changed) {
      box.style.width = `${cssW}px`; box.style.height = `${cssH}px`;
      ctx = setupCanvas(canvas, cssW, cssH);
      overlay.setAttribute('viewBox', `0 0 ${cssW} ${cssH}`);
      overlay.setAttribute('width', cssW); overlay.setAttribute('height', cssH);
      buildOverlay();
    }
    return changed;
  }

  // ---------------------------------------------------------------- overlay (labels, highlight, target, orientation, ruler)
  let labelEls = [];
  let targetEl = null; let popEl = null; let hiG = null; let hiEls = [];
  let obstacles = [];
  const RULER_W = 32; // keep labels clear of the depth ruler on the right (its numbers and "cm" are 28px wide, plus 4px)
  function buildOverlay() {
    if (!st.size) return; // not measured yet (e.g. a scan mounted in a chapter that is not shown): measure() builds it
    overlay.textContent = '';
    const { cssW, cssH, px, narrow } = st.size;
    overlay.dataset.view = st.view;
    // orientation + depth ruler
    const o = sv('g', { class: 'tb-ov-orient' }, overlay);
    const fs = 12;
    obstacles = [];
    if (scene.orient?.left) {
      const t = sv('text', { x: 20, y: 15, 'text-anchor': 'start', 'font-size': fs, text: scene.orient.left }, o);
      const w = (t.getComputedTextLength?.() || scene.orient.left.length * 6.6);
      obstacles.push({ x0: 0, x1: 24 + w, y0: 0, y1: 20 });
    }
    if (scene.orient?.right) {
      const t = sv('text', { x: cssW - 16, y: 15, 'text-anchor': 'end', 'font-size': fs, text: scene.orient.right }, o);
      const w = (t.getComputedTextLength?.() || scene.orient.right.length * 6.6);
      obstacles.push({ x0: cssW - 20 - w, x1: cssW, y0: 0, y1: 20 });
    }
    const ruler = sv('g', { class: 'tb-ov-ruler' }, overlay);
    for (let mm = 0; mm <= g.H; mm += 5) {
      const y = mm * px, major = mm % 10 === 0;
      sv('line', { x1: cssW - (major ? 9 : 5), x2: cssW, y1: y, y2: y }, ruler);
      if (major && mm > 0 && mm < g.H - 2) sv('text', { x: cssW - 12, y: y + 4, 'text-anchor': 'end', 'font-size': 12, text: `${mm / 10}` }, ruler);
    }
    sv('text', { x: cssW - 12, y: cssH - 6, 'text-anchor': 'end', 'font-size': 12, text: 'cm' }, ruler);
    // marker dot (probe orientation marker side)
    sv('circle', { cx: scene.orient?.marker === 'right' ? cssW - 8 : 9, cy: 10, r: 4, class: 'tb-ov-marker' }, overlay);
    // highlight of the selected / hovered structure (under the labels)
    hiG = sv('g', { class: 'tb-ov-hi' }, overlay);
    buildHighlight();
    // target
    const inj = injections[st.inj];
    const tgt = inj?.target || scene.target;
    targetEl = null;
    if (tgt?.at) {
      targetEl = sv('g', { class: 'tb-ov-target' }, overlay);
      sv('ellipse', { cx: 0, cy: 0, rx: Math.max(8, (tgt.r ?? 2.2) * px), ry: Math.max(6, (tgt.r ?? 2.2) * px * 0.65) }, targetEl);
    }
    // labels
    labelEls = [];
    labelled.filter((it) => !it.nolabel).forEach((it) => {
      const text = narrow ? (it.short || it.label) : (it.label.length > 26 && it.short ? it.short : it.label);
      const anchor = anchorOf(scene, it);
      const lab = it.lab || anchor;
      const gEl = sv('g', { class: `tb-ov-lab tb-ov-lab--${it.kind || 'x'}` }, overlay);
      const line = sv('line', {}, gEl);
      const dot = sv('circle', { r: 2.2 }, gEl);
      const authoredLine = !!(it.lab && (Math.abs(it.lab[0] - anchor[0]) + Math.abs(it.lab[1] - anchor[1]) > 1.2));
      const rect = sv('rect', { height: 18 }, gEl);
      const tx = sv('text', { 'font-size': 12, text }, gEl);
      const tw = tx.getComputedTextLength?.() || 0;
      const w = Math.ceil((tw > 0 ? tw : text.length * 6.7) + 12), h = 18;
      rect.setAttribute('width', w);
      labelEls.push({ it, key: it.label, anchor, lab, gEl, line, dot, rect, tx, w, h, authoredLine, box: null });
    });
    popEl = sv('text', { class: 'tb-ov-pop', 'font-size': 13, opacity: 0 }, overlay);
  }

  function buildHighlight() {
    if (!hiG) return;
    hiG.textContent = ''; hiEls = [];
    const add = (key, cls) => {
      const s = key && structs.get(key);
      if (!s) return;
      for (const it of s.items) {
        const gm = geo.get(it); if (!gm) continue;
        for (const p of gm.polys) {
          const thick = !p.closed;
          const halo = sv('path', { class: `tb-ov-hi-halo ${cls}`, fill: 'none' }, hiG);
          const path = sv('path', { class: `tb-ov-hi-line ${cls}${thick ? ' is-open' : ''}` }, hiG);
          hiEls.push({ p, halo, path, open: thick });
        }
      }
    };
    if (st.hover && st.hover !== st.sel) add(st.hover, 'is-hover');
    add(st.sel, 'is-sel');
    if (st.test?.reveal) add(st.test.reveal, st.test.revealOk ? 'is-ok' : 'is-sel');
  }

  /** Vertical nudge pass: push overlapping label boxes apart (and off the orientation text), keep them in bounds. */
  function resolveLabels(boxes, cssW, cssH) {
    const gap = 3, top = 22, bottom = cssH - 2;
    const clampY = (b) => { b.y = clamp(b.y, top + b.h / 2, bottom - b.h / 2); };
    for (let iter = 0; iter < 40; iter++) {
      let moved = false;
      for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i];
        for (const ob of obstacles) {
          if (a.x + a.w / 2 > ob.x0 && a.x - a.w / 2 < ob.x1 && a.y - a.h / 2 < ob.y1 + gap) { a.y = ob.y1 + gap + a.h / 2; moved = true; }
        }
        for (let j = i + 1; j < boxes.length; j++) {
          const b = boxes[j];
          if (Math.abs(a.x - b.x) >= (a.w + b.w) / 2 + gap) continue;
          const need = (a.h + b.h) / 2 + gap - Math.abs(a.y - b.y);
          if (need <= 0.01) continue;
          const up = a.y < b.y || (a.y === b.y && a.ay <= b.ay) ? a : b;
          const dn = up === a ? b : a;
          const y0u = up.y, y0d = dn.y;
          up.y -= need / 2; dn.y += need / 2; clampY(up); clampY(dn);
          // whatever a bound swallowed goes to the other box
          const left = need - ((y0u - up.y) + (dn.y - y0d));
          if (left > 0.01) { if (up.y <= top + up.h / 2 + 0.01) { dn.y += left; clampY(dn); } else { up.y -= left; clampY(up); } }
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  function placeOverlay(prof, labelAlpha) {
    const { cssW, cssH, px } = st.size;
    const boxes = labelEls.map((L) => {
      const ax = L.anchor[0] * px, ay = warpY(prof, L.anchor[0], L.anchor[1]) * px;
      let lx = L.lab[0] * px, ly = warpY(prof, L.lab[0], L.lab[1]) * px;
      lx = clamp(lx, L.w / 2 + 2, cssW - L.w / 2 - RULER_W); ly = clamp(ly, L.h / 2 + 22, cssH - L.h / 2 - 2);
      return { L, x: lx, y: ly, y0: ly, w: L.w, h: L.h, ax, ay };
    });
    resolveLabels(boxes, cssW, cssH);
    boxes.forEach((b, i) => {
      const L = b.L;
      L.rect.setAttribute('x', (b.x - L.w / 2).toFixed(1)); L.rect.setAttribute('y', (b.y - L.h / 2).toFixed(1));
      L.tx.setAttribute('x', b.x.toFixed(1)); L.tx.setAttribute('y', (b.y + 4).toFixed(1));
      // leader line: authored, or the label was moved off its structure by the nudge pass / clamp
      const off = Math.abs(b.y - b.ay) > L.h / 2 + 2 || Math.abs(b.x - b.ax) > L.w / 2 + 2;
      const showLine = L.authoredLine || (off && Math.hypot(b.x - b.ax, b.y - b.ay) > 6);
      L.line.style.display = showLine ? '' : 'none'; L.dot.style.display = showLine ? '' : 'none';
      if (showLine) {
        // start the line at the edge of the box nearest the anchor
        const ex = clamp(b.ax, b.x - L.w / 2, b.x + L.w / 2), ey = clamp(b.ay, b.y - L.h / 2, b.y + L.h / 2);
        L.line.setAttribute('x1', ex.toFixed(1)); L.line.setAttribute('y1', ey.toFixed(1));
        L.line.setAttribute('x2', b.ax.toFixed(1)); L.line.setAttribute('y2', b.ay.toFixed(1));
        L.dot.setAttribute('cx', b.ax.toFixed(1)); L.dot.setAttribute('cy', b.ay.toFixed(1));
      }
      let a = typeof labelAlpha === 'function' ? labelAlpha(i) : labelAlpha;
      const isSel = L.key === st.sel || (st.test?.reveal && L.key === st.test.reveal);
      if (st.test) a = isSel ? 1 : 0;
      else if (isSel) a = Math.max(a, 1);
      L.gEl.setAttribute('opacity', a.toFixed(2));
      L.gEl.classList.toggle('is-sel', !!isSel);
      L.gEl.classList.toggle('is-hover', L.key === st.hover && !isSel);
      L.box = a > 0.5 ? { x0: b.x - L.w / 2, x1: b.x + L.w / 2, y0: b.y - L.h / 2, y1: b.y + L.h / 2 } : null;
    });
    // highlight outlines follow the warp too
    for (const H of hiEls) {
      const pts = H.p.pts;
      let d = '';
      for (let k = 0; k < pts.length; k++) { const [x, y] = pts[k]; d += `${k ? 'L' : 'M'}${(x * px).toFixed(1)} ${(warpY(prof, x, y) * px).toFixed(1)}`; }
      if (!H.open) d += 'Z';
      H.path.setAttribute('d', d); H.halo.setAttribute('d', d);
      if (H.open) { const w = Math.max(5, (H.p.w || 0.3) * px + 4); H.path.setAttribute('stroke-width', w.toFixed(1)); H.halo.setAttribute('stroke-width', (w + 3).toFixed(1)); }
    }
  }

  /** The labelled structure under a point of the stage (CSS px), or null. */
  function hitTest(cx, cy, touch) {
    if (!st.size) return null;
    if (!st.test) for (const L of labelEls) { const b = L.box; if (b && cx >= b.x0 - 2 && cx <= b.x1 + 2 && cy >= b.y0 - 2 && cy <= b.y1 + 2) return L.key; }
    const { px } = st.size;
    const x = cx / px, y = cy / px, tol = (touch ? 9 : 4) / px;
    let best = null, bestA = Infinity;
    for (const [it, gm] of geo) {
      if (gm.band) continue;
      for (const p of gm.polys) {
        const hit = p.closed ? (inPoly(p.pts, x, y) || distToPolyline(p.pts, x, y) <= tol) : distToPolyline(p.pts, x, y) <= (p.w || 0.3) / 2 + tol;
        if (hit && gm.area < bestA) { best = it; bestA = gm.area; }
      }
    }
    if (best) return best.label;
    for (const [it, gm] of geo) {
      if (!gm.band) continue;
      const t = it.topAt(x), b = it.botAt(x);
      if (y >= t - (b - t < tol ? tol : 0) && y <= b + (b - t < tol ? tol : 0)) return it.label;
    }
    return null;
  }

  // ---------------------------------------------------------------- drawing
  const stagger = () => Math.min(STAGGER_MAX, 0.18 * Math.max(0, labelEls.length - 1));
  function stepDur(step) {
    const inj = injections[st.inj];
    return [1.4, 0.9 + stagger(), inj?.pop ? 3.2 : 2.4, 2.8][step];
  }

  function needleState() {
    const inj = injections[st.inj];
    if (!inj || st.step < 2) return null;
    if (st.step === 3) return { p: 1, inj };
    const d = stepDur(2);
    const tt = reducedMotion() ? d : st.t;
    if (inj.pop) {
      // advance to the ligament, tent it, pop through, then settle at the target
      const a = clamp(tt / (d * 0.62));
      if (a < 1) return { p: easeInOut(a) * 0.86, tent: clamp((a - 0.75) / 0.25), inj };
      const b = clamp((tt - d * 0.62) / (d * 0.18));
      return { p: lerp(0.86, 1, easeOut(b)), tent: b < 0.25 ? 1 - b * 4 : 0, pop: b > 0 ? clamp(1 - (tt - d * 0.62) / (d * 0.38)) : 0, inj };
    }
    return { p: easeInOut(clamp(tt / d)), inj };
  }

  /** Spreads already in place for this injection (inj.keep: ids of other injections in the scene). */
  function keptProfiles(inj) {
    if (!inj?.keep?.length || st.step < 2) return [];
    return inj.keep.map((id) => injections.find((x) => x.id === id)).filter((x) => x && x !== inj)
      .flatMap((k) => [k.spread, ...(k.spreads || [])].filter(Boolean).map((sp) => spreadProfile(scene, { ...k, spread: sp }, 1)))
      .filter(Boolean);
  }
  /** Every warp acting now: kept spreads, the needle tent, or this injection's spread(s) opening. */
  function profilesNow(inj, ns, g01) {
    const out = keptProfiles(inj);
    if (st.step === 3 && inj) {
      for (const sp of [inj.spread, ...(inj.spreads || [])]) { if (sp) { const p = spreadProfile(scene, { ...inj, spread: sp }, g01); if (p) out.push(p); } }
    } else if (ns?.tent > 0) { const p = tentProfile(scene, inj, ns.tent); if (p) out.push(p); }
    return out.length ? out : null;
  }
  const shimmerActive = () => st.playing || performance.now() < st.shimmerUntil;
  const startShimmer = () => { st.shimmerUntil = performance.now() + SHIMMER_MS; };

  function draw() {
    if (!ctx || !st.size || st.view === 'real') return;
    const { cssW, cssH, px, dpr } = st.size;
    const us = st.view === 'us';
    const step = st.step;
    const rm = reducedMotion();
    const dur = stepDur(step);
    const tt = rm ? dur : Math.min(st.t, dur);
    const inj = injections[st.inj];
    // Warp profiles (kept spreads, tent while the needle presses, spread while injecting)
    const ns = needleState();
    const prof = profilesNow(inj, ns, rm ? 1 : clamp(tt / dur));

    ctx.save();
    ctx.fillStyle = us ? '#000' : COL.plate; ctx.fillRect(0, 0, cssW, cssH);
    let img = null;
    if (us) img = bmodeImg;
    else img = buildDiagram(scene, px, dpr);
    if (img) {
      let slide = 0, alpha = 1;
      if (step === 0 && !rm && !st.test) { const e = easeOut(clamp(tt / dur)); slide = (1 - e) * 0.14 * cssW; alpha = 0.25 + 0.75 * e; }
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, 0, 0, img.width, img.height, slide, 0, cssW, cssH);
      ctx.globalAlpha = 1;
      if (prof) drawWarped(img, prof, us);
    }
    // Pleural sliding: a shimmer along the pleural line, only along the line's own extent and never inside
    // a bone's acoustic shadow. Runs for a few seconds after a step change or while playing.
    if (us && img && !rm && shimmerActive()) {
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (const ln of g.lines) {
        if (!ln.sliding || !ln.pts.length) continue;
        const x0 = Math.max(0, ln.pts[0][0]), x1 = Math.min(g.W, ln.pts[ln.pts.length - 1][0]), span = x1 - x0;
        if (span <= 0.5) continue;
        const n = Math.max(4, Math.round(14 * span / g.W));
        for (let k = 0; k < n; k++) {
          const xm = x0 + ((k * 7.31 + st.shimmer * 2.2 * (k % 2 ? 1 : -1)) % span + span) % span;
          const y = yAt(ln.pts, xm);
          if (y >= shadowDepthAt(scene, xm) - 0.3) continue;
          const ym = warpY(prof, xm, y);
          ctx.beginPath(); ctx.arc(xm * px, ym * px, 1.1, 0, 7); ctx.fill();
        }
      }
    }
    // Label-only regions (kind 'label'): a dashed outline, shown with the labels.
    if (regions.length && st.labels && step >= 1 && !st.test) {
      ctx.save();
      ctx.setLineDash([5, 4]); ctx.lineWidth = 1.4;
      ctx.strokeStyle = us ? 'rgba(255,255,255,0.75)' : 'rgba(99,61,60,0.9)';
      for (const parts of regions) for (const r of parts) {
        ctx.beginPath();
        r.pts.forEach(([x, y], i) => { const X = x * px, Y = warpY(prof, x, y) * px; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); });
        if (!r.open) ctx.closePath();
        ctx.stroke();
      }
      ctx.restore();
    }
    if (ns) drawNeedle(ns, us);
    ctx.restore();

    // overlay
    const showLabels = st.labels && step >= 1;
    let alphaFn = 0;
    if (showLabels) {
      const n = labelEls.length, per = n > 1 ? stagger() / (n - 1) : 0;
      alphaFn = (step === 1 && !rm) ? (i) => clamp((tt - 0.3 - i * per) / 0.3) : 1;
    }
    placeOverlay(prof, alphaFn);
    if (targetEl) {
      const tgt = (inj?.target || scene.target);
      const tx = tgt.at[0] * px, ty = warpY(prof, tgt.at[0], tgt.at[1]) * px;
      const pulse = step === 1 && !rm ? 1 + 0.15 * Math.sin(tt * 6) : 1;
      targetEl.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${pulse.toFixed(3)})`);
      targetEl.setAttribute('opacity', st.test ? '0' : step >= 1 && step < 3 ? '1' : step === 3 ? '0.35' : '0');
    }
    if (popEl) {
      const show = ns?.pop > 0 && inj?.pop;
      popEl.setAttribute('opacity', show ? ns.pop.toFixed(2) : '0');
      if (show) {
        const [x, y] = tipXY(ns);
        popEl.textContent = inj.pop.label || 'Pop';
        popEl.setAttribute('x', clamp(x * px + 10, 4, cssW - 120)); popEl.setAttribute('y', clamp(y * px - 12, 16, cssH - 6));
      }
    }
  }

  // Redraw the image column by column with every warp applied. Each profile contributes one plane per column:
  // tissue above it is compressed upwards (lift), tissue below pushed down (dip); the gap is the LA pool.
  function drawWarped(img, profs, us) {
    const { cssW, cssH, px } = st.size;
    const sx = img.width / cssW, sy = img.height / cssH;
    const stripW = 2;
    const H = g.H;
    let x0 = Infinity, x1 = -Infinity;
    for (const p of profs) { x0 = Math.min(x0, p.x0); x1 = Math.max(x1, p.x1); }
    const X0 = Math.max(0, Math.floor(x0 * px) - 2), X1 = Math.min(cssW, Math.ceil(x1 * px) + 2);
    const gaps = profs.map(() => []);
    for (let x = X0; x < X1; x += stripW) {
      const xm = (x + stripW / 2) / px;
      const planes = [];
      profs.forEach((p, k) => { const c = p.cols(xm); if (c) planes.push({ c, k, tent: p.tent }); });
      if (!planes.length) continue;
      const D = (y, side, self) => planes.reduce((a, q) => a + planeDelta(q.c, y, q === self ? side : 0), 0);
      const cuts = [0, H];
      for (const q of planes) { cuts.push(clamp(q.c.y0 - q.c.A, 0, H), clamp(q.c.y0, 0, H)); }
      const ys = cuts.sort((a, b) => a - b).filter((v, i, arr) => !i || v - arr[i - 1] > 1e-6);
      const top = Math.max(0, Math.min(...planes.map((q) => q.c.y0 - q.c.A)));
      ctx.fillStyle = us ? '#000' : COL.plate; ctx.fillRect(x, top * px, stripW, cssH - top * px);
      for (let i = 1; i < ys.length; i++) {
        const a = ys[i - 1], b = ys[i];
        if (b - a < 1e-3 || b <= top) continue;
        const selfA = planes.find((q) => q.c.y0 === a), selfB = planes.find((q) => q.c.y0 === b);
        const ta = (a + D(a, 1, selfA)) * px, tb = (b + D(b, -1, selfB)) * px;
        if (tb - ta < 0.05) continue;
        ctx.drawImage(img, x * sx, a * px * sy, stripW * sx, (b - a) * px * sy, x, ta, stripW, tb - ta);
      }
      for (const q of planes) {
        if (q.tent) continue;
        const ga = (q.c.y0 + D(q.c.y0, -1, q)) * px, gb = (q.c.y0 + D(q.c.y0, 1, q)) * px;
        if (gb - ga > 0.3) gaps[q.k].push([x, ga, gb]);
      }
    }
    for (const gp of gaps) {
      if (!gp.length) continue;
      // LA pool
      const path = new Path2D();
      path.moveTo(gp[0][0], gp[0][1]);
      gp.forEach(([x, a]) => path.lineTo(x + stripW / 2, a));
      path.lineTo(gp[gp.length - 1][0] + stripW, gp[gp.length - 1][1]);
      for (let i = gp.length - 1; i >= 0; i--) path.lineTo(gp[i][0] + stripW / 2, gp[i][2]);
      path.closePath();
      if (us) {
        ctx.fillStyle = '#060606'; ctx.fill(path);
        ctx.save(); ctx.clip(path); ctx.fillStyle = 'rgba(120,120,120,0.25)';
        for (let i = 0; i < gp.length; i += 3) { const [x, a, b] = gp[i]; ctx.fillRect(x + ((i * 37) % 5) * 0.4, a + ((i * 53) % 97) / 97 * (b - a), 1.2, 1); }
        ctx.restore();
      } else {
        ctx.fillStyle = LA_FILL; ctx.fill(path);
        ctx.strokeStyle = LA_EDGE; ctx.lineWidth = 1.4; ctx.stroke(path);
      }
    }
  }

  function tipXY(ns) {
    const inj = ns.inj;
    return [lerp(inj.entry[0], inj.tip[0], ns.p), lerp(inj.entry[1], inj.tip[1], ns.p)];
  }

  function drawNeedle(ns, us) {
    const { cssW, cssH, px } = st.size;
    const inj = ns.inj;
    const [ex, ey] = inj.entry;
    const [tx, ty] = tipXY(ns);
    const X0 = ex * px, Y0 = ey * px, X1 = tx * px, Y1 = ty * px;
    const len = Math.hypot(X1 - X0, Y1 - Y0) || 1;
    const nx = -(Y1 - Y0) / len, ny = (X1 - X0) / len; // normal
    const down = ny < 0 ? -1 : 1; // reverberation goes deeper
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, cssW, cssH); ctx.clip();
    ctx.lineCap = 'round';
    if (us) {
      for (let k = 3; k >= 1; k--) {
        const off = k * Math.max(4, 1.4 * px) * down;
        ctx.strokeStyle = `rgba(235,235,235,${0.32 / k})`; ctx.lineWidth = Math.max(1.4, 0.35 * px);
        ctx.beginPath(); ctx.moveTo(X0 + nx * off, Y0 + ny * off); ctx.lineTo(X1 + nx * off, Y1 + ny * off); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = Math.max(2, 0.6 * px);
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(X1, Y1, Math.max(2.2, 0.55 * px), 0, 7); ctx.fill();
    } else {
      ctx.strokeStyle = '#4a4e57'; ctx.lineWidth = Math.max(3, 0.8 * px);
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      ctx.strokeStyle = '#d6d9df'; ctx.lineWidth = Math.max(1, 0.25 * px);
      ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X1, Y1); ctx.stroke();
      // bevel
      const bx = (X1 - X0) / len, by = (Y1 - Y0) / len, b = Math.max(5, 1.2 * px);
      ctx.fillStyle = '#4a4e57'; ctx.beginPath(); ctx.moveTo(X1 + bx * 2, Y1 + by * 2); ctx.lineTo(X1 - bx * b + nx * 2.2, Y1 - by * b + ny * 2.2); ctx.lineTo(X1 - bx * b - nx * 2.2, Y1 - by * b - ny * 2.2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- selection
  /** Scroll a chip into view inside its own row (phones), never scrolling the page. */
  function revealChip(b) {
    const row = b?.closest('.ra-scan-chips');
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const r = b.getBoundingClientRect(), rr = row.getBoundingClientRect();
    if (r.left < rr.left) row.scrollLeft -= rr.left - r.left + 8;
    else if (r.right > rr.right - 28) row.scrollLeft += r.right - rr.right + 36;
  }
  function paintInfo() {
    const s = st.sel && structs.get(st.sel);
    chipBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === st.sel)));
    if (st.sel) revealChip(chipBtns.get(st.sel));
    info.textContent = '';
    if (!s || st.test) { info.hidden = true; return; }
    info.hidden = false;
    const short = s.items.find((it) => it.short && it.short !== it.label)?.short;
    const p = el('p', { class: 'ra-scan-info-t' }, el('strong', { text: s.key }), short ? el('span', { class: 'ra-scan-info-short', text: ` (${short} on the image)` }) : null);
    info.append(p);
    if (s.desc) info.append(el('p', { class: 'ra-scan-info-d', html: s.desc }));
    const row = el('div', { class: 'ra-scan-info-row' });
    const href = s.ids.map(anatomyHref).find(Boolean);
    if (href) row.append(el('a', { class: 'ra-scan-info-3d', href, text: 'See in 3D →' }));
    row.append(el('button', { type: 'button', class: 'tb-btn ra-scan-info-x', text: 'Clear', 'aria-label': `Clear the highlight on ${s.key}`, on: { click: () => select(null, true) } }));
    info.append(row);
  }
  /** Highlight one structure (by its label text) on the image and in the legend, or clear with null. */
  function select(key, user = false) {
    st.sel = key && structs.has(key) ? key : null;
    if (st.sel && st.step === 0 && user) { st.step = 1; st.t = stepDur(1); paintPanel(); }
    buildHighlight(); paintInfo(); draw();
    if (user && st.sel) announce(`${st.sel} highlighted`);
  }
  function setHover(key) {
    if (key === st.hover) return;
    st.hover = key; buildHighlight(); draw();
    stage.classList.toggle('is-pointing', !!key);
  }

  // ---------------------------------------------------------------- Test me
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function startTest() {
    if (st.view === 'real') setView(diagramOnly ? 'dia' : 'us');
    st.playing = false;
    st.test = { queue: shuffle(testable.map((s) => s.key)).slice(0, TEST_N), i: 0, score: 0, tries: 0, reveal: null, busy: false };
    st.sel = null; st.hover = null;
    st.step = 1; st.t = stepDur(1);
    fig.classList.add('is-testing');
    testBar.hidden = false; testAgain.hidden = true; testSkip.hidden = false;
    paintPanel(); paintInfo(); buildHighlight(); draw(); askTest();
    if (st.phone) {
      // bring the image (stuck under the app bar) and the question just below it on screen
      const barH = parseFloat(getComputedStyle(col).top) || 0;
      window.scrollBy({ top: col.getBoundingClientRect().top - barH, behavior: 'auto' });
    }
    testStop.focus({ preventScroll: true });
  }
  function askTest() {
    const t = st.test; if (!t) return;
    testMsg.textContent = '';
    testMsg.append(el('span', { class: 'ra-scan-test-n', text: `Question ${t.i + 1} of ${t.queue.length}. ` }), 'Tap the ', el('strong', { text: t.queue[t.i] }), ' on the image.');
    testFb.textContent = '';
  }
  function testNext(ok, skipped = false) {
    const t = st.test; if (!t) return;
    if (ok) t.score += 1;
    if (skipped) { t.reveal = t.queue[t.i]; t.revealOk = false; buildHighlight(); draw(); }
    t.busy = true;
    setTimeout(() => {
      if (st.test !== t) return;
      t.busy = false; t.reveal = null; t.tries = 0; t.i += 1; buildHighlight(); draw();
      if (t.i >= t.queue.length) {
        testMsg.textContent = `You found ${t.score} of ${t.queue.length}.`;
        testFb.textContent = t.score === t.queue.length ? 'All correct.' : 'Turn the labels back on to review the ones you missed.';
        testAgain.hidden = false; testSkip.hidden = true;
        return;
      }
      askTest();
    }, skipped ? 1400 : 900);
  }
  function answerTest(key) {
    const t = st.test; if (!t || t.busy) return;
    const want = t.queue[t.i];
    if (key === want) {
      testFb.textContent = `Correct: that is the ${want}.`;
      t.reveal = want; t.revealOk = true; buildHighlight(); draw();
      testNext(true);
    } else {
      t.tries += 1;
      if (t.tries >= 2) {
        testFb.textContent = key ? `That is the ${key}. The ${want} is highlighted.` : `The ${want} is highlighted.`;
        t.reveal = want; t.revealOk = false; buildHighlight(); draw();
        testNext(false);
      } else {
        testFb.textContent = key ? `That is the ${key}. Try again.` : 'Nothing labelled there. Try again.';
      }
    }
  }
  function stopTest() {
    if (!st.test) return;
    st.test = null;
    fig.classList.remove('is-testing');
    testBar.hidden = true;
    testBtn?.focus({ preventScroll: true });
    buildHighlight(); paintInfo(); paintPanel(); draw();
  }

  // ---------------------------------------------------------------- state changes
  function stepHtml() {
    const inj = injections[st.inj];
    const k = STEPS[st.step].key;
    return (inj?.steps && inj.steps[k]) || (scene.steps && scene.steps[k]) || '';
  }
  function paintPanel() {
    stepBtns.forEach((b, i) => { b.setAttribute('aria-current', i === st.step ? 'step' : 'false'); b.classList.toggle('is-done', i < st.step); });
    stepText.innerHTML = '';
    stepText.append(el('p', { class: 'tb-scan-text-k', text: `Step ${st.step + 1} of 4 · ${stepTitles[st.step]}` }));
    const body = el('div', { class: 'tb-scan-text-b' }); body.insertAdjacentHTML('beforeend', stepHtml());
    stepText.append(body);
    prevBtn.disabled = st.step === 0; nextBtn.disabled = st.step === 3;
    for (const [b, v] of [[vUs, 'us'], [vDia, 'dia'], [vReal, 'real']]) if (b) b.setAttribute('aria-pressed', String(st.view === v));
    if (injSeg) [...injSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === st.inj)));
    playBtn.textContent = st.playing ? 'Pause' : (st.step === 3 && st.t >= stepDur(3) ? 'Replay' : 'Play');
    playBtn.hidden = st.view === 'real'; // the real scan is a still image: Back and Next step the text
    stage.classList.toggle('is-us', st.view === 'us');
    stage.classList.toggle('is-real', st.view === 'real');
    covHost.hidden = !(st.step === 3 && covHost.childElementCount);
  }

  function setStep(n, user = false) {
    if (user) st.playing = false;
    if (st.test && user) stopTest();
    st.step = clamp(n, 0, 3); st.t = 0; startShimmer();
    paintPanel(); kick(); draw();
  }
  function setLabels(on) {
    st.labels = !!on; labBtn.setAttribute('aria-pressed', String(st.labels));
    realView?.setLabels(st.labels);
    draw();
  }
  function setView(v) {
    if (v === 'real' && !realList.length) return;
    if (v !== 'real' && diagramOnly) v = 'dia';
    if (v === 'real' && st.test) stopTest();
    if (v === 'real') st.playing = false;
    st.view = v; startShimmer();
    const real = v === 'real';
    box.hidden = real; realHost.hidden = !real;
    fig.classList.toggle('is-real-view', real);
    if (real && st.sel) { st.sel = null; st.hover = null; buildHighlight(); paintInfo(); }
    if (!real) info.hidden = !st.sel;
    if (real && !realView) {
      realView = mountRealScan(realHost, realList, {
        labels: st.labels,
        base: document.baseURI,
        injection: injections[st.inj]?.id,
        linkFor: (l) => { const k = l.elementId || (l.ids || [])[0]; return k ? anatomyHref(k.includes(':') ? k : `brachial:${k}`) : null; },
      });
    }
    if (testBtn) testBtn.hidden = real;
    if (!real) { paintInfo(); }
    paintPanel();
    if (!real) { buildOverlay(); ensureBuilt(); draw(); kick(); }
  }
  function setInjection(i) {
    st.inj = clamp(i, 0, injections.length - 1);
    if (st.step < 2) st.step = 2;
    st.t = 0; startShimmer(); buildOverlay(); paintPanel(); kick(); draw();
    realView?.setInjection(injections[st.inj]?.id);
    announce(`${injections[st.inj].label || ''} selected`);
  }
  function togglePlay() {
    if (st.test) stopTest();
    if (st.playing) { st.playing = false; st.shimmerUntil = 0; paintPanel(); draw(); return; }
    if (st.step === 3 && st.t >= stepDur(3)) { st.step = 0; st.t = 0; }
    st.playing = true; st.t = 0; paintPanel(); kick();
  }

  // ---------------------------------------------------------------- loop
  function animating() {
    if (st.view === 'real') return false;
    const pleura = st.view === 'us' && g.lines.some((l) => l.sliding) && !reducedMotion() && shimmerActive();
    return st.visible && (st.playing || st.t < stepDur(st.step) || pleura);
  }
  function kick() {
    if (st.raf || !st.visible) return;
    st.last = performance.now();
    st.raf = requestAnimationFrame(tick);
  }
  let holdUntil = 0;
  function tick(now) {
    st.raf = 0;
    const dt = Math.min(0.1, (now - st.last) / 1000); st.last = now;
    st.t += dt; st.shimmer += dt;
    const d = stepDur(st.step);
    if (st.playing && st.t >= d) {
      if (!holdUntil) holdUntil = now + (reducedMotion() ? 2600 : 1100);
      if (now >= holdUntil) {
        holdUntil = 0;
        if (st.step < 3) { st.step += 1; st.t = 0; paintPanel(); } else { st.playing = false; startShimmer(); paintPanel(); }
      }
    }
    if (!st.playing && st.t >= d && st.t - dt < d) paintPanel();
    draw();
    if (animating()) st.raf = requestAnimationFrame(tick);
    else draw(); // settle on a still frame (no shimmer once its time is up)
  }

  let building = false;
  function ensureBuilt() {
    if (st.built || st.view !== 'us' || !st.visible) { busy.hidden = st.built || st.view !== 'us'; return; }
    busy.hidden = false;
    if (building) return;
    building = true;
    buildBModeAsync(scene).then((c) => {
      bmodeImg = c; st.built = true; busy.hidden = true; startShimmer(); draw(); kick();
    }, (err) => {
      console.error('[regional] ultrasound build failed', err);
      busy.textContent = 'The ultrasound image could not be drawn. Choose Diagram.';
    }).finally(() => { building = false; });
  }
  if (!diagramOnly) prebuildSoon(scene, fig);

  // ---------------------------------------------------------------- input: keys, tap, hover, swipe
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setStep(Math.min(3, st.step + 1), true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setStep(Math.max(0, st.step - 1), true); }
    else if (e.key === 'Escape' && (st.sel || st.test)) { e.preventDefault(); if (st.test) stopTest(); else select(null, true); }
  });
  // The step buttons too: with one focused, the left and right arrow keys move to the previous or next step (focus follows).
  stepList.addEventListener('keydown', (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey || !e.target.closest?.('.tb-scan-step')) return;
    const to = e.key === 'ArrowRight' ? Math.min(3, st.step + 1) : e.key === 'ArrowLeft' ? Math.max(0, st.step - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? 3 : null;
    if (to == null) return;
    e.preventDefault();
    setStep(to, true);
    stepBtns[to]?.focus({ preventScroll: true });
  });
  const local = (e) => { const r = box.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r]; };
  let down = null;
  stage.addEventListener('pointerdown', (e) => {
    if (st.view === 'real' || (e.pointerType === 'mouse' && e.button !== 0)) return;
    down = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, type: e.pointerType };
  });
  stage.addEventListener('pointercancel', () => { down = null; });
  stage.addEventListener('pointerup', (e) => {
    const d = down; down = null;
    if (!d || d.id !== e.pointerId || st.view === 'real') return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // swipe left = next step, swipe right = previous step
      if (st.test) return;
      setStep(clamp(st.step + (dx < 0 ? 1 : -1), 0, 3), true);
      announce(`Step ${st.step + 1} of 4: ${stepTitles[st.step]}`);
      return;
    }
    if (Math.hypot(dx, dy) > 10 || performance.now() - d.t > 700) return;
    const [x, y, r] = local(e);
    if (x < 0 || y < 0 || x > r.width || y > r.height) return;
    const key = hitTest(x, y, d.type !== 'mouse');
    if (st.test) { answerTest(key); return; }
    select(key && key === st.sel ? null : key, true);
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || st.view === 'real' || st.test) return; // touch never fires hover
    const [x, y, r] = local(e);
    setHover(x >= 0 && y >= 0 && x <= r.width && y <= r.height ? hitTest(x, y, false) : null);
  });
  stage.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setHover(null); });

  const offVis = whenVisible(stage, () => { st.visible = true; if (st.view !== 'real') { measure(); ensureBuilt(); draw(); kick(); } }, () => { st.visible = false; });
  const offRes = onResize(stage, () => { if (!stage.clientWidth || st.view === 'real') return; measure(); draw(); });
  paintPanel();
  if (stage.clientWidth) { measure(); draw(); }

  return {
    setStep, setView, select: (k) => select(k, false),
    setInjection: (id) => { const i = injections.findIndex((x) => x.id === id); if (i >= 0) setInjection(i); },
    destroy() { offVis(); offRes(); mq.removeEventListener?.('change', onMq); cancelAnimationFrame(st.raf); realView?.destroy(); fig.remove(); },
    el: fig,
  };
}
