// BIS Advance screen (the 'advance' skin): a 1246 x 779 virtual LCD, built from the manufacturer's manual figures (eeg/NOTES.md,
// "Medtronic BIS Advance"). Chrome, numeric panels, menus and dialogs are DOM; the trends, DSA, ASYM and EEG are one canvas
// (adv-draw.js). Loaded before app.js; reads its globals (mon, HIST, R, COLS, simT, tim ...) only when called, never at load.
const aq=id=>document.getElementById(id);
const ADV={
 built:false,ch:2,hemi:'L',view:'graphs',                    // channels 2 (unilateral sensor) or 4 (bilateral); selected side; graphs or chart
 layout:{2:'dsa,eeg',4:'dsa,asym,eeg'},sec:'emg',win:60,chartInt:1,
 uvmm:{2:2,4:10},sweep:25,nch:{2:1,4:2},filters:true,imp:true,showVals:false,
 alarm:{bis:{on:false,lo:40,hi:60},sr:{on:false,hi:50},sef:{on:false,lo:12,hi:18}},vol:4,audioRem:false,
 audio:0,audioEnd:0,                                          // 0 audio on, 1 paused 120 s, 2 off (SILENT)
 hr24:true,dateFmt:'DD MMM YYYY',demo:false,admin:false,pw:'1234',
 menu:false,dlg:null,ctl:false,vol_:false,list:false,pop:null,focusBack:null,
 msgs:[],msgI:0,msgT:0,alarms:[],alarmI:0,alarmT:0,snaps:[],log:[],review:null,sensor:null,
 caseId:'ES8A',t0:0,beeps:0,sounding:false,nextBeep:0,nextRem:0,dsaCv:{},lay:null,d:null,full:true,dsaTest:null,
 dsc:null,usb:false,pre:null,cut:null,hc:null,boot:null,booted:false,disc:false,expired:false,batt:false};
