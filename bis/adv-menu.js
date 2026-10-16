// BIS Advance screen, part 4: the main menu, the dialogs, the sensor check, snapshot, case review and demo mode. Loaded after adv-live.js.
const ADV_LAYOUTS={2:[['bis,eeg','BIS, EEG'],['bis','BIS'],['bis,dsa','BIS, DSA'],['bis,dsa,eeg','BIS, DSA, EEG'],['dsa,eeg','DSA, EEG'],['dsa','DSA'],['eeg','EEG']],
 4:[['bis,eeg','BIS, EEG'],['bis','BIS'],['bis,asym,eeg','BIS, ASYM, EEG'],['bis,dsa,asym','BIS, DSA, ASYM'],['dsa,asym,eeg','DSA, ASYM, EEG'],['eeg','EEG'],['dsa,asym','DSA, ASYM']]};
const ADV_SEC={emg:'EMG',sr:'SR',sqi:'SQI',none:'NONE',burst:'BURST',bisO:'BIS (other side)'};
const ADV_HELP={BIS:'Bispectral index: a number from 0 to 100 worked out from the frontal EEG. Near 100 is awake, about 40 to 60 is the range usually aimed at for general anaesthesia, and near 0 is a flat EEG. This simulator uses its own stand-in for the real index.',
 EMG:'Electromyogram: muscle and other high-frequency activity picked up by the sensor, in dB. It is shown as a number, as a vertical bar (30 to 55 dB) and as a trend (30 to 80 dB). High values can push the BIS up.',
 SQI:'Signal quality index: five bars of 20 percent each. Five green bars mean a clean signal; fewer bars, orange or one red bar mean more artefact. The BIS number is not shown when quality is very low.',
 BURST:'Burst count: how many EEG bursts occurred in the last minute while the EEG is suppressed. Shown for the bilateral sensor.',
 SR:'Suppression ratio: the percent of the last 63 seconds in which the EEG was flat (isoelectric).',
 ST:'Suppression time: the total time in this case with suppression present, as minutes and seconds (hours, minutes and seconds after an hour).',
 EEG:'The raw EEG. The scale in µV/mm sets the gain and the speed in mm/sec sets the sweep. The one-second marker shows how long one second is on the screen. Filters (high-pass, low-pass and mains notch) are on by default.',
 DSA:'Density spectral array: EEG power at each frequency from 0 to 30 Hz, over time. Colour shows power from low (blue) to high (red). The white line is the spectral edge frequency and the purple line the median frequency.',
 SEF:'Spectral edge frequency: the frequency below which 95 percent of the EEG power lies.',
 MF:'Median frequency: the frequency that divides the EEG power into two equal halves.',
 ASYM:'Asymmetry between the left and right hemispheres, as a percent of total EEG power. Left stronger plots above the centre line, right stronger below it. Differences under 20 percent are not drawn.'};
function advNewId(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=A[Math.floor(Math.random()*A.length)];return s;}
const advRelayout=()=>{ADV.lay=null;ADV.d=null;ADV.numKey=null;ADV.chartKey=null;advHeaders();advChrome();advView2();advInval();};
function advView2(){const ch=ADV.view==='chart';aq('advChart').hidden=!ch;aq('advHdr').hidden=ch;if(ch)advChart(true);advReviewTip();}
// ----- overlay -----
function advOv(){const el=aq('advOv'),f=document.activeElement,sig=f&&f.dataset&&f.dataset.a?`[data-a="${f.dataset.a}"]${f.dataset.v!=null?`[data-v="${f.dataset.v}"]`:''}`:null;
 let h='';if(ADV.menu)h+=`<div class="shade" data-a="menuclose"></div>${advMenuHtml()}`;if(ADV.dlg)h+=`<div class="shade" style="z-index:23"></div>${advDlgHtml()}`;
 el.innerHTML=h;aq('aMenu').setAttribute('aria-expanded',ADV.menu);aq('aMenu').classList.toggle('on',ADV.menu);
 if(sig){const n=el.querySelector(sig);if(n)n.focus();}}
// ALARMS and CASE REVIEW are not available while a sensor is connected and the monitor is running a live case (the manual); in Demo, DOWNLOAD and CASE REVIEW are not
const advLive=()=>!ADV.demo&&!ADV.disc&&!ADV.boot;
function advMenuHtml(){const live=advLive(),T=(a,ic,l,dis)=>`<button type="button" data-a="${a}" ${dis?'aria-disabled="true"':''}>${ic}<span>${l}</span></button>`;
 return `<div class="mm" role="dialog" aria-label="Main menu">${T('m_alarms',IC.bellW,'ALARMS',live)}${T('m_display',IC.graph.replace(/currentColor/g,'#fff'),'DISPLAY <br>SETTINGS')}${T('m_settings',IC.gear,'SETTINGS &amp; <br>MAINTENANCE')}${T('m_download',IC.out,'DOWNLOAD',ADV.demo)}${T('m_info',IC.infoW,'INFO')}${T('m_review',IC.rise,'CASE REVIEW',ADV.demo||live)}</div>`;}
function advOpenMenu(){advCloseTransient();ADV.focusBack=document.activeElement;ADV.menu=true;advOv();const b=aq('advOv').querySelector('.mm button[data-a="m_display"]');if(b)b.focus();}
function advCloseMenu(){ADV.menu=false;advOv();const f=ADV.focusBack&&ADV.focusBack.isConnected?ADV.focusBack:aq('aMenu');f.focus();}
function advOpenDlg(name,o){o=o||{};if(!ADV.dlg&&!ADV.menu)ADV.focusBack=document.activeElement;ADV.menu=false;
 const A=ADV.alarm;const d={name,sel:o.sel||null,tmp:null};
 if(name==='alarms'){d.sel=d.sel||'bis';d.tmp={bis:{...A.bis},sr:{...A.sr},sef:{...A.sef},vol:ADV.vol,rem:ADV.audioRem};}
 if(name==='display'){d.tmp={layout:ADV.layout[ADV.ch],sec:ADV.sec};}
 if(name==='settings'){d.sel=d.sel||'global';d.tmp={eeg:advEegStage()};}
 if(name==='info'){d.sel=d.sel||'Demo';}
 if(name==='download'){d.sel=d.sel||'live';}
 if(name==='snapshot'){d.tmp={name:'Snapshot '+(ADV.snaps.length+1)};}
 if(name==='caseid'){d.tmp={id:ADV.caseId};clearTimeout(ADV.cidT);ADV.cidT=setTimeout(()=>{if(ADV.dlg&&ADV.dlg.name==='caseid')advCloseDlg();},60000);}
 if(name==='admin'){d.tmp={pw:'',bad:false};}
 ADV.dlg=d;advOv();const f=aq('advOv').querySelector('.dlg input,.dlg .rail button.on,.dlg .rail button,.dlg .xbtn,.dlg button');if(f)f.focus();}
