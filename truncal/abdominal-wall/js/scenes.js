// Abdominal wall: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../shared/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images.
import { E, P, PS, L } from '../../shared/js/scene.js';

const tapSteps = {
  scan: '<p>Probe transverse in the <strong>mid-axillary line</strong>, between the costal margin and the iliac crest. Or start at the lateral edge of rectus (linea semilunaris) and slide laterally until three muscle layers appear.</p>',
  identify: '<p>From the skin down: subcutaneous fat, <strong>external oblique</strong>, <strong>internal oblique</strong> (usually the thickest), <strong>transversus abdominis</strong> (thin and dark), then the bright peritoneum with bowel moving underneath. The target is the plane between IO and TA.</p>',
  needle: '<p>In-plane, <strong>anterior to posterior</strong>. Keep the whole shaft and tip in view as the tip passes through EO and IO to the IO–TA plane. A click is often felt through the fascia.</p>',
  inject: '<p>Inject 1–2 ml first. Correct: an anechoic lens opens between IO and TA and <strong>pushes TA down</strong> (hydrodissection), spreading along the plane. If a muscle swells instead, stop and reposition. Aspirate every 5 ml.</p>',
};

export const SCENES = {
  // Right flank, transverse, mid-axillary line.
  tap: {
    id: 'aw-tap', title: 'Lateral TAP: transverse view, mid-axillary line', width: 45, depth: 40, focus: 22, skin: 1.2,
    view: 'Transverse (axial) view of the right lateral abdominal wall in the mid-axillary line, between the costal margin and the iliac crest. Probe marker anterior.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 8], [15, 8.6], [30, 9.2], [45, 9.6]] },
      { id: 'eo', kind: 'muscle', label: 'External oblique', short: 'EO', stri: -6, bottom: [[0, 14], [20, 14.8], [45, 15.6]] },
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', stri: 4, bottom: [[0, 23], [22, 24.6], [45, 25.6]] },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', echo: 0.11, stri: 0, dens: 0.4, bottom: [[0, 27.4], [22, 28.9], [45, 29.9]] },
      { id: 'epf', kind: 'fat-deep', label: 'Extraperitoneal fat', nolabel: true, edge: 0, bottom: [[0, 29], [22, 30.6], [45, 31.6]] },
      { id: 'bowel', kind: 'bowel', label: 'Bowel', bottom: 48, labelX: 34 },
    ],
    lines: [
      { id: 'perit', kind: 'peritoneum', label: 'Peritoneum', short: 'Perit.', pts: [[0, 29], [22, 30.6], [45, 31.6]], at: [10, 29.75], lab: [10, 35] },
    ],
    target: { at: [24, 24.7], r: 2 },
    injections: [
      { id: 'tap', label: 'IO–TA plane', entry: [-16, 0], tip: [24, 24.7], spread: { along: 'io', x0: 8, x1: 40, thick: 4.5, up: 0.25, above: 7 } },
    ],
    steps: tapSteps,
    probe: { view: 'front', x: 46, y: 204, angle: 0, label: 'transverse, mid-axillary line, between costal margin and iliac crest (right side shown).' },
  },

  // Right upper abdomen, oblique, just below and parallel to the costal margin.
  subcostal: {
    id: 'aw-subcostal', title: 'Subcostal TAP: oblique view under the costal margin', width: 50, depth: 40, focus: 20, skin: 1.2,
    view: 'Oblique view just below and parallel to the right costal margin, close to the xiphoid. Medial on the left. Transversus abdominis lies deep to rectus here.',
    orient: { left: 'Medial (xiphoid)', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 6], [25, 6.8], [50, 7.8]] },
      { id: 'eo', kind: 'muscle', label: 'External oblique', short: 'EO', smooth: false, bottom: [[0, 5], [25, 6.8], [31, 10.2], [40, 11.8], [50, 12.6]], labelX: 44 },
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', smooth: false, bottom: [[0, 5], [26, 7], [32, 14.4], [40, 16.8], [50, 18]], labelX: 44 },
      { id: 'ra', kind: 'muscle', label: 'Rectus abdominis', short: 'RA', stri: 0, echo: 0.16, smooth: false, bottom: [[0, 18.4], [18, 18.8], [24, 17.6], [28, 15.4], [31, 13.8], [50, 13]], labelX: 10 },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', echo: 0.11, dens: 0.4, bottom: [[0, 21.4], [25, 22.2], [50, 23.6]], labelX: 40 },
      { id: 'epf', kind: 'fat-deep', label: 'Extraperitoneal fat', nolabel: true, edge: 0, bottom: [[0, 22.6], [25, 23.4], [50, 24.9]] },
      { id: 'liver', kind: 'liver', label: 'Liver', bottom: 50, labelX: 36 },
    ],
    lines: [
      { id: 'perit', kind: 'peritoneum', label: 'Peritoneum', short: 'Perit.', pts: [[0, 22.6], [25, 23.4], [50, 24.9]], at: [12, 22.95], lab: [12, 28.5] },
    ],
    shapes: [
      { id: 'ls', kind: 'fascia', label: 'Linea semilunaris', short: 'LS', shape: L(0.4, [27.5, 7], [30, 13.8]), at: [28.6, 10], lab: [21, 3.6] },
      { id: 'sea', kind: 'artery', label: 'Superior epigastric artery', short: 'SEA', shape: E(9, 19.2, 0.8, 0.7), lab: [6, 25.6] },
    ],
    target: { at: [14, 19.6], r: 2 },
    injections: [
      { id: 'sub', label: 'Rectus–TA plane', entry: [-14, 0], tip: [14, 19.6], spread: { along: 'ra', x0: 3, x1: 26, thick: 3.8, up: 0.3, above: 7 } },
    ],
    steps: {
      scan: '<p>Probe <strong>just below the costal margin</strong>, near the xiphoid, lying parallel to the margin. Then slide along the margin to see how the layers change laterally.</p>',
      identify: '<p>Medially: <strong>rectus abdominis</strong> with <strong>transversus abdominis</strong> lying deep to it (in the upper abdomen TA extends behind rectus). Laterally, past the linea semilunaris: EO, IO and TA. Deep: peritoneum and liver.</p>',
      needle: '<p>In-plane, <strong>medial to lateral</strong>, entering close to the xiphoid and advancing along the line of the costal margin. Aim for the plane between the back of rectus and TA.</p>',
      inject: '<p>Hydrodissect: the fluid separates rectus from TA and spreads laterally along the costal margin. For wider spread, advance the needle in the opened plane and inject again (oblique subcostal technique).</p>',
    },
    probe: { view: 'front', x: 66, y: 150, angle: -42, label: 'oblique, just below and parallel to the right costal margin, near the xiphoid.' },
  },

  // Transverse, just lateral to the umbilicus (right side).
  rsb: {
    id: 'aw-rsb', title: 'Rectus sheath: transverse view beside the umbilicus', width: 45, depth: 36, focus: 20, skin: 1.2,
    view: 'Transverse view just lateral to the umbilicus (right side). Linea alba at the medial (left) edge, linea semilunaris laterally.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 9], [45, 10.5]], labelX: 22 },
      { id: 'ars', kind: 'aponeurosis', label: 'Anterior rectus sheath', short: 'ARS', nolabel: true, smooth: false, bottom: [[0, 9.9], [34, 11.3], [37, 10.6], [38.5, 9.9], [45, 9.9]] },
      { id: 'eo', kind: 'muscle', label: 'External oblique', short: 'EO', smooth: false, bottom: [[0, 9], [35.5, 11.3], [38.5, 12.6], [41, 14.2], [45, 14.6]], at: [43, 12.6], lab: [42.5, 12.6] },
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', smooth: false, bottom: [[0, 9], [36.5, 11.4], [39, 15], [42, 18.4], [45, 19]], at: [43, 16.5], lab: [42.5, 16.6] },
      { id: 'ra', kind: 'muscle', label: 'Rectus abdominis', short: 'RA', stri: 0, echo: 0.15, bottom: [[0, 12], [3, 17], [10, 21], [22, 22.5], [32, 21.5], [36, 18.6], [38.5, 14], [45, 13]], labelX: 18 },
      { id: 'prs', kind: 'aponeurosis', label: 'Posterior rectus sheath', short: 'PRS', smooth: false, bottom: [[0, 13.2], [3, 18.2], [10, 22.2], [22, 23.7], [32, 22.7], [36, 19.8], [39.5, 18], [41, 17], [45, 17]], at: [26, 23.2], lab: [25, 30.6] },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', echo: 0.11, dens: 0.4, smooth: false, bottom: [[0, 13], [36, 19], [38, 20.4], [41, 22], [45, 23]], at: [43, 21], lab: [42.5, 21.2] },
      { id: 'epf', kind: 'fat-deep', label: 'Extraperitoneal fat', nolabel: true, edge: 0, bottom: [[0, 14.6], [3, 19.6], [10, 23.6], [22, 25], [32, 24.2], [38, 22.8], [45, 24.2]] },
      { id: 'bowel', kind: 'bowel', label: 'Bowel', bottom: 44, labelX: 8 },
    ],
    lines: [
      { id: 'perit', kind: 'peritoneum', label: 'Peritoneum', short: 'Perit.', pts: [[0, 14.6], [3, 19.6], [10, 23.6], [22, 25], [32, 24.2], [38, 22.8], [45, 24.2]], at: [36, 23.35], lab: [36, 28.6] },
    ],
    shapes: [
      { id: 'la', kind: 'aponeurosis', label: 'Linea alba', short: 'LA', shape: PS([0, 9.4], [2.2, 9.6], [2.6, 14.6], [0, 14.6]), at: [1.2, 11], lab: [6, 4.6] },
      { id: 'lsl', kind: 'fascia', label: 'Linea semilunaris', short: 'LS', shape: L(0.45, [37.2, 11], [38.6, 17.5]), at: [37.8, 13.5], lab: [33, 4.6] },
      { id: 'iea', kind: 'artery', label: 'Inferior epigastric artery', short: 'IEA', shape: E(29.6, 21.4, 0.85, 0.8), lab: [36.5, 32.6] },
      { id: 'iev', kind: 'vein', label: 'Inferior epigastric veins', short: 'IEV', nolabel: true, shape: [E(27.9, 21.6, 0.7, 0.55), E(31.3, 21.2, 0.7, 0.55)] },
    ],
    target: { at: [17, 22.6], r: 2 },
    injections: [
      { id: 'rsb', label: 'Behind rectus', entry: [62, -2], tip: [17, 22.6], spread: { along: 'ra', x0: 5, x1: 30, thick: 3.6, up: 0.85, above: 8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse, just lateral to the umbilicus</strong>. Find the oval rectus muscle inside its sheath; the linea alba is medial and the linea semilunaris lateral.</p>',
      identify: '<p>Rectus abdominis, the bright <strong>posterior rectus sheath</strong> under it, then peritoneum. Laterally EO, IO and TA converge at the linea semilunaris. Check with colour Doppler for the <strong>inferior epigastric vessels</strong> on the back of rectus.</p>',
      needle: '<p>In-plane, <strong>lateral to medial</strong>. Pass through rectus to its posterior surface, just above the posterior sheath. Keep the tip in view: the peritoneum and bowel are only a few millimetres deeper.</p>',
      inject: '<p>Hydrodissect the <strong>potential space between rectus and the posterior rectus sheath</strong>: the muscle lifts off the sheath and the fluid spreads medially and laterally. Repeat on the other side for a midline wound.</p>',
    },
    probe: { view: 'front', x: 68, y: 188, angle: 0, label: 'transverse, just lateral to the umbilicus.' },
  },

  // Right flank, transverse above the iliac crest, curvilinear probe: the "shamrock" view at L4.
  // EO, IO and TA taper to zero at the lateral border of QL (x ≈ 44–48), leaving latissimus dorsi posteriorly.
  // The L4 transverse process runs from the vertebral body out to its tip, which touches QL.
  ql: {
    id: 'aw-ql', title: 'Quadratus lumborum: transverse flank view at L4 (shamrock)', width: 90, depth: 86, focus: 48, skin: 1.6, psf: 2.2, pxmm: 8, att: 0.006,
    view: 'Curvilinear probe transverse on the right flank above the iliac crest, beam aimed medially. Patient lateral, right side up. The L4 transverse process is the stem; psoas, quadratus lumborum and erector spinae are the three leaves.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'left' },
    injectionLabel: 'QL block type',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 10], [45, 11], [90, 13]], labelX: 14 },
      { id: 'eo', kind: 'muscle', label: 'External oblique', short: 'EO', smooth: false, bottom: [[0, 17], [22, 17.2], [30, 16.3], [36, 14.6], [41, 12.3], [44, 11.2], [90, 11]], labelX: 14 },
      { id: 'ld', kind: 'muscle', label: 'Latissimus dorsi', short: 'LD', smooth: false, bottom: [[0, 10], [36, 10.6], [42, 12], [50, 15.5], [60, 19], [75, 21], [90, 22]], labelX: 78 },
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', smooth: false, bottom: [[0, 27], [24, 27], [32, 25.5], [38, 22.5], [43, 18], [47, 14.5], [90, 14]], labelX: 14 },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', echo: 0.11, smooth: false, bottom: [[0, 33], [24, 33], [32, 31.5], [38, 28], [43, 22], [48, 15.5], [90, 15]], labelX: 14 },
      { id: 'rp', kind: 'fat-deep', label: 'Retroperitoneal fat', short: 'RP fat', echo: 0.42, edge: 0.7, bottom: 100, at: [22, 37.5], lab: [18, 37.5] },
    ],
    shapes: [
      { id: 'bowel', kind: 'bowel', label: 'Bowel', shape: P([0, 42], [16, 40], [26, 47], [27, 60], [20, 72], [0, 76]), lab: [9, 58] },
      { id: 'ql', kind: 'muscle', label: 'Quadratus lumborum', short: 'QL', echo: 0.11, stri: 20, shape: P([38, 41], [44, 35.5], [54, 33.8], [62, 36], [66.5, 43], [64, 51.5], [55, 55.5], [45, 54], [39, 49]), lab: [52, 44.5] },
      { id: 'pm', kind: 'muscle', label: 'Psoas major', short: 'PM', echo: 0.11, stri: 70, shape: P([30, 60], [37, 56], [47, 57.5], [53, 62], [52, 71], [45, 77], [35, 76], [28, 69]), lab: [40, 67] },
      { id: 'esm', kind: 'muscle', label: 'Erector spinae', short: 'ESM', echo: 0.13, stri: 10, shape: P([65, 53], [71, 45.5], [80, 43], [90, 44], [90, 73], [78, 75], [68, 69], [62, 61]), lab: [78, 60] },
      { id: 'tap-apo', kind: 'fascia', label: 'Transversus abdominis aponeurosis', short: 'TA apon.', shape: L(0.45, [47.5, 15.6], [45, 22], [42.5, 29], [40.2, 35], [38.6, 39.5]), at: [42.5, 29], lab: [31, 46] },
      { id: 'tlf', kind: 'fascia', label: 'Thoracolumbar fascia (middle layer)', short: 'TLF', shape: L(0.5, [57, 23], [62, 31], [66, 38.5], [67.5, 45], [64.5, 52], [59.5, 55.5]), at: [66, 38.5], lab: [74, 33] },
      { id: 'tp', kind: 'bone', label: 'L4 transverse process', short: 'TP', shape: L(1.8, [58.8, 55.4], [59.2, 62], [59.8, 70], [60.6, 78.4]), at: [59.4, 66], lab: [70, 82] },
      { id: 'vb', kind: 'bone', label: 'Vertebral body', short: 'VB', shape: L(1.6, [30, 84.5], [40, 81], [50, 79], [60.6, 78.4]), at: [42, 80.5], lab: [26, 80.5] },
    ],
    injections: [
      {
        id: 'ql1', label: 'Type 1 (lateral)', entry: [-22, -8], tip: [39.5, 40.5], target: { at: [39.5, 40.5], r: 2.6 },
        spread: { along: [[30, 36], [39.5, 40.5], [46, 47]], x0: 28, x1: 47, thick: 4.5, up: 0.5, above: 6 },
        steps: {
          needle: '<p><strong>Type 1 (lateral):</strong> in-plane from anterior. The tip goes to the <strong>anterolateral border of QL</strong>, deep to the aponeurosis of transversus abdominis, where it meets the transversalis fascia.</p>',
          inject: '<p>LA collects at the lateral edge of QL and tends to spread <strong>laterally into the TAP plane</strong> (T10–T12 territory).</p>',
        },
      },
      {
        id: 'ql2', label: 'Type 2 (posterior)', entry: [-12, -14], tip: [65.5, 40.5], target: { at: [65.5, 40.5], r: 2.6 },
        spread: { along: [[60, 35], [65.5, 40.5], [67.5, 50]], x0: 59, x1: 68, thick: 4, up: 0.35, above: 6 },
        steps: {
          needle: '<p><strong>Type 2 (posterior):</strong> the tip goes to the <strong>posterior surface of QL</strong>, between QL and the erector spinae / latissimus dorsi, in the middle layer of the thoracolumbar fascia.</p>',
          inject: '<p>LA spreads along the back of QL within the thoracolumbar fascia, which may carry it towards the paravertebral space.</p>',
        },
      },
      {
        id: 'ql3', label: 'Type 3 (transmuscular)', entry: [112, 0], tip: [46.5, 55.6], target: { at: [46.5, 55.6], r: 2.6 },
        spread: { along: [[37, 53], [46.5, 55.6], [54, 58]], x0: 36, x1: 54, thick: 4.5, up: 0.5, above: 6 },
        steps: {
          needle: '<p><strong>Type 3 (transmuscular, anterior):</strong> in-plane from <strong>posterior</strong>, through QL, to the <strong>plane between QL and psoas</strong> next to the transverse process tip.</p>',
          inject: '<p>LA separates QL from psoas. It can reach the paravertebral space, and also the lumbar plexus: <strong>warn about leg weakness</strong>.</p>',
        },
      },
    ],
    steps: {
      scan: '<p>Curvilinear probe <strong>transverse on the flank above the iliac crest</strong>. Follow EO, IO and TA posteriorly until they taper into the aponeurosis at the lateral edge of QL, then tilt to find the transverse process.</p>',
      identify: '<p>The <strong>shamrock</strong>: the L4 transverse process is the stem, with <strong>psoas</strong> anterior, <strong>erector spinae</strong> posterior and <strong>quadratus lumborum</strong> at its tip. Choose the injection point (type 1, 2 or 3) above.</p>',
      needle: '<p>Choose a type above to see its needle path.</p>',
      inject: '<p>Choose a type above to see its spread.</p>',
    },
    probe: { view: 'back', x: 128, y: 214, angle: 0, label: 'transverse on the flank, above the iliac crest (patient lateral, right side up).' },
  },

  // Oblique on the line from ASIS to umbilicus, just medial to the right ASIS.
  iih: {
    id: 'aw-iih', title: 'Ilioinguinal and iliohypogastric: view beside the ASIS', width: 40, depth: 34, focus: 18, skin: 1.2,
    view: 'Oblique view on the line from the anterior superior iliac spine (ASIS) to the umbilicus, just medial to the right ASIS. Bone at the lateral (right) edge.',
    orient: { left: 'Medial (umbilicus)', right: 'Lateral (ASIS)', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7], [40, 6]], labelX: 8 },
      { id: 'eo', kind: 'muscle', label: 'External oblique', short: 'EO', echo: 0.2, bottom: [[0, 9.6], [40, 8.8]], labelX: 8 },
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', stri: 6, bottom: [[0, 17], [25, 17.4], [40, 15.8]], labelX: 8 },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', echo: 0.11, dens: 0.4, bottom: [[0, 22], [25, 22.4], [31, 21.4], [35, 20], [40, 18.8]], labelX: 8 },
      { id: 'epf', kind: 'fat-deep', label: 'Extraperitoneal fat', nolabel: true, edge: 0, bottom: [[0, 23.4], [25, 23.9], [31, 23.2], [40, 22]] },
      { id: 'bowel', kind: 'bowel', label: 'Bowel', bottom: 44, labelX: 9 },
    ],
    lines: [
      { id: 'perit', kind: 'peritoneum', label: 'Peritoneum', nolabel: true, pts: [[0, 23.4], [25, 23.9], [30, 23.4]] },
    ],
    shapes: [
      { id: 'ilium', kind: 'bone', label: 'Iliac crest near the ASIS', short: 'ASIS', shape: PS([31, 26.5], [33.5, 23.2], [36.5, 21.4], [40, 20.6], [40, 36], [31, 36]), at: [36.5, 21.6], lab: [35, 30] },
      { id: 'ih', kind: 'nerve', label: 'Iliohypogastric nerve', short: 'IH', shape: E(18, 17.5, 1.1, 0.7), lab: [13, 28] },
      { id: 'ii', kind: 'nerve', label: 'Ilioinguinal nerve', short: 'II', shape: E(24.2, 17.8, 1.0, 0.65), lab: [24, 30.6] },
      { id: 'dcia', kind: 'artery', label: 'Deep circumflex iliac artery', short: 'DCIA', shape: E(28.6, 17.4, 0.75, 0.75), lab: [29, 12.4] },
    ],
    target: { at: [21, 17.6], r: 2.2 },
    injections: [
      { id: 'iih', label: 'IO–TA plane', entry: [-14, 0], tip: [21, 17.6], spread: { along: 'io', x0: 12, x1: 31, thick: 3, up: 0.4, above: 6 } },
    ],
    steps: {
      scan: '<p>Probe on the <strong>line from the ASIS to the umbilicus</strong>, with its lateral end on the ASIS. Find the bright bony line of the ilium with its shadow.</p>',
      identify: '<p>Next to the bone: EO, IO and TA. The <strong>iliohypogastric and ilioinguinal nerves</strong> are small oval structures in the <strong>plane between IO and TA</strong>, close to the bone. The deep circumflex iliac artery often runs nearby: use colour Doppler.</p>',
      needle: '<p>In-plane, <strong>medial to lateral</strong>, towards the bone. Place the tip in the IO–TA plane beside the nerves, not into them.</p>',
      inject: '<p>Hydrodissect the IO–TA plane so the LA surrounds both nerves. Aspirate first and keep the volume small.</p>',
    },
    probe: { view: 'front', x: 58, y: 226, angle: -54, label: 'oblique, on the line from the right ASIS towards the umbilicus, just medial to the ASIS.' },
  },
};