const AM=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],apad=(n,w)=>String(n).padStart(w||2,'0');
function advDate(t){const d=new Date(T0+t*1000);return ADV.dateFmt==='DD MMM YYYY'?`${d.getDate()} ${AM[d.getMonth()]} ${d.getFullYear()}`:`${AM[d.getMonth()]} ${apad(d.getDate())} ${d.getFullYear()}`;}
function advClockS(t,secs){const d=new Date(T0+t*1000);let h=d.getHours();if(!ADV.hr24){const ap=h>=12?' PM':' AM';h=h%12||12;return apad(h)+':'+apad(d.getMinutes())+(secs?':'+apad(d.getSeconds()):'')+ap;}return apad(h)+':'+apad(d.getMinutes())+(secs?':'+apad(d.getSeconds()):'');}
const advInval=()=>{ADV.lay=null;ADV.d=null;ADV.full=true;try{dirty=true;}catch(e){}};
const advEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ----- icons (own drawings) -----
const IC={
 bell:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4a1.9 1.9 0 0 0-1.9 1.9v.5C7.5 5.5 6 7.8 6 10.7v3.7L4.1 17v1h15.8v-1L18 14.4v-3.7c0-2.9-1.5-5.2-4.1-5.9v-.5A1.9 1.9 0 0 0 12 2.4zM9.9 19.4a2.1 2.1 0 0 0 4.2 0z" fill="currentColor"/></svg>',
 check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.8l5 5L19.5 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 flag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3.5h2.2v17H5z" fill="currentColor"/><path d="M8.6 4.2c2.2-1 4.4 1 6.6 0 1.4-.6 2.6-.5 3.8 0l-2.6 3.8 2.6 3.8c-1.2-.5-2.4-.6-3.8 0-2.2 1-4.4-1-6.6 0z" fill="currentColor"/></svg>',
 infoL:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.3" r="2.6" fill="currentColor"/><path d="M9.6 9.4h4.8v10.4H9.6z" fill="currentColor"/></svg>',
 info:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor"/><path d="M12 10.2v7M12 6.2v1.8" stroke="#44546c" stroke-width="2.6" stroke-linecap="round"/></svg>',
 infoW:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M12 10.2v7M12 6.2v1.8" stroke="#343c4c" stroke-width="2.6" stroke-linecap="round"/></svg>',
 graph:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M5 12.5l3.2-3 2.8 4.2 3-6 2.2 4h2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 21h8" stroke="currentColor" stroke-width="1.8"/></svg>',
 table:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3.5" width="18" height="17" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M3 14.5h18M9 3.5v17M15 3.5v17" stroke="currentColor" stroke-width="1.6"/></svg>',
 gear:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.2 2h3.6l.6 2.7 1.7.7 2.3-1.5 2.6 2.6-1.5 2.3.7 1.7 2.7.6v3.6l-2.7.6-.7 1.7 1.5 2.3-2.6 2.6-2.3-1.5-1.7.7-.6 2.7h-3.6l-.6-2.7-1.7-.7-2.3 1.5-2.6-2.6 1.5-2.3-.7-1.7L2 13.8v-3.6l2.7-.6.7-1.7-1.5-2.3 2.6-2.6 2.3 1.5 1.7-.7z" fill="#fff"/><circle cx="12" cy="12" r="3.5" fill="#343c4c"/></svg>',
 out:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5V14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M13 4h7v7M20 4l-9 9" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 rise:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 3.5v17h17" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M7 15.5l4-4 3 3 6-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 7.5H20V12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 bellW:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4a1.9 1.9 0 0 0-1.9 1.9v.5C7.5 5.5 6 7.8 6 10.7v3.7L4.1 17v1h15.8v-1L18 14.4v-3.7c0-2.9-1.5-5.2-4.1-5.9v-.5A1.9 1.9 0 0 0 12 2.4zM9.9 19.4a2.1 2.1 0 0 0 4.2 0z" fill="#fff"/></svg>',
 list:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h2M3 9h2M3 13h2M3 17h2M3 21h2M8 5h13M8 9h13M8 13h13M8 17h13M8 21h13" stroke="currentColor" stroke-width="1.8"/></svg>',
 exit:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h11M10 7.5l4.5 4.5-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 x:'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
 bulb:'<svg viewBox="0 0 14 18" aria-hidden="true"><path d="M7 1.5a4.8 4.8 0 0 0-2.8 8.7c.5.4.8.9.8 1.5v.8h4v-.8c0-.6.3-1.1.8-1.5A4.8 4.8 0 0 0 7 1.5zM5.2 14.3h3.6M5.8 16.2h2.4" fill="none" stroke="#2f5d9a" stroke-width="1.2"/></svg>',
 // alarm-disabled indicator: a bell with a slash, as beside BIS, SR and SEF when their alarm is not set
 off:'<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 3.2a1.6 1.6 0 0 0-1.6 1.6v.4C7.2 5.8 5.8 7.6 5.8 10v3.1L4.2 15.2v.8h13.6v-.8l-1.6-2.1V10c0-2.4-1.4-4.2-3.6-4.8v-.4A1.6 1.6 0 0 0 11 3.2z" fill="none" stroke="#e8ecf2" stroke-width="1.4"/><path d="M3.5 3.5l15 15M18.5 3.5l-15 15" stroke="#e8ecf2" stroke-width="1.5" stroke-linecap="round"/></svg>',
 tri:'<svg viewBox="0 0 34 28" aria-hidden="true"><path d="M17 3L3 25h28z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>',
 tri2:'<svg viewBox="0 0 34 28" aria-hidden="true"><path d="M13 5L2 24h22z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M26 11c2 2.5 2 6 0 8.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 tri3:'<svg viewBox="0 0 34 28" aria-hidden="true"><path d="M13 5L2 24h22z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M26 11c2 2.5 2 6 0 8.5M30 8c3.6 4 3.6 10 0 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
 pause:'<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 5c-1.2 0-2 .8-2 1.8v.5C11.6 8.2 10 10.6 10 13.6V18l-2.4 3v1.2h18.8V21L24 18v-4.4c0-3-1.6-5.4-5-6.3v-.5c0-1-.8-1.8-2-1.8zM14.5 24.5a2.5 2.5 0 0 0 5 0z" fill="none" stroke="#3a4250" stroke-width="1.8" stroke-dasharray="1.6 2"/></svg>',
 silent:'<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 5c-1.2 0-2 .8-2 1.8v.5C11.6 8.2 10 10.6 10 13.6V18l-2.4 3v1.2h18.8V21L24 18v-4.4c0-3-1.6-5.4-5-6.3v-.5c0-1-.8-1.8-2-1.8zM14.5 24.5a2.5 2.5 0 0 0 5 0z" fill="#3a4250"/><path d="M5 5l24 24M29 5L5 29" stroke="#e2392b" stroke-width="2.4" stroke-linecap="round"/></svg>',
 spk:'<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M5 13h5l7-6v20l-7-6H5z" fill="#3a4250"/><path d="M21 12c2.5 2.7 2.5 7.3 0 10M25 9c4.2 4.5 4.2 11.5 0 16" fill="none" stroke="#3fb764" stroke-width="2.2" stroke-linecap="round"/></svg>',
 bellY:'<svg viewBox="0 0 34 34" aria-hidden="true"><path d="M17 5c-1.2 0-2 .8-2 1.8v.5C11.6 8.2 10 10.6 10 13.6V18l-2.4 3v1.2h18.8V21L24 18v-4.4c0-3-1.6-5.4-5-6.3v-.5c0-1-.8-1.8-2-1.8zM14.5 24.5a2.5 2.5 0 0 0 5 0z" fill="#3a4250"/></svg>',
 usb:'<svg viewBox="0 0 22 28" aria-hidden="true"><path d="M11 2v18M11 20a3 3 0 1 0 .01 0M11 12l-5-3v-3M11 15l5-3v-3" stroke="#c8ccd4" stroke-width="1.8" fill="none"/><path d="M11 .6l-2.6 3.6h5.2z" fill="#c8ccd4"/><rect x="14" y="5.5" width="4" height="3.6" fill="#c8ccd4"/><circle cx="6" cy="5.5" r="1.8" fill="#c8ccd4"/></svg>',
 serial:'<svg viewBox="0 0 30 18" aria-hidden="true"><path d="M3 1.5h24a1.8 1.8 0 0 1 1.8 1.8v6.2l-3.2 5.5a1.8 1.8 0 0 1-1.5.9H5.9a1.8 1.8 0 0 1-1.5-.9L1.2 9.5V3.3A1.8 1.8 0 0 1 3 1.5z" fill="#c8ccd4"/><path d="M7.5 5.2h1.6M11.2 5.2h1.6M14.9 5.2h1.6M18.6 5.2h1.6M22.3 5.2h1.6M9.4 9.6h1.6M13.1 9.6h1.6M16.8 9.6h1.6M20.5 9.6h1.6" stroke="#1c242c" stroke-width="1.9" stroke-linecap="round"/></svg>',
 netx:'<svg viewBox="0 0 30 18" aria-hidden="true"><path d="M4 2l22 14M26 2L4 16" stroke="#c8ccd4" stroke-width="2.6" stroke-linecap="round"/></svg>',
 batt:'<svg viewBox="0 0 28 14" aria-hidden="true"><rect x=".8" y=".8" width="23.4" height="12.4" rx="2.4" fill="none" stroke="#dce4ec" stroke-width="1.6"/><rect id="aBatFill" x="3.4" y="3.4" width="18.2" height="7.2" rx="1.2" fill="#dce4ec"/><rect x="25.3" y="4.6" width="2.5" height="4.8" rx="1" fill="#dce4ec"/></svg>',
 bolt:'<svg viewBox="0 0 14 24" aria-hidden="true"><path d="M9.6 0L1.2 13.2h5.2L4.2 24l8.6-13.4H7.4z" fill="#dce4ec"/></svg>',
 bubble:'<svg viewBox="0 0 26 22" aria-hidden="true"><path d="M2 2h22v14H12l-5 4v-4H2z" fill="none" stroke="#9aa6b6" stroke-width="1.6" stroke-linejoin="round"/></svg>'};
