/* Topic filters follow the writing archive: pressed buttons, then simple rows. */
(()=>{'use strict';
 const controls=document.querySelector('.pocus-controls');
 const buttons=[...document.querySelectorAll('.pocus-filter')];
 const lectures=[...document.querySelectorAll('.pocus-list>li')];
 const status=document.querySelector('.pocus-status');
 if(!controls||!buttons.length||!lectures.length)return;
 const valid=new Set(buttons.map(button=>button.dataset.filter));
 function select(topic,updateUrl=false){
  topic=valid.has(topic)?topic:'all';
  buttons.forEach(button=>{const active=button.dataset.filter===topic;button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  let count=0;
  lectures.forEach(lecture=>{lecture.hidden=topic!=='all'&&lecture.dataset.topic!==topic;if(!lecture.hidden)count++;});
  if(status)status.textContent=count+' '+(count===1?'lecture':'lectures');
  if(updateUrl){const url=new URL(location.href);url.hash=topic==='all'?'':topic;history.replaceState(null,'',url);}
 }
 buttons.forEach(button=>button.addEventListener('click',()=>select(button.dataset.filter,true)));
 function fromHash(){if(location.hash==='#main')return;let topic='all';try{topic=decodeURIComponent(location.hash.slice(1));}catch{}select(topic);}
 window.addEventListener('hashchange',fromHash);
 fromHash();controls.hidden=false;
})();
