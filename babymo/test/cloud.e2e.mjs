// End-to-end test of the Baby MO portal's CLOUD backend (js/cloud.js + firestore.rules) in a real browser against the
// LOCAL Firebase emulators (Auth + Firestore, demo project, fake accounts). Nothing here touches a live Firebase project.
// Run with babymo/test/run-cloud.sh (it starts the emulators and runs this). The page is served from
// http://localhost:<port>/?emu=1, which makes cloud.js use the emulators (see "TEST ONLY" in js/cloud.js); the real
// Firebase web SDK is loaded from gstatic like in production. Faculty "Google sign-in" is faked by cloud.js's test hook.
//   SHOTS=<dir> saves a screenshot when a step fails.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png' };
const PROJECT = 'demo-moportal', FS_PORT = +(process.env.FS_PORT || 8085), AUTH_PORT = +(process.env.AUTH_PORT || 9099);

// ---- a tiny static server (the emulator host check needs a localhost origin, so no route-served https page) ----
const server = http.createServer((req, res) => {
  let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\//, '');
  if (rel.endsWith('/') || rel === '') rel += 'index.html';
  const f = path.join(root, rel);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': MIME[f.split('.').pop()] || 'application/octet-stream', 'cache-control': 'no-store' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://localhost:${server.address().port}/babymo/`;
const URL_EMU = BASE + '?emu=1';

// ---- the emulator, with the real rules, seeded with security rules off ----
const env = await initializeTestEnvironment({ projectId: PROJECT, firestore: { rules: fs.readFileSync(path.join(root, 'babymo/firestore.rules'), 'utf8'), host: '127.0.0.1', port: FS_PORT } });
const ADMIN = 'admin@example.com', EDITOR = 'editor@example.com', STRANGER = 'stranger@example.com';
const PASS = 'pass1234', NEWPASS = 'newpass-9876';
const by = email => ({ email, name: email.split('@')[0] });
const mkq = (n, extra = {}) => ({ stem: `Seed question ${n}: which option is right?`, options: ['alpha', 'bravo', 'charlie', 'delta'], answer: n % 4, explain: `Because ${n}.`, topic: n % 2 ? 'Drugs' : 'Airway', image: '', status: 'active', rev: 1, updatedAt: 1000 + n, updatedBy: by(EDITOR), ...extra });
async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'members', ADMIN), { role: 'admin', name: 'Admin' });
    await setDoc(doc(db, 'members', EDITOR), { role: 'editor', name: 'Editor' });
    await setDoc(doc(db, 'config', 'access'), { passphrase: PASS });
    await setDoc(doc(db, 'config', 'test'), { title: 'Baby MO test', count: 5, passMark: 60, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: 'Good luck.', updatedAt: 1, updatedBy: by(ADMIN) });
    for (let n = 1; n <= 6; n++) {
      await setDoc(doc(db, 'questions', 'q' + n), mkq(n));
      await setDoc(doc(db, 'questions', 'q' + n, 'history', 'h1'), { ...mkq(n), savedAt: 1000 + n });
    }
    await setDoc(doc(db, 'questions', 'qdraft'), mkq(7, { stem: 'SECRET DRAFT question', status: 'draft' }));
  });
}
const admin = async fn => { let out; await env.withSecurityRulesDisabled(async ctx => { out = await fn(ctx.firestore()); }); return out; };
const docs = (col, ...w) => admin(async db => (await getDocs(w.length ? query(collection(db, col), ...w) : collection(db, col))).docs.map(d => ({ id: d.id, ...d.data() })));
const getD = (...p) => admin(async db => { const s = await getDoc(doc(db, ...p)); return s.exists() ? { id: s.id, ...s.data() } : null; });
const byStem = async stem => (await docs('questions')).find(q => q.stem === stem);

