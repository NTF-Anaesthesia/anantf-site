// Medtronic BIS 2-channel monitor screen (the 'vista' skin): a 640 x 480 virtual LCD, built from the owner's photos and the
// manufacturer's manuals (eeg/NOTES.md, "Medtronic BIS 2-channel screen"). Loaded before app.js; the functions here are
// called from app.js and read its globals (mon, HIST, COLS, SIG, R, simT ...) only when called, never at load.
const mq=id=>document.getElementById(id);
function mtD(){try{dirty=true;}catch(e){}} // app.js declares `dirty` after the first applySkin call
const MT={
 main:'dsaAmpl',          // Display: 'bis' (trend) | 'eeg' | 'dsaAmpl' (DSA + Amplitude) | 'dsaBis' (DSA + BIS); the owner's default is DSA + Amplitude
 channels:1,              // EEG Channels 1 or 2 (2: the right hemisphere's engine is the second trace)
 win:60,                  // Trend Time Scale, minutes (5, 15 or 60); the real monitor's default is 1 hour (the 5 and 15 min scales are a teaching extra)
 secondary:'emg',         // Secondary Variable: 'none' | 'sr' | 'emg' (the trend view's right axis when Display ST is off)
 displayST:true,displaySR:true,
 tgt:{active:false,alarm:true,hi:60,lo:40,fmt:'band'}, // Target Range is Inactive by default, as on the real monitor; 60 / 40 is a teaching shortcut (the real defaults are High 100 / Low 0: no band, no alarm)
 alarmVol:3,filters:true,imp:true,demo:false,diag:false,audioRem:true,mode:1,chartInt:15,showVals:false,
 pre:null,hc:null,caseId:'AH5F',realId:'AH5F',snapT:null,snapPrev:null,gaps:[],anchor:null,beeps:0,nextBeep:0,nextRem:0,lowDis:'',pw:'1234',
 alarm:0,alarmEnd:0,       // alarm key: 0 green, 1 paused for 2 min (yellow, seconds counting down), 2 silenced (red X, SILENT)
 menu:null,menuStack:[],page:1,review:null,sensor:null,
 info:null,infoDismissed:'',startup:{text:'Factory settings restored',on:true},
 saved:null,exp:{live:true,hist:false,conn:false,err:false,sens:false,snap:false},chartOff:0,pass:'',passNext:null,dt:null,usbUntil:0};
const MT_FONT='"DejaVu Sans Web","Arimo",sans-serif',MT_BOLD='"Arimo","Liberation Sans",Arial,sans-serif';
// the monitor's colour map (sampled from the owner's units): saturated, red at the top, blue at the bottom, no dark ends
const MT_STOPS=[[0,0xcd,0x11,0x0c],[.10,0xf1,0x0c,0x09],[.25,0xf1,0x0c,0x09],[.40,0xf6,0xba,0x06],[.50,0xfe,0xfb,0x06],[.58,0xeb,0xfa,0x13],[.65,0x70,0xfa,0xb6],[.73,0x59,0xff,0xf1],[.80,0x3c,0x9d,0xf7],[.87,0x33,0x5e,0xf3],[.95,0x1f,0x47,0xe3],[1,0x1f,0x47,0xe3]];
const MT_LUT=Array.from({length:256},(_,i)=>{const p=1-i/255;let k=0;while(k<MT_STOPS.length-2&&p>MT_STOPS[k+1][0])k++;const a=MT_STOPS[k],b=MT_STOPS[k+1],f=(p-a[0])/(b[0]-a[0]||1);
 return [0,1,2].map(j=>Math.round(a[j+1]+(b[j+1]-a[j+1])*Math.max(0,Math.min(1,f))));});
const mtPad=(n,w)=>String(n).padStart(w||2,'0');
const MT_MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function mtStamp(t){const d=new Date(T0+t*1000);return `${mtPad(d.getDate())} ${MT_MON[d.getMonth()]} ${d.getFullYear()}  ${mtPad(d.getHours())}:${mtPad(d.getMinutes())}:${mtPad(d.getSeconds())}`;}
const mtHMS=s=>Math.floor(s/3600)+':'+mtPad(Math.floor(s/60)%60)+':'+mtPad(s%60);
const mtView=()=>MT.review?'bis':MT.main;
function mtVis(){return typeof mon!=='undefined'&&mon.skin==='vista';}
// an information message on the message bar (the monitor's own wording), for a few seconds
function mtInfo(text,code,ms,pri,dis){MT.info={text,code,pri:pri||'info',dis:!!dis,until:Date.now()+(ms||5000)};mtD();setTimeout(()=>{mtD();},(ms||5000)+100);}
function mtTgtSync(){mon.alo=MT.tgt.lo;mon.ahi=MT.tgt.hi;mtD();}
// ---------- the alarm key: green > yellow bell (paused 2 min, countdown) > red bell X (silenced, SILENT) > green ----------
const BELL='M21 2c-1.6 0-2.8 1.1-2.8 2.5C13.4 5.6 11 9.4 11 14v6c0 2-1.6 3.3-3.6 4.4v1.3h27.2v-1.3C32.6 23.3 31 22 31 20v-6c0-4.6-2.4-8.4-7.2-9.5C23.8 3.1 22.6 2 21 2zM17.5 27.4c.4 1.6 1.8 2.6 3.5 2.6s3.1-1 3.5-2.6z';
// while a high-priority alarm is active (and not yet pressed) the key reads SILENT with a red bell crossed out; pressing it goes to the paused (yellow) state
function mtAlarmActive(){if(MT.alarm!==0||MT.sensor)return false;const m=monMsg();return !!m&&m[0]==='hi';}
function mtBellSvg(){const act=mtAlarmActive(),st=MT.alarm,col=act?'#e0202a':st===0?'#7cc02e':st===1?'#f4e84a':'#e5322a',x=st||act?`<path d="M9 3l24 24M33 3L9 27" stroke="${act?'#e8e8f0':'#6f7488'}" stroke-width="3.2" fill="none"/>`:'';
 mq('kBell').innerHTML=`<path d="${BELL}" fill="${col}"/>${x}`;}
function mtAlarmTick(){if(MT.alarm===1){const left=Math.ceil((MT.alarmEnd-Date.now())/1000);if(left<=0)MT.alarm=0;}mtAlarmUI();mtSound();}
function mtAlarmUI(){const k=mq('kSilent');mtBellSvg();const left=Math.max(0,Math.ceil((MT.alarmEnd-Date.now())/1000));mq('kSl').textContent=MT.alarm===2||mtAlarmActive()?'SILENT':MT.alarm===1?String(left):'';mq('kSl').classList.toggle('cnt',MT.alarm===1);
 k.setAttribute('aria-pressed',MT.alarm?'true':'false');k.setAttribute('aria-label',MT.alarm===0?'Alarm key: alarms on. Press to pause the alarm for 2 minutes':MT.alarm===1?`Alarm key: alarms paused, ${left} seconds left. Press to silence indefinitely`:'Alarm key: alarm silenced. Press to switch alarms on again');}
function mtAlarmPress(){MT.alarm=(MT.alarm+1)%3;if(MT.alarm===1)MT.alarmEnd=Date.now()+120000;MT.nextBeep=0;MT.nextRem=0;mtAlarmUI();mtSound();mtD();}
// ---------- sound: a high-priority message sounds until the BIS is back in range or the bell is pressed ----------
// Square beep, 3 pulses every 2 s, loudness from Alarm Volume (1-5). Paused (yellow bell) is silent and the sound resumes by itself
// when the 2 minutes end; silenced (red X) is silent, with the Audio Off Reminder (one short beep every 3 min) if that is on.
// Browsers keep audio locked until the first press or key, so the sound context is made then (mtUnlock).
function mtUnlock(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;MT.ac=MT.ac||new A();if(MT.ac.state==='suspended')MT.ac.resume();}catch(e){}}
function mtBeep(n,len){n=n||1;len=len||0.3;MT.beeps++;try{const ac=MT.ac;if(!ac||ac.state!=='running')return;const t0=ac.currentTime;
 for(let i=0;i<n;i++){const o=ac.createOscillator(),g=ac.createGain(),t=t0+i*(len+0.12);o.type='square';o.frequency.value=880;g.gain.setValueAtTime(0.012*MT.alarmVol,t);g.gain.setValueAtTime(0,t+len);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+len+0.02);}}catch(e){}}
function mtSound(){if(!mtVis()){MT.sounding=false;return;}const now=Date.now(),m=monMsg(),hi=!!m&&m[0]==='hi'&&!MT.sensor; // no BIS during a sensor check: no target or isoelectric alarm
 const want=hi&&MT.alarm===0&&(m[2]===31||MT.tgt.alarm); // isoelectric always sounds; the target alarm only with Target Alarm on
 MT.sounding=want;
 if(want){if(now>=MT.nextBeep){MT.nextBeep=now+2000;mtBeep(3,0.16);}}else MT.nextBeep=0;
 if(MT.alarm===2&&MT.audioRem){if(!MT.nextRem)MT.nextRem=now+180000;if(now>=MT.nextRem){MT.nextRem=now+180000;mtBeep(1,0.12);}}else MT.nextRem=0;}
// ---------- the soft keys ----------
const MT_GRID='<rect x="9" y="3" width="24" height="24" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M9 11h24M9 19h24M17 3v24M25 3v24" stroke="#fff" stroke-width="1.4"/>';
const MT_HOME='<path d="M21 2L4 17h5v11h8V20h8v8h8V17h5z" fill="#fff"/>';
function mtKeys(){const home=!!MT.menu;
 mq('kMl').textContent=home?'HOME':'MENU';mq('kMi').innerHTML=home?MT_HOME:MT_GRID;
 mq('kMenu').setAttribute('aria-label',home?'Home: leave the menu and return to the main screen':'Menu: show the monitor settings');mq('kMenu').setAttribute('aria-expanded',MT.menu?'true':'false');
 const sc=!!MT.sensor,rv=!!MT.review;mq('kSn').innerHTML=sc?'EXIT':rv?'TREND<br>REVIEW<br>EXIT':'SENSOR<br>CHECK';
 mq('kSensor').setAttribute('aria-label',sc?'Exit sensor check':rv?'Exit trend review':'Sensor check');mq('kSensor').classList.toggle('exit',sc);}
// ---------- the message bar (text, then the code in brackets with two spaces before it) ----------
// Dismiss only on the yellow start-up bar and on a persistent yellow warning; information bars have no button and clear by themselves.
function mtMessage(){
 const m=monMsg();if(!(m&&m[0]==='lo'))MT.lowDis='';
 if(m&&m[0]==='hi'&&!MT.sensor)return {pri:'hi',text:m[3]||m[1],code:m[2]};
 // sensor check: only electrodes that read HIGH are named, even while another is still being measured; otherwise 'in Progress' until a result; nothing once all four pass
 if(MT.sensor){const s=MT.sensor;if(s.pass)return null;const todo=s.el.filter(e=>e.st==='high').map(e=>e.n);
  if(!todo.length)return {pri:'lo',text:'Sensor Check in Progress',code:null};return {pri:'lo',text:'Press electrode'+(todo.length>1?'s ':' ')+todo.join(', '),code:13};}
 if(MT.info&&MT.info.until>Date.now())return {pri:MT.info.pri,text:MT.info.text,code:MT.info.code,dis:!!MT.info.dis,key:MT.info.dis?'info':''};
 if(m&&m[0]==='lo'&&MT.lowDis!==(m[3]||m[1]))return {pri:'lo',text:m[3]||m[1],code:m[2],dis:true,key:'lo',lo:m[3]||m[1]};
 if(MT.startup.on)return {pri:'lo',text:MT.startup.text,code:null,dis:true,key:'startup'};
 if(m&&m[0]==='info')return {pri:'info',text:m[1],code:null};
 return null;}
