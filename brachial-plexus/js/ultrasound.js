// Ultrasound anatomy of the four brachial plexus blocks.
// For each block: (1) a simulated B-mode ultrasound image computed procedurally on a
// canvas, (2) an idealised labelled vector diagram of the same cross-section and
// (3) optionally real, openly licensed scans with our own label overlay
// (js/real-scans.js). (1) and (2) share one geometry, so a structure is in the same
// place in both. Overlays: probe orientation, depth ruler, in-plane needle path,
// animated needle advance and local anaesthetic (LA) spread.
//
// Geometry is written in millimetres (x from screen left, depth from the skin) and
// is to scale. Positions and sizes were measured against the depth ticks of the
// teaching-deck reference scans and checked against published depths. Reference
// images were only measured, never traced or copied: everything drawn here is
// ORIGINAL and procedural.
//
// Simulated B-mode pipeline (buildBase, once per block, cached):
//   tissue maps (mean scatter amplitude, specular reflectors, soft attenuation,
//   hard blockers) -> complex Gaussian scatterers convolved with an anisotropic,
//   depth-dependent point-spread function (fully developed, Rayleigh speckle,
//   grains ~0.3 x 0.15 mm, wider laterally away from the focus) -> per-column
//   attenuation walk (bone shadow, posterior enhancement under fluid, refraction
//   edge shadows) -> TGC residual + focal band -> log compression.
//
// API
//   mount(containerEl, bus) -> { destroy() }
//   SCENES      : the cross-section geometry per block (scene units: 160 wide;
//                 scene.u = units per mm)
//   REAL_SCANS  : re-exported from ./real-scans.js
//
// Bus: listens to 'block', 'select', 'hover'. Emits (source: 'ultrasound'):
//   'hover'  {id}  when a nerve is hovered / focused (null on leave)
//   'select' {id}  when a nerve is clicked (clicking the selected nerve clears it)
//   'block'  {id}  from the block chooser / tabs
// No other events.

import { BLOCKS, BLOCK_ORDER, ELEMENTS, getPathway, blockStatus } from './data.js';
import { REAL_SCANS } from './real-scans.js';

export { REAL_SCANS };

const SOURCE = 'ultrasound';
const SVGNS = 'http://www.w3.org/2000/svg';
const SCENE_W = 160; // scene units across the screen

// ---------------------------------------------------------------------------
// Geometry helpers. Shapes are written in mm, then scaled to scene units.
// ---------------------------------------------------------------------------
const E = (cx, cy, rx, ry, rot = 0) => ({ t: 'e', cx, cy, rx, ry, rot });
const P = (...pts) => ({ t: 'p', pts });
/** Polygon drawn with straight edges and sharp corners (for muscles that abut a fascial line). */
const PS = (...pts) => ({ t: 'p', pts, sharp: true });
const L = (w, ...pts) => ({ t: 'l', w, pts });
const PT = (x, y) => ({ t: 'pt', x, y });

function S(key, kind, short, label, shapes, opts = {}) {
  return { key, kind, short, label, shapes: Array.isArray(shapes) ? shapes : [shapes], ids: [], ...opts };
}

const KIND_NAMES = {
  nerve: 'Nerve', artery: 'Artery', vein: 'Vein', muscle: 'Muscle', bone: 'Bone',
  pleura: 'Pleura', tendon: 'Tendon', fascia: 'Fascia', sheath: 'Connective tissue', point: 'Target space',
  fat: 'Fat / connective tissue',
};

