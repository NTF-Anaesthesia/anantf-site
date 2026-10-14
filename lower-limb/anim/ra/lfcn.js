/* Lateral femoral cutaneous nerve block: block module for ra.html (ported from lfcn.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player. drawNeedle and cuePill are the page's own (overrides). */
RA.register('lfcn', {
  title: 'Lateral femoral cutaneous nerve block',
  tabsLabel: 'Approach',
  tabs: [['find', 'Find the nerve', 'Scan and trace'],
         ['inplane', 'In-plane', 'Lateral to medial'],
         ['oop', 'Out-of-plane', 'Hydrodissection'],
         ['error', 'Negative example', 'Intramuscular']],
  pills: null,
  probe: true,
  notes: `<p class="note">Shown: the commonest course. The LFCN varies: it may lie up to 4 cm medial to the ASIS, pierce the inguinal ligament, or already be divided at this level. If no single oval appears, scan medially and laterally.</p>`,
  tips: `
<p class="lede">Practical points from the sources listed below, grouped by step.</p>
<h3>Indication</h3>
<ul>
  <li>Tell the patient and surgeon before the block that the numb area varies widely between people, reaching the anterior thigh in about 45%, so a patchy map afterwards does not necessarily mean the block failed. <span class="src">NYSORA [3]</span></li>
</ul>
<h3>Scanning</h3>
<ul>
  <li>If tracing laterally from the femoral view is slow, start in the sartorius–TFL gap, where the nerve stands out best, then trace up to block level. The nerve is only about 1 mm² in cross-section and on average 1.6 cm from the ASIS (range up to about 4 cm), so use the highest frequency and a shallow depth. <span class="src">Zhu 2012 [1]</span></li>
  <li>Use the lateral edge of sartorius as your anchor rather than hunting for the nerve. Traced proximally, the nerve runs from the lateral to the medial edge of sartorius's superficial fascia, and a separate posterior branch may be seen crossing the front of TFL. <span class="src">NYSORA [3]</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Treat the plane as the target, not the nerve: the endpoint is local anaesthetic spreading between TFL and sartorius or around the nerve on top of sartorius. If you can see that spread, you do not need to bring the tip any closer. <span class="src">NYSORA [2]</span></li>
  <li>A tunnel injection reliably numbs the lateral thigh (95% in volunteers) but reached the proximal branches in only 68%. For a hip incision, test sensation over the proximal incision before relying on the block. <span class="src">Nielsen 2018 [5]</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>If the 1 mL test is hard to push while fascia lata is still tented, the tip is probably pressing on the fascia rather than through it. In Gadsden's femoral block study, opening pressure was 15 psi or more every time the needle indented fascia iliaca and below 15 psi once it was through (an inference for fascia lata, not tested there). <span class="src">Gadsden 2016 [4]</span></li>
  <li>If no nerve can be seen, use the subinguinal option: rest the probe across the ASIS and AIIS and inject under the inguinal ligament 1 to 2 cm medial to the ASIS without trying to see the nerve. <span class="src">NYSORA [3]</span></li>
  <li>When you are unsure whether a small oval is the nerve, a nerve stimulator that reproduces tingling over the lateral thigh confirms it, because the LFCN is purely sensory and gives no twitch. <span class="src">NYSORA [2]</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Pause 30 to 45 seconds between aliquots and keep watching the patient even after a negative aspiration, which misses about 2% of intravascular placements. This matters most when the LFCN block is added to a larger hip block. <span class="src">El-Boghdadly 2018 [6]</span></li>
</ul>`,
  sources: `<ol>
  <li>Zhu J et al. Ultrasound of the lateral femoral cutaneous nerve in asymptomatic adults. <i>BMC Musculoskelet Disord</i> 2012;13:227. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3552899/" rel="noopener">PMC3552899</a></li>
  <li>NYSORA. Ultrasound-guided lateral femoral cutaneous nerve block (technique). <a href="https://www.nysora.com/techniques/lower-extremity/ultrasound-guided-lateral-femoral-cutaneous-nerve-block/" rel="noopener">nysora.com</a></li>
  <li>NYSORA. Ultrasound-guided lateral femoral cutaneous nerve block (hip procedures). <a href="https://www.nysora.com/topics/regional-anesthesia-for-specific-surgical-procedures/lower-extremity-regional-anesthesia-for-specific-surgical-procedures/anesthesia-and-analgesia-for-hip-procedures/ultrasound-guided-lateral-femoral-cutaneous-nerve-block/" rel="noopener">nysora.com</a></li>
  <li>Gadsden J, Latmore M, Levine DM, Robinson A. High opening injection pressure is associated with needle-nerve and needle-fascia contact during femoral nerve block. <i>Reg Anesth Pain Med</i> 2016. <a href="https://pubmed.ncbi.nlm.nih.gov/26650431/" rel="noopener">PMID 26650431</a></li>
  <li>Nielsen TD, Moriggl B, Barckman J et al. The lateral femoral cutaneous nerve: description of the sensory territory and a novel ultrasound-guided nerve block technique. <i>Reg Anesth Pain Med</i> 2018. <a href="https://pubmed.ncbi.nlm.nih.gov/29381568/" rel="noopener">PMID 29381568</a></li>
  <li>El-Boghdadly K, Pawa A, Chin KJ. Local anesthetic systemic toxicity: current perspectives. <i>Local Reg Anesth</i> 2018;11:35–44. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC6087022/" rel="noopener">PMC6087022</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,shrink,bbox,resample,pop,yAt,bump,
  C,RED,PROBE,BEAM,layer,paperC,lobules,fibres,makeFascicles,planeLA,drawVessels,drawNerve,guideLine,pill,muscleLabel,warnPill,ring}=E;
let cur,started,showLabels,probeView;   // mirrors of the player state, refreshed by sync() before every render

/* ---------- tissue geometry ----------
   Transverse scan at the inguinal crease, proximal to the profunda femoris branch.
   Screen left = MEDIAL, screen right = LATERAL. Isotropic 13 px per mm (130 px per cm), skin at y≈147.
   Named layers (reused by the FIB clone): skinTop, skinDeep, fasciaLata, fasciaIliaca, iliopsoas,
   psoasTendon, sartorius, pectineus, femHead. fasciaIliaca and fasciaLata are drawn live from the
   scenario state (they move with LA), everything else is static. */

function makeGeo(v){
  const G={};
  G.skinTop=spline([[20,180],[300,160],[517,147],[770,146],[1016,147],[1300,160],[1580,180]],false);
  G.skinDeep=spline([[30,190],[300,172],[560,163],[770,161],[1000,163],[1300,172],[1570,190]],false);
  // fascia lata: ~1.2 cm deep, nearly flat, just above the femoral artery roof
  G.fasciaLata=spline([[40,316],[200,309],[400,303],[600,300],[800,299],[1000,300],[1200,300],[1400,302],[1580,310]],false);
  // fascia iliaca, medial to lateral: dives deep to the vessels (iliopectineal continuation over pectineus),
  // runs ~1 mm over the femoral nerve, rises laterally toward the ASIS. x-sorted so yAt() works.
  G.fasciaIliaca=spline([[40,472],[200,465],[330,460],[440,457],[536,454],[600,450],[650,443],[690,433],[730,426],[780,424],[830,422],[900,419],[1000,414],[1100,408],[1200,402],[1300,397],[1420,390],[1580,382]],false);
  G.fiR=resample(G.fasciaIliaca,4);
  // iliopsoas: roof sits just under fascia iliaca, dips into a sulcus that cradles the nerve; medial border at the artery-vein interface
  G.iliopsoas=spline([[540,460],[600,456],[650,449],[684,452],[704,472],[748,486],[796,478],[818,450],[850,428],[1000,419],[1200,407],[1420,396],[1550,392],[1588,440],[1584,590],[1530,664],[1300,698],[1000,710],[800,714],[660,708],[578,688],[532,636],[518,556]],true);
  // psoas tendon: deep-medial in iliopsoas, deep to the femoral artery (the nerve look-alike)
  G.psoasTendon=ellipsePts(616,600,40,15,60);
  // sartorius: lateral, deep to fascia lata, superficial to fascia iliaca; clear of the needle path
  G.sartorius=spline([[1190,352],[1262,314],[1400,307],[1540,312],[1586,344],[1560,383],[1420,392],[1290,390]],true);
  // pectineus: medial, under the femoral vein; roof = iliopectineal fascia
  G.pectineus=spline([[70,496],[200,474],[330,467],[440,464],[528,460],[516,556],[528,648],[478,700],[330,712],[170,684],[86,612]],true);
  // femoral head: deep to the femoral artery and psoas tendon (mid-inguinal point), ~4.4 cm
  G.femHead=spline([[520,748],[570,735],[620,729],[680,732],[760,750],[830,778]],false);
  G.band=G.skinDeep.concat(G.fasciaLata.slice().reverse());
  G.fatPad=G.fasciaLata.concat(G.fasciaIliaca.slice().reverse());
  G.OUT=[
    {n:'probe',p:mkPath(PROBE),t:[0.4,2.2],w:2.2},
    {n:'skin',p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {n:'skin2',p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {n:'sart',p:mkPath(G.sartorius),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(G.sartorius,.95))},
    {p:mkPath(G.pectineus),t:[2.0,4.0],w:2.1,dbl:mkPath(shrink(G.pectineus,.97))},
    {p:mkPath(G.iliopsoas),t:[2.2,4.4],w:1.6,a:.8,dbl:mkPath(shrink(G.iliopsoas,.975))},
    {p:mkPath(G.psoasTendon),t:[2.6,3.8],w:1.4,a:.75},
    {p:mkPath(G.femHead),t:[2.8,4.2],w:2.8,glow:true},
  ];
  return G;
}
/* ---------- LFCN geometry ----------
   Transverse scan about 1.5 cm inferior and 1.5 to 2 cm medial to the right ASIS, parallel to the inguinal ligament.
   Same skin, scale (130 px per cm) and screen convention as the femoral view (screen left = MEDIAL), so the
   scan in the Find tab is a lateral translation of the femoral picture. Fascia lata splits into a superficial and
   a deep lamina between x 560 and 1060: the fat-filled flat tunnel that carries the LFCN over sartorius towards
   the sartorius-TFL gap. lfcnPar(p,q) blends the block view with the proximal (p, 0.5 cm cephalad, nerve medial
   over sartorius) and distal (q, 3 cm caudad, gap wider, nerve dividing) trace views; buildLfcn turns a blend into
   geometry. Commonest pattern only: single trunk passing under the inguinal ligament. */
const SKT=[[20,180],[300,160],[517,147],[770,146],[1016,147],[1300,160],[1580,180]],SKD=[[30,190],[300,172],[560,163],[770,161],[1000,163],[1300,172],[1570,190]];
const FLC=[[20,262],[300,246],[520,236],[700,231],[800,230],[900,231],[1100,236],[1350,244],[1580,254]];
const FIC=[[20,404],[200,396],[500,386],[700,390],[800,404],[860,424]];
const GLC=[[860,424],[960,438],[1100,436],[1300,428],[1450,420],[1580,414]];
const ILC=[[380,704],[520,686],[640,664],[800,634],[1000,606],[1200,580],[1400,552],[1580,536]].map(([x,y])=>{const u=clamp((x-600)/500);return[x,y-48*u*u*(3-2*u)]});   // anterior iliac margin under TFL, about 2.6 to 3 cm deep
// muscle thickness profiles along their width (u 0 = medial tip, 1 = lateral tip)
const SARTF=[[0,.34],[.06,.55],[.15,.78],[.3,.96],[.5,1],[.7,.85],[.85,.58],[.95,.3],[1,.08]];
const TFLF=[[0,.05],[.04,.3],[.1,.44],[.2,.62],[.35,.8],[.5,.95],[.65,1],[.8,.9],[.9,.68],[1,.2]];
const LP={
  home:{lens:[560,790,1060,46],sart:[372,770,112],tfl:[840,1380,185],il:[0,1],nerve:[790,251,26,12]},
  prox:{lens:[470,655,900,40],sart:[412,730,92],tfl:[900,1330,160],il:[-22,1],nerve:[640,252,24,12]},
  dist:{lens:[640,890,1080,54],sart:[282,680,112],tfl:[960,1400,190],il:[30,.25],nerve:[884,266,24,12]}};
function lfcnPar(p,q){const H=LP.home,o={};for(const k in H)o[k]=H[k].map((v,i)=>v+p*(LP.prox[k][i]-v)+q*(LP.dist[k][i]-v));return o}
// tunnel height at x: 0 outside the split, peak L[3] at L[1]
function lensH(x,L){if(x<=L[0]||x>=L[2])return 0;const u=x<L[1]?.5*(x-L[0])/(L[1]-L[0]):.5+.5*(x-L[1])/(L[2]-L[1]);return L[3]*Math.pow(Math.sin(Math.PI*u),1.3)}
function profAt(F,u){for(let i=1;i<F.length;i++)if(F[i][0]>=u){const a=F[i-1],b=F[i];return lerp(a[1],b[1],(u-a[0])/(b[0]-a[0]))}return F[F.length-1][1]}
// muscle whose roof follows top(x) (the tunnel floor, or fascia lata outside it)
function muscleBody(top,xl,xr,T,F,bot,n=12){const R=[],B=[];
  for(let i=0;i<=n;i++){const x=lerp(xl,xr,i/n);R.push([x,top(x)+6])}
  for(let i=n-1;i>=1;i--){const u=i/n,x=lerp(xl,xr,u);let y=top(x)+6+Math.max(6,T*profAt(F,u));if(bot)y=Math.min(y,bot(x));B.push([x,y])}
  return spline(R.concat(B),true,8)}
function buildLfcn(par){
  const G={lfcn:true,par};
  G.skinTop=spline(SKT,false);G.skinDeep=spline(SKD,false);
  G.fl=spline(FLC,false);G.flR=resample(G.fl,4);
  const L=par.lens;G.lens=L;
  const top=x=>yAt(G.flR,x)+lensH(x,L);G.top=top;
  G.fld=[];for(let x=L[0];x<=L[2]+.1;x+=5)G.fld.push([x,top(x)]);
  G.tunnel=G.fld.map(p=>[p[0],yAt(G.flR,p[0])]).concat(G.fld.slice().reverse());
  G.fi=spline(FIC,false);G.glf=spline(GLC,false);G.deep=G.fi.concat(G.glf.slice(1));
  G.ilium=spline(ILC.map(p=>[p[0],p[1]+par.il[0]]),false);
  const il=x=>yAt(G.ilium,x),deepY=x=>yAt(G.deep,x);
  G.sartorius=muscleBody(top,par.sart[0],par.sart[1],par.sart[2],SARTF,x=>deepY(x)-8);
  G.tfl=muscleBody(top,par.tfl[0],par.tfl[1],par.tfl[2],TFLF,x=>deepY(x)-4);
  const I=[];[22,140,280,420,560,680,780,836].forEach(x=>I.push([x,yAt(G.fi,x)+5]));
  I.push([856,470],[842,548]);[760,640,520,400].forEach(x=>I.push([x,Math.max(yAt(G.fi,x)+70,il(x)-12)]));I.push([250,660],[90,640],[28,590]);
  G.iliacus=spline(I,true,8);
  const M=[];[890,1000,1150,1300,1450,1582].forEach(x=>M.push([x,yAt(G.glf,x)+5]));
  M.push([1592,470]);[1580,1400,1200,1020,920].forEach(x=>M.push([x,Math.max(yAt(G.glf,x)+44,il(x)-12)]));M.push([878,540]);
  G.glut=spline(M,true,8);
  G.band=G.skinDeep.concat(G.fl.slice().reverse());
  G.fatPad=G.fl.concat(G.deep.slice().reverse());
  G.nerve={x:par.nerve[0],y:par.nerve[1],rx:par.nerve[2],ry:par.nerve[3]};
  const ia=par.il[1];
  G.OUT=[
    {n:'probe',p:mkPath(PROBE),t:[0.4,2.2],w:2.2},
    {n:'skin',p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {n:'skin2',p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {n:'sart',p:mkPath(G.sartorius),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(G.sartorius,.95))},
    {n:'tfl',p:mkPath(G.tfl),t:[2.0,4.0],w:2.1,dbl:mkPath(shrink(G.tfl,.97))},
    {n:'il',p:mkPath(G.iliacus),t:[2.2,4.4],w:1.6,a:.75,dbl:mkPath(shrink(G.iliacus,.975))},
    {n:'gl',p:mkPath(G.glut),t:[2.3,4.5],w:1.5,a:.65,dbl:mkPath(shrink(G.glut,.975))},
    {n:'bone',p:mkPath(G.ilium),t:[2.8,4.2],w:2.8,glow:true,ga:ia,a:ia<1?.25+.75*ia:0},
  ];
  return G;
}
const GEO={groin:makeGeo('groin'),lfcn:buildLfcn(lfcnPar(0,0)),prox:buildLfcn(lfcnPar(1,0)),dist:buildLfcn(lfcnPar(0,1))};
// LFCN tissue texture: subcutaneous fat, darker tunnel fat, muscles, deep bed, ilium shadow
function tissueL(G,tg,r){
  tg.save();polyPath(tg,G.fatPad);tg.fillStyle=C.fat;tg.fill();tg.clip();lobules(tg,G.fatPad,r,9,17,6,11,'rgba(150,88,58,.28)');tg.restore();
  tg.save();polyPath(tg,G.band);tg.fillStyle=C.sub;tg.fill();tg.clip();lobules(tg,G.band,r,14,24,9,15,'rgba(150,88,58,.30)');tg.restore();
  [[G.iliacus,.1,1500,8,22,.85],[G.glut,.3,1400,8,24,.8],[G.tfl,.18,1100,8,26,1],[G.sartorius,2.95,420,30,80,1]].forEach(([P,a,n,la,lb,al])=>{
    tg.save();polyPath(tg,P);const bb=bbox(P);const gr=tg.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
    tg.fillStyle=gr;tg.fill();tg.clip();tg.lineWidth=22;tg.strokeStyle='rgba(176,96,56,.16)';polyPath(tg,P);tg.stroke();fibres(tg,P,a,n,r,al,la,lb);tg.restore()});
  // the fat-filled flat tunnel: deeper tint, smaller lobules (more hypoechoic than the subcutaneous fat)
  tg.save();polyPath(tg,G.tunnel);tg.fillStyle='#dcb091';tg.fill();tg.clip();lobules(tg,G.tunnel,r,5,10,3,6,'rgba(110,56,32,.38)');tg.restore();
  const gr=tg.createLinearGradient(0,720,0,840);gr.addColorStop(0,'rgba(244,236,225,0)');gr.addColorStop(1,'rgba(244,236,225,1)');tg.fillStyle=gr;tg.fillRect(0,720,W,H-720);
  // ilium acoustic shadow
  const ia=G.par.il[1],I=G.ilium,sh=[[0,I[0][1]]].concat(I,[[1600,I[I.length-1][1]],[1600,900],[0,900]]);
  tg.save();polyPath(tg,sh);tg.clip();tg.translate(1000,yAt(I,1000));tg.scale(3.4,1);const sg=tg.createRadialGradient(0,0,10,0,0,170);sg.addColorStop(0,`rgba(96,56,36,${.30*ia})`);sg.addColorStop(.6,`rgba(96,56,36,${.13*ia})`);sg.addColorStop(1,'rgba(96,56,36,0)');tg.fillStyle=sg;tg.fillRect(-400,-260,800,560);tg.restore();
}

const tissueCache={};
function tissue(v){
  if(tissueCache[v])return tissueCache[v];
  const G=GEO[v];const [cv,tg]=layer();const r=rng(7);
  if(G.lfcn){tissueL(G,tg,r);return tissueCache[v]=cv}
  // nerve compartment between fascia iliaca and the iliopsoas sulcus
  tg.save();tg.beginPath();tg.ellipse(752,456,104,30,0,0,Math.PI*2);tg.fillStyle=C.fat;tg.fill();tg.restore();
  tg.save();polyPath(tg,G.fatPad);tg.fillStyle=C.fat;tg.fill();tg.clip();lobules(tg,G.fatPad,r,9,17,6,11,'rgba(150,88,58,.28)');tg.restore();
  tg.save();polyPath(tg,G.band);tg.fillStyle=C.sub;tg.fill();tg.clip();lobules(tg,G.band,r,14,24,9,15,'rgba(150,88,58,.30)');tg.restore();
  // muscles: iliopsoas and pectineus are cut across their fibres (short stipple); sartorius obliquely
  [[G.iliopsoas,.1,2400,8,22],[G.pectineus,.5,1300,10,30],[G.sartorius,2.0,520,30,90]].forEach(([P,a,n,la,lb])=>{
    tg.save();polyPath(tg,P);const bb=bbox(P);const gr=tg.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
    tg.fillStyle=gr;tg.fill();tg.clip();tg.lineWidth=26;tg.strokeStyle='rgba(176,96,56,.16)';polyPath(tg,P);tg.stroke();fibres(tg,P,a,n,r,1,la,lb);tg.restore()});
  // psoas tendon: brighter than muscle, fine fibrillar hatching
  tg.save();polyPath(tg,G.psoasTendon);tg.fillStyle='#f8ebdd';tg.fill();tg.clip();
  for(let i=0;i<22;i++){const y=585+i*1.45+r()*.8;tg.beginPath();tg.moveTo(570,y);tg.bezierCurveTo(600,y-2,632,y+2,662,y-1);tg.strokeStyle=`rgba(${r()<.5?'150,96,64,.35':'255,252,246,.9'})`;tg.lineWidth=.6;tg.stroke()}
  tg.restore();
  const gr=tg.createLinearGradient(0,720,0,840);gr.addColorStop(0,'rgba(244,236,225,0)');gr.addColorStop(1,'rgba(244,236,225,1)');tg.fillStyle=gr;tg.fillRect(0,720,W,H-720);
  // femoral head acoustic shadow (drawn after the fade so the bony landmark stays legible)
  const sh=[[0,748]].concat(G.femHead,[[1600,778],[1600,900],[0,900]]);tg.save();polyPath(tg,sh);tg.clip();tg.translate(628,730);tg.scale(1.15,1);const sg=tg.createRadialGradient(0,0,10,0,0,150);sg.addColorStop(0,'rgba(96,56,36,.30)');sg.addColorStop(.6,'rgba(96,56,36,.14)');sg.addColorStop(1,'rgba(96,56,36,0)');tg.fillStyle=sg;tg.fillRect(-200,0,400,200);tg.restore();
  return tissueCache[v]=cv;
}

/* ---------- anatomy ---------- */

// femoral view guide set (Find tab start): depth ruler, fascia lata and fascia iliaca horizontals, dashed ellipses
const guideSet=(nerve,vein,art,fl,fi,G)=>[
  {p:mkPath([[36,140],[36,800]]),t:[0,1.2]},
  {p:mkPath([[40,fl],[1560,fl]]),t:[0.3,1.7]},
  {p:mkPath([[60,fi],[1540,fi]]),t:[0.5,1.9]},
  {p:mkPath(ellipsePts(nerve[0],nerve[1],nerve[2],nerve[3])),t:[0.6,2.4],dash:[6,6]},
  {p:mkPath(ellipsePts(vein[0],vein[1],vein[2],vein[3])),t:[1.1,2.8],dash:[6,6]},
  {p:mkPath(ellipsePts(art[0],art[1],art[2],art[3])),t:[1.2,2.9],dash:[6,6]},
  {p:mkPath(G.fasciaIliaca.map(p=>[p[0],p[1]-10])),t:[0.8,2.6],dash:[8,8]},
];
const GL=GEO.lfcn;
const ANAT={
  groin:{geo:'groin',
    nerve:{x:750,y:457,rx:60,ry:24},vein:{x:468,y:404,rx:68,ry:44},art:{x:590,y:380,r:56},
    fas:{nerve:makeFascicles(30,60,24,11,2,2.8,[9,7])},
    guides:guideSet([750,457,82,44],[468,404,88,62],[590,380,70,70],300,424,GEO.groin),cross:[[750,457],[468,404],[590,380]],
    muscles:[['Iliopsoas',1430,602],['Sartorius',1440,358],['Pectineus',300,500]],
    pills:[['Femoral artery',520,252,'right',()=>[556,334]],['Femoral vein',330,372,'right',()=>[408,392]],
      ['Femoral nerve',960,500,'left',s=>[s.nerve.x+44,s.nerve.y+10]],
      ['Fascia lata',290,252,'right',()=>[300,304]],['Fascia iliaca',1190,456,'left',()=>[1150,405]],
      ['Iliopsoas tendon',700,652,'left',()=>[648,604]]],
    bone:['Femoral head',846,784],
  },
  lfcn:{geo:'lfcn',
    nerve:{x:790,y:251,rx:26,ry:12},
    fas:{nerve:makeFascicles(5,26,12,31,2,2.4,[7,5])},
    guides:[{p:mkPath([[36,140],[36,800]]),t:[0,1.2]},
      {p:mkPath([[40,230],[1560,230]]),t:[0.3,1.7]},
      {p:mkPath([[60,392],[1540,392]]),t:[0.5,1.9]},
      {p:mkPath(ellipsePts(790,251,44,26)),t:[0.6,2.4],dash:[6,6]},
      {p:mkPath(GL.tunnel.map((p,i)=>[p[0],p[1]+(i<GL.fld.length?-9:9)]).concat([[GL.fld[0][0],GL.fld[0][1]-9]])),t:[0.8,2.6],dash:[8,8]}],
    cross:[[790,251]],
    muscles:[['Sartorius',500,330],['Tensor fasciae latae',1170,384],['Iliacus',250,520],['Gluteus medius',1340,480]],
    pills:[['Lateral femoral cutaneous nerve',600,196,'right',s=>[s.nerve.x-14,s.nerve.y-7]],
      ['Fat-filled flat tunnel',980,486,'left',()=>[1004,(yAt(GL.flR,1004)+GL.top(1004))/2],s=>cur.tunA?cur.tunA(s.t):1],
      ['Fascia lata',300,206,'right',()=>[340,244]],
      ['Fascia iliaca',300,440,'right',()=>[420,389]]],
    bone:['Ilium',1470,546],
  },
};

/* ---------- scenarios ---------- */
const ALQ=[[0,.8,1],[1.6,2.6,2],[3.4,4.4,2]];   // 1 mL test, then 2 + 2 mL = 5 mL
const DRUG='Ropivacaine 0.2%',DOSE=5,MGML=2;   // ropivacaine 0.2% = 2 mg/mL; 5 mL = 10 mg (guide.html dose-peng-lfcn: 5 mL to the LFCN)
function aliquots(t,t0){let v=0;ALQ.forEach(([a,b,sz])=>{v+=sz*ease(seg(t,t0+a,t0+b))});
  const paused=ALQ.some(([a,b],i)=>i<ALQ.length-1&&t>t0+b&&t<t0+ALQ[i+1][0]);return{v,paused}}

// laMid: the LA polygon's mid-thickness point at x (clamped inside the polygon)
function laMid(s,xT){const P=s.la;if(!P)return[s.nerve.x+60,s.nerve.y];const n=P.length/2,x=clamp(xT,P[0][0]+8,P[n-1][0]-8);let bi=0,bd=1e9;
  for(let i=0;i<n;i++){const d=Math.abs(P[i][0]-x);if(d<bd){bd=d;bi=i}}const a=P[bi],b=P[P.length-1-bi];return[a[0],(a[1]+b[1])/2]}

/* tunnelSpread: LA injected into the fat-filled flat tunnel at inj, k = fraction of 5 mL. A lens opens between the
   two laminae of fascia lata: the superficial lamina lifts, the deep lamina is pushed down. It starts as a pocket at
   the tip (half-width w0), wraps the nerve's corners and underside by k 0.6, and at k 1 runs from over sartorius
   (x 600) to over TFL (x 1050), about 70 px thick at the nerve. Never leaves the tunnel. */
function tunnelSpread(G,nerve,inj,k,w0=30){
  if(k<=0)return null;
  const g=ease(clamp((k-.12)/.88)),xc=lerp(inj[0],816,g),wl=lerp(w0,xc-600,g),wr=lerp(w0,1050-xc,g),Tm=80*Math.pow(k,.6);
  const rb=u=>Math.abs(u)>=1?0:Math.sqrt(1-u*u),prof=x=>{const u=(x-xc)/(x<xc?wl:wr);return Tm*lerp(rb(u),bump(u),g)},wrap=ease(clamp((k-.22)/.38));
  const lift=x=>.34*prof(x);
  const hug=x=>{const dx=(x-nerve.x)/(nerve.rx*1.3);return Math.abs(dx)>=1?-1e9:nerve.y+(nerve.ry+5)*Math.sqrt(1-dx*dx)};
  const bottom=x=>{const b=yAt(G.flR,x)+.66*prof(x),h=hug(x);return h>b?lerp(b,h,wrap):b};
  const x0=Math.floor(Math.min(xc-wl,wrap>0?nerve.x-nerve.rx*1.3:1e9)),x1=Math.ceil(Math.max(xc+wr,wrap>0?nerve.x+nerve.rx*1.3:-1e9));
  return{lift,bottom,x0,x1};
}
// fascia lines and LA polygon from a spread and a needle tent (in-plane and OOP share this)
function tunnelState(G,sp,tentF){
  const lift=sp?sp.lift:()=>0;
  let fl=G.flR.map(p=>[p[0],p[1]-lift(p[0])]);
  if(tentF)fl=fl.map(tentF);
  const fld=G.fld.map(p=>[p[0],sp&&p[0]>=sp.x0&&p[0]<=sp.x1?Math.max(p[1],sp.bottom(p[0])+1.5):p[1]]);
  const la=sp?planeLA(G.flR,lift,x=>sp.bottom(x)-yAt(G.flR,x),sp.x0,sp.x1):null;
  return{fl,fld,la,lines:[[fl,2.2,1],[fld,1.7,.85],[G.fi,1.5,.55]]};
}
// in-plane phase: approach, superficial lamina tents, single give (the pop), tip comes to rest at NT
const TENT=24,TDIP=.42,TPOP=11.135;   // tent: TENT px along the needle plus TDIP*TENT px straight down, apex at the tip
function lfPhase(uc,ut,P,u0=.04,u1=.3){return t=>{
  if(t<9)return{u:lerp(u0,u1,easeOut(seg(t,8.3,9)))};
  if(t<10.4)return{u:lerp(u1,uc,ease(seg(t,9,10.4)))};
  if(t<11.0){const q=seg(t,10.4,11.0);return{u:lerp(uc,ut,1-Math.pow(1-q,1.6)),sh:reduceMotion?0:Math.sin(t*41)*.7*q}}
  if(t<11.45){const p=pop(t,11.0,ut,P,2.5);return{u:p.u,sh:p.sh}}
  if(t<12.0)return{u:lerp(P,1,ease(seg(t,11.45,12.0)))};
  return{u:1};
}}
function positive(o){
  const A=ANAT.lfcn,G=GEO.lfcn,NS=o.NS,NT=o.NT;
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  let uc=.99;for(let u=.2;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(G.flR,q[0])){uc=u;break}}
  const ut=Math.min(uc+TENT/L,.999),P=Math.min(1,ut+16/L),Pc=along(NS,NT,uc),ph=lfPhase(uc,ut,P,o.u0,o.u1);
  return Object.assign({anat:'lfcn',Tend:22,vol:DOSE,volT:12.4,magT:18,laT:14.2,uc,
    guides:[[along(NS,NT,.3),NT,7.6,11.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){na=seg(t,8.3,8.9);const r=ph(t);tip=along(NS,NT,r.u);if(r.sh&&!reduceMotion){tip[0]+=D[0]*r.sh;tip[1]+=D[1]*r.sh}
        tent=t<TPOP?clamp((r.u-uc)*L,0,TENT):TENT*Math.exp(-(t-TPOP)*9)*(reduceMotion?1:Math.cos((t-TPOP)*26));
        tip[1]+=TDIP*(t<TPOP?tent:TENT*Math.exp(-(t-TPOP)*14))}
      const I=aliquots(t,o.k[0]),k=I.v/DOSE;
      const nerve=Object.assign({},A.nerve,{x:A.nerve.x+o.disp[0]*k,y:A.nerve.y+o.disp[1]*k});
      const sp=tunnelSpread(G,nerve,o.inj||NT,k,o.w0||30);
      const tf=Math.abs(tent)>.05?p=>{const w=Math.exp(-Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/40);return[p[0]+D[0]*tent*w,p[1]+(D[1]+TDIP)*tent*w]}:null;
      return Object.assign(tunnelState(G,sp,tf),{S:NS,tip,na,k,v:I.v,paused:I.paused,nerve,inj:o.inj||NT,mode:'in'});
    }},o);
}
// in-plane needle line (lateral to medial, about 16 degrees to the skin); shared by the correct scenario and the fix
const IP={NS:[1600,26],NT:[830,249],k:[12.6],disp:[-8,4]};
const SC={};
SC.inplane=positive(Object.assign({},IP,{
  subtitle:'Lateral in-plane approach',
  mag:{CY:680,R:140,Z:1.7,focus:s=>[s.nerve.x+6,s.nerve.y],text:['LA fills the tunnel,','nerve outlined']},
  la:[[1080,226,'left',s=>laMid(s,950),'LA in the tunnel']],
  caps:[[0,8.2,'1','The LFCN lies in a flat fat-filled tunnel within fascia lata, between sartorius and TFL.'],
    [8.2,11.6,'2','In-plane from lateral, at a shallow angle, staying above TFL. Fascia lata tents, then gives.'],
    [11.6,12.6,'3','The tip lies in the tunnel, just lateral to the nerve. Do not touch the nerve.'],
    [12.6,17.2,'4','Ropivacaine 0.2%: 1 mL test, then 2 mL aliquots, aspirating between. LA opens the tunnel.'],
    [17.2,99,'5','5 mL in: LA fills the tunnel over both muscles and outlines the nerve on all sides.']]}));

/* out-of-plane: only the tip is seen, as a bright dot walked down into the tunnel, superolateral to the nerve and
   clear of it; 1 mL hydrodissection confirms the plane, then 2 + 2 mL surrounds the nerve */
(function(){
  const A=ANAT.lfcn,G=GEO.lfcn,TX=836,FLY=yAt(G.flR,TX),TIP=[TX,FLY+11];
  const KF=[[8.3,[TX,150]],[9.2,[TX,192]],[10.0,[TX,FLY-22]],[10.5,[TX,FLY-6]],[11.1,TIP]];
  const tipAt=t=>{if(t<=KF[0][0])return KF[0][1].slice();for(let i=1;i<KF.length;i++)if(t<KF[i][0]){const a=KF[i-1],b=KF[i];return along(a[1],b[1],ease(seg(t,a[0],b[0])))}return TIP.slice()};
  const TP=11.1;
  SC.oop={anat:'lfcn',Tend:22,vol:DOSE,volT:12.2,magT:18,laT:13.8,
    subtitle:'Out-of-plane approach, hydrodissection',
    mag:{CY:680,R:140,Z:1.8,focus:()=>[808,246],text:['Tip in the tunnel,','LA surrounds the nerve']},
    la:[[1080,226,'left',s=>laMid(s,950),'LA in the tunnel']],
    guides:[],
    caps:[[0,8.2,'1','The LFCN lies in a flat fat-filled tunnel within fascia lata, between sartorius and TFL.'],
      [8.2,11.4,'2','Out-of-plane from caudad. Tilt the probe to find the tip as a bright dot, then walk it down.'],
      [11.4,12.4,'3','Fascia lata indents, then gives. The dot sits in the tunnel, superolateral to the nerve.'],
      [12.4,13.6,'4','Hydrodissect with 1 mL: a dark pocket around the dot confirms the tip is in the tunnel.'],
      [13.6,17.6,'5','Ropivacaine 0.2% in 2 mL aliquots, aspirating between. LA spreads around the nerve.'],
      [17.6,99,'6','5 mL in: a ring of LA surrounds the nerve and the tunnel opens over both muscles.']],
    state(t){
      const tip=t>=8.3?tipAt(t):[-99,-99],na=seg(t,8.3,8.9),dotA=seg(t,9.2,9.5);
      let ind=0;const flY=FLY;
      if(t>=8.3)ind=t<TP?clamp(tip[1]+5-flY,0,16):16*Math.exp(-(t-TP-.1)*9)*(reduceMotion?1:Math.cos((t-TP-.1)*26))*(t<TP+.1?1:1);
      if(t>=TP&&t<TP+.1)ind=16;
      // small tissue ripple as the tip is walked down
      const rip=(!reduceMotion&&t>9.2&&t<10.6)?Math.sin(t*30)*1.2:0;
      const I=aliquots(t,12.4),k=I.v/DOSE;
      const nerve=Object.assign({},A.nerve,{x:A.nerve.x-4*k,y:A.nerve.y+4*k});
      const sp=tunnelSpread(G,nerve,TIP,k,16);
      const tf=Math.abs(ind)>.05||rip?p=>{const w=Math.exp(-Math.abs(p[0]-TIP[0])/16);return[p[0],p[1]+ind*w+rip*Math.exp(-Math.abs(p[0]-TIP[0])/60)]}:null;
      return Object.assign(tunnelState(G,sp,tf),{S:[TIP[0],-99],tip,na,dotA,k,v:I.v,paused:I.paused,nerve,inj:TIP,mode:'oop'});
    }};
})();

/* fixLedger: volume ledger for a negative example with an animated fix */
function fixLedger(label,off,tFix,label2){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL',label2+': '+b.toFixed(1)+' mL',DRUG.replace('R','Total r')+': '+tot.toFixed(1)+' mL ('+Math.round(tot*MGML)+' mg)']}}}
/* negative example: too steep. The tip passes fused fascia lata just lateral to the end of the tunnel, under the
   tunnel's lateral tip, and comes to rest just beyond the tunnel floor, in superficial TFL. 1 mL swells inside TFL; the tunnel stays
   flat. Fix: withdraw into the subcutaneous fat, flatten onto the in-plane line, re-enter the tunnel (the in-plane
   scenario's own tent, pop and aliquots on a shifted clock). */
(function(){
  const A=ANAT.lfcn,G=GEO.lfcn;
  // same skin puncture E as the in-plane line, steeper (about 38 degrees): the redirect pivots at E
  const uE=(150-IP.NS[1])/(IP.NT[1]-IP.NS[1]),E=along(IP.NS,IP.NT,uE),NT=[895,G.top(895)+24];
  const dE=Math.hypot(E[0]-NT[0],E[1]-NT[1]),NS=[E[0]+(E[0]-NT[0])/dE*435,E[1]+(E[1]-NT[1])/dE*435];
  const OFF=1,TW=16.4,TR=16.8,TD=17.8,TB=18.4;          // warnings fade; withdraw start, withdrawn, redirected
  const DEEP=positive(Object.assign({},IP,{NS,NT,k:[1e9],disp:[0,0]}));
  const uW=(NS[0]-1140)/(NS[0]-NT[0]),W1=along(NS,NT,uW);  // withdrawn into subcutaneous fat at x 1140
  const LI=Math.hypot(IP.NT[0]-NS[0],IP.NT[1]-NS[1]),uR=Math.hypot(W1[0]-NS[0],W1[1]-NS[1])/LI;
  const FIX=positive(Object.assign({},IP,{u0:uR,u1:uR})),SHIFT=TB-9.0,FXI=IP.k[0]+SHIFT;
  const IMC=NT;   // inside TFL, a few millimetres lateral to its medial border: all of the intramuscular LA stays in the muscle
  const imLA=v=>{const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),P=[];
    for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,w=1+.12*Math.sin(a*3+1)+.06*Math.sin(a*5);P.push([IMC[0]+Math.cos(a)*23*sk*w,IMC[1]+Math.sin(a)*7*sk*w])}
    const st=[[-1,-3,16],[1,3,22],[1,-4,16],[-1,4,14]].map(([d,dy,len])=>{const x0=IMC[0]+d*18*sk,ln=len*sk;
      return ellipsePts(x0+d*ln/2,IMC[1]+dy*sk,ln/2,2*sk+.5,24)});
    return{x:IMC[0],y:IMC[1],rx:23*sk,ry:7*sk,polys:[P].concat(st)}};
  SC.intraTFL={anat:'lfcn',pill:'Into TFL',tunA:t=>1-seg(t,10.2,10.7),   // tunnel pill off before the steep needle reaches TFL: its leader would cross the shaft and the TFL pocket; the LA and cue pills label the tunnel after the fix
    Tend:30.5,vol:DOSE,volT:12.4,magT:27,laT:FXI+1.2,neg:true,
    subtitle:'Negative example: a common needle error',
    mag:{CY:680,R:140,Z:1.15,focus:()=>[875,272],text:['1 mL in TFL,','5 mL in the tunnel']},
    la:[[1080,226,'left',s=>laMid(s,950),'LA in the tunnel',FXI+1.2]],
    guides:[[along(NS,NT,.3),NT,7,11]],
    caps:[[0,8.2,'1','The LFCN lies in a flat fat-filled tunnel within fascia lata, between sartorius and TFL.'],
      [8.2,12.4,'2','Error: too steep. The tip passes just beyond the tunnel floor, just beyond the tunnel floor, in superficial TFL.'],
      [12.4,15.4,'3','LA swells inside tensor fasciae latae, between its fibres. The tunnel stays flat.'],
      [15.4,TR,'4','Error recognised: the nerve is not outlined. Intramuscular injection: stop after 1 mL.'],
      [TR,FXI-.6,'5','Fix: withdraw into the fat, flatten the angle and re-enter the tunnel lateral to the nerve.'],
      [FXI-.6,26.8,'6','Ropivacaine 0.2%, the planned 5 mL: 1 mL test, then 2 mL aliquots with aspiration. The tunnel opens.'],
      [26.8,99,'7','Total 6 mL, 12 mg: 1 mL in TFL; 5 mL in the tunnel outlines the nerve.']],
    ledger:fixLedger('Intramuscular',OFF,TR,'In the tunnel'),
    state(t){
      const vIM=OFF*ease(seg(t,12.6,14.6)),im=imLA(vIM);
      let s;
      if(t<TB){s=DEEP.state(Math.min(t,12.4));s.v=vIM;s.k=0;s.paused=false;s.la=null;
        if(t>=TR){s.v=0;s.tip=along(NS,NT,lerp(1,uW,ease(seg(t,TR,TD))));
          if(t>=TD){const r=ease(seg(t,TD,TB));s.tip=along(W1,along(IP.NS,IP.NT,uR),r);s.S=along(NS,IP.NS,r)}}}
      else s=FIX.state(t-SHIFT);
      s.im=im;return s;
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+1.4,FXI+2.0);if(ok>0&&showLabels)cuePill(c,'Tunnel filling: correct plane',44,298,ok,laMid(s,650));return}
      const a1=seg(t,12.0,12.5)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Tip in TFL: intramuscular',940,442,[s.tip[0]+8,s.tip[1]+23],a1)}
      const a2=seg(t,14.4,14.9)*f;
      if(a2>0)warnPill(c,'Tunnel not filling',560,516,[690,250],a2);
      const a3=seg(t,15.0,15.5)*f;
      if(a3>0){const n=s.nerve;c.save();c.globalAlpha=a3*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(n.x,n.y,n.rx+9,n.ry+9,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'Nerve not outlined',600,466,[n.x,n.y+n.ry+9],a3)}
      const a4=seg(t,15.6,16.1)*f;
      if(a4>0)warnPill(c,'Stop at 1 mL',940,482,null,a4);
    }};
})();
/* Find the nerve: scanning scenario, no needle. findMix(t) drives both the scan and the probe view.
   m: femoral view -> LFCN block view (probe slides laterally along the crease; the picture translates by XS px,
   6.5 cm, matching the probe's travel on the surface view). p: proximal trace and back. q: distal trace and back. */
const XS=840;
function findMix(t){return{m:ease(seg(t,8.3,13)),p:ease(seg(t,16.4,18.2))*(1-ease(seg(t,19.6,21.0))),q:ease(seg(t,21.0,22.6))*(1-ease(seg(t,24.6,26.6)))}}
// resample a closed outline to n points by arc length, starting at its leftmost point (pairs outlines for morphing)
function closedResample(P,n){let i0=0;P.forEach((p,i)=>{if(p[0]<P[i0][0])i0=i});
  const R=P.slice(i0,P.length-1).concat(P.slice(0,i0+1)),path=mkPath(R),out=[];let j=1;
  for(let i=0;i<n;i++){const d=path.len*i/n;while(j<R.length-1&&path.cum[j]<d)j++;const k=(d-path.cum[j-1])/((path.cum[j]-path.cum[j-1])||1);out.push([lerp(R[j-1][0],R[j][0],k),lerp(R[j-1][1],R[j][1],k)])}
  out.push(out[0].slice());return out}
(function(){
  const GF=GEO.groin,AF=ANAT.groin,AL=ANAT.lfcn,skip=['probe','skin','skin2','sart'];
  const fOUT=GF.OUT.filter(o=>!skip.includes(o.n)),sartF=closedResample(GF.sartorius,96),sartH=closedResample(GL.sartorius,96);
  const BR=[[856,262,16,9],[930,268,15,8]];   // anterior and posterior branches, distal view
  const tr=(P,dx)=>P.map(p=>[p[0]+dx,p[1]]);
  const ctr=P=>{const b=bbox(P);return[(b[0]+b[2])/2,(b[1]+b[3])/2]};
  // vertical extent of a closed outline at x
  const vSpan=(P,x)=>{let lo=1e9,hi=-1e9;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];if((a[0]-x)*(b[0]-x)<=0&&a[0]!==b[0]){const y=lerp(a[1],b[1],(x-a[0])/(b[0]-a[0]));lo=Math.min(lo,y);hi=Math.max(hi,y)}}return lo<hi?[lo,hi]:[x,x]};
  const cH={s:ctr(GL.sartorius),t:ctr(GL.tfl),g:ctr(GL.glut)};
  SC.find={anat:'groin',scan:true,Tend:30,vol:DOSE,volT:1e9,magT:27,laT:1e9,hint:'Press play to scan',
    subtitle:'Scanning: find the nerve, then trace it',
    mag:{CY:680,R:140,Z:1.8,focus:s=>[s.nerve.x,s.nerve.y],text:['LFCN in the fat-filled tunnel,','between sartorius and TFL']},
    la:[],guides:[],
    probe(t,s){const k=ease(seg(s.dT,2.4,4)),f=findMix(t),o=poseMix(f.m,f.p,f.q);o.y+=(1-k)*70;o.a=k;return o},
    caps:[[0,8.2,'1','Start on the femoral nerve view. Sartorius lies at the lateral edge of the screen.'],
      [8.2,13,'2','Slide laterally and slightly cephalad along the inguinal crease towards the ASIS. Follow sartorius.'],
      [13,14.8,'3','Stop 1 to 2 cm inferomedial to the ASIS. Sartorius lies medial, tensor fasciae latae lateral.'],
      [14.8,16.4,'4','Fascia lata splits into a flat fat-filled tunnel. The small oval inside it is the LFCN.'],
      [16.4,19.6,'5','Slide cephalad towards the inguinal ligament: the nerve moves medially, over sartorius.'],
      [19.6,24.6,'6','Slide caudad: sartorius moves medially and the gap widens. The nerve drifts laterally and may divide.'],
      [24.6,99,'7','A nerve can be followed continuously; septa and fat lobules appear and vanish. Return to block level.']],
    state(t){
      const {m,p,q}=findMix(t),fx=-XS*m,lx=XS*(1-m),cf=ease(seg(m,.3,.75));
      const G=(p<=1e-4&&q<=1e-4)?GL:buildLfcn(lfcnPar(p,q)),sp=ease(seg(q,.55,1));
      const views=[{geo:'prox',dx:lx,a:p},{geo:'dist',dx:lx,a:q},{geo:'lfcn',dx:lx,a:clamp(m*4)*(1-Math.max(p,q))},{geo:'groin',dx:fx,a:1-cf}];
      const sL=G===GL?sartH:closedResample(G.sartorius,96),sart=sartF.map((a,i)=>[lerp(a[0]+fx,sL[i][0]+lx,cf),lerp(a[1],sL[i][1],cf)]);
      const outs=[{list:fOUT,dx:fx,a:1-cf},{list:G.OUT.filter(o=>!skip.includes(o.n)),dx:lx,a:cf},
        {list:G.OUT.filter(o=>o.n==='skin'||o.n==='skin2'),dx:0,a:1},
        {list:[{p:mkPath(sart),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(sart,.95))}],dx:0,a:1}];
      const fl=[];for(let x=20;x<=1580;x+=8)fl.push([x,lerp(yAt(GF.fasciaLata,x-fx),yAt(G.flR,x-lx),cf)]);
      const kx=Math.min(1,2*Math.sin(Math.PI*cf));   // the lerped line fades mid-morph; each view's own fascia lata carries the crossfade
      const lines=[[fl,lerp(1.9,2.2,cf),1-kx],[tr(GF.fasciaLata,fx),1.9,(1-cf)*kx],[tr(G.flR,lx),2.2,cf*kx],[tr(GF.fasciaIliaca,fx),2.4,1-cf],[tr(G.fld,lx),1.7,.85*cf],[tr(G.fi,lx),1.5,.55*cf]];
      const N=G.nerve,t0={x:N.x+lx,y:N.y,rx:N.rx,ry:N.ry};
      const br=BR.map(b=>({x:lerp(t0.x,b[0]+lx,sp),y:lerp(t0.y,b[1],sp),rx:lerp(t0.rx,b[2],sp),ry:lerp(t0.ry,b[3],sp)}));
      const nerves=[{n:{x:AF.nerve.x+fx,y:AF.nerve.y,rx:AF.nerve.rx,ry:AF.nerve.ry},F:AF.fas.nerve,base:AF.nerve.rx,a:1-cf},
        {n:br[1],F:AL.fas.nerve,base:22,a:cf},{n:br[0],F:AL.fas.nerve,base:22,a:cf}];
      const vA={vein:Object.assign({},AF.vein,{x:AF.vein.x+fx}),art:Object.assign({},AF.art,{x:AF.art.x+fx})};
      return{S:[0,0],tip:[-99,-99],na:0,k:0,v:0,nerve:br[0],nerves,views,outs,lines,vessels:[{A:vA,a:1-cf}],gA:1-ease(seg(m,0,.22)),G,lx,p,q,sp,br,anat:'groin'};
    },
    labels(c,s,a){
      const t=s.t,G=s.G,fa=a*(1-seg(t,8.3,8.9));
      if(fa>0){const fs={nerve:AF.nerve};AF.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],fa));
        c.save();c.globalAlpha=fa*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText(AF.bone[0],AF.bone[1],AF.bone[2]);c.restore();
        AF.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](fs),fa))}
      const ma=a*seg(t,13,13.8);if(ma<=0)return;
      const ds=ctr(G.sartorius),dt=ctr(G.tfl),M=AL.muscles,mid=(P,x)=>{const v=vSpan(P,x);return(v[0]+v[1])/2+7};   // labels centred in the muscle's depth at their x
      const xs=M[0][1]+ds[0]-cH.s[0],xt=M[1][1]+dt[0]-cH.t[0];
      muscleLabel(c,M[0][0],xs,mid(G.sartorius,xs),ma);muscleLabel(c,M[1][0],xt,mid(G.tfl,xt),ma);
      muscleLabel(c,M[2][0],M[2][1],M[2][2],ma);muscleLabel(c,M[3][0],M[3][1],mid(G.glut,M[3][1]),ma);
      c.save();c.globalAlpha=ma*.9*G.par.il[1];c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText(AL.bone[0],AL.bone[1],AL.bone[2]+G.par.il[0]);c.restore();
      const P=AL.pills;pill(c,P[2][0],P[2][1],P[2][2],P[2][3],P[2][4](s),ma);pill(c,P[3][0],P[3][1],P[3][2],P[3][3],P[3][4](s),ma);
      const na=a*seg(t,14.8,15.4);if(na<=0)return;
      const n=s.br[0],ab=seg(s.sp,.6,1),nA=[n.x-n.rx*.6,n.y-n.ry*.7];if(ab<1)pill(c,P[0][0],P[0][1],P[0][2],P[0][3],nA,na*(1-ab));if(ab>0)pill(c,'Anterior branch',P[0][1],P[0][2],P[0][3],nA,na*ab);
      const ax=lerp(836,686,s.p)+s.q*(760-836),ay=(yAt(G.flR,ax)+G.top(ax))/2+3;
      pill(c,P[1][0],P[1][1],P[1][2],P[1][3],[ax,ay],na);
      const pa=na*seg(s.sp,.6,1);if(pa>0){const b=s.br[1];pill(c,'Posterior branch',1010,196,'left',[b.x+b.rx*.5,b.y-b.ry*.8],pa)}
    },
    warnings(c,t,s){
      const G=s.G,K='168,85,42',ha=seg(t,13.6,14.2)*(1-seg(t,16.0,16.6));
      if(ha>0){c.save();c.globalAlpha=ha;polyPath(c,G.tunnel.map(p=>[p[0]+s.lx,p[1]]));c.fillStyle=`rgba(${K},.24)`;c.fill();
        c.strokeStyle=`rgba(${K},.95)`;c.lineWidth=2.4;c.setLineDash([8,6]);c.stroke();c.restore()}
      const ra=seg(t,14.8,15.3)*(1-seg(t,26.8,27.4));
      if(ra>0){const b=bbox(s.br.flatMap(n=>[[n.x-n.rx,n.y-n.ry],[n.x+n.rx,n.y+n.ry]])),pl=reduceMotion?1:.55+.45*Math.abs(Math.sin(t*4));
        c.save();c.globalAlpha=ra*pl;c.strokeStyle=`rgb(${K})`;c.lineWidth=2.4;c.beginPath();c.ellipse((b[0]+b[2])/2,(b[1]+b[3])/2,(b[2]-b[0])/2+15,(b[3]-b[1])/2+13,0,0,Math.PI*2);c.stroke();c.restore()}
    }};
})();
const TABS={find:['find'],inplane:['inplane'],oop:['oop'],error:['intraTFL']};

/* ---------- drawing ---------- */

// local anaesthetic collected in a fascial plane: s.la (target plane) and s.laOff (misplaced pocket, negative example)
function drawLA(c,s,fillA){
  if(s.im){const m=s.im;c.save();c.globalAlpha=fillA;
    // fibres pushed apart: pale gap and compressed fibre arcs around the swelling
    c.beginPath();c.ellipse(m.x,m.y,m.rx+9,m.ry+7,0,0,Math.PI*2);c.fillStyle='rgba(248,226,206,.55)';c.fill();
    c.strokeStyle='rgba(92,50,30,.45)';c.lineWidth=1;[[12,8],[17,11],[23,14]].forEach(([dx,dy],i)=>{[0,Math.PI].forEach(a0=>{c.beginPath();c.ellipse(m.x,m.y,m.rx+dx,m.ry+dy,0,a0+.35,a0+Math.PI-.35);c.globalAlpha=fillA*(.7-i*.18);c.stroke()})});
    c.restore()}
  [s.laOff,s.la].concat(s.im?s.im.polys:[]).forEach(P=>{if(!P)return;
    const bb=bbox(P);
    c.save();c.globalAlpha=fillA;polyPath(c,P);
    const g=c.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,`rgba(${C.la},.80)`);g.addColorStop(.6,`rgba(${C.la},.88)`);g.addColorStop(1,`rgba(${C.la},.74)`);
    c.fillStyle=g;c.fill();c.strokeStyle='rgba(78,31,14,.55)';c.lineWidth=1.2;c.stroke();c.restore()});
}
// fascial lines drawn live from the scenario state: s.lines = [[points, width, alpha], ...]
function drawFascia(c,dT,s){
  c.save();c.lineJoin='round';c.lineCap='round';
  (s.lines||[[s.fl,1.9,1],[s.fi,2.4,1]]).forEach(([P,w,a],i)=>{if(!P||a<=0)return;
    c.strokeStyle=a<1?`rgba(43,30,24,${a})`:C.ink;c.lineWidth=w;strokePartial(c,mkPath(P),ease(seg(dT,1.5+i*.2,3.3+i*.2)))});
  c.restore();
}
function drawNeedle(c,s){
  if(s.na<=0)return;
  if(s.mode==='oop'){   // out-of-plane: only the tip crosses the beam, a bright dot with a faint reverberation tail
    const a=s.dotA||0;if(a<=0)return;const[x,y]=s.tip;c.save();c.globalAlpha=a;
    for(let i=1;i<=3;i++){c.fillStyle=`rgba(255,251,244,${.5-i*.13})`;c.beginPath();c.ellipse(x,y+i*6,4-i*.7,1.4,0,0,Math.PI*2);c.fill()}
    const g=c.createRadialGradient(x,y,0,x,y,8);g.addColorStop(0,'rgba(255,253,248,.7)');g.addColorStop(1,'rgba(255,253,248,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,8,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(x,y,4.6,0,Math.PI*2);c.fillStyle='#fffdf8';c.fill();c.strokeStyle='rgba(43,30,24,.85)';c.lineWidth=1.3;c.stroke();c.restore();return}
  const S=s.S,[tx,ty]=s.tip,d=[tx-S[0],ty-S[1]],l=Math.hypot(...d),ux=d[0]/l,uy=d[1]/l,nx=-uy,ny=ux,bx=tx-ux*16,by=ty-uy*16;
  c.save();c.globalAlpha=s.na;c.lineCap='round';
  c.beginPath();c.moveTo(S[0],S[1]);c.lineTo(bx,by);c.strokeStyle='#2f3035';c.lineWidth=7;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=4.2;c.stroke();
  c.beginPath();c.moveTo(S[0]-nx*1.2,S[1]-ny*1.2);c.lineTo(bx-nx*1.2,by-ny*1.2);c.strokeStyle='rgba(250,251,253,.9)';c.lineWidth=1.1;c.stroke();
  c.beginPath();c.moveTo(bx+nx*3.4,by+ny*3.4);c.lineTo(tx,ty);c.lineTo(bx-nx*3.4,by-ny*3.4);c.closePath();c.fillStyle='#8e929b';c.fill();c.strokeStyle='#2f3035';c.lineWidth=1.2;c.stroke();
  c.restore();
}
// ga: alpha for the anatomy guides (the depth ruler always stays); the Find tab fades the femoral guides as it slides
function drawGuides(c,A,dT,ga=1){
  const fade=dT<4?1:lerp(1,.32,seg(dT,4,6.5));
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  A.guides.forEach((g,i)=>{c.globalAlpha=i?ga:1;if(c.globalAlpha<=0)return;c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);c.globalAlpha=1;
  // depth ruler: 130 px per cm from the skin (y 147), minor tick every 5 mm
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=10;i++){if(i/10>tp)break;const y=147+i*65,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke();if(i){c.fillStyle=`rgba(${C.guide},.72)`;c.font='400 13px Inter, system-ui, sans-serif';c.fillText((i/2)+' cm',56,y+4)}}}
  const cp=seg(dT,1.4,2.6)*ga;
  if(cp>0){c.globalAlpha=cp;(A.cross||[]).forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}

const PROBE_PATH=mkPath(PROBE);
/* core: one scan frame. A scenario state may override the default single view with
   s.views [{geo,dx,a}] (tissue textures), s.outs [{list,dx,a}] (outlines), s.lines, s.vessels and s.nerves,
   which is how the Find tab translates and crossfades the femoral and LFCN pictures. */
function core(c,s,sub){
  const A=ANAT[s.anat||cur.anat],dT=s.dT,t=s.t;
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  (s.views||[{geo:A.geo,dx:0,a:1}]).forEach(v=>{if(v.a<=0)return;c.save();c.globalAlpha=texA*v.a;c.drawImage(tissue(v.geo),v.dx,0,W,H);c.restore()});
  const ba=ease(seg(dT,6.3,7.8));
  if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(BEAM[0],BEAM[1],BEAM[2],652);c.restore()}
  if(!sub)drawGuides(c,A,dT,s.gA??1);
  c.save();c.lineJoin='round';c.lineCap='round';
  (s.outs||[{list:GEO[A.geo].OUT,dx:0,a:1}]).forEach(O=>{if(O.a<=0)return;c.save();c.globalAlpha=O.a;c.translate(O.dx,0);
    O.list.forEach(o=>{if(o.n==='probe')return;const p=ease(seg(dT,o.t[0],o.t[1]));
      if(o.glow){c.strokeStyle=`rgba(255,251,244,${.95*(o.ga??1)})`;c.lineWidth=8;strokePartial(c,o.p,p)}
      c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,o.p,p);
      if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}});
    c.restore()});
  c.restore();
  drawLA(c,s,texA);
  drawFascia(c,dT,s);
  (s.vessels||(A.art?[{A,a:1}]:[])).forEach(v=>{if(v.a<=0)return;c.save();c.globalAlpha=v.a;drawVessels(c,v.A,texA*v.a,ease(seg(dT,3.0,4.4)),s.clock);c.restore()});
  (s.nerves||[{n:s.nerve,F:A.fas.nerve,base:A.nerve.rx,a:1}]).forEach(N=>{if(N.a<=0)return;c.save();c.globalAlpha=N.a;drawNerve(c,N.n,N.F,N.base,texA*N.a,ease(seg(dT,3.2,4.4)));c.restore()});
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,PROBE_PATH,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke()}
  c.restore();
  // orientation marker
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    c.textAlign='left';c.fillText('Medial',540,130);c.textAlign='right';c.fillText('Lateral',1000,130);c.restore()}
  if(!sub)cur.guides.forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}

/* ---------- labels, warnings, overlay ---------- */

// non-red cue for a corrected step (same shape as warnPill, accent colour, tick)
function cuePill(c,text,x,y,a,anchor){
  const K='#8f431d';c.save();c.globalAlpha=a;c.font='600 17px Inter, system-ui, sans-serif';const w=c.measureText(text).width+46,h=30;
  if(anchor){c.strokeStyle=K;c.lineWidth=1.3;c.beginPath();c.moveTo(anchor[0]>x+w?x+w:x+17,anchor[0]>x+w?y:y-h/2);c.lineTo(anchor[0],anchor[1]);c.stroke();c.beginPath();c.arc(anchor[0],anchor[1],2.6,0,Math.PI*2);c.fillStyle=K;c.fill()}
  c.fillStyle='#fbf4ec';c.beginPath();c.roundRect?c.roundRect(x,y-h/2,w,h,15):c.rect(x,y-h/2,w,h);c.fill();c.strokeStyle=K;c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x+17,y,9,0,Math.PI*2);c.fillStyle=K;c.fill();
  c.strokeStyle='#fbf4ec';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(x+12.5,y);c.lineTo(x+15.8,y+3.4);c.lineTo(x+21.5,y-3.6);c.stroke();
  c.fillStyle=K;c.textBaseline='middle';c.fillText(text,x+34,y+1);c.restore();
}

function drawLabels(c,s){
  const A=ANAT[cur.anat],a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  if(cur.labels){cur.labels(c,s,a);return}
  A.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a));
  if(A.bone){c.save();c.globalAlpha=a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText(A.bone[0],A.bone[1],A.bone[2]);c.restore()}
  A.pills.forEach(p=>{const v=p[5]?p[5](s):1;if(v>0)pill(c,p[0],p[1],p[2],p[3],p[4](s),a*v)});
  // cur.la: a list of [x,y,align,anchor,text,t0]
  cur.la.forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;
    if(la>0)pill(c,L[4]||'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)});
}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('LFCN block',60,74);
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
  const M=cur.mag,CX=300,CY=M.CY,R=M.R,Z=M.Z,F=M.focus?M.focus(s):[s.nerve.x+4,s.nerve.y-2],FR=R/Z;
  c.save();c.globalAlpha=a;
  c.strokeStyle=`rgba(${C.guide},.8)`;c.lineWidth=1.1;const lp=ease(seg(t,t0,t0+.8));
  [-1,1].forEach(sg=>strokePartial(c,mkPath([[F[0],F[1]+sg*FR],[CX,CY+sg*R]]),lp));
  c.setLineDash([4,5]);c.beginPath();c.arc(F[0],F[1],FR,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const ca=ease(seg(t,t0+.6,t0+1.6));
  c.save();c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.clip();c.fillStyle=C.paper;c.fillRect(CX-R,CY-R,R*2,R*2);
  c.globalAlpha=a*ca;c.translate(CX,CY);c.scale(Z,Z);c.translate(-F[0],-F[1]);core(c,s,true);c.restore();
  c.strokeStyle=C.ink;c.lineWidth=2.6;strokePartial(c,mkPath(ellipsePts(CX,CY,R,R,90)),ease(seg(t,t0+.1,t0+1.1)));
  c.strokeStyle='rgba(43,30,24,.35)';c.lineWidth=1;strokePartial(c,mkPath(ellipsePts(CX,CY,R+7,R+7,90)),ease(seg(t,t0+.3,t0+1.3)));
  const ta=ease(seg(t,t0+1.8,t0+2.6));
  if(ta>0){c.globalAlpha=a*ta;c.font='italic 400 19px Fraunces, Georgia, serif';c.fillStyle=C.ink;c.textAlign='left';
    const lines=M.text||['Epineurium intact'];lines.forEach((l,i)=>c.fillText(l,CX+R+22,CY+R-10-(lines.length-1-i)*24))}
  c.restore();
}

/* ---------- probe position view ----------
   SURF: anterior view of the right groin and upper thigh, in canvas px. Screen left = patient's LATERAL.
   cm = surface px per cm. Scan mapping: the in-plane needle is drawn along the probe's long axis, at axial position
   (scanCx - scan x) / scanCm cm from the probe centre (+ = medial). Probe poses, {x,y,rot}; rot is the angle of the
   long axis (lateral end screen left), the caudal direction is (-sin rot, cos rot).
   FEM: femoral block pose. HOME: LFCN block level, 1.5 to 2 cm inferomedial to the ASIS, long axis parallel to the
   ligament, 6.4 cm from FEM (the scan translation in the Find tab). PROX: slid cephalad, the probe's cephalad edge still clear of
   the ligament. DIST: 3 cm caudad, along the sartorius-TFL gap. */
const POSE={fem:{x:880,y:505,rot:.335},home:{x:516,y:371,rot:.42},prox:{x:521,y:360,rot:.42},dist:{x:443,y:535,rot:.36}};
function poseMix(m,p,q){const F=POSE.fem,Hh=POSE.home,Pp=POSE.prox,D=POSE.dist,o={};
  ['x','y','rot'].forEach(k=>o[k]=lerp(F[k],Hh[k],m)+p*(Pp[k]-Hh[k])+q*(D[k]-Hh[k]));return o}
// needle scenarios: probe at HOME, slid up from caudal during the intro
function probeHome(t,s){const k=ease(seg(s.dT,2.4,4));return{x:POSE.home.x+(1-k)*26,y:POSE.home.y+(1-k)*64,rot:POSE.home.rot,a:k}}
const SURF={
  cm:60,scanCx:770,scanCm:130,skinY:147,probeLen:4.0,probeW:1.1,needleLen:4.0,
  view:'Right groin, anterior view',
  asis:[400,240],pubTub:[1150,500],
  ligament:[[400,240],[600,330],[800,410],[1000,466],[1150,500]],
  crease:[[440,330],[640,410],[880,497],[1060,548],[1170,578]],
  pulse:[865,440],artery:[[865,440],[884,600],[912,780]],
  lateral:[[266,180],[282,230],[294,380],[304,560],[326,780]],
  crest:[[400,240],[332,204],[266,180]],
  medial:[[1262,640],[1218,710],[1180,780]],
  pubic:[[1150,500],[1300,540],[1330,560],[1300,610],[1262,640]],
  midline:[[1420,180],[1420,540]],
  sartorius:[[[404,252],[470,420],[590,610],[690,780]],[[418,246],[548,410],[700,600],[800,780]]],
  tfl:[[392,262],[386,420],[378,600]],   // anterior border of tensor fasciae latae, below the ASIS
  probe(t,s){return(cur.probe||probeHome)(t,s)},
  pills:[['ASIS',380,200,'right',c=>c.asis],
    ['Inguinal ligament',740,296,'left',()=>[720,383]],
    ['Femoral artery pulse',1000,380,'left',c=>c.pulse,s=>cur.scan?1-seg(s.t,12.4,13):0],
    ['Tensor fasciae latae',250,620,'right',()=>cur.scan?[380,592]:[386,470]],   // scan: below the distal probe; needles: above the OOP hub
    [probeText,s=>0,s=>0,'left',(c,P)=>P(1.6,.6)]],
  muscles:[['Sartorius',653,622]],
};
// probe pill text: follows the pose in the Find tab (findMix), fixed at block level in the needle scenarios
function probeText(s){if(!cur.scan)return'Probe: transverse, 1 to 2 cm inferomedial to the ASIS';const {m,p,q}=findMix(s.t);
  if(m<.12)return'Probe: on the crease, over the femoral artery';if(m<.9)return'Probe: sliding laterally along the crease';
  if(p>.5)return'Probe: slid cephalad, still distal to the ligament';if(q>.5)return'Probe: 3 cm caudad, along the sartorius-TFL gap';
  return'Probe: transverse, 1 to 2 cm inferomedial to the ASIS'}
// drawSurface: hand-drawn anterior surface view with probe and needle (in-plane or out-of-plane) at the time in s
function drawSurface(c,s,cfg){
  const dT=s.dT,lp=ease(seg(dT,.6,2.8)),ink='rgba(43,30,24,';
  const line=(P,w,a,p=lp,dash)=>{c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink+a+')';c.lineWidth=w*(cfg.lw||1);if(dash)c.setLineDash(dash);strokePartial(c,mkPath(spline(P,false)),p);c.restore()};
  // skin
  const body=spline(cfg.lateral,false).concat(spline(cfg.medial.slice().reverse(),false),spline(cfg.pubic.slice().reverse(),false),[[cfg.midline[1][0],cfg.midline[1][1]],cfg.midline[0]]);
  c.save();c.globalAlpha=ease(seg(dT,1.2,3));polyPath(c,body);const g=c.createLinearGradient(0,140,0,800);g.addColorStop(0,'rgba(243,223,204,.9)');g.addColorStop(1,'rgba(243,223,204,.35)');c.fillStyle=g;c.fill();c.restore();
  line(cfg.lateral,2.2,.9);line(cfg.crest,1.8,.75);line(cfg.medial,2.2,.9);line(cfg.pubic,1.6,.6);line(cfg.midline,1.1,.4,lp,[6,7]);
  cfg.sartorius.forEach(P=>line(P,1.1,.28));
  if(cfg.tfl)line(cfg.tfl,1.1,.28,lp,[5,6]);
  line(cfg.ligament,2.4,.85,ease(seg(dT,1.4,3.2)));
  line(cfg.crease,1.3,.45,ease(seg(dT,1.6,3.4)),[3,5]);
  line(cfg.artery,1.6,.35,ease(seg(dT,2,3.6)),[8,6]);
  // soft top and bottom edges, as the scan fades with depth
  [[170,262,1,0],[700,800,0,1]].forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,y0,W,y1-y0+(a1?100:0))});
  // landmarks
  const la=ease(seg(dT,2,3));
  const lq=cfg.inset?2.2:1;   // landmarks enlarged in the small inset so the ASIS still reads
  c.save();c.globalAlpha=la;c.strokeStyle=C.ink;c.lineWidth=1.6*lq;[cfg.asis,cfg.pubTub].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7*lq,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2*lq,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
  c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r*lq,0,Math.PI*2);c.stroke()});c.restore();
  // probe
  const pr=cfg.probe(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];   // a along the probe (+ medial), o across it (+ caudal)
  const hl=cfg.probeLen/2,hw=cfg.probeW/2;
  // out-of-plane needle: enters just caudal to the probe, under the tip's axial position, and is aimed cephalad under the probe
  const oop=s.na>0&&s.mode==='oop'&&s.tip[0]>-50;
  const drawOOP=()=>{const at=(cfg.scanCx-s.tip[0])/cfg.scanCm,d=clamp((s.tip[1]-cfg.skinY)/89);
    const e=P(at,hw+.7),h=P(at,hw+.7+3.4),h2=P(at,hw+.7+4.3),tp=P(at,lerp(hw+.7,.15,d));
    c.save();c.globalAlpha=s.na;c.lineCap='round';
    c.beginPath();c.moveTo(...h);c.lineTo(...e);c.strokeStyle='#2f3035';c.lineWidth=6;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=3.4;c.stroke();
    if(d>.02){c.setLineDash([7,6]);c.beginPath();c.moveTo(...e);c.lineTo(...tp);c.strokeStyle='rgba(47,48,53,.75)';c.lineWidth=2.2;c.stroke();c.setLineDash([])}
    c.beginPath();c.arc(...e,5,0,Math.PI*2);c.strokeStyle=C.ink;c.lineWidth=1.3;c.stroke();
    c.beginPath();c.moveTo(...h);c.lineTo(...h2);c.strokeStyle='#7a6456';c.lineWidth=12;c.stroke();c.restore()};
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const cab=[P(0,-hw),P(.2,-hw-1.6),P(-.4,-hw-3.4),P(.3,-hw-5.6)];c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();c.roundRect?c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,12):c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,4);c.lineTo(hl*cm,4);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the lateral end, matching "Lateral" on the scan
    c.beginPath();c.arc(-hl*cm+12,-hw*cm+12,5.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
      const L=P(-hl-.2,hw+.55),M=P(hl+.2,hw+.55);c.fillText('Lateral',L[0],L[1]);c.fillText('Medial',M[0],M[1]);c.restore()}}
  if(oop)drawOOP();
  // in-plane needle, lateral to medial; depth from the scan state
  if(s.na>0&&s.mode!=='oop'&&s.tip[0]>-50){
    const [tx,ty]=s.tip,S=s.S,at=(cfg.scanCx-tx)/cfg.scanCm,dd=Math.hypot(tx-S[0],ty-S[1]),ah=at-cfg.needleLen*(dd?Math.abs(tx-S[0])/dd:1);   // steeper needle: shorter shaft seen from above
    const ae=ty>cfg.skinY?(cfg.scanCx-(S[0]+(tx-S[0])*(cfg.skinY-S[1])/(ty-S[1])))/cfg.scanCm:at;
    c.save();c.globalAlpha=s.na;c.lineCap='round';
    const h=P(ah,0),e=P(ae,0),tp=P(at,0);
    c.beginPath();c.moveTo(...h);c.lineTo(...e);c.strokeStyle='#2f3035';c.lineWidth=6;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=3.4;c.stroke();
    if(at>ae){c.setLineDash([7,6]);c.beginPath();c.moveTo(...e);c.lineTo(...tp);c.strokeStyle='rgba(47,48,53,.75)';c.lineWidth=2.2;c.stroke();c.setLineDash([]);
      c.beginPath();c.arc(...e,5,0,Math.PI*2);c.strokeStyle=C.ink;c.lineWidth=1.3;c.stroke()}
    const h2=P(ah-.9,0);c.beginPath();c.moveTo(...h);c.lineTo(...h2);c.strokeStyle='#7a6456';c.lineWidth=12;c.stroke();c.restore()}
  // labels
  const a=cfg.labels===false?0:ease(seg(dT,3.4,4.6))*(s.labels===false?0:1);
  if(a>0){cfg.pills.forEach(p=>{const v=p[5]?p[5](s):1;if(v<=0)return;const an=p[4](cfg,P),T=typeof p[0]==='function'?p[0](s):p[0];
    const fx=typeof p[1]==='function',x=fx?an[0]+100:p[1],y=fx?an[1]+60:p[2];pill(c,T,x,y,p[3],an,a*v)});cfg.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a*.8));
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,1400,200);c.restore()}
}
// small picture-in-picture of drawSurface: during the intro, and for the whole scan in scanning scenarios
const INSET={x:1236,y:96,w:300,h:190,src:[330,175,1000]},INSET_S={x:1314,y:8,w:254,h:161,src:[150,160,1150]};   // INSET_S: scan tabs, above the skin line   // src: crop left, top, width (canvas px of the surface view)
function drawInset(c,s){
  const a=cur.scan?seg(s.dT,1,1.6):seg(s.dT,1,1.6)*(1-seg(s.dT,6.8,7.5))*(started?0:1);if(a<=0)return;
  const I=cur.scan?INSET_S:INSET,k=I.w/I.src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-I.src[0],-I.src[1]);drawSurface(c,Object.assign({},s,{dT:9,na:0}),Object.assign({},SURF,{labels:false,inset:true,lw:2.4}));c.restore();   // inset drawn complete, without the needle
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  const ty=cur.scan?I.y+I.h-25:I.y+1;   // scan inset: tag bottom-left, clear of the ASIS
  c.fillStyle='rgba(251,247,241,.9)';c.fillRect(I.x+1,ty,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',I.x+9,ty+13);c.restore();
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
  curScen: {find:'find', inplane:'inplane', oop:'oop', error:'intraTFL'},
  defaultTab: 'find',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  onTab(tab,scen){(SC[scen].scan?['lfcn','prox','dist','groin']:[ANAT[SC[scen].anat].geo]).forEach(tissue)},
  aria(P){return P.probeView?'Probe position on the right groin for the lateral femoral cutaneous nerve block':'Animated ultrasound-guided lateral femoral cutaneous nerve block'},
  release(){for(const k in tissueCache){tissueCache[k].width=0;delete tissueCache[k]}}
};
});
