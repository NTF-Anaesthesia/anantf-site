// Brachial plexus teaching app: 3D viewer module.
// Author: Dr Koh Wenjun, NTF Anaesthesia. Educational use only.
//
// Two model sources:
//   (A) GLB  - model/brachial-plexus-v3.glb (if present), materials assigned by name.
//   (B) Schematic - a procedural, anatomically plausible right brachial plexus built
//       from data.js topology (always available; default when there is no GLB).
//
// Coordinate frame of the schematic (units = cm, arm abducted 90 degrees with the
// palm facing forward):
//   +x = lateral (towards the arm), +y = superior (cephalad), +z = anterior.
// Written out in a right-handed frame these numbers describe a LEFT plexus (as does
// the Blender V3 model). Both models therefore sit inside a "world" group mirrored
// in x (scale.x = -1), so what is drawn is a RIGHT plexus, matching the ultrasound
// scenes and coverage maps. All coordinates in this file (anatomy, block geometry,
// camera views) are in the unmirrored model frame; flyTo() converts camera views.
//
// API: export function mount(containerEl, bus, options?) -> { destroy() }
// Bus events used: 'select' {id, source}, 'hover' {id, source}, 'block' {id, source}
// Optional: listens to 'layers' {…} (keys: collateral, related, bones, vessels,
// muscles, labels: 'all'|'levels'|'off', colour: 'cord'|'level'|'classic').

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  ELEMENTS, ELEMENT_ORDER, LEVELS, BLOCKS, getPathway, blockStatus,
} from './data.js';
import { colourFor, CORD_COLOURS } from './diagram.js';

const SOURCE = 'viewer3d';

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

/**
 * Maps GLB mesh names (Blender object names, also checked against parent names and
 * material names) to element ids. First match wins, so keep specific patterns first.
 * Edit this once the V3 model's object names are known (see model/model-report.md).
 * Separators in Blender names vary (space, _, ., -), hence the [\s_.-]* runs.
 */
const S = '[\\s_.\\-]*';
const rx = (src) => new RegExp(src, 'i');
export const MODEL_MAP = [
  { test: rx('phrenic'), ids: ['n-phrenic'] },
  { test: rx('intercosto'), ids: ['n-intercostobrachial'] },
  { test: rx(`supra${S}clav\\w*${S}n(erve)?s?(?![a-z])|cervical${S}plexus`), ids: ['n-supraclavicular-cx'] },
  { test: rx(`musculo${S}cut`), ids: ['n-musculocutaneous'] },
  { test: rx(`med(ial)?${S}cut\\w*${S}(n(erve)?${S})?(of${S})?(the${S})?fore${S}arm|mcnf|antebrach`), ids: ['n-mcn-forearm'] },
  { test: rx(`med(ial)?${S}cut\\w*${S}(n(erve)?${S})?(of${S})?(the${S})?arm|mcna|brachial${S}cut`), ids: ['n-mcn-arm'] },
  { test: rx(`dorsal${S}scap`), ids: ['n-dorsal-scapular'] },
  { test: rx(`long${S}thor`), ids: ['n-long-thoracic'] },
  { test: rx('suprascap'), ids: ['n-suprascapular'] },
  { test: rx('subclavius'), ids: ['n-subclavius'] },
  { test: rx(`lat(eral)?${S}pect`), ids: ['n-lat-pectoral'] },
  { test: rx(`med(ial)?${S}pect`), ids: ['n-med-pectoral'] },
  { test: rx(`(upper|sup(erior)?)${S}subscap`), ids: ['n-upper-subscap'] },
  { test: rx(`(lower|inf(erior)?)${S}subscap`), ids: ['n-lower-subscap'] },
  { test: rx(`thoraco${S}dors`), ids: ['n-thoracodorsal'] },
  { test: rx('median'), ids: ['n-median'] },
  { test: rx('ulnar'), ids: ['n-ulnar'] },
  { test: rx('radial'), ids: ['n-radial'] },
  { test: rx('axillary'), ids: ['n-axillary'] },
  { test: rx(`lat(eral)?${S}cord`), ids: ['cord-lat'] },
  { test: rx(`post(erior)?${S}cord`), ids: ['cord-post'] },
  { test: rx(`med(ial)?${S}cord`), ids: ['cord-med'] },
  { test: rx(`(sup(erior)?|upper)${S}(trunk)?${S}ant(erior)?${S}div|ant(erior)?${S}div\\w*${S}(of${S})?(the${S})?(sup(erior)?|upper)`), ids: ['div-sup-ant'] },
  { test: rx(`(sup(erior)?|upper)${S}(trunk)?${S}post(erior)?${S}div|post(erior)?${S}div\\w*${S}(of${S})?(the${S})?(sup(erior)?|upper)`), ids: ['div-sup-post'] },
  { test: rx(`mid(dle)?${S}(trunk)?${S}ant(erior)?${S}div|ant(erior)?${S}div\\w*${S}(of${S})?(the${S})?mid`), ids: ['div-mid-ant'] },
  { test: rx(`mid(dle)?${S}(trunk)?${S}post(erior)?${S}div|post(erior)?${S}div\\w*${S}(of${S})?(the${S})?mid`), ids: ['div-mid-post'] },
  { test: rx(`(inf(erior)?|lower)${S}(trunk)?${S}ant(erior)?${S}div|ant(erior)?${S}div\\w*${S}(of${S})?(the${S})?(inf(erior)?|lower)`), ids: ['div-inf-ant'] },
  { test: rx(`(inf(erior)?|lower)${S}(trunk)?${S}post(erior)?${S}div|post(erior)?${S}div\\w*${S}(of${S})?(the${S})?(inf(erior)?|lower)`), ids: ['div-inf-post'] },
  { test: rx(`(sup(erior)?|upper)${S}trunk`), ids: ['trunk-sup'] },
  { test: rx(`mid(dle)?${S}trunk`), ids: ['trunk-mid'] },
  { test: rx(`(inf(erior)?|lower)${S}trunk`), ids: ['trunk-inf'] },
  { test: rx('(^|[^a-z0-9])c5([^0-9]|$)'), ids: ['root-c5'] },
  { test: rx('(^|[^a-z0-9])c6([^0-9]|$)'), ids: ['root-c6'] },
  { test: rx('(^|[^a-z0-9])c7([^0-9]|$)'), ids: ['root-c7'] },
  { test: rx('(^|[^a-z0-9])c8([^0-9]|$)'), ids: ['root-c8'] },
  { test: rx('(^|[^a-z0-9])t1([^0-9]|$)'), ids: ['root-t1'] },
];

/** Name heuristics for GLB material categories (checked in this order). */
export const MODEL_CATEGORIES = [
  { cat: 'nerve', test: /nerve/i }, // first, so e.g. "Lateral_pectoral_nerve" is not read as a muscle
  { cat: 'artery', test: /arter|aorta|carotid|(^|[^a-z])a\.|subclavian[\s_.-]*a([^a-z]|$)|axillary[\s_.-]*a([^a-z]|$)|brachial[\s_.-]*a([^a-z]|$)/i },
  { cat: 'vein', test: /vein|vena|jugular|cephalic|basilic|(^|[^a-z])v\./i },
  { cat: 'muscle', test: /muscle|scalen|pector|biceps|triceps|deltoid|sterno[\s_.-]*cleido|mastoid|(^|[^a-z])scm([^a-z]|$)|coracobrach|subscapularis|teres|serratus|latissimus|trapez|omohyoid|brachialis|supraspinatus|infraspinatus|levator/i },
  { cat: 'nerve', test: /nerve|plexus|(^|[^a-z])n\./i },
  { cat: 'bone', test: /bone|clavic|(^|[^a-z])ribs?([^a-z]|$)|humer|scapul|vertebr|coracoid|acromion|stern|manubri|radius|ulna(?!r)|skull|spine|skeleton|glenoid/i },
  { cat: 'skin', test: /skin|body|fascia|fat|subcut/i },
  { cat: 'nerve', test: /root|trunk|cord|div|ramus|median|ulnar|radial|musculo|axillary|suprascap|thoracic|pectoral|(^|[^a-z0-9])(c[5-8]|t1)([^0-9]|$)/i },
];

/** Colours used for block status (shared with the legend). */
export const STATUS_COLORS = {
  target: '#db2777',
  covers: '#16a34a',
  variable: '#f59e0b',
  spares: '#94a3b8',
  none: '#cbd5e1',
};

const CLASSIC_NERVE = '#e8b923';
const RELATED_COLOR = '#6b7280';
const LEVEL_COLOR = Object.fromEntries(LEVELS.map((l) => [l.id, l.color]));

// ---------------------------------------------------------------------------
// Schematic anatomy (cm, see frame above)
// ---------------------------------------------------------------------------
const J = {
  Js: [4.8, 6.0, -0.1], Jm: [5.0, 4.6, -0.3], Ji: [4.8, 2.8, -0.6],
  Ts: [7.3, 3.1, -0.2], Tm: [7.5, 2.4, -0.4], Ti: [7.6, 1.9, -0.8],
  Jlat: [9.6, 1.1, 0.3], Jpost: [9.6, 0.25, -0.85], Jmed: [9.6, -0.6, 0.0],
  Clat: [12.4, -0.3, 0.45], Cpost: [12.4, -1.15, -0.85], Cmed: [12.4, -1.95, 0.05],
  M0: [13.8, -1.9, 0.75],
};

// Each element: paths (first = main; label sits on it), radius.
// A path point may be {on: elementId, t} to start exactly on another nerve.
const NERVES = {
  'root-c5': { r: 0.24, paths: [[[2.2, 9.2, -0.6], [3.3, 8.6, -0.25], [4.2, 7.2, -0.1], J.Js]] },
  'root-c6': { r: 0.25, paths: [[[2.2, 7.4, -0.6], [3.5, 7.0, -0.25], J.Js]] },
  'root-c7': { r: 0.25, paths: [[[2.2, 5.6, -0.7], [3.5, 5.2, -0.4], J.Jm]] },
  'root-c8': { r: 0.24, paths: [[[2.0, 3.8, -0.9], [3.4, 3.4, -0.8], J.Ji]] },
  'root-t1': { r: 0.22, paths: [[[1.8, 2.0, -1.1], [3.0, 2.3, -1.0], J.Ji]] },

  'trunk-sup': { r: 0.31, paths: [[J.Js, [6.2, 3.9, -0.2], J.Ts]] },
  'trunk-mid': { r: 0.28, paths: [[J.Jm, [6.5, 2.9, -0.4], J.Tm]] },
  'trunk-inf': { r: 0.29, paths: [[J.Ji, [6.5, 2.15, -0.85], J.Ti]] },

  'div-sup-ant': { r: 0.21, paths: [[J.Ts, [8.5, 2.1, 0.25], J.Jlat]] },
  'div-sup-post': { r: 0.2, paths: [[J.Ts, [8.4, 2.4, -0.8], J.Jpost]] },
  'div-mid-ant': { r: 0.19, paths: [[J.Tm, [8.5, 1.85, -0.05], J.Jlat]] },
  'div-mid-post': { r: 0.19, paths: [[J.Tm, [8.5, 1.4, -0.95], J.Jpost]] },
  'div-inf-ant': { r: 0.21, paths: [[J.Ti, [8.6, 0.45, -0.5], J.Jmed]] },
  'div-inf-post': { r: 0.17, paths: [[J.Ti, [8.5, 0.9, -1.05], J.Jpost]] },

  'cord-lat': { r: 0.27, paths: [[J.Jlat, [11.0, 0.95, 0.55], J.Clat]] },
  'cord-post': { r: 0.29, paths: [[J.Jpost, [11.0, -0.45, -0.85], J.Cpost]] },
  'cord-med': { r: 0.26, paths: [[J.Jmed, [11.0, -1.35, 0.05], J.Cmed]] },

  'n-musculocutaneous': { r: 0.19, paths: [[J.Clat, [13.6, -0.2, 1.2], [15, -0.3, 1.55], [18, 0.0, 1.65], [26, -0.1, 2.0], [33, 0.6, 2.4], [37, 1.3, 1.8]]] },
  'n-axillary': { r: 0.2, paths: [[J.Cpost, [13.4, -1.45, -1.55], [14.0, -0.9, -2.25], [14.3, 0.5, -2.35], [14.4, 1.6, -1.5], [14.3, 2.0, -0.3]]] },
  'n-radial': { r: 0.23, paths: [[J.Cpost, [13.6, -1.15, -1.0], [15, -1.0, -1.0], [18, -0.85, -1.75], [22, 0.15, -1.75], [25, 0.95, -1.0], [30, 1.2, 0.1], [34, 1.0, 0.6], [37, 0.8, 0.8]]] },
  'n-median': {
    r: 0.23,
    paths: [
      [J.M0, [15, -2.4, 0.6], [18, -2.3, 0.8], [25, -1.9, 1.1], [32, -1.55, 1.5], [37, -1.2, 1.5]],
      [J.Clat, [13.2, -1.0, 0.8], J.M0],
      [J.Cmed, [13.1, -2.15, 0.5], J.M0],
    ],
  },
  'n-ulnar': { r: 0.22, paths: [[J.Cmed, [15, -2.35, -0.55], [22, -2.2, -0.9], [30, -1.8, -1.2], [34, -1.45, -1.4], [37, -1.2, -0.9]]] },

  'n-dorsal-scapular': { r: 0.1, paths: [[{ on: 'root-c5', t: 0.12 }, [3.2, 8.4, -1.6], [3.6, 6.5, -3.4], [4.2, 3.2, -4.6]]] },
  'n-long-thoracic': {
    r: 0.11,
    paths: [
      [[3.3, 7.4, -1.5], [3.5, 5.3, -1.75], [4.6, 2.7, -2.6], [6.5, -1.5, -2.6], [8.2, -6.5, -1.8]],
      [{ on: 'root-c5', t: 0.22 }, [3.25, 8.0, -1.2], [3.3, 7.4, -1.5]],
      [{ on: 'root-c6', t: 0.18 }, [3.1, 7.3, -1.0], [3.3, 7.4, -1.5]],
      [{ on: 'root-c7', t: 0.25 }, [3.25, 5.4, -1.2], [3.5, 5.3, -1.75]],
    ],
  },
  'n-suprascapular': { r: 0.13, paths: [[{ on: 'trunk-sup', t: 0.4 }, [7.2, 4.6, -1.4], [9.5, 3.3, -2.8], [10.8, 2.5, -3.3]]] },
  'n-subclavius': { r: 0.07, paths: [[{ on: 'trunk-sup', t: 0.75 }, [7.4, 3.2, 0.6], [7.8, 2.5, 1.15]]] },
  'n-lat-pectoral': { r: 0.1, paths: [[{ on: 'cord-lat', t: 0.3 }, [10.4, 1.0, 1.4], [10.4, 0.9, 2.8]]] },
  'n-med-pectoral': { r: 0.1, paths: [[{ on: 'cord-med', t: 0.45 }, [11.3, -1.9, 1.0], [11.0, -1.6, 2.1]]] },
  'n-upper-subscap': { r: 0.09, paths: [[{ on: 'cord-post', t: 0.25 }, [10.3, 0.0, -1.9], [10.8, 0.3, -2.8]]] },
  'n-thoracodorsal': { r: 0.11, paths: [[{ on: 'cord-post', t: 0.55 }, [11.1, -1.6, -1.8], [11.4, -4.5, -2.4], [11.8, -7.5, -2.2]]] },
  'n-lower-subscap': { r: 0.09, paths: [[{ on: 'cord-post', t: 0.85 }, [12.3, -2.0, -1.8], [12.7, -2.8, -2.5]]] },
  'n-mcn-arm': { r: 0.08, paths: [[{ on: 'cord-med', t: 0.75 }, [13.8, -2.75, 0.0], [17, -3.15, -0.2], [21, -3.3, -0.1]]] },
  'n-mcn-forearm': { r: 0.1, paths: [[{ on: 'cord-med', t: 0.95 }, [14.5, -2.95, 0.55], [20, -3.1, 0.8], [28, -2.8, 1.0], [36, -2.2, 1.1]]] },

  'n-phrenic': {
    r: 0.1,
    paths: [
      [[2.8, 12.6, 0.6], [3.5, 10.5, 1.55], [3.6, 8.0, 1.75], [3.0, 5.0, 1.8], [2.2, 2.0, 1.9], [1.4, -2.0, 2.4]],
      [{ on: 'root-c5', t: 0.4 }, [4.4, 8.7, 0.6], [3.55, 8.9, 1.72]],
    ],
  },
  'n-intercostobrachial': { r: 0.08, paths: [[[8.0, -4.5, 0.4], [11, -3.5, 0.3], [15, -3.25, 0.1], [20, -3.5, 0.0]]] },
  'n-supraclavicular-cx': {
    r: 0.07,
    paths: [
      [[5.6, 9.6, 0.2], [6.8, 5.0, 2.0], [7.6, 2.3, 2.6]],
      [[5.6, 9.6, 0.2], [5.0, 5.0, 2.6], [3.6, 1.6, 4.3]],
      [[5.6, 9.6, 0.2], [8.6, 6.0, 0.0], [12.0, 2.7, -0.9]],
    ],
  },
};

