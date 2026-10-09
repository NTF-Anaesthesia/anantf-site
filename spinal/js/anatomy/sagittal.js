/* spinal/js/anatomy/sagittal.js — Fig 1.1: midline sagittal plate of the lumbar spine (T12–S3) with a spinal
   needle advancing through the L3–4 interspace, plus a transverse inset at L3–4 showing midline vs paramedian. Original drawing (approximate scale, about 36 logical units per cm). Cranial is on the left,
   posterior (skin) at the top, as in a sagittal ultrasound image. */
import { setupCanvas } from '../ui.js?v=1';
import * as K from './kit.js';

export const W = 1200;
export const H = 520;
const WINE = '#633d3c';

// depth constants (logical units, y grows anteriorly)
const SK = 58, DERM = 70, SUP_T = 108, SUP_B = 124, LAM_T = 236, FLAV_B = 252, EPI_B = 266, ADURA = 322, BODY_T = 330, BODY_B = 450;
const rise = (x) => (x < 790 ? 0 : Math.pow((x - 790) / 410, 1.3) * 130);
const skinTop = (x) => SK + 3 * Math.sin(x / 170);
const SAC_END = 945; // ~S2
const SPINE = [['T12', -34], ['L1', 110], ['L2', 254], ['L3', 398], ['L4', 542], ['L5', 686]];

function band(x0, x1, top, bot, step = 6) {
  const t = [], b = [];
  for (let x = x0; x <= x1 + 0.01; x += step) { t.push([x, top(x)]); b.push([x, bot(x)]); }
  return t.concat(b.reverse());
}

// dural sac outline (posterior wall, anterior wall) tapering to a point at S2
function sacWalls(x) {
  const top0 = EPI_B - rise(x), bot0 = ADURA - rise(x);
  if (x <= 870) return [top0, bot0];
  const k = K.ease(K.clamp((x - 870) / (SAC_END - 870)));
  const mid = (top0 + bot0) / 2 + 2;
  return [K.lerp(top0, mid, k), K.lerp(bot0, mid, k)];
}
function sacPoly() {
  const t = [], b = [];
  for (let x = -40; x <= SAC_END; x += 5) { const [a, c] = sacWalls(x); t.push([x, a]); b.push([x, c]); }
  return t.concat(b.reverse());
}

// posterior arch (lamina + spinous process) of a lumbar vertebra in the midline
function archPoly(x0) {
  const P = [[x0 + 16, SUP_B + 2], [x0 + 58, SUP_B - 1], [x0 + 100, SUP_B + 2], [x0 + 103, SUP_B + 20], [x0 + 92, 162], [x0 + 90, 200],
    [x0 + 98, LAM_T - 6], [x0 + 107, LAM_T + 6], [x0 + 106, FLAV_B - 3], [x0 + 50, FLAV_B - 1], [x0 + 2, FLAV_B - 3], [x0 + 1, LAM_T + 6],
    [x0 + 14, LAM_T - 8], [x0 + 26, 200], [x0 + 26, 162], [x0 + 13, SUP_B + 18]];
  return K.spline(P, true, 6);
}
function bodyPoly(x0, x1, top, bot) {
  const r = 7;
  return K.spline([[x0 + r, top + 2], [(x0 + x1) / 2, top + 4], [x1 - r, top + 2], [x1, top + r + 2], [x1 + 1, (top + bot) / 2], [x1, bot - r],
    [x1 - r, bot - 1], [(x0 + x1) / 2, bot - 3], [x0 + r, bot - 1], [x0, bot - r], [x0 - 1, (top + bot) / 2], [x0, top + r + 2]], true, 5);
}
function sacrumBody() {
  const t = [], b = [];
  for (let x = 830; x <= W + 10; x += 6) { t.push([x, BODY_T - rise(x) + 2]); b.push([x, BODY_B - rise(x) * 1.55 - 6]); }
  return t.concat(b.reverse());
}
const crest = (x) => (x > 1090 || x < 840 ? 0 : 20 * (Math.max(0, Math.cos(((x - 875) / 70) * Math.PI)) ** 2));
const sacTop = (x) => 196 - rise(x) - crest(x);
function sacrumBack() {
  const t = [], b = [];
  for (let x = 836; x <= W + 10; x += 4) { t.push([x, sacTop(x)]); b.push([x, FLAV_B - rise(x)]); }
  return t.concat(b.reverse());
}
const fatBot = (x) => (x < 790 ? SUP_T : x < 836 ? K.lerp(SUP_T, sacTop(836), K.ease((x - 790) / 46)) : Math.max(DERM + 14, sacTop(x)));

