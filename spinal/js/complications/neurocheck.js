// Interactive post-spinal neurological check. Five yes/no questions; any "yes" is a red flag.
// Uses native radio buttons in fieldsets for keyboard and screen-reader support.

import { el, announce, cite } from '../ui.js?v=1';

const QUESTIONS = [
  {
    id: 'block',
    q: 'Has the block lasted longer than the drug and dose explain, or spread or returned after it had started to wear off?',
    hint: 'Compare with the expected duration for what was given. A block that comes back is never “expected”.',
  },
  { id: 'back', q: 'Is there new or increasing back pain (not wound pain)?' },
  {
    id: 'legs',
    q: 'Is there new or worsening weakness or numbness of the legs, or is one side clearly worse than the other?',
    hint: 'Motor block is often the first sign, before pain.',
  },
  {
    id: 'sphincter',
    q: 'Are there bowel or bladder symptoms that the block no longer explains, such as incontinence or saddle numbness?',
    hint: 'Simple urinary retention while the block is still working is common; this question is about symptoms that do not fit.',
  },
  { id: 'infection', q: 'Is there fever, or redness or tenderness at the puncture site, with back pain or a headache?' },
];

let n = 0;

/** Build the check. Returns the root element. */
export function neuroCheck({ id = 'cx-neuro-check' } = {}) {
  n += 1;
  const answers = new Map();
  const root = el('div', { class: 'cx-check', id });
  root.append(
    el('p', { class: 'cx-check-kicker', text: 'Interactive · post-spinal neuro check' }),
    el('p', { class: 'cx-check-intro', text: 'Answer each question for the patient in front of you. One “yes” is enough to act on.' }),
  );
  const list = el('ol', { class: 'cx-check-list' });
  QUESTIONS.forEach((item, i) => {
    const name = `cx-nc${n}-${item.id}`;
    const legendId = `${name}-q`;
    const fs = el('fieldset', { class: 'cx-check-q' });
    const lg = el('legend', { class: 'cx-check-legend', id: legendId },
      el('span', { class: 'cx-check-n', 'aria-hidden': 'true', text: String(i + 1) }),
      el('span', { class: 'cx-check-text', text: item.q }));
    fs.append(lg);
    if (item.hint) fs.append(el('p', { class: 'cx-check-hint', text: item.hint }));
    const opts = el('div', { class: 'cx-check-opts' });
    ['yes', 'no'].forEach((v) => {
      const input = el('input', { type: 'radio', name, value: v, class: 'cx-check-radio', id: `${name}-${v}` });
      input.addEventListener('change', () => { answers.set(item.id, v); update(true); });
      opts.append(el('label', { class: 'cx-check-opt', for: `${name}-${v}` }, input, el('span', { text: v === 'yes' ? 'Yes' : 'No' })));
    });
    fs.append(opts);
    list.append(el('li', { class: 'cx-check-item' }, fs));
  });
  root.append(list);

  const result = el('div', { class: 'cx-check-result', 'aria-live': 'polite' });
  const clear = el('button', { type: 'button', class: 'sp-btn cx-check-clear', text: 'Clear answers' });
  clear.addEventListener('click', () => {
    answers.clear();
    root.querySelectorAll('input[type=radio]').forEach((r) => { r.checked = false; });
    update(false);
    root.querySelector('input[type=radio]')?.focus();
    announce('Answers cleared.');
  });
  root.append(result, el('div', { class: 'cx-check-actions' }, clear));

  function update(user) {
    result.textContent = '';
    const yes = QUESTIONS.filter((q) => answers.get(q.id) === 'yes');
    const answered = answers.size;
    root.dataset.state = '';
    if (yes.length) {
      root.dataset.state = 'red';
      const box = el('div', { class: 'cx-check-out cx-check-out--red' });
      box.append(el('p', { class: 'cx-check-out-label', html: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 1.5h6L14.5 5v6L11 14.5H5L1.5 11V5z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5v4.5" stroke="currentColor" stroke-width="1.7"/><rect x="7.15" y="10.3" width="1.7" height="1.7" fill="currentColor"/></svg><span>Red flag: act now</span>' }));
      box.append(el('p', { class: 'cx-check-out-title', text: 'Urgent MRI, senior anaesthetist and neurosurgery.' }));
      box.append(el('ul', { class: 'cx-check-out-list', html: `
        <li>Call your senior now. Stop any epidural infusion.</li>
        <li>Examine and document power, sensation, the level and the time.</li>
        <li>Request an urgent MRI of the spine; don’t wait to “see if it wears off”.</li>
        <li>Refer to neurosurgery at the same time. Decompression, if needed, should happen within hours.${cite('esaic2022')}</li>
        <li>Review anticoagulant and antiplatelet drugs with the team; hold the next dose.</li>
        ${answers.get('infection') === 'yes' ? '<li>Fever or a tender puncture site suggests an abscess or meningitis: blood cultures and early antibiotics as well as the MRI.</li>' : ''}` }));
      box.append(el('p', { class: 'cx-check-out-why', text: `Flagged: ${yes.map((q) => QUESTIONS.indexOf(q) + 1).join(', ')}.` }));
      result.append(box);
      if (user) announce(`Red flag. Urgent MRI, senior anaesthetist and neurosurgery. ${yes.length} of ${QUESTIONS.length} questions answered yes.`);
    } else if (answered === QUESTIONS.length) {
      root.dataset.state = 'ok';
      const box = el('div', { class: 'cx-check-out cx-check-out--ok' });
      box.append(el('p', { class: 'cx-check-out-label', html: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8.5 6.5 12.5 13.5 4" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>Expected regression</span>' }));
      box.append(el('p', { class: 'cx-check-out-title', text: 'Keep checking until the block has fully worn off.' }));
      box.append(el('ul', { class: 'cx-check-out-list', html: `
        <li>Repeat the check at the intervals your ward protocol sets, and document each one.</li>
        <li>Trained staff should keep checking for at least 24 h after a neuraxial block, longer in high-risk patients.${cite('esaic2022')}</li>
        <li>Tell the patient (especially day cases) to report back pain, new numbness or weakness, or bladder or bowel problems straight away.</li>` }));
      result.append(box);
      if (user) announce('All answers no: expected regression. Keep checking until the block has worn off.');
    } else {
      result.append(el('p', { class: 'cx-check-pending', text: `${answered} of ${QUESTIONS.length} answered.` }));
    }
    // Number citations added after the page finalised.
    result.querySelectorAll('a[data-ref]').forEach((a) => {
      const t = document.querySelector(`#ref-${CSS.escape(a.dataset.ref)} .sp-ref-num`);
      const num = t && parseInt(t.textContent, 10);
      if (num) { a.textContent = `[${num}]`; a.setAttribute('aria-label', `Reference ${num}`); }
    });
  }
  update(false);
  return root;
}
