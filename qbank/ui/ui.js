// Shared phone-app building blocks for the qbank app and the Baby MO test (design spec 15 Oct 2026): a hash router with
// history that Android back and the iOS edge swipe understand, bottom sheets, toasts, small controls, and the
// installable-app update rules. No framework; plain ES module. Import it by relative path; don't copy it.

export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const haptic = () => { try { if (/android/i.test(navigator.userAgent)) navigator.vibrate?.(10); } catch { /* not allowed */ } };
export const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- line icons (24px, stroke = currentColor) ----------
const svg = (d, size = 24, extra = '') => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"${extra}>${d}</svg>`;
export const icon = {
  practise: (s) => svg('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>', s),
  browse: (s) => svg('<path d="M4 5.5h16M4 12h16M4 18.5h10"/>', s),
  papers: (s) => svg('<path d="M7 3.5h7.5L19 8v12.5H7z"/><path d="M14.5 3.5V8H19M9.5 12.5h7M9.5 16h7"/>', s),
  progress: (s) => svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>', s),
  back: (s = 22) => svg('<path d="M15 5l-7 7 7 7"/>', s, ' stroke-width="2"'),
  close: (s = 24) => svg('<path d="M6 6l12 12M18 6L6 18"/>', s, ' stroke-width="2"'),
  flag: (s = 24) => svg('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', s),
  flagOn: (s = 24) => svg('<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5z" fill="currentColor"/>', s),
  check: (s = 16) => svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', s, ' stroke-width="2.6"'),
  cross: (s = 16) => svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', s, ' stroke-width="2.6"'),
  dash: (s = 16) => svg('<path d="M7 12h10"/>', s, ' stroke-width="2.4"'),
  search: (s = 20) => svg('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>', s),
};

