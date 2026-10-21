// Small SVG line chart. Series colours come from CSS custom properties so both themes work.
export interface Series {
  label: string;
  x: number[];
  y: number[];
  color: string; // CSS colour, e.g. 'var(--tci-ce)'
  dash?: string;
  width?: number;
  step?: boolean; // draw as a step function (infusion rates)
}
export interface Marker { x: number; y: number; label: string; color: string }

export interface ChartOpts {
  xLabel: string;
  yLabel: string;
  height?: number;
  yMax?: number;
  xMax?: number;
  hLine?: { y: number; label: string };
  cursorX?: number;
}

const niceStep = (range: number, ticks: number) => {
  const raw = range / ticks;
  const p = 10 ** Math.floor(Math.log10(raw));
  const f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function lineChart(series: Series[], markers: Marker[], o: ChartOpts): string {
  const W = 400, H = o.height ?? 230, L = 40, R = 8, T = 12, B = 36;
  const xMax = o.xMax ?? Math.max(...series.flatMap((s) => s.x));
  const yData = Math.max(1e-9, ...series.flatMap((s) => s.y), ...(o.hLine ? [o.hLine.y] : []));
  const yStep = niceStep(o.yMax ?? yData, 5);
  const yMax = o.yMax ?? Math.ceil((yData * 1.05) / yStep) * yStep;
  const xStep = niceStep(xMax, 5);
  const px = (x: number) => L + ((W - L - R) * x) / xMax;
  const py = (y: number) => T + (H - T - B) * (1 - Math.min(y, yMax * 1.02) / yMax);
  let g = '';
  for (let y = 0; y <= yMax + 1e-9; y += yStep) {
    g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${py(y)}" y2="${py(y)}"/>`;
    g += `<text x="${L - 6}" y="${py(y) + 4}" text-anchor="end">${+y.toFixed(3)}</text>`;
  }
  for (let x = 0; x <= xMax + 1e-9; x += xStep) {
    g += `<text x="${px(x)}" y="${H - B + 18}" text-anchor="middle">${+x.toFixed(2)}</text>`;
  }
  g += `<line class="axis" x1="${L}" x2="${W - R}" y1="${py(0)}" y2="${py(0)}"/>`;
  g += `<text x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">${esc(o.xLabel)}</text>`;
  g += `<text x="10" y="${T + (H - T - B) / 2}" text-anchor="middle" transform="rotate(-90 10 ${T + (H - T - B) / 2})">${esc(o.yLabel)}</text>`;
  if (o.hLine) {
    g += `<line x1="${L}" x2="${W - R}" y1="${py(o.hLine.y)}" y2="${py(o.hLine.y)}" stroke="var(--app-muted)" stroke-dasharray="2 4"/>`;
    g += `<text x="${W - R}" y="${py(o.hLine.y) - 5}" text-anchor="end">${esc(o.hLine.label)}</text>`;
  }
  for (const s of series) {
    let d = '';
    for (let i = 0; i < s.x.length; i++) {
      if (s.x[i] > xMax + 1e-9) break;
      const X = px(s.x[i]).toFixed(1), Y = py(s.y[i]).toFixed(1);
      if (i === 0) d += `M${X} ${Y}`;
      else if (s.step) d += `H${X}V${Y}`;
      else d += `L${X} ${Y}`;
    }
    g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${s.width ?? 2.5}" stroke-linejoin="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/>`;
  }
  for (const m of markers) {
    g += `<circle cx="${px(m.x)}" cy="${py(m.y)}" r="5" fill="${m.color}" stroke="var(--app-surface)" stroke-width="2"/>`;
    if (!m.label) continue;
    const anchor = px(m.x) > W * 0.7 ? 'end' : 'start';
    g += `<text x="${px(m.x) + (anchor === 'end' ? -8 : 8)}" y="${py(m.y) - 8}" text-anchor="${anchor}" style="fill:${m.color};font-weight:600">${esc(m.label)}</text>`;
  }
  if (o.cursorX !== undefined) g += `<line x1="${px(o.cursorX)}" x2="${px(o.cursorX)}" y1="${T}" y2="${py(0)}" stroke="var(--app-ink)" stroke-width="1"/>`;
  const legend = series.map((s) => `<li><svg viewBox="0 0 26 10" aria-hidden="true"><line x1="0" x2="26" y1="5" y2="5" stroke="${s.color}" stroke-width="3" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''}/></svg>${esc(s.label)}</li>`).join('');
  return `<svg class="tci-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.yLabel)} against ${esc(o.xLabel)}">${g}</svg><ul class="tci-legend">${legend}</ul>`;
}
