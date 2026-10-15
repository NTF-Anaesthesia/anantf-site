// Drawings used by `figure` blocks (CONTENT.md, "FIGURES"). Each is one inline SVG string: a viewBox 360 units wide
// (1 unit is about 1 px on a phone), role="img", a <title> and <desc> for screen readers, text 12 units or more, the
// site's colours (anatomy in soft pinks, monitor and clinical colours keep their meaning). No scripts, images or
// foreignObject. Ids inside a drawing (clip paths, patterns) start with the figure's own prefix so they never clash.

const INK = '#272722';
const MUTED = '#55534d';
const WINE = '#633d3c';
const LINE = '#d7d2c8';
const PAPER = '#f7f5ef';
const INSET = '#eee9df';
const STRONG = '#8f8574';

const svg = (h, title, desc, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${h}" width="100%" role="img" font-family="NTF Sans, Inter, sans-serif" font-size="13" fill="${INK}"><title>${title}</title><desc>${desc}</desc>${body}</svg>`;

/** A small filled arrowhead at (x, y) pointing r, l, u or d. */
function tri(x, y, dir, fill, s = 1) {
  const a = 4.5 * s, b = 5 * s, c = 4 * s;
  const d = {
    r: `M ${x - c} ${y - a} L ${x + b} ${y} L ${x - c} ${y + a} Z`,
    l: `M ${x + c} ${y - a} L ${x - b} ${y} L ${x + c} ${y + a} Z`,
    u: `M ${x - a} ${y + c} L ${x} ${y - b} L ${x + a} ${y + c} Z`,
    d: `M ${x - a} ${y - c} L ${x} ${y + b} L ${x + a} ${y - c} Z`,
  }[dir];
  return `<path d="${d}" fill="${fill}"/>`;
}

// ------------------------------------------------------------------------------------------------ Mallampati

function mpPanel(x, y, cls, top, l1, l2) {
  // `top` is the height of the top of the tongue: the higher the tongue, the less of the throat you see.
  const tongue = `M 18 180 L 18 ${top + 14} Q 90 ${top - 14} 162 ${top + 14} L 162 180 Z`;
  const teeth = [55.5, 67, 78.5, 90, 101.5, 113, 124.5].map(tx => `<path d="M ${tx} 27 V 38" stroke="#cfc8bb" stroke-width="1"/>`).join('');
  return `<g transform="translate(${x} ${y})">
<ellipse cx="90" cy="78" rx="68" ry="56" fill="#e7a29e" stroke="#b9625f" stroke-width="1.5"/>
<g clip-path="url(#mp-mouth)">
<rect x="30" y="30" width="120" height="100" fill="#d9827d"/>
<path d="M 90 40 V 53" stroke="#c46c67" stroke-width="1.5"/>
<rect x="44" y="24" width="92" height="14" rx="2" fill="#fbf8f0" stroke="#cfc8bb"/>${teeth}
<path d="M 36 126 L 36 78 Q 36 54 90 54 Q 144 54 144 78 L 144 126 Z" fill="#eeb0ab"/>
<path d="M 54 126 L 54 84 Q 54 64 90 64 Q 126 64 126 84 L 126 126 Z" fill="#6e2329"/>
<ellipse cx="90" cy="110" rx="26" ry="20" fill="#86333a"/>
<path d="M 58 126 Q 70 110 65 94" stroke="#eeb0ab" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M 122 126 Q 110 110 115 94" stroke="#eeb0ab" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M 82 63 C 82 76 84 86 90 88 C 96 86 98 76 98 63 Z" fill="#eeb0ab" stroke="#c97570" stroke-width="1"/>
<path d="${tongue}" fill="#e0807d" stroke="#b9625f" stroke-width="1.5"/>
<path d="M 90 ${top + 6} V ${top + 44}" stroke="#c4625f" stroke-width="1.5"/>
</g>
<path d="M 60 112 C 58 132 66 150 90 150 C 114 150 122 132 120 112" fill="#e0807d" stroke="#b9625f" stroke-width="1.5"/>
<path d="M 90 128 V 144" stroke="#c4625f" stroke-width="1.5"/>
<text x="90" y="174" text-anchor="middle" font-size="15" font-weight="600" fill="${WINE}">Class ${cls}</text>
<text x="90" y="192" text-anchor="middle" fill="${MUTED}">${l1}</text>
<text x="90" y="208" text-anchor="middle" fill="${MUTED}">${l2}</text>
</g>`;
}

const mallampati = svg(438, 'Mallampati classes I to IV',
  'Four open mouths with the tongue out. Class I: soft palate, uvula, fauces and pillars all seen. Class II: soft palate, uvula and fauces seen; the tongue hides the pillars. Class III: only the soft palate and the base of the uvula. Class IV: only the hard palate; the tongue hides the soft palate.',
  `<defs><clipPath id="mp-mouth"><ellipse cx="90" cy="78" rx="57" ry="46"/></clipPath></defs>
${mpPanel(0, 4, 'I', 110, 'Soft palate, uvula,', 'fauces and pillars')}
${mpPanel(180, 4, 'II', 90, 'Soft palate, uvula', 'and fauces')}
${mpPanel(0, 222, 'III', 72, 'Soft palate and', 'base of uvula only')}
${mpPanel(180, 222, 'IV', 50, 'Hard palate only:', 'soft palate hidden')}`);

// ------------------------------------------------------------------------------------------------ Airway tests

const SKIN = '#f3dcd0';
const SKIN_LINE = '#a8807a';
const LIP = '#d9837f';

const airwayTests = svg(426, 'Three bedside airway tests',
  'Thyromental distance: from the tip of the chin to the thyroid notch with the head extended, normally at least 6 cm or 3 finger breadths. Mouth opening: the gap between the incisors, normally at least 3 cm or 2 finger breadths. Upper lip bite test: the lower incisors should reach the red border of the upper lip.',
  `<text x="4" y="16" font-size="14" font-weight="600">Thyromental distance</text>
<path d="M 70 196 C 66 170 58 150 50 128 C 40 100 44 60 70 40 C 92 24 130 22 152 32 C 162 38 166 46 166 54 C 166 58 163 60 163 62 C 170 68 180 76 182 80 C 183 84 176 86 169 86 C 171 90 172 94 171 96 C 168 98 168 99 170 101 C 171 104 170 107 167 109 C 171 114 175 120 174 126 C 173 131 170 134 166 135 C 152 138 140 142 132 148 C 128 151 126 155 127 160 C 122 166 118 180 118 196 Z" fill="${SKIN}" stroke="${SKIN_LINE}" stroke-width="1.5"/>
<ellipse cx="88" cy="88" rx="9" ry="14" fill="#ebcbbd" stroke="${SKIN_LINE}" stroke-width="1"/>
<path d="M 146 56 Q 152 60 158 57" stroke="${SKIN_LINE}" stroke-width="1.5" fill="none"/>
<g transform="translate(128 152) rotate(-24.34)">
<ellipse cx="7.7" cy="8" rx="7.3" ry="6.5" fill="#f8e8de" stroke="${SKIN_LINE}" stroke-width="1.2"/>
<ellipse cx="23.1" cy="8" rx="7.3" ry="6.5" fill="#f8e8de" stroke="${SKIN_LINE}" stroke-width="1.2"/>
<ellipse cx="38.5" cy="8" rx="7.3" ry="6.5" fill="#f8e8de" stroke="${SKIN_LINE}" stroke-width="1.2"/>
</g>
<circle cx="170" cy="133" r="3" fill="${WINE}"/>
<circle cx="128" cy="152" r="3" fill="${WINE}"/>
<text x="180" y="126" fill="${INK}">Chin</text>
<path d="M 127 157 L 130 181" stroke="${MUTED}" stroke-width="1"/>
<text x="124" y="195" fill="${INK}">Thyroid notch</text>
<text x="214" y="58" fill="${INK}">Chin tip to thyroid</text>
<text x="214" y="74" fill="${INK}">notch, head extended</text>
<text x="214" y="100" font-weight="600" fill="${WINE}">Normal: ≥ 6 cm</text>
<text x="214" y="116" fill="${INK}">(3 finger breadths)</text>
<path d="M 175 152 L 198 166" stroke="${MUTED}" stroke-width="1"/>
<text x="203" y="172" fill="${INK}">3 fingers</text>
<path d="M 0 206 H 360" stroke="${LINE}" stroke-width="1"/>
<g transform="translate(0 214)">
<text x="4" y="16" font-size="14" font-weight="600">Mouth opening</text>
<ellipse cx="104" cy="82" rx="42" ry="48" fill="#e7a29e" stroke="#b9625f" stroke-width="1.5"/>
<ellipse cx="104" cy="82" rx="33" ry="39" fill="#6e2329"/>
<rect x="84" y="42" width="40" height="12" rx="2" fill="#fbf8f0" stroke="#cfc8bb"/>
<rect x="86" y="110" width="36" height="11" rx="2" fill="#fbf8f0" stroke="#cfc8bb"/>
<path d="M 94 42 V 54 M 104 42 V 54 M 114 42 V 54 M 95 110 V 121 M 104 110 V 121 M 113 110 V 121" stroke="#cfc8bb" stroke-width="1"/>
<path d="M 176 56 H 100 A 12.5 12.5 0 0 0 100 81 H 176" fill="#f8e8de" stroke="${SKIN_LINE}" stroke-width="1.2"/>
<path d="M 176 83 H 100 A 12.5 12.5 0 0 0 100 108 H 176" fill="#f8e8de" stroke="${SKIN_LINE}" stroke-width="1.2"/>
<rect x="92" y="59" width="16" height="8" rx="4" fill="#fdf4ef" stroke="#c9a49a" stroke-width="1"/>
<rect x="92" y="86" width="16" height="8" rx="4" fill="#fdf4ef" stroke="#c9a49a" stroke-width="1"/>
<path d="M 56 54 H 80 M 56 110 H 82" stroke="${WINE}" stroke-width="1" stroke-dasharray="3 2"/>
<path d="M 60 59 V 105" stroke="${WINE}" stroke-width="1.5"/>
${tri(60, 58, 'u', WINE, 0.8)}${tri(60, 106, 'd', WINE, 0.8)}
<text x="52" y="87" text-anchor="end" font-weight="600" fill="${WINE}">≥ 3 cm</text>
<text x="4" y="156" fill="${INK}">Gap between the</text>
<text x="4" y="172" fill="${INK}">incisors ≥ 3 cm</text>
<text x="4" y="188" fill="${MUTED}">(2 finger breadths)</text>
</g>
<path d="M 180 214 V 404" stroke="${LINE}" stroke-width="1"/>
<g transform="translate(188 214)">
<text x="0" y="16" font-size="14" font-weight="600">Upper lip bite test</text>
<path d="M 14 30 H 158 V 104 C 158 128 124 136 86 136 C 48 136 14 128 14 104 Z" fill="${SKIN}" stroke="none"/>
<path d="M 68 42 C 62 40 62 32 70 30 C 74 22 98 22 102 30 C 110 32 110 40 104 42" stroke="${SKIN_LINE}" stroke-width="1.5" fill="none"/>
<path d="M 74 40 C 78 36 82 36 84 40 M 88 40 C 90 36 94 36 98 40" stroke="${SKIN_LINE}" stroke-width="1.2" fill="none"/>
<path d="M 80 48 V 62 M 92 48 V 62" stroke="#e3c3b5" stroke-width="1.5"/>
<path d="M 40 72 C 56 64 74 62 86 66 C 98 62 116 64 132 72 C 116 84 100 88 86 88 C 72 88 56 84 40 72 Z" fill="${LIP}" stroke="#b9625f" stroke-width="1"/>
<path d="M 46 100 C 64 92 108 92 126 100 C 114 118 58 118 46 100 Z" fill="${LIP}" stroke="#b9625f" stroke-width="1"/>
<path d="M 62 92 H 110 V 98 H 62 Z" fill="#e9a2a0"/>
<path d="M 63 93 V 70 Q 63 66 67 66 H 73 Q 75 66 75 70 V 93 Z M 75 93 V 69 Q 75 65 79 65 H 85 Q 87 65 87 69 V 93 Z M 87 93 V 69 Q 87 65 91 65 H 97 Q 99 65 99 69 V 93 Z M 99 93 V 70 Q 99 66 103 66 H 109 Q 111 66 111 70 V 93 Z" fill="#fbf8f0" stroke="#bfb8aa" stroke-width="1"/>
<path d="M 30 66 H 146" stroke="${WINE}" stroke-width="1.5" stroke-dasharray="4 3"/>
<text x="0" y="156" fill="${INK}">Bite the upper lip with</text>
<text x="0" y="172" fill="${INK}">the lower teeth: normal if</text>
<text x="0" y="188" fill="${INK}">they reach its red border</text>
<text x="0" y="204" fill="${MUTED}">(dashed line)</text>
</g>`);

// ------------------------------------------------------------------------------------------------ Drug trolley

function drawer(n, y, h, title, lines, tag) {
  const body = lines.map((l, i) => `<text x="66" y="${y + 40 + i * 17}" fill="#504e47">${l}</text>`).join('');
  const flag = tag ? `<rect x="244" y="${y + 9}" width="74" height="18" rx="9" fill="#fbe3c4" stroke="#c98a2e" stroke-width="1"/><text x="281" y="${y + 22}" text-anchor="middle" font-size="12" font-weight="600" fill="#6b4300">${tag}</text>` : `<rect x="274" y="${y + 12}" width="44" height="7" rx="3.5" fill="${STRONG}"/>`;
  return `<rect x="30" y="${y}" width="300" height="${h}" rx="3" fill="${INSET}" stroke="${STRONG}" stroke-width="1.2"/>
<circle cx="47" cy="${y + 18}" r="10" fill="${WINE}"/><text x="47" y="${y + 22.5}" text-anchor="middle" font-size="13" font-weight="600" fill="${PAPER}">${n}</text>
<text x="66" y="${y + 22}" font-size="14" font-weight="600">${title}</text>${body}${flag}`;
}

const drugDrawers = svg(440, 'The anaesthetic drug trolley and its five drawers',
  'A trolley with five drawers. Top drawer: common drugs such as propofol, antiemetics and reversal agents. Second drawer: antibiotics, lignocaine 1% and high-alert drugs, the blood pressure uppers and downers. Third drawer: potassium chloride 10 mmol, salbutamol and paracetamol. Fourth drawer: IV set-up items, infusion tubing, three-way taps and 50 mL syringes for TIVA. Last drawer: Bair Hugger forced-air warmer, tourniquet, drug trays and sevoflurane liquid.',
  `<rect x="18" y="14" width="324" height="12" rx="3" fill="${LINE}" stroke="${STRONG}" stroke-width="1.2"/>
<rect x="24" y="26" width="312" height="392" fill="#e2ddd2" stroke="${STRONG}" stroke-width="1.2"/>
${drawer(1, 32, 64, 'Top drawer', ['Common drugs: propofol,', 'antiemetics, reversal agents'])}
${drawer(2, 102, 64, 'Second drawer', ['Antibiotics, lignocaine 1%,', 'BP “uppers and downers”'], 'High-alert')}
${drawer(3, 172, 64, 'Third drawer', ['KCl 10 mmol, salbutamol,', 'paracetamol'])}
${drawer(4, 242, 82, 'Fourth drawer', ['IV set-up: infusion tubing,', '3-way taps, 50 mL syringes', 'for TIVA'])}
${drawer(5, 330, 82, 'Last drawer', ['Bair Hugger (forced-air', 'warmer), tourniquet, drug', 'trays, sevoflurane liquid'])}
<circle cx="56" cy="428" r="8" fill="${MUTED}"/><circle cx="304" cy="428" r="8" fill="${MUTED}"/>`);

// ------------------------------------------------------------------------------------------------ Syringe labels

const LABEL_ROWS = [
  ['#ffe14d', 'PROPOFOL', 'Induction agents', 'propofol, ketamine'],
  ['#ff8a1f', 'MIDAZOLAM', 'Benzodiazepines', 'midazolam'],
  ['#6cc4ea', 'FENTANYL', 'Opioids', 'fentanyl, morphine'],
  ['#ff5a5f', 'ROCURONIUM', 'Muscle relaxants', 'suxamethonium, rocuronium'],
  ['url(#sl-rev)', 'NEOSTIGMINE', 'Relaxant reversal', 'neostigmine, sugammadex'],
  ['#9fd25b', 'GLYCOPYRROLATE', 'Anticholinergics', 'atropine, glycopyrrolate'],
  ['#d7bde2', 'PHENYLEPHRINE', 'Vasopressors', 'phenylephrine, ephedrine'],
  ['url(#sl-hyp)', 'LABETALOL', 'Hypotensive agents', 'labetalol, GTN'],
  ['#b5ab95', 'BUPIVACAINE', 'Local anaesthetics', 'lignocaine, bupivacaine'],
  ['#f4c3a5', 'ONDANSETRON', 'Antiemetics', 'ondansetron'],
  ['#ffffff', 'CEFAZOLIN', 'Other drugs (white)', 'antibiotics, steroids'],
];

const syringeLabels = svg(410, 'Syringe label colours by drug class (ISO 26825)',
  'Eleven syringe labels. Yellow: induction agents. Orange: benzodiazepines. Blue: opioids. Fluorescent red: muscle relaxants. Red and white stripes: muscle relaxant reversal. Green: anticholinergics. Violet: vasopressors. Violet and white stripes: hypotensive agents. Grey: local anaesthetics. Salmon: antiemetics. White: other drugs.',
  `<defs>
<pattern id="sl-rev" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#fff"/><rect width="5" height="10" fill="#ff5a5f"/></pattern>
<pattern id="sl-hyp" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="10" height="10" fill="#fff"/><rect width="5" height="10" fill="#b48ac7"/></pattern>
</defs>
${LABEL_ROWS.map(([fill, drug, cls, eg], i) => {
    const y = 6 + i * 36;
    const striped = fill.startsWith('url');
    const name = striped
      ? `<rect x="12" y="${y + 6}" width="${drug.length * 8.6 + 10}" height="18" fill="#fff"/><text x="17" y="${y + 19.5}" font-size="12.5" font-weight="700">${drug}</text>`
      : `<text x="14" y="${y + 19.5}" font-size="12.5" font-weight="700">${drug}</text>`;
    return `<rect x="6" y="${y + 2}" width="150" height="26" rx="3" fill="${fill}" stroke="${STRONG}" stroke-width="1"/>${name}
<text x="168" y="${y + 13}" font-weight="600">${cls}</text><text x="168" y="${y + 28}" font-size="12" fill="${MUTED}">${eg}</text>`;
  }).join('\n')}`);

// ------------------------------------------------------------------------------------------------ Circle system

const TO_PT = WINE;     // gas going to the patient
const FROM_PT = STRONG; // gas coming back from the patient

function box(x, y, w, h, lines) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${INSET}" stroke="${STRONG}" stroke-width="1.2"/>${lines.map((l, i) => `<text x="${x + w / 2}" y="${y + 18 + i * 16}" text-anchor="middle"${i === 0 ? ' font-weight="600"' : ' font-size="12" fill="#504e47"'}>${l}</text>`).join('')}`;
}

