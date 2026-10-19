// A quiet toolbar, one live control dock and a sheet for occasional settings.
const workspace=$('monitor'),panel=workspace.querySelector('.panel'),stage=workspace.querySelector('.screens');
const toolbar=workspace.querySelector('.demo-toolbar');
const ICON={
 settings:'<path d="m9.5 3-.6 2.4-2 .9-2.2-.7-2.5 4.3 1.7 1.7v2.3l-1.7 1.7 2.5 4.3 2.2-.7 2 .9.6 2.4h5l.6-2.4 2-.9 2.2.7 2.5-4.3-1.7-1.7v-2.3l1.7-1.7-2.5-4.3-2.2.7-2-.9L14.5 3Z"/><circle cx="12" cy="12.75" r="3.2"/>',
 expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
 collapse:'<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 play:'<path d="m9 5 11 7-11 7Z" fill="currentColor" stroke="none"/>',
 pause:'<path d="M9 5v14M16 5v14" stroke-width="3"/>',
 stop:'<rect x="6" y="6" width="12" height="12" fill="currentColor" stroke="none"/>',
 learn:'<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Zm0 0v15"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
function iconButton(id,label,name){const b=document.createElement('button');b.type='button';b.id=id;b.className='icon-button';b.innerHTML=icon(name);b.setAttribute('aria-label',label);b.title=label;return b;}
toolbar.querySelector('label[for=monitorChoice]').className='sr-only';
$('monitorChoice').setAttribute('aria-label','Monitor');
const settingsButton=iconButton('settingsButton','Simulator settings','settings');
settingsButton.setAttribute('aria-haspopup','dialog');settingsButton.setAttribute('aria-controls','simSettings');settingsButton.setAttribute('aria-expanded','false');
$('fullScreen').before(settingsButton);$('fullScreen').classList.add('icon-button');

const settings=document.createElement('dialog');settings.id='simSettings';settings.setAttribute('aria-labelledby','settingsTitle');
settings.innerHTML='<div class="settings-head"><h2 id="settingsTitle">Settings</h2></div><div class="settings-body"></div>';
const closeSettings=iconButton('closeSettings','Close settings','close');settings.firstElementChild.append(closeSettings);
const settingsBody=settings.querySelector('.settings-body');
const channels=document.createElement('div');channels.id='advanceChannels';channels.hidden=true;
channels.innerHTML='<span id="sensorLabel">Sensor</span><div id="channelChoice" role="group" aria-labelledby="sensorLabel"><button type="button" data-ch="2" aria-pressed="true">Unilateral</button><button type="button" data-ch="4" aria-pressed="false">Bilateral</button></div>';
$('monitorChoice').after(channels);
const explain=document.createElement('aside');explain.id='observationNotes';explain.setAttribute('aria-labelledby','observeTitle');explain.innerHTML='<h2 id="observeTitle">What to observe</h2>';
explain.append(panel.querySelector('.reading'),$('storyCap'));$('displayOptions').append($('keySeg'));
$('displayOptions').open=true;settingsBody.append($('displayOptions'));workspace.append(settings);
const live=document.createElement('div');live.className='live-workspace';
workspace.querySelector('.sim').append(live,explain);live.append(stage,panel);
settingsButton.addEventListener('click',()=>{speedControl.open=false;settings.showModal();settingsButton.setAttribute('aria-expanded','true');});
closeSettings.addEventListener('click',()=>settings.close());
settings.addEventListener('close',()=>{settingsButton.setAttribute('aria-expanded','false');settingsButton.focus({preventScroll:true});});
settings.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const focusable=[...settings.querySelectorAll('button,summary,input,select')].filter(el=>el.getClientRects().length&&!el.disabled),last=focusable.at(-1);if(e.shiftKey&&document.activeElement===closeSettings){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();closeSettings.focus();}});
settings.addEventListener('click',e=>{if(e.target===settings){const r=settings.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)settings.close();}});

// Anaesthetic and depth belong together; screen choice stays in the toolbar.
const depthHead=document.createElement('div');depthHead.className='depth-head';
const agent=$('agentChoice'),oldAgent=agent.parentElement;
agent.setAttribute('aria-label','Anaesthetic');depthHead.append(agent,$('tgtBis'));oldAgent.remove();
const depthGroup=document.createElement('div'),depthControl=$('depthCtl');depthGroup.className='depth-control';depthControl.querySelector('label').classList.add('sr-only');depthGroup.append(depthHead,depthControl);

// Playback reads left to right: pause, elapsed time, scrubber, speed.
const transport=document.createElement('div');transport.className='transport';transport.setAttribute('role','group');transport.setAttribute('aria-label','Playback');
const pause=$('pause');pause.classList.add('icon-button');transport.append(pause,$('tLine'));
const speedControl=document.createElement('details');speedControl.id='speedControl';
speedControl.innerHTML='<summary aria-label="Playback speed" title="Playback speed"><span id="speedLabel">1×</span></summary><div class="speed-popover"><label for="playSpeed">Playback speed <output id="speedValue">1×</output></label></div>';
const oldPlayback=panel.querySelector('.playback');speedControl.querySelector('.speed-popover').append($('playSpeed'));oldPlayback.remove();transport.append(speedControl);
const actions=panel.querySelector('.story');actions.setAttribute('role','group');actions.setAttribute('aria-label','Transitions');
depthGroup.append($('mixCtl'));panel.prepend(depthGroup,transport,actions);

