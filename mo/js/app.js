// MO guide: the screens and the router (hash routes, so Back works and every screen has a link).
//   #/                     home              #/learn, #/learn/<module>, #/learn/<module>/<topic>
//   #/drugs, #/drugs/<id>  drug doses        #/tools, #/tools/<id>        calculators
//   #/crisis, #/crisis/<id> crisis cards     #/practice/...               scenarios, flashcards, check yourself
//   #/progress  #/search?q=  #/about
import { md, esc } from './md.js';
import { MODULES, GROUPS } from './content/index.js';
import { DRUGS, DRUG_GROUPS } from './data/drugs.js';
import { CRISES } from './data/crises.js';
import { renderBlocks, wire, collectQuizzes } from './render.js';
import { drugById, drugCard, drugTable, doseLine, labelChip, patientPanel, wirePatient, weightsNow } from './drugs-ui.js';
import { TOOLS, TOOL_GROUPS, mountTool } from './tools.js';
import * as PR from './practice.js';
import { search } from './search.js';
import { progress, isRead, markRead, setLast, resetAll, getChecks, patientExpired } from './store.js';
import { plain } from './md.js';

const $ = s => document.querySelector(s);
const app = $('#app');
const byId = list => Object.assign(Object.create(null), Object.fromEntries(list.map(x => [x.id, x])));
const crisisById = byId(CRISES);
const modById = byId(MODULES);
const hasTool = id => id != null && Object.hasOwn(TOOLS, id);
const NAV = [['learn', 'Learn'], ['drugs', 'Drugs'], ['tools', 'Tools'], ['crisis', 'Crisis'], ['practice', 'Practice']];

const topicKey = (m, t) => `${m}/${t}`;
const allTopics = () => MODULES.flatMap(m => m.topics.map(t => ({ m, t })));
const words = t => Math.max(1, Math.round(plain(JSON.stringify(t.blocks)).split(/\s+/).length / 200));

// ---------------------------------------------------------------- shell
function renderNav(section) {
  $('#nav').innerHTML = NAV.map(([k, t]) => `<a href="#/${k}"${k === section ? ' aria-current="page"' : ''}>${t}</a>`).join('');
}

function moduleProgress(m) {
  const n = m.topics.length, r = m.topics.filter(t => isRead(topicKey(m.id, t.id))).length;
  return { n, r };
}
const bar = (r, n) => `<span class="pbar" role="img" aria-label="${r} of ${n} read"><i style="width:${n ? Math.round((100 * r) / n) : 0}%"></i></span>`;

// ---------------------------------------------------------------- screens
function home() {
  const tops = allTopics(), read = tops.filter(({ m, t }) => isRead(topicKey(m.id, t.id))).length;
  const last = progress().last;
  const first = MODULES[0];
  const next = tops.find(({ m, t }) => !isRead(topicKey(m.id, t.id)));
  return `<section class="hero"><p class="page-kicker">NTF Anaesthesia</p><h1>MO guide</h1>
  <p class="lead">Practical anaesthesia for new medical officers: what to do, what to check and when to call.</p></section>
  ${last && last.route !== '#/' ? `<p class="continue">Carry on: <a href="${esc(last.route)}">${esc(last.title)} →</a></p>` : ''}
  <div class="quick">
    <a class="qcard" href="#/learn/${esc(first.id)}"><strong>Start here</strong><span>Your first weeks, step by step</span></a>
    <a class="qcard" href="#/drugs"><strong>Drug doses</strong><span>Worked out for your patient's weight</span></a>
    <a class="qcard crisis" href="#/crisis"><strong>Crisis cards</strong><span>Anaphylaxis, can't oxygenate, toxicity…</span></a>
    <a class="qcard" href="#/tools"><strong>Calculators</strong><span>Fluids, blood loss, scores, handover</span></a>
  </div>
  <h2>Your progress</h2>
  <p>${read} of ${tops.length} topics read ${bar(read, tops.length)}</p>
  ${next ? `<p>Next up: <a href="#/learn/${esc(next.m.id)}/${esc(next.t.id)}">${esc(next.t.title)}</a> <span class="muted">(${esc(next.m.title)})</span></p>` : '<p>You have read every topic. Keep practising.</p>'}
  <p><a href="#/progress">Checklists and progress →</a> · <a href="#/practice">Practice →</a></p>
  <p id="install" class="muted small" hidden></p>
  <p class="muted small">This guide is written for the NTFGH anaesthesia department. It supports, and never replaces, your consultant: if you are unsure, ask. <a href="#/about">About this guide</a></p>
  ${APPVER}`;
}

