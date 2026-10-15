// Regional anaesthesia app: MO / Resident / Consultant level system (plan §5). API frozen in WP0; every regional page
// (engine pages, brachial-plexus, plexus, spinal) builds against it. Styles: ../css/levels.css.
//
// Levels are cumulative: MO shows tier 1, Resident tiers 1–2, Consultant tiers 1–3 (everything).
// Any element may carry data-tier="1|2|3"; untagged elements always show. applyLevel() sets body[data-level] and
// body[data-tier-max]; levels.css hides [data-tier] above the max.
//
//   getLevel()                      -> 'mo' | 'resident' | 'consultant'
//   setLevel(l, {save=true, announce=true, anchor=true})   change level (save=false: this page view only)
//   onLevel(fn)                     -> unsubscribe; fn(level, {tierMax, relaxed, pearlsOnly})
//   mountLevelControl(host, opts)   -> the MO · Res · Con segmented control (44px buttons, aria-pressed)
//   relaxFor(el)                    -> true if the level was raised (temporarily, never saved) to show el
//   withScrollAnchor(fn)            keep the heading in view where it was while content above it appears or hides
//   countHidden(root)               -> number of tagged items under root hidden at the current level
//   applyLevel()                    write the current level to <body> (call once on boot)
//   tierOf(el), tierMax(), getPearlsOnly(), setPearlsOnly(on), LEVELS, LEVEL_IDS, DEFAULT_LEVEL, STORAGE_KEY
// Helpers added in WP1 (additive):
//   hasChosenLevel()                -> true once the reader picked a level (or one was migrated)
//   mountLevelPicker(host, opts)    -> first-visit "Choose your level" card (null when already chosen or dismissed)
//   hiddenHint(root, opts)          -> "n items hidden at MO level · Show all" line that keeps itself up to date; while a
//                                      deep link has raised the level it reads "Showing … content for this view · Back to MO"
//                                      (in the page flow; opts.relaxed=false turns that off)
//   tierBadge(tier)                 -> <p class="ra-tier-badge"> "Resident" / "Consultant" (null for tier 1)
//   TIER_NAMES                      -> {1:'MO', 2:'Resident', 3:'Consultant'}
//
// Storage: localStorage 'ra-level' (every access in try/catch). One-time migration from spinal's 'spinal-level' /
// 'spinal-tier'. The level is never put in the URL. Default with nothing stored: Consultant (everything shows).

export const STORAGE_KEY = 'ra-level';
export const DEFAULT_LEVEL = 'consultant';
export const LEVELS = {
  mo: { id: 'mo', name: 'MO', short: 'MO', tier: 1, label: 'MO level', desc: 'Doing or assisting your first supervised blocks: the essentials and the safety points.' },
  resident: { id: 'resident', name: 'Resident', short: 'Res', tier: 2, label: 'Resident level', desc: 'Supervised blocks and the MMed: adds anatomy, technique detail, coverage and exam points.' },
  consultant: { id: 'consultant', name: 'Consultant', short: 'Con', tier: 3, label: 'Consultant level', desc: 'Everything, including catheters, alternatives and advanced pearls.' },
};
export const LEVEL_IDS = ['mo', 'resident', 'consultant'];
const BY_TIER = { 1: 'mo', 2: 'resident', 3: 'consultant' };
export const TIER_NAMES = { 1: 'MO', 2: 'Resident', 3: 'Consultant' };
const PICKER_KEY = 'ra-level-picker';

