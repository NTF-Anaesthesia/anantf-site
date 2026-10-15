// Thigh page: ultrasound scenes for the proximal sciatic approaches and the posterior femoral cutaneous nerve
// (millimetres; x across the screen from the left, y = depth from the skin). Schema: ../../../shared/regional/DATA.md
// ("Scene schema"). Geometry is original, laid out from typical adult depths and sizes (slim to average build, right
// leg); nothing is traced from published images. These are curvilinear-probe views (coarser speckle, deeper field).
// In every view the needle enters from screen right, the probe marker is on the needle side, and both ends of the
// image are named.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { legProbeInset } from '../../../shared/regional/js/figures/leg.js';

const ring = (cx, cy, rx, ry, n = 28) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return [+(cx + rx * Math.cos(a)).toFixed(2), +(cy + ry * Math.sin(a)).toFixed(2)];
});
// A nerve drawn as fascicles (hypoechoic dots) inside a bright epineurium. The proximal sciatic nerve is a broad,
// flattened oval: brighter overall than the popliteal nerves (more connective tissue, seen with a low-frequency probe).
function nerve(id, label, short, cx, cy, rx, ry, opts = {}) {
  const n = opts.n ?? 5;
  const fasc = [];
  const k = [[-0.62, -0.1], [-0.3, -0.38], [0.05, -0.32], [0.38, -0.28], [0.66, 0.02], [-0.42, 0.34], [-0.05, 0.22], [0.3, 0.38], [0.02, -0.02], [0.5, -0.02], [-0.7, 0.2], [-0.22, -0.02]];
  for (let i = 0; i < n; i++) {
    const [fx, fy] = k[i % k.length];
    const fr = opts.fr ?? 0.16;
    fasc.push(E(+(cx + fx * rx).toFixed(2), +(cy + fy * ry).toFixed(2), +(rx * fr).toFixed(2), +(ry * 0.26).toFixed(2), (i * 41) % 50 - 25));
  }
  return [
    { id: `${id}-epi`, kind: opts.epiKind || 'connective', label: 'Epineurium', nolabel: true, echo: opts.echo ?? 0.82, shape: E(cx, cy, rx, ry, opts.rot || 0) },
    { id: `${id}-rim`, kind: 'membrane', label: 'Epineurium', nolabel: true, amp: 0.8, shape: L(Math.max(0.3, ry * 0.11), ...ring(cx, cy, rx, ry, 28)) },
    { id, kind: 'nerve', label, short, ...(opts.ids ? { ids: opts.ids } : {}), ...(opts.desc ? { desc: opts.desc } : {}), shape: fasc, at: opts.at || [cx, cy], lab: opts.lab },
  ];
}

