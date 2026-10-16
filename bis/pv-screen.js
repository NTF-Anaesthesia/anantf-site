// Philips IntelliVue screen (the 'philips' skin): an MX800-class patient monitor showing BIS from the Philips BIS module, laid out like
// the owner's operating-theatre photo (ECG, Pleth and EEG waves; HR, Pulse, SpO2, ST, BIS with SQI, EMG and SR; NBP with its list; the
// SmartKeys). Built from Philips' Instructions for Use (Release N, "Monitoring BIS") and the photo; see NOTES.md, "Philips IntelliVue".
// IntelliVue has no BIS DSA: the screen shows the EEG wave and the numbers only. ECG, Pleth, SpO2 and NBP are simple stand-ins so the
// screen reads as a whole monitor; only BIS, its EEG and its numbers come from the simulation. Reads app.js globals only when called.
const PV_W=1440,PV_H=900,PV_FONT='Selawik,"Segoe UI","Open Sans",system-ui,sans-serif';
const PC={bg:'#000',ecg:'#4fe08a',spo2:'#3cbcf2',nbp:'#c49ae8',bis:'#f2f2f2',yelBis:'#e4da98',dim:'#9aa0a8',lbl:'#d8dce2',inop:'#4ab4e6',yel:'#f4e04a',key:'#1f2a3a',keyHi:'#2f6fe0'};
const PV={built:false,cv:null,st:null,set:{bisOn:true,hi:70,lo:20,alarms:true,scale:100,sqi:true,emg:true,sr:true,sef:false,tp:false,colour:'yellow'},
 menu:null,ack:{},wv:null,nbp:null,lastCheck:null,checkUntil:0,keyMsg:null,_k:null,_sec:null,dirty:true};
const pq=id=>document.getElementById(id);
function pvCol(){return PV.set.colour==='yellow'?PC.yelBis:PC.bis;}
// ----- build -----
function pvBuild(){if(PV.built)return;PV.built=true;
 pq('pvWrap').innerHTML=`<div class="pvcase"><div class="pvbrand">IntelliVue <b>MX800</b></div><span class="pvled" aria-hidden="true"></span>
 <div class="pvs" id="pvS" role="group" aria-label="Philips IntelliVue monitor screen"><canvas id="pvCv" aria-hidden="true"></canvas><div class="pvhits" id="pvHits"></div><div class="pvmenu" id="pvMenu" hidden></div></div>
 <div class="pvlogo" aria-hidden="true">PHILIPS</div></div>`;
 PV.cv=pq('pvCv');PV.st=document.createElement('canvas');PV.st.width=PV_W;PV.st.height=PV_H;
 // touch areas over the canvas, in design pixels
 const hits=[['bis',860,516,560,150,'BIS: open Setup BIS'],['eeg',10,535,830,120,'EEG wave: open Setup BIS'],['silence',8,812,92,82,'Silence: acknowledge alarms'],['pause',104,812,92,82,'Pause Alarms'],
  ['setup',1010,812,100,82,'Main Setup'],['main',1114,812,100,82,'Main Screen']];
 pq('pvHits').innerHTML=hits.map(([k,x,y,w,h,l])=>`<button type="button" class="pvhit" data-k="${k}" aria-label="${l}" style="left:${x/PV_W*100}%;top:${y/PV_H*100}%;width:${w/PV_W*100}%;height:${h/PV_H*100}%"></button>`).join('');
 pq('pvHits').onclick=e=>{const b=e.target.closest('.pvhit');if(!b)return;pvKey(b.dataset.k);};
 pq('pvMenu').onclick=e=>{const b=e.target.closest('button');if(!b)return;pvMenuClick(b.dataset.a,b.dataset.v);};}
function pvKey(k){if(k==='bis'||k==='eeg'){PV.menu=PV.menu==='setup'?null:'setup';pvMenuRender();}
 else if(k==='main'){PV.menu=null;pvMenuRender();}
 else if(k==='setup'){PV.menu=PV.menu==='main'?null:'main';pvMenuRender();}
 else if(k==='silence'){const A=pvAlarms();for(const m of A)PV.ack[m.text]=true;PV.dirty=true;}
 else if(k==='pause'){PV.pauseUntil=Date.now()+3*60000;PV.dirty=true;}}
