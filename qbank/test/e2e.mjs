// Browser test of the qbank app at phone size (390 x 844), with axe on every screen, one-row checks, the practise and
// exam flows, suggest-a-change, and the app working offline after the first visit.
// Run from the repo root: node qbank/test/e2e.mjs        SHOTS=<dir> also saves phone screenshots
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import * as B from '../js/bank.js';

const root = new URL('../../', import.meta.url).pathname;
const AXE = process.env.AXE_PATH || path.join(root, 'babymo/test/vendor/axe.min.js');
const SHOTS = process.env.SHOTS;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', webmanifest: 'application/manifest+json', woff2: 'font/woff2' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  const f = path.join(root, rel.endsWith('/') || rel === '' ? rel + 'index.html' : rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/qbank/`;

const bank = JSON.parse(fs.readFileSync(path.join(root, 'qbank/bank/questions.json'), 'utf8'));
const ready = B.readyQuestions(bank.questions);
const byId = new Map(ready.map(q => [q.id, q]));

const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, serviceWorkers: 'block', reducedMotion: 'reduce', hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

const shot = async name => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.waitForTimeout(150); await page.screenshot({ path: path.join(SHOTS, `qbank-${name}.png`) }); } };
const axe = async label => {
  if (!(await page.evaluate(() => !!window.axe))) await page.addScriptTag({ path: AXE });
  const r = await page.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
  const bad = r.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  assert.equal(bad.length, 0, `axe (${label}): ` + bad.map(v => v.id + ' ' + v.nodes[0]?.target + ' ' + v.nodes[0]?.failureSummary?.slice(0, 160)).join('; '));
};
const step = async (name, fn) => { try { await fn(); console.log('ok  ', name); } catch (e) { console.error('FAIL', name, '\n', e.message); await shot('fail-' + name.replace(/\W+/g, '-')); process.exitCode = 1; throw e; } };
// every visible direct child of the matching elements sits on one line: rows of buttons must not wrap on a phone
const oneRow = async sel => {
  const found = await page.locator(sel).count();
  assert.ok(found > 0, 'nothing matches ' + sel);
  const bad = await page.evaluate(s => [...document.querySelectorAll(s)].filter(el => { const k = [...el.children].filter(c => c.offsetParent && getComputedStyle(c).position !== 'absolute'); if (k.length < 2) return false; const m = k.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; }); return Math.max(...m) - Math.min(...m) > 12; }).map(el => el.className || el.id), sel);
  assert.deepEqual(bad, [], `wraps onto a second line at phone width: ${sel}`);
};
const noSideScroll = async label => {
  const w = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, main: document.querySelector('main').scrollWidth - document.querySelector('main').clientWidth, vw: innerWidth }));
  assert.ok(w.doc <= w.vw && w.main <= 0, `${label}: the page scrolls sideways (${JSON.stringify(w)})`);
};
const text = sel => page.locator(sel).first().innerText();
const sess = () => page.evaluate(() => JSON.parse(localStorage.getItem('qbank.v1.session')));
const store = k => page.evaluate(k => JSON.parse(localStorage.getItem('qbank.v1.' + k)), k);
const sheet = () => page.locator('dialog[open]');
const sheetGone = () => page.waitForFunction(() => !document.querySelector('dialog'));
const screen = async (name, rows = []) => { await noSideScroll(name); await shot(name); await axe(name); for (const r of rows) await oneRow(r); };

