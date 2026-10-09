// Original SVG drawings for 03 Challenging spines. Printed-plate style (same plate colours in both themes,
// --an-* tokens from base.css); the frame around each figure follows the page theme.
// Drawings are schematic teaching figures, not measurements.

const NS = 'http://www.w3.org/2000/svg';

export function svgEl(viewBox, inner, label) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', viewBox);
  s.setAttribute('role', 'img');
  s.setAttribute('aria-label', label);
  s.setAttribute('class', 'sx-svg');
  s.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  s.innerHTML = inner;
  return s;
}

/** Label pill with an optional leader to (tx, ty). kind: plain | cue | warn. Anchor is the pill's left or right edge. */
export function pill(x, y, text, { tx, ty, align = 'left', kind = 'plain', fs = 17 } = {}) {
  const w = Math.round(text.length * fs * 0.546 + fs * 1.4);
  const h = Math.round(fs * 1.85);
  const x0 = align === 'right' ? x - w : x;
  const lx = align === 'right' ? x0 : x0 + w;
  const lead = tx != null
    ? `<line x1="${align === 'right' ? x0 + w : x0}" y1="${y}" x2="${tx}" y2="${ty}" stroke="var(--an-ink)" stroke-width="1"/><circle cx="${tx}" cy="${ty}" r="2.8" fill="var(--an-ink)"/>`
    : '';
  void lx;
  const fill = kind === 'cue' ? 'var(--an-cue)' : kind === 'warn' ? 'var(--an-warn)' : 'var(--an-pill)';
  const ink = kind === 'plain' ? 'var(--an-ink)' : '#ffffff';
  return `${lead}<rect x="${x0}" y="${y - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" stroke="var(--an-ink)" stroke-width="1"/>`
    + `<text x="${x0 + w / 2}" y="${y + fs * 0.35}" text-anchor="middle" class="sx-svg-pill" style="font-size:${fs}px" fill="${ink}">${text}</text>`;
}

/** Numbered badge (the key sits in the caption). */
export function badge(x, y, n) {
  return `<circle cx="${x}" cy="${y}" r="13" fill="var(--an-ink)" stroke="var(--an-plate)" stroke-width="1.5"/>`
    + `<text x="${x}" y="${y + 5}" text-anchor="middle" class="sx-svg-badge" fill="var(--an-plate)">${n}</text>`;
}

