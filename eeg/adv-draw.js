// BIS Advance screen, part 2: layout of the trend area and every plot (canvas). Loaded after adv-screen.js (which owns ADV), before
// app.js. Everything is drawn in virtual pixels of the real 1246 x 779 screen; the canvas is scaled to fit. Reads app.js globals
// (HIST, R, SIG, simT, mon, produced, FS, NB, dbToX, T0, tim ...) only when called, never at load.
const ADV_FONT='Selawik,"Segoe UI","Open Sans",system-ui,sans-serif';
const AC={bg:'#000',frame:'#5a5e66',grid:'#6a6e76',axis:'#d4d4d4',bisL:'#ec4c9c',bisR:'#04acec',emg:'#e8792c',sqi:'#40b449',sr:'#9c6cb4',eeg:'#64b47c',eegLbl:'#74a484',asym:'#7cacac',asymFill:'#344c44',asymLine:'#5ec9c0',asymRef:'#2c6f6a',mf:'#8a3f9f',burst:'#d8b890',tick:'#3b9fd8'};
// the monitor's DSA colour scale (read off the field in the manual's figures): dark blue at the weak high frequencies, light blue, teal, yellow-green, yellow, orange, red at the strong slow waves
const ADV_STOPS=[[0,0x1c,0x3f,0x9c],[.2,0x2a,0x8f,0xd8],[.4,0x55,0xc4,0xa8],[.55,0xa7,0xd4,0x4f],[.7,0xf6,0xd5,0x1a],[.85,0xf5,0x8a,0x1f],[1,0xd9,0x14,0x1c]];
const ADV_LUT=Array.from({length:256},(_,i)=>{const p=i/255;let k=0;while(k<ADV_STOPS.length-2&&p>ADV_STOPS[k+1][0])k++;const a=ADV_STOPS[k],b=ADV_STOPS[k+1],f=Math.max(0,Math.min(1,(p-a[0])/(b[0]-a[0])));return [1,2,3].map(j=>Math.round(a[j]+(b[j]-a[j])*f));});
const ADV_PX=714, ADV_X=169; // plot x range and width (both layouts)
const ADV_MMPX=143/25;       // virtual pixels per mm on the real screen at 25 mm/s

// ----- layout of the trend area: a column of headers, plots, the time axis and the EEG, as the Display Settings layout says -----
function advLay(){
 const two=ADV.ch===2,rv=!!ADV.review;
 let parts=rv?['bis','dsa']:ADV.layout[ADV.ch].split(',');
 const eeg=parts.includes('eeg');let tr=parts.filter(p=>p!=='eeg');
 const grp=!two&&tr.includes('dsa')&&tr.includes('asym');if(grp)tr=tr.filter(p=>p!=='asym');
 const S=[];
 tr.forEach((p,i)=>{
  if(p==='bis')S.push({k:'bisH',fix:two?36:37},{k:'bis',w:grp?3.35:1});
  else if(p==='dsa'){S.push({k:'dsaH',fix:two?36:37});if(grp)S.push({k:'dsaL',w:1.15},{k:'asymP',w:.7},{k:'dsaR',w:1.15});else S.push({k:'dsa',w:1});}
  else if(p==='asym')S.push({k:'asymH',fix:24},{k:'asym',w:1});
  if(i<tr.length-1)S.push({k:'gap',fix:two?4:14});});
 if(tr.length)S.push({k:'axis',fix:two?36:22});
 if(eeg){const n=ADV.nch[ADV.ch];S.push({k:'eegH',fix:two?36:32},two?{k:'eeg',w:1.04}:{k:'eeg',fix:n===1?100:n===2?146:268});}
 const top=62,bottom=eeg?(two?731:723):749;
 const fixed=S.reduce((a,s)=>a+(s.fix||0),0),wsum=S.reduce((a,s)=>a+(s.w||0),0)||1,V=bottom-top-fixed;
 let y=top;const L={two,rv,grp,trend:tr.length>0,eeg,rect:{}};
 for(const s of S){const h=s.fix!=null?s.fix:V*s.w/wsum;L.rect[s.k]={y,h};y+=h;}
 L.bottom=y;
 // EEG strips inside the eeg rectangle
 L.strips=[];if(eeg){const r=L.rect.eeg,n=ADV.nch[ADV.ch],gap=n>1?(two?18:Math.min(30,r.h*.18)):0,sh=(r.h-gap*(n-1))/n;
  const names=two?[]:n===1?[ADV.hemi==='R'?'RT':'LT']:n===2?['LT','RT']:['LT','LE','RE','RT'];
  const src=two?(n===1?['L']:['L','R']):n===1?[ADV.hemi]:n===2?['L','R']:['L','L','R','R'];
  for(let i=0;i<n;i++)L.strips.push({y:r.y+i*(sh+gap),h:sh,label:names[i]||'',side:src[i],lag:(!two&&n===4&&(i===1||i===2))?3:0});}
 return L;}
