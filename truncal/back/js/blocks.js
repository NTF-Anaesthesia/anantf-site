// Back: block data (schema: ../../shared/DATA.md, "Block schema").
// Deck values (owner's teaching deck, slides 129–148) are used exactly. Gap-fill values carry a citation.
import { cite } from '../../shared/js/refs.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'deck', text: 'NTF Anaesthesia. Truncal blocks: teaching deck, slides 106–148 (internal teaching material).' },
  { id: 'forero2016', text: 'Forero M, Adhikary SD, Lopez H, Tsui C, Chin KJ. The erector spinae plane block: a novel analgesic technique in thoracic neuropathic pain. <i>Reg Anesth Pain Med</i> 2016;41(5):621–627.', url: 'https://doi.org/10.1097/AAP.0000000000000451', label: 'doi:10.1097/AAP.0000000000000451' },
  { id: 'chin2021', text: 'Chin KJ, El-Boghdadly K. Mechanisms of action of the erector spinae plane (ESP) block: a narrative review. <i>Can J Anaesth</i> 2021;68(3):387–408.', url: 'https://doi.org/10.1007/s12630-020-01875-2', label: 'doi:10.1007/s12630-020-01875-2' },
  { id: 'decassai2019', text: 'De Cassai A, Bonvicini D, Correale C, Sandei L, Tulgar S, Tonetti T. Erector spinae plane block: a systematic qualitative review. <i>Minerva Anestesiol</i> 2019;85(3):308–319.', url: 'https://doi.org/10.23736/S0375-9393.18.13341-4', label: 'doi:10.23736/S0375-9393.18.13341-4' },
  { id: 'bailey2025', text: 'Bailey JG, Barry G, Volk T. Local anesthetic dosing for fascial plane blocks to avoid systemic toxicity: a narrative review. <i>Can J Anaesth</i> 2025;72(9):1423–1447.', url: 'https://doi.org/10.1007/s12630-025-03034-x', label: 'doi:10.1007/s12630-025-03034-x' },
  { id: 'costache2017', text: 'Costache I, de Neumann L, Ramnanan CJ, Goodwin SL, Pawa A, Abdallah FW, McCartney CJL. The mid-point transverse process to pleura (MTP) block: a new end-point for thoracic paravertebral block. <i>Anaesthesia</i> 2017;72(10):1230–1236.', url: 'https://doi.org/10.1111/anae.14004', label: 'doi:10.1111/anae.14004' },
  { id: 'batra2011', text: 'Batra RK, Krishnan K, Agarwal A. Paravertebral block. <i>J Anaesthesiol Clin Pharmacol</i> 2011;27(1):5–11.', url: 'https://doi.org/10.4103/0970-9185.76608', label: 'doi:10.4103/0970-9185.76608' },
  { id: 'lonnqvist1995', text: 'Lönnqvist PA, MacKenzie J, Soni AK, Conacher ID. Paravertebral blockade: failure rate and complications. <i>Anaesthesia</i> 1995;50(9):813–815.', url: 'https://doi.org/10.1111/j.1365-2044.1995.tb06148.x', label: 'doi:10.1111/j.1365-2044.1995.tb06148.x' },
  { id: 'karmakar2001', text: 'Further reading. Karmakar MK. Thoracic paravertebral block. <i>Anesthesiology</i> 2001;95(3):771–780.', url: 'https://doi.org/10.1097/00000542-200109000-00033', label: 'doi:10.1097/00000542-200109000-00033' },
  { id: 'krediet2015', text: 'Further reading. Krediet AC, Moayeri N, van Geffen GJ, Bruhn J, Renes S, Bigeleisen PE, Groen GJ. Different approaches to ultrasound-guided thoracic paravertebral block: an illustrated review. <i>Anesthesiology</i> 2015;123(2):459–474.', url: 'https://doi.org/10.1097/ALN.0000000000000747', label: 'doi:10.1097/ALN.0000000000000747' },
  { id: 'elboghdadly2021', text: 'Further reading. El-Boghdadly K, Wolmarans M, Stengel AD, et al. Standardizing nomenclature in regional anesthesia: an ASRA-ESRA Delphi consensus study of abdominal wall, paraspinal, and chest wall blocks. <i>Reg Anesth Pain Med</i> 2021;46(7):571–580.', url: 'https://doi.org/10.1136/rapm-2020-102451', label: 'doi:10.1136/rapm-2020-102451' },
];

