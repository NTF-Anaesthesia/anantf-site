// Masimo SedLine screen (the 'sedline' skin), part 1: state, settings, the DOM around the two canvases, hit regions, alarms, sound and the
// per-frame tick. Built from Masimo's operator's manuals and screen figures (eeg/NOTES.md, "Masimo SedLine"): a Root monitor, 800 x 1280,
// portrait. Loaded before sed-draw.js and sed-menu.js and app.js; reads app.js globals only when called, never at load.
const sq=id=>document.getElementById(id);
// factory defaults of every setting the monitor has (the menu tree is in sed-menu.js); null = Off
const SED_DEF={profile:'ADULT',psiHi:50,psiLo:25,psiCH:null,psiCL:null,silence:120,audible:true,psiYmax:100,psiYmin:0,psiTmax:50,psiTmin:25,
 dsaHi:15,dsaLo:-40,sefThick:3,maxHz:30,dsaType:'Multitaper',emgYmax:100,emgYmin:0,emgSens:'Standard',srYmax:100,srYmin:0,srHi:null,srCH:null,srSil:120,
 artfYmax:100,artfYmin:0,sefYmax:30,sefYmin:0,stUnit:'HH:MM',eegAmp:5,eegSpeed:30,eegFilter:true,placement:'EEG/PSi/DSA',monImp:true,dispImp:true,dsaArt:true,
 cursor:true,smart:false,trendLayout:'Dynamic',analogRange:'Fixed',clock24:false,dateFmt:'MM/DD/YY',pauseDur:120,alarmVol:10,pulseVol:3,smartTone:false,standby:false,
 allMute:true,lockVol:false,dataColl:true,brightness:10,layout:6};
const SED={built:false,set:Object.assign({},SED_DEF),view:'trend',range:30,hold:null,exp:{emg:1,psi:1,sr:1},strip:false,pop:null,dlg:null,full:true,ver:0,
 sim:{disc:false,off:false,none:false,hiz:false,gel:false,expired:false,batt:false},gaps:[],events:[],pre:null,hc:null,D:null,N:null,alm:null,L:null,elec:null,
 imp:{R2:10.0,R1:4.9,CT:5.1,CB:7.4,L1:7.3,L2:5.3},silenceUntil:0,silenceShown:false,pauseUntil:0,pausePerm:false,armed:false,outSince:null,beeps:0,sounding:false,nextBeep:0,
 msgI:0,msgT:0,lastScrub:0,standbyOn:false,_gapOpen:null,_sec:0,_k:1};
SED.emgOff=()=>SED.set.emgSens==='Maximum'?31:34;SED.emgSpan=()=>SED.set.emgSens==='Maximum'?16:22;
const RANGES_H=[10,20,30,60,120]; // the trend time ranges seen on the monitor (minutes)
function sedSave(){try{localStorage.setItem('bisdsa.sed',JSON.stringify({set:SED.set,view:SED.view,range:SED.range,exp:SED.exp}));}catch(e){}}
function sedLoad(){try{const d=JSON.parse(localStorage.getItem('bisdsa.sed')||'null');if(!d)return;if(d.set)for(const k in SED_DEF)if(k in d.set&&typeof d.set[k]===typeof SED_DEF[k]||d.set&&k in d.set&&(d.set[k]===null||SED_DEF[k]===null))SED.set[k]=d.set[k];
 if(d.view==='analog')SED.view='analog';else if((d.view==='eeg'||d.view==='dsa')&&SED.set.layout<6)SED.view=d.view;if(RANGES_H.includes(d.range))SED.range=d.range;if(d.exp&&typeof d.exp==='object')SED.exp=d.exp;}catch(e){}}