const advSecs=()=>5*25/ADV.sweep;

// ----- data for the plots: recomputed once a second (when a new column arrives), not every frame -----
function advLb(h,t){let lo=0,hi=h.length;while(lo<hi){const m=(lo+hi)>>1;if(h[m].n<t)lo=m+1;else hi=m;}return lo;}
function advSeries(h,fn,tL,win,step){const out=[],n=Math.ceil(win/step);let i=advLb(h,tL);
 for(let b=0;b<n;b++){const tb=tL+b*step,te=tb+step;let s=0,c=0;while(i<h.length&&h[i].n<te){const v=fn(h[i]);if(v!=null){s+=v;c++;}i++;}
  out.push([tb+step/2,c?s/c:null]);}
 return out;}
function advWindow(){const win=ADV.win*60,now=advNow(),el=now-ADV.t0;return {win,tL:el<win?ADV.t0:now-win};}
function advData(){
 const {win,tL}=advWindow(),W=ADV_PX,step=Math.max(10,win/(W/2)),D={win,tL,step,len:HIST.length,key:''};
 const hs={L:advHist('L'),R:advHist('R')},side=ADV.hemi;
 const sec=ADV.sec;
 D.bis=advSeries(hs[side],c=>c.sqi<15?null:c.bis,tL,win,step);
 D.bisO=advSeries(hs[side==='L'?'R':'L'],c=>c.sqi<15?null:c.bis,tL,win,step);
 D.emg=advSeries(hs[side],c=>c.emg,tL,win,step);
 D.art=advSeries(hs[side],c=>c.art||c.sqi<15?1:0,tL,win,step);
 D.srS=advSeries(hs[side],c=>c.bsr,tL,win,step);
 D.sqiS=advSeries(hs[side],c=>c.sqi,tL,win,step);
 D.bcS=advSeries(hs[side],c=>c.bc,tL,win,step);
 // ASYM: signed share of the power difference (L above the line, R below), over the same bins
 const pl=advSeries(hs.L,c=>Math.pow(10,c.tp/10),tL,win,step),pr=advSeries(hs.R,c=>Math.pow(10,c.tp/10),tL,win,step);
 D.asym=pl.map((p,i)=>{const q=pr[i];if(p[1]==null||q[1]==null)return [p[0],null];return [p[0],100*(p[1]-q[1])/(p[1]+q[1]+1e-9)];});
 // smooth ASYM a little (about 30 s)
 const k=Math.max(1,Math.round(30/step)),A=D.asym.map(x=>x[1]);D.asym=D.asym.map((p,i)=>{let s=0,c=0;for(let j=Math.max(0,i-k);j<=Math.min(A.length-1,i+k);j++)if(A[j]!=null){s+=A[j];c++;}return [p[0],p[1]==null||!c?null:s/c];});
 D.dsa={L:advDsa(hs.L,tL,win,'L'),R:advDsa(hs.R,tL,win,'R')};
 ADV.d=D;ADV.full=true;}
