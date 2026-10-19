/* Search the actual lecture, retain the familiar contents and section picker. */
(()=>{'use strict';
 const slides=[...document.querySelectorAll('.slide')],overview=document.querySelector('#overview'),grid=document.querySelector('#ovGrid');
 if(!slides.length||!overview||!grid)return;
 const search=document.createElement('div');search.className='series-search';
 search.innerHTML='<label for="series-search">Find a section or clinical topic in this lecture</label><input id="series-search" type="search" placeholder="Try VTI, tamponade or artefact" autocomplete="off"><p class="series-result-count" aria-live="polite"></p>';
 (overview.querySelector('.course-ov-search')||grid.parentNode).append(search);if(!search.parentNode.classList.contains('course-ov-search'))grid.before(search);const input=search.querySelector('input'),count=search.querySelector('p');
 const results=document.createElement('div');results.className='series-results';results.hidden=true;grid.before(results);
 const index=slides.map((slide,i)=>({slide,i,title:slide.dataset.title||`Section ${i+1}`,passages:[...slide.querySelectorAll('h1,h2,h3,p,li,td,summary,figcaption')].filter(el=>!el.closest('[hidden],.rvq-why,.cs-reveal,.hdq-why')).map(el=>({el,text:el.textContent.replace(/\s+/g,' ').trim()})).filter(x=>x.text)}));
 const normal=text=>text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 function render(){const query=normal(input.value.trim()),terms=query.split(/\s+/).filter(Boolean);results.replaceChildren();grid.hidden=!!query;results.hidden=!query;overview.classList.toggle('course-searching',!!query);if(!query){count.textContent='';return;}
  const matches=index.filter(item=>{const hay=normal(item.title+' '+item.passages.map(p=>p.text).join(' '));return terms.every(term=>hay.includes(term));});
  count.textContent=`${matches.length} ${matches.length===1?'section':'sections'} found`;
  matches.forEach(item=>{const p=item.passages.find(p=>terms.every(t=>normal(p.text).includes(t)))||item.passages.find(p=>terms.some(t=>normal(p.text).includes(t)));const button=document.createElement('button');button.type='button';button.className='series-result';const title=document.createElement('strong');title.textContent=String(item.i+1).padStart(2,'0')+' / '+item.title;button.append(title);if(p){const snippet=document.createElement('span');const pos=normal(p.text).indexOf(terms[0]);const start=Math.max(0,pos-55);snippet.textContent=(start?'…':'')+p.text.slice(start,start+220)+(p.text.length>start+220?'…':'');button.append(snippet);}button.addEventListener('click',()=>{window.go(item.i);overview.classList.remove('show');requestAnimationFrame(()=>{const target=p?.el||item.slide.querySelector('h1,h2');if(!target)return;document.dispatchEvent(new CustomEvent('pocus:reveal',{detail:{target}}));item.slide.querySelectorAll('details').forEach(d=>{if(d.contains(target))d.open=true;});target.setAttribute('tabindex','-1');target.classList.add('series-hit');target.scrollIntoView({block:'center',behavior:'instant'});target.focus({preventScroll:true});target.addEventListener('blur',()=>target.classList.remove('series-hit'),{once:true});});});results.append(button);});
 }
 input.addEventListener('input',render);
 overview.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();overview.classList.remove('show');return;}
  if(event.key==='Tab'){const focusable=[...overview.querySelectorAll('a[href],button:not([disabled]),input,select,[tabindex="0"]')].filter(el=>!el.closest('[hidden]')&&el.getClientRects().length);const n=focusable.indexOf(document.activeElement);if(event.shiftKey&&n<=0){event.preventDefault();focusable.at(-1)?.focus();}else if(!event.shiftKey&&n===focusable.length-1){event.preventDefault();focusable[0]?.focus();}event.stopImmediatePropagation();return;}
  event.stopPropagation();
 },true);
 // Existing courses use document shortcuts; do not consume editing keys or page scroll.
 document.querySelectorAll('input,select,textarea').forEach(control=>control.addEventListener('keydown',event=>event.stopPropagation()));
 // One list in hub order: Contents links and the "Next lecture" step both use it.
 // The third field marks the critical care series; "Next lecture" steps through those only, ending at Case studies.
 const LECTURES=[['basics','Ultrasound basics',1],['cardiac','Focused cardiac ultrasound',1],['haemodynamics','Flow and fluids',1],['lung','Lung ultrasound',1],['shock','Shock assessment',1],['efast','eFAST',1],['dvt','DVT compression ultrasound',1],['vascular-access','IA and IV cannulation',0],['gastric','Gastric ultrasound',0],['cases','Case studies',1]];
 const SERIES=LECTURES.filter(l=>l[2]),here=SERIES.findIndex(([slug])=>location.pathname.split('/').includes(slug));
 const links=document.createElement('nav');links.className='series-links';links.setAttribute('aria-label','POCUS lectures');links.innerHTML='<h2>Other POCUS lectures</h2>';
 const list=document.createElement('ul');LECTURES.forEach(([slug,label])=>{const li=document.createElement('li'),a=document.createElement('a');a.href='../'+slug+'/';a.textContent=label;if(location.pathname.split('/').includes(slug))a.setAttribute('aria-current','page');li.append(a);list.append(li);});links.append(list);(overview.querySelector('.course-ov-main')||overview).append(links);
 // On the final section of a series lecture, Next continues to the next lecture.
 const nextB=document.querySelector('#nextB'),nextLecture=here>=0&&here<SERIES.length-1?SERIES[here+1]:null;
 if(nextB&&nextLecture){
  const plain=nextB.innerHTML,plainLabel=nextB.getAttribute('aria-label');let atEnd=false;
  const syncNext=()=>{const end=slides.at(-1).classList.contains('active');if(end){nextB.disabled=false;}if(end===atEnd)return;atEnd=end;
   if(end){nextB.innerHTML=`<span class="course-btn-label"><span class="series-next-long">Next lecture: ${nextLecture[1]}</span><span class="series-next-short">Next lecture</span></span> <span class="course-btn-arrow" aria-hidden="true">→</span>`;nextB.setAttribute('aria-label','Next lecture: '+nextLecture[1]);nextB.classList.add('series-next-lecture');}
   else{nextB.innerHTML=plain;if(plainLabel)nextB.setAttribute('aria-label',plainLabel);nextB.classList.remove('series-next-lecture');}};
  document.addEventListener('click',event=>{if(atEnd&&event.target.closest?.('#nextB')){event.preventDefault();event.stopPropagation();location.href='../'+nextLecture[0]+'/';}},true);
  const nextObserver=new MutationObserver(syncNext);slides.forEach(s=>nextObserver.observe(s,{attributes:true,attributeFilter:['class']}));syncNext();
 }
 const bar=document.querySelector('.course-bar-inner');if(bar){const top=document.createElement('button');top.type='button';top.className='series-top';top.textContent='↑';top.setAttribute('aria-label','Back to top of section');top.title='Back to top of section';top.hidden=true;bar.append(top);top.addEventListener('click',()=>{const active=slides.find(s=>s.classList.contains('active'));active?.scrollTo({top:0,behavior:'instant'});active?.querySelector('h1,h2')?.scrollIntoView({block:'start'});});const sync=()=>{const active=slides.find(s=>s.classList.contains('active'));top.hidden=!(active&&active.scrollTop>300);};slides.forEach(s=>s.addEventListener('scroll',sync,{passive:true}));const observer=new MutationObserver(sync);slides.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']}));}
 // Resolve named anchors to their owning section, including references inside hidden slides.
 function routeHash(raw){let hash;try{hash=decodeURIComponent(raw.replace(/^#/,''));}catch{return;}if(!hash)return;const numbered=/^\d+$/.test(hash);const target=numbered?(slides.find(s=>s.dataset.route===hash)||slides[Number(hash)-1]):document.getElementById(hash);const slide=target?.closest('.slide');if(!slide)return;window.go(slides.indexOf(slide));if(!numbered)history.replaceState(null,'','#'+encodeURIComponent(hash));requestAnimationFrame(()=>{document.dispatchEvent(new CustomEvent('pocus:reveal',{detail:{target}}));slide.querySelectorAll('details').forEach(d=>{if(d.contains(target))d.open=true;});if(target!==slide){target.setAttribute('tabindex','-1');target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true});}});}
 document.addEventListener('click',event=>{const a=event.target.closest('a[href^="#"]');if(!a||a.hasAttribute('data-jump'))return;const raw=a.getAttribute('href');if(raw.length<2)return;event.preventDefault();routeHash(raw);});
 window.addEventListener('hashchange',event=>routeHash(new URL(event.newURL).hash));
 routeHash(window.POCUS_INITIAL_HASH||location.hash);
 document.querySelectorAll('video').forEach(video=>{video.preload='none';video.playsInline=true;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)document.querySelectorAll('video').forEach(v=>v.pause());});
})();