const sedInval=()=>{SED.full=true;SED.ver++;try{dirty=true;}catch(e){}};
const sEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ----- build -----
function sedBuild(){if(SED.built)return;SED.built=true;sedLoad();
 sq('sedWrap').innerHTML=`<div class="sedcase"><div class="sedbezel"><span class="sedlogo" aria-hidden="true"><svg viewBox="0 0 22 14" width="22" height="14"><path d="M11 13.2C5 9.4 1.4 6.6 1.4 3.9 1.4 2 2.9.8 4.7.8c2.4 0 4.6 1.5 6.3 4.1C12.700 2.300 14.900.8 17.300.8c1.800 0 3.300 1.200 3.300 3.100 0 2.700-3.600 5.500-9.600 9.300z" fill="#e4002b"/><path d="M11 5.200l2.400 3.300-2.400 1.800-2.400-1.800z" fill="#17171a"/></svg><b>Masimo</b></span>
  <div class="seds" id="sedS" role="group" aria-label="Masimo SedLine monitor screen, on a Root">
   <canvas id="sedCv" class="a" style="--x:0;--y:0;--w:800;--h:1280" role="img" aria-label="SedLine trends, density spectral arrays and EEG"></canvas>
   <canvas id="sedEeg" class="a" style="--x:0;--y:110;--w:800;--h:300" aria-hidden="true"></canvas>
   <div id="sedHits"></div><div id="sedPop"></div><div id="sedDlg" hidden></div><div id="sedStandby" class="sstandby" hidden><button type="button" data-a="wake">Monitoring suspended. Touch to resume.</button></div>
  </div><span class="sedroot" aria-hidden="true">Root</span></div>
  <details class="sedctl" id="sedCtl"><summary>Controls</summary><p class="sednote">Teaching simulation: the EEG is synthetic and the PSi is a stand-in, not Masimo’s algorithm. These keys are not on a Root (the touchscreen does all of it); they are here for keyboards and screen readers.</p>
  <div class="bilkeys"><button type="button" id="bSilent">Silent</button><button type="button" id="bMenu" aria-haspopup="dialog" aria-expanded="false">Menu</button><button type="button" id="bSensor" aria-pressed="false">Sensor check</button></div>
  <div class="sedsim" id="sedSim" role="group" aria-label="Simulator controls, outside the monitor"><span class="sl">Display:</span><button type="button" data-st="1" aria-pressed="false">Suppression Time (ST) row</button></div></details></div>`;
 SED.cv=sq('sedCv');SED.cvE=sq('sedEeg');
 const S=sq('sedS');S.addEventListener('click',sedClick);S.addEventListener('pointerdown',sedPointer);S.addEventListener('wheel',sedWheel,{passive:false});document.addEventListener('keydown',sedKey);
 const stb=document.querySelector('[data-st]');if(stb)stb.setAttribute('aria-pressed',String(!!SED.set.smart));
 sq('bSilent').onclick=()=>sedBell(true);sq('bMenu').onclick=()=>{if(SED.dlg)sedDlgClose();else sedDlgOpen('main');}; /* Menu: open the Main Menu; with a page open it closes the whole menu (Escape is back one level) */sq('bSensor').onclick=()=>sedStripToggle();
 sq('sedSim').addEventListener('click',e=>{const st=e.target.closest('[data-st]');if(st){SED.set.smart=!SED.set.smart;st.setAttribute('aria-pressed',String(SED.set.smart));sedSave();SED._hk=null;sedInval();return;}const b=e.target.closest('[data-sim]');if(!b)return;const k=b.dataset.sim;SED.sim[k]=!SED.sim[k];b.setAttribute('aria-pressed',String(SED.sim[k]));if(k==='disc'||k==='off'||k==='none')sedGapTrack();sedInval();SED.elec=null;});
 document.addEventListener('pointerdown',()=>sedUnlock(),{once:true});
 sedPre();sedHits();if(typeof applyBrightness==='function')applyBrightness();}
// the earlier trend: a monitor shows a case that has been running for a while, so the screen opens with 30 minutes of awake history,
// one column a second, laid out from the sim's own spectra (throwaway engines; kept in SED.pre, never in HIST)
function sedPre(){if(SED.pre)return;const A=advPool(0,60),first=HIST.length?HIST[0].n:1,N=1800,rnd=advRng(77),pre={L:[],R:[]},emaB={L:null,R:null};let dbp={L:null,R:null};
 for(let i=0;i<N;i++){const u=i/N,n=first-N+i,off=1.2*Math.sin(u*9+1)+.8*Math.sin(u*23);
  for(const s of ['L','R']){const a=A[Math.floor(rnd()*A.length)],sg=s==='L'?1:-1;let b=a.bis+3.5*clampv(1-u*6,0,1)+1.5*Math.sin(u*17+(s==='R'?1.3:0));emaB[s]=emaB[s]==null?b:emaB[s]*.8+b*.2;
   pre[s].push({n,db:a.db,sef:a.sef,mf:a.mf,bis:emaB[s],bsr:a.bsr,emg:a.emg,sqi:92+Math.floor(rnd()*7),tp:a.tp+sg*off*.6,art:rnd()<.004?1:0,sp:0,st:0,bc:0,amp:20,ce:0});}}
 SED.pre=pre;SED.hc=null;}
