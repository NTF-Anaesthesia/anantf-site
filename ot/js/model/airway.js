// The airway (MODEL.md section 9). Per-patient hidden difficulty (drawn once from the `airway` sub-stream), an
// obstruction state machine under sedation, and the devices — face mask, supraglottic airway (SAD), tracheal tube
// (with placement and cuff) and front-of-neck access. The airway decides how much of the breathing reaches the
// alveoli and at what inspired oxygen: `resp.js` reads this slice and scales its delivered alveolar ventilation and
// FiO2, and sets a one-lung shunt. A patent airway (the default, and anything not explicitly made worse) leaves the
// breathing exactly as before, so every earlier calibration is unchanged.
//
// Contract (read by resp.js, and shown on the Airway tab):
//   aw.device      'none' (natural) | 'mask' | 'sad' | 'ett' | 'fona'
//   aw.obstruction 0..1 upper-airway obstruction (natural/mask, spontaneous) — pharynx collapses with depth/relaxant
//   aw.manoeuvre   'none' | 'jawThrust' | 'opa' | 'npa' (relieve obstruction)
//   aw.placement   for a tube: 'tracheal' | 'oesophageal' | 'endobronchial'
//   aw.cuff        tube cuff inflated (seals, stops the leak)
//   aw.toLungs     0..1 fraction of the delivered ventilation that reaches the alveoli (resp.js multiplies va by it)
//   aw.entrain     0..1 room-air entrainment at the mask (dilutes the inspired O2 — a leaky pre-oxygenation)
//   aw.oneLung     endobronchial: one lung ventilated (resp adds a shunt)
//   aw.view        the last laryngoscopy view seen (Cormack-Lehane 1..4), or 0
//   aw.attempts    laryngoscopy attempts so far (trauma worsens later views)
//   aw.features    the hidden true difficulty for this patient (for the debrief; not shown during the case)
//
// Actions: {type:'device', to}, {type:'manoeuvre', to}, {type:'laryngoscopy', video?}, {type:'intubate', placement?},
// {type:'cuff', inflated}, {type:'extubate'}.

const SAD_SEAL = 0.9;        // fraction of the tidal volume a well-seated SAD delivers (leak above its seal pressure) [D]
const ENDO_TOLUNGS = 0.6;    // one-lung ventilation delivers less and shunts the other lung [D]
const ENDO_SHUNT = 0.25;     // added shunt fraction with one lung down [D]
const FONA_TOLUNGS = 0.9;    // a surgical airway delivers most of the breath [D]

// draw the hidden difficulty for this patient from the `airway` sub-stream. Cormack-Lehane distribution roughly
// matches reported direct-laryngoscopy grades (grade 1 ~50%, 2 ~40%, 3 ~8%, 4 ~2%; incidence anchors in
// research/crises.md); a videolaryngoscope improves the view by about a grade [D].
function drawFeatures(ctx) {
  const d = ctx.rand('airway');
  const clDirect = d < 0.5 ? 1 : d < 0.9 ? 2 : d < 0.98 ? 3 : 4;
  const clVideo = Math.max(1, clDirect - (clDirect >= 3 ? 1 : clDirect === 2 ? 1 : 0));
  return {
    clDirect, clVideo,
    maskGrade: 1 + Math.round(3 * Math.max(0, ctx.rand('airway') - 0.6) / 0.4), // Han 1 (easy) .. 4 (impossible), mostly 1
    collapsibility: 0.6 + 0.4 * ctx.rand('airway'),                             // how readily the pharynx obstructs when sedated
    sadSeal: SAD_SEAL,
    fonaHard: ctx.rand('airway') < 0.1,
  };
}

const clamp = (x, lo, hi) => (x < lo ? lo : x > hi ? hi : x);