// long messages shrink to fit the bar
function mtMsgUI(){const el=mq('v2Msg'),m=mtMessage();if(!m){el.hidden=true;return;}
 const text=m.text+(m.code!=null?`  [ ${m.code} ]`:'')+(MT.diag&&m.code!=null?`  (code ${m.code})`:'');
 const b=mq('v2Dismiss'),was=!b.hidden,t=mq('v2MsgT');b.hidden=!m.dis;el.style.setProperty('padding-right',m.dis?'calc(100*var(--u))':'0');
 el.hidden=false;el.className='vmsg '+m.pri;el.dataset.key=m.key||'';MT.curLo=m.lo||'';
 if(t.textContent!==text||was!==!!m.dis){t.textContent=text;let fs=m.pri==='info'?18:22;t.style.fontSize=`calc(${fs}*var(--u))`;while(fs>15&&t.scrollWidth>t.clientWidth+1){fs-=.5;t.style.fontSize=`calc(${fs}*var(--u))`;}}}
// ---------- readouts: called once a second (and on every change) with the newest column ----------
function mtReadouts(c,bl,sr,e){
 const sensorOn=!!MT.sensor,v=mq('v2Bis');
 v.textContent=sensorOn||bl||c.bis==null?'':String(Math.round(c.bis));v.classList.toggle('hollow',!sensorOn&&!bl&&c.sqi<50);
 mtSqiBars();
 const en=e<30?0:e<39?1:e<48?2:e<56?3:4;[...mq('v2Emg').children].forEach((x,i)=>x.classList.toggle('on',i<en));mq('v2Emg').style.setProperty('--lv',[.05,.07,.12,.3,.6][en]); // a thin sliver at a normal EMG, growing in steps
 txt('v2St',mtHMS(tim.sup));txt('v2Sr',bl?'0':String(sr));
 mq('v2StBox').hidden=!MT.displayST;mq('v2SrBox').hidden=!MT.displaySR;
 mq('v2Art').hidden=!c.art;mq('v2Usb').hidden=!(MT.usbUntil>Date.now());
 mtLayout();mtMsgUI();mtAlarmTick();mtKeys();
 if(MT.menu)mtMenuLive();}
// the five SQI bars: signal quality / 20 on the main screen; one green bar per electrode that passes during Sensor Check (all five when all four pass)
function mtSqiBars(){const c=COLS[COLS.length-1];if(!c)return;const nb=MT.sensor?0:Math.ceil(c.sqi/20);/* 0: hollow outlines while the sensor is being checked */[...mq('v2Sqi').children].forEach((x,i)=>x.classList.toggle('on',i<nb));}
function mtLayout(){const two=MT.channels===2,top=MT.menu||MT.main==='eeg',cy=two?158:134,vv=mq('vista');
 vv.classList.toggle('sc',!!MT.sensor);vv.classList.toggle('rv',!!MT.review);
 const set=(id,y)=>{const s=mq(id).style;s.top=`calc(${y}*var(--u))`;};set('v2Mm',cy+2);set('v2EegL',cy);set('v2Uv',cy+2);
 for(const id of ['v2Mm','v2EegL','v2Uv'])mq(id).style.visibility=top?'hidden':'';
 mq('v2Uv').textContent=(two?'50':'25')+' µV / division';
 mq('v2Review').hidden=!(mtView()==='bis'&&!MT.menu&&!MT.review&&!MT.sensor);
 mq('c2Dsa').style.visibility=MT.menu?'hidden':'';}
// ---------- the Menu: pages of 3 x 3 tiles in the lower panel, and the sub-screens of the real monitor ----------
const MCOL=[6,186,366],MROW=[6,85,164],MW=175,MH=74;
let MT_P=null,MT_FOCUS='';
const mtOnOff=on=>`<span class="sqs"><i class="sq${on?'':' dim'}"></i><i class="sq x${on?'':' redx'}"><svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="#fff" stroke-width="1.8"/></svg></i></span>`;
const mtOpts=(list,cur)=>`<span class="opts">${list.map(([k,l])=>`<b class="${k===cur?'g':'d'}">${l}</b>`).join('')}</span>`;
function mtTile(o){const b=document.createElement('button');b.type='button';b.className='mt'+(o.ret?' ret':'')+(o.cls?' '+o.cls:'');
 b.style.cssText=`--x:${o.x};--y:${o.y};--w:${o.w||MW};--h:${o.h||MH}`;
 b.innerHTML=(o.t!=null?`<span>${o.t}</span>`:'')+(o.html||'')+(o.ar?`<i class="ar${o.ar==='l'?' l':''}"></i>`:'');
 if(o.dis){b.disabled=true;}if(o.lab)b.setAttribute('aria-label',o.lab);b.dataset.k=o.k||String(o.t||o.html||'').replace(/<[^>]*>/g,'').slice(0,24);
 b.onclick=()=>{if(!o.dis&&o.on)o.on(b);};(o.par||MT_P).appendChild(b);return b;}
const mt3=(c,r,t,o)=>mtTile(Object.assign({x:MCOL[c],y:MROW[r],t},o||{}));
const mtRet=(o)=>mtTile(Object.assign({x:6,y:164,t:'Return to<br>Previous Menu',ar:'l',ret:true,on:mtBack},o||{}));
function mtLbl(x,y,w,t,o){const d=document.createElement('div');d.className='mtl';d.style.cssText=`--x:${x};--y:${y};--w:${w};`+(o&&o.fs?`--fs:${o.fs};`:'')+(o&&o.c?`--c:${o.c};`:'')+(o&&o.ta?`--ta:${o.ta};`:'')+(o&&o.b?'font-weight:700;':'');d.innerHTML=t;MT_P.appendChild(d);return d;}
function mtPanel(x,y,w,h){const d=document.createElement('div');d.className='mtpanel';d.style.cssText=`--x:${x};--y:${y};--w:${w};--h:${h}`;MT_P.appendChild(d);return d;}
function mtBox(x,y,w,h,t,o){const d=document.createElement('div');d.className='mtbox'+(o&&o.cls?' '+o.cls:'');d.style.cssText=`--x:${x};--y:${y};--w:${w};--h:${h};`+(o&&o.fs?`--fs:${o.fs};`:'')+(o&&o.bg?`--mbg:${o.bg};`:'')+(o&&o.c?`--c:${o.c};`:'');d.textContent=t;MT_P.appendChild(d);return d;}
function mtList(x,y,w,h,html,cls){const d=document.createElement('div');d.className='mtlist'+(cls?' '+cls:'');d.style.cssText=`left:calc(${x}*var(--u));top:calc(${y}*var(--u));width:calc(${w}*var(--u));height:calc(${h}*var(--u))`;d.innerHTML=html;MT_P.appendChild(d);return d;}
const MT_CAM='<svg viewBox="0 0 28 20" width="26" height="19" aria-hidden="true"><path d="M2 5h6l2-3h8l2 3h6v13H2z" fill="#fff"/><circle cx="14" cy="11" r="4.2" fill="#2f3064"/></svg>';
const MT_PAGE='<svg viewBox="0 0 18 22" width="17" height="21" aria-hidden="true"><path d="M1 1h12l4 4v16H1z" fill="#fff"/><path d="M4 8h10M4 11h10M4 14h10M4 17h7" stroke="#2f3064" stroke-width="1.4"/></svg>';
const MT_SPK='<svg viewBox="0 0 40 34" width="40" height="34" aria-hidden="true"><path d="M2 12h8l9-8v26l-9-8H2z" fill="#f4c20d"/><path d="M24 11c3 3 3 9 0 12M29 7c5 5 5 15 0 20M34 3c7 7 7 21 0 28" stroke="#f4c20d" stroke-width="2.2" fill="none"/></svg>';
const MT_DISP='<svg viewBox="0 0 72 32" width="72" height="32" aria-hidden="true"><path d="M2 20c7 0 6-8 12-8s5 9 11 7 5-9 11-8 7 5 12 0 6 0 9-2 6 2 12 0" stroke="#e8dc1c" fill="none" stroke-width="1.7"/><text x="44" y="14" font-size="12" fill="#40e060" font-weight="700" font-family="Arimo,sans-serif">BIS</text><text x="16" y="30" font-size="11" fill="#b9bbd9" font-weight="700" font-family="Arimo,sans-serif">EEG</text></svg>';
const MT_TGT='<svg class="tgt" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><g fill="none" stroke="#c9ccee" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6.3"/></g><circle cx="12" cy="12" r="2.6" fill="#c9ccee"/></svg>';
// the Display menu's layout thumbnail: the screen's boxes in grey, the area the chosen main display uses outlined in yellow
const mtThumb=k=>`<svg viewBox="0 0 68 50" width="68" height="50" aria-hidden="true"><g fill="none" stroke="#8a8dbb" stroke-width="1"><rect x="1" y="1" width="16" height="16" rx="2"/><rect x="19" y="1" width="5" height="16" rx="1.5"/><rect x="27" y="1" width="40" height="16" rx="2"/><rect x="1" y="20" width="6" height="8" rx="1"/><rect x="1" y="30" width="6" height="8" rx="1"/><rect x="1" y="40" width="6" height="8" rx="1"/><rect x="10" y="21" width="57" height="28" rx="2"/></g><rect x="${k==='bis'?10:k==='eeg'?27:10}" y="${k==='eeg'?1:21}" width="${k==='eeg'?40:57}" height="${k==='eeg'?16:28}" rx="2" fill="none" stroke="#e8a820" stroke-width="2"/><path d="${k==='bis'?'M13 40c6-4 8-12 14-8s8-8 14-8 10 6 22 0':k==='eeg'?'M30 9c3-6 4 5 7 0s4 5 7 0 4 4 7-1 4 3 8-1':'M13 28c8-1 14 3 20 0s14 2 22-1M13 38c8 1 14-2 20 1s14-2 22 0'}" fill="none" stroke="${k==='bis'?'#e8dc1c':'#a5d02b'}" stroke-width="1.3"/></svg>`;
const mtFmt=(k,on)=>`<svg class="fm${on?' sel':''}" viewBox="0 0 34 24" width="34" height="24" aria-hidden="true"><rect x=".5" y=".5" width="33" height="23" fill="#000"/>${k==='band'?'<rect x="1" y="8" width="32" height="8" fill="#2a52b8"/><path d="M3 12l5-9 5 17 5-17 5 17 5-17 3 9" fill="none" stroke="#e8dc1c" stroke-width="1.3"/>':'<path d="M1 7h32M1 17h32" stroke="#fff" stroke-width="1" stroke-dasharray="2 2"/><path d="M3 12l5-9 5 17 5-17 5 17 5-17 3 9" fill="none" stroke="#fff" stroke-width="1.3"/>'}</svg>`;
function mtBack(){const p=MT.menuStack.pop();if(p)mtShow(p.name,p.arg,true);else mtHome();}
function mtGo(name,arg){if(MT.menu)MT.menuStack.push({name:MT.menu,arg:MT.menuArg});mtShow(name,arg);}
function mtShow(name,arg,back){MT.menu=name;MT.menuArg=arg;MT_P=mq('v2Menu');
 const had=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.k:'';
 MT_P.innerHTML='';MT_P.hidden=false;mq('v2Rev').hidden=true;MTS[name]&&MTS[name](arg);
 MT_P.setAttribute('aria-label',MTS_NAME[name]||'Monitor menu');
 const all=[...MT_P.querySelectorAll('button:not(:disabled)')],f=(had&&all.find(b=>b.dataset.k===had))||all[0];if(f&&(MT.focusMenu||had))f.focus();
 mtKeys();mtLayout();mtD();}
