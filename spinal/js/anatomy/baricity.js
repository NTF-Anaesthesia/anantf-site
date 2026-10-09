/* spinal/js/anatomy/baricity.js — Fig 1.3: supine spinal curves and where a hyperbaric, isobaric or hypobaric
   solution injected at L3–4 tends to go. A schematic particle model, not a simulation of real CSF flow. */
import { setupCanvas } from '../ui.js?v=1';
import * as K from './kit.js';

export const BW = 1000, BH = 340;
const TABLE = 300;
// canal centreline, supine (y grows towards the table). Lumbar peak ≈ L3–4, thoracic trough ≈ T5–6.
const CTRL = [[130, 205], [180, 192], [235, 202], [300, 226], [362, 240], [430, 233], [520, 214], [600, 192], [668, 182], [730, 192], [790, 216], [840, 240]];
const CURVE = K.spline(CTRL, false, 24).sort((a, b) => a[0] - b[0]);
export function yAt(x) {
  if (x <= CURVE[0][0]) return CURVE[0][1];
  for (let i = 1; i < CURVE.length; i++) if (CURVE[i][0] >= x) { const a = CURVE[i - 1], b = CURVE[i]; return K.lerp(a[1], b[1], (x - a[0]) / ((b[0] - a[0]) || 1)); }
  return CURVE[CURVE.length - 1][1];
}
const slope = (x) => (yAt(x + 2) - yAt(x - 2)) / 4;
const SAC_END = 800, TOP = 236, INJ = 672;
// vertebral centres along x
const VERTS = [];
(function () {
  const seg = (n, x0, x1, name, sz) => { for (let i = 0; i < n; i++) VERTS.push({ x: K.lerp(x0, x1, (i + 0.5) / n), name: `${name}${i + 1}`, sz }); };
  seg(7, 130, 232, 'C', 9); seg(12, 232, 532, 'T', 12); seg(5, 532, 718, 'L', 16);
})();
const X_OF = Object.fromEntries(VERTS.map((v) => [v.name, v.x]));
X_OF.S2 = 790;
const MODES = {
  hyper: { colour: '#8f431d' },
  iso: { colour: '#2f6f86' },
  hypo: { colour: '#5f4790' },
};

function drawScene(c, u) {
  K.paper(c, BW, BH, 15);
  // table
  c.fillStyle = '#d9cfc1'; c.fillRect(40, TABLE + 4, 920, 14); c.strokeStyle = 'rgba(43,30,24,.7)'; c.lineWidth = 1.2 * u; c.strokeRect(40, TABLE + 4, 920, 14);
  // body silhouette: back skin rests on the table except under the lumbar lordosis
  const back = [], front = [];
  const sm = (a, b, x) => K.ease(K.clamp((x - a) / (b - a)));
  const depth = (x) => 56 + 70 * sm(160, 320, x) - 14 * sm(420, 640, x) - 26 * sm(760, 900, x);
  for (let x = 120; x <= 930; x += 6) {
    const xs = Math.min(x, 850);
    back.push([x, Math.min(TABLE + 2, yAt(xs) + 60)]);
    front.push([x, yAt(xs) - depth(x) + (x > 850 ? (x - 850) * 0.35 : 0)]);
  }
  const body = front.concat(back.reverse());
  K.polyPath(c, body); c.fillStyle = '#efd9c6'; c.fill(); c.strokeStyle = 'rgba(43,30,24,.8)'; c.lineWidth = 1.3 * u; c.stroke();
  // head
  c.beginPath(); c.ellipse(78, 214, 46, 60, -0.15, 0, Math.PI * 2); c.fillStyle = '#efd9c6'; c.fill(); c.stroke();
  // vertebral bodies (anterior = up) and spinous processes (towards the table)
  VERTS.forEach((v) => {
    const y = yAt(v.x), a = Math.atan(slope(v.x));
    c.save(); c.translate(v.x, y); c.rotate(a);
    c.beginPath(); c.rect(-v.sz * 0.62, -12 - v.sz * 1.05, v.sz * 1.24, v.sz * 1.05); c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = 'rgba(43,30,24,.7)'; c.lineWidth = 1 * u; c.stroke();
    c.beginPath(); c.moveTo(0, 10); c.lineTo(v.sz * 0.25, 20 + v.sz * 0.4); c.strokeStyle = K.C.cortex; c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    c.restore();
  });
  // sacrum
  c.save(); const sx = 735, sy = yAt(sx); c.translate(sx, sy); c.rotate(Math.atan(slope(sx)) + 0.12);
  c.beginPath(); c.moveTo(-6, -30); c.quadraticCurveTo(60, -30, 118, -6); c.lineTo(116, 2); c.quadraticCurveTo(60, -8, -4, -10); c.closePath();
  c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = 'rgba(43,30,24,.7)'; c.lineWidth = 1 * u; c.stroke(); c.restore();
  // dural sac / CSF tube
  const tube = []; for (let x = 130; x <= SAC_END; x += 4) tube.push([x, yAt(x)]);
  const strokeTube = (w, col) => { c.beginPath(); tube.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); };
  strokeTube(19, 'rgba(43,30,24,.85)'); strokeTube(16, K.C.dura); strokeTube(12, K.C.csf);
  // cord to ~L1
  c.beginPath(); for (let x = 130; x <= X_OF.L1; x += 4) { const y = yAt(x); x === 130 ? c.moveTo(x, y) : c.lineTo(x, y); }
  c.strokeStyle = '#e8c4a6'; c.lineWidth = 5; c.stroke();
}

