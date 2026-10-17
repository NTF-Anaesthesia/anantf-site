/* /blocks/safety/: the emergency guides and the dose calculator on one screen. A segmented control chooses between
   "Emergency guides" (the default: the same guides as /blocks/#wrong, local anaesthetic toxicity first, red) and "Dose
   calculator" (the one calculator, lacalc.js, prefilled from the query string the dose boxes send).
   Under the calculator: "Planners and total-dose limits" (#doses; it was a fold on /blocks/ until 17 Oct 2026).
   Deep links: #last (or any guide id, or #wrong-<guide>) opens that guide; #guides and #wrong the guides; #calculator and #doses
   open the calculator half (#doses scrolls to the planners list). A query that prefills the calculator (?agent=…) opens it too.
   /blocks/#wrong, /blocks/#wrong-<guide> and /blocks/#doses redirect here with the hash kept; /blocks/calculator/ (the old stand-alone
   page, merged here on 17 Oct 2026) redirects here with its query kept, and the "Check the dose" links point here. Everything here is MO level. */
import { applyLevel } from '../../shared/regional/js/levels.js?v=20261015';
import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016';
import { mountRail } from '../../shared/regional/js/appnav.js?v=20261026';
import { guideList, openGuideFromHash } from '../../shared/regional/js/decide.js?v=20261017';
import { GUIDES, GUIDE_ORDER } from '../../shared/regional/js/data/decisions.js';
import { mountLaCalc } from '../../shared/regional/js/lacalc.js';
import { parseQuery } from '../../shared/regional/js/la.js';
import { pageBar } from '../pagebar.js?v=20261026';

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
  if (id === 'guides' || id === 'wrong') { show('guides'); return; }
  if (id === 'doses') {
    show('calculator');
    requestAnimationFrame(() => document.getElementById('doses').scrollIntoView({ block: 'start', behavior: 'auto' }));
    return;
  }
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
