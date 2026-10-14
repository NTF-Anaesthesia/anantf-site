// Lower-limb blocks: Dr Chew Shi Hao's animated block demonstrations, embedded in a block chapter.
//   animFigure(slug, {caption, variant}) -> HTML string for a block's `intro` (or a `sections` entry's html).
// The player is lower-limb/anim/ (a frozen copy of his engine and block modules, shown in embed mode).
// It reports its height with postMessage; the listener below sizes each iframe to fit, so there is no inner scroll.
// slug: 'popliteal' | 'adductor-canal' | 'femoral' | 'fib' | 'lfcn' | 'peng' | 'ankle'.
// variant: optional tab id inside that block (e.g. 'tkr' for adductor-canal), passed as #slug/variant.
const ROOT = new URL('../../anim/', import.meta.url).href;

export function animFigure(slug, { caption = '', variant = '', title = 'Animated block' } = {}) {
  const src = `${ROOT}?embed=1#${slug}${variant ? `/${variant}` : ''}`;
  return `<figure class="ll-anim">
  <iframe class="ll-anim-frame" src="${src}" title="${title}: press Play to watch the needle and the spread" loading="lazy" allow="fullscreen" allowfullscreen></iframe>
  <figcaption class="ll-anim-cap">${caption ? `${caption} ` : ''}Animation by <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>. Tap Full screen and turn the phone sideways for the largest view.</figcaption>
</figure>`;
}

if (!window.__llAnimListener) {
  window.__llAnimListener = true;
  window.addEventListener('message', (e) => {
    const h = e.data && e.data.raEmbedHeight;
    if (!h) return;
    for (const f of document.querySelectorAll('iframe.ll-anim-frame')) {
      if (f.contentWindow === e.source) f.style.height = `${Math.ceil(h)}px`;
    }
  });
}
