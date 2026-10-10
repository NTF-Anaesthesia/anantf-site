// Eye: schematic sections of the orbit for the landmark eye blocks (no ultrasound: scene.image = 'diagram').
// The orbit is drawn as a sagittal section turned on its side so that depth into the orbit runs down the screen:
// the front of the eye is at the top, the orbital apex at the bottom, the roof on the left and the floor on the right.
// Millimetres; schema ../../../truncal/shared/DATA.md. Original geometry from typical adult dimensions (axial length
// about 24 mm, orbit about 45 mm deep); nothing is traced from published images.
import { E, P, L } from '../../../truncal/shared/js/scene.js';
import { headProbeInset } from '../../shared/js/head.js';

const G = { cx: 24, cy: 12.2, r: 11.8 };             // globe
const arc = (r, a0, a1, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
  const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180;
  return [+(G.cx + r * Math.cos(a)).toFixed(2), +(G.cy + r * Math.sin(a)).toFixed(2)];
});

function orbit({ id, title, view, tenon = false, injections, steps, probe }) {
  const shapes = [
    { id: 'roof', kind: 'bone', label: 'Orbital roof', short: 'Roof', shape: L(1.4, [1.5, 1], [3.6, 14], [9.5, 30], [19.5, 45.5]), at: [4.4, 17], lab: [5, 38] },
    { id: 'floor', kind: 'bone', label: 'Orbital floor', short: 'Floor', shape: L(1.4, [47, 2], [45, 14], [39, 29], [30, 45.5]), at: [44.2, 17], lab: [44, 40] },
    { id: 'globe', kind: 'fluid', label: 'Globe', shape: E(G.cx, G.cy, G.r, G.r), at: [17, 13], lab: [15, 11.5] },
    { id: 'lens', kind: 'cartilage', label: 'Lens', nolabel: true, shape: E(G.cx, 4.6, 4.4, 1.8) },
    { id: 'sr', kind: 'muscle', label: 'Superior rectus', short: 'SR', shape: P([12.3, 13.6], [14, 13], [24, 44.6], [22.8, 45]), at: [16.6, 24], lab: [9.5, 23] },
    { id: 'ir', kind: 'muscle', label: 'Inferior rectus', short: 'IR', shape: P([34, 13], [35.7, 13.6], [26.4, 45], [25.2, 44.6]), at: [33.2, 21], lab: [41.6, 21.5] },
    { id: 'on', kind: 'nerve', label: 'Optic nerve', short: 'ON', shape: P([22.3, 23.4], [25.7, 23.4], [25.3, 46], [22.7, 46]), at: [24, 34], lab: [24, 42] },
    { id: 'oa', kind: 'artery', label: 'Ophthalmic artery', short: 'OA', nolabel: true, shape: E(21.4, 38, 0.7, 0.7) },
    { id: 'cone', kind: 'label', label: 'Intraconal space (muscle cone)', short: 'Intraconal', outline: false, shape: E(28.4, 31, 1, 1), at: [28.6, 30.6], lab: [24, 28.4] },
    { id: 'extra', kind: 'label', label: 'Extraconal space', short: 'Extraconal', outline: false, shape: E(40, 21, 1, 1), at: [40, 24], lab: [40, 26.6] },
  ];
  if (tenon) {
    shapes.push({ id: 'tenon', kind: 'fascia', label: 'Tenon’s capsule', short: 'Tenon’s', shape: L(0.35, ...arc(G.r + 1, -12, 192)), at: [G.cx + 9.4, 21.4], lab: [41.6, 15.6] });
    shapes.push({ id: 'sts', kind: 'label', label: 'Sub-Tenon’s space', short: 'Sub-Tenon’s', outline: false, shape: E(G.cx - 9, G.cy + 8, 0.5, 0.5), at: [G.cx - 8.5, G.cy + 8], lab: [8.4, 30.5] });
  }
  return {
    id, title, image: 'diagram', width: 48, depth: 48, focus: 20, skin: 0.6, view,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    orient: { left: 'Superior (roof)', right: 'Inferior (floor)', marker: 'right' },
    alt: 'The globe is at the top, the optic nerve runs down the middle to the orbital apex, with the superior rectus on the left and the inferior rectus on the right forming the muscle cone.',
    layers: [{ id: 'fat', kind: 'fat-deep', label: 'Orbital fat', short: 'Fat', bottom: 60, at: [8, 6], lab: [6, 5] }],
    shapes, injections, steps, probe, probeInset: headProbeInset,
  };
}

const ENTRY = [41.4, 0.3]; // through the lower lid, inferotemporal, lateral to the lateral limbus