function learn() {
  return `<h1>Learn</h1><p class="lead">Short topics in the order you meet them. <span class="badge core">Core</span> is what you need in your first month; <span class="badge beyond">Beyond</span> takes you further.</p>
  ${Object.entries(GROUPS).map(([g, name]) => {
    const ms = MODULES.filter(m => m.group === g); if (!ms.length) return '';
    return `<h2>${esc(name)}</h2><ul class="rows">${ms.map(m => { const p = moduleProgress(m); return `<li><a href="#/learn/${esc(m.id)}"><strong>${esc(m.title)}</strong><span class="muted">${esc(m.summary)}</span><span class="rowmeta">${p.r} of ${p.n} read ${bar(p.r, p.n)}</span></a></li>`; }).join('')}</ul>`;
  }).join('')}`;
}

function moduleScreen(m) {
  return `<p class="crumbs"><a href="#/learn">Learn</a> /</p><h1>${esc(m.title)}</h1><p class="lead">${esc(m.summary)}</p>
  <ol class="rows topics">${m.topics.map(t => { const r = isRead(topicKey(m.id, t.id)); return `<li><a href="#/learn/${esc(m.id)}/${esc(t.id)}"><strong>${esc(t.title)}</strong><span class="muted">${esc(t.summary || '')}</span><span class="rowmeta"><span class="badge ${t.level === 'beyond' ? 'beyond' : 'core'}">${t.level === 'beyond' ? 'Beyond' : 'Core'}</span> ${words(t)} min${r ? ' · <span class="readmark">read</span>' : ''}</span></a></li>`; }).join('')}</ol>`;
}

function topicScreen(m, t) {
  const list = allTopics(), i = list.findIndex(x => x.m === m && x.t === t);
  const prev = list[i - 1], next = list[i + 1];
  const key = topicKey(m.id, t.id), read = isRead(key);
  const hasDoses = JSON.stringify(t.blocks).match(/"t":"drugs?"/);
  return `<p class="crumbs"><a href="#/learn">Learn</a> / <a href="#/learn/${esc(m.id)}">${esc(m.title)}</a> /</p>
  <h1>${esc(t.title)}</h1><p class="meta"><span class="badge ${t.level === 'beyond' ? 'beyond' : 'core'}">${t.level === 'beyond' ? 'Beyond' : 'Core'}</span> ${words(t)} min read</p>
  ${hasDoses ? patientPanel() : ''}
  <div class="topic">${renderBlocks(t.blocks, { module: m.id, topic: t.id })}</div>
  <div class="row"><button type="button" class="btn ${read ? '' : 'primary'}" id="markread" aria-pressed="${read}">${read ? 'Read ✓ (tap to undo)' : 'Mark as read'}</button></div>
  <nav class="pager" aria-label="Topics">${prev ? `<a href="#/learn/${esc(prev.m.id)}/${esc(prev.t.id)}" rel="prev"><span class="muted small">← Previous</span>${esc(prev.t.title)}</a>` : '<span></span>'}${next ? `<a href="#/learn/${esc(next.m.id)}/${esc(next.t.id)}" rel="next"><span class="muted small">Next →</span>${esc(next.t.title)}</a>` : ''}</nav>`;
}