const D = cite('deck');
const BILATERAL_LAST = 'Keep the total dose within the maximum for the patient’s weight, especially with bilateral blocks (for example bilateral ESP or paravertebral blocks for a sternotomy or an upper abdominal incision) or when combining blocks.';

const PVB_DOSE = {
  volume: '20 ml', conc: '0.3–0.5%', drug: 'ropivacaine',
  source: `Deck slide 138.${D}`,
  note: '<strong>Check:</strong> the deck reads “0.3–5%”. We have assumed this is a typo for 0.3–0.5% and are waiting for the deck owner to confirm.',
};

const PVB_COMPLICATIONS = `<ul>
<li><strong>Pleural puncture and pneumothorax.</strong> In a prospective series of 367 adults and children (thoracic and lumbar blocks), pleural puncture occurred in 1.1% and pneumothorax in 0.5%.${cite('lonnqvist1995')} Keep the tip in view and stop above the pleura.</li>
<li><strong>Vascular puncture</strong> (3.8% in the same series):${cite('lonnqvist1995')} the intercostal vessels run in the space.${D} Aspirate before every injection.</li>
<li><strong>Hypotension</strong> (4.6%) from the unilateral sympathetic block.${cite('lonnqvist1995', 'batra2011')}</li>
<li><strong>Epidural or intrathecal spread</strong> (about 1% in a larger series), because the space is continuous medially with the epidural space through the intervertebral foramen.${cite('batra2011')} Keep the needle tip away from the foramen.</li>
<li><strong>Horner’s syndrome</strong>, from spread up to the stellate ganglion.${cite('batra2011')}</li>
<li><strong>Bilateral (contralateral) spread</strong>, through the epidural space or in front of the vertebral bodies.${cite('batra2011')} Bilateral blocks have a higher rate of vascular puncture and pneumothorax.${cite('batra2011')}</li>
<li><strong>Failed block:</strong> about 1 in 10 with the landmark technique.${cite('lonnqvist1995')}</li>
</ul>`;

