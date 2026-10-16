// Masimo SedLine screen (the 'sedline' skin), part 2: data for the plots and every drawing. The real screen is 800 x 1280 (Root, portrait);
// everything is drawn in those design pixels and the two canvases are scaled to fit. Loaded after sed-screen.js (which owns SED), before app.js.
// Reads app.js globals (HIST, R, SIG, simT, mon, produced, FS, NB, DB_LO, DB_HI, T0, tim, psiOf ...) only when called, never at load.
const SED_FONT='Hind,"Frutiger","Segoe UI",system-ui,sans-serif';
const SC={bg:'#100f0d',sep:'#2b2a2a',yel:'#f9ca07',unit:'#f4c609',dim:'#5c5c5e',lt:'#afafae',eeg:'#131924',dot:'#f3d314',red:'#ed1c24',gold:'#f9ca07'};
// the spectrogram's colour scale, read off the colour bar of a native screenshot (red = strongest, deep indigo = weakest), quantised to 51 steps
const SED_STOPS=[[0,[0xed,0x1c,0x24]],[.0625,[0xef,0x31,0x20]],[.125,[0xf4,0x71,0x16]],[.1875,[0xfa,0xbf,0x09]],[.25,[0xeb,0xec,0x06]],[.3125,[0xae,0xda,0x19]],[.375,[0x80,0xcc,0x28]],[.4375,[0x63,0xc4,0x31]],[.5,[0x58,0xc0,0x34]],[.5625,[0x5c,0xc1,0x33]],[.625,[0x64,0xc6,0x55]],[.6875,[0x6c,0xcb,0x9c]],[.75,[0x78,0xd2,0xdc]],[.8125,[0x58,0xc2,0xf0]],[.875,[0x45,0x72,0xc1]],[.9375,[0x3a,0x51,0xab]],[1,[0x33,0x49,0xa5]]];
const sedStopAt=p=>{let k=0;while(k<SED_STOPS.length-2&&p>SED_STOPS[k+1][0])k++;const a=SED_STOPS[k],b=SED_STOPS[k+1],f=Math.max(0,Math.min(1,(p-a[0])/(b[0]-a[0])));return a[1].map((v,j)=>Math.round(v+(b[1][j]-v)*f));};
const SED_LUT=Array.from({length:51},(_,i)=>sedStopAt(1-i/50)); // index 0 = weakest (blue) ... 50 = strongest (red)
const NPX=504,PX0=50,PX1=554,DW=685,DX=50,LH=150; // trend plot columns and x range; DSA width and x; DSA height of one side
const clampv=(v,a,b)=>Math.max(a,Math.min(b,v)),pad2=n=>String(n).padStart(2,'0');
const sedSmooth=(a,n)=>a.map((v,i)=>{if(v==null)return null;let s=0,c=0;for(let j=i-n+1;j<=i;j++){if(j>=0&&a[j]!=null){s+=a[j];c++;}}return s/c;});
function sT(c,s,x,y,size,col,al,wt,it,sx){c.font=`${it?'italic ':''}${wt||400} ${size}px ${SED_FONT}`;c.fillStyle=col;c.textAlign=al||'left';c.textBaseline='alphabetic';if(sx&&sx!==1){c.save();c.translate(x,y);c.scale(sx,1);c.fillText(s,0,0);c.restore();}else c.fillText(s,x,y);}
function sRR(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
// ----- time -----
const sedClock=(t,secs,force24)=>{const d=new Date(T0+t*1000);let h=d.getHours();const h24=force24!=null?force24:SED.set.clock24;
 if(h24)return pad2(h)+':'+pad2(d.getMinutes())+(secs?':'+pad2(d.getSeconds()):'');const ap=h>=12?' PM':' AM';h=h%12||12;return h+':'+pad2(d.getMinutes())+(secs?':'+pad2(d.getSeconds()):'')+ap;};
const sedHms=t=>{const d=new Date(T0+t*1000);return pad2(d.getHours())+':'+pad2(d.getMinutes())+':'+pad2(d.getSeconds());};
const sedHm=t=>{const d=new Date(T0+t*1000);return pad2(d.getHours())+':'+pad2(d.getMinutes());};
const sedDate=t=>{const d=new Date(T0+t*1000),y=pad2(d.getFullYear()%100),m=pad2(d.getMonth()+1),dd=pad2(d.getDate());return SED.set.dateFmt==='DD/MM/YY'?`${dd}/${m}/${y}`:`${m}/${dd}/${y}`;};
// ----- layout of the window (design pixels) -----
const SED_PARAMS=['emg','psi','sr','artf','sefl','sefr','st'];
const SED_NAME={emg:'EMG',psi:'PSI',sr:'SR',artf:'ARTF',sefl:'SEFL',sefr:'SEFR',st:'ST'},SED_UNIT={emg:'%',psi:'',sr:'%',artf:'%',sefl:'Hz',sefr:'Hz',st:'HH:MM'};
const sedUnit=k=>k==='st'&&SED.set.stUnit==='%'?'%':SED_UNIT[k];
const SED_SHARE=[.28,.38,.65,.78,.87,1]; // the SedLine window's share of the Root screen in layouts 1-6 (layout 6: SedLine alone)
function sedLay(){const alt=SED.set.placement==='EEG/DSA/PSi',ps=SED_PARAMS.filter(k=>k!=='st'||SED.set.smart),lay=SED.set.layout||6;
 if(lay<6){ // a shared screen: the window shows one view (TREND, EEG, DSA or ANALOG) over a compact numeric row
  const Hw=Math.round(1107*SED_SHARE[lay-1]),wy=80+1107-Hw,rowH=64,rowY=1187-rowH-6,cy=wy+32,ch=rowY-cy-4,v=['trend','eeg','dsa','analog'].includes(SED.view)?SED.view:'trend';
  const L={alt:false,compact:true,wy,Hw,view:v,cy,ch,trendY:cy,trendH:ch,dsaY:cy,dsaH:0,rows:[],well:[],wellY:rowY,wellH:0,cwell:ps,cwY:rowY,cwH:rowH,eeg:null,dsa:null,gauge:null};
  if(v==='eeg')L.eeg={y:cy,h:ch};
  else if(v==='dsa'){const ah=Math.min(53,Math.round(ch*.14)),lh=Math.floor((ch-ah-20)/2);L.dsa={y:cy,lh,ah};L.dsaH=2*lh+ah+20;}
  else if(v==='analog')L.gauge={y:cy,s:Math.min(1,ch/322)};
  else{let ex=ps.filter(k=>k!=='st'&&SED.exp[k]).slice(0,3);if(!ex.length)ex=['psi'];const wsum=ex.reduce((a,k)=>a+(k==='psi'?3:1),0);let y=cy;for(const k of ex){const h=ch*(k==='psi'?3:1)/wsum;L.rows.push({k,y,h});y+=h;}}
  return L;}
 const L={alt,compact:false,wy:80,view:SED.view==='analog'?'analog':'trend',dsaY:alt?412:812,dsaH:373,trendY:alt?790:410,trendH:322,rows:[],well:[],wellH:72,eeg:{y:110,h:300},gauge:null};
 L.dsa={y:L.dsaY,lh:LH,ah:53};
 if(L.view==='analog'){L.wellY=L.trendY+322;L.well=ps.filter(k=>k==='artf'||k==='sefl'||k==='sefr'||k==='st');L.gauge={y:410,s:1};return L;}
 // with every other parameter expanded, the PSi goes into the well by itself and the rows share the height evenly (as on the real screen); an empty well gives its height to the rows
 let ex=ps.filter(k=>SED.exp[k]);if(ps.filter(k=>k!=='psi').every(k=>SED.exp[k]))ex=ex.filter(k=>k!=='psi');
 L.well=ps.filter(k=>!ex.includes(k));if(!L.well.length){L.wellH=0;L.trendH=394;}
 L.wellY=L.trendY+L.trendH;
 const wsum=ex.reduce((a,k)=>a+(k==='psi'?3:1),0)||1;let y=L.trendY;
 for(const k of ex){const h=L.trendH*(k==='psi'?3:1)/wsum;L.rows.push({k,y,h});y+=h;}
 return L;}
// ----- the series behind the plots -----
const sedLb=(h,t)=>{let lo=0,hi=h.length;while(lo<hi){const m=(lo+hi)>>1;if(h[m].n<t)lo=m+1;else hi=m;}return lo;};
// history of one side: the seeded earlier trend, then the live columns (never touches HIST)
function sedHist(s){const live=s==='R'?R.HIST:HIST,p=(SED.pre&&SED.pre[s])||[],c=SED.hc||(SED.hc={}),k=c[s],last=live.length?live[live.length-1].n:-1;
 if(k&&k.len===live.length&&k.last===last&&k.p===p)return k.arr;const arr=p.length?p.concat(live):live.slice();c[s]={len:live.length,last,p,arr};return arr;}
// ASYM: signed percent difference of the left and right EEG power (positive: the left side is stronger); tp is total power in dB
const sedAsym=(tpL,tpR)=>{const pl=Math.pow(10,tpL/10),pr=Math.pow(10,tpR/10);return 100*(pl-pr)/(pl+pr+1e-9);};
const emgPct=e=>clampv(Math.round((e.emg-SED.emgOff())*100/SED.emgSpan()),0,100);
const sedGap=n=>{for(const g of SED.gaps)if(n>=g[0]&&n<=(g[1]==null?1e12:g[1]))return true;return false;};
// per-second values of the shown parameters from one pair of columns (null = not available)
function sedVals(l,r,artfPct){const blankL=l.sqi<15||l.bis==null,blankR=r.sqi<15||r.bis==null,out={};
 const bl=blankL?null:l.bis,br=blankR?null:r.bis,m=bl!=null&&br!=null?(bl+br)/2:bl!=null?bl:br;
 out.psi=m==null||artfPct>50?null:psiOf(m);out.emg=Math.max(emgPct(l),emgPct(r));out.sr=(l.bsr+r.bsr)/2;out.artf=artfPct;out.sefl=l.sef!=null&&!blankL?l.sef:null;out.sefr=r.sef!=null&&!blankR?r.sef:null;out.st=Math.max(l.st||0,r.st||0);return out;}
function sedData(){const hL=sedHist('L'),hR=sedHist('R'),now=simT,tE=SED.hold==null?now:Math.min(now,SED.hold),W=SED.range*60,tS=tE-W,sp=W/NPX,D={tE,tS,W,sp,now,len:hL.length,ser:{}};
 for(const k of SED_PARAMS)D.ser[k]={s:new Float32Array(NPX),c:new Uint16Array(NPX)};
 let i0=Math.max(0,sedLb(hL,tS)-60),ring=[],rs=0;
 for(let i=i0;i<hL.length&&i<hR.length;i++){const l=hL[i],r=hR[i];if(l.n>tE)break;
  const a=l.art||l.sqi<15||r.art?1:0;ring.push(a);rs+=a;if(ring.length>60)rs-=ring.shift();
  if(l.n<tS)continue;const p=Math.floor((l.n-tS)/sp);if(p<0||p>=NPX||sedGap(l.n))continue;
  const v=sedVals(l,r,100*rs/ring.length);for(const k of SED_PARAMS){if(v[k]==null)continue;const q=D.ser[k];q.s[p]+=v[k];q.c[p]++;}}
 // fill: the mean per column (null where none), with the newest column carried to the right edge
 for(const k of SED_PARAMS){const q=D.ser[k],o=new Array(NPX);for(let p=0;p<NPX;p++)o[p]=q.c[p]?q.s[p]/q.c[p]:null;D.ser[k]=o;}
 D.hL=hL;D.hR=hR;D.start=hL.length?hL[0].n:now;return D;}
// numbers shown now (the live second; the scroll position does not change them)
function sedNums(){const hL=sedHist('L'),hR=sedHist('R'),n=Math.min(hL.length,hR.length);if(!n)return null;const l=hL[n-1],r=hR[n-1],blank=SED.sim.disc||SED.sim.off||SED.sim.none;
 let a=0;for(let i=Math.max(0,n-60);i<n;i++)if(hL[i].art||hL[i].sqi<15||hR[i].art)a++;const artf=100*a/Math.min(60,n),v=sedVals(l,r,artf);
 let pl=0,pr=0;for(let i=Math.max(0,n-30);i<n;i++){pl+=Math.pow(10,hL[i].tp/10);pr+=Math.pow(10,hR[i].tp/10);}const as=sedAsym(10*Math.log10(pl+1e-9),10*Math.log10(pr+1e-9));
 return {v,blank,asym:as,l,r,sqiMin:Math.min(l.sqi,r.sqi)};}
// ----- the DSA (two spectrograms and the ASYM strip), one image per side, repainted when a column arrives -----
// cells of 3 px (time) by 3 px (frequency): 228 columns and 50 rows per 685 x 150 panel, nearest neighbour, about 51 colours, no smoothing
const SED_CW=3,SED_COLS=Math.ceil(DW/SED_CW),SED_ROWS=LH/3;
function sedHash(a,b,c){let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(c|0,1274126177)|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return(h>>>0)/4294967296;}
// sedated and anaesthetised data: the power piles up below about 8 Hz (red and orange), 10-16 Hz is green, 20 Hz is teal, 24 Hz and above is blue.
// dep (0 awake ... 1 sedated or anaesthetised) blends the picture's colour position toward that profile; the awake picture is left as it was
const SED_PROF=[[0,1],[2,1],[8,.83],[10,.62],[13,.52],[16,.44],[20,.36],[24,.14],[30,.07],[40,.03]];
function sedProf(f){let i=0;while(i<SED_PROF.length-2&&f>SED_PROF[i+1][0])i++;const a=SED_PROF[i],b=SED_PROF[i+1];return a[1]+(b[1]-a[1])*clampv((f-a[0])/(b[0]-a[0]),0,1);}
function sedPaintDsa(D){const hz=SED.set.maxHz,hi=SED.set.dsaHi,lo=SED.set.dsaLo,mt=SED.set.dsaType==='Multitaper',cs=1200/SED_COLS,tEq=Math.ceil(D.tE/cs)*cs,tS=tEq-1200,c0=Math.round(tS/cs),rows=LH,nr=SED_ROWS;
 D.tS3=tS;D.cs3=cs;
 for(const s of ['L','R']){let o=SED['cv'+s];if(!o){const cv=document.createElement('canvas');cv.width=DW;cv.height=LH;o=SED['cv'+s]={cv,img:cv.getContext('2d').createImageData(DW,LH)};}
  const h=s==='L'?D.hL:D.hR,d=o.img.data,cj=new Int32Array(SED_COLS).fill(-1),flag=new Uint8Array(SED_COLS),sef=new Float32Array(SED_COLS).fill(-1);d.fill(0);for(let i=3;i<d.length;i+=4)d[i]=255;
  const i0=sedLb(h,tS);
  for(let j=i0;j<h.length;j++){const c=h[j];if(c.n>D.tE)break;const x=Math.floor((c.n-tS)/cs);if(x<0||x>=SED_COLS)continue;
   const gap=sedGap(c.n),sqibad=c.sqi<15;
   if(gap||sqibad){flag[x]=Math.max(flag[x],1);continue;}
   if(c.art&&SED.set.dsaArt){flag[x]=Math.max(flag[x],3);}
   if(c.sp){flag[x]=Math.max(flag[x],2);continue;}
   cj[x]=j;if(c.sef!=null)sef[x]=c.sef;}
  // one cell = the newest second that falls in it. Hanning: a single noisy periodogram (speckle). Multitaper: smoother, with sharper band edges
  const sig=mt?.7:2.7;
  for(let x=0;x<SED_COLS;x++){const j=cj[x];if(j<0)continue;const pv=h[j-1],nx=h[j+1],bins=h[j].db,ab=c0+x,dep=h[j].bis==null?0:clampv((88-h[j].bis)/34,0,1);
   for(let r=0;r<nr;r++){const f=((s==='L'?nr-1-r:r)+.5)*hz/nr,b=f/0.5;let v;
    const g=(q,bb)=>{const k=Math.min(NB-2,Math.floor(bb)),fr=Math.min(1,bb-k);return q[k]*(1-fr)+q[k+1]*fr;};
    if(b>=NB-1){const last=g(bins,NB-1.001);v=last-.8*(b-(NB-1));}else if(mt&&pv&&nx&&pv.db&&nx.db)v=.5*g(bins,b)+.25*(g(pv.db,b)+g(nx.db,b));else v=g(bins,b);
    v+=(sedHash(ab,r,s==='L'?1:2)+sedHash(ab,r,s==='L'?3:4)-1)*2.45*sig;
    const real=-35+2.1*v;let fr2=clampv((real-lo)/(hi-lo),0,1);if(mt)fr2=clampv(.5+(fr2-.5)*1.3,0,1);
    if(dep>0.02)fr2=clampv(fr2+(sedProf(f)+(fr2-.3)*.45-fr2)*Math.min(1,dep*.9),0,1);const q=SED_LUT[Math.round(fr2*50)];
    for(let dy=0;dy<3;dy++)for(let dx=0;dx<SED_CW;dx++){const px=x*SED_CW+dx;if(px>=DW)continue;const i=((r*3+dy)*DW+px)*4;d[i]=q[0];d[i+1]=q[1];d[i+2]=q[2];}}}
  const cx=o.cv.getContext('2d');cx.putImageData(o.img,0,0);
  // flagged columns: artefact (a white line), suppression (a black bar with a blue tick at the 0 Hz edge), no data (a black bar)
  for(let x=0;x<SED_COLS;x++){const f=flag[x];if(!f)continue;const px=x*SED_CW+1;
   if(f===3){cx.fillStyle='#fff';cx.fillRect(px-1,0,3,rows);}
   else{cx.fillStyle='#000';cx.fillRect(px-3,0,7,rows);if(f===2){cx.fillStyle='#3349a5';cx.fillRect(px-3,s==='L'?rows-4:0,7,4);}}}
  // while no data is arriving the black bar grows with the time, to the right edge (at least 8 px wide), with no blue tick
  if(SED._gapOpen!=null&&SED.hold==null){const g0=SED.gaps[SED.gaps.length-1][0],gx=clampv(Math.floor((g0-tS)/cs)*SED_CW,0,DW-8);cx.fillStyle='#000';cx.fillRect(Math.min(gx,DW-8),0,DW,rows);}
  // the 95% spectral edge as a white stair line: smoothed over a few seconds, steps of 1 Hz, kept 3 px inside the panel
  const th=SED.set.sefThick;cx.fillStyle='#fff';let py=null,sm=null;
  for(let x=0;x<SED_COLS;x++){if(flag[x]===1||flag[x]===2||sef[x]<0){py=null;sm=null;continue;}sm=sm==null?sef[x]:sm*.88+sef[x]*.12;const hzv=Math.round(sm);let y=s==='L'?rows-hzv*rows/hz:hzv*rows/hz;y=clampv(y,3+th/2,rows-3-th/2);
   const px=x*SED_CW;cx.fillRect(px,Math.round(y-th/2),SED_CW,th);if(py!=null&&py!==y)cx.fillRect(px,Math.round(Math.min(y,py)-th/2),1,Math.abs(y-py)+th);py=y;}}
 // ASYM: signed, white filled area (up where the left side is stronger), grey bars where artefact marked the DSA
 let a=SED.cvA;if(!a){const cv=document.createElement('canvas');cv.width=DW;cv.height=53;a=SED.cvA={cv};}
 const cx=a.cv.getContext('2d'),H=53,mid=26,sp=1200/DW;cx.fillStyle='#100f0d';cx.fillRect(0,0,DW,H);
 const hL=D.hL,hR=D.hR,i0=sedLb(hL,tS),vals=new Float32Array(DW).fill(NaN),art=new Uint8Array(DW),cnt=new Uint16Array(DW);
 for(let j=i0;j<hL.length&&j<hR.length;j++){const l=hL[j],r=hR[j];if(l.n>D.tE)break;const x=Math.floor((l.n-tS)/sp);if(x<0||x>=DW||sedGap(l.n))continue;
  if(l.art||r.art){art[x]=1;}const v=sedAsym(l.tp,r.tp);vals[x]=(isNaN(vals[x])?0:vals[x])+v;cnt[x]++;}
 cx.strokeStyle='#3a3938';cx.lineWidth=1;cx.setLineDash([2,3]);for(const y of [1.5,H-1.5]){cx.beginPath();cx.moveTo(0,y);cx.lineTo(DW,y);cx.stroke();}cx.setLineDash([]);
 if(SED.set.dsaArt){cx.fillStyle='#666768';for(let x=0;x<DW;x++)if(art[x])cx.fillRect(Math.floor(x/SED_CW)*SED_CW-3,0,8,H);}
 if(SED._gapOpen!=null&&SED.hold==null){const gx=clampv(Math.floor((SED.gaps[SED.gaps.length-1][0]-tS)/sp),0,DW-8);cx.fillStyle='#666768';cx.fillRect(gx,0,DW-gx,H);}
 cx.fillStyle='#fff';let sm=null;for(let x=0;x<DW;x++){if(!cnt[x]){sm=null;continue;}const v=vals[x]/cnt[x];sm=sm==null?v:sm*.82+v*.18;const hh=sm*(mid-3)/100;if(Math.abs(hh)<1)cx.fillRect(x,mid,1,1);else if(hh>0)cx.fillRect(x,mid-hh,1,hh+1);else cx.fillRect(x,mid,1,-hh);}
 cx.fillStyle='#fff';cx.fillRect(0,mid,DW,1);}
// ----- icons and small drawings -----
function sIcoBell(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s/24,s/24);c.fillStyle=col;c.beginPath();c.moveTo(12,2.4);c.bezierCurveTo(10.9,2.4,10.1,3.2,10.1,4.3);c.lineTo(10.1,4.8);c.bezierCurveTo(7.5,5.5,6,7.8,6,10.7);c.lineTo(6,14.4);c.lineTo(4.1,17);c.lineTo(4.1,18);c.lineTo(19.9,18);c.lineTo(19.9,17);c.lineTo(18,14.4);c.lineTo(18,10.7);c.bezierCurveTo(18,7.8,16.5,5.5,13.9,4.8);c.lineTo(13.9,4.3);c.bezierCurveTo(13.9,3.2,13.1,2.4,12,2.4);c.closePath();c.fill();c.beginPath();c.arc(12,19.4,2.1,0,Math.PI);c.fill();c.restore();}
function sIcoSpk(c,x,y,s,col,waves,cross){c.save();c.translate(x,y);c.scale(s/24,s/24);c.fillStyle=col;c.strokeStyle=col;c.lineWidth=1.7;c.lineCap='round';c.beginPath();c.moveTo(3,9);c.lineTo(7,9);c.lineTo(12,4.5);c.lineTo(12,19.5);c.lineTo(7,15);c.lineTo(3,15);c.closePath();c.fill();
 if(waves)for(let i=1;i<=3;i++){c.beginPath();c.arc(12,12,3+i*3.1,-0.72,0.72);c.stroke();}
 if(cross){c.lineWidth=2.4;c.beginPath();c.moveTo(14,8);c.lineTo(22,16);c.moveTo(22,8);c.lineTo(14,16);c.stroke();}c.restore();}