// ---- browser ----
const exe = process.env.CHROMIUM_PATH || (fs.existsSync('/opt/pw-browsers/chromium') && !fs.statSync('/opt/pw-browsers/chromium').isDirectory() ? '/opt/pw-browsers/chromium' : null);
const b = await chromium.launch(exe ? { executablePath: exe, args: ['--no-sandbox'] } : {});
const contexts = [];
const errors = [];
const consoleErrors = new Set();   // printed at the end for information (expected ones: refused reads/writes the test provokes)
async function newCtx(email) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  if (email) await ctx.addInitScript(e => { window.__moTestEmail = e; }, email);   // used by the faculty sign-in button in emulator mode
  contexts.push(ctx);
  return ctx;
}
async function newPage(ctx) {
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') consoleErrors.add(m.text().slice(0, 160)); });
  p.on('dialog', d => d.accept());
  return p;
}
const SHOTS = process.env.SHOTS;
let page = null;
const step = async (name, fn) => {
  try { await fn(); console.log('ok  ', name); }
  catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; if (SHOTS && page) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, 'mo-cloud-fail-' + name.replace(/\W+/g, '-') + '.png'), fullPage: true }).catch(() => {}); } throw e; }
};
const text = (p, sel) => p.locator(sel).innerText();

// MO login on a page: name + passphrase
async function moStart(p, name, pass) {
  await p.goto(URL_EMU); await p.locator('#f-name').waitFor();
  await p.fill('#f-name', name); await p.fill('#f-pass', pass); await p.click('#start button[type=submit]');
}
// answer the drawn questions: `wrong` = how many to get wrong; returns the attempt's items from storage
async function sitTest(p, { wrong = 0, submit = true } = {}) {
  await p.locator('#go').waitFor(); await p.click('#go'); await p.locator('#qform').waitFor();
  const items = await p.evaluate(() => JSON.parse(localStorage.getItem('mo-attempt')).items);
  for (let i = 0; i < items.length; i++) {
    const k = i < items.length - wrong ? items[i].answer : (items[i].answer + 1) % 4;
    await p.locator('.opt').nth(k).click();
    await p.click(i < items.length - 1 ? '#next' : '#review');
  }
  if (submit) { await p.locator('#submit').waitFor(); await p.click('#submit'); await p.locator('dialog[open]').waitFor(); await p.click('dialog button[value=yes]'); }
  return items;
}
// wait until the editor's question box starts with `prefix` (dump the page if it never does)
async function stemIs(p, prefix) {
  await p.waitForFunction(x => document.querySelector('#stem')?.value.startsWith(x), prefix, { timeout: 10000 })
    .catch(async e => { throw new Error(`editor never showed "${prefix}". Page: ` + (await p.evaluate(() => document.querySelector('#app').innerText.slice(0, 300))).replace(/\s+/g, ' ')); });
}
// faculty page signed in with a fake Google account
async function facultyPage(ctx, hash = '#/faculty') {
  const p = await newPage(ctx);
  await p.goto(URL_EMU + hash);
  return p;
}
async function facultySignIn(p) {
  await p.locator('#in').waitFor(); await p.click('#in');
  await p.locator('#nav a', { hasText: 'Results' }).waitFor();
}
const toastText = async (p, re) => p.waitForFunction(r => new RegExp(r).test(document.querySelector('#toast')?.textContent || ''), re.source, { timeout: 10000 });
async function fillQuestion(p, { stem, options, answer, status, topic }) {
  await p.locator('#stem').waitFor();
  await p.fill('#stem', stem);
  if (options) for (let k = 0; k < 4; k++) await p.fill('#opt' + k, options[k]);
  if (answer != null) await p.click(`label[for=ans${answer}]`);
  if (topic) await p.fill('#topic', topic);
  if (status) await p.selectOption('#status', status);
}

