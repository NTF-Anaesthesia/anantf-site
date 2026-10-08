// Placeholder for the troubleshooting section. Owner: B5. Replace this file; keep the meta/refs/mount interface (see js/CONTRACT.md).
import { el } from '../ui.js?v=1';

export const meta = { id: 'troubleshooting', prefix: 'ts', title: 'Troubleshooting' };
export const refs = {};

export function mount(root) {
  root.append(el('p', { class: 'sp-placeholder', text: 'Coming soon.' }));
}
