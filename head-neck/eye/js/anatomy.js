// Eye: anatomy, topical anaesthesia and comparison chapters.
import { el, fill, table, callout, keyPoints, registerSearch } from '../../../truncal/shared/js/ui.js';

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'ey-anat-h', text: 'Anatomy: the orbit and its nerves' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>Each orbit is an irregular <strong>pyramid</strong>: its base at the front, its apex pointing back and medially to the optic foramen. It is 40–50 mm deep and holds about 30 ml, of which the globe and the muscle cone take about 7 ml; the rest is loose connective tissue and fat. The four recti run from the apex to the globe and form the <strong>muscle cone</strong>. Inside the cone (intraconal) run the optic nerve, the ophthalmic artery and the nerves to the muscles; outside it (extraconal) is more fat.</p>`));
  sec.append(table({
    head: ['Function', 'Nerves', 'Remember'],
    rows: [
      [{ th: true, html: 'Movement (akinesia)' }, 'III: superior, inferior and medial recti, inferior oblique. IV: superior oblique. VI: lateral rectus.', '<strong>LR6 SO4</strong>; III, IV and VI all need blocking for a still eye'],
      [{ th: true, html: 'Sensation' }, 'V1: nasociliary, lacrimal and frontal branches, through the superior orbital fissure', 'Pain from the cornea: Aδ and C fibres in V1'],
      [{ th: true, html: 'Vision' }, 'II (optic nerve)', 'Often temporarily lost after a needle block'],
      [{ th: true, html: 'Lid closure' }, 'VII (orbicularis oculi)', 'Peribulbar blocks usually reach it; retrobulbar may not'],
      [{ th: true, html: 'Autonomic' }, 'Parasympathetic from the Edinger–Westphal nucleus with III, via the ciliary ganglion; sympathetic from T1 via the superior cervical ganglion', ''],
    ],
  }));
  sec.append(fill(el('p', { class: 'hn-note' }), `The ophthalmic artery (from the internal carotid) enters through the optic canal; in elderly and hypertensive patients it is tortuous and easy to injure.`));
  sec.append(callout('key', { title: 'Axial length', body: `<p>The distance from the cornea to the retina, about 25 mm in adults (12–35 mm), measured before cataract surgery. Long (myopic) eyes are more easily perforated.</p>` }));
}

export function renderTopical(sec) {
  sec.append(el('h2', { id: 'ey-top-h', text: 'Topical anaesthesia and choosing a technique' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), `Drops or gel on the cornea and conjunctiva: the simplest technique, and enough on its own for short, uncomplicated surgery such as phacoemulsification through a small corneal incision.`));
  sec.append(keyPoints([
    `Drops or gel: for example tetracaine 0.75%, proxymetacaine (proparacaine) 0.5% or lidocaine 2% gel. Gel gives more drug in the anterior chamber, but put it on after the antiseptic.`,
    `Put drops into the conjunctival sac, not straight onto the cornea: they can cloud it.`,
    `The surgeon may add <strong>intracameral</strong> preservative-free lidocaine 1% into the anterior chamber, for the discomfort of hydrodissection.`,
  ], { title: 'Technique' }));
  sec.append(el('h3', { id: 'ey-compare', text: 'Which technique' }));
  sec.append(table({
    head: ['', 'Topical', 'Sub-Tenon’s', 'Peribulbar', 'Retrobulbar'],
    rows: [
      [{ th: true, html: 'Akinesia' }, 'None', 'Variable, volume-dependent', 'Good', 'Good, fast'],
      [{ th: true, html: 'Onset' }, 'Immediate', 'At least 5 min', 'At least 5 min', 'Fast'],
      [{ th: true, html: 'Volume' }, 'Drops', '4–5 ml', '8–10 ml', '4–5 ml'],
      [{ th: true, html: 'Serious complications' }, 'None', 'Rare', 'Uncommon', 'Highest'],
      [{ th: true, html: 'Best for' }, 'Short cataract surgery; anticoagulated; only one seeing eye', 'Most intraocular surgery; anticoagulated', 'Surgery needing a still eye', 'Now rarely used'],
      [{ th: true, html: 'Downsides' }, 'Eye moves; needs a cooperative patient; short; may need sedation', 'Chemosis, subconjunctival haemorrhage, leak', 'Chemosis, raised pressure', 'Optic nerve injury, haemorrhage, brainstem anaesthesia'],
    ],
  }));
  sec.append(fill(el('p', { class: 'hn-note' }), `No large trials compare the techniques for safety or effectiveness; the choice is often personal preference.`));
  sec.append(el('h3', { id: 'ey-ci', text: 'When not to do a block' }));
  sec.append(table({
    head: ['Absolute', 'Relative'],
    rows: [[
      '<ul><li>Patient refusal</li><li>Local anaesthetic allergy</li><li>Infection or marked inflammation of the orbit</li></ul>',
      '<ul><li>Long myopic eye</li><li>Can’t lie flat or still (heart or lung disease, tremor, confusion)</li><li>Children; communication difficulties</li><li>Bleeding problems or anticoagulation (many still block if the INR is in range; prefer sub-Tenon’s or topical)</li><li>Previous scleral buckle; thyroid eye disease or other orbital masses</li></ul>',
    ]],
  }));
  sec.append(callout('warn', { title: 'Intraocular pressure', body: `<p>Any injection into the orbit raises the pressure on the globe. Watch for proptosis and feel the eye. Gentle compression (for example a Honan balloon at 20–30 mmHg, never over 30) brings it down; some anaesthetists wait up to 30 minutes before surgery.</p>` }));
  registerSearch([{ title: 'Topical, sub-Tenon’s, peribulbar or retrobulbar', text: 'compare technique topical tetracaine intracameral sub-Tenon peribulbar retrobulbar akinesia anticoagulated contraindications', id: 'ey-compare' }]);
}
