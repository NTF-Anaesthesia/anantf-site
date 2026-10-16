# Prototype checks (planning session, 14 Oct 2026)

> Throwaway Node prototypes run during planning to test whether the structures in `../MODEL.md` can reach their
> calibration targets. The prototype code stayed in the planning session's scratch space (plan only; nothing built);
> these are their reported results. Every tuned number here is a design choice [D] unless a source is named; nothing is
> clinically reviewed. `../MODEL.md` has been updated from these results.

## Inhaled agent uptake (MODEL.md section 3): circle circuit, FRC lung, three Gas Man tissue groups

I wrote a throwaway prototype of about 260 lines of plain Node ES modules, with no dependencies, in (planning scratch)/volatile. It models an 8 L well-mixed circle with fresh gas flow, rebreathing and an overflow of FGF − uptake − VO2, an FRC 2.5 L lung store, and three perfusion-limited tissues (VRG 6 L at 75.8% of CO, muscle 33 L at 18%, fat 14.5 L at 6%). I ran it with both the MODEL.md Yasuda-1989 partition coefficients and the Gas Man (De Wolf 2012) set, at VA 4 and CO 5, using explicit Euler at dt 0.1 s. Nothing under /home/user/anawj-site was changed.

Main findings:
1. **The planned structure fits the 30-min sevoflurane and isoflurane targets and the sevoflurane washout with no tuning.** With fixed FI and the Yasuda set, FA/FI at 1/5/10/30 min was:
   - desflurane 0.63/0.84/0.89/0.913, washout 5 min after stopping (FA/FA0) 0.089
   - sevoflurane 0.55/0.74/0.81/0.858, washout 0.148
   - isoflurane 0.40/0.57/0.66/0.736, washout 0.238
   - N2O (67%, concentration effect on) 0.73/0.94/0.96/0.973
   The Gas Man coefficient set gives almost the same numbers (iso 0.745 / 0.224).
2. **Two Yasuda targets cannot be reached with physiological inputs:**
   - **N2O 0.99 at 30 min.** The model gives 0.973 with the concentration effect and only 0.920 without it. Reaching 0.99 would need VA of about 10 L/min.
   - **Desflurane washout 0.14.** The model gives 0.089 (0.10 with a per-breath lung). Lowering VA during elimination, adding a two-unit V/Q lung, or raising the muscle or fat coefficient does not fix it. Only doubling desflurane's VRG coefficient (to 2.6 against a measured 1.3) gets 0.149, and that would wrongly slow desflurane's effect site.
3. **Giving the potent agents with 67% N2O, as Yasuda did, pushes the 30-min values above target.** Yasuda gave the potent agents with N2O 65–70% running throughout (both abstracts, checked). Started together: des 0.965, sevo 0.907, iso 0.779. With N2O started 30 min before: des 0.944, sevo 0.888, iso 0.762. A grid fit over VA and CO matches best with no N2O (VA 3.75, CO 5). So the targets work as plain wash-in numbers, but the second-gas setting cannot be copied literally.
4. **The 1/5/10-min Yasuda values could not be found.** Both journal sites return 403 and nothing is open access; Europe PMC turned up nothing usable. Those wash-in points remain unverified.
5. **The VRG is too slow to stand in for the BIS effect site.** For sevoflurane its rate is 0.372/min (half-time 1.87 min, time constant 2.69 min) against Mourisse ke0 0.48/min (half-time 1.44 min). That is about 29% slower, and ke0 also includes the EEG processing delay, so the true brain is faster still. MODEL.md's "close to" is generous.
6. **Low flow overestimates the published concentrations, but the flow effect is right.** Against Johansson 2002 (PMID 12088809; sevoflurane dial 2% fixed, 120 min):
   - Johansson: at FGF 1 L/min FI/dial 0.73 and Et/dial 0.64; at 2 L/min 0.82 and 0.73; Et/FI 0.88–0.89.
   - Model: at 1 L/min 0.82 and 0.73; at 2 L/min 0.91 and 0.82; Et/FI 0.89–0.90.
   - So the absolute values are about 0.09 too high, while the drop from 2 to 1 L/min (0.09) and Et/FI match exactly. CO 8 still leaves a gap of 0.06–0.07.
   - Holding Et at 1 MAC (2.05%) at 1 L/min, after a 5-min wash-in at 6 L/min with the dial at 6%, needs a dial of 1.8% at 15 min, 2.9% at 30–60 min and 2.7% at 120 min. That is a good teaching point.
7. **Numerics are not a concern.** dt 0.1 s Euler differs from a dt 0.01 s reference by at most 0.0002, and dt 1 s by at most 0.003. The largest rate × dt is 0.007, so it is far from unstable.
   - A per-breath tidal lung (RR 12, I:E 1:2, plug dead space) gives end-tidal 0.04–0.05 lower at 1 min, 0.01–0.015 lower at 30 min, and washout residuals 0.01–0.02 higher. The within-breath swing is about 3–5%.
   - The same tidal code at dt 0.5 s agrees within 0.002.
   - Continuous alveolar ventilation is fine for the numbers. Per-breath is needed only for drawing the agent waveform, and that can be made from continuous FI and FA.
   - One build lesson: the first tidal version blew up because lung volume drifted when phase was taken from a float modulo of time. Breath volumes must be clipped per breath and the lung volume reset to FRC at each breath start.

### Targets

| Target | Achieved | Pass |
|---|---|---|
| FA/FI 30 min N2O 0.99 | 0.973 with concentration effect (0.920 without); 0.982 at VA 6; 0.989 only at VA 10 | no |
| FA/FI 30 min desflurane 0.90 | 0.913 (Yasuda set), 0.910 (Gas Man set), fixed FI, no N2O; 0.944–0.965 if given with 67% N2O as in the study | yes |
| FA/FI 30 min sevoflurane 0.85 | 0.858 (Yasuda), 0.855 (Gas Man); 0.850 at VA 3.75; 0.888–0.907 with 67% N2O | yes |
| FA/FI 30 min isoflurane 0.73 | 0.736 (Yasuda), 0.745 (Gas Man); 0.762–0.779 with 67% N2O | yes |
| FA/FA0 5 min after stopping desflurane 0.14 | 0.089 continuous, 0.100 tidal; 0.124 only with VA 3 during elimination; not reachable with measured coefficients | no |
| FA/FA0 5 min after stopping sevoflurane 0.157 | 0.148 (Yasuda set), 0.144 (Gas Man), 0.157 at VA 3.75 | yes |
| FA/FA0 5 min after stopping isoflurane 0.22 | 0.238 (Yasuda set), 0.224 (Gas Man set) | yes |
| FA/FI at 1, 5, 10 min (Yasuda figures) | Model only (Yasuda set): des 0.63/0.84/0.89, sevo 0.55/0.74/0.81, iso 0.40/0.57/0.66, N2O 0.73/0.94/0.96; the published values could not be found (journal sites 403, no open-access copy) | no |
| VRG time constant close to sevoflurane BIS ke0 0.48/min | VRG rate 0.372/min (half-time 1.87 min vs 1.44 min), about 29% slower | no |
| Low flow sevoflurane dial 2%, 120 min: FI/dial 0.73 and Et/dial 0.64 at 1 L/min; 0.82 and 0.73 at 2 L/min; Et/FI 0.88 (new target) | 1 L/min: 0.82 / 0.73; 2 L/min: 0.91 / 0.82; Et/FI 0.89–0.90. About 0.09 too high; the gap between flows and Et/FI are right | no |
| dt 0.1 s explicit Euler accurate and stable | max error vs dt 0.01 s reference 0.0002; largest k·dt 0.007 | yes |
| Continuous alveolar ventilation adequate vs per-breath | tidal end-tidal 0.04–0.05 lower at 1 min, 0.01–0.015 lower at 30 min, washout +0.01–0.02; within-breath swing 3–5% | yes |

### Recommended changes

- **3. Inhaled agents, Calibration** (ot/MODEL.md): Change the N2O 30-min target from 0.99 to 0.97 ± 0.02, and require the concentration effect: inspired alveolar flow = VA + net uptake, with FRC held constant. _Why:_ Without the concentration effect N2O reaches only 0.92. With it, 0.973. Yasuda's 0.99 needs VA of about 10 L/min.
- **3. Inhaled agents, Calibration** (ot/MODEL.md): Keep desflurane washout 0.14 as a reference value but test it loosely (0.08–0.15) and record it as a known miss of the structure [D]. Test the ordering des < sevo < iso for washout and iso < sevo < des for wash-in. Do not tune desflurane's VRG coefficient to reach it. _Why:_ The model gives 0.089. Only doubling desflurane's VRG coefficient reaches 0.14, which would also slow its effect-site onset, the very thing the simulator should teach. Changing ventilation, V/Q, muscle or fat does not fix it.
- **3. Inhaled agents, Calibration** (ot/MODEL.md): Run the Yasuda tests as fixed FI with no N2O, VA 4, CO 5, FRC 2.5. Note that Yasuda gave the potent agents with 65–70% N2O and that the model then overshoots (sevo 0.89–0.91, des 0.94–0.97). Tolerance ±0.03 for the 30-min values and ±0.02 for sevo/iso washout. _Why:_ With fixed FI and no N2O, the 30-min values and the sevo/iso washouts land within 0.01–0.02 with no tuning. Adding the second-gas effect at Yasuda's 67% pushes them above target.
- **3. Inhaled agents, Calibration** (ot/MODEL.md): Replace 'the 1, 5 and 10 min wash-in points are in the papers' figures: read them before writing those tests' with: not obtainable this session (journal sites block access). Use the model's own values as regression checks only [D]: Yasuda set, fixed FI, no N2O, des 0.63/0.84/0.89, sevo 0.55/0.74/0.81, iso 0.40/0.57/0.66. _Why:_ Without the published curves these can only guard against unintended changes, not validate the model.
- **3. Inhaled agents, Effect site** (ot/MODEL.md): Use a separate effect compartment driven by arterial partial pressure (= FA), with ke0 0.48/min for sevoflurane [V, Mourisse 2007]. For other agents scale it by brain:blood relative to sevoflurane [D]: des 0.63, iso 0.51, N2O 0.74 /min. Keep the VRG as the uptake store only. Correct the text: the VRG time constant is 2.69 min (rate 0.372/min, half-time 1.87 min) against ke0 0.48/min (time constant 2.08 min, half-time 1.44 min), about 29% slower, not 'close'. _Why:_ Mourisse's ke0 includes the EEG processing delay, so the real brain equilibrates faster still. Using the VRG would make loss and return of consciousness and BIS changes lag by about 30% more than published.
- **3. Inhaled agents, Calibration** (ot/MODEL.md): Add a low-flow target from Johansson 2002 (PMID 12088809, sevoflurane dial 2%, 120 min): Et/FI 0.88 ± 0.03 at 1 and 2 L/min, and FI/dial and Et/dial about 0.09 higher at 2 L/min than at 1 L/min. Test absolute FI/dial (0.73 / 0.82) and Et/dial (0.64 / 0.73) at ±0.10 and say the model reads about 0.09 high. Teaching check [D]: holding Et 2.05% at 1 L/min after a 6 L/min wash-in needs the dial at about 2.9% at 30–60 min. _Why:_ The structure gets Et/FI and the flow difference exactly right but overestimates absolute values by about 0.09. Raising CO to 8 still leaves 0.06–0.07, so it is not a parameter slip. Possible causes, unmodelled: tissue-to-tissue diffusion, larger patients, vaporiser output below dial at low flow.
- **3. Inhaled agents, Circuit** (ot/MODEL.md): Spell out the circuit volume balance: overflow = max(0, FGF − agent and N2O uptake − VO2), leaving at circuit concentration. Inspired = circuit concentration. Expired return = VD·FI + VA·FA. VO2 is 0.2 L/min under GA (section 8). Note that side-stream sampling that is not returned changes nothing in a well-mixed circuit, because it only diverts gas that would otherwise leave as overflow. When overflow reaches 0 (minimal flow) the circuit volume falls: flag it as a bellows or bag warning. _Why:_ At 1 L/min, uptake and VO2 decide the dial-to-inspired gap. The prototype needed these rules spelled out, and the analyser-loss question comes up in teaching.
- **3. Inhaled agents / 0. Contract** (ot/MODEL.md): State that uptake uses continuous alveolar ventilation at dt 0.1 s (explicit Euler is fine: error under 0.0002, largest k·dt 0.007). Draw the agent waveform per breath from FI and FA for the monitor only. If a per-breath lung is ever used, clip breath volumes per breath and reset lung volume to FRC at each breath start. Optionally use FRC + VT/2 as the effective lung volume. _Why:_ A per-breath lung changes end-tidal by only 0.01–0.05 and costs complexity. A naive version with float-modulo phase drifted and blew up.
- **3. Inhaled agents, partition table** (ot/MODEL.md): Keep the Yasuda-1989 coefficients and note that the Gas Man set (De Wolf 2012) gives the same FA/FI within 0.01. The one material difference is isoflurane blood:gas 1.3 in Gas Man against 1.4, which moves iso washout from 0.238 to 0.224. _Why:_ It is reassuring that the choice of coefficient set hardly matters. Gas Man's isoflurane values sit closer to Yasuda's washout figure.

