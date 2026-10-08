/* RA lower-limb blocks: shared engine for site/ra.html.
   Helpers, paper and tissue layers, drawing kit, labels, player, routing and test hooks, one copy for every block.
   Each block is a classic script site/ra/<slug>.js that calls RA.register(slug, meta, build); build(E) receives
   the names exported on E below. Contract: guides/ra-block-pages/single-page-spec.md.
   The helper and drawing-kit section is copied verbatim from the block pages (ellipsePts from fib.html, the rest
   from femoral.html); keep it byte-identical so every block draws exactly as its page did. */
(function(){
const W=1600,H=900,TS0=7;
const cvs=document.getElementById('c'),ctx=cvs.getContext('2d');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- helpers ---------- */
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const easeOut=x=>1-Math.pow(1-x,3);
const lerp=(a,b,k)=>a+(b-a)*k;
const along=(S,E,u)=>[lerp(S[0],E[0],u),lerp(S[1],E[1],u)];
function spline(P,closed,n=14){
  const out=[],L=P.length,cnt=closed?L:L-1;
  for(let i=0;i<cnt;i++){
    const p0=P[closed?(i-1+L)%L:Math.max(i-1,0)],p1=P[i],p2=P[(i+1)%L],p3=P[closed?(i+2)%L:Math.min(i+2,L-1)];
    for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t,f=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);out.push([f(0),f(1)])}
  }
  out.push(closed?out[0].slice():P[L-1].slice());return out;
}
function ellipsePts(cx,cy,rx,ry,n=72,a0=-Math.PI/2,rot=0){const o=[],cr=Math.cos(rot),sr=Math.sin(rot);for(let i=0;i<=n;i++){const a=a0+i/n*Math.PI*2,x=rx*Math.cos(a),y=ry*Math.sin(a);o.push([cx+x*cr-y*sr,cy+x*sr+y*cr])}return o}
function mkPath(pts){const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));return{pts,cum,len:cum[cum.length-1]}}
function strokePartial(c,path,p){
  if(p<=0)return;const{pts,cum,len}=path,target=len*Math.min(p,1);
  c.beginPath();c.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){if(cum[i]>=target){const k=(target-cum[i-1])/((cum[i]-cum[i-1])||1);c.lineTo(lerp(pts[i-1][0],pts[i][0],k),lerp(pts[i-1][1],pts[i][1],k));break}c.lineTo(pts[i][0],pts[i][1])}
  c.stroke();
}
function polyPath(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath()}
function inPoly(x,y,P){let ins=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))ins=!ins}return ins}
function shrink(pts,f){let cx=0,cy=0;pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx/=pts.length;cy/=pts.length;return pts.map(p=>[cx+(p[0]-cx)*f,cy+(p[1]-cy)*f])}
function bbox(P){let a=1e9,b=1e9,c=-1e9,d=-1e9;P.forEach(([x,y])=>{a=Math.min(a,x);b=Math.min(b,y);c=Math.max(c,x);d=Math.max(d,y)});return[a,b,c,d]}
function hull(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lo=[],up=[];for(const p of P){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}
  for(const p of P.slice().reverse()){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p)}
  const h=lo.slice(0,-1).concat(up.slice(0,-1));h.push(h[0].slice());return h}
function resample(P,step){const out=[P[0].slice()];let acc=0;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],l=Math.hypot(b[0]-a[0],b[1]-a[1]);let d=step-acc;while(d<=l){out.push([lerp(a[0],b[0],d/l),lerp(a[1],b[1],d/l)]);d+=step}acc=(acc+l)%step}out.push(P[P.length-1].slice());return out}
function angDiff(a,b){let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d}
function pop(t,t0,u0,u1,amp){const q=seg(t,t0,t0+.45);return{u:q<.3?u0:lerp(u0,u1,easeOut(seg(q,.3,.5))),sh:q>.3&&q<1?Math.sin(q*60)*(1-q)*amp:0}}
// y of an x-sorted open polyline at x (linear interpolation, clamped at the ends)
function yAt(P,x){if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++){if(P[i][0]>=x){const a=P[i-1],b=P[i],k=(x-a[0])/((b[0]-a[0])||1);return lerp(a[1],b[1],k)}}return P[P.length-1][1]}
// smooth bump: 1 at u=0, 0 at |u|>=1
const bump=u=>Math.abs(u)>=1?0:Math.pow(1-u*u,1.5);
const C={paper:'#f4ece1',ink:'#2b1e18',fat:'#f2dcc8',sub:'#f3dfcc',guide:'110,120,148',fascicle:'#3a1b11',la:'122,50,22'};
const RED='#9b2b1a';
/* ---------- probe outline and beam shared by the transverse scans (canvas px) ---------- */
const PROBE=[[602,-12],[604,26],[582,56],[540,70],[521,92],[520,128],[533,145],[770,147],[1007,145],[1020,128],[1019,92],[1000,70],[958,56],[936,26],[938,-12]];
const BEAM=[517,148,499];
/* ---------- static layers ---------- */
const LS=1.5;
function layer(){const c=document.createElement('canvas');c.width=W*LS;c.height=H*LS;const g=c.getContext('2d');g.scale(LS,LS);return[c,g]}
const [paperC,pg]=layer();
(function(){const r=rng(3);pg.fillStyle=C.paper;pg.fillRect(0,0,W,H);
  for(let i=0;i<40;i++){const x=r()*W,y=r()*H,rad=60+r()*220;const gr=pg.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,'rgba(214,190,160,.10)');gr.addColorStop(1,'rgba(214,190,160,0)');pg.fillStyle=gr;pg.fillRect(x-rad,y-rad,rad*2,rad*2)}
  for(let i=0;i<5000;i++){pg.fillStyle=`rgba(90,60,40,${.03+r()*.07})`;pg.fillRect(r()*W,r()*H,r()*1.6+.3,r()*1.6+.3)}})();