// ----- hit regions: transparent buttons over the canvas, placed in design pixels (they carry the labels for keyboards and screen readers) -----
function sedHits(){const L=sedLay(),k=SED.view+'|'+SED.range+'|'+JSON.stringify(SED.exp)+'|'+SED.set.placement+'|'+SED.set.smart+'|'+SED.strip+'|'+(SED.pop?SED.pop.kind:'')+'|'+SED.set.standby+'|'+SED.set.layout;if(SED._hk===k)return;SED._hk=k;
 const H=[],b=(a,x,y,w,h,lab,v)=>H.push(`<button type="button" class="hit" data-a="${a}"${v!=null?` data-v="${v}"`:''} aria-label="${sEsc(lab)}" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u));width:calc(${w}*var(--u));height:calc(${h}*var(--u))"></button>`);
 b('bell',8,5,60,60,'Alarm silence');b('pause',78,5,60,60,'Audio pause');if(SED.set.standby)b('standby',148,5,60,60,'Standby');
 b('profile',SED.set.profile==='PEDIATRIC'?400:431,10,SED.set.profile==='PEDIATRIC'?118:87,23,'Profile: '+SED.set.profile.toLowerCase());b('clock',715,8,72,24,'Time and date: localization');
 b('actiontab',703,L.wy+5,84,25,'View options: '+(L.compact?'trend, EEG, DSA or analog':'trend or analog'));
 if(L.eeg){b('strip',366,L.eeg.y-10,68,12,'Electrode status');
  b('eegset',52,L.eeg.y+L.eeg.h-22,110,22,'EEG chart speed: '+SED.set.eegSpeed+' millimetres per second');b('eegset',690,L.eeg.y+L.eeg.h-22,95,22,'EEG amplitude: '+SED.set.eegAmp+' microvolts per millimetre');}
 if(L.rows.length)L.rows.forEach(r=>{b('num',560,r.y,227,r.h,SED_NAME[r.k]+' value: open its menu',r.k);b('axis',12,r.y,38,r.h,SED_NAME[r.k]+' trend settings',r.k);});
 else if(L.gauge){const g=L.gauge,gx=x=>(L.compact?400*(1-g.s):0)+x*g.s,gy=y=>g.y+(y-410)*g.s;b('num',gx(60),gy(440),300*g.s,280*g.s,'PSI gauge: open its menu','psi');b('num',gx(500),gy(430),240*g.s,150*g.s,'EMG gauge: open its menu','emg');b('num',gx(500),gy(598),240*g.s,130*g.s,'SR gauge: open its menu','sr');}
 const wl=L.compact?L.cwell:L.well,wy=L.compact?L.cwY:L.wellY,wh=L.compact?L.cwH:L.wellH,wn=wl.length;wl.forEach((kk,i)=>{const cx=wn===1&&kk==='psi'?125:12+775*(i+.5)/wn,ww=L.compact?120:220;b('num',cx-ww/2,wy,ww,wh,SED_NAME[kk]+' value: open its menu',kk);});
 if(L.dsa){const g=L.dsa,ry=g.y+g.lh+g.ah+17;b('dsa',DX,g.y,DW,g.lh,'Left density spectral array: open its settings');b('dsa',DX,ry,DW,g.lh,'Right density spectral array: open its settings');b('asym',DX,g.y+g.lh,DW,g.ah,'Asymmetry graph: open its menu');b('asym',730,g.y+g.lh,60,g.ah,'Asymmetry value: open its menu');}
 b('scrub',14,1190,541,42,'History: tap to move the time shown');b('zminus',560,1190,75,42,'Shorter time range');b('zreset',635,1190,70,42,'Time range: press to reset to 0:30');b('zplus',705,1190,85,42,'Longer time range');
 b('flag',14,1236,50,42,'Mark an event');b('gear',736,1234,56,46,'Main menu');
 sq('sedHits').innerHTML=H.join('');}