function sIcoNet(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s/24,s/24);c.strokeStyle=col;c.lineWidth=1.8;c.strokeRect(8,2,8,6);c.strokeRect(1.5,16,6,6);c.strokeRect(9,16,6,6);c.strokeRect(16.5,16,6,6);c.beginPath();c.moveTo(12,8);c.lineTo(12,16);c.moveTo(4.5,16);c.lineTo(4.5,12);c.lineTo(19.5,12);c.lineTo(19.5,16);c.stroke();c.restore();}
function sIcoIris(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s/24,s/24);c.strokeStyle=col;c.lineWidth=2;for(const [a,b] of [[2,2],[13,2],[2,13],[13,13]]){sRR(c,a,b,9,9,3);c.stroke();}c.restore();}
function sIcoBatt(c,x,y,w,h,col,frac){c.save();c.strokeStyle='#cfd2cf';c.lineWidth=1.6;c.strokeRect(x+.8,y+.8,w-3.6,h-1.6);c.fillStyle='#cfd2cf';c.fillRect(x+w-2.6,y+h*.32,2.6,h*.36);c.fillStyle=col;c.fillRect(x+3,y+3,(w-8)*frac,h-6);c.restore();}
function sIcoFlag(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s/32,s/32);c.fillStyle=col;c.beginPath();c.moveTo(2,3);c.lineTo(20,2);c.bezierCurveTo(24,1,28,6,24,8);c.lineTo(14,13);c.lineTo(9,12);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=2.6;c.lineCap='round';c.beginPath();c.moveTo(2,3);c.lineTo(10,28);c.stroke();c.restore();}
function sIcoGear(c,x,y,s,col){c.save();c.translate(x+s/2,y+s/2);c.fillStyle=col;const r1=s*.5,r0=s*.36;c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?r0:r1,a2=a-Math.PI/16;c.lineTo(Math.cos(a2)*r,Math.sin(a2)*r);c.lineTo(Math.cos(a2+Math.PI/16)*r,Math.sin(a2+Math.PI/16)*r);}c.closePath();c.fill();c.globalCompositeOperation='destination-out';c.beginPath();c.arc(0,0,s*.17,0,7);c.fill();c.restore();}
function sChev(c,x,y,w,col,up,dbl){c.save();c.strokeStyle=col;c.lineWidth=2;c.lineCap='round';c.lineJoin='round';const d=up?-1:1;for(let k=0;k<(dbl?2:1);k++){const yy=y+d*(dbl?(k?5:-3):0);c.beginPath();c.moveTo(x-w/2,yy-d*3);c.lineTo(x,yy+d*3);c.lineTo(x+w/2,yy-d*3);c.stroke();}c.restore();}
// ----- the whole static screen -----
const sedAlarmCol=lv=>lv==='hi'?'#ed1c24':'#f9ca07';
function sedDrawStatic(){const cv=SED.cv;if(!cv)return;const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||400,k=w*dpr/800;
 if(cv._w!==Math.round(800*k)){cv.width=Math.round(800*k);cv.height=Math.round(1280*k);cv._w=cv.width;}const c=cv.getContext('2d');c.setTransform(k,0,0,k,0,0);c.clearRect(0,0,800,1280);
 const D=SED.D,N=SED.N,L=SED.L=sedLay(),A=SED.alm,set=SED.set;
 c.fillStyle=SC.bg;c.fillRect(0,0,800,1280);
 sedStatusBar(c,A);if(L.compact)sedRainbow(c,L);sedWindow(c,A,L);
 if(!D)return;
 if(L.gauge){const g=L.gauge;c.save();c.translate(L.compact?400*(1-g.s):0,g.y-410*g.s);c.scale(g.s,g.s);sedGauges(c,N,A);c.restore();}
 else if(L.rows.length||(!L.compact&&!L.eeg))sedTrends(c,D,N,L,A);
 if(L.compact)sedWell(c,D,N,{well:L.cwell,wellY:L.cwY,wellH:L.cwH,wellSize:.66},A);else sedWell(c,D,N,L,A);
 if(L.dsa)sedDsa(c,D,N,L);
 sedScrub(c,D,L);
 // bottom icons
 sIcoFlag(c,25,1240,30,'#bfbebc');sIcoGear(c,752,1237,38,'#bfbebc');
 // a system alarm (battery) outlines the whole display
 if(A&&A.sys){c.strokeStyle='#f9ca07';c.lineWidth=5;c.strokeRect(2.5,2.5,795,1275);}}
