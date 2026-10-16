// Regional anaesthesia app: the "Real" scan view (plan §7.2) with a colour-key overlay (OVERLAY-SPEC).
// Open-licence images only; every image carries its credit and licence line. The scan viewer (scan.js) shows its
// "Real" button only when a block has at least one image. Same component for the brachial plexus app.
//
// Where the images come from (first match wins):
//   1. scene.realScans: [image…] in the page data, or REAL_SCANS[blockId] set by a page;
//   2. shared/us/<region>/sources.json, read once per region and cached. The region is the block's registry region
//      (registry.js) or the page path (/truncal/ → truncal, /spinal/ → neuraxial …). An entry is used for a viewer when
//        entry.blockId === blockId (and its optional `view` names the scene id), or
//        entry.blockId + '-' + entry.view === blockId (sub-views such as 'ankle-dpn': blockId 'ankle', view 'dpn').
//      An entry with `injection: id | [ids]` is shown only while that injection point is chosen (if none match, all
//      show). Entries may also list `blockIds: [...]`.
//
// Image shape (a sources.json entry is converted to this; scene.realScans uses it directly):
//   { src, credit, licence?, licenceUrl?, sourceUrl?, orientation?: 'text' | {left, right}, alt?, caption?,
//     needle?: [[x,y]…], la?: [[x,y]…], authorLabels?: boolean,
//     labels: [{ text, x, y, tx?, ty?, kind?, desc?, block?, shape?: [[x,y]…], line?: [[x,y]…], ids?, elementId? }] }
//   x, y: the point on the structure; tx, ty: where the label pill sits (a leader line joins them). All fractions of
//   the image width / height (0–1). shape: a polygon drawn as a semi-transparent fill in the clinical colour; line:
//   an open line (fascia, bone cortex, pleura, needle path). needle: the needle path the authors show; la: where the
//   local anaesthetic goes. Labels with the same text are one structure.
//   authorLabels: the image already carries the authors' own labels (sources.json `burnedInLabels`, unless the entry
//   sets `authorLabels: false`, e.g. when the authors used only numbers). Our pills would sit on top of theirs, so
//   such images show a pill only for the structure that is tapped or picked in the colour key.
//   On a narrow image (< 420 px) with more than 6 pills, only the block-view structures keep their pills.
//
// API (frozen names kept from WP0):
//   REAL_SCANS                         block id -> [image…]
//   realScansFor(blockId, scene?)      -> scene.realScans || REAL_SCANS[blockId] || []   (synchronous)
//   hasRealScans(blockId, scene?)      -> boolean (synchronous sources only)
//   loadRealScans(blockId, scene?)     -> Promise<[image…]>  (synchronous sources, else sources.json; never rejects)
//   mountRealScan(host, images, opts)  -> { el, show(i), next(), prev(), setLabels(on), setInjection(id), destroy() }
//        opts: { labels=true, base=document.baseURI, linkFor(label) -> href|null, onPick(label), yourScan=true,
//                injection? }
// "Your scan": the reader can put one of their own images beside the real scan. It is read with an object URL and
// shown on this device only; nothing is uploaded or stored.
import { getBlock } from './registry.js';

export const REAL_SCANS = {};

const ok = (im) => im && im.src && im.credit;
export function realScansFor(blockId, scene) {
  const list = (scene && Array.isArray(scene.realScans) && scene.realScans) || REAL_SCANS[blockId] || [];
  return list.filter(ok);
}
export function hasRealScans(blockId, scene) { return realScansFor(blockId, scene).length > 0; }

// ---------------------------------------------------------------- sources.json
const REGION_DIR = { trunk: 'truncal', truncal: 'truncal', 'head-neck': 'head-neck', 'lower-limb': 'lower-limb', neuraxial: 'neuraxial', 'upper-limb': 'upper-limb' };
const PATH_DIR = { truncal: 'truncal', 'head-neck': 'head-neck', 'lower-limb': 'lower-limb', spinal: 'neuraxial', 'brachial-plexus': 'upper-limb', 'upper-limb': 'upper-limb', blocks: null };
const US_ROOT = new URL('../../us/', import.meta.url);
const cache = new Map(); // region dir -> Promise<entries[]>

