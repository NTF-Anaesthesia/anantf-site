// The qbank app (anantf.com/qbank/): practise the department's questions on a phone. No sign-in; progress stays on the
// phone (localStorage, keys qbank.v1.*). Screens are hash routes (#/practise, #/q/<id>, ...). Design: qbank/NOTES.md and
// the design spec; shared building blocks in ../ui/ui.js, question logic in bank.js and practice.js.
import * as B from './bank.js';
import * as P from './practice.js';
import * as U from '../ui/ui.js';
const { $, $$, esc, icon } = U;

const db = U.store('qbank.v1.');
const S = { pool: [], byId: new Map(), papers: [], loaded: false, error: null, browse: { q: '', topic: '' }, cleanup: [] };
const TAB_ROOTS = { '/practise': 'practise', '/browse': 'browse', '/papers': 'papers', '/progress': 'progress' };

// ---------- state on this phone ----------
const progress = () => db.get('progress', {});
const flags = () => db.get('flags', {});
const getSession = () => { const s = db.get('session', null); return s && Array.isArray(s.items) && !s.finishedAt ? s : null; };
const saveSession = s => db.set('session', s);
const pastSessions = () => db.get('history', []).filter(h => h && Array.isArray(h.items));
const isFlagged = id => !!flags()[id];
function setFlag(id, on) { const f = flags(); if (on) f[id] = Date.now(); else delete f[id]; db.set('flags', f); }
const live = id => S.byId.get(id);   // the current bank version of a question, if it is still ready

// ---------- data ----------
async function getJSON(url) { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }
async function load() {
  S.error = null;
  try {
    const bank = await getJSON('bank/questions.json');
    if (bank?.kind !== B.KIND || !Array.isArray(bank.questions)) throw new Error('not a bank');
    const extra = [];
    try {
      const src = await getJSON('sources.json');
      for (const s of src.sources || []) { try { const f = await getJSON(typeof s === 'string' ? s : s.url); if (f?.kind === B.KIND) extra.push(f.questions); } catch { /* one source down: skip it */ } }
    } catch { /* no sources */ }
    S.pool = B.readyQuestions(bank.questions, ...extra);
    S.byId = new Map(S.pool.map(q => [q.id, q]));
    const index = await getJSON('papers.json').catch(() => ({ papers: [] }));
    S.papers = (await Promise.all((index.papers || []).map(id => getJSON(`papers/${id}.json`).catch(() => null)))).filter(Boolean)
      .map(paper => ({ paper, resolved: B.resolvePaper(paper, bank.questions) }));
    S.loaded = true;
  } catch (e) { S.error = e; }
}

// ---------- screen frame ----------
const main = () => $('#main');
function frame({ title, large = false, back = null, start = '', mid = '', end = '', extra = '', body = '', foot = '', tab = null, focus = false, keepScroll = false }) {
  for (const f of S.cleanup.splice(0)) f();
  document.body.classList.toggle('focus', !!focus);
  const bar = $('#bar');
  bar.className = 'bar' + (large ? '' : ' fixed');
  $('#bar-start').innerHTML = back ? `<button type="button" class="back" data-parent="${esc(back.to)}">${icon.back()}<span>${esc(back.label)}</span></button>` : start;
  $('#bar-mid').innerHTML = mid || (large ? `<div class="bar-title" aria-hidden="true">${esc(title)}</div>` : `<h1 class="bar-title" tabindex="-1">${esc(title)}</h1>`);
  $('#bar-end').innerHTML = end;
  $('#bar-extra').innerHTML = extra;
  const m = main(), top = m.scrollTop;
  m.innerHTML = (large ? `<h1 class="large-title" tabindex="-1">${esc(title)}</h1>` : '') + body;
  m.scrollTop = keepScroll ? top : 0;
  $('#foot').innerHTML = foot;
  $$('.tab').forEach(t => { if (t.dataset.tab === tab) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  document.title = `${title} · Question bank`;
  U.watchLargeTitle(m, bar);
  $('#bar-start .back')?.addEventListener('click', e => U.back(e.currentTarget.dataset.parent));
}
const skeleton = () => `<div class="sk sk-title"></div>${'<div class="sk-row"><div class="sk" style="width:64%"></div></div>'.repeat(5)}`;
function problemView() {
  frame({ title: 'Question bank', large: true, tab: null, body: `<div class="problem" role="alert"><p>Couldn't load the questions. Check your signal.</p><button type="button" class="btn btn-secondary" id="retry">Try again</button></div>` });
  $('#retry').addEventListener('click', async () => { main().innerHTML = skeleton(); await load(); render(U.routeOf(), 'none'); });
}

// ---------- small pieces ----------
const decode = s => { try { return decodeURIComponent(s); } catch { return s; } };   // a mangled link must not stop the app
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const topicLine = q => (q.topics.length ? q.topics : ['General']).map(esc).join(' · ');
const fmtDate = d => { if (!d) return ''; const t = new Date(d + (d.length === 10 ? 'T12:00' : '')); return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
const fmtWhen = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function qRow(q, href = `#/q/${q.id}`) {
  const st = P.statusOf(progress(), q.id), fl = isFlagged(q.id);
  const marks = [st === 'missed' ? '<span class="badge missed">Missed</span>' : '', fl ? '<span class="badge flag">Flagged</span>' : ''].join('');
  return `<li><a class="row" href="${href}"><span class="row-main"><span class="row-title clamp2">${esc(q.stem)}</span><span class="row-sub">${topicLine(q)}</span></span>${marks ? `<span class="row-trail">${marks}</span>` : ''}<span class="chev" aria-hidden="true">›</span></a></li>`;
}
function navRow({ id = '', href = '', title, sub = '', trail = '', danger = false }) {
  const inner = `<span class="row-main"><span class="row-title">${title}</span>${sub ? `<span class="row-sub">${sub}</span>` : ''}</span>${trail ? `<span class="row-trail">${trail}</span>` : ''}<span class="chev" aria-hidden="true">›</span>`;
  return `<li>${href ? `<a class="row${danger ? ' danger' : ''}" href="${href}"${id ? ` id="${id}"` : ''}>${inner}</a>` : `<button type="button" class="row${danger ? ' danger' : ''}" id="${id}">${inner}</button>`}</li>`;
}
const minibar = share => `<span class="minibar" aria-hidden="true"><span style="width:${Math.round(share * 100)}%"></span></span>`;
const imgHtml = q => q.image ? `<button type="button" class="q-img" data-zoom="${esc(q.image)}" aria-label="Enlarge the picture"><img src="${esc(q.image)}" alt="${esc(q.imageAlt || 'Picture for this question')}" loading="eager"></button>` : '';

// Choices. mode: 'pick' (practice, not yet answered), 'exam' (selectable), 'feedback' (after answering, or in review),
// 'hidden' (detail, answer not shown), 'reveal' (detail, answer shown).
function choicesHtml(q, mode, picked) {
  const interactive = mode === 'pick' || mode === 'exam';
  const items = q.options.map((o, i) => {
    const L = P.letter(i);
    let cls = '', badge = L, state = '', said = '';
    if (mode === 'exam' && i === picked) { cls = 'sel'; said = ', selected'; }
    if (mode === 'feedback') {
      if (i === q.answer && i === picked) { cls = 'ok'; badge = icon.check(); state = 'Correct'; said = ', your answer, correct'; }
      else if (i === picked) { cls = 'bad'; badge = icon.cross(); state = 'Your answer'; said = ', your answer, incorrect'; }
      else if (i === q.answer) { cls = picked == null ? 'answer' : 'answer'; badge = icon.check(); state = 'Answer'; said = ', correct answer'; }
      else cls = 'dim';
    }
    if (mode === 'reveal') {
      if (i === q.answer) { cls = 'ok'; badge = icon.check(); state = 'Answer'; said = ', correct answer'; } else cls = 'dim';
    }
    const inner = `<span class="letter" aria-hidden="true">${badge}</span><span class="sr-only">${L}, </span><span class="ctext">${esc(o)}</span><span class="sr-only">${said}</span>${state ? `<span class="cstate" aria-hidden="true">${state}</span>` : ''}`;
    return interactive
      ? `<button type="button" class="choice ${cls}" data-i="${i}"${mode === 'exam' ? ` aria-pressed="${i === picked}"` : ''}>${inner}</button>`
      : `<li class="choice ${cls}">${inner}</li>`;
  }).join('');
  return interactive ? `<div class="choices" role="group" aria-labelledby="stem">${items}</div>` : `<ul class="choices" aria-labelledby="stem">${items}</ul>`;
}
function questionHtml(q, mode, picked, { kicker = '' } = {}) {
  return `<div class="q-wrap"><div class="q-kicker"><span class="kicker">${topicLine(q)}</span>${q.level === 'hard' ? '<span class="badge hard">Hard</span>' : ''}${kicker}</div>
    <p class="stem" id="stem">${esc(q.stem)}</p>${imgHtml(q)}${choicesHtml(q, mode, picked)}<div id="after"></div></div>`;
}
const explainHtml = q => `<div class="explain"><h2>Explanation</h2>${q.explain ? q.explain.split(/\n{2,}/).map(p => `<p>${esc(p)}</p>`).join('') : '<p class="muted">No explanation yet. If you know why, suggest one.</p>'}</div>`;
function wireZoom(root = main()) {
  root.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    U.openSheet({ title: 'Picture', size: 'large', body: `<img src="${esc(b.dataset.zoom)}" alt="${esc(b.querySelector('img')?.alt || 'Picture for this question')}" style="width:100%;height:auto;display:block">` });
  }));
}

