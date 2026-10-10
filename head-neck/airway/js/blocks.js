// Airway: block data (schema: ../../../truncal/shared/DATA.md, "Block schema").
// Technique and doses follow the department's teaching notes; values the notes do not give carry a citation.
import { cite } from '../../../truncal/shared/js/refs.js';
import { headCoverageMap } from '../../shared/js/head.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'notes', text: 'NTF Anaesthesia. Airway topicalisation and regional anaesthesia for awake intubation: teaching notes (internal teaching material).' },
  { id: 'das2020', text: 'Ahmad I, El-Boghdadly K, Bhagrath R, Hodzovic I, McNarry AF, Mir F, et al. Difficult Airway Society guidelines for awake tracheal intubation (ATI) in adults. <i>Anaesthesia</i> 2020;75(4):509–528.', url: 'https://doi.org/10.1111/anae.14904', label: 'doi:10.1111/anae.14904' },
  { id: 'kaur2012', text: 'Kaur B, Tang R, Sawka A, Krebs C, Vaghadia H. A method for ultrasonographic visualization and injection of the superior laryngeal nerve: volunteer study and cadaver simulation. <i>Anesth Analg</i> 2012;115(5):1242–1245.', url: 'https://doi.org/10.1213/ANE.0b013e318265f75d', label: 'doi:10.1213/ANE.0b013e318265f75d' },
];

const N = cite('notes');
const LIDO = 'All the lidocaine counts: sprays, nebuliser, blocks and transtracheal injection together. Keep the total within 9 mg/kg (adults; 4.5 mg/kg in children).';

