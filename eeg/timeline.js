// Case timeline (owner, 15 Oct 2026): a bar of the case so far under the monitor switch, with buttons to jump back or forward 1, 5 or
// 15 minutes, or a tap on the bar to jump there. Forward runs the simulation on at full speed (the same step() the page uses).
// Back restores a save point: every 30 s of simulated time the whole patient (both engines and their per-channel state, the
// relaxant model, the case story) and the drug controls are kept; going back restores the last save point at least 20 s before
// the chosen time, cuts the trend history there and runs on to the exact second (so the 20 s EEG buffer is full again). The
// part after the chosen time is dropped, as if the case had been rewound; it stays drawn faintly on the bar and a tap there
// runs the case forward again (new, not a replay). Loaded after app.js; reads and sets its globals.
const TL={snaps:[],step:30,max:0,events:[],key:'',busy:false,t0:null};
function tlCloneEng(e,mods){const m=e.mods;e.mods=null;let c;try{c=structuredClone(e);}finally{e.mods=m;}return c;}
function tlEng(c,mods){const e=Object.assign(Object.create(Engine.prototype),structuredClone(c));e.mods=mods;return e;}
// one channel's state (the left one is the page's own variables; swapCh() puts the right one there)
function tlChan(){return {eng:tlCloneEng(eng),sup:sup.slice(),bisS,lastSef,lastMf,produced,tim:Object.assign({},tim),artH:artH.slice(),bcH:bcH.slice(),rawH:rawH.slice(),
 sefH:sefH.slice(),mfH:mfH.slice(),prevSup,isoN,outN,outV,sefAge,lastN:HIST.length?HIST[HIST.length-1].n:-1};}
function tlSetChan(s,m){eng=tlEng(s.eng,m);SIG=[];EYE=[];sup=s.sup.slice();bisS=s.bisS;lastSef=s.lastSef;lastMf=s.lastMf;produced=s.produced;tim=Object.assign({},s.tim);
 artH=s.artH.slice();bcH=s.bcH.slice();rawH=s.rawH.slice();sefH=s.sefH.slice();mfH=s.mfH.slice();prevSup=s.prevSup;isoN=s.isoN;outN=s.outN;outV=s.outV;sefAge=s.sefAge;
 while(HIST.length&&HIST[HIST.length-1].n>s.lastN)HIST.pop();COLS=HIST.slice(-COLMAX);}
// the drug controls as they were
function tlUi(){return {mode,drug,lastSingle,selectedMix,selectedMixVariant,learningFocus,exampleChoice:$('exampleChoice')?.value||'alpha',dv:$('depth').value,mix:Object.assign({},mix),mods:{elderly:mods.elderly,emg:mods.emg,diathermy:mods.diathermy,blink:mods.blink,warmer:mods.warmer,nmbMode:mods.nmbMode,caseLen:mods.caseLen,asym:mods.asym}};}
function tlSetUi(u){learningFocus=u.learningFocus??null;const choice=u.exampleChoice||'alpha';$('exampleChoice').value=choice;$('exampleLabel').textContent=EEG_LESSONS[choice].label;document.querySelectorAll('[name=eegPattern]').forEach(el=>el.checked=el.value===choice);const m=u.mods;mods.elderly=!!m.elderly;$('mElder').checked=mods.elderly;for(const [k,id] of SMODS){mods[k]=!!m[k];$(id).checked=mods[k];}mods.warmer=!!m.warmer;
 if(m.caseLen)setCase(m.caseLen);if(m.asym!=null&&typeof setAsym==='function')setAsym(m.asym);setNmb(m.nmbMode||'auto');
 selectedMix=u.selectedMix||'tiva';selectedMixVariant=u.selectedMixVariant??MIX_LESSONS[selectedMix].initial;Object.assign(mix,u.mix);$('depth').value=u.dv;lastSingle=u.lastSingle;
 if(u.mode==='mix'){showMode('mix');drug='mix';depth=mix;syncMix();applyTarget();}else setDrug(u.drug);}
function tlSnap(){const L=tlChan();swapCh();let Rr;try{Rr=tlChan();}finally{swapCh();}
 TL.snaps.push({t:simT,L,R:Rr,nm:Object.assign({},nm),story:story?Object.assign({},story):null,ui:tlUi()});
 if(TL.snaps.length>600)TL.snaps.splice(1,1);} // about 5 h; the first save point (the start of the case) is kept
function tlKey(){return drug+'|'+JSON.stringify(depth)+'|'+[mods.elderly,mods.emg,mods.diathermy,mods.blink,mods.nmbMode].join();}
// called by app.js's frame loop after each step: save points, drug-change marks on the bar
function tlTick(){if(TL.busy)return;if(TL.t0==null){TL.t0=simT;tlSnap();}
 const last=TL.snaps[TL.snaps.length-1];if(simT-last.t>=TL.step)tlSnap();
 const k=tlKey();if(k!==TL.key){if(TL.key)TL.events.push(simT);TL.key=k;}
 if(simT>TL.max)TL.max=simT;const now=performance.now();if(!(now-TL._d<250)){TL._d=now;tlDraw();}}
// run the simulation on by `secs` seconds of simulated time, in 1 s steps (no screen updates in between)
function tlRun(secs){for(let s=0;s<secs;s++){const need=Math.floor((simT+1)*FS)-Math.floor(simT*FS);simT+=1;nmStep(1);step(need);stepR(need);runStory();
  const last=TL.snaps[TL.snaps.length-1];if(simT-last.t>=TL.step)tlSnap();}}