function regionsFor(blockId, scene) {
  const out = [];
  const add = (d) => { if (d && !out.includes(d)) out.push(d); };
  add(REGION_DIR[scene?.realRegion]);
  const base = String(blockId || '').split('-')[0];
  for (const id of [blockId, base]) { try { add(REGION_DIR[getBlock(id)?.region]); } catch { /* registry optional */ } }
  if (typeof location !== 'undefined') add(PATH_DIR[location.pathname.split('/').filter(Boolean)[0]]);
  return out;
}
function loadRegion(dir) {
  if (!cache.has(dir)) {
    const url = new URL(`${dir}/sources.json`, US_ROOT);
    cache.set(dir, fetch(url, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((a) => (Array.isArray(a) ? a.map((e) => ({ ...e, _dir: dir })) : []))
      .catch(() => { cache.delete(dir); return []; }));
  }
  return cache.get(dir);
}
const asList = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
function matches(e, blockId, scene) {
  const ids = [e.blockId, ...asList(e.blockIds)].filter(Boolean);
  const views = asList(e.view);
  for (const id of ids) {
    if (id === blockId && (!views.length || views.includes(scene?.id))) return true;
    if (views.some((v) => `${id}-${v}` === blockId)) return true;
  }
  return false;
}
const cap1 = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '');
/** A sources.json entry -> the image shape above. */
export function fromSource(e, dir = e._dir) {
  const fig = e.figure ? `, ${e.figure}` : '';
  const who = [e.authors, e.journal, e.year].filter(Boolean).join(' ');
  const credit = e.credit || `${who}${fig}.${e.licence ? ` ${e.licence}.` : ''}`;
  return {
    src: new URL(`${dir}/${e.file}`, US_ROOT).href,
    credit,
    licence: e.licence, licenceUrl: e.licenceUrl,
    sourceUrl: e.articleUrl || (e.doi ? `https://doi.org/${e.doi}` : null),
    orientation: e.orientation, alt: e.alt, caption: e.caption,
    labels: e.labels || [], needle: e.needle, la: e.la, injection: e.injection, file: e.file,
    authorLabels: e.authorLabels ?? !!e.burnedInLabels,
  };
}
export function loadRealScans(blockId, scene) {
  const direct = realScansFor(blockId, scene);
  if (direct.length || typeof fetch === 'undefined') return Promise.resolve(direct);
  const dirs = regionsFor(blockId, scene);
  return Promise.all(dirs.map(loadRegion))
    .then((lists) => lists.flat().filter((e) => e && e.file && matches(e, blockId, scene)).map((e) => fromSource(e)).filter(ok))
    .catch(() => []);
}

// ---------------------------------------------------------------- colour code (clinical, never recoloured)
const COLOURS = {
  nerve: '#f2d000', artery: '#e01f1f', vein: '#2448d8', muscle: '#7a2e22', fascia: '#f08a00', bone: '#b8926a',
  pleura: '#e6e4dc', la: '#22c4d4', target: '#22c4d4', needle: '#f07a62', fat: '#f4f0a0', shadow: '#8c8c8c',
  tendon: '#e8d9b5', ligament: '#e8d9b5', cartilage: '#cfe3da', fluid: '#22c4d4', other: '#d8d4cc',
};
const FILL_OP = { muscle: 0.25, fat: 0.3, shadow: 0.3, bone: 0.35 };
const BLOCK_KINDS = new Set(['target', 'nerve', 'artery', 'la', 'needle']);
function kindOf(l) {
  const k = String(l.kind || '').toLowerCase();
  if (k === 'point' || k === 'label' || !k) return /needle/i.test(l.text || '') ? 'needle' : (k === 'point' ? 'target' : 'other');
  return COLOURS[k] ? k : 'other';
}

// ---------------------------------------------------------------- DOM helpers
const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const mks = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v)); if (parent) parent.append(n); return n; };
const btn = (cls, text, label) => { const b = mk('button', cls, text); b.type = 'button'; if (label) b.setAttribute('aria-label', label); return b; };
let seq = 0;

function linkCss(key, file) {
  if (typeof document === 'undefined' || document.querySelector(`link[data-ra-css="${key}"]`)) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL(`../css/${file}`, import.meta.url).href;
  l.dataset.raCss = key;
  document.head.append(l);
}
export function ensureScanCss() { linkCss('scan', 'scan.css'); linkCss('realscan', 'realscan.css'); }

