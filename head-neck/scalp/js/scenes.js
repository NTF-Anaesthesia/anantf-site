// Scalp and occipital: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../shared/regional/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images.
import { E, PS, L } from '../../../shared/regional/js/scene.js';
import { headProbeInset } from '../../../shared/regional/js/figures/head.js?v=20261015';

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
      { id: 'c1', kind: 'bone', label: 'C1 transverse process', short: 'C1 TP', shape: PS([37.5, 32], [45, 31.6], [45, 35.4], [38, 35.6]), at: [41, 32], lab: [39.6, 28.6] },
      { id: 'gon', kind: 'nerve', label: 'Greater occipital nerve', short: 'GON', shape: E(19, 21.6, 1.7, 1.1), lab: [14, 16.4] },
      // Deep to the lateral end of OCI, in the gap between the end of the C2 lamina and the C1 transverse process (not in its shadow).
      { id: 'va', kind: 'artery', label: 'Vertebral artery', short: 'VA', shape: E(35.7, 36.3, 1.3, 1.2), lab: [30.5, 38.4] },
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
  // Scalp block at the temple (landmark block: schematic section, no ultrasound). A horizontal section through the
  // right temple about 2 cm above the zygomatic arch, turned so that depth into the head runs down the screen: the ear
  // (posterior) on the left, the lateral orbital rim (anterior) on the right. This one plane holds both temple sites:
  // the auriculotemporal nerve behind the superficial temporal artery in front of the ear, and the zygomaticotemporal
  // nerve coming through the deep temporal fascia behind the orbital rim. Not to scale.
  temple: {
    id: 'hn-sc-temple', title: 'Scalp block at the temple: section above the zygomatic arch', image: 'diagram',
    width: 56, depth: 26, focus: 12, skin: 1.2,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    view: 'Schematic horizontal section through the right temple about 2 cm above the zygomatic arch, turned so that depth into the head runs down the screen: in front of the ear (posterior) on the left, the lateral orbital rim (anterior) on the right. The other five sites are shallow injections under the skin. Not to scale.',
    alt: 'Under the skin and subcutaneous tissue lie the temporoparietal fascia, loose areolar tissue and the deep temporal fascia over temporalis, which fills the temporal fossa down to bone. The auriculotemporal nerve lies just behind the superficial temporal artery, superficial to the deep fascia; the zygomaticotemporal nerve lies just deep to the deep fascia behind the orbital rim.',
    injectionLabel: 'Injection site',
    orient: { left: 'Posterior (ear)', right: 'Anterior (orbit)', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous tissue', short: 'Subcut.', bottom: [[0, 3.6], [56, 3.6]], at: [40, 2.4], lab: [40, 1.9] },
      { id: 'tpf', kind: 'aponeurosis', label: 'Temporoparietal fascia (the galea continued)', short: 'TPF', bottom: [[0, 5], [56, 5]], at: [24, 4.3], lab: [24, 1.9] },
      { id: 'lat', kind: 'connective', label: 'Loose areolar tissue', short: 'Areolar', edge: 0, bottom: [[0, 6.2], [56, 6.2]], at: [30, 5.6], lab: [31, 10.6] },
      { id: 'tm', kind: 'muscle', label: 'Temporalis', short: 'Temporalis', stri: 70, bottom: [[0, 12.2], [14, 14.2], [28, 18.2], [38, 20.8], [43.4, 20.4], [45.4, 19.4], [46.4, 16.4], [47.6, 12], [48.4, 6.6], [56, 6.2]], smooth: false, at: [16, 11.4], lab: [16, 11.4] },
      { id: 'deep', kind: 'none', label: 'Skull', nolabel: true, edge: 0, bottom: 40 },
    ],
    lines: [
      { id: 'dtf', kind: 'fascia', label: 'Deep temporal fascia', short: 'Deep fascia', amp: 1, w: 0.5, pts: [[0, 6.3], [24, 6.3], [40, 6.4], [48.3, 6.6]], at: [8, 6.3], lab: [8, 9.8] },
    ],
    shapes: [
      { id: 'bone', kind: 'bone', label: 'Temporal bone (floor of the temporal fossa)', short: 'Bone', shape: PS([0, 12.2], [7, 13], [14, 14.2], [21, 16], [28, 18.2], [33, 19.8], [38, 20.8], [41, 20.9], [43.4, 20.4], [45.2, 19.6], [45.4, 26], [0, 26]), at: [20, 17], lab: [16, 22.4] },
      { id: 'rim', kind: 'bone', label: 'Lateral orbital rim (zygomatic bone)', short: 'Orbital rim', shape: PS([49, 6.8], [56, 6.8], [56, 26], [45.4, 26], [45.4, 19.6], [46.4, 16.4], [47.6, 12], [48.3, 8.8]), at: [52, 9], lab: [50.6, 22.4] },
      { id: 'sta', kind: 'artery', label: 'Superficial temporal artery', short: 'STA', shape: E(14, 4.3, 1.1, 0.9), lab: [18, 8.6] },
      { id: 'atn', kind: 'nerve', label: 'Auriculotemporal nerve', short: 'ATN', shape: E(10.6, 4.4, 0.85, 0.6), lab: [5, 1.8] },
      { id: 'ztn', kind: 'nerve', label: 'Zygomaticotemporal nerve', short: 'ZTN', shape: E(41, 7.6, 0.9, 0.65), lab: [36.6, 13] },
    ],
    injections: [
      { id: 'at', label: 'Auriculotemporal (V3)', entry: [8.6, -5], tip: [10.8, 3.2],
        target: { at: [10.6, 4.2], r: 1.6 },
        spread: { along: [[4, 5.05], [10.6, 5.05], [14, 5.05]], x0: 5.4, x1: 12.6, from: 10.6, thick: 1.5, up: 0.75, above: 3 },
        steps: {
          needle: '<p>1 cm in front of and 1 cm above the tragus, feel the superficial temporal artery and put the needle in <strong>just behind it</strong>, under the skin. Stay above the tragus: the facial nerve is close below.</p>',
          inject: '<p>Aspirate (the artery is right there), then inject (dose box below). Press on the site for a minute afterwards.</p>',
        } },
      { id: 'zt', label: 'Zygomaticotemporal (V2)', entry: [45.4, -5], tip: [43.4, 9.2],
        target: { at: [41.6, 7.8], r: 1.8 },
        spread: { along: [[34, 7.5], [40, 7.5], [46, 7.8]], x0: 35, x1: 46.6, thick: 2.2, up: 0.85, above: 4 },
        spreads: [{ along: 'lat', x0: 35, x1: 48, thick: 1.4, up: 0.8, above: 3 }],
        steps: {
          needle: '<p>Just behind the lateral orbital rim, above the zygomatic arch. The nerve runs through temporalis, so the needle goes <strong>through the deep temporal fascia</strong>, close behind the rim, first.</p>',
          inject: '<p>Aspirate, then inject <strong>deep to the temporalis fascia</strong>, and again <strong>superficial to it</strong> as you withdraw; infiltrate back along the top of the zygomatic arch. Press afterwards. The hardest nerve to block.</p>',
        } },
    ],
    steps: {
      scan: '<p>Feel the <strong>lateral orbital rim</strong> and the <strong>zygomatic arch</strong>. Then, 1 cm in front of and 1 cm above the tragus, feel the pulse of the <strong>superficial temporal artery</strong>. This section shows both temple sites: the auriculotemporal nerve in front of the ear and the zygomaticotemporal nerve behind the orbital rim.</p>',
      identify: '<p>The scalp layers continue over the temple: skin, subcutaneous tissue, the temporoparietal fascia (the galea continued) and loose areolar tissue. Under them, the <strong>deep temporal fascia</strong> covers temporalis. The <strong>auriculotemporal nerve</strong> runs just behind the superficial temporal artery, superficial to the deep fascia. The <strong>zygomaticotemporal nerve</strong> comes up through temporalis behind the orbital rim and pierces the deep fascia.</p>',
      needle: '<p>Choose the site with the buttons above the steps.</p>',
      inject: '<p>Aspirate before each injection: the scalp is very vascular.</p>',
    },
    probe: { view: 'side', points: [[110, 90], [136, 86]], key: 'Needle entry', label: 'in front of the ear behind the superficial temporal artery (auriculotemporal), and just behind the lateral orbital rim above the zygomatic arch (zygomaticotemporal), right side.' },
    probeInset: headProbeInset,
  },
};
