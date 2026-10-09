// Section 08: Exam questions and self-quiz.
import { el, segmented, details, cite, announce, callout, tier, keyPoints } from '../ui.js?v=1';
import { MCQS, SAQS, TOPICS } from '../quiz/data.js';

export const meta = { id: 'quiz', prefix: 'qz', title: 'Exam questions and self-quiz' };
export const refs = {};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const tierMax = () => Number(document.body.dataset.tierMax) || 3;
const TOPIC_LABEL = Object.fromEntries(TOPICS.map((t) => [t.value, t.label]));
const ICON_OK = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8.5 6.5 12.5 13.5 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
const ICON_BAD = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="2"/></svg>';

/** Number citations rendered after refs.finalise() using the numbers in the reference list. */
function numberCites(node) {
  node.querySelectorAll('a[data-ref]').forEach((a) => {
    const t = document.querySelector(`#ref-${CSS.escape(a.dataset.ref)} .sp-ref-num`);
    const n = t && parseInt(t.textContent, 10);
    if (n) { a.textContent = `[${n}]`; a.setAttribute('aria-label', `Reference ${n}`); }
  });
}

export function mount(root) {
  const state = MCQS.map(() => ({ chosen: null, shown: false }));
  let filter = 'all';

  root.append(
    keyPoints([
      'Choose an answer first, then read the explanation. It links back to the section.',
      'Questions follow the level chosen at the top: MO basics, Resident exam material, Advanced hard cases.',
      'The topic filter works together with the level, and the score counts only the questions you can see.',
      'Safety questions to be sure of: pain on injection, high spinal, weakness returning after a block, wrong-route injection.',
      'Anticoagulation: know the drug, the dose group and the interval before you answer.',
      'In a viva: one-line definition, then recognise, call for help, ABC, specific treatment, follow-up.',
      'Short-answer questions carry marks for each point. Write your answer first, then compare.',
    ]),
    el('p', { class: 'sp-lead', text: `${MCQS.length} single-best-answer questions drawn from this page, then exam-style short-answer and viva questions with model answers. Each question is tagged MO, Resident or Advanced. Nothing is saved; reload to start again.` }),
    el('ul', { class: 'sp-jump', html: '<li><a href="#qz-mcq">Self-quiz</a></li><li><a href="#qz-saq">Short-answer and viva questions</a></li>' }),
  );

  // ------------------------------------------------------------ MCQs
  const mcqSec = el('div', { class: 'qz-sub', id: 'qz-mcq' });
  mcqSec.append(el('h3', { class: 'qz-h3', id: 'qz-mcq-h' }, 'Self-quiz'));
  const toolbar = el('div', { class: 'qz-toolbar' });
  const seg = segmented(TOPICS, { label: 'Filter questions by topic', value: 'all', onChange: (v) => applyFilter(v, true) });
  seg.classList.add('qz-filter');
  toolbar.append(el('p', { class: 'qz-filter-label', id: 'qz-filter-label', text: 'Topic' }), seg);
  mcqSec.append(toolbar);

  const list = el('ol', { class: 'qz-list' });
  const cards = MCQS.map((q, i) => {
    const num = i + 1;
    const id = `qz-q${num}`;
    const card = el('li', { class: 'qz-q', id, dataset: { topic: q.topic } });
    tier(card, q.tier);
    const stemId = `${id}-stem`;
    card.append(el('p', { class: 'qz-meta', text: `Q${num} · ${TOPIC_LABEL[q.topic]}` }));
    card.append(el('p', { class: 'qz-stem', id: stemId, text: q.stem }));
    const group = el('div', { class: 'qz-options', role: 'group', 'aria-labelledby': stemId });
    const btns = q.options.map((opt, j) => {
      const b = el('button', { type: 'button', class: 'qz-opt', dataset: { i: String(j) } },
        el('span', { class: 'qz-letter', 'aria-hidden': 'true', text: LETTERS[j] }),
        el('span', { class: 'qz-opt-text' }, el('span', { class: 'sp-sr', text: `${LETTERS[j]}. ` }), opt),
        el('span', { class: 'qz-opt-mark' }));
      b.addEventListener('click', () => choose(i, j));
      group.append(b);
      return b;
    });
    card.append(group);
    const showBtn = el('button', { type: 'button', class: 'sp-btn qz-show', text: 'Show answer' });
    showBtn.addEventListener('click', () => show(i));
    const result = el('p', { class: 'qz-result', 'aria-live': 'polite' });
    card.append(el('div', { class: 'qz-q-actions' }, showBtn, result));
    const explain = el('div', { class: 'qz-explain', id: `${id}-explain`, tabindex: '-1', hidden: true });
    explain.append(el('p', { class: 'qz-explain-label', text: `Answer: ${LETTERS[q.answer]}` }));
    explain.append(el('p', { class: 'qz-explain-text', html: `${q.explain}${q.refs.length ? cite(...q.refs) : ''}` }));
    if (q.link) explain.append(el('p', { class: 'qz-explain-link', html: `<a href="${q.link}">Read the section</a>` }));
    card.append(explain);
    list.append(card);
    return { card, btns, showBtn, result, explain };
  });
  mcqSec.append(list);
  const empty = el('p', { class: 'qz-empty', hidden: true, text: 'No questions for this topic at this level.' });
  mcqSec.append(empty);

  // score bar (sticky at the bottom of #quiz on small screens)
  const scoreText = el('p', { class: 'qz-score-text', 'aria-live': 'polite' });
  const resetBtn = el('button', { type: 'button', class: 'sp-btn qz-reset', text: 'Reset' });
  resetBtn.addEventListener('click', reset);
  const scoreBar = el('div', { class: 'qz-score', role: 'region', 'aria-label': 'Quiz score' }, scoreText, resetBtn);
  mcqSec.append(scoreBar);
  root.append(mcqSec);

  function paint(i) {
    const q = MCQS[i];
    const s = state[i];
    const c = cards[i];
    const done = s.chosen != null || s.shown;
    c.card.dataset.state = done ? (s.chosen == null ? 'shown' : (s.chosen === q.answer ? 'right' : 'wrong')) : '';
    c.btns.forEach((b, j) => {
      b.disabled = done;
      b.setAttribute('aria-disabled', done ? 'true' : 'false');
      const mark = b.querySelector('.qz-opt-mark');
      mark.innerHTML = '';
      b.classList.remove('qz-opt--correct', 'qz-opt--wrong');
      if (!done) return;
      if (j === q.answer) {
        b.classList.add('qz-opt--correct');
        mark.innerHTML = `${ICON_OK}<span>${s.chosen === j ? 'Correct' : 'Correct answer'}</span>`;
      } else if (s.chosen === j) {
        b.classList.add('qz-opt--wrong');
        mark.innerHTML = `${ICON_BAD}<span>Your answer</span>`;
      }
    });
    c.showBtn.hidden = done;
    c.explain.hidden = !done;
    if (done) numberCites(c.explain);
    if (!done) c.result.textContent = '';
    else if (s.chosen == null) c.result.textContent = 'Answer shown (not scored).';
    else c.result.textContent = s.chosen === q.answer ? 'Correct.' : `Not quite. The answer is ${LETTERS[q.answer]}.`;
  }

  function choose(i, j) {
    if (state[i].chosen != null || state[i].shown) return;
    state[i].chosen = j;
    paint(i);
    updateScore();
    cards[i].explain.focus({ preventScroll: false });
  }
  function show(i) {
    state[i].shown = true;
    paint(i);
    updateScore();
    cards[i].explain.focus({ preventScroll: false });
  }
  function reset() {
    state.forEach((s) => { s.chosen = null; s.shown = false; });
    MCQS.forEach((_, i) => paint(i));
    updateScore();
    announce('Quiz reset.');
    const first = cards.find((c) => !c.card.hidden);
    first?.btns[0].focus();
  }
  function updateScore() {
    const vis = MCQS.map((_, i) => i).filter(isVisible);
    const attempted = vis.filter((i) => state[i].chosen != null).length;
    const right = vis.filter((i) => state[i].chosen === MCQS[i].answer).length;
    scoreText.innerHTML = `Score <span class="sp-num">${right} / ${attempted}</span> <span class="qz-score-sub">· ${attempted} of ${vis.length} answered</span>`;
  }
  function isVisible(i) {
    const q = MCQS[i];
    return (q.tier || 1) <= tierMax() && (filter === 'all' || q.topic === filter);
  }
  function applyFilter(v, user) {
    filter = v;
    seg.set(v);
    let shown = 0;
    cards.forEach((c, i) => {
      const on = isVisible(i);
      c.card.hidden = !on;
      if (on) shown += 1;
    });
    empty.hidden = shown > 0;
    updateScore();
    if (user) announce(`${shown} question${shown === 1 ? '' : 's'} shown: ${TOPIC_LABEL[v]}.`);
  }
  MCQS.forEach((_, i) => paint(i));
  applyFilter('all', false);
  // The global level (body[data-tier-max]) changes which questions count.
  new MutationObserver(() => applyFilter(filter, false)).observe(document.body, { attributes: true, attributeFilter: ['data-tier-max'] });

  // On narrow screens the score bar is sticky at the bottom: keep focused controls clear of it (WCAG 2.4.11).
  mcqSec.addEventListener('focusin', (e) => {
    if (getComputedStyle(scoreBar).position !== 'sticky' || scoreBar.contains(e.target)) return;
    const bar = scoreBar.getBoundingClientRect();
    const r = e.target.getBoundingClientRect();
    if (r.bottom > bar.top - 8 && r.top < bar.bottom) window.scrollBy({ top: r.bottom - bar.top + 16, behavior: 'auto' });
  });

  // ------------------------------------------------------------ SAQs
  const saqSec = el('div', { class: 'qz-sub', id: 'qz-saq' });
  saqSec.append(el('h3', { class: 'qz-h3', id: 'qz-saq-h' }, 'Short-answer and viva questions'));
  saqSec.append(el('p', { class: 'sp-prose', text: 'MMed-style questions. Write or say your answer first, then open the model answer. Each question is tagged MO, Resident or Advanced. Marks are a guide to weighting, not an official scheme.' }));
  SAQS.forEach((s, i) => {
    const total = s.points.reduce((a, p) => a + p[1], 0);
    const body = el('div', { class: 'qz-model' });
    body.append(el('p', { class: 'qz-model-label', text: `Model answer · ${total} marks` }));
    const ol = el('ol', { class: 'qz-points' });
    s.points.forEach(([text, marks, r]) => {
      ol.append(el('li', { class: 'qz-point' },
        el('span', { class: 'qz-point-text', html: `${text}${r?.length ? cite(...r) : ''}` }),
        el('span', { class: 'qz-point-marks', text: `${marks} mark${marks === 1 ? '' : 's'}` })));
    });
    body.append(ol);
    const d = details({ id: s.id, summary: `<span class="qz-saq-head"><span class="qz-saq-n">SAQ ${i + 1} · ${total} marks</span><span class="qz-saq-q">${s.q}</span></span>`, body });
    d.classList.add('qz-saq');
    tier(d, s.tier || 2);
    saqSec.append(d);
  });
  saqSec.append(tier(callout('pearl', { title: 'Viva technique', body: '<p>Start with a one-line definition or classification, then structure the answer (patient, drug, procedure; or recognise, call for help, ABC, specific treatment, follow-up). Examiners reward safe priorities over lists of numbers.</p>' }), 2));
  root.append(saqSec);

  // Opening a deep link to an SAQ opens its model answer.
  const openFromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id.startsWith('qz-saq-')) { const d = document.getElementById(id); if (d && root.contains(d)) d.open = true; }
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  return {
    reveal(hashId) {
      const m = /^qz-q(\d+)/.exec(hashId);
      if (m && filter !== 'all') applyFilter('all', false);
      const t = document.getElementById(hashId);
      if (!t) return false;
      for (let p = t; p; p = p.parentElement) if (p.tagName === 'DETAILS') p.open = true;
      return true;
    },
  };
}
