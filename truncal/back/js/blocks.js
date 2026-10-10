// Back: block data (schema: ../../shared/DATA.md, "Block schema").
import { SCENES } from './scenes.js';

const BILATERAL_LAST = 'Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks (for example bilateral ESP or paravertebral blocks for a sternotomy or an upper abdominal incision) or when combining blocks.';

const PVB_DOSE = {
  volume: '20 ml', conc: '0.3–0.5%', drug: 'ropivacaine',
};

const PVB_COMPLICATIONS = `<ul>
<li><strong>Pleural puncture and pneumothorax.</strong> In a prospective series of 367 adults and children (thoracic and lumbar blocks), pleural puncture occurred in 1.1% and pneumothorax in 0.5%. Keep the tip in view and stop above the pleura.</li>
<li><strong>Vascular puncture</strong> (3.8% in the same series): the intercostal vessels run in the space. Aspirate before every injection.</li>
<li><strong>Hypotension</strong> (4.6%) from the unilateral sympathetic block.</li>
<li><strong>Epidural or intrathecal spread</strong> (about 1% in a larger series), because the space is continuous medially with the epidural space through the intervertebral foramen. Keep the needle tip away from the foramen.</li>
<li><strong>Horner’s syndrome</strong>, from spread up to the stellate ganglion.</li>
<li><strong>Bilateral (contralateral) spread</strong>, through the epidural space or in front of the vertebral bodies. Bilateral blocks have a higher rate of vascular puncture and pneumothorax.</li>
<li><strong>Local anaesthetic systemic toxicity:</strong> absorption from the paravertebral and intercostal spaces is fast, faster than from the epidural space. Aspirate, inject in increments and keep within the maximum dose.</li>
<li><strong>Failed block:</strong> about 1 in 10 with the landmark technique.</li>
</ul>`;