// ---------- starting sessions ----------
function begin(opts) {
  if (!opts.questions.length) { U.toast('No questions match.'); return; }
  const old = getSession();
  const s = P.newSession(opts);
  saveSession(s);
  if (old) U.toast('Started a new session. The last one was closed.', { action: 'Undo', onAction: () => { saveSession(old); U.go('#/session', { replace: true }); render(U.routeOf(), 'none'); } });
  U.go('#/session');
}
const quick = () => begin({ kind: 'quick', label: 'Quick 10', questions: P.pickPractice(S.pool, progress(), 10) });
function practiseTopic(t) {
  const pool = S.pool.filter(q => P.inTopic(q, t));
  begin({ kind: 'topic', label: t, questions: P.pickPractice(pool, progress(), 10) });
}

// ---------- Practise (home) ----------
function viewPractise() {
  const s = getSession(), pr = progress(), fl = flags();
  const missed = S.pool.filter(q => P.statusOf(pr, q.id) === 'missed').length, flagged = S.pool.filter(q => fl[q.id]).length;
  const resume = s ? (() => {
    const left = P.secondsLeft(s);
    return `<div class="card" id="resume-card"><h2>Resume: Q ${s.pos + 1} of ${s.items.length} · ${esc(s.label)}</h2>
      <p class="row-sub">${(a => a ? `${plural(a, 'answer')} kept` : 'Not started yet')(s.items.filter(i => i.picked != null).length)}${left != null ? ` · ${left ? P.clock(left) + ' left' : 'time is up'}` : ''}</p>
      <div class="stack"><button type="button" class="btn btn-primary" id="resume">Resume</button><button type="button" class="btn-text" id="discard" style="justify-self:center">Discard</button></div></div>`;
  })() : '';
  const body = !S.pool.length ? '<div class="empty"><p>No questions are ready yet.</p></div>' : `${resume}
    <div class="card"><h2>Quick practice</h2><p class="row-sub">Ten questions, mixing ones you haven't seen with ones you missed.</p>
      <button type="button" class="btn ${s ? 'btn-secondary' : 'btn-primary'}" id="quick">Start 10 questions</button></div>
    <div class="group"><span class="kicker">Practise by</span><ul class="rows">
      ${navRow({ href: '#/topics', title: 'By topic', trail: String(P.topicsOf(S.pool).length) })}
      ${navRow({ id: 'exam', title: 'Exam mode', sub: 'Timed, answers at the end' })}
      ${navRow({ href: '#/list/missed', title: `My missed (${missed})` })}
      ${navRow({ href: '#/list/flagged', title: `Flagged (${flagged})` })}
      ${navRow({ id: 'custom', title: 'Custom practice', sub: 'Choose topics, how many and how' })}
    </ul></div>
    <p class="pad small muted">${plural(S.pool.length, 'question')} ready. Answers and progress stay on this phone.</p>`;
  frame({ title: 'Practise', large: true, tab: 'practise', body });
  $('#quick')?.addEventListener('click', quick);
  $('#resume')?.addEventListener('click', () => U.go('#/session'));
  $('#discard')?.addEventListener('click', () => {
    const old = getSession(); if (!old) return;
    db.del('session'); viewPractise();
    U.toast('Session discarded.', { action: 'Undo', onAction: () => { saveSession(old); viewPractise(); } });
  });
  $('#exam')?.addEventListener('click', examSheet);
  $('#custom')?.addEventListener('click', customSheet);
}

function viewTopics() {
  const pr = progress();
  const rows = P.topicsOf(S.pool).map(({ topic, count }) => {
    const qs = S.pool.filter(q => P.inTopic(q, topic));
    const unseen = qs.filter(q => P.statusOf(pr, q.id) === 'unseen').length, missed = qs.filter(q => P.statusOf(pr, q.id) === 'missed').length;
    return `<li><button type="button" class="row" data-topic="${esc(topic)}"><span class="row-main"><span class="row-title">${esc(topic)}</span><span class="row-sub">${plural(count, 'question')} · ${unseen} unseen${missed ? ` · ${missed} missed` : ''}</span></span><span class="chev" aria-hidden="true">›</span></button></li>`;
  }).join('');
  frame({ title: 'By topic', back: { label: 'Practise', to: '#/practise' }, tab: 'practise',
    body: `<p class="pad small muted" style="margin-top:12px">Tap a topic to start up to 10 of its questions.</p><ul class="rows">${rows}</ul>` });
  $$('[data-topic]').forEach(b => b.addEventListener('click', () => practiseTopic(b.dataset.topic)));
}

function viewList(kind) {
  const pr = progress(), fl = flags();
  const qs = S.pool.filter(q => kind === 'missed' ? P.statusOf(pr, q.id) === 'missed' : fl[q.id]);
  const title = kind === 'missed' ? 'My missed' : 'Flagged';
  const body = qs.length
    ? `<div class="pad" style="padding-top:12px;padding-bottom:16px"><button type="button" class="btn btn-primary" id="go">Practise these (${qs.length})</button></div><ul class="rows">${qs.map(q => qRow(q)).join('')}</ul>`
    : `<div class="empty"><p>${kind === 'missed' ? 'Nothing missed yet.' : 'Nothing flagged yet. Flag a question during practice to find it here.'}</p><button type="button" class="btn btn-primary" id="quick">Start 10 questions</button></div>`;
  frame({ title, back: { label: 'Practise', to: '#/practise' }, tab: 'practise', body });
  $('#go')?.addEventListener('click', () => begin({ kind, label: title, questions: B.shuffle(qs) }));
  $('#quick')?.addEventListener('click', quick);
}

