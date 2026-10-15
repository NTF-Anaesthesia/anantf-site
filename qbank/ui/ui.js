// Behaviour for the shared phone-app kit (../../assets/app/app.css, DESIGN-APP.md) in the qbank app: a hash router with
// history that Android back and the iOS edge swipe understand, bottom sheets (dialog.app-sheet), the toast, segmented
// controls, chips, steppers, the collapsing large title, screen transitions, and the installable-app update rules. The
// kit is CSS only; this is the JavaScript that drives its markup. No framework; plain ES module.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const haptic = () => { try { if (/android/i.test(navigator.userAgent)) navigator.vibrate?.(10); } catch { /* not allowed */ } };
export const wait = ms => new Promise(r => setTimeout(r, ms));

// iOS shows :active press states only when the page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });

// ---------- line icons (24px, stroke = currentColor; the kit sizes them in tabs, rows, bars and buttons) ----------
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${d}</svg>`;
export const icon = {
  practise: () => svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>'),
  browse: () => svg('<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>'),
  papers: () => svg('<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>'),
  progress: () => svg('<path d="M5 20v-8M12 20V5M19 20v-5"/>'),
  close: () => svg('<path d="M6 6l12 12M18 6 6 18"/>', ' stroke-width="2"'),
  back: () => svg('<path d="M15 5l-7 7 7 7"/>'),
  forward: () => svg('<path d="M9 5l7 7-7 7"/>'),
  flag: () => svg('<path d="M6 21V4M6 4h11l-2.5 4L17 12H6"/>'),
  flagOn: () => svg('<path d="M6 21V4"/><path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor"/>'),
  check: () => svg('<path d="M5 12.5l4.5 4.5L19 7"/>', ' stroke-width="2.4"'),
  cross: () => svg('<path d="M7 7l10 10M17 7 7 17"/>', ' stroke-width="2.4"'),
  dash: () => svg('<path d="M7 12h10"/>', ' stroke-width="2.4"'),
  search: () => svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>'),
  clock: () => svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  sliders: () => svg('<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>'),
  grid: () => svg('<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>'),
  edit: () => svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  reset: () => svg('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/>'),
  download: () => svg('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  play: () => svg('<path d="M8 5v14l11-7z"/>'),
};
export const chevron = '<span class="app-row-chevron" aria-hidden="true"></span>';
export const tile = (svgHtml, cls = '') => `<span class="app-row-icon ${cls}" aria-hidden="true">${svgHtml}</span>`;

// ---------- storage (every read and write may fail: private mode, full storage) ----------
export function store(prefix) {
  return {
    get(k, fallback) { try { const v = localStorage.getItem(prefix + k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(prefix + k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(prefix + k); } catch { /* ignore */ } },
    keys() { try { return Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length)); } catch { return []; } },
  };
}

// ---------- announcements and the toast (one at a time, above the tab bar or toolbar) ----------
export function announce(text) {
  const el = $('#live'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30);
}
let toastTimer = 0;
export function toast(msg, { action, onAction, ms = 4000 } = {}) {
  const t = $('#toast'); if (!t) return;
  clearTimeout(toastTimer);
  t.innerHTML = `<span class="app-toast-text">${esc(msg)}</span>${action ? `<button type="button" class="app-toast-action">${esc(action)}</button>` : ''}`;
  t.classList.add('is-visible');
  if (action) t.querySelector('.app-toast-action').addEventListener('click', () => { hideToast(); onAction?.(); });
  toastTimer = setTimeout(hideToast, ms);
}
export function hideToast() { clearTimeout(toastTimer); const t = $('#toast'); if (!t) return; t.classList.remove('is-visible'); t.querySelector('.app-toast-action')?.remove(); }

// ---------- screen transitions: the kit's View Transitions (html[data-nav="push" | "pop" | "tab"]) ----------
// kind: 'push' (slide in from the right), 'pop' (back), 'fade' (tab switch, paging in place), 'none'.
export function transition(kind, update) {
  if (!kind || kind === 'none' || !document.startViewTransition || reduced() || document.hidden) { update(); return; }
  const root = document.documentElement;
  root.dataset.nav = kind === 'fade' ? 'tab' : kind;
  try {
    const t = document.startViewTransition(update);
    t.finished.finally(() => { if (root.dataset.nav) delete root.dataset.nav; });
  } catch { delete root.dataset.nav; update(); }
}

// ---------- router: #/path?query. Each push gets an index in history.state, so we know back from forward. ----------
let lastIdx = 0, replacing = false;
export const routeOf = () => { const h = location.hash.replace(/^#/, '') || '/'; const [path, query = ''] = h.split('?'); return { path, query, params: new URLSearchParams(query) }; };
export function startRouter(render) {
  if (typeof history.state?.idx !== 'number') history.replaceState({ idx: 0 }, '');
  lastIdx = history.state.idx;
  window.addEventListener('hashchange', () => {
    let dir;
    const st = history.state;
    if (typeof st?.idx === 'number' && !replacing) { dir = st.idx < lastIdx ? 'pop' : st.idx > lastIdx ? 'push' : 'replace'; lastIdx = st.idx; }
    else { const idx = replacing ? lastIdx : lastIdx + 1; dir = replacing ? 'replace' : 'push'; history.replaceState({ idx }, ''); lastIdx = idx; }
    replacing = false;
    closeAllSheets();
    render(routeOf(), dir);
  });
  render(routeOf(), 'none');
}
// go('#/q/abc') pushes; go(hash, { replace: true }) swaps the current entry (tab switches, paging, leaving a session).
// From inside an open sheet it always replaces the sheet's own history entry, so back never reopens the sheet.
export function go(hash, { replace = false } = {}) {
  if (hash === location.hash) return;
  if (stack.length && history.state?.sheet) { replace = true; closeAllSheets(); }
  if (replace) { replacing = true; location.replace(hash); } else location.hash = hash;
}
// A back button: step back if the previous entry is ours, otherwise go to the parent screen.
export function back(parent) { if (history.state?.idx > 0) history.back(); else go(parent, { replace: true }); }
export const canGoBack = () => history.state?.idx > 0;

// ---------- bottom sheets: dialog.app-sheet, grabber, drag down to close, back closes, focus returns to the trigger ----------
const stack = [];
export const sheetOpen = () => stack.length > 0;
window.addEventListener('popstate', () => {
  const depth = history.state?.sheet || 0;
  for (const s of stack.slice().reverse()) if (s.depth > depth) s.remove();
});
export function closeAllSheets() { for (const s of stack.slice().reverse()) s.remove(); }

// openSheet({ title, titleHtml, size: 'medium'|'large'|'auto', body, foot, onClose, focus, cls }) -> { el, body, foot, close() }
export function openSheet({ title, titleHtml = '', size = 'auto', body = '', foot = '', onClose, focus = 'heading', cls = '' }) {
  const trigger = document.activeElement;
  const dlg = document.createElement('dialog');
  const hid = 'sh' + Math.random().toString(36).slice(2, 8);
  dlg.className = `app-sheet${size === 'medium' || size === 'large' ? ' app-sheet--' + size : ''} ${cls}`.trim();
  dlg.setAttribute('aria-labelledby', hid);
  dlg.innerHTML = `<div class="qb-sheet-grip"><span class="app-sheet-grabber" aria-hidden="true"></span><div class="app-sheet-head"><span></span><h2 class="app-sheet-title" id="${hid}" tabindex="-1">${titleHtml || esc(title)}</h2><button type="button" class="app-btn app-btn--plain app-btn--compact" data-sheet-close>Close</button></div></div>
    <div class="app-sheet-body">${body}</div>${foot ? `<div class="app-sheet-foot">${foot}</div>` : ''}`;
  document.body.append(dlg);
  const entry = {
    el: dlg, body: dlg.querySelector('.app-sheet-body'), foot: dlg.querySelector('.app-sheet-foot'), depth: stack.length + 1, closed: false, waiters: [],
    close() {
      if (entry.closed) return Promise.resolve();
      if (entry.closing) return entry.closing;   // a second tap while closing must not step back in history again
      const p = entry.closing = new Promise(r => entry.waiters.push(r));
      if (history.state?.sheet === entry.depth) { history.back(); setTimeout(() => entry.remove(), 600); }   // popstate removes it; the timer is a safety net
      else entry.remove();
      return p;
    },
    remove() {
      if (entry.closed) return;
      entry.closed = true;
      stack.splice(stack.indexOf(entry), 1);
      try { dlg.close(); } catch { /* already */ }   // the kit animates the close (transitions on display and overlay)
      setTimeout(() => dlg.remove(), reduced() ? 0 : 450);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
      onClose?.();
      entry.waiters.forEach(r => r());
    },
  };
  stack.push(entry);
  history.pushState({ ...(history.state || {}), sheet: entry.depth }, '');
  dlg.showModal();
  dlg.addEventListener('cancel', e => { e.preventDefault(); entry.close(); });
  dlg.querySelector('[data-sheet-close]').addEventListener('click', () => entry.close());
  dlg.addEventListener('click', e => {      // a tap on the dimmed backdrop (outside the sheet) closes it
    if (e.target !== dlg) return;
    const r = dlg.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom || e.clientX < r.left || e.clientX > r.right) entry.close();
  });
  dragToClose(dlg, entry);
  if (focus === 'heading') dlg.querySelector('h2').focus({ preventScroll: true });
  else if (focus) dlg.querySelector(focus)?.focus({ preventScroll: true });
  return entry;
}
// Drag the grabber or the head down past 110px (or flick) to close.
function dragToClose(dlg, entry) {
  const grip = dlg.querySelector('.qb-sheet-grip');
  let y0 = 0, t0 = 0, dy = 0, id = null;
  grip.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; id = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0; grip.setPointerCapture(id); dlg.classList.add('is-dragging'); });
  grip.addEventListener('pointermove', e => { if (e.pointerId !== id) return; dy = Math.max(0, e.clientY - y0); dlg.style.transform = `translateY(${dy}px)`; });
  const end = e => {
    if (e.pointerId !== id) return; id = null;
    const fast = dy / Math.max(1, performance.now() - t0) > 0.5;
    dlg.classList.remove('is-dragging');
    if (dy > 110 || (dy > 40 && fast)) entry.close();
    else dlg.style.transform = '';
  };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
}
// keep sheet footers above the on-screen keyboard
if (window.visualViewport) {
  const kb = () => document.documentElement.style.setProperty('--qb-kb', Math.max(0, innerHeight - visualViewport.height - visualViewport.offsetTop) + 'px');
  visualViewport.addEventListener('resize', kb); visualViewport.addEventListener('scroll', kb);
}

// ---------- controls (the kit's markup) ----------
// Segmented control: 2 to 4 segments on one row; radio inputs underneath, so arrow keys and screen readers work for free.
export const seg = (name, options, value, label) => `<fieldset class="app-segmented" data-seg="${esc(name)}"><legend>${esc(label)}</legend>${options.map(o => `<label class="app-seg"><input type="radio" name="${esc(name)}" value="${esc(o.value)}"${o.value === value ? ' checked' : ''}><span>${esc(o.label)}</span></label>`).join('')}</fieldset>`;
export function wireSeg(root, name, onChange) {
  const box = root.querySelector(`[data-seg="${name}"]`); if (!box) return;
  box.addEventListener('change', e => { if (e.target.matches('input[type=radio]') && e.target.checked) onChange(e.target.value); });
}
export const segValue = (root, name) => root.querySelector(`[data-seg="${name}"] input:checked`)?.value;
// Chips: a sideways-scrolling row of toggles (aria-pressed; the kit draws the tick).
export const chips = (name, options, on, label) => `<div class="app-chips" role="group" aria-label="${esc(label)}" data-chips="${esc(name)}">${options.map(o => `<button type="button" class="app-chip" aria-pressed="${on.includes(o.value)}" data-value="${esc(o.value)}">${esc(o.label)}${o.count != null ? ` <span class="app-chip-count">${o.count}</span>` : ''}</button>`).join('')}</div>`;
export function wireChips(root, name, onChange, { single = false } = {}) {
  const box = root.querySelector(`[data-chips="${name}"]`); if (!box) return;
  box.addEventListener('click', e => {
    const b = e.target.closest('.app-chip'); if (!b) return;
    if (single) box.querySelectorAll('.app-chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    else b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    onChange([...box.querySelectorAll('.app-chip[aria-pressed="true"]')].map(x => x.dataset.value));
  });
}
// Stepper: − value + (44px buttons) at the end of a grouped row.
export const stepper = (name, label, valueText, { sub = '' } = {}) => `<div class="app-row qb-stepper-row"><span class="app-row-body"><span class="app-row-title" id="st-${esc(name)}">${esc(label)}</span>${sub ? `<span class="app-row-sub">${sub}</span>` : ''}</span><span class="qb-stepper" role="group" aria-labelledby="st-${esc(name)}" data-stepper="${esc(name)}"><button type="button" class="qb-step" data-d="-1" aria-label="Fewer: ${esc(label)}">−</button><output class="qb-step-val" aria-live="polite" aria-label="${esc(label)}">${esc(valueText)}</output><button type="button" class="qb-step" data-d="1" aria-label="More: ${esc(label)}">+</button></span></div>`;
export function wireStepper(root, name, values, index, onChange, text = String) {
  const box = root.querySelector(`[data-stepper="${name}"]`); if (!box) return;
  let i = index;
  const paint = () => { box.querySelector('output').textContent = text(values[i]); box.querySelector('[data-d="-1"]').setAttribute('aria-disabled', i === 0); box.querySelector('[data-d="1"]').setAttribute('aria-disabled', i === values.length - 1); };
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const n = Math.min(values.length - 1, Math.max(0, i + Number(b.dataset.d))); if (n !== i) { i = n; paint(); onChange(values[i]); } });
  paint();
  return { set(v) { const n = values.indexOf(v); if (n >= 0) { i = n; paint(); } } };
}
// Score ring (draws once).
export function ring(pct, label, sub, ok, animate = true) {
  const v = Math.max(0, Math.min(100, Math.round(pct)));
  return `<div class="app-ring${ok ? ' app-ring--ok' : ''}${animate ? '' : ' qb-ring-still'}" style="--app-ring:${v}" role="img" aria-label="${esc(label)}${sub ? ', ' + esc(sub) : ''}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="app-ring-track" cx="50" cy="50" r="44"/><circle class="app-ring-value" cx="50" cy="50" r="44" pathLength="100"/></svg><span class="app-ring-label" aria-hidden="true"><strong>${v}%</strong>${sub ? `<span>${esc(sub)}</span>` : ''}</span></div>`;
}
// Text areas that grow as you type.
export function autogrow(el) { const fit = () => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; }; el.addEventListener('input', fit); requestAnimationFrame(fit); }
// Large title that collapses into the bar: the bar gains its blurred surface and inline title once the large one scrolls
// under it. Screens without a large title keep a solid bar.
let titleObserver = null;
export function watchLargeTitle(bar) {
  titleObserver?.disconnect(); titleObserver = null;
  const big = $('main .app-large-title');
  if (!big) return;
  bar.classList.remove('is-collapsed');
  if (!('IntersectionObserver' in window)) { bar.classList.add('is-collapsed'); return; }
  titleObserver = new IntersectionObserver(([e]) => bar.classList.toggle('is-collapsed', !e.isIntersecting), { rootMargin: `-${bar.offsetHeight}px 0px 0px 0px`, threshold: 0 });
  titleObserver.observe(big);
}
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back */ }
  const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.append(ta); ta.select();
  let ok = false; try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove(); return ok;
}