export const BLOCKS = [
  // ------------------------------------------------------------------ superior laryngeal
  {
    id: 'sln',
    kicker: 'Airway · Above the cords',
    title: 'Superior laryngeal nerve block',
    summary: `The <strong>internal branch of the superior laryngeal nerve</strong> (X) supplies the larynx above the vocal cords: the base of the tongue, the back of the epiglottis, the aryepiglottic folds and the arytenoids. It pierces the <strong>thyrohyoid membrane</strong> 2–4 mm below the greater cornu of the hyoid.${N}`,
    indications: ['Awake tracheal intubation (both sides), when topical anaesthesia alone is not enough', 'Awake laryngoscopy and laryngeal procedures'],
    glance: {
      position: 'Supine, neck slightly extended',
      probe: 'Linear, parasagittal between the hyoid and thyroid cartilage (or landmarks)',
      needle: '25G',
      dose: '2 ml of 2% lidocaine per side',
      covers: 'The larynx above the vocal cords',
    },
    scene: SCENES.sln,
    position: `<p>Supine with the <strong>neck slightly extended</strong>, so you can feel the hyoid.${N}</p>`,
    equipment: ['25G needle; linear probe if using ultrasound', `2 ml of 2% lidocaine per side (1–2 ml with ultrasound).${N}`],
    landmarks: `<p><strong>Landmark (external) approach.</strong> Feel the hyoid and push it gently towards the side you are blocking. Insert the needle from the side, aiming at the <strong>greater cornu</strong>. Once you touch it, walk the needle <strong>off its lower edge</strong> and inject 2 ml: this blocks both the internal and external branches. Advance a few millimetres more and you feel a “give” through the thyrohyoid membrane; injecting there blocks only the internal branch.${N}</p>
<p>If the hyoid is hard to feel, use the <strong>superior cornu of the thyroid cartilage</strong> instead (follow the upper edge of the thyroid cartilage back from the notch), walk off it upwards, and inject 2 ml through the membrane and 2 ml as you withdraw.${N}</p>
<p><strong>Ultrasound.</strong> Useful when the landmarks are hard to feel. Find the greater cornu of the hyoid and the thyrohyoid membrane; the nerve runs with the <strong>superior laryngeal artery</strong> just below the greater cornu. Inject 1–2 ml there.${N}${cite('kaur2012')}</p>
<p><strong>Without a needle (internal approach):</strong> gauze soaked in local anaesthetic held in each <strong>piriform fossa</strong> with Krause’s forceps for 5–10 minutes.${N}</p>`,
    approach: '<p>Ultrasound: in-plane from caudal, or out-of-plane. Aim just below the greater cornu, superficial to the thyrohyoid membrane, beside the artery.</p>',
    target: '<p>The space between the thyrohyoid muscle and the thyrohyoid membrane, just below the greater cornu. The success rate with ultrasound is over 90%; failures are put down to variation in the nerve’s position.' + N + '</p>',
    dose: { volume: '2 ml', conc: '2%', drug: 'lidocaine', per: 'per side', source: `Teaching notes; 1–2 ml with ultrasound.${N}`, note: 'Both sides.' },
    last: LIDO,
    coverage: {
      map: headCoverageMap, side: 'midline', views: ['airway'],
      areas: [{ zones: ['supraglottis'], density: 'dense' }],
      summary: 'The larynx above the vocal cords (both sides blocked).',
      mechanism: '<p>The internal branch carries sensation from the larynx above the cords; it is blocked where it goes through the thyrohyoid membrane.</p>',
      density: '<p>Dense when both sides are blocked. Combine with topical anaesthesia of the mouth and pharynx and a transtracheal block (or spray-as-you-go) for the cords and trachea.</p>',
      misses: '<ul><li>The vocal cords and trachea (recurrent laryngeal nerve): add a <a href="#ch-ttb">transtracheal block</a>.</li><li>The oropharynx and the gag reflex (glossopharyngeal nerve).</li><li>The nose.</li></ul>',
    },
    complications: `<ul><li><strong>Intravascular injection</strong>: the superior laryngeal artery is next to the nerve and the carotid is nearby. Aspirate.${N}</li><li><strong>Aspiration risk</strong>: the larynx above the cords can no longer protect the airway. Use with care in a patient with a full stomach.${N}</li></ul>`,
    pearls: ['Push the hyoid towards the side you are blocking: the greater cornu becomes easier to feel.', 'The external branch is motor to cricothyroid; blocking it can change the voice. That is expected.'],
    exam: [
      {
        source: 'Practice question (viva)',
        q: '<p>Describe the sensory supply of the airway. Which nerves would you block for an awake fibreoptic intubation, and how?</p>',
        points: [
          'Nose: anterior ethmoidal (V1) and palatine nerves (V2). Topical (co-phenylcaine, soaked pledgets).',
          'Mouth and pharynx: lingual (V3) front of tongue; glossopharyngeal (IX) back of tongue, vallecula, front of epiglottis, tonsils, gag reflex; vagus (X) pharyngeal walls.',
          'Larynx above the cords: internal superior laryngeal nerve (X). Block at the greater cornu of the hyoid, 2 ml 2% lidocaine each side.',
          'Cords and trachea: recurrent laryngeal nerve (X). Never block it directly (bilateral cord palsy). Use a transtracheal injection of 4% lidocaine or spray-as-you-go.',
          'Total lidocaine within 9 mg/kg.',
        ],
      },
    ],
    sources: `Teaching notes${N}; ultrasound technique${cite('kaur2012')}.`,
  },

  // ------------------------------------------------------------------ transtracheal
  {
    id: 'ttb',
    kicker: 'Airway · Below the cords',
    title: 'Transtracheal (translaryngeal) block',
    summary: `The <strong>recurrent laryngeal nerve</strong> supplies the vocal cords and trachea. It is never blocked directly: its motor and sensory fibres run together, so a block on both sides would paralyse both cords. Instead, local anaesthetic is injected <strong>into the trachea through the cricothyroid membrane</strong>.${N}`,
    indications: ['Awake tracheal intubation', 'Trismus or limited mouth opening, where sprays can’t reach the larynx'],
    glance: {
      position: 'Supine, neck extended',
      probe: 'Linear, longitudinal in the midline (or landmarks)',
      needle: '20–22G, on a syringe',
      dose: '5 ml of 4% lidocaine',
      covers: 'Vocal cords and trachea (and some spread above the cords with coughing)',
    },
    scene: SCENES.ttb,
    position: `<p>Supine with the <strong>neck extended</strong>. Feel the thyroid cartilage in the midline and move down to the cricoid; the membrane is the dip between them, just above the cricoid. Stabilise the larynx with thumb and middle finger.${N}</p>`,
    equipment: ['20 or 22G needle on a 5 or 10 ml syringe', `5 ml of 4% lidocaine.${N}`],
    landmarks: `<p>Feel, or find with ultrasound, the <strong>cricothyroid membrane</strong>. With the probe longitudinal in the midline, count up from the tracheal rings to the cricoid, then the membrane, then the thyroid cartilage; mark the membrane on the skin.${N}</p>`,
    approach: `<p><strong>Perpendicular to the skin in the midline</strong>, aspirating continuously. Air bubbles mean you are in the trachea: stop advancing, so the needle does not hit the back wall of the trachea.${N}</p>`,
    target: `<p>The lumen of the trachea, just below the cords. Inject quickly; the cough that follows spreads the local anaesthetic.${N}</p>`,
    dose: { volume: '5 ml', conc: '4%', drug: 'lidocaine', per: '(200 mg)', source: `Teaching notes.${N}` },
    last: LIDO,
    coverage: {
      map: headCoverageMap, side: 'midline', views: ['airway'],
      areas: [{ zones: ['subglottis'], density: 'dense' }, { zones: ['supraglottis'], density: 'patchy' }],
      summary: 'The vocal cords and the trachea; some spread above the cords with coughing.',
      mechanism: '<p>Topical anaesthesia from inside the airway, spread by the cough.</p>',
      density: '<p>Dense for the cords and trachea. Above the cords it is patchy: add a superior laryngeal block or spray-as-you-go.</p>',
      misses: '<ul><li>The nose, mouth and pharynx.</li></ul>',
    },
    complications: '<ul><li><strong>Bleeding</strong> into the airway; <strong>puncture of the back wall</strong> of the trachea or oesophagus if the needle is advanced after air is aspirated.</li><li><strong>Coughing</strong>: undesirable with an unstable neck, raised intracranial or intraocular pressure.</li><li>Loss of airway reflexes: a risk with a full stomach.</li></ul>',
    pearls: ['Finding the cricothyroid membrane with ultrasound is the same skill you need for an emergency front-of-neck airway. Practise it.', 'Warn the patient that they will cough.'],
    sources: `Teaching notes${N}.`,
  },

  // ------------------------------------------------------------------ glossopharyngeal
  {
    id: 'gpn',
    kicker: 'Airway · Oropharynx',
    title: 'Glossopharyngeal nerve block',
    summary: `The glossopharyngeal nerve (IX) supplies the back third of the tongue, the vallecula, the front of the epiglottis and the tonsils, and is the sensory limb of the <strong>gag reflex</strong>. It is easiest to block where it runs along the base of the <strong>palatoglossal and palatopharyngeal arches</strong> (the tonsillar pillars).${N} This abolishes the gag, but on its own is not enough for an awake intubation.${N}`,
    indications: ['Awake fibreoptic intubation through the mouth, when the gag reflex is a problem', 'Awake laryngoscopy, tonsillar procedures'],
    glance: {
      position: 'Sitting or supine, mouth open',
      probe: 'None: intraoral landmarks',
      needle: '22–25G (or soaked gauze)',
      dose: '2 ml of 2% lidocaine per side (intraoral)',
      covers: 'Back of the tongue, vallecula, tonsils; the gag reflex',
    },
    position: '<p>Mouth open wide enough to see the base of the tonsillar pillars. Spray the mouth with lidocaine first.</p>',
    equipment: ['Tongue depressor or a laryngoscope blade', '22–25G needle, or ribbon gauze soaked in local anaesthetic'],
    landmarksTitle: 'Technique',
    landmarks: `<p><strong>Intraoral.</strong> After topical spray, push the tongue to the other side with a tongue depressor. Insert the needle submucosally at the <strong>base of the posterior tonsillar pillar</strong> (or the anterior pillar), about 0.5 cm lateral to the side of the tongue where it meets the floor of the mouth. Aspirate, then inject <strong>2 ml of 2% lidocaine</strong>. Repeat on the other side.${N}</p>
<p><strong>Without a needle:</strong> hold gauze soaked in local anaesthetic firmly on the same spot for a few minutes. Safer (no risk of carotid injection) but less effective.${N}</p>
<p><strong>Peristyloid approach</strong> (rarely used): the styloid process lies halfway along a line from the angle of the jaw to the mastoid tip. Touch it (1–2 cm deep), walk off it posteriorly, and inject after aspirating. The internal carotid artery is right there.${N}</p>`,
    dose: { volume: '2 ml', conc: '2%', drug: 'lidocaine', per: 'per side (intraoral)', source: `Teaching notes.${N}` },
    last: LIDO,
    coverage: {
      map: headCoverageMap, side: 'midline', views: ['airway'],
      areas: [{ zones: ['oropharynx'], density: 'dense' }],
      summary: 'Back of the tongue, vallecula, front of the epiglottis, tonsils; the gag reflex.',
      mechanism: '<p>The nerve is just under the mucosa at the base of the tonsillar pillars.</p>',
      density: '<p>Abolishes the gag reflex. Does not cover the larynx.</p>',
      misses: '<ul><li>The larynx above and below the cords.</li><li>The front of the tongue (lingual nerve) and the nose.</li></ul>',
    },
    complications: `<ul><li><strong>Carotid artery injection</strong>: the internal carotid is close behind the tonsillar pillar. Aspirate before injecting.${N}</li><li>Loss of the gag and swallowing reflexes: aspiration risk.</li></ul>`,
    sources: `Teaching notes${N}.`,
  },
];
