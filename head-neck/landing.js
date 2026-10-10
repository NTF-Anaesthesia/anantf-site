/* Head and neck blocks landing page: "Which block for which operation" chooser.
   Sources: 'notes' = the department's teaching notes, 'derived' = worked out from the anatomy,
   any other key = a reference in the page's References list (<li id="ref-KEY">). */
import { headCoverageMap } from './shared/js/head.js';

/* Where each block lives: page + chapter (or element) anchor. */
const BLOCK_LINKS = {
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

const OPS = [
  {
    id: 'cea', name: 'Carotid endarterectomy (awake)',
    cover: { text: 'C2–C4 skin of the neck on the operated side, plus deep infiltration by the surgeon', src: ['notes', 'pandit'] },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['gan', 'tcn'], density: 'dense' }, { zones: ['lon', 'scn'], density: 'moderate' }] },
    groups: [
      { label: 'First choice', items: [{ name: 'Superficial or intermediate cervical plexus block, with the surgeon’s infiltration', blocks: ['scp'], src: ['notes', 'pandit'] }] },
      { label: 'Not recommended', items: [{ name: 'Deep cervical plexus block', blocks: ['dcp'], why: 'More serious complications and more conversions to general anaesthesia, without a better block for this operation.', src: ['pandit'] }] },
    ],
    notes: [
      { text: 'The awake patient is the neurological monitor while the carotid is clamped.', src: ['notes'] },
      { text: 'Local and general anaesthesia had the same 30-day outcomes in the GALA trial: choose by the patient and the team.', src: ['gala'] },
      { text: 'Plan how you would convert to general anaesthesia with the head under the drapes.', src: [] },
    ],
  },
  {
    id: 'thyroid', name: 'Thyroid or parathyroid surgery',
    cover: { text: 'Front of the neck, both sides', src: ['derived'] },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['tcn'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral superficial cervical plexus block', blocks: ['scp'], why: 'A small reduction in pain scores and opioid use: part of multimodal analgesia.', src: ['mayhew'] }] }],
    notes: [{ text: 'Never do a deep cervical plexus block on both sides (bilateral phrenic nerve block).', src: ['notes'] }],
  },
  {
    id: 'clavicle', name: 'Clavicle fracture fixation',
    cover: { text: 'Skin over the clavicle (supraclavicular nerves, C3–C4); the bone also has C5–C6 supply', src: ['derived'] },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['scn'], density: 'dense' }] },
    groups: [{ label: 'Usual combination', items: [
      { name: 'Intermediate cervical plexus block', blocks: ['scp'], why: 'For the skin over the clavicle.', src: ['derived'] },
      { name: 'Plus an interscalene or superior trunk block', blocks: ['bp'], why: 'For the deeper C5–C6 supply. Both blocks risk the phrenic nerve: check the patient’s breathing.', src: ['derived'] },
    ] }],
    notes: [{ text: 'Keep the total volume down: the two injections are close together and add up.', src: [] }],
  },
  {
    id: 'craniotomy', name: 'Craniotomy, head pins or awake craniotomy',
    cover: { text: 'The scalp on the side of the incision and the pins (both sides for a bifrontal or midline incision)', src: ['notes'] },
    map: { side: 'unilateral', views: ['front', 'side', 'back'], areas: [{ zones: ['scalp'], density: 'dense' }] },
    groups: [{ label: 'First choice', items: [{ name: 'Scalp block', blocks: ['scalp'], why: 'Blunts the response to pinning and incision, allows awake craniotomy with light sedation, and gives analgesia afterwards.', src: ['notes', 'osborn'] }] }],
    notes: [
      { text: 'Do it before the pins go in.', src: [] },
      { text: 'Add the surgeon’s infiltration at the pin sites and along the incision; the dura is not covered.', src: ['osborn'] },
    ],
  },
  {
    id: 'posterior', name: 'Posterior craniotomy or VP shunt',
    cover: { text: 'The back of the scalp (C2) and behind the ear', src: ['notes'] },
    map: { side: 'unilateral', views: ['side', 'back'], areas: [{ zones: ['gon'], density: 'dense' }, { zones: ['lon'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Greater and lesser occipital nerve blocks', blocks: ['gon'], src: ['notes', 'greher'] }] }],
    notes: [{ text: 'Ultrasound at C2 (on obliquus capitis inferior) is more reliable than the landmark technique, because the nerve’s position on the superior nuchal line varies.', src: ['notes', 'greher'] }],
  },
  {
    id: 'forehead', name: 'Forehead or frontal scalp surgery',
    cover: { text: 'Forehead and scalp to the vertex', src: ['notes'] },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['supraorbital', 'supratrochlear'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Supraorbital and supratrochlear nerve blocks', blocks: ['so'], src: ['notes'] }] }],
    notes: [{ text: 'Block both sides for a wound that crosses the midline.', src: [] }],
  },
  {
    id: 'cleftlip', name: 'Cleft lip repair (child)',
    cover: { text: 'Upper lip and the side of the nose, both sides', src: ['notes'] },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['infraorbital'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral infraorbital nerve blocks', blocks: ['io'], why: 'Widely used; better analgesia than opioids alone in trials, but the evidence is low quality.', src: ['feriani'] }] }],
    notes: [{ text: 'Use a weight-based dose; both sides.', src: [] }],
  },
  {
    id: 'cleftpalate', name: 'Cleft palate repair (child)',
    cover: { text: 'The palate (maxillary nerve, V2), both sides', src: ['notes'] },
    map: { side: 'bilateral', views: ['front', 'side'], areas: [{ zones: ['infraorbital', 'zygomaticotemporal'], density: 'moderate' }] },
    groups: [{ label: 'Option', items: [{ name: 'Bilateral suprazygomatic maxillary nerve blocks', blocks: ['v2'], why: '0.15 ml/kg of 0.2% ropivacaine per side halved morphine use in a randomised trial in infants.', src: ['chiono'] }] }],
    notes: [{ text: 'A deep block near the maxillary artery: learn it with an experienced colleague.', src: [] }, { text: 'The map shows the skin branches of V2; the block also covers the palate and upper teeth.', src: ['notes'] }],
  },
  {
    id: 'lowerlip', name: 'Lower lip or chin surgery',
    cover: { text: 'Lower lip and chin', src: ['notes'] },
    map: { side: 'unilateral', views: ['front', 'side'], areas: [{ zones: ['mental'], density: 'dense' }] },
    groups: [{ label: 'Option', items: [{ name: 'Mental nerve block', blocks: ['me'], src: ['notes'] }] }],
    notes: [{ text: 'Both sides for the middle of the lip.', src: [] }],
  },
  {
    id: 'ati', name: 'Awake tracheal intubation',
    cover: { text: 'Nose (if nasal), mouth and pharynx, larynx, cords and trachea', src: ['notes'] },
    map: { side: 'midline', views: ['airway'], areas: [{ zones: ['nose', 'tongue', 'oropharynx', 'supraglottis', 'subglottis'], density: 'dense' }] },
    groups: [
      { label: 'Mainstay', items: [{ name: 'Topical anaesthesia (spray-as-you-go, atomiser, nebuliser)', blocks: ['topical'], why: 'Total lidocaine within 9 mg/kg.', src: ['notes', 'das'] }] },
      { label: 'Add if needed', items: [
        { name: 'Superior laryngeal nerve blocks', blocks: ['sln'], why: 'The larynx above the cords.', src: ['notes'] },
        { name: 'Transtracheal block', blocks: ['ttb'], why: 'The cords and trachea; also for trismus.', src: ['notes'] },
        { name: 'Glossopharyngeal nerve blocks', blocks: ['gpn'], why: 'The gag reflex.', src: ['notes'] },
      ] },
    ],
    notes: [{ text: 'Check the topical anaesthesia works before you start.', src: ['das'] }, { text: 'All the lidocaine counts towards the maximum: sprays, nebuliser and blocks.', src: ['notes'] }],
  },
  {
    id: 'cataract', name: 'Cataract surgery',
    cover: { text: 'The cornea and conjunctiva; a still eye is usually not needed', src: ['notes'] },
    groups: [
      { label: 'Usual choice', items: [{ name: 'Topical anaesthesia, with intracameral lidocaine if needed', blocks: ['eyetop'], src: ['notes'] }] },
      { label: 'When topical is not enough', items: [{ name: 'Sub-Tenon’s block', blocks: ['st'], src: ['notes', 'kumar'] }] },
    ],
    notes: [{ text: 'Topical anaesthesia suits patients on anticoagulants and those with only one seeing eye.', src: ['notes'] }],
  },
  {
    id: 'vr', name: 'Vitreoretinal or other long eye surgery',
    cover: { text: 'Anaesthesia and akinesia of the globe', src: ['notes'] },
    groups: [{ label: 'Options', items: [
      { name: 'Sub-Tenon’s block', blocks: ['st'], why: 'Lowest risk of the injection techniques; akinesia depends on the volume.', src: ['notes', 'kumar'] },
      { name: 'Peribulbar block', blocks: ['peri'], why: 'Reliable akinesia; more chemosis and pressure.', src: ['notes', 'parness'] },
    ] }],
    notes: [{ text: 'In Singapore these blocks are usually done by ophthalmologists; the anaesthetist monitors and manages complications.', src: ['notes'] }],
  },
];

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const refNum = {};
document.querySelectorAll('#tb-refs > li').forEach((li, i) => { refNum[li.id.replace(/^ref-/, '')] = i + 1; });

function srcTags(list) {
  if (!list || !list.length) return '';
  const out = [];
  if (list.includes('notes')) out.push('<span class="tb-src tb-src--deck">Notes</span>');
  if (list.includes('derived')) out.push('<span class="tb-src tb-src--derived">Derived</span>');
  list.filter((s) => s !== 'notes' && s !== 'derived').forEach((k) => {
    if (refNum[k]) out.push(`<span class="tb-src tb-src--ref"><span class="tb-sr">Reference </span><span aria-hidden="true">Ref </span>${refNum[k]}</span>`);
  });
  return `<span class="tb-srcs">${out.join('')}</span>`;
}

function blockLinks(keys) {
  const links = [...new Set(keys)].filter((k) => BLOCK_LINKS[k]);
  if (!links.length) return '';
  return links.map((k) => {
    const [href, name, page] = BLOCK_LINKS[k];
    return `<a class="tb-opt-page" href="${href}">Open ${esc(name)} on the ${esc(page)} page <span aria-hidden="true">↗</span></a>`;
  }).join('');
}

function render(op, announce) {
  const body = $('#tb-result-body');
  const groups = op.groups.map((g) => `
    <h4 class="tb-opt-h">${esc(g.label)}</h4>
    <ul class="tb-opts">${g.items.map((it) => `
      <li class="tb-opt">
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span>${srcTags(it.src)}</div>
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        <div class="tb-opt-links">${blockLinks(it.blocks)}</div>
      </li>`).join('')}
    </ul>`).join('');
  const notes = op.notes.map((n) => `<li>${esc(n.text)} ${srcTags(n.src)}</li>`).join('');
  body.innerHTML = `
    <h3 class="tb-res-title" id="tb-res-title" tabindex="-1">${esc(op.name)}</h3>
    <div class="tb-res-grid${op.map ? '' : ' tb-res-grid--text'}">
      ${op.map ? '<div class="tb-fig hn-fig-slot"></div>' : ''}
      <div class="tb-res-text">
        <dl class="tb-facts">
          <div><dt>Area to cover</dt><dd><span class="tb-val">${esc(op.cover.text)}</span>${srcTags(op.cover.src)}</dd></div>
        </dl>
        <h4 class="tb-sub">Block options</h4>
        ${groups}
        <h4 class="tb-sub">Practical notes</h4>
        <ul class="tb-notes">${notes}</ul>
      </div>
    </div>`;
  if (op.map) $('.hn-fig-slot', body).append(headCoverageMap({ ...op.map, summary: op.cover.text }, { id: 'hn-op-map', title: op.name }));
  if (announce) $('#tb-status').textContent = `${op.name}. Area to cover: ${op.cover.text}.`;
}

function init() {
  const list = $('#tb-ops');
  if (!list) return;
  list.innerHTML = OPS.map((op, i) => `
    <label class="tb-op"><input type="radio" name="tb-op" value="${op.id}"${i === 0 ? ' checked' : ''}><span>${esc(op.name)}</span></label>`).join('');
  let start = OPS[0];
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m) { const f = OPS.find((o) => o.id === m[1]); if (f) start = f; }
  list.querySelector(`input[value="${start.id}"]`).checked = true;
  render(start, false);
  list.addEventListener('change', (e) => {
    const op = OPS.find((o) => o.id === e.target.value);
    if (!op) return;
    render(op, true);
    try { history.replaceState(null, '', '#op-' + op.id); } catch (_) { /* file:// or sandbox */ }
  });
}

init();
