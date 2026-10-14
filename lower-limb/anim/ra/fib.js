/* Supra-inguinal fascia iliaca block: block module for ra.html (ported from fib.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player.
   Own copies kept (differ from the engine): laAnchor, warnPill. C is the engine's (fib's lacked the unused fascicle colour). */
RA.register('fib', {
  title: 'Supra-inguinal fascia iliaca block',
  tabsLabel: 'Approach',
  tabs: [['scan', 'Find the view', 'ASIS to AIIS to bow-tie'],
         ['inplane', 'In-plane', 'Caudad to cephalad'],
         ['error', 'Negative examples', 'Two common errors']],
  pills: null,
  probe: true,
  notes: '',
  tips: `
<p class="lede">Practical points from the sources listed below, grouped by step.</p>
<h3>Indication</h3>
<ul>
  <li>Expect the lateral femoral cutaneous nerve to be the most reliable early sign of success. Its course is consistent above the inguinal ligament, unlike below it, and the supra-inguinal approach consistently blocked it after hip arthroplasty. <span class="src">Bullock 2017 [1]; Hebbard 2011 [2]</span></li>
</ul>
<h3>Scanning</h3>
<ul>
  <li>Teach the scan in two named stages: an orientation scan (ASIS to AIIS to bow-tie), then a block view you hold still for needling. Have the learner say out loud which structures they can see at each stage before the needle comes out. <span class="src">Ashken 2022 [3]</span></li>
</ul>
<h3>Needle</h3>
<ul>
  <li>If the needle tents fascia iliaca and the plunger feels stiff, the tip is still pressed against the fascia. Do not push harder; advance until it gives. Opening pressure was 15 psi or more every time the needle indented fascia iliaca, and below 15 psi every time the tip was beneath it. <span class="src">Gadsden 2016 [4]</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Volume matters: a CT and dissection study suggested about 40 mL beneath fascia iliaca is needed to reach the femoral, obturator and lateral femoral cutaneous nerves from a supra-inguinal injection. Stopping well short of the plan risks a partial block. <span class="src">Vermeylen 2018 [5]</span></li>
  <li>Ease off the probe as you inject. Releasing transducer pressure can reduce resistance to injection and improve spread. <span class="src">NYSORA [6]</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>Watch each aliquot layer out beneath fascia iliaca. If the injectate collects in one spot instead of spreading, stop and reposition the needle before giving the rest. <span class="src">NYSORA [6]</span></li>
  <li>Test sensation over the lateral, anterior and medial thigh separately. In volunteers the supra-inguinal approach blocked all three in 80% versus 30% for the infra-inguinal approach; a missing region tells you which nerve the spread did not reach. <span class="src">Vermeylen 2019 [7]</span></li>
  <li>A good-looking lens under fascia iliaca does not guarantee a block. Fascial plane blocks work by the mass of local anaesthetic reaching the nerves, and spread correlates imperfectly with sensory loss, so deposit close to the target, give enough volume to drive bulk flow, then test. <span class="src">Chin 2021 [8]</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Put colour Doppler on before you needle. In 100 cadavers the deep circumflex iliac artery always ran between fascia lata and fascia iliaca, on the needle path just above the target plane. <span class="src">Ogami 2017 [9]</span></li>
  <li>Because this block reaches the femoral nerve, treat the patient as a falls risk afterwards. In volunteers a femoral nerve block cut quadriceps strength to about 11% of baseline and impaired balance. <span class="src">Kwofie 2013 [10]</span></li>`,
  sources: `<ol>
  <li>Bullock WM, Yalamuri SM, Gregory SH, Auyong DB, Grant SA. Ultrasound-guided suprainguinal fascia iliaca technique provides benefit as an analgesic adjunct for patients undergoing total hip arthroplasty. <i>J Ultrasound Med</i> 2017;36(2):433–438.</li>
  <li>Hebbard P, Ivanusic J, Sha S. Ultrasound-guided supra-inguinal fascia iliaca block: a cadaveric evaluation of a novel approach. <i>Anaesthesia</i> 2011;66(4):300–305. <a href="https://pubmed.ncbi.nlm.nih.gov/21401544/" rel="noopener">PMID 21401544</a></li>
  <li>Ashken T, Bowness J, et al., Pawa A. Recommendations for anatomical structures to identify on ultrasound for the performance of intermediate and advanced blocks in ultrasound-guided regional anesthesia. <i>Reg Anesth Pain Med</i> 2022;47(12):762–772. <a href="https://pubmed.ncbi.nlm.nih.gov/36283714/" rel="noopener">PMID 36283714</a></li>
  <li>Gadsden J, Latmore M, Levine DM, Robinson A. High opening injection pressure is associated with needle-nerve and needle-fascia contact during femoral nerve block. <i>Reg Anesth Pain Med</i> 2016;41(1):50–55. <a href="https://pubmed.ncbi.nlm.nih.gov/26650431/" rel="noopener">PMID 26650431</a></li>
  <li>Vermeylen K, Soetens F, et al. The effect of the volume of supra-inguinal injected solution on the spread of the injectate under the fascia iliaca: a preliminary study. <i>J Anesth</i> 2018;32(6):908–913. <a href="https://pubmed.ncbi.nlm.nih.gov/30250982/" rel="noopener">PMID 30250982</a></li>
  <li>NYSORA. Ultrasound-guided fascia iliaca block. <a href="https://nysora.com/regional-anesthesia/techniques/ultrasound-guided-fascia-iliaca-block/" rel="noopener">nysora.com</a></li>
  <li>Vermeylen K, Desmet M, et al. Supra-inguinal injection for fascia iliaca compartment block results in more consistent spread towards the lumbar plexus than an infra-inguinal injection: a volunteer study. <i>Reg Anesth Pain Med</i> 2019. <a href="https://pubmed.ncbi.nlm.nih.gov/30798268/" rel="noopener">PMID 30798268</a></li>
  <li>Chin KJ, Lirk P, Hollmann MW, Schwarz SKW. Mechanisms of action of fascial plane blocks: a narrative review. <i>Reg Anesth Pain Med</i> 2021;46(7):618–628. <a href="https://pubmed.ncbi.nlm.nih.gov/34145073/" rel="noopener">PMID 34145073</a></li>
  <li>Ogami K, Murata H, et al. Deep and superficial circumflex iliac arteries and their relationship to the ultrasound-guided femoral nerve block procedure: a cadaver study. <i>Clin Anat</i> 2017;30(3):413–420. <a href="https://pubmed.ncbi.nlm.nih.gov/28192858/" rel="noopener">PMID 28192858</a></li>
  <li>Kwofie MK, Shastri UD, Gadsden JC, et al. The effects of ultrasound-guided adductor canal block versus femoral nerve block on quadriceps strength and fall risk: a blinded, randomized trial of volunteers. <i>Reg Anesth Pain Med</i> 2013;38(4):321–325. <a href="https://pubmed.ncbi.nlm.nih.gov/23788068/" rel="noopener">PMID 23788068</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,bbox,resample,pop,yAt,bump,
  C,RED,PROBE,BEAM,LS,layer,paperC,fibres,planeLA,tentPhase,drawNeedle,guideLine,pill,muscleLabel,cuePill,ring}=E;
let cur,started,showLabels,probeView;   // mirrors of the player state, refreshed by sync() before every render

function linePath(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1])}
// inset a long thin closed outline by d px towards its vertical centre at each x (keeps the inner line parallel on wedges)
function insetV(P,d){return P.map(([x,y])=>{const v=vSpan(P,x),m=(v[0]+v[1])/2;return[x,y+Math.sign(m-y)*Math.min(d,Math.abs(m-y)*.5)]})}
// vertical extent [top, bottom] of a closed outline at x ([x,x] when x is outside it)
function vSpan(P,x){let lo=1e9,hi=-1e9;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0]){const y=lerp(a[1],b[1],(x-a[0])/(b[0]-a[0]));lo=Math.min(lo,y);hi=Math.max(hi,y)}}return lo<hi?[lo,hi]:[x,x]}
// smooth minimum of a and b over a blend radius r
function smin(a,b,r){const h=clamp(.5+.5*(b-a)/r);return lerp(b,a,h)-r*h*(1-h)}
const SKIN_T=spline([[20,178],[300,158],[517,147],[770,146],[1016,147],[1300,158],[1580,178]],false);
const SKIN_D=spline([[30,190],[300,170],[560,162],[770,161],[1000,162],[1300,170],[1570,190]],false);
const KF={
  fib:{
    sl:[[-40,281],[300,287],[600,292],[780,296],[1000,293],[1300,290],[1640,292]],
    io:[[-40,295],[300,302],[560,322],[700,345],[780,364],[780,370],[640,386],[500,402],[300,426],[-40,442]],
    sa:[[780,364],[900,342],[1000,330],[1200,314],[1400,306],[1640,301],[1640,441],[1400,436],[1200,428],[1000,418],[900,402],[780,372]],
    fi:[[-40,580],[250,530],[450,496],[600,466],[700,451],[800,441],[950,438],[1100,444],[1300,454],[1640,466]],
    bone:[[-40,812],[300,762],[600,702],[800,648],[900,612],[945,590],[972,582],[1002,596],[1057,645],[1217,672],[1450,670],[1640,688]],
    tend:[[982,586],[1107,556],[1267,531],[1467,521],[1640,517]],
    knot:[780,367],peak:[972,582],ilEnd:1640,ilBx:1640,fiA:1,ilA:1,tdA:0,vA:1,knotA:1},
  aiis:{
    sl:[[-40,281],[300,287],[600,292],[780,296],[1000,293],[1300,290],[1640,292]],
    io:[[-40,295],[300,302],[500,318],[640,336],[715,349],[715,355],[600,372],[450,392],[250,420],[-40,442]],
    sa:[[715,349],[820,334],[1000,322],[1200,312],[1400,306],[1640,303],[1640,447],[1400,440],[1200,430],[1000,420],[820,394],[715,355]],
    fi:[[-40,584],[250,540],[450,510],[600,488],[700,472],[790,462],[850,458],[1000,462],[1300,468],[1640,476]],
    bone:[[-40,812],[300,760],[600,700],[760,640],[850,598],[885,568],[905,560],[935,575],[990,630],[1150,664],[1400,662],[1640,684]],
    tend:[[915,564],[1040,534],[1200,509],[1400,499],[1640,495]],
    knot:[715,352],peak:[905,560],ilEnd:810,ilBx:879,fiA:1,ilA:1,tdA:1,vA:0,knotA:1},
  asis:{
    sl:[[-40,248],[300,250],[600,252],[780,254],[1000,256],[1300,258],[1640,263]],
    io:[[-40,256],[250,258],[450,262],[580,266],[650,268],[650,272],[560,280],[450,290],[250,312],[-40,338]],
    sa:[[738,268],[850,266],[1000,266],[1200,268],[1400,270],[1640,273],[1640,404],[1400,392],[1200,372],[1000,340],[850,300],[745,274]],
    fi:[[-40,584],[250,540],[450,510],[600,488],[700,472],[790,462],[850,458],[1000,462],[1300,468],[1640,476]],
    bone:[[-40,346],[250,320],[450,296],[600,278],[680,270],[705,267],[720,266],[745,276],[800,330],[900,430],[1100,540],[1640,630]],
    tend:[[740,270],[860,300],[1000,330],[1200,345],[1640,357]],
    knot:[650,270],peak:[720,266],ilEnd:810,ilBx:694,fiA:0,ilA:0,tdA:0,vA:0,knotA:0},
};
function lerpK(A,B,k){const o={};for(const n in A){const a=A[n],b=B[n];
  o[n]=typeof a==='number'?lerp(a,b,k):Array.isArray(a[0])?a.map((p,i)=>[lerp(p[0],b[i][0],k),lerp(p[1],b[i][1],k)]):[lerp(a[0],b[0],k),lerp(a[1],b[1],k)]}return o}
// closed band of half-width h around an open centreline, tapered over the first few points (tendon leaving the bone)
function bandPoly(P,h){const L=[],R=[];for(let i=0;i<P.length;i++){const a=P[Math.max(i-1,0)],b=P[Math.min(i+1,P.length-1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l,w=h*Math.min(1,.35+i/10);
  L.push([P[i][0]+nx*w,P[i][1]+ny*w]);R.push([P[i][0]-nx*w,P[i][1]-ny*w])}return L.concat(R.reverse(),[L[0].slice()])}
function makeGeo(K,al){
  const G={K,al:al||{fi:K.fiA,il:K.ilA,td:K.tdA,v:K.vA,knot:K.knotA}};
  G.skinTop=SKIN_T;G.skinDeep=SKIN_D;
  G.sl=spline(K.sl,false);
  G.io=spline(K.io,true,10);G.sa=spline(K.sa,true,10);
  G.fasciaIliaca=spline(K.fi,false);G.fiR=resample(G.fasciaIliaca,4);
  G.bone=spline(K.bone,false);
  G.tendC=spline(K.tend,false);G.tendon=bandPoly(G.tendC,8.5);
  // iliacus: from fascia iliaca down to the ilium, ending cephalad of the bony peak where it tapers onto the bone
  const top=[],bot=[];for(let x=-40;x<=K.ilEnd;x+=8)top.push([x,yAt(G.fasciaIliaca,x)]);
  const bx=K.ilBx,by=yAt(G.bone,bx)-1,e=top[top.length-1],cp=[lerp(e[0],bx,.8),lerp(e[1],by,.22)];
  const taper=[e.slice()];for(let i=1;i<=12;i++){const q=i/12;taper.push([(1-q)*(1-q)*e[0]+2*q*(1-q)*cp[0]+q*q*bx,(1-q)*(1-q)*e[1]+2*q*(1-q)*cp[1]+q*q*by])}
  for(let x=bx-8;x>=-40;x-=8)bot.push([x,yAt(G.bone,x)-2]);
  G.ilTaper=taper;G.iliacus=top.concat(taper.slice(1),bot,[[-40,yAt(G.bone,-40)-2],top[0].slice()]);
  // roof: lower border of the abdominal wall and sartorius over fascia iliaca (caps how far LA can lift it)
  G.roof=[];for(let x=-40;x<=1640;x+=8){const a=vSpan(G.io,x),b=vSpan(G.sa,x);let y=-1e9;if(a[0]<a[1])y=Math.max(y,a[1]);if(b[0]<b[1])y=Math.max(y,b[1]);if(y<0)y=yAt(G.sl,x)+20;G.roof.push([x,y])}
  G.band=G.skinDeep.concat(G.sl.slice().reverse());
  const b0=G.bone[0][1],b1=G.bone[G.bone.length-1][1];
  G.deep=G.sl.concat(G.bone.slice().reverse());
  G.under=G.bone.concat([[1640,900],[-40,900]]);
  const a=G.al;
  G.OUT=[
    {p:mkPath(PROBE),t:[0.4,2.2],w:2.2},
    {p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {p:mkPath(G.io),t:[1.9,3.9],w:2.1,dbl:mkPath(insetV(G.io,3.2))},
    {p:mkPath(G.sa),t:[2.0,4.0],w:2.1,dbl:mkPath(insetV(G.sa,3.2))},
    {p:mkPath(G.ilTaper),t:[2.2,4.4],w:1.6,a:.8,al:a.il},
    {p:mkPath(G.tendon),t:[2.6,3.8],w:1.5,a:.85,al:a.td},
    {p:mkPath(G.bone),t:[2.8,4.2],w:2.8,glow:true,fade:true},
  ];
  return G;
}
const GEO={fib:makeGeo(KF.fib),aiis:makeGeo(KF.aiis),asis:makeGeo(KF.asis)};
/* Region textures: each tissue type is drawn once over the area it can occupy in any keyframe, then clipped to the
   live outline. The block view and keyframes are cached; the scanning morph paints from these every frame, so the
   texture always matches the morphing geometry (no cross-faded ghosts). */
function lobulesGrid(g,x0,y0,x1,y1,r,rxa,rxb,rya,ryb,col,tries){
  const cell=40,grid=new Map(),key=(i,j)=>i+','+j;
  for(let n=0;n<tries;n++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),rx=rxa+r()*(rxb-rxa),ry=rya+r()*(ryb-rya);
    const ci=Math.floor(x/cell),cj=Math.floor(y/cell);let hit=false;
    for(let di=-1;di<=1&&!hit;di++)for(let dj=-1;dj<=1&&!hit;dj++){const L=grid.get(key(ci+di,cj+dj));if(L)hit=L.some(p=>Math.hypot((p.x-x)/(p.rx+rx),(p.y-y)/(p.ry+ry))<.92)}
    if(hit)continue;const p={x,y,rx,ry,a:(r()-.5)*.6},k=key(ci,cj);(grid.get(k)||grid.set(k,[]).get(k)).push(p);
    g.beginPath();g.ellipse(x,y,rx,ry,p.a,0,Math.PI*2);g.fillStyle='rgba(255,246,236,.35)';g.fill();g.strokeStyle=col;g.lineWidth=.9;g.stroke()}
}
const TEX=(function(){
  const r=rng(7),T={};
  let [c,g]=layer();g.fillStyle=C.fat;g.fillRect(0,0,W,H);lobulesGrid(g,-20,180,1620,900,r,9,17,6,11,'rgba(150,88,58,.26)',26000);T.fat=c;
  [c,g]=layer();g.fillStyle=C.sub;g.fillRect(0,0,W,H);lobulesGrid(g,-20,140,1620,330,r,14,24,9,15,'rgba(150,88,58,.30)',9000);T.sub=c;
  const musc=(R,ang,n,la,lb)=>{const [c,g]=layer(),P=[[R[0],R[1]],[R[2],R[1]],[R[2],R[3]],[R[0],R[3]]];const gr=g.createLinearGradient(R[0],R[1],R[2],R[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
    g.fillStyle=gr;g.fillRect(0,0,W,H);fibres(g,P,ang,n,r,1,la,lb);return c};
  T.il=musc([-60,420,1000,830],-0.17,3600,40,130);   // iliacus, long axis parallel to fascia iliaca
  {const g=T.il.getContext('2d');g.save();g.setTransform(LS,0,0,LS,0,0);fibres(g,[[900,430],[1660,430],[1660,760],[900,760]],0.03,2400,r,1,40,130);g.restore()}   // iliopsoas caudad, under sartorius
  T.io=musc([-60,240,980,460],0.1,1900,30,90);       // internal oblique (cephalad wing)
  T.sa=musc([700,250,1640,470],-0.06,1900,30,90);    // sartorius (caudad wing)
  return T;
})();
function paintTissue(tg,G){
  const K=G.K,a=G.al,r=rng(11);
  const clipDraw=(P,img,al=1,edge)=>{if(al<=0)return;tg.save();tg.globalAlpha*=al;polyPath(tg,P);tg.clip();tg.drawImage(img,0,0,W,H);
    if(edge){tg.lineWidth=22;tg.strokeStyle='rgba(176,96,56,.15)';polyPath(tg,P);tg.stroke()}tg.restore()};
  // deep fat between the superficial line and bone (extraperitoneal fat around the deep circumflex iliac vessels), then the subcutaneous band
  clipDraw(G.deep,TEX.fat);clipDraw(G.band,TEX.sub);
  // muscles in long axis (sagittal view): iliacus parallel to fascia iliaca, the bow-tie wings converging on the knot
  clipDraw(G.iliacus,TEX.il,a.il,true);clipDraw(G.io,TEX.io,1,true);clipDraw(G.sa,TEX.sa,1,true);
  // rectus femoris tendon: bright fibrillar band leaving the AIIS caudad, deep to sartorius
  if(a.td>0){tg.save();tg.globalAlpha*=a.td;polyPath(tg,G.tendon);tg.fillStyle='#f8ebdd';tg.fill();tg.clip();
    for(let o=-6;o<=6;o+=1.5){const P=G.tendC.map(p=>[p[0],p[1]+o+(r()-.5)*.8]);linePath(tg,P);tg.strokeStyle=`rgba(${r()<.5?'150,96,64,.38':'255,252,246,.9'})`;tg.lineWidth=.6;tg.stroke()}tg.restore()}
  // bow-tie knot: the inguinal ligament where internal oblique and sartorius taper to meet
  if(a.knot>0){const [kx,ky]=K.knot;tg.save();tg.globalAlpha*=a.knot;tg.beginPath();tg.ellipse(kx,ky,22,6,0,0,Math.PI*2);tg.fillStyle='#f8ebdd';tg.fill();tg.clip();
    for(let i=0;i<9;i++){const y=ky-5+i*1.3;tg.beginPath();tg.moveTo(kx-24,y);tg.bezierCurveTo(kx-8,y-1,kx+8,y+1,kx+24,y);tg.strokeStyle=`rgba(${i%2?'150,96,64,.4':'255,252,246,.95'})`;tg.lineWidth=.7;tg.stroke()}tg.restore()}
  // acoustic shadow beneath bone, densest under the bony peak
  tg.save();polyPath(tg,G.under);tg.clip();tg.fillStyle='rgba(96,56,36,.07)';tg.fillRect(0,0,W,H);
  for(let i=0;i<12;i++){linePath(tg,G.bone);tg.strokeStyle='rgba(96,56,36,.022)';tg.lineWidth=10+i*11;tg.stroke()}
  tg.translate(K.peak[0]+10,K.peak[1]);tg.scale(1.1,1);const sg=tg.createRadialGradient(0,0,8,0,0,170);sg.addColorStop(0,'rgba(96,56,36,.30)');sg.addColorStop(.6,'rgba(96,56,36,.12)');sg.addColorStop(1,'rgba(96,56,36,0)');tg.fillStyle=sg;tg.fillRect(-220,0,440,240);tg.restore();
  const gr=tg.createLinearGradient(0,730,0,850);gr.addColorStop(0,'rgba(244,236,225,0)');gr.addColorStop(1,'rgba(244,236,225,1)');tg.fillStyle=gr;tg.fillRect(0,730,W,H-730);
}
const tissueCache={};
function tissue(v){if(tissueCache[v])return tissueCache[v];const [cv,tg]=layer();paintTissue(tg,GEO[v]);return tissueCache[v]=cv}

/* ---------- anatomy ---------- */
// guide set: depth ruler, superficial line and fascia iliaca horizontals, dashed vessel ring, dashed fascia iliaca reveal
const guideSet=(sl,fi,ring,reveal)=>[
  {p:mkPath([[36,140],[36,800]]),t:[0,1.2]},
  {p:mkPath([[40,sl],[1560,sl]]),t:[0.3,1.7]},
  {p:mkPath([[60,fi],[1540,fi]]),t:[0.5,1.9]},
].concat(ring?[{p:mkPath(ellipsePts(ring[0],ring[1],ring[2],ring[2])),t:[0.8,2.6],dash:[6,6]}]:[],[{p:mkPath(reveal),t:[0.8,2.6],dash:[8,8]}]);
const DCIA={x:600,y:420,r:15,veins:[[-30,4,10,7],[31,5,10,7]]};
const ANAT={
  fib:{geo:'fib',dcia:DCIA,cross:[[600,420]],
    guides:guideSet(290,451,[600,420,34],GEO.fib.fasciaIliaca.map(p=>[p[0],p[1]-10])),
    muscles:[['Internal oblique',250,372],['Sartorius',1460,396],['Iliacus',560,662],['Iliopsoas',1400,585]],
    pills:[['Deep circumflex iliac artery',420,212,'right',s=>[s.dcia.x-5,s.dcia.y-15]],
      ['Inguinal ligament (bow-tie)',900,226,'right',()=>[782,362]],
      ['Fascia iliaca',960,500,'left',()=>[858,yAt(GEO.fib.fasciaIliaca,858)]],
      ['AIIS',1150,640,'left',()=>[KF.fib.peak[0]+4,KF.fib.peak[1]+2]]],
    bone:['Ilium',640,()=>yAt(GEO.fib.bone,660)+30],
  },
  scan:{geo:'asis',cross:[[720,266]],
    guides:guideSet(252,266,null,GEO.asis.bone.map(p=>[p[0],p[1]-10]))},
};
const TENT=30,TPOP=12.335;
// 40 mL: a 2 mL hydrodissection test (hold and watch fascia iliaca lift), the rest of the first 5 mL, then 7 x 5 mL,
// aspirating between aliquots. [start, end, mL, aspirate after]
const ALQ=[[0,.5,2,0],[1.3,1.9,3,1]];for(let i=0;i<7;i++){const a=2.35+i*1.45;ALQ.push([a,a+1,5,i<6?1:0])}
const ALQ_END=ALQ[ALQ.length-1][1];
const DRUG='Ropivacaine 0.2%',DOSE=40,MGML=2;   // ropivacaine 0.2% = 2 mg/mL; 40 mL = 80 mg (guide.html dose-fib)
function aliquots(t,t0){let v=0;ALQ.forEach(([a,b,m])=>{v+=m*ease(seg(t,t0+a,t0+b))});
  const paused=ALQ.some(([a,b,m,f],i)=>f&&i<ALQ.length-1&&t>t0+b&&t<t0+ALQ[i+1][0]);return{v,paused}}
/* laAnchor: leader point at the thickest column of a planeLA polygon (default s.la) between xmin and xmax */
function laAnchor(s,xmin,P=s.la,xmax=1e9){
  if(!P)return[400,480];const n=P.length/2;let best=-1,pt=null;
  for(let i=0;i<n;i++){const a=P[i],b=P[P.length-1-i];if(a[0]<xmin||a[0]>xmax)continue;const th=b[1]-a[1];if(th>best){best=th;pt=[a[0],(a[1]+b[1])/2]}}
  return pt||[400,480];
}
/* fibSpread: LA injected beneath fascia iliaca at inj, k = fraction of the planned volume (0..1). A volume block:
   an asymmetric lens lifts fascia iliaca off iliacus and tracks CEPHALAD into the iliac fossa (to the left edge at
   40 mL), caudad only to under the bow-tie. The lift is capped by the abdominal wall above (roof), less any pool
   already lying on fascia iliaca (extra), and under the deep circumflex iliac vessels, which ride up a few px with
   the fascia, so LA passes BELOW them. Small dip into iliacus. */
function vesselBottom(V,dy,x,pad){let b=-1e9;[[V.x,V.y-dy,V.r+2,V.r+2]].concat(V.veins.map(v=>[V.x+v[0],V.y+v[1]-dy,v[2]+1,v[3]+1])).forEach(([cx,cy,rx,ry])=>{const d=(x-cx)/(rx+pad);if(Math.abs(d)<1)b=Math.max(b,cy+ry*Math.sqrt(1-d*d))});return b}
function fibSpread(G,inj,k,V,extra){
  if(k<=0)return null;
  const sk=Math.sqrt(k),xc=inj[0]-lerp(10,90,sk),wl=40+700*sk,wr=30+220*sk,Tm=95*Math.pow(k,.6);
  const ride=9*ease(clamp((k-.03)*6));
  // under the vessels the lifted fascia stays below their lowest point, rising gently on either side (a broad valley,
  // so the LA visibly passes beneath the vessels rather than wrapping round them)
  const vb=Math.max(V.y+V.r,...V.veins.map(v=>V.y+v[1]+v[3]))+4-ride;
  const cap=x=>{const fy=yAt(G.fasciaIliaca,x),d=Math.abs(x-V.x)-62,c=smin(fy-yAt(G.roof,x)-9-(extra?extra(x):0),fy-vb+.225*(d+Math.sqrt(d*d+900)),14);return Math.max(0,c)};
  const lift=x=>Math.max(0,smin(Tm*bump((x-xc)/(x<xc?wl:wr)),cap(x),10));
  const Dt=22*Math.sqrt(Math.min(1,k*10)),wt=40+60*sk,Dm=14*sk;
  const dip=x=>Math.max(Dt*bump((x-(inj[0]-10))/wt),Dm*bump((x-xc)/(x<xc?wl*.7:wr)));
  return{lift,dip,x0:Math.max(-40,Math.floor(xc-wl)),x1:Math.min(1576,Math.ceil(Math.max(xc+wr,inj[0]-10+wt))),dcia:Object.assign({},V,{y:V.y-ride})};
}
// correct in-plane: tip passes sartorius (first give at its epimysium), tents and pierces fascia iliaca, LA lifts it off iliacus
function positive(o){
  const A=ANAT.fib,G=GEO.fib,NS=o.NS,NT=o.NT;
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  let uc=.99;for(let u=.3;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(G.fiR,q[0])){uc=u;break}}
  const ut=Math.min(uc+TENT/L,.999),P=Math.min(1,ut+16/L),Pc=along(NS,NT,uc),ph=tentPhase(o.phase,uc,ut,P);
  return Object.assign({
    Tend:32,vol:DOSE,volT:12.4,magT:26.2,laT:14.6,
    guides:[[along(NS,NT,o.phase[1]),NT,7.6,12.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){na=seg(t,8.3,8.9);const r=ph(t);tip=along(NS,NT,r.u);if(r.sh&&!reduceMotion){tip[0]+=D[0]*r.sh;tip[1]+=D[1]*r.sh}
        tent=t<TPOP?clamp((r.u-uc)*L,0,TENT):TENT*Math.exp(-(t-TPOP)*9)*(reduceMotion?1:Math.cos((t-TPOP)*26))}
      const I=aliquots(t,o.k[0]),k=I.v/DOSE;
      const sp=fibSpread(G,o.inj||NT,k,A.dcia,o.extra),lift=sp?sp.lift:()=>0;
      let fi=G.fiR.map(p=>[p[0],p[1]-lift(p[0])]);
      if(Math.abs(tent)>.05)fi=fi.map(p=>{const w=Math.exp(-Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/40); /* cusped profile: a V under the tip */return[p[0]+D[0]*tent*w,p[1]+D[1]*tent*w]});
      const pocket=sp?planeLA(G.fiR,sp.lift,sp.dip,sp.x0,sp.x1):null;
      return{S:NS,tip,na,k,v:I.v,paused:I.paused,fi,fl:G.sl,la:pocket,inj:o.inj||NT,mode:'in',dcia:sp?sp.dcia:A.dcia};
    }},o);
}
// in-plane needle line (caudad to cephalad, ~31 degrees to the skin, entry ~3.4 cm caudad of the probe centre)
const IP={anat:'fib',NS:[1520,-40],NT:[690,470],k:[13.1],phase:[.04,.3,.74,.755]};
const ATEND=13.1+ALQ_END;   // last aliquot ends (correct scenario)
const SC={
  inplane:positive(Object.assign({},IP,{
    subtitle:'Sagittal in-plane, caudad to cephalad',Tend:32,magT:26.2,
    mag:{CX:300,CY:700,R:120,Z:1.8,focus:s=>[600,452],text:['Below fascia iliaca,','under the artery: correct plane']},
    la:[[430,590,'left',s=>laAnchor(s,300,s.la,560),'LA beneath fascia iliaca']],
    caps:[[0,8.2,'1','Sagittal at the bow-tie. Fascia iliaca lies on iliacus; the deep circumflex iliac artery sits above it.'],
      [8.2,11.5,'2','In-plane from caudad, 2 to 4 cm below the inguinal ligament. The needle passes through sartorius.'],
      [11.5,13.1,'3','Fascia iliaca tents, then gives. The tip lies just beneath it, on iliacus, caudad of the artery.'],
      [13.1,15.0,'4','Inject 2 mL: fascia iliaca lifts off iliacus. Swelling within the muscle means withdraw.'],
      [15.0,ATEND+.4,'5','Ropivacaine 0.2% in 5 mL aliquots, aspirating. LA tracks cephalad beneath fascia iliaca, under the artery.'],
      [ATEND+.4,99,'6','40 mL in. A volume block: LA spreads cephalad in the iliac fossa beneath fascia iliaca.']]})),
};

/* fixLedger: volume ledger for a negative example with an animated fix. Before tFix nothing; from tFix the counter
   restarts for the corrected injection and the ledger lists misplaced + corrected volume and the total dose. */
function fixLedger(label,off,tFix){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL','Beneath fascia iliaca: '+b.toFixed(1)+' mL',DRUG.replace('R','Total r')+': '+tot.toFixed(1)+' mL ('+Math.round(tot*MGML)+' mg)']}}}
// negative example 1 (very common): the give at the sartorius epimysium is taken for fascia iliaca. The tip stops under
// the bow-tie, deep to internal oblique but still ABOVE fascia iliaca, and 5 mL pools on an intact fascia iliaca up to
// the caudad edge of the deep circumflex vessels. Fix: advance on the same line, tent and pierce fascia iliaca
// (FIX = positive(IP) on a shifted clock), then the planned 40 mL. The misplaced pool stays on top of the fascia.
(function(){
  const G=GEO.fib,NS=IP.NS,NT=[765,yAt(G.fiR,765)-12];
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  const OFF=5,uR=(NS[0]-NT[0])/(NS[0]-IP.NT[0]);   // the stopped tip lies on the in-plane line
  const uS=(NS[0]-905)/(NS[0]-NT[0]);               // sartorius epimysium on this line
  const TW=20.6,TR=21.2,TF=21.8,SHIFT=TF-11.05;      // warnings fade, advance starts, hand-off to the in-plane clock
  const poolT=x=>44*bump((x-700)/(x<700?110:130));  // the full 5 mL pool resting on fascia iliaca
  const FIX=positive(Object.assign({},IP,{phase:[uR,uR,uR,uR],extra:poolT}));
  const lensLA=(fi,v)=>{const k=v/OFF,sk=Math.sqrt(k),xc=lerp(760,700,sk),wl=20+90*sk,wr=24+106*sk,Tm=44*Math.pow(k,.6);
    return k>0?planeLA(fi,x=>Tm*bump((x-xc)/(x<xc?wl:wr)),()=>0,Math.floor(xc-wl),Math.ceil(xc+wr)):null};
  const FXI=FIX.k[0]+SHIFT,MT=FXI+ALQ_END+.6;    // corrected injection starts; magnifier
  SC.aboveFI={anat:'fib',pill:'Above fascia iliaca',Tend:MT+6.2,vol:DOSE,volT:12.4,magT:MT,laT:14.2,neg:true,
    subtitle:'Negative example: a common needle error',
    mag:{CX:300,CY:700,R:120,Z:1.6,focus:s=>[660,440],text:['5 mL above fascia iliaca,','40 mL below it']},
    pillAt:{'Deep circumflex iliac artery':[300,212]},
    la:[[560,212,'right',s=>laAnchor(s,640,s.laOff,780),'LA above fascia iliaca',14.2],
      [430,590,'left',s=>laAnchor(s,300,s.la,560),'LA beneath fascia iliaca',FXI+1.2]],
    guides:[[along(NS,NT,.3),NT,7,11],[along(IP.NS,IP.NT,.86),IP.NT,TR-.2,TF+1.6]],
    caps:[[0,8.2,'1','Sagittal at the bow-tie. Fascia iliaca lies on iliacus; the deep circumflex iliac artery sits above it.'],
      [8.2,12.8,'2','Error: the tip passes sartorius, feels a give and stops. It is still above fascia iliaca.'],
      [12.8,17.5,'3','LA pools deep to internal oblique, above fascia iliaca, up to the artery. Fascia iliaca stays flat.'],
      [17.5,TR,'4','Error recognised: LA above fascia iliaca is the commonest cause of failure. Stop at 5 mL.'],
      [TR,FXI+.75,'5','Fix: advance. Fascia iliaca tents, then gives; the tip lies just beneath it, on iliacus.'],
      [FXI+.75,MT,'6','Ropivacaine 0.2%, the planned 40 mL, in 5 mL aliquots with aspiration. Fascia iliaca lifts off iliacus.'],
      [MT,99,'7','Total 45 mL, 90 mg: 5 mL wasted above fascia iliaca; 40 mL beneath spreads cephalad.']],
    ledger:fixLedger('Above fascia iliaca',OFF,TR),
    state(t){
      const vOff=OFF*ease(seg(t,12.8,15.8));
      if(t>=TR){const s=FIX.state(Math.max(t-SHIFT,11.05));s.laOff=lensLA(s.fi,vOff);return s}
      let tip=[-99,-99],na=seg(t,8.3,8.8),shake=0;
      if(t>=8.3){
        let u;
        if(t<8.9)u=lerp(.06,.4,easeOut(seg(t,8.3,8.9)));
        else if(t<10.5)u=lerp(.4,uS,ease(seg(t,8.9,10.5)));
        else if(t<10.95){const p=pop(t,10.5,uS,uS+.02,3);u=p.u;shake=p.sh}
        else if(t<11.9)u=lerp(uS+.02,1,ease(seg(t,10.95,11.9)));
        else u=1;
        tip=along(NS,NT,u);if(shake&&!reduceMotion){tip[0]+=D[0]*shake;tip[1]+=D[1]*shake}
      }
      return{S:NS,tip,na,k:vOff/OFF,v:vOff,fi:G.fiR,fl:G.sl,la:null,laOff:lensLA(G.fiR,vOff),inj:NT,mode:'out',dcia:ANAT.fib.dcia};
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+2.4,FXI+3.0);if(ok>0)cuePill(c,'Fascia iliaca lifting: correct plane',1000,390,ok);return}
      const a1=seg(t,12.1,12.6)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Above fascia iliaca',1040,340,[s.tip[0]+18,s.tip[1]+6],a1)}
      const a4=seg(t,15.0,15.6)*f;
      if(a4>0){const V=s.dcia;c.save();c.globalAlpha=a4*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(V.x,V.y+2,50,24,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'LA around the artery: tip too superficial, aspirate',560,544,[V.x+4,V.y+26],a4)}
      const a2=seg(t,16.2,16.8)*f;
      if(a2>0)warnPill(c,'Fascia iliaca not lifting',1040,390,[836,yAt(G.fiR,836)],a2);
      const a3=seg(t,17.6,18.2)*f;
      if(a3>0)warnPill(c,'Stop at 5 mL',1040,440,null,a3);
    }};
})();
// negative example 2: intramuscular. Fascia iliaca tents and gives (positive() on a deeper line), but the tip keeps
// going ~2 mm into iliacus and 2 mL swells inside the muscle, along its fibres. Fix: slow withdrawal to just beneath
// fascia iliaca, then the correct spread (positive() on a shifted clock).
(function(){
  const G=GEO.fib,NS=IP.NS,NT=[690,yAt(G.fiR,690)+30];          // deep tip, inside iliacus
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]);
  const OFF=2,TW=19.4,TR=20.0,TB=22.2,FA=-0.17;  // misplaced volume; warnings fade, withdrawal start and end; fibre angle
  const uS=(NS[0]-950)/(NS[0]-NT[0]);
  const DEEP=positive(Object.assign({},IP,{NT,phase:[.04,.26,uS,uS+.015],k:[1e9]}));
  let uc=.99;for(let u=.3;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(G.fiR,q[0])){uc=u;break}}
  const uW=uc+22/L,INJ=along(NS,NT,uW);           // just beneath fascia iliaca, on the iliacus surface
  const FXI=22.6,FIX=positive(Object.assign({},IP,{NT:INJ,phase:[1,1,1,1]})),SHIFT=FXI-FIX.k[0],MT=FXI+ALQ_END+.6;
  // intramuscular LA: a contained swelling elongated along the fibres, with streaks tracking between them
  const imLA=v=>{const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),cr=Math.cos(FA),sr=Math.sin(FA),P=[];
    const cx=NT[0]-6,cy=NT[1],R=(x,y)=>[cx+x*cr-y*sr,cy+x*sr+y*cr];
    for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,w=1+.12*Math.sin(a*3+1)+.06*Math.sin(a*5);P.push(R(Math.cos(a)*30*sk*w,Math.sin(a)*8*sk*w))}
    const st=[[-1,-3,28],[1,3,26],[-1,5,20],[1,-4,18]].map(([d,dy,len])=>{const ln=len*sk,x0=d*24*sk+d*ln/2,c0=R(x0,dy*sk);
      return ellipsePts(c0[0],c0[1],ln/2,2.2*sk+.5,24,-Math.PI/2,FA)});
    return{x:cx,y:cy,rx:30*sk,ry:8*sk,rot:FA,polys:[P].concat(st)}};
  SC.intraIliacus={anat:'fib',pill:'Into iliacus (iliopsoas)',Tend:MT+6.2,vol:DOSE,volT:12.4,magT:MT,laT:FXI+1.2,neg:true,
    subtitle:'Negative example: a common needle error',
    mag:{CX:300,CY:700,R:120,Z:1.5,focus:s=>[640,480],text:['2 mL in iliacus,','40 mL beneath fascia iliaca']},
    la:[[430,590,'left',s=>laAnchor(s,300,s.la,560),'LA beneath fascia iliaca',FXI+1.2]],
    guides:[[along(NS,NT,.3),NT,7,11]],
    caps:[[0,8.2,'1','Sagittal at the bow-tie. Fascia iliaca lies on iliacus; the deep circumflex iliac artery sits above it.'],
      [8.2,13.4,'2','Error: fascia iliaca tents and gives, but the tip keeps going, just beyond the intended plane into iliacus.'],
      [13.4,17.4,'3','LA swells inside iliacus, between its fibres. Fascia iliaca does not lift off the muscle.'],
      [17.4,TR,'4','Error recognised: intramuscular injection, a common cause of failure. Stop after 2 mL.'],
      [TR,FXI+.6,'5','Fix: withdraw slowly until the tip sits just beneath fascia iliaca, on the iliacus surface.'],
      [FXI+.6,MT,'6','Ropivacaine 0.2%, the planned 40 mL, in 5 mL aliquots with aspiration. Fascia iliaca lifts off iliacus.'],
      [MT,99,'7','Total 42 mL, 84 mg: 2 mL in iliacus; 40 mL beneath fascia iliaca spreads cephalad.']],
    ledger:fixLedger('Intramuscular',OFF,TR),
    state(t){
      const vIM=OFF*ease(seg(t,13.8,16.0)),im=imLA(vIM);
      let s;
      if(t<TB){s=DEEP.state(Math.min(t,13.3));s.v=vIM;s.k=0;s.paused=false;s.la=null;
        if(t>=TR){s.v=0;s.tip=along(NS,NT,lerp(1,uW,ease(seg(t,TR,TB))))}}
      else s=FIX.state(Math.max(t-SHIFT,13.2));
      s.im=im;return s;
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+1.0,FXI+1.6);if(ok>0)cuePill(c,'Fascia iliaca lifting: correct plane',1000,390,ok);return}
      const a1=seg(t,13.4,13.9)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Tip in iliacus: intramuscular',120,640,[s.tip[0]-14,s.tip[1]+18],a1)}
      const a2=seg(t,16.2,16.8)*f;
      if(a2>0)warnPill(c,'Fascia iliaca not lifting',1040,390,[905,yAt(G.fiR,905)],a2);
      const a3=seg(t,17.5,18.1)*f;
      if(a3>0)warnPill(c,'Stop',120,690,null,a3);
    }};
})();

/* Find the view: scanning scenario, no needle. scanMix(t) drives both the scan and the probe view.
   p 0: probe sagittal on the ASIS; p .55: slid infero-medially onto the AIIS; p 1: the bow-tie (block view). */
function scanMix(t){return .55*ease(seg(t,12.6,16.4))+.45*ease(seg(t,19.4,22))}
(function(){
  const tr=(t,a,b)=>ease(seg(t,a,a+.6))*(b===undefined?1:1-ease(seg(t,b,b+.6)));
  const mid=(P,x)=>{const v=vSpan(P,x);return(v[0]+v[1])/2+7};
  SC.scan={anat:'scan',scan:true,Tend:31,vol:DOSE,volT:1e9,magT:24.6,laT:1e9,hint:'Press play to scan',
    subtitle:'Scanning: ASIS to AIIS to bow-tie',
    mag:{CX:300,CY:700,R:120,Z:1.8,focus:()=>[600,446],text:['Artery above fascia iliaca:','inject below it']},
    la:[],guides:[],
    caps:[[0,10,'1','Probe sagittal on the ASIS, caudad on screen right. The ASIS is a bright bony step with a dense shadow.'],
      [10,12.6,'2','Sartorius arises from the ASIS caudad; the abdominal wall muscles attach to the crest cephalad.'],
      [12.6,17.4,'3','Slide infero-medially. The ilium drops deeper and the AIIS appears, rectus femoris tendon attached.'],
      [17.4,19.8,'4','Cephalad of the AIIS, iliacus lies on the ilium, covered by the bright line of fascia iliaca.'],
      [19.8,23.4,'5','Find the bow-tie: internal oblique and sartorius taper to meet at the inguinal ligament.'],
      [23.4,27.6,'6','The deep circumflex iliac artery pulses above fascia iliaca, cephalad of the bow-tie. Your target lies below it.'],
      [27.6,99,'7','Large pannus? Tape it cephalad or have an assistant retract it. Use a curvilinear probe if deep.']],
    state(t){
      const p=scanMix(t),q1=clamp(p/.55),q2=clamp((p-.55)/.45);
      const al={fi:ease(seg(q1,.5,1)),il:ease(seg(q1,.55,1)),td:ease(seg(q1,.45,.9))*(1-ease(seg(q2,0,.6))),v:ease(seg(q2,.55,1)),knot:ease(seg(q1,.6,1))};
      const G=q2>=1?GEO.fib:(q1<=0?GEO.asis:makeGeo(q2>0?lerpK(KF.aiis,KF.fib,q2):lerpK(KF.asis,KF.aiis,q1),al));
      return{S:[0,0],tip:[-99,-99],na:0,k:0,v:0,fi:G.fiR,fl:G.sl,fiA:G.al.fi,vA:G.al.v,la:null,G,dcia:DCIA,gA:1-seg(t,8.3,9.3),p,q1,q2,anat:'scan'};
    },
    labels(c,s,a){
      const t=s.t,G=s.G,K=G.K,A=ANAT.fib,al=G.al;
      // bony peak: ASIS first, then AIIS
      const pa=a*(1-ease(seg(s.p,.06,.16)));if(pa>0)pill(c,'ASIS',600,212,'right',[K.peak[0]-4,K.peak[1]-3],pa);
      const ab=a*ease(seg(s.p,.38,.5));if(ab>0)pill(c,'AIIS',1150,lerp(600,640,s.q2),'left',[K.peak[0]+4,K.peak[1]+2],ab);
      // muscles: centred in their depth at a fixed x
      const ma=a*tr(t,9.6);
      if(ma>0){const w1=1-ease(seg(s.p,.12,.22)),w2=ease(seg(s.p,.26,.36));
        if(w1>0)muscleLabel(c,'Abdominal wall muscles',280,mid(G.io,280),ma*w1);if(w2>0)muscleLabel(c,'Internal oblique',250,mid(G.io,250),ma*w2);
        muscleLabel(c,'Sartorius',1460,mid(G.sa,1460),ma);const ip=ma*ease(seg(s.q2,.6,1));if(ip>0)muscleLabel(c,'Iliopsoas',1400,585,ip)}
      const ta=a*tr(t,15.4)*al.td;if(ta>0)pill(c,'Rectus femoris tendon',1220,462,'left',[1180,yAt(G.tendC,1180)-5],ta);
      const ia=a*tr(t,17.4)*al.il;if(ia>0){muscleLabel(c,'Iliacus',560,mid(G.iliacus,560)+8,ia);
        c.save();c.globalAlpha=ia*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText('Ilium',A.bone[1],yAt(G.bone,A.bone[1]+20)+30);c.restore()}
      const fa=a*tr(t,17.7)*al.fi;if(fa>0){const x=Math.min(K.ilEnd-24,858);pill(c,'Fascia iliaca',960,500,'left',[x,yAt(G.fasciaIliaca,x)],fa)}
      const ka=a*tr(t,20.4)*al.knot;if(ka>0)pill(c,'Inguinal ligament (bow-tie)',900,226,'right',[K.knot[0]+2,K.knot[1]-5],ka);
      const va=a*tr(t,23.4)*al.v;if(va>0)pill(c,'Deep circumflex iliac artery',420,212,'right',[DCIA.x-5,DCIA.y-15],va);
    },
    warnings(c,t,s){
      // copper ring on the deep circumflex iliac artery: the landmark to stay deep to
      const ra=seg(t,23.6,24.2)*s.vA;
      if(ra>0){const pl=reduceMotion?1:.55+.45*Math.abs(Math.sin(t*4));c.save();c.globalAlpha=ra*pl;c.strokeStyle='rgb(168,85,42)';c.lineWidth=2.4;c.beginPath();c.ellipse(DCIA.x,DCIA.y+2,52,26,0,0,Math.PI*2);c.stroke();c.restore()}
    }};
})();
const TABS={scan:['scan'],inplane:['inplane'],error:['aboveFI','intraIliacus']};

/* ---------- drawing ---------- */
function drawDCIA(c,V,fillA,lineP,t){
  const pulse=reduceMotion?0:Math.pow(Math.max(0,Math.sin(t*Math.PI*2*1.15)),6);
  c.save();c.globalAlpha=fillA;
  V.veins.forEach(([dx,dy,rx,ry])=>{c.beginPath();c.ellipse(V.x+dx,V.y+dy,rx,ry,0,0,Math.PI*2);const g=c.createRadialGradient(V.x+dx,V.y+dy,1,V.x+dx,V.y+dy,rx);g.addColorStop(0,'#5a2a18');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();c.lineWidth=2.4;c.strokeStyle='rgba(242,200,170,.9)';c.stroke()});
  const ar=V.r*(1+.05*pulse);
  c.beginPath();c.arc(V.x,V.y,ar,0,Math.PI*2);const g=c.createRadialGradient(V.x-4,V.y-4,2,V.x,V.y,ar);g.addColorStop(0,'#5e2c19');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();
  c.lineWidth=4.5;c.strokeStyle='rgba(242,200,170,.95)';c.stroke();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=1.4;V.veins.forEach(([dx,dy,rx,ry])=>strokePartial(c,mkPath(ellipsePts(V.x+dx,V.y+dy,rx+1.6,ry+1.6,40)),lineP));
  c.lineWidth=1.7;strokePartial(c,mkPath(ellipsePts(V.x,V.y,ar+2.6,ar+2.6,48)),lineP);c.restore();
}
// local anaesthetic collected in a fascial plane: s.la (target plane), s.laOff (misplaced pool) and s.im (intramuscular)
function drawLA(c,s,fillA){
  if(s.im){const m=s.im;c.save();c.globalAlpha=fillA;c.translate(m.x,m.y);c.rotate(m.rot||0);
    // fibres pushed apart: pale gap and compressed fibre arcs around the swelling
    c.beginPath();c.ellipse(0,0,m.rx+9,m.ry+7,0,0,Math.PI*2);c.fillStyle='rgba(248,226,206,.55)';c.fill();
    c.strokeStyle='rgba(92,50,30,.45)';c.lineWidth=1;[[12,8],[17,11],[23,14]].forEach(([dx,dy],i)=>{[0,Math.PI].forEach(a0=>{c.beginPath();c.ellipse(0,0,m.rx+dx,m.ry+dy,0,a0+.35,a0+Math.PI-.35);c.globalAlpha=fillA*(.7-i*.18);c.stroke()})});
    c.restore()}
  [s.laOff,s.la].concat(s.im?s.im.polys:[]).forEach(P=>{if(!P)return;
    const bb=bbox(P);
    c.save();c.globalAlpha=fillA;polyPath(c,P);
    const g=c.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,`rgba(${C.la},.80)`);g.addColorStop(.6,`rgba(${C.la},.88)`);g.addColorStop(1,`rgba(${C.la},.74)`);
    c.fillStyle=g;c.fill();c.strokeStyle='rgba(78,31,14,.55)';c.lineWidth=1.2;c.stroke();c.restore()});
}
// superficial line (external oblique aponeurosis / fascia lata) and fascia iliaca, drawn live; fascia iliaca covers
// iliacus only, so it fades out caudad of where iliacus ends (AIIS keyframe); at the bow-tie it runs the full width
function drawFascia(c,dT,s,G){
  c.save();c.lineJoin='round';c.lineCap='round';
  c.strokeStyle=C.ink;c.lineWidth=1.9;strokePartial(c,mkPath(s.fl),ease(seg(dT,1.5,3.3)));
  const fa=s.fiA??1;
  if(fa>0){const px=G.K.ilEnd,g=c.createLinearGradient(px-10,0,px+100,0);g.addColorStop(0,`rgba(43,30,24,${fa})`);g.addColorStop(1,'rgba(43,30,24,0)');
    c.strokeStyle=g;c.lineWidth=2.4;strokePartial(c,mkPath(s.fi),ease(seg(dT,1.7,3.6)))}
  c.restore();
}
function drawGuides(c,A,dT,gA){
  const fade=(dT<4?1:lerp(1,.32,seg(dT,4,6.5)))*gA;if(fade<=0)return;
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  A.guides.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  // depth ruler: 130 px per cm from the skin (y 147), minor tick every 5 mm
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=10;i++){if(i/10>tp)break;const y=147+i*65,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke();if(i){c.fillStyle=`rgba(${C.guide},${.72*Math.max(gA,.6)})`;c.font='400 13px Inter, system-ui, sans-serif';c.fillText((i/2)+' cm',56,y+4)}}}
  const cp=seg(dT,1.4,2.6)*gA;
  if(cp>0){c.globalAlpha=cp;A.cross.forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}
const PROBE_PATH=mkPath(PROBE);
/* core: one scan frame. A scenario state may supply s.G (morphed geometry): keyframe geometries use their cached
   tissue layer, a morph in between is painted live from the region textures (Find tab: ASIS -> AIIS -> bow-tie). */
function core(c,s,sub){
  const A=ANAT[s.anat||cur.anat],G=s.G||GEO.fib,dT=s.dT,t=s.t;
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  const key=Object.keys(GEO).find(k=>GEO[k]===G);
  c.save();c.globalAlpha=texA;if(key)c.drawImage(tissue(key),0,0,W,H);else paintTissue(c,G);c.restore();
  const ba=ease(seg(dT,6.3,7.8));
  if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(BEAM[0],BEAM[1],BEAM[2],652);c.restore()}
  if(!sub)drawGuides(c,A,dT,s.gA??1);
  c.save();c.lineJoin='round';c.lineCap='round';
  G.OUT.forEach((o,i)=>{if(i===0)return;const al=o.al??1;if(al<=0)return;const p=ease(seg(dT,o.t[0],o.t[1]));
    c.save();c.globalAlpha=al;
    const ink=o.a?`rgba(43,30,24,${o.a})`:C.ink;
    let st=ink,gl='rgba(255,251,244,.95)';
    if(o.fade){st=c.createLinearGradient(0,700,0,840);st.addColorStop(0,ink);st.addColorStop(1,'rgba(43,30,24,.08)');gl=c.createLinearGradient(0,700,0,840);gl.addColorStop(0,'rgba(255,251,244,.95)');gl.addColorStop(1,'rgba(255,251,244,0)')}
    if(o.glow){c.strokeStyle=gl;c.lineWidth=8;strokePartial(c,o.p,p)}
    c.strokeStyle=st;c.lineWidth=o.w;strokePartial(c,o.p,p);
    if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}
    c.restore()});
  c.restore();
  drawLA(c,s,texA);
  drawFascia(c,dT,s,G);
  const vA=s.vA??1;if(vA>0){c.save();c.globalAlpha=vA;drawDCIA(c,s.dcia||DCIA,texA,ease(seg(dT,3.0,4.4)),s.clock);c.restore()}
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,PROBE_PATH,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke()}
  c.restore();
  // orientation marker: sagittal view, cephalad on screen left, caudad on screen right
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    c.textAlign='left';c.fillText('Cephalad',540,130);c.textAlign='right';c.fillText('Caudad',1000,130);c.restore()}
  if(!sub)(cur.guides||[]).forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}
// red warning pill; the leader leaves from whichever end of the pill faces the anchor
function warnPill(c,text,x,y,anchor,a){
  c.save();c.globalAlpha=a;c.font='600 17px Inter, system-ui, sans-serif';const w=c.measureText(text).width+46,h=30;
  if(anchor){const sx=anchor[0]>x+w?x+w:x;c.strokeStyle=RED;c.lineWidth=1.3;c.beginPath();c.moveTo(sx,y);c.lineTo(anchor[0],anchor[1]);c.stroke()}
  c.fillStyle='#fbf1ea';c.beginPath();c.roundRect?c.roundRect(x,y-h/2,w,h,15):c.rect(x,y-h/2,w,h);c.fill();c.strokeStyle=RED;c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x+17,y,9,0,Math.PI*2);c.fillStyle=RED;c.fill();
  c.strokeStyle='#fbf1ea';c.lineWidth=2;c.beginPath();c.moveTo(x+13.5,y-3.5);c.lineTo(x+20.5,y+3.5);c.moveTo(x+20.5,y-3.5);c.lineTo(x+13.5,y+3.5);c.stroke();
  c.fillStyle=RED;c.textBaseline='middle';c.fillText(text,x+34,y+1);c.restore();
}
function drawLabels(c,s){
  const A=ANAT[cur.anat],a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  if(cur.labels){cur.labels(c,s,a);return}
  A.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a));
  if(A.bone){c.save();c.globalAlpha=a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText(A.bone[0],A.bone[1],A.bone[2]());c.restore()}
  A.pills.forEach(p=>{const v=p[5]?p[5](s):1,o=cur.pillAt&&cur.pillAt[p[0]];if(v>0)pill(c,p[0],o?o[0]:p[1],o?o[1]:p[2],p[3],p[4](s),a*v)});
  // cur.la: a list of [x,y,align,anchor,text,t0]
  cur.la.forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;
    if(la>0)pill(c,L[4]||'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)});
}
const TITLE='Supra-inguinal fascia iliaca block';
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  // the title sits left of the probe outline (x 520 at this height): fit it
  c.font='500 38px Fraunces, Georgia, serif';const tw=c.measureText(TITLE).width,fs=Math.min(38,Math.floor(38*448/tw));
  c.fillStyle=C.ink;c.font=`500 ${fs}px Fraunces, Georgia, serif`;c.fillText(TITLE,60,74);
  c.fillStyle=cur.neg?RED:'#7a6456';c.font='400 18px Inter, system-ui, sans-serif';c.fillText(cur.subtitle,62,104);
  c.restore();
  const va=seg(t,cur.volT,cur.volT+.6);
  if(va>0){c.save();c.globalAlpha=va;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText(DRUG,62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const vt=(s.v||0).toFixed(1)+' / '+cur.vol+' mL';c.fillText(vt,212,142);
    if(s.paused){const w=c.measureText(vt).width;c.fillStyle='#7a6456';c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText('aspirate',212+w+12,141)}
    c.restore()}
  // optional volume ledger, bottom right clear of the needle (negative example: misplaced + corrected volume, total dose)
  const lg=cur.ledger&&cur.ledger(s,t);
  if(lg&&lg.a>0){c.save();c.globalAlpha=lg.a;c.textAlign='right';c.font='400 16px Inter, system-ui, sans-serif';
    lg.lines.forEach((l,i)=>{const last=i===lg.lines.length-1;c.fillStyle=last?'#8f431d':'#7a6456';if(last)c.font='500 16px Inter, system-ui, sans-serif';c.fillText(l,1540,768+i*25)});c.restore()}
  const cap=cur.caps.find(x=>t>=x[0]&&t<x[1])||cur.caps[cur.caps.length-1];
  const ca=Math.min(seg(t,cap[0],cap[0]+.6),1-seg(t,cap[1]-.5,cap[1]))*ease(seg(s.dT,.6,1.6));
  c.save();c.globalAlpha=Math.max(0,ca);
  c.fillStyle='#a8552a';c.font='500 26px Fraunces, Georgia, serif';c.fillText(cap[2],60,862);
  c.fillStyle=C.ink;c.font='italic 400 26px Fraunces, Georgia, serif';c.fillText(cap[3],92,862);c.restore();
  const ha=seg(s.dT,7.4,8.2)*(started?0:1);
  if(ha>0){c.save();c.globalAlpha=ha*(reduceMotion?1:.7+.3*Math.sin(s.clock*3));c.fillStyle='#a8552a';c.font='italic 400 22px Fraunces, Georgia, serif';c.textAlign='right';c.fillText(cur.hint||'Press play to see the needle',cur.scan?1284:1540,74);c.restore()}
}
function drawMagnifier(c,s){
  const t=s.t,t0=cur.magT,a=seg(t,t0,t0+.6);if(a<=0)return;
  const M=cur.mag,CX=M.CX||300,CY=M.CY,R=M.R,Z=M.Z,F=M.focus(s),FR=R/Z;
  c.save();c.globalAlpha=a;
  c.strokeStyle=`rgba(${C.guide},.8)`;c.lineWidth=1.1;const lp=ease(seg(t,t0,t0+.8));
  [-1,1].forEach(sg=>strokePartial(c,mkPath([[F[0]+sg*FR*.0,F[1]+sg*FR],[CX,CY+sg*R]]),lp));
  c.setLineDash([4,5]);c.beginPath();c.arc(F[0],F[1],FR,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const ca=ease(seg(t,t0+.6,t0+1.6));
  c.save();c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.clip();c.fillStyle=C.paper;c.fillRect(CX-R,CY-R,R*2,R*2);
  c.globalAlpha=a*ca;c.translate(CX,CY);c.scale(Z,Z);c.translate(-F[0],-F[1]);core(c,s,true);c.restore();
  c.strokeStyle=C.ink;c.lineWidth=2.6;strokePartial(c,mkPath(ellipsePts(CX,CY,R,R,90)),ease(seg(t,t0+.1,t0+1.1)));
  c.strokeStyle='rgba(43,30,24,.35)';c.lineWidth=1;strokePartial(c,mkPath(ellipsePts(CX,CY,R+7,R+7,90)),ease(seg(t,t0+.3,t0+1.3)));
  const ta=ease(seg(t,t0+1.8,t0+2.6));
  if(ta>0){c.globalAlpha=a*ta;c.font='italic 400 19px Fraunces, Georgia, serif';c.fillStyle=C.ink;c.textAlign='left';
    const lines=M.text;lines.forEach((l,i)=>c.fillText(l,CX+R+22,CY+R-10-(lines.length-1-i)*24))}
  c.restore();
}

/* ---------- probe position view ----------
   SURF: anterior view of the right groin and upper thigh, in canvas px. Screen left = patient's LATERAL.
   cm = surface px per cm. The probe is parasagittal across the lateral third of the inguinal ligament (rot -1.24 rad,
   perpendicular to the ligament at +0.33 rad): +a points cephalad (and slightly medial), -a caudad. The orientation
   dot sits on the -a (caudad) end, matching 'Caudad' on screen right of the scan. Scan mapping: the in-plane needle is
   drawn along the probe's long axis at (scanCx - scan x) / scanCm cm from the probe centre (+ = cephalad), so an
   entry at scan right lands caudad of the probe and the needle advances cephalad. */
const ROT=-1.24,POSE={asis:{x:405,y:262},aiis:{x:588,y:352},fib:{x:600,y:330}};
function scanPose(p){const s1=p<=.55,A=s1?POSE.asis:POSE.aiis,B=s1?POSE.aiis:POSE.fib,k=s1?p/.55:(p-.55)/.45;return{x:lerp(A.x,B.x,k),y:lerp(A.y,B.y,k),rot:ROT}}
function probeText(s){if(!cur.scan)return'Probe: parasagittal, lateral third of the ligament';const p=scanMix(s.t);
  if(p<.05)return'Start: probe on the ASIS';if(p<.6)return'Slide infero-medially to the AIIS';return'Bow-tie: lateral third of the ligament'}
const SURF={
  cm:60,scanCx:770,scanCm:130,skinY:147,probeLen:4.0,probeW:1.1,needleLen:5.0,ends:['Caudad','Cephalad'],
  view:'Right groin, anterior view',
  asis:[400,240],pubTub:[1150,500],aiis:[572,413],
  ligament:[[400,240],[600,330],[800,410],[1000,466],[1150,500]],
  crease:[[440,330],[640,410],[880,497],[1060,548],[1170,578]],
  pulse:[865,440],artery:[[865,440],[884,600],[912,780]],
  lateral:[[306,180],[322,230],[334,380],[344,560],[366,780]],
  crest:[[400,240],[352,206],[306,180]],
  medial:[[1262,640],[1218,710],[1180,780]],
  pubic:[[1150,500],[1300,540],[1330,560],[1300,610],[1262,640]],
  midline:[[1420,180],[1420,540]],
  sartorius:[[[404,252],[470,420],[590,610],[690,780]],[[418,246],[548,410],[700,600],[800,780]]],
  pannus:[[300,124],[600,168],[900,222],[1300,268]],
  // probe pose: needle tabs centred on the ligament in its lateral third, slid up from caudad during the intro;
  // scanning tab follows scanMix (ASIS, AIIS, bow-tie)
  probe(t,s){const k=ease(seg(s.dT,2.4,4)),o=cur.scan?scanPose(scanMix(t)):{x:POSE.fib.x,y:POSE.fib.y,rot:ROT};o.y+=(1-k)*60;o.a=k;return o},
  pills:[['ASIS',380,200,'right',c=>c.asis],['Pubic tubercle',1180,452,'left',c=>c.pubTub],
    ['Inguinal ligament',840,330,'left',()=>[760,394]],['Femoral artery pulse',1000,380,'left',c=>c.pulse],
    ['AIIS (deep)',360,480,'right',c=>[c.aiis[0]-9,c.aiis[1]]],
    [probeText,an=>[an[0]+130,an[1]+120],0,'left',(c,P)=>P(-1.2,.55)]],
  muscles:[['Sartorius',640,700]],
};
// drawSurface: hand-drawn anterior surface view with probe and in-plane needle at the time in s
function drawSurface(c,s,cfg){
  const dT=s.dT,lp=ease(seg(dT,.6,2.8)),ink='rgba(43,30,24,';
  const line=(P,w,a,p=lp,dash)=>{c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink+a+')';c.lineWidth=w*(cfg.lw||1);if(dash)c.setLineDash(dash);strokePartial(c,mkPath(spline(P,false)),p);c.restore()};
  // skin
  const body=spline(cfg.lateral,false).concat(spline(cfg.medial.slice().reverse(),false),spline(cfg.pubic.slice().reverse(),false),[[cfg.midline[1][0],cfg.midline[1][1]],cfg.midline[0]]);
  c.save();c.globalAlpha=ease(seg(dT,1.2,3));polyPath(c,body);const g=c.createLinearGradient(0,140,0,800);g.addColorStop(0,'rgba(243,223,204,.9)');g.addColorStop(1,'rgba(243,223,204,.35)');c.fillStyle=g;c.fill();c.restore();
  line(cfg.lateral,2.2,.9);line(cfg.crest,1.8,.75);line(cfg.medial,2.2,.9);line(cfg.pubic,1.6,.6);line(cfg.midline,1.1,.4,lp,[6,7]);
  cfg.sartorius.forEach(P=>line(P,1.1,.28));
  line(cfg.ligament,2.4,.85,ease(seg(dT,1.4,3.2)));
  line(cfg.crease,1.3,.45,ease(seg(dT,1.6,3.4)),[3,5]);
  line(cfg.artery,1.6,.35,ease(seg(dT,2,3.6)),[8,6]);
  // soft top and bottom edges, as the scan fades with depth
  (cfg.inset?[[700,800,0,1]]:[[170,262,1,0],[700,800,0,1]]).forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,y0,W,y1-y0+(a1?100:0))});
  // pannus fold (scanning tab, practical tip): the fold that lies over the probe site in a large patient
  const pf=cur.scan?ease(seg(s.t,27.6,28.4)):0;
  if(pf>0){c.save();c.globalAlpha=pf;c.strokeStyle='rgba(143,67,29,.85)';c.lineWidth=2.2*(cfg.lw||1);c.setLineDash([9,7]);c.lineCap='round';linePath(c,spline(cfg.pannus,false));c.stroke();c.restore()}
  // landmarks
  const la=ease(seg(dT,2,3));
  c.save();c.globalAlpha=la;c.strokeStyle=C.ink;c.lineWidth=1.6;[cfg.asis,cfg.pubTub].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  // AIIS: deep and not palpable, a dashed ring
  c.setLineDash([3,3]);c.beginPath();c.arc(cfg.aiis[0],cfg.aiis[1],8,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
  c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r,0,Math.PI*2);c.stroke()});c.restore();
  // probe
  const pr=cfg.probe(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];   // a along the probe (+ cephalad), o across it
  const hl=cfg.probeLen/2,hw=cfg.probeW/2;
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const cab=[P(0,-hw),P(.2,-hw-1.6),P(-.4,-hw-3.4),P(.3,-hw-5.6)];c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();c.roundRect?c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,12):c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,4);c.lineTo(hl*cm,4);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the -a end (caudad), matching "Caudad" on screen right of the scan
    c.beginPath();c.arc(-hl*cm+12,-hw*cm+12,5.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
      const L=P(-hl-.45,hw+.75),M=P(hl+.3,hw+.75);c.fillText(cfg.ends[0],L[0],L[1]);c.fillText(cfg.ends[1],M[0],M[1]);c.restore()}}
  // in-plane needle, caudad to cephalad; depth from the scan state
  if(s.na>0&&s.tip[0]>-50){
    const [tx,ty]=s.tip,S=s.S,at=(cfg.scanCx-tx)/cfg.scanCm,ah=at-cfg.needleLen;
    const ae=ty>cfg.skinY?(cfg.scanCx-(S[0]+(tx-S[0])*(cfg.skinY-S[1])/(ty-S[1])))/cfg.scanCm:at;
    c.save();c.globalAlpha=s.na;c.lineCap='round';
    const h=P(ah,0),e=P(ae,0),tp=P(at,0);
    c.beginPath();c.moveTo(...h);c.lineTo(...e);c.strokeStyle='#2f3035';c.lineWidth=6;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=3.4;c.stroke();
    if(at>ae){c.setLineDash([7,6]);c.beginPath();c.moveTo(...e);c.lineTo(...tp);c.strokeStyle='rgba(47,48,53,.75)';c.lineWidth=2.2;c.stroke();c.setLineDash([]);
      c.beginPath();c.arc(...e,5,0,Math.PI*2);c.strokeStyle=C.ink;c.lineWidth=1.3;c.stroke()}
    const h2=P(ah-.9,0);c.beginPath();c.moveTo(...h);c.lineTo(...h2);c.strokeStyle='#7a6456';c.lineWidth=12;c.stroke();c.restore()}
  // labels
  const a=cfg.labels===false?0:ease(seg(dT,3.4,4.6))*(s.labels===false?0:1);
  if(a>0){cfg.pills.forEach(p=>{const v=p[5]?p[5](s):1;if(v<=0)return;const T=typeof p[0]==='function'?p[0](s):p[0],an=p[4](cfg,P),xy=typeof p[1]==='function'?p[1](an):[p[1],p[2]];pill(c,T,xy[0],xy[1],p[3],an,a*v)});
    cfg.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a*.8));
    if(pf>0)pill(c,'Pannus: tape cephalad or retract',1010,298,'left',[960,232],a*pf);
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,1400,200);c.restore()}
}
// small picture-in-picture of drawSurface: during the intro, and for the whole scan in the scanning scenario
const INSET={x:1236,y:96,w:300,h:190,src:[250,140,1000]},INSET_S={x:1332,y:4,w:236,h:150,src:[200,100,1000]};   // INSET_S: scan tab, above the skin line; src: crop left, top, width (canvas px of the surface view)
function drawInset(c,s){
  const a=cur.scan?seg(s.dT,1,1.6):seg(s.dT,1,1.6)*(1-seg(s.dT,6.8,7.5))*(started?0:1);if(a<=0)return;
  const I=cur.scan?INSET_S:INSET,k=I.w/I.src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-I.src[0],-I.src[1]);drawSurface(c,Object.assign({},s,{dT:9,na:0}),Object.assign({},SURF,{labels:false,inset:true,lw:2.4}));c.restore();   // inset drawn complete, without the needle
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  // label in the bottom right corner, clear of the probe start position (ASIS, top left of the crop)
  const lx=I.x+I.w-119,ly=I.y+I.h-25;c.fillStyle='rgba(251,247,241,.9)';c.fillRect(lx,ly,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',lx+9,ly+13);c.restore();
}

/* ---------- render (the page's render(), reading the player state from P) ---------- */
function render(P){
  const t=TS0+P.playT;
  const s=cur.state(t);s.dT=P.dT;s.t=t;s.clock=P.clock;s.labels=showLabels;
  if(probeView){ctx.drawImage(paperC,0,0,W,H);drawSurface(ctx,s,SURF);drawOverlay(ctx,s);return}
  core(ctx,s,false);
  if(showLabels)drawLabels(ctx,s);
  if(cur.warnings)cur.warnings(ctx,t,s);
  drawMagnifier(ctx,s);
  drawOverlay(ctx,s);
  drawInset(ctx,s);
}
return {
  SC, TABS,
  curScen: {scan:'scan', inplane:'inplane', error:'aboveFI'},
  defaultTab: 'scan',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  onTab(tab,scen){(SC[scen].scan?['asis','aiis','fib']:['fib']).forEach(tissue)},
  aria(P){return P.probeView?'Probe position on the right groin for the supra-inguinal fascia iliaca block':'Animated ultrasound-guided supra-inguinal fascia iliaca block'},
  release(){for(const k in tissueCache){tissueCache[k].width=0;delete tissueCache[k]}}
};
});
