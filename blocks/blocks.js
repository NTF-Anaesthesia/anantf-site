/* /blocks/: the front door of the regional anaesthesia app (plan §10, WP11).
   - the app bar (home, section menu, search, copy link, MO · Res · Con level control) in the engine's tb- classes;
   - the first-visit level picker;
   - search across every region: the block registry, every operation and the main pages and planners;
   - one "Which block for this operation" chooser over the trunk, head and neck and lower-limb operations, drawing each
     region's own coverage figure (data and figures from /shared/regional/js/ops/, shared with the region landings);
   - region cards built from the registry, and the "Anatomy in 3D" links.
   No clinical text is written here: operations, block names and links come from the ops modules and the registry. */
import { applyLevel, mountLevelControl, mountLevelPicker } from '../shared/regional/js/levels.js?v=20261015';
import { REGIONS, blocksIn } from '../shared/regional/js/registry.js?v=20261015';
import * as TR from '../shared/regional/js/ops/ops-truncal.js?v=20261015';
import * as HN from '../shared/regional/js/ops/ops-headneck.js?v=20261015';
import * as LL from '../shared/regional/js/ops/ops-lowerlimb.js?v=20261015';

/* ------------------------------------------------------------------ helpers */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k) { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
};
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ARROW = '<span aria-hidden="true">→</span>';
const ICON = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
};

/* ------------------------------------------------------------------ operations from the three ops modules */
// Each region: where its pages live (relative to /blocks/), its landing, and how to turn a block key into a link.
const SRC = {
  trunk: {
    title: 'Trunk', short: 'Trunk', base: '../truncal/', mod: TR,
    link: (k) => (TR.BLOCK_LINKS[k] ? { href: `../truncal/${TR.BLOCK_LINKS[k]}`, name: TR.BLOCK_NAMES[k] || k, page: TR.PAGE_NAMES[TR.BLOCK_LINKS[k].split('#')[0]] } : null),
  },
  'head-neck': {
    title: 'Head and neck', short: 'Head and neck', base: '../head-neck/', mod: HN,
    link: (k) => (HN.LINKS[k] ? { href: `../head-neck/${HN.LINKS[k][0]}`, name: HN.LINKS[k][1], page: HN.LINKS[k][2] } : null),
  },
  'lower-limb': {
    title: 'Lower limb', short: 'Lower limb', base: '../lower-limb/', mod: LL,
    link: (k) => (LL.LINKS[k] ? { href: `../lower-limb/${LL.LINKS[k][0]}`, name: LL.LINKS[k][1], page: LL.LINKS[k][2] } : null),
  },
};
const LL_GROUPS = Object.fromEntries(LL.OP_REGIONS);

/** One list of operations: {key, region, id, name, group, op}. key is the deep link: #op-<region>-<id>. */
const OPS = [
  ...TR.OPS.map((op) => ({ region: 'trunk', op, group: '' })),
  ...HN.OPS.map((op) => ({ region: 'head-neck', op, group: '' })),
  ...LL.OPS.map((op) => ({ region: 'lower-limb', op, group: LL_GROUPS[op.region] || '' })),
].map((o) => ({ ...o, id: o.op.id, name: o.op.name, key: `${o.region}-${o.op.id}` }));

/** Words an operation is found by: its name, the area to cover, its block options and its region. */
function opHaystack(o) {
  const op = o.op;
  const cover = typeof op.cover === 'string' ? op.cover : op.cover?.text || '';
  const items = (op.groups || []).flatMap((g) => g.items.map((it) => `${it.name} ${(it.blocks || []).map((k) => SRC[o.region].link(k)?.name || '').join(' ')}`));
  return norm([o.name, cover, op.line || '', SRC[o.region].title, o.group, ...items].join(' '));
}

