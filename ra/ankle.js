/* Ankle block: block module for ra.html (ported from ankle.html; contract in guides/ra-block-pages/single-page-spec.md).
   The build body is the page's script in page order, minus the engine helpers and the player.
   Own copies kept (they differ from the engine): makeFascicles (6000 tries, 1.6 spacing), drawNerve, cuePill (anchor arg). */
RA.register('ankle', {
  title: 'Ankle block',
  tabsLabel: 'Ankle surface',
  tabs: [['medial', 'Medial', 'Tibial and saphenous'],
         ['anterior', 'Anterior', 'Deep peroneal'],
         ['lateral', 'Lateral', 'Superficial peroneal and sural']],
  pills: null,
  probe: true,
  notes: `<p class="note">Every view uses one convention: the probe marker sits on the needle end, shown on screen right, and both ends are labelled. Many machines put the screen marker top left by default, so tap one end of the probe to check before you start.</p>
<p class="note">Block the tibial nerve first: its onset is the slowest. Shown here: tibial 5 mL, then 3 mL each for the deep peroneal, superficial peroneal, sural and saphenous nerves, 17 mL of ropivacaine 0.5% (85 mg) in all.</p>`,
  tips: `
<p class="lede">Practical points from trials, reviews and technique references. Tags point to the sources below.</p>
<h3>Scanning</h3>
<ul>
  <li>If you cannot tell the tibial nerve from a neighbouring tendon, slide the probe proximally: tendons turn into muscle bellies, while the nerve keeps the same honeycomb look.<span class="tag">NYSORA</span></li>
  <li>Ask the patient to flex and extend the big toe: flexor hallucis longus slides and the tibial nerve rocks in a see-saw over it, which marks the nerve when it blends into the tunnel.<span class="tag">Sehmbi 2021</span></li>
  <li>Scan the tibial nerve 5 to 10 cm above the medial malleolus rather than on it: the bony prominence breaks probe contact, and the higher level also catches the heel branches and covers an ankle tourniquet.<span class="tag">Moosa 2022</span></li>
</ul>
<h3>Injection</h3>
<ul>
  <li>Small ankle nerves soak up local anaesthetic quickly, so one well-placed deposit with gentle hydrodissection is enough; you do not need to redirect the needle to get spread all the way round.<span class="tag">NYSORA</span><span class="tag">Moosa 2022</span></li>
</ul>
<h3>Indication</h3>
<ul>
  <li>Fit the saphenous block to the operation: its territory stopped about 2 cm short of the first tarsometatarsal joint in bunion patients, so it can be left out for forefoot surgery, but ankle joint surgery needs a more proximal block because its joint branches leave above the ankle.<span class="tag">López 2012</span><span class="tag">Sehmbi 2021</span></li>
  <li>Ultrasound guidance is worth learning: across 655 patients, it gave surgical anaesthesia in 84% against 66% with landmarks and halved conversion to general anaesthesia, with the biggest benefit for less experienced operators.<span class="tag">Chin 2011</span></li>
</ul>
<h3>Safety</h3>
<ul>
  <li>Keep the tip off the tibial periosteum for the tibial and deep peroneal injections: injection under the periosteum is painful.<span class="tag">Sehmbi 2021</span></li>
  <li>An ankle block covers an ankle tourniquet but not a calf or thigh tourniquet; when the surgeon needs one higher up, plan a different anaesthetic and use the ankle block for analgesia.<span class="tag">Sehmbi 2021</span><span class="tag">Moosa 2022</span></li>
</ul>
<h3>Troubleshooting</h3>
<ul>
  <li>Do not assume the deep peroneal nerve lies lateral to the anterior tibial artery: in some people it runs on the medial side, so find the nerve on each scan before you choose which side of the artery to aim for.<span class="tag">NYSORA</span><span class="tag">Sehmbi 2021</span></li>
  <li>Spend most of your scanning time on the tibial nerve: in volunteers, ultrasound raised complete tibial block at 30 minutes from 22% to 72%, but deep peroneal success was no better than landmark from 20 minutes onwards.<span class="tag">Redborg 2009</span><span class="tag">Antonakakis 2010</span></li>
</ul>`,
  sources: `<ol>
  <li><b>NYSORA.</b> Ultrasound-guided ankle block. <a href="https://www.nysora.com/techniques/lower-extremity/ankle/ultrasound-guided-ankle-block/">nysora.com</a></li>
  <li><b>Sehmbi 2021.</b> Sehmbi H, Shah UJ, Uppal V. How I do it: ultrasound-guided ankle block. <i>ASRA News</i>, May 2021. <a href="https://asra.com/news-publications/asra-newsletter/newsletter-item/asra-news/2021/05/01/how-i-do-it-ultrasound-guided-ankle-block">asra.com</a></li>
  <li><b>Moosa 2022.</b> Moosa F, Allan A, Bedforth N. Regional anaesthesia for foot and ankle surgery. <i>BJA Education</i> 2022. <a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9596281">PMC9596281</a></li>
  <li><b>López 2012.</b> López AM, Sala-Blanch X, et al. Ultrasound-guided ankle block for forefoot surgery: the contribution of the saphenous nerve. <i>Reg Anesth Pain Med</i> 2012;37(5):554. <a href="https://rapm.bmj.com/content/37/5/554">rapm.bmj.com</a></li>
  <li><b>Chin 2011.</b> Chin KJ, Wong NW, Macfarlane AJ, Chan VW. Ultrasound-guided versus anatomic landmark-guided ankle blocks: a 6-year retrospective review. <i>Reg Anesth Pain Med</i> 2011;36(6):611-618. <a href="https://pubmed.ncbi.nlm.nih.gov/21941219/">PMID 21941219</a></li>
  <li><b>Redborg 2009.</b> Redborg KE, et al. Ultrasound improves the success rate of a tibial nerve block at the ankle. <i>Reg Anesth Pain Med</i> 2009;34(3):256-260.</li>
  <li><b>Antonakakis 2010.</b> Antonakakis JG, et al. Ultrasound does not improve the success rate of a deep peroneal nerve block at the ankle. <i>Reg Anesth Pain Med</i> 2010;35(2):217-221.</li>
</ol>`
}, function build(E) {
const {W,H,TS0,ctx,reduceMotion,rng,clamp,seg,ease,easeOut,lerp,along,spline,ellipsePts,mkPath,strokePartial,polyPath,shrink,bbox,hull,pop,yAt,bump,
  C,RED,PROBE,BEAM,LS,layer,paperC,lobules,fibres,planeLA,drawNeedle,guideLine,pill,muscleLabel,warnPill,ring}=E;
let cur,started,showLabels,probeView;   // mirrors of the player state, refreshed by sync() before every render

function arcPts(cx,cy,r,a0,a1,n=40){const o=[];for(let i=0;i<=n;i++){const a=lerp(a0,a1,i/n);o.push([cx+r*Math.cos(a),cy+r*Math.sin(a)])}return o}

// a smooth line through x-sorted control points, sampled every st px (same x grid for every level, so lines can morph)
function xsample(P,x0=20,x1=1580,st=4){const S=spline(P,false),o=[];for(let x=x0;x<=x1;x+=st)o.push([x,yAt(S,x)]);return o}

/* ---------- scan geometry ----------
   Transverse (short-axis) scans with a small-footprint linear probe. Isotropic 200 px per cm: the beam
   (x 517 to 1016) shows 2.5 cm across and about 3.3 cm of depth; probe face at y 147, probe centre x 766.
   One convention on every view: screen right = probe-marker end = needle side (in-plane needle from the right).
   Each view lists its end labels in G.ends: [screen left, screen right]. */

const PROBE_PATH=mkPath(PROBE);
const PXCM=200;
const SKT=[[20,180],[300,160],[517,147],[766,146],[1016,147],[1300,160],[1580,180]];
const SKD=[[30,192],[300,181],[560,168],[766,166],[1000,168],[1300,181],[1570,192]];
function makeFascicles(n,rx,ry,seed,smin=3,srange=5.5,pad=[12,11]){
  const r=rng(seed),out=[];let tries=0;
  while(out.length<n&&tries<6000){tries++;
    const x=(r()*2-1)*(rx-pad[0]),y=(r()*2-1)*(ry-pad[1]);
    if((x*x)/((rx-pad[0])**2)+(y*y)/((ry-pad[1])**2)>1)continue;
    const s=smin+r()*srange;if(out.some(f=>Math.hypot(f.x-x,f.y-y)<f.s+s+1.6))continue;
    const wob=[];for(let i=0;i<9;i++)wob.push(.72+r()*.5);out.push({x,y,s,wob,ring:r()<.55});
  }
  return out;
}
function mkNerve(x,y,rx,ry,n,seed,o={}){
  const F=makeFascicles(n,rx,ry,seed,o.smin??Math.max(1.3,rx*.045),o.sr??Math.max(1,rx*.05),o.pad??[Math.max(4,rx*.17),Math.max(3.5,ry*.24)]);
  return{x,y,rx,ry,F,bx:rx,by:ry,alpha:o.alpha||1};
}
// tendon: bright fibrillar oval, cut across its fibres (fine hatching, as femoral's psoas tendon)
function mkTendon(x,y,rx,ry,seed,o={}){const r=rng(seed),h=[],n=Math.max(8,Math.round(ry*2/1.6));
  for(let i=0;i<n;i++)h.push([-ry+(i+.5)*(2*ry/n)+(r()-.5)*.8,r()<.5,(r()-.5)*3]);return Object.assign({x,y,rx,ry,h},o)}
function muscle(tg,P,r,ang,n,la,lb,al=1){
  tg.save();polyPath(tg,P);const bb=bbox(P);const gr=tg.createLinearGradient(bb[0],bb[1],bb[2],bb[3]);gr.addColorStop(0,'#efcdb1');gr.addColorStop(1,'#e6b797');
  tg.globalAlpha=al;tg.fillStyle=gr;tg.fill();tg.clip();tg.lineWidth=26;tg.strokeStyle='rgba(176,96,56,.16)';polyPath(tg,P);tg.stroke();fibres(tg,P,ang,n,r,1,la,lb);tg.restore();
}
function fatFill(tg,P,r,rxa,rxb,rya,ryb,fill=C.fat,col='rgba(150,88,58,.28)'){tg.save();polyPath(tg,P);tg.fillStyle=fill;tg.fill();tg.clip();lobules(tg,P,r,rxa,rxb,rya,ryb,col);tg.restore()}
// bone: everything deep to the cortex is acoustic shadow (no tissue texture), darkest just under the bright line
function boneShadow(tg,cortex,str=1,depth=300){
  const P=cortex.concat([[cortex[cortex.length-1][0],900],[cortex[0][0],900]]),bb=bbox(cortex),y0=bb[1],y1=bb[3]+depth;
  tg.save();polyPath(tg,P);tg.clip();
  let g=tg.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(240,230,218,.95)');g.addColorStop(.7,'rgba(240,230,218,.8)');g.addColorStop(1,'rgba(240,230,218,0)');tg.fillStyle=g;tg.fillRect(0,0,W,H);
  g=tg.createLinearGradient(0,y0,0,y1);g.addColorStop(0,`rgba(96,56,36,${.24*str})`);g.addColorStop(.3,`rgba(96,56,36,${.11*str})`);g.addColorStop(1,'rgba(96,56,36,0)');
  tg.fillStyle=g;tg.fillRect(0,0,W,H);tg.restore();
}
// round bone (fibula): the cortex is the bright arc; everything deep to it, across the bone's width, is acoustic shadow
// (no tissue texture), darkest just under the cortex and fading only over the last third of the depth. Side edges feathered.
function roundShadow(tg,cx,cy,r,depth=300){
  const P=arcPts(cx,cy,r,Math.PI,2*Math.PI,40).concat([[cx+r,900],[cx-r,900]]),y0=cy-r,y1=cy+depth,[lc,lx]=layer();
  lx.save();polyPath(lx,P);lx.clip();
  let g=lx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(240,230,218,.97)');g.addColorStop(.7,'rgba(240,230,218,.9)');g.addColorStop(1,'rgba(240,230,218,0)');lx.fillStyle=g;lx.fillRect(0,0,W,H);
  g=lx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(96,56,36,.26)');g.addColorStop(.45,'rgba(96,56,36,.14)');g.addColorStop(1,'rgba(96,56,36,.04)');lx.fillStyle=g;lx.fillRect(0,0,W,H);
  lx.beginPath();lx.arc(cx,cy,r-6,Math.PI,2*Math.PI);lx.strokeStyle='rgba(96,56,36,.12)';lx.lineWidth=12;lx.stroke();lx.restore();
  lx.globalCompositeOperation='destination-in';g=lx.createLinearGradient(cx-r,0,cx+r,0);const f=Math.min(.12,10/r);
  g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(f*.6,'#000');g.addColorStop(1-f*.6,'#000');g.addColorStop(1,'rgba(0,0,0,.7)');lx.fillStyle=g;lx.fillRect(0,0,W,H);
  tg.drawImage(lc,0,0,W,H);
}
const fade=(tg,y0=700,y1=820)=>{const g=tg.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'rgba(244,236,225,0)');g.addColorStop(1,'rgba(244,236,225,1)');tg.fillStyle=g;tg.fillRect(0,y0,W,H-y0)};
const baseView=(key,ends)=>({key,ends,skinTop:spline(SKT,false),skinDeep:spline(SKD,false),tendons:[],vessels:[],nerves:[],OUT:[]});
const skinOut=G=>[{p:mkPath(G.skinTop),t:[1.1,2.9],w:2.2},{p:mkPath(G.skinDeep),t:[1.3,3.1],w:1.1,a:.55}];

/* TIBIAL: at the medial malleolus, the tarsal tunnel. Screen left = anterior (malleolus), right = posterior (Achilles).
   Tom, Dick, ANd Harry from anterior: tibialis posterior, flexor digitorum longus, artery and veins, nerve, flexor hallucis longus. */
function buildTib(){
  const G=baseView('tib',['Anterior','Posterior']);
  G.fasR=xsample([[300,262],[450,248],[600,236],[766,232],[900,236],[1004,240],[1100,248],[1250,256],[1400,250],[1580,262]],300,1580);   // flexor retinaculum
  G.cortex=spline([[20,332],[120,300],[260,268],[380,272],[450,300],[470,360],[482,450],[478,560]],false);   // medial malleolus
  G.talus=spline([[488,628],[600,640],[750,662],[900,690],[1050,720],[1250,762],[1580,820]],false);
  G.fhl=spline([[640,462],[668,431],[730,422],[800,420],[900,420],[1000,426],[1072,448],[1100,504],[1062,570],[950,594],[800,592],[690,576],[646,526]],true);
  G.kager=[[1000,262],[1236,258],[1290,340],[1290,600],[1120,640],[1000,600],[1010,470]];
  G.septum=spline([[652,238],[656,268],[662,292]],false);
  G.tendons=[mkTendon(520,306,56,33,31),mkTendon(622,312,38,26,32),mkTendon(800,444,30,20,33),mkTendon(1400,322,170,60,34)];
  G.vessels=[{k:'v',x:676,y:306,rx:16,ry:12},{k:'a',x:712,y:312,rx:26,ry:26},{k:'v',x:752,y:322,rx:18,ry:13}];
  G.nerves=[Object.assign(mkNerve(822,324,50,32,0,41),{F:makeFascicles(18,50,32,41,2,2.6,[8,7])})];
  G.OUT=skinOut(G).concat([
    {p:mkPath(G.fhl),t:[2.0,4.0],w:2.0,dbl:mkPath(shrink(G.fhl,.96))},
    {p:mkPath(G.cortex),t:[2.4,4.2],w:2.8,glow:true},
    {p:mkPath(G.talus),t:[2.8,4.4],w:2.2,a:.7,glow:true},
    {p:mkPath(G.septum),t:[2.6,3.6],w:1.1,a:.45,dash:[4,5]}]);
  G.paint=(tg,r)=>{
    const low=G.cortex.filter(p=>p[0]<300).concat(G.fasR),band=G.skinDeep.concat(low.slice().reverse());
    fatFill(tg,band,r,10,16,6,10,C.sub,'rgba(150,88,58,.30)');
    const post=G.cortex.filter(p=>p[0]>=380).reverse(),deep=G.fasR.concat([[1580,800],[478,800]],post);
    fatFill(tg,deep,r,9,16,6,11);
    fatFill(tg,G.kager,r,16,26,10,16,C.fat,'rgba(150,88,58,.24)');
    muscle(tg,G.fhl,r,.25,1500,8,22);
    boneShadow(tg,G.cortex,1,520);boneShadow(tg,G.talus,.7,200);
    fade(tg);
  };
  G.hz=[234,421];
  G.labels={
    pills:[['Tibial nerve',940,474,'left',s=>[s.nerves[0].x+30,s.nerves[0].y+s.nerves[0].ry-6]],
      ['Posterior tibial artery',640,452,'right',()=>[700,336]],
      ['Flexor retinaculum',1170,206,'left',()=>[1110,250]],
      ['Tibialis posterior',330,400,'right',()=>[496,324]],
      ['Flexor digitorum longus',330,470,'right',()=>[606,332]]],
    muscles:[['Flexor hallucis longus',880,560],['Achilles tendon',1400,328],["Kager's fat pad",1190,640]],
    bone:['Medial malleolus',120,262],
    note:['From anterior: Tom, Dick, ANd Harry',120,362]};
  return G;
}

/* SAPHENOUS: about 2 cm proximal and just anterior to the medial malleolus. Screen left = anterior (tibia), right = posterior. */
function buildSap(){
  const G=baseView('sap',['Anterior','Posterior']);
  G.fasR=xsample([[20,348],[100,345],[400,336],[766,330],[950,340],[1100,372],[1300,420],[1580,470]]);   // crural fascia
  G.cortex=spline([[20,366],[150,362],[500,342],[766,338],[950,352],[1080,392],[1150,450],[1175,540]],false);
  G.fdl=spline([[1240,420],[1330,430],[1450,452],[1560,490],[1572,610],[1440,652],[1300,632],[1244,560]],true);   // flexor digitorum longus
  G.tendons=[mkTendon(1192,452,30,22,52)];   // tibialis posterior tendon, on the posteromedial tibia
  G.vessels=[{k:'v',x:766,y:260,rx:38,ry:26,fill:[46,36,3,6]}];   // great saphenous vein; the calf tourniquet fills it over dT 3 to 6
  G.nerves=[mkNerve(700,266,13,10,4,51,{alpha:.72})];
  G.OUT=skinOut(G).concat([
    {p:mkPath(G.fdl),t:[2.0,4.0],w:1.8,a:.8,dbl:mkPath(shrink(G.fdl,.96))},
    {p:mkPath(G.cortex),t:[2.4,4.2],w:2.8,glow:true}]);
  G.paint=(tg,r)=>{
    fatFill(tg,G.skinDeep.concat(G.fasR.slice().reverse()),r,12,20,8,13,C.sub,'rgba(150,88,58,.30)');
    const post=G.cortex.filter(p=>p[0]>=1080).reverse();
    fatFill(tg,G.fasR.filter(p=>p[0]>=1080).concat([[1580,800],[1176,800]],post),r,9,15,6,10);
    muscle(tg,G.fdl,r,.3,800,10,28);
    boneShadow(tg,G.cortex,1,420);
    fade(tg);
  };
  G.hz=[330];
  G.labels={
    pills:[['Great saphenous vein',560,196,'right',()=>[748,238]],
      ['Saphenous nerve',540,300,'right',s=>[s.nerves[0].x-11,s.nerves[0].y+4]],
      ['Crural fascia',1120,300,'left',()=>[1070,366]],
      ['Tibialis posterior',1290,352,'left',()=>[1200,436]]],
    muscles:[['Flexor digitorum longus',1405,560]],
    bone:['Tibia',230,420]};
  return G;
}

/* DEEP PERONEAL: anterior ankle at the extensor retinaculum, just above the intermalleolar line.
   Screen left = medial, right = lateral. */
function buildDpn(){
  const G=baseView('dpn',['Medial','Lateral']);
  G.fasR=xsample([[20,218],[100,215],[400,207],[766,205],[980,206],[1100,209],[1500,218],[1580,222]]);   // extensor retinaculum
  const CX=[[20,420],[150,410],[500,378],[766,368],[1000,374],[1400,400],[1580,414]];
  G.cortex=spline(CX,false);G.capsule=spline(CX.map(([x,y])=>[x,y-17]),false);
  G.tendons=[mkTendon(360,255,70,38,61),mkTendon(610,262,44,30,62,{slide:1}),mkTendon(1000,290,50,30,63),mkTendon(1180,300,55,30,64)];
  G.vessels=[{k:'v',x:742,y:322,rx:11,ry:8},{k:'a',x:775,y:328,rx:22,ry:22},{k:'v',x:806,y:304,rx:10,ry:7}];
  G.nerves=[mkNerve(834,334,18,13,5,71)];
  G.OUT=skinOut(G).concat([
    {p:mkPath(G.capsule),t:[2.2,4.0],w:1,a:.35},
    {p:mkPath(G.cortex),t:[2.4,4.2],w:2.8,glow:true}]);
  G.paint=(tg,r)=>{
    fatFill(tg,G.skinDeep.concat(G.fasR.slice().reverse()),r,8,13,5,8,C.sub,'rgba(150,88,58,.30)');
    fatFill(tg,G.fasR.concat(G.capsule.slice().reverse()),r,8,14,5,10);
    const cap=G.capsule.concat(G.cortex.slice().reverse());tg.save();polyPath(tg,cap);tg.fillStyle='#ecd3bd';tg.fill();tg.clip();
    for(let i=0;i<70;i++){const x=r()*1600,y=yAt(G.capsule,x)+3+r()*11,l=40+r()*120;tg.beginPath();tg.moveTo(x,y);tg.lineTo(x+l,y+(r()-.5)*3);tg.strokeStyle=r()<.6?'rgba(120,70,44,.22)':'rgba(255,246,236,.6)';tg.lineWidth=.7;tg.stroke()}tg.restore();
    boneShadow(tg,G.cortex,1,420);
    fade(tg);
  };
  G.hz=[205,368];
  G.labels={
    pills:[['Deep peroneal nerve',900,486,'left',s=>[s.nerves[0].x+6,s.nerves[0].y+12]],
      ['Anterior tibial artery',640,440,'right',()=>[764,348]],
      ['Extensor retinaculum',1240,244,'left',()=>[1180,212]],
      ['Extensor hallucis longus',450,330,'right',s=>[574+(s.tdx||0),276]],
      ['Extensor digitorum longus',1090,360,'left',()=>[1030,312]],
      ['Tibialis anterior',236,294,'right',()=>[312,270]],
      ['Peroneus tertius',1290,302,'left',()=>[1214,300]]],
    muscles:[],
    bone:['Tibia',220,452]};
  return G;
}

/* SUPERFICIAL PERONEAL: anterolateral leg. Level L: -1 = 6 cm, 0 = 10 cm, 1 = 14 cm above the lateral malleolus.
   Screen left = posterior (peroneus brevis, fibula), right = anterior (extensor digitorum longus). */
const SPNL={'-1':{dip:6,hw:20,apex:274,fib:[520,502,90],nerves:[[742,232,12,9],[792,236,12,9]]},
  '0':{dip:12,hw:30,apex:290,fib:[520,520,95],nerves:[[766,240,20,14]]},
  '1':{dip:0,hw:52,apex:346,fib:[520,540,100],nerves:[[766,300,20,14]]}};
function buildSpn(L){
  const G=baseView('spn'+(L<0?'6':L>0?'14':''),['Posterior','Anterior']),Q=SPNL[L],d=Q.dip;
  G.fasR=xsample([[20,264],[80,262],[400,256],[700,256],[740,256+d*.45],[766,256+d],[792,256+d*.45],[830,256],[1200,254],[1550,260],[1580,262]]);   // deep (crural) fascia
  const [fx,fy,fr]=Q.fib,A=a=>[fx+fr*Math.cos(a),fy+fr*Math.sin(a)],ang=-50*Math.PI/180,fp=A(ang);
  const yF=x=>yAt(G.fasR,x)+3,apex=[766,Q.apex],vl=[766-Q.hw,yF(766-Q.hw)],vr=[766+Q.hw,yF(766+Q.hw)];
  G.groove=[vl,apex,vr].concat(G.fasR.filter(p=>p[0]>vl[0]&&p[0]<vr[0]).reverse().map(p=>[p[0],p[1]+2]));
  G.septum=[apex,fp];
  const top=x0=>G.fasR.filter(p=>p[0]>=x0[0]&&p[0]<=x0[1]).map(p=>[p[0],p[1]+3]);
  G.pb=top([20,vl[0]]).concat([apex,fp],arcPts(fx,fy,fr+3,ang,-Math.PI,24),[[300,630],[20,650]]);
  G.edl=[apex].concat([vr],top([vr[0]+4,1580]),[[1580,600],[1100,640],[740,624]],arcPts(fx,fy,fr+3,0,ang,20));
  G.fibula=arcPts(fx,fy,fr,Math.PI,2*Math.PI,40);
  G.nerves=Q.nerves.map((n,i)=>mkNerve(n[0],n[1],n[2],n[3],n[2]>15?5:3,81+i));
  G.OUT=skinOut(G).concat([
    {p:mkPath(G.pb),t:[2.0,4.0],w:1.8,a:.8,dbl:mkPath(shrink(G.pb,.975))},
    {p:mkPath(G.edl),t:[2.1,4.1],w:1.8,a:.8,dbl:mkPath(shrink(G.edl,.98))},
    {p:mkPath(G.septum),t:[2.4,3.8],w:1.3,a:.6},
    {p:mkPath(G.fibula),t:[2.4,4.2],w:2.8,glow:true}]);
  G.paint=(tg,r)=>{
    fatFill(tg,G.skinDeep.concat(G.fasR.slice().reverse()),r,11,18,7,12,C.sub,'rgba(150,88,58,.30)');
    muscle(tg,[[20,600],[300,600],[425,520],[618,520],[740,626],[1100,620],[1580,580],[1580,800],[20,800]],r,.4,900,8,22,.75);
    muscle(tg,G.pb,r,.15,2000,8,24);muscle(tg,G.edl,r,-.5,2300,10,30);
    fatFill(tg,G.groove,r,6,10,4,7);
    roundShadow(tg,fx,fy,fr,300);
    fade(tg);
  };
  G.hz=[256];
  return G;
}
const spnLabels={
  pills:[['Superficial peroneal nerve',560,196,'right',s=>{const N=s.nerves;return N.length>1&&Math.abs(N[1].x-N[0].x)>4?[N[0].x-N[0].rx*.7,N[0].y-4]:[N[0].x-N[0].rx-2,N[0].y-3]}],
    ['Deep fascia',1010,304,'left',()=>[960,259]],
    ['Intermuscular septum',380,478,'right',s=>[640,404]]],
  muscles:[['Peroneus brevis',300,370],['Extensor digitorum longus',1230,450]],
  bone:['Fibula',492,676]};

/* SURAL: posterolateral ankle, about 1.25 cm above the lateral malleolus tip, between the malleolus and the Achilles.
   Screen left = posterior (Achilles), right = anterior (peroneal tendons, lateral malleolus). */
function buildSur(){
  const G=baseView('sur',['Posterior','Anterior']);
  G.fasR=xsample([[20,258],[100,262],[370,276],[560,300],[766,308],[1000,305],[1300,300],[1580,300]]);   // deep fascia
  const wob=(cx,cy,rx,ry,seed)=>{const r=rng(seed),P=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,k=1+(r()-.5)*.08;P.push([cx+rx*k*Math.cos(a),cy+ry*k*Math.sin(a)])}return spline(P,true)};
  G.pb=wob(1000,438,220,95,91);
  G.fhl=spline([[540,566],[640,540],[760,534],[880,552],[930,612],[860,690],[640,700],[530,650]],true);
  G.fibula=arcPts(1250,560,90,Math.PI*1.05,Math.PI*1.98,36);
  G.tendons=[mkTendon(360,348,170,58,92),mkTendon(900,352,40,22,93)];
  G.vessels=[{k:'v',x:740,y:255,rx:32,ry:24}];
  G.nerves=[mkNerve(796,262,16,12,4,94)];
  G.OUT=skinOut(G).concat([
    {p:mkPath(G.pb),t:[2.0,4.0],w:1.8,a:.8,dbl:mkPath(shrink(G.pb,.96))},
    {p:mkPath(G.fhl),t:[2.2,4.2],w:1.4,a:.45},
    {p:mkPath(G.fibula),t:[2.4,4.2],w:2.8,glow:true}]);
  G.paint=(tg,r)=>{
    fatFill(tg,G.skinDeep.concat(G.fasR.slice().reverse()),r,11,18,7,12,C.sub,'rgba(150,88,58,.30)');
    fatFill(tg,G.fasR.concat([[1580,800],[20,800]]),r,13,24,8,15,C.fat,'rgba(150,88,58,.24)');
    muscle(tg,G.fhl,r,.3,700,8,22,.8);muscle(tg,G.pb,r,.2,1900,8,24);
    roundShadow(tg,1250,560,90,300);
    fade(tg);
  };
  G.hz=[306];
  G.labels={
    pills:[['Sural nerve',862,286,'left',s=>[s.nerves[0].x+4,s.nerves[0].y+s.nerves[0].ry-1]],
      ['Small saphenous vein',560,200,'right',()=>[714,244]],
      ['Deep fascia',1150,248,'left',()=>[1100,302]],
      ['Peroneus longus tendon',1080,336,'left',()=>[938,352]]],
    muscles:[['Achilles tendon',330,356],['Peroneus brevis',1040,470],["Kager's fat pad",650,470],['Flexor hallucis longus',735,628]],
    bone:['Fibula',1300,452]};
  return G;
}
const GEO={tib:buildTib(),sap:buildSap(),dpn:buildDpn(),spn:buildSpn(0),spn6:buildSpn(-1),spn14:buildSpn(1),sur:buildSur()};
GEO.spn.labels=GEO.spn6.labels=GEO.spn14.labels=spnLabels;
function guideSet(G){
  const L=[{p:mkPath([[36,140],[36,800]]),t:[0,1.2]}];
  G.hz.forEach((y,i)=>L.push({p:mkPath([[40,y],[1560,y]]),t:[.3+.2*i,1.7+.2*i]}));
  G.nerves.slice(0,1).forEach(n=>L.push({p:mkPath(ellipsePts(n.x,n.y,n.rx+22,n.ry+14)),t:[.6,2.4],dash:[6,6]}));
  G.vessels.forEach((v,i)=>L.push({p:mkPath(ellipsePts(v.x,v.y,v.rx+12,v.ry+12)),t:[1.1+i*.1,2.8+i*.1],dash:[6,6]}));
  L.push({p:mkPath(G.fasR.map(p=>[p[0],p[1]-10])),t:[.8,2.6],dash:[8,8]});
  return L;
}
for(const k in GEO)GEO[k].guides=guideSet(GEO[k]);

