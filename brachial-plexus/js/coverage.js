// Block coverage maps (cutaneous, motor, bone) for the right upper limb.
// Original SVG illustration. Author: Dr Koh Wenjun, NTF Anaesthesia. Educational use only.
//
// API: mount(containerEl, bus, opts?) -> { destroy(), setMode(mode) }
//   opts.mode    initial tab: 'cutaneous' | 'motor' | 'osteotome' | 'compare' (default 'cutaneous')
//   opts.heading show the module heading (default true)
// Bus: listens to 'select', 'hover', 'block'. Emits
//   'hover'  {id: nerveId|null, source: 'coverage', region: regionId|null}
//   'select' {id: nerveId, source: 'coverage', region: regionId}
//   'block'  {id: blockId|null, source: 'coverage'}

import {
  ELEMENTS, REGIONS, REGION_IDS, BLOCKS, BLOCK_ORDER, BLOCK_ORDER_ADVANCED, DISCLAIMER,
  regionStatus, regionsForElement,
} from './data.js';

const SRC = 'coverage';
const SVGNS = 'http://www.w3.org/2000/svg';
let UID = 0;

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------
const MODES = [
  { id: 'cutaneous', label: 'Skin' , long: 'Cutaneous (skin)' },
  { id: 'motor', label: 'Motor', long: 'Motor (muscle groups)' },
  { id: 'osteotome', label: 'Bone', long: 'Osteotomes (bones and joints)' },
  { id: 'compare', label: 'Compare', long: 'Compare all blocks (core and advanced)' },
];

const BLOCK_SHORT = {
  interscalene: 'Interscalene',
  supraclavicular: 'Supraclavicular',
  infraclavicular: 'Infraclavicular',
  axillary: 'Axillary',
  'superior-trunk': 'Superior trunk',
  costoclavicular: 'Costoclavicular',
  raptir: 'RAPTIR',
};
const ADVANCED_IDS = BLOCK_ORDER_ADVANCED.filter((id) => BLOCKS[id]);
const shortName = (id) => BLOCK_SHORT[id] || BLOCKS[id]?.name || id;

// Categorical colour per nerve, used when no block is selected (classic innervation map).
const NERVE_COLOR = {
  'n-supraclavicular-cx': '#f6c453',
  'n-axillary': '#f4a3c8',
  'n-radial': '#b9a4f5',
  'n-musculocutaneous': '#8fbff5',
  'n-median': '#8fdca4',
  'n-ulnar': '#f7b27a',
  'n-mcn-forearm': '#6fd6c6',
  'n-mcn-arm': '#c6e57a',
  'n-intercostobrachial': '#f5b9b9',
  'n-phrenic': '#e9a0a0',
  'n-long-thoracic': '#d5c08a',
  'n-suprascapular': '#f0d070',
  'n-lat-pectoral': '#9fc8e8',
  'n-thoracodorsal': '#c7b5e0',
};

// Clinical consequence of missing a nerve (for "Spared" / "May be missed").
const REASONS = {
  'n-suprascapular': 'most of the shoulder joint, so shoulder surgery is painful',
  'n-axillary': 'deltoid, inferior shoulder joint and the "regimental badge" skin',
  'n-musculocutaneous': 'lateral forearm skin and elbow flexion',
  'n-radial': 'posterior arm and forearm, dorsum of the hand',
  'n-median': 'lateral palm and 3.5 digits',
  'n-ulnar': 'medial hand and 1.5 digits (C8–T1)',
  'n-mcn-arm': 'lower medial arm',
  'n-mcn-forearm': 'medial forearm',
  'n-intercostobrachial': 'axilla and upper medial arm (tourniquet pain)',
  'n-supraclavicular-cx': 'cape of the shoulder, skin over the clavicle and acromion',
};

const SUPPLEMENT = {
  interscalene: [
    'Forearm or hand surgery: C8–T1 (ulnar and medial cutaneous nerves) is usually spared, so choose a more distal block.',
    'Incision over the cape or clavicle: the supraclavicular nerves (cervical plexus, C3–C4) are not reliably blocked; consider a superficial cervical plexus block.',
    'Poor respiratory reserve: consider a superior trunk block or a phrenic-sparing alternative.',
  ],
  supraclavicular: [
    'Ulnar / inferior trunk sparing: deposit in the corner pocket first.',
    'Tourniquet or upper medial arm: add intercostobrachial infiltration (T2 is not part of the plexus).',
    'Shoulder surgery: the suprascapular nerve may be missed; an interscalene (or superior trunk) block is preferred.',
  ],
  infraclavicular: [
    'Shoulder surgery: not suitable (suprascapular nerve spared).',
    'Tourniquet or upper medial arm: add intercostobrachial infiltration.',
  ],
  axillary: [
    'Musculocutaneous: block it separately in coracobrachialis (lateral forearm skin, elbow flexion).',
    'Tourniquet or upper medial arm: add subcutaneous infiltration across the axillary crease for the intercostobrachial and medial cutaneous nerve of the arm (deck: 23G needle, 5 ml of 0.5% ropivacaine).',
    'Shoulder and upper arm: not covered.',
  ],
  'superior-trunk': [
    'Incision over the cape or clavicle: the supraclavicular nerves (cervical plexus, C3–C4) are not covered; add a superficial cervical plexus block.',
    'Forearm or hand surgery: C8–T1 (ulnar and medial cutaneous nerves) is spared and C7 is variable; choose a more distal block.',
    'No respiratory reserve at all: phrenic sparing is reduced risk, not zero; consider a more distal shoulder option (e.g. suprascapular plus axillary nerve blocks).',
  ],
  costoclavicular: [
    'Shoulder surgery: not suitable (suprascapular nerve spared).',
    'Tourniquet or upper medial arm: add intercostobrachial infiltration (T2 is not part of the plexus).',
    'Musculocutaneous: no separate injection needed; it is still inside the lateral cord in the cluster.',
  ],
  raptir: [
    'Shoulder surgery: not suitable (suprascapular nerve spared).',
    'Tourniquet or upper medial arm: add intercostobrachial infiltration.',
    'Spread not reaching the medial cord: reposition, as for the coracoid infraclavicular block.',
  ],
};