/* ------------------------------------------------------------------ search: synonyms, scoring */
// Groups of words that mean the same thing to a reader, merged from the region pages' search synonyms.
const SYN = [
  ['tap', 'transversus abdominis plane'], ['ql', 'quadratus lumborum'], ['rsb', 'rectus sheath'],
  ['esp', 'erector spinae'], ['pvb', 'tpvb', 'paravertebral'], ['sap', 'serratus'], ['pecs', 'pectoral', 'interpectoral', 'pectoserratus'],
  ['iih', 'ilioinguinal', 'iliohypogastric', 'ii/ih', 'hernia', 'inguinal hernia', 'hernia repair'],
  ['last', 'toxicity', 'local anaesthetic systemic toxicity', 'lipid', 'intralipid'],
  ['dose', 'maximum dose', 'max dose', 'mg/kg', 'dose budget', 'total dose'],
  ['lap chole', 'cholecystectomy'], ['hepatectomy', 'liver resection', 'whipple', 'upper abdominal'],
  ['rib', 'rib fracture', 'rib fractures', 'chest trauma'], ['thoracotomy', 'vats', 'thoracic surgery'],
  ['mastectomy', 'breast', 'breast surgery'], ['nephrectomy', 'kidney'], ['sternotomy', 'cardiac surgery', 'parasternal'],
  ['cea', 'carotid', 'carotid endarterectomy'], ['thyroid', 'parathyroid'], ['craniotomy', 'head pins', 'scalp'],
  ['ati', 'afoi', 'awake intubation', 'awake tracheal intubation', 'awake fibreoptic intubation', 'topicalisation'],
  ['eye', 'cataract', 'vitreoretinal', 'ophthalmic'], ['cleft', 'cleft lip', 'cleft palate'],
  ['nof', 'neck of femur', 'hip fracture', 'fractured neck of femur'], ['tha', 'thr', 'total hip', 'hip replacement'],
  ['dhs', 'dynamic hip screw', 'intramedullary nail'], ['ficb', 'sifi', 'fascia iliaca'], ['fnb', 'femoral nerve', 'femoral'],
  ['lfcn', 'lateral femoral cutaneous', 'meralgia'], ['tkr', 'tka', 'total knee', 'knee replacement'],
  ['acb', 'adductor canal', 'femoral triangle', 'saphenous'], ['acl', 'cruciate', 'acl reconstruction'],
  ['bka', 'below knee amputation', 'below-knee amputation'], ['aka', 'above knee amputation', 'above-knee amputation'],
  ['amputation', 'amputations', 'stump'], ['turbt', 'bladder tumour', 'obturator jerk'],
  ['popliteal', 'pop', 'sciatic'], ['bunion', 'hallux valgus', 'forefoot'], ['ankle', 'ankle fracture', 'orif'],
  ['diabetic foot', 'foot debridement', 'toe amputation', 'ray amputation'],
  ['spinal', 'sab', 'subarachnoid', 'intrathecal', 'neuraxial'], ['pdph', 'post-dural puncture headache', 'headache'],
  ['3d', 'three d', 'anatomy in 3d', '3d model'], ['isb', 'interscalene', 'shoulder'],
  ['axillary', 'hand', 'forearm', 'elbow'], ['supraclavicular', 'scb'], ['infraclavicular', 'icb'],
  ['anaesthesia', 'anesthesia'], ['haematoma', 'hematoma'], ['oedema', 'edema'], ['exam', 'mmed', 'osce', 'viva'],
];
function norm(s) { return String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—-]/g, ' ').replace(/[()/,.:;]/g, ' ').replace(/\s+/g, ' ').trim(); }
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(^|[^a-z0-9])${escRe(norm(t))}${norm(t).length <= 3 ? '(?![a-z0-9])' : ''}`);
/** A query as units (each unit: a word or phrase plus its synonyms) of regular expressions; every unit must match. */
function parse(q) {
  const words = norm(q).split(' ').filter(Boolean);
  const units = [];
  for (let i = 0; i < words.length;) {
    let hit = null; let n = Math.min(4, words.length - i);
    for (; n >= 1 && !hit; n--) {
      const phrase = words.slice(i, i + n).join(' ');
      const row = SYN.find((r) => r.some((t) => norm(t) === phrase));
      if (row) hit = [phrase, ...row];
      if (hit) { i += n; break; }
    }
    if (!hit) { hit = [words[i]]; i += 1; }
    units.push([...new Set(hit.map(norm))].map(termRe));
  }
  return units;
}
/** Score one item: 3 for a title or alias hit, 1 for other text; 0 if any unit is missing. */
function score(units, title, more) {
  let s = 0;
  for (const alts of units) {
    let u = 0;
    for (const re of alts) { if (re.test(title)) { u = 3; break; } if (more && re.test(more)) u = 1; }
    if (!u) return 0;
    s += u;
  }
  return s;
}

const REGION_TITLE = Object.fromEntries(REGIONS.map((r) => [r.id, r.title]));
// Pages, apps and planners worth finding by name (titles as the pages word them).
const PAGES = [
  { t: 'Truncal blocks', d: 'Back, chest wall and abdominal wall; the truncal operation chooser', href: '../truncal/', k: 'Trunk' },
  { t: 'Back (paraspinal) blocks', d: 'ESP, MTP and thoracic paravertebral', href: '../truncal/back/', k: 'Trunk' },
  { t: 'Chest wall blocks', d: 'Serratus anterior, PECS, parasternal, clavipectoral', href: '../truncal/chest-wall/', k: 'Trunk' },
  { t: 'Abdominal wall blocks', d: 'TAP, rectus sheath, quadratus lumborum, ilioinguinal', href: '../truncal/abdominal-wall/', k: 'Trunk' },
  { t: 'Head and neck blocks', d: 'Cervical plexus, scalp, face, airway and eye; the operation chooser', href: '../head-neck/', k: 'Head and neck' },
  { t: 'Cervical plexus', d: 'Superficial, intermediate and deep cervical plexus blocks', href: '../head-neck/cervical/', k: 'Head and neck' },
  { t: 'Scalp and occipital', d: 'Scalp block and greater occipital nerve block', href: '../head-neck/scalp/', k: 'Head and neck' },
  { t: 'Face', d: 'Supraorbital, infraorbital and mental nerve blocks', href: '../head-neck/face/', k: 'Head and neck' },
  { t: 'Airway', d: 'Topical anaesthesia and airway blocks for awake intubation', href: '../head-neck/airway/', k: 'Head and neck' },
  { t: 'Eye', d: 'Sub-Tenon’s, peribulbar and retrobulbar blocks', href: '../head-neck/eye/', k: 'Head and neck' },
  { t: 'Lower-limb blocks', d: 'Hip, knee, foot and ankle, thigh and amputation; the operation chooser', href: '../lower-limb/', k: 'Lower limb' },
  { t: 'Hip', d: 'PENG, fascia iliaca, femoral and LFCN blocks; the hip fracture pathway', href: '../lower-limb/hip/', k: 'Lower limb' },
  { t: 'Knee', d: 'Adductor canal, iPACK, genicular and obturator blocks', href: '../lower-limb/knee/', k: 'Lower limb' },
  { t: 'Foot and ankle', d: 'Popliteal sciatic, saphenous and ankle blocks', href: '../lower-limb/foot-ankle/', k: 'Lower limb' },
  { t: 'Thigh and amputation', d: 'Sciatic approaches, the amputation planner and block combinations', href: '../lower-limb/thigh/', k: 'Lower limb' },
  { t: 'Hip fracture: the regional pathway', d: 'ED block, positioning for spinal, block by operation', href: '../lower-limb/hip/#ch-pathway', k: 'Lower limb' },
  { t: 'Amputation planner', d: 'Above- and below-knee amputation under nerve blocks: which nerves, what dose', href: '../lower-limb/thigh/#ch-amputation', k: 'Lower limb' },
  { t: 'Block combinations for the whole lower limb', d: 'Operation, blocks and total dose for every lower-limb operation', href: '../lower-limb/thigh/#ch-combinations', k: 'Lower limb' },
  { t: 'Brachial plexus', d: '3D model, labelled diagram, ultrasound and coverage for the brachial plexus blocks', href: '../brachial-plexus/', k: 'Upper limb' },
  { t: 'Cervical, lumbar and sacral plexuses in 3D', d: 'Anatomy in 3D linked to a labelled diagram', href: '../plexus/', k: 'Anatomy in 3D' },
  { t: 'Spinal anaesthesia', d: 'Ward card, anatomy, pharmacology, technique, troubleshooting, complications', href: '../spinal/', k: 'Neuraxial' },
  { t: 'Ward card', d: 'Spinal anaesthesia', href: '../spinal/#ch-card', k: 'Neuraxial' },
  { t: 'Spinal technique', d: 'Spinal anaesthesia', href: '../spinal/#ch-technique', k: 'Neuraxial' },
  { t: 'Difficult backs and ultrasound', d: 'Spinal anaesthesia', href: '../spinal/#ch-backs', k: 'Neuraxial' },
  { t: 'Spinal troubleshooting', d: 'Spinal anaesthesia', href: '../spinal/#ch-trouble', k: 'Neuraxial' },
  { t: 'Complications and aftercare', d: 'Spinal anaesthesia', href: '../spinal/#ch-complications', k: 'Neuraxial' },
  { t: 'Local anaesthetic systemic toxicity (LAST)', d: 'The emergency steps, lipid doses and total-dose limits', href: '../spinal/#cx-last', k: 'Emergency' },
  { t: 'Anatomy in 3D', d: 'Brachial, cervical, lumbar and sacral plexuses, linked to a labelled diagram', href: '#anatomy3d', k: 'On this page' },
  { t: 'Maximum local anaesthetic dose', d: 'Dose planners and total-dose limits', href: '#doses', k: 'On this page' },
];
const rel = (url) => (url.startsWith('/') ? `..${url}` : url);

function buildIndex() {
  const out = [];
  for (const r of REGIONS) for (const b of blocksIn(r.id)) {
    out.push({ kind: 'Block', where: REGION_TITLE[b.region], t: b.title, href: rel(b.url), tl: norm(`${b.title} ${(b.aliases || []).join(' ')} ${b.id}`), ml: norm(REGION_TITLE[b.region]) });
  }
  for (const o of OPS) {
    out.push({ kind: 'Operation', where: SRC[o.region].title, t: o.name, href: `#op-${o.key}`, op: o.key, tl: norm(o.name), ml: opHaystack(o) });
  }
  for (const p of PAGES) out.push({ kind: 'Page', where: p.k, t: p.t, d: p.d, href: p.href, tl: norm(p.t), ml: norm(`${p.d} ${p.k}`) });
  return out;
}
let INDEX = null;

