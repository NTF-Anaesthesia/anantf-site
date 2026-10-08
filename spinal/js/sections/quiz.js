// Placeholder for the quiz section. Owner: B6. Replace this file; keep the meta/refs/mount interface (see js/CONTRACT.md).
import { el } from '../ui.js?v=1';

export const meta = { id: 'quiz', prefix: 'qz', title: 'Exam questions and self-quiz' };
export const refs = {};

export function mount(root) {
  root.append(el('p', { class: 'sp-placeholder', text: 'Coming soon.' }));
}