const store = {
  get(k) { try { return window.localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch { /* storage may be blocked */ } },
};
const valid = (l) => (Object.prototype.hasOwnProperty.call(LEVELS, l) ? l : null);

/** The saved level, migrating spinal's old keys once. */
function readSaved() {
  const saved = valid(store.get(STORAGE_KEY));
  if (saved) return saved;
  const sp = store.get('spinal-level');
  const tier = store.get('spinal-tier');
  const migrated = { 1: 'mo', 2: 'resident', adv: 'consultant', all: 'consultant' }[sp] || { 1: 'mo', 2: 'resident', 3: 'consultant' }[tier] || null;
  if (migrated) { store.set(STORAGE_KEY, migrated); return migrated; }
  return null;
}

const state = {
  saved: undefined,   // level the reader chose (undefined until first read; null = never chosen)
  relaxed: null,      // temporary level raised by relaxFor() (never saved)
  pearlsOnly: false,  // spinal's "Pearls only" digest; only meaningful at Consultant
};
const listeners = new Set();
const controls = new Set();

function savedLevel() { if (state.saved === undefined) state.saved = readSaved(); return state.saved; }
/** True once the reader has chosen a level (or one was migrated); used to decide whether to show the first-visit picker. */
export function hasChosenLevel() { return !!savedLevel(); }
export function getLevel() { return state.relaxed || savedLevel() || DEFAULT_LEVEL; }
export function tierMax() { return LEVELS[getLevel()].tier; }
export function getPearlsOnly() { return state.pearlsOnly && getLevel() === 'consultant'; }

/** Tier of an element: the highest data-tier on it or any ancestor (untagged = 1). */
export function tierOf(el) {
  let t = 1;
  for (let p = el; p && p.nodeType === 1; p = p.parentElement) { const v = Number(p.getAttribute('data-tier')); if (v > t) t = v; }
  return t;
}

let liveEl = null;
function say(msg) {
  if (typeof document === 'undefined' || !msg) return;
  if (!liveEl || !liveEl.isConnected) {
    liveEl = document.getElementById('ra-level-live');
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.id = 'ra-level-live';
      liveEl.className = 'ra-sr';
      liveEl.setAttribute('aria-live', 'polite');
      liveEl.setAttribute('aria-atomic', 'true');
      document.body.append(liveEl);
    }
  }
  liveEl.textContent = '';
  setTimeout(() => { liveEl.textContent = msg; }, 30);
}

/** Write the current level to <body> and repaint every mounted control. */
export function applyLevel() {
  if (typeof document === 'undefined' || !document.body) return;
  const l = getLevel();
  document.body.dataset.level = l;
  document.body.dataset.tierMax = String(LEVELS[l].tier);
  if (getPearlsOnly()) document.body.dataset.pearlsOnly = 'true'; else delete document.body.dataset.pearlsOnly;
  if (state.relaxed) document.body.dataset.levelRelaxed = 'true'; else delete document.body.dataset.levelRelaxed;
  controls.forEach((c) => c.paint());
}

function emit() {
  const info = { tierMax: tierMax(), relaxed: !!state.relaxed, pearlsOnly: getPearlsOnly() };
  listeners.forEach((fn) => { try { fn(getLevel(), info); } catch (err) { console.error('[levels] listener failed', err); } });
}

/** Keep the heading the reader is looking at where it was while content above it appears or disappears. */
export function withScrollAnchor(fn) {
  if (typeof document === 'undefined') { fn(); return; }
  const line = window.innerHeight * 0.3;
  const heads = [...document.querySelectorAll('main h1, main h2, main h3, main [data-scroll-anchor]')].filter((h) => h.getClientRects().length);
  let anchor = null;
  for (const h of heads) if (h.getBoundingClientRect().top <= line) anchor = h;
  anchor = anchor || heads.find((h) => h.getBoundingClientRect().top > 0) || null;
  const before = anchor ? anchor.getBoundingClientRect().top : 0;
  fn();
  if (anchor && anchor.getClientRects().length) {
    const delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
  }
}

/**
 * Change the level. save=false changes it for this page view only (e.g. "Show all" in a hidden-count hint).
 * Choosing a level always ends a temporary relax.
 */
export function setLevel(l, { save = true, announce = true, anchor = true } = {}) {
  const lv = valid(l);
  if (!lv) return false;
  const before = getLevel();
  const change = () => {
    state.relaxed = null;
    if (save) { state.saved = lv; store.set(STORAGE_KEY, lv); } else if (lv !== (savedLevel() || DEFAULT_LEVEL)) state.relaxed = lv;
    applyLevel();
  };
  if (anchor) withScrollAnchor(change); else change();
  if (announce) say(`${LEVELS[lv].label}. ${LEVELS[lv].desc}`);
  if (before !== getLevel() || save) emit();
  return true;
}