// ---------------------------------------------------------------------------
// SCENES (all numbers in mm; converted by toUnits below)
// ---------------------------------------------------------------------------
const SCENES_MM = {
  // Right neck, transverse at C7 (one step caudal to the cricoid / C6).
  interscalene: {
    id: 'interscalene', wMm: 52, hMm: 32, skinMm: 0.8, fatMm: 2.3, focusMm: 10, psf: 1,
    sides: ['Ant / Med', 'Post / Lat'],
    view: 'Transverse (axial) view of the right side of the neck at C7, one step caudal to the cricoid (C6)',
    structures: [
      S('lev', 'muscle', 'LevS', 'Levator scapulae / posterior scalene', P([49, 5], [52, 5], [52, 32], [40, 32], [40.5, 20], [44, 18], [49, 16.5]), { stri: 20, echo: 0.13, lab: [47.5, 26.5], inside: true }),
      S('lco', 'muscle', 'LCo', 'Longus colli (prevertebral muscle)', P([5, 31.5], [9, 27], [15, 23.5], [18, 22.8], [20, 24.5], [21, 28], [26, 30], [27, 31.5]), { stri: 0, echo: 0.15, dens: 1.2, lab: [17, 28.6], inside: true }),
      S('scm', 'muscle', 'SCM', 'Sternocleidomastoid', P([0, 2.3], [10, 2.3], [20, 2.5], [25, 3], [26, 3.6], [22, 4.2], [15, 4.6], [11, 6], [8, 8.1], [0, 8.3]), { stri: -12, len: [0.8, 3], echo: 0.13, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [5.5, 5.2], inside: true }),
      S('as', 'muscle', 'AS', 'Anterior scalene', P([11, 6], [15, 4.6], [20, 4.5], [22.5, 5.5], [23.5, 9], [24, 13], [23, 16.5], [20, 18], [16, 18], [12.5, 16.5], [10.5, 12], [10, 8]), { stri: 25, echo: 0.12, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [17, 12.5], inside: true }),
      S('ms', 'muscle', 'MS', 'Middle scalene', P([26, 3.6], [30, 3.3], [40, 3], [48, 3.6], [50, 5], [49.5, 10], [48, 15], [42, 16], [37, 16.2], [33, 16.5], [29, 15.5], [27, 12], [26, 8]), { stri: -8, len: [1, 4], echo: 0.14, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [40, 12.2], inside: true }),
      S('is-space', 'sheath', '', 'Interscalene space / plexus sheath (target)', P([22.3, 4], [23.6, 3.6], [25.5, 4.2], [27.5, 8], [28.6, 12], [28.4, 15.3], [27.4, 15.6], [24.5, 13], [23, 9]), { nolabel: true }),
      // Bright fascial borders that outline SCM, AS and MS (deck: thick, bright fascial lines).
    S('scm-f', 'fascia', '', 'Deep fascia of SCM / superficial border of the anterior scalene', L(0.5, [0, 8.4], [8, 8.2], [11, 6.1], [15, 4.7], [22.6, 4.3]), { amp: 0.95, vary: 0.3, nolabel: true }),
    S('is-wall', 'fascia', '', 'Lateral wall of the interscalene sheath', L(0.45, [25.5, 4.2], [27.5, 8], [28.6, 12], [28.4, 15.3]), { amp: 0.95, vary: 0.25, nolabel: true }),
    S('pvf', 'fascia', 'PVF', 'Prevertebral fascia (deep cervical fascia)', L(0.45, [9, 26.8], [15, 23], [22, 18.5], [28, 16.5], [34, 16.3], [40, 16.5], [48, 16.3], [52, 16.5]), { amp: 0.95, vary: 0.3, lab: [47, 13.6] }),
      S('c7tp', 'bone', 'C7 TP', 'C7 transverse process: posterior tubercle only ("thumb up"), no anterior tubercle', L(0.9, [26.5, 22.6], [27.7, 22.1], [31, 22.8], [34, 21.8], [36.4, 20.3], [37.7, 17.9], [38.2, 16.8], [38.8, 17.6]), { lab: [43.5, 21.5] }),
      S('ijv', 'vein', 'IJV', 'Internal jugular vein (oval, compressible)', P([0, 9.3], [5, 9.2], [8.4, 11], [8.6, 14.5], [6, 16.8], [0, 16.6]), { lab: [4.5, 12.6], inside: true }),
      S('cca', 'artery', 'CCA', 'Common carotid artery (round, pulsatile)', E(6, 20.6, 3.4, 3.4), { lab: [6, 20.6], inside: true }),
      S('vv', 'vein', 'VV', 'Vertebral vein', E(21.7, 20.8, 3.25, 2.1), { lab: [16, 21.6] }),
      S('va', 'artery', 'VA', 'Vertebral artery (colour Doppler; medial to the C7 transverse process)', E(23.3, 24.9, 2.35, 2.35), { lab: [29.5, 27.5] }),
      S('ita', 'artery', 'ITA', 'Inferior thyroid / ascending cervical artery', E(13.6, 19.8, 1.2, 1.2), { lab: [12, 24.2] }),
      S('vagus', 'nerve', 'X', 'Vagus nerve (carotid sheath)', E(2, 17.7, 1.2, 0.8), { tex: 'honeycomb', lab: [2.2, 25.5] }),
      S('symp', 'nerve', 'Symp', 'Cervical sympathetic trunk (on longus colli)', E(3.9, 27.1, 2.6, 1.95), { tex: 'root', lab: [8.5, 30.6] }),
      S('sup-cerv', 'nerve', 'SCx', 'Superficial cervical plexus branches (supraclavicular nerves)', [E(36.9, 2.4, 1.45, 0.4), E(39.7, 2.5, 0.9, 0.35)], { ids: ['n-supraclavicular-cx'], tex: 'root', lab: [32, 1.5] }),
      S('phr', 'nerve', 'Phr', 'Phrenic nerve (on the anterior scalene, deep to SCM)', E(13.1, 5.9, 1.5, 0.75, -40), { ids: ['n-phrenic'], tex: 'root', lab: [12.4, 9.6] }),
      S('c5', 'nerve', 'C5', 'C5 root (top "traffic light")', E(24.2, 6.8, 1.3, 1.2), { ids: ['root-c5'], tex: 'root', lab: [19.6, 6.9] }),
      S('c6', 'nerve', 'C6', 'C6 root (split into two)', [E(24.7, 9.95, 1.15, 1.1), E(25.6, 11.3, 1.15, 1.1)], { ids: ['root-c6'], tex: 'root', lab: [20, 10.3] }),
      S('c7', 'nerve', 'C7', 'C7 root (on the C7 transverse process)', E(30.1, 18.5, 3, 1.95), { ids: ['root-c7'], tex: 'fewfasc', lab: [32.5, 14.2] }),
      S('dsn', 'nerve', 'DSN', 'Dorsal scapular nerve (in middle scalene)', E(31.2, 8.7, 1.3, 0.65, 20), { ids: ['n-dorsal-scapular'], tex: 'root', lab: [34.6, 6.2] }),
      S('ltn', 'nerve', 'LTN', 'Long thoracic nerve (in middle scalene)', E(46.6, 7.2, 2.6, 0.6, -15), { ids: ['n-long-thoracic'], tex: 'root', lab: [42.2, 5.4] }),
    ],
    injections: [
      { from: [52, 1], to: [25.6, 8.4], note: '1. Between C5 and C6 inside the sheath: 15 ml 0.5% ropivacaine in 3–5 ml aliquots', bathes: ['c5', 'c6', 'phr'],
        blobs: [
          { c: [25.5, 8.4], r: [1.5, 1.1] },
          { c: [24.2, 5.0], r: [1.0, 1.5], d: 0.2 },
          { c: [26.2, 11.4], r: [1.6, 1.9], d: 0.3 },
          { c: [23.6, 3.9], r: [0.9, 0.5], d: 0.45 },
          { c: [26.9, 14.0], r: [1.2, 1.4], d: 0.55 },
          { c: [19.0, 4.6], r: [2.6, 0.45], a: -10, d: 0.75 },
          // Spread along the anterior surface of the anterior scalene reaches the phrenic nerve.
          { c: [15.0, 5.3], r: [2.4, 0.4], a: -15, d: 0.85 },
        ] },
      { from: [52, 1], to: [27.6, 13.0], note: '2. Optional redirect: deeper in the sheath below C6, if spread stays superficial', bathes: ['c6'],
        blobs: [{ c: [27.6, 13.3], r: [1.2, 1.3] }, { c: [27.6, 15.0], r: [0.9, 0.8], d: 0.4 }] },
      { from: [52, 1], to: [28.8, 7.0], alt: true, note: 'Alternative: extrafascial, in middle scalene just outside the sheath (lower phrenic risk)', bathes: [],
        blobs: [{ c: [28.9, 7.0], r: [0.8, 1.6], a: 18 }, { c: [28.2, 5.0], r: [0.6, 1.3], a: 30, d: 0.3 }, { c: [29.2, 9.4], r: [0.7, 1.5], a: 5, d: 0.45 }] },
    ],
  },

  // Right supraclavicular fossa, coronal-oblique, probe tilted caudally.
  supraclavicular: {
    id: 'supraclavicular', wMm: 51, hMm: 30, skinMm: 0.5, fatMm: 1.5, focusMm: 15, psf: 1,
    sides: ['Med', 'Lat'],
    view: 'Supraclavicular fossa, probe parallel to the clavicle and tilted caudally (right side)',
    structures: [
      S('fat-sup', 'fat', '', 'Supraclavicular fat and deep cervical fascia', P([0, 5.3], [21, 5.1], [22, 6.5], [15.7, 8.1], [10.2, 9.9], [4.6, 11.4], [0, 11]), { style: 'mixed', nolabel: true }),
      S('platysma', 'muscle', '', 'Platysma', P([1.3, 1.5], [46, 1.6], [46, 2.3], [1.3, 2.3]), { stri: 0, dens: 0.6, nolabel: true }),
      S('oh', 'muscle', 'OH', 'Omohyoid (inferior belly)', [P([0, 2.8], [20.3, 3], [23, 4.2], [21, 5.1], [0, 5.3]), P([41.9, 4.1], [50.8, 3.6], [51, 6.6], [45.7, 6.9])], { stri: 2, len: [1.5, 4], fibre: 2, echo: 0.14, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [9, 4.1], inside: true }),
      S('ms', 'muscle', 'MS', 'Middle scalene', P([39, 15.4], [43, 13], [47, 12.2], [51, 10.8], [51, 21], [45, 20.4], [39.4, 20.4]), { stri: -6, len: [1, 3.5], echo: 0.13, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [46.5, 17], inside: true }),
      S('as', 'muscle', 'AS', 'Anterior scalene', P([4.6, 11.4], [10.2, 9.9], [15.7, 8.1], [20.3, 6.9], [22.3, 7.6], [20.6, 10.2], [20.3, 13.7], [22.8, 16], [14.7, 16.5], [4.6, 16.8]), { stri: 15, echo: 0.12, dens: 0.4, sG: [0.3, 0.6], sAmp: 0.2, lab: [13, 13.4], inside: true }),
      S('sibson', 'fat', 'SF', 'Suprapleural membrane (Sibson’s fascia) and fat', P([4.6, 16.8], [14.7, 16.5], [15, 19.5], [8, 19.6], [4.6, 19.8]), { style: 'dark', lab: [9.5, 18.3], inside: true }),
      S('bp', 'sheath', '', 'Brachial plexus cluster ("bunch of grapes")', P([30, 5.1], [33, 4.8], [38.1, 5.8], [43.1, 7.4], [48.2, 8.9], [43.1, 10.7], [38.1, 11.9], [32.2, 12.9], [31.7, 10.7], [30.5, 7.6]), { style: 'bright', base: 0.65, sp: [0.55, 1.0], nolabel: true }),
      S('sheath', 'fascia', '', 'Plexus sheath (deep cervical fascia)', P([24.1, 5.1], [27.9, 3.6], [35.5, 3.3], [43.1, 4.3], [49.5, 6.3], [51, 7.6], [51, 10.7], [47, 12.2], [39.3, 15.2], [31.7, 15.5], [29.2, 15], [30, 12.7], [30.5, 7.6], [25.4, 6.1]), { w: 0.2, amp: 0.55, nolabel: true }),
      S('streaks', 'fascia', '', 'Fascial layers', L(0.5, [3, 9.6], [9, 8.2], [15, 6.9], [21.5, 5.6]), { amp: 0.95, vary: 0.3, nolabel: true }),
    S('streaks2', 'fascia', '', 'Fascial layers', L(0.25, [1, 7.6], [8, 6.6], [16, 5.8]), { amp: 0.6, nolabel: true }),
    S('sheath-top', 'fascia', '', 'Superficial layer of the plexus sheath', L(0.45, [24.1, 5.1], [27.9, 3.6], [35.5, 3.3], [43.1, 4.3], [49.5, 6.3]), { amp: 0.95, vary: 0.3, nolabel: true }),
      S('rib', 'bone', '1st rib', 'First rib', L(1.5, [13.8, 18.6], [14.9, 17.4], [20, 17], [26, 16.2], [32, 15.6], [38.1, 14.9], [39.0, 15.3]), { lab: [24.5, 21] }),
      S('pleura', 'pleura', 'Pleura', 'Pleura (sliding): medial dome and lateral to the rib', [L(0.5, [1.5, 21.3], [5, 20.2], [8, 19.8], [12, 20.3], [15, 21.2]), L(0.5, [39.3, 20.6], [45, 21.4], [51, 22.7])], { lung: true, lab: [8, 24.5] }),
      S('scv', 'vein', 'SCV', 'Subclavian vein (medial edge, compressible)', P([0, 10.2], [2.5, 10.4], [5, 12.5], [4.6, 16.8], [3.5, 20.5], [1.5, 21], [0, 20.8]), { lab: [2.4, 15.6], inside: true }),
      S('sca', 'artery', 'SCA', 'Subclavian artery (on the first rib)', E(25.4, 10.8, 5.1, 4.45), { lab: [25.4, 10.8], inside: true }),
      S('ssa', 'artery', 'TCA', 'Suprascapular / transverse cervical artery (colour Doppler)', E(13.9, 9.2, 1.3, 0.45), { lab: [15.5, 6.7] }),
      S('dsa', 'artery', 'DSA', 'Dorsal scapular artery (passes through the plexus: colour Doppler)', E(35.4, 8.6, 0.8, 0.8), { pure: true, lab: [34, 1.8] }),
      S('phr', 'nerve', 'Phr', 'Phrenic nerve (on the anterior scalene)', E(8.5, 10.4, 1.1, 0.6, -15), { ids: ['n-phrenic'], tex: 'root', lab: [4.5, 8.4] }),
      S('st-a', 'nerve', 'ST', 'Superior trunk, anterior division (superficial)', E(32.4, 5.1, 2.1, 1.15), { ids: ['div-sup-ant', 'trunk-sup'], tex: 'nodule', lab: [28.5, 1.8] }),
      S('st-p', 'nerve', 'STp', 'Superior trunk, posterior division', E(39.6, 7.6, 1.9, 1.4), { ids: ['div-sup-post'], tex: 'nodule', lab: [39.6, 1.8] }),
      S('ssn', 'nerve', 'SSN', 'Suprascapular nerve (leaving the superior trunk laterally)', E(47.2, 8.4, 1, 0.65), { ids: ['n-suprascapular'], tex: 'nodule', lab: [47.5, 14] }),
      S('mt-1', 'nerve', 'MT', 'Middle trunk / divisions', E(36, 10.2, 1.7, 1.3), { ids: ['trunk-mid', 'div-mid-ant'], tex: 'nodule', lab: [36.5, 14] }),
      S('mt-2', 'nerve', 'MTp', 'Middle trunk / posterior division (lateral)', E(43.1, 9.8, 1.3, 0.9), { ids: ['div-mid-post'], tex: 'nodule', lab: [43.5, 7.1] }),
      S('it-1', 'nerve', 'IT', 'Inferior trunk (deep, against the artery)', E(31.8, 11.2, 1.2, 1.4), { ids: ['trunk-inf'], tex: 'nodule', lab: [33.3, 17.4] }),
      S('it-2', 'nerve', 'ITd', 'Inferior trunk divisions (just above the corner pocket)', E(33, 12.8, 1.3, 0.85), { ids: ['div-inf-ant', 'div-inf-post'], tex: 'nodule', lab: [37.9, 17.9] }),
      S('cp', 'point', 'CP', 'Corner pocket (artery + first rib + inferior trunk)', PT(30.2, 15), { lab: [29.5, 22.5] }),
    ],
    injections: [
      { from: [51, 10.6], to: [30.2, 15.1], note: '1. Corner pocket first (inferior trunk, C8–T1): 5–10 ml', bathes: ['it-1', 'it-2'],
        blobs: [
          { c: [30.4, 14.9], r: [1.7, 0.9] },
          { c: [27.6, 15.3], r: [2.2, 0.55], a: -8, d: 0.25 },
          { c: [34.6, 14.1], r: [2.4, 0.8], a: -6, d: 0.3 },
          { c: [31.2, 12.6], r: [0.7, 1.4], d: 0.5 },
          { c: [38.4, 13.6], r: [1.8, 0.6], a: -10, d: 0.6 },
        ] },
      { from: [51, 5.7], to: [44.2, 7.2], note: '2. Then above the plexus so the nodules float in local anaesthetic: about 10 ml (total 15–20 ml)', bathes: ['st-a', 'st-p', 'ssn', 'mt-1', 'mt-2'],
        blobs: [
          { c: [44.2, 7.1], r: [1.7, 1.0] },
          { c: [40.2, 5.4], r: [2.8, 0.9], a: -6, d: 0.2 },
          { c: [47.8, 7.7], r: [1.4, 1.0], d: 0.3 },
          { c: [35.4, 4.4], r: [3, 0.7], d: 0.35 },
          { c: [31, 4.9], r: [1.3, 0.9], d: 0.55 },
          { c: [38.6, 9.6], r: [1.6, 1.2], d: 0.65 },
        ] },
    ],
  },

  // Parasagittal view medial to the coracoid process (right side).
  infraclavicular: {
    id: 'infraclavicular', wMm: 53, hMm: 49, skinMm: 1.2, fatMm: 3.0, focusMm: 32, psf: 1.15, enh: 0.16,
    sides: ['Ceph', 'Caud'],
    view: 'Parasagittal view, medial and inferior to the coracoid process (right side, arm abducted)',
    structures: [
      S('nv-fat', 'fat', '', 'Perivascular fat (neurovascular compartment)', P([0, 17], [20, 23.5], [40, 29.5], [53, 34.5], [53, 43], [34, 44.5], [22, 49], [15, 39], [8, 32], [0, 26]), { style: 'mottled', nolabel: true }),
      S('pmaj', 'muscle', 'PMaj', 'Pectoralis major', PS([0, 3], [53, 3], [53, 23.5], [40, 20.5], [30, 18], [20, 15.5], [12, 10.5], [6, 8.5], [0, 8]), { stri: 17, len: [3, 8], dens: 0.25, sAmp: 0.7, fibre: 17, echo: 0.18, lab: [34, 9], inside: true }),
      S('ip-fat', 'fat', '', 'Interpectoral fat', P([0, 8], [6, 8.5], [12, 10.5], [20, 15.5], [16, 14.8], [8, 13.5], [0, 12.5]), { style: 'bright', nolabel: true }),
      S('pmin', 'muscle', 'PMin', 'Pectoralis minor', PS([0, 12.5], [8, 13.5], [16, 14.8], [20, 15.5], [30, 18], [40, 20.5], [53, 23.5], [53, 34.5], [40, 29.5], [30, 26], [20, 23.5], [10, 20], [0, 17]), { stri: 20, len: [1.5, 4], dens: 0.3, sAmp: 0.25, sG: [0.18, 0.4], fibre: 20, echo: 0.05, lab: [41, 25.5], inside: true }),
      S('ssc', 'muscle', 'SSc', 'Subscapularis', P([0, 26], [8, 32], [15, 39], [22, 49], [0, 49]), { stri: 30, len: [1, 3.5], echo: 0.08, dens: 0.35, sG: [0.2, 0.42], sAmp: 0.15, att: 0.25, lab: [6, 42], inside: true }),
      S('cw', 'muscle', 'CW', 'Chest wall (serratus anterior / intercostals over a rib)', P([34, 44.5], [45, 43.5], [53, 43], [53, 49], [34, 49]), { stri: 0, echo: 0.3, dens: 2.5, lab: [39, 46.6], inside: true }),
      S('ip-fascia', 'fascia', '', 'Interpectoral fascia (deep fascia of pectoralis major)', L(0.6, [0, 8], [6, 8.5], [12, 10.5], [20, 15.5], [30, 18], [40, 20.5], [53, 23.5]), { amp: 1, vary: 0.3, wav: 0.3, gaps: 2, nolabel: true }),
      S('cpf', 'fascia', 'CPF', 'Clavipectoral fascia (deep fascia of pectoralis minor): inject deep to it', L(0.7, [0, 17], [10, 20], [20, 23.5], [30, 26], [40, 29.5], [53, 34.5]), { amp: 0.7, vary: 0.3, wav: 0.3, gaps: 2, lab: [4.5, 22.6] }),
      S('pleura', 'pleura', 'Pleura', 'Pleura (deep, caudal; keep the needle away)', L(0.6, [36, 48.6], [45, 48], [53, 47.5]), { lung: true, lab: [48.5, 45.6] }),
      S('ipv', 'vein', 'PV', 'Pectoral (thoraco-acromial) veins', [E(6.3, 9.6, 1.75, 1.5), E(13, 12.3, 2.15, 0.65, 15)], { lab: [4, 5.6] }),
      S('taa', 'artery', 'TAA', 'Thoraco-acromial (pectoral) artery; labelled "thoracodorsal vessels" in the deck', E(8.9, 11, 1.25, 1.25), { lab: [11.5, 5.6] }),
      S('aa', 'artery', 'AA', 'Axillary artery', E(22.8, 31.7, 4.35, 4.35), { lab: [22.8, 31.7], inside: true }),
      S('av', 'vein', 'AV', 'Axillary vein (caudal, larger, compressible)', E(43.3, 38.9, 6.15, 4.55, 10), { lab: [43.3, 38.9], inside: true }),
      S('lpn', 'nerve', 'LPN', 'Lateral pectoral nerve', E(16.3, 14, 2.4, 0.85, 15), { ids: ['n-lat-pectoral'], tex: 'honeycomb', lab: [20.5, 11] }),
      S('lc', 'nerve', 'LC', 'Lateral cord (~9 o’clock)', E(15.7, 29.2, 1.15, 2.15, 20), { ids: ['cord-lat'], tex: 'cord', lab: [10.5, 27.2] }),
      S('pc', 'nerve', 'PC', 'Posterior cord (~6–7 o’clock)', E(18.4, 37.4, 1.0, 2.15, 20), { ids: ['cord-post'], tex: 'cord', lab: [14, 41.8] }),
      S('mc', 'nerve', 'MC', 'Medial cord (~3 o’clock, between artery and vein)', E(30.2, 32.9, 1.15, 2.25, -20), { ids: ['cord-med'], tex: 'cord', lab: [31.8, 27.8] }),
    ],
    injections: [
      { from: [0, 21], to: [18.8, 34.8], note: '1. Between the posterior cord and the artery (about 7 o’clock): U-shaped spread around the artery. The needle enters about 2.5–3 cm cephalad to the probe, at about 35°, so the shaft passes deep to the lateral cord', bathes: ['pc', 'lc', 'mc'],
        // One continuous crescent hugging the deep surface of the artery (the "U" / double bubble),
        // growing from a pool at the tip; the artery is pushed slightly superficial and caudal.
        push: { key: 'aa', d: [0.7, -0.7] },
        blobs: [
          { c: [18.6, 35.3], r: [1.9, 1.2], a: 49 },
          ...arcBlobs([22.8, 31.7], 6.5, [205, 190, 174, 157, 139, 122, 105, 88, 71, 54, 38, 22, 10], 139, [1.9, 1.7], 0.08, 0.6 / 130),
          ...arcBlobs([22.8, 31.7], 8.2, [160, 140, 120, 100, 80, 60], 139, [2.0, 1.3], 0.4, 0.4 / 130),
        ] },
      { from: [0, 10.9], to: [22.5, 26.6], note: '2. Optional: deep to the clavipectoral fascia at 12 o’clock, spreading caudally to the medial cord', bathes: ['mc'],
        // A thin (2–3 mm) layer under the fascia, not separate pools.
        blobs: [
          { c: [22.6, 25.9], r: [1.8, 0.9], a: 14 },
          { c: [20.4, 25.0], r: [1.6, 0.8], a: 14, d: 0.15 },
          { c: [25.2, 26.5], r: [1.8, 0.85], a: 16, d: 0.2 },
          { c: [27.8, 27.3], r: [1.6, 0.85], a: 22, d: 0.35 },
          { c: [29.6, 28.8], r: [1.4, 0.8], a: 55, d: 0.5 },
          { c: [30.4, 30.4], r: [1.2, 0.7], a: 80, d: 0.65 },
        ] },
    ],
  },

  // Transverse across the proximal medial arm at the axillary crease.
  axillary: {
    id: 'axillary', wMm: 50, hMm: 35, skinMm: 0.8, fatMm: 4.2, focusMm: 10, psf: 1,
    sides: ['Post', 'Ant'],
    view: 'Transverse view across the proximal arm at the axillary crease, arm abducted and externally rotated (right side)',
    structures: [
      S('tri', 'muscle', 'Tri', 'Triceps (long head) / teres major', PS([0, 4.8], [4.1, 5.9], [8.5, 7.6], [12, 9.6], [16, 11.6], [19.5, 13.9], [21.3, 15], [23.3, 17.8], [27.2, 21.5], [31, 24.6], [34.9, 27.5], [37.5, 29.6], [35.5, 32.3], [33.5, 35], [0, 35]), { stri: 5, echo: 0.06, dens: 0.22, len: [2, 5], sG: [0.16, 0.38], sAmp: 0.12, lab: [11, 22], inside: true }),
      S('bic', 'muscle', 'Bic', 'Biceps (short head)', PS([28.5, 4.6], [45, 4.4], [50, 5.2], [50, 27.6], [46.4, 26.3], [44.2, 19.7], [42.6, 13.2], [40.1, 8.7], [36.2, 7.6], [31, 7.6], [28.5, 6.5]), { stri: -10, echo: 0.04, dens: 0.2, len: [2, 5], sG: [0.15, 0.35], sAmp: 0.1, lab: [47, 16.5], inside: true }),
      S('ccb', 'muscle', 'CB', 'Coracobrachialis', PS([22.3, 14.5], [23, 10.5], [24, 8.5], [27.8, 7.9], [31, 7.6], [36.2, 7.6], [40.1, 8.7], [42.6, 13.2], [44.2, 19.7], [46.4, 26.3], [50, 27.6], [50, 32.8], [46.5, 31.6], [42.5, 30.9], [40.5, 30.9], [38.7, 29.6], [34.9, 27], [31, 24.1], [27.2, 21], [23.3, 17.3]), { stri: 15, echo: 0.24, lab: [33, 11.8], inside: true }),
      S('deepfascia', 'fascia', '', 'Brachial (deep) fascia', L(0.3, [0, 4.6], [8, 4.4], [20, 4.1], [30, 4.2], [40, 4.3], [50, 4.6]), { amp: 0.8, nolabel: true }),
      S('ccbfascia', 'fascia', '', 'Intramuscular fascial plane of coracobrachialis', L(0.18, [30, 15.8], [34, 16.6], [37.4, 17.4], [41, 18.3], [44, 19.2]), { amp: 0.45, nolabel: true }),
      S('bicfascia', 'fascia', '', 'Deep border of biceps (epimysium)', L(0.35, [40.1, 8.7], [42.6, 13.2], [44.2, 19.7], [46.4, 26.3]), { amp: 0.85, vary: 0.35, wav: 0.2, nolabel: true }),
    S('septum', 'fascia', 'IMS', 'Medial intermuscular septum (can mimic a needle)', L(0.5, [23.3, 17.3], [27.2, 21], [31, 24.1], [34.9, 27], [38.7, 29.6], [40.5, 30.9]), { amp: 0.8, lab: [27, 27.2] }),
      S('ct', 'tendon', 'CT', 'Conjoint tendon (teres major / latissimus dorsi)', L(1.2, [0, 4.9], [4.1, 5.8], [8.5, 7.4], [12, 9.2], [16, 11.1], [19.5, 13.4], [21.3, 14.5], [23.3, 17.3]), { lab: [6, 11.8] }),
      S('hum', 'bone', 'Hum', 'Humerus', L(1.5, [33.5, 35], [35.5, 32.3], [38.5, 31], [42.5, 30.9], [46.5, 31.6], [50, 32.8]), { cortex: true, lab: [44, 34.2] }),
      S('veins', 'vein', 'V', 'Axillary / basilic veins (compressible) and vena comitans', [E(15.2, 4.8, 2.75, 0.5, -8), E(11, 5.6, 1.8, 0.5, -15), E(10.4, 7, 0.95, 0.9), E(19.8, 11.8, 0.65, 0.9)], { lab: [5.5, 9] }),
      S('aa', 'artery', 'AA', 'Axillary artery', E(19.9, 7.8, 2.9, 2.6), { lab: [19.9, 7.8], inside: true }),
      S('uln', 'nerve', 'U', 'Ulnar nerve (posterior, superficial)', E(14, 6.6, 1.9, 1.05), { ids: ['n-ulnar'], tex: 'honeycomb', lab: [12.6, 2.2] }),
      S('med', 'nerve', 'M', 'Median nerve (anterior, superficial)', E(26.1, 5.6, 2.6, 1.2, -5), { ids: ['n-median'], tex: 'honeycomb', lab: [27.5, 2.2] }),
      S('rad', 'nerve', 'R', 'Radial nerve (deep, on the conjoint tendon)', E(15.4, 9.4, 2.5, 1.0, 38), { ids: ['n-radial'], tex: 'honeycomb', lab: [11, 13.8] }),
      S('mcn', 'nerve', 'MCN', 'Musculocutaneous nerve (in coracobrachialis)', E(37.4, 17.4, 2.3, 0.9, 8), { ids: ['n-musculocutaneous'], tex: 'lens', lab: [38, 21.5] }),
      S('macn', 'nerve', 'MCNF', 'Medial cutaneous nerve of the forearm', E(17.6, 4.75, 0.8, 0.55), { ids: ['n-mcn-forearm'], tex: 'root', lab: [19.5, 1.6] }),
    ],
    injections: [
      { from: [50, 11], to: [40, 16.6], note: '1. Separate injection: musculocutaneous nerve in coracobrachialis (3–5 ml)', bathes: ['mcn'],
        blobs: [{ c: [37.4, 17.3], r: [3.6, 1.6], a: 8 }, { c: [40, 16.6], r: [1.4, 1.0], d: 0.2 }] },
      { from: [50, 4.5], to: [22.2, 11], note: '2. Deep to the artery, above the conjoint tendon: radial nerve (5–8 ml)', bathes: ['rad'],
        blobs: [{ c: [20.4, 11.1], r: [2.4, 1.1], a: -5 }, { c: [16.4, 11.0], r: [2.8, 1.2], a: 22, d: 0.25 }, { c: [13.4, 9.6], r: [1.6, 1.0], a: 30, d: 0.5 }, { c: [22.8, 10.3], r: [1.2, 0.9], d: 0.35 }] },
      { from: [50, 3.2], to: [29, 5.3], note: '3. Anterior border of the median nerve (3–5 ml)', bathes: ['med'],
        blobs: [{ c: [29.2, 5.6], r: [1.2, 1.1] }, { c: [26.4, 4.3], r: [2.6, 0.45], d: 0.25 }, { c: [27.1, 7.2], r: [2.2, 0.6], a: 12, d: 0.4 }] },
      { from: [50, 2.6], to: [19, 4.5], note: '4. Superficial to the artery: ulnar nerve and medial cutaneous nerve of the forearm (5 ml; total about 25 ml)', bathes: ['uln', 'macn'],
        blobs: [{ c: [18.8, 4.75], r: [1.9, 0.5] }, { c: [14.4, 5.4], r: [2.4, 0.55], a: -10, d: 0.25 }, { c: [11.6, 7.2], r: [1.0, 1.0], d: 0.5 }, { c: [16.6, 7.4], r: [1.0, 0.8], d: 0.6 }] },
    ],
  },
};

