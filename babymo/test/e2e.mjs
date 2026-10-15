// Browser test of the Baby MO test in local (demo) mode with the REAL question bank (../qbank/), at phone size, with an
// axe accessibility check on every screen (and a desktop pass at the end).
// Run from the repo root (files are served from this checkout by route; no server):
//   node babymo/test/e2e.mjs            SHOTS=<dir> also saves phone screenshots of every main screen
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { resolvePaper } from '../../qbank/js/bank.js';

const AXE = process.env.AXE_PATH || new URL('./vendor/axe.min.js', import.meta.url).pathname;
const root = new URL('../../', import.meta.url).pathname;
const BASE = 'https://anantf.com/babymo/';
const SHOTS = process.env.SHOTS;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };

// the real bank and paper, to know the right answers and check the snapshots
const BANK = JSON.parse(fs.readFileSync(path.join(root, 'qbank/bank/questions.json'), 'utf8'));
const PAPER = JSON.parse(fs.readFileSync(path.join(root, 'qbank/papers/babymo.json'), 'utf8'));
const { pool: POOL, all: ALL } = resolvePaper(PAPER, BANK.questions);
const N = Math.min(PAPER.count, POOL.length);
const answerFor = stem => { const q = POOL.find(x => x.stem.replace(/\s+/g, ' ').trim() === stem.replace(/\s+/g, ' ').trim()); assert.ok(q, 'stem not in the paper: ' + stem.slice(0, 60)); return q; };

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
let page = await ctx.newPage();
const errors = [];
const watch = p => { p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); }); };
watch(page);

const shot = async name => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.evaluate(() => document.querySelector('#toast')?.classList.remove('on')); await page.waitForTimeout(300); await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); } };
const axe = async label => {
  if (!fs.existsSync(AXE)) return;
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  await page.waitForTimeout(300);   // let entrance animations finish (axe reads colours mid-fade otherwise)
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
  const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  assert.equal(bad.length, 0, `axe (${label}): ` + bad.map(v => v.id + ' ' + v.nodes[0]?.target + ' ' + v.nodes[0]?.failureSummary?.slice(0, 160)).join('; '));
};
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); if (SHOTS) await shot('fail-' + name.replace(/\W+/g, '-')).catch(() => {}); process.exitCode = 1; throw e; } };
// every visible direct child of the matching element sits on one line (same vertical centre, give or take): rows of buttons must not wrap on a phone
const oneRow = async sel => {
  const found = await page.locator(sel).count(); assert.ok(found > 0, 'nothing matches ' + sel);
  const bad = await page.evaluate(s => [...document.querySelectorAll(s)].filter(el => { const k = [...el.children].filter(c => c.offsetParent); return k.length > 1 && (() => { const m = k.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.max(...m) - Math.min(...m) > 12; })(); }).map(el => el.className || el.id), sel);
  assert.deepEqual(bad, [], `wraps onto a second line at phone width: ${sel}`);
};
const noSideScroll = async () => assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.querySelector('#app').scrollWidth <= document.querySelector('#app').clientWidth + 1), true, 'the page scrolls sideways');
const text = sel => page.locator(sel).first().innerText();
const sheetGone = () => page.locator('dialog.sheet').waitFor({ state: 'detached' });
const stem = async () => (await text('#stem')).trim();
const startAs = async (name, pass) => { await page.goto(BASE + '?demo'); await page.locator('#f-name').waitFor(); await page.fill('#f-name', name); await page.fill('#f-pass', pass); await page.click('#start-go'); };
const submitNow = async () => { await page.click('#qpill'); await page.click('#nav-finish'); await page.locator('#submit').waitFor(); await page.click('#submit'); await page.locator('#score').waitFor(); };

