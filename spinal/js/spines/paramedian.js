// Interactive paramedian-approach figure: posterior view of two lumbar vertebrae and the interlaminar gap.
// The needle is drawn as its projection on the back: where it would be when it reaches the depth of the gap.
// Schematic. Distances are illustrative, not measurements.
import { el, figure, reducedMotion } from '../ui.js?v=1';
import { svgEl, merge, badge, pill } from './figures.js?v=1';

const S = 6;                      // px per mm
const px = (x) => 280 + S * x;    // x: mm lateral to midline (right positive)
const py = (y) => 275 - S * y;    // y: mm cranial to the upper edge of the lower spinous process
const ENTRY = 10;                 // mm lateral
const Z_GAP = 45;                 // mm: depth of the gap plane (illustrative)
const Z_CANAL = 55;               // mm: depth of the canal (illustrative)
const GAP = { x0: -4, x1: 18, y0: 3, y1: 17 };

const rect = (x0, y0, x1, y1) => `M${px(x0)} ${py(y1)} L${px(x1)} ${py(y1)} L${px(x1)} ${py(y0)} L${px(x0)} ${py(y0)}Z`;

function staticLayer() {
  const mirror = (a, b, c, d) => [rect(a, b, c, d), rect(-c, b, -a, d)];
  const fills = [
    rect(-4, -26, 4, 0), rect(-4, 17, 4, 44),            // spinous processes
    ...mirror(4, -26, 18, 3), ...mirror(4, 17, 18, 44),  // laminae
    ...mirror(18, -26, 34, 44),                          // facet column
  ];
  const win = (a, b) => `<path d="${rect(a, GAP.y0, b, GAP.y1)}" fill="var(--an-flavum)" stroke="var(--an-ink)" stroke-width="1.2"/>`;
  return `
  <rect width="560" height="420" fill="var(--an-plate)"/>
  ${merge({ fills })}
  <path d="${rect(-4, 0, 4, 17)}" fill="var(--an-lig-inter)" stroke="var(--an-ink)" stroke-width="1.2"/>
  ${win(4, 18)}${win(-18, -4)}
  <path d="${rect(18, 9, 34, 11)}" fill="var(--an-ink)" opacity=".55"/>
  <path d="${rect(-34, 9, -18, 11)}" fill="var(--an-ink)" opacity=".55"/>
  <line x1="280" y1="6" x2="280" y2="414" stroke="var(--an-ink)" stroke-width="1.2" stroke-dasharray="6 5" opacity=".55"/>
  ${badge(280, 62, 1)}${badge(364, 52, 2)}${badge(372, py(10) - 22, 3)}${badge(462, py(24), 4)}
  <circle cx="${px(ENTRY)}" cy="${py(0)}" r="8" fill="none" stroke="var(--an-cue)" stroke-width="2.6"/>
  ${badge(px(ENTRY) + 24, py(0) + 26, 5)}
  ${pill(12, 22, 'Upper level', { fs: 15 })}${pill(12, 398, 'Lower level', { fs: 15 })}`;
}

/** Work out what the needle meets for a medial angle a and a cranial angle b (degrees). */
export function judge(a, b) {
  const ta = Math.tan((a * Math.PI) / 180), tb = Math.tan((b * Math.PI) / 180);
  const x = ENTRY - Z_GAP * ta, y = Z_GAP * tb;
  const xc = ENTRY - Z_CANAL * ta;
  let kind, text;
  if (x < GAP.x0) { kind = 'bad'; text = 'Too steep. The needle crosses the midline too early and meets bone on the far side.'; }
  else if (y < GAP.y0) { kind = 'bone'; text = 'Bone contact: the lower lamina. Walk off it cranially. Withdraw a little, aim more towards the head, and advance again.'; }
  else if (y > GAP.y1) { kind = 'bone'; text = 'Bone contact: the upper lamina. Too far cranially. Come back down a little.'; }
  else if (Math.abs(xc) <= 8) { kind = 'ok'; text = 'Through the interlaminar gap, heading for the canal.'; }
  else { kind = 'warn'; text = 'Through the gap, but aimed to the side of the canal. Add a little medial angle.'; }
  return { kind, text, x, y, xc, yc: Z_CANAL * tb };
}