// ----- helpers for placed text -----
const advT=(id,x,y,fs,c,html,o)=>`<span ${id?`id="${id}" `:''}class="t ${o&&o.al||''} ${o&&o.cls||''}" style="--x:${x};--y:${y};--fs:${fs};--c:${c}${o&&o.fw?`;--fw:${o.fw}`:''}">${html}</span>`;
const advBox=(cls,x,y,w,h,inner,extra)=>`<div class="${cls}" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u));${w!=null?`width:calc(${w}*var(--u));`:''}${h!=null?`height:calc(${h}*var(--u));`:''}${extra||''}">${inner||''}</div>`;
// ----- build -----
function advBuild(){if(ADV.built)return;ADV.built=true;
 aq('advWrap').innerHTML=`<div class="advcase"><div class="advband"><div class="advs" id="advS" role="group" aria-label="BIS Advance monitor screen">
  <canvas id="advCv" class="a" style="--x:0;--y:0;--w:1246;--h:779" role="img" aria-label="Trends, density spectral arrays and EEG"></canvas>
  <div id="advChart" class="chart" hidden></div>
  <div id="advHdr"></div><div id="advWm"></div>
  <div class="xbar" id="advTop"></div>
  <div class="left" id="advLeft"></div>
  <div id="advNum"></div>
  <div class="mbar" id="advMbar"><span class="mi" id="aMi" hidden>${IC.bubble}</span><span class="bd" id="aMbd" hidden></span><span class="xmt" id="aMsgT" role="status" aria-live="polite"></span><span class="mn" id="aMn" hidden><span id="aMc">1/1</span><button type="button" id="aNext" data-a="next"><u>NEXT</u></button><i></i></span><button type="button" class="ck" id="aCheck" data-a="check" aria-label="Clear message" hidden>${IC.check}</button></div>
  <div id="advBoot" class="boot" hidden></div><div id="advOv"></div><div id="advPop"></div>
 </div><div class="advbrand"><b>Medtronic</b><span class="hk" role="group" aria-label="Hard keys on the case"><button type="button" id="aHkFn" data-hk="fn" aria-label="Function key: opens the main menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button><button type="button" id="aHkHome" data-hk="home" aria-label="Home key: closes any window or menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5L12 4.5l8 7M6.5 10.5V19h4.2v-5h2.6v5h4.2v-8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg></button><button type="button" id="aHkPw" data-hk="pw" aria-label="Power key (not used in the simulator)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5v8M7.2 6.8a7.2 7.2 0 1 0 9.6 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button></span></div></div></div>
 <div class="advsim" id="advSim" role="group" aria-label="Simulator controls, outside the monitor"><button type="button" id="advSkip" data-sim="skip">Skip start-up</button><button type="button" id="advBootBtn" data-sim="boot">Replay start-up</button></div>`;
 advTop();advChrome();advHeaders();
 const S=aq('advS');S.addEventListener('click',advClick);document.addEventListener('keydown',advKey);aq('advSim').addEventListener('click',advSimClick);document.querySelector('#advWrap .advbrand').addEventListener('click',advHardKey);
 aq('advCv').addEventListener('click',advCvClick);
 document.addEventListener('pointerdown',()=>advUnlock(),{once:true});
 // start-up messages like the monitor's: two latching messages, 1/2 and NEXT
 advMsg('Audio reminder is off',{latch:true,bg:true});advMsg('Institutional settings restored',{latch:true,bg:true});
 ADV.t0=0;try{document.fonts&&document.fonts.load('400 16px Selawik').then(()=>{ADV.full=true;});}catch(e){}}
