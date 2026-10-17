// Regional anaesthesia app: the local anaesthetic safe-dose calculator (UI). Maths and data are in la.js; styles in
// css/lacalc.css (prefix lc-). Used by the Dose calculator half of /blocks/safety/. Always MO level (tier 1): doses are safety content.
//
//   mountLaCalc(host, {agent, pct, ml, adr, kg}) → {update()}
//
// Weight, optional height and sex (for lean body weight), then one row per injection or agent (agent, strength %,
// volume ml, adrenaline). Each row shows its mg and its share of that agent's maximum; the total adds the shares up
// (agents are additive) and says in words, not colour alone, whether it is within, close to or over the maximum.
import { el } from './ui.js';
import {
  AGENTS, AGENT_IDS, NOTES, FORMULAS, OBESE_BMI, maxMgPerKg, capMg, mgFromMl, mlForMg,
  doseWeight, combinedFraction, fractionStatus, agentId, round,
} from './la.js';

let uid = 0;
const nextId = () => `lc-${++uid}`;
/** "0,375" or " 20 " → number; '' → null; anything else → NaN. */
function readNum(s) {
  const t = String(s ?? '').trim().replace(',', '.');
  if (!t) return null;
  return /^\d*\.?\d+$/.test(t) || /^\d+\.$/.test(t) ? Number(t) : NaN;
}
const fmt = (x, d = 1) => {
  const r = round(x, d);
  return r == null ? '' : String(r);
};
const pctText = (f) => `${Math.round(f * 100)}%`;

function field({ id, label, unit, hint, value, mode = 'decimal', placeholder = '' }) {
  const input = el('input', { id, class: 'lc-input', type: 'text', inputmode: mode, autocomplete: 'off', spellcheck: 'false', placeholder, value: value ?? '', 'aria-describedby': `${id}-msg` });
  const wrap = el('div', { class: 'lc-field' },
    el('label', { class: 'lc-label', for: id }, label, hint ? el('span', { class: 'lc-hint', text: ` ${hint}` }) : null),
    el('div', { class: 'lc-input-row' }, input, unit ? el('span', { class: 'lc-unit', 'aria-hidden': 'true', text: unit }) : null),
    el('p', { class: 'lc-msg', id: `${id}-msg` }));
  return { wrap, input, msg: wrap.querySelector('.lc-msg') };
}

function setMsg(f, text, bad = false) {
  f.msg.textContent = text || '';
  f.msg.classList.toggle('lc-msg--bad', !!bad);
  if (bad) f.input.setAttribute('aria-invalid', 'true'); else f.input.removeAttribute('aria-invalid');
}

