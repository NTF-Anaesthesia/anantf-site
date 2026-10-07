// Ultrasound anatomy of the four brachial plexus blocks.
// For each block: (1) a simulated B-mode ultrasound image drawn procedurally on a
// canvas (speckle, acoustic shadowing, posterior enhancement), and (2) an idealised
// labelled vector diagram of the same cross-section. Both share one geometry, so a
// structure is in the same place in both. Overlays: probe orientation, in-plane
// needle path, animated needle advance and local anaesthetic (LA) spread.
//
// Everything here is an ORIGINAL drawing. Reference images were only looked at for
// orientation; nothing is copied from them.
//
// API
//   mount(containerEl, bus) -> { destroy() }
//   REAL_SCANS  : { [blockId]: null | 'path/to/de-identified-image.jpg' } (owner fills in)
//   SCENES      : the cross-section geometry per block (scene units, 160 wide)
//
// Bus: listens to 'block', 'select', 'hover'. Emits (source: 'ultrasound'):
//   'hover'  {id}  when a nerve is hovered / focused (null on leave)
//   'select' {id}  when a nerve is clicked (clicking the selected nerve clears it)
//   'block'  {id}  from the block chooser / tabs
// No other events.

import { BLOCKS, BLOCK_ORDER, ELEMENTS, getPathway, blockStatus } from './data.js';

const SOURCE = 'ultrasound';
const SVGNS = 'http://www.w3.org/2000/svg';

/**
 * Optional: paths (relative to index.html) to the owner's own de-identified scans.
 * When set, the image is shown as a "Reference scan" panel beside the simulation.
 * Example: interscalene: 'scans/interscalene.jpg'
 */
export const REAL_SCANS = {
  interscalene: null,
  supraclavicular: null,
  infraclavicular: null,
  axillary: null,
};

// ---------------------------------------------------------------------------
// Geometry helpers. Scene units: x 0..160 (screen left -> right), y 0..h (depth).
// ---------------------------------------------------------------------------
const E = (cx, cy, rx, ry, rot = 0) => ({ t: 'e', cx, cy, rx, ry, rot });
const P = (...pts) => ({ t: 'p', pts });
const L = (w, ...pts) => ({ t: 'l', w, pts });
const PT = (x, y) => ({ t: 'pt', x, y });

function S(key, kind, short, label, shapes, opts = {}) {
  return { key, kind, short, label, shapes: Array.isArray(shapes) ? shapes : [shapes], ids: [], ...opts };
}

const KIND_NAMES = {
  nerve: 'Nerve', artery: 'Artery', vein: 'Vein', muscle: 'Muscle', bone: 'Bone',
  pleura: 'Pleura', tendon: 'Tendon', fascia: 'Fascia', sheath: 'Connective tissue', point: 'Target space',
};

