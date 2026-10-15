// Knee blocks: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../shared/regional/DATA.md ("Scene schema"). Geometry is original, laid out from typical adult depths
// (slim to average build, right leg); nothing is traced from published images. Probe insets use the leg figure
// (../../../shared/regional/js/figures/leg.js). Transverse thigh views: medial on screen left, lateral on screen right. Coronal views of the
// knee: cranial (proximal) on screen left, caudal on screen right.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { legProbeInset } from '../../../shared/regional/js/figures/leg.js';

// ------------------------------------------------------------------ shared pieces of the anteromedial thigh
// Deep border of sartorius (the plane the femoral triangle and adductor canal injections open).
// An image-only label: a speck of tissue (0.02 mm, invisible) that carries a label in the image without adding a row to
// the "Superficial to deep" list (which lists layers only). The full layer order for each block is written into its
// sonoanatomy text instead, because the muscles, vessels and bone here are shapes rather than layers.
const tag = (id, label, short, xy, lab = xy, desc) => ({ id, kind: 'fat', label, short, ...(desc ? { desc } : {}), shape: E(xy[0], xy[1], 0.02, 0.02), at: xy, lab });

const SART_FLOOR = [[12.5, 17.6], [16, 19.6], [20, 20.4], [24, 20.6], [28, 20], [31.5, 18.6], [34.5, 16.2]];

