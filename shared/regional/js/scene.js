// Truncal blocks: scene geometry. A scene is one ultrasound field of view described in millimetres
// (x across the screen from the left edge, y = depth from the skin). Schema: shared/DATA.md ("Scene schema").
// This module turns the authored data into sampled geometry that both renderers (bmode.js, diagram.js),
// the label overlay and the needle / local anaesthetic (LA) animation share, so a structure is in the same
// place in every view.

export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// ---------------------------------------------------------------- shape constructors (used in data files)
/** Ellipse: centre (cx, cy), radii rx, ry (mm), rotation in degrees. */
export const E = (cx, cy, rx, ry, rot = 0) => ({ t: 'e', cx, cy, rx, ry, rot });
/** Closed polygon through points (smoothed unless sharp:true). */
export const P = (...pts) => ({ t: 'p', pts });
export const PS = (...pts) => ({ t: 'p', pts, sharp: true });
/** Open polyline of width w (mm). */
export const L = (w, ...pts) => ({ t: 'l', w, pts });

// ---------------------------------------------------------------- curves
/** Catmull-Rom through P, n samples per segment. Open unless closed. */
export function spline(P, closed = false, n = 10) {
  if (P.length < 3) return P.map((p) => p.slice());
  const out = []; const L = P.length; const cnt = closed ? L : L - 1;
  for (let i = 0; i < cnt; i++) {
    const p0 = P[closed ? (i - 1 + L) % L : Math.max(i - 1, 0)], p1 = P[i], p2 = P[(i + 1) % L], p3 = P[closed ? (i + 2) % L : Math.min(i + 2, L - 1)];
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (k) => 0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  out.push(closed ? out[0].slice() : P[L - 1].slice());
  return out;
}

/** y of an x-sorted polyline at x (linear, clamped beyond the ends). */
export function yAt(pts, x) {
  if (!pts || !pts.length) return 0;
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i][0] >= x) { const a = pts[i - 1], b = pts[i]; return lerp(a[1], b[1], (x - a[0]) / ((b[0] - a[0]) || 1)); }
  }
  return pts[pts.length - 1][1];
}

/** A boundary polyline as a dense, x-sorted list (smoothed unless the authored list asks otherwise). */
function boundary(pts, smooth = true) {
  const s = (smooth && pts.length > 2 ? spline(pts, false, 8) : pts.map((p) => p.slice())).sort((a, b) => a[0] - b[0]);
  return s;
}

export function shapePoints(sh, n = 72) {
  if (sh.t === 'e') {
    const out = []; const r = (sh.rot || 0) * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, x = sh.rx * Math.cos(a), y = sh.ry * Math.sin(a); out.push([sh.cx + x * c - y * s, sh.cy + x * s + y * c]); }
    return out;
  }
  if (sh.t === 'p') return sh.sharp ? [...sh.pts.map((p) => p.slice()), sh.pts[0].slice()] : spline(sh.pts, true, 8);
  return sh.pts.length > 2 && !sh.sharp ? spline(sh.pts, false, 8) : sh.pts.map((p) => p.slice());
}

export function shapeBox(sh) {
  const pts = shapePoints(sh, 24);
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (const [x, y] of pts) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  const w = sh.t === 'l' ? sh.w / 2 : 0;
  return [a - w, b - w, c + w, d + w];
}

export function centroid(pts) {
  let x = 0, y = 0; for (const p of pts) { x += p[0]; y += p[1]; } return [x / pts.length, y / pts.length];
}

/** Path2D for a shape in mm units (scale with ctx transform). */
export function shapePath(sh) {
  const pts = shapePoints(sh);
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  if (sh.t !== 'l') p.closePath();
  return p;
}

/** Path2D of a polyline (open). */
export function linePath(pts) {
  const p = new Path2D();
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
  return p;
}

// ---------------------------------------------------------------- normalise
const DEF_EDGE = { fat: 0.6, muscle: 0.95, aponeurosis: 0.95, connective: 0.6, 'fat-deep': 0.6, bowel: 0, liver: 0.8, fluid: 0.6, lung: 0 };

/**
 * prepare(scene) -> geometry object cached on the scene (scene._g). Adds:
 *  g.layers[i] = {...layer, top:[[x,y]], bot:[[x,y]], poly:[[x,y]], topAt(x), botAt(x)}
 *  g.lines[i]  = {...line, pts:[[x,y]] (dense, x-sorted)}
 *  g.shapes[i] = {...shape, pts}
 */
export function prepare(scene) {
  if (scene._g) return scene._g;
  const W = scene.width, H = scene.depth;
  const skin = scene.skin ?? 1.2;
  const step = Math.max(0.25, W / 240);
  const xs = []; for (let x = 0; x <= W + 1e-6; x += step) xs.push(Math.min(W, x));
  const resolve = (spec) => (typeof spec === 'number' ? [[0, spec], [W, spec]] : spec);
  let prevBot = xs.map((x) => [x, skin]);
  const layers = (scene.layers || []).map((ly) => {
    const authored = boundary(resolve(ly.bottom), ly.smooth !== false);
    const top = prevBot.map((p) => p.slice());
    const bot = xs.map((x, i) => [x, Math.max(top[i][1], Math.min(H + 40, yAt(authored, x)))]);
    prevBot = bot;
    const poly = top.concat(bot.slice().reverse());
    return { ...ly, top, bot, poly, edge: ly.edge ?? DEF_EDGE[ly.kind] ?? 0.6,
      topAt: (x) => yAt(top, x), botAt: (x) => yAt(bot, x), thickAt: (x) => yAt(bot, x) - yAt(top, x) };
  });
  const lines = (scene.lines || []).map((ln) => ({ ...ln, pts: boundary(ln.pts, ln.smooth !== false) }));
  const shapes = (scene.shapes || []).map((s) => ({ ...s, shapes: (Array.isArray(s.shape) ? s.shape : [s.shape]).filter(Boolean) }));
  const g = { W, H, skin, xs, layers, lines, shapes, byId: new Map() };
  for (const it of [...layers, ...lines, ...shapes]) if (it.id) g.byId.set(it.id, it);
  scene._g = g;
  return g;
}