// Side-effect and safety notes for the advanced variants (shown under the phrenic line).
const BLOCK_NOTES = {
  'superior-trunk': [
    'Lower phrenic risk than interscalene: hemidiaphragmatic paralysis about 5% vs 71% in one randomised trial (Kim 2019), but not abolished.',
    'Suprascapular nerve included: inject proximal to its take-off from the superior trunk, so the shoulder joint is covered.',
  ],
  costoclavicular: [
    'Musculocutaneous nerve covered by the single injection: no separate injection needed (unlike axillary).',
    'Pneumothorax caution: the pleura lies deep to the second rib and serratus anterior; keep the needle tip in view.',
  ],
  raptir: [
    'Side effects as for the infraclavicular block: phrenic usually spared, no shoulder cover.',
    'The early needle path is hidden in the clavicle’s acoustic shadow: advance slowly (vascular puncture risk).',
  ],
};
// Block-specific wording for the phrenic line where the generic text would overstate it.
const PHRENIC_OVERRIDE = {
  costoclavicular: 'Phrenic nerve usually spared: diaphragm weakness is uncommon, but reported with proximal spread.',
};

const PHRENIC_TEXT = {
  covers: 'Phrenic nerve blocked: hemidiaphragmatic paresis is expected (most common side effect). Avoid in significant respiratory disease.',
  variable: 'Phrenic nerve block possible, lower risk than interscalene. Caution in poor respiratory reserve.',
  spares: 'Phrenic nerve spared: no diaphragm weakness expected.',
};

