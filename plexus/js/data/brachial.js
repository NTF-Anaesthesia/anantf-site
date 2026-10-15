// Brachial plexus for the plexus explorer (Anatomy in 3D).
// Author: Dr Koh Wenjun, NTF Anaesthesia. Educational use only.
//
// The anatomy and the blocks come straight from the brachial plexus app (brachial-plexus/js/data.js), so the two
// always teach the same thing: element names, roots, motor and sensory notes, and for every block exactly the same
// target / covers / variable / spares lists (status precedence target > covers > variable > spares, as blockStatus()
// there). Only the explorer's own fields are added here: the 3D model mapping, camera views, injection markers and the
// labelled diagram.
//
// 3D: the owner's Blender V3 model (brachial-plexus/model/, see model-report.md). It is a LEFT plexus with the arm
// abducted; the viewer mirrors it in x (as the brachial app does) so every plexus here is a right side. Points in
// `views` and block `view` / `marker` are in the GLB's own frame (metres, Y up, +Z anterior, +X towards the left arm),
// before the mirror: model.frame = 'gltf', model.mirrorX = true.

import { ELEMENTS, ELEMENT_ORDER, BLOCKS, BLOCK_ORDER_ALL } from '../../../brachial-plexus/js/data.js';

const KIND = { root: 'root', trunk: 'trunk', division: 'division', cord: 'cord', terminal: 'terminal', collateral: 'branch', related: 'related' };

const elements = Object.fromEntries(ELEMENT_ORDER.map((id) => {
  const e = ELEMENTS[id];
  return [id, {
    name: e.name, short: e.short, kind: KIND[e.level] || 'branch', roots: [...(e.spinal || [])], parents: [...(e.parents || [])],
    motor: e.motor, sensory: e.sensory, notes: e.notes,
  }];
}));

// Short labels for the block chips (the full names are the brachial app's).
const SHORT = {
  interscalene: 'Interscalene', supraclavicular: 'Supraclavicular', infraclavicular: 'Infraclavicular', axillary: 'Axillary',
  'superior-trunk': 'Superior trunk', costoclavicular: 'Costoclavicular', raptir: 'RAPTIR',
};

// Explorer-only fields per block: diagram band, camera view and injection marker (GLB frame, before the mirror).
const PLACE = {
  interscalene: {
    band: { x0: 95, x1: 318 },
    view: { target: [-0.056, 0.047, -0.008], position: [0.02, 0.115, 0.22] },
    marker: [-0.056, 0.0485, -0.0035],
  },
  supraclavicular: {
    band: { x0: 318, x1: 700 },
    view: { target: [-0.026, 0.014, -0.008], position: [0.02, 0.17, 0.17] },
    marker: [-0.024, 0.0095, -0.003],
  },
  infraclavicular: {
    band: { x0: 700, x1: 985 },
    view: { target: [0.026, -0.02, -0.009], position: [0.05, 0.03, 0.23] },
    marker: [0.026, -0.0205, -0.0105],
  },
  axillary: {
    band: { x0: 985, x1: 1455 },
    view: { target: [0.068, -0.024, -0.007], position: [0.13, -0.09, 0.2] },
    marker: [0.069, -0.0235, -0.0075],
  },
  'superior-trunk': {
    band: { x0: 300, x1: 520, y0: 20, y1: 400, label: 'Superior trunk' },
    view: { target: [-0.04, 0.034, -0.008], position: [0.03, 0.1, 0.22] },
    marker: [-0.041, 0.034, -0.0025],
  },
  costoclavicular: {
    band: { x0: 690, x1: 830, label: 'Costoclavicular' },
    view: { target: [0.005, -0.015, -0.008], position: [0.03, 0.06, 0.235] },
    marker: [0.0055, -0.0152, -0.0075],
  },
  raptir: {
    band: { x0: 700, x1: 985, label: 'RAPTIR (retroclavicular)' },
    view: { target: [0.026, -0.02, -0.009], position: [0.03, 0.2, 0.12] },
    marker: [0.026, -0.0205, -0.0105],
  },
};