export const SCENES = {
  // ------------------------------------------------------------------ distal femoral triangle (single shot and TKR)
  // Right thigh, transverse on the anteromedial thigh just proximal to the apex of the femoral triangle.
  ftb: {
    id: 'll-kn-ftb', title: 'Distal femoral triangle: transverse view just above the apex', width: 45, depth: 42, focus: 22, skin: 1.2,
    view: 'Transverse view of the right anteromedial thigh, just proximal to the apex of the femoral triangle (where the medial border of sartorius meets the medial border of adductor longus). Medial on the left, lateral on the right. Sartorius is the roof; the femoral artery lies under it with the vein deep to it; the saphenous nerve is lateral to the artery and the nerve to vastus medialis further lateral, against vastus medialis.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which injection',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 7.4], [22, 6.8], [45, 6.4]], edge: 0 },
      { id: 'deep', kind: 'fat-deep', label: 'Intermuscular fat', nolabel: true, echo: 0.3, edge: 0, bottom: 44 },
    ],
    lines: [
      { id: 'fl', kind: 'fascia', label: 'Fascia lata', short: 'FL', desc: 'Fascia lata, over sartorius.', amp: 0.85, w: 0.4, pts: [[0, 7.4], [22, 6.8], [45, 6.4]], at: [40, 6.5], lab: [40, 3.6] },
    ],
    alt: 'Superficial to deep: skin, subcutaneous fat, fascia lata, sartorius, then the saphenous nerve lateral to the femoral artery with the femoral vein deep to the artery; vastus medialis laterally with the nerve to vastus medialis at its edge; adductor longus then adductor magnus medially; the femur deep and lateral.',
    shapes: [
      tag('sc-t', 'Subcutaneous fat', 'Fat', [6, 3.8]),
      { id: 'al', kind: 'muscle', label: 'Adductor longus', short: 'AL', desc: 'Adductor longus: medial, above the apex.', stri: -14, echo: 0.15,
        shape: P([0, 8], [7, 8.2], [11.5, 12], [14.5, 18.5], [16, 25.5], [13.5, 31], [6, 33], [0, 33]), at: [6, 20], lab: [6, 20] },
      { id: 'am', kind: 'muscle', label: 'Adductor magnus', short: 'AM', desc: 'Adductor magnus, medial and deep to adductor longus.', stri: -8, echo: 0.14,
        shape: P([0, 33.6], [8, 33.4], [14.5, 31.8], [19.5, 33.6], [24, 37], [26, 42], [0, 42]), at: [9, 38], lab: [9, 38] },
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius: the roof.', stri: 4, echo: 0.17,
        shape: P([11.5, 9.6], [16, 7.6], [24, 7.2], [32, 7.6], [37, 9.6], [36, 13.6], ...SART_FLOOR.slice().reverse(), [11, 13.6]), at: [24, 13.2], lab: [24, 13.2] },
      { id: 'vm', kind: 'muscle', label: 'Vastus medialis', short: 'VM', desc: 'Vastus medialis, laterally (the nerve to vastus medialis at its medial edge).', stri: 10, echo: 0.15,
        shape: P([37.5, 7.4], [45, 7], [45, 39], [38, 38.4], [33, 35], [30.5, 29], [31, 24], [33.6, 19], [37, 13]), at: [40, 24], lab: [40, 24] },
      { id: 'fv', kind: 'vein', label: 'Femoral vein', short: 'FV', desc: 'Femoral vein, deep to the artery.', shape: E(19.6, 30.4, 3.9, 2.8, 8), at: [19.6, 30.4], lab: [26.5, 35.5] },
      { id: 'fa', kind: 'artery', label: 'Femoral artery', short: 'FA', desc: 'Femoral artery under sartorius, usually 2–3 cm deep (up to 4 cm or more in large thighs).', shape: E(21.6, 24.4, 3.3, 3.1), at: [20.4, 24], lab: [14.5, 27.6] },
      { id: 'sn', kind: 'nerve', label: 'Saphenous nerve', short: 'SN', ids: ['lumbar:n-saphenous'], desc: 'Saphenous nerve, lateral to the femoral artery. You don’t have to see it.', shape: E(26.2, 22.8, 1.3, 0.95, -10), at: [26.2, 22.8], lab: [27, 28.2] },
      { id: 'nvm', kind: 'nerve', label: 'Nerve to vastus medialis', short: 'NVM', ids: ['lumbar:n-fem-muscular'], desc: 'Nerve to vastus medialis, at the medial edge of vastus medialis.', shape: [E(31.6, 22.4, 1.25, 1, 20), E(32.4, 24.4, 0.8, 0.65)], at: [31.9, 23], lab: [36.5, 30.8] },
      { id: 'femur', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur, deep and lateral.', shape: L(1.2, [29, 42], [33, 40.6], [38, 39.7], [45, 39.6]), at: [38, 39.8], lab: [41, 36.2] },
    ],
    target: { at: [25.2, 21.6], r: 2 },
    injections: [
      { id: 'single', label: 'Single shot: saphenous', entry: [60, 2], tip: [25.4, 21.5],
        pop: { label: 'Pop: through the deep fascia of sartorius', plane: SART_FLOOR, tent: 1.3, width: 4.5 },
        spread: { along: SART_FLOOR, x0: 14, x1: 33.5, from: 25, thick: 4, up: 0.75, above: 9, shape: 0.85 } },
      { id: 'tkr1', label: 'TKR 1: saphenous', entry: [60, 2], tip: [25.4, 21.5],
        pop: { label: 'Pop: through the deep fascia of sartorius', plane: SART_FLOOR, tent: 1.3, width: 4.5 },
        spread: { along: SART_FLOOR, x0: 14, x1: 33.5, from: 25, thick: 4, up: 0.75, above: 9, shape: 0.85 },
        steps: {
          needle: '<p><strong>Target 1 of 3.</strong> In-plane from lateral, through sartorius. Its deep fascia tents and gives; stop with the tip <strong>lateral to the artery, beside the saphenous nerve</strong>.</p>',
          inject: '<p><strong>10 ml of 0.2% ropivacaine.</strong> Sartorius lifts off the artery and the fluid wraps the saphenous nerve. Keep the needle in the skin: the next two targets use the same entry.</p>',
        } },
      { id: 'tkr2', label: 'TKR 2: nerve to vastus medialis', entry: [60, 5], tip: [32.6, 21.2], keep: ['tkr1'],
        target: { at: [32.2, 22.4], r: 1.8 },
        pop: { label: 'Give: into the vastus medialis sheath', plane: [[30.5, 19.6], [33, 19.4], [35, 17.4]], tent: 0.9, width: 3 },
        spread: { along: [[27.5, 20.8], [30, 21.2], [32.6, 21.9], [35, 23.4], [37, 25.6]], x0: 28.5, x1: 36.5, from: 32.6, thick: 3, up: 0.6, above: 5, shape: 0.8 },
        steps: {
          needle: '<p><strong>Target 2 of 3.</strong> Withdraw a little and redirect <strong>laterally</strong>, to the nerve to vastus medialis at the medial edge of vastus medialis (often in its own fascial sheath, deep to sartorius).</p>',
          inject: '<p><strong>10 ml of 0.2% ropivacaine</strong> around the nerve to vastus medialis: the main supply of the superomedial knee capsule. The pool from target 1 is still in view.</p>',
        } },
      { id: 'tkr3', label: 'TKR 3: anterior femoral cutaneous', entry: [58, 1.4], tip: [31, 7.6], keep: ['tkr1', 'tkr2'],
        target: { at: [30, 7.6], r: 1.8 },
        pop: { label: 'Give: through fascia lata', plane: 'fl', tent: 0.8, width: 4 },
        spread: { along: [[16, 7.4], [22, 7.2], [28, 7.4], [34, 7.8], [40, 7.9]], x0: 17, x1: 41, from: 31, thick: 2.2, up: 0.35, above: 3, shape: 0.8 },
        steps: {
          needle: '<p><strong>Target 3 of 3.</strong> Withdraw almost to the skin and aim <strong>superficially</strong>: just through fascia lata, on top of sartorius. The intermediate (and medial) femoral cutaneous nerves run here towards the front of the knee.</p>',
          inject: '<p><strong>5 ml of 0.2% ropivacaine</strong> spreading under fascia lata over sartorius. Total 25 ml, 50 mg: saphenous and nerve to vastus medialis for the joint, the anterior femoral cutaneous nerves for the midline incision.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the anteromedial thigh</strong>. Find the <strong>femoral artery under sartorius</strong> (colour Doppler, or trace it down from the groin). Slide <strong>distally</strong>, watching the <strong>medial border of sartorius</strong> drift across the artery towards the medial border of adductor longus. Stop just before they meet: the distal femoral triangle, just above the apex.</p>',
      identify: '<p>Roof: <strong>sartorius</strong>. Lateral: <strong>vastus medialis</strong>; medial and deep: <strong>adductor longus</strong>, then adductor magnus. Under sartorius: the <strong>femoral artery</strong> with the vein deep to it; the <strong>saphenous nerve</strong> is a small bright oval <strong>lateral to the artery</strong>; the <strong>nerve to vastus medialis</strong> lies further lateral against vastus medialis. You don’t have to see the saphenous nerve.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, through sartorius. Its deep fascia tents, then gives. Stop with the tip <strong>deep to sartorius, lateral to the artery</strong>, beside the saphenous nerve. Aspirate.</p>',
      inject: '<p>Test 1–2 ml: sartorius should <strong>lift off the artery</strong> and fluid spread over and around it, outlining the nerve. No lift and a streak between fibres means intramuscular: advance through the fascia. Then <strong>10 ml of 0.4% ropivacaine</strong> (40 mg) in 5 ml aliquots, aspirating between.</p>',
    },
    probe: { view: 'front', at: [111, 146], angle: 8, label: 'transverse on the anteromedial thigh, just proximal to the apex of the femoral triangle.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ adductor canal proper (distal to the apex)
  acb: {
    id: 'll-kn-acb', title: 'Adductor canal: transverse view below the apex', width: 45, depth: 42, focus: 24, skin: 1.2,
    view: 'Transverse view of the right distal thigh, between the apex of the femoral triangle and the adductor hiatus. Medial on the left, lateral on the right. Sartorius now covers the canal completely; the vastoadductor membrane bridges from vastus medialis to adductor magnus over the artery; the saphenous nerve has crossed to lie anteromedial to the artery.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7.6], [22, 7.2], [45, 6.8]], edge: 0, at: [5, 3.8], lab: [5, 3.8] },
      { id: 'deep', kind: 'fat-deep', label: 'Intermuscular fat', nolabel: true, echo: 0.3, edge: 0, bottom: 44 },
    ],
    lines: [
      { id: 'fl', kind: 'fascia', label: 'Fascia lata', short: 'FL', desc: 'Fascia lata, over sartorius.', amp: 0.85, w: 0.4, pts: [[0, 7.6], [22, 7.2], [45, 6.8]], at: [41, 6.9], lab: [41, 3.6] },
      { id: 'vam', kind: 'ligament', label: 'Vastoadductor membrane', short: 'VAM', desc: 'A bright line from vastus medialis to adductor magnus, deep to sartorius, roofing the artery.', amp: 0.9, w: 0.55,
        pts: [[9, 22.6], [13, 21.6], [18, 20.8], [23, 20.6], [28, 21], [32, 21.8]], at: [14, 21.4], lab: [7.5, 17.4] },
    ],
    shapes: [
      { id: 'grac', kind: 'muscle', label: 'Gracilis', short: 'Grac', stri: -6, echo: 0.15, nolabel: true,
        shape: P([0, 8.2], [5, 8.2], [7.6, 11], [6.6, 15], [3, 16.4], [0, 16.4]) },
      { id: 'sart', kind: 'muscle', label: 'Sartorius', short: 'Sart', desc: 'Sartorius now covers the canal completely.', stri: 6, echo: 0.17,
        shape: P([5, 8.6], [12, 7.8], [22, 7.6], [30, 8.2], [34, 10.4], [32.5, 15.6], [27, 19.4], [20, 20], [13, 20.4], [8, 18], [5.5, 13]), at: [20, 13.4], lab: [20, 13.4] },
      { id: 'am', kind: 'muscle', label: 'Adductor magnus', short: 'AM', desc: 'Adductor magnus, medial in the canal.', stri: -10, echo: 0.14,
        shape: P([0, 17], [5, 17.4], [9, 22.8], [13, 27], [16, 33], [18, 42], [0, 42]), at: [6, 32], lab: [6, 32] },
      { id: 'vm', kind: 'muscle', label: 'Vastus medialis', short: 'VM', desc: 'Vastus medialis, laterally.', stri: 12, echo: 0.15,
        shape: P([33.5, 8], [45, 7.4], [45, 40], [36, 39.6], [30, 36], [27.5, 30], [29, 25], [32, 22], [34.2, 15]), at: [39, 24], lab: [39, 24] },
      { id: 'fv', kind: 'vein', label: 'Femoral vein', short: 'FV', desc: 'Femoral vein: posterior, slightly lateral to the artery.', shape: E(22.6, 31.4, 3.6, 2.6, -6), at: [22.6, 31.4], lab: [27, 37.4] },
      { id: 'fa', kind: 'artery', label: 'Femoral artery', short: 'FA', desc: 'Femoral artery, under the vastoadductor membrane.', shape: E(21.2, 25.6, 3.1, 2.95), at: [19.6, 25], lab: [12.5, 26.6] },
      { id: 'dga', kind: 'artery', label: 'Descending genicular artery', short: 'DGA', desc: 'The descending genicular artery (and its saphenous branch) arises here; avoid it.', shape: E(27.2, 23.6, 0.8, 0.7), at: [27.6, 24], lab: [34, 30.5] },
      { id: 'sn', kind: 'nerve', label: 'Saphenous nerve', short: 'SN', ids: ['lumbar:n-saphenous'], desc: 'In the canal the saphenous nerve lies anteromedial to the artery, under the vastoadductor membrane.', shape: E(18.4, 21.9, 1.25, 0.9, 12), at: [18.4, 21.9], lab: [24, 16.6] },
      { id: 'femur', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur, deep to adductor magnus and vastus medialis.', shape: L(1.2, [27, 42], [31, 40.8], [37, 40], [45, 39.8]), at: [37, 40], lab: [40.5, 36.4] },
    ],
    target: { at: [24.4, 22.4], r: 2 },
    injections: [
      { id: 'acb', label: 'Adductor canal', entry: [60, 3], tip: [24.6, 22.3],
        pop: { label: 'Pop: through the vastoadductor membrane', plane: 'vam', tent: 1.2, width: 4.5 },
        spread: { along: [[11, 22.8], [15, 21.9], [20, 21.4], [24.6, 21.6], [29, 22.4], [31.5, 23.2]], x0: 12, x1: 31, from: 24.6, thick: 3.6, up: 0.75, above: 7, shape: 0.85 } },
    ],
    steps: {
      scan: '<p>From the femoral triangle view, keep sliding <strong>distally</strong> past the apex: sartorius now covers the artery completely and adductor longus has gone, replaced by <strong>adductor magnus</strong> medially. Keep going until the artery starts to <strong>dive deep</strong> away from sartorius: that is the adductor hiatus, the end of the canal. Block between the two.</p>',
      identify: '<p>The <strong>vastoadductor membrane</strong> is a bright line from vastus medialis to adductor magnus, deep to sartorius, roofing the artery. The <strong>saphenous nerve</strong> has crossed over the artery and now lies <strong>anteromedial</strong> to it, under the membrane. Colour Doppler: the <strong>descending genicular artery</strong> (and its saphenous branch) arises here; avoid it.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong>, through sartorius. The membrane tents, then pops. Stop just under it, <strong>anterolateral to the artery</strong>. If you go too distal, the nerve may already be medial to the artery: aim over the artery’s roof, not at a point on one side.</p>',
      inject: '<p>Test 1–2 ml: fluid should <strong>spread over the artery under the membrane</strong> and reach the nerve on its medial side. Then the rest of the <strong>10 ml of 0.4% ropivacaine</strong> in 5 ml aliquots. Distal canal injections can track through the hiatus into the popliteal fossa.</p>',
    },
    probe: { view: 'front', at: [112, 214], angle: 8, label: 'transverse on the medial thigh, between the apex and the adductor hiatus.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ iPACK
  // Right knee, transverse in the popliteal fossa just proximal to the femoral condyles (distal femoral shaft).
  ipack: {
    id: 'll-kn-ipack', title: 'iPACK: transverse view just above the femoral condyles', width: 50, depth: 45, focus: 30, skin: 1.2,
    view: 'Transverse view of the back of the right knee, one or two fingerbreadths above the popliteal crease, where the femoral condyles have just merged into the flat back of the femoral shaft. Medial on the left, lateral on the right. From the skin down in the middle: tibial nerve, popliteal vein, popliteal artery, then fat over the femur. The target is the fat between the artery and the femur.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 6.8], [25, 6.4], [50, 6.8]], edge: 0.6 },
      { id: 'pf', kind: 'fat-deep', label: 'Popliteal fat', nolabel: true, echo: 0.34, edge: 0, bottom: [[0, 38.6], [12, 37.6], [25, 37.2], [38, 37.8], [50, 39.2]] },
    ],
    lines: [
      { id: 'pfa', kind: 'fascia', label: 'Popliteal fascia', short: 'Fascia', nolabel: true, amp: 0.7, w: 0.35, pts: [[0, 6.8], [25, 6.4], [50, 6.8]] },
    ],
    alt: 'Superficial to deep in the middle of the fossa: skin, subcutaneous fat, popliteal fascia, popliteal fat with the tibial nerve (the common peroneal nerve laterally along biceps femoris), the popliteal vein, the popliteal artery, the fat between the artery and the bone (the target), then the back of the femur. Semimembranosus medially, biceps femoris laterally.',
    shapes: [
      tag('sc-t', 'Subcutaneous fat', 'Fat', [25, 3.6]),
      tag('pf-t', 'Popliteal fat', 'Fat', [38, 32], [44, 33.4], 'The target is the fat between the artery and the bone.'),
      { id: 'sm', kind: 'muscle', label: 'Semimembranosus', short: 'SM', desc: 'Semimembranosus, medially.', stri: -10, echo: 0.15,
        shape: P([0, 9.6], [8, 9.2], [14, 12], [16.5, 18], [15.6, 25], [11, 30], [4, 31.6], [0, 31.6]), at: [7, 21], lab: [7, 21] },
      { id: 'st', kind: 'tendon', label: 'Semitendinosus tendon', short: 'ST', shape: E(6.6, 8.8, 3.4, 1.5, -4), nolabel: true },
      { id: 'mg', kind: 'muscle', label: 'Medial head of gastrocnemius', short: 'MG', nolabel: true, stri: 0, echo: 0.13,
        shape: P([0, 32], [6, 31.8], [11.5, 33.4], [13, 36.6], [6, 37.8], [0, 38.4]) },
      { id: 'bf', kind: 'muscle', label: 'Biceps femoris', short: 'BF', desc: 'Biceps femoris, laterally.', stri: 12, echo: 0.16,
        shape: P([37, 8.4], [44, 7.4], [50, 7.4], [50, 30], [45, 29], [40.4, 24], [38, 17], [36.4, 11.6]), at: [45, 18], lab: [45, 18] },
      // Nerves drawn as fascicle clusters: dark fascicles with bright rims and bright tissue between = the honeycomb look.
      { id: 'tn-epi', kind: 'aponeurosis', label: 'Tibial nerve sheath', nolabel: true, echo: 0.55, shape: P([22.4, 15.4], [26.6, 13.8], [31, 15], [30.6, 18.7], [26.4, 19.8], [22.6, 18.4]) },
      { id: 'tn', kind: 'nerve', label: 'Tibial nerve', short: 'TN', ids: ['sacral:n-tibial'], desc: 'Tibial nerve: superficial and central, bright and honeycombed against the popliteal fat. Stay well deep to it.',
        shape: [E(24.2, 16.2, 1.05, 0.85), E(26.6, 15.4, 1.1, 0.85), E(29, 16, 1, 0.85), E(25.2, 18.1, 1, 0.8), E(27.6, 17.7, 1.05, 0.85), E(29.7, 17.9, 0.7, 0.6), E(23.4, 17.7, 0.55, 0.5)],
        at: [26.6, 16.6], lab: [21, 11.4] },
      { id: 'cpn-epi', kind: 'aponeurosis', label: 'Common peroneal nerve sheath', nolabel: true, echo: 0.55, shape: E(37.6, 13.4, 2.9, 1.9, -18) },
      { id: 'cpn', kind: 'nerve', label: 'Common peroneal nerve', short: 'CPN', ids: ['sacral:n-common-fibular'], desc: 'Common peroneal nerve: lateral, along biceps femoris.',
        shape: [E(36.2, 13.6, 0.85, 0.7), E(37.9, 12.8, 0.85, 0.7), E(38.9, 14.2, 0.75, 0.6), E(37.2, 14.6, 0.55, 0.45)],
        at: [37.6, 13.4], lab: [38.2, 3.8] },
      { id: 'pv', kind: 'vein', label: 'Popliteal vein', short: 'PV', desc: 'The vein is compressible.', shape: E(25.6, 24, 3.6, 2.5, -6), at: [27.6, 24], lab: [36.5, 25.6] },
      { id: 'pa', kind: 'artery', label: 'Popliteal artery', short: 'PA', desc: 'The artery pulses and lies deeper (the deepest of the bundle) and usually more medial.', shape: E(22.6, 30.2, 3.1, 2.95), at: [20.2, 30.6], lab: [12, 26.2] },
      { id: 'femur', kind: 'bone', label: 'Femur (back of the shaft)', short: 'Femur', desc: 'The femur: a flat bony line. The target is the fat between the artery and the bone.',
        shape: L(1.2, [3, 39.4], [12, 38.2], [25, 37.8], [38, 38.4], [46, 39.8], [50, 41]), at: [31, 38], lab: [38, 42.6] },
    ],
    target: { at: [35.5, 35.8], r: 2.2 },
    injections: [
      { id: 'ipack', label: 'Between artery and femur', entry: [-16, 31], tip: [37.5, 35.9],
        spread: { along: [[7, 36.8], [14, 36.1], [22, 35.6], [30, 35.9], [38, 36.5], [44, 37.4]], x0: 9, x1: 43, from: 36, thick: 4.2, up: 1, above: 10, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse in the popliteal crease</strong>: the two <strong>femoral condyles</strong> are bright humps of bone with the popliteal artery sitting between them. Slide <strong>proximally</strong> a finger’s breadth until the condyles merge into the <strong>flat back of the femoral shaft</strong>. Stop there: the artery now lies on fat over flat bone.</p>',
      identify: '<p>Medial: <strong>semimembranosus</strong> (with the semitendinosus tendon on it). Lateral: <strong>biceps femoris</strong>. In the middle, superficial to deep: <strong>tibial nerve</strong>, <strong>popliteal vein</strong>, <strong>popliteal artery</strong> (colour Doppler), then fat on the <strong>femur</strong>. The <strong>common peroneal nerve</strong> lies laterally, along biceps. The target is the fat <strong>between the artery and the bone</strong>.</p>',
      needle: '<p><strong>In-plane, medial to lateral</strong>, entering on the medial side of the knee (anteromedial when supine with the knee bent), passing <strong>deep to the artery, just above the bone</strong>. Advance until the tip is <strong>1–2 cm beyond the lateral edge of the artery</strong>. Stay well deep to the tibial and common peroneal nerves.</p>',
      inject: '<p>Aspirate, then inject in 5 ml aliquots <strong>while withdrawing</strong> from lateral to medial, so the fluid fills the interspace between the artery and the femur along its length. Watch the artery lift off the bone. <strong>20 ml of 0.2% ropivacaine.</strong> Fluid tracking up around the tibial nerve means you are too superficial.</p>',
    },
    probe: { view: 'back', at: [82, 270], angle: 0, label: 'transverse at the back of the knee, a finger’s breadth above the popliteal crease (patient prone, or supine with the knee bent and the hip turned out).' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ genicular: superomedial
  smgn: {
    id: 'll-kn-smgn', title: 'Superomedial genicular nerve: coronal view of the medial femur', width: 40, depth: 24, focus: 15, skin: 1.1,
    view: 'Coronal (longitudinal) view of the medial side of the right distal femur, the probe along the limb. Cranial (thigh) on the left, caudal (knee) on the right. The flat femoral shaft on the left rises into the medial epicondyle on the right; the superior medial genicular artery and nerve lie on the bone at that junction, deep to vastus medialis.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 5.4], [20, 5.2], [40, 5]], edge: 0.7 },
      { id: 'vm', kind: 'muscle', label: 'Vastus medialis', nolabel: true, stri: 6, echo: 0.15, dens: 0.45, edge: 0.85, edgeW: 0.45,
        bottom: [[0, 16.4], [12, 16.4], [17, 16], [21, 14.8], [25, 12.6], [29, 10.4], [33, 9.2], [40, 8.8]] },
      { id: 'peri', kind: 'connective', label: 'Periosteal fat', nolabel: true, echo: 0.28, edge: 0,
        bottom: [[0, 17.4], [12, 17.4], [17, 17], [21, 15.8], [25, 13.6], [29, 11.4], [33, 10.2], [40, 9.8]] },
    ],
    lines: [],
    alt: 'Superficial to deep: skin, subcutaneous fat, vastus medialis and its deep fascia, the superior medial genicular artery and nerve on the periosteum, then the femur rising into the medial epicondyle.',
    shapes: [
      tag('sc-t', 'Subcutaneous fat', 'Fat', [6, 3]),
      tag('vm-t', 'Vastus medialis', 'VM', [27, 8.2], [27, 8.2], 'Vastus medialis and its deep fascia, over the artery.'),
      { id: 'smga', kind: 'artery', label: 'Superior medial genicular artery', short: 'SMGA', desc: 'The superior medial genicular artery (and nerve) on the periosteum: the artery is the marker.', shape: E(19.6, 15.7, 1.1, 1), at: [19.6, 15.6], lab: [12, 21.6] },
      { id: 'smgn', kind: 'nerve', label: 'Superomedial genicular nerve', short: 'SMGN', shape: E(21.6, 15.3, 0.6, 0.45, -24), nolabel: true },
      { id: 'femur', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur rising into the medial epicondyle.',
        shape: L(1.2, [0, 18], [12, 18], [17, 17.6], [21, 16.4], [25, 14.2], [29, 12], [33, 10.8], [40, 10.4]), at: [8, 18], lab: [5, 21.6] },
      { id: 'epi', kind: 'label', label: 'Medial epicondyle', short: 'Epicondyle', outline: false, shape: E(35, 10.6, 1, 1), at: [35, 10.6], lab: [32, 15.6] },
    ],
    target: { at: [20.4, 16.2], r: 1.6 },
    injections: [
      { id: 'smgn', label: 'SMGN', entry: [-12, 1], tip: [18.6, 16.6],
        pop: { label: 'Give: through the deep fascia of vastus medialis', plane: 'vm', tent: 0.9, width: 3.5 },
        spread: { along: [[8, 17.2], [13, 17.1], [17, 16.7], [21, 15.5], [24.5, 13.8], [27, 12.6]], x0: 9, x1: 28, from: 18.6, thick: 3.2, up: 1, above: 5, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>coronal over the medial epicondyle</strong> (along the limb, on the inner side of the knee). Slide <strong>proximally</strong> until the bony bump of the epicondyle is at one end of the image and the <strong>flat femoral shaft</strong> at the other: the junction of shaft and condyle is the target zone.</p>',
      identify: '<p>Under <strong>vastus medialis</strong>, on the bone at the junction: the <strong>superior medial genicular artery</strong> (a pulsing dot on colour Doppler, often just in front of the adductor tubercle). The nerve runs with it and is usually too small to see: <strong>the artery is your target marker</strong>.</p>',
      needle: '<p><strong>In-plane, cranial to caudal</strong> (out-of-plane also works). Through vastus medialis and its deep fascia, down to <strong>periosteum beside the artery</strong>. Touch bone, withdraw 1 mm, aspirate: the artery is right there.</p>',
      inject: '<p><strong>4–5 ml of 0.2% ropivacaine</strong>: fluid should spread along the bone, around the artery, lifting vastus medialis. A swelling inside the muscle means the tip is short of bone.</p>',
    },
    probe: { view: 'front', at: [114, 270], angle: 90, label: 'along the limb on the inner side of the knee, over the junction of the femoral shaft and the medial epicondyle.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ genicular: superolateral
  slgn: {
    id: 'll-kn-slgn', title: 'Superolateral genicular nerve: coronal view of the lateral femur', width: 40, depth: 24, focus: 15, skin: 1.1,
    view: 'Coronal (longitudinal) view of the lateral side of the right distal femur. Cranial on the left, caudal on the right. The flat femoral shaft rises into the lateral epicondyle; the superior lateral genicular artery lies on the bone at the junction, deep to vastus lateralis and the iliotibial band.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 4.6], [20, 4.4], [40, 4.2]], edge: 0, at: [6, 2.6], lab: [6, 2.6] },
      { id: 'itb', kind: 'aponeurosis', label: 'Iliotibial band', short: 'ITB', desc: 'Iliotibial band, over vastus lateralis.', bottom: [[0, 6.6], [20, 6.4], [40, 6.2]], echo: 0.6, at: [30, 5.4], lab: [30, 2.6] },
      { id: 'vl', kind: 'muscle', label: 'Vastus lateralis', short: 'VL', desc: 'Vastus lateralis, under the iliotibial band.', stri: 8, echo: 0.15, dens: 0.45, edge: 0.85, edgeW: 0.45,
        bottom: [[0, 16.8], [12, 16.8], [17, 16.4], [21, 15.2], [25, 13.2], [29, 11.2], [33, 10], [40, 9.6]], at: [27, 9.2], lab: [27, 9.2] },
      { id: 'peri', kind: 'connective', label: 'Periosteal fat', nolabel: true, echo: 0.28, edge: 0,
        bottom: [[0, 17.8], [12, 17.8], [17, 17.4], [21, 16.2], [25, 14.2], [29, 12.2], [33, 11], [40, 10.6]] },
    ],
    lines: [],
    shapes: [
      { id: 'slga', kind: 'artery', label: 'Superior lateral genicular artery', short: 'SLGA', desc: 'The superior lateral genicular artery on the periosteum: the artery is the marker.', shape: E(19.8, 16.1, 1.1, 1), at: [19.8, 16], lab: [12, 21.8] },
      { id: 'slgn', kind: 'nerve', label: 'Superolateral genicular nerve', short: 'SLGN', shape: E(21.8, 15.6, 0.6, 0.45, -24), nolabel: true },
      { id: 'femur', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur rising into the lateral epicondyle.',
        shape: L(1.2, [0, 18.4], [12, 18.4], [17, 18], [21, 16.8], [25, 14.8], [29, 12.8], [33, 11.6], [40, 11.2]), at: [8, 18.4], lab: [5, 21.8] },
      { id: 'epi', kind: 'label', label: 'Lateral epicondyle', short: 'Epicondyle', outline: false, shape: E(35, 11.4, 1, 1), at: [35, 11.4], lab: [32, 16.2] },
    ],
    target: { at: [20.6, 16.6], r: 1.6 },
    injections: [
      { id: 'slgn', label: 'SLGN', entry: [-12, 1], tip: [18.8, 17],
        pop: { label: 'Give: through the deep fascia of vastus lateralis', plane: 'vl', tent: 0.9, width: 3.5 },
        spread: { along: [[8, 17.6], [13, 17.5], [17, 17.1], [21, 15.9], [24.5, 14.3], [27, 13.1]], x0: 9, x1: 28, from: 18.8, thick: 3.2, up: 1, above: 5, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>coronal over the lateral epicondyle</strong>, then slide <strong>proximally</strong> until the flat femoral shaft and the rise of the condyle share the image.</p>',
      identify: '<p>Superficial to deep: the bright <strong>iliotibial band</strong>, <strong>vastus lateralis</strong>, then bone. The <strong>superior lateral genicular artery</strong> sits on the bone at the shaft–condyle junction (colour Doppler). The common peroneal nerve is far posterior to this view.</p>',
      needle: '<p><strong>In-plane, cranial to caudal</strong> (or out-of-plane). Through the iliotibial band and vastus lateralis to <strong>periosteum beside the artery</strong>. Withdraw 1 mm, aspirate.</p>',
      inject: '<p><strong>4–5 ml of 0.2% ropivacaine</strong> spreading along the bone around the artery.</p>',
    },
    probe: { view: 'front', at: [40, 270], angle: 90, label: 'along the limb on the outer side of the knee, over the junction of the femoral shaft and the lateral epicondyle.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ genicular: inferomedial
  imgn: {
    id: 'll-kn-imgn', title: 'Inferomedial genicular nerve: coronal view of the medial tibia', width: 40, depth: 20, focus: 12, skin: 1.1,
    view: 'Coronal (longitudinal) view of the medial side of the right proximal tibia. Cranial on the left, caudal on the right. The tibial condyle (left) slopes down into the shaft (right); the inferior medial genicular artery runs on the bone at that junction, deep to the medial collateral ligament.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 5.2], [20, 5.4], [40, 5.6]], edge: 0, at: [32, 3], lab: [32, 3] },
      { id: 'mcl', kind: 'ligament', label: 'Medial collateral ligament', short: 'MCL', desc: 'The medial collateral ligament, over the artery.', echo: 0.62,
        bottom: [[0, 8], [12, 8.2], [16, 8.8], [20, 10], [24, 11.1], [30, 11.6], [40, 11.8]], at: [9, 6.6], lab: [9, 3] },
      { id: 'peri', kind: 'connective', label: 'Periosteal fat', nolabel: true, echo: 0.3, edge: 0,
        bottom: [[0, 9.2], [12, 9.4], [16, 10], [20, 11.4], [24, 12.6], [30, 13.2], [40, 13.4]] },
    ],
    lines: [],
    shapes: [
      { id: 'imga', kind: 'artery', label: 'Inferior medial genicular artery', short: 'IMGA', desc: 'The inferior medial genicular artery on the periosteum: the artery is the marker.', shape: E(20.6, 11.05, 1, 0.9), at: [20.6, 11], lab: [27, 17.4] },
      { id: 'imgn', kind: 'nerve', label: 'Inferomedial genicular nerve', short: 'IMGN', shape: E(18.8, 10.6, 0.55, 0.42, 24), nolabel: true },
      { id: 'tibia', kind: 'bone', label: 'Tibia', short: 'Tibia', desc: 'The tibia sloping from the condyle into the shaft.',
        shape: L(1.2, [0, 9.8], [12, 10], [16, 10.6], [20, 12], [24, 13.2], [30, 13.8], [40, 14]), at: [34, 13.9], lab: [34.5, 16.2] },
      { id: 'cond', kind: 'label', label: 'Medial tibial condyle', short: 'Condyle', outline: false, shape: E(6, 10, 1, 1), at: [6, 10], lab: [8, 15.4] },
    ],
    target: { at: [20, 11.8], r: 1.5 },
    injections: [
      { id: 'imgn', label: 'IMGN', entry: [52, 0.5], tip: [21.6, 12.4],
        pop: { label: 'Give: through the MCL', plane: 'mcl', tent: 0.8, width: 3.5 },
        spread: { along: [[13, 9.8], [16.5, 10.4], [20, 11.6], [24, 12.6], [29, 13]], x0: 13, x1: 30, from: 21.6, thick: 2.8, up: 1, above: 4, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>coronal over the medial tibial condyle</strong>, just below the joint line. Slide <strong>distally</strong> until the condyle slopes down into the tibial shaft.</p>',
      identify: '<p>The bright, fibrillar <strong>medial collateral ligament</strong> runs over the bone. Deep to it, on the bone at the slope: the <strong>inferior medial genicular artery</strong> (colour Doppler). The nerve runs with it.</p>',
      needle: '<p><strong>In-plane, caudal to cranial</strong> (or out-of-plane), at a shallow angle under the ligament, to <strong>periosteum beside the artery</strong>. Withdraw 1 mm and aspirate.</p>',
      inject: '<p><strong>4–5 ml of 0.2% ropivacaine</strong>: the ligament lifts off the bone as fluid spreads around the artery.</p>',
    },
    probe: { view: 'front', at: [110, 300], angle: 90, label: 'along the limb on the inner side of the knee, just below the joint line, over the medial tibial condyle.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ obturator: proximal interfascial
  // Right groin, transverse on the inguinal crease medial to the femoral vein, probe tilted cranially.
  obtProx: {
    id: 'll-kn-obtp', title: 'Obturator, proximal: deep to pectineus, tilted towards the pubic ramus', width: 50, depth: 45, focus: 26, skin: 1.2,
    view: 'Transverse view of the right groin on the inguinal crease, medial to the femoral vein, with the probe tilted cranially (towards the pelvis) until the inferior edge of the superior pubic ramus appears. Medial on the left, lateral on the right. Pectineus lies superficially; obturator externus lies deep to it; the target is the fascial plane between them.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', nolabel: true, bottom: [[0, 7.6], [25, 7], [50, 6.8]], edge: 0 },
      { id: 'deep', kind: 'fat-deep', label: 'Deep fat', nolabel: true, echo: 0.28, edge: 0, bottom: 46 },
    ],
    lines: [
      { id: 'fl', kind: 'fascia', label: 'Fascia lata', short: 'FL', nolabel: true, amp: 0.8, w: 0.4, pts: [[0, 7.6], [25, 7], [50, 6.8]] },
      { id: 'plane', kind: 'fascia', label: 'Pectineus–obturator externus plane', short: 'Plane', ids: ['lumbar:n-obturator'], desc: 'Proximally, the target is the fascial plane between pectineus and obturator externus, just below the pubic ramus: the obturator nerve and vessels run in it.', amp: 0.95, w: 0.5,
        pts: [[2, 27], [8, 25.6], [14, 24.8], [20, 24.6], [26, 25], [31, 26.4], [34, 28]], at: [12, 25], lab: [10, 20.6] },
    ],
    alt: 'Superficial to deep: skin, subcutaneous fat, fascia lata, pectineus (adductor longus medially, the femoral vein laterally), the fascial plane with the obturator nerve and vessels, obturator externus, with the superior pubic ramus deep and lateral.',
    shapes: [
      tag('sc-t', 'Subcutaneous fat', 'Fat', [30, 3.8]),
      { id: 'al', kind: 'muscle', label: 'Adductor longus', short: 'AL', desc: 'Adductor longus, medially.', stri: -12, echo: 0.15,
        shape: P([0, 8.2], [8, 8], [11.5, 11.4], [10, 16.6], [4, 19], [0, 19.6]), at: [8.4, 10.6], lab: [8.4, 10.6] },
      { id: 'pect', kind: 'muscle', label: 'Pectineus', short: 'Pect', desc: 'Pectineus, superficial to the target plane.', stri: -16, echo: 0.16,
        shape: P([12, 8.4], [24, 7.8], [36, 8.2], [40.5, 11], [40, 17], [36, 23], [31, 26.2], [26, 24.8], [20, 24.4], [14, 24.6], [8, 25.4], [4, 22], [5, 19.8], [10.6, 17], [12.6, 12]), at: [24, 15.6], lab: [24, 15.6] },
      { id: 'oe', kind: 'muscle', label: 'Obturator externus', short: 'OE', desc: 'Obturator externus, deep to the plane, on the obturator membrane.', stri: 10, echo: 0.13,
        shape: P([0, 27.6], [8, 26.2], [14, 25.4], [20, 25.2], [26, 25.6], [31, 27], [34.6, 29.6], [33, 36], [26, 40], [14, 41], [0, 41]), at: [16, 33.4], lab: [16, 33.4] },
      { id: 'fv', kind: 'vein', label: 'Femoral vein', short: 'FV', desc: 'The femoral vein, laterally.', shape: E(46, 15.4, 4, 3.1), at: [46, 15.4], lab: [46, 23.4] },
      { id: 'oa', kind: 'artery', label: 'Obturator artery branch', short: 'Obt a.', shape: E(27.8, 25.9, 0.75, 0.65), nolabel: true },
      { id: 'ramus', kind: 'bone', label: 'Superior pubic ramus', short: 'Ramus', desc: 'The superior pubic ramus, deep and lateral.',
        shape: L(1.2, [33.6, 31], [36, 28.6], [40, 27.4], [45, 27.6], [50, 28.6]), at: [41, 27.4], lab: [43, 34] },
    ],
    target: { at: [23, 25], r: 2 },
    injections: [
      { id: 'obtp', label: 'Between pectineus and obturator externus', entry: [-14, -1], tip: [22.6, 24.9],
        pop: { label: 'Give: through the deep fascia of pectineus', plane: 'plane', tent: 1.2, width: 4.5 },
        spread: { along: [[4, 26.4], [9, 25.4], [14, 24.8], [20, 24.6], [25, 25], [30, 26.2], [33, 27.6]], x0: 5, x1: 33, from: 22.6, thick: 4, up: 0.55, above: 8, shape: 0.85 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the inguinal crease</strong>; find the femoral vein, then slide <strong>medially</strong> onto <strong>pectineus</strong>. Now <strong>tilt the probe cranially</strong> (aim the beam up towards the pelvis, about 40–50 degrees) until the bright edge of the <strong>superior pubic ramus</strong> appears deep and lateral.</p>',
      identify: '<p>Superficial: <strong>pectineus</strong> (with adductor longus medially). Deep to it: <strong>obturator externus</strong>, lying on the obturator membrane. The bright <strong>fascial plane between them</strong> is the target; the obturator nerve (still often undivided) and the obturator vessels run in it. Colour Doppler first.</p>',
      needle: '<p><strong>In-plane, medial to lateral</strong>, through adductor longus and pectineus, so the needle stays well away from the femoral vein on the lateral side of the image. A give through the deep fascia of pectineus; stop with the tip <strong>in the plane between pectineus and obturator externus</strong>. Out-of-plane from caudal is the original description; in-plane from lateral is also described, but then the path must not cross the vein.</p>',
      inject: '<p>Aspirate, inject 2 ml: the plane should <strong>open between the two muscles</strong>, not swell either muscle. Then the rest: <strong>10 ml of 0.5% ropivacaine</strong>. Test adductor strength at 15–20 minutes.</p>',
    },
    probe: { view: 'front', at: [118, 76], angle: 12, label: 'transverse on the inguinal crease, medial to the femoral vein, tilted cranially towards the pubic ramus.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ obturator: distal (anterior and posterior divisions)
  obtDist: {
    id: 'll-kn-obtd', title: 'Obturator, distal: the adductor layers below the crease', width: 50, depth: 45, focus: 24, skin: 1.2,
    view: 'Transverse view of the right medial thigh 1–3 cm below the inguinal crease. Medial on the left, lateral on the right. Three adductor layers from superficial to deep: adductor longus, adductor brevis, adductor magnus, with pectineus laterally. The anterior division lies between adductor longus (or pectineus) and brevis; the posterior division between brevis and magnus.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    injectionLabel: 'Which division',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7], [25, 6.6], [50, 6.4]], edge: 0, at: [8, 3.6], lab: [8, 3.6] },
      { id: 'al', kind: 'muscle', label: 'Adductor longus', short: 'AL', desc: 'Adductors from front to back: “long, brief, massive”. Adductor longus is the first.', stri: -10, echo: 0.16, edge: 0.9, edgeW: 0.45,
        bottom: [[0, 16.6], [12, 17.4], [22, 18.4], [32, 19.2], [40, 18.6], [50, 17.6]], at: [14, 12], lab: [14, 12] },
      { id: 'ab', kind: 'muscle', label: 'Adductor brevis', short: 'AB', desc: 'Adductor brevis, between the anterior and posterior divisions.', stri: -6, echo: 0.14, edge: 0.9, edgeW: 0.45,
        bottom: [[0, 29], [12, 30.2], [22, 31.4], [32, 32.2], [42, 31.8], [50, 31]], at: [12, 24], lab: [12, 24] },
      { id: 'am', kind: 'muscle', label: 'Adductor magnus', short: 'AM', desc: 'Adductor magnus, the deepest of the three layers.', stri: -4, echo: 0.13, edge: 0, bottom: 46, at: [14, 38], lab: [14, 38] },
    ],
    lines: [],
    shapes: [
      { id: 'pect', kind: 'muscle', label: 'Pectineus', short: 'Pect', desc: 'Pectineus, laterally.', stri: -16, echo: 0.16,
        shape: P([36, 7], [50, 6.6], [50, 18.2], [44, 19], [38, 18.4], [34.6, 13.4]), at: [44, 12.4], lab: [44, 12.4] },
      { id: 'ant', kind: 'nerve', label: 'Anterior division', short: 'Ant div', ids: ['lumbar:n-obt-ant'], desc: 'A flat, bright, spindle shape in the fascia between adductor longus and brevis.', shape: P([19, 18.2], [22, 17.8], [26, 18.4], [24.8, 19.4], [20.4, 19.2]), at: [22.4, 18.6], lab: [29, 23.8] },
      { id: 'post', kind: 'nerve', label: 'Posterior division', short: 'Post div', ids: ['lumbar:n-obt-post'], desc: 'A flat, bright, spindle shape in the fascia between adductor brevis and magnus.', shape: P([21.6, 31.2], [24.6, 30.8], [28.6, 31.6], [27.4, 32.6], [23, 32.4]), at: [25, 31.7], lab: [34, 36.6] },
    ],
    target: { at: [26.6, 18.8], r: 1.8 },
    injections: [
      { id: 'ant', label: 'Anterior division', entry: [62, 0], tip: [27, 18.9], target: { at: [26.6, 18.8], r: 1.8 },
        pop: { label: 'Give: through the fascia under adductor longus', plane: 'al', tent: 1, width: 4 },
        spread: { along: [[12, 17.4], [18, 18], [22, 18.4], [27, 18.8], [32, 19.2], [37, 18.9]], x0: 13, x1: 37, from: 27, thick: 2.8, up: 0.5, above: 6, shape: 0.85 } },
      { id: 'post', label: 'Posterior division', entry: [62, 4], tip: [29.4, 31.9], target: { at: [29, 31.9], r: 1.8 }, keep: ['ant'],
        pop: { label: 'Give: through the fascia under adductor brevis', plane: 'ab', tent: 1, width: 4 },
        spread: { along: [[14, 30.4], [20, 31], [24, 31.5], [29, 31.9], [34, 32.2], [40, 31.9]], x0: 15, x1: 40, from: 29.4, thick: 2.8, up: 0.5, above: 6, shape: 0.85 },
        steps: {
          needle: '<p>Advance (or redirect) <strong>deeper, through adductor brevis</strong>: a second give through its deep fascia. Stop with the tip <strong>between adductor brevis and adductor magnus</strong>, beside the posterior division.</p>',
          inject: '<p><strong>5 ml</strong> into the deeper plane. Two planes open: anterior and posterior divisions both bathed. The posterior division carries the articular branch to the back of the knee.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the medial thigh</strong>, 1–3 cm below the inguinal crease (or start at the femoral vein and slide medially). The hip slightly abducted and turned out.</p>',
      identify: '<p>Name the layers, superficial to deep: <strong>adductor longus, adductor brevis, adductor magnus</strong> (“long, brief, massive”), with pectineus laterally. The divisions are flat, bright, spindle shapes <strong>in the fascia between the layers</strong>: anterior between longus and brevis, posterior between brevis and magnus. You don’t need to see them; find the planes.</p>',
      needle: '<p><strong>In-plane, lateral to medial</strong> (a stimulator helps: adductor twitch). Through adductor longus; a give through its deep fascia. Stop with the tip <strong>between adductor longus and adductor brevis</strong>, beside the anterior division.</p>',
      inject: '<p><strong>5 ml</strong> into the plane between longus and brevis: it should open as a flat lens, not swell a muscle. Then go deeper for the posterior division (choose “Posterior division” above).</p>',
    },
    probe: { view: 'front', at: [128, 92], angle: 10, label: 'transverse on the medial thigh, 1–3 cm below the inguinal crease.' },
    probeInset: legProbeInset,
  },
};
