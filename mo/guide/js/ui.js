// Small builders for the app kit's markup (https://design.anantf.com/v1/app.css, DESIGN-APP.md): large titles, grouped lists and rows.
import { esc } from './md.js';

/** Large title (Fraunces) with an optional one-line subtitle (html, already escaped). */
export const title = (t, sub = '') => `<h1 class="app-large-title">${esc(t)}</h1>${sub ? `<p class="app-large-sub">${sub}</p>` : ''}`;

/** One row of a grouped list, as a link. title and sub are escaped here; meta is html. */
export function row({ href, title: t, sub = '', meta = '', cls = '', raw = false }) {
  const tt = raw ? t : esc(t), ss = raw ? sub : esc(sub);
  return `<li><a class="app-row${cls ? ` ${cls}` : ''}" href="${esc(href)}"><span class="app-row-body"><span class="app-row-title">${tt}</span>${ss ? `<span class="app-row-sub">${ss}</span>` : ''}${meta ? `<span class="rowmeta">${meta}</span>` : ''}</span><span class="app-row-chevron" aria-hidden="true"></span></a></li>`;
}

/** A grouped section: header (plain text), rows (html of <li>s), optional footer (html). */
export const section = (header, rows, footer = '') =>
  `<section class="app-section">${header ? `<h2 class="app-section-header">${esc(header)}</h2>` : ''}<ul class="app-list">${rows}</ul>${footer ? `<p class="app-section-footer">${footer}</p>` : ''}</section>`;

/** Core / Beyond badge. */
export const levelBadge = level => level === 'beyond' ? '<span class="app-badge beyond">Beyond</span>' : '<span class="app-badge">Core</span>';

/** Choice buttons (scenario options, drawers): letters A, B, C… */
export const choices = (items, attr = 'data-c') => `<div class="app-choices">${items.map((html, i) => `<button type="button" class="app-choice" ${attr}="${i}"><span class="app-choice-letter" aria-hidden="true">${'ABCDEFGH'[i] || i + 1}</span><span class="app-choice-text">${html}</span></button>`).join('')}</div>`;
