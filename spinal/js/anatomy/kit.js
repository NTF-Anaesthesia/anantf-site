/* spinal/js/anatomy/kit.js — shared canvas 2D drawing kit for the spinal page.
   Ported from Dr Chew Shi Hao's ra/engine.js drawing idioms (pill, warnPill, cuePill, drawNeedle, rng, paper),
   rewritten as ES-module exports. Ultrasound and troubleshooting may import it:

     import * as K from '../anatomy/kit.js';

   STABLE API (do not rely on anything not listed here):
   ── maths
     rng(seed) → () => number in [0,1)          deterministic PRNG (mulberry32), same as ra/engine.js
     clamp(x, a=0, b=1), lerp(a, b, k), seg(t, a, b)  (seg = clamped 0..1 progress of t between a and b)
     ease(x), easeOut(x)                          cubic easings
     spline(points, closed=false, n=14) → points  Catmull-Rom through [[x,y],…]
     ellipsePts(cx, cy, rx, ry, n=72, a0=-π/2, rot=0) → points
     mkPath(points) → path ; strokePartial(ctx, path, p)   stroke the first p (0..1) of a polyline ("draw-on" outlines)
     polyPath(ctx, points)                        beginPath + moveTo/lineTo + closePath
     inPoly(x, y, points) → boolean
   ── colours
     C  plate colours (same in both themes): paper, ink, skin, fat, supra, inter, flavum, epifat, vein, dura,
        arachnoid, csf, bone, cortex, cord, root, rootLine, needle, needleEdge, warn, cue, pillBg
   ── drawing (all sizes in CSS px of the ctx; `s` = scale factor, 1 = 13px label text)
     paper(ctx, w, h, seed=3)                     printed-plate background (paper + soft blotches + grain)
     fatLobules(ctx, points, seed, s=1)           fat lobules clipped to a polygon
     fibres(ctx, points, angle, n, seed, alpha=1, s=1)  fibre hatching inside a polygon
     pill(ctx, text, x, y, {align='left'|'right'|'center', anchor:[x,y]|null, alpha=1, s=1, dark=false}) → {x,y,w,h}
        Inter 500 label pill; optional leader line to anchor with a dot. dark:true = white text on ink pill.
     warnPill(ctx, text, x, y, {anchor, alpha, s}) → {x,y,w,h}   red pill with × (left edge at x)
     cuePill(ctx, text, x, y, {alpha, s}) → {x,y,w,h}             brown pill with ✓ (left edge at x)
     pillSize(ctx, text, s=1) → {w,h}             measure a pill before placing it
     tissueName(ctx, text, x, y, {alpha=1, s=1, align='center', color})  Fraunces italic tissue label
     drawNeedle(ctx, from:[x,y], tip:[x,y], {alpha=1, s=1})   spinal needle shaft + bevel tip (ra/ look)
   All functions save/restore the ctx state. Pills are the only rounded things on the page (DESIGN.md).
*/

// ---------------------------------------------------------------- maths
export function rng(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);

export function spline(P, closed = false, n = 14) {
  const out = [];
  const L = P.length;
  const cnt = closed ? L : L - 1;
  for (let i = 0; i < cnt; i++) {
    const p0 = P[closed ? (i - 1 + L) % L : Math.max(i - 1, 0)];
    const p1 = P[i];
    const p2 = P[(i + 1) % L];
    const p3 = P[closed ? (i + 2) % L : Math.min(i + 2, L - 1)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  out.push(closed ? out[0].slice() : P[L - 1].slice());
  return out;
}

export function ellipsePts(cx, cy, rx, ry, n = 72, a0 = -Math.PI / 2, rot = 0) {
  const o = [], cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i <= n; i++) {
    const a = a0 + (i / n) * Math.PI * 2, x = rx * Math.cos(a), y = ry * Math.sin(a);
    o.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return o;
}

export function mkPath(pts) {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, len: cum[cum.length - 1] };
}

export function strokePartial(c, path, p) {
  if (p <= 0) return;
  const { pts, cum, len } = path, target = len * Math.min(p, 1);
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= target) {
      const k = (target - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1);
      c.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k));
      break;
    }
    c.lineTo(pts[i][0], pts[i][1]);
  }
  c.stroke();
}

export function polyPath(c, pts) {
  c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  c.closePath();
}

export function inPoly(x, y, P) {
  let ins = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, yi] = P[i], [xj, yj] = P[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}

function bbox(P) {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  P.forEach(([x, y]) => { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); });
  return [a, b, c, d];
}