function advTop(){aq('advTop').innerHTML=`
  <button type="button" class="hb" id="aMenu" data-a="menu" aria-label="Menu" aria-expanded="false" aria-haspopup="dialog"><span><i></i><i></i><i></i></span></button>
  <div class="abar" id="aAbar" hidden><button type="button" class="cnt xbtn" id="aAcnt" data-a="alist" aria-label="Show the alarm list" aria-expanded="false"><span class="tri"></span><span id="aAn">1/1</span></button><span class="sep"></span><span class="ico" id="aAico"></span><span class="l1" id="aAl1" role="alert"></span><span class="l2" id="aAl2"></span></div>
  <div class="apill" id="aPill"><button type="button" class="m" id="aSilent" data-a="silent" aria-label="Alarm audio: on. Press to pause for 2 minutes"><span id="aPillT"></span><span id="aBell"></span></button><button type="button" class="d" id="aDrop" data-a="ctl" aria-label="Alarm audio options" aria-expanded="false"><b></b></button></div>
  <div class="tdiv" style="left:calc(932*var(--u));top:0;height:calc(61*var(--u))"></div>
  <span class="dt dblk" id="aDate">14 JAN 2020</span><span class="tm dblk" id="aTime">09:45</span><button type="button" class="idl dblk" id="aId" data-a="caseid" aria-label="Case ID"><u>ID</u><s></s></button>
  <div class="tdiv" style="left:calc(1058*var(--u));top:calc(10*var(--u));height:calc(42*var(--u))"></div>
  <span class="ti" id="aUsb" style="left:calc(1083*var(--u));height:calc(21*var(--u))" aria-hidden="true">${IC.usb}</span><span class="ti" id="aSer" style="left:calc(1118*var(--u));height:calc(15*var(--u))" aria-hidden="true">${IC.serial}</span><span class="ti" id="aNetx" style="left:calc(1118*var(--u));height:calc(15*var(--u))" aria-hidden="true" hidden>${IC.netx}</span>
  <span class="t r" id="aBatT" style="--x:1180;--y:31;--fs:15;--c:#9aa6b8" aria-label="Battery 100 percent">100%</span><span class="ti" id="aBat" style="left:calc(1195.5*var(--u));height:calc(10.5*var(--u))" aria-hidden="true">${IC.batt}</span><span class="ti" id="aBolt" style="left:calc(1226*var(--u));height:calc(22*var(--u))" aria-hidden="true">${IC.bolt}</span>
  <div class="xctl" id="aCtl" hidden role="group" aria-label="Alarm audio"><button type="button" data-a="aud" data-v="0" id="aCt0" aria-label="Alarm audio on">${IC.bellY}</button><button type="button" data-a="aud" data-v="1" id="aCt1" aria-label="Pause alarm audio for 2 minutes">${IC.pause}</button><button type="button" data-a="aud" data-v="2" id="aCt2" aria-label="Alarm audio off">${IC.silent}</button><button type="button" data-a="vol" id="aCt3" aria-label="Alarm volume">${IC.spk}</button></div>
  <div class="xvol" id="aVol" hidden role="group" aria-label="Alarm volume">${[1,2,3,4,5,6,7].map(i=>`<button type="button" data-a="setvol" data-v="${i}" style="height:${28+i*7}%" aria-label="Volume ${i}"></button>`).join('')}</div>
  <div class="alist" id="aAlist" hidden></div>`;
 aq('aBell').innerHTML=IC.bellW;}