/**
 * LA blobs centred along an arc around a vessel (centre c, radius R, angles in degrees,
 * 0 = screen right, 90 = deep). Each blob lies along the tangent; its delay grows with
 * the angular distance from `start` (where the needle tip is).
 */
function arcBlobs(c, R, angs, start, r, d0, perDeg) {
  return angs.map((a) => {
    const t = (a * Math.PI) / 180;
    return { c: [c[0] + R * Math.cos(t), c[1] + R * Math.sin(t)], r, a: a + 90, d: Math.min(0.9, d0 + perDeg * Math.abs(a - start)) };
  });
}

/** Convert a scene written in mm to scene units (160 across). */
function toUnits(d) {
  const u = SCENE_W / d.wMm;
  const p2 = (p) => [p[0] * u, p[1] * u];
  const shape = (sh) => {
    if (sh.t === 'e') return E(sh.cx * u, sh.cy * u, sh.rx * u, sh.ry * u, sh.rot);
    if (sh.t === 'pt') return PT(sh.x * u, sh.y * u);
    if (sh.t === 'l') return L(sh.w * u, ...sh.pts.map(p2));
    return { ...P(...sh.pts.map(p2)), sharp: sh.sharp };
  };
  return {
    ...d, u, w: SCENE_W, h: d.hMm * u, fat: d.fatMm * u, skin: d.skinMm * u,
    structures: d.structures.map((s) => ({ ...s, shapes: s.shapes.map(shape), lab: s.lab ? p2(s.lab) : undefined, wU: s.w != null ? s.w * u : undefined })),
    alts: [],
    injections: d.injections.map((j) => ({
      ...j, from: p2(j.from), to: p2(j.to),
      blobs: j.blobs.map((b) => ({ ...b, c: p2(b.c), r: [b.r[0] * u, b.r[1] * u], a: b.a || 0 })),
    })),
  };
}

export const SCENES = Object.fromEntries(Object.entries(SCENES_MM).map(([k, v]) => {
  const sc = toUnits(v);
  // Alternative techniques are shown as a static dotted path, not animated.
  sc.alts = sc.injections.filter((j) => j.alt);
  sc.injections = sc.injections.filter((j) => !j.alt);
  return [k, sc];
}));

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
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** SVG path data for a shape (also used by canvas via Path2D). */
function shapeD(sh) {
  if (sh.t === 'e') {
    const [dx, dy] = rotate([sh.rx, 0], sh.rot);
    const p1 = [sh.cx + dx, sh.cy + dy], p2 = [sh.cx - dx, sh.cy - dy];
    return `M${pt(p1)} A${fmt(sh.rx)} ${fmt(sh.ry)} ${fmt(sh.rot)} 1 0 ${pt(p2)} A${fmt(sh.rx)} ${fmt(sh.ry)} ${fmt(sh.rot)} 1 0 ${pt(p1)}Z`;
  }
  const pts = sh.pts, n = pts.length;
  if (sh.t === 'l') {
    if (n === 2) return `M${pt(pts[0])} L${pt(pts[1])}`;
    let d = `M${pt(pts[0])}`;
    for (let i = 1; i < n - 1; i++) d += ` Q${pt(pts[i])} ${pt(i === n - 2 ? pts[n - 1] : mid(pts[i], pts[i + 1]))}`;
    return d;
  }
  if (sh.t === 'p' && sh.sharp) return `M${pt(pts[0])}` + pts.slice(1).map((q) => ` L${pt(q)}`).join('') + 'Z';
  if (sh.t === 'p') {
    let d = `M${pt(mid(pts[n - 1], pts[0]))}`;
    for (let i = 0; i < n; i++) d += ` Q${pt(pts[i])} ${pt(mid(pts[i], pts[(i + 1) % n]))}`;
    return d + 'Z';
  }
  return '';
}

/** Points along the same smoothed curve as shapeD (step in scene units). */
function shapePoints(sh, step) {
  const out = [];
  const quad = (p0, c, p1) => {
    const len = Math.hypot(c[0] - p0[0], c[1] - p0[1]) + Math.hypot(p1[0] - c[0], p1[1] - c[1]);
    const n = Math.max(2, Math.ceil(len / step));
    for (let i = out.length ? 1 : 0; i <= n; i++) {
      const t = i / n, a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, d = t * t;
      out.push([a * p0[0] + b * c[0] + d * p1[0], a * p0[1] + b * c[1] + d * p1[1]]);
    }
  };
  if (sh.t === 'e') {
    const n = Math.max(16, Math.ceil((2 * Math.PI * Math.max(sh.rx, sh.ry)) / step));
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const [x, y] = rotate([Math.cos(a) * sh.rx, Math.sin(a) * sh.ry], sh.rot);
      out.push([sh.cx + x, sh.cy + y]);
    }
    return out;
  }
  const pts = sh.pts, n = pts.length;
  if (sh.t === 'l') {
    if (n === 2) { quad(pts[0], mid(pts[0], pts[1]), pts[1]); return out; }
    let cur = pts[0];
    for (let i = 1; i < n - 1; i++) { const end = i === n - 2 ? pts[n - 1] : mid(pts[i], pts[i + 1]); quad(cur, pts[i], end); cur = end; }
    return out;
  }
  if (sh.sharp) {
    for (let i = 0; i < n; i++) quad(pts[i], mid(pts[i], pts[(i + 1) % n]), pts[(i + 1) % n]);
    return out;
  }
  let cur = mid(pts[n - 1], pts[0]);
  for (let i = 0; i < n; i++) { const end = mid(pts[i], pts[(i + 1) % n]); quad(cur, pts[i], end); cur = end; }
  return out;
}

