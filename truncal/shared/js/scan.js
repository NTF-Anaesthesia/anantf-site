// Truncal blocks: interactive scan viewer.
// Simulated B-mode ultrasound (bmode.js) or idealised diagram (diagram.js) of one scene, a label overlay,
// and a four-step walk-through: Scan -> Identify -> Needle -> Inject, with the needle advancing in-plane and
// local anaesthetic (LA) opening the plane (tissue above lifted, tissue below pushed down).
// API: mountScan(host, scene, {blockId}) -> {setStep(n), setView('us'|'dia'), setInjection(id), destroy()}
// Deep links: buttons #<blockId>-step-<scan|identify|needle|inject> and #<blockId>-inj-<injectionId>.
import { el, sv, setupCanvas, whenVisible, onResize, reducedMotion, announce } from './ui.js';
import { prepare, anchorOf, spreadProfile, tentProfile, warpY, planeDelta, yAt, shapePoints, clamp, lerp, easeInOut, easeOut } from './scene.js';
import { buildBMode, buildBModeAsync, isBuilt, shadowDepthAt } from './bmode.js';
import { buildDiagram, COL } from './diagram.js';
import { probeInset } from './dermatomes.js';

const STEPS = [
  { key: 'scan', title: 'Scan' },
  { key: 'identify', title: 'Identify' },
  { key: 'needle', title: 'Needle' },
  { key: 'inject', title: 'Inject' },
];
const LA_FILL = 'rgba(64,158,222,0.78)';
const LA_EDGE = '#1d5f96';
const SHIMMER_MS = 5000; // pleural sliding runs this long after a step change (or while playing)

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

