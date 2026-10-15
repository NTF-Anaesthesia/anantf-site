// MO guide: the screens and the router (hash routes, so Back works and every screen has a link).
//   #/ and #/learn         learn (home)      #/learn/<module>, #/learn/<module>/<topic>
//   #/drugs, #/drugs/<id>  drug doses        #/tools, #/tools/<id>        calculators
//   #/crisis, #/crisis/<id> crisis cards     #/practice/...               scenarios, flashcards, check yourself
//   #/progress  #/search?q=  #/about
// The look is the shared phone-app kit (../assets/app/app.css, DESIGN-APP.md): large titles that collapse into the top
// bar, a bottom tab bar, grouped lists, cards, buttons, choices, sheets and toasts.
import { md, esc } from './md.js';
import { MODULES, GROUPS } from './content/index.js';
import { DRUGS, DRUG_GROUPS } from './data/drugs.js';
import { CRISES } from './data/crises.js';
import { renderBlocks, wire, collectQuizzes } from './render.js';
import { drugById, drugCard, drugTable, doseLine, labelChip, patientPanel, wirePatient, weightsNow } from './drugs-ui.js';
import { TOOLS, TOOL_GROUPS, mountTool } from './tools.js';
import * as PR from './practice.js';
import { search } from './search.js';
import { title, row, section, levelBadge } from './ui.js';
import { progress, isRead, markRead, setLast, resetAll, getChecks, patientExpired } from './store.js';
import { plain } from './md.js';

const $ = s => document.querySelector(s);
const app = $('#app');
const byId = list => Object.assign(Object.create(null), Object.fromEntries(list.map(x => [x.id, x])));
const crisisById = byId(CRISES);
const modById = byId(MODULES);
const hasTool = id => id != null && Object.hasOwn(TOOLS, id);

const topicKey = (m, t) => `${m}/${t}`;
const allTopics = () => MODULES.flatMap(m => m.topics.map(t => ({ m, t })));
const words = t => Math.max(1, Math.round(plain(JSON.stringify(t.blocks)).split(/\s+/).length / 200));

// ---------------------------------------------------------------- shell: tab bar, top bar, toast, sheet
const ICON = {
  learn: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11"/>',
  drugs: '<path d="M10.5 3.5a4.2 4.2 0 0 1 6 6l-7 7a4.2 4.2 0 0 1-6-6zM7.2 7.2l6 6"/>',
  tools: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',
  crisis: '<path d="M12 3.5 21 19.5H3z"/><path d="M12 10v4.5M12 17.2h.01"/>',
  practice: '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
};
const NAV = [['learn', 'Learn'], ['drugs', 'Drugs'], ['tools', 'Tools'], ['crisis', 'Crisis'], ['practice', 'Practice']];
function renderNav(section) {
  $('#nav').innerHTML = NAV.map(([k, t]) => `<a class="app-tab" href="#/${k}"${k === section ? ' aria-current="page"' : ''}><span class="app-tab-icon"><svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg></span><span>${t}</span></a>`).join('');
}

/** Top bar: a back button naming the screen it returns to (pushed screens), and the title that fades in once the large one scrolls away. */
function setBar(titleText, back) {
  $('#bar-lead').innerHTML = back ? `<a class="app-bar-btn app-back" href="${esc(back.href)}">${esc(back.label)}</a>` : '';
  $('#bar-title').textContent = titleText || '';
}
let titleWatch = null;
function watchTitle() {
  titleWatch?.disconnect();
  const bar = $('#bar'), h = app.querySelector('.app-large-title');
  if (!h || !('IntersectionObserver' in window)) { bar.classList.add('mo-instant'); bar.classList.toggle('is-collapsed', !h); void bar.offsetWidth; requestAnimationFrame(() => bar.classList.remove('mo-instant')); return; }
  // set the bar's state for the new screen at once (no fade), so it never flickers on arrival
  bar.classList.add('mo-instant');
  bar.classList.toggle('is-collapsed', h.getBoundingClientRect().bottom < 56);
  void bar.offsetWidth;
  requestAnimationFrame(() => bar.classList.remove('mo-instant'));
  titleWatch = new IntersectionObserver(([e]) => bar.classList.toggle('is-collapsed', !e.isIntersecting), { rootMargin: '-56px 0px 0px 0px' });
  titleWatch.observe(h);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  $('#toast-text').textContent = msg;
  t.classList.add('is-visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-visible'), 4000);
}

