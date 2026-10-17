// BIS Advance screen, part 5: the history before the screen's first live second, the start of a case, and the demo case.
// The real monitor always shows a case that has been running for a while (the manual's screens show 30 to 60 minutes), so a case starts
// with about 35 minutes of earlier trend: columns made by throwaway copies of the sim's own engine (same spectra, same BIS formula)
// and laid out by a short script (awake, or an induction down to general anaesthesia for the demo). They are kept in ADV.pre, never in
// HIST, so the other screens are untouched. Loaded after adv-menu.js; everything runs at call time.
const ADV_DUR=2100,ADV_STEP=5; // 35 min of earlier trend, one point every 5 s
function advRng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
// columns of a throwaway engine held at one propofol depth (the same pipeline as step() in app.js, without artefact handling)
function advPool(depth,secs){
 const e=new Engine(),m={elderly:false,emg:false,diathermy:false,warmer:false,blink:false,nmb:false,nmbMode:'auto',side:'L'};
 e.setTarget('propofol',depth,m);e.snap();
 const win=[],out=[],sup=[],raw=[];
 for(let i=0;i<(secs+15)*FS;i++){win.push(e.sample());if(win.length>NWIN)win.shift();
  if((i+1)%HOP===0&&win.length>=NWIN){const P=spectrum(win).P,f=features(P,win);sup.push(f.supFrac);if(sup.length>63)sup.shift();
   const bsr=100*sup.reduce((a,b)=>a+b,0)/sup.length;raw.push(bisRaw(f,bsr));if(raw.length>15)raw.shift();
   if(i<15*FS)continue;
   const db=new Float32Array(NB);for(let k=0;k<NB;k++)db[k]=10*Math.log10(P[k]+1e-4);
   out.push({db,sef:f.sef,mf:f.mf,bis:raw.reduce((a,b)=>a+b,0)/raw.length,bsr,emg:27+10*Math.log10(1+12*e.tone+52*e.p.emg)+(Math.random()-.5)*3,tp:10*Math.log10(bandPow(P,0.5,47)+1e-4)+40,sp:f.suppressed?1:0});}}
 return out;}
// kind 'awake': the patient before induction (BIS near 96 at the start, easing to the awake level); kind 'case': a scripted induction,
// BIS from about 97 to the low 40s and EMG from about 45 dB to 30 dB, as the real monitor's demo case does
function advSeed(kind,S){
 const A=advPool(0,50),G=kind==='case'?advPool(0.55,50):null,N=ADV_DUR/ADV_STEP,rnd=advRng(kind==='case'?11:5),pre={L:[],R:[]};
 const bumps=kind==='case'?[[.34,.07,2.6],[.55,.08,-2.1],[.80,.06,1.7]]:[[.16,.07,1.9],[.40,.08,-2.8],[.64,.06,2.2],[.88,.06,-1.5]]; // [centre, width, dB of L over R]
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ema={L:null,R:null},dbE={L:null,R:null};
 for(let i=0;i<N;i++){
  const u=i/N,n=S-ADV_DUR+i*ADV_STEP,al=kind==='case'?clamp((u-.08)/.035,0,1):0;
  const off=bumps.reduce((a,[c,w,db])=>a+db*Math.exp(-Math.pow((u-c)/w,2)),0);
  for(const s of ['L','R']){
   const a=A[Math.floor(rnd()*A.length)],g=G?G[Math.floor(rnd()*G.length)]:a,mx=(x,y)=>x+(y-x)*al;
   let bis=mx(a.bis,g.bis)+(kind==='case'?4.5*(1-al)+3.2*Math.sin(u*23+1)*al+2.2*Math.sin(u*61)*al:3.4*clamp(1-u*7,0,1)+1.6*Math.sin(u*19+(s==='R'?1.3:0))+1.1*Math.sin(u*53));
   bis=clamp(bis,5,99);ema[s]=ema[s]==null?bis:ema[s]*.62+bis*.38;
   const emg=Math.max(30,mx(a.emg+(kind==='case'?7*(1-u*2>0?1-u*2:0):0),g.emg)),sg=s==='L'?1:-1;
   const db=new Float32Array(NB),pv=dbE[s];for(let k=0;k<NB;k++){const v=a.db[k]+(g.db[k]-a.db[k])*al;db[k]=pv?pv[k]*.5+v*.5:v;}dbE[s]=db;
   pre[s].push({n,db,sef:mx(a.sef,g.sef),mf:mx(a.mf,g.mf),bis:ema[s],bsr:mx(a.bsr,g.bsr),emg,sqi:90+Math.floor(rnd()*9),tp:mx(a.tp,g.tp)+sg*off*1.25,art:0,sp:rnd()<al?g.sp:a.sp,st:0,bc:0,amp:20,ce:0});}}
 return {pre,t0:S-ADV_DUR};}
