// Baby MO Portal: the Baby MO test (MOs) and the question/results pages (faculty). One page, hash routes.
// Data goes through store.js (shared Firebase, or this browser only in demo/local mode).

import { api, mode, isDemo } from './store.js';
import * as L from './logic.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = s => esc(s).replace(/\n/g, '<br>');
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked: the page still works, just without resume */ } };
const lsDel = k => { try { localStorage.removeItem(k); } catch { /* ignore */ } };
const lsJson = k => { try { return JSON.parse(lsGet(k) || 'null'); } catch { return null; } };
const safeImg = s => (/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(s || '') ? s : '');

const S = {
  user: null,         // signed-in person (faculty, or the MO's anonymous login)
  role: null,         // 'admin' | 'editor' | null (faculty only)
  settings: null,
  questions: [], attempts: [], loaded: {},
  name: lsGet('mo-name') || '',
  attempt: lsJson('mo-attempt'),   // a test in progress
  last: lsJson('mo-last'),         // the last finished attempt (this device)
  q: { search: '', status: 'all', topic: '' },
  pending: 0,         // faculty access requests waiting (faculty only)
};
let timer = null, userReady;
const userKnown = new Promise(r => (userReady = r));

// ---------- small helpers ----------
function toast(msg, ms = 4000) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('on');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), ms);
}
function setView(html, title) {
  clearInterval(timer); timer = null;
  const app = $('#app'); app.innerHTML = html;
  document.title = (title ? title + ' · ' : '') + 'Baby MO Portal';
  const h = app.querySelector('h1'); if (h) { h.tabIndex = -1; if (!setView.first) h.focus({ preventScroll: true }); }
  setView.first = false; window.scrollTo(0, 0);
}
setView.first = true;
const busy = async (btn, fn) => {
  if (btn) btn.disabled = true;
  try { return await fn(); } finally { if (btn) btn.disabled = false; }
};
function download(name, text, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
const today = () => new Date().toISOString().slice(0, 10);
function errText(e) {
  return ({ permission: 'You do not have permission to do that.', offline: 'No connection right now. Try again when you are online.', conflict: 'Someone else changed this at the same time.', 'not-found': 'That could not be found.' })[e?.code] || 'Something went wrong. Try again.';
}
function ask(title, body, ok = 'OK', danger = false) {
  return new Promise(res => {
    const d = document.createElement('dialog');
    d.innerHTML = `<form method="dialog"><h2>${esc(title)}</h2><div>${body}</div><div class="row end"><button value="no" class="btn">Cancel</button><button value="yes" class="btn ${danger ? 'danger' : 'primary'}">${esc(ok)}</button></div></form>`;
    d.addEventListener('close', () => { res(d.returnValue === 'yes'); d.remove(); });
    document.body.append(d); d.showModal();
  });
}

// ---------- nav ----------
function renderNav() {
  const h = location.hash || '#/';
  const link = (href, label, on) => `<a href="${href}"${on ? ' aria-current="page"' : ''}>${label}</a>`;
  let html = link('#/', 'Test', !h.startsWith('#/faculty'));
  if (S.role) {
    html += link('#/faculty', 'Questions', /^#\/faculty($|\/q|\/paste|\/data)/.test(h));
    html += link('#/faculty/results', 'Results', /results|attempt/.test(h));
    if (S.role === 'admin') html += link('#/faculty/settings', 'Settings', /settings/.test(h));
    html += link('#/faculty/people', S.pending ? `Faculty (${S.pending})` : 'Faculty', /people/.test(h));
    html += link('#/faculty/help', 'Help', /help/.test(h));
  } else html += link('#/faculty', 'Faculty', h.startsWith('#/faculty'));
  if (S.user && !S.user.anonymous) html += `<button type="button" id="signout" title="${esc(S.user.email || '')}">Sign out</button>`;
  $('#nav').innerHTML = html;
  $('#banner').innerHTML = mode === 'local' ? `<div class="demo">${isDemo ? 'Demo' : 'Not connected'}: everything here stays in this browser only. <a href="#/faculty/help">What is this?</a></div>` : '';
}

// ---------- routing ----------
async function route() {
  renderNav();
  const h = (location.hash || '#/').replace(/^#/, '').split('?')[0];
  const p = h.split('/').filter(Boolean);
  try {
    if (p[0] !== 'faculty') {
      await userKnown;
      if (S.attempt && p[0] !== 'result') return S.attempt.view === 'ready' ? viewReady() : p[0] === 'test' || p[0] === undefined ? viewTest() : viewTest();
      if (p[0] === 'test') return go('#/');
      if (p[0] === 'ready') return viewReady();
      if (p[0] === 'result') return viewResult();
      return viewHome();
    }
    await userKnown;
    if (!S.role) return viewFacultyGate();
    renderNav(); refreshPending();
    const [, sub, arg] = p;
    if (!sub) return viewQuestions();
    if (sub === 'q') return viewEditor(arg);
    if (sub === 'paste') return viewPaste();
    if (sub === 'data') return viewData();
    if (sub === 'results') return viewResults();
    if (sub === 'attempt') return viewAttempt(arg);
    if (sub === 'people') return viewPeople();
    if (sub === 'settings') return S.role === 'admin' ? viewSettings() : go('#/faculty');
    if (sub === 'help') return viewHelp();
    return go('#/faculty');
  } catch (e) {
    console.error(e);
    setView(`<h1>Something went wrong</h1><p>${esc(errText(e))}</p><p><a class="btn" href="#/">Back to the start</a></p>`);
  }
}
async function refreshPending() {
  try { const n = (await api.listRequests()).length; if (n !== S.pending) { S.pending = n; renderNav(); } } catch { /* not allowed or offline: no badge */ }
}
const go = h => { if (location.hash === h) route(); else location.hash = h; };
window.addEventListener('hashchange', route);
$('#nav').addEventListener('click', async ev => {
  if (!ev.target.closest('#signout')) return;
  try { await api.signOut(); } catch { /* already signed out */ }
  S.role = null; S.pending = 0; S.loaded = {};
  toast('Signed out.');
  if (location.hash === '#/faculty') route(); else go('#/faculty');
});

// ---------- MO: home, ready, test, result ----------
function viewHome() {
  const showTitle = (S.settings && S.settings.title) || L.DEFAULT_SETTINGS.title;
  const last = S.last;
  setView(`
    <h1>${esc(showTitle)}</h1>
    <p class="lead">For new medical officers in anaesthesia. Enter your name and the passphrase you were given.</p>
    <form id="start" class="card stack" autocomplete="off">
      <label>Your name<input id="f-name" required maxlength="80" value="${esc(S.name)}" autocomplete="name" placeholder="As on the roster"></label>
      <label>Passphrase<input id="f-pass" required type="password" autocomplete="off"${mode === 'local' ? ' placeholder="demo"' : ''}></label>
      <p id="start-err" class="err" role="alert" hidden></p>
      <button class="btn primary big" type="submit">Continue</button>
    </form>
    ${last ? `<p class="muted">Your last result on this phone: <a href="#/result">${last.name}, ${esc(String(L.summarise(last).score))}/${esc(String(L.summarise(last).total))}</a></p>` : ''}
    <p class="muted"><a href="#/faculty">Faculty sign in</a></p>`, 'Start');
  $('#start').addEventListener('submit', async ev => {
    ev.preventDefault();
    const name = $('#f-name').value.trim().replace(/\s+/g, ' '), pass = $('#f-pass').value;
    const err = $('#start-err'); err.hidden = true;
    await busy(ev.submitter, async () => {
      try {
        await api.startSession(name, pass);
        S.name = name; lsSet('mo-name', name);
        S.settings = { ...L.DEFAULT_SETTINGS, ...(await api.getSettings() || {}) };
        const qs = await api.listQuestions({ activeOnly: true });
        S.pool = qs.map(L.cleanQuestion).filter(L.isUsable);
        if (!S.pool.length) throw Object.assign(new Error('empty'), { code: 'empty' });
        S.attempt = { id: L.newId(), name, view: 'ready', settings: pick(S.settings), cohort: S.settings.cohort || '', pool: S.pool };
        saveAttempt(); go('#/ready');
      } catch (e) {
        err.textContent = e.code === 'bad-passphrase' ? 'That passphrase is not right. Check it with your supervisor.'
          : e.code === 'empty' ? 'There are no questions in the test yet. Please tell the faculty.'
          : errText(e);
        err.hidden = false;
      }
    });
  });
}
const pick = s => ({ title: s.title, count: s.count, passMark: s.passMark, minutes: s.minutes, review: s.review });
const saveAttempt = () => { if (S.attempt) lsSet('mo-attempt', JSON.stringify(S.attempt)); else lsDel('mo-attempt'); };

function viewReady() {
  const a = S.attempt, st = a.settings, n = Math.min(st.count, a.pool.length);
  setView(`
    <h1>Ready, ${esc(a.name.split(' ')[0])}?</h1>
    ${S.settings?.intro ? `<div class="card intro">${nl(S.settings.intro)}</div>` : ''}
    <ul class="facts">
      <li><b>${n}</b> questions, one answer each</li>
      <li><b>${st.minutes}</b> minutes. The clock starts when you tap Start.</li>
      <li>Pass mark <b>${st.passMark}%</b> (${Math.ceil(n * st.passMark / 100 - 1e-9)} or more correct)</li>
      <li>No negative marking. You can go back and change answers before you submit.</li>
    </ul>
    <p class="row"><button id="go" class="btn primary big">Start</button> <button id="cancel" class="btn">Not now</button></p>`, 'Ready');
  $('#go').addEventListener('click', () => {
    const draw = L.drawTest(a.pool, st);
    S.attempt = { id: a.id, name: a.name, view: 'q', idx: 0, flags: [], startedAt: Date.now(), settings: st, cohort: a.cohort, items: draw };
    saveAttempt(); go('#/test'); route();
  });
  $('#cancel').addEventListener('click', () => { S.attempt = null; saveAttempt(); go('#/'); });
}

function viewTest() {
  const a = S.attempt;
  if (!a || !a.items) { S.attempt = null; saveAttempt(); return viewHome(); }
  if (L.secondsLeft(a.startedAt, a.settings.minutes) <= 0) return finish(true);
  if (location.hash !== '#/test') history.replaceState(null, '', '#/test');
  renderNav();
  const total = a.items.length;
  const clockHtml = `<span class="timer" id="timer" role="timer" aria-label="Time left"></span>`;
  if (a.view === 'review') {
    const un = a.items.filter(i => i.picked == null).length;
    setView(`
      <div class="topbar"><span>Review</span>${clockHtml}</div>
      <h1>Review your answers</h1>
      <p>${un ? `<b>${un}</b> unanswered.` : 'Every question is answered.'} ${a.flags.length ? `<b>${a.flags.length}</b> flagged.` : ''} Tap a number to go back to it.</p>
      <ol class="grid">${a.items.map((it, i) => `<li><button class="cell ${it.picked == null ? 'blank' : 'done'}${a.flags.includes(i) ? ' flag' : ''}" data-i="${i}" aria-label="Question ${i + 1}, ${it.picked == null ? 'not answered' : 'answered'}${a.flags.includes(i) ? ', flagged' : ''}">${i + 1}</button></li>`).join('')}</ol>
      <p class="row"><button id="submit" class="btn primary big">Submit test</button> <button id="back" class="btn">Back to questions</button></p>`, 'Review');
    $('#app').querySelectorAll('.cell').forEach(b => b.addEventListener('click', () => { a.view = 'q'; a.idx = +b.dataset.i; saveAttempt(); viewTest(); }));
    $('#back').addEventListener('click', () => { a.view = 'q'; saveAttempt(); viewTest(); });
    $('#submit').addEventListener('click', async () => {
      const ok = await ask('Submit your test?', `<p>${un ? `You have <b>${un}</b> unanswered question${un > 1 ? 's' : ''}. ` : ''}You cannot change your answers after this.</p>`, 'Submit');
      if (ok) finish(false);
    });
  } else {
    const i = Math.min(Math.max(a.idx || 0, 0), total - 1), it = a.items[i];
    const img = safeImg(it.image);
    setView(`
      <div class="topbar"><span>Question ${i + 1} of ${total}</span>${clockHtml}</div>
      <div class="bar-progress" aria-hidden="true"><i style="width:${Math.round((a.items.filter(x => x.picked != null).length / total) * 100)}%"></i></div>
      <form id="qform" class="q">
        <fieldset>
          <legend><h1 class="stem">${nl(it.stem)}</h1></legend>
          ${img ? `<img class="qimg" src="${img}" alt="Picture for this question">` : ''}
          <div class="opts">${it.options.map((o, k) => `<label class="opt${it.picked === k ? ' on' : ''}"><input type="radio" name="o" value="${k}"${it.picked === k ? ' checked' : ''}><span class="ltr" aria-hidden="true">${L.LETTERS[k]}</span><span class="txt"><span class="visually-hidden">${L.LETTERS[k]}. </span>${nl(o)}</span></label>`).join('')}</div>
        </fieldset>
      </form>
      <div class="navrow">
        <button id="prev" class="btn" ${i === 0 ? 'disabled' : ''}>Back</button>
        <button id="flag" class="btn${a.flags.includes(i) ? ' on' : ''}" aria-pressed="${a.flags.includes(i)}">${a.flags.includes(i) ? 'Flagged' : 'Flag'}</button>
        <button id="clear" class="btn" ${it.picked == null ? 'disabled' : ''}>Clear</button>
        ${i < total - 1 ? '<button id="next" class="btn primary">Next</button>' : '<button id="review" class="btn primary">Review</button>'}
      </div>
      <p class="row"><button id="rv" class="link">Review all questions</button></p>`, `Question ${i + 1}`);
    $('#qform').addEventListener('change', ev => {
      it.picked = +ev.target.value; saveAttempt();
      $('#app').querySelectorAll('.opt').forEach((l, k) => l.classList.toggle('on', k === it.picked));
      $('#clear').disabled = false;
      $('#app .bar-progress i').style.width = Math.round((a.items.filter(x => x.picked != null).length / total) * 100) + '%';
    });
    $('#prev').addEventListener('click', () => { a.idx = i - 1; saveAttempt(); viewTest(); });
    $('#clear').addEventListener('click', () => { it.picked = null; saveAttempt(); viewTest(); });
    $('#flag').addEventListener('click', () => { a.flags = a.flags.includes(i) ? a.flags.filter(x => x !== i) : [...a.flags, i]; saveAttempt(); viewTest(); });
    const next = () => { if (i < total - 1) a.idx = i + 1; else a.view = 'review'; saveAttempt(); viewTest(); };
    ($('#next') || $('#review')).addEventListener('click', next);
    $('#rv').addEventListener('click', () => { a.view = 'review'; saveAttempt(); viewTest(); });
  }
  const tick = () => {
    const s = L.secondsLeft(a.startedAt, a.settings.minutes), t = $('#timer');
    if (t) { t.textContent = L.clock(s); t.classList.toggle('low', s <= 60); }
    if (s <= 0) { clearInterval(timer); finish(true); }
    else if ((s === 300 || s === 60) && tick.said !== s) { tick.said = s; toast(s === 300 ? '5 minutes left' : '1 minute left', 6000); }
  };
  tick(); clearInterval(timer); timer = setInterval(tick, 1000);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.attempt?.items && location.hash === '#/test' && L.secondsLeft(S.attempt.startedAt, S.attempt.settings.minutes) <= 0) finish(true); });

async function finish(timeUp) {
  const a = S.attempt; if (!a || !a.items) return;
  clearInterval(timer); timer = null;
  const att = {
    id: a.id, uid: S.user?.uid || 'local', name: a.name, cohort: a.cohort || '', startedAt: a.startedAt, submittedAt: Date.now(),
    durationSec: Math.min(Math.round((Date.now() - a.startedAt) / 1000), a.settings.minutes * 60),
    items: a.items.map(({ qid, stem, options, answer, topic, explain, picked }) => ({ qid, stem, options, answer, topic, explain, picked })),
    settings: { count: a.settings.count, passMark: a.settings.passMark, minutes: a.settings.minutes },
  };
  const sm = L.summarise(att); att.score = sm.score; att.total = sm.total; att.pass = sm.pass;
  S.last = { ...att, review: a.settings.review, timeUp, saved: false };
  lsSet('mo-last', JSON.stringify(S.last));
  S.attempt = null; saveAttempt();
  outboxAdd(att);
  go('#/result'); route();
  flushOutbox();
}

// Finished tests wait in the outbox until the server has them (weak signal, closed tab: nothing is lost).
const outbox = () => lsJson('mo-outbox') || [];
const outboxAdd = att => lsSet('mo-outbox', JSON.stringify([...outbox().filter(x => x.id !== att.id), att]));
let flushing = false;
async function flushOutbox() {
  if (flushing) return; flushing = true;
  try {
    for (const att of outbox()) {
      try {
        await api.submitAttempt(att);
        lsSet('mo-outbox', JSON.stringify(outbox().filter(x => x.id !== att.id)));
        if (S.last?.id === att.id) { S.last.saved = true; S.last.saveError = ''; lsSet('mo-last', JSON.stringify(S.last)); }
      } catch (e) {
        if (S.last?.id === att.id) { S.last.saveError = e.code || 'error'; }
        if (e.code === 'offline') break;   // no connection: stop and retry later; any other refusal only parks this result
      }
    }
  } finally { flushing = false; }
  if (location.hash === '#/result') paintSaved();
}
window.addEventListener('online', flushOutbox);

function paintSaved() {
  const el = $('#saved'); if (!el || !S.last) return;
  const waiting = outbox().some(x => x.id === S.last.id);
  el.className = 'status ' + (waiting ? 'warn' : 'ok');
  el.innerHTML = waiting
    ? (S.last.saveError === 'permission' ? 'Your result could not be saved yet: your login has expired (the passphrase was changed). Go back to the start and sign in again with the new passphrase; it will be sent then. You can also tap <b>Download my result</b>.' : 'Not saved to the server yet. Keep this page open; it will try again when you are online.') + ' <button id="retry" class="link">Try now</button>'
    : 'Saved. The faculty can see your result.';
  $('#retry')?.addEventListener('click', async () => { await flushOutbox(); paintSaved(); });
}

function viewResult() {
  const r = S.last;
  if (!r) return viewHome();
  const sm = L.summarise(r), mode_ = r.review || 'marks';
  const rows = r.items.map((it, i) => {
    const ok = it.picked === it.answer;
    const head = `<span class="mk ${ok ? 'ok' : 'no'}" aria-hidden="true">${ok ? '✓' : '✗'}</span>`;
    if (mode_ === 'full') return `<li class="rv ${ok ? 'ok' : 'no'}"><p><b>${i + 1}.</b> ${nl(it.stem)}</p>
      <p>${head} Your answer: <b>${it.picked == null ? 'none' : L.LETTERS[it.picked] + '. ' + esc(it.options[it.picked])}</b></p>
      ${ok ? '' : `<p>Correct answer: <b>${L.LETTERS[it.answer]}. ${esc(it.options[it.answer])}</b></p>`}
      ${it.explain ? `<p class="muted">${nl(it.explain)}</p>` : ''}</li>`;
    return `<li class="rv ${ok ? 'ok' : 'no'}"><p>${head} <b>${i + 1}.</b> ${esc(it.stem.length > 140 ? it.stem.slice(0, 140) + '…' : it.stem)} <span class="visually-hidden">${ok ? 'correct' : it.picked == null ? 'not answered' : 'wrong'}</span></p></li>`;
  }).join('');
  setView(`
    <h1>${esc(r.name)}</h1>
    <div class="score ${sm.pass ? 'pass' : 'fail'}">
      <b>${sm.score}</b><span>/ ${sm.total}</span>
      <p>${sm.pass ? 'Pass' : 'Not yet at the pass mark'} (${sm.pct}%; pass mark ${r.settings.passMark}%)</p>
    </div>
    ${r.timeUp ? '<p class="muted">Time ran out, so the test was submitted for you.</p>' : ''}
    <p id="saved" class="status" role="status"></p>
    ${mode_ === 'score' ? '' : `<h2>Your answers</h2><ol class="review">${rows}</ol>`}
    <p class="row"><button id="dl" class="btn">Download my result</button> <a class="btn primary" href="#/" id="done">Done</a></p>`, 'Result');
  paintSaved();
  $('#dl').addEventListener('click', () => download(`baby-mo-${r.name.replace(/\W+/g, '-')}-${today()}.csv`, L.attemptsToCSV([r])));
  $('#done').addEventListener('click', () => { S.last = null; lsDel('mo-last'); });
}

// ---------- faculty: gate ----------
async function viewFacultyGate() {
  const signedIn = S.user && !S.user.anonymous;
  if (!signedIn) {
    setView(`
      <h1>Faculty</h1>
      <p class="lead">Sign in to edit questions and see results.</p>
      <p class="row"><button id="in" class="btn primary big">${mode === 'local' ? 'Open the demo as faculty' : 'Sign in with Google'}</button></p>
      <p id="gate-err" class="err" role="alert" hidden></p>
      <p class="muted"><a href="#/">Back to the test</a></p>`, 'Faculty');
    $('#in').addEventListener('click', async ev => busy(ev.target, async () => {
      try { await api.facultySignIn(); } catch (e) { const el = $('#gate-err'); el.textContent = e.code === 'offline' ? errText(e) : e.code === 'cancelled' ? 'Sign-in was closed before it finished. Try again.' : 'Sign-in did not finish. Try again.'; el.hidden = false; }
    }));
    return;
  }
  setView('<h1>Faculty</h1><p class="loading">Loading…</p>', 'Faculty');
  const req = await api.myRequest().catch(() => null);
  setView(`
    <h1>Faculty</h1>
    <div class="card stack">
      <p>You are signed in as <b>${esc(S.user.email)}</b>. This account is not faculty yet.</p>
      ${req ? `<p class="status ok">Your request was sent ${esc(L.fmtDate(req.requestedAt))}. Ask a faculty member to open <b>Faculty</b> and approve it, then tap <b>Check again</b>.</p>
        <p class="row"><button id="again" class="btn primary">Check again</button> <button id="cancel" class="btn">Cancel my request</button> <button id="out" class="btn">Sign out</button></p>`
      : `<form id="rq" class="stack"><label>Your name <span class="muted">(shown to the faculty who approve you)</span><input id="rq-name" required maxlength="100" value="${esc(S.user.name && S.user.name !== S.user.email ? S.user.name : '')}" autocomplete="name"></label>
        <p class="row"><button class="btn primary" type="submit">Ask for faculty access</button> <button type="button" id="out" class="btn">Sign out</button></p></form>
        <p class="muted small">Any current faculty member can approve you. They see your name and email address.</p>`}
    </div>
    <p id="gate-err" class="err" role="alert" hidden></p>
    <p class="muted"><a href="#/">Back to the test</a></p>`, 'Faculty');
  $('#out')?.addEventListener('click', () => api.signOut());
  $('#rq')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    await busy(ev.submitter, async () => {
      try { await api.requestAccess($('#rq-name').value.trim().replace(/\s+/g, ' ')); toast('Request sent.'); viewFacultyGate(); }
      catch (e) { const el = $('#gate-err'); el.textContent = 'Not sent: ' + errText(e); el.hidden = false; }
    });
  });
  $('#cancel')?.addEventListener('click', async () => { try { await api.cancelRequest(); viewFacultyGate(); } catch (e) { toast(errText(e)); } });
  $('#again')?.addEventListener('click', async ev => busy(ev.target, async () => {
    let role = null; try { role = await api.memberRole(S.user.email); } catch { /* offline */ }
    if (role) { S.role = role; S.loaded = {}; renderNav(); toast('You are faculty now.'); go('#/faculty'); route(); }
    else toast('Not approved yet.');
  }));
}