/** Spinal's "Pearls only" digest: shown only at Consultant level; never saved. */
export function setPearlsOnly(on, { announce = true } = {}) {
  state.pearlsOnly = !!on;
  withScrollAnchor(applyLevel);
  if (announce) say(getPearlsOnly() ? 'Showing consultant pearls only.' : 'Showing everything.');
  emit();
}

export function onLevel(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * A deep link or search result points at something the current level hides: raise the level just enough to show it,
 * for this page view only (never saved), announce it, and offer a way back in every mounted control.
 */
export function relaxFor(el) {
  if (!el) return false;
  const need = tierOf(el);
  const changed = need > tierMax() || (getPearlsOnly() && !el.closest('.sp-adv-digest,[data-pearl]'));
  if (!changed) return false;
  state.pearlsOnly = false;
  if (need > tierMax()) state.relaxed = BY_TIER[need];
  applyLevel();
  say(`Showing ${LEVELS[getLevel()].label} content for this link. Your saved level is unchanged.`);
  emit();
  return true;
}

/** Number of tagged items under root hidden at the current level (nested tagged items count once). */
export function countHidden(root = typeof document !== 'undefined' ? document.body : null) {
  if (!root) return 0;
  const max = tierMax();
  let n = 0;
  root.querySelectorAll('[data-tier]').forEach((e) => {
    if (Number(e.getAttribute('data-tier')) <= max) return;
    const p = e.parentElement?.closest('[data-tier]');
    if (p && root.contains(p) && Number(p.getAttribute('data-tier')) > max) return;
    n++;
  });
  return n;
}

/**
 * The MO · Res · Con segmented control. opts: { label=true (visible "Level" label on wide screens),
 * onChange(level) }. Returns the element (already appended to host when host is given).
 */
export function mountLevelControl(host, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'ra-level';
  const group = document.createElement('div');
  group.className = 'ra-level-seg';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Level of detail');
  if (opts.label !== false) {
    const lab = document.createElement('span');
    lab.className = 'ra-level-k';
    lab.setAttribute('aria-hidden', 'true');
    lab.textContent = 'Level';
    wrap.append(lab);
  }
  const btns = LEVEL_IDS.map((id) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ra-level-btn';
    b.dataset.level = id;
    b.setAttribute('aria-label', LEVELS[id].label);
    b.title = LEVELS[id].desc;
    b.innerHTML = `<span class="ra-level-short" aria-hidden="true">${LEVELS[id].short}</span><span class="ra-level-full" aria-hidden="true">${LEVELS[id].name}</span>`;
    b.addEventListener('click', () => { setLevel(id); opts.onChange?.(id); });
    group.append(b);
    return b;
  });
  wrap.append(group);
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'ra-level-back';
  back.hidden = true;
  back.addEventListener('click', () => { const s = savedLevel() || DEFAULT_LEVEL; setLevel(s, { save: !!savedLevel() }); });
  wrap.append(back);
  const ctl = {
    paint() {
      const l = getLevel();
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === l)));
      back.hidden = !state.relaxed;
      if (state.relaxed) back.textContent = `Back to ${LEVELS[savedLevel() || DEFAULT_LEVEL].name}`;
    },
  };
  controls.add(ctl);
  ctl.paint();
  if (host) host.append(wrap);
  return wrap;
}

/** "Resident" / "Consultant" badge for the first block of a run of that tier (a block of its own, never inside a heading). */
export function tierBadge(tier) {
  const t = Number(tier);
  if (!(t > 1) || typeof document === 'undefined') return null;
  const p = document.createElement('p');
  p.className = 'ra-tier-badge';
  p.dataset.badge = String(t);
  p.textContent = TIER_NAMES[t] || '';
  return p;
}

/**
 * A line that says how many items under root the current level hides, with a "Show all" button
 * (raises the level for this page view only; the bar's "Back to …" button undoes it).
 * opts: { label = 'in this chapter' }. The element hides itself when nothing is hidden.
 */