function mtRe(){mtShow(MT.menu,MT.menuArg,true);}
function mtOpen(){MT.menuStack=[];MT.focusMenu=true;mtShow(MT.page===2?'p2':MT.page===3?'p3':'p1');MT.focusMenu=false;}
function mtHome(quiet){const was=MT.menu||MT.review;MT.menu=null;MT.menuStack=[];mq('v2Menu').hidden=true;MT.review=null;mq('v2Rev').hidden=true;MT.page=1;mtKeys();mtLayout();mtD();if(was&&!quiet)mq('kMenu').focus();}
function mtStepVal(list,cur,dir){const i=list.indexOf(cur);return list[(i+(dir||1)+list.length)%list.length];}
const MTS_NAME={exporting:'Export',p1:'Menu, page 1',p2:'Menu, page 2',p3:'Menu, page 3',target:'Target Range',secvar:'Secondary Variable',chart:'Chart Data',alarmvol:'Alarm Volume',display:'Display',viewsave:'View/Save Settings',passkey:'Enter Passkey',mode:'Monitor Mode',export:'Export Data',config:'Configuration',datetime:'Date and Time',language:'Language',help:'Help',snapshot:'Snapshot',maint:'Maintenance',diag:'Diagnostics',text:'Information'};
const mtNextPage=(p)=>({on:()=>{MT.page=p;mtShow('p'+p);}});
const MTS={
 p1(){mt3(0,0,'Target<br>Range',{html:MT_TGT,ar:'r',cls:'wtgt',on:()=>mtGo('target')});mt3(1,0,'Secondary<br>Variable',{ar:'r',on:()=>mtGo('secvar')});mt3(2,0,'Chart<br>Data',{ar:'r',on:()=>mtGo('chart')});
  mt3(0,1,'Alarm<br>Volume',{ar:'r',on:()=>mtGo('alarmvol')});mt3(1,1,null,{html:MT_DISP+'<span class="sr">Display</span>',ar:'r',k:'Display',on:()=>mtGo('display')});mt3(2,1,'View/Save<br>Settings',{ar:'r',on:()=>mtGo('viewsave')});
  mt3(0,2,'Help',{ar:'r',on:()=>mtGo('help')});mt3(1,2,'Snapshot',{html:MT_CAM,on:()=>mtSnapshot()});mt3(2,2,'Next',Object.assign({ar:'r',ret:true,cls:'pg'},mtNextPage(2)));},
 p2(){mt3(0,0,'Display<br>SR',{html:mtOnOff(MT.displaySR),on:()=>{MT.displaySR=!MT.displaySR;mtRe();mtD();}});mt3(1,0,'Monitor<br>Mode',{ar:'r',on:()=>mtGo('mode')});mt3(2,0,'Export<br>Data',{ar:'r',on:()=>mtGo('export')});
  mt3(0,1,'BIS<br>Smoothing Rate',{html:mtOpts([[10,'10'],[15,'15'],[30,'30']],mon.smooth),on:()=>mtSmooth()});mt3(1,1,'Print',{html:MT_PAGE,ar:'r',on:()=>{mtHome(true);mtInfo('PDF creation completed',null,5000);}});mt3(2,1,'Configuration',{ar:'r',on:()=>mtGo('config')});
  mt3(0,2,'Previous',{ar:'l',ret:true,cls:'pg',on:()=>{MT.page=1;mtShow('p1');}});mt3(2,2,'Next',Object.assign({ar:'r',ret:true,cls:'pg'},mtNextPage(3)));}, // the bottom-middle cell is empty here; Display ST lives in the Display menu
 p3(){mt3(0,0,'EEG Channels',{html:mtOpts([[1,'1'],[2,'2']],MT.channels),on:()=>{MT.channels=MT.channels===1?2:1;mtInfo('Switching EEG channels to '+MT.channels);mtRe();}});mt3(1,0,'Date and Time',{ar:'r',on:()=>mtGo('datetime')});mt3(2,0,'Language',{ar:'r',on:()=>mtGo('language')});
  mt3(0,1,'Filters',{html:mtOnOff(MT.filters),on:()=>{MT.filters=!MT.filters;mtInfo(MT.filters?'Filters On':'Filters Off');mtRe();}});mt3(1,1,'Impedance<br>Checking',{html:mtOnOff(MT.imp),on:()=>{MT.imp=!MT.imp;mtInfo(MT.imp?'Impedance Checking Enabled':'Impedance Checking Disabled');mtRe();}});mt3(2,1,'Maintenance',{ar:'r',on:()=>mtGo('passkey',{next:()=>mtShow('maint')})});
  mt3(0,2,'Previous',{ar:'l',ret:true,cls:'pg',on:()=>{MT.page=2;mtShow('p2');}});mt3(1,2,'Demo Case',{ar:'r',on:()=>{MT.demo=!MT.demo;MT.caseId=MT.demo?'DEMO':MT.realId;mtHome(true);mtInfo(MT.demo?'Demo Case started':'Demo Case ended');}});mt3(2,2,'Diagnostics',{ar:'r',on:()=>mtGo('diag')});},
 target(){const T=MT.tgt;
  mtTile({x:6,y:6,w:165,h:70,t:'Target Range<br>Active',html:mtOnOff(T.active),on:()=>{T.active=!T.active;mtTgtSync();mtRe();}});
  mtTile({x:6,y:85,w:165,h:70,t:'Target Alarm',html:`<svg viewBox="0 0 42 30" width="34" height="24" aria-hidden="true"><path d="${BELL}" fill="${T.alarm?'#3fe060':'#e5322a'}"/>${T.alarm?'':'<path d="M9 3l24 24M33 3L9 27" stroke="#c9ccee" stroke-width="3.2" fill="none"/>'}</svg>`,on:()=>{T.alarm=!T.alarm;mtRe();mtD();}});
  mtLbl(196,31,78,'High',{c:'#e8dc1c',fs:17,ta:'right'});mtLbl(196,107,78,'Low',{c:'#e8dc1c',fs:17,ta:'right'});
  const stp=(k,d)=>{const lo=k==='lo',v=T[k]+d*5;if(lo?(v<0||v>T.hi-5):(v>100||v<T.lo+5))return;T[k]=v;mtTgtSync();mtRe();};
  mtTile({x:280,y:8,w:62,h:64,html:'<b class="cy">−</b>',k:'hi-',on:()=>stp('hi',-1)});mtBox(349,8,113,64,String(T.hi),{fs:46,cls:'val'});mtTile({x:468,y:8,w:62,h:64,html:'<b class="cy">+</b>',k:'hi+',on:()=>stp('hi',1)});
  mtTile({x:280,y:84,w:62,h:64,html:'<b class="cy">−</b>',k:'lo-',on:()=>stp('lo',-1)});mtBox(349,84,113,64,String(T.lo),{fs:46,cls:'val'});mtTile({x:468,y:84,w:62,h:64,html:'<b class="cy">+</b>',k:'lo+',on:()=>stp('lo',1)});
  mtTile({x:363,y:164,w:167,h:70,t:'Target Range<br>Format',html:`<span class="sqs">${mtFmt('band',T.fmt==='band')}${mtFmt('lines',T.fmt==='lines')}</span>`,on:()=>{T.fmt=T.fmt==='band'?'lines':'band';mtRe();mtD();}});mtRet();},
 secvar(){const S=MT.secondary,mk=(c,r,t,k)=>mt3(c,r,k===S?`<span class="g">${t}</span>`:t,{k:'sv'+k,on:()=>{MT.secondary=k;mtRe();mtD();}});
  mk(0,0,'None','none');mk(1,0,'Suppression<br>Ratio','sr');mk(2,0,'EMG','emg');mk(0,1,'Signal<br>Quality','sqi');mk(1,1,'Bursts/<br>Minute','bpm');mtRet();},
 chart(){const iv=MT.chartInt,L=[1,5,10,15,30,60];
  mtTile({x:6,y:6,w:62,h:64,html:'<b class="cy">+</b>',k:'iv+',on:()=>{MT.chartInt=mtStepVal(L,iv,1);MT.chartOff=0;mtRe();}});mtTile({x:6,y:82,w:62,h:64,html:'<b class="cy">−</b>',k:'iv-',on:()=>{MT.chartInt=mtStepVal(L,iv,-1);MT.chartOff=0;mtRe();}});
  mtLbl(70,32,70,'Interval',{fs:15});mtBox(74,52,62,40,String(iv),{fs:34,bg:'#c9d5ee',c:'#2a6aa8'});mtLbl(70,96,70,'Minutes',{fs:15});
  mtRet({w:134,h:70,x:6,y:168});
  const rows=[];if(mtH().length){const t0=mtH()[0].n,t1=mtH()[mtH().length-1].n,st=iv*60,first=Math.round(Math.ceil((T0/1000+t0)/st)*st-T0/1000); // rows at clock times that are multiples of the interval
   for(let t=first;t<=t1;t+=st){const c=mtH()[t-t0];if(c)rows.push([clk(t),c.sqi<15||c.bis==null?'--':Math.round(c.bis),c.sqi,Math.round(c.emg)]);}}
  const per=7,maxOff=Math.max(0,rows.length-per);MT.chartOff=Math.min(MT.chartOff,maxOff);
  const head=`<div style="color:#e8dc1c;font-size:calc(9.5*var(--u));text-align:center">Begin: ${mtH().length?mtStamp(mtH()[0].n):'--'}&nbsp;&nbsp;${MT.demo?'DEMO':MT.caseId}&nbsp;&nbsp;End: ${mtStamp(simT)}</div>`;
  mtList(150,22,320,206,head+`<table class="chart"><tr><th></th><th style="color:#e8dc1c">Time</th><th style="color:#e8dc1c">BIS</th><th style="color:#40e060">SQI</th><th style="color:#f08a24">EMG</th></tr>${rows.slice(MT.chartOff,MT.chartOff+per).map(r=>`<tr><td></td><td>${r[0]}</td><td style="color:#e8dc1c">${r[1]}</td><td style="color:#40e060">${r[2]}</td><td style="color:#f08a24">${r[3]}</td></tr>`).join('')||'<tr><td></td><td colspan="4">No data yet</td></tr>'}</table>`).style.background='#0d1022';
  mtTile({x:476,y:8,w:62,h:64,html:'<b class="cy">▲</b>',k:'up',on:()=>{MT.chartOff=Math.max(0,MT.chartOff-1);mtRe();}});mtTile({x:476,y:82,w:62,h:64,html:'<b class="cy">▼</b>',k:'dn',on:()=>{MT.chartOff=Math.min(maxOff,MT.chartOff+1);mtRe();}});},
 alarmvol(){mtLbl(0,8,543,'Alarm Volume',{fs:17});mtLbl(46,52,200,'Softer',{fs:15,ta:'left'});mtLbl(295,52,200,'Louder',{fs:15,ta:'right'});
  for(let i=1;i<=5;i++)mtTile({x:46+(i-1)*90,y:80,w:88,h:50,html:`<b class="${i===MT.alarmVol?'y':'cy2'}" style="font-size:calc(19*var(--u))">${i}</b>`,k:'v'+i,cls:'vol',on:()=>{MT.alarmVol=i;mtRe();}});
  mtTile({x:366,y:164,w:167,h:70,t:'Test',cls:'tl',html:`<span class="spk">${MT_SPK}</span>`,on:()=>mtBeep(3,0.16)});mtRet();},
 display(){const dsa=MT.main==='dsaAmpl'||MT.main==='dsaBis',cur=dsa?'dsa':MT.main;
  // 'Main display:' is one tile: the layout thumbnail on the left, BIS / EEG / DSA on the right (the current one green)
  mtPanel(6,6,175,74);mtLbl(12,9,100,'Main display:',{fs:11,ta:'left',c:'#dcdaf5'});
  const th=document.createElement('div');th.className='mtthumb';th.style.cssText='--x:12;--y:28';th.innerHTML=mtThumb(dsa?'dsa':MT.main);MT_P.appendChild(th);
  [['bis','BIS','mbis'],['eeg','EEG','meeg'],['dsa','DSA','mdsaAmpl']].forEach(([k,l,dk],i)=>mtTile({x:98,y:9+i*22,w:80,h:22,cls:'mtopt',html:`<b class="${cur===k?'g':'d'}">${l}</b>`,k:dk,on:()=>{MT.main=k==='dsa'?(MT.main==='dsaBis'?'dsaBis':'dsaAmpl'):k;mtRe();mtD();}}));
  mt3(1,0,'Trend Time Scale',{cls:'extra',html:mtOpts([[5,'5 min'],[15,'15 min'],[60,'1 hour']],MT.win)+'<span class="tx">teaching extra</span>',on:()=>{MT.win=mtStepVal([5,15,60],MT.win,1);mtRe();mtD();}});
  mt3(2,0,'Display<br>ST',{html:mtOnOff(MT.displayST),on:()=>{MT.displayST=!MT.displayST;mtRe();mtD();}});
  mt3(1,1,null,{k:'dsatoggle',lab:'DSA: switch between DSA + Amplitude and DSA + BIS',html:`${MT_PAGE}<span class="dsat">DSA</span><span class="dsao"><b class="${MT.main==='dsaAmpl'?'g':'d'}">+ Amplitude</b><b class="${MT.main==='dsaBis'?'g':'d'}">+ BIS</b></span>`,on:()=>{MT.main=MT.main==='dsaAmpl'?'dsaBis':'dsaAmpl';mtRe();mtD();}});
  mt3(2,2,'Trend<br>Review',{html:'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style="position:absolute;left:8px;bottom:6px"><path d="M20 3L4 12l16 9z" fill="none" stroke="#30d4d8" stroke-width="2.2"/></svg>',ret:true,on:()=>mtReviewOpen()});
  mtRet();},
 viewsave(){const S=mtSettingsList(),sv=MT.saved?mtSettingsList(MT.saved):null,cell=(a)=>a.map(([k,v,raw])=>`<tr><td>${k}</td><td style="color:${sv&&mtDiff(raw,sv,k)?'#e8dc1c':'#fff'}">${v}</td></tr>`).join('');
  // all 17 rows: 7 + 6 under the mode heading, 2 + 2 under "All Modes"; unsaved changes in yellow
  mtLbl(0,2,543,`Monitor Mode ${['','I','II','III','IV'][MT.mode]} Settings`,{fs:17,c:'#fff',b:1});
  mtList(8,25,270,100,`<table>${cell(S.slice(0,7))}</table>`,'tab');mtList(278,25,262,100,`<table>${cell(S.slice(7,13))}</table>`,'tab');
  mtLbl(0,124,543,'All Modes',{fs:17,c:'#fff',b:1});mtList(8,148,270,32,`<table>${cell(S.slice(13,15))}</table>`,'tab');mtList(278,148,262,32,`<table>${cell(S.slice(15))}</table>`,'tab');
  const w=128,y=192,h=46;mtTile({x:6,y,w,h,t:'Previous',ar:'l',ret:true,on:mtBack});mtTile({x:142,y,w,h,t:'Save<br>Active',on:()=>mtGo('passkey',{next:()=>{MT.saved=mtSettingsSnap();mtHome(true);mtInfo('Settings Saved');}})});
  mtTile({x:278,y,w,h,t:'Restore<br>Saved',dis:!MT.saved,on:()=>{mtSettingsApply(MT.saved);mtRe();}});mtTile({x:414,y,w,h,t:'Restore<br>Default',on:()=>{mtDefaults();mtRe();}});},
 passkey(arg){mtLbl(0,6,543,'Enter Passkey',{fs:19,c:'#fff'});mtBox(190,34,170,24,'*'.repeat(MT.pass.length),{fs:17,bg:'#fff',c:'#000'});
  const key=(x,y,d,w)=>mtTile({x,y,w:w||60,h:44,t:d,k:'d'+d,on:()=>{if(MT.pass.length<8){MT.pass+=d;mtRe();}}});
  [1,2,3,4,5,6].forEach((d,i)=>key(8+i*90,68,String(d)));[7,8,9].forEach((d,i)=>key(158+i*93,122,String(d)));key(196,180,'0');
  mtTile({x:330,y:180,w:68,h:44,t:'&lt;',k:'del',on:()=>{MT.pass=MT.pass.slice(0,-1);mtRe();}});
  mtTile({x:8,y:168,w:122,h:66,t:'Previous',ar:'l',ret:true,on:()=>{MT.pass='';mtBack();}});mtTile({x:416,y:160,w:116,h:70,html:'<b style="font-size:calc(21*var(--u));font-weight:400">OK</b>',k:'ok',on:()=>{if(!MT.pass)return;const ok=MT.pass===MT.pw;MT.pass='';if(!ok){mtInfo('Invalid passkey');mtRe();return;}const n=arg&&arg.next;n&&n();}});},
 mode(){mtLbl(0,6,543,'Monitor Mode',{fs:19,c:'#fff'});
  [[1,'I','15 s smoothing, SR hidden'],[2,'II','30 s smoothing, SR shown'],[3,'III','10 s smoothing, SR hidden'],[4,'IV','15 s smoothing, SR hidden']].forEach(([m,n,d],i)=>mtTile({x:MCOL[i%3]?MCOL[i%3]:6,y:MROW[Math.floor(i/3)]+14,w:175,h:68,html:`<b class="${MT.mode===m?'g':''}" style="font-weight:400;font-size:calc(20*var(--u))">Mode ${n}</b><span style="font-size:calc(11.5*var(--u));color:#b9bbd9">${d}</span>`,k:'mode'+m,on:()=>{mtMode(m);mtRe();}}));mtRet();},
 export(){const E=MT.exp,t=(c,r,l,k)=>mt3(c,r,`<span class="${E[k]?'g':''}">${l}</span>`,{k:'e'+k,on:()=>{E[k]=!E[k];mtRe();}});
  t(0,0,'Live<br>Data','live');t(1,0,'History<br>Data','hist');t(2,0,'BISx Connection<br>History','conn');t(0,1,'Monitor<br>Error Log','err');t(1,1,'Sensor<br>Data','sens');t(2,1,'Snapshot','snap');mtRet();
  mt3(2,2,'Begin<br>Export',{ar:'r',ret:true,on:()=>mtExport()});},
 config(){mtList(8,6,530,176,`<table style="font-size:inherit"><tr><td>Platform</td><td>BIS Complete 2-channel (simulated)</td></tr><tr><td>Application</td><td>3.50</td></tr><tr><td>Splash Screen</td><td>3.50</td></tr><tr><td>Boot Script</td><td>3.50</td></tr><tr><td>Demo Data 1</td><td>simulated</td></tr><tr><td>Demo Data 2</td><td>simulated</td></tr><tr><td>Serial Number</td><td>SIM-0001</td></tr><tr><td>Host Protocol Revision</td><td>1.13</td></tr><tr><td>BISx Protocol Revision</td><td>simulated</td></tr><tr><td>Hardware Revision</td><td>simulated</td></tr></table>`);
  mtRet({w:175,y:190,h:48});mt3(2,2,'More',{ar:'r',ret:true,y:190,h:48,on:()=>mtGo('text',{title:'Configuration',lines:['This is a simulator: no real monitor software is running.','Screen layout after software 3.50 (DSA, SEF, MF, ST, amplitude).']})});},
 datetime(){const d=MT.dt||(MT.dt=new Date(T0+simT*1000)),mk=(c,r,l,v,k)=>mtTile({x:[158,272,406][c],y:[8,86][r],w:[108,128,114][c],h:68,html:`<span style="font-size:calc(16*var(--u))">${l}</span><b class="${MT.dtSel===k?'cy3':''}" style="font-weight:400;font-size:calc(26*var(--u))">${v}</b>`,k:'dt'+k,on:()=>{MT.dtSel=k;mtRe();}});
  mk(0,0,'Day',mtPad(d.getDate()),'day');mk(1,0,'Month',MT_MON[d.getMonth()],'mon');mk(2,0,'Year',d.getFullYear(),'yr');mk(0,1,'Hour',mtPad(d.getHours()),'hr');mk(1,1,'Minute',mtPad(d.getMinutes()),'min');mk(2,1,'Second',mtPad(d.getSeconds()),'sec');
  const ch=(dir)=>{const k=MT.dtSel||'day',m={day:()=>d.setDate(d.getDate()+dir),mon:()=>d.setMonth(d.getMonth()+dir),yr:()=>d.setFullYear(d.getFullYear()+dir),hr:()=>d.setHours(d.getHours()+dir),min:()=>d.setMinutes(d.getMinutes()+dir),sec:()=>d.setSeconds(d.getSeconds()+dir)};m[k]();mtRe();};
  mtTile({x:36,y:14,w:92,h:60,html:'<b class="cy">▲</b>',k:'dup',on:()=>ch(1)});mtTile({x:36,y:86,w:92,h:60,html:'<b class="cy">▼</b>',k:'ddn',on:()=>ch(-1)});
  mtRet({y:164,w:165});mtTile({x:363,y:164,w:167,h:70,t:'Apply<br>Change',on:()=>{MT.dt=null;mtHome(true);mtInfo('Date and time not changed',513);}});},
 language(){mtLbl(0,10,543,'Language',{fs:19,c:'#fff'});mtBox(190,60,170,60,'English',{fs:24,bg:'#2f3064',c:'#40e060'});
  mtTile({x:100,y:70,w:70,h:44,html:'<b class="cy">+</b>',k:'lp',on:()=>{}});mtTile({x:380,y:70,w:70,h:44,html:'<b class="cy">−</b>',k:'lm',on:()=>{}});mtRet();},
 help(){mtList(8,6,530,176,`MENU opens these pages; HOME returns to the main screen.\nSENSOR CHECK shows the electrode impedances and passes when every electrode is good.\nThe bell key pauses the alarm for 2 minutes, then silences it; press again to switch it on.\nDisplay chooses BIS trend, EEG, DSA + Amplitude or DSA + BIS.\nTarget Range sets the alarm limits for the BIS value.\n(Teaching note: Target Range starts at High 60 / Low 40 here; the real monitor starts at 100 / 0, which draws no band and raises no alarm.)`);mtRet({y:190,h:48});},
 snapshot(){mtLbl(8,18,527,"Warning: Snapshot in memory will be erased.\nPress 'Save Snapshot' button to save new snapshot.",{fs:17,c:'#fff'});
  mt3(1,1,'Save<br>Snapshot',{html:MT_CAM,on:()=>mtHome(true)});mtRet();},
 maint(){mt3(0,0,'BISx Connection<br>History',{ar:'r',on:()=>mtGo('text',{title:'BISx Connection History',lines:['No BISx connection events recorded.']})});mt3(1,0,'Serial<br>Protocol',{ar:'r',on:()=>mtGo('text',{title:'Serial Protocol',lines:['Serial output is off in the simulator.']})});mt3(2,0,'Software<br>Update',{ar:'r',on:()=>mtGo('text',{title:'Software Update',lines:['Insert a USB drive with update files.','(No update is possible in the simulator.)']})});
  mt3(0,1,'<span style="font-size:calc(13*var(--u))">Restore Default<br>Settings for<br>All Modes</span>',{on:()=>{mtDefaults();mtHome(true);mtInfo('Factory settings restored');}});mt3(1,1,'Audio Off<br>Reminder',{html:mtOnOff(MT.audioRem),on:()=>{MT.audioRem=!MT.audioRem;mtRe();}});mt3(2,1,'Calibrate<br>Touch Screen',{ar:'r',on:()=>mtGo('text',{title:'Calibrate Touch Screen',lines:['Touch the targets as they appear.','(The simulator uses your own pointer; nothing to calibrate.)']})});mtRet();},
 diag(){mt3(0,0,'Diagnostic<br>Codes',{html:mtOnOff(MT.diag),on:()=>{MT.diag=!MT.diag;mtRe();mtD();}});mt3(1,0,'DSC<br>Self Test',{ar:'r',on:()=>mtGo('text',{title:'DSC Self Test',lines:['Digital signal converter self test: passed (simulated).']})});mt3(2,0,'Monitor<br>Error Log',{ar:'r',on:()=>mtGo('text',{title:'Monitor Error Log',lines:['No errors logged.']})});
  mt3(0,1,'Clear<br>Trend Data',{on:()=>{mtClearTrend();mtHome(true);mtInfo('Trend data cleared');}});mtRet();},
 exporting(){mtLbl(0,10,543,'Export',{fs:19,c:'#fff'});const l=mtLbl(0,70,543,mtExportPct()>=100?'100% complete':'Exporting ... '+mtExportPct()+'%',{fs:22,c:'#fff'});l.id='mtExpPct';
  mtTile({x:190,y:110,w:167,h:48,t:'Stop Export',on:()=>{MT.usbUntil=0;mtBack();mtD();}});mtRet();},
 text(arg){mtLbl(0,10,543,arg.title,{fs:19,c:'#fff'});mtList(8,40,530,120,arg.lines.join('\n'));mtRet();}};
