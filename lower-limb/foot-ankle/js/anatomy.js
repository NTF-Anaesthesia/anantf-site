// Foot and ankle page: the anatomy chapter (sciatic division, the five nerves at the ankle, tourniquets, foot drop and
// falls, heel protection) and the "plan by operation" chapter. Also exports the interactive ankle cross-section used
// by the ankle block chapter (landmark technique). Original schematic drawings (SVG), not traced from any published
// figure. Clinical colours: nerves yellow, arteries red, veins blue, local anaesthetic blue.
import { el, sv, fill, keyPoints, callout, table, registerSearch } from '../../../shared/regional/js/ui.js';
import * as LEG from '../../../shared/regional/js/figures/leg.js';

const NERVE = '#e2b21c', NERVE_EDGE = '#7a5c00', ART = '#c0392b', VEIN = '#2f5d9e', LA = '#2c74b3';
const INK = '#272722', MUTED = '#55534d', BONE = '#f6f0e2', BONE_EDGE = '#8f7f5c', MUSCLE = '#d49a88', MUSCLE_EDGE = '#a8695a';
const TENDON = '#efe6d2', TENDON_EDGE = '#9d8c6a', FAT = '#f3e2bf', SKIN = '#e7c0a3';
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const SANS = 'NTF Sans, Inter, sans-serif', MONO = 'NTF Mono, JetBrains Mono, monospace';

