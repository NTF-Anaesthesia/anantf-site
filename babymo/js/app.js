// Baby MO test: the MOs' test (name + passphrase) and the faculty's Results, Paper, People and Settings (Google sign-in).
// One page, hash routes. Questions come from the shared question bank (../qbank/): the paper qbank/papers/babymo.json
// and the bank qbank/bank/questions.json, read-only here. Sign-in, settings and results go through store.js (Firebase,
// or this browser only in demo mode). Faculty don't edit questions here: they suggest changes in the qbank app.

import { api, mode, isDemo } from './store.js';
import * as L from './logic.js';
import { resolvePaper, STATUS_LABEL } from '../../qbank/js/bank.js';
import * as U from './ui.js';

const { $, $$, esc, nl, icon } = U;
const PAPER_URL = new URL('../../qbank/papers/babymo.json', import.meta.url);
const BANK_URL = new URL('../../qbank/bank/questions.json', import.meta.url);
const QBANK_APP = new URL('../../qbank/', import.meta.url);

const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked: the page still works, without resume */ } };
const lsDel = k => { try { localStorage.removeItem(k); } catch { /* ignore */ } };
const lsJson = k => { try { return JSON.parse(lsGet(k) || 'null'); } catch { return null; } };

const S = {
  user: null,          // signed-in person (faculty, or the MO's anonymous login)
  role: null,          // 'admin' | 'editor' | null
  stored: null,        // config/test from Firebase (faculty and MOs with a session)
  paper: null,         // { paper, pool (ready, with must/level), all, settings, byId }
  attempts: [], counts: [], loaded: {},
  name: lsGet('mo-name') || '',
  attempt: lsJson('mo-attempt'),   // a sitting being prepared (view 'ready') or in progress (items)
  last: lsJson('mo-last'),         // the last finished sitting on this phone
  pending: 0,          // faculty access requests waiting
  dirty: false,        // unsaved changes on the Settings screen
};
let timer = null, userReady, pendingAnim = null, firstPaint = true;
const userKnown = new Promise(r => (userReady = r));