const tissueCache={};
function tissue(v){if(tissueCache[v])return tissueCache[v];const [cv,tg]=layer();GEO[v].paint(tg,rng(7));return tissueCache[v]=cv}

/* ---------- local anaesthetic ----------
   LA is built from components ({e:[cx,cy,rx,ry]} ellipses or {p:polygon}) and drawn as their union: one fill
   and one outline, so overlapping pieces read as a single collection. */
const [laC,lg]=layer();
function compPath(g,o){if(o.e){g.beginPath();g.ellipse(o.e[0],o.e[1],Math.max(.5,o.e[2]),Math.max(.5,o.e[3]),o.e[4]||0,0,Math.PI*2)}else polyPath(g,o.p)}
function drawLA(c,s,fillA){
  const L=(s.laOff||[]).concat(s.la||[]).filter(Boolean);if(!L.length)return;
  if(!s._la){
    lg.setTransform(1,0,0,1,0,0);lg.clearRect(0,0,laC.width,laC.height);lg.setTransform(LS,0,0,LS,0,0);lg.lineJoin='round';
    lg.globalCompositeOperation='source-over';lg.strokeStyle='rgb(88,36,15)';lg.lineWidth=2.6;L.forEach(o=>{compPath(lg,o);lg.stroke()});
    lg.globalCompositeOperation='destination-out';lg.fillStyle='#000';L.forEach(o=>{compPath(lg,o);lg.fill()});
    lg.globalCompositeOperation='source-over';
    let y0=1e9,y1=-1e9;L.forEach(o=>{const b=o.e?[0,o.e[1]-o.e[3],0,o.e[1]+o.e[3]]:bbox(o.p);y0=Math.min(y0,b[1]);y1=Math.max(y1,b[3])});
    const g=lg.createLinearGradient(0,y0,0,y1+1);g.addColorStop(0,'rgb(128,54,25)');g.addColorStop(.6,'rgb(120,49,21)');g.addColorStop(1,'rgb(132,58,28)');
    lg.fillStyle=g;L.forEach(o=>{compPath(lg,o);lg.fill()});s._la=true;
  }
  c.save();c.globalAlpha=fillA*.85;c.drawImage(laC,0,0,W,H);c.restore();
}
/* ---------- scenarios ---------- */
const DRUG='Ropivacaine 0.5%',MGML=5;   // ropivacaine 0.5% = 5 mg/mL (ASRA 2021); volumes per nerve from NYSORA (3 to 5 mL)
const alq=vol=>[[0,.8,1],[1.6,1.6+(vol-1)*.6,vol-1]];   // 1 mL test, aspirate, then the rest
function aliquots(t,t0,A){let v=0;A.forEach(([a,b,sz])=>{v+=sz*ease(seg(t,t0+a,t0+b))});
  const paused=A.some(([a,b],i)=>i<A.length-1&&t>t0+b&&t<t0+A[i+1][0]);return{v,paused}}