// ---------- faculty: questions ----------
async function loadQuestions(force) {
  if (force || !S.loaded.q) { S.questions = (await api.listQuestions()).map(L.cleanQuestion); S.loaded.q = true; }
  if (!S.settings) S.settings = { ...L.DEFAULT_SETTINGS, ...(await api.getSettings() || {}) };
  return S.questions;
}
const topicsOf = qs => [...new Set(qs.map(q => q.topic).filter(Boolean))].sort();

async function viewQuestions() {
  setView('<h1>Questions</h1><p class="loading">Loading…</p>', 'Questions');
  const all = await loadQuestions(true);
  const count = S.settings.count, usable = all.filter(L.isUsable).length;
  const f = S.q;
  const list = all.filter(q => (f.status === 'all' ? q.status !== 'archived' || false : q.status === f.status) && (!f.topic || q.topic === f.topic) && (!f.search || (q.stem + ' ' + q.options.join(' ') + ' ' + q.topic).toLowerCase().includes(f.search.toLowerCase())))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  const c = s => all.filter(q => q.status === s).length;
  setView(`
    <h1>Questions</h1>
    <p class="summary"><b>${usable}</b> ready for the test. Each sitting draws <b>${Math.min(count, usable)}</b> at random${usable < count ? ` <span class="warn-text">(you asked for ${count}; add ${count - usable} more complete question${count - usable > 1 ? 's' : ''})</span>` : ''}. ${c('draft') ? `${c('draft')} draft${c('draft') > 1 ? 's' : ''} waiting for a check.` : ''}</p>
    <p class="row"><a class="btn primary" href="#/faculty/q/new">+ New question</a> <a class="btn" href="#/faculty/paste">Paste many</a> <a class="btn" href="#/faculty/data">Backup and import</a></p>
    <div class="filters">
      <label class="visually-hidden" for="qs">Search questions</label><input id="qs" type="search" placeholder="Search questions" value="${esc(f.search)}">
      <div class="chips" role="group" aria-label="Show">${[['all', 'All'], ['active', 'In the test'], ['draft', 'Drafts'], ['archived', 'Archived']].map(([k, l]) => `<button class="chip" data-s="${k}" aria-pressed="${f.status === k}">${l}${k === 'all' ? '' : ` ${c(k)}`}</button>`).join('')}</div>
      ${topicsOf(all).length ? `<label class="visually-hidden" for="qt">Topic</label><select id="qt"><option value="">All topics</option>${topicsOf(all).map(t => `<option${f.topic === t ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>` : ''}
    </div>
    ${list.length ? `<ul class="qlist">${list.map(q => `<li><a href="#/faculty/q/${esc(q.id)}"><span class="badge ${q.status}">${L.STATUS_LABEL[q.status]}</span>${L.problems(q, 'active').length && q.status === 'active' ? '<span class="badge bad">Incomplete</span>' : ''}<span class="qs">${esc(q.stem.length > 150 ? q.stem.slice(0, 150) + '…' : q.stem)}</span><span class="qm">${q.topic ? esc(q.topic) + ' · ' : ''}${q.answer >= 0 ? 'Answer ' + L.LETTERS[q.answer] : 'No answer yet'}${q.image ? ' · picture' : ''}</span></a></li>`).join('')}</ul>` : `<p class="empty">${all.length ? 'No questions match.' : 'No questions yet. Tap “+ New question”, or “Paste many” to add a whole paper at once.'}</p>`}`, 'Questions');
  $('#qs').addEventListener('input', ev => { f.search = ev.target.value; clearTimeout(viewQuestions.t); viewQuestions.t = setTimeout(async () => { await viewQuestions(); const el = $('#qs'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 250); });
  $('#app').querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { f.status = b.dataset.s; viewQuestions(); }));
  $('#qt')?.addEventListener('change', ev => { f.topic = ev.target.value; viewQuestions(); });
}

// ---------- faculty: question editor ----------
async function viewEditor(id) {
  setView('<h1>Question</h1><p class="loading">Loading…</p>', 'Question');
  await loadQuestions();
  const isNew = id === 'new';
  let base = isNew ? L.cleanQuestion({ status: 'draft' }) : S.questions.find(q => q.id === id);
  if (!base) { toast('That question no longer exists.'); return go('#/faculty'); }
  const draftKey = 'mo-qdraft-' + (isNew ? 'new' : id);
  let q = L.cleanQuestion(base), restored = null;
  const saved = lsJson(draftKey);
  if (saved && JSON.stringify(L.cleanQuestion(saved.q)) !== JSON.stringify(q) && (isNew || saved.rev === base.rev)) restored = L.cleanQuestion(saved.q);
  let hist = null;
  const draw = () => {
    const probs = L.problems(q, q.status);
    const has = f => probs.filter(p => p.field === f).map(p => `<span class="err" id="e-${f}">${esc(p.text)}</span>`).join('');
    const dup = isNew || true ? L.similar(q, S.questions, q.id) : null;
    setView(`
      <p><a href="#/faculty">← All questions</a></p>
      <h1>${isNew ? 'New question' : 'Edit question'}</h1>
      ${restored ? `<div class="card note"><p>You have unsaved changes from earlier on this device.</p><p class="row"><button id="restore" class="btn primary">Bring them back</button> <button id="discard" class="btn">Throw them away</button></p></div>` : ''}
      <form id="qf" class="stack" novalidate>
        <label>Question<textarea id="stem" rows="5" maxlength="${L.LIMITS.stem}" aria-describedby="e-stem">${esc(q.stem)}</textarea>${has('stem')}</label>
        <fieldset class="answers"><legend>Choices (tick the correct one)</legend>
          ${[0, 1, 2, 3].map(k => `<div class="arow"><input type="radio" name="ans" id="ans${k}" value="${k}" ${q.answer === k ? 'checked' : ''} aria-label="Choice ${L.LETTERS[k]} is correct"><label class="ltr" for="ans${k}">${L.LETTERS[k]}</label><label class="visually-hidden" for="opt${k}">Choice ${L.LETTERS[k]} text</label><input id="opt${k}" value="${esc(q.options[k])}" maxlength="${L.LIMITS.option}" aria-describedby="e-opt${k}"></div>${has('opt' + k)}`).join('')}
          ${has('answer')}
        </fieldset>
        <label>Why this is the answer <span class="muted">(optional, shown to the MO in review)</span><textarea id="explain" rows="3" maxlength="${L.LIMITS.explain}">${esc(q.explain)}</textarea></label>
        <div class="two">
          <label>Topic <span class="muted">(optional)</span><input id="topic" list="topics" maxlength="${L.LIMITS.topic}" value="${esc(q.topic)}"><datalist id="topics">${topicsOf(S.questions).map(t => `<option value="${esc(t)}">`).join('')}</datalist></label>
          <label>Status<select id="status">${L.STATUSES.map(s => `<option value="${s}"${q.status === s ? ' selected' : ''}>${L.STATUS_LABEL[s]}</option>`).join('')}</select></label>
        </div>
        <p class="muted small">${q.status === 'draft' ? 'Drafts are saved but never given to MOs. Set to “In the test” when it is checked.' : q.status === 'active' ? 'This question can be given to MOs.' : 'Archived questions are kept but never given to MOs.'}</p>
        <div class="imgbox"><b>Picture</b> <span class="muted">(optional, for ECGs, X-rays)</span>
          ${safeImg(q.image) ? `<img class="qimg" src="${safeImg(q.image)}" alt="Attached picture"><p class="row"><button type="button" id="rmimg" class="btn">Remove picture</button></p>` : `<p><label class="btn">Add a picture<input id="img" type="file" accept="image/*" class="visually-hidden"></label></p>`}
          ${has('image')}
        </div>
        ${dup ? `<p class="status warn">This looks like an existing question: “${esc(dup.stem.slice(0, 90))}…” <a href="#/faculty/q/${esc(dup.id)}">Open it</a></p>` : ''}
        <p id="qerr" class="err" role="alert" hidden></p>
        <p class="row sticky"><button class="btn primary big" type="submit">Save</button>
          ${isNew ? '' : '<button type="button" id="dupq" class="btn">Make a copy</button>'}
          ${isNew || q.status === 'archived' ? '' : '<button type="button" id="arch" class="btn">Archive</button>'}
          ${!isNew && S.role === 'admin' ? '<button type="button" id="del" class="btn danger">Delete for good</button>' : ''}</p>
      </form>
      <details class="preview" open><summary>How an MO sees it</summary>${previewHtml(q)}</details>
      ${isNew ? '' : `<details id="hist"><summary>Earlier versions</summary><div id="histbody"><p class="loading">Loading…</p></div></details>`}
      ${!isNew && q.updatedBy ? `<p class="muted small">Last saved ${esc(L.fmtDate(q.updatedAt))} by ${esc(q.updatedBy.name || q.updatedBy.email)} (version ${q.rev}).</p>` : ''}`, isNew ? 'New question' : 'Question');
    wire();
  };
  const read = () => {
    q.stem = $('#stem').value; q.explain = $('#explain').value; q.topic = $('#topic').value; q.status = $('#status').value;
    q.options = [0, 1, 2, 3].map(k => $('#opt' + k).value);
    const r = document.querySelector('input[name=ans]:checked'); q.answer = r ? +r.value : -1;
    q = L.cleanQuestion({ ...q, options: q.options.map(x => x.replace(/\s+$/, '')), id: q.id, rev: q.rev, image: q.image, updatedAt: q.updatedAt, updatedBy: q.updatedBy });
  };
  const keep = () => { lsSet(draftKey, JSON.stringify({ q, rev: base.rev })); };
  const wire = () => {
    $('#restore')?.addEventListener('click', () => { q = restored; restored = null; draw(); });
    $('#discard')?.addEventListener('click', () => { lsDel(draftKey); restored = null; draw(); });
    const live = () => { read(); keep(); $('.preview').innerHTML = `<summary>How an MO sees it</summary>${previewHtml(q)}`; };
    $('#qf').addEventListener('input', live);
    $('#status').addEventListener('change', () => { read(); keep(); draw(); });
    $('#img')?.addEventListener('change', async ev => {
      const file = ev.target.files[0]; if (!file) return;
      try { read(); q.image = await shrink(file); keep(); draw(); } catch { toast('That picture could not be read. Try a JPG or PNG.'); }
    });
    $('#rmimg')?.addEventListener('click', () => { read(); q.image = ''; keep(); draw(); });
    $('#qf').addEventListener('submit', async ev => {
      ev.preventDefault(); read();
      const probs = L.problems(q, q.status);
      if (probs.length) { draw(); const err = $('#qerr'); err.textContent = q.status === 'active' ? 'Fix the points above, or set the status to Draft to save it unfinished.' : 'Fix the points above.'; err.hidden = false; document.querySelector('.err[id^=e-]')?.scrollIntoView({ block: 'center' }); return; }
      await busy(ev.submitter, async () => {
        try { await commit(false); }
        catch (e) {
          if (e.code === 'conflict') return conflict();
          const err = $('#qerr'); err.textContent = 'Not saved: ' + errText(e) + ' Your text is kept on this device.'; err.hidden = false;
        }
      });
    });
    $('#dupq')?.addEventListener('click', async () => {
      read(); const copy = L.cleanQuestion({ ...q, id: '', rev: 0, status: 'draft', stem: q.stem });
      try { const s = await api.saveQuestion(copy, S.user); S.loaded.q = false; toast('Copied as a draft.'); go('#/faculty/q/' + s.id); } catch (e) { toast(errText(e)); }
    });
    $('#arch')?.addEventListener('click', async () => { $('#status').value = 'archived'; read(); try { await commit(true); } catch (e) { e.code === 'conflict' ? conflict() : toast(errText(e)); } });
    $('#del')?.addEventListener('click', async () => {
      if (!await ask('Delete this question for good?', '<p>It disappears from the bank and its version history. Results already saved keep their own copy of the question. Archive it instead if you might want it back.</p>', 'Delete', true)) return;
      try { await api.deleteQuestion(q.id); lsDel(draftKey); S.loaded.q = false; toast('Deleted.'); go('#/faculty'); } catch (e) { toast(errText(e)); }
    });
    $('#hist')?.addEventListener('toggle', async ev => {
      if (!ev.target.open || hist) return;
      try { hist = await api.listHistory(q.id); } catch { hist = []; }
      $('#histbody').innerHTML = hist.length ? `<ul class="hist">${hist.map((h, n) => `<li>${esc(L.fmtDate(h.savedAt || h.updatedAt))} · ${esc(h.updatedBy?.name || h.updatedBy?.email || '')} · ${esc(L.STATUS_LABEL[h.status] || '')}<br><span class="muted">${esc((h.stem || '').slice(0, 100))}</span> <button type="button" class="link" data-n="${n}">Use this version</button></li>`).join('')}</ul>` : '<p class="muted">No earlier versions.</p>';
      $('#histbody').querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { const h = L.cleanQuestion(hist[+b.dataset.n]); q = { ...h, id: q.id, rev: q.rev }; keep(); draw(); toast('Loaded into the form. Press Save to keep it.'); }));
    });
  };
  async function commit(archivedNow) {
    const s = await api.saveQuestion(q, S.user);
    lsDel(draftKey); S.loaded.q = false;
    toast(archivedNow ? 'Archived.' : q.status === 'active' ? 'Saved. It is in the test.' : 'Saved.');
    go('#/faculty'); return s;
  }
  async function conflict() {
    const theirs = (await api.listQuestions()).map(L.cleanQuestion).find(x => x.id === q.id);
    const mine = await ask('Someone else saved this question first', `<p>${esc(theirs?.updatedBy?.name || theirs?.updatedBy?.email || 'Another person')} changed it at ${esc(L.fmtDate(theirs?.updatedAt))} while you were editing.</p><p>Keep your version (theirs stays in “Earlier versions”), or load theirs and lose your edits?</p>`, 'Keep mine');
    if (!theirs) return toast('That question was deleted.');
    if (mine) { q.rev = theirs.rev; base = theirs; try { await commit(false); } catch (e) { toast(errText(e)); } }
    else { lsDel(draftKey); S.loaded.q = false; base = theirs; q = L.cleanQuestion(theirs); draw(); }
  }
  draw();
}
function previewHtml(q) {
  const img = safeImg(q.image);
  return `<div class="q pv"><p class="stem">${q.stem ? nl(q.stem) : '<span class="muted">(question)</span>'}</p>${img ? `<img class="qimg" src="${img}" alt="">` : ''}<div class="opts">${q.options.map((o, k) => `<div class="opt${q.answer === k ? ' right' : ''}"><span class="ltr">${L.LETTERS[k]}</span><span class="txt">${o ? nl(o) : '<span class="muted">(empty)</span>'}</span>${q.answer === k ? '<span class="tick">Correct answer</span>' : ''}</div>`).join('')}</div></div>`;
}
// shrink a picture to at most 900 px, JPEG, small enough for the database
async function shrink(file) {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 900 / Math.max(bmp.width, bmp.height));
  const c = Object.assign(document.createElement('canvas'), { width: Math.round(bmp.width * s), height: Math.round(bmp.height * s) });
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
  for (const qual of [0.85, 0.7, 0.55, 0.4]) { const u = c.toDataURL('image/jpeg', qual); if (u.length < L.LIMITS.image) return u; }
  throw new Error('too big');
}

// ---------- faculty: paste many ----------
async function viewPaste() {
  await loadQuestions();
  setView(`
    <p><a href="#/faculty">← All questions</a></p>
    <h1>Paste many questions</h1>
    <p>Copy questions from Word, an email or a chat and paste them here. Each question starts with a number, then four choices starting A), B), C), D), then a line like <code>Answer: B</code>.</p>
    <details><summary>Example</summary><pre class="ex">Q1 Which drug is first-line for anaphylaxis?
