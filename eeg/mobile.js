// Readable portrait presentation of the same BIS Advance teaching data.
// This adapts the layout; it does not introduce a second signal or index model.
const mobileScreen=document.createElement('section');mobileScreen.id='mobileScreen';mobileScreen.setAttribute('aria-label','BIS Advance adapted mobile display');
mobileScreen.innerHTML='<div class="mobile-values"></div><div class="mobile-plot"><div class="mobile-legend"><span>DSA · 0–30 Hz</span><span><i class="sef-key"></i> SEF95 <i class="mf-key"></i> MF</span></div><canvas id="mobileDsa" aria-label="Live density spectral array, frequency increasing upwards"></canvas><div class="mobile-colour"><span>Low power</span><i></i><span>High power</span></div></div><div class="mobile-plot"><div class="mobile-legend"><span>Raw EEG</span><span>Last 5 s · ±50 µV</span></div><canvas id="mobileEeg" aria-label="Live raw frontal EEG"></canvas></div>';
stage.append(mobileScreen);
function mobileContext(id){const cv=$(id),w=cv.clientWidth,h=cv.clientHeight,dpr=Math.min(2,devicePixelRatio||1);if(w<1||h<1)return null;
 if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
 const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.fillStyle='#000';c.fillRect(0,0,w,h);c.font='12px "NTF Sans", sans-serif';c.textBaseline='middle';return {c,w,h};}
function mobileLines(c,arr,count,cols,x,y,w,h,colour){c.beginPath();c.strokeStyle=colour;c.lineWidth=1;let pen=false;
 for(let i=0;i<count;i++){const v=arr[i];if(v==null){pen=false;continue;}const px=x+w*i/cols,py=y+h*(1-Math.max(0,Math.min(30,v))/30);if(pen)c.lineTo(px,py);else c.moveTo(px,py);pen=true;}c.stroke();}
function drawMobileDsa(sides){const v=mobileContext('mobileDsa');if(!v||!ADV.d)return;const {c,w,h}=v,x=28,plotW=w-x-4,row=h/sides.length;
 sides.forEach((side,i)=>{const ds=ADV.d.dsa[side],src=ADV.dsaCv[side],y=i*row+16,ph=row-36;if(!ds||!src||ph<=0)return;
  c.fillStyle='#d4d4d4';c.textAlign='left';c.fillText(sides.length===2?(side==='L'?'Left':'Right'):'Hz',0,i*row+7);
  if(ds.nData){c.imageSmoothingEnabled=false;c.drawImage(src.cv,0,0,ds.nData,NB,x,y,plotW*ds.nData/ds.cols,ph);}
  for(const f of (ph<100?[30,13,0]:[30,13,8,0])){const py=y+ph*(1-f/30);c.fillStyle='#d4d4d4';c.textAlign='right';c.fillText(String(f),x-5,Math.max(y+5,Math.min(y+ph-5,py)));c.strokeStyle='#ffffff30';c.beginPath();c.moveTo(x,py);c.lineTo(x+plotW,py);c.stroke();}
  mobileLines(c,ds.sef,ds.nData,ds.cols,x,y,plotW,ph,'#fff');mobileLines(c,ds.mf,ds.nData,ds.cols,x,y,plotW,ph,AC.mf);
  c.fillStyle='#b3b8bb';c.textAlign='left';c.fillText('−'+ADV.win+' min',x,y+ph+12);c.textAlign='right';c.fillText('Now',x+plotW,y+ph+12);
 });}
function drawMobileEeg(sides){const v=mobileContext('mobileEeg');if(!v)return;const {c,w,h}=v,row=h/sides.length,x=28,pw=w-x-4;
 sides.forEach((side,i)=>{const sig=side==='L'?SIG:R.SIG,n=Math.min(sig.length,5*FS),mid=(i+.5)*row,scale=(row-16)/100;
  c.fillStyle='#a7cbb2';c.textAlign='left';c.fillText(sides.length===2?(side==='L'?'L':'R'):'µV',0,mid);
  c.strokeStyle='#ffffff25';c.beginPath();c.moveTo(x,mid);c.lineTo(x+pw,mid);c.stroke();
  c.save();c.beginPath();c.rect(x,i*row,pw,row);c.clip();c.beginPath();c.strokeStyle=AC.eeg;c.lineWidth=1;
  for(let j=0;j<n;j++){const px=x+pw*j/(5*FS-1),py=mid-sig[sig.length-n+j]*scale;j?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();c.restore();
 });}
let mobileLast=0,mobileValues='';
function mobileFrame(now){requestAnimationFrame(mobileFrame);if(!mobileScreen.getClientRects().length||now-mobileLast<50)return;mobileLast=now;
 const sides=ADV.ch===4?['L','R']:['L'];const values=sides.map(side=>{const col=(side==='L'?HIST:R.HIST).at(-1),valid=col&&col.sqi>=15;
  return '<div class="mobile-channel"><div class="mobile-bis"><span>'+(sides.length===2?'BIS '+(side==='L'?'left':'right'):'BIS')+'</span><strong style="color:'+ (side==='L'?AC.bisL:AC.bisR)+'">'+(valid?Math.round(col.bis):'—')+'</strong></div><div class="mobile-metrics"><span>SR <b>'+ (valid?Math.round(col.bsr)+'%':'—')+'</b></span><span>SQI <b>'+(col?col.sqi+'%':'—')+'</b></span><span>EMG <b>'+(col?Math.round(col.emg)+' dB':'—')+'</b></span></div></div>';
 }).join('');if(values!==mobileValues){mobileScreen.querySelector('.mobile-values').innerHTML=values;mobileValues=values;}
 drawMobileDsa(sides);drawMobileEeg(sides);
}
requestAnimationFrame(mobileFrame);