// the other window of a shared screen: Radical-7's "rainbow" window (nothing is connected, so it stays empty)
function sedRainbow(c,L){const y1=L.wy-8;sRR(c,8,80,784,y1-80,6);c.fillStyle=SC.bg;c.fill();c.strokeStyle='#232120';c.lineWidth=1.2;c.stroke();
 const gg=c.createLinearGradient(0,80,0,110);gg.addColorStop(0,'#211e1e');gg.addColorStop(1,'#1c1a1a');c.save();sRR(c,9,81,782,29,5);c.clip();c.fillStyle=gg;c.fillRect(8,80,784,30);c.restore();
 const cols=['#e6403a','#f2992e','#f2d33a','#5cc05c','#3aa0e0','#8a63d2','#d8d8d8'];let x=18;'rainbow'.split('').forEach((ch,i)=>{sT(c,ch,x,102,20,cols[i],'left',400);x+=c.measureText(ch).width+7;});}
function sedStatusBar(c,A){
 // bell tile
 const act=A&&A.level,sil=SED.silenceUntil>Date.now(),col=act?sedAlarmCol(A.level):null;
 c.save();if(act){c.shadowColor=col;c.shadowBlur=14;}sRR(c,8,5,60,60,8);c.fillStyle=act?col:'#131110';c.fill();c.restore();
 if(!act){c.strokeStyle='#201e1c';c.lineWidth=1;sRR(c,8.5,5.5,59,59,8);c.stroke();}
 sIcoBell(c,12,9,52,act?'#fff':'#4b4b4c');
 if(sil&&(act||SED.silenceShown)){c.strokeStyle=act?'#fff':'#9a9a9a';c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(20,17);c.lineTo(56,53);c.stroke();}
 // audio pause tile
 const ap=SED.pauseUntil>Date.now()||SED.pausePerm;
 sRR(c,78,5,60,60,7);if(ap){c.fillStyle='#c01c24';c.fill();}else{const g=c.createLinearGradient(0,5,0,65);g.addColorStop(0,'#c9c8c7');g.addColorStop(1,'#e6e5e4');c.fillStyle=g;c.fill();}
 if(ap){sIcoSpk(c,86,8,28,'#fff',true,true);const left=Math.ceil((SED.pauseUntil-Date.now())/1000);if(!SED.pausePerm)sT(c,String(Math.max(0,left)),108,57,17,'#fff','center',600);else sT(c,'∞',108,58,19,'#fff','center',600);}
 else sIcoSpk(c,86,13,44,'#222',true,false);
 // standby (only when enabled in Access Control)
 if(SED.set.standby){sRR(c,148,5,60,60,7);const g=c.createLinearGradient(0,5,0,65);g.addColorStop(0,'#c9c8c7');g.addColorStop(1,'#e6e5e4');c.fillStyle=g;c.fill();c.strokeStyle='#222';c.lineWidth=4;c.lineCap='round';c.beginPath();c.arc(178,36,13,-1.1,Math.PI*2-2.04,false);c.moveTo(178,16);c.lineTo(178,34);c.stroke();}
 // profile pill
 const ped=SED.set.profile==='PEDIATRIC',px=ped?400:431,pw=ped?118:87;sRR(c,px,8,pw,23,11.5);const g=c.createLinearGradient(0,8,0,31);if(ped){g.addColorStop(0,'#439153');g.addColorStop(1,'#006a28');}else{g.addColorStop(0,'#3ea7d7');g.addColorStop(1,'#2778b4');}c.fillStyle=g;c.fill();
 sT(c,SED.set.profile,px+pw/2,26,18,'#fff','center',500);
 sIcoNet(c,539,4,26,'#cfd2cf');sIcoIris(c,582,4,26,'#cfd2cf');
 sIcoBatt(c,626,6,26,18,SED.sim.batt?'#e4a01c':'#64c431',SED.sim.batt?.2:1);
 sIcoSpk(c,668,3,26,'#cfd2cf',true,false);
 sT(c,sedClock(simT,false),787,25,22,'#fff','right',400);
 if(SED.sim.batt)sT(c,'Low Battery',420,25,17,'#f9ca07','right',600);}
