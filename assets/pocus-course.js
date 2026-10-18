/* POCUS course shell: section picker grouped by part, where-am-I bar, part rail and jumps, grouped contents, keys.
   Lecture engines own go(), #cnt, #prog and the #ovGrid buttons; this file reads their DOM and never replaces them. */
(()=>{
 'use strict';
 const slides=[...document.querySelectorAll('.slide')];if(!slides.length)return;
 const $=s=>document.querySelector(s),picker=$('#course-section'),overview=$('#overview'),grid=$('#ovGrid'),bar=$('.bar'),barInner=$('.course-bar-inner')||bar;
 const lectureName=($('.course-breadcrumb>span:last-child')?.textContent||document.title.split(/\s[—|–-]\s/)[0]||'Lecture').trim();
 const activeIndex=()=>Math.max(0,slides.findIndex(s=>s.classList.contains('active')));
 const go=i=>{if(typeof window.go==='function')window.go(i);};

 /* ---------- part model ---------- */
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
 const multi=parts.length>1;
 const partOf=i=>parts.findIndex(p=>i>=p.start&&i<p.end);
 const optionText=(slide,i)=>{const p=parts[partOf(i)];const overviewRow=multi&&p.start===i&&p.divider&&(p.kind==='part'||p.kind==='extension');return String(i+1).padStart(2,'0')+' / '+(overviewRow?(p.numeral?`Part ${p.numeral} overview`:'Part overview'):slide.dataset.title);};

 /* ---------- section picker ---------- */
 if(picker){
  picker.replaceChildren();
  const option=i=>{const o=document.createElement('option');o.value=String(i);o.textContent=optionText(slides[i],i);return o;};
  if(multi)parts.forEach(p=>{const g=document.createElement('optgroup');g.label=p.title+(p.kind==='extension'&&!/extension/i.test(p.title)?' (extension)':'');for(let i=p.start;i<p.end;i++)g.append(option(i));picker.append(g);});
  else slides.forEach((s,i)=>picker.append(option(i)));
  picker.setAttribute('aria-label',lectureName+': section');
  picker.addEventListener('change',()=>go(Number(picker.value)));
  picker.addEventListener('keydown',event=>event.stopPropagation());
 }

 /* ---------- bar: where am I, rail, part jumps ---------- */
 const cnt=$('#cnt'),prevB=$('#prevB'),nextB=$('#nextB'),ovB=$('#ovB');
 const label=(button,arrow,text,after)=>{if(!button||button.querySelector('.course-btn-label'))return;const a=`<span class="course-btn-arrow" aria-hidden="true">${arrow}</span>`,t=`<span class="course-btn-label">${text}</span>`;button.innerHTML=after?t+' '+a:a+' '+t;};
 label(prevB,'←','Previous',false);label(nextB,'→','Next',true);
 if(ovB)ovB.textContent='Contents';
 let where,rail,partNav;
 if(multi&&bar){
  bar.classList.add('course-has-parts');
  where=document.createElement('span');where.className='course-where';
  where.innerHTML='<span class="course-where-part"><span class="course-where-pre">Part </span><span class="course-where-label"></span></span><span class="course-where-pos"></span>';
  if(cnt){cnt.classList.add('course-cnt-hidden');cnt.after(where);}else if(prevB)prevB.after(where);else barInner.prepend(where);
  rail=document.createElement('div');rail.className='course-rail';rail.setAttribute('aria-hidden','true');
  parts.forEach(p=>{const seg=document.createElement('span');seg.style.flexGrow=String(p.count);seg.innerHTML='<i></i>';rail.append(seg);});
  bar.prepend(rail);
  if(parts.filter(p=>p.kind!=='start').length>=3){
   partNav=document.createElement('nav');partNav.className='course-parts';partNav.setAttribute('aria-label','Lecture parts');
   parts.forEach((p,k)=>{if(p.kind==='start')return;const b=document.createElement('button');b.type='button';b.textContent=p.short;b.dataset.part=String(k);const name=p.numeral?`Part ${p.numeral}: ${p.label}`:p.title;b.setAttribute('aria-label',name);b.title=name;b.addEventListener('click',()=>go(p.start));partNav.append(b);});
   if(ovB)ovB.before(partNav);else barInner.append(partNav);
  }
 }
 const whereText=p=>p.numeral?{pre:'Part ',label:p.numeral+' · '+p.label}:{pre:'',label:p.title};

 /* ---------- contents overlay: header, part index, grouped rows ---------- */
 let close,index,head;
 if(overview){
  overview.setAttribute('role','dialog');overview.setAttribute('aria-label',lectureName+': contents');overview.setAttribute('aria-modal','true');
  head=document.createElement('div');head.className='course-ov-head';
  head.innerHTML=`<div class="course-ov-title"><p class="course-ov-kicker">Contents</p><h2></h2><p class="course-ov-hint">${slides.length} sections${multi?' in '+parts.length+' parts':''} · press <kbd>?</kbd> for keyboard shortcuts</p></div><div class="course-ov-search"></div>`;
  head.querySelector('h2').textContent=lectureName;
  close=document.createElement('button');close.type='button';close.className='course-overview-close';close.innerHTML='Close <span aria-hidden="true">×</span>';close.setAttribute('aria-label','Close tutorial contents');head.append(close);
  const body=document.createElement('div');body.className='course-ov-body';const main=document.createElement('div');main.className='course-ov-main';
  overview.prepend(head);
  if(grid){grid.before(body);main.append(grid);}
  body.append(main);
  if(multi&&grid){
   index=document.createElement('nav');index.className='course-ov-index';index.setAttribute('aria-label','Parts of this lecture');
   const list=document.createElement('ul');
   parts.forEach((p,k)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.dataset.part=String(k);b.innerHTML='<span class="course-ov-index-title"></span><span class="course-ov-index-count"></span>';b.querySelector('.course-ov-index-title').textContent=p.title;b.querySelector('.course-ov-index-count').textContent=p.count+(p.count===1?' section':' sections');b.addEventListener('click',()=>{const target=grid.querySelector(`[data-part-group="${k}"]`);target?.scrollIntoView({block:'start',behavior:'instant'});target?.querySelector('button')?.focus({preventScroll:true});});li.append(b);list.append(li);});
   index.append(list);body.prepend(index);
   // Move the engine's own buttons (never add buttons inside #ovGrid: engines toggle .cur by index).
   const buttons=[...grid.querySelectorAll('button')];
   if(buttons.length===slides.length){
    grid.classList.add('course-grouped');
    parts.forEach((p,k)=>{const sec=document.createElement('section');sec.className='course-part';sec.dataset.partGroup=String(k);if(p.kind==='extension')sec.classList.add('course-part-extension');const h=document.createElement('h3');h.id='course-part-h-'+k;sec.setAttribute('aria-labelledby',h.id);h.innerHTML='<span class="course-part-title"></span><span class="course-part-meta"></span>';h.querySelector('.course-part-title').textContent=p.title;h.querySelector('.course-part-meta').textContent=(p.kind==='extension'?'Extension · ':'')+p.count+(p.count===1?' section':' sections');const listEl=document.createElement('div');listEl.className='course-part-list';for(let i=p.start;i<p.end;i++){const b=buttons[i];if(p.start===i&&p.divider&&(p.kind==='part'||p.kind==='extension')){const t=b.querySelector('.ot');if(t)t.textContent='Part overview';}listEl.append(b);}sec.append(h,listEl);grid.append(sec);});
   }
  }
  close.addEventListener('click',()=>overview.classList.remove('show'));
  const background=[...document.querySelectorAll('.ntf-header,.course-toolbar,.deck,.bar,.ntf-footer')];let previousFocus,wasOpen=overview.classList.contains('show');
  // Only react when 'show' itself changes; series.js also toggles other classes (course-searching) here.
  new MutationObserver(()=>{const open=overview.classList.contains('show');if(open===wasOpen)return;wasOpen=open;background.forEach(el=>el.inert=open);
   if(open){previousFocus=document.activeElement;hideKeys();const k=partOf(activeIndex());index?.querySelectorAll('button').forEach(b=>{if(+b.dataset.part===k)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});const current=grid?.querySelector('button.cur')||grid?.querySelectorAll('button')[activeIndex()];overview.scrollTop=0;if(current&&!grid.hidden){current.scrollIntoView({block:'center',behavior:'instant'});current.focus({preventScroll:true});}else close.focus();}
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

 /* ---------- keyboard: [ ] between parts, ? for help ---------- */
 const keys=document.createElement('div');keys.className='course-keys';keys.hidden=true;keys.setAttribute('role','dialog');keys.setAttribute('aria-label','Keyboard shortcuts');
 const rows=[['← →','Previous / next section'],['Home End','First / last section'],...(multi?[['[ ]','Previous / next part']]:[]),['O','Contents'],['Esc','Close contents or this panel'],...($('#jumpCases')?[['C','Jump to the cases']]:[]),...($('.slide.case')?[['R','Reveal the next case step']]:[]),['?','Show or hide these shortcuts']];
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
  if(e.key==='Escape'){hideKeys(true);return;}
  if(!multi||(e.key!=='['&&e.key!==']'))return;
  e.preventDefault();const i=activeIndex(),k=partOf(i);
  if(e.key===']'){if(parts[k+1])go(parts[k+1].start);}
  else go(i>parts[k].start?parts[k].start:parts[Math.max(0,k-1)].start);
 });

 /* ---------- sync on every section change ---------- */
 let last=-1;
 const sync=()=>{
  const i=activeIndex();
  slides.forEach(slide=>{const active=slide.classList.contains('active');slide.inert=!active;slide.setAttribute('aria-hidden',String(!active));});
  if(picker)picker.value=String(i);
  if(i!==last){slides.forEach((s,k)=>{if(k!==i)s.querySelectorAll('video,audio').forEach(v=>{if(!v.paused)v.pause();});});last=i;}
  if(!multi)return;
  const k=partOf(i),p=parts[k];
  if(where){const w=whereText(p);where.querySelector('.course-where-pre').textContent=w.pre;where.querySelector('.course-where-label').textContent=w.label;where.querySelector('.course-where-pos').textContent=`${i-p.start+1} of ${p.count}`;where.title=`Section ${i+1} of ${slides.length}`;}
  if(rail)[...rail.children].forEach((seg,j)=>{seg.firstChild.style.width=j<k?'100%':j>k?'0%':((i-p.start+1)/parts[j].count*100)+'%';seg.classList.toggle('cur',j===k);});
  partNav?.querySelectorAll('button').forEach(b=>{if(+b.dataset.part===k)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 };
 sync();
 const observer=new MutationObserver(sync);slides.forEach(slide=>observer.observe(slide,{attributes:true,attributeFilter:['class']}));
})();