// ----- the action menu and the number menu -----
function sedPopRender(){const P=SED.pop,el=sq('sedPop'),L=SED.L||sedLay(),key=P?JSON.stringify(P)+SED.view+'|'+SED.set.layout:'';sedIdle();if(el._k===key)return;el._k=key;
 if(!P){el.innerHTML='';return;}
 const ico={trend:'<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 24l9-11 8 7 9-13 8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="13" r="3" fill="currentColor"/><circle cx="20" cy="20" r="3" fill="currentColor"/><circle cx="29" cy="7" r="3" fill="currentColor"/><circle cx="37" cy="15" r="2.6" fill="currentColor"/></svg>',analog:'<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M4 27a16 16 0 0 1 32 0" fill="none" stroke="currentColor" stroke-width="3.2" stroke-dasharray="5 2.6"/><path d="M20 27l-3-12" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="27" r="2.4" fill="currentColor"/></svg>',
  eeg:'<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M20 3c-7 0-12 5-12 11 0 3 1 5 2 7v3c0 2 2 3 4 3h3l1-3h4c3 0 4-2 4-4v-1c1-1 2-2 2-4 0-7-4-12-8-12z" fill="currentColor"/><path d="M14 13c2-3 4 3 6 0s3 2 5-1" fill="none" stroke="#2b2b2b" stroke-width="1.6" stroke-linecap="round"/></svg>',
  dsa:'<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M8 18c-3-5 0-11 6-12 3-3 8-3 11 0 6 0 9 5 7 10-1 5-5 8-9 8-3 2-7 2-9-1-3 0-5-2-6-5z" fill="currentColor"/></svg>'};
 if(P.kind==='action'){const cmp=L.compact,vs=cmp?['trend','eeg','dsa','analog']:['trend','analog'],cur=cmp?L.view:(SED.view==='analog'?'analog':'trend'),px=cmp?362:578,pw=cmp?425:209,ph=cmp?73:66,py=L.wy+(cmp?27:37);
  el.innerHTML=`<div class="spop act" role="menu" aria-label="View options" style="left:calc(${px}*var(--u));top:calc(${py}*var(--u));width:calc(${pw}*var(--u));height:calc(${ph}*var(--u))">`+vs.map(v=>`<button type="button" role="menuitemradio" aria-checked="${cur===v}" class="${cur===v?'cur':''}" data-a="view" data-v="${v}">${ico[v]}<span>${v.toUpperCase()}</span></button>`).join('')+`</div>
  <button type="button" class="spopclose" data-a="popclose" aria-label="Close view options" style="left:calc(705*var(--u));top:calc(${py+ph+6}*var(--u));width:calc(80*var(--u));height:calc(21*var(--u))"><svg viewBox="0 0 40 16" aria-hidden="true"><path d="M13 9l7-5 7 5M13 14l7-5 7 5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`;return;}
 if(P.kind==='num'){const k=P.k,y=Math.max(120,Math.min(1000,P.y)),x=Math.max(20,Math.min(560,P.x));
  // the real number menu offers About and the parameter's settings only
  el.innerHTML=`<div class="spop num" role="menu" aria-label="${SED_NAME[k]} menu" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u))"><b>${SED_NAME[k]}</b>
   <button type="button" role="menuitem" data-a="about" data-v="${k}">About</button><button type="button" role="menuitem" data-a="pset" data-v="${k}">Settings</button></div>`;}}
// ----- clicks -----
function sedUnlock(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;SED.ac=SED.ac||new A();if(SED.ac.state==='suspended')SED.ac.resume();}catch(e){}}
function sedBeep(n,f){SED.beeps++;try{const ac=SED.ac;if(!ac||ac.state!=='running')return;const g=ac.createGain();g.gain.value=0.012*SED.set.alarmVol*SED.set.alarmVol/10;g.connect(ac.destination);for(let i=0;i<n;i++){const o=ac.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);const t=ac.currentTime+i*0.18;o.start(t);o.stop(t+0.1);}}catch(e){}}
function sedStripToggle(){SED.strip=!SED.strip;sq('bSensor').setAttribute('aria-pressed',String(SED.strip));SED.elec=null;SED._hk=null;sedInval();}
function sedBell(fromKey){const now=Date.now();sedUnlock();
 // a second press while silenced cancels the silence (INFERRED: the manual is silent on it); with nothing sounding or silenced the monitor ignores the key
 if(SED.silenceUntil>now){SED.silenceUntil=0;SED.silenceShown=false;}else if(SED.alm&&SED.alm.level){SED.lastBell=now;SED.silenceUntil=now+SED.set.silence*1000;SED.silenceShown=true;}else return;
 SED.nextBeep=0;sedInval();}