// ------------------------------------------------------------------ layers and steps
export const LAYERS = {
  midline: ['skin', 'supra', 'inter', 'flavum', 'epidural', 'dura', 'csf'],
  paramedian: ['skin', 'muscle', 'lamina', 'flavum', 'epidural', 'dura', 'csf'],
};
const PILL = {
  skin: 'Skin and subcutaneous fat', supra: 'Supraspinous ligament', inter: 'Interspinous ligament', flavum: 'Ligamentum flavum',
  epidural: 'Epidural space', dura: 'Dura and arachnoid', csf: 'CSF and cauda equina', muscle: 'Paraspinal muscle (off-plane)', lamina: 'Lamina: walk off it',
};

// needle geometry for each mode and step: [entry, tip]
const MID_E = [552, skinTop(552)], MID_T = [517, 300];
const PM_E = [618, skinTop(618)], PM_T = [505, 300], PM_ALT = [568, LAM_T + 1];
const onLine = (E, T, y) => [K.lerp(E[0], T[0], (y - E[1]) / (T[1] - E[1])), y];
const DEPTH = [92, 117, 185, 244, 259, 268, 292];
export function needleTip(mode, i) {
  if (mode === 'midline') return { E: MID_E, tip: onLine(MID_E, MID_T, DEPTH[i]) };
  if (i <= 1) return { E: PM_E, tip: onLine(PM_E, PM_ALT, i === 0 ? 92 : 170) };
  if (i === 2) return { E: PM_E, tip: PM_ALT };
  return { E: PM_E, tip: onLine(PM_E, PM_T, i === 3 ? 246 : DEPTH[i]) };
}

/** Which step index (0–6) lies under logical point (x, y), or -1. */
export function hitStep(x, y) {
  if (x < 260 || x > 820) return -1;
  if (y < skinTop(x)) return -1;
  if (y < SUP_T) return 0;
  if (y < SUP_B + 2) return 1;
  if (y < LAM_T) return 2;
  if (y < FLAV_B) return 3;
  if (y < EPI_B) return 4;
  if (y < EPI_B + 5) return 5;
  if (y < ADURA) return 6;
  return -1;
}

// ------------------------------------------------------------------ view
export function viewFor(cssW) {
  if (cssW < 620) return { x: 270, y: 24, w: 540, h: 446, compact: true };
  return { x: 0, y: 0, w: W, h: H, compact: cssW < 760 };
}