function uCross(line,NS,NT,u0=.05){for(let u=u0;u<=1;u+=.0005){const q=along(NS,NT,u);if(q[1]>=yAt(line,q[0]))return u}return .99}
const TPOP=11.135;
/* positive: correct in-plane injection. o.tent>0 gives one fascial give (tent, then pop) at the retinaculum.
   o.spread(G,k,nerve) returns {lift(x), comps(fas), vc} for k = fraction of the planned volume. */
function positive(o){
  const G=GEO[o.view],NS=o.NS,NT=o.NT,L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  const uS=uCross(G.skinTop,NS,NT),v0=Math.max(.04,uS-110/L),v1=o.v1??uS+16/L,T=o.tent||0,hp=T>0;
  const uc=hp?uCross(G.fasR,NS,NT,uS):1,ut=Math.min(uc+T/L,.995),uP=Math.min(.998,ut+10/L),Pc=along(NS,NT,uc),A=alq(o.vol),K0=o.k0??(hp?12.6:12.2);
  function U(t){
    if(t<9)return{u:lerp(v0,v1,easeOut(seg(t,8.3,9)))};
    if(!hp)return{u:lerp(v1,1,ease(seg(t,9,11.6)))};
    if(t<10.4)return{u:lerp(v1,uc,ease(seg(t,9,10.4)))};
    if(t<11){const q=seg(t,10.4,11);return{u:lerp(uc,ut,1-Math.pow(1-q,1.6)),sh:reduceMotion?0:Math.sin(t*41)*.6*q}}
    if(t<11.45){const p=pop(t,11,ut,uP,2.5);return{u:p.u,sh:p.sh}}
    return{u:lerp(uP,1,ease(seg(t,11.45,12.1)))};
  }
  return Object.assign({volT:12,laT:K0+1.2,K0,uS,v1,L,D,
    guides:[[along(NS,NT,uS+.04),NT,7.6,hp?12.4:11.8]],
    state(t){
      let na=0,tip=[-99,-99],tent=0;
      if(t>=8.3){na=seg(t,8.3,8.9);const r=U(t);tip=along(NS,NT,r.u);if(r.sh&&!reduceMotion){tip[0]+=D[0]*r.sh;tip[1]+=D[1]*r.sh}
        if(hp)tent=t<TPOP?clamp((r.u-uc)*L,0,T):T*Math.exp(-(t-TPOP)*9)*(reduceMotion?1:Math.cos((t-TPOP)*26))}
      const I=aliquots(t,K0,A),k=I.v/o.vol;
      const nerves=G.nerves.map((n,i)=>i?n:Object.assign({},n,{x:n.x+o.disp[0]*k,y:n.y+o.disp[1]*k}));
      const sp=k>0?o.spread(G,k,nerves[0]):null;
      let fas=G.fasR;if(sp&&sp.lift)fas=fas.map(p=>[p[0],p[1]-sp.lift(p[0])]);
      if(Math.abs(tent)>.05)fas=fas.map(p=>{const w=Math.exp(-Math.hypot(p[0]-Pc[0],p[1]-Pc[1])/26);return[p[0]+D[0]*tent*w,p[1]+D[1]*tent*w]});
      return{S:NS,tip,na,k,v:I.v,paused:I.paused,nerves,fas,la:sp?sp.comps(fas):null,vc:sp?sp.vc:null,view:o.view};
    }},o);
}
const grow=(k,a,b)=>ease(clamp((k-a)/(b-a)));
/* tibial: LA collects beneath the flexor retinaculum in the tunnel fat. It starts posterior to the nerve, then rings it
   (a thick cuff over the roof, a layer between nerve and flexor hallucis longus) and reaches the posterior vena comitans.
   The tunnel swells, so the retinaculum lifts over the nerve; a short tail tracks back along the needle. */
