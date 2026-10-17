import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'/opt/node22/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 for(const [width,height] of [[1440,900],[390,844],[844,390]]){
  await page.setViewportSize({width,height});await page.goto(`http://localhost:${process.env.PORT||8080}/eeg/`);await page.waitForFunction(()=>TL.t0!==null);
  assert.equal(await page.locator('#timeHelp,.time-label,#workspaceNotes').count(),0,'verbose instructions and settings columns removed');
  for(const id of ['fullScreen','settingsButton','pause']){
   const el=page.locator('#'+id),r=await el.boundingBox();assert.ok(r.width>=44&&r.height>=44,`${id} touch target`);assert.ok(await el.getAttribute('aria-label'));assert.equal(await el.locator('svg').count(),1);
  }
  await page.selectOption('#monitorChoice','advance');await page.click('#fullScreen');await page.waitForTimeout(250);
  await page.click('#settingsButton');assert.ok(await page.locator('#simSettings').isVisible());
  await page.selectOption('#channelChoice','2');assert.equal(await page.evaluate(()=>ADV.ch),2);
  await page.selectOption('#channelChoice','4');assert.equal(await page.evaluate(()=>ADV.ch),4);
  await page.click('#teachingOptions summary');await page.check('#mElder');assert.equal(await page.evaluate(()=>mods.elderly),true);
  // Native dialog confines focus and returns it to the gear on dismissal.
  for(let n=0;n<20;n++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.getElementById('simSettings').contains(document.activeElement)));}
  await page.keyboard.press('Escape');assert.ok(await page.locator('#simSettings').isHidden());assert.equal(await page.locator('#settingsButton').evaluate(e=>e===document.activeElement),true);
  await page.click('#settingsButton');await page.click('#closeSettings');
  await page.click('#speedControl summary');assert.equal(await page.locator('#speedControl').getAttribute('open'),'');
  await page.locator('#playSpeed').focus();await page.keyboard.press('ArrowRight');assert.equal(await page.evaluate(()=>speed),2);
  const sr=await page.locator('#playSpeed').boundingBox();assert.ok(sr.x>=0&&sr.y>=0&&sr.x+sr.width<=width&&sr.y+sr.height<=height,'speed slider fits');
  assert.ok(await page.locator('#playSpeed').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;}),'speed slider is not clipped or covered');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#speedControl').getAttribute('open'),null);
  await page.click('#pause');assert.equal(await page.locator('#pause').getAttribute('aria-label'),'Resume simulation');await page.click('#pause');
  const before=await page.locator('#timeScrub').inputValue();await page.locator('#timeScrub').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>!TL.busy);assert.ok(+await page.locator('#timeScrub').inputValue()>=+before);
  await page.selectOption('#agentChoice','mix');assert.ok(await page.locator('#agentChoice').isVisible(),'agent picker stays available in mix mode');await page.selectOption('#agentChoice','propofol');
  assert.ok(await page.locator('#err').isHidden());
  if(process.env.EEG_SCREENSHOTS)await page.screenshot({path:`/tmp/eeg-refined-${width}.png`});
  if(await page.locator('#fullScreen').getAttribute('aria-pressed')==='true')await page.click('#fullScreen');
  console.log(`PASS controls ${width}×${height}: icon targets, settings, channels, focus, Escape, speed, timeline and mix`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