const VESSELS = {
  artery: {
    label: 'Subclavian → axillary artery',
    r: 0.42,
    pts: [[1.2, -1.5, 2.2], [2.6, 0.6, 1.3], [4.6, 1.95, 0.7], [6.7, 2.1, 0.45], [8.2, 1.3, 0.45], [10.0, 0.0, 0.3], [12.4, -1.1, 0.1], [15, -1.75, 0.0], [20, -1.9, 0.3], [27, -1.6, 0.6], [33, -1.0, 1.0], [37, -0.6, 1.2]],
  },
  vein: {
    label: 'Subclavian → axillary vein',
    r: 0.48,
    pts: [[1.4, -1.2, 3.4], [3.8, 0.9, 2.6], [6.2, 1.75, 2.1], [8.5, 0.6, 1.5], [10.4, -0.9, 1.0], [12.8, -2.2, 0.4], [15, -2.7, -1.35], [22, -3.0, -0.9], [30, -2.7, -0.4]],
  },
};

// Muscle slabs: from a to b, half width, half thickness, approximate thickness normal.
const MUSCLES = [
  { key: 'asm', label: 'Anterior scalene', a: [3.0, 11.2, 0.9], b: [6.5, 1.55, 1.25], w: 0.7, t: 0.4, n: [0, 0, 1] },
  { key: 'msm', label: 'Middle scalene', a: [3.1, 11.6, -1.7], b: [6.2, 1.7, -1.9], w: 0.9, t: 0.5, n: [0, 0, 1] },
  { key: 'scm', label: 'Sternocleidomastoid', a: [5.4, 13.5, -0.6], b: [3.6, 1.0, 4.4], w: 1.0, t: 0.3, n: [0.6, 0, 0.8], faint: true },
  { key: 'pmin', label: 'Pectoralis minor', a: [11.4, 0.4, 1.6], b: [8.0, -5.0, 3.4], w: 1.2, t: 0.3, n: [0, 0, 1] },
  { key: 'pmaj', label: 'Pectoralis major', a: [4.5, -2.0, 4.8], b: [14.0, 0.3, 1.8], w: 3.0, t: 0.35, n: [0.25, 0, 1], faint: true },
  { key: 'cb', label: 'Coracobrachialis', a: [11.4, 0.4, 1.6], b: [22, -0.6, 0.3], w: 0.6, t: 0.5, n: [0, 1, 0] },
  { key: 'biceps', label: 'Biceps', a: [13.5, 0.9, 0.8], b: [34, 0.3, 1.6], w: 0.95, t: 0.85, n: [0, 0, 1], faint: true },
  { key: 'triceps', label: 'Triceps', a: [14.0, 0.2, -2.2], b: [33, 0.2, -2.0], w: 1.1, t: 0.8, n: [0, 0, 1], faint: true },
];

// Block geometry (schematic coordinates).
// probe: P = centre of footprint on the skin, A = long axis, toward = point the beam aims at.
// needleFrom: +1/-1 = which end of the probe (along A) the needle enters from.
// deposits: needle-tip targets in order, each with local anaesthetic blobs.
export const BLOCK_GEOM = {
  interscalene: {
    // Needle paths are checked with needleReport(): every pass clears nerves, vessels
    // and bone, and the tip sits between the C5 and C6 roots (dev/ harness).
    P: [6.6, 7.15, 0.4], A: [0, 0, 1], toward: [3.8, 7.15, -0.2], needleFrom: -1, needleLen: 5, entryLift: 1.0,
    probeLabel: 'Linear probe, transverse at C6', probeShort: 'Probe',
    deposits: [
      { tip: [3.9, 7.15, -0.4], blobs: [{ c: [3.9, 7.15, -0.35], r: 0.5, s: [1, 1.6, 1.1] }, { c: [4.25, 7.0, -0.1], r: 0.4 }] },
    ],
    camera: { pos: [10, 16, 18], target: [4.6, 6.8, -0.2] },
    glb: {
      P: [8.6, 8.6, 3.1], A: [0, 0, 1], toward: [5.5, 8.6, 3.0], needleFrom: -1, entryLift: 0.1,
      deposits: [
        { tip: [6.45, 8.6, 3.0], blobs: [{ c: [6.45, 8.6, 3.0], r: 0.45, s: [1, 1.5, 1.1] }, { c: [6.1, 8.5, 3.3], r: 0.38 }, { c: [6.9, 8.7, 3.2], r: 0.34 }] },
      ],
      camera: { pos: [10.2, 15.5, 17], target: [6.2, 8.5, 3.0] },
    },
    steps: [
      'Probe transverse across the neck at C6: C5 and C6 roots lie between the anterior and middle scalene.',
      'Needle in-plane, posterior to anterior (lateral to medial), through or behind the middle scalene.',
      'Inject between C5 and C6 so local anaesthetic surrounds both roots. Phrenic nerve on the anterior scalene is close by.',
    ],
  },
  supraclavicular: {
    P: [6.75, 4.6, 1.7], A: [1, 0.1, -0.1], toward: [6.75, 2.1, -0.2], needleFrom: 1, needleLen: 8, entryLift: 0.1,
    probeLabel: 'Linear probe in the supraclavicular fossa, parallel to the clavicle', probeShort: 'Probe',
    deposits: [
      // Corner pocket: lateral to the artery, above the first rib, below the inferior trunk.
      { tip: [6.32, 1.77, -0.38], blobs: [{ c: [6.32, 1.8, -0.38], r: 0.42 }] },
      // Superficial to the superior trunk / divisions, then around the plexus.
      { tip: [7.29, 2.66, 0.13], blobs: [{ c: [7.3, 2.7, 0.15], r: 0.6, s: [1.1, 0.9, 1] }, { c: [7.7, 2.3, -0.25], r: 0.55 }] },
    ],
    camera: { pos: [13, 16, 15], target: [7.0, 2.4, 0.2] },
    glb: {
      P: [9, 6.55, 4], A: [0.87, 0.12, -0.47], toward: [9, 3.75, 4], needleFrom: 1, entryLift: 0.1,
      deposits: [
        { tip: [8.86, 3.71, 4.08], blobs: [{ c: [8.86, 3.72, 4.08], r: 0.4 }] },
        { tip: [9.21, 4.61, 3.89], blobs: [{ c: [9.2, 4.65, 3.7], r: 0.55 }, { c: [9.6, 4.9, 2.9], r: 0.5 }, { c: [10.0, 4.3, 2.5], r: 0.45 }] },
      ],
      camera: { pos: [15, 16, 18], target: [9.2, 4.0, 3.6] },
    },
    steps: [
      'Probe parallel to the clavicle in the supraclavicular fossa: trunks and divisions lie lateral to the subclavian artery, on the first rib.',
      'Needle in-plane, lateral to medial, toward the "corner pocket" (artery, first rib and plexus).',
      'First injection in the corner pocket to reach the inferior trunk.',
      'Redirect and deposit above and around the plexus so it is surrounded.',
    ],
  },
  infraclavicular: {
    P: [10.8, -0.8, 3.3], A: [0, 1, 0], toward: [10.8, -0.8, -0.4], needleFrom: 1, needleLen: 10, entryLift: 0.1,
    probeLabel: 'Linear probe parasagittal, medial to the coracoid', probeShort: 'Probe',
    deposits: [
      {
        // Steep pass from cephalad, deep to the lateral cord, to 6 o'clock behind the artery.
        tip: [10.8, -0.1, -0.5],
        blobs: [
          { c: [10.8, -0.15, -0.55], r: 0.4 },
          { c: [10.8, -0.65, -0.45], r: 0.38 },
          { c: [10.8, 0.35, -0.35], r: 0.36 },
          { c: [10.8, -1.05, -0.05], r: 0.34 },
          { c: [10.8, 0.65, 0.1], r: 0.32 },
        ],
      },
    ],
    camera: { pos: [2, 3.5, 17], target: [10.8, -0.3, 0.5] },
    glb: {
      P: [16, -1.3, 7], A: [0, 1, 0], toward: [16, -1.3, 2.5], needleFrom: 1, entryLift: 0.1,
      deposits: [
        {
          tip: [16, -0.3, 2.4],
          blobs: [
            { c: [16, -0.35, 2.5], r: 0.42 }, { c: [16, -0.6, 3.1], r: 0.42 }, { c: [16, 0.1, 3.0], r: 0.38 },
            { c: [16, -1.2, 3.0], r: 0.38 }, { c: [16, -1.6, 3.6], r: 0.34 },
          ],
        },
      ],
      camera: { pos: [7.5, 3, 20], target: [16, -0.8, 3.5] },
    },
    steps: [
      'Probe parasagittal, medial to the coracoid: axillary artery in cross-section deep to pectoralis major and minor, cords around it.',
      'Needle in-plane, cephalad to caudad, aiming posterior to the artery (6 o’clock) toward the posterior cord.',
      'Deposit between the posterior cord and the artery: look for U-shaped spread around the artery (lateral, posterior and medial cords).',
    ],
  },
  axillary: {
    P: [15, -3.75, 0.3], A: [0, 0, 1], toward: [15, -1.5, 0.3], needleFrom: 1, needleLen: 5,
    probeLabel: 'Linear probe transverse across the proximal arm, in the axilla', probeShort: 'Probe',
    entryLift: 0.6,
    deposits: [
      // Each deposit has its own pass ("lift" = how flat the needle is), so no pass
      // crosses the artery or a nerve.
      { tip: [15, -0.95, -0.6], lift: 1.8, blobs: [{ c: [15, -0.95, -0.65], r: 0.45 }] },
      { tip: [15, -2.6, -0.25], lift: 0.6, blobs: [{ c: [15, -2.6, -0.25], r: 0.45 }, { c: [15, -2.45, 0.45], r: 0.35 }] },
      { tip: [15, -0.45, 1.1], lift: 0.1, blobs: [{ c: [15, -0.4, 1.2], r: 0.42 }] },
    ],
    camera: { pos: [6, -10, 11], target: [15, -1.5, 0.3] },
    glb: {
      // On the Blender model the radial nerve lies posterior to the artery at the same
      // depth, so it is reached from the posterior end of the probe (a second pass).
      P: [22.5, -3.6, 3], A: [0, 0, 1], toward: [22.5, -1, 3], needleFrom: 1, entryLift: 0.6,
      deposits: [
        { tip: [22.5, -1.8, 2.4], from: -1, lift: 0.1, blobs: [{ c: [22.5, -1.8, 2.3], r: 0.42 }] },
        { tip: [22.5, -1.3, 3.5], from: 1, lift: 2.4, blobs: [{ c: [22.5, -1.3, 3.55], r: 0.42 }, { c: [22.5, -1.75, 3.2], r: 0.34 }] },
        { tip: [22.5, 0.3, 3.9], from: 1, lift: 1.8, blobs: [{ c: [22.5, 0.35, 3.95], r: 0.4 }] },
      ],
      camera: { pos: [15, -11, 14], target: [22.5, -1.2, 3.0] },
      steps: [
        'Probe transverse across the proximal arm in the axilla: axillary artery with median, ulnar and radial nerves around it; musculocutaneous between biceps and coracobrachialis.',
        'Needle in-plane. First pass from the posterior end of the probe.',
        'Deposit posterior to the artery for the radial nerve.',
        'Second pass from the anterior end: deposit beside the artery around the median and ulnar nerves.',
        'Separate injection around the musculocutaneous nerve.',
      ],
    },
    steps: [
      'Probe transverse across the proximal arm in the axilla: axillary artery with median, ulnar and radial nerves around it; musculocutaneous in coracobrachialis.',
      'Needle in-plane, anterior to posterior.',
      'Deposit deep (posterior) to the artery for the radial nerve.',
      'Redirect superficially around the median and ulnar nerves.',
      'Separate injection around the musculocutaneous nerve in the coracobrachialis plane.',
    ],
  },
};

