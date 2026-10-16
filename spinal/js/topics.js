// In-chapter topic navigation for the long spinal chapters (ENGINE.md §9, "Long spinal chapters are not split").
// Nothing in the chapters is moved or reworded: this module only reads them and adds two things.
//   1. A "Topics" button fixed at the bottom of the screen. It appears once the reader has scrolled into a long
//      chapter, shows where they are ("4/16 · Anticoagulants"), and opens the chapter's topic list; each topic is one
//      tap from there. It hides again near the chapter's pager, so it never covers Previous / Next.
//   2. A top-of-chapter chip list ("In this chapter") for a chapter whose first section has no jump list of its own
//      (today Difficult backs & ultrasound, whose ultrasound half starts far down the page).
// Topics come from the chapter's own jump lists (.sp-jump, their curated short labels and stable anchors) plus any
// h3 heading those lists do not cover, in page order. Topics the current level hides are left out. The links are
// ordinary #hash links, so app.js routes them exactly like any other in-page link (and every old anchor still works).
// The list and button live outside <main>, so search and the "Pearls only" digests never see them.
import { $$, el } from './ui.js?v=1';

const MIN_TOPICS = 4; // fewer than this and the chapter is short enough to scroll
const MIN_SCREENS = 3; // chapter height, in screens, before the button is offered

const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 6h2M4 12h2M4 18h2M9 6h11M9 12h11M9 18h11"/></svg>';

const shown = (n) => !!n && n.getClientRects().length > 0 && !n.closest('[hidden]');
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// A jump link's words without its step number ("04" + "Anticoagulants" -> "Anticoagulants"): the list numbers topics itself.
const labelOf = (n) => clean([...n.childNodes].map((c) => c.textContent).join(' ')).replace(/^\d{1,2}\s+(?=\D)/, '');
const FOLLOWS = typeof Node !== 'undefined' ? Node.DOCUMENT_POSITION_FOLLOWING : 4;

/** The chapter's topics in page order: [{id, label, target}]. Only what the current level shows, unless `all`. */
export function topicsOf(chapter, { all = false } = {}) {
  if (!chapter) return [];
  const items = [];
  const seen = new Set();
  for (const a of chapter.querySelectorAll('.sp-jump:not(.sp-jump--auto) a[href^="#"]')) {
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    const target = document.getElementById(id);
    if (!target || !chapter.contains(target) || seen.has(id) || target.closest('.sp-adv-digest')) continue;
    seen.add(id);
    items.push({ id, label: labelOf(a), target });
  }
  // Headings no jump list covers: a heading is covered when a jump target is the heading, wraps it, or sits between it
  // and the next heading.
  const heads = [...chapter.querySelectorAll('h3[id]')].filter((h) => !h.closest('.sp-adv-digest,.sp-keypoints,.sp-callout,[role=tabpanel],details'));
  const owner = (t) => {
    const inner = t.matches('h3') ? t : t.querySelector('h3[id]');
    if (inner && heads.includes(inner)) return heads.indexOf(inner);
    let k = -1;
    heads.forEach((h, i) => { if (h.compareDocumentPosition(t) & FOLLOWS) k = i; });
    return k;
  };
  const covered = new Set(items.map((it) => owner(it.target)));
  heads.forEach((h, i) => {
    if (covered.has(i) || seen.has(h.id)) return;
    seen.add(h.id);
    items.push({ id: h.id, label: labelOf(h), target: h });
  });
  items.sort((a, b) => (a.target === b.target ? 0 : (a.target.compareDocumentPosition(b.target) & FOLLOWS ? -1 : 1)));
  return all ? items : items.filter((it) => shown(it.target));
}

function chipList(items, cls, label) {
  const ul = el('ul', { class: cls, 'aria-label': label });
  for (const it of items) ul.append(el('li', {}, el('a', { href: `#${it.id}`, text: it.label })));
  return ul;
}

/**
 * Set up the topic navigation. `chapters` are the .sp-chapter elements; call setChapter(ch) whenever the visible
 * chapter changes and refresh() after anything that changes what is shown (level, Pearls only).
 */
