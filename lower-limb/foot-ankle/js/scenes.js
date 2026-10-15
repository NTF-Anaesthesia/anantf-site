// Foot and ankle blocks: ultrasound and landmark scenes (millimetres; x across the screen from the left, y = depth
// from the skin). Schema: ../../../shared/regional/DATA.md ("Scene schema"). Geometry is original, laid out from typical
// adult depths and sizes (slim to average build, right leg); nothing is traced from published images. Probe insets use
// the leg figure (../../../shared/regional/js/figures/leg.js). In every view the needle enters from screen right, the probe marker is on
// the needle side, and both ends of the image are named.
import { E, P, L } from '../../../shared/regional/js/scene.js';
import { legProbeInset } from '../../../shared/regional/js/figures/leg.js';

// A closed ring of points (for a thin membrane drawn as an open polyline that closes on itself).
const ring = (cx, cy, rx, ry, n = 28) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (i / n) * Math.PI * 2;
  return [+(cx + rx * Math.cos(a)).toFixed(2), +(cy + ry * Math.sin(a)).toFixed(2)];
});
// A nerve drawn as fascicles (hypoechoic dots) inside a bright epineurium: the "honeycomb".
function nerve(id, label, short, cx, cy, rx, ry, opts = {}) {
  const n = opts.n ?? 5;
  const fasc = [];
  const k = [[-0.45, -0.25], [0.05, -0.4], [0.45, -0.15], [-0.25, 0.3], [0.3, 0.35], [-0.6, 0.1], [0.0, 0.05], [0.62, 0.18]];
  for (let i = 0; i < n; i++) {
    const [fx, fy] = k[i % k.length];
    fasc.push(E(+(cx + fx * rx).toFixed(2), +(cy + fy * ry).toFixed(2), +(rx * 0.26).toFixed(2), +(ry * 0.3).toFixed(2), (i * 37) % 60 - 30));
  }
  return [
    { id: `${id}-epi`, kind: 'connective', label: 'Epineurium', nolabel: true, echo: 0.85, shape: E(cx, cy, rx, ry, opts.rot || 0) },
    { id: `${id}-rim`, kind: 'membrane', label: 'Epineurium', nolabel: true, amp: 0.75, shape: L(Math.max(0.18, ry * 0.12), ...ring(cx, cy, rx, ry, 24)) },
    { id, kind: 'nerve', label, short, ...(opts.ids ? { ids: opts.ids } : {}), ...(opts.desc ? { desc: opts.desc } : {}), shape: fasc, at: opts.at || [cx, cy], lab: opts.lab },
  ];
}

