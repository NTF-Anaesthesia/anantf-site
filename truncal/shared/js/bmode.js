// Truncal blocks: simulated B-mode ultrasound, computed procedurally from a scene (see scene.js, DATA.md).
// Adapted from brachial-plexus/js/ultrasound.js (same site, same authors): tissue maps -> complex Gaussian
// scatterers convolved with a depth-dependent point-spread function (Rayleigh speckle) -> per-column
// attenuation walk (bone shadow, enhancement under fluid, dirty shadow under gas) -> log compression.
// Everything is original and drawn here; nothing is traced from real images.
// API: buildBMode(scene) -> HTMLCanvasElement (cached per scene id). Units inside painters are mm.
import { prepare, shapePoints, shapePath, shapeBox, linePath, yAt, clamp, lerp } from './scene.js';

function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

const GAUSS = new Float32Array(65536), RAYL = new Float32Array(65536);
{
  const r = mulberry32(12345);
  for (let i = 0; i < 65536; i += 2) { const m = Math.sqrt(-2 * Math.log(r() || 1e-9)), th = 6.283185 * r(); GAUSS[i] = m * Math.cos(th); GAUSS[i + 1] = m * Math.sin(th); }
  for (let i = 0; i < 65536; i++) RAYL[i] = Math.sqrt(-2 * Math.log(r() || 1e-9));
}
const cache = new Map();
const gray = (v) => { const c = Math.round(clamp(v) * 255); return `rgb(${c},${c},${c})`; };
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

// ---------------------------------------------------------------- PSF helpers
function gaussKernel(sigma, norm) {
  const r = Math.max(1, Math.ceil(sigma * 3)); const k = new Float32Array(2 * r + 1); let s = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k[i + r] = v; s += norm === 2 ? v * v : v; }
  const d = norm === 2 ? Math.sqrt(s) : s; for (let i = 0; i < k.length; i++) k[i] /= d; return k;
}
function convV(src, W, H, k) {
  const r = (k.length - 1) / 2, out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) { const o = y * W; for (let j = -r; j <= r; j++) { const yy = Math.min(H - 1, Math.max(0, y + j)), w = k[j + r], so = yy * W; for (let x = 0; x < W; x++) out[o + x] += src[so + x] * w; } }
  return out;
}
function boxRadii(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1); let wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => Math.max(0, ((i < m ? wl : wl + 2) - 1) / 2));
}
function boxSumSq(radii) {
  let k = [1];
  for (const r of radii) { const w = 2 * r + 1, out = new Array(k.length + w - 1).fill(0); for (let i = 0; i < k.length; i++) for (let j = 0; j < w; j++) out[i + j] += k[i] / w; k = out; }
  return k.reduce((a, v) => a + v * v, 0);
}
function boxRow(src, dst, o, W, r) {
  if (r <= 0) { for (let x = 0; x < W; x++) dst[o + x] = src[o + x]; return; }
  const inv = 1 / (2 * r + 1), last = o + W - 1; let acc = src[o] * (r + 1);
  for (let j = 1; j <= r; j++) acc += src[Math.min(o + j, last)];
  for (let x = 0; x < W; x++) { dst[o + x] = acc * inv; acc += src[Math.min(o + x + r + 1, last)] - src[Math.max(o + x - r, o)]; }
}
function blurRow(src, dst, tmp, o, W, radii, gain) {
  boxRow(src, tmp, o, W, radii[0]); boxRow(tmp, dst, o, W, radii[1]); boxRow(dst, tmp, o, W, radii[2]);
  for (let x = 0; x < W; x++) dst[o + x] = tmp[o + x] * gain;
}

