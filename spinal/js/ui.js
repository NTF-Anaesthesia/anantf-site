// Shared UI helpers for the spinal page.; section modules import from here.
// Every component uses `sp-*` classes styled in css/base.css.

export { cite, citeEl } from './refs.js?v=1';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text for safe insertion into HTML strings. */
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]); }

let uid = 0;
/** Unique id with an optional prefix (for aria-controls etc.). */
export function uniqueId(prefix = 'sp') { uid += 1; return `${prefix}-u${uid}`; }

function append(node, child) {
  if (child == null || child === false) return;
  if (Array.isArray(child)) { child.forEach((c) => append(node, c)); return; }
  node.append(child instanceof Node ? child : document.createTextNode(String(child)));
}

/** Put a string-of-HTML or a Node (or array of them) into an element. */
function fill(node, content) {
  if (content == null) return node;
  if (typeof content === 'string') node.insertAdjacentHTML('beforeend', content);
  else append(node, content);
  return node;
}

/**
 * el('button', {class:'sp-btn', type:'button', on:{click:fn}, dataset:{x:1}, 'aria-pressed':'false'}, 'Label')
 * attrs: class, id, text, html (trusted literals only), on:{evt:fn}, dataset:{}, style:{} or string,
 * any other key set as an attribute (true → empty attribute; false/null → skipped).
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class' || k === 'className') node.className = Array.isArray(v) ? v.filter(Boolean).join(' ') : v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'on') for (const [evt, fn] of Object.entries(v)) node.addEventListener(evt, fn);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'hidden') node.hidden = Boolean(v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  append(node, children);
  return node;
}

/** Polite announcement through #sp-live (cleared, then set on the next frame so repeats are read). */
export function announce(text) {
  const live = document.getElementById('sp-live');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = text; });
}

// ---------------------------------------------------------------- callouts
const ICONS = {
  key: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="3" width="10" height="10" fill="currentColor"/></svg>',
  warn: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.8 15 14.2H1z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="miter"/><path d="M8 6v4.2" stroke="currentColor" stroke-width="1.6"/><rect x="7.2" y="11.2" width="1.6" height="1.6" fill="currentColor"/></svg>',
  pearl: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  policy: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 1.5h6l3 3v10h-9z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="miter"/><path d="M9.5 1.5v3h3M5.5 8h5M5.5 10.5h5M5.5 13h3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
};
const CALLOUT_LABEL = { key: 'Key point', warn: 'Warning', pearl: 'Exam pearl', policy: 'Check local policy' };

/**
 * callout('warn', {title:'Stop if paraesthesia persists', body:'<p>…</p>'})
 * The kind label ("Warning") is always shown; `title` is optional and follows it.
 */
export function callout(kind, { title, body } = {}) {
  const k = CALLOUT_LABEL[kind] ? kind : 'key';
  const head = el('p', { class: 'sp-callout-label' });
  head.insertAdjacentHTML('beforeend', ICONS[k]);
  head.append(el('span', { text: CALLOUT_LABEL[k] }));
  const box = el('aside', { class: `sp-callout sp-callout--${k}`, role: 'note' }, head);
  if (title) box.append(el('p', { class: 'sp-callout-title' }, typeof title === 'string' ? fill(el('span'), title) : title));
  if (body != null) {
    const b = el('div', { class: 'sp-callout-body' });
    fill(b, body);
    box.append(b);
  }
  return box;
}

// ---------------------------------------------------------------- steps
/** steps([{title, body, tag?}]) → <ol class="sp-steps"> */
export function steps(items) {
  const ol = el('ol', { class: 'sp-steps' });
  items.forEach((it, i) => {
    const li = el('li', { class: 'sp-step', id: it.id });
    li.append(el('span', { class: 'sp-step-n', 'aria-hidden': 'true', text: String(i + 1) }));
    const main = el('div', { class: 'sp-step-main' });
    const h = el('p', { class: 'sp-step-title' });
    fill(h, it.title);
    if (it.tag) h.append(' ', el('span', { class: 'sp-chip', text: it.tag }));
    main.append(h);
    if (it.body != null) main.append(fill(el('div', { class: 'sp-step-body' }), it.body));
    li.append(main);
    ol.append(li);
  });
  return ol;
}

