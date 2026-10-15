/* Head and neck operations: the data behind the "Which block for which operation" chooser on /head-neck/ and the
   merged chooser on /blocks/. Data only, plus headNeckCoverageMap(), the head figure the chooser draws for an operation.
   No sources or references are shown on the page.

   Schema (one entry per operation):
     id       deep link #op-<id> on the head and neck landing
     name     chooser label and result title
     cover    {text}: the area to cover
     map      {side: 'unilateral'|'bilateral'|'midline', views, areas: [{zones, density}]}: head.js zones (optional;
              the eye operations have none)
     groups   [{label, items: [{name, blocks: [LINKS key], why?}]}]; a label starting "Not" is shown as not recommended
     notes    [{text}]
   Links are relative to the region folder (REGION.path); blockHref(key, base) adds a base. */
import { headCoverageMap } from '../figures/head.js?v=20261015'; // same URL as the head-neck pages: one module instance

export const REGION = { id: 'head-neck', title: 'Head and neck blocks', path: 'head-neck/' };

/* Where each block lives: [href, link text, page name]; href is page + chapter (or element) anchor. */
export const LINKS = {
  scp: ['cervical/#ch-scp', 'superficial and intermediate cervical plexus', 'cervical plexus'],
  dcp: ['cervical/#ch-dcp', 'deep cervical plexus', 'cervical plexus'],
  bp: ['../brachial-plexus/', 'brachial plexus', 'brachial plexus'],
  scalp: ['scalp/#ch-scalp', 'scalp block', 'scalp'],
  gon: ['scalp/#ch-gon', 'greater occipital', 'scalp'],
  so: ['face/#ch-so', 'supraorbital', 'face'],
  io: ['face/#ch-io', 'infraorbital', 'face'],
  me: ['face/#ch-me', 'mental', 'face'],
  v2: ['face/#fa-deep-v2', 'maxillary nerve', 'face'],
  topical: ['airway/#ch-topical', 'topical anaesthesia', 'airway'],
  sln: ['airway/#ch-sln', 'superior laryngeal', 'airway'],
  ttb: ['airway/#ch-ttb', 'transtracheal', 'airway'],
  gpn: ['airway/#ch-gpn', 'glossopharyngeal', 'airway'],
  eyetop: ['eye/#ch-topical', 'topical (eye)', 'eye'],
  st: ['eye/#ch-st', 'sub-Tenon’s', 'eye'],
  peri: ['eye/#ch-peri', 'peribulbar', 'eye'],
};

