// spinal/js/ultrasound/diagram.js — idealised labelled diagram of a scan, drawn from the same
// geometry as the simulated B-mode. "Printed plate" look shared with the anatomy section
// (same plate colours in both themes). Owner: B4.

import * as K from '../anatomy/kit.js';
import { FRAME, FRAME_W, FRAME_H, PROBE, fanOutline, pathOf } from './bmode.js';

const MUSCLE = '#d9a48f', MUSCLE2 = '#cf9784', DISC = '#e3d3bd', VB = '#efe6d2', AC = '#7d6a94';
const ORDER = ['muscle', 'muscle2', 'fat', 'isl', 'epi', 'vb', 'disc', 'csf', 'roots', 'rootdot', 'septum', 'fascia', 'flavum', 'dura', 'adura', 'acline', 'bone', 'skin'];

const cache = new Map();

/** Diagram base image (no labels) for a scene at w x h device px. Cached. */
export function diagramImage(scene, w, h) {
  const key = `${scene.id}@${w}x${h}`;
  if (cache.has(key)) return cache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const s = w / FRAME_W; // px per mm
  K.paper(ctx, w, h, 11);
  ctx.save();
  ctx.translate(-FRAME.x0 * s, -FRAME.z0 * s);
  const P = (pts) => pts.map(([x, z]) => [x * s, z * s]);

  const parts = [];
  for (const st of scene.structs) for (const sh of st.shapes || []) if (sh.draw && sh.draw !== 'none') parts.push(sh);
  parts.sort((a, b) => ORDER.indexOf(a.draw) - ORDER.indexOf(b.draw));
  const fan = new Path2D(); P(fanOutline()).forEach(([x, y], i) => (i ? fan.lineTo(x, y) : fan.moveTo(x, y))); fan.closePath();

  // Anatomy beyond the imaged sector is drawn faintly, inside it at full strength.
  for (const pass of [0, 1]) {
    ctx.save();
    if (pass === 0) ctx.globalAlpha = 0.22; else ctx.clip(fan);
    for (const sh of parts) drawPart(ctx, sh, P, s, pass);
    ctx.restore();
  }
  // Sector outline and the probe footprint.
  ctx.save();
  ctx.strokeStyle = 'rgba(43,30,24,.7)'; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.stroke(fan); ctx.setLineDash([]);
  const { R, half } = PROBE, n = 30, foot = [];
  for (let i = 0; i <= n; i++) { const t = -half * 0.86 + (1.72 * half * i) / n; foot.push([R * Math.sin(t) * s, (R * Math.cos(t) - R) * s]); }
  for (let i = n; i >= 0; i--) { const t = -half * 0.86 + (1.72 * half * i) / n; foot.push([(R - 7) * Math.sin(t) * s, ((R - 7) * Math.cos(t) - R) * s]); }
  ctx.beginPath(); foot.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
  ctx.fillStyle = '#3a3532'; ctx.fill(); ctx.strokeStyle = K.C.ink; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
  ctx.restore();
  cache.set(key, c);
  while (cache.size > 12) cache.delete(cache.keys().next().value);
  return c;
}

function line(ctx, pts, colour, width) {
  ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function fillPoly(ctx, pts, fill, stroke = 'rgba(43,30,24,.55)', lw = 1) {
  K.polyPath(ctx, pts); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}

function drawPart(ctx, sh, P, s, pass) {
  const pts = P(sh.pts || []);
  const k = Math.max(0.6, s / 4); // line scale relative to about 4 px/mm
  switch (sh.draw) {
    case 'skin': fillPoly(ctx, pts, K.C.skin, 'rgba(43,30,24,.5)', 0.8); break;
    case 'fat':
      fillPoly(ctx, pts, K.C.fat, null);
      if (pass) K.fatLobules(ctx, pts, 5, 0.55 * k);
      break;
    case 'fascia': line(ctx, pts, 'rgba(120,80,55,.85)', 1.1 * k); break;
    case 'septum': line(ctx, pts, 'rgba(255,240,228,.75)', 0.9 * k); break;
    case 'muscle':
    case 'muscle2':
      fillPoly(ctx, pts, sh.draw === 'muscle' ? MUSCLE : MUSCLE2, 'rgba(43,30,24,.35)', 0.8);
      if (pass) {
        const cross = sh.opts?.cross;
        if (cross) stipple(ctx, pts, 0.22 / (k * k), k);
        else K.fibres(ctx, pts, 0, Math.round(Math.abs(area(pts)) / (260 * k)), 7, 0.9, 0.7 * k);
      }
      break;
    case 'isl': fillPoly(ctx, pts, K.C.inter, 'rgba(43,30,24,.5)', 0.8); break;
    case 'epi': fillPoly(ctx, pts, K.C.epifat, null); break;
    case 'disc': fillPoly(ctx, pts, DISC, 'rgba(43,30,24,.45)', 0.8); break;
    case 'vb': fillPoly(ctx, pts, VB, 'rgba(43,30,24,.6)', 1); break;
    case 'csf': fillPoly(ctx, pts, K.C.csf, null); break;
    case 'roots': line(ctx, pts, K.C.rootLine, 1.1 * k); break;
    case 'rootdot': {
      const [x, y] = P([sh.dot])[0];
      ctx.beginPath(); ctx.arc(x, y, 0.75 * s, 0, 7); ctx.fillStyle = K.C.root; ctx.fill(); ctx.strokeStyle = K.C.rootLine; ctx.lineWidth = 0.8; ctx.stroke();
      break;
    }
    case 'flavum':
      line(ctx, pts, 'rgba(43,30,24,.7)', (sh.w || 1.3) * s + 1.6);
      line(ctx, pts, K.C.flavum, (sh.w || 1.3) * s);
      break;
    case 'dura': line(ctx, pts, '#7d6a94', Math.max(1.6, 0.55 * s)); break;
    case 'adura': line(ctx, pts, '#9b8bb0', Math.max(1.2, 0.4 * s)); break;
    case 'acline': line(ctx, pts, AC, Math.max(2, 0.8 * s)); break;
    case 'bone':
      fillPoly(ctx, pts, K.C.bone, null);
      K.polyPath(ctx, pts); ctx.strokeStyle = K.C.cortex; ctx.lineWidth = Math.max(1.5, 0.7 * s); ctx.stroke();
      ctx.strokeStyle = 'rgba(43,30,24,.75)'; ctx.lineWidth = 1; ctx.stroke();
      break;
    default: break;
  }
}

function area(P) { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }

function stipple(ctx, P, dens, k) {
  const r = K.rng(17); let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
  P.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
  const n = Math.min(1600, ((x1 - x0) * (y1 - y0) * dens) / 100);
  ctx.save(); K.polyPath(ctx, P); ctx.clip();
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = r() < 0.6 ? 'rgba(92,50,30,.22)' : 'rgba(255,244,232,.45)';
    ctx.beginPath(); ctx.arc(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), (0.6 + r() * 1.1) * k, 0, 7); ctx.fill();
  }
  ctx.restore();
}

export { FRAME_H, pathOf };
