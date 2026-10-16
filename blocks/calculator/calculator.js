/* /blocks/calculator/: the local anaesthetic dose calculator page. The app bar (back to Blocks, the MO · Res · Con level
   control) and the calculator from /shared/regional/js/lacalc.js, prefilled from the query string that block pages
   send (?agent=ropivacaine&pct=0.375&ml=20&adr=1&kg=70; read with parseQuery, which only accepts known agents and
   numbers in range). Everything here is MO level: nothing on this page is hidden by the level control. */
import { applyLevel, mountLevelControl } from '../../shared/regional/js/levels.js?v=20261015';
import { mountLaCalc } from '../../shared/regional/js/lacalc.js';
import { parseQuery } from '../../shared/regional/js/la.js';
import { initAppFeel, mountRail, settingsButton } from '../../shared/regional/js/appnav.js?v=20261018';

const BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/></svg>';

function appBar() {
  const bar = document.getElementById('tb-bar');
  bar.className = 'tb-bar lc-bar';
  bar.innerHTML = `<div class="tb-bar-inner site-container">
    <a class="tb-bar-home tb-bar-home--back" href="../" aria-label="Back to Regional blocks">${BACK}<span>Blocks</span></a>
    <p class="lc-bar-title"><span class="lc-bar-t-long">Dose calculator</span><span class="lc-bar-t-short" aria-hidden="true">Calculator</span></p>
    <div class="tb-bar-level"></div>
  </div>`;
  bar.querySelector('.tb-bar-level').before(settingsButton('tb-tool tb-bar-btn is-always'));
  mountLevelControl(bar.querySelector('.tb-bar-level'));
  initAppFeel({ bar });
}

applyLevel();
appBar();
// Desktop (≥ 1024 px): the rail with every region and the tools (no sections of its own to list).
mountRail({ items: [] });
mountLaCalc(document.getElementById('lc-calc'), parseQuery(location.search));