export const airway = {
  name: 'aw',
  init(state, ctx) {
    const features = ctx ? drawFeatures(ctx) : { clDirect: 1, clVideo: 1, maskGrade: 1, collapsibility: 0.8, sadSeal: SAD_SEAL, fonaHard: false };
    return {
      device: 'none', manoeuvre: 'none', placement: 'tracheal', cuff: false,
      obstruction: 0, toLungs: 1, entrain: 0, oneLung: false, view: 0, attempts: 0,
      features,
    };
  },
  step(prev, ctx) {
    const a = prev.aw;
    let { device, manoeuvre, placement, cuff, view, attempts } = a;
    const f = a.features;

    for (const act of ctx.actions) {
      if (act.type === 'device' && ['none', 'mask', 'sad', 'ett', 'fona'].includes(act.to)) {
        device = act.to;
        if (device === 'ett') { placement = act.placement || placement; }
        if (device !== 'ett') cuff = false;
      } else if (act.type === 'extubate') { device = 'none'; cuff = false; }
      else if (act.type === 'manoeuvre' && ['none', 'jawThrust', 'opa', 'npa'].includes(act.to)) manoeuvre = act.to;
      else if (act.type === 'cuff') cuff = !!act.inflated;
      else if (act.type === 'laryngoscopy') {
        attempts += 1;
        const grade = act.video ? f.clVideo : f.clDirect;
        view = Math.min(4, grade + (attempts > 2 ? 1 : 0)); // repeated attempts traumatise and worsen the view
        ctx.log({ kind: 'laryngoscopy', video: !!act.video, view });
      } else if (act.type === 'intubate') {
        device = 'ett';
        placement = act.placement || 'tracheal';
        cuff = true;
        ctx.log({ kind: 'intubate', placement });
      }
    }

    // obstruction under sedation, for a natural airway or a mask with spontaneous breathing: the pharynx collapses as
    // the patient deepens (abruptly near loss of consciousness) and when the upper-airway muscles are relaxed; a jaw
    // thrust, chin lift or an oro-/nasopharyngeal airway relieves it (Eastwood 2005, Hillman 2009 [V]; sizes [D]).
    const bis = prev.pd ? prev.pd.bisLike : 97, upper = prev.pd && prev.pd.nmb ? prev.pd.nmb.upperAirway : 1;
    const spont = prev.resp ? prev.resp.mode === 'spont' : true;
    const depth = clamp((80 - bis) / 45, 0, 1);
    const collapse = Math.max(f.collapsibility * depth, 1 - upper);
    const relief = manoeuvre === 'opa' ? 0.9 : manoeuvre === 'npa' ? 0.8 : manoeuvre === 'jawThrust' ? 0.6 : 0;
    const naturalObstruction = clamp(collapse * (1 - relief), 0, 1);

    // how much of the breath reaches the alveoli, and the inspired-O2 dilution, by device
    let obstruction = 0, toLungs = 1, entrain = 0, oneLung = false;
    if (device === 'ett') {
      toLungs = placement === 'oesophageal' ? 0 : placement === 'endobronchial' ? ENDO_TOLUNGS : 1;
      oneLung = placement === 'endobronchial';
      if (placement === 'tracheal' && !cuff) toLungs = 0.85; // a deflated cuff leaks
    } else if (device === 'sad') {
      toLungs = f.sadSeal;
    } else if (device === 'fona') {
      toLungs = f.fonaHard ? 0.7 : FONA_TOLUNGS;
    } else if (device === 'mask') {
      // a mask delivers through the upper airway, so obstruction still counts; the seal sets both delivery and the
      // room-air entrainment that dilutes a pre-oxygenation
      obstruction = spont ? naturalObstruction : 0;
      const seal = clamp(1 - 0.22 * (f.maskGrade - 1), 0.3, 1);
      toLungs = seal * (1 - obstruction);
      entrain = 1 - seal;
    } else {
      // natural airway: spontaneous breathing can obstruct; a controlled ventilator mode implies a secured airway
      obstruction = spont ? naturalObstruction : 0;
      toLungs = 1 - obstruction;
    }

    if (device === a.device && manoeuvre === a.manoeuvre && placement === a.placement && cuff === a.cuff &&
        view === a.view && attempts === a.attempts && obstruction === a.obstruction && toLungs === a.toLungs &&
        entrain === a.entrain && oneLung === a.oneLung) return a;
    return { ...a, device, manoeuvre, placement, cuff, view, attempts, obstruction, toLungs, entrain, oneLung };
  },
  rebase(a) { return a; },
  trend(a) { return { toLungs: a.toLungs }; },
};
