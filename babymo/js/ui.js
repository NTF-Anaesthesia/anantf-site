// Behaviour for the shared app kit (../assets/app/app.css, DESIGN-APP.md): bottom sheets, toasts, segmented controls,
// steppers, the collapsing large title, haptics and the version line. The kit is CSS only; this is the small amount
// of JavaScript the Baby MO test needs to drive it. Nothing here knows about tests or Firebase.

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const nl = s => esc(s).replace(/\n/g, '<br>');
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// 24px line icons (stroke = currentColor). aria-hidden: every button that uses one has a label.
const svg = d => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
export const icon = {
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  forward: svg('<path d="M9 5l7 7-7 7"/>'),
  flag: svg('<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>'),
  tick: svg('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  cross: svg('<path d="M7 7l10 10M17 7 7 17"/>'),
  results: svg('<path d="M5 20v-8M12 20V5M19 20v-5"/>'),
  paper: svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>'),
  people: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .7 3.2 2.4 3.5 5.2"/>'),
  settings: svg('<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>'),
  grid: svg('<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>'),
  person: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5"/>'),
  download: svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  key: svg('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>'),
  play: svg('<path d="M8 5v14l11-7z"/>'),
};
export const chevron = '<span class="app-row-chevron" aria-hidden="true"></span>';

// iOS shows :active press states only when the page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });

// ---- haptics and announcements ----
export function haptic(ms = 10) { try { if (navigator.vibrate && /android/i.test(navigator.userAgent)) navigator.vibrate(ms); } catch { /* not allowed */ } }
export function announce(text) {
  const el = $('#announce'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30);
}

// ---- toast: one at a time, above the tab bar or toolbar, 4 s, optional action (Undo, Restart) ----
let toastTimer = 0;
export function toast(msg, { action, ms = 4000 } = {}) {
  const t = $('#toast'); if (!t) return;
  clearTimeout(toastTimer);
  t.innerHTML = `<span class="app-toast-text">${esc(msg)}</span>${action ? `<button type="button" class="app-toast-action">${esc(action.label)}</button>` : ''}`;
  t.classList.add('is-visible');
  if (action) t.querySelector('.app-toast-action').addEventListener('click', () => { hideToast(); action.fn(); });
  toastTimer = setTimeout(hideToast, action ? Math.max(ms, 6000) : ms);
}
export function hideToast() { $('#toast')?.classList.remove('is-visible'); }

// ---- bottom sheets (dialog.app-sheet) ----
// Opening pushes a history entry, so Android back and the iOS edge swipe close it; closing returns focus to the opener.
// detent: '' (fits its content), 'medium' (55dvh) or 'large' (92dvh).
let sheetSeq = 0;
const openSheets = [];
export const sheetOpen = () => openSheets.length > 0;
export function sheet({ title, body = '', footer = '', detent = '', onClose } = {}) {
  const id = 'sheet' + (++sheetSeq);
  const d = document.createElement('dialog');
  d.className = 'app-sheet' + (detent ? ' app-sheet--' + detent : ''); d.id = id;
  d.setAttribute('aria-labelledby', id + '-t');
  d.innerHTML = `<span class="app-sheet-grabber" aria-hidden="true"></span>
    <div class="app-sheet-head"><span></span><h2 class="app-sheet-title" id="${id}-t" tabindex="-1">${esc(title)}</h2><button type="button" class="app-btn app-btn--plain app-btn--compact" data-sheet-close>Close</button></div>
    <div class="app-sheet-body">${body}</div>${footer ? `<div class="app-sheet-foot">${footer}</div>` : ''}`;
  d._trigger = document.activeElement;
  d._onClose = onClose;
  d._done = new Promise(r => { d._resolve = r; });
  document.body.append(d);
  d.showModal();
  openSheets.push(d);
  history.pushState({ sheet: id }, '', location.href);
  d.querySelector('[data-sheet-close]').addEventListener('click', () => closeSheet(d));
  d.addEventListener('cancel', ev => { ev.preventDefault(); closeSheet(d); });
  d.addEventListener('click', ev => { if (ev.target === d) closeSheet(d); });   // a tap on the dimmed backdrop
  dragToClose(d);
  requestAnimationFrame(() => d.querySelector('.app-sheet-title').focus({ preventScroll: true }));
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
  d.style.transform = '';
  if (d.open) d.close();                    // the kit animates the close (transition on display/overlay)
  setTimeout(() => d.remove(), silent || reducedMotion() ? 0 : 450);
  if (!silent && d._trigger && document.contains(d._trigger)) d._trigger.focus({ preventScroll: true });
  d._onClose?.(d._value);
  d._resolve(d._value);
}
// Route changes (a timer running out, a sign-out) close every sheet without touching history.
export function closeAllSheets() { for (const d of [...openSheets]) finishSheet(d, true); }
window.addEventListener('popstate', () => {
  const want = history.state?.sheet;
  for (const d of [...openSheets].reverse()) { if (d.id === want) break; finishSheet(d); }
});
// Drag the head or grabber down past 120px (or flick) to close.
function dragToClose(d) {
  let y0 = null, dy = 0, t0 = 0;
  const down = ev => { if (ev.target.closest('button')) return; y0 = ev.clientY; dy = 0; t0 = ev.timeStamp; d.classList.add('is-dragging'); };
  const move = ev => { if (y0 == null) return; dy = Math.max(0, ev.clientY - y0); d.style.transform = `translateY(${dy}px)`; };
  const up = ev => {
    if (y0 == null) return;
    const v = dy / Math.max(1, ev.timeStamp - t0); y0 = null; d.classList.remove('is-dragging');
    if (dy > 120 || v > 0.6) closeSheet(d); else d.style.transform = '';
  };
  for (const h of [d.querySelector('.app-sheet-head'), d.querySelector('.app-sheet-grabber')]) h.addEventListener('pointerdown', down);
  d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
}

// A yes/no question as a sheet. Resolves true for the main button.
export function confirmSheet({ title, body = '', ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise(res => {
    let said = false;
    const d = sheet({ title, body: `<div class="app-text">${body}</div>`, footer: `<div class="app-btn-row" style="margin:0"><button type="button" class="app-btn app-btn--outline" data-no>${esc(cancel)}</button><button type="button" class="app-btn ${danger ? 'app-btn--danger' : 'app-btn--primary'}" data-yes>${esc(ok)}</button></div>`, onClose: () => res(said) });
    d.querySelector('[data-yes]').addEventListener('click', () => { said = true; closeSheet(d, true); });
    d.querySelector('[data-no]').addEventListener('click', () => closeSheet(d, false));
  });
}

// ---- controls ----
// Segmented control: 2 to 4 segments on one row, radio buttons underneath (arrow keys and screen readers for free).
export const seg = (name, label, opts, cur, { attrs = '' } = {}) => `<fieldset class="app-segmented"${attrs}><legend>${esc(label)}</legend>${opts.map(([v, l]) => `<label class="app-seg"><input type="radio" name="${esc(name)}" value="${esc(v)}"${String(v) === String(cur) ? ' checked' : ''}><span>${esc(l)}</span></label>`).join('')}</fieldset>`;
export const segVal = (name, root = document) => root.querySelector(`input[name="${name}"]:checked`)?.value;

// Stepper: − value + (44px buttons) in a grouped row.
export const stepper = (id, label, value, { sub = '' } = {}) => `<div class="app-row bm-stepper-row"><span class="app-row-body"><span class="app-row-title" id="${id}-l">${esc(label)}</span>${sub ? `<span class="app-row-sub">${sub}</span>` : ''}</span>
  <span class="bm-stepper" role="group" aria-labelledby="${id}-l"><button type="button" class="bm-step" data-step="-1" aria-label="Less: ${esc(label)}">−</button><output id="${id}" class="bm-step-val app-mono" aria-live="polite">${esc(value)}</output><button type="button" class="bm-step" data-step="1" aria-label="More: ${esc(label)}">+</button></span></div>`;
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
    const n = values ? (dir > 0 ? values.find(x => x > v) ?? v : [...values].reverse().find(x => x < v) ?? v) : Math.min(max, Math.max(min, v + dir * step));
    if (n === v) return;
    out.textContent = String(n); sync(); onChange?.(n);
  });
  sync();
  return { get: () => Number(out.textContent), set: v => { out.textContent = String(v); sync(); } };
}