export function mountScan(host, scene, { blockId } = {}) {
  const g = prepare(scene);
  const bid = blockId || scene.id;
  const injections = scene.injections || [];
  const diagramOnly = scene.image === 'diagram'; // landmark blocks: a schematic section, no simulated ultrasound
  const stepTitles = STEPS.map((s, i) => scene.stepTitles?.[i] || s.title);
  const st = { step: 0, t: 0, view: diagramOnly ? 'dia' : 'us', labels: true, inj: 0, playing: false, visible: false, raf: 0, last: 0, built: false, size: null, shimmer: 0, shimmerUntil: 0 };

  let bmodeImg = isBuilt(scene) ? buildBMode(scene) : null; // cache hit only
  st.built = !!bmodeImg;

  // ---------------------------------------------------------------- DOM
  const fig = el('figure', { class: 'tb-scan', id: `${bid}-scan` });
  const head = el('div', { class: 'tb-scan-head' });
  const titleEl = el('p', { class: 'tb-scan-title', text: scene.title || (scene.image === 'diagram' ? 'Diagram' : 'Ultrasound') });
  const viewSeg = el('div', { class: 'tb-seg', role: 'group', 'aria-label': 'Image type' });
  const vBtn = (v, label) => el('button', { type: 'button', class: 'tb-seg-btn', dataset: { v }, 'aria-pressed': 'false', text: label, on: { click: () => setView(v) } });
  const vUs = vBtn('us', 'Ultrasound'), vDia = vBtn('dia', 'Diagram');
  viewSeg.append(vUs, vDia);
  const labBtn = el('button', { type: 'button', class: 'tb-seg-btn tb-scan-labbtn', 'aria-pressed': 'true', text: 'Labels', on: { click: () => { st.labels = !st.labels; labBtn.setAttribute('aria-pressed', String(st.labels)); paintOverlay(); draw(); } } });
  const ctrls = el('div', { class: 'tb-scan-ctrls' }, ...(diagramOnly ? [] : [viewSeg]), labBtn);
  head.append(titleEl, ctrls);
  let injSeg = null;
  if (injections.length > 1) {
    injSeg = el('div', { class: 'tb-seg tb-scan-inj', role: 'group', 'aria-label': 'Injection point' });
    injections.forEach((inj, i) => injSeg.append(el('button', { type: 'button', class: 'tb-seg-btn', id: `${bid}-inj-${inj.id}`, dataset: { activate: '1', scrollTo: `${bid}-scan` }, 'aria-pressed': 'false', text: inj.label || inj.id, on: { click: () => setInjection(i) } })));
  }

  const stage = el('div', { class: 'tb-scan-stage', tabindex: '0', role: 'img' });
  const box = el('div', { class: 'tb-scan-box' });
  const canvas = el('canvas', { 'aria-hidden': 'true' });
  const overlay = sv('svg', { class: 'tb-scan-ov', 'aria-hidden': 'true' });
  const busy = el('p', { class: 'tb-scan-busy', text: 'Drawing the ultrasound image…' });
  box.append(canvas, overlay, busy);
  stage.append(box);

  const panel = el('div', { class: 'tb-scan-panel' });
  const stepList = el('ol', { class: 'tb-scan-steps', 'aria-label': 'Steps' });
  const stepBtns = STEPS.map((s, i) => {
    const b = el('button', { type: 'button', class: 'tb-scan-step', id: `${bid}-step-${s.key}`, dataset: { activate: '1', scrollTo: `${bid}-scan` }, on: { click: () => setStep(i, true) } },
      el('span', { class: 'tb-scan-step-n', 'aria-hidden': 'true', text: String(i + 1) }), el('span', { text: stepTitles[i] }));
    stepList.append(el('li', {}, b));
    return b;
  });
  const stepText = el('div', { class: 'tb-scan-text', 'aria-live': 'polite' });
  const prevBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Back', on: { click: () => setStep(Math.max(0, st.step - 1), true) } });
  const playBtn = el('button', { type: 'button', class: 'tb-btn tb-btn--primary', text: 'Play', on: { click: togglePlay } });
  const nextBtn = el('button', { type: 'button', class: 'tb-btn', text: 'Next', on: { click: () => setStep(Math.min(3, st.step + 1), true) } });
  const nav = el('div', { class: 'tb-scan-nav' }, prevBtn, playBtn, nextBtn);
  panel.append(stepList, stepText, nav);
  if (scene.probe) {
    const inset = scene.probeInset || probeInset; // a page can draw its own body outline (e.g. the head and neck)
    const pf = el('figure', { class: 'tb-scan-probe' }, inset(scene.probe, { marker: scene.orient?.marker }), el('figcaption', {}, el('span', { class: 'tb-scan-probe-k', text: scene.probe.key || 'Probe' }), ` ${scene.probe.label || ''}`));
    panel.append(pf);
  }
  if (injSeg) panel.prepend(el('div', { class: 'tb-scan-injwrap' }, el('p', { class: 'tb-scan-injlab', text: scene.injectionLabel || 'Injection point' }), injSeg));

  const grid = el('div', { class: 'tb-scan-grid' }, stage, panel);
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
  fig.append(head, grid, cap);
  host.append(fig);

  const order = [...g.layers].filter((l) => l.label && l.kind !== 'label').map((l) => l.label);
  stage.setAttribute('aria-label', `${scene.title || 'Ultrasound'}. ${scene.view || ''} Screen left is ${scene.orient?.left || 'left'}, screen right is ${scene.orient?.right || 'right'}. From superficial to deep: ${order.join(', ')}.${scene.alt ? ` ${scene.alt}` : ''}`);

  // ---------------------------------------------------------------- sizing
  let ctx = null;
  function measure() {
    const w = Math.max(200, Math.floor(stage.clientWidth));
    const maxH = Math.max(240, Math.min(window.innerHeight * 0.66, 620));
    let cssW = w, cssH = Math.round(w * g.H / g.W);
    if (cssH > maxH) { cssH = Math.round(maxH); cssW = Math.round(cssH * g.W / g.H); }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const changed = !st.size || st.size.cssW !== cssW || st.size.cssH !== cssH || st.size.dpr !== dpr;
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

  // ---------------------------------------------------------------- overlay (labels, target, orientation, ruler)
  let labelEls = [];
  let targetEl = null; let popEl = null;
  function buildOverlay() {
    overlay.textContent = '';
    const { cssW, cssH, px, narrow } = st.size;
    const us = st.view === 'us';
    overlay.dataset.view = st.view;
    // orientation + depth ruler
    const o = sv('g', { class: 'tb-ov-orient' }, overlay);
    const fs = 12;
    if (scene.orient?.left) sv('text', { x: 20, y: 15, 'text-anchor': 'start', 'font-size': fs, text: scene.orient.left }, o);
    if (scene.orient?.right) sv('text', { x: cssW - 16, y: 15, 'text-anchor': 'end', 'font-size': fs, text: scene.orient.right }, o);
    const ruler = sv('g', { class: 'tb-ov-ruler' }, overlay);
    for (let mm = 0; mm <= g.H; mm += 5) {
      const y = mm * px, major = mm % 10 === 0;
      sv('line', { x1: cssW - (major ? 9 : 5), x2: cssW, y1: y, y2: y }, ruler);
      if (major && mm > 0 && mm < g.H - 2) sv('text', { x: cssW - 12, y: y + 4, 'text-anchor': 'end', 'font-size': 12, text: `${mm / 10}` }, ruler);
    }
    sv('text', { x: cssW - 12, y: cssH - 6, 'text-anchor': 'end', 'font-size': 12, text: 'cm' }, ruler);
    // marker dot (probe orientation marker side)
    sv('circle', { cx: scene.orient?.marker === 'right' ? cssW - 8 : 9, cy: 10, r: 4, class: 'tb-ov-marker' }, overlay);
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
    const items = [...g.layers, ...g.lines, ...g.shapes].filter((it) => it.label && !it.nolabel);
    items.forEach((it) => {
      const text = narrow ? (it.short || it.label) : (it.label.length > 26 && it.short ? it.short : it.label);
      const anchor = anchorOf(scene, it);
      const lab = it.lab || anchor;
      const gEl = sv('g', { class: `tb-ov-lab tb-ov-lab--${it.kind || 'x'}` }, overlay);
      const line = (it.lab && (Math.abs(it.lab[0] - anchor[0]) + Math.abs(it.lab[1] - anchor[1]) > 1.2)) ? sv('line', {}, gEl) : null;
      const dot = line ? sv('circle', { r: 2.2 }, gEl) : null;
      const w = text.length * 6.7 + 10, h = 18;
      const rect = sv('rect', { width: w, height: h }, gEl);
      const tx = sv('text', { 'font-size': 12, text }, gEl);
      labelEls.push({ it, anchor, lab, gEl, line, dot, rect, tx, w, h });
    });
    popEl = sv('text', { class: 'tb-ov-pop', 'font-size': 13, opacity: 0 }, overlay);
    void us;
  }

  function placeOverlay(prof, labelAlpha) {
    const { cssW, cssH, px } = st.size;
    labelEls.forEach((L, i) => {
      const ax = L.anchor[0] * px, ay = warpY(prof, L.anchor[0], L.anchor[1]) * px;
      let lx = L.lab[0] * px, ly = warpY(prof, L.lab[0], L.lab[1]) * px;
      lx = clamp(lx, L.w / 2 + 2, cssW - L.w / 2 - 16); ly = clamp(ly, L.h / 2 + 22, cssH - L.h / 2 - 2);
      L.rect.setAttribute('x', (lx - L.w / 2).toFixed(1)); L.rect.setAttribute('y', (ly - L.h / 2).toFixed(1));
      L.tx.setAttribute('x', lx.toFixed(1)); L.tx.setAttribute('y', (ly + 4).toFixed(1));
      if (L.line) { L.line.setAttribute('x1', lx); L.line.setAttribute('y1', ly); L.line.setAttribute('x2', ax); L.line.setAttribute('y2', ay); L.dot.setAttribute('cx', ax); L.dot.setAttribute('cy', ay); }
      const a = typeof labelAlpha === 'function' ? labelAlpha(i) : labelAlpha;
      L.gEl.setAttribute('opacity', a.toFixed(2));
    });
  }

  // ---------------------------------------------------------------- drawing
  function stepDur(step) {
    const inj = injections[st.inj];
    return [1.4, 0.6 + 0.18 * labelEls.length, inj?.pop ? 3.2 : 2.4, 2.8][step];
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
    if (!ctx || !st.size) return;
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
      if (step === 0 && !rm) { const e = easeOut(clamp(tt / dur)); slide = (1 - e) * 0.14 * cssW; alpha = 0.25 + 0.75 * e; }
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
    if (regions.length && st.labels && step >= 1) {
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
    if (showLabels) alphaFn = (step === 1 && !rm) ? (i) => clamp((tt - 0.3 - i * 0.18) / 0.3) : 1;
    placeOverlay(prof, alphaFn);
    if (targetEl) {
      const tgt = (inj?.target || scene.target);
      const tx = tgt.at[0] * px, ty = warpY(prof, tgt.at[0], tgt.at[1]) * px;
      const pulse = step === 1 && !rm ? 1 + 0.15 * Math.sin(tt * 6) : 1;
      targetEl.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${pulse.toFixed(3)})`);
      targetEl.setAttribute('opacity', step >= 1 && step < 3 ? '1' : step === 3 ? '0.35' : '0');
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
    vUs.setAttribute('aria-pressed', String(st.view === 'us')); vDia.setAttribute('aria-pressed', String(st.view === 'dia'));
    if (injSeg) [...injSeg.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === st.inj)));
    playBtn.textContent = st.playing ? 'Pause' : (st.step === 3 && st.t >= stepDur(3) ? 'Replay' : 'Play');
    stage.classList.toggle('is-us', st.view === 'us');
  }
  function paintOverlay() { if (st.size) { buildOverlay(); } }

  function setStep(n, user = false) {
    if (user) st.playing = false;
    st.step = clamp(n, 0, 3); st.t = 0; startShimmer();
    paintPanel(); kick(); draw();
  }
  function setView(v) {
    st.view = v; startShimmer(); paintPanel(); buildOverlay(); ensureBuilt(); draw(); kick();
  }
  function setInjection(i) {
    st.inj = clamp(i, 0, injections.length - 1);
    if (st.step < 2) st.step = 2;
    st.t = 0; startShimmer(); buildOverlay(); paintPanel(); kick(); draw();
    announce(`${injections[st.inj].label || ''} selected`);
  }
  function togglePlay() {
    if (st.playing) { st.playing = false; st.shimmerUntil = 0; paintPanel(); draw(); return; }
    if (st.step === 3 && st.t >= stepDur(3)) { st.step = 0; st.t = 0; }
    st.playing = true; st.t = 0; paintPanel(); kick();
  }

  // ---------------------------------------------------------------- loop
  function animating() {
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
      console.error('[truncal] ultrasound build failed', err);
      busy.textContent = 'The ultrasound image could not be drawn. Choose Diagram.';
    }).finally(() => { building = false; });
  }
  if (!diagramOnly) prebuildSoon(scene, fig);

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); setStep(Math.min(3, st.step + 1), true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); setStep(Math.max(0, st.step - 1), true); }
  });

  const offVis = whenVisible(stage, () => { st.visible = true; measure(); ensureBuilt(); draw(); kick(); }, () => { st.visible = false; });
  const offRes = onResize(stage, () => { if (!stage.clientWidth) return; measure(); draw(); });
  paintPanel();
  if (stage.clientWidth) { measure(); draw(); }

  return {
    setStep, setView, setInjection: (id) => { const i = injections.findIndex((x) => x.id === id); if (i >= 0) setInjection(i); },
    destroy() { offVis(); offRes(); cancelAnimationFrame(st.raf); fig.remove(); },
    el: fig,
  };
}
