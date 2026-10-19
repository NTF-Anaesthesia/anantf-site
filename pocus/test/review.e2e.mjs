import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH||'playwright');
const browser=await chromium.launch({headless:true});
const root=process.env.POCUS_URL||'http://127.0.0.1:8080';
await mkdir('pocus-test-artifacts',{recursive:true});
try {
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'});
  for(const slug of ['basics','cardiac','lung','haemodynamics','shock','efast','dvt','cases']){
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await page.goto(`${root}/pocus/${slug}/`,{waitUntil:'networkidle'});
   const count=await page.locator('.slide').count();
   for(let i=0;i<count;i++){
    await page.evaluate(i=>window.go(i),i);
    await page.waitForFunction(i=>document.querySelectorAll('.slide')[i].classList.contains('active'),i);
    assert.equal(await page.locator('.slide.active').count(),1,`${slug} section ${i+1}`);
    assert.equal(await page.locator('.slide.active').getAttribute('aria-hidden'),'false');
   }
   // One continuous deck: a flat picker (no part groups or part buttons), one contents row per section, in order.
   const nav=await page.evaluate(()=>({groups:document.querySelectorAll('#course-section optgroup').length,values:[...document.querySelectorAll('#course-section option')].map(o=>o.value),rows:document.querySelectorAll('#ovGrid button').length,partUi:document.querySelectorAll('.course-parts,.course-rail,.course-where,.course-ov-index').length,cnt:document.querySelector('#cnt')?.getClientRects().length||0}));
   assert.equal(nav.groups,0,`${slug} picker is flat`);
   assert.equal(nav.partUi,0,`${slug} has no part navigation`);
   assert.ok(nav.cnt>0,`${slug} shows the section counter`);
   assert.deepEqual(nav.values,Array.from({length:count},(_,i)=>String(i)));
   assert.equal(nav.rows,count,`${slug} contents rows`);
   // ? opens the shortcut panel; Escape closes it.
   await page.keyboard.press('?');
   assert.equal(await page.locator('.course-keys').isVisible(),true,`${slug} shortcut panel`);
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('.course-keys').isVisible(),false);
   // The final section continues to the next series lecture (Case studies is last in the series).
   await page.evaluate(i=>window.go(i),count-1);
   const nextText=await page.locator('#nextB').getAttribute('aria-label');
   if(slug==='cases')assert.doesNotMatch(nextText||'',/Next lecture/);else assert.match(nextText||'',/^Next lecture: /,`${slug} next lecture`);
   if(viewport.width<500){
    const layout=await page.evaluate(()=>({doc:document.documentElement.scrollWidth,bar:(()=>{const b=document.querySelector('.course-bar-inner');return b.scrollWidth<=b.clientWidth+1;})(),small:[...document.querySelectorAll('.bar *,.ntf-footer *')].filter(e=>e.getClientRects().length&&e.childElementCount===0&&e.textContent.trim()&&!e.closest('.course-cnt-hidden')&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.trim())}));
    assert.ok(layout.doc<=viewport.width,`${slug} horizontal overflow ${layout.doc}`);
    assert.ok(layout.bar,`${slug} bar overflow`);
    assert.deepEqual(layout.small,[],`${slug} text below 12px`);
   }
   if(slug==='cardiac'){
    // Numeric routes keep their sections after the RV part and the extension part were added.
    const routes=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('.slide[data-route]')].map(s=>[s.dataset.route,s.dataset.title])));
    assert.deepEqual(routes,{1:'Start here',2:'The FoCUS questions',3:'Part I · Acquisition',4:'Probe and knobology',5:'Five windows',6:'Parasternal long axis',7:'Parasternal short axis',8:'Apical four-chamber',9:'Subcostal and IVC',10:'Troubleshooting: fix the view',11:'Part II · The left ventricle',12:'LV systolic function',13:'EF is not cardiac output',14:'RV patterns and pitfalls',15:'Pump patterns in shock',16:'Part IV · Pericardium and shock patterns',17:'Effusion and tamponade',18:'IVC and fluid responsiveness',19:'LVOT VTI and passive leg raise',20:'Fluid tolerance and venous congestion: VExUS',21:'VExUS: acquisition, pitfalls and evidence',22:'Red flags and limits',23:'Part VI · Five patients',24:'Case 1 · Collapse on the ward',25:'Case 2 · Breathless with cancer',26:'Case 3 · Post-op tachycardia',27:'Case 4 · Cold and wet',28:'Case 5 · Intraoperative hypotension',29:'Quick check',30:'Thank you',31:'References'});
    // RV is its own part, in deck order.
    const rv=await page.evaluate(()=>{const p=window.POCUS_PARTS.find(p=>p.key==='part-rv');return [...document.querySelectorAll('.slide')].slice(p.start,p.end).map(s=>s.id);});
    assert.deepEqual(rv,['part-rv','rv-anatomy','rv-windows','rv-morphology','rv-measurements','rv-septum','rv-cases','rv-patterns']);
    // LV is its own part, built from the LV deck, keeping routes 11-13.
    const lv=await page.evaluate(()=>{const p=window.POCUS_PARTS.find(p=>p.key==='part-lv');return [...document.querySelectorAll('.slide')].slice(p.start,p.end).map(s=>s.id);});
    assert.deepEqual(lv,['part-lv','lv-function','lv-linear','lv-area-volume','lv-cases','ef-forward-flow']);
    await page.goto(`${root}/pocus/cardiac/#12`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.slide.active').getAttribute('id'),'lv-function');
    assert.equal(await page.locator('.slide.active .lv-grid-4 video').count(),4);
    await page.goto(`${root}/pocus/cardiac/#lv-cases`,{waitUntil:'networkidle'});
    const lq=page.locator('.slide.active .rvq').nth(2);
    assert.equal(await lq.locator('.rvq-why').isVisible(),false);
    await lq.locator('.rvq-opts button[data-k="3"]').click();
    assert.match(await lq.locator('.rvq-why').innerText(),/Correct[\s\S]*severely reduced/);
    await page.screenshot({path:`pocus-test-artifacts/lv-cases-${viewport.width}.png`});
    // Real clips: posters present, never autoplay; comparison tabs switch pairs; questions commit then reveal.
    await page.goto(`${root}/pocus/cardiac/#rv-morphology`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.slide.active .rv-pair[data-view]:visible').count(),1);
    await page.locator('.slide.active .rv-compare button[data-view="psax"]').click();
    assert.equal(await page.locator('.slide.active .rv-pair[data-view="psax"]').isVisible(),true);
    assert.equal(await page.locator('.slide.active .rv-pair[data-view="a4c"]').isVisible(),false);
    const posters=await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>!v.poster||v.autoplay).length);
    assert.equal(posters,0,'every video has a poster and no autoplay');
    await page.goto(`${root}/pocus/cardiac/#rv-cases`,{waitUntil:'networkidle'});
    const q1=page.locator('.slide.active .rvq').first();
    assert.equal(await q1.locator('.rvq-why').isVisible(),false);
    await q1.locator('.rvq-opts button[data-k="0"]').click();
    assert.equal(await q1.locator('.rvq-why').isVisible(),true);
    assert.match(await q1.locator('.rvq-why').innerText(),/Not quite[\s\S]*RV infarction/);
    assert.equal(await q1.locator('.rvq-opts button.right').getAttribute('data-k'),'2');
    await q1.getByRole('button',{name:'Try again'}).click();
    assert.equal(await q1.locator('.rvq-why').isVisible(),false);
    await page.screenshot({path:`pocus-test-artifacts/rv-cases-${viewport.width}.png`});
    // Contents opens at the current section and focuses its row.
    await page.goto(`${root}/pocus/cardiac/#rv-measurements`,{waitUntil:'networkidle'});
    await page.locator('#ovB').click();
    const focus=await page.evaluate(()=>{const b=document.querySelector('#ovGrid button.cur'),o=document.querySelector('#overview').getBoundingClientRect(),r=b.getBoundingClientRect();return {focused:document.activeElement===b,inView:r.top>=o.top&&r.bottom<=o.bottom,text:b.textContent};});
    assert.ok(focus.focused&&focus.inView,`current contents row ${JSON.stringify(focus)}`);
    // Search keeps focus and every keystroke while the grid swaps for results.
    await page.locator('#series-search').click();
    await page.keyboard.type('tapse');
    assert.equal(await page.locator('#series-search').inputValue(),'tapse');
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'series-search');
    assert.ok(await page.locator('.series-result').count()>0,'search finds TAPSE');
    // Hidden commit-then-reveal answers are not searchable.
    await page.locator('#series-search').fill('');
    await page.keyboard.type('negative for PE');
    assert.doesNotMatch((await page.locator('.series-results').innerText().catch(()=>'')),/negative for PE/i,'hidden answers stay out of search snippets');
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'series-search');
    await page.locator('#series-search').fill('');
    await page.keyboard.press('Escape');
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
   if(slug==='haemodynamics'){
    // The 18 original sections keep numeric routes after the volume-responsiveness sections were inserted.
    const routes=await page.evaluate(()=>[...document.querySelectorAll('.slide[data-route]')].map(s=>s.dataset.route+':'+s.id));
    assert.deepEqual(routes,['1:start','2:three-questions','3:ef-flow','4:acquire-flow','5:flow-lab','6:measurement-error','7:plr-technique','8:plr-lab','9:thresholds','10:ivc-lab','11:ventilation','12:fluid-tolerance','13:vexus','14:cases-responsive','15:case-noise','16:case-ivc','17:quiz','18:references']);
    await page.goto(`${root}/pocus/haemodynamics/#10`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.slide.active').getAttribute('id'),'ivc-lab');
    await page.goto(`${root}/pocus/haemodynamics/#ref-vignon`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('.slide.active').getAttribute('id'),'references');
    const vids=await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>!v.poster||v.autoplay||v.preload!=='none').length);
    assert.equal(vids,0,'haemodynamics videos: poster, no autoplay, preload none');
    // Delta Vpeak calculator uses the mean denominator.
    await page.goto(`${root}/pocus/haemodynamics/#aortic-velocity`,{waitUntil:'networkidle'});
    assert.match(await page.locator('#vpResult').innerText(),/24\.0%/);
    await page.locator('#vpMax').fill('0.63');await page.locator('#vpMin').fill('0.46');
    assert.match(await page.locator('#vpResult').innerText(),/31\.2%/);
    // Course clip questions commit, reveal, then reset.
    await page.goto(`${root}/pocus/haemodynamics/#course-questions`,{waitUntil:'networkidle'});
    const q=page.locator('.slide.active .hdq').first();
    assert.equal(await q.locator('.hdq-why').isVisible(),false);
    await q.locator('button[data-choice="c"]').click();
    assert.equal(await q.locator('.hdq-why').isVisible(),true);
    assert.match(await q.locator('.feedback').innerText(),/Reconsider[\s\S]*yes/);
    assert.equal(await q.locator('button.correct').getAttribute('data-choice'),'a');
    await q.getByRole('button',{name:'Try again'}).click();
    assert.equal(await q.locator('.hdq-why').isVisible(),false);
    // Leaving a section pauses its clips.
    await page.goto(`${root}/pocus/haemodynamics/#static-measures`,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.querySelectorAll('#static-measures video').forEach(v=>{const pause=v.pause.bind(v);v.dataset.pausedByNav='0';v.pause=()=>{v.dataset.pausedByNav='1';pause();};}));
    await page.locator('#nextB').click();
    assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#static-measures video')].every(v=>v.dataset.pausedByNav==='1')),true,'leaving a section pauses its clips');
    await page.screenshot({path:`pocus-test-artifacts/haemodynamics-questions-${viewport.width}.png`});
   }
   if(slug==='cases'){
    // Seven cases in two parts; every clip has a poster, preload none and no autoplay.
    const ids=await page.evaluate(()=>[...document.querySelectorAll('.slide')].map(s=>s.id));
    assert.deepEqual(ids,['start','case-1','case-2','case-3','case-4','case-5','case-6','case-7','take-home','references']);
    const vids=await page.evaluate(()=>[...document.querySelectorAll('video')].filter(v=>!v.poster||v.autoplay||v.preload!=='none'||!v.controls).length);
    assert.equal(vids,0,'cases videos: poster, controls, preload none, no autoplay');
    // Commit, reveal, try again.
    await page.goto(`${root}/pocus/cases/#case-4`,{waitUntil:'networkidle'});
    const q=page.locator('#c4q1');
    assert.equal(await q.locator('.cs-reveal').isVisible(),false);
    await q.locator('button[data-choice="b"]').click();
    assert.equal(await q.locator('.cs-reveal').isVisible(),true);
    assert.match(await q.locator('.feedback').innerText(),/Not this time[\s\S]*hypokinetic LV/);
    assert.equal(await q.locator('button.correct').getAttribute('data-choice'),'c');
    await q.getByRole('button',{name:'Try again'}).click();
    assert.equal(await q.locator('.cs-reveal').isVisible(),false);
    // Staged case: the echo clips and question 2 stay hidden until question 1 is committed.
    await page.goto(`${root}/pocus/cases/#case-2`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('#c2q2').isVisible(),false);
    await page.locator('#c2q1 button[data-choice="c"]').click();
    assert.equal(await page.locator('#c2q2').isVisible(),true);
    assert.equal(await page.locator('#case-2 .cs-grid-3 video').count(),3);
    await page.locator('#c2q2 button[data-choice="c"]').click();
    assert.match(await page.locator('#c2q2 .feedback').innerText(),/^Correct/);
    await page.screenshot({path:`pocus-test-artifacts/cases-case2-${viewport.width}.png`});
    // Leaving a case pauses its clips.
    await page.evaluate(()=>document.querySelectorAll('#case-2 video').forEach(v=>{const pause=v.pause.bind(v);v.dataset.pausedByNav='0';v.pause=()=>{v.dataset.pausedByNav='1';pause();};}));
    await page.locator('#nextB').click();
    assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#case-2 video')].every(v=>v.dataset.pausedByNav==='1')),true,'leaving a case pauses its clips');
    if(viewport.width<500)assert.ok(await page.evaluate(()=>[...document.querySelectorAll('.slide')].every(s=>s.scrollWidth<=s.clientWidth+1)),'cases slide overflow');
   }
   if(slug==='lung'){
    await page.evaluate(i=>window.go(Number(i)),'1');
    assert.match(await page.locator('.slide.active h2').innerText(),/survey/);
    assert.doesNotMatch(await page.locator('.slide.active').innerText(),/gastric|Perlas|I-AIM/);
    await page.screenshot({path:`pocus-test-artifacts/lung-survey-${viewport.width}.png`});
    await page.evaluate(i=>window.go(Number(i)),'4');
    assert.equal(await page.locator('#s2Mode button[data-v="8"]').getAttribute('aria-pressed'),'true');
    await page.locator('#s2Mode button[data-v="blue"]').click();
    await page.waitForFunction(()=>document.querySelector('#s2Stat').textContent.includes('point'));
    await page.evaluate(i=>window.go(Number(i)),'12');
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
