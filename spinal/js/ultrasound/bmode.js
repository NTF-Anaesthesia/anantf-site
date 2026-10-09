// spinal/js/ultrasound/bmode.js — procedural B-mode for a low-frequency curvilinear probe. Owner: B4.
//
// Original code, written for this page. The approach follows the brachial plexus app's simulator
// (speckle from complex Gaussian scatterers convolved with a point-spread function, a per-line
// attenuation walk for bone shadows and fluid enhancement, then log compression), but the image is
// formed the way a curved array forms it:
//   1. Tissue maps are painted in Cartesian millimetres (x across the screen, z depth from the skin
//      at the centre of the probe): mean echo, specular reflectors, soft attenuation and hard blockers.
//   2. The maps are sampled along NA diverging scan lines from a virtual apex R mm above the skin
//      (polar grid: rows = depth along the beam, columns = beam angle).
//   3. Speckle + PSF + attenuation walk happen in that polar grid, so shadows fan out with the beam.
//   4. Scan conversion back to a sector image at whatever pixel size the page needs (cached).
// Specular brightness depends on the angle between the surface and the local beam, so the steep
// caudal face of a lamina stays dark while its sloping back is bright, as on a real scanner.

import { spline } from '../anatomy/kit.js';

export const PROBE = Object.freeze({ R: 50, half: (32 * Math.PI) / 180, depth: 90, focus: 50 });
/** Frame shared by the scan and the diagram, in mm: x across, z depth from the skin at the centre. */
export const FRAME = Object.freeze({ x0: -82, x1: 88, z0: -12, z1: 92 });
export const FRAME_W = FRAME.x1 - FRAME.x0;
export const FRAME_H = FRAME.z1 - FRAME.z0;

const PM = 4; // map resolution, px per mm
const MW = Math.round(FRAME_W * PM), MH = Math.round(FRAME_H * PM);
const NA = 288, NR = 440;
const DR = PROBE.depth / NR, DTH = (2 * PROBE.half) / NA;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
export const gray = (v) => { const c = Math.round(clamp(v) * 255); return `rgb(${c},${c},${c})`; };

function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

// Standard normal and Rayleigh lookup tables (deterministic).
const GAUSS = new Float32Array(65536), RAYL = new Float32Array(65536);
{
  const r = mulberry(4242);
  for (let i = 0; i < 65536; i += 2) {
    const m = Math.sqrt(-2 * Math.log(r() || 1e-9)), th = 6.283185 * r();
    GAUSS[i] = m * Math.cos(th); GAUSS[i + 1] = m * Math.sin(th);
  }
  for (let i = 0; i < 65536; i++) RAYL[i] = Math.sqrt(-2 * Math.log(r() || 1e-9));
}

// ------------------------------------------------------------------ geometry helpers (mm)
/** Skin surface under the curved probe face (z of the skin at lateral position x). */
export function skinZ(x) {
  const R = PROBE.R, ax = Math.min(Math.abs(x), R * 0.999);
  return Math.sqrt(R * R - ax * ax) - R;
}
/** Is (x, z) inside the imaged sector? */
export function inFan(x, z) {
  const r = Math.hypot(x, z + PROBE.R), th = Math.atan2(x, z + PROBE.R);
  return r >= PROBE.R && r <= PROBE.R + PROBE.depth && Math.abs(th) <= PROBE.half;
}
/** Point along the beam through (x, z), continued to depth zTo. */
export function alongBeam(x, z, zTo) {
  const k = (zTo + PROBE.R) / (z + PROBE.R);
  return [x * k, zTo];
}
/** Outline of the sector as points (mm). */
export function fanOutline(n = 48) {
  const { R, half, depth } = PROBE, pts = [];
  for (let i = 0; i <= n; i++) { const t = -half + (2 * half * i) / n; pts.push([R * Math.sin(t), R * Math.cos(t) - R]); }
  for (let i = n; i >= 0; i--) { const t = -half + (2 * half * i) / n; pts.push([(R + depth) * Math.sin(t), (R + depth) * Math.cos(t) - R]); }
  return pts;
}
export const smooth = (pts, closed = false, n = 8) => spline(pts, closed, n);