function tibSpread(G,k,n){
  const q=grow(k,0,.7),b=grow(k,.25,.9),sk=Math.sqrt(k);
  const lift=x=>22*Math.pow(k,.7)*bump((x-n.x)/(110+40*sk));
  return{lift,vc:[{i:2,dx:-4*q,sx:1-.16*q,sy:1-.1*q}],
    comps:fas=>{const ring=ellipsePts(lerp(n.x+n.rx*.9,n.x+4,q),lerp(n.y-6,n.y-4,q),lerp(9,n.rx+17,q),lerp(9,n.ry+17,q),40);
      if(b<=0)return[{p:ring}];
      // roof: LA spreads as a lens along the underside of the (lifted) retinaculum and merges with the cuff round the nerve
      const xc=n.x+6,top=n.y-n.ry-21,w=lerp(14,n.rx+86,b);
      const lens=planeLA(fas,()=>-3,x=>{const u=(x-xc)/w;return 3+Math.max(0,top+12-yAt(fas,x))*b*Math.pow(Math.max(0,1-u*u),.9)},Math.floor(xc-w),Math.ceil(xc+w));
      return[{p:ring}].concat(lens?[{p:lens}]:[])}};
}
/* deep peroneal: LA beneath the extensor retinaculum, a halo round the nerve reaching the lateral wall of the artery */
function dpnSpread(G,k,n){
  const q=grow(k,0,.7),b=grow(k,.25,.9),sk=Math.sqrt(k);
  const lift=x=>10*Math.pow(k,.7)*bump((x-842)/(60+40*sk));
  return{lift,vc:[{i:2,dx:2*q,sx:1+.1*q,sy:1-.45*q}],
    comps:()=>{const ring=ellipsePts(lerp(n.x+n.rx+6,n.x,q),lerp(n.y-6,n.y-2,q),lerp(7,n.rx+16,q),lerp(6,n.ry+13,q),40);
      if(b<=0)return[{p:ring}];
      return[{p:hull(ring.concat(ellipsePts(n.x+n.rx+4,n.y-n.ry-6-8*b,lerp(6,16,b),lerp(5,10,b),20)))}]}};
}
/* saphenous: perivenous subcutaneous ring round the great saphenous vein that wraps the nerve beside it */
function sapSpread(G,k,n){
  const q=grow(k,0,.7),d=grow(k,.4,.9);
  return{vc:[{i:0,dx:-2*q,sx:1+.04*q,sy:1-.24*q}],
    comps:()=>[{e:[lerp(816,768,q),lerp(292,264,q),lerp(8,60,q),lerp(7,46,q)]},{e:[n.x,n.y,n.rx+14*d,n.ry+12*d]},{e:[lerp(740,734,d),264,40*d,28*d]}].filter(o=>o.e[2]>1)};
}
/* superficial peroneal: a subcutaneous lens resting on the deep fascia, round the nerve. The fascia stays flat. */
function spnSpread(G,k,n){
  const sk=Math.sqrt(k),xc=lerp(796,770,sk),w=18+112*sk,Tm=34*Math.pow(k,.6),g=grow(k,.2,.8);
  const lift=x=>{const u=(x-xc)/w;return(Math.abs(u)>=1?0:Tm*Math.pow(1-u*u,.75))+Math.max(0,yAt(G.fasR,x)-256)*Math.min(1,k*5)*bump((x-766)/60)};
  return{comps:()=>[{p:planeLA(G.fasR,lift,()=>0,Math.floor(xc-w),Math.ceil(xc+w))},{e:[n.x,n.y,n.rx+12*g,n.ry+10*g]}]};
}
/* sural: perivenous ring round the nerve and the small saphenous vein together, superficial to the deep fascia */
function surSpread(G,k,n){
  const q=grow(k,0,.6),d=grow(k,.25,.85);
  return{vc:[{i:0,dx:-1*d,sx:1+.04*d,sy:1-.2*d}],
    comps:()=>[{e:[lerp(814,n.x+2,q),lerp(252,n.y,q),lerp(7,n.rx+14,q),lerp(6,n.ry+12,q)]},{e:[740,256,48*d,38*d]},{e:[770,258,40*d,27*d]}].filter(o=>o.e[2]>1)};
}
const SC={};
SC.tibial=positive({view:'tib',surf:'medial',pill:'Tibial nerve',NS:[1318,-42],NT:[876,308],tent:12,vol:5,disp:[-10,-4],spread:tibSpread,
  subtitle:'Tibial nerve: in-plane from posterior',Tend:25,magT:17.2,
  mag:{CY:680,R:140,Z:1.9,focus:s=>[s.nerves[0].x,s.nerves[0].y-10],text:['Beneath the flexor retinaculum:','nerve ringed by LA']},
  la:[[1000,380,'left',s=>[s.nerves[0].x+s.nerves[0].rx+8,s.nerves[0].y+4],'Local anaesthetic']],
  cue:['Colour Doppler: find the artery first',440,580,()=>[700,336]],
  caps:[[0,8.2,'1','Tibial nerve: posterior to the posterior tibial artery and veins, deep to the flexor retinaculum.'],
    [8.2,12.4,'2','In-plane from posterior. The tip gives through the flexor retinaculum and stops beside the nerve.'],
    [12.4,17.2,'3','Ropivacaine 0.5%: 1 mL first to see the spread, then the rest, aspirating between.'],
    [17.2,21.2,'4','5 mL in: LA rings the nerve and lifts the flexor retinaculum from beneath.'],
    [21.2,99,'5','For heel surgery, block a few cm higher: a block at the malleolus can miss the medial calcaneal branch.']]});
SC.saphenous=positive({view:'sap',surf:'medial',pill:'Saphenous nerve',NS:[1430,-40],NT:[812,290],vol:3,disp:[-4,0],spread:sapSpread,
  subtitle:'Saphenous nerve: in-plane from posterior',Tend:20.5,magT:15.6,
  mag:{CY:680,R:140,Z:2.2,focus:s=>[740,262],text:['Perivenous ring:','vein and nerve together']},
  la:[[900,420,'left',s=>[770,304],'Local anaesthetic']],
  cue:['Light pressure: keep the vein open',900,470,()=>[800,272]],
  caps:[[0,8.2,'1','Saphenous nerve lies beside the great saphenous vein in fat. A calf tourniquet fills the vein.'],
    [8.2,12,'2','In-plane from posterior, shallow, light pressure. The tip stops in fat beside the vein, not in it.'],
    [12,15.6,'3','Ropivacaine 0.5%: 1 mL, aspirate, then 2 mL. LA rings the vein and the nerve beside it.'],
    [15.6,99,'4','3 mL in: LA surrounds vein and nerve. Perivenous spread suffices when the nerve is not seen.']]});
SC.dpn=positive({view:'dpn',surf:'anterior',NS:[1230,-40],NT:[858,326],tent:10,vol:3,disp:[-4,2],spread:dpnSpread,
  subtitle:'Deep peroneal nerve: in-plane from lateral',Tend:21,magT:16,
  mag:{CY:680,R:140,Z:2.4,focus:s=>[815,330],text:['Beneath the extensor retinaculum:','nerve beside the artery']},
  la:[[960,420,'left',s=>[s.nerves[0].x+s.nerves[0].rx+14,s.nerves[0].y+4],'Local anaesthetic']],
  cue:['Colour Doppler: anterior tibial artery',440,560,()=>[766,350]],
  caps:[[0,8.2,'1','Deep peroneal nerve lies beside the anterior tibial artery on the tibia, deep to the extensor retinaculum.'],
    [8.2,12.4,'2','Move the big toe to find extensor hallucis longus. In-plane from lateral, through the retinaculum.'],
    [12.4,16,'3','Ropivacaine 0.5%: 1 mL, aspirate, then 2 mL. Keep the tip lateral to the artery.'],
    [16,99,'4','3 mL in: LA outlines the nerve beside the artery, beneath the extensor retinaculum.']]});
SC.spn=positive({view:'spn',surf:'lateral',pill:'Superficial peroneal nerve',NS:[1592,-40],NT:[792,236],vol:3,disp:[-2,0],spread:spnSpread,
  subtitle:'Superficial peroneal nerve: in-plane from anterior',Tend:20.5,magT:15.6,
  mag:{CY:680,R:140,Z:2.0,focus:s=>[766,245],text:['Above the deep fascia:','nerve outlined in fat']},
  la:[[900,370,'left',s=>[836,252],'Local anaesthetic']],
  caps:[[0,8.2,'1','Superficial peroneal nerve pierces the deep fascia between peroneus brevis and extensor digitorum longus.'],
    [8.2,12,'2','In-plane from anterior, shallow. The tip stays in fat, superficial to the deep fascia, beside the nerve.'],
    [12,15.6,'3','Ropivacaine 0.5%: 1 mL, aspirate, then 2 mL. A subcutaneous lens lifts around the nerve.'],
    [15.6,99,'4','3 mL in: LA surrounds the nerve above the fascia. If the nerve is not seen, a subcutaneous wheal works.']]});
