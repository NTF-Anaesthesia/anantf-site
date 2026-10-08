/* Adductor canal and femoral triangle block: block module for ra.html (ported from adductor-canal.html; contract in
   guides/ra-block-pages/single-page-spec.md). The build body is the page's script in page order, minus the engine helpers and
   the player. makeFascicles and laAnchor are the page's own (overrides); the page's paper layer is the engine's (TSC = LS = 1.5). */
RA.register('adductor-canal', {
  title: 'Adductor canal and femoral triangle block',
  tabsLabel: 'Scenario',
  tabs: [['scan', 'Find the apex', 'Scan distally, no needle'],
         ['single', 'Single shot', 'Saphenous nerve, 0.4%'],
         ['tkr', 'TKR: three targets', 'Saphenous, NVM, AFCN, 0.2%']],
  pills: null,
  probe: true,
  notes: '',
  tips: `
<p class="lede">Practical points from consensus papers, trials and technique references. Tags point to the sources below.</p>
<h3>Scanning</h3>
<ul>
  <li>Do not use mid-thigh as a surface marker for the adductor canal: in every volunteer the thigh midpoint (ASIS to patella base) was proximal to the apex, on average by 4.6 cm, so a mid-thigh injection is really a femoral triangle block. Find the apex on the scan instead.<span class="tag">Wong 2017</span></li>
  <li>Scan distally until the femoral vessels dive deep away from sartorius towards the popliteal fossa: that is the adductor hiatus, the distal limit of the canal, and anything between the apex and this point counts as an adductor canal block.<span class="tag">Delphi 2024</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>You do not need to see the saphenous nerve: the endpoint is local anaesthetic spreading around the artery deep to sartorius. Give a 1 to 2 mL test bolus first and, if it does not track around the artery, reposition before committing the rest of the volume.<span class="tag">NYSORA</span></li>
  <li>Do not rely on a small volume to keep the block in the canal: in an MRI dose-finding study, spread back into the femoral triangle occurred in about half of volunteers at 10, 15 and 20 mL with no clear volume relationship, and 10 versus 30 mL of ropivacaine 0.1% made no meaningful difference to quadriceps strength. Injection site matters more than volume.<span class="tag">Jæger 2015a</span><span class="tag">Jæger 2015b</span></li>
</ul>
<h3>Indication</h3>
<ul>
  <li>Level changes the posterior knee: in cadavers, 10 mL of dye in the distal adductor canal passed through the hiatus to stain the popliteal plexus and the genicular branch of the posterior obturator nerve in all 10 sides, while femoral triangle injections never reached the popliteal fossa.<span class="tag">Runge 2017</span></li>
  <li>One well-placed block inside a strong multimodal plan is the goal: with spinal morphine, periarticular infiltration, dexamethasone and a single-shot adductor canal block already given, adding iPACK, repeat adductor canal injections, dexmedetomidine, ketamine and extra dexamethasone did not reduce opioid use and caused more hypotension.<span class="tag">Muñoz-Leyva 2022</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Name and record the block by where the needle tip sits relative to the apex, not by habit: the Delphi panel defined a femoral triangle block as proximal to the apex and an adductor canal block as distal to it, and could not agree on a proximal versus distal femoral triangle split, so write down the level you actually injected at.<span class="tag">Delphi 2024</span></li>
  <li>Motor sparing is relative, not absolute: an adductor canal block preserved quadriceps strength and balance compared with a femoral nerve block in volunteers, but a proximal or large-volume injection can still weaken vastus medialis. Test quadriceps strength and keep fall precautions and assisted first mobilisation.<span class="tag">Kwofie 2013</span><span class="tag">NYSORA</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>An adductor canal block is not a femoral nerve block in disguise: after TKR, patients with an adductor canal block in place still had moderate pain that a femoral nerve block then relieved (median pain 2.0 versus 5.5 with sham), so residual anterior or lateral knee pain often means a coverage gap rather than a missed block.<span class="tag">Gadsden 2020</span></li>
  <li>A mid-thigh or distal femoral triangle injection leaves the TKR midline incision and anteromedial knee skin uncovered. In volunteers, a proximal femoral triangle block plus an intermediate femoral cutaneous nerve injection above sartorius numbed the whole incision in 15 of 20, which is the reason for the superficial third target.<span class="tag">Bjørn 2019</span></li>
</ul>`,
  sources: `<ol>
  <li><b>Wong 2017.</b> Wong WY, Bjørn S, Strid JM, Børglum J, Bendtsen TF. Defining the location of the adductor canal using ultrasound. <i>Reg Anesth Pain Med</i> 2017;42:241-5. <a href="https://pubmed.ncbi.nlm.nih.gov/28002228/">PMID 28002228</a></li>
  <li><b>Delphi 2024.</b> El-Boghdadly K, Albrecht E, et al. Standardizing nomenclature in regional anesthesia: an ASRA-ESRA Delphi consensus study of upper and lower limb nerve blocks. <i>Reg Anesth Pain Med</i> 2024. <a href="https://pubmed.ncbi.nlm.nih.gov/38050174/">PMID 38050174</a></li>
  <li><b>NYSORA.</b> Ultrasound-guided saphenous (subsartorius/adductor canal) nerve block. <a href="https://www.nysora.com/techniques/lower-extremity/ultrasound-guided-saphenous-subsartorius-adductor-canal-nerve-block/">nysora.com</a></li>
  <li><b>Jæger 2015a.</b> Jæger P, et al. Optimal volume of local anaesthetic for adductor canal block: continual reassessment method to estimate ED95. <i>Br J Anaesth</i> 2015;115:920-6. <a href="https://pubmed.ncbi.nlm.nih.gov/26582853/">PMID 26582853</a></li>
  <li><b>Jæger 2015b.</b> Jæger P, et al. Adductor canal block with 10 mL versus 30 mL local anesthetics and quadriceps strength. <i>Reg Anesth Pain Med</i> 2015;40:553-8. <a href="https://pubmed.ncbi.nlm.nih.gov/26237001/">PMID 26237001</a></li>
  <li><b>Kwofie 2013.</b> Kwofie MK, Shastri UD, Gadsden JC, et al. The effects of ultrasound-guided adductor canal block versus femoral nerve block on quadriceps strength and fall risk. <i>Reg Anesth Pain Med</i> 2013;38:321-5. <a href="https://scholars.duke.edu/publication/1106694">scholars.duke.edu</a></li>
  <li><b>Gadsden 2020.</b> Gadsden JC, Sata S, Bullock WM, Kumar AH, Grant SA, Dooley JR. The relative analgesic value of a femoral nerve block versus adductor canal block following total knee arthroplasty. <i>Korean J Anesthesiol</i> 2020;73:417-24. <a href="https://scholars.duke.edu/publication/1457115">scholars.duke.edu</a></li>
  <li><b>Bjørn 2019.</b> Bjørn S, Nielsen TD, Moriggl B, Hoermann R, Bendtsen TF. Anesthesia of the anterior femoral cutaneous nerves for total knee arthroplasty incision: randomized volunteer trial. <i>Reg Anesth Pain Med</i> 2019. <a href="https://pubmed.ncbi.nlm.nih.gov/31826920/">PMID 31826920</a></li>
  <li><b>Runge 2017.</b> Runge C, Moriggl B, Børglum J, Bendtsen TF. The spread of ultrasound-guided injectate from the adductor canal to the genicular branch of the posterior obturator nerve and the popliteal plexus: a cadaveric study. <i>Reg Anesth Pain Med</i> 2017;42:725-30. <a href="https://pubmed.ncbi.nlm.nih.gov/28937534/">PMID 28937534</a></li>
  <li><b>Muñoz-Leyva 2022.</b> Muñoz-Leyva F, Jack JM, Bhatia A, Chin KJ, Gandhi R, Perlas A, Jin R, Chan V. No benefits of adding dexmedetomidine, ketamine, dexamethasone, and nerve blocks to an established multimodal analgesic regimen after total knee arthroplasty. <i>Anesthesiology</i> 2022;137:459-70. <a href="https://pubmed.ncbi.nlm.nih.gov/35867857/">PMID 35867857</a></li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,shrink,bbox,pop,yAt,bump,C,RED,PROBE,BEAM,paperC,lobules,fibres,drawVessels,drawNerve,drawNeedle,guideLine,pill,muscleLabel,warnPill,cuePill,ring}=E;
let cur,started,showLabels,probeView;   // mirrors of the player state, refreshed by sync() before every render

const KP=[0,.35,.6,1],PFT=.35,PAC=1;
const lerpP=(a,b,k)=>typeof a==='number'?lerp(a,b,k):a.map((v,i)=>lerpP(v,b[i],k));
function kv(A,p){let i=0;while(i<2&&p>KP[i+1])i++;return lerpP(A[i],A[i+1],clamp((p-KP[i])/(KP[i+1]-KP[i])))}
const SKIN_TOP=spline([[20,180],[300,160],[517,147],[770,146],[1016,147],[1300,160],[1580,180]],false);
const SKIN_DEEP=spline([[30,190],[300,172],[560,163],[770,161],[1000,163],[1300,172],[1570,190]],false);
const K={
  fl:[[40,300],[300,296],[600,292],[900,290],[1200,292],[1580,300]],
  // sartorius: medial tip, roof (3), lateral tip, floor (4). It drifts medially across the artery as the probe goes distal.
  sart:[[[760,330],[830,304],[1000,302],[1200,305],[1320,332],[1250,385],[1100,424],[950,430],[820,402]],
        [[600,335],[680,306],[900,302],[1150,306],[1260,332],[1180,392],[1000,430],[850,430],[700,424]],
        [[430,308],[520,300],[800,298],[1050,303],[1160,332],[1080,390],[900,430],[700,430],[520,394]],
        [[360,302],[440,292],[700,288],[960,290],[1080,325],[1010,392],[820,422],[640,424],[470,395]]],
  // adductor longus: point 0 = medial (superficial) border. Only the medial part narrows; the lateral edge stays medial to the vessels.
  al:[[[150,332],[300,308],[520,316],[630,350],[650,420],[610,520],[480,580],[280,560],[170,440]],
      [[250,334],[400,320],[540,342],[620,375],[645,440],[612,530],[500,585],[360,560],[270,440]],
      [[430,400],[500,404],[570,422],[628,448],[646,500],[615,560],[540,590],[470,560],[436,470]],
      [[500,470],[540,472],[580,482],[612,500],[624,525],[606,556],[565,566],[525,548],[503,510]]],
  am:[[[60,600],[280,585],[480,605],[620,660],[650,740],[560,805],[60,805]],
      [[60,600],[300,590],[500,610],[630,655],[650,740],[560,805],[60,805]],
      [[60,480],[300,520],[460,610],[625,630],[650,730],[560,805],[60,805]],
      [[60,440],[300,452],[520,490],[600,560],[625,700],[520,805],[60,805]]],
  gr:[[[30,330],[110,320],[135,380],[130,470],[100,540],[45,560],[25,440]],
      [[40,330],[170,322],[225,380],[235,450],[200,530],[110,560],[45,470]],
      [[60,322],[300,320],[400,360],[420,420],[360,470],[220,480],[90,420]],
      [[60,306],[250,300],[330,320],[350,370],[300,410],[180,420],[80,380]]],
  vm:[[[790,565],[830,505],[920,494],[1100,445],[1300,425],[1580,410],[1580,740],[1300,748],[1060,742],[880,700],[805,635]],
      [[780,560],[820,500],[900,490],[1100,432],[1300,410],[1580,400],[1580,740],[1300,748],[1060,742],[880,700],[795,630]],
      [[775,560],[812,498],[900,484],[1100,428],[1300,405],[1580,395],[1580,735],[1300,740],[1050,735],[870,695],[790,625]],
      [[800,560],[828,492],[880,462],[1060,420],[1300,396],[1580,380],[1580,720],[1300,728],[1040,722],[860,690],[812,622]]],
  fem:[[[900,782],[980,758],[1060,750],[1150,756],[1230,778]],[[900,782],[980,758],[1060,750],[1150,756],[1230,778]],
       [[885,774],[965,750],[1045,742],[1135,748],[1215,770]],[[860,762],[940,738],[1020,732],[1110,740],[1190,762]]],
  // vastoadductor membrane: absent above the apex, short at the apex, complete over the canal (lateral to medial)
  vam:[[[820,470],[770,436],[700,438],[640,446],[615,458],[600,470]],[[820,470],[770,436],[700,438],[640,446],[615,458],[600,470]],
       [[820,470],[770,436],[700,438],[640,446],[615,458],[600,470]],[[848,478],[790,452],[700,445],[622,450],[566,472],[518,491]]],
  art:[[705,462,38],[700,474,38],[690,486,37],[680,500,36]],
  vein:[[690,560,50,32],[695,568,48,30],[705,575,46,30],[715,582,44,30]],
  // saphenous nerve: lateral to the artery above the apex, crosses its roof, anteromedial in the canal
  saph:[[785,455,14,11],[770,455,14,11],[730,452,14,11],[625,470,13,10]],
  nvm:[[920,468,12,10],[900,466,12,10],[880,466,12,10],[900,468,12,10]],
  mfcn:[880,840,700,600],ifcn:[1100,1070,1000,950],
  probeX:[730,820,880,1000],
  // label positions: muscles follow the morph
  lab:{sart:[[1060,372],[760,372],[860,372],[800,360]],al:[[320,452],[380,440],[505,466],[560,480]],am:[[300,720],[300,720],[250,680],[230,492]],
       gr:[[80,445],[140,450],[260,412],[210,372]],vm:[[1360,630],[1360,630],[1360,630],[1360,620]]},
};
function geoAt(p){
  const G={p},dy=-10*seg(p,.35,1);
  G.skinTop=SKIN_TOP;G.skinDeep=SKIN_DEEP;
  G.fl=spline(K.fl.map(q=>[q[0],q[1]+dy]),false);
  G.sartC=kv(K.sart,p);G.sart=spline(G.sartC,true);
  G.alC=kv(K.al,p);G.al=spline(G.alC,true);G.alA=1-seg(p,.62,.95);
  G.am=spline(kv(K.am,p),true);G.gr=spline(kv(K.gr,p),true);G.vm=spline(kv(K.vm,p),true);
  G.fem=spline(kv(K.fem,p),false);
  const a=kv(K.art,p),v=kv(K.vein,p),n=kv(K.saph,p),m=kv(K.nvm,p),arc=14*Math.sin(Math.PI*seg(p,.6,1));
  G.art={x:a[0],y:a[1],r:a[2]};G.vein={x:v[0],y:v[1],rx:v[2],ry:v[3]};
  G.nerve={x:n[0],y:n[1]-arc,rx:n[2],ry:n[3]};G.nvm={x:m[0],y:m[1],rx:m[2],ry:m[3]};G.nvmA=lerp(1,.5,seg(p,.6,1));
  G.roof=G.sart.slice(0,57);G.floor=G.sart.slice(56,127).reverse();   // deep surface of sartorius (roof of the femoral triangle compartment), x ascending
  G.vmRoof=G.vm.slice(0,71);
  G.vam=spline(kv(K.vam,p),false).reverse();G.vamA=p<.5?0:p<.6?.4*seg(p,.5,.6):lerp(.4,1,seg(p,.6,.85));
  G.septA=1-seg(p,.6,.85);G.afA=1-seg(p,.6,.8);
  G.afcn=[[kv(K.mfcn,p),9,6],[kv(K.ifcn,p),8,6]].map(([x,rx,ry])=>({x,y:yAt(G.fl,x)+6,rx,ry}));
  G.lab={};for(const k in K.lab)G.lab[k]=kv(K.lab[k],p);
  return G;
}
const GEO={ft:geoAt(PFT),ac:geoAt(PAC),p0:geoAt(0)};
const ctr=P=>{let x=0,y=0;P.forEach(q=>{x+=q[0];y+=q[1]});return[x/P.length,y/P.length]};
const REF={sart:ctr(GEO.ft.sart),al:ctr(GEO.ft.al),am:ctr(GEO.ft.am),gr:ctr(GEO.ft.gr),vm:ctr(GEO.ft.vm)};
/* ---------- textures ----------
   Seamless tiles (fat lobules, muscle fibres) used as canvas patterns clipped to the live outlines, so tissue texture
   moves with each structure as the scan morphs. Tile T=512 canvas px, rendered at 1.5x. */
const TT=512,TSC=1.5;
function tile(draw){const c=document.createElement('canvas');c.width=c.height=TT*TSC;const g=c.getContext('2d');g.scale(TSC,TSC);
  const wrap=f=>{for(const ox of[-TT,0,TT])for(const oy of[-TT,0,TT]){g.save();g.translate(ox,oy);f(g);g.restore()}};draw(g,wrap);return{cv:c,pat:null}}
function lobTile(seed,rxa,rxb,rya,ryb,col){return tile((g,wrap)=>{const r=rng(seed),pts=[];let tries=0;
  const dw=(a,b,T)=>{let d=Math.abs(a-b)%T;return Math.min(d,T-d)};
  while(tries<12000){tries++;const x=r()*TT,y=r()*TT,rx=rxa+r()*(rxb-rxa),ry=rya+r()*(ryb-rya);
    if(pts.some(p=>Math.hypot(dw(p.x,x,TT)/(p.rx+rx),dw(p.y,y,TT)/(p.ry+ry))<.92))continue;pts.push({x,y,rx,ry,a:(r()-.5)*.6})}
  wrap(c=>pts.forEach(p=>{c.beginPath();c.ellipse(p.x,p.y,p.rx,p.ry,p.a,0,Math.PI*2);c.fillStyle='rgba(255,246,236,.35)';c.fill();c.strokeStyle=col;c.lineWidth=.9;c.stroke()}))})}
function fibTile(seed,ang,n,la,lb){return tile((g,wrap)=>{const r=rng(seed),F=[];
  for(let i=0;i<n;i++){const x=r()*TT,y=r()*TT,len=la+r()*lb,a=ang+(r()-.5)*.28,cu=(r()-.5)*.35,dark=r()<.62;
    F.push({x,y,len,dx:Math.cos(a),dy:Math.sin(a),cu,col:dark?`rgba(92,50,30,${.12+r()*.28})`:`rgba(255,244,232,${.25+r()*.35})`,w:.45+r()*.7})}
  wrap(c=>F.forEach(f=>{c.beginPath();c.moveTo(f.x,f.y);c.quadraticCurveTo(f.x+f.dx*f.len/2-f.dy*f.cu*f.len,f.y+f.dy*f.len/2+f.dx*f.cu*f.len,f.x+f.dx*f.len,f.y+f.dy*f.len);c.strokeStyle=f.col;c.lineWidth=f.w;c.stroke()}))})}
const TEX={sub:lobTile(5,14,24,9,15,'rgba(150,88,58,.30)'),fat:lobTile(9,9,17,6,11,'rgba(150,88,58,.28)'),
  stip:fibTile(11,.1,2600,8,22),stip2:fibTile(12,.5,1600,10,30),obl:fibTile(13,2.75,1500,30,90)};
function fillTex(c,T,off,bb){if(!T.pat)T.pat=c.createPattern(T.cv,'repeat');
  if(T.pat.setTransform)T.pat.setTransform(new DOMMatrix([1/TSC,0,0,1/TSC,off[0],off[1]]));c.fillStyle=T.pat;c.fillRect(bb[0]-2,bb[1]-2,bb[2]-bb[0]+4,bb[3]-bb[1]+4)}
function drawMuscle(c,P,T,ref,al){
  if(al<=0)return;const bb=bbox(P),o=ctr(P);
  c.save();c.globalAlpha*=al;polyPath(c,P);const gr=c.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
  c.fillStyle=gr;c.fill();c.clip();c.lineWidth=26;c.strokeStyle='rgba(176,96,56,.16)';polyPath(c,P);c.stroke();
  fillTex(c,T,[o[0]-ref[0],o[1]-ref[1]],bb);c.restore();
}
// all soft tissue, drawn live from G
function drawTissue(c,G,a){
  if(a<=0)return;c.save();c.globalAlpha=a;
  const fl=G.fl,deep=fl.concat([[1600,fl[fl.length-1][1]],[1600,900],[0,900],[0,fl[0][1]]]);
  c.save();polyPath(c,deep);c.fillStyle=C.fat;c.fill();c.clip();fillTex(c,TEX.fat,[0,0],[0,250,1600,900]);c.restore();
  const band=G.skinDeep.concat(fl.slice().reverse());
  c.save();polyPath(c,band);c.fillStyle=C.sub;c.fill();c.clip();fillTex(c,TEX.sub,[0,0],[0,150,1600,320]);c.restore();
  drawMuscle(c,G.am,TEX.stip2,REF.am,1);drawMuscle(c,G.gr,TEX.stip2,REF.gr,1);drawMuscle(c,G.al,TEX.stip2,REF.al,G.alA);
  drawMuscle(c,G.vm,TEX.stip,REF.vm,1);drawMuscle(c,G.sart,TEX.obl,REF.sart,1);
  const gr=c.createLinearGradient(0,735,0,850);gr.addColorStop(0,'rgba(244,236,225,0)');gr.addColorStop(1,'rgba(244,236,225,1)');c.fillStyle=gr;c.fillRect(0,735,W,H-735);
  // femur: acoustic shadow beneath the anteromedial cortex (after the fade so the bony landmark stays legible)
  const F=G.fem,m=F[Math.floor(F.length/2)],sh=[[0,F[0][1]]].concat(F,[[1600,F[F.length-1][1]],[1600,900],[0,900]]);
  c.save();polyPath(c,sh);c.clip();c.translate(m[0],m[1]-14);c.scale(1.35,1);const sg=c.createRadialGradient(0,0,10,0,0,150);sg.addColorStop(0,'rgba(96,56,36,.30)');sg.addColorStop(.6,'rgba(96,56,36,.14)');sg.addColorStop(1,'rgba(96,56,36,0)');c.fillStyle=sg;c.fillRect(-220,0,440,200);c.restore();
  c.restore();
}
/* ---------- anatomy ---------- */
function makeFascicles(n,rx,ry,seed,smin=3,srange=5.5,pad=[12,11]){
  const r=rng(seed),out=[];let tries=0;
  while(out.length<n&&tries<4000){tries++;
    const x=(r()*2-1)*(rx-pad[0]),y=(r()*2-1)*(ry-pad[1]);
    if((x*x)/((rx-pad[0])**2)+(y*y)/((ry-pad[1])**2)>1)continue;
    const s=smin+r()*srange;if(out.some(f=>Math.hypot(f.x-x,f.y-y)<f.s+s+1.2))continue;
    const wob=[];for(let i=0;i<9;i++)wob.push(.72+r()*.5);out.push({x,y,s,wob,ring:r()<.55});
  }
  return out;
}
const FAS={saph:makeFascicles(8,14,11,11,1.5,1.3,[4.5,4]),nvm:makeFascicles(5,12,10,13,1.4,1.2,[4,3.5]),af:makeFascicles(3,9,6,17,1.1,.7,[3,2.4])};
// guide set for the intro: depth ruler, fascia lata and sartorius-floor horizontals, dashed ellipses, dashed target reveal
function guideSet(G,target){const n=G.nerve,v=G.vein,a=G.art;return[
  {p:mkPath([[36,140],[36,800]]),t:[0,1.2]},
  {p:mkPath([[40,yAt(G.fl,770)],[1560,yAt(G.fl,770)]]),t:[0.3,1.7]},
  {p:mkPath([[60,yAt(target,760)],[1540,yAt(target,760)]]),t:[0.5,1.9]},
  {p:mkPath(ellipsePts(n.x,n.y,n.rx+14,n.ry+14)),t:[0.6,2.4],dash:[6,6]},
  {p:mkPath(ellipsePts(v.x,v.y,v.rx+18,v.ry+16)),t:[1.1,2.8],dash:[6,6]},
  {p:mkPath(ellipsePts(a.x,a.y,a.r+14,a.r+14)),t:[1.2,2.9],dash:[6,6]},
  {p:mkPath(target.map(p=>[p[0],p[1]-10])),t:[0.8,2.6],dash:[8,8]}]}
/* ---------- needle and local anaesthetic ---------- */
const TENT=24;
// pass: one needle advance along NS->NT, through target (x-sorted line) or not. o: {u0,a,c,p,e,tent}
// a: start, c: contact with the target, p: pop, e: reach NT. Without a target the tip eases u0 -> 1 over a..e.
function pass(NS,NT,target,o){
  const L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L],TN=o.tent??TENT;
  let uc=null;if(target)for(let u=Math.max(o.u0,.2);u<=1;u+=.0005){const q=along(NS,NT,u);if(q[0]>=target[0][0]&&q[0]<=target[target.length-1][0]&&q[1]>=yAt(target,q[0])){uc=u;break}}
  const ut=uc==null?1:Math.min(uc+TN/L,.999),P=uc==null?1:Math.min(1,ut+12/L),tp=o.p+.135;
  const after=t=>TN*Math.exp(-(t-tp)*9)*(reduceMotion?1:Math.cos((t-tp)*26));
  return{NS,NT,L,D,uc,target,Pc:uc==null?null:along(NS,NT,uc),
    at(t){
      let u,sh=0,tent=0;
      if(t<o.a)u=o.u0;
      else if(uc==null)u=lerp(o.u0,1,ease(seg(t,o.a,o.e)));
      else if(t<o.c)u=lerp(o.u0,uc,ease(seg(t,o.a,o.c)));
      else if(t<o.p){const q=seg(t,o.c,o.p);u=lerp(uc,ut,1-Math.pow(1-q,1.6));sh=reduceMotion?0:Math.sin(t*41)*.7*q;tent=(u-uc)*L}
      else if(t<o.p+.45){const r=pop(t,o.p,ut,P,2.5);u=r.u;sh=r.sh;tent=t<tp?TN:after(t)}
      else{u=lerp(P,1,ease(seg(t,o.p+.45,o.e)));tent=after(t)}
      const tip=along(NS,NT,u);if(sh&&!reduceMotion){tip[0]+=D[0]*sh;tip[1]+=D[1]*sh}
      return{u,tip,tent:Math.abs(tent)>.05?tent:0};
    }};
}
// line through a common skin entry E: NS sits off-canvas behind E, so redirects pivot about the skin puncture
const E0=[1298,147];
function lineE(NT,ext=300){const d=[NT[0]-E0[0],NT[1]-E0[1]],l=Math.hypot(...d);return{NS:[E0[0]-d[0]/l*ext,E0[1]-d[1]/l*ext],NT,ext,l}}
const uAtD=(ln,d)=>(ln.ext+d)/(ln.ext+ln.l);
// aliquots: segs [[t0,t1,mL],...]; paused = between two segments of the same target
function volume(t,segs){let v=0;segs.forEach(([a,b,m])=>{v+=m*ease(seg(t,a,b))});
  const paused=segs.some(([a,b],i)=>i<segs.length-1&&segs[i+1][3]!=='new'&&t>b&&t<segs[i+1][0]);return{v,paused}}
const win=(x,x0,x1,r0=16,r1=r0)=>Math.sqrt(clamp((x-x0)/r0))*Math.sqrt(clamp((x1-x)/r1));
const ellLow=(x,cx,cy,rx,ry)=>{const d=(x-cx)/rx;return Math.abs(d)>=1?-1e9:cy+ry*Math.sqrt(1-d*d)};
/* spread: LA collected along a fascial line between x0 and x1. top = line - lift, bottom = max(top, bot) tapered at
   the fronts. lift also deforms the line itself (sartorius floor, VAM, fascia lata), so the plane opens visibly. */
function pocket(line,sp){
  if(!sp||sp.x1-sp.x0<4)return null;const top=[],D=[],X=[];
  for(let x=sp.x0;x<=sp.x1+.1;x+=3){const y=yAt(line,x),T=y-sp.lift(x);X.push(x);top.push([x,T]);D.push(Math.max(0,sp.bot(x)-T))}
  // the bottom run is built from overlapping ellipse terms, so it steps at each ellipse edge. Fill the notches
  // (soft dilation, never shallower), then round the corners, so the pool reads as one smooth lens.
  const n=D.length,cap=i=>sp.botMax?Math.max(0,sp.botMax(X[i])-top[i][1]):1e9;
  for(let k=0;k<10;k++){const E=D.slice();for(let i=1;i<n-1;i++)D[i]=Math.min(cap(i),Math.max(E[i],(E[i-1]+2*E[i]+E[i+1])/4))}
  for(let k=0;k<4;k++){const E=D.slice();for(let i=1;i<n-1;i++)D[i]=Math.min(cap(i),(E[i-1]+2*E[i]+E[i+1])/4)}
  const b=top.map((p,i)=>[p[0],p[1]+D[i]*win(X[i],sp.x0,sp.x1,20,16)]);
  return top.concat(b.reverse());
}
// beneath sartorius in the vascular compartment (femoral triangle): wraps the saphenous nerve and the artery roof,
// tracks down the artery's lateral wall; the lateral front stops at the NVM septum.
function subSart(G,n,I,k){
  if(k<=0)return null;const A=G.art,sk=Math.sqrt(k),e=ease(clamp(k/.85));
  const x1=Math.min(838,I[0]+14+30*sk),x0=lerp(I[0]-16,A.x-A.r-8,e),xc=lerp(I[0]-4,n.x,.6),Tm=40*Math.pow(k,.6);
  const lift=x=>win(x,x0,x1,22,10)*Math.max(3+4*sk,Tm*bump((x-xc)/(x<xc?Math.max(40,xc-x0+10):Math.max(26,x1-xc+8))));
  const bot=x=>Math.max(yAt(G.floor,x)+3,ellLow(x,n.x,n.y,n.rx+12,n.ry+10),ellLow(x,A.x,A.y-A.r*.3-10,A.r+14,10),
    ellLow(x,A.x+A.r*.6,A.y-12,A.r*.55+14,(494-A.y+12)*e),ellLow(x,I[0],I[1]+4,16+10*sk,10+6*sk));
  return{x0,x1,lift,bot};
}
// beneath the vastoadductor membrane (adductor canal): over the artery roof to surround the nerve medially, rim down the medial wall
function subVam(G,n,I,k){
  if(k<=0)return null;const A=G.art,sk=Math.sqrt(k),e=ease(clamp(k/.85));
  const x1=Math.min(805,I[0]+12+24*sk),x0=lerp(I[0]-14,n.x-n.rx-14,e),xc=lerp(I[0]-10,A.x,.5);
  const cap=x=>Math.max(0,yAt(G.vam,x)-yAt(G.floor,x)-5),Tm=18*Math.pow(k,.6);
  const lift=x=>Math.min(cap(x),win(x,x0,x1,18,10)*Math.max(3,Tm*bump((x-xc)/(x<xc?Math.max(40,xc-x0+8):Math.max(26,x1-xc+8)))));
  const bot=x=>Math.max(yAt(G.vam,x)+3,ellLow(x,n.x,n.y,n.rx+12,n.ry+10),ellLow(x,A.x,A.y-A.r*.3-10,A.r+14,10),
    ellLow(x,A.x-A.r*.62,A.y-10,A.r*.5+14,(512-A.y+10)*e),ellLow(x,A.x+A.r*.62,A.y-14,A.r*.5+12,(486-A.y+14)*e),
    ellLow(x,I[0],I[1]+4,16+10*sk,10+6*sk));
  return{x0,x1,lift,bot};
}
// NVM compartment: lateral to the septum, between sartorius and vastus medialis
function subNvm(G,n,I,k){
  if(k<=0)return null;const sk=Math.sqrt(k),e=ease(clamp(k/.85));
  const x0=lerp(I[0]-14,842,e),x1=lerp(I[0]+16,1075,e),xc=lerp(I[0],950,.5),Tm=24*Math.pow(k,.6);
  const lift=x=>win(x,x0,x1,10,24)*Math.max(3,Tm*bump((x-xc)/(x<xc?Math.max(30,xc-x0+8):Math.max(40,x1-xc+10))));
  const bot=x=>Math.min(yAt(G.vmRoof,x)-1,Math.max(yAt(G.floor,x)+6+22*sk*bump((x-xc)/(x1-x0+20)*2),ellLow(x,n.x,n.y,n.rx+10,n.ry+8)));
  return{x0,x1,lift,bot,botMax:x=>yAt(G.vmRoof,x)-1};
}
// beneath fascia lata, superficial to sartorius (AFCN plane; the wrong compartment for the saphenous nerve):
// a lens that lifts fascia lata (roof) off the sartorius roof (floor). kw: k at which the lens reaches full width.
function lensFL(G,I,k,Tmax,xa,xb,kw=.9){
  if(k<=0)return null;const sk=Math.sqrt(k),e=ease(clamp(k/kw));
  const x0=lerp(I[0]-14,xa,e),x1=lerp(I[0]+14,xb,e),xc=lerp(I[0],(xa+xb)/2,.6),Tm=Tmax*Math.pow(k,.6);
  const lift=x=>win(x,x0,x1,18,18)*Math.max(2,Tm*bump((x-xc)/(x<xc?Math.max(30,xc-x0+10):Math.max(30,x1-xc+10))));
  const bot=x=>Math.max(yAt(G.fl,x)+4,yAt(G.roof,x)-1);
  return{x0,x1,lift,bot,botMax:bot};
}
/* deform: copy of G with the LA lifts and the needle tent applied.
   L = {floor, vam, fl}: lift functions (x -> px). tent = {line:'floor'|'vam'|'fl', Pc, D, v} */
function deform(G,L,tent,n){
  const g=Object.assign({},G);g.flBase=G.fl;
  const lf=L.floor,tn=tent&&tent.v?tent:null;
  const tw=(p,name)=>{if(!tn||tn.line!==name)return p;const w=Math.exp(-Math.hypot(p[0]-tn.Pc[0],p[1]-tn.Pc[1])/34);return[p[0]+tn.D[0]*tn.v*w,p[1]+tn.D[1]*tn.v*w]};
  if(lf||(tn&&tn.line==='floor')){g.sart=G.sart.map((p,i)=>{let q=p;if(lf&&i>=56&&i<=126)q=[p[0],p[1]-lf(p[0])];return tw(q,'floor')});g.floor=g.sart.slice(56,127).reverse()}
  if(L.vam||(tn&&tn.line==='vam'))g.vam=G.vam.map(p=>tw(L.vam?[p[0],p[1]-L.vam(p[0])]:p,'vam'));
  g.flLift=L.fl||null;
  if(L.fl||(tn&&tn.line==='fl')){g.fl=G.fl.map(p=>tw(L.fl?[p[0],p[1]-L.fl(p[0])]:p,'fl'));
    g.afcn=G.afcn.map(a=>Object.assign({},a,{y:a.y-(L.fl?L.fl(a.x)*.55:0)}))}
  if(n)g.nerve=n;
  return g;
}
const maxF=(...f)=>{f=f.filter(Boolean);return f.length?x=>Math.max(...f.map(h=>h(x))):null};
/* ---------- scenarios ---------- */
function laAnchor(P,xmin,xmax,fb){
  if(!P)return fb;const n=P.length/2;let best=-1,pt=null;
  for(let i=0;i<n;i++){const a=P[i],b=P[P.length-1-i];if(a[0]<xmin||a[0]>xmax)continue;const th=b[1]-a[1];if(th>best){best=th;pt=[a[0],(a[1]+b[1])/2]}}
  return pt||fb;
}
// intramuscular LA: a contained swelling elongated along the oblique fibres, with streaks between them
function imLA(c0,v,OFF,ang,RX,RY){const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),ca=Math.cos(ang),sa=Math.sin(ang);
  const rot=P=>P.map(([x,y])=>[c0[0]+(x-c0[0])*ca-(y-c0[1])*sa,c0[1]+(x-c0[0])*sa+(y-c0[1])*ca]),P=[];
  for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,w=1+.12*Math.sin(a*3+1)+.06*Math.sin(a*5);P.push([c0[0]+Math.cos(a)*RX*sk*w,c0[1]+Math.sin(a)*RY*sk*w])}
  const st=[[-1,-2,12],[1,2,16],[-1,3,10],[1,-3,12]].map(([d,dy,len])=>{const x0=c0[0]+d*(RX-6)*sk,ln=len*sk;return rot(ellipsePts(x0+d*ln/2,c0[1]+dy*sk,ln/2,2*sk+.5,24))});
  return{x:c0[0],y:c0[1],rx:RX*sk,ry:RY*sk,ang,polys:[rot(P)].concat(st)}}
const LINE_FT=lineE([795,468]),NT_AC=[735,458],NS_AC=[1560,-40];
// correct single shot: one pass through sartorius, a pop at the target fascia (sartorius floor or VAM), two 5 mL aliquots
function positive(o){
  const G0=GEO[o.geo],tg=G0[o.target],TM=o.tm||{u0:.04,a:8.3,c:11.6,p:12.2,e:13.0},ps=pass(o.NS,o.NT,tg,TM);
  return Object.assign({p:o.geo==='ft'?PFT:PAC,Tend:23,vol:10,volT:12.4,magT:18,laT:14.6,drug:'Ropivacaine 0.4%',mgml:4,
    guides:[[along(o.NS,o.NT,.3),o.NT,7.6,12.6]],
    state(t){
      let na=0,tip=[-99,-99],tent=null;
      if(t>=TM.a){na=seg(t,TM.a,TM.a+.6);const r=ps.at(t);tip=r.tip;if(r.tent)tent={line:o.target,Pc:ps.Pc,D:ps.D,v:r.tent}}
      const I=volume(t,o.segs),k=I.v/10,n0=G0.nerve,n=Object.assign({},n0,{x:n0.x+o.disp[0]*k,y:n0.y+o.disp[1]*k});
      const sp=o.spread(G0,n,o.NT,k),L={};L[o.target]=sp?sp.lift:null;
      const la=pocket(tg,sp);
      return{G:deform(G0,L,tent,n),S:o.NS,tip,na,v:I.v,paused:I.paused,la:[la],laMain:la};
    }},o);
}
const SEG2=t0=>[[t0,t0+1.4,5],[t0+2,t0+3.4,5]];
const SC={};
SC.ft=positive({geo:'ft',target:'floor',NS:LINE_FT.NS,NT:LINE_FT.NT,segs:SEG2(13.1),disp:[-8,4],spread:subSart,pill:'Femoral triangle',
  subtitle:'Femoral triangle block, just proximal to the apex',
  mag:{CY:680,R:140,Z:1.6,focus:s=>[s.G.nerve.x-20,s.G.nerve.y-4],text:['Saphenous nerve lateral to the artery,','LA beneath sartorius']},
  la:[[1010,610,'left',s=>laAnchor(s.laMain,s.G.nerve.x+s.G.nerve.rx,840,[810,440]),'LA beneath sartorius']],
  caps:[[0,8.2,'1','Just proximal to the apex: saphenous nerve lateral to the femoral artery, deep to sartorius.'],
    [8.2,12.4,'2','In-plane from lateral, through sartorius. Its deep fascia tents, then gives beside the nerve.'],
    [12.4,14.4,'3','Tip lateral to the artery, beside the saphenous nerve. Aspirate before injecting.'],
    [14.4,18,'4','Ropivacaine 0.4% in 5 mL aliquots, aspirating between. LA lifts sartorius off the artery.'],
    [18,99,'5','10 mL, 40 mg: LA surrounds the nerve and the artery roof. Higher blocks risk more quadriceps weakness.']]});
SC.ac=positive({geo:'ac',target:'vam',NS:NS_AC,NT:NT_AC,segs:SEG2(13.1),disp:[-6,4],spread:subVam,pill:'Adductor canal',dga:true,
  subtitle:'Adductor canal block, distal to the apex',
  mag:{CY:680,R:140,Z:1.5,focus:s=>[s.G.art.x-10,s.G.art.y-30],text:['Under the vastoadductor membrane:','nerve anteromedial, LA over the artery']},
  la:[[1010,610,'left',s=>laAnchor(s.laMain,700,800,[740,450]),'LA beneath the membrane']],
  caps:[[0,8.2,'1','Distal to the apex: the vastoadductor membrane roofs the artery; the saphenous nerve lies anteromedial.'],
    [8.2,12.4,'2','In-plane from lateral, through sartorius. The tip tents, then pierces the vastoadductor membrane.'],
    [12.4,14.4,'3','Tip beneath the membrane, anterolateral to the artery. Check Doppler for the descending genicular artery.'],
    [14.4,18,'4','Ropivacaine 0.4% in 5 mL aliquots. LA spreads over the artery to surround the nerve medially.'],
    [18,99,'5','10 mL, 40 mg in the canal: saphenous nerve covered, quadriceps largely spared. The NVM may lie outside it.']]});
/* fixLedger: before tFix the counter shows the misplaced volume; from tFix it restarts for the corrected injection and
   the ledger lists misplaced + corrected volume and the total dose */
function fixLedger(label,off,tFix,drug,mgml){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL','Beneath sartorius: '+b.toFixed(1)+' mL',drug.replace('R','Total r')+': '+tot.toFixed(1)+' mL ('+Math.round(tot*mgml)+' mg)']}}}
const CAP1_FT=SC.ft.caps[0];
// negative 1: intramuscular sartorius. The tip stops just superficial to the deep sartorius fascia, 2 mL swells between fibres.
// Fix: advance along the same line through the deep fascia (tent, pop), then the planned 10 mL beneath sartorius.
(function(){
  const G0=GEO.ft,L=LINE_FT,uE=(()=>{let u=.5;for(;u<1;u+=.0005){const p=along(L.NS,L.NT,u);if(p[1]>=yAt(G0.floor,p[0])-16)break}return u})(),NTe=along(L.NS,L.NT,uE);
  const OFF=2,TW=18.6,TR=19.2,FXI=21.2;
  const err=pass(L.NS,NTe,null,{u0:.04,a:8.3,e:11.9}),fix=pass(L.NS,L.NT,G0.floor,{u0:uE,a:TR,c:19.9,p:20.4,e:21.0});
  SC.intraSart={p:PFT,pill:'Into sartorius',neg:true,fixT:TR,Tend:29.5,vol:10,volT:12.4,magT:26.5,laT:FXI+1.2,drug:'Ropivacaine 0.4%',mgml:4,
    subtitle:'Negative example: a common needle error',
    mag:{CY:672,R:150,Z:1.15,focus:()=>[812,432],text:['2 mL in sartorius,','10 mL beneath it']},
    la:[[1010,610,'left',s=>laAnchor(s.laMain,s.G.nerve.x+s.G.nerve.rx,840,[810,440]),'LA beneath sartorius',FXI+1.2]],
    guides:[[along(L.NS,L.NT,.3),NTe,7.6,11.6]],
    caps:[CAP1_FT,[8.2,12.8,'2','Error: the tip is close to the nerve but remains just inside sartorius, above its deep fascia.'],
      [12.8,17,'3','LA streaks between muscle fibres. Sartorius does not lift; nothing reaches the artery or nerve.'],
      [17,TR,'4','Error recognised: intramuscular injection. Stop after 2 mL.'],
      [TR,FXI+.7,'5','Fix: advance through the deep fascia of sartorius. A give; the tip lies lateral to the artery.'],
      [FXI+.7,26.5,'6','Ropivacaine 0.4%, the planned 10 mL, in 5 mL aliquots. Sartorius lifts off the artery.'],
      [26.5,99,'7','Total 12 mL, 48 mg: 2 mL in sartorius; 10 mL beneath it outlines the nerve and artery.']],
    ledger:fixLedger('Intramuscular',OFF,TR,'Ropivacaine 0.4%',4),
    state(t){
      const vIM=OFF*ease(seg(t,12.8,15.5)),im=imLA(NTe,vIM,OFF,-.12,24,6);
      let tip=[-99,-99],na=0,tent=null;
      if(t>=8.3){na=seg(t,8.3,8.9);if(t<TR)tip=err.at(t).tip;else{const r=fix.at(t);tip=r.tip;if(r.tent)tent={line:'floor',Pc:fix.Pc,D:fix.D,v:r.tent}}}
      const I=volume(t,SEG2(FXI)),k=I.v/10,n0=G0.nerve,n=Object.assign({},n0,{x:n0.x-8*k,y:n0.y+4*k});
      const sp=subSart(G0,n,L.NT,k),la=pocket(G0.floor,sp);
      return{G:deform(G0,{floor:sp?sp.lift:null},tent,n),S:L.NS,tip,na,v:t<TR?vIM:I.v,paused:I.paused,la:[la],laMain:la,im};
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+1.0,FXI+1.6);if(ok>0)cuePill(c,'Sartorius lifting: correct plane',1010,690,ok);return}
      const a1=seg(t,12.1,12.6)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Tip in sartorius: intramuscular',985,600,[s.tip[0]+4,s.tip[1]+22],a1)}
      const a2=seg(t,15.8,16.4)*f;
      if(a2>0)warnPill(c,'Sartorius not lifting',1010,645,[800,yAt(s.G.floor,800)],a2);
      const a3=seg(t,17.4,18)*f;
      if(a3>0)warnPill(c,'Stop at 2 mL',1010,690,null,a3);
    }};
})();
// TKR: one lateral skin entry, three tip positions, deep to superficial (saphenous, NVM, AFCN), ropivacaine 0.2%
(function(){
  const G0=GEO.ft,L1=LINE_FT,L2=lineE([912,448]),L3=lineE([1010,294]);
  const d1=371,d2=250,u1w=uAtD(L1,d1),u2s=uAtD(L2,d1),u2w=uAtD(L2,d2),u3s=uAtD(L3,d2);
  const p1=pass(L1.NS,L1.NT,G0.floor,{u0:.04,a:8.3,c:11.6,p:12.2,e:13.0});
  const p2=pass(L2.NS,L2.NT,G0.floor,{u0:u2s,a:18.5,c:19.1,p:19.4,e:20.0,tent:12});
  const p3=pass(L3.NS,L3.NT,G0.fl,{u0:u3s,a:25.1,c:25.6,p:25.85,e:26.3,tent:8});
  const S1=SEG2(13.1),S2=SEG2(20.1),S3=[[26.4,27.8,5]],ALL=S1.concat(S2.map((s,i)=>i?s:s.concat('new')),S3.map(s=>s.concat('new')));
  const vOf=(t,S)=>volume(t,S).v;
  SC.tkr={p:PFT,afcnPills:true,Tend:33,vol:25,volT:12.4,magT:28.6,laT:1e9,drug:'Ropivacaine 0.2%',mgml:2,
    subtitle:'TKR: three targets from one lateral entry',
    mag:{CY:670,R:155,Z:1.05,focus:()=>[832,392],text:['Three planes: beside the artery, around','the NVM, and beneath fascia lata','superficial to sartorius']},
    la:[],guides:[[along(L1.NS,L1.NT,.3),L1.NT,7.6,12.6],[along(L2.NS,L2.NT,u2s),L2.NT,17.6,19.6],[along(L3.NS,L3.NT,u3s),L3.NT,24.4,25.8]],
    caps:[[0,8.2,'1','Distal femoral triangle, near the apex: three targets for knee analgesia from one lateral entry.'],
      [8.2,17,'2','Target 1: tip lateral to the artery beside the saphenous nerve, deep to sartorius. 10 mL.'],
      [17,23.9,'3','Target 2: withdraw and redirect to the NVM, between sartorius and vastus medialis. 10 mL.'],
      [23.9,28.4,'4','Target 3: withdraw to beneath fascia lata, superficial to sartorius, for the AFCN. 5 mL.'],
      [28.4,99,'5','Ropivacaine 0.2% 25 mL, 50 mg: saphenous and NVM for the joint; AFCN for the anterior incision.']],
    ledger(s,t){if(t<13.1)return null;const v1=vOf(t,S1),v2=vOf(t,S2),v3=vOf(t,S3),L=['Saphenous nerve: '+v1.toFixed(1)+' mL'];
      if(t>=20.1)L.push('NVM: '+v2.toFixed(1)+' mL');if(t>=26.4)L.push('AFCN: '+v3.toFixed(1)+' mL');
      const tot=v1+v2+v3;L.push('Ropivacaine 0.2%: '+tot.toFixed(1)+' mL ('+Math.round(tot*2)+' mg)');return{a:seg(t,13.1,13.7),lines:L}},
    state(t){
      let tip=[-99,-99],na=0,tent=null,S=L1.NS;const tn=(P,line,r)=>{if(r.tent)tent={line,Pc:P.Pc,D:P.D,v:r.tent}};
      if(t>=8.3){na=seg(t,8.3,8.9);
        if(t<17){const r=p1.at(t);tip=r.tip;tn(p1,'floor',r)}
        else if(t<18)tip=along(L1.NS,L1.NT,lerp(1,u1w,ease(seg(t,17,18))));
        else if(t<18.5){const q=ease(seg(t,18,18.5));tip=along(along(L1.NS,L1.NT,u1w),along(L2.NS,L2.NT,u2s),q);S=along(L1.NS,L2.NS,q)}
        else if(t<23.9){const r=p2.at(t);tip=r.tip;S=L2.NS;tn(p2,'floor',r)}
        else if(t<24.7){tip=along(L2.NS,L2.NT,lerp(1,u2w,ease(seg(t,23.9,24.7))));S=L2.NS}
        else if(t<25.1){const q=ease(seg(t,24.7,25.1));tip=along(along(L2.NS,L2.NT,u2w),along(L3.NS,L3.NT,u3s),q);S=along(L2.NS,L3.NS,q)}
        else{const r=p3.at(t);tip=r.tip;S=L3.NS;tn(p3,'fl',r)}}
      const k1=vOf(t,S1)/10,k2=vOf(t,S2)/10,k3=vOf(t,S3)/5,I=volume(t,ALL);
      const n0=G0.nerve,n=Object.assign({},n0,{x:n0.x-8*k1,y:n0.y+4*k1}),m0=G0.nvm;
      const s1=subSart(G0,n,L1.NT,k1),s2=subNvm(G0,m0,L2.NT,k2),s3=lensFL(G0,L3.NT,k3,18,790,1150,.5);
      const G=deform(G0,{floor:maxF(s1&&s1.lift,s2&&s2.lift),fl:s3?s3.lift:null},tent,n);
      G.nvm=Object.assign({},m0,{x:m0.x+4*k2,y:m0.y+3*k2});
      return{G,S,tip,na,v:I.v,paused:I.paused,la:[pocket(G0.floor,s1),pocket(G0.floor,s2),pocket(G0.fl,s3)]};
    }};
})();
/* Find the apex: scanning scenario, no needle. pAt(t) drives both the cross-section morph and the probe on the thigh.
   Holds: femoral triangle block level, apex, adductor canal, then back to the femoral triangle level. */
function pAt(t){
  if(t<8.3)return 0;if(t<11.5)return lerp(0,PFT,ease(seg(t,8.3,11.5)));if(t<14)return PFT;
  if(t<16.5)return lerp(PFT,.6,ease(seg(t,14,16.5)));if(t<20)return .6;if(t<23)return lerp(.6,1,ease(seg(t,20,23)));
  if(t<25)return 1;return lerp(1,PFT,ease(seg(t,25,27.5)));
}
SC.scan={p:0,scan:true,Tend:29,vol:0,volT:1e9,magT:16.9,laT:1e9,drug:'',mgml:0,hint:'Press play to scan',
  subtitle:'Scanning: find the apex of the femoral triangle',
  mag:{CX:262,CY:652,R:122,Z:1.7,until:20,focus:s=>[s.G.sartC[0][0]+6,354],extra:(c,s)=>apexGuide(c,s,1),text:['Apex: medial borders of','sartorius and adductor longus meet']},
  la:[],guides:[],
  caps:[[0,8.3,'1','Transverse on the anteromedial thigh. The femoral artery lies at the medial edge of sartorius; vein beneath.'],
    [8.3,11.5,'2','Slide distally, tracking the artery. Sartorius drifts medially across it; adductor longus lies medial.'],
    [11.5,14,'3','Proximal to the apex the saphenous nerve lies lateral to the artery; the NVM lies further lateral.'],
    [14,20,'4','Apex: the medial border of sartorius meets the medial border of adductor longus. The triangle ends here.'],
    [20,25,'5','Distal to the apex the vastoadductor membrane roofs the artery; the saphenous nerve lies anteromedial.'],
    [25,99,'6','Above the apex: femoral triangle block. Below it: adductor canal block. Where the nerve crosses varies.']],
  state(t){const p=pAt(t);return{G:geoAt(p),p,S:[0,0],tip:[-99,-99],na:0,v:0,la:[]}},
  warnings(c,t,s){
    const a=seg(t,16.3,16.9)*(1-seg(t,19.8,20.4));if(a<=0)return;apexGuide(c,s,a);
    cuePill(c,'Apex: medial borders meet',120,200,a);
  }};
function apexGuide(c,s,a){
    const top=s.G.sartC[0],bot=s.G.alC[0],K='143,67,29';
    c.save();c.globalAlpha*=a;c.strokeStyle=`rgb(${K})`;c.lineWidth=2.2;c.setLineDash([7,6]);c.beginPath();c.moveTo(top[0],top[1]-14);c.lineTo(bot[0],bot[1]+14);c.stroke();c.setLineDash([]);
    [top,bot].forEach(q=>{c.beginPath();c.arc(q[0],q[1],6,0,Math.PI*2);c.fillStyle=`rgb(${K})`;c.fill()});c.restore();
}
const TABS={scan:['scan'],single:['ft','ac','intraSart'],tkr:['tkr']};
for(const k in SC){const s=SC[k];s.key=k;s.G0=geoAt(s.p);s.gd=guideSet(s.G0,s.p>=.9?s.G0.vam:s.G0.floor)}
function drawLA(c,s,fillA){
  if(s.im){const m=s.im;c.save();c.globalAlpha=fillA;
    // fibres pushed apart: pale gap and compressed fibre arcs around the swelling
    c.beginPath();c.ellipse(m.x,m.y,m.rx+9,m.ry+7,m.ang,0,Math.PI*2);c.fillStyle='rgba(248,226,206,.55)';c.fill();
    c.strokeStyle='rgba(92,50,30,.45)';c.lineWidth=1;[[12,8],[17,11],[23,14]].forEach(([dx,dy],i)=>{[0,Math.PI].forEach(a0=>{c.beginPath();c.ellipse(m.x,m.y,m.rx+dx,m.ry+dy,m.ang,a0+.35,a0+Math.PI-.35);c.globalAlpha=fillA*(.7-i*.18);c.stroke()})});
    c.restore()}
  (s.la||[]).concat(s.im?s.im.polys:[]).forEach(P=>{if(!P)return;
    const bb=bbox(P);
    c.save();c.globalAlpha=fillA;polyPath(c,P);
    const g=c.createLinearGradient(0,bb[1],0,bb[3]);g.addColorStop(0,`rgba(${C.la},.80)`);g.addColorStop(.6,`rgba(${C.la},.88)`);g.addColorStop(1,`rgba(${C.la},.74)`);
    c.fillStyle=g;c.fill();c.strokeStyle='rgba(78,31,14,.55)';c.lineWidth=1.2;c.stroke();c.restore()});
}
// live fascial lines: fascia lata (with its duplicature over sartorius), deep fascia of sartorius, NVM septum, VAM
function drawFascia(c,dT,G){
  c.save();c.lineJoin='round';c.lineCap='round';
  c.strokeStyle=C.ink;c.lineWidth=1.9;strokePartial(c,mkPath(G.fl),ease(seg(dT,1.5,3.3)));
  const fa=ease(seg(dT,3,4.4));
  if(G.afA>0&&fa>0){const A=G.afcn,B=G.flBase||G.fl,x0=A[0].x-70,x1=A[1].x+50,P=[];
    const runs=[[]];for(let x=x0;x<=x1;x+=4){if(G.flLift&&G.flLift(x)>1.2){if(runs[runs.length-1].length)runs.push([]);continue}
      let y=yAt(B,x)+6;A.forEach(a=>{y+=(a.ry+2)*bump((x-a.x)/(a.rx+9))});runs[runs.length-1].push([x,y])}
    c.globalAlpha=.5*G.afA*fa;c.lineWidth=1;runs.forEach(P=>{if(P.length>1)strokePartial(c,mkPath(P),1)});c.globalAlpha=1}
  const ra=(1-seg(G.p,.6,.9))*fa;
  if(ra>0){c.globalAlpha=ra;c.lineWidth=2.2;c.beginPath();let f=true;G.floor.forEach(p=>{if(p[0]<640||p[0]>880)return;f?c.moveTo(p[0],p[1]):c.lineTo(p[0],p[1]);f=false});c.stroke();c.globalAlpha=1}
  if(G.septA>0&&fa>0){const y0=yAt(G.floor,835),y1=yAt(G.vmRoof,830);c.globalAlpha=.6*G.septA*fa;c.lineWidth=1.2;c.beginPath();c.moveTo(835,y0+1);c.quadraticCurveTo(840,(y0+y1)/2,830,y1-1);c.stroke();c.globalAlpha=1}
  if(G.vamA>0){c.globalAlpha=G.vamA;const vp=mkPath(G.vam),p=ease(seg(dT,1.7,3.6));c.strokeStyle='rgba(255,251,244,.85)';c.lineWidth=6;strokePartial(c,vp,p);c.strokeStyle=C.ink;c.lineWidth=2.4;strokePartial(c,vp,p)}
  c.restore();
}
function drawGuides(c,s,dT){
  const fade=dT<4?1:lerp(1,.32,seg(dT,4,6.5)),G=cur.G0;
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  cur.gd.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  // depth ruler: 130 px per cm from the skin (y 147), minor tick every 5 mm
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=10;i++){if(i/10>tp)break;const y=147+i*65,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke();if(i){c.fillStyle=`rgba(${C.guide},.72)`;c.font='400 13px Inter, system-ui, sans-serif';c.fillText((i/2)+' cm',56,y+4)}}}
  const cp=seg(dT,1.4,2.6);
  if(cp>0&&!cur.scan){c.globalAlpha=cp;[[G.nerve.x,G.nerve.y],[G.vein.x,G.vein.y],[G.art.x,G.art.y]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}
function outlines(G){return[
  {P:SKIN_TOP,t:[1.1,2.9],w:2.2},{P:SKIN_DEEP,t:[1.3,3.1],w:1.1,a:.55},
  {P:G.am,t:[2.1,4.1],w:1.7,a:.8,dbl:.975},{P:G.gr,t:[2.0,4.0],w:1.7,a:.8,dbl:.97},{P:G.al,t:[2.0,4.0],w:2.0,dbl:.97,al:G.alA},
  {P:G.vm,t:[2.2,4.4],w:1.7,a:.8,dbl:.98},{P:G.sart,t:[1.9,3.9],w:2.1,dbl:.95},{P:G.fem,t:[2.8,4.2],w:2.8,glow:true}]}
function drawDGA(c,fillA,lineP){const x=790,y=471,r=7;c.save();c.globalAlpha=fillA;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle='#4a2213';c.fill();c.lineWidth=3;c.strokeStyle='rgba(242,200,170,.95)';c.stroke();c.restore();
  c.strokeStyle=C.ink;c.lineWidth=1.4;strokePartial(c,mkPath(ellipsePts(x,y,r+2,r+2,30)),lineP)}
function core(c,s,sub){
  const G=s.G,dT=s.dT,t=s.t;
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  drawTissue(c,G,texA);
  const ba=ease(seg(dT,6.3,7.8));
  if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(BEAM[0],BEAM[1],BEAM[2],652);c.restore()}
  if(!sub)drawGuides(c,s,dT);
  c.save();c.lineJoin='round';c.lineCap='round';
  outlines(G).forEach(o=>{const p=ease(seg(dT,o.t[0],o.t[1])),path=mkPath(o.P);if(o.al===0)return;c.save();if(o.al!==undefined)c.globalAlpha=o.al;
    if(o.glow){c.strokeStyle='rgba(255,251,244,.95)';c.lineWidth=8;strokePartial(c,path,p)}
    c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,path,p);
    if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,mkPath(shrink(o.P,o.dbl)),ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}c.restore()});
  c.restore();
  drawLA(c,s,texA);
  drawFascia(c,dT,G);
  const vp=ease(seg(dT,3.0,4.4)),np=ease(seg(dT,3.2,4.4));
  drawVessels(c,G,texA,vp,s.clock);
  if(cur.dga)drawDGA(c,texA,vp);
  drawNerve(c,G.nerve,FAS.saph,14,texA,np);
  c.save();c.globalAlpha=G.nvmA;drawNerve(c,G.nvm,FAS.nvm,12,texA,np);c.restore();
  if(G.afA>0){c.save();c.globalAlpha=G.afA;G.afcn.forEach(a=>drawNerve(c,a,FAS.af,9,texA,np));c.restore()}
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,mkPath(PROBE),ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke()}
  c.restore();
  // orientation marker
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    c.textAlign='left';c.fillText('Medial',540,130);c.textAlign='right';c.fillText('Lateral',1000,130);c.restore()}
  if(!sub)cur.guides.forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}
// label pills: [text, x, y, align, anchor(s), visibility(s)]. Anchors follow the (morphing) structures.
const PILLS=[
  ['Fascia lata',300,250,'right',s=>[330,yAt(s.G.fl,330)]],
  // saphenous nerve: labelled from lateral while it lies lateral to the artery, from medial once it has crossed
  // in the scan (no needle) from lateral; in needle scenarios from upper medial so the leader never crosses the shaft
  ['Saphenous nerve',1010,404,'left',s=>[s.G.nerve.x+s.G.nerve.rx-3,s.G.nerve.y-3],s=>cur.scan?1-seg(s.G.p,.6,.72):0],
  ['Saphenous nerve',600,388,'right',s=>[s.G.nerve.x-3,s.G.nerve.y-s.G.nerve.ry+1],s=>cur.scan?0:1-seg(s.G.p,.6,.72)],
  ['Saphenous nerve',455,438,'right',s=>[s.G.nerve.x-s.G.nerve.rx+3,s.G.nerve.y],s=>seg(s.G.p,.72,.88)],
  ['Femoral artery',540,520,'right',s=>[s.G.art.x-s.G.art.r-5,s.G.art.y+8]],
  ['Femoral vein',575,650,'right',s=>[s.G.vein.x-s.G.vein.rx+4,s.G.vein.y+6],s=>1-magAlpha(s.t)],
  ['Nerve to vastus medialis',1100,500,'left',s=>[s.G.nvm.x+s.G.nvm.rx-1,s.G.nvm.y+4]],
  ['Vastoadductor membrane',1010,560,'left',s=>[800,yAt(s.G.vam,800)],s=>seg(s.G.vamA,.55,.9)],
  ['Medial femoral cutaneous nerve',560,200,'right',s=>[s.G.afcn[0].x-6,s.G.afcn[0].y-2],s=>cur.afcnPills?s.G.afA:0],
  ['Intermediate femoral cutaneous nerve',1180,392,'left',s=>[s.G.afcn[1].x+3,s.G.afcn[1].y+s.G.afcn[1].ry],s=>cur.afcnPills?s.G.afA:0],
  ['Descending genicular artery',1010,660,'left',()=>[797,476],()=>cur.dga?1:0],
];
function drawLabels(c,s){
  const G=s.G,a=ease(seg(s.dT,5.8,7));if(a<=0)return;const L=G.lab;
  muscleLabel(c,'Sartorius',L.sart[0],L.sart[1],a);muscleLabel(c,'Adductor longus',L.al[0],L.al[1],a*G.alA);
  muscleLabel(c,'Adductor magnus',L.am[0],L.am[1],a);muscleLabel(c,'Gracilis',L.gr[0],L.gr[1],a);muscleLabel(c,'Vastus medialis',L.vm[0],L.vm[1],a);
  const m=G.fem[0];c.save();c.globalAlpha=a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText('Femur',m[0]-12,m[1]+6);c.restore();
  PILLS.forEach(([txt,x,y,al,anc,vis])=>{const v=vis?vis(s):1;if(v>0)pill(c,txt,x,y,al,anc(s),a*v)});
  (cur.la||[]).forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;if(la>0)pill(c,L[4]||'Local anaesthetic',L[0],L[1],L[2],L[3](s),la)});
}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('Adductor canal block',60,74);
  c.fillStyle=cur.neg?RED:'#7a6456';c.font='400 18px Inter, system-ui, sans-serif';c.fillText(cur.subtitle,62,104);
  c.restore();
  const va=seg(t,cur.volT,cur.volT+.6);
  if(va>0){c.save();c.globalAlpha=va;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText(cur.drug,62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const vt=(s.v||0).toFixed(1)+' / '+cur.vol+' mL';c.fillText(vt,212,142);
    const sfx=s.paused?'aspirate':cur.fixT!=null&&t>=cur.fixT?'corrected':'';
    if(sfx){const w=c.measureText(vt).width;c.fillStyle='#7a6456';c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText(sfx,212+w+12,141)}
    c.restore()}
  // optional volume ledger, bottom right clear of the needle
  const lg=cur.ledger&&cur.ledger(s,t);
  if(lg&&lg.a>0){c.save();c.globalAlpha=lg.a;c.textAlign='right';c.font='400 16px Inter, system-ui, sans-serif';const y0=768-Math.max(0,lg.lines.length-3)*25;
    let wm=0;lg.lines.forEach(l=>{wm=Math.max(wm,c.measureText(l).width)});c.fillStyle='rgba(244,236,225,.82)';c.beginPath();c.roundRect?c.roundRect(1540-wm-12,y0-19,wm+24,lg.lines.length*25+8,8):c.rect(1540-wm-12,y0-19,wm+24,lg.lines.length*25+8);c.fill();
    lg.lines.forEach((l,i)=>{const last=i===lg.lines.length-1;c.fillStyle=last?'#8f431d':'#7a6456';if(last)c.font='500 16px Inter, system-ui, sans-serif';c.fillText(l,1540,y0+i*25)});c.restore()}
  const cap=cur.caps.find(x=>t>=x[0]&&t<x[1])||cur.caps[cur.caps.length-1];
  const ca=Math.min(seg(t,cap[0],cap[0]+.6),1-seg(t,cap[1]-.5,cap[1]))*ease(seg(s.dT,.6,1.6));
  c.save();c.globalAlpha=Math.max(0,ca);
  c.fillStyle='#a8552a';c.font='500 26px Fraunces, Georgia, serif';c.fillText(cap[2],60,862);
  c.fillStyle=C.ink;c.font='italic 400 26px Fraunces, Georgia, serif';c.fillText(cap[3],92,862);c.restore();
  const ha=seg(s.dT,7.4,8.2)*(started?0:1);
  if(ha>0){c.save();c.globalAlpha=ha*(reduceMotion?1:.7+.3*Math.sin(s.clock*3));c.fillStyle='#a8552a';c.font='italic 400 22px Fraunces, Georgia, serif';c.textAlign='right';c.fillText(cur.hint||'Press play to see the needle',1540,74);c.restore()}
}
function magAlpha(t){const M=cur.mag,t0=cur.magT;return M?seg(t,t0,t0+.6)*(M.until?1-seg(t,M.until,M.until+.6):1):0}
function drawMagnifier(c,s){
  const t=s.t,M=cur.mag,t0=cur.magT,a=magAlpha(t);if(a<=0)return;
  const CX=M.CX||300,CY=M.CY,R=M.R,Z=M.Z,F=M.focus(s),FR=R/Z;
  c.save();c.globalAlpha=a;
  c.strokeStyle=`rgba(${C.guide},.8)`;c.lineWidth=1.1;const lp=ease(seg(t,t0,t0+.8));
  [-1,1].forEach(sg=>strokePartial(c,mkPath([[F[0],F[1]+sg*FR],[CX,CY+sg*R]]),lp));
  c.setLineDash([4,5]);c.beginPath();c.arc(F[0],F[1],FR,0,Math.PI*2);c.stroke();c.setLineDash([]);
  const ca=ease(seg(t,t0+.6,t0+1.6));
  c.save();c.beginPath();c.arc(CX,CY,R,0,Math.PI*2);c.clip();c.fillStyle=C.paper;c.fillRect(CX-R,CY-R,R*2,R*2);
  c.globalAlpha=a*ca;c.translate(CX,CY);c.scale(Z,Z);c.translate(-F[0],-F[1]);core(c,s,true);if(M.extra)M.extra(c,s);c.restore();
  c.strokeStyle=C.ink;c.lineWidth=2.6;strokePartial(c,mkPath(ellipsePts(CX,CY,R,R,90)),ease(seg(t,t0+.1,t0+1.1)));
  c.strokeStyle='rgba(43,30,24,.35)';c.lineWidth=1;strokePartial(c,mkPath(ellipsePts(CX,CY,R+7,R+7,90)),ease(seg(t,t0+.3,t0+1.3)));
  const ta=ease(seg(t,t0+1.8,t0+2.6));
  if(ta>0){c.globalAlpha=a*ta;c.font='italic 400 19px Fraunces, Georgia, serif';c.fillStyle=C.ink;const left=M.side==='left';c.textAlign=left?'right':'left';
    const lines=M.text;lines.forEach((l,i)=>c.fillText(l,left?CX-R-22:CX+R+22,CY+R-10-(lines.length-1-i)*24))}
  c.restore();
}
/* ---------- probe position view ----------
   SURF: the whole right thigh drawn horizontally, anterior view, patient supine, head to screen LEFT, knee RIGHT.
   The patient's MEDIAL side is screen TOP, LATERAL is screen BOTTOM. cm = surface px per cm.
   The probe is transverse to the thigh (vertical on screen, rot -90°): +a (medial) points up, the marker and the
   lateral end are at the bottom, so the in-plane needle enters from the bottom (lateral) and travels up (medial).
   Scan mapping: axial position (scanCx - scan x) / scanCm cm from the probe centre (+ = medial). */
const SURF={
  cm:30,scanCx:770,scanCm:130,skinY:147,probeLen:4.0,probeW:1.1,needleLen:5.0,
  view:'Right thigh, anterior view (head to the left)',viewAt:[1540,128],
  asis:[180,600],pubTub:[265,245],
  ligament:[[180,600],[200,500],[228,400],[252,300],[265,245]],
  medial:[[300,190],[600,215],[900,250],[1200,290],[1470,310]],
  lateral:[[210,680],[600,670],[900,645],[1200,610],[1470,590]],
  hip:[[210,680],[165,600],[150,470],[175,330],[230,240],[300,190]],
  knee:[[1470,310],[1535,355],[1558,450],[1535,545],[1470,590]],
  patella:[1470,450,55,70],
  pulse:[234,400],artery:[[234,400],[560,400],[880,385],[1220,330]],
  sartorius:[[[205,612],[600,545],[1000,430],[1400,330]],[[195,585],[520,490],[880,375],[1380,285]]],
  alBorder:[[270,245],[560,300],[880,375]],apex:[880,375],
  triangle:[[180,600],[200,500],[228,400],[252,300],[265,245],[270,245],[560,300],[880,375],[520,490],[195,585]],
  fades:[[110,175,1,0],[720,800,0,1]],
  probe(t,s){const k=ease(seg(s.dT,2.4,4)),x=kv(K.probeX,cur.scan?pAt(t):cur.p);return{x,y:yAt(this.artery,x)+(1-k)*70,rot:-Math.PI/2,a:k}},
  pills:[['ASIS',150,650,'right',c=>c.asis],['Pubic tubercle',90,200,'left',c=>c.pubTub],
    ['Inguinal ligament',300,565,'right',()=>[199,503]],['Femoral artery pulse',300,330,'left',c=>c.pulse],
    ['Apex of femoral triangle',1060,226,'left',c=>[c.apex[0]+5,c.apex[1]-6]],
    ['Probe: transverse on the anteromedial thigh',1000,170,'left',(c,P)=>P(1.6,.6)]],
  muscles:[['Sartorius',520,534],['Adductor longus',470,262],['Femoral triangle',440,458],['Adductor canal',1130,372]],
};
// drawSurface: hand-drawn anterior surface view with probe and in-plane needle at the time in s
function drawSurface(c,s,cfg){
  const dT=s.dT,lp=ease(seg(dT,.6,2.8)),ink='rgba(43,30,24,';
  const line=(P,w,a,p=lp,dash)=>{c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink+a+')';c.lineWidth=w*(cfg.lw||1);if(dash)c.setLineDash(dash);strokePartial(c,mkPath(spline(P,false)),p);c.restore()};
  // skin
  const body=spline(cfg.hip,false).concat(spline(cfg.medial,false),spline(cfg.knee,false),spline(cfg.lateral.slice().reverse(),false));
  c.save();c.globalAlpha=ease(seg(dT,1.2,3));polyPath(c,body);const g=c.createLinearGradient(0,180,0,700);g.addColorStop(0,'rgba(243,223,204,.9)');g.addColorStop(1,'rgba(243,223,204,.45)');c.fillStyle=g;c.fill();c.restore();
  const la=ease(seg(dT,2,3));
  c.save();c.globalAlpha=.07*la;polyPath(c,spline(cfg.triangle,true,8));c.fillStyle='#a8552a';c.fill();c.restore();
  line(cfg.medial,2.2,.9);line(cfg.lateral,2.2,.9);line(cfg.hip,1.6,.55);line(cfg.knee,1.8,.7);
  const [qx,qy,qa,qb]=cfg.patella;c.save();c.globalAlpha=lp;c.strokeStyle=ink+'.4)';c.lineWidth=1.3*(cfg.lw||1);c.setLineDash([5,6]);c.beginPath();c.ellipse(qx,qy,qa,qb,0,0,Math.PI*2);c.stroke();c.restore();
  cfg.sartorius.forEach(P=>line(P,1.2,.34));
  line(cfg.alBorder,1.2,.34);
  line(cfg.ligament,2.4,.85,ease(seg(dT,1.4,3.2)));
  line(cfg.artery,1.6,.38,ease(seg(dT,2,3.6)),[8,6]);
  // soft top and bottom edges
  cfg.fades.forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,y0,W,y1-y0+(a1?100:0))});
  // landmarks
  c.save();c.globalAlpha=la;c.strokeStyle=C.ink;c.lineWidth=1.6;[cfg.asis,cfg.pubTub].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
  c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r,0,Math.PI*2);c.stroke()});c.restore();
  // probe
  const pr=cfg.probe(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];   // a along the probe (+ medial), o across it (+ distal)
  const hl=cfg.probeLen/2,hw=cfg.probeW/2;
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const cab=[P(hl+.1,0),P(hl+1.1,-.2),P(hl+1.9,-1.1),P(hl+2.5,-2.3)];c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();c.roundRect?c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,10):c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,3);c.lineTo(hl*cm,3);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the lateral end, matching "Lateral" on the scan
    c.beginPath();c.arc(-hl*cm+8,-hw*cm+8,4.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='left';c.textBaseline='middle';
      const L=P(-hl-.15,hw+.45),M=P(hl+.15,hw+.45);c.fillText('Lateral',L[0],L[1]);c.fillText('Medial',M[0],M[1]);c.restore()}}
  // apex of the femoral triangle: copper ring over the probe
  c.save();c.globalAlpha=la*.95;c.strokeStyle='#8f431d';c.lineWidth=2;c.beginPath();c.arc(cfg.apex[0],cfg.apex[1],8,0,Math.PI*2);c.stroke();c.restore();
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
  if(a>0){cfg.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](cfg,P),a));cfg.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a*.8));
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,cfg.viewAt[0],cfg.viewAt[1]);c.restore()}
}
// small picture-in-picture of drawSurface: during the intro, and for the whole scan in the Find the apex tab
const INSET={x:1236,y:96,w:300,h:190,src:[140,55,1200]};   // src: crop left, top, width (canvas px of the surface view)
function drawInset(c,s){
  const a=seg(s.dT,1,1.6)*(cur.scan?1:1-seg(s.dT,6.8,7.5));if(a<=0||(started&&!cur.scan))return;
  const I=INSET,k=I.w/I.src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-I.src[0],-I.src[1]);drawSurface(c,Object.assign({},s,{dT:9,na:0}),Object.assign({},SURF,{labels:false,inset:true,lw:2.4}));c.restore();
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  c.fillStyle='rgba(251,247,241,.9)';c.fillRect(I.x+1,I.y+1,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',I.x+9,I.y+14);c.restore();
}
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
  curScen: {scan:'scan', single:'ft', tkr:'tkr'},
  defaultTab: 'scan',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  aria(P){return P.probeView?'Probe position on the right thigh for the adductor canal block':'Animated ultrasound-guided adductor canal and femoral triangle block'}
};
});