/** A bottom sheet that asks before something is lost. Opens with showModal (focus stays inside, Esc closes), and takes a history entry so Back closes it. */
function confirmSheet({ heading, text, action, danger = true }) {
  const opener = document.activeElement;
  const d = document.createElement('dialog');
  d.className = 'app-sheet';
  d.setAttribute('aria-labelledby', 'sheet-h');
  d.innerHTML = `<span class="app-sheet-grabber" aria-hidden="true"></span><div class="app-sheet-head"><h2 class="app-sheet-title" id="sheet-h">${esc(heading)}</h2><button type="button" class="app-bar-btn" data-close>Cancel</button></div><div class="app-sheet-body"><p class="app-confirm-text">${esc(text)}</p></div><div class="app-sheet-foot"><button type="button" class="app-btn app-btn--block ${danger ? 'app-btn--danger' : 'app-btn--primary'}" data-go>${esc(action)}</button></div>`;
  document.body.append(d);
  let done = false;
  const finish = ok => { if (done) return; done = true; if (d.open) d.close(); d.remove(); window.removeEventListener('popstate', onPop); if (history.state?.sheet) history.back(); opener?.focus?.(); if (ok) ok(); };
  const onPop = () => { if (!done) { done = true; if (d.open) d.close(); d.remove(); window.removeEventListener('popstate', onPop); opener?.focus?.(); } };
  d.addEventListener('close', () => finish());
  d.addEventListener('click', e => { if (e.target === d) finish(); });
  d.querySelector('[data-close]').addEventListener('click', () => finish());
  d.querySelector('[data-go]').addEventListener('click', () => finish(() => action_()));
  const action_ = () => d.dispatchEvent(new CustomEvent('confirmed'));
  history.pushState({ sheet: 1 }, '');
  window.addEventListener('popstate', onPop);
  d.showModal();
  return d;
}

function moduleProgress(m) {
  const n = m.topics.length, r = m.topics.filter(t => isRead(topicKey(m.id, t.id))).length;
  return { n, r };
}
const bar = (r, n) => `<progress class="app-progress" max="${n}" value="${r}" aria-label="${r} of ${n} read"></progress>`;
const rowmeta = (r, n) => `<span>${r} of ${n} read</span>`;