const advMovAvg=(a,k)=>a.map((v,i)=>{if(v==null)return null;let s=0,c=0;for(let j=Math.max(0,i-k);j<=Math.min(a.length-1,i+k);j++)if(a[j]!=null){s+=a[j];c++;}return s/c;});
const ADV_CELL=3; // DSA cell width in virtual pixels
function advDsa(h,tL,win,side){const cols=Math.floor(ADV_PX/ADV_CELL),spc=win/cols;let o=ADV.dsaCv[side];if(!o||o.cv.width!==cols){const cv=document.createElement('canvas');cv.width=cols;cv.height=NB;o=ADV.dsaCv[side]={cv,img:cv.getContext('2d').createImageData(cols,NB)};}
 // Use the simulated spectral power and the selected dB range directly. A fixed
 // low-frequency boost made an awake baseline resemble the anaesthetised pattern.
 // Average at least 10 s per column and 2.5 Hz vertically; suppressed columns are black.
 const pc=new Float32Array(NB),pc2=new Float32Array(NB);let pcOk=false;const d=o.img.data,nData=Math.max(0,Math.min(cols,Math.ceil((advNow()-tL)/spc))),sef=[],mf=[],v=new Float32Array(NB),w=new Float32Array(NB);
 for(let c=0;c<cols;c++){const te=tL+(c+1)*spc,tb=tL+c*spc;
  if(c>=nData){for(let y=0;y<NB;y++){const p=(y*cols+c)*4;d[p]=d[p+1]=d[p+2]=0;d[p+3]=255;}sef.push(null);mf.push(null);continue;}
  const i0=advLb(h,tb),i1=advLb(h,te),ia=Math.max(0,Math.min(i0,advLb(h,te-Math.max(spc,10)))),ib=Math.max(i1,ia+1);
  let own=0,sup=0,ss=0,scn=0,ms=0,mc=0,k=0;v.fill(0);
  for(let i=i0;i<i1&&i<h.length;i++){own++;const e=h[i];if(e.sp)sup++;if(e.sef!=null){ss+=e.sef;scn++;}if(e.mf!=null){ms+=e.mf;mc++;}}
  for(let i=ia;i<ib&&i<h.length;i++){const e=h[i];if(e.sp)continue;for(let b=0;b<NB;b++)v[b]+=e.db[b];k++;}
  const sf=own?sup/own:0;sef.push(scn?ss/scn:null);mf.push(mc?ms/mc:null);
  if(!k||sf>=.5){for(let y=0;y<NB;y++){const p=(y*cols+c)*4;d[p]=d[p+1]=d[p+2]=0;d[p+3]=255;}pcOk=false;continue;}
  for(let j=0;j<NB;j++)w[j]=(v[Math.max(0,j-2)]+2*v[Math.max(0,j-1)]+3*v[j]+2*v[Math.min(NB-1,j+1)]+v[Math.min(NB-1,j+2)])/(9*k);
  for(let y=0;y<NB;y++){const j=NB-1-y;let L=dbToX(w[j]);if(sf>0)L=L*(1-1.5*sf)-.1*sf;L=Math.max(0,Math.min(1,L));
   // light smoothing in time: each column keeps 25 percent of the one before it (the real field has a fine minute-to-minute grain)
   if(pc&&pcOk){L=.75*L+.25*pc[j];}pc2[j]=L;
   const col=ADV_LUT[(L*255)|0],p=(y*cols+c)*4;d[p]=col[0];d[p+1]=col[1];d[p+2]=col[2];d[p+3]=255;}
  pc.set(pc2);pcOk=true;}
 o.cv.getContext('2d').putImageData(o.img,0,0);return {cols,nData,sef:advMovAvg(sef,2),mf:advMovAvg(mf,2)};}

// ----- drawing helpers -----
function advTx(ctx,s,x,y,size,col,al,wt){ctx.font=`${wt||400} ${size}px ${ADV_FONT}`;ctx.fillStyle=col;ctx.textAlign=al||'left';ctx.textBaseline='middle';ctx.fillText(s,x,y);}
const advH=(ctx,x0,x1,y,col,dash)=>{ctx.beginPath();if(dash)ctx.setLineDash(dash);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.moveTo(x0,Math.round(y)+.5);ctx.lineTo(x1,Math.round(y)+.5);ctx.stroke();ctx.setLineDash([]);};
const advV=(ctx,x,y0,y1,col,dash)=>{ctx.beginPath();if(dash)ctx.setLineDash(dash);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.moveTo(Math.round(x)+.5,y0);ctx.lineTo(Math.round(x)+.5,y1);ctx.stroke();ctx.setLineDash([]);};
function advFrame(ctx,y,h){ctx.strokeStyle=AC.frame;ctx.lineWidth=1;ctx.strokeRect(ADV_X+.5,Math.round(y)+.5,ADV_PX,Math.round(h));}
const advXt=(D,t)=>ADV_X+(t-D.tL)/D.win*ADV_PX;
function advTicks(D){ // labelled ticks: every 10 min for 1 h, hourly for 6 h, 2-hourly for 12 h, 4-hourly for 24 h (the manual shows the 1 h scale)
 const stepMin={5:1,15:5,60:10,360:60,720:120,1440:240}[ADV.win]||10,out=[],base=Math.floor(T0/1000),a=D.tL+base,s=stepMin*60;
 for(let t=Math.ceil(a/s)*s;t<=D.tL+D.win+base+1e-6;t+=s)out.push(t-base);return out;}