// ------------------------------------------------------------------ polar sampling table
let IDX = null;
function polarIndex() {
  if (IDX) return IDX;
  IDX = new Int32Array(NA * NR);
  const { R, half } = PROBE;
  for (let j = 0; j < NR; j++) {
    const r = R + (j + 0.5) * DR;
    for (let i = 0; i < NA; i++) {
      const th = -half + (i + 0.5) * DTH;
      const x = r * Math.sin(th), z = r * Math.cos(th) - R;
      const mx = Math.min(MW - 1, Math.max(0, Math.floor((x - FRAME.x0) * PM)));
      const mz = Math.min(MH - 1, Math.max(0, Math.floor((z - FRAME.z0) * PM)));
      IDX[j * NA + i] = mz * MW + mx;
    }
  }
  return IDX;
}

// ------------------------------------------------------------------ painting the tissue maps
function makeCtx(fill) {
  const c = document.createElement('canvas'); c.width = MW; c.height = MH;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.fillStyle = fill; x.fillRect(0, 0, MW, MH);
  x.setTransform(PM, 0, 0, PM, -FRAME.x0 * PM, -FRAME.z0 * PM);
  x.lineCap = 'round'; x.lineJoin = 'round';
  return x;
}
export function pathOf(pts, closed = true) {
  const p = new Path2D();
  pts.forEach(([x, z], i) => (i ? p.lineTo(x, z) : p.moveTo(x, z)));
  if (closed) p.closePath();
  return p;
}
export function bboxOf(pts) {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, z] of pts) { a = Math.min(a, x); b = Math.min(b, z); c = Math.max(c, x); d = Math.max(d, z); }
  return [a, b, c, d];
}

function blobs(C, path, box, nPerMm2, rMm, g0, g1, ctx = C.e) {
  const rnd = C.rnd, [x0, y0, x1, y1] = box;
  const n = Math.min(9000, (x1 - x0) * (y1 - y0) * nPerMm2);
  ctx.save(); ctx.clip(path);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = gray(lerp(g0, g1, rnd()));
    const r = lerp(rMm[0], rMm[1], rnd());
    ctx.beginPath(); ctx.ellipse(lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), r, r * (0.45 + rnd() * 0.3), (rnd() - 0.5) * 0.5, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function strands(C, path, box, nPerMm2, angDeg, angJit, lenMm, g0, g1, spAmp, wMm = [0.12, 0.25]) {
  const rnd = C.rnd, [x0, y0, x1, y1] = box;
  const n = Math.min(6000, (x1 - x0) * (y1 - y0) * nPerMm2);
  C.e.save(); C.e.clip(path); C.sp.save(); C.sp.clip(path);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd());
    const len = lerp(lenMm[0], lenMm[1], rnd() ** 1.4);
    const a = ((angDeg + (rnd() - 0.5) * 2 * angJit) * Math.PI) / 180;
    const bend = (rnd() - 0.5) * 0.2 * len, dx = Math.cos(a) * len, dy = Math.sin(a) * len;
    const w = lerp(wMm[0], wMm[1], rnd());
    const draw = (ctx) => { ctx.beginPath(); ctx.moveTo(x - dx / 2, y - dy / 2); ctx.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + dx / 2, y + dy / 2); ctx.stroke(); };
    C.e.strokeStyle = gray(lerp(g0, g1, rnd())); C.e.lineWidth = w; draw(C.e);
    if (spAmp && rnd() < 0.45) { C.sp.strokeStyle = gray(spAmp * (0.4 + rnd() * 0.6)); C.sp.lineWidth = w * 0.8; draw(C.sp); }
  }
  C.e.restore(); C.sp.restore();
}