// ---- large title that collapses into the bar (the bar gains its blurred surface and inline title) ----
let titleObserver = null;
export function watchLargeTitle() {
  titleObserver?.disconnect();
  const big = $('.app-large-title'), bar = $('.app-bar');
  if (!bar) return;
  if (!big || !('IntersectionObserver' in window)) { if (!big) bar.classList.add('is-collapsed'); return; }
  titleObserver = new IntersectionObserver(([e]) => bar.classList.toggle('is-collapsed', !e.isIntersecting), { rootMargin: `-${bar.offsetHeight}px 0px 0px 0px`, threshold: 0 });
  titleObserver.observe(big);
}

// ---- skeleton rows (no spinners) ----
export const skeleton = (n = 4) => `<ul class="app-list" aria-busy="true" aria-label="Loading">${'<li><div class="app-row"><span class="app-row-body"><span class="app-skeleton app-skeleton--line"></span><span class="app-skeleton app-skeleton--short"></span></span></div></li>'.repeat(n)}</ul>`;

// ---- score ring: draws once ----
export function ring(pct, label, sub, ok) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="app-ring${ok ? ' app-ring--ok' : ''}" style="--app-ring:${v}" role="img" aria-label="Score ${esc(label)}${sub ? ', ' + esc(sub) : ''}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="app-ring-track" cx="50" cy="50" r="44"/><circle class="app-ring-value" cx="50" cy="50" r="44" pathLength="100"/></svg><span class="app-ring-label" aria-hidden="true"><strong>${esc(label)}</strong>${sub ? `<span>${esc(sub)}</span>` : ''}</span></div>`;
}

// ---- app version and "Get the latest version" (AGENTS.md: every installable app), as rows ----
// Reads the version from this app's cache name (<prefix><date>-<hash>). The button checks for a signal by fetching the
// worker script, then removes only this app's worker and caches and reloads; saved answers and sign-in are untouched.
export const versionLine = () => `<section class="app-section bm-appver" aria-label="App version"><ul class="app-list">
  <li id="appver" hidden><div class="app-row"><span class="app-row-body"><span class="app-row-sub" id="appver-text"></span></span></div></li>
  <li><button type="button" class="app-row app-row--action" id="getlatest"><span class="app-row-body"><span class="app-row-title">Not updating? Get the latest version</span></span></button></li></ul>
  <p class="app-section-footer" id="appver-msg" role="status"></p></section>`;
export async function paintVersion(prefix) {
  const el = $('#appver'), btn = $('#getlatest'); if (!el || !btn) return;
  btn.addEventListener('click', () => getLatest(prefix));
  try {
    const k = (await caches.keys()).find(k => k.startsWith(prefix)); if (!k) return;
    const v = k.slice(prefix.length), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    $('#appver-text').textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
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
