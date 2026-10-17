import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const BASE=process.env.EEG_URL||`http://localhost:${process.env.PORT||8080}/eeg/`;
const ids={vista:'vista',advance:'advS',sedline:'sedS',philips:'pvS',classic:'classicWrap'};
try{
 for(const [width,height] of [[1440,900],[1366,768],[1920,1080],[1024,768],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(BASE);await page.waitForFunction(()=>TL.t0!=null);
  for(const skin of Object.keys(ids)){
   await page.selectOption('#monitorChoice',skin);await page.waitForTimeout(300);
   for(const full of [false,true]){
    if(full)await page.click('#fullScreen');await page.waitForTimeout(200);
    const dim=await page.evaluate(id=>{const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};return {m:rect(document.getElementById('mobileScreen')?.getClientRects().length?document.getElementById('mobileScreen'):document.getElementById(id)),s:rect(document.querySelector('#monitor .screens')),dock:rect(document.querySelector('#monitor .panel')),overflow:document.documentElement.scrollWidth>innerWidth+1}},ids[skin]);
    const {m,s,dock}=dim,label=`${width}×${height} ${skin} ${full?'fullscreen':'page'}`;
    assert.ok(m.w>120&&m.h>100,`${label}: monitor cannot collapse (${m.w}×${m.h})`);
    assert.ok(Math.max(m.w/s.w,m.h/s.h)>.72,`${label}: screen should use the available stage`);
    assert.ok(m.x>=s.x-2&&m.y>=s.y-2&&m.right<=s.right+2&&m.bottom<=s.bottom+2,`${label}: entire monitor fits`);
    assert.ok(!dim.overflow,`${label}: no horizontal overflow`);
    if(full){assert.ok(dock.bottom<=height+1,`${label}: controls fit in viewport`);assert.ok(dock.y>=s.bottom-1||dock.x>=s.right-1,`${label}: controls do not cover monitor`);}
    if(process.env.EEG_SCREENSHOTS&&full&&['advance','sedline','classic'].includes(skin))await page.screenshot({path:`/tmp/eeg-fixed-${width}-${height}-${skin}.png`});
    if(full)await page.click('#fullScreen');
   }
   if(skin==='advance'){
    assert.ok(await page.evaluate(()=>{advData();return ADV.d.dsa.L.nData>200;}),'Advance immediately displays the existing DSA history');
    for(const ch of ['2','4']){await page.click(`#channelChoice [data-ch="${ch}"]`);await page.waitForTimeout(100);assert.equal(await page.evaluate(()=>ADV.ch),+ch);}
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