function sedWindow(c,A,L){const win=A&&A.win,col=win?sedAlarmCol(win.level):null,par=A&&A.curPar&&A.par,wy=L.wy,pm=par&&par.level==='med';
 // frame and title band (a medium PSi alarm keeps the near-black band, with a thin gold edge and gold title text; a red one fills the band)
 sRR(c,8,wy,784,1187-wy,6);c.fillStyle=SC.bg;c.fill();c.strokeStyle=win?col:'#232120';c.lineWidth=win?2.5:1.2;c.stroke();
 const gg=c.createLinearGradient(0,wy,0,wy+30),tint=win?(win.level==='hi'?['#7a1820','#4a1416']:['#8a6e10','#5a470a']):par&&!pm?['#c01c24','#8a1218']:pm?['#b7a449','#8a7428']:['#211e1e','#1c1a1a'];gg.addColorStop(0,tint[0]);gg.addColorStop(1,tint[1]);
 c.save();sRR(c,9,wy+1,782,29,5);c.clip();c.fillStyle=gg;c.fillRect(8,wy,784,30);if(pm){const hg=c.createLinearGradient(8,0,792,0);hg.addColorStop(0,'rgba(0,0,0,.3)');hg.addColorStop(.28,'rgba(0,0,0,0)');hg.addColorStop(.72,'rgba(0,0,0,0)');hg.addColorStop(1,'rgba(0,0,0,.3)');c.fillStyle=hg;c.fillRect(8,wy,784,30);c.fillStyle='#f9ca07';c.fillRect(8,wy+29,784,1);}c.restore();
 sT(c,'SedLine',18,wy+22,23,win?(win.level==='hi'?'#ff5a5a':'#f9ca07'):pm?'#ddd0a0':par?'#e8d9a0':'#afafae','left',600,true);sT(c,'TM',92,wy+12,6,'#8a8987','left',400);
 if(!(A&&A.text)&&SED.set.emgSens==='Maximum')sT(c,'EMG MAX',600,wy+22,15,'#8a8a88','center',400);
 // the pill with the message
 if(A&&A.text){const t=A.text;c.font=`600 18px ${SED_FONT}`;const tw=c.measureText(t).width+34;sRR(c,400-tw/2,wy+3,tw,24,12);c.fillStyle=win&&win.level==='hi'?'#4a1416':pm?'#2a2308':par?'#3a2e0e':'#1c1a1a';c.fill();if(pm&&!win){c.strokeStyle='#f9ca07';c.lineWidth=1;sRR(c,400-tw/2+.5,wy+3.5,tw-1,23,11.5);c.stroke();}sT(c,t,400,wy+21,18,'#fff','center',600);}
 // the action tab: it stays as an empty box while the menu is open (the blue close tab under the panel is a real button in #sedPop, above both canvases)
 sRR(c,703,wy+5,84,25,4);c.fillStyle='#161413';c.fill();c.strokeStyle='#2b2a2a';c.lineWidth=1;c.stroke();
 if(!(SED.pop&&SED.pop.kind==='action')){c.strokeStyle='#bdbdbd';c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.moveTo(737,wy+13);c.lineTo(753,wy+13);c.stroke();sChev(c,745,wy+20,18,'#bdbdbd',false,false);}}
