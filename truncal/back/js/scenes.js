// Back: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../shared/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images.
import { E, PS, L } from '../../shared/js/scene.js';

// Square-shouldered transverse process (sharp polygon): flat posterior surface, squared corners.
const tp = (x0, x1, top, bot) => PS([x0, top + 0.5], [x0 + 0.6, top], [x1 - 0.6, top], [x1, top + 0.5], [x1, bot], [x0, bot]);

export const SCENES = {
  // Right side, parasagittal about 3 cm lateral to the midline at T5. Cranial on screen left.
  esp: {
    id: 'bk-esp', title: 'Erector spinae plane: parasagittal view at T5', width: 55, depth: 45, focus: 28, skin: 1.4,
    view: 'Parasagittal view about 3 cm lateral to the spinous processes on the right, centred on the T5 transverse process. Cranial on the left, caudal on the right. Patient sitting or lateral.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    alt: 'Three square-topped transverse processes (T4, T5, T6) lie deep to the erector spinae, each casting a black shadow; the pleura shows between them.',
    injectionLabel: 'Injection point',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 5.6], [55, 6.2]] },
      { id: 'trap', kind: 'muscle', label: 'Trapezius', short: 'Trap', stri: 2, bottom: [[0, 10.6], [14, 11.2], [30, 10.9], [44, 11.6], [55, 11.4]], labelX: 46 },
      { id: 'rmaj', kind: 'muscle', label: 'Rhomboid major', short: 'RM', stri: -3, echo: 0.15, bottom: [[0, 16.4], [12, 16.0], [28, 16.8], [42, 16.5], [55, 17.1]], labelX: 46 },
      { id: 'esm', kind: 'muscle', label: 'Erector spinae', short: 'ESM', stri: 3, echo: 0.15, dens: 0.5, edge: 0.95, edgeW: 0.5, smooth: false,
        bottom: [[0, 28.8], [13, 28.8], [15, 29.8], [20, 29.8], [22, 28.8], [33, 28.8], [35, 29.8], [40, 29.8], [42, 28.8], [55, 28.8]], labelX: 46 },
      { id: 'ittc', kind: 'connective', label: 'Intertransverse tissue complex', short: 'ITTC', echo: 0.22, edge: 0, color: '#d8bc9c', bottom: [[0, 38.2], [27, 38], [55, 38.6]], at: [37.5, 34], lab: [37.5, 34] },
    ],
    lines: [
      { id: 'pleura', kind: 'pleura', label: 'Pleura', pts: [[0, 38.2], [27, 38], [55, 38.6]], sliding: true, at: [17.5, 38.1], lab: [17.5, 42] },
    ],
    shapes: [
      { id: 'espp', kind: 'none', label: 'ESP plane', shape: L(0.1, [22, 28.8], [33, 28.8]), at: [30, 28.8], lab: [27.5, 23.2] },
      { id: 'tp4', kind: 'bone', label: 'T4 transverse process', short: 'T4 TP', shape: tp(2, 13, 28.9, 35), at: [7.5, 31], lab: [7.5, 41.6] },
      { id: 'tp5', kind: 'bone', label: 'T5 transverse process', short: 'T5 TP', shape: tp(22, 33, 28.9, 35), at: [27.5, 31], lab: [27.5, 41.6] },
      { id: 'tp6', kind: 'bone', label: 'T6 transverse process', short: 'T6 TP', shape: tp(42, 53, 28.9, 35), at: [47.5, 31], lab: [47.5, 41.6] },
    ],
    target: { at: [27.5, 28.6], r: 2.2 },
    injections: [
      {
        id: 'esp', label: 'ESP: on the T5 TP', entry: [-12, -1], tip: [27.5, 28.6],
        spread: { along: [[0, 28.75], [55, 28.75]], from: 27.5, x0: 3, x1: 52, thick: 3.4, up: 1, above: 10, shape: 0.7 },
        steps: {
          needle: '<p>In-plane, here <strong>cranial to caudal</strong> (caudal to cranial works too). Keep the whole shaft in view through trapezius, rhomboid major and erector spinae, and advance until the tip <strong>touches the T5 transverse process</strong>.</p>',
          inject: '<p>Inject 1–2 ml to check: the fluid <strong>lifts erector spinae off the transverse process</strong> (hydrodissection) and then spreads <strong>cranially and caudally</strong> along the plane, over the neighbouring transverse processes. If the muscle swells instead, the tip is in the muscle: move it back onto bone.</p>',
        },
      },
      {
        id: 'mtp', label: 'MTP: mid-point TP to pleura', entry: [-6, -4], tip: [18.5, 33.5], target: { at: [18.5, 33.5], r: 2 },
        spread: { along: [[13.4, 33.9], [18.5, 33.5], [21.6, 33.9]], x0: 13.6, x1: 21.6, thick: 2.6, up: 0.4, above: 4 },
        steps: {
          needle: '<p><strong>MTP variant:</strong> the needle passes just past the edge of the transverse process and stops <strong>halfway between the back of the transverse process and the pleura</strong>, without going through the superior costotransverse ligament.</p>',
          inject: '<p>Inject slowly and watch the pleura. In cadavers, dye injected here reached the paravertebral space at the level of injection, and often the levels next to it.</p>',
        },
      },
    ],
    steps: {
      scan: '<p>Count down to T5 (from the vertebra prominens, the tip of the scapula, or by ultrasound from the first rib). Probe <strong>parasagittal</strong> over the spinous processes, then slide about 3 cm laterally past the laminae until the <strong>transverse processes</strong> appear: flat, <strong>squared-off</strong> bright lines with black shadows.</p>',
      identify: '<p>From the skin down: <strong>trapezius</strong>, <strong>rhomboid major</strong> (upper thoracic levels only), <strong>erector spinae</strong>, then the <strong>T4, T5 and T6 transverse processes</strong> with the <strong>intertransverse tissue complex</strong> between them and the pleura deeper still. The target is the <strong>ESP plane</strong>: deep to erector spinae, on top of the T5 transverse process.</p>',
      needle: '<p>Choose the ESP or MTP point above to see its needle path.</p>',
      inject: '<p>Choose the ESP or MTP point above to see its spread.</p>',
    },
    probe: { view: 'back', x: 100, y: 111, angle: 90, label: 'parasagittal, about 3 cm lateral to the T5 spinous process (right side shown), marker cranial.' },
  },

  // Right side, parasagittal (position illustrative), tilted laterally to the costotransverse junction.
  pvb: {
    id: 'bk-pvb-sag', title: 'Paravertebral: parasagittal view tilted laterally (TP and rib)', width: 45, depth: 45, focus: 28, skin: 1.4,
    view: 'Parasagittal view on the right, tilted laterally from the transverse process view to the costotransverse junction: the transverse process (square, shallower) cranially and the rib (rounder, deeper) caudally. Cranial on the left.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    alt: 'The superior costotransverse ligament slopes deeper from the transverse process towards the rib below; the pleura lies under it.',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 5.4], [45, 5.8]] },
      { id: 'trap', kind: 'muscle', label: 'Trapezius', short: 'Trap', stri: 2, bottom: [[0, 10.6], [45, 11]], labelX: 36 },
      { id: 'esm', kind: 'muscle', label: 'Erector spinae', short: 'ESM', stri: 4, echo: 0.15, dens: 0.5, edge: 0.9, smooth: false,
        bottom: [[0, 24.7], [11.6, 24.7], [14, 26.6], [24, 28.4], [31, 28.4], [34, 27.4], [45, 27.4]], labelX: 7 },
    ],
    lines: [
      { id: 'pleura', kind: 'pleura', label: 'Pleura', pts: [[0, 37.6], [20, 37.1], [45, 38.3]], sliding: true, at: [25, 37.2], lab: [25, 41.6] },
    ],
    shapes: [
      { id: 'pvs', kind: 'none', label: 'Paravertebral space', short: 'PVS', shape: PS([11.6, 31.2], [20, 31.5], [31, 33.6], [31, 36.8], [20, 36.4], [11.6, 36.4]), at: [21, 34.4], lab: [17, 34.6] },
      { id: 'sctl', kind: 'ligament', label: 'Superior costotransverse ligament', short: 'SCTL', shape: L(0.8, [11.6, 28.4], [20, 30.8], [32, 32]), at: [15.5, 29.6], lab: [12, 21.6] },
      { id: 'tp', kind: 'bone', label: 'Transverse process', short: 'TP', shape: tp(-1, 11.6, 24.9, 31), at: [6, 26], lab: [6, 41.6] },
      { id: 'rib', kind: 'bone', label: 'Rib (rounder, deeper)', short: 'Rib', shape: E(38.4, 31.6, 6.6, 3.9), at: [38.4, 28.2], lab: [38.4, 41.6] },
    ],
    target: { at: [19.5, 32.6], r: 2 },
    injections: [
      {
        id: 'pvb', label: 'Under the SCTL', entry: [60, -3], tip: [19.5, 32.6],
        pop: { label: 'Pop: through the SCTL', plane: [[11.6, 28.4], [20, 30.8], [32, 32]], tent: 1.3, width: 4.5 },
        spread: { along: [[11.6, 31], [19.5, 32.6], [31, 34]], x0: 11.8, x1: 31, thick: 4.2, up: 0, above: 6, shape: 0.8 },
      },
    ],
    steps: {
      scan: '<p>Count the level. Probe <strong>parasagittal</strong>: find the transverse process (square, with a black shadow), then <strong>tilt laterally</strong> towards the costotransverse joint, until the transverse process sits cranially and the <strong>rib</strong> (rounder and deeper) caudally.</p>',
      identify: '<p><strong>Trapezius</strong> and <strong>erector spinae</strong> on top; the <strong>transverse process</strong> and the <strong>rib</strong>; between them the <strong>superior costotransverse ligament (SCTL)</strong> sloping deeper towards the rib; the <strong>pleura</strong> moving underneath. The paravertebral space is the wedge between the SCTL and the pleura.</p>',
      needle: '<p>In-plane, <strong>caudal to cranial</strong>: this crosses the SCTL at a steeper angle, because of the way it slopes. Advance under the transverse process and through the SCTL: feel the <strong>pop</strong>. Stop just under the ligament.</p>',
      inject: '<p>Deposit <strong>below the SCTL</strong>. A correct injection <strong>pushes the pleura down</strong> (anterior displacement), and the fluid spreads under the ligament. Aspirate first and inject in small increments.</p>',
    },
    probe: { view: 'back', x: 98, y: 111, angle: 90, label: 'parasagittal, a little lateral to the spinous process (right side shown; position illustrative), tilted laterally to the costotransverse junction.' },
  },

  // Right side, transverse (axial) at the level of a transverse process, beam in the intercostal space just caudal to it.
  pvbt: {
    id: 'bk-pvb-tr', title: 'Paravertebral: transverse view at the tip of the transverse process', width: 50, depth: 45, focus: 28, skin: 1.4,
    view: 'Transverse view on the right, just caudal to a transverse process: its tip medially, the intercostal space laterally. Medial (spine) on the left, lateral on the right.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    alt: 'The internal intercostal membrane runs laterally from the tip of the transverse process, deep to the external intercostal muscle; it is continuous medially with the superior costotransverse ligament. The pleura curves deeper medially, making a wedge: the paravertebral space.',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 5.6], [50, 5.2]] },
      { id: 'trap', kind: 'muscle', label: 'Trapezius', short: 'Trap', stri: 0, bottom: [[0, 10.4], [50, 9.4]], labelX: 40 },
      { id: 'esm', kind: 'muscle', label: 'Erector spinae', short: 'ESM', stri: 0, echo: 0.15, dens: 0.5, bottom: [[0, 23.4], [16, 23.6], [24, 21.6], [36, 18.6], [50, 17.6]], labelX: 14 },
      { id: 'eic', kind: 'muscle', label: 'External intercostal muscle', short: 'EIM', stri: -14, echo: 0.13, edge: 0.4, bottom: [[0, 23.4], [16, 23.7], [22, 25], [34, 25.3], [50, 25]], at: [44, 23.3], lab: [43, 20.6] },
    ],
    lines: [
      { id: 'iim', kind: 'ligament', label: 'Internal intercostal membrane', short: 'IIM', pts: [[15.6, 25.4], [22, 25.6], [34, 25.9], [50, 25.6]], w: 0.6, at: [34, 25.9], lab: [33, 32] },
      { id: 'pleura', kind: 'pleura', label: 'Pleura', pts: [[0, 35.6], [10, 34], [18, 32], [30, 29.6], [50, 28.8]], sliding: true, at: [46, 28.9], lab: [44, 36.5] },
    ],
    shapes: [
      { id: 'pvs', kind: 'none', label: 'Paravertebral space', short: 'PVS', shape: PS([15.6, 25.9], [26, 26.2], [18, 31.6], [11, 33.5]), at: [17, 29], lab: [10, 41.6] },
      { id: 'tp', kind: 'bone', label: 'Transverse process', short: 'TP', shape: L(1.6, [0, 23.9], [8, 24.3], [15.4, 25.3]), at: [6, 24.2], lab: [7, 29.5] },
    ],
    target: { at: [17.5, 28.2], r: 2 },
    injections: [
      {
        id: 'pvbt', label: 'Under the IIM', entry: [68, -2], tip: [17.5, 28.2],
        pop: { label: 'Pop: through the IIM', plane: 'iim', tent: 1.2, width: 4.5 },
        spread: { along: [[9, 29.6], [17.5, 28.4], [28, 27.6]], x0: 9, x1: 28, thick: 4, up: 0, above: 5, shape: 0.8 },
      },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse</strong> at the level you want, over the transverse process, then slide <strong>caudally</strong> a little into the intercostal space so that the tip of the transverse process is medial and the intercostal space lateral.</p>',
      identify: '<p><strong>Trapezius</strong>, <strong>erector spinae</strong>, the <strong>transverse process</strong> (bright, with a shadow), the <strong>external intercostal muscle</strong> laterally, and under it the <strong>internal intercostal membrane (IIM)</strong>, which is continuous medially with the SCTL. Below: the <strong>pleura</strong>, curving deeper medially. The wedge between the IIM and the pleura is the <strong>paravertebral space</strong>.</p>',
      needle: '<p>In-plane, shown here <strong>lateral to medial</strong>. Advance towards the tip of the transverse process and through the IIM (a pop or loss of resistance). Keep the tip in view: the pleura is a few millimetres deeper.</p>',
      inject: '<p>Deposit <strong>below the IIM</strong>: the pleura is <strong>pushed down</strong> and the fluid spreads medially into the paravertebral space. Aspirate first; inject in increments.</p>',
    },
    probe: { view: 'back', x: 101, y: 111, angle: 0, label: 'transverse, just caudal to the transverse process (right side shown).' },
  },
};
