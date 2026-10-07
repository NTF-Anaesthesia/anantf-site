// Tiny event bus shared by every module of the brachial plexus app.
//
//   bus.state = { selected, hovered, block, layers }
//   bus.on(event, fn)  -> unsubscribe function
//   bus.emit(event, payload)
//
// Events: 'select' {id, source}, 'hover' {id, source}, 'block' {id, source}
// (id null clears). bus.state is updated before listeners run, so a listener
// can always read the latest state. Other event names (e.g. 'layers') are
// passed through unchanged.

export function createBus() {
  const listeners = new Map();
  const state = { selected: null, hovered: null, block: null, layers: {} };
  const STATE_KEY = { select: 'selected', hover: 'hovered', block: 'block' };

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event)?.delete(fn);
  }

  let depth = 0;
  function emit(event, payload = {}) {
    const p = payload && typeof payload === 'object' ? payload : { id: payload };
    const key = STATE_KEY[event];
    if (key) {
      const id = p.id ?? null;
      // Skip no-op repeats of the same value to prevent echo loops.
      if (state[key] === id && p.force !== true) return;
      state[key] = id;
    } else if (event === 'layers' && p && typeof p === 'object') {
      Object.assign(state.layers, p);
    }
    if (depth > 20) { console.warn('[bus] emit depth exceeded for', event); return; }
    depth++;
    try {
      for (const fn of [...(listeners.get(event) || [])]) {
        try { fn(p); } catch (err) { console.error(`[bus] listener for "${event}" failed`, err); }
      }
      for (const fn of [...(listeners.get('*') || [])]) {
        try { fn(event, p); } catch (err) { console.error('[bus] wildcard listener failed', err); }
      }
    } finally { depth--; }
  }

  return { state, on, emit };
}

export const bus = createBus();
export default bus;