// ----- the trend rows -----
function sedMap(k){const s=SED.set;switch(k){case 'psi':return {max:s.psiYmax,min:s.psiYmin,inv:false};case 'emg':return {max:s.emgYmax,min:s.emgYmin};case 'sr':return {max:s.srYmax,min:s.srYmin,inv:true};case 'artf':return {max:s.artfYmax,min:s.artfYmin};case 'sefl':return {max:s.sefYmax,min:s.sefYmin};case 'sefr':return {max:s.sefYmax,min:s.sefYmin};default:return {max:100,min:0};}}
function sedFmt(k,N,full){const q=N&&N.v;if(!q||N.blank)return null;const v=q[k];if(v==null)return null;
 if(k==='psi'||k==='emg')return String(Math.round(v));if(k==='sr')return String(Math.round(v/2)*2);if(k==='artf')return v.toFixed(full?1:0);if(k==='sefl'||k==='sefr')return v.toFixed(1);
 if(k==='st'){const sec=Math.round(v);return SED.set.stUnit==='%'?String(Math.min(100,Math.round(100*sec/Math.max(60,simT-(SED.D?SED.D.start:0))))):pad2(Math.floor(sec/3600))+':'+pad2(Math.floor(sec/60)%60);}return String(v);}
// a big number: whole digits large and a decimal part at 0.62 of the size, right-aligned on xr (the number's right edge)
function sedBig(c,t,xr,base,size,col,wt){const dot=t.indexOf('.');let big=t,small='';if(dot>0){big=t.slice(0,dot);small=t.slice(dot);}
 c.font=`${wt} ${size*.62}px ${SED_FONT}`;const w2=small?c.measureText(small).width*.92:0;
 if(small)sT(c,small,xr,base,size*.62,col,'right',wt,false,.92);sT(c,big,xr-w2,base,size,col,'right',wt,false,.92);}
function sedTrends(c,D,N,L,A){const s=SED.set;
 const dsaTint=SED.range>=60;
 L.rows.forEach((r,i)=>{const k=r.k,y0=r.y,h=r.h,m=sedMap(k),ser=D.ser[k],tall=h>120,top=y0+(tall?10:8),bot=y0+h-(tall?17:10),yv=v=>{const f=clampv((v-m.min)/(m.max-m.min),0,1);return m.inv?top+f*(bot-top):bot-f*(bot-top);};
  c.fillStyle=SC.bg;c.fillRect(12,y0,775,h);if(i>0){c.fillStyle=SC.sep;c.fillRect(12,y0,775,1);}
  const alarmHere=A&&A.par&&A.par.k===k,nodata=!!(N&&N.blank&&SED.hold==null);
  // PSi: green target band and the fills beyond it
  if(k==='psi'){const ty=yv(s.psiTmax),by=yv(s.psiTmin);c.fillStyle='#1d2217';c.fillRect(PX0,ty,PX1-PX0,by-ty);c.strokeStyle='#75a02b';c.lineWidth=1;c.setLineDash([1.5,2.5]);for(const yy of [ty,by]){c.beginPath();c.moveTo(PX0,yy+.5);c.lineTo(PX1,yy+.5);c.stroke();}c.setLineDash([]);
   const seg=(cmp,line,c0,c1,yl)=>{let st=null;const flush=e=>{if(st==null)return;c.save();c.beginPath();c.rect(PX0,Math.min(line,yl),PX1-PX0,Math.abs(yl-line));c.clip();c.beginPath();c.moveTo(PX0+st,line);for(let p=st;p<=e;p++)c.lineTo(PX0+p+.5,yv(ser[p]));c.lineTo(PX0+e+1,line);c.closePath();const g=c.createLinearGradient(0,cmp>0?top:bot,0,line);g.addColorStop(0,c0);g.addColorStop(1,c1);c.fillStyle=g;c.fill();c.restore();st=null;};
    for(let p=0;p<NPX;p++){const v=ser[p];if(v!=null&&(cmp>0?v>(cmp>0?s.psiTmax:0):v<s.psiTmin)){if(st==null)st=p;}else flush(p-1);}flush(NPX-1);};
   seg(1,ty,'#b2791d','#684219',top);seg(-1,by,'#293e94','#171d3b',bot);}
  // axis labels and the plot's ticks
  const lab=k==='psi'?[m.max,Math.round((m.max+m.min)/2),m.min]:m.inv?[m.min,m.max]:[m.max,m.min];
  lab.forEach((v,j)=>{if(h<60&&j===1&&lab.length>2)return;const yy=yv(v);sT(c,String(v),47,yy+(h<60?5:7),h<60?16:20,SC.dim,'right',400);});
  c.fillStyle='#5c5c5e';for(let t=0;t<=12;t++)c.fillRect(Math.round(PX0+t*(PX1-PX0)/12),y0+h-5,1,4);
  // the line and its end dot (with no data the line stops at the last valid sample and there is no dot)
  const lv=k==='emg'?sedSmooth(ser,5):ser; // the EMG line is a smooth flat line with the odd small bump
  c.save();c.globalAlpha=.25;c.strokeStyle=SC.yel;c.lineWidth=2;c.beginPath();{let pn=false;for(let p=NPX-36;p<NPX;p++){const v=lv[p];if(v==null){pn=false;continue;}const x=14+p-(NPX-36),y=yv(clampv(v,m.min,m.max));pn?c.lineTo(x,y):c.moveTo(x,y);pn=true;}}c.stroke();c.restore();
  c.strokeStyle=SC.yel;c.lineWidth=1.7;c.lineJoin='round';c.beginPath();let pen=false,lastp=-1;for(let p=0;p<NPX;p++){const v=lv[p];if(v==null){pen=false;continue;}const x=PX0+p+.5,y=yv(clampv(v,m.min,m.max));pen?c.lineTo(x,y):c.moveTo(x,y);pen=true;lastp=p;}c.stroke();
  if(lastp>=0&&!nodata){c.fillStyle=SC.dot;c.beginPath();c.arc(PX1,yv(clampv(lv[lastp],m.min,m.max)),6,0,7);c.fill();}
  // the alarm: panel outline and a gradient in the alarm colour behind the number (a medium one runs to pale lemon and has no bell)
  if(alarmHere){const lv2=A.par.level,col=sedAlarmCol(lv2),g=c.createLinearGradient(530,0,787,0);g.addColorStop(0,'rgba(0,0,0,0)');if(lv2==='hi')g.addColorStop(1,'#d2202a');else{g.addColorStop(.5,'rgba(120,100,25,.6)');g.addColorStop(1,'#c3a52d');}c.fillStyle=g;c.fillRect(530,y0+1,257,h-2);c.strokeStyle=col;c.lineWidth=3;c.strokeRect(13.5,y0+1.5,772,h-3);}
  // the number and its labels
  let txt=sedFmt(k,N);const yc=y0+h/2,white=alarmHere,col=white?'#fff':SED.dimK===k?'#5a4a05':SC.yel;
  if((k==='sefl'||k==='sefr')&&txt!=null)txt=String(Math.round(N.v[k]));if(k==='artf'||k==='st')txt=sedFmt(k,N,true);
  const big=k==='psi'?98:Math.min(56,Math.round(h*.78));
  if(k==='psi'){sT(c,txt==null?'--':txt,705,yc+big*.33,big,col,'right',500,false,.9);
   const ph=s.psiHi,pl=s.psiLo,lc=alarmHere?'#f6ecb0':'#f8ca07';sT(c,ph==null?'--':String(ph),780,yc-32,19,lc,'right',400);sT(c,pl==null?'--':String(pl),780,yc-14,19,lc,'right',400);sT(c,'PSI',780,yc+21,19,alarmHere?lc:SC.unit,'right',400);
   if(alarmHere&&A.par.level==='hi'){sIcoBell(c,731,yc-52,22,'#fff');}}
  else{sedBig(c,txt==null?'--':txt,720,yc+big*.33,big,col,500);
   const lim=k==='sr'&&s.srHi!=null?String(s.srHi):null;if(h>=50){if(lim)sT(c,lim,770,yc-14,12,SC.unit,'center',400);else{sT(c,'–',770,yc-15,12,SC.unit,'center',400);sT(c,'–',770,yc-8,12,SC.unit,'center',400);}}
   const two=h>=50;sT(c,SED_NAME[k],746,yc+(two?8:5),two?17:15,SC.unit,'left',400);if(sedUnit(k)&&two)sT(c,sedUnit(k),746,yc+21,12,SC.unit,'left',400);else if(sedUnit(k))sT(c,sedUnit(k),746+c.measureText(SED_NAME[k]).width+4,yc+5,12,SC.unit,'left',400);}
 });
 // manual events: a small flag on the time axis at the event time (no text)
 for(const e of SED.events){if(e<D.tS||e>D.tE)continue;const x=Math.round(PX0+(e-D.tS)/D.sp);if(L.rows.length){const yb=L.rows[L.rows.length-1].y+L.rows[L.rows.length-1].h;c.fillStyle='#f9ca07';c.fillRect(x,yb-12,1.5,11);c.beginPath();c.moveTo(x+1.5,yb-12);c.lineTo(x+8,yb-9);c.lineTo(x+1.5,yb-6);c.fill();}}
 // the DSA WINDOW tint over the last 20 minutes of every trend row and the well
 if(dsaTint&&L.rows.length||dsaTint&&L.well.length){const x0=PX1-20/SED.range*(PX1-PX0),y0=L.trendY+3,y1=L.wellY+L.wellH;c.fillStyle='rgba(255,255,255,.07)';c.fillRect(x0,y0,PX1-x0+.5,y1-y0);sT(c,'DSA WINDOW',(x0+PX1)/2,y1-3,11,SC.dim,'center',400);}}
