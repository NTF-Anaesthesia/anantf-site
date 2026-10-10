/* Truncal blocks landing page: "Which block for which operation" chooser.
   Levels are from the department's teaching slides (slide 147) unless tagged otherwise.
   Sources: 'deck:<slide>' = teaching slides, 'derived' = worked out from the slides,
   any other key = a reference in the page's References list (<li id="ref-KEY">). */

/* Where each block lives: page + chapter (or element) anchor. The shell opens the chapter that holds the id. */
export const BLOCK_LINKS = {
  esp: 'back/#ch-esp',
  mtp: 'back/#esp-mtp',
  pvb: 'back/#ch-pvb',
  sap: 'chest-wall/#ch-sap',
  pecs: 'chest-wall/#ch-pecs',
  parasternal: 'chest-wall/#ch-parasternal',
  clavipectoral: 'chest-wall/#clavipectoral',
  tap: 'abdominal-wall/#ch-tap',
  stap: 'abdominal-wall/#ch-subcostal',
  rsb: 'abdominal-wall/#ch-rsb',
  ql: 'abdominal-wall/#ch-ql',
  ilioinguinal: 'abdominal-wall/#ch-iih'
};
window.BLOCK_LINKS = BLOCK_LINKS;

/* Short names for the "Open … ↗" links */
const BLOCK_NAMES = {
  esp: 'ESP', mtp: 'MTP', pvb: 'paravertebral', sap: 'serratus anterior', pecs: 'PECS', parasternal: 'parasternal',
  clavipectoral: 'clavipectoral', tap: 'lateral TAP', stap: 'subcostal TAP', rsb: 'rectus sheath', ql: 'quadratus lumborum',
  ilioinguinal: 'ilioinguinal'
};
const PAGE_NAMES = { 'back/': 'back', 'chest-wall/': 'chest wall', 'abdominal-wall/': 'abdominal wall' };

const SEGS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','L1','L2'];
/* y edges of each dermatome band on the schematic torso (14 bands, 15 edges) */
const EDGES = [40,56,74,92,110,128,146,162,178,194,210,228,248,280,330];

