// Imports Dr Chew Shi Hao's exams page into this site: <source>/exams.html -> exams/index.html
// Keeps his design and exam content; swaps his personal-site header, search and footer
// for department navigation and a credit. Re-run when he sends an updated page:
//   node tools/import-exams.mjs "<folder containing exams.html and reference/>"
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
if (!src) throw new Error('Usage: node tools/import-exams.mjs <source folder>');
let h = readFileSync(join(src, 'exams.html'), 'utf8');

function replace(pattern, value, label) {
  const before = h;
  h = h.replace(pattern, value);
  if (h === before) throw new Error(`import-exams: "${label}" not found; the source page has changed`);
}

const NAV = `<a href="../">Home</a><a href="./" aria-current="page">Exams</a><a href="../popliteal/">Popliteal block</a><a href="https://naps2026.anantf.com/">NAPS 2026</a>`;
const CREDIT = `Exam resources written and curated by <a href="https://chewshihao.com/" rel="noopener">Dr Chew Shi Hao</a>, anaesthetist, MBBS 2013, MMed (Anaes) 2019.`;

// ---- head ----
replace(/<title>[^<]*<\/title>/, '<title>MMed exam resources — NTF Anaesthesia</title>', 'title');
replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="MMed (Anaesthesia) preparation: reflections, Part B and Part C resources by Dr Chew Shi Hao.">', 'description');
replace(/<meta property="og:title"[^>]*>/, '<meta property="og:title" content="MMed exam resources — NTF Anaesthesia">', 'og:title');
replace(/<meta property="og:description"[^>]*>/, '<meta property="og:description" content="MMed (Anaesthesia) preparation by Dr Chew Shi Hao.">', 'og:description');
replace(/<meta property="og:image"[^>]*>/, '', 'og:image');
replace(/<meta name="twitter:card"[^>]*>/, '', 'twitter:card');
replace(/<link rel="canonical"[^>]*>/, '<link rel="canonical" href="https://anantf.com/exams/">', 'canonical');
replace(/<link rel="(?:icon|apple-touch-icon)"[^>]*>/g, '', 'icons');
replace(/<link rel="preload" href="fonts\/[^>]*>/g,
  '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..600;1,400..600&family=Inter:wght@400..600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">',
  'font preloads');
replace(/@font-face\{[^}]*\}/g, '', 'font-face rules');   // fonts now come from Google Fonts

// ---- his general writing feed is only used by the site search, which we drop ----
replace(/<script>window\.ASTRA_POSTS=\[[\s\S]*?\];/, '<script>', 'ASTRA_POSTS');

// ---- header: department brand and navigation, keep theme + mobile menu ----
replace(/<a class="brand"[\s\S]*?<\/a><nav class="nav-links"[\s\S]*?<\/nav>/,
  `<a class="brand" href="../" aria-label="NTF Anaesthesia — home"><span class="brand-copy"><strong class="brand-name">NTF Anaesthesia</strong><span class="brand-details"><span class="brand-role">Education resources</span></span></span></a><nav class="nav-links" aria-label="Main navigation">${NAV}</nav>`,
  'header brand');
replace(/<div class="header-socials"[\s\S]*?<\/div>/, '', 'header socials');
replace(/<button class="icon-button search-trigger[\s\S]*?<\/button>/g, '', 'search buttons');
replace(/<nav class="menu-panel" id="mobile-menu" aria-label="Mobile navigation" hidden>[\s\S]*?<div class="mobile-identity">[\s\S]*?<\/div>/,
  `<nav class="menu-panel" id="mobile-menu" aria-label="Mobile navigation" hidden>${NAV}`, 'mobile menu');
replace(/<noscript><nav class="container" aria-label="Navigation">[\s\S]*?<\/nav><\/noscript>/,
  `<noscript><nav class="container" aria-label="Navigation"><p style="padding:16px 0;display:flex;gap:20px;flex-wrap:wrap">${NAV}</p></nav></noscript>`, 'noscript nav');

// ---- credit under the page title ----
replace(/(<h1>Pass MMed <em>\(Anaesthesia\)\.<\/em><\/h1>)/, `$1\n      <p class="exam-credit">${CREDIT}</p>`, 'hero title');
replace(/<\/style>/, '.exam-credit{margin-top:14px;max-width:62ch;color:var(--muted,inherit);font-size:1rem;line-height:1.55}.exam-credit a{color:inherit;text-decoration:underline;text-underline-offset:3px}</style>', 'style end');

// ---- footer ----
replace(/<p class="footer-note">[\s\S]*?<\/p><div class="footer-links">[\s\S]*?<\/div>/,
  `<p class="footer-note">${CREDIT} Reflections are his own views and do not represent the department or any institution. Materials are for education only and are not medical advice. All exam content © Chew Shi Hao.</p><div class="footer-links"><a href="https://chewshihao.com/" rel="noopener">chewshihao.com ↗</a><a href="mailto:contact@anantf.com">Contact ↗</a></div>`,
  'footer note');
replace(/<p>© Chew Shi Hao · Singapore<\/p>/, '<p>NTF Anaesthesia · Singapore</p>', 'footer lower');

// ---- search dialog and its shortcuts ----
replace(/<dialog class="command-dialog"[\s\S]*?<\/dialog>/, '', 'search dialog');
replace("if(!dialog||typeof dialog.showModal!=='function'){location.href='writing.html';return}", "if(!dialog||typeof dialog.showModal!=='function')return;", 'search fallback');
replace(/const destinations=\[[\s\S]*?\];/, 'const destinations=[];', 'search destinations');
replace(/href:'writing\.html#'\+encodeURIComponent\(p\.id\)/, "href:'#'", 'search post links');

const leftovers = ['coaching.html', 'index.html', 'csh.svg', 'fonts/', 'instagram', 'dr@chewshihao'].filter(s => h.includes(s));
if (h.replace('(exact writing.html accordion)', '').includes('writing.html')) leftovers.push('writing.html');
if (leftovers.length) console.warn('warning: still referenced:', leftovers.join(', '));

mkdirSync('exams', { recursive: true });
writeFileSync('exams/index.html', h);
cpSync(join(src, 'reference'), 'exams/reference', { recursive: true });
console.log(`exams/index.html written (${(h.length / 1024).toFixed(0)} KB); reference PDFs copied`);