// the left bar changes with the channel mode, case review and demo mode
function advChrome(){const ch=ADV.ch,rv=!!ADV.review,L=aq('advLeft');let y=ch===4?[106,173,248,356,463,593]:[0,103,177,300,402,523];
 const rb=(id,yc,lab,ic,a,extra,cls)=>`<button type="button" class="rb ${cls||''}" id="${id}" data-a="${a}" style="top:calc(${yc-(cls?26:18.5)-61}*var(--u))" ${extra||''}><span class="ci">${ic}</span><span class="l">${lab}</span></button>`;
 const tg=(yc)=>`<button type="button" class="pill gt" id="aGt" data-a="gt" style="top:calc(${yc-17-61}*var(--u))" role="switch" aria-checked="${ADV.view==='chart'}" aria-label="Chart view"><i class="${ADV.view==='graphs'?'on':''}" style="color:#fff">${IC.graph}</i><i class="${ADV.view==='chart'?'on':''}" style="color:#fff">${IC.table}</i></button>`;
 let h='';
 if(rv){h=tg(103)+rb('aCases',322,'CASES LIST',IC.list,'caselist','','sq')+rb('aLog',434,'CASE LOG',IC.table,'caselog','','sq')+rb('aExitRv',657,'EXIT',IC.exit,'exitrv','','sq');}
 else{if(ch===4)h+=`<button type="button" class="pill lr" id="aLr" data-a="lr" style="top:calc(${y[0]-17-61}*var(--u))" role="switch" aria-checked="${ADV.hemi==='R'}" aria-label="Side shown: ${ADV.hemi==='L'?'left':'right'}"><i class="L ${ADV.hemi==='L'?'on':''}">L</i><i class="R ${ADV.hemi==='R'?'on':''}">R</i></button>`;
  h+=tg(y[1])+rb('aAlarms',y[2],'ALARM <br>SETTINGS',IC.bellW,'alarms')+rb('aSnap',y[3],'SNAPSHOT',IC.flag.replace(/currentColor/g,'#fff'),'snap')+rb('aSensor',y[4],'SENSOR <br>CHECK',IC.check.replace('currentColor','#fff'),'sensor')+rb('aInfo',y[5],'INFO',IC.infoL,'info');
  if(ADV.demo)h+=rb('aExitDemo',690,'EXIT DEMO <br>MODE',IC.exit,'exitdemo');}
 L.innerHTML=h;
 // numeric panels
 aq('advNum').innerHTML=ch===2?advNum2():advNum4();ADV.numKey=null;}
