/* /blocks/: the front door of the regional anaesthesia app (plan §10, WP11).
   - the app bar (home, section menu, search, copy link, MO · Res · Con level control) in the engine's tb- classes;
   - the first-visit level picker;
   - search across every region: the block registry, every operation and the main pages and planners;
   - search finds the operations too (their results open the chooser on /blocks/indication/, where "Which block for which
     operation" lives; chooser.js has the data and the component, shared with this page);
   - the contents: Part I "Tools" (four rows, each once: Safety, Which block for which operation, Ultrasound anatomy,
     Anatomy in 3D) and one numbered Part per region, built from the registry; the Index at the end is the A–Z of blocks
     (/blocks/#chooser and #op-… move to /blocks/indication/, #wrong, #wrong-<guide> and #doses to /blocks/safety/, hash kept).
   No clinical text is written here: operations, block names, guides and links come from the ops modules, the guide data
   and the registry. */
import { applyLevel, mountLevelControl, mountLevelPicker } from '../shared/regional/js/levels.js?v=20261015';
import { registerOffline, mountAppVersion } from '../shared/regional/js/offline.js?v=20261016';
import { initAppFeel, settingsItem, settingsButton } from '../shared/regional/js/appnav.js?v=20261026';
import { REGIONS, blocksIn } from '../shared/regional/js/registry.js?v=20261015';
import { $, $$, esc, ICON, SRC, OPS, opHaystack, norm, parse, score } from './chooser.js?v=20261026';
import { GUIDES, GUIDE_ORDER } from '../shared/regional/js/data/decisions.js';



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
  { t: 'Upper-limb blocks', d: 'Shoulder, arm, forearm and hand; the upper-limb operation chooser', href: '../upper-limb/', k: 'Upper limb' },
  { t: 'Shoulder', d: 'Interscalene, superior trunk, suprascapular and axillary nerve blocks; sparing the diaphragm', href: '../upper-limb/shoulder/', k: 'Upper limb' },
  { t: 'Arm', d: 'Supraclavicular, infraclavicular, costoclavicular, RAPTIR and axillary blocks', href: '../upper-limb/arm/', k: 'Upper limb' },
  { t: 'Forearm and hand', d: 'Median, ulnar and radial nerve blocks, the wrist block, testing and rescue', href: '../upper-limb/forearm-hand/', k: 'Upper limb' },
  { t: 'Brachial plexus', d: '3D model, labelled diagram, ultrasound and coverage for the brachial plexus blocks', href: '../brachial-plexus/', k: 'Upper limb' },
  { t: 'Cervical, brachial, lumbar and sacral plexuses in 3D', d: 'Anatomy in 3D linked to a labelled diagram', href: '../plexus/', k: 'Anatomy in 3D' },
  { t: 'Spinal anaesthesia', d: 'Ward card, anatomy, pharmacology, technique, troubleshooting, complications', href: '../spinal/', k: 'Neuraxial' },
  { t: 'Ward card', d: 'Spinal anaesthesia', href: '../spinal/#ch-card', k: 'Neuraxial' },
  { t: 'Spinal technique', d: 'Spinal anaesthesia', href: '../spinal/#ch-technique', k: 'Neuraxial' },
  { t: 'Difficult backs and ultrasound', d: 'Spinal anaesthesia', href: '../spinal/#ch-backs', k: 'Neuraxial' },
  { t: 'Spinal troubleshooting', d: 'Spinal anaesthesia', href: '../spinal/#ch-trouble', k: 'Neuraxial' },
  { t: 'Complications and aftercare', d: 'Spinal anaesthesia', href: '../spinal/#ch-complications', k: 'Neuraxial' },
  { t: 'Local anaesthetic systemic toxicity (LAST)', d: 'The emergency steps, lipid doses and total-dose limits', href: '../spinal/#cx-last', k: 'Emergency' },
  { t: 'Anatomy in 3D', d: 'Brachial, cervical, lumbar and sacral plexuses, linked to a labelled diagram', href: '#anatomy3d', k: 'On this page' },
  { t: 'Maximum local anaesthetic dose', d: 'Dose planners and total-dose limits', href: 'safety/#doses', k: 'Safety' },
  { t: 'Emergency guides and dose calculator', d: 'Local anaesthetic toxicity first, then every “If it goes wrong” guide, and the dose calculator', href: 'safety/', k: 'Safety' },
  { t: 'Ultrasound anatomy', d: 'Every ultrasound-guided block by region, with a real scan where one is shown', href: 'ultrasound/', k: 'Ultrasound' },
  { t: 'Which block for which operation', d: 'Choose an operation to see the block options, doses and what they miss', href: 'indication/', k: 'Indication' },
  { t: 'Local anaesthetic dose calculator', d: 'Safe dose for this patient: weight, lean body weight, every agent and injection added up', href: 'safety/#calculator', k: 'Doses' },
];
const rel = (url) => (url.startsWith('/') ? `..${url}` : url);

