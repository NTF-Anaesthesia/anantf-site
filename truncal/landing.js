/* Truncal blocks landing page: "Which block for which operation" chooser. */

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
    cover: { from: 'T2', to: 'T9', text: 'T2–T9' },
    single: { levels: ['T5','T6'], text: 'T5–T6' },
    side: 'one',
    marks: [{ type: 'ports', side: 'one', at: ['T4','T6','T7'] }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Thoracic paravertebral', blocks: ['pvb'], why: 'Single shot, or better a catheter with an infusion.' },
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'], why: 'Simpler and safer to place, but often not very dense. A catheter makes it last longer.' }
      ]},
      { label: 'Alternatives', items: [
        { name: 'Serratus anterior plane', blocks: ['sap'], why: 'Second choice for VATS.' },
        { name: 'Mid-point transverse process to pleura (MTP)', blocks: ['mtp'], why: 'An option when an ESP is unlikely to be dense enough.' },
        { name: 'Intercostal blocks by the surgeon', blocks: [], why: 'Commonly done under direct vision at the end of surgery, but PROSPECT doesn’t recommend them for lack of procedure-specific evidence.' }
      ]}
    ],
    notes: [
      { text: 'Block at a thoracic level that matches the port sites or the incision.' },
      { text: 'A catheter with a continuous infusion gives longer pain relief than a single shot.' },
      { text: 'Thoracic epidural is not recommended for VATS: paravertebral and ESP work as well with fewer side effects. It still has a place for open thoracotomy, for example when poor lung function makes the best possible analgesia important.' },
      { text: 'Thoracotomy is a bigger wound and very painful, especially a posterior incision, so plan a catheter. The 2025 MMed OSCE asked for an ESP for right thoracotomy, the other blocks you could use, and the pros of ESP over them.' },
      { text: 'Pleurodesis is the most painful VATS: plan a block plus PCA, and avoid NSAIDs, which may make the pleurodesis less effective.' },
      { text: 'If the surgeon freezes the intercostal nerves (cryoablation), it takes time to work, so you still need analgesia for the first days.' },
      { text: 'Non-intubated VATS: a block covers the skin and parietal pleura, but not the visceral pleura or the cough reflex. Add IV opioid; the surgeon can block the vagus nerve to stop coughing.' },
      { text: 'Multimodal: paracetamol and an NSAID or COX-2 inhibitor, IV dexmedetomidine, and opioids as rescue.' }
    ]
  },
  {
    id: 'mastectomy', name: 'Mastectomy',
    cover: { from: 'T2', to: 'T6', text: 'T2–T6' },
    single: { levels: ['T4'], text: 'T4' },
    side: 'one',
    marks: [{ type: 'breast', side: 'one' }],
    groups: [
      { label: 'Equal choices (single shot)', items: [
        { name: 'PECS II (interpectoral and pectoserratus plane)', blocks: ['pecs'] },
        { name: 'Serratus anterior plane, superficial or deep', blocks: ['sap'] },
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'] },
        { name: 'Thoracic paravertebral', blocks: ['pvb'] },
        { name: 'Local infiltration by the surgeon', blocks: [] }
      ]}
    ],
    notes: [
      { text: 'The 2026 PROSPECT update found no single-shot technique better than the others, including the surgeon’s local infiltration. Choose by your skills, the patient and the operation.' },
      { text: 'A single shot is recommended; a catheter is not usually needed. If a paravertebral catheter is sited, continue the infusion after surgery.' },
      { text: 'Local infiltration can be added where the block doesn’t reach, but keep the combined dose within the maximum.' },
      { text: 'Exam point, paravertebral for mastectomy. Pros: dense one-sided somatic and sympathetic block from one injection, less hypotension than an epidural, and possibly less chronic pain. Cons: failure in about 1 in 10, pneumothorax, epidural spread, hypotension, Horner’s syndrome, toxicity.' },
      { text: 'Multimodal: paracetamol and an NSAID, and dexamethasone, which also helps with the high risk of nausea and vomiting after breast surgery.' }
    ]
  },
  {
    id: 'rib', name: 'Rib fractures',
    cover: { from: 'T5', to: 'T8', text: 'The level of the fractures', example: 'Example shown: ribs 5–8 broken on one side.' },
    single: { levels: ['T6','T7'], text: 'The level of the fractures', example: true },
    side: 'one',
    marks: [],
    groups: [
      { label: 'First choice: a catheter', items: [
        { name: 'Erector spinae plane (ESP) catheter', blocks: ['esp'], why: 'Simple and relatively safe; the catheter technique of choice. Spreads about three levels up and four down from the injection.' },
        { name: 'Paravertebral catheter', blocks: ['pvb'], why: 'About as good as an epidural for breathing complications, and safer than an epidural if the patient is on anticoagulants.' }
      ]},
      { label: 'Alternatives', items: [
        { name: 'Serratus anterior plane', blocks: ['sap'], why: 'Only for fractures in the front two-thirds of the chest wall. Done supine or with a small tilt, so it suits a patient who can’t sit up or turn.' },
        { name: 'Intercostal blocks', blocks: [], why: 'Effective, but one injection for each broken rib, and each lasts only hours.' },
        { name: 'Thoracic epidural', blocks: [], why: 'Historically the best evidence, but used less because of neurological and blood pressure concerns. Not covered on these pages.' }
      ]}
    ],
    notes: [
      { text: 'Block at the level of the fractures: count the broken ribs on imaging and centre the block on them.' },
      { text: 'The aim is to let the patient breathe deeply and cough: poor analgesia leads to atelectasis, retained secretions and pneumonia.' },
      { text: 'Catheter techniques give better pain relief than systemic opioids, and the pain lasts days, so a single shot is rarely enough.' },
      { text: 'Trauma patients may be on spinal precautions or unable to turn for a back block. Plan the position before you choose the block.' },
      { text: 'Fractures on both sides need a catheter on each side. That doubles the local anaesthetic, so check the total dose.' },
      { text: 'Check anticoagulants and clotting first. An epidural is contraindicated with abnormal clotting or sepsis.' },
      { text: 'Multimodal: paracetamol, NSAIDs if the kidneys allow, opioids, chest physiotherapy and incentive spirometry. Surgical fixation is an option for a flail segment or uncontrolled pain.' }
    ]
  },
  {
    id: 'sternotomy', name: 'Sternotomy', brief: true,
    cover: { from: 'T2', to: 'T6', text: 'T2–T6 on both sides' },
    single: { levels: ['T4'], text: 'T4' },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T2', to: 'T6' }],
    groups: [
      { label: 'Usual choice', items: [
        { name: 'Parasternal intercostal plane, superficial or deep (deep = transversus thoracis plane), both sides', blocks: ['parasternal'], why: 'Covered briefly on the chest wall page.' }
      ]}
    ],
    notes: [
      { text: 'NTF has no cardiac surgery, so this is mainly for the exam.' },
      { text: 'The incision runs in the midline from the suprasternal notch to the xiphoid, so block both sides and keep the total dose within the maximum.' }
    ]
  },
  {
    id: 'hepatectomy', name: 'Hepatectomy or upper abdominal',
    cover: { from: 'T6', to: 'T10', text: 'T6–T10 on both sides' },
    single: { levels: ['T8'], text: 'T8' },
    side: 'both',
    marks: [{ type: 'subcostal' }],
    groups: [
      { label: 'First choice (open liver resection)', items: [
        { name: 'Bilateral oblique subcostal TAP (single shot or catheter)', blocks: ['stap'] },
        { name: 'Thoracic epidural', blocks: [], why: 'An equal first choice in PROSPECT. Clotting can worsen after a big resection, which may delay removing the catheter. Not covered on these pages.' }
      ]},
      { label: 'Alternative', items: [
        { name: 'Paravertebral or ESP at T8, both sides', blocks: ['pvb', 'esp'], why: 'At the single-shot level.' }
      ]},
      { label: 'Other options', items: [
        { name: 'Wound catheter placed by the surgeon, with PCA', blocks: [], why: 'In trials, wound catheters did about as well as an epidural, with a shorter stay. PROSPECT keeps them second line, for when an epidural or subcostal TAP isn’t possible.' },
        { name: 'Intrathecal morphine', blocks: [], why: 'Used by some teams; PROSPECT doesn’t recommend it (limited evidence, more itch and breathing depression at the doses studied).' }
      ]}
    ],
    notes: [
      { text: 'After open liver resection, PROSPECT recommends a catheter-based technique for the postoperative period.' },
      { text: 'A lateral TAP only reaches T10, so it misses the upper abdomen. Use the subcostal approach.' },
      { text: 'Abdominal wall blocks treat wound pain, not visceral pain. Give multimodal analgesia as well.' },
      { text: 'Paracetamol is usually still given; think about a lower dose with liver disease, malnutrition or a large resection. A dexmedetomidine infusion is a local option.' }
    ]
  },
  {
    id: 'laparotomy', name: 'Midline laparotomy',
    cover: { from: 'T6', to: 'T12', text: 'T6–T12 on both sides (xiphoid to pubis)', derivedNote: 'Upper abdominal is T6–T10 and lower midline T8–T12, so a full-length incision needs both: T7–T9 above the umbilicus, T10 around it, T11–T12 and L1 below.' },
    single: { levels: ['T8','T10'], text: 'No single level covers it: T8 for the upper part and T10 for the lower.' },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T6', to: 'T12' }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Rectus sheath catheters, both sides', blocks: ['rsb'], why: 'Covers the midline wound; abdominal wall catheters should be considered to reduce opioids.' },
        { name: 'Thoracic epidural', blocks: [], why: 'Only after checking for sepsis and abnormal clotting. Mid-thoracic, about T7–T9. Not covered on these pages.' }
      ]},
      { label: 'Alternatives', items: [
        { name: 'Subcostal plus lateral TAP, both sides', blocks: ['stap', 'tap'], why: 'Four injections to cover the upper and lower wall, so the volumes add up.' },
        { name: 'Wound (preperitoneal) catheter by the surgeon, with PCA', blocks: [], why: 'Surgeons may not want a wound catheter in a contaminated abdomen.' }
      ]}
    ],
    notes: [
      { text: 'Emergency laparotomy guidance: wound catheters and abdominal wall blocks should be considered to reduce opioid use, but how well they work varies (weak recommendation, low-quality evidence).' },
      { text: 'Fascial plane blocks treat wound (somatic) pain only. Visceral pain needs multimodal systemic analgesia or an epidural.' },
      { text: 'Emergency patients are often septic, unstable or have abnormal clotting, which rules out an epidural more often than a plane block.' },
      { text: 'Emergency: if the abdomen is left open (temporary closure) and the patient goes to ICU ventilated, a block can wait until the definitive closure.' },
      { text: 'Intraoperative adjuncts: remifentanil for titratability, or a lidocaine infusion; low-dose ketamine at some centres.' },
      { text: 'Catheters on both sides: plan the infusion and top-ups so the total stays within the maximum.' }
    ]
  },
  {
    id: 'lapchole', name: 'Laparoscopic cholecystectomy',
    cover: { from: 'T6', to: 'T10', text: 'The port sites, about T6–T10', derivedNote: 'Epigastric port near the xiphoid (T6) to umbilical port (T10).' },
    single: { levels: [], text: 'No single level' },
    side: 'both',
    marks: [{ type: 'ports', side: 'right', at: ['T6','T8','T10'] }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Port-site infiltration or intraperitoneal local anaesthetic (on the gallbladder bed), by the surgeon', blocks: [], why: 'Use one or the other, not both: together the total dose gets too high.' }
      ]},
      { label: 'Second line', items: [
        { name: 'Erector spinae plane (ESP)', blocks: ['esp'] },
        { name: 'TAP', blocks: ['tap', 'stap'], why: 'In obese patients, a subcostal TAP with local anaesthetic to the umbilical port is an option.' }
      ]}
    ],
    notes: [
      { text: 'PROSPECT puts ESP and TAP second because simpler infiltration works as well, the blocks carry more risk of toxicity, and they need more expertise.' },
      { text: 'After laparoscopy much of the pain is visceral, which abdominal wall blocks don’t treat. Shoulder-tip pain comes from the pneumoperitoneum: ask the surgeon to let out all the gas, and give an NSAID if there’s no contraindication.' },
      { text: 'Often day surgery or a 23-hour stay: the choice depends on your experience, the patient and whether they go home the same day. Give dual antiemetics.' },
      { text: 'Converted to open (right subcostal incision): pain is much worse. Plan a PCA and ask for infiltration or a wound catheter; a subcostal TAP on that side fits the incision.' }
    ]
  },
  {
    id: 'bariatric', name: 'Laparoscopic bariatric surgery',
    cover: { from: 'T6', to: 'T10', text: 'The port sites, about T6–T10', derivedNote: 'Upper abdominal ports, as for a laparoscopic cholecystectomy.' },
    single: { levels: [], text: 'No single level' },
    side: 'both',
    marks: [{ type: 'ports', side: 'both', pts: [[100, 'T10'], [74, 'T8'], [126, 'T8'], [62, 'T9'], [138, 'T9']] }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Bilateral TAP plus port-site infiltration by the surgeon', blocks: ['tap', 'stap'], why: 'The 2025 PROSPECT update for sleeve gastrectomy recommends both. The TAP can be ultrasound-guided or placed by the surgeon under laparoscopic view.' }
      ]}
    ],
    notes: [
      { text: 'The point is to spare opioids: many patients have obstructive sleep apnoea.' },
      { text: 'The combination of TAP and port-site infiltration adds up: keep the total local anaesthetic dose within the maximum.' },
      { text: 'Blocks are harder in obese patients: a curvilinear probe may be needed to see the layers.' },
      { text: 'Multimodal: paracetamol and an NSAID or COX-2 inhibitor, a single dose of IV dexamethasone, and opioids only as rescue.' },
      { text: 'New tachycardia, abdominal pain or fever after surgery may be an anastomotic leak, not just poor analgesia.' }
    ]
  },
  {
    id: 'nephrectomy', name: 'Nephrectomy',
    cover: { from: 'T8', to: 'T12', text: 'T8–T12' },
    single: { levels: ['T10'], text: 'T10' },
    side: 'one',
    marks: [{ type: 'flank' }],
    groups: [
      { label: 'Options', items: [
        { name: 'Paravertebral at T10', blocks: ['pvb'], why: 'At the single-shot level.' },
        { name: 'Erector spinae plane (ESP) at T10', blocks: ['esp'], why: 'Easier, but often less dense.' },
        { name: 'Quadratus lumborum', blocks: ['ql'], why: 'One trial in open nephrectomy found it better than subcostal TAP; evidence is limited.' },
        { name: 'Thoracic epidural, rectus sheath catheter or wound catheter', blocks: ['rsb'], why: 'Options for an open operation. An epidural needs to reach T7–T8; use it cautiously until bleeding is controlled.' }
      ]}
    ],
    notes: [
      { text: 'Open nephrectomy is very painful: plan a catheter. The incision varies: a loin incision for donor surgery, a paramedian or transverse laparotomy for a tumour (a transverse incision crosses the midline, so cover both sides).' },
      { text: 'Laparoscopic or robotic: the ports and the extraction wound set the levels you need. After a left nephrectomy, left testicular pain can come from tying the gonadal vein.' },
      { text: 'Plane blocks don’t treat visceral pain; give multimodal analgesia as well.' }
    ]
  },
  {
    id: 'lowermidline', name: 'Lower midline or hemicolectomy',
    cover: { from: 'T8', to: 'T12', text: 'T8–T12 on both sides' },
    single: { levels: ['T10'], text: 'T10' },
    side: 'both',
    marks: [{ type: 'line', x: 100, from: 'T8', to: 'T12' }],
    groups: [
      { label: 'Options', items: [
        { name: 'Rectus sheath, both sides (catheters for an open midline wound)', blocks: ['rsb'] },
        { name: 'Lateral TAP, both sides', blocks: ['tap'], why: 'Covers incisions below the umbilicus; spread above it is unreliable and it misses everything above T10.' },
        { name: 'Paravertebral or ESP at T10, both sides', blocks: ['pvb', 'esp'], why: 'At the single-shot level.' },
        { name: 'Thoracic epidural', blocks: [], why: 'Low thoracic, about T9–T11. Watch for hypotension. Not covered on these pages.' }
      ]}
    ],
    notes: [
      { text: 'Laparoscopic hemicolectomy: the extraction wound and ports set the levels you need.' },
      { text: 'Abdominal wall blocks treat wound pain, not visceral pain.' },
      { text: 'Both sides: keep the total dose within the maximum.' }
    ]
  },
  {
    id: 'hernia', name: 'Open inguinal hernia',
    cover: { from: 'T10', to: 'L2', text: 'T10–L2' },
    single: { levels: ['T11','T12','L1'], text: 'T11–L1' },
    side: 'one',
    marks: [{ type: 'groin' }],
    groups: [
      { label: 'First choice', items: [
        { name: 'Ilioinguinal and iliohypogastric', blocks: ['ilioinguinal'], why: 'Misses the genitofemoral nerve (the cord and sac): the surgeon can infiltrate there.' },
        { name: 'Local infiltration by the surgeon', blocks: [], why: 'An inguinal field block can be the only anaesthetic in a high-risk patient if the operator is experienced; spinal is another option.' }
      ]},
      { label: 'Alternative', items: [
        { name: 'TAP', blocks: ['tap'], why: 'Recommended by PROSPECT, but a lateral TAP often misses the groin: L1 joins the plane only medial to the ASIS.' }
      ]}
    ],
    notes: [
      { text: 'PROSPECT recommends an ilioinguinal and iliohypogastric block or a TAP block, plus local infiltration.' },
      { text: 'Add paracetamol and an NSAID, and a single dose of IV dexamethasone, which makes the block last longer and reduces nausea.' },
      { text: 'Usually day surgery: prescribe simple take-home analgesia.' },
      { text: 'The single-shot level, T11–L1, is the paravertebral level to know for the exam.' }
    ]
  }
];

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
      const pts = m.pts ? m.pts.map(([x, s]) => [x, yMid(s)]) : m.side === 'right'
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
        <div class="tb-opt-main"><span class="tb-opt-name">${esc(it.name)}</span></div>
        ${it.why ? `<p class="tb-opt-why">${esc(it.why)}</p>` : ''}
        <div class="tb-opt-links">${blockLinks(it.blocks)}</div>
      </li>`).join('')}
    </ul>`).join('');
  const notes = op.notes.map(n => `<li>${esc(n.text)}</li>`).join('');
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
          <div><dt>Dermatomes to cover</dt><dd><span class="tb-val">${esc(op.cover.text)}</span>${op.cover.derivedNote ? `<span class="tb-dnote">${esc(op.cover.derivedNote)}</span>` : ''}</dd></div>
          <div><dt>Single-shot level</dt><dd><span class="tb-val">${esc(op.single.text)}</span></dd></div>
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
