// Airway: anatomy and topical anaesthesia chapters.
import { el, fill, table, callout, keyPoints, registerSearch } from '../../../truncal/shared/js/ui.js';
import { headCoverageMap } from '../../shared/js/head.js';

export function renderAnatomy(sec) {
  sec.append(el('h2', { id: 'aw-anat-h', text: 'Anatomy: sensory supply of the airway' }));
  sec.append(fill(el('div', { class: 'tb-prose' }), `<p>Three cranial nerves supply the airway: the <strong>trigeminal (V)</strong>, the <strong>glossopharyngeal (IX)</strong> and the <strong>vagus (X)</strong>.</p>`));
  const fig = headCoverageMap({
    side: 'midline', views: ['airway'],
    areas: [{ zones: ['nose', 'oropharynx', 'subglottis'], density: 'dense' }, { zones: ['tongue', 'supraglottis'], density: 'moderate' }],
    summary: 'Sensory supply of the airway.',
  }, { id: 'aw-anat-map', title: 'the airway' });
  fig.querySelector('.tb-cov-legend')?.remove();
  fig.append(el('p', { class: 'hn-note', text: 'Fill patterns here separate neighbouring regions only (solid: nose, oropharynx, cords and trachea; hatched: tongue and larynx above the cords). Midline section, schematic.' }));
  sec.append(el('div', { class: 'tb-cov-grid' }, fig, table({
    head: ['Region', 'Nerve', 'How to anaesthetise it'],
    rows: [
      [{ th: true, html: 'Nose' }, 'Anterior ethmoidal (V1); greater and lesser palatine (V2), via the pterygopalatine (sphenopalatine) ganglion behind the middle turbinate', 'Co-phenylcaine spray; soaked pledgets or cotton applicators'],
      [{ th: true, html: 'Front two-thirds of the tongue' }, 'Lingual (V3)', 'Spray, gargle, paste'],
      [{ th: true, html: 'Back of the tongue, vallecula, front of the epiglottis, tonsils' }, 'Glossopharyngeal (IX)', 'Spray the tonsillar pillars; <a href="#ch-gpn">glossopharyngeal block</a>'],
      [{ th: true, html: 'Pharyngeal walls' }, 'Vagus (X), pharyngeal branch', 'Spray the walls'],
      [{ th: true, html: 'Larynx above the cords' }, 'Internal superior laryngeal (X)', 'Spray-as-you-go; <a href="#ch-sln">superior laryngeal block</a>'],
      [{ th: true, html: 'Cords and trachea' }, 'Recurrent laryngeal (X)', 'Spray-as-you-go; <a href="#ch-ttb">transtracheal block</a>'],
    ],
  })));
  registerSearch([{ title: 'Airway innervation map', text: 'trigeminal glossopharyngeal vagus superior laryngeal recurrent laryngeal lingual ethmoidal palatine', id: 'aw-anat-map' }]);
}

export function renderTopical(sec) {
  sec.append(el('h2', { id: 'aw-top-h', text: 'Topical anaesthesia for awake intubation' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), `Topical anaesthesia is the mainstay of awake tracheal intubation; nerve blocks are added when it is not enough.`));
  sec.append(keyPoints([
    `<strong>Maximum topical lidocaine: 9 mg/kg</strong> in adults (4.5 mg/kg in children). About 25% is absorbed from the upper airway, which is why this is higher than the dose for infiltration.`,
    `Clear blood, secretions and vomit first: the drug has to touch the mucosa.`,
    `<strong>Trismus:</strong> sprays and blocks inside the mouth may be impossible. Use nebulised lidocaine or a transtracheal injection.`,
    `Check the topical anaesthesia works before you start (for example, a gentle suction catheter or oral airway is tolerated).`,
  ], { title: 'Before you start' }));
  sec.append(el('h3', { id: 'aw-top-drugs', text: 'Drugs' }));
  sec.append(table({
    head: ['Preparation', 'Strength', 'Notes'],
    rows: [
      [{ th: true, html: 'Lidocaine solution' }, '1%, 2% or 4%', 'Spray-as-you-go, nebuliser, atomiser, transtracheal'],
      [{ th: true, html: 'Lidocaine spray' }, '10% (10 mg per spray)', 'Count the sprays'],
      [{ th: true, html: 'Co-phenylcaine' }, 'Lidocaine 5% with phenylephrine 0.5%: 5 mg lidocaine and 0.5 mg phenylephrine per spray', 'Nose: anaesthesia and vasoconstriction together'],
      [{ th: true, html: 'Lidocaine gel or paste' }, '', 'Applicators and pledgets'],
      [{ th: true, html: 'Cocaine' }, '5% or 10%; maximum 1.5 mg/kg', 'The only local anaesthetic that is also a vasoconstrictor; more cardiovascular side effects'],
      [{ th: true, html: 'Vasoconstrictor' }, 'Xylometazoline or phenylephrine', 'Essential in the nose: less bleeding and more room. Allow time to work.'],
    ],
  }));
  sec.append(el('h3', { id: 'aw-top-ways', text: 'Ways to apply it' }));
  sec.append(table({
    head: ['Method', 'How', 'Good for'],
    rows: [
      [{ th: true, html: 'Nebuliser' }, '5 ml of 4% lidocaine with oxygen over up to 30 minutes; patient sitting up', 'Whole airway, non-invasive; trismus'],
      [{ th: true, html: 'Spray from the container' }, 'Long nozzle into the nose and mouth', 'Nose and oropharynx'],
      [{ th: true, html: 'Atomiser (MAD)' }, 'Mist from a device on the end of a syringe', 'Nose and mouth'],
      [{ th: true, html: 'McKenzie technique' }, '20G cannula joined by a three-way tap to oxygen tubing at 2–4 l/min; inject lidocaine slowly through the top port for a jet spray', 'Directed spray to the nose and mouth'],
      [{ th: true, html: 'Spray-as-you-go' }, '2% or 4% lidocaine through the working channel of the scope, or an epidural catheter fed down it', 'Larynx, cords and trachea, under vision'],
      [{ th: true, html: 'Direct contact' }, 'Ribbon gauze or cotton applicators soaked in local anaesthetic or paste', 'Targeted: nose, tonsillar pillars, piriform fossae'],
    ],
  }));
  sec.append(callout('warn', { title: 'Topical anaesthesia removes protective reflexes', body: `<p>Cough and swallow are blunted, so the patient can aspirate. Topical anaesthesia of the pharynx can also cause brief airway obstruction, from loss of the reflexes that keep the glottis open.</p>` }));
  registerSearch([{ title: 'Topical lidocaine maximum dose', text: 'lidocaine 9 mg/kg topical maximum co-phenylcaine nebuliser 4% spray as you go McKenzie atomiser cocaine', id: 'aw-top-h' }]);
}
