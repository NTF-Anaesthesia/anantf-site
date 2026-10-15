// Lower-limb blocks: Dr Chew Shi Hao's animated block demonstrations, embedded from lower-limb/anim/ (a frozen copy of
// his engine and block modules, shown in embed mode).
//
// The block pages now use the engine's own slot, `watch: {anim, variant?, caption?}` in a block's data
// (shared/regional/js/block.js, "Watch the animation"). animFigure() stays for any other page or section that wants one:
//   animFigure(slug, {caption, variant, title, label}) -> HTML string: a closed "Watch the animation" disclosure.
// The iframe is created only when the disclosure is opened, only one animation is live on a page (opening one closes
// and unloads the others), and closing it removes the iframe, which also stops the player's own height polling.
// The player reports its height with postMessage; only messages from this site's origin and from one of our iframes
// are used to size it, so there is no inner scroll.
// slug: 'popliteal' | 'adductor-canal' | 'femoral' | 'fib' | 'lfcn' | 'peng' | 'ankle'.
// variant: optional tab id inside that block (e.g. 'single' for adductor-canal), passed as #slug/variant.
const ROOT = new URL('../../anim/', import.meta.url).href;
const ORIGIN = new URL(ROOT).origin;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const animSrc = (slug, variant = '') => `${ROOT}?embed=1#${encodeURIComponent(slug)}${variant ? `/${encodeURIComponent(variant)}` : ''}`;

export function animFigure(slug, { caption = '', variant = '', title = 'Animated block', label = 'Watch the animation' } = {}) {
  listen();
  return `<details class="tb-details ll-anim" data-anim-src="${esc(animSrc(slug, variant))}" data-anim-title="${esc(title)}">
  <summary>${esc(label)}</summary>
  <div class="tb-details-body ll-anim-body"></div>
  <p class="ll-anim-cap">${caption ? `${caption} ` : ''}Animation by <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>. Tap Full screen and turn the phone sideways for the largest view.</p>
</details>`;
}

function open(d) {
  // One live animation per page: close (and so unload) every other one, the engine's own watch cards included.
  document.querySelectorAll('details.ll-anim[open], details.ra-watch[open]').forEach((x) => { if (x !== d) x.open = false; });
  const body = d.querySelector('.ll-anim-body');
  if (!body || body.querySelector('iframe')) return;
  const f = document.createElement('iframe');
  f.className = 'll-anim-frame';
  f.src = d.dataset.animSrc;
  f.title = `${d.dataset.animTitle || 'Animated block'}: press Play to watch the needle and the spread`;
  f.allow = 'fullscreen';
  body.append(f);
}

function listen() {
  if (window.__llAnimListener) return;
  window.__llAnimListener = true;
  // toggle does not bubble: listen in the capture phase so disclosures added later are handled too.
  document.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!(d instanceof HTMLDetailsElement) || !d.classList.contains('ll-anim')) return;
    if (d.open) open(d);
    else d.querySelector('.ll-anim-body')?.replaceChildren(); // unload: stops the animation and its polling
  }, true);
  window.addEventListener('message', (e) => {
    if (e.origin !== ORIGIN) return;
    const h = Number(e.data && e.data.raEmbedHeight);
    if (!(h > 0)) return;
    for (const f of document.querySelectorAll('iframe.ll-anim-frame')) {
      if (f.contentWindow === e.source) f.style.height = `${Math.ceil(h)}px`;
    }
  });
}