SC.sural=positive({view:'sur',surf:'lateral',pill:'Sural nerve',NS:[1510,-40],NT:[812,252],vol:3,disp:[-3,0],spread:surSpread,
  subtitle:'Sural nerve: in-plane from anterior',Tend:20.5,magT:15.6,
  mag:{CY:680,R:140,Z:2.0,focus:s=>[768,258],text:['Perivenous ring:','vein and sural nerve']},
  la:[[560,256,'right',s=>[712,290],'Local anaesthetic']],
  caps:[[0,8.2,'1','Sural nerve runs with the small saphenous vein in fat, superficial to the deep fascia, beside the Achilles.'],
    [8.2,12,'2','In-plane from anterior, shallow. Light pressure keeps the vein open; the tip stops beside it.'],
    [12,15.6,'3','Ropivacaine 0.5%: 1 mL, aspirate, then 2 mL. LA rings the vein and the nerve together.'],
    [15.6,99,'4','3 mL in: perivenous spread surrounds the nerve. A calf tourniquet helps if the vein is hard to see.']]});

/* fixLedger: volume ledger for a negative example with an animated fix */
function fixLedger(label,off,tFix,label2){return(s,t)=>{if(t<tFix)return null;const b=s.v||0,tot=off+b;
  return{a:seg(t,tFix,tFix+.6),lines:[label+': '+off.toFixed(1)+' mL',label2+': '+b.toFixed(1)+' mL','Total r'+DRUG.slice(1)+': '+tot.toFixed(1)+' mL ('+Math.round(tot*MGML)+' mg)']}}}
/* negative example: the needle runs too shallow and stops in fat above the flexor retinaculum; 2 mL spreads under the skin.
   Fix: withdraw to just under the skin, steepen onto the tibial line (same skin entry), then the tibial scenario's own
   tent, pop and aliquots on a shifted clock. The misplaced lens stays on top of the retinaculum. */
(function(){
  const G=GEO.tib,T=SC.tibial,NS=[1600,37],NT=[790,214],L=Math.hypot(NT[0]-NS[0],NT[1]-NS[1]),D=[(NT[0]-NS[0])/L,(NT[1]-NS[1])/L];
  const uS=uCross(G.skinTop,NS,NT),v0=Math.max(.04,uS-110/L),v1=uS+16/L,uW=uS+10/L;
  const OFF=2,TW=18.0,TR=18.6,TB=19.8,TF=20.6,SHIFT=TF-9,FXI=T.K0+SHIFT;
  const lens=(fas,v)=>{const k=v/OFF;if(k<=0)return null;const sk=Math.sqrt(k),xc=lerp(792,800,sk),w=16+84*sk,Tm=30*Math.pow(k,.6);
    return{p:planeLA(fas,x=>{const u=(x-xc)/w;return Math.abs(u)>=1?0:Tm*Math.pow(1-u*u,.75)},()=>0,Math.floor(xc-w),Math.ceil(xc+w))}};
  const magT=FXI+4.6;
  SC.tibialAbove={view:'tib',surf:'medial',pill:'Above flexor retinaculum',neg:true,Tend:magT+4.4,vol:5,volT:12.2,magT,
    subtitle:'Tibial nerve: injection above the retinaculum',
    mag:{CY:672,R:150,Z:1.25,focus:s=>[815,300],text:['2 mL above the retinaculum,','5 mL beneath: nerve outlined']},
    la:[[580,200,'right',s=>[740,212],'LA above the retinaculum',13.4],[1000,380,'left',s=>[s.nerves[0].x+s.nerves[0].rx+8,s.nerves[0].y+4],'LA beneath the retinaculum',FXI+1.4]],
    guides:[[along(NS,NT,uS+.04),NT,7.6,11.6],[along(T.NS,T.NT,T.uS+.04),T.NT,TB,TF+2.2]],
    hide:{'Tibial nerve':[15.0,TR+.4],'Flexor retinaculum':[11.6,TR+.4]},
    caps:[[0,8.2,'1','Tibial nerve: posterior to the posterior tibial artery and veins, deep to the flexor retinaculum.'],
      [8.2,12.6,'2','Error: the needle runs too shallow and stops in fat, above the flexor retinaculum.'],
      [12.6,15.6,'3','LA spreads under the skin, superficial to the retinaculum. The nerve does not move.'],
      [15.6,TR,'4','Error recognised: no spread deep to the retinaculum, so LA cannot reach the nerve. Stop at 2 mL.'],
      [TR,FXI,'5','Fix: withdraw to the skin, steepen, and advance until the tip gives through the retinaculum.'],
      [FXI,magT,'6','Ropivacaine 0.5%, the planned 5 mL: 1 mL first, then the rest, aspirating. LA rings the nerve.'],
      [magT,99,'7','Total 7 mL, 35 mg: 2 mL wasted under the skin; 5 mL beneath the retinaculum outlines the nerve.']],
    ledger:fixLedger('Above retinaculum',OFF,TR,'Beneath retinaculum'),
    state(t){
      const vOff=OFF*ease(seg(t,12.8,15.0));
      if(t>=TF){const s=T.state(t-SHIFT);s.laOff=[lens(s.fas,vOff)];return s}
      const s=T.state(8);   // static anatomy: no LA beneath the retinaculum, nerve unmoved
      let tip=[-99,-99],S=NS,na=seg(t,8.3,8.8);
      if(t>=8.3){
        if(t<TR){const u=t<9?lerp(v0,v1,easeOut(seg(t,8.3,9))):lerp(v1,1,ease(seg(t,9,11.8)));tip=along(NS,NT,u)}
        else if(t<TB)tip=along(NS,NT,lerp(1,uW,ease(seg(t,TR,TB))));
        else{const q=ease(seg(t,TB,TF));S=along(NS,T.NS,q);tip=along(along(NS,NT,uW),along(T.NS,T.NT,T.v1),q)}
      }
      return Object.assign(s,{S,tip,na,v:t<TR?vOff:0,k:0,paused:false,laOff:[lens(G.fasR,vOff)],la:null});
    },
    warnings(c,t,s){
      const f=1-seg(t,TW,TR);if(f<=0){const ok=seg(t,FXI+2.6,FXI+3.2);if(ok>0)cuePill(c,'Nerve outlined: correct plane',1010,560,ok);return}
      const a1=seg(t,12.0,12.5)*f;
      if(a1>0){ring(c,s.tip,a1,t,0);warnPill(c,'Superficial to flexor retinaculum',990,300,[s.tip[0]+18,s.tip[1]+10],a1)}
      const a2=seg(t,15.4,16)*f;
      if(a2>0){const n=s.nerves[0];c.save();c.globalAlpha=a2*.8;c.strokeStyle=RED;c.lineWidth=1.8;c.setLineDash([6,6]);c.beginPath();c.ellipse(n.x,n.y,n.rx+12,n.ry+12,0,0,Math.PI*2);c.stroke();c.restore();
        warnPill(c,'Nerve not outlined',1010,500,[n.x+n.rx*.6,n.y+n.ry+9],a2)}
      const a3=seg(t,16.6,17.2)*f;
      if(a3>0)warnPill(c,'Stop at 2 mL',1010,550,null,a3);
    }};
})();
/* Trace up the leg: scanning, no needle. lvl(t) is the probe level in cm above the lateral malleolus (6 to 14);
   the cross-section crossfades between the 10 cm picture and the 6 or 14 cm one, and the nerve morphs with it. */
(function(){
  const lvl=t=>t<12?lerp(10,6,ease(seg(t,8.2,12))):t<16?lerp(6,14,ease(seg(t,12,16))):lerp(14,10,ease(seg(t,16,19)));
  const N0=GEO.spn.nerves[0],B6=GEO.spn6.nerves,N14=GEO.spn14.nerves[0];
  const mixN=(a,b,m)=>Object.assign({},a,{x:lerp(a.x,b.x,m),y:lerp(a.y,b.y,m),rx:lerp(a.rx,b.rx,m),ry:lerp(a.ry,b.ry,m)});
  SC.spnTrace={view:'spn',surf:'lateral',pill:'Trace up the leg',scan:true,Tend:24,vol:0,volT:1e9,magT:19.6,laT:1e9,lvl,
    subtitle:'Superficial peroneal nerve: trace it up the leg',hint:'Press play to scan',
    mag:{CY:680,R:140,Z:1.9,focus:s=>{const N=s.nerves;return N.length>1?[(N[0].x+N[1].x)/2,(N[0].y+N[1].y)/2]:[N[0].x,N[0].y]},text:['Follow it until','it pierces the fascia']},
    la:[],guides:[],
    caps:[[0,8.2,'1','At 10 cm above the ankle, the nerve sits on the deep fascia, in the groove between the muscles.'],
      [8.2,12,'2','Slide distally: the nerve lies in fat and starts to branch. Block it before it divides.'],
      [12,16,'3','Slide proximally: the nerve dives beneath the fascia into the intermuscular groove.'],
      [16,99,'4','Back where it pierces the fascia: one injection here catches the nerve before it branches.']],
    state(t){
      const l=lvl(t),dn=l<10,m=dn?(10-l)/4:(l-10)/4,B=dn?'spn6':'spn14',GB=GEO[B];
      const fas=GEO.spn.fasR.map((p,i)=>[p[0],lerp(p[1],GB.fasR[i][1],m)]);
      const nerves=dn?(m<.02?[N0]:[mixN(N0,B6[0],m),mixN(N0,B6[1],m)]):[mixN(N0,N14,m)];
      return{S:[0,0],tip:[-99,-99],na:0,k:0,v:0,nerves,fas,la:null,view:'spn',mix:{B,m},level:l};
    }};
})();
const TABS={medial:['tibial','tibialAbove','saphenous'],anterior:['dpn'],lateral:['spn','spnTrace','sural']};
for(const k in SC)SC[k].key=k;

