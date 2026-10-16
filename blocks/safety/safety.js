/* /blocks/safety/: the emergency guides and the dose calculator on one screen. A segmented control chooses between
   "Emergency guides" (the default: the same guides as /blocks/#wrong, local anaesthetic toxicity first, red) and "Dose
   calculator" (the same component as /blocks/calculator/, prefilled from the query string the dose boxes send).
   Deep links: #last (or any guide id, or #wrong-<guide>) opens that guide; #guides the guides; #calculator opens the calculator. A query that
   prefills the calculator (?agent=…) opens it too. /blocks/#wrong, /blocks/calculator/ and the "Check the dose" links keep
   working as they were: this page is one more way in. Everything here is MO level. */
import { applyLevel } from '../../shared/regional/js/levels.js?v=20261015';
import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016';
import { mountRail } from '../../shared/regional/js/appnav.js?v=20261023';
import { guideList, openGuideFromHash } from '../../shared/regional/js/decide.js?v=20261017';
import { GUIDES, GUIDE_ORDER } from '../../shared/regional/js/data/decisions.js';
import { mountLaCalc } from '../../shared/regional/js/lacalc.js';
import { parseQuery } from '../../shared/regional/js/la.js';
import { pageBar } from '../pagebar.js?v=20261023';

const $ = (s, r = document) => r.querySelector(s);
applyLevel();
pageBar({ title: 'Safety' });
mountRail({ label: 'On this page', items: [{ href: '#guides', text: 'Emergency guides', id: 'guides' }, { href: '#calculator', text: 'Dose calculator', id: 'calculator' }] }); // (desktop rail in the website look)

$('#sf-wrong').append(guideList(GUIDE_ORDER, { idPrefix: 'wrong', headingLevel: 3 }));

const panels = { guides: $('#guides'), calculator: $('#calculator') };
const buttons = { guides: $('#sf-b-guides'), calculator: $('#sf-b-calculator') };
let calcMounted = false;
function show(which, { hash = false } = {}) {
  document.body.dataset.chapter = which; // the rail marks the half in view
  for (const k of Object.keys(panels)) {
    panels[k].hidden = k !== which;
    buttons[k].setAttribute('aria-pressed', String(k === which));
  }
  if (which === 'calculator' && !calcMounted) { calcMounted = true; mountLaCalc($('#lc-calc'), parseQuery(location.search)); }
  if (hash) { try { history.replaceState(null, '', `${location.pathname}${location.search}${which === 'calculator' ? '#calculator' : ''}`); } catch { /* sandbox */ } }
}
for (const k of Object.keys(buttons)) buttons[k].addEventListener('click', () => show(k, { hash: true }));

/** A hash that names a guide (#last, #wrong-last) or the calculator (#calculator). */
function route({ initial = false } = {}) {
  let id = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (id === 'guides') { show('guides'); return; }
  if (id === 'calculator') { show('calculator'); if (!initial) panels.calculator.scrollIntoView({ block: 'start' }); return; }
  if (GUIDES[id]) id = `wrong-${id}`;
  if (/^wrong-/.test(id) && document.getElementById(id)) {
    show('guides');
    openGuideFromHash(`#${id}`);
    requestAnimationFrame(() => document.getElementById(id).scrollIntoView({ block: 'start', behavior: 'auto' }));
    return;
  }
  if (initial && Object.keys(parseQuery(location.search)).length) show('calculator');
}
show('guides');
route({ initial: true });
addEventListener('hashchange', () => route());
document.body.dataset.sfReady = 'true';
registerOffline();
