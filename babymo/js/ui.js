// Native-feeling building blocks for the Baby MO test: bottom sheets, toasts, segmented controls, steppers, the
// collapsing large title, haptics and the version line. Nothing here knows about tests or Firebase.
// It follows the qbank design spec (15 Oct 2026) so it can be swapped for the shared qbank/ui files once they exist.

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const nl = s => esc(s).replace(/\n/g, '<br>');
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 24px line icons (stroke = currentColor), drawn for this app; aria-hidden, so every button that uses one has a label
const svg = (d, cls = 'ic') => `<svg class="${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
export const icon = {
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  chevron: svg('<path d="M9 5l7 7-7 7"/>', 'ic chev'),
  forward: svg('<path d="M9 5l7 7-7 7"/>'),
  flag: svg('<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>'),
  tick: svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  cross: svg('<path d="M7 7l10 10M17 7 7 17"/>'),
  results: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  paper: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>'),
  settings: svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>'),
  grid: svg('<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>'),
};

// ---- haptics and announcements ----
export function haptic(ms = 10) { try { if (navigator.vibrate && /android/i.test(navigator.userAgent)) navigator.vibrate(ms); } catch { /* not allowed */ } }
export function announce(text) {
  const el = $('#announce'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30);
}

// ---- toast: one at a time, above the bottom chrome, 4 s, optional action (Undo, Restart) ----
let toastTimer = 0;
export function toast(msg, { action, ms = 4000 } = {}) {
  const t = $('#toast'); if (!t) return;
  clearTimeout(toastTimer);
  t.innerHTML = `<span class="toast-msg">${esc(msg)}</span>${action ? `<button type="button" class="toast-act">${esc(action.label)}</button>` : ''}`;
  t.classList.add('on');
  if (action) t.querySelector('.toast-act').addEventListener('click', () => { hideToast(); action.fn(); });
  toastTimer = setTimeout(hideToast, action ? Math.max(ms, 6000) : ms);
}
export function hideToast() { const t = $('#toast'); if (t) t.classList.remove('on'); }

// ---- bottom sheets ----
// A <dialog> with a grabber, a title row with Close, scrolling content and a sticky footer above the safe area.
// Opening pushes a history entry, so Android back and the iOS edge swipe close it; closing returns focus to the trigger.
let sheetSeq = 0;
const openSheets = [];
export const sheetOpen = () => openSheets.length > 0;
export function sheet({ title, body = '', footer = '', detent = 'medium', label, onClose, className = '' } = {}) {
  const id = 'sheet' + (++sheetSeq);
  const d = document.createElement('dialog');
  d.className = 'sheet ' + className; d.dataset.detent = detent; d.id = id;
  d.setAttribute('aria-labelledby', id + '-t');
  d.innerHTML = `<div class="sheet-grab" aria-hidden="true"><span></span></div>
    <div class="sheet-head"><h2 id="${id}-t" class="sheet-title" tabindex="-1">${esc(title)}</h2><button type="button" class="sheet-close" aria-label="Close${label ? ' ' + esc(label) : ''}">Close</button></div>
    <div class="sheet-body">${body}</div>${footer ? `<div class="sheet-foot">${footer}</div>` : ''}`;
  d._trigger = document.activeElement;
  d._onClose = onClose;
  d._done = new Promise(r => { d._resolve = r; });
  document.body.append(d);
  d.showModal();
  openSheets.push(d);
  history.pushState({ sheet: id }, '', location.href);
  d.querySelector('.sheet-close').addEventListener('click', () => closeSheet(d));
  d.addEventListener('cancel', ev => { ev.preventDefault(); closeSheet(d); });
  d.addEventListener('click', ev => { if (ev.target === d) closeSheet(d); });   // tap on the dimmed backdrop
  dragToClose(d);
  requestAnimationFrame(() => d.querySelector('.sheet-title').focus({ preventScroll: true }));
  return d;
}
// Close a sheet (and pop its history entry). Resolves when it is gone. value is passed to onClose.
export function closeSheet(d, value) {
  if (!d || !openSheets.includes(d)) return Promise.resolve();
  d._value = value;
  if (history.state?.sheet === d.id) history.back();   // popstate finishes it
  else finishSheet(d);
  return d._done;
}
function finishSheet(d, silent) {
  const i = openSheets.indexOf(d); if (i < 0) return;
  openSheets.splice(i, 1);
  const end = () => {
    if (d.open) d.close();
    d.remove();
    if (!silent && d._trigger && document.contains(d._trigger)) d._trigger.focus({ preventScroll: true });
    d._onClose?.(d._value);
    d._resolve(d._value);
  };
  if (reducedMotion() || silent) return end();
  d.classList.add('closing');
  setTimeout(end, 180);
}
// Route changes (a timer running out, a sign-out) close every sheet without touching history.
export function closeAllSheets() { for (const d of [...openSheets]) finishSheet(d, true); }
window.addEventListener('popstate', () => {
  const want = history.state?.sheet;
  for (const d of [...openSheets].reverse()) { if (d.id === want) break; finishSheet(d); }
});
function dragToClose(d) {
  const handle = [d.querySelector('.sheet-grab'), d.querySelector('.sheet-head')];
  let y0 = null, dy = 0;
  const move = ev => { if (y0 == null) return; dy = ev.clientY - y0; d.style.transform = dy > 0 ? `translateY(${dy}px)` : ''; };
  const up = () => {
    if (y0 == null) return; y0 = null; d.style.transform = '';
    if (dy > 90) closeSheet(d); else if (dy < -60) d.dataset.detent = 'large';
    dy = 0;
  };
  for (const h of handle) h.addEventListener('pointerdown', ev => { if (ev.target.closest('button')) return; y0 = ev.clientY; dy = 0; h.setPointerCapture?.(ev.pointerId); });
  for (const h of handle) { h.addEventListener('pointermove', move); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up); }
}
// The keyboard covers the bottom of the screen on phones: keep sheet footers above it.
if (window.visualViewport) {
  const kb = () => document.documentElement.style.setProperty('--kb', Math.max(0, window.innerHeight - visualViewport.height - visualViewport.offsetTop) + 'px');
  visualViewport.addEventListener('resize', kb); visualViewport.addEventListener('scroll', kb);
}

// A yes/no question as a sheet. Resolves true for the main button.
export function confirmSheet({ title, body = '', ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise(res => {
    let said = false;
    const d = sheet({ title, body: `<div class="sheet-text">${body}</div>`, footer: `<div class="btn-row"><button type="button" class="btn secondary" data-no>${esc(cancel)}</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(ok)}</button></div>`, onClose: () => res(said) });
    d.querySelector('[data-yes]').addEventListener('click', () => { said = true; closeSheet(d, true); });
    d.querySelector('[data-no]').addEventListener('click', () => closeSheet(d, false));
  });
}

// ---- controls ----
// Segmented control: 2 to 4 equal square segments on one row, radio buttons underneath (keyboard and screen readers).
export const seg = (name, label, opts, cur, { hideLabel = false } = {}) => `<fieldset class="seg${hideLabel ? ' seg-bare' : ''}"><legend${hideLabel ? ' class="vh"' : ''}>${esc(label)}</legend><div class="seg-row" role="radiogroup" aria-label="${esc(label)}">${opts.map(([v, l]) => `<label class="seg-opt"><input type="radio" name="${esc(name)}" value="${esc(v)}"${String(v) === String(cur) ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div></fieldset>`;
export const segVal = (name, root = document) => root.querySelector(`input[name="${name}"]:checked`)?.value;

// Stepper: − value + with 44px buttons. values: the allowed steps (snaps to them), or min/max/step.
export const stepper = (id, label, value, { hint = '' } = {}) => `<div class="stepper-row"><span class="stepper-label" id="${id}-l">${esc(label)}${hint ? `<span class="row-sub">${esc(hint)}</span>` : ''}</span>
  <span class="stepper" role="group" aria-labelledby="${id}-l"><button type="button" class="step-btn" data-step="-1" aria-label="Fewer: ${esc(label)}">−</button><output id="${id}" class="step-val" aria-live="polite">${esc(value)}</output><button type="button" class="step-btn" data-step="1" aria-label="More: ${esc(label)}">+</button></span></div>`;
export function wireStepper(id, { min = 1, max = 100, step = 1, values, onChange } = {}) {
  const out = document.getElementById(id); if (!out) return;
  const group = out.parentElement;
  const sync = () => {
    const v = Number(out.textContent);
    group.querySelector('[data-step="-1"]').setAttribute('aria-disabled', String(values ? v <= values[0] : v <= min));
    group.querySelector('[data-step="1"]').setAttribute('aria-disabled', String(values ? v >= values[values.length - 1] : v >= max));
  };
  group.addEventListener('click', ev => {
    const b = ev.target.closest('[data-step]'); if (!b) return;
    const dir = +b.dataset.step, v = Number(out.textContent);
    let n;
    if (values) n = dir > 0 ? values.find(x => x > v) ?? v : [...values].reverse().find(x => x < v) ?? v;
    else n = Math.min(max, Math.max(min, v + dir * step));
    if (n === v) return;
    out.textContent = String(n); sync(); onChange?.(n);
  });
  sync();
  return { get: () => Number(out.textContent), set: v => { out.textContent = String(v); sync(); } };
}

// ---- large title that collapses into the bar ----
// The bar's inline title fades in once the big title has scrolled under it.
let titleObserver = null;
export function watchLargeTitle(scroller) {
  titleObserver?.disconnect();
  const big = scroller.querySelector('.large-title'), bar = scroller.querySelector('.bar');
  if (!big || !bar || !('IntersectionObserver' in window)) { bar?.classList.add('collapsed'); return; }
  titleObserver = new IntersectionObserver(([e]) => bar.classList.toggle('collapsed', !e.isIntersecting), { root: scroller, rootMargin: '-44px 0px 0px 0px', threshold: 0 });
  titleObserver.observe(big);
}

// ---- skeleton rows (no spinners) ----
export const skeleton = (n = 5) => `<div class="skeleton" aria-hidden="true">${'<div class="sk-row"><i></i><i></i></div>'.repeat(n)}</div><p class="vh" role="status">Loading</p>`;

// ---- score ring: 120px, draws once ----
export function ring(pct, label = `${Math.round(pct)}%`, cls = '') {
  const r = 52, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return `<div class="ring ${cls}" role="img" aria-label="Score ${esc(label)}"><svg viewBox="0 0 120 120" width="120" height="120" aria-hidden="true"><circle cx="60" cy="60" r="${r}" class="ring-bg"/><circle cx="60" cy="60" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" style="--c:${c.toFixed(1)}"/></svg><span class="ring-num" aria-hidden="true">${esc(label)}</span></div>`;
}

// ---- app version line and "Get the latest version" (AGENTS.md: every installable app) ----
// Reads the version from this app's cache name (<prefix><date>-<hash>). The button checks for a signal by fetching the
// worker script, then removes only this app's worker and caches and reloads; saved answers and sign-in are untouched.
export const versionLine = () => '<div class="appver"><p id="appver" hidden></p><p><button type="button" class="link" id="getlatest">Not updating? Get the latest version</button></p><p id="appver-msg" role="status"></p></div>';
export async function paintVersion(prefix) {
  const el = $('#appver'), btn = $('#getlatest'); if (!el || !btn) return;
  btn.addEventListener('click', () => getLatest(prefix));
  try {
    const k = (await caches.keys()).find(k => k.startsWith(prefix)); if (!k) return;
    const v = k.slice(prefix.length), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    el.textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
  } catch { /* no caches (old browser, blocked): no line */ }
}
async function getLatest(prefix) {
  const btn = $('#getlatest'), msg = $('#appver-msg');
  btn.disabled = true; msg.textContent = '';
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const url = new URL(reg?.active?.scriptURL || new URL('sw.js', location.href));
    url.searchParams.set('fresh', Date.now());
    const res = await fetch(url, { cache: 'no-store' }); if (!res.ok) throw new Error(res.status);
    if (reg) await reg.unregister();
    for (const k of await caches.keys()) if (k.startsWith(prefix)) await caches.delete(k);
    location.reload();
  } catch {
    msg.textContent = 'No signal: nothing was changed. Try again with signal.'; btn.disabled = false;
  }
}