/** Specular reflector along a polyline. Brightest where the surface faces the (diverging) beam. */
function specLine(C, pts, amp, wMm, { floor = 0.2, pow = 2, eAmp = 0.35, gaps = 0, wav = 0, vary = 0.3 } = {}) {
  const rnd = C.rnd, R = PROBE.R;
  if (wav) {
    const lam = 3 + rnd() * 4, ph = rnd() * 6.28; let cum = 0;
    pts = pts.map((p, i) => {
      if (i) cum += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      return [p[0], p[1] + wav * Math.sin((cum / lam) * 6.28 + ph)];
    });
  }
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const gapAt = Array.from({ length: gaps }, (_, g) => [total * ((g + 0.5 + (rnd() - 0.5) * 0.6) / gaps), 0.8 + rnd() * 1.6]);
  const lamA = 3 + rnd() * 5, phA = rnd() * 6.28, lamB = 1 + rnd() * 1.2, phB = rnd() * 6.28;
  let cum = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1e-6;
    cum += len;
    if (gapAt.some(([c, w]) => Math.abs(cum - c) < w / 2)) continue;
    const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, bl = Math.hypot(mx, mz + R);
    const bx = mx / bl, bz = (mz + R) / bl;
    const perp = Math.abs((dx / len) * bz - (dz / len) * bx);
    const mod = clamp(1 - vary + vary * (0.65 + 0.35 * Math.sin((cum / lamA) * 6.28 + phA) + 0.2 * Math.sin((cum / lamB) * 6.28 + phB)), 0.2, 1.1);
    const f = (floor + (1 - floor) * perp ** pow) * mod * (0.85 + rnd() * 0.3);
    C.sp.strokeStyle = gray(amp * f); C.sp.lineWidth = wMm;
    C.sp.beginPath(); C.sp.moveTo(a[0], a[1]); C.sp.lineTo(b[0], b[1]); C.sp.stroke();
    if (eAmp) { C.e.strokeStyle = gray(eAmp * (0.4 + 0.6 * f)); C.e.lineWidth = wMm * 1.2; C.e.beginPath(); C.e.moveTo(a[0], a[1]); C.e.lineTo(b[0], b[1]); C.e.stroke(); }
  }
}

