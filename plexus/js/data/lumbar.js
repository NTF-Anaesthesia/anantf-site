// Lumbar plexus (right side): data, 3D views, blocks and diagram geometry.
// 3D coordinates are Z-Anatomy world metres (Z up, -Y anterior, +X patient's left).
// Nerve paths: model/lumbar-nerves.json (built by a generator script from Z-Anatomy
// curves plus paths drawn from landmarks where Z-Anatomy has none).

const L5_NOTE = 'L5';

export default {
  id: 'lumbar',
  name: 'Lumbar plexus',
  tab: 'Lumbar',
  side: 'right',
  levels: ['T12', 'L1', 'L2', 'L3', 'L4', 'L5'],
  levelColours: { T12: '#5b6b7a', L1: '#1f6f8b', L2: '#8c4f9f', L3: '#2f7d32', L4: '#b45309', L5: '#9d174d' },
  intro: 'The lumbar plexus forms inside psoas major from the anterior rami of L1–L4, often with a small branch from T12. '
    + 'Its nerves leave psoas at its lateral border (femoral, LFCN, iliohypogastric, ilio-inguinal), its front (genitofemoral) and its medial border (obturator, lumbosacral trunk).',
  model: { glb: 'model/lumbar.glb', nerves: 'model/lumbar-nerves.json' },
  views: {
    front: { label: 'Front', target: [-0.065, -0.01, 0.955], position: [-0.065, -0.70, 0.985] },
    side: { label: 'Side', target: [-0.05, 0.0, 0.95], position: [-0.68, 0.0, 0.98] },
    back: { label: 'Back', target: [-0.045, 0.02, 0.98], position: [-0.05, 0.64, 1.0] },
    triangle: { label: 'Femoral triangle', target: [-0.065, -0.04, 0.85], position: [-0.19, -0.36, 0.93] },
    thigh: { label: 'Thigh', target: [-0.08, -0.02, 0.625], position: [-0.25, -0.84, 0.685] },
  },
  defaultView: 'front',

  elements: {
    // Anterior rami
    'root-t12': {
      name: 'T12 anterior ramus (contribution)', short: 'T12', kind: 'root', roots: ['T12'], parents: [],
      motor: 'Quadratus lumborum (with L1–L4)', sensory: '',
      notes: 'Most of T12 continues as the subcostal nerve. A small, inconstant branch joins L1, so the iliohypogastric nerve is often described as L1 (± T12).',
    },
    'root-l1': {
      name: 'L1 anterior ramus', short: 'L1', kind: 'root', roots: ['L1'], parents: [],
      motor: 'Psoas major, quadratus lumborum', sensory: '',
      notes: 'Does not split into anterior and posterior divisions. Its upper branch forms the iliohypogastric and ilio-inguinal nerves; its lower branch joins L2 to form the genitofemoral nerve.',
    },
    'root-l2': {
      name: 'L2 anterior ramus', short: 'L2', kind: 'root', roots: ['L2'], parents: [],
      motor: 'Psoas major, quadratus lumborum', sensory: '',
      notes: 'Gives a branch to the genitofemoral nerve, then splits within psoas into an anterior division (obturator) and a posterior division (femoral, LFCN).',
    },
    'root-l3': {
      name: 'L3 anterior ramus', short: 'L3', kind: 'root', roots: ['L3'], parents: [],
      motor: 'Psoas major, quadratus lumborum', sensory: '',
      notes: 'A major contributor to the femoral and obturator nerves. The roots and divisions lie in the posterior part of psoas, in front of the transverse processes: the target of the lumbar plexus block at L3–L4 or L4–L5.',
    },
    'root-l4': {
      name: 'L4 anterior ramus', short: 'L4', kind: 'root', roots: ['L4'], parents: [],
      motor: 'Quadratus lumborum', sensory: '',
      notes: 'Splits three ways: an anterior division (obturator), a posterior division (femoral) and a descending part that joins L5 as the lumbosacral trunk, linking the lumbar and sacral plexuses.',
    },

    // Divisions
    'div-l2-ant': {
      name: 'L2 anterior division', short: 'L2 anterior', kind: 'division', roots: ['L2'], parents: ['root-l2'],
      motor: '', sensory: '', notes: 'Joins the anterior divisions of L3 and L4 to form the obturator nerve.',
    },
    'div-l2-post': {
      name: 'L2 posterior division', short: 'L2 posterior', kind: 'division', roots: ['L2'], parents: ['root-l2'],
      motor: '', sensory: '', notes: 'Joins the posterior divisions of L3 and L4 to form the femoral nerve, and with L3 forms the LFCN.',
    },
    'div-l3-ant': {
      name: 'L3 anterior division', short: 'L3 anterior', kind: 'division', roots: ['L3'], parents: ['root-l3'],
      motor: '', sensory: '', notes: 'Joins the obturator nerve; with L4 it may also form an accessory obturator nerve.',
    },
    'div-l3-post': {
      name: 'L3 posterior division', short: 'L3 posterior', kind: 'division', roots: ['L3'], parents: ['root-l3'],
      motor: '', sensory: '', notes: 'Joins the femoral nerve and sends a branch to the LFCN.',
    },
    'div-l4-ant': {
      name: 'L4 anterior division', short: 'L4 anterior', kind: 'division', roots: ['L4'], parents: ['root-l4'],
      motor: '', sensory: '', notes: 'Joins the obturator nerve; with L3 it may also form an accessory obturator nerve.',
    },
    'div-l4-post': {
      name: 'L4 posterior division', short: 'L4 posterior', kind: 'division', roots: ['L4'], parents: ['root-l4'],
      motor: '', sensory: '', notes: 'Joins the femoral nerve.',
    },
    'trunk-ls': {
      name: 'Lumbosacral trunk', short: 'Lumbosacral trunk', kind: 'trunk', roots: ['L4', 'L5'], parents: ['root-l4'],
      motor: '', sensory: '',
      notes: 'Part of L4 joins the L5 anterior ramus at the medial border of psoas. The trunk crosses the sacral ala and enters the pelvis to join S1 in the sacral plexus. Shown to the pelvic brim.',
    },

    // Branches of L1 (± T12) and L1–L2
    'n-iliohypogastric': {
      name: 'Iliohypogastric nerve', short: 'Iliohypogastric', kind: 'terminal', roots: ['T12', 'L1'], parents: ['root-l1', 'root-t12'],
      motor: 'Internal oblique, transversus abdominis',
      sensory: 'Skin of the upper lateral buttock (lateral branch) and above the pubis (anterior branch)',
      notes: 'Leaves the lateral border of psoas, crosses quadratus lumborum behind the kidney and pierces transversus abdominis above the iliac crest. It then runs between transversus abdominis and internal oblique, where it is blocked near the ASIS.',
    },
    'n-ilioinguinal': {
      name: 'Ilio-inguinal nerve', short: 'Ilio-inguinal', kind: 'terminal', roots: ['L1'], parents: ['root-l1'],
      motor: 'Lowest fibres of internal oblique and transversus abdominis',
      sensory: 'Upper medial thigh, root of the penis and front of the scrotum (mons pubis and labium majus)',
      notes: 'Runs just below the iliohypogastric nerve and pierces transversus abdominis near the ASIS. It then passes through the inguinal canal, outside the spermatic cord, and leaves through the superficial ring.',
    },
    'n-genitofemoral': {
      name: 'Genitofemoral nerve', short: 'Genitofemoral', kind: 'terminal', roots: ['L1', 'L2'], parents: ['root-l1', 'root-l2'],
      motor: 'Cremaster (genital branch)', sensory: 'See its genital and femoral branches',
      notes: 'The only nerve to emerge through the front of psoas. It runs down on the anterior surface of the muscle, behind the ureter, and divides above the inguinal ligament.',
    },
    'n-gf-genital': {
      name: 'Genital branch of genitofemoral nerve', short: 'Genital br.', kind: 'branch', roots: ['L1', 'L2'], parents: ['n-genitofemoral'],
      motor: 'Cremaster', sensory: 'Scrotal skin (mons pubis and labium majus)',
      notes: 'Enters the deep inguinal ring and runs in the spermatic cord (or with the round ligament). An ilio-inguinal/iliohypogastric block misses it, so the cord and hernia sac may need extra local anaesthetic.',
    },
    'n-gf-femoral': {
      name: 'Femoral branch of genitofemoral nerve', short: 'Femoral br.', kind: 'branch', roots: ['L1', 'L2'], parents: ['n-genitofemoral'],
      motor: '', sensory: 'Small area of skin over the upper femoral triangle',
      notes: 'Passes under the inguinal ligament inside the femoral sheath, lateral to the femoral artery.',
    },

    // Posterior division nerves
    'n-lfcn': {
      name: 'Lateral femoral cutaneous nerve', short: 'LFCN', kind: 'terminal', roots: ['L2', 'L3'], parents: ['div-l2-post', 'div-l3-post'],
      motor: '', sensory: 'Anterolateral and lateral thigh',
      notes: 'Leaves the lateral border of psoas and crosses iliacus deep to fascia iliaca towards the ASIS. It passes under, or through, the inguinal ligament about 1–2 cm medial to the ASIS, but its course varies. Compression there causes meralgia paraesthetica.',
    },
    'n-femoral': {
      name: 'Femoral nerve', short: 'Femoral', kind: 'terminal', roots: ['L2', 'L3', 'L4'], parents: ['div-l2-post', 'div-l3-post', 'div-l4-post'],
      motor: 'Iliacus, pectineus (usually), sartorius, quadriceps',
      sensory: 'Front and medial thigh; medial leg and foot through the saphenous nerve',
      notes: 'Leaves the lateral border of psoas and runs in the groove between psoas and iliacus, deep to fascia iliaca. It enters the thigh under the inguinal ligament, lateral to the femoral artery and outside the femoral sheath, and divides within a few centimetres.',
    },
    'n-iliacus': {
      name: 'Branches to iliacus', short: 'Iliacus', kind: 'branch', roots: ['L2', 'L3'], parents: ['n-femoral'],
      motor: 'Iliacus', sensory: '',
      notes: 'Arise from the femoral nerve in the iliac fossa, above the inguinal ligament.',
    },
    'n-fem-muscular': {
      name: 'Muscular branches of the femoral nerve', short: 'Muscular', kind: 'branch', roots: ['L2', 'L3', 'L4'], parents: ['n-femoral'],
      motor: 'Quadriceps (rectus femoris and the three vasti), sartorius', sensory: 'Twigs to the hip and knee joints',
      notes: 'Shown as a single trunk. The nerve to vastus medialis runs beside the saphenous nerve into the top of the adductor canal, so a proximal canal block can weaken the quadriceps.',
    },
    'n-fem-ant-cut': {
      name: 'Anterior cutaneous branches of the femoral nerve', short: 'Ant. cutaneous', kind: 'branch', roots: ['L2', 'L3'], parents: ['n-femoral'],
      motor: '', sensory: 'Front and medial thigh down to the knee',
      notes: 'The intermediate and medial cutaneous nerves of the thigh, shown as one branch. They pierce fascia lata in the thigh.',
    },
    'n-saphenous': {
      name: 'Saphenous nerve', short: 'Saphenous', kind: 'terminal', roots: ['L3', 'L4'], parents: ['n-femoral'],
      motor: '', sensory: 'Medial leg to the medial malleolus and medial foot',
      notes: 'The terminal sensory branch of the femoral nerve. It runs with the femoral artery through the adductor canal under sartorius and becomes superficial at the medial knee. Shown to just below the knee.',
    },
    'n-infrapatellar': {
      name: 'Infrapatellar branch of the saphenous nerve', short: 'Infrapatellar', kind: 'branch', roots: ['L3', 'L4'], parents: ['n-saphenous'],
      motor: '', sensory: 'Skin over the front of the knee and the patellar tendon',
      notes: 'Often leaves the saphenous nerve in or above the adductor canal and pierces sartorius, so an adductor canal block may miss it.',
    },

    // Anterior division nerves
    'n-obturator': {
      name: 'Obturator nerve', short: 'Obturator', kind: 'terminal', roots: ['L2', 'L3', 'L4'], parents: ['div-l2-ant', 'div-l3-ant', 'div-l4-ant'],
      motor: 'Adductors (longus, brevis, adductor part of magnus), gracilis, obturator externus',
      sensory: 'Variable patch of medial thigh (absent in many people); hip and knee joints',
      notes: 'Leaves the medial border of psoas at the pelvic brim, behind the common iliac vessels. It runs along the lateral pelvic wall to the obturator canal, where it divides into anterior and posterior branches.',
    },
    'n-obt-ant': {
      name: 'Anterior branch of the obturator nerve', short: 'Anterior br.', kind: 'branch', roots: ['L2', 'L3', 'L4'], parents: ['n-obturator'],
      motor: 'Adductor longus, adductor brevis, gracilis (sometimes pectineus)', sensory: 'Medial thigh (variable); hip joint',
      notes: 'Runs in front of obturator externus and adductor brevis, behind pectineus and adductor longus. Shown to mid-thigh.',
    },
    'n-obt-post': {
      name: 'Posterior branch of the obturator nerve', short: 'Posterior br.', kind: 'branch', roots: ['L2', 'L3', 'L4'], parents: ['n-obturator'],
      motor: 'Obturator externus, adductor magnus (adductor part), sometimes adductor brevis', sensory: 'Posterior knee joint (via the popliteal plexus)',
      notes: 'Pierces obturator externus and runs between adductor brevis and adductor magnus.',
    },
    'n-acc-obturator': {
      name: 'Accessory obturator nerve (variable)', short: 'Acc. obturator', kind: 'terminal', roots: ['L3', 'L4'], parents: ['div-l3-ant', 'div-l4-ant'],
      motor: 'Pectineus', sensory: 'Hip joint (articular branch)',
      notes: 'Present in roughly 10–30% of people. It runs along the medial border of psoas and crosses the superior pubic ramus deep to pectineus, instead of passing through the obturator canal. Path drawn for teaching.',
    },
    'n-hip-articular': {
      name: 'Articular branches to the hip (anterior capsule)', short: 'Hip (articular)', kind: 'branch', roots: ['L2', 'L3', 'L4'],
      parents: ['n-femoral', 'n-obturator', 'n-acc-obturator'],
      motor: '', sensory: 'Anterior hip capsule',
      notes: 'From the femoral nerve (between the AIIS and the iliopubic eminence), the obturator nerve (inferomedial capsule) and, when present, the accessory obturator nerve. Target of the PENG block. Paths drawn for teaching.',
    },

    // Short muscular branches from the rami
    'n-psoas': {
      name: 'Branches to psoas major', short: 'Psoas', kind: 'branch', roots: ['L1', 'L2', 'L3'], parents: ['root-l1', 'root-l2', 'root-l3'],
      motor: 'Psoas major (hip flexion)', sensory: '',
      notes: 'Short direct branches from the anterior rami inside the muscle. Most of the plexus forms within psoas, so a needle in its posterior part reaches the roots.',
    },
    'n-ql': {
      name: 'Branches to quadratus lumborum', short: 'QL', kind: 'branch', roots: ['T12', 'L1', 'L2', 'L3', 'L4'],
      parents: ['root-t12', 'root-l1', 'root-l2', 'root-l3', 'root-l4'],
      motor: 'Quadratus lumborum', sensory: '',
      notes: 'Short direct branches from the anterior rami. Quadratus lumborum lies behind and lateral to psoas; spread between the two is one route of quadratus lumborum blocks.',
    },
  },

  order: [
    'root-t12', 'root-l1', 'root-l2', 'root-l3', 'root-l4',
    'n-ql', 'n-psoas',
    'n-iliohypogastric', 'n-ilioinguinal', 'n-genitofemoral', 'n-gf-genital', 'n-gf-femoral',
    'div-l2-post', 'div-l3-post', 'div-l4-post', 'n-lfcn', 'n-femoral', 'n-iliacus', 'n-fem-muscular', 'n-fem-ant-cut', 'n-saphenous', 'n-infrapatellar',
    'n-hip-articular',
    'div-l2-ant', 'div-l3-ant', 'div-l4-ant', 'n-obturator', 'n-obt-ant', 'n-obt-post', 'n-acc-obturator',
    'trunk-ls',
  ],

  diagram: {
    viewBox: [0, -60, 1200, 920],
    columns: [
      { x0: 0, x1: 300, label: 'Anterior rami', sub: 'From the foramina' },
      { x0: 300, x1: 560, label: 'Within psoas', sub: 'Divisions' },
      { x0: 560, x1: 1200, label: 'Nerves and branches', sub: 'Leave psoas at its borders' },
    ],
    regions: [{ x: 300, y: 50, w: 260, h: 790, label: '' }],
    geom: {
      // Rami
      'root-t12': { d: ['M95 80 L230 80 C265 80 270 160 300 160'], w: 'xl', dash: true, label: { x: 20, y: 91, anchor: 'start', kind: 'root' } },
      'root-l1': { d: ['M95 160 L300 160'], w: 'xl', label: { x: 20, y: 171, anchor: 'start', kind: 'root' } },
      'root-l2': { d: ['M95 300 L300 300'], w: 'xl', label: { x: 20, y: 311, anchor: 'start', kind: 'root' } },
      'root-l3': { d: ['M95 430 L300 430'], w: 'xl', label: { x: 20, y: 441, anchor: 'start', kind: 'root' } },
      'root-l4': { d: ['M95 560 L300 560'], w: 'xl', label: { x: 20, y: 571, anchor: 'start', kind: 'root' } },
      // Muscular branches from the rami (combs across the rami they come from)
      'n-ql': { d: ['M125 560 L125 54 Q125 46 133 46'], w: 's', label: { x: 138, y: 54, anchor: 'start', kind: 'branch' } },
      'n-psoas': { d: ['M175 160 L175 470 Q175 478 183 478'], w: 's', label: { x: 188, y: 486, anchor: 'start', kind: 'branch' } },
      // L1 (± T12) branches and genitofemoral
      'n-iliohypogastric': { d: ['M300 160 C370 160 380 80 450 80 L930 80'], w: 'l', label: { x: 940, y: 86, anchor: 'start', kind: 'term' } },
      'n-ilioinguinal': { d: ['M300 160 C380 160 400 145 470 145 L930 145'], w: 'l', label: { x: 940, y: 151, anchor: 'start', kind: 'term' } },
      'n-genitofemoral': {
        d: ['M300 160 C350 160 360 220 420 220 L640 220', 'M240 300 C300 300 350 220 420 220'],
        w: 'l', label: { x: 430, y: 204, anchor: 'start', kind: 'struct', text: 'Genitofemoral (L1–L2)' },
      },
      'n-gf-genital': { d: ['M640 220 C720 220 760 212 840 212 L930 212'], w: 's', label: { x: 940, y: 220, anchor: 'start', kind: 'branch' } },
      'n-gf-femoral': { d: ['M640 220 C720 220 760 252 840 252 L930 252'], w: 's', label: { x: 940, y: 260, anchor: 'start', kind: 'branch' } },
      // Posterior divisions -> femoral and LFCN
      'div-l2-post': { d: ['M300 300 C360 300 380 390 440 390'], w: 'm' },
      'div-l3-post': { d: ['M300 430 C380 430 400 390 480 390'], w: 'm' },
      'div-l4-post': { d: ['M300 560 C400 560 440 390 520 390'], w: 'm' },
      'n-lfcn': {
        d: ['M370 345 C400 320 430 305 480 305 L930 305', 'M367 419 C395 385 420 330 446 308'],
        w: 'l', label: { x: 940, y: 311, anchor: 'start', kind: 'term' },
      },
      'n-femoral': { d: ['M440 390 L760 390'], w: 'l', label: { x: 560, y: 378, anchor: 'start', kind: 'struct', text: 'Femoral (L2–L4)' } },
      'n-iliacus': { d: ['M580 390 Q580 418 604 420'], w: 's', label: { x: 610, y: 428, anchor: 'start', kind: 'branch' } },
      'n-fem-muscular': { d: ['M760 390 C820 390 840 395 870 395 L930 395'], w: 's', label: { x: 940, y: 403, anchor: 'start', kind: 'branch' } },
      'n-fem-ant-cut': { d: ['M760 390 C820 390 840 437 870 437 L930 437'], w: 's', label: { x: 940, y: 445, anchor: 'start', kind: 'branch' } },
      'n-saphenous': { d: ['M760 390 C820 390 840 480 870 480 L930 480'], w: 'l', label: { x: 940, y: 486, anchor: 'start', kind: 'term' } },
      'n-infrapatellar': { d: ['M895 480 C915 480 912 555 930 555'], w: 's', label: { x: 940, y: 563, anchor: 'start', kind: 'branch' } },
      // Hip joint (PENG target): from femoral, obturator and accessory obturator
      'n-hip-articular': {
        d: ['M720 390 L720 593 Q720 605 732 605 L930 605', 'M832 680 L832 605', 'M815 755 L815 605'],
        w: 's', label: { x: 940, y: 613, anchor: 'start', kind: 'branch' },
      },
      // Anterior divisions -> obturator
      'div-l2-ant': { d: ['M300 300 C350 300 380 680 440 680'], w: 'm' },
      'div-l3-ant': { d: ['M300 430 C370 430 420 680 480 680'], w: 'm' },
      'div-l4-ant': { d: ['M300 560 C380 560 450 680 520 680'], w: 'm' },
      'n-obturator': { d: ['M440 680 L850 680'], w: 'l', label: { x: 530, y: 668, anchor: 'start', kind: 'struct', text: 'Obturator (L2–L4)' } },
      'n-obt-ant': { d: ['M850 680 C880 680 885 655 905 655 L930 655'], w: 's', label: { x: 940, y: 663, anchor: 'start', kind: 'branch' } },
      'n-obt-post': { d: ['M850 680 C880 680 885 700 905 700 L930 700'], w: 's', label: { x: 940, y: 708, anchor: 'start', kind: 'branch' } },
      'n-acc-obturator': {
        d: ['M414 620 C440 700 520 755 600 755 L930 755', 'M394 555 C405 590 410 610 414 620'],
        w: 'm', dash: true, label: { x: 940, y: 761, anchor: 'start', kind: 'term' },
      },
      // L4 + L5 -> lumbosacral trunk
      'trunk-ls': {
        d: ['M230 560 C280 560 280 815 340 815 L540 815', 'M95 815 L340 815'],
        w: 'xl', label: { x: 555, y: 823, anchor: 'start', kind: 'struct', text: 'Lumbosacral trunk (L4–L5)' },
      },
    },
    notes: [
      { x: 20, y: 826, text: L5_NOTE, anchor: 'start' },
      { x: 20, y: 852, text: 'Posterior divisions → femoral, LFCN. Anterior divisions → obturator. Dashed: inconstant.', anchor: 'start' },
    ],
  },

  blocks: {
    'lumbar-plexus': {
      name: 'Lumbar plexus block (psoas compartment)', short: 'Lumbar plexus',
      summary: 'Local anaesthetic goes into the posterior part of psoas major at L3–L4 or L4–L5, where the roots and divisions lie; used for hip and femoral surgery. '
        + 'A deep block with real risks: epidural or intrathecal spread, local anaesthetic toxicity, retroperitoneal haematoma (follow neuraxial anticoagulation rules) and renal puncture at higher levels.',
      landmarks: 'Ultrasound at L3–L4: transverse flank scan (shamrock view: psoas, quadratus lumborum, erector spinae around the transverse process) or paramedian sagittal scan (trident view), often with nerve stimulation (quadriceps twitch).',
      target: ['root-l2', 'root-l3', 'root-l4'],
      covers: ['div-l2-ant', 'div-l2-post', 'div-l3-ant', 'div-l3-post', 'div-l4-ant', 'div-l4-post', 'n-femoral', 'n-lfcn', 'n-obturator',
        'n-iliacus', 'n-fem-muscular', 'n-fem-ant-cut', 'n-saphenous', 'n-infrapatellar', 'n-obt-ant', 'n-obt-post', 'n-acc-obturator', 'n-hip-articular', 'n-psoas'],
      variable: ['root-l1', 'root-t12', 'n-genitofemoral', 'n-gf-genital', 'n-gf-femoral', 'n-iliohypogastric', 'n-ilioinguinal', 'trunk-ls', 'n-ql'],
      spares: [],
      band: { x0: 210, x1: 560, y0: 270, y1: 600 },
      view: { target: [-0.0440, 0.0180, 1.0080], position: [-0.2892, 0.3524, 1.0749] },
      marker: [-0.0440, 0.0180, 1.0080],
    },
    sifi: {
      name: 'Suprainguinal fascia iliaca block', short: 'Fascia iliaca (supra)',
      summary: 'Local anaesthetic goes deep to fascia iliaca on iliacus, above the inguinal ligament, and spreads up the iliac fossa to the femoral nerve and LFCN. Used for hip fracture and hip surgery.',
      landmarks: 'Sagittal probe just medial to the ASIS ("bow-tie" of sartorius and internal oblique); needle tip under fascia iliaca on iliacus.',
      target: ['n-femoral', 'n-lfcn'],
      covers: ['n-iliacus', 'n-fem-muscular', 'n-fem-ant-cut', 'n-saphenous', 'n-infrapatellar'],
      variable: ['n-obturator', 'n-obt-ant', 'n-obt-post', 'n-acc-obturator', 'n-hip-articular', 'n-genitofemoral', 'n-gf-femoral'],
      spares: ['n-iliohypogastric', 'n-ilioinguinal', 'n-gf-genital', 'trunk-ls'],
      band: { x0: 430, x1: 940, y0: 285, y1: 410 },
      view: { target: [-0.1000, -0.0362, 0.9500], position: [-0.2278, -0.3647, 1.0230] },
      marker: [-0.1000, -0.0362, 0.9500],
    },
    'fib-infra': {
      name: 'Infrainguinal fascia iliaca block', short: 'Fascia iliaca (infra)',
      summary: 'Local anaesthetic goes deep to fascia iliaca just below the inguinal ligament, at the junction of its lateral and middle thirds, and spreads under the fascia. Simple, safe analgesia for hip and femoral fractures; obturator spread is unreliable.',
      landmarks: 'Transverse probe below the inguinal ligament, lateral to the femoral nerve and artery; needle tip under fascia iliaca on iliopsoas.',
      target: ['n-femoral'],
      covers: ['n-fem-muscular', 'n-fem-ant-cut', 'n-saphenous', 'n-infrapatellar'],
      variable: ['n-lfcn', 'n-hip-articular'],
      spares: ['n-obturator', 'n-obt-ant', 'n-obt-post', 'n-acc-obturator', 'n-iliacus', 'n-gf-femoral'],
      band: { x0: 560, x1: 940, y0: 285, y1: 580 },
      view: { target: [-0.0840, -0.0396, 0.8720], position: [-0.1902, -0.3582, 0.9251] },
      marker: [-0.0840, -0.0396, 0.8720],
    },
    femoral: {
      name: 'Femoral nerve block', short: 'Femoral',
      summary: 'Local anaesthetic around the femoral nerve at the inguinal crease, lateral to the artery and deep to fascia iliaca; for hip and femoral shaft fractures and knee or anterior thigh surgery (weak quadriceps: fall risk). '
        + 'The "3-in-1" spread to the LFCN and obturator is unreliable, especially to the obturator.',
      landmarks: 'Transverse probe at the inguinal crease: nerve lateral to the femoral artery, under fascia iliaca. Twitch: quadriceps ("patellar dance").',
      target: ['n-femoral'],
      covers: ['n-fem-muscular', 'n-fem-ant-cut', 'n-saphenous', 'n-infrapatellar'],
      variable: ['n-lfcn', 'n-hip-articular'],
      spares: ['n-obturator', 'n-obt-ant', 'n-obt-post', 'n-acc-obturator', 'n-iliacus', 'n-gf-femoral'],
      band: { x0: 560, x1: 940, y0: 372, y1: 580 },
      view: { target: [-0.0666, -0.0401, 0.8696], position: [-0.1421, -0.3269, 0.9149] },
      marker: [-0.0666, -0.0401, 0.8696],
    },
    peng: {
      name: 'PENG block (pericapsular nerve group)', short: 'PENG',
      summary: 'Local anaesthetic is laid on the bone between the AIIS and the iliopubic eminence, deep to the psoas tendon, to reach the articular branches of the femoral, obturator and accessory obturator nerves. Aims for hip analgesia that spares the quadriceps, though large volumes can reach the femoral nerve.',
      landmarks: 'Transverse probe over the AIIS, then rotated about 45° to line up with the pubic ramus: AIIS, iliopubic eminence, psoas tendon, femoral artery medially.',
      target: ['n-hip-articular'],
      covers: [],
      variable: ['n-femoral', 'n-lfcn', 'n-obturator', 'n-acc-obturator'],
      spares: ['n-fem-muscular', 'n-saphenous', 'n-obt-ant', 'n-obt-post'],
      band: { x0: 700, x1: 935, y0: 560, y1: 630 },
      view: { target: [-0.0640, -0.0284, 0.8740], position: [-0.1693, -0.2991, 0.9492] },
      marker: [-0.0640, -0.0284, 0.8740],
    },
    lfcn: {
      name: 'Lateral femoral cutaneous nerve block', short: 'LFCN',
      summary: 'Local anaesthetic around the LFCN just below and medial to the ASIS, in the fat-filled tunnel between sartorius and tensor fasciae latae. Used for lateral thigh incisions and skin graft donor sites, and to add to hip fracture blocks.',
      landmarks: 'Probe just below the ASIS over sartorius; follow the nerve laterally into the flat tunnel between sartorius and tensor fasciae latae.',
      target: ['n-lfcn'],
      covers: [],
      variable: [],
      spares: ['n-femoral', 'n-gf-femoral'],
      band: { x0: 470, x1: 1200, y0: 285, y1: 350 },
      view: { target: [-0.1123, -0.0577, 0.9035], position: [-0.2612, -0.3390, 0.9366] },
      marker: [-0.1123, -0.0577, 0.9035],
    },
    obturator: {
      name: 'Obturator nerve block (proximal, interfascial)', short: 'Obturator',
      summary: 'Local anaesthetic goes into the plane between pectineus and obturator externus, just below the obturator canal, to block the nerve before it divides. Used to stop the adductor jerk during bladder tumour resection, for adductor spasm, and to add to hip or knee analgesia.',
      landmarks: 'Transverse probe at the inguinal crease, medial to the femoral vein; aim for the fascial plane between pectineus and obturator externus.',
      target: ['n-obturator'],
      covers: ['n-obt-ant', 'n-obt-post'],
      variable: ['n-hip-articular', 'n-acc-obturator'],
      spares: ['n-femoral'],
      band: { x0: 480, x1: 1200, y0: 640, y1: 725 },
      view: { target: [-0.0430, -0.0250, 0.8460], position: [0.0804, -0.2873, 0.7688] },
      marker: [-0.0430, -0.0250, 0.8460],
    },
    'adductor-canal': {
      name: 'Adductor canal block (saphenous nerve)', short: 'Adductor canal',
      summary: 'Local anaesthetic goes beside the femoral artery under sartorius in the mid-thigh, mainly blocking the saphenous nerve. Used for knee surgery as a quadriceps-sparing alternative to a femoral block.',
      landmarks: 'Transverse probe at mid-thigh: femoral artery under sartorius, deep to the vastoadductor membrane. More proximal injections are more likely to weaken the quadriceps.',
      target: ['n-saphenous'],
      covers: [],
      variable: ['n-infrapatellar', 'n-fem-muscular', 'n-obt-post'],
      spares: ['n-femoral', 'n-fem-ant-cut', 'n-lfcn', 'n-obt-ant'],
      band: { x0: 600, x1: 930, y0: 455, y1: 575 },
      view: { target: [-0.0565, -0.0325, 0.6400], position: [-0.0940, -0.3886, 0.6775] },
      marker: [-0.0565, -0.0325, 0.6400],
    },
    'ii-ih': {
      name: 'Ilio-inguinal and iliohypogastric block', short: 'Ilio-inguinal/IH',
      summary: 'Local anaesthetic goes between internal oblique and transversus abdominis just medial and superior to the ASIS, where both nerves run in this plane. Used for inguinal hernia repair, orchidopexy and groin incisions; the genital branch of the genitofemoral nerve is not blocked.',
      landmarks: 'Probe on the line from the ASIS towards the umbilicus; the nerves lie on transversus abdominis, often beside a small artery.',
      target: ['n-ilioinguinal', 'n-iliohypogastric'],
      covers: [],
      variable: [],
      spares: ['n-gf-genital', 'n-gf-femoral'],
      band: { x0: 300, x1: 1200, y0: 50, y1: 190 },
      view: { target: [-0.1140, -0.0560, 0.9660], position: [-0.2730, -0.3263, 1.0296] },
      marker: [-0.1140, -0.0560, 0.9660],
    },
  },
  blockOrder: ['lumbar-plexus', 'sifi', 'fib-infra', 'femoral', 'peng', 'lfcn', 'obturator', 'adductor-canal', 'ii-ih'],
  credits: 'Lumbar plexus: Z-Anatomy nerve curves were used for the peripheral nerves; the anterior rami, divisions, lumbosacral trunk, accessory obturator, hip articular and muscular branches were drawn from bony and muscle landmarks for teaching.',
};
