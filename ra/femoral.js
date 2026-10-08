/* Femoral nerve block: block module for ra.html (ported from femoral.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player. */
RA.register('femoral', {
  title: 'Femoral nerve block',
  tabsLabel: 'Approach',
  tabs: [['inplane', 'In-plane', 'Lateral to medial'],
         ['error', 'Negative examples', 'Two needle errors']],
  pills: null,
  probe: true,
  notes: '',
  tips: `
<p class="lede">Practical points from consensus papers, trials and technique references. Tags point to the sources below.</p>
<h3>Scanning</h3>
<ul>
  <li>Before choosing your block level, trace the femoral artery distally until the profunda femoris branches off, then slide back up and block above that split; below it the femoral nerve has usually divided and is harder to see and to block.<span class="tag">Bowness 2022</span></li>
  <li>Name the five strong-recommendation structures out loud before the needle goes in: femoral artery, femoral vein, iliopsoas, fascia lata and fascia iliaca, with the femoral nerve as the target. If you cannot point to both fasciae you are not ready to tell a fascia lata give from a fascia iliaca give.<span class="tag">Bowness 2022</span></li>
  <li>If the nerve will not stand out from the iliopsoas, tilt the probe slightly cranially or caudally to beat anisotropy, and expect it to sharpen further once a little fluid opens the space beneath fascia iliaca.<span class="tag">NYSORA</span><span class="tag">Plan A poster</span></li>
  <li>Ease off probe pressure before you inject: a heavy hand collapses the femoral vein (which can occasionally sit deep or lateral to the artery) and squeezes the space you are trying to open beneath fascia iliaca.<span class="tag">NYSORA</span></li>
</ul>
<h3>Needle</h3>
<ul>
  <li>For a catheter, thread it 2 to 4 cm beyond the needle tip and favour a slightly more lateral position within iliacus, where muscle holds a catheter better than fat.<span class="tag">NYSORA</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Do not chase full circumferential spread: a pool of local anaesthetic lying against the anterior or posterolateral side of the nerve beneath fascia iliaca is enough, and correct injection usually pushes the nerve away from the needle.<span class="tag">NYSORA</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Use resistance as a tip-position signal: opening injection pressure was 15 psi or more when the needle indented fascia iliaca or the nerve, and under 15 psi once through the fascia lateral to the nerve or withdrawn 1 mm. High resistance while the fascia is tenting means you are not through yet; never push against it.<span class="tag">Gadsden 2016</span><span class="tag">NYSORA</span></li>
  <li>Warn the patient and the ward that the leg will be weak: in volunteers a femoral nerve block cut quadriceps strength to about 11% of baseline and worsened balance compared with an adductor canal block, so falls precautions are part of the block.<span class="tag">Kwofie 2013</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>After hip arthroscopy, expect fluid extravasation to have pushed everything deeper and distorted the planes, so rescan from the artery outwards rather than relying on your usual depth.<span class="tag">NYSORA</span></li>
  <li>In patients with a large abdominal pannus, tape it up and away before scanning so the inguinal crease, and with it the level above the profunda branch, is actually reachable with the probe.<span class="tag">NYSORA</span></li>
</ul>`,
  sources: `<ol>
  <li><b>Bowness 2022.</b> Bowness JS, Pawa A, Turbitt L, et al. International consensus on anatomical structures to identify on ultrasound for the performance of basic blocks in ultrasound-guided regional anesthesia. <i>Reg Anesth Pain Med</i> 2022;47:106-112. <a href="https://doi.org/10.1136/rapm-2021-103004">doi:10.1136/rapm-2021-103004</a></li>
  <li><b>NYSORA.</b> Ultrasound-guided femoral nerve block. <a href="https://www.nysora.com/techniques/lower-extremity/femoral-nerve-block/ultrasound-guided-femoral-nerve-block/">nysora.com</a></li>
  <li><b>Plan A poster.</b> ESRA/RA-UK Paediatric Plan A Blocks: Femoral Nerve (Record, Ong, Pearson, Pearson, Bowness, Taylor), 2024. <a href="https://esraeurope.org">esraeurope.org</a></li>
  <li><b>Gadsden 2016.</b> Gadsden J, Latmore M, Levine DM, Robinson A. High opening injection pressure is associated with needle-nerve and needle-fascia contact during femoral nerve block. <i>Reg Anesth Pain Med</i> 2016;41(1):50-55. <a href="https://scholars.duke.edu/publication/1110670">scholars.duke.edu</a></li>
  <li><b>Kwofie 2013.</b> Kwofie MK, Shastri UD, Gadsden JC, et al. The effects of ultrasound-guided adductor canal block versus femoral nerve block on quadriceps strength and fall risk. <i>Reg Anesth Pain Med</i> 2013;38(4):321-325. <a href="https://scholars.duke.edu/publication/1106694">scholars.duke.edu</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,shrink,bbox,resample,pop,yAt,bump,
  C,RED,PROBE,BEAM,layer,paperC,lobules,fibres,makeFascicles,planeLA,laAnchor,tentPhase,drawVessels,drawNerve,drawNeedle,guideLine,pill,muscleLabel,warnPill,cuePill,ring}=E;
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
    {p:mkPath(PROBE),t:[0.4,2.2],w:2.2},
    {p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {p:mkPath(G.sartorius),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(G.sartorius,.95))},
    {p:mkPath(G.pectineus),t:[2.0,4.0],w:2.1,dbl:mkPath(shrink(G.pectineus,.97))},
    {p:mkPath(G.iliopsoas),t:[2.2,4.4],w:1.6,a:.8,dbl:mkPath(shrink(G.iliopsoas,.975))},
    {p:mkPath(G.psoasTendon),t:[2.6,3.8],w:1.4,a:.75},
    {p:mkPath(G.femHead),t:[2.8,4.2],w:2.8,glow:true},
  ];
  return G;
}
const GEO={groin:makeGeo('groin')};
const tissueCache={};
function tissue(v){
  if(tissueCache[v])return tissueCache[v];
  const G=GEO[v];const [cv,tg]=layer();const r=rng(7);
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
// guide set: depth ruler, fascia lata and fascia iliaca horizontals, dashed ellipses, dashed fascia iliaca reveal
const guideSet=(nerve,vein,art,fl,fi,G)=>[
  {p:mkPath([[36,140],[36,800]]),t:[0,1.2]},
  {p:mkPath([[40,fl],[1560,fl]]),t:[0.3,1.7]},
  {p:mkPath([[60,fi],[1540,fi]]),t:[0.5,1.9]},
  {p:mkPath(ellipsePts(nerve[0],nerve[1],nerve[2],nerve[3])),t:[0.6,2.4],dash:[6,6]},
  {p:mkPath(ellipsePts(vein[0],vein[1],vein[2],vein[3])),t:[1.1,2.8],dash:[6,6]},
  {p:mkPath(ellipsePts(art[0],art[1],art[2],art[3])),t:[1.2,2.9],dash:[6,6]},
  {p:mkPath(G.fasciaIliaca.map(p=>[p[0],p[1]-10])),t:[0.8,2.6],dash:[8,8]},
];
const ANAT={
  groin:{geo:'groin',
    nerve:{x:750,y:457,rx:60,ry:24},vein:{x:468,y:404,rx:68,ry:44},art:{x:590,y:380,r:56},
    fas:{nerve:makeFascicles(30,60,24,11,2,2.8,[9,7])},
    guides:guideSet([750,457,82,44],[468,404,88,62],[590,380,70,70],300,424,GEO.groin),
    muscles:[['Iliopsoas',1430,602],['Sartorius',1440,358],['Pectineus',300,500]],
    pills:[['Femoral artery',520,252,'right',()=>[556,334]],['Femoral vein',330,372,'right',()=>[408,392]],
      ['Femoral nerve',960,500,'left',s=>[s.nerve.x+44,s.nerve.y+10]],
      ['Fascia lata',290,252,'right',()=>[300,304]],['Fascia iliaca',1190,456,'left',()=>[1150,405]],
      ['Iliopsoas tendon',700,652,'left',()=>[648,604]]],
    bone:['Femoral head',846,784],
  },
};
const TENT=30,TPOP=12.335;
const ALQ=[[0,1.4],[2.0,3.4],[4.0,5.4]];   // 3 x 5 mL = 15 mL
const DRUG='Ropivacaine 0.4%',DOSE=15,MGML=4;   // ropivacaine 0.4% = 4 mg/mL; 15 mL = 60 mg
function aliquots(t,t0,size){let v=0;ALQ.forEach(([a,b])=>{v+=size*ease(seg(t,t0+a,t0+b))});
  const paused=ALQ.some(([a,b],i)=>i<ALQ.length-1&&t>t0+b&&t<t0+ALQ[i+1][0]);return{v,paused}}
/* fiSpread: LA injected beneath fascia iliaca at inj, k = fraction of the planned volume (0..1).
   It lifts fascia iliaca off iliopsoas around the injection point, covers the nerve roof, then tracks medially
   beneath fascia iliaca past the nerve's medial edge to the lateral wall of the femoral artery, and stops there:
   the lift is capped so fascia iliaca never rises into the artery's sheath. Returns lift(x), dip(x) and the x range
   for planeLA, or null when nothing is in. Generic over nerve, artery and injection point (FIB clone, error fixes). */
function fiSpread(G,A,nerve,inj,k){
  if(k<=0)return null;
  const sk=Math.sqrt(k),xc=lerp(inj[0]+8,inj[0]+28,sk),wl=24+136*sk,wr=30+250*sk,Tm=56*Math.pow(k,.6);
  // cov: once ~5 mL is in, a thin LA layer covers the whole nerve roof (fascia iliaca lifted over it)
  const cov=clamp(k*3),R=A.art;
  // medial front xm: from beside the injection to the artery's lower lateral wall
  const xa=R.x+R.r*.7,xm=lerp(Math.min(inj[0]-10,nerve.x+nerve.rx),xa,ease(clamp((k-.05)/.8)));
  const Mt=14*clamp(k*2),wrapM=clamp((nerve.x-nerve.rx+10-xm)/30);
  const tongue=x=>x<xm||x>xc?0:Mt*Math.sqrt(clamp((x-xm)/26));
  const ceil=x=>{const dx=x-R.x,rr=R.r+6;return Math.abs(dx)>=rr?1e9:Math.max(0,yAt(G.fiR,x)-(R.y+Math.sqrt(rr*rr-dx*dx)+2))};
  const lift=x=>Math.min(ceil(x),Math.max(Tm*bump((x-xc)/(x<xc?wl:wr)),9*cov*bump((x-nerve.x)/(nerve.rx+14)),tongue(x)));
  const xd=lerp(inj[0]+4,nerve.x+64,sk),wd=26+22*sk,Dm=32*Math.sqrt(Math.min(1,k*8));
  // LA hugs the nerve roof (no gap between pocket and nerve) and wraps both corners once the medial front has passed
  const hug=x=>{const dx=(x-nerve.x)/nerve.rx;if(Math.abs(dx)>=1)return 0;
    const mt=x<nerve.x?lerp(Math.pow(clamp((x-(nerve.x-nerve.rx))/(nerve.rx*.7)),1.4),1,wrapM):1;
    return Math.max(0,nerve.y-nerve.ry*Math.sqrt(1-dx*dx)+3-yAt(G.fiR,x))*Math.max(clamp(lift(x)/8),cov)*mt};
  const xw=nerve.x-nerve.rx-2,Dw=22*wrapM;
  const dip=x=>Math.max(Dm*bump((x-xd)/wd),hug(x),tongue(x)*.45,Dw*bump((x-xw)/16));
  return{lift,dip,x0:Math.floor(Math.min(xc-wl,xd-wd,cov>0?nerve.x-nerve.rx-40:1e9,xm,xw-16)),x1:Math.ceil(Math.max(xc+wr,xd+wd))};
}
// correct in-plane: tip goes through fascia lata, tents and pierces fascia iliaca, LA lifts fascia iliaca off iliopsoas
function positive(o){
  const A=ANAT[o.anat],G=GEO[A.geo],NS=o.NS,NT=o.NT;
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  let uc=.99;for(let u=.3;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(G.fiR,q[0])){uc=u;break}}
  const ut=Math.min(uc+TENT/L,.999),P=Math.min(1,ut+16/L),Pc=along(NS,NT,uc),ph=tentPhase(o.phase,uc,ut,P);
  return Object.assign({
    Tend:25,vol:DOSE,volT:12.4,magT:19,laT:15.2,
    guides:[[along(NS,NT,o.phase[1]),NT,7.6,12.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){na=seg(t,8.3,8.9);const r=ph(t);tip=along(NS,NT,r.u);if(r.sh&&!reduceMotion){tip[0]+=D[0]*r.sh;tip[1]+=D[1]*r.sh}
        tent=t<TPOP?clamp((r.u-uc)*L,0,TENT):TENT*Math.exp(-(t-TPOP)*9)*(reduceMotion?1:Math.cos((t-TPOP)*26))}
      const I=aliquots(t,o.k[0],5),k=I.v/DOSE;
      const nt=tent*.4*Math.exp(-((Math.hypot(A.nerve.x-Pc[0],A.nerve.y-Pc[1])/110)**2));
      const nerve=Object.assign({},A.nerve,{x:A.nerve.x+o.disp[0]*k+D[0]*nt,y:A.nerve.y+o.disp[1]*k+D[1]*nt});
      // LA beneath fascia iliaca (fiSpread), plus the needle tent
      const sp=fiSpread(G,A,nerve,o.inj||NT,k),lift=sp?sp.lift:()=>0;
      let fi=G.fiR.map(p=>[p[0],p[1]-lift(p[0])]);
      if(Math.abs(tent)>.05)fi=fi.map(p=>{const w=Math.exp(-Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/40); /* cusped profile: a V under the tip, not a broad sag */return[p[0]+D[0]*tent*w,p[1]+D[1]*tent*w]});
      const pocket=sp?planeLA(G.fiR,sp.lift,sp.dip,sp.x0,sp.x1):null;
      return{S:NS,tip,na,k,v:I.v,paused:I.paused,nerve,fi,fl:G.fasciaLata,la:pocket,inj:o.inj||NT,mode:'in'};
    }},o);
}
// in-plane needle line, injection start and nerve shift; shared by the correct scenario and the negative example's fix
const IP={anat:'groin',NS:[1516,-40],NT:[822,446],k:[13.1],disp:[-14,8]};
const SC={
  inplane:positive(Object.assign({phase:[.04,.3,.69,.715,0,0]},IP,{
    subtitle:'Ultrasound-guided, lateral in-plane approach',
    mag:{CY:680,R:140,Z:1.6,focus:s=>[s.nerve.x-30,s.nerve.y-22],text:['Below fascia iliaca:','nerve outlined, LA meets artery']},
    la:[[960,560,'left',s=>laAnchor(s,s.nerve.x+s.nerve.rx+30),'LA below fascia iliaca']],
    caps:[[0,8.2,'1','Femoral nerve lies lateral to the femoral artery, on iliopsoas, deep to fascia iliaca.'],
      [8.2,13,'2','In-plane from lateral. A first give at fascia lata, then fascia iliaca tents and gives beside the nerve.'],
      [13,19,'3','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA lifts fascia iliaca off iliopsoas.'],
      [19,99,'4','15 mL in: LA spreads beneath fascia iliaca, around the nerve and medially towards the artery.']]})),
};
/* fixLedger: volume ledger for a negative example with an animated fix. Before tFix the counter shows the
   misplaced volume against the plan; from tFix it restarts for the corrected injection and the ledger lists
   misplaced + corrected volume and the total dose. */
function fixLedger(label,off,tFix){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL','Below fascia iliaca: '+b.toFixed(1)+' mL',DRUG.replace('R','Total r')+': '+tot.toFixed(1)+' mL ('+Math.round(tot*MGML)+' mg)']}}}
// negative example: the fascia lata give is mistaken for fascia iliaca; 5 mL is laid on top of an intact fascia iliaca.
// The fix is then animated: a small withdraw-and-redirect onto the in-plane line, then the correct scenario's own
// tent, pop and aliquots (FIX = positive(IP) run on a shifted clock). The misplaced pocket (laOff) stays on top.
(function(){
  const A=ANAT.groin,G=GEO.groin;
  const NS=IP.NS,NT=[900,397];
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  const OFF=5,uR=.875;                         // misplaced volume; in-plane u the redirected tip starts from
  const TW=20.6,TR=21.2,TF=21.8,SHIFT=TF-11.05; // warnings fade, redirect start, hand-off to the in-plane clock
  const FIX=positive(Object.assign({},IP,{phase:[uR,uR,uR,uR,0,0]}));
  // the misplaced pocket: a lens resting on fascia iliaca (follows it when the correct spread lifts it)
  const lensLA=(fi,v)=>{const k=v/OFF,sk=Math.sqrt(k),xc=lerp(900,870,sk),wl=20+150*sk,wr=24+150*sk,Tm=44*Math.pow(k,.6);
    return k>0?planeLA(fi,x=>Tm*bump((x-xc)/(x<xc?wl:wr)),()=>0,Math.floor(xc-wl),Math.ceil(xc+wr)):null};
  const FXI=FIX.k[0]+SHIFT;                    // corrected injection starts (absolute time)
  SC.aboveFI={anat:'groin',pill:'Above fascia iliaca',Tend:35.5,vol:DOSE,volT:12.4,magT:29.6,laT:14.2,neg:true,
    subtitle:'Negative example: a common needle error',
    mag:{CY:680,R:140,Z:1.5,focus:s=>[s.nerve.x+20,s.nerve.y-38],text:['5 mL above fascia iliaca,','15 mL below: nerve outlined']},
    la:[[780,262,'right',s=>laAnchor(s,740,s.laOff,775),'LA above fascia iliaca',14.2],
      [960,560,'left',s=>laAnchor(s,s.nerve.x+s.nerve.rx+30),'LA below fascia iliaca',FXI+1.2]],
    guides:[[along(NS,NT,.3),NT,7,11],[along(IP.NS,IP.NT,.8),IP.NT,TR-.2,TF+1.6]],
    caps:[[0,8.2,'1','Femoral nerve lies lateral to the femoral artery, on iliopsoas, deep to fascia iliaca.'],
      [8.2,12.8,'2','Error: the tip passes fascia lata, feels a give and stops. It is still above fascia iliaca.'],
      [12.8,17.5,'3','LA spreads between fascia lata and fascia iliaca. Fascia iliaca stays flat; the nerve does not move.'],
      [17.5,TR,'4','Error recognised: no LA beneath fascia iliaca, so it cannot reach the nerve. Stop at 5 mL.'],
      [TR,FXI+.75,'5','Fix: redirect and advance. Fascia iliaca tents, then gives; the tip lies lateral to the nerve.'],
      [FXI+.75,29.6,'6','Ropivacaine 0.4%, the planned 15 mL, in 5 mL aliquots with aspiration. Fascia iliaca lifts off iliopsoas.'],
      [29.6,99,'7','Total 20 mL, 80 mg: 5 mL wasted above fascia iliaca; 15 mL below outlines the nerve to the artery.']],
    ledger:fixLedger('Above fascia iliaca',OFF,TR),
    state(t){
      const vOff=OFF*ease(seg(t,12.8,15.8));
      if(t>=TR){
        const s=FIX.state(Math.max(t-SHIFT,11.05));
        if(t<TF){const q=ease(seg(t,TR,TF));s.tip=along(along(NS,NT,lerp(1,.97,q)),s.tip,q)}  // withdraw slightly, then onto the in-plane line
        s.laOff=lensLA(s.fi,vOff);return s;
      }
      let tip=[-99,-99],na=seg(t,8.3,8.8),shake=0;
      if(t>=8.3){
        let u;
        if(t<8.9)u=lerp(.1,.45,easeOut(seg(t,8.3,8.9)));
        else if(t<10.5)u=lerp(.45,.76,ease(seg(t,8.9,10.5)));
        else if(t<10.95){const p=pop(t,10.5,.76,.80,3);u=p.u;shake=p.sh}
        else if(t<11.9)u=lerp(.80,1,ease(seg(t,10.95,11.9)));
        else u=1;
        tip=along(NS,NT,u);if(shake&&!reduceMotion){tip[0]+=D[0]*shake;tip[1]+=D[1]*shake}
      }
      return{S:NS,tip,na,k:vOff/OFF,v:vOff,nerve:A.nerve,fi:G.fiR,fl:G.fasciaLata,la:null,laOff:lensLA(G.fiR,vOff),inj:NT,mode:'out'};
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+2.4,FXI+3.0);if(ok>0)cuePill(c,'Nerve moving: correct plane',1010,632,ok);return}
      const a1=seg(t,12.1,12.6)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Above fascia iliaca',1180,250,[s.tip[0]+16,s.tip[1]+8],a1)}
      const a2=seg(t,16.2,16.8)*f;
      if(a2>0){const n=s.nerve;c.save();c.globalAlpha=a2*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(n.x,n.y,n.rx+11,n.ry+11,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'Nerve not moving',1010,582,[n.x+14,n.y+n.ry+11],a2)}
      const a3=seg(t,17.6,18.2)*f;
      if(a3>0)warnPill(c,'Stop at 5 mL',1010,632,null,a3);
    }};
})();
// negative example 2: intramuscular. The tip tents and pierces fascia iliaca (positive() tent and pop on a deeper
// line), keeps going ~8.5 mm into iliopsoas lateral to and below the nerve, and 2 mL swells inside the muscle.
// Fix: slow withdrawal to just beneath fascia iliaca, then the correct spread (positive() on a shifted clock).
(function(){
  const A=ANAT.groin,G=GEO.groin;
  const NS=IP.NS,NT=[870,532];                 // deep tip, inside iliopsoas
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]);
  const OFF=2,TW=19.4,TR=20.0,TB=22.2;          // misplaced volume; warnings fade, withdrawal start and end
  const DEEP=positive(Object.assign({},IP,{NT,phase:[.04,.26,.585,.605,0,0],k:[1e9],disp:[0,0]}));
  let uc=.99;for(let u=.3;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(G.fiR,q[0])){uc=u;break}}
  const uW=uc+22/L,INJ=along(NS,NT,uW);       // just beneath fascia iliaca, lateral to the nerve
  const FXI=22.6,FIX=positive(Object.assign({},IP,{NT:INJ,phase:[1,1,1,1,0,0]})),SHIFT=FXI-FIX.k[0];
  // intramuscular LA: a contained swelling elongated along the fibres, with streaks tracking between them
  const imLA=v=>{const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),r=rng(21),P=[];
    for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,w=1+.12*Math.sin(a*3+1)+.06*Math.sin(a*5);P.push([NT[0]-6+Math.cos(a)*50*sk*w,NT[1]+Math.sin(a)*19*sk*w])}
    const st=[[-1,-7,70],[1,6,62],[-1,11,46],[1,-9,40]].map(([d,dy,len])=>{const x0=NT[0]-6+d*42*sk,ln=len*sk;
      return ellipsePts(x0+d*ln/2,NT[1]+dy*sk,ln/2,2.2*sk+.5,24)});
    return{x:NT[0]-6,y:NT[1],rx:50*sk,ry:19*sk,polys:[P].concat(st)}};
  SC.intraMusc={anat:'groin',pill:'Into iliopsoas',Tend:34.3,vol:DOSE,volT:12.4,magT:28.4,laT:FXI+1.2,neg:true,
    subtitle:'Negative example: a common needle error',
    mag:{CY:680,R:140,Z:1.4,focus:s=>[s.nerve.x+70,s.nerve.y+12],text:['2 mL in iliopsoas,','15 mL beneath fascia iliaca']},
    la:[[960,560,'left',s=>laAnchor(s,s.nerve.x+s.nerve.rx+30),'LA below fascia iliaca',FXI+1.2]],
    guides:[[along(NS,NT,.3),NT,7,11]],
    caps:[[0,8.2,'1','Femoral nerve lies lateral to the femoral artery, on iliopsoas, deep to fascia iliaca.'],
      [8.2,13.4,'2','Error: fascia iliaca tents and gives, but the tip keeps going, 8 mm deep into iliopsoas.'],
      [13.4,17.4,'3','LA swells inside the muscle, between its fibres. Fascia iliaca does not lift; the nerve does not move.'],
      [17.4,TR,'4','Error recognised: intramuscular injection. Stop after 2 mL.'],
      [TR,FXI+.6,'5','Fix: withdraw slowly until the tip sits just beneath fascia iliaca, lateral to the nerve.'],
      [FXI+.6,28.4,'6','Ropivacaine 0.4%, the planned 15 mL, in 5 mL aliquots with aspiration. Fascia iliaca lifts off iliopsoas.'],
      [28.4,99,'7','Total 17 mL, 68 mg: 2 mL in iliopsoas; 15 mL beneath fascia iliaca outlines the nerve to the artery.']],
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
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+1.0,FXI+1.6);if(ok>0)cuePill(c,'Fascia iliaca lifting: correct plane',1010,632,ok);return}
      const a1=seg(t,13.4,13.9)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Tip in iliopsoas: intramuscular',1000,640,[s.tip[0]+16,s.tip[1]+8],a1)}
      const a2=seg(t,16.2,16.8)*f;
      if(a2>0)warnPill(c,'Fascia iliaca not lifting',600,262,[800,yAt(G.fiR,800)],a2);
      const a3=seg(t,17.5,18.1)*f;
      if(a3>0)warnPill(c,'Stop',1000,690,null,a3);
    }};
})();
const TABS={inplane:['inplane'],error:['aboveFI','intraMusc']};
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
function drawFascia(c,dT,s){
  c.save();c.lineJoin='round';c.lineCap='round';
  c.strokeStyle=C.ink;c.lineWidth=1.9;strokePartial(c,mkPath(s.fl),ease(seg(dT,1.5,3.3)));
  c.lineWidth=2.4;strokePartial(c,mkPath(s.fi),ease(seg(dT,1.7,3.6)));
  c.restore();
}
function drawGuides(c,A,dT){
  const fade=dT<4?1:lerp(1,.32,seg(dT,4,6.5));
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  A.guides.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  // depth ruler: 130 px per cm from the skin (y 147), minor tick every 5 mm
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=10;i++){if(i/10>tp)break;const y=147+i*65,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke();if(i){c.fillStyle=`rgba(${C.guide},.72)`;c.font='400 13px Inter, system-ui, sans-serif';c.fillText((i/2)+' cm',56,y+4)}}}
  const cp=seg(dT,1.4,2.6);
  if(cp>0){c.globalAlpha=cp;[[A.nerve.x,A.nerve.y],[A.vein.x,A.vein.y],[A.art.x,A.art.y]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}
function core(c,s,sub){
  const A=ANAT[cur.anat],G=GEO[A.geo],dT=s.dT,t=s.t;
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  c.save();c.globalAlpha=texA;c.drawImage(tissue(A.geo),0,0,W,H);c.restore();
  const ba=ease(seg(dT,6.3,7.8));
  if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(BEAM[0],BEAM[1],BEAM[2],652);c.restore()}
  if(!sub)drawGuides(c,A,dT);
  c.save();c.lineJoin='round';c.lineCap='round';
  G.OUT.forEach((o,i)=>{if(i===0)return;const p=ease(seg(dT,o.t[0],o.t[1]));
    if(o.glow){c.strokeStyle='rgba(255,251,244,.95)';c.lineWidth=8;strokePartial(c,o.p,p)}
    c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,o.p,p);
    if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}});
  c.restore();
  drawLA(c,s,texA);
  drawFascia(c,dT,s);
  drawVessels(c,A,texA,ease(seg(dT,3.0,4.4)),s.clock);
  drawNerve(c,s.nerve,A.fas.nerve,A.nerve.rx,texA,ease(seg(dT,3.2,4.4)));
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,G.OUT[0].p,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke()}
  c.restore();
  // orientation marker
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    c.textAlign='left';c.fillText('Medial',540,130);c.textAlign='right';c.fillText('Lateral',1000,130);c.restore()}
  if(!sub)cur.guides.forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}
function drawLabels(c,s){
  const A=ANAT[cur.anat],a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  A.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a));
  if(A.bone){c.save();c.globalAlpha=a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.fillText(A.bone[0],A.bone[1],A.bone[2]);c.restore()}
  A.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](s),a));
  // cur.la: one [x,y,align,anchor] or a list of [x,y,align,anchor,text,t0]
  (typeof cur.la[0]==='number'?[cur.la]:cur.la).forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;
    if(la>0)pill(c,L[4]||'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)});
}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('Femoral nerve block',60,74);
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
  if(ha>0){c.save();c.globalAlpha=ha*(reduceMotion?1:.7+.3*Math.sin(s.clock*3));c.fillStyle='#a8552a';c.font='italic 400 22px Fraunces, Georgia, serif';c.textAlign='right';c.fillText('Press play to see the needle',1540,74);c.restore()}
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
   Every position lives here so the LFCN / FIB clones move the probe (cfg.probe) and landmarks without editing
   drawSurface. cm = surface px per cm. Scan mapping: the needle is drawn in plane along the probe's long axis,
   at axial position (scanCx - scan x) / scanCm cm from the probe centre (+ = medial). */
const SURF={
  cm:60,scanCx:770,scanCm:130,skinY:147,probeLen:4.0,probeW:1.1,needleLen:5.0,
  view:'Right groin, anterior view',
  asis:[400,240],pubTub:[1150,500],
  ligament:[[400,240],[600,330],[800,410],[1000,466],[1150,500]],
  crease:[[440,330],[640,410],[880,497],[1060,548],[1170,578]],
  pulse:[865,440],artery:[[865,440],[884,600],[912,780]],
  lateral:[[306,180],[322,230],[334,380],[344,560],[366,780]],
  crest:[[400,240],[352,206],[306,180]],
  medial:[[1262,640],[1218,710],[1180,780]],
  pubic:[[1150,500],[1300,540],[1330,560],[1300,610],[1262,640]],
  midline:[[1420,180],[1420,540]],
  sartorius:[[[404,252],[470,420],[590,610],[690,780]],[[418,246],[548,410],[700,600],[800,780]]],
  // probe pose: transverse along the inguinal crease over the artery; slides up onto the crease during the intro
  probe(t,s){const k=ease(seg(s.dT,2.4,4));return{x:880,y:505+(1-k)*70,rot:.335,a:k}},
  pills:[['ASIS',380,200,'right',c=>c.asis],['Pubic tubercle',1180,452,'left',c=>c.pubTub],
    ['Inguinal ligament',560,262,'right',()=>[620,338]],['Femoral artery pulse',1000,380,'left',c=>c.pulse],
    ['Probe: transverse at the inguinal crease',1010,650,'left',(c,P)=>P(1.6,.6)]],
  muscle:['Sartorius',600,640],
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
  [[170,262,1,0],[700,800,0,1]].forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,y0,W,y1-y0+(a1?100:0))});
  // landmarks
  const la=ease(seg(dT,2,3));
  c.save();c.globalAlpha=la;c.strokeStyle=C.ink;c.lineWidth=1.6;[cfg.asis,cfg.pubTub].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
  c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r,0,Math.PI*2);c.stroke()});c.restore();
  // probe
  const pr=cfg.probe(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];   // a along the probe (+ medial), o across it (+ caudal)
  const hl=cfg.probeLen/2,hw=cfg.probeW/2;
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const cab=[P(0,-hw),P(.2,-hw-1.6),P(-.4,-hw-3.4),P(.3,-hw-5.6)];c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();c.roundRect?c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,12):c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,4);c.lineTo(hl*cm,4);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the lateral end, matching "Lateral" on the scan
    c.beginPath();c.arc(-hl*cm+12,-hw*cm+12,5.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
      const L=P(-hl-.2,hw+.55),M=P(hl+.2,hw+.55);c.fillText('Lateral',L[0],L[1]);c.fillText('Medial',M[0],M[1]);c.restore()}}
  // needle, in plane with the probe, lateral to medial; depth from the scan state
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
  if(a>0){cfg.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](cfg,P),a));muscleLabel(c,cfg.muscle[0],cfg.muscle[1],cfg.muscle[2],a*.8);
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,1400,200);c.restore()}
}
// small picture-in-picture of drawSurface shown during the intro (top right, clear of title, scan probe and captions)
const INSET={x:1236,y:96,w:300,h:190,src:[330,175,1000]};   // src: crop left, top, width (canvas px of the surface view)
function drawInset(c,s){
  const a=seg(s.dT,1,1.6)*(1-seg(s.dT,6.8,7.5));if(a<=0||started)return;
  const I=INSET,k=I.w/I.src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-I.src[0],-I.src[1]);drawSurface(c,Object.assign({},s,{dT:9,na:0}),Object.assign({},SURF,{labels:false,inset:true,lw:2.4}));c.restore();   // inset drawn complete, without the needle
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  c.fillStyle='rgba(251,247,241,.9)';c.fillRect(I.x+1,I.y+1,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',I.x+9,I.y+14);c.restore();
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
  curScen: {inplane:'inplane', error:'aboveFI'},
  defaultTab: 'inplane',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  onTab(tab,scen){tissue(ANAT[SC[scen].anat].geo)},
  aria(P){return P.probeView?'Probe position on the right groin for the femoral nerve block':'Animated ultrasound-guided femoral nerve block'},
  release(){for(const k in tissueCache){tissueCache[k].width=0;delete tissueCache[k]}}
};
});