function runSearch(q) {
  const units = parse(q);
  if (!units.length) return [];
  INDEX = INDEX || buildIndex();
  const kindRank = { Block: 0, Operation: 1, Page: 2 };
  return INDEX.map((e, i) => ({ e, s: score(units, e.tl, e.ml), i }))
    .filter((r) => r.s > 0)
    // Many results whose title matches every word: drop the ones found only in their wider text.
    .filter((r, _, all) => r.s >= 3 * units.length || all.filter((x) => x.s >= 3 * units.length).length < 5)
    .sort((a, b) => b.s - a.s || kindRank[a.e.kind] - kindRank[b.e.kind] || a.i - b.i)
    .map((r) => r.e)
    .filter((e, i, all) => all.findIndex((x) => x.href === e.href) === i)
    .slice(0, 14);
}

function wireSearch() {
  const q = $('#bd-q');
  const list = $('#bd-res');
  const status = $('#bd-res-status');
  let timer = 0;
  const render = () => {
    const v = q.value.trim();
    list.textContent = '';
    if (!v) { status.textContent = ''; return; }
    const res = runSearch(v);
    if (!res.length) {
      list.innerHTML = '<li class="tb-sres-none">No results. Try a block, a nerve or an operation, for example “TAP”, “hip fracture” or “LAST”.</li>';
      status.textContent = 'No results';
      return;
    }
    status.textContent = `${res.length} result${res.length === 1 ? '' : 's'}`;
    list.innerHTML = res.map((r) => `<li><a class="tb-sres" href="${esc(r.href)}"${r.op ? ` data-op="${esc(r.op)}"` : ''}>
      <span class="tb-sres-c">${esc(r.kind)} · ${esc(r.where)}</span>
      <span class="tb-sres-t">${esc(r.t)}</span>${r.d ? `<span class="tb-sres-s">${esc(r.d)}</span>` : ''}</a></li>`).join('');
  };
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 140); });
  q.addEventListener('search', () => { if (!q.value) render(); });
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); render(); $('a', list)?.click(); }
    else if (e.key === 'ArrowDown') { const f = $('a', list); if (f) { e.preventDefault(); f.focus(); } }
    else if (e.key === 'Escape') { q.value = ''; render(); }
  });
  list.addEventListener('keydown', (e) => {
    const links = $$('a', list);
    const i = links.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); links[Math.min(i + 1, links.length - 1)].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); (i ? links[i - 1] : q).focus(); }
    else if (e.key === 'Escape') { q.focus(); }
  });
  // An operation result opens it in the chooser below (the hash handler does the work; this covers a repeat click).
  list.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-op]');
    if (!a) return;
    e.preventDefault();
    chooser.open(a.dataset.op, { scroll: true, focus: true, push: true });
  });
}