// ---------------------------------------------------------------- painters (mm units)
/** A specular reflector along a polyline: brightest where the surface faces the probe. */
function specStroke(C, pts, amp, wMm, { floor = 0.25, wav = 0, eAmp = 0.45, vary = 0, gaps = 0 } = {}) {
  const rnd = C.rnd;
  if (wav > 0) {
    const lam = 2.5 + rnd() * 3, ph = rnd() * 6.28, lam2 = 0.9 + rnd(); let cum = 0;
    pts = pts.map((p, i) => {
      const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)];
      const dx = q[0] - r[0], dy = q[1] - r[1], len = Math.hypot(dx, dy) || 1;
      if (i) cum += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const off = wav * (Math.sin((cum / lam) * 6.28 + ph) * 0.7 + Math.sin((cum / lam2) * 6.28) * 0.3);
      return [p[0] - (dy / len) * off, p[1] + (dx / len) * off];
    });
  }
  const lamA = 3 + rnd() * 4, phA = rnd() * 6.28, lamB = 1.2 + rnd(), phB = rnd() * 6.28, lamV = 4 + rnd() * 4, phV = rnd() * 6.28;
  let total = 0; for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const gapAt = Array.from({ length: gaps }, (_, g) => [total * ((g + 0.5 + (rnd() - 0.5) * 0.6) / gaps), 0.6 + rnd() * 0.9]);
  let cum = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    cum += len;
    if (gapAt.some(([c, w]) => Math.abs(cum - c) < w / 2)) continue;
    const hz = Math.abs(dx) / len;
    const mod = clamp(0.7 + 0.3 * Math.sin((cum / lamA) * 6.28 + phA) + 0.15 * Math.sin((cum / lamB) * 6.28 + phB), 0.25, 1);
    const vm = vary ? 1 + vary * Math.sin((cum / lamV) * 6.28 + phV) : 1;
    const f = (floor + (1 - floor) * hz * hz) * mod * vm;
    const jit = 0.8 + rnd() * 0.4;
    C.sp.strokeStyle = gray(amp * f * jit); C.sp.lineWidth = wMm;
    C.sp.beginPath(); C.sp.moveTo(a[0], a[1]); C.sp.lineTo(b[0], b[1]); C.sp.stroke();
    if (eAmp) { C.e.strokeStyle = gray(eAmp * (0.5 + 0.5 * f)); C.e.lineWidth = wMm; C.e.beginPath(); C.e.moveTo(a[0], a[1]); C.e.lineTo(b[0], b[1]); C.e.stroke(); }
  }
}

function speckleFill(C, path, box, nPerMm2, rMm, g0, g1, ctx = C.e) {
  const rnd = C.rnd, [x0, y0, x1, y1] = box;
  const n = Math.min(60000, (x1 - x0) * (y1 - y0) * nPerMm2);
  ctx.save(); ctx.clip(path);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = gray(lerp(g0, g1, rnd()));
    ctx.beginPath();
    ctx.ellipse(lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), lerp(rMm[0], rMm[1], rnd()), lerp(rMm[0], rMm[1], rnd()) * 0.6, (rnd() - 0.5) * 0.6, 0, 7);
    ctx.fill();
  }
  ctx.restore();
}

function strands(C, path, box, nPerMm2, angDeg, angJit, lenMm, g0, g1, spAmp, widthMm = [0.08, 0.16]) {
  const rnd = C.rnd, [x0, y0, x1, y1] = box;
  const n = Math.min(30000, (x1 - x0) * (y1 - y0) * nPerMm2);
  C.e.save(); C.e.clip(path); C.sp.save(); C.sp.clip(path);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd());
    const len = lerp(lenMm[0], lenMm[1], rnd() ** 1.5);
    const a = ((angDeg + (rnd() - 0.5) * 2 * angJit) * Math.PI) / 180, bend = (rnd() - 0.5) * 0.25 * len;
    const dx = Math.cos(a) * len, dy = Math.sin(a) * len, w = lerp(widthMm[0], widthMm[1], rnd());
    C.e.strokeStyle = gray(lerp(g0, g1, rnd())); C.e.lineWidth = w;
    C.e.beginPath(); C.e.moveTo(x - dx / 2, y - dy / 2); C.e.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + dx / 2, y + dy / 2); C.e.stroke();
    if (spAmp && rnd() < 0.35) {
      C.sp.strokeStyle = gray(spAmp * (0.5 + rnd() * 0.5)); C.sp.lineWidth = w * 0.8;
      C.sp.beginPath(); C.sp.moveTo(x - dx / 2, y - dy / 2); C.sp.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + dx / 2, y + dy / 2); C.sp.stroke();
    }
  }
  C.e.restore(); C.sp.restore();
}