const advLblBis=(id,x,y,c)=>advBox('t',x,y,null,null,`<span style="color:${c};display:inline-flex;gap:calc(14*var(--u));align-items:center" id="${id}"></span>`,'transform:translateY(-50%);font-size:calc(20*var(--u));white-space:nowrap');
function advNum2(){const c=AC.bisL;return `
 ${advT('',949,105,20,AC.sqi,'SQI',{cls:'cap'})}<div class="sqi" id="aSqiL" style="left:calc(953*var(--u));top:calc(128*var(--u));height:calc(34*var(--u))">${[8,15,22,28,34].map(h=>`<i style="height:calc(${h}*var(--u))"></i>`).join('')}</div>
 ${advT('',1106,105,20,AC.emg,'EMG',{cls:'cap'})}${advT('aEmgL',1105,143,50,AC.emg,'',{})}
 <div class="emgbar" id="aEmgBarL" style="left:calc(1183*var(--u));top:calc(77*var(--u));width:calc(15*var(--u));height:calc(83*var(--u))"><b></b></div>${advT('',1207,81,13,'#d4d4d4','55')}${advT('',1207,160,13,'#d4d4d4','30')}
 <div class="hline" style="left:calc(932*var(--u));top:calc(175*var(--u));width:calc(314*var(--u))"></div>
 ${advLblBis('aBisLbl',949,200,c)}<span class="bis" id="aBisL" style="left:calc(1087*var(--u));top:calc(318*var(--u));font-size:calc(205*var(--u));color:${c}" aria-label="BIS"></span>
 <div class="hline" style="left:calc(932*var(--u));top:calc(461*var(--u));width:calc(314*var(--u))"></div>
 ${advLblBis('aSrLbl',949,481,AC.sr)}${advT('aSrL',948,556,50,'#8c5c9c','')}
 ${advT('',1172,481,20,'#a494ac','ST',{cls:'cap'})}${advT('aStL',1232,556,50,'#ac9cbc','',{al:'r'})}${advT('aStU1',1139,585,13,'#d7dce4','min',{al:'c'})}${advT('aStU2',1210,585,13,'#d7dce4','sec',{al:'c'})}
 <div class="hline" style="left:calc(932*var(--u));top:calc(626*var(--u));width:calc(314*var(--u))"></div>
 ${advLblBis('aSefLbl',949,647,'#fcfcfc')}${advT('aSefL',949,707,50,'#dce4ec','')}
 ${advT('',1150,647,20,'#9c5c8c','MF',{cls:'cap'})}${advT('aMfL',1150,707,48,'#9c5c8c','')}`;}
