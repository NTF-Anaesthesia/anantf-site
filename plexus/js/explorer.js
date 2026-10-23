// Plexus explorer (cervical, brachial, lumbar and sacral): 3D anatomy + linked plexus diagram + details, one plexus at a time.
// Used by this app's own page (plexus/index.html via app.js) and by the regional block pages ("Anatomy in 3D" card).
//
//   mountExplorer(host, opts) -> controller (synchronous; controller.ready resolves once the first plexus has loaded)
//
//   opts.plexus     'cervical' | 'brachial' | 'lumbar' | 'sacral' (default cervical)
//   opts.block      block id within that plexus (optional)
//   opts.el         element id to select (optional)
//   opts.tabsHost   element to render the plexus tabs into (default: a toolbar at the top of the explorer)
//   opts.chipsHost  element to render the block chips into (default: the same toolbar)
//   opts.creditHost element for the per-plexus model credit (default: a line at the end of the explorer)
//   opts.onChange   fn({plexus, plexusName, plexusTab, block, blockName, blockShort, el}) after every state change
//   opts.onBlockPick fn(blockId) after the reader picks a block chip (the page closes its menu)
//   opts.intro      false hides the plexus introduction
//   opts.legacyIds  true: use the plexus page's historical element ids (sec-3d, info, …); only one such explorer per page
//   opts.inline     true forces mounting in this document even without an import map for three.js
//
//   controller = { root, ready, state(), setPlexus(id, want), setBlock(id), select(id), clear(), destroy() }
//
// three.js is loaded only when a viewer is mounted (viewer3d.js is a dynamic import). Pages that have no import map
// for "three" (the regional block pages) get the explorer in an iframe of plexus/index.html?embed=1 instead, so the
// controller works the same everywhere.

import { createBus } from './bus.js?v=20261015';
import { STATUS_ORDER } from '../../shared/regional/js/status.js?v=20261015';
import { countHidden, onLevel, setLevel, getLevel, relaxFor, tierMax, LEVELS } from '../../shared/regional/js/levels.js?v=20261015';

const V = '20261015d';
export const PLEXUSES = [
  { id: 'cervical', tab: 'Cervical', name: 'Cervical plexus' },
  { id: 'brachial', tab: 'Brachial', name: 'Brachial plexus' },
  { id: 'lumbar', tab: 'Lumbar', name: 'Lumbar plexus' },
  { id: 'sacral', tab: 'Sacral', name: 'Sacral plexus' },
];
export const DEFAULT_PLEXUS = 'cervical';
export const validPlexusId = (id) => PLEXUSES.some((p) => p.id === id);

const STATUS_LABEL = { target: 'Target', covers: 'Covers', variable: 'Variable', spares: 'Spares' };
const STATUS_TEXT = { target: 'Target of the injection', covers: 'Reliably blocked', variable: 'Sometimes blocked', spares: 'Usually spared' };
const KIND_LABEL = {
  root: 'Root (anterior ramus)', trunk: 'Trunk', division: 'Division', cord: 'Cord', branch: 'Branch',
  terminal: 'Terminal nerve', related: 'Related nerve, not part of this plexus',
};
const GROUP_TITLE = { root: 'Roots (anterior rami)', trunk: 'Trunks', division: 'Divisions', cord: 'Cords', branch: 'Branches', terminal: 'Terminal nerves', related: 'Related nerves (not part of this plexus)', other: 'Other' };
const FALLBACK_LEVEL_COLOURS = ['#1f6f8b', '#8c4f9f', '#2f7d32', '#b45309', '#a3123a', '#4b5563', '#0f766e', '#7c2d12', '#334155'];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BADGE = (t) => `<p class="ra-tier-badge" data-badge="${t}">${t === 3 ? 'Consultant' : 'Resident'}</p>`;

/** Swatch that shows a status the way the diagram draws it (colour and line style). */
export function statusSwatch(k) {
  return `<svg class="px-stkey" data-status="${k}" viewBox="0 0 28 12" width="28" height="12" aria-hidden="true" focusable="false">`
    + (k === 'target' ? '<line x1="3" y1="6" x2="25" y2="6" class="h"/>' : '')
    + (k === 'variable' ? '<line x1="3" y1="6" x2="25" y2="6" class="u"/>' : '')
    + '<line x1="3" y1="6" x2="25" y2="6" class="m"/></svg>';
}

