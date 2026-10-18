/* Explicit teaching maths; independent of the canvas or page. */
(function(root){'use strict';
 const api={
  flow(diameter,vti,hr,angle=0,diameterError=0){const area=Math.PI*(diameter/2)**2,sv=area*vti,co=sv*hr/1000,measuredVti=vti*Math.cos(angle*Math.PI/180),measuredArea=area*(1+diameterError/100)**2;return{area,sv,co,measuredVti,measuredArea,measuredSv:measuredArea*measuredVti,measuredCo:measuredArea*measuredVti*hr/1000};},
  ejection(edv,ef,mr){const total=edv*ef/100;return{esv:edv-total,total,regurgitant:total*mr/100,forward:total*(1-mr/100)};},
  ivc(max,min){if(!(max>=min&&min>0))return null;const delta=max-min;return{collapse:100*delta/max,distend:100*delta/min,variability:100*delta/((max+min)/2)};},
  velocityVariation(max,min){if(!(max>=min&&min>0))return null;const mean=(max+min)/2;return{mean,delta:100*(max-min)/mean};},
 plr(time,scenario){const on=time>=20&&time<85,returning=time>=85;const response=on?(1-Math.exp(-(time-20)/5))*Math.exp(-Math.max(0,time-42)/160):returning?Math.exp(-(time-85)/7)*.75:0;const amplitude=scenario==='responsive'?2.4:scenario==='nonresponsive'?.5:1.1;const vti=16+amplitude*response,hr=80+(scenario==='tachycardia'?20*response:0);return{vti,hr,vtiChange:100*(vti/16-1),coChange:100*(vti*hr/(16*80)-1),phase:time<20?'Baseline':on?'Passive leg raise':'Return to baseline'};}
 };if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HaemoModel=api;
})(typeof window!=='undefined'?window:this);