/* ---------- drawing ---------- */
function drawNerve(c,n,fillA,lineP){
  const sx=n.rx/n.bx,sy=n.ry/n.by,ss=Math.min(sx,sy),ins=Math.min(4,n.rx*.16);
  c.save();c.globalAlpha=fillA*n.alpha;
  c.beginPath();c.ellipse(n.x,n.y,n.rx,n.ry,0,0,Math.PI*2);
  const gr=c.createRadialGradient(n.x-n.rx*.3,n.y-n.ry*.3,Math.min(4,n.rx*.2),n.x,n.y,n.rx);gr.addColorStop(0,'#f6e3d2');gr.addColorStop(1,'#e8c4a6');
  c.fillStyle=gr;c.fill();c.clip();
  c.beginPath();c.ellipse(n.x,n.y,n.rx-ins,n.ry-ins,0,0,Math.PI*2);c.strokeStyle='rgba(168,95,55,.6)';c.lineWidth=.9;c.stroke();
  n.F.forEach(f=>{c.beginPath();
    for(let i=0;i<=9;i++){const a=i/9*Math.PI*2,rr=f.s*f.wob[i%9]*ss,px=n.x+f.x*sx+Math.cos(a)*rr,py=n.y+f.y*sy+Math.sin(a)*rr;i?c.lineTo(px,py):c.moveTo(px,py)}
    c.closePath();c.fillStyle=C.fascicle;c.fill();if(f.ring){c.strokeStyle='rgba(250,226,206,.75)';c.lineWidth=.8;c.stroke()}});
  c.restore();
  c.save();c.globalAlpha=Math.min(1,.35+.65*n.alpha);c.strokeStyle=C.ink;c.lineWidth=n.rx<30?1.5:1.8;strokePartial(c,mkPath(ellipsePts(n.x,n.y,n.rx,n.ry,60)),lineP);c.restore();
}
// vessels: pulsing artery (bright wall), compressible vein; wall thickness scales with vessel size
function drawVessel(c,V,fillA,lineP,t){
  c.save();c.globalAlpha=fillA;
  if(V.k==='a'){
    const pulse=reduceMotion?0:Math.pow(Math.max(0,Math.sin(t*Math.PI*2*1.15)),6),ar=V.rx*(1+.035*pulse),wall=clamp(V.rx*.17,2.6,8);
    c.beginPath();c.arc(V.x,V.y,ar,0,Math.PI*2);const g=c.createRadialGradient(V.x-ar*.15,V.y-ar*.15,2,V.x,V.y,ar);g.addColorStop(0,'#5e2c19');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();
    c.lineWidth=wall;c.strokeStyle='rgba(242,200,170,.95)';c.stroke();c.restore();
    c.strokeStyle=C.ink;c.lineWidth=ar<30?1.5:2;strokePartial(c,mkPath(ellipsePts(V.x,V.y,ar+wall/2,ar+wall/2,60)),lineP);
  }else{
    const vp=ellipsePts(V.x,V.y,V.rx,V.ry,72);polyPath(c,vp);const g=c.createRadialGradient(V.x,V.y,2,V.x,V.y,Math.max(V.rx,V.ry)*1.1);g.addColorStop(0,'#5a2a18');g.addColorStop(1,'#3a1a10');c.fillStyle=g;c.fill();
    c.lineWidth=clamp(Math.min(V.rx,V.ry)*.26,2,6);c.strokeStyle='rgba(242,200,170,.9)';c.stroke();c.restore();
    c.strokeStyle=C.ink;c.lineWidth=V.rx<30?1.5:2;strokePartial(c,mkPath(vp),lineP);
  }
}
function drawTendon(c,T,fillA,lineP,dx=0){
  const x=T.x+dx;
  c.save();c.globalAlpha=fillA;c.beginPath();c.ellipse(x,T.y,T.rx,T.ry,0,0,Math.PI*2);c.fillStyle='#f8ebdd';c.fill();c.clip();
  T.h.forEach(([y,d,w])=>{const yy=T.y+y;c.beginPath();c.moveTo(x-T.rx,yy);c.bezierCurveTo(x-T.rx*.35,yy-2+w,x+T.rx*.35,yy+2-w,x+T.rx,yy-1);c.strokeStyle=d?'rgba(150,96,64,.38)':'rgba(255,252,246,.95)';c.lineWidth=.65;c.stroke()});
  c.restore();
  c.save();c.strokeStyle='rgba(43,30,24,.72)';c.lineWidth=1.4;strokePartial(c,mkPath(ellipsePts(x,T.y,T.rx,T.ry,60)),lineP);c.restore();
}
// the dynamic fascial line (retinaculum or deep fascia): bright double line, moves with tent and LA
function drawFascia(c,dT,s){
  const p=ease(seg(dT,1.7,3.6));c.save();c.lineJoin='round';c.lineCap='round';
  c.strokeStyle='rgba(255,250,242,.9)';c.lineWidth=5.5;strokePartial(c,mkPath(s.fas),p);
  c.strokeStyle=C.ink;c.lineWidth=2.2;strokePartial(c,mkPath(s.fas),p);
  c.strokeStyle='rgba(43,30,24,.32)';c.lineWidth=1;strokePartial(c,mkPath(s.fas.map(q=>[q[0],q[1]+4])),p);
  c.restore();
}

function drawGuides(c,G,dT){
  const fade=dT<4?1:lerp(1,.32,seg(dT,4,6.5));
  c.save();c.strokeStyle=`rgba(${C.guide},${.6*fade})`;c.lineWidth=1;
  G.guides.forEach(g=>{c.setLineDash(g.dash||[]);strokePartial(c,g.p,ease(seg(dT,g.t[0],g.t[1])))});c.setLineDash([]);
  // depth ruler: 200 px per cm from the skin (y 147), minor tick every 5 mm
  const tp=seg(dT,.4,1.9);
  for(let i=0;i<=6;i++){if(i/6>tp)break;const y=147+i*PXCM/2,big=i%2===0;c.beginPath();c.moveTo(36,y);c.lineTo(36+(big?16:8),y);c.stroke();
    if(big){c.beginPath();c.arc(36,y,4,0,Math.PI*2);c.stroke()}}
  const cp=seg(dT,1.4,2.6);
  if(cp>0){c.globalAlpha=cp;G.nerves.slice(0,1).concat(G.vessels).forEach(({x,y})=>{c.beginPath();c.moveTo(x-7,y);c.lineTo(x+7,y);c.moveTo(x,y-7);c.lineTo(x,y+7);c.stroke()})}
  c.restore();
}
// depth-scale numbers, drawn after the tissue lines so no fascia or cortex runs through them
function drawDepthText(c,dT){
  const tp=seg(dT,.4,1.9);c.save();c.font='400 13px Inter, system-ui, sans-serif';c.textBaseline='middle';
  for(let i=2;i<=6;i+=2){if(i/6>tp)break;const y=147+i*PXCM/2,tx=(i/2)+' cm',w=c.measureText(tx).width;
    c.fillStyle='rgba(244,236,225,.88)';c.beginPath();c.roundRect?c.roundRect(52,y-9,w+8,18,5):c.rect(52,y-9,w+8,18);c.fill();
    c.fillStyle=`rgba(${C.guide},.8)`;c.fillText(tx,56,y)}
  c.restore();
}

// vessels for this frame: tourniquet fill (by dT) then LA compression (s.vc)
function vesselsNow(G,s){return G.vessels.map((v,i)=>{let o=Object.assign({},v);
  if(v.fill){const q=ease(seg(s.dT,v.fill[2],v.fill[3]));o.rx=lerp(v.rx,v.fill[0],q);o.ry=lerp(v.ry,v.fill[1],q)}
  (s.vc||[]).forEach(m=>{if(m.i===i){o.x+=m.dx||0;o.rx*=m.sx||1;o.ry*=m.sy||1}});return o})}