### New sources

- Johansson A, Lundberg D, Luttropp HH. The quotient end-tidal/inspired concentration of sevoflurane in a low-flow system. J Clin Anesth 2002;14:267-70. PMID 12088809 (abstract checked: dial 2%, 120 min; FGF 1 L/min FI 1.45%, Et 1.28%; FGF 2 L/min FI 1.64%, Et 1.46%; Et/FI 0.88 / 0.89)
- Candries E, De Wolf AM, Hendrickx JFA. Prospective validation of Gas Man simulations of sevoflurane in O2/air over a wide fresh gas flow range. J Clin Monit Comput 2022;36:1881-90. PMID 35318567, doi:10.1007/s10877-022-00842-0 (abstract checked: Gas Man MDPE about 0-1%, MDAPE 6-7% in maintenance; worse during the first 15 min of wash-in, MDPE 7-18%)
- Hendrickx JF et al. Effect of N2O on sevoflurane vaporizer settings during minimal- and low-flow anesthesia. Anesthesiology 2002;97:400-4. PMID 12151930 (abstract checked: qualitative only; N2O lowers the dial needed at 0.5 L/min, no effect at 1 L/min)
- Yasuda 1991 abstracts re-checked (PMID 2001028, 1994760): potent agents given for 30 min with N2O 65-70% continued throughout; FI des 2.0%, iso 0.4% or 0.6%, halothane 0.2%, sevo 1.0%

### Caveats

- **Missing curves.** The Yasuda 1/5/10-min values were not found: the journals return 403 and Europe PMC has no open-access copy. The intermediate numbers above are model output only.
- **Yasuda's N2O protocol.** It is ambiguous whether N2O started before the potent agents or together with them, so I ran both.
- **Simplifications.** The model leaves out lung tissue, tissue-to-tissue diffusion, metabolism and percutaneous loss, and assumes no shunt (Pa = FA). The tidal and V/Q variants were run without the N2O concentration effect.
- **Low flow.** These runs start low flow from t = 0, because the Johansson abstract does not say whether an initial high-flow phase was used.
- **Effect-site rates.** The per-agent ke0 values other than sevoflurane are my own scaling choices [D], not published values.
- **My own choices [D].** VO2 0.2 L/min, VD 2 L/min (VE 6) and a perfectly mixed circuit are my tuning choices, not published values.

## De-risking MODEL.md section 2 (IV PK, TCI, neuromuscular block) with a throwaway Node prototype

I built a small dependency-free ES-module prototype (3-compartment + effect-site engine, two TCI controllers, rocuronium/sugammadex NMB with 1:1 binding, and suxamethonium) and ran it against every MODEL.md section-2 target.

PK engine: explicit Euler at dt=0.1 s matches an RK4 reference at dt=0.01 s to 2-3 decimals for every drug (peaks and times differ by <0.002), and an independent eigenvalue calc of the Schnider matrix agrees with the simulated decay half-lives. The MODEL.md PK target table is REACHED as written: Marsh 140 mg bolus Cp0 8.77 mcg/mL (Cp 6.70/5.16/2.51 at 1/2/5 min); Marsh ke0 0.26 Ce peak 3.21 at 3.92 min and ke0 1.2 Ce peak 5.70 at 1.62 min; Schnider TTPE 1.52 min at 40 y (1.45 at 25 y, 1.71 at 75 y); Minto TTPE 1.43 min (1.23/2.26 at 20/80 y); fentanyl Shafer ke0 0.147 TTPE 3.16 min (ke0 0.117 gives 3.60). Context-sensitive half-times: Schnider ~2/3/8 min, Marsh ~6.7/8.6/12, Minto flat ~2.1 (short vs measured 3.2; assert with tolerance), fentanyl 17.8/70/256 min. All matched.

TCI: I implemented an effect-site controller in the Shafer & Gregg 1992 peak-targeting style (PMID 1629794, abstract read; own code, no GPL source) and a plasma controller by exact one-step inversion. Effect-site Schnider target 4 mcg/mL: Ce reaches 95% in 1.26 min, no Ce overshoot by construction, but plasma peaks at 13.4 mcg/mL (x3.35 the target) with a 70 mg first-minute induction dose; target 5 similar (Cp x2.15). Plasma-target mode caps Cp at the target (x1.00) but Ce lags (95% only at 6.6 min). Minto effect-site target 4 ng/mL: 95% in 1.09 min, Cp x3.10, 68 mcg first minute. Recomputing every 10 s vs every 1 s is near-identical (reach times within 0.05 min, slightly smaller steady-state ripple at 1 s): 10 s is fine. A 30-min run is 25-80 ms, trivially real-time. Step-down 4->3 shows the expected limitation that neither controller can actively remove drug (Ce just decays).

Neuromuscular block: the single biggest finding. A single symmetric ke0 effect site CANNOT satisfy both the rocuronium onset targets and the sugammadex reversal targets at once. Onset (0.6 mg/kg max block ~1.8 min) needs ke0~0.3/min; but sugammadex reversal (2 mg/kg at T2 -> TOFR 0.9 in ~1.5 min; 16 mg/kg -> T1 10% in ~1.2 min) needs ke0~1.2/min, because recovery is rate-limited by the effect-site washout half-life. With the planned ke0 0.16 reversal is ~3-4x too slow (2 mg/kg gives TOFR 0.9 at +11 min, not 1.5). FIX that works: a directional ke0 (slow ~0.3 when Ce is rising, fast ~1.2 when Ce is falling). With ke0_on 0.3 / ke0_off 1.2, Ce50 0.95 mcg/mL, Hill 3.5: 0.6 mg/kg max block 1.79 min, T1 25% 27 min; 1.2 mg/kg max block 0.79 min, T1 25% 59 min; sugammadex 2 mg/kg@T2 TOFR 0.9 +1.46 min, 16 mg/kg@3min T1 10% +1.31 min, 4 mg/kg@PTC1-2 +2.0 min. Onset and reversal both land. The planned Ce50 0.82/Hill 4 with ke0 0.16 gives onset/duration roughly right (0.6 mg/kg max block 2.5 min, T1 25% 41 min — a bit long/slow) but cannot fix reversal.

Sugammadex binding: instantaneous 1:1 equilibrium each step (solve the quadratic for free rocuronium) is stable and correct. An EXPLICIT kinetic binding reaction is stiff and BLOWS UP at dt 0.1 s once kon is realistic (>=60 /microM/min); kon<=6 is stable but artificially slow. Recommendation: use instantaneous equilibrium each step, as MODEL.md half-suggests. Binding in central compartment only vs central+peripheral made no visible difference to reversal times.

Suxamethonium (Roy 2002): the published ke0 0.058/min gives the right fast onset but T1 90% recovery ~22 min, about 2x the Lee 2009 target of 10.9 min — the slow ke0 makes the effect site drain too slowly. Tuning ke0 up to ~0.29 (Ce50 ~825 ng/mL, Hill 4) hits T1 10% 7.08 and T1 90% 10.89 min exactly, onset <1 min. Cholinesterase variants scale cleanly off the hydrolysis constant k (x0.5 -> ~15 min, x0.2 -> ~27 min, x0.05 -> ~99 min, x0.01 -> ~8 h).

### Targets

| Target | Achieved | Pass |
|---|---|---|
| Marsh 70 kg 2 mg/kg: Cp0 ~8.8 mcg/mL | Cp0 8.77; Cp 6.70/5.16/2.51 at 1/2/5 min | yes |
| Marsh ke0 0.26: Ce peak 3.2 at 3.9 min; ke0 1.2: Ce peak 5.7 at 1.6 min | 3.21 at 3.92 min; 5.70 at 1.62 min | yes |
| Schnider 40 y bolus TTPE 1.5-1.6 min; 1.45->1.71 over 25-75 y | 1.52 min; 1.45/1.71 at 25/75 y | yes |
| Minto 40 y TTPE ~1.4 min (1.23 at 20 y, 2.26 at 80 y) | 1.43 min; 1.23/2.26 at 20/80 y | yes |
| Fentanyl Shafer ke0 0.147 TTPE 3.2 min | 3.16 min (ke0 0.117 -> 3.60 min) | yes |
| CSHT after 1/3/8 h: Schnider ~2/3/8, Minto flat ~2-4, fentanyl ~18/70/256 min | Schnider 2.0/3.1/8.0; Minto 2.1 flat; fentanyl 17.8/70.1/256 min | yes |
| Euler dt 0.1 s identical to fine step to 2 dp | matches RK4 dt 0.01 s to 2-3 dp for all drugs; eigenvalue cross-check agrees | yes |
| Effect-site TCI reaches target within published time, no overshoot beyond limits | Schnider tgt 4: Ce 95% at 1.26 min, 0% Ce overshoot, but plasma x3.35; 10 s == 1 s recompute | yes |
| Rocuronium 0.6 mg/kg: max block ~1.8 min, T1 25% ~31 min | planned ke0 0.16/Ce50 0.82/Hill4: max block 2.5 min, T1 25% 41 min (slow/long); tuned ke0on 0.3 off 1.2/Ce50 0.95/Hill 3.5: 1.79 min, 27 min | yes |
| Rocuronium 1.2 mg/kg: onset ~1.0 min, T1 25% ~67 min | tuned: max block 0.79 min, T1 25% 59 min (slightly short) | no |
| Sugammadex 2 mg/kg@T2 -> TOFR 0.9 ~1.5 min; 4 mg/kg@PTC1-2 ~2.9 min; 16 mg/kg@3min -> T1 10% ~1.2 min later | with single ke0 0.16 UNREACHABLE (2 mg/kg gives +11 min); with directional ke0 (on 0.3/off 1.2): 1.46, 2.0, 1.31 min | yes |
| Sugammadex binding stable at dt 0.1 s | instantaneous equilibrium stable; explicit kinetic reaction blows up at kon>=60 /microM/min | yes |
| Suxamethonium 1 mg/kg: T1 10% at 7.1 min, T1 90% at 10.9 min | Roy ke0 0.058 gives T1 90% ~22 min (2x too long); tuned ke0 0.29/Ce50 825/Hill 4 gives 7.08/10.89 min exactly | yes |
| Suxamethonium cholinesterase variants (het ~15-30 min, homo hours) | scale hydrolysis k: x0.5->15, x0.2->27, x0.05->99 min, x0.01->~8 h | yes |