// ------------------------------------------------------------------ static plate (cached per size/state)
function drawPlate(c, st, u) {
  const { mode, key } = st;
  const A = (k) => (k === key ? 1 : 0.55);
  const OTHER = 0.85;
  const ink = (a = 1) => `rgba(43,30,24,${0.85 * a})`;
  const outline = (P, a, lw = 1.4) => { K.polyPath(c, P); c.strokeStyle = ink(a); c.lineWidth = lw * u; c.stroke(); };
  const hi = (P, k) => { if (k !== key) return; K.polyPath(c, P); c.strokeStyle = WINE; c.lineWidth = 2.5 * u; c.stroke(); };

  K.paper(c, W, H, 3);

  // skin + fat
  const fat = band(-10, W + 10, (x) => DERM, fatBot, 8);
  c.save(); c.globalAlpha = A('skin');
  K.polyPath(c, fat); c.fillStyle = K.C.fat; c.fill();
  K.fatLobules(c, fat, 11, 1.1);
  const skin = band(-10, W + 10, skinTop, () => DERM, 8);
  K.polyPath(c, skin); c.fillStyle = K.C.skin; c.fill();
  c.restore();
  outline(skin, A('skin')); outline(fat, A('skin') * 0.7, 1);

  // interspinous ligament (under the arches)
  const inter = band(-10, 838, (x) => Math.max(SUP_B - 2, fatBot(x)), (x) => LAM_T + 2 - rise(x), 4);
  c.save(); c.globalAlpha = A('inter');
  K.polyPath(c, inter); c.fillStyle = K.C.inter; c.fill();
  K.fibres(c, inter, -1.15, 260, 21, 0.9, 1.2);
  c.restore();

  // ligamentum flavum (under the laminae)
  const flav = band(-10, 838, (x) => LAM_T + 1 - rise(x), (x) => FLAV_B + 1 - rise(x), 8);
  c.save(); c.globalAlpha = A('flavum');
  K.polyPath(c, flav); c.fillStyle = K.C.flavum; c.fill();
  K.fibres(c, flav, -0.35, 120, 23, 0.7, 0.5);
  c.restore();

  // canal contents: epidural fat everywhere, then the dural sac on top
  const canal = band(-10, W + 10, (x) => FLAV_B - rise(x), (x) => BODY_T - rise(x), 6);
  c.save(); c.globalAlpha = A('epidural');
  K.polyPath(c, canal); c.fillStyle = K.C.epifat; c.fill();
  const r = K.rng(31);
  for (let x = 0; x < W; x += 9) { c.beginPath(); c.ellipse(x + r() * 6, FLAV_B + 7 - rise(x) + r() * 4, 3.5, 2, 0, 0, Math.PI * 2); c.strokeStyle = 'rgba(176,140,70,.35)'; c.lineWidth = 0.7; c.stroke(); }
  // epidural veins: anterior internal vertebral venous plexus + a few posterior
  c.fillStyle = K.C.vein;
  for (let x = 14; x < 930; x += 46) { c.beginPath(); c.ellipse(x + r() * 10, ADURA + 4 - rise(x), 9 + r() * 4, 3, 0, 0, Math.PI * 2); c.fill(); }
  for (let x = 40; x < 840; x += 120) { c.beginPath(); c.ellipse(x + r() * 20, EPI_B - 4 - rise(x), 5, 2.2, 0, 0, Math.PI * 2); c.fill(); }
  c.restore();
  hi(canal, 'epidural');

  const sac = sacPoly();
  c.save(); c.globalAlpha = A('csf');
  K.polyPath(c, sac); c.fillStyle = K.C.csf; c.fill();
  c.save(); K.polyPath(c, sac); c.clip();
  // cord and conus (tip ~ lower third of L1)
  const CY = 295, TIP = 192;
  const half = (x) => (x < 100 ? 17 : 17 * Math.pow(Math.max(0, (TIP - x) / (TIP - 100)), 0.75));
  const cordT = [], cordB = [];
  for (let x = -40; x <= TIP; x += 4) { cordT.push([x, CY - half(x)]); cordB.push([x, CY + half(x)]); }
  const cord = cordT.concat(cordB.reverse());
  const cg = c.createLinearGradient(0, CY - 17, 0, CY + 17); cg.addColorStop(0, '#f6e3d2'); cg.addColorStop(1, '#e8c4a6');
  K.polyPath(c, cord); c.fillStyle = cg; c.fill(); c.strokeStyle = ink(); c.lineWidth = 1.2 * u; c.stroke();
  // filum terminale
  c.beginPath(); c.moveTo(TIP, CY);
  for (let x = TIP; x <= W + 10; x += 10) { const [a, b] = x <= SAC_END ? sacWalls(x) : [FLAV_B - rise(x), BODY_T - rise(x)]; c.lineTo(x, x < 600 ? K.lerp(CY, (a + b) / 2, (x - TIP) / (600 - TIP)) : (a + b) / 2); }
  c.restore();
  c.strokeStyle = K.C.rootLine; c.lineWidth = 1 * u; c.stroke();
  // cauda equina
  c.save(); K.polyPath(c, sac); c.clip();
  const exits = [354, 354, 498, 498, 642, 642, 786, 786, 900, 900, 945, 945, 945, 945];
  exits.forEach((ex, k) => {
    const sx = 110 + k * 5.5, sy = CY + (k % 2 ? -1 : 1) * (6 + (k % 4) * 2.5);
    const lane = 276 + ((k * 7) % 14) * 3;
    c.beginPath(); c.moveTo(sx, sy);
    c.quadraticCurveTo(sx + 60, lane, sx + 120, lane);
    const end = Math.min(ex, SAC_END - 12);
    for (let x = sx + 120; x <= end - 30; x += 12) { const [a, b] = sacWalls(x); c.lineTo(x, K.clamp(lane - rise(x), a + 3, b - 3)); }
    const [a2, b2] = sacWalls(end);
    c.quadraticCurveTo(end - 6, K.clamp(lane - rise(end), a2 + 3, b2 - 3), end + 8, b2 - 1);
    c.lineCap = 'round';
    c.strokeStyle = K.C.rootLine; c.lineWidth = 2.6 * u; c.stroke();
    c.strokeStyle = K.C.root; c.lineWidth = 1.3 * u; c.stroke();
  });
  c.restore();
  c.restore();
  hi(sac, 'csf');
  // dura + arachnoid
  c.save(); c.globalAlpha = A('dura');
  K.polyPath(c, sac); c.strokeStyle = K.C.dura; c.lineWidth = 3.4 * u; c.stroke();
  c.setLineDash([3 * u, 2 * u]);
  const inner = []; for (let x = -40; x <= SAC_END - 8; x += 6) { const [a] = sacWalls(x); inner.push([x, a + 2.6]); }
  c.beginPath(); inner.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.strokeStyle = '#7d6a94'; c.lineWidth = 0.9 * u; c.stroke();
  c.restore();
  K.polyPath(c, sac); c.strokeStyle = key === 'dura' ? WINE : ink(A('dura')); c.lineWidth = (key === 'dura' ? 2.5 : 1) * u; c.stroke();

  // vertebral bodies and discs
  const boneA = mode === 'paramedian' && key === 'lamina' ? 0.6 : OTHER;
  c.save(); c.globalAlpha = boneA;
  SPINE.forEach(([, x0], i) => {
    const disc = bodyPoly(x0 + 100, x0 + 144, BODY_T + 5, BODY_B - 4);
    K.polyPath(c, disc); c.fillStyle = '#e3d3bd'; c.fill(); c.strokeStyle = ink(); c.lineWidth = 1.2 * u; c.stroke();
    c.beginPath(); c.ellipse(x0 + 122, (BODY_T + BODY_B) / 2, 12, 34, 0, 0, Math.PI * 2); c.fillStyle = '#f1e7da'; c.fill();
    const body = bodyPoly(x0, x0 + 100, BODY_T, BODY_B);
    K.polyPath(c, body); c.fillStyle = K.C.bone; c.fill();
    const rr = K.rng(40 + i);
    c.save(); K.polyPath(c, body); c.clip();
    for (let k = 0; k < 70; k++) { c.beginPath(); c.arc(x0 + rr() * 100, BODY_T + rr() * 120, 1 + rr() * 2.4, 0, Math.PI * 2); c.strokeStyle = 'rgba(150,128,90,.35)'; c.lineWidth = 0.7; c.stroke(); }
    c.restore();
    K.polyPath(c, body); c.strokeStyle = K.C.cortex; c.lineWidth = 3; c.stroke(); c.strokeStyle = ink(); c.lineWidth = 1.4 * u; c.stroke();
  });
  // L5–S1 disc + sacrum
  const sb = sacrumBody();
  K.polyPath(c, sb); c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = K.C.cortex; c.lineWidth = 3; c.stroke(); c.strokeStyle = ink(); c.lineWidth = 1.4 * u; c.stroke();
  [900, 965, 1030, 1095].forEach((x) => { c.beginPath(); c.moveTo(x, BODY_T - rise(x) + 4); c.lineTo(x + 6, BODY_B - rise(x) * 1.55 - 10); c.strokeStyle = 'rgba(120,100,70,.5)'; c.lineWidth = 1.2 * u; c.stroke(); });
  const sback = sacrumBack();
  K.polyPath(c, sback); c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = K.C.cortex; c.lineWidth = 2.5; c.stroke(); c.strokeStyle = ink(); c.lineWidth = 1.4 * u; c.stroke();
  c.restore();

  // posterior arches
  c.save(); c.globalAlpha = key === 'lamina' ? 1 : OTHER;
  SPINE.forEach(([, x0]) => {
    const P = archPoly(x0);
    K.polyPath(c, P); c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = K.C.cortex; c.lineWidth = 2.6; c.stroke(); c.strokeStyle = ink(); c.lineWidth = 1.4 * u; c.stroke();
  });
  c.restore();
  if (key === 'lamina') { const P = archPoly(542); K.polyPath(c, P); c.strokeStyle = WINE; c.lineWidth = 2.5 * u; c.stroke(); }

  // supraspinous ligament along the tips
  const supra = band(-10, 800, () => SUP_T, (x) => SUP_B + 1 - (x > 770 ? (x - 770) * 0.4 : 0), 5);
  c.save(); c.globalAlpha = A('supra');
  K.polyPath(c, supra); c.fillStyle = K.C.supra; c.fill();
  K.fibres(c, supra, 0, 140, 17, 0.9, 0.9);
  c.restore();
  outline(supra, A('supra'), 1.1);

  // paramedian: the midline ligaments are bypassed
  if (mode === 'paramedian') {
    c.save(); c.globalAlpha = 0.5; c.fillStyle = 'rgba(244,236,225,.55)';
    K.polyPath(c, supra); c.fill();
    c.restore();
  }

  hi(skin.concat([]), 'skin'); if (key === 'skin') hi(fat, 'skin');
  hi(supra, 'supra'); hi(inter, 'inter'); hi(flav, 'flavum');

  // level labels
  c.save(); c.font = `500 ${12 * u}px "NTF Mono","JetBrains Mono",ui-monospace,monospace`; c.fillStyle = '#5b4636'; c.textAlign = 'center'; c.textBaseline = 'top';
  SPINE.forEach(([n, x0]) => { if (x0 > 0) c.fillText(n, x0 + 50, BODY_B + 8); });
  [['S1', 866], ['S2', 932], ['S3', 998]].forEach(([n, x]) => c.fillText(n, x, BODY_B - rise(x) * 1.55 + 2));
  c.restore();
}

