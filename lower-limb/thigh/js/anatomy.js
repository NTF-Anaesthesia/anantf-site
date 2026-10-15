// Thigh page: the anatomy chapter (the sciatic nerve from pelvis to knee with the posterior femoral cutaneous nerve,
// an interactive "levels" figure, who supplies the thigh) and the mid-thigh cross-section used by the amputation
// planner. Original schematic drawings (SVG), not traced from any published figure. Clinical colours: nerves yellow,
// arteries red, veins blue, local anaesthetic blue. Prefix th-.
import { el, sv, fill, keyPoints, callout, table, registerSearch, announce } from '../../../shared/regional/js/ui.js';
import { legViewsFigure } from '../../../shared/regional/js/figures/leg.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', ART = '#c0392b', VEIN = '#2f5d9e', LA = '#2c74b3';
const INK = '#272722', MUTED = '#55534d', BONE = '#f6f0e2', BONE_EDGE = '#8f7f5c', MUSCLE = '#d49a88', MUSCLE_EDGE = '#a8695a';
const SKIN = '#f1e3cf', SKIN_EDGE = '#b98d6e', FAT = '#f3e2bf', WINE = '#633d3c';
const SANS = 'NTF Sans, Inter, sans-serif', MONO = 'NTF Mono, JetBrains Mono, monospace';
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const txt = (g, x, y, s, o = {}) => sv('text', { x, y, 'font-family': SANS, 'font-size': o.size || 14, fill: o.fill || INK, 'text-anchor': o.anchor || 'start', 'font-weight': o.weight || 400, ...(o.italic ? { 'font-style': 'italic' } : {}), ...(o.halo ? { stroke: '#fbf9f4', 'stroke-width': 3.2, 'paint-order': 'stroke', 'stroke-linejoin': 'round' } : {}), text: s }, g);
function nervePath(g, d, w = 4, extra = {}) {
  const grp = sv('g', extra, g);
  sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': w + 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp);
  sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp);
  return grp;
}

// ================================================================== levels figure (posterior view, right hip and thigh)
// Back view: medial (gluteal cleft) on the viewer's left, lateral (greater trochanter) on the right.
const SCI = 'M134 162 C150 190 172 214 184 238 C190 270 190 330 190 400 C190 440 192 480 194 512';
const TIB = 'M194 512 C194 530 192 548 190 568';
const CPN = 'M196 512 C206 530 220 548 232 568';
const PFC = 'M120 164 C130 196 146 222 156 246 C166 290 172 360 174 440 C176 480 178 520 180 568';
const CLUN = 'M152 244 C134 254 106 256 84 238';
const PERI = 'M146 232 C124 244 98 262 70 276';
const SGN = 'M112 118 C146 104 190 96 236 104';
const IGN = 'M126 168 C150 176 176 178 206 168';
const NQF = 'M140 174 C150 196 158 210 166 226';
const HAM1 = 'M188 300 C176 304 162 306 148 304', HAM2 = 'M189 340 C176 346 164 352 150 352';

