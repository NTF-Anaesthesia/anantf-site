// Cervical plexus: block data (schema: ../../../truncal/shared/DATA.md, "Block schema").
// Technique and doses follow the department's teaching notes; values the notes do not give carry a citation.
import { cite } from '../../../truncal/shared/js/refs.js';
import { headCoverageMap } from '../../shared/js/head.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'notes', text: 'NTF Anaesthesia. Head and neck regional anaesthesia: teaching notes (internal teaching material).' },
  { id: 'nysora-us', text: 'NYSORA. Ultrasound-guided cervical plexus block (online technique guide).', url: 'https://www.nysora.com/techniques/head-and-neck-blocks/cervical/ultrasound-guided-cervical-plexus-block/', label: 'nysora.com' },
  { id: 'nysora-lm', text: 'NYSORA. Cervical plexus block (landmark techniques; online technique guide).', url: 'https://www.nysora.com/techniques/head-and-neck-blocks/cervical/cervical-plexus-block/', label: 'nysora.com' },
  { id: 'kim2018', text: 'Kim JS, Ko JS, Bang S, Kim H, Lee SY. Cervical plexus block. <i>Korean J Anesthesiol</i> 2018;71(4):274–288.', url: 'https://doi.org/10.4097/kja.d.18.00143', label: 'doi:10.4097/kja.d.18.00143' },
  { id: 'pandit2007', text: 'Pandit JJ, Satya-Krishna R, Gration P. Superficial or deep cervical plexus block for carotid endarterectomy: a systematic review of complications. <i>Br J Anaesth</i> 2007;99(2):159–169.', url: 'https://doi.org/10.1093/bja/aem160', label: 'doi:10.1093/bja/aem160' },
  { id: 'gala2008', text: 'GALA Trial Collaborative Group. General anaesthesia versus local anaesthesia for carotid surgery (GALA): a multicentre, randomised controlled trial. <i>Lancet</i> 2008;372(9656):2132–2142.', url: 'https://doi.org/10.1016/S0140-6736(08)61699-2', label: 'doi:10.1016/S0140-6736(08)61699-2' },
  { id: 'mayhew2018', text: 'Mayhew D, Sahgal N, Khirwadkar R, Hunter JM, Banerjee A. Analgesic efficacy of bilateral superficial cervical plexus block for thyroid surgery: meta-analysis and systematic review. <i>Br J Anaesth</i> 2018;120(2):241–251.', url: 'https://doi.org/10.1016/j.bja.2017.11.083', label: 'doi:10.1016/j.bja.2017.11.083' },
];

const N = cite('notes');