// ---------------------------------------------------------------- tables
/**
 * table({caption, head:['Drug','Stop before'], rows:[['…','…']], stack=true, id})
 * Cells are HTML strings or Nodes. A cell may also be {html|node, th:true} to make a row header.
 */
export function table({ caption, head = [], rows = [], stack = true, id, className } = {}) {
  const t = el('table', { class: ['sp-table', stack ? 'sp-table--stack' : '', className] });
  if (caption) t.append(fill(el('caption'), caption));
  if (head.length) {
    const tr = el('tr');
    head.forEach((h) => tr.append(fill(el('th', { scope: 'col' }), h)));
    t.append(el('thead', {}, tr));
  }
  const labels = head.map((h) => (typeof h === 'string' ? h.replace(/<[^>]+>/g, '').trim() : (h?.textContent || '').trim()));
  const tb = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    r.forEach((c, i) => {
      const isObj = c && typeof c === 'object' && !(c instanceof Node);
      const cell = el(isObj && c.th ? 'th' : 'td', isObj && c.th ? { scope: 'row' } : {});
      if (labels[i]) cell.dataset.label = labels[i];
      fill(cell, isObj ? (c.node ?? c.html) : c);
      tr.append(cell);
    });
    tb.append(tr);
  });
  t.append(tb);
  const wrap = el('div', { class: ['sp-table-wrap', stack ? '' : 'sp-table-wrap--scroll'], id });
  if (!stack) {
    const label = caption ? String(caption).replace(/<[^>]+>/g, '').trim() : 'Table';
    const scroller = el('div', { class: 'sp-table-scroll', tabindex: '0', role: 'region', 'aria-label': label }, t);
    wrap.append(scroller, el('p', { class: 'sp-scroll-hint', 'aria-hidden': 'true', text: 'Scroll sideways →' }));
  } else wrap.append(t);
  return wrap;
}

// ---------------------------------------------------------------- tabs
/**
 * tabs(host, [{id, label, sub?, panel: Node}], {label, initial, onChange})
 * Renders an ARIA tablist + panels into host. Returns {select(id, focus?), current()}.
 */
export function tabs(host, panels, { label = 'Views', initial, onChange } = {}) {
  const list = el('div', { class: 'sp-tabs', role: 'tablist', 'aria-label': label });
  list.style.setProperty('--sp-tab-count', String(panels.length));
  const wrap = el('div', { class: 'sp-tabpanels' });
  const btns = [];
  panels.forEach((p) => {
    const tabId = `${p.id}-tab`;
    const panelId = `${p.id}-panel`;
    const b = el('button', { class: 'sp-tab', type: 'button', role: 'tab', id: tabId, 'aria-controls': panelId, 'aria-selected': 'false', tabindex: '-1', dataset: { tab: p.id } });
    b.append(fill(el('span', { class: 'sp-tab-label' }), p.label));
    if (p.sub) b.append(fill(el('span', { class: 'sp-tab-sub' }), p.sub));
    const panel = el('div', { class: 'sp-tabpanel', role: 'tabpanel', id: panelId, 'aria-labelledby': tabId, tabindex: '0', hidden: true });
    fill(panel, p.panel);
    btns.push(b);
    list.append(b);
    wrap.append(panel);
  });
  let cur = null;
  function select(id, focus = false) {
    const i = panels.findIndex((p) => p.id === id);
    if (i < 0) return;
    btns.forEach((b, j) => {
      const on = i === j;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
      wrap.children[j].hidden = !on;
    });
    if (focus) btns[i].focus();
    if (cur !== id) { cur = id; onChange?.(id); }
  }
  list.addEventListener('click', (e) => { const b = e.target.closest('[role=tab]'); if (b) select(b.dataset.tab); });
  list.addEventListener('keydown', (e) => {
    const i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    let j = null;
    if (e.key === 'ArrowRight') j = (i + 1) % btns.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = btns.length - 1;
    if (j == null) return;
    e.preventDefault();
    select(panels[j].id, true);
  });
  host.append(list, wrap);
  select(initial && panels.some((p) => p.id === initial) ? initial : panels[0]?.id);
  return { select, current: () => cur, tablist: list, panels: wrap };
}