export const LEVELS = [
  { id: 'ps', name: 'Parasacral', y: 140, x: 132, ang: 34, inj: [136, 150],
    catches: ['sci', 'pfcn', 'sgn', 'ign', 'nqf', 'ham'], href: '#sciatic-ap-ps', hrefText: 'Scan it',
    where: 'At the greater sciatic notch, under piriformis: the sacral plexus as it leaves the pelvis.',
    pos: 'Lateral. Curvilinear probe parallel to the line from the posterior superior iliac spine to the greater trochanter, slid inferomedially until the iliac bone line breaks.',
    gets: 'Sciatic nerve, posterior femoral cutaneous nerve, and often the superior and inferior gluteal nerves and the nerve to quadratus femoris (the back of the hip).',
    misses: 'Femoral, obturator (not reliably) and lateral femoral cutaneous territories.',
    use: 'Hip and thigh surgery with a front-of-hip block; the most complete posterior cover.' },
  { id: 'tg', name: 'Transgluteal', y: 214, x: 190, ang: -4, inj: [180, 222],
    catches: ['sci', 'pfcn', 'ham'], href: '#sciatic-ap-tg', hrefText: 'Scan it',
    where: 'On the line from the ischial tuberosity to the greater trochanter, under gluteus maximus, on quadratus femoris.',
    pos: 'Lateral or prone. Curvilinear probe transverse between the two bones; the nerve is deep, deeper than at the crease.',
    gets: 'Sciatic nerve and, often, the posterior femoral cutaneous nerve close beside it (with the inferior gluteal vessels).',
    misses: 'The gluteal nerves and the back of the hip; everything from the lumbar plexus.',
    use: 'Above-knee amputation and thigh incisions: one needle for the back of the thigh.' },
  { id: 'sg', name: 'Subgluteal', y: 252, x: 192, ang: 0, inj: [188, 258],
    catches: ['sci', 'ham', 'pfcn-p'], href: '#sciatic-step-scan', hrefText: 'Scan it',
    where: 'At the gluteal crease, in the plane under gluteus maximus, between the ischial tuberosity and the femur.',
    pos: 'Lateral or prone (or supine with the leg lifted). Curvilinear probe transverse on the crease; the nerve is several centimetres deep, more in the obese.',
    gets: 'Sciatic nerve, hamstrings and much of the back of the knee joint; the posterior femoral cutaneous nerve only sometimes (a fascia separates them).',
    misses: 'Often the back of the thigh; the hip.',
    use: 'Most proximal sciatic needs; add a separate posterior femoral cutaneous injection for a thigh incision.' },
  { id: 'ant', name: 'Anterior', y: 292, x: 192, ang: 0, inj: [190, 296], front: true,
    catches: ['sci', 'ham-p'], href: '#sciatic-ap-ant', hrefText: 'Scan it',
    where: 'From the front, at the level of the lesser trochanter: behind adductor magnus, 6–8 cm deep.',
    pos: 'Supine. Curvilinear probe transverse on the anteromedial thigh; long needle from medial, past the femoral vessels.',
    gets: 'Sciatic nerve below the knee and some hamstring branches (the highest ones have already left).',
    misses: 'The back of the thigh: the posterior femoral cutaneous nerve runs separately at the back, under the fascia lata.',
    use: 'The patient who cannot turn: trauma, fixators, the very sick. Femoral and sciatic from one position.' },
  { id: 'pop', name: 'Popliteal', y: 500, x: 194, ang: 0, inj: [194, 504],
    catches: ['sci-bk'], href: '../foot-ankle/#ch-popliteal', hrefText: 'Popliteal block',
    where: 'At or just above the division into the tibial and common peroneal nerves, 5–10 cm above the popliteal crease.',
    pos: 'Lateral, prone or supine with the leg raised. Linear probe; the nerve is much shallower here.',
    gets: 'Everything below the knee except the saphenous strip; hamstrings and knee flexion spared.',
    misses: 'The skin of the back of the knee and thigh (posterior femoral cutaneous), the hamstrings, any thigh tourniquet; only part of the posterior knee joint.',
    use: 'Foot, ankle and below-knee surgery (with a saphenous block). The level to prefer when it is enough.' },
];
const NERVE_NAMES = {
  sci: 'Sciatic nerve', pfcn: 'Posterior femoral cutaneous nerve', 'pfcn-p': 'Posterior femoral cutaneous nerve (sometimes)', sgn: 'Superior gluteal nerve',
  ign: 'Inferior gluteal nerve', nqf: 'Nerve to quadratus femoris (back of the hip)', ham: 'Hamstring branches', 'ham-p': 'Lower hamstring branches', 'sci-bk': 'Tibial and common peroneal nerves',
};