export const BLOCKS = [
  // ------------------------------------------------------------------ superficial and intermediate
  {
    id: 'scp',
    kicker: 'Neck · Superficial and intermediate',
    title: 'Superficial and intermediate cervical plexus block',
    summary: `Local anaesthetic around the four cutaneous branches of C2–C4 where they come round the <strong>posterior border of sternocleidomastoid</strong>. The <strong>superficial</strong> block is subcutaneous; the <strong>intermediate</strong> block is deeper, between the investing and prevertebral layers of the deep cervical fascia.${N} Sensory only, and for most indications as good as the deep block and safer.${N}${cite('pandit2007')}`,
    indications: ['Carotid endarterectomy (awake)', 'Thyroid and parathyroid surgery (both sides)', 'Superficial neck surgery and lymph node biopsy', 'Clavicle surgery (with a brachial plexus block)'],
    glance: {
      position: 'Supine or semi-sitting, head turned slightly away',
      probe: 'Linear, transverse over the midpoint of SCM',
      needle: '50 mm, in-plane, lateral to medial',
      dose: '5–15 ml of 0.25–0.5% ropivacaine (or 0.25% bupivacaine, 1% lidocaine)',
      covers: 'Skin of the anterolateral neck, the angle of the jaw and ear, behind the ear and over the clavicle (C2–C4)',
    },
    scene: SCENES.scp,
    position: `<p>Supine or semi-sitting, with the <strong>head turned slightly away</strong> from the side to be blocked. Expose the neck and upper chest so you can see the length of SCM. To find its posterior border, ask the patient to <strong>lift the head off the pillow</strong>. Slide the pillow away from the hand holding the needle.${N}</p>`,
    equipment: [
      'High-frequency linear probe',
      '50 mm short-bevel needle; 10 ml syringe',
      `5–15 ml of local anaesthetic. The plexus is purely sensory here, so a dilute solution is enough: ropivacaine 0.25–0.5%, bupivacaine 0.25% or lidocaine 1%.${N}`,
      'Monitoring, oxygen, and the local anaesthetic toxicity kit within reach',
    ],
    landmarks: `<p><strong>Landmark (superficial) technique.</strong> Find the <strong>midpoint of the posterior border of SCM</strong> (Erb’s point, about the level of the thyroid cartilage), where the four branches fan out. Insert the needle just under the skin there and inject about 3 ml, then fan <strong>2–3 cm up and down the border</strong> with about 7 ml more, subcutaneously. Total 10–15 ml. Keep it shallow: no deeper than 1–2 cm.${N}${cite('nysora-lm')}</p>
<p><strong>Ultrasound.</strong> Probe transverse over the middle of SCM, about the level of the cricoid. Slide posteriorly until the <strong>tapering posterior edge of SCM</strong> is in the middle of the screen. Look for the interscalene groove and brachial plexus deep to the bright <strong>prevertebral fascia</strong>. The cervical plexus is a small honeycomb of hypoechoic dots just <strong>deep to the posterior edge of SCM</strong> and superficial to the prevertebral fascia.${N}${cite('nysora-us')} Sometimes the great auricular nerve is seen as a single dot on the surface of SCM.</p>`,
    approach: `<p><strong>In-plane, lateral to medial</strong> (posterior to anterior).${N} For the intermediate block, pass through the investing fascia so the tip sits beside the plexus, under the posterior edge of SCM. If you can’t see the plexus, put the tip in the <strong>plane between SCM and the prevertebral fascia</strong>, close to the posterior border of SCM (the sub-SCM approach).${N}</p>`,
    sonoanatomy: `<p>Superficial to deep: skin, fat and platysma; SCM (wrapped in the investing layer of deep cervical fascia); fat; the prevertebral fascia; then the scalene muscles with the brachial plexus roots between them. Medially, deep to SCM: the internal jugular vein and the common carotid artery.${N}</p>`,
    target: `<p><strong>Intermediate:</strong> the fluid should layer out <strong>between SCM and the prevertebral fascia</strong> and surround the plexus. If it doesn’t, reposition and inject again.${N} <strong>Superficial:</strong> a subcutaneous layer over the posterior border of SCM. Never inject deep to the prevertebral fascia: that is the deep block, with its risks.</p>`,
    dose: { volume: '5–15 ml', conc: '0.25–0.5%', drug: 'ropivacaine', per: 'per side', source: `Ultrasound technique, teaching notes; landmark technique 10–15 ml.${N}`, note: 'Bupivacaine 0.25% or lidocaine 1% also work. For thyroid surgery both sides are blocked: add up the total dose.' },
    coverage: {
      map: headCoverageMap,
      side: 'unilateral',
      views: ['front', 'side'],
      areas: [
        { zones: ['gan', 'tcn'], density: 'dense' },
        { zones: ['lon', 'scn'], density: 'moderate' },
      ],
      summary: 'Skin of the anterolateral neck (C2–C4): angle of the jaw and most of the ear, behind the ear, the front of the neck and over the clavicle.',
      mechanism: `<p>The four cutaneous branches (lesser occipital, great auricular, transverse cervical and supraclavicular) all come round the posterior border of SCM near its midpoint before they fan out under the skin.${N} One injection there reaches all four.</p>`,
      density: `<p>Skin cover is reliable. It is sensory only: the deep structures of the neck (the carotid sheath, muscles, thyroid capsule) are not reliably covered, so the surgeon usually adds local infiltration, for example around the carotid sheath during endarterectomy.${cite('pandit2007')}</p>`,
      misses: `<ul><li><strong>The face.</strong> The mental, infraorbital and supraorbital nerves are trigeminal branches, not cervical plexus.${N} See <a href="../face/">face blocks</a>.</li><li><strong>The back of the neck and the occipital scalp</strong> (dorsal rami; greater occipital nerve).</li><li><strong>Deep structures</strong> without the surgeon’s infiltration.</li></ul>`,
    },
    complications: `<ul><li><strong>Intravascular injection</strong> (internal jugular, carotid, external jugular): aspirate and inject in small steps. Look for the vessels with colour Doppler before you start.${N}</li><li><strong>Spread to the brachial plexus</strong> (an unplanned interscalene block), especially with larger volumes and higher concentrations.${N}</li><li><strong>Phrenic nerve block</strong> (breathlessness), <strong>Horner’s syndrome</strong> and <strong>recurrent laryngeal nerve block</strong> (hoarse voice). Rare with the superficial and intermediate blocks, but warn the patient.${N}</li><li>Serious complications are close to zero with the superficial and intermediate blocks, and less common than with the deep block.${N}${cite('pandit2007')}</li></ul>`,
    pearls: [
      'Lifting the head off the pillow makes the posterior border of SCM easy to feel.',
      'Look for the tapering posterior edge of SCM, not for the nerves: if the dots aren’t clear, the plane under SCM still works.',
      'A larger volume does not mean a better block here; it means more spread to the brachial plexus and phrenic nerve.',
      'Both sides for thyroid surgery is fine with the superficial or intermediate block. Never do a deep block on both sides.',
    ],
    sections: [
      {
        id: 'cea', title: 'Carotid endarterectomy under regional anaesthesia',
        html: `<p>An awake patient is the best neurological monitor while the carotid is clamped. The usual technique is a superficial or intermediate cervical plexus block plus <strong>local infiltration by the surgeon</strong> (the carotid sheath and the lower border of the mandible, where the retractor sits).${cite('pandit2007')}</p>
<ul><li>In the GALA trial (3526 patients), local and general anaesthesia gave no difference in stroke, heart attack or death at 30 days.${cite('gala2008')} Choose by the patient, the surgeon and the team.</li>
<li>In a systematic review, serious complications were more common after deep (or combined deep and superficial) blocks than after superficial or intermediate blocks, and conversion to general anaesthesia was also more frequent.${cite('pandit2007')} The deep block is not needed for this operation.</li>
<li>Talk to the patient throughout and keep a plan for converting to general anaesthesia with the airway under the drapes.</li></ul>`,
      },
      {
        id: 'thyroid', title: 'Thyroid and parathyroid surgery',
        html: `<p>Bilateral superficial cervical plexus blocks give a small reduction in pain scores and opioid use after thyroid surgery.${cite('mayhew2018')} Useful as part of multimodal analgesia, not as the only technique.</p>`,
      },
    ],
    exam: [
      {
        source: 'Practice question (viva)',
        q: '<p>A patient is having a carotid endarterectomy under regional anaesthesia. Which block would you choose, and why not a deep cervical plexus block?</p>',
        points: [
          'Superficial or intermediate cervical plexus block on the operative side, with local infiltration by the surgeon around the carotid sheath and the lower border of the mandible.',
          'The four cutaneous branches of C2–C4 come round the posterior border of SCM at its midpoint: one injection reaches them all.',
          'The deep block adds little for this operation and has more serious complications (vertebral artery or intrathecal injection, phrenic nerve block) and more conversions to general anaesthesia.',
          'Awake patient = neurological monitoring during clamping. GALA: no difference in 30-day outcomes between local and general anaesthesia.',
          'Have a plan to convert to general anaesthesia.',
        ],
      },
      {
        source: 'Practice question (OSCE)',
        q: '<p>Label this ultrasound picture of the neck and show where you would put the needle tip for an intermediate cervical plexus block.</p>',
        points: [
          'Sternocleidomastoid with its tapering posterior border; the investing fascia around it.',
          'Prevertebral fascia (bright line); scalene muscles and the brachial plexus roots below it.',
          'Internal jugular vein and common carotid artery, deep to SCM medially.',
          'Cervical plexus: small hypoechoic dots under the posterior edge of SCM.',
          'Tip: deep to SCM and superficial to the prevertebral fascia, next to the plexus. In-plane, lateral to medial.',
        ],
      },
    ],
    sources: `Teaching notes${N}; NYSORA landmark and ultrasound guides${cite('nysora-lm', 'nysora-us')}; review${cite('kim2018')}.`,
  },

  // ------------------------------------------------------------------ deep
  {
    id: 'dcp',
    kicker: 'Neck · Deep',
    title: 'Deep cervical plexus block',
    summary: `A <strong>paravertebral block of the C2–C4 roots</strong> as they leave the foramina: local anaesthetic <strong>deep to the prevertebral fascia</strong>, beside the transverse processes.${N} An advanced block with a risk of serious complications, including intrathecal and vertebral artery injection. For most indications the superficial or intermediate block is as good and safer.${N}`,
    indications: ['Rarely needed: the superficial or intermediate block covers most neck surgery', 'Know it for the exam and to recognise its complications'],
    glance: {
      position: 'Supine, head turned away',
      probe: 'Linear, transverse behind SCM at C4 (ultrasound) or landmarks',
      needle: '50 mm, short bevel',
      dose: '3–5 ml per level (C2, C3, C4), or one injection at C3 or C4',
      covers: 'C2–C4: the skin of the neck as for the superficial block, plus the deep muscles',
    },
    scene: SCENES.dcp,
    position: '<p>Supine with the head turned slightly away from the side to be blocked. Never block both sides.</p>',
    equipment: [
      'High-frequency linear probe (for the ultrasound technique)',
      '50 mm short-bevel needle; extension tubing so an assistant can aspirate and inject',
      `3–5 ml of local anaesthetic per level.${N}`,
      'Full monitoring, oxygen, airway equipment and lipid emulsion ready before you start',
    ],
    landmarksTitle: 'Landmarks',
    landmarks: `<p><strong>Landmark technique.</strong> Draw a line from the <strong>tip of the mastoid process</strong> to <strong>Chassaignac’s tubercle</strong> (the C6 transverse process, felt behind the clavicular head of SCM just below the cricoid). The C2, C3 and C4 transverse processes lie on this line about <strong>2, 4 and 6 cm below the mastoid</strong>.${N}${cite('nysora-lm')}</p>
<p>Insert the needle <strong>perpendicular to the skin</strong> and advance slowly until it touches the <strong>transverse process</strong> (usually about 2 cm deep). Withdraw 1–2 mm, aspirate, and inject 3–5 ml. Three injections (C2, C3, C4), or a single injection at C3 or C4.${N}${cite('nysora-lm')} See <a href="#cp-deep-landmarks">the landmark figure</a> in the anatomy chapter.</p>
<p><strong>Ultrasound.</strong> Transverse behind SCM. Count the levels from C6 (big anterior tubercle) or C7 (no anterior tubercle) up to C4. The root lies in the gutter between the anterior and posterior tubercles.</p>`,
    approach: '<p>Landmark: perpendicular, to bone. Ultrasound: in-plane from posterior to anterior, onto the <strong>posterior tubercle</strong>, stopping beside the root and never medial to the tubercles.</p>',
    sonoanatomy: '<p>The transverse process looks like two bright humps (anterior and posterior tubercles) with shadows, and the round hypoechoic root between them. The vertebral artery is deep and medial, between the tubercles: always find it with colour Doppler. The phrenic nerve runs on the front of the anterior scalene, just under the prevertebral fascia.</p>',
    target: '<p>The root, outside the intervertebral foramen, deep to the prevertebral fascia. Inject slowly in 1 ml steps after aspirating, talking to the patient.</p>',
    dose: { volume: '3–5 ml', conc: '', drug: 'local anaesthetic', per: 'per level', source: `Teaching notes; one injection at C3 or C4 is an alternative.${N}${cite('nysora-lm')}`, note: 'Use the same agents as the superficial block. Tiny intra-arterial volumes can cause seizures: see below.' },
    last: 'A vertebral or carotid artery injection goes straight to the brain: 0.5 ml or less can cause a seizure. Aspirate, inject 1 ml at a time, and keep the total within the maximum.',
    coverage: {
      map: headCoverageMap,
      side: 'unilateral',
      views: ['front', 'side'],
      areas: [{ zones: ['gan', 'tcn', 'lon', 'scn'], density: 'dense' }],
      summary: 'C2–C4: the skin of the neck (as the superficial block) plus the deep muscles of the neck.',
      mechanism: `<p>A paravertebral injection at the C2–C4 roots, so it blocks both the cutaneous branches and the deep (motor) branches to the prevertebral muscles, SCM, trapezius and the scalenes.${N}</p>`,
      density: '<p>Dense when it works. The extra depth of block over the superficial technique rarely matters for surgery.</p>',
      misses: '<ul><li>The face (trigeminal nerve).</li><li>The back of the neck and the occipital scalp (dorsal rami).</li></ul>',
    },
    complications: `<ul><li><strong>Vertebral or carotid artery injection</strong> and seizures; internal jugular puncture.${N}</li><li><strong>Epidural or intrathecal injection</strong>: high or total spinal anaesthesia.${N}</li><li><strong>Phrenic nerve palsy</strong> (common with the deep block): dangerous in patients with lung disease. <strong>Never do it on both sides.</strong>${N}</li><li>Recurrent laryngeal, hypoglossal, vagus nerve and brachial plexus block; Horner’s syndrome.${N}</li><li>Conversion to general anaesthesia in about 2.5% of carotid endarterectomies.${N}</li></ul>`,
    pearls: [
      'Bone first: touch the transverse process before injecting, then come back 1–2 mm.',
      'Stay lateral: the vertebral artery and the foramen are medial to the tubercles.',
      'If you are tempted to do a deep block for carotid surgery, do an intermediate block and ask the surgeon to infiltrate instead.',
    ],
    exam: [
      {
        source: 'Practice question (viva)',
        q: '<p>Describe the landmarks for a deep cervical plexus block. What are its complications?</p>',
        points: [
          'Line from the mastoid tip to Chassaignac’s tubercle (C6). C2, C3 and C4 transverse processes about 2, 4 and 6 cm below the mastoid.',
          'Needle perpendicular to bone (about 2 cm), withdraw 1–2 mm, aspirate, 3–5 ml per level.',
          'Complications: vertebral artery injection and seizures; epidural or intrathecal spread (total spinal); phrenic nerve palsy (never bilateral); recurrent laryngeal nerve, Horner’s, brachial plexus.',
          'Superficial or intermediate block is as good for most indications and safer.',
        ],
      },
    ],
    sources: `Teaching notes${N}; NYSORA${cite('nysora-lm')}; systematic review${cite('pandit2007')}.`,
  },
];
