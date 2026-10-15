// Baby MO test: the MOs' test (name + passphrase) and the faculty's Results, Paper, People and Settings (Google sign-in).
// One page, hash routes, drawn with the shared phone-app kit (../assets/app/app.css, DESIGN-APP.md).
// Questions come from the shared question bank (../qbank/): the paper qbank/papers/babymo.json and the bank
// qbank/bank/questions.json, read-only here. Sign-in, settings and results go through store.js (Firebase, or this
// browser only in demo mode). Faculty don't edit questions here: they suggest changes in the qbank app.

import { api, mode, isDemo } from './store.js';
import * as L from './logic.js';
import { resolvePaper, STATUS_LABEL } from '../../qbank/js/bank.js';
import * as U from './ui.js';

const { $, $$, esc, nl, icon, chevron } = U;
const PAPER_URL = new URL('../../qbank/papers/babymo.json', import.meta.url);
const BANK_URL = new URL('../../qbank/bank/questions.json', import.meta.url);
const QBANK_APP = new URL('../../qbank/', import.meta.url);
const bankImg = file => new URL('../../qbank/' + file, import.meta.url).href;

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
let timer = null, userReady, pendingAnim = null, firstPaint = true, curTab = null;
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

// ---------- building blocks (the kit's markup) ----------
function bar({ title = '', back, trail = '', solid = false } = {}) {
  const lead = back ? `<a class="app-bar-btn app-back" href="${back.href}"${back.id ? ` id="${back.id}"` : ''}><span class="bm-back-label">${esc(back.label)}</span></a>` : '';
  return `<header class="app-bar${solid ? ' app-bar--solid' : ''}"><div class="app-bar-row"><div class="app-bar-lead">${lead}</div><p class="app-bar-title" aria-hidden="true">${esc(title)}</p><div class="app-bar-trail">${trail}</div></div></header>`;
}
// one grouped-list row: a link (href), a button (button: true) or plain
function row({ href, button, id, title, sub = '', lead = '', trail = '', cls = '', clamp = false, attrs = '', chev = !!href }) {
  const tag = href ? 'a' : button ? 'button' : 'div';
  const open = `<${tag} class="app-row ${cls}"${href ? ` href="${href}"` : ''}${button ? ' type="button"' : ''}${id ? ` id="${id}"` : ''}${attrs}>`;
  return `<li>${open}${lead}<span class="app-row-body"><span class="app-row-title${clamp ? ' bm-clamp' : ''}">${title}</span>${sub ? `<span class="app-row-sub">${sub}</span>` : ''}</span>${trail}${chev ? chevron : ''}</${tag}></li>`;
}
const section = (header, inner, { id = '', footer = '', cls = '' } = {}) => `<section class="app-section ${cls}">${header ? `<h2 class="app-section-header">${header}</h2>` : ''}<ul class="app-list"${id ? ` id="${id}"` : ''}>${inner}</ul>${footer ? `<p class="app-section-footer">${footer}</p>` : ''}</section>`;
const tile = (svg, cls = '') => `<span class="app-row-icon ${cls}" aria-hidden="true">${svg}</span>`;
const markOf = it => { const ok = it.picked === it.answer; return `<span class="bm-mark ${ok ? 'is-ok' : it.picked == null ? 'is-none' : 'is-bad'}" aria-hidden="true">${ok ? icon.tick : it.picked == null ? '' : icon.cross}</span>`; };
const passBadge = pass => `<span class="app-badge ${pass ? 'app-badge--ok' : 'app-badge--bad'}">${pass ? 'Pass' : 'Not yet'}</span>`;

// Draw a screen: the bar, the main content, and at the bottom either the faculty tab bar or a toolbar.
// keep: redraw the same screen in place (no jump to the top, no focus move).
function setScreen({ head = '', body = '', toolbar = '', tabs = null, title = '', keep = false, focus = 'h1', savebar = '' }) {
  clearInterval(timer); timer = null;
  const y = window.scrollY;
  $('#view').innerHTML = `${head}<main class="app-main" id="app" tabindex="-1">${body}</main>`;
  curTab = tabs;
  const bar = $('#view .app-bar');   // the kit: no title fade from the old screen's state
  if (bar) { bar.classList.add('app-bar--instant'); requestAnimationFrame(() => requestAnimationFrame(() => bar.classList.remove('app-bar--instant'))); }
  $('#chrome').innerHTML = (savebar ? `<div class="bm-savebar">${savebar}</div>` : '') + (toolbar ? `<div class="app-toolbar" id="toolbar"><div class="app-toolbar-inner">${toolbar}</div></div>` : '') + (tabs ? tabBar(tabs) : '');
  document.body.classList.toggle('app-has-tabbar', !!tabs);
  document.body.classList.toggle('app-has-toolbar', !!toolbar);
  document.body.classList.toggle('bm-has-savebar', !!savebar);
  document.title = (title ? title + ' · ' : '') + 'Baby MO test';
  U.watchLargeTitle();
  if (keep) { window.scrollTo(0, y); return; }
  window.scrollTo(0, 0);
  const anim = pendingAnim; pendingAnim = null;
  if (anim && !firstPaint && !U.reducedMotion()) $('#app').classList.add(anim);
  const h = focus && $('#app').querySelector(focus);
  if (h && !firstPaint) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
  firstPaint = false;
}
function tabBar(on) {
  const tab = (href, key, label, ic, badge) => `<a class="app-tab" href="${href}"${on === key ? ' aria-current="page"' : ''}><span class="app-tab-icon" aria-hidden="true">${ic}${badge ? `<span class="app-tab-badge">${badge}</span>` : ''}</span>${label}${badge ? `<span class="app-sr">, ${badge} waiting</span>` : ''}</a>`;
  return `<nav class="app-tabbar" id="tabs" aria-label="Faculty sections"><div class="app-tabbar-inner">${tab('#/faculty/results', 'results', 'Results', icon.results)}${tab('#/faculty/paper', 'paper', 'Paper', icon.paper)}${tab('#/faculty/people', 'people', 'People', icon.people, S.pending)}${tab('#/faculty/settings', 'settings', 'Settings', icon.settings)}</div></nav>`;
}
function repaintTabs() { const t = $('#tabs'); if (t && curTab) t.outerHTML = tabBar(curTab); }
function pills({ outbox: showOutbox = true } = {}) {
  const out = [];
  if (!navigator.onLine) out.push('<span class="app-badge app-badge--warn">Offline</span>');
  if (mode === 'local') out.push(`<span class="app-badge app-badge--ink bm-demo">${isDemo ? 'Demo' : 'Not connected'}: this browser only</span>`);
  const n = outbox().length;
  if (showOutbox && n) out.push(`<span class="app-badge app-badge--warn" id="outpill">${n === 1 ? 'Saving your result…' : `Saving ${n} results…`}</span>`);
  return `<div class="bm-pills">${out.join('')}</div>`;
}
window.addEventListener('online', () => repaintPills()); window.addEventListener('offline', () => repaintPills());
function repaintPills() { const el = $('#app .bm-pills'); if (el) el.outerHTML = pills({ outbox: !location.hash.startsWith('#/faculty') }); }
const errorPanel = (e, retry = true) => `<div class="app-panel" role="alert"><p class="app-text">${esc(errText(e))}</p>${retry ? '<button type="button" class="app-btn app-btn--secondary app-btn--compact" id="retry-route">Try again</button>' : ''}</div>`;

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
  pendingAnim = b > a ? 'bm-push' : b < a ? 'bm-pop' : 'bm-fade';
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
      // back (Android, the iOS swipe) from a test lands on Ready: return to the test without piling up history
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
    setScreen({ head: bar({ title: 'Something went wrong', back: { href: '#/', label: 'Start' } }), body: `<h1 class="app-large-title">Something went wrong</h1>${errorPanel(e)}`, title: 'Error' });
    $('#retry-route')?.addEventListener('click', () => route());
  } finally { applyUpdate(); }
}
async function refreshPending() {
  try { const n = (await api.listRequests()).length; if (n !== S.pending) { S.pending = n; repaintTabs(); } } catch { /* not allowed or offline: no badge */ }
}

