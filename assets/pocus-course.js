(()=>{
 const overview=document.querySelector('#overview');if(!overview)return;
 const close=document.createElement('button');close.type='button';close.className='course-overview-close';close.textContent='Close overview ×';close.setAttribute('aria-label','Close slide overview');overview.prepend(close);overview.setAttribute('role','dialog');overview.setAttribute('aria-label','Slide overview');overview.setAttribute('aria-modal','true');
 const background=[...document.querySelectorAll('.ntf-header,.deck,.bar,.ntf-footer')];let previousFocus;
 close.addEventListener('click',()=>overview.classList.remove('show'));
 const observer=new MutationObserver(()=>{const open=overview.classList.contains('show');background.forEach(el=>el.inert=open);if(open){previousFocus=document.activeElement;close.focus();}else{previousFocus?.focus();}});observer.observe(overview,{attributes:true,attributeFilter:['class']});
 overview.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();overview.classList.remove('show');}if(e.key==='Tab'){const buttons=[...overview.querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}});
})();