try {
  await step('practise home', async () => {
    await page.goto(BASE); await page.locator('#quick').waitFor();
    assert.equal(await text('main h1'), 'Practise');
    assert.match(await text('#quick'), /Start 10 questions/);
    assert.equal(await text('#ready-count'), `${ready.length} questions ready`, 'the count is the ready questions in the bank (active and complete), never drafts');
    assert.equal(await page.locator('.app-tab[aria-current=page]').innerText(), 'Practise');
    assert.equal(await page.locator('#offline').isVisible(), false, 'no offline pill when online');
    await screen('practise', ['.app-tabbar-inner']);
  });

  let firstId;
  await step('quick practice: one tap answers, feedback sheet, progress saved', async () => {
    await page.click('#quick'); await page.locator('#navpill').waitFor();
    assert.equal(await text('#navpill'), 'Q 1/10');
    assert.equal(await page.locator('#tabbar').isVisible(), false, 'tab bar hidden in a session');
    await screen('session', ['#bar .app-bar-row']);
    const s = await sess(); firstId = s.items[0].q.id;
    const wrong = (s.items[0].q.answer + 1) % s.items[0].q.options.length;
    await page.locator('.app-choice').nth(wrong).click();
    await sheet().waitFor();
    assert.match(await text('dialog[open] h2'), /^Incorrect, answer [A-F]$/);
    assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'H2', 'focus moves to the feedback heading');
    await screen('feedback');
    const pr = await store('progress'); assert.equal(pr[firstId].n, 1); assert.equal(pr[firstId].c, 0);
    assert.equal(await page.locator('.app-choice.is-incorrect .app-choice-tag').first().innerText(), 'YOURS', 'your wrong answer is labelled in words, not colour alone');
    assert.equal(await page.locator('.app-choice.is-answer .app-choice-tag').first().innerText(), 'ANSWER');
    assert.match(await page.locator('.app-choice.is-incorrect .app-sr').last().textContent(), /your answer, incorrect/);
  });

  await step('closing the sheet with Android back keeps the answered question; Next moves on', async () => {
    await page.goBack(); await sheetGone();
    assert.equal(await text('#navpill'), 'Q 1/10');
    await page.locator('.qb-explain').waitFor();
    await oneRow('.app-toolbar-inner');
    await page.click('#next'); await page.waitForFunction(() => document.querySelector('#navpill')?.textContent === 'Q 2/10');
  });

  await step('a double tap on "Next question" moves one question and stays in the session', async () => {
    const s = await sess();
    await page.locator('.app-choice').nth(s.items[1].q.answer).click(); await sheet().waitFor();
    await page.locator('#fnext').dblclick(); await sheetGone(); await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => location.hash), '#/session');
    assert.equal(await text('#navpill'), 'Q 3/10');
    // put the second question back as it was (unanswered) for the steps below
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('qbank.v1.session')); s.items[1].picked = null; delete s.items[1].at; s.pos = 1; localStorage.setItem('qbank.v1.session', JSON.stringify(s)); });
    await page.reload(); await page.locator('#navpill').waitFor();
    assert.equal(await text('#navpill'), 'Q 2/10');
  });

  await step('flag, then a reload resumes exactly where it was', async () => {
    await page.click('#flag'); assert.equal(await page.getAttribute('#flag', 'aria-pressed'), 'true');
    const s = await sess(); assert.equal(s.items[1].flagged, true);
    assert.ok((await store('flags'))[s.items[1].q.id]);
    await page.reload(); await page.locator('#navpill').waitFor();
    assert.equal(await text('#navpill'), 'Q 2/10'); assert.equal(await page.getAttribute('#flag', 'aria-pressed'), 'true');
  });

  await step('navigator sheet', async () => {
    await page.click('#navpill'); await sheet().waitFor();
    assert.equal(await page.locator('.qb-dot').count(), 10);
    assert.match(await page.locator('.qb-dot').nth(0).getAttribute('aria-label'), /Question 1, answered/);
    assert.match(await page.locator('.qb-dot').nth(1).getAttribute('aria-label'), /flagged, current/);
    await screen('navigator');
    await page.locator('.qb-dot').nth(0).click(); await sheetGone();
    assert.equal(await text('#navpill'), 'Q 1/10'); await page.locator('.app-choice.is-incorrect').waitFor();
    await page.click('#navpill'); await page.locator('.qb-dot').nth(1).click(); await sheetGone();
  });

  await step('answer the rest (all right) and see results', async () => {
    for (let k = 1; k < 10; k++) {
      const s = await sess();
      assert.equal(await text('#navpill'), `Q ${k + 1}/10`);
      await page.locator('.app-choice').nth(s.items[k].q.answer).click();
      await sheet().waitFor(); assert.equal(await text('dialog[open] h2'), 'Correct');
      await page.click('#fnext');
      if (k < 9) await page.waitForFunction(n => document.querySelector('#navpill')?.textContent === `Q ${n}/10`, k + 2);
    }
    await page.locator('#score').waitFor();
    assert.match(await text('#score'), /9 of 10/);
    assert.equal(await store('session'), null, 'the open session is closed');
    assert.equal((await store('history')).length, 1);
    await screen('summary', ['.app-chips']);
  });

  await step('summary filter and review paging', async () => {
    await page.locator('.app-chip', { hasText: 'Wrong' }).click();
    assert.equal(await page.locator('main .app-list a.app-row[href^="#/review/"]').count(), 1);
    await page.locator('main .app-list a.app-row[href^="#/review/"]').first().click();
    await page.locator('#rnext').waitFor();
    assert.match(await text('.qb-verdict'), /Incorrect/);
    await screen('review', ['.app-toolbar-inner']);
    await page.click('#rnext'); await page.waitForFunction(() => document.querySelector('#bar h1')?.textContent === '2 of 10');
    assert.match(await text('.qb-verdict'), /Correct/);
    await page.click('#bar .app-back'); await page.locator('#score').waitFor();
  });

  await step('retry wrong and flagged, leave, resume card, discard with undo', async () => {
    assert.match(await text('#retry'), /Retry wrong and flagged \(2\)/);
    await page.click('#retry'); await page.locator('#navpill').waitFor();
    assert.equal(await text('#navpill'), 'Q 1/2');
    await page.click('#leave'); await sheet().waitFor();
    await screen('leave', ['.app-sheet-foot .app-btn-row']);
    await page.click('#goaway'); await page.locator('#resume-card').waitFor();
    assert.match(await text('#resume-card'), /^Resume\s+Q 1 of 2 · Retry/i);
    await screen('resume');
    await page.click('#discard'); await page.locator('#toast.is-visible').waitFor();
    assert.equal(await page.locator('#resume-card').count(), 0);
    await page.locator('#toast.is-visible .app-toast-action', { hasText: 'Undo' }).click();
    await page.locator('#resume-card').waitFor();
    await page.click('#resume'); await page.locator('#navpill').waitFor();
    await page.click('#leave'); await page.click('#goaway'); await page.locator('#resume-card').waitFor();
  });

  await step('exam mode: sheet, timer, change answers, check sheet, submit', async () => {
    await page.click('#exam'); await sheet().waitFor();
    await screen('exam-sheet', ['[data-stepper="ecount"]', '[data-stepper="emin"]', '[data-chips="etopics"]']);
    await page.click('[data-stepper="ecount"] [data-d="-1"]'); await page.click('[data-stepper="ecount"] [data-d="-1"]');
    assert.equal(await text('[data-stepper="ecount"] output'), '5');
    assert.match(await text('#ematch'), /5 questions · 5 minutes/);
    await page.click('#estart'); await page.locator('#navpill').waitFor();
    assert.equal(await text('#navpill'), 'Q 1/5');
    assert.match(await text('#timer'), /^[45]:\d\d$/);
    await screen('exam', ['.app-toolbar-inner', '#bar .app-bar-row']);
    await page.locator('.app-choice').nth(0).click(); await page.locator('.app-choice').nth(1).click();
    assert.equal(await page.locator('.app-choice[aria-pressed=true]').count(), 1);
    assert.equal(await page.locator('.app-choice').nth(1).getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('dialog').count(), 0, 'no feedback in exam mode');
    await page.click('#flag2'); assert.equal(await page.getAttribute('#flag2', 'aria-pressed'), 'true');
    await page.click('#timer'); assert.equal(await text('#timer'), 'Show timer'); await page.click('#timer');
    for (let k = 1; k < 5; k++) await page.click('#next');
    assert.equal(await text('#next'), 'Finish');
    await page.click('#next'); await sheet().waitFor();
    assert.match(await text('dialog[open] .app-sheet-body'), /4 unanswered, 1 flagged/);
    await screen('check');
    await page.click('[data-goto]:has-text("unanswered")'); await sheetGone();
    assert.equal(await text('#navpill'), 'Q 2/5');
    const s = await sess();
    for (let k = 1; k < 5; k++) { await page.locator('.app-choice').nth(s.items[k].q.answer).click(); await page.click('#next'); }
    await sheet().waitFor(); assert.match(await text('dialog[open] .app-sheet-body'), /1 flagged/);
    await page.click('#submit'); await page.locator('#score').waitFor();
    assert.match(await text('#score'), /of 5/); assert.match(await text('#score'), /Exam/);
  });

  await step('exam timer running out submits by itself', async () => {
    await page.click('#done'); await page.locator('#quick').waitFor();
    await page.click('#exam'); await page.click('#estart'); await page.locator('#timer').waitFor();
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('qbank.v1.session')); s.startedAt -= s.minutes * 60000 + 1000; localStorage.setItem('qbank.v1.session', JSON.stringify(s)); });
    await page.reload(); await page.locator('#score').waitFor({ timeout: 5000 });
    assert.match(await text('#score'), /time ran out/);
    await page.click('#done'); await page.locator('#quick').waitFor();
  });

  await step('custom practice sheet: live count, remembered choices', async () => {
    await page.click('#custom'); await sheet().waitFor();
    await screen('custom', ['[data-seg="status"]', '[data-seg="mode"]', '[data-chips="topics"]', '[data-stepper="count"]']);
    const topic = 'Airway', want = ready.filter(q => q.topics.includes(topic)).length;
    await page.locator('dialog .app-chip', { hasText: topic }).click();
    assert.match(await text('#match'), new RegExp(`^${want} questions? match`));
    await page.locator('[data-seg="status"] .app-seg', { hasText: 'Flagged' }).click();
    const fl = await store('flags'), nf = ready.filter(q => q.topics.includes(topic) && fl[q.id]).length;
    assert.match(await text('#match'), new RegExp(`^${nf} questions? match`));
    assert.equal(await page.getAttribute('#cstart', 'aria-disabled'), String(nf === 0));
    await page.locator('dialog .app-chip', { hasText: topic }).click();
    const none = [...new Set(ready.flatMap(q => q.topics))].find(t => !ready.some(q => q.topics.includes(t) && fl[q.id]));
    await page.locator(`dialog .app-chip[data-value="${none}"]`).click();   // a topic with nothing flagged: Start is disabled
    assert.match(await text('#match'), /^0 questions match/); assert.equal(await page.getAttribute('#cstart', 'aria-disabled'), 'true');
    await page.locator(`dialog .app-chip[data-value="${none}"]`).click(); await page.locator('dialog .app-chip', { hasText: topic }).click();
    await page.locator('[data-seg="status"] .app-seg', { hasText: 'All' }).click();
    await page.locator('[data-seg="status"] input:checked').press('ArrowRight');
    assert.equal(await page.locator('[data-seg="status"] .app-seg:has(input:checked)').innerText(), 'Unseen');
    assert.equal((await store('custom')).status, 'unseen', 'the arrow key choice is remembered');
    assert.deepEqual((await store('custom')).topics, [topic]);
    await page.locator('[data-seg="status"] .app-seg', { hasText: 'All' }).click();
    await page.click('#cstart'); await page.locator('#navpill').waitFor();
    assert.match(await text('#navpill'), /^Q 1\/\d+$/);
    const s = await sess(); assert.ok(s.items.every(i => i.q.topics.includes(topic)));
    await page.click('#leave'); await page.click('#goaway'); await page.locator('#resume-card').waitFor();
    await page.click('#discard');
  });

  await step('topics list and missed list', async () => {
    await page.click('a[href="#/topics"]'); await page.locator('[data-topic]').first().waitFor();
    await screen('topics');
    await page.click('#bar .app-back'); await page.locator('#quick').waitFor();
    // the exam above draws at random, so it may have put the one missed question right again
    const pr = await store('progress'), missed = ready.filter(q => pr[q.id] && !pr[q.id].h.at(-1)[1]).length;
    await page.click('a[href="#/list/missed"]');
    if (missed) { await page.locator('#go').waitFor(); assert.equal(await text('#go'), `Practise these (${missed})`); }
    else { await page.locator('.app-empty').waitFor(); assert.match(await text('.app-empty'), /Nothing missed yet/); }
    await screen('missed');
    await page.click('#bar .app-back'); await page.locator('#quick').waitFor();
  });

  let detailId;
  await step('browse: search, topic chips, topic list, question detail', async () => {
    await page.click('.app-tab[data-tab=browse]'); await page.locator('#find').waitFor();
    assert.equal(await text('main h1'), 'Browse');
    await screen('browse', ['[data-chips="btopic"]', '.app-tabbar-inner']);
    const word = 'laryngeal', want = ready.filter(q => B.matchesQuery(q, word)).length;
    await page.fill('#find', word);
    await page.waitForFunction(w => new RegExp(`^${w} question`).test(document.querySelector('#blist .qb-count')?.textContent || ''), want);
    await shot('search');
    await page.fill('#find', ''); await page.locator('#blist a[href^="#/browse/t/"]').first().waitFor();
    await page.locator('#blist a[href="#/browse/t/Airway"]').click(); await page.locator('#pt').waitFor();
    assert.equal(await text('#bar h1'), 'Airway');
    await screen('browse-topic');
    detailId = (await page.locator('main a.app-row[href^="#/q/"]').first().getAttribute('href')).split('/').pop();
    await page.locator('main a.app-row[href^="#/q/"]').first().click(); await page.locator('#show').waitFor();
    assert.equal(await page.locator('.app-choice.is-correct').count(), 0, 'answer hidden until asked');
    await screen('question');
    await page.click('#show'); await page.locator('.qb-explain').waitFor();
    assert.equal(await page.locator('.app-choice.is-correct').count(), 1);
    assert.ok((await page.locator('.app-choice.is-correct').innerText()).includes(byId.get(detailId).options[byId.get(detailId).answer]));
    await screen('question-answer');
    // an earlier random session may already have flagged this question: a tap toggles it either way
    const was = await page.getAttribute('#qflag', 'aria-pressed');
    await page.click('#qflag'); await page.waitForFunction(w => document.querySelector('#qflag')?.getAttribute('aria-pressed') === w, String(was !== 'true'));
    if (was === 'true') { await page.click('#qflag'); await page.waitForFunction(() => document.querySelector('#qflag')?.getAttribute('aria-pressed') === 'true'); }
  });

  await step('suggest a change: edit, GitHub issue link and copy text', async () => {
    await page.evaluate(() => { window.__opened = []; window.open = u => { window.__opened.push(u); return null; }; window.__copied = []; navigator.clipboard.writeText = async t => { window.__copied.push(t); }; });
    const q = byId.get(detailId);
    await page.click('#qsuggest'); await sheet().waitFor();
    await screen('suggest', ['[data-seg="smode"]']);
    await page.locator('[data-seg="smode"] .app-seg', { hasText: 'Edit' }).click();
    await page.locator('#s-stem').waitFor();
    const newAns = (q.answer + 1) % q.options.length;
    await page.locator('[data-seg="sanswer"] .qb-opt-pick').nth(newAns).click();
    assert.equal(await page.locator('[data-seg="sanswer"] input:checked').getAttribute('value'), String(newAns));
    await page.fill('#s-comment', 'The key looks wrong; see the guideline.');
    await page.fill('#s-name', 'Dr Test');
    await screen('suggest-edit', ['.qb-opt-row', '.app-sheet-foot .app-btn-row']);
    await page.click('#s-issue'); await sheetGone();
    const url = (await page.evaluate(() => window.__opened))[0];
    const change = { comment: 'The key looks wrong; see the guideline.', question: { stem: q.stem, options: q.options, answer: newAns, explain: q.explain } };
    assert.equal(url, B.suggestionIssueUrl(q, change, 'Dr Test'));
    assert.match(decodeURIComponent(url), new RegExp(`Question edit: ${q.id} \\(Dr Test\\)`));
    assert.match(await text('#toast.is-visible .app-toast-text'), /Opened in GitHub/);
    // copy text, comment only; the name is remembered
    await page.click('#qsuggest'); await sheet().waitFor();
    assert.equal(await page.inputValue('#s-name'), 'Dr Test');
    assert.equal(await page.inputValue('#s-comment'), '', 'the sent draft was cleared');
    await page.click('#s-copy'); assert.match(await text('#toast.is-visible .app-toast-text'), /Write a comment first/);
    await page.fill('#s-comment', 'Please add an explanation.');
    await page.click('#s-copy'); await sheetGone();
    assert.equal((await page.evaluate(() => window.__copied))[0], B.suggestionText(q, { comment: 'Please add an explanation.' }, 'Dr Test'));
    assert.match(await text('#toast.is-visible .app-toast-text'), /Copied\. Send it to the owner/);
  });

  await step('a suggestion draft survives closing the sheet; ?suggest opens it directly', async () => {
    await page.goto(BASE + `#/q/${detailId}?suggest`); await sheet().waitFor();
    await page.fill('#s-comment', 'half typed');
    await page.goBack(); await sheetGone();
    assert.equal(await text('#bar h1'), 'Question');
    await page.click('#qsuggest'); await sheet().waitFor();
    assert.equal(await page.inputValue('#s-comment'), 'half typed');
    await page.click('dialog[open] [data-sheet-close]'); await sheetGone();
  });

  await step('papers: list, paper screen, a sitting with a pass line', async () => {
    await page.click('.app-tab[data-tab=papers]'); await page.locator('main a.app-row[href^="#/paper/"]').first().waitFor();
    await screen('papers');
    await page.locator('main a.app-row[href="#/paper/babymo"]').click(); await page.locator('#pstart').waitFor();
    await screen('paper');
    await page.click('#pstart'); await page.locator('#navpill').waitFor();
    const s = await sess(); const resolved = B.resolvePaper(JSON.parse(fs.readFileSync(path.join(root, 'qbank/papers/babymo.json'), 'utf8')), bank.questions);
    assert.equal(s.items.length, Math.min(resolved.settings.count, resolved.pool.length));
    for (const id of resolved.pool.filter(q => q.must).map(q => q.id)) assert.ok(s.items.some(i => i.q.id === id), 'must-ask question missing: ' + id);
    assert.equal(s.minutes, resolved.settings.minutes);
    for (let k = 0; k < s.items.length; k++) { await page.locator('.app-choice').nth(s.items[k].q.answer).click(); await page.click('#next'); }
    await page.click('#submit'); await page.locator('#score').waitFor();
    assert.match(await text('#score'), /Pass/);
    await page.click('#done');
  });

  await step('progress: week, totals, topics, history, reset with undo, version line', async () => {
    await page.click('.app-tab[data-tab=progress]'); await page.locator('#reset').waitFor();
    assert.equal(await page.locator('.qb-day.is-on').count(), 1);
    assert.equal(await page.locator('.qb-day').count(), 7);
    assert.ok(await page.locator('main a.app-row[href*="?from=progress"]').count() >= 3);
    await screen('progress', ['.qb-week', '.qb-stats']);
    await page.locator('main a.app-row[href*="?from=progress"]').first().click(); await page.locator('#score').waitFor();
    assert.equal(await text('#bar .app-back'), 'Progress');
    await page.click('#bar .app-back'); await page.locator('#reset').waitFor();
    await page.click('#reset'); await sheet().waitFor(); await oneRow('.app-sheet-foot .app-btn-row');
    await page.click('#rdo'); await page.locator('#toast.is-visible').waitFor();
    assert.equal(await page.locator('main a.app-row[href*="?from=progress"]').count(), 0);
    assert.equal(await store('progress'), null);
    await page.locator('#toast.is-visible .app-toast-action', { hasText: 'Undo' }).click();
    await page.waitForFunction(() => document.querySelectorAll('main a.app-row[href*="?from=progress"]').length >= 3);
    assert.equal(await text('#getlatest'), 'Not updating? Get the latest version');
  });

  await step('progress for questions that left the bank is ignored', async () => {
    await page.evaluate(() => {
      const p = JSON.parse(localStorage.getItem('qbank.v1.progress')); p.qgone001 = { n: 5, c: 0, h: [[1, 0]] }; localStorage.setItem('qbank.v1.progress', JSON.stringify(p));
      const f = JSON.parse(localStorage.getItem('qbank.v1.flags')); f.qgone001 = 1; localStorage.setItem('qbank.v1.flags', JSON.stringify(f));
    });
    await page.click('.app-tab[data-tab=practise]'); await page.locator('#quick').waitFor();
    const fl = await store('flags'), want = Object.keys(fl).filter(id => byId.has(id)).length;
    assert.equal(await text('#row-flagged .app-row-value'), String(want));
    await page.goto(BASE + '#/q/qgone001'); await page.locator('.app-empty').waitFor();
    assert.match(await text('.app-empty'), /no longer in the bank/);
  });

  await step('a session keeps its own copy of each question', async () => {
    await page.goto(BASE); await page.locator('#quick').waitFor(); await page.click('#quick'); await page.locator('#navpill').waitFor();
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('qbank.v1.session')); s.items[0].q.stem = 'Snapshot stem from when the session started'; localStorage.setItem('qbank.v1.session', JSON.stringify(s)); });
    await page.reload(); await page.locator('#stem').waitFor();
    assert.equal(await text('#stem'), 'Snapshot stem from when the session started');
    await page.click('#leave'); await page.click('#goaway'); await page.locator('#discard').click();
  });

  await step('desktop width: centred column, axe clean', async () => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(BASE); await page.locator('#quick').waitFor();
    const w = await page.evaluate(() => { const r = document.querySelector('main').getBoundingClientRect(), side = document.querySelector('#tabbar').getBoundingClientRect().right; return { w: r.width, left: r.left - side, right: innerWidth - r.right }; });
    assert.ok(w.w <= 680 && Math.abs(w.left - w.right) <= 2, 'a centred column: ' + JSON.stringify(w));
    await axe('desktop practise');
    await page.goto(BASE + '#/browse'); await page.locator('#find').waitFor(); await axe('desktop browse');
    await page.setViewportSize({ width: 390, height: 844 });
  });

  await step('at 200% zoom (195 px wide) no screen scrolls sideways', async () => {
    const cz = await b.newContext({ viewport: { width: 195, height: 422 }, deviceScaleFactor: 4, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const pz = await cz.newPage();
    await pz.goto(BASE); await pz.locator('#quick').waitFor();
    await pz.evaluate(s => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, await page.evaluate(() => Object.fromEntries(Object.entries(localStorage))));
    for (const h of ['#/practise', '#/browse', '#/papers', '#/paper/babymo', '#/progress', ...ready.map(q => `#/q/${q.id}`)]) {
      await pz.goto(BASE + h); await pz.waitForTimeout(150);
      const w = await pz.evaluate(() => ({ doc: document.documentElement.scrollWidth, main: document.querySelector('main').scrollWidth - document.querySelector('main').clientWidth, vw: innerWidth }));
      assert.ok(w.doc <= w.vw && w.main <= 0, `${h} scrolls sideways at 200%: ${JSON.stringify(w)}`);
    }
    await pz.goto(BASE); await pz.click('#quick'); await pz.locator('#navpill').waitFor();
    const w = await pz.evaluate(() => document.querySelector('main').scrollWidth - document.querySelector('main').clientWidth);
    assert.ok(w <= 0, 'session scrolls sideways at 200%');
    await cz.close();
  });

  assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));

  await step('offline after the first visit', async () => {
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
    const p2 = await c2.newPage();
    const errs = []; p2.on('pageerror', e => errs.push(e.message));
    await p2.goto(BASE); await p2.locator('#quick').waitFor();
    await p2.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 15000 });
    await c2.setOffline(true);
    await p2.reload(); await p2.locator('#quick').waitFor();
    assert.equal(await p2.locator('#offline').isVisible(), true, 'offline pill shows');
    await p2.click('#quick'); await p2.locator('#navpill').waitFor();
    assert.equal(await p2.locator('#navpill').innerText(), 'Q 1/10');
    await p2.locator('.app-choice').first().click(); await p2.locator('dialog[open]').waitFor();
    await p2.goto(BASE + '#/papers'); await p2.locator('main a.app-row[href="#/paper/babymo"]').waitFor();
    const font = await p2.evaluate(async () => { await document.fonts.ready; return document.fonts.check('17px "NTF Sans"'); });
    assert.ok(font, 'the font came from the offline copy');
    await c2.setOffline(false); await c2.close();
    assert.deepEqual(errs, []);
  });
  console.log('qbank e2e: all steps ok');
} catch { /* reported above */ } finally { await b.close(); server.close(); }