// ---------------------------------------------------------------------------
// SCENES
// ---------------------------------------------------------------------------
export const SCENES = {
  interscalene: {
    id: 'interscalene', w: 160, h: 100, cm: 25, fat: 6,
    sides: ['Ant / Med', 'Post / Lat'],
    view: 'Transverse (axial) view of the right side of the neck at C6–C7',
    structures: [
      S('lco', 'muscle', 'LCo', 'Longus colli (prevertebral)', P([0, 76], [26, 74], [48, 82], [56, 100], [0, 100]), { lab: [16, 90], inside: true }),
      S('scm', 'muscle', 'SCM', 'Sternocleidomastoid', P([0, 7], [30, 6], [62, 6.5], [90, 9], [104, 13], [94, 18.5], [66, 21], [36, 23], [10, 25.5], [0, 25.5]), { lab: [48, 14], inside: true }),
      S('as', 'muscle', 'AS', 'Anterior scalene', P([30, 30], [46, 24.5], [64, 22], [71, 27], [70, 41], [66, 53], [57, 61], [43, 62], [33, 53], [28, 41]), { lab: [50, 45], inside: true }),
      S('ms', 'muscle', 'MS', 'Middle scalene', P([83, 23], [100, 17], [126, 14.5], [150, 15], [160, 16], [160, 60], [140, 57], [120, 53], [104, 54], [88, 50], [82, 38]), { lab: [132, 38], inside: true }),
      S('ijv', 'vein', 'IJV', 'Internal jugular vein (lateral to the CCA, compressible)', E(18, 36.5, 9, 7.5), { lab: [18, 36.5], inside: true }),
      S('cca', 'artery', 'CCA', 'Common carotid artery (medial to the IJV)', E(9.5, 57, 8.5, 8.5), { lab: [9.5, 57], inside: true }),
      S('vv', 'vein', 'VV', 'Vertebral vein', E(64, 70, 5.5, 3.6, -10), { lab: [56, 70] }),
      S('va', 'artery', 'VA', 'Vertebral artery (colour Doppler)', E(70, 81, 5, 5), { lab: [58, 86] }),
      S('tp', 'bone', 'C7 TP', 'C7 transverse process (no prominent anterior tubercle)', L(1.8, [80, 74], [92, 72.5], [104, 70], [112, 66], [117, 60], [119, 55]), { lab: [130, 72] }),
      S('phr', 'nerve', 'Phr', 'Phrenic nerve (on anterior scalene)', E(41, 23, 3.2, 1.8, -25), { ids: ['n-phrenic'], tex: 'root', lab: [30, 31] }),
      S('c5', 'nerve', 'C5', 'C5 root', E(74.5, 26, 3.1, 2.9), { ids: ['root-c5'], tex: 'root', lab: [70, 9] }),
      S('c6', 'nerve', 'C6', 'C6 root (often split)', E(76, 35.5, 4.6, 3.8, 10), { ids: ['root-c6'], tex: 'split', lab: [94, 33] }),
      S('c7', 'nerve', 'C7', 'C7 root (on the C7 transverse process)', E(94, 63, 6.5, 4, -12), { ids: ['root-c7'], tex: 'root', lab: [84, 52] }),
      S('dsn', 'nerve', 'DSN/LTN', 'Dorsal scapular / long thoracic nerves (in middle scalene)', E(104, 27, 3, 1.9, -20), { ids: ['n-dorsal-scapular', 'n-long-thoracic'], tex: 'root', lab: [118, 24] }),
    ],
    injections: [
      { from: [160, 8.5], to: [79, 30.5], note: 'Between C5 and C6, inside the sheath', bathes: ['c5', 'c6'],
        blobs: [{ c: [77.5, 30.5], r: [5.5, 4.2] }, { c: [73.5, 29], r: [5, 8], d: 0.25 }, { c: [80, 33], r: [4.5, 7.5], d: 0.35 }, { c: [76, 22], r: [4, 3.5], d: 0.55 }, { c: [77, 40.5], r: [5, 3], d: 0.6 }] },
    ],
  },

  supraclavicular: {
    id: 'supraclavicular', w: 160, h: 100, cm: 45, fat: 7,
    sides: ['Med', 'Lat'],
    view: 'Supraclavicular fossa, probe parallel to the clavicle, tilted caudally (right side)',
    structures: [
      S('oh', 'muscle', 'OH', 'Omohyoid', P([56, 10], [100, 8.5], [140, 9.5], [160, 11.5], [160, 17], [130, 15.5], [94, 15], [62, 15]), { fibre: 2, lab: [146, 13.5], inside: true }),
      S('as', 'muscle', 'AS', 'Anterior scalene', P([4, 42], [26, 31], [52, 25], [64, 26], [66, 34], [60, 46], [46, 52], [24, 57], [6, 60]), { lab: [36, 44], inside: true }),
      S('ms', 'muscle', 'MS', 'Middle scalene', P([116, 50], [136, 47], [160, 48], [160, 70], [140, 68], [124, 62]), { lab: [146, 58], inside: true }),
      S('scv', 'vein', 'SCV', 'Subclavian vein', E(3, 54, 9, 14), { lab: [7, 54], inside: true }),
      S('sheath', 'sheath', '', 'Plexus sheath', P([92, 20], [110, 13.5], [134, 18], [156, 30], [138, 40], [116, 47], [102, 54], [92, 54], [88, 36]), { nolabel: true }),
      S('sca', 'artery', 'SCA', 'Subclavian artery', E(76, 44, 12, 12), { lab: [76, 44], inside: true }),
      S('rib', 'bone', '1st rib', 'First rib', L(2.2, [44, 63], [64, 60], [86, 57.5], [104, 56.5], [120, 56]), { lab: [56, 76] }),
      S('pleura', 'pleura', 'Pleura', 'Pleura (sliding)', [L(0.8, [0, 74], [16, 71], [32, 71], [44, 74]), L(0.8, [122, 70], [138, 72], [160, 76])], { lung: true, lab: [20, 84] }),
      S('t-sup', 'nerve', 'ST', 'Superior trunk / divisions (superficial)', [E(100, 21, 3, 2.6), E(108, 18, 3.1, 2.7), E(117, 21, 3.2, 2.6), E(126, 23.5, 3, 2.5), E(136, 27, 2.8, 2.3)], { ids: ['trunk-sup', 'div-sup-ant', 'div-sup-post'], tex: 'root', lab: [118, 6] }),
      S('t-mid', 'nerve', 'MT', 'Middle trunk / divisions', [E(98, 30, 3, 2.6), E(106, 28, 3, 2.6), E(115, 30, 3.2, 2.8), E(124, 32, 3, 2.5)], { ids: ['trunk-mid', 'div-mid-ant', 'div-mid-post'], tex: 'root', lab: [146, 40] }),
      S('t-inf', 'nerve', 'IT', 'Inferior trunk / divisions (deep, near the corner pocket)', [E(96, 40, 3, 2.7), E(104, 39.5, 3, 2.6), E(98.5, 47, 3.1, 2.6), E(106, 46.5, 2.8, 2.4)], { ids: ['trunk-inf', 'div-inf-ant', 'div-inf-post'], tex: 'root', lab: [118, 52] }),
      S('dsa', 'artery', 'DSA', 'Dorsal scapular artery (crosses the plexus: colour Doppler)', E(116, 37, 1.9, 1.9), { lab: [132, 46.5] }),
      S('phr', 'nerve', 'Phr', 'Phrenic nerve (medial, on anterior scalene)', E(27, 33, 2.4, 1.7, -25), { ids: ['n-phrenic'], tex: 'root', lab: [26, 22] }),
      S('cp', 'point', 'CP', 'Corner pocket (artery + first rib + plexus)', PT(91, 54), { lab: [80, 68] }),
    ],
    injections: [
      { from: [160, 38], to: [92, 53.5], note: '1. Corner pocket (inferior trunk)', bathes: ['t-inf'],
        blobs: [{ c: [92, 53.5], r: [5, 2.6] }, { c: [99, 51.5], r: [7, 3], d: 0.3 }, { c: [91.5, 45], r: [3.2, 5], d: 0.5 }] },
      { from: [160, 21], to: [112, 15], note: '2. Above the plexus, then around it', bathes: ['t-sup', 't-mid', 't-inf'],
        blobs: [{ c: [112, 15], r: [8, 3] }, { c: [124, 18.5], r: [9, 3], d: 0.15 }, { c: [100, 16], r: [6, 3], d: 0.3 }, { c: [140, 26], r: [9, 4.5], d: 0.4 }, { c: [133, 34], r: [10, 4], d: 0.55 }, { c: [118, 42], r: [9, 3.5], d: 0.7 }, { c: [92, 30], r: [3, 6], d: 0.75 }] },
    ],
  },

  infraclavicular: {
    id: 'infraclavicular', w: 160, h: 150, cm: 40, fat: 8,
    sides: ['Ceph', 'Caud'],
    view: 'Parasagittal view, medial and inferior to the coracoid process (right side)',
    structures: [
      S('pmaj', 'muscle', 'PMaj', 'Pectoralis major', P([0, 8], [160, 8], [160, 72], [80, 52], [0, 31]), { fibre: 14, lab: [96, 28], inside: true }),
      S('pmin', 'muscle', 'PMin', 'Pectoralis minor', P([0, 43], [80, 60], [160, 77], [160, 103], [80, 82], [0, 60]), { fibre: 14, lab: [118, 85], inside: true }),
      S('ssc', 'muscle', 'SSc', 'Subscapularis', P([0, 124], [40, 128], [90, 134], [130, 131], [160, 128], [160, 150], [0, 150]), { fibre: 8, lab: [26, 140], inside: true }),
      S('rib', 'bone', 'Rib', 'Rib (keep the needle away)', L(2, [128, 141], [140, 138.5], [152, 138.5], [160, 140]), { lab: [146, 128] }),
      S('pleura', 'pleura', 'Pleura', 'Pleura (deep, medial)', L(0.8, [60, 148], [90, 145], [124, 144]), { lung: true, lab: [100, 140] }),
      S('taa', 'artery', 'TAA', 'Thoraco-acromial artery', E(34, 43, 2.6, 2.6), { lab: [44, 33] }),
      S('lpn', 'nerve', 'LPN', 'Lateral pectoral nerve', E(46, 49, 4.2, 2.1, 14), { ids: ['n-lat-pectoral'], tex: 'honeycomb', lab: [64, 44] }),
      S('aa', 'artery', 'AA', 'Axillary artery', E(68, 95, 11, 11), { lab: [68, 95], inside: true }),
      S('av', 'vein', 'AV', 'Axillary vein', E(124, 110, 15, 11), { lab: [124, 110], inside: true }),
      S('tda', 'artery', 'TDA', 'Thoracodorsal vessels', E(36, 116, 2.2, 2.2), { lab: [24, 112] }),
      S('lc', 'nerve', 'LC', 'Lateral cord (~9 o’clock)', E(53.5, 85, 3.2, 5.6, 18), { ids: ['cord-lat'], tex: 'honeycomb', lab: [64, 76] }),
      S('pc', 'nerve', 'PC', 'Posterior cord (~6 o’clock)', E(66, 115.5, 3.4, 5.5, -10), { ids: ['cord-post'], tex: 'honeycomb', lab: [50, 126] }),
      S('mc', 'nerve', 'MC', 'Medial cord (~3 o’clock)', E(84.5, 98, 3, 5.4, 8), { ids: ['cord-med'], tex: 'honeycomb', lab: [96, 86] }),
    ],
    injections: [
      { from: [0, 8], to: [60, 108], note: 'Posterior to the artery (6 o’clock): aim for U-shaped spread', bathes: ['lc', 'pc', 'mc'],
        blobs: [
          { c: [62, 109.5], r: [5.5, 3.5] },
          { c: [56, 105], r: [4.5, 4], d: 0.15 }, { c: [71, 110.5], r: [5, 3.5], d: 0.2 },
          { c: [52.5, 97], r: [4, 5], d: 0.35 }, { c: [79, 106], r: [4.5, 4], d: 0.4 },
          { c: [52, 88], r: [4, 5], d: 0.55 }, { c: [84, 99], r: [4, 5.5], d: 0.65 },
        ] },
    ],
  },

  axillary: {
    id: 'axillary', w: 160, h: 100, cm: 25, fat: 7,
    sides: ['Post', 'Ant'],
    view: 'Transverse view across the axillary fossa, arm abducted (right side)',
    structures: [
      S('tri', 'muscle', 'Tri', 'Triceps', P([0, 12], [14, 12], [32, 18], [48, 28], [64, 40], [90, 58], [120, 79], [150, 100], [0, 100]), { lab: [34, 64], inside: true }),
      S('bic', 'muscle', 'Bic', 'Biceps', P([80, 7.5], [120, 7.5], [160, 8.5], [160, 33], [124, 29], [96, 23], [80, 16]), { lab: [132, 18], inside: true }),
      S('ccb', 'muscle', 'CB', 'Coracobrachialis', P([76, 21], [96, 26], [124, 32], [160, 36], [160, 96], [150, 99], [122, 80], [94, 60], [76, 46], [71, 32]), { lab: [138, 72], inside: true }),
      S('fas', 'fascia', '', 'Fascia', [L(0.6, [0, 11.5], [16, 13], [34, 20]), L(0.6, [78, 49], [100, 64], [124, 81], [150, 100])], { nolabel: true }),
      S('ct', 'tendon', 'CT', 'Conjoint tendon (teres major / latissimus dorsi)', L(2.4, [34, 20.5], [48, 29], [62, 39], [78, 49.5]), { lab: [52, 46] }),
      S('hum', 'bone', 'Hum', 'Humerus', L(2.6, [114, 96], [124, 92.5], [136, 91.5], [148, 92.5], [158, 96]), { lab: [124, 85] }),
      S('veins', 'vein', 'V', 'Axillary veins (compressible)', [E(40, 15, 3.4, 2.5), E(43, 23.5, 2.3, 2.8), E(54, 8.8, 7, 1.5, -6)], { lab: [26, 31] }),
      S('aa', 'artery', 'AA', 'Axillary artery', E(66, 19, 8.5, 8.5), { lab: [66, 19], inside: true }),
      S('med', 'nerve', 'M', 'Median nerve (anterior / superficial)', E(85, 12.5, 5.6, 3, -6), { ids: ['n-median'], tex: 'honeycomb', lab: [92, 3.5] }),
      S('uln', 'nerve', 'U', 'Ulnar nerve (medial / posterior)', E(49, 13, 3.8, 2.9), { ids: ['n-ulnar'], tex: 'honeycomb', lab: [44, 3.5] }),
      S('rad', 'nerve', 'R', 'Radial nerve (deep, on the conjoint tendon)', E(53, 26.5, 4.8, 2.4, 32), { ids: ['n-radial'], tex: 'honeycomb', lab: [40, 41] }),
      S('mcn', 'nerve', 'MCN', 'Musculocutaneous nerve (in coracobrachialis)', E(122, 50, 5.4, 2.6, 18), { ids: ['n-musculocutaneous'], tex: 'honeycomb', lab: [108, 44] }),
      S('mcnf', 'nerve', 'MCNF', 'Medial cutaneous nerve of forearm', E(31, 9, 2, 1.5), { ids: ['n-mcn-forearm'], tex: 'root', lab: [14, 21] }),
    ],
    injections: [
      { from: [160, 40], to: [59, 29.5], note: '1. Deep to the artery (radial nerve)', bathes: ['rad'],
        blobs: [{ c: [60, 30], r: [6, 2.8] }, { c: [70, 30], r: [6, 2.6], d: 0.3 }, { c: [52, 30.5], r: [4.5, 3], d: 0.5 }] },
      { from: [160, 4], to: [74, 7], note: '2. Superficial to the artery (median and ulnar)', bathes: ['med', 'uln', 'mcnf'],
        blobs: [{ c: [74, 7.5], r: [6, 2.4] }, { c: [86, 8.5], r: [6, 2.4], d: 0.2 }, { c: [62, 8], r: [6, 2], d: 0.35 }, { c: [49, 9.5], r: [5, 3], d: 0.5 }] },
      { from: [160, 27], to: [127, 49], note: '3. Separate injection: musculocutaneous nerve', bathes: ['mcn'],
        blobs: [{ c: [123, 50], r: [8, 4] }, { c: [118, 47], r: [5, 3], d: 0.4 }] },
    ],
  },
};

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const fmt = (n) => +n.toFixed(2);
const pt = (p) => `${fmt(p[0])} ${fmt(p[1])}`;

