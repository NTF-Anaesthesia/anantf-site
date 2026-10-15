// Content blocks (CONTENT.md, "Blocks") → HTML, and wire() for the interactive ones (checklists, check-yourself,
// drug cards and calculators drawn inside a topic).
import { md, esc } from './md.js';
import { getChecks, setCheck, setQuiz, getQuiz } from './store.js';
import { FIGURES } from './figures.js';

const CALLOUT = { stop: 'Stop', warn: 'Caution', local: 'At NTFGH', tip: 'Tip', note: 'Note', key: 'Key point' };
let uid = 0;
const nid = p => `${p}-${++uid}`;

export function renderBlocks(blocks = [], ctx = {}) {
  return blocks.map(b => block(b, ctx)).join('');
}

function items(list, tag = 'ul', cls = '') {
  return `<${tag}${cls ? ` class="${cls}"` : ''}>${(list || []).map(t => `<li>${md(t)}</li>`).join('')}</${tag}>`;
}

function block(b, ctx) {
  switch (b.t) {
    case 'key':
      return `<section class="keypts" aria-labelledby="${ctx.kid = nid('k')}"><h2 class="kicker" id="${ctx.kid}">Key points</h2>${items(b.items)}</section>`;
    case 'p': return `<p>${md(b.text)}</p>`;
    case 'h': return `<h2 class="sub">${md(b.text)}</h2>`;
    case 'list': return items(b.items, b.ordered ? 'ol' : 'ul', 'list');
    case 'steps':
      return `<ol class="steps">${(b.items || []).map(s => typeof s === 'string' ? `<li>${md(s)}</li>` : `<li><strong>${md(s.title)}</strong>${s.text ? ` ${md(s.text)}` : ''}</li>`).join('')}</ol>`;
    case 'table': return table(b);
    case 'callout': {
      const k = CALLOUT[b.kind] ? b.kind : 'note';
      return `<div class="callout ${k}" role="note"><p class="callout-t">${b.title ? md(b.title) : CALLOUT[k]}</p>${b.text ? `<p>${md(b.text)}</p>` : ''}${b.items ? items(b.items) : ''}</div>`;
    }
    case 'dl': return `<dl class="dl">${(b.items || []).map(i => `<dt>${md(i.term)}</dt><dd>${md(i.def)}</dd>`).join('')}</dl>`;
    case 'script':
      return `<figure class="script"><figcaption>${md(b.title || 'Say')}</figcaption>${(b.lines || []).map(l => `<p>${md(l)}</p>`).join('')}</figure>`;
    case 'compare':
      return `<div class="compare c${(b.cols || []).length}">${(b.cols || []).map(c => `<div><h3>${md(c.title)}</h3>${items(c.items)}</div>`).join('')}</div>`;
    case 'check': return check(b);
    case 'quiz': return quiz(b);
    case 'drug': return `<div class="embed drug-embed" data-drug="${esc(b.id)}"></div>`;
    case 'drugs': return `<div class="embed drugtable" data-drugs="${esc((b.ids || []).join(' '))}" data-title="${esc(b.title || '')}"></div>`;
    case 'tool': return `<div class="embed tool-embed" data-tool="${esc(b.id)}"></div>`;
    case 'crisis': return `<div class="embed crisis-link" data-crisis="${esc(b.id)}"></div>`;
    case 'scenario': return `<div class="embed scen-link" data-scenario="${esc(b.id)}"></div>`;
    case 'figure': {
      const f = FIGURES[b.id];
      return f ? `<figure class="fig">${f.svg}<figcaption>${md(b.caption || f.caption || '')}</figcaption></figure>` : '';
    }
    case 'details':
      return `<details class="more"><summary>${md(b.title || 'More')}</summary><div class="more-body">${renderBlocks(b.blocks, ctx)}</div></details>`;
    case 'links':
      return `<nav class="links" aria-label="${esc(b.title || 'Related')}"><h2 class="kicker">${esc(b.title || 'Related')}</h2><ul>${(b.items || []).map(l => `<li>${md(`[${l.text}](${l.href})`)}${l.note ? ` <span class="muted">${md(l.note)}</span>` : ''}</li>`).join('')}</ul></nav>`;
    default: return '';
  }
}

export function table(b) {
  const cap = b.caption ? `<caption>${md(b.caption)}</caption>` : '';
  const head = b.head ? `<thead><tr>${b.head.map(h => `<th scope="col">${md(h)}</th>`).join('')}</tr></thead>` : '';
  const rows = (b.rows || []).map(r => `<tr>${r.map((c, i) => i === 0 && b.rowHead ? `<th scope="row">${md(c)}</th>` : `<td>${md(c)}</td>`).join('')}</tr>`).join('');
  const label = b.caption ? ` aria-label="${esc(b.caption.replace(/[*`[\]]/g, ''))}"` : '';
  return `<div class="tablewrap" role="region" tabindex="0"${label || ' aria-label="Table"'}><table>${cap}${head}<tbody>${rows}</tbody></table></div>`;
}