function lobules(g,P,r,rxa,rxb,rya,ryb,col){
  const bb=bbox(P),pts=[];let tries=0;
  while(tries<9000){tries++;const x=bb[0]+r()*(bb[2]-bb[0]),y=bb[1]+r()*(bb[3]-bb[1]);const rx=rxa+r()*(rxb-rxa),ry=rya+r()*(ryb-rya);
    if(pts.some(p=>Math.hypot((p.x-x)/(p.rx+rx),(p.y-y)/(p.ry+ry))<.92))continue;pts.push({x,y,rx,ry,a:(r()-.5)*.6})}
  pts.forEach(p=>{g.beginPath();g.ellipse(p.x,p.y,p.rx,p.ry,p.a,0,Math.PI*2);g.fillStyle='rgba(255,246,236,.35)';g.fill();g.strokeStyle=col;g.lineWidth=.9;g.stroke()});
}
function fibres(g,P,ang,n,r,al,la=40,lb=140){
  const bb=bbox(P);
  for(let i=0;i<n;i++){
    let x,y,k=0;do{x=bb[0]+r()*(bb[2]-bb[0]);y=bb[1]+r()*(bb[3]-bb[1]);k++}while(!inPoly(x,y,P)&&k<30);
    const len=la+r()*lb,a=ang+(r()-.5)*.28,cu=(r()-.5)*.35,dx=Math.cos(a),dy=Math.sin(a);
    g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*len/2-dy*cu*len,y+dy*len/2+dx*cu*len,x+dx*len,y+dy*len);
    const dark=r()<.62;g.strokeStyle=dark?`rgba(92,50,30,${(.12+r()*.28)*al})`:`rgba(255,244,232,${(.25+r()*.35)*al})`;
    g.lineWidth=.45+r()*.7;g.stroke();
  }
}
/* ---------- nerve fascicles ---------- */
function makeFascicles(n,rx,ry,seed,smin=3,srange=5.5,pad=[12,11]){
  const r=rng(seed),out=[];let tries=0;
  while(out.length<n&&tries<4000){tries++;
    const x=(r()*2-1)*(rx-pad[0]),y=(r()*2-1)*(ry-pad[1]);
    if((x*x)/((rx-pad[0])**2)+(y*y)/((ry-pad[1])**2)>1)continue;
    const s=smin+r()*srange;if(out.some(f=>Math.hypot(f.x-x,f.y-y)<f.s+s+2))continue;
    const wob=[];for(let i=0;i<9;i++)wob.push(.72+r()*.5);out.push({x,y,s,wob,ring:r()<.55});
  }
  return out;
}
/* ---------- needle timing and LA plane helpers ---------- */
function tentPhase(v,uc,ut,P){return t=>{
  if(t<9)return{u:lerp(v[0],v[1],easeOut(seg(t,8.3,9)))};
  if(t<10.6)return{u:lerp(v[1],v[2],ease(seg(t,9,10.6)))};
  if(t<11.05){const p=pop(t,10.6,v[2],v[3],3);return{u:p.u,sh:p.sh}}
  if(t<11.6)return{u:lerp(v[3],uc,ease(seg(t,11.05,11.6)))};
  if(t<12.2){const q=seg(t,11.6,12.2);return{u:lerp(uc,ut,1-Math.pow(1-q,1.6)),sh:reduceMotion?0:Math.sin(t*41)*.7*q}}
  if(t<12.65){const p=pop(t,12.2,ut,P,2.5);return{u:p.u,sh:p.sh}}
  if(t<13.2)return{u:lerp(P,1,ease(seg(t,12.65,13.2)))};
  return{u:1};
}}
/* planeLA: LA collected along a fascial line. Returns a closed polygon between
   top(x)=line(x)-lift(x) and bottom(x)=line(x)+dip(x). Generic so the FIB clone can reuse it. */
