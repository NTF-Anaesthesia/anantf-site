// Placeholder for the complications section. Owner: B6. Replace this file; keep the meta/refs/mount interface (see js/CONTRACT.md).
import { el } from '../ui.js?v=1';

export const meta = { id: 'complications', prefix: 'cx', title: 'Complications and safety' };
export const refs = {};

export function mount(root) {
  root.append(el('p', { class: 'sp-placeholder', text: 'Coming soon.' }));
}