function advNum4(){const P=(s,oy,c)=>{const sid=s,B=ADV.hemi;return `
 ${advLblBis('aBisLbl'+s,950,81+oy,c)}${advT('',1114,82+oy,19,AC.sqi,'SQI',{cls:'cap'})}<div class="sqi" id="aSqi${s}" style="left:calc(1157*var(--u));top:calc(${70+oy}*var(--u));height:calc(20*var(--u));gap:calc(3.5*var(--u))">${[6,9,12,16,20].map(h=>`<i style="height:calc(${h}*var(--u));width:calc(5.5*var(--u))"></i>`).join('')}</div><span class="badge" style="left:calc(1223*var(--u));top:calc(${80+oy}*var(--u));--c:${c}">${s}</span>
 <span class="bis" id="aBis${s}" style="left:calc(1030*var(--u));top:calc(${172+oy}*var(--u));font-size:calc(150*var(--u));color:${c}" aria-label="BIS ${s==='L'?'left':'right'}"></span>
 ${advT('',1146,159+oy,18,AC.emg,'EMG',{cls:'cap'})}${advT('aEmg'+s,1146,192+oy,40,AC.emg,'')}<div class="emgbar" id="aEmgBar${s}" style="left:calc(1220*var(--u));top:calc(${135+oy}*var(--u));width:calc(16*var(--u));height:calc(100*var(--u))"><b></b></div>${advT('',1228,126+oy,12,'#d4d4d4','55',{al:'c'})}${advT('',1228,246+oy,12,'#d4d4d4','30',{al:'c'})}
 <div class="hline" style="left:calc(932*var(--u));top:calc(${250+oy}*var(--u));width:calc(314*var(--u))"></div>
 ${advLblBis('aSrLbl'+s,950,263+oy,AC.sr)}${advT('aSr'+s,950,302+oy,44,'#8c5c9c','')}
 ${advT('',1128,263+oy,19,'#a494ac','ST',{cls:'cap'})}${advT('aSt'+s,1207,294+oy,44,'#ac9cbc','',{al:'r'})}${advT('aStU1'+s,1142,320+oy,12.5,'#d7dce4','min',{al:'c'})}${advT('aStU2'+s,1186,320+oy,12.5,'#d7dce4','sec',{al:'c'})}
 ${advT('',1049,359+oy,17,AC.burst,'BURST',{al:'r',cls:'cap'})}${advT('aBc'+s,1056,358+oy,27,AC.burst,'',{al:'l'})}${advT('',1076,361+oy,13,AC.burst,'/min')}`;};
 return `${P('L',0,AC.bisL)}<div class="hline" style="left:calc(932*var(--u));top:calc(385*var(--u));width:calc(314*var(--u))"></div>${P('R',324,AC.bisR)}<div class="hline" style="left:calc(932*var(--u));top:calc(709*var(--u));width:calc(314*var(--u))"></div>
 ${advLblBis('aSefLbl',948,722,'#fcfcfc')}${advT('aSefL',948,756,36,'#dce4ec','')}${advT('',1114,726,19,'#9c5c8c','MF',{cls:'cap'})}${advT('aMfL',1114,750,36,'#9c5c8c','')}<span class="badge" id="aBadgeLow" style="left:calc(1223*var(--u));top:calc(735*var(--u));--c:${AC.bisL}">L</span>`;}