function planeLA(line,lift,dip,x0,x1){
  if(x1-x0<2)return null;const top=[],bot=[];
  for(let x=x0;x<=x1;x+=4){const y=yAt(line,x);top.push([x,y-lift(x)]);bot.push([x,y+dip(x)])}
  return top.concat(bot.reverse());
}
/* laAnchor: leader point at the thickest column of a planeLA polygon (default s.la) between xmin and xmax */
function laAnchor(s,xmin,P=s.la,xmax=1e9){
  if(!P)return[s.nerve.x+110,s.nerve.y-40];const n=P.length/2;let best=-1,pt=null;
  for(let i=0;i<n;i++){const a=P[i],b=P[P.length-1-i];if(a[0]<xmin||a[0]>xmax)continue;const th=b[1]-a[1];if(th>best){best=th;pt=[a[0],(a[1]+b[1])/2]}}
  return pt||[s.nerve.x+110,s.nerve.y-40];
}
/* ---------- drawing kit ---------- */
function drawNerve(c,n,F,base,fillA,lineP){
  c.save();c.globalAlpha=fillA;
  c.beginPath();c.ellipse(n.x,n.y,n.rx,n.ry,0,0,Math.PI*2);
  const gr=c.createRadialGradient(n.x-n.rx*.3,n.y-n.ry*.3,4,n.x,n.y,n.rx);gr.addColorStop(0,'#f6e3d2');gr.addColorStop(1,'#e8c4a6');
  c.fillStyle=gr;c.fill();c.clip();
  c.beginPath();c.ellipse(n.x,n.y,n.rx-4,n.ry-4,0,0,Math.PI*2);c.strokeStyle='rgba(168,95,55,.6)';c.lineWidth=.9;c.stroke();
  const sx=n.rx/base;
  F.forEach(f=>{c.beginPath();
    for(let i=0;i<=9;i++){const a=i/9*Math.PI*2,rr=f.s*f.wob[i%9],px=n.x+f.x*sx+Math.cos(a)*rr,py=n.y+f.y+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py)}
    c.closePath();c.fillStyle=C.fascicle;c.fill();if(f.ring){c.strokeStyle='rgba(250,226,206,.75)';c.lineWidth=.9;c.stroke()}});
  c.restore();
  c.strokeStyle=C.ink;c.lineWidth=1.8;strokePartial(c,mkPath(ellipsePts(n.x,n.y,n.rx,n.ry,60)),lineP);
}
function drawVessels(c,A,fillA,lineP,t){
  const pulse=reduceMotion?0:Math.pow(Math.max(0,Math.sin(t*Math.PI*2*1.15)),6);
  const V=A.vein,R=A.art,vp=ellipsePts(V.x,V.y,V.rx,V.ry,72);
  c.save();c.globalAlpha=fillA;
  polyPath(c,vp);let g=c.createRadialGradient(V.x,V.y,4,V.x,V.y,76);g.addColorStop(0,'#5a2a18');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();
  c.lineWidth=6;c.strokeStyle='rgba(242,200,170,.9)';c.stroke();
  const ar=R.r*(1+.035*pulse);
  c.beginPath();c.arc(R.x,R.y,ar,0,Math.PI*2);g=c.createRadialGradient(R.x-8,R.y-8,3,R.x,R.y,ar);g.addColorStop(0,'#5e2c19');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();
  c.lineWidth=8;c.strokeStyle='rgba(242,200,170,.95)';c.stroke();c.restore();
  c.strokeStyle=C.ink;c.lineWidth=2;strokePartial(c,mkPath(vp),lineP);strokePartial(c,mkPath(ellipsePts(R.x,R.y,ar+4,ar+4,60)),lineP);
}
function drawNeedle(c,s){
  if(s.na<=0)return;
  const S=s.S,[tx,ty]=s.tip,d=[tx-S[0],ty-S[1]],l=Math.hypot(...d),ux=d[0]/l,uy=d[1]/l,nx=-uy,ny=ux,bx=tx-ux*16,by=ty-uy*16;
  c.save();c.globalAlpha=s.na;c.lineCap='round';
  c.beginPath();c.moveTo(S[0],S[1]);c.lineTo(bx,by);c.strokeStyle='#2f3035';c.lineWidth=7;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=4.2;c.stroke();
  c.beginPath();c.moveTo(S[0]-nx*1.2,S[1]-ny*1.2);c.lineTo(bx-nx*1.2,by-ny*1.2);c.strokeStyle='rgba(250,251,253,.9)';c.lineWidth=1.1;c.stroke();
  c.beginPath();c.moveTo(bx+nx*3.4,by+ny*3.4);c.lineTo(tx,ty);c.lineTo(bx-nx*3.4,by-ny*3.4);c.closePath();c.fillStyle='#8e929b';c.fill();c.strokeStyle='#2f3035';c.lineWidth=1.2;c.stroke();
  c.restore();
}
function guideLine(c,t,A,B,t0,f0){
  const a=seg(t,t0,t0+.6)*(1-seg(t,f0,f0+1));if(a<=0)return;
  const p=ease(seg(t,t0,t0+1));
  c.save();c.strokeStyle=`rgba(${C.guide},${.85*a})`;c.lineWidth=1.2;c.setLineDash([7,6]);
  c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(lerp(A[0],B[0],p),lerp(A[1],B[1],p));c.stroke();c.setLineDash([]);
  const d=[B[0]-A[0],B[1]-A[1]],l=Math.hypot(...d),ux=d[0]/l,uy=d[1]/l;
  for(let q=0;q<=l*p;q+=34){const x=A[0]+ux*q,y=A[1]+uy*q;c.beginPath();c.moveTo(x-uy*6,y+ux*6);c.lineTo(x+uy*6,y-ux*6);c.stroke()}
  c.globalAlpha=a*p;c.beginPath();c.arc(B[0],B[1],9,0,Math.PI*2);c.stroke();c.restore();
}
/* ---------- labels and warnings ---------- */
function pill(c,text,x,y,align,anchor,a){
  c.save();c.globalAlpha=a;c.font='500 17px Inter, system-ui, sans-serif';
  const w=c.measureText(text).width+20,h=28,x0=align==='right'?x-w:x;
  if(anchor){c.strokeStyle='rgba(43,30,24,.75)';c.lineWidth=1.1;c.beginPath();c.moveTo(align==='right'?x:x0,y);c.lineTo(anchor[0],anchor[1]);c.stroke();c.beginPath();c.arc(anchor[0],anchor[1],2.6,0,Math.PI*2);c.fillStyle=C.ink;c.fill()}
  c.fillStyle='rgba(251,247,241,.93)';c.beginPath();c.roundRect?c.roundRect(x0,y-h/2,w,h,14):c.rect(x0,y-h/2,w,h);c.fill();c.strokeStyle='rgba(43,30,24,.25)';c.lineWidth=1;c.stroke();
  c.fillStyle=C.ink;c.textBaseline='middle';c.fillText(text,x0+10,y+1);c.restore();
}
function muscleLabel(c,text,x,y,a){c.save();c.globalAlpha=a*.85;c.font='italic 400 21px Fraunces, Georgia, serif';c.fillStyle='#5b3a28';c.textAlign='center';c.fillText(text,x,y);c.restore()}
function warnPill(c,text,x,y,anchor,a){
  c.save();c.globalAlpha=a;c.font='600 17px Inter, system-ui, sans-serif';const w=c.measureText(text).width+46,h=30;
  if(anchor){c.strokeStyle=RED;c.lineWidth=1.3;c.beginPath();c.moveTo(x,y);c.lineTo(anchor[0],anchor[1]);c.stroke()}
  c.fillStyle='#fbf1ea';c.beginPath();c.roundRect?c.roundRect(x,y-h/2,w,h,15):c.rect(x,y-h/2,w,h);c.fill();c.strokeStyle=RED;c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x+17,y,9,0,Math.PI*2);c.fillStyle=RED;c.fill();
  c.strokeStyle='#fbf1ea';c.lineWidth=2;c.beginPath();c.moveTo(x+13.5,y-3.5);c.lineTo(x+20.5,y+3.5);c.moveTo(x+20.5,y-3.5);c.lineTo(x+13.5,y+3.5);c.stroke();
  c.fillStyle=RED;c.textBaseline='middle';c.fillText(text,x+34,y+1);c.restore();
}
// non-red cue for a corrected step (same shape as warnPill, accent colour, tick)
function cuePill(c,text,x,y,a){
  const K='#8f431d';c.save();c.globalAlpha=a;c.font='600 17px Inter, system-ui, sans-serif';const w=c.measureText(text).width+46,h=30;
  c.fillStyle='#fbf4ec';c.beginPath();c.roundRect?c.roundRect(x,y-h/2,w,h,15):c.rect(x,y-h/2,w,h);c.fill();c.strokeStyle=K;c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x+17,y,9,0,Math.PI*2);c.fillStyle=K;c.fill();
  c.strokeStyle='#fbf4ec';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(x+12.5,y);c.lineTo(x+15.8,y+3.4);c.lineTo(x+21.5,y-3.6);c.stroke();
  c.fillStyle=K;c.textBaseline='middle';c.fillText(text,x+34,y+1);c.restore();
}
function ring(c,p,a,t,dy){const pl=reduceMotion?1:.55+.45*Math.abs(Math.sin(t*4));c.save();c.globalAlpha=a*pl;c.strokeStyle=RED;c.lineWidth=2.4;c.beginPath();c.arc(p[0],p[1]+dy,24,0,Math.PI*2);c.stroke();c.restore()}