try {
  // ================= an MO sits the test =================
  await step('start page; a wrong passphrase is refused', async () => {
    await page.goto(BASE + '?demo'); await page.locator('#f-name').waitFor();
    assert.match(await text('h1'), /Baby MO test/); assert.equal(await page.locator('#tabs').isHidden(), true);
    await shot('01-start'); await axe('start'); await noSideScroll();
    await page.fill('#f-name', 'Dr Test Person'); await page.fill('#f-pass', 'nope'); await page.click('#start-go');
    await page.locator('#start-err:not([hidden])').waitFor(); assert.match(await text('#start-err'), /passphrase is not right/);
  });
  await step('ready screen: real paper, pass mark and attempts', async () => {
    await page.fill('#f-pass', 'demo'); await page.click('#start-go');
    await page.locator('#go').waitFor();
    assert.equal(await text('#ready-sum'), `${N} questions · ${PAPER.minutes} minutes · pass ${PAPER.passMark}% · attempt 1 of 2`);
    assert.doesNotMatch(await text('#app'), /must/i, 'must-ask is not mentioned to MOs');
    await shot('02-ready'); await axe('ready'); await oneRow('#bottom .btn-row');
  });
  await step('the test: answer, flag, reload resumes, back and clear', async () => {
    await page.click('#go'); await page.locator('#stem').waitFor();
    assert.equal(await text('#qpill'), `Q 1/${N}`);
    assert.equal(await page.getAttribute('#prev', 'aria-disabled'), 'true');
    assert.equal(await page.locator('#tabs').isHidden(), true, 'no tab bar during a test');
    const n0 = await page.locator('.choice').count(); assert.ok(n0 >= 2 && n0 <= 6);
    assert.equal(await page.getByRole('button', { name: /^A, \S/ }).count(), 1, 'accessible name is "A, <choice>"');
    await page.locator('.choice').nth(0).click();
    assert.equal(await page.getAttribute('.choice >> nth=0', 'aria-pressed'), 'true');
    await page.click('#flag'); assert.equal(await page.getAttribute('#flag', 'aria-pressed'), 'true');
    await shot('03-question'); await axe('question'); await oneRow('.sbar-row'); await oneRow('#bottom .btn-row'); await noSideScroll();
    const s1 = await stem();
    await page.reload(); await page.locator('#stem').waitFor();       // reload mid-test: same place, answer kept, clock still running
    assert.equal(await stem(), s1); assert.equal(await page.locator('.choice[aria-pressed=true]').count(), 1);
    assert.match(await text('#timer'), /^\d{1,2}:\d\d$/);
    await page.click('#next'); assert.equal(await text('#qpill'), `Q 2/${N}`);
    await page.click('#prev'); assert.equal(await stem(), s1);
    await page.click('#clear'); assert.equal(await page.locator('.choice[aria-pressed=true]').count(), 0);
    await page.click('#timer'); assert.equal(await text('#timer'), 'Show timer'); await page.click('#timer'); assert.match(await text('#timer'), /^\d/);
  });
  await step('navigator sheet; back button closes a sheet; check sheet lists blanks and flags', async () => {
    await page.click('#qpill'); await page.locator('.navgrid').waitFor();
    assert.equal(await page.locator('.navdot').count(), N); assert.equal(await page.locator('.navdot.flag').count(), 1); assert.equal(await page.locator('.navdot.cur').count(), 1);
    await shot('04-navigator'); await axe('navigator');
    await page.goBack(); await sheetGone(); assert.equal(await text('#qpill'), `Q 1/${N}`, 'back closed the sheet and stayed in the test');
    await page.click('#qpill'); await page.click(`.navdot >> nth=${N - 1}`); await sheetGone();
    assert.equal(await text('#qpill'), `Q ${N}/${N}`); await page.locator('#finish').waitFor();
    await page.click('#finish'); await page.locator('#submit').waitFor();
    assert.match(await text('#check-sum'), new RegExp(`${N} unanswered questions · 1 flagged`));
    await shot('05-check'); await axe('check');
    await page.click('[data-goto="0"]'); await sheetGone(); assert.equal(await text('#qpill'), `Q 1/${N}`);
  });
  await step('leaving keeps the answers; the start page offers Resume', async () => {
    await page.goBack(); await page.waitForTimeout(300); await page.locator('#stem').waitFor();
    assert.match(page.url(), /#\/test$/, 'the back button does not leave a test by accident');
    await page.click('#leave'); await page.locator('dialog.sheet [data-no]').waitFor(); await page.click('dialog.sheet [data-no]'); await sheetGone();
    await page.click('#leave'); await page.click('dialog.sheet [data-yes]');
    await page.locator('#resume').waitFor(); assert.match(await text('#resume'), /Question 1 of/);
    await shot('06-resume'); await axe('resume');
    await page.click('#resume-go'); await page.locator('#stem').waitFor();
  });
  let sat;
  await step('answer every question correctly and submit: pass, saved, snapshot stored', async () => {
    for (let i = 0; i < N; i++) {
      const q = answerFor(await stem());
      await page.locator('.choice').nth(q.answer).click();
      if (i < N - 1) await page.click('#next');
    }
    await page.click('#finish'); assert.match(await text('#check-sum'), /Every question is answered · 1 flagged/);
    await page.click('#submit'); await page.locator('#score').waitFor();
    assert.match(await text('.verdict'), /Pass/); assert.match(await text('#score'), new RegExp(`${N} of ${N} right`));
    await page.locator('#saved.ok').waitFor(); assert.match(await text('#saved'), /Saved/i);
    await shot('07-result'); await axe('result'); await oneRow('#bottom .btn-row');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox') || '[]').length), 0);
    sat = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-local-v2')).attempts.at(-1));
    assert.equal(sat.items.length, N); assert.equal(sat.cohort, 'Demo cohort'); assert.equal(sat.attemptNo, 1);
    const ids = new Set(sat.items.map(i => i.qid)); assert.equal(ids.size, N);
    for (const it of sat.items) {
      const q = POOL.find(x => x.id === it.qid); assert.ok(q, 'snapshot qid is a ready bank id');
      assert.equal(it.stem, q.stem); assert.deepEqual(it.options, q.options); assert.equal(it.answer, q.answer);
      assert.deepEqual(Object.keys(it).sort(), ['answer', 'explain', 'options', 'picked', 'qid', 'stem', 'topic']);
    }
    for (const m of PAPER.must.filter(id => POOL.some(q => q.id === id))) assert.ok(ids.has(m), 'a must-ask question is missing: ' + m);
  });
  await step('full review: your answer against the right one, in words', async () => {
    await page.click('#answers .row-link >> nth=0'); await page.locator('#stem').waitFor();
    assert.match(await text('.qbody'), /Your answer · correct/i);
    await shot('08-review'); await axe('review'); await oneRow('#bottom .btn-row');
    await page.click('#bottom a:has-text("Next")'); await page.locator('.kicker:has-text("Question 2 of")').waitFor();
    await page.goto(BASE + '?demo#/result'); await page.locator('#score').waitFor();
  });
  await step('the timer running out submits by itself', async () => {
    await page.click('#done'); await page.locator('#f-name').waitFor();
    await page.fill('#f-name', 'Slow Person'); await page.fill('#f-pass', 'demo'); await page.click('#start-go');
    await page.click('#go'); await page.locator('#stem').waitFor();
    await page.evaluate(m => { const a = JSON.parse(localStorage.getItem('mo-attempt')); a.startedAt -= (m + 1) * 60 * 1000; localStorage.setItem('mo-attempt', JSON.stringify(a)); }, PAPER.minutes);
    await page.reload(); await page.locator('#score').waitFor();
    assert.match(await text('#app'), /Time ran out/); assert.match(await text('#score'), new RegExp(`0 of ${N} right`)); assert.match(await text('.verdict'), /Not yet/);
    await page.click('#done');
  });

  // ================= faculty =================
  await step('faculty sign in; Results by person', async () => {
    await page.goto(BASE + '?demo#/faculty'); await page.locator('#in').waitFor();
    await shot('09-faculty-signin'); await axe('faculty gate');
    await page.click('#in'); await page.locator('#byperson').waitFor();
    assert.equal(await page.locator('#tabs .tab').count(), 4); await oneRow('#tabs');
    assert.equal(await page.getAttribute('#tabs .tab >> nth=0', 'aria-current'), 'page');
    assert.equal(await page.locator('#byperson li').count(), 2); assert.match(await text('#byperson'), /Dr Test Person/); assert.match(await text('#byperson'), /Slow Person/);
    assert.match(await text('#res-sum'), /2 sittings · 1 passed/);
    await shot('10-results-person'); await axe('results by person'); await oneRow('.seg-row'); await noSideScroll();
  });
  await step('Results by question, its detail, by topic', async () => {
    await page.click('.seg-opt:has-text("By question")'); await page.locator('#byquestion').waitFor();
    assert.equal(await page.locator('#byquestion li').count(), N);
    await shot('11-results-question'); await axe('results by question');
    await page.click('#byquestion .row-link >> nth=0'); await page.locator('#picks').waitFor();
    assert.match(await text('#picks'), /Answer/i); assert.match(await text('#picks'), /chose/);
    await shot('12-question-stats'); await axe('question stats');
    await page.goBack(); await page.locator('#byquestion').waitFor();
    await page.click('.seg-opt:has-text("By topic")'); await page.locator('#bytopic').waitFor(); assert.match(await text('#bytopic'), /% right/);
    await shot('13-results-topic'); await axe('results by topic');
    await page.click('.seg-opt:has-text("By person")'); await page.locator('#byperson').waitFor();
  });
  await step('a person: sittings, missed questions, give another attempt with Undo', async () => {
    await page.click('#byperson .row-link:has-text("Slow Person")'); await page.locator('#used').waitFor();
    assert.match(await text('#used'), /1 of 2/); assert.match(await text('#app'), new RegExp(`Missed in the latest sitting \\(${N}\\)`, 'i'));
    await shot('14-person'); await axe('person');
    await page.click('#grant'); await page.click('dialog.sheet [data-yes]');
    await page.locator('#used:has-text("0 of 2")').waitFor();
    await page.locator('#toast.on .toast-act').click(); await page.locator('#used:has-text("1 of 2")').waitFor();
    await page.click('#app .list .row-link >> nth=0'); await page.locator('#att-items').waitFor(); assert.equal(await page.locator('#att-items li').count(), N);
    await axe('attempt');
  });
  await step('Paper: read-only, ready and draft questions, Must and Hard badges, Suggest a change', async () => {
    await page.click('#tabs .tab:has-text("Paper")'); await page.locator('#paper-ready').waitFor();
    assert.equal(await page.locator('#paper-ready li').count(), POOL.length);
    assert.equal(await page.locator('#paper-drafts li').count(), ALL.length - POOL.length);
    assert.equal(await page.locator('#paper-ready .badge.must').count(), POOL.filter(q => q.must).length);
    assert.equal(await page.locator('#paper-ready .badge.hard').count(), POOL.filter(q => q.level === 'hard').length);
    assert.equal(await page.locator('#app input, #app textarea, #app [contenteditable]').count(), 0, 'nothing to edit');
    await shot('15-paper'); await axe('paper');
    await page.click('#paper-ready .row-link >> nth=0'); await page.locator('#suggest').waitFor();
    const q = answerFor(await stem());
    assert.match(await text('.choice.is-answer'), /Answer/i); assert.match(await text('.choice.is-answer'), new RegExp(q.options[q.answer].slice(0, 10).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(await page.getAttribute('#suggest', 'href'), `https://anantf.com/qbank/#/q/${q.id}?suggest`);
    await shot('16-paper-question'); await axe('paper question');
    await page.goBack(); await page.locator('#paper-ready').waitFor();
  });
  await step('Settings: steppers, review mode, unsaved-changes guard, save', async () => {
    await page.click('#tabs .tab:has-text("Settings")'); await page.locator('#sf').waitFor();
    assert.equal(await text('#s-count'), String(PAPER.count)); assert.equal(await text('#s-pm'), String(PAPER.passMark)); assert.equal(await text('#s-min'), String(PAPER.minutes));
    await shot('17-settings'); await axe('settings'); await oneRow('.seg-row'); await oneRow('.stepper'); await oneRow('.stepper-row'); await noSideScroll();
    for (let i = 0; i < PAPER.count - 3; i++) await page.click('.stepper:has(#s-count) [data-step="-1"]');
    assert.equal(await text('#s-count'), '3');
    await page.click('.stepper:has(#s-min) [data-step="1"]'); assert.equal(await text('#s-min'), '25');
    await page.click('.seg-opt:has-text("Right or wrong")');
    await page.fill('#s-cohort', 'Oct 2026'); await page.fill('#s-pass', 'newpass');
    await page.click('#tabs .tab:has-text("People")'); await page.locator('dialog.sheet [data-no]').waitFor();
    assert.match(await text('dialog.sheet'), /Leave without saving/);
    await page.click('dialog.sheet [data-no]'); await sheetGone();
    assert.equal(await page.inputValue('#s-cohort'), 'Oct 2026', 'typed text kept'); assert.match(page.url(), /settings/);
    await page.fill('#s-pass', 'ab'); await page.click('#save'); await page.locator('#serr:not([hidden])').waitFor();
    await page.fill('#s-pass', 'newpass'); await page.click('#save'); await page.locator('#toast.on:has-text("Settings saved")').waitFor();
    await page.locator('#sf').waitFor(); assert.equal(await text('#s-count'), '3'); assert.equal(await page.inputValue('#s-cohort'), 'Oct 2026');
    await page.click('#d-count'); assert.equal(await text('#s-count'), String(PAPER.count)); await page.click('.stepper:has(#s-count) [data-step="-1"]');
    for (let i = 0; i < PAPER.count - 4; i++) await page.click('.stepper:has(#s-count) [data-step="-1"]');
    await page.click('#save'); await page.locator('#toast.on:has-text("Settings saved")').waitFor();
    const st = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-local-v2')).settings);
    assert.equal(st.count, 3); assert.equal(st.minutes, 25); assert.equal(st.review, 'marks'); assert.equal(st.cohort, 'Oct 2026');
  });
  await step('People: approve and decline requests, change a role, add and remove', async () => {
    await page.evaluate(() => {   // two people have asked for access (in the real app they do this from the Faculty page)
      const d = JSON.parse(localStorage.getItem('mo-local-v2'));
      d.requests = [{ email: 'dr.new@example.com', name: 'Dr New', requestedAt: Date.now() }, { email: 'dr.no@example.com', name: 'Dr No', requestedAt: Date.now() - 1000 }];
      localStorage.setItem('mo-local-v2', JSON.stringify(d));
    });
    await page.goto(BASE + '?demo#/faculty/people'); await page.locator('#reqs').waitFor();
    assert.equal(await page.locator('#reqs li').count(), 2); await page.locator('.tab-badge:has-text("2")').waitFor();
    await shot('18-people'); await axe('people'); await oneRow('#reqs .btn-row'); await oneRow('#tabs');
    await page.click('[data-ap="dr.new@example.com"]');
    await page.locator('#mem li:has-text("dr.new@example.com")').waitFor(); assert.equal(await page.locator('#reqs li').count(), 1);
    await page.click('[data-dec="dr.no@example.com"]'); await page.click('dialog.sheet [data-yes]');
    await page.locator('text=Nobody is waiting').waitFor(); assert.equal(await page.locator('.tab-badge').count(), 0);
    await page.click('[data-member="dr.new@example.com"] .seg-opt:has-text("Admin")'); await page.locator('#toast.on:has-text("Now an admin")').waitFor();
    await oneRow('#mem .seg-row');
    await page.fill('#m-email', 'dr.lee@example.com'); await page.fill('#m-name', 'Dr Lee'); await page.click('#mf button[type=submit]');
    await page.locator('#mem li:has-text("dr.lee@example.com")').waitFor();
    await page.click('[data-rm="dr.lee@example.com"]'); await page.click('dialog.sheet [data-yes]');
    await page.locator('#mem li:has-text("dr.lee@example.com")').waitFor({ state: 'detached' });
  });
  await step('the new settings apply: 3 questions, 25 minutes, right-or-wrong review, cohort recorded', async () => {
    await startAs('Dr Third', 'newpass'); await page.locator('#go').waitFor();
    assert.match(await text('#ready-sum'), /^3 questions · 25 minutes · pass 80% · attempt 1 of 2$/);
    await page.click('#go'); await page.locator('#stem').waitFor();
    const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-attempt')).items.map(i => i.qid));
    assert.equal(ids.length, 3); for (const id of ids) assert.ok(PAPER.must.includes(id), 'with 4 must-ask questions and 3 places, all 3 are must-ask');
    await submitNow();
    assert.equal(await page.locator('#answers .row-link').count(), 0, 'right-or-wrong review has no answers to open');
    assert.equal(await page.locator('#answers li').count(), 3);
    const c = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-local-v2')).attempts.at(-1).cohort); assert.equal(c, 'Oct 2026');
  });
  await step('two attempts: fail, try again, last attempt, then blocked', async () => {
    await page.click('#done'); await startAs('Retry Person', 'newpass'); await page.locator('#go').waitFor(); assert.match(await text('#ready-sum'), /attempt 1 of 2/);
    await page.click('#go'); await submitNow(); assert.match(await text('#app'), /Attempt 1 of 2\. You have 1 attempt left/);
    await shot('19-retry'); await axe('retry');
    await page.click('#again'); await page.locator('#go').waitFor(); assert.match(await text('#ready-sum'), /attempt 2 of 2/);
    await page.click('#go'); await submitNow(); assert.match(await text('#app'), /last attempt/); assert.equal(await page.locator('#again').count(), 0);
    await page.click('#done');
    await startAs('retry  PERSON', 'newpass'); await page.locator('#start-err:not([hidden])').waitFor(); assert.match(await text('#start-err'), /used all 2 of your attempts/);
  });
  await step('Needs help, then faculty give another attempt', async () => {
    await page.goto(BASE + '?demo#/faculty/results'); await page.locator('#needshelp').waitFor();
    assert.match(await text('#needshelp'), /Retry Person/);
    await page.click('#needshelp .row-link'); await page.locator('#grant').waitFor(); await page.click('#grant'); await page.click('dialog.sheet [data-yes]');
    await page.locator('#used:has-text("1 of 2")').waitFor();
    await startAs('Retry Person', 'newpass'); await page.locator('#go').waitFor(); assert.match(await text('#ready-sum'), /attempt 2 of 2/);
    await page.click('#cancel'); await page.locator('#f-name').waitFor();
  });
  await step('a result left waiting from earlier is sent when the page opens', async () => {
    const before = await page.evaluate(() => JSON.parse(localStorage.getItem('mo-local-v2')).attempts.length);
    await page.evaluate(() => localStorage.setItem('mo-outbox', JSON.stringify([{ id: 'waiting1', uid: 'local', name: 'Dr Waiting', cohort: '', startedAt: 1, submittedAt: 2, durationSec: 5, items: [{ qid: 'x', stem: 'S', options: ['a', 'b', 'c'], answer: 0, topic: '', explain: '', picked: 0 }], settings: { count: 1, passMark: 80, minutes: 5 } }])));
    await page.reload(); await page.locator('#f-name').waitFor();
    await page.waitForFunction(b => JSON.parse(localStorage.getItem('mo-local-v2')).attempts.length === b + 1 && !JSON.parse(localStorage.getItem('mo-outbox') || '[]').length, before, { timeout: 10000 });
  });
  await step('sign out from Settings returns to the faculty sign-in', async () => {
    await page.goto(BASE + '?demo#/faculty/settings'); await page.locator('#signout').waitFor();
    assert.match(await text('#app'), /demo@example.com/);
    await page.click('#signout'); await page.locator('#in').waitFor(); assert.equal(await page.locator('#tabs').isHidden(), true);
  });
  await step('desktop width: centred column, axe clean', async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const h of ['', '#/faculty']) { await page.goto(BASE + '?demo' + h); await page.locator('h1').waitFor(); await axe('desktop ' + (h || 'start')); }
    await page.click('#in'); await page.locator('#byperson').waitFor(); await axe('desktop results');
    const w = await page.evaluate(() => document.querySelector('#shell').getBoundingClientRect().width); assert.ok(w <= 602, 'column is at most 600px');
    for (const h of ['#/faculty/paper', '#/faculty/settings', '#/faculty/people']) { await page.goto(BASE + '?demo' + h); await page.locator('h1').waitFor(); await page.waitForTimeout(300); await axe('desktop ' + h); }
    await page.setViewportSize({ width: 390, height: 844 });
  });
  assert.deepEqual(errors, [], 'console errors: ' + errors.join(' | '));
  console.log('babymo e2e: all steps ok');
} catch (e) { if (!process.exitCode) { console.error(e); process.exitCode = 1; } } finally { await b.close(); }