function advFmtT(t,secs){const d=new Date(T0+t*1000),p=n=>String(n).padStart(2,'0');let hh=d.getHours();
 if(!ADV.hr24){const ap=hh>=12?'PM':'AM';hh=hh%12||12;return `${hh}:${p(d.getMinutes())}${secs?':'+p(d.getSeconds()):''} ${ap}`;}
 return `${hh}:${p(d.getMinutes())}${secs?':'+p(d.getSeconds()):''}`;}
function advLine(ctx,pts,yf,D,col,lw,connect){ctx.beginPath();let pen=false;ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';
 for(const [t,v] of pts){if(v==null){pen=false;continue;}const x=advXt(D,t),y=yf(v);if(pen)ctx.lineTo(x,y);else ctx.moveTo(x,y);pen=true;}ctx.stroke();}

// ----- panels -----
const ADV_SECAX={emg:{lo:30,hi:80,step:10,col:AC.emg},sr:{lo:0,hi:100,step:20,col:AC.sr},sqi:{lo:0,hi:100,step:20,col:AC.sqi},burst:{lo:0,hi:30,step:5,col:AC.burst},bis:{lo:0,hi:100,step:20,col:AC.bisR}};
// vertical gridlines at the labelled times: all alike, every third one brighter
function advGrid(ctx,D,y0,y1,dim){const tk=advTicks(D),s=({5:1,15:5,60:10,360:60,720:120,1440:240}[ADV.win]||10)*60,base=Math.floor(T0/1000);
 for(const t of tk)advV(ctx,advXt(D,t),y0,y1,Math.round((t+base)/s)%3===0?'#6a6e76':dim||'#4a4e56');}
// the shared vertical gridlines run over the DSA field too (faint, black)
function advGridDim(ctx,D,y0,y1){for(const t of advTicks(D))advV(ctx,advXt(D,t),y0,y1,'rgba(0,0,0,.32)');}
// axis labels that must not overprint: keep them in the order given, drop one that comes within gap px of one already kept
function advKeep(items,gap){const kept=[];for(const it of items)if(kept.every(k=>Math.abs(k.y-it.y)>=gap))kept.push(it);return kept;}
function advDrawBis(ctx,L,D){const r=L.rect.bis,y0=r.y,h=r.h,Y=v=>y0+h*(1-v/100),bc=ADV.hemi==='R'?AC.bisR:AC.bisL;
 // target range band (only when the BIS range alarm is on)
 const A=ADV.alarm.bis;if(A.on){const g=ctx.createLinearGradient(ADV_X,0,ADV_X+ADV_PX,0);g.addColorStop(0,'rgba(150,150,150,.55)');g.addColorStop(.4,'rgba(150,150,150,.35)');g.addColorStop(1,'rgba(150,150,150,.05)');ctx.fillStyle=g;ctx.fillRect(ADV_X,Y(A.hi),ADV_PX,Y(A.lo)-Y(A.hi));}
 advGrid(ctx,D,y0,y0+h);
 // stretches with no usable EEG (artefact, SQI under 15) as dark blue-grey bands, as the monitor marks a gap in the data
 ctx.fillStyle='rgba(43,53,71,.85)';for(const [t,v] of D.art)if(v!=null&&v>=.5){const x=advXt(D,t-D.step/2);ctx.fillRect(x,y0,Math.max(3,ADV_PX*D.step/D.win),h);}
 advFrame(ctx,y0,h);
 const fs=L.two?15.5:15;
 for(let v=0;v<=100;v+=20)advTx(ctx,String(v),ADV_X-7,Math.max(y0+7,Math.min(y0+h-5,Y(v))),fs,AC.axis,'right');
 const sec=ADV.sec,ax=ADV_SECAX[sec==='bisO'?'bis':sec];
 if(ax){const sy=v=>y0+h*(1-(v-ax.lo)/(ax.hi-ax.lo));for(let v=ax.lo;v<=ax.hi;v+=ax.step)advTx(ctx,String(v),ADV_X+ADV_PX+9,Math.max(y0+7,Math.min(y0+h-5,sy(v))),fs,sec==='emg'?AC.emg:AC.axis,'left');
  const pts=sec==='emg'?D.emg:sec==='sr'?D.srS:sec==='sqi'?D.sqiS:sec==='burst'?D.bcS:D.bisO;
  if(sec==='sr'&&ADV.alarm.sr.on){advH(ctx,ADV_X,ADV_X+ADV_PX,sy(ADV.alarm.sr.hi),AC.sr,[6,4]);}
  advLine(ctx,pts,sy,D,sec==='emg'?'#d8843a':sec==='bisO'?AC.bisR:ax.col,1.2);}
 advLine(ctx,D.bis,Y,D,bc,1.9);}