const pointIn = (pts, x, y) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};
const polyArea = (p) => Math.abs(p.reduce((s, [x, y], i) => { const [x2, y2] = p[(i + 1) % p.length]; return s + x * y2 - x2 * y; }, 0) / 2);
const validPts = (p) => Array.isArray(p) && p.length >= 2 && p.every((q) => Array.isArray(q) && q.length >= 2 && q.every(Number.isFinite));

/** Group an image's labels (and top-level needle / la) into structures. */
function structuresOf(im) {
  const map = new Map();
  const add = (key, kind, extra = {}) => {
    if (!map.has(key)) map.set(key, { key, kind, labels: [], polys: [], lines: [], desc: '', block: false, ids: [], special: null });
    const s = map.get(key); Object.assign(s, extra); return s;
  };
  for (const l of im.labels || []) {
    if (!l || !l.text) continue;
    const kind = kindOf(l);
    const special = (kind === 'needle' && (validPts(l.line) || validPts(l.shape))) ? 'needle' : (kind === 'la' && validPts(l.shape)) ? 'la' : null;
    const s = add(special === 'needle' ? 'Needle path' : special === 'la' ? 'LA' : l.text, kind, special ? { special } : {});
    s.labels.push(l);
    if (validPts(l.shape) && l.shape.length >= 3) s.polys.push(l.shape);
    if (validPts(l.line)) s.lines.push(l.line);
    if (!s.desc && l.desc) s.desc = l.desc;
    if (l.block || BLOCK_KINDS.has(kind)) s.block = true;
    for (const id of [...asList(l.ids), l.elementId].filter(Boolean)) if (!s.ids.includes(id)) s.ids.push(id);
  }
  if (validPts(im.needle)) { const s = add('Needle path', 'needle', { special: 'needle' }); s.lines.push(im.needle); s.block = true; }
  if (validPts(im.la) && im.la.length >= 3) { const s = add('LA', 'la', { special: 'la' }); s.polys.push(im.la); s.block = true; if (!s.desc) s.desc = 'Where the local anaesthetic goes.'; }
  for (const s of map.values()) s.drawn = s.polys.length > 0 || s.lines.length > 0;
  return [...map.values()];
}