$('monitorChoice').addEventListener('change',e=>{applySkin(e.target.value,true);if(e.target.value==='advance'){advBootEnd();ADV.win=5;advRelayout();}syncDemoControls();});
agent.addEventListener('change',e=>{stopStory();if(e.target.value==='mix'){showMode('mix');drug='mix';depth=mix;selectMix(selectedMix,selectedMixVariant);if(paused)pause.click();}else setDrug(e.target.value);syncDemoControls();});
$('playSpeed').addEventListener('input',e=>{setSpeed(+e.target.value);syncPlayback();});
$('induceBtn').addEventListener('click',()=>{stopStory();if(mode==='mix'){selectMix(selectedMix,selectedMixVariant);}else{depth=.57;$('depth').value=57;}applyTarget();if(paused)pause.click();$('storyCap').textContent='Induction: watch the raw EEG and DSA evolve towards the selected target.';syncPlayback();});
channels.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{ADV.ch=+b.dataset.ch;ADV.hemi='L';ADV.review=null;ADV.sensor=null;ADV.dlg=null;ADV.menu=false;ADV.pop=null;ADV.hc=null;ADV.chartKey=null;advRelayout();advOv();dirty=true;syncDemoControls();}));

function syncPlayback(){
 const state=paused?'play':'pause',label=paused?'Resume simulation':'Pause simulation';
 if(pause.dataset.icon!==state||!pause.querySelector('svg')){pause.innerHTML=icon(state);pause.dataset.icon=state;}
 pause.setAttribute('aria-label',label);pause.title=label;pause.setAttribute('aria-pressed',String(paused));
 $('speedLabel').textContent=speed+'×';$('speedValue').textContent=speed+'×';speedControl.querySelector('summary').setAttribute('aria-label',`Playback speed, ${speed} times`);
 const demo=$('storyBtn'),name=story?'Stop demo':'Play induction and emergence demo',text=story?'Stop':'Demo';
 if(demo.dataset.running!==String(!!story)||!demo.querySelector('svg')){demo.innerHTML=icon(story?'stop':'play')+`<span>${text}</span>`;demo.dataset.running=String(!!story);}
 demo.setAttribute('aria-label',name);demo.title=name;demo.setAttribute('aria-pressed',String(!!story));
}
pause.addEventListener('click',syncPlayback);$('storyBtn').addEventListener('click',syncPlayback);$('wakeBtn').addEventListener('click',syncPlayback);
document.addEventListener('pointerdown',e=>{if(!speedControl.contains(e.target))speedControl.open=false;});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&speedControl.open){speedControl.open=false;speedControl.querySelector('summary').focus();e.preventDefault();e.stopImmediatePropagation();}},true);
function syncDemoControls(){
 channels.hidden=mon.skin!=='advance';workspace.dataset.mode=mode;workspace.dataset.skin=mon.skin;
 if(workspace.dataset.view!==view){workspace.dataset.view=view;dirty=true;}
 if(lastFittedSkin!==mon.skin){lastFittedSkin=mon.skin;scheduleFit();}
 channels.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.ch===ADV.ch)));agent.value=mode==='mix'?'mix':drug;syncPlayback();if(typeof syncLearning==='function')syncLearning();
}
setInterval(syncDemoControls,250);
function presentationUI(on){
 workspace.classList.toggle('presenting',on);document.body.classList.toggle('presenting',on);
 mobileLayout();
 const b=$('fullScreen'),label=on?'Exit full screen':'Enter full screen';b.innerHTML=icon(on?'collapse':'expand');b.title=label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(on));
 syncDemoControls();dirty=true;window.dispatchEvent(new Event('resize'));scheduleFit();
}
$('fullScreen').addEventListener('click',async()=>{speedControl.open=false;if(workspace.classList.contains('presenting')){if(document.fullscreenElement)await document.exitFullscreen();presentationUI(false);}else{presentationUI(true);try{if(workspace.requestFullscreen)await workspace.requestFullscreen();}catch{}}});
document.addEventListener('fullscreenchange',()=>presentationUI(document.fullscreenElement===workspace));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement&&!settings.open&&!learningSheet.open&&!e.defaultPrevented)presentationUI(false);});