// Snapshot (manual 4.6.8): the new marker (camera) goes onto the trend at once; if one was already in memory the old marker becomes a diamond and the warning screen follows
function mtSnapshot(){const had=MT.snapT!=null;if(had)MT.snapPrev=MT.snapT;MT.snapT=simT;mtD();if(had)mtGo('snapshot');else mtHome(true);}
function mtSmooth(){const n=mtStepVal([10,15,30],mon.smooth,1);mon.smooth=n;try{$('kSmooth').textContent=`Smoothing ${n} s`;}catch(e){}mtInfo(`Smoothing Rate Changed to ${n} Seconds`,534);mtRe();}
function mtMode(m){MT.mode=m;const P={1:[15,false,1],2:[30,true,1],3:[10,false,1],4:[15,false,2]}[m];mon.smooth=P[0];MT.displaySR=P[1];MT.channels=P[2];try{$('kSmooth').textContent=`Smoothing ${P[0]} s`;}catch(e){}mtD();}
function mtSettingsSnap(){return {win:MT.win,alarmVol:MT.alarmVol,tgt:Object.assign({},MT.tgt),audioRem:MT.audioRem,smooth:mon.smooth,displaySR:MT.displaySR,displayST:MT.displayST,secondary:MT.secondary,channels:MT.channels,chartInt:MT.chartInt,showVals:MT.showVals,filters:MT.filters,imp:MT.imp,main:MT.main};}
function mtSettingsApply(s){if(!s)return;MT.win=s.win;MT.alarmVol=s.alarmVol;Object.assign(MT.tgt,s.tgt);MT.audioRem=s.audioRem;mon.smooth=s.smooth;MT.displaySR=s.displaySR;MT.displayST=s.displayST;MT.secondary=s.secondary;MT.channels=s.channels;MT.chartInt=s.chartInt;MT.showVals=s.showVals;MT.filters=s.filters;MT.imp=s.imp;MT.main=s.main;mtTgtSync();try{$('kSmooth').textContent=`Smoothing ${s.smooth} s`;}catch(e){}}
function mtDefaults(){mtSettingsApply({win:60,alarmVol:3,tgt:{active:false,alarm:true,hi:60,lo:40,fmt:'band'},audioRem:true,smooth:15,displaySR:true,displayST:true,secondary:'emg',channels:1,chartInt:15,showVals:false,filters:true,imp:true,main:'dsaAmpl'});MT.mode=1;}
const MT_SEC={none:'None',sr:'Suppression Ratio',emg:'EMG',sqi:'Signal Quality',bpm:'Bursts/Minute'},MT_MAIN={bis:'BIS',eeg:'EEG',dsaAmpl:'DSA + Amplitude',dsaBis:'DSA + BIS'};
function mtSettingsList(s){const g=s?{win:s.win,vol:s.alarmVol,tgt:s.tgt,rem:s.audioRem,sm:s.smooth,sr:s.displaySR,sec:s.secondary,ch:s.channels,ci:s.chartInt,sv:s.showVals,f:s.filters,imp:s.imp,main:s.main}:{win:MT.win,vol:MT.alarmVol,tgt:MT.tgt,rem:MT.audioRem,sm:mon.smooth,sr:MT.displaySR,sec:MT.secondary,ch:MT.channels,ci:MT.chartInt,sv:MT.showVals,f:MT.filters,imp:MT.imp,main:MT.main};
 return [['Trend Time Scale',g.win===60?'1 hour':g.win+' minutes',g.win],['Alarm Volume',g.vol+' (of 5)',g.vol],['Target Range',g.tgt.active?'Active':'Inactive',g.tgt.active],['&nbsp;&nbsp;High Limit',g.tgt.hi,g.tgt.hi],['&nbsp;&nbsp;Low Limit',g.tgt.lo,g.tgt.lo],['&nbsp;&nbsp;Target Alarm',g.tgt.alarm?'On':'Off',g.tgt.alarm],['Audio Off Reminder',g.rem?'Active':'Inactive',g.rem],
  ['BIS Smoothing Rate',g.sm+' seconds',g.sm],['Display SR',g.sr?'Yes':'No',g.sr],['Secondary Variable',MT_SEC[g.sec],g.sec],['Maximum EEG Channels',g.ch,g.ch],['Charting Interval',g.ci,g.ci],['Sensor Check Values',g.sv?'Show':'Hide',g.sv],
  ['Language','English','en'],['Impedance Checking',g.imp?'On':'Off',g.imp],['Filters',g.f?'On':'Off',g.f],['Display Type',MT_MAIN[g.main],g.main]];}
