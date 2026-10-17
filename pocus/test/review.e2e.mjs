import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true});
const root=process.env.POCUS_URL||'http://127.0.0.1:8080';
await mkdir('pocus-test-artifacts',{recursive:true});
try {
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  for(const slug of ['basics','cardiac','lung','haemodynamics','shock','efast','dvt']){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto(`${root}/pocus/${slug}/`,{waitUntil:'networkidle'});
   const count=await page.locator('.slide').count();
   for(let i=0;i<count;i++){
    await page.locator('#course-section').selectOption(String(i));
    await page.waitForFunction(i=>document.querySelectorAll('.slide')[i].classList.contains('active'),i);
    assert.equal(await page.locator('.slide.active').count(),1,`${slug} section ${i+1}`);
    assert.equal(await page.locator('.slide.active').getAttribute('aria-hidden'),'false');
   }
   if(slug==='cardiac'){
    // An old numeric link must still open the original RV section after new sections are inserted.
    await page.goto(`${root}/pocus/cardiac/#14`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.slide.active').getAttribute('id'),'rv-patterns');
    await page.goto(`${root}/pocus/cardiac/#rv-measurements`,{waitUntil:'networkidle'});
    await page.getByRole('button',{name:'Preserved TAPSE, low FAC',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#rvMeasureResult').textContent.includes('23.3%'));
    assert.match(await page.locator('#rvMeasureResult').innerText(),/22.0 mm/);
    await page.getByRole('button',{name:'Angle error',exact:true}).click();
    assert.match(await page.locator('#rvMeasureResult').innerText(),/14.1 mm/);
    // ESA is constrained to EDA when the end-diastolic input is reduced.
    await page.locator('#rvEda').evaluate(e=>{e.value='12';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#rvEsa').inputValue(),'12');
    assert.match(await page.locator('#rvMeasureResult').innerText(),/FAC 0.0%/);
    await page.getByRole('button',{name:'Concordant example',exact:true}).click();
    await page.screenshot({path:`pocus-test-artifacts/rv-${viewport.width}.png`});
    assert.ok(await page.locator('#rvMeasureLab').evaluate(e=>e.scrollWidth<=e.clientWidth+2),'RV controls overflow');
   }
   if(slug==='lung'){
    await page.locator('#course-section').selectOption('1');
    assert.match(await page.locator('.slide.active h2').innerText(),/survey/);
    assert.doesNotMatch(await page.locator('.slide.active').innerText(),/gastric|Perlas|I-AIM/);
    await page.screenshot({path:`pocus-test-artifacts/lung-survey-${viewport.width}.png`});
    await page.locator('#course-section').selectOption('4');
    assert.equal(await page.locator('#s2Mode button[data-v="8"]').getAttribute('aria-pressed'),'true');
    await page.locator('#s2Mode button[data-v="blue"]').click();
    await page.waitForFunction(()=>document.querySelector('#s2Stat').textContent.includes('point'));
    await page.locator('#course-section').selectOption('12');
    await page.locator('#s7MeasuredSep').fill('32');
    assert.match(await page.locator('#s7Formula').innerText(),/640 mL/);
    const formula=await page.locator('#s7Formula').innerText();
    await page.locator('#s7C1').evaluate(e=>{e.value='5';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#s7Formula').innerText(),formula,'Coronal calipers must not drive Balik arithmetic');
    await page.locator('#s7MeasuredSep').fill('-1');
    assert.doesNotMatch(await page.locator('#s7Formula').innerText(),/mL/);
    await page.locator('#s7MeasuredSep').fill('30');
    await page.screenshot({path:`pocus-test-artifacts/effusion-${viewport.width}.png`});
   }
   await page.locator('#ovB').click();
   await page.getByRole('button',{name:'Close tutorial contents',exact:true}).click();
   assert.deepEqual(errors,[],`${slug} ${viewport.width}px console errors`);
   console.log(`${slug}: ${count} sections, navigation and console checks pass at ${viewport.width}px`);
   await page.close();
  }
  await context.close();
 }
}finally{await browser.close();}