function advDrawAxis(ctx,L,D){const r=L.rect.axis,y0=r.y,h=r.h;ctx.fillStyle='#000';ctx.fillRect(115,y0,817,h);
 // the time axis is a bordered strip: grey lines along the top and the bottom across the whole width (the left gutter too), a tick at every
 // label running the strip's height, and the label (left aligned, 6 px after its tick)
 advH(ctx,115,932,y0,'#5a5f66');advH(ctx,115,932,y0+h-1,'#5a5f66');advV(ctx,160,y0,y0+h,'#2a2f36');
 const ticks=advTicks(D),fs=L.two?14:13.5;
 for(const t of ticks){const x=advXt(D,t);advV(ctx,x,y0+1,y0+h-1,'#aaa');advTx(ctx,advFmtT(t),x+6,y0+h/2+1,fs,'#d8d8d8','left');}
 advV(ctx,ADV_X,y0+1,y0+h-1,'#aaa');
 // case start (white triangle) and now (blue tick)
 if(ADV.t0>=D.tL-1){const x=advXt(D,ADV.t0);ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(x+1,y0+h-10);ctx.lineTo(x+1,y0+h-2);ctx.lineTo(x+9,y0+h-2);ctx.closePath();ctx.fill();}
 if(advNow()>=D.tL){const x=Math.round(advXt(D,advNow()))+.5;ctx.strokeStyle=AC.tick;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y0+h-14);ctx.lineTo(x,y0+h);ctx.stroke();}
 for(const s of ADV.snaps){if(s.t>=D.tL&&s.t<=D.tL+D.win){const x=advXt(D,s.t);ctx.fillStyle='#8cc4ff';ctx.fillRect(x,y0+2,1.5,10);ctx.fillRect(x,y0+2,6,4);}}}
function advDrawDsa(ctx,L,D,side,y0,h,mirror,title){const small=h<130,fs=small?11.5:15.5;const o=ADV.dsaCv[side],ds=D.dsa[side],hz=v=>mirror?y0+h*(v/30):y0+h*(1-v/30);
 ctx.fillStyle='#000';ctx.fillRect(ADV_X,y0,ADV_PX,h);
 const dw=ADV_PX*ds.nData/ds.cols;if(o&&ds.nData){ctx.imageSmoothingEnabled=false;ctx.save();if(mirror){ctx.translate(0,y0+h/2);ctx.scale(1,-1);ctx.translate(0,-(y0+h/2));}ctx.drawImage(o.cv,0,0,ds.nData,NB,ADV_X,y0,dw,h);ctx.restore();}
 advGridDim(ctx,D,y0,y0+h);for(const f of [13,8,4])advH(ctx,ADV_X,ADV_X+ADV_PX,hz(f),'rgba(0,0,0,.8)');
 // SEF (white, 1.5 px) and MF (purple, 1.5 px) as stepped lines
 const cw=ADV_PX/ds.cols,step=(arr,col,lw)=>{ctx.beginPath();ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='miter';let pen=false,py=0;
  for(let c=0;c<ds.nData;c++){const v=arr[c];if(v==null){pen=false;continue;}const x=ADV_X+c*cw,y=hz(Math.max(0,Math.min(30,v)));if(!pen){ctx.moveTo(x,y);}else{ctx.lineTo(x,py);ctx.lineTo(x,y);}ctx.lineTo(x+cw,y);pen=true;py=y;}ctx.stroke();};
 step(ds.mf,AC.mf,1.5);step(ds.sef,'#fff',1.5);
 advFrame(ctx,y0,h);
 // Hz labels at 30, 13, 8, 4 (and 0 on a tall plot), none closer than 12 px: a short plot drops the 8 first, then the 4
 const pos=f=>Math.max(y0+7,Math.min(y0+h-6,hz(f))),want=small?[30,13,4,8]:[30,13,8,4,0];
 const items=advKeep(want.map(f=>({f,y:f===30?(mirror?y0+h-6:y0+7):pos(f)})),12);
 for(const {f,y} of items){if(f===30){advTx(ctx,'30',ADV_X-7,y,fs,AC.axis,'right');advTx(ctx,'Hz',ADV_X-7-fs*1.55,y,fs-1.5,AC.axis,'right');}else advTx(ctx,String(f),ADV_X-7,y,fs,AC.axis,'right');}
 if(ADV.review&&ADV.review.t!=null&&!mirror)ADV.rvDsa={y0,h};}