// ------------------------------------------------------------------ data helpers
function normalise(raw, id) {
  if (!raw || typeof raw !== 'object') throw new Error('the data module has no default export');
  const d = { ...raw };
  d.id = d.id || id;
  d.name = d.name || `${id} plexus`;
  d.elements = d.elements && typeof d.elements === 'object' ? d.elements : {};
  for (const [k, e] of Object.entries(d.elements)) {
    if (!e || typeof e !== 'object') { delete d.elements[k]; continue; }
    e.roots = Array.isArray(e.roots) ? e.roots : [];
    e.parents = Array.isArray(e.parents) ? e.parents.filter((p) => d.elements[p]) : [];
  }
  const ids = Object.keys(d.elements);
  d.order = [...(Array.isArray(d.order) ? d.order.filter((x) => d.elements[x]) : []), ...ids].filter((x, i, a) => a.indexOf(x) === i);
  d.blocks = d.blocks && typeof d.blocks === 'object' ? d.blocks : {};
  const bids = Object.keys(d.blocks);
  d.blockOrder = [...(Array.isArray(d.blockOrder) ? d.blockOrder.filter((x) => d.blocks[x]) : []), ...bids].filter((x, i, a) => a.indexOf(x) === i);
  for (const b of Object.values(d.blocks)) for (const k of STATUS_ORDER) b[k] = Array.isArray(b[k]) ? b[k] : [];
  d.levels = Array.isArray(d.levels) ? d.levels : [];
  d.levelColours = d.levelColours && typeof d.levelColours === 'object' ? d.levelColours : {};
  d.views = d.views && typeof d.views === 'object' ? d.views : {};
  d.model = d.model || {};
  return d;
}

function makeCtx(data, nerves, bus, baseUrl) {
  const children = new Map();
  for (const [id, e] of Object.entries(data.elements)) for (const p of e.parents) {
    if (!children.has(p)) children.set(p, []);
    children.get(p).push(id);
  }
  const lineageCache = new Map();
  function lineage(id) {
    if (lineageCache.has(id)) return lineageCache.get(id);
    const out = new Set([id]);
    const up = [id];
    while (up.length) { const x = up.pop(); for (const p of data.elements[x]?.parents || []) if (!out.has(p)) { out.add(p); up.push(p); } }
    const down = [id]; const seen = new Set([id]);
    while (down.length) { const x = down.pop(); for (const c of children.get(x) || []) if (!seen.has(c)) { seen.add(c); out.add(c); down.push(c); } }
    lineageCache.set(id, out);
    return out;
  }
  function status(blockId, elId) {
    const b = data.blocks[blockId];
    if (!b) return null;
    for (const k of STATUS_ORDER) if (b[k].includes(elId)) return k;
    return null;
  }
  function levelColour(level) {
    if (data.levelColours[level]) return data.levelColours[level];
    const i = Math.max(0, data.levels.indexOf(level));
    return FALLBACK_LEVEL_COLOURS[i % FALLBACK_LEVEL_COLOURS.length];
  }
  function rootsLabel(id) {
    const r = data.elements[id]?.roots || [];
    if (!r.length) return '';
    if (r.length === 1) return r[0];
    const idx = r.map((x) => data.levels.indexOf(x));
    const contiguous = idx.every((v) => v >= 0) && idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    return contiguous ? `${r[0]}–${r[r.length - 1]}` : r.join(', ');
  }
  const name = (id) => data.elements[id]?.name || id;
  return { data, nerves, bus, lineage, status, levelColour, rootsLabel, name, baseUrl };
}

function inkOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return '#272722';
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2] > 0.36 ? '#272722' : '#ffffff';
}

// ------------------------------------------------------------------ styles for inline mounts on other pages
function ensureCss() {
  const add = (key, href) => {
    if (document.querySelector(`link[data-px-css="${key}"]`) || [...document.styleSheets].some((s) => (s.href || '').includes(href.split('?')[0].split('/').slice(-2).join('/')))) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = new URL(href, import.meta.url).href;
    l.dataset.pxCss = key;
    document.head.append(l);
  };
  add('app', 'https://design.anantf.com/v1/app.css');
  add('plexus', `../css/plexus.css?v=${V}`);
  add('levels', '../../shared/regional/css/levels.css?v=20261015');
  add('status', '../../shared/regional/css/status.css?v=20261015');
}