function sedPause(){const now=Date.now();if(SED.pauseUntil>now||SED.pausePerm){SED.pauseUntil=0;SED.pausePerm=false;}else{const d=SED.set.pauseDur;if(d>0)SED.pauseUntil=now+d*1000;else SED.pausePerm=true;}sedUnlock();sedInval();}
function sedClick(e){sedIdle();if(SED._swallow){SED._swallow=false;e.stopPropagation();return;}const el=e.target.closest('[data-a]');if(!el){if(SED.pop&&SED.pop.kind==='num'){SED.pop=null;sedInval();}return;}
 const a=el.dataset.a,v=el.dataset.v;sedUnlock();
 if(SED.standbyOn){if(a==='wake'){SED.standbyOn=false;sq('sedStandby').hidden=true;sedInval();}return;}
 if(SED.dlg&&typeof sedDlgAct==='function'&&el.closest('#sedDlg')){sedDlgAct(a,v,el);return;}
 const r=el.getBoundingClientRect(),S=sq('sedS').getBoundingClientRect(),kx=800/S.width,px=(r.left-S.left)*kx,py=(r.top-S.top)*kx;
 if(a!=='num'&&a!=='popclose'&&a!=='about'&&a!=='pset'&&a!=='expand'&&a!=='minimise'&&a!=='view'&&a!=='actiontab')SED.pop=null;
 switch(a){
  case 'bell':sedBell();return;case 'pause':sedPause();return;
  case 'standby':SED.standbyOn=true;sq('sedStandby').hidden=false;return;
  case 'profile':sedDlgOpen('profiles');return;case 'clock':sedDlgOpen('localization');return;
  case 'actiontab':SED.pop=SED.pop&&SED.pop.kind==='action'?null:{kind:'action'};sedInval();return;
  case 'view':SED.view=v;SED.pop=null;sedSave();SED._hk=null;sedInval();return;
  case 'popclose':SED.pop=null;sedInval();return;
  case 'strip':sedStripToggle();return;
  case 'eegset':sedDlgOpen('add');return;
  case 'num':SED.pop={kind:'num',k:v,x:Math.min(560,px+20),y:py+10};sedInval();return;
  case 'axis':sedDlgOpen('p_'+v+'_trends');return;
  case 'about':SED.pop=null;sedDlgOpen('about_'+v);return;
  case 'pset':SED.pop=null;sedDlgOpen('p_'+v);return;
  case 'expand':sedExpand(v);return;
  case 'minimise':sedMinimise(v);return;
  case 'dsa':sedDlgOpen('p_dsa');return;case 'asym':sedDlgOpen('about_asym');return;
  case 'zminus':{const i=RANGES_H.indexOf(SED.range);SED.range=RANGES_H[Math.max(0,i-1)];sedSave();SED._hk=null;sedInval();return;}
  case 'zplus':{const i=RANGES_H.indexOf(SED.range);SED.range=RANGES_H[Math.min(RANGES_H.length-1,i+1)];sedSave();SED._hk=null;sedInval();return;}
  case 'zreset':SED.range=30;sedSave();SED._hk=null;sedInval();return;
  case 'scrub':{const rr=el.getBoundingClientRect(),x=(e.clientX-rr.left)/rr.width,D=SED.D;if(!D)return;const span=Math.min(7200,Math.max(60,D.now-D.start)),t0=D.now-span,t=t0+x*span;sedScrubTo(t);return;}
  case 'flag':SED.events.push(simT);sedInval();return; // a small flag on the history bar and the trend axis; the real screen's feedback is unpublished, so no text
  case 'gear':sedDlgOpen('main');return;}}