// ----- headers and selectors over the trend area -----
function advHeaders(){const L=ADV.lay||(ADV.lay=advLay()),r=L.rect,two=L.two,H=[],bc=ADV.hemi==='R'?AC.bisR:AC.bisL;
 const ab=(x,y,cls,html,al)=>`<div class="hd ${cls||''}" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u));transform:${al==='r'?'translate(-100%,-50%)':'translateY(-50%)'}">${html}</div>`;
 const cy=o=>o.y+o.h*.55,ttl=(txt,c)=>`<span class="ttl" style="color:${c}">${txt}</span>`;
 if(r.bis){const y=cy(r.bisH),sec=ADV.sec,nm={emg:'EMG',sr:'SR',sqi:'SQI',burst:'BURST',bisO:'BIS',none:'NONE'}[sec],col={emg:AC.emg,sr:AC.sr,sqi:AC.sqi,burst:AC.burst,bisO:ADV.hemi==='R'?AC.bisL:AC.bisR,none:'#d4d4d4'}[sec],un={emg:'dB',sr:'%',sqi:'%'}[sec]||'';
  H.push(ab(168,y,'',ttl('BIS',bc)),ab(two?218:209,y,'',`<button type="button" class="lnk" data-a="range"><u>${two?'SET RANGE':'SET TARGET'}</u><i></i></button>`),
   ab(883,y,'',`<button type="button" class="sel sec" id="aSecB" data-a="secpop" aria-haspopup="listbox" aria-label="Secondary trend: ${nm}"><span style="color:${col}">${nm}</span><s></s><span style="color:#fff;font-size:calc(15*var(--u))">${un}</span></button>`,'r'));
  if(!two)H.push(`<span class="badge" style="left:calc(911*var(--u));top:calc(${y}*var(--u));--c:${bc}">${ADV.hemi}</span>`);}
 if(r.dsaH){const y=cy(r.dsaH),title=L.grp?`<span class="ttl" style="color:#fff">DSA</span> <span class="ttl sp" style="color:#9aa0a8">&amp;</span><span class="ttl" style="color:${AC.asym}">ASYM</span>`:ttl('DSA','#fff');
  H.push(ab(168,y,'',`${title}<span class="sq" style="background:#fff"></span><span class="cap2">SEF</span><span class="sq" style="background:#8a3f9f"></span><span class="cap2">MF</span><span class="legend"><span>L</span><i></i><span>H</span></span>`));}
 if(r.asymH)H.push(ab(168,cy(r.asymH)-2,'',`${ttl('ASYM',AC.asym)}<span style="color:${AC.asym};font-size:calc(14*var(--u));margin-left:calc(5*var(--u))">%</span>`));
 if(r.axis){const y=r.axis.y+r.axis.h*(two?.45:.5);H.push(ab(128,y,'',`<button type="button" class="ax" data-a="winpop" id="aWin" aria-haspopup="listbox" aria-label="Trend time scale ${ADV.win<60?ADV.win+' minutes':ADV.win/60+' hours'}"><u>${ADV.win<60?ADV.win+' min':ADV.win/60+' h'}</u><i style="display:block;width:0;height:0;margin-left:calc(5*var(--u));border-top:calc(4*var(--u)) solid transparent;border-bottom:calc(4*var(--u)) solid transparent;border-left:calc(7*var(--u)) solid #fff"></i></button>`));}
 if(r.eegH){const y=cy(r.eegH),secs=advSecs(),len=ADV_PX/secs,ux=ADV.uvmm[ADV.ch],sw=ADV.sweep;
  H.push(ab(167,y,'',ttl('EEG',AC.eegLbl)),ab(two?216:208,y,'',`<button type="button" class="sel" id="aUv" data-a="uvpop" aria-haspopup="listbox" aria-label="EEG scale ${ux} microvolts per millimetre"><span>${ux}</span><s></s><span style="color:#d7dce4;font-size:calc(15*var(--u))">µV/mm</span></button>`),
   ab(884,y,'',`<button type="button" class="sel" id="aSw" data-a="swpop" aria-haspopup="listbox" aria-label="EEG sweep speed ${sw} millimetres per second"><span>${sw}</span><s></s><span style="color:#d7dce4;font-size:calc(15*var(--u))">mm/sec</span></button>`,'r'));
  const bx=Math.min(522,ADV_X+ADV_PX/2)-len/2+len*0;H.push(`<div class="a" style="--x:${bx};--y:${y-4};--w:${len};--h:8;border-left:calc(1*var(--u)) solid #d4d4d4;border-right:calc(1*var(--u)) solid #d4d4d4"><div style="position:absolute;left:0;right:0;top:50%;height:calc(1*var(--u));background:#d4d4d4"></div></div>`,`<span class="t" style="--x:${bx+len+6};--y:${y+1};--fs:11;--c:#d4d4d4">${+(secs>=1?1:secs).toFixed(0)} Sec</span>`);}
 if(!two&&L.strips.length===2){const a=L.strips[0],b=L.strips[1];H.push(`<span class="badge" style="left:calc(911*var(--u));top:calc(${(a.y+a.h+b.y)/2}*var(--u));--c:${bc}">${ADV.hemi}</span>`);}
 aq('advHdr').innerHTML=H.join('');
 ADV.hdrKey=null;}