/* ================= player, shell and routing (one copy, shared by every block) =================
   Generic version of the block pages' player. P is the live state; modules read it, only the engine writes it. */
const P={block:null,tab:null,curScen:{},cur:null,dT:9,playT:0,playing:false,started:false,ended:false,clock:0,showLabels:true,scrubbing:false,probeView:false};
const E={W,H,TS0,cvs,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,inPoly,shrink,bbox,hull,resample,angDiff,pop,yAt,bump,
  C,RED,PROBE,BEAM,LS,layer,paperC,pg,lobules,fibres,makeFascicles,planeLA,laAnchor,tentPhase,drawVessels,drawNerve,drawNeedle,guideLine,pill,muscleLabel,warnPill,cuePill,ring,P};
const $=id=>document.getElementById(id);
const IDX=window.RA_INDEX;
const BASE=(document.currentScript&&document.currentScript.src||'').replace(/[^/]*$/,'')||'ra/';
const ctl=document.querySelector('.ctl'),playBtn=$('play'),resetBtn=$('reset'),scrub=$('scrub'),tc=$('tc'),scenBox=$('scen'),vtabs=$('vtabs'),lblBtn=$('lbl'),pvBtn=$('pv'),stage=$('stage'),ld=$('ld');
let rt=null,meta=null,raf=0,loopId=0,last=0,visible=true,mountTok=0,pending=null,dirty=true;   // dirty: the paused picture must be redrawn
const beats={};   // loop id -> time of its last frame (RA.state().loops counts the chains that drew in the last 250 ms)
const reg={},loads={},rts={};