// ---------- sheets: custom practice and exam mode ----------
const topicOptions = () => P.topicsOf(S.pool).map(t => ({ value: t.topic, label: t.topic }));
function customSheet() {
  const saved = db.get('custom', {});
  let topics = (saved.topics || []).filter(t => S.pool.some(q => P.inTopic(q, t)));
  let status = saved.status || 'all', count = P.COUNTS.includes(saved.count) ? saved.count : 10, mode = saved.mode || 'practice';
  const sh = U.openSheet({ title: 'Custom practice',
    body: `<div class="field"><span class="label" id="ct-l">Topics</span><span class="hint">None chosen means every topic.</span>${U.chips('topics', topicOptions(), topics, 'Topics')}</div>
      <div class="field"><span class="label">Questions</span>${U.seg('status', [{ value: 'all', label: 'All' }, { value: 'unseen', label: 'Unseen' }, { value: 'missed', label: 'Missed' }, { value: 'flagged', label: 'Flagged' }], status, 'Which questions')}</div>
      <div class="setting"><span class="setting-label">How many</span>${U.stepper('count', 'How many questions', P.countLabel(count))}</div>
      <div class="field" style="margin-top:8px"><span class="label">Mode</span>${U.seg('mode', [{ value: 'practice', label: 'Practice' }, { value: 'exam', label: 'Exam' }], mode, 'Mode')}
      <span class="hint" id="mode-hint"></span></div>`,
    foot: `<p class="live-line" id="match" role="status"></p><button type="button" class="btn btn-primary" id="cstart">Start</button>` });
  const el = sh.el;
  const matching = () => P.filterPool(S.pool, { topics, status }, progress(), flags());
  const paint = () => {
    const n = matching().length, take = count ? Math.min(count, n) : n;
    el.querySelector('#match').textContent = `${plural(n, 'question')} match${n === 1 ? 'es' : ''}${n && take < n ? `; you'll get ${take}` : ''}.`;
    el.querySelector('#cstart').setAttribute('aria-disabled', n ? 'false' : 'true');
    el.querySelector('#mode-hint').textContent = mode === 'exam' ? `Timed (1 minute a question), answers at the end.` : 'See the answer after each question.';
    db.set('custom', { topics, status, count, mode });
  };
  U.wireChips(el, 'topics', v => { topics = v; paint(); });
  U.wireSeg(el, 'status', v => { status = v; paint(); });
  U.wireSeg(el, 'mode', v => { mode = v; paint(); });
  U.wireStepper(el, 'count', P.COUNTS, P.COUNTS.indexOf(count), v => { count = v; paint(); }, P.countLabel);
  el.querySelector('#cstart').addEventListener('click', () => {
    const pool = matching(); if (!pool.length) { U.toast('No questions match. Choose more topics or All.'); return; }
    const qs = P.pickPractice(pool, progress(), count);
    begin({ kind: 'custom', label: mode === 'exam' ? 'Custom exam' : 'Custom', mode, questions: qs, minutes: qs.length });
  });
  paint();
}
const MINUTES = Array.from({ length: 120 }, (_, i) => i + 1);   // default: one minute a question
function examSheet() {
  const saved = db.get('exam', {});
  let topics = (saved.topics || []).filter(t => S.pool.some(q => P.inTopic(q, t)));
  let count = P.COUNTS.includes(saved.count) ? saved.count : 20, minutes = saved.minutes || 0, touched = !!saved.minutes;
  const sh = U.openSheet({ title: 'Exam mode',
    body: `<p class="small muted">Timed. You can change answers and flag questions; you'll see the answers when you submit.</p>
      <div class="setting"><span class="setting-label">Questions</span>${U.stepper('ecount', 'Number of questions', P.countLabel(count))}</div>
      <div class="setting"><span class="setting-label">Minutes</span>${U.stepper('emin', 'Minutes', '')}</div>
      <div class="field" style="margin-top:8px"><span class="label">Topics</span><span class="hint">None chosen means every topic.</span>${U.chips('etopics', topicOptions(), topics, 'Topics')}</div>`,
    foot: `<p class="live-line" id="ematch" role="status"></p><button type="button" class="btn btn-primary" id="estart">Start exam</button>` });
  const el = sh.el;
  const pool = () => P.filterPool(S.pool, { topics }, progress(), flags());
  const n = () => { const p = pool().length; return count ? Math.min(count, p) : p; };
  const fitMinutes = () => Math.min(MINUTES.length, Math.max(1, n()));
  const mins = U.wireStepper(el, 'emin', MINUTES, Math.max(0, MINUTES.indexOf(minutes || fitMinutes())), v => { minutes = v; touched = true; paint(); }, v => `${v}`);
  const paint = () => {
    if (!touched) { minutes = fitMinutes(); mins.set(minutes); }
    el.querySelector('#ematch').textContent = `${plural(n(), 'question')} · ${minutes} minutes`;
    el.querySelector('#estart').setAttribute('aria-disabled', n() ? 'false' : 'true');
    db.set('exam', { topics, count, minutes: touched ? minutes : 0 });
  };
  U.wireStepper(el, 'ecount', P.COUNTS, P.COUNTS.indexOf(count), v => { count = v; paint(); }, P.countLabel);
  U.wireChips(el, 'etopics', v => { topics = v; paint(); });
  el.querySelector('#estart').addEventListener('click', () => {
    const p = pool(); if (!p.length) { U.toast('No questions match.'); return; }
    begin({ kind: 'exam', label: 'Exam', mode: 'exam', questions: B.shuffle(p).slice(0, count || p.length), minutes });
  });
  paint();
}