function polyPath(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function boxOf(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }

/** Fill a region (layer polygon or shape) with the echo texture of its tissue kind. */
function paintRegion(C, kind, path, box, o = {}) {
  const rnd = C.rnd;
  switch (kind) {
    case 'fat': { // subcutaneous fat: dark lobules, thin bright septa
      C.e.fillStyle = gray(o.echo ?? 0.13); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 0.6, [0.3, 1.0], 0.05, 0.14);
      const n = Math.round((box[2] - box[0]) * 0.45);
      C.e.save(); C.e.clip(path); C.sp.save(); C.sp.clip(path);
      for (let i = 0; i < n; i++) {
        const x = lerp(box[0], box[2], rnd()), y = lerp(box[1], box[3], 0.1 + rnd() * 0.8), len = 2 + rnd() * 7, a = (rnd() - 0.5) * 0.5;
        specStroke(C, [[x, y], [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 0.3], [x + Math.cos(a) * len, y + Math.sin(a) * len]], 0.45, 0.1, { floor: 0.4, wav: 0.08, eAmp: 0.35 });
      }
      C.e.restore(); C.sp.restore();
      break;
    }
    case 'fat-deep': case 'connective': { // extraperitoneal / perirenal fat, intermuscular tissue: mid-grey, mottled
      C.e.fillStyle = gray(o.echo ?? 0.32); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 0.9, [0.3, 1.1], 0.2, 0.55);
      strands(C, path, box, 0.18, 0, 35, [0.6, 2.5], 0.4, 0.6, 0.3, [0.1, 0.18]);
      break;
    }
    case 'muscle': { // hypoechoic with bright perimysial striations along the fibre direction
      const base = o.echo ?? 0.14;
      C.e.fillStyle = gray(base); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 0.1, [1.2, 3.5], base * 0.7, base * 1.35);
      strands(C, path, box, o.dens ?? 0.4, o.stri ?? 0, o.striJit ?? 10, o.len || [0.6, 3], 0.3, 0.62, o.sAmp ?? 0.22, [0.08, 0.16]);
      speckleFill(C, path, box, (o.dens ?? 0.5) * 0.3, [0.05, 0.12], 0.3, 0.5);
      break;
    }
    case 'aponeurosis': case 'tendon': case 'ligament': { // bright, fibrillar
      C.e.fillStyle = gray(o.echo ?? 0.62); C.e.fill(path); C.sp.fillStyle = gray(0.25); C.sp.fill(path);
      strands(C, path, box, 2.2, o.stri ?? 0, 6, [0.8, 3], 0.6, 0.95, 0.7, [0.08, 0.16]);
      C.at.fillStyle = gray(112 / 255); C.at.fill(path);
      break;
    }
    case 'bowel': { // mixed, mottled contents; small bright gas pockets with short dirty shadows
      C.e.fillStyle = gray(o.echo ?? 0.24); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 0.6, [0.4, 1.8], 0.12, 0.5);
      C.e.save(); C.e.clip(path); C.sp.save(); C.sp.clip(path); C.at.save(); C.at.clip(path);
      const n = Math.max(2, Math.round((box[2] - box[0]) / 7));
      for (let i = 0; i < n; i++) {
        const cx = lerp(box[0], box[2], (i + 0.15 + rnd() * 0.7) / n), cy = box[1] + 2.5 + rnd() * Math.min(10, (box[3] - box[1]) * 0.5);
        const rx = 1.8 + rnd() * 2.2, ry = 1 + rnd() * 1;
        C.e.lineWidth = 0.8; C.e.strokeStyle = gray(0.07); C.e.beginPath(); C.e.ellipse(cx, cy, rx + 0.6, ry + 0.6, (rnd() - 0.5) * 0.5, 0, 7); C.e.stroke();
        const arc = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * (1.2 + 0.6 * k / 10); arc.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
        specStroke(C, arc, 0.9, 0.3, { floor: 0.6, eAmp: 0.7 });
        const grd = C.at.createLinearGradient(0, cy, 0, cy + 7);
        grd.addColorStop(0, gray(0.3)); grd.addColorStop(1, gray(0.5));
        C.at.fillStyle = grd; C.at.fillRect(cx - rx * 0.6, cy, rx * 1.2, 7);
      }
      C.e.restore(); C.sp.restore(); C.at.restore();
      break;
    }
    case 'liver': case 'organ': { // fine, homogeneous parenchyma
      C.e.fillStyle = gray(o.echo ?? 0.3); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 2.4, [0.08, 0.3], 0.22, 0.48);
      break;
    }
    case 'kidney': {
      C.e.fillStyle = gray(0.18); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 1.6, [0.1, 0.3], 0.1, 0.3);
      break;
    }
    case 'fluid': case 'vessel': {
      C.e.fillStyle = gray(0.02); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      C.at.fillStyle = gray(0.85); C.at.fill(path); // posterior enhancement
      break;
    }
    case 'lung': {
      C.e.fillStyle = gray(0.2); C.e.fill(path); C.sp.fillStyle = '#000'; C.sp.fill(path);
      speckleFill(C, path, box, 0.5, [0.5, 1.6], 0.1, 0.36);
      strands(C, path, box, 1.2, 0, 4, [1, 4], 0.22, 0.45, 0, [0.15, 0.35]);
      break;
    }
    default: break;
  }
}