// ---------------------------------------------------------------- screens
/** Learn: the home screen. Carry on, progress, every module by group, and the guide's own pages. */
function learnHome() {
  const tops = allTopics(), read = tops.filter(({ m, t }) => isRead(topicKey(m.id, t.id))).length;
  const last = progress().last;
  const first = MODULES[0];
  const next = tops.find(({ m, t }) => !isRead(topicKey(m.id, t.id)));
  const lead = last && last.route !== '#/' && last.route !== '#/learn'
    ? { kicker: 'Carry on', head: last.title, sub: '', href: last.route, cta: 'Continue' }
    : next ? { kicker: read ? 'Next up' : 'Start here', head: next.t.title, sub: next.m.title, href: `#/learn/${next.m.id}/${next.t.id}`, cta: read ? 'Open' : 'Begin' }
      : { kicker: 'All read', head: 'You have read every topic', sub: 'Keep practising.', href: '#/practice', cta: 'Practise' };
  return `${title('Learn', 'Practical anaesthesia for new medical officers.')}
  <div class="app-card app-card--accent"><p class="app-kicker">${esc(lead.kicker)}</p><p class="app-card-title">${esc(lead.head)}</p>${lead.sub ? `<p class="app-small app-muted" style="margin:0">${esc(lead.sub)}</p>` : ''}<div class="app-card-actions"><a class="app-btn app-btn--primary" href="${esc(lead.href)}">${esc(lead.cta)}</a></div></div>
  <div class="app-card"><p class="app-kicker">Your progress</p><p class="app-card-title">${read} of ${tops.length} topics read</p>${bar(read, tops.length)}<p class="app-small app-muted" style="margin:var(--app-s3) 0 0">Kept on this phone only. <span class="app-badge">Core</span> is what you need in your first month; <span class="app-badge beyond">Beyond</span> takes you further.</p></div>
  ${Object.entries(GROUPS).map(([g, name]) => {
    const ms = MODULES.filter(m => m.group === g); if (!ms.length) return '';
    return section(name, ms.map(m => { const p = moduleProgress(m); return row({ href: `#/learn/${m.id}`, title: m.title, sub: m.summary, meta: rowmeta(p.r, p.n) }); }).join(''));
  }).join('')}
  ${section('More', row({ href: '#/progress', title: 'Progress and checklists' }) + row({ href: '#/about', title: 'About this guide' }), 'This guide is written for the NTFGH anaesthesia department. It supports, and never replaces, your consultant: if you are unsure, ask.')}
  ${APPVER}`;
}

function moduleScreen(m) {
  return `${title(m.title, esc(m.summary))}
  ${section('', m.topics.map(t => { const r = isRead(topicKey(m.id, t.id)); return row({ href: `#/learn/${m.id}/${t.id}`, title: t.title, sub: t.summary || '', meta: `${levelBadge(t.level)} <span>${words(t)} min${r ? ' · <span class="readmark">read</span>' : ''}</span>` }); }).join(''))}`;
}

function topicScreen(m, t) {
  const list = allTopics(), i = list.findIndex(x => x.m === m && x.t === t);
  const prev = list[i - 1], next = list[i + 1];
  const key = topicKey(m.id, t.id), read = isRead(key);
  const hasDoses = JSON.stringify(t.blocks).match(/"t":"drugs?"/);
  return `${title(t.title, `${levelBadge(t.level)} ${words(t)} min read`)}
  ${hasDoses ? patientPanel() : ''}
  <div class="topic">${renderBlocks(t.blocks, { module: m.id, topic: t.id })}</div>
  <div class="app-btn-stack"><button type="button" class="app-btn app-btn--block ${read ? 'app-btn--outline' : 'app-btn--primary'}" id="markread" aria-pressed="${read}">${read ? 'Read ✓ (tap to undo)' : 'Mark as read'}</button></div>
  ${prev || next ? `<nav class="pager" aria-label="Topics">${section('', (prev ? row({ href: `#/learn/${prev.m.id}/${prev.t.id}`, title: prev.t.title, sub: 'Previous', cls: 'prev' }).replace('class="app-row prev"', 'class="app-row" rel="prev"') : '') + (next ? row({ href: `#/learn/${next.m.id}/${next.t.id}`, title: next.t.title, sub: 'Next' }).replace('class="app-row"', 'class="app-row" rel="next"') : ''))}</nav>` : ''}`;
}

