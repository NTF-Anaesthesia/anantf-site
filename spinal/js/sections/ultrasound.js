// Placeholder for the ultrasound section. Owner: B4. Replace this file; keep the meta/refs/mount interface (see js/CONTRACT.md).
import { el } from '../ui.js?v=1';

export const meta = { id: 'ultrasound', prefix: 'us', title: 'Ultrasound-assisted neuraxial' };
export const refs = {};

export function mount(root) {
  root.append(el('p', { class: 'sp-placeholder', text: 'Coming soon.' }));
}