// ---------- helpers ----------
function errText(e) {
  return ({ permission: 'You do not have permission to do that.', offline: 'No signal right now. Try again when you are online.', paper: "Couldn't load the questions. Check your signal.", 'not-found': 'That could not be found.' })[e?.code] || 'Something went wrong. Try again.';
}
const busy = async (btn, fn) => {
  if (btn) { if (btn.getAttribute('aria-disabled') === 'true') return; btn.setAttribute('aria-disabled', 'true'); }
  try { return await fn(); } finally { if (btn) btn.removeAttribute('aria-disabled'); }
};
function download(name, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const today = () => new Date().toISOString().slice(0, 10);
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const go = h => { if (location.hash === h) route(); else location.hash = h; };

async function loadPaper(force) {
  if (S.paper && !force) return S.paper;
  try {
    const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
    const [paper, bank] = await Promise.all([get(PAPER_URL), get(BANK_URL)]);
    const r = resolvePaper(paper, bank.questions || []);
    S.paper = { paper, ...r, byId: new Map(r.all.map(q => [q.id, q])) };
    return S.paper;
  } catch (e) { throw Object.assign(new Error('paper'), { code: 'paper', cause: e }); }
}
const settingsNow = () => L.effectiveSettings({ ...(S.paper?.settings || {}), title: S.paper?.paper?.title }, S.stored);

// ---------- screen ----------
// bar(): the 44px bar with an inline title that fades in when the large title scrolls under it.
function bar({ title = '', back, end = '', always = false } = {}) {
  const left = back ? `<a class="bar-btn" href="${back.href}"${back.id ? ` id="${back.id}"` : ''}>${icon.back}<span>${esc(back.label)}</span></a>` : '';
  return `<header class="bar${always ? ' always' : ''}"><div class="bar-side">${left}</div><div class="bar-title" aria-hidden="true">${esc(title)}</div><div class="bar-side end">${end}</div></header>`;
}
function setChromeBottom() {
  const h = ($('#bottom').offsetHeight || 0) + ($('#tabs').hidden ? 0 : $('#tabs').offsetHeight || 0);
  document.documentElement.style.setProperty('--chrome-bottom', h + 'px');
}
// keep: redraw the same screen in place (no jump, no focus move)
function setScreen(html, { title = '', bottom = '', tabs = null, keep = false, focus = 'h1' } = {}) {
  clearInterval(timer); timer = null;
  const app = $('#app'), y = app.scrollTop;
  app.innerHTML = `<div class="screen">${html}</div>`;
  $('#bottom').innerHTML = bottom;
  paintTabs(tabs);
  document.title = (title ? title + ' · ' : '') + 'Baby MO test';
  setChromeBottom();
  U.watchLargeTitle(app);
  if (keep) { app.scrollTop = y; return; }
  app.scrollTop = 0;
  const anim = pendingAnim; pendingAnim = null;
  if (anim && !firstPaint && !U.reducedMotion()) app.firstElementChild.classList.add(anim);
  const h = focus && app.querySelector(focus);
  if (h && !firstPaint) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  firstPaint = false;
}
function paintTabs(on) {
  const t = $('#tabs');
  if (!on) { t.hidden = true; t.innerHTML = ''; return; }
  const tab = (href, key, label, ic, badge) => `<a class="tab" href="${href}"${on === key ? ' aria-current="page"' : ''}>${ic}<span>${label}</span>${badge ? `<span class="tab-badge" aria-label="${badge} waiting">${badge}</span>` : ''}</a>`;
  t.innerHTML = tab('#/faculty/results', 'results', 'Results', icon.results) + tab('#/faculty/paper', 'paper', 'Paper', icon.paper)
    + tab('#/faculty/people', 'people', 'People', icon.people, S.pending) + tab('#/faculty/settings', 'settings', 'Settings', icon.settings);
  t.hidden = false;
}
function pills({ outbox: showOutbox = true } = {}) {
  const out = [];
  if (!navigator.onLine) out.push('<span class="pill warn">Offline</span>');
  if (mode === 'local') out.push(`<span class="pill demo">${isDemo ? 'Demo' : 'Not connected'}: this browser only</span>`);
  const n = outbox().length;
  if (showOutbox && n) out.push(`<span class="pill warn" id="outpill">${n === 1 ? 'Saving your result…' : `Saving ${n} results…`}</span>`);
  return `<div class="pills">${out.join('')}</div>`;
}
window.addEventListener('online', () => repaintPills()); window.addEventListener('offline', () => repaintPills());
function repaintPills() { const el = $('#app .pills'); if (el) el.outerHTML = pills({ outbox: !location.hash.startsWith('#/faculty') }); }
const errorPanel = (e, retry = true) => `<div class="inset-panel" role="alert"><p>${esc(errText(e))}</p>${retry ? '<button type="button" class="btn secondary small" id="retry-route">Try again</button>' : ''}</div>`;

// ---------- routing ----------
const depthOf = h => (h || '#/').replace(/^#/, '').split('?')[0].split('/').filter(Boolean).length;
window.addEventListener('hashchange', ev => {
  const from = new URL(ev.oldURL).hash || '#/', to = location.hash || '#/';
  if (S.dirty && from.startsWith('#/faculty/settings') && !to.startsWith('#/faculty/settings')) {
    history.replaceState(history.state, '', from);   // stay on Settings until they choose (no hashchange from this)
    U.confirmSheet({ title: 'Leave without saving?', body: '<p>Your changes to the settings are not saved yet.</p>', ok: 'Leave', cancel: 'Keep editing', danger: true })
      .then(ok => { if (ok) { S.dirty = false; location.hash = to; } });
    return;
  }
  const a = depthOf(from), b = depthOf(to);
  pendingAnim = b > a ? 'screen-in' : b < a ? 'screen-back' : 'screen-fade';
  route();
});
window.addEventListener('beforeunload', ev => { if (S.dirty) { ev.preventDefault(); ev.returnValue = ''; } });

async function route() {
  U.closeAllSheets();
  const h = (location.hash || '#/').replace(/^#/, '');
  const [path, qs] = h.split('?'), p = path.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
  try {
    await userKnown;
    if (p[0] !== 'faculty') {
      if (S.attempt?.items && p[0] && p[0] !== 'test') return location.replace('#/test');
      if (p[0] === 'test') return S.attempt?.items ? viewTest() : go('#/');
      if (p[0] === 'ready') return S.attempt && !S.attempt.items ? viewReady() : go('#/');
      if (p[0] === 'result') return p[1] != null ? viewReviewItem(+p[1]) : viewResult();
      return viewStart();
    }
    if (!S.role) return viewFacultyGate();
    refreshPending();
    const [, sub, arg] = p;
    if (!sub || sub === 'results') return viewResults(q.get('by'));
    if (sub === 'person') return viewPerson(arg);
    if (sub === 'attempt') return viewAttempt(arg);
    if (sub === 'question') return viewQuestionStats(arg);
    if (sub === 'paper') return arg ? viewPaperQuestion(arg) : viewPaper();
    if (sub === 'people') return viewPeople();
    if (sub === 'settings') return viewSettings();
    return go('#/faculty/results');
  } catch (e) {
    console.error(e);
    setScreen(bar({ title: 'Something went wrong', always: true }) + `<div class="content"><h1 class="large-title">Something went wrong</h1>${errorPanel(e)}<p><a href="#/">Back to the start</a></p></div>`, { title: 'Error' });
    $('#retry-route')?.addEventListener('click', () => route());
  } finally { applyUpdate(); }
}
async function refreshPending() {
  try { const n = (await api.listRequests()).length; if (n !== S.pending) { S.pending = n; if (!$('#tabs').hidden) paintTabs($('#tabs .tab[aria-current] span')?.textContent.toLowerCase()); } } catch { /* not allowed or offline: no badge */ }
}

// ========== MO: start, ready, test, result ==========
function viewStart() {
  const a = S.attempt;
  if (a?.items && L.secondsLeft(a.startedAt, a.settings.minutes) <= 0) return finish(true);
  const answered = a?.items ? a.items.filter(i => i.picked != null).length : 0;
  const last = S.last, ls = last && L.summarise(last);
  const resume = a?.items ? `<div class="card" id="resume"><p class="kicker">Test in progress</p><p class="sumline">Question ${(a.idx || 0) + 1} of ${a.items.length} · ${answered} answered · ${L.clock(L.secondsLeft(a.startedAt, a.settings.minutes))} left</p><p class="muted small">The clock keeps running while you are away.</p><a class="btn" href="#/test" id="resume-go">Resume the test</a></div>` : '';
  setScreen(`${bar({ title: 'Baby MO test' })}<div class="content">
    ${pills()}
    <h1 class="large-title">Baby MO test</h1>
    <p class="lead">For new medical officers in NTFGH anaesthesia. Enter your name and the passphrase you were given.</p>
    ${resume || `<form id="start" autocomplete="off" novalidate>
      <label class="field"><span>Your name</span><input id="f-name" required maxlength="80" value="${esc(S.name)}" autocomplete="name" placeholder="As on the roster" enterkeyhint="next"></label>
      <label class="field"><span>Passphrase</span><input id="f-pass" required type="password" autocomplete="off" enterkeyhint="go"${mode === 'local' ? ' placeholder="demo"' : ''}></label>
      <p id="start-err" class="err" role="alert" hidden></p>
      <button class="btn" type="submit" id="start-go">Start</button>
    </form>`}
    ${last ? `<h2 class="section">On this phone</h2><ul class="list"><li><a class="row-link" href="#/result"><span class="row-main"><span class="row-title">Your last result</span><span class="row-sub">${esc(last.name)}: ${ls.score} of ${ls.total}, ${ls.pass ? 'pass' : 'not yet'}</span></span>${icon.chevron}</a></li></ul>` : ''}
    <p id="install" class="muted small" hidden></p>
    <h2 class="section">Faculty</h2>
    <ul class="list"><li><a class="row-link" href="#/faculty" id="faculty-link"><span class="row-main"><span class="row-title">Faculty sign in</span><span class="row-sub">Results, the paper and the faculty list</span></span>${icon.chevron}</a></li></ul>
    ${U.versionLine()}</div>`, { title: 'Start' });
  paintInstall(); U.paintVersion('babymo-');
  $('#start')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = $('#f-name').value.trim().replace(/\s+/g, ' '), pass = $('#f-pass').value;
    const err = $('#start-err'); err.hidden = true;
    if (!name || !pass) { err.textContent = !name ? 'Type your name.' : 'Type the passphrase.'; err.hidden = false; (name ? $('#f-pass') : $('#f-name')).focus(); return; }
    await busy($('#start-go'), async () => {
      try {
        await api.startSession(name, pass);
        S.name = name; lsSet('mo-name', name);
        await prepareAttempt(name);
        go('#/ready');
      } catch (e) {
        err.textContent = e.code === 'bad-passphrase' ? 'That passphrase is not right. Check it with your supervisor.'
          : e.code === 'empty' ? 'There are no questions ready yet. Please tell the faculty.'
          : e.code === 'limit' ? `You have used all ${e.max} of your attempts. Please speak to the faculty.`
          : errText(e);
        err.hidden = false;
      }
    });
  });
}
// Load the settings and the paper, check how many attempts this person has used. Throws 'empty' or 'limit'.
async function prepareAttempt(name) {
  S.stored = await api.getSettings();
  await loadPaper(true);
  const st = settingsNow();
  if (!S.paper.pool.length) throw Object.assign(new Error('empty'), { code: 'empty' });
  const key = L.attemptKey(st.cohort, name), used = await api.getAttemptCount(key);
  if (used >= st.maxAttempts) throw Object.assign(new Error('limit'), { code: 'limit', used, max: st.maxAttempts });
  S.attempt = {
    id: L.newId(), name, view: 'ready', cohort: st.cohort, intro: st.intro, key, attemptNo: used + 1, maxAttempts: st.maxAttempts,
    settings: { title: st.title, count: Math.min(st.count, S.paper.pool.length), passMark: st.passMark, minutes: st.minutes, review: st.review, hardCount: st.hardCount },
  };
  saveAttempt();
}
const saveAttempt = () => { if (S.attempt) lsSet('mo-attempt', JSON.stringify(S.attempt)); else lsDel('mo-attempt'); };

function viewReady() {
  const a = S.attempt, st = a.settings, n = st.count;
  setScreen(`${bar({ title: 'Ready', back: { href: '#/', label: 'Start', id: 'ready-back' } })}<div class="content">
    ${pills()}
    <h1 class="large-title">Ready, ${esc(a.name)}?</h1>
    <p class="sumline" id="ready-sum">${n} questions · ${st.minutes} minutes · pass ${st.passMark}% · attempt ${a.attemptNo} of ${a.maxAttempts}</p>
    ${a.intro ? `<div class="inset-panel"><p>${nl(a.intro)}</p></div>` : ''}
    <ul class="facts">
      <li>You pass with <b>${L.passCount(n, st.passMark)} or more</b> right out of ${n}.</li>
      <li>The clock starts when you tap Begin, and keeps running if you leave the app.</li>
      <li>One answer each, no negative marking. You can change answers and flag questions until you submit.</li>
      <li>If the time runs out, your answers are submitted for you.</li>
    </ul></div>`, {
    title: 'Ready',
    bottom: '<div class="btn-row"><button type="button" class="btn secondary" id="cancel">Not now</button><button type="button" class="btn" id="go">Begin</button></div>',
  });
  const cancel = () => { S.attempt = null; saveAttempt(); };
  $('#cancel').addEventListener('click', () => { cancel(); go('#/'); });
  $('#ready-back').addEventListener('click', cancel);
  $('#go').addEventListener('click', ev => busy(ev.currentTarget, async () => {
    try { await loadPaper(); } catch (e) { return U.toast(errText(e), { ms: 6000 }); }
    let no = a.attemptNo;
    try { no = await api.bumpAttempt(a.key); }   // the attempt is used up now, so closing the page and starting again is not a free look
    catch (e) {
      if (e.code === 'limit') { cancel(); U.toast('You have used all your attempts. Please speak to the faculty.', { ms: 7000 }); return go('#/'); }
      return U.toast(e.code === 'offline' ? 'No signal. Begin needs a signal to count your attempt; try again in a moment.' : 'Could not begin: ' + errText(e), { ms: 7000 });
    }
    const items = L.drawTest(S.paper.pool, st);
    S.attempt = { ...a, view: 'q', idx: 0, flags: [], startedAt: Date.now(), items, attemptNo: no };
    saveAttempt(); pendingAnim = 'screen-in'; go('#/test');
  }));
}

// ---- the test ----
function viewTest(anim) {
  const a = S.attempt;
  if (L.secondsLeft(a.startedAt, a.settings.minutes) <= 0) return finish(true);
  const n = a.items.length, i = Math.min(Math.max(a.idx || 0, 0), n - 1), it = a.items[i], flagged = a.flags.includes(i);
  const done = a.items.filter(x => x.picked != null).length;
  const img = it.image ? new URL('../../qbank/' + it.image, import.meta.url).href : '';
  if (anim) pendingAnim = anim;
  setScreen(`<div class="sbar"><div class="sbar-row">
      <button type="button" class="bar-btn" id="leave" aria-label="Leave the test">${icon.close}</button>
      <div class="sbar-mid"><button type="button" class="qpill" id="qpill" aria-label="Question ${i + 1} of ${n}. Show all questions">${icon.grid}<span>Q ${i + 1}/${n}</span></button></div>
      <button type="button" class="timer" id="timer" aria-label="Time left. Tap to hide the timer"></button>
      <button type="button" class="bar-btn flagbtn" id="flag" aria-pressed="${flagged}" aria-label="Flag this question">${icon.flag}</button>
    </div><div class="progress" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${done}"><i style="width:${Math.round(done / n * 100)}%"></i></div></div>
    <div class="qbody">
      ${it.topic ? `<p class="kicker">${esc(it.topic.replace(/; /g, ' · '))}</p>` : ''}
      <h1 class="stem" id="stem">${nl(it.stem)}</h1>
      ${img ? `<img class="qimg" src="${esc(img)}" alt="Picture for this question" id="qimg">` : ''}
      <div class="choices" role="group" aria-labelledby="stem">${it.options.map((o, k) => `<button type="button" class="choice" data-k="${k}" aria-pressed="${it.picked === k}"><span class="letter" aria-hidden="true">${L.LETTERS[k]}</span><span class="ctext"><span class="vh">${L.LETTERS[k]}, </span>${nl(o)}</span></button>`).join('')}</div>
    </div>`, {
    title: `Question ${i + 1}`, focus: '#stem',
    bottom: `<div class="btn-row"><button type="button" class="btn secondary navbtn" id="prev"${i === 0 ? ' aria-disabled="true"' : ''}>${icon.back}<span>Back</span></button><button type="button" class="btn secondary" id="clear"${it.picked == null ? ' aria-disabled="true"' : ''}>Clear</button>${i < n - 1 ? `<button type="button" class="btn navbtn" id="next"><span>Next</span>${icon.forward}</button>` : '<button type="button" class="btn" id="finish">Finish</button>'}</div>`,
  });
  const progress = () => {
    const d = a.items.filter(x => x.picked != null).length, pb = $('.progress');
    pb.setAttribute('aria-valuenow', d); pb.firstElementChild.style.width = Math.round(d / n * 100) + '%';
  };
  $$('.choice').forEach(b => b.addEventListener('click', () => {
    it.picked = +b.dataset.k; saveAttempt(); U.haptic();
    $$('.choice').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.k === it.picked)));
    $('#clear').removeAttribute('aria-disabled'); progress();
  }));
  $('#clear').addEventListener('click', () => {
    if (it.picked == null) return;
    it.picked = null; saveAttempt();
    $$('.choice').forEach(c => c.setAttribute('aria-pressed', 'false'));
    $('#clear').setAttribute('aria-disabled', 'true'); progress(); U.announce('Answer cleared');
  });
  $('#flag').addEventListener('click', ev => {
    const on = !a.flags.includes(i);
    a.flags = on ? [...a.flags, i] : a.flags.filter(x => x !== i); saveAttempt();
    ev.currentTarget.setAttribute('aria-pressed', String(on)); U.announce(on ? 'Flagged' : 'Flag removed');
  });
  $('#prev').addEventListener('click', () => { if (i > 0) { a.idx = i - 1; saveAttempt(); viewTest('screen-back'); } });
  $('#next')?.addEventListener('click', () => { a.idx = i + 1; saveAttempt(); viewTest('screen-in'); });
  $('#finish')?.addEventListener('click', () => checkSheet());
  $('#qpill').addEventListener('click', () => navigatorSheet());
  $('#leave').addEventListener('click', async () => {
    if (await U.confirmSheet({ title: 'Leave the test?', body: '<p>Your answers are kept. The clock keeps running: come back to this page to carry on.</p>', ok: 'Leave', cancel: 'Keep going' })) go('#/');
  });
  $('#qimg')?.addEventListener('click', () => U.sheet({ title: 'Picture', detent: 'large', body: `<img src="${esc(img)}" alt="Picture for this question, enlarged" style="width:100%;height:auto">` }));
  $('#timer').addEventListener('click', () => { a.hideTimer = !a.hideTimer; saveAttempt(); tick(); });
  const tick = () => {
    const s = L.secondsLeft(a.startedAt, a.settings.minutes), t = $('#timer');
    if (t) {
      t.classList.toggle('low', s <= 300); t.classList.toggle('hidden-time', !!a.hideTimer);
      t.textContent = a.hideTimer ? 'Show timer' : L.clock(s);
      const label = a.hideTimer ? 'Show the timer' : `Time left ${Math.ceil(s / 60)} minute${Math.ceil(s / 60) === 1 ? '' : 's'}. Tap to hide the timer`;
      if (t.getAttribute('aria-label') !== label) t.setAttribute('aria-label', label);
    }
    if (s <= 0) { clearInterval(timer); finish(true); return; }
    for (const mark of [300, 60]) if (s <= mark && !(a.said || []).includes(mark)) { a.said = [...(a.said || []), mark]; saveAttempt(); U.announce(mark === 300 ? '5 minutes left' : '1 minute left'); }
  };
  tick(); clearInterval(timer); timer = setInterval(tick, 1000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.attempt?.items && L.secondsLeft(S.attempt.startedAt, S.attempt.settings.minutes) <= 0) finish(true); });