export function mountLaCalc(host, prefill = {}) {
  const root = el('div', { class: 'lc', 'data-tier': '1', 'data-safety': 'dose' });
  const form = el('form', { class: 'lc-form', novalidate: true, autocomplete: 'off' });
  form.addEventListener('submit', (e) => e.preventDefault());

  // ------------------------------------------------------------ patient
  const kg = field({ id: 'lc-kg', label: 'Weight', unit: 'kg', value: prefill.kg ?? '', placeholder: 'e.g. 70' });
  const cm = field({ id: 'lc-cm', label: 'Height', hint: '(optional)', unit: 'cm', placeholder: 'e.g. 170' });
  const sexName = nextId();
  const sexOpts = [['', 'Not given'], ['female', 'Female'], ['male', 'Male']];
  const sex = el('fieldset', { class: 'lc-seg' },
    el('legend', { class: 'lc-label' }, 'Sex ', el('span', { class: 'lc-hint', text: '(optional, for lean body weight)' })),
    el('div', { class: 'lc-seg-row' }, ...sexOpts.map(([v, t], i) => el('label', { class: 'lc-seg-opt' },
      el('input', { type: 'radio', name: sexName, value: v, checked: i === 0 }), el('span', { text: t })))));
  const weightOut = el('div', { class: 'lc-weight', id: 'lc-weight', 'aria-live': 'polite' });
  const patient = el('fieldset', { class: 'lc-box lc-patient' },
    el('legend', { class: 'lc-h' }, '1. The patient'),
    el('div', { class: 'lc-pgrid' }, kg.wrap, cm.wrap, sex),
    weightOut);

  // ------------------------------------------------------------ rows
  const rowsHost = el('ol', { class: 'lc-rows' });
  const rows = [];
  const addBtn = el('button', { type: 'button', class: 'tb-btn lc-add' }, el('span', { 'aria-hidden': 'true', text: '+' }), ' Add another injection or agent');
  const agents = el('fieldset', { class: 'lc-box lc-agents' },
    el('legend', { class: 'lc-h' }, '2. What you plan to give'),
    el('p', { class: 'lc-intro', text: 'One row for each injection or agent: both sides of a bilateral block, a second block, and the surgeon’s infiltration.' }),
    rowsHost, addBtn);

  function addRow(p = {}) {
    const id = nextId();
    const agentSel = el('select', { id: `${id}-agent`, class: 'lc-select', 'aria-describedby': `${id}-agent-msg` },
      el('option', { value: '', text: 'Choose an agent' }),
      ...AGENT_IDS.map((a) => el('option', { value: a, text: AGENTS[a].name })));
    agentSel.value = agentId(p.agent) || '';
    const agentF = { wrap: el('div', { class: 'lc-field lc-field--agent' }, el('label', { class: 'lc-label', for: agentSel.id, text: 'Agent' }), agentSel, el('p', { class: 'lc-msg', id: `${id}-agent-msg` })), input: agentSel };
    agentF.msg = agentF.wrap.querySelector('.lc-msg');
    const listId = `${id}-strengths`;
    const pct = field({ id: `${id}-pct`, label: 'Strength', unit: '%', value: p.pct ?? '', placeholder: 'e.g. 0.375' });
    pct.input.setAttribute('list', listId);
    const datalist = el('datalist', { id: listId });
    pct.wrap.append(datalist);
    const ml = field({ id: `${id}-ml`, label: 'Volume', unit: 'ml', value: p.ml ?? '', placeholder: 'e.g. 20' });
    const adr = el('input', { type: 'checkbox', id: `${id}-adr`, checked: !!p.adr });
    const adrF = el('div', { class: 'lc-field lc-field--adr' }, el('label', { class: 'lc-check', for: adr.id }, adr, el('span', { text: 'With adrenaline' })));
    const title = el('h3', { class: 'lc-row-h' });
    const remove = el('button', { type: 'button', class: 'tb-btn lc-remove' }, 'Remove');
    const out = el('div', { class: 'lc-row-out', id: `${id}-out` });
    const li = el('li', { class: 'lc-row', id },
      el('div', { class: 'lc-row-head' }, title, remove),
      el('div', { class: 'lc-rgrid' }, agentF.wrap, pct.wrap, ml.wrap, adrF),
      out);
    const row = { id, li, agentSel, agentF, pct, ml, adr, title, remove, out, datalist };
    rows.push(row);
    rowsHost.append(li);
    const fillList = () => {
      datalist.textContent = '';
      const a = AGENTS[agentSel.value];
      (a?.strengths || []).forEach((s) => datalist.append(el('option', { value: String(s) })));
    };
    fillList();
    agentSel.addEventListener('change', () => { fillList(); update(); });
    [pct.input, ml.input].forEach((i) => i.addEventListener('input', update));
    adr.addEventListener('change', update);
    remove.addEventListener('click', () => {
      const i = rows.indexOf(row);
      rows.splice(i, 1);
      li.remove();
      update();
      (rows[Math.max(0, i - 1)]?.agentSel || addBtn).focus();
    });
    return row;
  }
  addBtn.addEventListener('click', () => {
    const last = rows[rows.length - 1];
    // A new row starts with the same agent and strength as the last one (the usual case: the other side).
    const r = addRow(last ? { agent: last.agentSel.value, pct: last.pct.input.value, adr: last.adr.checked } : {});
    update();
    r.ml.input.focus();
  });

  // ------------------------------------------------------------ total
  const total = el('section', { class: 'lc-total', 'aria-labelledby': 'lc-total-h' });
  const totalStatus = el('div', { class: 'lc-total-status', role: 'status', 'aria-live': 'polite', 'aria-atomic': 'true' });
  const meterFill = el('span', { class: 'lc-meter-fill' });
  const meter = el('div', { class: 'lc-meter', 'aria-hidden': 'true' }, meterFill, el('span', { class: 'lc-meter-max' }));
  const meterScale = el('div', { class: 'lc-meter-scale', 'aria-hidden': 'true' }, el('span', { text: '0' }), el('span', { text: 'Maximum' }));
  total.append(el('h2', { class: 'lc-h lc-total-h', id: 'lc-total-h', text: '3. Total against the maximum' }), totalStatus, meter, meterScale);

  // ------------------------------------------------------------ notes and formulas
  const notes = el('section', { class: 'lc-notes', 'aria-labelledby': 'lc-notes-h' },
    el('h2', { class: 'lc-h', id: 'lc-notes-h', text: 'Before you give it' }),
    el('ul', { class: 'lc-notes-list' }, ...NOTES.map((n) => el('li', { text: n }))),
    el('p', { class: 'lc-topical' }, 'Topical lidocaine for awake intubation has its own limit (9 mg/kg of lean body weight): ',
      el('a', { href: '../../head-neck/airway/#ch-topical' }, 'see airway topicalisation'), '. This calculator is for injected doses.'));
  const table = el('table', { class: 'lc-table' },
    el('caption', { text: 'Maximum single doses used here (adult, by injection). The lower of the two limits applies.' }),
    el('thead', {}, el('tr', {}, ...['Agent', 'Plain', 'With adrenaline'].map((t) => el('th', { scope: 'col', text: t })))),
    el('tbody', {}, ...AGENT_IDS.map((a) => {
      const x = AGENTS[a];
      const cell = (i) => `${x.mgPerKg[i]} mg/kg, at most ${x.capMg[i]} mg`;
      return el('tr', {}, el('th', { scope: 'row', text: x.name }), el('td', { text: cell(0) }), el('td', { text: x.mgPerKg[1] === x.mgPerKg[0] && x.capMg[1] === x.capMg[0] ? 'Same as plain' : cell(1) }));
    })));
  const how = el('details', { class: 'tb-details lc-how' },
    el('summary', { text: 'How it is worked out' }),
    el('div', { class: 'tb-details-body' },
      el('div', { class: 'lc-table-wrap' }, table),
      el('ul', { class: 'lc-formulas' }, ...Object.values(FORMULAS).map((f) => el('li', { text: f })))));

  form.append(patient, agents);
  root.append(form, total, notes, how);
  host.append(root);

  // ------------------------------------------------------------ compute + paint
  function readPatient() {
    const k = readNum(kg.input.value);
    const h = readNum(cm.input.value);
    const s = form.querySelector(`input[name="${sexName}"]:checked`)?.value || '';
    if (k == null) setMsg(kg, '');
    else if (!(k >= 0.5 && k <= 300)) setMsg(kg, 'Enter the weight in kg, between 0.5 and 300.', true);
    else setMsg(kg, '');
    if (h == null) setMsg(cm, '');
    else if (!(h >= 40 && h <= 250)) setMsg(cm, 'Enter the height in cm, between 40 and 250.', true);
    else setMsg(cm, '');
    const kgOk = k != null && k >= 0.5 && k <= 300 ? k : null;
    const cmOk = h != null && h >= 40 && h <= 250 ? h : null;
    return doseWeight({ kg: kgOk, cm: cmOk, sex: s });
  }

  function paintWeight(w) {
    weightOut.textContent = '';
    if (w.kg == null) {
      weightOut.append(el('p', { class: 'lc-weight-line', text: 'Enter the weight to see the maximum for this patient.' }));
      return;
    }
    const why = w.basis === 'lean' ? `lean body weight: the BMI is ${fmt(w.bmi)}, which is ${OBESE_BMI} or more` : 'actual weight';
    weightOut.append(el('p', { class: 'lc-weight-line' }, 'Weight used for the maximum: ', el('strong', { class: 'lc-mono', text: `${fmt(w.kg)} kg` }), ` (${why}).`));
    const extra = [];
    if (w.bmi != null && w.basis !== 'lean') extra.push(`BMI ${fmt(w.bmi)}`);
    if (w.lbw != null && w.basis !== 'lean') extra.push(`lean body weight ${fmt(w.lbw)} kg`);
    if (w.ibw != null) extra.push(`ideal body weight ${fmt(w.ibw)} kg`);
    if (extra.length) { const t = extra.join(' · '); weightOut.append(el('p', { class: 'lc-weight-more', text: `${t[0].toUpperCase()}${t.slice(1)}.` })); }
    if (w.needsHeight) weightOut.append(el('p', { class: 'lc-weight-warn' }, el('strong', { text: 'Check for obesity: ' }), 'add height and sex. In obesity the maximum comes from lean body weight, which is lower.'));
    if (w.actual < 10) weightOut.append(el('p', { class: 'lc-weight-warn' }, el('strong', { text: 'Small child or infant: ' }), 'these are adult limits. Use a paediatric reference and senior advice, and give less in infants under 6 months.'));
  }

  function update() {
    const w = readPatient();
    paintWeight(w);
    rows.forEach((r, i) => {
      r.title.textContent = `Injection ${i + 1}`;
      r.remove.hidden = rows.length < 2;
      r.remove.setAttribute('aria-label', `Remove injection ${i + 1}`);
    });
    const input = rows.map((r) => {
      const p = readNum(r.pct.input.value);
      const v = readNum(r.ml.input.value);
      if (p == null) setMsg(r.pct, '');
      else if (!(p > 0 && p <= 10)) setMsg(r.pct, 'Strength is a percentage, for example 0.375 (between 0 and 10).', true);
      else setMsg(r.pct, `${fmt(p * 10, 2)} mg/ml`);
      if (v == null) setMsg(r.ml, '');
      else if (!(v >= 0 && v <= 500)) setMsg(r.ml, 'Enter the volume in ml, up to 500.', true);
      else setMsg(r.ml, '');
      return { agent: r.agentSel.value, percent: p > 0 && p <= 10 ? p : null, ml: v >= 0 && v <= 500 ? v : null, adrenaline: r.adr.checked };
    });
    const res = combinedFraction(input, w.kg);
    rows.forEach((r, i) => paintRow(r, input[i], res.rows[i], w));
    paintTotal(res, w, input);
  }

  function paintRow(r, inp, x, w) {
    r.out.textContent = '';
    r.li.classList.remove('lc-row--over');
    const a = AGENTS[inp.agent];
    if (!a) { r.out.append(el('p', { class: 'lc-row-line lc-muted', text: 'Choose an agent.' })); return; }
    const mg = mgFromMl(inp.ml, inp.percent);
    const perKg = maxMgPerKg(inp.agent, inp.adrenaline);
    const limit = `${perKg} mg/kg${inp.adrenaline && a.mgPerKg[1] !== a.mgPerKg[0] ? ' with adrenaline' : ''}, at most ${capMg(inp.agent, inp.adrenaline)} mg`;
    if (mg == null) {
      r.out.append(el('p', { class: 'lc-row-line lc-muted', text: `Add the strength and volume. ${a.name} maximum: ${limit}.` }));
    } else if (x?.max == null) {
      r.out.append(el('p', { class: 'lc-row-line' }, el('strong', { class: 'lc-mono', text: `${fmt(mg)} mg` }), ` of ${a.name.toLowerCase()}. Enter the weight to compare it with the maximum (${limit}).`));
    } else {
      const over = x.fraction > 1;
      r.li.classList.toggle('lc-row--over', over);
      r.out.append(el('p', { class: 'lc-row-line' },
        el('strong', { class: 'lc-mono', text: `${fmt(mg)} mg` }),
        ` = ${pctText(x.fraction)} of the ${fmt(x.max)} mg maximum for ${a.name.toLowerCase()}`,
        ` (${limit}${x.capped ? '; the ceiling applies at this weight' : ''}).`));
      if (over) r.out.append(el('p', { class: 'lc-row-over' }, el('strong', { text: 'Over the maximum ' }), `for ${a.name.toLowerCase()} on its own.`));
      if (inp.percent) {
        const maxMl = mlForMg(x.max, inp.percent);
        r.out.append(el('p', { class: 'lc-row-more', text: `On its own, the most you could give is ${fmt(maxMl)} ml of ${fmt(inp.percent, 3)}% ${a.name.toLowerCase()}.` }));
      }
    }
    if (inp.adrenaline && a.mgPerKg[1] === a.mgPerKg[0]) r.out.append(el('p', { class: 'lc-row-more', text: `Adrenaline does not raise the maximum for ${a.name.toLowerCase()} here.` }));
    void w;
  }

  function paintTotal(res, w) {
    totalStatus.textContent = '';
    const st = w.kg == null ? 'none' : fractionStatus(res.total, res.valid);
    total.dataset.status = st;
    const pct = Math.round(res.total * 100);
    meterFill.style.width = `${Math.min(100, res.total * 100)}%`;
    if (w.kg == null) {
      totalStatus.append(el('p', { class: 'lc-total-line', text: 'Enter the weight to compare the total with the maximum.' }));
      return;
    }
    if (!res.valid) {
      totalStatus.append(el('p', { class: 'lc-total-line', text: 'Choose an agent and add its strength and volume.' }));
      return;
    }
    const agentsUsed = new Set(res.rows.filter((r) => r.fraction != null).map((r) => r.agent));
    const big = el('p', { class: 'lc-total-v' }, el('span', { class: 'lc-mono', text: `${pct}%` }), ' of the maximum');
    totalStatus.append(big);
    if (agentsUsed.size > 1 || res.valid > 1) {
      totalStatus.append(el('p', { class: 'lc-total-line', text: agentsUsed.size > 1
        ? 'Different agents add up: each one’s share of its own maximum is added together.'
        : 'All the injections are added together against one maximum.' }));
    }
    const verdict = {
      ok: ['Within the maximum. ', 'Keep the remaining room in mind if more local anaesthetic may be given later.'],
      near: ['Close to the maximum (80% or more). ', 'Check every number again and leave room for the surgeon’s infiltration. Reduce the dose in the elderly, frail or unwell.'],
      over: ['Over the maximum. Do not give this. ', 'Reduce the volume or the concentration, or leave out a block.'],
    }[st];
    totalStatus.append(el('p', { class: `lc-verdict lc-verdict--${st}` },
      el('span', { class: 'lc-verdict-icon', 'aria-hidden': 'true', text: st === 'ok' ? '✓' : '!' }),
      el('span', {}, el('strong', { text: verdict[0] }), verdict[1])));
  }

  [kg.input, cm.input].forEach((i) => i.addEventListener('input', update));
  sex.addEventListener('change', update);

  addRow({ agent: prefill.agent, pct: prefill.pct, ml: prefill.ml, adr: prefill.adr });
  update();
  return { update, root };
}
