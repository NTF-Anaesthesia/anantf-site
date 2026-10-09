// spinal/js/ultrasound/viewer.js — the interactive scan viewer for section 03.
// One figure: view switcher (PSO | count from the sacrum | transverse), labelled diagram and
// simulated scan side by side (toggle on narrow screens), labels / level labels / caliper,
// probe-position schematic, and a keyboard-accessible structure list that highlights on hover/focus.

import { el, segmented, figure, setupCanvas, whenVisible, onResize, onThemeChange, reducedMotion } from '../ui.js?v=1';
import * as K from '../anatomy/kit.js';
import { FRAME, FRAME_W, FRAME_H, PROBE, skinZ, buildPolar, buildPolarSteps, scanImage, hasScanImage } from './bmode.js';
import { getScene, STOPS } from './scenes.js';
import { diagramImage, diagramSteps, hasDiagram } from './diagram.js';

const ASPECT = FRAME_W / FRAME_H;
const WINE = '#633d3c', HI = '#ffd166', US_TEXT = '#ffffff', US_PILL = '#1a1a1a', US_SCALE = '#9a9a9a';
const MONO = '"NTF Mono","JetBrains Mono",ui-monospace,Menlo,monospace';
const SANS = '"NTF Sans",Inter,Arial,sans-serif';
const VIEWS = [
  { value: 'pso', label: 'Paramedian oblique' },
  { value: 'sacrum', label: 'Count from the sacrum' },
  { value: 'transverse', label: 'Transverse' },
];
const HIT_ORDER = ['pc', 'ac', 'ce', 'isl', 'sp', 'lamina', 'ap', 'tp', 'sacrum', 'its', 'win', 'vb', 'psoas', 'canal', 'shadow', 'esm', 'fat'];
const y = (u) => 168 + u * 0.58; // spine position (mm) to probe-schematic units

function rrect(c, x, yy, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, yy, w, h, r); else c.rect(x, yy, w, h); }
const cm = (mm) => (mm / 10).toFixed(1);

