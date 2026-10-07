(()=>{
  const menus=[...document.querySelectorAll('.ntf-menu')],nav=document.querySelector('#ntf-main-nav'),toggle=document.querySelector('.ntf-mobile-toggle');
  function closeNavigation(restore=false){menus.forEach(menu=>menu.open=false);nav?.classList.remove('is-open');document.body.classList.remove('ntf-nav-open');toggle?.setAttribute('aria-expanded','false');if(restore)toggle?.focus();}
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);document.body.classList.toggle('ntf-nav-open',open);if(!open)menus.forEach(menu=>menu.open=false);});
  menus.forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)menus.forEach(other=>{if(other!==menu)other.open=false;});}));
  document.addEventListener('click',event=>{menus.forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});if(nav?.classList.contains('is-open')&&!event.target.closest('.ntf-header'))closeNavigation();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const open=menus.find(menu=>menu.open);if(open){open.open=false;open.querySelector('summary').focus();}else if(nav?.classList.contains('is-open'))closeNavigation(true);}});
  nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>closeNavigation()));
  window.matchMedia('(max-width:900px)').addEventListener('change',()=>closeNavigation());
  const input=document.querySelector('#library-query');
  if(input){
    const cards=[...document.querySelectorAll('.resource-card')],count=document.querySelector('#resource-count'),empty=document.querySelector('#library-empty');
    input.addEventListener('input',()=>{
      const terms=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      let visible=0;
      cards.forEach(card=>{const text=(card.textContent+' '+card.dataset.tags).toLowerCase(),words=text.match(/[a-z0-9]+/g)||[];card.hidden=!terms.every(term=>term.length<=2?words.includes(term):text.includes(term));if(!card.hidden)visible++;});
      count.textContent=visible+' '+(visible===1?'PAGE':'PAGES');empty.hidden=visible!==0;
    });
  }
})();
