/* PENG block: block module for ra.html (ported from peng.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player. drawNeedle is the page's own (override). */
RA.register('peng', {
  title: 'PENG block',
  tabsLabel: 'Approach',
  tabs: [['linear', 'Linear: slim patient', 'In-plane, lateral to medial'],
         ['curvi', 'Curvilinear: large patient', 'Sector view, steep in-plane'],
         ['error', 'Negative examples', 'Two needle errors']],
  pills: null,
  probe: true,
  notes: `<p class="note"><strong>Dose:</strong> ropivacaine 0.2%, 20 mL to PENG. With an LFCN block add 5 mL 0.2% (total 25 mL, 50 mg).</p>
<p class="note"><strong>Motor sparing, not incision cover.</strong> PENG targets the articular branches of the femoral, obturator and accessory obturator nerves, so the quadriceps is usually spared. It does not cover the skin incision. My practice for bipolar hip hemiarthroplasty and total hip replacement is PENG plus an <a href="#lfcn">LFCN block</a>, which covers anterior and anterolateral incisions; a posterior incision is only partly covered, so supplement with local infiltration.</p>
<p class="note"><strong>Safety:</strong> the needle enters near the ASIS and AIIS, where the LFCN runs. Keep the tip on bone lateral to the iliopubic eminence; do not pass medially towards the femoral artery and pectineus.</p>`,
  tips: `
<p class="lede">Practical points from the sources listed below, grouped by step.</p>
<h3>Indication</h3>
<ul>
  <li>The PENG exists because the hip's articular branches leave the femoral and accessory obturator nerves high, over the pubic ramus. A classic fascia iliaca block was no better than sham after hip arthroplasty in a placebo-controlled trial. <span class="src">Girón-Arango 2018 [6]; Shariat 2013 [7]</span></li>
  <li>For hip fracture, a 20 mL PENG gave dynamic pain relief and ease of positioning for spinal anaesthesia comparable to a 30 mL supra-inguinal fascia iliaca block, with no difference in Bromage scores. <span class="src">Koh 2025 [8]</span></li>
</ul>
<h3>Scanning</h3>
<ul>
  <li>While pivoting the probe from the AIIS towards the pubic ramus, keep the AIIS at the same depth on screen. If the bone loses echogenicity or the tendon barely lifts on injection, the probe has drifted cephalad off the target. <span class="src">Kolli 2023 [1]</span></li>
  <li>Keep the femoral artery at the medial edge of the image as your landmark: the femoral nerve lies just lateral to it and must stay well clear of the needle path. <span class="src">Kolli 2023 [1]</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Do not top up beyond the planned volume when the tendon lift looks small. Volumes above 20 mL and intramuscular injection both raise the chance of anterior thigh weakness; in cadavers, 13.2 mL of dye was the volume that spared the femoral nerve in 90%. <span class="src">Kolli 2023 [1]; Leurcharusmee 2023 [2]</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>If the tip is on bone but injection meets high resistance, it may be embedded in the iliofemoral ligament. Rotate the bevel 180 degrees or withdraw slightly rather than pushing harder. <span class="src">Kolli 2023 [1]</span></li>
  <li>In a large patient whose abdomen tips the probe cephalad, a large pillow under the buttock helps alongside lifting the abdominal fold, keeping the probe on the AIIS to eminence plane. <span class="src">Kolli 2023 [1]</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>The skin entry point sits close to the lateral femoral cutaneous nerve. If skin infiltration or needle entry produces pain shooting down the lateral thigh, treat it as a paraesthesia and move the entry point. <span class="src">Kolli 2023 [1]</span></li>
  <li>Motor sparing is a likelihood, not a guarantee. Imaging in patients and cadaver dissection both show PENG injectate staying mostly within iliacus and psoas rather than reaching the obturator foramen, so test quadriceps strength before the patient mobilises. <span class="src">Balocco 2024 [3]; Gautier 2026 [4]</span></li>
  <li>Treat any quadriceps weakness after a misplaced PENG as a falls risk. In volunteers, a femoral nerve block reduced both quadriceps strength and balance scores, whereas a motor-sparing block left them near baseline. <span class="src">Kwofie 2013 [5]</span></li>
</ul>`,
  sources: `<ol>
  <li>Kolli S, Nimma SR, Kukreja P, Peng P. How I do it: pericapsular nerve group (PENG) block. <i>ASRA Pain Medicine News</i>, August 2023. <a href="https://www.asra.com/news-publications/asra-newsletter/newsletter-item/asra-news/2023/08/01/how-i-do-it-pericapsular-nerve-group-(peng)-block" rel="noopener">asra.com</a></li>
  <li>Leurcharusmee P, Kantakam P, Intasuwan P, et al. Cadaveric study investigating the femoral nerve-sparing volume for PENG block. <i>Reg Anesth Pain Med</i> 2023;48(11):549–552.</li>
  <li>Balocco et al. <i>Reg Anesth Pain Med</i> 2024 (3D CT, 20 mL in 10 patients). NYSORA Education News summary: <a href="https://nysora.com/education-news/new-insights-into-peng-block/" rel="noopener">nysora.com</a></li>
  <li>Gautier et al. <i>Reg Anesth Pain Med</i> 2026 (15 cadaveric hips). NYSORA Education News summary: <a href="https://nysora.com/education-news/new-anatomical-study-challenges-the-traditional-mechanism-of-the-peng-block/" rel="noopener">nysora.com</a></li>
  <li>Kwofie MK, Shastri UD, Gadsden JC, Sinha SK, Abrams JH, Xu D, Salviz EA. The effects of ultrasound-guided adductor canal block versus femoral nerve block on quadriceps strength and fall risk. <i>Reg Anesth Pain Med</i> 2013;38(4):321–325.</li>
  <li>Girón-Arango L, Peng PWH, Chin KJ, Brull R, Perlas A. Pericapsular nerve group (PENG) block for hip fracture. <i>Reg Anesth Pain Med</i> 2018;43(8):859–863.</li>
  <li>Shariat AN, Hadzic A, Xu D, et al. Fascia iliaca block for analgesia after hip arthroplasty. <i>Reg Anesth Pain Med</i> 2013;38(3):201–205.</li>
  <li>Koh et al. <i>Reg Anesth Pain Med</i> 2025 (RCT, n=79). NYSORA Education News summary: <a href="https://nysora.com/education-news/peng-block-or-sificb-rct-compares-dynamic-pain-relief-in-hip-fracture-patients/" rel="noopener">nysora.com</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,shrink,bbox,resample,pop,yAt,bump,C,RED,layer,paperC,lobules,fibres,makeFascicles,planeLA,laAnchor,drawVessels,drawNerve,guideLine,pill,muscleLabel,warnPill,cuePill,ring}=E;
let cur,started,showLabels,probeView;   // mirrors of the player state, refreshed by sync() before every render

/* ---------- tissue geometry ----------
   PENG view: oblique transverse scan along the superior pubic ramus, right hip. Probe on the AIIS, medial end rotated
   caudad ~45 degrees. Screen left = MEDIAL, screen right = LATERAL; the in-plane needle comes from the right.
   Two geometries. 'lin': linear probe, slim patient, isotropic 130 px per cm, skin y 147, 5 cm deep.
   'cur': curvilinear probe, large patient, isotropic 82 px per cm, 8 cm deep, sector image from a virtual apex.
   Bone (ilium, AIIS, iliopubic eminence) is drawn live as a bright line with an acoustic shadow beneath, so the
   Find scan can morph it (ASIS -> AIIS -> PENG view) and nothing is drawn beneath bone. The psoas tendon and the
   rectus femoris cap are drawn live too (the tendon lifts off bone as LA spreads beneath it). */
const PROBE_L=[[602,-12],[604,26],[582,56],[540,70],[521,92],[520,128],[533,145],[770,147],[1007,145],[1020,128],[1019,92],[1000,70],[958,56],[936,26],[938,-12]];
// curvilinear: convex face, an arc of radius RF about the virtual apex; the image is the annular sector RF..RO, half-angle HA
const APEX=[766,-343],RF=490,RO=1143,HA=29*Math.PI/180;
function arcPts(r,a0,a1,n){const o=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push([APEX[0]+r*Math.sin(a),APEX[1]+r*Math.cos(a)])}return o}
const PROBE_C=[[612,-12],[614,22],[592,40],[552,52],[534,68]].concat(arcPts(RF,-HA,HA,40),[[998,68],[980,52],[940,40],[918,22],[920,-12]]);
const SECTOR=arcPts(RF,-HA,HA,40).concat(arcPts(RO,HA,-HA,60));
// rotated ellipse outline
function rotEll(cx,cy,rx,ry,ang,n=40){const o=[],c=Math.cos(ang),s=Math.sin(ang);for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,x=Math.cos(a)*rx,y=Math.sin(a)*ry;o.push([cx+x*c-y*s,cy+x*s+y*c])}return o}
// bone control points (medial to lateral, same x in every pose so the Find scan can morph between them)
const BX=[30,200,380,500,560,590,630,680,720,780,850,920,965,985,1010,1060,1200,1400,1600];
const BONE={
  // A: transverse on the ASIS: a convex iliac curve about 1 cm under the skin
  asis:[600,520,440,392,368,354,340,324,312,300,290,284,282,283,285,293,330,410,500],
  // B: on the AIIS, transverse: the AIIS step laterally, the ilium sloping away medially, no eminence yet
  aiis:[700,684,660,640,628,620,612,604,596,582,555,515,475,452,454,470,500,530,552],
  // C: PENG view: iliopubic eminence (590), groove under the psoas tendon (720), AIIS peak (985, 2.3 cm)
  peng:[668,652,634,600,576,562,584,607,620,603,562,505,465,452,454,470,500,530,552]};
const boneCtl=Y=>BX.map((x,i)=>[x,Y[i]]);
function mixBone(m1,m2){return spline(BX.map((x,i)=>[x,lerp(lerp(BONE.asis[i],BONE.aiis[i],m1),BONE.peng[i],m2)]),false,10)}
function makeGeo(v){
  const G={v};
  if(v==='lin'){
    G.probe=PROBE_L;
    G.skinTop=spline([[20,180],[300,160],[517,147],[770,146],[1016,147],[1300,160],[1580,180]],false);
    G.skinDeep=spline([[30,190],[300,172],[560,163],[770,161],[1000,163],[1300,172],[1570,190]],false);
    G.fasciaLata=spline([[40,272],[400,264],[770,260],[1100,262],[1580,270]],false);
    // fascia iliaca, medial to lateral: deep to the vessels (iliopectineal fascia), ~0.5 mm over the femoral nerve,
    // over iliacus, then laterally over the deep muscle beside the AIIS. x-sorted so yAt() works.
    G.fasciaIliaca=spline([[40,478],[200,468],[330,458],[440,446],[520,430],[580,410],[640,392],[700,384],[800,382],[900,384],[990,394],[1080,412],[1250,440],[1580,460]],false);
    G.bone=spline(boneCtl(BONE.peng),false,10);
    G.sartorius=spline([[1010,300],[1100,272],[1300,266],[1450,280],[1460,320],[1350,365],[1150,372],[1040,345]],true);
    G.septum=[[770,392],[790,470],[815,560]];
    G.rf={a:986,b:1072,h:9};   // rectus femoris direct head: short cap on the AIIS
    G.lob=[[14,24,9,15],[9,17,6,11]];G.nFib=5200;
  } else {
    G.probe=PROBE_C;
    G.skinTop=spline([[20,196],[250,178],[420,140],[500,100]],false).concat(arcPts(RF,-HA,HA,40),spline([[1032,100],[1112,140],[1282,178],[1580,196]],false));
    G.skinDeep=G.skinTop.map(p=>[p[0],p[1]+12]);
    G.fasciaLata=spline([[40,470],[300,450],[520,438],[766,434],[1000,437],[1250,448],[1580,470]],false);
    G.fasciaIliaca=spline([[100,634],[350,615],[520,592],[590,578],[650,560],[700,549],[760,545],[840,549],[900,560],[960,578],[1100,605],[1350,625],[1560,640]],false);
    G.bone=spline([[100,764],[300,748],[450,735],[560,718],[620,700],[653,690],[685,700],[720,712],[760,706],[800,690],[840,665],[875,635],[901,614],[925,616],[970,628],[1100,650],[1250,666],[1450,680],[1580,688]],false,10);
    G.sartorius=spline([[960,470],[1020,446],[1150,440],[1250,452],[1262,480],[1180,505],[1050,508],[980,492]],true);
    G.septum=[[728,550],[742,620],[756,700]];
    G.rf={a:903,b:958,h:6};
    G.lob=[[20,34,12,20],[12,22,8,14]];G.nFib=3800;
  }
  G.fiR=resample(G.fasciaIliaca,4);G.boneR=resample(G.bone,4);
  // deep muscle: everything between fascia iliaca and the bottom (iliopsoas medially and over the AIIS slope);
  // the live bone shadow defines its floor, so the Find scan can move the bone under a static texture
  G.deep=G.fasciaIliaca.map(p=>[p[0],p[1]+3]).concat([[1600,yAt(G.fasciaIliaca,1600)+3],[1600,900],[0,900],[0,yAt(G.fasciaIliaca,0)+3]]);
  // pectineus: medial, deep to the femoral vein, roof = iliopectineal fascia, floor = superior pubic ramus
  const xe=v==='lin'?[575,582,590]:[630,642,653],top=[],bot=[];
  for(let x=-20;x<=xe[0]-15;x+=25)top.push([x,yAt(G.fasciaIliaca,x)+4]);
  for(let x=xe[0];x>=-20;x-=25)bot.push([x,yAt(G.boneR,x)-3]);
  G.pectineus=spline(top.concat([[xe[0],yAt(G.fasciaIliaca,xe[0])+30],[xe[1],yAt(G.boneR,xe[1])-40]],bot),true,8);
  G.band=G.skinDeep.concat(G.fasciaLata.slice().reverse());
  G.fatPad=G.fasciaLata.concat(G.fasciaIliaca.slice().reverse());
  G.OUT=[
    {n:'skin',p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},
    {n:'skin2',p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55},
    {n:'sart',p:mkPath(G.sartorius),t:[1.9,3.9],w:2.1,dbl:mkPath(shrink(G.sartorius,.95))},
    {n:'pect',p:mkPath(G.pectineus),t:[2.0,4.0],w:2.1,dbl:mkPath(shrink(G.pectineus,.97))},
    {n:'sept',p:mkPath(spline(G.septum,false)),t:[2.4,4.0],w:1,a:.28},
  ];
  return G;
}
const GEO={lin:makeGeo('lin'),cur:makeGeo('cur')};
function muscleFill(tg,P,a,n,la,lb,r){
  tg.save();polyPath(tg,P);const bb=bbox(P);const gr=tg.createLinearGradient(bb[0],bb[1],bb[2],Math.min(bb[3],760));gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
  tg.fillStyle=gr;tg.fill();tg.clip();tg.lineWidth=26;tg.strokeStyle='rgba(176,96,56,.16)';polyPath(tg,P);tg.stroke();fibres(tg,P,a,n,r,1,la,lb);tg.restore()}
const tissueCache={},pectCache={};
function tissue(v){
  if(tissueCache[v])return tissueCache[v];
  const G=GEO[v];const [cv,tg]=layer();const r=rng(7),cur=v==='cur';
  tg.save();polyPath(tg,G.fatPad);tg.fillStyle=C.fat;tg.fill();tg.clip();lobules(tg,G.fatPad,r,...G.lob[1],'rgba(150,88,58,.28)');tg.restore();
  tg.save();polyPath(tg,G.band);tg.fillStyle=cur?'#efd8c3':C.sub;tg.fill();tg.clip();lobules(tg,G.band,r,...G.lob[0],cur?'rgba(140,80,52,.36)':'rgba(150,88,58,.30)');tg.restore();
  // deep muscle cut across its fibres (short stipple); sartorius obliquely
  muscleFill(tg,G.deep,.1,G.nFib,cur?6:8,cur?16:22,r);
  muscleFill(tg,G.sartorius,2.0,cur?320:520,cur?20:30,cur?60:90,r);
  // large patient: attenuation with depth (a soft darkening and grain)
  if(cur){const ag=tg.createLinearGradient(0,150,0,800);ag.addColorStop(0,'rgba(120,70,44,0)');ag.addColorStop(1,'rgba(120,70,44,.10)');tg.fillStyle=ag;tg.fillRect(0,150,W,650);
    for(let i=0;i<4200;i++){const y=160+r()*640;tg.fillStyle=`rgba(80,46,30,${(.03+r()*.06)*(y/800)})`;tg.fillRect(r()*W,y,r()*1.8+.4,r()*1.8+.4)}}
  return tissueCache[v]=cv;
}
// pectineus on its own layer (it fades in during the Find scan)
function pectLayer(v){
  if(pectCache[v])return pectCache[v];
  const G=GEO[v];const [cv,tg]=layer();muscleFill(tg,G.pectineus,.5,v==='cur'?700:1300,v==='cur'?7:10,v==='cur'?20:30,rng(9));return pectCache[v]=cv;
}
// guide set: fascia lata horizontal, dashed ellipses, dashed fascia iliaca and bone reveals
const guideSet=(A,G,fl)=>{const n=A.nerve,v=A.vein,a=A.art;return[
  {p:mkPath([[40,fl],[1560,fl]]),t:[0.3,1.7]},
  {p:mkPath(ellipsePts(n.x,n.y,n.rx+22,n.ry+20)),t:[0.6,2.4],dash:[6,6]},
  {p:mkPath(ellipsePts(v.x,v.y,v.rx+18,v.ry+18)),t:[1.1,2.8],dash:[6,6]},
  {p:mkPath(ellipsePts(a.x,a.y,a.r+14,a.r+14)),t:[1.2,2.9],dash:[6,6]},
  {p:mkPath(G.fasciaIliaca.map(p=>[p[0],p[1]-10])),t:[0.8,2.6],dash:[8,8]},
  {p:mkPath(G.bone.map(p=>[p[0],p[1]-14])),t:[1.0,2.8],dash:[8,8]}]};
const emFade=s=>cur.emFade?1-seg(s.t,cur.magT-.3,cur.magT+.3):1;
const VIS1={tendon:1,vessels:1,nerve:1,pect:1,rf:1,asis:0,ip:1};
const ANAT={
  lin:{geo:'lin',ppc:130,depthCm:5,
    nerve:{x:665,y:410,rx:44,ry:16},vein:{x:400,y:398,rx:58,ry:38},art:{x:540,y:378,r:42},
    tendon:{x:690,y:583,rx:42,ry:12},
    fas:{nerve:makeFascicles(24,44,16,11,1.8,2.3,[8,6])},
    muscles:[['Iliopsoas',758,434,s=>s.vis.ip],['Sartorius',1300,330],['Pectineus',150,540,s=>s.vis.pect]],
    pills:[['Femoral artery',470,226,'right',()=>[520,342],s=>s.vis.vessels],['Femoral vein',300,318,'right',()=>[362,372],s=>s.vis.vessels],
      ['Fascia lata',200,226,'right',()=>[222,268]],
      ['Femoral nerve',760,322,'left',s=>[s.nerve.x+22,s.nerve.y-s.nerve.ry+3],s=>s.vis.nerve],
      ['Fascia iliaca',1420,490,'left',()=>[1400,yAt(GEO.lin.fasciaIliaca,1400)],s=>s.vis.ip],
      ['Psoas tendon',780,700,'left',s=>[s.tendon.x-16,s.tendon.y+s.tendon.ry-3],s=>s.vis.tendon],
      ['Iliopubic eminence',470,486,'right',s=>[589,yAt(s.bone,589)+2],s=>s.vis.tendon*emFade(s)],
      ['AIIS',1040,580,'left',s=>[988,yAt(s.bone,988)+3],s=>1-s.vis.asis],
      ['Rectus femoris tendon',1180,520,'left',s=>[1044,yAt(s.bone,1044)-4],s=>s.vis.rf*(1-s.vis.asis)],
      ['Ilium at the ASIS',1080,214,'left',s=>[960,yAt(s.bone,960)+2],s=>s.vis.asis]],
  },
  cur:{geo:'cur',ppc:82,depthCm:8,
    nerve:{x:698,y:563,rx:30,ry:11},vein:{x:532,y:540,rx:34,ry:24},art:{x:621,y:524,r:26},
    tendon:{x:712,y:688,rx:26,ry:9},
    fas:{nerve:makeFascicles(15,30,11,13,1.4,1.8,[6,4])},
    muscles:[['Iliopsoas',800,610],['Sartorius',1130,482],['Pectineus',330,670]],
    pills:[['Femoral artery',560,470,'right',()=>[606,500]],['Femoral vein',420,500,'right',()=>[506,528]],
      ['Fascia lata',300,412,'right',()=>[330,450]],
      ['Femoral nerve',820,506,'left',s=>[s.nerve.x+14,s.nerve.y-s.nerve.ry+2]],
      ['Fascia iliaca',1150,560,'left',()=>[1080,yAt(GEO.cur.fasciaIliaca,1080)]],
      ['Psoas tendon',760,778,'left',s=>[s.tendon.x+6,s.tendon.y+s.tendon.ry-2]],
      ['Iliopubic eminence',600,606,'right',s=>[652,yAt(s.bone,652)+2],emFade],
      ['AIIS',990,650,'left',s=>[903,yAt(s.bone,903)+3]],
      ['Subcutaneous fat: 3.5 cm',1150,300,'left',()=>[1080,330]]],
  },
};
ANAT.lin.guides=guideSet(ANAT.lin,GEO.lin,262);
// Find the view opens on the ASIS: its construction lines are pose A (fascia lata, fascia iliaca, the ASIS bone curve), no vessel crosshairs
ANAT.linA={noCross:true,guides:[{p:mkPath([[40,262],[1560,262]]),t:[0.3,1.7]},
  {p:mkPath(GEO.lin.fasciaIliaca.map(p=>[p[0],p[1]-10])),t:[0.8,2.6],dash:[8,8]},
  {p:mkPath(spline(boneCtl(BONE.asis),false,10).map(p=>[p[0],p[1]-14])),t:[1.0,2.8],dash:[8,8]}]};ANAT.cur.guides=guideSet(ANAT.cur,GEO.cur,434);
/* ---------- needle and local anaesthetic ---------- */
const DRUG='Ropivacaine 0.2%',DOSE=20,MGML=2;   // guide.html dose-peng-lfcn: 20 mL 0.2% to PENG (+5 mL LFCN, total 50 mg)
// injections as [start, end, mL] (absolute time); 'aspirate' shows in the pauses between them
const ALQ_L=[[13.1,14.5,5],[15.1,16.5,5],[17.1,18.5,5],[19.1,20.5,5]];
const ALQ_C=[[12.7,13.2,1.5],[13.6,15.0,5],[15.6,17.0,5],[17.6,19.0,5],[19.6,20.6,3.5]];   // 1.5 mL hydrolocation counts in the 20 mL
function inject(t,L,sh=0){let v=0;L.forEach(([a,b,m])=>{v+=m*ease(seg(t,a+sh,b+sh))});
  const paused=L.some(([a,b],i)=>i<L.length-1&&t>b+sh&&t<L[i+1][0]+sh);return{v,paused}}
/* needleLine: the in-plane line from the hub NS through aim. B = first bone contact on that line (u=1),
   NT = the injection point, 'back' px withdrawn from B. uc = where the line crosses fascia iliaca. */
function needleLine(G,NS,aim,back,tentPx=24){
  const L0=Math.hypot(aim[0]-NS[0],aim[1]-NS[1]),D=[(aim[0]-NS[0])/L0,(aim[1]-NS[1])/L0];
  let B=aim;for(let d=L0*.5;d<L0*1.4;d+=.5){const q=[NS[0]+D[0]*d,NS[1]+D[1]*d];if(q[1]>=yAt(G.boneR,q[0])-1.5){B=q;break}}
  const L=Math.hypot(B[0]-NS[0],B[1]-NS[1]),uT=1-back/L;
  let uc=.99;for(let u=.2;u<=1;u+=.0005){const q=along(NS,B,u);if(q[1]>=yAt(G.fiR,q[0])){uc=u;break}}
  const ut=Math.min(uc+tentPx/L,.99);
  return{NS,B,L,D,uT,NT:along(NS,B,uT),uc,ut,P:ut+14/L,tentPx,TPOP:10.6+.45*.3}}
const uAtX=(N,x)=>(x-N.NS[0])/(N.B[0]-N.NS[0]);
/* needlePhase: skin 8.3, fascia iliaca tents 10.0 and gives 10.6, advance to bone 11.9 (firm stop, no tent),
   withdraw 'back' px 12.2-12.6 into the tendon-periosteum plane. */
function needlePhase(N,t){
  if(t<9)return{u:lerp(.04,.3,easeOut(seg(t,8.3,9)))};
  if(t<10)return{u:lerp(.3,N.uc,ease(seg(t,9,10)))};
  if(t<10.6){const q=seg(t,10,10.6);return{u:lerp(N.uc,N.ut,1-Math.pow(1-q,1.6)),sh:Math.sin(t*41)*.7*q}}
  if(t<11.05)return pop(t,10.6,N.ut,N.P,3);
  if(t<11.9)return{u:lerp(N.P,1,ease(seg(t,11.05,11.9)))};
  if(t<12.2)return boneStop(t,11.9);
  if(t<12.6)return{u:lerp(1,N.uT,ease(seg(t,12.2,12.6)))};
  return{u:N.uT};
}
// bone contact: a small firm recoil, never past the bone
function boneStop(t,t0){const q=seg(t,t0,t0+.3);return{u:1,sh:-2.4*Math.abs(Math.sin(q*Math.PI*3))*(1-q)}}
function needleAt(N,t,ph){
  const tip=along(N.NS,N.B,ph.u);if(ph.sh&&!reduceMotion){tip[0]+=N.D[0]*ph.sh;tip[1]+=N.D[1]*ph.sh}
  const tent=t<N.TPOP?clamp((ph.u-N.uc)*N.L,0,N.tentPx):N.tentPx*Math.exp(-(t-N.TPOP)*9)*(reduceMotion?1:Math.cos((t-N.TPOP)*26));
  return{tip,tent,na:seg(t,8.3,8.9)}}
// fascia iliaca tented along the needle: a cusped V under the tip
function tentFI(fi,N,tent){if(Math.abs(tent)<=.05)return fi;const Pc=along(N.NS,N.B,N.uc);
  return fi.map(p=>{const w=Math.exp(-Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/40);return[p[0]+N.D[0]*tent*w,p[1]+N.D[1]*tent*w]})}
/* lensLift: PENG spread. A lens on the bone (dip 0), thickest at xc, its medial front reaching the iliopubic eminence
   (xm) and its lateral front climbing the AIIS slope (xl). k = fraction of the 20 mL. */
function lensLift(P,k){if(k<=0)return()=>0;const sk=Math.sqrt(k),wl=(P.xc-P.xm)*(.22+.78*sk),wr=(P.xl-P.xc)*(.18+.82*sk),Tm=P.T*Math.pow(k,.5);
  return x=>Tm*bump((x-P.xc)/(x<P.xc?wl:wr))}
// tendon lifted so its underside clears the lens top
function tendonLift(T,G,lift){let d=0;for(let i=-4;i<=4;i++){const x=T.x+T.rx*.85*i/4,yb=T.y+T.ry*Math.sqrt(1-(i/4*.85)**2);d=Math.max(d,yb-(yAt(G.boneR,x)-lift(x))-1)}return d}
// correct in-plane: through fascia iliaca, through iliopsoas, beneath the psoas tendon to bone, withdraw, inject
function positive(o){
  const A=ANAT[o.anat],G=GEO[A.geo],N=needleLine(G,o.NS,o.aim,o.back);
  return Object.assign({N,vol:DOSE,volT:12.4,
    guides:[[along(N.NS,N.B,.3),N.NT,7.6,12.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){const r=needleAt(N,t,needlePhase(N,t));tip=r.tip;tent=r.tent;na=r.na}
      const I=inject(t,o.alq),k=I.v/DOSE,lift=lensLift(o.lens,k);
      const la=k>0?planeLA(G.boneR,lift,()=>0,o.lens.xm-6,o.lens.xl+6):null;
      const T=Object.assign({},A.tendon);T.y-=tendonLift(T,G,lift);
      const nerve=Object.assign({},A.nerve,{y:A.nerve.y-3*k});
      return{S:N.NS,tip,na,k,v:I.v,paused:I.paused,nerve,tendon:T,fi:tentFI(G.fiR,N,tent),fl:G.fasciaLata,la,bone:G.boneR,faint:o.faint,mode:'in'};
    }},o);
}
const IPL={anat:'lin',NS:[1540,-40],aim:[705,613],back:13,alq:ALQ_L,lens:{xc:705,xm:576,xl:905,T:50}};
const ICU={anat:'cur',NS:[1392,-40],aim:[725,711],back:8,alq:ALQ_C,lens:{xc:722,xm:642,xl:835,T:34},faint:true};
const LA_L=[[900,612,'left',s=>laAnchor(s,640,s.la,880),'LA beneath psoas tendon']];
const SC={
  inplane:positive(Object.assign({},IPL,{pill:'In-plane, lateral to medial',Tend:29,magT:21.5,laT:15.2,
    subtitle:'Ultrasound-guided, lateral in-plane approach',
    mag:{CY:690,R:140,Z:1.6,focus:()=>[700,592],text:['Beneath the psoas tendon:','tendon lifted off bone']},
    la:LA_L,
    cues:[[16,'Tendon lifting off bone: correct plane',1010,650],[25,'Motor sparing: femoral nerve spared',1010,700]],
    caps:[[0,8.2,'1','AIIS lateral, iliopubic eminence medial. Psoas tendon on bone between, deep and lateral to the artery.'],
      [8.2,11.8,'2','In-plane from lateral, passing over the AIIS. Fascia iliaca gives, then the tip crosses iliacus to the tendon.'],
      [11.8,13.1,'3','Slide beneath the psoas tendon until the tip touches bone. Withdraw 1 mm and aspirate.'],
      [13.1,21,'4','Ropivacaine 0.2% in 5 mL aliquots, aspirating between. The tendon lifts off the bone as LA spreads.'],
      [21,25,'5','20 mL in: LA lies between tendon and bone, from AIIS to eminence. Fascia iliaca and femoral nerve untouched.'],
      [25,99,'6','Motor sparing: the quadriceps is usually spared. The incision is not covered, so add an LFCN block.']]})),
  curvi:positive(Object.assign({},ICU,{emFade:true,Tend:29,magT:21.5,laT:15.2,
    subtitle:'Curvilinear probe, steep in-plane approach',
    mag:{CY:690,R:140,Z:1.9,focus:()=>[716,690],text:['Deep target, same plane:','tendon lifted off bone']},
    la:[[880,736,'left',s=>laAnchor(s,660,s.la,820),'LA beneath psoas tendon']],
    cues:[[16,'Tendon lifting off bone: correct plane',1010,800]],
    caps:[[0,8.2,'1','Curvilinear probe: sector image, 8 cm deep. AIIS lateral, eminence medial, psoas tendon on bone between.'],
      [8.2,11.8,'2','Deep target: enter 2 to 3 cm lateral to the probe. The angle is steep and the shaft faint: track the tip.'],
      [11.8,13.6,'3','Fascia iliaca gives, then the tip reaches bone beneath the tendon. 1.5 mL hydrolocation confirms the plane.'],
      [13.6,21,'4','Ropivacaine 0.2% in 5 mL aliquots, aspirating between. The tendon lifts off the bone as LA spreads.'],
      [21,25,'5','20 mL in: LA lies between tendon and bone, from AIIS to eminence. Fascia iliaca and femoral nerve untouched.'],
      [25,99,'6','Large patient: have an assistant or tape lift the abdominal fold off the groin before scanning.']]})),
};
/* fixLedger: misplaced volume + corrected volume = total (mL and mg), bottom right */
function fixLedger(label,off,tFix){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL','Beneath psoas tendon: '+b.toFixed(1)+' mL',DRUG.replace('R','Total r')+': '+tot.toFixed(1)+' mL ('+Math.round(tot*MGML)+' mg)']}}}
const NEGCAP1=[0,8.2,'1','AIIS lateral, iliopubic eminence medial. Psoas tendon on bone between, deep and lateral to the artery.'];
// negative example 1: after the fascia iliaca pop the tip stops inside iliopsoas, short of bone, superficial and lateral
// to the tendon. 2 mL swells inside the muscle. Fix: advance on the same line beneath the tendon to bone, withdraw 1 mm,
// then the correct injection on a shifted clock.
(function(){
  const A=ANAT.lin,G=GEO.lin,POS=positive(Object.assign({},IPL)),N=POS.N;
  const uIM=uAtX(N,874),TIP=along(N.NS,N.B,uIM);
  const OFF=2,TW=19.4,TR=20.0,TBc=21.2,TB=21.9,FXI=22.6,SHIFT=FXI-ALQ_L[0][0];
  const toNerve=Math.atan2(A.nerve.y+8-TIP[1],A.nerve.x+40-TIP[0]);
  // intramuscular LA: a contained swelling along the fibres, with streaks tracking superficially between them
  const imLA=v=>{const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),P=[];
    for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,w=1+.12*Math.sin(a*3+1)+.06*Math.sin(a*5);P.push([TIP[0]-6+Math.cos(a)*50*sk*w,TIP[1]+Math.sin(a)*19*sk*w])}
    const st=[[40,64,2.6,0],[30,46,2.2,10],[-36,40,2.2,-6]].map(([d,len,w,off])=>{const c=Math.cos(toNerve),s=Math.sin(toNerve),dd=d*sk+Math.sign(d)*len*sk/2;
      return rotEll(TIP[0]+c*dd-s*off*sk,TIP[1]+s*dd+c*off*sk,len*sk/2,w*sk+.5,toNerve,24)});
    return{x:TIP[0]-6,y:TIP[1],rx:50*sk,ry:19*sk,polys:[P].concat(st)}};
  const ph=t=>{if(t<11.05)return needlePhase(N,t);if(t<12.0)return{u:lerp(N.P,uIM,ease(seg(t,11.05,12.0)))};if(t<TR)return{u:uIM};
    if(t<TBc)return{u:lerp(uIM,1,ease(seg(t,TR,TBc)))};if(t<TBc+.3)return boneStop(t,TBc);return{u:lerp(1,N.uT,ease(seg(t,TBc+.3,TB)))}};
  SC.intraMusc={anat:'lin',pill:'Into iliopsoas, short of bone',neg:true,Tend:34.5,vol:DOSE,volT:12.4,magT:31,laT:FXI+1.2,
    subtitle:'Negative example: a common needle error',
    mag:{CY:690,R:140,Z:1.4,focus:()=>[770,548],text:['2 mL in iliopsoas,','20 mL beneath the tendon']},
    la:[[900,612,'left',s=>laAnchor(s,640,s.la,880),'LA beneath psoas tendon',FXI+1.2]],
    guides:[[along(N.NS,N.B,.3),TIP,7,11],[TIP,N.NT,TR-.2,TB+1.2]],
    cues:[[FXI+3.2,'Tendon lifting off bone: correct plane',1010,650]],
    caps:[NEGCAP1,
      [8.2,13.6,'2','Error: fascia iliaca gives, then the tip stops in iliopsoas, short of bone and superficial to the tendon.'],
      [13.6,16.4,'3','LA swells inside the muscle and tracks towards the femoral nerve. The psoas tendon does not lift.'],
      [16.4,TR,'4','Error recognised: no bone contact, spread inside muscle. Stop: more here risks failure and weakness.'],
      [TR,23.2,'5','Fix: advance beneath the psoas tendon to bone. Withdraw 1 mm and aspirate.'],
      [23.2,31,'6','Ropivacaine 0.2%, the planned 20 mL, in 5 mL aliquots with aspiration. The tendon lifts off the bone.'],
      [31,99,'7','Total 22 mL, 44 mg: 2 mL wasted in iliopsoas; 20 mL beneath the psoas tendon, on bone.']],
    ledger:fixLedger('Intramuscular',OFF,TR),
    state(t){
      const vIM=OFF*ease(seg(t,13.8,16.0)),im=imLA(vIM);let s;
      if(t<TB){s=POS.state(Math.min(t,12.0));s.v=t<TR?vIM:0;s.k=0;s.paused=false;s.la=null;
        if(t>=8.3){const r=needleAt(N,t,ph(t));s.tip=r.tip}}
      else s=POS.state(Math.max(t-SHIFT,12.6));
      s.im=im;return s;
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0)return;
      const a1=seg(t,12.4,12.9)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'No bone contact',1060,632,[s.tip[0]+22,s.tip[1]+8],a1)}
      const a2=seg(t,13.4,13.9)*f;
      if(a2>0)warnPill(c,'Tip in iliopsoas: intramuscular',1010,682,[s.tip[0]+6,s.tip[1]+22],a2);
      const a3=seg(t,15.5,16.0)*f;
      if(a3>0)warnPill(c,'Tendon not lifting',420,700,[s.tendon.x-20,s.tendon.y+s.tendon.ry],a3);
      const a4=seg(t,16.2,16.7)*f;
      if(a4>0){const n=s.nerve;c.save();c.globalAlpha=a4*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(n.x,n.y,n.rx+11,n.ry+11,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'Tracking to femoral nerve',560,270,[n.x-28,n.y-n.ry-5],a4)}
      const a5=seg(t,17.5,18.0)*f;
      if(a5>0)warnPill(c,'Stop at 2 mL',1010,732,null,a5);
    }};
})();
// negative example 2: the tip stops just beneath fascia iliaca, beside the femoral nerve, ~2 cm above the target.
// 5 mL lifts fascia iliaca and outlines the femoral nerve (a femoral nerve block: loses motor sparing). The pocket stays.
(function(){
  const A=ANAT.lin,G=GEO.lin,POS=positive(Object.assign({},IPL)),N=POS.N,NF=Object.assign({},N);
  NF.ut=N.uc+10/N.L;NF.P=N.uc+12/N.L;NF.tentPx=10;
  const TIP=along(N.NS,N.B,NF.P),OFF=5,TW=20.0,TR=20.6,TBc=21.8,TB=22.5,FXI=23.0,SHIFT=FXI-ALQ_L[0][0];
  const nv=A.nerve;
  // LA beneath fascia iliaca: lifts it around the tip, tracks medially over the nerve and wraps it
  function fiPocket(k){if(k<=0)return null;const sk=Math.sqrt(k),xr=TIP[0]+50,xc=TIP[0]-26;
    const xm=lerp(TIP[0]-24,nv.x-nv.rx-12,ease(clamp(k*1.6))),Tm=26*Math.pow(k,.6),cov=clamp(k*2)*clamp((nv.x+nv.rx-xm)/(nv.rx*2));
    const lift=x=>x<xm||x>xr?0:Math.max(Tm*bump((x-xc)/(x<xc?Math.max(xc-xm,8):xr-xc)),9*cov*bump((x-nv.x)/(nv.rx+16)));
    const dip=x=>{let d=7*Math.sqrt(k)*bump((x-TIP[0])/26);const dx=(x-nv.x)/(nv.rx+6);
      if(Math.abs(dx)<1&&x>=xm-6)d=Math.max(d,(nv.y+nv.ry*Math.sqrt(1-dx*dx)+4-yAt(G.fiR,x))*cov);return d};
    return{lift,dip,x0:Math.floor(Math.min(xm,nv.x-nv.rx-8)),x1:Math.ceil(xr)}}
  const ph=t=>{if(t<10.6)return needlePhase(NF,t);if(t<11.05)return pop(t,10.6,NF.ut,NF.P,2.5);if(t<TR)return{u:NF.P};
    if(t<TBc)return{u:lerp(NF.P,1,ease(seg(t,TR,TBc)))};if(t<TBc+.3)return boneStop(t,TBc);return{u:lerp(1,N.uT,ease(seg(t,TBc+.3,TB)))}};
  SC.fiPlane={anat:'lin',emFade:true,pill:'Beneath fascia iliaca, above the tendon',neg:true,Tend:35,vol:DOSE,volT:12.4,magT:31.5,laT:FXI+1.2,
    subtitle:'Negative example: loses motor sparing',
    mag:{CY:690,R:140,Z:1.15,focus:()=>[690,502],text:['5 mL around the femoral nerve,','20 mL beneath the tendon']},
    la:[[1060,425,'left',s=>laAnchor(s,TIP[0]+16,s.laOff,TIP[0]+48),'LA beneath fascia iliaca',13.6],
      [900,612,'left',s=>laAnchor(s,640,s.la,880),'LA beneath psoas tendon',FXI+1.2]],
    guides:[[along(N.NS,N.B,.3),TIP,7,11],[TIP,N.NT,TR-.2,TB+1.2]],
    cues:[[FXI+3.2,'Tendon lifting off bone: correct plane',1010,650]],
    caps:[NEGCAP1,
      [8.2,12.4,'2','Error: fascia iliaca gives and the tip stops there, beside the femoral nerve, well above the tendon.'],
      [12.4,16.6,'3','LA lifts fascia iliaca and outlines the femoral nerve: a femoral nerve block, not PENG. The tendon stays down.'],
      [16.6,TR,'4','Error recognised: this is likely to weaken the quadriceps and lose motor sparing. Stop at 5 mL.'],
      [TR,23.4,'5','Fix: advance through iliopsoas to bone beneath the psoas tendon. Withdraw 1 mm and aspirate.'],
      [23.4,31.5,'6','Ropivacaine 0.2%, the planned 20 mL, in 5 mL aliquots with aspiration. The tendon lifts off the bone.'],
      [31.5,99,'7','Total 25 mL, 50 mg: 5 mL beneath fascia iliaca; 20 mL beneath the tendon. Expect some quadriceps weakness.']],
    ledger:fixLedger('Beneath fascia iliaca',OFF,TR),
    state(t){
      const vF=OFF*ease(seg(t,12.8,15.8)),sp=fiPocket(vF/OFF);let s;
      if(t<TB){s=POS.state(Math.min(t,8.29));s.v=t<TR?vF:0;s.k=0;s.paused=false;s.la=null;
        if(t>=8.3){const r=needleAt(NF,t,ph(t));s.tip=r.tip;s.na=r.na;s.fi=tentFI(G.fiR,NF,r.tent)}}
      else s=POS.state(Math.max(t-SHIFT,12.6));
      if(sp){s.fi=s.fi.map(p=>[p[0],p[1]-sp.lift(p[0])]);s.laOff=planeLA(G.fiR,sp.lift,sp.dip,sp.x0,sp.x1)}
      s.nerve=Object.assign({},s.nerve,{y:s.nerve.y+2*clamp(vF/OFF)});
      return s;
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0)return;
      const a1=seg(t,12.2,12.7)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Too superficial: above the tendon',1180,566,[s.tip[0]+18,s.tip[1]+16],a1)}
      const a2=seg(t,14,14.5)*f;
      if(a2>0)warnPill(c,'Fascia iliaca lifting',910,222,[930,yAt(s.fi,930)-2],a2);
      const a3=seg(t,15.8,16.3)*f;
      if(a3>0){const n=s.nerve;c.save();c.globalAlpha=a3*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(n.x,n.y,n.rx+13,n.ry+13,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'Nerve outlined: motor block',560,270,[n.x-28,n.y-n.ry-5],a3)}
      const a4=seg(t,17.4,17.9)*f;
      if(a4>0)warnPill(c,'Stop at 5 mL',1010,700,null,a4);
    }};
})();
/* Find the view: scanning scenario, no needle (absolute time). 7-9 transverse on the ASIS, 9-13 slide caudad and
   slightly medial onto the AIIS, 13-17 rotate the medial end caudad 45 degrees along the pubic ramus, 17-21 hold.
   The bone line morphs ASIS -> AIIS -> PENG view; tendon, vessels, nerve and pectineus fade in as they appear. */
function findMix(t){return{m:ease(seg(t,9,13)),r:ease(seg(t,13,17))}}
SC.find={anat:'lin',scan:true,guideA:ANAT.linA,pill:'Find the view',Tend:24,vol:DOSE,volT:1e9,magT:21,laT:1e9,hint:'Press play to scan',
  subtitle:'Scanning: find the PENG view, no needle',
  mag:{CY:690,R:140,Z:1.6,focus:()=>[700,598],text:['Target: beneath psoas tendon,','on bone beside the eminence']},
  la:[],guides:[],
  caps:[[0,9,'1','Start transverse on the ASIS: a bright bony curve with acoustic shadow beneath.'],
    [9,13,'2','Slide caudad and slightly medial. The AIIS appears as a bony step with the rectus femoris tendon on it.'],
    [13,17,'3','Keep the lateral end on the AIIS and rotate the medial end caudad about 45 degrees, along the pubic ramus.'],
    [17,21,'4','The iliopubic eminence appears medially. Psoas tendon on bone between; femoral artery superficial, medially.'],
    [21,99,'5','Fine-tune until AIIS, tendon and eminence share one view. Target: beneath the tendon, on bone.']],
  state(t){
    const A=ANAT.lin,G=GEO.lin,{m,r}=findMix(t),bone=resample(mixBone(m,r),4);
    const vis={tendon:ease(seg(t,14.4,16.6)),vessels:ease(seg(t,14.8,17)),nerve:ease(seg(t,14.8,17)),pect:ease(seg(t,13.6,16.6)),rf:ease(seg(t,10.4,12.4)),asis:1-ease(seg(t,9.4,10.6)),ip:ease(seg(t,10,12.5))};
    return{S:[0,0],tip:[-99,-99],na:0,k:0,v:0,nerve:A.nerve,tendon:A.tendon,fi:G.fiR,fl:G.fasciaLata,la:null,bone,vis,gA:1-seg(t,8.3,9)};
  }};
const TABS={linear:['find','inplane'],curvi:['curvi'],error:['intraMusc','fiPlane']};
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
// needle: hyperechoic shaft; s.faint (curvilinear, steep angle): deeper than 3 cm the shaft fades with depth
// (alpha 0.55 -> 0.3, no highlight), the last few mm and the tip stay bright
function drawNeedle(c,s){
  if(s.na<=0)return;
  const S=s.S,[tx,ty]=s.tip,d=[tx-S[0],ty-S[1]],l=Math.hypot(...d),ux=d[0]/l,uy=d[1]/l,nx=-uy,ny=ux,bx=tx-ux*16,by=ty-uy*16;
  const shaft=(a,b,al,hi=true)=>{c.globalAlpha=s.na*al;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.strokeStyle='#2f3035';c.lineWidth=hi?7:5.4;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=hi?4.2:3.2;c.stroke();
    if(hi){c.beginPath();c.moveTo(a[0]-nx*1.2,a[1]-ny*1.2);c.lineTo(b[0]-nx*1.2,b[1]-ny*1.2);c.strokeStyle='rgba(250,251,253,.9)';c.lineWidth=1.1;c.stroke()}};
  c.save();c.lineCap='butt';
  const yF=147+3*82;
  if(s.faint&&by>yF+30){const q=(yF-S[1])/(by-S[1]),M=[S[0]+(bx-S[0])*q,S[1]+(by-S[1])*q],T=[bx-ux*22,by-uy*22];
    shaft(S,M,1);
    // one stroke with an alpha gradient along the shaft (no seams), no highlight line
    const gr=(r,g,b)=>{const q=c.createLinearGradient(M[0],M[1],T[0],T[1]);q.addColorStop(0,`rgba(${r},${g},${b},.55)`);q.addColorStop(1,`rgba(${r},${g},${b},.3)`);return q};
    c.globalAlpha=s.na;c.beginPath();c.moveTo(M[0],M[1]);c.lineTo(T[0],T[1]);c.strokeStyle=gr(47,48,53);c.lineWidth=5.4;c.stroke();c.strokeStyle=gr(169,173,182);c.lineWidth=3.2;c.stroke();
    shaft(T,[bx,by],1)}
  else{c.lineCap='round';shaft(S,[bx,by],1)}
  c.globalAlpha=s.na;
  c.beginPath();c.moveTo(bx+nx*3.4,by+ny*3.4);c.lineTo(tx,ty);c.lineTo(bx-nx*3.4,by-ny*3.4);c.closePath();c.fillStyle='#8e929b';c.fill();c.strokeStyle='#2f3035';c.lineWidth=1.2;c.stroke();
  c.restore();
}
function drawGuides(c,A,dT,ga=1){
  const fade=(dT<4?1:lerp(1,.32,seg(dT,4,6.5)))*ga;if(fade<=0)return;
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  A.guides.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  const cp=seg(dT,1.4,2.6);
  if(cp>0&&!A.noCross){c.globalAlpha=cp;[[A.nerve.x,A.nerve.y],[A.vein.x,A.vein.y],[A.art.x,A.art.y]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}
// depth ruler from the skin (y 147): A.ppc px per cm, a minor tick every 5 mm; drawn over the bone shadow
function drawRuler(c,A,dT){
  const tp=seg(dT,.4,1.9),n=A.depthCm*2,st=A.ppc/2;
  c.save();c.strokeStyle=`rgba(${C.guide},.6)`;c.lineWidth=1;
  c.globalAlpha=ease(seg(dT,0,1.2));c.beginPath();c.moveTo(36,140);c.lineTo(36,147+n*st);c.stroke();c.globalAlpha=1;
  for(let i=0;i<=n;i++){if(i/n>tp)break;const y=147+i*st,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke();if(i){c.font='400 13px Inter, system-ui, sans-serif';const tw=c.measureText((i/2)+' cm').width;c.fillStyle='rgba(244,236,225,.9)';c.fillRect(53,y-8,tw+6,16);c.fillStyle=`rgba(${C.guide},.85)`;c.fillText((i/2)+' cm',56,y+4)}}}
  c.restore();
}
// psoas tendon: brighter than muscle, fine fibrillar hatching; drawn live because LA lifts it off the bone
function drawTendon(c,T,a,lp){
  if(a<=0)return;const P=ellipsePts(T.x,T.y,T.rx,T.ry,60),r=rng(5),n=Math.round(T.ry*1.4);
  c.save();c.globalAlpha=a;polyPath(c,P);c.fillStyle='#f8ebdd';c.fill();c.save();c.clip();
  for(let i=0;i<n;i++){const y=T.y-T.ry+(i+.5)*2*T.ry/n+r()*.8;c.beginPath();c.moveTo(T.x-T.rx,y);c.bezierCurveTo(T.x-T.rx*.3,y-2,T.x+T.rx*.3,y+2,T.x+T.rx,y-1);
    c.strokeStyle=r()<.5?'rgba(150,96,64,.35)':'rgba(255,252,246,.9)';c.lineWidth=.6;c.stroke()}
  c.restore();c.strokeStyle='rgba(43,30,24,.75)';c.lineWidth=1.4;strokePartial(c,mkPath(P),lp);c.restore();
}
// rectus femoris direct head: a short bright fibrillar cap on the AIIS (live, it fades in during the Find scan)
function drawRF(c,G,bone,a){
  if(a<=0)return;const R=G.rf,top=[],bot=[];
  for(let x=R.a;x<=R.b;x+=3){const y=yAt(bone,x),h=R.h*Math.sin(Math.PI*(x-R.a)/(R.b-R.a))**.6;top.push([x,y-1-h]);bot.push([x,y-1])}
  const P=top.concat(bot.reverse());c.save();c.globalAlpha=a;polyPath(c,P);c.fillStyle='#f6e7d8';c.fill();c.save();c.clip();
  for(let i=0;i<5;i++){c.beginPath();top.forEach((p,j)=>{const y=lerp(p[1],bot[bot.length-1-j][1],(i+.5)/5);j?c.lineTo(p[0],y):c.moveTo(p[0],y)});c.strokeStyle=i%2?'rgba(150,96,64,.4)':'rgba(255,252,246,.9)';c.lineWidth=.7;c.stroke()}
  c.restore();c.strokeStyle='rgba(43,30,24,.55)';c.lineWidth=1;polyPath(c,P);c.stroke();c.restore();
}
// acoustic shadow strip: dark under the bone, fading with depth (stretched per column under the bone line)
const SHADOW=(()=>{const cv=document.createElement('canvas');cv.width=1;cv.height=320;const g=cv.getContext('2d'),gr=g.createLinearGradient(0,0,0,320);
  gr.addColorStop(0,'rgba(96,56,36,.34)');gr.addColorStop(.18,'rgba(96,56,36,.2)');gr.addColorStop(.55,'rgba(96,56,36,.07)');gr.addColorStop(1,'rgba(96,56,36,0)');g.fillStyle=gr;g.fillRect(0,0,1,320);return cv})();
// the shadow is built column by column on an unscaled offscreen layer (no seams), cached per bone line
let shadowCache=new WeakMap(),shadowFree=null;   // let (page: const) so release() can drop the cached layers
function shadowLayer(B){let cv=shadowCache.get(B);if(cv)return cv;
  // the Find scan morphs the bone every frame: reuse one layer instead of caching
  const live=!!cur.scan;if(live&&shadowFree)cv=shadowFree;else{cv=document.createElement('canvas');cv.width=W;cv.height=H}
  const g=cv.getContext('2d');g.clearRect(0,0,W,H);if(live){shadowFree=cv;cv._b=B}
  for(let x=0;x<W;x+=2)g.drawImage(SHADOW,x,Math.round(yAt(B,x+1))-2,2,SHADOW.height);
  if(!live)shadowCache.set(B,cv);return cv}
// bone: acoustic shadow beneath (paper, then a brown gradient fading with depth), then a bright hyperechoic line
function drawBone(c,s,G,texA,lp){
  const B=s.bone,y0=yAt(B,0),y1=yAt(B,1600),poly=[[0,y0]].concat(B,[[1600,y1],[1600,H],[0,H]]);
  c.save();c.globalAlpha=texA;polyPath(c,poly);c.clip();c.drawImage(paperC,0,0,W,H);
  c.drawImage(shadowLayer(B),0,0,W,H);
  c.restore();
  c.save();c.lineJoin='round';c.lineCap='round';const cv=G.v==='cur',path=mkPath(B);
  c.strokeStyle=`rgba(255,251,244,${cv?.8:.95})`;c.lineWidth=cv?7:8;strokePartial(c,path,lp);
  c.strokeStyle=C.ink;c.lineWidth=cv?2.4:2.8;strokePartial(c,path,lp);c.restore();
}
function core(c,s,sub){
  const A=ANAT[cur.anat],G=GEO[A.geo],dT=s.dT,t=s.t,V=s.vis||VIS1,cv=G.v==='cur';
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  // curvilinear: the image is the annular sector only; anatomy is clipped to it
  if(cv){c.save();polyPath(c,SECTOR);c.clip()}
  c.save();c.globalAlpha=texA;c.drawImage(tissue(A.geo),0,0,W,H);if(V.pect>0){c.globalAlpha=texA*V.pect;c.drawImage(pectLayer(A.geo),0,0,W,H)}c.restore();
  const ba=ease(seg(dT,6.3,7.8));
  if(cv){
    if(ba>0){c.save();polyPath(c,SECTOR);c.clip();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,86,0,800);g.addColorStop(0,`rgba(226,140,92,${.5*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.36*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();
}
  } else if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(517,148,499,652);c.restore()}
  if(!sub)drawGuides(c,cur.guideA||A,dT,s.gA??1);
  c.save();c.lineJoin='round';c.lineCap='round';
  G.OUT.forEach(o=>{const p=ease(seg(dT,o.t[0],o.t[1])),al=o.n==='pect'?V.pect:o.n==='sept'?V.ip:1;if(al<=0)return;c.save();c.globalAlpha=al;
    c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,o.p,p);
    if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}c.restore()});
  c.restore();
  drawLA(c,s,texA);
  drawTendon(c,s.tendon,texA*V.tendon,ease(seg(dT,2.6,3.8)));
  drawFascia(c,dT,s);
  if(V.vessels>0){c.save();c.globalAlpha=V.vessels;drawVessels(c,A,texA,ease(seg(dT,3.0,4.4)),s.clock);c.restore()}
  if(V.nerve>0){c.save();c.globalAlpha=V.nerve;drawNerve(c,s.nerve,A.fas.nerve,A.nerve.rx,texA,ease(seg(dT,3.2,4.4)));c.restore()}
  drawBone(c,s,G,texA,ease(seg(dT,2.8,4.4)));
  drawRF(c,G,s.bone,texA*V.rf);
  if(cv){c.restore();
    // outside the sector: plain, slightly darker paper (no image there), with the sector edge
    const wa=ease(seg(dT,1.2,3));c.save();c.beginPath();c.rect(0,0,W,H);SECTOR.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=`rgba(226,214,198,${.55*wa})`;c.fill('evenodd');
    c.globalAlpha=wa*.5;c.strokeStyle=C.ink;c.lineWidth=1;c.setLineDash([3,5]);polyPath(c,SECTOR);c.stroke();c.restore()}
  if(!sub)drawRuler(c,A,dT);
  // probe
  const PR=mkPath(G.probe);
  c.save();polyPath(c,G.probe);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,PR,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();const sx=cv?640:612,sw=cv?252:316,sy=cv?22:102;c.roundRect?c.roundRect(sx,sy,sw,9,4.5):c.rect(sx,sy,sw,9);c.stroke()}
  c.restore();
  // orientation marker
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    const my=cv?62:130;c.textAlign='left';c.fillText('Medial',cv?552:540,my);c.textAlign='right';c.fillText('Lateral',cv?980:1000,my);c.restore()}
  if(!sub)cur.guides.forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}