function el(tag, attrs = {}, parent) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') n.textContent = v; else if (k === 'class') n.className = v; else n.setAttribute(k, v === true ? '' : v);
  }
  if (parent) parent.appendChild(n);
  return n;
}
function sv(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'text') n.textContent = v; else n.setAttribute(k, v); }
  if (parent) parent.appendChild(n);
  return n;
}

function rotate([x, y], deg) { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }

/** SVG path data for a shape (also used by canvas via Path2D). */
function shapeD(sh) {
  if (sh.t === 'e') {
    const [dx, dy] = rotate([sh.rx, 0], sh.rot);
    const p1 = [sh.cx + dx, sh.cy + dy], p2 = [sh.cx - dx, sh.cy - dy];
    return `M${pt(p1)} A${fmt(sh.rx)} ${fmt(sh.ry)} ${fmt(sh.rot)} 1 0 ${pt(p2)} A${fmt(sh.rx)} ${fmt(sh.ry)} ${fmt(sh.rot)} 1 0 ${pt(p1)}Z`;
  }
  const pts = sh.pts, n = pts.length;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  if (sh.t === 'l') {
    if (n === 2) return `M${pt(pts[0])} L${pt(pts[1])}`;
    let d = `M${pt(pts[0])}`;
    for (let i = 1; i < n - 1; i++) d += ` Q${pt(pts[i])} ${pt(i === n - 2 ? pts[n - 1] : mid(pts[i], pts[i + 1]))}`;
    return d;
  }
  if (sh.t === 'p') {
    let d = `M${pt(mid(pts[n - 1], pts[0]))}`;
    for (let i = 0; i < n; i++) d += ` Q${pt(pts[i])} ${pt(mid(pts[i], pts[(i + 1) % n]))}`;
    return d + 'Z';
  }
  return '';
}

/** Region below a pleura line, down to the scene floor. */
function lungD(sh, h) {
  const p = sh.pts;
  return shapeD(sh) + ` L${pt([p[p.length - 1][0], h])} L${pt([p[0][0], h])}Z`;
}

function shapeBox(sh) {
  if (sh.t === 'e') { const r = Math.max(sh.rx, sh.ry); return [sh.cx - r, sh.cy - r, sh.cx + r, sh.cy + r]; }
  if (sh.t === 'pt') return [sh.x, sh.y, sh.x, sh.y];
  const xs = sh.pts.map((p) => p[0]), ys = sh.pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

function nearestOnSegs(pts, q, closed) {
  let best = null, bd = Infinity;
  const segs = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const vx = b[0] - a[0], vy = b[1] - a[1];
    const t = clamp(((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / (vx * vx + vy * vy || 1));
    const p = [a[0] + vx * t, a[1] + vy * t];
    const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}

/** Where a leader line from `lab` should touch the structure (null = label sits inside). */
function leaderTarget(st, lab) {
  let best = null, bd = Infinity;
  for (const sh of st.shapes) {
    let p;
    if (sh.t === 'e') {
      const [lx, ly] = rotate([lab[0] - sh.cx, lab[1] - sh.cy], -sh.rot);
      const k = Math.hypot(lx / sh.rx, ly / sh.ry);
      if (k <= 1) return null;
      const [bx, by] = rotate([lx / k, ly / k], sh.rot);
      p = [sh.cx + bx, sh.cy + by];
    } else if (sh.t === 'pt') p = [sh.x, sh.y];
    else p = nearestOnSegs(sh.pts, lab, sh.t === 'p');
    const d = (p[0] - lab[0]) ** 2 + (p[1] - lab[1]) ** 2;
    if (d < bd) { bd = d; best = p; }
  }
  return bd < 1 ? null : best;
}

function shapeCentre(sh) {
  if (sh.t === 'e') return [sh.cx, sh.cy];
  if (sh.t === 'pt') return [sh.x, sh.y];
  const n = sh.pts.length;
  return [sh.pts.reduce((a, p) => a + p[0], 0) / n, sh.pts.reduce((a, p) => a + p[1], 0) / n];
}

/** Deterministic fascicle positions for a "honeycomb" nerve (shared by canvas + SVG). */
function fascicles(st, sh, i) {
  const rnd = mulberry32(hashStr(st.key + i));
  const n = clamp(Math.round((sh.rx * sh.ry) / 2.6), 3, 8);
  const r = Math.min(sh.rx, sh.ry) * (n > 4 ? 0.3 : 0.36);
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rnd() * 0.6;
    const rr = (k === 0 ? 0 : 0.55) + rnd() * 0.08;
    const [x, y] = rotate([Math.cos(a) * sh.rx * rr * (k === 0 ? 0 : 1), Math.sin(a) * sh.ry * rr * (k === 0 ? 0 : 1)], sh.rot);
    out.push({ x: sh.cx + x, y: sh.cy + y, r: r * (0.85 + rnd() * 0.3) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Simulated B-mode image (computed once per block at a fixed resolution)
// ---------------------------------------------------------------------------
const BASE_W = 640;
const baseCache = new Map();

function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function buildBase(scene) {
  if (baseCache.has(scene.id)) return baseCache.get(scene.id);
  const s = BASE_W / scene.w, W = BASE_W, H = Math.round(scene.h * s);
  const ce = makeCanvas(W, H), ca = makeCanvas(W, H);
  const e = ce.getContext('2d', { willReadFrequently: true });
  const a = ca.getContext('2d', { willReadFrequently: true });
  e.setTransform(s, 0, 0, s, 0, 0); a.setTransform(s, 0, 0, s, 0, 0);
  e.lineCap = 'round'; a.lineCap = 'round';
  const rnd = mulberry32(hashStr(scene.id));
  const g = (v) => `rgb(${v | 0},${v | 0},${v | 0})`;
  const sw = scene.w, sh = scene.h;

  // Background soft tissue with fascial septa.
  e.fillStyle = g(50); e.fillRect(0, 0, sw, sh);
  a.fillStyle = g(128); a.fillRect(0, 0, sw, sh);
  const septa = (x0, y0, x1, y1, n, base) => {
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd()), len = 1.5 + rnd() * 6, ang = (rnd() - 0.5) * 0.5;
      e.strokeStyle = g(base + rnd() * 50); e.lineWidth = 0.2 + rnd() * 0.3;
      e.beginPath(); e.moveTo(x, y); e.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); e.stroke();
    }
  };
  septa(0, 0, sw, sh, (sw * sh) / 34, 75);
  // Subcutaneous fat: darker with bright strands.
  e.fillStyle = g(38); e.fillRect(0, 0, sw, scene.fat);
  septa(0, 1.5, sw, scene.fat, sw / 1.4, 120);

  for (const st of scene.structures) paintEcho(e, a, st, scene, rnd, g);

  // Skin: bright entry line.
  e.fillStyle = g(150); e.fillRect(0, 0, sw, 1.4);
  e.strokeStyle = g(225); e.lineWidth = 0.6; e.beginPath(); e.moveTo(0, 1.6); e.lineTo(sw, 1.6); e.stroke();

  const E1 = e.getImageData(0, 0, W, H).data, A1 = a.getImageData(0, 0, W, H).data;
  const N = W * H;
  // Echo map, lightly blurred (3x3) to soften the vector edges.
  const ech = new Float32Array(N), att = new Uint8Array(N);
  for (let i = 0; i < N; i++) { ech[i] = E1[i * 4] / 255; att[i] = A1[i * 4]; }
  const blur = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let sum = 0, c = 0;
    for (let dy = -1; dy <= 1; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx < 0 || xx >= W) continue; sum += ech[yy * W + xx]; c++; } }
    blur[y * W + x] = sum / c;
  }
  // Speckle: Rayleigh noise smoothed more laterally than axially (elongated speckle).
  const raw = new Float32Array(N);
  for (let i = 0; i < N; i++) raw[i] = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * 0.8;
  const tmp = new Float32Array(N), sp = new Float32Array(N);
  const kx = [1, 2, 3, 2, 1];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let sum = 0, c = 0;
    for (let k = -2; k <= 2; k++) { const xx = x + k; if (xx < 0 || xx >= W) continue; sum += raw[y * W + xx] * kx[k + 2]; c += kx[k + 2]; }
    tmp[y * W + x] = sum / c;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, up = y > 0 ? tmp[i - W] : tmp[i], dn = y < H - 1 ? tmp[i + W] : tmp[i];
    sp[i] = (up + 2 * tmp[i] + dn) / 4;
  }
  // Column walk: attenuation, acoustic shadow under bone, enhancement under fluid.
  const out = e.createImageData(W, H), o = out.data;
  for (let x = 0; x < W; x++) {
    let f = 1;
    const edge = Math.min(1, Math.min(x, W - 1 - x) / (W * 0.015));
    for (let y = 0; y < H; y++) {
      const i = y * W + x, depth = y / H;
      const tgc = 0.92 + 0.22 * depth;
      let v = blur[i] * f * tgc * (0.25 + 0.95 * sp[i]) + 0.012 * sp[i];
      v = Math.pow(clamp(v, 0, 2), 0.95) * 1.3 * edge;
      const b = clamp(v) * 255;
      o[i * 4] = b; o[i * 4 + 1] = b; o[i * 4 + 2] = Math.min(255, b * 1.02 + 1); o[i * 4 + 3] = 255;
      const av = att[i];
      if (av < 50) f *= 0.8;
      else if (av > 200) f = Math.min(1.4, f * 1.006);
      else f = f > 1 ? 1 + (f - 1) * 0.985 : f * 0.99965;
    }
  }
  const base = makeCanvas(W, H);
  base.getContext('2d').putImageData(out, 0, 0);
  baseCache.set(scene.id, base);
  return base;
}