const circleSystem = svg(492, 'The anaesthetic machine and circle breathing system',
  'Gas flows from the gas supply (oxygen, air and nitrous oxide from pipelines or cylinders) through the flowmeters and the vaporiser, which adds sevoflurane. This fresh gas joins the circle, passes the inspiratory one-way valve and goes down the inspiratory limb to the Y-piece and the patient. Breathed-out gas returns down the expiratory limb, through the expiratory one-way valve, past the bag or ventilator switch, and through the carbon dioxide absorber back to the inspiratory side. On the bag side the APL valve lets excess gas out to scavenging; the ventilator also vents to scavenging.',
  `<defs><pattern id="cs-gran" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2" fill="${LINE}"/></pattern></defs>
${box(4, 10, 114, 58, ['Gas supply', 'O2, air, N2O', 'pipes, cylinders'])}
${box(138, 10, 92, 58, ['Flowmeters', 'set the flow', 'in L/min'])}
${box(250, 10, 106, 58, ['Vaporiser', 'adds the', 'sevoflurane'])}
<path d="M 118 39 H 132 M 230 39 H 244" stroke="${TO_PT}" stroke-width="2.5"/>${tri(133, 39, 'r', TO_PT)}${tri(245, 39, 'r', TO_PT)}
<path d="M 270 68 V 144" stroke="${TO_PT}" stroke-width="3"/>${tri(270, 142, 'd', TO_PT)}
<text x="262" y="112" text-anchor="end" font-weight="600" fill="${TO_PT}">Fresh gas</text>
<path d="M 8 96 H 30" stroke="${TO_PT}" stroke-width="3"/><text x="38" y="100" font-size="12">gas to the patient</text>
<path d="M 8 118 H 30" stroke="${FROM_PT}" stroke-width="3"/><text x="38" y="122" font-size="12">gas from the patient</text>
<path d="M 52 210 V 150 H 300 V 262" fill="none" stroke="${TO_PT}" stroke-width="3" stroke-linejoin="round"/>
<path d="M 300 262 V 360 H 52 V 290" fill="none" stroke="${FROM_PT}" stroke-width="3" stroke-linejoin="round"/>
${tri(52, 180, 'u', TO_PT)}${tri(160, 150, 'r', TO_PT)}${tri(300, 234, 'd', TO_PT)}
${tri(300, 300, 'd', FROM_PT)}${tri(250, 360, 'l', FROM_PT)}${tri(100, 360, 'l', FROM_PT)}${tri(52, 328, 'u', FROM_PT)}
<rect x="18" y="210" width="68" height="80" rx="3" fill="url(#cs-gran)" stroke="${INK}" stroke-width="1.5"/>
<rect x="22" y="234" width="60" height="34" fill="${PAPER}"/>
<text x="52" y="248" text-anchor="middle" font-weight="600">CO2</text>
<text x="52" y="263" text-anchor="middle" font-weight="600">absorber</text>
<circle cx="300" cy="188" r="11" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>${tri(300, 187, 'd', TO_PT, 1)}
<text x="284" y="184" text-anchor="end" font-size="12">Inspiratory</text>
<text x="284" y="198" text-anchor="end" font-size="12">valve, one-way</text>
<text x="292" y="238" text-anchor="end" font-size="12" fill="${MUTED}">inspiratory limb</text>
<circle cx="300" cy="262" r="4" fill="${INK}"/>
<path d="M 300 262 H 338 V 276" fill="none" stroke="${INK}" stroke-width="3"/>
<text x="306" y="254" font-size="12" fill="${MUTED}">Y-piece</text>
<path d="M 338 276 L 330 283 M 338 276 L 346 283" stroke="${INK}" stroke-width="2"/>
<ellipse cx="329" cy="296" rx="8" ry="15" fill="#f0c4c0" stroke="#b9625f" stroke-width="1.2"/>
<ellipse cx="347" cy="296" rx="8" ry="15" fill="#f0c4c0" stroke="#b9625f" stroke-width="1.2"/>
<text x="336" y="328" text-anchor="middle" font-size="12" font-weight="600">Patient</text>
<text x="292" y="296" text-anchor="end" font-size="12" fill="${MUTED}">expiratory limb</text>
<circle cx="300" cy="326" r="11" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>${tri(300, 325, 'd', FROM_PT, 1)}
<text x="284" y="322" text-anchor="end" font-size="12">Expiratory</text>
<text x="284" y="336" text-anchor="end" font-size="12">valve, one-way</text>
<rect x="160" y="353" width="20" height="14" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
<path d="M 164 364 L 176 356" stroke="${INK}" stroke-width="1.5"/>
<text x="170" y="347" text-anchor="middle" font-size="12">Bag/vent switch</text>
<path d="M 170 367 V 376 H 140 V 396 M 170 376 H 272 V 394" fill="none" stroke="${INK}" stroke-width="2"/>
<circle cx="140" cy="385" r="6" fill="${PAPER}" stroke="${INK}" stroke-width="1.5"/>
<path d="M 137 387 L 140 382 L 143 387" fill="none" stroke="${INK}" stroke-width="1.2"/>
<text x="130" y="379" text-anchor="end" font-size="12">APL valve</text>
<path d="M 134 385 H 40 V 456" fill="none" stroke="${STRONG}" stroke-width="2" stroke-dasharray="5 3"/>
<path d="M 134 394 L 146 394 L 148 402 C 168 410 166 446 140 448 C 114 446 112 410 132 402 Z" fill="#f0e7d8" stroke="${INK}" stroke-width="1.5"/>
<text x="114" y="420" text-anchor="end" font-size="12">Reservoir</text>
<text x="114" y="434" text-anchor="end" font-size="12">bag</text>
<rect x="236" y="394" width="72" height="50" rx="3" fill="${INSET}" stroke="${INK}" stroke-width="1.5"/>
<text x="272" y="410" text-anchor="middle" font-size="12" font-weight="600">Ventilator</text>
<path d="M 248 424 L 256 416 L 264 432 L 272 416 L 280 432 L 288 416 L 296 424" fill="none" stroke="${STRONG}" stroke-width="1.5"/>
<path d="M 272 444 V 471 H 96" fill="none" stroke="${STRONG}" stroke-width="2" stroke-dasharray="5 3"/>
<rect x="4" y="456" width="92" height="30" rx="3" fill="${INSET}" stroke="${STRONG}" stroke-width="1.2"/>
<text x="50" y="475" text-anchor="middle" font-weight="600">Scavenging</text>`);