const OPS = [
  {
    id: 'vats', name: 'VATS or thoracotomy',
    cover: { from: 'T2', to: 'T9', text: 'T2–T9', src: ['deck:147'] },
    single: { levels: ['T5','T6'], text: 'T5–T6', src: ['deck:147'] },
    side: 'one',
    marks: [{ type: 'ports', side: 'one', at: ['T4','T6','T7'] }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Thoracic paravertebral', blocks: ['pvb'], why: 'Single shot, or better a catheter with an infusion.', src: ['vats'] },
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'], why: 'Simpler and safer to place, but often not very dense. A catheter makes it last longer.', src: ['vats', 'deck:136'] }
      ]},
      { label: 'Alternatives', items: [
        { name: 'Serratus anterior plane', blocks: ['sap'], why: 'Second choice for VATS.', src: ['vats'] },
        { name: 'Mid-point transverse process to pleura (MTP)', blocks: ['mtp'], why: 'An option when an ESP is unlikely to be dense enough.', src: ['deck:136'] }
      ]}
    ],
    notes: [
      { text: 'Block at a thoracic level that matches the port sites or the incision.', src: ['vats'] },
      { text: 'A catheter with a continuous infusion gives longer pain relief than a single shot.', src: ['vats'] },
      { text: 'Thoracic epidural is not recommended for VATS: paravertebral and ESP work as well with fewer side effects.', src: ['vats'] },
      { text: 'Thoracotomy is a bigger wound, so plan a catheter. The 2025 MMed OSCE asked for an ESP for right thoracotomy, the other blocks you could use, and the pros of ESP over them.', src: ['deck:135'] }
    ]
  },
  {
    id: 'mastectomy', name: 'Mastectomy',
    cover: { from: 'T2', to: 'T6', text: 'T2–T6', src: ['deck:147'] },
    single: { levels: ['T4'], text: 'T4', src: ['deck:147'] },
    side: 'one',
    marks: [{ type: 'breast', side: 'one' }],
    groups: [
      { label: 'Equal choices (single shot)', items: [
        { name: 'PECS II (interpectoral and pectoserratus plane)', blocks: ['pecs'], src: ['breast'] },
        { name: 'Serratus anterior plane, superficial or deep', blocks: ['sap'], src: ['breast'] },
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'], src: ['breast'] },
        { name: 'Thoracic paravertebral', blocks: ['pvb'], src: ['breast'] },
        { name: 'Local infiltration by the surgeon', blocks: [], src: ['breast'] }
      ]}
    ],
    notes: [
      { text: 'The 2026 PROSPECT update found no single-shot technique better than the others, including the surgeon’s local infiltration. Choose by your skills, the patient and the operation.', src: ['breast'] },
      { text: 'A single shot is recommended; a catheter is not usually needed.', src: ['breast'] },
      { text: 'Local infiltration can be added where the block doesn’t reach, but keep the combined dose within the maximum.', src: ['breast'] }
    ]
  },
  {
    id: 'rib', name: 'Rib fractures',
    cover: { from: 'T5', to: 'T8', text: 'The level of the fractures', src: ['deck:147'], example: 'Example shown: ribs 5–8 broken on one side.' },
    single: { levels: ['T6','T7'], text: 'The level of the fractures', src: ['deck:147'], example: true },
    side: 'one',
    marks: [],
    groups: [
      { label: 'First choice: a catheter', items: [
        { name: 'Erector spinae plane (ESP) catheter', blocks: ['esp'], why: 'Simple and relatively safe; the review’s catheter technique of choice. Spreads about three levels up and four down from the injection.', src: ['rib'] },
        { name: 'Paravertebral catheter', blocks: ['pvb'], why: 'About as good as an epidural for breathing complications, and safer than an epidural if the patient is on anticoagulants.', src: ['rib'] }
      ]},
      { label: 'Alternatives', items: [
        { name: 'Serratus anterior plane', blocks: ['sap'], why: 'Only for fractures in the front two-thirds of the chest wall.', src: ['rib'] },
        { name: 'Thoracic epidural', blocks: [], why: 'Historically the best evidence, but used less because of neurological and blood pressure concerns. Not covered on these pages.', src: ['rib'] }
      ]}
    ],
    notes: [
      { text: 'Block at the level of the fractures: count the broken ribs on imaging and centre the block on them.', src: ['deck:147'] },
      { text: 'Catheter techniques give better pain relief than systemic opioids, and the pain lasts days, so a single shot is rarely enough.', src: ['rib'] },
      { text: 'Fractures on both sides need a catheter on each side. That doubles the local anaesthetic, so check the total dose.', src: ['rib'] },
      { text: 'Check anticoagulants and clotting first. An epidural is contraindicated with abnormal clotting or sepsis.', src: ['rib'] }
    ]
  },
  {
    id: 'sternotomy', name: 'Sternotomy', brief: true,
    cover: { from: 'T2', to: 'T6', text: 'T2–T6 on both sides', src: ['deck:147'] },
    single: { levels: ['T4'], text: 'T4', src: ['deck:147'] },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T2', to: 'T6' }],
    groups: [
      { label: 'Usual choice', items: [
        { name: 'Parasternal intercostal plane, superficial or deep (deep = transversus thoracis plane), both sides', blocks: ['parasternal'], why: 'Covered briefly on the chest wall page.', src: ['derived', 'names'] }
      ]}
    ],
    notes: [
      { text: 'NTF has no cardiac surgery, so this is mainly for the exam.', src: [] },
      { text: 'The wound is in the midline, so block both sides and keep the total dose within the maximum.', src: ['deck:147'] }
    ]
  },
  {
    id: 'hepatectomy', name: 'Hepatectomy or upper abdominal',
    cover: { from: 'T6', to: 'T10', text: 'T6–T10 on both sides', src: ['deck:147'] },
    single: { levels: ['T8'], text: 'T8', src: ['deck:147'] },
    side: 'both',
    marks: [{ type: 'subcostal' }],
    groups: [
      { label: 'First choice (open liver resection)', items: [
        { name: 'Bilateral oblique subcostal TAP (single shot or catheter)', blocks: ['stap'], src: ['liver'] },
        { name: 'Thoracic epidural', blocks: [], why: 'An equal first choice in PROSPECT. Not covered on these pages.', src: ['liver'] }
      ]},
      { label: 'Alternative', items: [
        { name: 'Paravertebral or ESP at T8, both sides', blocks: ['pvb', 'esp'], why: 'At the slides’ single-shot level.', src: ['deck:147', 'derived'] }
      ]}
    ],
    notes: [
      { text: 'After open liver resection, PROSPECT recommends a catheter-based technique for the postoperative period.', src: ['liver'] },
      { text: 'A lateral TAP only reaches T10, so it misses the upper abdomen. Use the subcostal approach.', src: ['deck:127'] },
      { text: 'Abdominal wall blocks treat wound pain, not visceral pain. Give multimodal analgesia as well.', src: ['chin'] }
    ]
  },
  {
    id: 'laparotomy', name: 'Midline laparotomy',
    cover: { from: 'T6', to: 'T12', text: 'T6–T12 on both sides (xiphoid to pubis)', src: ['derived'], derivedNote: 'The slides give upper abdominal T6–T10 and lower midline T8–T12; a full-length incision needs both.' },
    single: { levels: ['T8','T10'], text: 'No single level covers it. The slides’ levels are T8 (upper) and T10 (lower).', src: ['derived'] },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T6', to: 'T12' }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Rectus sheath catheters, both sides', blocks: ['rsb'], why: 'Covers the midline wound; abdominal wall catheters should be considered to reduce opioids.', src: ['el', 'chin'] },
        { name: 'Thoracic epidural', blocks: [], why: 'Only after checking for sepsis and abnormal clotting. Not covered on these pages.', src: ['el'] }
      ]},
      { label: 'Alternative', items: [
        { name: 'Subcostal plus lateral TAP, both sides', blocks: ['stap', 'tap'], why: 'Four injections to cover the upper and lower wall, so the volumes add up.', src: ['derived', 'deck:127'] }
      ]}
    ],
    notes: [
      { text: 'Emergency laparotomy guidance: wound catheters and abdominal wall blocks should be considered to reduce opioid use, but how well they work varies (weak recommendation, low-quality evidence).', src: ['el'] },
      { text: 'Fascial plane blocks treat wound (somatic) pain only. Visceral pain needs multimodal systemic analgesia or an epidural.', src: ['chin', 'upper'] },
      { text: 'Emergency patients are often septic or have abnormal clotting, which rules out an epidural more often than a plane block.', src: ['el'] },
      { text: 'Catheters on both sides: plan the infusion and top-ups so the total stays within the maximum.', src: [] }
    ]
  },
  {
    id: 'lapchole', name: 'Laparoscopic cholecystectomy',
    cover: { from: 'T6', to: 'T10', text: 'The port sites, about T6–T10', src: ['derived'], derivedNote: 'Epigastric port near the xiphoid (T6) to umbilical port (T10). Not in the slides.' },
    single: { levels: [], text: 'Not given in the slides', src: [] },
    side: 'both',
    marks: [{ type: 'ports', side: 'right', at: ['T6','T8','T10'] }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Port-site infiltration or intraperitoneal local anaesthetic, by the surgeon', blocks: [], why: 'Use one or the other, not both: together the total dose gets too high.', src: ['chole'] }
      ]},
      { label: 'Second line', items: [
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'], src: ['chole'] },
        { name: 'TAP', blocks: ['tap', 'stap'], src: ['chole'] }
      ]}
    ],
    notes: [
      { text: 'PROSPECT puts ESP and TAP second because simpler infiltration works as well, the blocks carry more risk of toxicity, and they need more expertise.', src: ['chole'] },
      { text: 'After laparoscopy much of the pain is visceral, which abdominal wall blocks don’t treat.', src: ['upper'] },
      { text: 'Often day surgery: the choice depends on your experience, the patient and whether they go home the same day.', src: ['chole'] }
    ]
  },
  {
    id: 'nephrectomy', name: 'Nephrectomy',
    cover: { from: 'T8', to: 'T12', text: 'T8–T12', src: ['deck:147'] },
    single: { levels: ['T10'], text: 'T10', src: ['deck:147'] },
    side: 'one',
    marks: [{ type: 'flank' }],
    groups: [
      { label: 'Options', items: [
        { name: 'Paravertebral at T10', blocks: ['pvb'], why: 'At the slides’ single-shot level.', src: ['deck:147', 'derived'] },
        { name: 'Erector spinae plane (ESP) at T10', blocks: ['esp'], why: 'Easier, but often less dense.', src: ['deck:147', 'deck:136', 'derived'] },
        { name: 'Quadratus lumborum', blocks: ['ql'], why: 'One trial in open nephrectomy found it better than subcostal TAP; evidence is limited.', src: ['upper'] }
      ]}
    ],
    notes: [
      { text: 'Open flank incision: consider a catheter.', src: ['derived'] },
      { text: 'Plane blocks don’t treat visceral pain; give multimodal analgesia as well.', src: ['chin'] }
    ]
  },
  {
    id: 'lowermidline', name: 'Lower midline or hemicolectomy',
    cover: { from: 'T8', to: 'T12', text: 'T8–T12 on both sides', src: ['deck:147'] },
    single: { levels: ['T10'], text: 'T10', src: ['deck:147'] },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T8', to: 'T12' }],
    groups: [
      { label: 'Options', items: [
        { name: 'Rectus sheath, both sides (catheters for an open midline wound)', blocks: ['rsb'], src: ['derived', 'chin'] },
        { name: 'Lateral TAP, both sides', blocks: ['tap'], why: 'Covers the lower abdominal wall but nothing above T10.', src: ['deck:127'] },
        { name: 'Paravertebral or ESP at T10, both sides', blocks: ['pvb', 'esp'], why: 'At the slides’ single-shot level.', src: ['deck:147', 'derived'] }
      ]}
    ],
    notes: [
      { text: 'Laparoscopic hemicolectomy: the extraction wound and ports set the levels you need.', src: ['derived'] },
      { text: 'Abdominal wall blocks treat wound pain, not visceral pain.', src: ['chin'] },
      { text: 'Both sides: keep the total dose within the maximum.', src: [] }
    ]
  },
  {
    id: 'hernia', name: 'Open inguinal hernia',
    cover: { from: 'T10', to: 'L2', text: 'T10–L2', src: ['deck:147'] },
    single: { levels: ['T11','T12','L1'], text: 'T11–L1', src: ['deck:147'] },
    side: 'one',
    marks: [{ type: 'groin' }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Ilioinguinal and iliohypogastric', blocks: ['ilioinguinal'], src: ['hernia'] },
        { name: 'Local infiltration by the surgeon', blocks: [], src: ['hernia'] }
      ]},
      { label: 'Alternative', items: [
        { name: 'TAP', blocks: ['tap'], why: 'Recommended by PROSPECT, but a lateral TAP often misses the groin: L1 joins the plane only medial to the ASIS.', src: ['hernia', 'deck:116'] }
      ]}
    ],
    notes: [
      { text: 'PROSPECT recommends an ilioinguinal and iliohypogastric block or a TAP block, plus local infiltration.', src: ['hernia'] },
      { text: 'The slides’ single-shot level, T11–L1, is the paravertebral level for teaching and the exam.', src: ['deck:147'] }
    ]
  }
];

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const refNum = {};
document.querySelectorAll('#tb-refs > li').forEach((li, i) => { refNum[li.id.replace(/^ref-/, '')] = i + 1; });

