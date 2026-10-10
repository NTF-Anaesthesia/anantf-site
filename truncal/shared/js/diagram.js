// Truncal blocks: the idealised, labelled diagram of a scene (same geometry as the simulated ultrasound).
// Clinical colour codes: nerves yellow, arteries red, veins blue; bone near-white with a dark cortex outline (clearly
// apart from the beige connective tissue); cartilage pale grey-green; pleura blue-grey; LA (drawn by scan.js) blue.
// API: buildDiagram(scene, pxPerMm) -> canvas (cached per scene and size).
import { prepare, shapePath, shapePoints, linePath } from './scene.js';

export const COL = {
  plate: '#f4ece1', skin: '#e7c0a3', skinEdge: '#b98d6e',
  fat: '#f3e2bf', fatLine: '#d8bf8f', fatDeep: '#f1dca6',
  muscle: '#d49a88', muscleLine: '#a8695a', muscleStri: 'rgba(120,55,42,.28)',
  apo: '#efe5cf', apoLine: '#9d8c6a',
  connective: '#eadcc6',
  bone: '#fdfbf6', boneEdge: '#3f3220', boneDot: 'rgba(63,50,32,.22)', shadow: 'rgba(60,45,30,.10)',
  cartilage: '#dfe8e2', cartilageEdge: '#5f7a6c',
  pleura: '#5b6f99', lung: '#e3dce6', lungDot: 'rgba(91,111,153,.22)',
  peritoneum: '#6f6a3a', bowel: '#e9c9b6', bowelLine: '#b48a74',
  liver: '#a95c4d', kidney: '#b46a5b',
  ligament: '#7c6845', fascia: '#8b7a58',
  nerve: '#f2c230', nerveEdge: '#8a6a00', artery: '#c0392b', arteryEdge: '#7d1d14', vein: '#2f63b0', veinEdge: '#163f7a',
  fluid: '#cfe6f2', ink: '#2b1e18',
};

const cache = new Map();
function rng(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function polyPath(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function boxOf(pts) { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); } return [a, b, c, d]; }

function fillKind(ctx, kind, path, box, o, r, px) {
  const lw = 1 / px; // one CSS px in mm
  ctx.save(); ctx.clip(path);
  switch (kind) {
    case 'fat': {
      ctx.fillStyle = o.color || COL.fat; ctx.fill(path);
      ctx.strokeStyle = COL.fatLine; ctx.lineWidth = lw;
      const n = Math.round((box[2] - box[0]) * (box[3] - box[1]) / 9);
      for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.ellipse(box[0] + r() * (box[2] - box[0]), box[1] + r() * (box[3] - box[1]), 1.2 + r() * 1.6, 0.8 + r(), (r() - 0.5) * 0.6, 0, 7); ctx.stroke(); }
      break;
    }
    case 'fat-deep': case 'connective': ctx.fillStyle = o.color || (kind === 'fat-deep' ? COL.fatDeep : COL.connective); ctx.fill(path); break;
    case 'muscle': {
      ctx.fillStyle = o.color || COL.muscle; ctx.fill(path);
      ctx.strokeStyle = COL.muscleStri; ctx.lineWidth = lw;
      const a = ((o.stri ?? 0) * Math.PI) / 180, n = Math.round((box[2] - box[0]) * (box[3] - box[1]) / 2.2);
      for (let i = 0; i < n; i++) {
        const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), l = 1.5 + r() * 3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
      }
      break;
    }
    case 'aponeurosis': case 'tendon': case 'ligament': {
      ctx.fillStyle = o.color || COL.apo; ctx.fill(path);
      ctx.strokeStyle = 'rgba(157,140,106,.45)'; ctx.lineWidth = lw;
      for (let y = box[1]; y < box[3]; y += 0.6) { ctx.beginPath(); ctx.moveTo(box[0], y); ctx.lineTo(box[2], y + (o.stri ? Math.tan(o.stri * Math.PI / 180) * (box[2] - box[0]) : 0)); ctx.stroke(); }
      break;
    }
    case 'bowel': {
      ctx.fillStyle = COL.bowel; ctx.fill(path);
      ctx.strokeStyle = COL.bowelLine; ctx.lineWidth = 1.4 * lw;
      const n = Math.max(2, Math.round((box[2] - box[0]) / 9));
      for (let i = 0; i < n; i++) { const cx = box[0] + (box[2] - box[0]) * (i + 0.5) / n, cy = box[1] + 4 + r() * 3; ctx.beginPath(); ctx.ellipse(cx, cy, 3.6 + r() * 2, 2.2 + r(), 0, 0, 7); ctx.stroke(); }
      break;
    }
    case 'liver': case 'organ': ctx.fillStyle = o.color || COL.liver; ctx.fill(path); break;
    case 'kidney': ctx.fillStyle = COL.kidney; ctx.fill(path); break;
    case 'fluid': ctx.fillStyle = COL.fluid; ctx.fill(path); break;
    case 'cartilage': ctx.fillStyle = COL.cartilage; ctx.fill(path); break;
    case 'lung': {
      ctx.fillStyle = COL.lung; ctx.fill(path); ctx.fillStyle = COL.lungDot;
      const n = Math.round((box[2] - box[0]) * (box[3] - box[1]) / 3);
      for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(box[0] + r() * (box[2] - box[0]), box[1] + r() * (box[3] - box[1]), 0.5 + r() * 0.5, 0, 7); ctx.fill(); }
      break;
    }
    default: break;
  }
  ctx.restore();
}

