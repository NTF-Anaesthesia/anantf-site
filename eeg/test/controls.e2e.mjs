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
  assert.equal(await page.evaluate(()=>ADV.ch),2,'unilateral by default');
  await page.click('#channelChoice [data-ch="4"]');assert.equal(await page.evaluate(()=>ADV.ch),4);
  await page.click('#channelChoice [data-ch="2"]');assert.equal(await page.evaluate(()=>ADV.ch),2);
  const positions=await page.evaluate(()=>{const r=id=>{const b=document.querySelector(id).getBoundingClientRect();return {x:b.x,y:b.y,right:b.right,bottom:b.bottom}};return {notes:r('#observationNotes'),stage:r('.screens'),dock:r('.panel'),patient:r('#examplePicker')}});
  if(width>1100)assert.ok(positions.notes.x>=positions.stage.right,'desktop observations on the right');
  else {assert.ok(await page.locator('#learningButton').isVisible(),'mobile teaching entry is in the dock');assert.ok(await page.locator('#learningSheet').isHidden());await page.click('#learningButton');assert.ok(await page.locator('#learningSheet').isVisible());}
  assert.ok(await page.locator('#examplePicker').evaluate(el=>!el.open&&!!el.closest('#eegExamples')),'live adjustments folded within EEG examples');
  await page.click('#examplePicker summary');await page.check('#mElder');assert.equal(await page.evaluate(()=>mods.elderly),true);await page.click('#examplePicker summary');
  if(width<=1100){await page.click('#closeLearning');assert.equal(await page.locator('#learningButton').evaluate(e=>e===document.activeElement),true);}
  assert.equal(await page.locator('#muscleBlock,#mBlink').count(),0,'redundant controls removed');
  await page.click('#settingsButton');assert.ok(await page.locator('#simSettings').isVisible());
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
  await page.selectOption('#agentChoice','mix');assert.ok(await page.locator('#agentChoice').isVisible(),'agent picker stays available in mix mode');
  for(const id of ['induceBtn','wakeBtn','storyBtn'])assert.ok(await page.locator('#'+id).evaluate(el=>{const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return r.bottom<=innerHeight&&r.y>=0&&el.contains(hit);}),`${id} remains visible in combination mode`);
  await page.click('[data-preset="propket"]');assert.equal(await page.evaluate(()=>mix.ketamine),.4);
  await page.click('#wakeBtn');assert.equal(await page.evaluate(()=>mix.ketamine),0);
  await page.click('#induceBtn');assert.equal(await page.evaluate(()=>mix.ketamine),.4,'induce recalls the chosen combination');
  await page.selectOption('#agentChoice','propofol');
  assert.ok(await page.locator('#err').isHidden());
  if(process.env.EEG_SCREENSHOTS)await page.screenshot({path:`/tmp/eeg-refined-${width}.png`});
  if(await page.locator('#fullScreen').getAttribute('aria-pressed')==='true')await page.click('#fullScreen');
  console.log(`PASS controls ${width}×${height}: icon targets, settings, channels, focus, Escape, speed, timeline and mix`);
 }
 // Narrow presentation keeps the original monitor; learning controls share one sheet.
 for(const [width,height] of [[320,640],[390,844]]){
  await page.setViewportSize({width,height});await page.goto(`http://localhost:${process.env.PORT||8080}/eeg/`);await page.waitForFunction(()=>TL.t0!==null);
  await page.click('#fullScreen');await page.waitForTimeout(250);
  assert.ok(await page.locator('#advWrap').isVisible());
  assert.equal(await page.locator('#mobileScreen').count(),0,'no alternate clinical display');
  const stage=await page.locator('.screens').boundingBox(),screen=await page.locator('#advS').boundingBox();
  assert.ok(screen.width>stage.width*.85,'original monitor uses the available width');
  assert.ok(Math.abs(screen.width/screen.height-1.6)<.005,'original LCD proportions preserved');
  await page.click('#channelChoice [data-ch="4"]');await page.waitForTimeout(150);assert.ok(await page.locator('#aBisR').isVisible());
  await page.click('#learningButton');assert.ok(await page.locator('#learningSheet').isVisible());
  const sheet=await page.locator('#learningSheet').boundingBox();assert.ok(sheet.width>=width-1&&sheet.y>=0&&sheet.y+sheet.height<=height+1,'sheet fits the phone');
  for(let n=0;n<16;n++){await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.getElementById('learningSheet').contains(document.activeElement)));}
  await page.keyboard.press('Escape');assert.ok(await page.locator('#learningSheet').isHidden());assert.equal(await page.locator('#fullScreen').getAttribute('aria-pressed'),'true','dismissing notes keeps app presentation');
  await page.click('#learningButton');await page.click('#examplePicker summary');await page.check('[name=eegPattern][value="delta"]');await page.check('#mEmg');await page.click('#examplePlay');
  assert.ok(await page.locator('#learningSheet').isHidden(),'running a pattern returns to the live display');assert.equal(await page.evaluate(()=>story.lesson),'delta');assert.equal(await page.evaluate(()=>mods.emg),true);
  await page.click('#fullScreen');assert.ok(await page.locator('#observationNotes').isVisible(),'notes return below the monitor on the website');
  console.log(`PASS app presentation ${width}×${height}: original bilateral monitor, sheet, focus, Escape and Run`);
 }
 assert.deepEqual(errors,[]);
}finally{await browser.close();}
