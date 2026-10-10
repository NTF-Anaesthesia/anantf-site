// Cervical plexus: anatomy chapter. Original schematic drawings (../../shared/js/head.js).
import { el, fill, table, callout, registerSearch } from '../../../truncal/shared/js/ui.js';
import { viewsFigure } from '../../shared/js/head.js';

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'cp-anat-h', text: 'Anatomy: the cervical plexus' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>The cervical plexus is formed from the <strong>ventral rami of C1–C4</strong>, which join in three loops. The cutaneous (superficial) branches come from C2–C4; the deep branches supply the prevertebral muscles, help supply SCM, trapezius and the scalenes, and C3–C5 form the <strong>phrenic nerve</strong>.</p>`));

  sec.append(el('h3', { id: 'cp-anat-branches', text: 'Four cutaneous branches, one exit point' }));
  sec.append(viewsFigure({
    id: 'cp-fig-branches',
    title: 'Where the branches emerge and what they supply',
    label: 'Front and right side of the head and neck. A numbered point at the midpoint of the posterior border of sternocleidomastoid marks where the four cutaneous branches emerge. Shaded areas: great auricular and transverse cervical (dense), lesser occipital and supraclavicular (hatched).',
    views: [
      { view: 'side', areas: [{ zones: ['gan', 'tcn'], density: 'dense' }, { zones: ['lon', 'scn'], density: 'moderate' }], points: [{ at: [109, 179], n: 1 }] },
      { view: 'front', areas: [{ zones: ['gan', 'tcn'], density: 'dense' }, { zones: ['lon', 'scn'], density: 'moderate' }] },
    ],
    key: ['The midpoint of the posterior border of SCM (Erb’s point): the four branches come round the border here, about the level of the thyroid cartilage. Superficial block site.'],
    caption: 'Schematic, not to scale. Nerve territories overlap and vary.',
  }));
  sec.append(table({
    head: ['Branch', 'Roots', 'Supplies'],
    rows: [
      [{ th: true, html: 'Lesser occipital' }, 'C2', 'Scalp behind and above the ear'],
      [{ th: true, html: 'Great auricular' }, 'C2–C3', 'Angle of the jaw, skin over the parotid, most of the ear and the mastoid'],
      [{ th: true, html: 'Transverse cervical' }, 'C2–C3 (C3–C4 in some texts)', 'Front of the neck'],
      [{ th: true, html: 'Supraclavicular' }, 'C3–C4', 'Lower neck, over the clavicle, top of the shoulder and upper chest'],
    ],
  }));
  sec.append(fill(el('p', { class: 'hn-note' }), `The face (trigeminal nerve) and the back of the scalp (greater occipital nerve, a dorsal ramus) are not part of the cervical plexus.`));

  sec.append(el('h3', { id: 'cp-anat-layers', text: 'Three layers, three blocks' }));
  sec.append(table({
    head: ['Block', 'Where the local anaesthetic goes', 'What it blocks'],
    rows: [
      [{ th: true, html: '<a href="#ch-scp">Superficial</a>' }, 'Subcutaneous, superficial to the investing layer of deep cervical fascia', 'Cutaneous branches (sensory)'],
      [{ th: true, html: '<a href="#scp-inj-int">Intermediate</a>' }, 'Between the investing layer (around SCM) and the prevertebral fascia', 'Cutaneous branches (sensory), more reliably'],
      [{ th: true, html: '<a href="#ch-dcp">Deep</a>' }, 'Deep to the prevertebral fascia, at the C2–C4 roots beside the transverse processes', 'Cutaneous and deep (motor) branches; often the phrenic nerve'],
    ],
  }));
  sec.append(fill(el('p', { class: 'hn-note' }), `Terms vary between papers: some call the intermediate block a “superficial” block. Ask which layer is meant.`));

  sec.append(el('h3', { id: 'cp-deep-landmarks', text: 'Deep cervical plexus landmarks' }));
  sec.append(viewsFigure({
    id: 'cp-fig-deep',
    label: 'Right side of the neck. A dashed line runs from the mastoid tip to Chassaignac’s tubercle; numbered points 2, 3 and 4 cm apart mark C2, C3 and C4.',
    views: [{ view: 'side', caption: 'Right side', points: [
      { at: [86, 126], line: [[86, 126], [104, 167], [118, 200]] },
      { at: [92, 140], n: 1 }, { at: [98, 153], n: 2 }, { at: [104, 167], n: 3 },
    ] }],
    key: ['C2: about 2 cm below the mastoid tip, on the line to Chassaignac’s tubercle.', 'C3: about 4 cm below.', 'C4: about 6 cm below.'],
    caption: `The line runs from the mastoid tip to Chassaignac’s tubercle (C6), just behind the posterior border of SCM.`,
  }));

  sec.append(callout('pearl', {
    title: 'For the viva',
    body: '<p>“The four cutaneous branches of C2–C4 emerge together at the midpoint of the posterior border of sternocleidomastoid. I block them there, superficial to the prevertebral fascia. A deep block is a paravertebral injection at the roots: it adds the motor branches and the phrenic nerve, and the risk of vertebral artery and intrathecal injection.”</p>',
  }));

  registerSearch([
    { title: 'Erb’s point (posterior border of SCM)', text: 'Erb point midpoint posterior border sternocleidomastoid cervical plexus branches emerge', id: 'cp-fig-branches' },
    { title: 'Deep cervical plexus landmarks', text: 'mastoid Chassaignac tubercle C6 line C2 C3 C4 2 4 6 cm', id: 'cp-fig-deep' },
  ]);
}