function labels(c, u, mode, s, compact) {
  const tick = (name, below = true) => {
    const x = X_OF[name], y = yAt(x);
    c.save(); c.strokeStyle = 'rgba(43,30,24,.6)'; c.lineWidth = 1 * u;
    c.beginPath(); c.moveTo(x, y + (below ? 10 : -34)); c.lineTo(x, y + (below ? 18 : -40)); c.stroke();
    c.font = `500 ${11.5 * u}px "NTF Mono",ui-monospace,monospace`; c.fillStyle = '#4a3a2e'; c.textAlign = 'center'; c.textBaseline = below ? 'top' : 'bottom';
    c.fillText(name, x, y + (below ? 20 : -42)); c.restore();
  };
  (compact ? ['T4', 'T10', 'L1', 'S2'] : ['C7', 'T4', 'T10', 'L1', 'L5', 'S2']).forEach((n) => tick(n, false));
  if (compact) {
    K.pill(c, 'Lowest ≈ T5–6', 340, 300, { anchor: [X_OF.T6 - 4, yAt(X_OF.T6) + 8], s, align: 'center' });
    K.pill(c, 'Highest ≈ L3–4', 700, 300, { anchor: [INJ - 4, yAt(INJ) + 8], s, align: 'center' });
  } else {
    K.pill(c, 'Thoracic kyphosis: lowest ≈ T5–6', 180, 296, { anchor: [X_OF.T6 - 4, yAt(X_OF.T6) + 8], s });
    K.pill(c, 'Lumbar lordosis: highest ≈ L3–4', 560, 270, { anchor: [INJ - 4, yAt(INJ) + 8], s });
    K.pill(c, 'Dural sac ends ≈ S2', 830, 290, { anchor: [SAC_END, yAt(SAC_END) + 6], s });
    K.tissueName(c, 'supine', 900, 324, { s: u, align: 'center' });
  }
  // injection marker
  c.save(); c.fillStyle = '#2b1e18'; const ix = INJ, iy = yAt(INJ) + 30;
  c.beginPath(); c.moveTo(ix, iy - 9); c.lineTo(ix - 6, iy + 2); c.lineTo(ix + 6, iy + 2); c.closePath(); c.fill(); void 0;
  c.font = `500 ${11.5 * u}px Inter,system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(compact ? 'L3–4' : 'injected at L3–4', ix, iy + 6); c.restore();
  // gravity cue
  c.save(); c.strokeStyle = '#2b1e18'; c.fillStyle = '#2b1e18'; c.lineWidth = 1.4 * u;
  c.beginPath(); c.moveTo(960, 30); c.lineTo(960, 70); c.stroke(); c.beginPath(); c.moveTo(954, 62); c.lineTo(960, 74); c.lineTo(966, 62); c.closePath(); c.fill();
  c.font = `500 ${11.5 * u}px Inter,system-ui,sans-serif`; c.textAlign = 'right'; c.textBaseline = 'middle'; c.fillText('gravity', 950, 50); c.restore();
  void mode;
}

export function createBaricity(canvas) {
  let size = { w: 0, h: 0 }, view = { x: 0, y: 0, w: BW, h: BH }, mode = 'hyper', parts = [], raf = 0, running = false, visible = false, frames = 0, sceneCache = null, sceneKey = '';
  const MAXF = 190;

  const PEAK = 668, TROUGH = 362, DUR = 150; // frames
  function reset() {
    const r = K.rng(77);
    const g = () => { let t = 0; for (let i = 0; i < 6; i++) t += r(); return t / 6 - 0.5; };
    parts = Array.from({ length: 170 }, () => ({ x0: INJ - 2 + g() * 26, x: 0, j: (r() - 0.5) * 7, n: r(), d: r() * 40 }));
    // targets: hyperbaric fills the thoracic trough (about 70%) and the sacral end; hypobaric collects at the
    // lumbar peak; isobaric stays near the injection site with a modest spread.
    const ceph = parts.filter((q) => q.n < 0.7).sort((a, b) => a.x0 - b.x0);
    const caud = parts.filter((q) => q.n >= 0.7).sort((a, b) => b.x0 - a.x0);
    parts.forEach((q) => { q.x = q.x0; });
    if (mode === 'hyper') {
      ceph.forEach((q, i) => { q.t = TROUGH + (i - ceph.length / 2) * 1.7; });
      caud.forEach((q, i) => { q.t = SAC_END - 6 - i * 1.1; });
    } else if (mode === 'hypo') {
      parts.slice().sort((a, b) => a.x0 - b.x0).forEach((q, i) => { q.t = PEAK + (i - parts.length / 2) * 0.55; });
    } else parts.forEach((q) => { q.t = INJ + (q.x0 - INJ) * 2.2 + (q.n - 0.5) * 30; });
    frames = 0;
  }
  function step() {
    frames++;
    parts.forEach((q) => { const k = K.ease(K.clamp((frames - q.d) / (DUR - 40))); q.x = K.lerp(q.x0, q.t, k); });
  }
  function scene() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const key = `${size.w}|${dpr}`;
    if (sceneKey === key) return sceneCache;
    sceneCache = sceneCache || document.createElement('canvas');
    sceneCache.width = Math.round(size.w * dpr); sceneCache.height = Math.round(size.h * dpr);
    const c = sceneCache.getContext('2d'); const k = size.w / view.w;
    c.setTransform(dpr * k, 0, 0, dpr * k, -view.x * dpr * k, -view.y * dpr * k);
    drawScene(c, 1 / k);
    sceneKey = key;
    return sceneCache;
  }
  function render() {
    if (!size.w) return;
    const c = setupCanvas(canvas, size.w, size.h);
    c.drawImage(scene(), 0, 0, size.w, size.h);
    const k = size.w / view.w, u = 1 / k, compact = size.w < 600, s = u;
    c.save(); c.scale(k, k); c.translate(-view.x, -view.y);
    labels(c, u, mode, s, compact);
    const col = MODES[mode].colour;
    parts.forEach((p) => {
      const y = yAt(p.x) + p.j * 0.75;
      c.beginPath(); c.arc(p.x, y, 2.3 * Math.max(u, 0.9), 0, Math.PI * 2); c.fillStyle = col; c.globalAlpha = 0.78; c.fill();
    });
    c.globalAlpha = 1;
    c.restore();
  }
  function loop() {
    if (!running || !visible) { raf = 0; return; }
    step();
    render();
    if (frames >= MAXF) { running = false; raf = 0; return; }
    raf = requestAnimationFrame(loop);
  }
  function play(instant) {
    cancelAnimationFrame(raf); raf = 0;
    reset();
    if (instant) { while (frames < MAXF) step(); running = false; render(); return; }
    running = true; render();
    if (visible) raf = requestAnimationFrame(loop);
  }
  return {
    resize(cssW) { view = cssW < 600 ? { x: 196, y: 96, w: 690, h: 232 } : { x: 0, y: 0, w: BW, h: BH }; size = { w: cssW, h: Math.round((cssW * view.h) / view.w) }; sceneKey = ''; render(); },
    setMode(m, instant) { mode = m; play(instant); },
    replay(instant) { play(instant); },
    visible(v) { visible = v; if (v && running && !raf) raf = requestAnimationFrame(loop); },
    finishNow() { while (frames < MAXF) step(); running = false; render(); },
    get mode() { return mode; },
  };
}
