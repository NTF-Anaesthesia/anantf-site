// Decision-tree component for the spinal page. Reusable by other sections.
//
// STABLE API (other builders may import this file read-only):
//
//   import { createTree, treeOutline, validateTree, TONES } from '../troubleshooting/tree.js';
//
//   const t = createTree(data, { headingLevel: 4, kicker: 'Decision tree', onNode(nodeId, node, api) {} });
//   host.append(t.el);
//   t.reset();          // back to data.start (no focus move)
//   t.back();           // one step back (same as Escape inside the tree)
//   t.goTo('n3');       // jump to a node, adding it to the path
//   t.current();        // current node id
//   t.path();           // array of node ids from start to current
//
//   treeOutline(data)   // <div class="ts-outline"> nested list of the whole tree (for print / revision / Ctrl-F).
//                       //   Render it (e.g. in a closed <details>) before app.js runs finalise(), so every ref the
//                       //   tree cites is numbered and listed even if the user never reaches that node.
//   numberCites(node)   // number citations rendered after finalise() (tree.js calls it on every node change)
//   validateTree(data)  // array of problem strings (empty when the data is consistent); use in tests
//
// DATA (matches DESIGN.md §3 "Decision tree"):
//   {
//     id: 'ts-dry-tap', title?, intro?, start: 'n1',
//     nodes: {
//       n1: { prompt, short?, detail?, figure?: Node | () => Node, choices: [{ label, to, note? }], refs?: [refId] },
//       x1: { outcome, short?, tone: 'ok' | 'warn' | 'danger', body, refs?: [refId] },
//     }
//   }
//   - prompt / outcome / label: plain text. detail / body / note: trusted HTML strings (or Nodes).
//   - `short` is the breadcrumb text (defaults to a trimmed prompt).
//   - `note` on a choice is shown at the top of the next node as feedback ("What would you do?" scenarios).
//   - refs are core or registered ref ids; they render through cite() and are numbered by app.js.
//
// BEHAVIOUR: choices are plain buttons (never colour-coded). On every user-initiated change focus moves to the
// node heading (tabindex=-1) and "Step n: prompt" is announced in #sp-live. Escape goes back one step.
// State lives in memory only; the URL is not touched.

import { el, announce, cite } from '../ui.js?v=1';