/** Region below a pleura line, down to the scene floor. */
function lungD(sh, h) {
  const p = sh.pts;
  return shapeD(sh) + ` L${pt([p[p.length - 1][0], h])} L${pt([p[0][0], h])}Z`;
}
/** Region below a bone line (acoustic shadow), for the diagram. */
function shadowD(sh, h) {
  const p = sh.pts;
  const xs = p.map((q) => q[0]);
  return shapeD(sh) + ` L${pt([Math.max(...xs), h])} L${pt([Math.min(...xs), h])}Z`;
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
    else p = nearestOnSegs(shapePoints(sh, 1), lab, false);
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

/** Deterministic fascicle positions for a nerve (shared by canvas + SVG). */
function fascicles(st, sh, i, u, nOverride) {
  const rnd = mulberry32(hashStr(st.key + i));
  const area = (sh.rx / u) * (sh.ry / u);
  const n = nOverride || clamp(Math.round(area * 0.9), 3, 7);
  const r = Math.min(sh.rx, sh.ry) * (n > 4 ? 0.36 : 0.42);
  const out = [];
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + rnd() * 0.6;
    const rr = (k === 0 ? 0 : 0.55) + rnd() * 0.08;
    const [x, y] = rotate([Math.cos(a) * sh.rx * rr, Math.sin(a) * sh.ry * rr], sh.rot);
    out.push({ x: sh.cx + x, y: sh.cy + y, r: r * (0.8 + rnd() * 0.35) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Simulated B-mode image (computed once per block, cached)
// ---------------------------------------------------------------------------
const PXMM = 16;          // base resolution: pixels per mm
// Pre-computed random tables (standard normal, Rayleigh with sigma 1).
const GAUSS = new Float32Array(65536), RAYL = new Float32Array(65536);
{
  const r = mulberry32(12345);
  for (let i = 0; i < 65536; i += 2) {
    const m = Math.sqrt(-2 * Math.log(r() || 1e-9)), th = 6.283185 * r();
    GAUSS[i] = m * Math.cos(th); GAUSS[i + 1] = m * Math.sin(th);
  }
  for (let i = 0; i < 65536; i++) RAYL[i] = Math.sqrt(-2 * Math.log(r() || 1e-9));
}
const baseCache = new Map();
const PAINT_ORDER = { fat: 0, muscle: 1, sheath: 2, tendon: 3, fascia: 4, bone: 5, vein: 6, artery: 7, nerve: 8, pleura: 9, point: 10 };

function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function gaussKernel(sigma, norm) {
  const r = Math.max(1, Math.ceil(sigma * 3));
  const k = new Float32Array(2 * r + 1);
  let s = 0;
  for (let i = -r; i <= r; i++) { const v = Math.exp(-(i * i) / (2 * sigma * sigma)); k[i + r] = v; s += norm === 2 ? v * v : v; }
  const d = norm === 2 ? Math.sqrt(s) : s;
  for (let i = 0; i < k.length; i++) k[i] /= d;
  return k;
}
function convV(src, W, H, k) {
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
/** Radii of n box filters whose cascade approximates a Gaussian of this sigma. */
function boxRadii(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal); if (wl % 2 === 0) wl--;
  const m = Math.round((12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4));
  return Array.from({ length: n }, (_, i) => ((i < m ? wl : wl + 2) - 1) / 2);
}
/** Sum of squares of the cascaded (L1-normalised) box kernel: used for L2 normalisation. */
function boxSumSq(radii) {
  let k = [1];
  for (const r of radii) {
    const w = 2 * r + 1, out = new Array(k.length + w - 1).fill(0);
    for (let i = 0; i < k.length; i++) for (let j = 0; j < w; j++) out[i + j] += k[i] / w;
    k = out;
  }
  return k.reduce((a, v) => a + v * v, 0);
}
/** One running-sum box pass along a row (edges clamped). */
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
/** Gaussian-like lateral blur of one row via three box passes, scaled by `gain`. */
function blurRow(src, dst, tmp, o, W, radii, gain) {
  boxRow(src, tmp, o, W, radii[0]); boxRow(tmp, dst, o, W, radii[1]); boxRow(dst, tmp, o, W, radii[2]);
  for (let x = 0; x < W; x++) dst[o + x] = tmp[o + x] * gain;
}

function buildBase(scene) {
  if (baseCache.has(scene.id)) return baseCache.get(scene.id);
  const W = Math.round(scene.wMm * PXMM), H = Math.round(scene.hMm * PXMM);
  const s = W / scene.w, u = scene.u;
  const mk = (fill) => {
    const c = makeCanvas(W, H), x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = fill; x.fillRect(0, 0, W, H);
    x.setTransform(s, 0, 0, s, 0, 0); x.lineCap = 'round'; x.lineJoin = 'round';
    return x;
  };
  const C = { e: mk('#000'), sp: mk('#000'), at: mk('rgb(128,128,128)'), hb: mk('#fff'), rnd: mulberry32(hashStr(scene.id)), u, s, scene };

  paintBackground(C);
  const order = [...scene.structures].sort((a, b) => (PAINT_ORDER[a.kind] ?? 5) - (PAINT_ORDER[b.kind] ?? 5));
  let outlined = false;
  const muscleOutlines = () => {
    // Epimysium + intermuscular fat planes: a soft bright band with a crisp specular core.
    for (const m of scene.structures) {
      if (m.kind !== 'muscle') continue;
      for (const sh of m.shapes) {
        C.e.save(); C.e.beginPath(); C.e.rect(0.3 * u, -1, scene.w - 0.6 * u, scene.h - 0.3 * u + 1); C.e.clip(); C.e.strokeStyle = gray(0.42); C.e.lineWidth = 0.6 * u; C.e.stroke(new Path2D(shapeD(sh))); C.e.restore();
        specStroke(C, sh, 0.62, 0.28, { floor: 0.22, wav: 0.06, eAmp: 0.5 });
      }
    }
    outlined = true;
  };
  for (const st of order) {
    if (!outlined && (PAINT_ORDER[st.kind] ?? 5) > 1) muscleOutlines();
    paintStructure(C, st);
  }
  if (!outlined) muscleOutlines();
  paintSkin(C);

  const img = renderBMode(C, W, H);
  const base = makeCanvas(W, H);
  base.getContext('2d').putImageData(img, 0, 0);
  baseCache.set(scene.id, base);
  return base;
}

const gray = (v) => { const c = Math.round(clamp(v) * 255); return `rgb(${c},${c},${c})`; };

/** A specular reflector along a shape: brightest where the surface faces the probe. */
function specStroke(C, sh, amp, wMm, { floor = 0.25, wav = 0, eAmp = 0.45, vary = 0, gaps = 0, closed } = {}) {
  const u = C.u, rnd = C.rnd;
  let pts = shapePoints(sh, 0.25 * u);
  if (wav > 0) {
    const lam = (2.5 + rnd() * 3) * u, ph = rnd() * 6.28, lam2 = (0.9 + rnd()) * u;
    let cum = 0;
    pts = pts.map((p, i) => {
      const q = pts[Math.min(pts.length - 1, i + 1)], r = pts[Math.max(0, i - 1)];
      const dx = q[0] - r[0], dy = q[1] - r[1], len = Math.hypot(dx, dy) || 1;
      if (i) cum += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const off = wav * u * (Math.sin((cum / lam) * 6.28 + ph) * 0.7 + Math.sin((cum / lam2) * 6.28) * 0.3);
      return [p[0] - (dy / len) * off, p[1] + (dx / len) * off];
    });
  }
  const lw = wMm * u;
  const { w: SW, h: SH } = C.scene, eps = 1.2 * u;
  const edgeOf = (q) => (q[0] < eps ? 1 : q[0] > SW - eps ? 2 : q[1] > SH - eps ? 3 : 0);
  // Slow brightness variation along the interface (real fascia is never uniform).
  const lamA = (3 + rnd() * 4) * u, phA = rnd() * 6.28, lamB = (1.2 + rnd()) * u, phB = rnd() * 6.28;
  // Optional extra amplitude variation (+/- vary) and short gaps (dropouts) along the line.
  const lamV = (4 + rnd() * 4) * u, phV = rnd() * 6.28;
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const gapAt = Array.from({ length: gaps }, (_, g) => [total * ((g + 0.5 + (rnd() - 0.5) * 0.6) / gaps), (0.6 + rnd() * 0.9) * u]);
  let cum = 0;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    cum += len;
    const ea = edgeOf(a);
    if (ea && ea === edgeOf(b) && (ea === 3 ? Math.abs(dy) < Math.abs(dx) : Math.abs(dx) < Math.abs(dy))) continue; // the field edge is not an interface
    const hz = Math.abs(dx) / len;
    const mod = clamp(0.7 + 0.3 * Math.sin((cum / lamA) * 6.28 + phA) + 0.15 * Math.sin((cum / lamB) * 6.28 + phB), 0.25, 1);
    if (gapAt.some(([c, w]) => Math.abs(cum - c) < w / 2)) continue;
    const vm = vary ? 1 + vary * Math.sin((cum / lamV) * 6.28 + phV) : 1;
    const f = (floor + (1 - floor) * hz * hz) * mod * vm;
    const jit = 0.8 + rnd() * 0.4;
    C.sp.strokeStyle = gray(amp * f * jit); C.sp.lineWidth = lw;
    C.sp.beginPath(); C.sp.moveTo(a[0], a[1]); C.sp.lineTo(b[0], b[1]); C.sp.stroke();
    if (eAmp) { C.e.strokeStyle = gray(eAmp * (0.5 + 0.5 * f)); C.e.lineWidth = lw; C.e.beginPath(); C.e.moveTo(a[0], a[1]); C.e.lineTo(b[0], b[1]); C.e.stroke(); }
  }
  void closed;
}

function speckleFill(C, path, box, nPerMm2, rMm, g0, g1, ctx = C.e) {
  const u = C.u, rnd = C.rnd;
  const [x0, y0, x1, y1] = box;
  const n = ((x1 - x0) * (y1 - y0)) / (u * u) * nPerMm2;
  ctx.save(); ctx.clip(path);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = gray(lerp(g0, g1, rnd()));
    ctx.beginPath();
    ctx.ellipse(lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), lerp(rMm[0], rMm[1], rnd()) * u, lerp(rMm[0], rMm[1], rnd()) * u * 0.6, (rnd() - 0.5) * 0.6, 0, 7);
    ctx.fill();
  }
  ctx.restore();
}

function strands(C, path, box, nPerMm2, angDeg, angJit, lenMm, g0, g1, spAmp, widthMm = [0.08, 0.16]) {
  const u = C.u, rnd = C.rnd;
  const [x0, y0, x1, y1] = box;
  const n = ((x1 - x0) * (y1 - y0)) / (u * u) * nPerMm2;
  C.e.save(); C.e.clip(path); C.sp.save(); C.sp.clip(path);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, rnd()), y = lerp(y0, y1, rnd());
    const len = lerp(lenMm[0], lenMm[1], rnd() ** 1.5) * u;
    const a = ((angDeg + (rnd() - 0.5) * 2 * angJit) * Math.PI) / 180;
    const bend = (rnd() - 0.5) * 0.25 * len;
    const dx = Math.cos(a) * len, dy = Math.sin(a) * len;
    const w = lerp(widthMm[0], widthMm[1], rnd()) * u;
    const v = lerp(g0, g1, rnd());
    C.e.strokeStyle = gray(v); C.e.lineWidth = w;
    C.e.beginPath(); C.e.moveTo(x - dx / 2, y - dy / 2); C.e.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + dx / 2, y + dy / 2); C.e.stroke();
    if (spAmp && rnd() < 0.35) {
      C.sp.strokeStyle = gray(spAmp * (0.5 + rnd() * 0.5)); C.sp.lineWidth = w * 0.8;
      C.sp.beginPath(); C.sp.moveTo(x - dx / 2, y - dy / 2); C.sp.quadraticCurveTo(x - Math.sin(a) * bend, y + Math.cos(a) * bend, x + dx / 2, y + dy / 2); C.sp.stroke();
    }
  }
  C.e.restore(); C.sp.restore();
}