function paintLine(C, ln, H) {
  const pts = ln.pts;
  const w = ln.w ?? (ln.kind === 'pleura' ? 0.55 : ln.kind === 'peritoneum' ? 0.45 : ln.kind === 'ligament' ? 0.7 : 0.35);
  if (ln.kind === 'pleura' || ln.lung) {
    // Lung: artefact only. Mottled grey, A-line reverberations, a few comet tails.
    const lp = polyPath([...pts, [pts[pts.length - 1][0], H + 2], [pts[0][0], H + 2]]);
    const box = [pts[0][0], Math.min(...pts.map((p) => p[1])), pts[pts.length - 1][0], H];
    C.e.save(); C.e.clip(lp); C.e.fillStyle = gray(0.2); C.e.fillRect(box[0], box[1], box[2] - box[0], H); C.e.restore();
    C.sp.save(); C.sp.clip(lp); C.sp.fillStyle = '#000'; C.sp.fillRect(box[0], box[1], box[2] - box[0], H); C.sp.restore();
    C.hb.save(); C.hb.clip(lp); C.hb.fillStyle = '#fff'; C.hb.fillRect(box[0], box[1], box[2] - box[0], H); C.hb.restore();
    speckleFill(C, lp, box, 0.5, [0.5, 1.6], 0.1, 0.36);
    strands(C, lp, box, 1.2, 0, 4, [1, 4], 0.22, 0.45, 0, [0.15, 0.35]);
    const dpl = pts.reduce((a, q) => a + q[1], 0) / pts.length;
    C.sp.save(); C.sp.clip(lp); C.e.save(); C.e.clip(lp);
    for (let k = 1; k <= 2; k++) specStroke(C, pts.map((q) => [q[0], q[1] + dpl * k]), 0.42 / k, 0.4, { floor: 0.7, eAmp: 0.15 });
    C.e.restore(); C.sp.restore();
    specStroke(C, pts, 1, w, { floor: 0.7, wav: 0.03, eAmp: 0.75 });
    return;
  }
  if (ln.kind === 'bone') {
    C.e.strokeStyle = gray(0.9); C.e.lineWidth = w; C.e.stroke(linePath(pts));
    specStroke(C, pts, 1, w * 0.8, { floor: 0.5, eAmp: 0 });
    C.hb.save(); C.hb.translate(0, w * 0.5); C.hb.strokeStyle = '#000'; C.hb.lineWidth = w; C.hb.stroke(linePath(pts)); C.hb.restore();
    return;
  }
  const amp = ln.amp ?? (ln.kind === 'peritoneum' ? 0.95 : ln.kind === 'ligament' ? 0.85 : 0.8);
  if (ln.kind === 'ligament') { C.e.strokeStyle = gray(0.6); C.e.lineWidth = w; C.e.stroke(linePath(pts)); }
  specStroke(C, pts, amp, w, { floor: ln.floor ?? 0.35, wav: ln.wav ?? 0.05, eAmp: 0.5, vary: ln.vary || 0, gaps: ln.gaps || 0 });
}