// ------------------------------------------------------------------------------------------------ Train-of-four

function tofPanel(x, y, hs, title, detail) {
  const xs = [26, 60, 94, 128];
  const ghosts = xs.map(bx => `<rect x="${bx}" y="26" width="26" height="74" fill="none" stroke="${LINE}" stroke-width="1.2" stroke-dasharray="3 3"/>`).join('');
  const bars = xs.map((bx, i) => (hs[i] ? `<rect x="${bx}" y="${100 - hs[i]}" width="26" height="${hs[i]}" fill="${WINE}"/>` : '')).join('');
  const labels = xs.map((bx, i) => `<text x="${bx + 13}" y="117" text-anchor="middle" font-size="12" fill="${MUTED}">T${i + 1}</text>`).join('');
  return `<g transform="translate(${x} ${y})">${ghosts}${bars}<path d="M 16 100 H 164" stroke="${INK}" stroke-width="1.5"/>${labels}
<text x="90" y="139" text-anchor="middle" font-size="14" font-weight="600" fill="${WINE}">${title}</text>
<text x="90" y="156" text-anchor="middle" fill="#504e47">${detail}</text></g>`;
}

const tof = svg(444, 'Train-of-four patterns',
  'Four bar charts of the four twitches. No block: four equal twitches, ratio 1.0. Fade: four twitches getting smaller, the fourth half the first, ratio 0.5. TOF count 2: only two small twitches, a moderate block. Count 0: no twitches, a deep block, or an intense block if the post-tetanic count is 0 too. A TOF ratio of at least 0.9 means recovery is enough to wake and extubate; fade cannot be seen or felt once the ratio is above about 0.4, so measure it.',
  `<text x="180" y="16" text-anchor="middle" fill="${MUTED}">Four stimuli 0.5 s apart: each bar is a twitch</text>
${tofPanel(0, 26, [74, 74, 74, 74], 'No block', 'count 4, TOFR 1.0')}
${tofPanel(180, 26, [74, 61, 48, 37], 'Fade', 'count 4, TOFR 0.5')}
${tofPanel(0, 190, [15, 6, 0, 0], 'TOF count 2', 'moderate block')}
${tofPanel(180, 190, [0, 0, 0, 0], 'No twitches', 'count 0: deep or intense')}
<rect x="0" y="362" width="360" height="80" fill="${INSET}"/>
<text x="10" y="383" font-weight="600">TOF ratio (TOFR) = T4 ÷ T1</text>
<text x="10" y="400">TOFR ≥ 0.9 before you wake and extubate.</text>
<text x="10" y="417" fill="#504e47">You can’t see or feel fade once TOFR is above</text>
<text x="10" y="433" fill="#504e47">about 0.4: no fade by eye does not mean 0.9.</text>`);