A) Adrenaline
B) Hydrocortisone
C) Chlorphenamine
D) Salbutamol
Answer: A
Explanation: Adrenaline first, always.</pre></details>
    <label class="visually-hidden" for="paste">Questions to add</label><textarea id="paste" rows="12" placeholder="Paste here"></textarea>
    <p class="row"><button id="read" class="btn primary">Check what I pasted</button></p>
    <div id="out"></div>`, 'Paste many');
  $('#read').addEventListener('click', () => {
    const r = L.parsePaste($('#paste').value);
    const rows = r.questions.map(q => L.cleanQuestion({ ...q, status: 'draft' }));
    const complete = rows.map(q => L.problems(q, 'active').length === 0);
    $('#out').innerHTML = `
      ${r.warnings.length ? `<div class="status warn"><b>Please check:</b><ul>${r.warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul></div>` : ''}
      ${rows.length ? `<h2>${rows.length} question${rows.length > 1 ? 's' : ''} found</h2>
      <ol class="found">${rows.map((q, i) => `<li><label><input type="checkbox" class="inc" data-i="${i}" checked> <b>${esc(q.stem.slice(0, 120))}</b></label><br><span class="muted">${q.options.map((o, k) => `${L.LETTERS[k]}) ${esc(o.slice(0, 40))}`).join(' · ')}<br>${q.answer >= 0 ? 'Answer ' + L.LETTERS[q.answer] : '<b>no answer</b>'}${complete[i] ? '' : ' · incomplete'}</span></li>`).join('')}</ol>
      <p><label>Add them as <select id="as"><option value="draft">Drafts (check them before they go in the test)</option><option value="active">In the test (complete ones only)</option></select></label></p>
      <p class="row"><button id="addall" class="btn primary">Add the ticked questions</button></p>` : ''}`;
    $('#addall')?.addEventListener('click', async ev => busy(ev.target, async () => {
      const as = $('#as').value;
      const chosen = rows.filter((_, i) => document.querySelector(`.inc[data-i="${i}"]`).checked).map(q => ({ ...q, status: as === 'active' && L.problems(q, 'active').length === 0 ? 'active' : 'draft' }));
      if (!chosen.length) return toast('Nothing ticked.');
      try { const n = await api.bulkSaveQuestions(chosen, S.user); S.loaded.q = false; toast(`${n} added.`); go('#/faculty'); } catch (e) { toast('Not added: ' + errText(e)); }
    }));
  });
}

// ---------- faculty: backup and import ----------
async function viewData() {
  const all = await loadQuestions(true);
  setView(`
    <p><a href="#/faculty">← All questions</a></p>
    <h1>Backup and import</h1>
    <div class="card stack"><h2>Spreadsheet (Excel, Google Sheets)</h2>
      <p>Download all ${all.length} questions as a spreadsheet, edit them there, then upload it again. Rows with an <b>id</b> update that question; rows without one are added as new. Pictures are not in the spreadsheet.</p>
      <p class="row"><button id="csvdown" class="btn">Download spreadsheet</button> <label class="btn">Upload spreadsheet<input id="csvup" type="file" accept=".csv,text/csv" class="visually-hidden"></label></p></div>
    <div class="card stack"><h2>Full backup</h2>
      <p>One file with every question, pictures and settings. Keep a copy somewhere safe now and then, and before big changes.</p>
      <p class="row"><button id="jsondown" class="btn">Download backup</button> <label class="btn">Restore from backup<input id="jsonup" type="file" accept=".json,application/json" class="visually-hidden"></label></p></div>
    <div id="out"></div>`, 'Backup and import');
  $('#csvdown').addEventListener('click', () => download(`baby-mo-questions-${today()}.csv`, L.questionsToCSV(all)));
  $('#jsondown').addEventListener('click', () => download(`baby-mo-backup-${today()}.json`, L.bankToJSON(all, S.settings), 'application/json'));
  const stage = (incoming, warnings, label) => {
    const plan = L.planImport(incoming, all);
    $('#out').innerHTML = `<div class="card stack"><h2>${esc(label)}</h2>
      ${warnings.length ? `<div class="status warn"><ul>${warnings.slice(0, 20).map(w => `<li>${esc(w)}</li>`).join('')}${warnings.length > 20 ? `<li>…and ${warnings.length - 20} more</li>` : ''}</ul></div>` : ''}
      <p><b>${plan.add.length}</b> new question${plan.add.length === 1 ? '' : 's'} will be added and <b>${plan.update.length}</b> existing one${plan.update.length === 1 ? '' : 's'} will be updated (the old version stays in its history).</p>
      <p class="row"><button id="doimp" class="btn primary"${plan.add.length + plan.update.length ? '' : ' disabled'}>Go ahead</button> <button id="noimp" class="btn">Cancel</button></p></div>`;
    $('#noimp').addEventListener('click', () => { $('#out').innerHTML = ''; });
    $('#doimp').addEventListener('click', ev => busy(ev.target, async () => {
      try {
        const current = new Map((await api.listQuestions()).map(q => [q.id, L.cleanQuestion(q)]));
        for (const q of plan.update) await api.saveQuestion({ ...q, rev: current.get(q.id).rev, image: q.image || current.get(q.id).image }, S.user);
        if (plan.add.length) await api.bulkSaveQuestions(plan.add.map(q => ({ ...q, id: '' })), S.user);
        S.loaded.q = false; toast('Done.'); go('#/faculty');
      } catch (e) { toast('Stopped part-way: ' + errText(e)); }
    }));
  };
  const text = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = no; r.readAsText(f); });
  $('#csvup').addEventListener('change', async ev => { const f = ev.target.files[0]; if (!f) return; const r = L.questionsFromCSV(await text(f)); if (!r.questions.length) $('#out').innerHTML = `<div class="status warn">${esc(r.warnings[0] || 'No questions found.')}</div>`; else stage(r.questions, r.warnings, f.name); });
  $('#jsonup').addEventListener('change', async ev => { const f = ev.target.files[0]; if (!f) return; try { const b = L.bankFromJSON(await text(f)); stage(b.questions, [], f.name); } catch (e) { $('#out').innerHTML = `<div class="status warn">${esc(e.message)}</div>`; } });
}

// ---------- faculty: results ----------
async function loadAttempts(force) { if (force || !S.loaded.a) { S.attempts = await api.listAttempts(); S.loaded.a = true; } return S.attempts; }

async function viewResults() {
  setView('<h1>Results</h1><p class="loading">Loading…</p>', 'Results');
  const all = await loadAttempts(true);
  const tab = new URLSearchParams(location.hash.split('?')[1] || '').get('by') === 'question' ? 'question' : 'person';
  const cohorts = [...new Set(all.map(a => a.cohort).filter(Boolean))].sort().reverse();
  const f = viewResults.f ||= { search: '', cohort: '' };
  const rows = all.filter(a => (!f.cohort || a.cohort === f.cohort) && (!f.search || a.name.toLowerCase().includes(f.search.toLowerCase())));
  const sums = rows.map(a => ({ a, s: L.summarise(a) }));
  const passN = sums.filter(x => x.s.pass).length;
  const body = tab === 'person' ? (rows.length ? `<div class="tablewrap"><table><thead><tr><th scope="col">Name</th><th scope="col">Cohort</th><th scope="col">When</th><th scope="col">Score</th><th scope="col">Result</th></tr></thead><tbody>${sums.map(({ a, s }) => `<tr><th scope="row"><a href="#/faculty/attempt/${esc(a.id)}">${esc(a.name)}</a></th><td>${esc(a.cohort || '')}</td><td>${esc(L.fmtDate(a.submittedAt))}</td><td>${s.score}/${s.total}</td><td><span class="badge ${s.pass ? 'active' : 'bad'}">${s.pass ? 'Pass' : 'Not yet'}</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No results yet.</p>')
    : (() => { const st = L.questionStats(rows); return st.length ? `<p class="muted">Hardest first. A question most people get wrong may be badly worded, or have the wrong answer saved: worth a look.</p><div class="tablewrap"><table><thead><tr><th scope="col">Question</th><th scope="col">Asked</th><th scope="col">Correct</th><th scope="col">Most chosen wrong answer</th></tr></thead><tbody>${st.map(x => { const w = x.picks.map((n, k) => [n, k]).filter(([, k]) => k !== x.answer).sort((p, q) => q[0] - p[0])[0]; return `<tr><th scope="row"><a href="#/faculty/q/${esc(x.qid)}">${esc(x.stem.slice(0, 110))}</a></th><td>${x.n}</td><td><span class="badge ${x.pct >= 60 ? 'active' : 'bad'}">${x.pct}%</span></td><td>${w && w[0] ? L.LETTERS[w[1]] + ' (' + w[0] + ')' : '-'}</td></tr>`; }).join('')}</tbody></table></div>` : '<p class="empty">No results yet.</p>'; })();
  setView(`
    <h1>Results</h1>
    <p class="summary"><b>${rows.length}</b> sitting${rows.length === 1 ? '' : 's'}${rows.length ? `; <b>${passN}</b> passed (${Math.round(passN / rows.length * 100)}%)` : ''}.</p>
    <div class="filters"><label class="visually-hidden" for="rs">Search by name</label><input id="rs" type="search" placeholder="Search by name" value="${esc(f.search)}">
      ${cohorts.length ? `<label class="visually-hidden" for="rc">Cohort</label><select id="rc"><option value="">All cohorts</option>${cohorts.map(c => `<option${f.cohort === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>` : ''}
      <div class="chips"><a class="chip" href="#/faculty/results" aria-current="${tab === 'person'}">By person</a><a class="chip" href="#/faculty/results?by=question" aria-current="${tab === 'question'}">By question</a></div></div>
    ${body}
    <p class="row"><button id="csv" class="btn"${rows.length ? '' : ' disabled'}>Download as spreadsheet</button></p>`, 'Results');
  $('#rs').addEventListener('input', ev => { f.search = ev.target.value; clearTimeout(viewResults.t); viewResults.t = setTimeout(async () => { await viewResults(); const el = $('#rs'); el.focus(); el.setSelectionRange(el.value.length, el.value.length); }, 250); });
  $('#rc')?.addEventListener('change', ev => { f.cohort = ev.target.value; viewResults(); });
  $('#csv').addEventListener('click', () => download(`baby-mo-results-${today()}.csv`, L.attemptsToCSV(rows)));
}

async function viewAttempt(id) {
  const a = (await loadAttempts()).find(x => x.id === id);
  if (!a) return go('#/faculty/results');
  const s = L.summarise(a);
  setView(`
    <p><a href="#/faculty/results">← All results</a></p>
    <h1>${esc(a.name)}</h1>
    <p class="summary"><b>${s.score}/${s.total}</b> (${s.pct}%) · ${s.pass ? 'Pass' : 'Not yet'} · ${esc(L.fmtDate(a.submittedAt))}${a.cohort ? ' · ' + esc(a.cohort) : ''}${a.durationSec != null ? ` · ${Math.round(a.durationSec / 60)} min` : ''}</p>
    <ol class="review">${a.items.map((it, i) => { const ok = it.picked === it.answer; return `<li class="rv ${ok ? 'ok' : 'no'}"><p><b>${i + 1}.</b> ${nl(it.stem)}</p><p><span class="mk ${ok ? 'ok' : 'no'}" aria-hidden="true">${ok ? '✓' : '✗'}</span> Chose: <b>${it.picked == null ? 'none' : L.LETTERS[it.picked] + '. ' + esc(it.options[it.picked])}</b></p>${ok ? '' : `<p>Correct: <b>${L.LETTERS[it.answer]}. ${esc(it.options[it.answer])}</b></p>`}</li>`; }).join('')}</ol>
    ${S.role === 'admin' ? '<p class="row"><button id="delatt" class="btn danger">Delete this result</button></p>' : ''}`, a.name);
  $('#delatt')?.addEventListener('click', async () => {
    if (!await ask('Delete this result?', `<p>${esc(a.name)}'s sitting is removed for good.</p>`, 'Delete', true)) return;
    try { await api.deleteAttempt(a.id); S.loaded.a = false; go('#/faculty/results'); } catch (e) { toast(errText(e)); }
  });
}

// ---------- faculty: settings ----------
async function viewSettings() {
  setView('<h1>Settings</h1><p class="loading">Loading…</p>', 'Settings');
  await loadQuestions(true);
  const st = S.settings, pass = await api.getPassphrase().catch(() => '');
  const usable = S.questions.filter(L.isUsable).length;
  setView(`
    <h1>Settings</h1>
    <form id="sf" class="card stack" novalidate>
      <label>Title<input id="s-title" value="${esc(st.title)}" maxlength="80"></label>
      <div class="three">
        <label>Questions per test<input id="s-count" type="number" min="1" max="100" value="${st.count}"></label>
        <label>Minutes<input id="s-min" type="number" min="1" max="240" value="${st.minutes}"></label>
        <label>Pass mark %<input id="s-pass" type="number" min="1" max="100" value="${st.passMark}"></label>
      </div>
      <p class="muted small">${usable} complete questions are in the test now. Each MO gets a different random ${Math.min(st.count, usable)}.</p>
      <label>Current cohort <span class="muted">(stamped on every result, e.g. “Oct 2026 intake”)</span><input id="s-cohort" value="${esc(st.cohort)}" maxlength="60"></label>
      <label>After submitting, the MO sees<select id="s-review"><option value="score"${st.review === 'score' ? ' selected' : ''}>Score only</option><option value="marks"${st.review === 'marks' ? ' selected' : ''}>Score and which questions were right or wrong</option><option value="full"${st.review === 'full' ? ' selected' : ''}>Everything: correct answers and explanations</option></select></label>
      <label>Message before the test <span class="muted">(optional)</span><textarea id="s-intro" rows="3" maxlength="1000">${esc(st.intro)}</textarea></label>
      <p id="serr" class="err" role="alert" hidden></p>
      <p class="row"><button class="btn primary" type="submit">Save settings</button></p>
    </form>
    <form id="pf" class="card stack"><h2>Passphrase for MOs</h2>
      <label>Passphrase<input id="p-pass" value="${esc(pass)}" autocomplete="off"></label>
      <p class="muted small">${mode === 'cloud' ? 'Changing it signs everyone out of new tests; share the new one with the next group.' : 'Demo passphrase.'} Anyone who has it can sit the test, so change it for each new intake.</p>
      <p class="row"><button class="btn primary" type="submit">Save passphrase</button></p></form>`, 'Settings');
  $('#sf').addEventListener('submit', async ev => {
    ev.preventDefault();
    const n = { title: $('#s-title').value.trim() || L.DEFAULT_SETTINGS.title, count: +$('#s-count').value, minutes: +$('#s-min').value, passMark: +$('#s-pass').value, cohort: $('#s-cohort').value.trim(), review: $('#s-review').value, intro: $('#s-intro').value.trim() };
    const err = $('#serr');
    if (![n.count, n.minutes, n.passMark].every(Number.isInteger) || n.count < 1 || n.count > 100 || n.minutes < 1 || n.minutes > 240 || n.passMark < 1 || n.passMark > 100) { err.textContent = 'Check the numbers: questions 1 to 100, minutes 1 to 240, pass mark 1 to 100.'; err.hidden = false; return; }
    err.hidden = true;
    try { await api.saveSettings(n, S.user); S.settings = { ...L.DEFAULT_SETTINGS, ...n }; toast('Saved.'); viewSettings(); } catch (e) { err.textContent = 'Not saved: ' + errText(e); err.hidden = false; }
  });
  $('#pf').addEventListener('submit', async ev => {
    ev.preventDefault(); const p = $('#p-pass').value.trim();
    if (p.length < 4) return toast('Use at least 4 characters.');
    try { await api.setPassphrase(p); toast('Passphrase saved.'); } catch (e) { toast(errText(e)); }
  });
}

// ---------- faculty: people (requests and the faculty list) ----------
async function viewPeople() {
  setView('<h1>Faculty</h1><p class="loading">Loading…</p>', 'Faculty');
  const [members, reqs] = await Promise.all([api.listMembers().catch(() => []), api.listRequests().catch(() => [])]);
  if (reqs.length !== S.pending) { S.pending = reqs.length; renderNav(); }
  const admin = S.role === 'admin';
  const roleName = r => (r === 'admin' ? 'Admin' : 'Faculty');
  setView(`
    <h1>Faculty</h1>
    <p class="lead">Faculty can edit questions and see every result. Anyone with a Google account can ask for access on the Faculty page; any faculty member can approve.</p>
    <h2>Waiting for approval</h2>
    ${reqs.length ? `<ul class="members" id="reqs">${reqs.map(r => `<li><span>${esc(r.name)} <b>${esc(r.email)}</b><br><span class="muted small">asked ${esc(L.fmtDate(r.requestedAt))}</span></span>
      <span class="row"><button class="btn primary" data-ap="${esc(r.email)}" data-role="editor">Approve</button>${admin ? `<button class="btn" data-ap="${esc(r.email)}" data-role="admin">Approve as admin</button>` : ''}<button class="btn" data-dec="${esc(r.email)}">Decline</button></span></li>`).join('')}</ul>` : '<p class="muted">Nobody is waiting.</p>'}
    <h2>Current faculty</h2>
    <ul class="members" id="mem">${members.map(m => `<li><span>${esc(m.name || '')} <b>${esc(m.email)}</b> · ${roleName(m.role)}</span>${m.email === S.user.email ? '<span class="muted">you</span>' : admin ? `<span class="row"><label class="visually-hidden" for="r-${esc(m.email)}">Role of ${esc(m.email)}</label><select id="r-${esc(m.email)}" data-role-of="${esc(m.email)}"><option value="editor"${m.role !== 'admin' ? ' selected' : ''}>Faculty</option><option value="admin"${m.role === 'admin' ? ' selected' : ''}>Admin</option></select><button class="btn" data-rm="${esc(m.email)}">Remove</button></span>` : ''}</li>`).join('')}</ul>
    <p class="muted small">Faculty can approve new faculty. Only admins can make someone an admin, change a role or remove a person, and change settings.</p>
    ${admin ? `<form id="mf" class="card stack"><h2>Add someone yourself</h2><div class="two"><label>Google email<input id="m-email" type="email" required placeholder="name@example.com"></label><label>Name<input id="m-name" placeholder="Dr Tan"></label></div>
      <label>Can<select id="m-role"><option value="editor">Edit questions and see results</option><option value="admin">Do everything (settings, passphrase, make others admin)</option></select></label>
      <p class="row"><button class="btn" type="submit">Add</button></p></form>` : ''}`, 'Faculty');
  const again = () => viewPeople();
  $('#app').querySelectorAll('[data-ap]').forEach(b => b.addEventListener('click', async () => {
    const as = b.dataset.role;
    if (!await ask('Approve this person?', `<p><b>${esc(b.dataset.ap)}</b> will be able to ${as === 'admin' ? 'do everything: settings, the passphrase, and the faculty list, as well as ' : ''}edit questions and see every MO's result.</p>`, 'Approve')) return;
    try { await api.approveRequest(b.dataset.ap, as); toast('Approved.'); again(); } catch (e) { toast(e.code === 'not-found' ? 'That request is gone (already handled?).' : errText(e)); again(); }
  }));
  $('#app').querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', async () => {
    if (!await ask('Decline this request?', `<p>${esc(b.dataset.dec)} will not get access. They can ask again.</p>`, 'Decline', true)) return;
    try { await api.declineRequest(b.dataset.dec); again(); } catch (e) { toast(errText(e)); }
  }));
  $('#app').querySelectorAll('[data-role-of]').forEach(sel => sel.addEventListener('change', async () => {
    const m = members.find(x => x.email === sel.dataset.roleOf);
    try { await api.saveMember(m.email, { role: sel.value, name: m.name || '' }); toast('Saved.'); again(); } catch (e) { toast(errText(e)); again(); }
  }));
  $('#mf')?.addEventListener('submit', async ev => {
    ev.preventDefault();
    try { await api.saveMember($('#m-email').value.trim(), { role: $('#m-role').value, name: $('#m-name').value.trim() }); toast('Added.'); again(); } catch (e) { toast(errText(e)); }
  });
  $('#app').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', async () => {
    if (!await ask('Remove from faculty?', `<p>${esc(b.dataset.rm)} will no longer be able to edit questions or see results.</p>`, 'Remove', true)) return;
    try { await api.removeMember(b.dataset.rm); again(); } catch (e) { toast(errText(e)); }
  }));
}