function levelsFigure() {
  const wrap = el('figure', { class: 'th-lv', id: 'th-levels' });
  wrap.append(el('p', { class: 'th-fig-title', text: 'Where you block the sciatic nerve decides what you catch' }));
  const seg = el('div', { class: 'tb-seg th-lv-seg', role: 'group', 'aria-label': 'Choose a level' });
  const grid = el('div', { class: 'th-lv-grid' });
  const stage = el('div', { class: 'th-lv-stage' });
  const out = el('div', { class: 'th-lv-out', 'aria-live': 'polite' });
  grid.append(stage, out);
  wrap.append(seg, grid);

  const svg = sv('svg', { viewBox: '0 0 360 594', class: 'th-lv-svg', role: 'img', 'aria-labelledby': 'th-lv-t th-lv-d' });
  sv('title', { id: 'th-lv-t', text: 'The sciatic nerve from the pelvis to the knee, seen from behind, with five places to block it' }, svg);
  sv('desc', { id: 'th-lv-d', text: 'Back of the right hip and thigh, medial on the left. The sciatic nerve leaves the pelvis below piriformis, passes between the ischial tuberosity and the greater trochanter on quadratus femoris, runs down the back of the thigh giving branches to the hamstrings from its medial side, and divides above the knee. The posterior femoral cutaneous nerve runs beside it, medially and superficially, giving branches round the gluteal fold and to the perineum, then down the back of the thigh under the fascia. The superior gluteal nerve leaves above piriformis; the inferior gluteal nerve below it. Choosing a level moves the probe there and shows which nerves are blocked: everything downstream of the level fills with local anaesthetic.' }, svg);
  const defs = sv('defs', {}, svg);
  const clipSci = sv('clipPath', { id: 'th-lv-clip-sci' }, defs);
  const clipRectSci = sv('rect', { x: 0, y: 600, width: 360, height: 0 }, clipSci);
  const clipPf = sv('clipPath', { id: 'th-lv-clip-pf' }, defs);
  const clipRectPf = sv('rect', { x: 0, y: 600, width: 360, height: 0 }, clipPf);
  const clipTop = sv('clipPath', { id: 'th-lv-clip-top' }, defs);
  const clipRectTop = sv('rect', { x: 0, y: 600, width: 360, height: 0 }, clipTop);

  const g = sv('g', {}, svg);
  // skin outline (buttock and thigh)
  sv('path', { d: 'M30 0 L318 0 C334 50 342 120 334 176 C330 210 320 250 312 300 C302 380 292 470 286 580 L92 580 C88 500 82 420 76 360 C70 310 62 270 54 250 C44 244 36 240 30 236 Z', fill: SKIN, stroke: SKIN_EDGE, 'stroke-width': 1.4 }, g);
  // bones (faint): sacrum, ilium, ischial tuberosity, femur with trochanters
  const bone = { fill: '#fbf7ec', stroke: BONE_EDGE, 'stroke-width': 1.4 };
  sv('path', { d: 'M30 10 L78 10 C82 60 84 110 80 160 C76 190 66 214 50 228 L30 232 Z', ...bone, opacity: 0.9 }, g); // sacrum, coccyx
  sv('path', { d: 'M78 18 C140 6 230 4 300 22 C312 50 300 92 268 118 C236 136 214 148 196 150 C172 132 140 116 112 112 C96 100 84 70 78 18 Z', ...bone, opacity: 0.9 }, g); // ilium
  sv('path', { d: 'M196 150 C214 148 236 160 246 176 C236 186 214 186 196 178 Z', ...bone, opacity: 0.6 }, g); // acetabular rim (behind)
  sv('ellipse', { cx: 124, cy: 236, rx: 22, ry: 16, ...bone }, g); // ischial tuberosity
  sv('path', { d: 'M260 160 C284 150 312 160 316 186 C318 210 306 226 290 232 C282 268 270 330 258 410 C250 460 240 520 232 580 L204 580 C210 520 220 460 228 410 C238 340 250 270 254 226 C246 210 248 176 260 160 Z', ...bone }, g); // femur and greater trochanter
  sv('ellipse', { cx: 246, cy: 252, rx: 9, ry: 7, ...bone }, g); // lesser trochanter
  // muscles: piriformis, quadratus femoris (deep layer, gluteus maximus removed)
  const mus = { fill: MUSCLE, stroke: MUSCLE_EDGE, 'stroke-width': 1.1, opacity: 0.92 };
  sv('path', { d: 'M74 116 C120 128 210 146 296 170 L292 186 C210 168 120 158 72 150 Z', ...mus }, g); // piriformis
  sv('path', { d: 'M144 214 L258 206 L260 238 L144 244 Z', ...mus, opacity: 0.85 }, g); // quadratus femoris
  // gluteus maximus outline (dashed: imagine it lifted off)
  sv('path', { d: 'M40 30 C120 20 230 40 304 110 C318 170 306 230 268 270 C210 270 140 262 80 246', fill: 'none', stroke: MUSCLE_EDGE, 'stroke-width': 1.3, 'stroke-dasharray': '6 5' }, g);
  // gluteal fold
  sv('path', { d: 'M40 238 C90 258 166 264 226 246', fill: 'none', stroke: SKIN_EDGE, 'stroke-width': 1.4, 'stroke-dasharray': '3 4' }, g);
  // vessels: inferior gluteal artery with the PFCN
  sv('path', { d: 'M124 158 C140 170 156 176 172 174', fill: 'none', stroke: ART, 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0.85 }, g);

  // nerves (base layer)
  const base = sv('g', { class: 'th-lv-nerves' }, g);
  const n = {};
  n.sgn = nervePath(base, SGN, 3, { class: 'th-lv-n', 'data-n': 'sgn' });
  n.ign = nervePath(base, IGN, 2.6, { class: 'th-lv-n', 'data-n': 'ign' });
  n.nqf = nervePath(base, NQF, 2, { class: 'th-lv-n', 'data-n': 'nqf' });
  n.ham = nervePath(base, `${HAM1} ${HAM2}`, 2.4, { class: 'th-lv-n', 'data-n': 'ham' });
  n.sci = nervePath(base, `${SCI} ${TIB} ${CPN}`, 10, { class: 'th-lv-n', 'data-n': 'sci' });
  n.pfcn = nervePath(base, `${PFC} ${CLUN} ${PERI}`, 3.2, { class: 'th-lv-n', 'data-n': 'pfcn' });
  // the blocked (downstream) overlay: LA blue, revealed downwards from the level
  const ov = { fill: 'none', stroke: LA, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.85 };
  const oSci = sv('g', { 'clip-path': 'url(#th-lv-clip-sci)', class: 'th-lv-ov' }, g);
  sv('path', { d: `${SCI} ${TIB} ${CPN}`, ...ov, 'stroke-width': 5 }, oSci);
  const oHam = sv('path', { d: `${HAM1} ${HAM2}`, ...ov, 'stroke-width': 2.2 }, oSci);
  const oPf = sv('g', { 'clip-path': 'url(#th-lv-clip-pf)', class: 'th-lv-ov' }, g);
  sv('path', { d: `${PFC} ${CLUN} ${PERI}`, ...ov, 'stroke-width': 2.2 }, oPf);
  const oTop = sv('g', { 'clip-path': 'url(#th-lv-clip-top)', class: 'th-lv-ov' }, g);
  sv('path', { d: `${SGN} ${IGN} ${NQF}`, ...ov, 'stroke-width': 2 }, oTop);
  // labels
  const t = sv('g', { class: 'th-lv-labels' }, svg);
  txt(t, 158, 60, 'Ilium', { size: 13, fill: MUTED });
  txt(t, 34, 84, 'Sacrum', { size: 13, fill: MUTED, halo: true });
  txt(t, 86, 144, 'Piriformis', { size: 13, weight: 600, fill: '#4a2a20', halo: true });
  txt(t, 236, 92, 'Sup. gluteal n.', { size: 13, weight: 600, halo: true });
  txt(t, 212, 198, 'Inf. gluteal n.', { size: 13, weight: 600, halo: true });
  txt(t, 350, 152, 'Gr. trochanter', { size: 13, fill: MUTED, anchor: 'end', halo: true });
  txt(t, 110, 212, 'Ischium', { size: 12.5, fill: MUTED, anchor: 'middle', halo: true });
  txt(t, 228, 222, 'Quadratus', { size: 12.5, fill: '#4a2a20', anchor: 'middle', halo: true });
  txt(t, 228, 237, 'femoris', { size: 12.5, fill: '#4a2a20', anchor: 'middle', halo: true });
  txt(t, 202, 380, 'Sciatic', { size: 14, weight: 700, halo: true });
  txt(t, 108, 402, 'Posterior', { size: 13, weight: 600, anchor: 'end', halo: true, fill: INK });
  txt(t, 108, 418, 'femoral', { size: 13, weight: 600, anchor: 'end', halo: true, fill: INK });
  txt(t, 108, 434, 'cutaneous', { size: 13, weight: 600, anchor: 'end', halo: true, fill: INK });
  sv('path', { d: 'M112 414 L170 414', stroke: MUTED, 'stroke-width': 0.9, fill: 'none' }, t);
  txt(t, 126, 302, 'Hamstring branches', { size: 12.5, anchor: 'end', fill: MUTED, halo: true });
  txt(t, 8, 254, 'Gluteal fold', { size: 12.5, fill: MUTED, halo: true });
  txt(t, 186, 588, 'Tibial', { size: 13, weight: 600, anchor: 'end', halo: true });
  txt(t, 238, 560, 'Common peroneal', { size: 13, weight: 600, halo: true, anchor: 'start' });
  sv('text', { x: 10, y: 20, 'font-family': MONO, 'font-size': 12.5, fill: MUTED, text: '← MEDIAL' }, svg);
  sv('text', { x: 350, y: 20, 'text-anchor': 'end', 'font-family': MONO, 'font-size': 12.5, fill: MUTED, text: 'LATERAL →' }, svg);

  // probe and LA pulse
  const probe = sv('g', { class: 'th-lv-probe' }, svg);
  const body = sv('g', {}, probe);
  sv('rect', { x: -48, y: -7, width: 96, height: 14, rx: 2, fill: '#272722', stroke: '#fffaf0', 'stroke-width': 1.6 }, body);
  sv('circle', { cx: 40, cy: 0, r: 2.8, fill: '#fffaf0' }, body);
  const frontTag = txt(probe, 0, -14, 'from the front', { size: 12.5, anchor: 'middle', italic: true, fill: WINE, halo: true });
  const pulse = sv('circle', { r: 13, fill: LA, opacity: 0, class: 'th-lv-pulse' }, svg);
  svg.append(t); // labels above the probe, so the probe never hides a name (Piriformis, Quadratus femoris)
  stage.append(svg);

  let cur = null; let raf = 0;
  const tween = (rects, from, to, ms, done) => {
    cancelAnimationFrame(raf);
    if (reduced()) { rects.forEach((r) => r.setAttribute('height', String(to))); done?.(); return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.max(0, Math.min(1, (now - t0) / ms)); const e = 1 - Math.pow(1 - p, 3);
      rects.forEach((r) => r.setAttribute('height', String(from + (to - from) * e)));
      if (p < 1) raf = requestAnimationFrame(tick); else done?.();
    };
    raf = requestAnimationFrame(tick);
  };
  const btns = LEVELS.map((lv, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `th-lv-${lv.id}`, 'aria-pressed': 'false', text: lv.name, dataset: { activate: '1', scrollTo: 'th-levels' }, on: { click: () => choose(i) } }));
  btns.forEach((b) => seg.append(b));

  function choose(i) {
    const lv = LEVELS[i]; cur = i;
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    probe.style.transform = `translate(${lv.x}px, ${lv.y}px) rotate(${lv.ang}deg)`;
    frontTag.style.opacity = lv.front ? '1' : '0';
    body.style.opacity = lv.front ? '0.55' : '1';
    // reveal downstream nerves
    [clipRectSci, clipRectPf, clipRectTop].forEach((r) => { r.setAttribute('y', String(lv.y - 4)); r.setAttribute('height', '0'); });
    const pfOn = lv.catches.includes('pfcn') || lv.catches.includes('pfcn-p');
    clipRectPf.setAttribute('y', String(pfOn ? lv.y - 4 : 700));
    clipRectTop.setAttribute('y', String(lv.catches.includes('sgn') ? 90 : 700));
    oHam.style.opacity = lv.catches.some((c) => c.startsWith('ham')) ? (lv.catches.includes('ham-p') ? '0.35' : '0.8') : '0';
    oPf.style.opacity = lv.catches.includes('pfcn-p') ? '0.45' : '0.8';
    oPf.classList.toggle('th-lv-ov--patchy', lv.catches.includes('pfcn-p'));
    tween([clipRectSci, clipRectPf, clipRectTop], 0, 600, 1500);
    for (const [k, node] of Object.entries(n)) {
      const on = lv.catches.includes(k) || (k === 'pfcn' && lv.catches.includes('pfcn-p')) || (k === 'ham' && lv.catches.includes('ham-p')) || (k === 'sci' && lv.catches.includes('sci-bk'));
      node.classList.toggle('is-dim', !on);
    }
    pulse.setAttribute('cx', lv.inj[0]); pulse.setAttribute('cy', lv.inj[1]);
    pulse.classList.remove('is-on'); void pulse.getBoundingClientRect(); pulse.classList.add('is-on');
    out.replaceChildren();
    fill(out, `<p class="th-lv-k">Level ${i + 1} of ${LEVELS.length}</p><p class="th-lv-name">${lv.name}</p>
<dl class="th-dl"><div><dt>Where</dt><dd>${lv.where}</dd></div><div><dt>How</dt><dd>${lv.pos}</dd></div><div><dt>Catches</dt><dd>${lv.gets}</dd></div><div><dt>Misses</dt><dd>${lv.misses}</dd></div><div><dt>Use it for</dt><dd>${lv.use}</dd></div></dl>
<p class="th-lv-go"><a href="${lv.href}">${lv.hrefText} →</a></p>`);
    out.classList.remove('th-anim-in'); void out.offsetWidth; out.classList.add('th-anim-in');
    announce(`${lv.name}: ${lv.gets}`);
  }
  choose(2);
  wrap.append(fill(el('figcaption'), 'Schematic, back of the right hip and thigh with gluteus maximus lifted off (its outline dashed). Choose a level: the probe moves there and every nerve <strong>downstream</strong> fills with local anaesthetic (blue). Dimmed nerves are not blocked. The anterior approach reaches the nerve from the front at about the subgluteal level.'));
  registerSearch([{ title: 'Sciatic levels: parasacral, transgluteal, subgluteal, anterior, popliteal', text: 'parasacral transgluteal subgluteal anterior popliteal posterior femoral cutaneous gluteal nerves hamstring level which approach', id: 'th-levels' }]);
  return wrap;
}

