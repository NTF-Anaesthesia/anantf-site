// One set of teaching controls, retained in presentation mode.
const workspace = $('monitor');
const panel = workspace.querySelector('.panel');
panel.insertBefore(panel.querySelector('.playback'), $('teachingOptions'));
$('displayOptions').append($('keySeg'));
panel.insertBefore($('tLine'), $('teachingOptions'));
panel.insertBefore(panel.querySelector('.story'), $('teachingOptions'));
$('monitorChoice').addEventListener('change', e => {
  applySkin(e.target.value, true);
  if(e.target.value === 'advance') { advBootEnd(); ADV.win=10; advRelayout(); }
  syncDemoControls();
});
$('agentChoice').addEventListener('change',e=>{
  stopStory();
  if(e.target.value==='mix'){showMode('mix');drug='mix';depth=mix;syncMix();applyTarget();}
  else setDrug(e.target.value);
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
  $('channelChoice').value=ADV.ch;
  $('agentChoice').value=mode==='mix'?'mix':drug;
  $('muscleBlock').checked=mods.nmbMode==='on';
}
setInterval(syncDemoControls,250);syncDemoControls();
function presentationUI(on){
  workspace.classList.toggle('presenting',on);document.body.classList.toggle('presenting',on);
  $('fullScreen').textContent=on?'Exit full screen':'Full screen';$('fullScreen').setAttribute('aria-pressed',String(on));
  dirty=true;window.dispatchEvent(new Event('resize'));
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
