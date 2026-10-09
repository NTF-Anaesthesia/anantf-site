/* spinal/js/anatomy/dermatomes.js — Fig 1.4: front-view body outline with dermatome landmarks; a slider shades the
   region blocked for a chosen sensory level. SVG, original drawing. */
const NS = 'http://www.w3.org/2000/svg';
const S = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  kids.forEach((k) => n.append(k instanceof Node ? k : document.createTextNode(String(k))));
  return n;
};
const CX = 150;
// trunk dermatome y positions (front view)
export const LY = { T2: 124, T3: 142, T4: 160, T5: 178, T6: 196, T7: 212, T8: 229, T9: 245, T10: 262, T11: 278, T12: 295, L1: 330 };
const SANS = 'Inter,"NTF Sans",system-ui,sans-serif';

export const STOPS = [
  { id: 'S2', label: 'S2–S4', where: 'perineum (saddle area)', ops: ['Perineal and perianal surgery (a “saddle” block)'] },
  { id: 'L2', label: 'L2–L3', where: 'thigh and below', ops: ['Foot and ankle surgery'], note: 'With a thigh tourniquet, aim higher (about T10–T12), as for knee surgery.' },
  { id: 'L1', label: 'L1', where: 'inguinal ligament (groin)', ops: ['Thigh and lower-limb surgery, including amputation', 'TURP without bladder distension'] },
  { id: 'T10', label: 'T10', where: 'umbilicus', ops: ['Hip surgery', 'TURP and bladder procedures', 'Vaginal procedures', 'Knee arthroplasty with a thigh tourniquet (T10–T12 is often targeted)'], note: 'For TURP, aim no higher than about T10: a higher block can hide the pain of bladder or capsule perforation and adds hypotension.' },
  { id: 'T8', label: 'T8', where: 'between xiphisternum and umbilicus', ops: ['Lower abdominal and pelvic surgery (about T6–T8)'] },
  { id: 'T6', label: 'T6', where: 'xiphisternum', ops: ['Lower abdominal and pelvic surgery (about T6–T8)'] },
  { id: 'T4', label: 'T4', where: 'nipple line', ops: ['Upper abdominal surgery (about T4–T5): rarely done under spinal alone'], note: 'A block at T4 or above can reach the cardioaccelerator fibres (T1–T4): expect bradycardia and more hypotension.' },
];

// outlines
const CORE = 'M150 8 C170 8 182 26 182 46 C182 66 170 80 162 82 L162 96 C186 100 210 104 220 116 C226 150 214 190 204 214 C200 250 198 290 204 330 C210 360 208 380 200 410 C192 460 184 500 182 560 L186 584 L160 588 L156 560 C156 500 156 450 154 400 L150 376 L146 400 C144 450 144 500 144 560 L140 588 L114 584 L118 560 C116 500 108 460 100 410 C92 380 90 360 96 330 C102 290 100 250 96 214 C86 190 74 150 80 116 C90 104 114 100 138 96 L138 82 C130 80 118 66 118 46 C118 26 130 8 150 8 Z';
const ARMS = 'M82 112 C64 130 58 170 56 210 C54 250 52 300 50 340 C48 356 56 364 64 360 C68 330 72 290 76 250 C80 220 86 190 92 168 Z M218 112 C236 130 242 170 244 210 C246 250 248 300 250 340 C252 356 244 364 236 360 C232 330 228 290 224 250 C220 220 214 190 208 168 Z';

