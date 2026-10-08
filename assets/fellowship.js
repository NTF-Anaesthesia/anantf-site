(() => {
  'use strict';
  const host = document.querySelector('#fellowship-app');
  if (!host) return;
  const questions = [
    {id:'years',title:'Years of clinical anaesthesia experience?',hint:'Include experience during training. Use the nearest half-year. The fellowship requires more than 3 years.',type:'years'},
    {id:'scope',title:'Do any of these need to be a major part of your next posting or role?',hint:'Choose all that are essential. An interest in a specialty is different from needing it in your next role.',multi:true,options:['Cardiac anaesthesia','Obstetric anaesthesia (OBAN)','Paediatric anaesthesia','Transplant anaesthesia','None of these is essential']},
    {id:'interests',title:'What are your primary training interests?',hint:'Choose all that interest you. General anaesthesia, regional anaesthesia and perioperative medicine align with this fellowship.',multi:true,options:['General anaesthesia','Regional anaesthesia','Perioperative medicine','Airway management','POCUS','Medical education','Still exploring']},
    {id:'duration',title:'What duration are you looking for?',hint:'Choose the option closest to your plans.',options:['A fixed, non-extendable one-year clinical fellowship.','A longer-term clinical role in Singapore, beyond one year.','I am open to either a one-year fellowship or a longer-term role.']},
    {id:'learning',title:'How would you approach a technique you have limited experience with?',hint:'Choose the approach closest to your usual practice.',options:['Prepare, seek supervision and use feedback to build my skills.','Learn it when it becomes part of my assigned clinical work.','Concentrate on techniques I already know well.'],points:[3,1,0]},
    {id:'feedback',title:'How do you prefer to receive feedback during a fellowship?',hint:'Think about what helps you develop.',options:['Regular, specific feedback, with a plan to act on it.','Feedback at scheduled reviews, with independent practice between them.','Occasional feedback when I ask for it.'],points:[3,2,1]},
    {id:'teamwork',title:'When a colleague raises a different view, how do you usually respond?',hint:'Choose the answer that best reflects your working style.',options:['Listen, explore their reasoning and agree on a way forward together.','Ask the supervising consultant to help us decide.','Explain my view and leave the decision to the person responsible.'],points:[3,2,0]}
  ];
  const answers = {};
  let step = 0;
  const selected = id => answers[id] || [];
  function assess(a) {
    if (a.scope.some(i => i < 4)) return {kind:'scope'};
    const score = questions.filter(q=>q.points).reduce((n,q)=>n+q.points[a[q.id][0]],0);
    const eligible = a.years > 3 && a.interests.some(i=>i<3);
    if (!eligible) return {kind:'requirements',score};
    if (a.duration[0]===1) return {kind:'longer',score};
    if (a.duration[0]===2) return {kind:'both',score};
    return {kind:score>=7?'fit':'chat',score};
  }
  function render(focus=false) {
    const q=questions[step];
    const controls=q.type==='years' ? `<div class="experience-value"><label for="experience-years">Years</label><input id="experience-years" type="number" min="0" max="50" step="0.5" inputmode="decimal" placeholder="e.g. 3.5" value="${answers.years??''}" required aria-describedby="question-hint"></div><label class="fellowship-sr-only" for="experience-scale">Adjust years of clinical anaesthesia experience</label><input id="experience-scale" type="range" min="0" max="50" step="0.5" value="${answers.years??0}"><div class="scale-labels" aria-hidden="true"><span>0 years</span><span>50 years</span></div>` : `<div class="fit-options ${q.multi?'compact':''}">${q.options.map((label,i)=>`<label class="fit-option"><input type="${q.multi?'checkbox':'radio'}" name="${q.id}" value="${i}" ${selected(q.id).includes(i)?'checked':''}><span>${label}</span></label>`).join('')}</div>`;
    host.innerHTML=`<form id="fellowship-form" class="fit-panel" novalidate><div class="fit-progress"><span>Question ${step+1} of ${questions.length}</span><span>Clinical Fellows</span></div><div class="fit-track" aria-hidden="true"><span style="width:${(step+1)/questions.length*100}%"></span></div><fieldset><legend tabindex="-1">${q.title}</legend><p class="fit-hint" id="question-hint">${q.hint}</p>${controls}</fieldset><p class="fit-error" role="alert"></p><div class="fit-actions">${step?'<button type="button" class="fit-button secondary" data-back>Back</button>':'<span></span>'}<button class="fit-button" type="submit">${step===questions.length-1?'See my result':'Next'} →</button></div></form>`;
    const form=host.querySelector('form'),error=host.querySelector('.fit-error');
    if(q.type==='years') {
      const number=host.querySelector('#experience-years'),range=host.querySelector('#experience-scale');
      range.addEventListener('input',()=>{number.value=range.value;answers.years=Number(range.value);error.textContent='';});
      number.addEventListener('input',()=>{delete answers.years;error.textContent='';});
      number.addEventListener('change',()=>{if(number.value!==''&&Number.isFinite(Number(number.value))&&Number(number.value)>=0&&Number(number.value)<=50){number.value=String(Math.round(Number(number.value)*2)/2);range.value=number.value;answers.years=Number(number.value);}});
    } else form.addEventListener('change',e=>{
      const inputs=[...form.querySelectorAll('input')];
      if(q.multi&&e.target.checked){const exclusive=inputs.length-1;if(+e.target.value===exclusive)inputs.forEach(el=>{if(el!==e.target)el.checked=false;});else inputs[exclusive].checked=false;}
      answers[q.id]=inputs.filter(el=>el.checked).map(el=>Number(el.value));error.textContent='';
    });
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(q.type==='years') {const n=host.querySelector('#experience-years');if(n.value===''||!Number.isFinite(Number(n.value))||Number(n.value)<0||Number(n.value)>50){error.textContent='Enter your experience between 0 and 50 years.';n.focus();return;} answers.years=Math.round(Number(n.value)*2)/2;}
      else if(!selected(q.id).length){error.textContent='Choose an answer to continue.';form.querySelector('input').focus();return;}
      if(q.id==='scope'&&selected('scope').some(i=>i<4)){result({kind:'scope'});return;}
      if(step===questions.length-1)result(assess(answers));else{step++;render(true);}
    });
    host.querySelector('[data-back]')?.addEventListener('click',()=>{step--;render(true);});
    if(focus)host.querySelector('legend').focus();
  }
  function result(o) {
    const entries={
      scope:['Your specialty plans need a different setting.','A required focus in cardiac, obstetric, paediatric or transplant anaesthesia does not match the clinical scope at NTF.'],
      requirements:['Let’s discuss your training plans.','The fellowship requires more than 3 years of anaesthesia experience and a primary interest in general anaesthesia, regional anaesthesia or perioperative medicine. Your answers do not meet all of those criteria yet.'],
      longer:['Explore a longer-term role.','A fixed one-year fellowship does not match your preferred duration. Contact us to explore other clinical positions, depending on your qualifications and current vacancies.'],
      both:['Let’s discuss both pathways.','Your experience and clinical interests align with the fellowship. We can discuss whether a one-year fellowship or a longer-term role would suit your plans.'],
      fit:['Sounds like you will be a great fit for us!','Your experience, clinical interests and one-year plans align with the fellowship, and your answers reflect the learning and teamwork we value. Contact us about applying.'],
      chat:['Come have a chat to explore more with us.','Your experience, clinical interests and one-year plans align with the fellowship. A conversation will help us understand your preferred learning environment and how we can work together.']
    };
    const [title,copy]=entries[o.kind];
    const extra=o.kind==='longer'||o.kind==='both' ? `<p>${o.score>=7?'Your answers also suggest a strong fit with our approach to learning, feedback and teamwork.':'Let’s also discuss your preferred approach to learning, feedback and teamwork.'}</p>` : o.kind==='requirements'&&selected('duration')[0]!==0?'<p>If you are exploring longer-term roles, we can discuss those separately. This quiz does not assess eligibility for other positions.</p>':'';
    host.innerHTML=`<div class="fit-panel fit-result"><span class="collection-label">Your next step</span><h3 tabindex="-1">${title}</h3><p>${copy}</p>${extra}<p class="collection-note">A conversation starter. Applications remain subject to completed specialist training, review and the relevant registration and appointment requirements.</p><div class="fit-actions">${o.kind!=='scope'?'<a class="fit-button" href="mailto:contact@anantf.com?subject=Clinical%20Fellowship%20enquiry">Have a chat ↗</a>':''}<button type="button" class="fit-button secondary" data-edit>Edit answers</button><button type="button" class="fit-button secondary" data-reset>Start again</button></div></div>`;
    host.querySelector('[data-edit]').addEventListener('click',()=>{step=o.kind==='scope'?1:0;render(true);});
    host.querySelector('[data-reset]').addEventListener('click',()=>{Object.keys(answers).forEach(k=>delete answers[k]);step=0;render(true);});
    host.querySelector('h3').focus();
  }
  render();
})();
