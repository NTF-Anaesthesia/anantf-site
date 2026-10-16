// Face: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// The three superficial trigeminal blocks share one layout: skin, a thin muscle layer, and a bright bone surface with a
// gap where the foramen (or notch) is, the nerve coming out of it with its artery. Original geometry, typical adult depths.
import { E, P, PS, L } from '../../../shared/regional/js/scene.js';
import { headProbeInset } from '../../../shared/regional/js/figures/head.js?v=20261015';

function foramenScene({ id, title, view, muscle, muscleShort, bone, gapLabel, nerve, nerveShort, artery, arteryShort, fat, mus, boneY, probe, steps }) {
  const gx = 15, gw = 3.2;
  return {
    id, title, width: 30, depth: 16, focus: 7, skin: 0.9, view,
    orient: { left: 'Medial', right: 'Lateral', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, fat], [30, fat + 0.4]], labelX: 25 },
      { id: 'mus', kind: 'muscle', label: muscle, short: muscleShort, stri: 0, edge: 0.4, bottom: [[0, mus], [30, mus + 0.4]], labelX: 24 },
      { id: 'pc', kind: 'connective', label: 'Periosteum', nolabel: true, edge: 0, bottom: [[0, boneY], [30, boneY + 0.4]] },
      { id: 'deep', kind: 'fat-deep', label: 'Deep to bone', nolabel: true, edge: 0, bottom: 22 },
    ],
    shapes: [
      { id: 'bone', kind: 'bone', label: bone, short: 'Bone', shape: [L(1, [0, boneY + 0.1], [gx - gw / 2, boneY + 0.25]), L(1, [gx + gw / 2, boneY + 0.3], [30, boneY + 0.5])], at: [5, boneY + 0.2], lab: [5, boneY + 4.4] },
      { id: 'for', kind: 'label', label: gapLabel, short: 'Foramen', outline: false, shape: L(0.4, [gx - 1, boneY + 1.6], [gx + 1, boneY + 1.6]), at: [gx, boneY + 0.8], lab: [gx + 4, boneY + 7] },
      { id: 'n', kind: 'nerve', label: nerve, short: nerveShort, shape: E(gx - 0.5, boneY - 0.7, 1.2, 0.75), lab: [gx - 8, fat - 1] },
      { id: 'a', kind: 'artery', label: artery, short: arteryShort, shape: E(gx + 1.5, boneY - 0.65, 0.55, 0.5), lab: [gx + 8, boneY + 3.4] },
    ],
    target: { at: [gx, boneY - 1.1], r: 1.5 },
    injections: [
      { id: 'inj', label: 'At the foramen', entry: [42, -0.5], tip: [gx + 1.2, boneY - 1.3],
        spread: { along: 'mus', x0: gx - 6, x1: gx + 7, thick: 1.8, up: 0.5, above: 3 } },
    ],
    steps,
    probe,
    probeInset: headProbeInset,
  };
}