function paintEcho(e, a, st, scene, rnd, g) {
  const paths = st.shapes.filter((sh) => sh.t !== 'pt').map((sh) => ({ sh, p: new Path2D(shapeD(sh)) }));
  switch (st.kind) {
    case 'muscle':
      for (const { sh, p } of paths) {
        e.save(); e.fillStyle = g(34); e.fill(p); e.clip(p);
        const [x0, y0, x1, y1] = shapeBox(sh), area = (x1 - x0) * (y1 - y0);
        if (st.fibre == null) {
          // Cross-section: "starry night" speckled perimysium.
          for (let i = 0; i < area / 6; i++) {
            const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd());
            e.fillStyle = g(80 + rnd() * 70);
            if (rnd() < 0.6) { e.beginPath(); e.arc(x, y, 0.2 + rnd() * 0.35, 0, 7); e.fill(); }
            else { e.strokeStyle = e.fillStyle; e.lineWidth = 0.25; e.beginPath(); e.moveTo(x, y); e.lineTo(x + 0.8 + rnd() * 1.6, y + (rnd() - 0.5) * 0.8); e.stroke(); }
          }
        } else {
          // Longitudinal: striations along the fibre direction.
          const ang = (st.fibre * Math.PI) / 180;
          for (let i = 0; i < area / 7; i++) {
            const x = lerp(x0 - 10, x1, rnd()), y = lerp(y0, y1, rnd()), len = 5 + rnd() * 16, aa = ang + (rnd() - 0.5) * 0.1;
            e.strokeStyle = g(80 + rnd() * 60); e.lineWidth = 0.25 + rnd() * 0.3;
            e.beginPath(); e.moveTo(x, y); e.lineTo(x + Math.cos(aa) * len, y + Math.sin(aa) * len); e.stroke();
          }
        }
        e.restore();
        e.strokeStyle = g(150); e.lineWidth = 0.5; e.stroke(p);
      }
      break;
    case 'artery':
      for (const { p } of paths) { e.fillStyle = g(4); e.fill(p); e.strokeStyle = g(215); e.lineWidth = 0.85; e.stroke(p); a.fillStyle = g(255); a.fill(p); }
      break;
    case 'vein':
      for (const { p } of paths) { e.fillStyle = g(9); e.fill(p); e.strokeStyle = g(120); e.lineWidth = 0.4; e.stroke(p); a.fillStyle = g(255); a.fill(p); }
      break;
    case 'nerve':
      paths.forEach(({ sh, p }, i) => {
        if (st.tex === 'honeycomb') {
          e.fillStyle = g(150); e.fill(p);
          for (const f of fascicles(st, sh, i)) { e.fillStyle = g(26); e.beginPath(); e.arc(f.x, f.y, f.r, 0, 7); e.fill(); }
          e.strokeStyle = g(185); e.lineWidth = 0.45; e.stroke(p);
        } else if (st.tex === 'split') {
          e.fillStyle = g(130); e.fill(p);
          for (const sgn of [-1, 1]) {
            const [dx, dy] = rotate([sgn * sh.rx * 0.45, 0], sh.rot);
            e.fillStyle = g(20); e.beginPath(); e.ellipse(sh.cx + dx, sh.cy + dy, sh.rx * 0.42, sh.ry * 0.8, (sh.rot * Math.PI) / 180, 0, 7); e.fill();
          }
          e.strokeStyle = g(170); e.lineWidth = 0.45; e.stroke(p);
        } else {
          e.fillStyle = g(20); e.fill(p); e.strokeStyle = g(165); e.lineWidth = 0.5; e.stroke(p);
        }
      });
      break;
    case 'sheath':
      for (const { sh, p } of paths) {
        e.save(); e.fillStyle = g(105); e.fill(p); e.clip(p);
        const [x0, y0, x1, y1] = shapeBox(sh);
        for (let i = 0; i < (x1 - x0) * (y1 - y0) / 2; i++) { e.fillStyle = g(120 + rnd() * 80); e.beginPath(); e.arc(lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), 0.3 + rnd() * 0.4, 0, 7); e.fill(); }
        e.restore();
      }
      break;
    case 'tendon':
      for (const { sh, p } of paths) {
        e.strokeStyle = g(205); e.lineWidth = sh.w; e.stroke(p);
        e.strokeStyle = g(250); e.lineWidth = sh.w * 0.22; e.stroke(p);
        a.strokeStyle = g(90); a.lineWidth = sh.w; a.stroke(p);
      }
      break;
    case 'fascia':
      for (const { sh, p } of paths) { e.strokeStyle = g(180); e.lineWidth = sh.w; e.stroke(p); }
      break;
    case 'bone':
      for (const { sh, p } of paths) {
        e.strokeStyle = g(255); e.lineWidth = sh.w; e.stroke(p);
        a.strokeStyle = g(0); a.lineWidth = sh.w * 0.9; a.stroke(p);
      }
      break;
    case 'pleura':
      for (const { sh, p } of paths) {
        if (st.lung) {
          // Lung: grainy, with A-line reverberations parallel to the pleura.
          const lp = new Path2D(lungD(sh, scene.h));
          e.save(); e.fillStyle = g(58); e.fill(lp); e.clip(lp);
          const depth = Math.max(8, Math.min(...sh.pts.map((q) => q[1])) * 0.35);
          for (let k = 1; k <= 3; k++) {
            e.save(); e.translate(0, depth * k); e.strokeStyle = g(150 - k * 30); e.lineWidth = 0.7; e.stroke(p); e.restore();
          }
          e.restore();
        }
        e.strokeStyle = g(235); e.lineWidth = sh.w; e.stroke(p);
      }
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// Animation timeline: advance needle -> inject -> (redirect -> inject) ...
// ---------------------------------------------------------------------------
function buildTimeline(scene) {
  const phases = []; let t = 0;
  scene.injections.forEach((inj, i) => {
    const adv = i === 0 ? 1.9 : 1.3;
    phases.push({ type: 'adv', i, t0: t, t1: t + adv }); t += adv;
    phases.push({ type: 'inj', i, t0: t, t1: t + 2.1 }); t += 2.1;
  });
  return { phases, T: t, advEnd0: phases[0].t1 };
}

function frameAt(scene, tl, t) {
  const growth = scene.injections.map(() => 0);
  let from = null, tip = null, cur = 0;
  for (const p of tl.phases) {
    const inj = scene.injections[p.i];
    if (t >= p.t1) { if (p.type === 'inj') growth[p.i] = 1; from = inj.from; tip = inj.to; cur = p.i; continue; }
    if (t < p.t0) break;
    const u = (t - p.t0) / (p.t1 - p.t0);
    cur = p.i;
    if (p.type === 'adv') {
      if (p.i === 0) { from = inj.from; tip = lerp2(inj.from, inj.to, easeInOut(u)); }
      else {
        const prev = scene.injections[p.i - 1];
        if (u < 0.4) { const v = easeInOut(u / 0.4); from = prev.from; tip = lerp2(prev.to, lerp2(prev.from, prev.to, 0.3), v); }
        else {
          const v = easeInOut((u - 0.4) / 0.6);
          from = inj.from;
          tip = lerp2(lerp2(inj.from, inj.to, 0.3), inj.to, v);
        }
      }
    } else { growth[p.i] = easeOut(u); from = inj.from; tip = inj.to; }
    break;
  }
  return { from, tip, growth, cur };
}

function blobScale(g, d = 0) { return easeOut(clamp((g - d) / (1 - d))); }