function srcTags(list) {
  if (!list || !list.length) return '';
  const deckSlides = list.filter(s => s.startsWith('deck:')).map(s => s.slice(5));
  const out = [];
  // Plain text tags (not links): small links here were tiny tab stops. The numbers match the References list.
  if (deckSlides.length) out.push(`<span class="tb-src tb-src--deck">Slide${deckSlides.length > 1 ? 's' : ''} ${deckSlides.join(', ')}</span>`);
  if (list.includes('derived')) out.push('<span class="tb-src tb-src--derived">Derived</span>');
  list.filter(s => !s.startsWith('deck:') && s !== 'derived').forEach(k => {
    if (refNum[k]) out.push(`<span class="tb-src tb-src--ref"><span class="tb-sr">Reference </span><span aria-hidden="true">Ref </span>${refNum[k]}</span>`);
  });
  return `<span class="tb-srcs">${out.join('')}</span>`;
}

function blockLinks(keys) {
  const seen = new Set();
  const links = keys.filter(k => BLOCK_LINKS[k] && !seen.has(BLOCK_LINKS[k]) && seen.add(BLOCK_LINKS[k]));
  if (!links.length) return '<span class="tb-opt-page tb-opt-page--none">Not on these pages</span>';
  return links.map(k => {
    const href = BLOCK_LINKS[k], page = PAGE_NAMES[href.split('#')[0]] || href;
    return `<a class="tb-opt-page" href="${href}">Open ${esc(BLOCK_NAMES[k] || k)} on the ${esc(page)} page <span aria-hidden="true">↗</span></a>`;
  }).join('');
}