export const OPS = [
  {
    id: 'cea', name: 'Carotid endarterectomy (awake)',
    cover: { text: 'C2–C4 skin of the neck on the operated side, plus deep infiltration by the surgeon' },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['gan', 'tcn'], density: 'dense' }, { zones: ['lon', 'scn'], density: 'moderate' }] },
    groups: [
      { label: 'First choice', items: [{ name: 'Superficial or intermediate cervical plexus block, with the surgeon’s infiltration', blocks: ['scp'] }] },
      { label: 'Not recommended', items: [{ name: 'Deep cervical plexus block', blocks: ['dcp'], why: 'More serious complications and more conversions to general anaesthesia, without a better block for this operation.' }] },
    ],
    notes: [
      { text: 'The awake patient is the neurological monitor while the carotid is clamped.' },
      { text: 'Local and general anaesthesia had the same 30-day outcomes in the GALA trial: choose by the patient and the team.' },
      { text: 'Plan how you would convert to general anaesthesia with the head under the drapes.' },
    ],
  },
  {
    id: 'thyroid', name: 'Thyroid or parathyroid surgery',
    cover: { text: 'Front of the neck, both sides' },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['tcn'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral superficial cervical plexus block', blocks: ['scp'], why: 'A small reduction in pain scores and opioid use: part of multimodal analgesia.' }] }],
    notes: [{ text: 'Never do a deep cervical plexus block on both sides (bilateral phrenic nerve block).' }],
  },
  {
    id: 'clavicle', name: 'Clavicle fracture fixation',
    cover: { text: 'Skin over the clavicle (supraclavicular nerves, C3–C4); the bone also has C5–C6 supply' },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['scn'], density: 'dense' }] },
    groups: [{ label: 'Usual combination', items: [
      { name: 'Intermediate cervical plexus block', blocks: ['scp'], why: 'For the skin over the clavicle.' },
      { name: 'Plus an interscalene or superior trunk block', blocks: ['bp'], why: 'For the deeper C5–C6 supply. Both blocks risk the phrenic nerve: check the patient’s breathing.' },
    ] }],
    notes: [{ text: 'Keep the total volume down: the two injections are close together and add up.' }],
  },
  {
    id: 'craniotomy', name: 'Craniotomy, head pins or awake craniotomy',
    cover: { text: 'The scalp on the side of the incision and the pins (both sides for a bifrontal or midline incision)' },
    map: { side: 'unilateral', views: ['front', 'side', 'back'], areas: [{ zones: ['scalp'], density: 'dense' }] },
    groups: [{ label: 'First choice', items: [{ name: 'Scalp block', blocks: ['scalp'], why: 'Blunts the response to pinning and incision, allows awake craniotomy with light sedation, and gives analgesia afterwards.' }] }],
    notes: [
      { text: 'Do it before the pins go in.' },
      { text: 'Add the surgeon’s infiltration at the pin sites and along the incision; the dura is not covered.' },
    ],
  },
  {
    id: 'posterior', name: 'Posterior craniotomy or VP shunt',
    cover: { text: 'The back of the scalp (C2) and behind the ear' },
    map: { side: 'unilateral', views: ['side', 'back'], areas: [{ zones: ['gon'], density: 'dense' }, { zones: ['lon'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Greater and lesser occipital nerve blocks', blocks: ['gon'] }] }],
    notes: [{ text: 'Ultrasound at C2 (on obliquus capitis inferior) is more reliable than the landmark technique, because the nerve’s position on the superior nuchal line varies.' }],
  },
  {
    id: 'forehead', name: 'Forehead or frontal scalp surgery',
    cover: { text: 'Forehead and scalp to the vertex' },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['supraorbital', 'supratrochlear'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Supraorbital and supratrochlear nerve blocks', blocks: ['so'] }] }],
    notes: [{ text: 'Block both sides for a wound that crosses the midline.' }],
  },
  {
    id: 'cleftlip', name: 'Cleft lip repair (child)',
    cover: { text: 'Upper lip and the side of the nose, both sides' },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['infraorbital'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral infraorbital nerve blocks', blocks: ['io'], why: 'Widely used; better analgesia than opioids alone in trials, but the evidence is low quality.' }] }],
    notes: [{ text: 'Use a weight-based dose; both sides.' }],
  },
  {
    id: 'cleftpalate', name: 'Cleft palate repair (child)',
    cover: { text: 'The palate (maxillary nerve, V2), both sides' },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['infraorbital', 'zygomaticotemporal'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral suprazygomatic maxillary nerve blocks', blocks: ['v2'], why: '0.15 ml/kg of 0.2% ropivacaine per side halved morphine use in a randomised trial in infants.' }] }],
    notes: [{ text: 'A deep block near the maxillary artery: learn it with an experienced colleague.' }, { text: 'The map shows the skin branches of V2; the block also covers the palate and upper teeth.' }],
  },
  {
    id: 'lowerlip', name: 'Lower lip or chin surgery',
    cover: { text: 'Lower lip and chin' },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['mental'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Mental nerve block', blocks: ['me'] }] }],
    notes: [{ text: 'Both sides for the middle of the lip.' }],
  },
  {
    id: 'ati', name: 'Awake tracheal intubation',
    cover: { text: 'Nose (if nasal), mouth and pharynx, larynx, cords and trachea' },
    map: { side: 'midline', views: ['airway'], areas: [{ zones: ['nose', 'tongue', 'oropharynx', 'supraglottis', 'subglottis'], density: 'dense' }] },
    groups: [
      { label: 'Mainstay', items: [{ name: 'Topical anaesthesia (spray-as-you-go, atomiser, nebuliser)', blocks: ['topical'], why: 'Total lidocaine within 9 mg/kg.' }] },
      { label: 'Add if needed', items: [
        { name: 'Superior laryngeal nerve blocks', blocks: ['sln'], why: 'The larynx above the cords.' },
        { name: 'Transtracheal block', blocks: ['ttb'], why: 'The cords and trachea; also for trismus.' },
        { name: 'Glossopharyngeal nerve blocks', blocks: ['gpn'], why: 'The gag reflex.' },
      ] },
    ],
    notes: [{ text: 'Check the topical anaesthesia works before you start.' }, { text: 'All the lidocaine counts towards the maximum: sprays, nebuliser and blocks.' }],
  },
  {
    id: 'cataract', name: 'Cataract surgery',
    cover: { text: 'The cornea and conjunctiva; a still eye is usually not needed' },
    groups: [
      { label: 'Usual choice', items: [{ name: 'Topical anaesthesia, with intracameral lidocaine if needed', blocks: ['eyetop'] }] },
      { label: 'When topical is not enough', items: [{ name: 'Sub-Tenon’s block', blocks: ['st'] }] },
    ],
    notes: [{ text: 'Topical anaesthesia suits patients on anticoagulants and those with only one seeing eye.' }],
  },
  {
    id: 'vr', name: 'Vitreoretinal or other long eye surgery',
    cover: { text: 'Anaesthesia and akinesia of the globe' },
    groups: [{ label: 'Options', items: [
      { name: 'Sub-Tenon’s block', blocks: ['st'], why: 'Lowest risk of the injection techniques; akinesia depends on the volume.' },
      { name: 'Peribulbar block', blocks: ['peri'], why: 'Reliable akinesia; more chemosis and pressure.' },
    ] }],
    notes: [{ text: 'In Singapore these blocks are usually done by ophthalmologists; the anaesthetist monitors and manages complications.' }],
  },
];


export const BLOCK_LINKS = Object.fromEntries(Object.entries(LINKS).map(([k, [href]]) => [k, href]));
export const BLOCK_NAMES = Object.fromEntries(Object.entries(LINKS).map(([k, [, name]]) => [k, name]));
export const PAGE_NAMES = { 'cervical/': 'cervical plexus', 'scalp/': 'scalp', 'face/': 'face', 'airway/': 'airway', 'eye/': 'eye', '../brachial-plexus/': 'brachial plexus' };

/** URL of a block: base '' (default) is relative to /head-neck/; pass '../head-neck/' or '/head-neck/' from elsewhere. */
export const blockHref = (key, base = '') => (LINKS[key] ? base + LINKS[key][0] : null);

/** The head figure for an operation (null for operations without a map, e.g. the eye). */
export function headNeckCoverageMap(op, { id = 'hn-op-map', title = op?.name } = {}) {
  if (!op?.map) return null;
  return headCoverageMap({ ...op.map, summary: op.cover.text }, { id, title });
}
