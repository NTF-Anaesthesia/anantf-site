import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const BASE=process.env.EEG_URL||`http://localhost:${process.env.PORT||8080}/eeg/`;
const ids={vista:'vista',advance:'advS',sedline:'sedS',philips:'pvS',classic:'classicWrap'};
try{
 for(const [width,height] of [[1440,900],[1366,768],[1920,1080],[1280,720],[2560,1440],[1024,768],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(BASE);await page.waitForFunction(()=>TL.t0!=null);
  for(const skin of Object.keys(ids)){
   await page.selectOption('#monitorChoice',skin);await page.waitForTimeout(300);
   for(const full of [false,true]){
    if(full)await page.click('#fullScreen');await page.waitForTimeout(200);
    const dim=await page.evaluate(id=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};return {m:rect(document.getElementById(id)),s:rect(document.querySelector('#monitor .screens')),device:rect(document.getElementById({vista:'vistaWrap',advS:'advWrap',sedS:'sedWrap',pvS:'pvWrap',classicWrap:'classicWrap'}[id])),notes:rect(document.querySelector('#observationNotes')),dock:rect(document.querySelector('#monitor .panel')),overflow:document.documentElement.scrollWidth>innerWidth+1}},ids[skin]);
    const {m,s,dock}=dim,label=`${width}×${height} ${skin} ${full?'fullscreen':'page'}`;
    assert.ok(m.w>120&&m.h>100,`${label}: monitor cannot collapse (${m.w}×${m.h})`);
    assert.ok(Math.max(m.w/s.w,m.h/s.h)>.72,`${label}: screen should use the available stage`);
    assert.ok(m.x>=s.x-2&&m.y>=s.y-2&&m.right<=s.right+2&&m.bottom<=s.bottom+2,`${label}: entire monitor fits`);
    if(width>1100&&skin==='sedline'){
     // portrait SedLine: full-height monitor on the left; the right column has the title, the notes, then the dock at the bottom
     const head=await page.evaluate(()=>document.querySelector('#monitor .monhead').getBoundingClientRect().toJSON());
     assert.ok(dock.x>=dim.device.right+14&&dim.notes.x>=dim.device.right+14&&head.x>=dim.device.right+14,`${label}: title, notes and dock in the right column`);
     assert.ok(dim.notes.y>=head.bottom-1&&dock.y>=dim.notes.bottom-1,`${label}: title, notes, dock from top to bottom`);
     assert.ok(Math.abs(dim.device.y-head.y)<12,`${label}: monitor starts level with the title`);
     assert.ok(dim.device.h>=s.h*.95,`${label}: SedLine uses the full height (${dim.device.h} of ${s.h})`);
    }else if(width>1100){
     // the column is the device's width, or the dock's 600 px minimum for a narrow device (SedLine), so the controls never overlap
     const col=Math.max(dim.device.right,dock.x+600),gap=dim.notes.x-col;
     assert.ok(gap>=14&&gap<=18,`${label}: notes follow the monitor column (${gap}px gap)`);
     assert.ok(Math.abs(dock.right-col)<3,`${label}: dock spans the monitor column (${dock.right} vs ${col})`);
    }
    assert.ok(!dim.overflow,`${label}: no horizontal overflow`);
    if(full){assert.ok(dock.bottom<=height+1,`${label}: controls fit in viewport`);assert.ok(dock.y>=s.bottom-1||dock.x>=s.right-1,`${label}: controls do not cover monitor`);}
    if(process.env.EEG_SCREENSHOTS&&full&&['advance','sedline','classic'].includes(skin))await page.screenshot({path:`/tmp/eeg-fixed-${width}-${height}-${skin}.png`});
    if(full)await page.click('#fullScreen');
   }
   if(skin==='advance'){
    assert.ok(await page.evaluate(()=>{advData();return ADV.d.dsa.L.nData>200;}),'Advance immediately displays the existing DSA history');
    // Fullscreen must scale the same LCD, retaining its screen regions and sensor layout.
    for(const ch of ['2','4']){
     await page.click(`#channelChoice [data-ch="${ch}"]`);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>ADV.ch),+ch);
     const geometry=()=>page.evaluate(()=>{
      const screen=document.getElementById('advS'),r=screen.getBoundingClientRect();
      const regions=['advCv','advTop','advLeft','advMbar','aBisL',...(ADV.ch===4?['aBisR']:[])];
      return {width:r.width,ratio:r.width/r.height,regions:regions.map(id=>{
       const el=document.getElementById(id),b=el.getBoundingClientRect();
       return [(b.x+b.width/2-r.x)/r.width,(b.y+b.height/2-r.y)/r.height];
      })};
     });
     const before=await geometry();
     await page.click('#fullScreen');await page.waitForTimeout(250);
     assert.ok(await page.locator('#advS').isVisible(),'fullscreen retains the original Advance LCD');
     const after=await geometry();
     assert.ok(Math.abs(after.ratio-1.6)<.005,'Advance LCD keeps its 16:10 aspect ratio');
     for(let i=0;i<before.regions.length;i++)for(let k=0;k<2;k++)assert.ok(Math.abs(before.regions[i][k]-after.regions[i][k])<.005,`${width} channel ${ch}: LCD region ${i} retains its relative position`);
     if(width>1100){
      assert.ok(after.width>Math.min(800,width*.56),'desktop fullscreen keeps the monitor large');
      assert.ok(after.width>=before.width,'fullscreen never shrinks the desktop monitor');
     }
     await page.click('#fullScreen');
    }
   }
  }
  console.log(`PASS layout ${width}×${height}: five monitors in page and fullscreen`);
 }
 // Landing always starts with the unilateral BIS Advance, even with a legacy saved choice.
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(()=>localStorage.setItem('bisdsa.skin','vista'));await page.reload();await page.waitForFunction(()=>TL.t0!==null);
 assert.equal(await page.locator('#monitorChoice').inputValue(),'advance');
 assert.equal(await page.evaluate(()=>ADV.ch),2);
 assert.ok(await page.locator('#advS').evaluate(el=>el.clientWidth>700),'default monitor stays large');
 // Alternate teaching views and preset choices remain reachable in fullscreen.
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.selectOption('#monitorChoice','classic');
  await page.click('#fullScreen');
  for(const view of ['dsa','eeg','both']){
   await page.click(`#viewSeg [data-view="${view}"]`);await page.waitForTimeout(400);
   const sizes=await page.evaluate(()=>({dsa:document.getElementById('cDsa').clientHeight,eeg:document.getElementById('cEeg').clientHeight,stage:document.querySelector('.screens').clientHeight}));
   if(view!=='eeg')assert.ok(sizes.dsa>sizes.stage*.3,`${width} ${view}: DSA uses available height`);
   if(view==='eeg')assert.ok(sizes.eeg>sizes.stage*.3,`${width} ${view}: EEG uses available height`);
  }
  await page.selectOption('#agentChoice','mix');await page.waitForTimeout(400);
  assert.equal(await page.locator('#mixCtl input[type=range]').count(),0,'combinations have no dose sliders');
  const presets=page.locator('#presetSeg button');
  for(let n=0;n<await presets.count();n++){
   const choice=presets.nth(n);await choice.focus();await page.keyboard.press('Enter');
   const r=await choice.boundingBox();assert.ok(r&&r.y>=0&&r.y+r.height<=height,`${width}: every combination is reachable`);
   assert.equal(await choice.getAttribute('aria-pressed'),'true');
  }
  await page.selectOption('#agentChoice','propofol');await page.click('#fullScreen');
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