function hasThreeImportMap() {
  return [...document.querySelectorAll('script[type="importmap"]')].some((s) => {
    try { return !!JSON.parse(s.textContent).imports?.three; } catch { return false; }
  });
}

// ------------------------------------------------------------------ iframe fallback (pages without three.js import map)
function mountFrame(host, opts) {
  const url = new URL(`../index.html?embed=1`, import.meta.url);
  const hashOf = (s) => {
    const p = new URLSearchParams();
    p.set('plexus', validPlexusId(s.plexus) ? s.plexus : DEFAULT_PLEXUS);
    if (s.block) p.set('block', s.block);
    if (s.el) p.set('el', s.el);
    return `#${p}`;
  };
  let st = { plexus: opts.plexus || DEFAULT_PLEXUS, block: opts.block || null, el: opts.el || null };
  const frame = document.createElement('iframe');
  frame.className = 'px-embed-frame';
  frame.title = 'Plexus anatomy in 3D with a linked diagram';
  frame.setAttribute('loading', 'eager');
  frame.setAttribute('allow', 'fullscreen');
  frame.src = url.href + hashOf(st);
  // The frame is sized to its content (same origin), so it never scrolls on its own: a vertical swipe anywhere
  // outside the 3D canvas scrolls the block page, and the reader cannot get stuck inside a full-screen frame.
  // Until the content is measured (or if it cannot be), it is capped well below the viewport height.
  frame.style.cssText = 'display:block;width:100%;height:min(70vh,640px);border:1px solid #d7d2c8;background:#f7f5ef';
  frame.setAttribute('scrolling', 'no');
  host.append(frame);
  let sizeObs = null;
  const fit = () => {
    try {
      const body = frame.contentDocument?.body;
      if (!body) return;
      const h = Math.ceil(body.getBoundingClientRect().height);
      if (h > 80) frame.style.height = `${h + 2}px`;
    } catch { /* cross-origin: keep the capped height */ }
  };
  frame.addEventListener('load', () => {
    try {
      const body = frame.contentDocument?.body;
      if (!body) return;
      sizeObs?.disconnect();
      sizeObs = new (frame.contentWindow.ResizeObserver || ResizeObserver)(() => fit());
      sizeObs.observe(body);
      fit();
    } catch { frame.removeAttribute('scrolling'); }
  });
  const ready = new Promise((res) => frame.addEventListener('load', () => res(), { once: true }));
  const go = (s) => { st = { ...st, ...s }; try { frame.contentWindow.location.hash = hashOf(st); } catch { frame.src = url.href + hashOf(st); } };
  return {
    root: frame, ready, frame: true,
    state: () => ({ ...st }),
    setPlexus: (id, want = {}) => go({ plexus: id, block: want.block || null, el: want.el || null }),
    setBlock: (id) => go({ block: id || null }),
    select: (id) => go({ el: id || null }),
    clear: () => go({ block: null, el: null }),
    destroy: () => { try { sizeObs?.disconnect(); } catch { /* frame already gone */ } frame.remove(); },
  };
}

let seq = 0;
let touchHooked = false;