function advCloseDlg(){ADV.dlg=null;advOv();const f=ADV.focusBack&&ADV.focusBack.isConnected?ADV.focusBack:null;if(f)f.focus();}
// ----- dialog frame -----
function advDlgFrame(o){const w=o.w||607,h=o.h||449,k=o.k||(w===607?1.5:1.25),x=o.x!=null?o.x:(1246-w*k)/2,y=o.y!=null?o.y+h/2-h*k/2:(779-h*k)/2; // drawn at its design size and scaled up, as the real windows are large on the screen
 return `<div class="dlg ${o.cls||''}" role="dialog" aria-modal="true" aria-label="${advEsc(o.aria||o.title||'Dialog')}" style="left:calc(${x}*var(--u));top:calc(${y}*var(--u));width:calc(${w}*var(--u));height:calc(${h}*var(--u));transform:scale(${k});transform-origin:0 0;${o.bg?`background:${o.bg};`:''}">
 ${o.title!=null?`<div class="th">${o.th||advEsc(o.title)}<button type="button" class="x" data-a="dclose" aria-label="Close">${IC.x}</button></div>`:''}
 <div class="bd">${o.rail?`<div class="rail ${o.railCls||''}">${o.rail}</div>`:''}<div class="pane" style="${o.padCls||''}">${o.pane||''}</div></div>${o.ft!=null?`<div class="ft">${o.ft}</div>`:''}</div>`;}
const advBtns=(applyOn,ok)=>`<button type="button" class="xbtn dk" data-a="dcancel">CANCEL</button><button type="button" class="xbtn pr" data-a="dapply" ${applyOn?'':'disabled'}>${ok||'APPLY'}</button>`;
const advTog=(a,v,on,lab)=>`<button type="button" class="tog ${on?'on':''}" data-a="${a}" data-v="${v}" role="switch" aria-checked="${on}" aria-label="${lab}"></button>`;
const advOpt=(a,list,cur,cls)=>`<span class="opt ${cls||''}" role="group">${list.map(([v,l])=>`<button type="button" class="${String(v)===String(cur)?'on':''}" data-a="${a}" data-v="${v}" aria-pressed="${String(v)===String(cur)}">${l}</button>`).join('')}</span>`;
function advDrum(key,field,val,step,min,max,lab){const up=val+step<=max?val+step:'',dn=val-step>=min?val-step:'';
 return `<div class="drum" role="group" aria-label="${lab}"><i class="ch u"></i><button type="button" data-a="dr" data-v="${key}.${field}.${step}" ${up===''?'disabled':''} aria-label="${lab} up">${up}</button><button type="button" class="cu" aria-live="polite" tabindex="-1">${val}</button><button type="button" data-a="dr" data-v="${key}.${field}.${-step}" ${dn===''?'disabled':''} aria-label="${lab} down">${dn}</button><i class="ch d"></i></div>`;}
// ----- the dialogs -----
function advDlgHtml(){const d=ADV.dlg;if(!d)return '';switch(d.name){
 case 'alarms':return advAlarmsHtml(d);case 'display':return advDisplayHtml(d);case 'settings':return advSettingsHtml(d);case 'download':return advDownloadHtml(d);
 case 'info':return advInfoHtml(d);case 'caselist':return advCaseListHtml();case 'caselog':return advCaseLogHtml();case 'snapshot':return advSnapHtml(d);
 case 'caseid':return advCaseIdHtml(d);case 'chartint':return advChartIntHtml();case 'admin':return advAdminHtml(d);case 'sensor':return advSensorHtml();}
 return '';}