// ------------------------------------------------------------------ main canvas controller
export function createSagittal(canvas) {
  let cache = null, cacheKey = '';
  let size = { w: 0, h: 0 }, view = viewFor(800);
  const st = { mode: 'midline', step: 0, key: 'skin' };
  let tipNow = needleTip('midline', 0).tip, entryNow = needleTip('midline', 0).E;
  let anim = null, fade = 1;

  function resize(cssW) {
    view = viewFor(cssW);
    const cssH = Math.round((cssW * view.h) / view.w);
    size = { w: cssW, h: cssH };
    cacheKey = '';
  }

  function plate() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const keyStr = `${size.w}|${dpr}|${st.mode}|${st.key}`;
    if (cacheKey === keyStr && cache) return cache;
    cache = cache || document.createElement('canvas');
    cache.width = Math.round(size.w * dpr); cache.height = Math.round(size.h * dpr);
    const c = cache.getContext('2d');
    const k = size.w / view.w;
    c.setTransform(dpr * k, 0, 0, dpr * k, -view.x * dpr * k, -view.y * dpr * k);
    drawPlate(c, st, 1 / k);
    cacheKey = keyStr;
    return cache;
  }

  function labelsFor(c, u) {
    const s = u * 1.0;
    const key = st.key;
    const paramedian = st.mode === 'paramedian';
    const L = [
      { k: 'skin', x: 660, y: 26, a: [700, 82] },
      { k: paramedian ? 'muscle' : 'supra', x: 470, y: 26, a: paramedian ? [600, 150] : [420, 116], align: 'right' },
      { k: 'inter', x: 330, y: 180, a: [380, 186], hideP: true, align: 'right' },
      { k: 'flavum', x: 655, y: 214, a: [520, 244] },
      { k: 'epidural', x: 300, y: 214, a: [440, 259], align: 'right' },
      { k: 'dura', x: 650, y: 290, a: [600, 266] },
      { k: 'csf', x: 655, y: 368, a: [600, 300] },
    ];
    if (paramedian) L.push({ k: 'lamina', x: 690, y: 160, a: [570, 236] });
    if (!view.compact) {
      // static anatomical labels
      K.pill(c, 'Conus medullaris (~L1–2)', 60, 384, { anchor: [190, 296], s });
      K.pill(c, 'Dural sac ends (~S2)', 1040, 300, { anchor: [SAC_END - 4, sacWalls(SAC_END - 4)[0] + 2], s, align: 'center' });
      K.pill(c, 'Epidural veins', 330, 384, { anchor: [330, ADURA + 4], s, dark: true });
      K.pill(c, 'Vertebral body', 470, 494, { anchor: [470, 430], s, align: 'center' });
      K.pill(c, 'Disc', 664, 494, { anchor: [664, 420], s, align: 'center' });
      K.pill(c, 'Spinous process', 24, 26, { anchor: [170, 150], s });
      L.forEach((l) => {
        if (l.hideP && paramedian) return;
        if (!LAYERS[st.mode].includes(l.k)) return;
        K.pill(c, PILL[l.k], l.x, l.y, { anchor: l.a, s, align: l.align || 'left', alpha: l.k === key ? 1 : 0.78 });
      });
    } else {
      const l = L.find((q) => q.k === key);
      if (l) {
        const tip = tipNow;
        const left = tip[0] > view.x + view.w / 2;
        const py = K.clamp(tip[1] - 46, view.y + 16 * u, view.y + view.h - 16 * u);
        // keep the pill inside the cropped view (it was clipped at the left edge on phones)
        const pw = K.pillSize(c, PILL[key], s).w, lo = view.x + 6 * u, hi = view.x + view.w - 6 * u;
        const px = left ? K.clamp(tip[0] - 26, lo + pw, hi) : K.clamp(tip[0] + 26, lo, hi - pw);
        K.pill(c, PILL[key], px, py, { anchor: tip, s, align: left ? 'right' : 'left' });
      }
    }
  }

  function render() {
    if (!size.w) return;
    const c = setupCanvas(canvas, size.w, size.h);
    c.clearRect(0, 0, size.w, size.h);
    c.globalAlpha = fade;
    c.drawImage(plate(), 0, 0, size.w, size.h);
    c.globalAlpha = 1;
    const k = size.w / view.w, u = 1 / k;
    c.save(); c.scale(k, k); c.translate(-view.x, -view.y);
    // needle: off-plane shaft is ghosted in paramedian mode
    const far = [entryNow[0] - (tipNow[0] - entryNow[0]) * 0.9, entryNow[1] - (tipNow[1] - entryNow[1]) * 0.9 - 40];
    if (st.mode === 'paramedian') {
      K.drawNeedle(c, far, tipNow, { alpha: 0.42, s: u * 1.15 });
      c.save(); c.beginPath(); c.rect(-10, LAM_T - 6, W + 20, H); c.clip();
      K.drawNeedle(c, far, tipNow, { alpha: 1, s: u * 1.15 }); c.restore();
    } else K.drawNeedle(c, far, tipNow, { alpha: fade, s: u * 1.15 });
    labelsFor(c, u);
    if (st.mode === 'paramedian' && !view.compact && st.key !== 'csf') K.cuePill(c, 'Midline ligaments bypassed', 850, 494, { s: u });
    if (st.key === 'csf') {
      const x = view.compact ? view.x + 10 * u : 850;
      // compact: sit over the vertebral bodies, clear of the level labels at the bottom
      K.warnPill(c, 'Pain or paraesthesia: stop', x, view.compact ? BODY_T + 24 : 494, { s: u });
    }
    c.restore();
  }

  function animateTo(E, tip, instant) {
    cancelAnimationFrame(anim?.raf || 0);
    if (instant) { tipNow = tip; entryNow = E; render(); return; }
    const t0 = performance.now(), fromT = tipNow.slice(), fromE = entryNow.slice(), dur = 520;
    anim = { raf: 0 };
    const tick = (now) => {
      const p = K.ease(K.clamp((now - t0) / dur));
      tipNow = [K.lerp(fromT[0], tip[0], p), K.lerp(fromT[1], tip[1], p)];
      entryNow = [K.lerp(fromE[0], E[0], p), K.lerp(fromE[1], E[1], p)];
      render();
      if (p < 1) anim.raf = requestAnimationFrame(tick);
    };
    anim.raf = requestAnimationFrame(tick);
  }

  return {
    resize(cssW) { resize(cssW); render(); },
    set(mode, step, instant) {
      st.mode = mode; st.step = step; st.key = LAYERS[mode][step];
      const { E, tip } = needleTip(mode, step);
      animateTo(E, tip, instant);
    },
    fadeIn(instant) {
      if (instant) { fade = 1; render(); return; }
      const t0 = performance.now();
      const tick = (now) => { fade = K.clamp((now - t0) / 450); render(); if (fade < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    },
    toLogical(px, py) { const k = size.w / view.w; return [px / k + view.x, py / k + view.y]; },
    render,
    get view() { return view; },
  };
}

// ------------------------------------------------------------------ transverse inset at L3–4
export const IW = 400, IH = 330;
export function drawInset(canvas, cssW, mode, stepKey) {
  const cssH = Math.round((cssW * IH) / IW);
  const c = setupCanvas(canvas, cssW, cssH);
  const k = cssW / IW, u = 1 / k;
  c.save(); c.scale(k, k);
  K.paper(c, IW, IH, 9);
  const ink = 'rgba(43,30,24,.85)';
  const stroke = (lw = 1.3) => { c.strokeStyle = ink; c.lineWidth = lw * u; c.stroke(); };
  const cx = 200;
  // skin + fat
  c.beginPath(); c.moveTo(0, 30); c.quadraticCurveTo(cx, 16, IW, 30); c.lineTo(IW, 40); c.quadraticCurveTo(cx, 26, 0, 40); c.closePath(); c.fillStyle = K.C.skin; c.fill(); stroke(1);
  c.beginPath(); c.moveTo(0, 40); c.quadraticCurveTo(cx, 26, IW, 40); c.lineTo(IW, 70); c.quadraticCurveTo(cx, 56, 0, 70); c.closePath(); c.fillStyle = K.C.fat; c.fill();
  K.fatLobules(c, [[0, 40], [IW, 40], [IW, 70], [0, 70]], 4, 0.8);
  // erector spinae either side
  const muscle = (dir) => {
    const P = K.spline([[cx + dir * 14, 62], [cx + dir * 80, 58], [cx + dir * 150, 78], [cx + dir * 172, 132], [cx + dir * 120, 160], [cx + dir * 40, 150], [cx + dir * 14, 120]], true, 8);
    K.polyPath(c, P); c.fillStyle = '#d9a48f'; c.fill();
    K.fibres(c, P, Math.PI / 2, 90, 50 + dir, 0.8, 0.4);
    K.polyPath(c, P); stroke(1.2);
    return P;
  };
  muscle(-1); muscle(1);
  // interspinous ligament (midline) — no spinous process at an interspace level
  c.beginPath(); c.rect(cx - 9, 50, 18, 104); c.fillStyle = K.C.inter; c.fill(); stroke(1);
  // laminae / articular processes (bone)
  const lam = (dir) => {
    const P = K.spline([[cx + dir * 14, 150], [cx + dir * 60, 136], [cx + dir * 104, 140], [cx + dir * 118, 160], [cx + dir * 100, 178], [cx + dir * 58, 176], [cx + dir * 26, 172]], true, 8);
    K.polyPath(c, P); c.fillStyle = K.C.bone; c.fill(); c.strokeStyle = K.C.cortex; c.lineWidth = 2.2; c.stroke(); stroke(1.2);
  };
  // flavum (V across the midline)
  c.beginPath(); c.moveTo(cx - 70, 162); c.lineTo(cx, 166); c.lineTo(cx + 70, 162); c.lineTo(cx + 70, 172); c.lineTo(cx, 178); c.lineTo(cx - 70, 172); c.closePath();
  c.fillStyle = K.C.flavum; c.fill(); stroke(1);
  lam(-1); lam(1);
  // epidural + dural sac
  c.beginPath(); c.ellipse(cx, 214, 46, 38, 0, 0, Math.PI * 2); c.fillStyle = K.C.epifat; c.fill();
  c.beginPath(); c.ellipse(cx, 216, 36, 30, 0, 0, Math.PI * 2); c.fillStyle = K.C.csf; c.fill(); c.strokeStyle = K.C.dura; c.lineWidth = 3 * u; c.stroke(); stroke(1);
  const r = K.rng(12);
  for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 22; c.beginPath(); c.arc(cx + Math.cos(a) * d, 222 + Math.sin(a) * d * 0.7, 2.6, 0, Math.PI * 2); c.fillStyle = K.C.root; c.fill(); c.strokeStyle = K.C.rootLine; c.lineWidth = 0.8 * u; c.stroke(); }
  // disc / body
  c.beginPath(); c.ellipse(cx, 312, 96, 52, 0, Math.PI, Math.PI * 2); c.closePath(); c.fillStyle = '#e3d3bd'; c.fill(); stroke(1.2);
  // needles
  const mid = [[cx, -10], [cx, 222]];
  const pm = [[cx + 44, -10], [cx + 3, 222]];
  const draw = (P, active) => {
    if (!active) { c.save(); c.setLineDash([5 * u, 4 * u]); c.beginPath(); c.moveTo(...P[0]); c.lineTo(...P[1]); c.strokeStyle = 'rgba(47,48,53,.55)'; c.lineWidth = 1.4 * u; c.stroke(); c.restore(); return; }
    K.drawNeedle(c, P[0], P[1], { s: u * 1.1 });
  };
  draw(mid, mode === 'midline'); draw(pm, mode === 'paramedian');
  const s = u * 0.95;
  K.pill(c, 'Midline', cx - 14, 92, { align: 'right', s, alpha: mode === 'midline' ? 1 : 0.7 });
  K.pill(c, 'Paramedian', cx + 36, 92, { s, alpha: mode === 'paramedian' ? 1 : 0.7 });
  K.tissueName(c, 'erector spinae', 96, 128, { s: u * 0.9 });
  K.tissueName(c, 'lamina', 288, 160, { s: u * 0.9 });
  K.tissueName(c, 'dural sac', 300, 232, { s: u * 0.9 });
  K.pill(c, 'Flavum', 40, 200, { anchor: [cx - 6, 171], s });
  c.font = `500 ${11 * u}px "NTF Mono",ui-monospace,monospace`; c.fillStyle = '#5b4636'; c.textAlign = 'left'; c.textBaseline = 'top';
  c.fillText('Transverse, L3–4', 8, IH - 18);
  c.restore();
  return cssH;
}