export function initTopics(chapters) {
  // ---- 2. top-of-chapter chips where the first section has no jump list (built once; refresh() hides the chips whose
  // topic the current level hides)
  const autoLists = new Map(); // chapter -> [{li, target}]
  for (const ch of chapters) {
    if (ch.id === 'ch-home' || ch.id === 'ch-card' || ch.id === 'ch-refs') continue;
    const first = ch.querySelector(':scope > .sp-section');
    if (!first || first.querySelector('.sp-jump')) continue;
    // Topics inside a panel the chapter's own controls open (the troubleshooting problem picker) are left out.
    const all = topicsOf(ch, { all: true }).filter((it) => !it.target.closest('[hidden]'));
    if (all.length < MIN_TOPICS) continue;
    const mount = first.querySelector(':scope > .sp-mount');
    const list = chipList(all, 'sp-jump sp-jump--auto', `Topics in this chapter: ${ch.dataset.title || ''}`.trim());
    autoLists.set(ch, [...list.children].map((li, i) => ({ li, target: all[i].target })));
    const box = el('nav', { class: 'sp-topics-top', 'aria-label': 'In this chapter' }, el('p', { class: 'sp-topics-top-k', text: 'In this chapter' }), list);
    if (mount) mount.before(box); else first.append(box);
  }

  // ---- 1. the floating Topics button and its list
  const panelId = 'sp-topics-panel';
  const btnLabel = el('span', { class: 'sp-topics-btn-t', text: 'Topics' });
  const btnWhere = el('span', { class: 'sp-topics-btn-at' });
  const btn = el('button', { type: 'button', class: 'sp-topics-btn', 'aria-expanded': 'false', 'aria-controls': panelId, html: ICON }, btnLabel, btnWhere);
  const head = el('div', { class: 'sp-topics-head' },
    el('p', { class: 'sp-topics-k', id: `${panelId}-k`, text: 'Topics in this chapter' }),
    el('button', { type: 'button', class: 'sp-topics-x', text: 'Close' }));
  const listHost = el('nav', { class: 'sp-topics-nav', 'aria-labelledby': `${panelId}-k` });
  const toTop = el('a', { class: 'sp-topics-top-link', href: '#ch-home', text: 'Back to the top of the chapter' });
  const panel = el('div', { class: 'sp-topics-panel', id: panelId, hidden: true }, head, listHost, toTop);
  const wrap = el('div', { class: 'sp-topics', hidden: true }, panel, btn);
  document.body.append(wrap);

  let chapter = null;
  let items = [];
  let at = -1;
  let raf = 0;

  const barBottom = () => Math.max(0, document.getElementById('sp-bar')?.getBoundingClientRect().bottom || 0);
  const isOpen = () => !panel.hidden;

  function open() {
    if (isOpen()) return;
    paintList();
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    wrap.classList.add('is-open');
    panel.style.maxHeight = `${Math.max(220, Math.round(window.innerHeight - barBottom() - 96))}px`;
    const cur = listHost.querySelector('[aria-current]') || listHost.querySelector('a');
    cur?.scrollIntoView({ block: 'nearest' });
    cur?.focus({ preventScroll: true });
  }
  function close(refocus = false) {
    if (!isOpen()) return;
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    wrap.classList.remove('is-open');
    if (refocus) btn.focus();
  }
  btn.addEventListener('click', () => (isOpen() ? close() : open()));
  head.querySelector('.sp-topics-x').addEventListener('click', () => close(true));
  panel.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); e.stopPropagation(); close(true); return; }
    if (!isOpen() || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !panel.contains(e.target)) return;
    const links = [...panel.querySelectorAll('a')];
    const i = links.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : Math.min(links.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
    links[n]?.focus();
  });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !wrap.contains(e.target)) close(); });
  wrap.addEventListener('focusout', (e) => { if (isOpen() && e.relatedTarget && !wrap.contains(e.relatedTarget)) close(); });

  function paintList() {
    listHost.textContent = '';
    const ol = el('ol', { class: 'sp-topics-list' });
    items.forEach((it, i) => {
      const a = el('a', { href: `#${it.id}` }, el('span', { class: 'sp-topics-n', text: String(i + 1) }), el('span', { class: 'sp-topics-l', text: it.label }));
      if (i === at) a.setAttribute('aria-current', 'location');
      ol.append(el('li', {}, a));
    });
    listHost.append(ol);
  }

  /** Which topic is the reader in: the last one whose start has reached the top of the screen. */
  function locate() {
    const line = barBottom() + Math.min(120, window.innerHeight * 0.2);
    let k = -1;
    items.forEach((it, i) => { if (it.target.getBoundingClientRect().top <= line) k = i; });
    return k;
  }

  function update() {
    raf = 0;
    if (!chapter || items.length < MIN_TOPICS) { wrap.hidden = true; close(); return; }
    const vh = window.innerHeight;
    const long = chapter.getBoundingClientRect().height > vh * MIN_SCREENS;
    const first = items[0].target.getBoundingClientRect().top;
    const pager = chapter.querySelector(':scope > .sp-pager');
    const nearEnd = pager && pager.getBoundingClientRect().top < vh - 8;
    const past = first < barBottom() + 40; // the reader has scrolled into the topics
    const want = long && past && !nearEnd;
    if (!want && !isOpen()) { wrap.hidden = true; return; }
    wrap.hidden = false;
    const k = locate();
    if (k !== at) {
      at = k;
      btnWhere.textContent = k >= 0 ? `${k + 1}/${items.length} · ${items[k].label}` : '';
      if (isOpen()) paintList();
    }
  }
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);

  return {
    setChapter(ch) {
      close();
      chapter = ch && ch.id !== 'ch-home' && ch.id !== 'ch-refs' ? ch : null;
      if (chapter) toTop.setAttribute('href', `#${chapter.id}`); // app.js routes it: chapter top, heading focused
      this.refresh();
    },
    refresh() {
      items = chapter ? topicsOf(chapter) : [];
      for (const { li, target } of (chapter && autoLists.get(chapter)) || []) li.hidden = !shown(target);
      at = -2; // force a repaint of the "where" label
      schedule();
    },
  };
}
