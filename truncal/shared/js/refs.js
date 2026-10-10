// Truncal blocks: citations are switched off (the owner asked for no sources or references on these pages).
// cite() and citeEl() are kept so any page data that still calls them keeps working: they render nothing.
// registerRefs() and finaliseRefs() are no-ops; finaliseRefs() also removes any stray placeholders.

/** Citation placeholder for authored content: renders nothing. */
export function cite() { return ''; }

/** Same as cite() but returns a Node: an empty text node. */
export function citeEl() { return document.createTextNode(''); }

export function registerRefs() {}

export function finaliseRefs(root = document) {
  root.querySelectorAll('sup.tb-cite').forEach((s) => s.remove());
}