export const SCENES = {
  so: foramenScene({
    id: 'hn-fa-so', title: 'Supraorbital nerve: transverse view over the eyebrow',
    view: 'Transverse view along the right eyebrow, over the upper orbital rim in line with the pupil. Medial on the left. The supraorbital notch is a gap in the bright bone line.',
    muscle: 'Frontalis and orbicularis oculi', muscleShort: 'Muscle', bone: 'Frontal bone (orbital rim)', gapLabel: 'Supraorbital notch',
    nerve: 'Supraorbital nerve', nerveShort: 'SON', artery: 'Supraorbital artery', arteryShort: 'SOA', fat: 2.6, mus: 4.6, boneY: 5.6,
    probe: { view: 'front', x: 78, y: 72, angle: 0, marker: 'right', label: 'transverse along the right eyebrow, over the orbital rim in line with the pupil.' },
    steps: {
      scan: '<p>Probe <strong>transverse along the eyebrow</strong>, over the upper orbital rim. Slide medially and laterally until the bright bone line has a <strong>gap</strong>: the supraorbital notch or foramen, usually in line with the pupil.</p>',
      identify: '<p>Skin, fat, the thin frontalis and orbicularis oculi, then the bright <strong>frontal bone</strong> with its shadow. The <strong>supraorbital artery</strong> pulses at the notch (colour Doppler); the nerve lies beside it.</p>',
      needle: '<p>In-plane from lateral (or out-of-plane), a fine needle to the tissue <strong>just over the notch</strong>. Do not enter the foramen.</p>',
      inject: '<p>1–2 ml. Then press on the site. For the supratrochlear nerve, add 1 ml just medial, at the bridge of the nose (or fan medially from the same puncture).</p>',
    },
  }),
  io: foramenScene({
    id: 'hn-fa-io', title: 'Infraorbital nerve: transverse view below the orbital rim',
    view: 'Transverse view of the right cheek about 1 cm below the lower orbital rim, in line with the pupil. Medial on the left. The infraorbital foramen is a gap in the bright maxilla.',
    muscle: 'Levator labii superioris', muscleShort: 'LLS', bone: 'Maxilla', gapLabel: 'Infraorbital foramen',
    nerve: 'Infraorbital nerve', nerveShort: 'ION', artery: 'Infraorbital artery', arteryShort: 'IOA', fat: 3.4, mus: 6.2, boneY: 7.2,
    probe: { view: 'front', x: 78, y: 100, angle: 0, marker: 'right', label: 'transverse on the right cheek, about 1 cm below the lower orbital rim, in line with the pupil.' },
    steps: {
      scan: '<p>Probe <strong>transverse on the cheek</strong>, about 1 cm below the lower orbital rim. Slide until the bright <strong>maxilla</strong> shows a gap: the infraorbital foramen, in line with the pupil.</p>',
      identify: '<p>Skin, fat, levator labii superioris, then the bright maxilla with its shadow and the <strong>foramen</strong>. The <strong>infraorbital artery</strong> pulses beside the nerve.</p>',
      needle: '<p>In-plane from lateral, or out-of-plane from below, to the tissue <strong>just outside the foramen</strong>. Keep a finger on the lower orbital rim so the needle can never go up into the orbit. Do not enter the canal.</p>',
      inject: '<p>1–2 ml in adults; less in children. Press afterwards to limit swelling and bruising.</p>',
    },
  }),
  me: foramenScene({
    id: 'hn-fa-me', title: 'Mental nerve: transverse view over the mandible',
    view: 'Transverse view of the right side of the chin over the body of the mandible, below the second premolar, in line with the pupil. Medial on the left. The mental foramen is a gap in the bright mandible.',
    muscle: 'Depressor anguli oris', muscleShort: 'DAO', bone: 'Mandible', gapLabel: 'Mental foramen',
    nerve: 'Mental nerve', nerveShort: 'MN', artery: 'Mental artery', arteryShort: 'MA', fat: 3, mus: 5.4, boneY: 6.4,
    probe: { view: 'front', x: 82, y: 162, angle: 0, marker: 'right', label: 'transverse over the right side of the mandible, below the second premolar, in line with the pupil.' },
    steps: {
      scan: '<p>Probe <strong>transverse over the body of the mandible</strong>, below the second premolar, halfway between the gum and the lower border of the jaw. Slide until the bright mandible shows a gap: the <strong>mental foramen</strong>.</p>',
      identify: '<p>Skin, fat, depressor anguli oris, then the bright mandible with its shadow and the foramen. The mental artery runs with the nerve.</p>',
      needle: '<p>In-plane from lateral, or out-of-plane, to the tissue <strong>just outside the foramen</strong>. Do not enter it.</p>',
      inject: '<p>1–2 ml. Press afterwards.</p>',
    },
  }),
  // Maxillary and mandibular nerves by the coronoid notch (deep trigeminal blocks; schematic section, no ultrasound).
  // A horizontal section through the right side of the face just below the zygomatic arch, through the coronoid notch of
  // the mandible, turned so that depth (inwards, towards the pharynx) runs down the screen: posterior (ear) on the left,
  // anterior (cheek) on the right. Adult depths: the lateral pterygoid plate about 4–5 cm from the skin, the mandibular
  // nerve just behind it at much the same depth, the pterygopalatine fossa in front of it. Not to scale.
  deep: {
    id: 'hn-fa-deep', title: 'Maxillary and mandibular nerves: section through the coronoid notch', image: 'diagram',
    width: 60, depth: 56, focus: 30, skin: 1.4,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    injectionLabel: 'Nerve',
    view: 'Schematic horizontal section through the right side of the face just below the middle of the zygomatic arch, through the coronoid notch, turned so that depth (inwards, towards the pharynx) runs down the screen: posterior (ear) on the left, anterior (cheek) on the right. Not to scale.',
    alt: 'Under the skin and masseter, the needle passes through the coronoid notch between the condyle behind and the coronoid process in front, then past the lateral pterygoid muscle, the maxillary artery and the pterygoid venous plexus, to the lateral pterygoid plate. The mandibular nerve lies just behind the plate; the maxillary nerve in the pterygopalatine fossa in front of it. The pharynx is medial.',
    orient: { left: 'Posterior (ear)', right: 'Anterior (cheek)', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 5], [60, 5.6]], at: [20, 3.4], lab: [20, 3.4] },
      { id: 'mas', kind: 'muscle', label: 'Masseter', short: 'Masseter', stri: 80, bottom: [[0, 13.6], [60, 14.4]], at: [46, 9.8], lab: [46, 9.8] },
      { id: 'itf', kind: 'fat-deep', label: 'Infratemporal fossa', short: 'ITF', echo: 0.3, edge: 0, bottom: 80, at: [7.4, 41.4], lab: [7.4, 41.4] },
    ],
    shapes: [
      { id: 'par', kind: 'organ', label: 'Parotid gland', short: 'Parotid', shape: P([0, 5.4], [9, 5.6], [12, 9.6], [10.6, 18], [0, 19]), at: [4.6, 11.6], lab: [4.6, 11.6] },
      { id: 'con', kind: 'bone', label: 'Condyle (neck of the mandible)', short: 'Condyle', shape: PS([11, 14.6], [20.4, 14.4], [21, 19.4], [11.6, 20]), at: [16, 17.4], lab: [8, 24] },
      { id: 'cor', kind: 'bone', label: 'Coronoid process', short: 'Coronoid', shape: PS([41.6, 14.8], [52, 15], [51.6, 18.4], [42.2, 18.6]), at: [47, 16.8], lab: [52, 23.4] },
      { id: 'notch', kind: 'label', label: 'Coronoid notch', short: 'Notch', outline: false, shape: E(31, 18.4, 1, 1), at: [24.6, 17.4], lab: [24, 10.2] },
      { id: 'lpt', kind: 'muscle', label: 'Lateral pterygoid', short: 'Lat. pteryg.', shape: P([14, 24], [22, 24.4], [36, 32], [41, 38.4], [36, 40.2], [24, 33.4], [13.6, 28.4]), at: [17.6, 27.4], lab: [12.6, 35.2] },
      { id: 'mxa', kind: 'artery', label: 'Maxillary artery', short: 'Max. a.', shape: E(30.4, 25.6, 1.5, 1.3), lab: [40.4, 26.4] },
      { id: 'pvp', kind: 'vein', label: 'Pterygoid venous plexus', short: 'Venous plexus', shape: [E(33.6, 30, 1, 0.8), E(22, 30.6, 0.9, 0.7), E(38, 34.8, 0.9, 0.7)], at: [33.6, 30], lab: [48.4, 31.4] },
      { id: 'lpp', kind: 'bone', label: 'Lateral pterygoid plate', short: 'Plate', shape: PS([24, 42.6], [38.4, 41.6], [38.8, 44.6], [24.4, 45.6]), at: [31, 42.4], lab: [31, 49.8] },
      { id: 'mx', kind: 'bone', label: 'Maxilla (back wall)', short: 'Maxilla', shape: PS([46.6, 39.6], [60, 35.6], [60, 56], [48.4, 56], [47, 47]), at: [53, 38.2], lab: [54, 50] },
      { id: 'ppf', kind: 'label', label: 'Pterygopalatine fossa', short: 'PPF', outline: true, shape: P([39.6, 43.6], [46.2, 41.6], [46.8, 48], [42, 50.6], [39.6, 47.6]), at: [43, 48.6], lab: [47.6, 53.4] },
      { id: 'v3', kind: 'nerve', label: 'Mandibular nerve (V3)', short: 'V3', shape: E(19.8, 44.6, 1.9, 1.5), lab: [11, 48.4] },
      { id: 'v2', kind: 'nerve', label: 'Maxillary nerve (V2)', short: 'V2', shape: E(42.6, 45.6, 1.3, 1.1), lab: [46, 39] },
      { id: 'phx', kind: 'label', label: 'Pharynx (medial)', short: 'Pharynx', outline: false, shape: E(22, 53.4, 1, 1), at: [22, 53.4], lab: [22, 53.4] },
    ],
    injections: [
      { id: 'v3', label: 'Mandibular (V3): behind the plate', entry: [31.6, -4], tip: [22.6, 43.2],
        target: { at: [20.6, 44], r: 2.6 },
        spread: { along: [[14, 46.4], [20, 46.4], [25, 46]], x0: 15, x1: 25, from: 22.6, thick: 3, up: 0.8, above: 6 },
        steps: {
          needle: '<p>Perpendicular to the skin, through the coronoid notch, to the <strong>lateral pterygoid plate</strong>. Then walk the needle <strong>off the back of the plate</strong> for V3.</p>',
          inject: '<p>Aspirate often: the <strong>maxillary artery</strong> is in the way. Arterial blood from here goes to the brain: small volumes can cause seizures.</p>',
        } },
      { id: 'v2', label: 'Maxillary (V2): in front of the plate', entry: [30.4, -4], tip: [41.2, 44.6],
        target: { at: [42.6, 45.6], r: 2.2 },
        spread: { along: [[39.6, 47], [42.6, 47], [46, 46.8]], x0: 40, x1: 46, from: 41.2, thick: 2.4, up: 0.8, above: 5 },
        steps: {
          needle: '<p>Perpendicular to the skin, through the coronoid notch, to the <strong>lateral pterygoid plate</strong>. Then walk the needle <strong>off the front of the plate</strong>, towards the pterygopalatine fossa, for V2.</p>',
          inject: '<p>Aspirate often: the <strong>maxillary artery</strong> is in the way. Spread from the pterygopalatine fossa into the orbit can cause transient diplopia or visual loss.</p>',
        } },
    ],
    steps: {
      scan: '<p>The needle enters in the <strong>coronoid notch</strong>, below the middle of the zygomatic arch, between the coronoid process and the condyle of the mandible.</p>',
      identify: '<p>Deep to masseter and the notch: the <strong>maxillary artery</strong> and the pterygoid venous plexus, then the <strong>lateral pterygoid plate</strong>. The mandibular nerve (V3) is just behind the plate; the maxillary nerve (V2) is in the <strong>pterygopalatine fossa</strong> in front of it. The pharynx is just medial.</p>',
      needle: '<p>Choose the nerve with the buttons above the steps.</p>',
      inject: '<p>Aspirate often, and watch the patient.</p>',
    },
    probe: { view: 'side', points: [[121, 105]], key: 'Needle entry', label: 'in the coronoid notch, below the middle of the zygomatic arch (right side).' },
    probeInset: headProbeInset,
  },
  // Suprazygomatic maxillary (V2) block with ultrasound: the pterygopalatine fossa seen from below the zygomatic arch
  // (Consultant level, in the deep blocks chapter). Right side of an infant's face; probe in the infrazygomatic area over
  // the maxilla, tilted up and back, marker anterior. Under masseter and the lateral pterygoid muscle, two bright bone
  // lines with shadows (the lateral pterygoid plate behind, the back of the maxilla in front) frame the entrance to the
  // fossa, with the maxillary artery in it. The needle comes from above the arch, out of plane: only its tip is seen.
  // Infant depths (the fossa entrance about 2 cm deep); not to scale for adults.
  ppf: {
    id: 'hn-fa-ppf', title: 'Pterygopalatine fossa: infrazygomatic view for the suprazygomatic maxillary block', width: 32, depth: 30, focus: 18, skin: 0.8,
    view: 'Right side of an infant’s face, probe below the zygomatic arch over the maxilla, tilted upwards and backwards towards the pterygopalatine fossa. Posterior on the left, anterior on the right. The needle comes from above the arch, out of plane.',
    orient: { left: 'Posterior', right: 'Anterior', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3.2], [32, 3.6]], labelX: 26 },
      { id: 'mas', kind: 'muscle', label: 'Masseter', short: 'Masseter', stri: 60, edge: 0.7, bottom: [[0, 8.4], [32, 8]], labelX: 8 },
      { id: 'lpt', kind: 'muscle', label: 'Lateral pterygoid', short: 'Lat. pteryg.', stri: -14, echo: 0.13, edge: 0, bottom: [[0, 18.6], [12.6, 18.2], [16, 19.6], [19.6, 17.8], [32, 15.2]], labelX: 8 },
      { id: 'ppf', kind: 'fat-deep', label: 'Pterygopalatine fossa', short: 'PPF', echo: 0.34, edge: 0, bottom: 40, at: [16, 23.4], lab: [16, 28.2] },
    ],
    shapes: [
      { id: 'lpp', kind: 'bone', label: 'Lateral pterygoid plate', short: 'Plate', shape: PS([0, 19], [12.8, 18.4], [13.2, 20.2], [13.4, 30], [0, 30]), at: [6.4, 18.8], lab: [5.6, 25.2],
        desc: 'The back wall of the entrance to the fossa: a bright line with a black shadow.' },
      { id: 'mx', kind: 'bone', label: 'Maxilla (back wall)', short: 'Maxilla', shape: PS([19.4, 17.6], [32, 15], [32, 30], [20.2, 30], [19, 19.4]), at: [25.6, 16.4], lab: [26, 25.2],
        desc: 'The front wall: the bright, sloping back surface of the maxilla with its shadow.' },
      { id: 'mxa', kind: 'artery', label: 'Maxillary artery', short: 'Max. a.', shape: E(15.4, 20.6, 1, 0.85), lab: [11.4, 13.2],
        desc: 'Pulsatile, in the entrance to the fossa: colour Doppler shows it. Aspirate before injecting.' },
      { id: 'v2', kind: 'nerve', label: 'Maxillary nerve (V2)', short: 'V2', shape: E(16.8, 25.2, 0.9, 0.65), lab: [21.6, 21.4],
        desc: 'Deep in the fossa and rarely seen: the target is the fossa, not the nerve.' },
    ],
    target: { at: [16.2, 21.8], r: 2.2 },
    injections: [
      // Out of plane: the needle crosses the beam, so it shows only as a bright dot (entry a fraction of a millimetre above the tip).
      { id: 'ppf', label: 'Suprazygomatic, out of plane', entry: [16.6, 21.2], tip: [16.9, 21.8],
        spread: { along: [[13.4, 22.4], [16.4, 22.6], [19.2, 22.2]], x0: 13.4, x1: 19.2, from: 16.6, thick: 2.6, up: 0.3, above: 3 } },
    ],
    steps: {
      scan: '<p>Under general anaesthesia, the <strong>mouth slightly open</strong> (the coronoid process moves down out of the way). Probe <strong>below the zygomatic arch, over the maxilla</strong>, tilted upwards and backwards so the beam aims at the pterygopalatine fossa. Colour Doppler on.</p>',
      identify: '<p>Under the skin: masseter, then the <strong>lateral pterygoid</strong> muscle. Deep to it, two bright bone lines with shadows: the <strong>lateral pterygoid plate</strong> behind and the <strong>back of the maxilla</strong> in front. The gap between them is the entrance to the <strong>pterygopalatine fossa</strong>, with the <strong>maxillary artery</strong> in it. The maxillary nerve lies deep in the fossa and is rarely seen.</p>',
      needle: '<p>The needle enters <strong>above the arch</strong>, at the frontozygomatic angle, and touches the greater wing of the sphenoid; it is then turned <strong>downwards and forwards</strong> into the fossa. It crosses the beam <strong>out of plane</strong>, so you see only its tip, as a bright dot or tissue movement, arriving at the fossa entrance.</p>',
      inject: '<p>Aspirate, then inject slowly (dose in the text above), watching the fluid <strong>fill the fossa</strong>: that spread is the sign of success. Repeat on the other side for a cleft palate.</p>',
    },
    probe: { view: 'side', x: 128, y: 104, angle: 0, marker: 'right', label: 'below the right zygomatic arch, over the maxilla, tilted upwards and backwards towards the pterygopalatine fossa.' },
    probeInset: headProbeInset,
  },
};