try {
  await seed();

  // ================= MOs =================
  const moCtx = await newCtx();
  page = await newPage(moCtx);
  let firstAttempt, myName = 'Dr Test Person';

  await step('cloud mode is on (no demo banner) and the SDK loaded', async () => {
    await page.goto(URL_EMU); await page.locator('#f-name').waitFor();
    assert.equal(await page.locator('.demo').count(), 0, 'demo banner shown: cloud.js is not enabled');
    assert.equal(await page.evaluate(() => typeof window.__moTestSignIn), 'function');
  });
  await step('wrong passphrase is refused', async () => {
    await moStart(page, myName, 'wrong-pass');
    await page.locator('#start-err:not([hidden])').waitFor();
    assert.match(await text(page, '#start-err'), /passphrase is not right/);
    assert.equal((await docs('sessions')).length, 0, 'a session was created with a wrong passphrase');
  });
  await step('right passphrase: ready screen with settings from Firestore', async () => {
    await page.fill('#f-pass', PASS); await page.click('#start button[type=submit]');
    await page.locator('#go').waitFor();
    const t = await text(page, '#app');
    assert.match(t, /5 questions/); assert.match(t, /10<\/?b?>? ?minutes|10\s+minutes/); assert.match(t, /Pass mark\s*60%/); assert.match(t, /Good luck/);
    const ss = await docs('sessions'); assert.equal(ss.length, 1); assert.equal(ss[0].name, myName); assert.equal(ss[0].pass, PASS);
  });
  await step('an MO cannot see drafts, the passphrase or other people\'s data', async () => {
    const r = await page.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js');
      const out = {};
      out.active = (await c.listQuestions({ activeOnly: true })).map(q => q.stem);
      for (const [k, fn] of Object.entries({ all: () => c.listQuestions(), pass: () => c.getPassphrase(), members: () => c.listMembers(), attempts: () => c.listAttempts(), role: () => c.memberRole('admin@example.com'), hist: () => c.listHistory('q1') })) {
        try { await fn(); out[k] = 'allowed'; } catch (e) { out[k] = e.code; }
      }
      return out;
    });
    assert.equal(r.active.length, 6); assert.ok(!r.active.some(s => /SECRET DRAFT/.test(s)), 'draft leaked to an MO');
    for (const k of ['all', 'pass', 'members', 'attempts', 'role', 'hist']) assert.equal(r[k], 'permission', k + ' should be refused for an MO, got ' + r[k]);
  });
  await step('run the test, submit: attempt saved in Firestore with the right score, no draft in it', async () => {
    const items = await sitTest(page, { wrong: 1 });
    await page.locator('#saved.ok').waitFor({ timeout: 15000 });
    assert.match(await text(page, '#saved'), /Saved/);
    assert.match(await text(page, '.score'), /4\s*\/\s*5/);
    const as = await docs('attempts'); assert.equal(as.length, 1);
    const a = firstAttempt = as[0];
    assert.equal(a.score, 4); assert.equal(a.total, 5); assert.equal(a.pass, true); assert.equal(a.name, myName);
    assert.equal(a.cohort, 'Oct 2026'); assert.deepEqual(a.settings, { count: 5, passMark: 60, minutes: 10 });
    assert.equal(a.items.length, 5); assert.ok(!a.items.some(i => /SECRET DRAFT/.test(i.stem)));
    assert.equal(a.items.filter(i => i.picked === i.answer).length, 4);
    assert.deepEqual(a.items.map(i => i.qid).sort(), items.map(i => i.qid).sort());
    const ss = await docs('sessions'); assert.equal(a.uid, ss[0].id, 'attempt uid is the session uid');
    // the MO can read back their own attempt but nobody else's
    await admin(db => setDoc(doc(db, 'attempts', 'someone-else'), { ...a, uid: 'other-uid', name: 'Someone else' }));
    const r = await page.evaluate(async uid => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      try { await c.listAttempts(); out.list = 'allowed'; } catch (e) { out.list = e.code; }
      return out;
    });
    assert.equal(r.list, 'permission');
    await admin(async db => { const { deleteDoc } = await import('firebase/firestore'); await deleteDoc(doc(db, 'attempts', 'someone-else')); });
  });
  await step('re-submitting the same attempt id is harmless (no duplicate, no error)', async () => {
    const r = await page.evaluate(async att => {
      const c = await import('/babymo/js/cloud.js');
      try { const x = await c.submitAttempt({ ...att, id: att.id }); return { ok: true, id: x.id }; } catch (e) { return { ok: false, code: e.code }; }
    }, firstAttempt);
    assert.equal(r.ok, true, JSON.stringify(r)); assert.equal(r.id, firstAttempt.id);
    assert.equal((await docs('attempts')).length, 1);
  });

  // ================= faculty =================
  const facCtx = await newCtx(ADMIN);
  page = await facultyPage(facCtx);
  let ids = {};
  await step('faculty gate, then Google sign-in as admin', async () => {
    await page.locator('#in').waitFor(); assert.match(await text(page, '#app'), /Sign in with Google/);
    await facultySignIn(page);
    assert.ok(await page.locator('#nav a', { hasText: 'Settings' }).count(), 'admin should see Settings');
    await page.locator('.qlist').waitFor();
    const t = await text(page, '#app'); assert.match(t, /6\b.*ready for the test/s);
    assert.match(t, /Seed question 1/); assert.match(t, /SECRET DRAFT/);   // faculty see the draft
  });
  await step('create an unfinished question as a draft', async () => {
    await page.goto(URL_EMU + '#/faculty/q/new');
    await fillQuestion(page, { stem: 'Draft only: half written question', status: 'draft' });
    await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#qf button[type=submit]'); await toastText(page, /Saved/);
    const q = await byStem('Draft only: half written question');
    assert.ok(q); assert.equal(q.status, 'draft'); assert.equal(q.rev, 1); assert.equal(q.answer, -1); assert.equal(q.updatedBy.email, ADMIN);
    assert.equal((await docs(`questions/${q.id}/history`)).length, 1); ids.draft = q.id;
  });
  await step('an incomplete question cannot be saved as active (client check)', async () => {
    await page.goto(URL_EMU + '#/faculty/q/new');
    await fillQuestion(page, { stem: 'Not finished', status: 'active' });
    await page.click('#qf button[type=submit]');
    await page.locator('#qerr:not([hidden])').waitFor();
    assert.equal(await byStem('Not finished'), undefined);
  });
  await step('create a complete question as active', async () => {
    await page.goto(URL_EMU + '#/faculty/q/new');
    await fillQuestion(page, { stem: 'New active: which is the antidote to heparin?', options: ['Protamine', 'Vitamin K', 'Naloxone', 'Flumazenil'], answer: 0, status: 'active', topic: 'Drugs' });
    await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#qf button[type=submit]'); await toastText(page, /in the test/);
    const q = await byStem('New active: which is the antidote to heparin?');
    assert.ok(q); assert.equal(q.status, 'active'); assert.equal(q.answer, 0); assert.equal(q.rev, 1); ids.active = q.id;
  });
  await step('edit twice: rev 3, three history entries', async () => {
    for (const [n, stem] of [[2, 'New active (edit 1): which is the antidote to heparin?'], [3, 'New active (edit 2): which is the antidote to heparin?']]) {
      await page.goto(URL_EMU + '#/faculty/q/' + ids.active); await page.locator('#stem').waitFor();
      await page.waitForFunction(() => document.querySelector('#stem').value.startsWith('New active'));
      await page.fill('#stem', stem); await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#qf button[type=submit]'); await toastText(page, /Saved/);
      const q = await getD('questions', ids.active); assert.equal(q.rev, n); assert.equal(q.stem, stem);
    }
    const h = await docs(`questions/${ids.active}/history`); assert.equal(h.length, 3); assert.deepEqual(h.map(x => x.rev).sort(), [1, 2, 3]);
    // the history panel in the editor lists them
    await page.goto(URL_EMU + '#/faculty/q/' + ids.active); await page.locator('#hist summary').click();
    await page.waitForFunction(() => document.querySelectorAll('#histbody li').length === 3);
  });
  await step('two tabs: stale revision shows the conflict dialog; keep mine saves on top', async () => {
    const A = page, B = await newPage(facCtx);
    await A.goto(URL_EMU + '#/faculty/q/' + ids.active); await stemIs(A, 'New active (edit 2)');
    await B.goto(URL_EMU + '#/faculty/q/' + ids.active); await stemIs(B, 'New active (edit 2)');
    await B.fill('#stem', 'Tab B wins: which is the antidote to heparin?'); await B.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await B.click('#qf button[type=submit]'); await toastText(B, /Saved/);
    assert.equal((await getD('questions', ids.active)).rev, 4);
    await A.fill('#stem', 'Tab A mine: which is the antidote to heparin?'); await A.click('#qf button[type=submit]');
    await A.locator('dialog[open]').waitFor();
    assert.match(await text(A, 'dialog'), /Someone else saved this question first/);
    assert.equal((await getD('questions', ids.active)).stem.startsWith('Tab B wins'), true, 'A must not have overwritten B yet');
    await A.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await A.click('dialog button[value=yes]'); await toastText(A, /Saved/);
    const q = await getD('questions', ids.active); assert.equal(q.stem.startsWith('Tab A mine'), true); assert.equal(q.rev, 5);
    assert.equal((await docs(`questions/${ids.active}/history`)).length, 5, "B's version is kept in the history");
    // and the other way: choose "load theirs"
    await B.goto(URL_EMU + '#/faculty/q/' + ids.active); await B.reload(); await stemIs(B, 'Tab A mine');
    await A.goto(URL_EMU + '#/faculty/q/' + ids.active); await stemIs(A, 'Tab A mine');
    await B.fill('#stem', 'Tab B again: which is the antidote to heparin?'); await B.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await B.click('#qf button[type=submit]'); await toastText(B, /Saved/);
    await A.fill('#stem', 'Tab A loses: which is the antidote to heparin?'); await A.click('#qf button[type=submit]');
    await A.locator('dialog[open]').waitFor(); await A.click('dialog button[value=no]');
    await stemIs(A, 'Tab B again');
    const q2 = await getD('questions', ids.active); assert.equal(q2.stem.startsWith('Tab B again'), true); assert.equal(q2.rev, 6);
    await B.close();
  });
  await step('paste many: complete ones become active, the one without an answer stays a draft', async () => {
    await page.goto(URL_EMU + '#/faculty/paste'); await page.locator('#paste').waitFor();
    await page.fill('#paste', `Q1 Which drug is first-line for anaphylaxis?
A) Adrenaline
B) Hydrocortisone
C) Chlorphenamine
D) Salbutamol
Answer: A
Explanation: Adrenaline first, always.

Q2 Which gas is used for inhalational induction in children?
A) Desflurane
B) Sevoflurane
C) Isoflurane
D) Nitrogen
Answer: B

Q3 A pasted question with no answer given?
A) one
B) two
C) three
D) four`);
    await page.click('#read'); await page.locator('#addall').waitFor();
    await page.selectOption('#as', 'active'); await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#addall'); await toastText(page, /3 added/);
    const a = await byStem('Which drug is first-line for anaphylaxis?'), b2 = await byStem('Which gas is used for inhalational induction in children?'), c = await byStem('A pasted question with no answer given?');
    assert.ok(a && b2 && c); assert.equal(a.status, 'active'); assert.equal(a.answer, 0); assert.equal(a.explain, 'Adrenaline first, always.');
    assert.equal(b2.status, 'active'); assert.equal(b2.answer, 1); assert.equal(c.status, 'draft'); assert.equal(c.answer, -1);
    for (const q of [a, b2, c]) { assert.equal(q.rev, 1); assert.equal((await docs(`questions/${q.id}/history`)).length, 1); }
  });
  await step('CSV import: updates an existing question (rev+1, history kept) and adds a new one', async () => {
    await page.goto(URL_EMU + '#/faculty/data'); await page.locator('#csvup').waitFor();
    const csv = 'id,status,topic,question,A,B,C,D,answer,explanation\r\n'
      + 'q1,active,Airway,"Seed question 1 EDITED, with a comma",alpha,bravo,charlie,delta,C,Updated by CSV\r\n'
      + ',active,Drugs,CSV new question: which is a vasopressor?,Noradrenaline,Propofol,Rocuronium,Neostigmine,A,\r\n';
    await page.setInputFiles('#csvup', { name: 'q.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await page.locator('#doimp').waitFor();
    assert.match(await text(page, '#out'), /1\s*new question.*1\s*existing one will be updated/s);
    await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#doimp'); await toastText(page, /Done/);
    const q1 = await getD('questions', 'q1'); assert.equal(q1.stem, 'Seed question 1 EDITED, with a comma'); assert.equal(q1.answer, 2); assert.equal(q1.rev, 2); assert.equal(q1.topic, 'Airway');
    assert.equal((await docs('questions/q1/history')).length, 2);
    const n = await byStem('CSV new question: which is a vasopressor?'); assert.ok(n); assert.equal(n.status, 'active'); assert.equal(n.answer, 0);
  });
  await step('delete a question (admin) leaves its history', async () => {
    await page.goto(URL_EMU + '#/faculty/q/' + ids.draft); await page.locator('#del').waitFor();
    await page.click('#del'); await page.locator('dialog[open]').waitFor(); await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('dialog button[value=yes]'); await toastText(page, /Deleted/);
    assert.equal(await getD('questions', ids.draft), null); assert.equal((await docs(`questions/${ids.draft}/history`)).length, 1);
  });
  await step('results page lists the MO\'s attempt; attempt page shows the answers', async () => {
    await page.goto(URL_EMU + '#/faculty/results'); await page.locator('table').waitFor();
    const t = await text(page, 'table'); assert.match(t, /Dr Test Person/); assert.match(t, /4\/5/); assert.match(t, /pass/i); assert.match(t, /Oct 2026/);
    await page.click('table a'); await page.locator('.review').waitFor();
    assert.equal(await page.locator('.review li').count(), 5);
    await page.goto(URL_EMU + '#/faculty/results?by=question'); await page.locator('table').waitFor();
    assert.ok(await page.locator('table tbody tr').count() >= 5);
  });
  await step('settings: save (admin), members list, add and remove a faculty member', async () => {
    await page.goto(URL_EMU + '#/faculty/settings'); await page.locator('#sf').waitFor();
    assert.equal(await page.inputValue('#p-pass'), PASS);
    await page.fill('#s-cohort', 'Nov 2026 intake'); await page.selectOption('#s-review', 'marks'); await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#sf button[type=submit]'); await toastText(page, /Saved/);
    const s = await getD('config', 'test'); assert.equal(s.cohort, 'Nov 2026 intake'); assert.equal(s.review, 'marks'); assert.equal(s.updatedBy.email, ADMIN); assert.equal(s.count, 5);
    await page.locator('#sf').waitFor();
    await page.fill('#m-email', 'New.Person@Example.com'); await page.fill('#m-name', 'New Person'); await page.click('#mf button[type=submit]');
    await page.locator('.members li', { hasText: 'new.person@example.com' }).waitFor();
    assert.deepEqual(await getD('members', 'new.person@example.com'), { id: 'new.person@example.com', role: 'editor', name: 'New Person' });
    await page.locator('.members li', { hasText: 'new.person@example.com' }).locator('[data-rm]').click();
    await page.locator('dialog[open]').waitFor(); await page.click('dialog button[value=yes]');
    await page.waitForFunction(() => !document.querySelector('.members')?.textContent.includes('new.person@example.com'));
    assert.equal(await getD('members', 'new.person@example.com'), null);
  });

  // an editor (not admin) sees no Settings and cannot read the passphrase
  await step('editor role: no Settings page, cannot read the passphrase, delete questions or save settings', async () => {
    const ctx = await newCtx(EDITOR); const p = await facultyPage(ctx); await facultySignIn(p);
    assert.equal(await p.locator('#nav a', { hasText: 'Settings' }).count(), 0);
    const r = await p.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      try { await c.getPassphrase(); out.pass = 'allowed'; } catch (e) { out.pass = e.code; }
      try { await c.deleteQuestion('q2'); out.del = 'allowed'; } catch (e) { out.del = e.code; }
      try { await c.saveSettings({ title: 'x' }, { email: 'editor@example.com', name: 'e' }); out.set = 'allowed'; } catch (e) { out.set = e.code; }
      return out;
    });
    assert.deepEqual(r, { pass: 'permission', del: 'permission', set: 'permission' });
    await p.close();
  });

  // ================= a Google account that is not on the list =================
  await step('non-member Google account sees "not on the faculty list" and no data', async () => {
    const ctx = await newCtx(STRANGER); const p = await facultyPage(ctx); page = p;
    await p.locator('#in').waitFor(); await p.click('#in');
    await p.locator('#out').waitFor();
    assert.match(await text(p, '#app'), /not on the faculty list/);
    assert.equal(await p.locator('#nav a', { hasText: 'Results' }).count(), 0);
    const r = await p.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      for (const [k, fn] of Object.entries({ q: () => c.listQuestions(), a: () => c.listAttempts(), m: () => c.listMembers(), s: () => c.getSettings() })) { try { await fn(); out[k] = 'allowed'; } catch (e) { out[k] = e.code; } }
      return out;
    });
    assert.deepEqual(r, { q: 'permission', a: 'permission', m: 'permission', s: 'permission' });
    // and they cannot make themselves a member
    const w = await p.evaluate(async () => { const c = await import('/babymo/js/cloud.js'); try { await c.saveMember('stranger@example.com', { role: 'admin', name: 'me' }); return 'allowed'; } catch (e) { return e.code; } });
    assert.equal(w, 'permission'); assert.equal(await getD('members', STRANGER), null);
    await p.click('#out'); await p.locator('#in').waitFor();   // sign out returns to the gate
  });

  // ================= change the passphrase =================
  await step('changing the passphrase locks old sessions out of new tests; the new passphrase works', async () => {
    page = await newPage(facCtx);   // faculty again (still signed in in facCtx)
    await page.goto(URL_EMU + '#/faculty/settings'); await page.locator('#pf').waitFor();
    await page.fill('#p-pass', NEWPASS); await page.evaluate(() => { document.querySelector('#toast').textContent = ''; }); await page.click('#pf button[type=submit]'); await toastText(page, /Passphrase saved/);
    assert.equal((await getD('config', 'access')).passphrase, NEWPASS);
    // the earlier MO (context 1) is still signed in, but their session no longer matches
    const mo = moCtx.pages()[0]; page = mo;
    const r = await mo.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      out.has = await c.hasSession();
      try { await c.getSettings(); out.settings = 'allowed'; } catch (e) { out.settings = e.code; }
      try { await c.listQuestions({ activeOnly: true }); out.qs = 'allowed'; } catch (e) { out.qs = e.code; }
      return out;
    });
    assert.deepEqual(r, { has: false, settings: 'permission', qs: 'permission' });
    // they try to start a new test with the old passphrase: refused
    await moStart(mo, myName, PASS);
    await mo.locator('#start-err:not([hidden])').waitFor(); assert.match(await text(mo, '#start-err'), /passphrase is not right/);
    // a fresh MO with the new passphrase gets in
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Fresh Start', NEWPASS); await p.locator('#go').waitFor();
    assert.match(await text(p, '#app'), /5 questions/);
    await p.close();
    // the same MO (context 1) with the new passphrase, too
    await mo.fill('#f-pass', NEWPASS); await mo.click('#start button[type=submit]'); await mo.locator('#go').waitFor();
    assert.equal((await docs('sessions')).length, 3);
  });
  let curPass = NEWPASS;
  await step('a stale session cannot submit a finished test; signing in again with the new passphrase saves it', async () => {
    const before = (await docs('attempts')).length;
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Locked Out', curPass); await sitTest(p, { submit: false });   // sit the test, stop on the review screen
    curPass = 'rotated-again-1';
    await admin(db => setDoc(doc(db, 'config', 'access'), { passphrase: curPass }));   // faculty rotate the passphrase mid-test
    await p.click('#submit'); await p.locator('dialog[open]').waitFor(); await p.click('dialog button[value=yes]');
    await p.waitForFunction(() => /login has expired/.test(document.querySelector('#saved')?.textContent || ''), null, { timeout: 15000 });
    assert.equal((await docs('attempts')).length, before);
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox')).length), 1, 'result kept in the outbox');
    // recovery: back to the start, log in again with the new passphrase: the waiting result is sent under the new login
    await p.click('#done'); await p.locator('#f-name').waitFor();
    await p.fill('#f-pass', curPass); await p.click('#start button[type=submit]'); await p.locator('#go').waitFor();
    await p.waitForFunction(() => JSON.parse(localStorage.getItem('mo-outbox') || '[]').length === 0, null, { timeout: 15000 });
    const as = await docs('attempts', where('name', '==', 'Dr Locked Out')); assert.equal(as.length, 1);
    const ss = await docs('sessions', where('name', '==', 'Dr Locked Out')); assert.equal(ss.length, 2);
    assert.ok(ss.some(x => x.id === as[0].uid), 'saved under the new login');
  });
  await step('reload in the middle of a test, then submit: saved under the same name', async () => {
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Reloader', curPass); await p.locator('#go').waitFor(); await p.click('#go'); await p.locator('#qform').waitFor();
    await p.locator('.opt').nth(0).click();
    await p.reload(); await p.locator('#qform').waitFor();
    await p.click('#rv'); await p.locator('#submit').waitFor(); await p.click('#submit'); await p.locator('dialog[open]').waitFor(); await p.click('dialog button[value=yes]');
    await p.locator('#saved.ok').waitFor({ timeout: 15000 });
    const as = await docs('attempts', where('name', '==', 'Dr Reloader')); assert.equal(as.length, 1); assert.equal(as[0].items.length, 5);
    assert.equal(as[0].items.filter(i => i.picked != null).length, 1);
  });

  // ================= offline outbox =================
  for (const [label, offlineMs] of [['reconnect quickly', 1500], ['reconnect after the 20 s write timeout', 22000]]) {
    await step(`offline outbox: submit with no network, ${label}: saved once`, async () => {
      const name = 'Dr Offline ' + (offlineMs > 5000 ? 'Slow' : 'Quick');
      const ctx = await newCtx(); const p = await newPage(ctx); page = p;
      await moStart(p, name, curPass);
      await sitTest(p, { submit: false });
      await p.waitForFunction(() => !!document.querySelector('#submit'));
      await ctx.setOffline(true);
      await p.click('#submit'); await p.locator('dialog[open]').waitFor(); await p.click('dialog button[value=yes]');
      await p.locator('.score').waitFor();
      assert.equal((await docs('attempts', where('name', '==', name))).length, 0, 'nothing can be saved while offline');
      assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox')).length), 1);
      await p.waitForTimeout(offlineMs);
      await ctx.setOffline(false);
      await p.locator('#saved.ok').waitFor({ timeout: 40000 });
      await p.waitForTimeout(1500);   // let any queued duplicate write settle
      const as = await docs('attempts', where('name', '==', name));
      assert.equal(as.length, 1, `expected exactly one saved attempt, got ${as.length}`);
      assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox')).length), 0, 'outbox emptied');
      assert.equal(as[0].items.length, 5);
    });
  }
  await step('no uncaught page errors', async () => { assert.deepEqual(errors, []); });
  if (consoleErrors.size) console.log('\n(browser console errors seen, for information):\n  ' + [...consoleErrors].join('\n  '));
  console.log('\nAll cloud checks passed.');
} catch (e) {
  process.exitCode = 1;
  if (errors.length) console.error('page errors:', errors);
} finally {
  await b.close().catch(() => {});
  server.close();
  await env.cleanup().catch(() => {});
  process.exit(process.exitCode || 0);
}