function advAlarmsHtml(d){const t=d.tmp,A=t,diff=JSON.stringify(t)!==JSON.stringify({bis:ADV.alarm.bis,sr:ADV.alarm.sr,sef:ADV.alarm.sef,vol:ADV.vol,rem:ADV.audioRem});
 const row=(k,ic,l,val,on)=>`<button type="button" class="${d.sel===k?'on':''}" data-a="dsel" data-v="${k}">${ic}<span style="min-width:calc(62*var(--u))">${l}</span><em class="v">${val}</em><em class="${on?'on':''}" style="width:calc(40*var(--u));text-align:right">${on?'ON':'OFF'}</em></button>`;
 const mini=k=>k==='sr'?`<svg class="ri" viewBox="0 0 20 16" aria-hidden="true"><rect x=".5" y=".5" width="19" height="15" rx="2.4" fill="#1a1530"/><path d="M2 12.5l2.4-4.5 2.2 2.2 2.6-5 2.4 3.6 2.2-2.4 2.4 3.6v3H2z" fill="#8c5c9c"/><path d="M2 12.5l2.4-4.5 2.2 2.2 2.6-5 2.4 3.6 2.2-2.4 2.4 3.6" fill="none" stroke="#b894c8" stroke-width=".9"/></svg>`:k==='sef'?`<svg class="ri" viewBox="0 0 20 16" aria-hidden="true"><rect x=".5" y=".5" width="19" height="15" rx="2.4" fill="#2a8fd8"/><path d="M.5 5.5h19V3A2.5 2.5 0 0 0 17 .5H3A2.5 2.5 0 0 0 .5 3z" fill="#1c3f9c"/><rect x=".5" y="5.5" width="19" height="3" fill="#55c4a8"/><rect x=".5" y="8.5" width="19" height="2.5" fill="#f6d51a"/><rect x=".5" y="11" width="19" height="2" fill="#f58a1f"/><path d="M.5 13h19v.5A2.5 2.5 0 0 1 17 15.5H3A2.5 2.5 0 0 1 .5 13.5z" fill="#d9141c"/><path d="M1.5 8l3-.8 3 1.2 3-1.4 3 .6 3-.8 3 .8" fill="none" stroke="#fff" stroke-width="1"/></svg>`:`<svg class="ri" viewBox="0 0 20 16" aria-hidden="true"><rect x=".5" y=".5" width="19" height="15" rx="2.4" fill="#fff" stroke="#6b7482" stroke-width=".8"/><path d="M2.8 10.4l2.1-3 2 3 2.3-5.2 2.2 6.4 2.1-4.1 1.9 1.9" fill="none" stroke="#e8479a" stroke-width="1.3" stroke-linejoin="round"/><path d="M2.8 11.6h14.4" stroke="#3a7bd5" stroke-width=".8" opacity=".7"/></svg>`;
 const rail=`<div class="sh">ALARM LIMITS</div>${row('bis',mini('bis'),'BIS',`[${A.bis.lo} - ${A.bis.hi}]`,A.bis.on)}${row('sr',mini('sr'),'SR',A.sr.on?`[${A.sr.hi}]`:'[--]',A.sr.on)}${row('sef',mini('sef'),'SEF',A.sef.on?`[${A.sef.lo} - ${A.sef.hi}]`:'[--]',A.sef.on)}
  <div class="sh">AUDIO</div><button type="button" class="${d.sel==='vol'?'on':''}" data-a="dsel" data-v="vol"><svg class="ri" viewBox="0 0 20 16" aria-hidden="true"><path d="M1 5h4l5-4v14l-5-4H1z" fill="#333"/><path d="M13 5c2 2 2 4 0 6M15.5 3c3.5 3.5 3.5 6.500 0 10" fill="none" stroke="#3fb764" stroke-width="1.5"/></svg><span>Volume</span></button><button type="button" class="${d.sel==='rem'?'on':''}" data-a="dsel" data-v="rem"><svg class="ri" viewBox="0 0 20 16" aria-hidden="true"><circle cx="10" cy="9" r="5.5" fill="none" stroke="#333" stroke-width="1.4"/><path d="M10 6v3.5l2 1.2M3 3l3 -2M17 3l-3 -2" stroke="#333" stroke-width="1.3" fill="none"/></svg><span>Audio Off Reminder</span><em class="${t.rem?'on':''}">${t.rem?'ON':'OFF'}</em></button>`;
 let pane='';const hd=(ic,txt)=>`<div class="h1">${ic}<span>${txt}</span></div>`;
 const sw=(k,lab)=>`<div class="xrow"><span class="h2">${lab}</span><span class="sp" style="display:flex;align-items:center;gap:calc(12*var(--u))"><span style="width:calc(26*var(--u));height:calc(22*var(--u));display:inline-block;color:#8b94a3">${IC.off.replace(/#e8ecf2/g,'#6b7482')}</span>${advTog('dtog',k,A[k].on,lab)}<span style="width:calc(26*var(--u));height:calc(22*var(--u));display:inline-block;color:#1f4f8f">${IC.tri2}</span></span></div><div class="hr"></div>`;
 if(d.sel==='bis')pane=`${hd(mini('bis'),'BIS RANGE')}${sw('bis','Alarm Enabled')}<div class="h2" style="margin-bottom:calc(10*var(--u))">Set Limits</div><div style="background:#e9edf7;padding:calc(22*var(--u));display:flex;justify-content:center;gap:calc(34*var(--u));align-items:center;width:calc(300*var(--u));margin:0 auto calc(14*var(--u));box-sizing:content-box"><span class="dim" style="font-size:calc(15*var(--u))">LOW</span>${advDrum('bis','lo',A.bis.lo,5,5,95,'BIS low limit')}${advDrum('bis','hi',A.bis.hi,5,10,100,'BIS high limit')}<span class="dim" style="font-size:calc(15*var(--u))">HIGH</span></div><div class="dim" style="text-align:center;font-size:calc(17*var(--u))"><button type="button" data-a="dreset" data-v="bis" style="color:#8a93a2">Default Limits (40 - 60)</button></div>`;
 else if(d.sel==='sr')pane=`${hd(mini('sr'),'SR LIMIT')}${sw('sr','Alarm Enabled')}<div class="h2" style="margin-bottom:calc(10*var(--u))">Set Limit</div><div style="background:#e9edf7;padding:calc(22*var(--u));display:flex;justify-content:center;gap:calc(34*var(--u));align-items:center;width:calc(200*var(--u));margin:0 auto calc(14*var(--u));box-sizing:content-box"><span class="dim" style="font-size:calc(15*var(--u))">HIGH</span>${advDrum('sr','hi',A.sr.hi,5,5,100,'SR high limit')}</div><div class="dim" style="text-align:center;font-size:calc(17*var(--u))"><button type="button" data-a="dreset" data-v="sr" style="color:#8a93a2">Default Limit (50)</button></div>`;
 else if(d.sel==='sef')pane=`${hd(mini('sef'),'SEF RANGE')}${sw('sef','Alarm Enabled')}<div class="h2" style="margin-bottom:calc(10*var(--u))">Set Limits</div><div style="background:#e9edf7;padding:calc(22*var(--u));display:flex;justify-content:center;gap:calc(34*var(--u));align-items:center;width:calc(300*var(--u));margin:0 auto calc(14*var(--u));box-sizing:content-box"><span class="dim" style="font-size:calc(15*var(--u))">LOW</span>${advDrum('sef','lo',A.sef.lo,1,1,29,'SEF low limit')}${advDrum('sef','hi',A.sef.hi,1,2,30,'SEF high limit')}<span class="dim" style="font-size:calc(15*var(--u))">HIGH</span></div><div class="dim" style="text-align:center;font-size:calc(17*var(--u))"><button type="button" data-a="dreset" data-v="sef" style="color:#8a93a2">Default Limits (12 - 18)</button></div>`;
 else if(d.sel==='vol')pane=`${hd(IC.bell.replace('currentColor','#333'),'VOLUME')}<div class="h2" style="margin:calc(10*var(--u)) 0 calc(14*var(--u))">Alarm Volume</div><div style="display:flex;gap:calc(8*var(--u));align-items:flex-end;height:calc(110*var(--u))">${[1,2,3,4,5,6,7].map(i=>`<button type="button" data-a="dvol" data-v="${i}" aria-label="Volume ${i}" aria-pressed="${t.vol===i}" style="flex:1;height:${20+i*11}%;background:${i<=t.vol?'#54bc74':'#d5dbe6'};border-radius:calc(3*var(--u))"></button>`).join('')}</div><div class="dim" style="margin-top:calc(14*var(--u));font-size:calc(15*var(--u))">Volume ${t.vol} of 7. Choose a level to hear it.</div>`;
 else pane=`${hd(IC.bell.replace('currentColor','#333'),'AUDIO OFF REMINDER')}<div class="xrow"><span class="h2">Reminder enabled</span><span class="sp">${advTog('drem','',t.rem,'Audio off reminder')}</span></div><div class="hr"></div><div class="dim" style="font-size:calc(15*var(--u));line-height:1.45">When alarm audio is off, the monitor sounds a reminder every 3 minutes.</div>`;
 return advDlgFrame({title:'ALARM SETTINGS',cls:'alm',rail,pane,ft:advBtns(diff),railCls:''});}
const advEegStage=()=>({uv:ADV.uvmm[ADV.ch],sw:ADV.sweep,nch:ADV.nch[ADV.ch],filt:ADV.filters});
function advLayThumb(k,two){const p=k.split(','),n=p.length,col={bis:'#ec4c9c',eeg:'#64b47c',asym:'#5ec9c0'};let h='<svg viewBox="0 0 51 38" aria-hidden="true"><rect x=".5" y=".5" width="50" height="37" rx="2" fill="#0a0a0a" stroke="#555"/>';
 const hh=(36-(n-1)*2)/n;p.forEach((q,i)=>{const y=1+i*(hh+2);
  if(q==='dsa')h+=`<defs><linearGradient id="g${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d52226"/><stop offset=".25" stop-color="#fceb17"/><stop offset=".6" stop-color="#78cda6"/><stop offset="1" stop-color="#2c4fa2"/></linearGradient></defs><rect x="3" y="${y}" width="45" height="${hh}" fill="url(#g${i})"/>`;
  else if(q==='eeg')h+=`<path d="M3 ${y+hh/2}l3 -2 3 3 3 -3 3 3 3 -3 3 2 3 -3 3 3 3 -2 3 2 3 -3 3 3 3 -2 3 2 3 -3" fill="none" stroke="${col.eeg}" stroke-width="1"/>`;
  else if(q==='asym')h+=`<path d="M3 ${y+hh}h45" stroke="#2c6f6a" stroke-width="1"/><path d="M8 ${y+hh/2}q10 -${hh/2} 20 0t14 0" fill="#344c44" stroke="#5ec9c0" stroke-width=".8"/>`;
  else h+=`<path d="M3 ${y+hh*.3}l4 ${hh*.5}l5 -${hh*.2}l5 ${hh*.1}l6 -${hh*.2}l5 ${hh*.1}l8 0l6 ${hh*.1}l5 0" fill="none" stroke="${col.bis}" stroke-width="1"/>`;});
 return h+'</svg>';}