function paintBackground(C) {
  const { scene, u, rnd } = C;
  const all = new Path2D(`M0 0 H${scene.w} V${scene.h} H0Z`);
  // Interstitial connective tissue / deep fat: mid-grey, lumpy, with fascial strands.
  C.e.fillStyle = gray(0.3); C.e.fillRect(0, 0, scene.w, scene.h);
  speckleFill(C, all, [0, 0, scene.w, scene.h], 1.1, [0.2, 0.9], 0.12, 0.55);
  strands(C, all, [0, 0, scene.w, scene.h], 0.12, 0, 25, [1, 4], 0.4, 0.6, 0.4, [0.1, 0.2]);
  // Subcutaneous fat: darker hypoechoic lobules separated by thin bright septa.
  const sub = new Path2D(`M0 ${scene.skin} H${scene.w} V${scene.fat} H0Z`);
  C.e.fillStyle = gray(0.14); C.e.fill(sub);
  C.sp.fillStyle = '#000'; C.sp.fill(sub);
  speckleFill(C, sub, [0, scene.skin, scene.w, scene.fat], 0.6, [0.3, 1.0], 0.05, 0.12);
  const nSep = Math.round(scene.wMm * 0.35);
  for (let i = 0; i < nSep; i++) {
    const x = rnd() * scene.w, y = lerp(scene.skin, scene.fat, 0.2 + rnd() * 0.7), len = (2 + rnd() * 7) * u, a = (rnd() - 0.5) * 0.4;
    specStroke(C, L(0, [x, y], [x + Math.cos(a) * len * 0.5, y + Math.sin(a) * len * 0.5 + (rnd() - 0.5) * 0.3 * u], [x + Math.cos(a) * len, y + Math.sin(a) * len]), 0.45, 0.1, { floor: 0.4, wav: 0.08, eAmp: 0.35 });
  }
}

function paintSkin(C) {
  const { scene, u } = C;
  C.e.fillStyle = gray(0.5); C.e.fillRect(0, 0, scene.w, scene.skin);
  C.e.fillStyle = gray(0.2); C.e.fillRect(0, scene.skin * 0.45, scene.w, scene.skin * 0.2);
  C.sp.fillStyle = '#000'; C.sp.fillRect(0, 0, scene.w, scene.skin);
  specStroke(C, L(0, [0, 0.06 * u], [scene.w, 0.06 * u]), 0.9, 0.12, { floor: 1, eAmp: 0.6 });
  specStroke(C, L(0, [0, scene.skin], [scene.w * 0.5, scene.skin + 0.05 * u], [scene.w, scene.skin]), 0.6, 0.14, { floor: 1, wav: 0.03, eAmp: 0.5 });
}

function paintStructure(C, st) {
  const { u, rnd, scene } = C;
  const shapes = st.shapes.filter((sh) => sh.t !== 'pt');
  for (const [i, sh] of shapes.entries()) {
    const p = new Path2D(shapeD(sh));
    const box = shapeBox(sh);
    switch (st.kind) {
      case 'fat': {
        const style = st.style || 'bright';
        if (style === 'dark') {
          C.e.fillStyle = gray(0.09); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
          speckleFill(C, p, box, 0.5, [0.2, 0.6], 0.04, 0.18);
          specStroke(C, sh, 0.35, 0.12, { floor: 0.5, wav: 0.05, eAmp: 0.2 });
        } else if (style === 'mottled') {
          // Perivascular fat: coarse, mottled and clearly brighter than the muscles around it.
          C.e.fillStyle = gray(0.42); C.e.fill(p);
          speckleFill(C, p, box, 0.18, [0.5, 1.5], 0.16, 0.32);
          speckleFill(C, p, box, 0.4, [0.4, 1.3], 0.6, 0.95);
          strands(C, p, box, 0.25, 0, 50, [0.8, 2.5], 0.5, 0.8, 0.45, [0.12, 0.22]);
        } else {
          const base = style === 'mixed' ? 0.3 : 0.36;
          C.e.fillStyle = gray(base); C.e.fill(p);
          speckleFill(C, p, box, 1.0, [0.3, 1.2], 0.2, style === 'mixed' ? 0.5 : 0.58);
          strands(C, p, box, 0.2, 0, 35, [0.6, 2.5], 0.4, 0.6, 0.35, [0.1, 0.18]);
        }
        break;
      }
      case 'muscle': {
        const base = st.echo ?? 0.22;
        C.e.fillStyle = gray(base); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
        if (st.att) { C.at.fillStyle = gray((128 - st.att * 128) / 255); C.at.fill(p); } // extra attenuation with depth
        // Low-frequency mottling (fascicle bundles), then perimysial striae and dots.
        speckleFill(C, p, box, 0.1, [1.2, 3.5], base * 0.7, base * 1.35);
        const len = st.len || [0.5, 2.6], sG = st.sG || [0.38, 0.75];
        strands(C, p, box, st.dens ?? 0.55, st.stri ?? 0, 14, len, sG[0], sG[1], st.sAmp ?? 0.28, [0.1, 0.2]);
        speckleFill(C, p, box, (st.dens ?? 0.7) * 0.4, [0.05, 0.12], sG[0], (sG[0] + sG[1]) / 2);
        break;
      }
      case 'sheath': {
        const bright = st.style === 'bright';
        C.e.fillStyle = gray(st.base ?? (bright ? 0.5 : 0.36)); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
        const spR = st.sp || (bright ? [0.4, 0.85] : [0.28, 0.6]);
        speckleFill(C, p, box, 3, [0.08, 0.3], spR[0], spR[1]);
        if (bright) strands(C, p, box, 0.8, 0, 60, [0.4, 1.6], 0.6, 0.9, 0.7, [0.1, 0.18]);
        specStroke(C, sh, bright ? 0.6 : 0.95, 0.28, { floor: 0.5, wav: 0.03, eAmp: 0.6 });
        break;
      }
      case 'fascia':
        specStroke(C, sh, st.amp ?? 0.8, sh.t === 'l' ? sh.w / u : (st.w ?? 0.2), { floor: 0.3, wav: st.wav ?? 0.05, eAmp: 0.45, vary: st.vary || 0, gaps: st.gaps || 0 });
        break;
      case 'tendon': {
        C.e.strokeStyle = gray(0.6); C.e.lineWidth = sh.w; C.e.stroke(p);
        specStroke(C, sh, 0.55, (sh.w / u) * 0.9, { floor: 0.3, eAmp: 0 });
        C.at.strokeStyle = gray(105 / 255); C.at.lineWidth = sh.w; C.at.stroke(p);
        // Fibrillar: several parallel bright lines across the tendon thickness.
        const pts = shapePoints(sh, 0.3 * u);
        for (const off of [-0.38, -0.12, 0.14, 0.38]) {
          const q = pts.map((a, k) => {
            const b = pts[Math.min(pts.length - 1, k + 1)], c = pts[Math.max(0, k - 1)];
            const dx = b[0] - c[0], dy = b[1] - c[1], l = Math.hypot(dx, dy) || 1;
            return [a[0] - (dy / l) * off * sh.w, a[1] + (dx / l) * off * sh.w];
          });
          specStroke(C, L(0, ...q), 0.95, 0.16, { floor: 0.35, wav: 0.02, eAmp: 0.7 });
        }
        break;
      }
      case 'bone':
        C.e.strokeStyle = gray(0.9); C.e.lineWidth = sh.w; C.e.stroke(p);
        specStroke(C, sh, 1, (sh.w / u) * 0.75, { floor: st.cortex ? 0.7 : 0.35, eAmp: 0 });
        if (st.cortex) {
          // Thick specular cortex with a slightly blurred upper edge.
          C.sp.save(); C.sp.filter = `blur(${0.35 * u * C.s}px)`; C.sp.translate(0, -0.35 * u);
          C.sp.strokeStyle = gray(0.55); C.sp.lineWidth = sh.w * 0.8; C.sp.stroke(p); C.sp.restore();
          C.sp.strokeStyle = gray(1); C.sp.lineWidth = sh.w * 0.55; C.sp.stroke(p);
        }
        // Acoustic shadow, with soft (about 0.5 mm) edges.
        C.hb.save(); C.hb.filter = `blur(${(st.cortex ? 0.5 : 0.3) * u * C.s}px)`; C.hb.translate(0, sh.w * 0.45); C.hb.strokeStyle = '#000'; C.hb.lineWidth = sh.w; C.hb.stroke(p); C.hb.restore();
        break;
      case 'vein':
      case 'artery': {
        const art = st.kind === 'artery';
        // Lumen: almost anechoic, with a trace of noise (st.pure = truly black, e.g. a small artery).
        C.e.fillStyle = st.pure ? '#000' : gray(0.025); C.e.fill(p); C.sp.fillStyle = '#000'; C.sp.fill(p);
        C.at.fillStyle = gray(art ? 1 : 0.9); C.at.fill(p);
        const big = Math.min(sh.rx ?? 99, sh.ry ?? 99) / u > 1.5 || sh.t === 'p';
        if (st.pure) specStroke(C, sh, 0.9, 0.2, { floor: 0.6, eAmp: 0.6 });
        else if (art) specStroke(C, sh, 0.9, big ? 0.32 : 0.2, { floor: 0.2, eAmp: 0.5 });
        else specStroke(C, sh, 0.5, 0.14, { floor: 0.08, eAmp: 0.25 });
        // Refraction (edge) shadows under the lateral walls of large round vessels.
        if (art && sh.t === 'e' && sh.rx / u > 2) {
          C.at.fillStyle = gray(70 / 255);
          for (const sg of [-1, 1]) C.at.fillRect(sh.cx + sg * sh.rx - 0.2 * u, sh.cy, 0.4 * u, sh.ry * 1.4 + 1.5 * u);
        }
        break;
      }
      case 'nerve': {
        const tex = st.tex || 'root';
        C.sp.fillStyle = '#000'; C.sp.fill(p);
        if (tex === 'honeycomb' || tex === 'lens') {
          C.e.fillStyle = gray(0.72); C.e.fill(p);
          for (const f of fascicles(st, sh, i, u, tex === 'lens' ? 3 : 0)) { C.e.fillStyle = gray(0.03); C.e.beginPath(); C.e.ellipse(f.x, f.y, f.r, f.r * 0.85, 0, 0, 7); C.e.fill(); }
          specStroke(C, sh, 1, 0.24, { floor: 0.6, eAmp: 0.7 });
        } else if (tex === 'fewfasc') {
          C.e.fillStyle = gray(0.2); C.e.fill(p);
          for (const f of fascicles(st, sh, i, u, 3)) { C.e.fillStyle = gray(0.05); C.e.beginPath(); C.e.ellipse(f.x, f.y, f.r * 1.3, f.r, sh.rot * Math.PI / 180, 0, 7); C.e.fill(); }
          specStroke(C, sh, 0.6, 0.16, { floor: 0.5, eAmp: 0.5 });
        } else if (tex === 'cord') {
          // Cords at depth: a hyperechoic oval only slightly brighter than the perivascular fat,
          // with a few small, low-contrast hypoechoic fascicles and no dark core.
          C.e.fillStyle = gray(0.72); C.e.fill(p);
          speckleFill(C, p, box, 4, [0.08, 0.25], 0.6, 1);
          const fr = mulberry32(hashStr(st.key + i)), nF = 3 + Math.floor(fr() * 3);
          for (let k = 0; k < nF; k++) {
            const [fx, fy] = rotate([(fr() - 0.5) * 1.2 * sh.rx, (fr() - 0.5) * 1.3 * sh.ry], sh.rot);
            C.e.fillStyle = gray(0.3); C.e.beginPath(); C.e.ellipse(sh.cx + fx, sh.cy + fy, 0.27 * u, 0.24 * u, 0, 0, 7); C.e.fill();
          }
          specStroke(C, sh, 0.6, 0.2, { floor: 0.5, eAmp: 0.75 });
        } else if (tex === 'nodule') {
          // Trunk / division nodules: hypoechoic grey with internal speckle (not black like a vessel).
          C.e.fillStyle = gray(0.2); C.e.fill(p);
          speckleFill(C, p, box, 3, [0.06, 0.14], 0.12, 0.35);
          const area = (sh.rx / u) * (sh.ry / u), fr = mulberry32(hashStr(st.key + i));
          const nDots = area > 2.5 ? 3 : area > 1.5 ? 1 : 0;
          for (let k = 0; k < nDots; k++) {
            const [dx, dy] = rotate([(fr() - 0.5) * sh.rx, (fr() - 0.5) * sh.ry], sh.rot);
            C.e.fillStyle = gray(0.55); C.e.beginPath(); C.e.ellipse(sh.cx + dx, sh.cy + dy, 0.12 * u, 0.09 * u, 0, 0, 7); C.e.fill();
          }
          specStroke(C, sh, 0.6, 0.15, { floor: 0.45, eAmp: 0.45 });
        } else {
          // Roots: almost uniformly hypoechoic with a thin bright rim.
          C.e.fillStyle = gray(0.1); C.e.fill(p);
          speckleFill(C, p, box, 3, [0.06, 0.14], 0.08, 0.24);
          specStroke(C, sh, 0.55, 0.15, { floor: 0.45, eAmp: 0.45 });
        }
        break;
      }
      case 'pleura': {
        if (st.lung) {
          // Lung: artefact only. Mottled grey, A-line reverberations, a few comet tails.
          const lp = new Path2D(lungD(sh, scene.h));
          C.e.save(); C.e.clip(lp);
          C.e.fillStyle = gray(0.2); C.e.fillRect(0, 0, scene.w, scene.h);
          C.sp.save(); C.sp.clip(lp); C.sp.fillStyle = '#000'; C.sp.fillRect(0, 0, scene.w, scene.h); C.sp.restore();
          C.e.restore();
          speckleFill(C, lp, [box[0], box[1], box[2], scene.h], 0.5, [0.5, 1.6], 0.1, 0.36);
          strands(C, lp, [box[0], box[1], box[2], scene.h], 1.2, 0, 4, [1, 4], 0.22, 0.45, 0, [0.15, 0.35]);
          const dpl = sh.pts.reduce((a, q) => a + q[1], 0) / sh.pts.length;
          C.sp.save(); C.sp.clip(lp); C.e.save(); C.e.clip(lp);
          for (let k = 1; k <= 2; k++) {
            const shifted = L(0, ...sh.pts.map((q) => [q[0], q[1] + dpl * k]));
            specStroke(C, shifted, 0.42 / k, 0.35, { floor: 0.7, eAmp: 0.15 });
          }
          const nT = 2 + Math.floor(rnd() * 3);
          for (let k = 0; k < nT; k++) {
            const q = sh.pts[0][0] + rnd() * (sh.pts[sh.pts.length - 1][0] - sh.pts[0][0]);
            const yq = nearestOnSegs(shapePoints(sh, 1), [q, 0], false)[1];
            const lenT = (4 + rnd() * 6) * u;
            const gr = C.e.createLinearGradient(0, yq, 0, yq + lenT);
            gr.addColorStop(0, gray(0.6)); gr.addColorStop(1, gray(0.18));
            C.e.fillStyle = gr; C.e.fillRect(q - 0.15 * u, yq, 0.3 * u, lenT);
          }
          C.e.restore(); C.sp.restore();
        }
        specStroke(C, sh, 1, sh.w / u, { floor: 0.6, wav: 0.03, eAmp: 0.7 });
        break;
      }
      default:
        break;
    }
  }
}