function resize(){dirty=true;const dpr=Math.min(window.devicePixelRatio||1,2),w=cvs.clientWidth||800;cvs.width=Math.round(w*dpr);cvs.height=Math.round(w*dpr*9/16);ctx.setTransform(cvs.width/W,0,0,cvs.width/W,0,0)}
new ResizeObserver(resize).observe(cvs);resize();
if(window.IntersectionObserver)new IntersectionObserver(e=>{visible=e[e.length-1].isIntersecting||!!document.fullscreenElement||stage.classList.contains('full');if(visible)dirty=true}).observe(cvs);

/* ---------- transport ---------- */
function syncBtn(){playBtn.textContent=P.playing?'❚❚ Pause':P.ended?'↻ Replay':P.started?'▶ Resume':'▶ Play';if(P.cur)scrub.max=(P.cur.Tend-TS0).toFixed(2)}
function setPlaying(p){
  if(!rt)return;dirty=true;
  if(p){if(P.ended){P.playT=0;P.ended=false}if(P.dT<7.8)P.dT=7.8;P.started=true;P.playing=true}
  else{P.playing=false}
  syncBtn();
}
// Show complete anatomy immediately; only the demonstration timeline plays.
function resetScenario(){dirty=true;P.dT=9;P.playing=false;P.started=false;P.ended=false;P.playT=0;syncBtn()}
function setAria(){if(rt&&rt.aria)cvs.setAttribute('aria-label',rt.aria(P))}
function selectScenario(){P.cur=rt.SC[P.curScen[P.tab]];
  scenBox.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.scen===P.curScen[P.tab]));
  rt.sync(P);if(rt.onScenario)rt.onScenario(P.cur);setAria();resetScenario()}
function pillLabel(key){const p=meta.pills&&meta.pills[key];return p?(typeof p==='string'?p:p.label):rt.SC[key].pill||key}
function pillNeg(key){const p=meta.pills&&meta.pills[key];return p&&typeof p==='object'&&'neg'in p?p.neg:!!rt.SC[key].neg}
function selectTab(k){
  P.tab=k;vtabs.querySelectorAll('[role=tab]').forEach(b=>{const on=b.dataset.tab===k;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1;if(on)stage.setAttribute('aria-labelledby',b.id)});
  // scenario pills only when a tab holds more than one scenario
  const list=rt.TABS[k];scenBox.innerHTML='';scenBox.hidden=list.length<2;
  if(list.length>1)list.forEach(key=>{const b=document.createElement('button');b.type='button';b.dataset.scen=key;b.textContent=pillLabel(key);if(pillNeg(key))b.className='neg';
    b.onclick=()=>{P.curScen[P.tab]=key;selectScenario();writeHash(false)};scenBox.appendChild(b)});
  if(rt.onTab)rt.onTab(k,P.curScen[k]);selectScenario();
}
function setProbeView(on){dirty=true;P.probeView=on;pvBtn.setAttribute('aria-pressed',on);setAria()}
function exitFull(){stage.classList.remove('full');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}