// ---------- the session (full screen, no tab bar) ----------
let timerId = 0;
const vt = d => (d === 'none-keep' ? 'none' : d);   // 'none-keep': redraw in place, no animation, same scroll
function viewSession(dir) {
  const s = getSession();
  if (!s) { U.go('#/practise', { replace: true }); return; }
  if (P.secondsLeft(s) === 0) { finish(true); return; }   // the time ran out while the app was closed
  s.pos = Math.min(Math.max(0, s.pos | 0), s.items.length - 1);
  const it = s.items[s.pos], q = it.q, exam = s.mode === 'exam', n = s.items.length;
  const answered = s.items.filter(i => i.picked != null).length;
  const done = !exam && it.picked != null;
  const left = P.secondsLeft(s);
  const timer = left == null ? '' : s.timerHidden
    ? `<button type="button" class="timer hidden-timer" id="timer">Show timer</button>`
    : `<button type="button" class="timer${left < 300 ? ' warn' : ''}" id="timer" aria-label="Time left ${P.clock(left)}. Tap to hide">${P.clock(left)}</button>`;
  const flagBtn = `<button type="button" class="iconbtn" id="flag" aria-pressed="${it.flagged}" aria-label="Flag this question">${it.flagged ? icon.flagOn() : icon.flag()}</button>`;
  const last = s.pos === n - 1;
  const foot = exam
    ? `<div class="bottombar"><button type="button" class="btn btn-secondary" id="prev" aria-disabled="${s.pos === 0}">‹ Back</button><button type="button" class="btn btn-secondary" id="flag2" aria-pressed="${it.flagged}">${it.flagged ? 'Flagged' : 'Flag'}</button><button type="button" class="btn btn-primary" id="next">${last ? 'Finish' : 'Next ›'}</button></div>`
    : done ? `<div class="bottombar"><button type="button" class="btn btn-secondary" id="why">Explanation</button><button type="button" class="btn btn-primary" id="next">${last ? 'See results' : 'Next ›'}</button></div>` : '';
  const sessionTitle = `Question ${s.pos + 1} of ${n}`;
  U.transition(vt(dir), () => {
    frame({
      title: sessionTitle, focus: true, keepScroll: dir === 'none-keep',
      start: `<button type="button" class="iconbtn" id="leave" aria-label="Leave this session">${icon.close()}</button>`,
      mid: `<button type="button" class="pill" id="navpill" aria-label="${sessionTitle}. Open the question list">Q ${s.pos + 1}/${n}</button>`,
      end: timer + (exam ? '' : flagBtn),
      extra: `<div class="progress" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${answered}"><span style="width:${Math.round(answered / n * 100)}%"></span></div>`,
      body: `<h1 class="sr-only">${sessionTitle} · ${esc(s.label)}</h1>${questionHtml(q, exam ? 'exam' : done ? 'feedback' : 'pick', it.picked)}`,
      foot,
    });
    if (done) $('#after').innerHTML = explainHtml(q) + `<p style="margin-top:8px"><button type="button" class="btn-text" id="suggest">Suggest a change</button></p>`;
    wireSession(s);
  });
  // preload the next question's picture
  const nx = s.items[s.pos + 1]; if (nx?.q.image) { const im = new Image(); im.src = nx.q.image; }
}
function wireSession(s) {
  const it = s.items[s.pos], exam = s.mode === 'exam';
  const move = d => { const cur = getSession(); if (!cur) return; cur.pos = Math.min(cur.items.length - 1, Math.max(0, cur.pos + d)); saveSession(cur); viewSession(d > 0 ? 'push' : 'pop'); };
  $$('.choice[data-i]').forEach(b => b.addEventListener('click', () => {
    const cur = getSession(); if (!cur) return;
    const ci = cur.items[cur.pos], i = Number(b.dataset.i);
    if (exam) { ci.picked = i; ci.at = Date.now(); saveSession(cur); viewSession('none-keep'); return; }
    if (ci.picked != null) return;
    ci.picked = i; ci.at = Date.now(); saveSession(cur);
    const right = i === ci.q.answer;
    db.set('progress', P.record(progress(), ci.q.id, right)); db.set('days', P.addDay(db.get('days', [])));
    U.haptic();
    viewSession('none-keep');
    feedbackSheet(cur);
  }));
  const toggleFlag = () => { const cur = getSession(); const ci = cur.items[cur.pos]; ci.flagged = !ci.flagged; saveSession(cur); setFlag(ci.q.id, ci.flagged); viewSession('none-keep'); U.announce(ci.flagged ? 'Flagged' : 'Flag removed'); };
  $('#flag')?.addEventListener('click', toggleFlag);
  $('#flag2')?.addEventListener('click', toggleFlag);
  $('#prev')?.addEventListener('click', () => { if (s.pos > 0) move(-1); });
  $('#next')?.addEventListener('click', () => { if (s.pos < s.items.length - 1) move(1); else if (exam) checkSheet(); else finish(); });
  $('#why')?.addEventListener('click', () => feedbackSheet(getSession()));
  $('#suggest')?.addEventListener('click', () => suggestSheet(live(it.q.id) || it.q));
  $('#leave').addEventListener('click', leaveSheet);
  $('#navpill').addEventListener('click', navigatorSheet);
  $('#timer')?.addEventListener('click', () => { const cur = getSession(); cur.timerHidden = !cur.timerHidden; saveSession(cur); viewSession('none-keep'); });
  wireZoom();
  if (P.secondsLeft(s) != null) {
    clearInterval(timerId);
    timerId = setInterval(() => {
      const cur = getSession(); if (!cur || !location.hash.startsWith('#/session')) { clearInterval(timerId); return; }
      const left = P.secondsLeft(cur), t = $('#timer');
      if (left <= 0) { clearInterval(timerId); finish(true); return; }
      if (left < 300 && !cur.warned) { cur.warned = true; saveSession(cur); U.announce('Less than 5 minutes left.'); }
      if (t && !cur.timerHidden) { t.textContent = P.clock(left); t.classList.toggle('warn', left < 300); t.setAttribute('aria-label', `Time left ${P.clock(left)}. Tap to hide`); }
    }, 1000);
    S.cleanup.push(() => clearInterval(timerId));
  }
}
function feedbackSheet(s) {
  const it = s.items[s.pos], q = it.q, right = it.picked === q.answer, last = s.pos === s.items.length - 1;
  const title = right ? 'Correct' : `Incorrect, answer ${P.letter(q.answer)}`;
  const sh = U.openSheet({ title, size: 'medium', cls: 'feedback',
    titleHtml: `<span class="verdict ${right ? 'ok' : 'bad'}">${right ? icon.check(22) : icon.cross(22)}<span>${esc(title)}</span></span>`,
    body: `<p class="small">${right ? '' : `You chose ${P.letter(it.picked)}. `}The answer is <b>${P.letter(q.answer)}</b>: ${esc(q.options[q.answer])}</p>${explainHtml(q)}
      <p style="margin-top:8px"><button type="button" class="btn-text" id="fsuggest">Suggest a change</button></p>`,
    foot: `<button type="button" class="btn btn-primary" id="fnext">${last ? 'See results' : 'Next question'}</button>`,
    onClose: () => $('#next')?.focus({ preventScroll: true }) });
  U.announce(title);
  let going = false;
  sh.el.querySelector('#fnext').addEventListener('click', async () => {
    if (going) return;   // a double tap moves one question, not two
    going = true;
    await sh.close();
    const cur = getSession(); if (!cur) return;
    if (cur.pos < cur.items.length - 1) { cur.pos++; saveSession(cur); viewSession('push'); } else finish();
  });
  sh.el.querySelector('#fsuggest').addEventListener('click', () => suggestSheet(live(q.id) || q));
}
function leaveSheet() {
  const sh = U.openSheet({ title: 'Leave?', body: '<p>Your answers are kept. You can carry on from Practise.</p>',
    foot: '<div class="btn-row"><button type="button" class="btn btn-secondary" id="stay">Keep going</button><button type="button" class="btn btn-primary" id="goaway">Leave</button></div>' });
  sh.el.querySelector('#stay').addEventListener('click', () => sh.close());
  sh.el.querySelector('#goaway').addEventListener('click', () => U.go('#/practise'));
}
function navigatorSheet() {
  const s = getSession(); if (!s) return;
  const dots = s.items.map((it, i) => {
    const st = [it.picked != null ? 'answered' : 'unanswered', it.flagged ? 'flagged' : '', i === s.pos ? 'current' : ''].filter(Boolean);
    return `<button type="button" class="dot ${st.join(' ')}" data-n="${i}" aria-label="Question ${i + 1}, ${st.join(', ')}"${i === s.pos ? ' aria-current="step"' : ''}>${i + 1}</button>`;
  }).join('');
  const sh = U.openSheet({ title: 'Questions', size: 'medium',
    body: `<div class="navgrid">${dots}</div><div class="legend" aria-hidden="true"><span><i></i>Not answered</span><span><i class="answered"></i>Answered</span><span><i class="flagged"></i>Flagged</span><span><i class="current"></i>This one</span></div>` });
  sh.el.querySelectorAll('.dot').forEach(d => d.addEventListener('click', async () => {
    await sh.close(); const cur = getSession(); const n = Number(d.dataset.n), was = cur.pos; cur.pos = n; saveSession(cur); viewSession(n > was ? 'push' : n < was ? 'pop' : 'none-keep');
  }));
}
function checkSheet() {
  const s = getSession(), sc = P.score(s);
  const firstUn = s.items.findIndex(i => i.picked == null), firstFl = s.items.findIndex(i => i.flagged);
  const line = sc.unanswered || sc.flagged ? [sc.unanswered ? `${sc.unanswered} unanswered` : '', sc.flagged ? `${sc.flagged} flagged` : ''].filter(Boolean).join(', ') : 'Every question answered.';
  const sh = U.openSheet({ title: 'Submit your answers?',
    body: `<p class="score-line">${line}</p>
      <div class="stack">${firstUn >= 0 ? `<button type="button" class="btn btn-secondary" data-goto="${firstUn}">Go to unanswered (${sc.unanswered})</button>` : ''}${firstFl >= 0 ? `<button type="button" class="btn btn-secondary" data-goto="${firstFl}">Go to flagged (${sc.flagged})</button>` : ''}</div>`,
    foot: '<button type="button" class="btn btn-primary" id="submit">Submit</button>' });
  sh.el.querySelectorAll('[data-goto]').forEach(b => b.addEventListener('click', async () => { await sh.close(); const cur = getSession(); cur.pos = Number(b.dataset.goto); saveSession(cur); viewSession('pop'); }));
  sh.el.querySelector('#submit').addEventListener('click', () => finish());
}
function finish(timeUp = false) {
  const s = getSession(); if (!s) return;
  s.finishedAt = Date.now(); if (timeUp) s.timeUp = true;
  if (s.mode === 'exam') {
    let pr = progress();
    for (const it of s.items) if (it.picked != null) pr = P.record(pr, it.q.id, it.picked === it.q.answer, s.finishedAt);
    db.set('progress', pr); db.set('days', P.addDay(db.get('days', [])));
  }
  db.set('history', [s, ...pastSessions()].slice(0, P.HISTORY_MAX));
  db.del('session');
  clearInterval(timerId);
  if (timeUp) U.toast('Time is up. Your answers were submitted.');
  U.go(`#/summary/${s.id}`, { replace: true });
}

