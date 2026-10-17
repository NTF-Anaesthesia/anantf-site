/* RV measurement concepts. Static diagrams respond only to deliberate input. */
(()=>{'use strict';
 const el=id=>document.getElementById(id), keys=['Eda','Esa','Excursion','Angle'];
 if(!el('rvMeasureLab'))return;
 const examples={normal:[25,14,22,0],discordant:[30,23,22,0],angle:[25,14,22,50]};
 function update(){
  const eda=+el('rvEda').value;
  el('rvEsa').max=eda;
  if(+el('rvEsa').value>eda)el('rvEsa').value=eda;
  const esa=+el('rvEsa').value,exc=+el('rvExcursion').value,angle=+el('rvAngle').value;
  keys.forEach(k=>el('rv'+k+'Out').textContent=el('rv'+k).value);
  const fac=100*(eda-esa)/eda,observed=exc*Math.cos(angle*Math.PI/180);
  const contour='M-82 60 L-50 -85 Q-25 -140 45 -130 Q100 -85 92 58 Z';
  const scale=Math.sqrt(eda/25),esScale=Math.sqrt(esa/25);
  el('rvAreaDiagram').innerHTML=`<text x="150" y="30" text-anchor="middle" font-size="21">End-diastole</text><text x="450" y="30" text-anchor="middle" font-size="21">End-systole</text><path d="${contour}" transform="translate(150 235) scale(${scale})" fill="#cbd7df" stroke="#2a5b8c" stroke-width="3"/><path d="${contour}" transform="translate(450 235) scale(${scale})" fill="none" stroke="#8f8574" stroke-dasharray="7 5" stroke-width="2"/><path d="${contour}" transform="translate(450 235) scale(${esScale})" fill="#e8ded7" stroke="#633d3c" stroke-width="3"/><text x="150" y="320" text-anchor="middle" font-size="20">EDA ${eda} cm²</text><text x="450" y="320" text-anchor="middle" font-size="20">ESA ${esa} cm²</text>`;
  const baseline=185,peak=baseline-observed*4;
  el('rvTapseDiagram').innerHTML=`<text x="25" y="30" font-size="21">Annular M-mode · schematic</text><path d="M40 ${baseline} L75 ${baseline} Q105 ${peak} 135 ${peak} L175 ${baseline} L220 ${baseline} Q250 ${peak} 280 ${peak} L320 ${baseline} L365 ${baseline} Q395 ${peak} 425 ${peak} L465 ${baseline}" fill="none" stroke="#272722" stroke-width="3"/><path d="M485 ${baseline} H525 M505 ${baseline} V${peak} M485 ${peak} H525" fill="none" stroke="#633d3c" stroke-width="3"/><text x="300" y="225" text-anchor="middle" font-size="19">Projected excursion ${observed.toFixed(1)} mm</text>`;
  el('rvMeasureResult').textContent=`FAC ${fac.toFixed(1)}%. Projected TAPSE ${observed.toFixed(1)} mm.${angle?' Oblique alignment underestimates excursion in this ideal model.':''}${fac<=35&&observed>17?' Preserved annular excursion does not establish normal global RV function.':''} Integrate acquisition, loading and the complete RV assessment.`;
 }
 keys.forEach(k=>el('rv'+k).addEventListener('input',()=>{document.querySelectorAll('#rvMeasurePresets button').forEach(b=>b.setAttribute('aria-pressed','false'));update();}));
 el('rvMeasurePresets').addEventListener('click',e=>{const b=e.target.closest('button[data-example]');if(!b)return;const v=examples[b.dataset.example];el('rvEsa').max=v[0];keys.forEach((k,i)=>el('rv'+k).value=v[i]);document.querySelectorAll('#rvMeasurePresets button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));update();});
 update();
})();