export function hiddenHint(root, opts = {}) {
  const box = document.createElement('p');
  box.className = 'ra-hidden-hint';
  box.hidden = true;
  const text = document.createElement('span');
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Show all';
  // Two jobs: "n items hidden · Show all", and while a deep link or search result has raised the level for this view,
  // "Showing Consultant content for this link · Back to MO" (in the page flow, so it never covers text).
  btn.addEventListener('click', () => {
    if (state.relaxed) { const s = savedLevel() || DEFAULT_LEVEL; setLevel(s, { save: !!savedLevel() }); }
    else setLevel('consultant', { save: false });
  });
  box.append(text, btn);
  const paint = () => {
    if (state.relaxed && opts.relaxed !== false) {
      box.hidden = false;
      box.classList.add('is-relaxed');
      text.textContent = `Showing ${LEVELS[state.relaxed].name} content for this view. Your saved level is unchanged.`;
      btn.textContent = `Back to ${LEVELS[savedLevel() || DEFAULT_LEVEL].name}`;
      return;
    }
    box.classList.remove('is-relaxed');
    btn.textContent = 'Show all';
    const n = countHidden(root);
    box.hidden = n === 0;
    if (n) text.textContent = `${n} ${n === 1 ? 'item' : 'items'} hidden at ${LEVELS[getLevel()].name} level${opts.label ? ` ${opts.label}` : ''}`;
  };
  onLevel(paint);
  box.refresh = paint;
  requestAnimationFrame(paint);
  return box;
}

/**
 * First-visit picker: one card with the three levels and a one-line definition each, plus "Not now"
 * (keeps the default, Consultant: everything shows). Returns null once a level is chosen or the card was dismissed.
 * opts: { onDone(level|null) }.
 */
export function mountLevelPicker(host, opts = {}) {
  if (typeof document === 'undefined' || hasChosenLevel() || store.get(PICKER_KEY)) return null;
  const box = document.createElement('section');
  box.className = 'ra-level-picker';
  box.setAttribute('aria-labelledby', 'ra-level-picker-h');
  box.innerHTML = '<h2 id="ra-level-picker-h">How much detail do you want?</h2><p>Choose once; every regional block page remembers it on this device. Change it at any time with the Level buttons at the top.</p>';
  const ul = document.createElement('ul');
  ul.className = 'ra-level-picker-list';
  const done = (l) => {
    store.set(PICKER_KEY, l || 'dismissed');
    // The focused button is about to go: move keyboard and screen-reader focus to the bar's level control
    // (the pressed button), or else to the heading before the card, so the reader keeps their place.
    const hadFocus = box.contains(document.activeElement);
    box.remove();
    if (hadFocus) {
      const lv = getLevel();
      const btn = [...document.querySelectorAll(`.ra-level-btn[data-level="${lv}"]`)].find((b) => b.getClientRects().length);
      let to = btn || null;
      if (!to) {
        to = host?.querySelector?.('h1,h2') || document.querySelector('main h1');
        if (to && !to.hasAttribute('tabindex')) to.setAttribute('tabindex', '-1');
      }
      to?.focus({ preventScroll: true });
    }
    opts.onDone?.(l);
  };
  LEVEL_IDS.forEach((id) => {
    const li = document.createElement('li');
    li.className = 'ra-level-picker-item';
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<strong>${LEVELS[id].name}</strong>`;
    b.append(LEVELS[id].desc);
    b.addEventListener('click', () => { setLevel(id); done(id); });
    li.append(b);
    ul.append(li);
  });
  const skip = document.createElement('button');
  skip.type = 'button';
  skip.className = 'ra-level-picker-skip';
  skip.textContent = 'Not now (show everything)';
  skip.addEventListener('click', () => done(null));
  box.append(ul, skip);
  if (host) host.append(box);
  return box;
}

// Another tab changed the saved level: follow it (unless this view is temporarily relaxed).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const l = valid(e.newValue);
    state.saved = l;
    if (!state.relaxed && document.body?.dataset.level) { applyLevel(); emit(); }
  });
}