function drugsScreen(q = '') {
  const w = weightsNow();
  const ql = q.toLowerCase();
  const match = d => !ql || [d.name, ...(d.aka || []), d.cls, DRUG_GROUPS[d.group]?.name].join(' ').toLowerCase().includes(ql);
  return `${title('Drug doses', "The department's doses and dilutions for adults. Set the weight and every dose is worked out.")}
  ${patientPanel()}
  <label class="app-field" for="drug-q"><span class="app-sr">Find a drug</span><input class="app-input" id="drug-q" type="search" placeholder="Find a drug" value="${esc(q)}" autocomplete="off" enterkeyhint="search"></label>
  <p id="drug-count" class="app-sr" role="status"></p>
  <div id="drug-list">${Object.entries(DRUG_GROUPS).map(([g, info]) => {
    const ds = DRUGS.filter(d => d.group === g && match(d)); if (!ds.length) return '';
    return `<section class="app-section"><h2 class="app-section-header">${esc(info.name)}</h2><ul class="app-list dtable">${ds.map(d => `<li>${labelChip(d)}<div><a class="dname" href="#/drugs/${esc(d.id)}">${esc(d.name)}</a><ul class="doses">${(d.doses || []).slice(0, 2).map(x => doseLine(d, x, w)).join('')}</ul></div></li>`).join('')}</ul></section>`;
  }).join('') || '<p class="app-muted">No drug matches.</p>'}</div>
  <p class="app-section-footer" style="padding:0">Coloured squares are the syringe label colours. Doses are a starting point: your consultant decides, and the dose for the frail, elderly or shocked is often less.</p>`;
}

function drugScreen(d) {
  return `${title(d.name, esc(d.cls || ''))}${patientPanel()}${drugCard(d, { full: true, level: 1 })}`;
}

function toolsScreen() {
  return `${title('Calculators', 'Worked out as you type. Check anything that looks odd: a calculator is only as good as the numbers you give it.')}
  ${Object.entries(TOOL_GROUPS).map(([g, name]) => section(name, Object.entries(TOOLS).filter(([, t]) => t.group === g).map(([id, t]) => row({ href: `#/tools/${id}`, title: t.title, sub: t.summary })).join(''))).join('')}`;
}

function toolScreen(id) {
  const t = TOOLS[id];
  return `${title(t.title, esc(t.summary))}<div class="embed tool-embed" data-tool="${esc(id)}"></div>`;
}

function crisisList() {
  return `${title('Crisis cards', 'For when it goes wrong. First, always: <strong>call for help</strong> and say the problem out loud.')}
  ${section('', CRISES.map(c => row({ href: `#/crisis/${c.id}`, title: c.title, sub: c.summary || '', cls: 'crisis-row' })).join(''))}`;
}

