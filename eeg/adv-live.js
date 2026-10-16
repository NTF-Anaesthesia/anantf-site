// BIS Advance screen, part 3: live values, alarms, messages, audio, click routing and the per-frame tick. Loaded after adv-draw.js.
const advNow=()=>ADV.review?ADV.review.now:simT;
// values of one side: the newest second live, or the second under the cursor in case review
function advSideVals(s){const R_=ADV.review,h=advHist(s);
 if(R_&&R_.t!=null){const e=h[Math.min(h.length-1,advLb(h,R_.t))];return e?{c:e,sef:e.sef,mf:e.mf,st:e.st,bc:e.bc}:null;}
 const cs=s==='R'?R.COLS:COLS,c=cs[cs.length-1];if(!c)return null;
 return {c,sef:s==='R'?R.lastSef:lastSef,mf:s==='R'?R.lastMf:lastMf,st:s==='R'?R.tim.sup:tim.sup,bc:c.bc};}
const advSet=(id,html)=>{const e=aq(id);if(e&&e._h!==html){e._h=html;e.innerHTML=html;}};
const advU=(v,u)=>v===''?'':`${v}<span class="u">${u}</span>`;
function advSqiN(q){return q>=80?5:q>=60?4:q>=40?3:q>=20?2:1;}
function advFmtST(sec){sec=Math.max(0,Math.round(sec));if(sec<3600)return [apad(Math.floor(sec/60))+':'+apad(sec%60),'min','sec'];return [Math.floor(sec/3600)+':'+apad(Math.floor(sec/60)%60)+':'+apad(sec%60),'hr min','sec'];}
function advNumLabels(){const A=ADV.alarm,k=JSON.stringify(A)+ADV.ch+ADV.hemi;if(ADV.numKey===k)return;ADV.numKey=k;
 const ic=`<span class="ic" style="display:inline-flex;width:calc(22*var(--u));height:calc(22*var(--u))">${IC.off}</span>`;
 for(const s of (ADV.ch===2?['']:['L','R'])){advSet('aBisLbl'+s,`<span>BIS</span>${A.bis.on?`<span>${A.bis.lo}-${A.bis.hi}</span>`:ic}`);advSet('aSrLbl'+s,`<span>SR</span>${A.sr.on?`<span>${A.sr.hi}</span>`:ic}`);}
 if(ADV.ch===2){advSet('aBisLbl',`<span>BIS</span>${A.bis.on?`<span>${A.bis.lo}-${A.bis.hi}</span>`:ic}`);advSet('aSrLbl',`<span>SR</span>${A.sr.on?`<span>${A.sr.hi}</span>`:ic}`);}
 advSet('aSefLbl',`<span>SEF</span>${A.sef.on?`<span>${A.sef.lo}-${A.sef.hi}</span>`:ic}`);
 const lo=aq('aBadgeLow');if(lo){lo.textContent=ADV.hemi;lo.style.setProperty('--c',ADV.hemi==='R'?AC.bisR:AC.bisL);}}
function advNumerics(){if(!ADV.built)return;advNumLabels();const two=ADV.ch===2,sides=two?['L']:['L','R'],al=ADV.alarmBox||{};
 for(const s of sides){const v=advSideVals(s);if(!v)continue;const c=v.c,dc=!!ADV.disc&&!ADV.review,blank=dc||c.sqi<15||c.bis==null,id=two?'L':s,nm=two?'':s;
  const b=aq('aBis'+id);if(b){const t=blank?'':String(Math.round(c.bis));if(b._h!==t){b._h=t;b.textContent=t;}b.classList.toggle('box',!!al['bis'+s]&&!blank);}
  const n=dc?0:advSqiN(c.sqi),sc=aq('aSqi'+id);if(sc){const col=n>=3?AC.sqi:n===2?AC.emg:'#e4262c';sc.style.setProperty('--sc',col);[...sc.children].forEach((e,i)=>e.classList.toggle('on',i<n));}
  advSet('aEmg'+id,dc?'':advU(String(Math.round(c.emg)),'dB'));
  const eb=aq('aEmgBar'+id);if(eb){const f=dc?0:Math.max(0,Math.min(1,(c.emg-30)/25)),px=(two?83:100);eb.firstChild.style.height=Math.max(f>0?1.5:1.5,f*px)/px*100+'%';}
  const sr=blank?'':String(Math.round(c.bsr)),sre=aq('aSr'+id);if(sre){advSet('aSr'+id,advU(sr,'%'));sre.classList.toggle('ybox',!!al['sr'+s]);}
  const st=advFmtST(v.st);advSet('aSt'+id,st[0]);advSet('aStU1'+(two?'':nm),st[1]);advSet('aStU2'+(two?'':nm),st[2]);
  if(!two)advSet('aBc'+s,blank?'':String(v.bc));}
 // SEF and MF of the selected side
 const v=advSideVals(ADV.hemi==='R'&&!two?'R':'L');if(v){const blank=(!!ADV.disc&&!ADV.review)||v.c.sqi<15,sf=blank||v.sef==null?'':String(Math.round(v.sef)),mf=blank||v.mf==null?'':String(Math.round(v.mf));
  advSet('aSefL',advU(sf,'Hz'));advSet('aMfL',advU(mf,'Hz'));aq('aSefL').classList.toggle('ybox',!!al.sef);}
 // accessible summary of both sides
 }