function drugsScreen(q = '') {
  const w = weightsNow();
  const ql = q.toLowerCase();
  const match = d => !ql || [d.name, ...(d.aka || []), d.cls, DRUG_GROUPS[d.group]?.name].join(' ').toLowerCase().includes(ql);
  return `<h1>Drug doses</h1><p class="lead">The department's doses and dilutions for adults. Set the weight and every dose is worked out.</p>
  ${patientPanel()}
  <label for="drug-q" class="visually-hidden">Find a drug</label><input id="drug-q" type="search" placeholder="Find a drug" value="${esc(q)}" autocomplete="off">
  <p id="drug-count" class="visually-hidden" role="status"></p>
  <div id="drug-list">${Object.entries(DRUG_GROUPS).map(([g, info]) => {
    const ds = DRUGS.filter(d => d.group === g && match(d)); if (!ds.length) return '';
    return `<h2>${esc(info.name)}</h2><ul class="dtable">${ds.map(d => `<li>${labelChip(d)}<div><a href="#/drugs/${esc(d.id)}"><strong>${esc(d.name)}</strong></a><ul class="doses">${(d.doses || []).slice(0, 2).map(x => doseLine(d, x, w)).join('')}</ul></div></li>`).join('')}</ul>`;
  }).join('') || '<p class="muted">No drug matches.</p>'}</div>
  <p class="muted small">Coloured squares are the syringe label colours. Doses are a starting point: your consultant decides, and the dose for the frail, elderly or shocked is often less.</p>`;
}

function drugScreen(d) {
  return `<p class="crumbs"><a href="#/drugs">Drugs</a> /</p>${drugCard(d, { full: true, level: 1, panel: patientPanel() })}`;
}

function toolsScreen() {
  return `<h1>Calculators</h1><p class="lead">Worked out as you type. Check anything that looks odd: a calculator is only as good as the numbers you give it.</p>
  ${Object.entries(TOOL_GROUPS).map(([g, name]) => `<h2>${esc(name)}</h2><ul class="rows">${Object.entries(TOOLS).filter(([, t]) => t.group === g).map(([id, t]) => `<li><a href="#/tools/${esc(id)}"><strong>${esc(t.title)}</strong><span class="muted">${esc(t.summary)}</span></a></li>`).join('')}</ul>`).join('')}`;
}

function toolScreen(id) {
  const t = TOOLS[id];
  return `<p class="crumbs"><a href="#/tools">Calculators</a> /</p><h1>${esc(t.title)}</h1><p class="lead">${esc(t.summary)}</p><div class="embed tool-embed" data-tool="${esc(id)}"></div>`;
}

function crisisList() {
  return `<h1>Crisis cards</h1><p class="lead">For when it goes wrong. First, always: <strong>call for help</strong> and say the problem out loud.</p>
  <ul class="rows crisis-rows">${CRISES.map(c => `<li><a href="#/crisis/${esc(c.id)}"><strong>${esc(c.title)}</strong><span class="muted">${esc(c.summary || '')}</span></a></li>`).join('')}</ul>`;
}

