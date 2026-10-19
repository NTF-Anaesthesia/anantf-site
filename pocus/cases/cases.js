/* Case studies: section engine (same contract as the other series lectures) and commit-then-reveal questions. */
(()=>{'use strict';
 const $=s=>document.querySelector(s),slides=[...document.querySelectorAll('.slide')],overview=$('#overview');let current=0;
 function indexFromHash(){let hash;try{hash=decodeURIComponent(location.hash.slice(1));}catch{return 0;}if(/^\d+$/.test(hash)){const routed=slides.findIndex(s=>s.dataset.route===hash);return routed>=0?routed:Number(hash)-1;}const el=hash&&document.getElementById(hash),found=el?slides.indexOf(el.closest('.slide')):-1;return found<0?0:found;}
 window.go=function(i){current=Math.max(0,Math.min(slides.length-1,i));slides.forEach((slide,k)=>{slide.classList.toggle('active',k===current);slide.inert=k!==current;slide.setAttribute('aria-hidden',String(k!==current));if(k===current)slide.scrollTop=0;});document.querySelectorAll('video').forEach(v=>v.pause());$('#cnt').textContent=`${current+1} / ${slides.length}`;$('#prevB').disabled=current===0;$('#nextB').disabled=current===slides.length-1;$('#prog').style.width=`${100*(current+1)/slides.length}%`;$('#course-section').value=String(current);history.replaceState(null,'','#'+(slides[current].id||current+1));$('#ovGrid')?.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('cur',k===current));};
 $('#prevB').addEventListener('click',()=>go(current-1));$('#nextB').addEventListener('click',()=>go(current+1));$('#ovB').addEventListener('click',()=>overview.classList.toggle('show'));
 slides.forEach((slide,i)=>{const b=document.createElement('button');b.type='button';const n=document.createElement('span');n.className='on';n.textContent=String(i+1).padStart(2,'0');const t=document.createElement('span');t.className='ot';t.textContent=slide.dataset.title;b.append(n,t);b.addEventListener('click',()=>{go(i);overview.classList.remove('show');});$('#ovGrid').append(b);});
 document.addEventListener('keydown',event=>{if(event.metaKey||event.ctrlKey||event.altKey||event.target.closest('input,select,textarea,button,summary,video')||overview.classList.contains('show'))return;if(event.key==='ArrowRight'){event.preventDefault();go(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1);}});
 window.addEventListener('hashchange',()=>go(indexFromHash()));
 // Commit, then reveal. A committed question also unlocks the next stage of its case ([data-unlock-by]).
 document.querySelectorAll('fieldset.cs-q[data-answer]').forEach(question=>{
  const reveal=question.querySelector('.cs-reveal'),feedback=question.querySelector('.feedback'),choices=[...question.querySelectorAll('.opts button[data-choice]')];
  const unlock=()=>document.querySelectorAll(`[data-unlock-by="${question.id}"]`).forEach(el=>{el.hidden=false;});
  choices.forEach(button=>button.addEventListener('click',()=>{
   if(question.classList.contains('done'))return;
   const correct=button.dataset.choice===question.dataset.answer;
   question.classList.add('done');
   choices.forEach(b=>{b.setAttribute('aria-pressed',String(b===button));b.classList.toggle('correct',b.dataset.choice===question.dataset.answer);b.classList.toggle('incorrect',b===button&&!correct);b.disabled=b!==button&&b.dataset.choice!==question.dataset.answer;});
   feedback.textContent=(correct?'Correct. ':'Not this time. ')+(feedback.dataset.explanation||'');
   reveal.hidden=false;unlock();
   const reset=document.createElement('button');reset.type='button';reset.className='cs-reset';reset.textContent='Try again';
   reset.addEventListener('click',()=>{question.classList.remove('done');reveal.hidden=true;reveal.querySelectorAll('video').forEach(v=>v.pause());feedback.textContent='';choices.forEach(b=>{b.disabled=false;b.classList.remove('correct','incorrect');b.setAttribute('aria-pressed','false');});reset.remove();choices[0].focus();});
   reveal.after(reset);
  }));
 });
 go(indexFromHash());
})();