function mtDiff(raw,sv,k){const s=mtSettingsList(sv).find(r=>r[0]===k);return s&&s[2]!==raw;}
function mtClearTrend(){HIST.length=0;MT.pre=[];MT.hc=null;R.HIST.length=0;MT.gaps.length=0;MT.anchor=mtAnchor(simT);mtD();}
function mtAnchor(t){return Math.ceil((T0/1000+t)/60)*60-T0/1000;} // the next whole minute on the clock: where the time labels start
// Export Data (manual 4.6.11): a status screen with a percentage and Stop Export; the USB icon shows under the BIS box while exporting. The simulator also saves a CSV of the history.
function mtExport(){const rows=['Time,BIS,SQI,EMG_dB,SR_percent,SEF_Hz,MF_Hz'];mtH().forEach(c=>rows.push([mtStamp(c.n).replace('  ',' '),c.bis==null?'':c.bis.toFixed(1),c.sqi,c.emg.toFixed(1),c.bsr.toFixed(0),c.sef==null?'':c.sef.toFixed(1),c.mf==null?'':c.mf.toFixed(1)].join(',')));
 try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.join('\n')+'\n'],{type:'text/csv'}));a.download='bis-simulator-history.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);}catch(e){}
 MT.expT0=Date.now();MT.usbUntil=MT.expT0+4000;mtGo('exporting');setTimeout(()=>{mtD();},4200);}
function mtExportPct(){return Math.min(100,Math.floor((Date.now()-(MT.expT0||0))/4000*100));}
function mtMenuLive(){if(MT.menu==='exporting'){const p=mtExportPct(),e=document.getElementById('mtExpPct');if(e)e.textContent=p>=100?'100% complete':'Exporting ... '+p+'%';}}

// ---------- drawing: everything on a 640 x 480 virtual screen; the canvases map it with a transform ----------
const MT_FR='#a8dbf0',MT_YEL='#e8dc1c',MT_PXS=121.33; // frame colour; EEG pixels per second (25 mm/s on the real LCD)
function mtCv(c,X0,Y0,W,H){const w=c.clientWidth;if(!w)return null;const dpr=Math.min(2,window.devicePixelRatio||1),pw=Math.round(w*dpr),ph=Math.round(w*H/W*dpr);
 if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph;}const k=pw/W,ctx=c.getContext('2d');ctx.setTransform(k,0,0,k,-X0*k,-Y0*k);ctx.imageSmoothingEnabled=false;ctx.lineJoin='round';return ctx;}
function mtRR(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function mtT(ctx,s,x,y,px,col,al,wt,fam){ctx.font=`${wt||400} ${px}px ${fam||MT_FONT}`;ctx.fillStyle=col;ctx.textAlign=al||'left';ctx.textBaseline='middle';ctx.fillText(s,x,y);}
function mtFrame(ctx,x,y,w,h,r,fill){mtRR(ctx,x+1,y+1,w-2,h-2,r);ctx.fillStyle=fill||'#000';ctx.fill();ctx.strokeStyle=MT_FR;ctx.lineWidth=2;ctx.stroke();}
// the window of columns shown: `win` seconds, data grows from the left, then scrolls; `off` seconds back from the newest (Trend Review)
// The real monitor is usually met mid-case, its DSA full: the screen shows about 35 minutes of earlier trend before the page's first column,
// made by BIS Advance's seeding (adv-seed.js: throwaway copies of the sim's own engine, an awake patient) and spread to one column a second.
// Kept in MT.pre, never in HIST. Clear Trend empties it; a page reset (new times) seeds it again.
function mtSeed(){const S=HIST.length?HIST[0].n:Math.floor(simT),sd=advSeed('awake',S),pre=[];
 for(const q of sd.pre.L)for(let j=0;j<ADV_STEP;j++)pre.push(Object.assign({},q,{n:q.n+j}));MT.pre=pre;MT.hc=null;}
function mtH(){let p=MT.pre;const live=HIST;
 if(p==null){if(typeof advSeed!=='function')return live;mtSeed();p=MT.pre;}
 if(p.length&&live.length&&live.length<3600&&(p[p.length-1].n>=live[0].n||live[0].n-p[p.length-1].n>2)){mtSeed();p=MT.pre;}
 const c=MT.hc,last=live.length?live[live.length-1].n:-1;if(c&&c.len===live.length&&c.last===last&&c.p===p)return c.arr;
 const f=live.length?live[0].n:Infinity,pp=p.length&&p[p.length-1].n>=f?p.filter(q=>q.n<f):p,arr=pp.length?pp.concat(live):live;
 MT.hc={len:live.length,last,p,arr};return arr;}
function mtModel(win,off){const e=Math.max(0,mtH().length-(off||0)),n=Math.min(e,win),o=e-n;return {n,o,win,t0:n?mtH()[o].n:simT,tN:n?mtH()[o+n-1].n:simT};}
// one value per screen pixel (average of the columns that fall on it); null where there is none
function mtSeries(m,W,fn){const out=new Array(W).fill(null),per=m.win/W;
 for(let x=0;x<W;x++){const i0=Math.floor(x*per);if(i0>=m.n)break;const i1=Math.max(i0+1,Math.floor((x+1)*per));let s=0,k=0;for(let i=i0;i<i1&&i<m.n;i++){const v=fn(mtH()[m.o+i]);if(v!=null){s+=v;k++;}}if(k)out[x]=s/k;}return out;}
// SEF and MF: held across the pixels that have no clean epoch (suppression), then smoothed over about 10 s: one unbroken line
function mtTrace(m,W,fn){const ser=mtSeries(m,W,fn),per=m.win/W,last=Math.min(W,Math.ceil(m.n/per)),k=Math.max(1,Math.round(10/per));let held=null;
 for(let x=0;x<last;x++){if(ser[x]==null)ser[x]=held;else held=ser[x];}
 let out=ser.slice();if(k>1)for(let x=0;x<last;x++){let s=0,c=0;for(let j=Math.max(0,x-k+1);j<=x;j++)if(ser[j]!=null){s+=ser[j];c++;}out[x]=c?s/c:null;}
 return mtMA(out,5);}
// centred moving average over n samples (a null stays null)
function mtMA(a,n){const h=n>>1,o=a.slice();for(let x=0;x<a.length;x++){if(a[x]==null)continue;let s=0,c=0;for(let j=Math.max(0,x-h);j<=Math.min(a.length-1,x+h);j++)if(a[j]!=null){s+=a[j];c++;}o[x]=s/c;}return o;}
function mtLine(ctx,ser,X0,Yf,col,lw,outline){const go=()=>{ctx.beginPath();let pen=false;ser.forEach((v,x)=>{if(v==null){pen=false;return;}const X=X0+x+.5,Y=Yf(v);pen?ctx.lineTo(X,Y):ctx.moveTo(X,Y);pen=true;});ctx.stroke();};
 if(outline){ctx.strokeStyle='#000';ctx.lineWidth=lw+2.5;go();}ctx.strokeStyle=col;ctx.lineWidth=lw;go();}
// ----- the DSA image: 1 px wide columns, no blur. Power per bin (dB) goes through a display scale that lifts the low frequencies,
// so an awake patient is orange-red below 13 Hz, green-yellow in the middle and cyan above 20 Hz, and a general anaesthetic is
// red at 4-13 Hz, a yellow fringe above it and cyan at the top; suppressed seconds are black gaps.
const MT_DW=323,MT_DH=118,MT_OFF=document.createElement('canvas');MT_OFF.width=MT_DW;MT_OFF.height=MT_DH;let MT_IMG=null,MT_ROWS=null;const MT_AMP=document.createElement('canvas');MT_AMP.width=323;MT_AMP.height=68; // 1:1 offscreen images, scaled with no smoothing: every column stays crisp
const mtSm=x=>x*x*(3-2*x);
const mtTilt=hz=>MT_TILT[0]-MT_TILT[1]*mtSm(Math.max(0,Math.min(1,(hz-MT_TILT[2])/MT_TILT[3])));
const MT_TILT=[12,14,10,8],MT_LO=-8,MT_SPAN=30;
function mtPaintDsa(m){const W=MT_DW,H=MT_DH,per=m.win/W,sh=0,sc=1,LO=MT_LO+sh,SPAN=MT_SPAN*sc;
 if(!MT_IMG)MT_IMG=MT_OFF.getContext('2d').createImageData(W,H);const d=MT_IMG.data;
 if(!MT_ROWS){MT_ROWS=[];for(let y=0;y<H;y++){const hz=30*(1-(y+.5)/H),kf=Math.max(0,Math.min(58.999,hz*2)),k0=Math.floor(kf);MT_ROWS.push([k0,kf-k0,mtTilt(hz)]);}}
 const v=new Float32Array(60),w=new Float32Array(60);
 for(let x=0;x<W;x++){const i0=Math.floor(x*per),i1=Math.max(i0+1,Math.floor((x+1)*per));
  if(i0>=m.n){for(let y=0;y<H;y++){const p=(y*W+x)*4;d[p]=d[p+1]=d[p+2]=0;d[p+3]=255;}continue;}
  const b=Math.min(m.n,i1),a=Math.max(0,i0-Math.max(0,10-(i1-i0))); // at least 10 s of epochs in every column: the real DSA averages
  let own=0,sup=0;for(let i=i0;i<b;i++){own++;if(mtH()[m.o+i].sp)sup++;}
  const sf=own?sup/own:0;v.fill(0);let k=0;for(let i=a;i<b;i++){const q=mtH()[m.o+i];if(q.sp)continue;const db=q.db;for(let j=0;j<60;j++)v[j]+=db[j];k++;}
  if(!k||sf>=.5){for(let y=0;y<H;y++){const p=(y*W+x)*4;d[p]=d[p+1]=d[p+2]=0;d[p+3]=255;}continue;}
  for(let j=0;j<60;j++)w[j]=(v[Math.max(0,j-2)]+2*v[Math.max(0,j-1)]+3*v[j]+2*v[Math.min(59,j+1)]+v[Math.min(59,j+2)])/(9*k); // 2.5 Hz of vertical smoothing: slow gradation, not speckle
  for(let y=0;y<H;y++){const r=MT_ROWS[y],db=w[r[0]]*(1-r[1])+w[r[0]+1]*r[1];let L=(db+r[2]-LO)/SPAN;if(sf>0)L=L*(1-1.5*sf)-.1*sf;
   const c=MT_LUT[(Math.max(0,Math.min(1,L))*255)|0],p=(y*W+x)*4;d[p]=c[0];d[p+1]=c[1];d[p+2]=c[2];d[p+3]=255;}}
 mtSoften(d,W,H);MT_OFF.getContext('2d').putImageData(MT_IMG,0,0);}
// soft vertical streaks, not speckle: a 3-column average along each row (black suppression columns stay black) and a light 1-2-1 vertical blend
let MT_TMP=null;
function mtSoften(d,W,H){if(!MT_TMP||MT_TMP.length!==d.length)MT_TMP=new Uint8ClampedArray(d.length);const t=MT_TMP;t.set(d);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=(y*W+x)*4;if(!t[p]&&!t[p+1]&&!t[p+2])continue;let r=0,g=0,b=0,k=0;
  for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=W)continue;const q=(y*W+xx)*4;if(!t[q]&&!t[q+1]&&!t[q+2])continue;const w=dx?1:2;r+=t[q]*w;g+=t[q+1]*w;b+=t[q+2]*w;k+=w;}
  d[p]=r/k;d[p+1]=g/k;d[p+2]=b/k;}
 t.set(d);
 for(let y=1;y<H-1;y++)for(let x=0;x<W;x++){const p=(y*W+x)*4,a=p-W*4,c=p+W*4;if(!t[p]&&!t[p+1]&&!t[p+2])continue;for(let j=0;j<3;j++)d[p+j]=(t[a+j]+2*t[p+j]+t[c+j])/4;}}