/* ------------------------------------------------------------------ figure */
const TORSO = 'M57,30 Q100,22 143,30 L166,44 Q172,52 170,64 L161,130 Q154,180 150,214 Q159,256 164,296 L153,336 Q100,352 47,336 L36,296 Q41,256 50,214 Q46,180 39,130 L30,64 Q28,52 34,44 Z';
const segIndex = s => SEGS.indexOf(s);
const yMid = s => { const i = segIndex(s); return (EDGES[i] + EDGES[i + 1]) / 2; };

function figure(op) {
  const a = segIndex(op.cover.from), b = segIndex(op.cover.to);
  const y1 = EDGES[a], y2 = EDGES[b + 1];
  const x0 = 20, w = op.side === 'one' ? 80 : 160;
  const single = new Set(op.single.levels);
  let rows = '';
  SEGS.forEach((s, i) => {
    const on = i >= a && i <= b, inj = single.has(s);
    const y = EDGES[i], h = EDGES[i + 1] - y;
    rows += `<rect x="206" y="${y}" width="46" height="${h}" class="${on ? 'f-on' : 'f-off'}"/>`;
    rows += `<text x="229" y="${y + h / 2 + 4.3}" class="f-seg${on ? ' f-seg-on' : ''}" text-anchor="middle">${s}</text>`;
  });
  let inject = '';
  if (op.single.levels.length) {
    const ys = op.single.levels.map(yMid), top = Math.min(...ys) - 7, bot = Math.max(...ys) + 7;
    inject = `<rect x="205" y="${top}" width="48" height="${bot - top}" class="f-inj"/>` +
      ys.map(y => `<path d="M290,${y} L262,${y} M269,${y - 5} L262,${y} L269,${y + 5}" class="f-arrow"/>`).join('');
  }
  let marks = '';
  (op.marks || []).forEach(m => {
    if (m.type === 'line') marks += `<path d="M${m.x},${yMid(m.from) - 6} L${m.x},${yMid(m.to) + 6}" class="f-cut"/>`;
    if (m.type === 'ports') {
      const pts = m.side === 'right'
        ? [[100, yMid(m.at[0])], [74, yMid(m.at[1])], [100, yMid(m.at[2]) + 3]]
        : m.at.map((s, i) => [46 + i * 7, yMid(s)]);
      marks += pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2" class="f-port"/>`).join('');
    }
    if (m.type === 'breast') marks += `<ellipse cx="74" cy="104" rx="22" ry="17" class="f-cut"/>`;
    if (m.type === 'subcostal') marks += `<path d="M112,146 Q96,166 58,166" class="f-cut"/>`;
    if (m.type === 'flank') marks += `<path d="M44,170 Q52,196 72,214" class="f-cut"/>`;
    if (m.type === 'groin') marks += `<path d="M56,290 L84,306" class="f-cut"/>`;
  });
  const label = `Schematic front of the trunk. Dermatomes ${op.cover.from} to ${op.cover.to} shaded${op.side === 'one' ? ' on one side' : ' on both sides'}` +
    (op.single.levels.length ? `; single-shot level ${op.single.levels.join(' and ')} marked.` : '.');
  return `<svg class="tb-fig-svg" viewBox="0 0 320 360" role="img" aria-label="${esc(label)}">
    <defs><clipPath id="tb-clip"><path d="${TORSO}"/></clipPath></defs>
    <path d="M90,30 L92,10 M110,30 L108,10" class="f-outline"/>
    <path d="${TORSO}" class="f-skin"/>
    <g clip-path="url(#tb-clip)">
      ${EDGES.slice(1, -1).map(y => `<path d="M20,${y} L180,${y}" class="f-band"/>`).join('')}
      <rect x="${x0}" y="${y1}" width="${w}" height="${y2 - y1}" class="f-spread"/>
    </g>
    <path d="${TORSO}" class="f-outline"/>
    <path d="M100,34 L100,330" class="f-mid"/>
    <circle cx="74" cy="100" r="3" class="f-land"/><circle cx="126" cy="100" r="3" class="f-land"/>
    <circle cx="100" cy="202" r="3.4" class="f-land-o"/>
    <path d="M94,137 L106,137" class="f-land-l"/>
    <path d="M44,298 Q70,318 96,332 M156,298 Q130,318 104,332" class="f-land-l"/>
    ${marks}
    ${rows}
    ${inject}
  </svg>`;
}

