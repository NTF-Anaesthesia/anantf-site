// Cervical plexus (right side): teaching data for the plexus app.
// Author: Dr Koh Wenjun, NTF Anaesthesia. Educational use only.
// 3D paths: model/cervical-nerves.json (Z-Anatomy world coordinates, metres, Z up, -Y anterior).
// Most cervical plexus paths are drawn for teaching from landmark geometry: Z-Anatomy has no
// cervical plexus branch curves. Anatomy follows standard textbook descriptions.

const ERB = [-0.0435, 0.0070, 1.4905];          // punctum nervosum, behind the posterior border of SCM

export default {
  id: 'cervical',
  name: 'Cervical plexus',
  tab: 'Cervical',
  side: 'right',
  levels: ['C1', 'C2', 'C3', 'C4', 'C5'],
  levelColours: { C1: '#64748b', C2: '#2563eb', C3: '#059669', C4: '#b45309', C5: '#9333ea' },
  intro: 'Anterior rami of C1–C4 form loops in front of the transverse processes, deep to sternocleidomastoid. ' +
    'Four cutaneous nerves emerge together at the middle of its posterior border (Erb’s point); the deep branches ' +
    'supply neck muscles and form the phrenic nerve (C3–C5).',
  model: { glb: 'model/cervical.glb', nerves: 'model/cervical-nerves.json' },
  views: {
    oblique: { label: 'Oblique', target: [-0.040, 0.004, 1.488], position: [-0.300, -0.205, 1.540] },
    front: { label: 'Front', target: [-0.036, -0.002, 1.488], position: [-0.036, -0.360, 1.500] },
    side: { label: 'Side', target: [-0.038, 0.008, 1.488], position: [-0.370, 0.008, 1.500] },
    back: { label: 'Back', target: [-0.036, 0.010, 1.488], position: [-0.036, 0.380, 1.505] },
  },
  defaultView: 'oblique',

  elements: {
    // ------------------------------------------------------------ anterior rami
    'root-c1': {
      name: 'C1 anterior ramus', short: 'C1', kind: 'root', roots: ['C1'], parents: [],
      motor: 'Rectus capitis anterior and lateralis, longus capitis; C1 fibres to geniohyoid and thyrohyoid via XII, and the superior root of the ansa',
      sensory: '',
      notes: 'Runs above the posterior arch of the atlas beneath the vertebral artery, then forwards lateral to the lateral mass. Usually purely motor: most people have no C1 dermatome.',
    },
    'root-c2': {
      name: 'C2 anterior ramus', short: 'C2', kind: 'root', roots: ['C2'], parents: [],
      motor: 'Prevertebral muscles, sternocleidomastoid (proprioceptive and some motor fibres), inferior root of the ansa',
      sensory: 'Via lesser occipital, great auricular and transverse cervical nerves',
      notes: 'Leaves between the atlas and axis, passes behind the vertebral artery and divides into ascending and descending branches that form the C1–C2 and C2–C3 loops.',
    },
    'root-c3': {
      name: 'C3 anterior ramus', short: 'C3', kind: 'root', roots: ['C3'], parents: [],
      motor: 'Prevertebral muscles, levator scapulae, scalenus medius, trapezius; phrenic contribution',
      sensory: 'Great auricular, transverse cervical and supraclavicular nerves',
      notes: 'Leaves the foramen behind the vertebral artery and runs laterally in the gutter of the C3 transverse process, deep to the prevertebral fascia.',
    },
    'root-c4': {
      name: 'C4 anterior ramus', short: 'C4', kind: 'root', roots: ['C4'], parents: [],
      motor: 'Main root of the phrenic nerve; levator scapulae, scalenus medius, trapezius',
      sensory: 'Supraclavicular nerves (cape over the shoulder)',
      notes: 'Lies on scalenus medius behind the upper end of scalenus anterior. Often sends a small branch to C5. A deep cervical plexus block often blocks the phrenic nerve.',
    },
    'root-c5': {
      name: 'C5 anterior ramus', short: 'C5', kind: 'root', roots: ['C5'], parents: [],
      motor: 'Phrenic contribution; mainly brachial plexus (superior trunk)',
      sensory: 'C5 dermatome via the brachial plexus',
      notes: 'Shown because it contributes to the phrenic nerve. It runs between scalenus anterior and medius (interscalene groove) to join C6 as the superior trunk.',
    },

    // ------------------------------------------------------------ loops
    'loop-c1-c2': {
      name: 'C1–C2 loop', short: 'C1–C2 loop', kind: 'trunk', roots: ['C1', 'C2'], parents: ['root-c1', 'root-c2'],
      motor: 'Prevertebral muscles; C1 fibres to the hypoglossal nerve', sensory: '',
      notes: 'Descends in front of the transverse process of the atlas, behind the internal jugular vein.',
    },
    'loop-c2-c3': {
      name: 'C2–C3 loop', short: 'C2–C3 loop', kind: 'trunk', roots: ['C2', 'C3'], parents: ['root-c2', 'root-c3'],
      motor: 'Inferior root of the ansa cervicalis', sensory: 'Great auricular and transverse cervical nerves',
      notes: 'Lies on levator scapulae and scalenus medius, covered by the prevertebral fascia and sternocleidomastoid.',
    },
    'loop-c3-c4': {
      name: 'C3–C4 loop', short: 'C3–C4 loop', kind: 'trunk', roots: ['C3', 'C4'], parents: ['root-c3', 'root-c4'],
      motor: 'Levator scapulae, scalenus medius, trapezius', sensory: 'Supraclavicular nerves',
      notes: 'The lowest loop, at about C4, deep to sternocleidomastoid near the middle of its posterior border.',
    },
    'loop-c4-c5': {
      name: 'C4–C5 communicating branch', short: 'C4 to C5', kind: 'trunk', roots: ['C4'], parents: ['root-c4'],
      motor: 'Adds C4 fibres to the brachial plexus', sensory: '',
      notes: 'A common but variable link between the cervical and brachial plexuses; when large, the brachial plexus is called “prefixed”. Skin over the shoulder tip comes from the supraclavicular nerves (C3, C4), not this link.',
    },

    // ------------------------------------------------------------ superficial (cutaneous) branches
    'n-lesser-occipital': {
      name: 'Lesser occipital nerve', short: 'Lesser occipital', kind: 'terminal', roots: ['C2'], parents: ['root-c2'],
      motor: '', sensory: 'Scalp behind the ear and upper back of the auricle',
      notes: 'Hooks round the accessory nerve, emerges highest at Erb’s point and ascends along the posterior border of sternocleidomastoid.',
    },
    'n-great-auricular': {
      name: 'Great auricular nerve', short: 'Great auricular', kind: 'terminal', roots: ['C2', 'C3'], parents: ['loop-c2-c3'],
      motor: '', sensory: 'Skin over the angle of the mandible and parotid, the ear lobe and lower auricle, skin over the mastoid',
      notes: 'The largest cutaneous branch. Winds round the posterior border of sternocleidomastoid and ascends on its surface towards the ear lobe, parallel to and behind the external jugular vein.',
    },
    'n-transverse-cervical': {
      name: 'Transverse cervical nerve', short: 'Transverse cervical', kind: 'terminal', roots: ['C2', 'C3'], parents: ['loop-c2-c3'],
      motor: '', sensory: 'Skin of the front of the neck, from the mandible to the sternum',
      notes: 'Runs horizontally forwards across sternocleidomastoid, deep to the external jugular vein and platysma. Matters for carotid and thyroid incisions.',
    },
    'n-supraclavicular': {
      name: 'Supraclavicular nerves', short: 'Supraclavicular', kind: 'terminal', roots: ['C3', 'C4'], parents: ['loop-c3-c4'],
      motor: '', sensory: 'Skin over the clavicle, upper chest to the second rib and the point of the shoulder',
      notes: 'One trunk that splits into medial, intermediate and lateral groups crossing the clavicle. Block them (superficial cervical plexus) with an interscalene or superior trunk block for clavicle surgery.',
    },

    // ------------------------------------------------------------ deep (motor) branches
    'n-phrenic': {
      name: 'Phrenic nerve', short: 'Phrenic', kind: 'terminal', roots: ['C3', 'C4', 'C5'], parents: ['root-c4', 'root-c3', 'root-c5'],
      motor: 'Diaphragm (sole motor supply)', sensory: 'Central diaphragm, pericardium, mediastinal pleura (referred shoulder-tip pain)',
      notes: 'Forms at the lateral border of scalenus anterior and runs down its front from lateral to medial, deep to the prevertebral fascia, entering the thorax between the subclavian artery and vein. Blocked by nearly every interscalene block, and often by deep cervical and supraclavicular blocks.',
    },
    'n-ansa-sup': {
      name: 'Superior root of the ansa cervicalis', short: 'Superior root', kind: 'branch', roots: ['C1'], parents: ['root-c1'],
      motor: 'Superior belly of omohyoid; contributes to the ansa', sensory: '',
      notes: 'C1 fibres travel with the hypoglossal nerve, leave it where it hooks forwards, and descend on the front of the carotid sheath.',
    },
    'n-ansa-inf': {
      name: 'Inferior root of the ansa cervicalis', short: 'Inferior root', kind: 'branch', roots: ['C2', 'C3'], parents: ['loop-c2-c3'],
      motor: 'Contributes to the ansa', sensory: '',
      notes: 'Descends lateral to the internal jugular vein, then curves forwards to meet the superior root in front of the carotid sheath.',
    },
    'n-ansa': {
      name: 'Ansa cervicalis', short: 'Ansa cervicalis', kind: 'terminal', roots: ['C1', 'C2', 'C3'], parents: ['n-ansa-sup', 'n-ansa-inf'],
      motor: 'Infrahyoid (strap) muscles: sternohyoid, sternothyroid, omohyoid', sensory: '',
      notes: 'A loop on the front of the carotid sheath, usually near the cricoid cartilage (C6). It is seen, and sometimes divided, during carotid endarterectomy; blocking it only weakens the strap muscles.',
    },
    'n-prevertebral': {
      name: 'Branches to the prevertebral muscles', short: 'Prevertebral', kind: 'branch', roots: ['C1', 'C2', 'C3', 'C4'], parents: ['loop-c1-c2', 'root-c2', 'root-c3', 'root-c4'],
      motor: 'Longus capitis, longus colli, rectus capitis anterior and lateralis', sensory: '',
      notes: 'Short segmental twigs straight from the rami and loops, deep to the prevertebral fascia.',
    },
    'n-levator-scalene': {
      name: 'Branches to levator scapulae and scalenus medius', short: 'Levator, scalenus medius', kind: 'branch', roots: ['C3', 'C4'], parents: ['root-c3', 'root-c4', 'loop-c3-c4'],
      motor: 'Levator scapulae, scalenus medius', sensory: '',
      notes: 'Segmental branches on the floor of the posterior triangle.',
    },
    'n-to-scm-trapezius': {
      name: 'C2–C4 branches to sternocleidomastoid and trapezius', short: 'To SCM, trapezius', kind: 'branch', roots: ['C2', 'C3', 'C4'], parents: ['root-c2', 'loop-c3-c4'],
      motor: 'Some motor fibres to sternocleidomastoid and trapezius (mainly supplied by XI)',
      sensory: 'Proprioception from sternocleidomastoid (C2, C3) and trapezius (C3, C4)',
      notes: 'Join the accessory nerve deep to sternocleidomastoid and in the posterior triangle.',
    },

    // ------------------------------------------------------------ related (not part of the plexus)
    'rel-accessory': {
      name: 'Accessory nerve (XI)', short: 'Accessory (XI)', kind: 'related', roots: [], parents: [],
      motor: 'Sternocleidomastoid and trapezius', sensory: '',
      notes: 'Pierces sternocleidomastoid and crosses the posterior triangle on levator scapulae, emerging about 1 cm above Erb’s point. Superficial blocks here can cause transient shoulder weakness.',
    },
    'rel-hypoglossal': {
      name: 'Hypoglossal nerve (XII)', short: 'Hypoglossal (XII)', kind: 'related', roots: [], parents: [],
      motor: 'Tongue muscles (C1 fibres riding with it supply geniohyoid and thyrohyoid)', sensory: '',
      notes: 'Hooks forwards across the internal and external carotid arteries above the bifurcation. Can be blocked by a deep cervical plexus block.',
    },
    'rel-vagus': {
      name: 'Vagus nerve (X)', short: 'Vagus (X)', kind: 'related', roots: [], parents: [],
      motor: 'Pharynx, larynx (recurrent laryngeal nerve)', sensory: 'Pharynx, larynx, thoracic and abdominal viscera',
      notes: 'In the carotid sheath between the internal jugular vein and carotid artery. Spread to it, or to the recurrent laryngeal nerve, gives hoarseness.',
    },
    'rel-brachial': {
      name: 'Brachial plexus (C6–T1 roots and trunks)', short: 'Brachial plexus', kind: 'related', roots: [], parents: [],
      motor: 'Upper limb', sensory: 'Upper limb',
      notes: 'C5 and C6 join as the superior trunk between scalenus anterior and medius. The phrenic nerve lies just in front of scalenus anterior, which is why interscalene blocks almost always paralyse the hemidiaphragm.',
    },
    'rel-sympathetic': {
      name: 'Cervical sympathetic trunk', short: 'Sympathetic trunk', kind: 'related', roots: [], parents: [],
      motor: 'Sympathetic supply to the head, neck and upper limb', sensory: '',
      notes: 'Lies on longus colli behind the carotid sheath. Spread to it after deep blocks causes Horner syndrome.',
    },
  },

  order: [
    'root-c1', 'root-c2', 'root-c3', 'root-c4', 'root-c5',
    'loop-c1-c2', 'loop-c2-c3', 'loop-c3-c4', 'loop-c4-c5',
    'n-lesser-occipital', 'n-great-auricular', 'n-transverse-cervical', 'n-supraclavicular',
    'n-phrenic', 'n-ansa-sup', 'n-ansa-inf', 'n-ansa', 'n-prevertebral', 'n-levator-scalene', 'n-to-scm-trapezius',
    'rel-accessory', 'rel-hypoglossal', 'rel-vagus', 'rel-brachial', 'rel-sympathetic',
  ],

  // ---------------------------------------------------------------- diagram (original schematic)
  diagram: {
    viewBox: [0, -60, 1300, 920],
    columns: [
      { x0: 0, x1: 250, label: 'Anterior rami', sub: 'Leave foramina' },
      { x0: 250, x1: 470, label: 'Loops', sub: 'Deep to SCM' },
      { x0: 470, x1: 760, label: 'Branches', sub: 'Around SCM' },
      { x0: 760, x1: 1200, label: 'Destinations', sub: 'Skin and muscles' },
    ],
    regions: [
      { x: 480, y: 75, w: 710, h: 285, label: 'Superficial branches' },
      { x: 480, y: 380, w: 710, h: 430, label: 'Deep branches' },
    ],
    geom: {
      'root-c1': { d: ['M70 80 L250 80'], w: 'xl', label: { x: 18, y: 86, anchor: 'start', kind: 'root' } },
      'root-c2': { d: ['M70 190 L250 190'], w: 'xl', label: { x: 18, y: 196, anchor: 'start', kind: 'root' } },
      'root-c3': { d: ['M70 300 L250 300'], w: 'xl', label: { x: 18, y: 306, anchor: 'start', kind: 'root' } },
      'root-c4': { d: ['M70 410 L250 410'], w: 'xl', label: { x: 18, y: 416, anchor: 'start', kind: 'root' } },
      'root-c5': { d: ['M70 600 L250 600 C290 600 300 640 340 650'], w: 'xl', label: { x: 18, y: 606, anchor: 'start', kind: 'root' } },

      'loop-c1-c2': { d: ['M250 80 C315 95 315 175 250 190'], w: 'm', label: { x: 318, y: 140, anchor: 'start', kind: 'struct', text: 'C1–C2' } },
      'loop-c2-c3': { d: ['M250 190 C315 205 315 285 250 300'], w: 'm', label: { x: 318, y: 250, anchor: 'start', kind: 'struct', text: 'C2–C3' } },
      'loop-c3-c4': { d: ['M250 300 C315 315 315 395 250 410'], w: 'm', label: { x: 318, y: 360, anchor: 'start', kind: 'struct', text: 'C3–C4' } },
      'loop-c4-c5': { d: ['M190 410 C215 470 215 560 240 600'], w: 's', dash: true, label: { x: 222, y: 500, anchor: 'start', kind: 'branch', text: 'C4 to C5' } },

      // superficial branches converge on Erb's point (620, 200) then fan out
      'n-lesser-occipital': { d: ['M250 190 C380 190 520 180 612 192 C700 150 820 60 880 60'], w: 's', label: { x: 890, y: 66, anchor: 'start', kind: 'term' } },
      'n-great-auricular': { d: ['M298 228 C420 222 540 200 616 198 C720 175 840 130 880 130'], w: 's', label: { x: 890, y: 136, anchor: 'start', kind: 'term' } },
      'n-transverse-cervical': { d: ['M302 245 C420 240 540 210 618 205 C720 205 840 200 880 200'], w: 's', label: { x: 890, y: 206, anchor: 'start', kind: 'term' } },
      'n-supraclavicular': { d: [
        'M302 355 C420 340 540 230 620 210 C720 235 840 270 880 270',
        'M620 210 C720 250 840 300 880 300',
        'M620 210 C720 265 840 330 880 330',
      ], w: 's', label: { x: 890, y: 306, anchor: 'start', kind: 'term' } },

      // deep branches
      'n-phrenic': { d: [
        'M250 410 C320 410 360 540 440 560 L880 560',
        'M300 330 C350 360 360 520 440 560',
        'M340 650 C380 640 400 565 440 560',
      ], w: 'm', label: { x: 890, y: 566, anchor: 'start', kind: 'term' } },
      'n-ansa-sup': { d: ['M250 80 C300 80 330 58 380 58 L420 58 C440 58 445 66 445 85 L445 690 C445 715 470 730 500 730'], w: 's',
        label: { x: 454, y: 522, anchor: 'start', kind: 'branch', text: 'Superior root (C1)' } },
      'n-ansa-inf': { d: ['M300 248 C360 260 395 300 395 360 L395 700 C395 760 470 760 500 730'], w: 's',
        label: { x: 400, y: 802, anchor: 'start', kind: 'branch', text: 'Inferior root (C2, C3)' } },
      'n-ansa': { d: ['M500 730 L880 730', 'M560 730 C600 730 620 700 660 700', 'M560 730 C600 730 620 760 660 760'], w: 's',
        label: { x: 890, y: 736, anchor: 'start', kind: 'term', text: 'Ansa cervicalis' } },
      'n-prevertebral': { d: ['M180 80 L205 52', 'M180 190 L205 162', 'M180 300 L205 272', 'M180 410 L205 382'], w: 's',
        label: { x: 212, y: 58, anchor: 'start', kind: 'branch', text: 'Prevertebral' } },
      'n-levator-scalene': { d: ['M110 300 L135 330', 'M110 410 L135 440'], w: 's',
        label: { x: 60, y: 466, anchor: 'start', kind: 'branch', text: 'Levator, scalenus medius' } },
      'n-to-scm-trapezius': { d: ['M292 390 C380 400 440 450 520 450 L600 450'], w: 's',
        label: { x: 520, y: 436, anchor: 'start', kind: 'branch', text: 'To SCM, trapezius (join XI)' } },

      // related nerves (greyed by the engine)
      'rel-hypoglossal': { d: ['M410 46 L470 46'], w: 's', label: { x: 480, y: 52, anchor: 'start', kind: 'branch', text: 'Hypoglossal (XII)' } },
      'rel-accessory': { d: ['M600 450 L880 450'], w: 's', label: { x: 890, y: 456, anchor: 'start', kind: 'branch', text: 'Accessory (XI)' } },
      'rel-brachial': { d: ['M70 660 C200 660 280 655 340 650', 'M70 700 C200 700 280 660 340 652', 'M70 740 C200 740 290 665 340 654', 'M340 650 L380 650'],
        w: 's', label: { x: 18, y: 802, anchor: 'start', kind: 'branch', text: 'Brachial plexus (C6–T1)' } },
      'rel-vagus': { d: ['M560 640 L760 640'], w: 's', label: { x: 770, y: 646, anchor: 'start', kind: 'branch', text: 'Vagus (X), carotid sheath' } },
      'rel-sympathetic': { d: ['M560 670 L760 670'], w: 's', label: { x: 770, y: 676, anchor: 'start', kind: 'branch', text: 'Sympathetic trunk' } },
    },
    notes: [
      { x: 600, y: 256, text: 'Erb’s point', anchor: 'middle' },
      { x: 1190, y: 846, text: 'Grey: related nerves, not part of the plexus', anchor: 'end' },
    ],
  },

  // ---------------------------------------------------------------- blocks
  blocks: {
    superficial: {
      name: 'Superficial cervical plexus block', short: 'Superficial',
      summary: 'Subcutaneous local anaesthetic along the middle of the posterior border of sternocleidomastoid, superficial to the investing fascia, where the four cutaneous nerves emerge. For superficial neck surgery and, with an interscalene or superior trunk block, clavicle surgery. For carotid endarterectomy most use an intermediate block plus surgical infiltration.',
      landmarks: 'Midpoint of the posterior border of SCM (about the level of the thyroid cartilage, C4); ultrasound: subcutaneous, superficial to the investing fascia over that border.',
      target: ['n-lesser-occipital', 'n-great-auricular', 'n-transverse-cervical', 'n-supraclavicular'],
      covers: [],
      variable: ['rel-accessory'],
      spares: ['n-phrenic', 'n-ansa', 'root-c1'],
      band: { x0: 480, x1: 890, y0: 47, y1: 360 },
      view: { target: [-0.043, 0.006, 1.495], position: [-0.255, -0.075, 1.525] },
      marker: ERB,
    },
    intermediate: {
      name: 'Intermediate cervical plexus block', short: 'Intermediate',
      summary: 'Local anaesthetic in the posterior cervical space, between the investing and prevertebral fasciae, deep to the posterior border of sternocleidomastoid. Same skin cover as the superficial block with some spread to deeper branches; the usual choice with surgical infiltration for carotid endarterectomy.',
      landmarks: 'Ultrasound at C4: needle tip deep to SCM, superficial to the prevertebral fascia over levator scapulae and scalenus medius.',
      target: ['n-lesser-occipital', 'n-great-auricular', 'n-transverse-cervical', 'n-supraclavicular'],
      covers: [],
      variable: ['rel-accessory', 'n-phrenic', 'loop-c2-c3', 'loop-c3-c4', 'n-ansa-inf'],
      spares: ['n-ansa-sup'],
      band: { x0: 250, x1: 890, y0: 47, y1: 420 },
      view: { target: [-0.040, 0.007, 1.495], position: [-0.255, -0.065, 1.528] },
      marker: [-0.0395, 0.0080, 1.4930],
    },
    deep: {
      name: 'Deep cervical plexus block', short: 'Deep',
      summary: 'Injection at the C2, C3 and C4 transverse processes (or one injection at C3–C4 deep to the prevertebral fascia), blocking the rami and both cutaneous and motor branches. Phrenic palsy is common (up to about 60%), so avoid it if a hemidiaphragm paralysis would not be tolerated and never block both sides. Other risks: vertebral artery, intrathecal or epidural injection.',
      landmarks: 'Transverse processes of C2–C4 on a line from the mastoid to Chassaignac’s tubercle (C6); ultrasound: deep to the prevertebral fascia at the C3 or C4 transverse process, away from the vertebral artery and foramen; aspirate and inject slowly.',
      target: ['root-c2', 'root-c3', 'root-c4'],
      covers: ['loop-c2-c3', 'loop-c3-c4', 'n-lesser-occipital', 'n-great-auricular', 'n-transverse-cervical', 'n-supraclavicular',
        'n-ansa-inf', 'n-prevertebral', 'n-levator-scalene', 'n-to-scm-trapezius'],
      variable: ['n-phrenic', 'root-c1', 'loop-c1-c2', 'n-ansa-sup', 'n-ansa', 'root-c5', 'loop-c4-c5', 'rel-vagus', 'rel-hypoglossal', 'rel-sympathetic', 'rel-accessory'],
      spares: [],
      band: { x0: 0, x1: 480, y0: 125, y1: 445 },
      view: { target: [-0.032, 0.008, 1.505], position: [-0.245, -0.055, 1.535] },
      marker: [-0.0315, 0.0060, 1.5090],
    },
    'great-auricular': {
      name: 'Great auricular nerve block', short: 'Great auricular',
      summary: 'A small volume on the surface of sternocleidomastoid, around the nerve as it crosses the muscle. For ear, parotid and mastoid skin surgery.',
      landmarks: 'Ultrasound: the nerve on the surface of SCM about 6.5 cm below the external auditory meatus (McKinney’s point), behind the external jugular vein.',
      target: ['n-great-auricular'],
      covers: [],
      variable: ['n-lesser-occipital'],
      spares: ['n-transverse-cervical', 'n-supraclavicular', 'n-phrenic'],
      band: { x0: 610, x1: 1190, y0: 100, y1: 162, label: ' ' },
      view: { target: [-0.050, 0.004, 1.515], position: [-0.255, -0.085, 1.545] },
      marker: [-0.0490, 0.0045, 1.5060],
    },
  },
  blockOrder: ['superficial', 'intermediate', 'deep', 'great-auricular'],
  credits: 'Cervical plexus branches are not modelled in Z-Anatomy: their 3D paths are drawn for teaching from the surrounding anatomy.',
};
