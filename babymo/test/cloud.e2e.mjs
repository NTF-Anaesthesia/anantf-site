// End-to-end test of the Baby MO test's CLOUD backend (js/cloud.js + firestore.rules) in a real browser against the
// LOCAL Firebase emulators (Auth + Firestore, demo project, fake accounts). Nothing here touches a live Firebase project.
// Run with babymo/test/run-cloud.sh (it starts the emulators and runs this). The page is served from
// http://localhost:<port>/?emu=1, which makes cloud.js use the emulators (see "TEST ONLY" in js/cloud.js); the real
// Firebase web SDK is loaded from gstatic like in production. Faculty "Google sign-in" is faked by cloud.js's test hook.
// The questions come from this checkout's question bank (qbank/), as in production; Firebase holds only sign-in,
// settings and results.
//   SHOTS=<dir> saves a screenshot when a step fails.
const { chromium } = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.mjs');
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, setDoc, query, where } from 'firebase/firestore';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { resolvePaper } from '../../qbank/js/bank.js';

const root = new URL('../../', import.meta.url).pathname;
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', json: 'application/json', png: 'image/png', woff2: 'font/woff2', webmanifest: 'application/manifest+json' };
const PROJECT = 'demo-moportal', FS_PORT = +(process.env.FS_PORT || 8085), AUTH_PORT = +(process.env.AUTH_PORT || 9099);
const BANK = JSON.parse(fs.readFileSync(path.join(root, 'qbank/bank/questions.json'), 'utf8'));
const PAPER = JSON.parse(fs.readFileSync(path.join(root, 'qbank/papers/babymo.json'), 'utf8'));
const { pool: POOL } = resolvePaper(PAPER, BANK.questions);

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
async function seed() {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async ctx => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'members', ADMIN), { role: 'admin', name: 'Admin' });
    await setDoc(doc(db, 'members', EDITOR), { role: 'editor', name: 'Editor' });
    await setDoc(doc(db, 'config', 'access'), { passphrase: PASS });
    await setDoc(doc(db, 'config', 'test'), { title: 'Baby MO test', count: 5, passMark: 60, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: 'Good luck.', updatedAt: 1, updatedBy: by(ADMIN) });
  });
}
const admin = async fn => { let out; await env.withSecurityRulesDisabled(async ctx => { out = await fn(ctx.firestore()); }); return out; };
const docs = (col, ...w) => admin(async db => (await getDocs(w.length ? query(collection(db, col), ...w) : collection(db, col))).docs.map(d => ({ id: d.id, ...d.data() })));
const getD = (...p) => admin(async db => { const s = await getDoc(doc(db, ...p)); return s.exists() ? { id: s.id, ...s.data() } : null; });

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
  catch (e) { console.error('FAIL', name, '\n', e.message); process.exitCode = 1; if (SHOTS && page) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, 'mo-cloud-fail-' + name.replace(/\W+/g, '-') + '.png') }).catch(() => {}); } throw e; }
};
const text = (p, sel) => p.locator(sel).first().innerText();
const tab = (p, label) => p.locator('#tabs .tab', { hasText: label });

// MO login on a page: name + passphrase
async function moStart(p, name, pass) {
  await p.goto(URL_EMU); await p.locator('#f-name').waitFor();
  await p.fill('#f-name', name); await p.fill('#f-pass', pass); await p.click('#start-go');
}
// answer the drawn questions: `wrong` = how many to get wrong; submit or stop on the last question. Returns the items.
async function sitTest(p, { wrong = 0, submit = true } = {}) {
  await p.locator('#go').waitFor(); await p.click('#go'); await p.locator('#stem').waitFor();
  const items = await p.evaluate(() => JSON.parse(localStorage.getItem('mo-attempt')).items);
  for (let i = 0; i < items.length; i++) {
    const k = i < items.length - wrong ? items[i].answer : (items[i].answer + 1) % items[i].options.length;
    await p.locator('.choice').nth(k).click();
    if (i < items.length - 1) await p.click('#next');
  }
  if (submit) await submitNow(p);
  return items;
}
async function submitNow(p) { await p.locator('#finish').waitFor(); await p.click('#finish'); await p.locator('#submit').waitFor(); await p.click('#submit'); await p.locator('#score').waitFor(); }
// faculty page signed in with a fake Google account
async function facultyPage(ctx, hash = '#/faculty') {
  const p = await newPage(ctx);
  await p.goto(URL_EMU + hash);
  return p;
}
async function facultySignIn(p) {
  await p.locator('#in').waitFor(); await p.click('#in');
  await tab(p, 'Results').waitFor();
}
const toastText = async (p, re) => p.waitForFunction(r => new RegExp(r).test(document.querySelector('#toast.on')?.textContent || ''), re.source, { timeout: 10000 });