// ----- the time axis: labels hh:mm at a fixed spacing from the case start (10 min on the 1 hour scale), none beyond the newest column
function mtLabels(m,X0,W,total){if(MT.anchor==null)MT.anchor=mtAnchor(0);total=total||m.win;const steps=[1,2,5,10,15,30,60,120],step=steps.find(s=>total/60/s<=7)||120,out=[],st=step*60,base=MT.pre&&MT.pre.length?Math.ceil((T0/1000+m.t0)/st)*st-T0/1000:MT.anchor; // with the earlier trend: whole clock steps (15:10, 15:20 ...)
 for(let k=Math.max(0,Math.floor((m.t0-base)/st));;k++){const ts=base+k*st;if(ts>m.tN+.5||ts>m.t0+total)break;const x=X0+(ts-m.t0)/total*W;if(x<X0-6||x>X0+W-17)continue;
  out.push({ts,x,tx:Math.max(x,X0+17),clamped:x<X0+17,s:clk(ts)});}
 if(out.length>1&&out[0].clamped&&out[1].tx-out[0].tx<50)out.shift(); // the case-start label gives way to the next one rather than overlap it
 return out;}
function mtAxisBand(ctx,m,X0,W,y0,y1,total){const labs=mtLabels(m,X0,W,total);ctx.fillStyle='#000';ctx.fillRect(X0,y0,W+(total?0:0),y1-y0);
 labs.forEach(l=>mtT(ctx,l.s,l.tx,(y0+y1)/2+.5,13,'#f0e230','center'));return labs;}
function mtGuides(ctx,labs,y0,y1,col){ctx.save();ctx.setLineDash([1,3]);ctx.strokeStyle=col||'rgba(190,225,255,.75)';ctx.lineWidth=1;labs.forEach(l=>{if(l.clamped)return;const x=Math.round(l.x)+.5;ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.stroke();});ctx.restore();}
function mtArtefacts(ctx,m,X0,W,y,h,span){const total=span||m.win,per=total/W;
 ctx.fillStyle='#000';ctx.fillRect(X0,y,W,h);
 for(let x=0;x<W;x++){const i0=Math.floor(x*per);if(i0>=m.n)break;const i1=Math.max(i0+1,Math.floor((x+1)*per));let lvl=0;
  for(let i=i0;i<i1&&i<m.n;i++){const q=mtH()[m.o+i];if(q.sqi<15)lvl=2;else if(q.sqi<50&&lvl<1)lvl=1;}
  if(lvl){ctx.fillStyle=lvl===2?'#ffe600':'#e07820';ctx.fillRect(X0+x,y,1,h);}}}
function mtGaps(ctx,m,X0,W,y,h,span){const total=span||m.win;MT.gaps.forEach(g=>{const x=X0+(g.t-m.t0)/total*W;if(x>=X0&&x<=X0+W){ctx.fillStyle='#000';ctx.fillRect(Math.floor(x),y,g.w,h);}});}
function mtSnap(ctx,m,X0,W,y,span){const total=span||m.win;
 if(MT.snapPrev!=null){const px=X0+(MT.snapPrev-m.t0)/total*W;if(px>=X0&&px<=X0+W){ctx.fillStyle='#30d4d8';ctx.beginPath();ctx.moveTo(px,y-4);ctx.lineTo(px+4,y);ctx.lineTo(px,y+4);ctx.lineTo(px-4,y);ctx.fill();}}
 if(MT.snapT==null)return;const x=X0+(MT.snapT-m.t0)/total*W;if(x<X0||x>X0+W)return;
 ctx.fillStyle='#30d4d8';ctx.fillRect(x-5,y-4,10,8);ctx.fillStyle='#000';ctx.fillRect(x-2,y-1,4,4);}
function mtColourBar(ctx){const x=611,y=262,h=120,g=ctx.createLinearGradient(0,y,0,y+h);MT_STOPS.forEach(t=>g.addColorStop(t[0],`rgb(${t[1]},${t[2]},${t[3]})`));ctx.fillStyle=g;ctx.fillRect(x,y,15,h);
 ctx.strokeStyle='#dfe6ef';ctx.lineWidth=1;ctx.strokeRect(x+.5,y-.5,14,h+1);mtT(ctx,'H',618.5,251,13,'#e8e8f0','center',700);mtT(ctx,'L',618.5,394,13,'#e8e8f0','center',700);}
function mtHdr(c){const blank=!c||c.sqi<15;return {sef:blank||lastSef==null?'--':String(Math.round(lastSef)),mf:blank||lastMf==null?'--':mtPad(Math.round(lastMf)),bis:blank||c.bis==null?'--':String(Math.round(c.bis))};}
// the amplitude panel: a typical awake EEG fills a bit over half of it, the larger slow waves of anaesthesia more, burst suppression less
const mtAmpH=v=>{const p=Math.max(0,Math.min(1,(v-3)/44));return p>.6?.6+(p-.6)*.5:p;};
// ----- DSA + Amplitude, DSA + BIS -----
function mtDrawDsaView(ctx,withBis){const win=MT.win*60,m=mtModel(win),c=COLS[COLS.length-1],H=mtHdr(c);
 mtFrame(ctx,141,232,463,246,9);
 mtPaintDsa(m);ctx.imageSmoothingEnabled=false;ctx.drawImage(MT_OFF,0,0,MT_DW,MT_DH,143,258,MT_DW,MT_DH);
 // right label panel and the dotted band lines (through the image, with a short stub into the label panel)
 ctx.fillStyle='#000';ctx.fillRect(466,258,136,118);
 const Yh=hz=>258+118*(1-hz/30);ctx.save();ctx.setLineDash([2,2]);ctx.strokeStyle='rgba(255,255,255,.75)';ctx.lineWidth=1;ctx.beginPath();
 for(const hz of [4,8,13]){const y=Math.round(Yh(hz))+.5;ctx.moveTo(143,y);ctx.lineTo(489,y);}ctx.stroke();ctx.restore();
 mtGaps(ctx,m,143,323,258,118);
 // SEF (white) and MF (violet-blue), 2 px, unbroken
 mtLine(ctx,mtTrace(m,323,q=>q.sef),143,v=>Yh(Math.max(0,Math.min(30,v))),'#ffffff',2);mtLine(ctx,mtTrace(m,323,q=>q.mf),143,v=>Yh(Math.max(0,Math.min(30,v))),'#9a6cf0',2);
 // header strip: SEF, MF, date and time, case code, BIS
 mtT(ctx,'SEF '+H.sef,150,244,13,'#fff','left',700);mtT(ctx,'MF '+H.mf,150+ctx.measureText('SEF '+H.sef).width+14,244,13,'#9a6cf0','left',700);
 mtT(ctx,mtStamp(simT),372,244,12.5,'#fff','center');mtT(ctx,MT.demo?'DEMO':MT.caseId,502,244,12.5,'#fff','left');
 if(withBis)mtT(ctx,'BIS '+H.bis,596,244,12.5,'#fff','right',700);
 // left frequency labels (yellow), band names (yellow, centred on each band)
 for(const hz of [30,13,8,4])mtT(ctx,hz+' Hz',138,Math.max(Yh(hz),266),13,MT_YEL,'right');
 for(const [lo,hi,l] of [[13,30,'Beta'],[8,13,'Alpha'],[4,8,'Theta'],[0,4,'Delta']])mtT(ctx,l,545,(Yh(lo)+Yh(hi))/2,13,MT_YEL,'center');
 ctx.strokeStyle=MT_FR;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(142,377);ctx.lineTo(603,377);ctx.stroke();
 // lower trend: amplitude (white area, 1 px columns) or BIS
 ctx.fillStyle='#000';ctx.fillRect(143,378,459,68);
 if(!withBis){const ser=mtMA(mtSeries(m,323,q=>q.amp),5),o=MT_AMP.getContext('2d');o.clearRect(0,0,323,68);o.fillStyle='#ffffff';ser.forEach((v,x)=>{if(v==null)return;const h=Math.max(1,Math.round(66*mtAmpH(v)));o.fillRect(x,68-h-2,1,h);});ctx.drawImage(MT_AMP,0,0,323,68,143,378,323,68);
  mtGaps(ctx,m,143,323,378,68);
  ctx.save();ctx.setLineDash([2,3]);ctx.strokeStyle='#707070';ctx.lineWidth=1;ctx.beginPath();for(const f of [.25,.5,.75]){const y=Math.round(446-66*f)+.5;ctx.moveTo(143,y);ctx.lineTo(490,y);}ctx.stroke();ctx.restore();
  mtT(ctx,'AMPL',545,410,12,'#fff','center');}
 else{const Yb=v=>440-58*v/100;mtGaps(ctx,m,143,323,378,68);
  mtGuides(ctx,mtLabels(m,143,323),378,446);
  mtLine(ctx,mtSeries(m,323,q=>q.bis),143,Yb,'#fff6a0',2);for(const v of [100,50,0])mtT(ctx,String(v),138,Yb(v),13,MT_YEL,'right');}
 // time axis band and the artefact strip
 const labs=mtAxisBand(ctx,m,143,323,448,466);ctx.fillStyle='#000';ctx.fillRect(466,448,136,18);
 ctx.strokeStyle=MT_FR;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(142,447);ctx.lineTo(603,447);ctx.moveTo(142,467);ctx.lineTo(603,467);ctx.stroke();
 mtArtefacts(ctx,m,143,323,469,7);ctx.fillStyle='#000';ctx.fillRect(466,469,136,7);mtSnap(ctx,m,143,323,457);
 mtColourBar(ctx);}
