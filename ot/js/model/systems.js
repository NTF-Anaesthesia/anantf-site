// The subsystems in step order (DESIGN.md, "Step order"). With a Jacobi step the order changes no numbers; it is kept
// as the documented order so logs and debugging read naturally. Later PRs add volatile, pd, cardio and the rest.

import { pump } from './pump.js';
import { pk } from './pk.js';
import { pd } from './pd.js';
import { airway } from './airway.js';
import { rhythm } from './rhythm.js';
import { resus } from './resus.js';
import { cardio } from './cardio.js';
import { resp } from './resp.js';
import { volatile } from './volatile.js';
import { gas } from './gas.js';
import { temp } from './temp.js';
import { monitor } from './monitor.js';

export const SYSTEMS = [pump, pk, volatile, pd, airway, rhythm, resus, resp, gas, cardio, temp, monitor];