function advDrawAsym(ctx,L,D,y0,h,group){const small=h<130,fs=small?12:15.5;const Y=v=>y0+h/2-h/2*v/100;ctx.fillStyle='#000';ctx.fillRect(ADV_X,y0,ADV_PX,h);
 // hatched dead band +-20
 const b0=Y(20),b1=Y(-20);ctx.save();ctx.beginPath();ctx.rect(ADV_X,b0,ADV_PX,b1-b0);ctx.clip();ctx.strokeStyle='#1c1c1c';ctx.lineWidth=1.4;ctx.beginPath();for(let x=ADV_X-60;x<ADV_X+ADV_PX+60;x+=6){ctx.moveTo(x,b1);ctx.lineTo(x+(b1-b0),b0);}ctx.stroke();ctx.restore();
 advGrid(ctx,D,y0,y0+h,'#2a2e34');
 // thin lines only at +-60 and at the edges of the +-20 band, a light line at 0
 for(const v of [60,-60,20,-20])advH(ctx,ADV_X,ADV_X+ADV_PX,Y(v),'#333');
 advH(ctx,ADV_X,ADV_X+ADV_PX,Y(0),'rgba(212,212,212,.6)');
 // filled areas where |ASYM| is 20 or more
 const side=(sg)=>{let run=[];const flush=()=>{if(run.length>1){ctx.beginPath();run.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.lineTo(run[run.length-1][0],Y(20*sg));ctx.lineTo(run[0][0],Y(20*sg));ctx.closePath();ctx.fillStyle=AC.asymFill;ctx.fill();
    ctx.beginPath();run.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=AC.asymLine;ctx.lineWidth=1.4;ctx.stroke();}run=[];};
  for(const [t,v] of D.asym){if(v==null||v*sg<20){flush();continue;}run.push([advXt(D,t),Y(Math.max(-100,Math.min(100,v)))]);}flush();};
 side(1);side(-1);
 if(group){ctx.strokeStyle=AC.asymRef;ctx.lineWidth=1.5;for(const yy of [y0,y0+h]){ctx.beginPath();ctx.moveTo(ADV_X,Math.round(yy)+.5);ctx.lineTo(ADV_X+ADV_PX,Math.round(yy)+.5);ctx.stroke();}}
 else advFrame(ctx,y0,h);
 const lab=[[100,'% 100'],[-100,'% 100'],[0,'0'],[60,'60'],[-60,'60'],[20,'20'],[-20,'20']];
 for(const {v,t,y} of advKeep(lab.map(([v,t])=>({v,t,y:Math.max(y0+7,Math.min(y0+h-6,Y(v)))})),small?11:13)){advTx(ctx,t.replace('% ',''),ADV_X-7,y,fs,AC.axis,'right');if(t.startsWith('%'))advTx(ctx,'%',ADV_X-7-fs*1.8,y,fs-2,AC.axis,'right');}
 // L and R markers at the right edge
 for(const [t,yy,c] of [['L',Y(60),AC.bisL],['R',Y(-60),AC.bisR]]){const x=ADV_X+ADV_PX+31;ctx.beginPath();ctx.arc(x,yy,11.5,0,7);ctx.fillStyle='#44546c';ctx.fill();advTx(ctx,t,x,yy+.5,14,c,'center');}}