// ========== MO: start, ready, test, result ==========
function viewStart() {
  const a = S.attempt;
  if (a?.items && L.secondsLeft(a.startedAt, a.settings.minutes) <= 0) return finish(true);
  const answered = a?.items ? a.items.filter(i => i.picked != null).length : 0;
  const last = S.last, ls = last && L.summarise(last);
  const resume = a?.items ? `<div class="app-card app-card--accent" id="resume"><p class="app-kicker">Test in progress</p><p class="app-card-title">Question ${(a.idx || 0) + 1} of ${a.items.length}</p><p class="app-small app-muted" style="margin:0">${answered} answered · ${L.clock(L.secondsLeft(a.startedAt, a.settings.minutes))} left. The clock keeps running while you are away.</p><div class="app-card-actions"><a class="app-btn app-btn--primary" href="#/test" id="resume-go">Resume the test</a></div></div>` : '';
  setScreen({
    head: bar({ title: 'Baby MO test' }), title: 'Start',
    body: `${pills()}
    <h1 class="app-large-title">Baby MO test</h1>
    <p class="app-large-sub">For new medical officers in NTFGH anaesthesia. Enter your name and the passphrase you were given.</p>
    ${resume || `<form id="start" autocomplete="off" novalidate>
      <label class="app-field"><span class="app-field-label">Your name</span><input class="app-input" id="f-name" required maxlength="80" value="${esc(S.name)}" autocomplete="name" placeholder="As on the roster" enterkeyhint="next"></label>
      <label class="app-field"><span class="app-field-label">Passphrase</span><input class="app-input" id="f-pass" required type="password" autocomplete="off" enterkeyhint="go" aria-describedby="start-err"${mode === 'local' ? ' placeholder="demo"' : ''}></label>
      <p id="start-err" class="app-field-error" role="alert" hidden></p>
      <div class="app-btn-stack"><button class="app-btn app-btn--primary app-btn--block" type="submit" id="start-go">Start</button></div>
    </form>`}
    ${last ? section('On this phone', row({ href: '#/result', title: 'Your last result', sub: `${esc(last.name)}: ${ls.score} of ${ls.total}, ${ls.pass ? 'pass' : 'not yet'}`, lead: tile(icon.results) })) : ''}
    <p id="install" class="app-small app-muted" hidden></p>
    ${section('Faculty', row({ href: '#/faculty', id: 'faculty-link', title: 'Faculty sign in', sub: 'Results, the paper and the faculty list', lead: tile(icon.person) }))}
    ${U.versionLine()}`,
  });
  paintInstall(); U.paintVersion('babymo-');
  $('#start')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = $('#f-name').value.trim().replace(/\s+/g, ' '), pass = $('#f-pass').value;
    const err = $('#start-err'); err.hidden = true; $('#f-pass').removeAttribute('aria-invalid');
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
        if (e.code === 'bad-passphrase') $('#f-pass').setAttribute('aria-invalid', 'true');
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
  const fact = (svg, t) => row({ title: t, lead: tile(svg) });
  setScreen({
    head: bar({ title: 'Ready', back: { href: '#/', label: 'Start', id: 'ready-back' } }), title: 'Ready',
    body: `${pills()}
    <h1 class="app-large-title">Ready, ${esc(a.name)}?</h1>
    <p class="app-large-sub" id="ready-sum">${n} questions · ${st.minutes} minutes · pass ${st.passMark}% · attempt ${a.attemptNo} of ${a.maxAttempts}</p>
    ${a.intro ? `<div class="app-panel"><p class="app-text" style="margin:0">${nl(a.intro)}</p></div>` : ''}
    ${section('Before you begin', [
      fact(icon.tick, `You pass with <b>${L.passCount(n, st.passMark)} or more</b> right out of ${n}.`),
      fact(svgClock, 'The clock starts when you tap Begin, and keeps running if you leave the app.'),
      fact(icon.flag, 'One answer each, no negative marking. You can change answers and flag questions until you submit.'),
      fact(icon.play, 'If the time runs out, your answers are submitted for you.'),
    ].join(''))}`,
    toolbar: '<button type="button" class="app-btn app-btn--outline" id="cancel">Not now</button><button type="button" class="app-btn app-btn--primary" id="go">Begin</button>',
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
    saveAttempt(); pendingAnim = 'bm-push'; go('#/test');
  }));
}
const svgClock = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';