// ---------------------------------------------------------------------------
// mount
// ---------------------------------------------------------------------------
export function mount(containerEl, bus) {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const root = el('div', { class: 'bpus' }, containerEl);
  const lastDown = { type: 'mouse', at: -1e9 };
  root.addEventListener('pointerdown', (e) => { lastDown.type = e.pointerType || 'mouse'; lastDown.at = performance.now(); }, true);
  const st = {
    block: null, step: 1, labels: false, t: 0, playing: false, target: 0,
    localHover: null, localSel: null, emittedHover: false, userScans: new Map(),
  };
  let scene = null, tl = null, raf = 0, lastTs = 0;
  const unsubs = [];

  // ---- chooser ----
  const chooser = el('section', { class: 'bpus-chooser', 'aria-label': 'Choose a block' }, root);
  el('h3', { class: 'bpus-h', text: 'Ultrasound anatomy: choose a block' }, chooser);
  el('p', { class: 'bpus-muted', text: 'Each block shows a simulated scan beside a labelled diagram, with the needle path and local anaesthetic spread.' }, chooser);
  const chooserGrid = el('div', { class: 'bpus-chooser-grid' }, chooser);
  const thumbs = [];
  for (const id of BLOCK_ORDER) {
    const b = el('button', { type: 'button', class: 'bpus-card', 'data-block': id }, chooserGrid);
    const c = el('canvas', { class: 'bpus-thumb', width: 320, height: Math.round(320 * SCENES[id].h / 160), 'aria-hidden': 'true' }, b);
    thumbs.push([id, c]);
    el('span', { class: 'bpus-card-name', text: BLOCKS[id].name.replace(/ \(.*\)/, '') }, b);
    el('span', { class: 'bpus-card-sub', text: `Targets the ${levelWord(BLOCKS[id].level)}` }, b);
    b.addEventListener('click', () => chooseBlock(id));
  }

  // ---- main ----
  const main = el('section', { class: 'bpus-main' }, root);
  const head = el('div', { class: 'bpus-head' }, main);
  const tabs = el('div', { class: 'bpus-tabs', role: 'group', 'aria-label': 'Block' }, head);
  const tabBtns = {};
  for (const id of BLOCK_ORDER) {
    tabBtns[id] = el('button', { type: 'button', class: 'bpus-tab', text: shortBlock(id) }, tabs);
    tabBtns[id].addEventListener('click', () => chooseBlock(id));
  }
  const allBtn = el('button', { type: 'button', class: 'bpus-tab bpus-tab-all', text: 'Overview', title: 'Show all four scans (keeps the block chosen in the other views)' }, tabs);
  // Local view only: the overview grid does not clear the block for the rest of the app.
  allBtn.addEventListener('click', () => showBlock(null));

  const controls = el('div', { class: 'bpus-controls' }, main);
  const steps = el('ol', { class: 'bpus-steps', 'aria-label': 'Steps' }, controls);
  const STEP_NAMES = ['Scan', 'Identify', 'Needle', 'Inject'];
  const stepBtns = STEP_NAMES.map((name, i) => {
    const li = el('li', {}, steps);
    const b = el('button', { type: 'button', class: 'bpus-step' }, li);
    el('span', { class: 'bpus-step-n', text: String(i + 1), 'aria-hidden': 'true' }, b);
    el('span', { text: name }, b);
    b.setAttribute('aria-label', `Step ${i + 1}: ${name}`);
    b.addEventListener('click', () => setStep(i + 1, true));
    return b;
  });
  const playBtn = el('button', { type: 'button', class: 'bpus-btn bpus-play' }, controls);
  playBtn.addEventListener('click', () => { if (st.playing) stop(); else play(); });
  const labLbl = el('label', { class: 'bpus-switch' }, controls);
  const labChk = el('input', { type: 'checkbox' }, labLbl);
  el('span', { text: 'Labels on scan' }, labLbl);
  labChk.addEventListener('change', () => { st.labels = labChk.checked; renderLabels(); });

  const panels = el('div', { class: 'bpus-panels' }, main);
  // Simulated scan
  const simFig = el('figure', { class: 'bpus-panel bpus-sim' }, panels);
  const simHead = el('div', { class: 'bpus-panel-head' }, simFig);
  el('span', { class: 'bpus-panel-title', text: 'Simulated ultrasound' }, simHead);
  el('span', { class: 'bpus-tag', text: 'Drawn, not a real scan' }, simHead);
  const stage = el('div', { class: 'bpus-stage' }, simFig);
  const canvas = el('canvas', { class: 'bpus-canvas', role: 'img' }, stage);
  const usSvg = sv('svg', { class: 'bpus-overlay', preserveAspectRatio: 'none' }, stage);
  const injNote = el('div', { class: 'bpus-injnote', hidden: true }, simFig);
  const simCap = el('figcaption', { class: 'bpus-cap' }, simFig);

  // Idealised diagram
  const idFig = el('figure', { class: 'bpus-panel bpus-ideal' }, panels);
  const idHead = el('div', { class: 'bpus-panel-head' }, idFig);
  el('span', { class: 'bpus-panel-title', text: 'Idealised diagram' }, idHead);
  const idStatus = el('span', { class: 'bpus-tag' }, idHead);
  const idWrap = el('div', { class: 'bpus-idwrap' }, idFig);
  const idSvg = sv('svg', { class: 'bpus-idsvg', role: 'img' }, idWrap);
  const idCap = el('figcaption', { class: 'bpus-cap' }, idFig);

  // Reference scan (owner's REAL_SCANS) and the user's own scan
  const refFig = el('figure', { class: 'bpus-panel bpus-photo', hidden: true }, panels);
  const refHead = el('div', { class: 'bpus-panel-head' }, refFig);
  el('span', { class: 'bpus-panel-title', text: 'Reference scan' }, refHead);
  const refImg = el('img', { alt: '', loading: 'lazy' }, el('div', { class: 'bpus-photo-wrap' }, refFig));
  el('figcaption', { class: 'bpus-cap', text: 'De-identified department scan.' }, refFig);

  const yourFig = el('figure', { class: 'bpus-panel bpus-photo', hidden: true }, panels);
  const yourHead = el('div', { class: 'bpus-panel-head' }, yourFig);
  el('span', { class: 'bpus-panel-title', text: 'Your scan' }, yourHead);
  const yourRemove = el('button', { type: 'button', class: 'bpus-btn bpus-btn-sm', text: 'Remove' }, yourHead);
  const yourImg = el('img', { alt: 'Your own ultrasound image' }, el('div', { class: 'bpus-photo-wrap' }, yourFig));
  el('figcaption', { class: 'bpus-cap', text: 'Shown only on this device. It is not uploaded anywhere.' }, yourFig);

  const drop = el('div', { class: 'bpus-drop' }, main);
  const fileInput = el('input', { type: 'file', accept: 'image/*', class: 'bpus-file', id: `bpus-file-${Math.random().toString(36).slice(2, 8)}` }, drop);
  const dropText = el('p', {}, drop);
  el('strong', { text: 'Your scan: ' }, dropText);
  dropText.append('compare one of your own images side by side. ');
  const chooseLbl = el('label', { class: 'bpus-btn bpus-btn-sm', for: fileInput.id, text: 'Choose image' }, dropText);
  dropText.append(' or drop it here. It stays on your device.');
  void chooseLbl;

  const readout = el('p', { class: 'bpus-readout', 'aria-live': 'polite' }, main);
  const info = el('section', { class: 'bpus-info', 'aria-live': 'polite' }, main);
  const legend = el('section', { class: 'bpus-legend', 'aria-label': 'Structures in this view' }, main);

  // ---- user scan handling ----
  function setUserScan(file) {
    if (!file || !file.type.startsWith('image/') || !st.block) return;
    const old = st.userScans.get(st.block);
    if (old) URL.revokeObjectURL(old);
    st.userScans.set(st.block, URL.createObjectURL(file));
    renderPhotos();
  }
  fileInput.addEventListener('change', () => { setUserScan(fileInput.files[0]); fileInput.value = ''; });
  for (const target of [drop, stage]) {
    target.addEventListener('dragover', (ev) => { ev.preventDefault(); drop.classList.add('is-over'); });
    target.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    target.addEventListener('drop', (ev) => { ev.preventDefault(); drop.classList.remove('is-over'); setUserScan(ev.dataTransfer?.files?.[0]); });
  }
  yourRemove.addEventListener('click', () => {
    const u = st.userScans.get(st.block); if (u) URL.revokeObjectURL(u);
    st.userScans.delete(st.block); renderPhotos();
  });
  function renderPhotos() {
    const u = st.block && st.userScans.get(st.block);
    yourFig.hidden = !u; if (u) yourImg.src = u;
    const ref = st.block && REAL_SCANS[st.block];
    refFig.hidden = !ref;
    if (ref) { refImg.src = ref; refImg.alt = `Real ultrasound image: ${BLOCKS[st.block].name}`; }
  }

  // ---- block switching ----
  function chooseBlock(id) {
    if (id === st.block && id !== null) return;
    bus.emit('block', { id, source: SOURCE });
    if (st.block !== id) showBlock(id); // in case the bus does not echo to the emitter
  }

  function showBlock(id) {
    stop();
    st.block = id && SCENES[id] ? id : null;
    st.localHover = st.localSel = null;
    chooser.hidden = !!st.block; main.hidden = !st.block;
    if (!st.block) { drawThumbs(); return; }
    scene = SCENES[st.block];
    tl = buildTimeline(scene);
    for (const [k, b] of Object.entries(tabBtns)) b.setAttribute('aria-pressed', String(k === st.block));
    stage.style.aspectRatio = `${scene.w} / ${scene.h}`;
    usSvg.setAttribute('viewBox', `0 0 ${scene.w} ${scene.h}`);
    canvas.setAttribute('aria-label', `Simulated ultrasound image: ${BLOCKS[st.block].name}. ${scene.view}. Screen left is ${scene.sides[0]}, right is ${scene.sides[1]}.`);
    buildBase(scene);
    buildUsSvg(); buildIdeal(); buildLegend(); renderPhotos();
    simCap.textContent = `${scene.view}. Screen left: ${scene.sides[0]}. Right: ${scene.sides[1]}. Depth marks every 5 mm.`;
    idCap.textContent = `Same cross-section as a clean diagram. Probe on top, orientation marker on the ${scene.sides[0]} side.`;
    setStep(1, false);
    resize();
  }

  function drawThumbs() {
    for (const [id, c] of thumbs) {
      if (c.dataset.done) continue;
      const base = buildBase(SCENES[id]);
      c.getContext('2d').drawImage(base, 0, 0, c.width, c.height);
      c.dataset.done = '1';
    }
  }

  // ---- steps & animation ----
  function setStep(n, animate) {
    st.step = n;
    stepBtns.forEach((b, i) => { b.classList.toggle('is-done', i + 1 < n); if (i + 1 === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    if (n === 2 && !st.labels) { st.labels = true; labChk.checked = true; }
    if (n <= 2) { stop(); st.t = 0; }
    else if (n === 3) { st.t = animate && !reduceMotion ? 0 : tl.advEnd0; st.target = tl.advEnd0; if (animate && !reduceMotion) run(); else stop(); }
    else if (n === 4) {
      if (!animate || reduceMotion) { st.t = tl.T; stop(); }
      else { if (st.t < tl.advEnd0 || st.t >= tl.T) st.t = tl.advEnd0; st.target = tl.T; run(); }
    }
    renderInfo(); renderLabels(); renderFrame();
  }

  function play() {
    if (reduceMotion) { setStep(4, false); return; }
    st.step = 3; st.t = 0; st.target = tl.T;
    stepBtns.forEach((b, i) => { b.classList.toggle('is-done', i < 2); if (i === 2) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    renderInfo(); renderLabels();
    run();
  }
  function run() {
    st.playing = true; updatePlay();
    cancelAnimationFrame(raf); lastTs = 0;
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    st.playing = false; cancelAnimationFrame(raf); raf = 0; updatePlay();
  }
  function tick(ts) {
    const dt = lastTs ? Math.min(0.05, (ts - lastTs) / 1000) : 0;
    lastTs = ts;
    st.t = Math.min(st.target, st.t + dt);
    if (st.step === 3 && st.t > tl.advEnd0 + 0.01 && st.target > tl.advEnd0) {
      st.step = 4;
      stepBtns.forEach((b, i) => { b.classList.toggle('is-done', i < 3); if (i === 3) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
      renderInfo(); renderLabels();
    }
    renderFrame();
    if (st.t >= st.target) { stop(); renderFrame(); return; }
    raf = requestAnimationFrame(tick);
  }
  function updatePlay() {
    playBtn.textContent = st.playing ? 'Pause' : (st.t >= (tl?.T ?? 1) ? 'Replay' : 'Play');
    playBtn.setAttribute('aria-label', st.playing ? 'Pause the animation' : 'Play needle and injection animation');
  }

  // ---- simulated scan overlay (SVG) ----
  let usHl, usLabels, usTraj, idLabels, idNeedle, idLA, idTraj, idTarget;
  function buildUsSvg() {
    usSvg.replaceChildren();
    // Hit areas + highlight outlines
    usHl = sv('g', { class: 'bpus-hl' }, usSvg);
    for (const s of scene.structures) {
      if (s.kind === 'sheath' || s.kind === 'fascia') continue;
      const g = sv('g', { 'data-key': s.key, class: `bpus-item k-${s.kind}` }, usHl);
      for (const sh of s.shapes) {
        if (sh.t === 'pt') { sv('circle', { cx: sh.x, cy: sh.y, r: 3, class: 'bpus-hit bpus-outline' }, g); continue; }
        sv('path', { d: shapeD(sh), class: `bpus-hit bpus-outline${sh.t === 'l' ? ' is-line' : ''}`, 'vector-effect': 'non-scaling-stroke' }, g);
      }
      wireItem(g, s);
    }
    usTraj = sv('line', { class: 'bpus-traj', 'vector-effect': 'non-scaling-stroke' }, usSvg);
    usLabels = sv('g', { class: 'bpus-labels' }, usSvg);
    // Orientation: side text + marker dot on the left (probe marker side).
    const o = sv('g', { class: 'bpus-orient', 'aria-hidden': 'true' }, usSvg);
    o.dataset.role = 'orient';
  }

  function wireItem(g, s) {
    g.addEventListener('pointerenter', (e) => { if (!isTouch(e)) setLocalHover(s.key); });
    g.addEventListener('pointerleave', (e) => { if (!isTouch(e)) setLocalHover(null); });
    g.addEventListener('click', (ev) => { ev.stopPropagation(); clickItem(s); });
  }

  // Touch: taps select; they never set a hover (it would stick in the other views).
  function isTouch(e) { return !!e.pointerType && e.pointerType !== 'mouse'; }
  function recentTap() { return lastDown.type !== 'mouse' && performance.now() - lastDown.at < 800; }

  function setLocalHover(key) {
    if (st.localHover === key) return;
    st.localHover = key;
    const s = key && scene.structures.find((x) => x.key === key);
    if (s && s.ids.length) { bus.emit('hover', { id: s.ids[0], source: SOURCE }); st.emittedHover = true; }
    else if (st.emittedHover) { st.emittedHover = false; bus.emit('hover', { id: null, source: SOURCE }); }
    applyHighlight();
  }
  function clickItem(s) {
    if (s.ids.length) {
      const id = bus.state.selected === s.ids[0] ? null : s.ids[0];
      st.localSel = null;
      bus.emit('select', { id, source: SOURCE });
    } else {
      st.localSel = st.localSel === s.key ? null : s.key;
    }
    applyHighlight();
  }

  // ---- labels (rebuilt on resize so text stays ~12px) ----
  function labelGroup(parent, s, k, interactive, onIdeal) {
    if (s.nolabel || !s.short) return;
    const fs = 12 / k, padX = 4 / k, h = fs * 1.45;
    const lab = s.lab || shapeCentre(s.shapes[0]);
    const g = sv('g', { 'data-key': s.key, class: `bpus-lab k-${s.kind}${s.ids.length ? ' has-id' : ''}` }, parent);
    const tgt = s.inside ? null : leaderTarget(s, lab);
    if (tgt) {
      sv('line', { x1: lab[0], y1: lab[1], x2: tgt[0], y2: tgt[1], class: 'bpus-leader', 'vector-effect': 'non-scaling-stroke' }, g);
      sv('circle', { cx: tgt[0], cy: tgt[1], r: 1.6 / k, class: 'bpus-leader-dot' }, g);
    }
    const w = s.short.length * fs * 0.6 + padX * 2;
    sv('rect', { x: lab[0] - w / 2, y: lab[1] - h / 2, width: w, height: h, rx: h / 2, class: 'bpus-pill' }, g);
    sv('text', { x: lab[0], y: lab[1] + fs * 0.35, 'font-size': fs, class: 'bpus-pill-text', text: s.short }, g);
    sv('title', { text: `${s.label} (${KIND_NAMES[s.kind] || s.kind})` }, g);
    if (interactive) {
      g.setAttribute('tabindex', onIdeal ? '0' : '-1');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${s.label}${s.ids.length ? ', select to highlight across views' : ''}`);
      wireItem(g, s);
      g.addEventListener('focus', () => { if (!recentTap()) setLocalHover(s.key); });
      g.addEventListener('blur', () => setLocalHover(null));
      g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); clickItem(s); } });
    }
  }

  function renderLabels() {
    if (!scene) return;
    const kUs = (usSvg.clientWidth || 600) / scene.w;
    usLabels.replaceChildren();
    if (st.labels) for (const s of scene.structures) labelGroup(usLabels, s, kUs, true, false);
    usLabels.style.display = st.labels ? '' : 'none';
    // Orientation text
    const o = usSvg.querySelector('[data-role="orient"]');
    o.replaceChildren();
    const fs = 11 / kUs;
    sv('circle', { cx: 4.5 / kUs * 2, cy: 7 / kUs * 2, r: 4 / kUs, class: 'bpus-marker' }, o);
    sv('text', { x: 16 / kUs, y: 7 / kUs * 2 + fs * 0.35, 'font-size': fs, class: 'bpus-side', text: scene.sides[0] }, o);
    sv('text', { x: scene.w - 16 / kUs, y: 7 / kUs * 2 + fs * 0.35, 'font-size': fs, class: 'bpus-side', 'text-anchor': 'end', text: scene.sides[1] }, o);
    // Ideal labels
    const kId = (idSvg.clientWidth || 600) / scene.w;
    idLabels.replaceChildren();
    for (const s of scene.structures) labelGroup(idLabels, s, kId, true, true);
    renderIdealOverlays();
    applyHighlight();
  }

  // ---- idealised diagram ----
  const TOP = 18; // room above the skin for the probe
  function buildIdeal() {
    idSvg.replaceChildren();
    idSvg.setAttribute('viewBox', `0 ${-TOP} ${scene.w} ${scene.h + TOP}`);
    idSvg.setAttribute('aria-label', `Idealised labelled diagram: ${BLOCKS[st.block].name}. ${scene.view}.`);
    idWrap.style.aspectRatio = `${scene.w} / ${scene.h + TOP}`;
    const defs = sv('defs', {}, idSvg);
    const clipId = `bpus-clip-${st.block}-${Math.random().toString(36).slice(2, 7)}`;
    sv('rect', { x: 0, y: 0, width: scene.w, height: scene.h }, sv('clipPath', { id: clipId }, defs));
    sv('rect', { x: 0, y: -TOP, width: scene.w, height: TOP, class: 'id-air' }, idSvg);
    const body = sv('g', { 'clip-path': `url(#${clipId})` }, idSvg);
    sv('rect', { x: 0, y: 0, width: scene.w, height: scene.h, class: 'id-tissue' }, body);
    sv('rect', { x: 0, y: 0, width: scene.w, height: scene.fat, class: 'id-fat' }, body);
    sv('line', { x1: 0, y1: 0.6, x2: scene.w, y2: 0.6, class: 'id-skin', 'vector-effect': 'non-scaling-stroke' }, body);
    for (const s of scene.structures) {
      const g = sv('g', { 'data-key': s.key, class: `bpus-item id-s k-${s.kind}` }, body);
      s.shapes.forEach((sh, i) => {
        if (sh.t === 'pt') { sv('circle', { cx: sh.x, cy: sh.y, r: 3.2, class: 'id-point bpus-outline', 'vector-effect': 'non-scaling-stroke' }, g); return; }
        if (s.kind === 'pleura' && s.lung) sv('path', { d: lungD(sh, scene.h), class: 'id-lung' }, g);
        const isLine = sh.t === 'l';
        sv('path', { d: shapeD(sh), class: `id-shape bpus-outline${isLine ? ' is-line' : ''}`, 'stroke-width': isLine ? sh.w * (s.kind === 'bone' ? 1.6 : 1) : null }, g);
        if (s.kind === 'nerve' && s.tex === 'honeycomb') for (const f of fascicles(s, sh, i)) sv('circle', { cx: f.x, cy: f.y, r: f.r, class: 'id-fasc' }, g);
        if (s.kind === 'nerve' && s.tex === 'split') {
          for (const sgn of [-1, 1]) { const [dx, dy] = rotate([sgn * sh.rx * 0.45, 0], sh.rot); sv('ellipse', { cx: sh.cx + dx, cy: sh.cy + dy, rx: sh.rx * 0.38, ry: sh.ry * 0.7, transform: `rotate(${sh.rot} ${sh.cx + dx} ${sh.cy + dy})`, class: 'id-fasc' }, g); }
        }
        if (s.kind === 'muscle' && s.fibre != null) {
          const [x0, y0, x1, y1] = shapeBox(sh); const rnd = mulberry32(hashStr(s.key));
          const ang = (s.fibre * Math.PI) / 180; const clip2 = `${clipId}-${s.key}-${i}`;
          sv('path', { d: shapeD(sh) }, sv('clipPath', { id: clip2 }, defs));
          const fg = sv('g', { 'clip-path': `url(#${clip2})`, class: 'id-fibres' }, g);
          for (let y = y0 - 40; y < y1 + 10; y += 4.5) {
            const x = x0 - 5 + rnd() * 3;
            sv('line', { x1: x, y1: y, x2: x + Math.cos(ang) * (x1 - x0 + 10), y2: y + Math.sin(ang) * (x1 - x0 + 10), 'vector-effect': 'non-scaling-stroke' }, fg);
          }
        }
      });
      if (s.kind !== 'sheath' && s.kind !== 'fascia') wireItem(g, s);
    }
    idLA = sv('g', { class: 'id-la' }, body);
    idTraj = sv('line', { class: 'bpus-traj id-traj', 'vector-effect': 'non-scaling-stroke' }, idSvg);
    idNeedle = sv('g', { class: 'id-needle' }, idSvg);
    idTarget = sv('g', { class: 'id-target' }, idSvg);
    // Probe on the skin with the orientation marker on the left.
    const probe = sv('g', { class: 'id-probe', 'aria-hidden': 'true' }, idSvg);
    sv('rect', { x: 22, y: -TOP + 4, width: scene.w - 44, height: TOP - 5, rx: 3, class: 'id-probe-body' }, probe);
    sv('rect', { x: 22, y: -1.6, width: scene.w - 44, height: 1.6, class: 'id-probe-face' }, probe);
    sv('circle', { cx: 28, cy: -TOP / 2 + 1.5, r: 2, class: 'bpus-marker' }, probe);
    probe.dataset.role = 'probe';
    idLabels = sv('g', { class: 'bpus-labels' }, idSvg);
  }

  function renderIdealOverlays() {
    if (!scene) return;
    const k = (idSvg.clientWidth || 600) / scene.w, fs = 11 / k;
    const probe = idSvg.querySelector('[data-role="probe"]');
    probe.querySelectorAll('text').forEach((n) => n.remove());
    sv('text', { x: 32, y: -TOP / 2 + 1.5 + fs * 0.35, 'font-size': fs, class: 'id-probe-text', text: scene.sides[0] }, probe);
    sv('text', { x: scene.w - 26, y: -TOP / 2 + 1.5 + fs * 0.35, 'font-size': fs, class: 'id-probe-text', 'text-anchor': 'end', text: scene.sides[1] }, probe);
    sv('text', { x: scene.w / 2, y: -TOP / 2 + 1.5 + fs * 0.35, 'font-size': fs, class: 'id-probe-text id-probe-mid', 'text-anchor': 'middle', text: 'Linear probe' }, probe);
  }

  // ---- per-frame rendering ----
  function renderFrame() {
    if (!scene) return;
    const f = st.step >= 3 ? frameAt(scene, tl, st.t) : null;
    const showNeedle = f && f.tip && st.t > 0;
    drawCanvas(f, showNeedle);
    // Trajectory (planned path for the current injection)
    const inj = f ? scene.injections[f.cur] : null;
    for (const line of [usTraj, idTraj]) {
      if (inj && st.step >= 3) { line.setAttribute('x1', inj.from[0]); line.setAttribute('y1', inj.from[1]); line.setAttribute('x2', inj.to[0]); line.setAttribute('y2', inj.to[1]); line.style.display = ''; }
      else line.style.display = 'none';
    }
    // Ideal needle
    idNeedle.replaceChildren();
    if (showNeedle) {
      const [fx, fy] = f.from, [tx, ty] = f.tip;
      const len = Math.hypot(tx - fx, ty - fy) || 1, ux = (tx - fx) / len, uy = (ty - fy) / len;
      const out = [fx - ux * 40, fy - uy * 40];
      sv('line', { x1: out[0], y1: out[1], x2: tx, y2: ty, class: 'id-needle-shaft', 'vector-effect': 'non-scaling-stroke' }, idNeedle);
      sv('circle', { cx: tx, cy: ty, r: 1.1, class: 'id-needle-tip' }, idNeedle);
    }
    // Target crosshair
    idTarget.replaceChildren();
    if (inj && st.step >= 3) {
      const [x, y] = inj.to;
      sv('circle', { cx: x, cy: y, r: 3.2, class: 'id-target-ring', 'vector-effect': 'non-scaling-stroke' }, idTarget);
      for (const [dx, dy] of [[-5, 0], [5, 0], [0, -5], [0, 5]]) sv('line', { x1: x + dx * 0.55, y1: y + dy * 0.55, x2: x + dx, y2: y + dy, class: 'id-target-ring', 'vector-effect': 'non-scaling-stroke' }, idTarget);
    }
    // Ideal LA
    idLA.replaceChildren();
    const bathed = new Set();
    if (f) scene.injections.forEach((j, i) => {
      const g = f.growth[i]; if (g <= 0) return;
      for (const b of j.blobs) { const sc = blobScale(g, b.d); if (sc > 0) sv('ellipse', { cx: b.c[0], cy: b.c[1], rx: b.r[0] * sc, ry: b.r[1] * sc }, idLA); }
      if (g > 0.6) j.bathes.forEach((k) => bathed.add(k));
    });
    idSvg.querySelectorAll('.id-s.k-nerve').forEach((n) => n.classList.toggle('is-bathed', bathed.has(n.dataset.key)));
    // Injection note
    if (f && st.step >= 3 && inj) { injNote.textContent = inj.note; injNote.hidden = false; } else injNote.hidden = true;
    updatePlay();
  }

  const la = document.createElement('canvas');
  function drawCanvas(f, showNeedle) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;
    const base = buildBase(scene);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(base, 0, 0, W, H);
    const k = W / scene.w;
    // Local anaesthetic: anechoic pool (union of blobs), nerves left visible ("doughnut sign").
    if (f && f.growth.some((g) => g > 0)) {
      if (la.width !== W || la.height !== H) { la.width = W; la.height = H; }
      const l = la.getContext('2d');
      l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, W, H);
      l.setTransform(k, 0, 0, k, 0, 0);
      l.globalCompositeOperation = 'source-over';
      l.filter = `blur(${Math.max(1, k * 0.5)}px)`;
      l.fillStyle = '#000';
      scene.injections.forEach((j, i) => {
        const g = f.growth[i]; if (g <= 0) return;
        for (const b of j.blobs) { const sc = blobScale(g, b.d); if (sc <= 0) continue; l.beginPath(); l.ellipse(b.c[0], b.c[1], b.r[0] * sc, b.r[1] * sc, 0, 0, 7); l.fill(); }
      });
      l.filter = 'none';
      l.globalCompositeOperation = 'destination-out';
      for (const s of scene.structures) if (s.kind === 'nerve' || s.kind === 'artery') for (const sh of s.shapes) if (sh.t === 'e') l.fill(new Path2D(shapeD(sh)));
      l.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.86; ctx.drawImage(la, 0, 0); ctx.globalAlpha = 1;
    }
    ctx.setTransform(k, 0, 0, k, 0, 0);
    if (showNeedle) {
      const [fx, fy] = f.from, [tx, ty] = f.tip;
      const ang = Math.atan2(ty - fy, tx - fx);
      const steep = Math.abs(Math.sin(ang));
      const vis = 1 - steep * 0.45; // steeper needles reflect less back to the probe
      const nx = -Math.sin(ang) * Math.sign(Math.cos(ang) || 1), ny = Math.abs(Math.cos(ang));
      ctx.lineCap = 'round';
      [[0, 0.95], [1.6, 0.32], [3.2, 0.14]].forEach(([off, al]) => {
        ctx.strokeStyle = `rgba(240,240,236,${al * vis})`; ctx.lineWidth = off ? 0.6 : 0.95;
        ctx.beginPath(); ctx.moveTo(fx + nx * off, fy + ny * off); ctx.lineTo(tx + nx * off, ty + ny * off); ctx.stroke();
      });
      ctx.fillStyle = `rgba(255,255,255,${0.95 * vis + 0.05})`; ctx.beginPath(); ctx.arc(tx, ty, 0.85, 0, 7); ctx.fill();
    }
    // Depth scale on the right edge: tick every 5 mm, longer every 1 cm.
    ctx.strokeStyle = 'rgba(230,230,230,0.7)'; ctx.lineWidth = 1 / k * 1.2;
    const half = scene.cm / 2;
    for (let i = 1; i * half < scene.h; i++) {
      const y = i * half, len = (i % 2 === 0 ? 7 : 4) / k;
      ctx.beginPath(); ctx.moveTo(scene.w, y); ctx.lineTo(scene.w - len, y); ctx.stroke();
    }
  }

  // ---- highlight ----
  function applyHighlight() {
    if (!scene) return;
    const sel = bus.state?.selected ?? null, hov = bus.state?.hovered ?? null;
    const path = new Set([...(sel ? getPathway(sel) : []), ...(hov ? getPathway(hov) : [])]);
    const cls = {};
    for (const s of scene.structures) {
      let c = '';
      if (s.key === st.localHover || s.key === st.localSel || (sel && s.ids.includes(sel)) || (hov && s.ids.includes(hov))) c = 'is-hl';
      else if (s.ids.some((id) => path.has(id))) c = 'is-path';
      cls[s.key] = c;
    }
    root.querySelectorAll('[data-key]').forEach((n) => {
      const c = cls[n.dataset.key];
      n.classList.toggle('is-hl', c === 'is-hl');
      n.classList.toggle('is-path', c === 'is-path');
    });
    // Readout
    const focusKey = st.localHover || st.localSel;
    const s = focusKey ? scene.structures.find((x) => x.key === focusKey)
      : scene.structures.find((x) => (hov && x.ids.includes(hov)) || (sel && x.ids.includes(sel)));
    const extId = hov || sel;
    if (s) {
      const status = s.ids.length ? blockStatus(st.block, s.ids[0]) : null;
      readout.replaceChildren();
      el('strong', { text: s.label }, readout);
      readout.append(` · ${KIND_NAMES[s.kind] || s.kind}`);
      if (s.ids.length) readout.append(` · ${s.ids.map((id) => ELEMENTS[id]?.spinal?.join(', ')).filter(Boolean)[0] || ''}`);
      if (status) el('span', { class: `bpus-badge st-${status}`, text: statusWord(status) }, readout);
    } else if (extId && ELEMENTS[extId]) {
      const inView = scene.structures.filter((x) => x.ids.some((id) => path.has(id)));
      readout.replaceChildren();
      el('strong', { text: ELEMENTS[extId].name }, readout);
      readout.append(inView.length ? ` is not seen directly here. Related structures in this view: ${inView.map((x) => x.short).join(', ')}.` : ' is not seen in this view.');
    } else {
      readout.textContent = 'Hover or tap a structure. Nerves link to the 3D model and diagram.';
    }
  }

  // ---- info card per step ----
  function renderInfo() {
    if (!scene) return;
    const b = BLOCKS[st.block];
    info.replaceChildren();
    const h = el('h3', { class: 'bpus-h' }, info);
    const rows = (pairs) => { const dl = el('dl', { class: 'bpus-dl' }, info); for (const [k, v] of pairs) { if (!v) continue; el('dt', { text: k }, dl); el('dd', { text: v }, dl); } };
    if (st.step === 1) {
      h.textContent = '1. Scan: position and probe';
      rows([['Position', b.position], ['Probe', b.probe], ['Landmark', b.landmark], ['Screen orientation', `Left of screen = ${scene.sides[0]}; right = ${scene.sides[1]}.`]]);
    } else if (st.step === 2) {
      h.textContent = '2. Identify the sonoanatomy';
      const ul = el('ul', { class: 'bpus-list' }, info);
      for (const x of b.sonoanatomy) el('li', { text: x }, ul);
      el('p', { class: 'bpus-muted', text: 'Nerves: hypoechoic roots ("traffic light") in the neck, a hypoechoic "bunch of grapes" above the clavicle, and honeycomb-pattern nerves more distally.' }, info);
    } else if (st.step === 3) {
      h.textContent = '3. Needle';
      rows([['Equipment', b.equipment], ['Needle', `${b.needle.length}, ${b.needle.type.toLowerCase()}, ${b.needle.plane.toLowerCase()}, ${b.needle.direction.toLowerCase()}`], ['Approach', b.approach], ['Target', b.needleTarget]]);
    } else {
      h.textContent = '4. Inject: local anaesthetic deposition';
      rows([['Deposition', b.laDeposition], ['Volume', b.volume], ['Coverage', b.coverageText]]);
      const groups = [['Blocked', [...b.targetIds, ...b.covers], 'covers'], ['Variable', b.variable, 'variable'], ['Spared', b.spares, 'spares']];
      const wrap = el('div', { class: 'bpus-cov' }, info);
      for (const [name, ids, cls] of groups) {
        const uniq = [...new Set(ids)].filter((id) => ELEMENTS[id] && ['terminal', 'collateral', 'related'].includes(ELEMENTS[id].level));
        if (!uniq.length) continue;
        const row = el('div', { class: 'bpus-cov-row' }, wrap);
        el('span', { class: `bpus-badge st-${cls}`, text: name }, row);
        for (const id of uniq) {
          const c = el('button', { type: 'button', class: 'bpus-chip-sm', text: ELEMENTS[id].short || ELEMENTS[id].name, title: ELEMENTS[id].name }, row);
          c.addEventListener('click', () => bus.emit('select', { id: bus.state.selected === id ? null : id, source: SOURCE }));
          c.addEventListener('pointerenter', (e) => { if (!isTouch(e)) bus.emit('hover', { id, source: SOURCE }); });
          c.addEventListener('pointerleave', (e) => { if (!isTouch(e)) bus.emit('hover', { id: null, source: SOURCE }); });
        }
      }
      if (b.sideEffectIds?.length) el('p', { class: 'bpus-muted', text: `Side effect to expect: ${b.sideEffectIds.map((id) => ELEMENTS[id].name).join(', ')} block.` }, info);
    }
    if (b.pearls?.length) {
      const d = el('details', { class: 'bpus-pearls' }, info);
      el('summary', { text: 'Pearls' }, d);
      const ul = el('ul', { class: 'bpus-list' }, d);
      for (const p of b.pearls) el('li', { text: p }, ul);
    }
    idStatus.textContent = st.step === 4 ? 'Cyan = local anaesthetic' : st.step === 3 ? 'Dashed = needle path' : scene.sides.join(' ↔ ');
  }

  // ---- legend ----
  function buildLegend() {
    legend.replaceChildren();
    el('h3', { class: 'bpus-h bpus-h-sm', text: 'Structures in this view' }, legend);
    const ul = el('ul', { class: 'bpus-legend-list' }, legend);
    const order = ['nerve', 'artery', 'vein', 'muscle', 'bone', 'tendon', 'pleura', 'point'];
    const items = scene.structures.filter((s) => !s.nolabel && s.short).sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
    for (const s of items) {
      const li = el('li', {}, ul);
      const b = el('button', { type: 'button', class: `bpus-chip k-${s.kind}`, 'data-key': s.key }, li);
      el('span', { class: 'bpus-sw', 'aria-hidden': 'true' }, b);
      el('span', { class: 'bpus-chip-short', text: s.short }, b);
      el('span', { class: 'bpus-chip-long', text: s.label }, b);
      b.addEventListener('pointerenter', (e) => { if (!isTouch(e)) setLocalHover(s.key); });
      b.addEventListener('pointerleave', (e) => { if (!isTouch(e)) setLocalHover(null); });
      b.addEventListener('focus', () => { if (!recentTap()) setLocalHover(s.key); });
      b.addEventListener('blur', () => setLocalHover(null));
      b.addEventListener('click', () => clickItem(s));
    }
  }

  // ---- sizing ----
  function resize() {
    if (!scene || main.hidden) return;
    const r = stage.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(1, Math.round(r.width * dpr)), H = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    renderLabels();
    renderFrame();
  }
  let rzT = 0;
  const ro = new ResizeObserver(() => { cancelAnimationFrame(rzT); rzT = requestAnimationFrame(resize); });
  ro.observe(root);

  // Click on empty scan clears a local (non-nerve) selection.
  stage.addEventListener('click', () => { if (st.localSel) { st.localSel = null; applyHighlight(); } });

  // ---- bus ----
  unsubs.push(bus.on('block', (p) => { const id = p?.id ?? null; if (id !== st.block) showBlock(id); }));
  unsubs.push(bus.on('select', () => applyHighlight()));
  unsubs.push(bus.on('hover', () => applyHighlight()));

  showBlock(bus.state?.block ?? null);

  return {
    destroy() {
      stop();
      cancelAnimationFrame(rzT);
      ro.disconnect();
      unsubs.forEach((u) => typeof u === 'function' && u());
      for (const u of st.userScans.values()) URL.revokeObjectURL(u);
      st.userScans.clear();
      root.remove();
    },
  };
}

function levelWord(level) { return { root: 'roots', trunk: 'trunks and divisions', cord: 'cords', terminal: 'terminal nerves' }[level] || level; }
function shortBlock(id) { return { interscalene: 'Interscalene', supraclavicular: 'Supraclavicular', infraclavicular: 'Infraclavicular', axillary: 'Axillary' }[id]; }
function statusWord(s) { return { target: 'Target', covers: 'Blocked', variable: 'Variable', spares: 'Spared' }[s] || s; }