// ---------------------------------------------------------------- colours (DESIGN.md §2.4 plate tokens)
export const C = Object.freeze({
  paper: '#f4ece1', ink: '#2b1e18', skin: '#e7c0a3', fat: '#f2dcc8', supra: '#d8c49b', inter: '#e2d3b0',
  flavum: '#e2b64a', epifat: '#f6e6b8', vein: '#5a2a3a', dura: '#b4a3c4', arachnoid: '#d9cfe3', csf: '#cfe4ea',
  bone: '#ece2cc', cortex: '#b6a684', cord: '#efd2bb', root: '#e8c4a6', rootLine: '#a85f37',
  needle: '#a9adb6', needleEdge: '#2f3035', warn: '#9b2b1a', cue: '#8f431d', pillBg: 'rgba(251,247,241,.93)',
});

const SANS = 'Inter, "NTF Sans", system-ui, sans-serif';
const SERIF = 'Fraunces, "NTF Serif", Georgia, serif';

function rrect(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

// ---------------------------------------------------------------- backgrounds and textures
export function paper(c, w, h, seed = 3) {
  const r = rng(seed);
  c.save();
  c.fillStyle = C.paper; c.fillRect(0, 0, w, h);
  const blotches = Math.round((w * h) / 32000) + 6;
  for (let i = 0; i < blotches; i++) {
    const x = r() * w, y = r() * h, rad = 40 + r() * Math.max(w, h) * 0.14;
    const gr = c.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(214,190,160,.10)'); gr.addColorStop(1, 'rgba(214,190,160,0)');
    c.fillStyle = gr; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  const grains = Math.round((w * h) / 290);
  for (let i = 0; i < grains; i++) {
    c.fillStyle = `rgba(90,60,40,${0.03 + r() * 0.07})`;
    c.fillRect(r() * w, r() * h, r() * 1.2 + 0.3, r() * 1.2 + 0.3);
  }
  c.restore();
}

export function fatLobules(c, P, seed = 5, s = 1) {
  const r = rng(seed), bb = bbox(P), pts = [];
  const rxa = 5 * s, rxb = 11 * s, rya = 4 * s, ryb = 8 * s;
  let tries = 0;
  while (tries < 4000) {
    tries++;
    const x = bb[0] + r() * (bb[2] - bb[0]), y = bb[1] + r() * (bb[3] - bb[1]);
    const rx = rxa + r() * (rxb - rxa), ry = rya + r() * (ryb - rya);
    if (pts.some((p) => Math.hypot((p.x - x) / (p.rx + rx), (p.y - y) / (p.ry + ry)) < 0.92)) continue;
    pts.push({ x, y, rx, ry, a: (r() - 0.5) * 0.6 });
  }
  c.save(); polyPath(c, P); c.clip();
  pts.forEach((p) => {
    c.beginPath(); c.ellipse(p.x, p.y, p.rx, p.ry, p.a, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,246,236,.35)'; c.fill();
    c.strokeStyle = '#c9a88a'; c.lineWidth = 0.9; c.stroke();
  });
  c.restore();
}

export function fibres(c, P, ang, n, seed = 7, al = 1, s = 1) {
  const r = rng(seed), bb = bbox(P);
  c.save(); polyPath(c, P); c.clip();
  for (let i = 0; i < n; i++) {
    let x, y, k = 0;
    do { x = bb[0] + r() * (bb[2] - bb[0]); y = bb[1] + r() * (bb[3] - bb[1]); k++; } while (!inPoly(x, y, P) && k < 30);
    const len = (12 + r() * 40) * s, a = ang + (r() - 0.5) * 0.28, cu = (r() - 0.5) * 0.35, dx = Math.cos(a), dy = Math.sin(a);
    c.beginPath(); c.moveTo(x, y);
    c.quadraticCurveTo(x + (dx * len) / 2 - dy * cu * len, y + (dy * len) / 2 + dx * cu * len, x + dx * len, y + dy * len);
    const dark = r() < 0.62;
    c.strokeStyle = dark ? `rgba(92,50,30,${(0.12 + r() * 0.28) * al})` : `rgba(255,244,232,${(0.25 + r() * 0.35) * al})`;
    c.lineWidth = 0.45 + r() * 0.7; c.stroke();
  }
  c.restore();
}

// ---------------------------------------------------------------- labels
export function pillSize(c, text, s = 1) {
  c.save(); c.font = `500 ${13 * s}px ${SANS}`;
  const w = c.measureText(text).width + 16 * s;
  c.restore();
  return { w, h: 22 * s };
}

export function pill(c, text, x, y, { align = 'left', anchor = null, alpha = 1, s = 1, dark = false } = {}) {
  c.save(); c.globalAlpha = alpha; c.font = `500 ${13 * s}px ${SANS}`;
  const w = c.measureText(text).width + 16 * s, h = 22 * s;
  const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
  if (anchor) {
    const ax = align === 'right' ? x : align === 'center' ? x : x0;
    c.strokeStyle = 'rgba(43,30,24,.75)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(ax, y); c.lineTo(anchor[0], anchor[1]); c.stroke();
    c.beginPath(); c.arc(anchor[0], anchor[1], 2.2 * Math.max(s, 0.8), 0, Math.PI * 2); c.fillStyle = C.ink; c.fill();
  }
  c.fillStyle = dark ? 'rgba(43,30,24,.92)' : C.pillBg;
  rrect(c, x0, y - h / 2, w, h, h / 2); c.fill();
  c.strokeStyle = dark ? 'rgba(43,30,24,1)' : 'rgba(43,30,24,.25)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = dark ? '#ffffff' : C.ink; c.textBaseline = 'middle'; c.textAlign = 'left';
  c.fillText(text, x0 + 8 * s, y + 0.5);
  c.restore();
  return { x: x0, y: y - h / 2, w, h };
}

function statusPill(c, text, x, y, colour, bg, glyph, { anchor = null, alpha = 1, s = 1 } = {}) {
  c.save(); c.globalAlpha = alpha; c.font = `600 ${13 * s}px ${SANS}`;
  const w = c.measureText(text).width + 36 * s, h = 24 * s, r = 7 * s, cx = x + 13 * s;
  if (anchor) { c.strokeStyle = colour; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(anchor[0], anchor[1]); c.stroke(); }
  c.fillStyle = bg; rrect(c, x, y - h / 2, w, h, h / 2); c.fill();
  c.strokeStyle = colour; c.lineWidth = 1.4; c.stroke();
  c.beginPath(); c.arc(cx, y, r, 0, Math.PI * 2); c.fillStyle = colour; c.fill();
  c.strokeStyle = bg; c.lineWidth = 1.7 * s; c.lineCap = 'round'; c.beginPath();
  if (glyph === 'x') { const d = 2.8 * s; c.moveTo(cx - d, y - d); c.lineTo(cx + d, y + d); c.moveTo(cx + d, y - d); c.lineTo(cx - d, y + d); }
  else { c.moveTo(cx - 3.6 * s, y); c.lineTo(cx - 1 * s, y + 2.7 * s); c.lineTo(cx + 3.6 * s, y - 2.8 * s); }
  c.stroke();
  c.fillStyle = colour; c.textBaseline = 'middle'; c.textAlign = 'left'; c.fillText(text, x + 26 * s, y + 0.5);
  c.restore();
  return { x, y: y - h / 2, w, h };
}

export function warnPill(c, text, x, y, opts = {}) { return statusPill(c, text, x, y, C.warn, '#fbf1ea', 'x', opts); }
export function cuePill(c, text, x, y, opts = {}) { return statusPill(c, text, x, y, C.cue, '#fbf4ec', 'tick', { ...opts, anchor: null }); }

export function tissueName(c, text, x, y, { alpha = 1, s = 1, align = 'center', color = '#5b3a28' } = {}) {
  c.save(); c.globalAlpha = alpha * 0.9; c.font = `italic 400 ${15 * s}px ${SERIF}`;
  c.fillStyle = color; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(text, x, y);
  c.restore();
}

// ---------------------------------------------------------------- needle
export function drawNeedle(c, S, tip, { alpha = 1, s = 1 } = {}) {
  if (alpha <= 0) return;
  const [tx, ty] = tip, d = [tx - S[0], ty - S[1]], l = Math.hypot(d[0], d[1]) || 1;
  const ux = d[0] / l, uy = d[1] / l, nx = -uy, ny = ux, bx = tx - ux * 9 * s, by = ty - uy * 9 * s;
  c.save(); c.globalAlpha = alpha; c.lineCap = 'round';
  c.beginPath(); c.moveTo(S[0], S[1]); c.lineTo(bx, by);
  c.strokeStyle = C.needleEdge; c.lineWidth = 4.2 * s; c.stroke();
  c.strokeStyle = C.needle; c.lineWidth = 2.5 * s; c.stroke();
  c.beginPath(); c.moveTo(S[0] - nx * 0.7 * s, S[1] - ny * 0.7 * s); c.lineTo(bx - nx * 0.7 * s, by - ny * 0.7 * s);
  c.strokeStyle = 'rgba(250,251,253,.9)'; c.lineWidth = 0.7 * s; c.stroke();
  c.beginPath(); c.moveTo(bx + nx * 2.1 * s, by + ny * 2.1 * s); c.lineTo(tx, ty); c.lineTo(bx - nx * 2.1 * s, by - ny * 2.1 * s); c.closePath();
  c.fillStyle = '#8e929b'; c.fill(); c.strokeStyle = C.needleEdge; c.lineWidth = 0.9; c.stroke();
  c.restore();
}