// ---------- installable app: safe updates, app version, "Get the latest version" ----------
// A new worker takes over by itself, but the page reloads only when it is safe (isSafe: a top-level screen, nothing
// open, nothing typed). Never on the first install, never during a session or while typing. If the update arrives at an
// unsafe moment, a toast "Update ready / Restart" appears at the next safe moment; coming back to the app later while it
// is safe reloads quietly. The page also asks for updates when it comes to the front, when signal returns and every 10 min.
export async function setupPwa({ isSafe }) {
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) return;
  let hadController = !!navigator.serviceWorker.controller, pending = false, offered = false, reloading = false;
  let reg; try { reg = await navigator.serviceWorker.register('sw.js'); } catch { return; }
  if (!reg) return;
  const check = () => reg.update().catch(() => {});
  const reload = () => { if (!reloading) { reloading = true; location.reload(); } };
  const offer = () => {
    if (!pending || offered || reloading || !isSafe()) return;
    offered = true; toast('Update ready', { action: 'Restart', onAction: reload, ms: 12000 });
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) return; check(); if (pending && isSafe()) reload(); });
  window.addEventListener('online', check);
  setInterval(check, 10 * 60 * 1000);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }          // first install taking control: no reload
    pending = true;
    if (isSafe()) reload();
  });
  window.addEventListener('hashchange', () => setTimeout(offer, 300));
  return { offer };
}
// The two version lines (AGENTS.md), as rows at the foot of Progress.
export const versionBlock = () => `<section class="app-section" aria-label="App version"><ul class="app-list">
  <li id="appver" hidden><div class="app-row"><span class="app-row-body"><span class="app-row-sub" id="appver-text"></span></span></div></li>
  <li><button type="button" class="app-row app-row--action" id="getlatest"><span class="app-row-body"><span class="app-row-title">Not updating? Get the latest version</span></span></button></li></ul>
  <p class="app-section-footer" id="appver-msg" role="status"></p></section>`;