export function createViewer({ num = '3.1', infos = {}, caption, calCite = '' }) {
  const st = { view: 'pso', stop: 0, tmode: 'il', labels: true, levels: true, caliper: false, show: 'scan', hover: null, pinned: null };
  const sceneId = () => (st.view === 'pso' ? 'sag-l34' : st.view === 'sacrum' ? `sag-${STOPS[st.stop].key}` : `tr-${st.tmode}`);
  const scene = () => getScene(sceneId());

  const f = figure({ id: 'us-viewer', num, title: 'Simulated neuraxial scans', caption, plate: 'none', aspect: 'auto' });
  f.fig.classList.add('us-viewer');

  // ---------------------------------------------------------------- top bar: view switcher
  const viewSeg = segmented(VIEWS, { label: 'Scan view', value: st.view, onChange: (v) => setView(v) });
  viewSeg.classList.add('us-viewseg');
  // Deep-link anchors (#us-pso, #us-sacrum, #us-transverse) at the top of the figure; only the current one is shown.
  const anchors = VIEWS.map((v) => el('span', { class: 'us-anchor', id: `us-${v.value}`, hidden: v.value !== st.view, 'aria-hidden': 'true' }));
  const top = el('div', { class: 'us-top' }, viewSeg);
  f.fig.insertBefore(top, f.stage);
  f.fig.prepend(...anchors);

  // ---------------------------------------------------------------- panels
  const mkPanel = (key, name, note) => {
    const cv = el('canvas', { role: 'img', class: 'us-cv' });
    const wrap = el('div', { class: 'us-cvwrap' }, cv);
    const panel = el('div', { class: `us-panel us-panel--${key}` },
      el('p', { class: 'us-panel-head' }, el('span', { class: 'us-panel-name', text: name }), el('span', { class: 'us-panel-note', text: note })),
      wrap);
    return { key, cv, wrap, panel, ctx: null, cssW: 0, dpr: 0, hits: [], last: null, prev: null, fade: 0 };
  };
  const P = {
    diagram: mkPanel('diagram', 'Labelled diagram', 'Same geometry as the scan'),
    scan: mkPanel('scan', 'Simulated scan', 'Computed in your browser, not a patient'),
  };
  const panels = el('div', { class: 'us-panels', dataset: { show: st.show } }, P.diagram.panel, P.scan.panel);
  f.stage.append(panels);

  // ---------------------------------------------------------------- controls
  const toggle = (label, on, fn, cls = '') => {
    const b = el('button', { type: 'button', class: `us-tog ${cls}`.trim(), 'aria-pressed': on ? 'true' : 'false' },
      el('span', { class: 'us-tog-box', 'aria-hidden': 'true' }), el('span', { text: label }));
    b.addEventListener('click', () => { const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); fn(v); });
    return b;
  };
  const showSeg = segmented([{ value: 'diagram', label: 'Diagram' }, { value: 'scan', label: 'Simulated scan' }], {
    label: 'Show', value: st.show,
    onChange: (v) => { st.show = v; panels.dataset.show = v; requestAnimationFrame(drawAll); },
  });
  showSeg.classList.add('us-showseg');
  const labelsBtn = toggle('Labels', st.labels, (v) => { st.labels = v; drawAll(); });
  const levelsBtn = toggle('Level labels', st.levels, (v) => { st.levels = v; drawAll(); }, 'us-levelsbtn');
  const calBtn = toggle('Depth caliper', st.caliper, (v) => { st.caliper = v; calNote.hidden = !v || !scene().caliper; drawAll(); });

  const stopSeg = segmented(STOPS.map((s, i) => ({ value: String(i), label: s.name })), {
    label: 'Probe position, from caudal to cranial', value: '0', onChange: (v) => setStop(Number(v)),
  });
  stopSeg.classList.add('us-stopseg');
  const slideBtn = el('button', { type: 'button', class: 'sp-btn us-slide', on: { click: () => setStop(st.stop >= STOPS.length - 1 ? 0 : st.stop + 1) } });
  const stopCtl = el('div', { class: 'us-stopctl', role: 'group', 'aria-label': 'Slide the probe' },
    el('span', { class: 'us-ctl-label', 'aria-hidden': 'true', text: 'Probe at' }), stopSeg, slideBtn);
  const tmodeSeg = segmented([{ value: 'il', label: 'Interlaminar' }, { value: 'sp', label: 'Over a spinous process' }], {
    label: 'Transverse view', value: st.tmode, onChange: (v) => { st.tmode = v; changeScene(true); },
  });
  tmodeSeg.classList.add('us-tmodeseg');
  const calNa = el('span', { class: 'us-calna', id: 'us-calna', hidden: true, text: 'No depth caliper here: the bone hides the posterior complex.' });
  const row1 = el('div', { class: 'us-ctlrow' }, showSeg, labelsBtn, levelsBtn, calBtn, calNa);
  const row2 = el('div', { class: 'us-ctlrow us-ctlrow--view' }, stopCtl, tmodeSeg);
  f.controls.append(row1, row2);

  // Built once (before the page numbers its citations); only the depth figure changes later.
  const calNote = el('p', { class: 'us-calnote', hidden: true, html: `<strong>Skin to posterior complex: <span class="sp-num us-caldepth">–</span>.</strong> Expect the needle to reach it a little deeper than this, often by up to about 0.5 cm, because the probe compresses the tissues when you measure.${calCite}` });
  const calDepth = calNote.querySelector('.us-caldepth');
  f.fig.insertBefore(calNote, f.caption);

  // ---------------------------------------------------------------- under: probe schematic, info, structures
  const probe = probeSchematic();
  const infoBox = el('div', { class: 'us-info' });
  for (const [k, node] of Object.entries(infos)) { node.dataset.usView = k; infoBox.append(node); }
  const list = el('ul', { class: 'us-list', role: 'list' });
  const desc = el('p', { class: 'us-desc' });
  const structsBox = el('div', { class: 'us-structs' }, el('p', { class: 'us-mini-h', text: 'Structures in this view' }), list, desc);
  const under = el('div', { class: 'us-under' }, probe.box, infoBox, structsBox);
  f.fig.insertBefore(under, calNote);

  // ---------------------------------------------------------------- state changes
  function setView(v, { focusSeg = false } = {}) {
    st.view = v; viewSeg.set(v);
    if (focusSeg) viewSeg.querySelector(`[data-value="${v}"]`)?.focus();
    changeScene(true);
  }
  function setStop(i) { st.stop = i; stopSeg.set(String(i)); changeScene(true); }
  function changeScene(fade) {
    st.hover = null; st.pinned = null;
    const sc = scene();
    f.fig.dataset.view = st.view;
    row2.dataset.view = st.view;
    levelsBtn.hidden = st.view !== 'sacrum';
    stopCtl.hidden = st.view !== 'sacrum';
    tmodeSeg.hidden = st.view !== 'transverse';
    slideBtn.textContent = st.stop >= STOPS.length - 1 ? 'Back to the sacrum' : 'Slide cranially';
    // Without a posterior complex the caliper is unavailable: show it unticked (st.caliper is kept,
    // so it comes back in the next view that has one) and give the reason as visible text.
    calBtn.disabled = !sc.caliper;
    calBtn.setAttribute('aria-pressed', sc.caliper && st.caliper ? 'true' : 'false');
    calNa.hidden = !!sc.caliper;
    if (sc.caliper) calBtn.removeAttribute('aria-describedby'); else calBtn.setAttribute('aria-describedby', calNa.id);
    calNote.hidden = !st.caliper || !sc.caliper;
    if (sc.caliper) {
      const d = cm(sc.caliper.z - skinZ(sc.caliper.x));
      calDepth.textContent = `${d} cm`;
    }
    for (const n of infoBox.children) n.hidden = n.dataset.usView !== st.view;
    anchors.forEach((a, i) => { a.hidden = VIEWS[i].value !== st.view; });
    buildList(sc);
    probe.update(st);
    const label = describeScene(sc, st);
    P.scan.cv.setAttribute('aria-label', label.scan);
    P.diagram.cv.setAttribute('aria-label', label.diagram);
    f.describe(label.short);
    for (const p of Object.values(P)) { if (fade && p.last && !reducedMotion()) { p.prev = p.last; p.fade = performance.now(); } }
    drawAll();
    if (fade) animateFade();
  }

  function buildList(sc) {
    list.textContent = '';
    for (const s of sc.structs) {
      if (s.nolist) continue;
      const b = el('button', { type: 'button', class: 'us-item', dataset: { key: s.key }, 'aria-pressed': 'false' },
        el('span', { class: 'us-item-code', 'aria-hidden': 'true', text: s.short }),
        el('span', { class: 'us-item-name', text: s.name }),
        el('span', { class: 'sp-sr', text: `. ${s.desc}` }));
      b.addEventListener('mouseenter', () => setHover(s.key));
      b.addEventListener('mouseleave', () => setHover(null));
      b.addEventListener('focus', () => setHover(s.key));
      b.addEventListener('blur', () => setHover(null));
      b.addEventListener('click', () => setPinned(st.pinned === s.key ? null : s.key));
      list.append(el('li', {}, b));
    }
    list.onkeydown = (e) => { if (e.key === 'Escape') setPinned(null); };
    paintDesc();
  }
  function setHover(k) { if (st.hover === k) return; st.hover = k; paintDesc(); drawAll(); }
  function setPinned(k) {
    st.pinned = k;
    list.querySelectorAll('.us-item').forEach((b) => b.setAttribute('aria-pressed', b.dataset.key === k ? 'true' : 'false'));
    paintDesc(); drawAll();
  }
  function paintDesc() {
    const k = st.hover ?? st.pinned, s = k && scene().structs.find((t) => t.key === k);
    list.querySelectorAll('.us-item').forEach((b) => b.classList.toggle('us-item--hi', b.dataset.key === k));
    desc.innerHTML = s ? `<strong>${s.name}.</strong> ${s.desc}` : 'Hover over, focus or tap a structure to highlight it on the diagram and the scan.';
  }

  // ---------------------------------------------------------------- drawing
  let resizing = false, resizeT = 0, visible = false;
  function drawAll() { if (!visible) return; for (const p of Object.values(P)) paint(p); }
  function paint(p) {
    const w = Math.round(p.wrap.clientWidth);
    if (!w || p.panel.offsetParent === null) return;
    const h = Math.round(w / ASPECT), dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    if (p.cssW !== w || p.dpr !== dpr || !p.ctx) { p.ctx = setupCanvas(p.cv, w, h); p.cssW = w; p.dpr = dpr; }
    const ctx = p.ctx, sc = scene();
    const dw = Math.round(w * dpr), dh = Math.round(h * dpr);
    let img;
    if (resizing && p.last && p.last.id === sc.id) img = p.last.img;
    else if (p.last && p.last.id !== sc.id && !(p.key === 'scan' ? hasScanImage(sc, dw, dh) : hasDiagram(sc, dw, dh))) {
      // A scene that is not built yet (the idle prebuild has not reached it): build it in short
      // steps off the click, holding the previous frame meanwhile, then cross-fade to it.
      buildSoon(p, sc, dw, dh);
      ctx.save();
      ctx.fillStyle = p.key === 'scan' ? '#000' : K.C.paper; ctx.fillRect(0, 0, w, h);
      ctx.drawImage((p.prev || p.last).img, 0, 0, w, h);
      ctx.restore();
      return;
    } else {
      if (p.key === 'scan') { buildPolar(sc); img = scanImage(sc, dw, dh); }
      else img = diagramImage(sc, dw, dh);
      p.last = { id: sc.id, img };
    }
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = p.key === 'scan' ? '#000' : K.C.paper; ctx.fillRect(0, 0, w, h);
    const t = p.prev ? Math.min(1, (performance.now() - p.fade) / 180) : 1;
    if (p.prev && t < 1) { ctx.globalAlpha = 1; ctx.drawImage(p.prev.img, 0, 0, w, h); ctx.globalAlpha = t; }
    ctx.drawImage(img, 0, 0, w, h);
    ctx.globalAlpha = 1;
    if (t >= 1) p.prev = null;
    overlays(p, sc, w, h);
    ctx.restore();
  }
  const building = new Set();
  function buildSoon(p, sc, dw, dh) {
    const key = `${p.key}:${sc.id}@${dw}x${dh}`;
    if (building.has(key)) return;
    building.add(key);
    const steps = p.key === 'scan'
      ? (function* () { yield* buildPolarSteps(sc); scanImage(sc, dw, dh); })()
      : diagramSteps(sc, dw, dh);
    const tick = () => {
      if (!steps.next().done) { setTimeout(tick, 0); return; }
      building.delete(key);
      if (p.prev && !reducedMotion()) p.fade = performance.now();
      drawAll(); animateFade();
    };
    setTimeout(tick, 0);
  }
  let fadeRaf = 0;
  function animateFade() {
    cancelAnimationFrame(fadeRaf);
    const step = () => { drawAll(); if (Object.values(P).some((p) => p.prev)) fadeRaf = requestAnimationFrame(step); };
    fadeRaf = requestAnimationFrame(step);
  }

  function overlays(p, sc, w, h) {
    const ctx = p.ctx, dark = p.key === 'scan', s = w / FRAME_W;
    const X = (x) => (x - FRAME.x0) * s, Y = (z) => (z - FRAME.z0) * s;
    const hk = st.hover ?? st.pinned;
    const narrow = w < 520;
    p.hits = [];

    // Edges and orientation marker.
    const fs = narrow ? 10 : 11;
    ctx.font = `500 ${fs}px ${MONO}`; ctx.textBaseline = 'top';
    const edgeCol = dark ? US_SCALE : 'rgba(43,30,24,.78)';
    const [eL, eR] = sc.kind === 'sagittal' ? ['Cranial', 'Caudal'] : ['Patient’s left', 'Patient’s right'];
    ctx.fillStyle = dark ? HI : WINE;
    ctx.beginPath(); ctx.arc(8, 8 + fs / 2, 3.2, 0, 7); ctx.fill();
    ctx.fillStyle = edgeCol; ctx.textAlign = 'left'; ctx.fillText(narrow ? eL.replace('Patient’s ', '') : eL, 15, 8);
    ctx.textAlign = 'right'; ctx.fillText(narrow ? eR.replace('Patient’s ', '') : eR, w - 8, 8);

    // Depth ruler (cm), right-hand side.
    const rx = X(80);
    ctx.strokeStyle = edgeCol; ctx.fillStyle = edgeCol; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx, Y(0)); ctx.lineTo(rx, Y(PROBE.depth)); ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = `400 ${fs - 1}px ${MONO}`;
    for (let d = 0; d <= PROBE.depth; d += 5) {
      const major = d % 10 === 0, yy = Y(d);
      ctx.beginPath(); ctx.moveTo(rx, yy); ctx.lineTo(rx - (major ? 6 : 3), yy); ctx.stroke();
      if (major && d > 0 && (!narrow || d % 20 === 0)) ctx.fillText(String(d / 10), rx + 3, yy);
    }
    ctx.fillText('cm', rx + 3, Y(0));

    // Highlighted structure outline.
    const sHi = hk && sc.structs.find((t) => t.key === hk);
    if (sHi) {
      ctx.save();
      for (const sh of sHi.shapes) {
        if (!sh.hl) continue;
        const pts = sh.pts || [];
        if (sh.dot) {
          ctx.beginPath(); ctx.arc(X(sh.dot[0]), Y(sh.dot[1]), Math.max(3, 0.9 * s), 0, 7);
          ctx.strokeStyle = dark ? HI : WINE; ctx.lineWidth = 1.5; ctx.stroke(); continue;
        }
        if (pts.length < 2) continue;
        const closed = pts.length > 2 && !sh.open && !['flavum', 'dura', 'acline', 'roots', 'line'].includes(sh.paint || sh.draw);
        ctx.beginPath(); pts.forEach(([x, z], i) => (i ? ctx.lineTo(X(x), Y(z)) : ctx.moveTo(X(x), Y(z)))); if (closed) ctx.closePath();
        if (closed) { ctx.fillStyle = dark ? 'rgba(255,209,102,.14)' : 'rgba(99,61,60,.12)'; ctx.fill(); }
        ctx.setLineDash(sh.dash ? [5, 4] : []);
        ctx.strokeStyle = dark ? HI : WINE; ctx.lineWidth = dark ? 1.6 : 2.5; ctx.stroke();
      }
      ctx.restore();
    }

    // Caliper: skin to posterior complex.
    if (st.caliper && sc.caliper) {
      const cx = X(sc.caliper.x), y0 = Y(skinZ(sc.caliper.x)), y1 = Y(sc.caliper.z);
      ctx.save();
      ctx.strokeStyle = dark ? HI : WINE; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke(); ctx.setLineDash([]);
      for (const yy of [y0, y1]) { ctx.beginPath(); ctx.moveTo(cx - 6, yy); ctx.lineTo(cx + 6, yy); ctx.moveTo(cx, yy - 4); ctx.lineTo(cx, yy + 4); ctx.stroke(); }
      const txt = `${cm(sc.caliper.z - skinZ(sc.caliper.x))} cm`;
      pillAt(ctx, txt, cx + 8, (y0 + y1) / 2 - 6, 'left', null, { dark, hi: true, font: `500 ${fs + 1}px ${MONO}` });
      ctx.restore();
    }

    // Labels.
    const showLevel = st.view === 'sacrum' ? st.levels : st.labels;
    for (const L of sc.labels) {
      const isHi = hk === L.key;
      let show = L.group === 'level' ? showLevel : st.labels && !L.minor;
      if (L.hlOnly) show = false;
      if (isHi && (!L.dup || st.labels)) show = true;
      if (!show) continue;
      const text = narrow ? L.short : L.text;
      const r = pillAt(ctx, text, X(L.pos[0]), Y(L.pos[1]), L.align, [X(L.anchor[0]), Y(L.anchor[1])], { dark, hi: isHi, w, h, font: `500 ${narrow ? 10 : 11}px ${dark ? MONO : SANS}` });
      p.hits.push({ key: L.key, ...r });
    }
  }

  /** Label pill with optional leader. Returns its rect. */
  function pillAt(ctx, text, x, yy, align, anchor, { dark, hi, w = 1e9, h = 1e9, font }) {
    ctx.save();
    ctx.font = font; ctx.textBaseline = 'middle';
    const pw = ctx.measureText(text).width + 12, ph = parseInt(font.match(/(\d+)px/)[1], 10) + 9;
    let x0 = align === 'right' ? x - pw : align === 'center' ? x - pw / 2 : x;
    x0 = Math.max(3, Math.min(w - pw - 3, x0));
    const y0 = Math.max(3, Math.min(h - ph - 3, yy - ph / 2));
    if (anchor) {
      const lx = Math.max(x0, Math.min(x0 + pw, anchor[0])), ly = anchor[1] < y0 ? y0 : anchor[1] > y0 + ph ? y0 + ph : y0 + ph / 2;
      const lxx = anchor[1] >= y0 && anchor[1] <= y0 + ph ? (anchor[0] < x0 ? x0 : x0 + pw) : lx;
      ctx.strokeStyle = dark ? (hi ? HI : 'rgba(255,255,255,.8)') : (hi ? WINE : 'rgba(43,30,24,.75)');
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lxx, ly); ctx.lineTo(anchor[0], anchor[1]); ctx.stroke();
      ctx.beginPath(); ctx.arc(anchor[0], anchor[1], 2.2, 0, 7); ctx.fillStyle = dark ? (hi ? HI : '#fff') : (hi ? WINE : K.C.ink); ctx.fill();
    }
    rrect(ctx, x0, y0, pw, ph, ph / 2);
    if (dark) { ctx.fillStyle = hi ? HI : US_PILL; ctx.fill(); ctx.strokeStyle = hi ? HI : 'rgba(255,255,255,.4)'; ctx.lineWidth = 1; ctx.stroke(); }
    else { ctx.fillStyle = hi ? WINE : K.C.pillBg; ctx.fill(); ctx.strokeStyle = hi ? WINE : 'rgba(43,30,24,.3)'; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.fillStyle = dark ? (hi ? US_PILL : US_TEXT) : (hi ? '#ffffff' : K.C.ink);
    ctx.textAlign = 'left'; ctx.fillText(text, x0 + 6, y0 + ph / 2 + 0.5);
    ctx.restore();
    return { x: x0, y: y0, w: pw, h: ph };
  }

  // ---------------------------------------------------------------- pointer interaction on the images
  function hitTest(p, ev) {
    const r = p.cv.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top;
    for (let i = p.hits.length - 1; i >= 0; i--) { const q = p.hits[i]; if (px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h) return q.key; }
    const s = r.width / FRAME_W, x = px / s + FRAME.x0, z = py / s + FRAME.z0;
    if (p.key === 'scan' && Math.hypot(x, z + PROBE.R) > PROBE.R + PROBE.depth) return null;
    const sc = scene();
    const keys = sc.structs.map((t) => t.key).sort((a, b) => (HIT_ORDER.indexOf(a) + 99) % 99 - (HIT_ORDER.indexOf(b) + 99) % 99);
    for (const k of keys) {
      const sObj = sc.structs.find((t) => t.key === k);
      if (sObj.nolist) continue;
      for (const sh of sObj.shapes) {
        if (!sh.hl) continue;
        if (sh.dot) { if (Math.hypot(x - sh.dot[0], z - sh.dot[1]) < 1.6) return k; continue; }
        const pts = sh.pts || [];
        const isLine = sh.open || ['flavum', 'dura', 'acline', 'roots', 'line'].includes(sh.paint || sh.draw);
        if (isLine) { for (let i = 1; i < pts.length; i++) if (segDist(x, z, pts[i - 1], pts[i]) < 1.4) return k; }
        else if (pts.length > 2 && K.inPoly(x, z, pts)) return k;
      }
    }
    return null;
  }
  for (const p of Object.values(P)) {
    p.cv.addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; const k = hitTest(p, e); p.cv.style.cursor = k ? 'pointer' : 'default'; setHover(k); });
    p.cv.addEventListener('pointerleave', () => setHover(null));
    p.cv.addEventListener('click', (e) => { const k = hitTest(p, e); setPinned(k && st.pinned !== k ? k : null); });
  }

  // ---------------------------------------------------------------- lifecycle
  onResize(panels, () => {
    if (!visible) return;
    resizing = true; drawAll();
    clearTimeout(resizeT); resizeT = setTimeout(() => { resizing = false; drawAll(); }, 160);
  });
  onThemeChange(() => drawAll());
  whenVisible(f.fig, () => {
    if (visible) return;
    visible = true; drawAll();
    prebuild();
  });
  function prebuild() {
    const ids = ['sag-l34', 'tr-il', ...STOPS.map((s) => `sag-${s.key}`), 'tr-sp'];
    const idle = window.requestIdleCallback ? (fn) => window.requestIdleCallback(fn, { timeout: 2500 }) : (fn) => setTimeout(fn, 200);
    // Build each scene's B-mode data, then its scan and diagram images at the current panel size,
    // one short step per idle period (the B-mode build is split into stages), so the main thread is
    // never blocked for long and switching views later only blits cached images.
    const jobs = [];
    for (const id of ids) {
      let it = null;
      const step = () => { it ||= buildPolarSteps(getScene(id)); if (!it.next().done) jobs.unshift(step); };
      jobs.push(step);
      for (const key of ['scan', 'diagram']) {
        let dit = null;
        const job = () => {
          const p = P[key], w = p.cssW || P.scan.cssW || P.diagram.cssW, dpr = p.dpr || Math.min(window.devicePixelRatio || 1, 2.5);
          if (!w) return;
          const dw = Math.round(w * dpr), dh = Math.round(Math.round(w / ASPECT) * dpr), sc = getScene(id);
          if (key === 'scan') { scanImage(sc, dw, dh); return; }
          dit ||= diagramSteps(sc, dw, dh);
          if (!dit.next().done) jobs.unshift(job);
        };
        jobs.push(job);
      }
    }
    const next = () => {
      if (!jobs.length) return;
      idle(() => { jobs.shift()(); next(); });
    };
    next();
  }

  changeScene(false);

  const VIEW_IDS = { 'us-pso': 'pso', 'us-sacrum': 'sacrum', 'us-transverse': 'transverse' };
  return {
    fig: f.fig,
    setView,
    reveal(id) {
      if (VIEW_IDS[id]) { setView(VIEW_IDS[id]); return true; }
      return id === 'us-viewer';
    },
  };
}

function segDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2));
  return Math.hypot(x - (a[0] + t * dx), z - (a[1] + t * dz));
}

function describeScene(sc, st) {
  const d = sc.caliper ? cm(sc.caliper.z - skinZ(sc.caliper.x)) : null;
  if (sc.kind === 'sagittal') {
    const where = st.view === 'pso' ? 'at L3–4' : STOPS[st.stop].long;
    const base = `paramedian sagittal oblique view ${where}, cranial on the left`;
    let body;
    if (sc.id === 'sag-sacrum') body = 'The sacrum is a long, flat bright line with a dense shadow and no gaps. At the cranial (left) edge is the L5–S1 gap, the first window above it.';
    else body = `Bright sloping laminae with black acoustic shadows beneath them (the sawtooth pattern). Through the gap in the centre${sc.caliper ? ` (${sc.caliper.name})` : ''}: the bright posterior complex at about ${d} cm, the black intrathecal space with faint cauda equina, and the bright anterior complex at about 6.5 cm.`;
    if (sc.id === 'sag-l5s1') body += ' The flat sacrum is on the right (caudal) side.';
    return { scan: `Simulated ${base}. ${body}`, diagram: `Labelled diagram of the ${base}, same geometry as the simulated scan.`, short: `Showing the ${base}.` };
  }
  if (sc.mode === 'il') {
    return {
      scan: `Simulated transverse interlaminar view in the midline. A dark interspinous ligament in the midline; bright articular processes either side with shadows, and transverse processes further out and deeper. In the middle: the bright posterior complex at about ${d} cm, the black thecal sac and the bright anterior complex, the “cat’s head” or “flying bat” pattern.`,
      diagram: 'Labelled diagram of the transverse interlaminar view, same geometry as the simulated scan.',
      short: 'Showing the transverse interlaminar view.',
    };
  }
  return {
    scan: 'Simulated transverse view over a spinous process. A bright cap (the spinous process tip) just under the fat, laminae sloping away on each side, and a solid black shadow beneath, so the spinal canal cannot be seen.',
    diagram: 'Labelled diagram of the transverse spinous process view. The canal is drawn but lies in the shadow of the bone.',
    short: 'Showing the transverse view over a spinous process.',
  };
}