// ----- the Setup BIS window (Philips' grey menu), the BIS sensor window and Main Setup -----
const PV_ITEMS=[['bisOn','BIS',['On','Off']],['hi','High Limit',null],['lo','Low Limit',null],['alarms','Alarms',['On','Off']],['smooth','Smoothing Rate',['10 sec','15 sec','30 sec']],
 ['scale','Scale',['50µV','100µV','200µV','500µV']],['sqi','SQI',['On','Off']],['tp','TP',['On','Off']],['sef','SEF',['On','Off']],['sr','SR',['On','Off']],['emg','EMG',['On','Off']],['sensor','Show Sensor',null],['chk','Sensor Check',null]];
function pvVal(k){const s=PV.set;if(k==='smooth')return mon.smooth+' sec';if(k==='scale')return s.scale+'µV';if(k==='hi')return String(s.hi);if(k==='lo')return String(s.lo);if(k==='sensor'||k==='chk')return '';
 return s[k==='bisOn'?'bisOn':k]?'On':'Off';}
function pvMenuRender(){const m=pq('pvMenu');if(!m)return;if(!PV.menu){m.hidden=true;m.innerHTML='';PV.dirty=true;return;}m.hidden=false;
 if(PV.menu==='setup'){m.className='pvmenu';m.innerHTML=`<div class="pvmt"><span>Setup BIS</span><button type="button" data-a="close" aria-label="Close">✕</button></div><div class="pvml">${PV_ITEMS.map(([k,l])=>`<button type="button" data-a="item" data-v="${k}"><span>${l}</span><b>${pvVal(k)}</b></button>`).join('')}</div>`;}
 else if(PV.menu==='sensor'){const chk=Date.now()<PV.checkUntil,t=PV.lastCheck==null?'--':pvClock(PV.lastCheck,true);
  const el=[1,2,3,4].map((n,i)=>{const x=[120,215,310,405][i];return `<g><circle cx="${x}" cy="96" r="20" fill="${chk?'#8c8c8c':'#2fb34a'}"/>${chk?'':`<path d="M${x-9} 96l6 7l12-14" stroke="#000" stroke-width="3.4" fill="none"/>`}<text x="${x}" y="140" fill="#ddd" font-size="15" text-anchor="middle">${n}</text></g>`;}).join('');
  m.className='pvmenu pvsensor';m.innerHTML=`<div class="pvmt"><span>BIS 4 Electrode Sensor</span><button type="button" data-a="close" aria-label="Close">✕</button></div>
  <svg viewBox="0 0 520 170" role="img" aria-label="${chk?'Sensor check running':'All four electrodes pass'}"><rect width="520" height="170" fill="#000"/><path d="M60 70h400a26 26 0 0 1 0 52H60z" fill="#5f6266"/><rect x="18" y="80" width="46" height="32" rx="4" fill="#2f6fd0"/>${el}</svg>
  <div class="pvmb"><span>Last Check: ${t}</span><button type="button" data-a="chk">${chk?'Stop Sensor Chk':'Start Sensor Chk'}</button></div>`;}
 else if(PV.menu==='main'){m.className='pvmenu';m.innerHTML=`<div class="pvmt"><span>Main Setup</span><button type="button" data-a="close" aria-label="Close">✕</button></div><div class="pvml">${['Measurements','Alarms','Profiles','Screens','Patient Demogr.','User Interface'].map(l=>`<button type="button" data-a="none"><span>${l}</span><b></b></button>`).join('')}<button type="button" data-a="item" data-v="colour"><span>BIS colour</span><b>${PV.set.colour==='yellow'?'Yellow':'White'}</b></button></div>`;}
 PV.dirty=true;}
function pvMenuClick(a,v){const s=PV.set;
 if(a==='close'){PV.menu=null;pvMenuRender();return;}
 if(a==='chk'){if(Date.now()<PV.checkUntil)PV.checkUntil=0;else{PV.checkUntil=Date.now()+6000;setTimeout(()=>{PV.lastCheck=simT;if(PV.menu==='sensor')pvMenuRender();PV.dirty=true;},6100);}pvMenuRender();return;}
 if(a!=='item')return;
 const cyc=(arr,cur)=>arr[(arr.indexOf(cur)+1)%arr.length];
 if(v==='sensor'){PV.menu='sensor';pvMenuRender();return;}
 if(v==='chk'){PV.menu='sensor';pvMenuClick('chk');return;}
 if(v==='smooth'){mon.smooth=cyc([10,15,30],mon.smooth);try{$('kSmooth').textContent=`Smoothing ${mon.smooth} s`;}catch(e){}}
 else if(v==='scale')s.scale=cyc([50,100,200,500],s.scale);
 else if(v==='hi')s.hi=cyc([50,60,70,80,90,100],s.hi);
 else if(v==='lo')s.lo=cyc([0,10,20,30,40],s.lo);
 else if(v==='colour')s.colour=s.colour==='yellow'?'white':'yellow';
 else s[v]=!s[v];
 pvMenuRender();}
