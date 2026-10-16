// One responsive monitor stage and a single, compact control dock.
const workspace = $('monitor');
const panel = workspace.querySelector('.panel');
const stage = workspace.querySelector('.screens');
const notes = document.createElement('div');notes.id='workspaceNotes';workspace.append(notes);
const agent = document.createElement('label');agent.className='demo-agent';agent.innerHTML='<span>Anaesthetic</span>';
const oldAgent=$('agentChoice').parentElement;agent.append($('agentChoice'));oldAgent.remove();
$('fullScreen').before(agent);
const explain=document.createElement('details');explain.innerHTML='<summary>What to observe</summary>';
explain.append(panel.querySelector('.reading'),$('storyCap'));
notes.append(explain,$('teachingOptions'),$('displayOptions'));
$('displayOptions').append($('keySeg'));
const combinations=document.createElement('details');combinations.id='combinations';combinations.open=true;combinations.innerHTML='<summary>Drug combination</summary>';combinations.append($('mixCtl'));notes.prepend(combinations);
panel.prepend($('depthCtl'),panel.querySelector('.playback'),$('tLine'),panel.querySelector('.story'));
$('monitorChoice').addEventListener('change', e => {
  applySkin(e.target.value, true);
  if(e.target.value === 'advance') { advBootEnd(); ADV.win=5; advRelayout(); }
  syncDemoControls();
});
$('agentChoice').addEventListener('change',e=>{
  stopStory();
  if(e.target.value==='mix'){showMode('mix');drug='mix';depth=mix;syncMix();applyTarget();}
  else setDrug(e.target.value);
  syncDemoControls();
});
$('playSpeed').addEventListener('input',e=>setSpeed(+e.target.value));
$('muscleBlock').addEventListener('change',e=>{stopStory();nmReset();setNmb(e.target.checked?'on':'off');});
$('induceBtn').addEventListener('click',()=>{
  stopStory();
  if(mode==='mix'){Object.assign(mix,MIX0,PRESETS.tiva);syncMix();depth=mix;}
  else {depth=0.57;$('depth').value=57;}
  applyTarget();if(paused)$('pause').click();
  $('storyCap').textContent='Induction: watch the raw EEG and DSA evolve towards the selected target. Use the timeline or playback speed to advance.';
});
const channels=document.createElement('label');channels.id='advanceChannels';channels.hidden=true;
channels.innerHTML='Channels <select id="channelChoice" aria-label="BIS Advance channels"><option value="2">Unilateral</option><option value="4" selected>Bilateral</option></select>';
$('fullScreen').before(channels);
$('channelChoice').addEventListener('change',e=>{
  ADV.ch=+e.target.value;ADV.hemi='L';ADV.review=null;ADV.sensor=null;ADV.dlg=null;ADV.menu=false;ADV.pop=null;
  ADV.hc=null;ADV.chartKey=null;advRelayout();advOv();dirty=true;
});
function syncDemoControls(){
  $('advanceChannels').hidden=mon.skin!=='advance';
  combinations.hidden=mode!=='mix';
  workspace.dataset.skin=mon.skin;
  if(workspace.dataset.view!==view){workspace.dataset.view=view;dirty=true;}
  if(workspace.classList.contains('presenting') && mode==='mix'){if(combinations.parentNode!==panel)panel.append(combinations);}
  else if(combinations.parentNode!==notes)notes.prepend(combinations);
  if(lastFittedSkin!==mon.skin){lastFittedSkin=mon.skin;scheduleFit();}
  $('channelChoice').value=ADV.ch;
  $('agentChoice').value=mode==='mix'?'mix':drug;
  $('muscleBlock').checked=mods.nmbMode==='on';
}
setInterval(syncDemoControls,250);
function presentationUI(on){
  workspace.classList.toggle('presenting',on);document.body.classList.toggle('presenting',on);
  $('fullScreen').textContent=on?'Exit full screen':'Full screen';$('fullScreen').setAttribute('aria-pressed',String(on));
  syncDemoControls();dirty=true;window.dispatchEvent(new Event('resize'));scheduleFit();
}
$('fullScreen').addEventListener('click',async()=>{
  if(workspace.classList.contains('presenting')){
    if(document.fullscreenElement)await document.exitFullscreen();presentationUI(false);
  }else{
    presentationUI(true);
    try {if(workspace.requestFullscreen)await workspace.requestFullscreen();}catch{} // CSS presentation fallback (e.g. iOS)
  }
});
document.addEventListener('fullscreenchange',()=>presentationUI(document.fullscreenElement===workspace));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.fullscreenElement)presentationUI(false);});

// Fit from the stage's measured dimensions. Never use auto margins/percentage
// max-width alone on inline-size-contained screens: they can collapse to zero.
let lastFittedSkin='',fitPending=false;
function scheduleFit(){if(fitPending)return;fitPending=true;requestAnimationFrame(()=>{fitPending=false;fitMonitor();});}
function fitMonitor(){
 const id={vista:'vistaWrap',advance:'advWrap',sedline:'sedWrap',philips:'pvWrap',classic:'classicWrap'}[mon.skin];
 const wrap=$(id),w=stage.clientWidth,h=stage.clientHeight;if(!wrap||!w||!h)return;
 if(mon.skin==='classic'){
   wrap.style.width=w+'px';wrap.style.height=h+'px';
 }else{
   wrap.style.height='auto';wrap.style.width=w+'px';
   // Width-constrained first, then shrink only enough to fit the available height.
   for(let i=0;i<3;i++){const r=wrap.getBoundingClientRect();if(r.height<=h+1)break;wrap.style.width=Math.max(1,r.width*h/r.height)+'px';}
 }
 dirty=true;
 if(mon.skin==='advance')advInval();
 if(mon.skin==='sedline'){SED.full=true;SED.d=null;}
 if(mon.skin==='philips')PV.dirty=true;
}
new ResizeObserver(scheduleFit).observe(stage);
new ResizeObserver(scheduleFit).observe(workspace.querySelector('.monhead'));
window.addEventListener('resize',scheduleFit);
syncDemoControls();scheduleFit();
