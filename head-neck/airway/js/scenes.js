// Airway: ultrasound scenes (millimetres; x across the screen from the left, y = depth from the skin).
// Schema: ../../../truncal/shared/DATA.md ("Scene schema"). Original geometry from typical adult depths.
import { E, P, L } from '../../../truncal/shared/js/scene.js';
import { headProbeInset } from '../../shared/js/head.js';

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
};
