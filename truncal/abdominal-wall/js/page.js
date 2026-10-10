// Abdominal wall page: wires the shared shell to this page's chapters and data.
import { bootPage } from '../../shared/js/shell.js';
import { BLOCKS } from './blocks.js';
import { renderAnatomy } from './anatomy.js';

const byId = Object.fromEntries(BLOCKS.map((b) => [b.id, b]));

bootPage({
  title: 'Abdominal wall blocks',
  eyebrow: 'Regional anaesthesia · Truncal blocks',
  lead: 'Lateral and subcostal TAP, rectus sheath, quadratus lumborum and ilioinguinal blocks: where the nerves run, how to see them and what each block covers.',
  searchPlaceholder: 'Search, e.g. groin, TAP, rectus sheath, dose',
  tiles: [
    { title: 'Cover a lower abdominal incision', desc: 'Lateral TAP: set-up, scan and dose', href: '#ch-tap' },
    { title: 'Cover an upper abdominal incision', desc: 'Subcostal TAP, under the costal margin', href: '#ch-subcostal' },
    { title: 'Cover a midline wound', desc: 'Rectus sheath block, both sides', href: '#ch-rsb' },
    { title: 'Cover the groin', desc: 'Ilioinguinal and iliohypogastric block', href: '#ch-iih' },
    { title: 'Practise the needle path', desc: 'Lateral TAP scan viewer, needle step', href: '#tap-step-needle' },
    { title: 'Compare QL types 1–3', desc: 'Where each needle tip goes', href: '#ql-types' },
    { title: 'Understand the nerve supply', desc: 'Why TAP misses the groin and above T10', href: '#anat-groin' },
    { title: 'Prepare for the exam', desc: 'TAP OSCE and written questions with model answers', href: '#tap-exam' },
  ],
  chapters: [
    { id: 'ch-anatomy', title: 'Anatomy: T6–L1 innervation', short: 'Anatomy', desc: 'The course of the nerves, where they enter the plane, and which block for which incision.', render: renderAnatomy },
    { id: 'ch-tap', title: 'Lateral TAP block', short: 'Lateral TAP', desc: 'T10–T12 below the umbilicus. MMed OSCE 2021 and 2024; MMed 2014 written.', block: byId.tap },
    { id: 'ch-subcostal', title: 'Subcostal TAP block', short: 'Subcostal TAP', desc: 'T6–T9 for the upper abdomen.', block: byId.subcostal },
    { id: 'ch-rsb', title: 'Rectus sheath block', short: 'Rectus sheath', desc: 'Midline wounds and catheters. MMed OSCE 2024.', block: byId.rsb },
    { id: 'ch-ql', title: 'Quadratus lumborum block', short: 'QL', desc: 'Types 1–3 in brief.', block: byId.ql },
    { id: 'ch-iih', title: 'Ilioinguinal and iliohypogastric block', short: 'Ilioinguinal', desc: 'L1: the groin.', block: byId.iih },
  ],
  synonyms: [['eoi', 'external oblique intercostal'], ['petit', 'landmark', 'blind'], ['catheter', 'catheters', 'infusion']],
});