// ----- time and the stand-in vital signs -----
function pvClock(t,date){const d=new Date(T0+t*1000),p=n=>String(n).padStart(2,'0');return (date?d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear()+' ':'')+p(d.getHours())+':'+p(d.getMinutes());}
function pvLast(){return HIST.length?HIST[HIST.length-1]:null;}
// heart rate drifts gently and follows depth a little (lighter: faster); the pulse rate is the oximeter's count of the same beats
function pvHr(t){const c=pvLast(),b=c&&c.bis!=null?c.bis:60;return Math.max(52,Math.min(108,64+.22*(b-45)+3*Math.sin(t/97)+1.5*Math.sin(t/23)));}
function pvNbpAt(t){const c=pvLast(),b=c&&c.bis!=null?c.bis:60,r=Math.sin(t*12.9898)*43758.5453,n=(r-Math.floor(r)-.5)*8;
 const s=Math.round(Math.max(78,Math.min(150,96+.55*(b-45)+n))),d=Math.round(s*.6+2+n*.3),m=Math.round((s+2*d)/3);return {t,s,d,m};}
// NBP every 5 minutes on the clock; the list shows the last seven
function pvNbp(){const st=300,now=simT,last=Math.floor((T0/1000+now)/st)*st-T0/1000;if(!PV.nbp||PV.nbp.last!==last){const rows=[];for(let i=6;i>=0;i--)rows.push(pvNbpAt(last-i*st));PV.nbp={last,rows};}return PV.nbp;}
// ----- waves: one value pair (min, max) per screen column, written by a sweep -----
// the engine's EEG is scaled as on the SedLine screen (sed-draw.js, SED_EEG_GAIN), to the size the real screens show
const PV_EEG_GAIN=.45;
const PV_X0=14,PV_X1=846,PV_PXS=88; // 25 mm/s on a 19-inch, 1440-pixel-wide panel is about 88 px a second
function pvEcgAt(t,beat){const u=t-beat;let v=0;const g=(c,w,a)=>a*Math.exp(-((u-c)*(u-c))/(2*w*w));
 v+=g(-.16,.022,.12)+g(-.03,.008,-.12)+g(0,.01,1)+g(.025,.009,-.28)+g(.24,.045,.28);return v;}
function pvPlethAt(t,beat){const u=t-beat-.22;if(u<0)return 0;const rise=Math.min(1,u/.12),up=Math.sin(rise*Math.PI/2),dec=Math.exp(-Math.max(0,u-.12)/.32);
 return up*(.7*dec+.3*Math.exp(-Math.max(0,u-.12)/.9))+.12*Math.exp(-((u-.42)*(u-.42))/(2*.04*.04));}
function pvWaves(){const n=PV_X1-PV_X0,tNow=produced/FS;let W=PV.wv;
 if(!W||tNow<W.t-1||tNow-W.t>30){W=PV.wv={t:tNow-n/PV_PXS,x:0,ecg:new Float32Array(n*2),pl:new Float32Array(n*2),eeg:new Float32Array(n*2),beats:[],next:tNow-n/PV_PXS};}
 const col=Math.floor((tNow-W.t)*PV_PXS);
 for(let k=0;k<col;k++){const t0=W.t+k/PV_PXS,t1=t0+1/PV_PXS,x=(W.x+k)%n;
  while(W.next<=t1+.6){W.beats.push(W.next);if(W.beats.length>8)W.beats.shift();W.next+=60/pvHr(W.next);}
  let emn=1e9,emx=-1e9,pmn=1e9,pmx=-1e9;for(let j=0;j<3;j++){const t=t0+j/(3*PV_PXS);let e=0,p=0;for(const b of W.beats){if(t-b>-.4&&t-b<.7)e+=pvEcgAt(t,b);if(t-b>0&&t-b<1.8)p=Math.max(p,pvPlethAt(t,b));}
   if(e<emn)emn=e;if(e>emx)emx=e;if(p<pmn)pmn=p;if(p>pmx)pmx=p;}
  W.ecg[2*x]=emn;W.ecg[2*x+1]=emx;W.pl[2*x]=pmn;W.pl[2*x+1]=pmx;
  // EEG: every engine sample inside this column
  let gmn=1e9,gmx=-1e9;const a=Math.floor(t0*FS),b=Math.max(a+1,Math.floor(t1*FS)),base=produced-SIG.length;
  for(let i=a;i<b;i++){const j=i-base;const v=j>=0&&j<SIG.length?SIG[j]:0;if(v<gmn)gmn=v;if(v>gmx)gmx=v;}
  W.eeg[2*x]=gmn;W.eeg[2*x+1]=gmx;}
 if(col>0){W.t+=col/PV_PXS;W.x=(W.x+col)%n;}
 return W;}
