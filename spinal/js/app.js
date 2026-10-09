// spinal/ page controller: share, scroll-spy, section mounts, references, deep links.
import { $, $$, el, announce } from './ui.js?v=1';
import { registerRefs, finalise } from './refs.js?v=1';


// Light mode only: the page is pinned with <html data-theme="light">.

// ---------------------------------------------------------------- copy link
const shareBtn = $('#sp-share');
let shareTimer = 0;
shareBtn?.addEventListener('click', async () => {
  const status = $('#sp-share-status');
  const span = shareBtn.querySelector('span');
  let ok = false;
  try { await navigator.clipboard.writeText(location.href); ok = true; } catch {
    try {
      const ta = el('textarea', { readonly: true, style: { position: 'fixed', opacity: '0', top: '0', left: '0' } });
      ta.value = location.href;
      document.body.append(ta); ta.select(); ok = document.execCommand('copy'); ta.remove();
    } catch { ok = false; }
  }
  status.textContent = ok ? 'Link copied' : 'Copy the address bar to share this page';
  span.textContent = ok ? 'Copied' : 'Copy link';
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => { span.textContent = 'Copy link'; status.textContent = ''; }, 2200);
});

// ---------------------------------------------------------------- section nav: overflow fade + scroll-spy
const secnav = $('.sp-secnav');
const navList = secnav?.querySelector('ol');
const navLinks = navList ? $$('a[href^="#"]', navList) : [];
const sections = navLinks.map((a) => document.getElementById(a.hash.slice(1))).filter(Boolean);

function paintOverflow() {
  if (!navList) return;
  const over = navList.scrollWidth > navList.clientWidth + 2;
  secnav.classList.toggle('is-overflowing', over);
  secnav.classList.toggle('at-start', over && navList.scrollLeft <= 2);
  secnav.classList.toggle('at-end', over && navList.scrollLeft + navList.clientWidth >= navList.scrollWidth - 2);
}
navList?.addEventListener('scroll', paintOverflow, { passive: true });
window.addEventListener('resize', paintOverflow);
paintOverflow();

function keepLinkVisible(a) {
  if (!navList || !a) return;
  const li = a.parentElement;
  const left = li.offsetLeft - navList.offsetLeft;
  const right = left + li.offsetWidth;
  const pad = 28;
  let target = null;
  if (left - pad < navList.scrollLeft) target = Math.max(0, left - pad);
  else if (right + pad > navList.scrollLeft + navList.clientWidth) target = right + pad - navList.clientWidth;
  if (target != null) navList.scrollTo({ left: target, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

let activeId = null;
function setActive(id) {
  if (id === activeId) return;
  activeId = id;
  for (const a of navLinks) {
    if (a.hash.slice(1) === id) { a.setAttribute('aria-current', 'true'); keepLinkVisible(a); }
    else a.removeAttribute('aria-current');
  }
}
function computeActive() {
  const line = window.innerHeight * 0.3;
  let current = null;
  for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id;
  // At the very bottom the last (short) section can never reach the 30% line.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && sections.length) {
    const last = sections[sections.length - 1];
    if (last.getBoundingClientRect().top < window.innerHeight) current = last.id;
  }
  setActive(current);
}
let spyRaf = 0;
const scheduleSpy = () => { cancelAnimationFrame(spyRaf); spyRaf = requestAnimationFrame(computeActive); };
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(scheduleSpy, { rootMargin: '-30% 0px -70% 0px', threshold: 0 });
  sections.forEach((s) => io.observe(s));
}
window.addEventListener('scroll', scheduleSpy, { passive: true });
window.addEventListener('resize', scheduleSpy);

// ---------------------------------------------------------------- level (tier)
// Levels: '1' MO only, '2' MO + Resident, 'adv' Advanced pearls only (a digest per section), 'all' everything.
const LEVELS = {
  1: { name: 'MO', tier: 1, hint: 'MO: MOPEX level. Showing what you need for your first supervised spinals.' },
  2: { name: 'Resident', tier: 2, hint: 'Resident: everything up to the MMed exam (MO and Resident).' },
  adv: { name: 'Advanced', tier: 3, hint: 'Advanced: subspecialty detail and consultant pearls only, collected section by section.' },
  all: { name: 'All', tier: 3, hint: 'All: everything on the page, from MO basics to consultant pearls.' },
};
const controls = $('#sp-controls');
const levelBtns = controls ? $$('.sp-level-btn', controls) : [];
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage may be blocked */ } },
};
const level = () => (LEVELS[document.body.dataset.level] ? document.body.dataset.level : 'all');
const tierMax = () => LEVELS[level()].tier;

