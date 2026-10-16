// Shoulder blocks (interscalene, superior trunk, suprascapular, axillary nerve): ultrasound scenes for the shared scan
// teacher (schema: ../../../shared/regional/DATA.md, "Scene schema"). Millimetres; x across the screen from the left,
// y = depth from the skin; right side.
// Interscalene and superior trunk are ported from the brachial plexus app's own scenes (brachial-plexus/js/ultrasound.js,
// SCENES_MM): structure positions, sizes and needle paths are those numbers. The suprascapular and axillary nerve scenes
// are original, laid out from typical adult depths (slim to average build); nothing is traced from published images.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { armProbeInset } from '../../../shared/regional/js/figures/arm.js';

const BP = (...ids) => ids.map((i) => `brachial:${i}`);

export const SCENES = {
  // ------------------------------------------------------------------ interscalene
  // Right neck, transverse at C7 (one step caudal to the cricoid / C6).
  interscalene: {
    id: 'ul-sh-isb', title: 'Interscalene: the roots between the scalenes', width: 52, depth: 32, focus: 10, skin: 0.8,
    view: 'Transverse (axial) view of the right side of the neck at C7, one step caudal to the cricoid (C6). Medial (anterior) on the left, lateral (posterior) on the right. The C5 and C6 roots stack up as the "traffic light" between the anterior and middle scalene.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which injection',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: 2.3, edge: 0.5 },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.2, edge: 0, bottom: 36 },
    ],
    shapes: [
      { id: 'lev', kind: 'muscle', label: 'Levator scapulae', nolabel: true, stri: 20, echo: 0.13, shape: P([49, 5], [52, 5], [52, 32], [40, 32], [40.5, 20], [44, 18], [49, 16.5]) },
      { id: 'lco', kind: 'muscle', label: 'Longus colli', nolabel: true, stri: 0, echo: 0.15, shape: P([5, 31.5], [9, 27], [15, 23.5], [18, 22.8], [20, 24.5], [21, 28], [26, 30], [27, 31.5]) },
      { id: 'scm', kind: 'muscle', label: 'Sternocleidomastoid', short: 'SCM', desc: 'Sternocleidomastoid (superficial).', stri: -12, echo: 0.13, dens: 0.4,
        shape: P([0, 2.3], [10, 2.3], [20, 2.5], [25, 3], [26, 3.6], [22, 4.2], [15, 4.6], [11, 6], [8, 8.1], [0, 8.3]), at: [5.5, 5.2], lab: [5.5, 5.2] },
      { id: 'as', kind: 'muscle', label: 'Anterior scalene', short: 'AS', desc: 'Anterior scalene (medial) and middle scalene (lateral).', stri: 25, echo: 0.12, dens: 0.4,
        shape: P([11, 6], [15, 4.6], [20, 4.5], [22.5, 5.5], [23.5, 9], [24, 13], [23, 16.5], [20, 18], [16, 18], [12.5, 16.5], [10.5, 12], [10, 8]), at: [17, 12.5], lab: [17, 12.5] },
      { id: 'ms', kind: 'muscle', label: 'Middle scalene', short: 'MS', desc: 'Anterior scalene (medial) and middle scalene (lateral).', stri: -8, echo: 0.14, dens: 0.4,
        shape: P([26, 3.6], [30, 3.3], [40, 3], [48, 3.6], [50, 5], [49.5, 10], [48, 15], [42, 16], [37, 16.2], [33, 16.5], [29, 15.5], [27, 12], [26, 8]), at: [40, 12.2], lab: [40, 12.2] },
      { id: 'is-space', kind: 'connective', label: 'Interscalene sheath', nolabel: true, echo: 0.34, shape: P([22.3, 4], [23.6, 3.6], [25.5, 4.2], [27.5, 8], [28.6, 12], [28.4, 15.3], [27.4, 15.6], [24.5, 13], [23, 9]) },
      { id: 'scm-f', kind: 'fascia', label: 'Deep fascia of SCM', nolabel: true, amp: 0.95, shape: L(0.5, [0, 8.4], [8, 8.2], [11, 6.1], [15, 4.7], [22.6, 4.3]) },
      { id: 'is-wall', kind: 'fascia', label: 'Lateral wall of the interscalene sheath', nolabel: true, amp: 0.95, shape: L(0.45, [25.5, 4.2], [27.5, 8], [28.6, 12], [28.4, 15.3]) },
      { id: 'pvf', kind: 'fascia', label: 'Prevertebral fascia', short: 'PVF', amp: 0.95, desc: 'The deep cervical fascia: an extrafascial injection stays outside the sheath.',
        shape: L(0.45, [9, 26.8], [15, 23], [22, 18.5], [28, 16.5], [34, 16.3], [40, 16.5], [48, 16.3], [52, 16.5]), at: [46, 16.4], lab: [47, 13.6] },
      { id: 'c7tp', kind: 'bone', label: 'C7 transverse process', short: 'C7 TP', desc: 'C7 root emerging beside the C7 transverse process (no prominent anterior tubercle).',
        shape: L(0.9, [26.5, 22.6], [27.7, 22.1], [31, 22.8], [34, 21.8], [36.4, 20.3], [37.7, 17.9], [38.2, 16.8], [38.8, 17.6]), at: [34, 21.8], lab: [43.5, 21.5] },
      { id: 'ijv', kind: 'vein', label: 'Internal jugular vein', short: 'IJV', desc: 'Common carotid artery and internal jugular vein (medial).', shape: P([0, 9.3], [5, 9.2], [8.4, 11], [8.6, 14.5], [6, 16.8], [0, 16.6]), at: [4.5, 12.6], lab: [4.5, 12.6] },
      { id: 'cca', kind: 'artery', label: 'Common carotid artery', short: 'CCA', desc: 'Common carotid artery and internal jugular vein (medial).', shape: E(6, 20.6, 3.4, 3.4), at: [6, 20.6], lab: [6, 20.6] },
      { id: 'vv', kind: 'vein', label: 'Vertebral vein', nolabel: true, shape: E(21.7, 20.8, 3.25, 2.1) },
      { id: 'va', kind: 'artery', label: 'Vertebral artery', short: 'VA', desc: 'Vertebral artery (deep, medial): ask for colour Doppler.', shape: E(23.3, 24.9, 2.35, 2.35), at: [23.3, 24.9], lab: [29.5, 27.5] },
      { id: 'ita', kind: 'artery', label: 'Inferior thyroid artery', nolabel: true, shape: E(13.6, 19.8, 1.2, 1.2) },
      { id: 'vagus', kind: 'nerve', label: 'Vagus nerve', nolabel: true, shape: E(2, 17.7, 1.2, 0.8) },
      { id: 'symp', kind: 'nerve', label: 'Cervical sympathetic trunk', nolabel: true, shape: E(3.9, 27.1, 2.6, 1.95) },
      { id: 'phr', kind: 'nerve', label: 'Phrenic nerve', short: 'Phr', ids: BP('n-phrenic'), desc: 'Phrenic nerve on the anterior surface of the anterior scalene.', shape: E(13.1, 5.9, 1.5, 0.75, -40), at: [13.1, 5.9], lab: [12.4, 9.8] },
      { id: 'c5', kind: 'nerve', label: 'C5 root', short: 'C5', ids: BP('root-c5'), desc: 'C5 and C6 roots (C6 often split) stacked as the "traffic light" between the scalenes.', shape: E(24.2, 6.8, 1.3, 1.2), at: [24.2, 6.8], lab: [19.6, 7] },
      { id: 'c6', kind: 'nerve', label: 'C6 root (split)', short: 'C6', ids: BP('root-c6'), desc: 'C5 and C6 roots (C6 often split) stacked as the "traffic light" between the scalenes.', shape: [E(24.7, 9.95, 1.15, 1.1), E(25.6, 11.3, 1.15, 1.1)], at: [25.1, 10.6], lab: [20, 10.4] },
      { id: 'c7', kind: 'nerve', label: 'C7 root', short: 'C7', ids: BP('root-c7'), desc: 'C7 root emerging beside the C7 transverse process (no prominent anterior tubercle).', shape: E(30.1, 18.5, 3, 1.95), at: [30.1, 18.5], lab: [33, 14] },
      { id: 'dsn', kind: 'nerve', label: 'Dorsal scapular / long thoracic nerves', short: 'DSN/LTN', ids: BP('n-dorsal-scapular', 'n-long-thoracic'), desc: 'Dorsal scapular and long thoracic nerves within the middle scalene.',
        shape: [E(31.2, 8.7, 1.3, 0.65, 20), E(46.6, 7.2, 2.6, 0.6, -15)], at: [31.2, 8.7], lab: [36, 6] },
    ],
    target: { at: [25.6, 8.4], r: 1.5 },
    injections: [
      { id: 'c5c6', label: '1. Between C5 and C6', entry: [57, 0.5], tip: [25.6, 8.4],
        spread: { along: [[21.5, 8.8], [23.5, 8.4], [25.6, 8.4], [27.5, 8.7], [28.6, 9.2]], x0: 20.5, x1: 30.2, from: 25.4, thick: 2.6, up: 0.75, above: 4, shape: 0.9 },
        spreads: [{ along: [[12, 5.6], [15, 4.8], [19, 4.4], [22, 4.4]], x0: 12.5, x1: 22, from: 22, thick: 0.9, up: 0.4, above: 3, shape: 1 }],
        steps: {
          needle: '<p><strong>In-plane, posterior to anterior</strong> (needle passes through or behind the middle scalene). Aim the tip <strong>between the C5 and C6 roots</strong>, inside the interscalene sheath. Do not puncture the roots.</p>',
          inject: '<p>15 ml of 0.5% ropivacaine in 3–5 ml aliquots, so local anaesthetic surrounds both roots. Spread along the anterior surface of the anterior scalene reaches the phrenic nerve.</p>',
        } },
      { id: 'deep', label: '2. Optional: deeper, below C6', entry: [57, 0.5], tip: [27.6, 13], keep: ['c5c6'],
        spread: { along: [[25.2, 13.6], [27.6, 13.4], [29, 13.9]], x0: 24.6, x1: 30.2, from: 27.4, thick: 1.4, up: 0.7, above: 3, shape: 0.9 },
        steps: {
          needle: '<p>Optional redirect: deeper in the sheath below C6, if spread stays superficial.</p>',
          inject: '<p>A few millilitres here so the spread reaches C6 from below.</p>',
        } },
      { id: 'extra', label: 'Alternative: extrafascial', entry: [57, 0.5], tip: [28.8, 7],
        spread: { along: [[27.2, 7.2], [28.8, 7], [31, 7.3]], x0: 26.6, x1: 31.6, from: 29, thick: 1.4, up: 0.7, above: 3, shape: 0.9 },
        steps: {
          needle: '<p>Alternative: stop <strong>in the middle scalene, just outside the sheath</strong> (lateral to its fascia).</p>',
          inject: '<p>Extrafascial injection: lower phrenic risk, at some cost to onset and density.</p>',
        } },
    ],
    steps: {
      scan: '<p>Interscalene groove at the level of C6 (cricoid cartilage). Probe transverse to the neck: identify the common carotid artery, then scan laterally. If the anatomy is ambiguous, trace back: find the plexus in the supraclavicular fossa and slide cephalad until the cluster separates into roots between the scalenes.</p>',
      identify: '<p><strong>Sternocleidomastoid</strong> (superficial); <strong>anterior scalene</strong> (medial) and <strong>middle scalene</strong> (lateral); <strong>C5 and C6 roots</strong> (C6 often split) stacked as the "traffic light" between the scalenes; <strong>C7</strong> beside the C7 transverse process (no prominent anterior tubercle). Carotid and internal jugular vein medially; vertebral artery deep and medial (colour Doppler); <strong>phrenic nerve</strong> on the anterior scalene.</p>',
      needle: '<p>In-plane, posterior to anterior (needle passes through or behind the middle scalene). Between the C5 and C6 roots, inside the interscalene sheath. Do not puncture the roots. Beware the dorsal scapular and long thoracic nerves in the middle scalene.</p>',
      inject: '<p>Inject between C5 and C6 so local anaesthetic surrounds both roots. Alternative: extrafascial injection (outside the sheath, lateral to the middle scalene fascia).</p>',
    },
    probe: { view: 'front', at: 'interscalene', angle: 0, label: 'transverse across the neck at the level of C6 (cricoid).' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ superior trunk
  'superior-trunk': {
    id: 'ul-sh-stb', title: 'Superior trunk: C5 and C6 just joined', width: 52, depth: 30, focus: 8, skin: 0.6,
    view: 'Transverse (axial-oblique) view of the right lower neck, between the interscalene (C6–C7) and supraclavicular levels, where C5 and C6 have just joined as the superior trunk. Medial on the left, lateral on the right.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which injection',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: 1.6, edge: 0.5 },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.22, edge: 0, bottom: 34 },
    ],
    lines: [
      { id: 'pleura-med', kind: 'pleura', label: 'Pleura', nolabel: true, sliding: true, pts: [[1.5, 27.5], [6, 25.3], [10, 24.7], [14, 25.2], [17, 26]] },
      { id: 'pleura', kind: 'pleura', label: 'Pleura', short: 'Pleura', sliding: true, desc: 'Subclavian artery and pleura coming into view caudally (scan too far and you are at the supraclavicular level).',
        pts: [[27, 21.8], [31, 20.2], [35.5, 18.5], [40.3, 16.8], [46.5, 15.6], [52, 15]], at: [42, 16.6], lab: [42, 21.6] },
    ],
    shapes: [
      { id: 'fat-deep', kind: 'connective', label: 'Fibrofatty tissue', nolabel: true, echo: 0.3, shape: P([18.8, 15], [26.6, 15.6], [29.5, 16.8], [34, 15.6], [40, 14.9], [45.5, 14.4], [52, 14.2], [52, 15], [46.5, 15.6], [40.3, 16.8], [35.5, 18.5], [31, 20.2], [27, 21.8], [23, 24.2], [17, 26], [14, 25.2], [12.6, 22], [12.4, 15.4]) },
      { id: 'scm', kind: 'muscle', label: 'Sternocleidomastoid', short: 'SCM', desc: 'Sternocleidomastoid (superficial, medial).', stri: -10, echo: 0.13, dens: 0.4,
        shape: P([0, 1.8], [12, 1.7], [24, 2], [30, 2.4], [32, 2.8], [28, 3.4], [22, 3.8], [14, 4.2], [8, 4.6], [0, 4.8]), at: [12, 3.2], lab: [12, 3.2] },
      { id: 'as', kind: 'muscle', label: 'Anterior scalene', short: 'AS', desc: 'Anterior scalene (medial) with the phrenic nerve on its anterior surface.', stri: 22, echo: 0.12, dens: 0.4,
        shape: P([5.6, 5.8], [9, 5.25], [14, 5], [18, 5.3], [19.6, 7.4], [22, 8.8], [25.4, 9.3], [23.6, 10], [20.8, 12.4], [18.8, 15], [16, 15.4], [10, 15], [6.6, 14], [5.4, 12], [5.2, 8.5]), at: [12.5, 10.5], lab: [12.5, 10.5] },
      { id: 'ms', kind: 'muscle', label: 'Middle scalene', short: 'MS', desc: 'Middle scalene (lateral and deep).', stri: -8, echo: 0.14, dens: 0.4,
        shape: P([31.2, 5], [34, 4.7], [40, 4.35], [46, 4.5], [48.6, 5.6], [49.2, 9], [48.4, 12.5], [45.5, 14.4], [40, 14.9], [34, 15.6], [29.5, 16.8], [26.6, 15.6], [26.4, 13.4], [28.4, 10.8], [30, 8.6], [30.4, 6.6]), at: [38, 10.5], lab: [38, 10.5] },
      { id: 'st-sheath', kind: 'connective', label: 'Superior trunk sheath', nolabel: true, echo: 0.34, shape: P([18.9, 6.3], [20.2, 4.6], [24, 4.15], [27.8, 4.6], [30.5, 4.7], [33.4, 4.1], [33.6, 4.6], [30.6, 5.7], [29.2, 7.6], [26.6, 9], [21.5, 8.7], [19.4, 7.7]) },
      { id: 'pvf', kind: 'fascia', label: 'Prevertebral fascia', short: 'PVF', amp: 0.95, desc: 'The needle goes under the prevertebral (deep cervical) fascia and superficial to the middle scalene.',
        shape: L(0.4, [14, 4.45], [19.5, 4.45], [24, 4], [28.5, 4.3], [33, 3.1], [37, 2.9], [41, 3], [46, 3.6], [50, 4.6]), at: [44, 3.3], lab: [46, 6.8] },
      { id: 'sca', kind: 'artery', label: 'Subclavian artery', short: 'SCA', desc: 'Subclavian artery and pleura coming into view caudally (scan too far and you are at the supraclavicular level).', shape: E(6, 19.4, 6.6, 4.8), at: [6, 19.4], lab: [6.5, 19.6] },
      { id: 'tct', kind: 'artery', label: 'Thyrocervical trunk', nolabel: true, shape: E(3.5, 11.6, 1.2, 3.2) },
      { id: 'tca', kind: 'artery', label: 'Suprascapular artery', nolabel: true, shape: E(39.2, 3.7, 0.5, 0.5) },
      { id: 'phr', kind: 'nerve', label: 'Phrenic nerve', short: 'Phr', ids: BP('n-phrenic'), desc: 'Anterior scalene (medial) with the phrenic nerve on its anterior surface.', shape: E(9.6, 5, 1.1, 0.55, -10), at: [9.6, 5], lab: [9.5, 7.8] },
      { id: 'st', kind: 'nerve', label: 'Superior trunk', short: 'ST', ids: BP('trunk-sup', 'root-c5', 'root-c6'), desc: 'A single larger hypoechoic structure where C5 and C6 have joined, often superficial / lateral to the anterior scalene.', shape: E(23.6, 6.4, 3.8, 1.5, -6), at: [23.6, 6.4], lab: [23.6, 1.4] },
      { id: 'ssn', kind: 'nerve', label: 'Suprascapular nerve', short: 'SSN', ids: BP('n-suprascapular'), desc: 'A small round structure just lateral to the superior trunk, about to leave it (inject proximal to its take-off).', shape: E(34.6, 3.9, 1.2, 0.6, -10), at: [34.6, 3.9], lab: [36, 1.4] },
      { id: 'mt', kind: 'nerve', label: 'Middle trunk', short: 'MT', ids: BP('trunk-mid', 'root-c7'), desc: 'C7, running obliquely between the scalenes.', shape: E(23.5, 13.2, 4.6, 1.9, -48), at: [23.5, 13.2], lab: [30, 13.2] },
      { id: 'it', kind: 'nerve', label: 'Inferior trunk', nolabel: true, ids: BP('trunk-inf', 'root-c8', 'root-t1'), shape: E(23.1, 20, 3.7, 3, -15) },
      { id: 'ltn', kind: 'nerve', label: 'Dorsal scapular / long thoracic nerve', nolabel: true, ids: BP('n-dorsal-scapular', 'n-long-thoracic'), shape: E(49.8, 8.2, 1, 1.4, 20) },
    ],
    target: { at: [28.3, 6.8], r: 1.5 },
    injections: [
      { id: 'stb', label: '1. Lateral border of the trunk', entry: [56, 3.8], tip: [28.3, 6.8],
        spread: { along: [[19, 5.6], [22, 7.8], [25, 8.4], [28.3, 7.2], [31, 5.8], [34.5, 4.6]], x0: 19.5, x1: 34.5, from: 27, thick: 1.8, up: 0.7, above: 3, shape: 0.9 },
        steps: {
          needle: '<p><strong>In-plane, posterior to anterior</strong> (lateral to medial), under the prevertebral fascia and superficial to the middle scalene, to the <strong>lateral border of the superior trunk</strong>.</p>',
          inject: '<p>Inject in 3–5 ml aliquots and watch it wrap around the trunk and run laterally to the suprascapular nerve (commonly 10–15 ml). Watch that spread does not track medially over the anterior scalene towards the phrenic nerve.</p>',
        } },
      { id: 'deep', label: '2. Optional: deep to the trunk', entry: [56, 3.8], tip: [26.4, 8.7], keep: ['stb'],
        spread: { along: [[20.4, 8], [23.4, 8.6], [26.4, 8.9]], x0: 20.5, x1: 27.5, from: 24, thick: 1.3, up: 0.7, above: 3, shape: 0.9 },
        steps: {
          needle: '<p>Optional redirect: deep to the trunk (between it and the middle trunk) if spread stays superficial.</p>',
          inject: '<p>Two-step injection: about two-thirds of the volume behind and below the trunk, the rest in front of and above it (for example 10 ml then 5 ml).</p>',
        } },
    ],
    steps: {
      scan: '<p>Start with interscalene, scan caudad until the C5 and C6 roots join as the superior trunk; stop before the suprascapular nerve leaves its lateral side (between the interscalene and supraclavicular levels).</p>',
      identify: '<p><strong>Superior trunk</strong>: a single larger hypoechoic structure where C5 and C6 have joined, often superficial / lateral to the anterior scalene. <strong>Suprascapular nerve</strong>: a small round structure just lateral to the trunk, about to leave it. <strong>Anterior scalene</strong> (medial) with the <strong>phrenic nerve</strong> on its anterior surface; <strong>middle scalene</strong> (lateral and deep). Subclavian artery and pleura coming into view caudally.</p>',
      needle: '<p>In-plane, posterior to anterior (lateral to medial), under the prevertebral (deep cervical) fascia and superficial to the middle scalene. Lateral border of the superior trunk, at a level where the suprascapular nerve has not yet branched off.</p>',
      inject: '<p>Inject beside the superior trunk inside its sheath so local anaesthetic surrounds the trunk and the origin of the suprascapular nerve. Watch that spread does not track medially over the anterior scalene towards the phrenic nerve.</p>',
    },
    probe: { view: 'front', at: 'lower-neck', angle: 10, label: 'transverse across the lower neck: start at the interscalene position and slide caudally.' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ suprascapular (posterior, supraspinous fossa)
  // Right shoulder from behind: probe in the supraspinous fossa, parallel to the spine of the scapula (coronal oblique),
  // tilted anteriorly to see the floor of the fossa and the suprascapular notch. Original geometry.
  suprascapular: {
    id: 'ul-sh-ssn', title: 'Suprascapular nerve: the floor of the supraspinous fossa', width: 50, depth: 45, focus: 32, skin: 1.2,
    view: 'Coronal oblique view of the right supraspinous fossa from behind, the probe parallel to the spine of the scapula and tilted forwards. Medial on the left, lateral on the right. Trapezius over supraspinatus; the bony floor of the fossa dips into the suprascapular notch, where the nerve and artery lie on bone under supraspinatus.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 5.2], [25, 5], [50, 4.6]], edge: 0.6 },
      { id: 'trap', kind: 'muscle', label: 'Trapezius', short: 'Trap', desc: 'Trapezius, superficial; supraspinatus deep to it fills the fossa.', stri: -4, echo: 0.15, dens: 0.4, edge: 0.9,
        bottom: [[0, 14.5], [20, 13.6], [36, 12.8], [50, 12]], at: [12, 9.6], lab: [12, 9.6] },
      { id: 'ssp', kind: 'muscle', label: 'Supraspinatus', short: 'SSp', desc: 'Supraspinatus fills the fossa: the nerve and artery lie deep to it, on bone.', stri: 8, echo: 0.13, dens: 0.45, edge: 0,
        bottom: [[0, 33.6], [10, 34.4], [20, 35.6], [27, 37], [31, 39.4], [34, 40.8], [37, 39.6], [41, 36.4], [46, 32], [50, 29]], at: [16, 24], lab: [16, 24] },
      { id: 'below', kind: 'connective', label: 'Below the bone', nolabel: true, echo: 0.2, edge: 0, bottom: 50 },
    ],
    lines: [
      { id: 'ssp-f', kind: 'fascia', label: 'Fascia between trapezius and supraspinatus', nolabel: true, amp: 0.85, w: 0.45, pts: [[0, 14.5], [20, 13.6], [36, 12.8], [50, 12]] },
    ],
    shapes: [
      { id: 'floor', kind: 'bone', label: 'Floor of the supraspinous fossa', short: 'Scapula', desc: 'The bony floor of the fossa: the needle tip stays on bone, under supraspinatus.',
        shape: L(1.3, [0, 34.2], [10, 35], [20, 36.2], [27, 37.6], [31, 40], [34, 41.4], [37, 40.2], [41, 37], [46, 32.6], [50, 29.6]), at: [12, 35.2], lab: [10, 39.6] },
      { id: 'ssa', kind: 'artery', label: 'Suprascapular artery', short: 'SSA', desc: 'Pulsatile, beside the nerve at the notch: colour Doppler first.', shape: E(31.8, 39, 1.1, 1), at: [31.8, 39], lab: [24, 42.6] },
      { id: 'ssn', kind: 'nerve', label: 'Suprascapular nerve', short: 'SSN', ids: BP('n-suprascapular'), desc: 'On bone in the suprascapular notch, beside the artery, deep to supraspinatus.', shape: E(34.6, 39.8, 1.4, 0.8), at: [34.6, 39.8], lab: [41, 42.4] },
      { id: 'notch', kind: 'label', label: 'Suprascapular notch', short: 'Notch', outline: false, desc: 'Where the floor of the fossa dips: the nerve passes here under the transverse scapular ligament.', shape: E(34, 41.6, 0.8, 0.5), at: [34, 41.6], lab: [34, 44] },
    ],
    target: { at: [33.6, 38.6], r: 2 },
    injections: [
      { id: 'ssn', label: 'On bone beside the artery', entry: [-6, 4], tip: [33.4, 38.4],
        spread: { along: [[24, 36], [28, 37.2], [31, 38.4], [34, 39.2], [37, 38.2], [41, 35.4], [44, 33.2]], x0: 24, x1: 44, from: 33.4, thick: 2.6, up: 1, above: 10, shape: 0.9 } },
    ],
    steps: {
      scan: '<p>Patient sitting, arm by the side. Probe on the back of the shoulder, <strong>parallel to the spine of the scapula and just cranial to it</strong>, in the supraspinous fossa. Tilt it forwards until the <strong>bony floor of the fossa</strong> is a bright line, then slide laterally until the floor dips into the <strong>suprascapular notch</strong>.</p>',
      identify: '<p><strong>Trapezius</strong> superficial, <strong>supraspinatus</strong> filling the fossa, and the bright <strong>floor</strong> with its shadow. In the notch, on bone under supraspinatus: the pulsatile <strong>suprascapular artery</strong> (colour Doppler) with the <strong>nerve</strong> beside it.</p>',
      needle: '<p><strong>In-plane, medial to lateral</strong>, through trapezius and supraspinatus, until the tip touches <strong>bone</strong> beside the artery. Aspirate.</p>',
      inject: '<p>Supraspinatus should <strong>lift off the bone</strong> as the fluid spreads along the floor of the fossa and into the notch. A swelling inside the muscle means the tip is short of bone: advance to bone.</p>',
    },
    probe: { view: 'back', at: 'supraspinous-fossa', angle: 8, label: 'on the back of the shoulder, in the supraspinous fossa, parallel to and just above the spine of the scapula.' },
    probeInset: armProbeInset,
  },

  // ------------------------------------------------------------------ axillary nerve (posterior, quadrilateral space)
  // Right posterior arm below the acromion: probe transverse (short axis of the humerus) over the posterior surgical neck.
  // Original geometry.
  'axillary-nerve': {
    id: 'ul-sh-anb', title: 'Axillary nerve: beside the posterior circumflex humeral artery', width: 45, depth: 40, focus: 22, skin: 1.2,
    view: 'Transverse view over the back of the right upper arm just below the posterior corner of the acromion, at the surgical neck of the humerus. Medial on the left, lateral on the right. Deltoid is superficial; the axillary nerve and the posterior circumflex humeral artery leave the quadrilateral space and run around the humerus deep to deltoid.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 4.4], [45, 4]], edge: 0.6 },
      { id: 'delt', kind: 'muscle', label: 'Deltoid', short: 'Delt', desc: 'Deltoid is superficial; the nerve and artery run deep to it.', stri: 6, echo: 0.15, dens: 0.45, edge: 0.9,
        bottom: [[0, 17.4], [16, 18], [24, 19.6], [34, 21], [45, 21.6]], at: [30, 11], lab: [30, 11] },
      { id: 'deep', kind: 'connective', label: 'Connective tissue', nolabel: true, echo: 0.22, edge: 0, bottom: 44 },
    ],
    shapes: [
      { id: 'tmin', kind: 'muscle', label: 'Teres minor', short: 'TMin', desc: 'Teres minor, medially, forms the upper border of the quadrilateral space.', stri: -16, echo: 0.14, dens: 0.4,
        shape: P([0, 17.6], [12, 18], [17, 21], [16, 26], [9, 28], [0, 28.4]), at: [7, 22.6], lab: [7, 22.6] },
      { id: 'tri', kind: 'muscle', label: 'Long head of triceps', short: 'Tri', desc: 'The long head of triceps lies below, medially.', stri: -30, echo: 0.13, dens: 0.4,
        shape: P([0, 28.6], [9, 28.2], [16, 26.4], [20, 31], [16, 38], [0, 40]), at: [8, 34], lab: [8, 34] },
      { id: 'hum', kind: 'bone', label: 'Humerus (surgical neck)', short: 'Hum', desc: 'The posterior surface of the surgical neck: the target sits on it, deep to deltoid.',
        shape: L(1.4, [18.4, 30.6], [21, 26.6], [25, 24], [30, 22.8], [36, 22.4], [45, 22.6]), at: [33, 22.6], lab: [38, 27] },
      { id: 'pcha', kind: 'artery', label: 'Posterior circumflex humeral artery', short: 'PCHA', desc: 'Pulsatile, beside the nerve: find it with colour Doppler first.', shape: E(21.4, 22.6, 1.3, 1.1), at: [21.4, 22.6], lab: [12, 14.4] },
      { id: 'axn', kind: 'nerve', label: 'Axillary nerve', short: 'AxN', ids: BP('n-axillary'), desc: 'Small, beside the artery, deep to deltoid on the surgical neck.', shape: E(24.2, 22.3, 1.3, 0.75, -10), at: [24.2, 22.3], lab: [28, 16] },
    ],
    target: { at: [23, 21.4], r: 1.8 },
    injections: [
      { id: 'anb', label: 'Beside the artery, deep to deltoid', entry: [52, 4.6], tip: [23.2, 21.4],
        spread: { along: [[16, 18.4], [19.4, 20.6], [23.2, 21.6], [28, 22], [33, 21.8]], x0: 16.5, x1: 33, from: 24.5, thick: 2.2, up: 1, above: 8, shape: 0.9 } },
    ],
    steps: {
      scan: '<p>Patient sitting or lateral, arm by the side. Probe <strong>transverse on the back of the upper arm</strong>, just below the posterior corner of the acromion, over the <strong>surgical neck of the humerus</strong>. Colour Doppler finds the posterior circumflex humeral artery.</p>',
      identify: '<p><strong>Deltoid</strong> superficial; the bright curve of the <strong>humerus</strong> deep to it; <strong>teres minor</strong> and the long head of <strong>triceps</strong> medially, bordering the quadrilateral space. The <strong>posterior circumflex humeral artery</strong> lies on the bone deep to deltoid, with the small <strong>axillary nerve</strong> beside it.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, through deltoid, to the plane between deltoid and the humerus, just beside the artery. Aspirate: the artery is right there.</p>',
      inject: '<p>The fluid should lift deltoid off the bone around the artery. Small volumes; watch for intravascular injection.</p>',
    },
    probe: { view: 'back', at: 'quadrilateral-space', angle: 0, label: 'transverse on the back of the upper arm, just below the posterior corner of the acromion.' },
    probeInset: armProbeInset,
  },
};