playBtn.onclick=()=>setPlaying(!P.playing);
resetBtn.onclick=()=>{if(rt)resetScenario()};
scrub.addEventListener('input',()=>{if(!rt)return;dirty=true;P.scrubbing=true;P.playT=+scrub.value;P.started=true;P.ended=P.playT>=P.cur.Tend-TS0-.01;if(P.dT<7.8)P.dT=7.8;syncBtn()});
scrub.addEventListener('change',()=>{P.scrubbing=false});
lblBtn.onclick=()=>{dirty=true;P.showLabels=!P.showLabels;lblBtn.setAttribute('aria-pressed',P.showLabels)};
pvBtn.onclick=()=>{if(rt)setProbeView(!P.probeView)};
$('exit-full').onclick=exitFull;
$('fs').onclick=()=>{stage.classList.add('full');visible=true;const r=stage.requestFullscreen||stage.webkitRequestFullscreen;if(r)try{const p=r.call(stage);p&&p.catch&&p.catch(()=>{})}catch(e){}};
cvs.addEventListener('click',()=>{if(stage.classList.contains('full'))exitFull();else setPlaying(!P.playing)});
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)stage.classList.remove('full')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')exitFull();if(e.code==='Space'&&e.target===document.body){e.preventDefault();setPlaying(!P.playing)}});

/* ---------- one animation loop at a time ---------- */
function frame(now){
  const dt=Math.min(.1,(now-last)/1000);last=now;P.clock+=dt;
  if(P.playing&&!P.scrubbing){P.playT+=dt;if(TS0+P.playT>=P.cur.Tend){P.playT=P.cur.Tend-TS0;P.playing=false;P.ended=true;dirty=true;syncBtn()}}
  // paused with reduced motion: nothing on the canvas changes (no pulse, intro done), so skip identical redraws
  const still=reduceMotion&&!P.playing&&!P.scrubbing&&P.dT>=9&&!dirty;
  if(visible&&!still){rt.sync(P);rt.render(P);dirty=false}
  const cap=P.cur.caps&& (P.cur.caps.find(c=>TS0+P.playT>=c[0]&&TS0+P.playT<c[1])||P.cur.caps[P.cur.caps.length-1]);
  const caption=$('ra-caption'),text=cap?cap[2]+'. '+cap[3]:'';
  if(caption.textContent!==text)caption.textContent=text;
  if(!P.scrubbing)scrub.value=P.playT.toFixed(2);
  tc.textContent=P.playT.toFixed(1)+' s';
}
function stopLoop(){if(raf)cancelAnimationFrame(raf);raf=0;loopId++}
function startLoop(){stopLoop();dirty=true;const id=loopId;last=performance.now();for(const k in beats)if(+k!==id)delete beats[k];
  const f=now=>{if(id!==loopId||!rt)return;beats[id]=performance.now();frame(now);raf=requestAnimationFrame(f)};raf=requestAnimationFrame(f)}

/* ---------- block loading ---------- */
function load(slug){
  if(reg[slug])return Promise.resolve(reg[slug]);
  if(loads[slug])return loads[slug];
  return loads[slug]=new Promise((res,rej)=>{
    const s=document.createElement('script');s.src=BASE+slug+'.js?v=20261008-near';
    const fail=()=>{s.remove();delete loads[slug];rej(new Error('block '+slug+' did not load'))};
    s.onload=()=>reg[slug]?res(reg[slug]):fail();s.onerror=fail;document.head.appendChild(s);
  });
}
function register(slug,m,build){reg[slug]={meta:m,build}}