function advLayPrev(k,sec){const p=k.split(','),n=p.length;let h='<svg viewBox="0 0 300 190" aria-hidden="true"><rect width="300" height="190" rx="4" fill="#050608"/>';const hh=(176-(n-1)*8)/n;
 p.forEach((q,i)=>{const y=7+i*(hh+8);
  if(q==='bis')h+=`<text x="10" y="${y+9}" font-size="9" fill="#ec4c9c">BIS</text><rect x="28" y="${y+12}" width="244" height="${hh-14}" fill="none" stroke="#444"/><path d="M29 ${y+14}L40 ${y+14}L46 ${y+hh*.55}L60 ${y+hh*.5}L80 ${y+hh*.62}L110 ${y+hh*.5}L150 ${y+hh*.58}L190 ${y+hh*.55}L230 ${y+hh*.6}L260 ${y+hh*.55}" fill="none" stroke="#ec4c9c" stroke-width="1.2"/>${sec==='emg'?`<path d="M29 ${y+hh*.5}L40 ${y+hh*.9}L270 ${y+hh*.94}" fill="none" stroke="#e8792c" stroke-width="1"/>`:''}`;
  else if(q==='dsa')h+=`<defs><linearGradient id="pg${i}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d52226"/><stop offset=".3" stop-color="#fceb17"/><stop offset=".65" stop-color="#78cda6"/><stop offset="1" stop-color="#2c4fa2"/></linearGradient></defs><text x="10" y="${y+9}" font-size="9" fill="#fff">DSA</text><rect x="28" y="${y+12}" width="244" height="${hh-14}" fill="url(#pg${i})"/>`;
  else if(q==='asym')h+=`<text x="10" y="${y+9}" font-size="9" fill="#7cacac">ASYM %</text><rect x="28" y="${y+12}" width="244" height="${hh-14}" fill="none" stroke="#444"/><path d="M60 ${y+12+(hh-14)/2}q30 -${(hh-14)/3} 60 0M170 ${y+12+(hh-14)/2}q22 ${(hh-14)/3} 44 0" fill="#344c44" stroke="#5ec9c0"/>`;
  else{h+=`<text x="10" y="${y+9}" font-size="9" fill="#74a484">EEG</text><rect x="28" y="${y+12}" width="244" height="${hh-14}" fill="none" stroke="#444"/><path d="M29 ${y+12+(hh-14)/2}`;for(let i2=0;i2<48;i2++)h+=`L${29+i2*5} ${y+12+(hh-14)/2+Math.sin(i2*1.7)*(hh-14)*.22*Math.cos(i2*.6)}`;h+='" fill="none" stroke="#64b47c" stroke-width="1.1"/>';}});
 return h+'</svg>';}
function advDisplayHtml(d){const t=d.tmp,L=ADV_LAYOUTS[ADV.ch],cur=L.find(x=>x[0]===t.layout)||L[0],diff=t.layout!==ADV.layout[ADV.ch]||t.sec!==ADV.sec;
 const rail=L.map(([k,n])=>`<button type="button" class="${k===t.layout?'on':''}" data-a="dlay" data-v="${k}" aria-pressed="${k===t.layout}">${advLayThumb(k)}<span>${n}</span></button>`).join('');
 const secs=[['emg','EMG'],['sr','SR'],['sqi','SQI'],['none','NONE']].concat(ADV.ch===4?[['burst','BURST'],['bisO','BIS (other side)']]:[]);
 const pane=`<div class="dsph"><span style="font-size:calc(19*var(--u))">${cur[1]}</span><span style="display:flex;align-items:center;gap:calc(12*var(--u))"><label for="advSecSel" style="font-size:calc(18*var(--u));color:#5a6372">Secondary</label><select id="advSecSel" class="sl" data-a="dsec">${secs.map(([k,n])=>`<option value="${k}" ${k===t.sec?'selected':''}>${n}</option>`).join('')}</select></span></div><div class="lay-prev">${advLayPrev(t.layout,t.sec)}</div><div class="ex">EXAMPLE ONLY</div>`;
 return advDlgFrame({title:'DISPLAY SETTINGS',cls:'dsp',rail,railCls:'lay',pane,ft:`<span class="hint">${IC.bulb}<span>Select display layout and click APPLY</span></span>${advBtns(diff)}`});}
function advSettingsHtml(d){const s=d.sel,sh=t=>`<div class="sh">${t}</div>`,it=(k,l)=>`<button type="button" class="${s===k?'on':''}" data-a="dsel" data-v="${k}"><span>${l}</span></button>`;
 const rail=`${sh('SETTINGS')}${it('global','Global')}${it('advanced','Advanced')}${sh('MAINTENANCE')}${it('logs','Logs')}${it('config','Configuration')}${it('dsc','DSC Self-Test')}`;
 const row=(l,ctl)=>`<div class="xrow"><span style="font-size:calc(17*var(--u))">${l}</span><span class="sp">${ctl}</span></div>`,hh=t=>`<div class="h2" style="font-size:calc(17*var(--u));color:#4a5470;margin:calc(8*var(--u)) 0 calc(2*var(--u))">${t}</div>`;
 let pane='';
 if(s==='global')pane=`${hh('Time and Language')}${row('Language','<span class="dim">English</span>')}${row('Date &amp; Time',`<span class="dim">${advDate(simT)} ${advClockS(simT)}</span>`)}${row('Date Format',advOpt('st_datef',[['DD MMM YYYY','DD MMM YYYY'],['MMM DD YYYY','MMM DD YYYY']],ADV.dateFmt,'tx wd'))}${row('Time Format',advOpt('st_timef',[['24','24 hour'],['12','12 hour']],ADV.hr24?'24':'12','tx'))}<div class="hr"></div>${hh('MPM Configuration')}${row('Protocol',advOpt('st_proto',[['bin','Binary'],['asc','ASCII'],['leg','Legacy binary']],ADV.proto||'bin','tx'))}`;
 else if(s==='advanced'){const n=ADV.ch===4?[1,2,4]:[1,2],E=d.tmp.eeg;pane=`${row('BIS Smoothing Rate',advOpt('st_smooth',[[10,'10 sec'],[15,'15 sec'],[30,'30 sec']],mon.smooth,'tx'))}<div class="hr"></div>${hh('EEG Trends')}${row('EEG Amplitude (µV/mm)',advOpt('st_uv',[[2,'2'],[5,'5'],[10,'10']],E.uv,'tx'))}${row('EEG Scale (mm/sec)',advOpt('st_sw',[[6.25,'6.25'],[12.5,'12.5'],[25,'25'],[50,'50']],E.sw,'tx'))}${row('# of Channels',advOpt('st_nch',n.map(x=>[x,x]),E.nch,'tx'))}${row('EEG Filters',advTog('st_filt','',E.filt,'EEG filters'))}<div class="hr"></div>${row('Impedance',advTog('st_imp','',ADV.imp,'Impedance checking'))}${row('Sensor Check Values',advTog('st_vals','',ADV.showVals,'Sensor check values'))}${row('Institutional Defaults','<button type="button" class="xbtn dk" data-a="st_reset">RESET SETTINGS</button>')}${row('Trends Display','<button type="button" class="xbtn dk" data-a="m_display">CHANGE</button>')}<div class="hr"></div>${row('Administrator Mode',ADV.admin?'<button type="button" class="xbtn dk" data-a="st_logout">LOGOUT</button>':'<button type="button" class="xbtn pr" data-a="st_admin">INPUT PASSWORD</button>')}`;
  if(ADV.admin)pane+=`<div class="hr"></div>${hh('Administrator')}${row('Erase Trend Data','<button type="button" class="xbtn dk" data-a="st_erase">ERASE</button>')}${row('Factory Defaults','<button type="button" class="xbtn dk" data-a="st_factory">RESET SETTINGS</button>')}${row('EEG Testing (±1000 µV)','<button type="button" class="xbtn dk" data-a="st_eegtest">START</button>')}${row('Software Update','<button type="button" class="xbtn dk" data-a="st_update">CHECK</button>')}`;}
 else if(s==='logs')pane=['BIS Connection','Sensor Connection','Monitor','System'].map(l=>row(l,`<button type="button" class="xbtn dk" data-a="st_cancel">CANCEL</button> <button type="button" class="xbtn pr" data-a="st_dl" data-v="${l}">DOWNLOAD</button>`)).join('')+'<div class="dim" style="font-size:calc(14*var(--u));margin-top:calc(10*var(--u))">Insert a USB flash drive to download a log.</div>';
 else if(s==='config')pane=`<table class="lst" aria-label="Configuration"><tr><th>Item</th><th>Value</th></tr><tr><td>Monitor</td><td>BIS Advance simulator</td></tr><tr><td>Language</td><td>English</td></tr><tr><td>BISx</td><td>${ADV.ch===4?'4-channel (simulated)':'2-channel (simulated)'}</td></tr><tr><td>Sensor</td><td>${ADV.ch===4?'Bilateral (simulated)':'Unilateral (simulated)'}</td></tr></table>`;
 else pane=`<div class="h2" style="font-size:calc(19*var(--u))">DSC Self-Test</div><div class="dim" style="margin:calc(8*var(--u)) 0 calc(16*var(--u));font-size:calc(15*var(--u))">${ADV.dsc==='run'?'Self-test in progress':ADV.dsc==='ok'?'Self-test passed':'Checks the BISx digital signal converter.'}</div><button type="button" class="xbtn dk" data-a="st_dsc">CANCEL</button> <button type="button" class="xbtn pr" data-a="st_dsc" data-v="go" ${ADV.dsc==='run'?'disabled':''}>START</button>`;
 const eegDiff=s==='advanced'&&d.tmp&&d.tmp.eeg&&JSON.stringify(d.tmp.eeg)!==JSON.stringify(advEegStage());
 // the EEG Trends buttons live in the window's footer, as on the real monitor
 const ft=s==='advanced'?`<button type="button" class="xbtn dk" data-a="eeg_cancel">CANCEL</button><button type="button" class="xbtn pr" data-a="eeg_apply" ${eegDiff?'':'disabled'}>APPLY</button>`:`<button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`;
 return advDlgFrame({title:'SETTINGS & MAINTENANCE',cls:'dsp set',rail,pane,ft});}
