import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(`http://localhost:${process.env.PORT||8080}/eeg/`);await page.waitForFunction(()=>TL.t0!==null);
 await page.click('#examplePlay');await page.evaluate(()=>{paused=true;});
 const base=await page.evaluate(()=>({alpha:eng.p.alpha,d:depth,t:TL.t0}));
 await page.evaluate(()=>tlRun(65));
 assert.equal(await page.evaluate(()=>depth),base.d,'dropout preserves hypnotic target');
 assert.ok(await page.evaluate(()=>eng.p.alpha)<base.alpha*.65,'alpha power falls');
 assert.equal(await page.evaluate(()=>eng.stK),'alpha');
 await page.evaluate(()=>tlRun(110));assert.ok(await page.evaluate(()=>eng.p.alpha)>base.alpha*.85,'alpha recovers');
 await page.evaluate(t=>tlJump(t+50),base.t);await page.waitForFunction(()=>!TL.busy);assert.equal(await page.evaluate(()=>story.lesson),'alpha','rewind preserves lesson');
 for(const kind of ['delta','beta','suppression','older','emg','diathermy']){
  await page.selectOption('#exampleChoice',kind);await page.click('#examplePlay');await page.evaluate(()=>{paused=true;tlRun(50);});
  assert.equal(await page.evaluate(()=>story.lesson),kind);if(['delta','beta'].includes(kind))assert.equal(await page.evaluate(()=>eng.stK),kind);
 }
 await page.selectOption('#agentChoice','mix');
 for(const key of ['tiva','propket','propdex','sevon2o']){
  await page.click(`[data-preset="${key}"]`);const count=await page.locator('#mixComparison option').count();assert.ok(count>=3);
  for(let i=0;i<count;i++){await page.selectOption('#mixComparison',String(i));assert.equal(await page.evaluate(()=>selectedMix),key);assert.equal(await page.evaluate(()=>selectedMixVariant),i);assert.ok(await page.locator('#mixDose').textContent());}
 }
 await page.click('[data-preset="propdex"]');await page.selectOption('#mixComparison','0');await page.click('#emergeBtn');await page.click('#induceBtn');assert.equal(await page.evaluate(()=>mix.propofol),3.5);assert.equal(await page.evaluate(()=>mix.dex),0,'induction preserves chosen comparison');
 await page.screenshot({path:'/tmp/eeg-learning-desktop.png',fullPage:false});
 await page.setViewportSize({width:390,height:844});await page.locator('#mixComparison').scrollIntoViewIfNeeded();assert.ok(await page.locator('#mixComparison').isVisible());assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/eeg-learning-phone.png'});
 assert.deepEqual(errors,[]);console.log('EEG lessons and drug comparisons: ok');
}finally{await browser.close();}