function crisisScreen(c) {
  const w = weightsNow();
  const doseItem = x => {
    const d = x.drug && drugById[x.drug];
    return `<li><span class="dl-label">${d ? `<a href="#/drugs/${esc(d.id)}">${md(x.label)}</a>` : md(x.label)}</span><span class="dl-dose">${md(x.text)}</span></li>`;
  };
  return `<div class="crisis-card"><p class="crumbs"><a href="#/crisis">Crisis cards</a> /</p><h1>${esc(c.title)}</h1>
  <p class="callfirst" role="note"><strong>Call for help.</strong> Say the problem out loud. Note the time.</p>
  ${c.recognise?.length ? `<h2>Recognise</h2><ul class="list">${c.recognise.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${(c.steps || []).map(s => `<h2>${md(s.title)}</h2><ol class="steps big">${(s.items || []).map(x => `<li>${md(x)}</li>`).join('')}</ol>`).join('')}
  ${c.doses?.length ? `<h2>Doses</h2>${w.tbw != null ? `<p class="muted small">Your patient: ${w.tbw} kg. Tap a drug for its worked-out dose.</p>` : ''}<ul class="doses crisis-doses">${c.doses.map(doseItem).join('')}</ul>` : ''}
  ${c.pitfalls?.length ? `<h2>Watch out</h2><ul class="list">${c.pitfalls.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${c.after?.length ? `<h2>Afterwards</h2><ul class="list">${c.after.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${c.related?.length ? `<p class="related">See also: ${c.related.filter(r => crisisById[r]).map(r => `<a href="#/crisis/${esc(r)}">${esc(crisisById[r].title)}</a>`).join(' · ')}</p>` : ''}</div>`;
}

function progressScreen() {
  const tops = allTopics(), read = tops.filter(({ m, t }) => isRead(topicKey(m.id, t.id))).length;
  const checks = [];
  for (const m of MODULES) for (const t of m.topics) {
    const walk = bs => (bs || []).forEach(b => { if (b.t === 'check') checks.push({ m, t, b }); if (b.blocks) walk(b.blocks); });
    walk(t.blocks);
  }
  const q = Object.values(progress().quiz), qok = q.filter(x => x.ok).length;
  const sc = Object.keys(progress().scen).length;
  return `<h1>Progress and checklists</h1><p class="lead">Kept on this phone only. Nobody else sees it.</p>
  <dl class="result"><dt>Topics read</dt><dd><b>${read}</b> of ${tops.length} ${bar(read, tops.length)}</dd><dt>Questions</dt><dd><b>${qok}</b> right of ${q.length} answered</dd><dt>Scenarios</dt><dd><b>${sc}</b> tried</dd></dl>
  <h2>By module</h2><ul class="rows">${MODULES.map(m => { const p = moduleProgress(m); return `<li><a href="#/learn/${esc(m.id)}"><strong>${esc(m.title)}</strong><span class="rowmeta">${p.r} of ${p.n} ${bar(p.r, p.n)}</span></a></li>`; }).join('')}</ul>
  <h2>Checklists</h2><ul class="rows">${checks.map(({ m, t, b }) => `<li><a href="#/learn/${esc(m.id)}/${esc(t.id)}"><strong>${esc(plain(b.title))}</strong><span class="rowmeta">${getChecks(b.id).length} of ${b.items.length} ticked</span></a></li>`).join('')}</ul>
  <div class="row"><button type="button" class="btn danger" id="reset">Clear my progress</button></div>`;
}

function searchScreen(q) {
  const res = search(q);
  return `<h1>Search</h1><form id="sform" role="search"><label for="sq" class="visually-hidden">Search the guide</label><input id="sq" type="search" value="${esc(q)}" placeholder="Search topics, drugs, crises, calculators" autocomplete="off"></form>
  <div id="sres" aria-live="polite">${q ? (res.length ? `<p class="muted small">${res.length} result${res.length === 1 ? '' : 's'}</p><ul class="rows">${res.map(r => `<li><a href="${esc(r.route)}"><span class="kind">${esc(r.kind)}</span><strong>${esc(r.title)}</strong><span class="muted">${esc(r.sub)}</span>${r.snippet ? `<span class="snip">${r.snippet}</span>` : ''}</a></li>`).join('')}</ul>` : '<p>No results. Try another word.</p>') : ''}</div>`;
}

function about() {
  return `<h1>About this guide</h1>
  <p>The MO guide is the NTFGH anaesthesia department's practical guide for new medical officers. It covers the department's MO handbook (4th edition, 2026) and goes beyond it: drug doses worked out for your patient, crisis cards, calculators, case scenarios and flashcards.</p>
  <p>It is a learning aid. It supports, and never replaces, the consultant you work with. In your first month you never start, end or extubate on your own: if you are unsure, ask, and if something is going wrong, call.</p>
  <p>Doses are for adults unless a page says otherwise. Check every drug, dose, dilution and route before you give it.</p>
  <h2>Using it on your phone</h2><p>It works without signal once opened. To keep it on your home screen: on Android, open the browser menu and choose <em>Install app</em>; on iPhone, tap Share, then <em>Add to Home Screen</em>.</p>
  <p id="install" class="muted small" hidden></p>
  <h2>What it keeps</h2><p>Your progress (topics read, ticks, flashcards) stays on this phone. The patient weight you enter is kept only in this browser tab, for 6 hours. Nothing is sent anywhere.</p>
  <h2>Something wrong?</h2><p>Tell the consultant who looks after MO teaching, or write to <a href="mailto:contact@anantf.com">contact@anantf.com</a>.</p>
  <p>Related: <a href="../babymo/">Baby MO test</a> · <a href="../spinal/">Spinal anaesthesia</a> · <a href="../airway.html">Airway</a> · <a href="../regional.html">Regional anaesthesia</a></p>
  ${APPVER}`;
}

const notFound = () => '<h1>Not found</h1><p>That page is not in the guide. <a href="#/">Go to the start →</a></p>';

// ---------------------------------------------------------------- embeds (drug cards, tables, tools, links) inside a screen
function mountEmbeds(root) {
  root.querySelectorAll('.drug-embed').forEach(el => { el.innerHTML = drugCard(drugById[el.dataset.drug], { full: false, link: true }); });
  root.querySelectorAll('.drugtable').forEach(el => { el.innerHTML = drugTable(el.dataset.drugs.split(' '), el.dataset.title); });
  root.querySelectorAll('.tool-embed').forEach(el => {
    if (el.closest('.topic')) {
      const t = TOOLS[el.dataset.tool]; if (!t) return;
      el.innerHTML = `<div class="tool-head"><p class="kind">Calculator</p><h3>${esc(t.title)}</h3><p class="muted small">${esc(t.summary)} <a href="#/tools/${esc(el.dataset.tool)}">Open on its own →</a></p></div><div class="tool-body"></div>`;
      mountTool(el.querySelector('.tool-body'), el.dataset.tool);
    } else mountTool(el, el.dataset.tool);
  });
  root.querySelectorAll('.crisis-link').forEach(el => { const c = crisisById[el.dataset.crisis]; el.innerHTML = c ? `<a class="linkcard crisis" href="#/crisis/${esc(c.id)}"><span class="kind">Crisis card</span><strong>${esc(c.title)}</strong><span class="muted">${esc(c.summary || '')}</span></a>` : ''; });
  root.querySelectorAll('.scen-link').forEach(el => { const s = PR.scenarioById[el.dataset.scenario]; el.innerHTML = s ? `<a class="linkcard" href="#/practice/scenario/${esc(s.id)}"><span class="kind">Practise this</span><strong>${esc(s.title)}</strong><span class="muted">${esc(s.summary || s.setting)}</span></a>` : ''; });
}

// ---------------------------------------------------------------- router
let current = null;
function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const dec = x => { try { return decodeURIComponent(x); } catch { return x; } };
  return { parts: path.split('/').filter(Boolean).map(dec), q: new URLSearchParams(qs || '') };
}

function route(keepFocus = false, focusSel = null) {
  const { parts, q } = parse();
  const [a, b, c] = parts;
  let html, title = 'MO guide', section = a || '', after = null;
  if (a !== 'practice' || b !== 'scenario') PR.leaveScenario();
  if (a !== 'practice' || b !== 'cards') PR.leaveCards();
  if (a !== 'practice' || b !== 'drawers') PR.leaveDrawers();

  if (!a) { html = home(); after = paintVersion; }
  else if (a === 'learn' && !b) { html = learn(); title = 'Learn'; }
  else if (a === 'learn' && modById[b] && !c) { html = moduleScreen(modById[b]); title = modById[b].title; }
  else if (a === 'learn' && modById[b] && c) {
    const m = modById[b], t = m.topics.find(x => x.id === c);
    if (t) {
      html = topicScreen(m, t); title = t.title;
      after = root => {
        wire(root, { quizzes: collectQuizzes(t.blocks), mount: mountEmbeds });
        wirePatient(root, patientChanged);
        root.querySelector('#markread').addEventListener('click', () => { markRead(topicKey(m.id, t.id), !isRead(topicKey(m.id, t.id))); route(true, '#markread'); });
      };
    }
  }
  else if (a === 'drugs' && !b) {
    html = drugsScreen(q.get('q') || ''); title = 'Drug doses';
    after = root => {
      wirePatient(root, patientChanged);
      const inp = root.querySelector('#drug-q');
      inp.addEventListener('input', () => {
        history.replaceState(null, '', inp.value ? `#/drugs?q=${encodeURIComponent(inp.value)}` : '#/drugs');
        const tmp = document.createElement('div'); tmp.innerHTML = drugsScreen(inp.value);
        root.querySelector('#drug-list').replaceWith(tmp.querySelector('#drug-list'));
        const n = root.querySelectorAll('#drug-list .dtable > li').length;
        root.querySelector('#drug-count').textContent = n ? `${n} drug${n === 1 ? '' : 's'}` : 'No drug matches';
      });
    };
  }
  else if (a === 'drugs' && drugById[b]) { html = drugScreen(drugById[b]); title = drugById[b].name; after = root => wirePatient(root, patientChanged); }
  else if (a === 'tools' && !b) { html = toolsScreen(); title = 'Calculators'; }
  else if (a === 'tools' && hasTool(b)) { html = toolScreen(b); title = TOOLS[b].title; after = mountEmbeds; }
  else if (a === 'crisis' && !b) { html = crisisList(); title = 'Crisis cards'; }
  else if (a === 'crisis' && crisisById[b]) { html = crisisScreen(crisisById[b]); title = crisisById[b].title; }
  else if (a === 'practice' && !b) { html = PR.practiceHub(); title = 'Practice'; }
  else if (a === 'practice' && b === 'scenario') { html = PR.scenarioScreen(c); title = PR.scenarioById[c]?.title || 'Scenario'; after = root => PR.wireScenario(root, c, redraw); }
  else if (a === 'practice' && b === 'cards' && c) { html = PR.cardsScreen(c); title = 'Flashcards'; after = root => PR.wireCards(root, redraw); }
  else if (a === 'practice' && b === 'quiz') { html = PR.quizScreen(c); title = 'Check yourself'; after = root => PR.wireQuizScreen(root, c); }
  else if (a === 'practice' && b === 'drawers') { html = PR.drawersScreen(); title = 'Find it in the trolley'; after = root => PR.wireDrawers(root, redraw); }
  else if (a === 'progress') {
    html = progressScreen(); title = 'Progress'; section = '';
    after = root => root.querySelector('#reset').addEventListener('click', () => { if (confirm('Clear all your progress on this phone? This cannot be undone.')) { resetAll(); safeRoute(); } });
  }
  else if (a === 'search') {
    html = searchScreen(q.get('q') || ''); title = 'Search'; section = '';
    after = root => {
      const inp = root.querySelector('#sq');
      let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { history.replaceState(null, '', `#/search?q=${encodeURIComponent(inp.value)}`); const tmp = document.createElement('div'); tmp.innerHTML = searchScreen(inp.value); root.querySelector('#sres').innerHTML = tmp.querySelector('#sres').innerHTML; }, 150); });
      root.querySelector('#sform').addEventListener('submit', e => e.preventDefault());
      if (!keepFocus) inp.focus();
    };
  }
  else if (a === 'about') { html = about(); title = 'About'; section = ''; after = paintVersion; }

  const found = html != null;
  if (!found) { html = notFound(); title = 'Not found'; after = null; }
  const same = current === location.hash;
  current = location.hash;
  const y = window.scrollY;
  app.innerHTML = html;
  renderNav(section === 'progress' ? '' : section);
  document.title = `${title} · MO guide · NTF Anaesthesia`;
  if (after) after(app);
  paintInstall();
  const h1 = app.querySelector('h1');
  h1?.setAttribute('tabindex', '-1');
  if (keepFocus) {
    if (same && !focusSel) window.scrollTo(0, y);
    const f = (focusSel && app.querySelector(focusSel)) || (!same || focusSel ? h1 : null);
    if (f) { if (f.tabIndex < 0 && !f.hasAttribute('tabindex')) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); f.scrollIntoView({ block: 'nearest' }); }
  } else {
    window.scrollTo(0, 0);
    if (a !== 'search') h1?.focus({ preventScroll: true });
  }
  if (found && ((a === 'learn' && c) || (['drugs', 'crisis', 'tools'].includes(a) && b))) setLast(location.hash, title);
}
function safeRoute(keepFocus, focusSel) {
  try { route(keepFocus, focusSel); }
  catch (e) { console.error(e); app.innerHTML = notFound(); renderNav(''); }
}
// practice screens redraw in place and move focus to what changed (feedback, the next question)
function redraw(keepFocus, focusSel) { safeRoute(true, focusSel || 'h1'); }