// Painters by structure kind. Each receives (C, struct, shape).
const PAINT = {
  fat(C, st, sh) {
    const p = pathOf(sh.pts), box = bboxOf(sh.pts);
    C.e.fillStyle = gray(0.11); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    blobs(C, p, box, 0.25, [0.8, 2.6], 0.03, 0.13);
    // Thin bright septa between fat lobules, roughly parallel to the skin.
    const rnd = C.rnd, n = Math.round((box[2] - box[0]) * 0.32);
    C.e.save(); C.e.clip(p); C.sp.save(); C.sp.clip(p);
    for (let i = 0; i < n; i++) {
      const x = lerp(box[0], box[2], rnd()), z = lerp(box[1] + 1.2, box[3] - 0.8, rnd()), L = 3 + rnd() * 9, a = (rnd() - 0.5) * 0.35;
      const q = [[x, z], [x + Math.cos(a) * L * 0.5, z + Math.sin(a) * L * 0.5 + (rnd() - 0.5) * 0.6], [x + Math.cos(a) * L, z + Math.sin(a) * L]];
      specLine(C, q, 0.42, 0.22, { floor: 0.35, eAmp: 0.3 });
    }
    C.e.restore(); C.sp.restore();
  },
  muscle(C, st, sh) {
    const p = pathOf(sh.pts), box = bboxOf(sh.pts), base = (st.echo ?? 0.14) * 0.8;
    C.e.fillStyle = gray(base); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    blobs(C, p, box, 0.05, [2, 5], base * 0.6, base * 1.35);
    if (st.cross) {
      // Muscle cut across its fibres: speckled, with short bright dots and dashes.
      strands(C, p, box, 0.24, st.stri ?? 0, 70, [0.5, 1.8], 0.26, 0.55, 0.5, [0.16, 0.3]);
    } else {
      // Along the fibres: long, thin, bright perimysial lines.
      strands(C, p, box, 0.17, st.stri ?? 0, 4, [5, 16], 0.3, 0.6, 0.85, [0.2, 0.34]);
    }
  },
  septum(C, st, sh) { specLine(C, sh.pts, st.amp ?? 0.75, sh.w ?? 0.4, { floor: 0.3, gaps: st.gaps ?? 2, wav: 0.25, eAmp: 0.45 }); },
  fascia(C, st, sh) { specLine(C, sh.pts, st.amp ?? 0.8, sh.w ?? 0.45, { floor: 0.3, wav: 0.2, eAmp: 0.5 }); },
  skin(C, st, sh) {
    const p = pathOf(sh.pts);
    C.e.fillStyle = gray(0.42); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    blobs(C, p, bboxOf(sh.pts), 1.2, [0.2, 0.6], 0.3, 0.6);
    if (sh.top) specLine(C, sh.top, 0.95, 0.35, { floor: 1, eAmp: 0.7, vary: 0.15 });
    if (sh.bottom) specLine(C, sh.bottom, 0.55, 0.3, { floor: 0.8, eAmp: 0.4, wav: 0.1 });
  },
  isl(C, st, sh) {
    const p = pathOf(sh.pts), box = bboxOf(sh.pts);
    C.e.fillStyle = gray(0.07); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    strands(C, p, box, 0.25, 90, 8, [1.5, 4], 0.1, 0.2, 0.12, [0.12, 0.2]);
  },
  epi(C, st, sh) {
    const p = pathOf(sh.pts);
    C.e.fillStyle = gray(0.1); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    blobs(C, p, bboxOf(sh.pts), 0.6, [0.3, 0.8], 0.06, 0.2);
  },
  csf(C, st, sh) {
    const p = pathOf(sh.pts);
    C.e.fillStyle = gray(0.004); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    C.at.fillStyle = gray(215 / 255); C.at.fill(p); // fluid: posterior enhancement
  },
  roots(C, st, sh) {
    if (sh.dot) {
      C.e.fillStyle = gray(0.07); C.e.beginPath(); C.e.ellipse(sh.dot[0], sh.dot[1], 0.45, 0.35, 0, 0, 7); C.e.fill();
      return;
    }
    specLine(C, sh.pts, 0.075, 0.3, { floor: 0.5, eAmp: 0.07, gaps: 3, wav: 0.35, vary: 0.7 });
  },
  disc(C, st, sh) {
    const p = pathOf(sh.pts);
    C.e.fillStyle = gray(0.07); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    C.at.fillStyle = gray(70 / 255); C.at.fill(p);
    C.hb.fillStyle = '#fff'; C.hb.fill(p); // a disc does not block the beam the way bone does
    blobs(C, p, bboxOf(sh.pts), 0.3, [0.5, 1.4], 0.04, 0.14);
  },
  bone(C, st, sh) {
    const p = pathOf(sh.pts);
    C.e.fillStyle = '#000'; C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
    // Hard blocker for the shadow, nudged a little deeper so the bright cortex is not swallowed.
    C.hb.save(); C.hb.translate(0, 1.3); C.hb.fillStyle = '#000'; C.hb.fill(p); C.hb.restore(); C.hbBlur = true;
    if (sh.surface) {
      specLine(C, sh.surface, st.amp ?? 1, st.w ?? 1.45, { floor: st.floor ?? 0.4, pow: 1.3, eAmp: 0.95, vary: 0.18 });
      // A thin second echo just under the cortex gives the line its thickness on low-frequency scans.
      specLine(C, sh.surface.map(([x, z]) => [x, z + 0.7]), (st.amp ?? 1) * 0.6, 0.9, { floor: 0.25, pow: 1.4, eAmp: 0.5 });
    }
  },
  flavum(C, st, sh) { specLine(C, sh.pts, st.amp ?? 0.8, sh.w ?? 1.5, { floor: 0.4, pow: 2, eAmp: 0.6, wav: 0.12 }); },
  dura(C, st, sh) { specLine(C, sh.pts, st.amp ?? 0.9, sh.w ?? 0.6, { floor: 0.3, pow: 2, eAmp: 0.4, wav: 0.08 }); },
  line(C, st, sh) { specLine(C, sh.pts, st.amp ?? 1, sh.w ?? 1, { floor: 0.3, pow: 1.6, eAmp: 0.55, wav: 0.1 }); },
};
export const PAINT_ORDER = ['tissue', 'fat', 'muscle', 'septum', 'fascia', 'isl', 'epi', 'csf', 'roots', 'flavum', 'dura', 'bone', 'disc', 'line', 'skin'];