export const TONES = {
  ok: { label: 'Do this', glyph: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8.5 6.5 12.5 13.5 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>' },
  warn: { label: 'Caution', glyph: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M8 1.8 15 14.2H1z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4.2" stroke="currentColor" stroke-width="1.6"/><rect x="7.2" y="11.2" width="1.6" height="1.6" fill="currentColor"/></svg>' },
  danger: { label: 'Stop and escalate', glyph: '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M5 1.5h6L14.5 5v6L11 14.5H5L1.5 11V5z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5v4.5" stroke="currentColor" stroke-width="1.7"/><rect x="7.15" y="10.3" width="1.7" height="1.7" fill="currentColor"/></svg>' },
};

const isOutcome = (n) => n && typeof n.outcome === 'string';

/**
 * Give citations added after refs.finalise() their numbers, read from the rendered reference list
 * (#ref-<id> .sp-ref-num). Before finalise() this is a no-op and finalise() numbers them instead.
 * A ref only gets a number if it is cited somewhere in the DOM when finalise() runs, which is why
 * sections should also render treeOutline() (e.g. inside a closed <details>).
 */
export function numberCites(node) {
  if (!node) return;
  node.querySelectorAll('a[data-ref]').forEach((a) => {
    const t = document.querySelector(`#ref-${CSS.escape(a.dataset.ref)} .sp-ref-num`);
    const n = t && parseInt(t.textContent, 10);
    if (n) { a.textContent = `[${n}]`; a.setAttribute('aria-label', `Reference ${n}`); }
  });
}

function put(node, content) {
  if (content == null) return node;
  if (typeof content === 'string') node.insertAdjacentHTML('beforeend', content);
  else node.append(content);
  return node;
}

function shortOf(node) {
  if (!node) return '';
  if (node.short) return node.short;
  const t = isOutcome(node) ? node.outcome : node.prompt;
  return t.length > 34 ? `${t.slice(0, 32).trimEnd()}…` : t;
}

let treeCount = 0;

/** Build an interactive decision tree. See the header comment for the data format. */
export function createTree(data, { headingLevel = 4, kicker, onNode } = {}) {
  treeCount += 1;
  const uid = `${data.id || 'ts-tree'}-t${treeCount}`;
  const hTag = `h${Math.min(6, Math.max(2, headingLevel))}`;
  let hist = [data.start];
  let notes = [null]; // note shown on arrival at hist[i]

  const root = el('div', { class: 'ts-tree', dataset: { tree: data.id || '' } });
  if (kicker) root.append(el('p', { class: 'ts-tree-kicker', text: kicker }));
  const trail = el('ol', { class: 'ts-trail', 'aria-label': 'Your path' });
  const body = el('div', { class: 'ts-body' });
  const actions = el('div', { class: 'ts-actions' });
  const backBtn = el('button', { type: 'button', class: 'ts-act', on: { click: () => back(true) } }, el('span', { 'aria-hidden': 'true', text: '←' }), ' Back one step');
  const resetBtn = el('button', { type: 'button', class: 'ts-act', on: { click: () => restart() } }, 'Start again');
  const hint = el('p', { class: 'ts-hint', text: 'Esc goes back one step.' });
  actions.append(backBtn, resetBtn);
  root.append(trail, body, actions, hint);

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hist.length > 1) {
      e.preventDefault();
      e.stopPropagation();
      back(true);
    }
  });

  function renderTrail() {
    trail.textContent = '';
    hist.forEach((id, i) => {
      const n = data.nodes[id];
      const li = el('li', { class: 'ts-crumb' });
      const label = i === 0 ? 'Start' : shortOf(n);
      if (i < hist.length - 1) {
        li.append(el('button', { type: 'button', class: 'ts-crumb-btn', 'aria-label': `Go back to: ${label}`, on: { click: () => rewind(i) } }, label));
      } else {
        li.append(el('span', { class: 'ts-crumb-cur', 'aria-current': 'step', text: label }));
      }
      trail.append(li);
    });
  }

  function render(focus) {
    const id = hist[hist.length - 1];
    const n = data.nodes[id];
    const step = hist.length;
    body.textContent = '';
    root.dataset.tone = isOutcome(n) ? n.tone || 'ok' : '';
    renderTrail();

    const note = notes[notes.length - 1];
    if (note) {
      const fb = el('div', { class: 'ts-feedback', role: 'note' }, el('p', { class: 'ts-feedback-label', text: 'Feedback on your choice' }));
      put(fb.appendChild(el('div', { class: 'ts-feedback-body' })), note);
      body.append(fb);
    }

    const headId = `${uid}-h`;
    let heading;
    if (isOutcome(n)) {
      const tone = TONES[n.tone] ? n.tone : 'ok';
      const box = el('div', { class: `ts-outcome ts-outcome--${tone}` });
      const lab = el('p', { class: 'ts-outcome-label' });
      lab.insertAdjacentHTML('beforeend', TONES[tone].glyph);
      lab.append(el('span', { text: TONES[tone].label }));
      heading = el(hTag, { class: 'ts-prompt', id: headId, tabindex: '-1' }, n.outcome);
      const ob = put(el('div', { class: 'ts-outcome-body' }), n.body);
      if (n.refs?.length) {
        const last = ob.lastElementChild && /^(P|LI)$/.test(ob.lastElementChild.tagName) ? ob.lastElementChild : ob;
        last.insertAdjacentHTML('beforeend', cite(...n.refs));
      }
      box.append(lab, heading, ob);
      body.append(box);
    } else {
      const wrap = el('div', { class: 'ts-node' });
      heading = el(hTag, { class: 'ts-prompt', id: headId, tabindex: '-1' },
        el('span', { class: 'ts-step', text: `Step ${step}` }), ' ', el('span', { class: 'ts-prompt-text', text: n.prompt }));
      wrap.append(heading);
      if (n.detail != null || n.refs?.length) {
        const d = put(el('div', { class: 'ts-detail' }), n.detail);
        if (n.refs?.length) {
          const last = d.lastElementChild && /^(P|LI)$/.test(d.lastElementChild.tagName) ? d.lastElementChild : d;
          last.insertAdjacentHTML('beforeend', cite(...n.refs));
        }
        wrap.append(d);
      }
      if (n.figure) wrap.append(el('div', { class: 'ts-node-fig' }, typeof n.figure === 'function' ? n.figure() : n.figure));
      const group = el('div', { class: 'ts-choices', role: 'group', 'aria-labelledby': headId });
      n.choices.forEach((c) => {
        group.append(el('button', { type: 'button', class: 'ts-choice', on: { click: () => choose(c) } },
          el('span', { class: 'ts-choice-label', text: c.label }),
          el('span', { class: 'ts-choice-arrow', 'aria-hidden': 'true', text: '→' })));
      });
      wrap.append(group);
      body.append(wrap);
    }

    numberCites(body);
    backBtn.hidden = hist.length < 2;
    hint.hidden = hist.length < 2;
    resetBtn.hidden = hist.length < 2;
    actions.hidden = hist.length < 2;

    if (focus) {
      heading.focus({ preventScroll: true });
      const r = heading.getBoundingClientRect();
      const top = 170;
      if (r.top < top || r.top > window.innerHeight - 160) {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollBy({ top: r.top - top, behavior: reduce ? 'auto' : 'smooth' });
      }
      const text = isOutcome(n)
        ? `${TONES[n.tone]?.label || 'Outcome'}: ${n.outcome}`
        : `Step ${step}: ${n.prompt}`;
      announce(note ? `${text}. Feedback available above the question.` : text);
    }
    onNode?.(id, n, api);
  }

  function choose(c) {
    if (!data.nodes[c.to]) return;
    hist = [...hist, c.to];
    notes = [...notes, c.note || null];
    render(true);
  }
  function back(focus = true) {
    if (hist.length < 2) return;
    hist = hist.slice(0, -1);
    notes = notes.slice(0, -1);
    render(focus);
  }
  function rewind(i) {
    hist = hist.slice(0, i + 1);
    notes = notes.slice(0, i + 1);
    render(true);
  }
  function restart() {
    hist = [data.start];
    notes = [null];
    render(true);
  }

  const api = {
    el: root,
    reset() { hist = [data.start]; notes = [null]; render(false); },
    back: () => back(true),
    goTo(id) { if (!data.nodes[id]) return; hist = [...hist, id]; notes = [...notes, null]; render(true); },
    current: () => hist[hist.length - 1],
    path: () => [...hist],
  };
  render(false);
  return api;
}

