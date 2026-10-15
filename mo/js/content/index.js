// The learn modules, in the order they appear. GROUPS are the headings on the Learn screen.
import start from './start.js';
import preop from './preop.js';
import setup from './setup.js';
import induction from './induction.js';
import maintenance from './maintenance.js';
import emergence from './emergence.js';
import pacu from './pacu.js';
import pain_aps from './pain-aps.js';
import regional from './regional.js';
import sedation from './sedation.js';
import patients from './patients.js';
import emergencies from './emergencies.js';
import cases from './cases.js';
import good from './good.js';

export const GROUPS = {
  start: 'Start here',
  before: 'Before theatre',
  theatre: 'In theatre',
  oncall: 'Emergencies and on call',
  after: 'After theatre',
  techniques: 'Regional and sedation',
  patients: 'Special patients',
  cases: 'Common operations',
  good: 'Good practice',
};

export const MODULES = [start, preop, setup, induction, maintenance, emergence, pacu, pain_aps, regional, sedation, patients, emergencies, cases, good];
