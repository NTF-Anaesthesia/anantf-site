// Truncal blocks: page shell. Builds the sticky chapter bar, the hub ("I need to…" tiles + chapter list),
// one chapter at a time with hash routing (browser Back/Forward work), search, copy link, pager and references.
// Usage (see shared/DATA.md):  import { bootPage } from '../shared/js/shell.js';  bootPage({ ...config });
import { $, $$, el, fill, announce } from './ui.js';
import { registerRefs, finaliseRefs, renderRefs } from './refs.js';
import { attachSearch, buildIndex, addSynonyms } from './search.js';
import { renderBlock } from './block.js';

const ICON = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5.5h4V20"/></svg>',
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  link: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
};

const clampI = (v, a, b) => Math.max(a, Math.min(b, v));

/** Replace a heading element with another level, keeping attributes, children and listeners on children. */
function retag(node, tag, cls) {
  const n = document.createElement(tag);
  for (const a of node.attributes) n.setAttribute(a.name, a.value);
  if (cls) n.classList.add(cls);
  while (node.firstChild) n.append(node.firstChild);
  node.replaceWith(n);
  return n;
}

/**
 * After a chapter renders: give it one visible h1 (its title) and merge stacked kickers.
 * Chapters are authored with an h2 title and h3/h4 sub-headings. With one h2, every heading moves up a level
 * (h2 -> h1, h3 -> h2, h4 -> h3) and keeps its look through a tb-hv<n> class (n = the authored level).
 * With several h2s, only the first becomes the h1.
 */
function tidyChapter(sec) {
  if (!sec.querySelector('h1')) {
    const h2s = [...sec.querySelectorAll('h2')];
    if (h2s.length) {
      if (h2s.length === 1) {
        for (const h of [...sec.querySelectorAll('h3,h4,h5')]) {
          const lv = +h.tagName[1];
          retag(h, `h${lv - 1}`, `tb-hv${lv}`);
        }
      }
      retag(h2s[0], 'h1', 'tb-ch-title');
    }
  }
  // "Chapter n of m · Page" and a block's own kicker straight after it: show one line.
  const k = sec.querySelector(':scope > .tb-ch-kicker');
  const next = sec.querySelector(':scope > .tb-bhead > .tb-eyebrow:first-child') || (k?.nextElementSibling?.matches('.tb-eyebrow') ? k.nextElementSibling : null);
  if (k && next && !k.dataset.merged) {
    k.textContent = `${k.textContent.split(' · ')[0]} · ${next.textContent}`;
    k.dataset.merged = '1';
    next.remove();
  }
}