// ------------------------------------------------------------------------------------------------ Capnography

const MON = '#1d1f1c';      // monitor background
const CO2 = '#f5d33f';      // capnograph trace (yellow, as on the monitor)
const MON_TEXT = '#e9e5da';

function capPanel(x, y, title, d, lines, extra = '') {
  return `<g transform="translate(${x} ${y})">
<text x="0" y="14" font-weight="600">${title}</text>
<rect x="0" y="22" width="176" height="62" rx="4" fill="${MON}"/>${extra}
<path d="${d}" fill="none" stroke="${CO2}" stroke-width="2.2" stroke-linejoin="round"/>
${lines.map((l, i) => `<text x="0" y="${102 + i * 15}" font-size="12" fill="#504e47">${l}</text>`).join('')}
</g>`;
}

const capnography = svg(540, 'Capnograph shapes, normal and abnormal',
  'A normal capnograph: a flat zero baseline (phase I), a steep upstroke (phase II), a nearly flat alveolar plateau (phase III) whose end value is the end-tidal CO2, then a steep downstroke (phase 0) as the next breath comes in. Abnormal shapes: a shark fin with a slow sloping upstroke from obstruction such as bronchospasm or a partly blocked tube; a sudden loss of the trace to zero from disconnection, a tube out or in the oesophagus, or a blocked tube; a baseline that rises breath by breath from rebreathing (an exhausted absorber or a one-way valve stuck open); and a curare cleft, a notch in the plateau when the patient starts to breathe against the ventilator.',
  `<rect x="0" y="4" width="360" height="146" rx="6" fill="${MON}"/>
<text x="10" y="22" font-size="12" fill="#bdb8ad">CO2 mmHg</text>
<path d="M 36 54 H 352" stroke="#4a4a44" stroke-width="1" stroke-dasharray="3 3"/>
<text x="30" y="58" text-anchor="end" font-size="12" fill="#bdb8ad">40</text>
<text x="30" y="132" text-anchor="end" font-size="12" fill="#bdb8ad">0</text>
<path d="M 40 128 L 70 128 C 74 128 76 70 86 64 L 150 57 L 158 128 L 212 128 C 216 128 218 70 228 64 L 292 57 L 300 128 L 350 128" fill="none" stroke="${CO2}" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="150" cy="57" r="4" fill="#fff"/>
<text x="157" y="46" font-size="12" font-weight="600" fill="#fff">EtCO2</text>
<text x="118" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="${MON_TEXT}">III</text>
<text x="70" y="100" text-anchor="end" font-size="13" font-weight="700" fill="${MON_TEXT}">II</text>
<text x="162" y="100" font-size="13" font-weight="700" fill="${MON_TEXT}">0</text>
<text x="185" y="145" text-anchor="middle" font-size="13" font-weight="700" fill="${MON_TEXT}">I</text>
<g font-size="13">
<text x="4" y="172" font-weight="700" fill="${WINE}">I</text><text x="32" y="172">Baseline: dead-space gas, no CO2</text>
<text x="4" y="189" font-weight="700" fill="${WINE}">II</text><text x="32" y="189">Upstroke: alveolar gas arrives</text>
<text x="4" y="206" font-weight="700" fill="${WINE}">III</text><text x="32" y="206">Plateau: alveolar gas. Its end value is</text>
<text x="32" y="222">EtCO2, normally 35–45 mmHg</text>
<text x="4" y="239" font-weight="700" fill="${WINE}">0</text><text x="32" y="239">Downstroke: the next breath in</text>
</g>
<path d="M 0 250 H 360" stroke="${LINE}" stroke-width="1"/>
${capPanel(0, 258, 'Shark fin', 'M 6 76 L 16 76 C 22 52 40 42 70 38 L 74 76 L 92 76 C 98 52 116 42 146 38 L 150 76 L 170 76', ['Obstruction: bronchospasm,', 'COPD, kinked or partly', 'blocked tube'])}
${capPanel(184, 258, 'Sudden loss to zero', 'M 6 76 L 14 76 C 17 76 18 46 23 44 L 50 40 L 54 76 L 66 76 C 69 76 70 46 75 44 L 102 40 L 106 76 L 170 76', ['Disconnection, tube out or', 'in the oesophagus, blocked', 'tube. Check now.'])}
${capPanel(0, 400, 'Rising baseline', 'M 6 76 L 12 76 C 15 76 16 48 21 46 L 46 43 L 50 70 L 62 70 C 65 70 66 42 71 40 L 96 37 L 100 64 L 112 64 C 115 64 116 36 121 34 L 146 31 L 150 58 L 170 58', ['Rebreathing CO2: exhausted', 'absorber or a one-way', 'valve stuck open'], `<path d="M 6 76 H 170" stroke="#6b6a64" stroke-width="1" stroke-dasharray="3 3"/>`)}
${capPanel(184, 400, 'Curare cleft', 'M 6 76 L 14 76 C 17 76 18 46 23 44 L 42 42 L 46 54 L 50 42 L 70 40 L 74 76 L 92 76 C 95 76 96 46 101 44 L 120 42 L 124 54 L 128 42 L 148 40 L 152 76 L 170 76', ['Patient breathing against', 'the ventilator: the block is', 'wearing off'])}`);

