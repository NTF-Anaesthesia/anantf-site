// Tiny event bus for the plexus teaching app. One bus per mounted plexus.
//
//   bus.state = { selected, hovered, block }
//   bus.on(event, fn)  -> unsubscribe function
//   bus.emit(event, payload)
//
// Events: 'select' {id, source}, 'hover' {id, source}, 'block' {id, source}
// (id null clears). bus.state is updated before listeners run. Repeats of the
// same value are ignored unless payload.force is true.

export function createBus() {
  const listeners = new Map();
  const state = { selected: null, hovered: null, block: null };
  const STATE_KEY = { select: 'selected', hover: 'hovered', block: 'block' };
  let depth = 0;

  function on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event)?.delete(fn);
  }

  function emit(event, payload = {}) {
    const p = payload && typeof payload === 'object' ? payload : { id: payload };
    const key = STATE_KEY[event];
    if (key) {
      const id = p.id ?? null;
      if (state[key] === id && p.force !== true) return;
      state[key] = id;
    }
    if (depth > 20) return;
    depth++;
    try {
      for (const fn of [...(listeners.get(event) || [])]) {
        try { fn(p); } catch (err) { console.error(`[bus] listener for "${event}" failed`, err); }
      }
    } finally { depth--; }
  }

  function clear() { listeners.clear(); }

  return { state, on, emit, clear };
}

export default createBus;