// Centroid of the C5 root in the Blender model as placed by setupGLB (model frame).
// The Blender block geometry above was fitted to this; see setupGLB.
const GLB_REF = { c5: [5.72, 9.57, 3.14] };

const LA_SCALE = 1.45; // visual exaggeration of local anaesthetic spread

const DEFAULT_VIEW = { pos: [12.5, 7, 29], target: [10, 2.6, 0] };

const LEVEL_LABELS = [
  { id: 'root', text: 'Roots', at: [2.4, 11.0, -0.5] },
  { id: 'trunk', text: 'Trunks', at: [6.3, 5.3, 0.2] },
  { id: 'division', text: 'Divisions', at: [8.6, 3.5, -0.6] },
  { id: 'cord', text: 'Cords', at: [11.3, 1.6, -0.6] },
  { id: 'terminal', text: 'Branches', at: [17.5, 1.7, 0.4] },
];

const STRUCT_LABELS = [
  { group: 'muscles', text: 'Anterior scalene', at: [4.9, 9.4, 1.6], blocks: ['interscalene'] },
  { group: 'muscles', text: 'Middle scalene', at: [3.6, 10.2, -2.3], blocks: ['interscalene'] },
  { group: 'muscles', text: 'Sternocleidomastoid', at: [5.2, 11.8, 0.4], blocks: ['interscalene'], only: true },
  { group: 'muscles', text: 'Pectoralis minor', at: [9.0, -3.3, 3.2], blocks: ['infraclavicular'] },
  { group: 'muscles', text: 'Pectoralis major', at: [7.0, -2.6, 4.6], blocks: ['infraclavicular'], only: true },
  { group: 'muscles', text: 'Coracobrachialis', at: [19, -0.4, 1.0], blocks: ['axillary'] },
  { group: 'muscles', text: 'Biceps', at: [21, 1.6, 1.4], blocks: ['axillary'], only: true },
  { group: 'bones', text: 'First rib', at: [6.3, 0.8, 1.9], blocks: ['supraclavicular'] },
  { group: 'bones', text: 'Clavicle', at: [10.2, 2.3, 0.9], blocks: ['supraclavicular', 'infraclavicular'] },
  { group: 'bones', text: 'Coracoid', at: [11.9, 0.9, 1.9], blocks: ['infraclavicular'] },
  { group: 'bones', text: 'Humerus', at: [27, 0.7, -1.0], blocks: ['axillary'] },
  { group: 'bones', text: 'C6', at: [-0.2, 6.5, 0.0], blocks: ['interscalene'] },
  { group: 'vessels', text: 'Subclavian artery', at: [4.0, 2.4, 0.7], blocks: ['supraclavicular'] },
  { group: 'vessels', text: 'Axillary artery', at: [17, -2.2, 0.3], blocks: ['infraclavicular', 'axillary'] },
  { group: 'vessels', text: 'Axillary vein', at: [21, -3.5, -0.9], blocks: ['infraclavicular', 'axillary'] },
];

const ICONS = {
  reset: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  labels: '<path d="M3 12V4h8l10 10-8 8L3 12Z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  play: '<path d="M7 4.5v15l12-7.5-12-7.5Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
  cube: '<path d="m12 2.5 8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3L12 2.5Z"/><path d="M12 12v9.5M12 12l8.5-4.7M12 12 3.5 7.3"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function quatFromBasis(x, y) {
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  return new THREE.Quaternion().setFromRotationMatrix(m);
}

function el(tag, attrs = {}, html) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  if (html != null) e.innerHTML = html;
  return e;
}