function paintControls() {
  const lv = level();
  levelBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === lv)));
  const hint = $('#sp-level-hint');
  if (hint) hint.textContent = LEVELS[lv].hint;
}

/** Text that says where a pearl comes from: the open panel or tab, and the nearest heading above it. */
function contextFor(node, section) {
  const parts = [];
  const panel = node.closest('[role="tabpanel"],[data-panel-title]');
  if (panel && section.contains(panel)) {
    const lab = panel.dataset.panelTitle || (panel.getAttribute('aria-labelledby') && document.getElementById(panel.getAttribute('aria-labelledby'))?.textContent)
      || panel.getAttribute('aria-label');
    if (lab) parts.push(lab.trim());
  }
  for (let n = node; n && n !== section; n = n.parentElement) {
    let p = n.previousElementSibling;
    while (p && !p.matches('h3,h4,.sp-h4')) p = p.previousElementSibling;
    if (p) { parts.push(p.textContent.trim()); break; }
  }
  return [...new Set(parts)].filter(Boolean).join(' · ');
}

/** Build (or rebuild) the Advanced digest: every tier-3 block in a section, copied into one list. */
function buildDigests() {
  $$('main .sp-section').forEach((sec) => {
    if (sec.id === 'references' || sec.id === 'quiz') return;
    sec.querySelector(':scope > .sp-adv-digest')?.remove();
    const items = $$('[data-tier="3"]', sec).filter((n) => !n.parentElement.closest('[data-tier="3"]'));
    const box = el('div', { class: 'sp-adv-digest' });
    if (!items.length) {
      box.append(el('p', { class: 'sp-adv-empty', text: 'No Advanced material in this section. Choose All or Resident to read it.' }));
    } else {
      items.forEach((n) => {
        const copy = n.cloneNode(true);
        copy.removeAttribute('data-tier');
        [copy, ...copy.querySelectorAll('[id]')].forEach((x) => x.removeAttribute('id'));
        copy.querySelectorAll('[aria-controls],[aria-labelledby],[aria-describedby]').forEach((x) => {
          x.removeAttribute('aria-controls'); x.removeAttribute('aria-labelledby'); x.removeAttribute('aria-describedby');
        });
        copy.querySelectorAll('[hidden]').forEach((x) => x.removeAttribute('hidden'));
        const ctx = contextFor(n, sec);
        box.append(el('div', { class: 'sp-adv-item' }, ...(ctx ? [el('p', { class: 'sp-adv-from', text: ctx })] : []), copy));
      });
    }
    sec.append(box);
  });
}

/** Keep the heading the reader is looking at where it was while content above it appears or disappears. */
function withScrollAnchor(change) {
  const line = window.innerHeight * 0.3;
  const heads = $$('main h2, main h3').filter((h) => h.getClientRects().length);
  let anchor = null;
  for (const h of heads) if (h.getBoundingClientRect().top <= line) anchor = h;
  anchor = anchor || heads.find((h) => h.getBoundingClientRect().top > 0) || null;
  const before = anchor ? anchor.getBoundingClientRect().top : 0;
  change();
  if (anchor && anchor.getClientRects().length) {
    const delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
  } else {
    const sec = anchor?.closest('.sp-section');
    if (sec) window.scrollTo({ top: window.scrollY + sec.getBoundingClientRect().top - line, behavior: 'instant' });
  }
  computeActive();
}

function applyFilters({ lv = level() } = {}, { save = true, say = false, keepView = true } = {}) {
  const change = () => {
    if (lv === 'adv' && document.body.dataset.spReady) buildDigests();
    document.body.dataset.level = lv;
    document.body.dataset.tierMax = String(LEVELS[lv].tier);
    paintControls();
  };
  if (keepView && document.body.dataset.spReady) withScrollAnchor(change); else change();
  if (save) store.set('spinal-level', lv);
  if (say) announce(`Level ${LEVELS[lv].name}. ${LEVELS[lv].hint}`);
}

{
  const saved = store.get('spinal-level');
  const legacy = { 1: '1', 2: '2', 3: 'all' }[store.get('spinal-tier')];
  const lv = LEVELS[saved] ? saved : (legacy || 'all');
  document.body.dataset.level = lv;
  document.body.dataset.tierMax = String(LEVELS[lv].tier);
  paintControls();
  if (controls) controls.hidden = false;
  levelBtns.forEach((b) => b.addEventListener('click', () => applyFilters({ lv: b.dataset.level }, { say: true })));
}

