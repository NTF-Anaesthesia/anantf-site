// BIS to DSA teaching simulator (eeg/NOTES.md). Synthetic EEG -> FFT -> DSA columns -> a teaching BIS estimate.
// ===== EEG engine (shared with page) =====
const FS=128, NWIN=256, HOP=128, DF=FS/NWIN; // 0.5 Hz bins
const OSC_F=[]; for(let f=0.5;f<=47;f+=0.5) OSC_F.push(f);
function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
// spectral profile parameters (power units ~ uV^2 per 0.5 Hz bin)
const KEYS=['bg','slow','delta','theta','thetaF','alpha','alphaF','beta','betaF','betaW','gamma','spindle','emg','bs','ar'];
const S=(o)=>Object.assign({bg:6,slow:0,delta:0,theta:0,thetaF:6,alpha:0,alphaF:10,beta:0,betaF:20,betaW:4.5,gamma:0,spindle:0,emg:0,bs:0,ar:0},o); // ar: arousal beta at 18 Hz (surgical stimulus)
// awake: low amplitude, about 10 uV RMS (anaesthetised EEG is 5-20x the power; Purdon 2015), shared by every drug.
// Some frontal theta, a beta band and little alpha (eyes open); eye movements add delta on top (Engine.eyeK).
const AWAKE=S({bg:0.6,theta:1.2,thetaF:5.5,alpha:1,alphaF:10,beta:2.1,betaF:21,gamma:0.9});
const DRUGS={
 propofol:[[0,AWAKE],
  [0.15,S({bg:2.5,slow:2,delta:1,beta:7,betaF:17,gamma:1,alpha:1})],
  [0.32,S({bg:6,slow:25,delta:8,theta:2,alpha:14,alphaF:12,beta:5,betaF:15,gamma:0.6})],
  [0.55,S({bg:7,slow:125,delta:30,theta:4,alpha:64,alphaF:10.5,beta:0.8,betaF:15,gamma:0.1})],
  [0.75,S({bg:5,slow:190,delta:45,theta:4,alpha:16,alphaF:9,beta:0.2,betaF:14})],
  [0.8,S({bg:5,slow:182,delta:41,theta:3.6,alpha:15.6,alphaF:9,beta:0.2,betaF:14})], // no suppression yet in a young adult
  [0.88,S({bg:7,slow:170,delta:35,theta:3,alpha:15,alphaF:9,beta:0.2,bs:0.4})],
  [1,S({bg:7,slow:170,delta:35,theta:3,alpha:10,alphaF:9,beta:0.2,bs:1})]],
 // sevoflurane: theta at about 5 Hz, slightly stronger alpha than propofol; suppression never complete at clinical doses
 sevo:[[0,AWAKE],
  [0.15,S({bg:2.5,slow:2,delta:1,beta:7,betaF:17,gamma:1,alpha:1,thetaF:5})],
  [0.32,S({bg:6,slow:25,delta:8,theta:3,thetaF:5,alpha:14,alphaF:11.5,beta:5,betaF:15,gamma:0.6})],
  [0.55,S({bg:7,slow:90,delta:20,theta:22,thetaF:5,alpha:82,alphaF:10,beta:0.8,betaF:15,gamma:0.1})],
  [0.75,S({bg:7,slow:150,delta:45,theta:40,thetaF:5,alpha:30,alphaF:9,beta:0.4})],
  [0.88,S({bg:7,slow:150,delta:40,theta:25,thetaF:5,alpha:15,alphaF:8.5,beta:0.2,bs:0.4})],
  [1,S({bg:7,slow:150,delta:40,theta:20,thetaF:5,alpha:10,alphaF:8.5,bs:0.6})]],
 // ketamine: gamma 27-40 Hz with slow-delta, little 13-24 Hz, no alpha (Akeju 2016)
 ketamine:[[0,AWAKE],
  [0.3,S({bg:5,slow:6,delta:3,theta:3,alpha:1,beta:10,betaF:28,betaW:3,gamma:4})],
  [0.6,S({bg:6,slow:60,delta:15,theta:11,alpha:0.3,beta:9,betaF:31,betaW:4,gamma:6})],
  [1,S({bg:6,slow:90,delta:25,theta:12,alpha:0.3,beta:9,betaF:31,betaW:4,gamma:6})]],
 // dexmedetomidine: spindles ~12 dB below propofol alpha, slow power ~14 dB below propofol GA (Akeju 2014)
 dex:[[0,AWAKE],
  [0.4,S({bg:1.2,slow:9,delta:5,theta:2,spindle:6,alphaF:13,beta:0.7,betaF:16,gamma:0.3})],
  [0.8,S({bg:7,slow:35,delta:12,theta:3,spindle:2.5,alphaF:13,beta:0.6,gamma:0.1})],
  [1,S({bg:7,slow:45,delta:32,theta:3,spindle:0.8,alphaF:13,beta:0.5})]],
};
const cl=x=>Math.max(0,Math.min(1,x));
function baseTarget(drug,d){
 const kf=DRUGS[drug]; let i=0; while(i<kf.length-2&&d>kf[i+1][0])i++;
 const [d0,a]=kf[i],[d1,b]=kf[i+1]; const t=cl((d-d0)/(d1-d0));
 const p={}; for(const k of KEYS)p[k]=a[k]+(b[k]-a[k])*t;
 p.kS=drug==='ketamine'&&d>0.45?1:0; // ketamine anaesthesia: gamma bursts alternate with slow waves
 return p;
}
// Drug mix (a teaching approximation, not an interaction model): propofol (effect-site ug/ml) and sevoflurane (MAC)
// add into one hypnotic depth; remifentanil (ng/ml), dexmedetomidine and N2O deepen it a little; then ketamine,
// dexmedetomidine, remifentanil and N2O each add their own EEG signature on top.
const MIX0={propofol:0,sevo:0,ketamine:0,dex:0,remi:0,n2o:0};
const MIXMAX={propofol:8,sevo:2,remi:8,ketamine:1,dex:1,n2o:0.7}; // slider ranges
const MAC=[[0,0],[0.3,0.3],[0.5,0.44],[1,0.6],[1.5,0.76],[2,0.88]]; // sevoflurane MAC -> depth
function sevoDepth(mac){let i=0;while(i<MAC.length-2&&mac>MAC[i+1][0])i++;const [x0,y0]=MAC[i],[x1,y1]=MAC[i+1];return y0+(y1-y0)*cl((mac-x0)/(x1-x0));}
function mixTarget(m,bsShift){
 const dP=m.propofol*0.155,dS=sevoDepth(m.sevo),sh=dP+dS>0?dS/(dP+dS):0,hyp=Math.min(0.95-0.05*sh,dP+dS),on=hyp>0.05?1:0;
 // remifentanil: no BIS effect before stimulation (Guignard 2000); only high doses deepen
 const dH=cl(hyp+0.004*Math.max(0,m.remi-4)+0.12*m.dex*on+0.15*m.n2o);
 const a=baseTarget('propofol',dH),b=baseTarget('sevo',dH),p={};
 for(const k of KEYS)p[k]=a[k]*(1-sh)+b[k]*sh;
 if(bsShift){const d2=cl(dH+bsShift);p.bs=baseTarget('propofol',d2).bs*(1-sh)+baseTarget('sevo',d2).bs*sh;}
 const k=m.ketamine,x=m.dex,r=m.remi,n=m.n2o;
 // ketamine: with a hypnotic, gamma and 31-Hz beta on top, less alpha and slow; alone, the ketamine keyframes
 if(k>0){const h=cl(hyp/0.2),c=cl(k*2);p.gamma+=6*k;p.beta+=6*k;p.betaF+=(31-p.betaF)*c;p.betaW+=(4-p.betaW)*c;p.alpha*=1-0.85*cl(k*1.5);
  p.slow*=1-0.4*cl(k);p.theta*=1-0.3*k;p.bs*=1-cl(k*1.5);
  if(h<1){const kt=baseTarget('ketamine',k);for(const q of KEYS)p[q]=kt[q]*(1-h)+p[q]*h;}}
 if(r>6){p.delta+=1.5*(r-6);p.slow+=2*(r-6);}
 // Propofol + dexmedetomidine: weaker, slower alpha alongside more slow activity (Zhang 2021).
 // Directional teaching effect only; relative dex levels are not clinical dose conversions.
 if(x>0){const c=cl(x*2),pa=c*on*(1-sh);p.spindle+=6*x*(1-0.5*dH);p.alpha*=10**(-0.18*pa);p.alphaF-=0.9*pa;p.slow+=25*x;p.delta+=8*x;p.beta*=1-0.8*c;p.gamma*=1-0.8*c;}
 if(n>0){p.gamma+=0.7*n;p.beta+=0.5*n;p.alpha*=1-0.2*n;p.slow*=1-0.2*n;p.delta*=1-0.2*n;}
 p.dH=Math.max(dH,k);p.sh=sh;p.kS=k>0.45&&k/(k+hyp)>0.5?1:0;return p;
}
function target(drug,d,mods){mods=mods||{};
 const p=drug==='mix'?mixTarget(Object.assign({},MIX0,d),mods.elderly?0.12:0):baseTarget(drug,d);
 // older brain (Purdon 2015): much less power, alpha ~9 dB lower and ~1 Hz slower, suppression at a lighter depth
 if(mods.elderly){p.alpha*=0.12;p.slow*=0.32;p.delta*=0.32;p.theta*=0.4;p.bg*=0.5;p.beta*=0.6;p.spindle*=0.4;
  p.alphaF-=drug==='sevo'?0.5:drug==='mix'?1-0.5*p.sh:1;if(drug!=='mix')p.bs=baseTarget(drug,d>=0.96?d:Math.min(0.95,d+0.12)).bs;} // shifted, but never isoelectric unless the slider is
 // muscle relaxant: no facial EMG, and the muscle share of the awake fast activity goes too (stage 1, at once)
 // the fast-power cut scales with how light the patient is (lt): under GA only the EMG goes
 const nk=mods.nmbK??(mods.nmb?1:0);if(nk>0){const lt=cl((0.45-(p.dH??d))/0.3)*nk;p.emg*=1-nk;p.gamma*=1-0.95*lt;p.beta*=1-0.75*lt;}
 // one-sided change (the Asymmetry control): the affected hemisphere's EEG slows, as with unilateral ischaemia or a regional block effect
 if(mods.asym&&mods.asym===mods.side){p.alpha*=0.35;p.beta*=0.45;p.gamma*=0.45;p.slow+=18;p.delta+=6;}
 // facial EMG; an opioid blunts the response to surgery, so less of it
 if(mods.emg){p.emg=Math.max(p.emg,6*(drug==='mix'?Math.max(0.25,1-(d.remi||0)/6):1)*(1-nk));}
 // relaxant stage 2 (Engine nmbS, after ~60 s in a light patient): fast power falls further, slow waves appear (Schuller 2015)
 const ns=mods._nmbSlow||0;if(ns>0){p.beta*=1-0.6*ns;p.gamma*=1-0.8*ns;p.betaF-=3*ns;p.slow+=25*ns;p.delta+=8*ns;}
 return p;
}
// forced-air warmer: broadband 30-47 Hz pickup (Hemmerling & Fortier 2002); Engine.wa is its amplitude (power wa²)
const WARM=6;
function profile(p,f,spEnv,spF,kg,ks,wa){
 const g=(c,w)=>Math.exp(-((f-c)**2)/(2*w*w));
 let P=p.bg/(0.6+f)*3+p.ar*g(18,4)+(wa?wa*wa*WARM*cl((f-28)/4):0);
 P+=p.slow*ks*g(0.75,0.45)+p.delta*g(2.5,1)+p.theta*g(p.thetaF,1)+p.alpha*g(p.alphaF,1.1)
   +p.spindle*spEnv*g(spF,1.0)+kg*(p.beta*g(p.betaF,p.betaW)+p.gamma*g(34,5))+p.emg*(f>18?Math.min(1,(f-18)/15):0);
 return P;
}
// Effect site: the dose the brain 'feels' follows the target dose with a first-order lag, so moving the slider changes the
// EEG over a minute or two (the DSA 'unzips' from one pattern to the next) instead of at once. Real propofol and sevoflurane
// effect-site half-times are about 2-3 min. Induction is a bolus and quick (12 s here); emergence is slow (120 s here, so a
// patient takes a few minutes to wake and the DSA unzips back); speed 4x or 10x shortens both.
const TAU_UP=12,TAU_DOWN=120;
// case length (owner, 14 Oct 2026): the effect site empties more slowly after a long case, drug by drug (context-sensitive half-time).
// Time constant = TAU_DOWN x (1 + (L-1) x CSENS): L 1 short, 2.5 medium, 5 long; remifentanil and N2O do not accumulate.
const CASEL={short:1,medium:2.5,long:5},CSENS={propofol:0.9,sevo:0.5,ketamine:0.4,dex:0.9,remi:0,n2o:0};
const tauDown=(q,m)=>TAU_DOWN*(1+((CASEL[m&&m.caseLen]||1)-1)*(CSENS[q]??0.9));
const cloneD=d=>typeof d==='number'?d:Object.assign({},MIX0,d);
// is the patient 'induced' (asleep enough that a relaxant would be given)? Hysteresis: given at 0.30, reversed under 0.25.
// propofol/sevo depth; ketamine 0.45 anaesthetic dose; mix: hypnotic depth or ketamine; dex alone never.
function inducedDepth(drug,d){
 if(drug==='propofol'||drug==='sevo')return d;
 if(drug==='ketamine')return d/1.5;
 if(drug==='mix')return Math.max(0.155*d.propofol+sevoDepth(d.sevo),d.ketamine/1.5);
 return 0;}