// Explicit stage dimensions prevent inline-size-contained LCDs collapsing.
let lastFittedSkin='',fitPending=false;
function scheduleFit(){if(fitPending)return;fitPending=true;requestAnimationFrame(()=>{fitPending=false;fitMonitor();});}
const DOCK_MIN=600; // px: the dock's two columns (drug and depth | transport) side by side without overlap
function fitMonitor(){
 const id={vista:'vistaWrap',advance:'advWrap',sedline:'sedWrap',philips:'pvWrap',classic:'classicWrap'}[mon.skin];
 // Fit the original device to the content box; presentation padding is outside it.
 const css=getComputedStyle(stage),pad=k=>parseFloat(css[k])||0;
 const desktop=matchMedia('(min-width:1101px)').matches,sim=stage.closest('.sim');
 // SedLine on desktop puts its children straight into #monitor's grid (demo.css), so measure #monitor's content box then
 const host=getComputedStyle(sim).display==='contents'?workspace:sim,hc=getComputedStyle(host);
 // Measure the available row, not the previous fitted column, so resizing can grow it again.
 const available=desktop?host.clientWidth-(parseFloat(hc.paddingLeft)||0)-(parseFloat(hc.paddingRight)||0)-280-parseFloat(hc.columnGap):stage.clientWidth;
 const wrap=$(id),w=available-pad('paddingLeft')-pad('paddingRight'),h=stage.clientHeight-pad('paddingTop')-pad('paddingBottom');if(!wrap||w<=0||h<=0)return;
 // shrink or grow until the device fills the height (fixed bezel parts make one step undershoot)
 if(mon.skin==='classic'){wrap.style.width=w+'px';wrap.style.height=h+'px';}
 else{wrap.style.height='auto';wrap.style.width=w+'px';for(let i=0;i<6;i++){const r=wrap.getBoundingClientRect();if(r.height<=h+1&&(r.height>=h-4||r.width>=w-1))break;wrap.style.width=Math.max(1,Math.min(w,r.width*h/r.height))+'px';}}
 // The notes follow the device edge; surplus width belongs to the notes, not an empty stage. A narrow (portrait) device such as
 // SedLine still gets a column wide enough for the control dock, or its two control rows overlap (owner's video, 19 Oct 2026). SedLine
 // is the exception: its title, notes and dock sit in the right column (demo.css), so the portrait monitor gets the full height.
 if(desktop)workspace.style.setProperty('--monitor-width',Math.min(available,Math.max(mon.skin==='sedline'?0:DOCK_MIN,wrap.getBoundingClientRect().width+pad('paddingLeft')+pad('paddingRight')))+'px');
 else workspace.style.removeProperty('--monitor-width');
 dirty=true;if(mon.skin==='advance')advInval();if(mon.skin==='sedline'){SED.full=true;SED.d=null;}if(mon.skin==='philips')PV.dirty=true;
}
new ResizeObserver(scheduleFit).observe(stage);new ResizeObserver(scheduleFit).observe(workspace.querySelector('.monhead'));
window.addEventListener('resize',scheduleFit);

initLearning();

// A focused mobile presentation: the monitor and dock stay in view, teaching opens in a sheet.
// Move the existing controls and notes; do not create a second, diverging set of state.
const mobilePresentation=matchMedia('(max-width:650px), (max-width:1100px) and (max-height:550px)');
const learningButton=iconButton('learningButton','What to observe and teaching controls','learn');
learningButton.innerHTML=icon('learn')+'<span>Learn</span>';learningButton.setAttribute('aria-haspopup','dialog');
learningButton.setAttribute('aria-controls','learningSheet');learningButton.setAttribute('aria-expanded','false');actions.querySelector('.row').append(learningButton);
const learningSheet=document.createElement('dialog');learningSheet.id='learningSheet';learningSheet.setAttribute('aria-labelledby','observeTitle');
learningSheet.innerHTML='<div class="settings-head"></div><div class="learning-body"></div>';
const closeLearning=iconButton('closeLearning','Close teaching notes','close');learningSheet.firstElementChild.append(closeLearning);workspace.append(learningSheet);
learningButton.addEventListener('click',()=>{speedControl.open=false;learningSheet.showModal();learningButton.setAttribute('aria-expanded','true');});
closeLearning.addEventListener('click',()=>learningSheet.close());
learningSheet.addEventListener('close',()=>{learningButton.setAttribute('aria-expanded','false');if(workspace.classList.contains('mobile-app'))learningButton.focus({preventScroll:true});});
learningSheet.addEventListener('click',e=>{if(e.target===learningSheet){const r=learningSheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)learningSheet.close();}});
// Prevent a modal Escape from also leaving the fullscreen fallback on iOS.
learningSheet.addEventListener('keydown',e=>{
 if(e.key==='Escape')e.stopPropagation();
 if(e.key!=='Tab')return;
 const items=[...learningSheet.querySelectorAll('button,summary,input,select,a[href]')].filter(el=>el.getClientRects().length&&!el.disabled),first=items[0],last=items.at(-1);
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
 else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
});
function mobileLayout(){
 const on=workspace.classList.contains('presenting')&&mobilePresentation.matches;
 workspace.classList.toggle('mobile-app',on);
 if(on){learningSheet.firstElementChild.prepend($('observeTitle'));learningSheet.querySelector('.learning-body').append(explain);}
 else{if(learningSheet.open)learningSheet.close();explain.prepend($('observeTitle'));workspace.querySelector('.sim').append(explain);}
 scheduleFit();
}
mobilePresentation.addEventListener('change',mobileLayout);
presentationUI(false);
