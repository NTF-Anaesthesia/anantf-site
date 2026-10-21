// Alarm sounder: WebAudio, created on the first user gesture (browsers keep audio locked until then). Mutable mute.
let ctx: AudioContext | null = null;
let muted = false;
export const isMuted = () => muted;
export const setMuted = (m: boolean) => { muted = m; };
export const unlocked = () => ctx !== null;

export function unlock() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { ctx = null; }
}

/** A short square-wave beep (pattern unknown for the real pump; a plain two-tone stand-in). */
export function beep(kind: 'key' | 'alarm' | 'warn' = 'key') {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime;
  const tones = kind === 'alarm' ? [[880, 0, 0.12], [880, 0.2, 0.12], [880, 0.4, 0.12]] : kind === 'warn' ? [[660, 0, 0.15], [660, 0.25, 0.15]] : [[1200, 0, 0.04]];
  for (const [f, at, dur] of tones) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0 + at);
    g.gain.exponentialRampToValueAtTime(kind === 'key' ? 0.05 : 0.12, t0 + at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0 + at); o.stop(t0 + at + dur + 0.02);
  }
}