// ----- alarms -----
function advAlarmEval(){if(!ADV.built)return;const A=ADV.alarm,list=[],act=ADV.act||(ADV.act={}),sides=ADV.ch===4?['L','R']:['L'],box={};ADV.alarmBox=box;
 let bisDir=0;
 // technical alarms the simulator can raise (the Simulate row under the screen): sensor disconnected, sensor expired, battery low
 if(ADV.disc)list.push({key:'disc',pri:'lo',l1:'SENSOR DISCONNECTED',l2:'Connect sensor or cable'});
 if(ADV.expired)list.push({key:'exp',pri:'lo',l1:'SENSOR EXPIRED',l2:'Replace the sensor'});
 if(ADV.batt)list.push({key:'batt',pri:'lo',l1:'BATTERY LOW',l2:'Connect to power supply'});
 const Sx=ADV.sensor;if(Sx&&Sx.done&&Sx.fail){const bad=Sx.el.filter(e=>e.st!=='pass').map(e=>e.n).join(', ');list.push(ADV.disc?{key:'tum',pri:'lo',l1:'TEMPORARILY UNABLE TO MEASURE ELECTRODES',l2:bad}:{key:'press',pri:'lo',l1:'PRESS CENTER OF ELECTRODES '+bad,l2:'TO ENABLE MONITORING'});}
 for(const s of (ADV.review?[]:sides)){const h=s==='R'?R.HIST:HIST,tail=h.slice(-10),last=h[h.length-1];if(!last)continue;
  if(ADV.disc){act['bis'+s]=false;continue;}
  if(A.bis.on){const out=c=>c.bis!=null&&c.sqi>=15&&(c.bis<A.bis.lo||c.bis>A.bis.hi);const key='bis'+s;
   if(act[key]?out(last):tail.length>=10&&tail.every(out))act[key]=true;else act[key]=false;
   if(act[key]){box['bis'+s]=true;if(!bisDir)bisDir=last.bis<A.bis.lo?-1:1;}}else act['bis'+s]=false;
  const iso=(s==='R'?R.isoN:isoN)>=60;
  if(iso)list.push({key:'iso'+s,pri:'hi',l1:ADV.ch===2?'ISOELECTRIC EEG':s==='L'?'LEFT ISOELECTRIC EEG':'RIGHT ISOELECTRIC EEG',l2:'EEG isoelectric for 63 seconds'});
  const v=advSideVals(s);
  if(A.sr.on&&v&&v.c.bsr>A.sr.hi){box['sr'+s]=true;list.push({key:'sr'+s,pri:'lo',l1:'SR ALARM',l2:'SR above defined threshold'});}
  if(s==='L'||s===ADV.hemi){if(A.sef.on&&v&&v.sef!=null&&v.c.sqi>=15&&(v.sef<A.sef.lo||v.sef>A.sef.hi)){box.sef=true;list.push({key:'sef'+s,pri:'lo',l1:'SEF ALARM',l2:'SEF '+(v.sef<A.sef.lo?'below':'above')+' defined range'});}}
  if(last.sqi<20)list.push({key:'sqiL'+s,pri:'lo',l1:'SQI LOW',l2:'Due to poor signal quality some parameters are not available'});
  else if(last.sqi<60)list.push({key:'sqiM'+s,pri:'lo',l1:'SQI MEDIUM',l2:'Excessive artifacts in signal'});}
 if(bisDir)list.unshift({key:'bis',pri:'hi',l1:'BIS ALARM',l2:'BIS '+(bisDir<0?'below':'above')+' defined range'});
 // one bar entry per alarm name (both sides show one SQI or SEF line)
 const seen=new Set(),uniq=list.filter(a=>{const k=a.l1;if(seen.has(k))return false;seen.add(k);return true;});
 const old=Object.fromEntries((ADV.alarms||[]).map(a=>[a.l1,a.t]));uniq.forEach(a=>a.t=old[a.l1]!=null?old[a.l1]:advNow());
 uniq.sort((a,b)=>(a.pri===b.pri?0:a.pri==='hi'?-1:1)||b.t-a.t);
 for(const a of uniq)if(old[a.l1]==null)ADV.log.push({t:advNow(),text:a.l1});
 ADV.alarms=uniq;mon.alo=A.bis.lo;mon.ahi=A.bis.hi;}
