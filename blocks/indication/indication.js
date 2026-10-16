/* /blocks/indication/: "Which block for which operation", the operation chooser as a screen of its own (moved here from
   the Index of /blocks/ on 16 Oct 2026). The data and the component are in ../chooser.js (shared with /blocks/'s search);
   no clinical text is written here. Deep links: #chooser (the top of the chooser) and #op-<region>-<id> (opens that
   operation; a bare #op-<id> works when the id is unique). /blocks/#chooser and /blocks/#op-… land here. */
import { applyLevel } from '../../shared/regional/js/levels.js?v=20261015';
import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016';
import { pageBar } from '../pagebar.js?v=20261026';
import { mountChooser, $ } from '../chooser.js?v=20261026';

applyLevel();
pageBar({ title: 'Indication', search: () => { const q = $('#bd-opq'); q.scrollIntoView({ block: 'center' }); q.focus({ preventScroll: true }); } });
const chooser = mountChooser();

function route({ initial = false } = {}) {
  const m = location.hash.match(/^#op-([\w-]+)$/);
  if (m && chooser.open(m[1], { scroll: true, focus: !initial, announce: !initial })) return;
  if (initial && location.hash === '#chooser') requestAnimationFrame(() => document.getElementById('chooser')?.scrollIntoView({ block: 'start', behavior: 'auto' }));
}
route({ initial: true });
addEventListener('hashchange', () => route());
document.body.dataset.bdReady = 'true';
registerOffline();
