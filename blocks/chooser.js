/* The operation data and the "Which block for which operation" chooser, shared by /blocks/ (search results link to it) and
   /blocks/indication/ (where the chooser lives). No clinical text is written here: operations, block names and links come
   from the ops modules (shared/regional/js/ops/); each region's own coverage figure is drawn for the open operation.
   mountChooser() expects the markup of blocks/indication/index.html (#bd-chips, #bd-opq, #bd-ops, #bd-result-col …) and
   returns { open(key, opts), close(), current }. Import it as chooser.js?v=20261026 from both pages. */
import * as UL from '../shared/regional/js/ops/ops-upperlimb.js?v=20261016';
import * as TR from '../shared/regional/js/ops/ops-truncal.js?v=20261015';
import * as HN from '../shared/regional/js/ops/ops-headneck.js?v=20261015';
import * as LL from '../shared/regional/js/ops/ops-lowerlimb.js?v=20261015';

/* ------------------------------------------------------------------ helpers */
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k) { try { return window.sessionStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.sessionStorage.setItem(k, v); } catch { /* storage blocked */ } },
};
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const ARROW = '<span aria-hidden="true">→</span>';
export const ICON = {
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
};

/* ------------------------------------------------------------------ operations from the four ops modules */
// Each region: where its pages live (relative to /blocks/), its landing, and how to turn a block key into a link.
// Links are site-absolute (from this module's own URL), so they work from /blocks/ and from /blocks/indication/.
const ROOT = new URL('../', import.meta.url).pathname;
export const SRC = {
  'upper-limb': {
    title: 'Upper limb', short: 'Upper limb', base: `${ROOT}upper-limb/`, mod: UL,
    link: (k) => (UL.LINKS[k] ? { href: `${ROOT}upper-limb/${UL.LINKS[k][0]}`, name: UL.LINKS[k][1], page: UL.LINKS[k][2] } : null),
  },
  trunk: {
    title: 'Trunk', short: 'Trunk', base: `${ROOT}truncal/`, mod: TR,
    link: (k) => (TR.BLOCK_LINKS[k] ? { href: `${ROOT}truncal/${TR.BLOCK_LINKS[k]}`, name: TR.BLOCK_NAMES[k] || k, page: TR.PAGE_NAMES[TR.BLOCK_LINKS[k].split('#')[0]] } : null),
  },
  'head-neck': {
    title: 'Head and neck', short: 'Head and neck', base: `${ROOT}head-neck/`, mod: HN,
    link: (k) => (HN.LINKS[k] ? { href: `${ROOT}head-neck/${HN.LINKS[k][0]}`, name: HN.LINKS[k][1], page: HN.LINKS[k][2] } : null),
  },
  'lower-limb': {
    title: 'Lower limb', short: 'Lower limb', base: `${ROOT}lower-limb/`, mod: LL,
    link: (k) => (LL.LINKS[k] ? { href: `${ROOT}lower-limb/${LL.LINKS[k][0]}`, name: LL.LINKS[k][1], page: LL.LINKS[k][2] } : null),
  },
};
const LL_GROUPS = Object.fromEntries(LL.OP_REGIONS);
const UL_GROUPS = Object.fromEntries(UL.OP_REGIONS);

/** One list of operations: {key, region, id, name, group, op}. key is the deep link: #op-<region>-<id>. */
export const OPS = [
  ...UL.OPS.map((op) => ({ region: 'upper-limb', op, group: UL_GROUPS[op.region] || '' })),
  ...TR.OPS.map((op) => ({ region: 'trunk', op, group: '' })),
  ...HN.OPS.map((op) => ({ region: 'head-neck', op, group: '' })),
  ...LL.OPS.map((op) => ({ region: 'lower-limb', op, group: LL_GROUPS[op.region] || '' })),
].map((o) => ({ ...o, id: o.op.id, name: o.op.name, key: `${o.region}-${o.op.id}` }));

/** Words an operation is found by: its name, the area to cover, its block options and its region. */
export function opHaystack(o) {
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
  ['avf', 'fistula', 'arteriovenous fistula'], ['ctr', 'carpal tunnel', 'carpal tunnel release'], ['rotator cuff', 'cuff repair', 'shoulder arthroscopy'],
  ['phrenic', 'diaphragm', 'hemidiaphragm'], ['icbn', 'intercostobrachial'], ['ssnb', 'suprascapular'],
  ['anaesthesia', 'anesthesia'], ['haematoma', 'hematoma'], ['oedema', 'edema'], ['exam', 'mmed', 'osce', 'viva'],
];
export function norm(s) { return String(s || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[–—-]/g, ' ').replace(/[()/,.:;]/g, ' ').replace(/\s+/g, ' ').trim(); }
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(^|[^a-z0-9])${escRe(norm(t))}${norm(t).length <= 3 ? '(?![a-z0-9])' : ''}`);
/** A query as units (each unit: a word or phrase plus its synonyms) of regular expressions; every unit must match. */
export function parse(q) {
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
export function score(units, title, more) {
  let s = 0;
  for (const alts of units) {
    let u = 0;
    for (const re of alts) { if (re.test(title)) { u = 3; break; } if (more && re.test(more)) u = 1; }
    if (!u) return 0;
    s += u;
  }
  return s;
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
    if (op.more) more = `<div class="bd-more">${optLinks(o.region, op.more)}</div>`;
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
    if (o.region === 'head-neck') fig = HN.headNeckCoverageMap(o.op, { id: `bd-map-${o.key}` });
    else if (o.region === 'upper-limb') fig = UL.upperLimbCoverageMap(o.op, { id: `bd-map-${o.key}` });
    else fig = LL.lowerLimbCoverageMap(o.op, { id: `bd-map-${o.key}` });
  } catch (err) { console.error('[blocks] figure failed', err); }
  if (fig) slot.append(fig); else slot.remove();
}

/* ------------------------------------------------------------------ chooser: list, filter, open in place */
export function mountChooser() {
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
    // The chooser lives in a collapsed part of the index: open it first (a closed box has no size to scroll to).
    const box = document.getElementById('chooser');
    if (box && box.tagName === 'DETAILS' && (hash || scroll)) box.open = true;
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
        // scrollIntoView is not used: the operation lists are overflow:hidden boxes, which count as scroll containers, and in the
        // app look the first operation ended up under the bar (scroll-margin-top lost). Scroll the page itself to the margin.
        if (r.top < bar || r.top > innerHeight * 0.45) window.scrollTo({ top: Math.max(0, r.top + scrollY - (parseFloat(getComputedStyle(target).scrollMarginTop) || 0)), behavior: scroll === 'smooth' && !reduceMotion() ? 'smooth' : 'auto' });
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
}