try {
  await seed();

  // ================= MOs =================
  const moCtx = await newCtx();
  page = await newPage(moCtx);
  let firstAttempt, myName = 'Dr Test Person';

  await step('cloud mode is on (no demo pill) and the SDK loaded', async () => {
    await page.goto(URL_EMU); await page.locator('#f-name').waitFor();
    assert.equal(await page.locator('.pill.demo').count(), 0, 'demo pill shown: cloud.js is not enabled');
    assert.equal(await page.evaluate(() => typeof window.__moTestSignIn), 'function');
  });
  await step('wrong passphrase is refused', async () => {
    await moStart(page, myName, 'wrong-pass');
    await page.locator('#start-err:not([hidden])').waitFor();
    assert.match(await text(page, '#start-err'), /passphrase is not right/);
    assert.equal((await docs('sessions')).length, 0, 'a session was created with a wrong passphrase');
  });
  await step('right passphrase: ready screen with settings from Firestore and questions from the bank', async () => {
    await page.fill('#f-pass', PASS); await page.click('#start-go');
    await page.locator('#go').waitFor();
    assert.equal(await text(page, '#ready-sum'), '5 questions · 10 minutes · pass 60% · attempt 1 of 2');
    assert.match(await text(page, '#app'), /Good luck/);
    const ss = await docs('sessions'); assert.equal(ss.length, 1); assert.equal(ss[0].name, myName); assert.equal(ss[0].pass, PASS);
  });
  await step('an MO cannot see the passphrase or other people\'s data', async () => {
    const r = await page.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js');
      const out = {};
      for (const [k, fn] of Object.entries({ pass: () => c.getPassphrase(), members: () => c.listMembers(), attempts: () => c.listAttempts(), role: () => c.memberRole('admin@example.com'), counts: () => c.listAttemptCounts(), set: () => c.setAttemptCount('oct2026__someone', 0) })) {
        try { await fn(); out[k] = 'allowed'; } catch (e) { out[k] = e.code; }
      }
      out.settings = (await c.getSettings()).cohort;
      return out;
    });
    for (const k of ['pass', 'members', 'attempts', 'role', 'counts', 'set']) assert.equal(r[k], 'permission', k + ' should be refused for an MO, got ' + r[k]);
    assert.equal(r.settings, 'Oct 2026', 'an MO with a session reads the settings');
  });
  await step('run the test, submit: attempt saved with the right score and a snapshot of each bank question', async () => {
    const items = await sitTest(page, { wrong: 1 });
    await page.locator('#saved.ok').waitFor({ timeout: 15000 });
    assert.match(await text(page, '#saved'), /Saved/i);
    assert.match(await text(page, '#score'), /4 of 5 right/);
    const as = await docs('attempts'); assert.equal(as.length, 1);
    const a = firstAttempt = as[0];
    assert.equal(a.score, 4); assert.equal(a.total, 5); assert.equal(a.pass, true); assert.equal(a.name, myName); assert.equal(a.attemptNo, 1);
    assert.equal(a.cohort, 'Oct 2026'); assert.deepEqual(a.settings, { count: 5, passMark: 60, minutes: 10 });
    assert.equal(a.items.length, 5); assert.equal(a.items.filter(i => i.picked === i.answer).length, 4);
    assert.deepEqual(a.items.map(i => i.qid).sort(), items.map(i => i.qid).sort());
    for (const it of a.items) {
      const q = POOL.find(x => x.id === it.qid); assert.ok(q, 'qid is a ready bank question: ' + it.qid);
      assert.equal(it.stem, q.stem); assert.deepEqual(it.options, q.options); assert.equal(it.answer, q.answer);
      assert.deepEqual(Object.keys(it).sort(), ['answer', 'explain', 'options', 'picked', 'qid', 'stem', 'topic']);
    }
    const ss = await docs('sessions'); assert.equal(a.uid, ss[0].id, 'attempt uid is the session uid');
    assert.equal((await getD('attemptCounts', 'oct2026__drtestperson')).n, 1, 'the attempt was counted at Begin');
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
  await step('faculty gate, then Google sign-in as admin: Results by person', async () => {
    await page.locator('#in').waitFor(); assert.match(await text(page, '#app'), /Sign in with Google/);
    await facultySignIn(page);
    await page.locator('#byperson').waitFor();
    assert.match(await text(page, '#byperson'), /Dr Test Person/); assert.match(await text(page, '#byperson'), /Best 4\/5/);
    assert.equal(await page.locator('#tabs .tab').count(), 4);
  });
  await step('a person, their attempt, results by question, the paper', async () => {
    await page.click('#byperson .row-link'); await page.locator('#used').waitFor(); assert.match(await text(page, '#used'), /1 of 2/);
    await page.click('#app .list .row-link >> nth=0'); await page.locator('#att-items').waitFor();
    assert.equal(await page.locator('#att-items li').count(), 5);
    await page.goto(URL_EMU + '#/faculty/results?by=question'); await page.locator('#byquestion').waitFor();
    assert.equal(await page.locator('#byquestion li').count(), 5);
    await tab(page, 'Paper').click(); await page.locator('#paper-ready').waitFor();
    assert.equal(await page.locator('#paper-ready li').count(), POOL.length);
    assert.match(await text(page, '#paper-sum'), /5 questions/, 'the per-sitting count comes from the Firebase settings');
  });
  await step('settings (admin): save cohort and review mode; People: add and remove a faculty member', async () => {
    await page.goto(URL_EMU + '#/faculty/settings'); await page.locator('#sf').waitFor();
    assert.equal(await page.inputValue('#s-pass'), PASS); assert.equal(await text(page, '#s-count'), '5');
    await page.fill('#s-cohort', 'Nov 2026 intake'); await page.click('.seg-opt:has-text("Right or wrong")');
    await page.click('#save'); await toastText(page, /Settings saved/);
    const s = await getD('config', 'test'); assert.equal(s.cohort, 'Nov 2026 intake'); assert.equal(s.review, 'marks'); assert.equal(s.updatedBy.email, ADMIN); assert.equal(s.count, 5); assert.equal(s.passMark, 60); assert.equal(s.minutes, 10);
    assert.equal((await getD('config', 'access')).passphrase, PASS, 'an unchanged passphrase is not rewritten');
    await page.goto(URL_EMU + '#/faculty/people'); await page.locator('#mf').waitFor();
    await page.fill('#m-email', 'New.Person@Example.com'); await page.fill('#m-name', 'New Person'); await page.click('#mf button[type=submit]');
    await page.locator('#mem li', { hasText: 'new.person@example.com' }).first().waitFor();
    assert.deepEqual(await getD('members', 'new.person@example.com'), { id: 'new.person@example.com', role: 'editor', name: 'New Person' });
    await page.locator('#mem li', { hasText: 'new.person@example.com' }).locator('[data-rm]').click();
    await page.locator('dialog.sheet [data-yes]').click();
    await page.waitForFunction(() => !document.querySelector('#mem')?.textContent.includes('new.person@example.com'));
    assert.equal(await getD('members', 'new.person@example.com'), null);
    await page.goto(URL_EMU + '#/faculty/settings'); await page.locator('#sf').waitFor();   // back to the intake's settings for the next MOs
    await page.fill('#s-cohort', 'Oct 2026'); await page.click('.seg-opt:has-text("Full review")'); await page.click('#save'); await toastText(page, /Settings saved/);
  });

  // an editor (not admin) sees no settings form and cannot read the passphrase
  await step('editor role: no settings form, cannot read the passphrase, save settings or delete results', async () => {
    const ctx = await newCtx(EDITOR); const p = await facultyPage(ctx); await facultySignIn(p);
    await tab(p, 'Settings').click(); await p.locator('#signout').waitFor();
    assert.equal(await p.locator('#sf').count(), 0); assert.match(await text(p, '#app'), /Only admins/);
    const r = await p.evaluate(async id => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      try { await c.getPassphrase(); out.pass = 'allowed'; } catch (e) { out.pass = e.code; }
      try { await c.saveSettings({ title: 'x' }, { email: 'editor@example.com', name: 'e' }); out.set = 'allowed'; } catch (e) { out.set = e.code; }
      try { await c.deleteAttempt(id); out.del = 'allowed'; } catch (e) { out.del = e.code; }
      return out;
    }, firstAttempt.id);
    assert.deepEqual(r, { pass: 'permission', set: 'permission', del: 'permission' });
    await p.close();
  });

  // ================= a Google account that is not on the list =================
  await step('non-member Google account sees "not faculty yet" and no data', async () => {
    const ctx = await newCtx(STRANGER); const p = await facultyPage(ctx); page = p;
    await p.locator('#in').waitFor(); await p.click('#in');
    await p.locator('#out').waitFor();
    assert.match(await text(p, '#app'), /not faculty yet/);
    assert.equal(await p.locator('#tabs .tab').count(), 0);
    const r = await p.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      for (const [k, fn] of Object.entries({ a: () => c.listAttempts(), m: () => c.listMembers(), s: () => c.getSettings(), n: () => c.listAttemptCounts() })) { try { await fn(); out[k] = 'allowed'; } catch (e) { out[k] = e.code; } }
      return out;
    });
    assert.deepEqual(r, { a: 'permission', m: 'permission', s: 'permission', n: 'permission' });
    const w = await p.evaluate(async () => { const c = await import('/babymo/js/cloud.js'); try { await c.saveMember('stranger@example.com', { role: 'admin', name: 'me' }); return 'allowed'; } catch (e) { return e.code; } });
    assert.equal(w, 'permission'); assert.equal(await getD('members', STRANGER), null);
    await p.click('#out'); await p.locator('#in').waitFor();   // sign out returns to the gate
  });

  // ================= asking for faculty access =================
  const NEWFAC = 'newfac@example.com', SECOND = 'second@example.com';
  const call = (p, fn, ...args) => p.evaluate(async ([f, a]) => {
    const c = await import('/babymo/js/cloud.js');
    try { const v = await c[f](...a); return { ok: true, v: v === undefined ? null : v }; } catch (e) { return { ok: false, code: e.code }; }
  }, [fn, args]);
  const gatePage = async email => {   // a Google account that is not faculty: sits on the gate
    const ctx = await newCtx(email); const p = await facultyPage(ctx); page = p;
    await p.locator('#in').waitFor(); await p.click('#in'); await p.locator('#out').waitFor();
    return p;
  };
  let reqPage, edPage;
  await step('a non-member asks for access in the app: request filed; they cannot list requests or approve themselves', async () => {
    reqPage = await gatePage(NEWFAC);
    await reqPage.fill('#rq-name', 'Dr New Faculty'); await reqPage.click('#rq-go'); await reqPage.locator('#again').waitFor();
    const stored = await getD('accessRequests', NEWFAC);
    assert.equal(stored.name, 'Dr New Faculty'); assert.equal(stored.email, NEWFAC); assert.equal(typeof stored.requestedAt, 'number');
    assert.deepEqual(Object.keys(stored).sort(), ['email', 'id', 'name', 'requestedAt']);
    assert.equal((await call(reqPage, 'myRequest')).v.name, 'Dr New Faculty');
    assert.equal((await call(reqPage, 'listRequests')).code, 'permission');
    assert.equal((await call(reqPage, 'approveRequest', NEWFAC)).code, 'permission');
    assert.equal((await call(reqPage, 'declineRequest', 'someone-else@example.com')).code, 'permission');
    assert.equal(await call(reqPage, 'memberRole', NEWFAC).then(x => x.v), null);
    assert.equal(await getD('members', NEWFAC), null);
  });
  await step('asking again updates the request; cancelling removes it', async () => {
    assert.equal((await call(reqPage, 'requestAccess', 'Dr New F')).ok, true);
    assert.equal((await getD('accessRequests', NEWFAC)).name, 'Dr New F');
    assert.equal((await call(reqPage, 'cancelRequest')).ok, true);
    assert.equal(await getD('accessRequests', NEWFAC), null); assert.equal((await call(reqPage, 'myRequest')).v, null);
    assert.equal((await call(reqPage, 'requestAccess', 'Dr New Faculty')).ok, true);
  });
  await step('an editor approves from the People tab: member added and request gone in one batch', async () => {
    const ctx = await newCtx(EDITOR); edPage = await facultyPage(ctx); await facultySignIn(edPage);
    assert.equal((await call(edPage, 'approveRequest', NEWFAC, 'admin')).code, 'permission', 'an editor cannot approve as admin');
    assert.notEqual(await getD('accessRequests', NEWFAC), null, 'a refused approval must leave the request');
    await tab(edPage, 'People').click(); await edPage.locator('#reqs').waitFor();
    assert.match(await text(edPage, '#reqs'), /Dr New Faculty/);
    await edPage.click(`[data-ap="${NEWFAC}"]`); await edPage.locator('text=Nobody is waiting').waitFor();
    assert.deepEqual(await getD('members', NEWFAC), { id: NEWFAC, role: 'editor', name: 'Dr New Faculty' });
    assert.equal(await getD('accessRequests', NEWFAC), null);
    assert.equal((await call(edPage, 'approveRequest', NEWFAC)).code, 'not-found', 'a request that has vanished is not-found');
  });
  await step('the approved person checks again and is faculty (editor); a reload shows the faculty screens', async () => {
    await reqPage.click('#again'); await tab(reqPage, 'Results').waitFor();
    assert.equal((await call(reqPage, 'listAttempts')).ok, true);
    assert.equal((await call(reqPage, 'getPassphrase')).code, 'permission', 'an approved editor is still not an admin');
    await reqPage.reload(); await tab(reqPage, 'Results').waitFor();
  });
  await step('an admin approves another request then makes them admin; declines one; a non-faculty account still cannot list', async () => {
    const ctx2 = await newCtx(SECOND); const p2 = await facultyPage(ctx2); await p2.locator('#in').waitFor(); await p2.click('#in'); await p2.locator('#out').waitFor();
    assert.equal((await call(p2, 'requestAccess', 'Dr Second')).ok, true);
    assert.equal((await call(p2, 'listRequests')).code, 'permission');
    const adminPage = await facultyPage(facCtx, '#/faculty/people'); await adminPage.locator('#reqs').waitFor();
    await adminPage.click(`[data-dec="${SECOND}"]`); await adminPage.click('dialog.sheet [data-yes]'); await adminPage.locator('text=Nobody is waiting').waitFor();
    assert.equal(await getD('accessRequests', SECOND), null); assert.equal(await getD('members', SECOND), null);
    assert.equal((await call(p2, 'requestAccess', 'Dr Second')).ok, true);
    await adminPage.reload(); await adminPage.locator(`[data-ap="${SECOND}"]`).click(); await adminPage.locator(`[data-member="${SECOND}"]`).waitFor();
    await adminPage.click(`[data-member="${SECOND}"] .seg-opt:has-text("Admin")`); await toastText(adminPage, /Now an admin/);
    assert.deepEqual(await getD('members', SECOND), { id: SECOND, role: 'admin', name: 'Dr Second' });
    assert.equal((await call(p2, 'memberRole', SECOND)).v, 'admin');
    await adminPage.close(); await p2.close(); await edPage.close();
  });

  // ================= change the passphrase =================
  await step('changing the passphrase locks old sessions out of new tests; the new passphrase works', async () => {
    page = await newPage(facCtx);   // faculty again (still signed in in facCtx)
    await page.goto(URL_EMU + '#/faculty/settings'); await page.locator('#sf').waitFor();
    await page.fill('#s-pass', NEWPASS); await page.click('#save'); await toastText(page, /Settings saved/);
    assert.equal((await getD('config', 'access')).passphrase, NEWPASS);
    // the earlier MO (context 1) is still signed in, but their session no longer matches
    const mo = moCtx.pages()[0]; page = mo;
    const r = await mo.evaluate(async () => {
      const c = await import('/babymo/js/cloud.js'); const out = {};
      out.has = await c.hasSession();
      try { await c.getSettings(); out.settings = 'allowed'; } catch (e) { out.settings = e.code; }
      try { await c.getAttemptCount('oct2026__x'); out.count = 'allowed'; } catch (e) { out.count = e.code; }
      return out;
    });
    assert.deepEqual(r, { has: false, settings: 'permission', count: 'permission' });
    // they try to start a new test with the old passphrase: refused
    await page.click('#done').catch(() => {});
    await moStart(mo, myName, PASS);
    await mo.locator('#start-err:not([hidden])').waitFor(); assert.match(await text(mo, '#start-err'), /passphrase is not right/);
    // a fresh MO with the new passphrase gets in
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Fresh Start', NEWPASS); await p.locator('#go').waitFor();
    assert.match(await text(p, '#ready-sum'), /^5 questions/);
    await p.close();
    // the same MO (context 1) with the new passphrase, too
    await mo.fill('#f-pass', NEWPASS); await mo.click('#start-go'); await mo.locator('#go').waitFor();
    assert.match(await text(mo, '#ready-sum'), /attempt 2 of 2/);
    assert.equal((await docs('sessions')).length, 3);
  });
  let curPass = NEWPASS;
  await step('a stale session cannot submit a finished test; signing in again with the new passphrase saves it', async () => {
    const before = (await docs('attempts')).length;
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Locked Out', curPass); await sitTest(p, { submit: false });   // answer everything, stop before submitting
    curPass = 'rotated-again-1';
    await admin(db => setDoc(doc(db, 'config', 'access'), { passphrase: curPass }));   // faculty rotate the passphrase mid-test
    await submitNow(p);
    await p.waitForFunction(() => /login has expired/.test(document.querySelector('#saved')?.textContent || ''), null, { timeout: 15000 });
    assert.equal((await docs('attempts')).length, before);
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox')).length), 1, 'result kept in the outbox');
    // recovery: back to the start, log in again with the new passphrase: the waiting result is sent under the new login
    await p.click('#done'); await p.locator('#f-name').waitFor();
    assert.match(await text(p, '.pills'), /Saving your result/i, 'the start page says a result is waiting');
    await p.fill('#f-pass', curPass); await p.click('#start-go'); await p.locator('#go').waitFor();
    await p.waitForFunction(() => JSON.parse(localStorage.getItem('mo-outbox') || '[]').length === 0, null, { timeout: 15000 });
    const as = await docs('attempts', where('name', '==', 'Dr Locked Out')); assert.equal(as.length, 1);
    const ss = await docs('sessions', where('name', '==', 'Dr Locked Out')); assert.equal(ss.length, 2);
    assert.ok(ss.some(x => x.id === as[0].uid), 'saved under the new login');
  });
  await step('reload in the middle of a test, then submit: saved under the same name', async () => {
    const ctx = await newCtx(); const p = await newPage(ctx); page = p;
    await moStart(p, 'Dr Reloader', curPass); await p.locator('#go').waitFor(); await p.click('#go'); await p.locator('#stem').waitFor();
    await p.locator('.choice').nth(0).click();
    await p.reload(); await p.locator('#stem').waitFor();
    await p.click('#qpill'); await p.click('#nav-finish'); await p.click('#submit'); await p.locator('#score').waitFor();
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
      await ctx.setOffline(true);
      await submitNow(p);
      assert.equal((await docs('attempts', where('name', '==', name))).length, 0, 'nothing can be saved while offline');
      assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('mo-outbox')).length), 1);
      assert.match(await text(p, '#saved'), /only on this phone/, 'the result screen says it is not saved yet');
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
  // ================= attempt limits (cloud.js driven directly, no app UI) =================
  {
    const BLANK = BASE + 'style.css?emu=1';   // any page on the test origin: cloud.js is imported straight into it
    const KEY = 'oct-2026__dr-limit', run = (p, fn, ...args) => call(p, fn, ...args);
    let mo1, fac, mo2;
    await step('attempt limits: seed the settings (maxAttempts 2) and sign in an MO', async () => {
      await seed();
      await admin(db => setDoc(doc(db, 'config', 'test'), { title: 'Baby MO test', count: 5, passMark: 60, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: '', maxAttempts: 2, hardCount: 3, updatedAt: 1, updatedBy: by(ADMIN) }));
      const ctx = await newCtx(); mo1 = await newPage(ctx); page = mo1; await mo1.goto(BLANK);
      const r = await run(mo1, 'startSession', 'Dr Limit', PASS); assert.equal(r.ok, true, JSON.stringify(r));
      assert.equal((await run(mo1, 'getAttemptCount', KEY)).v, 0, 'no counter yet reads as 0');
    });
    await step('bumpAttempt: 1, then 2, then the third throws "limit" without writing', async () => {
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 1);
      assert.equal((await run(mo1, 'getAttemptCount', KEY)).v, 1);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 2);
      const third = await run(mo1, 'bumpAttempt', KEY); assert.equal(third.ok, false); assert.equal(third.code, 'limit');
      assert.equal((await getD('attemptCounts', KEY)).n, 2, 'a refused bump does not write');
      assert.equal(typeof (await getD('attemptCounts', KEY)).updatedAt, 'number');
    });
    await step('an MO session cannot lower, delete or list the counters', async () => {
      const w = await mo1.evaluate(async key => {
        const { getFirestore, doc, setDoc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        const { getApp } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const db = getFirestore(getApp()), out = {};
        try { await setDoc(doc(db, 'attemptCounts', key), { n: 1, updatedAt: 1 }); out.lower = 'allowed'; } catch (e) { out.lower = e.code; }
        try { await setDoc(doc(db, 'attemptCounts', key), { n: 3, updatedAt: 1 }); out.raise = 'allowed'; } catch (e) { out.raise = e.code; }
        try { await deleteDoc(doc(db, 'attemptCounts', key)); out.del = 'allowed'; } catch (e) { out.del = e.code; }
        return out;
      }, KEY);
      assert.deepEqual(w, { lower: 'permission-denied', raise: 'permission-denied', del: 'permission-denied' });
      assert.equal((await getD('attemptCounts', KEY)).n, 2);
      assert.equal((await run(mo1, 'listAttemptCounts')).code, 'permission');
      assert.equal((await run(mo1, 'grantAttempt', KEY)).code, 'permission');
      assert.equal((await run(mo1, 'setAttemptCount', KEY, 0)).code, 'permission');
      assert.equal((await getD('attemptCounts', KEY)).n, 2);
    });
    await step('another MO has their own counter', async () => {
      const ctx = await newCtx(); mo2 = await newPage(ctx); await mo2.goto(BLANK);
      assert.equal((await run(mo2, 'startSession', 'Dr Other', PASS)).ok, true);
      assert.equal((await run(mo2, 'bumpAttempt', 'oct-2026__dr-other')).v, 1);
      assert.equal((await run(mo2, 'getAttemptCount', 'oct-2026__dr-other')).v, 1);
    });
    await step('faculty: listAttemptCounts, grantAttempt gives another attempt, setAttemptCount undoes it', async () => {
      const ctx = await newCtx(EDITOR); fac = await newPage(ctx); page = fac; await fac.goto(BLANK);
      assert.equal((await run(fac, 'facultySignIn')).ok, true);
      const l = await run(fac, 'listAttemptCounts'); assert.equal(l.ok, true);
      assert.deepEqual(l.v.sort((a, b) => a.key.localeCompare(b.key)), [{ key: KEY, n: 2 }, { key: 'oct-2026__dr-other', n: 1 }]);
      assert.equal((await run(fac, 'grantAttempt', KEY)).v, 1);
      assert.equal((await getD('attemptCounts', KEY)).n, 1);
      assert.equal((await run(fac, 'setAttemptCount', KEY, 2)).v, 2, 'Undo puts the count back');
      assert.equal((await getD('attemptCounts', KEY)).n, 2);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).code, 'limit');
      assert.equal((await run(fac, 'grantAttempt', KEY)).v, 1);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 2, 'the MO has an attempt left again');
      assert.equal((await run(fac, 'setAttemptCount', KEY, 0)).v, 0);
      assert.equal(await getD('attemptCounts', KEY), null, 'the counter is deleted at 0');
      assert.equal((await run(fac, 'grantAttempt', KEY)).v, 0, 'never below 0');
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 1);
    });
    await step('maxAttempts follows the settings (3 allows a third, 1 allows only one); old settings default to 2', async () => {
      assert.equal((await run(fac, 'saveSettings', { title: 'T', count: 5, passMark: 60, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: '', maxAttempts: 3 }, { email: 'editor@example.com', name: 'e' })).code, 'permission', 'an editor cannot save settings');
      const ctxA = await newCtx(ADMIN); const ad = await newPage(ctxA); await ad.goto(BLANK);
      assert.equal((await run(ad, 'facultySignIn')).ok, true);
      const sv = await run(ad, 'saveSettings', { title: 'T', count: 5, passMark: 80, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: '', maxAttempts: 3 }, { email: ADMIN, name: 'Admin' });
      assert.equal(sv.ok, true, JSON.stringify(sv)); assert.equal(sv.v.maxAttempts, 3); assert.equal('hardCount' in sv.v, false, 'hard questions per sitting come from the paper');
      const g = (await run(mo1, 'getSettings')).v; assert.equal(g.maxAttempts, 3); assert.equal(g.passMark, 80);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 2);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).v, 3);
      assert.equal((await run(mo1, 'bumpAttempt', KEY)).code, 'limit');
      await run(ad, 'saveSettings', { title: 'T', count: 5, passMark: 80, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: '', maxAttempts: 1 }, { email: ADMIN, name: 'Admin' });
      assert.equal((await run(mo2, 'bumpAttempt', 'oct-2026__dr-other')).code, 'limit', 'maxAttempts 1: the second bump is refused');
      const old = await run(ad, 'saveSettings', { title: 'T', count: 5, passMark: 80, minutes: 10, review: 'full', cohort: 'Oct 2026', intro: '' }, { email: ADMIN, name: 'Admin' });
      assert.equal(old.ok, true); assert.equal('maxAttempts' in old.v, false);
      assert.equal((await run(mo2, 'bumpAttempt', 'oct-2026__dr-other')).v, 2);
      assert.equal((await run(mo2, 'bumpAttempt', 'oct-2026__dr-other')).code, 'limit');
      const cl = await run(ad, 'saveSettings', { title: 'T', count: 5, passMark: 80, minutes: 10, review: 'full', cohort: '', intro: '', maxAttempts: 99, hardCount: -4 }, { email: ADMIN, name: 'Admin' });
      assert.equal(cl.v.maxAttempts, 10); assert.equal(cl.v.hardCount, 0);
    });
    await step('attempts keep attemptNo, 2 to 6 choices and long topic text', async () => {
      const item = (options, topic = 't') => ({ qid: 'q1', stem: 's', options, answer: 0, topic, explain: '', picked: 0 });
      const att = (id, items, extra = {}) => ({ id, name: 'Dr Limit', cohort: 'Oct 2026', startedAt: 1, submittedAt: 2, durationSec: 1, items, settings: { count: 1, passMark: 80, minutes: 5 }, score: 1, total: 1, pass: true, ...extra });
      const sub = await run(mo1, 'submitAttempt', att('att-no-2', [item(['a', 'b', 'c', 'd'])], { attemptNo: 2 }));
      assert.equal(sub.ok, true, JSON.stringify(sub)); assert.equal((await getD('attempts', 'att-no-2')).attemptNo, 2);
      const none = await run(mo1, 'submitAttempt', att('att-no-none', [item(['a', 'b', 'c', 'd'])]));
      assert.equal(none.ok, true); assert.equal('attemptNo' in (await getD('attempts', 'att-no-none')), false);
      const six = await run(mo1, 'submitAttempt', att('att-six', [item(['a', 'b', 'c', 'd', 'e', 'f']), item(['yes', 'no'])]));
      assert.equal(six.ok, true, JSON.stringify(six));
      const st = await getD('attempts', 'att-six'); assert.equal(st.items[0].options.length, 6); assert.equal(st.items[1].options.length, 2);
      const long = 'Airway; Drugs; ' + 'b'.repeat(200);
      assert.equal((await run(mo1, 'submitAttempt', att('att-topics', [item(['a', 'b'], long)]))).ok, true);
      assert.equal((await getD('attempts', 'att-topics')).items[0].topic, long);
    });
    for (const p of [mo1, mo2, fac]) await p.close().catch(() => {});
    await seed();   // leave the data as the later steps expect
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