function paintScene(scene) {
  const C = { e: makeCtx(gray(0.26)), sp: makeCtx('#000'), at: makeCtx(gray(128 / 255)), hb: makeCtx('#fff'), rnd: mulberry(hashStr(scene.seed || scene.id)) };
  // Deep connective tissue background (seen only where nothing else is drawn).
  const all = pathOf([[FRAME.x0, FRAME.z0], [FRAME.x1, FRAME.z0], [FRAME.x1, FRAME.z1], [FRAME.x0, FRAME.z1]]);
  blobs(C, all, [FRAME.x0, FRAME.z0, FRAME.x1, FRAME.z1], 0.03, [1, 3], 0.14, 0.4);
  const parts = [];
  for (const st of scene.structs) for (const sh of st.shapes || []) if (sh.paint) parts.push([st, sh]);
  parts.sort((a, b) => PAINT_ORDER.indexOf(a[1].paint) - PAINT_ORDER.indexOf(b[1].paint));
  for (const [st, sh] of parts) PAINT[sh.paint]?.(C, { ...st, ...(sh.opts || {}) }, sh);
  if (C.hbBlur) {
    // Soften the bone blockers once (one blur pass instead of one per bone).
    const hb = makeCtx('#fff');
    hb.setTransform(1, 0, 0, 1, 0, 0); hb.filter = `blur(${0.45 * PM}px)`; hb.drawImage(C.hb.canvas, 0, 0);
    C.hb = hb;
  }
  const tq = []; for (const k of ['e','sp','at','hb']) { const tp = performance.now(); C[k].getImageData(0,0,1,1); tq.push(Math.round(performance.now()-tp)); } TP.push(tq.join('/'));
  return C;
}

// ------------------------------------------------------------------ PSF helpers (as in the plexus app)
function gaussKernel(sigma, norm) {
  const r = Math.max(1, Math.ceil(sigma * 3)), k = new Float32Array(2 * r + 1);
  let s = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k[i + r] = v; s += norm === 2 ? v * v : v; }
  const d = norm === 2 ? Math.sqrt(s) : s;
  for (let i = 0; i < k.length; i++) k[i] /= d;
  return k;
}
function convRows(src, W, H, k) {
  const r = (k.length - 1) / 2, out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const o = y * W;
    for (let j = -r; j <= r; j++) {
      const yy = Math.min(H - 1, Math.max(0, y + j)), w = k[j + r], so = yy * W;
      for (let x = 0; x < W; x++) out[o + x] += src[so + x] * w;
    }
  }
  return out;
}
function boxRadii(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => Math.max(0, ((i < m ? wl : wl + 2) - 1) / 2));
}
function boxSumSq(radii) {
  let k = [1];
  for (const r of radii) {
    const w = 2 * r + 1, out = new Array(k.length + w - 1).fill(0);
    for (let i = 0; i < k.length; i++) for (let j = 0; j < w; j++) out[i + j] += k[i] / w;
    k = out;
  }
  return k.reduce((a, v) => a + v * v, 0);
}
function boxRow(src, dst, o, W, r) {
  if (r <= 0) { for (let x = 0; x < W; x++) dst[o + x] = src[o + x]; return; }
  const inv = 1 / (2 * r + 1), last = o + W - 1;
  let acc = src[o] * (r + 1);
  for (let j = 1; j <= r; j++) acc += src[Math.min(o + j, last)];
  for (let x = 0; x < W; x++) {
    dst[o + x] = acc * inv;
    acc += src[Math.min(o + x + r + 1, last)] - src[Math.max(o + x - r, o)];
  }
}
function blurRow(src, dst, tmp, o, W, radii, gain) {
  boxRow(src, tmp, o, W, radii[0]); boxRow(tmp, dst, o, W, radii[1]); boxRow(dst, tmp, o, W, radii[2]);
  for (let x = 0; x < W; x++) dst[o + x] = tmp[o + x] * gain;
}