function paintShape(C, st) {
  for (const sh of st.shapes) {
    const p = shapePath(sh), box = shapeBox(sh), pts = shapePoints(sh, 72);
    switch (st.kind) {
      case 'bone': {
        if (sh.t === 'l') { paintLine(C, { kind: 'bone', pts, w: sh.w }, C.H); break; }
        // Solid bone: bright cortex facing the probe, black acoustic shadow underneath.
        C.e.fillStyle = gray(0.1); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
        C.hb.save(); C.hb.fillStyle = '#000'; C.hb.fill(p); C.hb.restore();
        // Upper surface only (points whose outward normal faces up).
        const top = []; const [cx, cy] = [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
        for (const q of pts) if (q[1] <= cy + (box[3] - box[1]) * 0.15) top.push(q);
        top.sort((a, b) => a[0] - b[0]);
        void cx;
        if (top.length > 1) {
          C.e.strokeStyle = gray(0.85); C.e.lineWidth = st.cortex ?? 0.9; C.e.stroke(linePath(top));
          specStroke(C, top, 1, (st.cortex ?? 0.9) * 0.8, { floor: 0.55, eAmp: 0 });
        }
        break;
      }
      case 'artery': case 'vein': {
        const art = st.kind === 'artery';
        C.e.fillStyle = gray(0.02); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
        C.at.fillStyle = gray(art ? 1 : 0.9); C.at.fill(p);
        specStroke(C, pts, art ? 0.9 : 0.5, art ? 0.25 : 0.14, { floor: art ? 0.25 : 0.1, eAmp: art ? 0.5 : 0.25 });
        break;
      }
      case 'nerve': {
        C.sp.fillStyle = '#000'; C.sp.fill(p);
        C.e.fillStyle = gray(0.12); C.e.fill(p);
        speckleFill(C, p, box, 4, [0.05, 0.12], 0.08, 0.3);
        specStroke(C, pts, 0.7, 0.14, { floor: 0.5, eAmp: 0.5 });
        break;
      }
      case 'kidney': {
        paintRegion(C, 'kidney', p, box);
        specStroke(C, pts, 0.9, 0.3, { floor: 0.5, eAmp: 0.6 });
        break;
      }
      case 'fascia': case 'ligament': case 'membrane': {
        if (sh.t === 'l') {
          if (st.kind === 'ligament') { C.e.strokeStyle = gray(0.6); C.e.lineWidth = sh.w; C.e.stroke(linePath(pts)); }
          specStroke(C, pts, st.amp ?? 0.85, sh.w, { floor: 0.45, wav: 0.04, eAmp: 0.5 });
        } else paintRegion(C, 'aponeurosis', p, box, st);
        break;
      }
      default: {
        paintRegion(C, st.kind, p, box, st);
        if (st.kind === 'muscle' || st.outline) specStroke(C, pts, st.edge ?? 0.62, 0.28, { floor: 0.22, wav: 0.06, eAmp: 0.5 });
      }
    }
  }
}

// ---------------------------------------------------------------- compose
function renderBMode(C, W, H, scene, PX) {
  const N = W * H;
  const eD = C.e.getImageData(0, 0, W, H).data, sD = C.sp.getImageData(0, 0, W, H).data;
  const aD = C.at.getImageData(0, 0, W, H).data, bD = C.hb.getImageData(0, 0, W, H).data;
  const psf = scene.psf || 1, focus = scene.focus ?? scene.depth * 0.4;
  const sy = 0.08 * PX * psf;
  const ky2 = gaussKernel(Math.max(0.5, sy), 2), ky1 = gaussKernel(Math.max(0.5, sy * 1.2), 1);
  const kc = new Map(); const rowKernels = [];
  for (let y = 0; y < H; y++) {
    const z = y / PX;
    const sx = Math.max(0.5, 0.16 * PX * psf * (1 + 1.1 * Math.abs(z - focus) / scene.depth + 0.25 * z / scene.depth));
    const key = Math.round(sx * 4);
    if (!kc.has(key)) { const radii = boxRadii(key / 4); kc.set(key, { radii, l2: 1 / Math.sqrt(boxSumSq(radii)) }); }
    rowKernels.push(kc.get(key));
  }
  const tmpRow = new Float32Array(N);
  let sp = new Float32Array(N); for (let i = 0; i < N; i++) sp[i] = sD[i * 4] / 255;
  sp = convV(sp, W, H, ky1);
  const sp2 = new Float32Array(N);
  for (let y = 0; y < H; y++) blurRow(sp, sp2, tmpRow, y * W, W, rowKernels[y].radii, 1);
  const CS = 2.4, LOOKS = 2, ampOut = new Float32Array(N), rIm = new Float32Array(N), rRe = new Float32Array(N);
  for (let look = 0; look < LOOKS; look++) {
    let re = new Float32Array(N), im = new Float32Array(N);
    let sd = (hashStr(scene.id + look) | 1) >>> 0;
    for (let i = 0; i < N; i++) { const a = eD[i * 4] * (1 / 255); sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; re[i] = a * GAUSS[sd & 0xffff]; im[i] = a * GAUSS[sd >>> 16]; }
    re = convV(re, W, H, ky2); im = convV(im, W, H, ky2);
    for (let y = 0; y < H; y++) { const rk = rowKernels[y], o = y * W; blurRow(re, rRe, tmpRow, o, W, rk.radii, rk.l2); blurRow(im, rIm, tmpRow, o, W, rk.radii, rk.l2); }
    for (let i = 0; i < N; i++) { const r = rRe[i] + sp2[i] * CS, q = rIm[i]; ampOut[i] += Math.sqrt(r * r + q * q) / LOOKS; }
  }
  // Attenuation walk down each column.
  const G = new Float32Array(N);
  const dz = 1 / PX, kE = scene.enh ?? 0.1, kS = 0.55, relax = Math.exp(-dz / 6), HFLOOR = 0.12;
  const soft = new Float32Array(W).fill(1), hard = new Float32Array(W).fill(1);
  const eTab = new Float32Array(256);
  for (let a = 0; a < 256; a++) eTab[a] = a > 140 ? Math.exp(kE * ((a - 128) / 127) * dz) : a < 116 ? Math.exp(-kS * ((128 - a) / 128) * dz * 4) : 0;
  const hardK = Math.min(0.5, 3.2 / PX);
  for (let y = 0; y < H; y++) {
    const o = y * W;
    for (let x = 0; x < W; x++) {
      const i = o + x;
      G[i] = soft[x] * (HFLOOR + (1 - HFLOOR) * hard[x]);
      const f = eTab[aD[i * 4]];
      soft[x] = f ? soft[x] * f : 1 + (soft[x] - 1) * relax;
      const b = bD[i * 4];
      if (b < 250) hard[x] *= 1 - (1 - b / 255) * hardK;
    }
  }
  const gr = boxRadii(0.5 * PX), G2 = new Float32Array(N);
  for (let y = 0; y < H; y++) blurRow(G, G2, tmpRow, y * W, W, gr, 1);
  const out = new ImageData(W, H), o = out.data;
  const IW = 2.5, DR = scene.dr ?? 40, GAM = 2.2, LUTN = 6144, LSs = LUTN / 6, lut = new Uint8ClampedArray(LUTN);
  for (let j = 0; j < LUTN; j++) { const v = 1 + (20 * Math.log10(Math.max(1e-6, (j + 0.5) / LSs) / IW)) / DR; lut[j] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(Math.pow(v, GAM) * 255); }
  const zf = focus, fw = 0.25 * scene.depth, att = scene.att ?? (0.36 / scene.depth);
  let sn = (hashStr(scene.id + 'noise') | 1) >>> 0;
  for (let y = 0; y < H; y++) {
    const z = y / PX;
    const dg = (scene.gain ?? 1) * Math.exp(-att * z) * (1 + 0.12 * Math.exp(-(((z - zf) / fw) ** 2)));
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      sn ^= sn << 13; sn ^= sn >>> 17; sn ^= sn << 5;
      const I = ampOut[i] * G2[i] * dg + 0.016 * RAYL[sn & 0xffff];
      const c = lut[Math.min(LUTN - 1, (I * LSs) | 0)];
      o[i * 4] = c; o[i * 4 + 1] = c; o[i * 4 + 2] = Math.min(255, c * 1.02 + 1); o[i * 4 + 3] = 255;
    }
  }
  return out;
}