/** Resolve a plane reference: polyline [[x,y]…], 'layerId' (its bottom), 'layerId:top', or a line id. */
export function planePts(scene, ref) {
  const g = prepare(scene);
  if (Array.isArray(ref)) return boundary(ref, true);
  const [id, side] = String(ref).split(':');
  const it = g.byId.get(id);
  if (!it) return [[0, g.H / 2], [g.W, g.H / 2]];
  if (it.bot) return side === 'top' ? it.top : it.bot;
  if (it.pts) return it.pts;
  return [[0, g.H / 2], [g.W, g.H / 2]];
}

/** Default label anchor (mm) for a layer, line or shape. */
export function anchorOf(scene, it) {
  const g = prepare(scene);
  if (it.at) return it.at;
  if (it.bot) {
    const x = it.labelX ?? scene.labelX ?? g.W * 0.8;
    return [x, (it.topAt(x) + it.botAt(x)) / 2];
  }
  if (it.pts) { const x = it.labelX ?? g.W * 0.82; return [x, yAt(it.pts, x)]; }
  if (it.shapes?.length) return centroid(shapePoints(it.shapes[0], 24));
  return [g.W / 2, g.H / 2];
}

// ---------------------------------------------------------------- local anaesthetic spread and tissue warp
/**
 * spreadProfile(scene, inj, g01) -> null | {cols: fn(x) -> {y0, lift, dip, A} | null, x0, x1, plane}
 * The LA collects along the plane: tissue above it is lifted (compressed upward over `above` mm), tissue
 * below is pushed down. up = share of the thickness that lifts the layer above (0 = all pushes down).
 */
export function spreadProfile(scene, inj, g01) {
  const sp = inj?.spread;
  if (!sp || g01 <= 0) return null;
  const plane = planePts(scene, sp.along);
  const tipX = sp.from ?? inj.tip[0];
  const e = easeOut(clamp(g01));
  const left = tipX - (tipX - sp.x0) * e;
  const right = tipX + (sp.x1 - tipX) * e;
  const thick = (sp.thick ?? 4) * clamp(g01 * 1.6);
  const up = clamp(sp.up ?? 0.5);
  const A = sp.above ?? 8;
  const shapeK = sp.shape ?? 0.9;
  const cols = (x) => {
    if (x < left || x > right) return null;
    const half = x < tipX ? Math.max(0.5, tipX - left) : Math.max(0.5, right - tipX);
    const u = (x - tipX) / half;
    const t = thick * Math.pow(Math.max(0, 1 - u * u), shapeK);
    if (t < 0.05) return null;
    return { y0: yAt(plane, x), lift: Math.min(t * up, A * 0.8), dip: t * (1 - up), A };
  };
  return { cols, x0: left, x1: right, plane };
}

/** Needle tenting before a pop: a dent at the tip that pushes the plane down without fluid. */
export function tentProfile(scene, inj, depth01) {
  if (!inj?.pop || depth01 <= 0) return null;
  const plane = planePts(scene, inj.pop.plane || inj.spread?.along);
  const tx = inj.tip[0];
  const d = (inj.pop.tent ?? 1.4) * depth01;
  const half = inj.pop.width ?? 4;
  return {
    x0: tx - half, x1: tx + half, plane, tent: true,
    cols: (x) => {
      const u = (x - tx) / half; if (Math.abs(u) >= 1) return null;
      const t = d * Math.pow(1 - u * u, 2);
      return { y0: yAt(plane, x), lift: -t, dip: t, A: 6 };
    },
  };
}

/** Displacement (mm) that one plane of a warp profile adds at depth y. side: 0 normal, -1/+1 = limit from above/below the plane. */
export function planeDelta(c, y, side = 0) {
  const { y0, lift, dip, A } = c;
  if (side && Math.abs(y - y0) < 1e-9) return side > 0 ? dip : -lift;
  if (y >= y0) return dip;
  if (y <= y0 - A) return 0;
  return -lift * (y - (y0 - A)) / A;
}

/**
 * Where a point (mm) is drawn once the warp is applied. `prof` is one profile (spreadProfile / tentProfile),
 * null, or an array of profiles (several local anaesthetic spreads at once): their displacements add up.
 */
export function warpY(prof, x, y) {
  if (!prof) return y;
  if (Array.isArray(prof)) {
    let d = 0;
    for (const p of prof) { const c = p && p.cols(x); if (c) d += planeDelta(c, y); }
    return y + d;
  }
  const c = prof.cols(x);
  if (!c) return y;
  return y + planeDelta(c, y);
}