### Recommended changes

- **2, Rocuronium row + PK calibration targets** (ot/MODEL.md): Add that a single symmetric effect-site ke0 cannot meet both the rocuronium onset and the sugammadex reversal targets, and adopt a directional ke0 for rocuronium: ke0_on ~0.3/min (rising Ce, drives onset) and ke0_off ~1.2/min (falling Ce, drives recovery and reversal). Retune the adductor-pollicis PD to Ce50 ~0.95 mcg/mL and Hill ~3.5 (from the planned 0.82 / 4). Keep ke0 0.16 only if sugammadex reversal is accepted as qualitative (3-4x too slow). _Why:_ Prototype: planned ke0 0.16 makes 2 mg/kg@T2 reach TOFR 0.9 at +11 min (target 1.5). Directional ke0 0.3/1.2 gives onset 1.79 min AND reversal 1.46/1.31 min, both on target. [D] tuning choice; onset anchored to FDA label + Magorian 1993 PMID 7902034, reversal to Blobner 2010 / Lee 2009.
- **2, PK calibration targets (rocuronium 1.2 mg/kg)** (ot/MODEL.md): Relax the 1.2 mg/kg T1-25% target from 'about 67 min' to 'about 60-67 min', or lengthen it by nudging Ce50 up / CL down. The tuned model hits 59 min. _Why:_ Prototype best fit lands T1 25% at 59 min for 1.2 mg/kg while keeping the 0.6 mg/kg and reversal targets; 67 min is hard to reach simultaneously with Kleijn PK.
- **2, Suxamethonium row** (ot/MODEL.md): Flag that Roy 2002's published ke0 0.058/min reproduces onset but gives T1 90% ~22 min (2x the Lee 2009 target). Recommend tuning ke0 up to ~0.25-0.3/min with Ce50 ~800-1000 ng/mL and Hill 4-5 to hit T1 10% 7.1 / T1 90% 10.9 min; keep variants as a scale on the hydrolysis constant k. _Why:_ Prototype e_sux.mjs: Roy ke0 0.058 -> T1 90% 21.8 min; ke0 0.29/Ce50 825/Hill 4 -> 7.08/10.89 min exactly. [D] tuning; the slow published ke0 drains the effect site too slowly for the measured offset.
- **2, Sugammadex row** (ot/MODEL.md): State explicitly that the 1:1 binding is solved by instantaneous equilibrium (quadratic for free rocuronium) each 0.1 s step, NOT as an explicit kinetic reaction. _Why:_ Prototype d_sgx.mjs: an explicit bimolecular reaction is stiff and diverges at dt 0.1 s once kon is realistic (>=60 /microM/min); instantaneous equilibrium is unconditionally stable and matches reversal times.
- **2, 'The pump is not the patient' (TCI)** (ot/MODEL.md): Record that effect-site TCI drives plasma to ~2-3.5x the effect-site target transiently (Schnider tgt 4 -> Cp 13.4; Minto tgt 4 -> Cp 12.4) and that the Shafer-Gregg controller recomputed every 10 s is indistinguishable from every 1 s. Note neither controller can remove drug on a target step-down. _Why:_ Prototype b_tci.mjs. Confirms the 10 s recompute cadence is adequate and gives the 'behind the monitor' plasma-overshoot teaching numbers to assert in tests.
- **2 and research/pd.md section 7 (PTC)** (ot/MODEL.md): Anchor the PTC->TOF model to the measured ~16 min mean interval between first post-tetanic response and first TOF response in adults (Baykara 2002 PMID 12031756), rather than the current [U] heuristic. _Why:_ The prototype's heuristic PTC is unvalidated; Baykara 2002 gives a citable adult PTC->T1 interval to calibrate against.

### New sources

- Shafer SL, Gregg KM. Algorithms to rapidly achieve and maintain stable drug concentrations at the site of drug effect with a computer-controlled infusion pump. J Pharmacokinet Biopharm 1992;20(2):147-69. PMID 1629794 (abstract read; the two-algorithm effect-site TCI method the prototype reimplements)
- Baykara N, et al. Predicting recovery from deep neuromuscular block by rocuronium in children and adults. J Clin Anesth 2002;14(3):214-7. PMID 12031756 (adult PTC->first-TOF interval ~16 min; TOF4 appears 37-94 min after 1 mg/kg; for PTC-model calibration)

### Caveats

Prototype, not clinically reviewed; numbers are throwaway integrations to test structure, not the real engine. The directional-ke0 fix for rocuronium is my own design choice [D], not a published model — it is a pragmatic way to reconcile onset and reversal in one effect compartment; a physiologically purer alternative (sugammadex pulling drug out of a biophase sink, or modelling receptor occupancy with a junctional safety margin) was not prototyped. ke0_off, Ce50 0.95 and Hill 3.5 are tuning choices, as are the suxamethonium retuned ke0/Ce50/Hill; sources cited are for the TARGETS, not these values. TCI plasma-overshoot numbers depend on the assumed max infusion rate (1200 mL/h of 10 mg/mL propofol, 50 mcg/mL remifentanil). The PTC model remains an unvalidated heuristic. I could not pull the Kleijn 2011 full text (PMC/Europe PMC both failed with rate-limit/500); rocuronium PK equations were cross-checked against the opentiva Kleijn implementation and the research notes instead. Kinetic-binding kon was an assumed value (no in-vitro rate constant to hand) used only to demonstrate stiffness.

## Gas exchange and control of breathing (MODEL.md sections 7-8): de-risking the planned structure with a throwaway Node prototype

I built a dependency-free Node ES-module prototype (explicit Euler, dt=0.1 s) of the planned alveolar O2 store + Severinghaus ODC + shunt + Fick venous pool + CO2 fast store + Bouillon ventilatory control + Schnider/Minto PK. The planned STRUCTURE reaches every calibration target in sections 7-8, but two parameter rules in MODEL.md are wrong and must change, and two structural additions are needed.

KEY FINDINGS:
1. The FRC rule "30 mL/kg x0.8 supine x0.8 GA" = 1.344 L is TOO SMALL to reach Benumof's ~8 min preox apnoea with any realistic VO2. With 1.344 L you get ~5-6 min. The 8 min target needs an O2-holding FRC of ~2.0-2.1 L with a true blood store (vvO2 ~5200 mL) and VO2 ~210-230 mL/min. Fix: do NOT double-reduce FRC for the apnoea O2 store. Model the GA/atelectasis loss as INCREASED SHUNT (0.08 healthy), not as a shrunken gas-exchanging FRC. Double-counting it (shrink FRC and raise shunt) over-shortens apnoea. Keep the x0.8 x0.8 reduction only for the mechanics/compliance FRC in section 7, not the gas store.

2. Bouillon's constant-F indirect-response model under-predicts Nieuwenhuijs' RESTING ventilation depression: it gives ~9% (propofol 1 mcg/mL) and ~13% (remi 1 ng/mL) vs measured 13% and 28%, because it does not flatten the CO2-response slope, so CO2 feedback over-compensates. Adding a drug-induced reduction of the CO2 gain, Feff = F*(1-E)^1.5 [D], recovers both resting numbers (14% / 27%) AND keeps the fixed-PetCO2 depression ~E (38% / 53% vs measured 44% / 58%). This matches resp.md's own "reduce the slope" note and should be in MODEL.md section 7.

ACHIEVED NUMBERS (all with one locked base + per-condition scaling):
- Apnoea to SaO2 90%: healthy preox 8.46 min (tgt ~8); air 0.56 min raw + ~30 s oximeter lag => ~1 min (tgt 1-2); morbidly obese 3.42 min (tgt ~3.3); term pregnant 5.02 min (tgt ~4.9).
- Fall rate 90->40%: healthy 27%, obese 36%, pregnant 32% (tgt ~30%/min; Hardman open-airway 26, obstructed 33).
- Apnoeic oxygenation (open airway, 100% O2): SaO2 still 100% at 10 min, t50 >90 min (Hardman ~66 min) - qualitatively right, slightly over-optimistic (see rec 5).
- CO2 in apnoea: betaFast=59 mL/mmHg (VCO2 200) gives exactly +3.4 mmHg/min; adding a saturating venous-equilibration transient (Jmax 8.5 mmHg, tau 22 s) gives +11.3 mmHg first minute (tgt Stock +12 then +3.4). 
- Pre-oxygenation half-time matches 0.693*FRC/VA to within 1 s (25 vs 26 s at FRC 2.5/VA 4; 12 vs 13 s at VA 8). EtO2>=0.9 at ~77 s (single-compartment washes in faster than clinical 3 min - acceptable teaching approximation).
- EtCO2 gap = PaCO2 * vdAlvFrac: vdAlvFrac 0.06 -> 2.4 mmHg, 0.09 -> 3.6 mmHg (tgt 2-5).
- Propofol 2 mg/kg (140 mg) Schnider induction apnoea: kAT~0.11-0.12 gives ~24-29 s (tgt median 24 s, Drummond 1997). Propofol + remifentanil 2 ng/mL co-induction: ~1.6 min (tgt 1-3 min).

CAPNOGRAM/TIDAL QUESTION: Per-breath tidal ventilation at dt 0.1 s is NOT needed for the gas physiology. Continuous alveolar ventilation (vAlv L/min) in gas.js reproduces steady EtCO2, the PaCO2-EtCO2 gap and CO2 kinetics correctly. The capnogram WAVEFORM (phases I-III, shark-fin, curare cleft, oesophageal-then-zero, rebreathing baseline) is a display artifact: generate it in synth.js from the model's current EtCO2 plus per-breath templates, driven by breath events from resp.js on the wall-clock breath clock (exactly as DESIGN.md already plans). Per-breath features that need granularity (first-breath washout, oesophageal few-breaths, curare cleft) are handled by the breath-clock templates, not by running the gas ODE tidally.