const STATUS_LABEL = { covers: 'Covered', variable: 'Variable', spares: 'Spared' };
const SPINAL_ORDER = ['C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'T1', 'T2'];

// ---------------------------------------------------------------------------
// Geometry (one frame for every view: right limb, lateral = small x, midline x=300).
// Posterior views reuse the frame mirrored, so the right arm sits on the viewer's right.
// ---------------------------------------------------------------------------
const VIEWBOX = '50 -46 252 652';
const VB = VIEWBOX.split(' ').map(Number);
const MIRROR = 'matrix(-1 0 0 1 352 0)';

const BODY =
  'M330,-40 L300,-40 C279,-40 264,-25 264,-5 C264,10 269,22 272,28 C270,44 266,64 258,80 ' +
  'C232,92 186,102 146,110 C112,116 92,130 88,160 ' +
  'C85,190 88,220 90,250 C92,285 90,310 90,330 C92,370 100,420 112,476 L144,476 ' +
  'C148,430 151,380 151,345 C153,320 156,300 158,280 C160,250 162,220 166,200 ' +
  'C170,195 174,198 176,204 C184,260 192,340 198,440 L330,440 Z';
const PALM = 'M112,472 L144,472 C150,494 153,515 152,537 L106,537 C106,515 108,494 112,472 Z';
const THUMB = 'M112,486 C101,494 94,508 90,528 C88,540 89,551 95,551 C100,551 103,540 106,530 C108,520 110,508 111,500 Z';
const FINGERS = [
  [106.5, 530, 10, 50], [117.5, 530, 10.5, 58], [129, 530, 10.5, 53], [140.5, 530, 10, 40],
];

const sh = (d) => ({ d });
const P = (pts) => ({ d: 'M' + pts.map((p) => p.join(',')).join(' L') + ' Z' });
const ell = (cx, cy, rx, ry) => ({ d: `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z` });

// Cutaneous territories (textbook maps, simplified). Polygons are clipped to the silhouette.
const CUT = {
  anterior: {
    'cut-supraclavicular-cape': [P([[250, 76], [300, 76], [300, 150], [210, 150], [160, 141], [112, 136], [64, 140], [64, 100], [200, 84]])],
    'cut-upper-lateral-arm': [P([[64, 140], [112, 136], [150, 143], [146, 172], [124, 178], [121, 236], [64, 236]])],
    'cut-lower-lateral-arm': [P([[64, 236], [121, 236], [118, 326], [64, 326]])],
    'cut-upper-medial-arm': [P([[146, 172], [176, 180], [205, 192], [204, 240], [176, 250], [121, 256], [124, 178]])],
    'cut-lower-medial-arm': [P([[121, 256], [172, 250], [172, 326], [118, 326]])],
    'cut-lateral-forearm': [P([[64, 326], [122, 326], [128, 480], [64, 480]])],
    'cut-medial-forearm': [P([[122, 326], [172, 326], [172, 480], [128, 480]])],
    'cut-palm-lateral': [P([[60, 478], [135, 478], [135, 600], [60, 600]])],
    'cut-ulnar-hand': [P([[135, 478], [176, 478], [176, 600], [135, 600]])],
  },
  posterior: {
    'cut-supraclavicular-cape': [P([[250, 76], [300, 76], [300, 140], [200, 136], [124, 130], [64, 136], [64, 100], [200, 84]])],
    'cut-upper-lateral-arm': [P([[64, 136], [124, 130], [156, 134], [153, 172], [131, 170], [119, 228], [64, 228]])],
    'cut-lower-lateral-arm': [P([[64, 228], [119, 228], [115, 322], [64, 322]])],
    'cut-posterior-arm': [P([[131, 170], [153, 172], [151, 322], [115, 322], [119, 228]])],
    'cut-upper-medial-arm': [P([[153, 172], [178, 182], [204, 194], [204, 252], [152, 256]])],
    'cut-lower-medial-arm': [P([[152, 256], [176, 256], [176, 322], [151, 322]])],
    'cut-lateral-forearm': [P([[64, 322], [104, 322], [111, 478], [64, 478]])],
    'cut-posterior-forearm': [P([[104, 322], [143, 322], [136, 478], [111, 478]])],
    'cut-medial-forearm': [P([[143, 322], [176, 322], [176, 478], [136, 478]])],
    'cut-dorsum-lateral-hand': [P([[60, 478], [135, 478], [135, 562], [106, 562], [106, 600], [60, 600]])],
    'cut-palm-lateral': [P([[106, 562], [135, 562], [135, 600], [106, 600]])],
    'cut-ulnar-hand': [P([[135, 478], [176, 478], [176, 600], [135, 600]])],
  },
};

const DELTOID = sh('M142,111 C112,115 91,130 88,160 C86,190 97,214 118,234 C124,203 138,172 158,142 C161,126 154,113 142,111 Z');

const MOT = {
  anterior: {
    'mot-pectorals': [sh('M182,138 C220,128 268,132 297,146 L297,232 C262,252 214,246 186,218 C174,203 164,180 156,160 C160,148 170,141 182,138 Z')],
    'mot-deltoid': [DELTOID],
    'mot-elbow-flexors': [sh('M110,212 C106,240 106,286 116,318 L134,318 C146,286 148,240 142,212 C136,196 116,196 110,212 Z')],
    'mot-wrist-finger-flexors': [sh('M100,336 C122,328 146,330 150,348 C149,396 143,440 139,470 L118,470 C110,432 101,384 100,336 Z')],
    'mot-thenar': [ell(116, 506, 8, 17), sh('M104,500 C98,512 94,526 92,540 L99,543 C102,530 106,516 110,506 Z')],
    'mot-hand-intrinsics': [ell(146, 510, 6.5, 19), sh('M124,512 L140,512 L140,534 L122,534 Z')],
    'mot-diaphragm': [sh('M188,366 C200,310 254,288 300,304 L300,315 C258,300 212,320 198,368 Z')],
  },
  posterior: {
    'mot-scapular': [sh('M258,86 C270,88 284,96 292,104 L292,262 L246,252 L254,108 Z')],
    'mot-rotator-cuff': [sh('M164,140 C190,120 224,110 252,106 L246,252 C222,216 192,178 164,140 Z')],
    'mot-deltoid': [DELTOID],
    'mot-lat-dorsi': [sh('M184,226 C206,252 214,320 222,428 L298,428 L298,286 C266,276 232,258 206,224 C198,216 188,216 184,226 Z')],
    'mot-elbow-extensors': [sh('M106,222 C102,250 104,292 114,322 L138,322 C150,292 152,250 148,214 C140,196 112,198 106,222 Z')],
    'mot-wrist-finger-extensors': [sh('M100,336 C122,328 146,330 150,348 C149,396 143,440 139,470 L118,470 C110,432 101,384 100,336 Z')],
    'mot-hand-intrinsics': [sh('M118,494 L122,494 L121,532 L117,532 Z'), sh('M128,492 L132,492 L132,532 L128,532 Z'), sh('M138,494 L142,494 L143,532 L139,532 Z')],
  },
};

const BONE_CONTEXT = [
  'M296,100 C270,104 240,98 200,103 L200,112 C240,107 270,112 296,110 Z', // medial clavicle
  'M220,150 C250,140 280,140 298,146', 'M210,180 C245,168 280,168 298,174', 'M204,212 C240,200 280,200 298,206',
  'M200,244 C238,232 280,232 298,238', 'M198,276 C236,264 280,264 298,270', 'M200,308 C238,298 280,298 298,302',
  'M150,128 C162,128 170,134 172,142', // coracoid hint
];

const BONES = {
  'ost-clavicle-lateral': [sh('M140,108 C160,104 180,102 200,103 L200,112 C180,111 160,115 142,117 Z')],
  'ost-shoulder-joint': [ell(129, 141, 15, 15), sh('M146,126 C150,132 150,150 146,158 L142,156 C144,148 144,134 142,128 Z')],
  'ost-humerus-proximal': [sh('M117,152 C121,158 135,158 140,152 L136,236 L119,236 Z')],
  'ost-humerus-distal': [sh('M119,236 L136,236 L139,290 C146,298 150,304 148,310 L106,310 C104,302 110,296 116,290 Z')],
  'ost-elbow': [sh('M104,312 L150,312 C152,322 148,334 141,340 L111,340 C104,334 101,322 104,312 Z')],
  'ost-forearm': [sh('M107,343 L119,343 L126,466 L115,468 Z'), sh('M132,343 L143,343 L141,468 L131,466 Z')],
  'ost-wrist-hand': [
    sh('M112,472 L144,472 L145,486 L111,486 Z'),
    sh('M107,489 L114,489 L106,515 L100,513 Z'), sh('M99,517 L105,519 L99,540 L94,538 Z'),
    ...[[110, 0], [121, 0.5], [132, 1], [143, 1.5]].flatMap(([x], i) => {
      const len = [38, 44, 40, 30][i];
      return [
        sh(`M${x - 1},490 L${x + 6},490 L${x + 5},528 L${x},528 Z`),
        sh(`M${x},532 L${x + 5},532 L${x + 5},${532 + len} L${x},${532 + len} Z`),
      ];
    }),
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function el(tag, attrs = {}, kids = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const c of [].concat(kids)) if (c) n.append(c);
  return n;
}
function sv(tag, attrs = {}, kids = []) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  for (const c of [].concat(kids)) if (c) n.append(c);
  return n;
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function regionRoots(rid) {
  const set = new Set();
  for (const n of REGIONS[rid].nerves) for (const s of ELEMENTS[n]?.spinal || []) set.add(s);
  return SPINAL_ORDER.filter((s) => set.has(s)).join(', ');
}
function regionNerveLabel(rid) {
  const r = REGIONS[rid];
  if (r.nerveName) return r.nerveName;
  return r.nerves.map((n) => ELEMENTS[n]?.name || n).join(', ');
}
function regionColor(rid) {
  return NERVE_COLOR[REGIONS[rid].nerve] || '#c9d2dd';
}
function elementName(id) { return ELEMENTS[id]?.name || id; }

// ---------------------------------------------------------------------------
// Figure builder
// ---------------------------------------------------------------------------
function buildFigure({ view, layer, blockId = null, mini = false, label }) {
  const uid = `cv${++UID}`;
  const svg = sv('svg', {
    viewBox: VIEWBOX, class: `cv-fig${mini ? ' cv-fig--mini' : ''}`, role: 'img',
    'aria-label': label, 'data-block': blockId || '', 'data-layer': layer,
    preserveAspectRatio: 'xMidYMid meet', focusable: 'false',
  });
  const silhouette = () => [
    sv('path', { d: BODY }), sv('path', { d: PALM }), sv('path', { d: THUMB }),
    ...FINGERS.map(([x, y, w, h]) => sv('rect', { x, y, width: w, height: h, rx: w / 2 })),
  ];
  const clip = sv('clipPath', { id: `${uid}-clip`, clipPathUnits: 'userSpaceOnUse' }, silhouette());
  const grad = sv('linearGradient', { id: `${uid}-fade`, x1: 0, y1: 0, x2: 0, y2: 1 }, [
    sv('stop', { offset: 0, 'stop-color': '#fff' }), sv('stop', { offset: 1, 'stop-color': '#000' }),
  ]);
  const mask = sv('mask', { id: `${uid}-mask`, maskUnits: 'userSpaceOnUse', x: -100, y: -100, width: 600, height: 800 }, [
    sv('rect', { x: -100, y: -100, width: 600, height: 800, fill: '#fff' }),
    sv('rect', { x: 180, y: 372, width: 200, height: 70, fill: `url(#${uid}-fade)` }),
  ]);
  const frame = sv('clipPath', { id: `${uid}-frame`, clipPathUnits: 'userSpaceOnUse' }, [
    sv('rect', { x: VB[0], y: VB[1], width: VB[2], height: VB[3] }),
  ]);
  svg.append(sv('defs', {}, [clip, grad, mask, frame]));

  const g = sv('g', { transform: view === 'posterior' ? MIRROR : null, mask: `url(#${uid}-mask)` });
  g.append(sv('g', { class: 'cv-outline' }, silhouette()));
  g.append(sv('g', { class: 'cv-skin' }, silhouette()));

  if (layer === 'osteotome') {
    g.append(sv('g', { class: 'cv-context' }, BONE_CONTEXT.map((d, i) => sv('path', { d, class: i === 0 ? 'cv-bone-neutral' : 'cv-rib' }))));
  }
  // Creases for the hand (decorative).
  g.append(sv('g', { class: 'cv-crease' }, [
    sv('path', { d: 'M108,537 L151,537' }),
    sv('path', { d: 'M90,330 C110,334 135,334 151,345' }),
  ]));

  const regs = sv('g', { class: 'cv-regions', 'clip-path': `url(#${uid}-clip)` });
  const source = layer === 'cutaneous' ? CUT[view] : layer === 'motor' ? MOT[view] : BONES;
  for (const [rid, shapes] of Object.entries(source || {})) {
    const r = REGIONS[rid];
    if (!r) continue;
    const rg = sv('g', { class: 'cv-reg', 'data-region': rid, 'data-nerve': r.nerve, style: `--cv-nerve:${regionColor(rid)}` },
      shapes.map((s) => sv('path', { d: s.d })));
    const t = sv('title');
    t.textContent = `${r.name}: ${regionNerveLabel(rid)}`;
    rg.prepend(t);
    regs.append(rg);
  }
  g.append(regs);
  g.append(sv('path', { class: 'cv-midline', d: 'M300,-40 L300,440' }));
  g.append(sv('g', { class: 'cv-hl', 'clip-path': layer === 'cutaneous' ? `url(#${uid}-clip)` : null }));
  svg.append(sv('g', { 'clip-path': `url(#${uid}-frame)` }, [g]));
  return svg;
}

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------
export function mount(containerEl, bus, opts = {}) {
  const state = {
    mode: MODES.some((m) => m.id === opts.mode) ? opts.mode : 'cutaneous',
    compareLayer: 'cutaneous',
    block: bus?.state?.block || null,
    selected: bus?.state?.selected || null,
    hovered: bus?.state?.hovered || null,
    localRegion: null, // region under the pointer (for the tooltip / info card)
    pinnedRegion: null,
  };
  const uid = `cvr${++UID}`;

  // ---- skeleton -----------------------------------------------------------
  const root = el('div', { class: 'cv', style: `--cv-hatch:url(#${uid}-hatch)` });
  const defs = sv('svg', { class: 'cv-defs', width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false' }, [
    sv('defs', {}, [
      sv('pattern', { id: `${uid}-hatch`, patternUnits: 'userSpaceOnUse', width: 7, height: 7, patternTransform: 'rotate(45)' }, [
        sv('rect', { width: 7, height: 7, class: 'cv-hatch-bg' }),
        sv('rect', { width: 3, height: 7, class: 'cv-hatch-fg' }),
      ]),
    ]),
  ]);
  root.append(defs);

  const head = el('div', { class: 'cv-head' });
  if (opts.heading !== false) head.append(el('h2', { class: 'cv-title', text: 'Block coverage' }));

  const tabs = el('div', { class: 'cv-tabs', role: 'tablist', 'aria-label': 'Coverage map type' });
  const tabBtns = MODES.map((m) => el('button', {
    type: 'button', role: 'tab', class: 'cv-tab', id: `${uid}-tab-${m.id}`, 'data-mode': m.id,
    'aria-controls': `${uid}-stage`, title: m.long, text: m.label,
  }));
  tabs.append(...tabBtns);

  const chips = el('div', { class: 'cv-chips', role: 'group', 'aria-label': 'Choose a block' });
  const chipBtn = (b) => el('button', {
    type: 'button', class: `cv-chip${b && BLOCKS[b]?.advanced ? ' cv-chip--adv' : ''}`, 'data-block': b || '', text: b ? shortName(b) : 'No block',
  });
  const coreChips = [null, ...BLOCK_ORDER].map(chipBtn);
  const advChips = ADVANCED_IDS.map(chipBtn);
  const chipBtns = [...coreChips, ...advChips];
  chips.append(...coreChips);
  if (advChips.length) chips.append(el('span', { class: 'cv-chipgroup', text: 'Advanced' }), ...advChips);
  head.append(tabs, chips);

  const body = el('div', { class: 'cv-body' });
  const stage = el('div', { class: 'cv-stage', id: `${uid}-stage`, role: 'tabpanel' });
  const tip = el('div', { class: 'cv-tip', role: 'status', 'aria-live': 'polite', hidden: true });
  const stageWrap = el('div', { class: 'cv-stagewrap' }, [stage, tip]);
  const panel = el('aside', { class: 'cv-panel', 'aria-label': 'Coverage details' });
  body.append(stageWrap, panel);

  const foot = el('p', { class: 'cv-foot', text: 'Simplified maps: territories overlap and vary between patients. ' + DISCLAIMER });
  root.append(head, body, foot);
  containerEl.append(root);

  // ---- rendering ------------------------------------------------------------
  function viewsFor(layer) {
    return layer === 'osteotome' ? ['anterior'] : ['anterior', 'posterior'];
  }

  function renderStage() {
    stage.textContent = '';
    stage.setAttribute('aria-labelledby', `${uid}-tab-${state.mode}`);
    hideTip();
    if (state.mode === 'compare') return renderCompare();
    const layer = state.mode;
    const figs = el('div', { class: `cv-figs cv-figs--${viewsFor(layer).length}` });
    for (const view of viewsFor(layer)) {
      const cap = layer === 'osteotome' ? 'Bones and joints (anterior)' : view === 'anterior' ? 'Anterior' : 'Posterior';
      figs.append(el('figure', { class: 'cv-figure' }, [
        buildFigure({ view, layer, label: `Right upper limb, ${cap.toLowerCase()} view: ${MODES.find((m) => m.id === layer).long}` }),
        el('figcaption', { text: cap }),
      ]));
    }
    stage.append(figs);
    if (layer === 'osteotome') {
      stage.append(el('p', { class: 'cv-note', text: 'Bony innervation overlaps and is less well mapped than skin. Shoulder joint: mainly suprascapular (posterior / superior) with axillary and lateral pectoral anteriorly.' }));
    }
  }

  function renderCompare() {
    // Compare uses the layer chosen last (Skin, Motor or Bone), so there is only one
    // layer switch: the tabs above.
    const layerName = MODES.find((m) => m.id === state.compareLayer)?.label || 'Skin';
    stage.append(el('p', { class: 'cv-note cv-compare-note', text: `Comparing ${layerName.toLowerCase()} coverage of the four core blocks${ADVANCED_IDS.length ? ' and the advanced variants' : ''}. To compare another layer, choose it in the tabs above, then Compare again. Select a card to make that block active.` }));
    stage.append(compareGrid(BLOCK_ORDER, 'cv-grid'));
    if (ADVANCED_IDS.length) {
      stage.append(el('h3', { class: 'cv-gridhead', text: 'Advanced blocks' }));
      stage.append(compareGrid(ADVANCED_IDS, 'cv-grid cv-grid--adv'));
    }
  }

  function compareGrid(ids, cls) {
    const grid = el('div', { class: cls });
    for (const bid of ids) {
      const b = BLOCKS[bid];
      const card = el('div', { class: 'cv-card', 'data-card': bid });
      const rel = b.advanced && BLOCKS[b.relatedTo] ? ` · variant of ${shortName(b.relatedTo).toLowerCase()}` : '';
      const btn = el('button', { type: 'button', class: 'cv-cardbtn', 'aria-pressed': String(state.block === bid), title: `Show ${b.name}` }, [
        el('span', { class: 'cv-cardname', text: shortName(bid) }),
        el('span', { class: 'cv-cardlevel', text: `${b.level[0].toUpperCase()}${b.level.slice(1)}s${rel}` }),
      ]);
      btn.addEventListener('click', () => bus.emit('block', { id: state.block === bid ? null : bid, source: SRC }));
      const figs = el('div', { class: 'cv-cardfigs' });
      for (const view of viewsFor(state.compareLayer)) {
        figs.append(buildFigure({ view, layer: state.compareLayer, blockId: bid, mini: true, label: `${b.name}: ${state.compareLayer} coverage, ${view} view` }));
      }
      const ph = regionStatus(bid, 'mot-diaphragm');
      const keySpared = b.spares.filter((n) => REASONS[n] && n !== 'n-intercostobrachial').map((n) => ELEMENTS[n].short || elementName(n));
      card.append(btn, figs,
        el('p', { class: `cv-phren cv-phren--${ph}`, html: `<span class="cv-dot" aria-hidden="true"></span>Diaphragm: ${ph === 'covers' ? 'blocked' : ph === 'variable' ? 'possible' : 'spared'}` }),
        el('p', { class: 'cv-cardspare', text: keySpared.length ? `Spares: ${keySpared.join(', ')}` : 'Spares: (see list)' }));
      grid.append(card);
    }
    return grid;
  }

  function legend() {
    if (!state.block && state.mode !== 'compare') {
      return el('p', { class: 'cv-hint', text: 'Colours show which nerve supplies each area. Choose a block to see what it covers. Hover or tap an area for details.' });
    }
    return el('ul', { class: 'cv-legend', 'aria-label': 'Legend' }, [
      el('li', {}, [el('span', { class: 'cv-sw st-covers', 'aria-hidden': 'true' }), 'Covered']),
      el('li', {}, [el('span', { class: 'cv-sw st-variable', 'aria-hidden': 'true' }), 'Variable / may be missed']),
      el('li', {}, [el('span', { class: 'cv-sw st-spares', 'aria-hidden': 'true' }), 'Spared']),
    ]);
  }

  function renderPanel() {
    panel.textContent = '';
    panel.append(legend());
    panel.append(el('div', { class: 'cv-info', 'aria-live': 'polite' }));
    renderInfo();
    const bid = state.block;
    if (bid) {
      const b = BLOCKS[bid];
      const sec = el('section', { class: 'cv-sum' });
      sec.append(el('h3', { text: b.name }), el('p', { class: 'cv-covtext', text: b.coverageText }));
      const ph = regionStatus(bid, 'mot-diaphragm');
      sec.append(el('p', { class: `cv-phren cv-phren--${ph}`, html: `<span class="cv-dot" aria-hidden="true"></span><span>${esc(PHRENIC_OVERRIDE[bid] || PHRENIC_TEXT[ph])}</span>` }));
      if (BLOCK_NOTES[bid]) sec.append(el('ul', { class: 'cv-notes' }, BLOCK_NOTES[bid].map((t) => el('li', { text: t }))));
      const spared = b.spares.filter((n) => REASONS[n]);
      const missed = b.variable.filter((n) => REASONS[n]);
      const other = b.spares.filter((n) => !REASONS[n] && n !== 'n-phrenic' && ELEMENTS[n]?.level !== 'root' && !/^(trunk|div|cord)-/.test(n));
      if (spared.length) sec.append(el('h4', { text: 'Spared' }), listOf(spared, 'spares'));
      if (missed.length) sec.append(el('h4', { text: 'May be missed' }), listOf(missed, 'variable'));
      if (other.length) sec.append(el('p', { class: 'cv-other', text: `Other branches not reached: ${other.map((n) => ELEMENTS[n].short || elementName(n)).join(', ')}.` }));
      if (SUPPLEMENT[bid]) {
        sec.append(el('h4', { text: 'Supplement with…' }), el('ul', { class: 'cv-supp' }, SUPPLEMENT[bid].map((t) => el('li', { text: t }))));
      }
      panel.append(sec);
    }
    if (state.mode !== 'compare') panel.append(renderList());
  }

  function listOf(ids, st) {
    return el('ul', { class: 'cv-spared' }, ids.map((n) => {
      const b = el('button', { type: 'button', class: 'cv-linkbtn', 'data-nerve': n, text: ELEMENTS[n]?.short || elementName(n) });
      return el('li', { class: `st-${st}` }, [b, el('span', { text: ` — ${REASONS[n]}` })]);
    }));
  }

  function renderList() {
    const layer = state.mode;
    const ids = REGION_IDS[layer] || [];
    const wrap = el('section', { class: 'cv-listsec' }, [el('h4', { text: layer === 'cutaneous' ? 'Skin territories' : layer === 'motor' ? 'Muscle groups' : 'Bones and joints' })]);
    const ul = el('ul', { class: 'cv-list' });
    for (const rid of ids) {
      const r = REGIONS[rid];
      const st = state.block ? regionStatus(state.block, rid) : null;
      const btn = el('button', { type: 'button', class: 'cv-row', 'data-region': rid, 'data-nerve': r.nerve, style: `--cv-nerve:${regionColor(rid)}` }, [
        el('span', { class: `cv-sw ${st ? 'st-' + st : 'st-nerve'}`, 'aria-hidden': 'true' }),
        el('span', { class: 'cv-rowtext' }, [
          el('span', { class: 'cv-rowname', text: r.name }),
          el('span', { class: 'cv-rowsub', text: `${regionNerveLabel(rid)} · ${regionRoots(rid)}` }),
        ]),
        st ? el('span', { class: `cv-pill st-${st}`, text: STATUS_LABEL[st] }) : null,
      ]);
      ul.append(el('li', {}, [btn]));
    }
    wrap.append(ul);
    return wrap;
  }

  function infoHTML(rid, blockId) {
    const r = REGIONS[rid];
    const st = blockId ? regionStatus(blockId, rid) : null;
    let extra = '';
    if (r.muscles) extra += `<div class="cv-i-row"><b>Muscles</b> ${esc(r.muscles)}</div>`;
    if (r.test) extra += `<div class="cv-i-row"><b>Test</b> ${esc(r.test)}</div>`;
    if (r.note) extra += `<div class="cv-i-row">${esc(r.note)}</div>`;
    return `<div class="cv-i-name">${esc(r.name)}</div>` +
      `<div class="cv-i-nerve">${esc(regionNerveLabel(rid))}</div>` +
      `<div class="cv-i-roots">Roots: ${esc(regionRoots(rid))}</div>` + extra +
      (st ? `<div class="cv-pill st-${st}">${esc(BLOCKS[blockId].name)}: ${STATUS_LABEL[st]}</div>` : '');
  }

  function renderInfo() {
    const box = panel.querySelector('.cv-info');
    if (!box) return;
    const rid = state.localRegion || state.pinnedRegion;
    const focusId = state.hovered || state.selected;
    if (rid && REGIONS[rid]) {
      box.innerHTML = infoHTML(rid, state.block);
      box.hidden = false;
    } else if (focusId && ELEMENTS[focusId]) {
      const e = ELEMENTS[focusId];
      const n = regionsForElement(focusId).length;
      // The maps are peripheral-nerve territories, not dermatomes. For roots, trunks,
      // divisions and cords say so, so the highlight is not read as a dermatome.
      const proximal = ['root', 'trunk', 'division', 'cord'].includes(e.level);
      const what = proximal
        ? `Fibres from ${e.level === 'root' ? esc(e.short) : `the ${esc(e.name.toLowerCase())}`} contribute to the ${n} highlighted nerve territor${n === 1 ? 'y' : 'ies'}. These are peripheral nerve fields, not a dermatome map.`
        : `${n} highlighted area${n > 1 ? 's' : ''} across the maps.`;
      box.innerHTML = `<div class="cv-i-name">${esc(e.name)}</div><div class="cv-i-roots">Roots: ${esc(e.spinal.join(', '))}</div>` +
        (e.sensory ? `<div class="cv-i-row"><b>Sensory</b> ${esc(e.sensory)}</div>` : '') +
        `<div class="cv-i-row cv-muted">${n ? what : 'No mapped territory.'}</div>`;
      box.hidden = false;
    } else {
      box.hidden = true;
      box.textContent = '';
    }
  }

  // ---- state application ----------------------------------------------------
  function applyStatus() {
    for (const svg of root.querySelectorAll('svg.cv-fig')) {
      const bid = svg.getAttribute('data-block') || state.block;
      svg.classList.toggle('has-block', !!bid);
      for (const g of svg.querySelectorAll('.cv-reg')) {
        const st = bid ? regionStatus(bid, g.dataset.region) : null;
        g.classList.remove('st-covers', 'st-variable', 'st-spares');
        if (st) g.classList.add(`st-${st}`);
      }
    }
  }

  function highlightSet() {
    const set = new Set();
    const id = state.hovered || state.selected;
    if (state.localRegion) set.add(state.localRegion);
    if (id && ELEMENTS[id]) for (const r of regionsForElement(id)) set.add(r);
    return set;
  }

  function applyHighlight() {
    const set = highlightSet();
    for (const svg of root.querySelectorAll('svg.cv-fig')) {
      svg.classList.toggle('has-hl', set.size > 0);
      const hl = svg.querySelector('.cv-hl');
      hl.textContent = '';
      for (const g of svg.querySelectorAll('.cv-reg')) {
        const on = set.has(g.dataset.region);
        g.classList.toggle('is-hl', on);
        if (on) for (const p of g.querySelectorAll('path')) hl.append(sv('path', { d: p.getAttribute('d') }));
      }
    }
    for (const row of root.querySelectorAll('.cv-row')) row.classList.toggle('is-hl', set.has(row.dataset.region));
    for (const b of root.querySelectorAll('.cv-linkbtn')) b.classList.toggle('is-hl', b.dataset.nerve === (state.hovered || state.selected));
  }

  function applyChrome() {
    for (const b of tabBtns) {
      const on = b.dataset.mode === state.mode;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    }
    for (const c of chipBtns) c.setAttribute('aria-pressed', String((c.dataset.block || null) === state.block));
    // Compare shows every block, so the block chips would only mislead there.
    chips.hidden = state.mode === 'compare';
    root.dataset.mode = state.mode;
    for (const c of root.querySelectorAll('.cv-card')) {
      const on = c.dataset.card === state.block;
      c.classList.toggle('is-active', on);
      c.querySelector('.cv-cardbtn').setAttribute('aria-pressed', String(on));
    }
  }

  function applyAll() {
    applyChrome();
    applyStatus();
    renderPanel();
    applyHighlight();
  }

  // ---- tooltip ----------------------------------------------------------------
  function showTip(rid, svg, clientX, clientY) {
    const blockId = svg?.getAttribute('data-block') || state.block;
    tip.innerHTML = infoHTML(rid, blockId);
    tip.hidden = false;
    const box = stageWrap.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = clientX - box.left + 14, y = clientY - box.top + 14;
    if (x + tw > box.width - 4) x = Math.max(4, clientX - box.left - tw - 14);
    if (y + th > box.height - 4) y = Math.max(4, clientY - box.top - th - 14);
    tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  function hideTip() { tip.hidden = true; }

  // ---- events from the DOM -----------------------------------------------------
  const regFrom = (t) => t?.closest?.('[data-region]');
  let lastPointerType = 'mouse';

  function setLocal(rid, emit = true) {
    if (state.localRegion === rid) return;
    state.localRegion = rid;
    if (emit) bus.emit('hover', { id: rid ? REGIONS[rid].nerve : null, source: SRC, region: rid });
    else { renderInfo(); applyHighlight(); }
  }

  const onPointerOver = (e) => {
    lastPointerType = e.pointerType || 'mouse';
    if (lastPointerType === 'touch') return;
    const g = regFrom(e.target);
    if (!g || !stage.contains(g)) return;
    setLocal(g.dataset.region);
  };
  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const g = regFrom(e.target);
    if (g && stage.contains(g)) showTip(g.dataset.region, g.ownerSVGElement, e.clientX, e.clientY);
  };
  const onPointerOut = (e) => {
    if (e.pointerType === 'touch') return;
    const g = regFrom(e.target);
    if (!g || !stage.contains(g)) return;
    const to = regFrom(e.relatedTarget);
    if (to && stage.contains(to)) return;
    hideTip();
    setLocal(null);
  };
  const onStageClick = (e) => {
    const g = regFrom(e.target);
    if (!g) {
      if (lastPointerType === 'touch') { hideTip(); state.pinnedRegion = null; setLocal(null); }
      return;
    }
    const rid = g.dataset.region;
    state.pinnedRegion = rid;
    if (lastPointerType === 'touch' || e.pointerType === 'touch') showTip(rid, g.ownerSVGElement, e.clientX, e.clientY);
    bus.emit('select', { id: REGIONS[rid].nerve, source: SRC, region: rid });
  };
  const onPointerDown = (e) => { lastPointerType = e.pointerType || 'mouse'; };

  stage.addEventListener('pointerover', onPointerOver);
  stage.addEventListener('pointermove', onPointerMove);
  stage.addEventListener('pointerout', onPointerOut);
  stage.addEventListener('pointerdown', onPointerDown);
  stage.addEventListener('click', onStageClick);

  // Panel: list rows and nerve links (keyboard-accessible equivalent of the figure).
  let panelDown = { type: 'mouse', at: -1e9 };
  panel.addEventListener('pointerdown', (e) => { panelDown = { type: e.pointerType || 'mouse', at: performance.now() }; });
  const onPanelOver = (e) => {
    // Touch: a tap selects; it must not leave a hover behind (no pointerleave follows).
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (e.type === 'focusin' && panelDown.type !== 'mouse' && performance.now() - panelDown.at < 800) return;
    const r = e.target.closest('.cv-row, .cv-linkbtn');
    if (!r) return;
    if (r.dataset.region) setLocal(r.dataset.region);
    else bus.emit('hover', { id: r.dataset.nerve, source: SRC, region: null });
  };
  const onPanelOut = (e) => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const r = e.target.closest('.cv-row, .cv-linkbtn');
    if (!r || r.contains(e.relatedTarget)) return;
    if (r.dataset.region) setLocal(null);
    else bus.emit('hover', { id: null, source: SRC, region: null });
  };
  const onPanelClick = (e) => {
    const r = e.target.closest('.cv-row, .cv-linkbtn');
    if (!r) return;
    state.pinnedRegion = r.dataset.region || null;
    bus.emit('select', { id: r.dataset.nerve, source: SRC, region: r.dataset.region || null });
  };
  panel.addEventListener('pointerover', onPanelOver);
  panel.addEventListener('pointerout', onPanelOut);
  panel.addEventListener('focusin', onPanelOver);
  panel.addEventListener('focusout', onPanelOut);
  panel.addEventListener('click', onPanelClick);

  // Tabs and chips.
  const setMode = (m) => {
    if (!MODES.some((x) => x.id === m) || m === state.mode) return;
    if (m !== 'compare') state.compareLayer = m;
    state.mode = m;
    state.localRegion = null;
    renderStage();
    applyAll();
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('.cv-tab'); if (b) setMode(b.dataset.mode); });
  tabs.addEventListener('keydown', (e) => {
    const i = tabBtns.findIndex((b) => b.dataset.mode === state.mode);
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % tabBtns.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + tabBtns.length) % tabBtns.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabBtns.length - 1;
    if (j == null) return;
    e.preventDefault();
    setMode(tabBtns[j].dataset.mode);
    tabBtns[j].focus();
  });
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('.cv-chip');
    if (c) bus.emit('block', { id: c.dataset.block || null, source: SRC });
  });

  // ---- bus ----------------------------------------------------------------------
  const offs = [];
  if (bus?.on) {
    offs.push(bus.on('block', (p) => {
      const id = p?.id && BLOCKS[p.id] ? p.id : null;
      if (id === state.block) return;
      state.block = id;
      applyAll();
    }));
    offs.push(bus.on('select', (p) => {
      state.selected = p?.id ?? null;
      if (p?.source !== SRC) state.pinnedRegion = null;
      else if (p?.region) state.pinnedRegion = p.region;
      renderInfo();
      applyHighlight();
    }));
    offs.push(bus.on('hover', (p) => {
      state.hovered = p?.id ?? null;
      if (p?.source !== SRC) state.localRegion = null;
      renderInfo();
      applyHighlight();
    }));
  }

  // ---- responsive -------------------------------------------------------------------
  const ro = new ResizeObserver((entries) => {
    const w = entries[0]?.contentRect?.width || root.clientWidth;
    root.dataset.size = w >= 760 ? 'wide' : w >= 480 ? 'mid' : 'narrow';
  });
  ro.observe(root);

  renderStage();
  applyAll();

  return {
    setMode,
    destroy() {
      offs.forEach((f) => { try { f(); } catch { /* ignore */ } });
      ro.disconnect();
      root.remove();
    },
  };
}