/* ------------------------------------------------------------------ chooser: result rendering per region */
function optLinks(region, keys) {
  const seen = new Set();
  const links = (keys || []).map((k) => SRC[region].link(k)).filter((l) => l && !seen.has(l.href) && seen.add(l.href));
  if (!links.length) return '';
  return `<div class="tb-opt-links">${links.map((l) => `<a class="bd-opt-link" href="${esc(l.href)}">Open ${esc(l.name)} <span class="bd-opt-pg">(${esc(l.page)})</span> ${ARROW}</a>`).join('')}</div>`;
}
function groupsHtml(o) {
  return o.op.groups.map((g) => {
    const not = /^Not/i.test(g.label);
    return `<h4 class="bd-opt-h${not ? ' bd-opt-h--no' : ''}">${esc(g.label)}</h4>
    <ul class="bd-opts${not ? ' bd-opts--no' : ''}">${g.items.map((it) => `
      <li class="bd-opt">
        <p class="bd-opt-name">${esc(it.name)}</p>
        ${it.dose ? `<p class="bd-opt-dose"><span class="bd-k">Dose</span> ${esc(it.dose)}</p>` : ''}
        ${it.why ? `<p class="bd-opt-why">${esc(it.why)}</p>` : ''}
        ${optLinks(o.region, it.blocks)}
      </li>`).join('')}
    </ul>`;
  }).join('');
}
const listHtml = (arr) => arr.map((t) => `<li>${esc(typeof t === 'string' ? t : t.text)}</li>`).join('');

/** The result for one operation, as the region's own landing shows it, with its own figure. */
function resultHtml(o) {
  const op = o.op;
  const facts = [];
  let lineHtml = '';
  let figHtml = '';
  let more = '';
  const val = (v) => `<span class="bd-val">${esc(v)}</span>`;
  if (o.region === 'trunk') {
    facts.push(['Dermatomes to cover', val(op.cover.text) + (op.cover.derivedNote ? `<span class="bd-dnote">${esc(op.cover.derivedNote)}</span>` : '')]);
    facts.push(['Single-shot level', val(op.single.text)]);
    facts.push(['Sides', val(op.side === 'one' ? 'One side' : 'Both sides')]);
    figHtml = `<figure class="bd-fig bd-fig--torso">${TR.truncalCoverageMap(op, { uid: o.key })}
      <figcaption><ul class="bd-legend">
        <li><span class="bd-sw bd-sw--spread" aria-hidden="true"></span>Dermatomes to cover${op.side === 'one' ? ' (one side, either)' : ' (both sides)'}</li>
        ${op.single.levels.length ? '<li><span class="bd-sw bd-sw--inj" aria-hidden="true"></span>Single-shot level</li>' : ''}
        ${(op.marks || []).length ? '<li><span class="bd-sw bd-sw--cut" aria-hidden="true"></span>Incision or ports (schematic)</li>' : ''}
      </ul>
      ${op.cover.example ? `<p class="bd-fig-note">${esc(op.cover.example)}</p>` : ''}
      <p class="bd-fig-note">Schematic, front view. Nipple about T4, xiphoid T6, umbilicus T10, groin L1.</p></figcaption></figure>`;
  } else if (o.region === 'head-neck') {
    facts.push(['Area to cover', val(op.cover.text)]);
    if (op.map) figHtml = '<div class="bd-fig bd-fig-slot"></div>';
  } else {
    lineHtml = `<p class="bd-line"><span class="bd-k">In one line</span>${esc(op.line)}</p>`;
    facts.push(['Area to cover', val(op.cover)]);
    if (op.tq) facts.push(['Tourniquet', `<span class="bd-dd">${esc(op.tq)}</span>`]);
    if (op.map) figHtml = '<div class="bd-fig bd-fig-slot"></div>';
    if (op.more) more = `<div class="bd-more">${optLinks('lower-limb', op.more)}</div>`;
  }
  const factHtml = facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  const landing = `${SRC[o.region].base}#op-${op.id}`;
  return `
    <div class="bd-res-head">
      <p class="bd-res-k">${esc(SRC[o.region].title)}${o.group ? ` · ${esc(o.group)}` : ''}</p>
      <h3 class="bd-res-title" id="bd-res-title" tabindex="-1">${esc(op.name)}${op.brief ? ' <span class="bd-brief">Brief</span>' : ''}</h3>
    </div>
    ${lineHtml}
    <div class="bd-res-grid${figHtml ? '' : ' bd-res-grid--text'}">
      ${figHtml}
      <div class="bd-res-text">
        <dl class="bd-facts">${factHtml}</dl>
        <h4 class="bd-sub">Block options</h4>
        ${groupsHtml(o)}
        ${op.misses ? `<h4 class="bd-sub">What they miss</h4><ul class="bd-notes bd-notes--miss">${listHtml(op.misses)}</ul>` : ''}
        ${op.notes?.length ? `<h4 class="bd-sub">Practical notes</h4><ul class="bd-notes">${listHtml(op.notes)}</ul>` : ''}
        ${more}
        <p class="bd-landing"><a href="${esc(landing)}">See it on the ${esc(SRC[o.region].mod.REGION.title.replace(/^./, (c) => c.toLowerCase()))} page ${ARROW}</a></p>
      </div>
    </div>`;
}
function mountFigure(o, box) {
  const slot = $('.bd-fig-slot', box);
  if (!slot) return;
  let fig = null;
  try {
    fig = o.region === 'head-neck' ? HN.headNeckCoverageMap(o.op, { id: `bd-map-${o.key}` }) : LL.lowerLimbCoverageMap(o.op, { id: `bd-map-${o.key}` });
  } catch (err) { console.error('[blocks] figure failed', err); }
  if (fig) slot.append(fig); else slot.remove();
}

