// Browser test of the Baby MO portal in local (demo) mode, at phone size, with an axe accessibility check.
// Run from the repo root (files are served from this checkout by route; no server):
//   node babymo/test/e2e.mjs            SHOTS=<dir> also saves phone screenshots
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const AXE = process.env.AXE_PATH || new URL('./vendor/axe.min.js', import.meta.url).pathname;
const root = new URL('../../', import.meta.url).pathname;
const BASE = 'https://anantf.com/babymo/';
const SHOTS = process.env.SHOTS;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png' };

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', acceptDownloads: true });
await ctx.route(/^https:\/\/(www\.)?anantf\.com\//, async route => {
  const u = new URL(route.request().url());
  let rel = decodeURIComponent(u.pathname).replace(/^\//, '');
  if (rel.endsWith('/')) rel += 'index.html';
  const f = path.join(root, rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: 'not found' });
  await route.fulfill({ status: 200, contentType: MIME[f.split('.').pop()] || 'application/octet-stream', body: fs.readFileSync(f) });
});
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const shot = async name => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `babymo-${name}.png`), fullPage: true }); } };
const axe = async label => {
  if (!fs.existsSync(AXE)) return;
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
  const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  assert.equal(bad.length, 0, `axe (${label}): ` + bad.map(v => v.id + ' ' + v.nodes[0]?.target + ' ' + v.nodes[0]?.failureSummary?.slice(0, 120)).join('; '));
};
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); await shot('fail-' + name.replace(/\W+/g, '-')); process.exitCode = 1; throw e; } };
// every direct child of the matching element sits on one line (same vertical centre, give or take a few pixels): rows of buttons must not wrap on a phone
const oneRow = async sel => {
  const bad = await page.evaluate(s => [...document.querySelectorAll(s)].filter(el => { const k = [...el.children].filter(c => c.offsetParent); return k.length > 1 && (() => { const m = k.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.max(...m) - Math.min(...m) > 12; })(); }).map(el => el.className || el.id), sel);
  assert.deepEqual(bad, [], `wraps onto a second line at phone width: ${sel}`);
};
const text = sel => page.locator(sel).innerText();