// extensor hallucis longus slides with big-toe movement: twice in the intro, twice as the needle starts
function slideDx(s){if(reduceMotion)return 0;return 6*Math.sin(Math.PI*4*seg(s.dT,5.2,7.4))*(s.dT<7.4?1:0)+6*Math.sin(Math.PI*4*seg(s.t,8.4,10.6))}
function core(c,s,sub){
  const G=GEO[s.view],dT=s.dT,t=s.t,mix=s.mix&&s.mix.m>.001?s.mix:null;
  c.drawImage(paperC,0,0,W,H);
  const texA=ease(seg(dT,3.6,6));
  c.save();c.globalAlpha=texA;c.drawImage(tissue(s.view),0,0,W,H);if(mix){c.globalAlpha=texA*mix.m;c.drawImage(tissue(mix.B),0,0,W,H)}c.restore();
  const ba=ease(seg(dT,6.3,7.8));
  if(ba>0){c.save();c.globalCompositeOperation='multiply';const g=c.createLinearGradient(0,148,0,800);g.addColorStop(0,`rgba(226,140,92,${.55*ba})`);g.addColorStop(.75,`rgba(226,140,92,${.4*ba})`);g.addColorStop(1,'rgba(226,140,92,0)');c.fillStyle=g;c.fillRect(BEAM[0],BEAM[1],BEAM[2],652);c.restore()}
  if(!sub)drawGuides(c,G,dT);
  c.save();c.lineJoin='round';c.lineCap='round';
  [[G,mix?1-mix.m:1]].concat(mix?[[GEO[mix.B],mix.m]]:[]).forEach(([GG,al])=>{c.save();c.globalAlpha=al;
    GG.OUT.forEach(o=>{const p=ease(seg(dT,o.t[0],o.t[1]));if(o.dash)c.setLineDash(o.dash);
      if(o.glow){c.strokeStyle='rgba(255,251,244,.95)';c.lineWidth=8;strokePartial(c,o.p,p)}
      c.strokeStyle=o.a?`rgba(43,30,24,${o.a})`:C.ink;c.lineWidth=o.w;strokePartial(c,o.p,p);
      if(o.dbl){c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1;strokePartial(c,o.dbl,ease(seg(dT,o.t[0]+.3,o.t[1]+.3)))}c.setLineDash([])});
    c.restore()});
  c.restore();
  const lp=ease(seg(dT,3.0,4.4));
  s.tdx=G.tendons.some(T=>T.slide)?slideDx(s):0;
  G.tendons.forEach(T=>drawTendon(c,T,texA,lp,T.slide?s.tdx:0));
  drawLA(c,s,texA);
  drawFascia(c,dT,s);
  if(!sub)drawDepthText(c,dT);
  vesselsNow(G,s).forEach(V=>drawVessel(c,V,texA,lp,s.clock));
  s.nerves.forEach(n=>drawNerve(c,n,texA,ease(seg(dT,3.2,4.4))));
  c.save();polyPath(c,PROBE);c.globalAlpha=ease(seg(dT,1.2,2.4));c.fillStyle='#fbf8f3';c.fill();c.restore();
  c.save();c.strokeStyle=C.ink;c.lineWidth=2.3;c.lineJoin='round';strokePartial(c,PROBE_PATH,ease(seg(dT,.4,2.2)));
  const sl=seg(dT,1.6,2.4);if(sl>0){c.globalAlpha=sl;c.lineWidth=1.4;c.beginPath();c.roundRect?c.roundRect(612,102,316,9,4.5):c.rect(612,102,316,9);c.stroke();
    c.beginPath();c.arc(986,122,5.5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();   // probe marker, on the needle end
    if(!sub){c.font='400 13px Inter, system-ui, sans-serif';c.textAlign='center';c.fillStyle='#7a6456';c.fillText('Probe marker = needle side',770,84);c.beginPath();c.arc(677,80,4,0,Math.PI*2);c.fillStyle='#8f431d';c.fill()}}
  c.restore();
  // orientation: both ends labelled on every view
  const oa=seg(dT,2.2,3.2);
  if(oa>0&&!sub){c.save();c.globalAlpha=oa;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textBaseline='middle';
    c.textAlign='left';c.fillText(G.ends[0],540,130);c.textAlign='right';c.fillText(G.ends[1],970,130);c.restore()}
  if(!sub)(cur.guides||[]).forEach(g=>guideLine(c,t,g[0],g[1],g[2],g[3]));
  drawNeedle(c,s);
}

/* ---------- labels, warnings, overlay ---------- */

// non-red cue for a corrected step or a technique tip (same shape as warnPill, accent colour, tick); optional leader
function cuePill(c,text,x,y,a,anchor){
  const K='#8f431d';c.save();c.globalAlpha=a;c.font='600 17px Inter, system-ui, sans-serif';const w=c.measureText(text).width+46,h=30;
  if(anchor){c.strokeStyle=K;c.lineWidth=1.3;c.beginPath();c.moveTo(x+w/2,y);c.lineTo(anchor[0],anchor[1]);c.stroke();c.beginPath();c.arc(anchor[0],anchor[1],2.6,0,Math.PI*2);c.fillStyle=K;c.fill()}
  c.fillStyle='#fbf4ec';c.beginPath();c.roundRect?c.roundRect(x,y-h/2,w,h,15):c.rect(x,y-h/2,w,h);c.fill();c.strokeStyle=K;c.lineWidth=1.5;c.stroke();
  c.beginPath();c.arc(x+17,y,9,0,Math.PI*2);c.fillStyle=K;c.fill();
  c.strokeStyle='#fbf4ec';c.lineWidth=2;c.lineCap='round';c.beginPath();c.moveTo(x+12.5,y);c.lineTo(x+15.8,y+3.4);c.lineTo(x+21.5,y-3.6);c.stroke();
  c.fillStyle=K;c.textBaseline='middle';c.fillText(text,x+34,y+1);c.restore();
}

function hideA(name,t){const h=cur.hide&&cur.hide[name];return h?1-seg(t,h[0],h[0]+.4)*(1-seg(t,h[1],h[1]+.6)):1}
function drawLabels(c,s){
  const G=GEO[s.view],A=G.labels,a=ease(seg(s.dT,5.8,7));if(a<=0)return;
  A.muscles.forEach(m=>muscleLabel(c,m[0],m[1],m[2],a));
  c.save();c.globalAlpha=a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';if(A.bone)c.fillText(A.bone[0],A.bone[1],A.bone[2]);
  if(A.note){c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText(A.note[0],A.note[1],A.note[2])}c.restore();
  A.pills.forEach(p=>{const h=hideA(p[0],s.t);if(h>0)pill(c,p[0],p[1],p[2],p[3],p[4](s),a*h)});
  (cur.la||[]).forEach(L=>{const t0=L[5]??cur.laT,la=ease(seg(s.t,t0,t0+1))*a;if(la>0)pill(c,L[4],L[0],L[1],L[2],L[3](s),la)});
}
function drawCue(c,s){const q=cur.cue;if(!q)return;const a=seg(s.dT,5,5.6)*(1-seg(s.t,8.3,8.8));if(a>0)cuePill(c,q[0],q[1],q[2],a,q[3](s))}
function drawOverlay(c,s){
  const fa=ease(seg(s.dT,.2,1.2)),t=s.t;
  c.save();c.globalAlpha=fa;
  c.fillStyle=C.ink;c.font='500 38px Fraunces, Georgia, serif';c.fillText('Ankle block',60,74);
  c.fillStyle=cur.neg?RED:'#7a6456';c.font='400 18px Inter, system-ui, sans-serif';c.fillText(cur.subtitle,62,104);
  c.restore();
  if(cur.scan){const la=seg(s.dT,2,3);if(la>0){c.save();c.globalAlpha=la;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText('Probe level',62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const lt=Math.round(s.level)+' cm';c.fillText(lt,152,142);const w=c.measureText(lt).width;
    c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText('above the lateral malleolus',152+w+10,140);c.restore()}}
  const va=seg(t,cur.volT,cur.volT+.6);
  if(va>0){c.save();c.globalAlpha=va;c.fillStyle='#7a6456';c.font='400 16px Inter, system-ui, sans-serif';c.fillText(DRUG,62,140);
    c.fillStyle='#8f431d';c.font='500 26px Fraunces, Georgia, serif';const vt=(s.v||0).toFixed(1)+' / '+cur.vol+' mL';c.fillText(vt,212,142);
    if(s.paused){const w=c.measureText(vt).width;c.fillStyle='#7a6456';c.font='italic 400 18px Fraunces, Georgia, serif';c.fillText('aspirate',212+w+12,141)}
    c.restore()}
  const lg=cur.ledger&&cur.ledger(s,t);
  if(lg&&lg.a>0){c.save();c.globalAlpha=lg.a;c.textAlign='right';c.font='500 16px Inter, system-ui, sans-serif';
    const lw=Math.max(...lg.lines.map(l=>c.measureText(l).width))+28,lh=lg.lines.length*25+14;
    c.fillStyle='rgba(251,247,241,.94)';c.beginPath();c.roundRect?c.roundRect(1554-lw,768-24,lw,lh,12):c.rect(1554-lw,768-24,lw,lh);c.fill();c.strokeStyle='rgba(43,30,24,.2)';c.lineWidth=1;c.stroke();
    c.font='400 16px Inter, system-ui, sans-serif';
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
  const M=cur.mag,CX=300,CY=M.CY,R=M.R,Z=M.Z,F=M.focus(s),FR=R/Z;
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
    const lines=M.text;lines.forEach((l,i)=>c.fillText(l,CX+R+22,CY+R-10-(lines.length-1-i)*24))}
  c.restore();
}

/* ---------- probe position view ----------
   SURF: hand-drawn surface views of the right ankle, one per tab, in canvas px (cm = 40 px). Each view is drawn as it
   really looks; the probe end labels map it onto the scan. Probe pose: cur.pose(t,s) -> {x,y,rot,a}. Along the probe,
   +a points to the scan's screen-left end and -a to the marker (needle) end; the needle lies in plane, at axial position
   (scanCx - scan x) / scanCm cm from the probe centre. */
const up=(P,d)=>P.map(([x,y])=>[x,y-d]);
const SURF={
  medial:{view:'Right ankle, medial view',fade:[[0,40,1,0],[760,840,0,1]],
    body:[up([[560,60],[568,200],[575,300],[588,500],[596,560],[588,600]],60),up([[588,600],[530,628],[450,660],[300,720],[200,752],[160,770]],60),up([[160,770],[148,786],[160,800]],60),
      up([[160,800],[300,820],[600,826],[880,810]],60),up([[880,810],[960,780],[985,700],[960,640]],60),up([[960,640],[935,500],[960,300],[1000,60]],60)],
    lines:[{P:up([[900,300],[903,460],[906,620]],60),w:1.1,a:.32},{P:up([[880,300],[884,460],[890,610]],60),w:1.1,a:.22},
      {P:up([[620,650],[635,560],[655,400],[700,200],[740,60]],60),w:1.5,a:.45,dash:[8,6],t:[2,3.6]},
      {P:up([[780,300],[790,610],[780,700],[700,790]],60),w:1.3,a:.35,dash:[3,5],t:[2,3.6]}],
    bumps:[[680,530,34]],dots:[[680,530],[930,660]],pulse:[792,596],
    pills:[['Medial malleolus',470,470,'right',()=>[680,530]],['Posterior tibial pulse',1080,690,'left',c=>c.pulse],
      ['Achilles tendon',1080,330,'left',()=>[903,330]],['Great saphenous vein',470,250,'right',()=>[686,202]]],
    extra(c,s,cfg){if(cur.key!=='saphenous')return;const a=ease(seg(s.dT,1,2));if(a<=0)return;
      c.save();c.globalAlpha=a*.85;c.fillStyle='rgba(143,67,29,.22)';c.strokeStyle='#8f431d';c.lineWidth=1.6;c.beginPath();c.roundRect?c.roundRect(560,22,446,16,6):c.rect(560,22,446,16);c.fill();c.stroke();
      [640,760,880].forEach(x=>{c.beginPath();c.moveTo(x-8,62);c.lineTo(x,52);c.lineTo(x+8,62);c.stroke()});c.restore();
      if(!cfg.inset&&cfg.labels!==false)pill(c,'Tourniquet: mid or proximal calf',1060,30,'left',[1006,30],a*(s.labels===false?0:1))}},
  anterior:{view:'Right ankle, anterior view',fade:[[40,110,1,0],[740,840,0,1]],
    body:[[[660,60],[655,250],[650,400],[642,540],[618,590],[614,630],[628,660],[600,720],[575,820]],[[575,820],[1010,820]],[[1010,820],[990,700],[958,610],[970,580],[968,545],[945,500],[935,400],[932,250],[930,60]]],
    lines:[{P:[[870,300],[876,450],[890,600],[925,700]],w:1.2,a:.32},{P:[[810,320],[812,550],[840,680],[880,800]],w:1.6,a:.5},
      {P:[[740,330],[735,550],[725,640]],w:1.2,a:.32},{P:[[725,640],[690,720],[650,800]],w:1,a:.25},{P:[[725,640],[730,720],[730,800]],w:1,a:.25},{P:[[725,640],[770,720],[800,800]],w:1,a:.25},
      {P:[[785,300],[790,600],[792,700],[790,780]],w:1.5,a:.42,dash:[8,6],t:[2,3.6]},
      {P:[[662,530],[930,512]],w:1,a:.4,t:[1.8,3.4]},{P:[[662,562],[932,544]],w:1,a:.4,t:[1.8,3.4]},
      {P:[[650,640],[800,676],[952,606]],w:1,a:.22,t:[1.8,3.4]},{P:[[800,676],[836,760]],w:1,a:.22,t:[1.8,3.4]},
      {P:[[634,612],[958,563]],w:1.1,a:.4,dash:[3,5],t:[2,3.6]}],
    band:[[662,530],[930,512],[932,544],[662,562]],
    bumps:[],dots:[[634,612],[958,563]],pulse:[792,652],
    pills:[['Lateral malleolus',470,660,'right',()=>[634,612]],['Medial malleolus',1100,600,'left',()=>[958,563]],
      ['Extensor hallucis longus',1100,420,'left',()=>[811,420]],['Dorsalis pedis pulse',1100,690,'left',c=>c.pulse]]},
  lateral:{view:'Right ankle, lateral view',fade:[[0,50,1,0],[780,860,0,1]],
    body:[[[640,40],[650,250],[660,400],[680,540],[700,620],[690,690],[705,760],[730,790]],[[730,790],[900,805],[1200,800],[1440,790]],[[1440,790],[1470,775],[1450,755]],
      [[1450,755],[1300,700],[1150,655],[1040,615],[1000,580]],[[1000,580],[988,400],[985,250],[990,40]]],
    lines:[{P:[[830,40],[834,300],[840,580]],w:1.2,a:.3,dash:[6,6]},{P:[[690,250],[700,450],[710,640]],w:1.1,a:.3},
      {P:[[910,40],[915,120],[920,215]],w:1.4,a:.4,dash:[3,5],t:[2,3.6]},{P:[[920,215],[935,400],[950,600],[1000,680],[1050,720]],w:1.6,a:.5,t:[2,3.6]},
      {P:[[720,200],[735,400],[745,520],[765,640],[800,690],[860,715],[960,730]],w:1.5,a:.42,dash:[8,6],t:[2,3.6]}],
    bumps:[[840,610,30]],dots:[[840,610],[920,215]],
    pills:[['Lateral malleolus',1080,560,'left',()=>[840,610]],['Achilles tendon',520,420,'right',()=>[700,450]],
      ['Superficial peroneal nerve pierces fascia',1060,140,'left',()=>[920,215]],['Sural nerve and small saphenous vein',520,640,'right',()=>[760,630]]],endsUp:true}
};
SURF.medial.cm=SURF.anterior.cm=SURF.lateral.cm=40;
for(const k in SURF)Object.assign(SURF[k],{scanCx:766,scanCm:PXCM,skinY:147,probeLen:2.5,probeW:.9,needleLen:3.5});
// lateral view drawn at 0.85 scale about the sole (cm = 34 px) so the probe stays on the leg from 6 to 14 cm up
(function(){const k=.85,ox=840,oy=800,T=([x,y])=>[ox+(x-ox)*k,oy+(y-oy)*k],S=SURF.lateral;
  const ext=P=>{const Q=P.map(T);if(P[0][1]<=40)Q.unshift([Q[0][0],40]);if(P[P.length-1][1]<=40)Q.push([Q[Q.length-1][0],40]);return Q};
  S.body=S.body.map(ext);S.lines.forEach(L=>{L.P=ext(L.P)});S.bumps=S.bumps.map(([x,y,r])=>T([x,y]).concat(r*k));S.dots=S.dots.map(T);
  S.pills.forEach(p=>{const f=p[4];p[4]=(c,P)=>T(f(c,P))});S.cm=40*k;S.T=T})();
// probe poses per scenario: slides into place during the intro
const slide=(s,x,y,dy,rot)=>{const k=ease(seg(s.dT,2.4,4));return{x,y:y-(1-k)*dy,rot,a:k}};
SC.tibial.pose=SC.tibialAbove.pose=(t,s)=>slide(s,790,540,80,Math.PI);
SC.saphenous.pose=(t,s)=>slide(s,650,440,70,Math.PI);
SC.dpn.pose=(t,s)=>slide(s,790,555,85,0);
SC.spn.pose=(t,s)=>slide(s,...SURF.lateral.T([922,215]),60,Math.PI);
SC.spnTrace.pose=(t,s)=>{const p=slide(s,...SURF.lateral.T([922,215]),60,Math.PI);p.y-=SURF.lateral.cm*(SC.spnTrace.lvl(t)-10);return p};
SC.sural.pose=(t,s)=>slide(s,...SURF.lateral.T([760,550]),60,Math.PI);
SC.saphenous.cable=3.6;SC.sural.cable=2.4;SC.spn.cable=SC.spnTrace.cable=-1.6;
SC.tibial.ppill=SC.tibialAbove.ppill=['Probe: transverse behind the medial malleolus',1080,590,'left'];
SC.saphenous.ppill=['Probe: transverse anterior to the medial malleolus',470,410,'right'];
SC.dpn.ppill=['Probe: transverse at the extensor retinaculum',470,470,'right'];
SC.spn.ppill=['Probe: transverse 10 cm above the lateral malleolus',1060,400,'left'];
SC.spnTrace.ppill=[s=>'Probe: '+Math.round(s.level)+' cm above the lateral malleolus',1060,400,'left'];
SC.sural.ppill=['Probe: transverse behind the lateral malleolus',520,760,'right'];
// drawSurface: line-art surface view with probe and in-plane needle at the time in s
function drawSurface(c,s,cfg){
  const dT=s.dT,lp=ease(seg(dT,.6,2.8)),ink='rgba(43,30,24,',lw=cfg.lw||1;
  const line=(P,w,a,p=lp,dash)=>{c.save();c.lineJoin='round';c.lineCap='round';c.strokeStyle=ink+a+')';c.lineWidth=w*lw;if(dash)c.setLineDash(dash);strokePartial(c,mkPath(spline(P,false)),p);c.restore()};
  const body=[];cfg.body.forEach(P=>body.push(...spline(P,false)));
  c.save();c.globalAlpha=ease(seg(dT,1.2,3));polyPath(c,body);const g=c.createLinearGradient(0,40,0,820);g.addColorStop(0,'rgba(243,223,204,.9)');g.addColorStop(1,'rgba(243,223,204,.45)');c.fillStyle=g;c.fill();
  if(cfg.band){polyPath(c,cfg.band);c.fillStyle='rgba(176,110,70,.10)';c.fill()}c.restore();
  cfg.body.forEach(P=>line(P,2.2,.9));
  cfg.lines.forEach(L=>line(L.P,L.w,L.a,L.t?ease(seg(dT,L.t[0],L.t[1])):lp,L.dash));
  cfg.fade.forEach(([y0,y1,a0,a1])=>{const fg=c.createLinearGradient(0,y0,0,y1);fg.addColorStop(0,`rgba(244,236,225,${a0})`);fg.addColorStop(1,`rgba(244,236,225,${a1})`);c.fillStyle=fg;c.fillRect(0,a0?0:y0,W,a0?y1:H-y0)});
  const la=ease(seg(dT,2,3));
  c.save();c.globalAlpha=la;c.strokeStyle='rgba(43,30,24,.5)';c.lineWidth=1.2*lw;cfg.bumps.forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke()});
  c.strokeStyle=C.ink;c.lineWidth=1.6*lw;cfg.dots.forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,Math.PI*2);c.fillStyle='#fbf8f3';c.fill();c.stroke();c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fillStyle=C.ink;c.fill()});
  if(cfg.pulse){const pu=reduceMotion?0:Math.pow(Math.max(0,Math.sin(s.clock*Math.PI*2*1.15)),6),[px,py]=cfg.pulse;
    c.strokeStyle='#8f431d';[10,16+pu*5].forEach((r,i)=>{c.globalAlpha=la*(i?.45:.9);c.beginPath();c.arc(px,py,r,0,Math.PI*2);c.stroke()})}
  c.restore();
  if(cfg.extra)cfg.extra(c,s,cfg);
  // probe
  const pr=cur.pose(s.t,s),cs=Math.cos(pr.rot),sn=Math.sin(pr.rot),cm=cfg.cm;
  const P=(a,o)=>[pr.x+cs*a*cm-sn*o*cm,pr.y+sn*a*cm+cs*o*cm];
  const hl=cfg.probeLen/2,hw=cfg.probeW/2,G=GEO[s.view];
  if(pr.a>0){c.save();c.globalAlpha=pr.a;
    const dc=(cur.cable||0)*cm,cab=[[pr.x,pr.y-hw*cm],[pr.x+.2*cm+dc*.3,pr.y-(hw+1.6)*cm],[pr.x-.4*cm+dc*.7,pr.y-(hw+3.4)*cm],[pr.x+.3*cm+dc,pr.y-(hw+5.6)*cm]];
    c.strokeStyle=C.ink;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(...cab[0]);c.bezierCurveTo(...cab[1],...cab[2],...cab[3]);c.stroke();c.strokeStyle='#fbf8f3';c.lineWidth=4;c.stroke();
    c.translate(pr.x,pr.y);c.rotate(pr.rot);c.beginPath();c.roundRect?c.roundRect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm,10):c.rect(-hl*cm-8,-hw*cm,hl*2*cm+16,hw*2*cm);
    c.fillStyle='#fbf8f3';c.fill();c.strokeStyle=C.ink;c.lineWidth=2.3;c.stroke();
    c.beginPath();c.moveTo(-hl*cm,3);c.lineTo(hl*cm,3);c.strokeStyle='rgba(43,30,24,.4)';c.lineWidth=1.2;c.stroke();
    // orientation marker on the needle end, matching screen right on the scan
    c.beginPath();c.arc(-hl*cm+7,0,5,0,Math.PI*2);c.fillStyle='#8f431d';c.fill();c.restore();
    if(!cfg.inset){c.save();c.globalAlpha=pr.a*.9;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';
      const o=(pr.rot?-1:1)*(cfg.endsUp?-1:1)*(hw+.6),Lp=P(-hl-.3,o),Mp=P(hl+.3,o);c.fillText(G.ends[1],Lp[0],Lp[1]);c.fillText(G.ends[0],Mp[0],Mp[1]);c.restore()}}
  // in-plane needle from the marker end; depth from the scan state (a steeper needle shows a shorter shaft from above)
  if(s.na>0&&s.tip[0]>-50){
    const [tx,ty]=s.tip,S=s.S,at=(cfg.scanCx-tx)/cfg.scanCm,dd=Math.hypot(tx-S[0],ty-S[1]),ah=at-cfg.needleLen*(dd?Math.abs(tx-S[0])/dd:1);
    const ae=ty>cfg.skinY?(cfg.scanCx-(S[0]+(tx-S[0])*(cfg.skinY-S[1])/(ty-S[1])))/cfg.scanCm:at;
    c.save();c.globalAlpha=s.na;c.lineCap='round';
    const h=P(ah,0),e=P(ae,0),tp=P(at,0);
    c.beginPath();c.moveTo(...h);c.lineTo(...e);c.strokeStyle='#2f3035';c.lineWidth=6;c.stroke();c.strokeStyle='#a9adb6';c.lineWidth=3.4;c.stroke();
    if(at>ae){c.setLineDash([7,6]);c.beginPath();c.moveTo(...e);c.lineTo(...tp);c.strokeStyle='rgba(47,48,53,.75)';c.lineWidth=2.2;c.stroke();c.setLineDash([]);
      c.beginPath();c.arc(...e,5,0,Math.PI*2);c.strokeStyle=C.ink;c.lineWidth=1.3;c.stroke()}
    const h2=P(ah-.9,0);c.beginPath();c.moveTo(...h);c.lineTo(...h2);c.strokeStyle='#7a6456';c.lineWidth=12;c.stroke();c.restore()}
  // labels
  const a=cfg.labels===false?0:ease(seg(dT,3.4,4.6))*(s.labels===false?0:1);
  if(a>0){cfg.pills.forEach(p=>pill(c,p[0],p[1],p[2],p[3],p[4](cfg,P),a));
    const q=cur.ppill;if(q)pill(c,typeof q[0]==='function'?q[0](s):q[0],q[1],q[2],q[3],P(0,0),a);
    c.save();c.globalAlpha=a;c.fillStyle='#7a6456';c.font='400 15px Inter, system-ui, sans-serif';c.textAlign='right';c.fillText(cfg.view,1540,110);c.restore()}
}
// small picture-in-picture of drawSurface: during the intro, and for the whole scan in the scanning scenario
const INSET={x:1236,y:96,w:300,h:190},INSRC={medial:[330,20,1000],anterior:[300,150,1000],lateral:[380,60,1000]};
function drawInset(c,s){
  const a=seg(s.dT,1,1.6)*(cur.scan?1:(1-seg(s.dT,6.8,7.5))*(started?0:1));if(a<=0)return;
  const I=INSET,src=INSRC[cur.surf],k=I.w/src[2];
  c.save();c.globalAlpha=a;c.beginPath();c.rect(I.x,I.y,I.w,I.h);c.fillStyle=C.paper;c.fill();c.clip();
  c.translate(I.x,I.y);c.scale(k,k);c.translate(-src[0],-src[1]);drawSurface(c,Object.assign({},s,{dT:9,na:0}),Object.assign({},SURF[cur.surf],{labels:false,inset:true,lw:2.4}));c.restore();
  c.save();c.globalAlpha=a;c.strokeStyle=C.ink;c.lineWidth=1.3;c.strokeRect(I.x,I.y,I.w,I.h);
  c.fillStyle='rgba(251,247,241,.9)';c.fillRect(I.x+1,I.y+1,118,24);c.fillStyle=C.ink;c.font='500 14px Inter, system-ui, sans-serif';c.textBaseline='middle';c.fillText('Probe position',I.x+9,I.y+14);c.restore();
}

