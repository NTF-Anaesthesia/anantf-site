// Shared reference list for the spinal page.
// Each entry: { label: 'Author year', text: 'Vancouver-style citation (HTML allowed: <i>, <b>)', url?: 'https://doi.org/…' }
// Details below were checked against PubMed / Crossref on 8 October 2026.
// Section modules add their own refs through `export const refs = {...}` (ids prefixed with the module prefix).

export const REFS = {
  asra2025: {
    label: 'Kopp 2025',
    text: 'Kopp SL, Vandermeulen E, McBane RD, Perlas A, Leffert L, Horlocker T. Regional anesthesia in the patient receiving antithrombotic or thrombolytic therapy: American Society of Regional Anesthesia and Pain Medicine evidence-based guidelines (fifth edition). <i>Reg Anesth Pain Med</i> 2025;50(10). Published online 29 January 2025.',
    url: 'https://doi.org/10.1136/rapm-2024-105766',
  },
  esaic2022: {
    label: 'Kietaibl 2022',
    text: 'Kietaibl S, Ferrandis R, Godier A, Llau J, Lobo C, Macfarlane AJ, et al. Regional anaesthesia in patients on antithrombotic drugs: joint ESAIC/ESRA guidelines. <i>Eur J Anaesthesiol</i> 2022;39:100–132.',
    url: 'https://doi.org/10.1097/EJA.0000000000001600',
  },
  aagbi2013: {
    label: 'Harrop-Griffiths 2013',
    text: 'Working Party: Harrop-Griffiths W, Cook T, Gill H, Hill D, Ingram M, Makris M, et al. Regional anaesthesia and patients with abnormalities of coagulation: the Association of Anaesthetists of Great Britain &amp; Ireland, the Obstetric Anaesthetists’ Association, Regional Anaesthesia UK. <i>Anaesthesia</i> 2013;68:966–72.',
    url: 'https://doi.org/10.1111/anae.12359',
  },
  uppal2023: {
    label: 'Uppal 2023',
    text: 'Uppal V, Russell R, Sondekoppam R, Ansari J, Baber Z, Chen Y, et al. Consensus practice guidelines on postdural puncture headache from a multisociety, international working group: a summary report. <i>JAMA Netw Open</i> 2023;6:e2325387.',
    url: 'https://doi.org/10.1001/jamanetworkopen.2023.25387',
  },
  'iso80369-6': {
    label: 'ISO 2016',
    text: 'International Organization for Standardization. ISO 80369-6:2016. Small-bore connectors for liquids and gases in healthcare applications — Part 6: Connectors for neuraxial applications. Geneva: ISO; 2016. (Withdrawn in 2025 and replaced by ISO 80369-6:2025.)',
    url: 'https://www.iso.org/standard/50734.html',
  },
};

const registry = { ...REFS };

/** Add module refs ({id: {label, text, url?}}). Existing ids are not overwritten (warns). */
export function registerRefs(obj) {
  if (!obj) return;
  for (const [id, r] of Object.entries(obj)) {
    if (registry[id] && registry[id] !== r) { console.warn(`[refs] duplicate id "${id}" ignored`); continue; }
    registry[id] = r;
  }
}

export function getRef(id) { return registry[id]; }

const link = (id) => `<a href="#ref-${id}" data-ref="${id}" aria-label="Reference">[?]</a>`;

/** HTML string: <sup class="sp-cite"><a …>[?]</a>, …</sup>. Numbers are filled in by finalise(). */
export function cite(...ids) {
  // U+2060 word joiner stops the line breaking between the text and its citation.
  return `<sup class="sp-cite">\u2060${ids.map(link).join(",\u2060")}</sup>`;
}

/** Same as cite(), as an Element. */
export function citeEl(...ids) {
  const t = document.createElement('template');
  t.innerHTML = cite(...ids);
  return t.content.firstElementChild;
}

/** Number refs by first appearance in DOM order, fill the citations, render #sp-refs. Safe to call again. */
export function finalise() {
  // Unknown or retired ids render nothing (silently), so sections can drop citations at their own pace.
  for (const sup of document.querySelectorAll('sup.sp-cite')) {
    const anchors = Array.from(sup.querySelectorAll('a[data-ref]'));
    const keep = anchors.filter((a) => registry[a.dataset.ref]);
    if (keep.length === anchors.length) continue;
    if (!keep.length) { sup.remove(); continue; }
    sup.textContent = '\u2060';
    keep.forEach((a, i) => { if (i) sup.append(',\u2060'); sup.append(a); });
  }
  const order = [];
  const num = new Map();
  const seen = new Map();
  for (const a of document.querySelectorAll('a[data-ref]')) {
    const id = a.dataset.ref;
    if (!registry[id]) { a.remove(); continue; } // normally already dropped above
    if (!num.has(id)) { order.push(id); num.set(id, order.length); }
    const n = num.get(id);
    const k = (seen.get(id) || 0) + 1;
    seen.set(id, k);
    if (k === 1) a.id = `cite-${id}-1`;
    else if (a.id === `cite-${id}-1`) a.removeAttribute('id');
    a.textContent = `[${n}]`;
    a.setAttribute('aria-label', `Reference ${n}`);
  }
  const list = document.getElementById('sp-refs');
  if (!list) return;
  list.textContent = '';
  for (const id of order) {
    const r = registry[id];
    const li = document.createElement('li');
    li.id = `ref-${id}`;
    const n = document.createElement('span');
    n.className = 'sp-ref-num';
    n.textContent = `${num.get(id)}.`;
    const body = document.createElement('span');
    body.className = 'sp-ref-body';
    body.innerHTML = `<b>${r.label}.</b> ${r.text}`;
    if (r.url) {
      const u = document.createElement('a');
      u.href = r.url;
      u.className = 'sp-ref-link';
      u.textContent = r.url.replace(/^https?:\/\/(doi\.org\/)?/, (m, d) => (d ? 'doi:' : ''));
      body.append(' ', u);
    }
    const back = document.createElement('a');
    back.href = `#cite-${id}-1`;
    back.className = 'sp-ref-back';
    back.setAttribute('aria-label', `Back to first citation of reference ${num.get(id)}`);
    back.textContent = '↩';
    body.append(' ', back);
    li.append(n, body);
    list.append(li);
  }
  if (!order.length) {
    const li = document.createElement('li');
    li.className = 'sp-refs-empty';
    li.textContent = 'References appear here as the sections cite them.';
    list.append(li);
  }
}