export const BLOCKS = [
  // ------------------------------------------------------------------ erector spinae plane
  {
    id: 'esp',
    kicker: 'Back · Paraspinal fascial plane',
    title: 'Erector spinae plane block',
    summary: `Local anaesthetic deep to erector spinae, on the transverse process. It spreads up and down the plane over several levels, so one injection covers a band of the hemithorax.${cite('forero2016', 'chin2021')} Easy to see on ultrasound and far from the pleura and the neuraxis, but the block <strong>typically isn’t very dense</strong>.${D}`,
    indications: ['Thoracotomy and VATS (deck: VATS decortication, thoracotomy)', 'Rib fractures', 'Breast and chest wall surgery', 'Bilateral for midline incisions (watch the total dose)'],
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, parasagittal, about 3 cm lateral to the midline',
      needle: '80 mm echogenic, in-plane, cranial to caudal or caudal to cranial',
      dose: '30 ml of dilute 0.3% ropivacaine',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting.' + D + '</p>',
    equipment: [
      'High-frequency linear probe',
      '80 mm echogenic needle',
      '30 ml of dilute 0.3% ropivacaine',
      'Sterile probe cover, skin preparation, monitoring and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Count the ribs</strong>, by landmarks (C7 vertebra prominens; the inferior angle of the scapula is T7) or by ultrasound from the first rib.${D} See <a href="#anat-count">counting levels</a>.</p><p>Probe <strong>parasagittal</strong>. Start over the spinous processes and slide laterally past the laminae until the <strong>transverse process</strong> appears: it has <strong>squared-off borders</strong>, with a flat black shadow under it.${D} Further laterally the ribs are rounder and deeper, with pleura between them: if you see that, slide back medially.</p>`,
    approach: `<p><strong>In-plane, cranial to caudal or caudal to cranial.</strong>${D} Aim for the <strong>T5 transverse process</strong> for thoracic surgery.${D}</p>`,
    sonoanatomy: `<p>Labels to know: <strong>trapezius</strong>, <strong>rhomboid major</strong> (upper thoracic levels), <strong>erector spinae</strong>, the <strong>T4, T5 and T6 transverse processes</strong>, the <strong>intertransverse tissue complex</strong>, and the <strong>ESP plane</strong>.${D}</p>`,
    target: `<p><strong>Advance to contact the transverse process, lift the erector spinae and hydrodissect.</strong>${D} The fluid should separate erector spinae from the bone and run up and down the plane over the next transverse processes.</p>`,
    dose: { volume: '30 ml', conc: 'dilute 0.3%', drug: 'ropivacaine', source: `Deck slide 130.${D}` },
    last: BILATERAL_LAST,
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T3', 'T8'], zones: ['posterior'], density: 'moderate' },
        { levels: ['T3', 'T8'], zones: ['anterolateral'], density: 'patchy' },
      ],
      summary: 'A band of the hemithorax around the injection level: more reliable at the back, variable at the side and front. The map shows a T5 injection and is illustrative: spread varies between patients.',
      mechanism: `<p>The local anaesthetic acts by physical spread in the plane deep to erector spinae. It reaches the <strong>dorsal rami consistently</strong>; spread to the <strong>ventral rami</strong> and into the <strong>paravertebral space is variable</strong>, and epidural spread is less common.${cite('chin2021')} A systemic effect of absorbed local anaesthetic is possible but probably not a major contributor.${cite('chin2021')}</p>`,
      density: `<p>ESP <strong>typically isn’t very dense</strong>.${D} Expect good analgesia at the back and a patchier, less predictable block at the side and front, because ventral ramus spread varies. Test the block and plan multimodal and rescue analgesia. For a denser block, consider a paravertebral block or the MTP variant.${D}</p>`,
      misses: '<p>The anterior chest wall can be spared, and visceral pain is not reliably covered. For a midline wound, both sides need blocking.</p>',
    },
    complications: `<ul><li><strong>Rare.</strong> A systematic review found only two reports of complications caused by the block.${cite('decassai2019')} The target is a bony backstop, away from the pleura and the neuraxis.</li><li><strong>Local anaesthetic systemic toxicity with high volumes.</strong> Fascial plane blocks use large volumes, and some patients reach plasma concentrations above toxic thresholds; seizures have been reported. Use weight-based doses, aspirate, inject in increments and watch the spread.${cite('bailey2025')}</li><li>Keep the needle tip on bone: between the transverse processes the pleura is only a little deeper.</li></ul>`,
    pearls: [
      'Squared-off with a flat shadow = transverse process. Round and deeper with pleura between = rib: you are too lateral.',
      'Touch bone before you inject: it is your backstop and tells you the depth of the plane.',
      'If erector spinae swells instead of lifting, you are intramuscular. Move back onto bone.',
      'A catheter in the plane can extend the block after a single shot wears off.',
    ],
    sections: [
      {
        id: 'mtp', title: 'Variant: mid-point transverse process to pleura (MTP) block',
        html: `<p>The deck gives the <strong>MTP block</strong> as the alternative when ESP is not dense enough.${D} It uses the same parasagittal view, but the needle tip stops <strong>halfway between the posterior border of the transverse process and the pleura</strong>, just beside the transverse process, without going through the superior costotransverse ligament.${cite('costache2017')}</p><p>In cadavers, dye injected at this point consistently reached the paravertebral space at the level of injection and often the adjacent levels.${cite('costache2017')} It sits between ESP and a classic paravertebral block: closer to the pleura than ESP, so take the same care with the needle tip as for a paravertebral block.</p><p><a href="#esp-inj-mtp">See the MTP needle path in the scan viewer</a>. The deck gives no MTP dose: use your department’s paravertebral dose.</p>`,
      },
    ],
    exam: [
      {
        source: 'MMed OSCE 2025 (deck slide 135)',
        q: '<p>A patient is having a <strong>right thoracotomy</strong>. Obtain the image for an erector spinae plane block and describe your approach. What other analgesic blocks could you use, and what are the pros of ESP compared with them?</p>',
        points: [
          'Lateral (right side up) or sitting; linear probe; 80 mm echogenic needle; 30 ml of dilute 0.3% ropivacaine.',
          'Count to T5 (vertebra prominens C7; inferior angle of the scapula T7; or count ribs from the first rib on ultrasound).',
          'Probe parasagittal about 3 cm lateral; identify the squared-off transverse processes; trapezius, rhomboid major and erector spinae above.',
          'In-plane, cranial to caudal or caudal to cranial; contact the T5 transverse process; lift erector spinae and hydrodissect; watch cranio-caudal spread.',
          'Other blocks: thoracic paravertebral, serratus anterior plane, thoracic epidural, intercostal blocks.',
          'Pros of ESP: easy sonoanatomy with a bony backstop; far from the pleura and the neuraxis; lower bleeding risk in patients on anticoagulants (superficial, compressible site; follow your local guidance); a catheter can be placed.',
          'Cons: typically not very dense; variable anterior spread.',
        ],
      },
      {
        source: 'Deck slide 129',
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
    sources: `Deck slides 129–136.${D} Mechanism: Chin and El-Boghdadly 2021.${cite('chin2021')} Complications: De Cassai et al. 2019; Bailey et al. 2025.${cite('decassai2019', 'bailey2025')} MTP: Costache et al. 2017.${cite('costache2017')}`,
  },

  // ------------------------------------------------------------------ paravertebral, parasagittal in-plane
  {
    id: 'pvb',
    kicker: 'Back · Thoracic paravertebral',
    title: 'Thoracic paravertebral block: sagittal in-plane',
    summary: `Local anaesthetic in the paravertebral space, under the superior costotransverse ligament (SCTL). It blocks the spinal nerves and the sympathetic chain on one side, so it gives a dense, one-sided somatic and sympathetic block.${cite('batra2011')}`,
    indications: ['Thoracotomy and VATS', 'Rib fractures (level of the fracture)', 'Mastectomy and breast surgery', 'Bilateral for midline incisions (sternotomy, hepatectomy): see the <a href="#ch-levels">level table</a>'],
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, parasagittal, tilted laterally to the costotransverse junction',
      needle: '80 mm echogenic, in-plane, caudal to cranial',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting.' + D + '</p>',
    equipment: [
      'High-frequency linear probe',
      '80 mm echogenic needle',
      '20 ml of 0.3–0.5% ropivacaine (see the note in the dose box)',
      'Sterile probe cover, skin preparation, monitoring and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Count the ribs</strong> (<a href="#anat-count">counting levels</a>). Probe <strong>parasagittal</strong>; identify the <strong>transverse process</strong>. Then <strong>tilt laterally</strong> towards the costotransverse joint, where the transverse process (square, shallower) and the rib (rounder, deeper) both show, with the <strong>SCTL</strong> between them.${D}</p>`,
    approach: `<p><strong>In-plane, caudal to cranial</strong>, because of the way the SCTL slopes.${D} Advance under the transverse process towards the SCTL.</p><p>Two other approaches on this page: <a href="#ch-pvbt">transverse in-plane</a> and the <a href="#ch-pvblm">landmark technique</a>.</p>`,
    sonoanatomy: `<p>Labels to know: <strong>trapezius</strong>, <strong>erector spinae</strong>, the <strong>transverse process</strong>, the <strong>SCTL</strong> and the <strong>pleura</strong>.${D}</p>`,
    target: `<p><strong>Feel the pop</strong> through the SCTL and <strong>deposit below it</strong>. The <strong>pleura should be pushed down</strong>.${D} If the pleura does not move, the tip is probably still above the ligament.</p>`,
    dose: PVB_DOSE,
    last: BILATERAL_LAST,
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T4', 'T7'], zones: ['all'], density: 'dense' },
        { levels: ['T3'], zones: ['all'], density: 'moderate' },
        { levels: ['T8'], zones: ['all'], density: 'moderate' },
      ],
      summary: 'One side of the chest wall, front and back, over several levels around the injection. The map shows a single shot at T5 and is illustrative. For thoracotomy or VATS the deck’s target is T2–T9.',
      mechanism: `<p>The space contains the spinal nerve as it divides into dorsal and ventral rami, and the sympathetic chain with its rami communicantes. Local anaesthetic here gives unilateral sensory, motor and sympathetic block.${cite('batra2011')} The space communicates with the levels above and below, laterally with the intercostal space and medially with the epidural space.${cite('batra2011')}</p>`,
      density: `<p>Dense and one-sided when the injection is under the SCTL. Spread between levels varies, so for a long incision use more than one level or a catheter (see the <a href="#ch-levels">level table</a>).${D} The sympathetic block can cause hypotension.</p>`,
      misses: '<p>The other side (block both sides for a midline incision). Spread to distant levels is unpredictable from a single injection.</p>',
    },
    complications: PVB_COMPLICATIONS,
    pearls: [
      'Tilt until you see both the square transverse process and the round rib: the SCTL runs between them.',
      'Pleura pushed down = correct. Fluid above the SCTL lifting muscle = too shallow (an ESP-like injection).',
      'Caudal to cranial crosses the sloping SCTL more steeply, so the pop is easier to feel.',
    ],
    exam: [
      {
        source: 'MMed OSCE 2020 (deck slide 146)',
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
    ],
    sources: `Deck slides 138–147.${D} Anatomy and complications: Batra et al. 2011; Lönnqvist et al. 1995.${cite('batra2011', 'lonnqvist1995')}`,
  },

  // ------------------------------------------------------------------ paravertebral, transverse in-plane
  {
    id: 'pvbt',
    kicker: 'Back · Thoracic paravertebral',
    title: 'Thoracic paravertebral block: transverse in-plane',
    summary: `The same space seen in cross-section. Here the posterior wall of the space is the <strong>internal intercostal membrane (IIM)</strong>, which is continuous with the SCTL; deposit below it.${D}`,
    glance: {
      position: 'Lateral or sitting',
      probe: 'Linear, transverse, just caudal to the transverse process',
      needle: 'In-plane (shown lateral to medial)',
    },
    position: '<p>Lateral (side to be blocked uppermost) or sitting, as for the sagittal approach.</p>',
    equipment: ['High-frequency linear probe', '80 mm echogenic needle', '20 ml of 0.3–0.5% ropivacaine (see the note in the dose box)'],
    landmarks: '<p>Count the level. Probe <strong>transverse</strong> over the transverse process, then slide slightly caudally into the intercostal space, so that the tip of the transverse process is medial and the intercostal muscles lateral.</p>',
    approach: '<p>In-plane. The scan viewer shows the common lateral-to-medial path, towards the tip of the transverse process. A medially directed needle points towards the intervertebral foramen: keep the tip in view and do not advance past the tip of the transverse process.</p>',
    sonoanatomy: `<p>Labels to know: <strong>transverse process</strong>, <strong>internal intercostal membrane (IIM)</strong>, <strong>pleura</strong>, <strong>external intercostal muscle</strong>, <strong>erector spinae</strong>, <strong>trapezius</strong> and the <strong>paravertebral space</strong>.${D}</p>`,
    target: `<p><strong>Deposit below the IIM</strong>, which is continuous with the SCTL.${D} The pleura is pushed down and the fluid spreads medially into the wedge of the paravertebral space.</p>`,
    dose: PVB_DOSE,
    last: BILATERAL_LAST,
    complications: `<p>As for the <a href="#pvb-complications">sagittal approach</a>: pleural puncture and pneumothorax, vascular puncture, hypotension, epidural or intrathecal spread, Horner’s syndrome and bilateral spread.${cite('lonnqvist1995', 'batra2011')}</p>`,
    sources: `Deck slide 143.${D}`,
  },
].map((b) => ({ ...b, scene: SCENES[b.id] }));