export function buildDermSVG() {
  const svg = S('svg', { viewBox: '0 0 520 600', class: 'an-derm-svg', role: 'img', 'aria-label': 'Front view of the body with dermatome landmarks: T4 nipples, T6 xiphisternum, T10 umbilicus, L1 inguinal ligament, S2 to S4 perineum.' });
  const defs = S('defs');
  defs.append(S('clipPath', { id: 'an-derm-clip' }, S('path', { d: CORE })));
  defs.append(S('pattern', { id: 'an-derm-hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, S('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: '#633d3c', 'stroke-width': 1.6, 'stroke-opacity': 0.6 })));
  defs.append(S('pattern', { id: 'an-derm-sym', width: 8, height: 8, patternUnits: 'userSpaceOnUse' }, S('circle', { cx: 4, cy: 4, r: 1.2, fill: '#34507a', 'fill-opacity': 0.7 })));
  svg.append(defs);
  svg.append(S('path', { d: ARMS, fill: '#efd9c6', stroke: '#2b1e18', 'stroke-width': 1.4 }));
  svg.append(S('path', { d: CORE, fill: '#efd9c6', stroke: 'none' }));
  const shade = S('g', { 'clip-path': 'url(#an-derm-clip)' });
  const blocked = S('path', { d: '', fill: 'rgba(99,61,60,.20)' });
  const hatch = S('path', { d: '', fill: 'url(#an-derm-hatch)' });
  const sym = S('rect', { x: 60, y: 0, width: 180, height: 0, fill: 'url(#an-derm-sym)' });
  shade.append(blocked, hatch, sym);
  svg.append(shade);
  // faint trunk dermatome bands
  Object.entries(LY).forEach(([k, y]) => { if (k !== 'L1') svg.append(S('line', { x1: 96, x2: 204, y1: y, y2: y, stroke: 'rgba(43,30,24,.18)', 'stroke-width': 1, 'clip-path': 'url(#an-derm-clip)' })); });
  svg.append(S('path', { d: CORE, fill: 'none', stroke: '#2b1e18', 'stroke-width': 1.5 }));
  // anatomical landmarks
  [-28, 28].forEach((d) => svg.append(S('circle', { cx: CX + d, cy: LY.T4, r: 3.5, fill: '#b9786a', stroke: '#2b1e18', 'stroke-width': 1 })));
  svg.append(S('path', { d: `M${CX - 9} ${LY.T6 - 10} L${CX} ${LY.T6} L${CX + 9} ${LY.T6 - 10}`, fill: 'none', stroke: '#2b1e18', 'stroke-width': 1.4 }));
  svg.append(S('circle', { cx: CX, cy: LY.T10, r: 3.5, fill: 'none', stroke: '#2b1e18', 'stroke-width': 1.4 }));
  svg.append(S('path', { d: `M100 312 L140 360 M200 312 L160 360`, fill: 'none', stroke: '#2b1e18', 'stroke-width': 1.4, 'stroke-dasharray': '5 3' }));
  // landmark labels on the right
  const marks = [['T4', 'nipple line', LY.T4, CX + 28], ['T6', 'xiphisternum', LY.T6, CX + 4], ['T10', 'umbilicus', LY.T10, CX + 4], ['L1', 'inguinal ligament', 336, 182], ['S2–S4', 'perineum', 378, CX + 4]];
  const labelEls = {};
  marks.forEach(([lvl, txt, y, ax]) => {
    const g = S('g', { class: 'an-derm-mark' });
    g.append(S('line', { x1: ax, x2: 300, y1: y, y2: y, stroke: 'rgba(43,30,24,.55)', 'stroke-width': 1 }));
    g.append(S('circle', { cx: ax, cy: y, r: 2.2, fill: '#2b1e18' }));
    const t = S('text', { x: 308, y: y + 5, 'font-size': 15, 'font-family': SANS, fill: '#2b1e18' });
    t.append(S('tspan', { 'font-weight': 700, 'font-family': '"NTF Mono","JetBrains Mono",ui-monospace,monospace' }, lvl), S('tspan', { dx: 8 }, txt));
    g.append(t);
    svg.append(g);
    labelEls[lvl] = g;
  });
  // differential-block legend lines (sympathetic above, motor below)
  const symLine = S('line', { x1: 80, x2: 220, y1: 0, y2: 0, stroke: '#34507a', 'stroke-width': 1.6, 'stroke-dasharray': '6 4', visibility: 'hidden' });
  const senLine = S('line', { x1: 60, x2: 300, y1: 0, y2: 0, stroke: '#633d3c', 'stroke-width': 2.4, visibility: 'hidden' });
  const senText = S('text', { x: 308, y: 0, 'font-size': 14, 'font-weight': 600, 'font-family': SANS, fill: '#633d3c', visibility: 'hidden' }, '');
  svg.append(symLine, senLine, senText);

  function set(id) {
    const LEGS_ALL = 'M0 352 L300 352 L300 600 L0 600 Z';
    let d;
    if (id === 'S2') d = `M136 362 L164 362 L160 392 L140 392 Z`;
    else if (id === 'L2') d = 'M0 392 L300 392 L300 600 L0 600 Z M136 362 L164 362 L160 392 L140 392 Z';
    else if (id === 'L1') d = `M0 340 L100 316 L150 366 L200 316 L300 340 L300 600 L0 600 Z`;
    else d = `M0 ${LY[id]} L300 ${LY[id]} L300 600 L0 600 Z`;
    void LEGS_ALL;
    blocked.setAttribute('d', d); hatch.setAttribute('d', d);
    const trunk = LY[id] != null && id !== 'L1';
    if (trunk) {
      const n = Number(id.slice(1));
      const up = `T${Math.max(2, n - 2)}`;
      sym.setAttribute('y', LY[up]); sym.setAttribute('height', LY[id] - LY[up]);
      symLine.setAttribute('y1', LY[up]); symLine.setAttribute('y2', LY[up]);
      symLine.setAttribute('visibility', 'visible');
      const labelled = ['T4', 'T6', 'T10'].includes(id);
      senLine.setAttribute('y1', LY[id]); senLine.setAttribute('y2', LY[id]);
      senText.textContent = labelled ? '' : `${id} sensory level`;
      senText.setAttribute('y', LY[id] + 5);
      senLine.setAttribute('visibility', 'visible'); senText.setAttribute('visibility', labelled ? 'hidden' : 'visible');
    } else {
      sym.setAttribute('height', 0);
      [symLine, senLine, senText].forEach((e) => e.setAttribute('visibility', 'hidden'));
    }
    const key = id === 'L2' ? null : id === 'S2' ? 'S2–S4' : id;
    Object.entries(labelEls).forEach(([k, g]) => g.classList.toggle('is-on', k === key));
  }
  return { svg, set };
}
