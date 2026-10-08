/* Popliteal sciatic block: block module for ra.html (ported from popliteal.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player.
   Popliteal keeps its own drawNerve (inner ring and outline weights differ from the engine copy). */
RA.register('popliteal', {
  title: 'Popliteal sciatic block',
  tabsLabel: 'Anatomical variant',
  tabs: [['stacked', 'CPN over TN', 'Stacked'],
         ['deep', 'Side by side', 'Deep'],
         ['sup', 'Side by side', 'Superficial']],
  pills: {supErr: {label: 'In-plane: errors', neg: true}, supIP: 'In-plane: correct', supOOP: 'Out-of-plane: correct'},
  probe: false,
  notes: '',
  tips: `
<p class="lede">From published technique guidance and trials. Numbers in tags refer to the source list.</p>
<h3>Scanning</h3>
<ul>
  <li>Start on the popliteal artery at the crease, then slide proximally until the tibial and common peroneal nerves meet. The junction is usually 5 to 10 cm above the crease but varies, so find it on every patient rather than assuming a fixed distance.<br><span class="tag">NYSORA; BJA Educ 2020 [1, 3]</span></li>
  <li>If the nerve disappears into the surrounding fat, tilt the probe caudally to beat anisotropy, and ask the patient to dorsiflex and plantarflex the ankle so the two branches rock against each other (the see-saw sign).<br><span class="tag">NYSORA; BJA Educ 2020 [1, 3]</span></li>
</ul>
<h3>Needle</h3>
<ul>
  <li>For the lateral in-plane approach, puncture the skin 2 to 3 cm lateral to the transducer edge to flatten the needle angle and improve shaft visibility, using a single skin puncture deep to the biceps femoris tendon.<br><span class="tag">NYSORA; RA-UK Plan A [1, 4]</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Inject deep to the nerve first and then superficial to it, aspirating every 5 mL and after every needle reposition, so the nerve is lifted and wrapped rather than pushed away.<br><span class="tag">RA-UK Plan A [4]</span></li>
  <li>One injection through the common paraneural sheath at the bifurcation gave about 30% faster sensory and motor onset than separate injections around each branch below the split, with wider spread up and down the nerve, fewer needle passes, and no increase in nerve size.<br><span class="tag">Perlas, RAPM 2013 [5]</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Do not chase a twitch. In one ultrasound study a motor response at 0.2 to 0.5 mA appeared only once the needle tip was already inside the nerve in 20 of 24 patients, and no twitch at 1.5 mA did not rule out an intraneural tip.<br><span class="tag">Robards, Anesth Analg 2009 [6]</span></li>
  <li>Treat high opening pressure as a sign of needle-nerve contact. At the interscalene level, opening pressure of 15 psi or more detected contact in 35 of 36 injections, and NYSORA applies the same under-15-psi limit to the popliteal block.<br><span class="tag">Gadsden, Anesthesiology 2014; NYSORA [7, 1]</span></li>
  <li>Watch the common peroneal nerve most closely: NYSORA notes it is where most neurological injuries after this block occur.<br><span class="tag">NYSORA [2]</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>A patchy block usually means only one branch was blocked, which BJA Education calls the most common novice mistake. If the medial leg or ankle is still sensate, the saphenous nerve has to be blocked separately.<br><span class="tag">BJA Educ 2020 [3]</span></li>
  <li>For popliteal catheters after major foot and ankle surgery, programmed intermittent boluses gave the same analgesia as a continuous infusion but a denser motor block, so expect more foot weakness with bolus regimens.<br><span class="tag">Short, RAPM 2019 [8]</span></li>
</ul>`,
  sources: `<ol>
  <li>NYSORA. Ultrasound-guided popliteal sciatic nerve block. <a href="https://www.nysora.com/techniques/lower-extremity/ultrasound-guided-popliteal-sciatic-block/" rel="noopener">nysora.com</a></li>
  <li>NYSORA. Sciatic nerve block in the popliteal fossa. <a href="https://www.nysora.com/techniques/lower-extremity/block-sciatic-nerve-popliteal-fossa/" rel="noopener">nysora.com</a></li>
  <li>Shevlin S, Johnston D, Turbitt L. The sciatic nerve block. BJA Educ 2020;20(9):312&ndash;320. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC7807968/" rel="noopener">PMC7807968</a></li>
  <li>Record, Lloyd, Lewis, Bowness, Taylor. RA-UK Plan A Blocks: popliteal level sciatic nerve block (ESRA-endorsed poster, 2022; cites Bowness et al. RAPM 2022;47:106&ndash;112). <a href="https://www.esraeurope.org/wp-content/uploads/2022/06/Popliteal-Level-Sciatic-Nerve-Block.pdf" rel="noopener">esraeurope.org (PDF)</a></li>
  <li>Perlas A, Wong P, Abdallah F, et al. Ultrasound-guided popliteal block through a common paraneural sheath versus conventional injection. Reg Anesth Pain Med 2013;38(3):218&ndash;225. <a href="https://pubmed.ncbi.nlm.nih.gov/23558372/" rel="noopener">PMID 23558372</a></li>
  <li>Robards C, Hadzic A, Somasundaram L, et al. Intraneural injection with low-current stimulation during popliteal sciatic nerve block. Anesth Analg 2009;109(2):673&ndash;677. <a href="https://pubmed.ncbi.nlm.nih.gov/19608846/" rel="noopener">PMID 19608846</a></li>
  <li>Gadsden JC, Choi JJ, Lin E, Robinson A. Opening injection pressure consistently detects needle-nerve contact during ultrasound-guided interscalene brachial plexus block. Anesthesiology 2014;120(5):1246&ndash;1253. <a href="https://pubmed.ncbi.nlm.nih.gov/24413417/" rel="noopener">PMID 24413417</a></li>
  <li>Short AJ, Ghosh M, Jin R, Chan VWS, Chin KJ. Intermittent bolus versus continuous infusion popliteal sciatic nerve block following major foot and ankle surgery. Reg Anesth Pain Med 2019. <a href="https://pubmed.ncbi.nlm.nih.gov/31570495/" rel="noopener">PMID 31570495</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,inPoly,shrink,bbox,hull,resample,pop,
  C,RED,PROBE,BEAM,layer,paperC,lobules,fibres,makeFascicles,tentPhase,drawVessels,drawNeedle,guideLine,pill,muscleLabel,warnPill,ring}=E;
let cur,started,showLabels;   // mirrors of the player state, refreshed by sync() before every render

/* ---------- tissue geometry (two layer sets) ---------- */
function makeGeo(v){
  const G={};
  G.skinTop=spline([[20,180],[300,160],[517,147],[770,146],[1016,147],[1300,160],[1580,180]],false);
  G.SM=spline([[100,380],[380,364],[540,380],[660,452],[695,590],[665,722],[560,692],[400,622],[230,562],[120,472]],true);
  G.LL=[[110,480],[230,570],[400,630],[560,700],[640,790],[380,800],[200,700],[100,580]];
  G.RB=[[1150,785],[1262,765],[1400,605],[1500,420],[1575,380],[1575,790],[1300,812]];
  G.floor=spline([[640,722],[720,684],[820,668],[950,675],[1032,704]],false);
  G.floor2=spline([[648,732],[724,694],[820,679],[948,686],[1026,714]],false);
  if(v==='thick'){
    G.skinDeep=spline([[30,188],[300,169],[560,161],[770,159],[1000,161],[1300,169],[1570,188]],false);
    G.fascia=spline([[60,202],[300,238],[520,254],[770,261],[1000,261],[1200,254],[1400,230],[1560,197]],false);
    G.L1=spline([[110,250],[260,248],[355,268],[392,305],[372,342],[240,352],[110,338]],true);
    G.ST=spline([[362,282],[500,282],[602,300],[618,340],[610,386],[560,364],[450,340],[398,314]],true);
    G.BF=spline([[1022,292],[1150,266],[1400,232],[1522,218],[1500,400],[1400,600],[1262,762],[1150,782],[1086,650],[1050,500],[1032,382]],true);
    G.fatPad=[[600,250],[1070,250],[1070,725],[615,725]];
  }else{
    G.skinDeep=spline([[30,188],[300,166],[560,158],[800,156],[1040,158],[1300,166],[1570,188]],false);
    G.fascia=spline([[60,200],[300,228],[480,232],[640,214],[720,182],[820,174],[930,178],[1030,212],[1200,226],[1400,214],[1560,195]],false);
    G.L1=spline([[110,248],[260,244],[360,264],[395,305],[372,345],[240,355],[110,340]],true);
    G.ST=spline([[372,262],[500,250],[598,240],[640,262],[636,330],[622,384],[570,366],[460,332],[402,302]],true);
    G.BF=spline([[1030,250],[1150,240],[1400,224],[1522,210],[1500,400],[1400,600],[1262,762],[1150,782],[1086,650],[1050,500],[1030,370]],true);
    G.fatPad=[[600,180],[1070,180],[1070,725],[615,725]];
  }
  G.band=G.skinDeep.concat(G.fascia.slice().reverse());
  G.OUT=[
    {p:mkPath(PROBE),t:[0.4,2.2],w:2.2},
    {p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {p:mkPath(G.fascia),t:[1.5,3.3],w:1.9},
    {p:mkPath(G.L1),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(G.L1,.96))},
    {p:mkPath(G.ST),t:[2.0,4.0],w:2.1,dbl:mkPath(shrink(G.ST,.95))},
    {p:mkPath(G.SM),t:[2.2,4.4],w:2.1,dbl:mkPath(shrink(G.SM,.975))},
    {p:mkPath(G.BF),t:[2.4,4.4],w:2.1,dbl:mkPath(shrink(G.BF,.965))},
    {p:mkPath(G.floor),t:[2.8,4.2],w:1.8},
    {p:mkPath(G.floor2),t:[2.9,4.3],w:1,a:.5},
  ];
  return G;
}
const GEO={thick:makeGeo('thick'),thin:makeGeo('thin')};

const tissueCache={};
function tissue(v,subLob){
  if(tissueCache[v])return tissueCache[v];
  const G=GEO[v];const [cv,tg]=layer();const r=rng(7);
  tg.save();polyPath(tg,G.fatPad);tg.fillStyle=C.fat;tg.fill();tg.clip();lobules(tg,G.fatPad,r,12,22,9,16,'rgba(150,88,58,.32)');tg.restore();
  tg.save();polyPath(tg,G.band);tg.fillStyle=C.sub;tg.fill();tg.clip();
  if(v==='thick')lobules(tg,G.band,r,14,24,9,15,'rgba(150,88,58,.30)');else lobules(tg,G.band,r,10,20,6,11,'rgba(150,88,58,.30)');tg.restore();
  [[G.LL,.45,.55],[G.RB,2.1,.5]].forEach(([P,a,al])=>{tg.save();tg.globalAlpha=al;polyPath(tg,P);tg.fillStyle='#f0d4bd';tg.fill();tg.clip();fibres(tg,P,a,380,r,.8);tg.restore()});
  [[G.L1,-.12,520],[G.ST,.2,320],[G.SM,.55,1200],[G.BF,1.95,1400]].forEach(([P,a,n])=>{
    tg.save();polyPath(tg,P);const bb=bbox(P);const gr=tg.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
    tg.fillStyle=gr;tg.fill();tg.clip();tg.lineWidth=26;tg.strokeStyle='rgba(176,96,56,.16)';polyPath(tg,P);tg.stroke();fibres(tg,P,a,n,r,1);tg.restore()});
  const gr=tg.createLinearGradient(0,660,0,830);gr.addColorStop(0,'rgba(244,236,225,0)');gr.addColorStop(1,'rgba(244,236,225,1)');tg.fillStyle=gr;tg.fillRect(0,660,W,H-660);
  return tissueCache[v]=cv;
}

/* ---------- anatomy variants ---------- */
const guideSet=(tib,cpn,vein,art,sh,hy1,hy2)=>[
  {p:mkPath([[36,140],[36,790]]),t:[0,1.2]},
  {p:mkPath([[40,hy1],[1560,hy1]]),t:[0.3,1.7]},
  {p:mkPath([[60,hy2],[1540,hy2]]),t:[0.5,1.9]},
  {p:mkPath(ellipsePts(tib[0],tib[1],tib[2],tib[3])),t:[0.6,2.4],dash:[6,6]},
  {p:mkPath(ellipsePts(cpn[0],cpn[1],cpn[2],cpn[3])),t:[0.8,2.5],dash:[6,6]},
  {p:mkPath(ellipsePts(sh[0],sh[1],sh[2],sh[3])),t:[1.0,2.8],dash:[3,7]},
  {p:mkPath(ellipsePts(vein[0],vein[1],vein[2],vein[3])),t:[1.1,2.8],dash:[6,6]},
  {p:mkPath(ellipsePts(art[0],art[1],art[2],art[3])),t:[1.2,2.9],dash:[6,6]},
  {p:mkPath(spline([[300,40],[272,150],[266,262],[290,380]],false)),t:[0.4,2.0],dash:[8,8]},
];
const leftmost=s=>s.sh.pts.reduce((m,p)=>p[0]<m[0]?p:m)[0];
const ANAT={
  stacked:{geo:'thick',
    tib:{x:780,y:412,rx:62,ry:52},cpn:{x:838,y:318,rx:40,ry:38},vein:{x:780,y:502,rx:64,ry:22},art:{x:780,y:590,r:48},
    fas:{tib:makeFascicles(52,62,52,11),cpn:makeFascicles(22,40,38,23)},
    mm:(a,m)=>{const s=Math.sin(a);return 11+(m-11)*(s>0?.15:1-.7*Math.abs(s))},
    guides:guideSet([780,412,84,74],[838,318,60,58],[780,502,88,40],[780,590,70,70],[808,370,120,120],365,545),
    muscles:[['Semitendinosus',245,308],['Semimembranosus',400,470],['Biceps femoris',1300,470]],
    pills:[['Common peroneal nerve',960,292,'left',s=>[s.cpn.x+32,s.cpn.y-18]],['Tibial nerve',660,410,'right',s=>[s.tib.x-58,s.tib.y+14]],
      ['Popliteal vein',668,506,'right',()=>[716,504]],['Popliteal artery',660,590,'right',()=>[730,590]]],
    sheathPill:[640,300,s=>[leftmost(s)+6,s.tib.y-44]],
  },
  deep:{geo:'thick',
    tib:{x:750,y:412,rx:66,ry:48},cpn:{x:895,y:403,rx:44,ry:44},vein:{x:782,y:500,rx:68,ry:20},art:{x:792,y:586,r:48},
    fas:{tib:makeFascicles(50,66,48,11),cpn:makeFascicles(26,44,44,23)},
    mm:(a,m)=>11+(m-11)*(Math.sin(a)>0?.35:.8),
    guides:guideSet([750,412,88,70],[895,403,64,64],[782,500,90,40],[792,586,70,70],[822,408,176,92],408,544),
    muscles:[['Semitendinosus',245,308],['Semimembranosus',400,470],['Biceps femoris',1310,560]],
    pills:[['Common peroneal nerve',1010,452,'left',s=>[s.cpn.x+36,s.cpn.y+22]],['Tibial nerve',640,428,'right',s=>[s.tib.x-60,s.tib.y+16]],
      ['Popliteal vein',650,504,'right',()=>[716,502]],['Popliteal artery',660,586,'right',()=>[742,586]]],
    sheathPill:[640,350,s=>[leftmost(s)+6,s.tib.y-14]],
  },
  sup:{geo:'thin',
    tib:{x:729,y:256,rx:72,ry:56},cpn:{x:880,y:251,rx:46,ry:46},vein:{x:780,y:392,rx:72,ry:36},art:{x:790,y:506,r:49},
    fas:{tib:makeFascicles(58,72,56,11),cpn:makeFascicles(28,46,46,23)},
    mm:(a,m)=>11+(m-11)*(1-.6*Math.abs(Math.sin(a))),
    guides:guideSet([729,256,94,78],[880,251,66,66],[780,392,96,56],[790,506,70,70],[800,254,196,96],254,450),
    muscles:[['Semitendinosus',245,310],['Semimembranosus',400,470],['Biceps femoris',1300,470]],
    pills:[['Common peroneal nerve',1000,318,'left',s=>[s.cpn.x+34,s.cpn.y+30]],['Tibial nerve',600,338,'right',s=>[s.tib.x-50,s.tib.y+40]],
      ['Popliteal vein',650,400,'right',()=>[708,396]],['Popliteal artery',660,506,'right',()=>[741,506]]],
    sheathPill:[600,214,s=>[leftmost(s)+5,s.tib.y-16]],
  },
};
function sheathShape(A,tib,cpn,m){const P=[];[tib,cpn].forEach(n=>{for(let i=0;i<64;i++){const a=i/64*Math.PI*2,mm=A.mm(a,m);P.push([n.x+(n.rx+mm)*Math.cos(a),n.y+(n.ry+mm)*Math.sin(a)])}});
  const h=hull(P);let cx=0,cy=0;h.forEach(p=>{cx+=p[0];cy+=p[1]});return{pts:h,cx:cx/h.length,cy:cy/h.length}}

/* ---------- scenarios ---------- */
const TENT=16,TPOP=12.335;
const ALQ=[[0,1.4],[2.0,3.4],[4.0,5.4]];
function aliquots(t,t0,size){let v=0;ALQ.forEach(([a,b])=>{v+=size*ease(seg(t,t0+a,t0+b))});
  const paused=ALQ.some(([a,b],i)=>i<ALQ.length-1&&t>t0+b&&t<t0+ALQ[i+1][0]);return{v,paused}}
function positive(o){
  const A=ANAT[o.anat],NS=o.NS,NT=o.NT;
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  const base0=sheathShape(A,A.tib,A.cpn,11);
  let uc=.99;for(let u=.3;u<=1;u+=.0005){const q=along(NS,NT,u);if(inPoly(q[0],q[1],base0.pts)){uc=u;break}}
  const ut=Math.min(uc+TENT/L,.999),P=Math.min(1,ut+16/L),Pc=along(NS,NT,uc),ph=tentPhase(o.phase,uc,ut,P);
  return Object.assign({
    Tend:25,vol:15,volT:12.4,magT:19,laT:15.2,
    guides:[[along(NS,NT,o.phase[1]),NT,7.6,12.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){na=seg(t,8.3,8.9);const r=ph(t);tip=along(NS,NT,r.u);if(r.sh&&!reduceMotion){tip[0]+=D[0]*r.sh;tip[1]+=D[1]*r.sh}
        tent=t<TPOP?clamp((r.u-uc)*L,0,TENT):TENT*Math.exp(-(t-TPOP)*9)*(reduceMotion?1:Math.cos((t-TPOP)*26))}
      const I=aliquots(t,o.k[0],5),k=I.v/15;
      const nudge=n=>tent*.55*Math.exp(-((Math.hypot(n.x-Pc[0],n.y-Pc[1])/90)**2));
      const nt=nudge(A.tib),nc=nudge(A.cpn);
      const tib=Object.assign({},A.tib,{x:A.tib.x+o.disp[0]*k+D[0]*nt,y:A.tib.y+o.disp[1]*k+D[1]*nt});
      const cpn=Object.assign({},A.cpn,{x:A.cpn.x+o.disp[2]*k+D[0]*nc,y:A.cpn.y+o.disp[3]*k+D[1]*nc});
      let sh=sheathShape(A,tib,cpn,11+o.m*k);
      if(Math.abs(tent)>.05){const pts=resample(sh.pts,4).map(p=>{const w=Math.exp(-((Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/26)**2));return[p[0]+D[0]*tent*w,p[1]+D[1]*tent*w]});sh={pts,cx:sh.cx,cy:sh.cy}}
      return{S:NS,tip,na,k,v:I.v,paused:I.paused,tib,cpn,sh,inj:NT,mode:'in'};
    }},o);
}
const SC={
  stacked:positive({anat:'stacked',NS:[1660,337],NT:[848,378],phase:[-.12,.1,.76,.79,.975,1],k:[13.1],disp:[-6,0,5,0],m:24,
    subtitle:'Ultrasound-guided, lateral in-plane approach',mag:{CY:650,R:140,Z:2.0},
    la:[960,452,'left',s=>[s.tib.x+56,s.tib.y+44]],
    caps:[[0,8.2,'1','Common peroneal nerve sits over the tibial nerve, both in one paraneural sheath above the vessels.'],
      [8.2,13,'2','In-plane from lateral, through biceps femoris. The sheath tents, then gives; the tip rests beside the tibial nerve.'],
      [13,19,'3','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA tracks inside the sheath and parts the nerves.'],
      [19,99,'4','15 mL in: circumferential spread, outside the epineurium, inside the sheath.']]}),
  deep:positive({anat:'deep',NS:[1152,-60],NT:[833,395],phase:[0,.38,.70,.73,0,0],k:[13.4],disp:[-12,-2,12,-3],m:22,
    subtitle:'Ultrasound-guided, steep in-plane approach',mag:{CY:660,R:130,Z:1.6},
    la:[1010,370,'left',s=>[s.cpn.x+26,s.cpn.y-50]],
    caps:[[0,8.2,'1','Deeper level: tibial and common peroneal nerves side by side in one sheath, under thick subcutaneous fat.'],
      [8.2,13.3,'2','Steep in-plane from lateral. Through the fascia; the sheath tents between the nerves, then gives.'],
      [13.3,19,'3','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA tracks inside the sheath and parts the nerves.'],
      [19,99,'4','15 mL in: circumferential spread, outside the epineurium, inside the sheath.']]}),
  supIP:positive({anat:'sup',NS:[1700,608],NT:[818,290],phase:[0,.35,.748,.775,.96,1],k:[13.1],disp:[-10,-2,10,-2],m:24,
    subtitle:'Ultrasound-guided, in-plane from deep',mag:{CY:650,R:140,Z:1.55},
    la:[1010,196,'left',s=>[s.cpn.x+22,s.cpn.y-56]],
    caps:[[0,8.2,'1','Superficial level: tibial and common peroneal nerves side by side in one paraneural sheath.'],
      [8.2,13,'2','In-plane from deep, through biceps femoris. The sheath tents from below, then gives between the nerves.'],
      [13,19,'3','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA tracks inside the sheath and parts the nerves.'],
      [19,99,'4','15 mL in: circumferential spread, outside the epineurium, inside the sheath.']]}),
  supOOP:positive({anat:'sup',NS:[818,-60],NT:[818,262],phase:[0,.45,.72,.76,.975,1],k:[13.1],disp:[-10,-2,10,-2],m:24,tipDot:true,
    subtitle:'Ultrasound-guided, out-of-plane approach',mag:{CY:650,R:140,Z:1.55},
    la:[1000,372,'left',s=>[s.cpn.x-10,s.cpn.y+58]],
    caps:[[0,8.2,'1','Superficial level: tibial and common peroneal nerves side by side in one paraneural sheath.'],
      [8.2,13,'2','Out-of-plane: the tip shows as a bright dot. Walk it down; the sheath tents, then gives between the nerves.'],
      [13,19,'3','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA tracks inside the sheath and parts the nerves.'],
      [19,99,'4','15 mL in: circumferential spread, outside the epineurium, inside the sheath.']]}),
};

// negative in-plane: dent at 3 o'clock, then shallow redirect that indents, skids, deposits outside
(function(){
  const A=ANAT.sup;
  const S1=[1500,-30],C1=[938,251],S2=[1580,87],T2=[817,190],TSk=[742,187],P2=[813,199];
  const L1=Math.hypot(C1[0]-S1[0],C1[1]-S1[1]),D1=[(C1[0]-S1[0])/L1,(C1[1]-S1[1])/L1],PUSH=22/L1;
  SC.supErr={anat:'sup',Tend:37.2,vol:5,volT:26.2,magT:31,laT:28,sheathFadeT:26.6,neg:true,
    subtitle:'Negative example: two needle errors to avoid',
    mag:{CY:650,R:140,Z:1.9,focus:s=>[s.tib.x-30,s.tib.y-36],text:['Sheath intact:','LA sits on the outside']},
    la:[600,214,'right',s=>[s.tib.x-62,s.tib.y-58]],
    guides:[[along(S1,C1,.5),C1,7,11],[along(S2,T2,.5),T2,16.7,19.6]],
    caps:[[0,7.8,'1','Superficial level: tibial and common peroneal nerves side by side in one paraneural sheath.'],
      [7.8,15,'2','Error 1: approach at 3 o\u2019clock. The tip dents the sheath onto the common peroneal nerve. Stop.'],
      [15,26.6,'3','Error 2: redirect to 12 o\u2019clock, between the nerves. Too shallow: pushing harder only indents the sheath, then the tip skids.'],
      [26.6,31,'4','LA pools outside the sheath and the nerves stay together. Error recognised: stop at 5 mL.'],
      [31,99,'5','Expect a slow, patchy block. Fix: steepen, confirm spread inside the sheath, then inject.']],
    state(t){
      let S=S1,tip=[-99,-99],na=seg(t,8,8.5),shake=0,dent=0,skim=0,dp=T2;
      if(t>=8){
        let u;
        if(t<8.6)u=lerp(.1,.45,easeOut(seg(t,8,8.6)));
        else if(t<10.2)u=lerp(.45,.84,ease(seg(t,8.6,10.2)));
        else if(t<10.65){const p=pop(t,10.2,.84,.87,3);u=p.u;shake=p.sh}
        else if(t<11.6)u=lerp(.87,1,ease(seg(t,10.65,11.6)));
        else if(t<12.8)u=lerp(1,1+PUSH,ease(seg(t,11.6,12.8)));
        else if(t<15)u=1+PUSH+(reduceMotion?0:Math.sin(t*3)*.0015);
        else if(t<16.6)u=lerp(1+PUSH,.45,ease(seg(t,15,16.6)));
        if(t<16.6){tip=along(S1,C1,u);dent=clamp((u-1)/PUSH);if(shake&&!reduceMotion){tip[0]+=D1[0]*shake;tip[1]+=D1[1]*shake}}
        else if(t<17.6){const q=ease(seg(t,16.6,17.6));S=[lerp(S1[0],S2[0],q),lerp(S1[1],S2[1],q)];const a=along(S1,C1,.45),b=along(S2,T2,.45);tip=[lerp(a[0],b[0],q),lerp(a[1],b[1],q)]}
        else{S=S2;
          if(t<19.6)tip=along(S2,T2,lerp(.45,1,ease(seg(t,17.6,19.6))));
          else if(t<25.8){
            let q,tr=0;
            if(t<21)q=.75*ease(seg(t,19.6,21));
            else if(t<21.6)q=lerp(.75,.3,ease(seg(t,21,21.6)));
            else if(t<23.2){q=lerp(.3,1.2,ease(seg(t,21.6,23.2)));tr=seg(t,22.4,23.2)}
            else{q=1.2;tr=1}
            if(t<23.6){tip=[lerp(T2[0],P2[0],q),lerp(T2[1],P2[1],q)];if(!reduceMotion){tip[0]+=Math.sin(t*37)*1.3*tr;tip[1]+=Math.sin(t*29)*.9*tr}skim=q;dp=T2}
            else{const uu=seg(t,23.6,25.8),e=ease(uu),P=[lerp(T2[0],P2[0],1.2),lerp(T2[1],P2[1],1.2)];
              tip=[lerp(P[0],TSk[0],e),lerp(P[1],TSk[1],e)];
              if(!reduceMotion){tip[0]+=Math.max(0,Math.sin(uu*Math.PI*9))*2.2;tip[1]+=Math.sin(uu*55)*(1-uu)*1.8}
              skim=1.2-.95*e;dp=[lerp(T2[0],TSk[0],e),lerp(T2[1],TSk[1]+2,e)]}
          }
          else{tip=TSk.slice();skim=.25*(1-seg(t,25.8,26.4));dp=[TSk[0],TSk[1]+2]}
        }
      }
      const v=5*ease(seg(t,26.6,29.8)),k=v/5;
      const tib=Object.assign({},A.tib,{x:A.tib.x+3*k,y:A.tib.y+4*k});
      const cpn=Object.assign({},A.cpn,{x:A.cpn.x-9*dent,rx:A.cpn.rx-9*dent,ry:A.cpn.ry+3*dent});
      const base=sheathShape(A,tib,A.cpn,11);
      let pts=resample(base.pts,4);
      if(dent>0)pts=pts.map(p=>{const d=Math.hypot(p[0]-C1[0],p[1]-C1[1]),w=Math.exp(-((d/24)**2));return[p[0]+D1[0]*24*dent*w,p[1]+D1[1]*24*dent*w]});
      if(skim>0)pts=pts.map(p=>{const d=Math.hypot(p[0]-dp[0],p[1]-dp[1]),w=Math.exp(-((d/24)**2));return[p[0]-3*skim*w,p[1]+11*skim*w]});
      return{S,tip,na,k,v,tib,cpn,sh:{pts,cx:base.cx,cy:base.cy},inj:TSk,mode:'out'};
    },
    warnings(c,t,s){
      const a1=seg(t,12.6,13.1)*(1-seg(t,14.9,15.3));
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Stop: sheath dented onto the nerve',1000,392,[s.tip[0]+14,s.tip[1]+20],a1)}
      const a2=seg(t,22.6,23.1)*(1-seg(t,26.4,26.8));
      if(a2>0){ring(c,s.tip,a2,t,6);warnPill(c,'Sheath won\u2019t give: tip skids off',1000,392,[s.tip[0]+14,s.tip[1]+14],a2)}
      const a3=seg(t,28.4,29.1);
      if(a3>0)warnPill(c,'LA outside the sheath',372,262,[s.tib.x-84,s.tib.y-26],a3);
    }};
})();

/* ---------- drawing ---------- */
function drawNerve(c,n,F,base,fillA,lineP){
  c.save();c.globalAlpha=fillA;
  c.beginPath();c.ellipse(n.x,n.y,n.rx,n.ry,0,0,Math.PI*2);
  const gr=c.createRadialGradient(n.x-n.rx*.3,n.y-n.ry*.3,4,n.x,n.y,n.rx);gr.addColorStop(0,'#f6e3d2');gr.addColorStop(1,'#e8c4a6');
  c.fillStyle=gr;c.fill();c.clip();
  c.beginPath();c.ellipse(n.x,n.y,n.rx-6,n.ry-6,0,0,Math.PI*2);c.strokeStyle='rgba(168,95,55,.7)';c.lineWidth=1.2;c.stroke();
  const sx=n.rx/base;
  F.forEach(f=>{c.beginPath();
    for(let i=0;i<=9;i++){const a=i/9*Math.PI*2,rr=f.s*f.wob[i%9],px=n.x+f.x*sx+Math.cos(a)*rr,py=n.y+f.y+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py)}
    c.closePath();c.fillStyle=C.fascicle;c.fill();if(f.ring){c.strokeStyle='rgba(250,226,206,.75)';c.lineWidth=.9;c.stroke()}});
  c.restore();
  c.strokeStyle=C.ink;c.lineWidth=2.1;strokePartial(c,mkPath(ellipsePts(n.x,n.y,n.rx,n.ry,60)),lineP);
}
function drawPool(c,s){
  const P=s.sh.pts,n=P.length,cum=[0];
  for(let i=1;i<n;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
  const Lt=cum[n-1];let i0=0,bd=1e9;P.forEach((p,i)=>{const d=Math.hypot(p[0]-s.inj[0],p[1]-s.inj[1]);if(d<bd){bd=d;i0=i}});
  const f=Math.sqrt(s.k),reach=18+150*f,th0=3+19*f,circ=[];
  P.forEach((p,i)=>{let ds=cum[i]-cum[i0];if(ds>Lt/2)ds-=Lt;if(ds<-Lt/2)ds+=Lt;
    const w=p[0]<s.inj[0]?1:.55,d=Math.abs(ds)/(reach*w);if(d>=1)return;
    circ.push([p[0],p[1],th0*Math.pow(1-d*d,.7)+1.2])});
  if(!circ.length)return;
  c.save();c.beginPath();c.rect(-W,-H,3*W,3*H);c.moveTo(P[0][0],P[0][1]);for(let i=1;i<n;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();c.clip('evenodd');
  c.fillStyle='#4e1f0e';c.beginPath();circ.forEach(([x,y,r])=>{c.moveTo(x+r+1.4,y);c.arc(x,y,r+1.4,0,Math.PI*2)});c.fill();
  c.fillStyle='#8a3b1b';c.beginPath();circ.forEach(([x,y,r])=>{c.moveTo(x+r,y);c.arc(x,y,r,0,Math.PI*2)});c.fill();
  c.restore();
}
function drawSheathLA(c,s,fillA,lineP){
  const sh=s.sh;
  c.save();c.globalAlpha=fillA;polyPath(c,sh.pts);c.fillStyle='rgba(240,206,180,.6)';c.fill();
  if(s.k>0&&s.mode==='in'){
    c.clip();
    let far=0;sh.pts.forEach(p=>{far=Math.max(far,Math.hypot(p[0]-s.inj[0],p[1]-s.inj[1]))});
    const f=clamp(s.v/11),R=6+far*1.08*Math.pow(f,.65);
    c.beginPath();
    for(let i=0;i<=72;i++){const a=i/72*Math.PI*2,r=R*(1+.07*Math.sin(3*a+1.3)+.04*Math.sin(7*a+.4));const x=s.inj[0]+Math.cos(a)*r,y=s.inj[1]+Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y)}
    c.closePath();
    const g=c.createRadialGradient(s.inj[0],s.inj[1],0,s.inj[0],s.inj[1],Math.max(R,1));
    g.addColorStop(0,`rgba(${C.la},.88)`);g.addColorStop(.8,`rgba(${C.la},.78)`);g.addColorStop(1,`rgba(${C.la},.55)`);
    c.fillStyle=g;c.fill();
  }
  c.restore();
  if(s.k>0&&s.mode==='out')drawPool(c,s);
  c.save();c.strokeStyle='rgba(43,30,24,.9)';c.lineWidth=1.8;strokePartial(c,mkPath(sh.pts),lineP);c.restore();
}
function drawGuides(c,A,dT){
  const fade=dT<4?1:lerp(1,.32,seg(dT,4,6.5));
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  A.guides.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=16;i++){if(i/16>tp)break;const y=150+i*40,big=i%5===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke()}}
  const cp=seg(dT,1.4,2.6);
  if(cp>0){c.globalAlpha=cp;[[A.tib.x,A.tib.y],[A.cpn.x,A.cpn.y],[A.vein.x,A.vein.y],[A.art.x,A.art.y]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
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
  G.OUT.forEach((o,i)=>{if(i===0)return;c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,o.p,ease(seg(dT,o.t[0],o.t[1])));
    if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}});
  c.restore();
  drawVessels(c,A,texA,ease(seg(dT,3.0,4.4)),s.clock);
  drawSheathLA(c,s,texA,ease(seg(dT,3.4,4.8)));
  drawNerve(c,s.tib,A.fas.tib,A.tib.rx,texA,ease(seg(dT,3.2,4.4)));
  drawNerve(c,s.cpn,A.fas.cpn,A.cpn.rx,texA,ease(seg(dT,3.3,4.5)));
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,G.OUT[0].p,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke()}
  c.restore();
  if(!sub)cur.guides.forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
  if(cur.tipDot&&s.na>0&&s.tip[1]>150){const pl=reduceMotion?1:.75+.25*Math.sin(s.clock*9);const g=c.createRadialGradient(s.tip[0],s.tip[1],0,s.tip[0],s.tip[1],16);
    g.addColorStop(0,`rgba(255,252,240,${.95*pl})`);g.addColorStop(.35,`rgba(255,236,200,${.55*pl})`);g.addColorStop(1,'rgba(255,236,200,0)');
    c.save();c.globalAlpha=s.na*(1-seg(t,13,14.5)*.6);c.fillStyle=g;c.beginPath();c.arc(s.tip[0],s.tip[1],16,0,Math.PI*2);c.fill();c.restore()}
}

/* ---------- labels, warnings, overlay ---------- */
function drawLabels(c,s){
  const A=ANAT[cur.anat],a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  A.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a));
  A.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](s),a));
  const sa=a*(cur.sheathFadeT?1-seg(s.t,cur.sheathFadeT,cur.sheathFadeT+.7):1);
  if(sa>0){const sp=A.sheathPill;pill(c,'Paraneural sheath',sp[0],sp[1],'right',sp[2](s),sa)}
  const la=ease(seg(s.t,cur.laT,cur.laT+1))*a;
  if(la>0){const L=cur.la;pill(c,'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)}
}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('Popliteal sciatic block',60,74);
  c.fillStyle=cur.neg?RED:'#7a6456';c.font='400 18px Inter, system-ui, sans-serif';c.fillText(cur.subtitle,62,104);
  c.restore();
  const va=seg(t,cur.volT,cur.volT+.6);
  if(va>0){c.save();c.globalAlpha=va;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText('Ropivacaine 0.4%',62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const vt=(s.v||0).toFixed(1)+' / '+cur.vol+' mL';c.fillText(vt,212,142);
    if(s.paused){const w=c.measureText(vt).width;c.fillStyle='#7a6456';c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText('aspirate',212+w+12,141)}
    c.restore()}
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
  const M=cur.mag,CX=300,CY=M.CY,R=M.R,Z=M.Z,F=M.focus?M.focus(s):[s.tib.x+4,s.tib.y-2],FR=R/Z;
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


/* ---------- render (the page's render(), reading the player state from P) ---------- */
function render(P){
  const t=TS0+P.playT;
  const s=cur.state(t);s.dT=P.dT;s.t=t;s.clock=P.clock;
  core(ctx,s,false);
  if(showLabels)drawLabels(ctx,s);
  if(cur.warnings)cur.warnings(ctx,t,s);
  drawMagnifier(ctx,s);
  drawOverlay(ctx,s);
}
return {
  SC,
  TABS: {stacked:['stacked'], deep:['deep'], sup:['supErr','supIP','supOOP']},
  curScen: {stacked:'stacked', deep:'deep', sup:'supIP'},
  defaultTab: 'stacked',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels},
  render,
  onTab(tab,scen){tissue(ANAT[tab].geo)},
  aria(P){return 'Animated ultrasound-guided popliteal sciatic block'},
  release(){for(const k in tissueCache){tissueCache[k].width=0;delete tissueCache[k]}}
};
});