function nervePath(g, d, w = 4, dash) {
  const extra = dash ? { 'stroke-dasharray': dash } : {};
  sv('path', { d, fill: 'none', stroke: NERVE_EDGE, 'stroke-width': w + 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);
  return sv('path', { d, fill: 'none', stroke: NERVE, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra }, g);
}
const txt = (g, x, y, s, o = {}) => sv('text', { x, y, 'font-family': SANS, 'font-size': o.size || 14, fill: o.fill || INK, 'text-anchor': o.anchor || 'start', 'font-weight': o.weight || 400, ...(o.italic ? { 'font-style': 'italic' } : {}), text: s }, g);

function figure(id, title, node, caption, extra) {
  const f = el('figure', { class: 'fa-fig', id });
  f.append(el('p', { class: 'fa-fig-title', text: title }), el('div', { class: 'fa-fig-stage' }, node));
  if (extra) f.append(extra);
  if (caption) f.append(fill(el('figcaption'), caption));
  return f;
}

// ================================================================== the popliteal fossa (posterior view, right knee)
// Back view: medial on the viewer's left, lateral on the right. An animated probe slides up from the crease to the
// bifurcation (the scanning manoeuvre); it stops with reduced motion.
function fossaFigure() {
  const svg = sv('svg', { viewBox: '0 0 360 420', class: 'fa-fig-svg', role: 'img', 'aria-labelledby': 'fa-fos-t fa-fos-d' });
  sv('title', { id: 'fa-fos-t', text: 'The right popliteal fossa from behind, with the sciatic nerve dividing' }, svg);
  sv('desc', { id: 'fa-fos-d', text: 'Back of the right knee, medial on the left. The fossa is a diamond: semitendinosus and semimembranosus above and medially, biceps femoris above and laterally, the two heads of gastrocnemius below. The sciatic nerve comes down the middle of the back of the thigh and divides near the apex of the fossa: the tibial nerve continues straight down the middle; the common peroneal nerve follows the medial edge of biceps femoris to the head of the fibula and winds round its neck. The popliteal vessels lie deep to the nerves. The sural nerve forms from a tibial branch and a peroneal branch. An animated probe slides up from the crease to the division.' }, svg);
  const g = sv('g', {}, svg);
  // limb outline
  sv('path', { d: 'M70 0 L290 0 C300 90 306 180 302 250 C300 290 292 330 280 420 L80 420 C68 330 60 290 58 250 C54 180 60 90 70 0 Z', fill: '#f1e3cf', stroke: '#b98d6e', 'stroke-width': 1.4 }, g);
  // fossa fat (diamond)
  sv('path', { d: 'M180 96 C204 130 238 180 244 250 C230 290 206 316 180 330 C154 316 130 290 116 250 C122 180 156 130 180 96 Z', fill: FAT, stroke: 'none' }, g);
  // muscles
  const mus = { fill: MUSCLE, stroke: MUSCLE_EDGE, 'stroke-width': 1.2, opacity: 0.92 };
  sv('path', { d: 'M72 0 L170 0 C172 50 168 90 160 120 C144 160 128 200 118 250 C104 248 90 240 80 228 C70 170 66 90 72 0 Z', ...mus }, g); // semimembranosus
  sv('path', { d: 'M108 0 L150 0 C150 60 140 120 124 170 C114 200 106 230 102 252 L92 248 C96 200 104 150 110 100 C112 60 110 30 108 0 Z', fill: '#c98a78', stroke: MUSCLE_EDGE, 'stroke-width': 1 }, g); // semitendinosus
  sv('path', { d: 'M190 0 L288 0 C296 80 300 160 296 230 C290 262 282 284 272 300 C262 280 252 262 244 250 C236 190 214 140 198 112 C192 80 190 40 190 0 Z', ...mus }, g); // biceps femoris
  sv('path', { d: 'M118 252 C134 290 156 314 178 334 C172 360 160 392 150 420 L88 420 C84 380 86 330 96 290 C102 272 108 260 118 252 Z', ...mus }, g); // medial gastrocnemius
  sv('path', { d: 'M242 252 C228 290 206 314 184 334 C190 360 200 392 208 420 L270 420 C276 380 276 330 266 296 C260 278 252 262 242 252 Z', ...mus }, g); // lateral gastrocnemius
  sv('circle', { cx: 278, cy: 312, r: 11, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 1.6 }, g); // fibular head
  // vessels (deep): artery enters from the adductor hiatus medially
  sv('path', { d: 'M132 40 C150 100 166 160 172 220 C174 270 176 320 178 420', fill: 'none', stroke: VEIN, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.85 }, g);
  sv('path', { d: 'M124 40 C142 100 158 160 165 220 C168 270 170 320 172 420', fill: 'none', stroke: ART, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0.9 }, g);
  // nerves
  nervePath(g, 'M182 0 C182 50 182 100 182 150', 9); // sciatic
  nervePath(g, 'M182 150 C182 220 182 300 182 420', 6); // tibial
  nervePath(g, 'M184 150 C206 186 232 226 252 262 C262 280 270 296 276 304', 4.5); // common peroneal
  nervePath(g, 'M276 304 C282 318 280 330 268 336', 3.5, '5 3'); // round the fibular neck (front)
  nervePath(g, 'M182 250 C186 300 194 340 204 380 C210 400 214 410 216 420', 2); // medial sural cutaneous -> sural
  nervePath(g, 'M258 274 C246 310 226 344 206 374', 1.8); // sural communicating (peroneal)
  // crease
  sv('line', { x1: 60, y1: 262, x2: 300, y2: 262, stroke: '#8f7f5c', 'stroke-width': 1.2, 'stroke-dasharray': '6 5' }, g);
  // animated probe
  const pr = sv('g', { class: 'fa-fos-probe' }, svg);
  sv('rect', { x: 128, y: -6, width: 108, height: 12, rx: 2, fill: '#272722', stroke: '#fffaf0', 'stroke-width': 1.5 }, pr);
  sv('circle', { cx: 228, cy: 0, r: 2.6, fill: '#fffaf0' }, pr);
  // labels
  const t = sv('g', {}, svg);
  txt(t, 96, 96, 'SM', { size: 13, weight: 600, fill: '#4a2a20' }); txt(t, 112, 30, 'ST', { size: 13, weight: 600, fill: '#4a2a20' });
  txt(t, 250, 96, 'BF', { size: 13, weight: 600, fill: '#4a2a20' });
  txt(t, 112, 372, 'MG', { size: 13, weight: 600, fill: '#4a2a20' }); txt(t, 230, 372, 'LG', { size: 13, weight: 600, fill: '#4a2a20' });
  txt(t, 188, 78, 'Sciatic', { weight: 600 });
  txt(t, 188, 300, 'Tibial', { weight: 600 }); txt(t, 216, 176, 'Common peroneal', { weight: 600, size: 13 });
  txt(t, 294, 300, 'Fibula', { size: 13, fill: MUTED });
  txt(t, 220, 396, 'Sural', { weight: 600, size: 13 });
  txt(t, 64, 280, 'Popliteal crease', { size: 12.5, fill: MUTED });
  txt(t, 116, 140, 'A', { size: 13, fill: ART, weight: 600 }); txt(t, 146, 134, 'V', { size: 13, fill: VEIN, weight: 600 });
  sv('text', { x: 12, y: 412, 'font-family': MONO, 'font-size': 13, fill: MUTED, text: '← MEDIAL' }, svg);
  sv('text', { x: 348, y: 412, 'text-anchor': 'end', 'font-family': MONO, 'font-size': 13, fill: MUTED, text: 'LATERAL →' }, svg);
  // probe motion: crease (y 262) up to the division (y 150), hold, repeat
  let raf = 0; let t0 = 0; let seen = false;
  const place = (y) => pr.setAttribute('transform', `translate(0 ${y.toFixed(1)})`);
  place(reduced() ? 156 : 256);
  const tick = (ts) => {
    if (!t0) t0 = ts;
    const p = ((ts - t0) % 6000) / 6000;
    const e = p < 0.15 ? 0 : p < 0.7 ? (p - 0.15) / 0.55 : 1;
    const s = e * e * (3 - 2 * e);
    place(256 - s * 100);
    raf = requestAnimationFrame(tick);
  };
  if (!reduced() && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((ents) => {
      const vis = ents.some((x) => x.isIntersecting);
      if (vis && !seen) { seen = true; t0 = 0; raf = requestAnimationFrame(tick); }
      if (!vis && seen) { seen = false; cancelAnimationFrame(raf); }
    });
    io.observe(svg);
  }
  return svg;
}

// ================================================================== the ankle in cross-section (five nerves)
// Transverse section of the right ankle just above the malleoli, seen from below (as on a CT): anterior at the top,
// lateral (fibula) on the viewer's left, medial (medial malleolus) on the viewer's right.
const C = { cx: 180, cy: 150, rx: 140, ry: 112 }; // skin
const SUB = { rx: 127, ry: 100 };                 // subcutaneous plane (where the superficial nerves run)
const onRing = (deg, k = 1) => { const a = (deg * Math.PI) / 180; return [C.cx + SUB.rx * k * Math.cos(a), C.cy + SUB.ry * k * Math.sin(a)]; };
const arcPath = (d0, d1, k = 1, n = 30) => {
  const pts = Array.from({ length: n + 1 }, (_, i) => onRing(d0 + ((d1 - d0) * i) / n, k));
  return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L')}`;
};

export const ANKLE_NERVES = [
  { id: 'tib', name: 'Tibial (posterior tibial)', short: 'Tibial', parent: 'Sciatic (tibial division), L4–S3', deep: true, at: [228, 226], r: 9.5,
    entry: [246, 254], tip: [232, 235], zones: ['tibial-sole', 'calcaneal'],
    skin: 'The sole and the undersides and nail beds of the toes (medial and lateral plantar nerves); the heel (medial calcaneal branches, which may leave above the ankle).',
    where: 'Deep, behind the medial malleolus, under the flexor retinaculum, just <strong>posterior to the posterior tibial artery</strong>. Order from the front: tibialis posterior, flexor digitorum longus, artery, nerve, flexor hallucis longus.',
    landmark: 'Feel the posterior tibial pulse behind the medial malleolus. Enter just behind it (between the pulse and the Achilles tendon), aim at the back of the tibia, passing behind the artery, not through it; if you touch bone, withdraw 1–2 mm. Aspirate.',
    us: '5 ml (block it first: slowest onset)', lm: '5 ml' },
  { id: 'dpn', name: 'Deep peroneal (deep fibular)', short: 'Deep peroneal', parent: 'Common peroneal, L4–S1', deep: true, at: [180, 82], r: 6,
    entry: [174, 40], tip: [176, 76], zones: ['deep-peroneal'],
    skin: 'The first web space only. Deep: the ankle and tarsal joints, and the short toe extensors.',
    where: 'Deep, on the tibia under the extensor retinaculum, <strong>beside the anterior tibial artery</strong> (dorsalis pedis below the joint), between extensor hallucis longus and extensor digitorum longus. Usually lateral to the artery, but it can be medial.',
    landmark: 'Find extensor hallucis longus (lift the big toe) and the dorsalis pedis pulse lateral to it. Enter just lateral to the pulse, down to bone, back 1–2 mm, aspirate. No pulse? Fan a little either side of the line between the tendons.',
    us: '3 ml', lm: '3–5 ml' },
  { id: 'spn', name: 'Superficial peroneal (superficial fibular)', short: 'Superficial peroneal', parent: 'Common peroneal, L4–S1', deep: false, at: onRing(-128), r: 5,
    ring: [-90, -165], entry: onRing(-90, 1.1), zones: ['sup-peroneal'],
    skin: 'Most of the top of the foot and toes, except the first web space (deep peroneal) and the outer border (sural).',
    where: 'Superficial. Pierces the deep fascia in the lower third of the leg, over the groove between peroneus brevis and extensor digitorum longus, and divides into branches in the fat on the front of the ankle.',
    landmark: 'A subcutaneous ring from the <strong>front of the tibia to the lateral malleolus</strong>, just above the ankle.',
    us: '3 ml (10 cm above the lateral malleolus)', lm: '5 ml as a ring' },
  { id: 'sur', name: 'Sural', short: 'Sural', parent: 'Tibial and common peroneal branches, S1–S2', deep: false, at: onRing(128), r: 5,
    ring: [165, 108], entry: onRing(165, 1.1), zones: ['sural-foot'], vein: onRing(138),
    skin: 'The lateral malleolus, the outer heel and the outer border of the foot to the little toe.',
    where: 'Superficial, with the <strong>small saphenous vein</strong>, between the lateral malleolus and the Achilles tendon.',
    landmark: 'A subcutaneous ring from the <strong>lateral malleolus to the Achilles tendon</strong>.',
    us: '3 ml', lm: '5 ml as a ring' },
  { id: 'sap', name: 'Saphenous', short: 'Saphenous', parent: 'Femoral, L3–L4 (not sciatic)', deep: false, at: onRing(-28), r: 5,
    ring: [-8, -72], entry: onRing(-8, 1.1), zones: ['saphenous-foot'], vein: onRing(-38),
    skin: 'The medial malleolus and the inner side of the foot, usually ending at the medial midfoot, short of the first tarsometatarsal joint (well short of the big toe).',
    where: 'Superficial, beside the <strong>great saphenous vein</strong>, in front of the medial malleolus.',
    landmark: 'A subcutaneous ring from the <strong>medial malleolus to the front of the ankle</strong>, around the vein (aspirate).',
    us: '3 ml', lm: '3–5 ml as a ring' },
];

/**
 * ankleSection({idPrefix, mode}) -> element. mode 'explore' (anatomy: tap a nerve to see it and its skin) or
 * 'landmark' (the ankle block: each nerve shows the needle and the local anaesthetic, Play runs all five in order).
 */
export function ankleSection({ idPrefix = 'fa-xs', mode = 'explore' } = {}) {
  const landmark = mode === 'landmark';
  const wrap = el('div', { class: `fa-xs fa-xs--${mode}`, id: idPrefix });
  const svg = sv('svg', { viewBox: '0 0 360 300', class: 'fa-xs-svg', role: 'img', 'aria-labelledby': `${idPrefix}-t ${idPrefix}-d` });
  sv('title', { id: `${idPrefix}-t`, text: 'Cross-section of the right ankle just above the malleoli, with the five nerves of the ankle block' }, svg);
  sv('desc', { id: `${idPrefix}-d`, text: 'Seen from below: anterior at the top, lateral (fibula) on the left, medial (tibia and medial malleolus) on the right. Deep nerves: the tibial nerve behind the medial malleolus, posterior to the posterior tibial artery; the deep peroneal nerve at the front on the tibia beside the anterior tibial artery, between extensor hallucis longus and extensor digitorum longus. Superficial nerves in the fat under the skin: the superficial peroneal nerve anterolaterally, the sural nerve with the small saphenous vein posterolaterally, and the saphenous nerve with the great saphenous vein anteromedially.' }, svg);
  const g = sv('g', {}, svg);
  // skin and fat
  const skinD = `M${C.cx - C.rx} ${C.cy} A${C.rx} ${C.ry} 0 1 1 ${C.cx + C.rx} ${C.cy} A${C.rx} ${C.ry} 0 1 1 ${C.cx - C.rx} ${C.cy} Z`;
  sv('path', { d: skinD, fill: FAT, stroke: '#b98d6e', 'stroke-width': 4 }, g);
  sv('ellipse', { cx: C.cx, cy: C.cy, rx: SUB.rx - 8, ry: SUB.ry - 8, fill: '#ead7b8', stroke: '#c9b48c', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g); // deep fascia
  // bones
  sv('path', { d: 'M128 128 C132 104 160 92 196 92 C232 92 268 100 288 120 C300 134 302 156 292 172 C276 190 246 192 222 188 C196 186 168 184 148 176 C132 168 124 148 128 128 Z', fill: BONE, stroke: BONE_EDGE, 'stroke-width': 2 }, g);
  sv('ellipse', { cx: 90, cy: 166, rx: 22, ry: 21, fill: BONE, stroke: BONE_EDGE, 'stroke-width': 2 }, g);
  // tendons and muscle
  const tend = (cx, cy, rx, ry, label, lx, ly, anchor) => { sv('ellipse', { cx, cy, rx, ry, fill: TENDON, stroke: TENDON_EDGE, 'stroke-width': 1.2 }, g); if (label) txt(g, lx ?? cx, ly ?? cy + 4, label, { size: 13, fill: MUTED, anchor: anchor || 'middle' }); };
  tend(252, 74, 12, 9, 'TA', 252, 78); tend(210, 68, 10, 8, 'EHL', 214, 54); tend(146, 72, 13, 9, 'EDL', 146, 76); tend(112, 90, 9, 7);
  tend(292, 194, 9, 8, 'TP', 292, 198); tend(270, 210, 7, 6, 'FDL', 268, 196);
  sv('ellipse', { cx: 206, cy: 210, rx: 18, ry: 11, fill: MUSCLE, stroke: MUSCLE_EDGE, 'stroke-width': 1.2 }, g); txt(g, 196, 214, 'FHL', { size: 13, anchor: 'middle', fill: '#4a2a20' });
  sv('ellipse', { cx: 104, cy: 198, rx: 9, ry: 8, fill: TENDON, stroke: TENDON_EDGE }, g); sv('ellipse', { cx: 120, cy: 208, rx: 9, ry: 7, fill: TENDON, stroke: TENDON_EDGE }, g); // peroneal tendons, behind the lateral malleolus
  sv('ellipse', { cx: 176, cy: 228, rx: 26, ry: 12, fill: '#f6e9c9', stroke: 'none' }, g); // Kager
  sv('path', { d: 'M142 246 C156 238 198 238 214 246 C206 256 156 258 142 246 Z', fill: TENDON, stroke: TENDON_EDGE, 'stroke-width': 1.4 }, g); // Achilles
  // vessels
  sv('circle', { cx: 194, cy: 82, r: 5, fill: ART, stroke: '#7d1d14' }, g); // anterior tibial artery
  sv('circle', { cx: 250, cy: 220, r: 5.5, fill: ART, stroke: '#7d1d14' }, g); // posterior tibial artery
  sv('circle', { cx: 258, cy: 214, r: 3, fill: VEIN }, g); sv('circle', { cx: 244, cy: 228, r: 3, fill: VEIN }, g);
  const sap = ANKLE_NERVES.find((n) => n.id === 'sap'), sur = ANKLE_NERVES.find((n) => n.id === 'sur');
  sv('circle', { cx: sap.vein[0], cy: sap.vein[1], r: 6.5, fill: VEIN, stroke: '#163f7a' }, g);
  sv('circle', { cx: sur.vein[0], cy: sur.vein[1], r: 5.5, fill: VEIN, stroke: '#163f7a' }, g);
  // LA layer (under nerves)
  const laG = sv('g', { class: 'fa-xs-la' }, g);
  // nerves
  const nEls = {};
  ANKLE_NERVES.forEach((n) => {
    const ng = sv('g', { class: 'fa-xs-n', 'data-n': n.id }, g);
    const halo = sv('circle', { cx: n.at[0], cy: n.at[1], r: n.r + 7, class: 'fa-xs-halo', fill: 'none', stroke: '#633d3c', 'stroke-width': 2 }, ng);
    sv('circle', { cx: n.at[0], cy: n.at[1], r: n.r, fill: NERVE, stroke: NERVE_EDGE, 'stroke-width': 1.6 }, ng);
    if (n.id === 'spn') sv('circle', { cx: onRing(-145)[0], cy: onRing(-145)[1], r: 3.6, fill: NERVE, stroke: NERVE_EDGE, 'stroke-width': 1.2 }, ng);
    nEls[n.id] = { g: ng, halo };
  });
  // labels (nerves) and orientation
  const L = sv('g', { class: 'fa-xs-labs' }, svg);
  txt(L, 282, 252, 'Tibial', { weight: 600, size: 13.5 }); sv('line', { x1: 280, y1: 248, x2: 236, y2: 230, stroke: INK, 'stroke-width': 0.8 }, L);
  txt(L, 180, 30, 'Deep peroneal', { weight: 600, size: 13.5, anchor: 'middle' }); sv('line', { x1: 180, y1: 34, x2: 180, y2: 74, stroke: INK, 'stroke-width': 0.8 }, L);
  txt(L, 8, 54, 'Superficial', { weight: 600, size: 13.5 }); txt(L, 8, 70, 'peroneal', { weight: 600, size: 13.5 }); sv('line', { x1: 62, y1: 74, x2: 96, y2: 84, stroke: INK, 'stroke-width': 0.8 }, L);
  txt(L, 8, 268, 'Sural', { weight: 600, size: 13.5 }); sv('line', { x1: 44, y1: 263, x2: 96, y2: 228, stroke: INK, 'stroke-width': 0.8 }, L);
  txt(L, 352, 54, 'Saphenous', { weight: 600, size: 13.5, anchor: 'end' }); sv('line', { x1: 320, y1: 60, x2: 294, y2: 92, stroke: INK, 'stroke-width': 0.8 }, L);
  txt(L, 214, 142, 'Tibia', { size: 13, fill: MUTED, anchor: 'middle' }); txt(L, 90, 170, 'Fibula', { size: 13, fill: MUTED, anchor: 'middle' });
  txt(L, 178, 290, 'Achilles', { size: 13, fill: MUTED, anchor: 'middle' });
  sv('text', { x: 180, y: 14, 'text-anchor': 'middle', 'font-family': MONO, 'font-size': 13, fill: MUTED, text: 'ANTERIOR' }, svg);
  sv('text', { x: 4, y: 150, 'font-family': MONO, 'font-size': 13, fill: MUTED, text: 'LAT' }, svg);
  sv('text', { x: 356, y: 150, 'text-anchor': 'end', 'font-family': MONO, 'font-size': 13, fill: MUTED, text: 'MED' }, svg);
  // needle layer (on top)
  const ndG = sv('g', { class: 'fa-xs-needle' }, svg);

  // controls and panel
  const seg = el('div', { class: 'tb-seg fa-xs-seg', role: 'group', 'aria-label': 'Nerve' });
  const btns = ANKLE_NERVES.map((n, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `${idPrefix}-${n.id}`, dataset: { activate: '1', scrollTo: idPrefix }, 'aria-pressed': 'false', text: n.short, on: { click: () => select(i, true) } }));
  btns.forEach((b) => seg.append(b));
  const playBtn = landmark ? el('button', { type: 'button', class: 'tb-btn tb-btn--primary fa-xs-play', text: 'Play all five', on: { click: () => playAll() } }) : null;
  const panel = el('div', { class: 'fa-xs-panel', 'aria-live': 'polite' });
  const foot = el('div', { class: 'fa-xs-foot' });
  const stage = el('div', { class: 'fa-xs-stage' }, svg);
  const side = el('div', { class: 'fa-xs-side' }, panel, foot);
  wrap.append(el('div', { class: 'fa-xs-ctrls' }, seg, ...(playBtn ? [playBtn] : [])), el('div', { class: 'fa-xs-grid' }, stage, side));

  let cur = -1; let raf = 0; let seq = null;
  function drawFoot(n) {
    foot.textContent = '';
    if (typeof LEG.legFigure !== 'function') return;
    try {
      ['dorsum', 'sole'].forEach((v) => {
        const has = n.zones.some((z) => (LEG.ZONES[z]?.views || []).includes(v));
        const f = LEG.legFigure(v, { zones: has ? n.zones : [], density: 'dense', label: `${v === 'sole' ? 'Sole' : 'Top'} of the right foot: ${n.short} territory shaded` });
        foot.append(el('figure', { class: 'fa-xs-footfig' }, f, el('figcaption', { text: v === 'sole' ? 'Sole' : 'Top of foot' })));
      });
    } catch (e) { /* leg figure not available */ }
  }
  function drawStatic(n, full) {
    laG.textContent = ''; ndG.textContent = '';
    if (!landmark || !full) return;
    paintNeedle(n, 1); paintLA(n, 1);
  }
  function paintNeedle(n, p) {
    ndG.textContent = '';
    if (n.ring) {
      // needle lies in the subcutaneous plane along the start of the ring
      const end = onRing(n.ring[0] + (n.ring[1] - n.ring[0]) * 0.55 * p);
      const st = n.entry;
      sv('line', { x1: st[0], y1: st[1], x2: end[0], y2: end[1], stroke: '#3c3f44', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ndG);
      sv('circle', { cx: st[0], cy: st[1], r: 3, fill: '#633d3c' }, ndG);
    } else {
      const x = n.entry[0] + (n.tip[0] - n.entry[0]) * p, y = n.entry[1] + (n.tip[1] - n.entry[1]) * p;
      sv('line', { x1: n.entry[0], y1: n.entry[1], x2: x, y2: y, stroke: '#3c3f44', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, ndG);
      sv('circle', { cx: n.entry[0], cy: n.entry[1], r: 3, fill: '#633d3c' }, ndG);
    }
  }
  function paintLA(n, p) {
    laG.textContent = '';
    if (p <= 0) return;
    if (n.ring) {
      const d1 = n.ring[0] + (n.ring[1] - n.ring[0]) * p;
      sv('path', { d: arcPath(n.ring[0], d1), fill: 'none', stroke: LA, 'stroke-width': 9 + 4 * p, 'stroke-linecap': 'round', opacity: 0.55 }, laG);
    } else {
      sv('circle', { cx: n.at[0] + (n.tip[0] - n.at[0]) * 0.4, cy: n.at[1] + (n.tip[1] - n.at[1]) * 0.4, r: (n.r + 4) + 12 * p, fill: LA, opacity: 0.45 }, laG);
    }
  }
  function animate(n, done) {
    cancelAnimationFrame(raf);
    if (reduced()) { drawStatic(n, true); done?.(); return; }
    const T1 = 900, T2 = 1700; let t0 = 0;
    const step = (ts) => {
      if (!t0) t0 = ts;
      const t = ts - t0;
      const p1 = Math.min(1, t / T1), p2 = Math.max(0, Math.min(1, (t - T1 - 150) / T2));
      const e1 = 1 - Math.pow(1 - p1, 3), e2 = 1 - Math.pow(1 - p2, 2);
      paintNeedle(n, e1); paintLA(n, e2);
      if (p2 < 1) raf = requestAnimationFrame(step); else done?.();
    };
    raf = requestAnimationFrame(step);
  }
  function select(i, user) {
    if (user && seq) { clearTimeout(seq); seq = null; if (playBtn) playBtn.textContent = 'Play all five'; }
    cur = i; const n = ANKLE_NERVES[i];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    Object.entries(nEls).forEach(([id, o]) => { o.g.classList.toggle('is-on', id === n.id); o.g.classList.toggle('is-dim', id !== n.id); });
    panel.textContent = '';
    panel.append(el('p', { class: 'fa-xs-k', text: `${n.deep ? 'Deep' : 'Superficial'} · ${n.parent}` }), el('p', { class: 'fa-xs-name', text: n.name }));
    const dl = el('dl', { class: 'fa-xs-dl' });
    const row = (k, v) => dl.append(el('div', {}, el('dt', { text: k }), fill(el('dd'), v)));
    row('Skin', n.skin); row('Where', n.where);
    if (landmark) { row('Landmark', n.landmark); row('Volume', `Ultrasound ${n.us}; landmark ${n.lm}.`); }
    panel.append(dl);
    drawFoot(n);
    if (landmark) animate(n); else drawStatic(n, false);
  }
  function playAll() {
    if (seq) { clearTimeout(seq); seq = null; playBtn.textContent = 'Play all five'; return; }
    playBtn.textContent = 'Stop';
    let i = 0;
    const next = () => {
      if (i >= ANKLE_NERVES.length) { seq = null; playBtn.textContent = 'Play all five'; return; }
      select(i, false); i += 1;
      seq = setTimeout(next, reduced() ? 2600 : 3600);
    };
    next();
  }
  select(0, false);
  if (!landmark) Object.values(nEls).forEach((o) => o.g.classList.remove('is-dim'));
  return wrap;
}

// ================================================================== tourniquet chooser
const TQ = [
  { id: 'ankle', label: 'Ankle cuff', band: [[50, 372], [114, 372], [112, 382], [52, 382]],
    where: 'Just above the malleoli (a narrow pneumatic cuff or an Esmarch bandage), for forefoot and midfoot surgery.',
    covers: '<a href="#ch-ankle">Ankle block</a>: usually tolerated, with sedation available. <a href="#ch-popliteal">Popliteal</a> + <a href="#ch-saphenous">saphenous</a>: comfortable.',
    why: 'The cuff sits at or just above the level of the block, over tendon and bone rather than a large muscle mass. Tolerance falls with time: in a large audit of ankle-block patients, very few needed help in the first 30 minutes, more after that, and those over 70 had more cuff pain.',
    tip: 'Ask how long it will be up. Over 30–45 minutes in an older patient, plan sedation or a higher block.' },
  { id: 'calf', label: 'Calf cuff', band: [[40, 330], [120, 330], [116, 346], [44, 346]],
    where: 'Mid or upper calf, for foot and ankle surgery when the surgeon wants the cuff below the knee.',
    covers: '<a href="#ch-popliteal">Popliteal sciatic</a> + <a href="#ch-saphenous">saphenous</a>. An ankle block alone is <strong>not</strong> enough.',
    why: 'Cuff pain is mostly <strong>ischaemia of the muscle under and below the cuff</strong>. Every muscle below the knee is supplied by the sciatic nerve, and the saphenous nerve covers the skin on the inner side, so the popliteal plus saphenous pair covers both. The skin at the back of the upper calf is partly posterior femoral cutaneous: some patients feel the pressure there.',
    tip: 'Place the cuff below the fibular neck: pressure over it can injure the common peroneal nerve.' },
  { id: 'thigh', label: 'Thigh cuff', band: [[14, 150], [146, 150], [144, 176], [20, 176]],
    where: 'Thigh, for ankle fractures, arthrodesis and arthroplasty, and amputations, when the surgeon wants a bloodless field higher up.',
    covers: '<strong>Spinal (or general) anaesthesia.</strong> The foot and ankle blocks on this page do not cover it.',
    why: 'Blocking the whole thigh needs the sciatic (proximally, with the posterior femoral cutaneous nerve), femoral, lateral femoral cutaneous and obturator nerves: possible, but rarely practical. Cuff pain comes mainly from the ischaemic muscle, so numbing the skin is not enough: an awake patient usually tolerates a thigh cuff for only about 20 minutes.',
    tip: 'Blocks still earn their place for analgesia after the spinal or general anaesthetic wears off.' },
];

function tourniquetChooser() {
  const box = el('div', { class: 'fa-tq', id: 'fa-tq' });
  const seg = el('div', { class: 'tb-seg fa-tq-seg', role: 'group', 'aria-label': 'Tourniquet site' });
  const out = el('div', { class: 'fa-tq-out', 'aria-live': 'polite' });
  let figHost = el('div', { class: 'fa-tq-fig' });
  const btns = TQ.map((q, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `fa-tq-${q.id}`, dataset: { activate: '1', scrollTo: 'fa-tq' }, 'aria-pressed': 'false', text: q.label, on: { click: () => show(i) } }));
  btns.forEach((b) => seg.append(b));
  function show(i) {
    const q = TQ[i];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    figHost.textContent = '';
    try {
      const svg = LEG.legFigure('front', { label: `Front of the right lower limb with the ${q.label.toLowerCase()} marked` });
      const pts = q.band.map((p) => p.join(',')).join(' ');
      sv('polygon', { points: pts, fill: 'rgba(99,61,60,.82)', stroke: '#272722', 'stroke-width': 1, class: 'fa-tq-band' }, svg);
      figHost.append(svg);
    } catch (e) { /* figure optional */ }
    out.textContent = '';
    out.append(el('p', { class: 'fa-tq-title', text: q.label }));
    const dl = el('dl', { class: 'fa-xs-dl' });
    [['Where', q.where], ['What covers it', q.covers], ['Why', q.why], ['Tip', q.tip]].forEach(([k, v]) => dl.append(el('div', {}, el('dt', { text: k }), fill(el('dd'), v))));
    out.append(dl);
  }
  box.append(seg, el('div', { class: 'fa-tq-grid' }, figHost, out));
  show(1);
  return box;
}

// ================================================================== the anatomy chapter
export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'fa-anat-h', text: 'Anatomy: the sciatic branches and the foot' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Below the knee, everything is <strong>sciatic</strong> except one strip of skin on the inner side: the <strong>saphenous</strong> nerve, from the femoral. Learn where the sciatic nerve divides and where its five endings cross the ankle, and every block on this page follows.'));
  sec.append(keyPoints([
    'The <strong>sciatic nerve</strong> (L4–S3) is two nerves in one sheath: <strong>tibial</strong> (medial) and <strong>common peroneal</strong> (lateral). They usually separate near the apex of the popliteal fossa, 5–10 cm above the crease, but the level varies and some divide high in the thigh.',
    'At the bifurcation both nerves sit in a common <strong>paraneural sheath</strong> (sometimes called Vloka’s sheath): injection inside it is the fastest popliteal block.',
    '<strong>Five nerves</strong> reach the foot: two deep (<strong>tibial</strong>, <strong>deep peroneal</strong>) and three superficial (<strong>superficial peroneal</strong>, <strong>sural</strong>, <strong>saphenous</strong>). Four are sciatic; the saphenous is femoral.',
    'All the <strong>muscles below the knee</strong> are sciatic: a popliteal block weakens the whole foot and ankle (foot drop); an ankle block spares the leg muscles.',
    '<strong>Bone and joints</strong> follow the sciatic, not the skin map: the tibia, the ankle joint and the foot bones are mainly tibial and deep peroneal, with saphenous fibres to the medial ankle.',
  ]));

  // ---- sciatic division
  sec.append(el('h3', { id: 'fa-anat-sciatic', text: 'The sciatic nerve divides' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<ul>
<li><strong>Course.</strong> Leaves the pelvis through the greater sciatic foramen below piriformis, runs under gluteus maximus midway between the ischial tuberosity and the greater trochanter, then down the back of the thigh on adductor magnus, deep to the long head of biceps femoris.</li>
<li><strong>The popliteal fossa</strong> is a diamond: semitendinosus and semimembranosus above and medially, biceps femoris above and laterally, the two heads of gastrocnemius below. From superficial to deep in the middle: <strong>nerves, then the popliteal vein, then the artery</strong>.</li>
<li><strong>Tibial nerve</strong> (L4–S3): straight down the middle, under gastrocnemius and soleus, to behind the medial malleolus. Muscles of the calf and the sole. Skin: the sole and heel; the medial sural cutaneous nerve.</li>
<li><strong>Common peroneal nerve</strong> (L4–S2): follows the medial edge of biceps femoris to the head of the fibula, winds round the <strong>fibular neck</strong> (where it is easily compressed), and divides into the <strong>deep peroneal</strong> (front of the leg, dorsiflexion, first web space) and <strong>superficial peroneal</strong> (peronei, eversion, top of the foot). In the fossa it gives the lateral sural cutaneous nerve (outer calf) and a branch that joins the sural.</li>
<li><strong>Sural nerve</strong>: usually formed from a tibial branch joined by a peroneal branch; runs down the back of the calf with the small saphenous vein to behind the lateral malleolus.</li>
<li><strong>Not sciatic:</strong> the <strong>saphenous</strong> nerve (femoral, L3–L4: medial leg, medial ankle, medial foot) and the <strong>posterior femoral cutaneous</strong> nerve (S1–S3: back of the thigh and popliteal fossa, sometimes the upper calf). Neither is blocked by a popliteal block.</li></ul>`));
  sec.append(figure('fa-fig-fossa', 'The popliteal fossa from behind (right knee)', fossaFigure(),
    'Schematic, not to scale. SM semimembranosus, ST semitendinosus, BF biceps femoris, MG and LG medial and lateral heads of gastrocnemius; A popliteal artery, V popliteal vein (both deep to the nerves). The probe (black) slides up from the crease, following the tibial nerve, until the common peroneal nerve joins it: that is the level for the popliteal block. The dashed part of the common peroneal nerve winds round the fibular neck to the front.'));

  // ---- five nerves
  sec.append(el('h3', { id: 'fa-anat-five', text: 'Five nerves at the ankle' }));
  sec.append(fill(el('p', {}), 'Tap a nerve to see where it lies and which skin it supplies. The section is seen from below, as on a scan: front at the top, the fibula on the left, the medial malleolus on the right.'));
  sec.append(ankleSection({ idPrefix: 'fa-xs-anat', mode: 'explore' }));
  sec.append(table({
    caption: 'The five nerves of the foot',
    head: ['Nerve', 'From', 'Depth', 'Where at the ankle', 'Skin of the foot'],
    rows: [
      [{ th: true, html: 'Tibial' }, 'Sciatic (tibial)', 'Deep', 'Behind the medial malleolus, behind the posterior tibial artery, under the flexor retinaculum', 'Sole and heel; undersides and nail beds of the toes'],
      [{ th: true, html: 'Deep peroneal' }, 'Common peroneal', 'Deep', 'Front of the ankle on the tibia, beside the anterior tibial artery, between EHL and EDL', 'First web space'],
      [{ th: true, html: 'Superficial peroneal' }, 'Common peroneal', 'Superficial', 'In the fat over the front and outer side of the lower leg and ankle', 'Most of the top of the foot'],
      [{ th: true, html: 'Sural' }, 'Tibial + common peroneal', 'Superficial', 'With the small saphenous vein, between the lateral malleolus and the Achilles tendon', 'Outer border of the foot, outer heel, little toe'],
      [{ th: true, html: 'Saphenous' }, 'Femoral', 'Superficial', 'With the great saphenous vein, in front of the medial malleolus', 'Medial ankle and inner border of the foot'],
    ],
  }));
  sec.append(callout('pearl', {
    title: 'Two memory hooks',
    body: '<p><strong>“Two deep, three shallow.”</strong> The two deep nerves travel with an artery (tibial with the posterior tibial, deep peroneal with the anterior tibial): find the pulse, find the nerve. The three superficial nerves are blocked with a ring of local anaesthetic under the skin; two of them travel with a vein (sural with the small saphenous, saphenous with the great saphenous).</p><p>Behind the medial malleolus, front to back: <strong>T</strong>om, <strong>D</strong>ick <strong>A</strong>nd <strong>N</strong>ervous <strong>H</strong>arry: tibialis posterior, flexor digitorum longus, artery, nerve, flexor hallucis longus.</p>',
  }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<h4 id="fa-anat-deep">Bones and joints (the deep supply)</h4>
<ul><li><strong>Ankle joint:</strong> deep peroneal (front), tibial (back and medial), with contributions from the saphenous, superficial peroneal and sural nerves. Its branches leave <strong>above</strong> the malleoli, so an ankle block does not reliably cover ankle joint surgery: use a popliteal block (plus saphenous).</li>
<li><strong>Foot bones:</strong> mostly tibial (plantar nerves) and deep peroneal. A forefoot osteotomy hurts in the bone, so the deep nerves matter more than the skin map suggests.</li>
<li><strong>Heel:</strong> the medial calcaneal branches of the tibial nerve can leave above the malleolus: for heel surgery, block the tibial nerve higher or use a popliteal block.</li></ul>`));
  const sk = skinFigure(); if (sk) sec.append(sk);

  // ---- tourniquets
  sec.append(el('h3', { id: 'fa-anat-tq', text: 'Tourniquets: which block tolerates which cuff' }));
  sec.append(fill(el('p', {}), 'Ask the surgeon <strong>where the cuff goes and for how long</strong> before you choose the block. The skin under the cuff matters less than the <strong>muscle ischaemia</strong> under and below it.'));
  sec.append(tourniquetChooser());
  sec.append(table({
    caption: 'Tourniquet site and anaesthetic',
    head: ['Cuff', 'Ankle block', 'Popliteal + saphenous', 'Spinal'],
    rows: [
      [{ th: true, html: 'Ankle' }, 'Usually tolerated (shorter cases)', 'Yes', 'Yes'],
      [{ th: true, html: 'Calf' }, 'No', 'Yes', 'Yes'],
      [{ th: true, html: 'Thigh' }, 'No', 'No', 'Yes'],
    ],
  }));
  sec.append(callout('note', {
    title: 'Cuff safety in one breath',
    body: '<p>Pneumatic cuff, padded, at the right width; inflate after exsanguination (not by Esmarch with infection, tumour or a suspected DVT); keep the time as short as possible and tell the surgeon at an hour and at two hours; expect a rise in heart rate and blood pressure from cuff pain after 30–60 minutes under general anaesthesia, and a fall in blood pressure with a rise in end-tidal CO<sub>2</sub> and potassium on release. Avoid a cuff over a fistula, a fracture, or severe arterial disease.</p>',
  }));

  // ---- foot drop and falls
  sec.append(el('h3', { id: 'fa-anat-drop', text: 'Foot drop and falls' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>A popliteal block takes away <strong>dorsiflexion</strong> (deep peroneal), <strong>plantarflexion and push-off</strong> (tibial) and the feeling in the sole, so the patient has no ankle control and no idea where the foot is. That is a fall waiting to happen.</p>
<ul><li><strong>Before:</strong> tell the patient the foot will be numb and weak until the next day, and why that matters.</li>
<li><strong>After:</strong> non-weight-bearing on that leg (or heel weight-bearing in the surgeon’s shoe or boot, if allowed) with crutches or a frame, and an escort home for day cases. Physiotherapy checks walking before discharge.</li>
<li><strong>An ankle block</strong> spares the calf and the leg muscles: the patient can walk on the heel in a post-operative shoe sooner, which is one reason it suits day-case forefoot surgery.</li>
<li><strong>Weakness that outlasts the block</strong> (sensation back, weakness not): think surgical or positional causes first (a tight cast or backslab, pressure on the fibular neck, compartment syndrome), examine and document, and escalate early to the pain service, the surgeon and neurology.</li></ul>`));
  sec.append(callout('warn', {
    title: 'The common peroneal nerve at the fibular neck',
    body: '<p>It is the most often injured nerve in the leg: lithotomy stirrups, a lateral position without padding, a tight dressing or a backslab edge. Pad and check it at the end of every case. Its injury causes foot drop that a block can hide.</p>',
  }));

  // ---- heel protection
  sec.append(el('h3', { id: 'fa-anat-heel', text: 'Protect the numb heel' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<ul>
<li>A sciatic or popliteal block takes away the warning pain from the heel for most of a day. A heel resting on a mattress or the hard edge of a backslab can break down, especially in <strong>diabetic, vascular, frail or immobile</strong> patients.</li>
<li><strong>Float the heel:</strong> a pillow under the calf, not under the heel; check casts and dressings for pressure points; turn and inspect.</li>
<li>No hot packs or ice directly on numb skin.</li>
<li><strong>Compartment syndrome</strong> after tibial fractures and crush: agree the plan with the surgeon first. Dense, long blocks that far outlast surgery are best avoided in high-risk patients; dilute local anaesthetic without adjuncts, with trained, regular observation and compartment monitoring, does not appear to delay the diagnosis. Pain out of proportion, or new pain breaking through a working block, is compartment syndrome until proved otherwise.</li></ul>`));

  registerSearch([
    { title: 'Popliteal fossa figure: sciatic bifurcation', text: 'popliteal fossa sciatic bifurcation tibial common peroneal biceps femoris semimembranosus semitendinosus gastrocnemius sural fibular neck', id: 'fa-fig-fossa' },
    { title: 'Ankle cross-section: five nerves', text: 'ankle cross section tibial deep peroneal superficial peroneal sural saphenous posterior tibial artery dorsalis pedis tom dick and harry', id: 'fa-xs-anat' },
    { title: 'Tourniquet chooser: ankle, calf, thigh cuff', text: 'tourniquet cuff ankle calf thigh ischaemia esmarch tolerance', id: 'fa-tq' },
  ]);
}

function skinFigure() {
  if (typeof LEG.legViewsFigure !== 'function') return null;
  try {
    return LEG.legViewsFigure({
      id: 'fa-fig-skin', title: 'Skin of the leg and foot: who supplies what',
      views: [
        { view: 'front', zones: ['saphenous', 'lat-cut-calf', 'sup-peroneal-leg', 'sural', 'sup-peroneal', 'deep-peroneal'], tint: true, caption: 'Front' },
        { view: 'dorsum', zones: ['saphenous-foot', 'sup-peroneal', 'deep-peroneal', 'sural-foot', 'tibial-sole'], tint: true, labels: true, caption: 'Top of foot' },
        { view: 'sole', zones: ['tibial-sole', 'calcaneal', 'sural-foot'], tint: true, labels: true, caption: 'Sole' },
      ],
      caption: 'Schematic, right side; territories vary and overlap. Saphenous: the inner leg and the inner border of the foot. Superficial peroneal: most of the top of the foot. Deep peroneal: the first web space. Sural: the outer border of the foot. Tibial: the sole (plantar nerves) and heel (calcaneal branches).',
      label: 'Skin territories of the right leg and foot: saphenous, superficial and deep peroneal, sural and tibial',
    });
  } catch (e) { return null; }
}

// ================================================================== plan by operation
const OPS = [
  { id: 'fore', short: 'Forefoot', title: 'Forefoot: bunion, toe and ray surgery',
    block: '<a href="#ch-ankle">Ankle block</a> (all five nerves) for an ankle cuff; or <a href="#ch-popliteal">popliteal</a> + <a href="#ch-saphenous">saphenous</a> for a calf cuff or longer analgesia.',
    why: 'The incision and the osteotomy are all below the ankle. Deep peroneal and tibial supply the bone. The saphenous territory usually ends at the medial midfoot, short of the first tarsometatarsal joint, so for a bunion it can usually be left out; the dorsomedial skin of the first metatarsal is mainly superficial peroneal (medial dorsal cutaneous branch). Add the saphenous if the incision runs back towards the midfoot.',
    note: 'Day case: the ankle block lets the patient walk on the heel sooner. No adrenaline in a digital or web-space block.' },
  { id: 'mid', short: 'Midfoot, hindfoot', title: 'Midfoot and hindfoot: arthrodesis, calcaneal fixation',
    block: '<a href="#ch-popliteal">Popliteal sciatic</a> + <a href="#ch-saphenous">saphenous</a>, usually with general or spinal anaesthesia.',
    why: 'Bigger, more painful bone surgery, often with a thigh or calf cuff; the heel (calcaneal branches) is reached reliably only from above the ankle.',
    note: 'Consider a popliteal catheter for major reconstructions.' },
  { id: 'ankle', short: 'Ankle', title: 'Ankle: fracture fixation, arthroscopy, arthrodesis, replacement',
    block: '<a href="#ch-popliteal">Popliteal sciatic</a> + <a href="#ch-saphenous">saphenous</a> (below the knee, or a distal adductor canal block), with spinal or general anaesthesia when a thigh cuff is used.',
    why: 'The ankle joint branches leave above the malleoli; the medial incision and the medial malleolus are saphenous.',
    note: 'Trauma: discuss compartment syndrome risk with the surgeon first; dilute local anaesthetic and clear observation plans. IV dexamethasone reduces rebound pain the next night.' },
  { id: 'achilles', short: 'Achilles', title: 'Achilles tendon repair',
    block: '<a href="#ch-popliteal">Popliteal sciatic</a> (tibial and sural territories); add a <a href="#ch-saphenous">saphenous</a> block for a posteromedial incision.',
    why: 'The back of the heel is sural and tibial (calcaneal). Prone positioning: do the block before turning, or in the prone position.',
    note: 'Foot drop matters less (the leg is in an equinus cast), but the numb heel must be protected.' },
  { id: 'bka', short: 'Below-knee amputation', title: 'Below-knee amputation',
    block: '<a href="#ch-popliteal">Popliteal sciatic</a> + saphenous at the adductor canal (or femoral nerve block), with spinal or general anaesthesia; or blocks alone in a very sick patient with sedation.',
    why: 'The stump crosses tibia, fibula and both nerve territories. A thigh cuff, if used, needs neuraxial or general anaesthesia.',
    note: 'Useful when anticoagulated or septic and neuraxial is contraindicated. A surgeon-placed perineural catheter adds days of analgesia. The skin of the upper back of the calf can be posterior femoral cutaneous, which a popliteal block misses: for a long posterior flap, or a sick patient under blocks alone, consider a subgluteal sciatic block (or catheter) instead. See the <a href="../thigh/#ch-amputation">amputation planner</a>.' },
  { id: 'diab', short: 'Diabetic foot', title: 'Diabetic foot: debridement, toe and ray amputation',
    block: '<a href="#ch-ankle">Ankle block</a> or <a href="#ch-popliteal">popliteal</a> (+ <a href="#ch-saphenous">saphenous</a> for medial work).',
    why: 'Avoids general anaesthesia in high-risk patients. Pre-existing neuropathy: examine and document sensation and power before the block.',
    note: 'Don’t inject through infected tissue; no adrenaline with poor perfusion; protect the numb heel and the other foot.' },
];

function opChooser() {
  const box = el('div', { class: 'fa-op', id: 'fa-op' });
  const seg = el('div', { class: 'tb-seg fa-op-seg', role: 'group', 'aria-label': 'Operation' });
  const out = el('div', { class: 'fa-op-out', 'aria-live': 'polite' });
  const btns = OPS.map((o, i) => el('button', { type: 'button', class: 'tb-seg-btn', id: `fa-op-${o.id}`, dataset: { activate: '1', scrollTo: 'fa-op' }, 'aria-pressed': 'false', text: o.short, on: { click: () => show(i) } }));
  btns.forEach((b) => seg.append(b));
  function show(i) {
    const o = OPS[i];
    btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    out.textContent = '';
    out.append(el('p', { class: 'fa-tq-title', text: o.title }));
    const dl = el('dl', { class: 'fa-xs-dl' });
    [['Block', o.block], ['Why', o.why], ['Watch', o.note]].forEach(([k, v]) => dl.append(el('div', {}, el('dt', { text: k }), fill(el('dd'), v))));
    out.append(dl);
  }
  box.append(seg, out);
  show(0);
  return box;
}

export function renderPlan(sec) {
  sec.append(el('h2', { id: 'fa-plan-h', text: 'Plan by operation' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Three questions choose the block: <strong>where is the incision and the bone work</strong>, <strong>where is the cuff</strong>, and <strong>must the patient walk today</strong>?'));
  sec.append(opChooser());
  sec.append(table({
    caption: 'The three blocks side by side',
    head: ['', 'Popliteal sciatic', 'Ankle block', 'Saphenous (below the knee)'],
    rows: [
      [{ th: true, html: 'Covers' }, 'Leg below the knee, ankle and foot, except the medial strip', 'The foot below the malleoli', 'Medial leg, medial ankle and foot'],
      [{ th: true, html: 'Motor' }, 'Foot drop, no push-off', 'Intrinsic foot muscles only', 'None'],
      [{ th: true, html: 'Cuff' }, 'Calf (with saphenous) or ankle', 'Ankle (shorter cases)', 'Adds the medial skin'],
      [{ th: true, html: 'Injections' }, 'One', 'Five', 'One'],
      [{ th: true, html: 'Dose here' }, '15 ml 0.4% ropivacaine (60 mg)', '17 ml 0.5% ropivacaine (85 mg)', '5 ml 0.5% ropivacaine (25 mg)'],
    ],
  }));
  sec.append(callout('key', {
    title: 'The usual pairs',
    body: '<ul><li><strong>Popliteal + saphenous</strong> = the whole leg below the knee (calf cuff, ankle surgery, below-knee amputation with a thigh cuff under spinal).</li><li><strong>Ankle block</strong> = the foot (forefoot day cases, ankle cuff).</li><li><strong>Count the milligrams</strong> when adding a saphenous block to a popliteal block (60 + 25 = 85 mg of ropivacaine), and more again if the surgeon infiltrates. A common teaching maximum for ropivacaine is about <strong>3 mg/kg</strong> (about 210 mg at 70 kg), lower in frail older patients; use lean body weight.</li></ul>',
  }));
  registerSearch([{ title: 'Plan by operation: foot and ankle', text: 'bunion hallux valgus forefoot midfoot arthrodesis calcaneus ankle fracture ORIF arthroscopy Achilles below knee amputation BKA diabetic foot debridement', id: 'fa-op' }]);
}