const blocks = Object.fromEntries(BLOCK_ORDER_ALL.map((id) => {
  const b = BLOCKS[id];
  const target = [...b.targetIds];
  return [id, {
    name: b.name,
    short: SHORT[id] || b.name,
    summary: b.coverageText,
    landmarks: b.needleTarget,
    target,
    // The brachial data lists the targets among the covered nerves too; target wins there, so leave them out here.
    covers: b.covers.filter((x) => !target.includes(x)),
    variable: [...b.variable],
    spares: [...b.spares],
    advanced: !!b.advanced,
    // Nerves reached as an unwanted effect (e.g. the phrenic nerve with interscalene): shown as "(side effect)".
    sideEffects: [...(b.sideEffectIds || [])],
    // Advanced variants fall back to their core block when the level drops below Consultant (explorer.js).
    ...(b.advanced && b.relatedTo ? { relatedTo: b.relatedTo } : {}),
    more: { href: `../brachial-plexus/#block=${id}`, text: 'Needle, volume, ultrasound and coverage in the brachial plexus app' },
    ...PLACE[id],
  }];
}));

// Split-nerve GLB mesh name (spaces; three.js turns them into underscores) -> element id.
const MESHES = {
  'C5 root': 'root-c5', 'C6 root': 'root-c6', 'C7 root': 'root-c7', 'C8 root': 'root-c8', 'T1 root': 'root-t1',
  'Superior trunk': 'trunk-sup', 'Middle trunk': 'trunk-mid', 'Inferior trunk': 'trunk-inf',
  'Ant div superior trunk': 'div-sup-ant', 'Post div superior trunk': 'div-sup-post',
  'Ant div middle trunk': 'div-mid-ant', 'Post div middle trunk': 'div-mid-post',
  'Ant div inferior trunk': 'div-inf-ant', 'Post div inferior trunk': 'div-inf-post',
  'Lateral cord': 'cord-lat', 'Posterior cord': 'cord-post', 'Medial cord': 'cord-med',
  'Lateral root of median': 'n-median', 'Medial root of median': 'n-median', 'Median nerve': 'n-median',
  'Musculocutaneous nerve': 'n-musculocutaneous', 'Axillary nerve': 'n-axillary', 'Radial nerve': 'n-radial', 'Ulnar nerve': 'n-ulnar',
  'Dorsal scapular nerve': 'n-dorsal-scapular', 'Suprascapular nerve': 'n-suprascapular', 'Nerve to subclavius': 'n-subclavius',
  'Lateral pectoral nerve': 'n-lat-pectoral', 'Medial pectoral nerve': 'n-med-pectoral',
  'Medial cutaneous nerve of arm': 'n-mcn-arm', 'Medial cutaneous nerve of forearm': 'n-mcn-forearm',
  'Upper subscapular nerve': 'n-upper-subscap', 'Thoracodorsal nerve': 'n-thoracodorsal', 'Lower subscapular nerve': 'n-lower-subscap',
  'Long thoracic (C5 part)': 'n-long-thoracic', 'Long thoracic (C6 part)': 'n-long-thoracic', 'Long thoracic (C5-C6 stem)': 'n-long-thoracic',
  'Long thoracic (C7 part)': 'n-long-thoracic', 'Long thoracic nerve': 'n-long-thoracic',
  // Not a brachial plexus element: drawn grey, not selectable.
  'First intercostal nerve': null,
};

// ------------------------------------------------------------------ diagram
// Roots -> trunks -> divisions -> cords on the left; every branch ends in one label column on the right
// (terminal branches with their roots underneath). Collateral branches leave the part they really arise from.
const Y = { c5: 200, c6: 430, c7: 560, c8: 760, t1: 1000, sup: 315, mid: 560, inf: 880 };
const hook = (x, y0, y1, x1) => `M${x} ${y0} L${x} ${y1 + (y0 > y1 ? 15 : -15)} Q${x} ${y1} ${x + 15} ${y1}${x1 ? ` L${x1} ${y1}` : ''}`;
const branch = (x, y0, y1) => `M${x} ${y0} C${x} ${(y0 + y1) / 2} ${x + 20} ${y1} ${x + 60} ${y1} L1085 ${y1}`;
const LX = 1097; // label column

