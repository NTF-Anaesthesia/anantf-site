// Placeholder for the anatomy section. Owner: B2. Replace this file; keep the meta/refs/mount interface (see js/CONTRACT.md).
import { el } from '../ui.js?v=1';

export const meta = { id: 'anatomy', prefix: 'an', title: 'Anatomy for neuraxial block' };
export const refs = {};

export function mount(root) {
  root.append(el('p', { class: 'sp-placeholder', text: 'Coming soon.' }));
}
