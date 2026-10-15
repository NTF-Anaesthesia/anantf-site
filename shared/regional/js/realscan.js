// Regional anaesthesia app: the "Real" scan view (plan §7.2), generalised from brachial-plexus/js/ultrasound.js and
// real-scans.js. Open-licence images only; every image carries its credit and licence line. No images ship this run:
// the scan viewer (scan.js) shows its "Real" button only when a block has at least one image.
//
// Data, per block id (same shape as brachial-plexus/js/real-scans.js):
//   [{ src, credit, licence, sourceUrl?, orientation?, alt?, caption?,
//      labels: [{ text, x, y, tx?, ty?, kind?, ids?: ['<plexus>:<elementId>'], elementId? }] }]
// x, y: the point on the structure; tx, ty: where the label pill sits (a leader line joins them). Fractions of the
// image width / height (0–1). src is relative to the page (opts.base).
//
//   REAL_SCANS                         block id -> [image…] (empty this run; the brachial port fills it in phase 4)
//   realScansFor(blockId, scene?)      -> scene.realScans || REAL_SCANS[blockId] || []
//   hasRealScans(blockId, scene?)      -> boolean (the scan toggle shows "Real" only when true)
//   mountRealScan(host, images, opts)  -> { el, show(i), next(), prev(), setLabels(on), destroy() }
//        opts: { labels=true, base=document.baseURI, onPick(label), yourScan=true }
// "Your scan": the reader can put one of their own images beside the real scan. It is read with an object URL and
// shown on this device only; nothing is uploaded or stored.

export const REAL_SCANS = {};

export function realScansFor(blockId, scene) {
  const list = (scene && Array.isArray(scene.realScans) && scene.realScans) || REAL_SCANS[blockId] || [];
  return list.filter((im) => im && im.src && im.credit);
}
export function hasRealScans(blockId, scene) { return realScansFor(blockId, scene).length > 0; }

const SVGNS = 'http://www.w3.org/2000/svg';
const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const mks = (tag, attrs, parent) => { const n = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v)); if (parent) parent.append(n); return n; };
let seq = 0;

export function ensureScanCss() {
  if (typeof document === 'undefined' || document.querySelector('link[data-ra-css="scan"]')) return;
  const l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = new URL('../css/scan.css', import.meta.url).href;
  l.dataset.raCss = 'scan';
  document.head.append(l);
}

export function mountRealScan(host, images, opts = {}) {
  ensureScanCss();
  const list = (images || []).filter((im) => im && im.src && im.credit);
  const base = opts.base || document.baseURI;
  seq += 1;
  const fig = mk('figure', 'ra-real');
  const box = mk('div', 'ra-real-box');
  const img = mk('img', 'ra-real-img');
  img.decoding = 'async';
  const lines = mks('svg', { class: 'ra-real-lines', viewBox: '0 0 100 100', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  const pills = mk('div', 'ra-real-pills');
  box.append(img, lines, pills);
  const cap = mk('figcaption', 'ra-real-cap');
  const nav = mk('div', 'ra-real-nav');
  const prevB = mk('button', 'tb-btn', 'Previous'); prevB.type = 'button'; prevB.setAttribute('aria-label', 'Previous real scan');
  const nextB = mk('button', 'tb-btn', 'Next'); nextB.type = 'button'; nextB.setAttribute('aria-label', 'Next real scan');
  const count = mk('span', 'ra-real-count');
  nav.append(prevB, count, nextB);
  fig.append(box, cap);
  if (list.length > 1) fig.append(nav);

  // ---- your scan (local only)
  let yourUrl = null;
  const your = mk('div', 'ra-your');
  if (opts.yourScan !== false) {
    const fid = `ra-your-${seq}`;
    const input = mk('input', 'ra-your-file'); input.type = 'file'; input.accept = 'image/*'; input.id = fid;
    const pick = mk('label', 'tb-btn ra-your-pick', 'Compare your own scan'); pick.htmlFor = fid;
    const note = mk('p', 'ra-your-note', 'Your image is shown on this device only. It is not uploaded or saved.');
    const yFig = mk('figure', 'ra-your-fig'); yFig.hidden = true;
    const yImg = mk('img', 'ra-your-img'); yImg.alt = 'Your own ultrasound image';
    const yCap = mk('figcaption', 'ra-your-cap', 'Your scan (on this device only)');
    const remove = mk('button', 'tb-btn', 'Remove'); remove.type = 'button';
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

  let i = 0; let labelsOn = opts.labels !== false;
  function paint() {
    const im = list[i];
    if (!im) { box.hidden = true; cap.textContent = 'No real scan for this block yet.'; return; }
    box.hidden = false;
    const src = new URL(im.src, base).href;
    if (img.src !== src) img.src = src;
    img.alt = im.alt || im.caption || 'Ultrasound image';
    pills.textContent = ''; lines.textContent = '';
    box.classList.toggle('is-nolabels', !labelsOn);
    if (labelsOn) for (const l of im.labels || []) {
      const px = (l.tx ?? l.x) * 100, py = (l.ty ?? l.y) * 100;
      if (l.tx != null && l.ty != null && (Math.abs(l.tx - l.x) + Math.abs(l.ty - l.y) > 0.01)) {
        mks('line', { x1: l.x * 100, y1: l.y * 100, x2: px, y2: py, class: 'ra-real-leader', 'vector-effect': 'non-scaling-stroke' }, lines);
        mks('circle', { cx: l.x * 100, cy: l.y * 100, r: 0.8, class: 'ra-real-dot' }, lines);
      }
      const p = mk('button', `ra-real-pill${l.kind ? ` ra-real-pill--${l.kind}` : ''}`, l.text);
      p.type = 'button';
      p.style.left = `${px}%`;
      p.style.top = `${py}%`;
      p.addEventListener('click', () => {
        pills.querySelectorAll('.is-sel').forEach((q) => q.classList.remove('is-sel'));
        p.classList.add('is-sel');
        opts.onPick?.(l);
      });
      pills.append(p);
    }
    cap.textContent = '';
    if (im.orientation) cap.append(mk('p', 'ra-real-orient', im.orientation));
    if (im.caption) cap.append(mk('p', 'ra-real-text', im.caption));
    const cr = mk('p', 'ra-real-credit', `${im.credit}${im.licence && !im.credit.includes(im.licence) ? ` ${im.licence}.` : ''}`);
    if (im.sourceUrl) { cr.append(' '); const a = mk('a', null, 'Source'); a.href = im.sourceUrl; a.rel = 'noopener'; a.target = '_blank'; cr.append(a); }
    cap.append(cr);
    count.textContent = `${i + 1} of ${list.length}`;
  }
  const show = (n) => { if (!list.length) return; i = (n + list.length) % list.length; paint(); };
  prevB.addEventListener('click', () => show(i - 1));
  nextB.addEventListener('click', () => show(i + 1));
  paint();
  if (host) host.append(fig);
  return {
    el: fig, show, next: () => show(i + 1), prev: () => show(i - 1),
    setLabels(on) { labelsOn = !!on; paint(); },
    destroy() { if (yourUrl) URL.revokeObjectURL(yourUrl); fig.remove(); },
  };
}
