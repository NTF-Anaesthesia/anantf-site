(() => {
  'use strict';
  const host = document.getElementById('fit-app');
  if (!host) return;
  const questions = [
    {id:'role',title:'Which role are you exploring?',hint:'Your career stage does not affect the score.',options:['MOPEX','Fellow','Resident Physician','Resident','Consultant']},
    {id:'scope',title:'Do any of these need to be a major part of your next posting or role?',hint:'Choose all that are essential. An interest in a specialty is different from needing it in your next role.',multi:true,options:['Cardiac anaesthesia','Obstetric anaesthesia (OBAN)','Paediatric anaesthesia','Transplant anaesthesia','None of these is essential']},
    {id:'interests',title:'What would you like to learn or develop?',hint:'Choose all that interest you. You do not need prior experience.',multi:true,options:['Regional anaesthesia','Perioperative care','Airway management','POCUS','Medical education','Still exploring']},
    {id:'learning',title:'When a useful technique is new to you, what is your usual approach?',hint:'Choose the answer closest to how you like to work.',options:['Seek guidance, prepare and practise with appropriate supervision.','Learn it when it becomes part of my assigned work.','Prefer to focus on techniques I already know well.'],points:[3,1,0]},
    {id:'feedback',title:'What kind of feedback helps you develop?',hint:'Think about your preferred working environment.',options:['Regular, specific feedback that I can discuss and act on.','Feedback at planned reviews, with time to work independently between them.','Only occasional feedback; I prefer to direct my own development.'],points:[3,2,0]},
    {id:'teamwork',title:'When a colleague raises a different view, what comes most naturally?',hint:'Choose the answer that best reflects your approach.',options:['Listen, explore their reasoning and agree on a way forward together.','Ask the senior in charge to settle the question.','Explain my position and usually leave the decision with the person responsible.'],points:[3,1,0]},
    {id:'teaching',title:'How would you like to contribute to learning in the team?',hint:'Small contributions count. Nobody needs to arrive as an expert.',options:['Share what I know, ask questions and help others learn as I develop.','Join teaching and contribute when invited.','Focus mainly on my own clinical work and learning for now.'],points:[3,2,1]}
  ];
  const answers = {};
  let step = 0;
  const selected = id => answers[id] || [];
  function outcome() {
    const required = selected('scope').filter(v => v !== 4);
    if (required.length) return {kind:'scope',required};
    const attitude = questions.filter(q => q.points).reduce((n,q) => n + (q.points[selected(q.id)[0]] || 0),0);
    const interests = selected('interests').filter(v => v < 5).length;
    const score = attitude + Math.min(interests,3);
    return {kind: score >= 12 && attitude >= 9 && interests > 0 ? 'great' : 'chat',attitude,interests,score};
  }
  function render(focus = false) {
    const q = questions[step];
    host.innerHTML = `<form class="fit-panel" novalidate><div class="fit-progress"><span>Question ${step+1} of ${questions.length}</span><span>Find your fit</span></div><div class="fit-track" aria-hidden="true"><span style="width:${(step+1)/questions.length*100}%"></span></div><fieldset><legend tabindex="-1">${q.title}</legend><p class="fit-hint" id="fit-hint">${q.hint}</p><div class="fit-options ${q.points?'':'compact'}">${q.options.map((label,i) => `<label class="fit-option"><input type="${q.multi?'checkbox':'radio'}" name="${q.id}" value="${i}" aria-describedby="fit-hint" ${selected(q.id).includes(i)?'checked':''}><span>${label}</span></label>`).join('')}</div></fieldset><p class="fit-error" id="fit-error" role="alert"></p><div class="fit-actions">${step?'<button class="fit-button secondary" type="button" data-back>Back</button>':'<span></span>'}<button class="fit-button" type="submit">${step===questions.length-1?'See my result':'Next'} <span aria-hidden="true">&nbsp;→</span></button></div></form>`;
    const form = host.querySelector('form');
    form.addEventListener('change', e => {
      const inputs = [...form.querySelectorAll('input')];
      const exclusive = q.multi ? q.options.length-1 : -1;
      if (q.multi && e.target.checked) {
        if (+e.target.value === exclusive) inputs.forEach(el => { if (el !== e.target) el.checked = false; });
        else inputs[exclusive].checked = false;
      }
      answers[q.id] = inputs.filter(el => el.checked).map(el => +el.value);
      host.querySelector('#fit-error').textContent = '';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!selected(q.id).length) { host.querySelector('#fit-error').textContent = 'Choose an answer to continue.'; form.querySelector('input').focus(); return; }
      if (q.id === 'scope' && selected('scope').some(v => v !== 4)) { result(); return; }
      if (step === questions.length-1) result(); else { step++; render(true); }
    });
    host.querySelector('[data-back]')?.addEventListener('click', () => {step--; render(true);});
    if (focus) host.querySelector('legend').focus();
  }
  function result() {
    const o = outcome();
    const role = questions[0].options[selected('role')[0]];
    let title, copy;
    if (o.kind === 'scope') {
      title = 'Your specialty plans need a different setting.';
      copy = `<p>You need ${o.required.map(i => questions[1].options[i]).join(', ')} to be a major part of your next role. NTF is not the right match for that requirement.</p><p>This is about clinical scope. If your plans change, you are welcome to explore our broader practice with us.</p>`;
    } else if (o.kind === 'great') {
      title = 'Sounds like you will be a great fit for us!';
      copy = `<p>Your answers align with the learning, feedback and teamwork we value. Your interests also overlap with the areas we enjoy developing.</p><p>Let’s talk about what a ${role} opportunity could look like, and whether our clinical work and current arrangements suit you.</p>`;
    } else {
      title = 'Come have a chat to explore more with us.';
      copy = `<p>A conversation will help us understand your interests and what you need from your next role. You do not need to arrive with every interest or skill already in place.</p><p>Tell us what you are looking for as a ${role}, and we can explore the possibilities together.</p>`;
    }
    host.innerHTML = `<div class="fit-panel fit-result"><span class="collection-label">Your next step</span><h3 tabindex="-1">${title}</h3>${copy}<p class="collection-note">A guide to starting a conversation. It does not confirm a vacancy, appointment or training eligibility.</p><div class="fit-actions">${o.kind!=='scope'?'<a class="fit-button" href="mailto:contact@anantf.com?subject=Exploring%20a%20role%20at%20NTF%20Anaesthesia">Have a chat <span aria-hidden="true">&nbsp;↗</span></a>':''}<button class="fit-button secondary" type="button" data-edit>Edit answers</button><button class="fit-button secondary" type="button" data-reset>Start again</button></div></div>`;
    host.querySelector('[data-edit]').addEventListener('click', () => {step=o.kind==='scope'?1:0;render(true);});
    host.querySelector('[data-reset]').addEventListener('click', () => {Object.keys(answers).forEach(k=>delete answers[k]);step=0;render(true);});
    host.querySelector('h3').focus();
  }
  render();
})();