function advDownloadHtml(d){const s=d.sel,it=(k,l,e)=>`<button type="button" class="${s===k?'on':''}" data-a="dsel" data-v="${k}"><span>${l}</span>${e||''}</button>`;
 const rail=it('live','Live Case',ADV.rec?'<em style="color:#d62828">REC</em>':'')+it('mon','Monitor Saved Cases')+it('bisx','BISx Saved Cases');
 let pane='';if(s==='live')pane=`<div class="h2">Live Case</div><div class="dim" style="margin:calc(8*var(--u)) 0 calc(20*var(--u));font-size:calc(15*var(--u));line-height:1.45">Records the live case to a USB flash drive. Do not remove the drive while recording.</div><div style="display:flex;gap:calc(20*var(--u))"><button type="button" class="xbtn dk" style="min-width:calc(60*var(--u))" data-a="dl_rec" aria-label="Record"><span style="width:calc(14*var(--u));height:calc(14*var(--u));border-radius:50%;background:#e03a3a;display:block"></span></button><button type="button" class="xbtn dk" style="min-width:calc(60*var(--u))" data-a="dl_stop" aria-label="Stop"><span style="width:calc(13*var(--u));height:calc(13*var(--u));background:#fff;display:block"></span></button></div>`;
 else pane=`<div class="h2">${s==='mon'?'Monitor Saved Cases':'BISx Saved Cases'}</div><div class="dim" style="margin:calc(8*var(--u)) 0 calc(20*var(--u));font-size:calc(15*var(--u));line-height:1.45">Insert a USB flash drive to download saved cases.</div><button type="button" class="xbtn dk" data-a="dl_go" data-v="${s}">${s==='mon'?'NEXT':'DOWNLOAD'}</button>`;
 return advDlgFrame({title:'DOWNLOAD',cls:'dsp',rail,pane,ft:`<button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`});}
function advInfoHtml(d){const keys=['Demo',...Object.keys(ADV_HELP)],s=d.sel;
 const rail=keys.map(k=>`<button type="button" class="${s===k?'on':''}" data-a="dsel" data-v="${k}"><span>${k==='Demo'?'Demo Mode':k}</span></button>`).join('');
 const pane=s==='Demo'?`<div class="h2">Demo Mode</div><div class="dim" style="margin:calc(8*var(--u)) 0 calc(18*var(--u));font-size:calc(15*var(--u));line-height:1.45">The monitor shows a demonstration screen with a DEMO MODE mark. Choose the sensor type to demonstrate. Saving and case review are not available in demo mode.</div><div style="display:grid;gap:calc(12*var(--u));justify-items:start"><button type="button" class="xbtn pr" style="min-width:calc(300*var(--u))" data-a="demo" data-v="2" style="text-transform:none;font-size:calc(15*var(--u))">Begin Demo Mode for Unilateral</button><button type="button" class="xbtn pr" style="min-width:calc(300*var(--u))" data-a="demo" data-v="4" style="text-transform:none;font-size:calc(15*var(--u))">Begin Demo Mode for Bilateral</button></div><div class="dim" style="margin-top:calc(18*var(--u));font-size:calc(13*var(--u))">BIS Advance simulator. Synthetic EEG; for teaching only.</div>`:`<div class="h2">${s==='Demo'?'':s}</div><p class="help" style="margin-top:calc(10*var(--u))">${advEsc(ADV_HELP[s])}</p>`;
 return advDlgFrame({title:'INFO',cls:'dsp',rail,pane,ft:`<button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`});}
function advCaseListHtml(){const t0=ADV.t0,dur=Math.max(0,Math.round((simT-t0)/60)),d=new Date(T0+t0*1000);
 const row=`<tr class="sel" data-a="rvopen" tabindex="0" role="button" style="cursor:pointer"><td>${AM[d.getMonth()]} ${apad(d.getDate())} ${d.getFullYear()}&nbsp;&nbsp;${apad(d.getHours())}:${apad(d.getMinutes())}</td><td>${advEsc(ADV.caseId)}</td><td>${apad(Math.floor(dur/60))}:${apad(dur%60)}</td><td style="color:#3f8fd6;text-align:right">&rarr;</td></tr>`;
 return advDlgFrame({title:'CASE REVIEW',aria:'Select the case to review',pane:`<table class="lst" aria-label="Cases"><thead><tr><th>Case Start</th><th>Case ID <span class="dim" style="font-weight:400">(filter)</span></th><th>Duration [hh:mm]</th><th></th></tr></thead><tbody>${row}</tbody></table>`,ft:`<span class="hint">${IC.bulb}<span>Select the case to display</span></span><button type="button" class="xbtn dk" data-a="dclose">CANCEL</button>`});}
