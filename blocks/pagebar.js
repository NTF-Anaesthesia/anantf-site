/* The app bar of the small screens under /blocks/ (Safety, Indication, Ultrasound): back to the front door, the page's
   name, the level control and, in the app look, the search and Safety buttons (appnav.js adds those). One call per page.
   The same bar as /blocks/calculator/'s, so the pages feel like one app. */
import { mountLevelControl } from '../shared/regional/js/levels.js?v=20261015';
import { initAppFeel, settingsButton } from '../shared/regional/js/appnav.js?v=20261026';

const BACK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5"/></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** pageBar({title, search}) → the bar element. search: opens this page's own search, if it has one. */
export function pageBar({ title, search = null } = {}) {
  const bar = document.getElementById('tb-bar');
  bar.className = 'tb-bar lc-bar';
  bar.innerHTML = `<div class="tb-bar-inner site-container">
    <a class="tb-bar-home tb-bar-home--back" href="../" aria-label="Back to Regional blocks">${BACK}<span>Blocks</span></a>
    <p class="bd-pbar-title">${esc(title)}</p>
    <div class="tb-bar-level"></div>
  </div>`;
  bar.querySelector('.tb-bar-level').before(settingsButton('tb-tool tb-bar-btn is-always'));
  mountLevelControl(bar.querySelector('.tb-bar-level'));
  initAppFeel({ bar, search });
  return bar;
}