class Engine{
 constructor(){this.ph=OSC_F.map(()=>Math.random()*6.283);this.m=OSC_F.map(()=>1);this.p=target('propofol',0);
  this.t=0;this.spT=1;this.spOn=false;this.spD=1;this.spF=12;this.kT=3;this.kPh=0;this.kg=1;this.ks=1;this.bsState=0;this.bsTimer=1;this.gate=1;this.drug='propofol';this.d=0;this.mods={};this.diT=0;this.diOn=false;this.nmbT=0;this.nmbS=0;this.tone=1;this.diAcc=0;this.artAcc=0;this.tail=0;this.tailV=0;
  this.wa=0;this.stT=0;this.stK='';this.blT=2;this.blA=0;this.blP=1;this.dr=0;this.eye=0;this.eyeK=0;this.de=0;this.nmbOn=false;}
 setTarget(drug,d,mods){if(drug!==this.drug||typeof d!==typeof this.d||this.de===0&&!this.deSet)this.de=cloneD(d);this.deSet=true;this.drug=drug;this.d=d;this.mods=mods||{};}
 snap(){this.de=cloneD(this.d);this.updNmb();this.p=target(this.drug,this.de,this.mods);this.wa=this.mods.warmer?1:0;this.eyeK=this.eyeT(this.p,this.mods.nmbK??(this.mods.nmb?1:0));} // jump instantly
 // muscle relaxant given at induction (nmbMode 'auto'), always ('on') or never ('off'); sets mods.nmb, which target() reads.
 // Only when the page set a mode: the Node checks drive mods.nmb directly.
 updNmb(){const m=this.mods;if(!m.nmbMode||m.nmbK!==undefined)return; // the page's block model (nm) sets nmbK for the live engine
  if(m.nmbMode==='on')this.nmbOn=true;else if(m.nmbMode==='off')this.nmbOn=false;
  else{const v=inducedDepth(this.drug,this.de);if(v>=0.3)this.nmbOn=true;else if(v<0.25)this.nmbOn=false;}
  m.nmb=this.nmbOn;}
 // eye movement share (sample, below): 1 with the blink control, else 0.5 while awake, 0 from depth 0.2 or under a relaxant
 eyeT(tg,nk){return this.mods.blink?1:(1-nk)*0.5*cl((0.2-(tg.dH??(typeof this.de==='number'?this.de:0)))/0.12);}
 // how far the effect site still is from the target, 0-1 (each drug as a share of its slider range)
 gap(){const d=this.d,e=this.de;if(typeof d==='number')return Math.abs(d-e);
  let g=0;for(const k in MIX0)g=Math.max(g,Math.abs((d[k]||0)-(e[k]||0))/(MIXMAX[k]||1));return g;}
 // surgical stimulus: a 100-s arousal; kind 'delta' (paradoxical delta arousal) or '' (beta when light, alpha dip when deeper)
 stimulus(kind){this.stT=100;this.stK=kind??(Math.random()<0.1?'delta':'');}
 sample(){ // one sample at FS
  const dt=1/FS; this.t+=dt;
  const m=this.mods,de=this.de,au=dt/TAU_UP;
  if(typeof de==='number')this.de+=(this.d-de)*(this.d>de?au:dt/tauDown(this.drug,m));else for(const q in MIX0){const t=this.d[q]||0;de[q]+=(t-de[q])*(t>de[q]?au:dt/tauDown(q,m));}
  this.updNmb();
  const tg=target(this.drug,this.de,m); const k=dt/8; // ~8 s time constant: the spectrum glides to the effect-site state
  // surgical stimulus (García 2021, Hight 2019), blunted by remifentanil b = remi/4 (mix only): light (dH < 0.5) beta at
  // 18 Hz and facial EMG; deeper the alpha band dips 3.5 dB, or 1 in 10 a paradoxical delta arousal (BIS falls)
  if(this.stT>0){this.stT-=dt;const u=1-(this.drug==='mix'?cl((this.de.remi||0)/4):0),dh=tg.dH??this.de;
   if(this.stK==='beta'||this.stK!=='alpha'&&this.stK!=='delta'&&dh<0.5){tg.ar+=8*u;if(!m.nmb)tg.emg=Math.max(tg.emg,6*u);}else if(this.stK==='delta'){tg.delta*=1+u;tg.beta*=1-0.5*u;}else tg.alpha*=10**(-0.35*u);}
  for(const key of KEYS)this.p[key]+=(tg[key]-this.p[key])*k;
  // relaxant stage 2: starts 60 s after the relaxant, only while the hypnotic is light; τ 120 s on, 30 s off
  if(m.nmb){this.nmbT+=dt;if(this.nmbT>60&&(tg.dH??this.de)<0.3)this.nmbS+=(1-this.nmbS)*dt/120;}else{this.nmbT=0;this.nmbS-=this.nmbS*dt/30;}
  m._nmbSlow=this.nmbS;
  // facial muscle tone for the EMG readout: full while awake (dH < 0.3), a little under GA, none when paralysed
  const nk=m.nmbK??(m.nmb?1:0),tT=(1-nk)*(0.12+0.88*cl((0.5-(tg.dH??this.de))/0.2))+nk*0.05;this.tone+=(tT-this.tone)*dt/5;
  // forced-air warmer pickup: on within seconds; once off its amplitude fades with τ 60 s (power τ 30 s), so the true
  // BIS is back in 2-3 min
  this.wa+=m.warmer?(1-this.wa)*dt/3:-this.wa*dt/60;
  // spindles: 0.5-2 s bursts every 3-8 s, each centred somewhere in 11-14 Hz
  this.spT-=dt;if(this.spT<=0){this.spOn=!this.spOn;if(this.spOn){this.spD=this.spT=0.5+1.5*Math.random();this.spF=11+3*Math.random();}else this.spT=Math.max(1,3+5*Math.random()-this.spD);}
  const spEnv=this.spOn?Math.sin(Math.PI*(1-this.spT/this.spD))**2:0;
  // ketamine anaesthesia: gamma bursts alternate with slow-delta every 2-5 s (Akeju 2016)
  this.kT-=dt;if(this.kT<=0){this.kPh^=1;this.kT=2+3*Math.random();}
  const kOn=tg.kS>0.5;this.kg+=((kOn&&!this.kPh?0.3:1)-this.kg)*0.02;this.ks+=((kOn&&this.kPh?0.5:1)-this.ks)*0.02;
  // burst suppression gate
  // burst suppression gate: bursts 0.5-3 s; flat runs 1-3 s at bs 0.5 growing to 10-30 s at bs 1; isoelectric above 0.97
  this.bsTimer-=dt; if(this.bsTimer<=0){const b=this.p.bs;
   if(b>0.97){this.bsState=1;this.bsTimer=1;}
   else if(this.bsState===0&&Math.random()<b){this.bsState=1;this.bsTimer=10**(2*Math.max(0,b-0.5))*(1+2*Math.random());}
   else{this.bsState=0;this.bsTimer=0.5+2.5*Math.random();}}
  const gTarget=this.bsState?0.03:1; this.gate+=(gTarget-this.gate)*0.08;
  let x=0;
  for(let i=0;i<OSC_F.length;i++){const f=OSC_F[i];
   this.m[i]+= (1-this.m[i])*0.004+(Math.random()-0.5)*0.104; if(this.m[i]<0.05)this.m[i]=0.05;
   this.ph[i]+=6.2832*f*dt+(Math.random()-0.5)*0.277;
   const P=profile(this.p,f,spEnv,this.spF,this.kg,this.ks,this.wa); x+=Math.sqrt(2*P)*this.m[i]*Math.sin(this.ph[i]);
  }
  const emgNoise=this.p.emg>0?randn()*Math.sqrt(this.p.emg)*1.2:0;
  let y=x*this.gate+emgNoise+randn()*0.6;
  // blinks and eye movement (frontal sensor): one-sided 300-ms deflections of about 150 uV every 2-6 s (1 in 12 over
  // 300 uV, which trips the artefact flag) plus a slow drift under 1 Hz. An awake patient with eyes open does this on its own
  // (eyeK, smaller and never over 300 uV): delta-theta power along the bottom of the DSA, so awake is not all blue (owner's
  // colleague, 19 Oct 2026). It fades as the patient goes under (gone by depth 0.2) and stops under a relaxant.
  const eT=this.eyeT(tg,nk);this.eyeK+=(eT-this.eyeK)*dt/(eT>this.eyeK?2:6);
  if(this.eyeK>0.01){const ek=this.eyeK;this.blT-=dt;if(this.blT<=0){this.blT=2+4*Math.random();this.blP=0;this.blA=m.blink&&Math.random()<1/12?310+60*Math.random():110+80*Math.random();}
   this.dr+=-this.dr*dt/0.8+12*randn()*Math.sqrt(2*dt/0.8);this.eye=ek*this.dr;if(this.blP<0.3){this.eye+=ek*this.blA*Math.sin(Math.PI*this.blP/0.3)**2;this.blP+=dt;}y+=this.eye;}
  else this.dr=this.eye=0;
  // diathermy: 1-2.5 s bursts of broadband interference clipping at ±400 uV, 4-8 s apart, each followed by a 1-s
  // settling tail (a decaying offset); burst and tail samples are counted as artefact (diAcc, artAcc; step() reads them)
  if(m.diathermy){this.diT-=dt;if(this.diT<=0){this.diOn=!this.diOn;this.diT=this.diOn?1+1.5*Math.random():4+4*Math.random();
    if(!this.diOn){this.tail=1;this.tailV=(Math.random()<.5?-1:1)*(150+150*Math.random());}}}else{this.diOn=false;this.tail=0;}
  if(this.diOn){y=Math.max(-400,Math.min(400,y+randn()*600));this.diAcc++;this.artAcc++;}
  else if(this.tail>0){this.tail-=dt;y+=this.tailV*Math.exp(-(1-this.tail)/0.25);this.artAcc++;}
  return y;
 }
}
// FFT (radix-2, in place)
function fft(re,im){const n=re.length;for(let i=1,j=0;i<n;i++){let b=n>>1;for(;j&b;b>>=1)j^=b;j^=b;if(i<j){[re[i],re[j]]=[re[j],re[i]];[im[i],im[j]]=[im[j],im[i]];}}
 for(let len=2;len<=n;len<<=1){const a=-2*Math.PI/len,wr=Math.cos(a),wi=Math.sin(a);for(let i=0;i<n;i+=len){let cr=1,ci=0;for(let j=0;j<len/2;j++){const ur=re[i+j],ui=im[i+j],vr=re[i+j+len/2]*cr-im[i+j+len/2]*ci,vi=re[i+j+len/2]*ci+im[i+j+len/2]*cr;re[i+j]=ur+vr;im[i+j]=ui+vi;re[i+j+len/2]=ur-vr;im[i+j+len/2]=ui-vi;const t=cr*wr-ci*wi;ci=cr*wi+ci*wr;cr=t;}}}}
const HANN=Array.from({length:NWIN},(_,i)=>0.5-0.5*Math.cos(2*Math.PI*i/(NWIN-1)));
function spectrum(win){ // returns {P: power per bin (uV^2), re, im}
 const re=new Float64Array(NWIN),im=new Float64Array(NWIN); let mean=0; for(const v of win)mean+=v; mean/=NWIN;
 for(let i=0;i<NWIN;i++)re[i]=(win[i]-mean)*HANN[i]; fft(re,im);
 const P=new Float64Array(NWIN/2); for(let k=0;k<NWIN/2;k++)P[k]=(re[k]**2+im[k]**2)*4/(NWIN*NWIN*0.375);
 return {P,re,im};
}
function bandPow(P,lo,hi){let s=0;for(let k=Math.round(lo/DF);k<=Math.round(hi/DF);k++)s+=P[k];return s;}
function features(P,win){
 const tot=bandPow(P,0.5,30); let c=0,sef=30,mf=null; for(let k=1;k<=60;k++){c+=P[k];if(mf==null&&c>=0.5*tot)mf=k*DF;if(c>=0.95*tot){sef=k*DF;break;}}
 const br=Math.log10((bandPow(P,30,47)+1e-3)/(bandPow(P,11,20)+1e-3));
 // suppression (BIS manual): 0.25-s sub-blocks of the newest second that stay within ±5 uV of their mean
 let r=0,ns=0; for(let i=NWIN-HOP;i<NWIN;i++)r+=win[i]**2; r=Math.sqrt(r/HOP);
 for(let j=NWIN-HOP;j<NWIN;j+=32){let mu=0,mx=0;for(let i=j;i<j+32;i++)mu+=win[i];mu/=32;for(let i=j;i<j+32;i++)mx=Math.max(mx,Math.abs(win[i]-mu));if(mx<=5)ns++;}
 const t47=bandPow(P,0.5,47),supFrac=ns/4;return {sef,mf,br,tot,supFrac,suppressed:supFrac>=0.5,rms:r,slowFrac:bandPow(P,0.5,4)/t47,alphaFrac:bandPow(P,8,14)/t47,fast:Math.log10(bandPow(P,14,47)/t47),hi:Math.log10(bandPow(P,30,47)/t47)};
}
function bisRaw(f,bsr){ // teaching model, NOT the proprietary algorithm
 let b=115.85-0.874*f.sef+65.64*f.fast-3.49*f.hi+7.46*f.slowFrac+19.63*f.alphaFrac;
 if(bsr>0)b+=(Math.min(b,30)-b)*Math.sqrt(Math.min(1,bsr/40)); // below SR 40 a pull towards 30 (Bruhn 2000: BIS about flat there), so BIS never rises with depth; meets 50-SR/2 at SR 40
 if(b<50)b=50-(50-b)*1.05; else if(b>80)b=80+(b-80)*1.6;
 if(bsr>=40)b=Math.min(b,50-bsr/2); // Bruhn 2000: BIS is set by SR only once SR passes 40%
 return Math.max(0,Math.min(98,b));
}

// ===== colour map (turbo, close to monitor DSA colours) =====
function turbo(x){x=Math.max(0,Math.min(1,x));
 const r=0.13572138+x*(4.6153926+x*(-42.66032258+x*(132.13108234+x*(-152.94239396+x*59.28637943))));
 const g=0.09140261+x*(2.19418839+x*(4.84296658+x*(-14.18503333+x*(4.27729857+x*2.82956604))));
 const b=0.1066733+x*(12.64194608+x*(-60.58204836+x*(110.36276771+x*(-89.90310912+x*27.34824973))));
 return [Math.max(0,Math.min(255,r*255))|0,Math.max(0,Math.min(255,g*255))|0,Math.max(0,Math.min(255,b*255))|0];}
