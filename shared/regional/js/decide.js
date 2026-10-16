// Regional anaesthesia app: step-by-step decision guides ("If it goes wrong"; ENGINE.md §3.8).
// Data and schema: ./data/decisions.js. Styles: ../css/decide.css (linked by this module, like scan.css).
//
//   mountGuide(host, guide, {idPrefix, headingLevel}) → {el, reset(), back(), current(), path()}
//       One guide: the current step (a question with Yes / No, or an action with "Next step"), the answers so far,
//       Back and Start again, an aria-live line, and the whole guide as a flat numbered list in a <details> (opened for
//       printing). Focus moves to the new step's heading after each tap. State lives in memory only (never the URL).
//   guideList(ids, {idPrefix, headingLevel, lazy}) → <div class="ra-dg-list">: one <details> per guide, id
//       `${idPrefix}-${guideId}`; with lazy (the default) a guide is built the first time it is opened.
//   openGuideFromHash(hash?) → opens the guide <details> a hash points at (or sits in); true if it did.
//
// Used by the engine pages, /blocks/, brachial-plexus/ and spinal/. Apps that don't load regional.css wrap the list in
// .ra-dg-host (decide.css gives it the engine tokens and the tb-btn / tb-details styles; the app may remap the tokens).
// Element ids are prefixed, so the same guide can appear once per block on one page.
import { GUIDES, GUIDE_ORDER } from './data/decisions.js';