// ---------------------------------------------------------------- the component
export function mountRealScan(host, images, opts = {}) {
  ensureScanCss();
  const all = (images || []).filter(ok);
  const base = opts.base || (typeof document !== 'undefined' ? document.baseURI : '');
  seq += 1;
  const uid = `ra-rs-${seq}`;
  let injection = opts.injection || null;
  let list = all; // filtered by injection
  let i = 0;
  let labelsOn = opts.labels !== false;
  let structs = [];
  const on = new Set(); // keys of structures whose fill is shown
  let sel = null; // selected structure key
  let W = 0, H = 0;

  const fig = mk('figure', 'ra-rs');
  fig.id = uid;
  const picker = mk('div', 'ra-rs-pick'); picker.setAttribute('role', 'group'); picker.setAttribute('aria-label', 'Choose a scan');
  const main = mk('div', 'ra-rs-main');
  const media = mk('div', 'ra-rs-media');
  const box = mk('div', 'ra-rs-box');
  const img = mk('img', 'ra-rs-img');
  img.decoding = 'async'; img.loading = 'lazy'; img.draggable = false;
  const svg = mks('svg', { class: 'ra-rs-svg', 'aria-hidden': 'true', focusable: 'false' });
  const gFill = mks('g', { class: 'ra-rs-fills' }, svg);
  const gLead = mks('g', { class: 'ra-rs-leads' }, svg);
  const pills = mk('div', 'ra-rs-pills');
  const status = mk('p', 'ra-rs-status', 'Loading the scan…');
  box.append(img, svg, pills, status);
  const name = mk('div', 'ra-rs-name'); name.setAttribute('aria-live', 'polite'); name.hidden = true;
  const hint = mk('p', 'ra-rs-hint', 'The labels in the image are the authors\u2019. Tap the scan, or a name in the key, to see what each structure is.');
  hint.hidden = true;
  media.append(box, name, hint);
  const keyWrap = mk('div', 'ra-rs-keywrap');
  const keyHead = mk('div', 'ra-rs-keyhead');
  const keyTitle = mk('p', 'ra-rs-keyk', 'Colour key');
  keyTitle.id = `${uid}-k`;
  const sw = btn('ra-rs-switch', '', 'Colour key: show colour fills on the scan');
  sw.setAttribute('aria-pressed', 'false');
  sw.append(mk('span', 'ra-rs-switch-track'), mk('span', 'ra-rs-switch-t', 'Off'));
  keyHead.append(keyTitle, sw);
  const key = mk('ul', 'ra-rs-key'); key.setAttribute('aria-labelledby', keyTitle.id);
  keyWrap.append(keyHead, key);
  main.append(media, keyWrap);
  const cap = mk('figcaption', 'ra-rs-cap');
  fig.append(picker, main, cap);

  // ---- your scan (local only)
  let yourUrl = null;
  if (opts.yourScan !== false) {
    const your = mk('div', 'ra-rs-your');
    const fid = `${uid}-your`;
    const input = mk('input', 'ra-rs-your-file'); input.type = 'file'; input.accept = 'image/*'; input.id = fid;
    const pick = mk('label', 'tb-btn ra-rs-your-pick', 'Compare your own scan'); pick.htmlFor = fid;
    const note = mk('p', 'ra-rs-your-note', 'Your image is shown on this device only. It is not uploaded or saved.');
    const yFig = mk('figure', 'ra-rs-your-fig'); yFig.hidden = true;
    const yImg = mk('img', 'ra-rs-your-img'); yImg.alt = 'Your own ultrasound image';
    const yCap = mk('figcaption', 'ra-rs-your-cap', 'Your scan (on this device only)');
    const remove = btn('tb-btn', 'Remove', 'Remove your scan');
    yCap.append(' ', remove);
    yFig.append(yImg, yCap);
    your.append(input, pick, note, yFig);
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      input.value = '';
      if (!f || !/^image\//.test(f.type)) return;
      if (yourUrl) URL.revokeObjectURL(yourUrl);
      yourUrl = URL.createObjectURL(f);
      yImg.src = yourUrl; yFig.hidden = false;
    });
    remove.addEventListener('click', () => { if (yourUrl) URL.revokeObjectURL(yourUrl); yourUrl = null; yImg.removeAttribute('src'); yFig.hidden = true; pick.focus(); });
    fig.append(your);
  }

  // ---------------------------------------------------------------- picker
  function paintPicker() {
    picker.textContent = '';
    picker.hidden = list.length < 2;
    if (list.length < 2) return;
    list.forEach((im, n) => {
      const b = btn('ra-rs-thumb', null, `Scan ${n + 1} of ${list.length}${im.caption ? `: ${im.caption}` : ''}`);
      b.setAttribute('aria-pressed', String(n === i));
      const t = mk('img'); t.alt = ''; t.loading = 'lazy'; t.decoding = 'async'; t.src = new URL(im.src, base).href;
      b.append(t, mk('span', 'ra-rs-thumb-n', String(n + 1)));
      b.addEventListener('click', () => show(n));
      picker.append(b);
    });
  }

  // ---------------------------------------------------------------- key list
  const chipFor = new Map();
  const drawnStructs = () => structs.filter((s) => s.drawn);
  const blockSet = () => drawnStructs().filter((s) => s.block).map((s) => s.key);
  const sameSet = (keys) => keys.length > 0 && keys.length === on.size && keys.every((k) => on.has(k));
  function chip(label, cls, swatch, onClick, title) {
    const li = mk('li', 'ra-rs-ki');
    const b = btn(`ra-rs-chip ${cls || ''}`.trim(), null, title);
    if (swatch) { const s = mk('span', `ra-rs-sw ra-rs-sw--${swatch.kind}${swatch.line ? ' is-line' : ''}`); s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--c', COLOURS[swatch.kind] || COLOURS.other); b.append(s); }
    b.append(mk('span', 'ra-rs-chip-t', label));
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', onClick);
    li.append(b); key.append(li);
    return b;
  }
  function paintKey() {
    key.textContent = ''; chipFor.clear();
    const drawn = drawnStructs();
    const hasFills = drawn.length > 0;
    keyTitle.textContent = hasFills ? 'Colour key' : 'Structures';
    sw.hidden = !hasFills;
    if (hasFills) {
      chipFor.set('@all', chip('Show all', 'ra-rs-chip--cmd', null, () => {
        const keys = drawn.map((s) => s.key);
        if (sameSet(keys)) on.clear(); else { on.clear(); keys.forEach((k) => on.add(k)); }
        if (sel && !on.has(sel)) sel = null;
        update();
      }));
      if (blockSet().length) chipFor.set('@block', chip('Block view', 'ra-rs-chip--cmd', null, () => {
        const keys = blockSet();
        if (sameSet(keys)) on.clear(); else { on.clear(); keys.forEach((k) => on.add(k)); }
        if (sel && !on.has(sel)) sel = null;
        update();
      }, 'Block view: the target, the nerves, the artery, the needle path and the local anaesthetic'));
    }
    const order = [...structs].sort((a, b) => (a.special === 'needle' ? -2 : a.special === 'la' ? -1 : 0) - (b.special === 'needle' ? -2 : b.special === 'la' ? -1 : 0));
    for (const s of order) {
      const line = !s.polys.length && s.lines.length > 0;
      chipFor.set(s.key, chip(s.key, s.drawn ? '' : 'is-nofill', { kind: s.kind, line: line || (!s.drawn && ['fascia', 'pleura', 'needle'].includes(s.kind)) }, () => toggle(s.key)));
    }
    keyWrap.hidden = !structs.length;
  }
  function toggle(k) {
    const s = structs.find((x) => x.key === k);
    if (!s) return;
    if (!s.drawn) { select(sel === k ? null : k); return; }
    if (on.has(k)) { on.delete(k); if (sel === k) sel = null; }
    else { on.add(k); sel = k; }
    update();
  }
  sw.addEventListener('click', () => {
    if (on.size) { on.clear(); sel = null; }
    else { const keys = blockSet().length ? blockSet() : drawnStructs().map((s) => s.key); keys.forEach((k) => on.add(k)); }
    update();
  });

  // ---------------------------------------------------------------- selection + name bar
  function select(k) { sel = k; update(); }
  function paintName() {
    const s = sel && structs.find((x) => x.key === sel);
    name.textContent = '';
    name.hidden = !s;
    hint.hidden = !!s || !list[i]?.authorLabels || !structs.length || !labelsOn;
    if (!s) return;
    const sw2 = mk('span', `ra-rs-sw ra-rs-sw--${s.kind}`); sw2.setAttribute('aria-hidden', 'true'); sw2.style.setProperty('--c', COLOURS[s.kind] || COLOURS.other);
    const row = mk('div', 'ra-rs-name-row');
    const t = mk('p', 'ra-rs-name-t'); t.append(sw2, mk('strong', null, s.key));
    row.append(t);
    const href = opts.linkFor ? s.ids.map((id) => opts.linkFor({ ...s.labels[0], elementId: id, ids: [id] })).find(Boolean) : null;
    if (href) { const a = mk('a', 'ra-rs-name-3d', 'See in 3D →'); a.href = href; row.append(a); }
    const x = btn('ra-rs-name-x', 'Clear', `Clear ${s.key}`);
    x.addEventListener('click', () => { const c = chipFor.get(s.key); select(null); c?.focus(); });
    row.append(x);
    name.append(row);
    if (s.desc) name.append(mk('p', 'ra-rs-name-d', s.desc));
  }

  // ---------------------------------------------------------------- drawing (pixel space, redrawn on resize)
  const P = ([x, y]) => `${(x * W).toFixed(1)},${(y * H).toFixed(1)}`;
  function paintFills() {
    gFill.textContent = '';
    if (!W || !H) return;
    for (const s of structs) {
      if (!s.drawn) continue;
      const shown = on.has(s.key) || sel === s.key;
      const c = COLOURS[s.kind] || COLOURS.other;
      const g = mks('g', { class: `ra-rs-st${shown ? ' is-on' : ''}${sel === s.key ? ' is-sel' : ''}${sel && sel !== s.key ? ' is-dim' : ''}`, 'data-k': s.key }, gFill);
      g.style.setProperty('--c', c);
      g.style.setProperty('--fo', String(FILL_OP[s.kind] ?? 0.45));
      for (const p of s.polys) {
        mks('polygon', { points: p.map(P).join(' '), class: 'ra-rs-poly' }, g);
      }
      for (const p of s.lines) {
        const pts = p.map(P).join(' ');
        mks('polyline', { points: pts, class: 'ra-rs-halo' }, g);
        mks('polyline', { points: pts, class: `ra-rs-line${s.kind === 'needle' ? ' is-needle' : ''}` }, g);
        if (s.kind === 'needle' && p.length >= 2) { // arrowhead at the tip (last point)
          const [ax, ay] = p[p.length - 2], [bx, by] = p[p.length - 1];
          const dx = (bx - ax) * W, dy = (by - ay) * H, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, tx = bx * W, ty = by * H, a = 10, w = 5;
          mks('polygon', { points: `${tx},${ty} ${tx - ux * a - uy * w},${ty - uy * a + ux * w} ${tx - ux * a + uy * w},${ty - uy * a - ux * w}`, class: 'ra-rs-tip' }, g);
        }
      }
    }
  }
  function paintLabels() {
    const fi = [...pills.children].indexOf(document.activeElement);
    paintPills();
    if (fi >= 0) pills.children[fi]?.focus({ preventScroll: true });
  }
  function paintPills() {
    pills.textContent = ''; gLead.textContent = '';
    box.classList.toggle('is-nolabels', !labelsOn);
    if (!labelsOn || !W || !H) return;
    const im = list[i] || {};
    let shown = structs.filter((s) => s.labels.some((l) => Number.isFinite(l.x) && Number.isFinite(l.y)));
    if (im.authorLabels) shown = shown.filter((s) => s.key === sel); // the authors' own labels are on the image
    else if (W < 420 && shown.reduce((n, s) => n + (s.special ? 1 : s.labels.length), 0) > 6) shown = shown.filter((s) => s.block || s.key === sel);
    const items = [];
    for (const s of shown) {
      for (const l of s.labels) {
        if (!Number.isFinite(l.x) || !Number.isFinite(l.y)) continue;
        const p = btn(`ra-rs-pill${on.has(s.key) || sel === s.key ? ' is-on' : ''}${sel === s.key ? ' is-sel' : ''}`);
        p.append(mk('span', 'ra-rs-pill-t', s.special ? s.key : l.text));
        p.style.setProperty('--c', COLOURS[s.kind] || COLOURS.other);
        p.setAttribute('aria-pressed', String(sel === s.key));
        p.dataset.k = s.key; // a tap is handled by the box (below), so taps on the pill's enlarged edge can reach the shape under it
        pills.append(p);
        items.push({ p, l, s, cx: (l.tx ?? l.x) * W, cy: (l.ty ?? l.y) * H });
        if (s.special) break; // one pill for the needle / LA
      }
    }
    // measure, keep inside the image, then nudge overlapping pills apart vertically
    const pad = 3;
    for (const it of items) {
      it.w = it.p.offsetWidth; it.h = it.p.offsetHeight;
      it.cx = Math.min(Math.max(it.cx, it.w / 2 + pad), W - it.w / 2 - pad);
      it.cy = Math.min(Math.max(it.cy, it.h / 2 + pad), H - it.h / 2 - pad);
    }
    items.sort((a, b) => a.cy - b.cy);
    for (let pass = 0; pass < 6; pass++) {
      let moved = false;
      for (let a = 0; a < items.length; a++) for (let b = a + 1; b < items.length; b++) {
        const A = items[a], B = items[b];
        const ox = (A.w + B.w) / 2 + 2 - Math.abs(A.cx - B.cx), oy = (A.h + B.h) / 2 + 2 - Math.abs(A.cy - B.cy);
        if (ox > 0 && oy > 0) {
          const d = oy / 2 + 0.5, up = A.cy <= B.cy ? -1 : 1;
          A.cy = Math.min(Math.max(A.cy + up * d, A.h / 2 + pad), H - A.h / 2 - pad);
          B.cy = Math.min(Math.max(B.cy - up * d, B.h / 2 + pad), H - B.h / 2 - pad);
          moved = true;
        }
      }
      if (!moved) break;
    }
    for (const it of items) {
      it.p.style.left = `${it.cx - it.w / 2}px`;
      it.p.style.top = `${it.cy - it.h / 2}px`;
      const ax = it.l.x * W, ay = it.l.y * H;
      // nearest point on the pill to the anchor
      const nx = Math.min(Math.max(ax, it.cx - it.w / 2), it.cx + it.w / 2), ny = Math.min(Math.max(ay, it.cy - it.h / 2), it.cy + it.h / 2);
      const g = mks('g', { class: `ra-rs-lead${on.has(it.s.key) || sel === it.s.key ? ' is-on' : ''}` }, gLead);
      g.style.setProperty('--c', COLOURS[it.s.kind] || COLOURS.other);
      if (Math.hypot(nx - ax, ny - ay) > 6) {
        mks('line', { x1: ax, y1: ay, x2: nx, y2: ny, class: 'ra-rs-lead-halo' }, g);
        mks('line', { x1: ax, y1: ay, x2: nx, y2: ny, class: 'ra-rs-lead-l' }, g);
        mks('circle', { cx: ax, cy: ay, r: 3, class: 'ra-rs-lead-dot' }, g);
      }
    }
  }
  function paintChips() {
    const drawn = drawnStructs().map((s) => s.key);
    for (const [k, b] of chipFor) {
      let pressed;
      if (k === '@all') pressed = sameSet(drawn);
      else if (k === '@block') pressed = sameSet(blockSet());
      else { const s = structs.find((x) => x.key === k); pressed = s?.drawn ? on.has(k) : sel === k; b.classList.toggle('is-sel', sel === k); }
      b.setAttribute('aria-pressed', String(!!pressed));
    }
    sw.setAttribute('aria-pressed', String(on.size > 0));
    sw.querySelector('.ra-rs-switch-t').textContent = on.size ? 'On' : 'Off';
  }
  function update() {
    paintFills(); paintLabels(); paintChips(); paintName();
    box.classList.toggle('has-sel', !!sel);
  }

  function measure() {
    const r = box.getBoundingClientRect();
    const w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h || (w === W && h === H)) return false;
    W = w; H = h;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    return true;
  }
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (measure()) { paintFills(); paintLabels(); } }) : null;
  ro?.observe(box);

  // ---------------------------------------------------------------- tap on the image: name the structure under the finger
  box.addEventListener('click', (e) => {
    const pill = e.target.closest('.ra-rs-pill');
    if (pill) {
      // On the pill itself (or from the keyboard): that pill's structure. On its invisible enlarged edge: whatever
      // drawn structure lies under the finger, falling back to the pill's own.
      const pr = pill.getBoundingClientRect();
      const onPill = e.detail === 0 || (e.clientX >= pr.left && e.clientX <= pr.right && e.clientY >= pr.top && e.clientY <= pr.bottom);
      const k = pill.dataset.k;
      const under = onPill ? null : hitAt(e);
      const pick = under ? under.key : k;
      select(sel === pick ? null : pick);
      return;
    }
    const best = hitAt(e);
    select(best && best.key !== sel ? best.key : null);
  });
  function hitAt(e) {
    const r = box.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    let best = null, bestScore = Infinity;
    const tol = 14 / Math.max(r.width, 1);
    for (const s of structs) {
      if (!s.drawn) continue;
      for (const p of s.polys) if (pointIn(p, fx, fy)) { const a = polyArea(p); if (a < bestScore) { best = s; bestScore = a; } }
      for (const p of s.lines) for (let k = 1; k < p.length; k++) {
        const d = segDist(fx * r.width, fy * r.height, [p[k - 1][0] * r.width, p[k - 1][1] * r.height], [p[k][0] * r.width, p[k][1] * r.height]) / r.width;
        if (d < tol) { const sc = d * 1e-3; if (sc < bestScore) { best = s; bestScore = sc; } } // lines win over the area they sit on
      }
    }
    return best;
  }
  fig.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sel) { e.preventDefault(); e.stopPropagation(); select(null); return; }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && e.target.closest('.ra-rs-key, .ra-rs-pick')) {
      e.stopPropagation(); e.preventDefault();
      const bs = [...e.target.closest('.ra-rs-key, .ra-rs-pick').querySelectorAll('button')];
      const n = bs.indexOf(e.target.closest('button'));
      const nb = bs[(n + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length];
      nb?.focus();
    }
  });
  key.addEventListener('focusin', (e) => { // keep the focused chip in view inside the scrolling row (phones)
    const b = e.target.closest('button'); if (!b) return;
    const kr = key.getBoundingClientRect(), br = b.getBoundingClientRect();
    if (br.left < kr.left || br.right > kr.right) key.scrollLeft += br.left - kr.left - 16;
  });

  // ---------------------------------------------------------------- one image
  function paintCaption(im) {
    cap.textContent = '';
    const o = im.orientation;
    if (o) {
      const p = mk('p', 'ra-rs-orient');
      if (typeof o === 'string') p.textContent = o;
      else p.append(mk('span', null, `Screen left: ${cap1(o.left)}`), mk('span', 'ra-rs-orient-sep', ' · '), mk('span', null, `Screen right: ${cap1(o.right)}`));
      cap.append(p);
    }
    if (im.caption) cap.append(mk('p', 'ra-rs-text', im.caption));
    const cr = mk('p', 'ra-rs-credit');
    cr.append(mk('span', 'ra-rs-credit-k', 'Image: '), im.credit);
    if (im.licence && !im.credit.includes(im.licence)) cr.append(` ${im.licence}.`);
    if (structs.length) cr.append(structs.some((x) => x.drawn) ? ' Labels and colour key added here.' : ' Labels added here.');
    const links = [];
    if (im.licenceUrl) { const a = mk('a', null, 'Licence'); a.href = im.licenceUrl; links.push(a); }
    if (im.sourceUrl) { const a = mk('a', null, 'Source'); a.href = im.sourceUrl; links.push(a); }
    cap.append(cr);
    if (links.length) { // own row, so each link is a full-size tap target without stretching the credit's lines
      const row = mk('p', 'ra-rs-links');
      for (const a of links) { a.rel = 'noopener'; a.target = '_blank'; row.append(a); }
      cap.append(row);
    }
  }
  function paint() {
    const im = list[i];
    if (!im) { box.hidden = true; keyWrap.hidden = true; cap.textContent = 'No real scan for this block yet.'; return; }
    box.hidden = false;
    structs = structuresOf(im);
    on.clear(); sel = null;
    const src = new URL(im.src, base).href;
    if (img.getAttribute('src') !== src) {
      box.classList.add('is-loading'); status.hidden = false; status.textContent = 'Loading the scan…';
      img.src = src;
    }
    img.alt = im.alt || im.caption || 'Ultrasound image';
    [...picker.children].forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
    paintKey(); paintCaption(im);
    measure(); update();
  }
  img.addEventListener('load', () => {
    if (img.naturalWidth && img.naturalHeight) {
      box.style.setProperty('--ar', `${img.naturalWidth} / ${img.naturalHeight}`);
      box.style.setProperty('--nw', `${img.naturalWidth}px`); // small sources are not blown up past 1.5x (realscan.css)
    }
    box.classList.remove('is-loading'); status.hidden = true;
    requestAnimationFrame(() => { measure(); paintFills(); paintLabels(); });
  });
  img.addEventListener('error', () => { box.classList.remove('is-loading'); status.hidden = false; status.textContent = 'The scan could not be loaded. Check your connection and try again.'; });

  function filterList() {
    const m = injection ? all.filter((im) => !im.injection || asList(im.injection).includes(injection)) : all;
    const any = injection && all.some((im) => asList(im.injection).includes(injection));
    list = any ? m : all;
    if (i >= list.length) i = 0;
  }
  const show = (n) => { if (!list.length) return; i = (n + list.length) % list.length; paint(); };
  filterList(); paintPicker(); paint();
  if (host) host.append(fig);
  requestAnimationFrame(() => { if (measure()) update(); });
  return {
    el: fig, show, next: () => show(i + 1), prev: () => show(i - 1),
    setLabels(v) { labelsOn = !!v; paintLabels(); paintName(); },
    setInjection(id) {
      const before = list;
      injection = id || null; filterList();
      if (list.length !== before.length || list.some((x, n) => x !== before[n])) { i = 0; paintPicker(); paint(); }
    },
    destroy() { ro?.disconnect(); if (yourUrl) URL.revokeObjectURL(yourUrl); fig.remove(); },
  };
}
