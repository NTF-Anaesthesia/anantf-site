// Drugs used by new MOs, with the department's doses and dilutions (MO handbook, 4th edition, 2026) where it gives them.
// Format: CONTENT.md, "Drugs". Doses are for adults. The drugs themselves are in drugs-core.js and drugs-more.js.
import { DRUGS_CORE } from './drugs-core.js';
import { DRUGS_MORE } from './drugs-more.js';

export const DRUG_GROUPS = {
  induction: { name: 'Induction and sedation' },
  inhalational: { name: 'Inhalational agents' },
  opioid: { name: 'Opioids' },
  nmb: { name: 'Muscle relaxants' },
  reversal: { name: 'Reversal' },
  vasopressor: { name: 'Vasopressors and inotropes' },
  hypotensive: { name: 'Lowering blood pressure and heart rate' },
  antiemetic: { name: 'Antiemetics' },
  analgesic: { name: 'Other pain relief' },
  la: { name: 'Local anaesthetics' },
  emergency: { name: 'Emergency and antidotes' },
  antibiotic: { name: 'Antibiotics' },
  other: { name: 'Other' },
};

export const DRUGS = [...DRUGS_CORE, ...DRUGS_MORE];