try {
  // ---- an MO sits the test ----
  await step('home, wrong passphrase refused', async () => {
    await page.goto(BASE + '?demo'); await page.locator('#f-name').waitFor();
    await shot('home'); await axe('home');
    await page.fill('#f-name', 'Dr Test Person'); await page.fill('#f-pass', 'nope'); await page.click('#start button[type=submit]');
    await page.locator('#start-err:not([hidden])').waitFor(); assert.match(await text('#start-err'), /passphrase is not right/);
  });
  await step('ready screen', async () => {
    await page.fill('#f-pass', 'demo'); await page.click('#start button[type=submit]');
    await page.locator('#go').waitFor(); assert.match(await text('#app'), /5 questions/); assert.match(await text('#app'), /Pass mark 80%/);
    await shot('ready'); await axe('ready');
  });
  await step('answering, flagging, resume after reload', async () => {
    await page.click('#go'); await page.locator('#qform').waitFor();
    assert.match(await text('.topbar'), /Question 1 of 5/);
    assert.equal(await page.locator('#prev').isDisabled(), true);
    await page.locator('.opt').nth(0).click();               // answer A on Q1
    await page.click('#flag'); assert.match(await text('#flag'), /Flagged/);
    await shot('question'); await axe('question');
    await page.reload(); await page.locator('#qform').waitFor();   // reload mid-test: same place, answer kept, clock still running
    assert.match(await text('.topbar'), /Question 1 of 5/);
    assert.equal(await page.locator('.opt.on').count(), 1);
    assert.match(await text('#timer'), /^[0-4]:\d\d$|^5:00$/);
    await page.click('#next'); assert.match(await text('.topbar'), /Question 2 of 5/);
    await page.click('#prev'); await page.click('#clear'); assert.equal(await page.locator('.opt.on').count(), 0);
  });
  await step('review lists blanks and flags, submit asks first', async () => {
    await page.locator('.opt').nth(1).click();
    for (let i = 0; i < 4; i++) await page.click('#next');
    await page.click('#review'); await page.locator('.grid').waitFor();
    assert.match(await text('#app'), /4 unanswered/); await shot('review'); await axe('review');
    await page.click('#submit'); await page.locator('dialog[open]').waitFor(); await shot('confirm');
    await page.click('dialog button[value=no]'); await page.locator('dialog').waitFor({ state: 'detached' });
  });
  await step('answer everything correctly from the bank and submit', async () => {
    // read the correct answers from the demo bank in storage, answer by matching text
    const key = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('mo-local-v1')); return d.questions.map(q => ({ stem: q.stem, ans: q.options[q.answer] })); });
    await page.click('.cell >> nth=0');
    for (let i = 0; i < 5; i++) {
      const stem = (await text('.stem')).trim();
      const want = key.find(k => k.stem === stem).ans;
      await page.locator('.opt', { hasText: want }).first().click();
      if (i < 4) await page.click('#next'); else await page.click('#review');
    }
    await page.click('#submit'); await page.click('dialog button[value=yes]');
    await page.locator('.score').waitFor();
    assert.match(await text('.score'), /5\s*\/ 5/); assert.match(await text('.score'), /Pass/);
    await page.locator('#saved.ok').waitFor(); assert.match(await text('#saved'), /Saved/);
    await shot('result'); await axe('result');
    const { n } = await page.evaluate(() => ({ n: JSON.parse(localStorage.getItem('mo-outbox') || '[]').length })); assert.equal(n, 0);
  });
  await step('timer running out submits by itself', async () => {
    await page.click('#done'); await page.fill('#f-name', 'Slow Person'); await page.fill('#f-pass', 'demo'); await page.click('#start button[type=submit]');
    await page.click('#go'); await page.locator('#qform').waitFor();
    await page.evaluate(() => { const a = JSON.parse(localStorage.getItem('mo-attempt')); a.startedAt -= 6 * 60 * 1000; localStorage.setItem('mo-attempt', JSON.stringify(a)); });
    await page.reload(); await page.locator('.score').waitFor();
    assert.match(await text('#app'), /Time ran out/); assert.match(await text('.score'), /0\s*\/ 5/);
    await page.click('#done');
  });

  // ---- faculty ----
  await step('faculty sign in and question list', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.locator('#in').waitFor(); await page.click('#in');
    await page.locator('.qlist').waitFor(); assert.equal(await page.locator('.qlist li').count(), 6);
    assert.match(await text('.summary'), /6.*ready for the test/); await shot('questions'); await axe('questions');
  });
  await step('new question: validation, then save as active', async () => {
    await page.click('a[href="#/faculty/q/new"]'); await page.locator('#qf').waitFor();
    await page.fill('#stem', 'What is the antidote to heparin?'); await page.check('input[name=status][value=active]', { force: true });
    await page.click('#qf button[type=submit]');
    assert.match(await text('#app'), /Fill in choice A/); assert.match(await text('#app'), /Pick the correct answer/);
    await shot('editor-errors'); await axe('editor-errors'); await oneRow('.segrow');
    await page.fill('#opt0', 'Protamine'); await page.fill('#opt1', 'Vitamin K'); await page.fill('#opt2', 'Tranexamic acid'); await page.fill('#opt3', 'Naloxone');
    await page.check('#ans0');
    assert.match(await text('.preview'), /Correct answer/);
    await page.click('#qf button[type=submit]'); await page.locator('.qlist').waitFor();
    assert.equal(await page.locator('.qlist li').count(), 7); assert.match(await text('.summary'), /7.*ready/);
  });
  await step('edit keeps history; unsaved text is offered back after leaving', async () => {
    await page.click('.qlist li >> nth=0'); await page.locator('#qf').waitFor();
    await page.fill('#stem', 'What reverses heparin?'); await page.click('a:has-text("All questions")');
    await page.locator('.qlist').waitFor(); await page.click('.qlist li >> nth=0');
    await page.locator('#restore').waitFor(); await page.click('#restore');
    assert.equal(await page.inputValue('#stem'), 'What reverses heparin?');
    await page.click('#qf button[type=submit]'); await page.locator('.qlist').waitFor();
    await page.click('.qlist li >> nth=0'); await page.click('#hist summary'); await page.locator('.hist li').first().waitFor();
    assert.equal(await page.locator('.hist li').count(), 2); await page.click('a:has-text("All questions")');
  });
  await step('a draft can be unfinished and is not given to MOs', async () => {
    await page.click('a[href="#/faculty/q/new"]'); await page.fill('#stem', 'Half-written question'); await page.click('#qf button[type=submit]');
    await page.locator('.qlist').waitFor(); assert.match(await text('.summary'), /7.*ready/); assert.match(await text('.summary'), /1 draft/);
  });
  await step('paste many', async () => {
    await page.click('a[href="#/faculty/paste"]'); await page.fill('#paste', 'Q1 Normal adult heart rate?\n(A) 20-30\n(B) 60-100\n(C) 120-160\n(D) 200\nAnswer: B\n\nQ2 No answer here?\nA) a\nB) b\nC) c\nD) d\n');
    await page.click('#read'); await page.locator('#addall').waitFor(); assert.match(await text('#out'), /2 questions found/); assert.match(await text('#out'), /no answer/);
    await shot('paste'); await axe('paste'); await oneRow('.segrow');
    await page.check('input[name=as][value=active]', { force: true }); await page.click('#addall'); await page.locator('.qlist').waitFor();
    assert.match(await text('.summary'), /8.*ready/); assert.match(await text('.summary'), /2 drafts/);
  });
  await step('spreadsheet round trip and backup', async () => {
    await page.click('a[href="#/faculty/data"]');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#csvdown')]);
    const csv = fs.readFileSync(await dl.path(), 'utf8'); assert.match(csv, /question,A,B,C,D,answer/); assert.match(csv, /What reverses heparin/);
    const edited = csv.replace('What reverses heparin?', 'What reverses heparin effect?') + 'new1,draft,Airway,"Brand new, with comma?",a,b,c,d,C,\r\n';
    const tmp = path.join(process.env.TMPDIR || '/tmp', 'mo-e2e.csv'); fs.writeFileSync(tmp, edited);
    await page.setInputFiles('#csvup', tmp); await page.locator('#doimp').waitFor(); assert.match(await text('#out'), /1 new question/); assert.match(await text('#out'), /10 existing/);
    await page.click('#doimp'); await page.locator('.qlist').waitFor();
    assert.match(await text('#app'), /What reverses heparin effect/); assert.match(await text('#app'), /Brand new, with comma/);
    await page.click('a[href="#/faculty/data"]'); const [dj] = await Promise.all([page.waitForEvent('download'), page.click('#jsondown')]);
    assert.equal(JSON.parse(fs.readFileSync(await dj.path(), 'utf8')).kind, 'baby-mo-bank');
    await page.setInputFiles('#jsonup', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"x":1}') }); await page.locator('#out .status').waitFor();
    await page.click('a:has-text("All questions")');
  });
  await step('results by person and by question', async () => {
    await page.click('#nav >> text=Results'); await page.locator('table').waitFor();
    assert.equal(await page.locator('tbody tr').count(), 2); assert.match(await text('tbody'), /Dr Test Person/); assert.match(await text('tbody'), /Slow Person/);
    await shot('results'); await axe('results');
    await page.click('a:has-text("By question")'); await page.locator('th:has-text("Question")').waitFor(); assert.match(await text('tbody'), /100%|0%/);
    await page.click('a:has-text("By topic")'); await page.locator('th:has-text("Topic")').waitFor(); assert.match(await text('tbody'), /%/);
    await page.click('a:has-text("By person")'); await page.click('a:has-text("Dr Test Person")'); await page.locator('.review').waitFor(); assert.match(await text('.summary'), /5\/5/);
  });
  await step('settings: save, numbers checked, passphrase', async () => {
    await page.click('#nav >> text=Settings'); await page.locator('#sf').waitFor();
    await page.fill('#s-count', '0'); await page.click('#sf button[type=submit]'); await page.locator('#serr:not([hidden])').waitFor();
    await page.fill('#s-count', '3'); await page.fill('#s-cohort', 'Oct 2026'); await page.check('input[name=review][value=full]', { force: true }); await page.click('#sf button[type=submit]');
    await page.locator('#sf').waitFor(); assert.equal(await page.inputValue('#s-count'), '3');
    await page.fill('#p-pass', 'newpass'); await page.click('#pf button[type=submit]');
    await shot('settings'); await axe('settings'); await oneRow('.segrow');
  });
  await step('faculty page: approve and decline requests, add, change role, remove', async () => {
    await page.evaluate(() => {   // two people have asked for access (in the real app they do this from the Faculty page)
      const d = JSON.parse(localStorage.getItem('mo-local-v1'));
      d.requests = [{ email: 'dr.new@example.com', name: 'Dr New', requestedAt: Date.now() }, { email: 'dr.no@example.com', name: 'Dr No', requestedAt: Date.now() - 1000 }];
      localStorage.setItem('mo-local-v1', JSON.stringify(d));
    });
    await page.goto(BASE + '?demo#/faculty/people'); await page.locator('#reqs').waitFor();
    assert.equal(await page.locator('#reqs li').count(), 2); assert.match(await text('#nav'), /Faculty \(2\)/);
    await shot('people'); await axe('people'); await oneRow('.row.one'); await oneRow('#nav');
    await page.click('[data-ap="dr.new@example.com"][data-role=editor]'); await page.click('dialog button[value=yes]');
    await page.locator('#mem li:has-text("dr.new@example.com")').first().waitFor(); assert.equal(await page.locator('#reqs li').count(), 1);
    await page.click('[data-dec="dr.no@example.com"]'); await page.click('dialog button[value=yes]');
    await page.locator('text=Nobody is waiting').waitFor(); assert.doesNotMatch(await text('#nav'), /\(/);
    await page.click('[data-setrole="dr.new@example.com"]'); await page.locator('#mem li:has-text("dr.new@example.com"):has-text("Admin")').waitFor();
    await page.fill('#m-email', 'dr.lee@example.com'); await page.fill('#m-name', 'Dr Lee'); await page.click('#mf button[type=submit]');
    await page.locator('#mem li:has-text("dr.lee@example.com")').first().waitFor();
    await page.click('[data-rm="dr.lee@example.com"]'); await page.click('dialog button[value=yes]');
    await page.locator('#mem li:has-text("dr.lee@example.com")').waitFor({ state: 'detached' });
  });
  await step('select several questions and change them together', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.locator('.qlist').waitFor();
    const before = await text('.summary');
    await page.click('#selmode'); await page.locator('.bulkbar').waitFor(); assert.equal(await page.locator('.qlist input[data-sel]').count() > 3, true);
    await page.click('.chip[data-s=active]'); await page.locator('.qlist input[data-sel]').first().waitFor();
    const n = await page.locator('.qlist input[data-sel]').count();
    await page.click('#selall'); assert.match(await text('#selcount'), new RegExp(n + ' ticked'));
    await shot('bulk'); await axe('bulk'); await oneRow('.row.one'); await oneRow('.chips'); await oneRow('#nav');
    await page.click('[data-bulk=draft]'); await page.click('dialog button[value=yes]');
    await page.locator('#selcount:has-text("0 ticked")').waitFor();
    assert.match(await text('.summary'), /^0 ready/);
    await page.click('.chip[data-s=draft]'); await page.click('#selall'); await page.click('[data-bulk=active]'); await page.click('dialog button[value=yes]');
    await page.locator('.toast, #toast.on').first().waitFor();
    assert.match(await text('#toast'), /put in the test/);
    await page.locator('#selcount').waitFor(); await page.click('#selmode'); await page.locator('.bulkbar').waitFor({ state: 'detached' });
    await page.click('.chip[data-s=all]');
    assert.notEqual(await text('.summary'), '');
  });
  await step('topics: several per question, a topic list, rename, bulk add, delete', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.locator('.qlist').waitFor();
    await page.click('.qlist li:has(.badge.active) >> nth=0'); await page.locator('#qf').waitFor();
    await page.selectOption('#addtopic', '__new'); await page.fill('#addtopic-new', 'Cardiac'); await page.press('#addtopic-new', 'Enter');
    await page.locator('.tchip:has-text("Cardiac")').waitFor();
    const existing = (await page.locator('#addtopic option').allTextContents()).find(o => o && !o.endsWith('…'));
    assert.ok(existing, 'the dropdown lists existing topics');
    await page.selectOption('#addtopic', existing); await page.locator(`.tchip:has-text("${existing}")`).waitFor();
    assert.equal(await page.locator('.tchip').count() >= 2, true); await shot('topics-editor'); await axe('topics-editor');
    await page.click(`.tchip:has-text("${existing}")`); assert.equal(await page.locator(`.tchip:has-text("${existing}")`).count(), 0);
    await page.selectOption('#addtopic', existing);
    await page.click('#qf button[type=submit]'); await page.locator('.qlist').waitFor();
    assert.match(await text('.qlist'), new RegExp(`Cardiac, ${existing}`));
    // the topic filter finds a question by any of its topics
    await page.selectOption('#qt', 'Cardiac'); await page.locator('.qlist li').first().waitFor(); assert.equal(await page.locator('.qlist li').count(), 1);
    await page.selectOption('#qt', '');
    // the topic list page
    await page.click('a[href="#/faculty/topics"]'); await page.locator('#tlist').waitFor();
    await page.fill('#tname', 'Neuro'); await page.click('#tf button[type=submit]'); await page.locator('#tlist li:has-text("Neuro")').waitFor();
    await shot('topics'); await axe('topics'); await oneRow('.row.one');
    await page.click('[data-ren="Cardiac"]'); await page.locator('dialog[open] #rn').waitFor(); await page.fill('dialog #rn', 'Cardiology'); await page.click('dialog button[value=yes]');
    await page.locator('#tlist li:has-text("Cardiology")').waitFor(); assert.equal(await page.locator('#tlist li:has-text("Cardiology") .muted').innerText(), '1 question');
    assert.equal(await page.locator('#tlist li:has-text("Cardiac")').count(), 0);
    // reload: the saved list (Neuro has no questions yet) is still there
    await page.reload(); await page.locator('#tlist').waitFor(); await page.locator('#tlist li:has-text("Neuro")').waitFor();
    // bulk: add Neuro to every ticked question
    await page.goto(BASE + '?demo#/faculty'); await page.locator('.qlist').waitFor(); await page.click('#selmode'); await page.click('.chip[data-s=active]'); await page.click('#selall');
    await page.click('[data-bulk=addtopic]'); await page.locator('dialog #at-sel').waitFor(); await page.selectOption('dialog #at-sel', 'Neuro'); await page.click('dialog #at-ok');
    await page.locator('dialog[open] button[value=yes]').waitFor(); await page.click('dialog[open] button[value=yes]');
    await page.locator('#toast.on:has-text("added to the topic")').waitFor();
    await page.click('#selmode'); await page.selectOption('#qt', 'Neuro'); await page.locator('.qlist li').first().waitFor();
    const nNeuro = await page.locator('.qlist li').count(); assert.equal(nNeuro >= 6, true);
    await page.click('#selmode'); await page.click('.chip[data-s=active]'); await page.click('#selall'); await page.click('[data-bulk=rmtopic]');
    await page.selectOption('dialog #at-sel', 'Neuro'); await page.click('dialog #at-ok');
    await page.locator('dialog[open] button[value=yes]').waitFor(); await page.click('dialog[open] button[value=yes]');
    await page.locator('#toast.on:has-text("taken out")').waitFor();
    await page.selectOption('#qt', ''); await page.click('#selmode');
    // delete a topic: it comes off the questions and the list
    await page.goto(BASE + '?demo#/faculty/topics'); await page.locator('#tlist').waitFor();
    await page.click('[data-del="Cardiology"]'); await page.click('dialog button[value=yes]');
    await page.locator('#tlist li:has-text("Cardiology")').waitFor({ state: 'detached' });
  });
  await step('question flags: must-ask and hard show on the list and filter', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.locator('.qlist').waitFor();
    await page.click('.qlist li:has(.badge.active) >> nth=0'); await page.locator('#qf').waitFor();
    await page.check('#must'); await page.check('input[name=level][value=hard]', { force: true }); await page.click('#qf button[type=submit]'); await page.locator('.qlist').waitFor();
    assert.equal(await page.locator('.badge.must').count(), 1); assert.equal(await page.locator('.badge.hard').count(), 1);
    assert.match(await text('.summary'), /1<\/b> must-ask|1 must-ask/); await shot('flags'); await axe('flags'); await oneRow('.chips');
    await page.click('.chip[data-k=must]'); await page.locator('.qlist li').first().waitFor(); assert.equal(await page.locator('.qlist li').count(), 1);
    await page.click('.chip[data-k=""]'); 
  });
  await step('new settings apply: 3 questions, full review, cohort recorded', async () => {
    await page.click('#nav >> text=Test'); await page.fill('#f-name', 'Dr Third'); await page.fill('#f-pass', 'newpass'); await page.click('#start button[type=submit]');
    await page.locator('#go').waitFor(); assert.match(await text('#app'), /3 questions/); await page.click('#go');
    for (let i = 0; i < 2; i++) { await page.locator('.opt').first().click(); await page.click('#next'); }
    await page.locator('.opt').first().click(); await page.click('#review'); await page.click('#submit'); await page.click('dialog button[value=yes]');
    await page.locator('.score').waitFor(); assert.match(await text('#app'), /Correct answer|Your answer/);
    const mustStem = await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('mo-local-v1')); return d.questions.find(q => q.must).stem; });
    assert.ok((await text('#app')).includes(mustStem.slice(0, 40)), 'the must-ask question is in the sitting'); await shot('result-full'); await axe('result-full');
    const c = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-local-v1')).attempts.at(-1).cohort); assert.equal(c, 'Oct 2026');
  });
  await step('sign out returns to the faculty sign-in', async () => {
    await page.goto(BASE + '?demo#/faculty/results'); await page.locator('#signout').waitFor();
    await page.click('#signout'); await page.locator('#in').waitFor();
    assert.equal(await page.locator('#signout').count(), 0); assert.doesNotMatch(await text('#nav'), /Results/);
    await page.click('#in'); await page.locator('.qlist, .summary').first().waitFor();
  });
  const sit = async name => { await page.goto(BASE + '?demo'); await page.fill('#f-name', name); await page.fill('#f-pass', 'newpass'); await page.click('#start button[type=submit]'); };
  const submitBlank = async () => {
    await page.click('#go'); await page.locator('#qform').waitFor(); await page.click('#rv'); await page.locator('.grid').waitFor();
    await page.click('#submit'); await page.click('dialog button[value=yes]'); await page.locator('.score').waitFor();
  };
  await step('two attempts: fail, try again, last attempt, then blocked', async () => {
    await sit('Retry Person'); await page.locator('#go').waitFor(); assert.match(await text('#app'), /attempt 1 of 2/);
    await submitBlank(); assert.match(await text('#app'), /Attempt 1 of 2/); assert.match(await text('#app'), /1<\/b> attempt left|1 attempt left/);
    await shot('retry'); await axe('retry');
    await page.click('#again'); await page.locator('#go').waitFor(); assert.match(await text('#app'), /attempt 2 of 2/);
    await submitBlank(); assert.match(await text('#app'), /last attempt/); assert.equal(await page.locator('#again').count(), 0);
    await page.click('#done');
    await sit('retry  PERSON'); await page.locator('#start-err:not([hidden])').waitFor(); assert.match(await text('#start-err'), /used all 2 of your attempts/);
  });
  await step('faculty can give another attempt', async () => {
    await page.goto(BASE + '?demo#/faculty/results'); await page.locator('table').waitFor();
    await page.click('tbody a:has-text("Retry Person") >> nth=0'); await page.locator('#grant').waitFor();
    assert.match(await text('.status'), /2 of 2/); await page.click('#grant'); await page.click('dialog button[value=yes]');
    await page.locator('.status:has-text("1 of 2")').waitFor();
    await sit('Retry Person'); await page.locator('#go').waitFor(); assert.match(await text('#app'), /attempt 2 of 2/);
    await page.click('#cancel');
  });
  await step('help page', async () => { await page.goto(BASE + '?demo#/faculty/help'); await page.locator('h1').waitFor(); assert.match(await text('h1'), /How this works/); await axe('help'); });
  assert.deepEqual(errors, [], 'console errors: ' + errors.join(' | '));
  console.log('babymo e2e: all steps ok');
} catch { /* already reported */ } finally { await b.close(); }