/* ---------- render (the page's render(), reading the player state from P) ---------- */

const ARIA={tibial:'tibial nerve',tibialAbove:'tibial nerve, negative example',saphenous:'saphenous nerve',dpn:'deep peroneal nerve',spn:'superficial peroneal nerve',spnTrace:'superficial peroneal nerve, traced up the leg',sural:'sural nerve'};
function render(P){
  const t=TS0+P.playT;
  const s=cur.state(t);s.dT=P.dT;s.t=t;s.clock=P.clock;s.labels=showLabels;
  if(probeView){ctx.drawImage(paperC,0,0,W,H);drawSurface(ctx,s,SURF[cur.surf]);drawOverlay(ctx,s);return}
  core(ctx,s,false);
  if(showLabels){drawLabels(ctx,s);drawCue(ctx,s)}
  if(cur.warnings)cur.warnings(ctx,t,s);
  drawMagnifier(ctx,s);
  drawOverlay(ctx,s);
  drawInset(ctx,s);
}
return {
  SC, TABS,
  curScen: {medial:'tibial', anterior:'dpn', lateral:'spn'},
  defaultTab: 'medial',
  sync(P){cur=P.cur;started=P.started;showLabels=P.showLabels;probeView=P.probeView},
  render,
  onScenario(cur){tissue(cur.view);if(cur.key==='spnTrace'){tissue('spn6');tissue('spn14')}},
  aria(P){return (P.probeView?'Probe position on the right ankle for the ':'Animated ultrasound-guided ankle block: ')+ARIA[P.cur.key]},
  introOnScenario: true,
  release(){for(const k in tissueCache){tissueCache[k].width=0;delete tissueCache[k]}}
};
});