function sedExpand(v){SED.exp[v]=1;if(SED.set.trendLayout==='Fixed'){const ks=SED_PARAMS.filter(k=>SED.exp[k]&&k!==v);while(ks.length>2)delete SED.exp[ks.shift()];}SED.pop=null;sedSave();SED._hk=null;sedInval();}
function sedMinimise(v){delete SED.exp[v];SED.pop=null;sedSave();SED._hk=null;sedInval();}
function sedScrubTo(t){const D=SED.D;if(!D)return;const lo=Math.min(D.now,D.start+1200);let end=t+600;if(end>=D.now-8)SED.hold=null;else SED.hold=Math.max(lo,end);SED.lastScrub=Date.now();sedInval();}
// ----- gestures: a drag along any trend or the DSA scrolls them all, a wheel or pinch changes the time range of all trends, press-and-hold
// a number then drag moves it between the well (minimise) and the trends (expand), a vertical drag on the handle pulls the electrode strip -----
function sedIdle(){clearTimeout(SED._idle);if(SED.dlg||SED.pop)SED._idle=setTimeout(sedIdleFire,SED.idleMs||60000);}
// the Root manual: any menu screen returns to the main screen after 1 minute without a touch; unsaved changes are dropped (Cancel)
function sedIdleFire(){if(SED.dlg)sedDlgClose();if(SED.pop){SED.pop=null;sedInval();}}
function sedRange(dir){const i=RANGES_H.indexOf(SED.range),n=RANGES_H[clampv(i+dir,0,RANGES_H.length-1)];if(n!==SED.range){SED.range=n;sedSave();SED._hk=null;sedInval();}}
function sedWheel(e){const S=sq('sedS').getBoundingClientRect(),k=800/S.width,x=(e.clientX-S.left)*k,y=(e.clientY-S.top)*k,L=SED.L;if(SED.dlg||!L||!L.rows.length||x<50||x>600||y<L.trendY||y>L.trendY+L.trendH)return;
 e.preventDefault();const now=Date.now();if(now-(SED._wh||0)<260)return;SED._wh=now;sedRange(e.deltaY>0?1:-1);}
function sedPointer(e){sedIdle();SED._swallow=false;if(SED.dlg||SED.standbyOn)return;
 const S=sq('sedS'),sr=S.getBoundingClientRect(),k=800/sr.width,toD=ev=>({x:(ev.clientX-sr.left)*k,y:(ev.clientY-sr.top)*k}),p0=toD(e),L=SED.L||sedLay(),D=SED.D,el=e.target.closest('[data-a]'),a=el?el.dataset.a:'';
 const inTrend=L.rows.length>0&&p0.x>=50&&p0.x<=600&&p0.y>=L.trendY&&p0.y<L.trendY+L.trendH,inDsa=!!L.dsa&&p0.x>=DX&&p0.x<=DX+DW&&p0.y>=L.dsa.y&&p0.y<L.dsa.y+L.dsaH;
 // the history bar: drag to move the time shown
 if(a==='scrub'){const rr=el.getBoundingClientRect(),move=ev=>{const D2=SED.D;if(!D2)return;const x=clampv((ev.clientX-rr.left)/rr.width,0,1),span=Math.min(7200,Math.max(60,D2.now-D2.start));sedScrubTo(D2.now-span+x*span);};
  const up=()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up);};addEventListener('pointermove',move);addEventListener('pointerup',up);return;}
 // the handle (and the open strip): swipe down to show the electrode status, up to hide it
 const onHandle=!!L.eeg&&(a==='strip'||(SED.strip&&p0.x>=12&&p0.x<=787&&p0.y>=L.eeg.y&&p0.y<=L.eeg.y+70));
 if(onHandle){const up=ev=>{removeEventListener('pointerup',up);const dy=(ev.clientY-e.clientY)*k;if(Math.abs(dy)>12){SED._swallow=true;if(dy>0&&!SED.strip)sedStripToggle();else if(dy<0&&SED.strip)sedStripToggle();}};addEventListener('pointerup',up);return;}
 // press and hold a number (500 ms), then drag it into the well or onto a trend
 if(a==='num'&&!L.compact&&SED.view==='trend'&&D&&!SED.pop){const key=el.dataset.v;let moved=false,held=false;const t=setTimeout(()=>{if(moved)return;held=true;SED.dimK=key;sedInval();},500);
  const mv=ev=>{const q=toD(ev);if(!held&&Math.hypot(q.x-p0.x,q.y-p0.y)>8){moved=true;clearTimeout(t);}};
  const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);clearTimeout(t);if(!held)return;SED._swallow=true;SED.dimK=null;const q=toD(ev),Ln=sedLay();
   if(q.y>=Ln.wellY-6&&q.y<=Ln.wellY+90&&SED.exp[key])sedMinimise(key);else if(q.y>=Ln.trendY&&q.y<Ln.wellY-6&&!SED.exp[key])sedExpand(key);else sedInval();};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);return;}
 // a horizontal drag along a trend or the DSA scrolls all of them; two fingers (or ctrl-wheel on a trackpad) change the time range
 if((inTrend||inDsa)&&D){const sp=inDsa?1200/DW:D.sp,tE0=D.tE,id=e.pointerId;SED._ptr=SED._ptr||new Map();SED._ptr.set(id,{x:e.clientX,y:e.clientY});let dragging=false,pinch0=null;
  const mv=ev=>{const m=SED._ptr;if(m&&m.has(ev.pointerId))m.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
   if(m&&m.size===2){const [p,q]=[...m.values()],d=Math.hypot(p.x-q.x,p.y-q.y);if(pinch0==null)pinch0=d;else if(d>pinch0*1.35){pinch0=d;SED._swallow=true;sedRange(-1);}else if(d<pinch0/1.35){pinch0=d;SED._swallow=true;sedRange(1);}return;}
   const dx=(ev.clientX-e.clientX)*k;if(!dragging&&Math.abs(dx)<7)return;dragging=true;SED._swallow=true;
   const Dn=SED.D;if(!Dn)return;const lo=Math.min(Dn.now,Dn.start+1200),nh=clampv(tE0-dx*sp,lo,Dn.now);if(nh>=Dn.now-8)SED.hold=null;else SED.hold=nh;SED.lastScrub=Date.now();sedInval();};
  const up=ev=>{if(SED._ptr)SED._ptr.delete(ev.pointerId);removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);};
  addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);}}
