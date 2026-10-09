// Bone-contact redirect guide: original schematic SVG, drawn by the page.
// Two views side by side (side view and cross-section) for midline/paramedian × shallow/deep bone.
// Uses the plate tokens (--an-*), which are the same in light and dark themes.
import { el, figure, segmented, cite } from '../ui.js?v=1';
import { numberCites } from './tree.js';

const NS = 'http://www.w3.org/2000/svg';
const W = 340;
const H = 290;
let gid = 0;

function s(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  kids.forEach((k) => n.append(k));
  return n;
}
const v = (name) => `var(${name})`;

// Inter label pill with optional leader line. kind: 'plain' | 'warn' | 'cue'
function pill(g, x, y, text, kind = 'plain', leader) {
  const glyph = kind === 'warn' ? '× ' : kind === 'cue' ? '✓ ' : '';
  const t = glyph + text;
  const w = Math.round(t.length * 6.7 + 18);
  const h = 22;
  const px = Math.max(4, Math.min(W - w - 4, x));
  const py = Math.max(4, Math.min(H - h - 4, y));
  if (leader) {
    const cx = Math.max(px, Math.min(px + w, leader[0]));
    const cy = leader[1] < py ? py : leader[1] > py + h ? py + h : py + h / 2;
    g.append(s('line', { x1: leader[0], y1: leader[1], x2: cx, y2: cy, stroke: v('--an-ink'), 'stroke-width': 1, 'stroke-opacity': 0.75 }));
    g.append(s('circle', { cx: leader[0], cy: leader[1], r: 2.2, fill: v('--an-ink') }));
  }
  const fill = kind === 'warn' ? v('--an-warn') : kind === 'cue' ? v('--an-cue') : v('--an-pill');
  const ink = kind === 'plain' ? v('--an-ink') : '#ffffff';
  g.append(s('rect', { x: px, y: py, width: w, height: h, rx: 11, fill, stroke: kind === 'plain' ? v('--an-ink') : 'none', 'stroke-width': 0.8, 'stroke-opacity': 0.5 }));
  const tx = s('text', { x: px + w / 2, y: py + 15, 'text-anchor': 'middle', fill: ink, 'font-family': "'NTF Sans', Inter, Arial, sans-serif", 'font-size': 12, 'font-weight': 500 });
  tx.textContent = t;
  g.append(tx);
}

function tissueLabel(g, x, y, text, anchor = 'start') {
  const t = s('text', { x, y, 'text-anchor': anchor, fill: v('--an-ink'), 'font-family': "'NTF Serif', Fraunces, Georgia, serif", 'font-style': 'italic', 'font-size': 13 });
  t.textContent = text;
  g.append(t);
}

function needle(g, x1, y1, x2, y2) {
  g.append(s('line', { x1, y1, x2, y2, stroke: v('--an-needle-edge'), 'stroke-width': 4.6, 'stroke-linecap': 'butt' }));
  g.append(s('line', { x1, y1, x2, y2, stroke: v('--an-needle'), 'stroke-width': 2.6, 'stroke-linecap': 'butt' }));
  // hub
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x1 - Math.cos(a) * 2;
  const hy = y1 - Math.sin(a) * 2;
  g.append(s('rect', { x: hx - 6, y: hy - 7, width: 12, height: 9, fill: v('--an-needle'), stroke: v('--an-needle-edge'), 'stroke-width': 1.2, transform: `rotate(${(a * 180) / Math.PI - 90} ${hx} ${hy})` }));
}

function contact(g, x, y) {
  const d = 6;
  g.append(s('path', { d: `M${x - d} ${y - d}L${x + d} ${y + d}M${x + d} ${y - d}L${x - d} ${y + d}`, stroke: '#ffffff', 'stroke-width': 5, 'stroke-linecap': 'square' }));
  g.append(s('path', { d: `M${x - d} ${y - d}L${x + d} ${y + d}M${x + d} ${y - d}L${x - d} ${y + d}`, stroke: v('--an-warn'), 'stroke-width': 2.6, 'stroke-linecap': 'square' }));
}

