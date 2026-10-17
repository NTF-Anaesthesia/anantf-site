// Evidence-informed teaching comparisons. Relative adjunct levels are not dosing conversions.
const MIX_LESSONS={
 tiva:{initial:2,source:'10624998',note:'Hold propofol constant and compare the response to a surgical stimulus as remifentanil increases. The main lesson is blunting of arousal, not a proportional fall in resting BIS. More propofol changes the hypnotic EEG and can produce suppression.',variants:[
 ['Propofol alone',{propofol:3},'Propofol 3 μg/mL; no remifentanil.'],
 ['Add lower remifentanil',{propofol:3,remi:2},'Propofol 3 μg/mL + remifentanil 2 ng/mL.'],
 ['Add higher remifentanil',PRESETS.tiva,'Propofol 3 μg/mL + remifentanil 4 ng/mL.'],
 ['Increase propofol',{propofol:6,remi:4},'Propofol 6 μg/mL + remifentanil 4 ng/mL.']]},
 propket:{initial:2,source:'22428494',note:'Compare the same propofol target with increasing ketamine. Faster activity can increase BIS without emergence. A clinical trial found a BIS rise after 0.5 mg/kg but not 0.2 mg/kg; the relative levels here are not those boluses. Much of the gamma activity lies above this 0–30 Hz DSA.',variants:[
 ['Propofol alone',{propofol:3.5},'Propofol 3.5 μg/mL; no ketamine.'],
 ['Add lower ketamine',{propofol:3.5,ketamine:.1},'Propofol 3.5 μg/mL + lower relative ketamine effect.'],
 ['Add higher ketamine',PRESETS.propket,'Propofol 3.5 μg/mL + higher relative ketamine effect.']]},
 propdex:{initial:2,source:'34879867',note:'Compare adding dexmedetomidine at unchanged propofol, then reducing propofol. Observe stronger slow activity and a weaker, slower alpha band when the adjunct is added. These qualitative changes reflect a small clinical study; the relative levels and subsequent propofol reduction do not establish equivalent hypnotic doses.',variants:[
 ['Propofol alone',{propofol:3.5},'Propofol 3.5 μg/mL; no dexmedetomidine.'],
 ['Add dexmedetomidine',{propofol:3.5,dex:.5},'Propofol 3.5 μg/mL + moderate relative dexmedetomidine effect.'],
 ['Reduce propofol',PRESETS.propdex,'Propofol 2.5 μg/mL + the same dexmedetomidine effect.']]},
 sevon2o:{initial:1,source:'26118489',note:'Compare adding nitrous oxide, then reducing sevoflurane. The alpha pattern depends on the volatile component; BIS does not fully represent the combined anaesthetic effect. Switching from sevoflurane to high-concentration nitrous oxide can cause transient slow-delta activity. That transition is distinct from these steady mixture examples and is not modelled here.',variants:[
 ['Sevoflurane alone',{sevo:.8},'Sevoflurane 0.8 MAC; no nitrous oxide.'],
 ['Add nitrous oxide',PRESETS.sevon2o,'Sevoflurane 0.8 MAC + nitrous oxide 60%.'],
 ['Reduce sevoflurane',{sevo:.5,n2o:.6},'Sevoflurane 0.5 MAC + nitrous oxide 60%.']]}
};
let selectedMixVariant=2;
const EEG_LESSONS={
 alpha:{label:'Alpha dropout',source:'30915994',note:'Transient loss of the 8–12 Hz alpha band despite an unchanged hypnotic target. It can accompany noxious stimulation, but is not specific for pain or awareness. Compare drug delivery, signal quality and haemodynamics.',steps:[
 {at:0,d:.57,mods:{},cap:'Stable propofol baseline. Follow the alpha band.'},{at:20,stim:'alpha',cap:'Alpha dropout: alpha power falls while the hypnotic target stays unchanged.'},{at:130,cap:'The transient response has ended. Watch alpha recover.'},{at:200,end:true,cap:'Compare baseline, dropout and recovery using the timeline.'}]},
 delta:{label:'Delta arousal',source:'33461725',note:'Slow-delta power can increase during stimulation. A falling index does not necessarily mean deeper hypnosis.',steps:[{at:0,d:.57,mods:{},cap:'Stable baseline.'},{at:20,stim:'delta',cap:'Delta arousal: more slow activity after stimulation.'},{at:150,end:true,cap:'Interpret the EEG change alongside the event.'}]},
 beta:{label:'Beta arousal',source:'33461725',note:'Stimulation at a lighter hypnotic level can increase faster activity and EMG. Distinguish the cerebral response from muscle contamination.',steps:[{at:0,d:.42,mods:{},cap:'Lighter propofol baseline.'},{at:20,stim:'beta',cap:'Beta arousal: faster activity increases.'},{at:150,end:true,cap:'Compare the raw EEG, DSA and EMG.'}]},
 suppression:{label:'Burst suppression',source:'26275092',note:'Alternating bursts and low-amplitude intervals become intermittent broadband activity on the DSA. Inspect the raw EEG and suppression ratio; an average index can hide the pattern.',steps:[{at:0,d:.57,mods:{},cap:'Stable baseline.'},{at:20,d:.93,cap:'Increasing hypnotic effect: watch for bursts and suppressed intervals.'},{at:180,d:.57,cap:'Reduce the target and follow recovery.'},{at:420,end:true,cap:'Compare suppression with continuous slow-alpha activity.'}]},
 older:{label:'Older brain · low power',source:'26174300',elderly:true,note:'Older adults often have weaker, slower alpha and lower overall EEG power. A weak alpha band alone is not evidence of light anaesthesia. This example starts with an older-brain phenotype.',steps:[{at:0,d:.57,mods:{},cap:'Older-brain example: inspect low power and suppression susceptibility.'},{at:100,end:true,cap:'Compare with the standard baseline in Alpha dropout.'}]},
 emg:{label:'EMG artefact',source:'26275092',note:'Broadband fast contamination can increase the processed index without a change in hypnotic effect. Check the raw EEG and EMG indicator.',steps:[{at:0,d:.57,mods:{},cap:'Clean baseline.'},{at:20,mods:{emg:true},cap:'EMG contaminates the signal at unchanged hypnotic target.'},{at:90,mods:{},cap:'EMG clears.'},{at:140,end:true,cap:'Compare the signal before and after contamination.'}]},
 diathermy:{label:'Diathermy artefact',source:'26275092',note:'Electrical interference can create misleading broadband DSA power. Check signal quality and the raw tracing before interpreting an index.',steps:[{at:0,d:.57,mods:{},cap:'Clean baseline.'},{at:20,mods:{diathermy:true},cap:'Diathermy interference.'},{at:80,mods:{},cap:'Interference clears.'},{at:130,end:true,cap:'Compare artefact with physiological EEG changes.'}]}
};
function learningSource(id){return `<a href="https://pubmed.ncbi.nlm.nih.gov/${id}/" target="_blank" rel="noopener">Clinical evidence →</a>`;}
let learningFocus=null;
function learningObservation(text){
 const key=story?.lesson||learningFocus;
 return key&&EEG_LESSONS[key]?text+'\n\n'+EEG_LESSONS[key].label+': '+EEG_LESSONS[key].note:text;
}
function syncLearning(){
 const box=$('mixComparison');if(!box)return;
 const c=MIX_LESSONS[selectedMix];$('mixTeaching').hidden=mode!=='mix';$('mixObservation').hidden=mode!=='mix';
 if(box.dataset.family!==selectedMix){box.innerHTML=c.variants.map((v,i)=>`<option value="${i}">${v[0]}</option>`).join('');box.dataset.family=selectedMix;$('mixTeachingText').textContent=c.note;$('mixSource').innerHTML=learningSource(c.source);}
 box.value=selectedMixVariant;$('mixDose').textContent=c.variants[selectedMixVariant][2];const active=[mods.elderly&&'Older patient',mods.emg&&'EMG',mods.diathermy&&'Diathermy',mods.asym&&(mods.asym==='L'?'Left slowing':'Right slowing'),eng.stT>0&&'Stimulus'].filter(Boolean);
 $('liveAdjustmentState').textContent=active.join(' · ');
 const key=story?.lesson||learningFocus;
 const source=$('exampleSource');source.hidden=!key;
 if(key&&source.dataset.key!==key){source.dataset.key=key;source.innerHTML=learningSource(EEG_LESSONS[key].source);}
 describe();
 $('stimBtn').disabled=TL.busy;
 $('examplePlay').disabled=TL.busy;
}
function startLearningExample(key){
 if(TL.busy)return;stopStory();learningFocus=key;
 const overlays={emg:mods.emg,diathermy:mods.diathermy};
 nmReset();setNmb('off');mods.blink=mods.warmer=false;eng.stT=R.eng.stT=0;
 $('depth').value=EEG_LESSONS[key].steps[0].d*100;setDrug('propofol');snapAll();
 step(300*FS);stepR(300*FS);simT+=300;ADV.pre=null;ADV.cut=null;ADV.review=null;ADV.win=5;ADV.t0=simT-300;ADV.hc=null;
 TL.snaps=[];TL.events=[];TL.key='';TL.t0=simT;TL.max=simT;story={t0:simT,i:-1,lesson:key,overlays};runStory();tlSnap();tlAfter();setSpeed(5);if(paused)$('pause').click();syncDemoControls();
 stage.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function initLearning(){
 const examples=document.createElement('section');examples.id='eegExamples';examples.className='learning-section';
 examples.innerHTML='<details id="examplePicker"><summary aria-label="Choose EEG pattern and patient or artefact overlays"><span id="exampleLabel">Alpha dropout</span><span class="picker-chevron" aria-hidden="true">⌄</span><span id="liveAdjustmentState"></span></summary><div id="exampleOptions"><input type="hidden" id="exampleChoice" value="alpha"><div class="pattern-choices" role="radiogroup" aria-label="EEG pattern">'+['alpha','delta','beta','suppression'].map(k=>`<label class="chk"><input type="radio" name="eegPattern" value="${k}" ${k==='alpha'?'checked':''}>${EEG_LESSONS[k].label}</label>`).join('')+'</div></div></details>';
 $('observeTitle').after(examples);
 const play=iconButton('examplePlay','Run selected pattern with current overlays','play');play.innerHTML=icon('play')+'<span>Run</span>';play.title='Run from a fresh baseline, keeping checked overlays';examples.append(play);
 const options=$('exampleOptions'),old=$('teachingOptions');
 for(const el of [...old.children])if(el.tagName!=='SUMMARY')options.append(el);old.remove();
 options.querySelectorAll('[name=eegPattern]').forEach(input=>input.onchange=()=>{stopStory();learningFocus=input.value;$('exampleChoice').value=input.value;$('exampleLabel').textContent=EEG_LESSONS[input.value].label;describe();});
 play.onclick=()=>{$('examplePicker').open=false;startLearningExample($('exampleChoice').value);if($('learningSheet')?.open)$('learningSheet').close();};
 const stopManual=()=>{stopStory();learningFocus=null;$('storyCap').textContent='';};
 options.addEventListener('change',e=>{if(e.target.name!=='eegPattern')stopManual();},true);
 options.addEventListener('click',e=>{if(e.target.closest('button'))stopManual();},true);
 $('stimBtn').addEventListener('click',()=>{if(paused)$('pause').click();});
 document.addEventListener('pointerdown',e=>{if(!examples.contains(e.target))$('examplePicker').open=false;});
 $('examplePicker').addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();$('examplePicker').open=false;$('examplePicker').querySelector('summary').focus();}});
 for(const [id,event] of [['agentChoice','change'],['depth','input'],['induceBtn','click'],['wakeBtn','click'],['storyBtn','click']])$(id).addEventListener(event,()=>{learningFocus=null;describe();});
 const source=document.createElement('p');source.id='exampleSource';source.hidden=true;$('rText').after(source);
 const teaching=document.createElement('section');teaching.id='mixTeaching';teaching.className='learning-section';teaching.hidden=true;teaching.innerHTML='<label for="mixComparison">Compare drug effects</label><select id="mixComparison" aria-describedby="mixDose"></select><p id="mixDose" class="dose-caption"></p>';examples.after(teaching);
 const mixNote=document.createElement('div');mixNote.id='mixObservation';mixNote.innerHTML='<p id="mixTeachingText"></p><p id="mixSource"></p><p class="model-note">Illustrative effects; targets are not patient-specific dosing predictions. Allow time for the effect to settle.</p>';source.after(mixNote);
 $('mixComparison').onchange=e=>{selectMix(selectedMix,+e.target.value);if(paused)$('pause').click();};syncLearning();
}