// ---------- summary and review ----------
const findDone = id => pastSessions().find(h => h.id === id);
function ring(pct, animate) {
  const r = 52, full = +(2 * Math.PI * r).toFixed(1), off = +(full * (1 - pct / 100)).toFixed(1);
  return `<div class="ring${animate ? ' animate' : ''}" style="--full:${full}" role="img" aria-label="${pct} percent"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="${r}"/><circle class="fill" cx="60" cy="60" r="${r}" stroke-dasharray="${full}" stroke-dashoffset="${off}"/></svg><b aria-hidden="true">${pct}%</b></div>`;
}
function viewSummary(id, params, dir) {
  const s = findDone(id);
  const fromProgress = params.get('from') === 'progress';
  const back = fromProgress ? { label: 'Progress', to: '#/progress' } : null;
  if (!s) { frame({ title: 'Results', back: back || { label: 'Practise', to: '#/practise' }, focus: true, body: '<div class="empty"><p>This session is no longer on this phone.</p></div>' }); return; }
  const sc = P.score(s), first = !s.ringShown;
  if (first) { db.set('history', pastSessions().map(h => h.id === id ? { ...h, ringShown: true } : h)); }
  const filter = S.summaryFilter?.id === id ? S.summaryFilter.f : 'all';
  const rows = s.items.map((it, n) => ({ it, n, st: P.itemState(it) })).filter(({ it, st }) => filter === 'all' || (filter === 'wrong' ? st === 'wrong' : filter === 'flagged' ? it.flagged : st === 'unanswered'));
  const mark = st => st === 'right' ? `<span class="mark mark-ok">${icon.check(20)}<span class="sr-only">Right: </span></span>` : st === 'wrong' ? `<span class="mark mark-bad">${icon.cross(20)}<span class="sr-only">Wrong: </span></span>` : `<span class="mark mark-none">${icon.dash(20)}<span class="sr-only">Not answered: </span></span>`;
  const retry = s.items.filter(i => P.itemState(i) !== 'right' || i.flagged);
  const passLine = s.paper ? `<p><span class="badge ${sc.pass ? 'pass' : 'fail'}">${sc.pass ? 'Pass' : 'Not yet'}</span> <span class="small muted">Pass mark ${s.paper.passMark}%</span></p>` : '';
  const body = `<div class="score-head">${ring(sc.pct, first && !U.reduced())}<p class="score-line" style="margin:0">${sc.right} of ${sc.total}</p>
      <p class="small muted" style="margin:0">${esc(s.label)}${(m => m === s.label ? '' : ' · ' + m)(s.mode === 'exam' ? 'Exam' : 'Practice')} · ${P.duration(s.finishedAt - s.startedAt)}${s.timeUp ? ' · time ran out' : ''}</p>${passLine}</div>
    <div class="group"><span class="kicker">By topic</span><ul class="rows">${P.sessionTopics(s).map(t => `<li><div class="row"><span class="row-main"><span class="row-title">${esc(t.topic)}</span></span><span class="row-trail">${t.right}/${t.total}${minibar(t.right / t.total)}</span></div></li>`).join('')}</ul></div>
    <span class="kicker section-head">Questions</span>
    <div class="pad">${U.chips('sfilter', [{ value: 'all', label: 'All' }, { value: 'wrong', label: `Wrong (${sc.wrong})` }, { value: 'flagged', label: `Flagged (${sc.flagged})` }, { value: 'unanswered', label: `Unanswered (${sc.unanswered})` }], [filter], 'Show')}</div>
    <ul class="rows" style="margin-top:8px">${rows.map(({ it, n, st }) => `<li><a class="row" href="#/review/${s.id}/${n}"><span class="row-main" style="display:flex;gap:10px;align-items:flex-start">${mark(st)}<span class="row-title clamp2">${esc(it.q.stem)}</span></span><span class="chev" aria-hidden="true">›</span></a></li>`).join('') || '<li class="empty">None.</li>'}</ul>`;
  const foot = `<div class="bottombar" style="flex-direction:column;align-items:stretch">${retry.length ? `<button type="button" class="btn btn-primary" id="retry">Retry wrong and flagged (${retry.length})</button>` : ''}<button type="button" class="btn ${retry.length ? 'btn-secondary' : 'btn-primary'}" id="done">Done</button></div>`;
  U.transition(vt(dir === 'replace' ? 'fade' : dir), () => {
    frame({ title: 'Results', back, focus: true, body, foot, keepScroll: dir === 'none-keep' });
    U.wireChips(main(), 'sfilter', v => { S.summaryFilter = { id, f: v[0] || 'all' }; viewSummary(id, params, 'none-keep'); }, { single: true });
    $('#retry')?.addEventListener('click', () => begin({ kind: 'retry', label: 'Retry', questions: retry.map(i => live(i.q.id) || { ...i.q }) }));
    $('#done').addEventListener('click', () => fromProgress ? U.back('#/progress') : U.go('#/practise', { replace: true }));
  });
}
function viewReview(id, n, dir) {
  const s = findDone(id); n = Number(n);
  if (!s || !s.items[n]) { U.go(`#/summary/${id}`, { replace: true }); return; }
  const it = s.items[n], total = s.items.length;
  const st = P.itemState(it);
  const verdict = st === 'right' ? `<p class="verdict ok">${icon.check(20)}<span>Correct</span></p>` : st === 'wrong' ? `<p class="verdict bad">${icon.cross(20)}<span>Incorrect, answer ${P.letter(it.q.answer)}</span></p>` : `<p class="verdict">${icon.dash(20)}<span>Not answered. The answer is ${P.letter(it.q.answer)}</span></p>`;
  const go = d => { const m = n + d; if (m < 0 || m >= total) return; S.nextDir = d > 0 ? 'push' : 'pop'; U.go(`#/review/${id}/${m}`, { replace: true }); };
  frame({ title: `${n + 1} of ${total}`, back: { label: 'Results', to: `#/summary/${id}` }, focus: true,
    end: it.flagged ? '<span class="badge flag">Flagged</span>' : '',
    body: `<div class="q-wrap" style="padding-bottom:0">${verdict}</div>${questionHtml(it.q, 'feedback', it.picked)}`,
    foot: `<div class="bottombar"><button type="button" class="btn btn-secondary" id="rprev" aria-disabled="${n === 0}">‹ Previous</button><button type="button" class="btn btn-secondary" id="rnext" aria-disabled="${n === total - 1}">Next ›</button></div>` });
  $('#after').innerHTML = explainHtml(it.q) + `<p style="margin-top:8px"><button type="button" class="btn-text" id="suggest">Suggest a change</button></p>`;
  $('#suggest').addEventListener('click', () => suggestSheet(live(it.q.id) || it.q));
  $('#rprev').addEventListener('click', () => go(-1));
  $('#rnext').addEventListener('click', () => go(1));
  wireZoom();
  // swipe sideways to page
  const m = main(); let x0 = null, y0 = 0;
  const down = e => { x0 = e.clientX; y0 = e.clientY; };
  const up = e => { if (x0 == null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1); };
  m.addEventListener('pointerdown', down); m.addEventListener('pointerup', up);
  S.cleanup.push(() => { m.removeEventListener('pointerdown', down); m.removeEventListener('pointerup', up); });
}