export async function wireVersion(prefix) {
  const el = $('#appver'), btn = $('#getlatest'); if (!el) return;
  btn.addEventListener('click', () => getLatest(prefix));
  try {
    const k = (await caches.keys()).find(k => k.startsWith(prefix)); if (!k) return;
    const v = k.slice(prefix.length), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    if (!el.isConnected) return;
    $('#appver-text').textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
  } catch { /* no caches: no line */ }
}
// Clears only this app's offline copy (its worker and caches), never progress, answers or sign-in, and only after checking
// there is a signal, so the app is never left with nothing to open.
export async function getLatest(prefix) {
  const btn = $('#getlatest'), msg = $('#appver-msg');
  if (btn.getAttribute('aria-disabled') === 'true') return;
  btn.setAttribute('aria-disabled', 'true'); msg.textContent = '';
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const url = new URL(reg?.active?.scriptURL || new URL('sw.js', location.href));
    url.searchParams.set('fresh', Date.now());
    const res = await fetch(url, { cache: 'no-store' }); if (!res.ok) throw new Error(res.status);
    if (reg) await reg.unregister();
    for (const k of await caches.keys()) if (k.startsWith(prefix)) await caches.delete(k);
    location.reload();
  } catch {
    msg.textContent = 'No signal: nothing was changed. Try again with signal.'; btn.removeAttribute('aria-disabled');
  }
}