const diagram = {
  viewBox: [0, -110, 1460, 1370],
  columns: [
    { x0: 0, x1: 318, label: 'Roots', sub: 'Interscalene' },
    { x0: 318, x1: 500, label: 'Trunks', sub: 'Over rib 1' },
    { x0: 500, x1: 700, label: 'Divisions', sub: 'Clavicle' },
    { x0: 700, x1: 985, label: 'Cords', sub: 'Pec minor' },
    { x0: 985, x1: 1460, label: 'Branches', sub: 'Axilla and arm' },
  ],
  geom: {
    // roots
    'root-c5': { d: [`M110 ${Y.c5} L240 ${Y.c5} C285 ${Y.c5} 285 ${Y.sup} 318 ${Y.sup}`], w: 'xl', label: { x: 18, y: Y.c5 + 13, anchor: 'start', kind: 'root' } },
    'root-c6': { d: [`M110 ${Y.c6} L240 ${Y.c6} C285 ${Y.c6} 285 ${Y.sup} 318 ${Y.sup}`], w: 'xl', label: { x: 18, y: Y.c6 + 13, anchor: 'start', kind: 'root' } },
    'root-c7': { d: [`M110 ${Y.c7} L318 ${Y.c7}`], w: 'xl', label: { x: 18, y: Y.c7 + 13, anchor: 'start', kind: 'root' } },
    'root-c8': { d: [`M110 ${Y.c8} L240 ${Y.c8} C285 ${Y.c8} 285 ${Y.inf} 318 ${Y.inf}`], w: 'xl', label: { x: 18, y: Y.c8 + 13, anchor: 'start', kind: 'root' } },
    'root-t1': { d: [`M110 ${Y.t1} L240 ${Y.t1} C285 ${Y.t1} 285 ${Y.inf} 318 ${Y.inf}`], w: 'xl', label: { x: 18, y: Y.t1 + 13, anchor: 'start', kind: 'root' } },
    // trunks
    'trunk-sup': { d: [`M318 ${Y.sup} L500 ${Y.sup}`], w: 'xl', label: { x: 409, y: Y.sup + 48, anchor: 'middle', kind: 'struct', text: 'Superior' } },
    'trunk-mid': { d: [`M318 ${Y.mid} L500 ${Y.mid}`], w: 'xl', label: { x: 409, y: Y.mid + 48, anchor: 'middle', kind: 'struct', text: 'Middle' } },
    'trunk-inf': { d: [`M318 ${Y.inf} L500 ${Y.inf}`], w: 'xl', label: { x: 409, y: Y.inf + 48, anchor: 'middle', kind: 'struct', text: 'Inferior' } },
    // divisions (A anterior, P posterior)
    'div-sup-ant': { d: [`M500 ${Y.sup} L700 ${Y.sup}`], w: 'm', label: { x: 535, y: Y.sup - 16, anchor: 'middle', kind: 'struct', text: 'A' } },
    'div-sup-post': { d: [`M500 ${Y.sup} C585 ${Y.sup} 615 ${Y.mid} 700 ${Y.mid}`], w: 'm', label: { x: 548, y: 380, anchor: 'end', kind: 'struct', text: 'P' } },
    'div-mid-ant': { d: [`M500 ${Y.mid} C585 ${Y.mid} 615 ${Y.sup} 700 ${Y.sup}`], w: 'm', label: { x: 548, y: 518, anchor: 'end', kind: 'struct', text: 'A' } },
    'div-mid-post': { d: [`M500 ${Y.mid} L700 ${Y.mid}`], w: 'm', label: { x: 535, y: Y.mid + 42, anchor: 'middle', kind: 'struct', text: 'P' } },
    'div-inf-post': { d: [`M500 ${Y.inf} C585 ${Y.inf} 615 ${Y.mid} 700 ${Y.mid}`], w: 'm', label: { x: 548, y: 755, anchor: 'end', kind: 'struct', text: 'P' } },
    'div-inf-ant': { d: [`M500 ${Y.inf} L700 ${Y.inf}`], w: 'm', label: { x: 535, y: Y.inf + 42, anchor: 'middle', kind: 'struct', text: 'A' } },
    // cords
    'cord-lat': { d: [`M700 ${Y.sup} L985 ${Y.sup}`], w: 'xl', label: { x: 712, y: Y.sup + 48, anchor: 'start', kind: 'struct', text: 'Lateral' } },
    'cord-post': { d: [`M700 ${Y.mid} L985 ${Y.mid}`], w: 'xl', label: { x: 712, y: Y.mid + 48, anchor: 'start', kind: 'struct', text: 'Posterior' } },
    'cord-med': { d: [`M700 ${Y.inf} L985 ${Y.inf}`], w: 'xl', label: { x: 712, y: Y.inf - 22, anchor: 'start', kind: 'struct', text: 'Medial' } },
    // terminal branches
    'n-musculocutaneous': { d: [`M985 ${Y.sup} L1085 ${Y.sup}`], w: 'l', label: { x: LX, y: Y.sup + 12, anchor: 'start', kind: 'term', text: 'Musculocutaneous' } },
    'n-axillary': { d: [`M955 ${Y.mid} C990 ${Y.mid} 1000 470 1040 470 L1085 470`], w: 'l', label: { x: LX, y: 482, anchor: 'start', kind: 'term', text: 'Axillary' } },
    'n-radial': { d: [`M985 ${Y.mid} L1085 ${Y.mid}`], w: 'l', label: { x: LX, y: Y.mid + 12, anchor: 'start', kind: 'term', text: 'Radial' } },
    'n-median': { d: [
      `M985 ${Y.sup} C1035 ${Y.sup} 1025 780 1055 780`,
      `M985 ${Y.inf} C1035 ${Y.inf} 1025 780 1055 780`,
      'M1055 780 L1085 780',
    ], w: 'l', label: { x: LX, y: 792, anchor: 'start', kind: 'term', text: 'Median' } },
    'n-ulnar': { d: [`M985 ${Y.inf} L1085 ${Y.inf}`], w: 'l', label: { x: LX, y: Y.inf + 12, anchor: 'start', kind: 'term', text: 'Ulnar' } },
    // collateral branches: roots and superior trunk
    'n-dorsal-scapular': { d: [hook(120, Y.c5, 60)], w: 's', label: { x: 142, y: 71, anchor: 'start', kind: 'branch', text: 'Dorsal scapular' } },
    // Long thoracic: C5 stem with the C6 and C7 contributions joining it (the 3D model has the same three parts).
    'n-long-thoracic': { d: [
      hook(205, Y.c5, 660),
      `M170 ${Y.c6} C195 ${Y.c6} 205 ${Y.c6 + 12} 205 ${Y.c6 + 45}`,
      `M170 ${Y.c7} C195 ${Y.c7} 205 ${Y.c7 + 12} 205 ${Y.c7 + 45}`,
    ], w: 's', label: { x: 227, y: 671, anchor: 'start', kind: 'branch', text: 'Long thoracic (C5–C7)' } },
    'n-suprascapular': { d: [hook(365, Y.sup, 125)], w: 's', label: { x: 387, y: 136, anchor: 'start', kind: 'branch', text: 'Suprascapular' } },
    'n-subclavius': { d: [hook(445, Y.sup, 195)], w: 's', label: { x: 467, y: 206, anchor: 'start', kind: 'branch', text: 'Nerve to subclavius' } },
    // collateral branches: cords (each runs to the label column)
    'n-lat-pectoral': { d: [`M830 ${Y.sup} C830 270 850 245 890 245 L1085 245`], w: 's', label: { x: LX, y: 256, anchor: 'start', kind: 'branch', text: 'Lateral pectoral' } },
    'n-upper-subscap': { d: [`M745 ${Y.mid} C745 450 775 405 825 405 L1085 405`], w: 's', label: { x: LX, y: 416, anchor: 'start', kind: 'branch', text: 'Upper subscapular' } },
    // Along the posterior cord: upper subscapular, thoracodorsal, then lower subscapular (the later branch takes the
    // higher label row so the two never cross).
    'n-thoracodorsal': { d: [branch(915, Y.mid, 700)], w: 's', label: { x: LX, y: 711, anchor: 'start', kind: 'branch', text: 'Thoracodorsal' } },
    'n-lower-subscap': { d: [branch(940, Y.mid, 645)], w: 's', label: { x: LX, y: 656, anchor: 'start', kind: 'branch', text: 'Lower subscapular' } },
    'n-med-pectoral': { d: [branch(725, Y.inf, 1075)], w: 's', label: { x: LX, y: 1086, anchor: 'start', kind: 'branch', text: 'Medial pectoral' } },
    'n-mcn-arm': { d: [branch(780, Y.inf, 1020)], w: 's', label: { x: LX, y: 1031, anchor: 'start', kind: 'branch', text: 'MCNA (arm)' } },
    'n-mcn-forearm': { d: [branch(840, Y.inf, 965)], w: 's', label: { x: LX, y: 976, anchor: 'start', kind: 'branch', text: 'MCNF (forearm)' } },
    // related nerves (grey)
    'n-phrenic': { d: [hook(165, Y.c5, 125)], w: 's', label: { x: 187, y: 136, anchor: 'start', kind: 'branch', text: 'Phrenic' } },
    'n-supraclavicular-cx': { d: ['M110 1160 L170 1160'], w: 's', label: { x: 182, y: 1171, anchor: 'start', kind: 'branch', text: 'Supraclavicular nn (cervical plexus)' } },
    'n-intercostobrachial': { d: ['M900 1160 L960 1160'], w: 's', label: { x: 972, y: 1171, anchor: 'start', kind: 'branch', text: 'Intercostobrachial (T2)' } },
  },
  notes: [
    { x: 1445, y: 1240, text: 'Grey: related nerves, not part of the plexus. A anterior, P posterior division.', anchor: 'end' },
  ],
};