/** Render the idealised diagram at `px` CSS px per mm times the device ratio `dpr`. */
export function buildDiagram(scene, px, dpr = 1) {
  const key = `${scene.id}|${px.toFixed(3)}|${dpr}`;
  if (cache.has(key)) return cache.get(key);
  const g = prepare(scene);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(g.W * px * dpr)); c.height = Math.max(1, Math.round(g.H * px * dpr));
  const ctx = c.getContext('2d');
  ctx.setTransform(px * dpr, 0, 0, px * dpr, 0, 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const r = rng(7 + scene.id.length * 31);
  const lw = 1 / px;
  ctx.fillStyle = COL.connective; ctx.fillRect(0, 0, g.W, g.H);
  for (const ly of g.layers) {
    if (ly.kind === 'none' || ly.kind === 'label') continue;
    fillKind(ctx, ly.kind, polyPath(ly.poly), boxOf(ly.poly), ly, r, px);
  }
  const late = new Set(['bone', 'cartilage', 'artery', 'vein', 'nerve']);
  const drawShape = (st) => {
    if (st.kind === 'label') return; // label-only item: outlined by the scan viewer, not painted
    for (const sh of st.shapes) {
      const p = shapePath(sh), pts = shapePoints(sh, 72), box = boxOf(pts);
      if (st.kind === 'bone') {
        if (sh.t === 'l') {
          ctx.strokeStyle = COL.boneEdge; ctx.lineWidth = sh.w + 3 * lw; ctx.stroke(p);
          ctx.strokeStyle = COL.bone; ctx.lineWidth = Math.max(lw, sh.w - lw); ctx.stroke(p);
        } else {
          ctx.fillStyle = COL.bone; ctx.fill(p);
          // cancellous stipple so bone reads as bone even where it touches pale tissue
          ctx.save(); ctx.clip(p); ctx.fillStyle = COL.boneDot;
          const n = Math.round((box[2] - box[0]) * (box[3] - box[1]) * 1.4);
          for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(box[0] + r() * (box[2] - box[0]), box[1] + r() * (box[3] - box[1]), 0.6 * lw + r() * 0.6 * lw, 0, 7); ctx.fill(); }
          ctx.restore();
          ctx.strokeStyle = COL.boneEdge; ctx.lineWidth = 2.2 * lw; ctx.stroke(p);
        }
      } else if (st.kind === 'cartilage') {
        ctx.fillStyle = COL.cartilage; ctx.fill(p); ctx.strokeStyle = COL.cartilageEdge; ctx.lineWidth = 1.6 * lw; ctx.stroke(p);
      } else if (st.kind === 'nerve' || st.kind === 'artery' || st.kind === 'vein') {
        ctx.fillStyle = COL[st.kind]; ctx.fill(p); ctx.strokeStyle = COL[`${st.kind}Edge`]; ctx.lineWidth = 1.2 * lw; ctx.stroke(p);
      } else if ((st.kind === 'fascia' || st.kind === 'ligament' || st.kind === 'membrane') && sh.t === 'l') {
        ctx.strokeStyle = st.kind === 'ligament' ? COL.ligament : COL.fascia; ctx.lineWidth = Math.max(2.2 * lw, sh.w); ctx.stroke(p);
      } else {
        fillKind(ctx, st.kind, p, box, st, r, px);
        ctx.strokeStyle = st.kind === 'muscle' ? COL.muscleLine : st.kind === 'kidney' ? '#7a3a2e' : COL.apoLine; ctx.lineWidth = 1.2 * lw; ctx.stroke(p);
      }
    }
  };
  for (const st of g.shapes) if (!late.has(st.kind)) drawShape(st);
  // Layer borders
  for (const [i, ly] of g.layers.entries()) {
    if (ly.kind === 'label') continue;
    const next = g.layers[i + 1];
    ctx.strokeStyle = ly.kind === 'muscle' || next?.kind === 'muscle' ? COL.muscleLine : COL.apoLine;
    ctx.lineWidth = 1.2 * lw;
    let started = false; ctx.beginPath();
    ly.bot.forEach((p, k) => {
      const th = p[1] - ly.top[k][1], thN = next ? next.bot[k][1] - next.top[k][1] : 1;
      if (th > 0.25 || thN > 0.25) { if (!started) { ctx.moveTo(p[0], p[1]); started = true; } else ctx.lineTo(p[0], p[1]); } else started = false;
    });
    ctx.stroke();
  }
  for (const ln of g.lines) {
    if (ln.kind === 'label') continue;
    const path = linePath(ln.pts);
    if (ln.kind === 'pleura' || ln.lung) {
      const lp = polyPath([...ln.pts, [ln.pts[ln.pts.length - 1][0], g.H + 2], [ln.pts[0][0], g.H + 2]]);
      fillKind(ctx, 'lung', lp, [ln.pts[0][0], Math.min(...ln.pts.map((q) => q[1])), ln.pts[ln.pts.length - 1][0], g.H], {}, r, px);
      ctx.strokeStyle = COL.pleura; ctx.lineWidth = 2.6 * lw; ctx.stroke(path);
    } else if (ln.kind === 'peritoneum') {
      ctx.strokeStyle = COL.peritoneum; ctx.lineWidth = 2 * lw; ctx.stroke(path);
    } else if (ln.kind === 'ligament') {
      ctx.strokeStyle = COL.ligament; ctx.lineWidth = Math.max(2.4 * lw, (ln.w ?? 0.7)); ctx.stroke(path);
    } else if (ln.kind === 'bone') {
      ctx.strokeStyle = COL.boneEdge; ctx.lineWidth = (ln.w ?? 1) + 3 * lw; ctx.stroke(path);
      ctx.strokeStyle = COL.bone; ctx.lineWidth = Math.max(lw, (ln.w ?? 1) - lw); ctx.stroke(path);
    } else {
      ctx.strokeStyle = COL.fascia; ctx.lineWidth = Math.max(1.6 * lw, (ln.w ?? 0.3)); ctx.stroke(path);
    }
  }
  for (const st of g.shapes) if (late.has(st.kind)) drawShape(st);
  // Skin
  ctx.fillStyle = COL.skin; ctx.fillRect(0, 0, g.W, g.skin);
  ctx.strokeStyle = COL.skinEdge; ctx.lineWidth = 1.2 * lw; ctx.beginPath(); ctx.moveTo(0, g.skin); ctx.lineTo(g.W, g.skin); ctx.stroke();
  cache.set(key, c);
  if (cache.size > 24) cache.delete(cache.keys().next().value);
  return c;
}