function buildIndex() {
  const out = [];
  for (const r of REGIONS) for (const b of blocksIn(r.id)) {
    out.push({ kind: 'Block', where: REGION_TITLE[b.region], t: b.title, href: rel(b.url), tl: norm(`${b.title} ${(b.aliases || []).join(' ')} ${b.id}`), ml: norm(REGION_TITLE[b.region]) });
  }
  for (const o of OPS) {
    out.push({ kind: 'Operation', where: SRC[o.region].title, t: o.name, href: `indication/#op-${o.key}`, tl: norm(o.name), ml: opHaystack(o) });
  }
  for (const p of PAGES) out.push({ kind: 'Page', where: p.k, t: p.t, d: p.d, href: p.href, tl: norm(p.t), ml: norm(`${p.d} ${p.k}`) });
  for (const id of GUIDE_ORDER) {
    const g = GUIDES[id];
    out.push({ kind: 'Page', where: 'If it goes wrong', t: g.title, d: 'Step-by-step guide', href: `safety/#wrong-${id}`, tl: norm(`${g.title} ${g.short}`), ml: norm(`emergency complication went wrong ${g.when.replace(/<[^>]+>/g, ' ')}`) });
  }
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
    list.innerHTML = res.map((r) => `<li><a class="tb-sres" href="${esc(r.href)}">
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
}



/* ------------------------------------------------------------------ contents: one Part per region (from the registry) */
// Chapters of each Part: the region's pages, in reading order (titles as the pages word them). Blocks come from the registry.
const CHAPTERS = {
  'upper-limb': [['Shoulder', '../upper-limb/shoulder/'], ['Arm', '../upper-limb/arm/'], ['Forearm and hand', '../upper-limb/forearm-hand/'], ['Brachial plexus app', '../brachial-plexus/']],
  trunk: [['Back', '../truncal/back/'], ['Chest wall', '../truncal/chest-wall/'], ['Abdominal wall', '../truncal/abdominal-wall/']],
  'head-neck': [['Cervical plexus', '../head-neck/cervical/'], ['Scalp and occipital', '../head-neck/scalp/'], ['Face', '../head-neck/face/'], ['Airway', '../head-neck/airway/'], ['Eye', '../head-neck/eye/']],
  'lower-limb': [['Hip', '../lower-limb/hip/'], ['Knee', '../lower-limb/knee/'], ['Foot and ankle', '../lower-limb/foot-ankle/'], ['Thigh and amputation', '../lower-limb/thigh/']],
  neuraxial: [['Ward card', '../spinal/#ch-card'], ['Technique', '../spinal/#ch-technique'], ['Difficult backs and ultrasound', '../spinal/#ch-backs'], ['Troubleshooting', '../spinal/#ch-trouble'], ['Complications and aftercare', '../spinal/#ch-complications']],
};
/** Fill each Part with its numbered chapters and, in one fold, its blocks (chapter 7 holds blocks 7.1, 7.2 …). */
function contents() {
  let n = $$('#principles .bd-ch').length;
  for (const r of REGIONS) {
    const part = $(`.bd-part[data-region="${r.id}"]`);
    const chapters = CHAPTERS[r.id];
    if (!part || !chapters) continue;
    const blocks = blocksIn(r.id);
    const pageOf = (b) => rel(b.url).split('#')[0];
    const groups = [];
    const ol = document.createElement('ol');
    ol.className = 'bd-toc-list';
    ol.innerHTML = chapters.map(([t, href]) => {
      n += 1;
      const mine = blocks.filter((b) => pageOf(b) === href);
      if (mine.length) groups.push({ no: String(n), t, blocks: mine });
      return `<li class="bd-ch"><a class="bd-ch-link" href="${esc(href)}"><span class="bd-n">${n}</span><span class="bd-ch-t">${esc(t)}</span></a></li>`;
    }).join('');
    part.append(ol);
    // Blocks that only the 3D explorer teaches: listed after the chapters, without a number.
    const other = blocks.filter((b) => !chapters.some(([, href]) => pageOf(b) === href));
    if (other.length && blocks.length > 1) groups.push({ no: '', t: 'Shown in Anatomy in 3D', blocks: other });
    if (groups.length) {
      const total = groups.reduce((a, g) => a + g.blocks.length, 0);
      const det = document.createElement('details');
      det.className = 'bd-secs bd-secs--part';
      det.innerHTML = `<summary><span class="bd-ch-t">All ${total} blocks</span></summary><div class="bd-secs-body">${groups.map((g) => `<h4 class="bd-secs-gt">${g.no ? `<span class="bd-n">${g.no}</span>` : ''}${esc(g.t)}</h4>
        <ol class="bd-secs-list">${g.blocks.map((b, i) => `<li><a href="${esc(rel(b.url))}">${g.no ? `<span class="bd-n">${g.no}.${i + 1}</span>` : ''}<span>${esc(b.title)}</span></a></li>`).join('')}</ol>`).join('')}</div>`;
      part.append(det);
    }
  }
}

/** The A–Z: every block by its title, and its short names (ESP, TAP …) pointing at the same place. */
function azIndex() {
  const body = $('#bd-az-body');
  if (!body) return;
  const items = [];
  const seen = new Set();
  const add = (term, href, to) => { const k = `${norm(term)}|${href}`; if (!seen.has(k)) { seen.add(k); items.push({ term, href, to }); } };
  for (const r of REGIONS) for (const b of blocksIn(r.id)) {
    add(b.title, rel(b.url), '');
    for (const a of b.aliases || []) if (/^[A-Za-z0-9-]{2,7}$/.test(a)) add(a, rel(b.url), b.title);
  }
  const letter = (t) => { const c = norm(t).charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '0–9'; };
  items.sort((x, y) => norm(x.term).localeCompare(norm(y.term), 'en'));
  const by = new Map();
  items.forEach((it) => { const l = letter(it.term); if (!by.has(l)) by.set(l, []); by.get(l).push(it); });
  const id = (l) => `az-${l === '0–9' ? '0' : l}`;
  body.innerHTML = `<nav class="bd-az-jump" aria-label="Jump to a letter">${[...by.keys()].map((l) => `<a href="#${id(l)}">${esc(l)}</a>`).join('')}</nav>
    ${[...by].map(([l, arr]) => `<h4 class="bd-az-l" id="${id(l)}">${esc(l)}</h4><ul class="bd-az-list">${arr.map((it) => `<li><a href="${esc(it.href)}">${esc(it.term)}${it.to ? `<span class="bd-az-to"> · ${esc(it.to)}</span>` : ''}</a></li>`).join('')}</ul>`).join('')}`;
}

/* ------------------------------------------------------------------ app bar */
const SECTIONS = [['start', 'Start'], ['principles', 'Tools'], ['regions', 'Regions'], ['index', 'Index']];
// Shorter names for the menu button on phones (the button is about 150px wide there).
const SHORT = { start: 'Start', principles: 'Tools', regions: 'Regions', index: 'Index' };
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
  $('.tb-chmenu-extra', bar).append(settingsItem('tb-chmenu-act'));
  $('#tb-share', bar).before(settingsButton('tb-tool tb-bar-btn')); // wide bars that list the sections inline have no menu: Settings as a button

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
  // "/" and Ctrl+K / Cmd+K: the search box; the bar may hide while scrolling down (Settings); prefetch (appnav.js).
  initAppFeel({ bar, search: () => $('#tb-search-open').click() });

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
  const cur = $('.tb-chmenu-cur'); // (not inside bar: on phones in the app look the menu sits in the row under it)
  const secs = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
  let raf = 0;
  const paint = () => {
    raf = 0;
    const line = (bar.getBoundingClientRect().bottom || 0) + 40;
    let on = secs[0];
    for (const s of secs) if (s.getBoundingClientRect().top <= line) on = s;
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = secs[secs.length - 1];
    $$('.tb-chnav a[data-ch], .tb-chmenu a[data-ch]').forEach((a) => { if (a.dataset.ch === on.id) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
    cur.textContent = (matchMedia('(max-width: 600px)').matches ? SHORT[on.id] : SECTIONS.find(([id]) => id === on.id)?.[1]) || 'Start';
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });
  paint();
}

/* ------------------------------------------------------------------ hash routing */
/** Open the folds a hash points into (or at): a Part's blocks, the A–Z. A closed fold has nothing to scroll to. */
function openForHash(hash) {
  let id = String(hash || '').replace(/^#/, '');
  if (!id) return;
  try { id = decodeURIComponent(id); } catch { /* keep as is */ }
  let el = document.getElementById(id);
  while (el) { if (el.tagName === 'DETAILS') el.open = true; el = el.parentElement; }
}
function route({ initial = false } = {}) {
  openForHash(location.hash);
  if (initial && location.hash.length > 1) {
    let id = location.hash.slice(1);
    try { id = decodeURIComponent(id); } catch { /* keep as is */ }
    const t = document.getElementById(id);
    if (t) requestAnimationFrame(() => {
      t.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (id === 'search') $('#bd-q')?.focus({ preventScroll: true }); // the app's Search tab on a page with no search of its own
    });
  }
}
// A link to a fold on this page (also one to the hash already in the address) opens it before the browser scrolls.
document.addEventListener('click', (e) => {
  const a = e.target.closest?.('a[href^="#"]');
  if (a && a.getAttribute('href').length > 1) openForHash(a.getAttribute('href'));
});

/* ------------------------------------------------------------------ boot */
// Parts of this page moved to their own screens (the page also does this in an inline script in its <head>, before anything
// is drawn; keep the two in step). The chooser went to /blocks/indication/ (16 Oct 2026): #chooser and #op-… keep working.
// "If it goes wrong" and the dose planners went to /blocks/safety/ (17 Oct 2026, owner: the list had too many repeats):
// #wrong, #wrong-<guide> and #doses keep working, and the hash is kept (safety.js opens the right half).
const MOVED = [[/^#(chooser|op-[\w-]+)$/, 'indication/'], [/^#(wrong(-[\w-]+)?|doses)$/, 'safety/']];
function moved() { const hit = MOVED.find(([re]) => re.test(location.hash)); if (hit) location.replace(`${hit[1]}${location.search}${location.hash}`); }
addEventListener('hashchange', moved);
applyLevel();
appBar();
mountLevelPicker($('#bd-picker'));
wireSearch();
contents();
azIndex();
route({ initial: true });
addEventListener('hashchange', () => route());
document.body.dataset.bdReady = 'true';
mountAppVersion(document.getElementById('ra-appver'));
registerOffline();
