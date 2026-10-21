// Teaching patients for the pump emulator. The four presets illustrate the model limits (see docs/PUMP.md).
import { Patient } from '../engine';

export interface Preset {
  id: string;
  name: string; // card title on the pump
  patient: Patient;
  teach: string; // plain-English teaching point for the panel
}

export const PRESETS: Preset[] = [
  { id: 'young', name: 'Young fit man', patient: { sex: 'M', age: 25, height: 180, weight: 75 },
    teach: 'The two models disagree most on the induction dose: Schnider\'s fixed small V1 (4.27 L) gives about 1 mg/kg for Ce 4, Eleveld about 2.6 mg/kg for the same Ce. At 25 y he is just outside the Schnider volunteers (26 to 81 y), so the emulator flags his age (the real pump\'s age limits are unverified). Compare the panel\'s matched target.' },
  { id: 'older', name: 'Older adult', patient: { sex: 'M', age: 80, height: 168, weight: 68 },
    teach: 'Age lowers Eleveld clearance (with an opioid) and V3; Schnider shrinks V2 and CL2 with age. The same Ce needs less drug, and the decrement time to Ce 1.0 is longer. The model predicts concentration, not effect: older patients are also more sensitive, so a lower target (about 1.5 to 3 µg/mL), stepwise increases and a slower induction are usual practice.' },
  { id: 'obese', name: 'Obese woman', patient: { sex: 'F', age: 45, height: 165, weight: 105 },
    teach: 'BMI 38.6: past the female James LBM peak (at this height LBM now falls as weight rises), so the pump refuses Schnider: its clearance subtracts LBM, so it would paradoxically rise with weight and the maintenance rate would grow ever larger. Eleveld runs; the reported Space Plus BMI above 30 behaviour can be switched on in the panel.' },
  { id: 'frail', name: 'Frail, sarcopenic', patient: { sex: 'F', age: 85, height: 155, weight: 42 },
    teach: 'Low weight and old age: a small bolus in mg, though on Schnider it is more per kg than the young man\'s (about 1.3 against 1.0 mg/kg at Ce 4) because V1 is fixed. Both models are near or outside their data (Schnider volunteers were 26 to 81 y and 44 to 123 kg), and the LBM and FFM formulas cannot see sarcopenia, so they overstate her lean mass. The model predicts concentration, not effect: frail patients are more sensitive, so a lower target (about 1.5 to 3 µg/mL) with stepwise increases is usual.' },
];

export const presetById = (id: string | null) => PRESETS.find((p) => p.id === id) ?? null;