function navigatorSheet() {
  const a = S.attempt, cur = a.idx || 0;
  const d = U.sheet({
    title: 'All questions', detent: 'medium',
    body: `<ol class="navgrid">${a.items.map((it, i) => `<li><button type="button" class="navdot${it.picked != null ? ' done' : ''}${a.flags.includes(i) ? ' flag' : ''}${i === cur ? ' cur' : ''}" data-i="${i}" aria-label="Question ${i + 1}, ${it.picked == null ? 'not answered' : 'answered'}${a.flags.includes(i) ? ', flagged' : ''}${i === cur ? ', current' : ''}">${i + 1}</button></li>`).join('')}</ol>
      <ul class="legend" aria-hidden="true"><li><i></i>Not answered</li><li><i class="done"></i>Answered</li><li><i class="flag"></i>Flagged</li><li><i class="cur"></i>This one</li></ul>`,
    footer: '<button type="button" class="btn" id="nav-finish">Finish and submit</button>',
  });
  $$('.navdot', d).forEach(b => b.addEventListener('click', async () => { await U.closeSheet(d); a.idx = +b.dataset.i; saveAttempt(); viewTest('screen-fade'); }));
  $('#nav-finish', d).addEventListener('click', async () => { await U.closeSheet(d); checkSheet(); });
}
function checkSheet() {
  const a = S.attempt, un = a.items.map((x, i) => (x.picked == null ? i : -1)).filter(i => i >= 0), fl = [...a.flags].sort((x, y) => x - y);
  const parts = [un.length ? plural(un.length, 'unanswered question') : 'Every question is answered', fl.length ? plural(fl.length, 'flagged') : ''].filter(Boolean);
  const d = U.sheet({
    title: 'Submit your test?', detent: 'medium',
    body: `<p class="sumline" id="check-sum">${esc(parts.join(' · '))}.</p>
      ${un.length || fl.length ? `<div class="btn-stack">${un.length ? `<button type="button" class="btn secondary" data-goto="${un[0]}">Go to the first unanswered (Q ${un[0] + 1})</button>` : ''}${fl.length ? `<button type="button" class="btn secondary" data-goto="${fl[0]}">Go to the first flagged (Q ${fl[0] + 1})</button>` : ''}</div>` : ''}
      <p class="muted small" style="margin-top:12px">You cannot change your answers after this.</p>`,
    footer: '<button type="button" class="btn" id="submit">Submit</button>',
  });
  $$('[data-goto]', d).forEach(b => b.addEventListener('click', async () => { await U.closeSheet(d); a.idx = +b.dataset.goto; saveAttempt(); viewTest('screen-fade'); }));
  $('#submit', d).addEventListener('click', async () => { await U.closeSheet(d); finish(false); });
}

async function finish(timeUp) {
  const a = S.attempt; if (!a || !a.items) return;
  clearInterval(timer); timer = null; U.closeAllSheets();
  const att = {
    id: a.id, uid: S.user?.uid || 'local', name: a.name, cohort: a.cohort || '', startedAt: a.startedAt, submittedAt: Date.now(),
    durationSec: Math.min(Math.round((Date.now() - a.startedAt) / 1000), a.settings.minutes * 60),
    // a snapshot of each question as the MO saw it, so results never change when the bank does
    items: a.items.map(({ qid, stem, options, answer, topic, explain, picked }) => ({ qid, stem, options, answer, topic, explain, picked })),
    settings: { count: a.settings.count, passMark: a.settings.passMark, minutes: a.settings.minutes },
    ...(a.attemptNo ? { attemptNo: a.attemptNo } : {}),
  };
  const sm = L.summarise(att); att.score = sm.score; att.total = sm.total; att.pass = sm.pass;
  S.last = { ...att, images: a.items.map(x => x.image || ''), review: a.settings.review, timeUp, maxAttempts: a.maxAttempts || 0 };
  lsSet('mo-last', JSON.stringify(S.last));
  S.attempt = null; saveAttempt();
  outboxAdd(att);
  pendingAnim = 'screen-fade';
  if (location.hash === '#/result') route(); else location.replace('#/result');
  flushOutbox();
}

// Finished tests wait in the outbox until the server has them (weak signal, closed tab: nothing is lost).
const outbox = () => lsJson('mo-outbox') || [];
const outboxAdd = att => { lsSet('mo-outbox', JSON.stringify([...outbox().filter(x => x.id !== att.id), att])); };
let flushing = false, outboxStuck = false;
async function flushOutbox() {
  if (flushing) return; flushing = true; outboxStuck = false;
  try {
    for (const att of outbox()) {
      try {
        await api.submitAttempt(att);
        lsSet('mo-outbox', JSON.stringify(outbox().filter(x => x.id !== att.id)));
        if (S.last?.id === att.id) { S.last.saveError = ''; lsSet('mo-last', JSON.stringify(S.last)); }
      } catch (e) {
        if (S.last?.id === att.id) S.last.saveError = e.code || 'error';
        if (e.code === 'offline') break;   // no connection: stop and retry later; any other refusal only parks this result
        outboxStuck = true;
      }
    }
  } finally { flushing = false; }
  paintSaved(); repaintPills();
}
// sent again whenever there is a chance: signal back, the page comes to the front, every minute while it is open
window.addEventListener('online', flushOutbox);
document.addEventListener('visibilitychange', () => { if (!document.hidden && outbox().length) flushOutbox(); });
setInterval(() => { if (!document.hidden && outbox().length) flushOutbox(); }, 60000);