function advCaseLogHtml(){const ev=[{t:ADV.t0,x:'Case start'},...ADV.snaps.map(s=>({t:s.t,x:'Snapshot: '+s.name})),...ADV.log].sort((a,b)=>a.t-b.t);
 return advDlgFrame({title:'CASE LOG',pane:`<table class="lst" aria-label="Case log"><thead><tr><th>Time</th><th>Event</th></tr></thead><tbody>${ev.map(e=>`<tr><td>${advClockS(e.t,true)}</td><td>${advEsc(e.x)}</td></tr>`).join('')}</tbody></table>`,ft:`<button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`});}
function advSnapHtml(d){return advDlgFrame({w:607,h:165,y:230,cls:'plain',bg:'#ececec',aria:'Snapshot',pane:`<div style="display:flex;align-items:center;justify-content:center;gap:calc(8*var(--u));font-size:calc(19*var(--u));margin-bottom:calc(14*var(--u))"><span style="width:calc(18*var(--u));height:calc(18*var(--u));display:inline-block;color:#555">${IC.flag}</span>SNAPSHOT</div><div class="xrow"><label for="advSnapName" style="font-size:calc(19*var(--u))">Name:</label><input id="advSnapName" class="fld" maxlength="24" value="${advEsc(d.tmp.name)}" data-a="dinput" data-v="name" autocomplete="off"></div>`,ft:`<button type="button" class="xbtn dk" data-a="dclose">CANCEL</button><button type="button" class="xbtn pr" data-a="dok">OK</button>`}).replace('class="ft"','class="ft" style="background:#ececec;height:calc(46*var(--u))"');}
function advCaseIdHtml(d){return advDlgFrame({w:420,h:190,y:250,title:'CASE ID',pane:`<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:calc(18*var(--u))"><span class="dim" style="font-size:calc(19*var(--u))">Case ID</span><span style="font-size:calc(46*var(--u));letter-spacing:.06em;color:#1a1f28" aria-live="polite">${advEsc(d.tmp.id)}</span></div>`,ft:`<span class="hint"><span>Closes by itself after 1 minute</span></span><button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`});}
function advChartIntHtml(){return advDlgFrame({w:520,h:230,y:240,title:'CHART INTERVAL',pane:`<div class="h2" style="margin-bottom:calc(14*var(--u))">Interval between rows</div>${advOpt('ci',[1,5,10,15,30,60].map(x=>[x,x+' min']),ADV.chartInt)}`,ft:`<button type="button" class="xbtn dk" data-a="dclose">CLOSE</button>`});}
function advAdminHtml(d){return advDlgFrame({w:520,h:240,y:230,title:'ADMINISTRATOR MODE',pane:`<div class="xrow"><label for="advPw" style="font-size:calc(19*var(--u))">Password:</label><input id="advPw" class="fld" type="password" maxlength="12" value="${advEsc(d.tmp.pw)}" data-a="dinput" data-v="pw" autocomplete="off"></div><div style="color:#c0262d;font-size:calc(14*var(--u));min-height:calc(20*var(--u));margin-top:calc(6*var(--u))" role="alert">${d.tmp.bad?'Incorrect password':''}</div>`,ft:`<button type="button" class="xbtn dk" data-a="dclose">CANCEL</button><button type="button" class="xbtn pr" data-a="dok">LOGIN</button>`});}
// ----- sensor check -----
const ADV_PADS={2:[['1',262],['2',334],['4',394],['3',540]],4:[['LT',190],['LE',262],['G',334],['C',406],['RE',478],['RT',550]]};
function advSensorStart(){if(ADV.demo&&false)return;const pads=ADV_PADS[ADV.ch],now=Date.now();ADV.sensor={t0:now,done:false,fail:false,doneT:0,el:pads.map(([n,x],i)=>({n,x,at:now+1100+i*650,st:null,v:null})),conn:now+500};ADV.menu=false;ADV.focusBack=document.activeElement;ADV.dlg={name:'sensor'};advOv();}
function advSensorTick(now){const S=ADV.sensor;if(!S)return;let ch=false;
 for(const e of S.el){if(e.st==null&&now>=e.at){const side=ADV.ch===2?['L']:(e.n==='LT'||e.n==='LE')?['L']:(e.n==='RT'||e.n==='RE')?['R']:['L','R'];
   const q=Math.min(...side.map(s=>{const cs=s==='R'?R.COLS:COLS,c=cs[cs.length-1];return c?c.sqi:100;}));
   const ok=q>=50&&!ADV.disc,gnd=e.n==='G'||e.n==='2';e.st=ok&&!ADV.disc?'pass':ADV.disc?'poor':(typeof mods!=='undefined'&&mods.diathermy)?'noise':'high';e.v=ok?(gnd?(8+Math.random()*10).toFixed(1):(1.5+Math.random()*4.5).toFixed(1)):(14+Math.random()*30).toFixed(1);ch=true;}}
 if(!S.done&&S.el.every(e=>e.st!=null)){S.done=true;S.doneT=now;S.fail=S.el.some(e=>e.st!=='pass');ch=true;ADV.alarmDirty=true;}
 if(S.done&&!S.fail&&now-S.doneT>2300){ADV.sensor=null;ADV.dlg=null;ADV.alarmDirty=true;advOv();const f=ADV.focusBack;if(f&&f.isConnected)f.focus();return;}
 if(!S.conn_done&&now>=S.conn){S.conn_done=true;ch=true;}
 if(ch&&ADV.dlg&&ADV.dlg.name==='sensor')advOv();}