// ---------- Browse ----------
function viewBrowse() {
  const tops = P.topicsOf(S.pool);
  if (S.browse.topic && !tops.some(t => t.topic === S.browse.topic)) S.browse.topic = '';
  frame({ title: 'Browse', large: true, tab: 'browse',
    body: `<div class="search">${icon.search()}<input type="search" class="input" id="find" placeholder="Search questions" aria-label="Search questions, choices and explanations" enterkeyhint="search" autocomplete="off" value="${esc(S.browse.q)}"></div>
      <div class="pad">${U.chips('btopic', [{ value: '', label: 'All topics' }, ...tops.map(t => ({ value: t.topic, label: t.topic }))], [S.browse.topic], 'Topic')}</div>
      <div id="blist"></div>` });
  const paint = () => {
    const { q, topic } = S.browse, pr = progress();
    if (!q.trim() && !topic) {
      $('#blist').innerHTML = `<span class="kicker section-head">Topics</span><ul class="rows">${tops.map(t => { const m = P.topicMastery(S.pool, pr, t.topic); return navRow({ href: `#/browse/t/${encodeURIComponent(t.topic)}`, title: esc(t.topic), sub: plural(t.count, 'question'), trail: minibar(m.share) + `<span class="sr-only">${m.right} of ${m.total} right last time</span>` }); }).join('')}</ul>`;
      return;
    }
    const hits = S.pool.filter(x => (!topic || P.inTopic(x, topic)) && B.matchesQuery(x, q));
    $('#blist').innerHTML = `<p class="live-line pad" role="status" style="margin:8px 0">${plural(hits.length, 'question')}</p>${hits.length ? `<ul class="rows">${hits.map(x => qRow(x)).join('')}</ul>` : `<div class="empty"><p>No questions match${q.trim() ? ` “${esc(q.trim())}”` : ''}.</p></div>`}`;
  };
  let t = 0;
  $('#find').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { S.browse.q = e.target.value; paint(); }, 150); });
  $('#find').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
  U.wireChips(main(), 'btopic', v => { S.browse.topic = v[0] || ''; paint(); }, { single: true });
  paint();
}
function viewBrowseTopic(topic) {
  topic = decode(topic);
  const qs = S.pool.filter(q => P.inTopic(q, topic));
  frame({ title: topic, back: { label: 'Browse', to: '#/browse' }, tab: 'browse',
    body: qs.length ? `<div class="pad" style="padding-top:12px;padding-bottom:16px"><button type="button" class="btn btn-primary" id="pt">Practise this topic</button></div><ul class="rows">${qs.map(q => qRow(q)).join('')}</ul>`
      : '<div class="empty"><p>No questions in this topic yet.</p></div>' });
  $('#pt')?.addEventListener('click', () => practiseTopic(topic));
}
function viewQuestion(id, params) {
  const q = live(id);
  const back = { label: 'Back', to: '#/browse' };
  if (!q) { frame({ title: 'Question', back, tab: 'browse', body: '<div class="empty"><p>This question is no longer in the bank.</p></div>' }); return; }
  const shown = S.reveal === id;
  const st = P.statusOf(progress(), id), fl = isFlagged(id);
  const kicker = (st === 'missed' ? '<span class="badge missed">Missed</span>' : '') + (fl ? '<span class="badge flag">Flagged</span>' : '');
  frame({ title: 'Question', back, tab: 'browse', keepScroll: params.get('keep') === '1',
    body: `<h2 class="sr-only">${esc(topicLine(q))}</h2>${questionHtml(q, shown ? 'reveal' : 'hidden', null, { kicker })}
      <div class="group"><ul class="rows">
        ${navRow({ id: 'qpt', title: 'Practise this topic', sub: esc((q.topics[0] || 'General')) })}
        <li><button type="button" class="row" id="qflag" aria-pressed="${fl}"><span class="row-main"><span class="row-title">${fl ? 'Flagged' : 'Flag this question'}</span><span class="row-sub">${fl ? 'Tap to remove the flag' : 'Find it later under Flagged'}</span></span><span class="row-trail">${fl ? icon.flagOn() : icon.flag()}</span></button></li>
        ${navRow({ id: 'qsuggest', title: 'Suggest a change', sub: 'Send a correction or comment to the owner' })}
      </ul></div>` });
  $('#after').innerHTML = shown
    ? explainHtml(q) + `<div class="meta-lines">${q.source ? `<p>Source: ${esc(q.source)}</p>` : ''}${q.updated ? `<p>Updated ${esc(fmtDate(q.updated))}</p>` : ''}</div>`
    : `<div style="margin-top:16px"><button type="button" class="btn btn-secondary" id="show">Show answer</button></div>`;
  $('#show')?.addEventListener('click', () => { S.reveal = id; viewQuestion(id, new URLSearchParams('keep=1')); $('#stem')?.scrollIntoView({ block: 'nearest' }); U.announce(`The answer is ${P.letter(q.answer)}`); });
  $('#qpt').addEventListener('click', () => practiseTopic(q.topics[0] || 'General'));
  $('#qflag').addEventListener('click', () => { setFlag(id, !fl); viewQuestion(id, new URLSearchParams('keep=1')); U.toast(fl ? 'Flag removed.' : 'Flagged.'); $('#qflag')?.focus(); });
  $('#qsuggest').addEventListener('click', () => suggestSheet(q));
  wireZoom();
  if (params.has('suggest')) { history.replaceState(history.state, '', `#/q/${id}`); suggestSheet(q); }
}