function check(b) {
  const done = new Set(getChecks(b.id));
  const n = (b.items || []).length;
  return `<fieldset class="check" data-check="${esc(b.id)}"><legend>${md(b.title || 'Checklist')}</legend>${(b.items || []).map((t, i) => {
    const id = `${b.id}-${i}`;
    return `<label class="tick" for="${esc(id)}"><input type="checkbox" id="${esc(id)}" data-i="${i}"${done.has(i) ? ' checked' : ''}><span>${md(t)}</span></label>`;
  }).join('')}<p class="check-count" aria-live="polite">${done.size} of ${n} done</p></fieldset>`;
}

function quiz(b) {
  return `<section class="quiz" data-quiz="${esc(b.id)}"><h2 class="kicker">Check yourself</h2>${(b.items || []).map((q, i) => quizItem(b.id, q, i)).join('')}</section>`;
}

export function quizItem(qid, q, i) {
  const multi = Array.isArray(q.answer);
  const name = `${qid}-${i}`;
  const prev = getQuiz(`${qid}:${i}`);
  return `<form class="qitem" data-q="${i}" data-quizid="${esc(qid)}" novalidate><fieldset><legend><span class="qn">${i + 1}</span> ${md(q.q)}${multi ? ' <span class="muted">(choose all that apply)</span>' : ''}</legend>${q.options.map((o, j) => `<label class="qopt"><input type="${multi ? 'checkbox' : 'radio'}" name="${esc(name)}" value="${j}"><span>${md(o)}</span></label>`).join('')}</fieldset><div class="qrow"><button type="submit" class="btn">Check answer</button>${prev ? `<span class="muted small">Last time: ${prev.ok ? 'right' : 'not quite'}</span>` : ''}</div><div class="qfb" role="status" aria-live="polite"></div></form>`;
}

/** Mark a check-yourself answer and show the explanation. */
export function markQuiz(form, q) {
  const picked = [...form.querySelectorAll('input:checked')].map(x => +x.value).sort((a, b) => a - b);
  const fb = form.querySelector('.qfb');
  if (!picked.length) { fb.className = 'qfb warn'; fb.innerHTML = '<p>Choose an answer first.</p>'; return null; }
  const want = (Array.isArray(q.answer) ? q.answer : [q.answer]).slice().sort((a, b) => a - b);
  const ok = want.length === picked.length && want.every((v, i) => v === picked[i]);
  form.querySelectorAll('.qopt').forEach((l, j) => {
    l.classList.toggle('right', want.includes(j));
    l.classList.toggle('wrong', picked.includes(j) && !want.includes(j));
  });
  fb.className = 'qfb ' + (ok ? 'ok' : 'no');
  fb.innerHTML = `<p><strong>${ok ? 'Right.' : 'Not quite.'}</strong> ${want.length > 1 ? 'The answers are' : 'The answer is'}: ${want.map(j => md(q.options[j])).join('; ')}.</p>${q.explain ? `<p>${md(q.explain)}</p>` : ''}`;
  return ok;
}

/** Wire the interactive blocks inside root. `quizzes` maps quiz id → items; `mount` fills embeds (drugs, tools, links). */
export function wire(root, { quizzes = {}, mount } = {}) {
  root.querySelectorAll('fieldset.check').forEach(fs => {
    const id = fs.dataset.check, n = fs.querySelectorAll('input').length;
    fs.addEventListener('change', e => {
      const box = e.target.closest('input[type=checkbox]'); if (!box) return;
      setCheck(id, +box.dataset.i, box.checked);
      fs.querySelector('.check-count').textContent = `${fs.querySelectorAll('input:checked').length} of ${n} done`;
    });
  });
  root.querySelectorAll('form.qitem').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const q = quizzes[form.dataset.quizid]?.[+form.dataset.q]; if (!q) return;
      const ok = markQuiz(form, q);
      if (ok != null) setQuiz(`${form.dataset.quizid}:${form.dataset.q}`, ok);
    });
  });
  if (mount) mount(root);
}

/** All quiz blocks in a list of blocks (including inside details), as { id: items }. */
export function collectQuizzes(blocks, out = {}) {
  for (const b of blocks || []) {
    if (b.t === 'quiz') out[b.id] = b.items;
    if (b.t === 'details') collectQuizzes(b.blocks, out);
  }
  return out;
}