// ------------------------------------------------------------------------------------------------ Supraglottic airway

const TISSUE = '#f2d6ca';
const TISSUE_LINE = '#b98a80';
const AIR = '#fdf8f4';
const MUCOSA = '#e8a6a2';
const MUCOSA_LINE = '#c27a75';
const BONE = '#ecdfbd';
const BONE_LINE = '#b9a77a';
const CART = '#e6e2ee';
const CART_LINE = '#9a90b0';
const DEV = '#bfe0d8';
const DEV_LINE = '#2f6f62';

const lma = svg(400, 'A supraglottic airway in place, side view',
  'A side view of the head and neck cut down the middle. The airway tube comes out of the mouth, runs along the hard palate and curves down the back of the throat. The cuff sits in the lower throat over the larynx: its bowl faces the opening of the larynx, with the epiglottis resting at its top, and its tip sits in the top of the oesophagus behind the larynx. Gas passes from the bowl into the larynx and down the trachea.',
  `<path d="M 86 0 C 82 20 72 32 70 44 C 70 50 74 54 72 60 C 62 72 46 86 38 94 C 35 99 42 104 56 104 C 52 110 50 118 50 124 C 50 127 52 129 55 130 L 55 142 C 50 146 50 152 54 156 C 58 160 60 164 58 168 C 52 178 52 192 62 198 C 80 206 110 212 128 218 C 134 224 134 232 136 240 C 136 248 128 254 130 262 C 132 280 138 320 144 400 L 274 400 L 274 0 Z" fill="${TISSUE}" stroke="${TISSUE_LINE}" stroke-width="1.2"/>
<path d="M 56 104 C 60 86 78 72 102 68 C 132 63 172 66 200 78 C 214 85 221 98 221 114 L 221 302 L 197 302 L 192 262 L 184 244 L 170 252 L 172 232 L 166 226 L 178 204 L 120 160 L 64 160 L 55 136 C 55 120 56 110 56 104 Z" fill="${AIR}"/>
<path d="M 200 78 C 214 85 221 98 221 114 V 400" fill="none" stroke="${TISSUE_LINE}" stroke-width="1.2"/>
${[92, 126, 160, 194, 228, 262, 296, 330, 364, 398].map(vy => `<rect x="228" y="${vy}" width="34" height="28" rx="4" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="1"/>`).join('')}
<path d="M 64 112 L 164 112 C 167 112 168 120 164 120 L 68 120 C 64 120 62 112 64 112 Z" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="1"/>
<path d="M 56 112 L 66 112 L 66 124 C 64 128 60 128 58 126 Z" fill="#fbf8f0" stroke="#b9b2a5" stroke-width="1"/>
<path d="M 58 142 C 60 140 64 140 66 142 L 66 154 L 58 154 Z" fill="#fbf8f0" stroke="#b9b2a5" stroke-width="1"/>
<path d="M 58 154 L 68 154 C 72 170 82 186 100 198 C 92 204 78 204 68 198 C 58 190 56 170 58 154 Z" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="1"/>
<path d="M 162 112 C 182 112 204 120 214 136 C 218 142 216 148 210 148 C 200 140 184 126 162 121 Z" fill="${MUCOSA}" stroke="${MUCOSA_LINE}" stroke-width="1"/>
<path d="M 66 156 C 72 146 92 140 120 139 C 150 138 170 144 180 156 C 188 168 186 188 178 204 C 174 212 170 218 166 222 C 160 228 154 232 148 232 C 126 228 100 214 78 198 C 66 188 62 168 66 156 Z" fill="#e39592" stroke="${MUCOSA_LINE}" stroke-width="1.2"/>
<ellipse cx="146" cy="232" rx="7" ry="4" fill="${BONE}" stroke="${BONE_LINE}" stroke-width="1"/>
<path d="M 134 244 L 144 242 L 150 286 L 140 288 Z" fill="${CART}" stroke="${CART_LINE}" stroke-width="1"/>
<path d="M 171 244 L 184 244 L 186 262 L 188 302 L 188 400 L 154 400 L 152 302 L 152 286 L 160 270 L 166 260 Z" fill="${AIR}"/>
<path d="M 152 302 V 400 M 188 302 V 400" stroke="${TISSUE_LINE}" stroke-width="1"/>
${[310, 326, 342, 358, 374, 390].map(ry => `<rect x="148" y="${ry}" width="7" height="9" rx="2" fill="${CART}" stroke="${CART_LINE}" stroke-width="1"/>`).join('')}
<path d="M 182 244 C 188 240 194 244 194 250 L 194 264 L 186 264 Z" fill="${MUCOSA}" stroke="${MUCOSA_LINE}" stroke-width="1"/>
<path d="M 188 264 L 197 264 L 198 302 L 189 302 Z" fill="${CART}" stroke="${CART_LINE}" stroke-width="1"/>
<rect x="148" y="290" width="8" height="12" rx="2" fill="${CART}" stroke="${CART_LINE}" stroke-width="1"/>
<ellipse cx="169" cy="274" rx="15" ry="2.6" fill="#f3c9c5" stroke="${MUCOSA_LINE}" stroke-width="1"/>
<path d="M 158 258 C 162 240 172 220 186 204 C 189 201 191 204 189 207 C 180 222 172 240 166 260 Z" fill="${MUCOSA}" stroke="${MUCOSA_LINE}" stroke-width="1"/>
<path d="M 196 302 H 221 V 400 H 196 Z" fill="#ecb7b2" stroke="${TISSUE_LINE}" stroke-width="1"/>
<path d="M 208 306 V 400" stroke="${MUCOSA_LINE}" stroke-width="1.2"/>
<path d="M 6 134 L 60 134 C 120 134 160 130 184 138 C 204 146 210 164 210 190" fill="none" stroke="${DEV_LINE}" stroke-width="13"/>
<path d="M 6 134 L 60 134 C 120 134 160 130 184 138 C 204 146 210 164 210 190" fill="none" stroke="${DEV}" stroke-width="9"/>
<rect x="0" y="125" width="12" height="18" rx="2" fill="#dfe9e6" stroke="${DEV_LINE}" stroke-width="1.2"/>
<path d="M 208 182 C 220 182 224 200 224 226 C 224 254 222 282 216 304 C 211 300 206 290 202 278 C 196 260 192 244 192 226 C 192 204 196 184 208 182 Z" fill="${DEV}" stroke="${DEV_LINE}" stroke-width="1.5"/>
<ellipse cx="197" cy="230" rx="4" ry="16" fill="${DEV_LINE}" fill-opacity="0.45"/>
<path d="M 196 240 C 186 246 176 252 172 264 L 170 326" fill="none" stroke="${WINE}" stroke-width="2" stroke-dasharray="4 3"/>${tri(170, 330, 'd', WINE)}
<text x="104" y="180" text-anchor="middle" font-weight="600" fill="${INK}">Tongue</text>
<text x="112" y="94" text-anchor="middle" font-size="12" fill="${MUTED}">Nasal cavity</text>
<g font-size="12" fill="${INK}">
<path d="M 22 142 V 240" stroke="${MUTED}" stroke-width="1"/><text x="4" y="253">Airway tube</text>
<path d="M 64 282 L 174 232" stroke="${MUTED}" stroke-width="1"/><text x="4" y="286">Epiglottis</text>
<path d="M 72 308 L 156 276" stroke="${MUTED}" stroke-width="1"/><text x="4" y="312">Vocal cords</text>
<path d="M 52 352 L 150 352" stroke="${MUTED}" stroke-width="1"/><text x="4" y="356">Trachea</text>
<path d="M 280 116 L 208 134" stroke="${MUTED}" stroke-width="1"/><text x="282" y="120">Soft palate</text>
<path d="M 280 212 L 218 222" stroke="${MUTED}" stroke-width="1"/><text x="282" y="202">Cuff: its</text><text x="282" y="216">bowl faces</text><text x="282" y="230">the larynx</text>
<path d="M 280 288 L 216 298" stroke="${MUTED}" stroke-width="1"/><text x="282" y="284">Tip in the</text><text x="282" y="298">oesophagus</text>
<path d="M 280 356 L 214 360" stroke="${MUTED}" stroke-width="1"/><text x="282" y="360">Oesophagus</text>
</g>`);