const CSS_KEY = 'decide';
export function ensureDecideCss() {
  if (typeof document === 'undefined' || document.querySelector(`link[data-ra-css="${CSS_KEY}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../css/decide.css?v=20261017', import.meta.url).href;
  l.dataset.raCss = CSS_KEY;
  document.head.append(l);
}

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else n.setAttribute(k, v === true ? '' : String(v));
  }
  kids.flat().forEach((c) => c != null && n.append(c instanceof Node ? c : document.createTextNode(String(c))));
  return n;
}

const TONE = { danger: 'Act now', warn: 'Take care', ok: 'Do this' };
const nextOf = (s) => (s.ask ? (s.choices ? s.choices.map((c) => c.to) : [s.yes, s.no]) : (s.next ? [s.next] : []));
const choicesOf = (s) => (s.choices ? s.choices : [{ label: 'Yes', to: s.yes }, { label: 'No', to: s.no }]);
const strip = (html) => { const d = document.createElement('div'); d.innerHTML = html || ''; return d.textContent.replace(/\s+/g, ' ').trim(); };

/** Step ids in reading order: depth-first from start, Yes before No (the numbering of the flat list). */
export function stepOrder(g) {
  const out = [];
  const go = (id) => { if (!id || out.includes(id) || !g.steps[id]) return; out.push(id); nextOf(g.steps[id]).forEach(go); };
  go(g.start);
  Object.keys(g.steps).forEach((id) => { if (!out.includes(id)) out.push(id); });
  return out;
}

/** The whole guide as a numbered list (print, screen readers, revision). */
function flatList(g, prefix) {
  const order = stepOrder(g);
  const num = (id) => order.indexOf(id) + 1;
  const ol = h('ol', { class: 'ra-dg-flat' });
  for (const id of order) {
    const s = g.steps[id];
    const li = h('li', { id: `${prefix}-s-${id}`, class: `ra-dg-flat-i${s.do ? ` ra-dg-flat-i--${s.tone || 'ok'}` : ''}` });
    if (s.ask) {
      li.append(h('p', { class: 'ra-dg-flat-q', text: s.ask }));
      if (s.help) li.append(h('p', { class: 'ra-dg-flat-help', html: s.help }));
      const ul = h('ul', { class: 'ra-dg-flat-go' });
      choicesOf(s).forEach((c) => ul.append(h('li', {}, h('strong', { text: c.label }), ` → step ${num(c.to)}`)));
      li.append(ul);
    } else {
      li.append(h('p', { class: 'ra-dg-flat-q' }, h('span', { class: 'ra-dg-flat-k', text: `${TONE[s.tone] || TONE.ok}: ` }), s.do));
      li.append(h('div', { class: 'ra-dg-flat-body', html: s.html }));
      li.append(h('p', { class: 'ra-dg-flat-next', text: s.next ? `Then step ${num(s.next)}.` : 'End of this guide.' }));
    }
    ol.append(li);
  }
  return ol;
}

/**
 * Mount one guide into host. opts.idPrefix makes element ids unique (default: 'dg-<id>'); opts.headingLevel is the
 * heading level of each step's title (default 4).
 */
export function mountGuide(host, g, { idPrefix = `dg-${g.id}`, headingLevel = 4 } = {}) {
  ensureDecideCss();
  const order = stepOrder(g);
  const hTag = `h${Math.min(6, Math.max(2, headingLevel))}`;
  const root = h('div', { class: 'ra-dg', id: idPrefix, 'data-guide': g.id, 'data-tier': '1' });
  if (g.when) root.append(h('p', { class: 'ra-dg-when' }, h('strong', { text: 'Use this when: ' }), h('span', { html: g.when })));
  const trail = h('ol', { class: 'ra-dg-trail', 'aria-label': 'Your steps so far' });
  const stage = h('div', { class: 'ra-dg-stage' });
  const back = h('button', { type: 'button', class: 'tb-btn ra-dg-back', text: 'Back' });
  const again = h('button', { type: 'button', class: 'tb-btn ra-dg-again', text: 'Start again' });
  const nav = h('div', { class: 'ra-dg-nav' }, back, again);
  const live = h('p', { class: 'tb-sr ra-dg-live', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const all = h('details', { class: 'tb-details ra-dg-all' }, h('summary', { text: 'The whole guide as a list' }), h('div', { class: 'tb-details-body' }, flatList(g, idPrefix)));
  root.append(trail, stage, nav, live, all);
  host.append(root);

  let path = [g.start];
  let answers = []; // label chosen at each question step in path (null for actions)

  function render({ focus = false } = {}) {
    const id = path[path.length - 1];
    const s = g.steps[id];
    const n = order.indexOf(id) + 1;
    // answers so far
    trail.textContent = '';
    path.slice(0, -1).forEach((pid, i) => {
      const ps = g.steps[pid];
      trail.append(h('li', { class: `ra-dg-trail-i${ps.do ? ' ra-dg-trail-i--do' : ''}` },
        ps.ask ? [h('span', { class: 'ra-dg-trail-q', text: ps.ask }), ' ', h('strong', { class: 'ra-dg-trail-a', text: answers[i] || '' })]
          : [h('span', { class: 'ra-dg-trail-k', text: 'Done: ' }), h('span', { class: 'ra-dg-trail-q', text: ps.do })]));
    });
    trail.hidden = path.length < 2;
    // current step
    stage.textContent = '';
    const tone = s.do ? (s.tone || 'ok') : 'ask';
    const card = h('section', { class: `ra-dg-step ra-dg-step--${tone}`, 'aria-labelledby': `${idPrefix}-cur` });
    card.append(h('p', { class: 'ra-dg-k', text: `Step ${n} · ${s.ask ? 'Question' : (TONE[s.tone] || TONE.ok)}` }));
    card.append(h(hTag, { class: 'ra-dg-title', id: `${idPrefix}-cur`, tabindex: '-1', text: s.ask || s.do }));
    if (s.ask && s.help) card.append(h('p', { class: 'ra-dg-help', html: s.help }));
    if (s.do) card.append(h('div', { class: 'ra-dg-body', html: s.html }));
    const acts = h('div', { class: 'ra-dg-acts' });
    if (s.ask) {
      choicesOf(s).forEach((c) => {
        const b = h('button', { type: 'button', class: 'tb-btn ra-dg-choice', 'data-to': c.to, text: c.label });
        b.addEventListener('click', () => go(c.to, c.label));
        acts.append(b);
      });
    } else if (s.next) {
      const b = h('button', { type: 'button', class: 'tb-btn tb-btn--primary ra-dg-next', 'data-to': s.next }, 'Next step ', h('span', { 'aria-hidden': 'true', text: '→' }));
      b.addEventListener('click', () => go(s.next, null));
      acts.append(b);
    } else {
      acts.append(h('p', { class: 'ra-dg-end', text: 'End of this guide.' }));
    }
    card.append(acts);
    stage.append(card);
    back.disabled = path.length < 2;
    root.dataset.step = id;
    if (focus) {
      const t = card.querySelector('.ra-dg-title');
      t.focus({ preventScroll: true });
      const r = card.getBoundingClientRect();
      const bar = document.querySelector('.tb-bar,.bp-bar,.sp-bar')?.getBoundingClientRect().bottom || 0;
      if (r.top < bar + 8 || r.top > innerHeight * 0.6) card.scrollIntoView({ block: 'start', behavior: 'instant' });
      live.textContent = `Step ${n}: ${s.ask || s.do}. ${s.do ? strip(s.html) : ''}`.trim();
    }
  }
  function go(to, label) {
    if (!g.steps[to]) return;
    answers[path.length - 1] = label;
    path = [...path, to];
    render({ focus: true });
  }
  back.addEventListener('click', () => { if (path.length < 2) return; path = path.slice(0, -1); answers = answers.slice(0, path.length - 1); render({ focus: true }); });
  again.addEventListener('click', () => { path = [g.start]; answers = []; render({ focus: true }); });
  root.addEventListener('keydown', (e) => { if (e.key === 'Escape' && path.length > 1 && root.contains(document.activeElement)) { e.preventDefault(); back.click(); } });
  render();
  return {
    el: root,
    reset() { path = [g.start]; answers = []; render(); },
    back() { back.click(); },
    current: () => path[path.length - 1],
    path: () => [...path],
  };
}

/** One <details> per guide id (in GUIDE_ORDER), each built on first open unless lazy is false. */
export function guideList(ids, { idPrefix = 'dg', headingLevel = 4, lazy = true, summaryLevel = null } = {}) {
  ensureDecideCss();
  const list = h('div', { class: 'ra-dg-list' });
  const want = GUIDE_ORDER.filter((id) => ids.includes(id) && GUIDES[id]);
  for (const id of want) {
    const g = GUIDES[id];
    const d = h('details', { class: `tb-details ra-dg-item${id === 'last' || id === 'high' ? ' ra-dg-item--danger' : ''}`, id: `${idPrefix}-${id}`, 'data-guide': id, 'data-tier': '1' });
    const sum = h('summary', {}, summaryLevel ? h(`h${summaryLevel}`, { class: 'ra-dg-sum', text: g.title }) : h('span', { class: 'ra-dg-sum', text: g.title }));
    const body = h('div', { class: 'tb-details-body ra-dg-item-body' });
    d.append(sum, body);
    let api = null;
    const build = () => { if (!api) api = mountGuide(body, g, { idPrefix: `${idPrefix}-${id}-g`, headingLevel }); };
    if (lazy) d.addEventListener('toggle', () => { if (d.open) build(); });
    else build();
    list.append(d);
  }
  return list;
}

/** Open the guide a hash points at (the <details> itself or anything inside it). */
export function openGuideFromHash(hash = typeof location !== 'undefined' ? location.hash : '') {
  let id = String(hash || '').replace(/^#/, '');
  if (!id) return false;
  try { id = decodeURIComponent(id); } catch { /* keep */ }
  const t = document.getElementById(id);
  const d = t?.closest?.('details.ra-dg-item');
  if (!d) return false;
  d.open = true;
  return true;
}

// Printing: show each built guide as its flat list.
if (typeof window !== 'undefined' && !window.__raDecidePrint) {
  window.__raDecidePrint = true;
  window.addEventListener('beforeprint', () => document.querySelectorAll('details.ra-dg-all').forEach((d) => { d.open = true; }));
}
