// Scalp and occipital: block data (schema: ../../../truncal/shared/DATA.md, "Block schema").
// Technique and doses follow the department's teaching notes; values the notes do not give carry a citation.
import { cite } from '../../../truncal/shared/js/refs.js';
import { headCoverageMap, viewsFigure } from '../../shared/js/head.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'notes', text: 'NTF Anaesthesia. Head and neck regional anaesthesia: teaching notes (internal teaching material).' },
  { id: 'osborn2010', text: 'Osborn I, Sebeo J. “Scalp block” during craniotomy: a classic technique revisited. <i>J Neurosurg Anesthesiol</i> 2010;22(3):187–194.', url: 'https://doi.org/10.1097/ANA.0b013e3181d48846', label: 'doi:10.1097/ANA.0b013e3181d48846' },
  { id: 'greher2010', text: 'Greher M, Moriggl B, Curatolo M, Kirchmair L, Eichenberger U. Sonographic visualization and ultrasound-guided blockade of the greater occipital nerve: a comparison of two selective techniques confirmed by anatomical dissection. <i>Br J Anaesth</i> 2010;104(5):637–642.', url: 'https://doi.org/10.1093/bja/aeq052', label: 'doi:10.1093/bja/aeq052' },
];

const N = cite('notes');

/** The seven injection sites, numbered to match the key. */
export function scalpPointsFigure() {
  return viewsFigure({
    id: 'scalp-fig-points',
    title: 'The seven injection sites (right side)',
    label: 'Front, right side and back of the head with seven numbered injection sites for a scalp block on the right side.',
    views: [
      { view: 'front', points: [{ at: [94, 74], n: 1 }, { at: [74, 69], n: 2 }, { at: [53, 79], n: 3 }] },
      { view: 'side', points: [{ at: [139, 84], n: 3 }, { at: [113, 97], n: 4 }, { at: [79, 100], n: 5 }] },
      { view: 'back', points: [{ at: [137, 119], n: 6 }, { at: [115, 114], n: 7 }] },
    ],
    key: [
      '<strong>Supratrochlear</strong> (V1): above the medial end of the eyebrow, at the bridge of the nose.',
      '<strong>Supraorbital</strong> (V1): at the supraorbital notch, on the upper orbital rim in line with the pupil.',
      '<strong>Zygomaticotemporal</strong> (V2): from the lateral orbital rim back along the top of the zygomatic arch, deep and superficial to temporalis fascia.',
      '<strong>Auriculotemporal</strong> (V3): 1–1.5 cm in front of the tragus, behind the superficial temporal artery.',
      '<strong>Great auricular</strong> (C2–C3, optional): about 1.5 cm behind the ear at the level of the tragus.',
      '<strong>Lesser occipital</strong> (C2): a third of the way along the superior nuchal line from the mastoid to the occipital protuberance; infiltrate up behind the ear.',
      '<strong>Greater occipital</strong> (C2): two-thirds of the way from the mastoid to the occipital protuberance, just medial to the occipital artery.',
    ],
    caption: `Sites as in the teaching notes.${N}${cite('osborn2010')} Schematic, not to scale.`,
  });
}