function drawLabels(c,s){
  const A=ANAT[cur.anat],a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  A.muscles.forEach(m=>{const k=m[3]?m[3](s):1;if(k>0)muscleLabel(c,m[0],m[1],m[2],a*k)});
  // pills: [text, x, y, align, anchor(s), optional visibility(s)]
  A.pills.forEach(p=>{const k=p[5]?p[5](s):1;if(k>0)pill(c,p[0],p[1],p[2],p[3],p[4](s),a*k)});
  // cur.la: a list of [x,y,align,anchor,text,t0]
  cur.la.forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;
    if(la>0)pill(c,L[4]||'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)});
}
// copper cue pills confirming a correct step: cur.cues [t0, text, x, y]
function drawCues(c,t){(cur.cues||[]).forEach(([t0,text,x,y])=>{const a=seg(t,t0,t0+.6);if(a>0)cuePill(c,text,x,y,a)})}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('PENG block',60,74);
  c.fillStyle=cur.neg?RED:'#7a6456';c.font='400 18px Inter, system-ui, sans-serif';c.fillText(cur.subtitle,62,104);
  c.restore();
  const va=seg(t,cur.volT,cur.volT+.6);
  if(va>0){c.save();c.globalAlpha=va;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText(DRUG,62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const vt=(s.v||0).toFixed(1)+' / '+cur.vol+' mL';c.fillText(vt,212,142);
    if(s.paused){const w=c.measureText(vt).width;c.fillStyle='#7a6456';c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText('aspirate',212+w+12,141)}
    c.restore()}
  const lg=cur.ledger&&cur.ledger(s,t);
  if(lg&&lg.a>0){c.save();c.globalAlpha=lg.a;c.textAlign='right';c.font='400 16px Inter, system-ui, sans-serif';
    lg.lines.forEach((l,i)=>{const last=i===lg.lines.length-1;c.fillStyle=last?'#8f431d':'#7a6456';if(last)c.font='500 16px Inter, system-ui, sans-serif';c.fillText(l,1540,768+i*25)});c.restore()}
  const cap=cur.caps.find(x=>t>=x[0]&&t<x[1])||cur.caps[cur.caps.length-1];
  const ca=Math.min(seg(t,cap[0],cap[0]+.6),1-seg(t,cap[1]-.5,cap[1]))*ease(seg(s.dT,.6,1.6));
  c.save();c.globalAlpha=Math.max(0,ca);
  c.fillStyle='#a8552a';c.font='500 26px Fraunces, Georgia, serif';c.fillText(cap[2],60,862);
  c.fillStyle=C.ink;c.font='italic 400 26px Fraunces, Georgia, serif';c.fillText(cap[3],92,862);c.restore();
  const ha=seg(s.dT,7.4,8.2)*(started?0:1);
  if(ha>0){c.save();c.globalAlpha=ha*(reduceMotion?1:.7+.3*Math.sin(s.clock*3));c.fillStyle='#a8552a';c.font='italic 400 22px Fraunces, Georgia, serif';c.textAlign='right';c.fillText(cur.hint||'Press play to see the needle',1540,74);c.restore()}
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
   SURF: anterior view of the right hip and groin, in canvas px. Screen left = patient's LATERAL. cm = surface px per cm.
   Scan mapping: the in-plane needle is drawn along the probe's long axis at (scanCx - scan x) / scanCm cm from the probe
   centre (+ = medial). Probe pose {x,y,rot}: rot is the angle of the long axis (lateral end screen left; + rotates the
   medial end caudad). In both scans the AIIS lies 1.65 cm lateral of the probe centre, so the pose pivots there:
   P1 transverse on the ASIS, P2 slid caudad and slightly medial onto the AIIS, P3 medial end rotated caudad 45 degrees
   (AIIS to iliopubic eminence; the femoral artery lies under the probe's medial part, 1.8 cm medial of centre).
   The AIIS sits ~3 cm inferior and slightly medial to the ASIS, so the needle line (45 degrees) enters between them. */
const AIIS_OFF=1.65,ROT=Math.PI/4;
function pengPose(cfg,m,r){const c=cfg.cm*AIIS_OFF,[ax,ay]=cfg.aiis,[sx,sy]=cfg.asis;
  if(r<=0)return{x:lerp(sx+c,ax+c,m),y:lerp(sy+5,ay,m),rot:0};
  const a=ROT*r;return{x:ax+c*Math.cos(a),y:ay+c*Math.sin(a),rot:a}}
// needle scenarios: on the ASIS during dT 2.4-3.4, slide 3.4-4.8, rotate 4.8-6.2, then hold for the needle
function introMix(s){return{m:ease(seg(s.dT,3.4,4.8)),r:ease(seg(s.dT,4.8,6.2))}}
function curMix(s){return cur.scan?findMix(s.t):introMix(s)}
function probeText(s){const {m,r}=curMix(s);
  if(r>=.97)return'Probe: AIIS to iliopubic eminence';if(r>.03)return'Probe: rotating 45 degrees along the pubic ramus';
  if(m>.03)return'Probe: sliding caudad to the AIIS';return'Probe: transverse on the ASIS'}
const SURF_BASE={
  cm:60,scanCx:770,scanCm:130,skinY:147,probeLen:4.0,probeW:1.1,needleLen:5.0,
  view:'Right hip, anterior view',
  asis:[400,240],aiis:[520,410],pubTub:[1150,500],
  ligament:[[400,240],[600,330],[800,410],[1000,466],[1150,500]],
  crease:[[440,330],[640,410],[880,497],[1060,548],[1170,578]],
  pulse:[672,436],artery:[[672,436],[668,556],[694,780]],
  lateral:[[306,180],[322,230],[334,380],[344,560],[366,780]],
  crest:[[400,240],[352,206],[306,180]],
  medial:[[1262,640],[1218,710],[1180,780]],
  pubic:[[1150,500],[1300,540],[1330,560],[1300,610],[1262,640]],
  midline:[[1420,180],[1420,540]],
  sartorius:[[[404,252],[470,420],[590,610],[690,780]],[[418,246],[548,410],[700,600],[800,780]]],
  probe(t,s){const k=ease(seg(s.dT,2.0,2.6)),{m,r}=curMix(s),o=pengPose(this,m,r);o.a=k;return o},
  pills:[['ASIS',300,212,'right',c=>[c.asis[0]-6,c.asis[1]+5]],['AIIS (deep)',470,480,'right',c=>[c.aiis[0]-6,c.aiis[1]+7]],
    ['Pubic tubercle',1180,452,'left',c=>c.pubTub],
    ['Inguinal ligament',840,330,'left',()=>[800,410]],['Femoral artery pulse',880,620,'left',c=>[c.pulse[0]+4,c.pulse[1]+12]],
    [probeText,1010,700,'left',(c,P)=>P(1.2,.62)]],
  muscle:['Sartorius',740,762],
};
const SURF_L=SURF_BASE;
const SURF_C=Object.assign({},SURF_BASE,{scanCx:766,scanCm:82,probeLen:5.8,probeW:1.6,needleLen:10,convex:true,pannus:true});
// large patient: the needle enters just lateral to the ASIS, so its pill sits medial and above, clear of the hub
SURF_C.pills=[['ASIS',430,196,'left',c=>[c.asis[0]+4,c.asis[1]-6]]].concat(SURF_BASE.pills.slice(1));
const cfgFor=()=>cur.anat==='cur'?SURF_C:SURF_L;
// drawSurface: hand-drawn anterior surface view with probe and in-plane needle at the time in s
function drawSurface(c,s,cfg){
  const dT=s.dT,lp=ease(seg(dT,.6,2.8)),ink='rgba(43,30,24,';
  const line=(P,w,a,p=lp,dash)=>{c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink+a+')';c.lineWidth=w*(cfg.lw||1);if(dash)c.setLineDash(dash);strokePartial(c,mkPath(spline(P,false)),p);c.restore()};
  const body=spline(cfg.lateral,false).concat(spline(cfg.medial.slice().reverse(),false),spline(cfg.pubic.slice().reverse(),false),[[cfg.midline[1][0],cfg.midline[1][1]],cfg.midline[0]]);
  c.save();c.globalAlpha=ease(seg(dT,1.2,3));polyPath(c,body);const g=c.createLinearGradient(0,140,0,800);g.addColorStop(0,'rgba(243,223,204,.9)');g.addColorStop(1,'rgba(243,223,204,.35)');c.fillStyle=g;c.fill();c.restore();
  line(cfg.lateral,2.2,.9);line(cfg.crest,1.8,.75);line(cfg.medial,2.2,.9);line(cfg.pubic,1.6,.6);line(cfg.midline,1.1,.4,lp,[6,7]);
  cfg.sartorius.forEach(P=>line(P,1.1,.28));
  line(cfg.ligament,2.4,.85,ease(seg(dT,1.4,3.2)));
  line(cfg.crease,1.3,.45,ease(seg(dT,1.6,3.4)),[3,5]);
  line(cfg.artery,1.6,.35,ease(seg(dT,2,3.6)),[8,6]);
  [[170,262,1,0],[700,800,0,1]].forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,y0,W,y1-y0+(a1?100:0))});
  // landmarks: ASIS and pubic tubercle (palpable), AIIS (deep, dashed), femoral pulse
  const la=ease(seg(dT,2,3));
  c.save();c.globalAlpha=la;c.strokeStyle=C.ink;c.lineWidth=1.6*(cfg.lw||1);[cfg.asis,cfg.pubTub].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  c.setLineDash([4,4]);c.beginPath();c.arc(cfg.aiis[0],cfg.aiis[1],9,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
  c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r,0,Math.PI*2);c.stroke()});c.restore();
  // large patient: the abdominal fold (pannus) hangs over the groin, then an assistant or tape lifts it ~1.5 cm cephalad
  if(cfg.pannus){const k=ease(seg(dT,1,2.4)),pa=ease(seg(dT,.6,1.4)),lo=cfg.ligament.map(p=>[p[0],p[1]+22-90*k]);
    const edge=spline([[370,lo[0][1]-8]].concat(lo,[[1300,lo[4][1]+6],[1420,lo[4][1]-30]]),false);
    c.save();c.globalAlpha=pa;polyPath(c,edge.concat([[1420,150],[370,150]]));const pg2=c.createLinearGradient(0,150,0,520);pg2.addColorStop(0,'rgba(232,204,180,.25)');pg2.addColorStop(1,'rgba(226,192,166,.7)');c.fillStyle=pg2;c.fill();
    c.lineJoin='round';c.strokeStyle='rgba(43,30,24,.7)';c.lineWidth=2.2*(cfg.lw||1);strokePartial(c,mkPath(edge),1);
    c.strokeStyle='rgba(43,30,24,.25)';c.lineWidth=1.1;strokePartial(c,mkPath(edge.map(p=>[p[0],p[1]-14])),1);c.restore();
    const ta=k*(cfg.labels===false?0:1)*(s.labels===false?0:1);if(ta>0)pill(c,'Assistant or tape lifts the fold',980,236,'left',[920,yAt(edge,920)],ta)}
  // probe
  const pr=cfg.probe(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];   // a along the probe (+ medial), o across it (+ caudal)
  const hl=cfg.probeLen/2,hw=cfg.probeW/2;
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const cab=[P(0,-hw),P(.2,-hw-1.6),P(-.4,-hw-3.4),P(.3,-hw-5.6)];c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();
    if(cfg.convex){const L=hl*cm+8,Hh=hw*cm;c.moveTo(-L+Hh*.6,-Hh);c.lineTo(L-Hh*.6,-Hh);c.quadraticCurveTo(L+Hh*.5,0,L-Hh*.6,Hh);c.lineTo(-L+Hh*.6,Hh);c.quadraticCurveTo(-L-Hh*.5,0,-L+Hh*.6,-Hh);c.closePath()}
    else if(c.roundRect)c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,12);else c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,4);c.lineTo(hl*cm,4);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the lateral end, matching "Lateral" on the scan
    c.beginPath();c.arc(-hl*cm+14,-hw*cm+12,5.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
      const L=P(-hl-.6,-hw-.45),M=P(hl+.7,hw+.3);c.fillText('Lateral',L[0],L[1]);c.fillText('Medial',M[0],M[1]);c.restore()}}
  // needle, in plane with the probe, lateral to medial; depth from the scan state
  if(s.na>0&&s.tip[0]>-50){
    const [tx,ty]=s.tip,S=s.S,at=(cfg.scanCx-tx)/cfg.scanCm,ah=at-cfg.needleLen*Math.abs(tx-S[0])/Math.hypot(tx-S[0],ty-S[1]);   // hub: the shaft's horizontal projection
    const ae=ty>cfg.skinY?(cfg.scanCx-(S[0]+(tx-S[0])*(cfg.skinY-S[1])/(ty-S[1])))/cfg.scanCm:at;
    c.save();c.globalAlpha=s.na;c.lineCap='round';
    const h=P(ah,0),e=P(ae,0),tp=P(at,0);
    c.beginPath();c.moveTo(...h);c.lineTo(...e);c.strokeStyle='#2f3035';c.lineWidth=6;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=3.4;c.stroke();
    if(at>ae){c.setLineDash([7,6]);c.beginPath();c.moveTo(...e);c.lineTo(...tp);c.strokeStyle='rgba(47,48,53,.75)';c.lineWidth=2.2;c.stroke();c.setLineDash([]);
      c.beginPath();c.arc(...e,5,0,Math.PI*2);c.strokeStyle=C.ink;c.lineWidth=1.3;c.stroke()}
    const h2=P(ah-.9,0);c.beginPath();c.moveTo(...h);c.lineTo(...h2);c.strokeStyle='#7a6456';c.lineWidth=12;c.stroke();c.restore()}
  // labels
  const a=cfg.labels===false?0:ease(seg(dT,3.4,4.6))*(s.labels===false?0:1);
  if(a>0){cfg.pills.forEach(p=>pill(c,typeof p[0]==='function'?p[0](s):p[0],p[1],p[2],p[3],p[4](cfg,P),a));muscleLabel(c,cfg.muscle[0],cfg.muscle[1],cfg.muscle[2],a*.8);
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,1400,200);c.restore()}
}
// small picture-in-picture of drawSurface: during the intro, and for the whole scan in the Find scenario
// bottom right, over the empty acoustic shadow (linear) or outside the sector (curvilinear), so it never covers anatomy
const INSET={x:1256,y:556,w:330,h:256,src:[320,190,528]},INSET_S=INSET;   // src: crop left, top, width (canvas px of the surface view)
function drawInset(c,s){
  const a=cur.scan?seg(s.dT,1,1.6):seg(s.dT,1,1.6)*(1-seg(s.dT,6.8,7.5))*(started?0:1);if(a<=0)return;
  const I=cur.scan?INSET_S:INSET,k=I.w/I.src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-I.src[0],-I.src[1]);drawSurface(c,Object.assign({},s,{dT:cur.scan?9:Math.max(s.dT,2.6),na:0}),Object.assign({},cfgFor(),{labels:false,inset:true,lw:1.5}));c.restore();
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  c.fillStyle='rgba(251,247,241,.9)';c.fillRect(I.x+I.w-119,I.y+I.h-25,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',I.x+I.w-110,I.y+I.h-13);c.restore();
}
function render(P){
  const t=TS0+P.playT;
  const s=cur.state(t);s.dT=P.dT;s.t=t;s.clock=P.clock;s.labels=showLabels;s.vis=s.vis||VIS1;
  if(probeView){ctx.drawImage(paperC,0,0,W,H);drawSurface(ctx,s,cfgFor());drawOverlay(ctx,s);return}
  core(ctx,s,false);
  if(showLabels)drawLabels(ctx,s);
  if(cur.warnings)cur.warnings(ctx,t,s);
  drawCues(ctx,t);
  drawMagnifier(ctx,s);
  drawOverlay(ctx,s);
  drawInset(ctx,s);
}

return {
  SC, TABS,
  curScen: {linear:'find', curvi:'curvi', error:'intraMusc'},
  defaultTab: 'linear',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  onTab(tab,scen){tissue(ANAT[SC[scen].anat].geo)},
  aria(P){return P.probeView?'Probe position on the right hip for the PENG block':'Animated ultrasound-guided pericapsular nerve group (PENG) block'},
  release(){for(const M of [tissueCache,pectCache])for(const k in M){M[k].width=0;delete M[k]}
    if(shadowFree){shadowFree.width=0;shadowFree=null}shadowCache=new WeakMap()}
};
});
