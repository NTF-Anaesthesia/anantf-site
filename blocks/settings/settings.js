/* /blocks/settings/: settings for every regional page, kept on this device (localStorage, read and written in
   try/catch by the modules that own them):
     - the look: Automatic (default) · App look · Website look (skin.js, 'ra-skin'), switching live;
     - level of detail: the same MO · Resident · Consultant control as the app bar (levels.js, 'ra-level');
     - "Hide the bar while scrolling down": off by default (appnav.js, 'ra-autohide');
     - "Press / to search": on by default, can be turned off (appnav.js, 'ra-slash'; WCAG 2.1.4);
     - how to add the app to the home screen (and an Install button where the browser offers one);
     - the app version lines and "Not updating? Get the latest version" (offline.js; also at the foot of /blocks/). */
import { applyLevel, mountLevelControl, onLevel, getLevel, LEVELS, LEVEL_IDS } from '../../shared/regional/js/levels.js?v=20261015';
import { registerOffline, mountAppVersion } from '../../shared/regional/js/offline.js?v=20261016';
import { initAppFeel, mountRail, getAutoHide, setAutoHide, getSlash, setSlash } from '../../shared/regional/js/appnav.js?v=20261026';
import { getSkin, getSkinPref, setSkinPref, onSkin } from '../../shared/regional/js/skin.js?v=20261018';

const $ = (id) => document.getElementById(id);

applyLevel();
const bar = $('tb-bar');
initAppFeel({ bar });
mountRail({ label: 'On this page', items: [['look', 'Look'], ['level', 'Level of detail'], ['bar', 'The bar at the top'], ['keys', 'Keyboard'], ['home', 'Add to home screen'], ['version', 'App version']].map(([id, t]) => ({ href: `#${id}`, text: t, id })), spy: true });

// Look: Automatic (default) | App look | Website look, kept in localStorage 'ra-skin' (skin.js) and applied at once, with no
// reload. A line says which look is showing now, since Automatic depends on how the pages were opened.
const skinInputs = [...document.querySelectorAll('input[name="st-skin"]')];
const looks = $('st-looks');
const paintSkin = () => {
  const pref = getSkinPref();
  for (const i of skinInputs) i.checked = i.value === pref;
  for (const r of looks.children) r.classList.toggle('is-on', r.dataset.skin === pref);
  $('st-skin-now').textContent = `Showing the ${getSkin() === 'app' ? 'app' : 'website'} look now.`;
};
for (const i of skinInputs) i.addEventListener('change', () => { if (i.checked) { setSkinPref(i.value); paintSkin(); } });
onSkin(paintSkin);
addEventListener('storage', paintSkin);
paintSkin();

// Level: the shared control, and what each level shows (the current one marked).
mountLevelControl($('st-level'), { label: false });
const dl = $('st-levels');
for (const id of LEVEL_IDS) {
  const row = document.createElement('div');
  row.dataset.level = id;
  const dt = document.createElement('dt'); dt.textContent = LEVELS[id].name;
  const dd = document.createElement('dd'); dd.textContent = LEVELS[id].desc;
  row.append(dt, dd);
  dl.append(row);
}
const paintLevel = () => { for (const r of dl.children) r.classList.toggle('is-on', r.dataset.level === getLevel()); };
paintLevel();
onLevel(paintLevel);

// Switches (checkboxes with role=switch: the state is read out as on or off).
function wire(input, get, set) {
  input.setAttribute('role', 'switch');
  input.checked = get();
  input.addEventListener('change', () => set(input.checked));
  addEventListener('storage', () => { input.checked = get(); });
}
wire($('st-autohide'), getAutoHide, setAutoHide);
wire($('st-slash'), getSlash, setSlash);

// "Install the app": only where the browser offers it (Chrome, Edge, Android); iPhone and iPad use Share > Add to Home Screen.
let installEvent = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; $('st-install-row').hidden = false; });
$('st-install').addEventListener('click', async () => {
  if (!installEvent) return;
  installEvent.prompt();
  try { await installEvent.userChoice; } catch { /* closed */ }
  installEvent = null;
  $('st-install-row').hidden = true;
});
addEventListener('appinstalled', () => { $('st-install-row').hidden = true; });

mountAppVersion($('ra-appver'));
registerOffline();
document.body.dataset.stReady = 'true';
