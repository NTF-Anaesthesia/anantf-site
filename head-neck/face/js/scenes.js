// Face: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// The three superficial trigeminal blocks share one layout: skin, a thin muscle layer, and a bright bone surface with a
// gap where the foramen (or notch) is, the nerve coming out of it with its artery. Original geometry, typical adult depths.
import { E, L } from '../../../truncal/shared/js/scene.js';
import { headProbeInset } from '../../shared/js/head.js';

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
};