const DB_LO=-3, DB_HI=31, NB=60; // 60 bins of 0.5 Hz = 0-30 Hz
const LUT=Array.from({length:256},(_,i)=>turbo(i/255));
const dbToXd=d=>Math.max(0,Math.min(1,(d-DB_LO)/(DB_HI-DB_LO))); // default scale: teaching strips, quiz and the explainer
const dbToX=d=>Math.max(0,Math.min(1,(d-mon.dbLo)/(mon.dbHi-mon.dbLo))); // the monitor's DSA: the user's colour range
const rgb=c=>`rgb(${c[0]},${c[1]},${c[2]})`;
const MONO='600 12px "JetBrains Mono", ui-monospace, monospace';
const SCR={bg:'#05080f',fg:'#d9e4f5',mute:'#7d8ca6',grid:'#1a2538',bis:'#ffffff',sef:'#ffffff'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function fit(c,hLogical){const dpr=Math.min(2,window.devicePixelRatio||1);const w=c.clientWidth||300;// logical height read once: setting c.height below rewrites the attribute (it grew every frame on dpr>1 phones)
 if(c._lh==null)c._lh=+c.getAttribute('height')||100;const h=hLogical||c._lh;
 if(c._w!==w||c._h!==h||c._d!==dpr){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);c.style.height=h+'px';c._w=w;c._h=h;c._d=dpr;}
 const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}

// ===== live simulation state =====
let eng=new Engine();
let SIG=[],EYE=[]; const SIGMAX=20*FS; // the EEG lane can sweep 4, 8 or 16 s (the BIS Advance screen, 20 s at 6.25 mm/s)
let COLS=[]; const COLMAX=300; // one column per second, 5 min
let HIST=[]; const HISTMAX=14400; // the same columns for the BIS VISTA screen's 5, 15 and 60 min trend windows and a 4 h case to review
let sup=[]; let bisS=null, lastSef=null, lastMf=null, produced=0, simT=0, speed=1, paused=false;
let drug='propofol', depth=0; const mods={elderly:false,emg:false,diathermy:false,nmb:false,warmer:false,blink:false};
// cumulative times this case (s): the shown SR at 5% or more (suppression present) and the shown BIS under 40; a clean second only
let tim={sup:0,low:0};
// neuromuscular block: rocuronium, a teaching model. Two-exponential decay of the effective concentration (in ED50 units;
// fitted so 0.6 mg/kg gives T1 under 6% at about 25 min, T1 25% at 36 min, T1 95% at 90 min), Hill slope 4, effect-site lag.
// Timed NM_K times faster than real life so a case shows it. TOF count / TOFr / PTC are read from T1 (an approximation).
const NM_K=6,NM_U=19.17,NM_FA=0.85,NM_T1=600/NM_K,NM_T2=4200/NM_K,NM_TE=40/NM_K;
const nm={a:0,b:0,ce:0,armed:true,given:false};
function nmDose(mgkg){const u=NM_U*mgkg;nm.a+=u*NM_FA;nm.b+=u*(1-NM_FA);nm.given=true;}
function nmSug(mgkg){const c=nm.a+nm.b;if(c<=0)return;const rem=Math.min(c,0.85*mgkg),f=1-rem/c;nm.a*=f;nm.b*=f;}
function nmReset(){nm.a=nm.b=nm.ce=0;nm.armed=true;nm.given=false;}
const nmD=()=>{const x=Math.pow(nm.ce,4);return x/(1+x);};
function nmStep(dt){ // dt: sim seconds
 nm.a*=Math.exp(-dt/NM_T1);nm.b*=Math.exp(-dt/NM_T2);
 const mode=mods.nmbMode;
 if(mode==='off'){nm.a=nm.b=0;nm.given=false;}
 else if(mode==='auto'){const v=inducedDepth(drug,eng.de);if(v<0.25)nm.armed=true;else if(v>=0.3&&nm.armed){nm.armed=false;nmDose(0.6);}}
 const c=Math.max(nm.a+nm.b,mode==='on'?2.5:0);nm.ce+=(c-nm.ce)*(1-Math.exp(-dt/NM_TE));
 const D=nmD();mods.nmbK=D;mods.nmb=D>0.5;}
function nmRead(){const t1=100*(1-nmD()),tofc=t1<6?0:t1<12?1:t1<18?2:t1<25?3:4,
  tofr=tofc<4?null:Math.min(1,Math.pow(Math.max(0,(t1-30)/70),1.8)),ptc=tofc===0?Math.round(8*Math.pow(t1/6,1.5)):null;return {t1,tofc,tofr,ptc};}
let artH=[],bcH=[],rawH=[],sefH=[],mfH=[];let prevSup=false,isoN=0,outN=0,outV=0,sefAge=0;let warming=true; // outV: out-of-target seconds for the Medtronic screen (any depth); not counted during the warm start
// The right hemisphere (BIS Advance and SedLine): a second engine and its own copy of the per-channel state. The left channel
// is the page's own variables; the right runs through swapCh(), which exchanges the two sets around a call to step().
const R={eng:new Engine(),SIG:[],EYE:[],COLS:[],HIST:[],sup:[],bisS:null,lastSef:null,lastMf:null,produced:0,tim:{sup:0,low:0},
 artH:[],bcH:[],rawH:[],sefH:[],mfH:[],prevSup:false,isoN:0,outN:0,outV:0,sefAge:0};
function swapCh(){[eng,R.eng]=[R.eng,eng];[SIG,R.SIG]=[R.SIG,SIG];[EYE,R.EYE]=[R.EYE,EYE];[COLS,R.COLS]=[R.COLS,COLS];[HIST,R.HIST]=[R.HIST,HIST];
 [sup,R.sup]=[R.sup,sup];[bisS,R.bisS]=[R.bisS,bisS];[lastSef,R.lastSef]=[R.lastSef,lastSef];[lastMf,R.lastMf]=[R.lastMf,lastMf];[produced,R.produced]=[R.produced,produced];
 [tim,R.tim]=[R.tim,tim];[artH,R.artH]=[R.artH,artH];[bcH,R.bcH]=[R.bcH,bcH];[rawH,R.rawH]=[R.rawH,rawH];[sefH,R.sefH]=[R.sefH,sefH];[mfH,R.mfH]=[R.mfH,mfH];
 [prevSup,R.prevSup]=[R.prevSup,prevSup];[isoN,R.isoN]=[R.isoN,isoN];[outN,R.outN]=[R.outN,outN];[outV,R.outV]=[R.outV,outV];[sefAge,R.sefAge]=[R.sefAge,sefAge];}
const modsR=Object.create(mods);modsR.side='R';mods.side='L'; // the right engine reads the page's settings, with its own side
const stepR=n=>{swapCh();try{step(n);}finally{swapCh();}};
const stimAll=kind=>{const k=kind??(Math.random()<0.1?'delta':'');eng.stimulus(k);R.eng.stimulus(k);};
const snapAll=()=>{eng.snap();R.eng.snap();};
// monitor settings: smoothing (s), EEG scale (± uV), teaching labels and target band, the info message
const mon={smooth:15,scale:50,sweep:8,dbLo:DB_LO,dbHi:DB_HI,teach:true,info:'',infoUntil:0,skin:'vista',trend:5,bottom:'bis',alo:40,ahi:60};
function applyTarget(){eng.setTarget(drug,depth,mods);R.eng.setTarget(drug,depth,modsR);describe();if(typeof onTarget==='function')onTarget();}

// effect-site depth 0-1 for the trend lane's thin trace (a mix: the hypnotic share)
const ceNow=()=>{const e=eng.de;return typeof e==='number'?cl(e):cl(0.155*(e.propofol||0)+sevoDepth(e.sevo||0)+0.5*(e.dex||0));};
const EYE_REJ=0.85;
function step(nSamples){
 for(let i=0;i<nSamples;i++){SIG.push(eng.sample());if(SIG.length>SIGMAX)SIG.shift();EYE.push(eng.eye);if(EYE.length>NWIN)EYE.shift();produced++;
  if(produced%HOP===0&&SIG.length>=NWIN){
   // the DSA shows the raw spectrum; BIS, SEF and SR use the epoch after the monitor's eye-blink rejection, modelled
   // as taking away 85% of the blink and drift the engine added (a proxy: the real detector is proprietary)
   const win=SIG.slice(-NWIN);const {P}=spectrum(win);let f;
   if(EYE.some(v=>v)){const wc=win.map((v,j)=>v-EYE_REJ*EYE[j]);f=features(spectrum(wc).P,wc);}else f=features(P,win);
   // artefact: any sample over 300 uV in the newest second, or a diathermy burst or its settling tail ("throw away").
   // Artefact seconds lower SQI and are left out of BIS, SR, SEF and TP.
   let mx=0;for(let j=NWIN-HOP;j<NWIN;j++)mx=Math.max(mx,Math.abs(win[j]));const diF=eng.diAcc/HOP,art=mx>300||eng.artAcc>0;eng.diAcc=eng.artAcc=0;
   artH.push(art?1:0);if(artH.length>63)artH.shift(); // SQI over the last 63 s
   const sqi=Math.max(0,Math.min(100,Math.round(98-160*artH.reduce((a,b)=>a+b,0)/artH.length)));
   if(!art){sup.push(f.supFrac);if(sup.length>63)sup.shift();
    bcH.push(prevSup&&!f.suppressed?1:0);if(bcH.length>60)bcH.shift();prevSup=f.suppressed;}
   const bsr=sup.length?100*sup.reduce((a,b)=>a+b,0)/sup.length:0;
   // smoothing: moving average of the last 10, 15 or 30 artefact-free raw values
   if(!art){rawH.push(bisRaw(f,bsr));if(rawH.length>30)rawH.shift();const r=rawH.slice(-mon.smooth);bisS=r.reduce((a,b)=>a+b,0)/r.length;}
   // SEF and MF: moving mean over the smoothing window of unsuppressed, clean seconds; they expire after 30 s without one
   const avg=a=>a.slice(-mon.smooth).reduce((x,y)=>x+y,0)/Math.min(a.length,mon.smooth),fresh=!f.suppressed&&!art;
   if(fresh){sefH.push(f.sef);mfH.push(f.mf);if(sefH.length>30){sefH.shift();mfH.shift();}lastSef=avg(sefH);lastMf=avg(mfH);sefAge=0;}
   else if(++sefAge>30)lastSef=lastMf=null;
   const db=new Float32Array(NB);for(let k=0;k<NB;k++)db[k]=10*Math.log10(P[k]+1e-4);
   // EMG (dB re 0.0001 uV^2, as the monitor's 70-110 Hz band): a parametric muscle term, not measured (128 samples/s
   // can't reach 70 Hz). Muscle tone, facial EMG and diathermy bursts; ketamine's gamma doesn't count. Not held in artefact.
   // A forced-air warmer adds about 12 dB (its pickup fades with the engine's wa).
   const emg=27+10*Math.log10(1+12*eng.tone+52*eng.p.emg+250*diF)+12*eng.wa+(Math.random()-0.5)*3;
   const prev=COLS[COLS.length-1];
   const tp=art&&prev?prev.tp:10*Math.log10(bandPow(P,0.5,47)+1e-4)+40; // total power holds through artefact
   // isoelectric: every second flat for 60 s; out of target: shown BIS outside 40-60 for 10 s while a hypnotic is on
   isoN=art?isoN:f.supFrac>=1?isoN+1:0;
   // (GA-level propofol/sevo only, not sedation, dex or ketamine; once shown it clears only back inside 42-58)
   const blank=sqi<15,gaH=eng.drug==='mix'?0.155*(eng.de.propofol||0)+sevoDepth(eng.de.sevo||0):eng.drug==='propofol'||eng.drug==='sevo'?eng.de:0;
   outN=!blank&&gaH>=0.44&&(bisS<mon.alo||bisS>mon.ahi||outN>=10&&(bisS<mon.alo+2||bisS>mon.ahi-2))?outN+1:0;
   // the Medtronic screen raises 'BIS out of target range' whenever the range is active and the shown BIS has been outside it
   // for 10 s, at any depth (the manual); Target Alarm only decides whether it sounds
   outV=!warming&&!blank&&(bisS<mon.alo||bisS>mon.ahi||outV>=10&&(bisS<mon.alo+2||bisS>mon.ahi-2))?outV+1:0;
   if(!art&&!blank){if(bsr>=5)tim.sup++;if(bisS<40)tim.low++;}
   const col={n:Math.round(produced/FS),ce:ceNow(),db,sef:fresh?lastSef:null,mf:fresh?lastMf:null,bis:blank?null:bisS,bsr,emg,sqi,tp,art,sp:f.suppressed?1:0,amp:20*Math.log10(Math.max(1,mx)),st:tim.sup,
    bc:bcH.reduce((a,b)=>a+b,0)};COLS.push(col);if(COLS.length>COLMAX)COLS.shift();HIST.push(col);if(HIST.length>HISTMAX)HIST.shift();
   onColumn&&onColumn();
  }}
}
// the monitor's message region: [priority, text] or null. Wording as in the BIS Complete manual.
function monMsg(){const c=COLS[COLS.length-1];if(!c)return null;
 if(isoN>=60)return ['hi','Isoelectric EEG Detected',31,'Isoelectric EEG Detected'];
 if(typeof MT!=='undefined'&&mon.skin==='vista'){
  const low=c.bis!=null&&c.bis<(mon.alo+mon.ahi)/2;
  if(MT.tgt.active&&outV>=10&&c.bis!=null)return ['hi','BIS Out of Target Range \u2013 '+(low?'Low':'High'),low?29:30,'BIS out of target range'];
 }else{ const tgtOn=mon.teach,low=c.bis!=null&&c.bis<(mon.alo+mon.ahi)/2;
   if(tgtOn&&outN>=10&&c.bis!=null)return ['hi','BIS Out of Target Range \u2013 '+(low?'Low':'High'),low?29:30,'BIS out of target range']; }
 if(c.sqi<15)return ['lo','Data unavailable due to poor signal quality',28,'Data unavailable due to poor signal quality'];
 if(c.sqi<50)return ['lo','Excessive Artifact Detected in Signal',27,'Excessive Artifact Detected in Signal'];
 if(mon.infoUntil>Date.now())return ['info',mon.info];
 return null;}