/* ------------------------------------------------------------------ chooser: list, filter, open in place */
const chooser = (() => {
  const opsBox = $('#bd-ops');
  const col = $('#bd-result-col');
  const chips = $('#bd-chips');
  const q = $('#bd-opq');
  const status = $('#bd-ops-status');
  const wide = matchMedia('(min-width: 1000px)');
  const result = document.createElement('div');
  result.className = 'bd-result';
  result.id = 'bd-result';
  result.setAttribute('role', 'region');
  result.setAttribute('aria-label', 'Block options for the chosen operation');
  result.hidden = true;
  const HAY = new Map(OPS.map((o) => [o.key, opHaystack(o)]));
  let filter = store.get('bd-filter') || 'all';
  if (filter !== 'all' && !SRC[filter]) filter = 'all';
  let current = null;

  const regions = Object.keys(SRC);
  chips.innerHTML = [['all', 'All', OPS.length], ...regions.map((r) => [r, SRC[r].title, OPS.filter((o) => o.region === r).length])]
    .map(([id, t, n]) => `<button type="button" class="bd-chip" data-region="${id}" aria-pressed="false">${esc(t)} <span class="bd-chip-n">${n}</span></button>`).join('');

  // The list: one heading per region (and per lower-limb group), one button per operation.
  let html = '';
  for (const r of regions) {
    html += `<section class="bd-ops-region" data-region="${r}"><h3 class="bd-ops-h">${esc(SRC[r].title)}</h3>`;
    let group = null;
    for (const o of OPS.filter((x) => x.region === r)) {
      if (o.group && o.group !== group) { if (group !== null) html += '</ul>'; html += `<p class="bd-ops-g">${esc(o.group)}</p><ul class="bd-ops-list">`; group = o.group; }
      else if (group === null) { html += '<ul class="bd-ops-list">'; group = ''; }
      html += `<li data-key="${o.key}"><button type="button" class="bd-op" data-key="${o.key}" aria-expanded="false" aria-controls="bd-result"><span class="bd-op-t">${esc(o.name)}</span><span class="bd-op-c" aria-hidden="true"></span></button></li>`;
    }
    html += '</ul></section>';
  }
  html += '<p class="bd-ops-none" hidden>No operation matches. Try another word, or choose All.</p>';
  opsBox.innerHTML = html;

  function applyFilter() {
    $$('.bd-chip', chips).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.region === filter)));
    const units = parse(q.value);
    const inRegion = (o) => filter === 'all' || o.region === filter;
    const sc = new Map(OPS.map((o) => [o.key, units.length && inRegion(o) ? score(units, norm(o.name), HAY.get(o.key)) : 0]));
    // When several operation names match, list those only (not every operation that mentions the word somewhere).
    const strong = [...sc.values()].filter((v) => v >= 3 * units.length).length;
    let shown = 0;
    $$('li[data-key]', opsBox).forEach((li) => {
      const o = OPS.find((x) => x.key === li.dataset.key);
      const v = sc.get(o.key);
      const ok = inRegion(o) && (!units.length || (strong >= 3 ? v >= 3 * units.length : v > 0));
      li.hidden = !ok;
      if (ok) shown++;
    });
    $$('.bd-ops-list', opsBox).forEach((ul) => {
      const any = $$('li', ul).some((li) => !li.hidden);
      ul.hidden = !any;
      const g = ul.previousElementSibling;
      if (g?.classList.contains('bd-ops-g')) g.hidden = !any;
    });
    $$('.bd-ops-region', opsBox).forEach((s) => { s.hidden = !$$('li', s).some((li) => !li.hidden); });
    $('.bd-ops-none', opsBox).hidden = shown > 0;
    status.textContent = `${shown} operation${shown === 1 ? '' : 's'}`;
    // The open result stays only while its operation is in the list.
    if (current && $(`li[data-key="${current.key}"]`, opsBox)?.hidden) close();
    else place();
  }

  /** Where the result lives: under its row on phones and tablets (opens in place), in the right column on wide screens. */
  function place() {
    // Wide screens have a result column: never leave it empty (as on the region landings, the first operation shows).
    if (!current && wide.matches) {
      const first = $$('li[data-key]:not([hidden])', opsBox).find((li) => !li.closest('[hidden]'));
      if (first) { open(first.dataset.key, { announce: false, hash: false }); return; }
    }
    if (!current) { result.hidden = true; return; }
    result.hidden = false;
    if (wide.matches) { if (result.parentElement !== col) col.append(result); }
    else {
      const li = $(`li[data-key="${current.key}"]`, opsBox);
      if (li && result.parentElement !== li) li.append(result);
    }
  }

  function paintRows() {
    $$('.bd-op', opsBox).forEach((b) => b.setAttribute('aria-expanded', String(!!current && b.dataset.key === current.key)));
    $$('li[data-key]', opsBox).forEach((li) => li.classList.toggle('is-open', !!current && li.dataset.key === current.key));
  }

  function close() {
    current = null;
    result.hidden = true;
    result.textContent = '';
    paintRows();
    if (wide.matches) place();
    try { history.replaceState(null, '', `${location.pathname}${location.search}#chooser`); } catch { /* sandbox */ }
  }

  /** Open an operation. key: '<region>-<id>' or a bare op id when it is unique. */
  function open(key, { scroll = false, focus = false, push = false, announce = true, hash = true } = {}) {
    const o = OPS.find((x) => x.key === key) || (OPS.filter((x) => x.id === key).length === 1 ? OPS.find((x) => x.id === key) : null);
    if (!o) return false;
    // A deep link to an operation hidden by the filter: show it.
    const li = $(`li[data-key="${o.key}"]`, opsBox);
    if (li?.hidden) { filter = 'all'; q.value = ''; store.set('bd-filter', filter); applyFilter(); }
    current = o;
    result.innerHTML = resultHtml(o);
    mountFigure(o, result);
    paintRows();
    place();
    if (hash) try { history[push ? 'pushState' : 'replaceState'](null, '', `${location.pathname}${location.search}#op-${o.key}`); } catch { /* sandbox */ }
    if (announce) status.textContent = `${o.name}: block options shown.`;
    if (scroll) {
      // Phones: the tapped row goes to the top (under the bar) with its result below it. Wide: the result title.
      const target = wide.matches ? ($('.bd-res-head', result) || $('#bd-res-title', result)) : $(`li[data-key="${o.key}"]`, opsBox);
      requestAnimationFrame(() => {
        const r = target.getBoundingClientRect();
        const bar = $('#tb-bar')?.getBoundingClientRect().bottom || 0;
        if (r.top < bar || r.top > innerHeight * 0.45) target.scrollIntoView({ block: 'start', behavior: scroll === 'smooth' && !reduceMotion() ? 'smooth' : 'auto' });
      });
    }
    if (focus) $('#bd-res-title', result)?.focus({ preventScroll: true });
    return true;
  }

  chips.addEventListener('click', (e) => {
    const b = e.target.closest('.bd-chip');
    if (!b) return;
    filter = b.dataset.region;
    store.set('bd-filter', filter);
    applyFilter();
  });
  let t = 0;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(applyFilter, 120); });
  q.addEventListener('search', applyFilter);
  q.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { q.value = ''; applyFilter(); }
    if (e.key === 'Enter') { e.preventDefault(); const b = $$('li[data-key]:not([hidden]) .bd-op', opsBox)[0]; if (b) { b.focus(); b.click(); } }
  });
  opsBox.addEventListener('click', (e) => {
    const b = e.target.closest('.bd-op');
    if (!b) return;
    if (current?.key === b.dataset.key && !wide.matches) { close(); return; }
    open(b.dataset.key, { scroll: e.detail ? 'smooth' : true });
  });
  // Arrow keys move between operations (each is a button, so Tab works too).
  opsBox.addEventListener('keydown', (e) => {
    if (!['ArrowDown', 'ArrowUp'].includes(e.key) || !e.target.closest('.bd-op')) return;
    const btns = $$('li[data-key]:not([hidden]) > .bd-op', opsBox).filter((b) => b.getClientRects().length);
    const i = btns.indexOf(e.target);
    const n = btns[Math.max(0, Math.min(btns.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))];
    if (n) { e.preventDefault(); n.focus(); }
  });
  wide.addEventListener?.('change', place);
  applyFilter();
  return { open, close, get current() { return current; } };
})();