function paintSaved() {
  const el = $('#saved'); if (!el || !S.last) return;
  const waiting = outbox().some(x => x.id === S.last.id);
  el.className = 'saved ' + (waiting ? 'warn' : 'ok');
  el.innerHTML = waiting
    ? `<span class="pill warn">Saving your result…</span> <span class="small">${S.last.saveError === 'permission' ? 'Your login has expired (the passphrase was changed). Go back to the start and sign in again with the new passphrase; your result is sent then.' : 'Your result is only on this phone until it is saved. Keep the app open with a signal.'}</span> <button type="button" class="link small" id="retry">Try now</button>`
    : '<span class="pill ok">Saved</span> <span class="small">The faculty can see your result.</span>';
  $('#retry')?.addEventListener('click', () => flushOutbox());
}

function viewResult() {
  const r = S.last;
  if (!r) return go('#/');
  const sm = L.summarise(r), review = r.review || 'marks', left = (r.maxAttempts || 0) - (r.attemptNo || 0);
  const rows = r.items.map((it, i) => {
    const ok = it.picked === it.answer, state = ok ? 'correct' : it.picked == null ? 'not answered' : 'wrong';
    const mk = `<span class="mark ${ok ? 'ok' : it.picked == null ? 'none' : 'bad'}" aria-hidden="true">${ok ? icon.tick : it.picked == null ? '' : icon.cross}</span>`;
    const inner = `${mk}<span class="row-main"><span class="row-title clamp2">${i + 1}. ${esc(it.stem)}</span><span class="vh">, ${state}</span></span>`;
    return `<li>${review === 'full' ? `<a class="row-link" href="#/result/${i}">${inner}${icon.chevron}</a>` : `<div class="list-row">${inner}</div>`}</li>`;
  }).join('');
  setScreen(`${bar({ title: 'Result' })}<div class="content">
    <p class="kicker">${esc(r.name)}</p>
    <h1 class="large-title">Your result</h1>
    <div class="result-head" id="score">${U.ring(sm.pct, Math.round(sm.pct) + '%', sm.pass ? 'pass' : '')}
      <div><p class="verdict${sm.pass ? ' pass' : ''}">${sm.pass ? 'Pass' : 'Not yet'}</p><p class="sumline" style="margin:0">${sm.score} of ${sm.total} right</p><p class="muted small" style="margin:0">Pass mark ${r.settings.passMark}%${r.durationSec != null ? ` · ${L.minutesTaken(r.durationSec)}` : ''}</p></div></div>
    ${r.timeUp ? '<p class="inset-panel">Time ran out, so the test was submitted for you.</p>' : ''}
    <p id="saved" role="status"></p>
    ${r.attemptNo && r.maxAttempts ? `<p>Attempt ${r.attemptNo} of ${r.maxAttempts}. ${sm.pass ? 'You have passed; no more attempts are needed.' : left > 0 ? `You have ${plural(left, 'attempt')} left.` : 'That was your last attempt. Please speak to the faculty.'}</p>` : ''}
    ${review === 'score' ? '' : `<h2 class="section">Your answers</h2><ul class="list" id="answers">${rows}</ul>${review === 'full' ? '<p class="muted small" style="margin-top:8px">Tap a question to see the right answer.</p>' : ''}`}
    <ul class="list" style="margin-top:24px"><li><button type="button" class="row-link" id="dl"><span class="row-main"><span class="row-title">Download my result</span><span class="row-sub">A spreadsheet file, in case you need proof</span></span></button></li></ul>
    </div>`, {
    title: 'Result',
    bottom: `<div class="btn-row">${!sm.pass && left > 0 ? '<button type="button" class="btn secondary" id="done">Done</button><button type="button" class="btn" id="again">Try again</button>' : '<button type="button" class="btn" id="done">Done</button>'}</div>`,
  });
  paintSaved();
  const done = () => { S.last = null; lsDel('mo-last'); go('#/'); };
  $('#done').addEventListener('click', done);
  $('#again')?.addEventListener('click', ev => busy(ev.currentTarget, async () => {
    try { await prepareAttempt(r.name); go('#/ready'); }
    catch (e) { U.toast(e.code === 'limit' ? 'You have used all your attempts. Please speak to the faculty.' : e.code === 'permission' ? 'Go back to the start and enter the passphrase again.' : errText(e), { ms: 6000 }); }
  }));
  $('#dl').addEventListener('click', () => download(`baby-mo-${r.name.replace(/\W+/g, '-')}-${today()}.csv`, L.attemptsToCSV([r])));
}
// One question of the full review (when the settings allow it): your answer against the right one.
function viewReviewItem(i) {
  const r = S.last; if (!r || (r.review || 'marks') !== 'full' || !r.items[i]) return go('#/result');
  const it = r.items[i], n = r.items.length;
  setScreen(`${bar({ title: `Question ${i + 1} of ${n}`, back: { href: '#/result', label: 'Result' }, always: true })}<div class="qbody">
    <p class="kicker">Question ${i + 1} of ${n}${it.topic ? ' · ' + esc(it.topic.replace(/; /g, ' · ')) : ''}</p>
    <h1 class="stem" id="stem">${nl(it.stem)}</h1>
    ${r.images?.[i] ? `<img class="qimg" src="${esc(new URL('../../qbank/' + r.images[i], import.meta.url).href)}" alt="Picture for this question">` : ''}
    ${choicesReadOnly(it)}
    ${it.explain ? `<div class="explain"><p class="kicker">Why</p><p>${nl(it.explain)}</p></div>` : ''}
  </div>`, {
    title: `Review ${i + 1}`, focus: '#stem',
    bottom: `<div class="btn-row"><a class="btn secondary navbtn" href="#/result/${i - 1}"${i === 0 ? ' aria-disabled="true" tabindex="-1" style="pointer-events:none"' : ''}>${icon.back}<span>Previous</span></a><a class="btn navbtn" href="${i < n - 1 ? `#/result/${i + 1}` : '#/result'}"><span>${i < n - 1 ? 'Next' : 'Back to result'}</span></a></div>`,
  });
}
// Read-only choices: the picked one against the answer, in words as well as colour.
function choicesReadOnly(it, { showPick = true } = {}) {
  return `<div class="choices" role="group" aria-labelledby="stem">${it.options.map((o, k) => {
    const right = k === it.answer, picked = showPick && k === it.picked;
    const cls = picked && right ? 'is-right' : picked ? 'is-wrong' : right ? 'is-answer' : 'dim';
    const note = picked && right ? 'Your answer · correct' : picked ? 'Your answer · incorrect' : right ? 'Answer' : '';
    const badge = right ? icon.tick : picked ? icon.cross : L.LETTERS[k];
    return `<div class="choice ${cls}" role="note"><span class="letter" aria-hidden="true">${badge}</span><span class="ctext"><span class="vh">${L.LETTERS[k]}, </span>${nl(o)}${note ? `<span class="cnote"><span class="vh">, </span>${note}</span>` : ''}</span></div>`;
  }).join('')}</div>`;
}

// ========== faculty ==========
async function viewFacultyGate() {
  const signedIn = S.user && !S.user.anonymous;
  const head = `${bar({ title: 'Faculty', back: { href: '#/', label: 'Test' } })}<div class="content">${pills({ outbox: false })}<h1 class="large-title">Faculty</h1>`;
  if (!signedIn) {
    setScreen(`${head}
      <p class="lead">Sign in to see the results, the paper and the faculty list.</p>
      <button type="button" class="btn" id="in">${mode === 'local' ? 'Open the demo as faculty' : 'Sign in with Google'}</button>
      <p id="gate-err" class="err" role="alert" hidden></p>
      <p class="muted small" style="margin-top:16px">On an iPhone, sign in from the browser rather than the home-screen app: Google's sign-in window can fail there.</p></div>`, { title: 'Faculty' });
    $('#in').addEventListener('click', ev => busy(ev.currentTarget, async () => {
      try { await api.facultySignIn(); } catch (e) { const el = $('#gate-err'); el.textContent = e.code === 'offline' ? errText(e) : e.code === 'cancelled' ? 'Sign-in was closed before it finished. Try again.' : 'Sign-in did not finish. Try again.'; el.hidden = false; }
    }));
    return;
  }
  setScreen(`${head}${U.skeleton(2)}</div>`, { title: 'Faculty', keep: true });
  const req = await api.myRequest().catch(() => null);
  setScreen(`${head}
    <p>You are signed in as <b>${esc(S.user.email)}</b>. This account is not faculty yet.</p>
    ${req ? `<div class="inset-panel"><p>Your request was sent ${esc(L.fmtDate(req.requestedAt))}. Ask a faculty member to open <b>People</b> and approve it, then tap <b>Check again</b>.</p></div>
      <div class="btn-stack"><button type="button" class="btn" id="again">Check again</button><div class="btn-row"><button type="button" class="btn secondary" id="cancel">Cancel my request</button><button type="button" class="btn secondary" id="out">Sign out</button></div></div>`
    : `<form id="rq" novalidate><label class="field"><span>Your name</span><input id="rq-name" required maxlength="100" value="${esc(S.user.name && S.user.name !== S.user.email ? S.user.name : '')}" autocomplete="name"><span class="hint">Shown to the faculty who approve you, with your email address.</span></label>
      <div class="btn-stack"><button class="btn" type="submit" id="rq-go">Ask for faculty access</button><button type="button" id="out" class="btn secondary">Sign out</button></div></form>`}
    <p id="gate-err" class="err" role="alert" hidden></p></div>`, { title: 'Faculty', keep: true });
  $('#out')?.addEventListener('click', () => signOut());
  $('#rq')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = $('#rq-name').value.trim().replace(/\s+/g, ' ');
    if (!name) { const el = $('#gate-err'); el.textContent = 'Type your name.'; el.hidden = false; return; }
    await busy($('#rq-go'), async () => {
      try { await api.requestAccess(name); U.toast('Request sent.'); viewFacultyGate(); }
      catch (e) { const el = $('#gate-err'); el.textContent = 'Not sent: ' + errText(e); el.hidden = false; }
    });
  });
  $('#cancel')?.addEventListener('click', async () => { try { await api.cancelRequest(); viewFacultyGate(); } catch (e) { U.toast(errText(e)); } });
  $('#again')?.addEventListener('click', ev => busy(ev.currentTarget, async () => {
    let role = null; try { role = await api.memberRole(S.user.email); } catch { /* offline */ }
    if (role) { S.role = role; S.loaded = {}; U.toast('You are faculty now.'); go('#/faculty/results'); }
    else U.toast('Not approved yet.');
  }));
}
async function signOut() {
  if (S.dirty) S.dirty = false;
  try { await api.signOut(); } catch { /* already signed out */ }
  S.role = null; S.pending = 0; S.loaded = {};
  U.toast('Signed out.');
  go('#/faculty');
}