export default {
  id: 'brachial',
  name: 'Brachial plexus',
  tab: 'Brachial',
  side: 'right',
  levels: ['C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'T1', 'T2'],
  levelColours: { C3: '#059669', C4: '#b45309', C5: '#9333ea', C6: '#2563eb', C7: '#a3123a', C8: '#0f766e', T1: '#4b5563', T2: '#7c2d12' },
  intro: 'Anterior rami of C5–T1 run between the scalenes as roots, join over the first rib as three trunks, split behind ' +
    'the clavicle into anterior and posterior divisions, regroup around the axillary artery as the lateral, posterior and ' +
    'medial cords, and end in the axilla as the musculocutaneous, axillary, radial, median and ulnar nerves.',
  model: {
    glb: '../brachial-plexus/model/brachial-plexus-v3.glb',
    nerveGlb: '../brachial-plexus/model/brachial-plexus-v3-nerves-split.glb',
    frame: 'gltf',
    mirrorX: true,
    meshes: MESHES,
    // Context objects in the V3 file: the fused "Nerve" mesh is replaced by the split nerves.
    cats: { Nerve: 'skip', Artery: 'artery', Vein: 'vein' },
    rootLabelEnd: 'min-x',
  },
  views: {
    oblique: { label: 'Oblique', target: [0.0, 0.012, -0.01], position: [0.13, 0.13, 0.27] },
    front: { label: 'Front', target: [0.0, 0.012, -0.01], position: [0.0, 0.03, 0.34] },
    above: { label: 'Above', target: [0.0, 0.012, -0.01], position: [0.0, 0.33, 0.07] },
    back: { label: 'Back', target: [0.0, 0.012, -0.01], position: [0.0, 0.05, -0.34] },
  },
  defaultView: 'oblique',
  elements,
  order: [...ELEMENT_ORDER],
  diagram,
  blocks,
  blockOrder: [...BLOCK_ORDER_ALL],
  credits: 'Brachial plexus: the Blender V3 teaching model also used in the brachial plexus app, derived from Z-Anatomy (CC BY-SA 4.0), based on BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Modified: nerves and vessels rebuilt from Z-Anatomy centrelines and thickened, shoulder abducted; it is a left side, shown mirrored as a right side. Block coverage follows the brachial plexus app.',
};