/* ---------- shell: regions, blocks, header, panels ---------- */
const regBox=$('regions'),blkBox=$('blocks');
let region=null;const lastIn={};
const regionOf=IDX.regionOf,esc=IDX.esc;   // shared with the shell's first-paint script in ra.html
function roving(box,activate){
  box.addEventListener('keydown',e=>{const t=[...box.querySelectorAll('[role=tab]')],i=t.indexOf(document.activeElement);if(i<0)return;
    let j={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:t.length-1}[e.key];if(j===undefined)return;e.preventDefault();j=(j+t.length)%t.length;
    t.forEach((b,k)=>b.tabIndex=k===j?0:-1);t[j].focus();if(activate)t[j].click()});
}
function drawRegions(){IDX.paintNav(region,pending||P.block)}
function markBlock(){const cur=pending||P.block;blkBox.querySelectorAll('[role=tab]').forEach(b=>{const on=b.dataset.b===cur;b.setAttribute('aria-selected',on);b.tabIndex=on?0:-1})}
function setRegion(key){region=IDX.regions.find(r=>r.key===key)||IDX.regions[0];drawRegions()}
function header(slug){const b=IDX.blocks[slug];
  IDX.paintHead(slug);
  $('ind').querySelector('.pb').innerHTML='<ul class="ind">'+b.ind.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
  if(!TEST)document.title=b.name+' · Lower-limb blocks';
}
function fillMeta(){$('notes').innerHTML=meta?meta.notes||'':'';
  [['tips',meta&&meta.tips],['srcs',meta&&meta.sources]].forEach(([id,h])=>{const d=$(id);d.hidden=!h;d.querySelector('.pb').innerHTML=h||''})}
function buildVtabs(){vtabs.setAttribute('aria-label',meta.tabsLabel||'View');vtabs.hidden=meta.tabs.length<2;
  vtabs.innerHTML=meta.tabs.map(([k,l,s])=>`<button type="button" role="tab" id="v-${k}" data-tab="${k}" aria-controls="stage">${esc(l)}${s?'<small>'+esc(s)+'</small>':''}</button>`).join('')}
function showLd(html){ld.innerHTML=html;ld.hidden=!html}

regBox.addEventListener('click',e=>{const b=e.target.closest('[role=tab]');if(!b)return;const r=IDX.regions.find(x=>x.key===b.dataset.r);
  const slug=lastIn[r.key]||r.blocks[0];region=r;drawRegions();if(slug!==(pending||P.block)){pushHash(slug);go(slug,null,null)}});
blkBox.addEventListener('click',e=>{const b=e.target.closest('[role=tab]');if(!b)return;const slug=b.dataset.b;if(slug===(pending||P.block))return;pushHash(slug);go(slug,null,null)});
vtabs.addEventListener('click',e=>{const b=e.target.closest('[role=tab]');if(!b||!rt||b.dataset.tab===P.tab)return;selectTab(b.dataset.tab);writeHash(false)});
roving(regBox,false);roving(blkBox,false);roving(vtabs,true);

/* ---------- mount / unmount ---------- */
function unmount(){
  stopLoop();P.playing=false;exitFull();
  if(rt&&rt.release)rt.release();
  rt=null;meta=null;P.block=null;P.cur=null;P.tab=null;P.curScen={};vtabs.innerHTML='';scenBox.innerHTML='';scenBox.hidden=true;
  playBtn.textContent='▶ Play';scrub.value=0;tc.textContent='0.0 s';
  ctx.setTransform(cvs.width/W,0,0,cvs.width/W,0,0);ctx.drawImage(paperC,0,0,W,H);
}
const fontsReady=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();
fontsReady.then(()=>{dirty=true});
async function mount(slug,tab,scen,before){
  const tok=++mountTok;pending=slug;
  if(P.block!==slug)unmount();
  header(slug);markBlock();
  if(!reg[slug])showLd('<span>Loading block</span>');
  let m;
  try{m=await load(slug)}catch(err){if(tok!==mountTok)return;pending=null;fillMeta();ctl.style.visibility='hidden';
    showLd('<span>Could not load this block.</span> <button type="button" id="retry">Try again</button>');$('retry').onclick=()=>mount(slug,tab,scen,before);return}
  await Promise.race([fontsReady,new Promise(r=>setTimeout(r,1500))]);
  if(tok!==mountTok)return;
  showLd('');ctl.style.visibility='';
  try{rts[slug]=rts[slug]||m.build(E)}catch(err){pending=null;console.error(err);ctl.style.visibility='hidden';showLd('<span>This block failed to start.</span>');return}
  meta=m.meta;rt=rts[slug];P.block=slug;pending=null;
  fillMeta();buildVtabs();
  P.curScen=Object.assign({},rt.curScen);
  const t=tab&&rt.TABS[tab]?tab:rt.defaultTab;
  if(scen&&rt.TABS[t].includes(scen))P.curScen[t]=scen;
  pvBtn.hidden=!meta.probe;P.probeView=false;pvBtn.setAttribute('aria-pressed','false');
  lblBtn.setAttribute('aria-pressed',P.showLabels);
  resize();
  selectTab(t);
  if(before)before();
  startLoop();
  if(location.hash&&location.hash!=='#combinations')writeHash();   // normalise a deep link that named an unknown tab or scenario
}
function go(slug,tab,scen,opt={}){
  if(!IDX.blocks[slug])slug='femoral';
  const key=opt.region||(region&&region.blocks.includes(slug)?region.key:regionOf(slug).key);
  if(!region||region.key!==key)setRegion(key);
  lastIn[key]=slug;
  if(slug===(pending||P.block)){
    if(rt&&P.block===slug&&tab&&rt.TABS[tab]){let ch=false;
      if(scen&&rt.TABS[tab].includes(scen)&&P.curScen[tab]!==scen){P.curScen[tab]=scen;ch=true}
      if(tab!==P.tab){selectTab(tab)}else if(ch)selectScenario();}
    markBlock();return Promise.resolve();
  }
  return mount(slug,tab,scen,opt.before);
}