### Targets

| Target | Achieved | Pass |
|---|---|---|
| Healthy preoxygenated apnoea to SaO2 90% ~8 min (Benumof 1997 PMID 9357902) | 8.46 min with FRC 2.1 L, VO2 230, vvO2 5200, shunt 0.08, FAO2 0.90 | yes |
| Healthy breathing air 1-2 min | 0.56 min (34 s) raw gas model; ~1 min once the plan's ~30 s pulse-oximeter lag is added in monitor.js | yes |
| Morbidly obese ~3.3 min (Berthoud 1991 196 s; Jense 1991 163 s) | 3.42 min with FRC 1.05 L, VO2 290, shunt 0.15, CO 6000, FAO2 0.88 | yes |
| Term pregnant ~4.9 min (McClelland 2008) | 5.02 min with FRC 1.5 L, VO2 280, shunt 0.10, CO 6500 | yes |
| Fall rate below 90% ~30%/min (Hardman & Wills 2006 PMID 16873387) | 90->40% average: healthy 27%, obese 36%, pregnant 32%/min | yes |
| Open airway 100% O2 apnoeic oxygenation, time to SaO2 50% ~66 min (Hardman 2000 PMID 10702447) | SaO2 still 100% at 10 min, t50 >90 min - direction right, over-optimistic because rising PACO2 is not fed back into the alveolar gas equation | no |
| PaCO2 in apnoea +12 mmHg first minute then +3.4 mmHg/min (Stock 1989 PMID 2516732) | betaFast=59 mL/mmHg gives exactly +3.4/min; venous-equilibration transient (Jmax 8.5, tau 22 s) gives +11.3 first minute | yes |
| Pre-oxygenation half-time = FRC/alveolar ventilation (Benumof 1999) | matches 0.693*FRC/VA to within 1 s (25 vs 26 s; 12 vs 13 s at VA 8) | yes |
| EtCO2 vs PaCO2 gap 2-5 mmHg | gap = PaCO2*vdAlvFrac; vdAlvFrac 0.06-0.09 gives 2.4-3.6 mmHg | yes |
| Propofol 2 mg/kg induction apnoea median ~24 s (Drummond 1997) | ~24-29 s with Schnider Ce + apnoeic-threshold right-shift kAT~0.11-0.12 | yes |
| Remifentanil 1 ng/mL lowers resting ventilation ~28%, propofol 1 mcg/mL ~13% (Nieuwenhuijs 2003 PMID 12552187) | Bouillon constant-F gives only 13%/9% (fail); with Feff=F*(1-E)^1.5 gives 27%/14% (pass) | yes |

### Recommended changes

