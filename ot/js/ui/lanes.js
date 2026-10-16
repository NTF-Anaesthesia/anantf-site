// Sweeping monitor lanes on canvas (DESIGN.md, "Beats, breaths and the waveforms"). A lane shows a fixed window of
// display time; the write point moves left to right and wraps, erasing a short gap ahead of itself, as on a theatre
// monitor. refill() redraws one full sweep from the source's history (load, resize, speed change, pause), so a paused
// or freshly opened screen is never blank.

const GAP = 14; // px erased ahead of the write point

export class Lane {
  // opts: { window (s), sample(src, t) -> value, lo, hi (value range), color, label? }
  constructor(canvas, opts) {
    this.c = canvas;
    Object.assign(this, opts);
    this.last = null; // display time drawn up to
    this.lastY = null;
  }

  // size the backing store to the element (device pixels, capped at 2x like bis-dsa); true when it changed
  fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = this.c.clientWidth, h = this.c.clientHeight;
    if (!w || !h) return false;
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    const changed = this.c.width !== W || this.c.height !== H || this.dpr !== dpr;
    if (changed) { this.c.width = W; this.c.height = H; }
    this.w = w; this.h = h; this.dpr = dpr;
    this.ctx = this.c.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return changed;
  }

  x(t) { const p = t / this.window; return (p - Math.floor(p)) * this.w; }
  y(v) {
    if (!Number.isFinite(v)) return null;
    const pad = 4, f = (v - this.lo) / (this.hi - this.lo);
    return this.h - pad - Math.max(-0.05, Math.min(1.05, f)) * (this.h - 2 * pad);
  }

  // the value farthest from zero within one pixel, so narrow waves (an R wave is about 20 ms wide) keep their height
  peak(src, s, step) {
    let best = this.sample(src, s);
    for (let k = 1; k < 4; k++) { const v = this.sample(src, s - (step * k) / 4); if (Math.abs(v) > Math.abs(best)) best = v; }
    return best;
  }

  // redraw the whole window ending at display time t
  refill(src, t) {
    if (!this.fit() && !this.ctx) return;
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.last = null;
    this.draw(src, t, true);
  }

  // draw from the last drawn time up to display time t
  draw(src, t, full = false) {
    if (!this.ctx) { if (!this.fit()) return; full = true; }
    const ctx = this.ctx, step = this.window / (this.w * this.dpr); // one device pixel of time
    let from = this.last;
    if (full || from == null || t - from > this.window || t < from) { from = t - this.window; full = true; ctx.clearRect(0, 0, this.w, this.h); this.lastY = null; }
    if (t - from < step && !full) return;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    let px = this.x(from), py = this.lastY;
    ctx.beginPath();
    for (let s = from + step; s <= t + 1e-9; s += step) {
      const x = this.x(s), y = this.y(this.peak(src, s, step));
      if (x < px) { // wrapped: finish the path at the right edge and start again at the left
        ctx.stroke(); ctx.beginPath(); py = null;
      }
      // erase the gap ahead of the write point (wrapping round to the left edge)
      ctx.clearRect(x + 1, 0, GAP, this.h);
      if (x + 1 + GAP > this.w) ctx.clearRect(0, 0, x + 1 + GAP - this.w, this.h);
      if (y != null) {
        if (py == null) ctx.moveTo(x, y); else { ctx.moveTo(px, py); ctx.lineTo(x, y); }
      }
      px = x; py = y;
    }
    ctx.stroke();
    this.last = from + Math.floor((t - from) / step + 1e-9) * step;
    this.lastY = py;
  }
}