// ----- the variable on the right-hand axis of the trend views -----
function mtRight(sec){
 if(sec==='st'){const mx=Math.max(120,Math.ceil(Math.max(0,...HIST.map(q=>q.st||0))/120)*120);return {rs:q=>q.st==null?null:q.st/mx*100,rt:'ST',rc:'#e060e0',rl:Array.from({length:7},(_,i)=>{const s=Math.round(mx*(6-i)/6);return Math.floor(s/60)+':'+mtPad(s%60);})};}
 if(sec==='emg')return {rs:q=>Math.max(0,Math.min(100,(q.emg-30)*2)),rt:'EMG',rc:'#f08a24',rl:[80,70,60,50,40,30].map(String)};
 if(sec==='sr')return {rs:q=>q.bsr,rt:'SR',rc:'#60d0ff',rl:[100,80,60,40,20,0].map(String)};
 if(sec==='sqi')return {rs:q=>q.sqi,rt:'SQI',rc:'#40e060',rl:[100,80,60,40,20,0].map(String)};
 if(sec==='bpm')return {rs:q=>{const p=(q.bsr||0)/100;return Math.min(100,48*p*(1-p)/30*100);},rt:'BPM',rc:'#f0c040',rl:[30,24,18,12,6,0].map(String)}; // teaching approximation: bursts per minute peak at about half suppression
 return {rs:null,rt:'',rc:'#e060f0',rl:[]};}
// ----- BIS trend view (also Trend Review) -----
function mtReviewLen(){return Math.max(60,Math.min(mtH().length,3600));}
function mtDrawTrendView(ctx){const R_=MT.review,len=R_?mtReviewLen():MT.win*60,off=R_?Math.min(R_.off||0,Math.max(0,mtH().length-len)):0,m=mtModel(len,off),W=478,X0=122,Yb=v=>440-176*v/100;
 mtFrame(ctx,120,232,484,246,9);
 ctx.fillStyle='#000';ctx.fillRect(X0,260,W,188);
 const sec=R_?R_.sec:MT.displayST?'st':MT.secondary,{rs,rl,rc,rt}=mtRight(sec);
 // grid
 ctx.save();ctx.setLineDash([1,3]);ctx.strokeStyle='rgba(255,255,255,.2)';ctx.lineWidth=1;ctx.beginPath();for(const v of [20,40,60,80]){const y=Math.round(Yb(v))+.5;ctx.moveTo(X0,y);ctx.lineTo(X0+W,y);}ctx.stroke();ctx.restore();
 if(MT.tgt.active&&!(MT.tgt.hi>=100&&MT.tgt.lo<=0)){const yh=Yb(MT.tgt.hi),yl=Yb(MT.tgt.lo);if(MT.tgt.fmt==='band'){ctx.fillStyle='rgba(110,110,230,.36)';ctx.fillRect(X0,yh,W,yl-yh);}else{ctx.strokeStyle='#b9b9ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(X0,Math.round(yh)+.5);ctx.lineTo(X0+W,Math.round(yh)+.5);ctx.moveTo(X0,Math.round(yl)+.5);ctx.lineTo(X0+W,Math.round(yl)+.5);ctx.stroke();}}
 mtGuides(ctx,mtLabels(m,X0,W),260,448,'rgba(190,225,255,.8)');
 mtGaps(ctx,m,X0,W,260,188);
 if(rs)mtLine(ctx,mtSeries(m,W,rs),X0,v=>Yb(v),rc,1.2);
 mtLine(ctx,mtSeries(m,W,q=>q.bis),X0,Yb,'#fff6a0',2.4,true);
 // axes
 for(const v of [0,20,40,60,80,100])mtT(ctx,String(v),116,Yb(v),14,MT_YEL,'right');
 rl.forEach((s,i)=>mtT(ctx,s,610,264+i*(176/(rl.length-1)),14,rc,'left'));
 // header: BIS (heavy) left, date and time centre, the right-hand variable's name
 mtT(ctx,'BIS',129,246,12,'#f4f450','left',700,MT_BOLD);
 if(R_){mtT(ctx,(mtH().length?mtStamp(mtH()[0].n):'--')+' → '+mtStamp(simT),340,246,10.5,'#38c8b8','center');mtT(ctx,MT.demo?'DEMO':MT.caseId,553,246,11,'#fff','right');
  if(rt)mtT(ctx,rt,596,246,11,rc,'right',400,MT_BOLD);}
 else{mtT(ctx,mtStamp(simT),372,246,11.5,'#38c8b8','center');mtT(ctx,MT.demo?'DEMO':MT.caseId,500,246,11.5,'#fff','left');if(rt)mtT(ctx,rt,596,246,11.5,rc,'right',400,MT_BOLD);}
 ctx.strokeStyle=MT_FR;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(121,259);ctx.lineTo(603,259);ctx.stroke();
 mtAxisBand(ctx,m,X0,W,450,466);
 ctx.strokeStyle=MT_FR;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(121,449);ctx.lineTo(603,449);ctx.moveTo(121,467);ctx.lineTo(603,467);ctx.stroke();
 mtArtefacts(ctx,m,X0,W,469,7);mtSnap(ctx,m,X0,W,458);
 if(R_&&R_.cur!=null&&m.n){const i=Math.max(0,Math.min(m.n-1,R_.cur)),x=Math.round(X0+(i+.5)/m.win*W)+.5,q=mtH()[m.o+i];
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,262);ctx.lineTo(x,448);ctx.stroke();
  const bx=Math.max(X0+6,Math.min(X0+W-110,x-125)),by=292;mtRR(ctx,bx,by,100,72,8);ctx.fillStyle='#3a3b44';ctx.fill();ctx.strokeStyle='#c8c8d0';ctx.lineWidth=2;ctx.stroke();
  mtT(ctx,q.sqi<15||q.bis==null?'--':String(Math.round(q.bis)),bx+50,by+20,30,'#f4e84a','center',700,MT_BOLD);
  mtT(ctx,(sec==='sr'?'SR: '+Math.round(q.bsr):sec==='sqi'?'SQI: '+q.sqi:'EMG: '+Math.round(q.emg)),bx+50,by+44,14,'#f08a24','center',700,MT_BOLD);mtT(ctx,clk(q.n)+':'+mtPad(((q.n+Math.round(T0/1000))%60+60)%60),bx+50,by+62,12,'#e0e0e8','center');
  ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx+100,by+36);ctx.lineTo(x-2,by+36);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(bx+100,by+36);ctx.lineTo(bx+108,by+32);ctx.lineTo(bx+108,by+40);ctx.fill();}}
// ----- EEG as the main display -----
function mtDrawEegView(ctx){mtFrame(ctx,90,232,528,244,6);
 const c=COLS[COLS.length-1];mtT(ctx,'EEG',97,241,12,'#b8d838','left',700);mtT(ctx,'25 mm / sec.',156,241,11,'#e2e4f4','left');mtT(ctx,mtStamp(simT),352,241,12.5,'#50d0d8','center');
 mtT(ctx,MT.demo?'DEMO':MT.caseId,480,241,11,'#e2e4f4','left');mtT(ctx,(MT.channels===2?'50':'25')+' µV / division',610,241,11,'#e2e4f4','right');
 ctx.strokeStyle=MT_FR;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(91,250.5);ctx.lineTo(617,250.5);ctx.stroke();
 mtSweepBox(ctx,92,252,524,222,true);}
const MT_GAIN=1.25; // awake traces here are small (sd about 10 uV): drawn a little larger so they fill the box like the real screen's; clipped at the box edge
function mtSweepBox(ctx,x,y,w,h,big){const N=Math.round(w/MT_PXS*FS),two=MT.channels===2,hh=two?h/2:h,pos=produced%N,gap=Math.round(Math.max(24,w*0.08)),gapN=Math.round(gap/w*N);
 ctx.fillStyle='#05080a';ctx.fillRect(x,y,w,h);
 for(let ch=0;ch<(two?2:1);ch++){const arr=ch?R.SIG:SIG,top=y+ch*hh;ctx.save();ctx.beginPath();ctx.rect(x,top,w,hh);ctx.clip();
  ctx.fillStyle='rgba(47,74,130,.9)';ctx.fillRect(x+pos/N*w,top,gap,hh);
  ctx.strokeStyle='#8fd02a';ctx.lineWidth=1.5;ctx.beginPath();const L=arr.length-1;let pen=false;
  for(let j=0;j<N;j++){let idx;if(j<pos)idx=L-(pos-1-j);else if(j>=pos+gapN)idx=L-(pos-1-j)-N;else{pen=false;continue;}
   if(idx<0||idx>L){pen=false;continue;}let v=arr[idx];if(!MT.filters)v+=9*Math.sin(2*Math.PI*50*(produced-(L-idx))/FS);
   const X=x+j/N*w,Y=top+hh/2-v*MT_GAIN*(hh/100);pen?ctx.lineTo(X,Y):ctx.moveTo(X,Y);pen=true;}
  ctx.stroke();ctx.restore();}
}
// ----- the small BIS trend that takes the EEG box's place while the Menu is open (and over the big EEG display) -----
// 'BIS' top left, 'ST' (or the secondary variable) top right with its own axis outside the frame, a black axis band under the plot
function mtDrawMiniTrend(ctx){const win=MT.win*60,m=mtModel(win),X0=268,W=338,Yb=v=>148-80*v/100,sec=MT.displayST?'st':MT.secondary,{rs,rl,rc,rt}=mtRight(sec);
 mtFrame(ctx,267,47,340,126,6,'#06080b');ctx.fillStyle='#000';ctx.fillRect(X0,64,W,86);
 mtT(ctx,'BIS',275,56,12,'#f4f450','left',700,MT_BOLD);if(rt)mtT(ctx,rt,598,56,11.5,rc,'right',400,MT_BOLD);
 ctx.strokeStyle='#cfd9e6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(268,63.5);ctx.lineTo(606,63.5);ctx.stroke();
 const labs=mtLabels(m,X0,W);mtGuides(ctx,labs,64,150,'rgba(190,225,255,.7)');
 if(rs)mtLine(ctx,mtSeries(m,W,rs),X0,v=>Yb(v),rc,1);
 mtLine(ctx,mtSeries(m,W,q=>q.bis),X0,Yb,'#fff6a0',1.6);
 for(const v of [100,80,60,40,20,0])mtT(ctx,String(v),262,Yb(v),11,MT_YEL,'right');
 rl.forEach((s,i)=>mtT(ctx,s,610,Yb(100)+i*((Yb(0)-Yb(100))/(rl.length-1)),11,rc,'left'));
 ctx.fillStyle='#000';ctx.fillRect(X0,151,W,19);ctx.strokeStyle='#cfd9e6';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(268,150.5);ctx.lineTo(606,150.5);ctx.stroke();
 labs.forEach(l=>mtT(ctx,l.s,l.tx,161,12,'#f0e230','center'));}