/* ------------------------------------------------------------------ region cards and 3D links (from the registry) */
const PAGES_BY_REGION = {
  trunk: [['Back', '../truncal/back/'], ['Chest wall', '../truncal/chest-wall/'], ['Abdominal wall', '../truncal/abdominal-wall/']],
  'head-neck': [['Cervical plexus', '../head-neck/cervical/'], ['Scalp and occipital', '../head-neck/scalp/'], ['Face', '../head-neck/face/'], ['Airway', '../head-neck/airway/'], ['Eye', '../head-neck/eye/']],
  'lower-limb': [['Hip', '../lower-limb/hip/'], ['Knee', '../lower-limb/knee/'], ['Foot and ankle', '../lower-limb/foot-ankle/'], ['Thigh and amputation', '../lower-limb/thigh/']],
};
const OPEN_WORDS = { 'upper-limb': 'Open the brachial plexus app', trunk: 'Open truncal blocks', 'head-neck': 'Open head and neck blocks', 'lower-limb': 'Open lower-limb blocks', neuraxial: 'Open spinal anaesthesia' };
function regionCards() {
  const ul = $('#bd-cards');
  const byHref = new Map(REGIONS.map((r) => [`..${r.url}`, r]));
  $$('.bd-card', ul).forEach((card) => {
    const a = $('h3 a', card);
    const r = byHref.get(a.getAttribute('href'));
    if (!r) return;
    card.dataset.region = r.id;
    const blocks = blocksIn(r.id);
    const pages = PAGES_BY_REGION[r.id];
    const parts = [];
    if (pages) parts.push(`<ul class="bd-card-pages" aria-label="${esc(r.title)} pages">${pages.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ul>`);
    if (blocks.length > 1) {
      parts.push(`<details class="bd-card-more"><summary>All ${blocks.length} ${esc(r.title.toLowerCase())} blocks</summary><ul class="bd-card-blocks">${blocks.map((b) => `<li><a href="${esc(rel(b.url))}">${esc(b.title)}</a></li>`).join('')}</ul></details>`);
    }
    parts.push(`<a class="bd-card-link" href="${esc(a.getAttribute('href'))}">${OPEN_WORDS[r.id] || `Open ${esc(r.title)}`} ${ARROW}</a>`);
    card.insertAdjacentHTML('beforeend', parts.join(''));
    const k = document.createElement('p');
    k.className = 'bd-card-k';
    k.textContent = blocks.length > 1 ? `${blocks.length} blocks` : 'Neuraxial';
    card.prepend(k);
  });
}
function anatomyRows() {
  const rows = [
    ['Brachial plexus', 'Upper-limb blocks: 3D model, diagram and ultrasound views', '../brachial-plexus/', blocksIn('upper-limb').length],
    ['Cervical plexus', 'Superficial, intermediate and deep cervical plexus blocks', '../plexus/#plexus=cervical', null],
    ['Lumbar plexus', 'Femoral, fascia iliaca, PENG, LFCN, obturator, adductor canal', '../plexus/#plexus=lumbar', null],
    ['Sacral plexus', 'Sciatic approaches, popliteal and pudendal', '../plexus/#plexus=sacral', null],
  ];
  // Count the registry blocks that open each plexus in 3D (plan §8 table).
  const all = REGIONS.flatMap((r) => blocksIn(r.id));
  rows.forEach((row) => {
    if (row[3] != null) return;
    const id = row[2].split('=')[1];
    row[3] = all.filter((b) => b.anatomy3d?.plexus === id).length;
  });
  $('#bd-3d').innerHTML = rows.map(([t, d, h, n]) => `<li><a href="${h}"><span class="bd-row-t">${esc(t)}</span><span class="bd-row-d">${esc(d)}${n ? ` · ${n} block${n === 1 ? '' : 's'}` : ''}</span></a></li>`).join('');
}