function advEegSig(side){return side==='R'?{sig:R.SIG,prod:R.produced}:{sig:SIG,prod:produced};}
// What the monitor shows of the EEG: the real trace is a 1 px jagged line, slow delta/theta waves (about a quarter to a third of the frame, about +-20 uV
// in general anaesthesia) with a 20-40 Hz hash on them and a drifting amplitude. The engine's signal is smoothed a little (a 5-tap kernel), a rough
// share of the fast residue is kept, and a band-limited noise (4 to 5 percent of the frame, a fresh value every sample, fixed by the sample's own number so
// the trace does not shimmer as it scrolls) and a slow amplitude envelope are added. A soft limit keeps normal waves under half the half-height.
const ADV_EEG_GAIN=.55,ADV_EEG_FUZZ=.16;
const advHash=i=>{i=Math.imul(i^(i>>>16),0x7feb352d);i=Math.imul(i^(i>>>15),0x846ca68b);i^=i>>>16;return (i>>>0)/4294967296;};
const advNoise=i=>(advHash(i)+advHash(i+7919)+advHash(i+104729)-1.5)*2; // about N(0,1)
const advEnv=t=>Math.max(.5,Math.min(1.35,.8+.22*Math.sin(t*.27+1.1)+.16*Math.sin(t*.91+.4)+(advHash(Math.floor(t/5)+3)>.82?.3:0)));
function advEegSoftPx(p,hh){const T=.3*hh,M=.5*hh,a=Math.abs(p);let o=a<=T?a:T+(M-T)*Math.tanh((a-T)/(M-T));if(a>3.2*hh)o+=.4*hh*Math.tanh((a-3.2*hh)/(3*hh));return Math.sign(p)*o;}
function advDrawEeg(ctx,L){if(!L.eeg)return;const r=L.rect.eeg,secs=advSecs(),N=Math.round(secs*FS),two=L.two,uvmm=ADV.uvmm[ADV.ch],pxuv=ADV_MMPX/uvmm;
 ctx.fillStyle='#000';ctx.fillRect(115,r.y-1,817,r.h+2);
 const lab=ADV.layout[ADV.ch]==='eeg'?100:50; // the frame's scale is fixed (+-50 uV, +-100 uV with the EEG alone); the uV/mm selector changes the gain
 L.strips.forEach((s,si)=>{const cy=s.y+s.h/2,hh=s.h/2,X1=ADV_X+ADV_PX,{sig,prod}=advEegSig(s.side);
  advFrame(ctx,s.y,s.h);
  // 1 s dotted gridlines fixed to the frame (the trace scrolls past them, as on the real monitor: owner, 19 Oct 2026), the zero line
  for(let q=1;q<secs;q++){const x=X1-q/secs*ADV_PX;if(x>ADV_X+2)advV(ctx,x,s.y+1,s.y+s.h-1,'#5a5e66',[1,3]);}
  advH(ctx,ADV_X+1,ADV_X+ADV_PX,cy,'#555');
  if(si===0||!two){advTx(ctx,'µV '+lab,162,s.y+8,15,AC.axis,'right');advTx(ctx,'-'+lab,162,s.y+s.h-8,15,AC.axis,'right');}
  if(s.label)advTx(ctx,s.label,142,cy,15.5,AC.axis,'center');
  ctx.save();ctx.beginPath();ctx.rect(ADV_X+1,s.y+1,ADV_PX-1,s.h-1);ctx.clip();ctx.strokeStyle='#5fcf8b';ctx.globalAlpha=.9;ctx.lineWidth=1;ctx.lineJoin='round';ctx.beginPath();
  const len=sig.length,lag=s.lag||0,gain=(s.lag?.9:1)*ADV_EEG_GAIN,at=i=>sig[Math.max(0,Math.min(len-1-lag,i))],n0=Math.min(N,len-lag),nz=ADV.disc,nzA=(ADV.filters?.055:.1)*hh;
  for(let k=0;k<n0;k++){const i=len-1-lag-(n0-1-k),ai=prod-1-lag-(n0-1-k)+(s.side==='R'?500009:0);let p=0;
   if(nz)p=advNoise(ai)*.004*hh;
   else{const lp=(at(i-1)+2*at(i)+at(i+1))/4,v=gain*(lp+(ADV.filters?ADV_EEG_FUZZ:.5)*(at(i)-lp));p=advEegSoftPx(v*pxuv*advEnv(ai/FS),hh)+(advNoise(ai)+.8*advNoise(ai-1))*.8*nzA;}
   const x=X1-(n0-1-k)/N*ADV_PX,y=cy-Math.max(-hh+1,Math.min(hh-1,p));if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
  ctx.stroke();ctx.restore();});
 if(ADV.demo)advWatermark(ctx,L);}
// ----- the whole trend area -----
function advDrawAll(full){const c=document.getElementById('advCv');if(!c)return;const w=c.clientWidth;if(!w)return;
 const dpr=Math.min(2,window.devicePixelRatio||1),pw=Math.round(w*dpr),ph=Math.round(w*779/1246*dpr);if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph;full=true;}
 const ctx=c.getContext('2d'),k=pw/1246;ctx.setTransform(k,0,0,k,0,0);
 const L=ADV.lay||(ADV.lay=advLay());if(!ADV.d)advData();const D=ADV.d;
 if(full||ADV.full){ctx.fillStyle='#000';ctx.fillRect(0,0,1246,779);
  if(ADV.view==='graphs'){const r=L.rect;
   if(r.bis)advDrawBis(ctx,L,D);
   if(L.grp){advDrawDsa(ctx,L,D,'L',r.dsaL.y,r.dsaL.h,false);advDrawDsa(ctx,L,D,'R',r.dsaR.y,r.dsaR.h,true);advDrawAsym(ctx,L,D,r.asymP.y,r.asymP.h,true);}
   else if(r.dsa)advDrawDsa(ctx,L,D,ADV.hemi,r.dsa.y,r.dsa.h,false);
   if(r.asym)advDrawAsym(ctx,L,D,r.asym.y,r.asym.h,false);
   if(r.axis)advDrawAxis(ctx,L,D);
   advH(ctx,115,932,L.eeg?L.rect.eegH.y:749,'#2a2f36');
   advReviewCursor(ctx,L,D);if(ADV.review)advReviewInfo(ctx,L);}
  ADV.full=false;}
 if(ADV.view==='graphs'&&L.eeg)advDrawEeg(ctx,L);}