/* ------------------------------------------------------------------ render */
function render(op, announce) {
  const body = $('#tb-result-body');
  const groups = op.groups.map(g => `
    <h4 class="tb-opt-h">${esc(g.label)}</h4>
    <ul class="tb-opts">${g.items.map(it => `
      <li class="tb-opt">
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span>${srcTags(it.src)}</div>
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        <div class="tb-opt-links">${blockLinks(it.blocks)}</div>
      </li>`).join('')}
    </ul>`).join('');
  const notes = op.notes.map(n => `<li>${esc(n.text)} ${srcTags(n.src)}</li>`).join('');
  body.innerHTML = `
    <h3 class="tb-res-title" id="tb-res-title" tabindex="-1">${esc(op.name)}${op.brief ? ' <span class="tb-brief">Brief</span>' : ''}</h3>
    <div class="tb-res-grid">
      <figure class="tb-fig">
        ${figure(op)}
        <figcaption>
          <ul class="tb-legend">
            <li><span class="tb-sw tb-sw--spread" aria-hidden="true"></span>Dermatomes to cover${op.side === 'one' ? ' (one side, either)' : ' (both sides)'}</li>
            ${op.single.levels.length ? '<li><span class="tb-sw tb-sw--inj" aria-hidden="true"></span>Single-shot level</li>' : ''}
            ${(op.marks || []).length ? '<li><span class="tb-sw tb-sw--cut" aria-hidden="true"></span>Incision or ports (schematic)</li>' : ''}
          </ul>
          ${op.cover.example ? `<p class="tb-fig-note">${esc(op.cover.example)}</p>` : ''}
          <p class="tb-fig-note">Schematic, front view. Nipple about T4, xiphoid T6, umbilicus T10, groin L1.</p>
        </figcaption>
      </figure>
      <div class="tb-res-text">
        <dl class="tb-facts">
          <div><dt>Dermatomes to cover</dt><dd><span class="tb-val">${esc(op.cover.text)}</span>${srcTags(op.cover.src)}${op.cover.derivedNote ? `<span class="tb-dnote">${esc(op.cover.derivedNote)}</span>` : ''}</dd></div>
          <div><dt>Single-shot level</dt><dd><span class="tb-val">${esc(op.single.text)}</span>${srcTags(op.single.src)}</dd></div>
          <div><dt>Sides</dt><dd><span class="tb-val">${op.side === 'one' ? 'One side' : 'Both sides'}</span></dd></div>
        </dl>
        <h4 class="tb-sub">Block options</h4>
        ${groups}
        <h4 class="tb-sub">Practical notes</h4>
        <ul class="tb-notes">${notes}</ul>
      </div>
    </div>`;
  if (announce) {
    $('#tb-status').textContent = `${op.name}. Dermatomes to cover: ${op.cover.text}. Single-shot level: ${op.single.text}.`;
  }
}

function init() {
  const list = $('#tb-ops');
  if (!list) return;
  list.innerHTML = OPS.map((op, i) => `
    <label class="tb-op"><input type="radio" name="tb-op" value="${op.id}"${i === 0 ? ' checked' : ''}><span>${esc(op.name)}</span></label>`).join('');
  let start = OPS[0];
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m) { const f = OPS.find(o => o.id === m[1]); if (f) start = f; }
  list.querySelector(`input[value="${start.id}"]`).checked = true;
  render(start, false);
  list.addEventListener('change', e => {
    const op = OPS.find(o => o.id === e.target.value);
    if (!op) return;
    render(op, true);
    try { history.replaceState(null, '', '#op-' + op.id); } catch (_) { /* file:// or sandbox */ }
  });
}

init();