const decode = (h) => { try { return decodeURIComponent((h || '').replace(/^#/, '')); } catch { return (h || '').replace(/^#/, ''); } };

/**
 * bootPage(config): see DATA.md for every field.
 * config = { title, eyebrow, lead, tiles:[{title, desc, href}], chapters:[{id, title, short, desc, block?, render?}],
 *            refs:[{id, text, url, label}], synonyms:[[…]], searchPlaceholder, refsIntro }
 */
export async function bootPage(cfg) {
  const main = $('#main');
  const barHost = $('#tb-bar');
  if (!main) throw new Error('truncal shell: <main id="main"> is missing');
  document.body.classList.add('tb-app', 'tb-booting');
  registerRefs(cfg.refs || []);
  if (cfg.synonyms) addSynonyms(cfg.synonyms);
  const BASE_TITLE = document.title;

  // ------------------------------------------------------------ chapter list (+ References)
  const chs = (cfg.chapters || []).map((c) => ({ ...c, id: c.id || (c.block ? `ch-${c.block.id}` : `ch-${Math.random().toString(36).slice(2, 7)}`) }));
  if ((cfg.refs || []).length && !chs.some((c) => c.id === 'ch-refs')) {
    chs.push({ id: 'ch-refs', title: 'References', short: 'References', desc: 'Sources for the doses, coverage and anatomy on this page.', refs: true });
  }

  // ------------------------------------------------------------ hub
  const placeholder = cfg.searchPlaceholder || 'Search, e.g. TAP, groin, dose';
  const hub = el('section', { class: 'tb-chapter', id: 'ch-home', dataset: { title: 'Hub' }, 'aria-labelledby': 'tb-home-h' });
  const hubIn = el('div', { class: 'tb-hub' });
  if (cfg.eyebrow) hubIn.append(el('p', { class: 'tb-eyebrow', text: cfg.eyebrow }));
  hubIn.append(el('h1', { id: 'tb-home-h', text: cfg.title || BASE_TITLE }));
  if (cfg.lead) hubIn.append(fill(el('p', { class: 'tb-lead' }), cfg.lead));
  hubIn.append(fill(el('p', { class: 'tb-credit' }), 'Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>, NTF Anaesthesia'));
  hubIn.append(fill(el('p', { class: 'tb-hub-disclaimer' }), '<strong>For education only.</strong> Follow local guidelines and senior advice; check doses for each patient.'));
  const hubQ = el('input', { type: 'search', class: 'tb-search-input', id: 'tb-hub-q', placeholder, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search this page' });
  const hubRes = el('ul', { class: 'tb-sresults', id: 'tb-hub-res' });
  hubIn.append(el('div', { class: 'tb-search-row tb-hub-search', role: 'search' }, hubQ), hubRes);
  if ((cfg.tiles || []).length) {
    hubIn.append(el('h2', { class: 'tb-hub-h', id: 'hub-need', text: 'I need to…' }));
    const ul = el('ul', { class: 'tb-tiles' });
    cfg.tiles.forEach((t) => ul.append(el('li', {}, el('a', { class: 'tb-tile', href: t.href }, el('span', { class: 'tb-tile-t', text: t.title }), t.desc ? el('span', { class: 'tb-tile-d', text: t.desc }) : null))));
    hubIn.append(ul);
  }
  hubIn.append(el('h2', { class: 'tb-hub-h', id: 'hub-chapters', text: 'Chapters' }));
  const hubCh = el('ol', { class: 'tb-hubch' });
  chs.forEach((c) => hubCh.append(el('li', {}, el('a', { href: `#${c.id}` }, el('span', { class: 'tb-hubch-t', text: c.title }), c.desc ? el('span', { class: 'tb-hubch-d', text: c.desc }) : null))));
  hubIn.append(hubCh);
  if (cfg.hubExtra) { const x = el('div', { class: 'tb-hub-extra' }); fill(x, typeof cfg.hubExtra === 'function' ? cfg.hubExtra() : cfg.hubExtra); hubIn.append(x); }
  hubIn.append(el('p', { class: 'tb-hub-back' }, el('a', { href: '../', text: 'All truncal blocks' })));
  hub.append(hubIn);
  main.textContent = '';
  main.append(hub);

  // ------------------------------------------------------------ chapters
  const sections = new Map();
  chs.forEach((c, i) => {
    const sec = el('section', { class: 'tb-chapter', id: c.id, dataset: { title: c.title } });
    sec.append(el('p', { class: 'tb-ch-kicker', text: `Chapter ${i + 1} of ${chs.length} · ${cfg.title || ''}` }));
    sections.set(c.id, sec);
    main.append(sec);
  });

  // ------------------------------------------------------------ sticky bar + search sheet
  // Wide screens: an inline list of chapter links. Narrow screens: a disclosure button that opens the same
  // links as a menu (a <select> would jump chapters on every arrow key press).
  const chlist = el('ol', { class: 'tb-chlist', id: 'tb-chlist' });
  const menuList = el('ol', { class: 'tb-chmenu-list' }, el('li', {}, el('a', { href: '#ch-home', dataset: { ch: 'ch-home' }, text: 'Hub (start here)' })));
  chs.forEach((c) => {
    chlist.append(el('li', {}, el('a', { href: `#${c.id}`, dataset: { ch: c.id }, text: c.short || c.title })));
    menuList.append(el('li', {}, el('a', { href: `#${c.id}`, dataset: { ch: c.id }, text: c.title })));
  });
  const menuLabel = el('span', { class: 'tb-chmenu-cur', text: 'Hub' });
  const menuBtn = el('button', { type: 'button', class: 'tb-chmenu-btn', id: 'tb-chmenu-btn', 'aria-expanded': 'false', 'aria-controls': 'tb-chmenu' },
    el('span', { class: 'tb-chmenu-k', text: 'Chapter' }), menuLabel, el('span', { class: 'tb-chmenu-caret', 'aria-hidden': 'true' }));
  const menu = el('div', { class: 'tb-chmenu-panel', id: 'tb-chmenu', hidden: true }, menuList);
  const chmenu = el('div', { class: 'tb-chmenu' }, menuBtn, menu);
  const closeMenu = (refocus = false) => { if (menu.hidden) return; menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); if (refocus) menuBtn.focus(); };
  menuBtn.addEventListener('click', () => {
    if (!menu.hidden) { closeMenu(); return; }
    menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true');
    (menuList.querySelector('a[aria-current]') || menuList.querySelector('a')).focus();
  });
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
  chmenu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { e.preventDefault(); closeMenu(true); return; }
    if (menu.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    const links = $$('a', menuList); const i = links.indexOf(document.activeElement);
    e.preventDefault();
    const n = e.key === 'Home' ? 0 : e.key === 'End' ? links.length - 1 : clampI(i + (e.key === 'ArrowDown' ? 1 : -1), 0, links.length - 1);
    links[n].focus();
  });
  chmenu.addEventListener('focusout', (e) => { if (!chmenu.contains(e.relatedTarget)) closeMenu(); });
  document.addEventListener('pointerdown', (e) => { if (!chmenu.contains(e.target)) closeMenu(); });
  const homeLink = el('a', { class: 'tb-bar-home', id: 'tb-home-link', href: '#ch-home', 'aria-label': 'Back to the hub', html: `${ICON.home}<span>Hub</span>` });
  const searchBtn = el('button', { type: 'button', class: 'tb-tool tb-bar-btn', id: 'tb-search-open', 'aria-expanded': 'false', 'aria-controls': 'tb-sheet', html: `${ICON.search}<span>Search</span>` });
  const shareStatus = el('span', { id: 'tb-share-status', class: 'tb-sr', role: 'status', 'aria-live': 'polite' });
  const shareBtn = el('button', { type: 'button', class: 'tb-tool tb-bar-btn', id: 'tb-share', 'aria-describedby': 'tb-share-status', html: `${ICON.link}<span>Copy link</span>` });
  const bar = barHost || el('div', { id: 'tb-bar' });
  bar.className = 'tb-bar';
  bar.textContent = '';
  bar.append(el('div', { class: 'tb-bar-inner site-container' },
    el('nav', { class: 'tb-chnav', 'aria-label': 'Chapters' }, homeLink, chlist, chmenu),
    searchBtn, shareBtn, shareStatus));
  if (!barHost) main.before(bar);
  const sheetQ = el('input', { type: 'search', class: 'tb-search-input', id: 'tb-sheet-q', placeholder, autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Search this page' });
  const sheetRes = el('ul', { class: 'tb-sresults', id: 'tb-sheet-res' });
  const sheetClose = el('button', { type: 'button', class: 'tb-tool', text: 'Close' });
  const sheet = el('div', { class: 'tb-sheet', id: 'tb-sheet', role: 'dialog', 'aria-label': 'Search this page', hidden: true },
    el('div', { class: 'tb-sheet-inner site-container' }, el('div', { class: 'tb-search-row' }, sheetQ, sheetClose), sheetRes));
  bar.after(sheet);
  if (!$('#tb-live')) document.body.append(el('div', { id: 'tb-live', class: 'tb-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }));

  // copy link
  let shareTimer = 0;
  shareBtn.addEventListener('click', async () => {
    let ok = false;
    try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
      try { const ta = el('textarea', { readonly: true, style: { position: 'fixed', opacity: '0', top: '0' } }); ta.value = location.href; document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch { ok = false; }
    }
    shareStatus.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
    shareBtn.querySelector('span').textContent = ok ? 'Copied' : 'Copy link';
    clearTimeout(shareTimer);
    shareTimer = setTimeout(() => { shareBtn.querySelector('span').textContent = 'Copy link'; shareStatus.textContent = ''; }, 2200);
  });

  // ------------------------------------------------------------ routing
  const chapters = [hub, ...chs.map((c) => sections.get(c.id))];
  const byId = new Map(chapters.map((c) => [c.id, c]));
  let current = null;
  const paintNav = () => {
    $$('a', chlist).concat($$('a', menuList)).forEach((a) => { if (a.dataset.ch === current?.id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    menuLabel.textContent = current?.id === 'ch-home' || !current ? 'Hub' : (chs.find((c) => c.id === current.id)?.short || current.dataset.title);
    homeLink.hidden = current?.id === 'ch-home';
  };
  const kickResize = () => { requestAnimationFrame(() => window.dispatchEvent(new Event('resize'))); setTimeout(() => window.dispatchEvent(new Event('resize')), 150); };
  function showChapter(ch) {
    if (!ch || ch === current) return false;
    current = ch;
    chapters.forEach((c) => c.classList.toggle('is-current', c === ch));
    document.body.dataset.chapter = ch.id;
    document.title = ch.id === 'ch-home' ? BASE_TITLE : `${ch.dataset.title} — ${BASE_TITLE}`;
    paintNav();
    document.dispatchEvent(new CustomEvent('tb-chapter', { detail: { id: ch.id } }));
    kickResize();
    return true;
  }

  const shown = (n) => !!n && n.getClientRects().length > 0 && !n.closest('[hidden]');
  const openAncestors = (n) => { for (let p = n.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true; };

  async function goToHash(hash, { initial = false } = {}) {
    let id = decode(hash) || 'ch-home';
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (byId.has(id)) {
      const ch = byId.get(id);
      showChapter(ch);
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (!initial) { const h = ch.querySelector('h1') || ch.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } announce(`${ch.dataset.title}`); }
      return;
    }
    let target = document.getElementById(id);
    if (!target) return;
    const changed = showChapter(target.closest('.tb-chapter'));
    if (changed) window.scrollTo({ top: 0, behavior: 'instant' });
    openAncestors(target);
    if (!shown(target) && !target.dataset.activate) return;
    const scrollEl = (target.dataset.scrollTo && document.getElementById(target.dataset.scrollTo)) || target;
    requestAnimationFrame(() => {
      scrollEl.scrollIntoView({ block: 'start', behavior: initial || changed || reduce ? 'instant' : 'smooth' });
      if (target.dataset.activate) target.click();
      if (!initial) {
        const f = target.matches('a,button,input,select,textarea,summary,[tabindex]') ? target : scrollEl;
        if (!f.matches('a,button,input,select,textarea,summary,[tabindex]')) f.setAttribute('tabindex', '-1');
        f.focus({ preventScroll: true });
      }
      settle(scrollEl);
    });
  }
  // Content above the target can finish laying out after the jump; re-align a few times unless the reader scrolls.
  function settle(t) {
    let cancelled = false;
    const stop = () => { cancelled = true; };
    const evs = ['wheel', 'touchstart', 'keydown', 'mousedown'];
    evs.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    [400, 900].forEach((ms, i, all) => setTimeout(() => {
      if (!cancelled && Math.abs(t.getBoundingClientRect().top - pad) > 24) t.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (i === all.length - 1) evs.forEach((e) => window.removeEventListener(e, stop));
    }, ms));
  }
  window.addEventListener('hashchange', () => goToHash(location.hash));
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    if (a.hash && a.hash === location.hash) { e.preventDefault(); goToHash(a.hash); }
    else if (a.getAttribute('href') === '#ch-home' && !location.hash) { e.preventDefault(); goToHash('#ch-home'); }
  });

  // ------------------------------------------------------------ search wiring
  const closeSheet = (refocus = false) => { if (sheet.hidden) return; sheet.hidden = true; searchBtn.setAttribute('aria-expanded', 'false'); if (refocus) searchBtn.focus(); };
  attachSearch(sheetQ, sheetRes, { onPick: () => closeSheet(), onEscape: () => closeSheet(true) });
  attachSearch(hubQ, hubRes);
  sheetClose.addEventListener('click', () => closeSheet(true));
  const openSearch = () => {
    if (current?.id === 'ch-home') { hubQ.scrollIntoView({ block: 'center' }); hubQ.focus(); return; }
    sheet.hidden = false; searchBtn.setAttribute('aria-expanded', 'true'); sheetQ.focus();
  };
  searchBtn.addEventListener('click', () => { if (!sheet.hidden) closeSheet(); else openSearch(); });
  // Ctrl+K / Cmd+K opens search (no single-character shortcuts: WCAG 2.1.4).
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openSearch(); }
  });
  window.addEventListener('hashchange', () => { closeSheet(); closeMenu(); });

  // ------------------------------------------------------------ render chapters
  {
    const id0 = decode(location.hash);
    const direct = byId.get(id0) || document.getElementById(id0)?.closest('.tb-chapter');
    showChapter(direct || hub);
  }
  for (const [i, c] of chs.entries()) {
    const sec = sections.get(c.id);
    try {
      if (c.block) renderBlock(c.block, sec, { pageTitle: cfg.title });
      if (c.refs) {
        const h = el('h2', { id: 'references-h', text: c.title });
        sec.append(h);
        if (cfg.refsIntro) sec.append(fill(el('p', { class: 'tb-lead tb-lead--small' }), cfg.refsIntro));
        renderRefs(sec);
      }
      if (typeof c.render === 'function') await c.render(sec);
      tidyChapter(sec);
    } catch (err) {
      console.error(`[truncal] chapter ${c.id} failed`, err);
      sec.append(el('p', { class: 'tb-mount-error', text: 'This part didn’t load. Reload the page.' }));
    }
    const prev = i === 0 ? { id: 'ch-home', title: 'Hub' } : chs[i - 1];
    const next = chs[i + 1];
    const pager = el('nav', { class: 'tb-pager', 'aria-label': 'Chapter navigation' });
    pager.append(el('a', { class: 'tb-pager-a tb-pager-prev', href: `#${prev.id}` }, el('small', { text: 'Previous' }), el('span', { text: prev.title })));
    pager.append(el('a', { class: 'tb-pager-a tb-pager-hub', href: '#ch-home' }, el('small', { text: 'Back to' }), el('span', { text: 'Hub' })));
    if (next) pager.append(el('a', { class: 'tb-pager-a tb-pager-next', href: `#${next.id}` }, el('small', { text: 'Next' }), el('span', { text: next.title })));
    sec.append(pager);
  }
  try { finaliseRefs(main); } catch (err) { console.error('[truncal] references failed', err); }
  try { buildIndex(); } catch (err) { console.error('[truncal] search index failed', err); }
  document.body.classList.remove('tb-booting');
  document.body.classList.add('tb-chapters-on');
  document.body.dataset.tbReady = 'true';
  document.dispatchEvent(new CustomEvent('tb-ready'));
  await goToHash(location.hash, { initial: true });
  kickResize();
}