function sedWell(c,D,N,L,A){const ws=L.well;c.fillStyle=SC.bg;c.fillRect(12,L.wellY,775,L.wellH);if(!ws.length)return;
 const n=ws.length,one=n===1&&ws[0]==='psi',cs=L.wellSize||1;
 ws.forEach((k,i)=>{const cx=12+775*(i+.5)/n,txt=sedFmt(k,N,true),isP=k==='psi',alarmHere=A&&A.par&&A.par.k==='psi'&&isP,size=(one?58:62)*cs,wt=one?400:500,mid=L.wellY+L.wellH/2,base=one?mid+size*.34:cs<1?mid+size*.34:L.wellY+L.wellH-10;
  const t=txt==null?'--':txt,col=alarmHere?'#fff':SED.dimK===k?'#5a4a05':SC.yel;let big=t,small='';const dot=t.indexOf('.');if(dot>0&&!isP&&k!=='st'){big=t.slice(0,dot);small=t.slice(dot);}
  const nmS=(one?20:19)*Math.max(.8,cs),unS=14*Math.max(.85,cs),nm=SED_NAME[k],un=one?'':sedUnit(k)||'';
  c.font=`${wt} ${size}px ${SED_FONT}`;const w1=c.measureText(big).width*.92;c.font=`${wt} ${size*.62}px ${SED_FONT}`;const w2=small?c.measureText(small).width*.92:0;c.font=`400 ${nmS}px ${SED_FONT}`;const w3=Math.max(c.measureText(nm).width,un?(c.font=`400 ${unS}px ${SED_FONT}`,c.measureText(un).width):0,20),tot=w1+w2+7+w3,x0=one?50:cx-tot/2;
  if(alarmHere){const bx=one?14:cx-90,bw=one?tot+72:180;c.fillStyle=A.par.level==='hi'?'rgba(237,28,36,.35)':'rgba(249,202,7,.28)';c.fillRect(bx,L.wellY+4,bw,L.wellH-8);c.strokeStyle=sedAlarmCol(A.par.level);c.lineWidth=2;c.strokeRect(bx,L.wellY+4,bw,L.wellH-8);}
  sT(c,big,x0,base,size,col,'left',wt,false,.92);if(small)sT(c,small,x0+w1,base,size*.62,col,'left',wt,false,.92);
  const lx=x0+w1+w2+7;if(one)sT(c,nm,lx,base,nmS,SC.unit,'left',400);else{sT(c,nm,lx,base-17*cs,nmS,SC.unit,'left',400);if(un)sT(c,un,lx,base,unS,SC.unit,'left',400);}});}
// ----- the DSA block -----
function sedDsa(c,D,N,L){const g0=L.dsa,y0=g0.y,lh=g0.lh,ah=g0.ah,tot=2*lh+ah+20,hz=SED.set.maxHz,hi=SED.set.dsaHi,lo=SED.set.dsaLo,sp=SED.set,ry=y0+1+lh+ah+17,small=lh<120,fs=small?17:21;
 c.fillStyle=SC.bg;c.fillRect(12,y0,775,tot);
 const o={L:SED.cvL,R:SED.cvR};c.imageSmoothingEnabled=(SED._k||1)<1&&lh===LH;
 if(o.L)c.drawImage(o.L.cv,DX,y0+1,DW,lh);
 if(SED.cvA)c.drawImage(SED.cvA.cv,DX,y0+1+lh,DW,ah);
 // the time axis band (plain #100f0d from x 14 to 735, small ticks above the labels) and the R spectrogram
 c.fillStyle='#100f0d';c.fillRect(14,y0+1+lh+ah,721,17);
 if(o.R)c.drawImage(o.R.cv,DX,ry,DW,lh);
 // a dim stub of the oldest columns in the left gutter, as on the real screen (the picture wraps)
 c.save();c.globalAlpha=.25;if(o.L)c.drawImage(o.L.cv,0,0,36,LH,14,y0+1,36,lh);if(o.R)c.drawImage(o.R.cv,0,0,36,LH,14,ry,36,lh);c.restore();
 c.imageSmoothingEnabled=true;
 const ty=y0+1+lh+ah+13;
 for(let m=0;m<4;m++){const t=D.tE-m*300,x=DX+DW-m*300*DW/1200;const lx=Math.min(DX+DW-36,x-36);sT(c,sedHms(t),lx+0,ty,16,'#adadab','center',400);c.fillStyle='#5c5c5e';c.fillRect(x-1,y0+1+lh+ah,1,4);}
 // frequency labels, L at the bottom of its picture (0 Hz next to ASYM), R mirrored
 const ticks=hz===40?[0,10,20,30,40]:[0,15,30];
 for(const t of ticks){sT(c,String(t),46,y0+1+lh-t*lh/hz+(t===0?0:8),fs,SC.dim,'right');sT(c,String(t),46,ry+t*lh/hz+(t===0?8:t===hz?0:8),fs,SC.dim,'right');}
 if(ah>=45){sT(c,'100',46,y0+lh+17,17,SC.dim,'right');sT(c,'0',46,y0+lh+33,17,SC.dim,'right');sT(c,'100',46,y0+lh+49,17,SC.dim,'right');}
 // right gutter: the colour bar, its limits and the L, R and ASYM captions
 const g=c.createLinearGradient(0,y0+4,0,y0+tot-3);SED_STOPS.forEach(s=>g.addColorStop(s[0],`rgb(${s[1].join(',')})`));c.fillStyle=g;c.fillRect(779,y0+3,5,tot-6);
 sT(c,String(hi),775,y0+20,small?17:20,SC.dim,'right');sT(c,String(lo),775,y0+tot-5,small?17:20,SC.dim,'right');
 sT(c,'L',762,y0+lh/2+9,24,SC.dim,'right');sT(c,'R',762,ry+lh/2+9,24,SC.dim,'right');
 const a=N?N.asym:0,ar=Math.round(Math.abs(a)),at=SED.sim.disc||SED.sim.off||SED.sim.none||!N?'--':ar===0?'0':(a>0?'L':'R')+ar;
 if(ah>=45){sT(c,'ASYM',736,y0+lh+14,14,'#adadab','left');sT(c,at,736,y0+lh+35,25,'#fff','left',400);sT(c,'%',736,y0+lh+50,13,'#adadab','left');}
 else{sT(c,'ASYM',736,y0+lh+11,12,'#adadab','left');sT(c,at,736,y0+lh+ah-2,18,'#fff','left',400);}}
function sedScrub(c,D,L){c.fillStyle='#151412';sRR(c,8,1190,784,42,5);c.fill();
 const x0=14,x1=555,span=Math.min(7200,Math.max(60,D.now-D.start)),t0=D.now-span,px=(x1-x0)/span;c.fillStyle='#232221';
 // the DSA window (20 min ending at the shown time) as a lighter box
 const wa=clampv(D.tE-1200,t0,D.now),wb=clampv(D.tE,t0,D.now);c.fillStyle='#2b2a2a';c.fillRect(x0+(wa-t0)*px,1191,(wb-wa)*px,40);
 sT(c,sedHm(t0),24,1209,17,'#989797','left');sT(c,sedDate(t0),20,1226,17,'#989797','left');c.fillStyle='#989797';c.fillRect(70,1193,1,16);
 const step=span<=2700?600:1800;let tk=Math.ceil((t0+1)/step)*step;c.font=`400 17px ${SED_FONT}`;
 // ticks on whole clock times
 const dT=new Date(T0+t0*1000),offs=(dT.getMinutes()*60+dT.getSeconds())%step;tk=t0+(step-offs)%step;if(tk-t0<150)tk+=step;
 for(;tk<D.now-130;tk+=step){const x=x0+(tk-t0)*px;if(x<140||x>x1-125)continue;sT(c,sedHm(tk),x-2,1209,17,'#989797','right');c.fillStyle='#989797';c.fillRect(x,1193,1,16);c.fillRect(x,1226,1,5);}
 sT(c,sedClock(D.tE,true),x1-3,1209,17,'#989797','right');c.fillStyle='#989797';c.fillRect(x1,1193,1,16);
 if(SED.range!==SED.range&&0)return;
 // the caption appears only above the 0:30 range
 if(SED.range>30&&D.tE>D.start+1)sT(c,'DSA WINDOW',x0+(wa-t0)*px+(wb-wa)*px*.75,1229,11,SC.dim,'center');
 // events (flags) dropped by the flag key
 c.fillStyle='#f9ca07';for(const e of SED.events){if(e<t0||e>D.now)continue;const x=x0+(e-t0)*px;c.fillRect(x-1,1214,2,13);}
 // zoom
 sRR(c,560,1192,75,38,4);c.fillStyle='#121110';c.fill();sRR(c,705,1192,85,38,4);c.fill();
 sT(c,'−',597,1219,26,'#dad9d8','center',400);sT(c,'+',747,1219,26,'#dad9d8','center',400);
 const h=SED.range,lab=h>=60?(h/60)+':00 h':'0:'+pad2(h)+' h';sT(c,lab,670,1220,21,'#7a7b7d','center',400);}