// ----- messages (the bar at the bottom) -----
// A new message shows at once, for 5 s, and then the bar rotates through the rest (1/n); once-only messages expire, latching ones stay until the check mark.
function advMsg(text,o){o=o||{};const now=Date.now(),ex=ADV.msgs.find(m=>m.text===text),m=ex||{text};m.latch=!!o.latch;m.until=o.latch?0:now+(o.ms||5000);if(!ex)ADV.msgs.push(m);
 if(!o.bg){ADV.msgI=ADV.msgs.indexOf(m);ADV.msgT=now;}}
function advMsgDrop(re){ADV.msgs=ADV.msgs.filter(m=>!re.test(m.text));}
function advMsgUI(now){const cur=ADV.msgs[ADV.msgs.length?ADV.msgI%ADV.msgs.length:0];ADV.msgs=ADV.msgs.filter(m=>m.latch||m.until>now);const n=ADV.msgs.length;
 if(n){let i=ADV.msgs.indexOf(cur);if(i<0){i=ADV.msgI%n;ADV.msgT=now;}if(now-ADV.msgT>5000){ADV.msgT=now;if(n>1)i=(i+1)%n;}ADV.msgI=i;}else ADV.msgI=0;
 const hide=!!ADV.boot,m=hide?null:ADV.msgs[ADV.msgI];const t=m?m.text:'';const e=aq('aMsgT');if(e._h!==t){e._h=t;e.textContent=t;}
 const sh=!!m;aq('aMi').hidden=!sh;aq('aMbd').hidden=!sh;aq('aMn').hidden=!sh;aq('aCheck').hidden=!sh;
 if(sh){const b=aq('aMbd');if(b._h!==n){b._h=n;b.textContent=n;}const c=aq('aMc'),ct=`${Math.min(ADV.msgI+1,n)}/${n}`;if(c._h!==ct){c._h=ct;c.textContent=ct;}}}
// ----- audio -----
function advUnlock(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;ADV.ac=ADV.ac||new A();if(ADV.ac.state==='suspended')ADV.ac.resume();}catch(e){}}
function advBeep(n,f){n=n||1;f=f||880;ADV.beeps++;try{const ac=ADV.ac;if(!ac||ac.state!=='running')return;const g=ac.createGain();g.gain.value=0.012*ADV.vol*ADV.vol/2;g.connect(ac.destination);
 for(let i=0;i<n;i++){const o=ac.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);const t=ac.currentTime+i*0.2;o.start(t);o.stop(t+0.12);}}catch(e){}}
function advSound(now){if(ADV.audio===1&&now>ADV.audioEnd){ADV.audio=0;advMsgDrop(/^Alarm (Pause|Silent) Mode/);advMsg('Alarm Pause Mode Off');}
 const hi=ADV.alarms.some(a=>a.pri==='hi'),any=ADV.alarms.length>0;ADV.sounding=ADV.audio===0&&any;
 if(ADV.sounding&&now>=ADV.nextBeep){advBeep(hi?3:2,hi?988:740);ADV.nextBeep=now+(hi?4000:12000);}
 if(!ADV.sounding&&ADV.nextBeep&&!any)ADV.nextBeep=0;
 if(ADV.audio===2&&ADV.audioRem&&now>=ADV.nextRem){if(ADV.nextRem)advBeep(1,660);ADV.nextRem=now+180000;}}
