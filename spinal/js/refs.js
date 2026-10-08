// Shared reference list for the spinal page.
// Each entry: { label: 'Author year', text: 'Vancouver-style citation (HTML allowed: <i>, <b>)', url?: 'https://doi.org/…' }
// Details below were checked against PubMed / Crossref on 8 October 2026 (see the builders' verification log).
// Section modules add their own refs through `export const refs = {...}` (ids prefixed with the module prefix).

export const REFS = {
  asra2025: {
    label: 'Kopp 2025',
    text: 'Kopp SL, Vandermeulen E, McBane RD, Perlas A, Leffert L, Horlocker T. Regional anesthesia in the patient receiving antithrombotic or thrombolytic therapy: American Society of Regional Anesthesia and Pain Medicine evidence-based guidelines (fifth edition). <i>Reg Anesth Pain Med</i> 2025. Published online 29 January 2025.',
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
  nap3: {
    label: 'Cook 2009',
    text: 'Cook TM, Counsell D, Wildsmith JA; Royal College of Anaesthetists Third National Audit Project. Major complications of central neuraxial block: report on the Third National Audit Project of the Royal College of Anaesthetists. <i>Br J Anaesth</i> 2009;102:179–90.',
    url: 'https://doi.org/10.1093/bja/aen360',
  },
  fettes2009: {
    label: 'Fettes 2009',
    text: 'Fettes PD, Jansson JR, Wildsmith JA. Failed spinal anaesthesia: mechanisms, management, and prevention. <i>Br J Anaesth</i> 2009;102:739–48.',
    url: 'https://doi.org/10.1093/bja/aep096',
  },
  hocking2004: {
    label: 'Hocking 2004',
    text: 'Hocking G, Wildsmith JA. Intrathecal drug spread. <i>Br J Anaesth</i> 2004;93:568–78.',
    url: 'https://doi.org/10.1093/bja/aeh204',
  },
  broadbent2000: {
    label: 'Broadbent 2000',
    text: 'Broadbent CR, Maxwell WB, Ferrie R, Wilson DJ, Gawne-Cain M, Russell R. Ability of anaesthetists to identify a marked lumbar interspace. <i>Anaesthesia</i> 2000;55:1122–6.',
    url: 'https://doi.org/10.1046/j.1365-2044.2000.01547-4.x',
  },
  reynolds2001: {
    label: 'Reynolds 2001',
    text: 'Reynolds F. Damage to the conus medullaris following spinal anaesthesia. <i>Anaesthesia</i> 2001;56:238–47.',
    url: 'https://doi.org/10.1046/j.1365-2044.2001.01422-2.x',
  },
  perlas2016: {
    label: 'Perlas 2016',
    text: 'Perlas A, Chaparro LE, Chin KJ. Lumbar neuraxial ultrasound for spinal and epidural anesthesia: a systematic review and meta-analysis. <i>Reg Anesth Pain Med</i> 2016;41:251–60.',
    url: 'https://doi.org/10.1097/AAP.0000000000000184',
  },
  chin2011: {
    label: 'Chin 2011',
    text: 'Chin KJ, Perlas A, Chan V, Brown-Shreves D, Koshkin A, Vaishnav V. Ultrasound imaging facilitates spinal anesthesia in adults with difficult surface anatomic landmarks. <i>Anesthesiology</i> 2011;115:94–101.',
    url: 'https://doi.org/10.1097/ALN.0b013e31821a8ad4',
  },
  uppal2023: {
    label: 'Uppal 2023',
    text: 'Uppal V, Russell R, Sondekoppam R, Ansari J, Baber Z, Chen Y, et al. Consensus practice guidelines on postdural puncture headache from a multisociety, international working group: a summary report. <i>JAMA Netw Open</i> 2023;6:e2325387.',
    url: 'https://doi.org/10.1001/jamanetworkopen.2023.25387',
  },
  zaric2009: {
    label: 'Zaric 2009',
    text: 'Zaric D, Pace NL. Transient neurologic symptoms (TNS) following spinal anaesthesia with lidocaine versus other local anaesthetics. <i>Cochrane Database Syst Rev</i> 2009;(2):CD003006. (Updated as Forget P, et al. 2019;12:CD003006.)',
    url: 'https://doi.org/10.1002/14651858.CD003006.pub3',
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
  const order = [];
  const num = new Map();
  const seen = new Map();
  const warned = new Set();
  for (const a of document.querySelectorAll('a[data-ref]')) {
    const id = a.dataset.ref;
    if (!registry[id]) {
      a.textContent = '[?]';
      a.setAttribute('aria-label', 'Reference missing');
      a.removeAttribute('href');
      if (!warned.has(id)) { console.warn(`[refs] unknown reference id "${id}"`); warned.add(id); }
      continue;
    }
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