// ----- the Analog view: a PSi gauge and two small ones -----
function sedGaugeArc(c,cx,cy,rIn,rOut,a0,a1,n,gap,cols){const da=(a1-a0)/n;for(let i=0;i<n;i++){const s=a0+i*da+gap/2,e=a0+(i+1)*da-gap/2;c.beginPath();c.arc(cx,cy,rOut,s,e);c.arc(cx,cy,rIn,e,s,true);c.closePath();c.fillStyle=cols[i];c.fill();}}
function sedNeedle(c,cx,cy,ang,r0,r1,wd){c.save();c.translate(cx,cy);c.rotate(ang);c.beginPath();c.moveTo(r1,0);c.lineTo(r0,-wd/2);c.lineTo(r0,wd/2);c.closePath();c.fillStyle='#f26f21';c.fill();c.restore();}
// the gauges are drawn in the full-size design space (y 410-732); a shared screen scales and moves them with a canvas transform
function sedGauges(c,N,A){const s=SED.set;c.fillStyle=SC.bg;c.fillRect(12,410,775,322);
 const hiV=s.psiHi==null?100:s.psiHi,loV=s.psiLo==null?0:s.psiLo,t=N&&!N.blank&&N.v.psi!=null?N.v.psi:null,al=A&&A.par&&A.par.k==='psi';
 // ten slim dashes round a half circle: red below the low limit, white in range, red above; caution ranges recolour the edge dashes
 const nLo=loV>0?Math.max(1,Math.round(loV/10)):0,nHi=hiV<100?Math.max(1,Math.round((100-hiV)/10)):0,nMid=Math.max(1,10-nLo-nHi),cols=[];
 for(let i=0;i<nLo;i++)cols.push('#c31e26');for(let i=0;i<nMid;i++)cols.push('#f0f1f3');for(let i=0;i<nHi;i++)cols.push('#c31e26');
 if(s.psiCL!=null&&nMid>1)cols[nLo]='#f9ca07';if(s.psiCH!=null&&nMid>1)cols[nLo+nMid-1]='#f9ca07';
 const a0=Math.PI,a1=2*Math.PI,CY=614;
 sedGaugeArc(c,206,CY,114,136,a0,a1,cols.length,0.052,cols);
 const ang=v=>a0+(a1-a0)*clampv(v,0,100)/100;
 if(hiV<100){const a=ang(hiV);sT(c,String(hiV),206+152*Math.cos(a),CY+152*Math.sin(a)+2,16,'#aeaeac','center');}
 if(loV>0){const a=ang(loV);sT(c,String(loV),206+152*Math.cos(a)-4,CY+152*Math.sin(a)+4,16,'#aeaeac','center');}
 // the needle is a short fat wedge: its base near the digits, its tip on the ring's inner edge
 if(t!=null)sedNeedle(c,206,CY,ang(t),58,116,14);
 sT(c,t==null?'--':String(Math.round(t)),210,CY-4,96,al?'#fff':SC.yel,'center',400);sT(c,'PSI',206,CY+68,34,SC.unit,'center',400);
 if(al){c.strokeStyle=sedAlarmCol(A.par.level);c.lineWidth=3;c.strokeRect(14,425,380,290);}
 // two small gauges: six white dashes, the digits at the centre, the needle a short wedge that starts outside the digits and ends outside the ring
 const mini=(cy,name,v,val)=>{const cx=612,ang2=Math.PI+Math.PI*clampv(v==null?0:v,0,100)/100;sedGaugeArc(c,cx,cy,65,78,Math.PI,2*Math.PI,6,0.035,['#f0f1f3','#f0f1f3','#f0f1f3','#f0f1f3','#f0f1f3','#f0f1f3']);
  if(v!=null)sedNeedle(c,cx,cy+6,ang2,47,91,8);sT(c,val==null?'--':val,cx,cy-8,52,SC.yel,'center',400);sT(c,name,cx,cy+40,24,SC.unit,'center',400);};
 mini(510,'EMG %',N&&!N.blank?N.v.emg:null,sedFmt('emg',N));mini(678,'SR',N&&!N.blank?N.v.sr/2*2:null,sedFmt('sr',N));
 // the well is drawn by sedWell (ARTF, SEFL, SEFR)
}
// ----- the EEG: one stream per channel at the monitor's 178.154 samples/s; band-limited resonators (no white-noise floor) -----
const SED_FS=178.154,SED_RING=4096;
function sedRes(f,bw){const r=Math.exp(-Math.PI*bw/SED_FS),th=2*Math.PI*f/SED_FS,a1=2*r*Math.cos(th),a2=-r*r,v=(1-a2)/((1+a2)*((1-a2)*(1-a2)-a1*a1));return {a1,a2,g:1/Math.sqrt(v)};}
const SED_RES={slow:sedRes(1.8,2.2),mid:sedRes(7.5,6),beta:sedRes(18,7),emg:sedRes(38,22),env:sedRes(.22,.3)};
function sedRng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
// The traces follow the simulation's own EEG (app.js's engine, 128 samples/s: the left side's signal for L1 and L2, the right side's for R1 and R2),
// resampled to the monitor's rate, so the waves show the same drug and depth as the DSA. Each electrode adds its own small part (the resonators above:
// a little 7.5 Hz and 18 Hz, and 38 Hz muscle when the EMG is up), so L1 and L2 are alike but not the same. SED_EEG_GAIN scales the engine's
// signal to what the real screen shows at 5 uV/mm (general anaesthesia: waves about a third of a lane, owner's photos and Masimo's figures).
const SED_EEG_GAIN=.42;
function sedEegInit(){const rnd=sedRng(20261014),gs=()=>{let u=0;while(u<1e-9)u=rnd();return Math.sqrt(-2*Math.log(u))*Math.cos(6.2831853*rnd());};
 const mk=()=>({s:[0,0,0,0],p:[0,0,0,0],buf:new Float32Array(SED_RING)});
 SED.eg={n:0,gs,ch:[mk(),mk(),mk(),mk()],gain:[1,.94,1.06,.9]};
 SED.eg.n=Math.max(0,sedEegTarget()-SED_RING);}
function sedEegTarget(){return typeof produced==='number'?Math.floor(produced*SED_FS/FS):0;}
function sedEegPar(){const hl=HIST.length?HIST[HIST.length-1]:null,hr=R&&R.HIST&&R.HIST.length?R.HIST[R.HIST.length-1]:hl;
 return [hl,hr].map(c=>({emg:c?emgPct(c):0}));}
// the engine's signal at a fractional sample position (linear interpolation); 0 before it starts
function sedSigAt(sig,prod,t){const i=t-(prod-sig.length),i0=Math.floor(i);if(i0<0||i0>=sig.length)return 0;const f=i-i0,a=sig[i0],b=i0+1<sig.length?sig[i0+1]:a;return a+(b-a)*f;}
function sedEegStep(){const E=SED.eg,gs=E.gs,P=E.par||(E.par=sedEegPar()),k=SED_RES,t=E.n*FS/SED_FS;
 const src=[sedSigAt(SIG,produced,t),R&&R.SIG?sedSigAt(R.SIG,R.produced,t):0];
 for(let c=0;c<4;c++){const h=c%2,S=E.ch[c],em=P[h].emg;
  const stp=(i,r,x)=>{const y=r.a1*S.s[i]+r.a2*S.p[i]+x*r.g;S.p[i]=S.s[i];S.s[i]=y;return y;};
  const own=2.2*stp(1,k.mid,gs())+2.6*stp(2,k.beta,gs())+(.06+.1*em)*stp(3,k.emg,gs());
  S.buf[E.n&(SED_RING-1)]=(src[h]*E.gain[c]+own)*SED_EEG_GAIN;}
 E.n++;}
function sedEegAdvance(){if(!SED.eg)sedEegInit();const E=SED.eg,now=performance.now(),tg=sedEegTarget();
 if(Math.floor(now/2000)!==E._pt){E._pt=Math.floor(now/2000);E.par=sedEegPar();}
 if(tg<E.n||tg-E.n>SED_RING)E.n=Math.max(0,tg-SED_RING); // a reset, or a long jump at high speed
 while(E.n<tg)sedEegStep();}
