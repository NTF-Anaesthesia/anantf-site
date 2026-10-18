/* RV real-clip components: normal/abnormal view comparison and commit-then-reveal clip questions. */
(() => {
  'use strict';
  const pauseIn = el => el.querySelectorAll('video').forEach(v => { if (!v.paused) v.pause(); });
  document.querySelectorAll('[data-rv-compare]').forEach(box => {
    const buttons = [...box.querySelectorAll('.seg button[data-view]')];
    const pairs = [...box.querySelectorAll('.rv-pair[data-view]')];
    const show = view => {
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      pairs.forEach(p => { const on = p.dataset.view === view; if (!on) pauseIn(p); p.hidden = !on; });
    };
    buttons.forEach(b => b.addEventListener('click', () => show(b.dataset.view)));
    show((buttons.find(b => b.getAttribute('aria-pressed') === 'true') || buttons[0]).dataset.view);
  });
  document.querySelectorAll('.rvq').forEach(card => {
    const answer = Number(card.dataset.answer), why = card.querySelector('.rvq-why'), hint = card.querySelector('.rvq-hint');
    const buttons = [...card.querySelectorAll('.rvq-opts button')];
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'btn rvq-reset'; reset.textContent = 'Try again';
    reset.addEventListener('click', () => {
      card.classList.remove('done'); why.hidden = true; if (hint) hint.hidden = false; reset.remove();
      buttons.forEach(b => { b.classList.remove('right', 'wrong'); b.removeAttribute('aria-pressed'); b.disabled = false; });
      buttons[0].focus();
    });
    buttons.forEach(b => b.addEventListener('click', () => {
      if (card.classList.contains('done')) return;
      card.classList.add('done');
      const k = Number(b.dataset.k);
      b.setAttribute('aria-pressed', 'true');
      buttons.forEach(x => { const n = Number(x.dataset.k); if (n === answer) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); x.disabled = n !== answer && x !== b; });
      const verdict = why.querySelector('.rvq-verdict') || document.createElement('p');
      verdict.className = 'rvq-verdict'; verdict.textContent = k === answer ? 'Correct.' : 'Not quite.';
      why.prepend(verdict); why.hidden = false; if (hint) hint.hidden = true; why.after(reset);
    }));
  });
})();