function advSensorHtml(){const S=ADV.sensor;if(!S)return '';const two=ADV.ch===2,Y=130,BG='#e9eef7';
 // the result mark above each electrode: a grey ring with a blue quarter turning while it is checked, then a green tick (or red / grey for a fault)
 const mark=(x,e)=>{if(e.st==null)return `<g><circle cx="${x}" cy="46" r="13" fill="none" stroke="#9aa0aa" stroke-width="3"/><path class="spin" style="transform-origin:${x}px 46px" d="M${x} 33a13 13 0 0 1 13 13" fill="none" stroke="#3a7bd5" stroke-width="3.4" stroke-linecap="round"/></g>`;
  if(e.st==='pass')return `<circle cx="${x}" cy="46" r="15" fill="#3fb56a"/><path d="M${x-7} 46l5 5 9-10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  const col=e.st==='noise'?'#8c93a0':'#d9382f';return `<circle cx="${x}" cy="46" r="15" fill="${col}"/><path d="M${x} 38v10M${x} 52v2" stroke="#fff" stroke-width="3.2" stroke-linecap="round"/>`;};
 // text under a mark: fault names always; PASS and the kohm values only while Sensor Check Values is on (off by default)
 const lbl=(x,e)=>{if(!e.st)return '';const v=ADV.showVals?' '+e.v+' kΩ':'';if(e.st==='pass')return ADV.showVals?`<text x="${x}" y="78" text-anchor="middle" font-size="12" fill="#2f8f55">${e.v} kΩ</text>`:'';
  return `<text x="${x}" y="78" text-anchor="middle" font-size="12" fill="${e.st==='noise'?'#6b7280':'#c0262d'}">${e.st==='high'?'HIGH':e.st==='noise'?'NOISE':'POOR CONTACT'}${v}</text>`;};
 // one pad: a rounded shape with a notch cut into each side; its number (or LT, LE ...) in a navy disc
 const pad=(x,e,i)=>{const w=52,h=64,wing=two&&i===0;
  const notch='';
  const wings=wing?`<path d="M${x-w/2+1} ${Y-h/2+14}L${x} ${Y-h/2+1}H${x-w/2+16}A15 15 0 0 0 ${x-w/2+1} ${Y-h/2+16}z" fill="none"/><path d="M${x-w/2+3} ${Y-h/2+2}h${w-6}l-3 13L${x} ${Y-12}L${x-w/2+6} ${Y-h/2+15}z" fill="#1d2f6b"/><path d="M${x-w/2+3} ${Y+h/2-2}h${w-6}l-3-13L${x} ${Y+12}L${x-w/2+6} ${Y+h/2-15}z" fill="#1d2f6b"/><path d="M${x-9} ${Y-21}l9-7 9 7M${x-9} ${Y+21}l9 7 9-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`:'';
  return `<g><rect x="${x-w/2}" y="${Y-h/2}" width="${w}" height="${h}" rx="17" fill="#fff" stroke="#c9cfdb"/>${notch}${wings}<circle cx="${x}" cy="${Y}" r="15" fill="#1d2f6b"/><text x="${x}" y="${Y+5}" text-anchor="middle" font-size="${e.n.length>1?11:15}" font-weight="600" fill="#fff">${e.n}</text></g>`;};
 const xs=S.el.map(e=>e.x),first=Math.min(...xs),last=Math.max(...xs);
 // the sensor: a grey plug with a white dot, a white tail narrowing to the first pad, the pads, and necks between them
 const necks=two?`<rect x="${xs[2]+20}" y="${Y-5}" width="${xs[3]-xs[2]-40}" height="10" fill="#fff" stroke="#c9cfdb"/>`:xs.slice(0,-1).map((x,i)=>`<rect x="${x+20}" y="${Y-6}" width="${xs[i+1]-x-40}" height="12" fill="#fff" stroke="#c9cfdb"/>`).join('');
 const plug=`<path d="M0 ${Y-19}H98a7 7 0 0 1 7 7v24a7 7 0 0 1-7 7H0z" fill="#8d9096"/><path d="M84 ${Y-19}a9 9 0 0 1 0 12v14a9 9 0 0 1 0 12" fill="none" stroke="#6f7278" stroke-width="1.4"/><circle cx="96" cy="${Y}" r="3.6" fill="#fff"/>`;
 const tail=`<path d="M104 ${Y-9}L${first-26} ${Y-17}V${Y+17}L104 ${Y+9}z" fill="#fff" stroke="#c9cfdb"/>`;
 const svg=`<svg class="sk" viewBox="0 0 607 227" role="img" aria-label="Sensor check: ${S.el.map(e=>e.n+' '+(e.st||'checking')).join(', ')}">${tail}${plug}${S.el.map((e,i)=>pad(e.x,e,i)).join('')}${necks}${S.el.map(e=>`<circle cx="${e.x}" cy="${Y}" r="15" fill="#1d2f6b"/><text x="${e.x}" y="${Y+5}" text-anchor="middle" font-size="${e.n.length>1?11:15}" font-weight="600" fill="#fff">${e.n}</text>`).join('')}${S.el.map(e=>mark(e.x,e)+lbl(e.x,e)).join('')}</svg>`;
 let cap='<div class="cp">Sensor check in progress</div>',acts='';
 if(S.done&&!S.fail)cap=`<div class="cp ok"><span style="color:#1d2f6a">${IC.check.replace('currentColor','#fff').replace('<path','<circle cx="12" cy="12" r="11" fill="#1d2f6a"/><path')}</span>Sensor check completed successfully</div>`;
 else if(S.done){cap='';acts='<div class="acts"><button type="button" class="xbtn dk" data-a="sc_close">CLOSE</button><button type="button" class="xbtn pr" data-a="sc_again">CHECK AGAIN</button></div>';}
 return advDlgFrame({w:607,h:255,k:1.5,title:'',th:`<span class="ty">SENSOR TYPE: <b>${two?'UNILATERAL':'BILATERAL'}</b></span>`,cls:'xsc',aria:'Sensor check',pane:svg+cap+acts}).replace('<button type="button" class="x" data-a="dclose" aria-label="Close">'+IC.x+'</button>','').replace('class="pane" style=""','class="pane" style="padding:0;overflow:hidden"');}
// ----- case review, demo -----
function advReviewOpen(){if(ADV.demo)return;ADV.menu=false;ADV.dlg=null;ADV.review={now:simT,t:Math.max(ADV.t0,simT-120)};ADV.view='graphs';advRelayout();advOv();advReviewTip();advNumerics();}
function advReviewExit(){ADV.review=null;aq('advWm').innerHTML='';advRelayout();advNumerics();}
// the demo plays a recorded case: defaults restored, alarms off, 35 minutes of trend (BIS from about 97 to the low 40s) and the sim at propofol general anaesthesia
function advDemo(ch){ADV.boot=null;advBootUI();ADV.sensor=null;ADV.dlg=null;ADV.menu=false;advDefaults();ADV.demo=true;ADV.ch=ch;ADV.hemi='L';ADV.act={};
 advMsgDrop(/^System is in Demo Mode/);const S=advDemoSimOn();advStartCase('case',S);advMsg('System is in Demo Mode',{latch:true});advRelayout();advOv();}
function advDemoExit(){advDemoSimOff();ADV.demo=false;ADV.ch=4;advMsgDrop(/^System is in Demo Mode/);advRelayout();advBootBegin();}
// ----- defaults -----
function advDefaults(){ADV.layout={2:'dsa,eeg',4:'dsa,asym,eeg'};ADV.sec='emg';ADV.win=60;ADV.chartInt=1;ADV.uvmm={2:2,4:10};ADV.sweep=25;ADV.nch={2:1,4:2};ADV.filters=true;ADV.imp=true;ADV.showVals=false;
 ADV.alarm={bis:{on:false,lo:40,hi:60},sr:{on:false,hi:50},sef:{on:false,lo:12,hi:18}};ADV.vol=4;ADV.audioRem=false;ADV.hr24=true;ADV.dateFmt='DD MMM YYYY';mon.smooth=15;ADV.view='graphs';advRelayout();}
