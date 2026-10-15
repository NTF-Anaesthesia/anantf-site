// Plexus schematic: an interactive inline SVG drawn from data.diagram.
//
//   mountDiagram(containerEl, ctx) -> { destroy() }
//
// ctx = { data, bus, lineage(id) -> Set, status(blockId, elId), levelColour(level), rootsLabel(id) }
// Emits 'hover' and 'select' (source 'diagram'); listens to 'select', 'hover', 'block'.

import { STATUS, STATUS_COLOURS as SHARED_STATUS_COLOURS } from '../../shared/regional/js/status.js?v=20261015';

const SVGNS = 'http://www.w3.org/2000/svg';
const SOURCE = 'diagram';

// Stroke widths in viewBox units, by geometry class.
const WIDTH = { xl: 14, l: 10, m: 7, s: 5 };
// Font sizes in CSS pixels at the minimum rendered width (BASE_PX).
const BASE_PX = 560;
// Narrowest width drawn without scrolling: fonts there are still at least 12px (13px x 520/560). Matches the CSS min-width.
const MIN_PX = 520;
const FONT = { root: 15, struct: 13, term: 14, branch: 13, sub: 13, colHead: 14, colSub: 13, region: 13, note: 13, band: 13 };

// Block status: the shared regional tokens (colour + line style). Kept as a named export for older imports.
export const STATUS_COLOURS = SHARED_STATUS_COLOURS;
// Line style per status, in multiples of the nerve's stroke width w. Long dashes stay reserved for inconstant nerves
// (data geom.dash), so variable is beaded (dots on a pale orange line) and spares is a thin, faded, short-dashed line.
const ST_STYLE = {
  target: { width: 1.3, edge: 'rgba(31,26,23,.6)' },
  covers: { width: 1, edge: 'rgba(31,26,23,.5)' },
  variable: { width: 1, edge: 'rgba(194,65,12,.38)', dots: true },
  spares: { width: 0.7, edge: 'rgba(31,26,23,.25)', dash: [0.55, 0.9], opacity: STATUS.spares.opacity },
};
const NERVE = '#e8b923';
const NERVE_EDGE = '#7a5c00';
const RELATED = '#9a8f7a';
const RELATED_EDGE = '#5f574a';

function svg(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, String(v));
  if (parent) parent.appendChild(n);
  return n;
}

function textLuminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return 0.5;
  const n = parseInt(m[1], 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export function inkOn(hex) { return textLuminance(hex) > 0.36 ? '#272722' : '#ffffff'; }

export function mountDiagram(container, ctx) {
  const { data, bus } = ctx;
  const dg = data.diagram || {};
  const elements = data.elements || {};
  const geom = dg.geom || {};
  const vbRaw = Array.isArray(dg.viewBox) && dg.viewBox.length === 4 && dg.viewBox.every(Number.isFinite) ? dg.viewBox : [0, -60, 1200, 820];
  const [vx, vy, vw, vh] = vbRaw;
  const k = vw / BASE_PX; // viewBox units per CSS pixel at the minimum width
  const fs = (px) => +(px * k).toFixed(2);

  const root = document.createElement('div');
  root.className = 'px-dg';
  // Narrow screens: readable by default (scrolls sideways); "Fit to screen" shows the whole diagram, and a pinch on the
  // diagram switches between the two. The button names the action, so it has no aria-pressed.
  const tools = document.createElement('div');
  tools.className = 'px-dg-tools';
  const hint = document.createElement('p');
  hint.className = 'px-dg-hint';
  const zoomBtn = document.createElement('button');
  zoomBtn.type = 'button';
  zoomBtn.className = 'px-v3-btn px-dg-zoom app-btn app-btn--outline app-btn--compact';
  tools.append(hint, zoomBtn);
  const scroller = document.createElement('div');
  scroller.className = 'px-dg-scroll';
  root.append(tools, scroller);
  let zoomed = true;
  const paintZoom = () => {
    root.classList.toggle('is-zoomed', zoomed);
    zoomBtn.textContent = zoomed ? 'Fit to screen' : 'Zoom in';
    hint.textContent = zoomed ? 'Scroll sideways to see the whole diagram. Tap a nerve to follow it.' : 'Whole diagram. Zoom in (or pinch) to read the labels.';
  };
  paintZoom();

  if (!Object.keys(geom).length) {
    const p = document.createElement('p');
    p.className = 'px-msg';
    p.textContent = 'The diagram for this plexus is not ready yet.';
    scroller.appendChild(p);
    container.appendChild(root);
    return { destroy() { root.remove(); } };
  }

  const s = svg('svg', {
    viewBox: vbRaw.join(' '),
    class: 'px-dg-svg',
    role: 'group',
    'aria-label': `${data.name || 'Plexus'} diagram. Each nerve is a button: press Enter to select it.`,
    preserveAspectRatio: 'xMidYMin meet',
  });
  s.style.setProperty('--px-k', String(k));
  scroller.appendChild(s);
  container.appendChild(root);

  // ---------------------------------------------------------------- static layers
  const gCols = svg('g', { class: 'cols' }, s);
  const gRegions = svg('g', { class: 'regions' }, s);
  const gBand = svg('g', { class: 'band' }, s);
  const gEls = svg('g', { class: 'els' }, s);
  const gLabels = svg('g', { class: 'labels' }, s);
  const gNotes = svg('g', { class: 'notes' }, s);

  const columns = Array.isArray(dg.columns) ? dg.columns : [];
  columns.forEach((c, i) => {
    if (!c || !Number.isFinite(c.x0) || !Number.isFinite(c.x1)) return;
    const cx = (c.x0 + c.x1) / 2;
    if (i > 0) svg('line', { x1: c.x0, x2: c.x0, y1: vy + fs(44), y2: vy + vh, class: 'col-sep', 'stroke-width': Math.max(1, k) }, gCols);
    if (c.label) {
      const t = svg('text', { x: cx, y: vy + fs(18), 'text-anchor': 'middle', class: 'col-head', 'font-size': fs(FONT.colHead) }, gCols);
      t.textContent = c.label;
    }
    if (c.sub) {
      const t = svg('text', { x: cx, y: vy + fs(36), 'text-anchor': 'middle', class: 'col-sub', 'font-size': fs(FONT.colSub) }, gCols);
      t.textContent = c.sub;
    }
  });

  (Array.isArray(dg.regions) ? dg.regions : []).forEach((r) => {
    if (!r || ![r.x, r.y, r.w, r.h].every(Number.isFinite)) return;
    svg('rect', { x: r.x, y: r.y, width: r.w, height: r.h, class: 'region' }, gRegions);
    if (r.label) {
      const t = svg('text', { x: r.x + fs(8), y: r.y + fs(18), class: 'region-label', 'font-size': fs(FONT.region) }, gRegions);
      t.textContent = r.label;
    }
  });

  (Array.isArray(dg.notes) ? dg.notes : []).forEach((n) => {
    if (!n || !Number.isFinite(n.x) || !Number.isFinite(n.y) || !n.text) return;
    const t = svg('text', { x: n.x, y: n.y, 'text-anchor': n.anchor || 'start', class: 'note', 'font-size': fs(FONT.note) }, gNotes);
    t.textContent = n.text;
  });

  // ---------------------------------------------------------------- elements
  const order = [...(data.order || []), ...Object.keys(geom)].filter((id, i, a) => a.indexOf(id) === i);
  const nodes = new Map(); // id -> { g, mains, edges }
  const badgeJobs = [];

  for (const id of order) {
    const g0 = geom[id];
    const e = elements[id];
    if (!g0 || !e) continue;
    const ds = (Array.isArray(g0.d) ? g0.d : [g0.d]).filter((d) => typeof d === 'string' && d.trim());
    if (!ds.length && !g0.label) continue;
    const wKey = WIDTH[g0.w] ? g0.w : 'm';
    const w = WIDTH[wKey];
    const related = e.kind === 'related';
    const g = svg('g', {
      class: `el w-${wKey}${related ? ' is-related' : ''}`,
      'data-id': id,
      tabindex: 0,
      role: 'button',
      'aria-pressed': 'false',
      'aria-label': `${e.name || id}${e.roots?.length ? `, ${ctx.rootsLabel(id)}` : ''}`,
    }, gEls);
    const mains = []; const edges = []; const halos = [];
    for (const d of ds) {
      halos.push(svg('path', { d, class: 'halo', 'stroke-width': w + 14 }, g));
    }
    for (const d of ds) {
      edges.push(svg('path', { d, class: 'edge', 'stroke-width': w + 3, stroke: related ? RELATED_EDGE : NERVE_EDGE, 'stroke-dasharray': g0.dash ? `${w * 1.6} ${w * 1.2}` : null }, g));
    }
    for (const d of ds) {
      mains.push(svg('path', { d, class: 'main', 'stroke-width': w, stroke: related ? RELATED : NERVE, 'stroke-dasharray': g0.dash ? `${w * 1.6} ${w * 1.2}` : null }, g));
    }
    for (const d of ds) {
      svg('path', { d, class: 'hit', 'stroke-width': Math.max(w + 16, fs(22)) }, g);
    }
    const L = g0.label;
    // Labels sit in a layer above every nerve so a later nerve's hit area never covers them.
    const gl = svg('g', { class: `el el-label w-${wKey}${related ? ' is-related' : ''}`, 'data-id': id, 'aria-hidden': 'true' }, gLabels);
    if (L && Number.isFinite(L.x) && Number.isFinite(L.y)) {
      const kind = ['root', 'struct', 'term', 'branch'].includes(L.kind) ? L.kind : 'branch';
      const anchor = L.anchor || 'start';
      const label = L.text || e.short || e.name || id;
      if (kind === 'root') {
        const level = (e.roots && e.roots[0]) || label;
        const colour = ctx.levelColour(level);
        const badge = svg('rect', { class: 'badge', fill: colour, rx: 0 }, gl);
        const t = svg('text', { x: L.x, y: L.y, 'text-anchor': anchor, class: 'lbl t-root', 'font-size': fs(FONT.root), fill: inkOn(colour) }, gl);
        t.textContent = label;
        badgeJobs.push({ badge, t, x: L.x, y: L.y, anchor, size: fs(FONT.root), label });
      } else {
        const t = svg('text', { x: L.x, y: L.y, 'text-anchor': anchor, class: `lbl t-${kind}`, 'font-size': fs(FONT[kind]) }, gl);
        t.textContent = label;
        if (kind === 'term' && e.roots?.length) {
          const sub = svg('tspan', { x: L.x, dy: fs(FONT.sub + 3), class: 't-sub', 'font-size': fs(FONT.sub) }, t);
          sub.textContent = ctx.rootsLabel(id);
        }
      }
    }
    nodes.set(id, { g, gl, mains, edges, halos, related, w, dash: g0.dash ? `${w * 1.6} ${w * 1.2}` : null });
  }

  function setZoom(z, cx) {
    if (z === zoomed) return;
    const frac = cx == null ? null : cx;
    zoomed = z;
    paintZoom();
    if (zoomed) {
      // Keep the pinch point (or the selected nerve) in view.
      if (frac != null) requestAnimationFrame(() => { scroller.scrollLeft = Math.max(0, frac * scroller.scrollWidth - scroller.clientWidth / 2); });
      else requestAnimationFrame(() => scrollToSelected('zoom', true));
    }
  }
  zoomBtn.addEventListener('click', () => setZoom(!zoomed));
  // Two-finger pinch: out = zoom in, in = fit. One switch per gesture.
  let pinch = null;
  const dist2 = (t) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const onTouchStart = (e) => { if (e.touches.length === 2) pinch = { d0: dist2(e.touches), done: false }; };
  const onTouchMove = (e) => {
    if (!pinch || e.touches.length !== 2 || pinch.done) return;
    const r = dist2(e.touches) / Math.max(1, pinch.d0);
    if (r > 1.2 && !zoomed) {
      const box = s.getBoundingClientRect();
      const mid = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      pinch.done = true;
      setZoom(true, Math.min(1, Math.max(0, (mid - box.left) / Math.max(1, box.width))));
    } else if (r < 0.83 && zoomed && root.classList.contains('is-narrow')) { pinch.done = true; setZoom(false); }
  };
  const onTouchEnd = (e) => { if (e.touches.length < 2) pinch = null; };
  scroller.addEventListener('touchstart', onTouchStart, { passive: true });
  scroller.addEventListener('touchmove', onTouchMove, { passive: true });
  scroller.addEventListener('touchend', onTouchEnd, { passive: true });
  scroller.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // Coloured level badges behind the root labels (sized to the text once it is laid out).
  function placeBadges() {
    for (const j of badgeJobs) {
      let bb = null;
      try { bb = j.t.getBBox(); } catch { bb = null; }
      let x; let y; let wd; let ht;
      const pad = j.size * 0.28;
      if (bb && bb.width > 0) {
        x = bb.x - pad; y = bb.y - pad * 0.4; wd = bb.width + pad * 2; ht = bb.height + pad * 0.8;
      } else {
        wd = j.label.length * j.size * 0.66 + pad * 2; ht = j.size * 1.3;
        x = j.anchor === 'end' ? j.x - wd + pad : j.anchor === 'middle' ? j.x - wd / 2 : j.x - pad;
        y = j.y - j.size * 1.02;
      }
      j.badge.setAttribute('x', x.toFixed(1)); j.badge.setAttribute('y', y.toFixed(1));
      j.badge.setAttribute('width', wd.toFixed(1)); j.badge.setAttribute('height', ht.toFixed(1));
    }
  }
  placeBadges();
  // Fonts may load later and change text widths.
  const fontsReady = document.fonts?.ready?.then(() => { if (!destroyed) placeBadges(); });
  void fontsReady;
  // If the panel was hidden while mounting, getBBox returned zero: retry when it shows.
  let destroyed = false;
  const ro = new ResizeObserver(() => {
    if (destroyed || root.offsetWidth <= 0) return;
    root.classList.toggle('is-narrow', root.offsetWidth < MIN_PX);
    placeBadges();
    if (needBand) drawBand();
  });
  let needBand = false;
  ro.observe(root);

  // ---------------------------------------------------------------- block band
  function drawBand() {
    gBand.replaceChildren();
    const bid = bus.state.block;
    const b = bid && data.blocks?.[bid];
    const band = b?.band;
    if (!band || !Number.isFinite(band.x0) || !Number.isFinite(band.x1)) return;
    const y0 = Number.isFinite(band.y0) ? band.y0 : vy + fs(44);
    const y1 = Number.isFinite(band.y1) ? band.y1 : vy + vh;
    const top = Math.min(y0, y1); const bot = Math.max(y0, y1);
    const left = Math.min(band.x0, band.x1); const right = Math.max(band.x0, band.x1);
    svg('rect', { x: left, y: top, width: right - left, height: bot - top, class: 'band-area', 'stroke-width': Math.max(1.5, k) }, gBand);
    const t = svg('text', { x: (left + right) / 2, y: top + fs(17), 'text-anchor': 'middle', class: 'band-label', 'font-size': fs(FONT.band), 'stroke-width': fs(4) }, gBand);
    t.textContent = band.label || b.short || b.name || bid;
    placeBandLabel(t, { left, right, top, bot });
  }

  // Put the band label where it does not sit on a nerve label: inside the top of the band, just above it, just below
  // it or inside the bottom; centred, then at either side. Needs layout (retried when the panel is shown).
  function placeBandLabel(t, b) {
    let obstacles;
    try {
      obstacles = [...gLabels.querySelectorAll('text'), ...gCols.querySelectorAll('text'), ...gRegions.querySelectorAll('text'), ...gNotes.querySelectorAll('text')].map((n) => n.getBBox()).filter((r) => r.width > 0);
      const probe = t.getBBox();
      if (!probe.width) { needBand = true; return; }
    } catch { needBand = true; return; }
    needBand = false;
    const pad = fs(3);
    const ys = [b.top + fs(17), b.top - fs(7), b.bot + fs(17), b.bot - fs(7)];
    const xs = [[(b.left + b.right) / 2, 'middle'], [b.left + fs(8), 'start'], [b.right - fs(8), 'end']];
    const hits = (r) => obstacles.some((o) => r.x < o.x + o.width + pad && r.x + r.width + pad > o.x && r.y < o.y + o.height + pad && r.y + r.height + pad > o.y);
    const inside = (r) => r.x >= vx && r.x + r.width <= vx + vw && r.y >= vy + fs(40) && r.y + r.height <= vy + vh;
    for (const y of ys) {
      for (const [x, anchor] of xs) {
        t.setAttribute('x', x.toFixed(1)); t.setAttribute('y', y.toFixed(1)); t.setAttribute('text-anchor', anchor);
        const r = t.getBBox();
        if (inside(r) && !hits(r)) return;
      }
    }
    t.setAttribute('x', ((b.left + b.right) / 2).toFixed(1)); t.setAttribute('y', (b.top + fs(17)).toFixed(1)); t.setAttribute('text-anchor', 'middle');
  }

  // ---------------------------------------------------------------- state -> classes
  function refresh() {
    const { selected, hovered, block } = bus.state;
    const keep = selected ? ctx.lineage(selected) : null;
    for (const [id, n] of nodes) {
      const st = block ? ctx.status(block, id) : null;
      const dim = (keep && !keep.has(id)) || (block && !st);
      for (const g of [n.g, n.gl]) {
        g.classList.toggle('is-selected', id === selected);
        g.classList.toggle('is-hover', id === hovered);
        g.classList.toggle('is-dim', !!dim);
      }
      n.g.setAttribute('aria-pressed', id === selected ? 'true' : 'false');
      const colour = st ? STATUS_COLOURS[st] : (n.related ? RELATED : NERVE);
      const sty = st ? ST_STYLE[st] : null;
      const edge = sty ? sty.edge : (n.related ? RELATED_EDGE : NERVE_EDGE);
      const w = n.w * (sty?.width || 1);
      const dash = sty?.dots ? `0.01 ${(n.w * 1.75).toFixed(2)}` : sty?.dash ? sty.dash.map((f) => (n.w * f).toFixed(2)).join(' ') : n.dash;
      n.mains.forEach((p) => {
        p.setAttribute('stroke', colour);
        p.setAttribute('stroke-width', w);
        if (dash) p.setAttribute('stroke-dasharray', dash); else p.removeAttribute('stroke-dasharray');
        if (sty?.opacity) p.setAttribute('stroke-opacity', sty.opacity); else p.removeAttribute('stroke-opacity');
      });
      n.edges.forEach((p) => {
        p.setAttribute('stroke', edge);
        p.setAttribute('stroke-width', w + 3);
        // Dotted (variable) nerves sit on a solid pale line; other patterns dash their outline too.
        if (dash && !sty?.dots) p.setAttribute('stroke-dasharray', dash); else p.removeAttribute('stroke-dasharray');
      });
      n.g.dataset.status = st || '';
      n.gl.dataset.status = st || '';
      n.halos.forEach((p) => p.setAttribute('stroke-width', st === 'target' ? w + 9 : n.w + 14));
    }
  }

  // ---------------------------------------------------------------- interaction
  const idOf = (ev) => ev.target.closest?.('[data-id]')?.getAttribute('data-id') || null;
  const onOver = (ev) => { const id = idOf(ev); if (id) bus.emit('hover', { id, source: SOURCE }); };
  const onOut = (ev) => {
    const to = ev.relatedTarget?.closest?.('[data-id]')?.getAttribute('data-id') || null;
    if (!to) bus.emit('hover', { id: null, source: SOURCE });
  };
  const onClick = (ev) => {
    const id = idOf(ev);
    if (!id) return;
    bus.emit('select', { id: bus.state.selected === id ? null : id, source: SOURCE });
  };
  const onKey = (ev) => {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    const id = idOf(ev);
    if (!id) return;
    ev.preventDefault();
    bus.emit('select', { id: bus.state.selected === id ? null : id, source: SOURCE });
  };
  const onFocus = (ev) => { const id = idOf(ev); if (id) bus.emit('hover', { id, source: SOURCE }); };
  const onBlur = () => bus.emit('hover', { id: null, source: SOURCE });
  s.addEventListener('pointerover', onOver);
  s.addEventListener('pointerout', onOut);
  s.addEventListener('click', onClick);
  s.addEventListener('keydown', onKey);
  s.addEventListener('focusin', onFocus);
  s.addEventListener('focusout', onBlur);

  // Bring the selected nerve into view inside the scroller (phones).
  function scrollToSelected(source, instant) {
    if (source === SOURCE) return;
    const n = nodes.get(bus.state.selected);
    if (!n || scroller.scrollWidth <= scroller.clientWidth + 4) return;
    try {
      const bb = n.gl.getBBox().width ? n.gl.getBBox() : n.g.getBBox();
      const scale = s.getBoundingClientRect().width / vw;
      const cx = (bb.x + bb.width / 2 - vx) * scale;
      const reduce = instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      scroller.scrollTo({ left: Math.max(0, cx - scroller.clientWidth / 2), behavior: reduce ? 'auto' : 'smooth' });
    } catch { /* not laid out */ }
  }

  const offs = [
    bus.on('select', (p) => { refresh(); scrollToSelected(p.source, p.instant); }),
    bus.on('hover', refresh),
    bus.on('block', () => { drawBand(); refresh(); }),
  ];
  drawBand();
  refresh();

  return {
    destroy() {
      destroyed = true;
      ro.disconnect();
      offs.forEach((f) => f());
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      root.remove();
    },
  };
}

export default mountDiagram;
