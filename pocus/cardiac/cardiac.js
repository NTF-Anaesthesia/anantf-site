/* Fixed-input conservation model. Not a physiologic predictor or ultrasound trace. */
(() => {
  'use strict';
  const canvas = document.getElementById('efFlowCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d'), W = 500, H = 330;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr;
  const fields = ['EDV', 'EF', 'MR', 'HR'];
  const presets = [[120,60,0,75],[40,70,0,100],[200,30,0,90],[150,60,50,80]];
  const state = { EDV:120, EF:60, MR:0, HR:75, time:0 };
  const el = id => document.getElementById(id);
  const values = () => {
    const sv = state.EDV * state.EF / 100, esv = state.EDV - sv;
    const reg = sv * state.MR / 100, forward = sv - reg;
    return {sv,esv,reg,forward,co:forward * state.HR / 1000};
  };
  const f = x => Number.isInteger(x) ? String(x) : x.toFixed(1);
  function update() {
    const v = values();
    fields.forEach(k => {el('efFlow'+k).value=state[k];el('efFlow'+k+'Out').textContent=state[k]+({EDV:' mL',EF:'%',MR:'%',HR:'/min'}[k]);});
    const rows=[['End-systolic volume',f(v.esv)+' mL'],['Total SV',f(v.sv)+' mL'],['Mitral regurgitation',f(v.reg)+' mL'],['Forward SV',f(v.forward)+' mL'],['Forward output',v.co.toFixed(2)+' L/min']];
    el('efFlowRead').innerHTML=rows.map(([k,x])=>`<div><small>${k}</small><b>${x}</b></div>`).join('');
    let text=`EF ${state.EF}% of ${state.EDV} mL gives ${f(v.sv)} mL ejected per beat.`;
    if(state.MR)text+=` ${f(v.reg)} mL returns to the LA in this isolated-MR example; ${f(v.forward)} mL travels forward.`;
    else text+=` With no regurgitation or shunt, all ${f(v.forward)} mL travels forward.`;
    text+=' Judge adequacy against the patient’s perfusion and demand, not EF alone.';
    el('efFlowStatus').textContent=text;
    draw();
  }
  function arrow(x1,y1,x2,y2,width,color,progress){
    if(width<.4)return;
    const dx=x2-x1,dy=y2-y1,a=Math.atan2(dy,dx);
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const size=10+width*.22;ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-size*Math.cos(a-.55),y2-size*Math.sin(a-.55));ctx.lineTo(x2-size*Math.cos(a+.55),y2-size*Math.sin(a+.55));ctx.closePath();ctx.fill();
    if(progress>=0){ctx.beginPath();ctx.arc(x1+dx*progress,y1+dy*progress,3.5,0,Math.PI*2);ctx.fillStyle='#fffaf0';ctx.fill();}
  }
  function draw(){
    const v=values(), phase=((state.time*state.HR/60)%1+1)%1, c=cyc(phase).c;
    const scale=Math.cbrt(state.EDV/120), current=Math.cbrt(1-state.EF/100*c);
    const x=248,y=194,rx=57*scale,ry=83*scale,wall=15+7*c;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.fillStyle='#f7f5ef';ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#633d3c';ctx.beginPath();ctx.ellipse(x,y,rx*current+wall,ry*current+wall,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f7f5ef';ctx.beginPath();ctx.ellipse(x,y,rx*current,ry*current,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#8f8574';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#272722';ctx.textAlign='center';ctx.font='18px "NTF Sans", sans-serif';ctx.fillText('LV',x,y-10);ctx.font='16px "NTF Mono", monospace';ctx.fillText(f(state.EDV*(1-state.EF/100*c))+' mL',x,y+15);
    const eject=phase>.05&&phase<.34, prog=eject?(phase-.05)/.29:-1;
    ctx.globalAlpha=eject?1:.35;
    arrow(x+32,y-58,408,66,Math.max(3,22*(1-state.MR/100)),'#b85042',prog);
    if(state.MR)arrow(x-32,y-58,93,66,22*state.MR/100,'#b85042',prog);
    ctx.globalAlpha=1;ctx.font='16px "NTF Sans", sans-serif';ctx.textAlign='right';ctx.fillText('Forward',475,38);ctx.fillText(f(v.forward)+' mL/beat',475,59);
    ctx.textAlign='left';ctx.fillText('Back to LA',24,38);ctx.fillText(f(v.reg)+' mL/beat',24,59);
    ctx.textAlign='center';ctx.font='15px "NTF Sans", sans-serif';ctx.fillStyle='#55534d';ctx.fillText(phase<.34?'Systolic emptying':'Diastolic filling',250,316);
    ctx.textAlign='left';
  }
  fields.forEach(k=>el('efFlow'+k).addEventListener('input',e=>{state[k]=Number(e.target.value);document.querySelectorAll('#efFlowPresets button').forEach(b=>b.setAttribute('aria-pressed','false'));update();}));
  el('efFlowPresets').addEventListener('click',e=>{const b=e.target.closest('button[data-v]');if(!b)return;fields.forEach((k,i)=>state[k]=presets[Number(b.dataset.v)][i]);document.querySelectorAll('#efFlowPresets button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));update();});
  scene(canvas,{frame(dt){if(!PAUSED)state.time+=dt;draw();}});
  update();
})();
