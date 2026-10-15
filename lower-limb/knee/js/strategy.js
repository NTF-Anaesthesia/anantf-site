// Knee page: "The motor-sparing knee" chapter, with an interactive plan builder (pick blocks, see which parts of the
// knee they reach and what they cost in muscle power). The coverage model is a teaching simplification of the cadaver
// innervation maps: each region is a set of nerves; a block reaches some of them. Prefix kn-.
import { el, sv, fill, keyPoints, callout, table, registerSearch, announce } from '../../../shared/regional/js/ui.js';

// Nerves (articular unless stated)
const NERVES = {
  nvm: 'nerve to vastus medialis', nvi: 'nerve to vastus intermedius', nvl: 'nerve to vastus lateralis',
  smgn: 'superomedial genicular', slgn: 'superolateral genicular', imgn: 'inferomedial genicular', ilgn: 'inferolateral genicular',
  rpn: 'recurrent peroneal', ipb: 'infrapatellar branch of the saphenous', afcn: 'anterior femoral cutaneous (skin)',
  tib: 'tibial articular branches', pobt: 'posterior obturator branch', cpn: 'common peroneal articular branches',
};
// Short names for the plan builder's table (full names in the key under it and in each abbreviation's title)
const ABBR = {
  nvm: 'NVM', nvi: 'NVI', nvl: 'NVL', smgn: 'SMGN', slgn: 'SLGN', imgn: 'IMGN', ilgn: 'ILGN', rpn: 'RPN', ipb: 'IPBSN',
  afcn: 'AFCN', tib: 'Tibial', pobt: 'Post obt', cpn: 'CPN',
};
// Regions of the knee and the nerves that supply them
const REGIONS = [
  { id: 'sm', name: 'Superomedial capsule', nerves: ['nvm', 'nvi', 'smgn'] },
  { id: 'sl', name: 'Superolateral capsule', nerves: ['nvl', 'nvi', 'slgn', 'cpn'] },
  { id: 'im', name: 'Inferomedial capsule', nerves: ['imgn', 'ipb'] },
  { id: 'il', name: 'Inferolateral capsule', nerves: ['ilgn', 'rpn'] },
  { id: 'inc', name: 'Midline incision (skin)', nerves: ['afcn', 'ipb'] },
  { id: 'post', name: 'Posterior capsule', nerves: ['tib', 'pobt', 'cpn'] },
];
const BLOCKS = [
  { id: 'fnb', name: 'Femoral nerve block', href: '../hip/#ch-femoral', nerves: ['nvm', 'nvi', 'nvl', 'afcn', 'ipb'], motor: 'Quadriceps weak: falls risk, no unaided walking', bad: true },
  { id: 'ftb', name: 'Femoral triangle (single shot)', href: '#ch-adductor-canal', nerves: ['ipb', 'nvm'], motor: 'Quadriceps largely spared (vastus medialis may weaken)' },
  { id: 'tkr3', name: 'Three-target technique', href: '#adductor-canal-tkr', nerves: ['ipb', 'nvm', 'afcn'], motor: 'Quadriceps largely spared (vastus medialis may weaken)' },
  { id: 'acb', name: 'Distal adductor canal', href: '#adductor-canal-canal', nerves: ['ipb', 'pobt'], motor: 'Quadriceps spared', partial: ['pobt'] },
  { id: 'ipack', name: 'iPACK', href: '#ch-ipack', nerves: ['tib', 'pobt'], motor: 'Foot usually spared (tibial or peroneal spread possible)' },
  { id: 'gen', name: 'Genicular (3 targets)', href: '#ch-genicular', nerves: ['smgn', 'slgn', 'imgn'], motor: 'None' },
  { id: 'obt', name: 'Obturator nerve block', href: '#ch-obturator', nerves: ['pobt'], motor: 'Hip adductors weak' },
  { id: 'lia', name: 'Periarticular infiltration', nerves: Object.keys(NERVES), partial: Object.keys(NERVES), motor: 'None (by the surgeon; lasts hours)' },
  { id: 'sci', name: 'Sciatic (popliteal) block', href: '../foot-ankle/#ch-popliteal', nerves: ['tib', 'cpn', 'smgn', 'slgn', 'imgn', 'ilgn', 'rpn'], motor: 'Foot drop; masks a peroneal palsy', bad: true },
];
const PRESETS = [
  { id: 'prospect', name: 'PROSPECT plan', blocks: ['ftb', 'lia'], note: 'Single-shot adductor canal (or distal femoral triangle) block plus the surgeon’s periarticular infiltration, with paracetamol, an NSAID and IV dexamethasone. The evidence-based default for a primary knee replacement.' },
  { id: 'noinf', name: 'No infiltration', blocks: ['tkr3', 'ipack'], note: 'When the surgeon does not infiltrate: the three-target femoral triangle technique for the front and the incision, iPACK for the back. The lateral quadrants are still only partly covered.' },
  { id: 'artic', name: 'All-articular', blocks: ['gen', 'ipack', 'ftb'], note: 'Genicular targets for the anterior quadrants, iPACK for the back, a femoral triangle block for the saphenous territory: no quadriceps or foot weakness, no skin cover over the upper incision.' },
  { id: 'old', name: 'Old school', blocks: ['fnb', 'sci'], note: 'Femoral plus sciatic: dense, but a weak quadriceps and a foot drop. PROSPECT recommends neither for knee replacement.' },
];