/** The whole tree as a nested list (each node expanded once; repeats point back). */
export function treeOutline(data) {
  const seen = new Set();
  const wrap = el('div', { class: 'ts-outline' });
  function item(id) {
    const n = data.nodes[id];
    const li = el('li', { class: 'ts-ol-node' });
    if (!n) return li;
    if (isOutcome(n)) {
      const tone = TONES[n.tone] ? n.tone : 'ok';
      li.append(el('p', { class: `ts-ol-outcome ts-ol-outcome--${tone}` },
        el('span', { class: 'ts-ol-tone', text: `${TONES[tone].label}: ` }), n.outcome));
      if (!seen.has(id)) {
        seen.add(id);
        const b = put(el('div', { class: 'ts-ol-body' }), n.body);
        if (n.refs?.length) b.insertAdjacentHTML('beforeend', cite(...n.refs));
        li.append(b);
      } else li.append(el('p', { class: 'ts-ol-repeat', text: '(as above)' }));
      return li;
    }
    li.append(el('p', { class: 'ts-ol-prompt', text: n.prompt }));
    if (seen.has(id)) { li.append(el('p', { class: 'ts-ol-repeat', text: '(continues as above)' })); return li; }
    seen.add(id);
    const ul = el('ul', { class: 'ts-ol-choices' });
    n.choices.forEach((c) => {
      const ci = el('li', { class: 'ts-ol-choice' }, el('p', { class: 'ts-ol-label' }, el('span', { 'aria-hidden': 'true', text: '→ ' }), c.label));
      if (c.note) ci.append(put(el('div', { class: 'ts-ol-note' }), c.note));
      const sub = el('ul', { class: 'ts-ol-sub' }, item(c.to));
      ci.append(sub);
      ul.append(ci);
    });
    li.append(ul);
    return li;
  }
  wrap.append(el('ul', { class: 'ts-ol-root' }, item(data.start)));
  return wrap;
}

/** Consistency checks for tree data. Returns a list of problems (empty = OK). */
export function validateTree(data) {
  const out = [];
  if (!data?.nodes) return ['no nodes'];
  if (!data.nodes[data.start]) out.push(`${data.id}: start "${data.start}" missing`);
  const reach = new Set();
  const depth = { max: 0 };
  (function walk(id, d, path) {
    const n = data.nodes[id];
    if (!n) return;
    reach.add(id);
    depth.max = Math.max(depth.max, d);
    if (path.includes(id)) { out.push(`${data.id}: cycle at ${id}`); return; }
    if (isOutcome(n)) {
      if (!TONES[n.tone]) out.push(`${data.id}: ${id} has unknown tone "${n.tone}"`);
      return;
    }
    if (!n.prompt) out.push(`${data.id}: ${id} has no prompt`);
    if (!n.choices?.length) out.push(`${data.id}: ${id} has no choices`);
    (n.choices || []).forEach((c) => {
      if (!data.nodes[c.to]) out.push(`${data.id}: ${id} → missing "${c.to}"`);
      else walk(c.to, d + 1, [...path, id]);
    });
  }(data.start, 1, []));
  Object.keys(data.nodes).forEach((k) => { if (!reach.has(k)) out.push(`${data.id}: ${k} unreachable`); });
  if (depth.max < 3 || depth.max > 6) out.push(`${data.id}: depth ${depth.max} (want 3–6)`);
  return out;
}