export const BLOCKS = [
  // ------------------------------------------------------------------ scalp block
  {
    id: 'scalp',
    kicker: 'Scalp · Landmark',
    title: 'Scalp block',
    summary: `Small volumes of local anaesthetic at the <strong>six or seven nerves that supply the scalp</strong>, where each one becomes superficial: three branches of the trigeminal nerve in front and two (or three) branches of C2–C3 behind.${N} An anatomical block, not a ring of infiltration.`,
    indications: ['Awake craniotomy', 'Head pins (Mayfield) and skin incision under general anaesthesia: blunts the blood pressure surge', 'Analgesia after craniotomy', 'Scalp lacerations and lesions'],
    glance: {
      position: 'Supine, head turned or in pins; all sites reachable',
      probe: 'None: landmarks',
      needle: '25–27G, 25–40 mm',
      dose: 'About 2–5 ml at each site; 20–30 ml in total',
      covers: 'The whole scalp, one side per set of injections',
    },
    intro: (() => { const d = document.createElement('div'); d.append(scalpPointsFigure()); return d.innerHTML; })(),
    position: '<p>Supine, before the head is fixed in pins, or with the head turned to reach the back. Block both sides for a bifrontal or midline incision.</p>',
    equipment: [
      'Fine needle (25–27G), long enough to fan along the superior nuchal line',
      `Local anaesthetic with adrenaline, for example lidocaine 0.75% with bupivacaine 0.25% and adrenaline 1:200 000.${N}`,
      'Monitoring: injections around the face and occiput are close to vessels',
    ],
    landmarksTitle: 'Landmarks and injections',
    landmarks: `<ol><li><strong>Supraorbital</strong>: feel the supraorbital notch and inject just above it, perpendicular to the eyebrow.${N}</li><li><strong>Supratrochlear</strong>: just medial to the supraorbital injection, at the bridge of the nose.${N}</li><li><strong>Zygomaticotemporal</strong>: infiltrate from the lateral orbital rim back along the top of the zygomatic arch. The nerve runs through temporalis, so inject both <strong>deep and superficial</strong> to the temporalis fascia: the hardest nerve to block.${N}</li><li><strong>Auriculotemporal</strong>: 1 cm in front of and 1 cm above the tragus, feel the superficial temporal artery and inject <strong>just behind it</strong>. Stay above the tragus: the facial nerve is close below.${N}</li><li><strong>Great auricular</strong> (optional): usually covered by the lesser occipital injection, 1.5–2 cm behind the ear at the level of the tragus.${N}</li><li><strong>Lesser occipital</strong>: infiltrate behind the ear from the top of the ear to the lobule, then back along the superior nuchal line.${N}</li><li><strong>Greater occipital</strong>: feel the occipital artery about two-thirds of the way from the mastoid to the external occipital protuberance, on the superior nuchal line, and inject <strong>just medial to it</strong>.${N}</li></ol>`,
    approach: `<p>Aspirate before each injection: the scalp is very vascular. Press on each site for a minute afterwards to spread the local anaesthetic and stop bruising.${N}</p>`,
    target: `<p>Each nerve where it becomes subcutaneous. The alternative is a <strong>ring block</strong>: infiltrate all the way round the head above a line from the occipital protuberance to the eyebrows, along the top of the ears. That takes about 30 ml.${N}</p>`,
    dose: { html: '<span class="tb-dose-v">2–5 ml</span> per site; <span class="tb-dose-v">20–30 ml</span> in total for one or both sides', source: `Teaching notes; ring block about 30 ml.${N}`, note: 'With adrenaline 1:200 000. Absorption from the scalp is fast, so add up the total for both sides and any surgical infiltration.' },
    coverage: {
      map: headCoverageMap,
      side: 'unilateral',
      views: ['front', 'side', 'back'],
      areas: [
        { zones: ['supraorbital', 'supratrochlear', 'auriculotemporal', 'gon', 'lon'], density: 'dense' },
        { zones: ['zygomaticotemporal'], density: 'moderate' },
        { zones: ['gan'], density: 'patchy' },
      ],
      summary: 'The scalp on one side: forehead to vertex (V1), temple (V2, V3) and the back of the head (C2).',
      mechanism: `<p>Every nerve to the scalp becomes superficial on a line around the head, so each can be reached with a few millilitres.${N} The trigeminal branches supply the front and sides; the occipital nerves (C2–C3) the back.</p>`,
      density: `<p>Dense skin and pericranial analgesia when all sites are injected; enough for an awake craniotomy with sedation.${cite('osborn2010')} The dura and brain are not covered: the surgeon infiltrates the dura near the middle meningeal artery if needed.</p>`,
      misses: '<ul><li>The dura and temporalis muscle (deep), unless the zygomaticotemporal injection goes deep to the temporalis fascia.</li><li>The other side, for a midline or bifrontal incision.</li></ul>',
    },
    complications: `<ul><li><strong>Bruising and haematoma</strong> are the commonest problems; press after each injection.${N}</li><li><strong>Intravascular injection and local anaesthetic toxicity</strong>: the scalp is very vascular; aspirate, use adrenaline, and keep within the maximum dose.${N}</li><li><strong>Facial nerve block</strong> (temporary facial weakness) from an auriculotemporal injection that is too low or deep.${N}</li><li>A transient rise in heart rate and blood pressure from the adrenaline.</li></ul>`,
    pearls: [
      'The mnemonic GLASS Z: greater occipital, lesser occipital, auriculotemporal, supraorbital, supratrochlear and zygomaticotemporal.',
      'Do the block before the pins go in: it blunts the haemodynamic response to pinning and incision.',
      'For an awake craniotomy, ask the surgeon to infiltrate the pin sites and the incision as well.',
    ],
    sections: [
      {
        id: 'awake', title: 'Awake craniotomy',
        html: `<p>Used when the patient has to talk or move during the operation: tumours near the speech or motor cortex, epilepsy surgery and deep brain stimulation.${N} The scalp block makes pinning, incision and the craniotomy bearable with light sedation, and gives analgesia afterwards.${cite('osborn2010')}</p>`,
      },
    ],
    exam: [
      {
        source: 'Practice question (viva)',
        q: '<p>Name the nerves you block for a scalp block, and where you find each one.</p>',
        points: [
          'Front (trigeminal): supraorbital and supratrochlear (V1) at the orbital rim; zygomaticotemporal (V2) along the lateral orbital rim and zygomatic arch; auriculotemporal (V3) in front of the tragus behind the superficial temporal artery.',
          'Back (C2–C3): greater occipital medial to the occipital artery on the superior nuchal line; lesser occipital behind the ear; great auricular optional.',
          'Small volumes (2–5 ml) with adrenaline; aspirate; press; total about 20–30 ml.',
          'Complications: haematoma, intravascular injection and toxicity, facial nerve block.',
        ],
      },
    ],
    sources: `Teaching notes${N}; review${cite('osborn2010')}.`,
  },

  // ------------------------------------------------------------------ greater (and lesser) occipital
  {
    id: 'gon',
    kicker: 'Scalp · Occipital',
    title: 'Greater occipital nerve block',
    summary: `The greater occipital nerve (C2) supplies the back of the scalp up to the vertex.${N} Block it on the <strong>superior nuchal line</strong> with landmarks, or more proximally at <strong>C2</strong> with ultrasound, where it crosses obliquus capitis inferior.${N}${cite('greher2010')}`,
    indications: ['Posterior craniotomy and VP shunt insertion or revision', 'Headache: occipital neuralgia, cervicogenic headache, migraine (pain clinic)', 'Part of a scalp block'],
    glance: {
      position: 'Sitting with the neck flexed, or prone or lateral',
      probe: 'Linear, along obliquus capitis inferior at C2 (ultrasound)',
      needle: '25–27G (landmark) or 50 mm (ultrasound), in-plane, lateral to medial',
      dose: '1–3 ml (landmark); 2–3 ml (ultrasound at C2)',
      covers: 'The back of the scalp, from the occipital protuberance to the vertex',
    },
    scene: SCENES.gon,
    position: '<p>Sitting with the neck flexed and the forehead resting on a table, or prone, or lateral with the side to be blocked uppermost.</p>',
    equipment: ['25–27G needle for the landmark technique; a 50 mm needle and a linear probe for the ultrasound technique', `1–3 ml of local anaesthetic per side.${N}`],
    landmarks: `<p><strong>Landmark (distal).</strong> The nerve lies about <strong>two-thirds of the way along a line from the mastoid to the external occipital protuberance</strong>, on the superior nuchal line, <strong>just medial to the occipital artery</strong> (easy to feel). Insert the needle at 90° to the occiput, aspirate and inject 1–3 ml; press on the site afterwards. Numbness over the top of the head shows success.${N} The nerve’s position varies widely between people (1.5–7.5 cm from the midline), which is why blind blocks sometimes fail.${N}</p>
<p><strong>Ultrasound (proximal, at C2).</strong> Find the bifid C2 spinous process, then move laterally along obliquus capitis inferior. Here the nerve’s relation to the muscle is constant: it crosses the <strong>superficial surface of obliquus capitis inferior</strong>.${N}${cite('greher2010')}</p>`,
    approach: '<p>Ultrasound: in-plane, lateral to medial, to the plane between semispinalis capitis and obliquus capitis inferior.</p>',
    target: `<p>Distal: medial to the occipital artery at the superior nuchal line. Proximal: the nerve on top of obliquus capitis inferior, beneath semispinalis capitis.${cite('greher2010')}</p>`,
    dose: { volume: '1–3 ml', conc: '', drug: 'local anaesthetic', per: 'per side', source: `Teaching notes.${N}` },
    coverage: {
      map: headCoverageMap,
      side: 'unilateral',
      views: ['side', 'back'],
      areas: [{ zones: ['gon'], density: 'dense' }, { zones: ['lon'], density: 'patchy' }],
      summary: 'The back of the scalp from the occipital protuberance to the vertex.',
      mechanism: `<p>The nerve leaves between C1 and C2, curves round obliquus capitis inferior, runs up through semispinalis capitis and trapezius, and becomes subcutaneous just below the superior nuchal line, medial to the occipital artery.${N}</p>`,
      density: '<p>Dense in the nerve’s territory when the injection is right. The proximal (C2) ultrasound approach is more reliable because the nerve is in the same place in most people.</p>',
      misses: `<ul><li><strong>Behind the ear</strong>: the lesser occipital nerve. Block it a third of the way along the same line from the mastoid, or infiltrate behind the ear.${N}</li><li>The upper neck (C3 and below).</li></ul>`,
    },
    complications: `<ul><li>Few, because the nerve is superficial. <strong>Intravascular injection</strong> (occipital artery): aspirate.${N}</li><li>At C2: the <strong>vertebral artery</strong> lies deep to obliquus capitis inferior laterally, and the <strong>spinal cord</strong> deep and medially. Keep the tip superficial to the muscle.${N}</li></ul>`,
    pearls: [
      'Feel for the occipital artery first: the nerve is just medial to it.',
      'The lesser occipital nerve is a third of the way from the mastoid; the greater occipital two-thirds.',
    ],
    exam: [
      {
        source: 'Practice question (OSCE)',
        q: '<p>Describe how you would block the greater occipital nerve for a posterior fossa craniotomy.</p>',
        points: [
          'Landmark: superior nuchal line, two-thirds from the mastoid to the occipital protuberance, medial to the occipital artery; 1–3 ml after aspiration; press.',
          'Ultrasound at C2: bifid C2 spinous process, slide laterally along obliquus capitis inferior; nerve on the superficial surface of OCI; in-plane; 2–3 ml.',
          'Add the lesser occipital nerve (a third of the way from the mastoid) for the area behind the ear.',
          'Risks at C2: vertebral artery deep and lateral, spinal cord deep and medial.',
        ],
      },
    ],
    sources: `Teaching notes${N}; proximal technique${cite('greher2010')}.`,
  },
];
