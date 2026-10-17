/* Constructed SCCM cases. Diagrams illustrate the stated observations, not diagnostic output. */
(() => {
  const select = document.getElementById('decisionCase');
  const button = document.getElementById('decisionCompare');
  const canvas = document.getElementById('decisionCanvas');
  const caption = document.getElementById('decisionCaption');
  const mode = document.getElementById('decisionMode');
  const state = { i: 0, compare: false };
  const examples = [
    { name: 'IVC: acquisition before interpretation', buttons: ['Track the vessel centre', 'Restore fixed probe plane'], captions: [
      'The vessel moves sideways through a fixed scan plane. Its apparent width falls even though the modelled vessel diameter is unchanged.',
      'Tracking the centre removes this geometric false collapse. Real respiratory variation still requires interpretation in context; this diagram isolates only the acquisition error.' ] },
    { name: 'Sepsis: reassess fluid tolerance', buttons: ['Compare the lungs', 'Return to the heart'], captions: [
      'Reduced LV contraction after resuscitation raises a pump-function question. It does not identify the cause of oliguria.',
      'Diffuse B-lines add concern about lung density or congestion. Reassess flow, perfusion and tolerance together; neither image supplies an automatic fluid decision.' ] },
    { name: 'Vigorous contraction and low forward flow', buttons: ['Show the measured flow', 'Return to contraction'], captions: [
      'A small LV can empty vigorously but eject a small absolute volume. EF describes a fraction, not cardiac output.',
      'With LVOT diameter 2.0 cm and VTI 10 cm: area 3.14 cm² × VTI = 31.4 mL. At 110/min, output is 3.46 L/min. Confirm acquisition, body size and perfusion before judging adequacy.' ] },
    { name: 'Withdrawal of respiratory support', buttons: ['During deterioration', 'Before the transition'], captions: [
      'Constructed baseline: sliding with mainly A-lines at the illustrated site. Compare the same zones before and during the clinical change.',
      'New B-lines during breathlessness accompany increased lung density. Changing respiratory support alters cardiac loading, but the pattern alone cannot prove weaning-induced pulmonary oedema.' ] },
    { name: 'Postoperative tamponade: the unseen collection', buttons: ['Reveal the unsampled region', 'Restore the limited window'], captions: [
      'Concept diagram: a limited window samples only part of the heart. The obscured region has not been assessed; it must not be called normal.',
      'A localised postoperative collection can compress a chamber without a large circumferential effusion. Urgent surgical communication and expert imaging depend on the clinical state, not on obtaining a textbook image.' ] },
    { name: 'No sliding does not equal pneumothorax', buttons: ['Compare with ventilated sliding', 'Return to absent sliding with pulse'], captions: [
      'No respiratory sliding, but a pleural movement synchronous with the heartbeat: lung pulse. This supports pleural apposition here and prompts a check of ventilation and tube position.',
      'Respiratory sliding has a different rhythm from cardiac lung pulse. Both support apposition at the sampled site; neither surveys the whole chest.' ] },
    { name: 'Explain both ventricles', buttons: ['Compare the LV short axis', 'Return to four chambers'], captions: [
      'An enlarged RV with an underfilled LV can reflect ventricular interaction. RV dilatation does not diagnose PE, and a small LV does not automatically justify fluid.',
      'Concept diagram: RV pressure loading flattens the septum predominantly in systole. The cause may be embolic, pulmonary or ventilatory; compare the clinical context and prior imaging.' ] },
    { name: 'PLR: a response is not an indication', buttons: ['During passive leg raising', 'Return to baseline'], captions: [
      'Baseline LVOT VTI is 16 cm. Keep the same Doppler alignment and sample location for comparison.',
      'VTI 18 cm gives (18 − 16) / 16 × 100 = 12.5%. Check manoeuvre and measurement validity. Without hypoperfusion, a positive response alone does not justify fluid.' ] }
  ];
  function textAt(c, text, x, y, size=18, colour='#e8e8e8', align='left') {
    c.fillStyle=colour; c.font=`${size}px sans-serif`; c.textAlign=align; c.fillText(text,x,y);
  }
  function ground(S, heading) {
    const c=S.c; c.fillStyle='#101318';c.fillRect(0,0,S.w,S.h);
    textAt(c,heading,22,32,19);textAt(c,'CONCEPT DIAGRAM',22,S.h-20,13,'#adb2b8');
    return c;
  }
  function ivcPlane(S,t,tracked) {
    const c=ground(S,'Out-of-plane motion'); const W=S.w, cy=168, r=64;
    const offset=57*Math.sin(t*TAU/RESP), cx=W*.36+offset;
    const plane=tracked?cx:W*.36;
    c.strokeStyle='#9bb6d3';c.lineWidth=4;c.fillStyle='#1c2b3a';
    c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill();c.stroke();
    c.strokeStyle='#f2ca75';c.lineWidth=3;c.beginPath();c.moveTo(plane,70);c.lineTo(plane,262);c.stroke();
    const half=Math.sqrt(Math.max(0,r*r-(plane-cx)*(plane-cx)));
    c.strokeStyle='#f7efe0';c.lineWidth=7;c.beginPath();c.moveTo(plane,cy-half);c.lineTo(plane,cy+half);c.stroke();
    textAt(c,'Vessel cross-section',25,285,16);textAt(c,tracked?'Plane follows centre':'Fixed scan plane',340,102,17,'#f2ca75');
    textAt(c,'True diameter: unchanged',340,143,17);textAt(c,'Apparent width',340,185,17);
    textAt(c,Math.round(100*half/r)+'% of full diameter',340,215,21,'#f2ca75');
    const y=352, h=half*.48;c.fillStyle='#07090c';c.fillRect(60,y-h,W-120,2*h);
    c.strokeStyle='#d7dee7';c.lineWidth=3; c.beginPath();c.moveTo(60,y-h);c.lineTo(W-60,y-h);c.moveTo(60,y+h);c.lineTo(W-60,y+h);c.stroke();
    textAt(c,'Apparent longitudinal lumen',60,416,17);
  }
  function flowEnvelope(S,t,vti,hr) {
    const c=ground(S,'LVOT pulsed-wave Doppler · illustrative');
    const x0=54,y0=330,w=S.w-100,h=190;c.strokeStyle='#868e96';c.lineWidth=1.5;
    c.beginPath();c.moveTo(x0,80);c.lineTo(x0,y0);c.lineTo(x0+w,y0);c.stroke();
    const beat=60/hr,cycle=beat*3,amplitude=h*vti/20;
    c.fillStyle='rgba(194,207,224,.4)';c.strokeStyle='#e6edf5';c.lineWidth=2;c.beginPath();c.moveTo(x0,y0);
    for(let j=0;j<=w;j++){const p=((j/w*cycle+t*.3)%beat)/beat;const v=p<.4?Math.sin(Math.PI*p/.4):0;c.lineTo(x0+j,y0-amplitude*v);}
    c.lineTo(x0+w,y0);c.closePath();c.fill();c.stroke();
    textAt(c,`VTI ${vti} cm`,75,80,25,'#f2ca75');textAt(c,`HR ${hr}/min`,75,114,19);
    textAt(c,'Area under one systolic envelope',x0,371,19);textAt(c,'Illustrative scaling; not a measured patient trace',x0,407,16,'#adb2b8');
  }
  function localCollection(S,t,reveal) {
    const c=ground(S,'Postoperative localised collection'); const sy=sysF(phase(t));
    c.strokeStyle='#a6aeb9';c.lineWidth=4;c.beginPath();c.ellipse(325,248,185,145,0,0,TAU);c.stroke();
    const chambers=[[245,218,65,82,'RV'],[376,225,64,92,'LV'],[246,340,50,39,'RA'],[365,340,46,39,'LA']];
    for(const [x,y,rx,ry,l] of chambers){c.fillStyle='#59484a';c.beginPath();c.ellipse(x,y,rx*(1-.11*sy),ry*(1-.16*sy),0,0,TAU);c.fill();textAt(c,l,x,y,19,'#fff','center');}
    c.fillStyle='#90736a';c.beginPath();c.ellipse(442,206,47,94,-.28,0,TAU);c.fill();
    if(!reveal){c.fillStyle='#20252c';c.fillRect(325,65,290,350);textAt(c,'Outside this window',470,215,18,'#abb2bd','center');textAt(c,'Not assessed',470,249,24,'#f2ca75','center');}
    else {textAt(c,'Localised clot / collection',S.w/2,416,18,'#f2ca75','center');}
    textAt(c,'Geometry only — not a typical echo appearance',S.w/2,444,15,'#abb2bd','center');
  }
  function lungPulse(S,t,sliding) {
    const c=ground(S,sliding?'Respiratory sliding':'Absent sliding with lung pulse');const y=140;
    c.fillStyle='#39434e';c.fillRect(30,70,S.w-60,y-70);c.fillStyle='#6d747d';
    for(let j=0;j<4;j++)c.fillRect(30,85+j*12,S.w-60,2);
    const motion=sliding?13*Math.sin(t*TAU/RESP):3*artP(t);
    c.fillStyle='#e9e5df';c.fillRect(30,y,S.w-60,5);
    for(let j=0;j<29;j++){c.fillStyle=j%2?'#9da8b2':'#cbd0d2';c.fillRect(40+j*19+motion,y+7,7,12);}
    c.strokeStyle='#8b939a';c.lineWidth=2;[240,340].forEach(y2=>{c.beginPath();c.moveTo(30,y2);c.lineTo(S.w-30,y2);c.stroke();});
    const base=404;c.strokeStyle='#f2ca75';c.lineWidth=2;c.beginPath();
    for(let x=30;x<S.w-30;x++){const tt=t-(S.w-30-x)/105;const v=sliding?Math.sin(TAU*tt/RESP)*17:artP(tt)*22;if(x===30)c.moveTo(x,base-v);else c.lineTo(x,base-v);}c.stroke();
    textAt(c,sliding?'Movement follows breathing':'Movement follows the heartbeat',32,372,18,'#e8e8e8');
    textAt(c,'Pleural line',32,126,16);textAt(c,'A-lines',32,324,16);
  }
  function septum(S,t) {
    const c=ground(S,'RV pressure loading · short-axis concept');const sy=sysF(phase(t)),x=365,y=252,r=112;
    c.fillStyle='#53494c';c.beginPath();c.ellipse(255,y,134,143,0,0,TAU);c.fill();
    c.fillStyle='#07090b';c.beginPath();c.ellipse(230,y,90,105,0,0,TAU);c.fill();
    c.strokeStyle='#c7bbb5';c.lineWidth=17;c.fillStyle='#07090b';
    c.beginPath();c.moveTo(x,y-r);c.bezierCurveTo(x+145,y-r,x+145,y+r,x,y+r);
    c.bezierCurveTo(x-135*(1-.8*sy),y+r,x-135*(1-.8*sy),y-r,x,y-r);c.closePath();c.fill();c.stroke();
    textAt(c,'RV',223,258,25,'#e9e2dc','center');textAt(c,'LV',391,258,25,'#e9e2dc','center');
    textAt(c,sy>.3?'Systole: septal flattening':'Diastole',S.w/2,419,22,'#f2ca75','center');
  }
  function draw(S,st,t) {
    switch(st.i){
      case 0:ivcPlane(S,t,st.compare);break;
      case 1:st.compare?vP(S,{m:'slide',bl:true},t):vH(S,{m:'reduced'},t);break;
      case 2:st.compare?flowEnvelope(S,t,10,110):vH(S,{m:'hyper'},t*110/HR);break;
      case 3:vP(S,{m:'slide',bl:st.compare},t);break;
      case 4:localCollection(S,t,st.compare);break;
      case 5:lungPulse(S,t,st.compare);break;
      case 6:st.compare?septum(S,t):vH(S,{m:'rv'},t);break;
      case 7:flowEnvelope(S,t,st.compare?18:16,80);break;
    }
  }
  const sc=scene(canvas,640,480,state,draw);
  function sync(){
    const E=examples[state.i];mode.textContent=E.name;
    button.textContent=E.buttons[state.compare?1:0];button.setAttribute('aria-pressed',String(state.compare));
    caption.textContent=E.captions[state.compare?1:0];canvas.setAttribute('aria-label',caption.textContent);
    document.querySelectorAll('.decision-case').forEach((a,i)=>a.hidden=i!==state.i);
    dirty(sc);
  }
  select.addEventListener('change',()=>{state.i=Number(select.value);state.compare=false;sync();});
  button.addEventListener('click',()=>{state.compare=!state.compare;sync();});
  document.addEventListener('pocus:reveal',event=>{
    const target=event.detail?.target;
    const article=target instanceof Element ? target.closest('.decision-case') : null;
    if(!article) return;
    state.i=Number(article.dataset.decision);state.compare=false;select.value=String(state.i);sync();
    const detail=target.closest('details');if(detail) detail.open=true;
  });
  sync();
})();