export const SCENES = {
  // ------------------------------------------------------------------ popliteal sciatic
  // Right leg, patient lateral (or prone), probe transverse on the back of the thigh at the sciatic bifurcation,
  // about 6 cm above the popliteal crease. Medial on the left, lateral on the right; needle from lateral.
  popliteal: {
    id: 'll-fa-pop', title: 'Popliteal sciatic: transverse view at the bifurcation', width: 46, depth: 46, focus: 24, skin: 1.4,
    view: 'Transverse view of the back of the right thigh, about 6 cm above the popliteal crease, where the sciatic nerve divides. Medial on the left, lateral on the right. The tibial (medial, larger) and common peroneal (lateral, smaller) nerves lie side by side in one paraneural sheath, superficial to the popliteal vein and artery, between semimembranosus and biceps femoris. Drawn in a slim leg, with the nerves about 2.5 cm deep; in an average adult they are nearer 3–4 cm deep.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'right' },
    injectionLabel: 'Where the tip ends',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'SC fat', desc: 'Subcutaneous fat, over the popliteal fossa.', bottom: [[0, 9.2], [23, 10.2], [46, 8.8]], edge: 0.75, at: [24, 5.4], lab: [24, 5.4] },
      { id: 'pf', kind: 'fat-deep', label: 'Popliteal fat', short: 'Pop fat', desc: 'The nerves lie in the popliteal fat, between semimembranosus and biceps femoris.', echo: 0.34, edge: 0, bottom: 52, at: [24, 14], lab: [24, 13.6] },
    ],
    lines: [],
    shapes: [
      { id: 'st', kind: 'muscle', label: 'Semitendinosus', short: 'ST', desc: 'Semitendinosus (medial), over semimembranosus.', stri: 0, echo: 0.16, shape: P([0, 9.6], [7, 9.8], [11, 11.6], [10.4, 15.8], [5, 17.2], [0, 17]), at: [4.6, 13.4], lab: [4.6, 13.4] },
      { id: 'sm', kind: 'muscle', label: 'Semimembranosus', short: 'SM', desc: 'Semimembranosus (medial), under semitendinosus.', stri: 6, echo: 0.15, dens: 0.45, shape: P([0, 17.6], [6, 17.6], [11.6, 19.4], [13.6, 25], [12.6, 32.6], [8.4, 38.4], [0, 39.4]), at: [6, 27], lab: [6, 27] },
      { id: 'bf', kind: 'muscle', label: 'Biceps femoris', short: 'BF', desc: 'Biceps femoris (lateral). The needle enters through or under it.', stri: -6, echo: 0.16, dens: 0.45, shape: P([46, 9.2], [38.4, 9.4], [33.6, 11.6], [32.2, 17.6], [33.4, 24.6], [37, 31], [46, 33]), at: [40.6, 19], lab: [40.6, 19] },
      { id: 'sheath', kind: 'membrane', label: 'Paraneural sheath', short: 'Sheath', desc: 'The paraneural sheath around both nerves: the tip goes inside it, between the nerves.', shape: L(0.32, ...ring(25.2, 23, 9.4, 5.2)), at: [17.4, 20.4], lab: [12.6, 7] },
      ...nerve('tn', 'Tibial nerve', 'TN', 20.4, 23.8, 4.4, 2.9, { n: 8, lab: [19.4, 31.4], at: [20.6, 24.6], ids: ['sacral:n-tibial'], desc: 'Tibial nerve: bigger, medial, inside the paraneural sheath.' }),
      ...nerve('cpn', 'Common peroneal nerve', 'CPN', 29.6, 21.6, 2.3, 1.55, { n: 6, lab: [36.6, 4.4], at: [29.6, 21.2], ids: ['sacral:n-common-fibular'], desc: 'Common peroneal nerve: smaller, lateral, inside the same sheath.' }),
      { id: 'pv', kind: 'vein', label: 'Popliteal vein', short: 'PV', desc: 'The popliteal vein, just superficial to the artery.', shape: E(22, 33, 3.4, 2.3), at: [23.6, 33.4], lab: [31.6, 35.4] },
      { id: 'pa', kind: 'artery', label: 'Popliteal artery', short: 'PA', desc: 'The popliteal artery: the deepest of the bundle.', shape: E(18.6, 37.6, 3, 2.9), at: [18.6, 39], lab: [19.6, 43.4] },
      { id: 'femur', kind: 'bone', label: 'Femur', short: 'Femur', desc: 'The femur: the bright line deep.', shape: L(1.2, [4, 44.4], [12, 43.2], [24, 42.8], [34, 43.4], [44, 45.2]), at: [36, 43.6], lab: [39.6, 40] },
    ],
    target: { at: [25.2, 24.2], r: 1.8 },
    injections: [
      { id: 'sheath', label: 'Inside the sheath, between the nerves', entry: [72, 27.2], tip: [25.2, 24.3],
        pop: { label: 'Pop: into the sheath', plane: [[14, 18.2], [25.2, 17.9], [36, 18.4]], tent: 0.7, width: 5 },
        spread: { along: [[13, 27.4], [20.6, 27.2], [25.2, 26.6], [29.4, 24.4], [36, 24.6]], x0: 17.4, x1: 33.4, thick: 2.4, up: 1, above: 6, shape: 1.2 },
        spreads: [{ along: [[14, 19.6], [20.6, 20.4], [25.2, 21.4], [29.4, 19.2], [36, 19.4]], from: 25.2, x0: 17.4, x1: 32.6, thick: 1.3, up: 0.35, above: 3, shape: 1.2 }],
      },
      { id: 'outside', label: 'Outside the sheath (near miss)', entry: [72, 14.6], tip: [27, 16.4],
        target: { at: [25.2, 24.2], r: 1.8 },
        spread: { along: [[16, 17.2], [27, 17.1], [38, 17]], x0: 18, x1: 36, thick: 2.6, up: 0.7, above: 6, shape: 0.85 },
        steps: {
          needle: '<p>A common near miss: the tip stops <strong>just superficial to the sheath</strong>, above the gap between the nerves. On the screen it looks close enough.</p>',
          inject: '<p>The fluid pools <strong>on top of the sheath</strong>, in the popliteal fat, and the nerves do not move apart. Stop after 1–2 ml. Advance under vision until the sheath tents and gives, then check that the next millilitre <strong>separates the tibial and common peroneal nerves</strong>. Fluid outside the sheath gives a slow, patchy block.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse at the popliteal crease</strong>. Colour Doppler: find the <strong>popliteal artery</strong> (deepest), the vein just superficial to it, and the <strong>tibial nerve</strong> superficial to both. Then <strong>slide cephalad</strong>, following the tibial nerve, until the <strong>common peroneal nerve</strong> joins it from the lateral side. The junction is usually 5–10 cm above the crease, but find it in every patient.</p>',
      identify: '<p>Medial: <strong>semitendinosus</strong> over <strong>semimembranosus</strong>. Lateral: <strong>biceps femoris</strong>. Between them, in fat: the <strong>tibial</strong> (bigger, medial) and <strong>common peroneal</strong> (smaller, lateral) nerves inside one <strong>paraneural sheath</strong>. Lost them? <strong>Tilt the probe caudally</strong> (anisotropy) and ask the patient to point and pull up the foot: the nerves rock (the see-saw sign).</p>',
      needle: '<p><strong>In-plane, lateral to medial.</strong> Enter on the lateral thigh 2–3 cm from the probe, through or under biceps femoris, so the needle is <strong>nearly flat</strong> and bright. The sheath tents, then gives with a pop. Stop with the tip <strong>between the two nerves, inside the sheath</strong>.</p>',
      inject: '<p>Aspirate, then 1–2 ml: the fluid should <strong>part the two nerves</strong> and spread around them under the sheath, deep and superficial. Then the rest in <strong>5 ml aliquots</strong>, aspirating between. Low pressure only; stop if it is stiff or the patient feels pain or a shock down the leg.</p>',
    },
    probe: { view: 'back', at: [86, 244], angle: 0, marker: 'right', label: 'transverse on the back of the thigh, 5–10 cm above the popliteal crease, at the sciatic bifurcation.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ ankle: tibial nerve
  // Right ankle, medial side, transverse just above and behind the medial malleolus. Anterior on the left, posterior on
  // the right; needle from posterior.
  tibial: {
    id: 'll-fa-tib', title: 'Tibial nerve: transverse view behind the medial malleolus', width: 32, depth: 24, focus: 9, skin: 0.9,
    view: 'Transverse view of the right ankle just above and behind the medial malleolus. Anterior on the left, posterior on the right. Under the flexor retinaculum, from front to back: tibialis posterior, flexor digitorum longus, the posterior tibial artery with its veins, the tibial nerve, and flexor hallucis longus deeper.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'right' },
    injectionLabel: 'Where the tip ends',
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 3.4], [16, 3.8], [32, 4.6]], edge: 0 },
      { id: 'tt', kind: 'fat-deep', label: 'Tarsal tunnel fat', nolabel: true, echo: 0.3, edge: 0, bottom: 30 },
    ],
    lines: [
      { id: 'fr', kind: 'fascia', label: 'Flexor retinaculum', short: 'Retinaculum', desc: 'Tom, Dick, Artery, Nerve, Harry lie under the flexor retinaculum.', amp: 0.95, w: 0.5, pts: [[0, 3.6], [8, 3.9], [16, 4.1], [24, 4.6], [32, 5.6]], at: [12, 4], lab: [10.4, 1.9] },
    ],
    shapes: [
      { id: 'mm', kind: 'bone', label: 'Tibia (medial malleolus)', short: 'Tibia', desc: 'The medial malleolus: the tibial nerve lies behind it, posterior to the posterior tibial artery.', shape: L(1.2, [0, 10.2], [3, 8.8], [5.6, 9.2], [8.4, 11.4], [10.6, 15], [11.6, 19.6], [12, 24]), at: [3.4, 9.2], lab: [4.8, 20.4] },
      { id: 'tp', kind: 'tendon', label: 'Tibialis posterior', short: 'TP', desc: 'Tom: tibialis posterior, the most anterior.', shape: E(7.8, 6.8, 2.3, 1.45, 18), at: [7.8, 6.8], lab: [7.6, 6.8] },
      { id: 'fdl', kind: 'tendon', label: 'Flexor digitorum longus', short: 'FDL', desc: 'Dick: flexor digitorum longus.', shape: E(12.4, 7.6, 1.55, 1.1), at: [12.4, 7.8], lab: [12.4, 12.4] },
      { id: 'vc', kind: 'vein', label: 'Venae comitantes', short: 'Veins', nolabel: true, shape: [E(15.3, 7.6, 0.9, 0.65), E(18.9, 8, 0.9, 0.65)] },
      { id: 'pta', kind: 'artery', label: 'Posterior tibial artery', short: 'PTA', desc: 'Artery: the posterior tibial artery, just in front of the nerve.', shape: E(17.1, 8, 1.2, 1.15), at: [17.1, 7.4], lab: [17.6, 2] },
      ...nerve('tn', 'Tibial nerve', 'TN', 22.3, 8.8, 2.7, 1.9, { n: 7, lab: [25.6, 13.6], ids: ['sacral:n-tibial'], desc: 'Nerve: slide up and it keeps its honeycomb, while tendons become muscle bellies.' }),
      { id: 'fhl', kind: 'muscle', label: 'Flexor hallucis longus', short: 'FHL', desc: 'Harry: flexing the big toe moves FHL under the nerve.', stri: 10, echo: 0.15, shape: P([16, 12], [22, 11.4], [27, 12.6], [28, 17], [22, 19.6], [16.4, 17.4]), at: [21.6, 15.4], lab: [19.6, 17.4] },
      { id: 'kager', kind: 'fat-deep', label: 'Kager’s fat pad', short: 'Kager', nolabel: true, echo: 0.4, shape: P([27, 6.2], [32, 6.4], [32, 13], [28.4, 12]) },
    ],
    target: { at: [25.4, 8.6], r: 1.4 },
    injections: [
      { id: 'tib', label: 'Beneath the retinaculum, beside the nerve', entry: [46, 1.8], tip: [25.6, 8.4],
        pop: { label: 'Give: retinaculum', plane: 'fr', tent: 0.6, width: 3 },
        spread: { along: [[17.6, 10.9], [22.3, 11], [25.6, 10.6], [30, 10.2]], from: 23.6, x0: 18.6, x1: 29, thick: 1.6, up: 0.85, above: 4, shape: 1.2 },
        spreads: [{ along: [[17.6, 6.4], [22.3, 6.6], [25.6, 6.8], [30, 7]], from: 23.6, x0: 19.2, x1: 28.4, thick: 1, up: 0.45, above: 2.2, shape: 1.2 }] },
      { id: 'short', label: 'Short of the retinaculum (error)', entry: [46, 0.6], tip: [24.2, 3.4],
        target: { at: [25.4, 8.6], r: 1.4 },
        spread: { along: [[14, 3.2], [24.2, 3.4], [32, 3.9]], x0: 16, x1: 31, thick: 1.6, up: 0.5, above: 2, shape: 0.8 },
        steps: {
          needle: '<p>The tip stops <strong>just short of the flexor retinaculum</strong>, in the subcutaneous fat. From here the fluid cannot reach the nerve.</p>',
          inject: '<p>The fluid spreads <strong>under the skin</strong>, superficial to the retinaculum, and the nerve does not move. Stop at 1–2 ml. Withdraw, steepen a little and advance until the tip gives through the retinaculum; then the planned 5 ml outlines the nerve.</p>',
        } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse just above and behind the medial malleolus</strong>, marker towards the Achilles tendon. Colour Doppler: find the <strong>posterior tibial artery</strong> first. For heel surgery, slide <strong>5–10 cm higher</strong>: you block the nerve before its calcaneal branches leave and the bone no longer breaks probe contact.</p>',
      identify: '<p>From front to back: <strong>T</strong>ibialis posterior, flexor <strong>D</strong>igitorum longus, <strong>A</strong>rtery (with veins), <strong>N</strong>erve, flexor <strong>H</strong>allucis longus: “Tom, Dick, And Nervous Harry”. The nerve is a honeycomb just posterior to the artery. Tendon or nerve? Slide up: tendons turn into muscle, the nerve stays a nerve. Flexing the big toe makes FHL slide under it.</p>',
      needle: '<p><strong>In-plane from posterior</strong>, at a shallow angle in front of the Achilles tendon. The tip gives through the <strong>flexor retinaculum</strong> and stops beside the nerve, away from the artery. Keep off the tibial periosteum.</p>',
      inject: '<p>1 ml first to see the spread, then the rest of <strong>5 ml</strong>, aspirating between. The fluid should <strong>ring the nerve</strong> and lift the retinaculum from below. Block the tibial nerve first: it has the slowest onset.</p>',
    },
    probe: { view: 'back', at: [66, 382], angle: 0, marker: 'right', label: 'transverse just above and behind the medial malleolus.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ ankle: deep peroneal nerve
  dpn: {
    id: 'll-fa-dpn', title: 'Deep peroneal nerve: transverse view at the extensor retinaculum', width: 32, depth: 22, focus: 9, skin: 0.8,
    view: 'Transverse view of the front of the right ankle just above the joint, at the extensor retinaculum. Medial on the left, lateral on the right. From medial to lateral: tibialis anterior, extensor hallucis longus, the anterior tibial artery with the deep peroneal nerve beside it on the tibia, extensor digitorum longus.',
    orient: { left: 'Medial', right: 'Lateral', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 2.8], [32, 3]], edge: 0 },
      { id: 'dt', kind: 'fat-deep', label: 'Deep tissue', nolabel: true, echo: 0.3, edge: 0, bottom: [[0, 13.6], [10, 12.6], [18, 12.3], [26, 12.8], [32, 14]] },
      { id: 'below', kind: 'connective', label: 'Bone', nolabel: true, echo: 0.2, edge: 0, bottom: 30 },
    ],
    lines: [
      { id: 'er', kind: 'fascia', label: 'Extensor retinaculum', short: 'Retinaculum', desc: 'The deep peroneal nerve and artery lie beneath the extensor retinaculum.', amp: 0.95, w: 0.5, pts: [[0, 3.2], [16, 3.3], [32, 3.5]], at: [8, 3.2], lab: [9, 1.7] },
    ],
    shapes: [
      { id: 'ta', kind: 'tendon', label: 'Tibialis anterior', short: 'TA', desc: 'Tibialis anterior, the most medial tendon.', shape: E(4.4, 6.4, 3, 2), at: [4.4, 6.4], lab: [4.6, 10.6] },
      { id: 'ehl', kind: 'tendon', label: 'Extensor hallucis longus', short: 'EHL', desc: 'Extensor hallucis longus: the deep peroneal nerve lies between EHL and EDL.', shape: E(11.6, 7, 2.5, 2.1), at: [11.6, 7], lab: [10.6, 16.4] },
      { id: 'vc', kind: 'vein', label: 'Venae comitantes', nolabel: true, shape: [E(14.8, 10.4, 0.8, 0.6), E(18.4, 10.6, 0.8, 0.6)] },
      { id: 'ata', kind: 'artery', label: 'Anterior tibial artery', short: 'ATA', desc: 'The anterior tibial artery, on the tibia; the deep peroneal nerve lies beside it.', shape: E(16.6, 10, 1.3, 1.25), at: [16.4, 10.6], lab: [15.6, 19.6] },
      ...nerve('dpn', 'Deep peroneal nerve', 'DPN', 19.9, 9.5, 1.15, 0.85, { n: 3, lab: [23, 16.4], desc: 'Beside the anterior tibial artery on the tibia, between EHL and EDL. It may lie medial or lateral to the artery: find it on each scan.' }),
      { id: 'edl', kind: 'muscle', label: 'Extensor digitorum longus', short: 'EDL', desc: 'Extensor digitorum longus: the needle passes through its edge, from lateral.', stri: 4, echo: 0.16, shape: E(25.8, 7.4, 4.2, 2.8), at: [26.4, 8.4], lab: [27.4, 11.2] },
      { id: 'tib', kind: 'bone', label: 'Tibia', short: 'Tibia', desc: 'The tibia: keep off the periosteum, injection under it is painful.', shape: L(1.2, [0, 13.6], [10, 12.6], [18, 12.3], [26, 12.8], [32, 14]), at: [6, 13.1], lab: [4.6, 15.6] },
    ],
    target: { at: [21.2, 9.2], r: 1.3 },
    injections: [
      { id: 'dpn', label: 'Beside the nerve and artery', entry: [46, 2.4], tip: [21.4, 8.8],
        pop: { label: 'Give: retinaculum', plane: 'er', tent: 0.5, width: 3 },
        spread: { along: [[13, 11.6], [16.6, 11.7], [20, 11.1], [24, 10.6]], x0: 13.4, x1: 24, thick: 1.8, up: 1, above: 4, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the front of the ankle</strong>, at the extensor retinaculum (just above the joint line). Colour Doppler finds the <strong>anterior tibial artery</strong> lying on the tibia.</p>',
      identify: '<p>Ask the patient to lift the big toe: <strong>extensor hallucis longus</strong> moves. The <strong>deep peroneal nerve</strong> is a small dot <strong>beside the artery</strong>, usually lateral, sometimes medial (it crosses the artery near the ankle). Find the nerve on each scan; if you cannot, aim for fluid around the artery.</p>',
      needle: '<p><strong>In-plane from lateral</strong>, shallow, through the retinaculum and the edge of extensor digitorum longus. Stop beside the nerve, off the artery and off the tibial periosteum.</p>',
      inject: '<p>1 ml, aspirate, then 2 ml: <strong>3 ml</strong> in all. The fluid outlines the nerve and artery beneath the retinaculum. Injection under the periosteum hurts: withdraw a little if the patient winces.</p>',
    },
    probe: { view: 'front', at: [80, 386], angle: 0, marker: 'left', label: 'transverse on the front of the ankle at the extensor retinaculum.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ ankle: superficial peroneal nerve
  spn: {
    id: 'll-fa-spn', title: 'Superficial peroneal nerve: transverse view on the lower leg', width: 32, depth: 22, focus: 6, skin: 0.9,
    view: 'Transverse view of the anterolateral right leg, about 10 cm above the lateral malleolus. Lateral (fibula) on the left, anterior on the right. The nerve lies in the fat just above the deep fascia, over the groove between peroneus brevis and extensor digitorum longus.',
    orient: { left: 'Lateral', right: 'Anterior', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 5.8], [16, 5.6], [32, 5.2]], edge: 0, at: [8, 3.4], lab: [8, 3.4] },
      { id: 'deep', kind: 'connective', label: 'Deep tissue', nolabel: true, echo: 0.24, edge: 0, bottom: 30 },
    ],
    lines: [
      { id: 'df', kind: 'fascia', label: 'Deep fascia', short: 'Fascia', desc: 'The superficial peroneal nerve lies above the deep fascia here.', amp: 0.9, w: 0.42, pts: [[0, 5.9], [16, 5.7], [32, 5.3]], at: [6, 5.9], lab: [9, 7.6] },
    ],
    shapes: [
      { id: 'pb', kind: 'muscle', label: 'Peroneus brevis', short: 'PB', desc: 'Peroneus brevis: the nerve lies over the groove between it and EDL.', stri: 12, echo: 0.15, shape: P([0, 6.2], [13.6, 6.2], [16.4, 8], [16.2, 11.2], [13.4, 13.6], [7, 13.4], [0, 13.6]), at: [7, 9.8], lab: [7, 9.8] },
      { id: 'edl', kind: 'muscle', label: 'Extensor digitorum longus', short: 'EDL', desc: 'Extensor digitorum longus: the nerve lies over the groove between it and peroneus brevis.', stri: -8, echo: 0.16, shape: P([18.6, 6], [32, 5.6], [32, 18.4], [22, 17.4], [17.6, 14.4], [18.8, 10]), at: [26, 12], lab: [26, 12] },
      { id: 'sept', kind: 'membrane', label: 'Intermuscular septum', nolabel: true, shape: L(0.38, [17.4, 5.9], [17.6, 10], [17, 13.2], [15.8, 14.6]) },
      { id: 'fib', kind: 'bone', label: 'Fibula', short: 'Fibula', desc: 'The fibula, under peroneus brevis: the groove leads down to it.', shape: L(1.2, [0, 14.4], [5, 13.8], [10, 13.9], [14, 14.8], [16.6, 16.8]), at: [5, 13.8], lab: [6.4, 17.4] },
      ...nerve('spn', 'Superficial peroneal nerve', 'SPN', 17.4, 4.7, 1.15, 0.75, { n: 3, lab: [19.4, 9.6], desc: 'Above the fascia over the peroneus brevis–EDL groove, about 10 cm above the lateral malleolus, before it divides.' }),
    ],
    target: { at: [19.4, 4.6], r: 1.2 },
    injections: [
      { id: 'spn', label: 'Above the fascia, beside the nerve', entry: [46, 1.8], tip: [19.6, 4.3],
        spread: { along: [[12, 5.3], [17.4, 5.4], [24, 5.1]], x0: 12.4, x1: 23.6, thick: 1.6, up: 0.65, above: 3.4, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse on the anterolateral leg, about 10 cm above the lateral malleolus</strong>. Find the groove between <strong>peroneus brevis</strong> and <strong>extensor digitorum longus</strong> that leads down to the fibula.</p>',
      identify: '<p>The <strong>superficial peroneal nerve</strong> is a small oval in the fat <strong>just above the deep fascia</strong>, over the groove. Not sure? Slide up: it dives under the fascia into the groove. Slide down: it divides into medial and intermediate dorsal cutaneous branches. Block it before it divides.</p>',
      needle: '<p><strong>In-plane from anterior</strong>, very shallow. The tip stays in the fat, <strong>superficial to the fascia</strong>, beside the nerve.</p>',
      inject: '<p>1 ml, aspirate, then 2 ml: <strong>3 ml</strong>. A small lens of fluid lifts around the nerve. If you cannot see the nerve, a subcutaneous wheal across the front of the leg at this level (tibial crest to fibula) does the same job.</p>',
    },
    probe: { view: 'front', at: [54, 366], angle: 0, marker: 'right', label: 'transverse on the anterolateral leg about 10 cm above the lateral malleolus.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ ankle: sural nerve
  sural: {
    id: 'll-fa-sur', title: 'Sural nerve: transverse view behind the lateral malleolus', width: 30, depth: 20, focus: 5, skin: 0.9,
    view: 'Transverse view of the right ankle just above and behind the lateral malleolus. Posterior (Achilles tendon) on the left, anterior (malleolus) on the right. The sural nerve runs with the small saphenous vein in the fat, superficial to the deep fascia.',
    orient: { left: 'Posterior', right: 'Anterior', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 6.2], [15, 6.6], [30, 6]], edge: 0 },
      { id: 'deep', kind: 'connective', label: 'Deep tissue', nolabel: true, echo: 0.3, edge: 0, bottom: 30 },
    ],
    lines: [
      { id: 'df', kind: 'fascia', label: 'Deep fascia', short: 'Fascia', desc: 'The sural nerve and vein lie in the fat above the deep fascia.', amp: 0.85, w: 0.4, pts: [[0, 6.3], [15, 6.7], [30, 6.1]], at: [25, 6.3], lab: [25.4, 8.4] },
    ],
    shapes: [
      { id: 'ach', kind: 'tendon', label: 'Achilles tendon', short: 'Achilles', desc: 'The Achilles tendon, posterior.', shape: P([0, 6.8], [7, 6.9], [9.6, 8.4], [8.2, 11.8], [0, 12.2]), at: [4, 9.4], lab: [4.6, 9.4] },
      { id: 'kager', kind: 'fat-deep', label: 'Kager’s fat pad', short: 'Kager', desc: 'Kager’s fat pad, deep to the Achilles tendon.', echo: 0.42, shape: P([0, 12.6], [9, 12.2], [13, 15], [11, 20], [0, 20]), at: [5, 16], lab: [5, 16.4] },
      { id: 'per', kind: 'tendon', label: 'Peroneal tendons', short: 'Peroneals', desc: 'The peroneal tendons, behind the fibula.', shape: [E(20.6, 9.4, 2, 1.3), E(24.4, 8.8, 1.8, 1.2)], at: [22.4, 9.2], lab: [21.6, 13] },
      { id: 'lm', kind: 'bone', label: 'Fibula (lateral malleolus)', short: 'Fibula', desc: 'The lateral malleolus, anterior.', shape: L(1.2, [18.6, 13.6], [22, 12], [26, 11.2], [30, 11.4]), at: [27, 11.2], lab: [26, 16.4] },
      { id: 'ssv', kind: 'vein', label: 'Small saphenous vein', short: 'SSV', desc: 'The small saphenous vein, between the lateral malleolus and the Achilles tendon. Light pressure.', shape: E(14, 4.2, 1.7, 1.3), at: [14, 3.4], lab: [12.4, 1.6] },
      ...nerve('sur', 'Sural nerve', 'Sural', 17.1, 4.5, 0.95, 0.72, { n: 3, lab: [14, 10.4], desc: 'Beside the small saphenous vein between the lateral malleolus and the Achilles tendon.' }),
    ],
    target: { at: [18.8, 4], r: 1.2 },
    injections: [
      { id: 'sur', label: 'Beside the vein and nerve', entry: [42, 1.4], tip: [18.9, 3.7],
        spread: { along: [[8, 5.4], [14, 5.7], [19, 5.5], [24, 5.3]], x0: 9.4, x1: 22.4, thick: 1.5, up: 0.7, above: 3.4, shape: 0.8 } },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse between the lateral malleolus and the Achilles tendon</strong>, a few centimetres above the tip of the malleolus. Light pressure: the <strong>small saphenous vein</strong> collapses easily. A calf tourniquet (or the patient standing, if awake) fills it.</p>',
      identify: '<p>The <strong>sural nerve</strong> is the small bright dot <strong>beside the vein</strong>, in the fat above the deep fascia. Deeper: the Achilles tendon (posterior), Kager’s fat pad, and the peroneal tendons behind the fibula.</p>',
      needle: '<p><strong>In-plane from anterior</strong>, shallow. The tip stops beside the vein and nerve, <strong>not in the vein</strong>. Aspirate.</p>',
      inject: '<p>1 ml, aspirate, then 2 ml: <strong>3 ml</strong>. Fluid around the vein reaches the nerve even when you cannot see it. Without ultrasound: a subcutaneous wheal from the lateral malleolus to the Achilles tendon.</p>',
    },
    probe: { view: 'back', at: [98, 382], angle: 0, marker: 'right', label: 'transverse between the lateral malleolus and the Achilles tendon.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ ankle: saphenous nerve
  sapAnkle: {
    id: 'll-fa-sapa', title: 'Saphenous nerve at the ankle: transverse view in front of the medial malleolus', width: 24, depth: 13.5, focus: 3.5, skin: 0.9,
    view: 'Transverse view of the right ankle just above and in front of the medial malleolus. Anterior on the left, posterior on the right. The saphenous nerve lies beside the great saphenous vein in the fat on the medial surface of the tibia.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 5.4], [30, 5.2]], edge: 0 },
      { id: 'deep', kind: 'connective', label: 'Periosteum', nolabel: true, echo: 0.3, edge: 0, bottom: 30 },
    ],
    lines: [],
    shapes: [
      { id: 'tib', kind: 'bone', label: 'Tibia (medial surface)', short: 'Tibia', desc: 'The medial surface of the tibia, under the fat.', shape: L(1.2, [0, 6.6], [10, 6.1], [20, 6], [30, 6.6]), at: [19, 6], lab: [19, 10] },
      { id: 'gsv', kind: 'vein', label: 'Great saphenous vein', short: 'GSV', desc: 'The great saphenous vein, in front of the medial malleolus. Light pressure.', shape: E(13.2, 3.4, 1.9, 1.4), at: [12.6, 3.2], lab: [7, 1.8] },
      ...nerve('saph', 'Saphenous nerve', 'Saph', 16, 3.7, 0.72, 0.55, { n: 2, lab: [6.4, 5], ids: ['lumbar:n-saphenous'], desc: 'Beside the great saphenous vein in front of the medial malleolus.' }),
    ],
    target: { at: [17.2, 3.2], r: 1 },
    injections: [
      { id: 'sapa', label: 'Beside the vein', entry: [42, 1.1], tip: [17.3, 3],
        spread: { along: [[8, 4.8], [13.2, 5], [18, 4.8], [22, 4.6]], x0: 9, x1: 21, thick: 1.25, up: 0.75, above: 3, shape: 0.8 },
        spreads: [{ along: [[9, 1.7], [13.2, 1.6], [18, 1.8], [21, 2]], from: 17.3, x0: 10, x1: 20, thick: 0.7, up: 0.5, above: 0.7, shape: 0.9 }] },
    ],
    steps: {
      scan: '<p>Probe <strong>transverse just above and in front of the medial malleolus</strong>, with almost no pressure: the <strong>great saphenous vein</strong> is the landmark and it vanishes if you press.</p>',
      identify: '<p>The nerve is a tiny dot <strong>beside the vein</strong>, often behind it, in the fat on the medial surface of the tibia. You often cannot see it: that is fine.</p>',
      needle: '<p><strong>In-plane from posterior</strong>, shallow, light pressure. The tip stops in the fat beside the vein, <strong>not in it</strong>.</p>',
      inject: '<p>1 ml, aspirate, then 2 ml: <strong>3 ml</strong>. Fluid ringing the vein (above, below and beside it) is enough. Without ultrasound: a subcutaneous wheal from the medial malleolus to the front of the ankle, around the vein.</p>',
    },
    probe: { view: 'front', at: [104, 382], angle: 0, marker: 'right', label: 'transverse just above and in front of the medial malleolus.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ saphenous below the knee: ultrasound, paravenous
  // Right leg, medial side, transverse at the level of the tibial tuberosity. Anterior on the left, posterior on the right.
  sapPv: {
    id: 'll-fa-sappv', title: 'Saphenous nerve below the knee: paravenous view', width: 36, depth: 30, focus: 7, skin: 1.1,
    view: 'Transverse view of the medial side of the right leg at the level of the tibial tuberosity. Anterior (tibia) on the left, posterior (calf) on the right. The great saphenous vein, with the saphenous nerve beside it, lies in the subcutaneous fat over the medial head of gastrocnemius, just behind the medial border of the tibia.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'right' },
    layers: [
      // The fat is labelled with a label shape below, not as a layer, so the block has no one-item "superficial to deep" list.
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', nolabel: true, bottom: [[0, 6.6], [18, 8.2], [36, 9.4]], edge: 0 },
      { id: 'deep', kind: 'connective', label: 'Deep tissue', nolabel: true, echo: 0.22, edge: 0, bottom: 40 },
    ],
    lines: [
      { id: 'df', kind: 'fascia', label: 'Deep fascia', short: 'Fascia', desc: 'The deep fascia, under the vein and nerve.', amp: 0.9, w: 0.42, pts: [[0, 6.7], [18, 8.3], [36, 9.5]], at: [31, 9.2], lab: [31, 12.4] },
    ],
    shapes: [
      { id: 'sc-lab', kind: 'label', label: 'Subcutaneous fat', short: 'Fat', outline: false, shape: E(6, 3.6, 1, 1), at: [6, 3.6], lab: [6, 3.6] },
      { id: 'tib', kind: 'bone', label: 'Tibia (medial surface)', short: 'Tibia', desc: 'The bright medial surface of the tibia in front.', shape: L(1.3, [0, 8.4], [8, 7.8], [13.6, 8.6], [17.4, 10.8], [19.4, 13.8]), at: [6, 8], lab: [6, 12] },
      { id: 'mg', kind: 'muscle', label: 'Medial gastrocnemius', short: 'MG', desc: 'Medial gastrocnemius behind.', stri: -10, echo: 0.15, dens: 0.45, shape: P([19, 9.4], [36, 9.9], [36, 23.6], [27, 22.6], [21, 18.6], [19, 12.6]), at: [28.6, 16], lab: [28.6, 16] },
      { id: 'sol', kind: 'muscle', label: 'Soleus', short: 'Soleus', desc: 'Soleus, deep to medial gastrocnemius.', stri: 6, echo: 0.13, shape: P([21, 19.4], [27, 23.4], [36, 24.4], [36, 30], [20.6, 30], [19.8, 24]), at: [28, 27], lab: [28, 27] },
      { id: 'gsv', kind: 'vein', label: 'Great saphenous vein', short: 'GSV', desc: 'The great saphenous vein: the black circle that collapses with pressure.', shape: E(17.2, 5.1, 2.6, 2), at: [16, 4.6], lab: [13, 1.6] },
      ...nerve('saph', 'Saphenous nerve', 'Saph', 20.9, 5.7, 0.95, 0.72, { n: 3, lab: [22.4, 11.6], ids: ['lumbar:n-saphenous'], desc: 'The saphenous nerve as a small bright dot beside the vein (often not seen).' }),
    ],
    target: { at: [22.4, 5], r: 1.2 },
    injections: [
      { id: 'pv', label: 'Beside the vein (paravenous)', entry: [52, 2.4], tip: [22.6, 4.8],
        spread: { along: [[10, 7.6], [17.2, 7.7], [22, 7.6], [27, 8.2]], x0: 11, x1: 26.4, thick: 2.1, up: 0.75, above: 5, shape: 0.8 },
        spreads: [{ along: [[11, 2.6], [17.2, 2.5], [22, 2.9], [26, 3.4]], from: 22.6, x0: 12.4, x1: 25, thick: 1, up: 0.5, above: 1.3, shape: 0.9 }] },
    ],
    steps: {
      scan: '<p>Leg slightly externally rotated. A <strong>tourniquet or elastic band on the thigh</strong> (not tight enough to stop arterial flow) fills the vein. Probe <strong>transverse on the medial leg at the level of the tibial tuberosity</strong>, with very light pressure.</p>',
      identify: '<p>The <strong>great saphenous vein</strong> is the round black circle in the fat, just behind the medial border of the tibia, over <strong>medial gastrocnemius</strong>. The <strong>saphenous nerve</strong> runs beside it (often posterior), superficial to the deep fascia: a small bright dot, or not seen at all.</p>',
      needle: '<p><strong>In-plane</strong>, from posterior here (either direction works), shallow, in the fat. The tip stops <strong>next to the vein, not in it</strong>, on the side where the nerve is.</p>',
      inject: '<p>Aspirate, then <strong>5 ml</strong> in small aliquots: the fluid should <strong>surround the vein</strong> (and the nerve with it). Release the thigh band afterwards. Expect a small bruise sometimes: the vein is close.</p>',
    },
    probe: { view: 'front', at: [118, 316], angle: 0, marker: 'right', label: 'transverse on the medial leg at the level of the tibial tuberosity.' },
    probeInset: legProbeInset,
  },

  // ------------------------------------------------------------------ saphenous below the knee: landmark field block
  sapLm: {
    id: 'll-fa-saplm', title: 'Below-knee saphenous field block: section along the needle', image: 'diagram', width: 56, depth: 32, focus: 6, skin: 1.2,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    view: 'Schematic transverse section of the medial side of the right leg just below the knee, unrolled so that the skin is at the top. The tibial tuberosity is on the left, the medial head of gastrocnemius on the right. The saphenous nerve and the great saphenous vein lie in the subcutaneous fat between them. Not to scale.',
    orient: { left: 'Anterior', right: 'Posterior', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 7.4], [20, 8.4], [40, 10.4], [56, 11.4]], at: [44, 8.4], lab: [46, 8.6] },
      { id: 'deep', kind: 'connective', label: 'Deep tissue', nolabel: true, bottom: 40 },
    ],
    lines: [
      { id: 'df', kind: 'fascia', label: 'Deep fascia', nolabel: true, pts: [[0, 7.5], [20, 8.5], [40, 10.5], [56, 11.5]] },
    ],
    shapes: [
      { id: 'tib', kind: 'bone', label: 'Tibia (tuberosity and medial surface)', short: 'Tibia', desc: 'Enter at the tibial tuberosity.', shape: P([0, 8], [6, 7.7], [12, 8.6], [22, 9.4], [29, 11], [31.6, 15], [29, 32], [0, 32]), at: [14, 15], lab: [14, 15] },
      { id: 'mg', kind: 'muscle', label: 'Medial gastrocnemius', short: 'MG', desc: 'Advance subcutaneously towards the medial gastrocnemius, all the way.', stri: -10, shape: P([33, 11.4], [56, 12], [56, 32], [34, 32], [32.4, 17]), at: [45, 17], lab: [45, 17] },
      { id: 'gsv', kind: 'vein', label: 'Great saphenous vein', short: 'GSV', desc: 'Aspirate: the vein is on the path.', shape: E(30, 8, 1.8, 1.3), at: [30, 8.4], lab: [25, 13.2] },
      { id: 'saph', kind: 'nerve', label: 'Saphenous nerve', short: 'Saph', ids: ['lumbar:n-saphenous'], desc: 'The saphenous nerve and its branches lie in the subcutaneous fat between the tibia and gastrocnemius, close to the vein.', shape: [E(33.4, 8.4, 0.8, 0.6), E(21, 7, 0.45, 0.35), E(41, 9, 0.45, 0.35)], at: [33.4, 8.4], lab: [38.4, 14.6] },
    ],
    target: { at: [33, 5.4], r: 1.4 },
    injections: [
      { id: 'lm', label: 'Subcutaneous, tuberosity to gastrocnemius', entry: [-4, 4.8], tip: [50, 5.6],
        spread: { along: [[0, 4.9], [25, 5.3], [52, 5.8]], from: 50, x0: 4, x1: 54, thick: 1.8, up: 0.5, above: 2, shape: 0.25 } },
    ],
    steps: {
      scan: '<p>Supine, knee slightly flexed and the leg externally rotated. Find the <strong>tibial tuberosity</strong> and, behind the medial border of the tibia, the bulge of the <strong>medial head of gastrocnemius</strong>. If you can see or feel the great saphenous vein, mark it: the nerve runs with it.</p>',
      identify: '<p>The <strong>saphenous nerve</strong> and its branches lie <strong>in the subcutaneous fat</strong> between the tibia and gastrocnemius, close to the vein. A ribbon of local anaesthetic laid across that strip catches them, wherever they are.</p>',
      needle: '<p>An ordinary hypodermic needle (23G, as long as you have). Enter at the <strong>tibial tuberosity</strong> and advance <strong>subcutaneously</strong> (not intradermally, not into muscle) <strong>towards the medial gastrocnemius</strong>, all the way. Aspirate: the vein is on the path.</p>',
      inject: '<p>Inject <strong>while withdrawing</strong>, laying a continuous ribbon of 5–10 ml under the skin. A long gap may need a second entry point. It stings more than the ultrasound block, and it fails more often: check the medial leg after 15–20 minutes.</p>',
    },
    probe: { view: 'front', key: 'Needle', points: [{ at: 'tibial-tuberosity', label: 'Start at the tibial tuberosity' }, { at: [122, 318], label: 'Finish at medial gastrocnemius' }], label: 'from the tibial tuberosity, subcutaneously round the medial leg to the medial head of gastrocnemius.' },
    probeInset: legProbeInset,
  },
};