export function paramedianFigure() {
  const f = figure({
    id: 'sx-paramedian-fig',
    num: '5.2',
    title: 'Paramedian approach: bone or gap?',
    plate: 'paper',
    aspect: '4/3',
    caption: 'Posterior view, head up. Move the sliders to aim the needle. Distances are illustrative.'
      + ' <span class="sx-key"><b>1</b> Spinous process · <b>2</b> Lamina · <b>3</b> Interlaminar gap · <b>4</b> Facet joint · <b>5</b> Entry, 0.5–1 cm lateral to the upper edge of the lower spinous process</span>',
  });
  const svg = svgEl('0 0 560 420', `${staticLayer()}<g class="sx-pm-dyn"></g>`,
    'Posterior drawing of two lumbar vertebrae with the interlaminar gap between them. A needle enters 0.5 to 1 cm lateral to the midline at the upper edge of the lower spinous process. The sliders change its medial and cranial angle, and the figure shows whether it meets a lamina or passes through the gap.');
  f.stage.append(svg);
  const dyn = svg.querySelector('.sx-pm-dyn');

  const state = { a: 8, b: 0 };
  const status = el('p', { class: 'sx-pm-status', 'data-kind': 'bone' });
  const slider = (key, label, min, max) => {
    const out = el('output', { class: 'sx-slider-o' });
    const input = el('input', { type: 'range', min, max, step: 1, value: state[key], 'aria-label': label });
    input.addEventListener('input', () => { state[key] = Number(input.value); paint(); });
    return { node: el('label', { class: 'sx-slider' }, el('span', { class: 'sx-slider-l', text: label }), input, out), input, out };
  };
  const sa = slider('a', 'Medial angle', 0, 30);
  const sb = slider('b', 'Cranial angle', 0, 30);

  function paint() {
    const r = judge(state.a, state.b);
    const col = r.kind === 'ok' ? 'var(--an-cue)' : r.kind === 'warn' ? 'var(--an-cue)' : 'var(--an-warn)';
    const ex = px(ENTRY), ey = py(0), tx = px(r.x), ty = py(r.y);
    let s = `<line x1="${ex}" y1="${ey}" x2="${tx}" y2="${ty}" stroke="var(--an-ink)" stroke-width="5" stroke-linecap="round"/>`
      + `<line x1="${ex}" y1="${ey}" x2="${tx}" y2="${ty}" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/>`;
    if (r.kind === 'ok' || r.kind === 'warn') {
      s += `<line x1="${tx}" y1="${ty}" x2="${px(r.xc)}" y2="${py(r.yc)}" stroke="${col}" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round"/>`
        + `<circle cx="${tx}" cy="${ty}" r="5" fill="${col}" stroke="var(--an-ink)" stroke-width="1.4"/>`;
    } else {
      s += `<path d="M${tx - 9} ${ty - 9} l18 18 M${tx + 9} ${ty - 9} l-18 18" stroke="var(--an-warn)" stroke-width="4.4" stroke-linecap="round"/>`;
    }
    dyn.innerHTML = s;
    sa.out.textContent = `${state.a}°`; sb.out.textContent = `${state.b}°`;
    sa.input.value = state.a; sb.input.value = state.b;
    sa.input.setAttribute('aria-valuetext', `${state.a} degrees medial`);
    sb.input.setAttribute('aria-valuetext', `${state.b} degrees cranial`);
    status.dataset.kind = r.kind;
    status.textContent = r.text;
    f.describe(`${state.a} degrees medial, ${state.b} degrees cranial. ${r.text}`);
  }

  let raf = 0;
  const walkOff = el('button', { type: 'button', class: 'sx-btn', text: 'Show the walk-off', on: { click: () => {
    cancelAnimationFrame(raf);
    state.a = 8; state.b = 0;
    if (reducedMotion()) { state.b = 10; paint(); return; }
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      state.b = Math.round(k * 10);
      paint();
      if (k < 1) raf = requestAnimationFrame(step);
    };
    paint();
    raf = requestAnimationFrame(step);
  } } });
  const reset = el('button', { type: 'button', class: 'sx-btn', text: 'Reset', on: { click: () => { cancelAnimationFrame(raf); state.a = 8; state.b = 0; paint(); } } });
  f.controls.append(sa.node, sb.node, walkOff, reset);
  f.fig.insertBefore(status, f.controls);
  paint();
  return f.fig;
}