// ----- entry points called by app.js -----
function paintV(){}
function drawVDsa(){if(!mtVis())return;const c=mq('c2Dsa');if(MT.menu||MT.sensor)return;const ctx=mtCv(c,88,232,552,248);if(!ctx)return;ctx.clearRect(88,232,552,248);
 const v=mtView();if(v==='dsaAmpl'||v==='dsaBis')mtDrawDsaView(ctx,v==='dsaBis');else if(v==='bis')mtDrawTrendView(ctx);else mtDrawEegView(ctx);}
function drawVEeg(){if(!mtVis())return;const c=mq('c2Eeg');if(MT.sensor)return;const ctx=mtCv(c,240,44,400,134);if(!ctx)return;ctx.clearRect(240,44,400,134);
 if(MT.review)return;
 if(MT.menu||MT.main==='eeg'){mtDrawMiniTrend(ctx);}
 else{const two=MT.channels===2,h=two?106:82;mtFrame(ctx,248,50,364,h+0,6,'#05080a');mtSweepBox(ctx,251,53,358,h-6,false);}
 if(MT.main==='eeg'&&!MT.menu&&!MT.sensor&&!MT.review)drawVDsa();}
// ---------- sensor check (key 3 becomes EXIT): electrode circles grey / red X / green tick, impedances behind Show Values ----------
const MT_EPOS={1:216,2:292,4:368,3:557};
function mtSensorStart(){if(MT.demo){mtInfo('Not available during Demo Case',511);return;}
 if(MT.menu||MT.review)mtHome(true);
 MT.sensor={t0:Date.now(),el:[1,2,3,4].map(n=>({n,st:'none',v:null})),lab:['1','2','3','4'],pass:false,passAt:0};mtSensorEval();mtSensorSvg();mq('v2Sensor').hidden=false;mtKeys();mtLayout();mtD();mq('kSensor').focus();}
// leaving with an electrode still HIGH: 'Last Sensor Check Failed [16]'; a pass starts a new case (new 4-character case ID) and leaves a gap marker
function mtNewCaseId(){const A='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';let id='';for(let i=0;i<4;i++)id+=A[Math.floor(Math.random()*A.length)];return id;}
function mtSensorExit(){if(!MT.sensor)return;const was=MT.sensor.pass,bad=MT.sensor.el.some(e=>e.st==='high');MT.sensor=null;mq('v2Sensor').hidden=true;
 if(was){MT.gaps.push({t:simT,w:1});MT.realId=mtNewCaseId();if(!MT.demo)MT.caseId=MT.realId;}
 else if(bad)mtInfo('Last Sensor Check Failed',16,120000,'lo',true);
 mtKeys();mtLayout();mtD();}
function mtSensorEval(){const s=MT.sensor;if(!s)return;const c=COLS[COLS.length-1]||{sqi:100},ok=c.sqi>=50,age=(Date.now()-s.t0)/1000,order={1:1.2,4:1.9,3:2.6,2:3.3};
 // each electrode is pending (navy), then briefly NOISE (grey ?), then PASS; the ground (2) reads HIGH for a moment first, so the 'Press electrode 2' message can be seen
 s.el.forEach(e=>{const a=age-order[e.n];if(a<0){e.st='none';e.v=null;return;}
  if(a<.7){e.st='noise';e.v=null;return;}
  if(!ok&&e.n===3){e.st='high';e.v=40+((Date.now()/700)%1>.5?27:24);return;}
  if(e.n===2&&a<2.2){e.st='high';e.v=34+((Date.now()/700)%1>.5?9:5);return;}
  e.st='pass';e.v=e.n===2?0:[0,3,0,2][e.n-1]||1;});
 const all=s.el.every(e=>e.st==='pass');if(all&&!s.pass){s.pass=true;s.passAt=Date.now();}if(!all)s.pass=false;
 if(s.pass&&Date.now()-s.passAt>2200){mtSensorExit();return;}
 mtSensorSvg();}
// the sensor pod: a tapered cable tail, three scalloped lobes (electrodes 1, 2 and 4) joined by narrow necks, a long thin strip and the lobe of electrode 3
const MT_POD='<path d="M120 317L184 306V356L120 346z"/><rect x="216" y="314" width="152" height="34" rx="6"/><circle cx="216" cy="331" r="36"/><circle cx="292" cy="331" r="36"/><circle cx="368" cy="331" r="36"/><rect x="380" y="326" width="150" height="10"/><rect x="513" y="303" width="86" height="60" rx="28"/>';
function mtSensorSvg(){const s=MT.sensor;if(!s)return;const sv=mq('v2ScSvg'),vals=MT.showVals,F='font-family="Arimo,sans-serif"';
 let h=`<rect x="92.5" y="231.5" width="546" height="244" rx="7" fill="#4a4a8a" stroke="#8a8cc8" stroke-width="1"/><text x="365" y="257" text-anchor="middle" ${F} font-weight="700" font-size="20" fill="#fff" letter-spacing="1">Sensor Check</text>
 <g fill="#f4f4fa">${MT_POD}</g>`;
 for(const n of [1,2,4,3]){const e=s.el[n-1],x=MT_EPOS[n],y=331;let fill='#2c2e5c',sym='',lab='',cls='';
  if(s.pass){fill='#2c2e5c';sym='';lab='PASS';}else if(e.st==='pass'){fill='#0a9e55';sym='ok';lab='PASS';}else if(e.st==='high'){fill='#e8191f';sym='x';lab='HIGH';cls=' class="blink"';}else if(e.st==='noise'){fill='#808080';sym='?';lab='NOISE';}
  h+=`<g${cls} data-e="${n}"><circle cx="${x}" cy="${y}" r="29" fill="#1c2050"/><circle cx="${x}" cy="${y}" r="26" fill="${fill}"/><text x="${x}" y="${y+7}" text-anchor="middle" ${F} font-weight="700" font-size="21" fill="#fff">${n}</text></g>`;
  if(vals){h+=`<text x="${x}" y="289" text-anchor="middle" ${F} font-size="15" fill="#fff">${e.v==null?'':e.v}</text><text x="${x}" y="388" text-anchor="middle" ${F} font-size="15" fill="#fff">${s.pass?'PASS':e.st==='none'?'':lab}</text>`;}
  else if(s.pass)h+=`<text x="${x}" y="392" text-anchor="middle" ${F} font-size="17" fill="#fff">PASS</text>`;else h+=sym==='ok'?`<path d="M${x-10} 386l7 8l13-17" stroke="#fff" stroke-width="3.4" fill="none"/>`:sym==='x'?`<path d="M${x-9} 378l18 18M${x+9} 378l-18 18" stroke="#fff" stroke-width="2.6"/>`:sym==='?'?`<text x="${x}" y="392" text-anchor="middle" ${F} font-size="22" fill="#fff">?</text>`:'';}
 sv.innerHTML=h;mq('v2ScVal').innerHTML=vals?'Hide<br>Values':'Show<br>Values';}
// ---------- trend review ----------
function mtReviewOpen(){MT.menu=null;MT.menuStack=[];mq('v2Menu').hidden=true;MT.review={mode:'case',cur:null,off:0,sec:MT.displayST?'emg':MT.secondary==='none'?'none':MT.secondary};mtReviewUI();mtKeys();mtLayout();mtD();}
const MT_DBL=d=>`<svg class="ar2 ${d}" viewBox="0 0 28 14" width="26" height="13" aria-hidden="true">${d==='l'?'<path d="M13 1L2 7l11 6zM26 1L15 7l11 6z"/>':'<path d="M2 1l11 6L2 13zM15 1l11 6-11 6z"/>'}</svg>`;
function mtReviewUI(){const R_=MT.review;if(!R_)return;const P=mq('v2Rev');MT_P=P;P.innerHTML='';P.hidden=false;
 mtLbl(0,5,439,'TREND REVIEW',{fs:20,c:'#f0a020'});
 const cur=R_.mode==='cursor';
 mtTile({x:6,y:30,w:104,h:56,html:`<span class="opts" style="gap:12px"><b class="${cur?'d':'g'}">Case</b><b class="${cur?'g':'d'}">Cursor</b></span>`,k:'mode',par:P,on:()=>{R_.mode=cur?'case':'cursor';if(R_.mode==='cursor'&&R_.cur==null)R_.cur=Math.max(0,Math.floor(mtReviewLen()/2));mtReviewUI();mtD();}});
 const sb=(k,l)=>`<b class="${R_.sec===k?'g':'d'}" data-s="${k}">${l}</b>`;
 mtTile({x:116,y:30,w:172,h:70,html:`<span class="opts" style="gap:14px">${sb('sr','SR')}${sb('emg','EMG')}${sb('sqi','SQI')}</span><span class="${R_.sec==='none'?'g':'d'}">None</span>`,k:'sec',par:P,on:()=>{const o=['emg','sr','sqi','none'];R_.sec=o[(o.indexOf(R_.sec)+1)%4];mtReviewUI();mtD();}});
 mtTile({x:294,y:30,w:140,h:56,html:MT_PAGE,k:'print',par:P,on:()=>{mtInfo('PDF creation completed');}});
 const st=(x,t,ar,dis,fn)=>mtTile({x,y:106,w:104,h:58,t,html:ar==='ll'||ar==='rr'?MT_DBL(ar[0]):'<i class="ar'+(ar==='l'?' l':'')+'"></i>',ret:true,cls:'rvt'+(ar==='rr'?' rr':''),k:t,par:P,dis,on:fn});
 const len=mtReviewLen(),maxOff=Math.max(0,mtH().length-len),shift=d=>{R_.off=Math.max(0,Math.min(maxOff,(R_.off||0)+d*len/4));mtD();};
 st(6,'Previous<br>Case','ll',true);
 st(116,cur?'Step<br>Backward':'Rewind','l',false,()=>{if(cur){R_.cur=Math.max(0,(R_.cur??0)-10);mtD();}else shift(1);});
 st(226,cur?'Step<br>Forward':'Advance','r',false,()=>{if(cur){R_.cur=Math.min(len-1,(R_.cur??0)+10);mtD();}else shift(-1);});
 st(336,'Next<br>Case','rr',true);}
function mtReviewClick(e){const R_=MT.review;if(!R_||!mtH().length)return;const c=mq('c2Dsa'),r=c.getBoundingClientRect(),vx=88+(e.clientX-r.left)/r.width*552,win=mtReviewLen(),m=mtModel(win,Math.min(R_.off||0,Math.max(0,mtH().length-win))),i=Math.floor((vx-122)/478*win);
 if(i<0||i>=m.n)return;R_.cur=i;if(R_.mode!=='cursor'){R_.mode='cursor';mtReviewUI();}mtD();}
// ---------- wiring ----------
function mtApply(){mtHome(true);if(MT.sensor){MT.sensor=null;mq('v2Sensor').hidden=true;}mtLayout();mtAlarmUI();mtKeys();}
function mtWire(){
 mq('kSilent').onclick=mtAlarmPress;
 mq('kMenu').onclick=()=>{if(MT.sensor)mtSensorExit();if(MT.menu)mtHome();else{if(MT.review)mtHome(true);mtOpen();}};
 mq('kSensor').onclick=()=>{if(MT.sensor)mtSensorExit();else if(MT.review)mtHome();else mtSensorStart();};
 mq('v2Dismiss').onclick=()=>{const k=mq('v2Msg').dataset.key;if(k==='startup')MT.startup.on=false;else if(k==='info')MT.info=null;else if(k==='lo')MT.lowDis=MT.curLo;mtD();mtMsgUI();};
 mq('v2ScVal').onclick=()=>{MT.showVals=!MT.showVals;mtSensorSvg();};
 mq('v2Review').onclick=mtReviewOpen;
 mq('c2Dsa').addEventListener('click',mtReviewClick);
 const esc=e=>{if(e.key==='Escape'&&(MT.menu||MT.review)){e.preventDefault();mtHome();}};mq('v2Menu').addEventListener('keydown',esc);mq('v2Rev').addEventListener('keydown',esc);
 addEventListener('pointerdown',mtUnlock,{capture:true,once:true});addEventListener('keydown',mtUnlock,{capture:true,once:true});
 setInterval(()=>{if(MT.sensor){mtSensorEval();mtMsgUI();mtSqiBars();}if(mtVis()){mtAlarmTick();mtMenuLive();mq('v2Usb').hidden=!(MT.usbUntil>Date.now());}},400);}
mtWire();