// ---------- storage (every read and write may fail: private mode, full storage) ----------
export function store(prefix) {
  return {
    get(k, fallback) { try { const v = localStorage.getItem(prefix + k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(prefix + k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(prefix + k); } catch { /* ignore */ } },
    keys() { try { return Object.keys(localStorage).filter(k => k.startsWith(prefix)).map(k => k.slice(prefix.length)); } catch { return []; } },
  };
}

// ---------- announcements and toasts ----------
export function announce(text) {
  const el = $('#live'); if (!el) return;
  el.textContent = ''; setTimeout(() => { el.textContent = text; }, 30);
}
let toastTimer = 0;
export function toast(msg, { action, onAction, ms = 4000 } = {}) {
  const box = $('#toasts'); if (!box) return;
  clearTimeout(toastTimer);
  box.innerHTML = `<div class="toast"><span>${esc(msg)}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}</div>`;
  const t = box.firstElementChild;
  if (action) t.querySelector('button').addEventListener('click', () => { box.innerHTML = ''; onAction?.(); });
  toastTimer = setTimeout(() => { if (box.firstElementChild === t) box.innerHTML = ''; }, ms);
}

// ---------- page transitions (View Transitions where the browser has them) ----------
export function transition(kind, update) {
  if (!kind || kind === 'none' || !document.startViewTransition || reduced() || document.hidden) { update(); return; }
  const root = document.documentElement, cls = 'vt-' + kind;
  root.classList.add(cls);
  try {
    const t = document.startViewTransition(update);
    t.finished.finally(() => root.classList.remove(cls));
  } catch { root.classList.remove(cls); update(); }
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

// ---------- bottom sheets: <dialog>, grabber, drag down to close, back closes, focus returns to the trigger ----------
const stack = [];
export const sheetOpen = () => stack.length > 0;
window.addEventListener('popstate', () => {
  const depth = history.state?.sheet || 0;
  for (const s of stack.slice().reverse()) if (s.depth > depth) s.remove();
});
export function closeAllSheets() { for (const s of stack.slice().reverse()) s.remove(); }

// openSheet({ title, size: 'medium'|'large'|'auto', body, foot, label, onClose }) -> { el, body, foot, close() }
export function openSheet({ title, titleHtml = '', size = 'auto', body = '', foot = '', onClose, focus = 'heading', cls = '' }) {
  const trigger = document.activeElement;
  const dlg = document.createElement('dialog');
  const hid = 'sh' + Math.random().toString(36).slice(2, 8);
  dlg.className = `sheet ${size} ${cls}`.trim();
  dlg.setAttribute('aria-labelledby', hid);
  dlg.innerHTML = `<div class="sheet-grip"><div class="grabber" aria-hidden="true"></div><div class="sheet-head"><h2 id="${hid}" tabindex="-1">${titleHtml || esc(title)}</h2><button type="button" class="btn-text sheet-close">Close</button></div></div>
    <div class="sheet-body">${body}</div>${foot ? `<div class="sheet-foot">${foot}</div>` : ''}`;
  document.body.append(dlg);
  const entry = {
    el: dlg, body: dlg.querySelector('.sheet-body'), foot: dlg.querySelector('.sheet-foot'), depth: stack.length + 1, closed: false, waiters: [],
    close() {
      if (entry.closed) return Promise.resolve();
      const p = new Promise(r => entry.waiters.push(r));
      if (history.state?.sheet === entry.depth) { history.back(); setTimeout(() => entry.remove(), 600); }   // popstate removes it; the timer is a safety net
      else entry.remove();
      return p;
    },
    remove() {
      if (entry.closed) return;
      entry.closed = true;
      stack.splice(stack.indexOf(entry), 1);
      const done = () => { try { dlg.close(); } catch { /* already */ } dlg.remove(); if (trigger?.isConnected) trigger.focus({ preventScroll: true }); onClose?.(); entry.waiters.forEach(r => r()); };
      if (reduced()) done(); else { dlg.classList.add('closing'); setTimeout(done, 200); }
    },
  };
  stack.push(entry);
  history.pushState({ ...(history.state || {}), sheet: entry.depth }, '');
  dlg.showModal();
  dlg.addEventListener('cancel', e => { e.preventDefault(); entry.close(); });
  dlg.querySelector('.sheet-close').addEventListener('click', () => entry.close());
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
function dragToClose(dlg, entry) {
  const grip = dlg.querySelector('.sheet-grip');
  let y0 = 0, t0 = 0, dy = 0, id = null;
  grip.addEventListener('pointerdown', e => { if (e.target.closest('button')) return; id = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0; grip.setPointerCapture(id); dlg.style.transition = 'none'; });
  grip.addEventListener('pointermove', e => { if (e.pointerId !== id) return; dy = Math.max(0, e.clientY - y0); dlg.style.transform = `translateY(${dy}px)`; });
  const end = e => {
    if (e.pointerId !== id) return; id = null;
    const fast = dy / Math.max(1, performance.now() - t0) > 0.5;
    dlg.style.transition = 'transform 200ms ease-out';
    if (dy > 110 || (dy > 40 && fast)) { dlg.style.transform = 'translateY(100%)'; entry.close(); }
    else dlg.style.transform = '';
  };
  grip.addEventListener('pointerup', end); grip.addEventListener('pointercancel', end);
}
// keep sheet footers above the on-screen keyboard
if (window.visualViewport) {
  const kb = () => document.documentElement.style.setProperty('--kb', Math.max(0, innerHeight - visualViewport.height - visualViewport.offsetTop) + 'px');
  visualViewport.addEventListener('resize', kb); visualViewport.addEventListener('scroll', kb);
}

// ---------- small controls ----------
// Segmented control: 2 to 4 equal segments, one choice (role radiogroup; arrow keys move).
export const seg = (name, options, value, label) => `<div class="seg" role="radiogroup" aria-label="${esc(label)}" data-seg="${esc(name)}">${options.map(o => `<button type="button" role="radio" aria-checked="${o.value === value}" tabindex="${o.value === value ? 0 : -1}" data-value="${esc(o.value)}">${esc(o.label)}</button>`).join('')}</div>`;
export function wireSeg(root, name, onChange) {
  const box = root.querySelector(`[data-seg="${name}"]`); if (!box) return;
  const btns = [...box.querySelectorAll('button')];
  const set = (b, focus) => { btns.forEach(x => { x.setAttribute('aria-checked', x === b); x.tabIndex = x === b ? 0 : -1; }); if (focus) b.focus(); onChange(b.dataset.value); };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => set(b));
    b.addEventListener('keydown', e => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!d) return;
      e.preventDefault(); set(btns[(i + d + btns.length) % btns.length], true);
    });
  });
}
export const segValue = (root, name) => root.querySelector(`[data-seg="${name}"] [aria-checked="true"]`)?.dataset.value;
// Chips: a sideways-scrolling row of toggles (aria-pressed).
export const chips = (name, options, on, label) => `<div class="chips" role="group" aria-label="${esc(label)}" data-chips="${esc(name)}">${options.map(o => `<button type="button" class="chip" aria-pressed="${on.includes(o.value)}" data-value="${esc(o.value)}"><span class="tick" aria-hidden="true">✓</span>${esc(o.label)}</button>`).join('')}</div>`;
export function wireChips(root, name, onChange, { single = false } = {}) {
  const box = root.querySelector(`[data-chips="${name}"]`); if (!box) return;
  box.addEventListener('click', e => {
    const b = e.target.closest('.chip'); if (!b) return;
    if (single) box.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === b));
    else b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
    onChange([...box.querySelectorAll('.chip[aria-pressed="true"]')].map(x => x.dataset.value));
  });
}
// Stepper: − value + over a list of values.
export const stepper = (name, label, valueText) => `<div class="stepper" data-stepper="${esc(name)}"><button type="button" data-d="-1" aria-label="Fewer: ${esc(label)}">−</button><output aria-live="polite" aria-label="${esc(label)}">${esc(valueText)}</output><button type="button" data-d="1" aria-label="More: ${esc(label)}">+</button></div>`;
export function wireStepper(root, name, values, index, onChange, text = String) {
  const box = root.querySelector(`[data-stepper="${name}"]`); if (!box) return;
  let i = index;
  const paint = () => { box.querySelector('output').textContent = text(values[i]); box.querySelector('[data-d="-1"]').setAttribute('aria-disabled', i === 0); box.querySelector('[data-d="1"]').setAttribute('aria-disabled', i === values.length - 1); };
  box.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const n = Math.min(values.length - 1, Math.max(0, i + Number(b.dataset.d))); if (n !== i) { i = n; paint(); onChange(values[i]); } });
  paint();
  return { set(v) { const n = values.indexOf(v); if (n >= 0) { i = n; paint(); } } };
}
// Text areas that grow as you type.
export function autogrow(el) { const fit = () => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 2 + 'px'; }; el.addEventListener('input', fit); requestAnimationFrame(fit); }
// Large title that collapses into the bar: the inline title fades in once the large one scrolls away.
let titleObserver = null;
export function watchLargeTitle(main, bar) {
  titleObserver?.disconnect(); titleObserver = null;
  const big = main.querySelector('.large-title');
  bar.classList.remove('lined');
  if (!big || !('IntersectionObserver' in window)) return;
  titleObserver = new IntersectionObserver(([e]) => bar.classList.toggle('lined', !e.isIntersecting), { root: main, threshold: 0, rootMargin: '-8px 0px 0px 0px' });
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
export const versionBlock = () => '<div class="appver"><p id="appver" hidden></p><p><button type="button" class="btn-text" id="getlatest">Not updating? Get the latest version</button></p><p id="appver-msg" role="status"></p></div>';
export async function wireVersion(prefix) {
  const el = $('#appver'), btn = $('#getlatest'); if (!el) return;
  btn.addEventListener('click', () => getLatest(prefix));
  try {
    const k = (await caches.keys()).find(k => k.startsWith(prefix)); if (!k) return;
    const v = k.slice(prefix.length), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    if (!el.isConnected) return;
    el.textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
  } catch { /* no caches: no line */ }
}
// Clears only this app's offline copy (its worker and caches), never progress, answers or sign-in, and only after checking
// there is a signal, so the app is never left with nothing to open.
export async function getLatest(prefix) {
  const btn = $('#getlatest'), msg = $('#appver-msg');
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