async function loadResults(force) {
  if (force || !S.loaded.a) {
    const [a, c] = await Promise.all([api.listAttempts(), api.listAttemptCounts().catch(() => [])]);
    S.attempts = a; S.counts = c; S.loaded.a = true;
  }
  if (!S.loaded.s) { S.stored = await api.getSettings().catch(() => null); S.loaded.s = true; }
  return S.attempts;
}
const maxNow = () => L.effectiveSettings(S.paper?.settings || {}, S.stored).maxAttempts;

// ---- Results ----
async function viewResults(by) {
  const tab = ['question', 'topic'].includes(by) ? by : 'person';
  const f = viewResults.f ||= { cohort: '' };
  const head = rest => `${bar({ title: 'Results' })}<div class="content">${pills({ outbox: false })}${rest}</div>`;
  if (!S.loaded.a) setScreen(head(`<h1 class="large-title">Results</h1>${U.skeleton(6)}`), { title: 'Results', tabs: 'results' });
  await loadResults(!S.loaded.a);
  await loadPaper().catch(() => null);
  const all = S.attempts;
  const cohorts = [...new Set(all.map(a => a.cohort).filter(Boolean))].sort().reverse();
  if (f.cohort && !cohorts.includes(f.cohort)) f.cohort = '';
  const rows = all.filter(a => !f.cohort || a.cohort === f.cohort);
  const passN = rows.filter(a => L.summarise(a).pass).length;
  let body = '';
  if (!rows.length) body = '<p class="empty">No results yet. They appear here as soon as an MO submits a test.</p>';
  else if (tab === 'person') {
    const ppl = L.people(rows, S.counts, maxNow());
    const row = p => `<li><a class="row-link" href="#/faculty/person/${encodeURIComponent(p.key)}"><span class="row-main"><span class="row-title">${esc(p.name)}</span><span class="row-sub">Best ${p.best.score}/${p.best.total} · ${plural(p.attempts.length, 'sitting')}${p.cohort ? ' · ' + esc(p.cohort) : ''}</span></span><span class="row-trail"><span class="badge ${p.pass ? 'pass' : 'notyet'}">${p.pass ? 'Pass' : 'Not yet'}</span>${icon.chevron}</span></a></li>`;
    const help = ppl.filter(p => p.needsHelp);
    body = (help.length ? `<h2 class="section">Needs help (${help.length})</h2><ul class="list" id="needshelp">${help.map(row).join('')}</ul>` : '')
      + `<h2 class="section">Everyone (${ppl.length})</h2><ul class="list" id="byperson">${ppl.map(row).join('')}</ul>`;
  } else if (tab === 'question') {
    const st = L.questionStats(rows);
    body = `<p class="muted small" style="margin-top:12px">Lowest score first. A question most people get wrong may be badly worded or have the wrong answer: open it and suggest a change.</p>
      <ul class="list" id="byquestion">${st.map(s => `<li><a class="row-link" href="#/faculty/question/${encodeURIComponent(s.qid)}"><span class="row-main"><span class="row-title clamp2">${esc(s.stem)}</span><span class="row-sub">${plural(s.n, 'answer')}${s.topic ? ' · ' + esc(s.topic) : ''}</span></span><span class="row-trail">${L.isDifficult(s) ? '<span class="badge diff">Difficult</span>' : ''}<span>${s.pct}%</span>${icon.chevron}</span></a></li>`).join('')}</ul>`;
  } else {
    const st = L.topicStats(rows);
    body = `<p class="muted small" style="margin-top:12px">Weakest topic first, across the sittings shown: useful for deciding what to teach.</p>
      <ul class="list" id="bytopic">${st.map(s => `<li><div class="list-row"><span class="row-main"><span class="row-title">${esc(s.topic)}</span><span class="row-sub">${plural(s.n, 'answer')}</span><span class="minibar" aria-hidden="true"><i style="width:${s.pct}%"></i></span></span><span class="row-trail">${s.pct}% right</span></div></li>`).join('')}</ul>`;
  }
  setScreen(head(`<div class="title-row"><h1 class="large-title">Results</h1>${cohorts.length ? `<label class="vh" for="cohort">Cohort</label><select id="cohort" class="cohort-pick">${['', ...cohorts].map(c => `<option value="${esc(c)}"${f.cohort === c ? ' selected' : ''}>${c ? esc(c) : 'All cohorts'}</option>`).join('')}</select>` : ''}</div>
    ${U.seg('by', 'Show results', [['person', 'By person'], ['question', 'By question'], ['topic', 'By topic']], tab, { hideLabel: true })}
    <p class="sumline" id="res-sum">${plural(rows.length, 'sitting')}${rows.length ? ` · ${passN} passed (${Math.round(passN / rows.length * 100)}%)` : ''}</p>
    ${body}
    ${rows.length ? `<ul class="list" style="margin-top:24px"><li><button type="button" class="row-link" id="csv"><span class="row-main"><span class="row-title">Download as a spreadsheet</span><span class="row-sub">Every sitting shown, for Excel or Google Sheets</span></span></button></li></ul>` : ''}`), { title: 'Results', tabs: 'results', keep: S.loaded.a && viewResults.shown === tab });
  viewResults.shown = tab;
  $$('input[name=by]').forEach(r => r.addEventListener('change', () => { history.replaceState(null, '', '#/faculty/results' + (r.value === 'person' ? '' : '?by=' + r.value)); viewResults(r.value); }));
  $('#cohort')?.addEventListener('change', ev => { f.cohort = ev.target.value; viewResults(tab); });
  $('#csv')?.addEventListener('click', () => download(`baby-mo-results-${today()}.csv`, L.attemptsToCSV(rows)));
}

