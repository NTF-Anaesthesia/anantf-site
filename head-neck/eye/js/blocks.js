// Eye: block data (schema: ../../../truncal/shared/DATA.md, "Block schema").
// Technique and doses follow the department's teaching notes; values the notes do not give carry a citation.
import { cite } from '../../../truncal/shared/js/refs.js';
import { SCENES } from './scenes.js';

export const REFS = [
  { id: 'notes', text: 'NTF Anaesthesia. Topical and regional anaesthesia for eye surgery: teaching notes (internal teaching material).' },
  { id: 'parness2005', text: 'Parness G, Underhill S. Regional anaesthesia for intraocular surgery. <i>Contin Educ Anaesth Crit Care Pain</i> 2005;5(3):93–97.', url: 'https://doi.org/10.1093/bjaceaccp/mki025', label: 'doi:10.1093/bjaceaccp/mki025' },
  { id: 'kumar2006', text: 'Kumar CM, Miller NR. Ophthalmic regional block. <i>Ann Acad Med Singap</i> 2006;35(3):158–167.', url: 'https://doi.org/10.47102/annals-acadmedsg.V35N3p158', label: 'doi:10.47102/annals-acadmedsg.V35N3p158' },
  { id: 'kumar2011', text: 'Kumar CM, Eid H, Dodds C. Sub-Tenon’s anaesthesia: complications and their prevention. <i>Eye</i> 2011;25(6):694–703.', url: 'https://doi.org/10.1038/eye.2011.69', label: 'doi:10.1038/eye.2011.69' },
  { id: 'hamilton1995', text: 'Hamilton RC. Techniques of orbital regional anaesthesia. <i>Br J Anaesth</i> 1995;75(1):88–92.', url: 'https://doi.org/10.1093/bja/75.1.88', label: 'doi:10.1093/bja/75.1.88' },
];

const N = cite('notes');
const EYE_LAST = 'Even a small volume injected into an artery or under the optic nerve sheath reaches the brain: monitor ECG, blood pressure and oxygen saturation, keep talking to the patient, and have resuscitation equipment ready.';

const drugs = `<p><strong>Lidocaine 2%</strong> (5–10 ml gives about 90 minutes), often mixed with <strong>bupivacaine 0.75%</strong> for a longer block; no stronger than 2% lidocaine because of muscle toxicity. <strong>Hyaluronidase</strong> (commonly 1–7.5 units/ml) helps the local anaesthetic spread, lowers orbital pressure and improves the block. Adrenaline is usually avoided.${N}</p>`;

