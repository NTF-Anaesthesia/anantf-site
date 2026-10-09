// Interactive widgets for the technique section. Owner: B3. State lives in memory only.
import { el, esc, cite, announce, segmented, table } from '../ui.js?v=1';
import { GROUPS, DRUGS } from './anticoag-data.js';

// ------------------------------------------------------------------ anticoagulant lookup
export function anticoagLookup() {
  const wrap = el('div', { class: 'tq-ac', id: 'tq-ac-lookup' });
  const selId = 'tq-ac-select';
  const select = el('select', { id: selId, class: 'tq-select' });
  select.append(el('option', { value: '', text: 'Choose a drug…' }));
  for (const g of GROUPS) {
    const og = el('optgroup', { label: g });
    DRUGS.filter((d) => d.group === g).forEach((d) => og.append(el('option', { value: d.id, text: d.name })));
    select.append(og);
  }
  const field = el('div', { class: 'tq-field' },
    el('label', { for: selId, class: 'tq-label', text: 'Drug the patient takes' }),
    select);
  const out = el('div', { class: 'tq-ac-out', 'aria-live': 'polite' });

  function col(title, sub, d, cls) {
    return el('div', { class: `tq-ac-col ${cls}` },
      el('p', { class: 'tq-ac-src', html: title }),
      sub ? el('p', { class: 'tq-ac-srcsub', text: sub }) : null,
      el('dl', { class: 'tq-ac-dl' },
        el('dt', { text: 'Last dose → spinal' }), el('dd', { class: 'tq-ac-val', text: d.stop }),
        el('dt', { text: 'Spinal → next dose' }), el('dd', { text: d.next })));
  }

  function render(id) {
    out.textContent = '';
    const d = DRUGS.find((x) => x.id === id);
    if (!d) {
      out.append(el('p', { class: 'tq-ac-empty', text: 'Pick a drug to see the minimum intervals from both guidelines side by side.' }));
      return;
    }
    const head = el('div', { class: 'tq-ac-head' },
      el('p', { class: 'tq-ac-name', text: d.name }),
      d.dose ? el('p', { class: 'tq-ac-dose', text: d.dose }) : null);
    const grid = el('div', { class: 'tq-ac-grid' },
      col(`ASRA 2025${cite('asra2025')}`, 'From published summary — verify against full text', d.asra, 'tq-ac-col--asra'),
      col(`ESAIC/ESRA 2022${cite('esaic2022')}`, 'Full text', d.esaic, 'tq-ac-col--esaic'));
    out.append(head, grid);
    const notes = [];
    if (d.renal) notes.push('<strong>Renal function matters here.</strong> Check creatinine clearance (CrCl); the interval gets longer when it is low.');
    if (d.note) notes.push(esc(d.note));
    if (notes.length) out.append(el('ul', { class: 'tq-ac-notes' }, ...notes.map((n) => el('li', { html: n }))));
    announce(`${d.name}. ASRA 2025: last dose to spinal ${d.asra.stop}. ESAIC/ESRA 2022: ${d.esaic.stop}.`);
    // citations added after finalise() need numbering: copy numbers from existing links if present
    renumber(out);
  }
  select.addEventListener('change', () => render(select.value));
  wrap.append(field, out);
  render('');
  return { node: wrap, select: (id) => { select.value = id; render(id); } };
}

// Citations created after refs.finalise() still show "[?]": copy the number from an already-numbered link.
function renumber(scope) {
  scope.querySelectorAll('a[data-ref]').forEach((a) => {
    const done = document.querySelector(`a[data-ref="${a.dataset.ref}"][aria-label^="Reference "]`);
    if (done && done !== a) { a.textContent = done.textContent; a.setAttribute('aria-label', done.getAttribute('aria-label')); }
  });
}

