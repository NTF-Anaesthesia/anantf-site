// The frame loop (DESIGN.md, "Beats, breaths and the waveforms" and "The model loop"): requestAnimationFrame runs as
// many fixed model steps as wall time times speed allows. A frame catches up at most 50 steps (5 s simulated), so a
// stalled phone does not lurch; the tab pauses itself while hidden and resumes without catching up.

export const SPEEDS = [1, 5, 20];
const MAX_STEPS = 50;

export class Loop {
  // onFrame(info): info = { steps, frac, wallDt } after the model has stepped
  constructor(sim, onFrame) {
    this.sim = sim;
    this.onFrame = onFrame;
    this.speed = 1;
    this.paused = false;
    this.acc = 0;       // model steps owed, as a fraction of a step
    this.prev = null;   // last frame's wall time
    this.running = false;
    this.hidden = false;
    this.tick = this.tick.bind(this);
    document.addEventListener('visibilitychange', () => {
      this.hidden = document.hidden;
      this.prev = null; // no catch-up for the time the tab was hidden
    });
  }

  start() { if (!this.running) { this.running = true; this.prev = null; requestAnimationFrame(this.tick); } }
  stop() { this.running = false; }

  tick(now) {
    if (!this.running) return;
    const wallDt = this.prev == null ? 0 : Math.min(0.25, (now - this.prev) / 1000);
    this.prev = now;
    let steps = 0;
    if (!this.paused && !this.hidden) {
      this.acc += (wallDt * this.speed) / this.sim.state.dt;
      steps = Math.min(MAX_STEPS, Math.floor(this.acc));
      if (steps) this.sim.step(steps);
      this.acc = Math.min(this.acc - steps, 1);
    }
    this.onFrame({ steps, frac: this.acc, wallDt: this.paused || this.hidden ? 0 : wallDt });
    requestAnimationFrame(this.tick);
  }
}