// ---- the test ----
function viewTest(anim) {
  const a = S.attempt;
  if (L.secondsLeft(a.startedAt, a.settings.minutes) <= 0) return finish(true);
  const n = a.items.length, i = Math.min(Math.max(a.idx || 0, 0), n - 1), it = a.items[i], flagged = a.flags.includes(i);
  const done = a.items.filter(x => x.picked != null).length;
  if (anim) pendingAnim = anim;
  setScreen({
    title: `Question ${i + 1}`, focus: '#stem',
    head: `<header class="app-bar app-bar--solid bm-session"><div class="app-bar-row" id="sbar-row">
      <div class="app-bar-lead"><button type="button" class="app-bar-btn" id="leave" aria-label="Leave the test">${icon.close}</button></div>
      <div class="bm-mid"><button type="button" class="app-pill bm-qpill" id="qpill" aria-label="Question ${i + 1} of ${n}. Show all questions">${icon.grid}<span>Q ${i + 1}/${n}</span></button></div>
      <div class="app-bar-trail"><button type="button" class="app-bar-btn bm-timer" id="timer" aria-label="Time left. Tap to hide the timer"></button><button type="button" class="app-bar-btn bm-flag" id="flag" aria-pressed="${flagged}" aria-label="Flag this question">${icon.flag}</button></div>
    </div><progress class="app-progress" id="progress" max="${n}" value="${done}" aria-label="Questions answered: ${done} of ${n}"></progress></header>`,
    body: `${it.topic ? `<p class="app-kicker" style="margin-top:12px">${esc(it.topic.replace(/; /g, ' · '))}</p>` : ''}
      <h1 class="bm-stem" id="stem">${nl(it.stem)}</h1>
      ${it.image ? `<img class="bm-qimg" src="${esc(bankImg(it.image))}" alt="Picture for this question" id="qimg">` : ''}
      <div class="app-choices" role="group" aria-labelledby="stem">${it.options.map((o, k) => `<button type="button" class="app-choice" data-k="${k}" aria-pressed="${it.picked === k}"><span class="app-choice-letter" aria-hidden="true">${L.LETTERS[k]}</span><span class="app-choice-text"><span class="app-sr">${L.LETTERS[k]}, </span>${nl(o)}</span></button>`).join('')}</div>`,
    toolbar: `<button type="button" class="app-btn app-btn--outline" id="prev"${i === 0 ? ' aria-disabled="true"' : ''}>${icon.back}Back</button><button type="button" class="app-btn app-btn--outline" id="clear"${it.picked == null ? ' aria-disabled="true"' : ''}>Clear</button>${i < n - 1 ? `<button type="button" class="app-btn app-btn--primary" id="next">Next${icon.forward}</button>` : '<button type="button" class="app-btn app-btn--primary" id="finish">Finish</button>'}`,
  });
  const progress = () => {
    const d = a.items.filter(x => x.picked != null).length, pb = $('#progress');
    pb.value = d; pb.setAttribute('aria-label', `Questions answered: ${d} of ${n}`);
  };
  $$('.app-choice').forEach(b => b.addEventListener('click', () => {
    it.picked = +b.dataset.k; saveAttempt(); U.haptic();
    $$('.app-choice').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.k === it.picked)));
    $('#clear').removeAttribute('aria-disabled'); progress();
  }));
  $('#clear').addEventListener('click', () => {
    if (it.picked == null) return;
    it.picked = null; saveAttempt();
    $$('.app-choice').forEach(c => c.setAttribute('aria-pressed', 'false'));
    $('#clear').setAttribute('aria-disabled', 'true'); progress(); U.announce('Answer cleared');
  });
  $('#flag').addEventListener('click', ev => {
    const on = !a.flags.includes(i);
    a.flags = on ? [...a.flags, i] : a.flags.filter(x => x !== i); saveAttempt();
    ev.currentTarget.setAttribute('aria-pressed', String(on)); U.announce(on ? 'Flagged' : 'Flag removed');
  });
  $('#prev').addEventListener('click', () => { if (i > 0) { a.idx = i - 1; saveAttempt(); viewTest('bm-pop'); } });
  $('#next')?.addEventListener('click', () => { a.idx = i + 1; saveAttempt(); viewTest('bm-push'); });
  $('#finish')?.addEventListener('click', () => checkSheet());
  $('#qpill').addEventListener('click', () => navigatorSheet());
  $('#leave').addEventListener('click', async () => {
    if (await U.confirmSheet({ title: 'Leave the test?', body: '<p>Your answers are kept. The clock keeps running: come back to this page to carry on.</p>', ok: 'Leave', cancel: 'Keep going' })) go('#/');
  });
  $('#qimg')?.addEventListener('click', () => U.sheet({ title: 'Picture', detent: 'large', body: `<img src="${esc(bankImg(it.image))}" alt="Picture for this question, enlarged" style="width:100%;height:auto;border-radius:12px">` }));
  $('#timer').addEventListener('click', () => { a.hideTimer = !a.hideTimer; saveAttempt(); tick(); });
  const tick = () => {
    const s = L.secondsLeft(a.startedAt, a.settings.minutes), t = $('#timer');
    if (t) {
      t.classList.toggle('is-low', s <= 300); t.classList.toggle('is-hidden-time', !!a.hideTimer);
      t.textContent = a.hideTimer ? 'Show timer' : L.clock(s);
      const m = Math.ceil(s / 60), label = a.hideTimer ? 'Show the timer' : `Time left ${m} minute${m === 1 ? '' : 's'}. Tap to hide the timer`;
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
    title: 'All questions',
    body: `<ol class="bm-navgrid">${a.items.map((it, i) => `<li><button type="button" class="bm-dot${it.picked != null ? ' is-done' : ''}${a.flags.includes(i) ? ' is-flag' : ''}${i === cur ? ' is-cur' : ''}" data-i="${i}" aria-label="Question ${i + 1}, ${it.picked == null ? 'not answered' : 'answered'}${a.flags.includes(i) ? ', flagged' : ''}${i === cur ? ', current' : ''}">${i + 1}</button></li>`).join('')}</ol>
      <ul class="bm-legend" aria-hidden="true"><li><i></i>Not answered</li><li><i class="is-done"></i>Answered</li><li><i class="is-flag"></i>Flagged</li><li><i class="is-cur"></i>This one</li></ul>`,
    footer: '<button type="button" class="app-btn app-btn--primary app-btn--block" id="nav-finish">Finish and submit</button>',
  });
  $$('.bm-dot', d).forEach(b => b.addEventListener('click', async () => { await U.closeSheet(d); a.idx = +b.dataset.i; saveAttempt(); viewTest('bm-fade'); }));
  $('#nav-finish', d).addEventListener('click', async () => { await U.closeSheet(d); checkSheet(); });
}
function checkSheet() {
  const a = S.attempt, un = a.items.map((x, i) => (x.picked == null ? i : -1)).filter(i => i >= 0), fl = [...a.flags].sort((x, y) => x - y);
  const parts = [un.length ? plural(un.length, 'unanswered question') : 'Every question is answered', fl.length ? plural(fl.length, 'flagged') : ''].filter(Boolean);
  const d = U.sheet({
    title: 'Submit your test?',
    body: `<p class="app-text" id="check-sum"><b>${esc(parts.join(' · '))}.</b></p>
      ${un.length || fl.length ? `<div class="app-btn-stack">${un.length ? `<button type="button" class="app-btn app-btn--secondary" data-goto="${un[0]}">Go to the first unanswered (Q&nbsp;${un[0] + 1})</button>` : ''}${fl.length ? `<button type="button" class="app-btn app-btn--secondary" data-goto="${fl[0]}">Go to the first flagged (Q&nbsp;${fl[0] + 1})</button>` : ''}</div>` : ''}
      <p class="app-small app-muted">You cannot change your answers after this.</p>`,
    footer: '<button type="button" class="app-btn app-btn--primary app-btn--block" id="submit">Submit</button>',
  });
  $$('[data-goto]', d).forEach(b => b.addEventListener('click', async () => { await U.closeSheet(d); a.idx = +b.dataset.goto; saveAttempt(); viewTest('bm-fade'); }));
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
  pendingAnim = 'bm-fade';
  if (location.hash === '#/result') route(); else location.replace('#/result');
  flushOutbox();
}

