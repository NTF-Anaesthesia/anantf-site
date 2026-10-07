(()=>{
  const menu=document.querySelector('.ntf-menu');
  if(menu){
    document.addEventListener('click',event=>{if(!menu.contains(event.target))menu.open=false;});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();}});
    menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{menu.open=false;}));
  }
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