function sedKey(e){if(!SED.built||mon.skin!=='sedline')return;
 sedIdle();if(e.key==='Tab'){const S=sq('sedS');if(S)S.classList.add('kb');}
 if(e.key==='Escape'){if(SED.dlg&&SED.dlg.list!=null){SED.dlg.list=null;sedDlgRender();e.preventDefault();e.stopImmediatePropagation();return;}if(SED.dlg){sedDlgBack();e.preventDefault();e.stopImmediatePropagation();return;}if(SED.pop){SED.pop=null;sedInval();e.preventDefault();e.stopImmediatePropagation();return;}}
 // keyboard route to the drag-and-drop customising: Arrow Up on a number expands it into a trend, Arrow Down minimises it into the well
 const h=document.activeElement;if(h&&h.matches&&h.matches('.hit[data-a="num"]')&&(e.key==='ArrowUp'||e.key==='ArrowDown')&&SED.view==='trend'&&!(SED.L&&SED.L.compact)){const k=h.dataset.v;if(e.key==='ArrowUp')sedExpand(k);else sedMinimise(k);e.preventDefault();}}
// ----- the gaps (no data while the sensor is off, not connected or the module is unplugged) -----
function sedGapTrack(){const on=SED.sim.disc||SED.sim.off||SED.sim.none,n=HIST.length?HIST[HIST.length-1].n:Math.floor(simT);
 if(on&&SED._gapOpen==null){SED._gapOpen=n;SED.gaps.push([n,null]);}
 else if(!on&&SED._gapOpen!=null){const g=SED.gaps[SED.gaps.length-1];g[1]=n;SED._gapOpen=null;}}
