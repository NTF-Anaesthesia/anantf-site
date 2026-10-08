// spinal/ page controller: theme, share, scroll-spy, section mounts, references, deep links. Owned by B1.
import { $, $$, el, isDark } from './ui.js?v=1';
import { registerRefs, finalise } from './refs.js?v=1';

const root = document.documentElement;

// ---------------------------------------------------------------- theme (Auto → Light → Dark)
const THEMES = ['auto', 'light', 'dark'];
const themeBtn = $('#sp-theme');
const mqDark = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = () => root.dataset.theme || 'auto';

function emitTheme() {
  document.dispatchEvent(new CustomEvent('sp-themechange', { detail: { dark: isDark() } }));
}
function paintThemeBtn() {
  if (!themeBtn) return;
  const t = currentTheme();
  const label = t[0].toUpperCase() + t.slice(1);
  themeBtn.querySelector('.sp-theme-label').textContent = label;
  themeBtn.dataset.themeState = t;
  themeBtn.setAttribute('aria-label', `Colour theme: ${t === 'auto' ? 'Auto, follows your device' : label}. Activate to change.`);
}
themeBtn?.addEventListener('click', () => {
  const next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
  if (next === 'auto') delete root.dataset.theme;
  else root.dataset.theme = next;
  try {
    if (next === 'auto') localStorage.removeItem('spinal-theme');
    else localStorage.setItem('spinal-theme', next);
  } catch { /* storage may be blocked */ }
  paintThemeBtn();
  emitTheme();
});
const onScheme = () => emitTheme(); // modules re-check isDark(); harmless when a theme is pinned
if (mqDark.addEventListener) mqDark.addEventListener('change', onScheme);
else if (mqDark.addListener) mqDark.addListener(onScheme);
paintThemeBtn();

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

// ---------------------------------------------------------------- deep links
const mods = ['anatomy', 'technique', 'ultrasound', 'troubleshooting', 'complications', 'populations', 'quiz'];
const revealers = new Map(); // prefix -> reveal(hashId)

function isShown(node) { return !!node && node.getClientRects().length > 0 && !node.closest('[hidden]'); }

function openAncestors(node) {
  for (let p = node.parentElement; p; p = p.parentElement) if (p.tagName === 'DETAILS' && !p.open) p.open = true;
}

async function goToHash(hash, { initial = false } = {}) {
  const id = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (!id) return;
  let target = document.getElementById(id);
  if (!isShown(target)) {
    const prefix = id.split('-')[0];
    const reveal = revealers.get(prefix);
    if (reveal) {
      try { await reveal(id); } catch (err) { console.error('[spinal] reveal failed', err); }
    }
    target = document.getElementById(id);
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
  });
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
  document.body.dataset.spReady = 'true';
  document.dispatchEvent(new CustomEvent('sp-ready'));
  if (location.hash) await goToHash(location.hash, { initial: true });
}

boot();
