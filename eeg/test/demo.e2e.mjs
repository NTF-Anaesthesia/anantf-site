import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
const browser=await chromium.launch(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{});
const phone=process.env.BIS_VIEW==='phone';
const page=await browser.newPage({viewport:phone?{width:390,height:844}:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=`http://localhost:${process.env.PORT||8080}`;
async function seek(offset){await page.locator('#timeScrub').evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},offset);await page.waitForFunction(()=>!TL.busy,null,{timeout:60000});}
try{
 await page.goto(base+'/eeg/');await page.waitForFunction(()=>TL.t0!==null);
 await page.locator('#pause').click();
 assert.equal(await page.title(),'Processed EEG simulator');
 assert.equal(await page.locator('#tBtns,#caseSeg,#nmBolus,[data-sim="disc"],[data-sim="batt"]').count(),0);
 assert.equal(await page.locator('#monitorChoice option[value="vista"]').textContent(),'BIS Vista');
 await page.locator('#induceBtn').click();await page.locator('#pause').click();await seek(240);
 assert.ok(await page.evaluate(()=>HIST.at(-1).bis<65),'induction lowers processed index');
 const anaesthetised=await page.evaluate(()=>HIST.at(-1).bis);
 await page.locator('#wakeBtn').click();await page.locator('#pause').click();await seek(600);
 assert.ok(await page.evaluate(()=>HIST.at(-1).bis)>anaesthetised+15,'emergence raises index');
 await seek(180);assert.equal(await page.locator('#depth').inputValue(),'57','rewind restores depth');
 // Keyboard timeline control commits a seek.
 await page.locator('#timeScrub').focus();await page.keyboard.press('ArrowRight');await page.waitForFunction(()=>!TL.busy);
 for(const skin of ['vista','advance','sedline','philips','classic']){
  await page.selectOption('#monitorChoice',skin);await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>mon.skin),skin);
  if(skin==='advance'){
   await page.click('#settingsButton');
   for(const ch of ['2','4']){await page.selectOption('#channelChoice',ch);await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>ADV.ch),+ch);assert.ok(await page.locator('#advCv').isVisible());}
   await page.click('#closeSettings');
  }
 }
 await page.selectOption('#agentChoice','mix');assert.ok(await page.locator('#mixRows').isVisible());
 await page.selectOption('#agentChoice','sevo');assert.ok(await page.locator('#depth').isVisible());
 await page.locator('#fullScreen').click();assert.equal(await page.locator('#fullScreen').getAttribute('aria-pressed'),'true');
 assert.ok(await page.locator('#depth').isVisible());assert.ok(await page.locator('#timeScrub').isVisible());
 await page.screenshot({path:`/tmp/eeg-${phone?'phone':'desktop'}-fullscreen.png`});
 await page.locator('#fullScreen').click();assert.equal(await page.locator('#fullScreen').getAttribute('aria-pressed'),'false');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
 await page.locator('#storyBtn').click();await page.locator('#pause').click();const t=await page.evaluate(()=>story.t0-TL.t0);await seek(t+660);
 assert.equal(await page.evaluate(()=>story),null,'complete induction/emergence demo finishes');
 assert.equal(await page.locator('#depth').inputValue(),'0');
 assert.deepEqual(errors,[]);
 await page.goto(base+'/bis/');await page.waitForURL('**/eeg/');
 console.log(`PASS ${phone?'phone':'desktop'}: induction, emergence, rewind, keyboard seeking, five monitors, channels, mix, fullscreen, redirect; no page errors`);
}finally{await browser.close();}
