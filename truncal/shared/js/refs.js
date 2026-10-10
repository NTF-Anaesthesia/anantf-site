// Truncal blocks: citations and the reference list.
//   registerRefs([{id, text, url, label}])   page references, in the order they are numbered
//   cite('id', 'id2')                        HTML string placeholder: <sup class="tb-cite" data-refs="id id2"></sup>
//   finaliseRefs()                           fills every placeholder with numbered links (called by the shell)
//   renderRefs(host)                         the numbered list (ids ref-<id>), used by the References chapter
// Unknown ids render nothing, so deleting a reference is safe.
import { el, esc } from './ui.js';

const REFS = [];
const BY_ID = new Map();

export function registerRefs(list = []) {
  for (const r of list) {
    if (!r || !r.id || BY_ID.has(r.id)) continue;
    const item = { ...r, n: REFS.length + 1 };
    REFS.push(item);
    BY_ID.set(r.id, item);
  }
}

export function refNumber(id) { return BY_ID.get(id)?.n ?? null; }

/** Citation placeholder (HTML string) for use inside authored content. */
export function cite(...ids) {
  return `<sup class="tb-cite" data-refs="${esc(ids.flat().join(' '))}"></sup>`;
}

/** Same as cite() but returns a Node. */
export function citeEl(...ids) {
  return el('sup', { class: 'tb-cite', dataset: { refs: ids.flat().join(' ') } });
}

export function finaliseRefs(root = document) {
  root.querySelectorAll('sup.tb-cite[data-refs]').forEach((s) => {
    const ids = s.dataset.refs.split(/\s+/).filter((id) => BY_ID.has(id));
    s.textContent = '';
    if (!ids.length) { s.remove(); return; }
    ids.sort((a, b) => BY_ID.get(a).n - BY_ID.get(b).n);
    s.append('[');
    ids.forEach((id, i) => {
      if (i) s.append(', ');
      const r = BY_ID.get(id);
      s.append(el('a', { href: `#ref-${id}`, 'aria-label': `Reference ${r.n}`, text: String(r.n) }));
    });
    s.append(']');
    s.removeAttribute('data-refs');
  });
}

export function renderRefs(host) {
  const ol = el('ol', { class: 'tb-refs' });
  for (const r of REFS) {
    const body = el('span', { class: 'tb-ref-body' });
    body.insertAdjacentHTML('beforeend', r.text);
    if (r.url) {
      body.append(' ');
      body.append(el('a', { href: r.url, rel: 'noopener', text: r.label || r.url.replace(/^https?:\/\//, '').replace(/\/$/, '') }));
    }
    ol.append(el('li', { id: `ref-${r.id}` }, el('span', { class: 'tb-ref-num', text: `${r.n}.` }), body));
  }
  host.append(ol);
  return ol;
}