async function viewPerson(key) {
  key = decodeURIComponent(key || '');
  await loadResults(); await loadPaper().catch(() => null);
  const p = L.people(S.attempts, S.counts, maxNow()).find(x => x.key === key);
  if (!p) return go('#/faculty/results');
  const max = maxNow(), used = (S.counts.find(c => c.key === key) || {}).n || 0;
  const last = p.last, missed = (last.items || []).filter(it => it.picked !== it.answer);
  setScreen(`${bar({ title: p.name, back: { href: '#/faculty/results', label: 'Results' } })}<div class="content">
    <p class="kicker">${esc(p.cohort || 'No cohort')}</p>
    <h1 class="large-title">${esc(p.name)}</h1>
    <p class="sumline">Best ${p.best.score}/${p.best.total} (${p.best.pct}%) · <span class="badge ${p.pass ? 'pass' : 'notyet'}">${p.pass ? 'Pass' : 'Not yet'}</span></p>
    <div class="inset-panel"><p id="used">Attempts used: <b>${used} of ${max}</b>.</p>${used > 0 ? '<button type="button" class="btn secondary small" id="grant">Give another attempt</button>' : ''}</div>
    <h2 class="section">Sittings</h2>
    <ul class="list">${p.attempts.map(a => { const s = L.summarise(a); return `<li><a class="row-link" href="#/faculty/attempt/${encodeURIComponent(a.id)}"><span class="row-main"><span class="row-title">${a.attemptNo ? `Attempt ${a.attemptNo}: ` : ''}${s.score}/${s.total} (${s.pct}%)</span><span class="row-sub">${esc(L.fmtDate(a.submittedAt))}${a.durationSec != null ? ' · ' + L.minutesTaken(a.durationSec) : ''}</span></span><span class="row-trail"><span class="badge ${s.pass ? 'pass' : 'notyet'}">${s.pass ? 'Pass' : 'Not yet'}</span>${icon.chevron}</span></a></li>`; }).join('')}</ul>
    <h2 class="section">Missed in the latest sitting (${missed.length})</h2>
    ${missed.length ? `<ul class="list">${missed.map(it => `<li><div class="list-row"><span class="mark ${it.picked == null ? 'none' : 'bad'}" aria-hidden="true">${it.picked == null ? '' : icon.cross}</span><span class="row-main"><span class="row-title clamp2">${esc(it.stem)}</span><span class="row-sub">${it.picked == null ? 'Not answered' : `Chose ${L.LETTERS[it.picked]}`} · answer ${L.LETTERS[it.answer]}. ${esc(it.options[it.answer] || '')}</span></span></div></li>`).join('')}</ul>` : '<p class="empty">Nothing missed.</p>'}
    </div>`, { title: p.name, tabs: 'results' });
  $('#grant')?.addEventListener('click', async ev => {
    if (!await U.confirmSheet({ title: 'Give another attempt?', body: `<p>${esc(p.name)} will be able to sit the test once more.</p>`, ok: 'Give another attempt' })) return;
    await busy(ev.target, async () => {
      try {
        const before = used, n = await api.grantAttempt(key);
        S.loaded.a = false; await viewPerson(key);
        U.toast(`${p.name} can sit the test again (${n} of ${max} used).`, { action: { label: 'Undo', fn: async () => { try { await api.setAttemptCount(key, before); S.loaded.a = false; viewPerson(key); U.toast('Undone.'); } catch (e) { U.toast(errText(e)); } } } });
      } catch (e) { U.toast(errText(e)); }
    });
  });
}

async function viewAttempt(id) {
  id = decodeURIComponent(id || '');
  await loadResults();
  const a = S.attempts.find(x => x.id === id);
  if (!a) return go('#/faculty/results');
  const s = L.summarise(a), key = L.attemptKey(a.cohort, a.name);
  setScreen(`${bar({ title: a.name, back: { href: '#/faculty/person/' + encodeURIComponent(key), label: a.name } })}<div class="content">
    <p class="kicker">${a.attemptNo ? `Attempt ${a.attemptNo} · ` : ''}${esc(L.fmtDate(a.submittedAt))}</p>
    <h1 class="large-title">${esc(a.name)}</h1>
    <p class="sumline">${s.score}/${s.total} (${s.pct}%) · <span class="badge ${s.pass ? 'pass' : 'notyet'}">${s.pass ? 'Pass' : 'Not yet'}</span>${a.durationSec != null ? ` · ${L.minutesTaken(a.durationSec)}` : ''}</p>
    <ul class="list" id="att-items">${a.items.map((it, i) => { const ok = it.picked === it.answer; return `<li><div class="list-row"><span class="mark ${ok ? 'ok' : it.picked == null ? 'none' : 'bad'}" aria-hidden="true">${ok ? icon.tick : it.picked == null ? '' : icon.cross}</span><span class="row-main"><span class="row-title">${i + 1}. ${esc(it.stem)}</span><span class="row-sub">${it.picked == null ? 'Not answered' : `Chose ${L.LETTERS[it.picked]}. ${esc(it.options[it.picked] || '')}`}${ok ? ', correct' : ` · answer ${L.LETTERS[it.answer]}. ${esc(it.options[it.answer] || '')}`}</span></span></div></li>`; }).join('')}</ul>
    ${S.role === 'admin' ? '<p style="margin-top:24px"><button type="button" class="btn danger" id="delatt">Delete this result</button></p>' : ''}
    </div>`, { title: a.name, tabs: 'results' });
  $('#delatt')?.addEventListener('click', async () => {
    if (!await U.confirmSheet({ title: 'Delete this result?', body: `<p>${esc(a.name)}'s sitting is removed for good. Their attempt count does not change.</p>`, ok: 'Delete', danger: true })) return;
    try { await api.deleteAttempt(a.id); S.loaded.a = false; U.toast('Deleted.'); go('#/faculty/results'); } catch (e) { U.toast(errText(e)); }
  });
}

async function viewQuestionStats(qid) {
  qid = decodeURIComponent(qid || '');
  await loadResults(); await loadPaper().catch(() => null);
  const s = L.questionStats(S.attempts).find(x => x.qid === qid);
  if (!s) return go('#/faculty/results?by=question');
  const inBank = S.paper?.byId.get(qid);
  const max = Math.max(1, ...s.picks);
  setScreen(`${bar({ title: 'Question', back: { href: '#/faculty/results?by=question', label: 'Results' } })}<div class="content">
    <p class="kicker">${plural(s.n, 'answer')} · ${s.pct}% right${L.isDifficult(s) ? ' · difficult' : ''}</p>
    <h1 class="stem" id="stem">${nl(s.stem)}</h1>
    <ul class="list" id="picks">${s.options.map((o, k) => `<li><div class="list-row"><span class="letter" aria-hidden="true">${k === s.answer ? icon.tick : L.LETTERS[k]}</span><span class="row-main"><span class="row-title"><span class="vh">${L.LETTERS[k]}, </span>${esc(o)}${k === s.answer ? ' <span class="badge pass">Answer</span>' : ''}</span><span class="minibar" aria-hidden="true"><i style="width:${Math.round((s.picks[k] || 0) / max * 100)}%"></i></span></span><span class="row-trail">${s.picks[k] || 0} chose</span></div></li>`).join('')}
      ${s.skipped ? `<li><div class="list-row"><span class="row-main"><span class="row-title">Not answered</span></span><span class="row-trail">${s.skipped}</span></div></li>` : ''}</ul>
    ${inBank ? `<ul class="list" style="margin-top:24px"><li><a class="row-link" href="#/faculty/paper/${encodeURIComponent(qid)}"><span class="row-main"><span class="row-title">Open in the paper</span><span class="row-sub">See the explanation or suggest a change</span></span>${icon.chevron}</a></li></ul>` : '<p class="muted small" style="margin-top:16px">This question is no longer in the paper. The wording above is how the MOs saw it.</p>'}
    </div>`, { title: 'Question', tabs: 'results', focus: '#stem' });
}

// ---- Paper (read-only) ----
async function viewPaper() {
  const head = rest => `${bar({ title: 'Paper' })}<div class="content">${pills({ outbox: false })}${rest}</div>`;
  if (!S.paper) setScreen(head(`<h1 class="large-title">Paper</h1>${U.skeleton(6)}`), { title: 'Paper', tabs: 'paper' });
  let P;
  try { P = await loadPaper(); } catch (e) { setScreen(head(`<h1 class="large-title">Paper</h1>${errorPanel(e)}`), { title: 'Paper', tabs: 'paper' }); $('#retry-route')?.addEventListener('click', () => viewPaper()); return; }
  if (!S.loaded.s) { S.stored = await api.getSettings().catch(() => null); S.loaded.s = true; }
  const st = settingsNow(), sum = L.paperSummary(P.pool, st), drafts = P.all.filter(q => !P.pool.includes(q));
  const row = q => `<li><a class="row-link" href="#/faculty/paper/${encodeURIComponent(q.id)}"><span class="row-main"><span class="row-title clamp2">${esc(q.stem)}</span><span class="row-sub">${esc(q.topics.join(', ') || 'No topic')}</span></span><span class="row-trail">${q.must ? '<span class="badge must">Must</span>' : ''}${q.level === 'hard' ? '<span class="badge hard">Hard</span>' : ''}${q.status !== 'active' || !P.pool.includes(q) ? `<span class="badge draft">${esc(STATUS_LABEL[q.status] || 'Draft')}</span>` : ''}${icon.chevron}</span></a></li>`;
  setScreen(head(`<h1 class="large-title">${esc(P.paper.title || 'Paper')}</h1>
    ${P.paper.about ? `<p class="lead">${esc(P.paper.about)}</p>` : ''}
    <div class="inset-panel" id="paper-sum"><p><b>${sum.perSitting} questions</b> per sitting · ${st.minutes} minutes · pass ${st.passMark}% · ${plural(st.maxAttempts, 'attempt')}</p>
      <p class="small">${sum.ready} ready: ${sum.must} must-ask (in every sitting) and ${sum.hard} hard (${st.hardCount} mixed into each sitting).${sum.short ? ` The paper asks for ${st.count}; ${plural(sum.short, 'more ready question')} would be needed.` : ''}${!sum.mustFit ? ' There are more must-ask questions than fit in a sitting.' : ''}</p></div>
    <h2 class="section">In the test (${P.pool.length})</h2>
    ${P.pool.length ? `<ul class="list" id="paper-ready">${P.pool.map(row).join('')}</ul>` : '<p class="empty">No questions are ready yet.</p>'}
    ${drafts.length ? `<h2 class="section">Not given to MOs yet (${drafts.length})</h2><p class="muted small">Drafts waiting for a check, or retired questions.</p><ul class="list" id="paper-drafts">${drafts.map(row).join('')}</ul>` : ''}
    <p class="muted small" style="margin-top:16px">Questions are changed in the question bank, not here, and the owner approves every change. Open a question and tap <b>Suggest a change</b>.</p>`), { title: 'Paper', tabs: 'paper' });
}
async function viewPaperQuestion(id) {
  id = decodeURIComponent(id || '');
  const P = await loadPaper();
  const q = P.byId.get(id);
  if (!q) return go('#/faculty/paper');
  const ready = P.pool.includes(q);
  setScreen(`${bar({ title: 'Question', back: { href: '#/faculty/paper', label: 'Paper' } })}<div class="qbody">
    <p class="kicker">${esc(q.topics.join(' · ') || 'No topic')}</p>
    <p class="badge-row">${q.must ? '<span class="badge must">Must</span>' : ''}${q.level === 'hard' ? '<span class="badge hard">Hard</span>' : ''}${ready ? '' : `<span class="badge draft">${esc(STATUS_LABEL[q.status] || 'Draft')}: not given to MOs</span>`}</p>
    <h1 class="stem" id="stem">${nl(q.stem)}</h1>
    ${q.image ? `<img class="qimg" src="${esc(new URL('../../qbank/' + q.image, import.meta.url).href)}" alt="Picture for this question">` : ''}
    ${choicesReadOnly({ options: q.options, answer: q.answer, picked: null }, { showPick: false })}
    ${q.explain ? `<div class="explain"><p class="kicker">Why</p><p>${nl(q.explain)}</p></div>` : '<p class="muted small" style="margin-top:16px">No explanation yet.</p>'}
    ${q.review ? `<div class="inset-panel" style="margin-top:16px"><p class="kicker">Note for the checker</p><p class="small">${nl(q.review)}</p></div>` : ''}
    <p class="muted small" style="margin-top:16px">${q.source ? 'Source: ' + esc(q.source) + '. ' : ''}${q.updated ? 'Updated ' + esc(q.updated) + '. ' : ''}Question ${esc(q.id)}.</p>
    <a class="btn secondary" id="suggest" href="${esc(new URL('#/q/' + encodeURIComponent(q.id) + '?suggest', QBANK_APP).href)}">Suggest a change →</a>
  </div>`, { title: 'Question', tabs: 'paper', focus: '#stem' });
}