// ----- alarms and messages -----
function sedAlarmEval(){const N=SED.N,S=SED.sim,s=SED.set,msgs=[],t=simT;let par=null,sys=false;
 if(S.disc)msgs.push({text:'SedLine is Disconnected',lv:'hi'});
 else if(S.none)msgs.push({text:'No Sensor Connected',lv:'hi'});
 else if(S.off)msgs.push({text:'Sensor Off Patient',lv:'hi'});
 else{if(S.expired)msgs.push({text:'Replace Sensor',lv:'med'});if(S.hiz&&s.monImp)msgs.push({text:'High Impedance Detected',lv:'hi'});if(S.gel&&s.monImp)msgs.push({text:'Gel Bridging Detected',lv:'med'});
  if(N&&N.sqiMin<50)msgs.push({text:'Low SIQ',lv:'med'});}
 // PSi limits: out of them for 5 s from the start, so an awake patient on the factory limits shows PSI High>50 straight away (no arming)
 const v=N&&!N.blank?N.v.psi:null,hi=s.psiHi,lo=s.psiLo;
 if(v!=null){const inside=(hi==null||v<=hi)&&(lo==null||v>=lo);if(inside)SED.outSince=null;else if(SED.outSince==null)SED.outSince=t;
  if(!inside&&SED.outSince!=null&&t-SED.outSince>=5){const high=hi!=null&&v>hi;par={k:'psi',dir:high?1:-1,text:high?'PSI High>'+hi:'PSI Low<'+lo,lv:'med'};}}
 else SED.outSince=null;
 if(S.batt)sys=true;
 // one message in the title band at a time; with several, they take turns every 3 s
 const pm=par?{text:par.text,lv:par.lv,k:'psi'}:null,all=[...msgs];if(pm)all.push(pm);all.sort((a,b)=>(a.lv==='hi'?0:1)-(b.lv==='hi'?0:1));
 // only the highest priority present is shown in the title band (a red message hides a yellow one)
 const show=all.filter(m=>m.lv===(all.some(q=>q.lv==='hi')?'hi':m.lv)),cur=show.length?show[Math.floor(Date.now()/3000)%show.length]:null;
 SED.alm={level:all.length?all[0].lv:null,text:cur?cur.text:null,win:cur&&!cur.k?{level:cur.lv}:null,curPar:!!(cur&&cur.k),par:par?{k:'psi',level:par.lv,dir:par.dir}:null,sys,all};}
function sedSound(now){const A=SED.alm,silenced=SED.silenceUntil>now,paused=SED.pauseUntil>now||SED.pausePerm;if(SED.pauseUntil&&SED.pauseUntil<=now&&!SED.pausePerm){SED.pauseUntil=0;sedInval();}if(SED.silenceUntil&&SED.silenceUntil<=now){SED.silenceUntil=0;SED.silenceShown=false;sedInval();}
 const snd=A&&A.level&&(A.level==='hi'||SED.set.audible)&&!silenced&&!paused;SED.sounding=!!snd;
 if(snd&&now>=SED.nextBeep){sedBeep(A.level==='hi'?10:3,A.level==='hi'?988:784);SED.nextBeep=now+(A.level==='hi'?5000:9000);}if(!snd)SED.nextBeep=0;}
// ----- the frame hook (called from app.js's loop) -----
function sedTick(dirty){if(!SED.built)sedBuild();const now=Date.now();
 if(SED.hold!=null&&now-SED.lastScrub>60000){SED.hold=null;SED.full=true;}
 sedGapTrack();
 if(dirty||SED.full||!SED.D){SED.D=sedData();sedPaintDsa(SED.D);SED.N=sedNums();sedAlarmEval();if(!SED.elec||dirty)SED.elec=sedElec();SED.dirty=true;}
 // the electrode impedances drift a little
 if(Math.floor(now/3000)!==SED._imp){SED._imp=Math.floor(now/3000);for(const k in SED.imp){SED.imp[k]=Math.max(2.5,Math.min(14,SED.imp[k]+(Math.random()-.5)*.4));}SED.elec=sedElec();}
 sedSound(now);
 const sec=Math.floor(now/1000),key=SED.dirty||SED.full||SED._sec!==sec;
 if(key){sedDrawStatic();SED._sec=sec;SED.dirty=false;SED.full=false;SED._k=(SED.cv.clientWidth||400)*Math.min(2,window.devicePixelRatio||1)/800;
  sedHits();sedPopRender();sedSumm();}
 sedDrawEeg();}
function sedSumm(){const N=SED.N;if(!N)return;const f=k=>sedFmt(k,N,true)||'--';const t=`PSi ${f('psi')}, EMG ${f('emg')}%, SR ${f('sr')}%, ARTF ${f('artf')}%, SEFL ${f('sefl')} Hz, SEFR ${f('sefr')} Hz, ASYM ${Math.round(N.asym)}%`+(SED.alm&&SED.alm.text?', '+SED.alm.text:'');const e=sq('bilSum');if(e&&e._t!==t){e._t=t;e.textContent=t;}}
function sedApply(){sedBuild();SED.full=true;SED._hk=null;sedHits();}