/** Full stacked table of every drug, both guidelines. */
export function anticoagTable() {
  const rows = DRUGS.map((d) => [
    { th: true, html: `${esc(d.name)}${d.dose ? `<span class="tq-cell-sub">${esc(d.dose)}</span>` : ''}` },
    esc(d.asra.stop),
    esc(d.asra.next),
    esc(d.esaic.stop),
    esc(d.esaic.next),
  ]);
  return table({
    caption: `Minimum intervals around a spinal: ASRA 2025 (from published summary — verify against full text)${cite('asra2025')} and ESAIC/ESRA 2022${cite('esaic2022')}`,
    head: ['Drug', 'ASRA: last dose → spinal', 'ASRA: spinal → next dose', 'ESAIC/ESRA: last dose → spinal', 'ESAIC/ESRA: spinal → next dose'],
    rows,
    id: 'tq-ac-table',
    className: 'tq-ac-table',
  });
}

// ------------------------------------------------------------------ preparation checklist
export function checklist(items) {
  const box = el('div', { class: 'tq-check', id: 'tq-checklist' });
  const status = el('p', { class: 'tq-check-status', 'aria-live': 'polite' });
  const list = el('ul', { class: 'tq-check-list' });
  const boxes = [];
  items.forEach((it, i) => {
    const id = `tq-ck-${i}`;
    const input = el('input', { type: 'checkbox', id, class: 'tq-check-input' });
    boxes.push(input);
    list.append(el('li', { class: 'tq-check-item' },
      input,
      el('label', { for: id, class: 'tq-check-label', html: it })));
  });
  const reset = el('button', { type: 'button', class: 'sp-btn tq-check-reset', text: 'Clear ticks' });
  const paint = () => {
    const n = boxes.filter((b) => b.checked).length;
    status.textContent = n === boxes.length ? `All ${n} checked. Ready to start.` : `${n} of ${boxes.length} checked`;
    box.dataset.done = String(n === boxes.length);
  };
  list.addEventListener('change', paint);
  reset.addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; }); paint(); boxes[0]?.focus(); });
  box.append(el('div', { class: 'tq-check-top' }, el('p', { class: 'tq-check-title', text: 'Before you start' }), status), list, reset);
  paint();
  return box;
}

// ------------------------------------------------------------------ factors affecting spread
export function spreadFactors(factors) {
  const box = el('div', { class: 'tq-spread', id: 'tq-spread' });
  const list = el('ol', { class: 'tq-spread-list' });
  const seg = segmented([
    { value: 'all', label: 'All factors' },
    { value: 'you', label: 'You can change' },
    { value: 'pt', label: 'Patient factors' },
  ], { label: 'Filter the factors', value: 'all', onChange: (v) => paint(v) });
  const items = factors.map((f, i) => {
    const bodyId = `tq-spread-b${i}`;
    const btn = el('button', { type: 'button', class: 'tq-spread-btn', 'aria-expanded': 'false', 'aria-controls': bodyId },
      el('span', { class: 'tq-spread-rank', text: f.rank }),
      el('span', { class: 'tq-spread-name', text: f.name }),
      el('span', { class: 'tq-spread-meter', 'aria-hidden': 'true' }, ...[1, 2, 3].map((n) => el('span', { class: n <= f.weight ? 'tq-on' : '' }))),
      el('span', { class: 'tq-spread-who', text: f.who === 'you' ? 'You' : 'Patient' }));
    const body = el('div', { class: 'tq-spread-body', id: bodyId, hidden: true, html: f.body });
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
    });
    const li = el('li', { class: 'tq-spread-item', dataset: { who: f.who } }, btn, body);
    list.append(li);
    return li;
  });
  const count = el('p', { class: 'sp-sr', 'aria-live': 'polite' });
  function paint(v) {
    let n = 0;
    items.forEach((li) => { const show = v === 'all' || li.dataset.who === v; li.hidden = !show; if (show) n += 1; });
    count.textContent = `${n} factors shown`;
  }
  box.append(el('div', { class: 'tq-spread-bar' }, seg,
    el('p', { class: 'tq-spread-key', html: '<span class="tq-spread-meter" aria-hidden="true"><span class="tq-on"></span><span class="tq-on"></span><span class="tq-on"></span></span> strength of effect' })),
  list, count);
  return box;
}

// ------------------------------------------------------------------ block check
const LEVELS = [
  { v: 3, label: 'T3 or higher' }, { v: 4, label: 'T4 (nipple line)' }, { v: 5, label: 'T5' }, { v: 6, label: 'T6 (xiphisternum)' },
  { v: 7, label: 'T7' }, { v: 8, label: 'T8' }, { v: 9, label: 'T9' }, { v: 10, label: 'T10 (umbilicus)' },
  { v: 11, label: 'T11' }, { v: 12, label: 'T12' }, { v: 13, label: 'L1 or lower' },
];
const name = (v) => (v <= 3 ? 'T3 or higher' : v >= 13 ? 'L1 or lower' : `T${v}`);