// ------------------------------------------------------------------ B-mode in the polar grid
function renderPolar(C, seed) {
  const N = NA * NR, idx = polarIndex();
  const eD = C.e.getImageData(0, 0, MW, MH).data, sD = C.sp.getImageData(0, 0, MW, MH).data;
  const aD = C.at.getImageData(0, 0, MW, MH).data, bD = C.hb.getImageData(0, 0, MW, MH).data;
  const E = new Float32Array(N), S = new Float32Array(N), A = new Uint8Array(N), B = new Uint8Array(N);
  for (let k = 0; k < N; k++) { const m = idx[k] * 4; E[k] = eD[m] / 255; S[k] = sD[m] / 255; A[k] = aD[m]; B[k] = bD[m]; }

  const { R, depth, focus } = PROBE;
  // Axial PSF (along the beam): sigma about 0.24 mm. Lateral PSF: about 0.5 mm at the focus,
  // wider above and below it, converted to beam-angle columns for each depth row.
  const ky2 = gaussKernel(0.3 / DR, 2), ky1 = gaussKernel(0.3 / DR, 1);
  const kc = new Map(), rowK = [];
  for (let j = 0; j < NR; j++) {
    const r = R + (j + 0.5) * DR, z = r - R;
    const sxMm = 0.7 * (1 + (1.2 * Math.abs(z - focus)) / depth);
    const cols = sxMm / (r * DTH), key = Math.round(cols * 4);
    if (!kc.has(key)) { const radii = boxRadii(key / 4); kc.set(key, { radii, l2: 1 / Math.sqrt(boxSumSq(radii)) }); }
    rowK.push(kc.get(key));
  }
  const tmp = new Float32Array(N);
  let sp = convRows(S, NA, NR, ky1);
  const sp2 = new Float32Array(N);
  for (let j = 0; j < NR; j++) blurRow(sp, sp2, tmp, j * NA, NA, rowK[j].radii, 1);
  sp = null;

  const CS = 2.6, LOOKS = 1, amp = new Float32Array(N), rRe = new Float32Array(N), rIm = new Float32Array(N);
  for (let look = 0; look < LOOKS; look++) {
    let re = new Float32Array(N), im = new Float32Array(N);
    let sd = (hashStr(seed + ':' + look) | 1) >>> 0;
    for (let k = 0; k < N; k++) {
      const a = E[k];
      sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5;
      re[k] = a * GAUSS[sd & 0xffff]; im[k] = a * GAUSS[sd >>> 16];
    }
    re = convRows(re, NA, NR, ky2); im = convRows(im, NA, NR, ky2);
    for (let j = 0; j < NR; j++) { const rk = rowK[j], o = j * NA; blurRow(re, rRe, tmp, o, NA, rk.radii, rk.l2); blurRow(im, rIm, tmp, o, NA, rk.radii, rk.l2); }
    for (let k = 0; k < N; k++) { const r = rRe[k] + sp2[k] * CS, q = rIm[k]; amp[k] += Math.sqrt(r * r + q * q) / LOOKS; }
  }

  // Light frequency compounding: average the envelope over neighbouring samples, which fills
  // the thin speckle nulls the way a modern scanner's compounding does.
  {
    const a2 = new Float32Array(N);
    for (let j = 1; j < NR - 1; j++) {
      const o = j * NA;
      for (let i = 1; i < NA - 1; i++) {
        const k = o + i;
        a2[k] = 0.36 * amp[k] + 0.2 * (amp[k - NA] + amp[k + NA]) + 0.12 * (amp[k - 1] + amp[k + 1]);
      }
    }
    for (let k = NA; k < N - NA; k++) amp[k] = a2[k] || amp[k];
  }
  // Attenuation walk down each scan line: bone shadows, enhancement under fluid.
  const G = new Float32Array(N);
  const kE = 0.045, kS = 0.6, relax = Math.exp(-DR / 7), HFLOOR = 0.0035;
  const eTab = new Float32Array(256);
  for (let a = 0; a < 256; a++) eTab[a] = a > 140 ? Math.exp(kE * ((a - 128) / 127) * DR) : a < 116 ? Math.exp(-kS * ((128 - a) / 128) * DR) : 0;
  const soft = new Float32Array(NA).fill(1), hard = new Float32Array(NA).fill(1);
  for (let j = 0; j < NR; j++) {
    const o = j * NA;
    for (let i = 0; i < NA; i++) {
      const k = o + i;
      G[k] = soft[i] * (HFLOOR + (1 - HFLOOR) * hard[i]);
      const f = eTab[A[k]];
      soft[i] = f ? Math.min(1.7, soft[i] * f) : 1 + (soft[i] - 1) * relax;
      const b = B[k];
      if (b < 250) hard[i] *= 1 - (1 - b / 255) * 0.2;
    }
  }
  const gR = boxRadii(1.6), G2 = new Float32Array(N);
  for (let j = 0; j < NR; j++) blurRow(G, G2, tmp, j * NA, NA, gR, 1);

  // Depth gain (residual after TGC), focal zone, edge apodisation, noise, log compression.
  const IW = 1.75, DRdB = 44, GAM = 1.85, LUTN = 8192, LS = LUTN / 8, lut = new Uint8ClampedArray(LUTN);
  for (let q = 0; q < LUTN; q++) {
    const v = 1 + (20 * Math.log10(Math.max(1e-6, (q + 0.5) / LS) / IW)) / DRdB;
    lut[q] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(Math.pow(v, GAM) * 255);
  }
  const out = new Uint8Array(N), colGain = new Float32Array(NA);
  for (let i = 0; i < NA; i++) { const t = Math.abs(-1 + (2 * (i + 0.5)) / NA); colGain[i] = 1 - 0.32 * t ** 6; }
  let sn = (hashStr(seed + ':noise') | 1) >>> 0;
  for (let j = 0; j < NR; j++) {
    const z = (j + 0.5) * DR;
    const dg = Math.exp(-0.0045 * z) * (1 + 0.14 * Math.exp(-(((z - focus) / 22) ** 2))) * (z < 2.5 ? 1.25 : 1);
    const o = j * NA;
    for (let i = 0; i < NA; i++) {
      const k = o + i;
      sn ^= sn << 13; sn ^= sn >>> 17; sn ^= sn << 5;
      const I = amp[k] * G2[k] * dg * colGain[i] + 0.012 * RAYL[sn & 0xffff];
      out[k] = lut[Math.min(LUTN - 1, (I * LS) | 0)];
    }
  }
  return out;
}