function advWatermark(ctx,L){ctx.save();ctx.fillStyle='rgba(120,120,70,.5)';ctx.font=`400 22px ${ADV_FONT}`;ctx.textAlign='center';ctx.textBaseline='middle';
 const r=L.rect.eeg||L.rect.bis||L.rect.dsa;if(r)ctx.fillText('DEMO MODE',ADV_X+ADV_PX/2,r.y+r.h*.78);ctx.restore();}
// the case's facts, in a block over the BIS trend while reviewing (labels in one column, values in the next)
function advReviewInfo(ctx,L){const r=L.rect.bis;if(!r)return;const dur=Math.max(0,Math.round((advNow()-ADV.t0)/60)),d=new Date(T0+ADV.t0*1000),hh=Math.floor(dur/60),mm=dur%60;
 const rows=[['DATE :',advDate(ADV.t0)],['START TIME:',d.getHours()+':'+apad(d.getMinutes())],['DURATION:',hh+':'+apad(mm)+' hrs'],['CASE ID:',ADV.caseId]],x=ADV_X+46,y=r.y+r.h*.36;
 rows.forEach(([a,v],i)=>{advTx(ctx,a,x,y+i*31,17,'#e8e8e8','left');advTx(ctx,v,x+106,y+i*31,17,'#e8e8e8','left');});}
function advReviewCursor(ctx,L,D){const R_=ADV.review;if(!R_||R_.t==null)return;const x=Math.round(advXt(D,R_.t))+.5,r=L.rect;if(x<ADV_X||x>ADV_X+ADV_PX)return;
 const y0=r.bis.y,y1=(r.dsa||r.dsaR||r.axis).y+((r.dsa||r.dsaR||r.axis).h);ctx.strokeStyle='#e8281e';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.stroke();
 ctx.save();ctx.fillStyle='rgba(120,120,70,.5)';ctx.font=`400 22px ${ADV_FONT}`;ctx.textAlign='center';ctx.fillText('CASE REVIEW MODE',ADV_X+ADV_PX*.55,r.bis.y+r.bis.h*.9);ctx.restore();}