export function mountExplorer(host, opts = {}) {
  if (!host) throw new Error('mountExplorer needs a host element');
  if (!opts.inline && !hasThreeImportMap()) return mountFrame(host, opts);
  ensureCss();
  // iOS ignores :active press states (app kit) without a touch listener.
  if (!touchHooked) { touchHooked = true; document.addEventListener('touchstart', () => {}, { passive: true }); }
  const n = ++seq;
  const pid = (s) => `px${n}-${s}`;

  // ---------------------------------------------------------------- DOM
  const root = document.createElement('div');
  root.className = 'px px-ex';
  const ownBar = !opts.tabsHost || !opts.chipsHost;
  let bar = null;
  if (ownBar) {
    bar = document.createElement('div');
    bar.className = 'px-ex-bar';
    bar.innerHTML = `<fieldset class="px-tabs app-segmented"><legend>Plexus</legend></fieldset><div class="px-blockrow"><span class="blockbar-label" id="${pid('blk')}">Block</span><div class="chips app-chips app-chips--inline" role="group" aria-labelledby="${pid('blk')}"></div></div>`;
    root.append(bar);
  }
  const tabsHost = opts.tabsHost || bar.querySelector('.px-tabs');
  const chipsHost = opts.chipsHost || bar.querySelector('.chips');
  // The page's own explorer keeps the ids the page always had (sec-3d, h-3d, body-3d, info, …); others get a prefix.
  const legacy = !!opts.legacyIds;
  const id = (s) => (legacy ? s : pid(s));
  const SR = { '3d': 'Show or hide 3D anatomy', diagram: 'Show or hide the plexus diagram', info: 'Show or hide details' };
  const panel = (key, title, extraCls, bodyCls) => `
    <section class="panel ${extraCls}" id="${id(`sec-${key}`)}" aria-labelledby="${id(`h-${key}`)}">
      <div class="panel-head">
        <h2 id="${id(`h-${key}`)}">${title}</h2>
        <button type="button" class="collapse-btn" aria-expanded="true" aria-controls="${id(`body-${key}`)}"><span class="sr-only">${SR[key]}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      </div>
      <div class="panel-body ${bodyCls || ''}" id="${id(`body-${key}`)}">${key === 'info' ? '' : `<div class="mount mount-${key}" id="${id(`mount-${key}`)}"></div>`}</div>
    </section>`;
  root.insertAdjacentHTML('beforeend', `
    <p class="intro" id="${id('intro')}"></p>
    <div class="px-legend" id="${id('legend')}" hidden></div>
    <div class="stage">${panel('3d', '3D anatomy', 'panel-3d')}${panel('diagram', 'Plexus diagram', 'panel-diagram')}</div>
    ${panel('info', 'Details', 'panel-info', 'px-info-wrap')}`);
  const q = (s) => root.querySelector(s);
  const ui = {
    intro: q('.intro'), legend: q('.px-legend'), mount3d: q('.mount-3d'), mountDiagram: q('.mount-diagram'),
    infoWrap: q('.px-info-wrap'),
  };
  if (opts.intro === false) ui.intro.remove();
  ui.info = document.createElement('div');
  ui.info.className = 'px-info';
  ui.info.id = id('info');
  ui.info.setAttribute('aria-live', 'polite');
  // "n items hidden at MO level · Show all" (levels.js classes; one per explorer, removed with it).
  const hint = document.createElement('p');
  hint.className = 'ra-hidden-hint px-hint';
  hint.hidden = true;
  hint.innerHTML = '<span></span><button type="button">Show all</button>';
  hint.querySelector('button').addEventListener('click', () => setLevel('consultant', { save: false }));
  ui.infoWrap.append(ui.info, hint);
  let creditEl = opts.creditHost || null;
  if (!creditEl) { creditEl = document.createElement('p'); creditEl.className = 'px-ex-credit'; root.append(creditEl); }
  host.append(root);

  root.querySelectorAll('.collapse-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'false';
      btn.setAttribute('aria-expanded', String(!open));
      const body = root.querySelector(`#${CSS.escape(btn.getAttribute('aria-controls'))}`);
      if (body) body.hidden = open;
      btn.closest('.panel')?.classList.toggle('is-collapsed', open);
      if (!open) window.dispatchEvent(new Event('resize'));
    });
  });

  let current = null; // { id, data, nerves, bus, viewer, diagram, ctx }
  let loadToken = 0;
  let destroyed = false;

  const paintHint = () => {
    const k = countHidden(ui.info);
    hint.hidden = k === 0;
    if (k) hint.querySelector('span').textContent = `${k} ${k === 1 ? 'item' : 'items'} hidden at ${LEVELS[getLevel()].name} level`;
  };
  // Advanced blocks (brachial) are Consultant level, as in the brachial plexus app. Reaching one from outside the chips
  // (a link, search, a "Blocks that reach it" chip) shows it for this view only; choosing a lower level afterwards
  // falls back to the core block it is a variant of (relatedTo), as the brachial app does.
  const relaxForBlock = (bid) => {
    if (current && bid && current.data.blocks[bid]?.advanced) relaxFor(chipsHost.querySelector(`[data-block="${CSS.escape(bid)}"]`));
  };
  const offLevel = onLevel(() => {
    const blk = current?.bus.state.block;
    const b = blk && current.data.blocks[blk];
    if (b?.advanced && tierMax() < 3) current.bus.emit('block', { id: b.relatedTo && current.data.blocks[b.relatedTo] ? b.relatedTo : null, source: 'level' });
    paintHint();
  });

  function snapshot() {
    if (!current) return { plexus: null, block: null, el: null };
    const b = current.bus.state.block && current.data.blocks[current.bus.state.block];
    const p = PLEXUSES.find((x) => x.id === current.id);
    return {
      plexus: current.id, plexusName: current.data.name, plexusTab: p?.tab || current.data.tab || current.data.name,
      block: current.bus.state.block || null, blockName: b ? (b.name || current.bus.state.block) : null,
      blockShort: b ? (b.short || b.name || current.bus.state.block) : null, el: current.bus.state.selected || null,
    };
  }
  const changed = () => { if (!destroyed) opts.onChange?.(snapshot()); };

  // ---------------------------------------------------------------- tabs and chips
  // Segmented control (app kit): one radio per plexus in a fieldset, so arrow keys come free.
  function renderTabs(activeId) {
    const legend = tabsHost.querySelector(':scope > legend');
    tabsHost.replaceChildren(...(legend ? [legend] : []), ...PLEXUSES.map((p) => {
      const l = document.createElement('label');
      l.className = 'app-seg';
      l.dataset.plexus = p.id;
      const r = document.createElement('input');
      r.type = 'radio';
      r.name = pid('plexus');
      r.value = p.id;
      r.checked = p.id === activeId;
      r.addEventListener('change', () => { if (r.checked && (!current || current.id !== p.id)) loadPlexus(p.id, {}); });
      const t = document.createElement('span');
      t.textContent = p.tab;
      l.append(r, t);
      return l;
    }));
  }

  function renderChips() {
    if (!current) { chipsHost.replaceChildren(); return; }
    const { data, bus } = current;
    const mk = (id, label) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'app-chip';
      b.dataset.block = id || '';
      b.innerHTML = `<span class="chip-main">${esc(label)}</span>`;
      if (id) b.title = data.blocks[id].name || label;
      // Advanced variants (brachial plexus) are Consultant level, as in the brachial plexus app.
      if (id && data.blocks[id].advanced) b.dataset.tier = '3';
      b.setAttribute('aria-pressed', String((bus.state.block || null) === (id || null)));
      b.addEventListener('click', () => { bus.emit('block', { id: id || null, source: 'chips' }); opts.onBlockPick?.(id || null); });
      return b;
    };
    const chips = [mk(null, 'None')];
    for (const id of data.blockOrder) chips.push(mk(id, data.blocks[id].short || data.blocks[id].name || id));
    chipsHost.replaceChildren(...chips);
  }
  function syncChips() {
    const blk = current?.bus.state.block || '';
    chipsHost.querySelectorAll('.app-chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.block === blk)));
    // Phones: the chips are one sideways-scrolling row; bring the chosen one into view (row only, never the page).
    const on = blk && chipsHost.querySelector(`.app-chip[data-block="${CSS.escape(blk)}"]`);
    if (on && chipsHost.scrollWidth > chipsHost.clientWidth + 1) {
      requestAnimationFrame(() => {
        const r = chipsHost.getBoundingClientRect(); const c = on.getBoundingClientRect();
        if (c.left < r.left || c.right > r.right) chipsHost.scrollLeft += c.left - r.left - (r.width - c.width) / 2;
      });
    }
  }

  function renderLegend() {
    const blk = current?.bus.state.block;
    if (!blk) { ui.legend.hidden = true; ui.legend.replaceChildren(); return; }
    const b = current.data.blocks[blk];
    ui.legend.hidden = false;
    ui.legend.innerHTML = `<span class="px-legend-title">${esc(b.name || blk)}:</span>${STATUS_ORDER.map((k) => `<span class="px-key">${statusSwatch(k)}${esc(STATUS_TEXT[k])}</span>`).join('')}<span class="px-key">${statusSwatch('none')}Not affected</span>`;
  }

  // ---------------------------------------------------------------- info panel
  function elChip(id, st, side = false) {
    const { data } = current;
    const e = data.elements[id];
    if (!e) return `<span class="px-chip is-text">${esc(id)}</span>`;
    const cls = st ? ` st-${st}` : '';
    const pressed = current.bus.state.selected === id;
    return `<button type="button" class="px-chip${cls}" data-select="${esc(id)}" aria-pressed="${pressed}">${esc(e.name || id)}${side ? '<span class="px-chip-sub">side effect</span>' : ''}</button>`;
  }
  function levelBadges(roots) {
    return roots.map((r) => {
      const c = current.ctx.levelColour(r);
      return `<span class="px-level" style="background:${esc(c)};color:${inkOn(c)}">${esc(r)}</span>`;
    }).join('');
  }

  function blockCard(bid) {
    const { data } = current;
    const b = data.blocks[bid];
    if (!b) return '';
    const lists = STATUS_ORDER.filter((k) => b[k].length).map((k) => `
      <div class="px-list">
        <h4>${statusSwatch(k)}${esc(STATUS_LABEL[k])}</h4>
        <div class="px-chips">${b[k].map((id) => elChip(id, k, (b.sideEffects || []).includes(id))).join('')}</div>
      </div>`).join('');
    // Tier 1 (MO): the block, its summary (which carries the safety points) and what it reaches. Tier 2: the technique note.
    return `
      <article class="px-card px-block-card">
        <p class="px-kicker">Block</p>
        <h3>${esc(b.name || bid)}</h3>
        ${b.summary ? `<p>${esc(b.summary)}</p>` : ''}
        ${b.landmarks ? `<div class="px-tiered" data-tier="2">${BADGE(2)}<p><strong>Target:</strong> ${esc(b.landmarks)}</p></div>` : ''}
        ${lists ? `<div class="px-lists">${lists}</div>` : ''}
        ${b.more?.href ? `<p class="px-more"><a href="${esc(new URL(b.more.href, current.ctx.baseUrl).href)}">${esc(b.more.text || 'More about this block')} <span aria-hidden="true">→</span></a></p>` : ''}
      </article>`;
  }

  function elementCard(id) {
    const { data, nerves, ctx } = current;
    const e = data.elements[id];
    if (!e) return '';
    const source = nerves?.elements?.[id]?.source;
    const meshes = data.model?.meshes;
    const in3d = meshes ? Object.values(meshes).includes(id) : !!nerves?.elements?.[id];
    const reach = data.blockOrder.map((bid) => [bid, ctx.status(bid, id)]).filter(([, st]) => st && st !== 'spares');
    const spared = data.blockOrder.filter((bid) => ctx.status(bid, id) === 'spares');
    const parents = e.parents.map((p) => elChip(p)).join('');
    const kids = data.order.filter((x) => data.elements[x].parents.includes(id)).map((c) => elChip(c)).join('');
    const sparedLine = (ids, attr, lead) => (ids.length ? `<p class="px-muted"${attr}>${esc(lead || 'Usually spared by')}: ${ids.map((bid) => esc(data.blocks[bid].short || data.blocks[bid].name || bid)).join(', ')}.</p>` : '');
    const row = (label, val) => (val ? `<div><dt>${esc(label)}</dt><dd>${val}</dd></div>` : '');
    return `
      <article class="px-card px-el-card">
        <p class="px-kicker">${esc(KIND_LABEL[e.kind] || e.kind || 'Nerve')}</p>
        <h3>${esc(e.name || id)}</h3>
        ${e.roots.length ? `<p class="px-roots"><span class="px-roots-label">Roots</span>${levelBadges(e.roots)}</p>` : ''}
        <dl class="px-kv">
          ${row('Motor', esc(e.motor))}
          ${row('Sensory', esc(e.sensory))}
          ${row('From', parents ? `<span class="px-chips">${parents}</span>` : '')}
          ${row('Gives', kids ? `<span class="px-chips">${kids}</span>` : '')}
        </dl>
        <div class="px-reach">
          <h4>Blocks that reach it</h4>
          ${reach.length ? `<div class="px-chips">${reach.map(([bid, st]) => `<button type="button" class="px-chip st-${st}"${data.blocks[bid].advanced ? ' data-tier="3"' : ''} data-block="${esc(bid)}" aria-pressed="${current.bus.state.block === bid}">${esc(data.blocks[bid].short || data.blocks[bid].name || bid)}<span class="px-chip-sub">${esc(STATUS_LABEL[st].toLowerCase())}${(data.blocks[bid].sideEffects || []).includes(id) ? ' (side effect)' : ''}</span></button>`).join('')}</div>` : '<p class="px-muted">None of the blocks listed here.</p>'}
          ${sparedLine(spared.filter((bid) => !data.blocks[bid].advanced), '')}
          ${sparedLine(spared.filter((bid) => data.blocks[bid].advanced), ' data-tier="3"', spared.some((bid) => !data.blocks[bid].advanced) ? 'Also usually spared by' : '')}
        </div>
        ${e.notes ? `<div class="px-tiered" data-tier="2">${BADGE(2)}<p>${esc(e.notes)}</p></div>` : ''}
        ${source === 'reconstructed' ? '<p class="px-note">Path drawn for teaching; not in Z-Anatomy.</p>' : ''}
        ${source === 'mixed' ? '<p class="px-note">Path partly drawn for teaching; partly from Z-Anatomy.</p>' : ''}
        ${!in3d ? '<p class="px-note">Not shown in the 3D model.</p>' : ''}
      </article>`;
  }

  function overviewCard() {
    const { data } = current;
    const groups = {};
    for (const id of data.order) { const k = data.elements[id].kind || 'other'; (groups[k] ||= []).push(id); }
    const kinds = ['root', 'trunk', 'division', 'cord', 'branch', 'terminal', 'related', 'other'].filter((k) => groups[k]);
    return `
      <article class="px-card px-overview">
        <p class="px-kicker">${esc(data.name)}</p>
        <h3>Choose a nerve or a block</h3>
        <p class="px-muted">Tap a nerve in the 3D model, the diagram or the list below. Choose a block above to see what it covers.</p>
        ${kinds.map((k) => `<div class="px-list"><h4>${esc(GROUP_TITLE[k] || 'Other')}</h4><div class="px-chips">${groups[k].map((id) => elChip(id)).join('')}</div></div>`).join('')}
      </article>`;
  }

  function renderInfo() {
    if (!current) return;
    const { selected, block } = current.bus.state;
    const parts = [];
    if (selected && current.data.elements[selected]) parts.push(elementCard(selected));
    if (block && current.data.blocks[block]) parts.push(blockCard(block));
    if (!parts.length) parts.push(overviewCard());
    if (selected || block) parts.push('<p class="px-actions"><button type="button" class="px-link-btn" data-clear="1">Clear selection</button></p>');
    ui.info.innerHTML = parts.join('');
    paintHint();
  }

  ui.info.addEventListener('click', (ev) => {
    if (!current) return;
    const t = ev.target.closest('button');
    if (!t) return;
    if (t.dataset.select) current.bus.emit('select', { id: current.bus.state.selected === t.dataset.select ? null : t.dataset.select, source: 'info' });
    else if (t.dataset.block) current.bus.emit('block', { id: current.bus.state.block === t.dataset.block ? null : t.dataset.block, source: 'info' });
    else if (t.dataset.clear) clear();
  });

  // ---------------------------------------------------------------- mounting
  function panelMessage(el, text) {
    el.replaceChildren();
    const p = document.createElement('p');
    p.className = 'px-msg';
    p.textContent = text;
    el.appendChild(p);
  }

  function teardown() {
    if (!current) return;
    try { current.viewer?.destroy(); } catch (err) { console.error(err); }
    try { current.diagram?.destroy(); } catch (err) { console.error(err); }
    current.bus.clear();
    current = null;
  }

  async function loadPlexus(id, want = {}) {
    if (!validPlexusId(id)) id = DEFAULT_PLEXUS;
    const token = ++loadToken;
    teardown();
    renderTabs(id);
    chipsHost.replaceChildren();
    ui.legend.hidden = true;
    const label = PLEXUSES.find((p) => p.id === id)?.tab || id;
    panelMessage(ui.mount3d, `Loading the ${label.toLowerCase()} plexus…`);
    panelMessage(ui.mountDiagram, 'Loading the diagram…');
    ui.info.innerHTML = '';
    let data;
    try {
      const mod = await import(`./data/${id}.js?v=${V}`);
      data = normalise(mod.default, id);
    } catch (err) {
      if (token !== loadToken) return;
      console.warn(`[plexus] data module "${id}" failed to load`, err);
      const msg = `The ${label.toLowerCase()} plexus could not be loaded. Try another plexus or reload the page.`;
      panelMessage(ui.mount3d, msg);
      panelMessage(ui.mountDiagram, msg);
      ui.info.innerHTML = `<p class="px-msg">${esc(msg)}</p>`;
      ui.intro.textContent = '';
      return;
    }
    const base = new URL('../', import.meta.url);
    let nerves = { elements: {} };
    if (data.model.nerves) {
      try {
        const res = await fetch(new URL(data.model.nerves, base).href);
        if (res.ok) {
          const j = await res.json();
          if (j && typeof j.elements === 'object') nerves = j;
        }
      } catch (err) { console.warn('[plexus] nerve file failed to load', err); }
    }
    if (token !== loadToken || destroyed) return;

    const bus = createBus();
    const ctx = makeCtx(data, nerves, bus, base.href);
    current = { id, data, nerves, bus, ctx, viewer: null, diagram: null };
    ui.intro.textContent = data.intro || '';
    creditEl.textContent = data.credits || '';
    renderChips();

    ui.mount3d.replaceChildren();
    ui.mountDiagram.replaceChildren();
    try {
      const { mountViewer } = await import(`./viewer3d.js?v=${V}`);
      if (token !== loadToken || destroyed) return;
      current.viewer = mountViewer(ui.mount3d, ctx);
    } catch (err) {
      if (token !== loadToken || destroyed) return;
      console.error('[plexus] 3D viewer failed', err);
      panelMessage(ui.mount3d, `The 3D view could not start (${err?.message || err}). The diagram still works.`);
    }
    try {
      const { mountDiagram } = await import(`./diagram.js?v=${V}`);
      if (token !== loadToken || destroyed) return;
      current.diagram = mountDiagram(ui.mountDiagram, ctx);
    } catch (err) {
      if (token !== loadToken || destroyed) return;
      console.error('[plexus] diagram failed', err);
      panelMessage(ui.mountDiagram, `The diagram could not be drawn (${err?.message || err}).`);
    }

    bus.on('select', () => { renderInfo(); changed(); });
    bus.on('block', (p) => { if (p?.source !== 'level') relaxForBlock(bus.state.block); syncChips(); renderLegend(); renderInfo(); changed(); });

    if (want.block && data.blocks[want.block]) {
      // A link to an advanced block shows it at any level, for this view only (the saved level is unchanged).
      bus.emit('block', { id: want.block, source: 'url', instant: true });
    }
    if (want.el && data.elements[want.el]) bus.emit('select', { id: want.el, source: 'url', instant: true });
    renderInfo();
    changed();
  }

  function setBlock(id) { if (current) current.bus.emit('block', { id: id && current.data.blocks[id] ? id : null, source: 'api' }); }
  function select(id) { if (current) current.bus.emit('select', { id: id && current.data.elements[id] ? id : null, source: 'api' }); }
  function clear() { if (!current) return; current.bus.emit('select', { id: null, source: 'info' }); current.bus.emit('block', { id: null, source: 'info' }); }

  const ready = loadPlexus(opts.plexus, { block: opts.block, el: opts.el });

  return {
    root,
    ready,
    state: snapshot,
    /** Show plexus id; want = {block, el}. Same plexus: only block and selection change. */
    setPlexus(id, want = {}) {
      if (current && current.id === id) { setBlock(want.block || null); select(want.el || null); return Promise.resolve(); }
      return loadPlexus(id, want);
    },
    setBlock,
    select,
    clear,
    destroy() {
      destroyed = true;
      loadToken++;
      teardown();
      offLevel();
      root.remove();
      bar?.remove();
    },
  };
}

export default mountExplorer;