/** The patient's weight was set or cleared: redraw the doses, keep focus on the panel and say what happened. */
function patientChanged(msg) {
  safeRoute(true, '#patient-edit');
  announce(msg);
}
function announce(msg) {
  const el = $('#announce'); if (!el || !msg) return;
  el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 50);
}

// only routes (#/…) change the screen; '#app' and other in-page anchors (the skip link) do not
window.addEventListener('hashchange', () => { if (!location.hash || location.hash.startsWith('#/')) safeRoute(); });
// a weight older than 6 hours is dropped when the app comes back to the front
document.addEventListener('visibilitychange', () => { if (!document.hidden && patientExpired()) safeRoute(true); });
$('.mo-skip')?.addEventListener('click', e => { e.preventDefault(); (app.querySelector('h1') || app).focus(); });

// ---------------------------------------------------------------- installable app (service worker)
// As in the Baby MO test: a new version takes over by itself, but the page reloads only when it is safe (never on the first
// install, never with something half typed or mid-scenario), and the page asks for updates when it comes back to the front.
let updateReady = false, reloading = false;
function safeToReload() {
  // anything typed, ticked or chosen on this screen (search boxes keep their text in the address, so they don't count)
  const changed = el => el.type === 'checkbox' || el.type === 'radio' ? el.checked !== el.defaultChecked
    : el.tagName === 'SELECT' ? [...el.options].some(o => o.selected !== o.defaultSelected) : el.value !== el.defaultValue;
  if ([...document.querySelectorAll('main input:not([type=search]), main textarea, main select')].some(changed)) return false;
  if (/^#\/practice\/(scenario|cards|drawers)/.test(location.hash)) return false;
  if (/^#\/crisis\//.test(location.hash)) return false;
  return true;
}
function applyUpdate() {
  if (!updateReady || reloading || !safeToReload()) return;
  reloading = true; location.reload();
}
async function setupPwa() {
  if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) return;
  let hadController = !!navigator.serviceWorker.controller;
  let reg; try { reg = await navigator.serviceWorker.register('sw.js'); } catch { return; }
  if (!reg) return;
  const check = () => reg.update().catch(() => {});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { check(); applyUpdate(); } });
  window.addEventListener('online', check);
  setInterval(check, 10 * 60 * 1000);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }
    updateReady = true; applyUpdate();
  });
  window.addEventListener('hashchange', applyUpdate);
}