// ---------------------------------------------------------------- segmented
/**
 * segmented([{value, label}], {label, value, onChange}) → <div role="group"> with .set(value) and .value
 */
export function segmented(options, { label = 'Options', value, onChange } = {}) {
  const g = el('div', { class: 'sp-seg', role: 'group', 'aria-label': label });
  let cur = value ?? options[0]?.value;
  const paint = () => g.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.value === String(cur) ? 'true' : 'false'));
  options.forEach((o) => {
    const b = el('button', { type: 'button', class: 'sp-seg-btn', dataset: { value: String(o.value) }, 'aria-pressed': 'false' });
    fill(b, o.label);
    b.addEventListener('click', () => { if (String(cur) === String(o.value)) return; cur = o.value; paint(); onChange?.(o.value); });
    g.append(b);
  });
  paint();
  g.set = (v) => { cur = v; paint(); };
  Object.defineProperty(g, 'value', { get: () => cur });
  return g;
}

// ---------------------------------------------------------------- figure
/**
 * figure({id, num:'1.2', title, caption, plate:'paper'|'us'|'none', aspect:'16/9'})
 * → {fig, stage, controls, caption, describe(text)}
 * Put your canvas/SVG in `stage` (give it role="img" + aria-label), buttons in `controls`.
 */
export function figure({ id, num, title, caption, plate = 'paper', aspect = '16/9' } = {}) {
  const fig = el('figure', { class: 'sp-fig', id });
  if (title) fig.append(fill(el('p', { class: 'sp-fig-title' }), title));
  const stage = el('div', { class: 'sp-fig-stage', dataset: { plate } });
  if (aspect && aspect !== 'auto') stage.style.aspectRatio = aspect;
  const controls = el('div', { class: 'sp-fig-controls' });
  const cap = el('figcaption');
  if (num) cap.append(el('span', { class: 'sp-fig-num', text: `Fig ${num}` }), ' ');
  fill(cap, caption);
  const live = el('p', { class: 'sp-sr', 'aria-live': 'polite' });
  fig.append(stage, controls, cap, live);
  return { fig, stage, controls, caption: cap, describe(text) { live.textContent = text; } };
}

// ---------------------------------------------------------------- details
/** details({id, summary, body, open=false}) → <details class="sp-details"> */
export function details({ id, summary, body, open = false } = {}) {
  const d = el('details', { class: 'sp-details', id });
  d.open = Boolean(open);
  d.append(fill(el('summary'), summary), fill(el('div', { class: 'sp-details-body' }), body));
  return d;
}

// ---------------------------------------------------------------- canvas + visibility
/** Size a canvas for the device pixel ratio. Returns a ctx whose units are CSS px. Re-call on resize. */
export function setupCanvas(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Run onEnter when el scrolls into view (and onLeave when it leaves). Returns a disconnect function. */
export function whenVisible(target, onEnter, onLeave) {
  if (!('IntersectionObserver' in window)) { onEnter?.(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) onEnter?.(e);
      else onLeave?.(e);
    }
  }, { rootMargin: '120px 0px' });
  io.observe(target);
  return () => io.disconnect();
}

/** Observe size changes of an element (debounced to one per frame). Returns a disconnect function. */
export function onResize(target, fn) {
  if (!('ResizeObserver' in window)) { window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }
  let raf = 0;
  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => fn(target.getBoundingClientRect())); });
  ro.observe(target);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => mqReduce.matches;

const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
/** True when the page is currently dark (explicit toggle, or Auto + OS dark). */
export function isDark() {
  const t = document.documentElement.dataset.theme;
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return mqDark.matches;
}

/** Subscribe to theme changes (toggle or OS). fn(dark). Returns an unsubscribe function. */
export function onThemeChange(fn) {
  const h = (e) => fn(e.detail ? Boolean(e.detail.dark) : isDark());
  document.addEventListener('sp-themechange', h);
  return () => document.removeEventListener('sp-themechange', h);
}

/** Current computed value of a CSS custom property on body (e.g. token('--sp-ink')). */
export function token(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}