// ----- actions -----
function advMenuAct(a,v,el,e){const d=ADV.dlg,t=d&&d.tmp;
 switch(a){
  case 'menu':ADV.menu?advCloseMenu():advOpenMenu();return;
  case 'menuclose':advCloseMenu();return;
  case 'm_alarms':if(!advLive())advOpenDlg('alarms');return;
  case 'm_display':advOpenDlg('display');return;case 'm_settings':advOpenDlg('settings');return;case 'm_download':if(!ADV.demo)advOpenDlg('download');return;
  case 'm_info':advOpenDlg('info');return;case 'm_review':if(!ADV.demo&&!advLive())advOpenDlg('caselist');return;
  case 'alarms':advOpenDlg('alarms');return;case 'range':advOpenDlg('alarms',{sel:'bis'});return;case 'info':advOpenDlg('info');return;
  case 'snap':advOpenDlg('snapshot');return;case 'caseid':advOpenDlg('caseid');return;case 'sensor':advSensorStart();return;
  case 'caselist':advOpenDlg('caselist');return;case 'caselog':advOpenDlg('caselog');return;case 'exitrv':advReviewExit();return;case 'rvopen':advReviewOpen();return;
  case 'chartint':advOpenDlg('chartint');return;case 'exitdemo':advDemoExit();return;case 'demo':advDemo(+v);return;
  case 'ci':ADV.chartInt=+v;ADV.chartKey=null;advChart(true);advOv();return;
  case 'dclose':case 'dcancel':advCloseDlg();return;
  case 'sc_close':ADV.sensor=null;ADV.alarmDirty=true;advCloseDlg();return;case 'sc_again':advSensorStart();return;
  case 'dsel':d.sel=v;advOv();return;
  case 'dtog':t[v].on=!t[v].on;advOv();return;
  case 'drem':t.rem=!t.rem;advOv();return;
  case 'dvol':t.vol=+v;ADV.vol=+v;advBeep(1,880);advOv();return;
  case 'dreset':if(v==='bis'){t.bis.lo=40;t.bis.hi=60;}else if(v==='sr')t.sr.hi=50;else{t.sef.lo=12;t.sef.hi=18;}advOv();return;
  case 'dr':{const [k,f,s]=v.split('.'),n=+s,X=t[k],nv=X[f]+n;
   const lim={'bis.lo':[5,95],'bis.hi':[10,100],'sr.hi':[5,100],'sef.lo':[1,29],'sef.hi':[2,30]}[k+'.'+f];X[f]=Math.max(lim[0],Math.min(lim[1],nv));
   if(k==='bis'){if(X.lo>X.hi-5){if(f==='lo')X.hi=Math.min(100,X.lo+5);else X.lo=Math.max(5,X.hi-5);}}
   if(k==='sef'){if(X.lo>=X.hi){if(f==='lo')X.hi=Math.min(30,X.lo+1);else X.lo=Math.max(1,X.hi-1);}}
   advOv();return;}
  case 'dapply':advApplyDlg();return;
  case 'dok':advOkDlg();return;
  case 'dlay':t.layout=v;advOv();return;
  case 'dinput':return;
  // settings
  case 'st_datef':ADV.dateFmt=v;advMsg('Date and time changed');advOv();ADV.chartKey=null;return;
  case 'st_timef':ADV.hr24=v==='24';advMsg('Date and time changed');advOv();ADV.chartKey=null;ADV.full=true;return;
  case 'st_proto':ADV.proto=v;advOv();return;
  case 'st_smooth':mon.smooth=+v;try{aq('kSmooth').textContent=`Smoothing ${v} s`;}catch(e2){}advMsg(`Smoothing rate changed to ${v} seconds`);advOv();return;
  case 'st_uv':t.eeg.uv=+v;advOv();return;
  case 'st_sw':t.eeg.sw=+v;advOv();return;
  case 'st_nch':t.eeg.nch=+v;advOv();return;
  case 'st_filt':t.eeg.filt=!t.eeg.filt;advOv();return;
  case 'eeg_cancel':d.tmp.eeg=advEegStage();advOv();return;
  case 'eeg_apply':advEegApply();return;case 'st_cancel':return;
  case 'st_imp':ADV.imp=!ADV.imp;advMsg('Impedance Checking '+(ADV.imp?'On':'Off'));advOv();return;
  case 'st_vals':ADV.showVals=!ADV.showVals;advOv();return;
  case 'st_reset':advDefaults();advMsg('Institutional settings restored');advOv();return;
  case 'st_admin':advOpenDlg('admin');return;case 'st_logout':ADV.admin=false;advOv();return;
  case 'st_erase':HIST.length=0;R.HIST.length=0;ADV.t0=simT;ADV.snaps=[];ADV.log=[];advRelayout();advMsg('Trend data erased');advOv();return;
  case 'st_factory':advDefaults();advMsg('Factory settings restored');advOv();return;
  case 'st_eegtest':advMsg('EEG test is not available in the simulator');return;
  case 'st_update':advMsg('Software update is not available in the simulator');return;
  case 'st_dl':advMsg(ADV.usb?'Monitor log export in progress':'Export failed - USB drive removed');return;
  case 'st_dsc':if(v==='go'){ADV.dsc='run';advMsg('DSC Self-Test in progress');advOv();setTimeout(()=>{ADV.dsc='ok';advMsg('DSC Self-Test passed');if(ADV.dlg&&ADV.dlg.name==='settings')advOv();},3500);}else advCloseDlg();return;
  case 'dl_rec':if(ADV.usb){ADV.rec=true;advMsg('Live data export in progress');}else{ADV.rec=false;advMsg('Export failed - USB drive removed');}advOv();return;case 'dl_stop':if(ADV.rec){ADV.rec=false;advMsg('Live data export stopped');}advOv();return;case 'dl_go':advMsg('Export failed - USB drive removed');return;}}
function advEegApply(){const d=ADV.dlg,e=d.tmp.eeg;
 if(e.uv!==ADV.uvmm[ADV.ch]){ADV.uvmm[ADV.ch]=e.uv;advEegChannels();}
 ADV.sweep=e.sw;if(e.nch!==ADV.nch[ADV.ch]){ADV.nch[ADV.ch]=e.nch;advMsg(`Number of channels for EEG changed to ${e.nch}`);}
 if(e.filt!==ADV.filters){ADV.filters=e.filt;advMsg('EEG Filtering '+(e.filt?'On':'Off'));}
 d.tmp.eeg=advEegStage();advRelayout();advOv();}
function advApplyDlg(){const d=ADV.dlg;if(!d)return;const t=d.tmp;
 if(d.name==='alarms'){const A=ADV.alarm;for(const k of ['bis','sr','sef'])if(A[k].on!==t[k].on)advMsg(`${k.toUpperCase()} alarm ${t[k].on?'enabled':'disabled'}`);
  A.bis={...t.bis};A.sr={...t.sr};A.sef={...t.sef};ADV.vol=t.vol;if(ADV.audioRem!==t.rem)advMsg('Audio Reminder is '+(t.rem?'On':'Off'));ADV.audioRem=t.rem;ADV.nextRem=0;ADV.numKey=null;ADV.act={};ADV.alarmDirty=true;advInval();}
 if(d.name==='display'){ADV.layout[ADV.ch]=t.layout;ADV.sec=t.sec;if(ADV.ch===2){ADV.uvmm[2]=t.layout.split(',').length>=3?5:2;advEegChannels();}advRelayout();}
 advCloseDlg();}
function advOkDlg(){const d=ADV.dlg;if(!d)return;
 if(d.name==='snapshot'){const inp=aq('advSnapName'),nm=(inp?inp.value:d.tmp.name).trim()||('Snapshot '+(ADV.snaps.length+1));ADV.snaps.push({t:simT,name:nm});advMsg('Snapshot created');ADV.full=true;advCloseDlg();return;}
 if(d.name==='admin'){const inp=aq('advPw');if(inp&&inp.value===ADV.pw){ADV.admin=true;advOpenDlg('settings',{sel:'advanced'});}else{d.tmp.bad=true;advOv();const f=aq('advPw');if(f){f.value='';f.focus();}}}}
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&ADV.dlg&&e.target&&e.target.matches&&e.target.matches('.advs input')){e.preventDefault();advOkDlg();}});
document.addEventListener('input',e=>{const t=e.target;if(t&&t.matches&&t.matches('.advs input')&&ADV.dlg&&ADV.dlg.tmp){ADV.dlg.tmp[t.dataset.v]=t.value;}});
document.addEventListener('change',e=>{const t=e.target;if(t&&t.id==='advSecSel'&&ADV.dlg&&ADV.dlg.name==='display'){ADV.dlg.tmp.sec=t.value;advOv();}});
