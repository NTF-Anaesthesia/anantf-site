// Temperature (MODEL.md section 10): two compartments, core (about 66% of mass) and periphery, with a conductance that
// rises when anaesthesia opens the vascular shunts, so induction redistributes heat from the warm core to the cooler
// periphery (the large early fall). Heat production falls under anaesthesia; heat is lost to the theatre; cold fluids
// cool the core; forced-air warming adds heat to the periphery. Owns t.core, t.periph, t.warming.
//
// Energy balance: heat capacity = mass(kg) x 0.83 kcal/kg/°C; power in watts, dT = W x dt / (4186.8 x mass x 0.83).

const SPEC = 0.83;            // kcal/kg/°C [S]
const J_PER_KCAL = 4186.8;
const CORE_FRAC = 0.66;
const AMBIENT = 21;          // theatre default [D]
const PROD_PER_KG = 1.163;   // W/kg awake (about 1 kcal/kg/h) [S]
const GA_PROD = 0.7;         // heat production under GA (about -30%) [S]
const K_AWAKE = 23;          // W/°C core-peripheral conductance awake (gradient about 3.5 °C) [D]
const K_GA = 37;             // W/°C under anaesthesia (shunts open: redistribution, about -1.6 °C hour 1) [D]
const LOSS = 6.5;            // W/°C periphery to ambient (awake steady periphery about 33.5 °C) [D]
const WARMER = 55;           // W net, forced air (Brauer 2002: 40-64) [V]
const WATER_SPEC = 1.0;      // kcal/kg/°C, infused fluid

const dT = (watts, dt, mass) => (watts * dt) / (J_PER_KCAL * mass * SPEC);

export const temp = {
  name: 'temp',
  init(state) {
    const m = state.patient.weightKg;
    return { core: 36.8, periph: 33.5, ambient: AMBIENT, warming: false, mass: m, lastFluid: 0 };
  },
  step(prev, ctx) {
    const t = prev.temp, m = t.mass, dt = ctx.dt;
    const asleep = prev.pd && prev.pd.asleep;
    let warming = t.warming;
    for (const a of ctx.actions) if (a.type === 'warming') warming = !!a.on;
    const coreMass = m * CORE_FRAC, periphMass = m * (1 - CORE_FRAC);
    const prod = PROD_PER_KG * m * (asleep ? GA_PROD : 1);                 // W, into the core
    const k = asleep ? K_GA : K_AWAKE;
    const qCP = k * (t.core - t.periph);                                   // W, core -> periphery
    const qLoss = LOSS * (t.periph - t.ambient);                          // W, periphery -> ambient
    const qWarm = warming ? WARMER : 0;
    let core = t.core + dT(prod - qCP, dt, coreMass);
    const periph = t.periph + dT(qCP + qWarm - qLoss, dt, periphMass);
    // cold fluids cool the core: the volume given since the last step, at ambient temperature
    const given = prev.cv && prev.cv.fl ? Object.values(prev.cv.fl.given).reduce((a, b) => a + b, 0) : 0;
    const dVol = Math.max(0, given - t.lastFluid);                         // mL this step
    if (dVol > 0) {
      const kcal = (dVol / 1000) * WATER_SPEC * (core - t.ambient);        // heat removed
      core -= kcal / (coreMass * SPEC);
    }
    return { ...t, core, periph, warming, lastFluid: given };
  },
  trend(t) { return { tempCore: t.core }; },
};