// App version and "Get the latest version" (foot of the start page and About). Clears only this app's offline copy
// (its worker and mo- caches), never progress, and only after checking there is a signal.
const APPVER = '<div class="appver"><p id="appver" hidden></p><p><button type="button" class="link" id="getlatest">Not updating? Get the latest version</button></p><p id="appver-msg" role="status"></p></div>';
async function paintVersion(root = app) {
  const el = root.querySelector('#appver'), btn = root.querySelector('#getlatest'); if (!el) return;
  btn.addEventListener('click', getLatest);
  try {
    const k = (await caches.keys()).find(k => k.startsWith('mo-')); if (!k) return;
    const v = k.slice(3), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    el.textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
  } catch { /* no caches: no line */ }
}
async function getLatest() {
  const btn = $('#getlatest'), msg = $('#appver-msg');
  btn.disabled = true; msg.textContent = '';
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const url = new URL(reg?.active?.scriptURL || new URL('sw.js', location.href));
    url.searchParams.set('fresh', Date.now());
    const res = await fetch(url, { cache: 'no-store' }); if (!res.ok) throw new Error(res.status);
    if (reg) await reg.unregister();
    for (const k of await caches.keys()) if (k.startsWith('mo-')) await caches.delete(k);
    location.reload();
  } catch {
    msg.textContent = 'No signal: nothing was changed. Try again with signal.'; btn.disabled = false;
  }
}

let installEvent = null;
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvent = ev; paintInstall(); });
window.addEventListener('appinstalled', () => { installEvent = null; paintInstall(); });
function paintInstall() {
  const el = $('#install'); if (!el) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) { el.hidden = true; return; }
  if (installEvent) { el.hidden = false; el.innerHTML = '<button type="button" class="link" id="doinstall">Install this guide on your phone</button>'; $('#doinstall').addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; paintInstall(); }); }
  else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { el.hidden = false; el.textContent = 'To keep this on your phone: tap Share, then Add to Home Screen.'; }
  else el.hidden = true;
}

safeRoute();
setupPwa();
document.body.dataset.ready = 'true';