/* ---------- routing: #<slug>[/<tab>[/<scen>]] ---------- */
const Q=new URLSearchParams(location.search),TEST=Q.has('b');let routed=null;
function hashFor(){if(!rt)return'#'+P.block;const l=rt.TABS[P.tab];
  return'#'+P.block+(P.tab!==rt.defaultTab||l.length>1&&P.curScen[P.tab]!==rt.curScen[P.tab]?'/'+P.tab+(l.length>1?'/'+P.curScen[P.tab]:''):'')}
function writeHash(){if(!TEST&&rt&&location.hash!==hashFor())history.replaceState(null,'',hashFor())}
function pushHash(slug){if(!TEST&&location.hash!=='#'+slug)history.pushState(null,'','#'+slug)}
function route(){routed=location.hash;
  const h=decodeURIComponent(location.hash.slice(1));
  const r=IDX.regions.find(x=>x.key===h);
  if(r){const s=r.blocks[0];if(!TEST)history.replaceState(null,'','#'+s);return go(s,null,null,{region:r.key})}
  if(h==='combinations'){const d=$('combinations');d.open=true;if(!P.block&&!pending)go('femoral');setTimeout(()=>d.scrollIntoView({block:'start'}),0);return}
  let [slug,tab,scen]=(h||'femoral').split('/');
  if(rt&&slug===P.block&&!tab){tab=rt.defaultTab;scen=rt.curScen[tab]}   // back to the bare block link: its default view
  return go(IDX.blocks[slug]?slug:(pending||P.block||'femoral'),tab||null,scen||null);
}
// in-page links (#lfcn, #adductor-canal/tkr in tips, notes and combinations): push a history entry and bring the player back into view
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a||TEST||e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const h=a.getAttribute('href');e.preventDefault();const was=pending||P.block;if(location.hash!==h)history.pushState(null,'',h);route();
  const now=pending||P.block,top=$('regions').getBoundingClientRect().top;
  if(now!==was&&(top<0||top>innerHeight*.6))$('regions').scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'})});

/* ---------- test hooks: ra.html?b=<slug>&v=<tab>&s=<scen>&t=<sec>&nolabels&probe (same routine as the block pages) ---------- */
function hooks(o){return()=>{
  const v=o.v,sc=o.s,tt=o.t;
  if(v&&rt.TABS[v]){if(sc&&rt.TABS[v].includes(sc))P.curScen[v]=sc;selectTab(v)}
  else if(sc){const k=Object.keys(rt.TABS).find(x=>rt.TABS[x].includes(sc));if(k){P.curScen[k]=sc;selectTab(k)}}
  if(o.nolabels){P.showLabels=false;lblBtn.setAttribute('aria-pressed','false')}
  if(o.probe&&meta.probe)setProbeView(true);
  dirty=true;
  if(tt!==null&&tt!==undefined&&tt!==''&&isFinite(+tt)){const T=clamp(+tt,TS0,P.cur.Tend);P.dT=9;P.playT=T-TS0;P.started=T>8.3;P.ended=T>=P.cur.Tend;P.playing=false;syncBtn()}
}}
function test(o){const slug=IDX.blocks[o.b]?o.b:'femoral';P.showLabels=true;lblBtn.setAttribute('aria-pressed','true');
  if(slug===(pending||P.block))unmount();   // remount: same path as a fresh page
  return go(slug,null,null,{before:hooks(o)})}

window.RA={register,
  state:()=>({block:P.block,tab:P.tab,scen:P.tab&&P.curScen[P.tab],loops:Object.values(beats).filter(x=>performance.now()-x<250).length,loaded:Object.keys(reg),playing:P.playing}),
  test};

if(TEST)test({b:Q.get('b'),v:Q.get('v'),s:Q.get('s'),t:Q.get('t'),nolabels:Q.has('nolabels'),probe:Q.has('probe')});
else{addEventListener('popstate',route);addEventListener('hashchange',()=>{if(location.hash!==routed)route()});   // hashchange only when no popstate routed it
  if(location.hash)route();else go('femoral')}
})();