/** Build (once) the simulated B-mode image for a scene. Returns a canvas W x H px. */
export function buildBMode(scene) {
  if (cache.has(scene.id)) return cache.get(scene.id);
  const g = prepare(scene);
  const PX = scene.pxmm || Math.max(6, Math.min(16, 720 / scene.width));
  const W = Math.round(scene.width * PX), H = Math.round(scene.depth * PX);
  const mk = (fill) => { const c = makeCanvas(W, H), x = c.getContext('2d', { willReadFrequently: true }); x.fillStyle = fill; x.fillRect(0, 0, W, H); x.setTransform(PX, 0, 0, PX, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round'; return x; };
  const C = { e: mk('#000'), sp: mk('#000'), at: mk('rgb(128,128,128)'), hb: mk('#fff'), rnd: mulberry32(hashStr(scene.id)), H: scene.depth };
  // Background: deep connective tissue.
  const all = polyPath([[0, 0], [g.W, 0], [g.W, g.H], [0, g.H]]);
  paintRegion(C, 'connective', all, [0, 0, g.W, g.H], { echo: 0.26 });
  // Layers, superficial to deep, then their deep borders (fascia).
  for (const ly of g.layers) {
    if (ly.kind === 'none') continue;
    const path = polyPath(ly.poly); paintRegion(C, ly.kind, path, boxOf(ly.poly), ly);
  }
  // Shapes drawn under lines except bones/vessels/nerves (drawn after).
  const late = new Set(['bone', 'artery', 'vein', 'nerve']);
  for (const st of g.shapes) if (!late.has(st.kind)) paintShape(C, st);
  for (const ly of g.layers) {
    if (!ly.edge) continue;
    // Draw the border only where this layer (or the one below) has real thickness.
    let run = [];
    const next = g.layers[g.layers.indexOf(ly) + 1];
    ly.bot.forEach((p, i) => {
      const th = ly.bot[i][1] - ly.top[i][1], thN = next ? next.bot[i][1] - next.top[i][1] : 1;
      if (th > 0.25 || thN > 0.25) run.push(p); else { if (run.length > 1) specStroke(C, run, ly.edge, ly.edgeW ?? 0.4, { floor: 0.35, wav: 0.05, eAmp: 0.55, vary: 0.2 }); run = []; }
    });
    if (run.length > 1) specStroke(C, run, ly.edge, ly.edgeW ?? 0.4, { floor: 0.35, wav: 0.05, eAmp: 0.55, vary: 0.2 });
  }
  for (const ln of g.lines) paintLine(C, ln, g.H);
  for (const st of g.shapes) if (late.has(st.kind)) paintShape(C, st);
  // Skin: bright entry echo, thin dark dermis band.
  C.e.fillStyle = gray(0.5); C.e.fillRect(0, 0, g.W, g.skin);
  C.e.fillStyle = gray(0.2); C.e.fillRect(0, g.skin * 0.45, g.W, g.skin * 0.2);
  C.sp.fillStyle = '#000'; C.sp.fillRect(0, 0, g.W, g.skin);
  specStroke(C, [[0, 0.08], [g.W, 0.08]], 0.9, 0.14, { floor: 1, eAmp: 0.6 });
  specStroke(C, [[0, g.skin], [g.W * 0.5, g.skin + 0.05], [g.W, g.skin]], 0.6, 0.15, { floor: 1, wav: 0.03, eAmp: 0.5 });
  const img = renderBMode(C, W, H, scene, PX);
  const base = makeCanvas(W, H);
  base.getContext('2d').putImageData(img, 0, 0);
  cache.set(scene.id, base);
  return base;
}

export { yAt };
