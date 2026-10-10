// Truncal blocks: small DOM helpers shared by the shell, the block renderer and page modules.
// Every component uses `tb-*` classes styled in shared/css/truncal.css.

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape text for safe insertion into an HTML string. */
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]); }

let uid = 0;
export function uniqueId(prefix = 'tb') { uid += 1; return `${prefix}-u${uid}`; }

function append(node, child) {
  if (child == null || child === false) return;
  if (Array.isArray(child)) { child.forEach((c) => append(node, c)); return; }
  node.append(child instanceof Node ? child : document.createTextNode(String(child)));
}

/** Put trusted HTML (string) or Node(s) into an element. Page data strings are trusted, authored HTML. */
export function fill(node, content) {
  if (content == null) return node;
  if (typeof content === 'string') node.insertAdjacentHTML('beforeend', content);
  else append(node, content);
  return node;
}

/**
 * el('button', {class, type, on:{click}, dataset, style, hidden, html, text, ...attrs}, ...children)
 * Strings passed as children are text (escaped). Use `html` or fill() for markup.
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

const SVGNS = 'http://www.w3.org/2000/svg';
/** SVG element helper: sv('path', {d:'…'}, parent?) */
export function sv(tag, attrs = {}, parent) {
  const n = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') n.textContent = v; else n.setAttribute(k, String(v));
  }
  if (parent) parent.append(n);
  return n;
}

/** Polite screen-reader announcement through #tb-live. */
export function announce(text) {
  const live = document.getElementById('tb-live');
  if (!live) return;
  live.textContent = '';
  requestAnimationFrame(() => { live.textContent = text; });
}

// ---------------------------------------------------------------- search registry
const searchExtras = [];
/** registerSearch([{title, text, id}]): add text the DOM scan can't see (canvas labels). `id` must exist. */
export function registerSearch(items) {
  if (!Array.isArray(items)) return;
  for (const it of items) if (it && it.id && (it.title || it.text)) searchExtras.push({ title: String(it.title || ''), text: String(it.text || ''), id: String(it.id) });
}
export function getSearchExtras() { return searchExtras; }

// ---------------------------------------------------------------- components
const ICONS = {
  key: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><rect x="3" y="3" width="10" height="10" fill="currentColor"/></svg>',
  warn: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.8 15 14.2H1z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4.2" stroke="currentColor" stroke-width="1.6"/><rect x="7.2" y="11.2" width="1.6" height="1.6" fill="currentColor"/></svg>',
  pearl: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  note: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 1.5h6l3 3v10h-9z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 8h5M5.5 10.5h5M5.5 13h3" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
};
const CALLOUT_LABEL = { key: 'Key point', warn: 'Warning', pearl: 'Exam pearl', note: 'Note' };

/** callout('warn', {title, body}) → <aside class="tb-callout tb-callout--warn"> */
export function callout(kind, { title, body, label } = {}) {
  const k = CALLOUT_LABEL[kind] ? kind : 'key';
  const head = el('p', { class: 'tb-callout-label' });
  head.insertAdjacentHTML('beforeend', ICONS[k]);
  head.append(el('span', { text: label || CALLOUT_LABEL[k] }));
  const box = el('aside', { class: `tb-callout tb-callout--${k}`, role: 'note' }, head);
  if (title) box.append(fill(el('p', { class: 'tb-callout-title' }), title));
  if (body != null) box.append(fill(el('div', { class: 'tb-callout-body' }), body));
  return box;
}

/** keyPoints(['…']) → key points box */
export function keyPoints(items = [], { title = 'Key points' } = {}) {
  const ul = el('ul');
  for (const it of items) ul.append(fill(el('li'), it));
  return el('aside', { class: 'tb-keypoints', 'aria-label': title }, el('p', { class: 'tb-keypoints-title', text: title }), ul);
}

/** steps([{title, body, id}]) → numbered step list */
export function steps(items) {
  const ol = el('ol', { class: 'tb-steps' });
  items.forEach((it, i) => {
    const li = el('li', { class: 'tb-step', id: it.id });
    li.append(el('span', { class: 'tb-step-n', 'aria-hidden': 'true', text: String(i + 1) }));
    const main = el('div', { class: 'tb-step-main' });
    main.append(fill(el('p', { class: 'tb-step-title' }), it.title));
    if (it.body != null) main.append(fill(el('div', { class: 'tb-step-body' }), it.body));
    li.append(main);
    ol.append(li);
  });
  return ol;
}

/** table({caption, head, rows, stack=true, id}) → responsive table (stacks into cards on phones). */
export function table({ caption, head = [], rows = [], stack = true, id, className } = {}) {
  const t = el('table', { class: ['tb-table', stack ? 'tb-table--stack' : '', className] });
  if (caption) t.append(fill(el('caption'), caption));
  if (head.length) {
    const tr = el('tr');
    head.forEach((h) => tr.append(fill(el('th', { scope: 'col' }), h)));
    t.append(el('thead', {}, tr));
  }
  const labels = head.map((h) => String(h).replace(/<[^>]+>/g, '').trim());
  const tb = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    r.forEach((c, i) => {
      const obj = c && typeof c === 'object' && !(c instanceof Node);
      const cell = el(obj && c.th ? 'th' : 'td', obj && c.th ? { scope: 'row' } : {});
      if (labels[i]) cell.dataset.label = labels[i];
      fill(cell, obj ? (c.node ?? c.html) : c);
      tr.append(cell);
    });
    tb.append(tr);
  });
  t.append(tb);
  const wrap = el('div', { class: 'tb-table-wrap', id });
  if (!stack) {
    const label = caption ? String(caption).replace(/<[^>]+>/g, '').trim() : 'Table';
    wrap.append(el('div', { class: 'tb-table-scroll', tabindex: '0', role: 'region', 'aria-label': label }, t));
  } else wrap.append(t);
  return wrap;
}

/** details({id, summary, body, open}) → <details class="tb-details"> */
export function details({ id, summary, body, open = false } = {}) {
  const d = el('details', { class: 'tb-details', id });
  d.open = Boolean(open);
  d.append(fill(el('summary'), summary), fill(el('div', { class: 'tb-details-body' }), body));
  return d;
}

// ---------------------------------------------------------------- canvas, visibility, motion
/** Size a canvas for the device pixel ratio. Returns a ctx whose units are CSS px. */
export function setupCanvas(canvas, cssW, cssH) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssW * dpr));
  canvas.height = Math.max(1, Math.round(cssH * dpr));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** Call onEnter when target is on screen, onLeave when it leaves. Returns a disconnect function. */
export function whenVisible(target, onEnter, onLeave) {
  if (!('IntersectionObserver' in window)) { onEnter?.(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) { if (e.isIntersecting) onEnter?.(e); else onLeave?.(e); }
  }, { rootMargin: '80px 0px' });
  io.observe(target);
  return () => io.disconnect();
}

/** Observe size changes (one callback per frame). Returns a disconnect function. */
export function onResize(target, fn) {
  if (!('ResizeObserver' in window)) { window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn); }
  let raf = 0;
  const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => fn(target.getBoundingClientRect())); });
  ro.observe(target);
  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}

const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
export const reducedMotion = () => mqReduce.matches;