function pvDrawWave(c,arr,W,y0,h,f,col,lw){const n=PV_X1-PV_X0,gap=14;c.save();c.beginPath();c.rect(PV_X0,y0-20,n,h+40);c.clip();c.strokeStyle=col;c.lineWidth=lw||2;c.lineJoin='round';
 const seg=(from,to)=>{if(to<=from)return;c.beginPath();for(let x=from;x<to;x++){const a=f(arr[2*x]),b=f(arr[2*x+1]);if(x===from)c.moveTo(PV_X0+x+.5,a);else c.lineTo(PV_X0+x+.5,a);if(b!==a)c.lineTo(PV_X0+x+.5,b);}c.stroke();};
 seg(0,W.x);seg(Math.min(n,W.x+gap),n);c.restore();}
// ----- alarms and INOPs (one field at the top left; the newest of several takes turns every 2 s) -----
function pvAlarms(){const c=pvLast(),s=PV.set,out=[];if(!c||!s.bisOn)return out;
 if(c.sqi<15)out.push({text:'BIS SQI < 15%',lv:'inop'});
 else{if(typeof isoN==='number'&&isoN>=60)out.push({text:'BIS IsoelectricEEG',lv:'inop'});
  if(s.alarms&&c.bis!=null){if(c.bis>s.hi&&s.hi<100)out.push({text:'** BIS High',lv:'yel'});else if(c.bis<s.lo&&s.lo>0)out.push({text:'** BIS Low',lv:'yel'});}}
 return out;}
// ----- the static layer (redrawn once a second or when something changes) -----
function pvT(c,s,x,y,size,col,al,wt,sx){c.font=`${wt||400} ${size}px ${PV_FONT}`;c.fillStyle=col;c.textAlign=al||'left';c.textBaseline='alphabetic';
 if(sx&&sx!==1){c.save();c.translate(x,y);c.scale(sx,1);c.fillText(s,0,0);c.restore();}else c.fillText(s,x,y);}
