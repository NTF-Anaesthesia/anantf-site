// Scalp and occipital: anatomy chapter.
import { el, fill, table, callout, registerSearch } from '../../../truncal/shared/js/ui.js';
import { viewsFigure } from '../../shared/js/head.js';

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'sc-anat-h', text: 'Anatomy: the nerves of the scalp' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>The scalp has five layers (<strong>SCALP</strong>): skin, connective tissue (carrying the vessels and nerves), aponeurosis, loose areolar tissue and pericranium. The nerves run in the connective tissue layer, so they can all be reached with a shallow injection once they have come through the deep fascia.</p>`));
  sec.append(viewsFigure({
    id: 'sc-fig-territories',
    title: 'Who supplies what',
    label: 'Front, right side and back of the head showing the territories of the supraorbital, supratrochlear, zygomaticotemporal, auriculotemporal, lesser occipital and greater occipital nerves.',
    views: [
      { view: 'front', areas: [{ zones: ['supraorbital', 'auriculotemporal'], density: 'dense' }, { zones: ['supratrochlear', 'zygomaticotemporal'], density: 'moderate' }] },
      { view: 'side', areas: [{ zones: ['supraorbital', 'auriculotemporal'], density: 'dense' }, { zones: ['zygomaticotemporal', 'lon'], density: 'moderate' }, { zones: ['gon'], density: 'patchy' }] },
      { view: 'back', areas: [{ zones: ['lon'], density: 'moderate' }, { zones: ['gon'], density: 'patchy' }] },
    ],
    caption: 'Fill patterns separate neighbouring nerves here (they do not show block density). Solid: supraorbital and auriculotemporal. Hatched: supratrochlear, zygomaticotemporal and lesser occipital. Dotted: greater occipital. Schematic; territories overlap.',
  }));
  sec.append(table({
    head: ['Nerve', 'From', 'Supplies'],
    rows: [
      [{ th: true, html: 'Supraorbital' }, 'V1 (frontal nerve)', 'Forehead and scalp back to the vertex'],
      [{ th: true, html: 'Supratrochlear' }, 'V1 (frontal nerve)', 'The middle of the forehead'],
      [{ th: true, html: 'Zygomaticotemporal' }, 'V2 (zygomatic nerve)', 'A small area of forehead and temple'],
      [{ th: true, html: 'Auriculotemporal' }, 'V3', 'The temple and the front of the ear'],
      [{ th: true, html: 'Lesser occipital' }, 'C2 (cervical plexus)', 'Scalp behind the ear'],
      [{ th: true, html: 'Greater occipital' }, 'C2 (dorsal ramus)', 'The back of the scalp up to the vertex'],
      [{ th: true, html: 'Great auricular (optional)' }, 'C2–C3 (cervical plexus)', 'Over the parotid, the mastoid and most of the ear'],
    ],
  }));
  sec.append(callout('pearl', { title: 'Mnemonic', body: '<p><strong>GLASS Z</strong>: greater occipital, lesser occipital, auriculotemporal, supraorbital, supratrochlear, zygomaticotemporal.</p>' }));
  registerSearch([{ title: 'Scalp nerve territories', text: 'supraorbital supratrochlear zygomaticotemporal auriculotemporal lesser occipital greater occipital great auricular GLASS Z', id: 'sc-fig-territories' }]);
}
