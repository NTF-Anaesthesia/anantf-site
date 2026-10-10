// Face: anatomy chapter and the deep trigeminal (maxillary and mandibular) blocks chapter.
import { el, fill, table, callout, registerSearch } from '../../../truncal/shared/js/ui.js';
import { viewsFigure } from '../../shared/js/head.js';

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'fa-anat-h', text: 'Anatomy: the trigeminal nerve' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>The trigeminal ganglion lies in Meckel’s cave, near the apex of the petrous temporal bone. Three divisions leave it:</p>
<ul><li><strong>Ophthalmic (V1)</strong>, sensory: through the superior orbital fissure into the orbit. Forehead, upper eyelid and the front of the nose.</li>
<li><strong>Maxillary (V2)</strong>, sensory: through the foramen rotundum and the pterygopalatine fossa, to the face through the infraorbital foramen. Lower eyelid, cheek, side of the nose, upper lip, upper teeth, palate and maxillary sinus.</li>
<li><strong>Mandibular (V3)</strong>, sensory and motor (muscles of mastication): through the foramen ovale. The temple and front of the ear, the front two-thirds of the tongue, the lower teeth and the skin over the mandible.</li></ul>
<p>Each can be blocked where it leaves the skull (V2 and V3, deep) or, more simply, where its end branches leave the facial bones (V1, V2, V3, superficial).</p>`));
  sec.append(el('h3', { id: 'fa-anat-line', text: 'Three foramina in one line' }));
  sec.append(viewsFigure({
    id: 'fa-fig-foramina',
    label: 'Front of the face with three numbered points in a vertical line through the pupil: the supraorbital notch, the infraorbital foramen and the mental foramen. Their skin territories are shaded.',
    views: [{ view: 'front', caption: 'Front (right side shaded)', areas: [{ zones: ['supraorbital', 'mental'], density: 'dense' }, { zones: ['infraorbital', 'supratrochlear'], density: 'moderate' }], points: [{ at: [78, 72], n: 1 }, { at: [79, 99], n: 2 }, { at: [82, 160], n: 3 }] }],
    key: ['<strong>Supraorbital notch</strong> (V1): on the upper orbital rim. <a href="#ch-so">Block</a>', '<strong>Infraorbital foramen</strong> (V2): about 1 cm below the lower orbital rim. <a href="#ch-io">Block</a>', '<strong>Mental foramen</strong> (V3): below the second premolar. <a href="#ch-me">Block</a>'],
    caption: 'All three lie on a vertical line through the pupil when the patient looks straight ahead. Fill patterns here separate the territories: solid supraorbital and mental, hatched supratrochlear and infraorbital.',
  }));
  sec.append(callout('pearl', { title: 'Five blocks for the whole face', body: `<p>Supraorbital, supratrochlear, infraorbital and mental blocks on both sides, with the auriculotemporal and great auricular nerves for the sides, cover the skin of almost the whole face.</p>` }));
  registerSearch([{ title: 'Foramina in the mid-pupillary line', text: 'supraorbital notch infraorbital foramen mental foramen pupil line', id: 'fa-fig-foramina' }]);
}

export function renderDeep(sec) {
  sec.append(el('p', { class: 'tb-eyebrow', text: 'Face · Deep trigeminal' }));
  sec.append(el('h2', { id: 'fa-deep-h', text: 'Maxillary and mandibular nerve blocks' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'Blocks of the whole V2 or V3 division close to the skull base, in the pterygopalatine fossa (V2) or just below the foramen ovale (V3). Deep, close to the maxillary artery, and not for beginners: learn them with an experienced colleague.'));
  sec.append(viewsFigure({
    id: 'fa-fig-deep',
    label: 'Right side of the head. Point 1 at the angle between the upper border of the zygomatic arch and the back of the orbital rim (suprazygomatic approach). Point 2 below the middle of the zygomatic arch, in the coronoid notch (infrazygomatic approach).',
    views: [{ view: 'side', caption: 'Right side', areas: [{ zones: ['infraorbital', 'zygomaticotemporal'], density: 'moderate' }, { zones: ['auriculotemporal', 'mental'], density: 'dense' }], points: [{ at: [133, 87], n: 1 }, { at: [121, 105], n: 2 }] }],
    key: ['<strong>Suprazygomatic</strong> approach to V2: the angle between the upper border of the zygomatic arch and the back of the lateral orbital rim.', '<strong>Infrazygomatic (coronoid notch)</strong> approach to V2 or V3: below the middle of the zygomatic arch, between the coronoid process and the condyle of the mandible.'],
    caption: 'Shading: V2 territory hatched (infraorbital and zygomaticotemporal), V3 solid (auriculotemporal and mental). Schematic.',
  }));
  sec.append(el('h3', { id: 'fa-deep-v2', text: 'Maxillary nerve (V2): suprazygomatic approach' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>Covers the upper jaw, upper teeth, palate, the side of the nose, the cheek and the upper lip. Its main use is <strong>cleft palate repair in children</strong>.</p>
<ul><li>The needle enters at the <strong>frontozygomatic angle</strong>, goes perpendicular to the skin until it touches the greater wing of the sphenoid, then is turned downwards and forwards into the <strong>pterygopalatine fossa</strong>.</li>
<li>With ultrasound, the probe lies below the zygomatic arch over the maxilla to watch the fossa; the needle is seen out of plane, and spread was seen in almost every block in one series of infants.</li>
<li>In a randomised trial in infants, bilateral blocks with <strong>0.15 ml/kg of 0.2% ropivacaine per side</strong> halved morphine use in the 48 hours after cleft palate repair.</li></ul>`));
  sec.append(el('h3', { id: 'fa-deep-v3', text: 'Mandibular nerve (V3): coronoid notch approach' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>Covers the lower jaw and teeth, the front two-thirds of the tongue, the floor of the mouth, the temple and the front of the ear, and relaxes the muscles of mastication. Used for jaw and tongue surgery and in the pain clinic (trigeminal neuralgia).</p>
<ul><li>The needle enters in the <strong>coronoid notch</strong>, below the middle of the zygomatic arch, perpendicular to the skin, to the <strong>lateral pterygoid plate</strong>. It is then walked off the back of the plate for V3, or the front of it (towards the pterygopalatine fossa) for V2.</li>
<li>Aspirate often: the <strong>maxillary artery</strong> is in the way. The pharynx is just medial.</li></ul>`));
  sec.append(table({
    head: ['Risk', 'Why'],
    rows: [
      [{ th: true, html: 'Intravascular injection, haematoma' }, 'Maxillary artery and pterygoid venous plexus. Arterial blood from here goes to the brain: small volumes can cause seizures.'],
      [{ th: true, html: 'Spread into the orbit' }, 'From the pterygopalatine fossa through the inferior orbital fissure: transient diplopia or visual loss (V2).'],
      [{ th: true, html: 'Subarachnoid spread' }, 'Rare: a needle advanced too far, towards the foramen ovale or the skull base.'],
      [{ th: true, html: 'Pharyngeal puncture' }, 'A needle advanced too deep, medial to the pterygoid plate.'],
    ],
  }));
  sec.append(fill(el('p', { class: 'hn-note' }), `General complications of head and neck blocks: high spinal or brainstem anaesthesia; intravascular injection and toxicity (0.5 ml or less into an artery can cause a seizure); bruising; and airway problems from block of the phrenic or recurrent laryngeal nerves.`));
  registerSearch([{ title: 'Suprazygomatic and coronoid notch approaches', text: 'pterygopalatine fossa frontozygomatic angle coronoid notch lateral pterygoid plate maxillary artery cleft palate', id: 'fa-fig-deep' }]);
}
