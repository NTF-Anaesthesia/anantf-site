// Abdominal wall: block data (schema: ../../shared/DATA.md, "Block schema").
// Deck values (owner's teaching deck, slides 107–116 and 127) are used exactly. Gap-fill values carry a citation.
import { cite } from '../../shared/js/refs.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'deck', text: 'NTF Anaesthesia. Truncal blocks: teaching deck, slides 106–148 (internal teaching material).' },
  { id: 'tsai2017', text: 'Tsai HC, Yoshida T, Chuang TY, Yang SF, Chang CC, Yao HY, Tai YT, Lin JA, Chen KY. Transversus abdominis plane block: an updated review of anatomy and techniques. <i>Biomed Res Int</i> 2017;2017:8284363.', url: 'https://doi.org/10.1155/2017/8284363', label: 'doi:10.1155/2017/8284363' },
  { id: 'hebbard2008', text: 'Hebbard P. Subcostal transversus abdominis plane block under ultrasound guidance. <i>Anesth Analg</i> 2008;106(2):674–675.', url: 'https://doi.org/10.1213/ane.0b013e318161a88f', label: 'doi:10.1213/ane.0b013e318161a88f' },
  { id: 'hebbard2010', text: 'Hebbard PD, Barrington MJ, Vasey C. Ultrasound-guided continuous oblique subcostal transversus abdominis plane blockade: description of anatomy and clinical technique. <i>Reg Anesth Pain Med</i> 2010;35(5):436–441.', url: 'https://doi.org/10.1097/AAP.0b013e3181e66702', label: 'doi:10.1097/AAP.0b013e3181e66702' },
  { id: 'fernandez2025', text: 'Fernandez Martin MT, Mariano ER, Valdes-Vilches LF, Lopez Alvarez S, Elkassabany N. Analgesia for upper abdominal surgery, a scoping review of the current fascial plane block techniques. <i>J Clin Med</i> 2025;14(24):8632.', url: 'https://doi.org/10.3390/jcm14248632', label: 'doi:10.3390/jcm14248632' },
  { id: 'dolan2009', text: 'Dolan J, Smith M. Visualization of bowel adherent to the peritoneum before rectus sheath block: another indication for the use of ultrasound in regional anesthesia. <i>Reg Anesth Pain Med</i> 2009;34(3):280–281.', url: 'https://doi.org/10.1097/AAP.0b013e31819a4f84', label: 'doi:10.1097/AAP.0b013e31819a4f84' },
  { id: 'elsharkawy2019', text: 'Elsharkawy H, El-Boghdadly K, Barrington M. Quadratus lumborum block: anatomical concepts, mechanisms, and techniques. <i>Anesthesiology</i> 2019;130(2):322–335.', url: 'https://doi.org/10.1097/ALN.0000000000002524', label: 'doi:10.1097/ALN.0000000000002524' },
  { id: 'sonawane2026', text: 'Sonawane K, Mistry T. Decoding quadratus lumborum blocks: fascial pathways and analgesic coverage. A narrative review. <i>Indian J Anaesth</i> 2026;70(1):205–220.', url: 'https://doi.org/10.4103/ija.ija_1270_25', label: 'doi:10.4103/ija.ija_1270_25' },
  { id: 'dost2026', text: 'Dost B, Kaya C, Turunc E, Karapinar YE, Narayanan M, Koneti K. Anterior quadratus lumborum block: a scoping review of anatomical rationale, techniques, and clinical applications. <i>Pain Ther</i> 2026;15(4):983–999.', url: 'https://doi.org/10.1007/s40122-026-00846-7', label: 'doi:10.1007/s40122-026-00846-7' },
  { id: 'rytel2025', text: 'Rytel H, Rashid B, Kaczmarski P, Kaczmarski M, Cheyne I, Mikaszewska-Sokolewicz M. Quadratus lumborum block: the new gold standard in abdominal analgesia? <i>Cureus</i> 2025;17(7):e88051.', url: 'https://doi.org/10.7759/cureus.88051', label: 'doi:10.7759/cureus.88051' },
  { id: 'wikner2017', text: 'Wikner M. Unexpected motor weakness following quadratus lumborum block for gynaecological laparoscopy. <i>Anaesthesia</i> 2017;72(2):230–232.', url: 'https://doi.org/10.1111/anae.13754', label: 'doi:10.1111/anae.13754' },
  { id: 'kamal2018', text: 'Kamal K, Jain P, Bansal T, Ahlawat G. A comparative study to evaluate ultrasound-guided transversus abdominis plane block versus ilioinguinal iliohypogastric nerve block for post-operative analgesia in adult patients undergoing inguinal hernia repair. <i>Indian J Anaesth</i> 2018;62(4):292–297.', url: 'https://doi.org/10.4103/ija.IJA_548_17', label: 'doi:10.4103/ija.IJA_548_17' },
  { id: 'chin2017', text: 'Further reading. Chin KJ, McDonnell JG, Carvalho B, Sharkey A, Pawa A, Gadsden J. Essentials of our current understanding: abdominal wall blocks. <i>Reg Anesth Pain Med</i> 2017;42(2):133–183.', url: 'https://doi.org/10.1097/AAP.0000000000000545', label: 'doi:10.1097/AAP.0000000000000545' },
];