// a big numeric: Philips' tall, narrow digits (Selawik Semibold squeezed to 80 %)
const pvBig=(c,s,x,y,size,col,al)=>pvT(c,s,x,y,size,col,al||'left',600,.8);
function pvStatic(){const c=PV.st.getContext('2d'),s=PV.set,last=pvLast(),bc=pvCol();c.setTransform(1,0,0,1,0,0);c.fillStyle=PC.bg;c.fillRect(0,0,PV_W,PV_H);
 // monitor info line
 c.fillStyle='#0b0d10';c.fillRect(0,0,PV_W,32);
 pvT(c,'OR 12',96,23,17,PC.lbl);pvT(c,'Practice',560,23,17,PC.lbl);c.fillStyle=PC.lbl;c.beginPath();c.arc(544,12,4,0,7);c.fill();c.fillRect(540,17,8,9);
 pvT(c,pvClock(simT,true),840,23,17,PC.lbl,'center');pvT(c,'Profiles',1085,23,17,PC.lbl);c.strokeStyle=PC.lbl;c.lineWidth=1.4;c.strokeRect(1066,13,13,9);
 pvT(c,'4 Waves',1290,23,17,PC.lbl);c.strokeRect(1271,13,13,9);c.beginPath();c.moveTo(1400,24);c.lineTo(1428,8);c.lineTo(1428,24);c.closePath();c.stroke();
 // alarm / INOP field
 const A=pvAlarms(),cur=A.length?A[Math.floor(Date.now()/2000)%A.length]:null;
 if(cur){const ack=PV.ack[cur.text],w=Math.max(220,c.measureText?0:0);c.font=`400 19px ${PV_FONT}`;const tw=c.measureText((ack?'✓ ':'')+cur.text).width+26;
  c.fillStyle=cur.lv==='inop'?PC.inop:PC.yel;c.beginPath();c.roundRect?c.roundRect(14,38,tw,28,4):c.rect(14,38,tw,28);c.fill();pvT(c,(ack?'✓ ':'')+cur.text,27,59,19,'#08131c');}
 // wave labels, scales
 pvT(c,'II',PV_X0+4,96,17,PC.ecg);pvT(c,'(0.3)',PV_X0+4,116,13,'#4a8a64');
 c.fillStyle=PC.ecg;c.fillRect(PV_X0+40,210,2,60);pvT(c,'1mV',PV_X0+46,268,12,PC.ecg);
 pvT(c,'Pleth',PV_X0+4,402,15,PC.spo2);c.save();c.setLineDash([2,4]);c.strokeStyle='#4d6f86';c.lineWidth=1;for(const y of [412,494]){c.beginPath();c.moveTo(PV_X0+40,y+.5);c.lineTo(PV_X1,y+.5);c.stroke();}c.restore();
 pvT(c,'EEG',PV_X0+4,548,15,bc);c.fillStyle='#8a8a8a';c.fillRect(PV_X0+60,556,2,100);pvT(c,s.scale+'µV',PV_X0+66,658,12,'#b0b0b0');
 // HR, Pulse, ST
 const hr=Math.round(pvHr(simT));pvT(c,'HR',868,98,18,PC.ecg);pvBig(c,String(hr),905,204,168,PC.ecg);
 pvT(c,'Pulse',1190,72,17,PC.spo2);pvBig(c,String(Math.max(40,hr-1)),1238,166,86,PC.spo2);
 pvT(c,'ST-II',1192,318,17,PC.ecg);pvBig(c,'0.3',1262,406,64,PC.ecg);
 // SpO2 with its perfusion wedge
 pvT(c,'SpO',866,388,17,PC.spo2);pvT(c,'2',897,392,12,PC.spo2);c.strokeStyle=PC.spo2;c.lineWidth=1.6;c.beginPath();c.moveTo(868,398);c.lineTo(898,398);c.lineTo(888,454);c.closePath();c.stroke();
 c.fillStyle=PC.spo2;for(let i=0;i<7;i++){const y=402+i*7,w=27-i*3.3;c.fillRect(870,y,w,3);}
 pvBig(c,'100',905,504,176,PC.spo2);
 // BIS and its secondary numerics: yellow, Philips' factory colour and the owner's monitor (white is a choice in Main Setup)
 const bl=!last||last.sqi<15||last.bis==null||!s.bisOn,bv=bl?'-?-':String(Math.round(last.bis));
 const al=A.find(m=>m.lv==='yel'&&!PV.ack[m.text]),flash=al&&Math.floor(Date.now()/500)%2===0;
 if(flash){c.fillStyle=PC.yel;c.fillRect(860,516,320,148);}
 pvT(c,'BIS',866,540,18,flash?'#000':bc);pvBig(c,s.bisOn?bv:'',912,654,168,flash?'#000':bc);
 const sec=[];if(s.sqi)sec.push(['SQI',last?String(last.sqi):'-?-']);if(s.emg)sec.push(['EMG',last&&!bl?String(Math.round(last.emg)):'-?-']);if(s.sr)sec.push(['SR',last&&!bl?String(Math.round(last.bsr)):'-?-']);
 if(s.sef)sec.push(['SEF',last&&!bl&&last.sef!=null?last.sef.toFixed(1):'-?-']);if(s.tp)sec.push(['TP',last&&!bl?String(Math.round(last.tp)):'-?-']);
 const rows=sec.slice(0,4),rh=rows.length>3?62:88;rows.forEach(([l,v],i)=>{const y=432+i*rh;pvT(c,l,1196,y+12,16,bc);pvBig(c,s.bisOn?v:'',1250,y+(rh>70?72:52),rh>70?100:72,bc);});
 // NBP with the list of the last readings
 const N=pvNbp(),nl=N.rows[N.rows.length-1];
 pvT(c,'NBP',PV_X0+4,706,15,PC.nbp);pvT(c,'Pulse '+hr,PV_X0+46,706,11,PC.nbp);pvT(c,'Auto  5 min',300,712,12,PC.nbp);pvT(c,pvClock(nl.t),545,702,13,PC.lbl);
 pvBig(c,`${nl.s}/${nl.d}  (${nl.m})`,92,790,96,PC.nbp);
 pvT(c,'NBP',600,704,15,PC.nbp);pvT(c,'mmHg',600,722,11,PC.nbp);
 N.rows.forEach((r,i)=>{const y=706+i*16.5;pvT(c,pvClock(r.t),760,y,13,PC.lbl,'right');pvT(c,`${r.s}/${r.d}(${r.m})`,950,y,13,PC.nbp,'right');});
 // SmartKeys
 c.fillStyle='#0a0c10';c.fillRect(0,808,PV_W,92);
 const key=(x,w,lbl,fill,txt,hi)=>{c.fillStyle=fill;c.beginPath();c.roundRect?c.roundRect(x,814,w,78,4):c.rect(x,814,w,78);c.fill();if(hi){c.strokeStyle='#8ab4ff';c.lineWidth=2;c.stroke();}
  const ls=lbl.split('|');ls.forEach((l,i)=>pvT(c,l,x+w/2,858+i*17-(ls.length-1)*6,14,txt,'center'));};
 const paused=PV.pauseUntil&&Date.now()<PV.pauseUntil;
 key(8,92,'Silence',A.some(m=>!PV.ack[m.text])?'#d8c27a':'#b8a76e','#1b1b1b');key(104,92,paused?'Pause|Alarms ✓':'Pause|Alarms','#3a4252','#e6e6e6');
 pvT(c,'«',214,862,24,'#cfd6e0','center');
 const sk=['Start/|Stop','Stop All','Zero','Quick|Admit','Vitals|Trend','Monitor|Standby','End|Case','Calcs'];sk.forEach((l,i)=>key(232+i*96,92,l,PC.key,'#e6e6e6'));
 pvT(c,'»',1000,862,24,'#cfd6e0','center');
 key(1012,96,'Main|Setup',PC.keyHi,'#fff',PV.menu==='main');key(1112,96,'Main|Screen',PC.keyHi,'#fff');
 c.strokeStyle='#e6e6e6';c.lineWidth=2;c.beginPath();c.moveTo(1252,880);c.lineTo(1252,846);c.lineTo(1272,852);c.lineTo(1252,858);c.stroke();
 c.strokeRect(1330,848,44,14);pvT(c,'XXX',1352,884,12,'#e6e6e6','center');
 // the readout for screen readers and the page's summary line
 const sum=bl?'BIS -?-':`BIS ${bv}, SQI ${last.sqi}, EMG ${Math.round(last.emg)} dB, SR ${Math.round(last.bsr)}%`;const e=document.getElementById('bilSum');const t2=sum+(cur?', '+cur.text:'');if(e&&e._t!==t2){e._t=t2;e.textContent=t2;}
 pq('pvS').setAttribute('aria-label','Philips IntelliVue monitor screen: '+t2);}
// ----- the frame hook (called from app.js's loop) -----
function pvTick(dirty){if(!PV.built)pvBuild();const cv=PV.cv,dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||400,k=w*dpr/PV_W;
 if(cv._w!==Math.round(PV_W*k)){cv.width=Math.round(PV_W*k);cv.height=Math.round(PV_H*k);cv._w=cv.width;PV.dirty=true;}
 const sec=Math.floor(Date.now()/500);if(dirty||PV.dirty||PV._sec!==sec){PV._sec=sec;PV.dirty=false;pvStatic();}
 const c=cv.getContext('2d');c.setTransform(k,0,0,k,0,0);c.drawImage(PV.st,0,0);
 const W=pvWaves(),s=PV.set;
 pvDrawWave(c,W.ecg,W,110,170,v=>222-v*92,PC.ecg,1.8);
 pvDrawWave(c,W.pl,W,412,82,v=>492-v*76,PC.spo2,2);
 if(s.bisOn){const pp=PV_EEG_GAIN*100/s.scale;pvDrawWave(c,W.eeg,W,556,100,v=>606-Math.max(-62,Math.min(62,v*pp)),pvCol(),1.5);}}
function pvApply(){pvBuild();PV.dirty=true;pvMenuRender();}