// ----- the EEG panel (its own canvas, redrawn every frame; the sweep moves, it does not scroll) -----
function sedDrawEeg(){const cv=SED.cvE;if(!cv)return;const L=SED.L||sedLay(),e=L.eeg;
 if(!e){if(cv.style.display!=='none')cv.style.display='none';return;}
 if(cv.style.display==='none')cv.style.display='';if(cv._y!==e.y||cv._h!==e.h){cv._y=e.y;cv._h=e.h;cv.style.setProperty('--y',e.y);cv.style.setProperty('--h',e.h);cv._w=0;}
 const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||400,k=w*dpr/800,ky=e.h/300,H=e.h;
 if(cv._w!==Math.round(800*k)){cv.width=Math.round(800*k);cv.height=Math.round(H*k);cv._w=cv.width;}const c=cv.getContext('2d');
 const U=()=>c.setTransform(k,0,0,k,0,0),K=()=>c.setTransform(k,0,0,k*ky,0,0); // U: plain design pixels (text, the strip); K: stretched to the panel's height
 U();c.clearRect(0,0,800,H);
 sedEegAdvance();
 const A=SED.alm,s=SED.set,gone=SED.sim.disc||SED.sim.none||SED.sim.off,E=SED.eg,strip=SED.strip;
 // panel (design y 110..410 becomes 0..300 here)
 K();c.fillStyle='#10131a';c.fillRect(12,0,775,300);c.fillStyle=SC.eeg;c.fillRect(50,0,737,300);
 // the dotted time grid, one second apart (two at 15 mm/s)
 const mm=s.eegSpeed===15?15:30,N=Math.round(737*30/mm),pxs=737/N; // 1 sample per pixel at 30 mm/s (178 samples/s: 4.1 s across), 2 per pixel at 15 mm/s
 c.strokeStyle='rgba(150,160,180,.35)';c.lineWidth=1;c.setLineDash([2,4]);for(const x of [208,401,594]){c.beginPath();c.moveTo(x+.5,0);c.lineTo(x+.5,300);c.stroke();}c.setLineDash([]);
 const ys=[38,112,188,263],names=['L1','R1','L2','R2'],ppu=6.43/s.eegAmp; // px per microvolt (5 uV/mm: about 0.78 uV per pixel)
 U();names.forEach((nm,i)=>{if(!(strip&&i===0))sT(c,nm,22,ys[i]*ky+8,22,SC.dim,'left',400);});
 if(gone&&strip){U();c.fillStyle='#15171b';c.fillRect(12,0,775,68);c.fillStyle='#2b2a2a';c.fillRect(12,68,775,1);sT(c,'L1',20,40,18,SC.dim,'left',400);}
 if(!gone){
  const cur=E.n,pos=cur%N,st=1; // every sample is drawn: skipping every other one at 15 mm/s made the dim trace shimmer, as the skipped half swapped each frame
  for(const ch of [1,2,3,0]){if(ch===0&&strip){U();c.fillStyle='#15171b';c.fillRect(12,0,775,68);c.fillStyle='#2b2a2a';c.fillRect(12,68,775,1);sT(c,'L1',20,40,18,SC.dim,'left',400);}
   if(SED.sim.hiz&&ch===2)continue;const sb=E.ch[ch].buf,sq1=strip&&ch===0,yc=sq1?35:ys[ch],am=sq1?.3:1,val=idx=>sb[idx&(SED_RING-1)]*ppu*am;
   if(sq1)U();else K();
   // the squeezed L1 trace behind the open electrode strip is subdued
   const al=sq1?.38:1;
   c.save();c.beginPath();c.rect(50,0,737,sq1?68:300);c.clip();c.strokeStyle=SC.yel;c.lineWidth=2;c.lineJoin='round';c.lineCap='round';c.globalAlpha=al;
   // the new sweep: the newest samples drawn from the left edge up to the write cursor
   c.beginPath();for(let q=0;q<pos;q+=st){const x=50+q*pxs,y=yc-val(cur-pos+q);q?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();
   // the older sweep continues dimmed after a gap of about 55 px, to the right edge
   const gap=Math.round(55/pxs);c.globalAlpha=.4*al;c.beginPath();let on=false;for(let q=pos+gap;q<N;q+=st){const x=50+q*pxs,y=yc-val(cur-pos-N+q);on?c.lineTo(x,y):c.moveTo(x,y);on=true;}c.stroke();
   c.restore();
   // the dim stub of the previous sweep in the label gutter
   c.save();c.beginPath();c.rect(12,0,38,sq1?68:300);c.clip();c.globalAlpha=.16*al;c.strokeStyle=SC.yel;c.lineWidth=2;c.beginPath();on=false;for(let q=N-60;q<N;q+=st){const x=12+(q-(N-60))*pxs*.64,y=yc-val(cur-pos-N+q);on?c.lineTo(x,y):c.moveTo(x,y);on=true;}c.stroke();c.restore();}
  // the sweep cursor (a white line, newer builds); it does not cross the electrode strip
  if(s.cursor){K();const cx=50+pos*pxs,y0=strip?68/ky:0;c.fillStyle='#fff';c.fillRect(cx-1,y0,2,300-y0);}}
 U();sT(c,mm+' mm/sec',55,H-10,18,'#b5b5b3','left',400);sT(c,s.eegAmp+' µV/mm',781,H-10,18,'#b5b5b3','right',400);
 // a menu open over the panel dims it a little
 if(SED.pop&&SED.pop.kind==='action'){c.fillStyle='rgba(16,15,13,.3)';c.fillRect(12,0,775,H);}
 // the pull-down handle and the electrode strip over the top of the panel
 if(strip)sedStrip(c);else{sRR(c,366,-10,68,18,3);c.fillStyle='#1d1b1a';c.fill();c.fillStyle='#777';c.fillRect(384,2,32,1.5);c.fillRect(384,5.5,32,1.5);}}
// electrode strip: R2 R1 CT/CB L1 L2 with their impedances, coloured by state (all six dark grey when impedance monitoring is off)
function sedElec(){const S=SED.sim,s=SED.set;if(!s.monImp)return {state:{R2:'dark',R1:'dark',CT:'dark',CB:'dark',L1:'dark',L2:'dark'},k:{}};
 const b=SED.imp,st={},kv={};for(const n of ['R2','R1','CT','CB','L1','L2']){let v=b[n],t='green';
  if(S.disc){t='light';v=null;}else if(S.off){t='blue';v=65;}else{if(S.hiz&&n==='L2'){v=52+Math.sin(simT/9)*2;t='red';}if(S.gel&&(n==='CB'||n==='L1'))t='gel';
   if(t==='green'){if(v>35)t='red';else if(v>15)t='yellow';}}
  st[n]=t;kv[n]=v;}return {state:st,k:kv};}
function sedStrip(c){const e=SED.elec||sedElec(),col={green:'#57a133',yellow:'#f0cd15',red:'#ec1f24',blue:'#486fbf',light:'#a9aaa9',dark:'#7a7c7d',gel:'#7a7c7d'},lab={green:'#6bc03c',yellow:'#f0cd15',red:'#ec1f24',blue:'#6f8fe0',light:'#a9aaa9',dark:'#7a7c7d',gel:'#7a7c7d'};
 // (the opaque #15171b band and the squeezed L1 trace are drawn by sedDrawEeg, before this; the gutter's own L1 label is not repeated)
 const icon=(n,x,y,w,h)=>{const t=e.state[n];c.fillStyle=col[t];sRR(c,x,y,w,h,4);c.fill();if(t==='gel'){c.strokeStyle='#2fd0c8';c.lineWidth=2;c.beginPath();c.moveTo(x+3,y+3);c.lineTo(x+w-3,y+h-3);c.moveTo(x+w-3,y+3);c.lineTo(x+3,y+h-3);c.stroke();c.strokeStyle='#cfd2cf';c.lineWidth=1;sRR(c,x,y,w,h,4);c.stroke();}};
 const kv=(n)=>{const v=e.k[n];return !SED.set.dispImp||v==null?'':(v>=65?'>65K':v.toFixed(1)+'K');};
 // label and K value share an edge (right-aligned left of an icon, left-aligned right of one), 6 px or more clear of the icon
 const lbl=(n,x,y,al)=>{sT(c,n,x,y,19,lab[e.state[n]],al,500);const k=kv(n);if(k)sT(c,k,x,y+17,16,'#aeaeac',al,400);};
 lbl('R2',162,29,'right');icon('R2',168,19,18,28);lbl('R1',268,29,'right');icon('R1',274,19,18,28);
 lbl('CT',377,29,'right');c.strokeStyle=col[e.state.CT];c.lineWidth=2;c.beginPath();c.moveTo(372,23);c.lineTo(385,23);c.moveTo(413,45);c.lineTo(425,45);c.stroke();icon('CT',385,14,28,16);icon('CB',385,36,28,16);lbl('CB',431,29,'left');
 icon('L1',511,19,18,28);lbl('L1',538,29,'left');icon('L2',615,19,18,28);lbl('L2',641,29,'left');
 c.fillStyle='#777';c.fillRect(384,56,32,1.5);c.fillRect(384,59.5,32,1.5);}
