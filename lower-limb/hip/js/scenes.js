// Hip blocks: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../shared/regional/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths
// (slim to average build, right side); nothing is traced from published images. Probe insets use the leg figure
// (../../../shared/regional/js/figures/leg.js). Every view has medial (or cranial) on screen left and the needle entering from screen right.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { legProbeInset } from '../../../shared/regional/js/figures/leg.js';

export const SCENES = {
  // ------------------------------------------------------------------ PENG
  // Right hip. Linear probe along the superior pubic ramus: lateral end on the AIIS, medial end rotated caudally.
  peng: {
    id: 'll-hip-peng', title: 'PENG: oblique view along the superior pubic ramus', width: 50, depth: 45, focus: 32, skin: 1.2,
    view: 'Oblique transverse view of the right groin, the probe lying along the superior pubic ramus with its lateral end on the anterior inferior iliac spine (AIIS). Medial on the left, lateral on the right. The psoas tendon sits on bone in the groove between the iliopubic eminence (IPE) and the AIIS.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 6.2], [25, 6.6], [50, 7]], edge: 0.7, at: [24, 3.6], lab: [24, 3.6] },
      { id: 'ip', kind: 'muscle', label: 'Iliopsoas', short: 'Iliopsoas', desc: 'The much larger, darker iliopsoas muscle belly, over the psoas tendon.', stri: 8, echo: 0.15, dens: 0.45, edge: 0, bottom: 48, at: [31, 24], lab: [31, 24] },
    ],
    lines: [
      { id: 'fi', kind: 'fascia', label: 'Fascia iliaca', short: 'FI', amp: 0.9, w: 0.45,
        desc: 'The needle passes through sartorius and fascia iliaca, then crosses iliopsoas.',
        pts: [[10.5, 19], [12.8, 14.8], [18, 14.1], [26, 12.6], [34, 12.4], [40, 13.2], [50, 14.6]], at: [27, 12.6], lab: [27, 10.2] },
    ],
    shapes: [
      { id: 'ft', kind: 'fat-deep', label: 'Femoral triangle fat', nolabel: true, shape: P([0, 6.4], [12, 6.6], [17, 9], [12.5, 14.6], [10, 20], [4, 22.5], [0, 22.5]), echo: 0.3 },
      { id: 'pect', kind: 'muscle', label: 'Pectineus', short: 'Pect', desc: 'Pectineus lies medially on the pubic ramus.', stri: -20, echo: 0.16, shape: P([0, 22.6], [6, 22], [11, 24.5], [14.5, 30], [12, 34.5], [6, 36.5], [0, 38.8]), at: [5, 29], lab: [5, 29] },
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'The needle passes through sartorius first, then fascia iliaca.', stri: 0, echo: 0.17, shape: P([33, 7.2], [42, 7.2], [50, 7.4], [50, 13.4], [44, 12.6], [37, 10]), at: [44, 9.8], lab: [44, 9.8] },
      { id: 'rf', kind: 'tendon', label: 'Rectus femoris tendon', short: 'RF', shape: E(44.5, 20.6, 4.2, 1.3, 12), nolabel: true },
      { id: 'tendon', kind: 'tendon', label: 'Psoas tendon', short: 'Tendon', desc: 'A bright oval in the groove between the two bony landmarks, under the much larger, darker iliopsoas muscle belly.', echo: 0.8, shape: E(26.2, 32.9, 3.8, 1.6, -4), at: [26.2, 32.6], lab: [36.5, 36.8] },
      { id: 'fv', kind: 'vein', label: 'Femoral vein', short: 'FV', shape: E(-0.6, 15.8, 4.2, 3.4), nolabel: true },
      { id: 'fa', kind: 'artery', label: 'Femoral artery', short: 'FA', desc: 'Superficial and medial: keep away from the femoral artery and nerve. Colour Doppler before the needle.', shape: E(7.2, 14.6, 3.5, 3.3), at: [7.2, 12], lab: [7.2, 9.6] },
      { id: 'fnh', kind: 'connective', label: 'Epineurium', nolabel: true, echo: 0.62, shape: P([12.2, 16.3], [15.6, 14.4], [19.8, 15.4], [18.6, 18], [13.8, 18.2]) },
      { id: 'fn', kind: 'nerve', label: 'Femoral nerve', short: 'FN', ids: ['lumbar:n-femoral'], desc: 'Lateral to the artery under fascia iliaca: keep the needle away from it.', shape: [E(14.4, 16.6, 1.2, 0.8), E(16.6, 15.8, 1.1, 0.75), E(18.2, 16.4, 0.9, 0.7), E(16.4, 17.2, 0.9, 0.55)], at: [15.8, 16.2], lab: [15.5, 20.5] },
      { id: 'ipe', kind: 'bone', label: 'Iliopubic eminence', short: 'IPE', desc: 'The medial of the two bony landmarks; the psoas tendon sits in the groove lateral to it.',
        shape: L(1.2, [0, 39.6], [6, 38], [10.5, 35], [14, 32.6], [16.5, 32], [19, 33.2], [22.4, 35.2]), at: [15.5, 32.2], lab: [11, 41.5] },
      { id: 'groove', kind: 'bone', label: 'Ilium', nolabel: true,
        shape: L(1.2, [21.6, 34.8], [24, 35.7], [27.5, 35.9], [31, 34.6], [34.8, 30.4]) },
      { id: 'aiis', kind: 'bone', label: 'Anterior inferior iliac spine', short: 'AIIS', desc: 'The lateral of the two bony landmarks: enter lateral to the probe so the needle clears it.',
        shape: L(1.2, [34.2, 31], [37.4, 26.6], [40, 23.6], [42.2, 23.1], [44.6, 24.2], [47.4, 26.2], [50, 27.6]), at: [41.5, 23.2], lab: [43, 31.5] },
    ],
    target: { at: [25, 35.1], r: 2 },
    injections: [
      { id: 'peng', label: 'Beneath the psoas tendon, on bone', entry: [64, -3], tip: [24.6, 34.9],
        pop: { label: 'Give: through fascia iliaca', plane: 'fi', tent: 1.2, width: 4 },
        spread: { along: [[15, 31.6], [19, 32.5], [22.4, 34.5], [24.6, 34.9], [28, 34.9], [31, 33.8], [33.5, 31.2], [36, 28.2]], x0: 17, x1: 35.5, thick: 3.6, up: 1, above: 9, shape: 1.1 } },
    ],
    steps: {
      scan: '<p>Start <strong>transverse on the ASIS</strong>: a bright curve of bone with shadow under it. Slide <strong>caudally and a little medially</strong> until the AIIS appears as a bony step. Keep the lateral end on the AIIS and <strong>rotate the medial end caudally</strong> (about 45 degrees) so the probe lies along the superior pubic ramus.</p>',
      identify: '<p>From lateral to medial on the bone line: the <strong>AIIS</strong>, a shallow groove, then the <strong>iliopubic eminence</strong>. The bright oval of the <strong>psoas tendon</strong> sits in the groove, under the bulk of iliopsoas. Superficial and medial: <strong>femoral artery</strong> (and vein), with the <strong>femoral nerve</strong> lateral to the artery under fascia iliaca. Pectineus lies medially on the pubic ramus. Colour Doppler before the needle.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, entering lateral to the probe so the needle clears the AIIS. Pass through sartorius and fascia iliaca, cross iliopsoas, and slide <strong>beneath the psoas tendon until the tip touches bone</strong>. Withdraw 1 mm and aspirate. Keep away from the femoral nerve and artery medially.</p>',
      inject: '<p>Inject 1–2 ml to confirm: the <strong>tendon lifts off the bone</strong> and fluid spreads along the bone between the eminence and the AIIS. Then the rest in 5 ml aliquots, aspirating between. If the muscle swells instead, the tip is intramuscular: advance to bone. If injection is stiff, the tip may be in periosteum, tendon or the capsule (iliofemoral ligament): withdraw 1 mm or rotate the bevel.</p>',
    },
    probe: { view: 'front', at: [64, 64], angle: 32, marker: 'right', label: 'along the superior pubic ramus, lateral end on the AIIS, medial end rotated caudally.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ supra-inguinal fascia iliaca
  // Right groin, parasagittal just medial to the ASIS, over the AIIS: the "bow-tie".
  fib: {
    id: 'll-hip-fib', title: 'Supra-inguinal fascia iliaca: parasagittal view at the bow-tie', width: 50, depth: 45, focus: 22, skin: 1.2,
    view: 'Parasagittal (longitudinal) view of the right groin just medial to the ASIS, over the AIIS. Cranial on the left, caudal on the right. Internal oblique (cranial) and sartorius (caudal) taper towards each other at the inguinal ligament: the bow-tie. Fascia iliaca lies on iliacus; the ilium slopes down into the iliac fossa cranially.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7.4], [25, 6.8], [50, 6.4]], edge: 0.7, at: [40, 3.4], lab: [40, 3.4] },
      { id: 'xp', kind: 'connective', label: 'Extraperitoneal fat', nolabel: true, echo: 0.3, edge: 0,
        bottom: [[0, 23], [10, 21.2], [20, 18.6], [28, 15.8], [34, 13.8], [40, 13.1], [46, 13.6], [50, 14.6]] },
      { id: 'il', kind: 'muscle', label: 'Iliacus', short: 'Iliacus', desc: 'Fascia iliaca lies on iliacus: the target is the plane between them.', stri: -12, echo: 0.15, dens: 0.45, edge: 0,
        bottom: [[0, 45.6], [10, 43.6], [20, 40.6], [28, 36.8], [34, 33.4], [38, 31.7], [41, 31.3], [44, 32.1], [48, 34.1], [50, 35.3]], at: [8, 33.5], lab: [8, 33.5] },
    ],
    lines: [
      { id: 'fi', kind: 'fascia', label: 'Fascia iliaca', short: 'FI', amp: 1, w: 0.55,
        desc: 'Trace fascia iliaca from caudal to cranial: the needle ends just deep to it, cranial to the AIIS.',
        pts: [[0, 23], [10, 21.2], [20, 18.6], [28, 15.8], [34, 13.8], [40, 13.1], [46, 13.6], [50, 14.6]], at: [36, 13.5], lab: [41, 18.4] },
    ],
    shapes: [
      { id: 'io', kind: 'muscle', label: 'Internal oblique', short: 'IO', desc: 'Internal oblique (cranial) and sartorius (caudal) taper towards each other: the bow-tie.', stri: -6, echo: 0.16, shape: P([0, 7.6], [10, 7.6], [20, 8.4], [27.5, 10.2], [20, 12.6], [10, 14.4], [0, 15.6]), at: [8, 11.2], lab: [8, 11.2] },
      { id: 'ta', kind: 'muscle', label: 'Transversus abdominis', short: 'TA', nolabel: true, stri: -4, echo: 0.13, shape: P([0, 16], [8, 15.2], [16, 13.8], [22, 13], [16, 15.6], [8, 17.2], [0, 18.2]) },
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius (caudal) and internal oblique (cranial) taper towards each other: the bow-tie.', stri: 6, echo: 0.17, shape: P([30.5, 10.4], [36, 8], [44, 6.9], [50, 6.6], [50, 13.4], [42, 12.2], [35, 11.6]), at: [44, 9.6], lab: [44, 9.6] },
      { id: 'bowtie', kind: 'label', label: 'Bow-tie', outline: false, shape: E(29.2, 10.4, 1, 1), at: [29.2, 10.4], lab: [27.5, 4] },
      { id: 'dcia', kind: 'artery', label: 'Deep circumflex iliac artery', short: 'DCIA', desc: 'A small pulsatile dot just superficial to fascia iliaca, cranial to the AIIS. The target is deep to it.', shape: E(14.5, 18.4, 1.5, 1.3), at: [14.5, 18.2], lab: [5.5, 24.5] },
      { id: 'ilium', kind: 'bone', label: 'Ilium and AIIS', short: 'Ilium', desc: 'The AIIS is the hump of bone with iliacus on it; the ilium slopes down into the iliac fossa cranially.',
        shape: L(1.2, [0, 45.8], [10, 43.8], [20, 40.8], [28, 37], [34, 33.6], [38, 31.9], [41, 31.5], [44, 32.3], [48, 34.3], [50, 35.5]), at: [30, 35.8], lab: [33, 41.6] },
    ],
    target: { at: [23.4, 18.5], r: 2 },
    injections: [
      { id: 'fib', label: 'Beneath fascia iliaca, cranial to the AIIS', entry: [62, 0.2], tip: [23.4, 18.6],
        pop: { label: 'Pop: through fascia iliaca', plane: 'fi', tent: 1.4, width: 4.5 },
        spread: { along: [[0, 24.4], [10, 22.6], [20, 20], [23.4, 18.9], [28, 17.2], [34, 15.2], [38, 14.4]], x0: 0, x1: 36, thick: 5.2, up: 0.55, above: 9, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>parasagittal on the ASIS</strong>, then slide medially along the inguinal ligament until the <strong>AIIS</strong> appears as a hump of bone with iliacus on it. Fine-tune until <strong>internal oblique</strong> (cranial) and <strong>sartorius</strong> (caudal) taper towards each other: the <strong>bow-tie</strong>.</p>',
      identify: '<p>Under the bow-tie: the bright line of <strong>fascia iliaca</strong> running cranially on <strong>iliacus</strong>, and the ilium sloping down into the iliac fossa. Put colour Doppler on: the <strong>deep circumflex iliac artery</strong> is a small pulsatile dot just superficial to fascia iliaca, cranial to the AIIS. The target is the plane under fascia iliaca, deep to that artery.</p>',
      needle: '<p><strong>In-plane, caudal to cranial</strong>, entering 2–4 cm below the inguinal ligament. Pass through sartorius; fascia iliaca tents, then gives, <strong>cranial to the hump of the AIIS</strong>. Stop with the tip just under fascia iliaca, on iliacus.</p>',
      inject: '<p>Inject 2 ml: fascia iliaca should <strong>lift off iliacus</strong> and the fluid run cranially, under the artery, into the iliac fossa (“unzipping”). Hydrodissect and advance a little as it opens. Give the volume in 5 ml aliquots, aspirating. Fluid above the fascia (under internal oblique) or a swelling inside iliacus means reposition.</p>',
    },
    probe: { view: 'front', at: [52, 52], angle: 84, label: 'parasagittal just medial to the ASIS, over the AIIS, crossing the inguinal ligament.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ femoral (and infra-inguinal fascia iliaca)
  // Right groin, transverse at the inguinal crease, above the origin of the profunda femoris.
  femoral: {
    id: 'll-hip-fem', title: 'Femoral nerve: transverse view at the inguinal crease', width: 50, depth: 42, focus: 18, skin: 1.2,
    view: 'Transverse view of the right groin at the inguinal crease, above the origin of the profunda femoris (only one femoral artery). Medial on the left, lateral on the right. The femoral nerve lies lateral to the artery, on iliopsoas and deep to fascia iliaca; sartorius is lateral and superficial.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which block',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7], [25, 6.6], [50, 6.2]], edge: 0, at: [30, 3.4], lab: [30, 3.4] },
      { id: 'ip', kind: 'muscle', label: 'Iliopsoas', short: 'Iliopsoas', desc: 'The femoral nerve lies on iliopsoas, deep to fascia iliaca.', stri: 6, echo: 0.15, dens: 0.45, edge: 0, bottom: 46, at: [33, 24], lab: [33, 24] },
    ],
    lines: [
      { id: 'fl', kind: 'fascia', label: 'Fascia lata', short: 'FL', desc: 'Fascia lata: superficial, over everything.', amp: 0.85, w: 0.4, pts: [[0, 7], [25, 6.6], [50, 6.2]], at: [44, 6.3], lab: [44, 3.6] },
      { id: 'fi', kind: 'fascia', label: 'Fascia iliaca', short: 'FI', amp: 0.9, w: 0.45,
        desc: 'Fascia iliaca: on iliopsoas, separating the nerve from the vessels.',
        pts: [[13.2, 18.6], [14.8, 14.1], [20, 13.2], [28, 12.4], [36, 13], [44, 13.9], [50, 14.4]], at: [27, 12.5], lab: [26, 9.6] },
    ],
    shapes: [
      { id: 'ft', kind: 'fat-deep', label: 'Femoral triangle fat', nolabel: true, shape: P([0, 7.2], [14, 7], [19, 9.4], [14.6, 14], [13, 19.5], [6, 21.5], [0, 21.5]), echo: 0.3 },
      { id: 'pect', kind: 'muscle', label: 'Pectineus', short: 'Pect', desc: 'Pectineus, medially.', stri: -18, echo: 0.16, shape: P([0, 21.8], [7, 21.4], [12.8, 23.6], [15, 30], [13, 38], [0, 40]), at: [6, 30], lab: [6, 30] },
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius, laterally.', stri: 0, echo: 0.17, shape: P([31, 6.8], [40, 6.5], [50, 6.3], [50, 13.6], [43, 13.2], [36, 11.4]), at: [44, 9.8], lab: [44, 9.8] },
      { id: 'tendon', kind: 'tendon', label: 'Psoas tendon', short: 'Tendon', nolabel: true, shape: E(22.5, 31.2, 2.8, 1.3, -6) },
      { id: 'fv', kind: 'vein', label: 'Femoral vein', short: 'FV', desc: 'Medial to the artery. The femoral sheath holds the artery and vein.', shape: E(1.4, 15, 4.4, 3.6), at: [1.4, 15], lab: [3.2, 24.8] },
      { id: 'fa', kind: 'artery', label: 'Femoral artery', short: 'FA', desc: 'The femoral sheath holds the artery and vein; the nerve is outside the sheath, behind fascia iliaca.', shape: E(10, 13.3, 3.9, 3.7), at: [10, 10.5], lab: [10, 4] },
      { id: 'fnh', kind: 'connective', label: 'Epineurium', nolabel: true, echo: 0.62, shape: P([14.6, 16.5], [18, 14], [22.9, 15.1], [21.8, 17.7], [16.6, 17.9]) },
      { id: 'fn', kind: 'nerve', label: 'Femoral nerve', short: 'FN', ids: ['lumbar:n-femoral'], desc: 'The target: a flattened hyperechoic oval or triangle on iliopsoas, deep to fascia iliaca.', shape: [E(16.6, 16.5, 1.25, 0.85), E(18.9, 15.5, 1.3, 0.8), E(21.2, 16, 1, 0.75), E(19.2, 16.95, 1, 0.6)], at: [18.6, 16.2], lab: [19, 21] },
      { id: 'head', kind: 'bone', label: 'Femoral head', short: 'Head', desc: 'The femoral head, deep to iliopsoas.',
        shape: L(1.2, [21, 39], [26, 35.8], [31, 34.2], [36, 33.8], [41, 34.4], [46, 36.2], [50, 38]), at: [36, 33.8], lab: [38, 38.6] },
    ],
    target: { at: [22.8, 15.6], r: 2 },
    injections: [
      { id: 'fnb', label: 'Femoral nerve block', entry: [64, -1], tip: [22.8, 15.4],
        target: { at: [22.6, 15.6], r: 2 },
        pop: { label: 'Pop: through fascia iliaca', plane: 'fi', tent: 1.2, width: 4 },
        spread: { along: [[13.8, 17.8], [18.5, 17.9], [22.8, 16.4], [28, 15], [34, 14.6]], x0: 14, x1: 30, thick: 3.4, up: 0.75, above: 7, shape: 1.05 } },
      { id: 'fiib', label: 'Infra-inguinal fascia iliaca', entry: [64, 3], tip: [38.2, 14.6],
        target: { at: [38.2, 14.6], r: 2 },
        pop: { label: 'Pop: through fascia iliaca', plane: 'fi', tent: 1.2, width: 4.5 },
        spread: { along: [[16, 16], [24, 14.4], [32, 14], [38.2, 14.6], [46, 15.4], [50, 15.8]], x0: 17, x1: 50, thick: 3.6, up: 0.7, above: 7, shape: 1.2 },
        steps: {
          needle: '<p>The same view, but the target is <strong>lateral</strong>: about the junction of the lateral and middle thirds of the inguinal ligament, under sartorius. In-plane from lateral; feel two gives (fascia lata, then fascia iliaca) and stop with the tip just under fascia iliaca, on iliacus, well away from the nerve.</p>',
          inject: '<p>A larger volume of dilute local anaesthetic opens the plane under fascia iliaca <strong>medially towards the femoral nerve and laterally</strong>. The femoral nerve is blocked reliably; spread up to the LFCN is less reliable from here, and the obturator nerve is rarely reached. Compare the <a href="#ch-fib">supra-inguinal approach</a>.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the inguinal crease</strong>, over the femoral pulse. If you see two arteries (the femoral and the profunda femoris), <strong>slide cranially</strong> until there is only one: the nerve is undivided and easier to see there.</p>',
      identify: '<p>Medial to lateral: <strong>femoral vein</strong>, <strong>femoral artery</strong>, then the <strong>femoral nerve</strong> as a flattened hyperechoic oval or triangle on iliopsoas, <strong>deep to fascia iliaca</strong>. Name both fasciae: fascia lata (superficial, over everything) and fascia iliaca (on iliopsoas, separating the nerve from the vessels). Tilt the probe to sharpen the nerve. Use colour Doppler.</p>',
      needle: '<p><strong>In-plane, lateral to medial.</strong> A first give at fascia lata, then fascia iliaca tents and gives <strong>lateral to the nerve</strong>. Stop with the tip just under fascia iliaca at the lateral corner of the nerve. Don’t aim at the nerve itself.</p>',
      inject: '<p>Aspirate, inject 1–2 ml: fluid should <strong>lift fascia iliaca and spread around the nerve</strong> (a doughnut, or a pool against its deep or superficial surface is enough), pushing it away from the needle. Then 5 ml aliquots, aspirating between. High resistance means stop: the tip may be on the fascia or in the nerve.</p>',
    },
    probe: { view: 'front', at: 'inguinal-crease-mid', angle: 16, marker: 'right', label: 'transverse on the inguinal crease over the femoral pulse.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ LFCN
  // Right thigh, transverse 1–2 cm medial and inferior to the ASIS: the sartorius–TFL gap.
  lfcn: {
    id: 'll-hip-lfcn', title: 'LFCN: transverse view below and medial to the ASIS', width: 40, depth: 28, focus: 10, skin: 1.1,
    view: 'Transverse view of the right thigh 1–2 cm below and medial to the ASIS. Medial on the left, lateral on the right. Fascia lata splits into a flat, fat-filled tunnel between sartorius (medial) and tensor fasciae latae (lateral); the LFCN is the small oval inside it.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7], [20, 6.9], [40, 6.6]], edge: 0, at: [8, 3.6], lab: [8, 3.6] },
      { id: 'deep', kind: 'muscle', label: 'Rectus femoris', short: 'RF', desc: 'Rectus femoris, deeper.', stri: 4, echo: 0.15, edge: 0, bottom: 32, at: [22, 21.5], lab: [22, 21.5] },
    ],
    lines: [
      { id: 'fl', kind: 'fascia', label: 'Fascia lata', short: 'FL', desc: 'Fascia lata, splitting into the tunnel between sartorius and TFL.', amp: 0.9, w: 0.4, pts: [[0, 7.1], [20, 7], [40, 6.7]], at: [33, 6.8], lab: [33, 3.6] },
    ],
    shapes: [
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius, medially.', stri: -10, echo: 0.16,
        shape: P([0, 7.6], [10, 7.6], [15.5, 8.6], [18.4, 10.6], [17.2, 13.6], [11, 16.4], [0, 17]), at: [7, 12], lab: [7, 12] },
      { id: 'tfl', kind: 'muscle', label: 'Tensor fasciae latae', short: 'TFL', desc: 'TFL, laterally.', stri: 8, echo: 0.16,
        shape: P([23.2, 10.6], [27, 8.2], [33, 7.4], [40, 7.3], [40, 17.6], [32, 17], [25.5, 14]), at: [33, 12.4], lab: [33, 12.4] },
      { id: 'tun', kind: 'fat-deep', label: 'Fat-filled tunnel', nolabel: true, echo: 0.28,
        shape: P([13, 7.3], [20, 7.2], [27, 7.4], [24, 9.9], [20.4, 11.2], [16.8, 9.8]) },
      { id: 'leaf', kind: 'fascia', label: 'Deep leaf of fascia lata', nolabel: true, amp: 0.75,
        shape: L(0.35, [13.4, 8], [17, 10.3], [20.4, 11.5], [24.2, 10.2], [27.6, 8]) },
      { id: 'lfcn', kind: 'nerve', label: 'Lateral femoral cutaneous nerve', short: 'LFCN', ids: ['lumbar:n-lfcn'], desc: 'A small hypoechoic oval (or a cluster of dots) inside the flat, fat-filled tunnel, 0.5–1 cm under the skin.', shape: [E(19.6, 9.3, 1.3, 0.75, -6), E(21.6, 9.6, 0.8, 0.55)], at: [20.2, 9.3], lab: [21, 15.8] },
    ],
    target: { at: [23.4, 9], r: 1.5 },
    injections: [
      { id: 'lfcn', label: 'Into the tunnel, lateral to the nerve', entry: [54, -0.5], tip: [23.6, 8.9],
        pop: { label: 'Give: through fascia lata', plane: 'fl', tent: 0.8, width: 3.5 },
        spread: { along: [[13.6, 8.6], [17, 10.4], [20.4, 11.1], [23.6, 9.9], [27.6, 8.2]], x0: 13.5, x1: 28.5, thick: 2.4, up: 0.65, above: 3.5, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse, 1–2 cm below and medial to the ASIS</strong>, parallel to the inguinal ligament. Or start on the femoral nerve view and slide laterally, following <strong>sartorius</strong> to its lateral edge.</p>',
      identify: '<p>Find the gap between <strong>sartorius</strong> (medial) and <strong>tensor fasciae latae</strong> (lateral). Fascia lata splits there into a <strong>flat, fat-filled tunnel</strong>; the LFCN is a small hypoechoic oval (or a cluster of dots) inside it, 0.5–1 cm under the skin. Trace it up and down: a nerve can be followed, fat lobules come and go.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, at a shallow angle, staying above TFL. Fascia lata tents, then gives. Stop with the tip <strong>in the tunnel, just lateral to the nerve</strong>. Don’t touch the nerve. Out-of-plane from caudal also works and suits a small target.</p>',
      inject: '<p>A 1 ml test: the tunnel should open around the nerve. Then 2 ml aliquots, aspirating between. The endpoint is spread <strong>in the tunnel between sartorius and TFL</strong> (or around the nerve on top of sartorius), not a needle on the nerve. Swelling inside TFL means withdraw and flatten.</p>',
    },
    probe: { view: 'front', at: [46, 50], angle: 18, marker: 'right', label: 'transverse just below and medial to the ASIS, over the sartorius–TFL gap.' },
    probeInset: legProbeInset,
  },
};