export const BLOCKS = [
  // ------------------------------------------------------------------ erector spinae plane
  {
    id: 'esp',
    kicker: 'Back · Paraspinal fascial plane',
    title: 'Erector spinae plane block',
    summary: `Local anaesthetic deep to erector spinae, on the transverse process. It spreads up and down the plane over several levels, so one injection covers a band of the hemithorax. Easy to see on ultrasound and far from the pleura and the neuraxis, but the block <strong>typically isn’t very dense</strong>.`,
    indications: ['Thoracotomy and VATS, including VATS decortication', 'Rib fractures', 'Breast and chest wall surgery', 'Bilateral for midline incisions (watch the total dose)'],
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, parasagittal, about 2–3 cm lateral to the midline',
      needle: '80 mm echogenic, in-plane, cranial to caudal or caudal to cranial',
      dose: '30 ml of dilute 0.3% ropivacaine',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting.</p>',
    equipment: [
      'High-frequency linear probe',
      '80 mm echogenic needle',
      '30 ml of dilute 0.3% ropivacaine',
      'Sterile probe cover, skin preparation, monitoring and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Count the ribs</strong>, by landmarks (C7 vertebra prominens; the inferior angle of the scapula is T7) or by ultrasound from the first rib. See <a href="#anat-count">counting levels</a>.</p><p>Probe <strong>parasagittal</strong>. Start over the spinous processes and slide laterally, about 2–3 cm, until the <strong>transverse process</strong> appears: it has <strong>squared-off borders</strong>, with a flat black shadow under it.</p><p>Sliding out from the midline you pass, in order:</p><ul><li><strong>Laminae</strong>: flat, overlapping bright lines (“horse heads”). Too medial: slide laterally.</li><li><strong>Articular (facet) processes</strong>: rounded humps (“camel humps”).</li><li><strong>Transverse processes</strong>: square, with a flat shadow. This is the ESP view.</li><li><strong>Ribs</strong>: rounder and deeper, with the bright pleural line between them. Too lateral: slide back medially.</li></ul>`,
    approach: `<p><strong>In-plane, cranial to caudal or caudal to cranial.</strong> Aim for the <strong>T5 transverse process</strong> for thoracic surgery.</p>`,
    sonoanatomy: `<p>Labels to know: <strong>trapezius</strong>, <strong>rhomboid major</strong> (upper thoracic levels), <strong>erector spinae</strong>, the <strong>T4, T5 and T6 transverse processes</strong>, the <strong>intertransverse tissue complex</strong>, and the <strong>ESP plane</strong>.</p><p>At about T5 and above you see <strong>three muscle layers</strong> over the transverse processes (trapezius, rhomboid major, erector spinae); in the mid and lower thoracic spine, only <strong>two</strong> (trapezius and erector spinae).</p><p>Erector spinae is three columns, lateral to medial <strong>iliocostalis, longissimus and spinalis</strong> (“I Like Standing”). It lies between the spinous processes and the angles of the ribs and is supplied by the dorsal rami.</p>`,
    target: `<p><strong>Advance to contact the transverse process, lift the erector spinae and hydrodissect.</strong> Inject 1–3 ml first to confirm the plane: the fluid should lie deep to erector spinae and on the transverse process, then run up and down the plane over the next transverse processes. Then give the rest.</p>`,
    dose: { volume: '30 ml', conc: 'dilute 0.3%', drug: 'ropivacaine' },
    last: BILATERAL_LAST,
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T3', 'T8'], zones: ['posterior'], density: 'moderate' },
        { levels: ['T3', 'T8'], zones: ['anterolateral'], density: 'patchy' },
      ],
      summary: 'A band of the hemithorax around the injection level: more reliable at the back, variable at the side and front. The map shows a T5 injection and is illustrative: spread varies between patients.',
      mechanism: `<p>The local anaesthetic acts by physical spread in the plane deep to erector spinae. It reaches the <strong>dorsal rami consistently</strong>; spread to the <strong>ventral rami</strong> and into the <strong>paravertebral space is variable</strong>, and epidural spread is less common. A systemic effect of absorbed local anaesthetic is possible but probably not a major contributor.</p>`,
      density: `<p>ESP <strong>typically isn’t very dense</strong>. Expect good analgesia at the back and a patchier, less predictable block at the side and front, because ventral ramus spread varies. Test the block and plan multimodal and rescue analgesia. For a denser block, consider a paravertebral block or the MTP variant.</p>`,
      misses: '<p>The anterior chest wall can be spared, and visceral pain is not reliably covered. For a midline wound, both sides need blocking.</p>',
    },
    complications: `<ul><li><strong>Rare.</strong> A systematic review found only two reports of complications caused by the block. The target is a bony backstop, away from the pleura and the neuraxis.</li><li><strong>Local anaesthetic systemic toxicity with high volumes.</strong> Fascial plane blocks use large volumes, and some patients reach plasma concentrations above toxic thresholds; seizures have been reported. Use weight-based doses, aspirate, inject in increments and watch the spread.</li><li>Keep the needle tip on bone: between the transverse processes the pleura is only a little deeper.</li></ul>`,
    pearls: [
      'Squared-off with a flat shadow = transverse process. Round with pleura between = rib: you are too lateral.',
      'Touch bone before you inject: it is your backstop and tells you the depth of the plane.',
      'If erector spinae swells instead of lifting, you are intramuscular. Move back onto bone.',
      'A catheter in the plane can extend the block after a single shot wears off.',
    ],
    sections: [
      {
        id: 'mtp', title: 'Variant: mid-point transverse process to pleura (MTP) block',
        html: `<p>The <strong>MTP block</strong> is the alternative when ESP is not dense enough. It uses the same parasagittal view, but the needle tip stops <strong>halfway between the posterior border of the transverse process and the pleura</strong>, just beside the transverse process, without going through the superior costotransverse ligament.</p><p>In cadavers, dye injected at this point consistently reached the paravertebral space at the level of injection and often the adjacent levels. It sits between ESP and a classic paravertebral block: closer to the pleura than ESP, so take the same care with the needle tip as for a paravertebral block.</p><p>Because the local anaesthetic is placed just behind the SCTL and reaches the paravertebral space, MTP may also block the sympathetic chain, which the other “paravertebral by proxy” blocks do less reliably. MTP and its successors are grouped under the umbrella term <strong>intertransverse process (ITP) block</strong>.</p><p><a href="#esp-inj-mtp">See the MTP needle path in the scan viewer</a>. For the dose, use your department’s paravertebral dose.</p>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2025',
        q: '<p>A patient is having a <strong>right thoracotomy</strong>. Obtain the image for an erector spinae plane block and describe your approach. What other analgesic blocks could you use, and what are the pros of ESP compared with them?</p>',
        points: [
          'Lateral (right side up) or sitting; linear probe; 80 mm echogenic needle; 30 ml of dilute 0.3% ropivacaine.',
          'Count to T5 (vertebra prominens C7; inferior angle of the scapula T7; or count ribs from the first rib on ultrasound).',
          'Probe parasagittal about 3 cm lateral; identify the squared-off transverse processes; trapezius, rhomboid major and erector spinae above.',
          'In-plane, cranial to caudal or caudal to cranial; contact the T5 transverse process; lift erector spinae and hydrodissect; watch cranio-caudal spread.',
          `Other blocks: thoracic paravertebral, serratus anterior plane, thoracic epidural, intercostal blocks (often by the surgeon). For VATS, the PROSPECT guideline recommends a paravertebral or ESP block as first choice and serratus anterior as second choice; it does not recommend thoracic epidural. See <a href="#ch-related">related blocks</a>.`,
          `Pros of ESP: easy sonoanatomy with a bony backstop; far from the pleura and the neuraxis; lower risk of complications in a patient on anticoagulants than paravertebral or epidural (the target is a bony backstop away from major vessels and the neuraxis; follow local guidance); a catheter can be placed.`,
          'Cons: typically not very dense; variable anterior spread.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>Ultrasound-guided erector spinae plane block for a <strong>left VATS decortication</strong>. Talk through your preparation, scanning, needle approach and how you know the injection is correct.</p>',
        points: [
          'Consent, monitoring, IV access, resuscitation and lipid emulsion available; time out (left side).',
          'Lateral (left side up) or sitting; aim for T5.',
          'Parasagittal view, transverse processes with squared-off borders; in-plane to bone.',
          'Correct: erector spinae lifts off the transverse process and the fluid spreads cranially and caudally.',
          'Alternatives as above; a paravertebral or MTP block for a denser block.',
          'Try it: in the scan viewer, turn the labels off and name each structure.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ paravertebral, parasagittal in-plane
  {
    id: 'pvb',
    kicker: 'Back · Thoracic paravertebral',
    title: 'Thoracic paravertebral block: sagittal in-plane',
    summary: `Local anaesthetic in the paravertebral space, under the superior costotransverse ligament (SCTL). It blocks the spinal nerves and the sympathetic chain on one side, so it gives a dense, one-sided somatic and sympathetic block.`,
    indications: ['Thoracotomy and VATS', 'Rib fractures (level of the fracture)', 'Mastectomy and breast surgery', 'Bilateral for midline incisions (sternotomy, hepatectomy): see the <a href="#ch-levels">level table</a>'],
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, parasagittal, tilted laterally to the costotransverse junction',
      needle: '80 mm echogenic, in-plane, caudal to cranial',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting.</p>',
    equipment: [
      'High-frequency linear probe',
      '80 mm echogenic needle',
      '20 ml of 0.3–0.5% ropivacaine (see the note in the dose box)',
      'Sterile probe cover, skin preparation, monitoring and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Count the ribs</strong> (<a href="#anat-count">counting levels</a>). Probe <strong>parasagittal</strong>; identify the <strong>transverse process</strong>. Then <strong>tilt laterally</strong> towards the costotransverse joint, where the transverse process (square, shallower) and the rib (rounder, deeper) both show, with the <strong>SCTL</strong> between them.</p><p>Another way in: start <strong>5–10 cm lateral</strong>, where the round ribs and the pleura are easy to see, then slide medially until the square transverse processes appear, usually <strong>2–3 cm from the midline</strong>. If you see flat laminae, you have gone too far medially. You need both the pleura and the SCTL in view.</p>`,
    approach: `<p><strong>In-plane, caudal to cranial</strong>, because of the way the SCTL slopes. Advance under the transverse process towards the SCTL.</p><p><strong>Out-of-plane alternative:</strong> from the same view, contact the transverse process out-of-plane, then walk off it and advance <strong>1–1.5 cm deeper</strong>. You may not see the tip, but the pleura should be pushed down as you inject. The needle is not aimed at the neuraxis, and it mirrors the landmark technique.</p><p>Two other approaches on this page: <a href="#ch-pvbt">transverse in-plane</a> and the <a href="#ch-pvblm">landmark technique</a>.</p>`,
    sonoanatomy: `<p>Labels to know: <strong>trapezius</strong>, <strong>erector spinae</strong>, the <strong>transverse process</strong>, the <strong>SCTL</strong> and the <strong>pleura</strong>.</p>`,
    target: `<p><strong>Feel the pop</strong> through the SCTL and <strong>deposit below it</strong>. The <strong>pleura should be pushed down</strong>. If the pleura does not move, the tip is probably still above the ligament.</p>`,
    dose: PVB_DOSE,
    last: BILATERAL_LAST,
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T4', 'T7'], zones: ['all'], density: 'dense' },
        { levels: ['T3'], zones: ['all'], density: 'moderate' },
        { levels: ['T8'], zones: ['all'], density: 'moderate' },
      ],
      summary: 'One side of the chest wall, front and back, over several levels around the injection. The map shows a single shot at T5 and is illustrative. For thoracotomy or VATS the target is T2–T9.',
      mechanism: `<p>The space contains the spinal nerve as it divides into dorsal and ventral rami, and the sympathetic chain with its rami communicantes. Local anaesthetic here gives unilateral sensory, motor and sympathetic block. The space communicates with the levels above and below, laterally with the intercostal space and medially with the epidural space.</p>`,
      density: `<p>Dense and one-sided when the injection is under the SCTL. A single injection usually blocks <strong>4–6 dermatomes</strong>. Spread between levels varies, so for a long incision use more than one level or a catheter (see the <a href="#ch-levels">level table</a>). The sympathetic block can cause hypotension.</p>`,
      misses: '<p>The other side (block both sides for a midline incision). Spread to distant levels is unpredictable from a single injection.</p>',
    },
    complications: PVB_COMPLICATIONS,
    pearls: [
      'Tilt until you see both the square transverse process and the round rib: the SCTL runs between them.',
      'Pleura pushed down = correct. Fluid above the SCTL lifting muscle = too shallow (an ESP-like injection).',
      'Caudal to cranial crosses the sloping SCTL more steeply, so the pop is easier to feel.',
      `A paravertebral catheter is an option for rib fractures: one-sided, with less hypotension and urinary retention than a thoracic epidural.`,
    ],
    sections: [
      {
        id: 'ci', title: 'Contraindications and cautions',
        html: `<ul><li><strong>As for any block:</strong> patient refusal, infection at the site, allergy to local anaesthetic.</li><li><strong>Specific:</strong> tumour in the paravertebral space, empyema.</li><li><strong>Caution:</strong> previous thoracotomy (scarring) and chest wall deformity, including kyphoscoliosis.</li><li><strong>Anticoagulants:</strong> a paravertebral block is a deep, non-compressible block, so follow the neuraxial timings for stopping and restarting anticoagulants (ASRA guidance). The same timings apply to removing a catheter.</li><li><strong>Positioning:</strong> a trauma patient on spinal precautions may not be able to sit or turn for a back block; plan an alternative.</li></ul>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2020',
        q: '<p>On this paravertebral ultrasound image, point out the <strong>transverse process, pleura, SCTL, trapezius and erector spinae</strong>. How would you find T7 by surface landmarks?</p>',
        points: [
          'Transverse process: square, bright, with a flat black shadow.',
          'Pleura: bright sliding line deep to the SCTL, with lung artefact below.',
          'SCTL: the bright band sloping from the transverse process to the rib below; the paravertebral space is under it.',
          'Trapezius superficially, then erector spinae.',
          'Landmarks: the tip (inferior angle) of the scapula is at T7; C7 is the vertebra prominens.',
          'Try it: in the scan viewer, turn the labels off and point each one out.',
        ],
      },
      {
        source: 'Practice question',
        q: '<p>A woman is having a paravertebral block for a <strong>radical mastectomy</strong>. List the advantages of the block and its complications.</p>',
        points: [
          'Advantages: one injection spreads up and down the space, into the intercostal spaces and along the spinal nerves, so several dermatomes are blocked.',
          'Dense somatic and sympathetic block on one side; analgesia comparable to an epidural, with less hypotension because the other side is spared.',
          'May reduce chronic post-surgical pain after breast and thoracic surgery.',
          'Complications: failure (about 1 in 10), pleural puncture and pneumothorax, vascular puncture and haematoma, hypotension, epidural or intrathecal spread, Horner’s syndrome, nerve injury, local anaesthetic systemic toxicity.',
          'Contraindications: as in the section above.',
        ],
      },
    ],
  },

  // ------------------------------------------------------------------ paravertebral, transverse in-plane
  {
    id: 'pvbt',
    kicker: 'Back · Thoracic paravertebral',
    title: 'Thoracic paravertebral block: transverse in-plane',
    summary: `The same space seen in cross-section. Here the posterior wall of the space is the <strong>internal intercostal membrane (IIM)</strong>, which is continuous with the SCTL; deposit below it.`,
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, transverse, just caudal to the transverse process',
      needle: 'In-plane, lateral to medial',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting, as for the sagittal approach.</p>',
    equipment: ['High-frequency linear probe', '80 mm echogenic needle', '20 ml of 0.3–0.5% ropivacaine (see the note in the dose box)'],
    landmarks: `<p>Count the level. Set the depth to about 3 cm to start. Probe <strong>transverse</strong> over the transverse process and rib, then slide slightly caudally into the intercostal space, so that the tip of the transverse process is medial and the intercostal muscles lateral.</p><p>The paravertebral space is a <strong>hypoechoic wedge</strong> between the internal intercostal membrane above and the bright pleura below, which moves with breathing.</p>`,
    approach: `<p><strong>In-plane, lateral to medial</strong>, from the lateral end of the probe towards the tip of the transverse process. A medially directed needle points towards the intervertebral foramen: keep the tip in view and do not advance past the tip of the transverse process.</p>`,
    sonoanatomy: `<p>Labels to know: <strong>transverse process</strong>, <strong>internal intercostal membrane (IIM)</strong>, <strong>pleura</strong>, <strong>external intercostal muscle</strong>, <strong>erector spinae</strong>, <strong>trapezius</strong> and the <strong>paravertebral space</strong>.</p>`,
    target: `<p><strong>Deposit below the IIM</strong>, which is continuous with the SCTL. The pleura is pushed down and the fluid spreads medially into the wedge of the paravertebral space.</p>`,
    dose: PVB_DOSE,
    last: BILATERAL_LAST,
    complications: `<p>As for the <a href="#pvb-complications">sagittal approach</a>: pleural puncture and pneumothorax, vascular puncture, hypotension, epidural or intrathecal spread, Horner’s syndrome and bilateral spread.</p>`,
  },
].map((b) => ({ ...b, scene: SCENES[b.id] }));