/* ------------------------------------------------------------------ app bar */
const SECTIONS = [['start', 'Start'], ['need', 'I need to…'], ['chooser', 'Operation chooser'], ['doses', 'Maximum dose'], ['regions', 'Blocks by region'], ['anatomy3d', 'Anatomy in 3D']];
// Shorter names for the menu button on phones (the button is about 150px wide there).
const SHORT = { start: 'Start', need: 'I need to', chooser: 'Chooser', doses: 'Doses', regions: 'Regions', anatomy3d: 'In 3D' };
function appBar() {
  const bar = $('#tb-bar');
  bar.className = 'tb-bar bd-bar';
  bar.innerHTML = `<div class="tb-bar-inner site-container">
    <nav class="tb-chnav" aria-label="On this page">
      <a class="tb-bar-home tb-bar-home--back" id="tb-home-link" href="../regional.html" aria-label="Back to Regional anaesthesia">${ICON.back}<span>Regional</span></a>
      <ol class="tb-chlist" id="tb-chlist">${SECTIONS.map(([id, t]) => `<li><a href="#${id}" data-ch="${id}">${esc(t)}</a></li>`).join('')}</ol>
      <div class="tb-chmenu">
        <button type="button" class="tb-chmenu-btn" id="tb-chmenu-btn" aria-expanded="false" aria-controls="tb-chmenu"><span class="tb-chmenu-k">Go to</span><span class="tb-chmenu-cur">Start</span><span class="tb-chmenu-caret" aria-hidden="true"></span></button>
        <div class="tb-chmenu-panel" id="tb-chmenu" hidden>
          <ol class="tb-chmenu-list">${SECTIONS.map(([id, t]) => `<li><a href="#${id}" data-ch="${id}">${esc(t)}</a></li>`).join('')}</ol>
          <ul class="tb-chmenu-extra">
            <li class="tb-chmenu-search-li"><button type="button" class="tb-chmenu-act tb-chmenu-search">${ICON.search}<span>Search all blocks</span></button></li>
            <li class="tb-chmenu-share-li"><button type="button" class="tb-chmenu-act tb-chmenu-share">${ICON.link}<span>Copy link to this page</span></button></li>
            <li><a class="tb-chmenu-act" href="../regional.html">${ICON.back}<span>Regional anaesthesia</span></a></li>
          </ul>
        </div>
      </div>
    </nav>
    <button type="button" class="tb-tool tb-bar-btn" id="tb-search-open">${ICON.search}<span>Search</span></button>
    <button type="button" class="tb-tool tb-bar-btn" id="tb-share" aria-describedby="tb-share-status">${ICON.link}<span>Copy link</span></button>
    <span id="tb-share-status" class="tb-sr" role="status" aria-live="polite"></span>
    <div class="tb-bar-level"></div>
  </div>`;
  mountLevelControl($('.tb-bar-level', bar));

  const btn = $('#tb-chmenu-btn');
  const menu = $('#tb-chmenu');
  const wrap = $('.tb-chmenu', bar);
  const closeMenu = (refocus) => { if (menu.hidden) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); };
  btn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    menu.style.maxHeight = `${Math.max(200, Math.round(innerHeight - Math.max(0, bar.getBoundingClientRect().bottom) - 12))}px`;
    ($('a[aria-current]', menu) || $('a', menu)).focus();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { e.preventDefault(); closeMenu(true); return; }
    if (menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const items = $$('a,button', menu).filter((n) => n.getClientRects().length);
    const i = items.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)));
    items[n].focus();
  });
  wrap.addEventListener('focusout', (e) => { if (!wrap.contains(e.relatedTarget)) closeMenu(); });
  document.addEventListener('pointerdown', (e) => { if (!wrap.contains(e.target)) closeMenu(); });

  // Search: jump to the search box at the top of the page.
  $('#tb-search-open').addEventListener('click', () => {
    const q = $('#bd-q');
    $('#search').scrollIntoView({ block: 'start', behavior: 'auto' });
    q.focus({ preventScroll: true });
  });
  // Very narrow phones: the bar's search button moves into the menu (regional.css), so the bar can name the section.
  $('.tb-chmenu-search', bar).addEventListener('click', () => { closeMenu(); $('#tb-search-open').click(); });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); $('#tb-search-open').click(); }
  });

  // Copy link
  const status = $('#tb-share-status');
  let timer = 0;
  async function copy(b) {
    let ok = false;
    try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
      try { const ta = document.createElement('textarea'); ta.value = location.href; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0;top:0'; document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch { ok = false; }
    }
    status.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
    $('span', b).textContent = ok ? (b.id === 'tb-share' ? 'Copied' : 'Link copied') : $('span', b).textContent;
    clearTimeout(timer);
    timer = setTimeout(() => { $('#tb-share span').textContent = 'Copy link'; $('.tb-chmenu-share span').textContent = 'Copy link to this page'; status.textContent = ''; }, 2200);
  }
  $('#tb-share').addEventListener('click', (e) => copy(e.currentTarget));
  $('.tb-chmenu-share').addEventListener('click', (e) => copy(e.currentTarget));

  // Wide screens show the sections inline; when they don't fit next to the tools, the "Go to" menu instead.
  const chlist = $('#tb-chlist');
  const fit = () => { bar.classList.remove('tb-bar--menu'); if (chlist.getClientRects().length && chlist.scrollWidth > chlist.clientWidth + 1) bar.classList.add('tb-bar--menu'); };
  addEventListener('resize', fit);
  document.fonts?.ready?.then(fit);
  fit();

  // The current section: marked in the list and named on the menu button.
  const cur = $('.tb-chmenu-cur', bar);
  const secs = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
  let raf = 0;
  const paint = () => {
    raf = 0;
    const line = (bar.getBoundingClientRect().bottom || 0) + 40;
    let on = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top <= line) on = s;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = secs[secs.length - 1];
    $$('a[data-ch]', bar).forEach((a) => { if (a.dataset.ch === on.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    cur.textContent = (matchMedia('(max-width: 600px)').matches ? SHORT[on.id] : SECTIONS.find(([id]) => id === on.id)?.[1]) || 'Start';
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  paint();
}

/* ------------------------------------------------------------------ hash routing */
function route({ initial = false } = {}) {
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m) {
    if (chooser.open(m[1], { scroll: true, focus: !initial, announce: !initial })) return;
  }
  if (initial && location.hash.length > 1) {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep as is */ }
    const t = document.getElementById(id);
    if (t) requestAnimationFrame(() => t.scrollIntoView({ block: 'start', behavior: 'auto' }));
  }
}

/* ------------------------------------------------------------------ boot */
applyLevel();
appBar();
mountLevelPicker($('#bd-picker'));
wireSearch();
regionCards();
anatomyRows();
route({ initial: true });
addEventListener('hashchange', () => route());
document.body.dataset.bdReady = 'true';