function knee(svgId) {
  // One schematic knee, front (left) and back (right) panels. Front: lateral on the left; back: medial on the left.
  const W = 360, H = 250;
  const svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, class: 'kn-plan-svg', role: 'img', id: svgId, 'aria-label': 'Schematic knee, front and back, shaded by how much of each region the chosen blocks reach.' });
  const defs = sv('defs', {}, svg);
  const hatch = sv('pattern', { id: `${svgId}-h`, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
  sv('rect', { width: 6, height: 6, fill: 'rgba(44,116,179,.22)' }, hatch);
  sv('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: '#1d4f7c', 'stroke-width': 1.6 }, hatch);
  const regionEls = {};
  const panel = (ox, title, quads) => {
    const g = sv('g', { transform: `translate(${ox} 0)` }, svg);
    sv('path', { d: 'M48 8 L122 8 L124 84 C142 96 156 108 156 128 L156 142 L14 142 L14 128 C14 108 28 96 46 84 Z', fill: '#efe5cf', stroke: '#9c8a64', 'stroke-width': 1.3 }, g);
    sv('path', { d: 'M18 150 L152 150 C154 162 146 176 132 182 L124 238 L46 238 L38 182 C24 176 16 162 18 150 Z', fill: '#efe5cf', stroke: '#9c8a64', 'stroke-width': 1.3 }, g);
    quads.forEach((q) => {
      const p = sv('path', { d: q.d, class: 'kn-plan-reg', 'data-r': q.id, fill: 'transparent', stroke: '#633d3c', 'stroke-width': 1.1, 'stroke-dasharray': '4 3' }, g);
      (regionEls[q.id] ||= []).push({ el: p, hatch: `url(#${svgId}-h)` });
      if (q.label) sv('text', { x: q.lx, y: q.ly, 'text-anchor': 'middle', 'font-size': 12.5, 'font-weight': 600, 'font-family': 'NTF Sans, Inter, sans-serif', fill: '#272722', stroke: '#fbf9f4', 'stroke-width': 3, 'paint-order': 'stroke', text: q.label }, g);
    });
    sv('text', { x: 85, y: 248, 'text-anchor': 'middle', 'font-size': 12.5, 'font-family': 'NTF Mono, JetBrains Mono, monospace', fill: '#55534d', text: title }, g);
    return g;
  };
  const f = panel(0, 'FRONT (LAT · MED)', [
    { id: 'sl', d: 'M20 60 L84 60 L84 144 L16 144 C14 110 16 80 20 60 Z', label: 'SL', lx: 44, ly: 112 },
    { id: 'sm', d: 'M86 60 L150 60 C154 80 156 110 154 144 L86 144 Z', label: 'SM', lx: 126, ly: 112 },
    { id: 'il', d: 'M18 148 L84 148 L84 214 L40 214 L32 180 C22 172 18 160 18 148 Z', label: 'IL', lx: 52, ly: 186 },
    { id: 'im', d: 'M86 148 L152 148 C152 160 148 172 138 180 L130 214 L86 214 Z', label: 'IM', lx: 116, ly: 186 },
  ]);
  // patella and incision line on the front panel (on top of the quadrants)
  sv('ellipse', { cx: 85, cy: 112, rx: 17, ry: 21, fill: '#f7f0e2', stroke: '#9c8a64', 'stroke-width': 1.1 }, f);
  const inc = sv('path', { d: 'M85 34 L85 206', fill: 'none', stroke: '#9b9b9b', 'stroke-width': 6, 'stroke-linecap': 'round', class: 'kn-plan-inc' }, f);
  (regionEls.inc ||= []).push({ el: inc, line: true });
  sv('path', { d: 'M85 34 L85 206', fill: 'none', stroke: '#272722', 'stroke-width': 1, 'stroke-dasharray': '2 3' }, f);
  sv('text', { x: 92, y: 30, 'font-size': 12.5, 'font-family': 'NTF Sans, Inter, sans-serif', fill: '#272722', text: 'Incision' }, f);
  panel(190, 'BACK (MED · LAT)', [
    { id: 'post', d: 'M16 98 L154 98 L156 142 C156 150 154 160 150 170 L20 170 C16 160 14 150 14 142 Z', label: 'Posterior capsule', lx: 85, ly: 138 },
  ]);
  return { svg, regionEls };
}

function builder() {
  const wrap = el('figure', { class: 'kn-plan', id: 'kn-plan' });
  wrap.append(el('p', { class: 'kn-fig-title', text: 'Build the plan: what each block reaches, and what it costs' }));
  const grid = el('div', { class: 'kn-plan-grid' });
  const { svg, regionEls } = knee('kn-plan-knee');
  const left = el('div', { class: 'kn-plan-fig' }, svg);
  const key = el('ul', { class: 'kn-plan-key', 'aria-label': 'Key' },
    el('li', {}, el('span', { class: 'kn-sw kn-sw--all', 'aria-hidden': 'true' }), 'All of its nerves'),
    el('li', {}, el('span', { class: 'kn-sw kn-sw--most', 'aria-hidden': 'true' }), 'Most'),
    el('li', {}, el('span', { class: 'kn-sw kn-sw--some', 'aria-hidden': 'true' }), 'Some (hatched)'),
    el('li', {}, el('span', { class: 'kn-sw kn-sw--none', 'aria-hidden': 'true' }), 'None'));
  left.append(key);
  const right = el('div', { class: 'kn-plan-ctrl' });
  const presetRow = el('div', { class: 'kn-plan-presets', role: 'group', 'aria-label': 'Ready-made plans' });
  const blockRow = el('div', { class: 'kn-plan-blocks', role: 'group', 'aria-label': 'Blocks' });
  const out = el('div', { class: 'kn-plan-out', 'aria-live': 'polite' });
  const state = new Set();
  let presetNote = '';
  let quiet = false;

  const bBtns = {};
  BLOCKS.forEach((b) => {
    const btn = el('button', { type: 'button', class: `tb-seg-btn kn-plan-b${b.bad ? ' kn-plan-b--motor' : ''}`, 'aria-pressed': 'false', id: `kn-plan-${b.id}`, text: b.name });
    btn.addEventListener('click', () => { if (state.has(b.id)) state.delete(b.id); else state.add(b.id); presetNote = ''; paint(); });
    bBtns[b.id] = btn; blockRow.append(btn);
  });
  const pBtns = {};
  PRESETS.forEach((p) => {
    const btn = el('button', { type: 'button', class: 'tb-seg-btn kn-plan-p', id: `kn-preset-${p.id}`, 'data-activate': '1', 'data-scroll-to': 'kn-plan', text: p.name });
    btn.addEventListener('click', () => { state.clear(); p.blocks.forEach((x) => state.add(x)); presetNote = p.note; paint(p.id); });
    pBtns[p.id] = btn; presetRow.append(btn);
  });
  const clear = el('button', { type: 'button', class: 'tb-btn kn-plan-clear', text: 'Clear' });
  clear.addEventListener('click', () => { state.clear(); presetNote = ''; paint(); });

  right.append(el('p', { class: 'kn-plan-k', text: 'Start from a plan' }), presetRow, el('p', { class: 'kn-plan-k', text: 'Or pick blocks' }), blockRow, clear);
  grid.append(left, right);
  wrap.append(grid, out);
  wrap.append(fill(el('figcaption'), 'A teaching simplification of the cadaver maps: each region is shown by how many of its nerves the chosen blocks reach. Real spread and anatomy vary; distal adductor canal spread to the back of the knee is inconsistent; infiltration is shown as reaching some of every region because its spread depends on the surgeon and it lasts hours, not a day.'));

  function paint(presetId) {
    Object.entries(bBtns).forEach(([id, b]) => b.setAttribute('aria-pressed', String(state.has(id))));
    Object.entries(pBtns).forEach(([id, b]) => b.setAttribute('aria-pressed', String(id === presetId)));
    const reached = new Set();
    const partial = new Set();
    BLOCKS.filter((b) => state.has(b.id)).forEach((b) => b.nerves.forEach((n) => ((b.partial || []).includes(n) ? partial : reached).add(n)));
    const rows = REGIONS.map((r) => {
      const hit = r.nerves.filter((n) => reached.has(n));
      const some = r.nerves.filter((n) => !reached.has(n) && partial.has(n));
      const f = (hit.length + 0.5 * some.length) / r.nerves.length;
      const level = f >= 0.999 ? 'all' : f >= 0.6 ? 'most' : f > 0 ? 'some' : 'none';
      (regionEls[r.id] || []).forEach(({ el: node, hatch, line }) => {
        if (line) { node.setAttribute('stroke', level === 'none' ? '#9b9b9b' : level === 'some' ? '#7fa9d1' : level === 'most' ? '#4a8bc4' : '#2c74b3'); return; }
        node.setAttribute('fill', level === 'all' ? 'rgba(44,116,179,.78)' : level === 'most' ? 'rgba(44,116,179,.48)' : level === 'some' ? hatch : 'transparent');
        node.classList.toggle('is-on', level !== 'none');
      });
      const missing = r.nerves.filter((n) => !reached.has(n));
      return { r, level, missing };
    });
    const chosen = BLOCKS.filter((b) => state.has(b.id));
    const motor = chosen.map((b) => `<li${b.bad ? ' class="kn-plan-warn"' : ''}><strong>${b.name}:</strong> ${b.motor}</li>`).join('');
    const words = { all: 'all', most: 'most', some: 'some', none: 'none' };
    const used = new Set();
    let anyPartly = false;
    const tbl = rows.map(({ r, level, missing }) => `<tr><th scope="row">${r.name}</th><td><span class="kn-lv kn-lv--${level}">${words[level]}</span></td><td>${level === 'all' ? '—' : missing.map((n) => {
      used.add(n);
      const part = partial.has(n); if (part) anyPartly = true;
      return `<abbr title="${NERVES[n]}${part ? ' (partly reached)' : ''}">${ABBR[n]}</abbr>${part ? '*' : ''}`;
    }).join(', ')}</td></tr>`).join('');
    const abbrKey = [...used].map((n) => `<strong>${ABBR[n]}</strong> ${NERVES[n]}`).join('; ');
    const links = chosen.filter((b) => b.href).map((b) => `<a href="${b.href}">${b.name}</a>`).join(' · ');
    out.innerHTML = `${presetNote ? `<p class="kn-plan-note">${presetNote}</p>` : ''}
${chosen.length ? '' : '<p class="kn-plan-note">Choose a plan or tap blocks to add them.</p>'}
<div class="tb-table-wrap"><table class="tb-table kn-plan-tbl"><caption>Coverage by region</caption><thead><tr><th scope="col">Region</th><th scope="col">Nerves reached</th><th scope="col">Still uncovered</th></tr></thead><tbody>${tbl}</tbody></table></div>
${anyPartly ? '<p class="kn-plan-fn">* Reached only partly: infiltration reaches some of every region, for some hours; distal canal spread to the back of the knee is inconsistent.</p>' : ''}
${abbrKey ? `<p class="kn-plan-fn">${abbrKey}.</p>` : ''}
${chosen.length ? `<p class="kn-plan-k">Motor cost</p><ul class="kn-plan-motor">${motor}</ul>` : ''}
${links ? `<p class="kn-plan-links">Go to: ${links}</p>` : ''}`;
    if (!quiet && (presetId || chosen.length)) announce(`${chosen.map((b) => b.name).join(', ') || 'No blocks'} selected.`);
  }
  // default: the PROSPECT plan (no announcement on first paint)
  PRESETS[0].blocks.forEach((x) => state.add(x)); presetNote = PRESETS[0].note;
  quiet = true; paint(PRESETS[0].id); quiet = false;
  return wrap;
}

export function renderStrategy(sec) {
  sec.append(el('h2', { id: 'kn-st-h', text: 'The motor-sparing knee: building the plan' }));
  sec.append(fill(el('p', { class: 'tb-lead' }), 'After a knee replacement the patient should be walking within hours. The analgesic plan has to cover a joint supplied by three nerves <strong>without weakening the quadriceps or the foot</strong>. No single block does it: the art is in the combination.'));
  sec.append(keyPoints([
    '<strong>The femoral nerve block</strong> gives excellent anterior analgesia but weakens the quadriceps (in volunteers, to about a tenth of baseline): falls, delayed walking. PROSPECT no longer recommends it for knee replacement.',
    '<strong>The adductor canal or distal femoral triangle block</strong> gives similar analgesia in trials with the quadriceps largely spared, but it covers the anteromedial knee only.',
    '<strong>Periarticular infiltration</strong> by the surgeon covers the whole capsule and the wound for some hours; with an adductor canal block it is the PROSPECT backbone.',
    '<strong>iPACK</strong> (back) and <strong>genicular blocks</strong> (front quadrants) fill the gaps without motor block; they add most when infiltration is not done.',
    '<strong>Basic analgesia is not optional:</strong> paracetamol, an NSAID or COX-2 inhibitor and a single dose of IV dexamethasone. More blocks on top of a full plan add little.',
  ]));
  sec.append(el('h3', { id: 'kn-st-builder', text: 'Plan builder' }));
  sec.append(builder());

  sec.append(el('h3', { id: 'kn-st-compare', text: 'The options side by side' }));
  sec.append(table({
    caption: 'Knee analgesia: what each technique buys and costs',
    head: ['Technique', 'Covers', 'Motor cost', 'Evidence and place'],
    rows: [
      [{ th: true, html: '<a href="../hip/#ch-femoral">Femoral nerve block</a>' }, 'Anterior knee, anterior thigh, incision, saphenous', 'Quadriceps weak', 'Good analgesia; replaced by motor-sparing blocks for arthroplasty. Still useful for femoral shaft, patella and quadriceps tendon surgery.'],
      [{ th: true, html: '<a href="#ch-adductor-canal">Adductor canal / femoral triangle</a>' }, 'Anteromedial knee; saphenous', 'Largely spared', 'PROSPECT: recommended (single shot), preferably with infiltration. Analgesia similar to femoral in trials.'],
      [{ th: true, html: 'Periarticular infiltration' }, 'Whole capsule and wound', 'None', 'PROSPECT: recommended. Large doses of local anaesthetic; lasts hours. Catheters not recommended (infection).'],
      [{ th: true, html: '<a href="#ch-ipack">iPACK</a>' }, 'Posterior capsule', 'Foot usually spared', 'Reduces early posterior pain; benefit mainly without infiltration. Not recommended by PROSPECT (limited evidence).'],
      [{ th: true, html: '<a href="#ch-genicular">Genicular blocks</a>' }, 'Anterior quadrants', 'None', 'Reduced opioid use as an add-on; five targets non-inferior to infiltration in one trial.'],
      [{ th: true, html: '<a href="#ch-obturator">Obturator nerve block</a>' }, 'Posteromedial knee', 'Hip adductors', 'Lowered morphine use added to a femoral triangle block; a niche add-on.'],
      [{ th: true, html: 'Sciatic block' }, 'Posterior and lateral knee', 'Foot drop', 'No clinically relevant benefit over infiltration; masks a peroneal palsy. Not recommended.'],
      [{ th: true, html: 'Intrathecal morphine' }, 'Whole knee (systemic and spinal)', 'None', 'Itch, nausea, urinary retention; PROSPECT: 100 micrograms only if both adductor canal block and infiltration are impossible.'],
      [{ th: true, html: 'Epidural' }, 'Both legs', 'Variable; urinary retention, hypotension', 'Not recommended: slows mobilisation.'],
    ],
  }));

  sec.append(el('h3', { id: 'kn-st-ops', text: 'By operation' }));
  sec.append(table({
    caption: 'Suggested starting points (adapt to the surgeon, the patient and local practice)',
    head: ['Operation', 'Main pain', 'Suggested regional plan'],
    rows: [
      [{ th: true, html: 'Total knee replacement' }, 'Whole joint, worst on flexion; incision', 'Spinal (or GA) + <a href="#ch-adductor-canal">distal femoral triangle or adductor canal block</a> + infiltration. No infiltration: three-target technique + <a href="#ch-ipack">iPACK</a> (± <a href="#ch-genicular">genicular</a>).'],
      [{ th: true, html: 'Unicompartmental (medial) replacement' }, 'Medial joint', 'Adductor canal block + infiltration; day-case pathways rely on motor sparing.'],
      [{ th: true, html: 'ACL reconstruction' }, 'Joint, tunnels, graft site', 'Adductor canal block + infiltration; hamstring graft site pain is partly outside saphenous territory. Patellar tendon graft: anterior knee.'],
      [{ th: true, html: 'Knee arthroscopy' }, 'Mild', 'Intra-articular local anaesthetic and port infiltration; blocks rarely needed.'],
      [{ th: true, html: 'Tibial plateau, distal femur, patella fixation' }, 'Bone and joint', 'Femoral nerve or fascia iliaca (distal femur, patella) ± sciatic for the tibia; discuss compartment syndrome monitoring for tibial fractures.'],
      [{ th: true, html: 'Revision or chronic pain patient' }, 'Severe, prolonged', 'Consider catheters (adductor canal), ketamine and specialist input; set expectations early.'],
    ],
  }));

  sec.append(callout('key', {
    title: 'The evidence in five lines',
    body: `<ol><li>Adductor canal versus femoral nerve block: similar pain and opioid use; better quadriceps strength and mobilisation with the adductor canal block.</li>
<li>But they are not equivalent: in a small blinded trial, a femoral block given on top of a working adductor canal block still lowered pain (the vasti and anterior cutaneous nerves were missed).</li>
<li>Adductor canal block plus infiltration beats either alone for early pain; a continuous adductor canal catheter adds little on top of a single shot with infiltration.</li>
<li>Without infiltration, iPACK added to an adductor canal block lowers pain for up to a day and improves early function, without reducing opioid use; with infiltration, it adds nothing measurable.</li>
<li>On top of a complete plan (spinal morphine, infiltration, dexamethasone, adductor canal block), stacking iPACK, repeat blocks, ketamine and dexmedetomidine did not lower opioid use and caused more hypotension.</li></ol>`,
  }));
  sec.append(callout('warn', {
    title: 'Count the milligrams',
    body: '<p>Blocks and infiltration add up. Example, 70 kg patient: three-target femoral triangle technique <strong>50 mg</strong> + iPACK <strong>40 mg</strong> = <strong>90 mg</strong> of ropivacaine before the surgeon starts; periarticular infiltration often adds <strong>300 mg or more</strong>. The commonly quoted maximum for ropivacaine is about <strong>3 mg/kg</strong> (about 210 mg at 70 kg). Infiltration doses above that are used, with adrenaline and slow absorption from the wound, but agree with the surgeon who gives what, keep block solutions dilute, and take extra care with bilateral knees, the elderly, and low body weight.</p>',
  }));
  sec.append(callout('warn', {
    title: 'Before the first walk',
    body: '<p>“Motor sparing” is relative. Check <strong>quadriceps strength</strong> (straight-leg raise, knee extension against resistance) and <strong>ankle dorsiflexion</strong> before the patient stands, and have physiotherapy supervise the first walk. Document a neurological examination after any posterior block, so that a surgical common peroneal palsy is not mistaken for the block (or the reverse).</p>',
  }));
  sec.append(callout('pearl', {
    title: 'For the viva',
    body: '<p>“For a primary knee replacement under spinal anaesthesia I would follow the PROSPECT recommendations: paracetamol, an NSAID if not contraindicated, IV dexamethasone, a single-shot adductor canal block and periarticular infiltration by the surgeon. I would avoid a femoral nerve block because quadriceps weakness delays mobilisation and increases falls. If the surgeon does not infiltrate, I would add iPACK for the posterior capsule and a superficial injection for the anterior femoral cutaneous nerves.”</p>',
  }));

  registerSearch([
    { title: 'Plan builder: knee replacement', text: 'plan builder motor sparing TKR total knee replacement arthroplasty PROSPECT femoral nerve block adductor canal iPACK genicular infiltration LIA sciatic quadriceps foot drop', id: 'kn-plan' },
    { title: 'Knee operations: suggested plans', text: 'unicompartmental UKR ACL reconstruction arthroscopy tibial plateau patella revision', id: 'kn-st-ops' },
  ]);
}
