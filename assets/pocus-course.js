/* POCUS course shell: one continuous deck. Flat section picker, the engine's own counter and progress, flat contents, keys.
   Lecture engines own go(), #cnt, #prog and the #ovGrid buttons; this file reads their DOM and never replaces them. */
(()=>{
 'use strict';
 const slides=[...document.querySelectorAll('.slide')];if(!slides.length)return;
 const $=s=>document.querySelector(s),picker=$('#course-section'),overview=$('#overview'),grid=$('#ovGrid'),bar=$('.bar'),barInner=$('.course-bar-inner')||bar;
 const lectureName=($('.course-breadcrumb>span:last-child')?.textContent||document.title.split(/\s[—|–-]\s/)[0]||'Lecture').trim();
 const activeIndex=()=>Math.max(0,slides.findIndex(s=>s.classList.contains('active')));
 const go=i=>{if(typeof window.go==='function')window.go(i);};

 /* ---------- part model (data only; the interface is one flat deck) ---------- */
 const PART_RE=/^Part\s+([IVXLC]+)\s*·\s*(.+)$/;
 const parts=[];
 slides.forEach((slide,i)=>{
  const divider=slide.classList.contains('divider'),named=slide.hasAttribute('data-part');
  if(i&&!divider&&!named)return;
  const title=(slide.dataset.part||(divider?slide.dataset.title:'')||(i===0?'Start':slide.dataset.title)||'').trim();
  const m=title.match(PART_RE);
  let kind=m?'part':(i===0&&!divider&&!named)?'start':(divider&&!named)?'close':'part';
  if(slide.dataset.partKind==='extension')kind='extension';
  if(i===0&&!named&&!divider)kind='start';
  parts.push({key:slide.id||('part-'+i),numeral:m?m[1]:'',label:m?m[2]:title,title,start:i,end:slides.length,kind,divider});
 });
 parts.forEach((p,k)=>{if(parts[k+1])p.end=parts[k+1].start;p.count=p.end-p.start;});
 let n=0;parts.forEach(p=>{if(p.kind==='start')p.short='';else if(p.kind==='close')p.short='✓';else p.short=p.numeral||String(++n);});
 window.POCUS_PARTS=parts.map(p=>({...p}));
 const optionText=(slide,i)=>String(i+1).padStart(2,'0')+' / '+slide.dataset.title;

 /* ---------- section picker ---------- */
 if(picker){
  picker.replaceChildren();
  const option=i=>{const o=document.createElement('option');o.value=String(i);o.textContent=optionText(slides[i],i);return o;};
  slides.forEach((s,i)=>picker.append(option(i)));
  picker.setAttribute('aria-label',lectureName+': section');
  picker.addEventListener('change',()=>go(Number(picker.value)));
  picker.addEventListener('keydown',event=>event.stopPropagation());
 }

 /* ---------- bar: Previous, the engine's counter and progress, Next, Contents ---------- */
 const prevB=$('#prevB'),nextB=$('#nextB'),ovB=$('#ovB');
 const label=(button,arrow,text,after)=>{if(!button||button.querySelector('.course-btn-label'))return;const a=`<span class="course-btn-arrow" aria-hidden="true">${arrow}</span>`,t=`<span class="course-btn-label">${text}</span>`;button.innerHTML=after?t+' '+a:a+' '+t;};
 label(prevB,'←','Previous',false);label(nextB,'→','Next',true);
 if(ovB)ovB.textContent='Contents';

 /* ---------- contents overlay: header and one numbered list ---------- */
 let close,head;
 if(overview){
  overview.setAttribute('role','dialog');overview.setAttribute('aria-label',lectureName+': contents');overview.setAttribute('aria-modal','true');
  head=document.createElement('div');head.className='course-ov-head';
  head.innerHTML=`<div class="course-ov-title"><p class="course-ov-kicker">Contents</p><h2></h2><p class="course-ov-hint">${slides.length} sections · press <kbd>?</kbd> for keyboard shortcuts</p></div><div class="course-ov-search"></div>`;
  head.querySelector('h2').textContent=lectureName;
  close=document.createElement('button');close.type='button';close.className='course-overview-close';close.innerHTML='Close <span aria-hidden="true">×</span>';close.setAttribute('aria-label','Close tutorial contents');head.append(close);
  const body=document.createElement('div');body.className='course-ov-body';const main=document.createElement('div');main.className='course-ov-main';
  overview.prepend(head);
  if(grid){grid.before(body);main.append(grid);grid.classList.add('course-flat');}
  body.append(main);
  close.addEventListener('click',()=>overview.classList.remove('show'));
  const background=[...document.querySelectorAll('.ntf-header,.course-toolbar,.deck,.bar,.ntf-footer')];let previousFocus,wasOpen=overview.classList.contains('show');
  // Only react when 'show' itself changes; series.js also toggles other classes (course-searching) here.
  new MutationObserver(()=>{const open=overview.classList.contains('show');if(open===wasOpen)return;wasOpen=open;background.forEach(el=>el.inert=open);
   if(open){previousFocus=document.activeElement;hideKeys();const current=grid?.querySelector('button.cur')||grid?.querySelectorAll('button')[activeIndex()];overview.scrollTop=0;if(current&&!grid.hidden){current.scrollIntoView({block:'center',behavior:'instant'});current.focus({preventScroll:true});}else close.focus();}
   else previousFocus?.focus?.();
  }).observe(overview,{attributes:true,attributeFilter:['class']});
  // Arrow keys move between section rows; registered before series.js so it runs first.
  overview.addEventListener('keydown',e=>{
   if(!grid||!e.target.closest?.('#ovGrid button'))return;
   if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;
   const rows=[...grid.querySelectorAll('button')].filter(b=>b.getClientRects().length),k=rows.indexOf(e.target);
   const to=e.key==='Home'?0:e.key==='End'?rows.length-1:Math.max(0,Math.min(rows.length-1,k+(e.key==='ArrowDown'?1:-1)));
   e.preventDefault();e.stopPropagation();rows[to]?.focus();rows[to]?.scrollIntoView({block:'nearest'});
  },true);
  // Fallback trap and Escape for lectures without series.js.
  overview.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();overview.classList.remove('show');}if(e.key==='Tab'){const f=[...overview.querySelectorAll('button,input,a[href]')].filter(el=>!el.closest('[hidden]')&&el.getClientRects().length);if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus();}}});
 }

 /* ---------- keyboard: ? for help ---------- */
 const keys=document.createElement('div');keys.className='course-keys';keys.hidden=true;keys.setAttribute('role','dialog');keys.setAttribute('aria-label','Keyboard shortcuts');
 const rows=[['← →','Previous / next section'],['Home End','First / last section'],['O','Contents'],['Esc','Close contents or this panel'],...($('#jumpCases')?[['C','Jump to the cases']]:[]),...($('.slide.case')?[['R','Reveal the next case step']]:[]),['?','Show or hide these shortcuts']];
 keys.innerHTML='<p class="course-keys-title">Keyboard shortcuts</p><dl>'+rows.map(([k,v])=>`<div><dt>${k.split(' ').map(x=>`<kbd>${x}</kbd>`).join(' ')}</dt><dd>${v}</dd></div>`).join('')+'</dl>';
 const keysClose=document.createElement('button');keysClose.type='button';keysClose.className='course-keys-close';keysClose.textContent='Close';keysClose.addEventListener('click',()=>hideKeys(true));keys.append(keysClose);
 document.body.append(keys);
 let keysReturn=null;
 function hideKeys(restore){if(keys.hidden)return;keys.hidden=true;if(restore)keysReturn?.focus?.();}
 function toggleKeys(){if(keys.hidden){keysReturn=document.activeElement;keys.hidden=false;keysClose.focus();}else hideKeys(true);}
 keys.addEventListener('keydown',e=>{if(e.key==='Escape'||e.key==='?'){e.preventDefault();e.stopPropagation();hideKeys(true);}});
 document.addEventListener('keydown',e=>{
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;if(t.closest?.('input,textarea,select,[contenteditable]:not([contenteditable=false])'))return;
  if(overview?.classList.contains('show'))return;
  if(e.key==='?'){e.preventDefault();toggleKeys();return;}
  if(e.key==='Escape')hideKeys(true);
 });

 /* ---------- sync on every section change ---------- */
 let last=-1;
 const sync=()=>{
  const i=activeIndex();
  slides.forEach(slide=>{const active=slide.classList.contains('active');slide.inert=!active;slide.setAttribute('aria-hidden',String(!active));});
  if(picker)picker.value=String(i);
  if(i!==last){slides.forEach((s,k)=>{if(k!==i)s.querySelectorAll('video,audio').forEach(v=>{if(!v.paused)v.pause();});});last=i;}
 };
 sync();
 const observer=new MutationObserver(sync);slides.forEach(slide=>observer.observe(slide,{attributes:true,attributeFilter:['class']}));
})();
