// Original SVG drawings for the technique section. Owner: B3.
// Posture, approach and needle drawings sit on the light "printed plate" (same in both themes, --an-* tokens).
// The time-course chart follows the page theme (--sp-* tokens through classes in technique.css).

const NS = 'http://www.w3.org/2000/svg';

/** Build an <svg> from an inner markup string. */
function svg(viewBox, inner, label) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('role', 'img');
  s.setAttribute('aria-label', label);
  s.setAttribute('class', 'tq-svg');
  s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  s.innerHTML = inner;
  return s;
}

// Limbs and trunk drawn as thick round-capped strokes with an ink outline. All outlines go down first and
// all fills on top, so joints merge into one silhouette. parts: [[d, width], ...]
function body(parts) {
  const ink = parts.map(([d, w]) => `<path d="${d}" fill="none" stroke="var(--an-ink)" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const skin = parts.map(([d, w]) => `<path d="${d}" fill="none" stroke="var(--an-skin)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  return ink + skin;
}
const limb = (d, w = 20) => body([[d, w]]);

// Label pill with a leader line to (tx, ty). Anchor is the pill's left or right edge.
function pill(x, y, text, { tx, ty, align = 'left', kind = 'plain' } = {}) {
  const w = Math.round(text.length * 7.1 + 18);
  const h = 24;
  const x0 = align === 'right' ? x - w : x;
  const lead = tx != null
    ? `<line x1="${align === 'right' ? x0 + w : x0}" y1="${y}" x2="${tx}" y2="${ty}" stroke="var(--an-ink)" stroke-width="1"/><circle cx="${tx}" cy="${ty}" r="2.6" fill="var(--an-ink)"/>`
    : '';
  const fill = kind === 'cue' ? 'var(--an-cue)' : 'var(--an-pill)';
  const ink = kind === 'cue' ? '#ffffff' : 'var(--an-ink)';
  return `${lead}<rect x="${x0}" y="${y - h / 2}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="var(--an-ink)" stroke-width="1"/>`
    + `<text x="${x0 + w / 2}" y="${y + 4.5}" text-anchor="middle" class="tq-svg-pill" fill="${ink}">${text}</text>`;
}

// ------------------------------------------------------------------ sitting posture (side view)
export function sittingSvg() {
  const inner = `
  <rect x="0" y="0" width="420" height="300" fill="var(--an-plate)"/>
  <line x1="20" y1="276" x2="400" y2="276" stroke="var(--an-cortex)" stroke-width="1.5"/>
  <!-- trolley -->
  <rect x="168" y="176" width="200" height="12" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <line x1="190" y1="188" x2="190" y2="276" stroke="var(--an-ink)" stroke-width="2"/>
  <line x1="346" y1="188" x2="346" y2="276" stroke="var(--an-ink)" stroke-width="2"/>
  <!-- stool -->
  <rect x="84" y="250" width="70" height="9" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <line x1="92" y1="259" x2="92" y2="276" stroke="var(--an-ink)" stroke-width="2"/>
  <line x1="146" y1="259" x2="146" y2="276" stroke="var(--an-ink)" stroke-width="2"/>
  ${body([['M226 160 L160 166 L128 238', 22], ['M128 238 L104 243', 10], ['M228 158 C 262 128, 236 82, 196 70', 36]])}
  <!-- pillow -->
  <ellipse cx="160" cy="128" rx="24" ry="34" fill="var(--an-fat)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <!-- head, chin on chest -->
  <circle cx="168" cy="66" r="22" fill="var(--an-skin)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <!-- arm hugging the pillow -->
  ${limb('M196 82 L170 120 L148 140', 12)}
  <!-- lumbar spine highlight -->
  <path d="M258 140 C 266 118, 252 90, 222 72" fill="none" stroke="var(--an-flavum)" stroke-width="4" stroke-dasharray="7 5" stroke-linecap="round"/>
  ${pill(300, 64, 'Chin to chest', { tx: 178, ty: 84, align: 'left' })}
  ${pill(300, 108, 'Back pushed out', { tx: 262, ty: 116, align: 'left', kind: 'cue' })}
  ${pill(26, 120, 'Hug a pillow', { tx: 146, ty: 122, align: 'left' })}
  ${pill(26, 226, 'Feet on a stool', { tx: 118, ty: 248, align: 'left' })}
  ${pill(254, 214, 'Upright, not leaning', { tx: 240, ty: 162, align: 'left' })}
  `;
  return svg('0 0 420 300', inner, 'Drawing of a patient sitting on the edge of a trolley for a spinal: feet on a stool, hugging a pillow, chin on chest, lower back pushed out towards the anaesthetist.');
}

// ------------------------------------------------------------------ lateral posture (seen from above)
export function lateralSvg() {
  const inner = `
  <rect x="0" y="0" width="420" height="300" fill="var(--an-plate)"/>
  <!-- trolley seen from above; near edge (operator side) at the bottom -->
  <rect x="34" y="40" width="352" height="214" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <line x1="34" y1="254" x2="386" y2="254" stroke="var(--an-ink)" stroke-width="3"/>
  <!-- pillow -->
  <rect x="54" y="132" width="62" height="70" rx="14" fill="var(--an-fat)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <!-- trunk along the trolley edge, thighs drawn up to the chest, shins back towards the buttocks, arm round the knees -->
  ${body([['M300 206 C 252 244, 176 242, 136 198', 40], ['M300 200 L228 118', 24], ['M228 118 L318 124', 20], ['M164 200 L210 140', 12]])}
  <!-- head tucked down -->
  <circle cx="114" cy="164" r="24" fill="var(--an-skin)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <!-- spine along the back -->
  <path d="M294 226 C 250 256, 182 254, 142 216" fill="none" stroke="var(--an-flavum)" stroke-width="4" stroke-dasharray="7 5" stroke-linecap="round"/>
  ${pill(392, 24, 'Knees to chest', { tx: 236, ty: 124, align: 'right' })}
  ${pill(26, 24, 'Chin down', { tx: 112, ty: 150, align: 'left' })}
  ${pill(392, 282, 'Back flush with trolley edge', { tx: 240, ty: 254, align: 'right', kind: 'cue' })}
  ${pill(26, 282, 'No rotation', { tx: 140, ty: 224, align: 'left' })}
  `;
  return svg('0 0 420 300', inner, 'Drawing of a patient lying on their side, seen from above: back level with the trolley edge, knees drawn up to the chest, chin down, shoulders and hips stacked vertically.');
}

// ------------------------------------------------------------------ approach (posterior view of one interspace)
export function approachSvg() {
  // Two vertebral arches seen from behind; the interlaminar window (ligamentum flavum) between them.
  const inner = `
  <rect x="0" y="0" width="480" height="320" fill="var(--an-plate)"/>
  <g class="tq-ap-bone">
    <!-- upper vertebra: laminae + transverse processes -->
    <path d="M140 40 L340 40 L360 96 L282 128 L198 128 L120 96 Z" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
    <rect x="58" y="62" width="74" height="18" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
    <rect x="348" y="62" width="74" height="18" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
    <!-- lower vertebra -->
    <path d="M120 214 L198 194 L282 194 L360 214 L340 290 L140 290 Z" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
    <rect x="58" y="232" width="74" height="18" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
    <rect x="348" y="232" width="74" height="18" fill="var(--an-bone)" stroke="var(--an-cortex)" stroke-width="2"/>
  </g>
  <!-- interlaminar window: ligamentum flavum -->
  <path d="M198 128 L282 128 L340 168 L282 194 L198 194 L140 168 Z" fill="var(--an-flavum)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <!-- spinous processes (drawn over the midline) -->
  <rect x="222" y="20" width="36" height="120" fill="var(--an-lig-supra)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <rect x="222" y="186" width="36" height="118" fill="var(--an-lig-supra)" stroke="var(--an-ink)" stroke-width="1.5"/>
  <line x1="240" y1="8" x2="240" y2="314" stroke="var(--an-ink)" stroke-width="1" stroke-dasharray="3 5" opacity=".6"/>
  <text x="240" y="314" text-anchor="middle" class="tq-svg-small" fill="var(--an-ink)">midline</text>
  <!-- midline entry -->
  <g class="tq-ap-mid">
    <circle cx="240" cy="164" r="9" fill="none" stroke="var(--an-warn)" stroke-width="2.5"/>
    <circle cx="240" cy="164" r="2.5" fill="var(--an-warn)"/>
  </g>
  <!-- paramedian entry and direction -->
  <g class="tq-ap-para">
    <circle cx="300" cy="206" r="9" fill="none" stroke="var(--an-warn)" stroke-width="2.5"/>
    <circle cx="300" cy="206" r="2.5" fill="var(--an-warn)"/>
    <path d="M296 198 L252 162" stroke="var(--an-warn)" stroke-width="2.5" fill="none"/>
    <path d="M252 162 L266 164 M252 162 L256 175" stroke="var(--an-warn)" stroke-width="2.5" fill="none" stroke-linecap="square"/>
  </g>
  <g class="tq-ap-label-mid">${pill(470, 150, 'Middle of the gap', { tx: 250, ty: 164, align: 'right', kind: 'cue' })}</g>
  <g class="tq-ap-label-para">${pill(470, 262, 'Just lateral and caudal; aim medially and up', { tx: 306, ty: 214, align: 'right', kind: 'cue' })}</g>
  ${pill(12, 140, 'Ligamentum flavum', { tx: 160, ty: 168, align: 'left' })}
  ${pill(12, 24, 'Spinous process', { tx: 222, ty: 40, align: 'left' })}
  ${pill(12, 298, 'Lamina', { tx: 160, ty: 268, align: 'left' })}
  `;
  return svg('0 0 480 320', inner, 'Back view of one lumbar interspace');
}

// ------------------------------------------------------------------ needle tips
export function needlesSvg() {
  const inner = `
  <rect x="0" y="0" width="560" height="270" fill="var(--an-plate)"/>
  <defs>
    <linearGradient id="tq-steel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9dce2"/><stop offset=".5" stop-color="var(--an-needle)"/><stop offset="1" stop-color="#7d828c"/>
    </linearGradient>
  </defs>
  <text x="24" y="34" class="tq-svg-title" fill="var(--an-ink)">Cutting (Quincke)</text>
  <path d="M24 56 L360 56 L470 84 L24 84 Z" fill="url(#tq-steel)" stroke="var(--an-needle-edge)" stroke-width="1.5" stroke-linejoin="miter"/>
  <ellipse cx="413" cy="70" rx="46" ry="7" transform="rotate(14.3 413 70)" fill="#3a3c42"/>
  ${pill(540, 118, 'Opening on the bevel; sharp tip', { tx: 464, ty: 82, align: 'right', kind: 'cue' })}

  <text x="24" y="160" class="tq-svg-title" fill="var(--an-ink)">Pencil-point (e.g. Whitacre)</text>
  <path d="M24 186 L410 186 C 444 186, 466 194, 482 200 C 466 206, 444 214, 410 214 L24 214 Z" fill="url(#tq-steel)" stroke="var(--an-needle-edge)" stroke-width="1.5"/>
  <rect x="370" y="186" width="32" height="11" rx="5" fill="#3a3c42"/>
  ${pill(540, 156, 'Side opening behind the tip', { tx: 386, ty: 190, align: 'right', kind: 'cue' })}
  ${pill(540, 248, 'Closed, conical tip', { tx: 478, ty: 202, align: 'right' })}
  `;
  return svg('0 0 560 270', inner, 'Drawing of two spinal needle tips. A Quincke cutting needle has a sharp bevel with the opening on the bevel face. A pencil-point needle has a closed conical tip with a side opening just behind it.');
}

// ------------------------------------------------------------------ time course (theme-aware, drawn at container width)
/**
 * Timeline for hyperbaric bupivacaine 0.5%. Two-scale axis: 0–30 min expanded, 30–210 min compressed.
 * width: CSS px of the container. Returns an <svg>.
 */
export function timelineSvg(width) {
  const W = Math.max(300, Math.round(width));
  const narrow = W < 560;
  const padL = 14;
  const padR = 18;
  const split = padL + (W - padL - padR) * (narrow ? 0.46 : 0.42);
  const end = W - padR;
  const x = (t) => (t <= 30 ? padL + (t / 30) * (split - padL) : split + ((t - 30) / 180) * (end - split));
  const rowH = 54;
  const top = 26;
  const rows = [
    { y: top, label: 'Onset of block: 5–8 min' },
    { y: top + rowH, label: 'Level still moving: settles by about 20 min' },
    { y: top + rowH * 2, label: 'Surgical block: about 1.5–3 h (dose and site)' },
  ];
  const axisY = top + rowH * 3 + 8;
  const H = axisY + 78;
  const band = (t0, t1, y, cls) => `<rect x="${x(t0)}" y="${y + 18}" width="${Math.max(2, x(t1) - x(t0))}" height="14" class="${cls}"/>`;
  let s = '';
  s += `<defs><pattern id="tq-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="tq-tl-hatch-bg"/><line x1="0" y1="0" x2="0" y2="6" class="tq-tl-hatch-line" stroke-width="3"/></pattern></defs>`;
  rows.forEach((r) => { s += `<text x="${padL + 8}" y="${r.y + 10}" class="tq-tl-label">${r.label}</text>`; });
  // row 1: onset window
  s += band(0, 5, rows[0].y, 'tq-tl-faint') + band(5, 8, rows[0].y, 'tq-tl-solid');
  // row 2: spread settling
  s += band(0, 20, rows[1].y, 'tq-tl-mid');
  // row 3: block duration
  s += band(8, 90, rows[2].y, 'tq-tl-solid') + `<rect x="${x(90)}" y="${rows[2].y + 18}" width="${x(180) - x(90)}" height="14" fill="url(#tq-hatch)" class="tq-tl-outline"/>`;
  // axis and break marker
  s += `<line x1="${padL}" y1="${axisY}" x2="${end}" y2="${axisY}" class="tq-tl-axis"/>`;
  s += `<path d="M${split - 5} ${axisY + 6} L${split - 1} ${axisY - 6} M${split + 1} ${axisY + 6} L${split + 5} ${axisY - 6}" class="tq-tl-axis"/>`;
  const ticks = narrow
    ? [[0, '0'], [5, '5'], [10, '10'], [20, '20'], [30, '30 min'], [90, '1.5 h'], [180, '3 h']]
    : [[0, '0'], [5, '5'], [10, '10'], [15, '15'], [20, '20'], [30, '30 min'], [60, '1 h'], [90, '1.5 h'], [120, '2 h'], [150, '2.5 h'], [180, '3 h'], [210, '3.5 h']];
  ticks.forEach(([t, lab]) => {
    s += `<line x1="${x(t)}" y1="${axisY}" x2="${x(t)}" y2="${axisY + 5}" class="tq-tl-axis"/>`;
    const anchor = t === 0 ? 'start' : t === 210 ? 'end' : 'middle';
    s += `<text x="${x(t)}" y="${axisY + 18}" text-anchor="${anchor}" class="tq-tl-tick">${lab}</text>`;
  });
  // gridlines for the checks
  const checks = [[5, '1'], [10, '2'], [20, '3']];
  checks.forEach(([t, n]) => {
    s += `<line x1="${x(t)}" y1="${top - 4}" x2="${x(t)}" y2="${axisY}" class="tq-tl-grid"/>`;
    s += `<rect x="${x(t) - 9}" y="${axisY + 26}" width="18" height="18" class="tq-tl-check"/><text x="${x(t)}" y="${axisY + 39}" text-anchor="middle" class="tq-tl-checkn">${n}</text>`;
  });
  s += `<text x="${padL}" y="${axisY + 64}" class="tq-tl-note">${narrow ? 'Squares: suggested checks. Scale changes at 30 min.' : 'Squares 1–3: suggested block checks (5, 10 and 20 min), then again before incision. The time scale changes at 30 min.'}</text>`;
  // injection marker
  s += `<path d="M${x(0)} ${top - 6} l0 ${axisY - top + 6}" class="tq-tl-inject"/>`;
  return svg(`0 0 ${W} ${H}`, s, 'Time course of a hyperbaric bupivacaine spinal');
}