// ---- People ----
async function viewPeople() {
  const head = rest => `${bar({ title: 'People' })}<div class="content">${pills({ outbox: false })}<h1 class="large-title">People</h1>${rest}</div>`;
  if (!viewPeople.seen) setScreen(head(U.skeleton(4)), { title: 'People', tabs: 'people' });
  viewPeople.seen = true;
  const [members, reqs] = await Promise.all([api.listMembers().catch(() => []), api.listRequests().catch(() => [])]);
  S.pending = reqs.length;
  const admin = S.role === 'admin';
  setScreen(head(`<p class="lead">Faculty see every result. Anyone with a Google account can ask for access from the Faculty sign-in page; any faculty member can approve.</p>
    <h2 class="section">Waiting for approval (${reqs.length})</h2>
    ${reqs.length ? `<ul class="list" id="reqs">${reqs.map(r => `<li><div class="list-row" style="flex-wrap:wrap"><span class="row-main"><span class="row-title">${esc(r.name)}</span><span class="row-sub">${esc(r.email)} · asked ${esc(L.fmtDate(r.requestedAt))}</span></span>
      <div class="btn-row" style="flex:1 1 100%"><button type="button" class="btn secondary small" data-dec="${esc(r.email)}">Decline</button><button type="button" class="btn small" data-ap="${esc(r.email)}">Approve</button></div></div></li>`).join('')}</ul>` : '<p class="empty">Nobody is waiting.</p>'}
    <h2 class="section">Faculty (${members.length})</h2>
    <ul class="list" id="mem">${members.map((m, i) => `<li><div class="list-row" style="flex-wrap:wrap"><span class="row-main"><span class="row-title">${esc(m.name || m.email)}</span><span class="row-sub">${esc(m.email)}${m.email === S.user.email ? ' · you' : ''}</span></span>
      ${admin && m.email !== S.user.email ? `<div style="flex:1 1 100%;display:flex;gap:12px;align-items:center"><div style="flex:1 1 auto">${U.seg('role' + i, 'Role for ' + (m.name || m.email), [['editor', 'Faculty'], ['admin', 'Admin']], m.role, { hideLabel: true }).replace('class="seg seg-bare"', 'class="seg seg-bare" style="margin:0" data-member="' + esc(m.email) + '"')}</div><button type="button" class="link small" data-rm="${esc(m.email)}">Remove</button></div>` : `<span class="row-trail">${m.role === 'admin' ? 'Admin' : 'Faculty'}</span>`}</div></li>`).join('')}</ul>
    <p class="muted small" style="margin-top:8px">Faculty can approve new faculty. Only admins can make someone an admin, remove a person, or change the settings and passphrase.</p>
    ${admin ? `<h2 class="section">Add someone yourself</h2><form id="mf" class="inset-panel" novalidate><label class="field"><span>Google email</span><input id="m-email" type="email" required placeholder="name@example.com" autocomplete="off"></label><label class="field"><span>Name</span><input id="m-name" placeholder="Dr Tan" autocomplete="off"></label>
      ${U.seg('m-role', 'Role', [['editor', 'Faculty'], ['admin', 'Admin']], 'editor')}<p id="mf-err" class="err" role="alert" hidden></p><button class="btn secondary" type="submit">Add</button></form>` : ''}`), { title: 'People', tabs: 'people', keep: true });
  const again = () => viewPeople();
  $$('[data-ap]').forEach(b => b.addEventListener('click', () => busy(b, async () => {
    try { await api.approveRequest(b.dataset.ap, 'editor'); U.toast('Approved.'); } catch (e) { U.toast(e.code === 'not-found' ? 'That request is gone (already handled?).' : errText(e)); }
    again();
  })));
  $$('[data-dec]').forEach(b => b.addEventListener('click', async () => {
    if (!await U.confirmSheet({ title: 'Decline this request?', body: `<p>${esc(b.dataset.dec)} will not get access. They can ask again.</p>`, ok: 'Decline', danger: true })) return;
    try { await api.declineRequest(b.dataset.dec); U.toast('Declined.'); again(); } catch (e) { U.toast(errText(e)); }
  }));
  $$('[data-member]').forEach(fs => fs.addEventListener('change', async ev => {
    const m = members.find(x => x.email === fs.dataset.member), to = ev.target.value;
    if (to === 'editor' && !await U.confirmSheet({ title: 'Remove admin rights?', body: `<p>${esc(m.email)} will stay faculty but can no longer change settings, the passphrase or the faculty list.</p>`, ok: 'Make faculty' })) return again();
    try { await api.saveMember(m.email, { role: to, name: m.name || '' }); U.toast(to === 'admin' ? 'Now an admin.' : 'Now faculty.'); } catch (e) { U.toast(errText(e)); }
    again();
  }));
  $$('[data-rm]').forEach(b => b.addEventListener('click', async () => {
    if (!await U.confirmSheet({ title: 'Remove from faculty?', body: `<p>${esc(b.dataset.rm)} will no longer see results.</p>`, ok: 'Remove', danger: true })) return;
    try { await api.removeMember(b.dataset.rm); U.toast('Removed.'); again(); } catch (e) { U.toast(errText(e)); }
  }));
  $('#mf')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const email = $('#m-email').value.trim(), err = $('#mf-err');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.textContent = 'Type a Google email address.'; err.hidden = false; return; }
    try { await api.saveMember(email, { role: U.segVal('m-role') || 'editor', name: $('#m-name').value.trim() }); U.toast('Added.'); again(); } catch (e) { U.toast(errText(e)); }
  });
}

