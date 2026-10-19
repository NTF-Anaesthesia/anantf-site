/* Section index: sits under the sticky site header, marks the section in view and keeps old filter hashes working. */
(()=>{'use strict';
 const index=document.querySelector('.pocus-index');
 const links=[...document.querySelectorAll('.pocus-index a')];
 const sections=[...document.querySelectorAll('.pocus-section')];
 if(!index||!links.length||!sections.length)return;
 const header=document.querySelector('.ntf-header');
 const setHead=()=>document.documentElement.style.setProperty('--pocus-head',(header&&getComputedStyle(header).position==='sticky'?header.offsetHeight:0)+'px');
 setHead();window.addEventListener('resize',setHead);
 // Former topic filters (#gastric) now land on the section that holds them.
 const ALIASES={gastric:'perioperative'};
 const fromHash=()=>{const id=decodeURIComponent(location.hash.slice(1));if(ALIASES[id]){const url=new URL(location.href);url.hash=ALIASES[id];history.replaceState(null,'',url);document.getElementById(ALIASES[id])?.scrollIntoView({behavior:'instant'});}};
 window.addEventListener('hashchange',fromHash);fromHash();
 const list=index.querySelector('ol');let last=null;
 function mark(id){if(id===last)return;last=id;links.forEach(a=>{const on=a.hash==='#'+id;if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');if(on&&list.scrollWidth>list.clientWidth)list.scrollTo({left:a.offsetLeft-(list.clientWidth-a.offsetWidth)/2});});}
 // The current section is the last one whose top is in the upper third below the index bar.
 // Near the page end, short sections cannot reach that line, so the linked section wins if it is on screen.
 function update(){
  const bar=index.getBoundingClientRect().bottom,line=bar+(window.innerHeight-bar)/3;let current=null;
  for(const s of sections){if(s.getBoundingClientRect().top<=line)current=s;}
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2){
   const target=sections.find(s=>'#'+s.id===location.hash),r=target?.getBoundingClientRect();
   current=r&&r.top>=bar-2&&r.top<window.innerHeight?target:sections.at(-1);
  }
  mark(current?current.id:'');
 }
 let queued=false;
 window.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update();});},{passive:true});
 update();
})();
