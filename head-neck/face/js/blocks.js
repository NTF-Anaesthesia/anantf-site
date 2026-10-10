// Face: block data (schema: ../../../truncal/shared/DATA.md, "Block schema").
import { headCoverageMap } from '../../shared/js/head.js';
import { SCENES } from './scenes.js';

const common = {
  position: '<p>Supine, head in the midline. Ask the patient to look straight ahead so you can line up the pupil.</p>',
  equipment: ['High-frequency linear probe (a small “hockey stick” probe fits the face best)', '25–27G needle', '1–2 ml of local anaesthetic per nerve, with or without adrenaline'],
  approach: '<p>A fine needle to the tissue <strong>just outside the foramen</strong>, in-plane or out-of-plane. Never inject into the foramen or canal: the nerve is trapped in bone there, so an intraneural injection is more likely.</p>',
  complications: `<ul><li><strong>Bruising and swelling</strong>, the commonest problems: use a fine needle and press afterwards.</li><li><strong>Intravascular injection</strong>: each nerve travels with an artery. Aspirate. Arteries of the face run to the brain, so even small volumes can cause toxicity.</li><li><strong>Nerve injury</strong> from injecting into the foramen.</li></ul>`,
};

export const BLOCKS = [
  {
    id: 'so',
    kicker: 'Face · V1',
    title: 'Supraorbital and supratrochlear nerve blocks',
    summary: `The two branches of the frontal nerve (V1) leave the orbit over the upper orbital rim: the <strong>supraorbital</strong> nerve through its notch in line with the pupil, the <strong>supratrochlear</strong> nerve about 1 cm medial to it. Between them they supply the forehead and the scalp back to the vertex.`,
    indications: ['Forehead and frontal scalp lacerations and lesions', 'Frontal craniotomy (part of a scalp block)', 'Frontal headache (pain clinic)'],
    glance: { position: 'Supine, looking ahead', probe: 'Linear, transverse along the eyebrow', needle: '25–27G', dose: '1–2 ml per nerve', covers: 'Forehead and scalp to the vertex (one side)' },
    scene: SCENES.so,
    ...common,
    landmarks: `<p>Feel the <strong>supraorbital notch</strong> on the upper orbital rim in line with the pupil, and inject just above it. Then move 1 cm medially, to the bridge of the nose, for the supratrochlear nerve. On ultrasound, the notch is a gap in the bright bone line with the supraorbital artery pulsing in it.</p>`,
    dose: { volume: '1–2 ml', conc: '', drug: 'local anaesthetic', per: 'per nerve' },
    coverage: {
      map: headCoverageMap, side: 'unilateral', views: ['front', 'side'],
      areas: [{ zones: ['supraorbital', 'supratrochlear'], density: 'dense' }],
      summary: 'The forehead and scalp back to the vertex, on one side.',
      mechanism: `<p>Both nerves are superficial as they cross the orbital rim, so a small volume reaches them.</p>`,
      density: '<p>Reliable for skin surgery. Block both sides for a midline wound.</p>',
      misses: '<ul><li>The temple (zygomaticotemporal and auriculotemporal nerves).</li><li>The nose below the bridge (external nasal and infraorbital nerves).</li></ul>',
    },
    pearls: ['Keep a finger on the orbital rim: the needle stays above it.', 'One puncture can reach both: inject at the notch, then fan 1 cm medially.'],
  },
  {
    id: 'io',
    kicker: 'Face · V2',
    title: 'Infraorbital nerve block',
    summary: `The infraorbital nerve, the end of the maxillary nerve (V2), leaves the <strong>infraorbital foramen</strong> about 1 cm below the lower orbital rim, in line with the pupil. It supplies the lower eyelid, the cheek, the side of the nose and the upper lip.`,
    indications: ['Cleft lip repair in children (both sides)', 'Upper lip and nose surgery, lacerations', 'Endoscopic sinus and nasal surgery (part of multimodal analgesia)'],
    glance: { position: 'Supine, looking ahead', probe: 'Linear, transverse below the orbital rim', needle: '25–27G; extraoral or intraoral', dose: '1–2 ml (adult)', covers: 'Lower lid, cheek, side of the nose, upper lip' },
    scene: SCENES.io,
    ...common,
    landmarks: `<p>Feel the <strong>foramen</strong> about 1 cm below the middle of the lower orbital rim, in line with the pupil. <strong>Extraoral:</strong> insert the needle just below it, keeping a finger on the orbital rim. <strong>Intraoral:</strong> lift the upper lip and insert the needle in the gum–lip fold above the canine or first premolar, aiming up towards the finger on the foramen. On ultrasound, the foramen is a gap in the bright maxilla.</p>`,
    dose: { volume: '1–2 ml', conc: '', drug: 'local anaesthetic', per: 'per side (adult)', note: 'Less in children: use a weight-based dose.' },
    coverage: {
      map: headCoverageMap, side: 'unilateral', views: ['front', 'side'],
      areas: [{ zones: ['infraorbital'], density: 'dense' }],
      summary: 'Lower eyelid, cheek, side of the nose and upper lip on one side.',
      mechanism: '<p>The nerve fans out to the face as soon as it leaves the foramen, so one injection at the foramen covers all its branches.</p>',
      density: `<p>Reliable for skin and lip surgery. Bilateral infraorbital blocks are widely used for cleft lip repair in children; trials suggest better analgesia than opioids alone, but the evidence is low quality.</p>`,
      misses: '<ul><li>The teeth and gums of the upper jaw beyond the front teeth, and the palate (other branches of V2, given off before the foramen).</li><li>The midline of the lip, unless both sides are blocked.</li></ul>',
    },
    pearls: ['A finger on the orbital rim protects the eye.', 'For cleft lip, block both sides.'],
  },
  {
    id: 'me',
    kicker: 'Face · V3',
    title: 'Mental nerve block',
    summary: `The mental nerve, the end of the inferior alveolar nerve (V3), leaves the <strong>mental foramen</strong> below the second premolar, in line with the pupil. It supplies the lower lip and chin.`,
    indications: ['Lower lip and chin lacerations and lesions'],
    glance: { position: 'Supine, looking ahead', probe: 'Linear, transverse over the mandible', needle: '25–27G; extraoral or intraoral', dose: '1–2 ml', covers: 'Lower lip and chin (one side)' },
    scene: SCENES.me,
    ...common,
    landmarks: '<p>The foramen is below the second premolar, halfway between the gum and the lower border of the mandible, in line with the pupil. <strong>Intraoral:</strong> insert the needle in the gum–lip fold at the second premolar. On ultrasound, the foramen is a gap in the bright mandible.</p>',
    dose: { volume: '1–2 ml', conc: '', drug: 'local anaesthetic', per: 'per side' },
    coverage: {
      map: headCoverageMap, side: 'unilateral', views: ['front', 'side'],
      areas: [{ zones: ['mental'], density: 'dense' }],
      summary: 'Lower lip and chin on one side.',
      mechanism: '<p>As for the infraorbital nerve: one injection at the foramen covers the branches to the lip and chin.</p>',
      density: '<p>Reliable for skin. The lower teeth are not covered (they are supplied inside the bone, before the foramen).</p>',
      misses: '<ul><li>The lower teeth and the tongue.</li><li>The other side of the lip.</li></ul>',
    },
  },
];