- **8. Gas exchange (lung store / apnoea)** (ot/MODEL.md): Do NOT apply the x0.8 supine x0.8 GA double reduction to the O2-holding FRC. Use an apnoea O2 store FRC of ~2.0-2.1 L (near-normal denitrogenated FRC), and represent the GA/atelectasis loss as increased shunt (0.08 healthy) rather than a shrunken store. Keep the double-0.8 reduction only for the mechanics/compliance FRC in section 7. _Why:_ With FRC 1.344 L the prototype reaches only ~5-6 min to SaO2 90%; the 8 min Benumof target needs ~2.1 L. Double-counting the GA loss (shrink FRC AND raise shunt) over-shortens every apnoea scenario.
- **8. Gas exchange (defaults)** (ot/MODEL.md): Record the apnoea O2/CO2 parameters the prototype settled on: effective venous+tissue O2 store vvO2 = 5200 mL [D]; VO2 apnoea ~210-230 mL/min (note: MODEL's awake 3.5 mL/kg/min -25% GA = 187 lengthens healthy apnoea to ~9 min, still acceptable); shunt 0.08 healthy, 0.15 obese, 0.10 pregnant; CO2 fast-store capacitance betaFast = 59 mL CO2/mmHg (0.84 mL/kg/mmHg) for VCO2 200, giving +3.4 mmHg/min [D]. _Why:_ These are the concrete values that hit the calibration targets; MODEL.md currently names the CO2 capacitance only as 'chosen so apnoea gives 3.4 mmHg/min' without the number.
- **8. Gas exchange (CO2 stores, first-minute jump)** (ot/MODEL.md): Model Stock's +12 mmHg first-minute jump as a saturating venous-equilibration transient added to PaCO2 (Jmax ~8.5 mmHg, tau ~22 s) on top of the linear VCO2/betaFast rise, NOT as a second slow bicarbonate compartment that leaks CO2. _Why:_ A leaking fast<->slow two-compartment store flattens the later slope below 3.4/min; the transient-plus-single-store form reproduces +11.3 first minute then exactly +3.4/min.
- **7. Breathing: Drive (Bouillon ventilatory control)** (ot/MODEL.md): Add a drug-induced flattening of the CO2 response gain: Feff = F*(1-E)^1.5 [D] (i.e. the exponent F, not just VE0, falls with drug effect). Keep ke0,CO2, kel and the power-law otherwise as Bouillon. _Why:_ Bouillon's constant-F model under-predicts Nieuwenhuijs resting depression (13%/9% vs measured 28%/13%) because CO2 feedback over-compensates. Feff restores 27%/14% resting while keeping the fixed-PetCO2 depression ~E. Matches resp.md section 7's own 'reduce the slope' recommendation.
- **8. Gas exchange (apnoeic oxygenation, open airway)** (ot/MODEL.md): Couple the rising PACO2 back into the alveolar gas equation (PAO2 = FiO2*(PB-PH2O) - PACO2/RQ) during open-airway apnoeic oxygenation, so accumulating CO2 eventually displaces alveolar O2 and brings time-to-50% down toward Hardman's ~66 min. _Why:_ The prototype's mass-flow inflow keeps PAO2 near-maximal indefinitely (t50 >90 min) because it does not let CO2 squeeze O2 out of the alveolus; this over-states apnoeic-oxygenation duration.
- **8. Gas exchange (apnoeic threshold / induction apnoea)** (ot/MODEL.md): Record the apnoeic-threshold right-shift that reproduces propofol induction apnoea: AT = PaCO2,0 - 4 + kAT*E*PaCO2,0 with kAT ~0.11-0.12 [D] (plus a fixed opioid shift). apnoea when PeCO2 < AT. _Why:_ Gives ~24 s apnoea for propofol 2 mg/kg (Drummond) and ~1.6 min with remifentanil co-induction, emerging from the CO2 feedback rather than being scripted, as section 7 intends.
- **synth.js / resp.js capnogram** (ot/DESIGN.md): Confirm in the plan that gas.js uses CONTINUOUS alveolar ventilation (not tidal in/out at dt 0.1 s); the capnogram waveform and per-breath features (first-breath washout, oesophageal few-breaths-then-zero, curare cleft, rebreathing baseline) are generated in synth.js from the model's EtCO2 plus breath-clock templates emitted by resp.js. _Why:_ The prototype shows continuous alveolar ventilation reproduces EtCO2, the a-ET gap and CO2 kinetics correctly; running the gas ODE tidally is unnecessary and would couple the 0.1 s step to breath timing for no physiological gain.

### New sources

- Severinghaus 1979 ODC, PMID 35496 (S = 1/(23400/(P^3+150P)+1))
- Benumof 1997, Anesthesiology 87:979, PMID 9357902 (apnoea desaturation curves)
- Stock 1989, J Clin Anesth 1:328, PMID 2516732 (PaCO2 +12 first min then +3.4/min)
- Hardman, Wills & Aitkenhead 2000, Anesth Analg 90:619, PMID 10702447 (apnoeic oxygenation t50 11->66 min)
- Hardman & Wills 2006, BJA 97:564, PMID 16873387 (90->40% ~30%/min)
- Berthoud 1991, BJA 67:464 (obese 196 s)
- McClelland 2008, Anaesthesia 63:264 (term pregnant 4:52)
- Bouillon 2004 propofol indirect-response, Anesthesiology 100:240, PMID 14739795
- Nieuwenhuijs 2003, Anesthesiology 98:312, PMID 12552187 (resting depression 12.6%/27.7%)
- Drummond & el-Farhan 1997 (propofol induction apnoea median 24 s)
- Schnider 1998/1999 propofol PK/ke0, PMID 9605675 / 10360845
- Minto 1997 remifentanil PK/ke0, PMID 9009935

### Caveats

Prototype only (plan-only, as instructed). Explicit Euler at dt=0.1 s was stable for every scenario here (no stiffness seen); the PK/effect-site and CO2 relaxations have time constants >>0.1 s. Tuning choices [D] not from a primary source: vvO2 5200 mL, VO2 apnoea 210-230, the CO2 venous transient (Jmax 8.5, tau 22 s), Feff exponent 1.5, apnoeic-threshold kAT 0.11-0.12, and the per-condition FRC/shunt/CO/VO2 scalings for obese and pregnant - all chosen to fit the published targets, which should be owner-reviewed before any number is called validated. Sourced numbers (ODC, apnoea times, CO2 rates, Bouillon/Schnider/Minto params, Nieuwenhuijs, Drummond) are from the existing research notes with PMIDs. The air scenario relies on the separately-planned ~30 s oximeter lag (monitor.js) to reach 1 min; the raw gas model gives ~34 s, so the gas model and the display lag must be validated together. The single well-mixed alveolar compartment washes O2 in faster than real tidal breathing (EtO2 0.9 at ~77 s vs clinical ~3 min) - fine for teaching the FRC/VA time-constant law but not a literal pre-ox duration. Open-airway apnoeic oxygenation needs the PACO2-into-alveolar-gas-equation coupling (rec 5) before its duration is trustworthy.

## circulation (MODEL.md section 5; research/cardio.md sections 1-3)

I built a throwaway prototype of the hybrid circulation in plain Node ES modules with no dependencies (model.mjs is about 170 lines; the test scripts sit beside it). It has three linear compartments (systemic arteries, systemic veins, pulmonary). Unstressed volumes and EDPVR A are solved from the targets when the patient is created. Right and left atrial pressures come from a fixed 20-step bisection every 0.1 s step. Each beat latches its SV and delivers it as piecewise-constant flow over the RR interval; a beat that falls inside a step is split there, so each beat hands over exactly SV mL. The baroreflex is Ursino-style: filtered MAP, a sigmoid, then delay plus lag on heart period (vagal and sympathetic), SVR, venous unstressed volume and Ees. Propofol is Schnider PK plus a haemodynamic effect site (t1/2ke0 5.9 min). Phenylephrine is Anderson 2-compartment PK plus an effect site. The ventilator is volume control with constant flow, and pleural pressure is a fraction of alveolar pressure.

Explicit Euler at dt 0.1 s is stable everywhere I tried. The worst gap between dt 0.1 s and 0.01 s was 0.64 mmHg MAP and 0.21/min HR, under GA with IPPV and a 20% bleed. Volume is conserved to rounding only: 3e-11 mL drift in 1 h, 2e-9 mL in the bleed run.

The planned structure reaches the steady state, baroreflex sensitivity (open loop), awake and GA haemorrhage, propofol induction and PPV targets after tuning. It needs three changes:
1. An explicit decompensation mechanism. The baroreflex alone never decompensates.
2. A larger venous-capacitance reflex gain.
3. Separate HR and vascular reflex gains under GA.

Phenylephrine dose-response, cardiac output fall and reflex bradycardia are met. The 42 s peak is met only with a 14–20 s transit delay and a weak vascular reflex. The "wanes in about 5 min" target is not met with Anderson PK. Cost is about 3.1 µs per step, about 0.6 ms of CPU per wall-clock second at 20×.

Final parameters (all [D] unless noted):
- Compliances: Ca 1.5, Cv 125, **Cp 25** mL/mmHg.
- Rvr 0.06 mmHg·s/mL. Rsys 0.896 mmHg·s/mL between the arteries and veins, which gives a displayed SVR of (MAP − CVP)/CO = 15.9 WU.
- Rpv 0.044 mmHg·s/mL. Pulmonary compartment target 12 mmHg.
- Volumes: arteries 750 mL, pulmonary 600 mL, veins 3550 mL in total. Solved unstressed volumes: arteries 615, veins 2375, pulmonary 300 mL.
- Stressed volume 1550 mL with the pulmonary bed (systemic 1310 mL). Systemic MSFP 10.4 mmHg.
- LV: EDPVR V0d 10 mL, β 0.03 /mL, A solved as 0.181. V0 5 mL. Ees 1.58 mmHg/mL, from Chen 1998 (Ees = 0.91·Ea + 0.53 with Ea = R/T = 1.15). This gives EDV 137, EF 0.55 and LAP 8.
- RV: V0d 40 mL, β 0.025, A solved as 0.312. V0 50 mL. Ees 0.6 mmHg/mL. It ejects against the pulmonary compartment pressure.
- Baroreflex: T0 = 60/(118.1 − 0.57·age) = 0.6296 s at 40 y; aV 0.66 s, aS 0.2525 s; k 12 mmHg; afferent τ 2 s.
- Effector gains: GR 1.0; **GV 2000 mL** (±1000 mL, about 14 mL/kg); GE 0.6.
- Effector delays and lags: as in MODEL.md.
- Pulse pressure: PP = 0.9·SV/Ca (display only).

Results against each target:

**Steady state:** HR 72.0, SV 75.0, CO 5.40, MAP 90.0, BP 120/75, CVP 4.0, LAP 8.0, SVR 15.9 WU, exactly as targeted.

**Baroreflex:**
- Open-loop (clamped-MAP) slope: 19.0 ms/mmHg awake and 4.6 at a GA gain of 0.25 (Tanaka 1999: 4.4–6.2 under sevoflurane). HR range 47–158.
- A phenylephrine pressor test (Oxford method) run inside the closed-loop model reads only 10–12 ms/mmHg awake and 6.0 under GA.
- So 19 open-loop does not reproduce the 22.5 measured by pressor test. To match it, use k 8 and vagal τ 0.8 s, which gives an in-model pressor slope of 17.6 with open loop 28.5.

**Awake haemorrhage, 1%/min:**
- 10% loss: MAP −4%, HR +6. 20%: MAP −10%, HR +17. 30%: −19%, HR 104 (peak).
- Then decompensation: 35% −31% with HR 89; 40% −59% with HR 61.
- This needs GV 2000. With MODEL.md's 1400, MAP is −12% at 20%.
- It also needs a new empty-ventricle term:
  - It triggers when the latched LV EDV falls below 73 mL (0.53 of baseline), with sigmoid width 1.5 mL.
  - It inhibits the sympathetic drive to the HR and SVR limbs by 0.8 and adds vagal drive 0.7.
  - It does not touch the venous limb. Applying it to venous tone made a runaway collapse to MAP 0.
  - It is off under GA.
- Without that term, MAP falls steadily and HR keeps rising to 141 at 40%.

**GA haemorrhage:**
- GA test state (sevoflurane-like): SVR ×0.75, sympathetic ×0.9, HR-limb gain 0.25, vascular-limb gain 0.5, set point −15, Ees ×0.9. Baseline MAP 71 (−21%), HR 73.
- Bleeding at 1%/min: −9% at 10% loss, −15% at 15%, −22% at 20%. HR rises only 2–6.
- With a single gain of 0.25 on all limbs, the fall is −13%, −22%, −32%, and PPV overshoots.

**Propofol 2 mg/kg at 40 y:**
- SBP −17.9 mmHg (−15%) at 2 min and HR +3.1, inside Rolly's −13 to −19. Nadir −18.1 at 2.8 min; −15.4 at 10 min.
- Steady Ce 1 mcg/mL gives MAP −11.4% (Nieuwenhuijs 2003: −9.9%).
- Mapping: E = CeH/(CeH + 1.0); sympathetic scale 1 − 0.3E; SVR 1 − 0.15E; venous unstressed volume +100E mL; Ees 1 − 0.1E; reflex gain 1 − 0.3E; set point −15E.
- At 75 y the nadir comes later (3.9 min) but is not deeper (−17.1). "The elderly fall further" needs an age term.

**Phenylephrine (under GA):**
- Dose-response needs a fast front-end mixing volume (blood 5 L exchanging at 3 L/min with 8.3 L, adding up to Anderson's V1) plus a transit delay.
- Vascular gain 0.25, delay 14 s, ke0 1.5/min, EC50 6 ng/mL, SVR gain 0.98: 50/100/200 mcg give MAP +11.5/+15.5/+19.2. The 100 mcg peak comes at 43 s, with CO −0.72 L/min and HR −5.8.
- Vascular gain 0.5 needs a 20 s delay, EC50 3 and SVR gain 0.85, and still peaks at 29 s (+11.6/+15.6/+19.6, CO −0.82).
- At 5 min, +6.5 to 7 mmHg remains (about 45% of peak). "Wanes in about 5 min" is not met with Anderson PK.

**PPV (GA, volume control, Vt 8 mL/kg, RR 12, PEEP 5, I:E 1:2):**
- Pleural pressure = 0.4 × alveolar pressure, with no alveolar squeeze on the pulmonary compartment.
- Measured 120 s after each bleed: 5.6% at 0% loss, 11.2% at 10%, 16.5% at 15%, 24.5% at 20%. All targets met.
- This needs Cp 25. With Cp 20 the values are 6.2, 22.8 and 33.9%. Adding alveolar squeeze (0.3 × the alveolar-pleural difference) gives 13.8% when normovolaemic.
- At Vt 6 mL/kg: 3.6% and 12.2%.

**Not tested:** Sjøen 2026 (needs remifentanil), Roizen 1981, fluids, other drugs.

### Targets

| Target | Achieved | Pass |
|---|---|---|
| Stable at dt 0.1 s (explicit Euler) | Stable in every run. Worst /dt 0.1 − dt 0.01/: 0.64 mmHg MAP and 0.21/min HR (GA + IPPV + 20% bleed over 10 min); 0.17 mmHg after an instant 500 mL loss. No need for exponential updates. | yes |
| Exact volume conservation | Conserved to rounding only: drift 3e-11 mL in 1 h, 1.9e-9 mL in the bleed and IPPV run. It needs the flux-transfer form, pumped volume capped at the volume available, and bleed capped. Not bitwise exact. | yes |
| Steady state HR 72, SV 75, CO 5.4, MAP 90, CVP 4 (plus LAP 8, SVR 15.9 WU) | HR 72.0, SV 75.0, CO 5.40, MAP 90.0, 120/75, CVP 4.0, LAP 8.0, SVR 15.9 WU, solved at creation (unstressed volumes and EDPVR A). Stressed volume 1550 mL with the pulmonary bed (1310 mL systemic); systemic MSFP 10.4. | yes |
| Baroreflex sensitivity about 19 ms/mmHg awake; about a quarter (4–6) under sevoflurane | Open loop 19.0 ms/mmHg awake (aV 0.66, aS 0.2525, k 12, T0 0.6296 at 40 y); 4.6 at gain 0.25. A pressor test inside the closed-loop model reads only 10–12 awake (6.0 under GA), versus Tanaka's 22.5 measured the same way. | yes |
| HR reflex range about 47–158 | 47–158 | yes |
| Awake haemorrhage: MAP held to about 20% loss with HR rising (10%: HR +0–10, MAP −0–5; 20%: HR +15–25, MAP −5–10) | 10%: MAP −4%, HR +6. 20%: MAP −10%, HR +17. Needs GV 2000 mL; with GV 1400 it is −12% at 20%. | yes |
| Awake decompensation near 30% (relative bradycardia, steep fall) | Only with a new empty-ventricle term (EDV threshold 73 mL, inhibits the HR and SVR limbs 0.8, vagal +0.7). HR peaks at 104 at 28–30%, then 89 at 35% and 61 at 40%. MAP −19% at 30%, −31% at 35%, −59% at 40%. Without the term there is no decompensation (HR climbs to 141 at 40%). | yes |
| Under GA: hypotension from about 10–15% loss, smaller HR rise | GA test state (baseline MAP 71, HR 73; HR gain 0.25, vascular gain 0.5): −9% at 10%, −15% at 15%, −22% at 20%, HR +2 to +6. A single gain of 0.25 on all limbs gives −13%, −22%, −32%. | yes |
| Propofol 2 mg/kg: SBP −13 to −19 mmHg at 2 min, little HR change (Rolly 1985) | SBP −17.9 at 2 min, HR +3.1; nadir −18.1 at 2.8 min. Steady Ce 1 mcg/mL gives MAP −11.4% (Nieuwenhuijs: −9.9%). | yes |
| Elderly fall further and later (Kazama 1999) | At 75 y (t1/2ke0 10.2 min) the nadir is later (3.9 min) but not deeper (−17.1 vs −18.1). Needs an age covariate. | no |
| Propofol-remifentanil TCI: SAP −32%, HR −22% at 5 min (Sjøen 2026) | Not tested (needs the remifentanil mapping). | no |
| Phenylephrine 50/100/200 mcg: MAP +11.6/+15.6/+18.0 | +11.5/+15.5/+19.2 (vascular gain 0.25); +11.6/+15.6/+19.6 (vascular gain 0.5). Needs EC50 3–6 ng/mL (saturating) and front-end mixing PK. | yes |
| Phenylephrine peak about 42 s | 43 s at 100 mcg only with a 14 s transit delay, ke0 1.5/min and vascular gain 0.25. With vascular gain 0.5 and a 20 s delay the peak is 29 s. Larger doses peak earlier (28 s at 200 mcg) because the effect saturates. | no |
| Phenylephrine: CO −0.6 to −0.8 L/min, reflex bradycardia | CO −0.72 (gain 0.25) or −0.82 (gain 0.5) L/min at 100 mcg; HR −5.5 to −5.8/min under GA, −11/min awake. | yes |
| Phenylephrine effect wanes in about 5 min | Not met: +6.5 to 7 mmHg (about 45% of peak) still present at 5 min, +3.4 to 4 at 10 min. Anderson's slow plasma decline (k about 0.23/min) is the limit. | no |
| PPV normovolaemic, Vt 8 mL/kg, IPPV: 5–10% | 5.6% (pleural pressure = 0.4 × alveolar pressure, Cp 25); 3.6% at Vt 6 mL/kg. | yes |
| PPV after 15–20% loss under GA: 15–25% | 16.5% at 15%, 24.5% at 20% (11.2% at 10%). With Cp 20: 22.8% and 33.9%. Alveolar squeeze on the pulmonary bed overshoots (13.8% when normovolaemic). | yes |
| Cost per step | About 3.1 µs per step including the ventilator, mostly the two 20-step bisections with log() → about 0.6 ms CPU per wall-clock second at 20× in Node. | yes |

### Recommended changes

- **5. Circulation, Beats** (ot/MODEL.md): Write the LV and RV ejection as the pressure-loaded ESPVR: SV = EDV − V0 − (P_downstream − Ppl)/Ees, with downstream pressure = arterial compartment pressure (LV) or pulmonary compartment pressure (RV). At steady state this equals (EDV − V0)·Ees/(Ees + Ea), and Ea = Pes/SV becomes an output. Use LV Ees 1.58 mmHg/mL (Chen 1998 from Ea = R/T 1.15) instead of 1.8, so EDV 137, EF 0.55, LAP 8. Solve EDPVR A from the LAP and CVP targets at creation (A_lv 0.181, A_rv 0.312), as already done for the unstressed volumes. RV defaults [D]: V0d 40, β 0.025, V0 50, Ees 0.6. _Why:_ It uses the actual arterial pressure, so afterload (phenylephrine) and the Ppl afterload effect come out with no extra terms. The planned Ea ≈ R/T gives no sensible RV afterload, because the pulmonary downstream pressure is not near 0. With Ees 1.8 and the listed EDPVR the targets don't close (LAP about 5.5).
- **5. Circulation, Compartments** (ot/MODEL.md): Spell out the beat delivery: at each ventricular event, latch SV from the atrial pressures solved in that step, and deliver SV/RR as constant flow until the next beat. Split a step at the beat time so each beat delivers exactly SV mL. Cap pumped and bled volume at the volume available, and floor compartment pressures at 0. The Pra/Pla bisection (20 iterations over −15 to 60 mmHg, resolution about 7e-5) must use the current pump state: with no output (arrest, PEA, asystole), Pra = Psv. Under IPPV, Ppl enters both preload (Pra − Ppl, Pla − Ppl) and LV afterload (Psa − Ppl), and the pulmonary compartment's absolute pressure is transmural + Ppl. _Why:_ Without the step split and the caps, volume is not conserved and pressures went negative in collapse runs. The prototype's CVP was wrong in arrest (2.6 instead of about 10) because the solve still assumed a beating RV.
- **5. Circulation, Baroreflex** (ot/MODEL.md): Venous unstressed-volume gain GV 2000 mL (±1000 mL, about 14 mL/kg; inside Magder's up-to-18 mL/kg range) instead of 1000–1400; keep GR 1.0, GE 0.6, k 12, aV 0.66 s and aS 0.2525 s (age-40 T0 0.6296 s). Say that 19 ms/mmHg is the open-loop slope at the set point. A phenylephrine pressor test inside the closed-loop model reads only 10–12 ms/mmHg. If the target is meant to match Tanaka's 22.5 from a pressor test, use k 8 and vagal τ 0.8 s (model pressor slope 17.6, open loop 28.5) and re-check haemorrhage. Add the pressor-test measurement as a model test. _Why:_ With GV 1400 awake MAP is −12% at 20% loss, outside the −5–10% target; GV 2000 gives −10% with HR +17. The current target mixes an open-loop model number with a closed-loop human measurement.
- **5. Circulation, Baroreflex (anaesthetic blunting)** (ot/MODEL.md): Give anaesthetic blunting two gains: one on the HR limbs (sevoflurane 1–1.2 MAC: 0.25, as Tanaka) and a separate, milder one on the vascular limbs (SVR, venous unstressed volume, Ees), 0.5 in the prototype [D]. _Why:_ A single gain of 0.25 on all limbs gives MAP −22% at 15% loss and −32% at 20%, and PPV 34% at 15% loss. The split gives −15% and −22% with PPV in range. Tanaka measured only the HR slope.
- **5. Circulation, Haemorrhage targets** (ot/MODEL.md): Add an explicit decompensation (empty-ventricle) term; the Ursino baroreflex alone never produces Schadt & Ludbrook's second phase. Prototype [D]: - dc = 1/(1 + exp((EDV_latched − 0.53·EDV0)/1.5 mL)). - It multiplies the sympathetic drive to the HR and SVR limbs by (1 − 0.8·dc) and adds 0.7·dc vagal drive. - It leaves the venous capacitance limb alone, and it is off under GA (anaesthesia removes it). The result: HR peaks about 104 at 28–30%, then 89 at 35% and 61 at 40%; MAP −19% at 30% and −59% at 40%. A volume load at 32% loss restores MAP. _Why:_ Without it MAP falls progressively and HR rises to 141 at 40%. With venous withdrawal included, the term runs away to MAP 0.
- **5. Circulation, Defaults** (ot/MODEL.md): Pulmonary compliance 25 mL/mmHg instead of 20. Pulmonary compartment target 12 mmHg (one compartment between PAP 15 and LAP 8), Rpv 0.044 mmHg·s/mL. Venous compartment pressure 9.4 (Psv = CVP + Rvr·CO), Rsys 0.896 mmHg·s/mL; the displayed SVR stays (MAP − CVP)/CO = 15.9 WU. Report stressed volume as 1310 mL systemic (1550 with the pulmonary bed) and systemic MSFP 10.4. _Why:_ Cp 25 with pleural pressure = 0.4 × alveolar pressure gives PPV 5.6 / 16.5 / 24.5% at 0 / 15 / 20% loss; Cp 20 gives 6.2 / 22.8 / 33.9%. The resistance split was left implicit.
- **5. Circulation, PPV** (ot/MODEL.md): Pleural pressure = 0.4 × alveolar pressure, PEEP included, in mmHg (cmH2O/1.36). Don't add an alveolar squeeze term on the pulmonary compartment in the first version. Under GA the targets come out as: PPV 5.6% when normovolaemic, 11.2% at 10% loss, 16.5% at 15%, 24.5% at 20%, and 3.6% at Vt 6 mL/kg. PPV is measured per breath from beat pulse pressures. _Why:_ Adding 0.3 × (Palv − Ppl) to pulmonary pressure gave 13.8% when normovolaemic, out of range.
- **5. Circulation, Anaesthetic effects (propofol)** (ot/MODEL.md): Propofol haemodynamic mapping [D]: - E = CeH/(CeH + 1.0 mcg/mL), with CeH from the Kazama site (t1/2ke0 5.9 min at 40–59 y). - Sympathetic tone × (1 − 0.3E); SVR × (1 − 0.15E); venous unstressed volume +100E mL; Ees × (1 − 0.1E). - Reflex gain × (1 − 0.3E); set point −15E mmHg. Result: 2 mg/kg gives SBP −17.9 at 2 min with HR +3; Ce 1 steady gives MAP −11.4%. Note that with Schnider PK, CeH is already 3.0 at 2 min (peak 3.1 at about 3 min); re-check with Marsh. Add an age term (lower C50 or reflex gain with age): at 75 y the same mapping gives a later nadir (3.9 min) but not a deeper fall (−17.1). Also note the propofol/remifentanil target (Sjøen) needs the remifentanil limb and was not tested. _Why:_ Rolly and Nieuwenhuijs are met. The elderly target is not met by the ke0 change alone.
- **5. Circulation, Vasoactive drugs (phenylephrine)** (ot/MODEL.md): Phenylephrine: - PK: Anderson 2017 2-compartment model, with a front-end blood volume (5 L exchanging at 3 L/min with 8.3 L, so they add up to Anderson's V1 13.3 L) [D]. - Transit delay 14–20 s, then an effect site with ke0 1.5/min; A = Ce/(Ce + EC50), EC50 3–6 ng/mL. - SVR × (1 + 0.85–0.98·A); venous unstressed volume −150·A mL. Relax or re-source two targets: - "Peak about 42 s" is reached only with a weak vascular reflex (gain 0.25), and larger doses peak earlier because the effect saturates. - "Wanes in about 5 min": with Anderson PK, about 45% of the peak remains at 5 min. Either find PK with a faster early decline or change the target to "about half gone by 5 min". _Why:_ The flat dose-response (+11.6/+15.6/+18.0) needs a saturating EC50. With the arterial τ of 1.4 s and the vascular reflex, the MAP peak comes 3–20 s after the effect-site rise unless a delay is added. Anderson's V1 alone keeps Cp high too long.
- **6. Rhythms (VF arterial decay)** (ot/MODEL.md): Mark Schipke's arrest targets (τ 2.9 s towards 24 mmHg, CVP rising to 11) as not reachable with the current structure. With SV = 0 the prototype's MAP decays with τ about 1.4 s (Rsys·Ca) towards about 11 mmHg. Matching needs an arterial critical closing (waterfall) pressure in the systemic flow, Qsys = (Psa − max(Psv, Pcrit))/R; I did not test this. _Why:_ A structural limit found while testing arrest.
- **Tests for M2.1** (ot/DESIGN.md): Add model tests: - Volume drift below 1e-6 mL over 1 h. - dt 0.1 against dt 0.01 within 1 mmHg in a GA + IPPV + bleed run. - An open-loop clamped-MAP sensitivity test and an in-model pressor-test (Oxford) slope. - The haemorrhage table at 1%/min, awake and under GA. - PPV at 0, 15 and 20% loss. A cost budget of under 10 µs per step is ample: the prototype runs about 3 µs. _Why:_ These are the checks the prototype ran, and they caught the open-loop versus pressor-test BRS mismatch and the need for decompensation.

### Caveats

- **Tuning, not literature:** every new number here is my own tuning [D]. That covers GV 2000, Cp 25, the decompensation term, the split GA gains, the propofol mapping, the phenylephrine front-end PK, delay and EC50, and the RV parameters. I added no new literature values, so there are no new PMIDs.
- **GA state:** the GA state used for the haemorrhage, phenylephrine and PPV tests is a hand-set sevoflurane-like input, not the planned volatile PD.
- **Phenylephrine evidence base:** Schwinn's patients were anaesthetised CABG patients, so I tuned phenylephrine under GA. Awake, 100 mcg gives MAP +10 at 19 s and HR −11.
- **Pulse pressure is display-only:** PP = 0.9·SV/Ca, so PPV here equals SV variation and SBP is MAP + 2/3·PP.
- **Ordering of the tuning:** awake haemorrhage, BRS and propofol were tuned before the final change to Cp 25. run-all.mjs re-ran them with the final parameters, and those consolidated numbers are the ones reported. The propofol mapping was not re-tuned for the age-75 case.
- **Not tested:** fluids, other drugs, Sjøen 2026, Roizen 1981, filling-time loss and atrial kick.
- **Precision:** conservation holds to floating-point rounding only, not bitwise. Math.exp and Math.log feed the state, so golden tests across browsers need a tolerance.

## Deterministic maths (fmath.js, rng) and the MODEL.md section 4 drug-effect surfaces

PART A, fmath. I wrote exp, log, pow (x >= 0), sin and cos from + - * / plus operations the spec defines exactly: Math.floor, DataView bit access, and a table of powers of two built by exact doubling. They follow fdlibm 5.3 (Cody-Waite range reduction plus the fdlibm polynomials). I measured against a 60-digit Python decimal reference, 20,000 seeded inputs per range:
- exp on -50..50: max 1.19 ulp (2.1e-16 relative).
- log on 1e-12..1e6: 0.73 ulp (1.4e-16).
- sin and cos on +/-1000 and on 0..2pi: 0.72 ulp (1.2e-16).
- pow as exp(y*log x), Hill exponents 1.2-8 with bases 0-100: 53 ulp (6.4e-15). With exponents -2..2: 14 ulp (1.8e-15).
- All well inside the planned 1e-12.

Cross-engine checks, Node 22.22 (V8) against Bun 1.4.2 (JavaScriptCore, Safari's engine):
- fmath gave bit-identical results on both engines for every input.
- Math itself differs between V8 and JSC: exp in 9.6% of calls, log 3.0%, pow 10%, sin and cos about 3.4%.
- In a 200-patient, 2-hour mini-model, the trajectory hashes differed between engines with Math (eedb512b vs 1fec4740) and matched with fmath (11f911a4 on both).
- Discrete events (move/no-move, a BIS threshold) came out the same in all 200 patients with either library. The differences stay near 1e-15, so without fmath, replays are close but not exact.
- New finding: the `**` operator is also implementation-approximated. On V8, x**3 differed from x*x*x in 27.6% of 1e6 inputs; on JSC in 0%. So x**3 itself differs between engines.
- sfc32 (|0, >>>, ^, <<, Math.imul) gave the same hash for 1e7 draws on both engines.
- Math.sqrt gave the same hash on both, and x**0.5 equalled sqrt.

Speed (V8 / JSC, ns per call): exp 28 / 33 vs Math 11 / 7; log 46 / 37 vs 10 / 7; pow 90 / 79 vs 64 / 22; sin 51 / 37 vs 26 / 26. That is 1.4x to 5x slower. Even at 100 transcendental calls per step and 2000 steps a second, this is about 2% of one core, so fmath is worth having. A typed-array alias in place of DataView gave no speed-up.

The spec (ECMA-262 2025, read from tc39.es):
- Exact: Number::add and Number::multiply (6.1.6.1.7, 6.1.6.1.4) use IEEE 754-2019 binary64 with exact rounding. Math.sqrt (21.3.2.33) returns F(sqrt n), i.e. correctly rounded, and is not in the approximated list. Math.imul (21.3.2.20), the bitwise ops (NumberBitwiseOp 6.1.6.1.16) and the shifts (6.1.6.1.9-11) are exact modular integer ops. Math.fround (21.3.2.17), Math.floor (21.3.2.16) and Math.round (21.3.2.29) are exact.
- Implementation-approximated (definition 4.4.1): exp, log, pow, sin, cos, tan, tanh, atan, cbrt, hypot, expm1, log1p and the rest of the list in the 21.3.2 note. The spec only recommends fdlibm. Number::exponentiate (6.1.6.1.3, the `**` operator) is approximated too.
- So an integer-exact generator like sfc32 is identical on every conforming engine.
- Firefox (SpiderMonkey) was not tested: no Firefox binary here. My memory that V8 and SpiderMonkey both port fdlibm is unchecked. My fmath matched V8's Math.exp bit for bit on 100% of inputs, consistent with V8 using fdlibm.

PART B, surfaces.
1. Schnider LOC: C50 = 2.90 - 0.022*age fits all three abstract values exactly (2.02 at 40). The slope gamma is not in the abstract (PMID 10360845), and MODEL.md gives none.

2. van den Berg pairs, a target the planned parameters miss:
- The pairs were derived from the Bouillon re-fit (Ce50P 8.48, Ce50R 1.16, gamma 3.46). The full text, PMC8286956, says so.
- With those numbers I reproduce U 1.862-1.895 and P_TOL 0.896-0.901.
- With the Hannivoort triple model that MODEL.md specifies, the same pairs give P_TOL 0.972 / 0.968 / 0.963 / 0.957.
- Hannivoort's 0.9 isobole is propofol 6.65 / 4.67 / 2.93 / 1.68 with remifentanil 1 / 2 / 4 / 8.
- Observed motor responses in van den Berg (2, 1, 4 and 8 of 20 patients) were higher than either model predicts, most of all in the remifentanil-heavy group D.

3. Intubation, propofol alone with the 1.78 multiplier: Ce50 13.5 mcg/mL (Ce90 20.6). With remifentanil 2 it is 5.5, with 4 it is 3.4. This is plausible: Kazama's plasma Cp50 is 17.4, and propofol alone is known to be poor for intubation.

4. Incision: propofol 4 alone gives P(no move) 0.03; propofol 3 with remifentanil 3 gives 0.76. Both are sensible.

5. BIS-like index (Bouillon parameters):
- Propofol 2 / 3 / 4 / 6 alone: 74.0 / 62.2 / 52.6 / 38.6.
- Same with remifentanil 4: 63.0 / 53.2 / 45.3 / 33.9.
- van den Berg groups A-D: 26.7 / 36.7 / 48.3 / 53.9. The paper describes A as burst suppression, C as 40-60 and D as high.

6. Sevoflurane at 1 MAC (age 40):
- With the sevoflurane C50 of 1.29: BIS-like 32.4 (MAC 2.1%) or 37.3 (MAC 1.8%). Too deep.
- Cause: Mourisse's own propofol BIS EC50 in the same study is 2.69, not Bouillon's 4.47.
- Rescaled sevoflurane C50 = 1.29*4.47/2.69 = 2.14 vol%: BIS-like 49.4 / 54.8 at 1 MAC and 81-84 at MAC-awake.

7. Implausible teaching behaviour I found:
- Sevoflurane alone needs 2.64 vol% for 50% no movement at incision. That is 1.26 MAC (SmPC MAC 2.1%) or 1.47 MAC (Mapleson 1.8%), when it should be 1.0 MAC by definition.
- The voice entry in the stimulus surface (Ce50 3.41, the same at every age) conflicts with Schnider's LOC (2.02 at 40, 1.25 at 75).
- Neither hypnotic Ce50 in the stimulus surface changes with age.
- Between-patient spread is counted twice: a population quantile q on top of a ±20% Ce50 multiplier. At age 40 with gamma 4.5, LOC would range from 0.84 to 4.66 mcg/mL.
- a/(1+a) gives NaN if pow overflows. Use 1/(1+U^-gamma).

8. Checks that came close:
- The voice opioid weight of 0.15 lowers the hypnotic C50 by 21% for fentanyl 3 ng/mL (Katoh 1998: 24%).
- Remifentanil 32 ng/mL cuts MAC by 96% (Lang 1996: 91%).
- Fentanyl 10 ng/mL cuts it by 86%, against a ceiling of about 76% (Katoh 1998). The fentanyl ceiling is not captured.

### Targets

| Target | Achieved | Pass |
|---|---|---|
| fmath exp/log/pow/sin/cos within 1e-12 relative of Math over the model's ranges | Against a 60-digit reference: exp 2.1e-16 (1.19 ulp), log 1.4e-16 (0.73 ulp), sin/cos 1.2e-16 (0.72 ulp), pow 6.4e-15 (53 ulp, Hill exponents) and 1.8e-15 (exponents -2..2). Against Math, the differences are at most about 1.2 ulp plus Math's own error. | yes |
| A run is bit-identical on every browser (DESIGN.md determinism) | fmath: bit-identical on V8 (Node 22.22) and JSC (Bun 1.4.2) for 140,000 inputs and 200 two-hour trajectories. Math: V8 and JSC differ in 3-10% of calls and the trajectory hashes differ. SpiderMonkey not tested. | yes |
| sfc32 seeded generator identical across engines | Same hash for 1e7 draws on V8 and JSC; the spec defines every op it uses exactly (6.1.6.1.9-11, 6.1.6.1.16, 21.3.2.20) | yes |
| fmath cost acceptable | 28-90 ns per call on V8, 33-79 on JSC (1.4x to 5x Math). About 2% of a core at 200k calls per second. | yes |
| Schnider 1999 LOC C50 2.35/1.80/1.25 at 25/50/75 y | C50 = 2.90 - 0.022*age reproduces all three exactly (2.02 at 40). The slope gamma is missing: tried 3/4.5/6, which put the 5-95% quantile range at age 40 at 0.76-5.39, 1.05-3.89 and 1.24-3.30 mcg/mL. | yes |
| van den Berg 2021 P_TOL 0.9 at propofol 8.6/5.9/3.6/2.0 with remifentanil 1/2/4/8, using the planned Hannivoort triple (7.58/1.36/5.22) | P_TOL 0.972/0.968/0.963/0.957. Hannivoort's 0.9 isobole is propofol 6.65/4.67/2.93/1.68. The pairs were derived from the Bouillon re-fit (8.48/1.16/3.46), which gives 0.900/0.901/0.900/0.896. | no |
| Propofol-alone Ce for 50% no response to intubation (multiplier 1.78), plausible? | 13.5 mcg/mL (Ce90 20.6). With remifentanil 2: 5.5; with 4: 3.4. Plausible against Kazama 1997 Cp50 17.4 and propofol-alone intubation practice. | yes |
| BIS-like index, propofol 2/3/4/6 alone and with remifentanil 4 | Alone 74.0/62.2/52.6/38.6; with remifentanil 4: 63.0/53.2/45.3/33.9. Matches pd.md's quick check (62, 53). At the Schnider LOC C50 for age 40, BIS-like is 73.7. | yes |
| BIS-like index at sevoflurane 1 MAC (age 40) is a plausible 40-55 | C50s 1.29 as planned: 32.4 (MAC 2.1%) or 37.3 (1.8%), too deep. Rescaled C50s 2.14 (Mourisse's own propofol EC50 2.69 mapped to Bouillon's 4.47): 49.4 / 54.8. | no |
| Sevoflurane alone: P(no move at incision) = 0.5 at 1 MAC (the definition of MAC) | The planned surface needs 2.64% = 1.26 MAC (SmPC) or 1.47 MAC (Mapleson). P(no move) at 1 MAC is 0.23 / 0.12. | no |
| Opioid shifts the hypnotic endpoint only a little (fentanyl 3 ng/mL -24% MAC-awake) | Weight 0.15 with fentanyl 3 = remifentanil 2.46 (Lang equipotency) gives -21% | yes |
| Hypnosis (Schnider) and the voice entry in the stimulus surface agree | Voice Ce50 3.41 (7.58 x 0.45), the same at every age, vs Schnider 2.02 at 40 and 1.25 at 75: two different answers for the same endpoint | no |
| Opioid MAC reduction realistic at high dose | Remifentanil 32: 96% (Lang 91%). Fentanyl 10: 86% (Katoh about 76%, a ceiling the model does not capture). Acceptable for teaching. | yes |

### Recommended changes

- **The model loop (Cross-browser)** (ot/DESIGN.md): Keep fmath.js and say it is measured: about 150 lines of fdlibm 5.3 algorithms (exp, log, pow for x >= 0, sin, cos; DataView for exponent bits, a table of powers of two). Bit-identical on V8 and JavaScriptCore, while Math differs between them in 3-10% of calls. Replace 'engines use the correctly rounded hardware square root' with: ECMA-262 21.3.2.33 defines Math.sqrt as correctly rounded, and sqrt is not in the 21.3.2 list of approximated functions. _Why:_ Measured. The spec, not the engines, guarantees sqrt.
- **The model loop / M0.1 tests** (ot/DESIGN.md): Add a check (tools/check.mjs or a model test) that fails on `**`, Math.pow/exp/log/log2/log10/log1p/expm1/sin/cos/tan/atan/atan2/tanh/sinh/cosh/cbrt/hypot and Math.random inside js/model/. Allowed: + - * /, Math.sqrt/floor/ceil/round/trunc/abs/min/max/sign/fround/imul/clz32, bitwise ops, DataView. Write squares and cubes as x*x and x*x*x. _Why:_ The `**` operator is implementation-approximated too (Number::exponentiate, 6.1.6.1.3). Measured: x**3 differed from x*x*x in 27.6% of inputs on V8 and in 0% on JSC.
- **M0.1 tests** (ot/DESIGN.md): Change 'fmath against Math to 1e-12' to: exp, log, sin and cos within 2 ulp (about 3e-16 relative) and pow within 1e-14 relative of Math over exp -50..50, log 1e-12..1e6, pow bases 0-100 with exponents -2..8, sin and cos on 0..2pi and +/-1000. Plus a golden table of about 50 inputs with expected outputs as hex bits. Optionally run the model unit tests under Bun (JavaScriptCore) in the Checks workflow (oven-sh/setup-bun) to prove cross-engine identity. _Why:_ 1e-12 is far looser than what is reached (measured 1.2 ulp, and 6.4e-15 for pow). Golden bits catch engine or algorithm drift. CI and Chromium are both V8, so they cannot catch a Safari difference.
- **The model loop** (ot/DESIGN.md): Note that fmath.sin and fmath.cos are valid for |x| < 8.2e5 (they return NaN beyond). Waveform oscillators should keep their phase in cycles, wrapped to [0,1), and call sin(2*pi*phase). _Why:_ Range reduction in the prototype covers the medium range only, which keeps the code small.
- **4. Stimulus response / M1.5 test** (ot/MODEL.md): Either (a) keep Hannivoort 2016 (7.58 / 2.59 / 1.36 / 5.22) and change the test to: the van den Berg concentrations give P_TOL 0.95-0.98, and the P_TOL 0.9 isobole is propofol 6.65 / 4.67 / 2.93 / 1.68 with remifentanil 1 / 2 / 4 / 8. Or (b) use the Bouillon re-fit 8.48 / 1.16 / 3.46 for propofol-remifentanil, which reproduces 0.90. Recommend (a), since one model then covers sevoflurane too. Use van den Berg's haemodynamic responses at their actual concentrations. _Why:_ van den Berg derived the pairs from the Bouillon re-fit (PMC8286956 methods), not from the Hannivoort triple model, so the planned test cannot pass as written.
- **4. Stimulus response (sevoflurane term)** (ot/MODEL.md): Tie the volatile term to age-adjusted MAC: CeS/(k*MAC(age)*I_s). Choose k so sevoflurane alone gives P(no move) 0.5 at incision at 1.0 MAC(age) (k = 1/1.02 = 0.98), and add that as a calibration test. Accept that laryngoscopy then needs about 0.98 MAC rather than Hannivoort's 2.59 vol%, and mark it [D]. _Why:_ As planned, sevoflurane alone needs 1.26 MAC (SmPC 2.1%) or 1.47 MAC (Mapleson 1.8%) for 50% no movement at incision. Learners would see MAC fail to mean MAC, and the term has no age effect.
- **4. Stimulus response (age)** (ot/MODEL.md): Apply an age factor to the propofol term of the stimulus surface too, e.g. the same 10^(-0.00269*(age-40)) as MAC (about 6% per decade), or Eleveld's exp(-0.00635*(age-35)) [D]. _Why:_ Otherwise an 85-year-old needs the same propofol Ce for laryngoscopy as a 25-year-old, while their LOC C50 falls from 2.35 to 1.03.
- **4. Hypnosis / stimulus intensity list** (ot/MODEL.md): Remove 'voice 0.45' from the stimulus intensities. Response to voice comes only from the hypnosis model: U_h = CeP/C50LOC(age) + CeS/(0.34*MAC(age)), times (1 + 0.15*CeR/1.36), with C50LOC = 2.90 - 0.022*age [V fit to Schnider's three values]. Mark its slope gamma as unknown, look it up in the Schnider 1999 full text, or set it [D] (4.5 gives a 1.05-3.9 mcg/mL range at age 40). _Why:_ Two different C50s for the same endpoint (3.41 vs 2.02 at age 40), and the stimulus-surface version has no age effect. The 0.15 weight checks out (-21% for fentanyl 3 ng/mL vs Katoh's -24%).
- **1. Between-patient variation / 4** (ot/MODEL.md): Do not stack the per-patient quantile q and the ±20% hypnotic Ce50 multiplier on the same binary endpoint. Use q alone for asleep and move decisions (the population curve already describes between-patient spread), and either use the multiplier only for continuous effects (BIS-like, haemodynamics) or derive it from q so the two agree. Use one q for every endpoint, so a resistant patient is resistant everywhere. _Why:_ Stacking them widens LOC at age 40 from 1.05-3.89 to 0.84-4.66 mcg/mL, beyond the published spread, and can give a patient who is 'sensitive' on BIS but 'resistant' on movement.
- **4. BIS-like index** (ot/MODEL.md): Use a sevoflurane C50 of 2.14 vol%: Mourisse's 1.29 times Bouillon's propofol 4.47 over Mourisse's own propofol EC50 2.69 [D, derived]. Add calibration checks: propofol 2 / 3 / 4 / 6 alone gives 74.0 / 62.2 / 52.6 / 38.6; sevoflurane 1 MAC gives 49-55. _Why:_ With 1.29, 1 MAC sevoflurane reads 32-37 on the BIS-like index, deeper than propofol 6 mcg/mL. The two EC50s come from different studies on different scales.
- **4. BIS-like index (remifentanil)** (ot/MODEL.md): Flag the remifentanil BIS term (C50 19.3, [S]) as possibly too strong at high remifentanil and low propofol. It gives 53.9 for van den Berg group D, which the paper describes as high BIS with 8 of 20 movers. Consider a weaker remifentanil BIS effect [U]: Nieuwenhuijs found none at up to 2 ng/mL. _Why:_ Remifentanil-heavy, propofol-light anaesthesia is a teaching point (a light patient who moves or is aware). The surface hides it.
- **4 (implementation note)** (ot/MODEL.md): Compute sigmoid probabilities as 1/(1 + U^-gamma), with U <= 0 giving 0, not as a/(1+a) where a = U^gamma. _Why:_ a/(1+a) becomes NaN when a overflows. It is cheap to guard.

### New sources

- ECMA-262 2025 (tc39.es/ecma262/2025): 4.4.1 implementation-approximated; 6.1.6.1.3 Number::exponentiate (approximated, so `**` too); 6.1.6.1.4 and 6.1.6.1.7 multiply and add, IEEE 754-2019; 6.1.6.1.9-11 shifts and 6.1.6.1.16 NumberBitwiseOp (exact); 21.3.2 note listing the approximated Math functions (sqrt not listed); 21.3.2.33 Math.sqrt returns F(sqrt n); 21.3.2.20 Math.imul; 21.3.2.17 Math.fround
- van den Berg JP et al. J Clin Monit Comput 2021;35:815-25, PMC8286956 (full-text methods): the 0.9 pairs came from the Bouillon re-fit 8.48 / 1.16 / 3.46 (Hannivoort 2016 Table 1), Schnider ke0 0.456, U = 1.887; motor responders 2 / 1 / 4 / 8 of 20; group C BIS mostly 40-60, group A burst suppression > 5%, group D high BIS
- Mourisse J et al. Br J Anaesth 2007;98:737-45, PMID 17519261 (abstract): BIS EC50 propofol 2.69 (0.67) mcg/mL in the same study as sevoflurane 1.29 vol%
- Schnider TW et al. Anesthesiology 1999;90:1502-16, PMID 10360845 (abstract): gamma for LOC not given
- Hannivoort LN et al. Br J Anaesth 2016;116:624-31, PMID 27106965, doi:10.1093/bja/aew060 (abstract re-checked: 2.59 / 7.58 / 1.36 / 5.22)
- Olofsen E, Dahan A. Anesthesiology 1999;90:1345-53, PMID 10319783 (sevoflurane BIS IC50 1.14%)
- fdlibm 5.3 (netlib.org/fdlibm): e_exp.c, e_log.c, k_sin.c, k_cos.c, e_rem_pio2.c constants and algorithms, the approach the ECMA-262 21.3.2 note recommends

### Caveats

- Cross-engine identity was shown for V8 (Node 22.22) and JavaScriptCore (Bun 1.4.2) only. There is no Firefox or Playwright WebKit binary here, so SpiderMonkey and Safari-on-iOS are untested.
- fmath constants are typed from memory of fdlibm 5.3. The measured errors (at most 1.19 ulp; exp bit-identical to V8 on 100% of inputs) show they are right, but the implementation should cite and re-check them against the fdlibm source.
- pow is plain exp(y*log x). It is fine for the model's ranges but loses accuracy as |y*ln x| grows (6.4e-15 at about 37). It handles only x >= 0.
- sin and cos cover |x| < 8.2e5 only.
- The drift tests use a toy model, not the planned PK. They show that 1-ulp Math differences rarely flip discrete events, not that they never do.
- The Schnider LOC slope gamma is unknown (not in the abstract). The age-linear C50 is a fit to three published points.
- The sevoflurane BIS C50 rescaling to 2.14, the MAC-anchored sevoflurane stimulus term (k = 0.98) and the age factor on propofol for TOL are my own design choices [D], not published values.
- The Bouillon BIS parameters remain [S] (PAS transcription).
- Plausibility of BIS around 49-55 at 1 MAC sevoflurane, and around 81 at MAC-awake, is from memory [U].
- The ECMA-262 2025 HTML spec was downloaded to the scratchpad folder specdl/ and only parsed as text.