// ---------- faculty: help ----------
function viewHelp() {
  setView(`
    <h1>How this works</h1>
    ${mode === 'local' ? `<div class="status warn">${isDemo ? 'This is the demo.' : 'The shared database is not connected yet.'} Everything you do stays in this browser and is not shared. Demo passphrase for the test: <b>demo</b>.</div>` : ''}
    <h2>Adding or changing a question</h2>
    <ol><li>Open <b>Questions</b>, tap <b>+ New question</b> (or tap an existing one).</li><li>Type the question and the four choices. Tick the circle next to the correct one.</li><li>Set the status to <b>In the test</b> when it is ready. Leave it as <b>Draft</b> if someone should check it first. Drafts are never shown to MOs.</li><li>Tap <b>Save</b>. The preview under the form shows what the MO will see.</li></ol>
    <p>Wrong answer noticed later? Edit it and save. Past results keep the question as it was when that person sat the test, so old scores do not change.</p>
    <h2>Adding many at once</h2><p>Use <b>Paste many</b>: paste questions from Word or an email. Or download the spreadsheet from <b>Backup and import</b>, add rows in Excel or Google Sheets, and upload it again.</p>
    <h2>Mistakes</h2><ul><li>Every save keeps the earlier version: open the question and look under <b>Earlier versions</b>.</li><li>If two people edit the same question, the app tells the second person and lets them choose.</li><li>If your connection drops while typing, your text is kept on your device.</li><li>Please download a <b>full backup</b> now and then.</li></ul>
    <h2>Adding faculty</h2><p>Nobody has to be listed in advance. A colleague opens the Faculty page, signs in with Google and taps <b>Ask for faculty access</b>. Any faculty member then opens <b>Faculty</b> in the menu (it shows a number when someone is waiting) and taps <b>Approve</b>.</p>
    <h2>For each new intake</h2><ol><li>Settings: change the <b>passphrase</b> and the <b>cohort</b> name.</li><li>Send the MOs the link and the passphrase.</li><li>Results appear under <b>Results</b>; download them as a spreadsheet.</li></ol>
    <h2>Good to know</h2><p>Each MO gets a different random set of questions from the “In the test” ones. The passphrase keeps casual visitors out; it is not high security, so do not put anything confidential in a question.</p>`, 'Help');
}

// ---------- start ----------
(async function init() {
  renderNav();
  let first = true;
  await api.watchUser(async u => {
    const wasFaculty = !!S.role, prevId = S.user?.uid;
    S.user = u; S.role = null;
    if (u && !u.anonymous) { try { S.role = await api.memberRole(u.email); } catch { S.role = null; } }
    S.loaded = {};
    if (first) { first = false; userReady(); }
    // an MO's own anonymous login appearing must not redraw the page they are on; faculty signing in or out must
    else if (wasFaculty !== !!S.role || (u && !u.anonymous && prevId !== u.uid) || (!u && wasFaculty)) route();
    else if (location.hash.startsWith('#/faculty') && !S.role) route();
    if (u) flushOutbox();
  });
  setTimeout(userReady, 5000);   // never sit on "Loading" if sign-in services are unreachable
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  route();
})();