// the monitor's history of one side: the earlier trend, then the live columns from the start of the case
function advHist(s){const live=s==='R'?R.HIST:HIST,p=(ADV.pre&&ADV.pre[s])||[],c=ADV.hc||(ADV.hc={}),k=c[s],last=live.length?live[live.length-1].n:-1;
 if(k&&k.len===live.length&&k.last===last&&k.p===p&&k.cut===ADV.cut)return k.arr;
 const i=ADV.cut==null?0:advLb(live,ADV.cut),arr=p.length?p.concat(i?live.slice(i):live):(i?live.slice(i):live);
 c[s]={len:live.length,last,p,cut:ADV.cut,arr};return arr;}
// start a case now: a new ID, the earlier trend, an empty snapshot and event list
function advStartCase(kind,S){S=S==null?Math.floor(simT):S;ADV.cut=S;const sd=advSeed(kind||'awake',S);ADV.pre=sd.pre;ADV.t0=sd.t0;ADV.caseId=advNewId();ADV.snaps=[];ADV.log=[];ADV.act={};ADV.hc=null;
 ADV.review=null;ADV.chartKey=null;advInval();}
// run the engines on without the screen (the way the page's warm start does): the demo case and a restored state must read right at once
function advPrime(secs){snapAll();step(secs*FS);stepR(secs*FS);simT+=secs;dirty=true;}
// the demo case: propofol general anaesthesia (BIS in the low 40s), the page's own drug state kept to be put back on exit
function advDemoSimOn(){try{stopStory();}catch(e){}
 if(!ADV.demoSave)ADV.demoSave={mode,drug,val:$('depth').value,last:lastSingle,mix:Object.assign({},mix),nmb:mods.nmbMode};
 $('depth').value=55;setDrug('propofol');advPrime(20);return Math.floor(simT);}
function advDemoSimOff(){const v=ADV.demoSave;ADV.demoSave=null;if(!v)return;try{stopStory();}catch(e){}
 if(v.mode==='mix'){Object.assign(mix,v.mix);showMode('mix');drug='mix';depth=mix;syncMix();applyTarget();}else{$('depth').value=v.val;setDrug(v.drug==='mix'?v.last:v.drug);}
 advPrime(20);}

// ----- start-up (manual 3.6.3 and 3.6.5) -----
// 'Connect BISx to start monitoring', 'Initializing BISx', 'Connect sensor to start monitoring' (with an Alarm Settings button), then the sensor check
// opens by itself and the case starts when it ends. The Skip start-up link under the screen goes straight to the case.
const ADV_BOOT=[['Connect BISx to start monitoring',1100],['Initializing BISx',2000],['Connect sensor to start monitoring',1800]];
function advBootBegin(){ADV.boot={ph:0,t:Date.now()};ADV.review=null;ADV.sensor=null;ADV.dlg=null;ADV.menu=false;advOv();advBootUI();}
function advBootUI(){const B=ADV.boot,S=aq('advS'),el=aq('advBoot');if(!S)return;S.classList.toggle('idle',!!B);el.hidden=!B;aq('advSkip').hidden=!B;aq('advBootBtn').hidden=!!B;
 if(!B){el.innerHTML='';el._ph=null;return;}
 if(B.ph>=3){el.innerHTML='';el._ph=3;return;}
 const ph=B.ph,txt=ADV_BOOT[ph][0];if(el._ph===ph)return;el._ph=ph;
 el.innerHTML=`<div class="bm" role="alertdialog" aria-label="${txt}"><div class="tt">${txt}</div>${ph===1?'<span class="spin2" aria-hidden="true"></span>':''}${ph===2?'<button type="button" class="xbtn pr" data-a="alarms" id="advBootAl">ALARM SETTINGS</button>':''}</div>`;}
function advBootTick(now){const B=ADV.boot;if(!B)return;
 if(B.ph<3&&now-B.t>ADV_BOOT[B.ph][1]){B.ph++;B.t=now;advBootUI();if(B.ph===3)advSensorStart();}
 else if(B.ph===3&&!ADV.sensor)advBootEnd();}
function advBootEnd(){if(!ADV.boot)return;ADV.boot=null;if(ADV.sensor){ADV.sensor=null;if(ADV.dlg&&ADV.dlg.name==='sensor'){ADV.dlg=null;advOv();}}
 advStartCase('awake');advBootUI();advHeaders();advChrome();advInval();ADV.alarmDirty=true;}
// the Simulate row under the screen (outside the monitor): the start-up skip, and the technical alarms the real monitor can raise
function advSimClick(e){const b=e.target.closest('[data-sim]');if(!b)return;const k=b.dataset.sim;if(k==='skip'){advBootEnd();return;}if(k==='boot'){advBootBegin();return;}
 ADV[k]=!ADV[k];b.setAttribute('aria-pressed',String(ADV[k]));ADV.alarmDirty=true;ADV.numKey=null;
 // a drive pulled out while a live recording runs: the wording of the manual's message table
 if(k==='usb'&&!ADV.usb&&ADV.rec){ADV.rec=false;advMsg('Export failed - USB drive removed');if(ADV.dlg&&ADV.dlg.name==='download')advOv();}
 advInval();}