// ---- Settings ----
async function viewSettings() {
  const admin = S.role === 'admin';
  S.dirty = false;
  const head = rest => `${bar({ title: 'Settings' })}<div class="content">${pills({ outbox: false })}<h1 class="large-title">Settings</h1>${rest}</div>`;
  setScreen(head(U.skeleton(5)), { title: 'Settings', tabs: 'settings' });
  await loadPaper().catch(() => null);
  S.stored = await api.getSettings().catch(() => null); S.loaded.s = true;
  const st = settingsNow(), paperSt = L.effectiveSettings({ ...(S.paper?.settings || {}) }, null);
  const pass = admin ? await api.getPassphrase().catch(() => '') : '';
  const account = `<h2 class="section">Signed in</h2><ul class="list"><li><div class="list-row"><span class="row-main"><span class="row-title">${esc(S.user?.email || '')}</span><span class="row-sub">${admin ? 'Admin' : 'Faculty'}${mode === 'local' ? ' (demo)' : ''}</span></span><button type="button" class="btn secondary small" id="signout">Sign out</button></div></li>
    <li><a class="row-link" href="#/"><span class="row-main"><span class="row-title">Open the test as an MO</span></span>${icon.chevron}</a></li></ul>`;
  const help = `<h2 class="section">For each new intake</h2><ol class="small" style="padding-left:20px;margin:0 0 12px"><li>Change the <b>passphrase</b> and the <b>cohort</b> here (admins).</li><li>Send the MOs the link and the passphrase.</li><li>Results appear under <b>Results</b>. Download them as a spreadsheet.</li></ol>
    <p class="small muted">The questions come from the department's question bank (the paper "${esc(S.paper?.paper?.title || 'Baby MO test')}"). To change one, open it under <b>Paper</b> and tap <b>Suggest a change</b>.</p>`;
  if (!admin) { setScreen(head(`<p class="lead">Only admins change the test settings and the passphrase.</p>${account}${help}${U.versionLine()}`), { title: 'Settings', tabs: 'settings', keep: true }); wireAccount(); U.paintVersion('babymo-'); return; }
  setScreen(head(`<form id="sf" novalidate>
      <h2 class="section">This intake</h2>
      <label class="field"><span>Cohort</span><input id="s-cohort" value="${esc(st.cohort)}" maxlength="60" placeholder="e.g. Oct 2026 intake" autocomplete="off"><span class="hint">Stamped on every result. A new cohort name starts everyone's attempts afresh.</span></label>
      <label class="field"><span>Passphrase for MOs</span><input id="s-pass" value="${esc(pass)}" autocomplete="off" maxlength="100"><span class="hint">${mode === 'cloud' ? 'Changing it signs everyone out of new tests.' : 'Demo passphrase.'} Anyone who has it can sit the test, so change it for each intake.</span></label>
      <label class="field"><span>Message before the test <span class="muted">(optional)</span></span><textarea id="s-intro" rows="3" maxlength="1000">${esc(st.intro)}</textarea></label>
      ${U.seg('review', 'After submitting, the MO sees', L.REVIEW, st.review)}
      <h2 class="section">The sitting</h2>
      ${U.stepper('s-min', 'Minutes', st.minutes)}
      ${U.stepper('s-att', 'Attempts each', st.maxAttempts)}
      ${U.stepper('s-count', 'Questions', st.count, { hint: `Paper: ${paperSt.count}` })}
      <p style="margin:0"><button type="button" class="link small" id="d-count">Use paper default (${paperSt.count})</button></p>
      ${U.stepper('s-pm', 'Pass mark %', st.passMark, { hint: `Paper: ${paperSt.passMark}%` })}
      <p style="margin:0 0 8px"><button type="button" class="link small" id="d-pm">Use paper default (${paperSt.passMark}%)</button></p>
      <p class="muted small">Must-ask and hard questions come from the paper (${S.paper ? `${S.paper.pool.filter(q => q.must).length} must-ask, ${st.hardCount} hard per sitting` : 'not loaded'}).</p>
      <p id="serr" class="err" role="alert" hidden></p>
    </form>${account}${help}${U.versionLine()}`), { title: 'Settings', tabs: 'settings', keep: true, bottom: '<button type="submit" form="sf" class="btn" id="save">Save settings</button>' });
  wireAccount(); U.paintVersion('babymo-');
  const dirty = () => { S.dirty = true; };
  const steps = {
    min: U.wireStepper('s-min', { min: 1, max: 240, step: 5, onChange: dirty, values: [1, 5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120, 180, 240] }),
    att: U.wireStepper('s-att', { min: 1, max: 10, onChange: dirty }),
    count: U.wireStepper('s-count', { min: 1, max: 100, onChange: dirty }),
    pm: U.wireStepper('s-pm', { min: 5, max: 100, step: 5, onChange: dirty }),
  };
  $('#sf').addEventListener('input', dirty); $('#sf').addEventListener('change', dirty);
  $('#d-count').addEventListener('click', () => { steps.count.set(paperSt.count); dirty(); });
  $('#d-pm').addEventListener('click', () => { steps.pm.set(paperSt.passMark); dirty(); });
  $('#sf').addEventListener('submit', async ev => {
    ev.preventDefault();
    const err = $('#serr'); err.hidden = true;
    const p = $('#s-pass').value.trim();
    if (p.length < 4) { err.textContent = 'The passphrase needs at least 4 characters.'; err.hidden = false; $('#s-pass').focus(); return; }
    const n = { title: st.title, count: steps.count.get(), minutes: steps.min.get(), passMark: steps.pm.get(), maxAttempts: steps.att.get(), cohort: $('#s-cohort').value.trim(), review: U.segVal('review') || 'marks', intro: $('#s-intro').value.trim() };
    await busy($('#save'), async () => {
      try {
        await api.saveSettings(n, S.user);
        if (p !== pass) await api.setPassphrase(p);
        S.stored = { ...n }; S.dirty = false; S.loaded.a = false;
        U.toast('Settings saved.');
        viewSettings();
      } catch (e) { err.textContent = 'Not saved: ' + errText(e); err.hidden = false; }
    });
  });
}
function wireAccount() { $('#signout')?.addEventListener('click', () => signOut()); }

// ---------- installable app (service worker): safe updates ----------
// A new version waits (sw.js has no skipWaiting on install). The page switches to it only on a top-level screen with no
// test open, no sheet open and nothing typed; otherwise, when no test is open, a toast offers "Restart". It never
// reloads during a test, on the Ready or Result screens, or while someone is typing. On the first install nothing reloads.
let swReg = null, reloading = false, offered = false;
function safeNow() {
  if (S.attempt?.items || S.dirty || U.sheetOpen()) return false;
  const ae = document.activeElement;
  if (ae && ae.matches('input, textarea, select')) return false;
  if ($$('main input:not([type=checkbox]):not([type=radio]), main textarea').some(el => el.value !== el.defaultValue)) return false;
  const h = (location.hash || '#/').split('?')[0];
  return ['#/', '#', '#/faculty', '#/faculty/results', '#/faculty/paper', '#/faculty/people', '#/faculty/settings'].includes(h);
}
// Reads the registration's waiting worker each time (an "updatefound" handler can run after the worker has already
// finished installing, so don't rely on catching it there).
function applyUpdate() {
  const w = swReg?.waiting;
  if (!w || reloading || !navigator.serviceWorker.controller) return;
  if (safeNow()) return switchNow(w, true);
  if (!offered && !S.attempt && !/^#\/(test|ready|result)/.test(location.hash)) {
    offered = true;
    U.toast('Update ready', { ms: 10000, action: { label: 'Restart', fn: () => { const ww = swReg?.waiting; if (ww) switchNow(ww, false); } } });
  }
}
// Ask the waiting worker to take over; the page reloads on "controllerchange". Chrome sometimes holds the switch while
// the old worker still counts this page as busy: if nothing has happened after 3 s, reload anyway (the old page going
// away lets the new worker take over). auto: only while it is still safe.
function switchNow(w, auto) {
  reloading = true; w.postMessage('skipWaiting');
  setTimeout(() => { if (!switched && (!auto || safeNow())) location.reload(); else if (!switched) reloading = false; }, 3000);
}
let switched = false;
async function setupPwa() {
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) return;
  let hadController = !!navigator.serviceWorker.controller;           // false on the very first visit
  let reg; try { reg = await navigator.serviceWorker.register('sw.js'); } catch { return; }
  if (!reg) return;   // blocked (private mode, tests)
  swReg = reg;
  reg.addEventListener('updatefound', () => { const w = reg.installing; w?.addEventListener('statechange', () => { if (w.state === 'installed') applyUpdate(); }); });
  applyUpdate();
  const check = () => reg.update().catch(() => {});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { check(); applyUpdate(); } });
  window.addEventListener('online', check);
  document.addEventListener('focusout', () => setTimeout(applyUpdate, 300));
  window.addEventListener('popstate', () => setTimeout(applyUpdate, 300));   // a sheet closing
  setInterval(check, 10 * 60 * 1000);
  setInterval(applyUpdate, 5000);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }               // first install taking control: no reload
    if (reloading) { switched = true; location.reload(); }
    else { reloading = true; const wait = setInterval(() => { if (safeNow()) { clearInterval(wait); location.reload(); } }, 1000); }   // another tab switched: reload here when safe
  });
}

// "Add to home screen": Android offers a button; on iPhone it is Share, then Add to Home Screen
let installEvent = null;
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvent = ev; paintInstall(); });
window.addEventListener('appinstalled', () => { installEvent = null; paintInstall(); });
function paintInstall() {
  const el = $('#install'); if (!el) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (standalone) { el.hidden = true; return; }
  if (installEvent) { el.hidden = false; el.innerHTML = '<button type="button" class="link small" id="doinstall">Install this app on your phone</button>'; $('#doinstall').addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; paintInstall(); }); }
  else if (ios) { el.hidden = false; el.textContent = 'To keep this on your phone: tap Share, then Add to Home Screen.'; }
  else el.hidden = true;
}

// ---------- start ----------
(async function init() {
  let first = true;
  await api.watchUser(async u => {
    const wasFaculty = !!S.role, prevId = S.user?.uid;
    S.user = u; S.role = null;
    if (u && !u.anonymous) { try { S.role = await api.memberRole(u.email); } catch { S.role = null; } }
    S.loaded = {};
    if (first) { first = false; userReady(); }
    // an MO's own anonymous login appearing must not redraw the page they are on; faculty signing in or out must
    else if (wasFaculty !== !!S.role || (u && !u.anonymous && prevId !== u.uid) || (!u && wasFaculty)) { if (location.hash.startsWith('#/faculty')) route(); }
    else if (location.hash.startsWith('#/faculty') && !S.role) route();
    if (u) flushOutbox();
  });
  setTimeout(userReady, 5000);   // never sit on "Loading" if sign-in services are unreachable
  setupPwa();
  route();
  if (outbox().length) flushOutbox();
})();