function tlAfter(){dirty=true;
 // marks made in the dropped part of the case go too
 try{if(typeof MT!=='undefined'){MT.hc=null;MT.gaps=MT.gaps.filter(g=>g.t<=simT);}}catch(e){}
 try{if(typeof ADV!=='undefined'){ADV.hc=null;ADV.full=true;ADV.chartKey=null;ADV.snaps=ADV.snaps.filter(x=>x.t<=simT);ADV.log=ADV.log.filter(x=>x.t<=advNow());}}catch(e){}
 try{if(typeof SED!=='undefined'){SED.hc=null;SED.full=true;SED.eg=null;SED.D=null;SED.outSince=null;const n=HIST.length?HIST[HIST.length-1].n:simT;SED.gaps=SED.gaps.filter(g=>g[0]<=n);if(SED._gapOpen!=null&&SED._gapOpen>n)SED._gapOpen=null;}}catch(e){}
 try{if(typeof PV!=='undefined'){PV.wv=null;PV.dirty=true;}}catch(e){}
 try{snapshotEx();}catch(e){}
 TL.key=tlKey();tlDraw();}
// jump to sim time T (seconds); back: restore and run on to T; forward: run on. Long runs go in slices so the page stays alive.
function tlJump(T){if(TL.busy)return;T=Math.round(T);const lo=TL.snaps.length?TL.snaps[0].t:simT;T=Math.max(lo,T);if(Math.abs(T-simT)<1)return;
 TL.busy=true;const wasPaused=paused;paused=true;tlBusyUI(true);
 const finish=()=>{TL.busy=false;paused=wasPaused;tlBusyUI(false);tlAfter();};
 if(T<simT){let i=TL.snaps.length-1;while(i>0&&TL.snaps[i].t>T-20)i--;const s=TL.snaps[i];
  stopStory();tlSetUi(s.ui);
  tlSetChan(s.L,mods);swapCh();try{tlSetChan(s.R,modsR);}finally{swapCh();}
  Object.assign(nm,s.nm);story=s.story?Object.assign({},s.story):null;if(story)storyButtonUI('Stop demonstration');
  simT=s.t;TL.snaps.length=i+1;TL.events=TL.events.filter(t=>t<=simT);}
 let left=Math.round(T-simT);const total=Math.max(1,left);
 const slice=()=>{const n=Math.min(left,60);tlRun(n);left-=n;tlDraw();const tn=$('tNow');tn._t=null;tn.textContent=`${Math.round(100*(1-left/total))}%`;if(left>0)setTimeout(slice,0);else finish();};
 slice();}
// ----- the bar -----
function tlFmt(s){s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s/60)%60,x=s%60,p=n=>String(n).padStart(2,'0');return (h?h+':'+p(m):String(m))+':'+p(x);}
function tlDraw(){const cv=$('tCv');if(!cv||TL.t0==null)return;const w=cv.clientWidth||300,h=cv.clientHeight||28,dpr=Math.min(2,window.devicePixelRatio||1);
 if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
 const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
 const t0=TL.t0,span=Math.max(600,TL.max-t0,simT-t0),X=t=>4+(t-t0)/span*(w-8),y=h/2;
 c.fillStyle='rgba(140,160,190,.25)';c.fillRect(4,y-4,w-8,8);
 if(TL.max>simT){c.fillStyle='rgba(120,190,255,.3)';for(let a=X(simT);a<X(TL.max);a+=6)c.fillRect(a,y-4,Math.min(3,X(TL.max)-a),8);}
 c.fillStyle='#78bdff';c.fillRect(4,y-4,X(simT)-4,8);
 c.fillStyle='#f0c040';for(const t of TL.events)c.fillRect(Math.round(X(t))-1,y-9,2,18);
 const x=X(simT);c.fillStyle='#fff';c.beginPath();c.arc(x,y,7,0,7);c.fill();c.strokeStyle='#002f6c';c.lineWidth=2;c.stroke();
 const el=$('tNow'),txt2=tlFmt(simT-t0);if(el._t!==txt2){el._t=txt2;el.textContent=txt2;}
 el.title=TL.max-simT>=1?`Rewound ${tlFmt(TL.max-simT)}`:'Elapsed simulation time';
 const slider=$('timeScrub');if(slider&&!TL.scrubbing){slider.max=Math.max(900,Math.ceil((TL.max-t0+300)/300)*300);slider.value=Math.round(simT-t0);slider.setAttribute('aria-valuetext',tlFmt(simT-t0));}if(slider)slider.disabled=TL.busy;}
function tlBusyUI(on){$('tLine').classList.toggle('busy',on);$('tLine').setAttribute('aria-busy',String(on));const tn=$('tNow');tn._t=null;if(on)tn.textContent='…';}
document.querySelectorAll('#tBtns button').forEach(b=>b.onclick=()=>tlJump(simT+(+b.dataset.j)));
$('tCv').addEventListener('click',e=>{if(TL.t0==null)return;const r=e.currentTarget.getBoundingClientRect(),w=r.width,span=Math.max(600,TL.max-TL.t0,simT-TL.t0);
 tlJump(TL.t0+Math.max(0,Math.min(1,(e.clientX-r.left-4)/(w-8)))*span);});

// Native range provides pointer dragging, touch and keyboard seeking without duplicate step buttons.
$('timeScrub').addEventListener('input',e=>{TL.scrubbing=true;$('timePreview').textContent=tlFmt(+e.target.value);e.target.setAttribute('aria-valuetext',tlFmt(+e.target.value));});
$('timeScrub').addEventListener('change',e=>{const t=+e.target.value;TL.scrubbing=false;$('timePreview').textContent='';if(TL.t0!=null)tlJump(TL.t0+t);});
$('timeScrub').addEventListener('pointercancel',()=>{TL.scrubbing=false;$('timePreview').textContent='';tlDraw();});