// every change of the alarm audio replaces the earlier Pause or Silent message and shows its own at once (the manual's wording only)
function advSetAudio(a){const was=ADV.audio;if(a!==was){ADV.audio=a;ADV.nextBeep=0;ADV.nextRem=0;advMsgDrop(/^Alarm (Pause|Silent) Mode/);
 if(a===1){ADV.audioEnd=Date.now()+120000;advMsg('Alarm Pause Mode On');}else if(a===2)advMsg('Alarm Silent Mode On');else advMsg(was===2?'Alarm Silent Mode Off':'Alarm Pause Mode Off');}
 advUnlock();advSound(Date.now());advUI(Date.now());}
// ----- per-frame UI of the top bar -----
function advUI(now){
 const t=advNow(),dt=advDate(t),tm=advClockS(t),rv=!!ADV.review;advSet('aDate',dt);advSet('aTime',tm);
 // in case review the date, time and ID go, the serial link shows crossed out and the USB icon goes; the alarm bar and the pill stay as they are
 document.querySelectorAll('#advTop .dblk').forEach(e=>{if(e.hidden!==rv)e.hidden=rv;});
 aq('aSer').hidden=rv;aq('aNetx').hidden=!rv;aq('aUsb').hidden=rv;aq('aUsb').style.opacity=ADV.usb?1:.8;
 // battery: full and on mains, or low (about 10 percent, a red glyph, no bolt) when the Simulate row says so
 const lowB=!!ADV.batt;advSet('aBatT',lowB?'10%':'100%');aq('aBatT').setAttribute('aria-label','Battery '+(lowB?10:100)+' percent');
 const bf=aq('aBatFill');if(bf&&bf._l!==lowB){bf._l=lowB;bf.setAttribute('width',lowB?'1.9':'18.2');bf.setAttribute('fill',lowB?'#ec1c2c':'#dce4ec');}
 aq('aBolt').hidden=lowB;
 if(lowB&&!ADV.battMsg){ADV.battMsg=true;advMsg('AC power disconnected');}else if(!lowB&&ADV.battMsg){ADV.battMsg=false;advMsgDrop(/^AC power disconnected/);}
 // alarm bar
 const n=ADV.alarms.length,bar=aq('aAbar');bar.hidden=!n;aq('aPill').hidden=false;
 if(bar.className!=='abar'&&!n)bar.className='abar';
 if(n){const i=Math.floor(now/3000)%n,a=ADV.alarms[i];bar.className='abar '+a.pri+(a.pri==='hi'&&ADV.audio!==2?' flash':'');
  advSet('aAico',a.pri==='hi'?IC.tri3:IC.tri);advSet('aAl1',advEsc(a.l1));advSet('aAl2',advEsc(a.l2));advSet('aAn',`${i+1}/${n}`);
  const c=aq('aAcnt');c.style.visibility='visible';}
 if(!n&&ADV.list)ADV.list=false;
 aq('aAlist').hidden=!(ADV.list&&n);if(ADV.list&&n){const rows=ADV.alarms.map(a=>`<div class="r"><b>${advClockS(a.t)}</b><span>${advEsc(a.l1)}</span></div>`).join('');advSet('aAlist',`<div class="r h"><b>START</b><span>ALARM</span></div>${rows}`);}
 aq('aAcnt').setAttribute('aria-expanded',!!ADV.list);
 // pill
 const pt=aq('aPillT'),st=ADV.audio;let txt='',ic=IC.bellW;
 if(st===1){const left=Math.max(0,Math.ceil((ADV.audioEnd-now)/1000));txt=Math.floor(left/60)+':'+apad(left%60);ic=IC.bellW.replace('fill="#fff"','fill="none" stroke="#fff" stroke-width="1.5" stroke-dasharray="1.6 1.8"');}
 else if(st===2){txt='SILENT';ic=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4a1.9 1.9 0 0 0-1.9 1.9v.5C7.5 5.5 6 7.8 6 10.7v3.7L4.1 17v1h15.8v-1L18 14.4v-3.7c0-2.9-1.5-5.2-4.1-5.9v-.5A1.9 1.9 0 0 0 12 2.4zM9.9 19.4a2.1 2.1 0 0 0 4.2 0z" fill="#e8ecf2"/><path d="M3 3l18 18M21 3L3 21" stroke="#e2392b" stroke-width="2.2" stroke-linecap="round"/></svg>`;}
 advSet('aPillT',txt);advSet('aBell',ic);
 const s=aq('aSilent');const lab=st===0?'Alarm audio on. Press to pause for 2 minutes':st===1?'Alarm audio paused. Press to turn alarm audio off':'Alarm audio off. Press to turn it back on';if(s._l!==lab){s._l=lab;s.setAttribute('aria-label',lab);}
 aq('aCtl').hidden=!ADV.ctl;aq('aVol').hidden=!(ADV.ctl&&ADV.vol_);aq('aDrop').setAttribute('aria-expanded',!!ADV.ctl);
 if(ADV.ctl){[0,1,2].forEach(i=>aq('aCt'+i).classList.toggle('on',st===i));aq('aCt3').classList.toggle('on',false);[...aq('aVol').children].forEach((b,i)=>b.classList.toggle('on',i<ADV.vol));}
 advMsgUI(now);}
// ----- click routing -----
function advCloseTransient(keep){if(keep!=='ctl'&&(ADV.ctl||ADV.vol_)){ADV.ctl=false;ADV.vol_=false;}if(keep!=='alist'&&ADV.list)ADV.list=false;if(keep!=='pop'&&ADV.pop){ADV.pop=null;aq('advPop').innerHTML='';}}
function advClick(e){const el=e.target.closest('[data-a]'),a=el&&el.dataset.a,v=el&&el.dataset.v;
 if(!el){advCloseTransient();return;}
 advUnlock();
 const tr={ctl:'ctl',vol:'ctl',aud:'ctl',setvol:'ctl',alist:'alist',pick:'pop'}[a];advCloseTransient(tr);
 switch(a){
  case 'silent':advSetAudio((ADV.audio+1)%3);return;
  case 'ctl':ADV.ctl=!ADV.ctl;ADV.vol_=false;return;
  case 'aud':advSetAudio(+v);return;
  case 'vol':ADV.vol_=!ADV.vol_;return;
  case 'setvol':ADV.vol=+v;advMsg('Testing alarm volume');advBeep(1,880);return;
  case 'alist':ADV.list=!ADV.list;return;
  case 'lr':ADV.hemi=ADV.hemi==='L'?'R':'L';advChrome();advHeaders();advInval();advNumerics();return;
  case 'gt':ADV.view=ADV.view==='graphs'?'chart':'graphs';advView();return;
  case 'next':ADV.msgI++;ADV.msgT=Date.now();return;
  case 'check':{const n=ADV.msgs.length;if(n){const m=ADV.msgs[ADV.msgI%n];ADV.msgs=ADV.msgs.filter(x=>x!==m);ADV.msgT=Date.now();}return;}
  case 'secpop':advPopup(el,[['emg','EMG'],['sr','SR'],['sqi','SQI'],['none','NONE']].concat(ADV.ch===4?[['burst','BURST'],['bisO','BIS '+(ADV.hemi==='L'?'R':'L')]]:[]),ADV.sec,k=>{ADV.sec=k;advHeaders();advInval();});return;
  case 'winpop':advPopup(el,[[5,'5 min'],[15,'15 min'],[60,'1 h'],[360,'6 h'],[720,'12 h'],[1440,'24 h']],ADV.win,k=>{ADV.win=k;advHeaders();advInval();});return;
  case 'uvpop':advPopup(el,[[2,'2 µV/mm'],[5,'5 µV/mm'],[10,'10 µV/mm']],ADV.uvmm[ADV.ch],k=>{ADV.uvmm[ADV.ch]=k;advHeaders();advEegChannels();advInval();});return;
  case 'swpop':advPopup(el,[[6.25,'6.25 mm/sec'],[12.5,'12.5 mm/sec'],[25,'25 mm/sec'],[50,'50 mm/sec']],ADV.sweep,k=>{ADV.sweep=k;advHeaders();advInval();});return;
  case 'pick':{const p=ADV.pop;if(p){const it=p.items[+v];advCloseTransient();p.fn(it[0]);}return;}}
 if(typeof advMenuAct==='function')advMenuAct(a,v,el,e);}
// 2 uV/mm shows one EEG channel, 5 and 10 show two (the manual's table); the Settings menu can still set it directly
function advEegChannels(){const n=ADV.ch===2?(ADV.uvmm[2]===2?1:2):ADV.nch[4]===1?1:ADV.nch[4];if(ADV.ch===2)ADV.nch[2]=n;}
function advPopup(anchor,items,cur,fn){const S=aq('advS').getBoundingClientRect(),r=anchor.getBoundingClientRect(),k=1246/S.width;
 let x=(r.left-S.left)*k,y=(r.bottom-S.top)*k+3;const w=130;x=Math.max(120,Math.min(1246-w-10,x));ADV.pop={items,fn};
 aq('advPop').innerHTML=`<div class="xpop" role="listbox" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u))">${items.map((it,i)=>`<button type="button" role="option" aria-selected="${it[0]===cur}" class="${it[0]===cur?'on':''}" data-a="pick" data-v="${i}">${advEsc(it[1])}</button>`).join('')}</div>`;
 const f=aq('advPop').querySelector('button.on')||aq('advPop').querySelector('button');if(f)f.focus();}
function advView(){const ch=ADV.view==='chart';aq('advChart').hidden=!ch;aq('advHdr').hidden=ch;ADV.chartKey=null;if(ch)advChart(true);advChrome();ADV.full=true;}
function advCvClick(e){const R_=ADV.review;if(!R_)return;const c=aq('advCv'),r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*1246,D=ADV.d;if(!D)return;
 R_.t=Math.max(ADV.t0,Math.min(R_.now,D.tL+(x-ADV_X)/ADV_PX*D.win));ADV.full=true;advNumerics();advReviewTip();}
// the three hard keys on the case: function (the main menu, like the hamburger), home (closes every window and menu), power (inert)
function advHardKey(e){const b=e.target.closest('[data-hk]');if(!b)return;const k=b.dataset.hk;if(ADV.boot)return;
 if(k==='fn'){advCloseTransient();if(ADV.dlg&&ADV.dlg.name!=='sensor'){advCloseDlg();}ADV.menu?advCloseMenu():advOpenMenu();}
 else if(k==='home'){advCloseTransient();if(ADV.dlg&&ADV.dlg.name!=='sensor')advCloseDlg();if(ADV.menu)advCloseMenu();}}
function advKey(e){if(!ADV.built||mon.skin!=='advance')return;
 if(e.key==='Escape'){if(ADV.pop){advCloseTransient();return;}if(ADV.ctl||ADV.list){advCloseTransient();return;}if(ADV.dlg&&ADV.dlg.name!=='sensor'){advCloseDlg();e.preventDefault();return;}if(ADV.menu){advCloseMenu();e.preventDefault();return;}}
 if(ADV.review&&(e.key==='ArrowLeft'||e.key==='ArrowRight')&&!ADV.dlg&&!ADV.menu){const R_=ADV.review,D=ADV.d,st=D.win/ADV_PX*6;R_.t=Math.max(ADV.t0,Math.min(R_.now,(R_.t==null?R_.now:R_.t)+(e.key==='ArrowLeft'?-st:st)));ADV.full=true;advNumerics();advReviewTip();e.preventDefault();}}
function advReviewTip(){const R_=ADV.review,w=aq('advWm');if(!R_||R_.t==null||ADV.view!=='graphs'){w.innerHTML='';return;}const D=ADV.d;if(!D)return;const x=Math.max(350,Math.min(680,advXt(D,R_.t)));
 w.innerHTML=`<div class="tip" style="left:calc(${x}*var(--u));top:calc(64*var(--u))" aria-live="polite">${advClockS(R_.t,true)}</div>`
  +[[1090,180],[1090,350],[1090,540],[1090,660]].map(([px,py])=>`<span class="wm" style="left:calc(${px}*var(--u));top:calc(${py}*var(--u));transform:rotate(-30deg)">CASE REVIEW MODE</span>`).join('');}
// ----- chart view (the table) -----
// Rows newest first from the live second back to the case start, every chart interval; the table keeps its scroll position when it refreshes.
function advChart(force){const el=aq('advChart');if(ADV.view!=='chart')return;const now=simT,I=ADV.chartInt*60,key=Math.floor((now-ADV.t0)/I)+'|'+ADV.ch+ADV.chartInt+ADV.hemi+Math.floor(now/10)+ADV.dateFmt+ADV.hr24;if(!force&&ADV.chartKey===key)return;ADV.chartKey=key;
 const two=ADV.ch===2,cols=two?[['BIS','BIS',AC.bisL],['EMG','EMG <small>dB</small>',AC.emg],['SR','SR <small>%</small>',AC.sr],['SQI','SQI <small>%</small>',AC.sqi]]:[['BIS L','BIS L',AC.bisL],['BIS R','BIS R',AC.bisR],['EMG L','EMG L <small>dB</small>',AC.emg],['EMG R','EMG R <small>dB</small>',AC.emg],['SR L','SR L <small>%</small>',AC.sr],['SR R','SR R <small>%</small>',AC.sr],['ASYM','ASYM <small>%</small>',AC.asym],['SQI L','SQI L <small>%</small>',AC.sqi],['SQI R','SQI R <small>%</small>',AC.sqi]];
 const hL=advHist('L'),hR=advHist('R'),at=(h,t)=>h[Math.min(h.length-1,advLb(h,t))],rows=[],n=Math.floor((now-ADV.t0)/I);
 for(let k=n;k>=0;k--){const t=ADV.t0+k*I,L=at(hL,t),Rr=at(hR,t);if(!L||!Rr)continue;
  const bis=e=>e.sqi<15||e.bis==null?'--':Math.round(e.bis),sq=e=>`${Math.round(e.sqi)}${e.sqi<50?'*':''}`,pl=Math.pow(10,L.tp/10),pr=Math.pow(10,Rr.tp/10),as=Math.round(100*Math.abs(pl-pr)/(pl+pr+1e-9));
  const vals=two?[bis(L),Math.round(L.emg),Math.round(L.bsr),sq(L)]:[bis(L),bis(Rr),Math.round(L.emg),Math.round(Rr.emg),Math.round(L.bsr),Math.round(Rr.bsr),as,sq(L),sq(Rr)];
  rows.push(`<tr class="${k===0?'st':''}"><td>${k===0?'<span style="display:inline-block;width:calc(10*var(--u));height:calc(10*var(--u));margin-right:calc(8*var(--u));background:linear-gradient(135deg,transparent 50%,#fff 50%)"></span>':''}${advClockS(t,k===0)}</td>${vals.map((x,i)=>`<td style="color:${cols[i][2]}">${x}</td>`).join('')}</tr>`);}
 const old=el.querySelector('.scroll'),st=old?old.scrollTop:0,w=two?[86,176,176,176,203]:null;
 el.innerHTML=`<div class="hdr"><span>BEGIN: ${advDate(ADV.t0)} ${advClockS(ADV.t0,true)}</span><span class="vl"></span><span>Chart Interval: ${ADV.chartInt} min</span><button type="button" class="lnk" data-a="chartint"><u>CHANGE</u><i></i></button></div>
 <div class="scroll"><table class="ct ${two?'':'w4'}" aria-label="Chart of BIS, EMG, SR and SQI">${w?`<colgroup>${w.map(x=>`<col style="width:calc(${x}*var(--u))">`).join('')}</colgroup>`:''}<thead><tr><th>Time</th>${cols.map(c=>`<th style="color:${c[2]}">${c[1]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}<tr class="dl"><td colspan="${cols.length+1}" style="text-align:center;padding-left:0">${advDate(ADV.t0)}</td></tr></tbody></table></div>`;
 const ns=el.querySelector('.scroll');if(ns&&st)ns.scrollTop=st;}
// ----- the frame hook (called from app.js's loop) -----
function advTick(dirty){if(!ADV.built)advBuild();const now=Date.now();advBootTick(now);
 if(!ADV.d||(dirty&&!ADV.review)){advData();}
 if(dirty||ADV.alarmDirty||!ADV.alarms){advAlarmEval();advNumerics();advChart();ADV.alarmDirty=false;}
 if(ADV.review&&ADV.d){const k=ADV.review.t+'|'+ADV.d.tL+'|'+ADV.view;if(ADV.tipKey!==k){ADV.tipKey=k;advReviewTip();}}
 advSound(now);advUI(now);advSensorTick&&advSensorTick(now);advDrawAll(false);}
// applying the skin
function advApply(){advBuild();ADV.lay=null;ADV.d=null;ADV.full=true;advHeaders();advChrome();if(!ADV.booted){ADV.booted=true;ADV.t0=HIST.length?HIST[0].n:simT;ADV.win=5;}} // straight to the main screen; "Start-up sequence" under the screen replays the boot messages and sensor check