function redirect(g, x1, y1, x2, y2, markerId) {
  g.append(s('line', { x1, y1, x2, y2, stroke: v('--an-cue'), 'stroke-width': 2.4, 'stroke-dasharray': '7 5', 'marker-end': `url(#${markerId})` }));
}

function defs(svg) {
  gid += 1;
  const id = `ts-arrow-${gid}`;
  svg.append(s('defs', {}, s('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
    s('path', { d: 'M0 0L10 5L0 10z', fill: v('--an-cue') }))));
  return id;
}

const stroke = { stroke: v('--an-ink'), 'stroke-width': 1.5, 'stroke-linejoin': 'round' };

// ---------------------------------------------------------------- side view (sagittal / parasagittal)
function sideView(g, plane) {
  // skin, fat
  g.append(s('rect', { x: 0, y: 18, width: W, height: 8, fill: v('--an-skin'), ...stroke }));
  g.append(s('rect', { x: 0, y: 26, width: W, height: 20, fill: v('--an-fat') }));
  if (plane === 'mid') {
    g.append(s('rect', { x: 0, y: 46, width: W, height: 6, fill: v('--an-lig-supra'), ...stroke, 'stroke-width': 1 }));
    g.append(s('path', { d: 'M138 52H202V100L190 138H146L138 112Z', fill: v('--an-lig-inter') }));
    g.append(s('path', { d: 'M0 52H128Q138 52 138 64V112L146 150H0Z', fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
    g.append(s('path', { d: 'M340 52H212Q202 52 202 64V100L190 150H340Z', fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
    g.append(s('rect', { x: 145, y: 137, width: 46, height: 13, fill: v('--an-flavum'), ...stroke, 'stroke-width': 1 }));
  } else {
    g.append(s('rect', { x: 0, y: 46, width: W, height: 64, fill: v('--an-skin'), 'fill-opacity': 0.45 }));
    g.append(s('path', { d: 'M0 108H100L152 134L148 150H0Z', fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
    g.append(s('path', { d: 'M194 150L204 122L340 110V150Z', fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
    g.append(s('path', { d: 'M152 134L204 122L194 150H148Z', fill: v('--an-flavum'), ...stroke, 'stroke-width': 1 }));
    tissueLabel(g, 8, 76, 'paraspinal muscle');
  }
  // epidural fat, dura, CSF, roots, anterior dura, bodies
  g.append(s('rect', { x: 0, y: 150, width: W, height: 12, fill: v('--an-epifat') }));
  g.append(s('rect', { x: 0, y: 162, width: W, height: 50, fill: v('--an-csf') }));
  for (let i = 0; i < 4; i += 1) {
    const y = 172 + i * 10;
    g.append(s('path', { d: `M0 ${y}C80 ${y - 3} 160 ${y + 3} 240 ${y}S340 ${y - 2} 340 ${y}`, fill: 'none', stroke: v('--an-root-line'), 'stroke-width': 1.1, 'stroke-opacity': 0.8 }));
  }
  g.append(s('line', { x1: 0, y1: 162, x2: W, y2: 162, stroke: v('--an-dura'), 'stroke-width': 2.5 }));
  g.append(s('line', { x1: 0, y1: 212, x2: W, y2: 212, stroke: v('--an-dura'), 'stroke-width': 2.5 }));
  g.append(s('rect', { x: -2, y: 218, width: 152, height: 80, fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
  g.append(s('rect', { x: 190, y: 218, width: 152, height: 80, fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
  g.append(s('rect', { x: 150, y: 220, width: 40, height: 76, fill: v('--an-lig-inter') }));
  tissueLabel(g, 330, 196, 'CSF', 'end');
  tissueLabel(g, 70, 262, 'vertebral body', 'middle');
  const o = s('text', { x: 6, y: 12, fill: v('--an-ink'), 'font-family': "'NTF Mono', ui-monospace, monospace", 'font-size': 10 });
  o.textContent = '← HEAD';
  const o2 = s('text', { x: W - 6, y: 12, 'text-anchor': 'end', fill: v('--an-ink'), 'font-family': "'NTF Mono', ui-monospace, monospace", 'font-size': 10 });
  o2.textContent = 'FEET →';
  g.append(o, o2);
}

// ---------------------------------------------------------------- cross-section (axial, at the interspace)
function crossView(g, showSp) {
  g.append(s('rect', { x: 0, y: 18, width: W, height: 8, fill: v('--an-skin'), ...stroke }));
  g.append(s('rect', { x: 0, y: 26, width: W, height: 20, fill: v('--an-fat') }));
  g.append(s('path', { d: 'M20 46H150V112L100 132L60 150H20Z', fill: v('--an-skin'), 'fill-opacity': 0.45 }));
  g.append(s('path', { d: 'M320 46H190V112L240 132L280 150H320Z', fill: v('--an-skin'), 'fill-opacity': 0.45 }));
  g.append(s('rect', { x: 150, y: 46, width: 40, height: 6, fill: v('--an-lig-supra') }));
  g.append(s('rect', { x: 150, y: 52, width: 40, height: 60, fill: v('--an-lig-inter') }));
  // vertebral body and pedicles
  g.append(s('ellipse', { cx: 170, cy: 240, rx: 76, ry: 42, fill: v('--an-bone'), ...stroke, stroke: v('--an-cortex'), 'stroke-width': 2 }));
  const thick = (d, w) => {
    g.append(s('path', { d, fill: 'none', stroke: v('--an-cortex'), 'stroke-width': w + 3, 'stroke-linecap': 'round' }));
    g.append(s('path', { d, fill: 'none', stroke: v('--an-bone'), 'stroke-width': w, 'stroke-linecap': 'round' }));
  };
  thick('M104 158L130 196', 14);
  thick('M236 158L210 196', 14);
  thick('M86 152L36 160', 11);
  thick('M254 152L304 160', 11);
  // epidural fat + dural sac
  g.append(s('ellipse', { cx: 170, cy: 158, rx: 50, ry: 40, fill: v('--an-epifat') }));
  g.append(s('circle', { cx: 170, cy: 160, r: 30, fill: v('--an-csf'), stroke: v('--an-dura'), 'stroke-width': 2.5 }));
  [[160, 168], [172, 172], [182, 164], [166, 178], [178, 180], [156, 158]].forEach(([x, y]) => g.append(s('circle', { cx: x, cy: y, r: 3, fill: v('--an-root'), stroke: v('--an-root-line'), 'stroke-width': 1 })));
  // laminae, facets, flavum
  thick('M148 116L94 144', 12);
  thick('M192 116L246 144', 12);
  g.append(s('circle', { cx: 88, cy: 150, r: 11, fill: v('--an-bone'), stroke: v('--an-cortex'), 'stroke-width': 2 }));
  g.append(s('circle', { cx: 252, cy: 150, r: 11, fill: v('--an-bone'), stroke: v('--an-cortex'), 'stroke-width': 2 }));
  g.append(s('path', { d: 'M146 116H194', stroke: v('--an-ink'), 'stroke-width': 10, 'stroke-linecap': 'butt' }));
  g.append(s('path', { d: 'M147 116H193', stroke: v('--an-flavum'), 'stroke-width': 7.5, 'stroke-linecap': 'butt' }));
  if (showSp) {
    g.append(s('rect', { x: 158, y: 52, width: 24, height: 62, fill: 'none', stroke: v('--an-ink'), 'stroke-width': 1.3, 'stroke-dasharray': '4 3' }));
  }
  tissueLabel(g, 170, 268, 'vertebral body', 'middle');
  tissueLabel(g, 26, 70, 'muscle');
  const o = s('text', { x: 6, y: 12, fill: v('--an-ink'), 'font-family': "'NTF Mono', ui-monospace, monospace", 'font-size': 10 });
  o.textContent = 'SKIN (BACK) ↑';
  g.append(o);
}

// ---------------------------------------------------------------- states
export const STATES = {
  'mid-shallow': {
    structure: 'A spinous process (of the vertebra above or below)',
    why: 'You are in the midline, but the angle misses the gap between the spinous processes.',
    fix: `Withdraw to the subcutaneous tissue, then angle slightly more cephalad: the commonest correction. If you were already angled steeply up, try slightly caudad.${cite('ts-nysora-failed')}`,
    more: 'Re-feel the interspace, improve flexion, or try the space above or below.',
    side(g, m) { needle(g, 182, 6, 202, 66); contact(g, 202, 66); redirect(g, 182, 24, 167, 190, m); pill(g, 214, 64, 'Spinous process', 'warn', [204, 70]); pill(g, 16, 76, 'More cephalad', 'cue', [176, 116]); tissueLabel(g, 152, 132, 'flavum', 'end'); },
    cross(g, m) { needle(g, 170, 6, 170, 60); contact(g, 170, 60); redirect(g, 170, 64, 170, 150, m); pill(g, 196, 56, 'Spinous process (above/below)', 'warn', [176, 64]); pill(g, 200, 90, 'Side-to-side line OK', 'cue', [172, 100]); },
    showSp: true,
  },
  'mid-deep': {
    structure: 'A lamina, beside the midline',
    why: 'Bone near the expected depth suggests the needle has drifted off the midline onto a lamina.',
    fix: `Withdraw to the subcutaneous tissue. Check the back is square and not rotated, re-feel the midline, ask which side the patient feels the needle, and aim back towards the midline.${cite('ts-nysora-failed')}`,
    more: 'Paramedian approach, ultrasound, or senior help.',
    side(g, m) { needle(g, 172, 6, 170, 134); contact(g, 170, 134); redirect(g, 172, 24, 169, 190, m); pill(g, 196, 96, 'Bone at flavum depth', 'warn', [176, 134]); pill(g, 8, 112, 'Back on the midline', 'cue', [167, 176]); },
    cross(g, m) { needle(g, 174, 6, 211, 120); contact(g, 211, 120); redirect(g, 174, 24, 170, 150, m); pill(g, 222, 96, 'Lamina', 'warn', [214, 122]); pill(g, 18, 92, 'Back to the midline', 'cue', [171, 104]); },
    showSp: false,
  },
  'para-shallow': {
    structure: 'Usually the side of a spinous process, if the needle is angled too far medially (or the lamina in a thin patient)',
    why: 'Bone much earlier than expected means the needle isn’t where you think. A steep medial angle reaches the midline bone early.',
    fix: 'Withdraw to the subcutaneous tissue, re-check the entry point and reduce the medial angle, then advance until you meet the lamina at the expected depth.',
    more: 'Ultrasound pre-scan, or senior help.',
    side(g, m) { needle(g, 262, 6, 242, 78); contact(g, 242, 78); g.append(s('rect', { x: 220, y: 50, width: 70, height: 56, fill: 'none', stroke: v('--an-ink'), 'stroke-width': 1.3, 'stroke-dasharray': '4 3' })); pill(g, 112, 52, 'Spinous process (medial)', 'warn', [238, 76]); pill(g, 196, 262, 'Fix: see cross-section', 'cue'); tissueLabel(g, 160, 146, 'flavum', 'end'); },
    cross(g, m) { needle(g, 232, 6, 183, 78); contact(g, 183, 78); redirect(g, 232, 24, 178, 154, m); pill(g, 196, 58, 'Spinous process', 'warn', [184, 74]); pill(g, 236, 96, 'Less medial', 'cue', [204, 104]); },
    showSp: true,
  },
  'para-deep': {
    structure: 'The lamina, as expected',
    why: 'The paramedian path aims at the interlaminar space. Meeting the lamina first is common, and tells you the depth.',
    fix: 'Walk the needle off the upper edge of the lamina in small, separate steps: a little more cephalad first, then a little more medial if needed.',
    more: 'Re-check the entry point (about 1 cm from the midline), or use ultrasound.',
    side(g, m) { needle(g, 262, 6, 236, 118); contact(g, 236, 118); redirect(g, 262, 24, 160, 195, m); pill(g, 250, 78, 'Lamina', 'warn', [240, 116]); pill(g, 16, 92, 'Off the upper edge', 'cue', [180, 162]); tissueLabel(g, 150, 128, 'flavum', 'end'); },
    cross(g, m) { needle(g, 222, 6, 203, 118); contact(g, 203, 118); redirect(g, 222, 24, 176, 152, m); pill(g, 230, 90, 'Lamina', 'warn', [206, 118]); pill(g, 18, 92, 'A little more medial', 'cue', [184, 108]); },
    showSp: false,
  },
};

/** Build the guide. Returns {fig, set(key)} where key is e.g. 'mid-shallow'. */
export function redirectGuide({ id = 'ts-bone-guide', num = '4.1' } = {}) {
  const f = figure({ id, num, title: 'Bone contact: where am I, and which way do I go?', caption: 'Schematic, not to scale. Left: side view (head to the left). Right: cross-section through the interspace. Solid line: where the needle went. ×: the bone it met. Dashed arrow: the redirect.', plate: 'paper', aspect: 'auto' });
  let approach = 'mid';
  let depth = 'shallow';

  const sideSvg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', class: 'ts-guide-svg' });
  const crossSvg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', class: 'ts-guide-svg' });
  const sideM = defs(sideSvg);
  const crossM = defs(crossSvg);
  const sideG = s('g');
  const crossG = s('g');
  sideSvg.append(sideG);
  crossSvg.append(crossG);
  const sideCap = el('p', { class: 'ts-guide-view', text: 'Side view' });
  const crossCap = el('p', { class: 'ts-guide-view', text: 'Cross-section' });
  f.stage.append(el('div', { class: 'ts-guide-views' }, el('div', { class: 'ts-guide-pane' }, sideCap, sideSvg), el('div', { class: 'ts-guide-pane' }, crossCap, crossSvg)));

  const read = el('dl', { class: 'ts-guide-read', 'aria-live': 'off' });

  const segA = segmented([{ value: 'mid', label: 'Midline' }, { value: 'para', label: 'Paramedian' }], { label: 'Approach', value: approach, onChange: (x) => { approach = x; draw(true); } });
  const segD = segmented([{ value: 'shallow', label: 'Shallow bone' }, { value: 'deep', label: 'Deep bone' }], { label: 'Depth of bone contact', value: depth, onChange: (x) => { depth = x; draw(true); } });
  f.controls.append(
    el('div', { class: 'ts-guide-ctl' }, el('span', { class: 'ts-guide-ctl-l', 'aria-hidden': 'true', text: 'Approach' }), segA),
    el('div', { class: 'ts-guide-ctl' }, el('span', { class: 'ts-guide-ctl-l', 'aria-hidden': 'true', text: 'Bone contact' }), segD),
  );
  f.fig.insertBefore(read, f.caption);

  function draw(announceIt) {
    const key = `${approach}-${depth}`;
    const st = STATES[key];
    sideG.textContent = '';
    crossG.textContent = '';
    sideView(sideG, approach);
    crossView(crossG, st.showSp);
    st.side(sideG, sideM);
    st.cross(crossG, crossM);
    sideCap.textContent = approach === 'mid' ? 'Side view, in the midline' : 'Side view, about 1 cm from the midline';
    const plain = (h) => h.replace(/<sup[\s\S]*?<\/sup>/g, '').replace(/<[^>]+>/g, '');
    sideSvg.setAttribute('aria-label', `${sideCap.textContent}. ${approach === 'mid' ? 'Midline' : 'Paramedian'} approach, ${depth} bone: likely ${st.structure.toLowerCase()}.`);
    crossSvg.setAttribute('aria-label', `Cross-section. Redirect: ${plain(st.fix)}`);
    read.innerHTML = '';
    const row = (dt, dd) => read.append(el('div', { class: 'ts-guide-row' }, el('dt', { text: dt }), el('dd', { html: dd })));
    row('Likely structure', st.structure);
    row('Why', st.why);
    row('Redirect', st.fix);
    row('If it keeps happening', st.more);
    numberCites(read);
    if (announceIt) f.describe(`${approach === 'mid' ? 'Midline' : 'Paramedian'}, ${depth} bone. Likely ${st.structure}. ${plain(st.fix)}`);
  }

  draw(false);
  return {
    fig: f.fig,
    set(key) {
      const [a, d] = key.split('-');
      if (!STATES[key]) return;
      approach = a; depth = d;
      segA.set(a); segD.set(d);
      draw(true);
    },
  };
}