export const FIGURES = {
  mallampati: {
    caption: 'Mallampati classes I–IV: what you see with the patient sitting up, mouth wide open and tongue out. Class III and IV predict a harder laryngoscopy.',
    svg: mallampati,
  },
  'airway-tests': {
    caption: 'Three quick bedside tests: thyromental distance, mouth opening and the upper lip bite test. One poor result is a warning; several together make a difficult airway more likely.',
    svg: airwayTests,
  },
  'drug-drawers': {
    caption: 'What is in each drawer of the anaesthetic drug trolley at NTFGH. The second drawer holds the high-alert blood pressure drugs; potassium chloride in the third drawer is a high-alert drug too: never give it as a bolus.',
    svg: drugDrawers,
  },
  'syringe-labels': {
    caption: 'Syringe label colours (ISO 26825) show the class of drug, never which drug. Always read the name.',
    svg: syringeLabels,
  },
  'circle-system': {
    caption: 'Fresh gas joins the circle, goes to the patient through the inspiratory valve and comes back through the expiratory valve. The absorber takes out the CO2 so the gas can go round again.',
    svg: circleSystem,
  },
  tof: {
    caption: 'Train-of-four (TOF): the twitches fade, then disappear, as the block deepens. Aim for a measured TOF ratio of at least 0.9 before waking and extubation.',
    svg: tof,
  },
  capnography: {
    caption: 'A normal capnograph and four abnormal shapes. After intubation, a flat line means the tube is not in the trachea until proven otherwise.',
    svg: capnography,
  },
  lma: {
    caption: 'A supraglottic airway in place: the cuff sits over the larynx with its bowl facing the laryngeal opening, and its tip rests in the top of the oesophagus.',
    svg: lma,
  },
};
