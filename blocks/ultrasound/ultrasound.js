/* /blocks/ultrasound/: "Ultrasound anatomy", an index of every ultrasound-guided block, grouped by region. Each row has the
   block's title (registry.js), one line on what the scan shows (the first sentence of its scene's own view text, or the
   scene title: the scene data on each block page), a small thumbnail of the real scan where an open-licence image exists
   (shared/us/<region>/sources.json, via realscan.js), and links to the block's scan teacher on its page (#<block>-scan).
   The Neuraxial group lists the real scans of spinal/ by view (the sources.json captions). No clinical text is written
   here; credits and licences are shown under each image in the scan teacher. */
import { applyLevel } from '../../shared/regional/js/levels.js?v=20261015';
import { registerOffline } from '../../shared/regional/js/offline.js?v=20261016';
import { REGIONS, blocksIn } from '../../shared/regional/js/registry.js';
import { loadRealScans } from '../../shared/regional/js/realscan.js';
import { pageBar } from '../pagebar.js?v=20261026';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (h) => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.replace(/\s+/g, ' ').trim(); };
const firstSentence = (t) => { const s = strip(t); const m = s.match(/^.*?[a-z0-9)”’"]\.(?=\s+[A-Z]|$)/); return (m ? m[0] : s); };
const ENGINE_DIR = /^\/((?:truncal|head-neck|lower-limb|upper-limb)\/[a-z-]+)\//;

applyLevel();
pageBar({ title: 'Ultrasound' }); // no search of its own: the bar's search button goes to the search box on /blocks/
registerOffline();

const host = $('#us-list');
const jump = $('#us-jump');

/** The engine pages' block data (one module per page), by block id. */
async function loadBlocks() {
  const dirs = new Set();
  for (const r of REGIONS) for (const b of blocksIn(r.id)) { const m = String(b.url).match(ENGINE_DIR); if (m) dirs.add(m[1]); }
  const byId = new Map();
  await Promise.all([...dirs].map(async (d) => {
    try { const m = await import(`../../${d}/js/blocks.js`); for (const b of m.BLOCKS || []) if (b?.id && b.scene) byId.set(b.id, b); } catch (err) { console.error(`[ultrasound] ${d} failed to load`, err); }
  }));
  return byId;
}

const rowHtml = (r) => `<li><a class="us-row" href="${esc(r.href)}">
  ${r.thumb ? `<img class="us-thumb" src="${esc(r.thumb.src)}" alt="${esc(r.thumb.alt || '')}" width="96" height="72" loading="lazy" decoding="async">` : '<span class="us-thumb us-thumb--none" aria-hidden="true"></span>'}
  <span class="us-body"><span class="us-t">${esc(r.title)}</span>${r.line ? `<span class="us-l">${esc(r.line)}</span>` : ''}</span>
  <span class="us-go" aria-hidden="true">→</span></a></li>`;

async function build() {
  const byId = await loadBlocks();
  const groups = [];
  for (const r of REGIONS) {
    const rows = [];
    if (r.id === 'neuraxial') {
      // spinal/ has no scan teacher of its own: its real scans (by view) are at #us-real.
      const list = await fetch(new URL('../../shared/us/neuraxial/sources.json', import.meta.url)).then((x) => x.json()).catch(() => []);
      const seen = new Set();
      for (const e of list) {
        if (!e.blockId || seen.has(e.blockId)) continue;
        seen.add(e.blockId);
        const cap = strip(e.caption || e.alt || '');
        const i = cap.indexOf(':');
        rows.push({ title: i > 0 ? cap.slice(0, i) : cap, line: i > 0 ? cap.slice(i + 1).trim().replace(/^./, (c) => c.toUpperCase()) : '', href: '../../spinal/#us-real', thumb: { src: new URL(`../../shared/us/neuraxial/${e.file}`, import.meta.url).href, alt: e.alt } });
      }
    } else {
      const entries = blocksIn(r.id).filter((e) => byId.has(e.id) && byId.get(e.id).scene.image !== 'diagram');
      const scans = await Promise.all(entries.map((e) => loadRealScans(e.id, byId.get(e.id).scene)));
      entries.forEach((e, i) => {
        const sc = byId.get(e.id).scene;
        const im = scans[i][0];
        rows.push({ title: e.title, line: firstSentence(sc.view || sc.title), href: `../..${String(e.url).split('#')[0]}#${e.id}-scan`, thumb: im ? { src: im.src, alt: im.alt } : null });
      });
    }
    if (rows.length) groups.push({ r, rows });
  }
  jump.innerHTML = groups.map(({ r }) => `<a class="us-jump-a" href="#us-${r.id}">${esc(r.title)}</a>`).join('');
  host.innerHTML = groups.map(({ r, rows }) => `<section class="us-region" id="us-${r.id}" aria-labelledby="us-${r.id}-h">
    <h2 class="us-h" id="us-${r.id}-h">${esc(r.title)} <span class="us-n">${rows.length}</span></h2>
    <ul class="us-list">${rows.map(rowHtml).join('')}</ul></section>`).join('');
  host.setAttribute('aria-busy', 'false');
  document.body.dataset.usReady = 'true';
  if (location.hash.length > 1) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'auto' });
}
build().catch((err) => { console.error('[ultrasound] failed', err); host.innerHTML = '<p class="bd-note">The list could not be built. Reload the page, or start from <a href="../">the contents</a>.</p>'; host.setAttribute('aria-busy', 'false'); });