// ---------------------------------------------------------------- probe-position schematic (themed SVG)
function probeSchematic() {
  const lev = [['L1', -179], ['L2', -141], ['L3', -103], ['L4', -65], ['L5', -27]];
  const sps = lev.map(([n, u]) => `<rect class="us-sv-sp" x="106" y="${(y(u) - 4).toFixed(1)}" width="8" height="8"/><text class="us-sv-t" x="98" y="${(y(u) + 3).toFixed(1)}" text-anchor="end">${n}</text>`).join('');
  const svgHtml = `<svg viewBox="0 0 220 236" class="us-sv" aria-hidden="true" focusable="false">
    <path class="us-sv-body" d="M46 6 C42 50 54 84 58 104 C62 134 38 176 34 232 L186 232 C182 176 158 134 162 104 C166 84 178 50 174 6 Z"/>
    <path class="us-sv-line" d="M56 150 C64 132 82 127 97 128 M164 150 C156 132 138 127 123 128"/>
    <line class="us-sv-dash" x1="38" x2="154" y1="128.5" y2="128.5"/>
    <text class="us-sv-t" x="4" y="117">iliac</text><text class="us-sv-t" x="4" y="126">crests</text>
    <line class="us-sv-mid" x1="110" x2="110" y1="22" y2="166"/>
    <path class="us-sv-sac" d="M92 168 L128 168 L119 214 L101 214 Z"/>
    <text class="us-sv-t" x="88" y="${y(14).toFixed(1)}" text-anchor="end">S</text>
    ${sps}
    <text class="us-sv-t us-sv-cr" x="60" y="20">↑ cranial</text>
    <g class="us-sv-probe" transform="translate(119 119) rotate(0)">
      <rect class="us-sv-probe-body" x="-5" y="-17" width="10" height="34"/>
      <circle class="us-sv-marker" cx="0" cy="-12.5" r="2.4"/>
    </g>
    <g class="us-sv-tilt"><path d="M136 112 C130 108 126 108 122 110" /><path d="M125 106 L121 110.5 L126.5 112.5"/><text class="us-sv-t" x="138" y="111">tilt</text></g>
  </svg>`;
  const holder = el('div', { class: 'us-sv-wrap', html: svgHtml });
  const svg = holder.firstElementChild;
  const g = svg.querySelector('.us-sv-probe'), tilt = svg.querySelector('.us-sv-tilt');
  const cap = el('p', { class: 'us-probe-cap' });
  const box = el('div', { class: 'us-probe' }, el('p', { class: 'us-mini-h', text: 'Probe position' }), holder, cap);
  function update(st) {
    let tx = 119, ty = y(-84), rot = 0, text = '';
    if (st.view === 'pso') text = 'Paramedian, about 2–3 cm from the midline over the laminae at L3–4, marker cranial, beam tilted towards the midline.';
    else if (st.view === 'sacrum') { const s = STOPS[st.stop]; ty = y(s.uc); text = `Paramedian, marker cranial, ${s.long}. Slide cranially and count the gaps.`; }
    else if (st.tmode === 'il') { tx = 110; rot = -90; text = 'Across the midline in the L3–4 gap, marker to the patient’s left.'; }
    else { tx = 110; ty = y(-103); rot = -90; text = 'Across the midline over the L3 spinous process, marker to the patient’s left.'; }
    g.setAttribute('transform', `translate(${tx} ${ty.toFixed(1)}) rotate(${rot})`);
    g.style.transform = `translate(${tx}px, ${ty.toFixed(1)}px) rotate(${rot}deg)`;
    tilt.style.display = st.view === 'transverse' ? 'none' : '';
    tilt.setAttribute('transform', `translate(0 ${(ty - y(-84)).toFixed(1)})`);
    cap.textContent = text;
  }
  return { box, update };
}