// Finished tests wait in the outbox until the server has them (weak signal, closed tab: nothing is lost).
const outbox = () => lsJson('mo-outbox') || [];
const outboxAdd = att => { lsSet('mo-outbox', JSON.stringify([...outbox().filter(x => x.id !== att.id), att])); };
let flushing = false;
async function flushOutbox() {
  if (flushing) return; flushing = true;
  try {
    for (const att of outbox()) {
      try {
        await api.submitAttempt(att);
        lsSet('mo-outbox', JSON.stringify(outbox().filter(x => x.id !== att.id)));
        if (S.last?.id === att.id) { S.last.saveError = ''; lsSet('mo-last', JSON.stringify(S.last)); }
      } catch (e) {
        if (S.last?.id === att.id) S.last.saveError = e.code || 'error';
        if (e.code === 'offline') break;   // no connection: stop and retry later; any other refusal only parks this result
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
  el.className = 'app-panel ' + (waiting ? 'warn' : 'ok');
  el.innerHTML = waiting
    ? `<span class="app-badge app-badge--warn">Saving your result…</span> ${S.last.saveError === 'permission' ? 'Your login has expired (the passphrase was changed). Go back to the start and sign in again with the new passphrase; your result is sent then.' : 'Your result is only on this phone until it is saved. Keep the app open with a signal.'} <button type="button" class="app-btn app-btn--plain app-btn--compact" id="retry">Try now</button>`
    : '<span class="app-badge app-badge--ok">Saved</span> The faculty can see your result.';
  $('#retry')?.addEventListener('click', () => flushOutbox());
}

function viewResult() {
  const r = S.last;
  if (!r) return go('#/');
  const sm = L.summarise(r), review = r.review || 'marks', left = (r.maxAttempts || 0) - (r.attemptNo || 0);
  const rows = r.items.map((it, i) => {
    const ok = it.picked === it.answer, state = ok ? 'correct' : it.picked == null ? 'not answered' : 'wrong';
    return row({ href: review === 'full' ? `#/result/${i}` : '', title: `${i + 1}. ${esc(it.stem)}<span class="app-sr">, ${state}</span>`, lead: markOf(it), clamp: true });
  }).join('');
  setScreen({
    head: bar({ title: 'Result' }), title: 'Result',
    body: `<p class="app-kicker" style="margin-top:8px">${esc(r.name)}</p>
    <h1 class="app-large-title">Your result</h1>
    <div class="bm-result" id="score">${U.ring(sm.pct, Math.round(sm.pct) + '%', sm.pass ? 'Pass' : 'Not yet', sm.pass)}
      <div><p class="bm-verdict${sm.pass ? ' is-pass' : ''}">${sm.pass ? 'Pass' : 'Not yet'}</p><p class="app-text" style="margin:0"><b>${sm.score} of ${sm.total} right</b></p><p class="app-small app-muted" style="margin:0">Pass mark ${r.settings.passMark}%${r.durationSec != null ? ` · ${L.minutesTaken(r.durationSec)}` : ''}</p></div></div>
    ${r.timeUp ? '<div class="app-panel">Time ran out, so the test was submitted for you.</div>' : ''}
    <div id="saved" role="status"></div>
    ${r.attemptNo && r.maxAttempts ? `<p class="app-text">Attempt ${r.attemptNo} of ${r.maxAttempts}. ${sm.pass ? 'You have passed; no more attempts are needed.' : left > 0 ? `You have ${plural(left, 'attempt')} left.` : 'That was your last attempt. Please speak to the faculty.'}</p>` : ''}
    ${review === 'score' ? '' : section('Your answers', rows, { id: 'answers', footer: review === 'full' ? 'Tap a question to see the right answer.' : '' })}
    ${section('', row({ button: true, id: 'dl', title: 'Download my result', sub: 'A spreadsheet file, in case you need proof', lead: tile(icon.download) }))}`,
    toolbar: !sm.pass && left > 0 ? '<button type="button" class="app-btn app-btn--outline" id="done">Done</button><button type="button" class="app-btn app-btn--primary" id="again">Try again</button>' : '<button type="button" class="app-btn app-btn--primary" id="done">Done</button>',
  });
  paintSaved();
  $('#done').addEventListener('click', () => { S.last = null; lsDel('mo-last'); go('#/'); });
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
  setScreen({
    head: bar({ title: `Question ${i + 1} of ${n}`, back: { href: '#/result', label: 'Result' } }), title: `Review ${i + 1}`, focus: '#stem',
    body: `<p class="app-kicker" style="margin-top:12px">Question ${i + 1} of ${n}${it.topic ? ' · ' + esc(it.topic.replace(/; /g, ' · ')) : ''}</p>
    <h1 class="bm-stem" id="stem">${nl(it.stem)}</h1>
    ${r.images?.[i] ? `<img class="bm-qimg" src="${esc(bankImg(r.images[i]))}" alt="Picture for this question">` : ''}
    ${choicesReadOnly(it)}
    ${it.explain ? `<div class="app-panel"><b>Why.</b> ${nl(it.explain)}</div>` : ''}`,
    toolbar: `${i > 0 ? `<a class="app-btn app-btn--outline" href="#/result/${i - 1}">${icon.back}Previous</a>` : '<button type="button" class="app-btn app-btn--outline" aria-disabled="true">' + icon.back + 'Previous</button>'}<a class="app-btn app-btn--primary" href="${i < n - 1 ? `#/result/${i + 1}` : '#/result'}">${i < n - 1 ? 'Next' + icon.forward : 'Back to result'}</a>`,
  });
}
// Read-only choices: the pick against the answer, in words as well as colour.
function choicesReadOnly(it, { showPick = true } = {}) {
  return `<ul class="app-choices is-locked bm-ro" aria-labelledby="stem">${it.options.map((o, k) => {
    const right = k === it.answer, picked = showPick && k === it.picked;
    const cls = picked && right ? 'is-correct' : picked ? 'is-incorrect' : right ? 'is-answer' : '';   // no .is-dimmed: at 60% the text falls below 4.5:1
    const tag = picked && right ? 'Correct' : picked ? 'Yours' : right ? 'Answer' : '';
    const said = picked && right ? ', your answer, correct' : picked ? ', your answer, incorrect' : right ? ', the answer' : '';
    return `<li class="app-choice ${cls}"><span class="app-choice-letter" aria-hidden="true">${right ? icon.tick : picked ? icon.cross : L.LETTERS[k]}</span><span class="app-choice-text"><span class="app-sr">${L.LETTERS[k]}, </span>${nl(o)}<span class="app-sr">${said}</span></span>${tag ? `<span class="app-choice-tag" aria-hidden="true">${tag}</span>` : ''}</li>`;
  }).join('')}</ul>`;
}

// ========== faculty ==========
async function viewFacultyGate() {
  const signedIn = S.user && !S.user.anonymous;
  const head = bar({ title: 'Faculty', back: { href: '#/', label: 'Test' } });
  const top = `${pills({ outbox: false })}<h1 class="app-large-title">Faculty</h1>`;
  if (!signedIn) {
    setScreen({
      head, title: 'Faculty',
      body: `${top}<p class="app-large-sub">Sign in to see the results, the paper and the faculty list.</p>
      <div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="in">${mode === 'local' ? 'Open the demo as faculty' : 'Sign in with Google'}</button></div>
      <p id="gate-err" class="app-field-error" role="alert" hidden></p>
      <p class="app-small app-muted">On an iPhone, sign in from the browser rather than the home-screen app: Google's sign-in window can fail there.</p>`,
    });
    $('#in').addEventListener('click', ev => busy(ev.currentTarget, async () => {
      try { await api.facultySignIn(); } catch (e) { const el = $('#gate-err'); el.textContent = e.code === 'offline' ? errText(e) : e.code === 'cancelled' ? 'Sign-in was closed before it finished. Try again.' : 'Sign-in did not finish. Try again.'; el.hidden = false; }
    }));
    return;
  }
  setScreen({ head, title: 'Faculty', body: top + U.skeleton(2), keep: true });
  const req = await api.myRequest().catch(() => null);
  setScreen({
    head, title: 'Faculty', keep: true,
    body: `${top}
    <p class="app-large-sub">Signed in as <b>${esc(S.user.email)}</b>. This account is not faculty yet.</p>
    ${req ? `<div class="app-panel">Your request was sent ${esc(L.fmtDate(req.requestedAt))}. Ask a faculty member to open <b>People</b> and approve it, then tap <b>Check again</b>.</div>
      <div class="app-btn-stack"><button type="button" class="app-btn app-btn--primary app-btn--block" id="again">Check again</button></div>
      <div class="app-btn-row"><button type="button" class="app-btn app-btn--outline" id="cancel">Cancel request</button><button type="button" class="app-btn app-btn--outline" id="out">Sign out</button></div>`
    : `<form id="rq" novalidate><label class="app-field"><span class="app-field-label">Your name</span><input class="app-input" id="rq-name" required maxlength="100" value="${esc(S.user.name && S.user.name !== S.user.email ? S.user.name : '')}" autocomplete="name"></label>
      <p class="app-small app-muted">Shown to the faculty who approve you, with your email address.</p>
      <div class="app-btn-stack"><button class="app-btn app-btn--primary app-btn--block" type="submit" id="rq-go">Ask for faculty access</button><button type="button" id="out" class="app-btn app-btn--outline app-btn--block">Sign out</button></div></form>`}
    <p id="gate-err" class="app-field-error" role="alert" hidden></p>`,
  });
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
  S.dirty = false;
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
  const head = bar({ title: 'Results' });
  if (!S.loaded.a) setScreen({ head, tabs: 'results', title: 'Results', body: `${pills({ outbox: false })}<h1 class="app-large-title">Results</h1>${U.skeleton(5)}` });
  await loadResults(!S.loaded.a);
  await loadPaper().catch(() => null);
  const all = S.attempts;
  const cohorts = [...new Set(all.map(a => a.cohort).filter(Boolean))].sort().reverse();
  if (f.cohort && !cohorts.includes(f.cohort)) f.cohort = '';
  const rows = all.filter(a => !f.cohort || a.cohort === f.cohort);
  const passN = rows.filter(a => L.summarise(a).pass).length;
  let body = '';
  if (!rows.length) body = `<div class="app-card app-empty"><span class="app-empty-icon" aria-hidden="true">${icon.results}</span><p class="app-empty-title">No results yet</p><p class="app-empty-text">They appear here as soon as an MO submits a test.</p></div>`;
  else if (tab === 'person') {
    const ppl = L.people(rows, S.counts, maxNow());
    const r = p => row({ href: `#/faculty/person/${encodeURIComponent(p.key)}`, title: esc(p.name), sub: `Best ${p.best.score}/${p.best.total} · ${plural(p.attempts.length, 'sitting')}${p.cohort ? ' · ' + esc(p.cohort) : ''}`, trail: passBadge(p.pass) });
    const help = ppl.filter(p => p.needsHelp);
    body = (help.length ? section(`Needs help (${help.length})`, help.map(r).join(''), { id: 'needshelp', footer: 'Not passed, and no attempts left.' }) : '')
      + section(`Everyone (${ppl.length})`, ppl.map(r).join(''), { id: 'byperson' });
  } else if (tab === 'question') {
    const st = L.questionStats(rows);
    body = section('Lowest score first', st.map(s => row({ href: `#/faculty/question/${encodeURIComponent(s.qid)}`, title: esc(s.stem), clamp: true, sub: `${plural(s.n, 'answer')}${s.topic ? ' · ' + esc(s.topic) : ''}`, trail: `${L.isDifficult(s) ? '<span class="app-badge app-badge--bad">Difficult</span>' : ''}<span class="app-row-value">${s.pct}%</span>` })).join(''), { id: 'byquestion', footer: 'A question most people get wrong may be badly worded or have the wrong answer: open it and suggest a change.' });
  } else {
    const st = L.topicStats(rows);
    body = section('Weakest first', st.map(s => row({ title: esc(s.topic), sub: `${plural(s.n, 'answer')}<span class="bm-bar" aria-hidden="true"><i style="width:${s.pct}%"></i></span>`, trail: `<span class="app-row-value">${s.pct}% right</span>` })).join(''), { id: 'bytopic', footer: 'Across the sittings shown: useful for deciding what to teach.' });
  }
  setScreen({
    head, tabs: 'results', title: 'Results', keep: viewResults.shown === tab,
    body: `${pills({ outbox: false })}<div class="bm-title-row"><h1 class="app-large-title">Results</h1>${cohorts.length ? `<label class="app-sr" for="cohort">Cohort</label><select id="cohort" class="bm-cohort">${['', ...cohorts].map(c => `<option value="${esc(c)}"${f.cohort === c ? ' selected' : ''}>${c ? esc(c) : 'All cohorts'}</option>`).join('')}</select>` : ''}</div>
    ${U.seg('by', 'Show results', [['person', 'By person'], ['question', 'By question'], ['topic', 'By topic']], tab)}
    <p class="app-small app-muted" id="res-sum" style="padding:0 4px">${plural(rows.length, 'sitting')}${rows.length ? ` · ${passN} passed (${Math.round(passN / rows.length * 100)}%)` : ''}</p>
    ${body}
    ${rows.length ? section('', row({ button: true, id: 'csv', title: 'Download as a spreadsheet', sub: 'Every sitting shown, for Excel or Google Sheets', lead: tile(icon.download) })) : ''}`,
  });
  viewResults.shown = tab;
  $$('input[name=by]').forEach(r => r.addEventListener('change', () => { history.replaceState(null, '', '#/faculty/results' + (r.value === 'person' ? '' : '?by=' + r.value)); pendingAnim = 'bm-fade'; viewResults.shown = null; viewResults(r.value); }));
  $('#cohort')?.addEventListener('change', ev => { f.cohort = ev.target.value; viewResults(tab); });
  $('#csv')?.addEventListener('click', () => download(`baby-mo-results-${today()}.csv`, L.attemptsToCSV(rows)));
}

async function viewPerson(key) {
  key = decodeURIComponent(key || '');
  await loadResults(); await loadPaper().catch(() => null);
  const p = L.people(S.attempts, S.counts, maxNow()).find(x => x.key === key);
  if (!p) return go('#/faculty/results');
  const max = maxNow(), used = (S.counts.find(c => c.key === key) || {}).n || 0;
  const missed = (p.last.items || []).filter(it => it.picked !== it.answer);
  setScreen({
    head: bar({ title: p.name, back: { href: '#/faculty/results', label: 'Results' } }), tabs: 'results', title: p.name,
    body: `<p class="app-kicker" style="margin-top:8px">${esc(p.cohort || 'No cohort')}</p>
    <h1 class="app-large-title">${esc(p.name)}</h1>
    <p class="app-large-sub">Best ${p.best.score}/${p.best.total} (${p.best.pct}%) ${passBadge(p.pass)}</p>
    ${section('Attempts', row({ id: 'used', title: 'Attempts used', trail: `<span class="app-row-value">${used} of ${max}</span>` }) + (used > 0 ? row({ button: true, id: 'grant', title: 'Give another attempt', cls: 'app-row--action' }) : ''))}
    ${section('Sittings', p.attempts.map(a => { const s = L.summarise(a); return row({ href: `#/faculty/attempt/${encodeURIComponent(a.id)}`, title: `${a.attemptNo ? `Attempt ${a.attemptNo}: ` : ''}${s.score}/${s.total} (${s.pct}%)`, sub: `${esc(L.fmtDate(a.submittedAt))}${a.durationSec != null ? ' · ' + L.minutesTaken(a.durationSec) : ''}`, trail: passBadge(s.pass) }); }).join(''))}
    ${missed.length ? section(`Missed in the latest sitting (${missed.length})`, missed.map(it => row({ lead: markOf(it), title: esc(it.stem), clamp: true, sub: `${it.picked == null ? 'Not answered' : `Chose ${L.LETTERS[it.picked]}`} · answer ${L.LETTERS[it.answer]}. ${esc(it.options[it.answer] || '')}` })).join('')) : `<p class="app-small app-muted">Nothing missed in the latest sitting.</p>`}`,
  });
  $('#grant')?.addEventListener('click', async ev => {
    const btn = ev.currentTarget;
    if (!await U.confirmSheet({ title: 'Give another attempt?', body: `<p>${esc(p.name)} will be able to sit the test once more.</p>`, ok: 'Give another attempt' })) return;
    await busy(btn, async () => {
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
  setScreen({
    head: bar({ title: a.name, back: { href: '#/faculty/person/' + encodeURIComponent(key), label: a.name } }), tabs: 'results', title: a.name,
    body: `<p class="app-kicker" style="margin-top:8px">${a.attemptNo ? `Attempt ${a.attemptNo} · ` : ''}${esc(L.fmtDate(a.submittedAt))}</p>
    <h1 class="app-large-title">${esc(a.name)}</h1>
    <p class="app-large-sub">${s.score}/${s.total} (${s.pct}%)${a.durationSec != null ? ` · ${L.minutesTaken(a.durationSec)}` : ''} ${passBadge(s.pass)}</p>
    ${section('Answers', a.items.map((it, i) => { const ok = it.picked === it.answer; return row({ lead: markOf(it), title: `${i + 1}. ${esc(it.stem)}`, sub: `${it.picked == null ? 'Not answered' : `Chose ${L.LETTERS[it.picked]}. ${esc(it.options[it.picked] || '')}`}${ok ? ', correct' : ` · answer ${L.LETTERS[it.answer]}. ${esc(it.options[it.answer] || '')}`}` }); }).join(''), { id: 'att-items' })}
    ${S.role === 'admin' ? '<div class="app-btn-stack"><button type="button" class="app-btn app-btn--danger app-btn--block" id="delatt">Delete this result</button></div>' : ''}`,
  });
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
  const inBank = S.paper?.byId.get(qid), max = Math.max(1, ...s.picks);
  setScreen({
    head: bar({ title: 'Question', back: { href: '#/faculty/results?by=question', label: 'Results' } }), tabs: 'results', title: 'Question', focus: '#stem',
    body: `<p class="app-kicker" style="margin-top:12px">${plural(s.n, 'answer')} · ${s.pct}% right${L.isDifficult(s) ? ' · difficult' : ''}</p>
    <h1 class="bm-stem" id="stem">${nl(s.stem)}</h1>
    ${section('Who chose what', s.options.map((o, k) => row({ lead: `<span class="bm-mark ${k === s.answer ? 'is-ok' : 'is-none'}" aria-hidden="true">${k === s.answer ? icon.tick : L.LETTERS[k]}</span>`, title: `<span class="app-sr">${L.LETTERS[k]}, </span>${esc(o)}${k === s.answer ? ' <span class="app-badge app-badge--ok">Answer</span>' : ''}`, sub: `<span class="bm-bar" aria-hidden="true"><i style="width:${Math.round((s.picks[k] || 0) / max * 100)}%"></i></span>`, trail: `<span class="app-row-value">${s.picks[k] || 0} chose</span>` })).join('') + (s.skipped ? row({ title: 'Not answered', trail: `<span class="app-row-value">${s.skipped}</span>` }) : ''), { id: 'picks' })}
    ${inBank ? section('', row({ href: `#/faculty/paper/${encodeURIComponent(qid)}`, title: 'Open in the paper', sub: 'See the explanation or suggest a change', lead: tile(icon.paper) })) : '<p class="app-small app-muted">This question is no longer in the paper. The wording above is how the MOs saw it.</p>'}`,
  });
}

// ---- Paper (read-only) ----
async function viewPaper() {
  const head = bar({ title: 'Paper' });
  if (!S.paper) setScreen({ head, tabs: 'paper', title: 'Paper', body: `${pills({ outbox: false })}<h1 class="app-large-title">Paper</h1>${U.skeleton(6)}` });
  let P;
  try { P = await loadPaper(); } catch (e) { setScreen({ head, tabs: 'paper', title: 'Paper', body: `<h1 class="app-large-title">Paper</h1>${errorPanel(e)}` }); $('#retry-route')?.addEventListener('click', () => viewPaper()); return; }
  if (!S.loaded.s) { S.stored = await api.getSettings().catch(() => null); S.loaded.s = true; }
  const st = settingsNow(), sum = L.paperSummary(P.pool, st), drafts = P.all.filter(q => !P.pool.includes(q));
  const qrow = q => row({ href: `#/faculty/paper/${encodeURIComponent(q.id)}`, title: esc(q.stem), clamp: true, sub: esc(q.topics.join(', ') || 'No topic'), trail: `${q.must ? '<span class="app-badge bm-must">Must</span>' : ''}${q.level === 'hard' ? '<span class="app-badge app-badge--ink bm-hard">Hard</span>' : ''}${!P.pool.includes(q) ? `<span class="app-badge app-badge--warn">${esc(STATUS_LABEL[q.status] || 'Draft')}</span>` : ''}` });
  setScreen({
    head, tabs: 'paper', title: 'Paper',
    body: `${pills({ outbox: false })}<h1 class="app-large-title">${esc(P.paper.title || 'Paper')}</h1>
    ${P.paper.about ? `<p class="app-large-sub">${esc(P.paper.about)}</p>` : ''}
    <div class="app-card" id="paper-sum"><p class="app-card-title">${sum.perSitting} questions a sitting</p><p class="app-small app-muted" style="margin:0">${st.minutes} minutes · pass ${st.passMark}% · ${plural(st.maxAttempts, 'attempt')}. ${sum.ready} ready: ${sum.must} must-ask (in every sitting) and ${sum.hard} hard (${st.hardCount} in each sitting).${sum.short ? ` The paper asks for ${st.count}; ${plural(sum.short, 'more ready question')} would be needed.` : ''}${!sum.mustFit ? ' There are more must-ask questions than fit in a sitting.' : ''}</p></div>
    ${P.pool.length ? section(`In the test (${P.pool.length})`, P.pool.map(qrow).join(''), { id: 'paper-ready' }) : '<p class="app-small app-muted">No questions are ready yet.</p>'}
    ${drafts.length ? section(`Not given to MOs yet (${drafts.length})`, drafts.map(qrow).join(''), { id: 'paper-drafts', footer: 'Drafts waiting for a check, or retired questions.' }) : ''}
    <p class="app-small app-muted" style="padding:0 4px">Questions are changed in the question bank, not here, and the owner approves every change. Open a question and tap <b>Suggest a change</b>.</p>`,
  });
}
async function viewPaperQuestion(id) {
  id = decodeURIComponent(id || '');
  const P = await loadPaper();
  const q = P.byId.get(id);
  if (!q) return go('#/faculty/paper');
  const ready = P.pool.includes(q);
  setScreen({
    head: bar({ title: 'Question', back: { href: '#/faculty/paper', label: 'Paper' } }), tabs: 'paper', title: 'Question', focus: '#stem',
    body: `<p class="app-kicker" style="margin-top:12px">${esc(q.topics.join(' · ') || 'No topic')}</p>
    <div class="bm-badges">${q.must ? '<span class="app-badge">Must</span>' : ''}${q.level === 'hard' ? '<span class="app-badge app-badge--ink">Hard</span>' : ''}${ready ? '' : `<span class="app-badge app-badge--warn">${esc(STATUS_LABEL[q.status] || 'Draft')}: not given to MOs</span>`}</div>
    <h1 class="bm-stem" id="stem">${nl(q.stem)}</h1>
    ${q.image ? `<img class="bm-qimg" src="${esc(bankImg(q.image))}" alt="Picture for this question">` : ''}
    ${choicesReadOnly({ options: q.options, answer: q.answer, picked: null }, { showPick: false })}
    ${q.explain ? `<div class="app-panel"><b>Why.</b> ${nl(q.explain)}</div>` : '<p class="app-small app-muted">No explanation yet.</p>'}
    ${q.review ? `<div class="app-panel"><b>Note for the checker.</b> ${nl(q.review)}</div>` : ''}
    <p class="app-small app-muted">${q.source ? 'Source: ' + esc(q.source) + '. ' : ''}${q.updated ? 'Updated ' + esc(q.updated) + '. ' : ''}Question ${esc(q.id)}.</p>
    <div class="app-btn-stack"><a class="app-btn app-btn--secondary app-btn--block" id="suggest" href="${esc(new URL('#/q/' + encodeURIComponent(q.id) + '?suggest', QBANK_APP).href)}">Suggest a change →</a></div>`,
  });
}

// ---- People ----
async function viewPeople() {
  const head = bar({ title: 'People' }), top = `${pills({ outbox: false })}<h1 class="app-large-title">People</h1>`;
  if (!viewPeople.seen) setScreen({ head, tabs: 'people', title: 'People', body: top + U.skeleton(4) });
  viewPeople.seen = true;
  const [members, reqs] = await Promise.all([api.listMembers().catch(() => []), api.listRequests().catch(() => [])]);
  S.pending = reqs.length;
  const admin = S.role === 'admin';
  const reqRow = r => `<li><div class="app-row bm-wrap"><span class="app-row-body"><span class="app-row-title">${esc(r.name)}</span><span class="app-row-sub">${esc(r.email)} · asked ${esc(L.fmtDate(r.requestedAt))}</span></span>
    <div class="app-btn-row"><button type="button" class="app-btn app-btn--outline app-btn--compact" data-dec="${esc(r.email)}">Decline</button><button type="button" class="app-btn app-btn--primary app-btn--compact" data-ap="${esc(r.email)}">Approve</button></div></div></li>`;
  const memRow = (m, i) => `<li><div class="app-row bm-wrap"><span class="app-row-body"><span class="app-row-title">${esc(m.name || m.email)}</span><span class="app-row-sub">${esc(m.email)}${m.email === S.user.email ? ' · you' : ''}</span></span>
    ${admin && m.email !== S.user.email ? `<div class="bm-member-tools">${U.seg('role' + i, 'Role for ' + (m.name || m.email), [['editor', 'Faculty'], ['admin', 'Admin']], m.role, { attrs: ` data-member="${esc(m.email)}"` })}<button type="button" class="app-btn app-btn--plain app-btn--compact" data-rm="${esc(m.email)}">Remove</button></div>` : `<span class="app-row-value">${m.role === 'admin' ? 'Admin' : 'Faculty'}</span>`}</div></li>`;
  setScreen({
    head, tabs: 'people', title: 'People', keep: true,
    body: `${top}<p class="app-large-sub">Faculty see every result. Anyone with a Google account can ask for access from the Faculty sign-in page; any faculty member can approve.</p>
    ${reqs.length ? section(`Waiting for approval (${reqs.length})`, reqs.map(reqRow).join(''), { id: 'reqs' }) : `<section class="app-section"><h2 class="app-section-header">Waiting for approval</h2><p class="app-small app-muted" style="padding:0 16px">Nobody is waiting.</p></section>`}
    ${section(`Faculty (${members.length})`, members.map(memRow).join(''), { id: 'mem', footer: 'Faculty can approve new faculty. Only admins can make someone an admin, remove a person, or change the settings and passphrase.' })}
    ${admin ? `<section class="app-section"><h2 class="app-section-header">Add someone yourself</h2><form id="mf" class="app-card" novalidate><label class="app-field"><span class="app-field-label">Google email</span><input class="app-input" id="m-email" type="email" required placeholder="name@example.com" autocomplete="off"></label><label class="app-field"><span class="app-field-label">Name</span><input class="app-input" id="m-name" placeholder="Dr Tan" autocomplete="off"></label>
      ${U.seg('m-role', 'Role', [['editor', 'Faculty'], ['admin', 'Admin']], 'editor')}<p id="mf-err" class="app-field-error" role="alert" hidden></p><button class="app-btn app-btn--secondary app-btn--block" type="submit">Add</button></form></section>` : ''}`,
  });
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
  const head = bar({ title: 'Settings' }), top = `${pills({ outbox: false })}<h1 class="app-large-title">Settings</h1>`;
  setScreen({ head, tabs: 'settings', title: 'Settings', body: top + U.skeleton(5) });
  await loadPaper().catch(() => null);
  S.stored = await api.getSettings().catch(() => null); S.loaded.s = true;
  const st = settingsNow(), paperSt = L.effectiveSettings({ ...(S.paper?.settings || {}) }, null);
  const pass = admin ? await api.getPassphrase().catch(() => '') : '';
  const account = section('Signed in', `<li><div class="app-row">${tile(icon.person)}<span class="app-row-body"><span class="app-row-title">${esc(S.user?.email || '')}</span><span class="app-row-sub">${admin ? 'Admin' : 'Faculty'}${mode === 'local' ? ' (demo)' : ''}</span></span><button type="button" class="app-btn app-btn--outline app-btn--compact" id="signout">Sign out</button></div></li>`
    + row({ href: '#/', title: 'Open the test as an MO', lead: tile(icon.play) }));
  const help = `<section class="app-section"><h2 class="app-section-header">For each new intake</h2><div class="app-card"><ol class="app-small" style="margin:0;padding-left:20px"><li>Change the <b>passphrase</b> and the <b>cohort</b> here (admins).</li><li>Send the MOs the link and the passphrase.</li><li>Results appear under <b>Results</b>. Download them as a spreadsheet.</li></ol></div>
    <p class="app-section-footer">The questions come from the department's question bank (the paper "${esc(S.paper?.paper?.title || 'Baby MO test')}"). To change one, open it under Paper and tap Suggest a change.</p></section>`;
  if (!admin) { setScreen({ head, tabs: 'settings', title: 'Settings', keep: true, body: `${top}<p class="app-large-sub">Only admins change the test settings and the passphrase.</p>${account}${help}${U.versionLine()}` }); wireAccount(); U.paintVersion('babymo-'); return; }
  setScreen({
    head, tabs: 'settings', title: 'Settings', keep: true,
    savebar: '<button type="submit" form="sf" class="app-btn app-btn--primary app-btn--block" id="save">Save settings</button>',
    body: `${top}<form id="sf" novalidate>
      <section class="app-section"><h2 class="app-section-header">This intake</h2><div class="app-card">
      <label class="app-field"><span class="app-field-label">Cohort</span><input class="app-input" id="s-cohort" value="${esc(st.cohort)}" maxlength="60" placeholder="e.g. Oct 2026 intake" autocomplete="off" aria-describedby="s-cohort-h"><span class="app-small app-muted" id="s-cohort-h" style="display:block;margin-top:6px;padding:0 4px">Stamped on every result. A new cohort name starts everyone's attempts afresh.</span></label>
      <label class="app-field"><span class="app-field-label">Passphrase for MOs</span><input class="app-input" id="s-pass" value="${esc(pass)}" autocomplete="off" maxlength="100" aria-describedby="s-pass-h"><span class="app-small app-muted" id="s-pass-h" style="display:block;margin-top:6px;padding:0 4px">${mode === 'cloud' ? 'Changing it signs everyone out of new tests.' : 'Demo passphrase.'} Anyone who has it can sit the test, so change it for each intake.</span></label>
      <label class="app-field" style="margin:0"><span class="app-field-label">Message before the test (optional)</span><textarea class="app-input" id="s-intro" rows="3" maxlength="1000">${esc(st.intro)}</textarea></label>
      </div></section>
      <section class="app-section"><h2 class="app-section-header">After submitting, the MO sees</h2>${U.seg('review', 'After submitting, the MO sees', L.REVIEW, st.review)}</section>
      <section class="app-section"><h2 class="app-section-header">The sitting</h2><ul class="app-list">
        <li>${U.stepper('s-min', 'Minutes', st.minutes)}</li>
        <li>${U.stepper('s-att', 'Attempts each', st.maxAttempts)}</li>
        <li>${U.stepper('s-count', 'Questions', st.count, { sub: `Paper: ${paperSt.count}` })}</li>
        ${row({ button: true, id: 'd-count', title: `Use paper default (${paperSt.count})`, cls: 'app-row--action' })}
        <li>${U.stepper('s-pm', 'Pass mark %', st.passMark, { sub: `Paper: ${paperSt.passMark}%` })}</li>
        ${row({ button: true, id: 'd-pm', title: `Use paper default (${paperSt.passMark}%)`, cls: 'app-row--action' })}
      </ul><p class="app-section-footer">Must-ask and hard questions come from the paper (${S.paper ? `${S.paper.pool.filter(q => q.must).length} must-ask, ${st.hardCount} hard in each sitting` : 'not loaded'}).</p></section>
      <p id="serr" class="app-field-error" role="alert" hidden></p>
    </form>${account}${help}${U.versionLine()}`,
  });
  wireAccount(); U.paintVersion('babymo-');
  const dirty = () => { S.dirty = true; };
  const steps = {
    min: U.wireStepper('s-min', { onChange: dirty, values: [1, 5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 90, 120, 180, 240] }),
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
    if (p.length < 4) { err.textContent = 'The passphrase needs at least 4 characters.'; err.hidden = false; $('#s-pass').setAttribute('aria-invalid', 'true'); $('#s-pass').focus(); return; }
    $('#s-pass').removeAttribute('aria-invalid');
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
let swReg = null, reloading = false, offered = false, switched = false;
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
  if (installEvent) { el.hidden = false; el.innerHTML = '<button type="button" class="app-btn app-btn--plain app-btn--compact" id="doinstall">Install this app on your phone</button>'; $('#doinstall').addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; paintInstall(); }); }
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
