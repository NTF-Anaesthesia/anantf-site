// The small inline markup the content uses (CONTENT.md, "Inline text"): **bold**, `value`, [words](href).
// Text is escaped first, so content can never inject HTML.

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Is this an address the content may link to? In-app routes, other pages on the site, or https. */
export function safeHref(h) {
  const s = String(h || '').trim();
  if (/^#\//.test(s)) return s;
  if (/^https:\/\//i.test(s)) return s;
  if (/^(\.\.\/)+[\w./#?=&-]*$/.test(s)) return s;
  return null;
}

/** Inline markup → HTML. */
export function md(text) {
  let s = esc(text);
  // `value` (no markup inside)
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, v) => { codes.push(v); return `\u0000${codes.length - 1}\u0000`; });
  // [words](href)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, words, href) => {
    const raw = href.replace(/&amp;/g, '&');
    const ok = safeHref(raw);
    if (!ok) return words;
    const ext = /^https:/i.test(ok);
    return `<a href="${esc(ok)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${words}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<span class="v">${codes[i]}</span>`);
  return s;
}

/** Plain text of inline markup (for search and reading time). */
export function plain(text) {
  return String(text ?? '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*|`/g, '');
}
