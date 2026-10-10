// Scalp and occipital: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../truncal/shared/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images.
import { E, PS, L } from '../../../truncal/shared/js/scene.js';
import { headProbeInset } from '../../shared/js/head.js';

export const SCENES = {
  // Right side, at C2: probe along obliquus capitis inferior from the C2 spinous process to the C1 transverse process.
  gon: {
    id: 'hn-sc-gon', title: 'Greater occipital nerve at C2: view along obliquus capitis inferior', width: 45, depth: 40, focus: 22, skin: 1.4,
    view: 'Right side of the upper neck at C2. The probe lies along obliquus capitis inferior, from the bifid C2 spinous process (medial, left) towards the C1 transverse process (lateral, right).',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 4.4], [45, 5]], labelX: 38 },
      { id: 'trap', kind: 'muscle', label: 'Trapezius', short: 'Trap.', stri: 4, smooth: false, bottom: [[0, 7.6], [18, 7.2], [30, 5.6], [45, 5.2]], labelX: 8 },
      { id: 'spl', kind: 'muscle', label: 'Splenius capitis', short: 'Splenius', stri: 18, bottom: [[0, 10.2], [20, 11.6], [45, 13]], labelX: 34 },
      { id: 'ssc', kind: 'muscle', label: 'Semispinalis capitis', short: 'SSC', stri: -6, edge: 0.95, bottom: [[0, 20.4], [15, 21.2], [30, 22.2], [45, 22.8]], labelX: 30 },
      { id: 'oci', kind: 'muscle', label: 'Obliquus capitis inferior', short: 'OCI', stri: 4, echo: 0.12, bottom: [[0, 29.6], [20, 30.4], [45, 31.4]], labelX: 28 },
      { id: 'deep', kind: 'connective', label: 'Deep tissue', nolabel: true, edge: 0, bottom: 50 },
    ],
    shapes: [
      { id: 'c2sp', kind: 'bone', label: 'C2 spinous process', short: 'C2', shape: PS([0, 15.6], [3.4, 15], [5, 21], [5.6, 31], [0, 31]), at: [2.6, 16], lab: [6, 13.4] },
      { id: 'lam', kind: 'bone', label: 'C2 lamina', short: 'Lamina', shape: L(0.8, [6, 33.4], [20, 34], [34, 34.4]), lab: [18, 37.6] },
      { id: 'c1', kind: 'bone', label: 'C1 transverse process', short: 'C1 TP', shape: PS([37.5, 32], [45, 31.6], [45, 35.4], [38, 35.6]), at: [41, 32], lab: [38.5, 36.2] },
      { id: 'gon', kind: 'nerve', label: 'Greater occipital nerve', short: 'GON', shape: E(19, 21.6, 1.7, 1.1), lab: [14, 16.4] },
      { id: 'va', kind: 'artery', label: 'Vertebral artery', short: 'VA', nolabel: true, shape: E(41.5, 38, 1.8, 1.6) },
    ],
    target: { at: [19.5, 21], r: 2 },
    injections: [
      { id: 'gon', label: 'GON on obliquus capitis inferior', entry: [62, -2], tip: [21.4, 21.1],
        spread: { along: 'ssc', x0: 9, x1: 31, thick: 3, up: 0.55, above: 8 } },
    ],
    steps: {
      scan: '<p>Start in the midline at the occiput and slide down: C1 has no spinous process, so the first bifid spinous process is <strong>C2</strong>. Then move the probe laterally and turn its lateral end up towards the mastoid, so it lies along <strong>obliquus capitis inferior</strong>.</p>',
      identify: '<p>From the skin down: trapezius (thin here), splenius capitis, <strong>semispinalis capitis</strong>, then <strong>obliquus capitis inferior</strong> running from C2 to C1. The <strong>greater occipital nerve</strong> is an oval between semispinalis capitis and obliquus capitis inferior. The vertebral artery is deep to OCI, laterally, near C1: check with colour Doppler.</p>',
      needle: '<p>In-plane, <strong>lateral to medial</strong>, through the muscles to the plane between semispinalis capitis and obliquus capitis inferior, beside the nerve. Never go deep to OCI: the vertebral artery is lateral and deep, the spinal cord medial and deep.</p>',
      inject: '<p>Aspirate, then inject 2–3 ml. The fluid opens the plane on top of OCI and surrounds the nerve.</p>',
    },
    probe: { view: 'back', x: 117, y: 154, angle: -24, label: 'oblique on the right side of the upper neck at C2, along obliquus capitis inferior (lateral end up towards the mastoid).' },
    probeInset: headProbeInset,
  },
};