function icon(name) {
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

function lighten(hex, amt) {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#ffffff'), amt);
  return '#' + c.getHexString();
}

function noisyBlobGeometry() {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 1 + 0.08 * Math.sin(v.x * 4.1 + v.y * 2.3) + 0.06 * Math.sin(v.y * 5.3 - v.z * 3.7) + 0.05 * Math.cos(v.z * 6.1 + v.x * 1.7);
    v.multiplyScalar(n);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------
// mount
// ---------------------------------------------------------------------------
export function mount(containerEl, bus, options = {}) {
  const opts = {
    glbUrl: 'model/brachial-plexus-v3.glb',
    // Optional companion file: the same plexus as separately named nerve segments
    // (same coordinate frame). When it loads, it replaces the single fused "Nerve"
    // mesh so each segment can be picked and coloured.
    splitUrl: 'model/brachial-plexus-v3-nerves-split.glb',
    dracoPath: new URL('../vendor/three/examples/jsm/libs/draco/gltf/', import.meta.url).href,
    ...options,
  };

  const reducedMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reducedMotion = reducedMotionMq.matches;
  const onRM = (e) => { reducedMotion = e.matches; };
  reducedMotionMq.addEventListener?.('change', onRM);

  const busState = bus?.state || {};
  const state = {
    selected: busState.selected ?? null,
    hovered: busState.hovered ?? null,
    block: null,
    mode: 'schematic', // 'schematic' | 'glb'
    layers: {
      collateral: true, related: true, bones: true, vessels: true, muscles: true,
      labels: 'levels', colour: 'cord', // 'cord' matches the plexus diagram
    },
  };

  let glbPreferred = true; // the Blender model is the default view once it loads

  // ------------------------------------------------------------------ DOM
  const root = el('div', { class: 'v3d', role: 'region', 'aria-label': '3D model of the right brachial plexus' });
  const stage = el('div', { class: 'v3d-stage' });
  const canvasHost = el('div', { class: 'v3d-canvas' });
  const labelHost = el('div', { class: 'v3d-labels' });
  const tooltip = el('div', { class: 'v3d-tooltip', 'aria-hidden': 'true' });
  const toolbar = el('div', { class: 'v3d-toolbar', role: 'toolbar', 'aria-label': '3D viewer controls' });
  const legend = el('div', { class: 'v3d-legend' });
  const chip = el('div', { class: 'v3d-chip', 'aria-live': 'polite' });
  const caption = el('div', { class: 'v3d-caption', 'aria-live': 'polite' });
  const toast = el('div', { class: 'v3d-toast', role: 'status' });
  const hint = el('p', { class: 'v3d-hint', id: `v3d-hint-${Math.random().toString(36).slice(2, 8)}` },
    'Drag to rotate, pinch or scroll to zoom, tap a nerve to select it. Keyboard: arrows rotate, + and − zoom, N and P step through nerves, Esc clears.');
  const panel = el('div', { class: 'v3d-panel', hidden: '' });
  const loading = el('div', { class: 'v3d-loading', hidden: '' }, 'Loading 3D model…');

  stage.append(canvasHost, labelHost, tooltip, legend, chip, caption, toast, loading);
  root.append(stage, toolbar, panel, hint);
  containerEl.appendChild(root);

  // Respond to small containers
  const setCompact = (w) => {
    const c = w < 560;
    if (root.classList.contains('is-compact') === c) return;
    root.classList.toggle('is-compact', c);
    labelHost.querySelectorAll('.v3d-label--probe').forEach((d) => { d.textContent = c ? d.dataset.short : d.dataset.full; });
  };

  // Toolbar buttons
  const mkBtn = (name, label, extra = {}) => {
    const b = el('button', { type: 'button', class: 'v3d-btn', 'aria-label': label, title: label, ...extra }, icon(name));
    toolbar.appendChild(b);
    return b;
  };
  const btnReset = mkBtn('reset', 'Reset view');
  const btnLabels = mkBtn('labels', 'Labels: Key');
  const btnPlay = mkBtn('play', 'Play needle and local anaesthetic animation', { disabled: '' });
  const btnLayers = mkBtn('layers', 'Show layers', { 'aria-expanded': 'false', 'aria-controls': '' });
  const btnModel = mkBtn('cube', 'Schematic model', { hidden: '', 'aria-pressed': 'true' });
  const btnLabelText = el('span', { class: 'v3d-btn-text' });
  btnLabels.appendChild(btnLabelText);

  // ------------------------------------------------------------------ three.js setup
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (err) {
    root.classList.add('is-nogl');
    stage.innerHTML = '<p class="v3d-nogl">3D view needs WebGL, which is not available in this browser. The diagram and ultrasound views still work.</p>';
    return { destroy() { root.remove(); } };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  canvasHost.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'application');
  canvas.setAttribute('aria-roledescription', '3D viewer');
  canvas.setAttribute('aria-label', '3D brachial plexus. Use arrow keys to rotate, N and P to step through nerves.');
  canvas.setAttribute('aria-describedby', hint.id);

  const labelRenderer = new CSS2DRenderer({ element: labelHost });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 600);
  camera.position.set(...DEFAULT_VIEW.pos);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.09;
  controls.minDistance = 4;
  controls.maxDistance = 120;
  controls.target.set(...DEFAULT_VIEW.target);
  controls.zoomSpeed = 0.9;
  controls.rotateSpeed = 0.8;
  controls.update();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f78, 1.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-18, 30, 26);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xdbe7ff, 0.55);
  fill.position.set(20, -8, -18);
  scene.add(fill);

  // Mirrored world: see the note on the coordinate frame at the top of the file.
  const world = new THREE.Group();
  world.name = 'world';
  world.scale.x = -1;
  scene.add(world);
  world.updateMatrixWorld(true);
  const toWorld = (a) => world.localToWorld(Array.isArray(a) ? V(a) : a.clone());
  const toModel = (v) => world.worldToLocal(v.clone());
  const schematic = new THREE.Group();
  schematic.name = 'schematic';
  world.add(schematic);
  const groups = {
    plexus: new THREE.Group(), collateral: new THREE.Group(), related: new THREE.Group(),
    bones: new THREE.Group(), vessels: new THREE.Group(), muscles: new THREE.Group(),
    levelLabels: new THREE.Group(), overlay: new THREE.Group(),
  };
  Object.values(groups).forEach((g) => schematic.add(g));
  world.add(groups.overlay); // probe, needle and local anaesthetic show on either model
  const pickGroup = new THREE.Group(); // invisible fat proxies for picking
  schematic.add(pickGroup);

  const disposables = new Set();
  const track = (o) => { disposables.add(o); return o; };

  // ------------------------------------------------------------------ build schematic
  const elementObjs = new Map(); // id -> { mesh, mat, curves, label, group, proxies }
  const curveCache = {};

  function resolvePoint(p) {
    if (Array.isArray(p)) return V(p);
    const c = curveCache[p.on];
    return c.getPointAt(p.t);
  }

  const materialFor = (color, extra = {}) => track(new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.05, ...extra }));

  // Build in an order so that {on:id} references already exist.
  const buildOrder = [...ELEMENT_ORDER].sort((a, b) => {
    const dep = (id) => (NERVES[id]?.paths.flat().some((pt) => pt && pt.on) ? 1 : 0);
    return dep(a) - dep(b);
  });

  const capGeo = track(new THREE.SphereGeometry(1, 16, 12));

  for (const id of buildOrder) {
    const spec = NERVES[id];
    const e = ELEMENTS[id];
    if (!spec || !e) continue;
    const curves = spec.paths.map((path) => new THREE.CatmullRomCurve3(path.map(resolvePoint), false, 'centripetal'));
    curveCache[id] = curves[0];
    const geos = [];
    const pickGeos = [];
    curves.forEach((c, i) => {
      const len = c.getLength();
      const segs = Math.max(16, Math.min(140, Math.round(len * 7)));
      const r = i === 0 ? spec.r : spec.r * 0.8;
      geos.push(new THREE.TubeGeometry(c, segs, r, 12, false));
      const pr = Math.max(r * 1.8, 0.32);
      pickGeos.push(new THREE.TubeGeometry(c, Math.max(8, Math.round(segs / 3)), pr, 6, false));
    });
    const geo = track(geos.length > 1 ? mergeGeometries(geos) : geos[0]);
    if (geos.length > 1) geos.forEach((g) => g.dispose());
    const mat = materialFor(CLASSIC_NERVE);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData.id = id;
    mesh.name = id;
    // end caps (hide the open tube ends)
    curves.forEach((c, i) => {
      const r = i === 0 ? spec.r : spec.r * 0.8;
      for (const t of [0, 1]) {
        const cap = new THREE.Mesh(capGeo, mat);
        cap.position.copy(c.getPointAt(t));
        cap.scale.setScalar(r * 1.02);
        cap.userData.id = id;
        mesh.add(cap);
      }
    });
    const pgeo = track(pickGeos.length > 1 ? mergeGeometries(pickGeos) : pickGeos[0]);
    if (pickGeos.length > 1) pickGeos.forEach((g) => g.dispose());
    const proxy = new THREE.Mesh(pgeo, track(new THREE.MeshBasicMaterial({ visible: false })));
    proxy.userData.id = id;
    pickGroup.add(proxy);

    const groupName = e.level === 'collateral' ? 'collateral' : e.level === 'related' ? 'related' : 'plexus';
    groups[groupName].add(mesh);

    // label
    const lab = el('div', { class: `v3d-label v3d-label--el v3d-label--${e.level}`, 'data-id': id, text: e.short });
    lab.addEventListener('click', (ev) => { ev.stopPropagation(); emitSelect(state.selected === id ? null : id); });
    lab.addEventListener('pointerenter', () => emitHover(id));
    lab.addEventListener('pointerleave', () => emitHover(null));
    const labObj = new CSS2DObject(lab);
    const lt = e.level === 'terminal' ? 0.45 : e.level === 'collateral' || e.level === 'related' ? 0.7 : 0.5;
    labObj.position.copy(curves[0].getPointAt(lt));
    labObj.center.set(0.5, 1.25);
    mesh.add(labObj);

    elementObjs.set(id, { mesh, mat, label: lab, labObj, group: groupName, proxy, curve: curves[0] });
  }

  // Bones
  const boneMat = materialFor('#e8dfcb', { roughness: 0.75 });
  const boneMatFaint = materialFor('#e8dfcb', { roughness: 0.75, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  const discMat = materialFor('#cbd5e1', { roughness: 0.8 });
  const addBone = (geo, mat = boneMat) => { const m = new THREE.Mesh(track(geo), mat); groups.bones.add(m); return m; };
  const boneTube = (pts, r, mat = boneMat) => {
    const c = new THREE.CatmullRomCurve3(pts.map(V), false, 'centripetal');
    const m = addBone(new THREE.TubeGeometry(c, 64, r, 12, false), mat);
    for (const t of [0, 1]) {
      const cap = new THREE.Mesh(capGeo, mat);
      cap.position.copy(c.getPointAt(t));
      cap.scale.setScalar(r);
      m.add(cap);
    }
    return m;
  };
  // Vertebrae C4-T2
  const vert = [['C4', 10.1], ['C5', 8.3], ['C6', 6.5], ['C7', 4.7], ['T1', 2.9], ['T2', 1.1]];
  const bodyGeo = track(new THREE.CylinderGeometry(0.95, 0.95, 1.2, 24));
  const tpGeo = track(new THREE.BoxGeometry(1.7, 0.42, 0.95));
  const spGeo = track(new THREE.BoxGeometry(0.45, 0.45, 2.1));
  const discGeo = track(new THREE.CylinderGeometry(0.9, 0.9, 0.5, 24));
  for (const [, y] of vert) {
    const b = new THREE.Mesh(bodyGeo, boneMat); b.position.set(0, y, -1.2); groups.bones.add(b);
    for (const s of [1, -1]) {
      const tp = new THREE.Mesh(tpGeo, boneMat); tp.position.set(1.45 * s, y + 0.1, -1.35); groups.bones.add(tp);
    }
    const sp = new THREE.Mesh(spGeo, boneMat); sp.position.set(0, y - 0.35, -3.1); sp.rotation.x = -0.35; groups.bones.add(sp);
  }
  for (let i = 0; i < vert.length - 1; i++) {
    const d = new THREE.Mesh(discGeo, discMat); d.position.set(0, (vert[i][1] + vert[i + 1][1]) / 2, -1.2); groups.bones.add(d);
  }
  // First rib, clavicle, scapula, humerus, forearm stubs
  boneTube([[1.0, 2.6, -2.2], [3.2, 2.4, -2.7], [5.6, 1.9, -2.1], [6.8, 1.4, -0.6], [6.6, 1.0, 1.2], [5.4, 0.4, 2.8], [3.4, -0.2, 3.9], [1.6, -0.4, 4.2]], 0.35);
  boneTube([[1.8, 0.5, 4.4], [5.0, 1.1, 3.5], [8.5, 1.7, 2.0], [11.5, 2.0, 0.9], [13.2, 1.8, -1.2]], 0.45); // clavicle (superficial, S-shaped)
  boneTube([[11.2, 1.6, -1.5], [11.4, 1.4, 0.2], [11.4, 0.5, 1.4]], 0.3); // coracoid
  boneTube([[6.5, 1.5, -4.8], [11.0, 2.2, -3.2], [13.3, 2.1, -1.6]], 0.3); // spine of scapula + acromion
  {
    const pts = [[11.6, 0.9, -2.1], [9.5, 2.4, -3.2], [6.0, 2.6, -4.6], [6.6, -7.0, -4.3], [11.0, -1.0, -2.3]].map(V);
    const c = pts.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / pts.length);
    const pos = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]; const b = pts[(i + 1) % pts.length];
      pos.push(c.x, c.y, c.z, a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    addBone(g, boneMatFaint);
  }
  {
    const head = addBone(new THREE.SphereGeometry(1.25, 32, 20));
    head.position.set(13.2, 0.4, -1.3);
    boneTube([[13.8, 0.1, -1.1], [24, 0.0, -1.0], [33.5, -0.1, -0.9]], 0.5);
    boneTube([[34, -1.25, -0.95], [34, 1.05, -0.9]], 0.42); // epicondyles
    boneTube([[34.3, 0.8, -0.7], [41, 0.9, -0.4]], 0.28); // radius
    boneTube([[34.0, -0.9, -1.1], [41, -0.7, -0.8]], 0.3); // ulna
  }

  // Vessels
  const vesselMats = {
    artery: materialFor('#d62f2f', { roughness: 0.35 }),
    vein: materialFor('#5a6796', { roughness: 0.4, transparent: true, opacity: 0.85 }),
  };
  for (const [k, v] of Object.entries(VESSELS)) {
    const c = new THREE.CatmullRomCurve3(v.pts.map(V), false, 'centripetal');
    const m = new THREE.Mesh(track(new THREE.TubeGeometry(c, 220, v.r, 16, false)), vesselMats[k]);
    m.name = k;
    groups.vessels.add(m);
  }

  // Muscles
  const muscleMat = materialFor('#c2554d', { transparent: true, opacity: 0.16, depthWrite: false, roughness: 0.8, side: THREE.DoubleSide });
  const muscleMatFaint = materialFor('#c2554d', { transparent: true, opacity: 0.07, depthWrite: false, roughness: 0.8, side: THREE.DoubleSide });
  const muscleGeo = track(new THREE.CapsuleGeometry(1, 2, 8, 20));
  for (const m of MUSCLES) {
    const a = V(m.a); const b = V(m.b);
    const dir = b.clone().sub(a); const len = dir.length(); dir.normalize();
    const n = V(m.n).normalize();
    const z = n.sub(dir.clone().multiplyScalar(n.dot(dir))).normalize();
    const x = new THREE.Vector3().crossVectors(dir, z).normalize();
    const mesh = new THREE.Mesh(muscleGeo, m.faint ? muscleMatFaint : muscleMat);
    mesh.quaternion.copy(quatFromBasis(x, dir));
    mesh.scale.set(m.w, len / 4, m.t);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.renderOrder = 2;
    mesh.name = m.key;
    groups.muscles.add(mesh);
  }

  // Level and structure labels
  const levelLabelEls = [];
  for (const L of LEVEL_LABELS) {
    const lv = LEVELS.find((x) => x.id === L.id);
    const d = el('div', { class: 'v3d-label v3d-label--level', text: L.text });
    d.style.setProperty('--lvl', lv?.color || '#334155');
    const o = new CSS2DObject(d); o.position.set(...L.at);
    groups.levelLabels.add(o);
    levelLabelEls.push(d);
  }
  const structLabels = [];
  for (const s of STRUCT_LABELS) {
    const d = el('div', { class: 'v3d-label v3d-label--struct', text: s.text });
    const o = new CSS2DObject(d); o.position.set(...s.at);
    groups[s.group].add(o);
    structLabels.push({ d, group: s.group, blocks: s.blocks || [], only: !!s.only });
  }

  // ------------------------------------------------------------------ GLB (optional)
  const glb = { root: null, parts: [], byId: new Map(), anchors: new Map(), box: null, view: null };

  async function tryLoadGLB() {
    if (!opts.glbUrl) return;
    const url = new URL(opts.glbUrl, document.baseURI).href;
    let ok = false;
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
      ok = res.ok && !/text\/html/i.test(res.headers.get('content-type') || '');
    } catch { ok = false; }
    if (!ok || destroyed) return;
    loading.hidden = false;
    try {
      const [{ GLTFLoader }, { DRACOLoader }] = await Promise.all([
        import('three/addons/loaders/GLTFLoader.js'),
        import('three/addons/loaders/DRACOLoader.js'),
      ]);
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath(opts.dracoPath);
      loader.setDRACOLoader(draco);
      const gltf = await loader.loadAsync(url, (ev) => {
        if (ev.total) loading.textContent = `Loading 3D model… ${Math.round((ev.loaded / ev.total) * 100)}%`;
      });
      const main = gltf.scene || gltf.scenes?.[0];
      if (opts.splitUrl && main) {
        try {
          const split = await loader.loadAsync(new URL(opts.splitUrl, document.baseURI).href);
          const splitRoot = split.scene || split.scenes?.[0];
          if (splitRoot) {
            const fused = [];
            main.traverse((o) => { if (o.isMesh && /^nerve$/i.test(o.name)) fused.push(o); });
            fused.forEach((o) => o.removeFromParent());
            main.add(splitRoot);
          }
        } catch (e) {
          console.warn('[viewer3d] Split nerve file not loaded; using the fused nerve mesh.', e);
        }
      }
      draco.dispose();
      if (destroyed) return;
      setupGLB(main);
    } catch (err) {
      console.warn('[viewer3d] GLB could not be loaded; using the schematic model.', err);
      showToast('3D model file could not be loaded; showing the schematic model.');
    } finally {
      loading.hidden = true;
    }
  }

  function categorise(obj) {
    const names = [];
    let o = obj;
    while (o && names.length < 4) { if (o.name) names.push(o.name); o = o.parent; }
    const mats = (Array.isArray(obj.material) ? obj.material : [obj.material]).map((m) => m?.name || '');
    const all = [...names, ...mats].join(' | ');
    let cat = 'other';
    for (const c of MODEL_CATEGORIES) { if (c.test.test(all)) { cat = c.cat; break; } }
    let ids = [];
    if (cat === 'nerve' || cat === 'other') {
      const nm = names.join(' | ');
      for (const m of MODEL_MAP) { if (m.test.test(nm)) { ids = m.ids.filter((x) => ELEMENTS[x]); break; } }
      if (ids.length) cat = 'nerve';
    }
    return { cat, ids, label: names[0] || 'Unnamed part' };
  }

  const GLB_MAT = {
    nerve: { color: CLASSIC_NERVE, roughness: 0.5 },
    artery: { color: '#d62f2f', roughness: 0.35 },
    vein: { color: '#5a6796', roughness: 0.4 },
    bone: { color: '#e8dfcb', roughness: 0.75 },
    muscle: { color: '#c2554d', roughness: 0.8, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide },
    skin: { color: '#e0b49a', roughness: 0.8, transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide },
  };

  function setupGLB(sceneRoot) {
    if (!sceneRoot) return;
    const wrap = new THREE.Group();
    wrap.name = 'glb';
    wrap.add(sceneRoot);
    sceneRoot.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(sceneRoot);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const s = 30 / Math.max(size.x, size.y, size.z, 1e-6);
    sceneRoot.position.sub(centre);
    wrap.scale.setScalar(s);
    wrap.position.set(11, 1, 0);
    world.add(wrap);
    world.updateMatrixWorld(true);
    sceneRoot.traverse((o) => {
      if (!o.isMesh) return;
      const { cat, ids, label } = categorise(o);
      let mat;
      if (GLB_MAT[cat]) {
        mat = track(new THREE.MeshStandardMaterial({ metalness: 0.05, ...GLB_MAT[cat] }));
      } else {
        mat = Array.isArray(o.material) ? o.material.map((m) => track(m.clone())) : track(o.material.clone());
      }
      o.material = mat;
      if (cat === 'muscle' || cat === 'skin') o.renderOrder = 2;
      o.userData.ids = ids;
      o.userData.id = ids[0] || null;
      const part = { mesh: o, cat, ids, label, mat, base: Array.isArray(mat) ? null : mat.color.clone() };
      glb.parts.push(part);
      for (const id of ids) { if (!glb.byId.has(id)) glb.byId.set(id, []); glb.byId.get(id).push(part); }
    });
    glb.root = wrap;
    // Label anchors: for each element id, a surface vertex near the centre of its
    // largest GLB part, so the element labels can sit on the Blender model.
    glb.anchors = new Map();
    for (const [id, parts] of glb.byId) {
      let best = null; let bestSize = -1;
      for (const p of parts) {
        const b = new THREE.Box3().setFromObject(p.mesh);
        const sz = b.getSize(new THREE.Vector3()).length();
        if (sz > bestSize) { bestSize = sz; best = { p, b }; }
      }
      const pos = best?.p.mesh.geometry?.attributes?.position;
      if (!pos) continue;
      const c = best.b.getCenter(new THREE.Vector3());
      const v = new THREE.Vector3(); const out = new THREE.Vector3(); let dmin = Infinity;
      const step = Math.max(1, Math.floor(pos.count / 4000));
      for (let i = 0; i < pos.count; i += step) {
        v.fromBufferAttribute(pos, i).applyMatrix4(best.p.mesh.matrixWorld);
        const d = v.distanceToSquared(c);
        if (d < dmin) { dmin = d; out.copy(v); }
      }
      glb.anchors.set(id, out);
    }
    glb.box = new THREE.Box3().setFromObject(wrap);
    // Home view in the model frame (flyTo mirrors it). Frame the nerves, vessels and
    // the shoulder rather than the whole scapula so the plexus fills the view.
    const focus = new THREE.Box3();
    for (const p of glb.parts) if (!/scapul/i.test(p.label) && p.cat !== 'skin' && p.cat !== 'muscle') focus.expandByObject(p.mesh);
    if (focus.isEmpty()) focus.copy(glb.box);
    const c = toModel(focus.getCenter(new THREE.Vector3()));
    const sz = focus.getSize(new THREE.Vector3());
    glb.view = { pos: [c.x + sz.x * 0.12, c.y + sz.x * 0.2, c.z + sz.x * 1.25], target: [c.x, c.y, c.z], fit: sz.multiplyScalar(0.92) };
    // Block overlays on the Blender model are placed for this exact file. If the model
    // was re-exported and has moved, fall back to the schematic for probe and needle.
    const ref = glbCentroid('root-c5');
    glb.blockOk = !!ref && ref.distanceTo(V(GLB_REF.c5)) < 0.3;
    if (!glb.blockOk) console.warn('[viewer3d] Blender model differs from the one the block overlays were placed on; overlays use the schematic.');
    btnModel.hidden = false;
    buildPanel();
    if (glbPreferred) setMode('glb', { fly: true });
  }

  /** Vertex centroid (model frame) of an element's Blender parts. */
  function glbCentroid(id) {
    const parts = glb.byId.get(id);
    if (!parts) return null;
    const sum = new THREE.Vector3(); let n = 0;
    const v = new THREE.Vector3();
    for (const p of parts) {
      const pos = p.mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(p.mesh.matrixWorld); sum.add(v); n++; }
    }
    return n ? toModel(sum.multiplyScalar(1 / n)) : null;
  }

  function setMode(mode, { fly = false } = {}) {
    if (mode === 'glb' && !glb.root) mode = 'schematic';
    state.mode = mode;
    schematic.visible = mode === 'schematic';
    if (glb.root) glb.root.visible = mode === 'glb';
    // Fixed name plus aria-pressed (a toggle), so the state is not announced twice.
    btnModel.setAttribute('aria-pressed', mode === 'schematic' ? 'true' : 'false');
    btnModel.title = mode === 'glb' ? 'Schematic model (off: showing the Blender model)' : 'Schematic model (on)';
    root.classList.toggle('is-glb', mode === 'glb');
    // CSS2D labels ignore their parents' visibility, so move/hide them explicitly.
    for (const [id, o] of elementObjs) {
      if (!o.labHome) o.labHome = o.labObj.position.clone();
      const a = mode === 'glb' ? glb.anchors.get(id) : null;
      if (a) { o.labObj.parent.updateMatrixWorld(true); o.labObj.position.copy(o.labObj.parent.worldToLocal(a.clone())); }
      else o.labObj.position.copy(o.labHome);
    }
    panel.querySelector('.v3d-panel-glb')?.toggleAttribute('hidden', mode !== 'glb');
    panel.querySelector('.v3d-panel-schematic')?.toggleAttribute('hidden', mode !== 'schematic');
    if (state.block) startOverlay(false); // the overlay geometry differs per model
    refresh();
    if (fly) flyTo(currentHomeView());
    requestRender();
  }

  const currentHomeView = () => {
    if (state.block) {
      const g = blockGeom(state.block) || BLOCK_GEOM[state.block];
      if (g?.camera) return g.camera;
    }
    return state.mode === 'glb' && glb.view ? glb.view : DEFAULT_VIEW;
  };

  // ------------------------------------------------------------------ layers panel
  function buildPanel() {
    panel.innerHTML = '';
    const head = el('div', { class: 'v3d-panel-head' });
    head.append(el('h3', { class: 'v3d-panel-title', text: 'Layers' }));
    const close = el('button', { type: 'button', class: 'v3d-btn v3d-btn--sm', 'aria-label': 'Close layers' }, icon('close'));
    close.addEventListener('click', () => togglePanel(false));
    head.append(close);
    panel.append(head);

    const sch = el('div', { class: 'v3d-panel-schematic' });
    const fs = el('fieldset', { class: 'v3d-fs' });
    fs.append(el('legend', { text: 'Show' }));
    const opts2 = [
      ['collateral', 'Collateral branches'], ['related', 'Phrenic, intercostobrachial, supraclavicular'],
      ['vessels', 'Vessels'], ['bones', 'Bones'], ['muscles', 'Muscles'],
    ];
    for (const [k, txt] of opts2) {
      const lab = el('label', { class: 'v3d-check' });
      const cb = el('input', { type: 'checkbox' });
      cb.checked = state.layers[k];
      cb.dataset.layer = k;
      cb.addEventListener('change', () => setLayer(k, cb.checked));
      lab.append(cb, document.createTextNode(' ' + txt));
      fs.append(lab);
    }
    sch.append(fs);
    const fs2 = el('fieldset', { class: 'v3d-fs' });
    fs2.append(el('legend', { text: 'Nerve colour' }));
    for (const [k, txt] of [['cord', 'By cord (matches the diagram)'], ['level', 'By level (roots → branches)'], ['classic', 'Anatomical yellow']]) {
      const lab = el('label', { class: 'v3d-check' });
      const rb = el('input', { type: 'radio', name: `v3d-col-${hint.id}`, value: k });
      rb.checked = state.layers.colour === k;
      rb.addEventListener('change', () => { if (rb.checked) setLayer('colour', k); });
      lab.append(rb, document.createTextNode(' ' + txt));
      fs2.append(lab);
    }
    sch.append(fs2);
    panel.append(sch);

    if (glb.parts.length) {
      const g = el('div', { class: 'v3d-panel-glb' });
      const cats = ['nerve', 'artery', 'vein', 'bone', 'muscle', 'skin', 'other'];
      const catNames = { nerve: 'Nerves', artery: 'Arteries', vein: 'Veins', bone: 'Bones', muscle: 'Muscles', skin: 'Skin and fascia', other: 'Other parts' };
      const pretty = (t) => t.replace(/[_.]+/g, ' ').replace(/\s+/g, ' ').trim();
      for (const cat of cats) {
        const parts = glb.parts.filter((p) => p.cat === cat);
        if (!parts.length) continue;
        // One row per element (e.g. the five long thoracic pieces are one row), named
        // as in the rest of the app; parts that map to nothing go under "Other".
        const rows = new Map();
        for (const p of parts) {
          const id = p.ids[0];
          const key = id ? `id:${id}` : `other:${p.label}`;
          if (!rows.has(key)) rows.set(key, { name: id ? ELEMENTS[id].name : pretty(p.label), parts: [], other: !id && cat === 'nerve', order: id ? ELEMENT_ORDER.indexOf(id) : 999 });
          rows.get(key).parts.push(p);
        }
        const list = [...rows.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
        const det = el('details', { class: 'v3d-det' });
        const sum = el('summary');
        const all = el('input', { type: 'checkbox', 'aria-label': `Show all ${catNames[cat].toLowerCase()}` });
        all.checked = true;
        all.addEventListener('click', (e) => e.stopPropagation());
        sum.append(all, document.createTextNode(` ${catNames[cat]} (${list.length})`));
        det.append(sum);
        const boxes = [];
        let otherHead = false;
        for (const row of list) {
          if (row.other && !otherHead) { det.append(el('p', { class: 'v3d-subhead', text: 'Other structures' })); otherHead = true; }
          const lab = el('label', { class: 'v3d-check v3d-check--part' });
          const cb = el('input', { type: 'checkbox' });
          cb.checked = row.parts.every((p) => p.mesh.visible);
          cb.addEventListener('change', () => { row.parts.forEach((p) => { p.mesh.visible = cb.checked; }); requestRender(); });
          boxes.push(cb);
          lab.append(cb, document.createTextNode(' ' + row.name));
          det.append(lab);
        }
        all.addEventListener('change', () => {
          parts.forEach((p) => { p.mesh.visible = all.checked; });
          boxes.forEach((b) => { b.checked = all.checked; });
          requestRender();
        });
        g.append(det);
      }
      g.hidden = state.mode !== 'glb';
      panel.append(g);
      sch.hidden = state.mode !== 'schematic';
    }
  }

  function togglePanel(open) {
    const isOpen = open ?? panel.hidden;
    panel.hidden = !isOpen;
    // Sit below the colour key so the panel never covers it.
    const top = (legend.offsetHeight || 0) + 16;
    panel.style.top = `${top}px`;
    panel.style.maxHeight = `calc(100% - ${top + 8}px)`;
    btnLayers.setAttribute('aria-expanded', String(isOpen));
    btnLayers.setAttribute('aria-label', isOpen ? 'Hide layers' : 'Show layers');
    btnLayers.title = btnLayers.getAttribute('aria-label');
    if (isOpen) panel.querySelector('input,button')?.focus();
  }

  function setLayer(k, v) {
    if (!(k in state.layers)) return;
    state.layers[k] = v;
    applyLayers();
  }

  function applyLayers() {
    const L = state.layers;
    groups.collateral.visible = L.collateral;
    groups.related.visible = L.related;
    groups.bones.visible = L.bones;
    groups.vessels.visible = L.vessels;
    groups.muscles.visible = L.muscles;
    panel.querySelectorAll('input[data-layer]').forEach((cb) => { cb.checked = !!L[cb.dataset.layer]; });
    panel.querySelectorAll('input[type=radio]').forEach((rb) => { rb.checked = rb.value === L.colour; });
    root.dataset.labels = L.labels;
    // The accessible name contains the visible text (WCAG 2.5.3 Label in Name).
    const vis = L.labels === 'all' ? 'All' : L.labels === 'levels' ? 'Key' : 'Off';
    btnLabelText.textContent = vis;
    btnLabels.setAttribute('aria-label', `Labels: ${vis}`);
    btnLabels.title = `Labels: ${{ All: 'all structures', Key: 'key structures only', Off: 'off' }[vis]}. Click to change.`;
    refresh();
  }

  // ------------------------------------------------------------------ colouring / highlight
  function baseColor(id) {
    const e = ELEMENTS[id];
    if (state.layers.colour === 'cord') return colourFor(id);
    if (e.level === 'related') return state.layers.colour === 'classic' ? '#d4a017' : RELATED_COLOR;
    if (state.layers.colour === 'classic') return e.level === 'collateral' ? '#f0cf55' : CLASSIC_NERVE;
    if (e.level === 'collateral') {
      const p = ELEMENTS[e.parents[0]];
      return lighten(LEVEL_COLOR[p?.level] || '#64748b', 0.35);
    }
    return LEVEL_COLOR[e.level] || CLASSIC_NERVE;
  }

  function visualFor(id) {
    const { selected: sel, hovered: hov, block: blk } = state;
    let color = baseColor(id);
    let opacity = 1;
    let glow = 0;
    if (blk) {
      const st = blockStatus(blk, id);
      color = STATUS_COLORS[st || 'none'];
      if (!st) opacity = 0.35;
      if (st === 'target') glow = 0.35;
    }
    if (pathSet) {
      if (pathSet.has(id)) { glow = Math.max(glow, 0.32); opacity = 1; } else opacity = Math.min(opacity, 0.16);
    }
    if (id === hov) glow = Math.max(glow, 0.55);
    if (id === sel) glow = Math.max(glow, 0.6);
    return { color, opacity, glow };
  }

  let pathSet = null;
  function setOpacity(mat, opacity) {
    const transparent = opacity < 0.999;
    if (mat.transparent !== transparent) { mat.transparent = transparent; mat.needsUpdate = true; }
    mat.opacity = opacity;
    mat.depthWrite = !transparent;
  }
  function applyMat(mat, { color, opacity, glow }) {
    mat.color.set(color);
    mat.emissive.set(color);
    mat.emissiveIntensity = glow;
    const transparent = opacity < 0.999;
    if (mat.transparent !== transparent) { mat.transparent = transparent; mat.needsUpdate = true; }
    mat.opacity = opacity;
    mat.depthWrite = !transparent;
  }

  function refresh() {
    pathSet = state.selected && ELEMENTS[state.selected] ? new Set(getPathway(state.selected)) : null;
    const showAll = state.layers.labels === 'all';
    const showSome = state.layers.labels !== 'off';
    for (const [id, o] of elementObjs) {
      const vis = visualFor(id);
      applyMat(o.mat, vis);
      o.mesh.renderOrder = vis.opacity < 1 ? 1 : 0;
      const d = o.label;
      const lv = ELEMENTS[id].level;
      const isKey = lv === 'root' || lv === 'terminal' || lv === 'cord' || id === 'n-phrenic';
      const important = id === state.selected || id === state.hovered || (pathSet && pathSet.has(id) && (isKey || showAll)) ||
        (state.block && blockStatus(state.block, id) === 'target' && lv === BLOCKS[state.block].level);
      const showLabel = state.layers.labels === 'off' ? (id === state.selected || id === state.hovered) :
        important || showAll || (isKey && !pathSet && !state.block);
      d.classList.toggle('is-hidden', !showLabel);
      d.classList.toggle('is-selected', id === state.selected);
      d.classList.toggle('is-hover', id === state.hovered);
      d.classList.toggle('is-dim', !!pathSet && !pathSet.has(id));
      const st = state.block ? blockStatus(state.block, id) : null;
      d.dataset.status = st || '';
    }
    groups.levelLabels.visible = showSome;
    const isGlb = state.mode === 'glb';
    for (const s of structLabels) {
      // Muscle and bone names only when a block needs them, or with "All" labels.
      const show = !isGlb && showSome && (state.block ? s.blocks.includes(state.block) : showAll && !s.only);
      s.d.classList.toggle('is-hidden', !show);
    }
    for (const d of levelLabelEls) d.classList.toggle('is-hidden', isGlb || !showSome);
    if (isGlb) for (const [id, o] of elementObjs) { if (!glb.anchors.has(id)) o.label.classList.add('is-hidden'); }
    muscleMat.opacity = state.block ? 0.11 : 0.16;
    // See-through vessels and bone when something is selected (so the nerve stays
    // visible behind them) or a block is shown (so the needle and spread show).
    const seeThrough = { artery: pathSet ? 0.22 : state.block ? 0.5 : 1, vein: pathSet ? 0.18 : state.block ? 0.4 : 0.8, bone: pathSet ? 0.35 : state.block ? 0.55 : 1 };
    for (const p of glb.parts) if (seeThrough[p.cat] !== undefined && !Array.isArray(p.mat)) setOpacity(p.mat, seeThrough[p.cat]);
    setOpacity(vesselMats.artery, pathSet ? 0.3 : 1);
    setOpacity(vesselMats.vein, pathSet ? 0.25 : 0.85);
    // GLB parts
    for (const p of glb.parts) {
      if (!p.ids.length || Array.isArray(p.mat)) continue;
      let vis;
      if (p.cat === 'nerve') {
        const id = p.ids.find((x) => x === state.selected) || p.ids.find((x) => x === state.hovered) || p.ids[0];
        vis = visualFor(id);
        if (state.layers.colour === 'classic' && !state.block) vis.color = CLASSIC_NERVE;
      } else continue;
      applyMat(p.mat, vis);
    }
    if (glb.parts.length && pathSet) {
      for (const p of glb.parts) {
        if (p.cat === 'nerve' && !p.ids.length && !Array.isArray(p.mat)) applyMat(p.mat, { color: CLASSIC_NERVE, opacity: 0.25, glow: 0 });
      }
    } else {
      for (const p of glb.parts) {
        if (p.cat === 'nerve' && !p.ids.length && !Array.isArray(p.mat)) applyMat(p.mat, { color: CLASSIC_NERVE, opacity: 1, glow: 0 });
      }
    }
    updateLegend();
    updateChip();
    requestRender();
  }

  function updateLegend() {
    legend.innerHTML = '';
    let items;
    if (state.block) {
      items = [
        ['target', 'Injection target'], ['covers', 'Blocked'], ['variable', 'Variable'], ['spares', 'Spared'],
      ].map(([k, t]) => [STATUS_COLORS[k], t]);
      items.push(['#22d3ee', 'Local anaesthetic']);
    } else if (state.layers.colour === 'cord') {
      items = [
        [CORD_COLOURS.neutral, 'Roots and trunks'], [CORD_COLOURS.lateral, 'Lateral cord'],
        [CORD_COLOURS.posterior, 'Posterior cord'], [CORD_COLOURS.medial, 'Medial cord'], [CORD_COLOURS.median, 'Median nerve'],
      ];
      if (state.layers.related) items.push([CORD_COLOURS.related, 'Non-plexus nerves']);
    } else if (state.layers.colour === 'level') {
      items = LEVELS.map((l) => [l.color, l.name]);
      if (state.layers.related) items.push([RELATED_COLOR, 'Non-plexus nerves']);
    } else {
      items = [[CLASSIC_NERVE, 'Nerve'], ['#d62f2f', 'Artery'], ['#5a6796', 'Vein']];
    }
    const ul = el('ul', { class: 'v3d-legend-list', 'aria-label': 'Colour key' });
    for (const [c, t] of items) {
      const li = el('li');
      const sw = el('span', { class: 'v3d-swatch', 'aria-hidden': 'true' });
      sw.style.background = c;
      li.append(sw, document.createTextNode(t));
      ul.append(li);
    }
    legend.append(ul);
  }

  function updateChip() {
    const id = state.selected;
    if (id && ELEMENTS[id]) {
      const e = ELEMENTS[id];
      chip.innerHTML = '';
      const txt = el('span', { class: 'v3d-chip-text' });
      txt.textContent = `${e.name} (${e.spinal.join(', ')})`;
      const st = state.block ? blockStatus(state.block, id) : null;
      if (st) {
        const s = el('span', { class: `v3d-chip-status v3d-chip-status--${st}` });
        s.textContent = { target: 'Target', covers: 'Blocked', variable: 'Variable', spares: 'Spared' }[st];
        txt.append(' ', s);
      }
      const x = el('button', { type: 'button', class: 'v3d-chip-x', 'aria-label': 'Clear selection' }, icon('close'));
      x.addEventListener('click', () => emitSelect(null));
      chip.append(txt, x);
      chip.hidden = false;
    } else {
      chip.hidden = true;
      chip.innerHTML = '';
    }
  }

  // ------------------------------------------------------------------ bus
  const emitSelect = (id) => {
    state.selected = id; refresh();
    bus?.emit?.('select', { id, source: SOURCE });
  };
  const emitHover = (id) => {
    if (state.hovered === id) return;
    state.hovered = id; refresh();
    bus?.emit?.('hover', { id, source: SOURCE });
  };
  const offs = [];
  if (bus?.on) {
    offs.push(bus.on('select', (p) => {
      const id = p?.id ?? null;
      if (id === state.selected) return;
      state.selected = id && ELEMENTS[id] ? id : null;
      refresh();
    }));
    offs.push(bus.on('hover', (p) => {
      const id = p?.id ?? null;
      if (id === state.hovered) return;
      state.hovered = id && ELEMENTS[id] ? id : null;
      refresh();
    }));
    offs.push(bus.on('block', (p) => setBlock(p?.id ?? null)));
    offs.push(bus.on('layers', (p) => {
      if (!p || typeof p !== 'object') return;
      for (const [k, v] of Object.entries(p)) if (k in state.layers) state.layers[k] = v;
      applyLayers();
    }));
  }

  // ------------------------------------------------------------------ block overlay
  const blobGeo = track(noisyBlobGeometry());
  const laMat = materialFor('#22d3ee', { transparent: true, opacity: 0.55, depthWrite: false, roughness: 0.25, emissive: '#0ea5e9', emissiveIntensity: 0.3 });
  // "X-ray" pass so local anaesthetic stays visible behind vessels and bone.
  const laXrayMat = track(new THREE.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.28, depthWrite: false, depthTest: false }));
  const probeMat = materialFor('#475569', { transparent: true, opacity: 0.38, roughness: 0.4, depthWrite: false });
  const probeFaceMat = materialFor('#0f172a', { roughness: 0.6, transparent: true, opacity: 0.7, depthWrite: false });
  const planeMat = track(new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }));
  const planeEdgeMat = track(new THREE.LineBasicMaterial({ color: '#0284c7', transparent: true, opacity: 0.7 }));
  const skinMat = materialFor('#e0b49a', { transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false });
  const needleMat = materialFor('#d7dde5', { metalness: 0.85, roughness: 0.25, emissive: '#64748b', emissiveIntensity: 0.15 });
  const hubMat = materialFor('#f59e0b', { roughness: 0.5 });

  let overlay = null; // { geom, needle, blobs:[{mesh, r, s}], E, dir, L, P, A, B, N, depositTips:[] }
  let anim = null; // timeline runner

  function clearOverlay() {
    anim = null;
    caption.hidden = true;
    for (const o of [...groups.overlay.children]) {
      groups.overlay.remove(o);
      o.traverse((c) => {
        if (c.isCSS2DObject) c.element.remove();
        if (c.geometry && c.userData.ownGeo) c.geometry.dispose();
      });
    }
    overlay = null;
  }

  const PROBE_LEN = 3.8;
  /** Probe frame and needle entry/tips for a block geometry (model frame). */
  function overlayFrame(g) {
    const P = V(g.P);
    const A = V(g.A).normalize();
    const B = V(g.toward).sub(P);
    B.sub(A.clone().multiplyScalar(B.dot(A))).normalize();
    const N = new THREE.Vector3().crossVectors(A, B).normalize();
    // Needle pivot (entry) at the needle end of the probe; "lift" moves it deeper, which
    // gives a flatter needle. A deposit may set its own lift (a separate pass).
    const entry = (lift, from) => P.clone().addScaledVector(A, from * (PROBE_LEN / 2 + 0.5)).addScaledVector(B, lift);
    const Es = g.deposits.map((d) => entry(d.lift ?? g.entryLift ?? 0.15, d.from ?? g.needleFrom));
    const projectToPlane = (q) => q.clone().sub(N.clone().multiplyScalar(N.dot(q.clone().sub(P))));
    const tips = g.deposits.map((d) => projectToPlane(V(d.tip)));
    return { P, A, B, N, E: Es[0], Es, tips };
  }

  /** Geometry for a block on the current model (the Blender model has its own). */
  function blockGeom(blockId) {
    const g = BLOCK_GEOM[blockId];
    if (!g) return null;
    if (state.mode === 'glb') return glb.blockOk && g.glb ? { ...g, ...g.glb } : null;
    return g;
  }

  function buildOverlay(blockId) {
    const g = blockGeom(blockId);
    if (!g) return;
    const { P, A, B, N, E, Es, tips } = overlayFrame(g);
    const probeLen = PROBE_LEN; const probeH = 1.5; const probeT = 0.95;

    const og = new THREE.Group();
    // Probe body (handle points away from skin, i.e. along -B)
    const up = B.clone().negate();
    const qProbe = quatFromBasis(A, up);
    const body = new THREE.Mesh(new THREE.BoxGeometry(probeLen, probeH, probeT), probeMat);
    body.userData.ownGeo = true;
    body.quaternion.copy(qProbe);
    body.position.copy(P).addScaledVector(up, probeH / 2 + 0.05);
    const face = new THREE.Mesh(new THREE.BoxGeometry(probeLen * 0.96, 0.12, probeT * 0.9), probeFaceMat);
    face.userData.ownGeo = true;
    face.quaternion.copy(qProbe);
    face.position.copy(P).addScaledVector(up, 0.08);
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.2, 10), probeMat);
    cable.userData.ownGeo = true;
    cable.quaternion.copy(qProbe);
    cable.position.copy(P).addScaledVector(up, probeH + 1.15);
    // Orientation marker (small bump at the +A end)
    const mark = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), hubMat);
    mark.userData.ownGeo = true;
    mark.position.copy(P).addScaledVector(up, probeH * 0.6).addScaledVector(A, probeLen / 2 + 0.05);
    og.add(body, face, cable, mark);

    // Skin patch
    const skin = new THREE.Mesh(new THREE.CircleGeometry(2.3, 40), skinMat);
    skin.userData.ownGeo = true;
    skin.quaternion.copy(quatFromBasis(A, N));
    skin.position.copy(P).addScaledVector(B, 0.02);
    skin.renderOrder = 3;
    og.add(skin);

    // Imaging plane (linear probe: rectangle)
    const depth = Math.max(4, V(g.toward).sub(P).length() + 1.6);
    const pg = new THREE.PlaneGeometry(probeLen, depth);
    const plane = new THREE.Mesh(pg, planeMat);
    plane.userData.ownGeo = true;
    plane.quaternion.copy(quatFromBasis(A, B));
    plane.position.copy(P).addScaledVector(B, depth / 2);
    plane.renderOrder = 4;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(pg), planeEdgeMat);
    edges.userData.ownGeo = true;
    edges.quaternion.copy(plane.quaternion);
    edges.position.copy(plane.position);
    og.add(plane, edges);

    // Probe label
    const pl = el('div', { class: 'v3d-label v3d-label--probe', 'data-full': g.probeLabel, 'data-short': g.probeShort || 'Probe' });
    pl.textContent = root.classList.contains('is-compact') ? pl.dataset.short : pl.dataset.full;
    const plo = new CSS2DObject(pl);
    plo.position.copy(P).addScaledVector(up, probeH + 2.4);
    og.add(plo);

    // Needle: entry point at the needle end of the probe, in plane
    const L = g.needleLen;
    const needle = new THREE.Group();
    const shaftGeo = new THREE.CylinderGeometry(0.045, 0.045, L, 10);
    shaftGeo.translate(0, -L / 2, 0); // tip at origin, shaft extends along -Y
    const shaft = new THREE.Mesh(shaftGeo, needleMat);
    shaft.userData.ownGeo = true;
    const hubGeo = new THREE.CylinderGeometry(0.16, 0.11, 0.7, 12);
    hubGeo.translate(0, -L - 0.35, 0);
    const hub = new THREE.Mesh(hubGeo, hubMat);
    hub.userData.ownGeo = true;
    const tipGeo = new THREE.ConeGeometry(0.06, 0.2, 10);
    tipGeo.translate(0, -0.05, 0);
    const tipM = new THREE.Mesh(tipGeo, needleMat);
    tipM.userData.ownGeo = true;
    needle.add(shaft, hub, tipM);
    og.add(needle);
    const nlen = BLOCKS[blockId]?.needle?.length || '';
    const nl = el('div', { class: 'v3d-label v3d-label--probe', 'data-full': `${nlen} needle`.trim(), 'data-short': nlen || 'Needle' });
    nl.textContent = root.classList.contains('is-compact') ? nl.dataset.short : nl.dataset.full;
    const nlo = new CSS2DObject(nl);
    og.add(nlo);

    // LA blobs
    const blobs = [];
    g.deposits.forEach((d, di) => {
      d.blobs.forEach((b) => {
        const m = new THREE.Mesh(blobGeo, laMat);
        m.position.set(...b.c);
        m.userData.r = b.r;
        m.userData.s = b.s || [1, 1, 1];
        m.userData.deposit = di;
        m.renderOrder = 5;
        m.scale.setScalar(0.001);
        m.visible = false;
        const xr = new THREE.Mesh(blobGeo, laXrayMat);
        xr.renderOrder = 6;
        m.add(xr);
        og.add(m);
        blobs.push(m);
      });
    });

    groups.overlay.add(og);
    overlay = { g, needle, needleLabel: nlo, blobs, E, Es, curE: E, P, A, B, N, tips, L };
    setNeedleTip(E.clone().addScaledVector(tips[0].clone().sub(E).normalize(), -0.4));
  }

  function setNeedleTip(tip, E = overlay?.curE) {
    if (!overlay) return;
    overlay.curE = E;
    const dir = tip.clone().sub(E);
    if (dir.lengthSq() < 1e-6) dir.copy(overlay.tips[0]).sub(E);
    dir.normalize();
    overlay.needle.position.copy(tip);
    overlay.needle.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    overlay.needleLabel.position.copy(tip).addScaledVector(dir, -overlay.L - 0.9);
  }

  function setBlobProgress(m, f) {
    const r = m.userData.r; const s = m.userData.s;
    const k = Math.max(0.001, r * f * LA_SCALE);
    m.scale.set(k * s[0], k * s[1], k * s[2]);
    m.visible = f > 0.001;
  }

  function showFinalOverlay() {
    if (!overlay) return;
    const last = overlay.tips.length - 1;
    setNeedleTip(overlay.tips[last], overlay.Es[last]);
    overlay.blobs.forEach((b) => setBlobProgress(b, 1));
    const st = overlay.g.steps;
    showCaption(st[st.length - 1]);
    requestRender();
  }

  function showCaption(t) {
    caption.textContent = t || '';
    caption.hidden = !t;
  }

  function playNeedle() {
    if (!overlay) return;
    const { Es, tips, blobs, g } = overlay;
    const E = Es[0];
    const steps = g.steps;
    const segs = [];
    const start = E.clone().addScaledVector(tips[0].clone().sub(E).normalize(), -0.4);
    segs.push({ kind: 'hold', dur: 900, caption: steps[0], fn: () => setNeedleTip(start, E) });
    let cur = start;
    let stepIdx = 1;
    tips.forEach((tip, i) => {
      const Ei = Es[i];
      if (i > 0) {
        const Ep = Es[i - 1];
        const newPass = Ep.distanceTo(Ei) > 0.05;
        // Same pass: withdraw part way and redirect. New pass: withdraw to the skin first.
        const back = Ep.clone().lerp(cur, newPass ? 0.04 : 0.35);
        const from = cur.clone();
        segs.push({ kind: 'move', dur: newPass ? 800 : 650, fn: (f) => setNeedleTip(from.clone().lerp(back, easeInOut(f)), Ep) });
        cur = back;
        if (newPass) {
          const to = Ei.clone().lerp(tip, 0.04);
          const from2 = cur.clone();
          segs.push({ kind: 'move', dur: 500, fn: (f) => { const e = easeInOut(f); setNeedleTip(from2.clone().lerp(to, e), Ep.clone().lerp(Ei, e)); } });
          cur = to;
        }
      }
      const from = cur.clone();
      segs.push({ kind: 'move', dur: i === 0 ? 1700 : 1100, caption: i === 0 ? steps[stepIdx++] : null, fn: (f) => setNeedleTip(from.clone().lerp(tip, easeInOut(f)), Ei) });
      cur = tip.clone();
      const mine = blobs.filter((b) => b.userData.deposit === i);
      const cap = steps[Math.min(stepIdx++, steps.length - 1)];
      segs.push({
        kind: 'grow', dur: 1300 + 350 * (mine.length - 1), caption: cap,
        fn: (f) => mine.forEach((b, j) => {
          const d = mine.length > 1 ? j / mine.length * 0.6 : 0;
          setBlobProgress(b, easeOut(Math.min(1, Math.max(0, (f - d) / (1 - (mine.length > 1 ? 0.6 * (mine.length - 1) / mine.length : 0))))));
        }),
      });
    });
    blobs.forEach((b) => setBlobProgress(b, 0));
    anim = { segs, i: 0, t0: performance.now() };
    btnPlay.classList.add('is-playing');
    if (segs[0].caption) showCaption(segs[0].caption);
    segs[0].fn(0);
    requestRender();
  }

  function stepAnim(now) {
    if (!anim) return false;
    let seg = anim.segs[anim.i];
    let f = (now - anim.t0) / seg.dur;
    while (f >= 1) {
      seg.fn(1);
      anim.i++;
      if (anim.i >= anim.segs.length) { anim = null; btnPlay.classList.remove('is-playing'); return true; }
      anim.t0 += seg.dur;
      seg = anim.segs[anim.i];
      if (seg.caption) showCaption(seg.caption);
      f = (now - anim.t0) / seg.dur;
    }
    seg.fn(Math.max(0, f));
    return true;
  }

  function setBlock(id) {
    const blockId = id && BLOCKS[id] ? id : null;
    if (blockId === state.block) return;
    state.block = blockId;
    clearOverlay();
    root.classList.toggle('has-block', !!blockId);
    if (blockId) startOverlay(true);
    else { btnPlay.disabled = true; flyTo(currentHomeView()); }
    refresh();
  }

  /** (Re)build the probe / needle / local anaesthetic overlay for the current model. */
  function startOverlay(animate) {
    clearOverlay();
    const blockId = state.block;
    if (!blockId) return;
    buildOverlay(blockId);
    btnPlay.disabled = !overlay;
    if (!overlay) showToast('Probe and needle are shown on the schematic model for this block.');
    flyTo(currentHomeView());
    if (!overlay) return;
    if (reducedMotion || !animate) showFinalOverlay();
    else playNeedle();
  }

  // ------------------------------------------------------------------ camera
  let camAnim = null;
  function adjustedView(v) {
    // Pull back on narrow (portrait) viewports so the subject still fits.
    const t = V(v.target); const p = V(v.pos);
    const aspect = camera.aspect || 1;
    if (v.fit) {
      // Fit a box (model units) to the current aspect ratio, keeping the view direction.
      const dir = p.clone().sub(t).normalize();
      const vh = THREE.MathUtils.degToRad(camera.fov) / 2;
      const hh = Math.atan(Math.tan(vh) * aspect);
      const d = Math.max((v.fit.x / 2) * 1.04 / Math.tan(hh), (v.fit.y / 2) * 1.12 / Math.tan(vh)) + v.fit.z / 2;
      return { pos: toWorld(t.clone().addScaledVector(dir, d)), target: toWorld(t) };
    }
    const k = aspect < 1.25 ? Math.min(1.75, Math.pow(1.25 / Math.max(aspect, 0.4), 0.7)) : 1;
    if (aspect < 1 && v === DEFAULT_VIEW) t.x -= 1.5; // portrait: centre on the plexus, not the arm
    // Views are written in the model frame; convert to the mirrored world.
    return { pos: toWorld(t.clone().add(p.sub(V(v.target)).multiplyScalar(k))), target: toWorld(t) };
  }
  function flyTo(view, instant = false) {
    if (!view) return;
    userMoved = false;
    const { pos, target } = adjustedView(view);
    if (instant || reducedMotion) {
      camera.position.copy(pos); controls.target.copy(target); controls.update(); camAnim = null; requestRender();
      return;
    }
    camAnim = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), dur: 950 };
    requestRender();
  }
  function stepCam(now) {
    if (!camAnim) return false;
    const f = Math.min(1, (now - camAnim.start) / camAnim.dur);
    const e = easeInOut(f);
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, e);
    controls.target.lerpVectors(camAnim.t0, camAnim.t1, e);
    if (f >= 1) camAnim = null;
    return true;
  }
  controls.addEventListener('start', () => { camAnim = null; dragging = true; userMoved = true; requestRender(); });
  controls.addEventListener('end', () => { dragging = false; });
  controls.addEventListener('change', () => requestRender());

  // ------------------------------------------------------------------ render loop
  let rafId = 0;
  let dragging = false;
  let userMoved = false;
  let destroyed = false;
  let width = 0; let height = 0;
  function requestRender() {
    if (!rafId && !destroyed) rafId = requestAnimationFrame(tick);
  }
  function tick(now) {
    rafId = 0;
    if (destroyed) return;
    const a1 = stepCam(now);
    const a2 = stepAnim(now);
    const moved = controls.update();
    if (width > 0 && height > 0) {
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
      declutter();
    }
    if (a1 || a2 || moved || dragging) requestRender();
  }

  // ------------------------------------------------------------------ label declutter
  // CSS2D labels are positioned every frame; afterwards hide the lower-priority label
  // of any overlapping pair, keep labels off the toolbar, legend, chip and caption,
  // and nudge probe / needle labels back inside the view.
  const labelPriority = (d) => {
    if (d.classList.contains('is-selected')) return 100;
    if (d.classList.contains('is-hover')) return 95;
    if (d.dataset.status === 'target') return 80;
    if (d.classList.contains('v3d-label--probe')) return 70;
    if (d.classList.contains('v3d-label--level')) return 60;
    if (d.classList.contains('v3d-label--root') || d.classList.contains('v3d-label--cord') || d.classList.contains('v3d-label--terminal')) return 50;
    if (d.classList.contains('v3d-label--el') && !d.classList.contains('is-dim')) return 40;
    if (d.classList.contains('v3d-label--struct')) return 20;
    return 30;
  };
  const relRect = (elm, o) => { const r = elm.getBoundingClientRect(); return { l: r.left - o.left, t: r.top - o.top, r: r.right - o.left, b: r.bottom - o.top }; };
  const overlaps = (a, b, pad = 2) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
  function declutter() {
    const o = stage.getBoundingClientRect();
    if (!o.width) return;
    const blocked = [];
    for (const elm of [toolbar, legend, chip, caption, panel]) {
      if (elm.hidden || !elm.offsetParent && elm !== toolbar) continue;
      const r = relRect(elm, o);
      if (r.r > r.l && r.b > r.t) blocked.push(r);
    }
    const tbr = relRect(toolbar, o);
    const safe = { l: 4, t: 4, r: Math.min(o.width - 4, tbr.l - 6), b: o.height - 4 };
    const items = [];
    for (const d of labelHost.children) {
      if (d.style.display === 'none' || d.classList.contains('is-hidden')) { d.classList.remove('is-occluded'); continue; }
      items.push({ d, p: labelPriority(d), r: relRect(d, o) });
    }
    items.sort((a, b) => b.p - a.p);
    const placed = [];
    for (const it of items) {
      let { r } = it;
      if (it.d.classList.contains('v3d-label--probe')) {
        // Keep probe / needle labels fully inside the free part of the view.
        let dx = 0; let dy = 0;
        if (r.r > safe.r) dx = safe.r - r.r;
        if (r.l + dx < safe.l) dx = safe.l - r.l;
        if (r.b > safe.b) dy = safe.b - r.b;
        if (r.t + dy < safe.t) dy = safe.t - r.t;
        for (const b of blocked) {
          const rr = { l: r.l + dx, r: r.r + dx, t: r.t + dy, b: r.b + dy };
          if (overlaps(rr, b, 0) && b.t > o.height / 2) dy += b.t - rr.b - 4; // lift above the caption / chip
        }
        if (dx || dy) {
          it.d.style.transform += ` translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
          r = { l: r.l + dx, r: r.r + dx, t: r.t + dy, b: r.b + dy };
        }
      }
      const clipped = r.l < 0 || r.t < 0 || r.r > o.width || r.b > o.height;
      const hit = clipped || blocked.some((b) => overlaps(r, b, 0)) || placed.some((q) => overlaps(r, q));
      const hide = hit && it.p < 100;
      it.d.classList.toggle('is-occluded', hide);
      if (!hide) placed.push(r);
    }
  }

  // ------------------------------------------------------------------ resize
  const ro = new ResizeObserver((entries) => {
    const r = entries[0].contentRect;
    width = Math.max(1, Math.floor(r.width));
    height = Math.max(1, Math.floor(r.height));
    renderer.setSize(width, height, false);
    labelRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    setCompact(root.clientWidth);
    // Until the user moves the camera, keep the current view framed for this aspect ratio.
    if (!userMoved && !camAnim) flyTo(currentHomeView(), true);
    requestRender();
  });
  ro.observe(stage);

  // ------------------------------------------------------------------ picking
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (state.mode === 'glb') {
      const targets = glb.parts.filter((p) => p.ids.length && p.mesh.visible).map((p) => p.mesh);
      const hit = raycaster.intersectObjects(targets, false)[0];
      return hit ? hit.object.userData.id : null;
    }
    const targets = pickGroup.children.filter((p) => {
      const o = elementObjs.get(p.userData.id);
      return o && groups[o.group].visible;
    });
    const hits = raycaster.intersectObjects(targets, false);
    if (!hits.length) return null;
    // Prefer the hit whose real (thin) tube is closest to the ray if several proxies overlap
    const near = hits[0].distance;
    const cands = hits.filter((h) => h.distance < near + 0.6);
    if (cands.length === 1) return cands[0].object.userData.id;
    let best = null; let bestD = Infinity;
    for (const h of cands) {
      const o = elementObjs.get(h.object.userData.id);
      const real = raycaster.intersectObject(o.mesh, false)[0];
      const d = real ? real.distance - 10 : h.distance;
      if (d < bestD) { bestD = d; best = h.object.userData.id; }
    }
    return best;
  }

  let downAt = null;
  let hoverRaf = 0;
  let lastMove = null;
  const onPointerDown = (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; };
  const onPointerUp = (e) => {
    if (!downAt || downAt.id !== e.pointerId) return;
    const dx = e.clientX - downAt.x; const dy = e.clientY - downAt.y;
    const quick = performance.now() - downAt.t < 600;
    downAt = null;
    if (dx * dx + dy * dy > 49 || !quick || e.button > 0) return;
    const id = pick(e.clientX, e.clientY);
    if (id) emitSelect(state.selected === id ? null : id);
    else if (state.selected) emitSelect(null);
  };
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    lastMove = e;
    if (hoverRaf) return;
    hoverRaf = requestAnimationFrame(() => {
      hoverRaf = 0;
      if (!lastMove || dragging) return;
      const id = pick(lastMove.clientX, lastMove.clientY);
      canvas.style.cursor = id ? 'pointer' : '';
      if (id) {
        const rect = stage.getBoundingClientRect();
        tooltip.textContent = ELEMENTS[id].name;
        tooltip.style.transform = `translate(${Math.round(lastMove.clientX - rect.left + 14)}px, ${Math.round(lastMove.clientY - rect.top + 14)}px)`;
        tooltip.classList.add('is-on');
      } else tooltip.classList.remove('is-on');
      emitHover(id);
    });
  };
  const onPointerLeave = () => { tooltip.classList.remove('is-on'); canvas.style.cursor = ''; lastMove = null; emitHover(null); };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);

  // Keyboard
  const cycleIds = () => ELEMENT_ORDER.filter((id) => {
    const o = elementObjs.get(id);
    return o && groups[o.group].visible;
  });
  const onKey = (e) => {
    const k = e.key;
    const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    let handled = true;
    if (k === 'ArrowLeft') sph.theta -= 0.12;
    else if (k === 'ArrowRight') sph.theta += 0.12;
    else if (k === 'ArrowUp') sph.phi = Math.max(0.1, sph.phi - 0.1);
    else if (k === 'ArrowDown') sph.phi = Math.min(Math.PI - 0.1, sph.phi + 0.1);
    else if (k === '+' || k === '=') sph.radius = Math.max(controls.minDistance, sph.radius * 0.88);
    else if (k === '-' || k === '_') sph.radius = Math.min(controls.maxDistance, sph.radius * 1.12);
    else if (k === 'n' || k === 'N' || k === 'p' || k === 'P') {
      const ids = cycleIds();
      const i = ids.indexOf(state.selected);
      const step = (k === 'n' || k === 'N') ? 1 : -1;
      const next = ids[(i + step + ids.length) % ids.length] || ids[0];
      emitSelect(next);
      announce(ELEMENTS[next].name);
      e.preventDefault();
      return;
    } else if (k === 'Escape') {
      if (state.selected) emitSelect(null); else handled = false;
    } else handled = false;
    if (!handled) return;
    e.preventDefault();
    camAnim = null;
    userMoved = true;
    camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));
    controls.update();
    requestRender();
  };
  canvas.addEventListener('keydown', onKey);
  const sr = el('div', { class: 'v3d-sr', 'aria-live': 'polite' });
  root.append(sr);
  const announce = (t) => { sr.textContent = ''; setTimeout(() => { sr.textContent = t; }, 30); };

  // Toolbar handlers
  btnReset.addEventListener('click', () => flyTo(currentHomeView()));
  btnLabels.addEventListener('click', () => {
    const order = ['levels', 'all', 'off'];
    state.layers.labels = order[(order.indexOf(state.layers.labels) + 1) % order.length];
    applyLayers();
  });
  btnPlay.addEventListener('click', () => { if (overlay) playNeedle(); });
  btnLayers.addEventListener('click', () => togglePanel());
  btnModel.addEventListener('click', () => {
    glbPreferred = state.mode !== 'glb';
    setMode(glbPreferred ? 'glb' : 'schematic', { fly: true });
  });
  const onPanelKey = (e) => { if (e.key === 'Escape') { togglePanel(false); btnLayers.focus(); } };
  panel.addEventListener('keydown', onPanelKey);

  let toastTimer = 0;
  function showToast(t) {
    toast.textContent = t;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-on'), 4200);
  }

  // ------------------------------------------------------------------ init
  panel.id = `v3d-panel-${hint.id}`;
  btnLayers.setAttribute('aria-controls', panel.id);
  buildPanel();
  {
    const w = containerEl.clientWidth || window.innerWidth;
    if (w < 560) state.layers.labels = 'levels';
  }
  applyLayers();
  caption.hidden = true;
  chip.hidden = true;
  if (busState.block) setBlock(busState.block);
  else flyTo(DEFAULT_VIEW, true);
  refresh();
  tryLoadGLB();

  // ------------------------------------------------------------------ dev check
  const meshCache = new WeakMap();
  function meshPoints(mesh) {
    let c = meshCache.get(mesh);
    if (c) return c;
    const g = mesh.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    const pos = g.attributes.position; const nor = g.attributes.normal;
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
    const P = new Float32Array(pos.count * 3); const N = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld); P.set([v.x, v.y, v.z], i * 3);
      v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); N.set([v.x, v.y, v.z], i * 3);
    }
    const box = new THREE.Box3().setFromObject(mesh);
    c = { P, N, box, n: pos.count };
    meshCache.set(mesh, c);
    return c;
  }
  function signedDist(c, p) {
    let best = Infinity; let bi = -1;
    for (let i = 0; i < c.n; i++) {
      const dx = p.x - c.P[i * 3]; const dy = p.y - c.P[i * 3 + 1]; const dz = p.z - c.P[i * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < best) { best = d; bi = i; }
    }
    const dx = p.x - c.P[bi * 3]; const dy = p.y - c.P[bi * 3 + 1]; const dz = p.z - c.P[bi * 3 + 2];
    const along = dx * c.N[bi * 3] + dy * c.N[bi * 3 + 1] + dz * c.N[bi * 3 + 2];
    const d = Math.sqrt(best);
    // Inside only when the offset points clearly against the surface normal (beyond an
    // open tube end the offset is sideways to the normals, which means outside).
    return along < -0.5 * d ? -d : d;
  }
  function structureMeshes() {
    const out = [];
    if (state.mode === 'glb') {
      for (const p of glb.parts) if (p.mesh.visible && ['nerve', 'artery', 'vein', 'bone'].includes(p.cat)) out.push({ name: p.ids[0] || p.label, mesh: p.mesh });
    } else {
      for (const [id, o] of elementObjs) if (groups[o.group].visible) out.push({ name: id, mesh: o.mesh });
      groups.vessels.children.forEach((m) => { if (m.isMesh) out.push({ name: m.name, mesh: m }); });
      groups.bones.children.forEach((m, i) => { if (m.isMesh) out.push({ name: `bone${i}`, mesh: m }); });
    }
    return out;
  }
  function needleReport({ threshold = 0.25, geom = null, sweep = true, raw = false } = {}) {
    const fr = geom ? overlayFrame(geom) : overlay;
    if (!fr) return 'No block overlay.';
    scene.updateMatrixWorld(true);
    const { Es, tips, P, B } = fr;
    const E = Es[0];
    const paths = [];
    let cur = E.clone().addScaledVector(tips[0].clone().sub(E).normalize(), -0.4);
    tips.forEach((tip, i) => {
      const Ei = Es[i];
      const newPass = i > 0 && Es[i - 1].distanceTo(Ei) > 0.05;
      const from = i === 0 ? cur.clone() : newPass ? Ei.clone().lerp(tip, 0.04) : Ei.clone().lerp(cur, 0.35);
      const shafts = [];
      for (let f = sweep ? 0 : 1; f <= 1.0001; f += 0.25) shafts.push(from.clone().lerp(tip, f));
      paths.push({ deposit: i + 1, shafts, E: Ei });
      cur = tip.clone();
    });
    const meshes = structureMeshes().map((m) => ({ ...m, c: meshPoints(m.mesh) }));
    const rows = [];
    for (const p of paths) {
      const mins = new Map();
      for (const t of p.shafts) {
        // Check the whole shaft from where it crosses the skin plane (through E) to the tip.
        const dir = p.E.clone().sub(t);
        const dv = dir.dot(B);
        const back = dv < -1e-6 ? -t.clone().sub(P).dot(B) / dv : 1;
        const Ew = toWorld(t.clone().addScaledVector(dir, Math.max(1, back)));
        const Tw = toWorld(t);
        const len = Tw.distanceTo(Ew);
        const steps = Math.max(8, Math.ceil(len / 0.08));
        for (let k = 0; k <= steps; k++) {
          const q = Ew.clone().lerp(Tw, k / steps);
          for (const m of meshes) {
            if (m.c.box.distanceToPoint(q) > threshold + 0.5) continue;
            const d = signedDist(m.c, q);
            if (!mins.has(m.name) || d < mins.get(m.name)) mins.set(m.name, d);
          }
        }
      }
      if (raw) { rows.push(Object.fromEntries(mins)); continue; }
      for (const [name, d] of mins) if (d < threshold) rows.push(`deposit ${p.deposit}: ${name} ${d.toFixed(2)}`);
    }
    if (raw) return rows;
    return rows.length ? rows.join('\n') : `clear (all > ${threshold})`;
  }

  // ------------------------------------------------------------------ destroy
  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(hoverRaf);
      clearTimeout(toastTimer);
      offs.forEach((off) => { try { off?.(); } catch { /* ignore */ } });
      ro.disconnect();
      reducedMotionMq.removeEventListener?.('change', onRM);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('keydown', onKey);
      controls.dispose();
      clearOverlay();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose?.());
      });
      disposables.forEach((d) => d.dispose?.());
      disposables.clear();
      renderer.dispose();
      renderer.forceContextLoss?.();
      root.remove();
    },
    // Extras for the integrator / debugging
    get state() { return { ...state, layers: { ...state.layers } }; },
    /** Dev check: minimum clearance (model units, negative = inside) between every
     *  needle path of the current block overlay and each nerve, vessel and bone. */
    needleReport: (opts2) => needleReport(opts2),
    _dev: { structureMeshes, meshPoints, overlayFrame, toWorld, toModel, setMode: (m) => setMode(m) },
    setLayer: (k, v) => setLayer(k, v),
    resetView: () => flyTo(currentHomeView()),
    play: () => playNeedle(),
    flyTo: (view) => flyTo(view),
    _three: { scene, camera, controls, renderer },
  };
}