export const SCENES = {
  // ------------------------------------------------------------------ subgluteal sciatic (main viewer)
  // Right leg, patient lateral (block side up, hips and knees flexed) or prone. Probe transverse at the gluteal crease,
  // midway between the ischial tuberosity and the greater trochanter. Medial on the left, lateral on the right; needle
  // from lateral.
  subgluteal: {
    id: 'll-th-sg', title: 'Subgluteal sciatic: transverse view at the gluteal crease', width: 76, depth: 66, focus: 38, skin: 1.8,
    psf: 2, pxmm: 9, att: 0.011, gain: 1.05,
    view: 'Transverse view of the back of the right upper thigh at the gluteal crease, with a curvilinear probe. Medial on the left, lateral on the right. The sciatic nerve is a broad, flat, bright oval in the plane under gluteus maximus, lying on quadratus femoris and adductor magnus, between the ischial tuberosity (medial) and the femur (lateral). The posterior femoral cutaneous nerve is a small oval just superficial to it (here slightly lateral; its side varies at this level), on the other side of a thin fascia.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'right' },
    injectionLabel: 'Choose the injection',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 13], [38, 14.2], [76, 12.2]], edge: 0.6, at: [56, 7.4], lab: [56, 7.4] },
      { id: 'gm', kind: 'muscle', label: 'Gluteus maximus', short: 'Glut max', desc: 'Gluteus maximus; the subgluteal space is the plane under it.', bottom: [[0, 29.6], [20, 30.4], [30, 30.4], [38, 30.8], [46, 30.9], [56, 32.4], [76, 30.4]], smooth: true, echo: 0.15, stri: -10, dens: 0.5, edge: 0.95, edgeW: 0.55, at: [58, 22], lab: [62, 18.6] },
      { id: 'am', kind: 'muscle', label: 'Adductor magnus', short: 'Add magnus', desc: 'Adductor magnus, just below quadratus femoris.', bottom: 80, echo: 0.13, stri: 4, dens: 0.4, edge: 0, at: [44, 58], lab: [44, 59.5] },
    ],
    lines: [
      { id: 'dif', kind: 'fascia', label: 'Deep investing fascia', short: 'Fascia', nolabel: true, amp: 0.7, w: 0.4, pts: [[14, 33.6], [22, 33.1], [30, 33], [38, 33.2], [46, 33.3], [54, 34.2]] },
    ],
    shapes: [
      { id: 'ham', kind: 'aponeurosis', label: 'Hamstring origin (long head of biceps femoris and semitendinosus)', short: 'Hamstrings', desc: 'The hamstring origin, medially, from the ischial tuberosity.', shape: P([0, 31], [9, 31.2], [16, 33.6], [17, 38.4], [10, 41.4], [0, 41.6]), at: [7, 36], lab: [7, 19] },
      { id: 'qf', kind: 'muscle', label: 'Quadratus femoris', short: 'QF', desc: 'Quadratus femoris: the sciatic nerve lies on it.', stri: 0, echo: 0.12, dens: 0.35, shape: P([15, 41.6], [30, 40.8], [48, 40.6], [62, 41], [66, 45.4], [60, 50], [30, 50.6], [16, 48.6]), at: [36, 46], lab: [26, 46.4] },
      { id: 'it', kind: 'bone', label: 'Ischial tuberosity', short: 'Ischium', desc: 'The ischial tuberosity, medially.', shape: L(1.5, [0, 44.6], [5, 42.8], [10, 43.4], [14, 46.4], [15.4, 50]), at: [5, 43], lab: [7.4, 52.8] },
      { id: 'fem', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur, laterally.', shape: L(1.6, [62.4, 47], [65.6, 43.4], [70, 42], [76, 42.2]), at: [70, 42], lab: [63, 54] },
      { id: 'iga', kind: 'artery', label: 'Artery to the sciatic nerve (inferior gluteal)', short: 'Artery', nolabel: true, shape: E(28.6, 36.6, 0.95, 0.9) },
      ...nerve('pfcn', 'Posterior femoral cutaneous nerve', 'PFCN', 43.4, 32.1, 1.7, 0.95, { n: 2, fr: 0.24, echo: 0.8, epiKind: 'aponeurosis', lab: [45, 25.4], at: [43.4, 32.1], ids: ['sacral:n-pfcn'], desc: 'The posterior femoral cutaneous nerve: a small dot superficial to the sciatic nerve.' }),
      ...nerve('sn', 'Sciatic nerve', 'Sciatic', 38.4, 36.7, 8.2, 3.05, { n: 7, fr: 0.12, echo: 0.72, epiKind: 'aponeurosis', rot: -3, lab: [26, 27], at: [36, 36.2], ids: ['sacral:n-sciatic'], desc: 'The sciatic nerve: a broad, flat, bright oval or triangle, much wider than it is deep, on quadratus femoris.' }),
    ],
    target: { at: [46.6, 38.4], r: 2.2 },
    injections: [
      { id: 'deep', label: 'Under the nerve first', entry: [94, 15.4], tip: [46.8, 38.8],
        pop: { label: 'Pop: through the fascia under gluteus maximus', plane: 'gm', tent: 1.2, width: 7 },
        spread: { along: [[26, 40.6], [33, 40.9], [40, 40.8], [48, 40.4], [54, 40.6]], x0: 26, x1: 53, from: 39.5, thick: 4.6, up: 0.92, above: 10, shape: 1.1 },
        steps: {
          needle: '<p><strong>In-plane, lateral to medial</strong>, from the lateral end of the probe. Through gluteus maximus; the fascia under it tents, then gives. Aim for the <strong>lateral corner of the nerve, just under it</strong>, on quadratus femoris. A foot twitch at about 0.5 mA confirms you are close; a twitch below about 0.2 mA means the tip may be touching or inside the nerve: back off a millimetre.</p>',
          inject: '<p>Aspirate, then 2–3 ml: the fluid should <strong>lift the nerve off quadratus femoris</strong>. The flat oval floats up and its outline sharpens. Then the rest of the first half, aspirating every 5 ml.</p>',
        } },
      { id: 'above', label: 'Then above it: wrap the nerve', entry: [94, 13], tip: [47.2, 34.6], keep: ['deep'],
        spread: { along: [[27, 33.8], [34, 33.3], [40, 33.1], [47, 33.6], [54, 34.6]], x0: 28.6, x1: 53, from: 40.8, thick: 3, up: 0.55, above: 7, shape: 1.1 },
        steps: {
          needle: '<p>Pull back a little and redirect the tip <strong>over the top of the nerve</strong>, still under the deep fascia. The fluid already under the nerve stays in view.</p>',
          inject: '<p>The rest of the volume: the nerve is now <strong>outlined all round</strong>, a dark ring on a bright oval. In a randomised trial, deliberately wrapping the nerve with more than one needle position gave complete block more often than one injection along its back surface.</p>',
        } },
      { id: 'pfcn', label: 'Posterior femoral cutaneous (a separate injection)', entry: [94, 12.4], tip: [45.6, 32],
        target: { at: [43.4, 32.1], r: 1.8 },
        spread: { along: [[32, 32.6], [38, 32.4], [43, 32.3], [48, 32.5], [55, 33.4]], x0: 33, x1: 54, from: 44, thick: 3, up: 0.75, above: 6, shape: 0.9 },
        steps: {
          needle: '<p>The <strong>posterior femoral cutaneous nerve</strong> runs just under gluteus maximus, <strong>superficial to the sciatic nerve</strong> and separated from it by a thin fascia. At the gluteal crease it is often slightly lateral, but its side varies: look along the whole superficial surface of the sciatic nerve. Bring the tip in shallower, above the fascia, to the small oval.</p>',
          inject: '<p><strong>5–10 ml</strong>: a lens of fluid around the small nerve, between gluteus maximus and the fascia, sparing the sciatic nerve below. Fluid given around the sciatic nerve often does not cross this fascia, which is why a subgluteal sciatic block can leave the back of the thigh sensate.</p>',
        } },
    ],
    steps: {
      scan: '<p>Patient <strong>lateral, block side up</strong>, hips and knees flexed (or prone). <strong>Curvilinear probe, transverse at the gluteal crease</strong>, between the two bony landmarks: the <strong>ischial tuberosity</strong> medially and the <strong>femur</strong> laterally. Depth 6–8 cm to start. Lost? Start in the popliteal fossa and <strong>trace the nerve up</strong>.</p>',
      identify: '<p><strong>Gluteus maximus</strong> superficial, its deep fascia a bright line. Under it, on <strong>quadratus femoris</strong> (or adductor magnus just below), lies the <strong>sciatic nerve</strong>: a broad, flat, bright oval or triangle, much wider than it is deep. Tilt the probe to make it pop out, and ask the patient to move the foot: the nerve shifts. The hamstring tendons arise medially from the ischium.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong> with a 100 mm echogenic needle (150 mm in the obese). The plane is steep: enter 1–2 cm lateral to the probe. Keep the tip <strong>outside the nerve</strong>: low current, low pressure, no paraesthesia.</p>',
      inject: '<p>Watch the fluid <strong>surround the nerve in the subgluteal plane</strong>. 20 ml of 0.5% ropivacaine in 5 ml aliquots, aspirating between. A nerve that <strong>swells</strong> instead of floating means the tip is inside it: stop and reposition.</p>',
    },
    probe: { view: 'back', at: [94, 124], angle: 0, marker: 'right', label: 'transverse at the gluteal crease, midway between the ischial tuberosity and the greater trochanter.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ transgluteal sciatic
  // Probe transverse on the buttock between the ischial tuberosity and the greater trochanter. Medial on the left,
  // lateral on the right; needle from lateral.
  transgluteal: {
    id: 'll-th-tg', title: 'Transgluteal sciatic: between the ischial tuberosity and the greater trochanter', width: 80, depth: 76, focus: 44, skin: 2,
    psf: 2.1, pxmm: 8, att: 0.011, gain: 1.08,
    view: 'Transverse view of the right buttock on the line from the ischial tuberosity to the greater trochanter, curvilinear probe. Medial on the left, lateral on the right. Under the thick gluteus maximus, the sciatic nerve lies on quadratus femoris between the two bones, with the inferior gluteal vessels and the posterior femoral cutaneous nerve on its medial side.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 13.6], [40, 15], [80, 13.4]], edge: 0.6, at: [62, 8], lab: [62, 8] },
      { id: 'gm', kind: 'muscle', label: 'Gluteus maximus', short: 'Glut max', desc: 'The thick gluteus maximus; the subgluteal space is the plane under it.', bottom: [[0, 40], [22, 42.4], [40, 44], [60, 43.2], [80, 40.4]], smooth: true, echo: 0.15, stri: -14, dens: 0.55, edge: 0.95, edgeW: 0.6, at: [56, 28], lab: [56, 28] },
      { id: 'deep', kind: 'muscle', label: 'Obturator internus and gemelli', short: 'OI', nolabel: true, bottom: 90, echo: 0.11, stri: 6, dens: 0.3, edge: 0 },
    ],
    lines: [],
    shapes: [
      { id: 'qf', kind: 'muscle', label: 'Quadratus femoris', short: 'QF', desc: 'Quadratus femoris: the sciatic nerve lies on it.', stri: 0, echo: 0.12, dens: 0.35, shape: P([16, 48.6], [34, 48.4], [52, 48], [64, 49.2], [66, 55], [56, 60], [32, 60.6], [17, 57]), at: [40, 54], lab: [30, 55] },
      { id: 'it', kind: 'bone', label: 'Ischial tuberosity', short: 'Ischium', desc: 'The ischial tuberosity, medially: the nerve lies nearer it.', shape: L(1.6, [0, 49], [6, 46.6], [12, 47], [16.4, 50.6], [17.6, 56]), at: [6, 46.6], lab: [8, 61] },
      { id: 'gt', kind: 'bone', label: 'Greater trochanter', short: 'Trochanter', desc: 'The greater trochanter, laterally.', shape: L(1.7, [64.8, 54], [67, 48.6], [71, 45.6], [76, 44.6], [80, 45]), at: [72, 45.4], lab: [64, 66] },
      { id: 'iga', kind: 'artery', label: 'Inferior gluteal artery', short: 'IGA', desc: 'The inferior gluteal artery, medial to the sciatic nerve (colour Doppler).', shape: E(31.2, 45.8, 1.25, 1.15), at: [31.2, 45.8], lab: [30, 35.6] },
      ...nerve('pfcn', 'Posterior femoral cutaneous nerve', 'PFCN', 26.2, 45.2, 1.9, 1.15, { n: 3, fr: 0.26, echo: 0.7, lab: [10, 39], ids: ['sacral:n-pfcn'], desc: 'The posterior femoral cutaneous nerve runs with the artery, still close to the sciatic nerve at this level.' }),
      ...nerve('sn', 'Sciatic nerve', 'Sciatic', 42.4, 46.2, 8.6, 3.2, { n: 11, rot: -2, lab: [55, 37.6], at: [43, 45.4], ids: ['sacral:n-sciatic'], desc: 'The sciatic nerve: a bright flat oval in the subgluteal space, nearer the ischium.' }),
    ],
    target: { at: [51.6, 46.4], r: 2.2 },
    injections: [
      { id: 'tg', label: 'Lateral edge of the nerve, under gluteus maximus', entry: [98, 22], tip: [51.8, 46.6],
        pop: { label: 'Pop: through the fascia under gluteus maximus', plane: 'gm', tent: 1.4, width: 8 },
        spread: { along: [[20, 43.6], [30, 43.9], [42, 44], [52, 43.8], [60, 43.4]], x0: 21, x1: 58, from: 39.5, thick: 3.6, up: 0.75, above: 12, shape: 1 },
        spreads: [{ along: [[34, 50.2], [42, 50.6], [50, 50.2]], from: 43.0, x0: 35, x1: 51, thick: 1.6, up: 0.85, above: 5, shape: 1 }] },
    ],
    steps: {
      scan: '<p>Lateral, block side up, hips and knees flexed. <strong>Curvilinear probe, transverse on the buttock</strong>, on the line from the <strong>ischial tuberosity</strong> to the <strong>greater trochanter</strong>. Find both bones (bright lines with black shadows); the nerve lies between them. Depth 7–9 cm.</p>',
      identify: '<p>Under the thick <strong>gluteus maximus</strong>, in the <strong>subgluteal space</strong> on <strong>quadratus femoris</strong>: the sciatic nerve, a bright flat oval nearer the ischium. Colour Doppler shows the <strong>inferior gluteal artery</strong> medial to it; the <strong>posterior femoral cutaneous nerve</strong> runs with the artery, still close to the sciatic nerve at this level.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, 100–150 mm needle. The tip gives through the fascia under gluteus maximus and stops at the <strong>lateral edge of the nerve</strong>. A twitch of the calf or foot confirms it; a twitch of gluteus maximus alone means you are still in the muscle.</p>',
      inject: '<p>The fluid opens the <strong>subgluteal space</strong>, lifting gluteus maximus and spreading medially <strong>over the posterior femoral cutaneous nerve</strong> and the artery, and round the sciatic nerve. 20 ml of 0.5% ropivacaine in 5 ml aliquots. One injection here often blocks both nerves, more often than at the gluteal crease.</p>',
    },
    probe: { view: 'back', at: [98, 100], angle: -6, marker: 'right', label: 'transverse on the buttock, on the line from the ischial tuberosity to the greater trochanter.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ anterior sciatic
  // Patient supine, thigh abducted and externally rotated. Probe transverse on the anteromedial thigh at about the level
  // of the lesser trochanter. Lateral (femur) on the left, medial on the right; needle from medial.
  anterior: {
    id: 'll-th-ant', title: 'Anterior sciatic: transverse view of the anteromedial thigh', width: 90, depth: 92, focus: 66, skin: 2,
    psf: 2.2, pxmm: 7, att: 0.0095, gain: 1.12,
    view: 'Transverse view of the anteromedial right thigh at about the level of the lesser trochanter, curvilinear probe, patient supine. Lateral (femur) on the left, medial on the right. From the front: sartorius over the femoral vessels, the adductors (longus, brevis, magnus) medially, the femur laterally, and the sciatic nerve deep, at 6–8 cm, behind adductor magnus and in front of the hamstrings.',
    orient: { left: 'Lateral', right: 'Medial', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 9.6], [45, 10.4], [90, 10]], edge: 0.55, nolabel: true },
      { id: 'vm', kind: 'muscle', label: 'Vastus medialis', short: 'VM', desc: 'Vastus medialis, over the femur laterally.', bottom: [[0, 34], [20, 30], [32, 18], [40, 10.4], [90, 10]], smooth: true, echo: 0.14, stri: 4, dens: 0.45, edge: 0.7, at: [12, 22], lab: [12, 22] },
      { id: 'al', kind: 'muscle', label: 'Adductor longus', short: 'Add longus', desc: 'Adductor longus: the needle passes through the adductors.', bottom: [[0, 34], [24, 32], [44, 28], [60, 26], [90, 27]], smooth: true, echo: 0.15, stri: -6, dens: 0.45, edge: 0.75, at: [72, 19], lab: [72, 19] },
      { id: 'ab', kind: 'muscle', label: 'Adductor brevis', short: 'Add brevis', desc: 'Adductor brevis, between longus and magnus.', bottom: [[0, 36], [26, 38], [46, 44], [64, 46], [90, 47]], smooth: true, echo: 0.13, stri: 6, dens: 0.4, edge: 0.75, at: [56, 40], lab: [56, 40] },
      { id: 'am', kind: 'muscle', label: 'Adductor magnus', short: 'Add magnus', desc: 'Adductor magnus: the sciatic nerve lies behind it.', bottom: [[0, 70], [30, 70.2], [44, 71.2], [60, 72], [90, 71]], smooth: true, echo: 0.14, stri: 2, dens: 0.45, edge: 0.9, edgeW: 0.5, at: [36, 59], lab: [36, 59] },
      { id: 'hams', kind: 'muscle', label: 'Hamstrings', short: 'Hamstrings', desc: 'The hamstrings, behind the sciatic nerve.', bottom: 110, echo: 0.12, stri: 0, dens: 0.35, edge: 0, at: [66, 84], lab: [66, 85] },
    ],
    lines: [],
    shapes: [
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius, over the femoral vessels.', stri: 0, echo: 0.16, shape: P([28, 11], [42, 10.6], [50, 12.4], [48, 18.4], [38, 20], [29, 17.4]), at: [39, 15], lab: [39, 15] },
      { id: 'sfa', kind: 'artery', label: 'Femoral artery', short: 'FA', desc: 'The femoral artery under sartorius: keep the needle medial to the femoral vessels.', shape: E(40.6, 23.4, 3, 2.9), at: [40.6, 22], lab: [47, 3.4] },
      { id: 'sfv', kind: 'vein', label: 'Femoral vein', short: 'FV', desc: 'The femoral vein: keep the needle medial to the femoral vessels.', shape: E(45.4, 27.8, 3.6, 2.7), at: [46.6, 28.2], lab: [58, 31] },
      { id: 'pfa', kind: 'artery', label: 'Deep artery of the thigh (profunda)', short: 'Profunda', desc: 'The profunda, deeper and nearer the femur.', shape: E(33.2, 35.2, 2.3, 2.2), at: [33.2, 35.2], lab: [30, 43.6] },
      { id: 'fem', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur: a bright curve laterally.', shape: L(1.8, [0, 42], [6, 39.2], [12, 38.4], [18, 39.4], [23, 42.6], [25, 47]), at: [11, 38.4], lab: [12, 50] },
      ...nerve('sn', 'Sciatic nerve', 'Sciatic', 40.6, 75.2, 8.4, 3.5, { n: 11, rot: 2, lab: [24, 86.6], at: [38, 76], ids: ['sacral:n-sciatic'], desc: 'The sciatic nerve: a flat bright oval behind adductor magnus, 6–8 cm deep.' }),
    ],
    target: { at: [49.4, 75.2], r: 2.4 },
    injections: [
      { id: 'ant', label: 'Beside the nerve, under adductor magnus', entry: [104, 3], tip: [49.6, 74.4],
        pop: { label: 'Pop: through the fascia behind adductor magnus', plane: 'am', tent: 1.4, width: 7 },
        spread: { along: [[29, 79.2], [36, 79.6], [44, 79.4], [52, 78.6]], x0: 30, x1: 52, from: 41.0, thick: 3.2, up: 0.9, above: 10, shape: 1.05 },
        spreads: [{ along: [[30, 71.4], [40, 71.6], [50, 72.2]], from: 41.3, x0: 31, x1: 51.6, thick: 2, up: 0.4, above: 6, shape: 1.05 }] },
    ],
    steps: {
      scan: '<p><strong>Supine</strong>, thigh slightly abducted and externally rotated (if it can be moved). <strong>Curvilinear probe</strong>, transverse on the <strong>anteromedial thigh</strong>, about 8 cm below the inguinal crease (the level of the lesser trochanter). Depth 9–10 cm.</p>',
      identify: '<p>Find the <strong>femoral artery</strong> under sartorius, and the <strong>profunda</strong> deeper and nearer the femur. Medially: adductor longus, brevis and <strong>magnus</strong>. The femur is a bright curve laterally. The <strong>sciatic nerve</strong> is a flat bright oval <strong>behind adductor magnus</strong>, 6–8 cm deep. Ask for foot movement, or tilt the probe, to see it shift.</p>',
      needle: '<p>A <strong>long, steep</strong> path: 120–150 mm needle, <strong>in-plane from medial</strong> (or out-of-plane), through the adductors, <strong>medial to the femoral vessels</strong>. Use the stimulator: the foot should twitch before you touch the nerve. Hard to see at this angle: go slowly.</p>',
      inject: '<p>The fluid separates the nerve from <strong>adductor magnus</strong> in front and the hamstrings behind. 20 ml of 0.5% ropivacaine in aliquots. This level is <strong>away from the posterior femoral cutaneous nerve</strong>, which runs separately under the fascia lata at the back of the thigh, so the back of the thigh stays sensate.</p>',
    },
    probe: { view: 'front', at: [116, 128], angle: 0, marker: 'right', label: 'transverse on the anteromedial thigh, about 8 cm below the inguinal crease (the level of the lesser trochanter).' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ parasacral (sacral plexus)
  // Parasacral parallel shift: probe parallel to the line from the PSIS to the greater trochanter, moved inferomedially
  // until the iliac bone line breaks at the greater sciatic notch, then tilted caudally. Medial (sacrum) on the left,
  // lateral (ischium) on the right; needle from lateral.
  parasacral: {
    id: 'll-th-ps', title: 'Parasacral: the sacral plexus at the greater sciatic notch', width: 80, depth: 80, focus: 52, skin: 2,
    psf: 2.2, pxmm: 8, att: 0.011, gain: 1.1,
    view: 'Oblique view of the right buttock, parallel to the line from the posterior superior iliac spine to the greater trochanter, at the greater sciatic notch, curvilinear probe. Medial on the left, lateral on the right. Under gluteus maximus and the triangular piriformis, the sacral plexus is a bright band between the sacrum (medial) and the ischium (lateral), with the inferior gluteal vessels beside it.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 12.4], [40, 13.6], [80, 13]], edge: 0.6, at: [60, 7.6], lab: [60, 7.6] },
      { id: 'gm', kind: 'muscle', label: 'Gluteus maximus', short: 'Glut max', desc: 'Gluteus maximus, over the triangular piriformis.', bottom: [[0, 34], [30, 36.2], [56, 37], [80, 35]], smooth: true, echo: 0.15, stri: -12, dens: 0.55, edge: 0.92, edgeW: 0.55, at: [60, 25], lab: [60, 25] },
      { id: 'pir', kind: 'muscle', label: 'Piriformis', short: 'Piriformis', desc: 'The triangular piriformis, over the sacral plexus.', bottom: [[0, 49.6], [20, 51.4], [40, 51.6], [60, 47], [80, 41.6]], smooth: true, echo: 0.12, stri: 18, dens: 0.45, edge: 0.9, edgeW: 0.5, at: [24, 44.6], lab: [24, 44.6] },
      { id: 'pelv', kind: 'connective', label: 'Pelvic fat', short: 'Pelvis', nolabel: true, bottom: 100, echo: 0.24, edge: 0 },
    ],
    lines: [],
    shapes: [
      { id: 'sac', kind: 'bone', label: 'Sacrum', short: 'Sacrum', desc: 'The sacrum, medial to the plexus.', shape: L(1.7, [0, 47.4], [5, 47.6], [10, 49], [14.4, 52.6]), at: [5, 47.6], lab: [7, 61] },
      { id: 'isc', kind: 'bone', label: 'Ischium', short: 'Ischium', desc: 'The ischium, lateral to the plexus.', shape: L(1.7, [52, 66], [58, 61.4], [64, 59.2], [72, 58.4], [80, 58.6]), at: [66, 59], lab: [68, 68] },
      { id: 'iga', kind: 'artery', label: 'Inferior gluteal artery', short: 'IGA', desc: 'The gluteal vessels leave the pelvis here too: colour Doppler first.', shape: E(45.2, 52.8, 1.3, 1.25), at: [45.2, 52.8], lab: [44, 70] },
      ...nerve('sp', 'Sacral plexus', 'Plexus', 31.4, 56.2, 8.6, 3.6, { n: 8, echo: 0.95, fr: 0.13, rot: 8, lab: [22, 72.4], at: [30, 57], desc: 'The sacral plexus: a bright band between the sacrum (medial) and the ischium (lateral).' }),
    ],
    target: { at: [40.6, 55.4], r: 2.2 },
    injections: [
      { id: 'ps', label: 'Beneath piriformis, beside the plexus', entry: [96, 18], tip: [40.8, 55.6],
        pop: { label: 'Give: through the fascia under piriformis', plane: 'pir', tent: 1.2, width: 7 },
        spread: { along: [[18, 52.8], [26, 52.8], [34, 52.6], [42, 52.2], [48, 51.2]], x0: 19, x1: 47.4, from: 33.2, thick: 3.2, up: 0.55, above: 8, shape: 1 },
        spreads: [{ along: [[22, 60.2], [31, 60.6], [40, 59.8]], from: 32.0, x0: 23, x1: 41, thick: 1.8, up: 0.9, above: 5, shape: 1 }] },
    ],
    steps: {
      scan: '<p>Lateral, block side up. <strong>Curvilinear probe</strong> on the line from the <strong>posterior superior iliac spine</strong> to the <strong>greater trochanter</strong>, starting near the spine: the <strong>ilium</strong> is a continuous bright line. <strong>Slide the probe inferomedially</strong>, parallel to that line, until the bone line <strong>breaks</strong>: the greater sciatic notch. Tilt slightly caudally.</p>',
      identify: '<p>Under gluteus maximus and the <strong>triangular piriformis</strong>: the <strong>sacral plexus</strong>, a bright band between the <strong>sacrum</strong> (medial) and the <strong>ischium</strong> (lateral). Colour Doppler first: the <strong>gluteal vessels</strong> leave the pelvis here too.</p>',
      needle: '<p><strong>In-plane from the lateral end</strong>, 100–150 mm needle, through gluteus maximus and piriformis. A foot or calf twitch at about 0.5 mA confirms the plexus. Stay out of the pelvis: the tip should not pass deep to the plexus.</p>',
      inject: '<p>20 ml of 0.5% ropivacaine beneath piriformis, around the plexus. At this level the <strong>posterior femoral cutaneous</strong> and the <strong>gluteal nerves</strong> are blocked with the sciatic nerve, and sometimes branches to the back of the hip.</p>',
    },
    probe: { view: 'back', at: [74, 70], angle: 30, marker: 'right', label: 'oblique, parallel to the line from the posterior superior iliac spine to the greater trochanter, over the greater sciatic notch.' },
    probeInset: legProbeInset,
  },
};