/** A deep link to something the current filters hide: relax the filters just enough to show it. */
function relaxFor(target) {
  if (!target) return false;
  let need = 1;
  for (let p = target; p; p = p.parentElement) if (p.dataset?.tier) need = Math.max(need, Number(p.dataset.tier) || 1);
  let lv = level();
  if (lv === 'adv') { if (!target.closest('.sp-adv-digest,#quiz,#references') && !target.matches('.sp-section,h2,.sp-kicker')) lv = 'all'; }
  else if (need > tierMax()) lv = need === 2 ? '2' : 'all';
  if (lv === level()) return false;
  applyFilters({ lv }, { keepView: false });
  announce('Level changed to show the linked item.');
  return true;
}

// ---------------------------------------------------------------- deep links
const mods = ['anatomy', 'technique', 'spines', 'ultrasound', 'troubleshooting', 'complications', 'populations', 'quiz'];
const revealers = new Map(); // prefix -> reveal(hashId)

function isShown(node) { return !!node && node.getClientRects().length > 0 && !node.closest('[hidden]'); }

function openAncestors(node) {
  for (let p = node.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true;
}

async function goToHash(hash, { initial = false } = {}) {
  const id = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (!id) return;
  let target = document.getElementById(id);
  relaxFor(target);
  if (!isShown(target)) {
    const prefix = id.split('-')[0];
    const reveal = revealers.get(prefix);
    if (reveal) {
      try { await reveal(id); } catch (err) { console.error('[spinal] reveal failed', err); }
    }
    target = document.getElementById(id);
    relaxFor(target);
    if (target && !isShown(target)) openAncestors(target);
  }
  if (!target || !isShown(target)) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Wait a frame so layout from reveal() is settled.
  requestAnimationFrame(() => {
    target.scrollIntoView({ block: 'start', behavior: initial || reduce ? 'instant' : 'smooth' });
    if (!initial) {
      if (!target.matches('a,button,input,select,textarea,summary,[tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
    settleOn(target);
  });
}

// Figures above the target can finish laying out after the jump and push it down.
// Re-align a few times over the next ~1.5 s, unless the reader starts scrolling.
function settleOn(target) {
  let cancelled = false;
  const stop = () => { cancelled = true; };
  const evs = ['wheel', 'touchstart', 'keydown', 'mousedown'];
  evs.forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  [450, 900, 1500].forEach((ms, i, all) => setTimeout(() => {
    if (!cancelled && Math.abs(target.getBoundingClientRect().top - pad) > 24) {
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    if (i === all.length - 1) evs.forEach((e) => window.removeEventListener(e, stop));
  }, ms));
}
window.addEventListener('hashchange', () => goToHash(location.hash));

// ---------------------------------------------------------------- mount sections
function mountError(host, name, err) {
  console.error(`[spinal] ${name} failed to load`, err);
  if (!host) return;
  host.textContent = '';
  host.append(el('p', { class: 'sp-mount-error', text: 'This part didn\'t load. Reload the page.' }));
}

async function boot() {
  const loaded = await Promise.allSettled(mods.map((m) => import(`./sections/${m}.js?v=1`)));
  // Register every module's refs before any mount, so cross-section citations resolve.
  loaded.forEach((r, i) => {
    if (r.status !== 'fulfilled') return;
    try { registerRefs(r.value.refs); } catch (err) { console.error(`[spinal] refs for ${mods[i]} rejected`, err); }
  });
  const mounts = loaded.map(async (r, i) => {
    const name = mods[i];
    const id = r.status === 'fulfilled' && r.value.meta?.id ? r.value.meta.id : name;
    const host = document.getElementById(`mount-${id}`) || document.getElementById(`mount-${name}`);
    if (r.status !== 'fulfilled') { mountError(host, name, r.reason); return; }
    const mod = r.value;
    try {
      if (typeof mod.mount !== 'function') throw new Error('module has no mount()');
      const api = await mod.mount(host);
      const prefix = mod.meta?.prefix;
      if (prefix && api && typeof api.reveal === 'function') revealers.set(prefix, api.reveal.bind(api));
      if (prefix && typeof mod.reveal === 'function' && !revealers.has(prefix)) revealers.set(prefix, mod.reveal);
    } catch (err) { mountError(host, name, err); }
  });
  await Promise.allSettled(mounts);
  try { finalise(); } catch (err) { console.error('[spinal] references failed', err); }
  paintOverflow();
  computeActive();
  if (level() === 'adv') buildDigests();
  document.body.dataset.spReady = 'true';
  document.dispatchEvent(new CustomEvent('sp-ready'));
  if (location.hash) await goToHash(location.hash, { initial: true });
}

boot();
