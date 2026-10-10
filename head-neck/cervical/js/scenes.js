// Cervical plexus: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../truncal/shared/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths;
// nothing is traced from published images. Probe insets use the head figure (../../shared/js/head.js).
import { E, P, PS, L } from '../../../truncal/shared/js/scene.js';
import { headProbeInset } from '../../shared/js/head.js';

export const SCENES = {
  // Right neck, transverse at the midpoint of the posterior border of sternocleidomastoid (about C4).
  scp: {
    id: 'hn-cp-scp', title: 'Cervical plexus: transverse view at the posterior border of SCM', width: 40, depth: 32, focus: 13, skin: 1,
    view: 'Transverse (axial) view of the right side of the neck at the midpoint of the posterior border of sternocleidomastoid, about the level of C4. Medial on the left.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which plane',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3.4], [40, 4.2]], labelX: 34 },
      { id: 'pl', kind: 'muscle', label: 'Platysma', echo: 0.2, edge: 0.5, bottom: [[0, 4.2], [40, 4.9]], nolabel: true },
      { id: 'scm', kind: 'muscle', label: 'Sternocleidomastoid', short: 'SCM', stri: 0, edge: 0.95, smooth: false,
        bottom: [[0, 13.4], [10, 13.6], [17, 12.2], [22, 9.6], [25.5, 6.8], [28, 5.2], [40, 4.9]], labelX: 9 },
      { id: 'mid', kind: 'fat-deep', label: 'Fat between the investing and prevertebral fascia', nolabel: true, edge: 0,
        bottom: [[0, 26], [8, 25], [16, 21], [24, 17.6], [40, 16.6]] },
      { id: 'scal', kind: 'muscle', label: 'Scalene muscles', short: 'Scalenes', stri: 70, echo: 0.13, bottom: 40, labelX: 34 },
    ],
    lines: [
      { id: 'pvf', kind: 'fascia', label: 'Prevertebral fascia', short: 'PVF', amp: 0.9, pts: [[0, 26], [8, 25], [16, 21], [24, 17.6], [40, 16.6]], at: [33, 16.9], lab: [33, 20.4] },
    ],
    shapes: [
      { id: 'cca', kind: 'artery', label: 'Common carotid artery', short: 'CCA', shape: E(4.4, 20.2, 3.3, 3.1), lab: [5, 29.6] },
      { id: 'ijv', kind: 'vein', label: 'Internal jugular vein', short: 'IJV', shape: E(11.4, 17.2, 4, 2.3), lab: [14, 25.4] },
      { id: 'cp', kind: 'nerve', label: 'Cervical plexus branches', short: 'CP', shape: [E(25.2, 10.4, 1.1, 0.8), E(27.4, 11, 1, 0.8), E(26.2, 12.4, 1, 0.75)], at: [26.2, 11.2], lab: [33, 9] },
      { id: 'gan', kind: 'nerve', label: 'Great auricular nerve', short: 'GAN', shape: E(15.5, 5.6, 0.9, 0.6), lab: [11, 2.6] },
      { id: 'bp', kind: 'nerve', label: 'Brachial plexus roots (C5, C6)', short: 'C5–C6', shape: [E(22.6, 22.4, 1.6, 1.4), E(23.6, 26.4, 1.6, 1.4)], at: [23, 24.4], lab: [32, 26.6] },
      { id: 'tp', kind: 'bone', label: 'C4 transverse process', short: 'TP', shape: L(0.9, [10, 30.6], [18, 29.8], [27, 30.2]), lab: [18, 31.6], nolabel: true },
    ],
    target: { at: [26.2, 13.8], r: 2 },
    injections: [
      { id: 'int', label: 'Intermediate (deep to SCM)', entry: [58, -3], tip: [25.4, 13.9],
        target: { at: [26.2, 13.8], r: 2 },
        spread: { along: [[8, 14.6], [17, 14.2], [25.4, 13.9], [32, 13.4], [40, 13]], x0: 11, x1: 35, thick: 3.4, up: 0.5, above: 6 },
        steps: {
          needle: '<p>In-plane from <strong>lateral to medial</strong> (posterior to anterior). Pass under the tapering posterior edge of SCM, through the investing fascia, so the tip lies <strong>deep to SCM and superficial to the prevertebral fascia</strong>, beside the cervical plexus branches. Stay shallow: the brachial plexus, phrenic nerve and vessels are just deeper.</p>',
          inject: '<p>Inject 1–2 ml first, aspirating. Correct: the fluid layers out <strong>between SCM and the prevertebral fascia</strong> and surrounds the small nodules of the plexus. If it spreads deep to the bright prevertebral line, stop: you are heading for the interscalene groove.</p>',
        } },
      { id: 'sup', label: 'Superficial (subcutaneous)', entry: [52, 0.4], tip: [26, 3],
        target: { at: [26, 3], r: 1.6 },
        spread: { along: 'sc', x0: 13, x1: 38, thick: 2.2, up: 0.6, above: 3 },
        steps: {
          needle: '<p>Shallow, almost parallel to the skin, from <strong>lateral to medial</strong>. The tip stays in the subcutaneous fat over the posterior border of SCM; it does not pass the investing fascia.</p>',
          inject: '<p>The fluid lifts the skin in a thin layer over the posterior border of SCM. In the landmark technique, the same plane is filled with a fan of 2–3 injections up and down the border.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the side of the neck</strong> over the middle of SCM, about the level of the thyroid cartilage. Slide it posteriorly until the <strong>tapering posterior edge of SCM</strong> is in the middle of the screen.</p>',
      identify: '<p>From the skin down: fat and platysma, <strong>SCM</strong> tapering laterally, then fat and the bright <strong>prevertebral fascia</strong> over the scalene muscles and the brachial plexus roots. The <strong>cervical plexus</strong> is a small cluster of hypoechoic dots just deep to the posterior edge of SCM. Medially, deep to SCM: the internal jugular vein and carotid artery. Use colour Doppler.</p>',
      needle: '<p>In-plane, <strong>lateral to medial</strong>. Choose the plane with the buttons above the steps.</p>',
      inject: '<p>Watch the spread: it should stay in the chosen plane.</p>',
    },
    probe: { view: 'side', x: 112, y: 176, angle: 0, marker: 'right', label: 'transverse on the right side of the neck, over the midpoint of the posterior border of SCM.' },
    probeInset: headProbeInset,
  },

  // Right neck, transverse over the C4 transverse process, posterior to SCM.
  dcp: {
    id: 'hn-cp-dcp', title: 'Deep cervical plexus: transverse view at the C4 transverse process', width: 40, depth: 36, focus: 20, skin: 1,
    view: 'Transverse view of the right side of the neck over the C4 transverse process, just behind the posterior border of SCM. Anterior on the left. The C4 root lies in the gutter between the anterior and posterior tubercles.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3.8], [40, 4.6]], labelX: 34 },
      { id: 'scm', kind: 'muscle', label: 'Sternocleidomastoid', short: 'SCM', stri: 0, edge: 0.95, smooth: false, bottom: [[0, 10], [8, 9.6], [14, 7.2], [18, 5], [40, 4.8]], labelX: 5 },
      { id: 'mid', kind: 'fat-deep', label: 'Fat', nolabel: true, edge: 0, bottom: [[0, 18], [12, 17], [22, 15.6], [40, 14.6]] },
      { id: 'pvm', kind: 'muscle', label: 'Prevertebral and scalene muscles', short: 'Muscles', stri: 70, echo: 0.13, bottom: 44, at: [36, 19], lab: [35, 18.6] },
    ],
    lines: [
      { id: 'pvf', kind: 'fascia', label: 'Prevertebral fascia', short: 'PVF', amp: 0.9, pts: [[0, 18], [12, 17], [22, 15.6], [40, 14.6]], at: [33, 14.95], lab: [33, 11] },
    ],
    shapes: [
      { id: 'cca', kind: 'artery', label: 'Common carotid artery', short: 'CCA', shape: E(4.6, 13.4, 3.1, 2.9), lab: [5, 19.6] },
      { id: 'ijv', kind: 'vein', label: 'Internal jugular vein', short: 'IJV', nolabel: true, shape: E(10.8, 12.4, 3.2, 1.9) },
      { id: 'phr', kind: 'nerve', label: 'Phrenic nerve', short: 'Phr', shape: E(8.6, 19.8, 0.8, 0.6), lab: [3.6, 27.6] },
      { id: 'at', kind: 'bone', label: 'Anterior tubercle', short: 'AT', shape: PS([10, 25.6], [12.6, 22.8], [17, 23], [18, 26.2]), at: [14, 23.2], lab: [11, 29.5] },
      { id: 'pt', kind: 'bone', label: 'Posterior tubercle', short: 'PT', shape: PS([25, 24.6], [27.6, 21.8], [32, 22.2], [33, 25.6]), at: [29.5, 22], lab: [33, 30] },
      { id: 'root', kind: 'nerve', label: 'C4 nerve root', short: 'C4', shape: E(21.5, 23.2, 1.8, 1.5), lab: [21.5, 33] },
      { id: 'va', kind: 'artery', label: 'Vertebral artery', short: 'VA', nolabel: true, shape: E(21.2, 29.6, 1.5, 1.4) },
    ],
    target: { at: [23.2, 21], r: 2 },
    injections: [
      { id: 'dcp', label: 'C4 root, deep to the prevertebral fascia', entry: [56, -1], tip: [23.4, 20.8],
        pop: { label: 'Click: through the prevertebral fascia', plane: 'pvf', tent: 1.1, width: 3.5 },
        spread: { along: [[12, 19.4], [18, 20.4], [23.4, 20.8], [30, 20.2], [36, 19.6]], x0: 15.5, x1: 31, thick: 2.6, up: 0.35, above: 4 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse just behind the posterior border of SCM</strong>, at the level of the upper thyroid cartilage. Slide up or down to count levels: C6 has a big anterior tubercle (Chassaignac’s), C7 has none. Then come back up to C4.</p>',
      identify: '<p>The <strong>transverse process</strong>: anterior and posterior tubercles as two bright humps with shadows, and the <strong>C4 root</strong> in the gutter between them. Over it: the bright <strong>prevertebral fascia</strong>. Find the <strong>vertebral artery</strong> (deep, between the tubercles) and the carotid with colour Doppler before you start.</p>',
      needle: '<p>In-plane, <strong>posterior to anterior</strong>, aiming for the posterior tubercle. The tip passes through the prevertebral fascia (a click) and stops beside the root, <strong>outside the foramen</strong>. Never advance medially past the tubercles.</p>',
      inject: '<p>Aspirate, then inject <strong>slowly in 1 ml steps</strong>, watching for symptoms. The fluid spreads around the root under the prevertebral fascia. Stop at once if the patient feels unwell, the voice changes or the fluid is not seen.</p>',
    },
    probe: { view: 'side', x: 104, y: 168, angle: 0, marker: 'right', label: 'transverse on the right side of the neck, just behind the posterior border of SCM, at C4.' },
    probeInset: headProbeInset,
  },
};