// ---------- Papers ----------
const paperFacts = ({ resolved: r }) => { const n = Math.min(r.settings.count, r.pool.length); return `${plural(n, 'question')} · ${r.settings.minutes} min`; };
function viewPapers() {
  frame({ title: 'Papers', large: true, tab: 'papers',
    body: `<p class="lead">Timed papers, drawn the way the real test is. Practice only: try as often as you like.</p>
      ${S.papers.length ? `<ul class="rows">${S.papers.map(p => navRow({ href: `#/paper/${encodeURIComponent(p.paper.id)}`, title: esc(p.paper.title || p.paper.id), sub: `<span class="clamp2">${esc(p.paper.about || '')}</span>${paperFacts(p)}` })).join('')}</ul>` : '<div class="empty"><p>No papers yet.</p></div>'}` });
}
function viewPaper(id) {
  const p = S.papers.find(x => x.paper.id === decode(id));
  const back = { label: 'Papers', to: '#/papers' };
  if (!p) { frame({ title: 'Paper', back, tab: 'papers', body: '<div class="empty"><p>This paper is no longer here.</p></div>' }); return; }
  const r = p.resolved, n = Math.min(r.settings.count, r.pool.length);
  const past = pastSessions().filter(h => h.paper?.id === p.paper.id);
  frame({ title: p.paper.title || p.paper.id, back, tab: 'papers',
    body: `<div class="q-wrap"><p>${esc(p.paper.about || '')}</p></div>
      <div class="stats"><div class="stat"><b>${n}</b><span>questions</span></div><div class="stat"><b>${r.settings.minutes}</b><span>minutes</span></div><div class="stat"><b>${r.settings.passMark}%</b><span>to pass</span></div></div>
      ${n < r.settings.count ? `<p class="pad small muted">${n} of the paper's ${r.settings.count} questions are ready so far, so this sitting is shorter.</p>` : ''}
      <div class="pad" style="margin-bottom:16px">${n ? '<button type="button" class="btn btn-primary" id="pstart">Start paper</button>' : '<p class="muted">No questions in this paper are ready yet.</p>'}</div>
      ${past.length ? `<span class="kicker section-head">Your attempts</span><ul class="rows">${past.map(h => { const sc = P.score(h); return navRow({ href: `#/summary/${h.id}?from=progress`, title: `${sc.right} of ${sc.total} · ${sc.pass ? 'Pass' : 'Not yet'}`, sub: esc(fmtWhen(h.finishedAt)) }); }).join('')}</ul>` : ''}` });
  $('#pstart')?.addEventListener('click', () => {
    const s = P.paperSession(p.paper, r);
    const old = getSession(); saveSession(s);
    if (old) U.toast('Started the paper. The last session was closed.', { action: 'Undo', onAction: () => { saveSession(old); render(U.routeOf(), 'none'); } });
    U.go('#/session');
  });
}

// ---------- Progress ----------
function viewProgress() {
  const pr = progress(), t = P.totals(S.pool, pr), wk = P.week(db.get('days', []));
  const hist = pastSessions();
  const ms = P.topicsOf(S.pool).map(x => P.topicMastery(S.pool, pr, x.topic));
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  frame({ title: 'Progress', large: true, tab: 'progress',
    body: `<span class="kicker section-head" style="padding-top:0">This week</span>
      <div class="week" role="list" aria-label="Days practised this week">${wk.map(d => `<span class="day${d.on ? ' on' : ''}${d.today ? ' today' : ''}" role="listitem"><i aria-hidden="true">${d.on ? icon.check(14) : ''}</i>${d.name}<span class="sr-only">${d.on ? ', practised' : ', not practised'}${d.today ? ', today' : ''}</span></span>`).join('')}</div>
      <div class="stats"><div class="stat"><b>${t.answered}</b><span>answered</span></div><div class="stat"><b>${t.answered ? t.pct + '%' : '–'}</b><span>correct</span></div><div class="stat"><b>${t.seen}/${S.pool.length}</b><span>seen</span></div></div>
      <div class="group"><span class="kicker">Topics</span><ul class="rows">${ms.map(m => `<li><a class="row" href="#/browse/t/${encodeURIComponent(m.topic)}"><span class="row-main"><span class="row-title">${esc(m.topic)}</span><span class="row-sub">${m.label}</span></span><span class="steps3" aria-hidden="true">${[0, 1, 2].map(i => `<span class="${i < [0, 2, 3][m.level] ? 'on' : ''}"></span>`).join('')}</span><span class="chev" aria-hidden="true">›</span></a></li>`).join('')}</ul>
      <p class="pad small muted" style="margin:8px 0 12px">Mastered: at least 3 answers in the topic and the last 3 right.</p></div>
      <div class="group"><span class="kicker">History</span><ul class="rows">${hist.length ? hist.map(h => { const sc = P.score(h); return navRow({ href: `#/summary/${h.id}?from=progress`, title: `${esc(h.label)} · ${sc.right} of ${sc.total}`, sub: `${h.mode === 'exam' ? 'Exam' : 'Practice'} · ${esc(fmtWhen(h.finishedAt))}` }); }).join('') : '<li><div class="row"><span class="row-main"><span class="row-sub">No sessions yet.</span></span></div></li>'}</ul></div>
      <div class="group"><span class="kicker">Settings</span><ul class="rows">
        ${navRow({ id: 'reset', title: 'Reset progress on this phone', danger: true })}
        ${!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent) ? '<li><div class="row"><span class="row-main"><span class="row-sub">To keep this on your phone: tap Share, then Add to Home Screen.</span></span></div></li>' : ''}
        ${!standalone && installEvent ? navRow({ id: 'install', title: 'Install this app on your phone' }) : ''}
      </ul>${U.versionBlock()}</div>` });
  $('#reset').addEventListener('click', resetSheet);
  $('#install')?.addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; viewProgress(); });
  U.wireVersion('qbank-');
}
function resetSheet() {
  const sh = U.openSheet({ title: 'Reset progress?', body: '<p>This clears your answers, flags, history and any open session on this phone. The questions are not affected.</p>',
    foot: '<div class="btn-row"><button type="button" class="btn btn-secondary" id="rcancel">Cancel</button><button type="button" class="btn btn-primary" id="rdo">Reset</button></div>' });
  sh.el.querySelector('#rcancel').addEventListener('click', () => sh.close());
  let done = false;
  sh.el.querySelector('#rdo').addEventListener('click', async () => {
    if (done) return;   // a second tap would save the already-empty state as the Undo copy
    done = true;
    const keep = ['progress', 'flags', 'history', 'days', 'session'], saved = Object.fromEntries(keep.map(k => [k, db.get(k, null)]));
    keep.forEach(k => db.del(k));
    await sh.close(); viewProgress();
    U.toast('Progress reset.', { action: 'Undo', onAction: () => { for (const k of keep) if (saved[k] != null) db.set(k, saved[k]); viewProgress(); } });
  });
}

// ---------- Suggest a change ----------
function suggestSheet(q) {
  const key = 'draft.' + q.id;
  const d = { mode: 'comment', comment: '', stem: q.stem, options: q.options.slice(), answer: q.answer, explain: q.explain || '', ...db.get(key, {}) };
  let name = db.get('name', '');
  const optRows = () => d.options.map((o, i) => `<div class="option-row"><span class="letter" aria-hidden="true">${P.letter(i)}</span><textarea class="input" rows="1" data-opt="${i}" aria-label="Choice ${P.letter(i)}">${esc(o)}</textarea></div>`).join('');
  const sh = U.openSheet({ title: 'Suggest a change', size: 'large', focus: '.sheet-head h2',
    body: `<p class="small muted">The owner checks every suggestion before the question changes.</p>
      <div class="field">${U.seg('smode', [{ value: 'comment', label: 'Comment' }, { value: 'edit', label: 'Edit' }], d.mode, 'What kind of change')}</div>
      <div id="edit-fields"${d.mode === 'edit' ? '' : ' hidden'}>
        <div class="field"><label for="s-stem">Question</label><textarea class="input" id="s-stem" rows="2">${esc(d.stem)}</textarea></div>
        <div class="field"><span class="label">Choices</span><div class="stack" id="s-opts">${optRows()}</div></div>
        <div class="field"><span class="label">Correct answer</span><div id="s-ans">${U.seg('sanswer', d.options.map((_, i) => ({ value: String(i), label: P.letter(i) })), String(d.answer), 'Correct answer')}</div></div>
        <div class="field"><label for="s-explain">Explanation</label><textarea class="input" id="s-explain" rows="2">${esc(d.explain)}</textarea></div>
      </div>
      <div class="field"><label for="s-comment">Comment</label><textarea class="input" id="s-comment" rows="2" placeholder="What should change, and why (a reference helps)">${esc(d.comment)}</textarea></div>
      <div class="field"><label for="s-name">Your name</label><input class="input" id="s-name" autocomplete="name" value="${esc(name)}"><span class="hint">Kept on this phone for next time.</span></div>`,
    foot: `<button type="button" class="btn btn-primary" id="s-issue">Open GitHub issue</button><div class="btn-row"><button type="button" class="btn btn-secondary" id="s-copy">Copy text</button>${navigator.share ? '<button type="button" class="btn btn-secondary" id="s-share">Share</button>' : ''}</div>` });
  const el = sh.el;
  el.querySelectorAll('textarea').forEach(U.autogrow);
  const save = () => db.set(key, d);
  U.wireSeg(el, 'smode', v => { d.mode = v; el.querySelector('#edit-fields').hidden = v !== 'edit'; if (v === 'edit') el.querySelectorAll('#edit-fields textarea').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }); save(); });
  U.wireSeg(el, 'sanswer', v => { d.answer = Number(v); save(); });
  el.querySelector('#s-stem').addEventListener('input', e => { d.stem = e.target.value; save(); });
  el.querySelector('#s-explain').addEventListener('input', e => { d.explain = e.target.value; save(); });
  el.querySelector('#s-comment').addEventListener('input', e => { d.comment = e.target.value; save(); });
  el.querySelector('#s-name').addEventListener('input', e => { name = e.target.value; db.set('name', name.trim()); });
  el.querySelectorAll('[data-opt]').forEach(t => t.addEventListener('input', () => { d.options[Number(t.dataset.opt)] = t.value; save(); }));
  const change = () => {
    const c = { comment: d.comment };
    if (d.mode === 'edit') {
      const nq = { stem: d.stem, options: d.options, answer: d.answer, explain: d.explain };
      if (nq.stem.trim() !== q.stem || nq.answer !== q.answer || nq.explain.trim() !== (q.explain || '') || nq.options.some((o, i) => o.trim() !== q.options[i])) c.question = nq;
    }
    return c;
  };
  const ready = () => { const c = change(); if (!c.comment.trim() && !c.question) { U.toast(d.mode === 'edit' ? 'Change the question or write a comment first.' : 'Write a comment first.'); el.querySelector('#s-comment').focus(); return null; } return c; };
  const sent = async msg => { db.del(key); await sh.close(); U.toast(msg); };
  el.querySelector('#s-issue').addEventListener('click', () => {
    const c = ready(); if (!c) return;
    window.open(B.suggestionIssueUrl(q, c, name), '_blank', 'noopener');
    sent('Opened in GitHub.');
  });
  el.querySelector('#s-copy').addEventListener('click', async () => {
    const c = ready(); if (!c) return;
    if (await U.copyText(B.suggestionText(q, c, name))) sent('Copied. Send it to the owner.');
    else U.toast("Couldn't copy on this phone. Try Share or the GitHub issue.");
  });
  el.querySelector('#s-share')?.addEventListener('click', async () => {
    const c = ready(); if (!c) return;
    try { await navigator.share({ title: `Question edit: ${q.id}`, text: B.suggestionText(q, c, name) }); sent('Shared. Thank you.'); } catch { /* cancelled */ }
  });
}

// ---------- routing ----------
const ROUTES = [
  [/^\/(practise)?$/, () => viewPractise()],
  [/^\/topics$/, () => viewTopics()],
  [/^\/list\/(missed|flagged)$/, m => viewList(m[1])],
  [/^\/session$/, (m, p, dir) => viewSession(dir)],
  [/^\/summary\/([\w-]+)$/, (m, p, dir) => viewSummary(m[1], p, dir)],
  [/^\/review\/([\w-]+)\/(\d+)$/, (m, p, dir) => viewReview(m[1], m[2], dir)],
  [/^\/browse$/, () => viewBrowse()],
  [/^\/browse\/t\/(.+)$/, m => viewBrowseTopic(m[1])],
  [/^\/q\/([\w-]+)$/, (m, p) => viewQuestion(m[1], p)],
  [/^\/papers$/, () => viewPapers()],
  [/^\/paper\/(.+)$/, m => viewPaper(m[1])],
  [/^\/progress$/, () => viewProgress()],
];
let lastPath = null;
function render({ path, params }, dir) {
  if (!S.loaded) { if (S.error) problemView(); return; }
  if (!path.startsWith('/q/')) S.reveal = null;
  const tabSwitch = TAB_ROOTS[path] && TAB_ROOTS[lastPath] && path !== lastPath;
  lastPath = path;
  let kind = dir === 'none' ? 'none' : tabSwitch ? 'fade' : dir === 'replace' ? 'fade' : dir;
  if (S.nextDir) { kind = S.nextDir; S.nextDir = null; }
  for (const [re, view] of ROUTES) {
    const m = path.match(re);
    if (m) {
      // the session and results screens animate themselves (they also redraw in place)
      if (/^\/(session|summary)/.test(path)) view(m, params, kind);
      else U.transition(kind, () => view(m, params, kind));
      if (dir === 'push') requestAnimationFrame(() => (document.querySelector('main h1') || document.querySelector('#bar h1'))?.focus({ preventScroll: true }));
      return;
    }
  }
  U.go('#/practise', { replace: true });
}
function isSafe() {
  const { path } = U.routeOf();
  if (!TAB_ROOTS[path === '/' ? '/practise' : path]) return false;   // only on a top-level screen
  if (U.sheetOpen() || document.querySelector('dialog[open]')) return false;
  const a = document.activeElement;
  if (a && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'button'))) return false;
  if ($$('main input, main textarea').some(el => el.value !== el.defaultValue)) return false;
  return true;
}

// tabs: a tap switches without adding to the back history; tapping the current tab goes to its top
$$('.tab').forEach(t => {
  t.querySelector('[data-icon]').outerHTML = icon[t.dataset.tab]();
  t.addEventListener('click', e => {
    e.preventDefault();
    const href = t.getAttribute('href');
    if (location.hash === href) { main().scrollTo({ top: 0, behavior: U.reduced() ? 'auto' : 'smooth' }); return; }
    U.go(href, { replace: true });
  });
});
const paintOnline = () => { $('#offline').hidden = navigator.onLine; };
window.addEventListener('online', paintOnline); window.addEventListener('offline', paintOnline);
let installEvent = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvent = e; });

(async function init() {
  paintOnline();
  await load();
  U.startRouter(render);
  U.setupPwa({ isSafe });
  // phones keep the app open for hours: fetch the questions again when it comes back to the front, and redraw only if
  // they changed and nothing is in progress (an open session keeps its own copy anyway)
  let lastFetch = Date.now();
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden || Date.now() - lastFetch < 60000 || !S.loaded) return;
    lastFetch = Date.now();
    const before = JSON.stringify(S.pool) + JSON.stringify(S.papers.map(p => p.paper));
    const keep = { ...S };
    await load();
    if (S.error) { Object.assign(S, keep); return; }
    if (JSON.stringify(S.pool) + JSON.stringify(S.papers.map(p => p.paper)) !== before && isSafe()) render(U.routeOf(), 'none');
  });
})();