// ================================================================== mid-thigh cross-section (used by the planner)
// Transverse section of the right thigh at mid-shaft, seen from below as on a CT: anterior at the top, lateral on the
// viewer's left, medial on the viewer's right. Nerves, compartments and skin arcs carry data-n keys so the planner can
// light them up.
export function thighSection() {
  const svg = sv('svg', { viewBox: '0 0 360 300', class: 'th-xs-svg', role: 'img', 'aria-label': 'Cross-section of the right mid-thigh, anterior at the top, lateral on the left. The shading shows which nerves the chosen blocks reach.' });
  const defs = sv('defs', {}, svg);
  const hatch = sv('pattern', { id: 'th-xs-h', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.18)' }, hatch);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#1d4f7c', 'stroke-width': 1.5 }, hatch);
  const cx = 180, cy = 150;
  sv('ellipse', { cx, cy, rx: 150, ry: 122, fill: SKIN, stroke: SKIN_EDGE, 'stroke-width': 1.5 }, svg);
  sv('ellipse', { cx, cy, rx: 140, ry: 112, fill: FAT, stroke: 'none' }, svg);
  // skin arcs by territory (thick strokes on the skin ring): lateral LFCN, anterior femoral, medial obturator + femoral, posterior PFCN
  const arc = (a0, a1) => {
    const pts = []; for (let i = 0; i <= 40; i++) { const a = ((a0 + (a1 - a0) * (i / 40)) * Math.PI) / 180; pts.push([cx + 145 * Math.cos(a), cy + 117 * Math.sin(a)]); }
    return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}`;
  };
  const skinG = sv('g', { class: 'th-xs-skin' }, svg);
  const skins = [
    { n: 'lfcn', d: arc(150, 215) }, { n: 'fem', d: arc(215, 325) }, { n: 'obt', d: arc(325, 390) }, { n: 'pfcn', d: arc(30, 150) },
  ];
  skins.forEach((s) => sv('path', { d: s.d, fill: 'none', stroke: 'transparent', 'stroke-width': 9, class: 'th-xs-arc', 'data-n': s.n }, skinG));
  // fascia lata
  sv('ellipse', { cx, cy, rx: 126, ry: 98, fill: '#ead9cf', stroke: '#9c8a64', 'stroke-width': 1.2 }, svg);
  // compartments (shaded by the planner)
  const comp = sv('g', {}, svg);
  const ant = 'M70 118 C80 74 130 54 190 54 C240 54 280 74 296 112 C270 128 240 134 214 128 C196 120 170 118 150 124 C120 132 92 132 70 118 Z';
  const med = 'M296 112 C306 138 304 176 290 206 C270 218 246 214 230 200 C224 178 222 150 214 128 C240 134 270 128 296 112 Z';
  const post = 'M70 118 C92 132 120 132 150 124 C170 118 196 120 214 128 C222 150 224 178 230 200 C246 214 270 218 290 206 C270 236 230 248 180 248 C120 248 72 226 60 186 C54 162 58 136 70 118 Z';
  const cAnt = sv('path', { d: ant, fill: MUSCLE, stroke: MUSCLE_EDGE, 'stroke-width': 1, class: 'th-xs-comp', 'data-n': 'fem' }, comp);
  const cMed = sv('path', { d: med, fill: '#cf9282', stroke: MUSCLE_EDGE, 'stroke-width': 1, class: 'th-xs-comp', 'data-n': 'obt' }, comp);
  const cPost = sv('path', { d: post, fill: '#c98a78', stroke: MUSCLE_EDGE, 'stroke-width': 1, class: 'th-xs-comp', 'data-n': 'sci' }, comp);
  void cAnt; void cMed; void cPost;
  // muscle names
  const ml = sv('g', {}, svg);
  txt(ml, 182, 80, 'Quadriceps', { size: 13, weight: 600, anchor: 'middle', fill: '#4a2a20', halo: true });
  txt(ml, 276, 177, 'Adductors', { size: 13, weight: 600, anchor: 'middle', fill: '#4a2a20', halo: true });
  txt(ml, 92, 224, 'Hamstrings', { size: 13, weight: 600, anchor: 'middle', fill: '#4a2a20', halo: true });
  // femur
  sv('circle', { cx: 160, cy: 142, r: 24, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 3 }, svg);
  sv('circle', { cx: 160, cy: 142, r: 12, fill: '#efe2c4', stroke: BONE_EDGE, 'stroke-width': 1 }, svg);
  const femurRing = sv('circle', { cx: 160, cy: 142, r: 28, fill: 'none', stroke: 'transparent', 'stroke-width': 5, class: 'th-xs-bone' }, svg);
  txt(svg, 160, 147, 'Femur', { size: 12.5, anchor: 'middle', fill: MUTED });
  // sartorius and the adductor canal
  sv('ellipse', { cx: 262, cy: 130, rx: 18, ry: 13, fill: '#d9a493', stroke: MUSCLE_EDGE, 'stroke-width': 1 }, svg);
  sv('circle', { cx: 240, cy: 152, r: 5.5, fill: ART, stroke: '#7a1f15', 'stroke-width': 1 }, svg);
  sv('circle', { cx: 232, cy: 162, r: 6, fill: VEIN, stroke: '#1d3a63', 'stroke-width': 1 }, svg);
  sv('circle', { cx: 200, cy: 170, r: 4, fill: ART, stroke: '#7a1f15', 'stroke-width': 1 }, svg); // profunda
  sv('path', { d: 'M266 124 L292 104', stroke: MUTED, 'stroke-width': 0.8, fill: 'none' }, svg);
  txt(svg, 296, 100, 'Sartorius', { size: 12.5, weight: 600, anchor: 'start', fill: '#4a2a20', halo: true });
  sv('path', { d: 'M233 168 L236 202', stroke: MUTED, 'stroke-width': 0.8, fill: 'none' }, svg);
  txt(svg, 238, 216, 'Femoral a./v.', { size: 12.5, weight: 600, anchor: 'middle', halo: true });
  // nerves (dots)
  const nerves = sv('g', {}, svg);
  const dot = (x, y, r, key, label, lab, anchor = 'start') => {
    const gg = sv('g', { class: 'th-xs-n', 'data-n': key }, nerves);
    sv('circle', { cx: x, cy: y, r: r + 5, fill: LA, opacity: 0, class: 'th-xs-halo' }, gg);
    sv('circle', { cx: x, cy: y, r, fill: NERVE, stroke: NERVE_EDGE, 'stroke-width': 1.3 }, gg);
    if (label) {
      if (lab) sv('path', { d: `M${x} ${y} L${lab[0]} ${lab[1] - 4}`, stroke: MUTED, 'stroke-width': 0.8, fill: 'none' }, gg);
      txt(gg, lab ? lab[0] : x + r + 3, lab ? lab[1] : y + 4, label, { size: 12.5, anchor, weight: 600, halo: true });
    }
    return gg;
  };
  dot(252, 148, 3.6, 'fem', 'Saphenous', [222, 110], 'middle');
  dot(226, 140, 3, 'fem', '', null);
  dot(150, 45, 3, 'fem', 'Femoral cutaneous', [150, 18], 'middle');
  dot(214, 46, 3, 'fem', '', null);
  dot(46, 120, 3, 'lfcn', 'LFCN', [16, 92]);
  dot(54, 178, 2.6, 'lfcn', '', null);
  dot(318, 168, 2.8, 'obt', 'Obturator', [350, 222], 'end');
  dot(278, 196, 3, 'obt', '', null);
  dot(160, 210, 8, 'sci', 'Sciatic', [106, 262], 'middle');
  dot(186, 262, 3.2, 'pfcn', 'PFCN', [236, 286]);
  sv('text', { x: 6, y: 296, 'font-family': MONO, 'font-size': 12.5, fill: MUTED, text: 'LATERAL' }, svg);
  sv('text', { x: 354, y: 296, 'text-anchor': 'end', 'font-family': MONO, 'font-size': 12.5, fill: MUTED, text: 'MEDIAL' }, svg);
  sv('text', { x: 354, y: 14, 'text-anchor': 'end', 'font-family': MONO, 'font-size': 12.5, fill: MUTED, text: 'ANTERIOR ↑' }, svg);
  /** set({key: level}) where level is 1 (blocked), 0.5 (patchy) or 0; gaps: keys needed but not covered */
  function set(levels, gaps = []) {
    svg.querySelectorAll('[data-n]').forEach((node) => {
      const k = node.getAttribute('data-n'); const v = levels[k] || 0; const gap = gaps.includes(k);
      node.classList.toggle('is-on', v >= 1); node.classList.toggle('is-part', v > 0 && v < 1); node.classList.toggle('is-gap', gap && v === 0);
      if (node.classList.contains('th-xs-arc')) node.setAttribute('stroke', v >= 1 ? LA : v > 0 ? 'url(#th-xs-h)' : gap ? WINE : 'transparent');
      if (node.classList.contains('th-xs-comp')) node.setAttribute('data-shade', v >= 1 ? 'on' : v > 0 ? 'part' : gap ? 'gap' : 'off');
    });
    const boneV = Math.min(levels.fem || 0, levels.sci || 0, levels.obt || 0);
    const boneAny = (levels.fem || 0) + (levels.sci || 0) + (levels.obt || 0);
    femurRing.setAttribute('stroke', boneV >= 1 ? LA : boneAny > 0 ? 'url(#th-xs-h)' : 'transparent');
  }
  return { svg, set };
}

// ================================================================== the chapter
export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'th-anat-h', text: 'Anatomy: the sciatic nerve and who supplies the thigh' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'The thigh is five nerves wide: <strong>femoral</strong> in front, <strong>obturator</strong> on the inside, <strong>lateral femoral cutaneous</strong> on the outside, and at the back two: the <strong>sciatic nerve</strong> for muscle and bone and the <strong>posterior femoral cutaneous nerve</strong> for the skin. Every thigh plan starts here.'));
  sec.append(keyPoints([
    'The sciatic nerve (L4–S3) is the biggest nerve in the body: two nerves (tibial and common peroneal) in one sheath.',
    'It leaves the pelvis below piriformis, passes midway between the ischial tuberosity and the greater trochanter, then runs down the back of the thigh on adductor magnus.',
    'It has no skin branches in the thigh. The back of the thigh is the posterior femoral cutaneous nerve (S1–S3), a separate sacral plexus branch that runs beside it in the buttock and parts company at the gluteal fold.',
    'Hamstring branches leave its medial side high in the thigh: a popliteal block spares them, a subgluteal block does not.',
    'The higher you block, the more you catch; the lower you block, the shallower and safer it is.',
  ], { title: 'Rapid fire' }));

  sec.append(el('h3', { id: 'th-anat-course', text: 'The course, level by level' }));
  sec.append(levelsFigure());
  sec.append(table({
    caption: 'The sciatic nerve from the pelvis to the knee',
    head: ['Region', 'Relations', 'What leaves here'],
    rows: [
      [{ th: true, html: 'Pelvis' }, 'Formed on piriformis from L4–S3 (the lumbosacral trunk, L4–L5, joins S1–S3)', 'Superior gluteal (L4–S1) above piriformis'],
      [{ th: true, html: 'Greater sciatic foramen' }, 'Below piriformis, with the posterior femoral cutaneous nerve, inferior gluteal nerve and vessels; pudendal nerve and internal pudendal vessels medially', 'Inferior gluteal (L5–S2), posterior femoral cutaneous (S1–S3), nerve to quadratus femoris (back of the hip)'],
      [{ th: true, html: 'Buttock' }, 'Under gluteus maximus; on the ischium, gemelli, obturator internus and quadratus femoris; midway between the ischial tuberosity and greater trochanter, nearer the ischium', 'Articular branches to the hip (posterior capsule)'],
      [{ th: true, html: 'Thigh' }, 'On adductor magnus, crossed superficially by the long head of biceps femoris; between biceps (lateral) and semitendinosus and semimembranosus (medial) lower down', 'Hamstrings and the hamstring part of adductor magnus (tibial division); short head of biceps (peroneal division)'],
      [{ th: true, html: 'Popliteal apex' }, 'Divides into tibial and common peroneal nerves, at a variable level (high in about one in ten)', 'Tibial and common peroneal: everything below the knee except the saphenous strip'],
    ],
  }));

  sec.append(el('h3', { id: 'th-anat-pfcn', text: 'The posterior femoral cutaneous nerve' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>A purely sensory nerve from <strong>S1–S3</strong>. It is a branch of the sacral plexus, not of the sciatic nerve: it leaves the pelvis with the sciatic nerve below piriformis and runs down under gluteus maximus <strong>superficial</strong> to it, beside the inferior gluteal vessels. High in the buttock it lies medial to the sciatic nerve; at the gluteal crease its side varies and on ultrasound it is often slightly lateral. At the gluteal fold it gives <strong>inferior cluneal</strong> branches (the lower buttock) and a <strong>perineal</strong> branch, then runs <strong>under the fascia lata</strong> down the middle of the back of the thigh, piercing it in branches to the skin as far as the popliteal fossa and often the upper calf.</p>
<p><strong>Why it matters:</strong> at the gluteal crease a thin fascia separates it from the sciatic nerve, so a subgluteal sciatic injection often misses it. Higher up (transgluteal, parasacral) one injection catches both. For an above-knee amputation its territory is the posterior flap.</p>`));

  sec.append(el('h3', { id: 'th-anat-skin', text: 'Who supplies the thigh' }));
  sec.append(legViewsFigure({
    id: 'th-skin-fig', title: 'Skin of the thigh, front and back',
    views: [
      { view: 'front', tint: true, labels: true, areas: [{ zones: ['lfcn', 'femoral-ant', 'genitofemoral', 'ilioinguinal', 'obturator', 'saphenous-knee'], density: 'dense' }], caption: 'Front' },
      { view: 'back', tint: true, labels: true, areas: [{ zones: ['cluneal', 'pfcn', 'lfcn', 'obturator', 'femoral-ant'], density: 'dense' }], caption: 'Back' },
    ],
    caption: 'Schematic territories (they vary and overlap). LFCN: lateral femoral cutaneous; Femoral: its anterior cutaneous branches; Obt: obturator (a variable, often small medial patch); GF: genitofemoral; II: ilioinguinal; PFCN: posterior femoral cutaneous; Saph: saphenous (infrapatellar).',
  }));
  sec.append(table({
    caption: 'The thigh by tissue',
    head: ['Tissue', 'Nerves'],
    rows: [
      [{ th: true, html: 'Skin, front' }, 'Femoral (intermediate and medial femoral cutaneous); genitofemoral and ilioinguinal near the groin'],
      [{ th: true, html: 'Skin, outer side' }, 'Lateral femoral cutaneous (L2–L3)'],
      [{ th: true, html: 'Skin, inner side' }, 'Medial femoral cutaneous (femoral) and the obturator cutaneous branch (variable, absent in many)'],
      [{ th: true, html: 'Skin, back' }, 'Posterior femoral cutaneous (S1–S3)'],
      [{ th: true, html: 'Quadriceps and sartorius' }, 'Femoral'],
      [{ th: true, html: 'Adductors and gracilis' }, 'Obturator (adductor magnus also sciatic)'],
      [{ th: true, html: 'Hamstrings' }, 'Sciatic'],
      [{ th: true, html: 'Femur (periosteum and marrow)' }, 'Femoral, sciatic and obturator branches, varying along the bone: no single block numbs it'],
    ],
  }));
  sec.append(callout('key', {
    title: 'The consequence',
    body: 'Cut across the thigh and you cut <strong>five nerves</strong>: femoral, obturator, lateral femoral cutaneous, sciatic and posterior femoral cutaneous. The <a href="#ch-amputation">amputation planner</a> builds the set and counts the dose.',
  }));
  registerSearch([{ title: 'Thigh innervation', text: 'thigh skin femoral obturator lateral femoral cutaneous posterior femoral cutaneous cluneal genitofemoral ilioinguinal femur periosteum hamstrings quadriceps adductors', id: 'th-anat-skin' }]);
}