// ===== drawing: monitor =====
const cEeg=document.getElementById('cEeg'),cTrend=document.getElementById('cTrend'),cDsa=document.getElementById('cDsa');
const off=document.createElement('canvas');off.width=COLMAX;off.height=NB;const offCtx=off.getContext('2d');const offImg=offCtx.createImageData(COLMAX,NB);
function paintOff(){if(mon.skin!=='classic')return;const d=offImg.data;const start=COLMAX-COLS.length;
 for(let x=0;x<COLMAX;x++){const col=COLS[x-start];for(let y=0;y<NB;y++){const i=(y*COLMAX+x)*4;
  if(!col){d[i]=5;d[i+1]=8;d[i+2]=15;d[i+3]=255;continue;}
  const c=LUT[(dbToX(col.db[NB-1-y])*255)|0];d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;}}
 offCtx.putImageData(offImg,0,0);}
let view='both';
// lane heights: smaller on phones so the monitor and the controls fit one screen
const laneH=()=>{const n=innerWidth<600;
 const height=id=>{const lane=$(id);if(!lane||lane.hidden)return 0;return Math.max(30,lane.clientHeight-lane.querySelector('.lbl').offsetHeight-6);};
 if($('monitor')?.dataset.skin==='classic')return {dsa:height('wDsa'),eeg:height('wEeg')};
 return view==='both'?{dsa:n?150:190,eeg:n?90:110}:{dsa:n?260:300,eeg:n?220:280};};