const D = cite('deck');

export const BLOCKS = [
  // ------------------------------------------------------------------ lateral TAP
  {
    id: 'tap',
    kicker: 'Abdominal wall · Transversus abdominis plane',
    title: 'Lateral TAP block',
    summary: `Local anaesthetic in the plane between internal oblique and transversus abdominis, in the mid-axillary line. It covers the anterior abdominal wall below the umbilicus, about T10–T12.${cite('tsai2017')} Somatic analgesia only.`,
    indications: ['Incisions below the umbilicus', 'Lower laparoscopic port sites', 'Part of multimodal analgesia'],
    glance: {
      position: 'Supine',
      probe: 'Linear, transverse, mid-axillary line',
      needle: '80 mm echogenic, in-plane, anterior to posterior',
      covers: 'T10–T12, front of the abdomen below the umbilicus',
    },
    position: '<p>Supine. Expose the flank between the costal margin and the iliac crest. For a midline incision, block both sides.</p>',
    equipment: [
      'High-frequency linear probe',
      '80 mm echogenic needle',
      '20–30 ml of dilute 0.3% ropivacaine per side',
      'Sterile probe cover, skin preparation, monitoring and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p>Put the probe <strong>transverse in the mid-axillary line, between the costal margin and the iliac crest</strong>. Or start at the linea semilunaris (the lateral edge of rectus) and slide laterally. Identify the <strong>three muscle layers</strong>: external oblique, internal oblique and transversus abdominis.${D}</p><p>TA is usually the thinnest and darkest layer. Deep to it the peritoneum is a bright line, with bowel sliding underneath.</p>`,
    approach: `<p><strong>In-plane, anterior to posterior.</strong>${D} The needle enters at the anterior end of the probe. Advance through EO and IO to the plane between IO and TA, keeping the tip in view the whole time.</p>`,
    sonoanatomy: `<p>Labels to know for the exam: subcutaneous tissue, EO, IO, TA and peritoneum.${D}</p>`,
    target: `<p><strong>Hydrodissect between IO and TA.</strong>${D} A correct injection opens an anechoic lens that lifts IO and pushes TA deep, and spreads along the plane. If a muscle swells and its fibres look streaky, the tip is intramuscular: stop and reposition.</p>`,
    dose: { volume: '20–30 ml', conc: 'dilute 0.3%', drug: 'ropivacaine', per: 'per side', source: `Deck slide 113.${D}` },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T10', 'T12'], zones: ['anterior'], density: 'moderate' },
        { levels: ['T9'], zones: ['anterior'], density: 'patchy' },
      ],
      summary: 'T10–T12, the front of the abdominal wall below the umbilicus.',
      mechanism: `<p>The anterior rami of T7–T12 run between internal oblique and transversus abdominis.${cite('tsai2017')} Local anaesthetic spread in this plane blocks the nerves that pass the injection point.</p>`,
      density: `<p>Somatic only: it does not treat visceral pain, so use it as part of multimodal analgesia. A single shot has a limited duration.${cite('tsai2017')}</p>`,
      misses: `<ul><li><strong>Above T10.</strong> T6–T9 enter the plane medially, under the costal margin, not in the mid-axillary line. TAP only covers to T10, so use a subcostal TAP for upper abdominal surgery.${D}</li><li><strong>The groin.</strong> L1 (iliohypogastric and ilioinguinal) generally only enters the TAP plane medial to the ASIS.${D}</li><li><strong>The flank skin.</strong> The lateral cutaneous branches leave the nerves around the mid-axillary line, so lateral skin may be spared.</li></ul>`,
    },
    complications: `<ul><li><strong>Peritoneal puncture and bowel injury.</strong> Visceral damage has been reported with blind technique.${cite('tsai2017')} Keep the tip in view.</li><li><strong>Transient femoral nerve palsy</strong> from local anaesthetic deposited in the wrong place.${cite('tsai2017')} Warn the patient and the ward about leg weakness before they walk.</li><li><strong>Local anaesthetic toxicity:</strong> seizure and ventricular arrhythmia have been reported.${cite('tsai2017')} Bilateral blocks use large total doses.</li><li><strong>Failed block</strong> from intramuscular injection. Watch the spread.</li></ul>`,
    exam: [
      {
        source: 'MMed OSCE 2021 (deck slide 113)',
        q: '<p>Perform an ultrasound-guided lateral TAP block for a patient having a lower abdominal operation. Talk through your preparation, scanning and needle approach.</p>',
        points: [
          'Supine; high-frequency linear probe; 80 mm echogenic needle; 20–30 ml of dilute 0.3% ropivacaine per side.',
          'Probe transverse in the mid-axillary line between the costal margin and the iliac crest, or start at the linea semilunaris and slide laterally.',
          'Identify the three layers: EO, IO and TA, with the peritoneum below.',
          'In-plane, anterior to posterior; tip in view throughout.',
          'Hydrodissect between IO and TA; aspirate; watch the spread.',
          'Keep within the maximum dose, especially if bilateral.',
        ],
      },
      {
        source: 'MMed OSCE 2024 (deck slide 116)',
        q: '<p>Explain the nerve supply of the anterior abdominal wall and the area a TAP block covers. Label a TAP ultrasound picture. Does it cover the groin?</p>',
        points: [
          'Anterior abdominal wall: thoracoabdominal nerves T6–T11, subcostal T12 and L1 (iliohypogastric and ilioinguinal), running between IO and TA.',
          'Labels: subcutaneous tissue, EO, IO, TA, peritoneum.',
          'Lateral TAP covers about T10–T12: the anterior wall below the umbilicus.',
          'Groin: no. L1 (iliohypogastric and ilioinguinal) generally only enters the TAP plane medial to the ASIS. Use an ilioinguinal and iliohypogastric block.',
          'Try it: in the scan viewer, turn the labels off and name each layer.',
        ],
      },
    ],
    sources: `Deck slides 113–116.${D} Coverage and complications: Tsai et al.${cite('tsai2017')}`,
  },

  // ------------------------------------------------------------------ subcostal TAP
  {
    id: 'subcostal',
    kicker: 'Abdominal wall · Transversus abdominis plane',
    title: 'Subcostal TAP block',
    summary: `A TAP block placed just under the costal margin, where T6–T9 enter the plane medially. Use it for upper abdominal incisions, because a lateral TAP only covers to T10.${D}`,
    indications: ['Upper abdominal and subcostal incisions', 'Upper laparoscopic port sites', 'With a lateral TAP or rectus sheath block for long incisions'],
    glance: {
      position: 'Supine',
      probe: 'Linear, oblique, under and parallel to the costal margin',
      needle: 'In-plane, medial to lateral, along the costal margin',
      dose: '15–20 ml per side',
      covers: 'T6–T9, upper abdomen below the xiphoid',
    },
    position: '<p>Supine. For an upper midline or bilateral subcostal incision, block both sides.</p>',
    equipment: ['High-frequency linear probe', 'Echogenic block needle (a longer needle for the oblique subcostal technique)', '15–20 ml of dilute local anaesthetic per side'],
    landmarks: `<p>Probe <strong>just below the costal margin, close to the xiphoid</strong>, lying parallel to the margin.${cite('hebbard2008')} Medially, find rectus abdominis with <strong>transversus abdominis deep to it</strong>. Slide laterally along the margin: past the linea semilunaris, EO, IO and TA appear.</p>`,
    approach: `<p>In-plane from medial, near the xiphoid, advancing inferolaterally along the costal margin. Place the tip <strong>between rectus and TA</strong> (or between IO and TA lateral to the linea semilunaris) and hydrodissect.</p><p>The <strong>oblique subcostal</strong> variant opens the plane along the whole line of the costal margin, with a long needle (15–20 cm) and a larger volume (40–80 ml described), so watch the total dose.${cite('tsai2017', 'hebbard2010')}</p>`,
    sonoanatomy: '<p>The key difference from the lateral view: medially, TA lies <strong>behind rectus</strong>. The superior epigastric vessels run on the back of rectus, and the liver (right) or bowel lies just deep to the peritoneum.</p>',
    target: `<p>The plane <strong>between the back of rectus and TA</strong>, medial to the linea semilunaris, where the upper nerves enter.${cite('tsai2017', 'fernandez2025')} The fluid should separate the two muscles and spread laterally along the costal margin.</p>`,
    dose: {
      html: '<span class="tb-dose-v">15–20 ml</span> per side of dilute ropivacaine',
      source: `Volume: Fernandez Martin et al. (just under rectus, 15–20 ml).${cite('fernandez2025')} The deck gives no subcostal value; use the deck’s dilute TAP concentration (0.3% ropivacaine) unless your department advises otherwise.${D}`,
    },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['T6', 'T9'], zones: ['anterior'], density: 'moderate' },
        { levels: ['T10'], zones: ['anterior'], density: 'patchy' },
      ],
      summary: 'T6–T9: the upper abdomen just below the xiphoid and parallel to the costal margin.',
      mechanism: `<p>T6–T9 leave the intercostal spaces at the costal margin and enter the plane medially, so the injection has to be made medial to the linea semilunaris.${cite('tsai2017', 'fernandez2025')}</p>`,
      density: '<p>Somatic only. Spread varies between patients, so test the block and plan rescue analgesia. For a midline wound, add a rectus sheath block or block both sides.</p>',
    },
    complications: `<ul><li><strong>Liver or bowel injury</strong>: the liver (right) and bowel lie just under the peritoneum here. Keep the tip in view.</li><li><strong>Vessel puncture</strong>: the superior epigastric vessels run on the back of rectus. Use colour Doppler.</li><li><strong>Local anaesthetic toxicity</strong> with the large volumes of the oblique subcostal technique, especially bilateral.${cite('tsai2017')}</li></ul>`,
    exam: [
      {
        source: 'Practice question (based on deck slide 127)',
        q: '<p>A patient is having an open upper abdominal incision. Why will a lateral TAP block not be enough, and what would you do instead?</p>',
        points: [
          'Lateral TAP only covers to about T10; the upper abdomen is T6–T9.',
          'T6–T9 enter the TAP plane medially, under the costal margin.',
          'Use a subcostal TAP (between rectus and TA, just under the costal margin), bilateral for a midline wound.',
          'Alternatives: rectus sheath blocks or catheters for a midline incision; neuraxial or paravertebral techniques for visceral pain.',
        ],
      },
    ],
    sources: `Deck slide 127.${D} Technique: Hebbard 2008 and 2010.${cite('hebbard2008', 'hebbard2010')} Volume: Fernandez Martin 2025.${cite('fernandez2025')}`,
  },

  // ------------------------------------------------------------------ rectus sheath
  {
    id: 'rsb',
    kicker: 'Abdominal wall · Rectus sheath',
    title: 'Rectus sheath block',
    summary: 'Local anaesthetic between rectus abdominis and the posterior rectus sheath. It blocks the terminal branches of the lower thoracic nerves as they reach the rectus, so it covers the midline around the injection level. Do it on both sides for a midline wound.',
    indications: ['Midline laparotomy (bilateral, single shots or catheters)', 'Umbilical and paraumbilical hernia repair', 'Midline laparoscopic port sites'],
    glance: {
      position: 'Supine',
      probe: 'Linear, transverse, just lateral to the umbilicus',
      needle: '80 mm echogenic, in-plane, lateral to medial',
      covers: 'Midline and paramedian skin at the level injected',
    },
    position: '<p>Supine.</p>',
    equipment: ['High-frequency linear probe', '80 mm echogenic needle', '20 ml of 0.3–0.5% ropivacaine'],
    landmarks: `<p>Probe <strong>transverse, lateral to the umbilicus</strong>. Identify the <strong>rectus muscle and the posterior rectus sheath</strong>.${D} The linea alba is medial; laterally, EO, IO and TA converge at the linea semilunaris.</p><p>Use colour Doppler: the inferior epigastric vessels run on the back of rectus.</p>`,
    approach: `<p><strong>In-plane, lateral to medial.</strong>${D} Pass through rectus to its posterior surface. Inject 1–2 ml to confirm that rectus lifts off the posterior sheath.</p>`,
    sonoanatomy: `<p>Labels to know: peritoneum, rectus, EO, IO, TA, posterior rectus sheath, linea alba and linea semilunaris.${D}</p><p>Below the arcuate line (about a third of the way from the umbilicus to the pubis) the posterior sheath is absent, so inject at or above the umbilicus.</p>`,
    target: `<p><strong>Hydrodissect the potential space between the rectus muscle and the posterior rectus sheath.</strong>${D} The fluid should spread under the muscle, medially and laterally, not into it.</p>`,
    dose: { volume: '20 ml', conc: '0.3–0.5%', drug: 'ropivacaine', source: `Deck slide 107.${D}`, note: 'Midline wounds need both sides: plan the total dose before you start.' },
    coverage: {
      side: 'bilateral',
      areas: [
        { levels: ['T10'], zones: ['midline'], density: 'dense' },
        { levels: ['T9', 'T11'], zones: ['midline'], density: 'moderate' },
      ],
      summary: 'A band of midline and paramedian skin around the level injected (about T9–T11 when injected beside the umbilicus).',
      mechanism: '<p>The anterior branches of the lower thoracic nerves pierce the posterior rectus sheath and run behind rectus before piercing it to reach the midline skin. Local anaesthetic behind rectus catches them where they enter.</p>',
      density: '<p>Good for the midline strip close to the injection, but it does not cover the lateral wall or visceral pain. Single shots wear off; catheters are used for laparotomy wounds.</p>',
    },
    complications: `<ul><li><strong>Peritoneal puncture and bowel injury</strong>: bowel can be adherent to the peritoneum, and ultrasound shows it before you start.${cite('dolan2009')}</li><li><strong>Inferior epigastric vessel puncture</strong> and rectus sheath haematoma. Doppler first; avoid the vessels.</li><li><strong>Local anaesthetic toxicity</strong> with bilateral blocks.</li><li><strong>Failed block</strong> from injecting into rectus (the muscle swells instead of lifting).</li></ul>`,
    exam: [
      {
        source: 'MMed OSCE 2024 (deck slide 111)',
        q: '<p>Rectus sheath block: describe your preparation and technique, and label the ultrasound image.</p>',
        points: [
          'Supine; high-frequency linear probe; 80 mm echogenic needle; 20 ml of 0.3–0.5% ropivacaine.',
          'Probe transverse, lateral to the umbilicus; identify rectus and the posterior rectus sheath.',
          'In-plane, lateral to medial.',
          'Labels: peritoneum, rectus, EO, IO, TA, posterior rectus sheath, linea alba, linea semilunaris.',
          'Hydrodissect the potential space between rectus and the posterior rectus sheath.',
          'Bilateral for a midline wound; keep within the maximum dose.',
        ],
      },
    ],
    sources: `Deck slides 107–111.${D}`,
  },

  // ------------------------------------------------------------------ quadratus lumborum
  {
    id: 'ql',
    kicker: 'Abdominal wall · Posterior abdominal wall',
    title: 'Quadratus lumborum block (types 1–3)',
    summary: `Fascial plane injections around quadratus lumborum (QL). The muscle is on the posterior abdominal wall, but the block is used for abdominal surgery: local anaesthetic travels along the thoracolumbar fascia, and can reach the paravertebral space.${cite('sonawane2026')} Covered in brief.`,
    indications: ['Abdominal and flank surgery when wider spread than a TAP block is wanted', 'Part of multimodal analgesia'],
    glance: {
      position: 'Lateral, side to be blocked up (supine possible for type 1)',
      probe: 'Curvilinear, transverse on the flank above the iliac crest',
      needle: 'In-plane; type 3 from posterior, through QL',
      dose: '20–30 ml per side',
      covers: 'Variable, about T7–L1',
    },
    position: `<p>Lateral decubitus with the side to be blocked uppermost is the usual position for the transmuscular (type 3) approach.${cite('dost2026')} Type 1 can be done supine with the flank exposed.</p>`,
    equipment: ['Low-frequency curvilinear probe', 'Echogenic block needle long enough for the depth (often 100 mm)', '20–30 ml of dilute local anaesthetic per side'],
    landmarks: `<p>Curvilinear probe <strong>transverse on the flank</strong> along the mid-axillary line between the iliac crest and the costal margin.${cite('dost2026')} Follow EO, IO and TA posteriorly until they taper into the aponeurosis at the lateral edge of QL. Tilt to find the L4 transverse process with psoas in front, erector spinae behind and QL at its tip: the <strong>shamrock sign</strong>.${cite('dost2026')}</p>`,
    approach: `<p>The types are named by where the needle tip ends up:${cite('sonawane2026', 'elsharkawy2019')}</p><div id="ql-types"><div class="tb-table-wrap"><table class="tb-table tb-table--stack"><thead><tr><th scope="col">Type</th><th scope="col">Needle tip</th><th scope="col">Spread and notes</th></tr></thead><tbody>
<tr><th scope="row">Type 1 (lateral)</th><td data-label="Needle tip">Anterolateral border of QL, deep to the TA aponeurosis</td><td data-label="Spread and notes">Mainly lateral into the TAP plane (T10–T12)${cite('sonawane2026')}</td></tr>
<tr><th scope="row">Type 2 (posterior)</th><td data-label="Needle tip">Posterior surface of QL, between QL and erector spinae (middle layer of the thoracolumbar fascia)</td><td data-label="Spread and notes">Along the thoracolumbar fascia${cite('sonawane2026')}</td></tr>
<tr><th scope="row">Type 3 (transmuscular, anterior)</th><td data-label="Needle tip">Through QL, into the plane between QL and psoas</td><td data-label="Spread and notes">Towards the paravertebral space and the lumbar plexus: watch for leg weakness${cite('sonawane2026', 'dost2026')}</td></tr>
</tbody></table></div><p>Use the <a href="#ql-inj-ql1">type buttons in the scan viewer</a> to see each needle path and spread.</p></div>`,
    sonoanatomy: '<p>At L4 the three leaves of the shamrock are psoas (anterior), quadratus lumborum (lateral, at the tip of the transverse process) and erector spinae (posterior). Higher up, the kidney lies in front of QL.</p>',
    target: '<p>Type 1: the anterolateral border of QL. Type 2: its posterior surface. Type 3: the plane between QL and psoas. In each case watch the fluid separate the fascial plane rather than swell the muscle.</p>',
    dose: {
      html: '<span class="tb-dose-v">20–30 ml</span> per side of <span class="tb-dose-v">0.2–0.375%</span> ropivacaine',
      source: `Typical range in a 2025 review (occasionally up to 40 ml; type 3 often 30–40 ml).${cite('rytel2025')} The deck gives no QL values.`,
      note: 'Inject diluted local anaesthetic in increments and aspirate.',
    },
    coverage: {
      side: 'unilateral',
      areas: [{ levels: ['T7', 'L1'], zones: ['anterolateral', 'lateral'], density: 'patchy' }],
      summary: 'Variable: about T7–L1 for types 1 and 2, and T7–L2 for type 3.',
      mechanism: `<p>Spread is interfascial, along myofascial continuities rather than to one nerve. The anterior thoracolumbar fascia is a route for cephalad spread towards the thoracic paravertebral space; type 1 spreads mainly into the TAP plane.${cite('sonawane2026')}</p>`,
      density: `<p>Variable between types and patients, and the published ranges come from mixed evidence.${cite('rytel2025')} Treat it as one part of multimodal analgesia and test the block.</p>`,
    },
    complications: `<ul><li><strong>Quadriceps or hip flexor weakness</strong> from spread to the lumbar plexus, mainly with the anterior (type 3) approach.${cite('dost2026', 'wikner2017')} Check leg strength before the patient mobilises.</li><li><strong>Bleeding</strong>: it is a deep block near psoas, where vessels are small and hard to see.${cite('dost2026')}</li><li><strong>Peritoneal puncture or retroperitoneal breach</strong> with lateral approaches; <strong>epidural or intrathecal spread</strong> with the anterior approach and high volumes.${cite('sonawane2026')}</li><li><strong>Local anaesthetic toxicity</strong>: large bilateral volumes.</li></ul>`,
    exam: [
      {
        source: 'Practice question (not from the deck)',
        q: '<p>Name the three main quadratus lumborum injection points and where the needle tip goes in each. Why might the patient’s leg be weak afterwards?</p>',
        points: [
          'Type 1 (lateral): anterolateral border of QL, deep to the TA aponeurosis.',
          'Type 2 (posterior): posterior surface of QL, in the middle layer of the thoracolumbar fascia.',
          'Type 3 (transmuscular): between QL and psoas, needle through QL from posterior.',
          'Leg weakness: spread to the lumbar plexus (femoral nerve), most likely with type 3.',
          'It is a posterior abdominal wall block used for abdominal surgery.',
        ],
      },
    ],
    sources: `Anatomy and types: Sonawane and Mistry 2026; Elsharkawy et al. 2019.${cite('sonawane2026', 'elsharkawy2019')} Shamrock and position: Dost et al. 2026.${cite('dost2026')} Dose and coverage: Rytel et al. 2025.${cite('rytel2025')}`,
  },

  // ------------------------------------------------------------------ ilioinguinal / iliohypogastric
  {
    id: 'iih',
    kicker: 'Abdominal wall · Groin',
    title: 'Ilioinguinal and iliohypogastric block',
    summary: 'Blocks the two L1 nerves where they lie between internal oblique and transversus abdominis, just medial to the anterior superior iliac spine (ASIS). It covers the groin, which a lateral TAP block misses.',
    indications: ['Open inguinal hernia repair (with surgical infiltration)', 'Other groin incisions'],
    glance: {
      position: 'Supine',
      probe: 'Linear, on the line from the ASIS to the umbilicus',
      needle: 'In-plane, medial to lateral',
      dose: '10 ml',
      covers: 'L1: groin and inguinal region',
    },
    position: '<p>Supine.</p>',
    equipment: ['High-frequency linear probe', '50–80 mm echogenic needle', 'About 10 ml of local anaesthetic'],
    landmarks: `<p>Probe <strong>obliquely on the line from the ASIS to the umbilicus</strong>, immediately next to the ASIS.${cite('kamal2018')} Find the bright line of the iliac bone with its shadow, then EO, IO and TA. The nerves are small oval structures in the plane between IO and TA near the bone. The deep circumflex iliac artery is often close: use colour Doppler.</p>`,
    approach: `<p>In-plane, medial to lateral. Put the tip into the <strong>plane between IO and TA</strong> beside the nerves.${cite('kamal2018')}</p>`,
    target: '<p>The IO–TA plane next to both nerves. Hydrodissect so the fluid surrounds them.</p>',
    dose: {
      html: '<span class="tb-dose-v">10 ml</span> of local anaesthetic',
      source: `Kamal et al. used 10 ml of 0.75% ropivacaine.${cite('kamal2018')} The deck lists the block (slide 127) without a dose; use the concentration your department uses.${D}`,
    },
    coverage: {
      side: 'unilateral',
      areas: [
        { levels: ['L1'], zones: ['anterior', 'front-lat'], density: 'dense' },
        { levels: ['T12'], zones: ['anterior'], density: 'patchy' },
      ],
      summary: 'L1: the groin, the lower abdominal wall above the inguinal ligament, the upper medial thigh and the front of the scrotum or labia.',
      mechanism: `<p>The iliohypogastric and ilioinguinal nerves (L1) pass into the plane near the anterior iliac crest.${cite('tsai2017')} Local anaesthetic placed here, medial to the ASIS, bathes both.</p>`,
      density: '<p>Reliable when the nerves are seen. It does not cover the genital branch of the genitofemoral nerve or the hernia sac (peritoneum), so the surgeon usually adds local infiltration.</p>',
    },
    complications: `<ul><li><strong>Femoral nerve block</strong> if local anaesthetic tracks deep (as reported after TAP blocks): transient quadriceps weakness.${cite('tsai2017')} Warn about falls.</li><li><strong>Bowel puncture</strong> if the needle passes through TA.</li><li><strong>Vessel puncture</strong>: the deep circumflex iliac artery lies in the same plane.</li></ul>`,
    exam: [
      {
        source: 'MMed OSCE 2024 (deck slide 116)',
        q: '<p>Does a TAP block cover the groin? What would you use for an open inguinal hernia repair?</p>',
        points: [
          'No. L1 (iliohypogastric and ilioinguinal) generally only enters the TAP plane medial to the ASIS.',
          'Use an ultrasound-guided ilioinguinal and iliohypogastric block: probe on the line from the ASIS to the umbilicus, inject between IO and TA beside the nerves.',
          'Add surgical infiltration for the genital branch of the genitofemoral nerve and the sac.',
        ],
      },
    ],
    sources: `Deck slides 116 and 127.${D} Technique and volume: Kamal et al. 2018.${cite('kamal2018')}`,
  },
].map((b) => ({ ...b, scene: SCENES[b.id] }));