/** Speckle + PSF + attenuation + log compression. Returns ImageData. */
function renderBMode(C, W, H) {
  const { scene } = C;
  const N = W * H;
  const eD = C.e.getImageData(0, 0, W, H).data, sD = C.sp.getImageData(0, 0, W, H).data;
  const aD = C.at.getImageData(0, 0, W, H).data, bD = C.hb.getImageData(0, 0, W, H).data;
  // Point-spread function: axial sigma constant, lateral sigma widens away from focus.
  const psf = scene.psf || 1;
  const sy = 0.08 * PXMM * psf;
  const ky2 = gaussKernel(sy, 2), ky1 = gaussKernel(sy * 1.2, 1);
  const kc = new Map();
  const rowKernels = [];
  for (let y = 0; y < H; y++) {
    const z = y / PXMM;
    const sx = 0.16 * PXMM * psf * (1 + 1.1 * Math.abs(z - scene.focusMm) / scene.hMm + 0.25 * z / scene.hMm);
    const key = Math.round(sx * 4);
    if (!kc.has(key)) { const radii = boxRadii(key / 4); kc.set(key, { radii, l2: 1 / Math.sqrt(boxSumSq(radii)) }); }
    rowKernels.push(kc.get(key));
  }
  const tmpRow = new Float32Array(N);
  // Specular (coherent) component: blurred by the PSF, no speckle.
  let sp = new Float32Array(N);
  for (let i = 0; i < N; i++) sp[i] = sD[i * 4] / 255;
  sp = convV(sp, W, H, ky1);
  const sp2 = new Float32Array(N);
  for (let y = 0; y < H; y++) blurRow(sp, sp2, tmpRow, y * W, W, rowKernels[y].radii, 1);
  // Diffuse scatterers: complex Gaussian (I/Q) with amplitude = mean echo, convolved
  // with the PSF -> Rayleigh speckle. Two independent looks are averaged (spatial
  // compounding, as modern scanners do) to soften the speckle contrast.
  const CS = 2.4, LOOKS = 2;
  const ampOut = new Float32Array(N);
  const rIm = new Float32Array(N), rRe = new Float32Array(N);
  for (let look = 0; look < LOOKS; look++) {
    let re = new Float32Array(N), im = new Float32Array(N);
    let sd = (hashStr(scene.id + look) | 1) >>> 0; // inline xorshift32: much faster than a closure here
    for (let i = 0; i < N; i++) {
      const a = eD[i * 4] * (1 / 255);
      sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5;
      re[i] = a * GAUSS[sd & 0xffff]; im[i] = a * GAUSS[sd >>> 16];
    }
    re = convV(re, W, H, ky2); im = convV(im, W, H, ky2);
    for (let y = 0; y < H; y++) { const rk = rowKernels[y], o = y * W; blurRow(re, rRe, tmpRow, o, W, rk.radii, rk.l2); blurRow(im, rIm, tmpRow, o, W, rk.radii, rk.l2); }
    for (let i = 0; i < N; i++) { const r = rRe[i] + sp2[i] * CS, q = rIm[i]; ampOut[i] += Math.sqrt(r * r + q * q) / LOOKS; }
  }
  // Attenuation walk per column.
  const G = new Float32Array(N);
  const dz = 1 / PXMM, kE = scene.enh ?? 0.1, kS = 0.55, relax = Math.exp(-dz / 6);
  const HFLOOR = 0.22; // bone shadows are very dark grey with faint reverberation, not pure black
  const soft = new Float32Array(W).fill(1), hard = new Float32Array(W).fill(1);
  const eTab = new Float32Array(256);
  for (let a = 0; a < 256; a++) eTab[a] = a > 140 ? Math.exp(kE * ((a - 128) / 127) * dz) : a < 116 ? Math.exp(-kS * ((128 - a) / 128) * dz) : 0;
  for (let y = 0; y < H; y++) {
    const o = y * W;
    for (let x = 0; x < W; x++) {
      const i = o + x;
      G[i] = soft[x] * (HFLOOR + (1 - HFLOOR) * hard[x]);
      const a = aD[i * 4], f = eTab[a];
      soft[x] = f ? soft[x] * f : 1 + (soft[x] - 1) * relax;
      const b = bD[i * 4];
      if (b < 250) hard[x] *= 1 - (1 - b / 255) * 0.2;
    }
  }
  // Beam width smooths shadow and enhancement edges laterally.
  const gr = boxRadii(0.55 * PXMM), G2 = new Float32Array(N);
  for (let y = 0; y < H; y++) blurRow(G, G2, tmpRow, y * W, W, gr, 1);
  // Compose, log-compress.
  const out = new ImageData(W, H), o = out.data;
  const IW = 2.5, DR = 40, GAM = 2.2;
  // Log compression via a lookup table (amplitude 0..6 in 6144 steps).
  const LUTN = 6144, LS = LUTN / 6, lut = new Uint8ClampedArray(LUTN);
  for (let j = 0; j < LUTN; j++) {
    const v = 1 + (20 * Math.log10(Math.max(1e-6, (j + 0.5) / LS) / IW)) / DR;
    lut[j] = v <= 0 ? 0 : v >= 1 ? 255 : Math.round(Math.pow(v, GAM) * 255);
  }
  const zf = scene.focusMm, fw = 0.25 * scene.hMm;
  let sn = (hashStr(scene.id + 'noise') | 1) >>> 0;
  for (let y = 0; y < H; y++) {
    const z = y / PXMM;
    const dg = Math.exp(-0.009 * z) * (1 + 0.12 * Math.exp(-(((z - zf) / fw) ** 2)));
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      sn ^= sn << 13; sn ^= sn >>> 17; sn ^= sn << 5;
      const nf = 0.016 * RAYL[sn & 0xffff];
      const I = ampOut[i] * G2[i] * dg + nf;
      const c = lut[Math.min(LUTN - 1, (I * LS) | 0)];
      o[i * 4] = c; o[i * 4 + 1] = c; o[i * 4 + 2] = Math.min(255, c * 1.02 + 1); o[i * 4 + 3] = 255;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Animation timeline: advance needle -> inject -> (redirect -> inject) ...
// ---------------------------------------------------------------------------
function buildTimeline(scene) {
  const phases = []; let t = 0;
  scene.injections.forEach((inj, i) => {
    const adv = i === 0 ? 1.9 : 1.4;
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
        else { const v = easeInOut((u - 0.4) / 0.6); from = inj.from; tip = lerp2(lerp2(inj.from, inj.to, 0.3), inj.to, v); }
      }
    } else { growth[p.i] = easeOut(u); from = inj.from; tip = inj.to; }
    break;
  }
  // An alternative technique replaces the earlier spread rather than adding to it.
  scene.injections.forEach((j, k) => {
    if (!j.alt) return;
    const a = growth[k];
    if (a > 0) for (let i = 0; i < k; i++) growth[i] *= 1 - a;
  });
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
    views: { sim: true, ideal: true, real: true }, realIdx: 0,
  };
  let scene = null, tl = null, raf = 0, lastTs = 0;
  const unsubs = [];

  // ---- chooser ----
  const chooser = el('section', { class: 'bpus-chooser', 'aria-label': 'Choose a block' }, root);
  el('h3', { class: 'bpus-h', text: 'Ultrasound anatomy: choose a block' }, chooser);
  el('p', { class: 'bpus-muted', text: 'Each block shows a simulated scan, drawn to scale, beside a labelled diagram, with the needle path and local anaesthetic spread.' }, chooser);
  const chooserGrid = el('div', { class: 'bpus-chooser-grid' }, chooser);
  const thumbs = [];
  for (const id of BLOCK_ORDER) {
    const b = el('button', { type: 'button', class: 'bpus-card', 'data-block': id }, chooserGrid);
    const c = el('canvas', { class: 'bpus-thumb', width: 320, height: Math.round((320 * SCENES[id].h) / SCENES[id].w), 'aria-hidden': 'true' }, b);
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

  // View modes: simulated scan, idealised diagram, real scan (only when available).
  const viewGrp = el('div', { class: 'bpus-views', role: 'group', 'aria-label': 'Views to show' }, controls);
  const VIEW_NAMES = [['sim', 'Simulated'], ['ideal', 'Diagram'], ['real', 'Real scan']];
  const viewBtns = {};
  for (const [k, name] of VIEW_NAMES) {
    viewBtns[k] = el('button', { type: 'button', class: 'bpus-view', text: name }, viewGrp);
    viewBtns[k].addEventListener('click', () => toggleView(k));
  }

  const panels = el('div', { class: 'bpus-panels' }, main);
  // Simulated scan
  const simFig = el('figure', { class: 'bpus-panel bpus-sim' }, panels);
  const simHead = el('div', { class: 'bpus-panel-head' }, simFig);
  el('span', { class: 'bpus-panel-title', text: 'Simulated ultrasound' }, simHead);
  el('span', { class: 'bpus-tag', text: 'Computed, not a real scan' }, simHead);
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

  // Real scan (js/real-scans.js)
  const realFig = el('figure', { class: 'bpus-panel bpus-real', hidden: true }, panels);
  const realHead = el('div', { class: 'bpus-panel-head' }, realFig);
  el('span', { class: 'bpus-panel-title', text: 'Real scan' }, realHead);
  const realNav = el('span', { class: 'bpus-real-nav' }, realHead);
  const realPrev = el('button', { type: 'button', class: 'bpus-btn bpus-btn-sm', text: 'Previous', 'aria-label': 'Previous real scan' }, realNav);
  const realCount = el('span', { class: 'bpus-tag' }, realNav);
  const realNext = el('button', { type: 'button', class: 'bpus-btn bpus-btn-sm', text: 'Next', 'aria-label': 'Next real scan' }, realNav);
  const realStage = el('div', { class: 'bpus-real-stage' }, realFig);
  const realImg = el('img', { alt: '', decoding: 'async' }, realStage);
  const realSvg = sv('svg', { class: 'bpus-overlay bpus-real-ov', preserveAspectRatio: 'none' }, realStage);
  const realCap = el('figcaption', { class: 'bpus-cap' }, realFig);
  realPrev.addEventListener('click', () => { st.realIdx--; renderReal(); });
  realNext.addEventListener('click', () => { st.realIdx++; renderReal(); });
  realImg.addEventListener('load', () => renderRealLabels());

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
  el('label', { class: 'bpus-btn bpus-btn-sm', for: fileInput.id, text: 'Choose image' }, dropText);
  dropText.append(' or drop it here. It stays on your device.');

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
  }

  // ---- view modes ----
  function realList() { const l = st.block && REAL_SCANS[st.block]; return Array.isArray(l) ? l.filter((x) => x && x.src) : []; }
  function toggleView(k) {
    const next = { ...st.views, [k]: !st.views[k] };
    const avail = (v) => v !== 'real' || realList().length > 0;
    if (!Object.keys(next).some((v) => next[v] && avail(v))) return; // keep at least one view
    st.views = next;
    applyViews();
    resize();
  }
  function applyViews() {
    const hasReal = realList().length > 0;
    viewBtns.real.hidden = !hasReal;
    viewGrp.hidden = false;
    for (const [k] of VIEW_NAMES) viewBtns[k].setAttribute('aria-pressed', String(!!st.views[k] && (k !== 'real' || hasReal)));
    if (!st.views.sim && !st.views.ideal && !hasReal) st.views.sim = true;
    simFig.hidden = !st.views.sim;
    idFig.hidden = !st.views.ideal;
    realFig.hidden = !(hasReal && st.views.real);
    if (!realFig.hidden) renderReal();
  }

  function renderReal() {
    const list = realList();
    if (!list.length) return;
    st.realIdx = ((st.realIdx % list.length) + list.length) % list.length;
    const r = list[st.realIdx];
    realNav.hidden = list.length < 2;
    realCount.textContent = `${st.realIdx + 1} of ${list.length}`;
    if (realImg.getAttribute('src') !== r.src) { realSvg.replaceChildren(); realImg.src = r.src; }
    realImg.alt = r.alt || `Real ultrasound image: ${BLOCKS[st.block].name}`;
    realCap.replaceChildren();
    if (r.orientation) { el('span', { text: `${r.orientation}. ` }, realCap); }
    el('span', { text: r.credit || '' }, realCap);
    if (r.licence && !(r.credit || '').includes(r.licence)) realCap.append(` ${r.licence}.`);
    if (r.sourceUrl) { realCap.append(' '); el('a', { href: r.sourceUrl, text: 'Source', rel: 'noopener', target: '_blank' }, realCap); }
    if (realImg.complete && realImg.naturalWidth) renderRealLabels();
  }

  function renderRealLabels() {
    const list = realList();
    const r = list[st.realIdx];
    realSvg.replaceChildren();
    if (!r || !realImg.naturalWidth) return;
    const nw = realImg.naturalWidth, nh = realImg.naturalHeight;
    realSvg.setAttribute('viewBox', `0 0 ${nw} ${nh}`);
    realSvg.style.display = st.labels ? '' : 'none';
    if (!st.labels) return;
    const k = (realImg.clientWidth || 600) / nw;
    for (const lab of r.labels || []) {
      const ids = lab.elementId ? [lab.elementId] : [];
      const s = { key: `real-${lab.text}-${lab.x}`, kind: lab.kind || 'point', short: lab.text, label: (lab.elementId && ELEMENTS[lab.elementId]?.name) || lab.text, ids, real: true };
      const p = [lab.x * nw, lab.y * nh];
      const t = lab.tx != null && lab.ty != null ? [lab.tx * nw, lab.ty * nh] : null;
      pill(realSvg, s, t || p, t ? p : null, k, true);
    }
    applyHighlight();
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
    st.realIdx = 0;
    chooser.hidden = !!st.block; main.hidden = !st.block;
    if (!st.block) { drawThumbs(); return; }
    scene = SCENES[st.block];
    tl = buildTimeline(scene);
    for (const [k, b] of Object.entries(tabBtns)) b.setAttribute('aria-pressed', String(k === st.block));
    stage.style.aspectRatio = `${scene.w} / ${scene.h}`;
    usSvg.setAttribute('viewBox', `0 0 ${scene.w} ${scene.h}`);
    canvas.setAttribute('aria-label', `Simulated ultrasound image: ${BLOCKS[st.block].name}. ${scene.view}. Screen left is ${scene.sides[0]}, right is ${scene.sides[1]}. Field ${scene.wMm} mm wide and ${scene.hMm} mm deep.`);
    buildBase(scene);
    buildUsSvg(); buildIdeal(); buildLegend(); renderPhotos(); applyViews();
    simCap.textContent = `${scene.view}. Screen left: ${scene.sides[0]}. Right: ${scene.sides[1]}. To scale: ${scene.wMm} × ${scene.hMm} mm; depth ticks every 5 mm, numbers in cm.`;
    idCap.textContent = `Same cross-section, same scale, as a clean diagram. Probe on top, orientation marker on the ${scene.sides[0]} side.`;
    setStep(1, false);
    resize();
  }

  // Thumbnails are computed one per task so the page stays responsive.
  let thumbTimer = 0;
  function drawThumbs() {
    clearTimeout(thumbTimer);
    const next = thumbs.find(([, c]) => !c.dataset.done);
    if (!next || main.hidden === false) return;
    const [id, c] = next;
    c.getContext('2d').drawImage(buildBase(SCENES[id]), 0, 0, c.width, c.height);
    c.dataset.done = '1';
    thumbTimer = setTimeout(drawThumbs, 30);
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
    if (!playBtn) return;
    playBtn.textContent = st.playing ? 'Pause' : (st.t >= (tl?.T ?? 1) ? 'Replay' : 'Play');
    playBtn.setAttribute('aria-label', st.playing ? 'Pause the animation' : 'Play needle and injection animation');
  }

  // ---- simulated scan overlay (SVG) ----
  let usAlt, idAlt, usLabels, usTraj, idLabels, idNeedle, idLA, idTraj, idTarget, idRuler;
  function buildUsSvg() {
    usSvg.replaceChildren();
    const usHl = sv('g', { class: 'bpus-hl' }, usSvg);
    for (const s of scene.structures) {
      if (s.kind === 'sheath' || s.kind === 'fascia' || s.kind === 'fat') continue;
      const g = sv('g', { 'data-key': s.key, class: `bpus-item k-${s.kind}` }, usHl);
      for (const sh of s.shapes) {
        if (sh.t === 'pt') { sv('circle', { cx: sh.x, cy: sh.y, r: 1.2 * scene.u, class: 'bpus-hit bpus-outline' }, g); continue; }
        sv('path', { d: shapeD(sh), class: `bpus-hit bpus-outline${sh.t === 'l' ? ' is-line' : ''}`, 'vector-effect': 'non-scaling-stroke' }, g);
      }
      wireItem(g, s);
    }
    usTraj = sv('line', { class: 'bpus-traj', 'vector-effect': 'non-scaling-stroke' }, usSvg);
    usAlt = sv('g', { class: 'bpus-alt' }, usSvg);
    usLabels = sv('g', { class: 'bpus-labels' }, usSvg);
    const o = sv('g', { class: 'bpus-orient', 'aria-hidden': 'true' }, usSvg);
    o.dataset.role = 'orient';
  }

  function wireItem(g, s) {
    g.addEventListener('pointerenter', (e) => { if (!isTouch(e)) setLocalHover(s.key); });
    g.addEventListener('pointerleave', (e) => { if (!isTouch(e)) setLocalHover(null); });
    g.addEventListener('click', (ev) => { ev.stopPropagation(); clickItem(s); });
  }

  function isTouch(e) { return !!e.pointerType && e.pointerType !== 'mouse'; }
  function recentTap() { return lastDown.type !== 'mouse' && performance.now() - lastDown.at < 800; }

  function findStruct(key) { return key && (scene.structures.find((x) => x.key === key) || realStructs.get(key)); }
  const realStructs = new Map();

  function setLocalHover(key) {
    if (st.localHover === key) return;
    st.localHover = key;
    const s = findStruct(key);
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
  function pill(parent, s, lab, tgt, k, interactive, onIdeal) {
    const fs = 12 / k, padX = 4 / k, h = fs * 1.45;
    const g = sv('g', { 'data-key': s.key, class: `bpus-lab k-${s.kind}${s.ids.length ? ' has-id' : ''}` }, parent);
    if (tgt) {
      sv('line', { x1: lab[0], y1: lab[1], x2: tgt[0], y2: tgt[1], class: 'bpus-leader', 'vector-effect': 'non-scaling-stroke' }, g);
      sv('circle', { cx: tgt[0], cy: tgt[1], r: 1.6 / k, class: 'bpus-leader-dot' }, g);
    }
    const w = s.short.length * fs * 0.6 + padX * 2;
    sv('rect', { x: lab[0] - w / 2, y: lab[1] - h / 2, width: w, height: h, rx: h / 2, class: 'bpus-pill' }, g);
    sv('text', { x: lab[0], y: lab[1] + fs * 0.35, 'font-size': fs, class: 'bpus-pill-text', text: s.short }, g);
    sv('title', { text: `${s.label} (${KIND_NAMES[s.kind] || s.kind})` }, g);
    if (s.real) realStructs.set(s.key, s);
    if (interactive) {
      g.setAttribute('tabindex', onIdeal ? '0' : '-1');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', `${s.label}${s.ids.length ? ', select to highlight across views' : ''}`);
      wireItem(g, s);
      g.addEventListener('focus', () => { if (!recentTap()) setLocalHover(s.key); });
      g.addEventListener('blur', () => setLocalHover(null));
      g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); clickItem(s); } });
    }
    return g;
  }
  function labelGroup(parent, s, k, interactive, onIdeal) {
    if (s.nolabel || !s.short) return;
    const lab = s.lab || shapeCentre(s.shapes[0]);
    const tgt = s.inside ? null : leaderTarget(s, lab);
    pill(parent, s, lab, tgt, k, interactive, onIdeal);
  }

  function renderLabels() {
    if (!scene) return;
    const kUs = (usSvg.clientWidth || 600) / scene.w;
    usLabels.replaceChildren();
    if (st.labels) for (const s of scene.structures) labelGroup(usLabels, s, kUs, true, false);
    usLabels.style.display = st.labels ? '' : 'none';
    const o = usSvg.querySelector('[data-role="orient"]');
    o.replaceChildren();
    const fs = 11 / kUs;
    sv('circle', { cx: 9 / kUs, cy: 14 / kUs, r: 4 / kUs, class: 'bpus-marker' }, o);
    sv('text', { x: 16 / kUs, y: 14 / kUs + fs * 0.35, 'font-size': fs, class: 'bpus-side', text: scene.sides[0] }, o);
    sv('text', { x: scene.w - 26 / kUs, y: 14 / kUs + fs * 0.35, 'font-size': fs, class: 'bpus-side', 'text-anchor': 'end', text: scene.sides[1] }, o);
    const kId = (idSvg.clientWidth || 600) / scene.w;
    idLabels.replaceChildren();
    for (const s of scene.structures) labelGroup(idLabels, s, kId, true, true);
    renderIdealOverlays();
    if (!realFig.hidden) renderRealLabels();
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
    const ordered = [...scene.structures].sort((a, b) => (PAINT_ORDER[a.kind] ?? 5) - (PAINT_ORDER[b.kind] ?? 5));
    for (const s of ordered) {
      const g = sv('g', { 'data-key': s.key, class: `bpus-item id-s k-${s.kind}` }, body);
      s.shapes.forEach((sh, i) => {
        if (sh.t === 'pt') { sv('circle', { cx: sh.x, cy: sh.y, r: 1.2 * scene.u, class: 'id-point bpus-outline', 'vector-effect': 'non-scaling-stroke' }, g); return; }
        if (s.kind === 'pleura' && s.lung) sv('path', { d: lungD(sh, scene.h), class: 'id-lung' }, g);
        if (s.kind === 'bone') sv('path', { d: shadowD(sh, scene.h), class: 'id-shadow' }, g);
        const isLine = sh.t === 'l';
        const sw = isLine ? sh.w * (s.kind === 'bone' ? 1.4 : 1) : s.kind === 'fascia' ? (s.wU || 0.2 * scene.u) : null;
        if (s.kind === 'tendon') sv('path', { d: shapeD(sh), class: 'id-tendon-edge', 'stroke-width': sw + 0.5 }, g);
        sv('path', { d: shapeD(sh), class: `id-shape bpus-outline${isLine ? ' is-line' : ''}`, 'stroke-width': sw }, g);
        if (s.kind === 'nerve' && (s.tex === 'honeycomb' || s.tex === 'lens' || s.tex === 'fewfasc')) {
          for (const f of fascicles(s, sh, i, scene.u, s.tex === 'honeycomb' ? 0 : 3)) sv('circle', { cx: f.x, cy: f.y, r: f.r, class: 'id-fasc' }, g);
        }
        if (s.kind === 'muscle' && s.fibre != null) {
          const [x0, y0, x1, y1] = shapeBox(sh); const rnd = mulberry32(hashStr(s.key));
          const ang = (s.fibre * Math.PI) / 180; const clip2 = `${clipId}-${s.key}-${i}`;
          sv('path', { d: shapeD(sh) }, sv('clipPath', { id: clip2 }, defs));
          const fg = sv('g', { 'clip-path': `url(#${clip2})`, class: 'id-fibres' }, g);
          for (let y = y0 - 60; y < y1 + 10; y += 1.6 * scene.u) {
            const x = x0 - 5 + rnd() * 3;
            sv('line', { x1: x, y1: y, x2: x + Math.cos(ang) * (x1 - x0 + 10), y2: y + Math.sin(ang) * (x1 - x0 + 10), 'vector-effect': 'non-scaling-stroke' }, fg);
          }
        }
      });
      if (s.kind !== 'sheath' && s.kind !== 'fascia' && s.kind !== 'fat') wireItem(g, s);
    }
    idLA = sv('g', { class: 'id-la' }, body);
    idTraj = sv('line', { class: 'bpus-traj id-traj', 'vector-effect': 'non-scaling-stroke' }, idSvg);
    idAlt = sv('g', { class: 'bpus-alt id-alt' }, idSvg);
    idNeedle = sv('g', { class: 'id-needle' }, idSvg);
    idTarget = sv('g', { class: 'id-target' }, idSvg);
    idRuler = sv('g', { class: 'id-ruler', 'aria-hidden': 'true' }, idSvg);
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
    // Depth ruler: ticks every 5 mm, numbered every 1 cm.
    idRuler.replaceChildren();
    const fr = 10 / k;
    for (let d = 5; d < scene.hMm - 0.5; d += 5) {
      const y = d * scene.u, len = (d % 10 === 0 ? 8 : 4.5) / k;
      sv('line', { x1: scene.w, y1: y, x2: scene.w - len, y2: y, class: 'id-tick', 'vector-effect': 'non-scaling-stroke' }, idRuler);
      if (d % 10 === 0) sv('text', { x: scene.w - len - 2.5 / k, y: y + fr * 0.35, 'font-size': fr, 'text-anchor': 'end', class: 'id-tick-text', text: d === 10 ? '1 cm' : String(d / 10) }, idRuler);
    }
  }

  // ---- per-frame rendering ----
  function renderFrame() {
    if (!scene) return;
    const f = st.step >= 3 ? frameAt(scene, tl, st.t) : null;
    const showNeedle = f && f.tip && st.t > 0;
    drawCanvas(f, showNeedle);
    const inj = f ? scene.injections[f.cur] : null;
    for (const line of [usTraj, idTraj]) {
      if (inj && st.step >= 3) { line.setAttribute('x1', inj.from[0]); line.setAttribute('y1', inj.from[1]); line.setAttribute('x2', inj.to[0]); line.setAttribute('y2', inj.to[1]); line.style.display = ''; }
      else line.style.display = 'none';
    }
    for (const g of [usAlt, idAlt]) {
      g.replaceChildren();
      if (st.step < 3) continue;
      for (const a of scene.alts) {
        sv('line', { x1: a.from[0], y1: a.from[1], x2: a.to[0], y2: a.to[1], class: 'bpus-alt-line', 'vector-effect': 'non-scaling-stroke' }, g);
        sv('circle', { cx: a.to[0], cy: a.to[1], r: 0.7 * scene.u, class: 'bpus-alt-ring', 'vector-effect': 'non-scaling-stroke' }, g);
        sv('title', { text: a.note }, g);
      }
    }
    idNeedle.replaceChildren();
    if (showNeedle) {
      const [fx, fy] = f.from, [tx, ty] = f.tip;
      const len = Math.hypot(tx - fx, ty - fy) || 1, ux = (tx - fx) / len, uy = (ty - fy) / len;
      const out = [fx - ux * 40, fy - uy * 40];
      sv('line', { x1: out[0], y1: out[1], x2: tx, y2: ty, class: 'id-needle-shaft', 'vector-effect': 'non-scaling-stroke' }, idNeedle);
      sv('circle', { cx: tx, cy: ty, r: 0.45 * scene.u, class: 'id-needle-tip' }, idNeedle);
    }
    idTarget.replaceChildren();
    if (inj && st.step >= 3) {
      const [x, y] = inj.to, R = 1.1 * scene.u;
      sv('circle', { cx: x, cy: y, r: R, class: 'id-target-ring', 'vector-effect': 'non-scaling-stroke' }, idTarget);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) sv('line', { x1: x + dx * R * 1.3, y1: y + dy * R * 1.3, x2: x + dx * R * 1.9, y2: y + dy * R * 1.9, class: 'id-target-ring', 'vector-effect': 'non-scaling-stroke' }, idTarget);
    }
    idLA.replaceChildren();
    const bathed = new Set();
    if (f) scene.injections.forEach((j, i) => {
      const g = f.growth[i]; if (g <= 0) return;
      for (const b of j.blobs) { const sc = blobScale(g, b.d); if (sc > 0) sv('ellipse', { cx: b.c[0], cy: b.c[1], rx: b.r[0] * sc, ry: b.r[1] * sc, transform: b.a ? `rotate(${b.a} ${b.c[0]} ${b.c[1]})` : null }, idLA); }
      if (g > 0.6) j.bathes.forEach((k) => bathed.add(k));
    });
    idSvg.querySelectorAll('.id-s.k-nerve').forEach((n) => n.classList.toggle('is-bathed', bathed.has(n.dataset.key)));
    if (f && st.step >= 3 && inj) { injNote.textContent = inj.note; injNote.hidden = false; } else injNote.hidden = true;
    updatePlay();
  }

  const la = document.createElement('canvas'), enhC = document.createElement('canvas'), rimC = document.createElement('canvas'), rimD = document.createElement('canvas');
  function drawCanvas(f, showNeedle) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    if (!W || !H) return;
    const base = buildBase(scene);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(base, 0, 0, W, H);
    const k = W / scene.w, u = scene.u;
    // Local anaesthetic: anechoic pool (union of blobs); nerves and arteries stay visible ("doughnut").
    if (f && f.growth.some((g) => g > 0)) {
      for (const cv of [la, enhC, rimC, rimD]) if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
      const blurPx = Math.max(1, k * u * 0.22);
      const l = la.getContext('2d');
      l.setTransform(1, 0, 0, 1, 0, 0); l.clearRect(0, 0, W, H);
      l.setTransform(k, 0, 0, k, 0, 0);
      l.globalCompositeOperation = 'source-over';
      l.filter = `blur(${blurPx}px)`;
      l.fillStyle = '#020202';
      const bathed = new Map();
      scene.injections.forEach((j, i) => {
        const g = f.growth[i]; if (g <= 0) return;
        for (const b of j.blobs) { const sc = blobScale(g, b.d); if (sc <= 0) continue; l.beginPath(); l.ellipse(b.c[0], b.c[1], b.r[0] * sc, b.r[1] * sc, (b.a * Math.PI) / 180, 0, 7); l.fill(); }
        for (const key of j.bathes) bathed.set(key, Math.max(bathed.get(key) || 0, clamp((g - 0.25) / 0.5)));
      });
      // Posterior acoustic enhancement: tissue deep to the pool is brightened by about 15-20%
      // over about 5 mm (a smeared copy of the pool, multiplied with the base image).
      const e2 = enhC.getContext('2d');
      e2.setTransform(1, 0, 0, 1, 0, 0); e2.clearRect(0, 0, W, H);
      e2.globalCompositeOperation = 'source-over';
      const stepPx = 0.5 * u * k;
      for (let n = 1; n <= 10; n++) { e2.globalAlpha = 1 - (n - 1) / 10; e2.drawImage(la, 0, n * stepPx); }
      e2.globalAlpha = 1;
      e2.globalCompositeOperation = 'destination-out'; e2.drawImage(la, 0, 0);
      e2.globalCompositeOperation = 'source-in'; e2.drawImage(base, 0, 0, W, H);
      e2.globalCompositeOperation = 'source-over';
      // A vessel pushed by the pool: its old place fills with LA (it is redrawn shifted below).
      scene.injections.forEach((j, i) => {
        const g = f.growth[i]; if (!j.push || g <= 0) return;
        const sh = scene.structures.find((x) => x.key === j.push.key)?.shapes[0];
        if (sh && sh.t === 'e') { l.beginPath(); l.ellipse(sh.cx, sh.cy, sh.rx + 0.7 * u * easeOut(g), sh.ry + 0.7 * u * easeOut(g), 0, 0, 7); l.fill(); }
      });
      // Keep a copy of the whole pool: the nerve rims below are shown only where LA touches them.
      const r2 = rimC.getContext('2d');
      r2.setTransform(1, 0, 0, 1, 0, 0); r2.clearRect(0, 0, W, H); r2.globalCompositeOperation = 'source-over';
      r2.filter = `blur(${blurPx * 2}px)`; r2.drawImage(la, 0, 0); r2.drawImage(la, 0, 0); r2.filter = 'none';
      // Nerves and arteries are not filled by the LA: cut them out with a feathered edge.
      // A vessel that the pool pushes aside is redrawn shifted further down instead.
      const pushed = new Set(scene.injections.filter((j, i) => j.push && f.growth[i] > 0).map((j) => j.push.key));
      l.globalCompositeOperation = 'destination-out';
      for (const s of scene.structures) {
        if ((s.kind !== 'nerve' && s.kind !== 'artery') || pushed.has(s.key)) continue;
        for (const sh of s.shapes) if (sh.t === 'e') { l.beginPath(); l.ellipse(sh.cx, sh.cy, Math.max(0.1, sh.rx - 0.15 * u), Math.max(0.1, sh.ry - 0.15 * u), (sh.rot * Math.PI) / 180, 0, 7); l.fill(); }
      }
      l.filter = 'none';
      l.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.18; ctx.drawImage(enhC, 0, 0); ctx.restore();
      ctx.globalAlpha = 0.9; ctx.drawImage(la, 0, 0); ctx.globalAlpha = 1;
      // Mass effect: a vessel pushed by the pool (redrawn from the base image, shifted).
      ctx.setTransform(k, 0, 0, k, 0, 0);
      scene.injections.forEach((j, i) => {
        const g = f.growth[i]; if (!j.push || g <= 0) return;
        const v = scene.structures.find((x) => x.key === j.push.key); const sh = v && v.shapes[0];
        if (!sh || sh.t !== 'e') return;
        const dx = j.push.d[0] * u * easeOut(g), dy = j.push.d[1] * u * easeOut(g);
        ctx.save(); ctx.beginPath(); ctx.ellipse(sh.cx + dx, sh.cy + dy, sh.rx + 0.12 * u, sh.ry + 0.12 * u, 0, 0, 7); ctx.clip();
        ctx.drawImage(base, dx, dy, scene.w, scene.h); ctx.restore();
      });
      // The bright epineurium of each bathed nerve stands out against the anechoic LA ("doughnut").
      const rx = rimD.getContext('2d');
      rx.setTransform(1, 0, 0, 1, 0, 0); rx.globalCompositeOperation = 'source-over'; rx.clearRect(0, 0, W, H);
      rx.setTransform(k, 0, 0, k, 0, 0); rx.filter = `blur(${Math.max(0.5, k * u * 0.05)}px)`; rx.lineWidth = 0.2 * u;
      for (const [key, a] of bathed) {
        const s = scene.structures.find((x) => x.key === key); if (!s || a <= 0) continue;
        rx.strokeStyle = `rgba(204,204,200,${0.6 * a})`;
        for (const sh of s.shapes) if (sh.t === 'e') { rx.beginPath(); rx.ellipse(sh.cx, sh.cy, sh.rx, sh.ry, (sh.rot * Math.PI) / 180, 0, 7); rx.stroke(); }
      }
      rx.setTransform(1, 0, 0, 1, 0, 0); rx.filter = 'none';
      rx.globalCompositeOperation = 'destination-in'; rx.drawImage(rimC, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(rimD, 0, 0); ctx.setTransform(k, 0, 0, k, 0, 0);
    }
    ctx.setTransform(k, 0, 0, k, 0, 0);
    if (showNeedle) {
      // In-plane needle: a bright, slightly translucent shaft with fading reverberation lines
      // (0.5-0.7 mm apart) deep to it and a slightly brighter tip. Same style on every block.
      const [fx, fy] = f.from, [tx, ty] = f.tip;
      const ang = Math.atan2(ty - fy, tx - fx);
      const steep = Math.abs(Math.sin(ang));
      const vis = 1 - steep * 0.45; // steeper needles reflect less back to the probe
      const nx = -Math.sin(ang) * Math.sign(Math.cos(ang) || 1), ny = Math.abs(Math.cos(ang)); // points deeper
      ctx.lineCap = 'butt';
      [[0.6, 0.38], [1.2, 0.22], [1.8, 0.11]].forEach(([off, al]) => {
        ctx.strokeStyle = `rgba(225,225,220,${al * vis})`; ctx.lineWidth = 0.16 * u;
        ctx.beginPath(); ctx.moveTo(fx + nx * off * u, fy + ny * off * u); ctx.lineTo(tx + nx * off * u, ty + ny * off * u); ctx.stroke();
      });
      ctx.lineCap = 'round';
      ctx.strokeStyle = `rgba(240,240,236,${0.4 * vis})`; ctx.lineWidth = 0.6 * u;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = `rgba(250,250,246,${0.62 * vis + 0.08})`; ctx.lineWidth = 0.3 * u;
      ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke();
      // Tip: brighter, with a small halo so it can be followed.
      const gr = ctx.createRadialGradient(tx, ty, 0, tx, ty, 1.2 * u);
      gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(tx, ty, 1.2 * u, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(tx, ty, 0.3 * u, 0, 7); ctx.fill();
    }
    // Depth ruler on the right edge: tick every 5 mm, longer and numbered every 1 cm.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const dpr = W / Math.max(1, stage.clientWidth || W);
    const pxmm = W / scene.wMm;
    ctx.strokeStyle = 'rgba(235,235,235,0.85)'; ctx.lineWidth = 1.2 * dpr;
    ctx.fillStyle = 'rgba(235,235,235,0.9)';
    ctx.font = `${10 * dpr}px system-ui, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let d = 5; d < scene.hMm - 0.5; d += 5) {
      const y = Math.round(d * pxmm) + 0.5, len = (d % 10 === 0 ? 9 : 5) * dpr;
      ctx.beginPath(); ctx.moveTo(W, y); ctx.lineTo(W - len, y); ctx.stroke();
      if (d % 10 === 0) ctx.fillText(d === 10 ? '1 cm' : String(d / 10), W - len - 3 * dpr, y);
    }
  }

  // ---- highlight ----
  function applyHighlight() {
    if (!scene) return;
    const sel = bus.state?.selected ?? null, hov = bus.state?.hovered ?? null;
    const path = new Set([...(sel ? getPathway(sel) : []), ...(hov ? getPathway(hov) : [])]);
    const all = [...scene.structures, ...realStructs.values()];
    const cls = {};
    for (const s of all) {
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
    const focusKey = st.localHover || st.localSel;
    const s = focusKey ? findStruct(focusKey)
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
      rows([['Position', b.position], ['Probe', b.probe], ['Landmark', b.landmark], ['Screen orientation', `Left of screen = ${scene.sides[0]}; right = ${scene.sides[1]}.`], ['Field shown', `${scene.wMm} mm wide, ${scene.hMm} mm deep (to scale).`]]);
    } else if (st.step === 2) {
      h.textContent = '2. Identify the sonoanatomy';
      const ul = el('ul', { class: 'bpus-list' }, info);
      for (const x of b.sonoanatomy) el('li', { text: x }, ul);
      el('p', { class: 'bpus-muted', text: 'Nerves: hypoechoic roots ("traffic light") in the neck, a hypoechoic "bunch of grapes" above the clavicle, and honeycomb-pattern nerves more distally. Use colour Doppler to tell vessels from nerves.' }, info);
    } else if (st.step === 3) {
      h.textContent = '3. Needle';
      rows([['Equipment', b.equipment], ['Needle', `${b.needle.length}, ${b.needle.type.toLowerCase()}, ${b.needle.plane.toLowerCase()}, ${b.needle.direction.toLowerCase()}`], ['Approach', b.approach], ['Target', b.needleTarget],
        ['Passes shown', scene.injections.map((j) => j.note).join(' ')], ['Alternative (dotted path)', scene.alts.map((j) => j.note).join(' ')]]);
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
    const order = ['nerve', 'artery', 'vein', 'muscle', 'bone', 'tendon', 'fascia', 'fat', 'pleura', 'point'];
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

  stage.addEventListener('click', () => { if (st.localSel) { st.localSel = null; applyHighlight(); } });

  // ---- bus ----
  unsubs.push(bus.on('block', (p) => { const id = p?.id ?? null; if (id !== st.block) showBlock(id); }));
  unsubs.push(bus.on('select', () => applyHighlight()));
  unsubs.push(bus.on('hover', () => applyHighlight()));

  showBlock(bus.state?.block ?? null);

  return {
    destroy() {
      stop();
      clearTimeout(thumbTimer);
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