export const BLOCKS = [
  {
    id: 'peri',
    kicker: 'Eye · Needle blocks',
    title: 'Peribulbar and retrobulbar blocks',
    summary: `Needle blocks that give <strong>anaesthesia and akinesia</strong> of the eye. A <strong>peribulbar</strong> block puts a larger volume <strong>outside</strong> the muscle cone; a <strong>retrobulbar</strong> block puts a smaller volume <strong>inside</strong> it, close to the optic nerve. The retrobulbar block is now rarely used because of its risks.${N} In Singapore these blocks are usually done by ophthalmologists; the anaesthetist must know the technique and manage the complications.${N}`,
    indications: ['Intraocular surgery needing a still eye: vitreoretinal surgery, complex cataract, trabeculectomy', 'When topical anaesthesia is not suitable'],
    glance: {
      position: 'Supine, looking straight ahead',
      probe: 'None: landmarks',
      needle: '25G; about 25 mm (peribulbar), longer for retrobulbar',
      dose: 'Peribulbar 8–10 ml; retrobulbar 4–5 ml',
      covers: 'Globe anaesthesia and akinesia (peribulbar also the lids)',
    },
    scene: SCENES.peri,
    position: '<p>Supine, head on a pillow, <strong>looking straight ahead</strong> (looking up and in brings the optic nerve closer to the needle). Full monitoring and an intravenous cannula.</p>',
    equipment: [`25G needle: about 16–25 mm for peribulbar; needles longer than 25 mm carry more risk to the optic nerve, but shorter needles do not remove it.${N}`, 'Local anaesthetic with hyaluronidase; a soft pad or Honan balloon'],
    landmarksTitle: 'Landmarks and technique',
    landmarks: `<p><strong>Peribulbar.</strong> Through the lower lid (or conjunctiva), <strong>inferotemporally, lateral to the lateral limbus</strong>. Straight back, <strong>parallel to the orbital floor</strong>, to about 25 mm; if you touch bone, angle slightly up. The tip lies outside the cone, beyond the equator of the globe but in front of its back surface. Aspirate, inject 8–10 ml. Brisk conjunctival swelling means the tip is too superficial. Press gently, then test after 5 minutes.${N}</p>
<p><strong>Supplementary injections</strong> (up to 5 ml) if movement remains: <strong>medial canthus</strong> (through the conjunctiva medial to the caruncle, parallel to the medial wall) or <strong>superonasal</strong> (through the upper lid above the medial limbus, aiming away from the globe).${N}</p>
<p><strong>Retrobulbar.</strong> Same entry point, bevel facing the globe; straight back until the equator is passed (10–15 mm), then up and medially into the cone, to the level of the back of the globe. Keep the tip from crossing medial to the axis of the globe: the optic nerve is in the medial half. Aspirate, inject 4–5 ml, then press. A separate lid block may be needed.${N}</p>`,
    sonoanatomy: `<p>The orbit is a pyramid about 40–50 mm deep, about 30 ml in volume, its axis pointing back and medially to the apex. The globe and muscle cone take up about 7 ml; the rest is fat. The <strong>axial length</strong> of the globe is about 25 mm (12–35 mm). Long eyes (myopia, axial length over 25 mm) are easier to perforate.${N}</p>`,
    target: '<p>Peribulbar: the extraconal fat beyond the equator. Retrobulbar: the intraconal fat at the back of the globe. Both work by local anaesthetic reaching the nerves to the extraocular muscles (III, IV, VI) and the sensory nerves (V1) in and around the cone.</p>',
    dose: { html: '<span class="tb-dose-v">8–10 ml</span> peribulbar; <span class="tb-dose-v">4–5 ml</span> retrobulbar', source: `Teaching notes.${N}`, note: 'Supplementary injections up to 5 ml.' },
    last: EYE_LAST,
    coverage: {
      map: false,
      summary: 'Anaesthesia and akinesia of the globe. A peribulbar block usually also stops the eyelids closing (orbicularis oculi).',
      mechanism: `<p>Akinesia needs III (superior, inferior and medial recti, inferior oblique), IV (superior oblique) and VI (lateral rectus): <strong>LR6 SO4</strong>, the rest III. Sensation is mainly from V1 (nasociliary, lacrimal and frontal branches).${N}</p>`,
      density: `<p>Retrobulbar: faster and more reliable, with a smaller volume, lower orbital pressure and less chemosis. Peribulbar: slower (at least 5 minutes) and a bigger volume, so more chemosis and a bigger rise in intraocular pressure, but fewer serious complications and better lid akinesia.${N}</p>`,
      misses: '<ul><li>The lids, after a retrobulbar block (a separate facial nerve or lid block may be needed).</li><li>Superior oblique movement is often the last to go: a supplementary injection may be needed.</li></ul>',
    },
    complications: `<ul><li><strong>Brainstem anaesthesia</strong>: local anaesthetic under the optic nerve sheath reaches the brainstem. Confusion, apnoea, cardiovascular collapse, sometimes after a delay: ventilate and support.${N}</li><li><strong>Intravascular injection</strong>: seizures and cardiovascular collapse.${N}</li><li><strong>Retrobulbar haemorrhage</strong> (1–2%): sudden proptosis, a tense eye and lid. Tell the surgeon at once; the pressure may need urgent relief. Watch the ECG: the oculocardiac reflex can fire.${N}</li><li><strong>Globe perforation</strong> (under 1%): more likely with long myopic eyes. Pain and loss of vision, or no symptoms; a soft eye. Injecting into the globe can be catastrophic.${N}</li><li><strong>Optic nerve injury</strong> (under 1%), extraocular muscle injury (later squint), chemosis, corneal abrasion.${N}</li></ul>`,
    pearls: [
      'Looking straight ahead keeps the optic nerve away from the needle; looking up and in brings it closer.',
      'Stay lateral (inferotemporal) and do not cross the axis of the globe.',
      'Check the axial length before the block: over 25 mm, think about a sub-Tenon’s or topical technique.',
    ],
    exam: [
      {
        source: 'Practice question (viva)',
        q: '<p>Compare peribulbar and retrobulbar blocks. What are the serious complications and how would you manage brainstem anaesthesia?</p>',
        points: [
          'Peribulbar: extraconal, 8–10 ml, slower onset, more chemosis and pressure, fewer serious complications, better lid akinesia.',
          'Retrobulbar: intraconal, 4–5 ml, faster and denser, closer to the optic nerve: optic nerve injury, retrobulbar haemorrhage, brainstem anaesthesia.',
          'Others: globe perforation (long myopic eyes), intravascular injection, muscle injury.',
          'Brainstem anaesthesia: call for help, airway and ventilation (it may cause apnoea), circulatory support; it wears off as the local anaesthetic is redistributed.',
        ],
      },
    ],
    sources: `Teaching notes${N}; reviews${cite('parness2005', 'kumar2006', 'hamilton1995')}.`,
    sections: [{ id: 'drugs', title: 'Drugs for eye blocks', html: drugs }],
  },
  {
    id: 'st',
    kicker: 'Eye · Cannula block',
    title: 'Sub-Tenon’s block',
    summary: `Local anaesthetic through a <strong>blunt cannula</strong> into the potential space between <strong>Tenon’s capsule</strong> and the sclera. It spreads round the back of the globe into the cone. No sharp needle goes into the back of the orbit, so the risk of perforation, optic nerve injury and brainstem anaesthesia is even lower.${N}`,
    indications: ['Cataract and most intraocular surgery', 'Patients on anticoagulants (major bleeding is rare)', 'Long myopic eyes, where a needle block is riskier'],
    glance: {
      position: 'Supine, looking up and out',
      probe: 'None: direct vision',
      needle: 'Blunt curved 19G sub-Tenon’s cannula, 25 mm',
      dose: '4–5 ml (2–3 ml more if needed)',
      covers: 'Globe anaesthesia; akinesia varies with the volume',
    },
    scene: SCENES.st,
    position: '<p>Supine. The operator stands at the head; the patient looks <strong>up and out</strong> to expose the inferonasal quadrant.</p>',
    equipment: ['Topical local anaesthetic drops; povidone-iodine 5%', 'Small lid speculum, non-toothed forceps, blunt spring scissors', 'Blunt curved 19G sub-Tenon’s cannula (25 mm)'],
    landmarksTitle: 'Technique',
    landmarks: `<ol><li>Topical anaesthetic into the lower fornix (a drop of adrenaline 1:10 000 reduces bleeding), then povidone-iodine 5%.${N}</li><li>Speculum in. Patient looks up and out.${N}</li><li>In the <strong>inferonasal quadrant</strong>, lift the conjunctiva and Tenon’s capsule together and make an opening <strong>no more than 2 mm</strong> wide down to the sclera, 5–10 mm from the limbus.${N}${cite('kumar2011')}</li><li>Pass the cannula through the opening and follow the curve of the globe, staying on the sclera, to <strong>15–20 mm</strong>, behind the equator.${N}</li><li>Aspirate and inject <strong>4–5 ml</strong> slowly; 2–3 ml more if akinesia is not enough. Gentle pressure on the closed eye.${N}</li></ol>`,
    target: '<p>The sub-Tenon’s space behind the equator. If the fluid leaks back out of the opening, the cannula is not far enough back.</p>',
    dose: { volume: '4–5 ml', conc: '', drug: 'local anaesthetic', per: '(2–3 ml more if needed)', source: `Teaching notes.${N}` },
    last: EYE_LAST,
    coverage: {
      map: false,
      summary: 'Anaesthesia of the globe; akinesia depends on the volume.',
      mechanism: `<p>The local anaesthetic spreads round the back of the globe in the sub-Tenon’s space and diffuses into the retrobulbar space, reaching the sensory and motor nerves.${N}</p>`,
      density: `<p>Reliable anaesthesia. Akinesia is variable and volume-dependent; onset is slower than a retrobulbar block (at least 5 minutes).${N}</p>`,
      misses: '<ul><li>Full akinesia with small volumes.</li></ul>',
    },
    complications: `<ul><li><strong>Chemosis and subconjunctival haemorrhage</strong> (common): can get in the surgeon’s way.${N}</li><li><strong>Leak</strong> from the opening: a weaker block.${N}</li><li>Rare but reported: orbital and retrobulbar haemorrhage, globe perforation, central spread, orbital cellulitis.${N}${cite('kumar2011')}</li><li>Avoid after previous surgery that scars the space (scleral buckle, retinal or glaucoma surgery).${N}</li></ul>`,
    sources: `Teaching notes${N}; review${cite('kumar2011')}.`,
  },
];