/** Draw bone so that overlapping shapes merge into one silhouette: ink outline pass, then bone fill pass. */
export function merge({ fills = [], lines = [] }) {
  const ink = fills.map((d) => `<path d="${d}" fill="var(--an-ink)" stroke="var(--an-ink)" stroke-width="3.6" stroke-linejoin="round"/>`).join('')
    + lines.map(([d, w]) => `<path d="${d}" fill="none" stroke="var(--an-ink)" stroke-width="${w + 3.6}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  const bone = fills.map((d) => `<path d="${d}" fill="var(--an-bone)" stroke="var(--an-bone)" stroke-width=".6" stroke-linejoin="round"/>`).join('')
    + lines.map(([d, w]) => `<path d="${d}" fill="none" stroke="var(--an-bone)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  return ink + bone;
}

/** A needle drawn from a hub at (x1, y1) to a tip at (x2, y2). */
export function needleLine(x1, y1, x2, y2, color = 'var(--an-needle)') {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hx = x1 - Math.cos(a) * 14, hy = y1 - Math.sin(a) * 14;
  return `<line x1="${hx}" y1="${hy}" x2="${x1}" y2="${y1}" stroke="var(--an-ink)" stroke-width="9" stroke-linecap="round"/>`
    + `<line x1="${hx}" y1="${hy}" x2="${x1}" y2="${y1}" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`
    + `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--an-ink)" stroke-width="4.2" stroke-linecap="round"/>`
    + `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" stroke-linecap="round"/>`;
}

// ------------------------------------------------------------------ 1. rotated scoliotic vertebra (axial view)
// Pivot (320,290). The vertebra is turned 20 degrees: the spinous process swings to the concave side (viewer's
// left) and the body to the convex side (viewer's right). The convex-side interlaminar gap is drawn open.
export function scoliosisSvg() {
  const arch = merge({
    fills: [
      'M250 285 C250 252 288 246 320 250 C352 246 390 252 390 285 C390 325 355 338 320 338 C285 338 250 325 250 285Z',
      'M311 154 L329 154 L326 96 L314 96Z',
    ],
    lines: [
      ['M282 240 L205 226', 16], ['M358 240 L435 226', 16],
      ['M272 252 L268 205 L282 175 L320 150', 22],
      ['M368 252 L372 205 L358 185', 22],
    ],
  });
  const roots = [[308, 200], [322, 196], [334, 205], [314, 215], [329, 217], [320, 206]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="var(--an-root)" stroke="var(--an-root-line)" stroke-width="1"/>`).join('');
  const inner = `
  <rect width="640" height="420" fill="var(--an-plate)"/>
  <path d="M30 74 C200 54 440 54 610 74 L610 420 L30 420Z" fill="var(--an-fat)"/>
  <path d="M30 74 C200 54 440 54 610 74 L610 88 C440 68 200 68 30 88Z" fill="var(--an-skin)" stroke="var(--an-ink)" stroke-width="1.6"/>
  <ellipse cx="165" cy="225" rx="108" ry="100" fill="var(--an-lig-inter)" stroke="var(--an-cortex)" stroke-width="1.5"/>
  <ellipse cx="475" cy="225" rx="108" ry="100" fill="var(--an-lig-inter)" stroke="var(--an-cortex)" stroke-width="1.5"/>
  <g transform="rotate(-20 320 290)">
    ${arch}
    <path d="M358 185 L320 150" stroke="var(--an-flavum)" stroke-width="15" fill="none" stroke-linecap="butt"/>
    <ellipse cx="320" cy="208" rx="33" ry="31" fill="var(--an-csf)" stroke="var(--an-dura)" stroke-width="3.5"/>
    ${roots}
  </g>
  <line x1="253" y1="34" x2="253" y2="330" stroke="var(--an-ink)" stroke-width="1.3" stroke-dasharray="6 5" opacity=".7"/>
  ${needleLine(247, 44, 247, 172, 'var(--an-warn)')}
  <path d="M236 160 l22 22 M258 160 l-22 22" stroke="var(--an-warn)" stroke-width="4" stroke-linecap="round"/>
  ${needleLine(296, 44, 296, 196, 'var(--an-cue)')}
  ${pill(14, 24, 'Concave side', { kind: 'plain', fs: 19 })}
  ${pill(626, 24, 'Convex side', { align: 'right', kind: 'plain', fs: 19 })}
  ${pill(14, 396, 'Midline needle: bone', { kind: 'warn', fs: 17 })}
  ${pill(626, 396, 'Convex side: gap', { align: 'right', kind: 'cue', fs: 17 })}
  ${badge(205, 118, 1)}${badge(432, 330, 2)}${badge(356, 232, 3)}${badge(352, 140, 4)}${badge(212, 178, 5)}
  <text x="14" y="352" class="sx-svg-small" fill="var(--an-ink)">Dashed: line of spinous tips</text>
  <text x="14" y="372" class="sx-svg-small" fill="var(--an-ink)">Seen from below, back at the top</text>`;
  return svgEl('0 0 640 420', inner, 'Axial drawing of a rotated lumbar vertebra in scoliosis. The spinous process points to the concave side and the vertebral body to the convex side. A needle straight down the line of the spinous tips meets the lamina on the concave side. A needle entering on the convex side passes through the open interlaminar gap into the canal.');
}

// ------------------------------------------------------------------ 3. Taylor approach (posterior view)
export function taylorSvg() {
  const wing = 'M50 130 C55 78 130 52 192 72 C210 80 218 150 222 205 L226 226 C186 258 140 240 100 205 C66 178 48 160 50 130Z';
  const inner = `
  <rect width="560" height="460" fill="var(--an-plate)"/>
  <line x1="20" y1="68" x2="540" y2="68" stroke="var(--an-ink)" stroke-width="1.5" stroke-dasharray="7 6"/>
  <path d="${wing}" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="2.4" stroke-linejoin="round"/>
  <g transform="translate(560 0) scale(-1 1)"><path d="${wing}" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="2.4" stroke-linejoin="round"/></g>
  <rect x="238" y="14" width="84" height="54" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="2.4"/>
  <rect x="244" y="68" width="72" height="12" fill="var(--an-lig-inter)" stroke="var(--an-ink)" stroke-width="1.4"/>
  <rect x="238" y="80" width="84" height="60" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="2.4"/>
  <path d="M280 14 L280 68 M280 80 L280 140" stroke="var(--an-cortex)" stroke-width="5" stroke-linecap="round"/>
  <rect x="238" y="140" width="84" height="16" fill="var(--an-flavum)" stroke="var(--an-ink)" stroke-width="1.6"/>
  <path d="M232 156 L328 156 L306 336 L280 396 L254 336Z" fill="var(--an-bone)" stroke="var(--an-ink)" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M280 160 L280 372" stroke="var(--an-cortex)" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 11"/>
  <text x="280" y="50" text-anchor="middle" class="sx-svg-small" fill="var(--an-ink)">L4</text>
  <text x="280" y="116" text-anchor="middle" class="sx-svg-small" fill="var(--an-ink)">L5</text>
  <text x="262" y="300" text-anchor="middle" class="sx-svg-small" fill="var(--an-ink)">Sacrum</text>
  <path d="M334 214 L312 214 L312 236" fill="none" stroke="var(--an-ink)" stroke-width="1.4" stroke-dasharray="3 3"/>
  <text x="342" y="198" text-anchor="middle" class="sx-svg-small" fill="var(--an-ink)">1 cm</text>
  <text x="322" y="244" text-anchor="start" class="sx-svg-small" fill="var(--an-ink)">1 cm</text>
  <circle cx="226" cy="214" r="6.5" fill="var(--an-ink)" stroke="var(--an-plate)" stroke-width="1.5"/>
  <circle cx="334" cy="214" r="6.5" fill="var(--an-ink)" stroke="var(--an-plate)" stroke-width="1.5"/>
  ${needleLine(312, 236, 291, 156, 'var(--an-cue)')}
  <circle cx="312" cy="236" r="8" fill="none" stroke="var(--an-cue)" stroke-width="2.4"/>
  ${pill(12, 44, 'Crest line (L4)', { fs: 17 })}
  ${pill(360, 148, 'L5–S1 gap', { tx: 322, ty: 148, fs: 17 })}
  ${pill(394, 196, 'PSIS', { tx: 338, ty: 211, fs: 17 })}
  ${pill(380, 290, 'Entry point', { tx: 316, ty: 240, kind: 'cue', fs: 17 })}
  <text x="14" y="442" class="sx-svg-small" fill="var(--an-ink)">Seen from behind, head up</text>`;
  return svgEl('0 0 560 460', inner, 'Posterior drawing of the lower lumbar spine, sacrum and pelvis. The L5 to S1 interlaminar gap is shown open. An entry point sits 1 cm medial and 1 cm below the posterior superior iliac spine on one side, and the needle is aimed up and in towards the L5 to S1 gap.');
}