function crisisScreen(c) {
  const w = weightsNow();
  const doseItem = x => {
    const d = x.drug && drugById[x.drug];
    return `<li><span class="dl-label">${d ? `<a href="#/drugs/${esc(d.id)}">${md(x.label)}</a>` : md(x.label)}</span><span class="dl-dose">${md(x.text)}</span></li>`;
  };
  return `<div class="crisis-card">${title(c.title)}
  <p class="callfirst" role="note"><strong>Call for help.</strong> Say the problem out loud. Note the time.</p>
  ${c.recognise?.length ? `<h2 class="csec">Recognise</h2><ul class="list">${c.recognise.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${(c.steps || []).map(s => `<h2 class="csec">${md(s.title)}</h2><ol class="steps big">${(s.items || []).map(x => `<li>${md(x)}</li>`).join('')}</ol>`).join('')}
  ${c.doses?.length ? `<h2 class="csec">Doses</h2>${w.tbw != null ? `<p class="app-muted app-small">Your patient: ${w.tbw} kg. Tap a drug for its worked-out dose.</p>` : ''}<ul class="doses crisis-doses">${c.doses.map(doseItem).join('')}</ul>` : ''}
  ${c.pitfalls?.length ? `<h2 class="csec">Watch out</h2><ul class="list">${c.pitfalls.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${c.after?.length ? `<h2 class="csec">Afterwards</h2><ul class="list">${c.after.map(x => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
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
  return `${title('Progress', 'Kept on this phone only. Nobody else sees it.')}
  <div class="app-card"><dl class="result" style="margin:0"><dt>Topics read</dt><dd><b>${read}</b> of ${tops.length}</dd><dt>Questions</dt><dd><b>${qok}</b> right of ${q.length} answered</dd><dt>Scenarios</dt><dd><b>${sc}</b> tried</dd></dl></div>
  ${section('By module', MODULES.map(m => { const p = moduleProgress(m); return row({ href: `#/learn/${m.id}`, title: m.title, meta: rowmeta(p.r, p.n) }); }).join(''))}
  ${section('Checklists', checks.map(({ m, t, b }) => row({ href: `#/learn/${m.id}/${t.id}`, title: plain(b.title), meta: `<span>${getChecks(b.id).length} of ${b.items.length} ticked</span>` })).join(''))}
  <section class="app-section"><ul class="app-list"><li><button type="button" class="app-row app-row--danger" id="reset"><span class="app-row-body"><span class="app-row-title">Clear my progress</span></span></button></li></ul><p class="app-section-footer">Removes topics read, ticks, answers and flashcard boxes from this phone.</p></section>`;
}

function searchScreen(q) {
  const res = search(q);
  return `${title('Search')}<form id="sform" role="search"><label class="app-field" for="sq"><span class="app-sr">Search the guide</span><input class="app-input" id="sq" type="search" value="${esc(q)}" placeholder="Search topics, drugs, crises, calculators" autocomplete="off" enterkeyhint="search"></label></form>
  <div id="sres" aria-live="polite">${q ? (res.length ? `<p class="app-muted app-small">${res.length} result${res.length === 1 ? '' : 's'}</p>${section('', res.map(r => row({ href: r.route, title: r.title, sub: r.sub, meta: `<span class="kind">${esc(r.kind)}</span>${r.snippet ? `<span class="snip">${r.snippet}</span>` : ''}` })).join(''))}` : '<p>No results. Try another word.</p>') : ''}</div>`;
}

function about() {
  return `${title('About this guide')}
  <p class="app-text">The MO guide is the NTFGH anaesthesia department's practical guide for new medical officers. It covers the department's MO handbook (4th edition, 2026) and goes beyond it: drug doses worked out for your patient, crisis cards, calculators, case scenarios and flashcards.</p>
  <p class="app-text">It is a learning aid. It supports, and never replaces, the consultant you work with. In your first month you never start, end or extubate on your own: if you are unsure, ask, and if something is going wrong, call.</p>
  <p class="app-text">Doses are for adults unless a page says otherwise. Check every drug, dose, dilution and route before you give it.</p>
  <h2 class="app-h2">Using it on your phone</h2><p class="app-text">It works without signal once opened. To keep it on your home screen: on Android, open the browser menu and choose <em>Install app</em>; on iPhone, tap Share, then <em>Add to Home Screen</em>.</p>
  <p id="install" class="app-muted app-small" hidden></p>
  <h2 class="app-h2">What it keeps</h2><p class="app-text">Your progress (topics read, ticks, flashcards) stays on this phone. The patient weight you enter is kept only in this browser tab, for 6 hours. Nothing is sent anywhere.</p>
  <h2 class="app-h2">Something wrong?</h2><p class="app-text">Tell the consultant who looks after MO teaching, or write to <a href="mailto:contact@anantf.com">contact@anantf.com</a>.</p>
  ${section('Related', row({ href: '../babymo/', title: 'Baby MO test' }) + row({ href: '../spinal/', title: 'Spinal anaesthesia' }) + row({ href: '../airway.html', title: 'Airway' }) + row({ href: '../regional.html', title: 'Regional anaesthesia' }))}
  ${APPVER}`;
}

const notFound = () => `${title('Not found')}<p class="app-text">That page is not in the guide.</p><div class="app-btn-stack"><a class="app-btn app-btn--primary app-btn--block" href="#/learn">Go to Learn</a></div>`;

// ---------------------------------------------------------------- embeds (drug cards, tables, tools, links) inside a screen
function mountEmbeds(root) {
  root.querySelectorAll('.drug-embed').forEach(el => { el.innerHTML = drugCard(drugById[el.dataset.drug], { full: false, link: true }); });
  root.querySelectorAll('.drugtable').forEach(el => { el.innerHTML = drugTable(el.dataset.drugs.split(' '), el.dataset.title); });
  root.querySelectorAll('.tool-embed').forEach(el => {
    if (el.closest('.topic')) {
      const t = TOOLS[el.dataset.tool]; if (!t) return;
      el.innerHTML = `<div class="tool-head"><p class="kind">Calculator</p><h3>${esc(t.title)}</h3><p class="app-muted app-small">${esc(t.summary)} <a href="#/tools/${esc(el.dataset.tool)}">Open on its own →</a></p></div><div class="tool-body"></div>`;
      mountTool(el.querySelector('.tool-body'), el.dataset.tool);
    } else mountTool(el, el.dataset.tool);
  });
  root.querySelectorAll('.crisis-link').forEach(el => { const c = crisisById[el.dataset.crisis]; el.innerHTML = c ? `<a class="linkcard crisis" href="#/crisis/${esc(c.id)}"><span class="kind">Crisis card</span><strong>${esc(c.title)}</strong><span class="app-muted">${esc(c.summary || '')}</span></a>` : ''; });
  root.querySelectorAll('.scen-link').forEach(el => { const s = PR.scenarioById[el.dataset.scenario]; el.innerHTML = s ? `<a class="linkcard" href="#/practice/scenario/${esc(s.id)}"><span class="kind">Practise this</span><strong>${esc(s.title)}</strong><span class="app-muted">${esc(s.summary || s.setting)}</span></a>` : ''; });
}

// ---------------------------------------------------------------- router
let current = null;
function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const dec = x => { try { return decodeURIComponent(x); } catch { return x; } };
  return { parts: path.split('/').filter(Boolean).map(dec), q: new URLSearchParams(qs || '') };
}
const depthOf = hash => hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean).length;
const CAN_TRANSITION = 'startViewTransition' in document && !navigator.webdriver && !matchMedia('(prefers-reduced-motion: reduce)').matches;

function route(keepFocus = false, focusSel = null) {
  const { parts, q } = parse();
  let [a, b, c] = parts;
  if (!a) a = 'learn';
  let html, ttl = 'MO guide', sect = a, after = null, back = null, session = false;
  if (a !== 'practice' || b !== 'scenario') PR.leaveScenario();
  if (a !== 'practice' || b !== 'cards') PR.leaveCards();
  if (a !== 'practice' || b !== 'drawers') PR.leaveDrawers();
  const LEARN = { href: '#/learn', label: 'Learn' };

  if (a === 'learn' && !b) { html = learnHome(); ttl = 'Learn'; after = root => paintVersion(root); }
  else if (a === 'learn' && modById[b] && !c) { html = moduleScreen(modById[b]); ttl = modById[b].title; back = LEARN; }
  else if (a === 'learn' && modById[b] && c) {
    const m = modById[b], t = m.topics.find(x => x.id === c);
    if (t) {
      html = topicScreen(m, t); ttl = t.title; back = { href: `#/learn/${m.id}`, label: m.title };
      after = root => {
        wire(root, { quizzes: collectQuizzes(t.blocks), mount: mountEmbeds });
        wirePatient(root, patientChanged);
        root.querySelector('#markread').addEventListener('click', () => { markRead(topicKey(m.id, t.id), !isRead(topicKey(m.id, t.id))); route(true, '#markread'); });
      };
    }
  }
  else if (a === 'drugs' && !b) {
    html = drugsScreen(q.get('q') || ''); ttl = 'Drug doses';
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
  else if (a === 'drugs' && drugById[b]) { html = drugScreen(drugById[b]); ttl = drugById[b].name; back = { href: '#/drugs', label: 'Drugs' }; after = root => wirePatient(root, patientChanged); }
  else if (a === 'tools' && !b) { html = toolsScreen(); ttl = 'Calculators'; }
  else if (a === 'tools' && hasTool(b)) { html = toolScreen(b); ttl = TOOLS[b].title; back = { href: '#/tools', label: 'Tools' }; after = mountEmbeds; }
  else if (a === 'crisis' && !b) { html = crisisList(); ttl = 'Crisis cards'; }
  else if (a === 'crisis' && crisisById[b]) { html = crisisScreen(crisisById[b]); ttl = crisisById[b].title; back = { href: '#/crisis', label: 'Crisis' }; }
  else if (a === 'practice' && !b) { html = PR.practiceHub(); ttl = 'Practice'; }
  else if (a === 'practice' && b === 'scenario') { html = PR.scenarioScreen(c); ttl = PR.scenarioById[c]?.title || 'Scenario'; back = { href: '#/practice', label: 'Practice' }; session = true; after = root => PR.wireScenario(root, c, redraw); }
  else if (a === 'practice' && b === 'cards' && c) { html = PR.cardsScreen(c); ttl = 'Flashcards'; back = { href: '#/practice', label: 'Practice' }; session = true; after = root => PR.wireCards(root, redraw); }
  else if (a === 'practice' && b === 'quiz') { html = PR.quizScreen(c); ttl = 'Check yourself'; back = { href: '#/practice', label: 'Practice' }; after = root => PR.wireQuizScreen(root, c); }
  else if (a === 'practice' && b === 'drawers') { html = PR.drawersScreen(); ttl = 'Find it in the trolley'; back = { href: '#/practice', label: 'Practice' }; session = true; after = root => PR.wireDrawers(root, redraw); }
  else if (a === 'progress') {
    html = progressScreen(); ttl = 'Progress'; sect = 'learn'; back = LEARN;
    after = root => root.querySelector('#reset').addEventListener('click', () => {
      confirmSheet({ heading: 'Clear your progress?', text: 'This removes topics read, ticks, answers and flashcard boxes from this phone. It cannot be undone.', action: 'Clear progress' })
        .addEventListener('confirmed', () => { resetAll(); safeRoute(true); toast('Progress cleared'); });
    });
  }
  else if (a === 'search') {
    html = searchScreen(q.get('q') || ''); ttl = 'Search'; sect = ''; back = { href: '#/learn', label: 'Back' };
    after = root => {
      const inp = root.querySelector('#sq');
      let t; inp.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { history.replaceState(null, '', `#/search?q=${encodeURIComponent(inp.value)}`); const tmp = document.createElement('div'); tmp.innerHTML = searchScreen(inp.value); root.querySelector('#sres').innerHTML = tmp.querySelector('#sres').innerHTML; }, 150); });
      root.querySelector('#sform').addEventListener('submit', e => e.preventDefault());
      if (!keepFocus) inp.focus();
    };
  }
  else if (a === 'about') { html = about(); ttl = 'About'; sect = 'learn'; back = LEARN; after = root => { paintVersion(root); }; }

  const found = html != null;
  if (!found) { html = notFound(); ttl = 'Not found'; after = null; back = LEARN; sect = ''; }
  const same = current === location.hash;
  const hash = location.hash;
  const y = window.scrollY;
  const dir = !current || same ? null : depthOf(hash) > depthOf(current) ? 'push' : depthOf(hash) < depthOf(current) ? 'pop' : 'tab';
  current = hash;

  const commit = () => {
    app.innerHTML = html;
    renderNav(sect);
    setBar(ttl, back);
    // no tab bar inside a practice session: its back button is the way out
    $('#tabbar').hidden = session;
    document.body.classList.toggle('app-has-tabbar', !session);
    document.title = `${ttl} · MO guide · NTF Anaesthesia`;
    if (after) after(app);
    paintInstall();
    const h1 = app.querySelector('h1');
    h1?.setAttribute('tabindex', '-1');
    if (keepFocus) {
      if (same && !focusSel) window.scrollTo(0, y);
      const f = (focusSel && app.querySelector(focusSel)) || (!same || focusSel ? h1 : null);
      if (f) { if (!f.hasAttribute('tabindex') && f.tabIndex < 0) f.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); f.scrollIntoView({ block: 'nearest' }); }
    } else {
      window.scrollTo(0, 0);
      if (a !== 'search') h1?.focus({ preventScroll: true });
    }
    watchTitle();   // after the scroll has settled, so the bar starts in the right state
    if (found && ((a === 'learn' && c) || (['drugs', 'crisis', 'tools'].includes(a) && b))) setLast(location.hash, ttl);
  };
  // screens slide in and out (View Transitions); with no support, in automation or with reduced motion they just swap
  if (CAN_TRANSITION && dir && !keepFocus) { document.documentElement.dataset.nav = dir; document.startViewTransition(commit); }
  else commit();
}
function safeRoute(keepFocus, focusSel) {
  try { route(keepFocus, focusSel); }
  catch (e) { console.error(e); app.innerHTML = notFound(); renderNav(''); setBar('Not found', { href: '#/learn', label: 'Learn' }); }
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
$('.app-skip')?.addEventListener('click', e => { e.preventDefault(); (app.querySelector('h1') || app).focus(); });
// iOS only shows :active styles once a touch listener exists
document.addEventListener('touchstart', () => {}, { passive: true });

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
const APPVER = '<section class="app-section appver"><ul class="app-list"><li id="appver" hidden><div class="app-row"><span class="app-row-body"><span class="app-row-title app-small app-muted" id="appver-text"></span></span></div></li><li><button type="button" class="app-row app-row--action" id="getlatest"><span class="app-row-body"><span class="app-row-title">Not updating? Get the latest version</span></span></button></li></ul><p class="app-section-footer" id="appver-msg" role="status"></p></section>';
async function paintVersion(root = app) {
  const el = root.querySelector('#appver'), btn = root.querySelector('#getlatest'); if (!el) return;
  btn.addEventListener('click', getLatest);
  try {
    const k = (await caches.keys()).find(k => k.startsWith('mo-')); if (!k) return;
    const v = k.slice(3), m = v.match(/^(\d{4}-\d{2}-\d{2})-([0-9a-f]+)$/);
    root.querySelector('#appver-text').textContent = 'App version ' + (m ? `${m[1]} (${m[2]})` : v); el.hidden = false;
  } catch { /* no caches: no line */ }
}
async function getLatest() {
  const btn = $('#getlatest'), msg = $('#appver-msg');
  btn.disabled = true; btn.setAttribute('aria-disabled', 'true'); msg.textContent = '';
  try {
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const url = new URL(reg?.active?.scriptURL || new URL('sw.js', location.href));
    url.searchParams.set('fresh', Date.now());
    const res = await fetch(url, { cache: 'no-store' }); if (!res.ok) throw new Error(res.status);
    if (reg) await reg.unregister();
    for (const k of await caches.keys()) if (k.startsWith('mo-')) await caches.delete(k);
    location.reload();
  } catch {
    msg.textContent = 'No signal: nothing was changed. Try again with signal.'; btn.disabled = false; btn.removeAttribute('aria-disabled');
  }
}

let installEvent = null;
window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); installEvent = ev; paintInstall(); });
window.addEventListener('appinstalled', () => { installEvent = null; paintInstall(); });
function paintInstall() {
  const el = $('#install'); if (!el) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) { el.hidden = true; return; }
  if (installEvent) { el.hidden = false; el.innerHTML = '<button type="button" class="app-btn app-btn--secondary app-btn--compact" id="doinstall">Install this guide on your phone</button>'; $('#doinstall').addEventListener('click', async () => { installEvent.prompt(); await installEvent.userChoice.catch(() => {}); installEvent = null; paintInstall(); }); }
  else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { el.hidden = false; el.textContent = 'To keep this on your phone: tap Share, then Add to Home Screen.'; }
  else el.hidden = true;
}

safeRoute();
setupPwa();
document.body.dataset.ready = 'true';