export const SCENES = {
  peri: orbit({
    id: 'hn-ey-peri', title: 'Peribulbar and retrobulbar blocks: section through the orbit',
    view: 'Schematic section through the orbit, turned so that depth runs down the screen: the front of the eye at the top, the orbital apex at the bottom; the roof on the left and the floor on the right. Not to scale.',
    injections: [
      { id: 'peri', label: 'Peribulbar (extraconal)', entry: ENTRY, tip: [40.6, 22],
        target: { at: [40.6, 22], r: 2 },
        spread: { along: [[33, 22.4], [37, 22.2], [40.6, 22], [44, 21.6]], x0: 35.4, x1: 44, thick: 4.4, up: 0.75, above: 14 },
        steps: {
          needle: '<p>A <strong>short needle (about 25 mm, 25G)</strong>, bevel facing the globe, goes straight back <strong>parallel to the orbital floor</strong>. If it touches bone, angle slightly upwards. Stop about 25 mm deep: past the equator of the globe, but <strong>in front of its back surface</strong>, outside the muscle cone.</p>',
          inject: '<p>Aspirate, then inject <strong>8–10 ml slowly</strong> (often with hyaluronidase). Watch the eye: some proptosis is expected. If the conjunctiva balloons at once (chemosis), the tip is too superficial. Then press gently on the closed eye (soft pad or Honan balloon, not over 30 mmHg) and test movements after 5 minutes.</p>',
        } },
      { id: 'retro', label: 'Retrobulbar (intraconal)', entry: ENTRY, tip: [29.4, 30],
        target: { at: [29.4, 30], r: 2 },
        spread: { along: [[25.8, 30.4], [29.4, 30], [32, 29.6]], x0: 26, x1: 32, thick: 3.4, up: 0.85, above: 12 },
        steps: {
          needle: '<p>Straight back, parallel to the floor, until the equator of the globe is passed (10–15 mm), then <strong>redirect slightly upwards and medially</strong> into the cone, to the level of the back of the globe. The tip ends <strong>near the optic nerve</strong>, the ophthalmic artery and the dural sheath: this is why the block is now rarely used.</p>',
          inject: '<p>Aspirate, then inject <strong>4–5 ml</strong> inside the cone. Faster, denser block with a smaller volume, but a higher risk of optic nerve injury, retrobulbar haemorrhage and brainstem anaesthesia.</p>',
        } },
    ],
    steps: {
      scan: '<p>Patient supine, <strong>looking straight ahead</strong>. Feel the inferior orbital rim. The needle goes in through the lower lid (or the conjunctiva) at the junction of the lateral third and medial two-thirds, <strong>lateral to the lateral limbus</strong>: the inferotemporal quadrant, away from the optic nerve.</p>',
      identify: '<p>Know what lies behind: the <strong>globe</strong> (about 24 mm long; longer in myopic eyes), the <strong>muscle cone</strong> (the four recti) with the <strong>optic nerve</strong> and ophthalmic artery inside it, and fat inside and outside the cone. A peribulbar block stays <strong>outside</strong> the cone; a retrobulbar block goes <strong>inside</strong> it.</p>',
      needle: '<p>Choose the block with the buttons above the steps.</p>',
      inject: '<p>Aspirate before injecting, and watch the eye and the patient.</p>',
    },
    probe: { view: 'front', points: [[70, 92]], key: 'Needle entry', label: 'through the lower lid, inferotemporal, lateral to the lateral limbus (right eye).' },
  }),

  st: orbit({
    id: 'hn-ey-st', title: 'Sub-Tenon’s block: section through the orbit', tenon: true,
    view: 'The same schematic section, showing Tenon’s capsule around the globe. The blunt cannula follows the curve of the globe in the sub-Tenon’s space, between the capsule and the sclera. Not to scale.',
    injections: [
      { id: 'st', label: 'Sub-Tenon’s', entry: [36.6, 1.4], tip: [36.2, 17.2],
        target: { at: [36.2, 17.2], r: 1.8 },
        spread: { along: arc(G.r + 0.5, 158, 22).sort((a, b) => a[0] - b[0]), from: 34, x0: 14, x1: 36, thick: 1.8, up: 0.15, above: 6 } },
    ],
    steps: {
      scan: '<p>Topical drops into the lower fornix, then povidone-iodine 5%. A small speculum holds the lids apart. The patient <strong>looks up and out</strong> (“look at my chin” with you at the head), which exposes the <strong>inferonasal quadrant</strong>.</p>',
      identify: '<p><strong>Tenon’s capsule</strong> is a thin layer around the globe. In front it fuses with the conjunctiva near the limbus; behind, with the dura of the optic nerve. The <strong>sub-Tenon’s space</strong> is the potential space between the capsule and the sclera.</p>',
      needle: '<p>Lift the conjunctiva and Tenon’s capsule together with forceps, 5–10 mm from the limbus, and make a cut <strong>no more than 2 mm</strong> wide with blunt scissors, down to bare sclera. Pass a <strong>blunt curved cannula (19G, 25 mm)</strong> through the opening and follow the curve of the globe, keeping it on the sclera, until it is behind the equator (15–20 mm).</p>',
      inject: '<p>Aspirate, then inject <strong>4–5 ml slowly</strong>; 2–3 ml more if akinesia is not enough. The fluid spreads round the back of the globe and into the cone. Press gently on the closed eye for a few minutes.</p>',
    },
    probe: { view: 'front', points: [[85, 91]], key: 'Entry', label: 'inferonasal quadrant of the conjunctiva, 5–10 mm from the limbus (right eye).' },
  }),
};
