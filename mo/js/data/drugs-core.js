// Drugs, part 1: induction and sedation, opioids, muscle relaxants, reversal, local anaesthetics, emergency drugs and antidotes.
// Format: CONTENT.md, "Drugs". Department doses from the MO handbook (4th edition, 2026) where it gives them.

export const DRUGS_CORE = [
  {
    id: 'propofol', name: 'Propofol', group: 'induction', label: 'induction',
    cls: 'Intravenous anaesthetic',
    presentation: '1% emulsion: `200 mg` in `20 mL`',
    prep: 'Draw up neat',
    conc: { value: 10, unit: 'mg/mL' },
    doses: [
      { label: 'Induction', per: [1, 2], unit: 'mg/kg', weight: 'TBW', note: 'Less for the elderly, frail or shocked; more for the young and anxious.' },
    ],
    onset: '30–45 s', duration: '5–10 min after a single dose',
    notes: ['Pain on injection: a large vein, or lignocaine first, helps.'],
    cautions: ['Drops blood pressure, especially in the elderly and the hypovolaemic.'],
    local: 'Top drawer of the drug trolley.',
    source: 'handbook',
  },
];