export function blockCheck(ops) {
  const box = el('div', { class: 'tq-bc', id: 'tq-blockcheck' });
  let op = ops[0].id;
  let level = 10;
  let bromage = 2;
  let time = 'early';

  const opSeg = segmented(ops.map((o) => ({ value: o.id, label: o.label })), { label: 'Operation', value: op, onChange: (v) => { op = v; update(); } });
  const lvlId = 'tq-bc-level';
  const lvl = el('select', { id: lvlId, class: 'tq-select' }, ...LEVELS.map((l) => el('option', { value: String(l.v), text: l.label })));
  lvl.value = String(level);
  lvl.addEventListener('change', () => { level = Number(lvl.value); update(); });
  const brSeg = segmented([0, 1, 2, 3].map((n) => ({ value: n, label: String(n) })), { label: 'Modified Bromage score', value: bromage, onChange: (v) => { bromage = Number(v); update(); } });
  const tSeg = segmented([
    { value: 'early', label: 'Under 10 min' }, { value: 'mid', label: '10–20 min' }, { value: 'late', label: 'Over 20 min' },
  ], { label: 'Time since injection', value: time, onChange: (v) => { time = v; update(); } });

  const out = el('div', { class: 'tq-bc-out', 'aria-live': 'polite' });
  const grp = (label, ctrl, hint, forId) => el('div', { class: 'tq-bc-row' },
    forId ? el('label', { class: 'tq-label', for: forId, text: label }) : el('p', { class: 'tq-label', text: label }),
    ctrl, hint ? el('p', { class: 'tq-hint', html: hint }) : null);

  box.append(
    grp('Operation', opSeg),
    grp('Pinprick level (use the lower of the two sides)', lvl, null, lvlId),
    grp('Modified Bromage score', brSeg, '0 = lifts a straight leg … 3 = cannot move foot or knee (version in the table above).'),
    grp('Time since injection', tSeg),
    out,
  );

  let first = true;
  function update() {
    const o = ops.find((x) => x.id === op);
    const gap = level - o.target; // >0 means the block is lower than the target
    let tone; let label; let text;
    if (gap <= 0) {
      tone = 'ok'; label = 'Level reached';
      text = `${name(level)} reaches the commonly quoted target of ${name(o.target)} for ${o.label === 'TURP' ? 'TURP' : `${o.label.toLowerCase()} surgery`}.`;
      if (bromage === 0) { tone = 'warn'; label = 'Check again'; text += ' But there is no motor block yet. Check that the block is dense and on both sides before the surgeon starts.'; }
    } else if (time !== 'late') {
      tone = 'warn'; label = 'Not there yet';
      text = `${name(level)} is ${gap} segment${gap > 1 ? 's' : ''} below the target of ${name(o.target)}. Hyperbaric bupivacaine can still be spreading: recheck in a few minutes before deciding.`;
    } else {
      tone = 'danger'; label = 'Inadequate so far';
      text = `${name(level)} after 20 minutes is ${gap} segment${gap > 1 ? 's' : ''} below the target of ${name(o.target)}, and it is unlikely to rise much more. Tell the surgeon and your senior, and plan: see <a href="#troubleshooting">Troubleshooting</a>.`;
    }
    out.textContent = '';
    out.dataset.tone = tone;
    out.append(el('p', { class: 'tq-bc-verdict', text: label }), el('p', { class: 'tq-bc-text', html: text }));
    if (level <= 4) {
      out.append(el('p', { class: 'tq-bc-high', html: '<strong>High block.</strong> At T4 or above, expect more hypotension and bradycardia. Watch breathing, speech and hand strength. See <a href="#complications">Complications</a>.' }));
    }
    out.append(el('p', { class: 'tq-bc-why', text: o.why }));
    if (!first) announce(`${label}. ${text.replace(/<[^>]+>/g, '')}`);
    first = false;
  }
  update();
  return box;
}