// monitor clock: sim time from page open (the warm start's 5 min end now), so the trend axis matches the clock at any speed
const T0=Date.now()-300e3,clk=t=>{const d=new Date(T0+t*1000);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
const AMBER='#ffb454',MFC='#b47cff',EMGC='#5fd08f';
function txt(id,t){const el=$(id);if(el && el.textContent!==t)el.textContent=t;}
function drawEeg(){if(view==='dsa'||mon.skin!=='classic')return;const {ctx,w,h}=fit(cEeg,laneH().eeg);ctx.fillStyle=SCR.bg;ctx.fillRect(0,0,w,h);
 const secs=mon.sweep==='auto'?(w<500?5:8):mon.sweep,N=secs*FS,s=mon.scale,sc=(h/2)/s; // 'auto': about 5 s across a phone, 8 s on a desktop; ±scale full height
 ctx.strokeStyle=SCR.grid;ctx.lineWidth=1;for(let k=0;k<=secs;k++){const x=Math.round(w*k/secs)+.5;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
 for(let j=-1;j<=1;j++){const y=Math.round(h/2+j*h/4)+.5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();} // every scale/2 uV
 ctx.strokeStyle=SCR.mute;for(let k=1;k<secs;k++){const x=Math.round(w*k/secs)+.5;ctx.beginPath();ctx.moveTo(x,h-5);ctx.lineTo(x,h);ctx.stroke();}
 if(mon.teach){ctx.fillStyle='rgba(23,143,215,.16)';ctx.fillRect(w*(secs-2)/secs,0,w*2/secs,h);ctx.strokeStyle='rgba(120,190,255,.7)';ctx.strokeRect(w*(secs-2)/secs+.5,.5,w*2/secs-1,h-1);}
 const n=Math.min(SIG.length,N),o=SIG.length-n,x0=N-n;ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.strokeStyle='#7ee0a1';ctx.lineWidth=1.3;ctx.beginPath();
 for(let i=0;i<n;i++){const x=(x0+i)/N*w,y=h/2-SIG[o+i]*sc;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();ctx.restore();
 if(mon.teach){ctx.font=MONO;const t='newest 2 s → next DSA column',tw=ctx.measureText(t).width;ctx.fillStyle='rgba(5,8,15,.8)';ctx.fillRect(w-tw-10,2,tw+8,16);
  ctx.fillStyle=SCR.mute;ctx.textAlign='right';ctx.fillText(t,w-6,14);}
 ctx.font='600 10px "JetBrains Mono", monospace';ctx.textAlign='center';ctx.fillStyle='rgba(5,8,15,.8)';ctx.fillRect(w/secs/2-12,h-15,24,13);ctx.fillStyle=SCR.mute;ctx.fillText('1 s',w/secs/2,h-5);
 const c=COLS[COLS.length-1];if(c&&c.art){ctx.font='600 11px "JetBrains Mono", monospace';ctx.textAlign='left';ctx.fillStyle=SCR.bg;ctx.fillRect(2,2,64,15);ctx.fillStyle=AMBER;ctx.fillText('ARTIFACT',5,13);}
 txt('eegLbl',`EEG · ${secs} s`);txt('eegDiv',`${s/2} µV/div`);}
function drawTrend(){if(mon.skin!=='classic')return;const {ctx,w,h}=fit(cTrend);ctx.fillStyle=SCR.bg;ctx.fillRect(0,0,w,h);
 const g={x:30,y:14,w:w-60,h:h-34};const start=COLMAX-COLS.length;const X=i=>g.x+(start+i+.5)/COLMAX*g.w;
 const Y=v=>g.y+g.h*(1-v/100),YE=v=>g.y+g.h*(1-(Math.max(30,Math.min(80,v))-30)/50); // BIS 0-100 left, EMG 30-80 dB right
 if(mon.teach){ctx.fillStyle='rgba(255,255,255,.09)';ctx.fillRect(g.x,Y(60),g.w,Y(40)-Y(60));}
 ctx.strokeStyle=SCR.grid;ctx.lineWidth=1;ctx.strokeRect(g.x+.5,g.y+.5,g.w-1,g.h-1);ctx.beginPath();ctx.moveTo(g.x,Math.round(Y(50))+.5);ctx.lineTo(g.x+g.w,Math.round(Y(50))+.5);ctx.stroke();
 ctx.font=MONO;ctx.textAlign='right';ctx.fillStyle=SCR.mute;for(const v of [0,50,100])ctx.fillText(v,g.x-5,Y(v)+4);
 ctx.textAlign='left';ctx.fillStyle=EMGC;for(const v of [30,80])ctx.fillText(v,g.x+g.w+5,YE(v)+4);
 ctx.fillStyle=SCR.bis;ctx.fillText('BIS',g.x,10);ctx.fillStyle=EMGC;ctx.textAlign='right';ctx.fillText('EMG',g.x+g.w,10);
 // EMG: thin line; BIS: thick white line that breaks where the number is blanked
 ctx.strokeStyle=EMGC;ctx.lineWidth=1;ctx.beginPath();COLS.forEach((c,i)=>{const y=YE(c.emg);i?ctx.lineTo(X(i),y):ctx.moveTo(X(i),y);});ctx.stroke();
 ctx.strokeStyle=SCR.bis;ctx.lineWidth=2.5;ctx.lineJoin='round';ctx.beginPath();let pen=false;COLS.forEach((c,i)=>{if(c.bis==null){pen=false;return;}const y=Y(c.bis);pen?ctx.lineTo(X(i),y):ctx.moveTo(X(i),y);pen=true;});ctx.stroke();
 // artefact bar along the time axis: amber where SQI < 50, yellow where the number was blanked (SQI < 15)
 const bw=g.w/COLMAX+0.5;COLS.forEach((c,i)=>{if(c.sqi>=50)return;ctx.fillStyle=c.sqi<15?'#ffe600':AMBER;ctx.fillRect(X(i)-bw/2,g.y+g.h+1,bw,4);});
 ctx.fillStyle=SCR.mute;ctx.textAlign='left';ctx.fillText(clk(simT-COLMAX),g.x,h-3);ctx.textAlign='right';ctx.fillText(clk(simT),g.x+g.w,h-3);}
function drawDsa(){if(view==='eeg'||mon.skin!=='classic')return;const {ctx,w,h}=fit(cDsa,laneH().dsa);ctx.fillStyle=SCR.bg;ctx.fillRect(0,0,w,h);const R=mon.teach?36:18,g={x:34,y:6,w:w-34-R,h:h-24};
 ctx.imageSmoothingEnabled=true;ctx.drawImage(off,g.x,g.y,g.w,g.h);
 // SEF95 (white) and median frequency, SEF50 (purple)
 const start=COLMAX-COLS.length,line=(k,col,lw)=>{ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();let pen=false;
  COLS.forEach((c,i)=>{if(c[k]==null){pen=false;return;}const x=g.x+(start+i+.5)/COLMAX*g.w,y=g.y+g.h*(1-c[k]/30);pen?ctx.lineTo(x,y):ctx.moveTo(x,y);pen=true;});ctx.stroke();};
 ctx.globalAlpha=0.7;line('mf',MFC,1);ctx.globalAlpha=1;line('sef',SCR.sef,1.4);
 if(mon.teach&&COLS.length){ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1;ctx.strokeRect(g.x+g.w-g.w/COLMAX*3-1,g.y-1,g.w/COLMAX*3+2,g.h+2);} // newest column
 ctx.font=MONO;ctx.fillStyle=SCR.mute;ctx.textAlign='right';
 for(const f of [0,10,20,30]){ctx.fillText(f,g.x-6,Math.min(g.y+g.h,Math.max(g.y+9,g.y+g.h*(1-f/30)+4)));}
 ctx.save();ctx.translate(10,g.y+g.h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('Hz',0,0);ctx.restore();
 ctx.textAlign='left';ctx.fillText('−5 min',g.x,h-4);ctx.textAlign='center';ctx.fillText('−2½',g.x+g.w/2,h-4);ctx.textAlign='right';ctx.fillText('now',g.x+g.w,h-4);
 // SEF and MF numbers, top right, on a dark backing so they read over any colour
 const c=COLS[COLS.length-1],blank=!c||c.sqi<15,sT='SEF '+(blank||lastSef==null?'--':lastSef.toFixed(1)),mT='MF '+(blank||lastMf==null?'--':lastMf.toFixed(1)),dot=' · ';
 const wm=ctx.measureText(mT).width,wd=ctx.measureText(dot).width,ws=ctx.measureText(sT).width,rx=g.x+g.w-4;
 ctx.fillStyle='rgba(5,8,15,.82)';ctx.fillRect(rx-wm-wd-ws-6,g.y+2,wm+wd+ws+8,17);ctx.textAlign='right';ctx.fillStyle=MFC;ctx.fillText(mT,rx,g.y+15);
 ctx.fillStyle=SCR.mute;ctx.fillText(dot,rx-wm,g.y+15);ctx.fillStyle=SCR.sef;ctx.fillText(sT,rx-wm-wd,g.y+15);
 // band labels on the right edge
 ctx.font='600 11px "JetBrains Mono", monospace';ctx.textAlign='left';ctx.fillStyle=SCR.mute;const Yf=f=>g.y+g.h*(1-f/30);
 for(const [lo,hi,l] of [[0.5,4,'δ'],[4,8,'θ'],[8,12,'α'],[13,30,'β']])ctx.fillText(l,g.x+g.w+4,Math.min(g.y+g.h-1,(Yf(lo)+Yf(hi))/2+4));
 ctx.strokeStyle=SCR.mute;ctx.lineWidth=1;for(const f of [4,8,12,13]){const y=Math.round(Yf(f))+.5;ctx.beginPath();ctx.moveTo(g.x+g.w,y);ctx.lineTo(g.x+g.w+3,y);ctx.stroke();}
 if(!mon.teach)return;
 // colour scale
 const lx=w-10;for(let i=0;i<g.h;i++){ctx.fillStyle=rgb(LUT[((1-i/g.h)*255)|0]);ctx.fillRect(lx,g.y+i,6,1);}
 ctx.save();ctx.translate(lx-6,g.y+g.h/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle=SCR.mute;ctx.font='600 10px "JetBrains Mono", monospace';ctx.fillText('power',0,0);ctx.restore();}
// ===== drawing: BIS VISTA-style screen (layout from photos of the real monitor; teaching model values underneath) =====
function fitFill(c){const w=c.clientWidth,h=c.clientHeight;if(!w||!h)return null;const dpr=Math.min(2,window.devicePixelRatio||1),W=Math.round(w*dpr),H=Math.round(h*dpr);
 if(c.width!==W||c.height!==H){c.width=W;c.height=H;}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
const VSEC=()=>mon.sweep==='auto'?8:mon.sweep;
// ===== the Masimo SedLine screen lives in sed-screen.js, sed-draw.js and sed-menu.js (the BIS Advance screen in adv-*.js) =====
// SedLine's PSi is its own proprietary index: here a straight-line stand-in from the BIS teaching value (BIS 40-60 -> PSi 25-50).
const psiOf=b=>b==null?null:Math.max(0,Math.min(100,Math.round(1.25*b-25)));
const $=id=>document.getElementById(id);
function zoneOf(b){return b>90?'Awake':b>80?'Light/moderate sedation':b>60?'Sedation':b>=40?'General anaesthesia':b>=20?'Deep hypnotic state':'Burst suppression / flat';}
function segs(id,n,color){const el=$(id);el.style.setProperty('--seg',color);[...el.children].forEach((x,i)=>x.classList.toggle('on',i<n));}
const mmss=n=>Math.floor(n/60)+':'+String(n%60).padStart(2,'0');
function readouts(){const c=COLS[COLS.length-1];if(!c)return;
 if(mon.skin==='advance'){const l=c,r=R.COLS[R.COLS.length-1];if(r){const t=a=>{const x=a.slice(-30);return x.reduce((m,q)=>m+q.tp,0)/Math.max(1,x.length);},pl=Math.pow(10,t(HIST)/10),pr=Math.pow(10,t(R.HIST)/10),as=Math.round(100*Math.abs(pl-pr)/(pl+pr+1e-9)),b=q=>q.sqi<15||q.bis==null?'--':Math.round(q.bis);
  txt('bilSum',`L: BIS ${b(l)}, SR ${Math.round(l.bsr)}%, SQI ${l.sqi}  ·  R: BIS ${b(r)}, SR ${Math.round(r.bsr)}%, SQI ${r.sqi}  ·  ASYM ${as}%`);}}
 // like the monitor: SQI under 50 shows BIS hollow; under 15 no BIS, SEF, SR, TP or BC at all
 const bl=c.sqi<15,b=$('vBis');b.textContent=bl||c.bis==null?'--':Math.round(c.bis);b.classList.toggle('hollow',!bl&&c.sqi<50);
 const sr=Math.round(c.bsr);txt('vZone',bl?'Poor signal':c.sqi<50?'Low SQI: check':sr>0?`Suppression (SR ${sr}%)`:zoneOf(c.bis));
 // SQI: 5 bars of 20; EMG: 4 bars, empty under 30 dB, then 30-38, 39-47, 48-55, over 55
 $('vSqi').textContent=c.sqi;segs('sqiSegs',Math.ceil(c.sqi/20),c.sqi<15?'#ff6b6b':c.sqi<50?AMBER:'#5fd08f');
 const e=c.emg;$('vEmg').textContent=Math.round(e);segs('emgSegs',e<30?0:e<39?1:e<48?2:e<56?3:4,e>=48?AMBER:'#5fd08f');
 $('vSupT').textContent=mmss(tim.sup);$('vLowT').textContent=mmss(tim.low);
 $('vSr').textContent=bl?'--':sr;$('vSef').textContent=bl||lastSef==null?'--':lastSef.toFixed(1);
 $('vTp').textContent=bl?'--':Math.round(c.tp);$('vBc').textContent=c.bsr<5||c.sqi<50?'--':c.bc;
 txt('vClock',clk(simT));
 // the Medtronic screen (mt-screen.js)
 mtReadouts(c,bl,sr,e);
 txt('s2Sqi',String(c.sqi));txt('s2Emg',String(Math.round(e)));txt('s2Sr',bl?'--':String(sr));txt('s2Sef',bl||lastSef==null?'--':lastSef.toFixed(1));txt('s2Tp',bl?'--':String(Math.round(c.tp)));txt('s2Bc',c.bsr<5||c.sqi<50?'--':String(c.bc));
 txt('s2Zone',bl?'Poor signal':c.sqi<50?'Low SQI: check':sr>0?`Suppression (SR ${sr}%)`:zoneOf(c.bis));txt('s2Sup',mmss(tim.sup));txt('s2Low',mmss(tim.low));

 // message region: change the text only when it changes (aria-live)
 const m=monMsg(),mt=m?m[1]:'',el=$('vMsg');if(el.textContent!==mt){el.textContent=mt;el.className='msg'+(m?' '+m[0]:'');}}

// ===== state descriptions =====
function describe(){const d=typeof eng.de==='number'?eng.de:0;let n,t;
 if(drug==='mix'){[n,t]=describeMix(eng.de,depth);}
 else if(drug==='propofol'||drug==='sevo'){const s=drug==='sevo';
  if(d<0.08){n='Awake';t='With eyes open, eye movements and blinks put delta power along the bottom of the DSA (the monitor rejects most of it from BIS); there is some theta, a beta band and little alpha (alpha grows with eyes closed). The awake picture varies: eyes open or closed, anxiety (more beta and muscle), age or dementia (slower, weaker). Watch the baseline for a minute before induction.';}
  else if(d<0.24){n='Very light sedation';t='Early '+(s?'sevoflurane':'propofol')+' boosts beta (13–25 Hz) power. The DSA brightens high up and BIS may stay high or even rise, although the patient is drifting off.';}
  else if(d<0.44){n='Sedation';t='The beta peak slides down from about 15–20 Hz towards 12 Hz while slow waves appear at the bottom. BIS sits around 60–80. The patient may still respond to voice.';}
  else if(d<0.68){n='General anaesthesia';t=(s?'Sevoflurane':'Propofol')+' gives the classic two bands: a bright alpha band (8–12 Hz) and bright slow-delta power (under 4 Hz), with a dark gap above about 15 Hz. SEF95 falls to about 15 Hz and BIS reads 40–60.'+(s?' Sevoflurane also adds theta around 5 Hz from about 1 MAC, filling the gap between slow and alpha.':'');}
  else if(d<0.82){n='Deep anaesthesia';t='The alpha band dims and slides lower; slow waves dominate.'+(s?' With sevoflurane, theta fills in between alpha and slow, merging them into one broad block.':'')+' BIS drops into the 30s.';}
  else if(d<0.96){n='Burst suppression';t='Bursts alternate with low-amplitude intervals: intermittent broadband activity and dark gaps on the DSA. SR rises, but BIS can remain in the 30s–40s, so inspect the raw EEG. This is generally more suppression than routine surgery requires. Its association with delirium does not establish causation; EEG-guidance trials have mixed results. Deliberate suppression has specialist indications, such as refractory status epilepticus.';}
  else if(s){n='Very deep sevoflurane';t='High sevoflurane concentrations can produce long suppressed intervals or an isoelectric EEG. Epileptiform activity can instead increase BIS or SEF in some patients; it is not simulated here. A rising index at high concentration needs review of the raw EEG, signal quality and clinical context.';}
  else {n='Isoelectric';t='The simulated EEG is nearly flat, the DSA is dark and SR approaches 100%. Profound drug effect, hypothermia or impaired cerebral perfusion can cause marked suppression. An unexpected flat tracing requires prompt assessment of circulation, oxygenation and drug delivery alongside the sensor and raw EEG. A frontal EEG monitor cannot diagnose brain death.';}
 } else if(drug==='ketamine'){
  if(d<0.08){n='Awake';t='Mixed fast activity with no strong band. BIS 90 or more.';}
  else if(d<0.45){n='Ketamine, sub-anaesthetic';t='Beta and gamma power rise. BIS stays high, which fits: the patient is analgesed but often still aware.';}
  else {n='Ketamine anaesthesia';t='Slow-delta waves alternating with bursts of gamma (about 27–40 Hz), more theta, and loss of alpha and mid-beta (10–24 Hz). On a 0–30 Hz DSA the gamma shows as a bright band at the top edge; most of it lies above the display. Fast power can keep SEF95 and BIS high despite unresponsiveness. Assess drug delivery and clinical context rather than inferring emergence from the index alone.';}
 } else {
  if(d<0.08){n='Awake';t='Mixed fast activity with no strong band. BIS 90 or more.';}
  else if(d<0.6){n='Dexmedetomidine sedation';t='Sleep-like spindles: short bursts at 9–15 Hz (peak about 13 Hz) that make the band look beaded, plus slow waves. The slow band is much weaker than under propofol GA. BIS reads 50–70, yet the patient can usually be roused, as from natural sleep.';}
  else {n='Deep dexmedetomidine sedation';t='Slow waves dominate and spindles become sparse. BIS may be low, but it does not reliably define responsiveness with this drug. Arousability varies with dose, co-administered drugs and the patient; deep sedation can include unresponsiveness.';}
 }
 if(mods.elderly&&drug!=='ketamine')t+=' Older patient: lower EEG power, particularly weaker and slower alpha, makes the DSA dimmer. A weak alpha band alone does not establish light anaesthesia. Index behaviour varies; assess the raw EEG and suppression alongside drug effect and clinical context.';
 if(mods.diathermy)t+=' Diathermy: electrical interference creates bright broadband stripes and reduces signal quality. In this simulator the index holds or disappears as SQI deteriorates; rejection thresholds differ between devices.';
 if(mods.nmb&&inducedDepth(drug,eng.de)>=0.3)t+=' Muscle relaxant reduces facial EMG but cannot exclude all contamination. Paralysis removes movement as a warning sign and does not provide hypnosis or analgesia.';
 else if(mods.nmb)t+=' Muscle relaxant: no facial EMG, so any BIS rise from muscle goes. Paralysis also takes away the muscle share of the awake fast activity. In awake volunteers given a relaxant, BIS fell at once to about 80, then minutes later to the mid-40s (Schuller 2015; an older-monitor study saw 33, once 9). A low BIS under relaxant does not prove unconsciousness.';
 else if(mods.emg)t+=' Muscle activity: high-frequency contamination raises the EMG indicator and can increase BIS without a change in hypnosis. EMG may also accompany arousal; interpret the EEG, stimulus and drug delivery together.';
 if(mods.asym)t+=' One-sided slowing: this example adds slow power and reduces faster activity on the '+(mods.asym==='L'?'left':'right')+'. Use a bilateral view to compare hemispheres. Asymmetry alone does not establish cerebral ischaemia; review signal quality and clinical context.';
 if(mods.blink)t+=' Blinks and eye movement: slow one-sided swings on the raw EEG and brighter power at 0.5–2 Hz along the bottom of the DSA. The monitor rejects most of it, but BIS can read a few points low; the biggest blinks are flagged as artefact.';
 if(eng.stT>0){const dh=drug==='mix'?mixTarget(Object.assign({},MIX0,eng.de)).dH:eng.de,bl=drug==='mix'&&eng.de.remi>=4;
  t+=' Surgical stimulus in this example: '+(bl?'remifentanil blunts the response, so the EEG barely changes.':(eng.stK==='beta'||eng.stK!=='alpha'&&eng.stK!=='delta'&&dh<0.5)?'in a light patient, beta (around 18 Hz) and facial EMG rise and BIS jumps 10–20 points. An opioid blunts this.':eng.stK==='delta'?'a paradoxical delta arousal: slow power rises and BIS falls, but this is arousal, not deeper anaesthesia. Interpret with the stimulus, drug delivery and haemodynamics.':'the alpha band dips by about 3 dB for a minute or two (an alpha dropout), which can accompany noxious stimulation. It does not by itself establish pain or awareness. Check timing, drug delivery, signal quality and haemodynamics (Hight 2019).');}
 if(typeof learningObservation==='function')t=learningObservation(t);
 if($('rName').textContent!==n)$('rName').textContent=n;if($('rText').textContent!==t)$('rText').textContent=t;}

function describeMix(m,tg){tg=tg||m;const hyp=0.155*m.propofol+sevoDepth(m.sevo),parts=[];let n;
 n=hyp<0.08?(m.ketamine>0.45?'Ketamine anaesthesia':m.dex>0.2?'Dexmedetomidine sedation':'Light or no hypnotic'):hyp<0.44?'Sedation':hyp<0.68?'General anaesthesia':hyp<0.85?'Deep anaesthesia':'Burst suppression';
 const on=[tg.propofol&&'propofol',tg.sevo&&'sevoflurane',tg.remi&&'remifentanil',tg.ketamine&&'ketamine',tg.dex&&'dexmedetomidine',tg.n2o&&'N₂O'].filter(Boolean);
 if(on.length)n+=' · '+on.join(' + ');
 if(tg.propofol&&tg.sevo)parts.push('This model combines propofol and sevoflurane effects; it does not establish equivalent clinical doses.');
 if(hyp>=0.44&&hyp<0.68&&!m.ketamine)parts.push('The hypnotic gives the usual alpha (8–12 Hz) and slow bands.');
 if(tg.remi)parts.push('Remifentanil barely changes BIS in a quiet patient (Guignard 2000), but it blunts the BIS and EMG rise from surgery or intubation: apply a surgical stimulus to compare the response.');
 if(tg.ketamine)parts.push('Ketamine adds faster activity and can weaken the alpha band. Its effect on BIS is dose-dependent: a higher index need not mean emergence. Compare the lower and higher adjunct examples.');
 if(tg.dex)parts.push('Added dexmedetomidine increases slow activity and can weaken and slow the propofol alpha band. Compare adding the adjunct with reducing propofol; these are illustrative patterns, not equivalent-dose prescriptions.');
 if(tg.n2o)parts.push('Nitrous oxide adds anaesthetic effect that may not be fully reflected in BIS. Compare the volatile contribution and the raw EEG.');
 if(!on.length)parts.push('Select a combination to explore its EEG and DSA pattern.');
 return [n,parts.join(' ')];}

// ===== controls =====
const DEPTH_TICKS={propofol:['Awake','Sedated','GA','Deep','Flat'],sevo:['Awake','Sedated','~0.7 MAC','1.5 MAC','over 2 MAC'],ketamine:['Awake','Analgesic','','GA','High dose'],dex:['Awake','','Sedated','','Deep sedation']};
let mode='single';const mix=Object.assign({},MIX0);
const PRESETS={tiva:{propofol:3,remi:4},propket:{propofol:3.5,ketamine:0.4},sevon2o:{sevo:0.8,n2o:0.6},propdex:{propofol:2.5,dex:0.5}};
let selectedMix='tiva';
function syncMix(){document.querySelectorAll('#presetSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===selectedMix)));if(typeof syncLearning==='function')syncLearning();}
function selectMix(key,variant){stopStory();selectedMix=key;selectedMixVariant=variant??MIX_LESSONS[key].initial;Object.assign(mix,MIX0,MIX_LESSONS[key].variants[selectedMixVariant][1]);depth=mix;syncMix();applyTarget();}
document.querySelectorAll('#presetSeg button').forEach(b=>b.onclick=()=>{selectMix(b.dataset.preset);if(paused)$('pause').click();});
function showMode(m){mode=m;document.querySelectorAll('#modeSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===m));
 $('mixCtl').hidden=m!=='mix';$('depthCtl').hidden=m==='mix';}
let lastSingle='propofol';
document.querySelectorAll('#modeSeg button').forEach(b=>b.onclick=()=>{stopStory();if(b.dataset.mode==='mix'){showMode('mix');drug='mix';depth=mix;syncMix();applyTarget();}else setDrug(lastSingle);});
function setDrug(dn){showMode('single');lastSingle=dn;depth=$('depth').value/100;drug=dn;document.querySelectorAll('#drugSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.drug===dn));
 $('ticks').innerHTML=DEPTH_TICKS[dn].map(s=>`<span>${s}</span>`).join('');applyTarget();}
document.querySelectorAll('#drugSeg button').forEach(b=>b.onclick=()=>{stopStory();setDrug(b.dataset.drug);});
// drag bubble: while the depth slider is moved, a bubble over the thumb shows the BIS that depth will settle at (read off
// the 21-point table when it is ready, otherwise a forecast, throttled); it fades a moment after the last move
let popT=0,popDown=false,popFc=0,popBusy=0;
function popBis(d){if(zonePts&&zoneOK===zoneKeyNow()){const x=cl(d)*20,j=Math.min(19,Math.floor(x));return zonePts[j]+(zonePts[j+1]-zonePts[j])*(x-j);}return null;}
function showPop(){const d=$('depth').value/100,el=$('tgtPop');let b=popBis(d);
 if(b==null&&!popBusy){popBusy=1;setTimeout(()=>{popBusy=0;popFc=forecastBis(drug,$('depth').value/100,mods);showPop();},120);}
 if(b==null)b=popFc;
 el.hidden=false;el.style.left=`clamp(34px, calc(8px + ${d} * (100% - 16px)), calc(100% - 34px))`;
 el.textContent=b==null?'BIS ≈ …':'BIS ≈ '+Math.round(b);el.className='pop'+(b!=null&&b>=40&&b<=60?' in':'');
 clearTimeout(popT);if(!popDown)popT=setTimeout(()=>{el.hidden=true;},1100);}
$('depth').addEventListener('pointerdown',()=>{popDown=true;showPop();});
addEventListener('pointerup',()=>{if(popDown){popDown=false;clearTimeout(popT);popT=setTimeout(()=>{$('tgtPop').hidden=true;},1100);}});
$('depth').addEventListener('blur',()=>{popDown=false;$('tgtPop').hidden=true;});
$('depth').oninput=e=>{stopStory();depth=e.target.value/100;applyTarget();showPop();};
$('mElder').onchange=e=>{mods.elderly=e.target.checked;applyTarget();};
$('mEmg').onchange=e=>{mods.emg=e.target.checked;applyTarget();};
// muscle relaxant (owner, 14 Oct 2026: on by default): 'auto' gives it at induction and reverses it at emergence, so the
// awake patient still reads 90s; 'on' paralyses an awake patient now (the awake-paralysis pitfall); 'off' for the EMG teaching
mods.nmbMode='off';
function setNmb(m){mods.nmbMode=m;document.querySelectorAll('#nmbSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.nmb===m));applyTarget();}
document.querySelectorAll('#nmbSeg button').forEach(b=>b.onclick=()=>setNmb(b.dataset.nmb));
// ===== relaxant buttons and the nerve-stimulator readout =====
mods.nmbK=0; // from here the block model drives the relaxant effect
function nmHint(r){if(!nm.given&&nm.ce<0.05)return 'No relaxant on board.';
 if(r.tofc===0)return r.ptc===0?'Profound block: no twitch to train-of-four or post-tetanic count. Sugammadex 2 mg/kg will not reverse this yet; 4 mg/kg, or wait.':`Deep block (PTC ${r.ptc}): no train-of-four twitch. Sugammadex 4 mg/kg reverses it; neostigmine will not.`;
 if(r.tofc<4)return `Moderate block (TOF count ${r.tofc}): sugammadex 2 mg/kg reverses it. Neostigmine works best from a count of 4.`;
 if(r.tofr!=null&&r.tofr<0.9)return `TOF count 4, ratio ${r.tofr.toFixed(2)}: not yet recovered. Extubate only at a ratio of 0.9 or more.`;
 return 'Recovered: TOF ratio 0.9 or more.';}
function nmUI(){const r=nmRead(),t=`T1 ${Math.round(r.t1)}% · TOF count ${r.tofc}`+(r.ptc!=null?` · PTC ${r.ptc}`:'')+(r.tofr!=null?` · TOFr ${r.tofr.toFixed(2)}`:'');
 txt('nmRead',nm.given||nm.ce>0.05?t:'No relaxant given');txt('nmHint',nmHint(r));txt('s2Nm',nm.given||nm.ce>0.05?`TOFc ${r.tofc}`+(r.tofr!=null?` · ${r.tofr.toFixed(2)}`:r.ptc!=null?` · PTC ${r.ptc}`:''):'none');}
function setAsym(a){mods.asym=a;document.querySelectorAll('#asymSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.asym===a));applyTarget();}
document.querySelectorAll('#asymSeg button').forEach(b=>b.onclick=()=>setAsym(b.dataset.asym));
// emergence: stop every drug; the effect site falls slowly (the relaxant is reversed once the patient is light)
function setCase(c){mods.caseLen=c;document.querySelectorAll('#caseSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.case===c));}
mods.caseLen='medium';
document.querySelectorAll('#caseSeg button').forEach(b=>b.onclick=()=>setCase(b.dataset.case));
$('wakeBtn').onclick=()=>{stopStory();nmSug(2);
 if(drug==='mix'){Object.assign(mix,MIX0);syncMix();depth=mix;}else{depth=0;$('depth').value=0;}
 applyTarget();if(paused)$('pause').click();$('storyCap').textContent='Emergence: drug targets are zero. Watch the evolving EEG and DSA as the modelled effect wears off; the processed index responds with a delay.';};
$('tReset').onclick=()=>{tim.sup=tim.low=R.tim.sup=R.tim.low=0;dirty=true;};
$('mDia').onchange=e=>{mods.diathermy=e.target.checked;applyTarget();};
// ===== target BIS: what the monitor will settle on for the dose set =====
// A throwaway engine is started at the target and run 36 sim-s; BIS comes from the same features and formula as the
// live monitor. Computed 180 ms after the last change (cheap: ~15 ms) so dragging stays smooth.
function forecastBis(dr,d,m,secs){
 const e=new Engine(),fm={elderly:!!m.elderly,emg:!!m.emg,nmbMode:m.nmbMode};e.setTarget(dr,cloneD(d),fm);e.snap();
 if(e.nmbOn&&inducedDepth(dr,e.de)<0.3)e.nmbS=1; // relaxant long since given in a light patient (stage 2 developed)
 // suppression runs last up to 30 s, so a short run can't measure SR: use the gate's long-run share instead (mean flat run
 // 2*10^(2*(bs-0.5)) s, mean burst 1.75 s, 1/bs bursts per cycle) and run longer to average the spectra
 const bs=e.p.bs,srSS=bs>0.97?100:bs>0.02?(L=>100*L/(L+1.75/bs))(2*10**(2*Math.max(0,bs-0.5))):null;
 const buf=[],eb=[],sp=[],raw=[];secs=srSS==null?secs||36:90;
 for(let n=0;n<secs*FS;n++){buf.push(e.sample());eb.push(e.eye);if(buf.length>NWIN){buf.shift();eb.shift();}
  if(buf.length===NWIN&&n%HOP===0){const w=buf.map((v,j)=>v-EYE_REJ*eb[j]),f=features(spectrum(w).P,w); // the same eye-movement rejection as step()sp.push(f.supFrac);if(sp.length>63)sp.shift();
   if(n>=14*FS)raw.push(bisRaw(f,srSS??100*sp.reduce((a,b)=>a+b,0)/sp.length));}}
 return raw.reduce((a,b)=>a+b,0)/raw.length;}
const fc={bis:null};let fcT=0,fcRun=0,zoneKey='',zoneRun=0;
var onTarget=()=>{slideUI();clearTimeout(fcT);const run=++fcRun;fcT=setTimeout(()=>{if(run!==fcRun)return;
 fc.bis=forecastBis(drug,drug==='mix'?mix:depth,mods);fcUI();
 if(drug!=='mix'){const key=zoneKeyNow();if(key!==zoneKey){zoneKey=key;zoneOK='';const zr=++zoneRun;zoneChunk(zr,0,[]);}}},180);};
// the depth range that gives BIS 40-60, from 17 short forecasts at depths 0-0.8 (BIS 40 is crossed before suppression starts;
// one forecast per timeout so the live monitor keeps drawing)
const zoneKeyNow=()=>drug+'|'+(+mods.elderly)+(+mods.emg)+mods.nmbMode;let zoneOK='',zonePts=null;
function zoneChunk(zr,i,pts){if(zr!==zoneRun)return;pts.push(forecastBis(drug,i/20,mods,24));
 if(i<16){setTimeout(()=>zoneChunk(zr,i+1,pts),40);return;}
 if(i===16)zoneBand(pts);
 if(i<20){setTimeout(()=>zoneChunk(zr,i+1,pts),40);return;} // 0.85-1.0 too (longer runs where suppression is expected), for the drag bubble
 zonePts=pts;zoneOK=zoneKeyNow();}
function zoneBand(pts){
 const cross=v=>{for(let j=0;j<pts.length;j++)if(pts[j]<=v)return j?(j-1+(pts[j-1]-v)/(pts[j-1]-pts[j]))/20:0;return null;};
 const lo=cross(60),hi=cross(40),h=hi==null?1:hi,band=$('zoneBand');
 const ok=lo!=null&&h>lo;band.hidden=!ok;$('zoneNote').hidden=false;
 if(ok){band.style.left=`calc(8px + ${lo} * (100% - 16px))`;band.style.width=`calc(${h-lo} * (100% - 16px))`;}
 $('zoneText').textContent=ok?'Green band: depths that settle at BIS 40–60 (steady state)':'No depth of this drug alone settles at BIS 40–60';}
function fcUI(){const b=fc.bis==null?'--':Math.round(fc.bis),el=drug==='mix'?['tgtMix','tgtMixSub']:['tgtBis','tgtSub'];
 const g=eng.gap(),sub=g>0.03?(drug==='mix'?' · drugs settling at the effect site':' · effect site '+Math.round(eng.de*100)+' → '+Math.round(depth*100)+', settling'):' · effect site at target';
 const bt=$(el[0]).firstChild,st=$(el[1]);const tx='Model BIS ≈ '+b;if(bt.textContent!==tx)bt.textContent=tx;if(st.textContent!==sub)st.textContent=sub;}
function slideUI(){if(drug==='mix'){fcUI();return;}$('effMark').style.left=`calc(8px + ${cl(eng.de)} * (100% - 16px))`;fcUI();}

// surgical stimulus: 100 sim-s of arousal; the button shows pressed while it lasts
let stimOn=false;function stimUI(){const on=eng.stT>0;if(on!==stimOn){stimOn=on;$('stimBtn').setAttribute('aria-pressed',on);$('stimBtn').textContent=on?'Stimulus running…':'Surgical stimulus';describe();}}
$('stimBtn').onclick=()=>{stimAll();stimUI();};
function setSpeed(s){speed=s;if($('playSpeed'))$('playSpeed').value=s;if($('speedValue'))$('speedValue').textContent=s+'×';document.querySelectorAll('#speedSeg button[data-speed]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.speed===s));}
document.querySelectorAll('#speedSeg button[data-speed]').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.speed));
function setView(v){view=v;document.querySelectorAll('#viewSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===v));$('wDsa').hidden=v==='eeg';$('wEeg').hidden=v==='dsa';dirty=true;}
document.querySelectorAll('#viewSeg button').forEach(b=>b.onclick=()=>setView(b.dataset.view));
// soft keys: smoothing 10/15/30 s (info message for 5 s) and EEG scale ±25/50/100/250 uV
$('kSmooth').onclick=()=>{const v=[10,15,30],n=v[(v.indexOf(mon.smooth)+1)%3];mon.smooth=n;$('kSmooth').textContent=`Smoothing ${n} s`;
 mon.info=`Smoothing Rate Changed to ${n} Seconds`;mon.infoUntil=Date.now()+5000;dirty=true;setTimeout(()=>dirty=true,5100);};
// EEG sweep (seconds across the lane) and the DSA colour range, per device (localStorage, try/catch)
function saveDisp(){try{localStorage.setItem('bisdsa.disp',JSON.stringify({sweep:mon.sweep,dbLo:mon.dbLo,dbHi:mon.dbHi}));}catch(e){}}
function dispUI(mark=true){$('kSweep').textContent='EEG sweep '+(mon.sweep==='auto'?'auto':mon.sweep+' s');
 $('dbLo').value=mon.dbLo;$('dbHi').value=mon.dbHi;$('oLo').textContent=mon.dbLo+' dB';$('oHi').textContent=mon.dbHi+' dB';
 if(typeof trendUI==='function')trendUI();if(mark)dirty=true;}
$('kSweep').onclick=()=>{const v=['auto',4,8,16];mon.sweep=v[(v.indexOf(mon.sweep)+1)%4];dispUI();saveDisp();};
$('dbLo').oninput=e=>{mon.dbLo=Math.min(+e.target.value,mon.dbHi-6);dispUI();saveDisp();};
$('dbHi').oninput=e=>{mon.dbHi=Math.max(+e.target.value,mon.dbLo+6);dispUI();saveDisp();};
$('dbReset').onclick=()=>{mon.dbLo=DB_LO;mon.dbHi=DB_HI;dispUI();saveDisp();};
try{const d=JSON.parse(localStorage.getItem('bisdsa.disp')||'null');if(d){if(['auto',4,8,16].includes(d.sweep))mon.sweep=d.sweep;if(Number.isFinite(d.dbLo)&&Number.isFinite(d.dbHi)&&d.dbHi-d.dbLo>=6){mon.dbLo=d.dbLo;mon.dbHi=d.dbHi;}}}catch(e){}
dispUI(false);
$('kScale').onclick=()=>{const v=[25,50,100,250],n=v[(v.indexOf(mon.scale)+1)%4];mon.scale=n;scaleUI();};
// ===== screen choice, VISTA soft keys, trend window =====
function scaleUI(){$('kScale').textContent=`EEG ±${mon.scale} µV`;}
function trendUI(){$('kTrend').textContent=`Trend ${mon.trend} min`;$('kBottom').textContent='Bottom: '+(mon.bottom==='emg'?'BIS + EMG':mon.bottom==='sr'?'BIS + SR':'BIS trend');
 txt('dsaRange',(mon.dbLo===DB_LO&&mon.dbHi===DB_HI?'':`${mon.dbLo}…${mon.dbHi} dB · `)+`last ${mon.trend} min`);}
let menuOpen=false; // the on-screen Menu (VISTA and two-sided screens)
function applySkin(s,reset,init){mon.skin=s;if($('monitorChoice'))$('monitorChoice').value=s;mtApply();$('vistaWrap').hidden=s!=='vista';$('sedWrap').hidden=s!=='sedline';if(s==='sedline')sedApply();$('advWrap').hidden=s!=='advance';if(s==='advance')advApply();$('pvWrap').hidden=s!=='philips';if(s==='philips')pvApply();$('classicWrap').hidden=s!=='classic';$('teachStrip').hidden=s==='classic';$('bilSum').hidden=s!=='sedline'&&s!=='advance'&&s!=='philips';
 document.querySelectorAll('#skinSeg button,#monSwitch button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.skin===s));
 $('keySeg').hidden=s!=='classic';if(s==='classic')closeMenu(true);
 if(reset){mon.scale=s==='classic'?100:50;mon.sweep=s==='classic'?'auto':8;}
 scaleUI();dispUI(false);trendUI();if(!init){dirty=true;if(reset)saveDisp();}}
document.querySelectorAll('#skinSeg button,#monSwitch button').forEach(b=>b.onclick=()=>applySkin(b.dataset.skin,true));
// the Menu: tap an item to step through its values; settings are the same ones the soft keys and Display panel change
const RANGES=[[-3,31],[0,25],[5,20],[-9,40]],SKINS=[['vista','BIS Vista'],['advance','BIS Advance'],['sedline','SedLine'],['philips','IntelliVue']];
const MENU=[
 ['Smoothing rate',()=>mon.smooth+' s',()=>$('kSmooth').click()],
 ['EEG scale',()=>`±${mon.scale} µV`,()=>$('kScale').click()],
 ['EEG sweep',()=>(mon.sweep==='auto'?8:mon.sweep)+' s',()=>$('kSweep').click()],
 ['Trend window',()=>mon.trend+' min',()=>$('kTrend').click()],
 ['Bottom trend',()=>mon.bottom==='emg'?'BIS + EMG':mon.bottom==='sr'?'BIS + SR':'BIS',()=>$('kBottom').click()],
 ['DSA colour range',()=>`${mon.dbLo} to ${mon.dbHi} dB`+(mon.dbLo===DB_LO&&mon.dbHi===DB_HI?' (default)':''),()=>{let i=RANGES.findIndex(r=>r[0]===mon.dbLo&&r[1]===mon.dbHi);[mon.dbLo,mon.dbHi]=RANGES[(i+1)%RANGES.length];dispUI();saveDisp();}],
 ['BIS alarm low',()=>String(mon.alo),()=>{mon.alo=mon.alo>=50?20:mon.alo+5;dirty=true;}],
 ['BIS alarm high',()=>String(mon.ahi),()=>{mon.ahi=mon.ahi>=80?50:mon.ahi+5;dirty=true;}],
 ['Alarm audio',()=>MT.alarm===0?'On':MT.alarm===1?'Paused':'Silent',()=>$('kSilent').click()],
 ['Teaching labels',()=>mon.teach?'On':'Off',()=>setTeach(!mon.teach)],
 ['Suppression timers',()=>'Reset',()=>$('tReset').click()],
 ['Sensor check',()=>'Start',()=>{closeMenu();$(mon.skin==='sedline'?'bSensor':'kSensor').click();}],
 ['Monitor',()=>(SKINS.find(k=>k[0]===mon.skin)||SKINS[0])[1],()=>{const i=SKINS.findIndex(k=>k[0]===mon.skin);applySkin(SKINS[(i+1)%SKINS.length][0],true);}]];
function menuRender(focusI){const ul=$('vMenuList');ul.innerHTML='';MENU.forEach(([l,v,fn],i)=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';
  b.innerHTML=`<span>${l}</span><b>${v()}</b>`;b.onclick=()=>{fn();menuRender(i);};li.appendChild(b);ul.appendChild(li);});
 if(focusI!=null)ul.children[focusI].firstChild.focus();}
function closeMenu(quiet){if(!menuOpen)return;menuOpen=false;$('vMenu').hidden=true;document.querySelectorAll('.menukey').forEach(k=>k.setAttribute('aria-expanded','false'));if(!quiet)$('kMenu').focus();}
function toggleMenu(){if(menuOpen){closeMenu();return;}menuOpen=true;$('vMenu').hidden=false;document.querySelectorAll('.menukey').forEach(k=>k.setAttribute('aria-expanded','true'));menuRender(0);}
document.querySelectorAll('.menukey').forEach(k=>k.onclick=toggleMenu);
$('vMenuClose').onclick=()=>closeMenu();
$('vMenu').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();closeMenu();}});
$('kTrend').onclick=()=>{const v=[5,15,60];mon.trend=v[(v.indexOf(mon.trend)+1)%3];trendUI();dirty=true;};
$('kBottom').onclick=()=>{const v=['bis','emg','sr'];mon.bottom=v[(v.indexOf(mon.bottom)+1)%3];trendUI();dirty=true;};
$('tReset2').onclick=()=>{tim.sup=tim.low=R.tim.sup=R.tim.low=0;dirty=true;};
// teaching labels (per device): zone pill, newest-2-s box, newest-column outline, colour key and the 40-60 target band
function setTeach(on){mon.teach=on;$('mTeach').checked=on;$('vZone').hidden=!on;$('tgtCap').hidden=!on;dirty=true;try{localStorage.setItem('bisdsa.teach',on?'1':'0');}catch(e){}}
$('mTeach').onchange=e=>setTeach(e.target.checked);
try{if(localStorage.getItem('bisdsa.teach')==='0')setTeach(false);}catch(e){}
// Each teaching session opens on BIS Advance with a unilateral sensor.
applySkin('advance',true,true);advBootEnd();ADV.win=5;advRelayout();
try{const d=JSON.parse(localStorage.getItem('bisdsa.disp')||'null');if(d&&['auto',4,8,16].includes(d.sweep)){mon.sweep=d.sweep;dispUI(false);}}catch(e){}
$('pause').onclick=()=>{paused=!paused;$('pause').setAttribute('aria-pressed',paused);$('pause').textContent=paused?'Resume':'Pause';};

// ===== the case story =====
const STORY=[
 {at:0,drug:'propofol',d:0,snap:true,mods:{},cap:'Awake baseline. Compare the raw EEG with the broad, low-power DSA.'},
 {at:25,d:0.17,cap:'Induction begins. Watch the early change in faster activity.'},
 {at:50,d:0.57,mods:{},cap:'Induction: slow-delta and alpha power develop as the effect increases. The processed index follows with a delay.'},
 {at:230,d:0.57,cap:'Maintenance. Compare the sustained alpha and slow-delta bands with the raw EEG.'},
 {at:320,d:0,mods:{},cap:'Emergence: the drug target is zero. Watch the bands change as the modelled effect wears off.'},
 {at:650,end:true,cap:'Demonstration complete. Drag the timeline back to compare induction and emergence, or adjust depth to explore further.'}];
let story=null;const SMODS=[['emg','mEmg'],['diathermy','mDia']];
function storyButtonUI(label){if(typeof syncPlayback==='function')syncPlayback();else $('storyBtn').textContent=label;}
function stopStory(){if(!story)return;story=null;storyButtonUI('Play induction → emergence');}
$('storyBtn').onclick=()=>{if(story){stopStory();$('storyCap').textContent='';return;}
 nmReset();story={t0:simT,i:-1};mods.elderly=false;$('mElder').checked=false;for(const [k,id] of SMODS){mods[k]=false;$(id).checked=false;}setNmb('off');eng.stT=R.eng.stT=0;tim.sup=tim.low=R.tim.sup=R.tim.low=0;setSpeed(10);
 if(paused)$('pause').click();storyButtonUI('Stop demonstration');};
function runStory(){if(!story)return;const t=simT-story.t0,steps=story.lesson?EEG_LESSONS[story.lesson].steps:STORY;
 while(story.i+1<steps.length&&t>=steps[story.i+1].at){story.i++;const s=steps[story.i];
  if(s.drug)setDrug(s.drug);if(s.d!=null){depth=s.d;$('depth').value=Math.round(s.d*100);}
  if(s.mods){for(const [k,id] of SMODS){mods[k]=!!(s.mods[k]||story.overlays?.[k]);$(id).checked=mods[k];}setNmb(s.mods.nmb===false?'off':s.mods.nmb===true?'on':'off');}
  if(s.stim)stimAll(s.stim);else if(s.mods)eng.stT=R.eng.stT=0;
  applyTarget();if(s.snap)snapAll();$('storyCap').textContent=`${story.i+1}/${steps.length} · ${s.cap}`;
  if(s.end){story=null;storyButtonUI('Replay demonstration');setSpeed(1);return;}}}

// ===== explainer animation =====
const cEx=$('cEx');
const STEPS=[
 {name:'1 · Take an epoch',cap:'The monitor takes the newest 2 seconds of frontal EEG and works it out again every second, so epochs overlap. (This simulator samples at 128 per second, 256 samples an epoch; the real monitor samples faster so it can also measure muscle activity at 70–110 Hz.)'},
 {name:'2 · It is a sum of waves',cap:'Any EEG epoch can be rebuilt by adding together waves of different frequencies. Here it is split into slow-delta (under 4 Hz), alpha (8–13 Hz) and beta (13–30 Hz) parts. Awake, the small fast beta part dominates; under propofol GA the slow and alpha parts are large and beta is tiny.'},
 {name:'3 · Fourier transform',cap:'A fast Fourier transform (FFT) measures how much power the epoch has at each frequency, every 0.5 Hz from 0 to 30 Hz. Taller bar = more power (log scale, in decibels).'},
 {name:'4 · Turn it into colour',cap:'Stand the spectrum on its side so frequency runs upward, and swap bar height for colour: blue for little power, through green and yellow, to red for a lot. The whole spectrum is now one thin column.'},
 {name:'5 · Add it to the DSA',cap:'The column joins the right-hand edge of the DSA and the older columns shift left. One column a second builds the picture on the monitor. The real BIS mixes a few features: the ratio of fast (30–47 Hz) to mid (11–20 Hz) power, a bispectral measure of how strongly waves of different frequencies are phase-locked (which the DSA doesn’t show) and, when deep, the suppression ratio. The recipe is proprietary; this page uses a simpler stand-in built from the same spectra.'}];
const T=[0,1.6,4.4,6.8,9.2,11.2,12.4];
let ex=null, exT=0, exPlaying=!reduced, exLast=null;
$('steps').innerHTML=STEPS.map((s,i)=>`<li><button data-i="${i}">${s.name}</button></li>`).join('');
document.querySelectorAll('#steps button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setExPlaying(false);if(i===0)snapshotEx();exT=T[i+1]-0.01;exUI();});
function setExPlaying(p){exPlaying=p;$('exPlay').textContent=p?'Pause':'Play';}
$('exPlay').onclick=()=>setExPlaying(!exPlaying);
$('exNext').onclick=()=>{const s=curStep();setExPlaying(false);if(s>=4){snapshotEx();exT=T[1]-0.01;}else exT=T[s+2]-0.01;exUI();};
function curStep(){for(let i=0;i<5;i++)if(exT<T[i+1])return i;return 4;}
function bandRecon(win,lo,hi){const re=new Float64Array(NWIN),im=new Float64Array(NWIN);let m=0;for(const v of win)m+=v;m/=NWIN;for(let i=0;i<NWIN;i++)re[i]=win[i]-m;fft(re,im);
 const out=new Float32Array(NWIN);for(let k=Math.round(lo/DF);k<=Math.round(hi/DF);k++){for(let n=0;n<NWIN;n++){const a=2*Math.PI*k*n/NWIN;out[n]+=2*(re[k]*Math.cos(a)-im[k]*Math.sin(a))/NWIN;}}return out;}
function snapshotEx(){if(SIG.length<NWIN||!COLS.length)return;const strip=SIG.slice(-6*FS);const win=SIG.slice(-NWIN);const {P}=spectrum(win);
 const db=Array.from({length:NB},(_,k)=>10*Math.log10(P[k]+1e-4));
 ex={strip,win,db,comps:[['slow-delta  <4 Hz',bandRecon(win,0.5,4),'#6aa8ff'],['alpha  8–13 Hz',bandRecon(win,8,13),'#ffb454'],['beta  13–30 Hz',bandRecon(win,13.5,30),'#ff7a90']],
  hist:COLS.slice(-60).map(c=>c.db)};}
function layout(W){if(W>=700)return {W:960,H:440,A:{x:24,y:28,w:912,h:70},B:{x:24,y:140,w:300,h:270},C:{x:380,y:150,w:270,h:250},D:{x:690,y:150,w:16,h:250},E:{x:726,y:150,w:210,h:250},cw:5};
 return {W:480,H:700,A:{x:16,y:28,w:448,h:64},B:{x:16,y:128,w:448,h:250},C:{x:40,y:420,w:250,h:240},D:{x:316,y:420,w:14,h:240},E:{x:346,y:420,w:118,h:240},cw:4};}
const ease=t=>t<0?0:t>1?1:t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const prog=(a,b)=>ease((exT-a)/(b-a));
function trace(ctx,arr,x,y,w,h,scale,color,lw){ctx.strokeStyle=color;ctx.lineWidth=lw||1.3;ctx.beginPath();for(let i=0;i<arr.length;i++){const px=x+i/(arr.length-1)*w,py=y+h/2-arr[i]*scale;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();}
function drawEx(){const cw0=cEx.clientWidth||600;const L=layout(cw0);const scale=cw0/L.W;const {ctx}=fit(cEx,L.H*scale);ctx.setTransform(cEx._d*scale,0,0,cEx._d*scale,0,0);
 ctx.fillStyle=SCR.bg;ctx.fillRect(0,0,L.W,L.H);if(!ex){ctx.fillStyle=SCR.mute;ctx.font=MONO;ctx.fillText('Collecting EEG…',24,40);return;}
 const s=curStep();ctx.font=MONO;ctx.textAlign='left';
 // A: strip
 const A=L.A;ctx.fillStyle=SCR.mute;ctx.fillText('RAW EEG · last 6 s',A.x,A.y-10);
 trace(ctx,ex.strip,A.x,A.y,A.w,A.h,(A.h/2)/100,'#7ee0a1');
 const wx=A.x+A.w*(4/6),ww=A.w*(2/6);const flash=s===0?0.25+0.2*Math.sin(exT*8):0.12;
 ctx.fillStyle=`rgba(23,143,215,${flash})`;ctx.fillRect(wx,A.y-4,ww,A.h+8);ctx.strokeStyle='rgba(120,190,255,.9)';ctx.lineWidth=1.5;ctx.strokeRect(wx,A.y-4,ww,A.h+8);
 ctx.fillStyle=SCR.fg;ctx.textAlign='right';ctx.fillText('2-s epoch',wx+ww,A.y+A.h+20);ctx.textAlign='left';
 // B: epoch lifted down
 const B=L.B,rowH=B.h/4;const p1=prog(T[0]+0.2,T[1]);
 const ex0={x:wx,y:A.y,w:ww,h:A.h},ex1={x:B.x,y:B.y,w:B.w,h:rowH-14};const lerp=(a,b,t)=>a+(b-a)*t;
 const ep={x:lerp(ex0.x,ex1.x,p1),y:lerp(ex0.y,ex1.y,p1),w:lerp(ex0.w,ex1.w,p1),h:lerp(ex0.h,ex1.h,p1)};
 const sc=(ex1.h/2)/90;
 trace(ctx,ex.win,ep.x,ep.y,ep.w,ep.h,sc,'#7ee0a1',1.6);
 if(p1>0.98){ctx.fillStyle=SCR.fg;ctx.fillText('epoch',B.x,B.y-6);}
 const p2=prog(T[1],T[2]-0.4);
 if(exT>=T[1]){ex.comps.forEach(([lab,arr,col],i)=>{const a=Math.max(0,Math.min(1,p2*3-i));if(a<=0)return;ctx.globalAlpha=a;
   const y=B.y+rowH*(i+1);ctx.fillStyle=col;ctx.fillText((i===0?'= ':'+ ')+lab,B.x,y-2);trace(ctx,arr,B.x,y,B.w,rowH-14,sc,col,1.4);ctx.globalAlpha=1;});}
 // C: spectrum bars
 const C=L.C,bw=C.w/NB,hOf=d=>dbToXd(d)*C.h;const p3=exT<T[2]?0:Math.min(1,(exT-T[2])/(T[3]-T[2]-0.4));const p4=prog(T[3],T[4]-0.3);const p5=prog(T[4],T[5]-0.2);
 if(exT>=T[2]){ // axes
  ctx.globalAlpha=1-p4*0.6;ctx.strokeStyle=SCR.grid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(C.x,C.y);ctx.lineTo(C.x,C.y+C.h);ctx.lineTo(C.x+C.w,C.y+C.h);ctx.stroke();
  ctx.fillStyle=SCR.mute;ctx.textAlign='center';for(const f of [0,10,20,30])ctx.fillText(f,C.x+f/30*C.w,C.y+C.h+16);ctx.fillText('frequency (Hz)',C.x+C.w/2,C.y+C.h+32);
  ctx.save();ctx.translate(C.x-12,C.y+C.h/2);ctx.rotate(-Math.PI/2);ctx.fillText('power (dB)',0,0);ctx.restore();
  // band labels
  const bands=[[0.5,4,'δ'],[4,8,'θ'],[8,13,'α'],[13,30,'β']];bands.forEach(([lo,hi,l])=>{ctx.fillStyle='rgba(255,255,255,.04)';if(l==='α'||l==='δ')ctx.fillRect(C.x+lo/30*C.w,C.y,(hi-lo)/30*C.w,C.h);ctx.fillStyle=SCR.mute;ctx.fillText(l,C.x+(lo+hi)/60*C.w,C.y-6);});
  ctx.globalAlpha=1;ctx.textAlign='left';
 }
 const D=L.D,ch=D.h/NB;
 // E: mini DSA history (shifts left during step 5)
 const E=L.E,ncol=Math.floor(E.w/L.cw);const hist=ex.hist.slice(-(ncol-1));
 if(exT>=T[3]-0.2){ctx.save();ctx.beginPath();ctx.rect(E.x,E.y,E.w,E.h);ctx.clip();
  const shift=p5*L.cw;hist.forEach((col,ci)=>{const x=E.x+E.w-L.cw*(hist.length-ci)-shift;for(let k=0;k<NB;k++){ctx.fillStyle=rgb(LUT[(dbToXd(col[k])*255)|0]);ctx.fillRect(x,E.y+E.h-(k+1)*ch,L.cw+0.5,ch+0.5);}});
  ctx.restore();ctx.strokeStyle=SCR.grid;ctx.strokeRect(E.x-.5,E.y-.5,E.w+1,E.h+1);
  ctx.fillStyle=SCR.fg;ctx.fillText('DSA',E.x,E.y-8);ctx.fillStyle=SCR.mute;ctx.textAlign='right';ctx.fillText('now →',E.x+E.w,E.y+E.h+16);ctx.textAlign='left';
  ctx.textAlign='right';ctx.fillText('30',D.x-4,D.y+8);ctx.fillText('0 Hz',D.x-4,D.y+D.h);ctx.textAlign='left';}
 // bars -> column -> into DSA
 if(exT>=T[2]){const nShow=Math.floor(p3*NB);
  for(let k=0;k<NB;k++){if(k>nShow&&p4===0)continue;const hk=hOf(ex.db[k]);
   const r0={x:C.x+k*bw+0.5,y:C.y+C.h-hk,w:bw-1,h:hk};
   const colX=lerp(D.x,E.x+E.w-L.cw,p5),colW=lerp(D.w,L.cw,p5);
   const r1={x:colX,y:D.y+D.h-(k+1)*ch,w:colW,h:ch+0.5};
   const r={x:lerp(r0.x,r1.x,p4),y:lerp(r0.y,r1.y,p4),w:lerp(r0.w,r1.w,p4),h:lerp(r0.h,r1.h,p4)};
   const cc=LUT[(dbToXd(ex.db[k])*255)|0];const grey=[200,214,235];
   const mix=[0,1,2].map(j=>Math.round(lerp(grey[j],cc[j],Math.min(1,p4*1.6))));ctx.fillStyle=rgb(mix);ctx.fillRect(r.x,r.y,r.w,r.h);}
  if(p4>0.9&&p5<0.05){ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(D.x-1.5,D.y-1.5,D.w+3,D.h+3);}
 }
 // step title on canvas
 ctx.fillStyle=SCR.bis;ctx.font='600 13px "JetBrains Mono", monospace';ctx.textAlign='right';ctx.fillText(STEPS[s].name.toUpperCase(),L.W-24,18);ctx.textAlign='left';
}
function exUI(){const s=curStep();document.querySelectorAll('#steps button').forEach((b,i)=>{if(i===s)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
 if($('exCap')._s!==s){$('exCap')._s=s;$('exCap').textContent=STEPS[s].cap;}}

// ===== offline strips for library and quiz =====
function simStrip(drug,d,m,seconds){const e=new Engine();e.setTarget(drug,d,m);e.snap();const buf=[];const cols=[];let n=0;
 for(let s=0;s<(seconds+2)*FS;s++){buf.push(e.sample());if(buf.length>NWIN)buf.shift();n++;
  if(n%HOP===0&&buf.length===NWIN&&s>2*FS){const {P}=spectrum(buf);const f=features(P,buf);cols.push({db:Array.from({length:NB},(_,k)=>10*Math.log10(P[k]+1e-4)),sef:f.suppressed?null:f.sef});}}
 return cols;}
function drawStrip(canvas,cols){const {ctx,w,h}=fit(canvas);ctx.fillStyle=SCR.bg;ctx.fillRect(0,0,w,h);const g={x:28,y:6,w:w-34,h:h-12};
 const o=document.createElement('canvas');o.width=cols.length;o.height=NB;const oc=o.getContext('2d');const im=oc.createImageData(cols.length,NB);
 cols.forEach((c,x)=>{for(let y=0;y<NB;y++){const i=(y*cols.length+x)*4,col=LUT[(dbToXd(c.db[NB-1-y])*255)|0];im.data[i]=col[0];im.data[i+1]=col[1];im.data[i+2]=col[2];im.data[i+3]=255;}});
 oc.putImageData(im,0,0);ctx.imageSmoothingEnabled=true;ctx.drawImage(o,g.x,g.y,g.w,g.h);
 ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.2;ctx.beginPath();let pen=false;cols.forEach((c,i)=>{if(c.sef==null){pen=false;return;}const x=g.x+(i+.5)/cols.length*g.w,y=g.y+g.h*(1-c.sef/30);pen?ctx.lineTo(x,y):ctx.moveTo(x,y);pen=true;});ctx.stroke();
 ctx.fillStyle=SCR.mute;ctx.font='600 10px "JetBrains Mono", monospace';ctx.textAlign='right';ctx.fillText('30',g.x-4,g.y+9);ctx.fillText('15',g.x-4,g.y+g.h/2+4);ctx.fillText('0',g.x-4,g.y+g.h);}
const LIB=[
 {id:'awake',name:'Awake',drug:'propofol',d:0,m:{},bis:'90–98',txt:'Delta from eye movements along the bottom, some theta, a beta band, little alpha with eyes open. SEF95 is high.'},
 {id:'ga',name:'Propofol GA',drug:'propofol',d:0.57,m:{},bis:'40–60',txt:'Two bright bands, alpha 8–12 Hz and slow under 4 Hz, with a dark gap above. A typical propofol pattern; individual patients vary.'},
 {id:'deep',name:'Deep propofol',drug:'propofol',d:0.76,m:{},bis:'30–40',txt:'Alpha dims and drifts lower; slow waves take over. Assess the pattern alongside suppression, drug delivery and the clinical context.'},
 {id:'bs',name:'Burst suppression',drug:'propofol',d:0.9,m:{},bis:'25–40, SR 15–40%',txt:'Dark vertical stripes are flat-line periods. SR above 0, while BIS can still read in the 30s, so read SR too. Usually unnecessary depth (unless intended).'},
 {id:'old',name:'Older patient, propofol GA',drug:'propofol',d:0.57,m:{elderly:true},bis:'45–60',txt:'Lower overall power with weaker, slower alpha. A dim DSA alone does not establish light anaesthesia; inspect the raw EEG and suppression.'},
 {id:'sevo',name:'Sevoflurane',drug:'sevo',d:0.76,m:{},bis:'30–40',txt:'Theta (4–8 Hz) fills the gap, so alpha and slow merge into one broad bright block.'},
 {id:'ket',name:'Ketamine',drug:'ketamine',d:0.65,m:{},bis:'60–80',txt:'Slow waves with gamma bursts at the top edge (most gamma is above 30 Hz), no alpha. BIS reads high in an unconscious patient.'},
 {id:'dex',name:'Dexmedetomidine',drug:'dex',d:0.4,m:{},bis:'50–70',txt:'Beaded spindles at 9–15 Hz with slow waves, resembling non-REM sleep, with a weaker slow band than propofol. Responsiveness varies with sedation depth.'},
 {id:'propket',name:'Propofol + ketamine',drug:'mix',d:{propofol:3.5,ketamine:0.4},m:{},bis:'55–70',txt:'The propofol slow band is there, but the alpha band fades and fast power fills in above 20 Hz. BIS can rise without emergence.'},
 {id:'sevon2o',name:'Sevoflurane + N₂O',drug:'mix',d:{sevo:0.8,n2o:0.6},m:{},bis:'50–60',txt:'Sevoflurane bands with extra fast power from nitrous oxide. BIS may not fully reflect the added anaesthetic effect.'},
 {id:'emg',name:'EMG artefact',drug:'propofol',d:0.55,m:{emg:true},bis:'falsely 65–85',txt:'Broad power climbing into the high frequencies over a normal GA pattern. Check the EMG bar.'}];
function buildLib(){const el=$('lib');el.innerHTML=LIB.map(x=>`<article class="card"><canvas id="lib-${x.id}" height="110" aria-label="DSA strip: ${x.name}"></canvas><div class="meta"><h3>${x.name}</h3><span class="bis">Model BIS ${x.bis}</span></div><p>${x.txt}</p></article>`).join('');
 let i=0;const next=()=>{if(i>=LIB.length)return;const x=LIB[i++];x.cols=simStrip(x.drug,x.d,x.m,150);drawStrip($('lib-'+x.id),x.cols);setTimeout(next,0);};next();}

// quiz
let qa=null,score=0,tries=0;
function newQ(){const QZ=LIB.filter(x=>x.quiz!==false),ans=QZ[Math.floor(Math.random()*QZ.length)];const others=QZ.filter(x=>x!==ans).sort(()=>Math.random()-.5).slice(0,3);
 const opts=[ans,...others].sort(()=>Math.random()-.5);qa={ans,done:false,cols:simStrip(ans.drug,ans.d,ans.m,150)};drawStrip($('cQuiz'),qa.cols);$('fb').textContent='';
 $('opts').innerHTML=opts.map(o=>`<button data-id="${o.id}">${o.name}</button>`).join('');
 document.querySelectorAll('#opts button').forEach(b=>b.onclick=()=>{if(qa.done)return;qa.done=true;tries++;const ok=b.dataset.id===ans.id;if(ok)score++;
  document.querySelectorAll('#opts button').forEach(x=>{if(x.dataset.id===ans.id)x.classList.add('right');else if(x===b)x.classList.add('wrong');});
  $('fb').textContent=(ok?'Correct. ':'It was '+ans.name+'. ')+ans.txt+' (model BIS '+ans.bis+')';$('score').textContent=`${score} / ${tries}`;});}
$('qNext').onclick=newQ;

// ===== main loop =====
let lastUI=0;let last=performance.now(),dirty=true,colsSinceSnap=0;
var onColumn=()=>{dirty=true;};
function frame(now){requestAnimationFrame(frame);try{frameBody(now);}catch(e){const el=$('err');if(el&&el.hidden){el.hidden=false;el.textContent='Display error: '+e.message;}}}
function frameBody(now){const dt=Math.min(0.1,(now-last)/1000);last=now;
 if(!paused){const target=simT+dt*speed;const need=Math.floor(target*FS)-Math.floor(simT*FS);simT=target;nmStep(dt*speed);step(need);stepR(need);runStory();}
 if(typeof tlTick==='function')tlTick();
 if(mon.skin==='advance')advTick(dirty);
 if(mon.skin==='sedline')sedTick(dirty);
 if(mon.skin==='philips')pvTick(dirty);
 if(dirty){paintOff();drawTrend();drawDsa();if(mon.skin==='vista'){paintV();drawVDsa();}readouts();stimUI();dirty=false;}
 drawEeg();if(mon.skin==='vista')drawVEeg();
 if(exPlaying){exT+=dt;if(exT>=T[6]){exT=0;snapshotEx();}}
 if(!ex)snapshotEx();
 drawEx();exUI();
 if(now-lastUI>250){lastUI=now;slideUI();describe();nmUI();}}
// warm start: the patient is awake (owner, 14 Oct 2026); 5 min of awake EEG so the screen opens full
setDrug('propofol');snapAll();step(300*FS);stepR(300*FS);simT=300;warming=false;snapshotEx();
if(reduced){exT=T[5]-0.01;}
addEventListener('resize',()=>{dirty=true;LIB.forEach(x=>x.cols&&drawStrip($('lib-'+x.id),x.cols));qa&&drawStrip($('cQuiz'),qa.cols);});
requestAnimationFrame(frame);
setTimeout(()=>{buildLib();newQ();},50);
