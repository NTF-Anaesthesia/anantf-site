// Airway: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../shared/regional/DATA.md ("Scene schema"). Original geometry from typical adult depths.
import { E, P, PS, L } from '../../../shared/regional/js/scene.js';
import { headProbeInset } from '../../../shared/regional/js/figures/head.js?v=20261015';

export const SCENES = {
  // Right side, parasagittal over the thyrohyoid membrane, between the greater cornu of the hyoid and the thyroid cartilage.
  sln: {
    id: 'hn-aw-sln', title: 'Superior laryngeal nerve: parasagittal view of the thyrohyoid membrane', width: 35, depth: 24, focus: 10, skin: 1,
    view: 'Parasagittal view of the right side of the neck, between the greater cornu of the hyoid (cranial, left) and the upper border of the thyroid cartilage (caudal, right).',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3], [35, 3.4]], labelX: 20 },
      { id: 'strap', kind: 'muscle', label: 'Strap muscles', short: 'Straps', stri: 0, bottom: [[0, 5.4], [35, 6]], labelX: 20 },
      { id: 'thm', kind: 'muscle', label: 'Thyrohyoid muscle', short: 'TH muscle', stri: 0, echo: 0.13, bottom: [[0, 8.4], [14, 9.6], [24, 10.4], [35, 10.6]], labelX: 20 },
      { id: 'sp', kind: 'connective', label: 'Space for the nerve', nolabel: true, edge: 0, bottom: [[0, 9.4], [14, 10.6], [24, 11.4], [35, 11.6]] },
      { id: 'pef', kind: 'fat-deep', label: 'Pre-epiglottic fat', short: 'Fat', echo: 0.35, bottom: [[0, 21], [35, 21]], labelX: 16 },
      { id: 'air', kind: 'none', label: 'Airway', nolabel: true, bottom: 30 },
    ],
    lines: [
      { id: 'thmb', kind: 'ligament', label: 'Thyrohyoid membrane', short: 'Membrane', pts: [[0, 9.4], [14, 10.6], [24, 11.4], [35, 11.6]], at: [20, 11.1], lab: [21, 15] },
    ],
    shapes: [
      { id: 'hyoid', kind: 'bone', label: 'Hyoid, greater cornu', short: 'Hyoid', shape: E(4.6, 7.4, 3.6, 1.7), lab: [5, 1.6] },
      { id: 'thy', kind: 'cartilage', label: 'Thyroid cartilage', short: 'Thyroid', shape: P([27, 8.2], [35, 7.6], [35, 12.4], [27, 12.4]), at: [31, 9.6], lab: [30, 17.6] },
      { id: 'sla', kind: 'artery', label: 'Superior laryngeal artery', short: 'SLA', shape: E(12.2, 10.1, 0.75, 0.65), lab: [9, 14.6] },
      { id: 'sln', kind: 'nerve', label: 'Superior laryngeal nerve (internal branch)', short: 'iSLN', shape: E(14.6, 10.2, 0.85, 0.55), lab: [14, 6.2] },
    ],
    target: { at: [14.4, 10], r: 1.8 },
    injections: [
      { id: 'sln', label: 'Above the thyrohyoid membrane', entry: [48, -1], tip: [15.4, 10],
        spread: { along: 'thmb', x0: 7, x1: 22, thick: 1.8, up: 0.9, above: 4 } },
    ],
    steps: {
      scan: '<p>Probe <strong>parasagittal</strong> on the side of the neck, between the hyoid and the thyroid cartilage. Find the bright <strong>greater cornu of the hyoid</strong> (cranially, with a shadow) and the <strong>thyroid cartilage</strong> (caudally).</p>',
      identify: '<p>Between them: the thin <strong>thyrohyoid muscle</strong> over the bright <strong>thyrohyoid membrane</strong>, and pre-epiglottic fat deep to it. The internal branch of the superior laryngeal nerve runs with the <strong>superior laryngeal artery</strong> just below the greater cornu, between the muscle and the membrane. Find the artery with colour Doppler.</p>',
      needle: '<p>In-plane from caudal (or out-of-plane), to the space <strong>between the thyrohyoid muscle and the membrane</strong>, next to the artery, just below the greater cornu. If you pass through the membrane, you are in the pre-epiglottic space: withdraw.</p>',
      inject: '<p>Aspirate (the artery is right there), then inject <strong>1–2 ml</strong>. The fluid lifts the muscle off the membrane. Repeat on the other side.</p>',
    },
    probe: { view: 'side', x: 128, y: 168, angle: 82, label: 'parasagittal on the right side of the neck, between the greater cornu of the hyoid and the thyroid cartilage.' },
    probeInset: headProbeInset,
  },

  // Midline, sagittal over the larynx and upper trachea.
  ttb: {
    id: 'hn-aw-ttb', title: 'Transtracheal block: sagittal midline view of the cricothyroid membrane', width: 40, depth: 22, focus: 8, skin: 1,
    view: 'Sagittal (longitudinal) view in the midline of the neck: thyroid cartilage (cranial, left), the cricothyroid membrane, the cricoid cartilage and the first tracheal rings (caudal, right). The bright air–mucosa line has reverberation artefacts below it.',
    orient: { left: 'Cranial', right: 'Caudal', marker: 'left' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3], [40, 3.6]], labelX: 36 },
      { id: 'soft', kind: 'connective', label: 'Soft tissue', nolabel: true, edge: 0, bottom: [[0, 4.2], [40, 4.6]] },
      { id: 'deep', kind: 'none', label: 'Larynx', nolabel: true, edge: 0, bottom: 30 },
    ],
    lines: [
      { id: 'air', kind: 'pleura', label: 'Air–mucosa interface', short: 'Air line', amp: 1, pts: [[0, 9.6], [12, 9.6], [14, 7.4], [17, 6.6], [20, 7.4], [22, 10.4], [28, 10.4], [31, 8.6], [40, 8.6]], at: [25, 10.4], lab: [26, 14.6] },
    ],
    shapes: [
      { id: 'thy', kind: 'cartilage', label: 'Thyroid cartilage', short: 'Thyroid', shape: P([0, 4.2], [11, 4.6], [13, 6.6], [11.6, 8.8], [0, 9.2]), at: [6, 6.6], lab: [6, 1.6] },
      { id: 'cri', kind: 'cartilage', label: 'Cricoid cartilage', short: 'Cricoid', shape: P([21, 5.6], [24, 4.6], [28, 4.8], [30.4, 6.8], [28.4, 9.8], [22.4, 10], [20.6, 7.8]), at: [25.4, 7.2], lab: [25.4, 1.6] },
      { id: 'ring', kind: 'cartilage', label: 'Tracheal rings', short: 'Rings', shape: [E(34.4, 6.6, 1.9, 1.4), E(39.4, 6.8, 1.9, 1.4)], at: [34.4, 6.6], lab: [35, 13.6] },
      { id: 'ctm', kind: 'ligament', label: 'Cricothyroid membrane', short: 'CTM', shape: L(0.5, [12.6, 5.6], [17, 5.3], [21, 5.8]), at: [17, 5.3], lab: [16.4, 18.4] },
    ],
    target: { at: [17, 6.2], r: 1.8 },
    injections: [
      { id: 'ttb', label: 'Through the cricothyroid membrane', entry: [9, -1.5], tip: [17.4, 8.2],
        pop: { label: 'Give: into the trachea. Aspirate air', plane: [[11, 5.5], [17, 5.3], [23, 5.8]], tent: 0.8, width: 3 } },
    ],
    steps: {
      scan: '<p>Probe <strong>longitudinal in the midline</strong>. Start low and count the <strong>tracheal rings</strong> (dark beads), then slide up: the <strong>cricoid</strong> is bigger and more superficial, and above it the <strong>cricothyroid membrane</strong>, then the thyroid cartilage. Mark the membrane on the skin.</p>',
      identify: '<p>The cartilages are dark (hypoechoic) with a thin bright edge. Deep to them, the bright <strong>air–mucosa line</strong> with repeated reverberation lines below: everything under it is artefact from air. The membrane is the bright band between the thyroid and cricoid cartilages.</p>',
      needle: '<p>Stabilise the larynx with thumb and middle finger. A 20–22G needle on a syringe of local anaesthetic, <strong>perpendicular in the midline</strong> just above the cricoid, aspirating as you go. <strong>Air bubbles</strong> mean the tip is in the trachea: stop advancing at once, so you do not puncture the back wall.</p>',
      inject: '<p>Inject <strong>5 ml of 4% lidocaine quickly</strong>, then take the needle out. The patient coughs, which spreads the local anaesthetic up to the cords and down the trachea. Press on the site.</p>',
    },
    probe: { view: 'front', x: 100, y: 202, angle: 90, label: 'longitudinal in the midline of the neck over the larynx.' },
    probeInset: headProbeInset,
  },
  // Glossopharyngeal nerve, intraoral (landmark block: schematic section, no ultrasound). A horizontal section through
  // the right side of the oropharynx at the base of the tonsillar pillars, turned so that depth from the mucosa (outwards,
  // into the neck) runs down the screen. The nerve curves forward on stylopharyngeus, just deep to the thin superior
  // constrictor, to the base of the tongue; the internal carotid artery lies about 2 cm deeper. Not to scale.
  gpn: {
    id: 'hn-aw-gpn', title: 'Glossopharyngeal nerve: section at the base of the tonsillar pillars', image: 'diagram',
    width: 36, depth: 30, focus: 10, skin: 0.6,
    stepTitles: ['Landmarks', 'Identify', 'Needle', 'Inject'],
    view: 'Schematic horizontal section through the right side of the oropharynx at the base of the tonsillar pillars, turned so that depth from the mucosa (outwards, into the neck) runs down the screen: towards the tongue (anterior) on the left, the back of the pharynx (posterior) on the right. Not to scale.',
    alt: 'Under the mucosa: the lower pole of the tonsil in front and palatopharyngeus (the posterior pillar) behind, then the thin superior constrictor. The glossopharyngeal nerve lies just deep to it beside stylopharyngeus. Deeper, in the parapharyngeal space, are the internal carotid artery and the internal jugular vein.',
    orient: { left: 'Anterior (tongue)', right: 'Posterior', marker: 'left' },
    layers: [
      { id: 'sm', kind: 'connective', label: 'Mucosa and submucosa', short: 'Mucosa', edge: 0, bottom: 1.6, at: [30, 1.1], lab: [30, 1.1] },
      { id: 'pp', kind: 'muscle', label: 'Palatopharyngeus (posterior pillar)', short: 'Post. pillar', stri: 0, bottom: [[0, 1.6], [12.4, 1.6], [16.6, 3.8], [36, 3.8]], smooth: false, edge: 0.7, at: [27, 2.7], lab: [27, 2.7] },
      { id: 'sc', kind: 'muscle', label: 'Superior constrictor', short: 'Constrictor', stri: 8, echo: 0.13, edge: 0.6, bottom: [[0, 5.2], [36, 4.9]], at: [30, 4.4], lab: [31, 7.6] },
      { id: 'pps', kind: 'fat-deep', label: 'Parapharyngeal space', short: 'Parapharyngeal', edge: 0, bottom: 40, at: [20, 13.4], lab: [20, 13.4] },
    ],
    shapes: [
      { id: 'ton', kind: 'connective', label: 'Palatine tonsil (lower pole)', short: 'Tonsil', shape: P([0.6, 1.7], [11.6, 1.7], [14.4, 3], [12, 4.2], [1, 4.2]), at: [6.6, 3.2], lab: [6.6, 3.2] },
      { id: 'stp', kind: 'muscle', label: 'Stylopharyngeus', short: 'Stylo.', shape: E(21.2, 6.7, 2, 1.1), lab: [25.4, 10.2] },
      { id: 'mpt', kind: 'muscle', label: 'Medial pterygoid', short: 'Med. pteryg.', shape: P([0, 10.6], [8, 10.2], [11.4, 14.6], [9, 21], [0, 21.6]), at: [4.4, 15.6], lab: [4.4, 15.6] },
      { id: 'sty', kind: 'bone', label: 'Styloid process', short: 'Styloid', shape: E(15.2, 25.6, 1.3, 1.1), lab: [8.6, 27.2] },
      { id: 'ica', kind: 'artery', label: 'Internal carotid artery', short: 'ICA', shape: E(22.6, 20.2, 2.7, 2.6), lab: [15, 19.4] },
      { id: 'ijv', kind: 'vein', label: 'Internal jugular vein', short: 'IJV', shape: E(30.4, 23.4, 3.4, 2.8), lab: [30.6, 28] },
      { id: 'gpn', kind: 'nerve', label: 'Glossopharyngeal nerve (IX)', short: 'IX', shape: E(17.6, 6.1, 1, 0.7), lab: [11.6, 8.8] },
    ],
    target: { at: [17.6, 5.8], r: 1.8 },
    injections: [
      { id: 'gpn', label: 'Base of the posterior pillar', entry: [25, -4], tip: [18.2, 4.9],
        spread: { along: [[12, 5.3], [17.6, 5.3], [23, 5.1]], x0: 13, x1: 22, from: 18, thick: 1.6, up: 0.5, above: 3 } },
    ],
    steps: {
      scan: '<p>Mouth open, after topical spray. Push the tongue to the other side with a tongue depressor and find the <strong>base of the posterior tonsillar pillar</strong>, about 0.5 cm lateral to the side of the tongue where it meets the floor of the mouth.</p>',
      identify: '<p>The <strong>glossopharyngeal nerve</strong> runs just under the mucosa at the base of the tonsillar pillars. The <strong>internal carotid artery</strong> is close behind the tonsillar pillar, deeper in the neck.</p>',
      needle: '<p>Insert the needle <strong>submucosally</strong> at the base of the posterior tonsillar pillar (or the anterior pillar). The nerve is just under the mucosa, so the needle stays shallow.</p>',
      inject: '<p>Aspirate, then inject (dose box below). Repeat on the other side.</p>',
    },
    probe: { view: 'airway', points: [[114, 128]], key: 'Needle entry', label: 'inside the mouth, at the base of the posterior tonsillar pillar (each side in turn).' },
    probeInset: headProbeInset,
  },
  // Glossopharyngeal nerve by the peristyloid route, with ultrasound (Consultant level). Right side, probe horizontal
  // just below the ear lobe, between the mastoid tip (posterior, left) and the angle of the mandible (anterior, right).
  // Depth into the screen is medial. The styloid process is a bright dot with a shadow about 2 cm deep; the internal
  // carotid artery lies just deep and behind it, the internal jugular vein behind that, and the vagus between the two.
  // The glossopharyngeal nerve curves forward just deep to the styloid, superficial to the carotid: too small to see.
  gpnUs: {
    id: 'hn-aw-gpus', title: 'Glossopharyngeal nerve: transverse view between the mastoid and the angle of the jaw', width: 40, depth: 40, focus: 22, skin: 1.1,
    view: 'Horizontal view on the right side of the upper neck just below the ear lobe, between the mastoid tip (posterior, left) and the angle of the mandible (anterior, right). Deeper on the screen is medial.',
    orient: { left: 'Posterior (mastoid)', right: 'Anterior (jaw)', marker: 'right' },
    layers: [
      { id: 'sc', kind: 'fat', label: 'Subcutaneous fat', short: 'Fat', bottom: [[0, 3.6], [40, 4]], labelX: 20 },
      { id: 'dc', kind: 'fat-deep', label: 'Deep tissues of the upper neck', nolabel: true, echo: 0.3, edge: 0, bottom: 60 },
    ],
    shapes: [
      { id: 'scm', kind: 'muscle', label: 'Sternocleidomastoid', short: 'SCM', shape: P([0, 3.7], [12, 3.9], [16.5, 6.4], [13, 10.6], [0, 11.4]), at: [7, 7.4], lab: [7, 7.4] },
      { id: 'par', kind: 'organ', label: 'Parotid gland (tail)', short: 'Parotid', shape: P([17.5, 4], [40, 4.1], [40, 14.6], [30, 14.2], [21, 12.4], [16.8, 8.4]), at: [29, 9], lab: [29, 9] },
      { id: 'dig', kind: 'muscle', label: 'Posterior belly of digastric', short: 'Digastric', shape: P([5, 13.2], [16, 13], [28, 15.4], [36, 17.2], [35, 19.2], [26, 18.2], [14, 16.4], [5, 16]), at: [21, 15.8], lab: [12.6, 21.4] },
      { id: 'mas', kind: 'bone', label: 'Mastoid process', short: 'Mastoid', shape: PS([0, 12], [3.6, 12.6], [4.2, 40], [0, 40]), at: [1.8, 12.2], lab: [5.4, 36.6] },
      { id: 'ram', kind: 'bone', label: 'Ramus of the mandible', short: 'Mandible', shape: PS([36.4, 16], [40, 15.2], [40, 40], [37, 40]), at: [38, 15.8], lab: [33.4, 36.6] },
      { id: 'sty', kind: 'bone', label: 'Styloid process', short: 'Styloid', shape: E(25, 21.4, 1.7, 1.05), lab: [30.6, 23.2],
        desc: 'A bright dot with a dark shadow about 2 cm deep, halfway between the mastoid tip and the angle of the jaw. The landmark of this block: the target is just behind and deep to it.' },
      { id: 'eca', kind: 'artery', label: 'External carotid artery', short: 'ECA', shape: E(31, 18.6, 1.3, 1.2), lab: [33.4, 12.4] },
      { id: 'ica', kind: 'artery', label: 'Internal carotid artery', short: 'ICA', shape: E(19, 27.4, 2.9, 2.8), lab: [23.6, 31.6],
        desc: 'Round, pulsatile, just deep and behind the styloid process. Check it with colour Doppler before every pass: the needle tip stays superficial to it.' },
      { id: 'ijv', kind: 'vein', label: 'Internal jugular vein', short: 'IJV', shape: E(10.6, 28.8, 4, 3), lab: [8.6, 33.8] },
      { id: 'x', kind: 'nerve', label: 'Vagus nerve (X)', short: 'X', shape: E(15.2, 31.2, 0.9, 0.75), lab: [14.6, 37.4],
        desc: 'Between the carotid and the jugular vein, deeper: local anaesthetic often reaches it (hoarseness), so block one side only with this approach.' },
      { id: 'ix', kind: 'nerve', label: 'Glossopharyngeal nerve (IX)', short: 'IX', shape: E(22.6, 23.8, 0.65, 0.5), lab: [27.6, 27.4],
        desc: 'Curves forward just deep to the styloid, superficial to the internal carotid. Too small to see: the target is the space behind the styloid, not the nerve.' },
    ],
    target: { at: [22, 23.6], r: 2 },
    injections: [
      { id: 'gpus', label: 'Behind the styloid process', entry: [-4, 4.6], tip: [21.4, 23.3],
        spread: { along: [[17, 23.9], [21.6, 24.1], [24.6, 23.6]], x0: 17.4, x1: 24.4, from: 21.4, thick: 1.8, up: 0.9, above: 4 } },
    ],
    steps: {
      scan: '<p>Patient supine, head turned slightly away. Probe <strong>horizontal just below the ear lobe</strong>, between the mastoid tip and the angle of the jaw. Slide until you see the <strong>styloid process</strong>: a bright dot with a shadow, about 2 cm deep. Colour Doppler on.</p>',
      identify: '<p>Under the skin: sternocleidomastoid behind, the tail of the parotid in front, then the posterior belly of digastric. Deeper: the <strong>styloid process</strong>, with the <strong>internal carotid artery</strong> just deep and behind it and the <strong>internal jugular vein</strong> behind that; the vagus lies between them. The glossopharyngeal nerve is too small to see: it curves forward just deep to the styloid.</p>',
      needle: '<p>In-plane <strong>from behind</strong>, a short-bevel needle towards the back of the styloid process. Stop in the space <strong>just behind and deep to it</strong>, superficial to the carotid. Never advance towards the artery or deep to it.</p>',
      inject: '<p>Aspirate, then inject <strong>slowly in small increments</strong>, aspirating between them and talking to the patient: arterial injection here goes straight to the brain. Watch the fluid collect behind the styloid. <strong>One side only</strong> with this approach.</p>',
    },
    probe: { view: 'side', x: 101, y: 135, angle: 0, marker: 'right', label: 'horizontal just below the right ear lobe, between the mastoid tip and the angle of the jaw.' },
    probeInset: headProbeInset,
  },
};