// ------------------------------------------------------------------ public API (cached)
export const TIMING = [], TP = [];
const polarCache = new Map();
const imgCache = new Map();

/** Build (once) the polar B-mode data for a scene. Returns the time taken in ms (0 if cached). */
export function buildPolar(scene) {
  if (polarCache.has(scene.id)) return 0;
  const t0 = performance.now();
  const C = paintScene(scene);
  const t1 = performance.now();
  polarCache.set(scene.id, renderPolar(C, scene.seed || scene.id));
  TIMING.push([scene.id, Math.round(t1 - t0), Math.round(performance.now() - t1)]);
  return performance.now() - t0;
}
export const isBuilt = (scene) => polarCache.has(scene.id);

/** Scan-convert to a sector image of w x h device pixels covering FRAME. Cached per scene and size. */
export function scanImage(scene, w, h) {
  const key = `${scene.id}@${w}x${h}`;
  if (imgCache.has(key)) { const c = imgCache.get(key); imgCache.delete(key); imgCache.set(key, c); return c; }
  buildPolar(scene);
  const P = polarCache.get(scene.id);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'), img = ctx.createImageData(w, h), o = img.data;
  const { R, half } = PROBE, sx = FRAME_W / w, sz = FRAME_H / h;
  for (let py = 0; py < h; py++) {
    const z = FRAME.z0 + (py + 0.5) * sz + R;
    for (let px = 0; px < w; px++) {
      const x = FRAME.x0 + (px + 0.5) * sx, q = (py * w + px) * 4;
      o[q + 3] = 255;
      const r = Math.sqrt(x * x + z * z), th = Math.atan2(x, z);
      const fj = (r - R) / DR - 0.5, fi = (th + half) / DTH - 0.5;
      if (fj < -0.5 || fj > NR - 0.5 || fi < -0.5 || fi > NA - 0.5) continue;
      const j0 = Math.max(0, Math.min(NR - 2, Math.floor(fj))), i0 = Math.max(0, Math.min(NA - 2, Math.floor(fi)));
      const tj = clamp(fj - j0), ti = clamp(fi - i0), k = j0 * NA + i0;
      const v = (P[k] * (1 - ti) + P[k + 1] * ti) * (1 - tj) + (P[k + NA] * (1 - ti) + P[k + NA + 1] * ti) * tj;
      o[q] = v; o[q + 1] = v; o[q + 2] = Math.min(255, v * 1.015 + 1);
    }
  }
  ctx.putImageData(img, 0, 0);
  imgCache.set(key, c);
  while (imgCache.size > 14) imgCache.delete(imgCache.keys().next().value);
  return c;
}
