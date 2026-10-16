# Respiratory & gas-exchange model for a teaching anaesthesia simulator — research notes

> Research notes from the OT simulator planning session (14 Oct 2026), compiled by AI research agents from published
> sources, paraphrased and cited; nothing here is clinically reviewed. The curated spec is `../MODEL.md`; these notes
> keep the detail (PMIDs, what could not be checked). Open-source projects named here were read for ideas and to
> cross-check numbers only; no code from them is used.

Synthetic patient, JS, no real patient data. Units: mmHg, °C, mL, cmH₂O, L/min. Where a source gives kPa it is
converted (1 kPa = 7.5 mmHg) and the original is noted. "Uncertain" flags are collected at the end of each section
and in a master list.

Conventions used below: FRC = functional residual capacity; V̇O₂ = oxygen consumption; V̇CO₂ = CO₂ production;
RQ = respiratory quotient; Qs/Qt = shunt fraction; Vd = dead space; EtCO₂/EtO₂ = end-tidal; SaO₂ = arterial
saturation (co-oximeter), SpO₂ = pulse-oximeter saturation.

---

## 1. Apnoea desaturation (time to SpO₂/SaO₂ 90 %, 80 %, 60 %)

### Primary sources and the numbers they actually give

| Scenario | Time to SpO₂/SaO₂ 90 % | Further fall | Source |
|---|---|---|---|
| Healthy 70 kg adult, full pre-oxygenation | ~8 min (often quoted "8–9 min") | once below ~88–90 %, fall is steep (see rate below) | Benumof 1997 (model); DAS 2015 restates 8 min |
| Healthy adult, **room air** (no pre-ox) | 1–2 min | — | DAS 2015 guideline |
| Moderately ill adult | ~5 min (≈5.5 min cited by secondary sources) | — | Benumof 1997 (model) |
| Obese adult (Benumof model, labelled ~127 kg in secondary sources) | ~3 min (secondary sources quote 2.7–3.1 min) | — | Benumof 1997 (model) — **exact figure not verified from primary text** |
| Obese, measured (morbidly obese) | 196 s (SD 80; range 55–208 s) vs 595 s (SD 142) in normal-weight controls | — | Berthoud 1991 (BJA 67:464) |
| Obese, measured (groups by weight) | normal 364 ± 24 s; obese (>20 % over IBW) 247 ± 21 s; morbidly obese (>45.5 kg over IBW) 163 ± 15 s | r = −0.83 time vs obesity | Jense 1991 (Anesth Analg 72:89) |
| 10 kg child (Benumof model) | <4 min (secondary ~3.7 min) | — | Benumof 1997 — **exact figure not verified** |
| Children, measured, to SpO₂ 90 % | 0–6 mo 96.5 ± 12.7 s; 2–5 yr 160.4 ± 30.7 s; 11–18 yr 382.4 ± 79.9 s (r²=0.88 with age) | — | Patel 1994 (Can J Anaesth 41:771) |
| Pregnant (term), 99 % denitrogenation | 4 min 52 s [3:43–6:17] vs 7 min 25 s [5:49–9:42] non-pregnant | 90→40 % took 35 s (pregnant) vs 45 s (non-pregnant) | McClelland 2008 (Anaesthesia 63:264), NPS model |
| Labouring, BMI 50 | 98 s vs 292 s standard pregnant | fastest desaturation of obstetric scenarios | McClelland 2009 (Anaesthesia 64:371) |

**Benumof 1997** (Benumof JL, Dagg R, Benumof R. *Anesthesiology* 1997;87:979–82, PMID 9357902). Model curves of
SaO₂ vs apnoea time for four patients: healthy 70 kg adult, moderately ill adult, obese adult, 10 kg child; curves
assume complete denitrogenation (alveolar O₂ ≈ 0.87, i.e. FAO₂≈80–87 %) and ignore pulse-oximeter lag. The paper's
point is that critical desaturation occurs *before* recovery of a 1 mg/kg suxamethonium twitch (mean time to ~10 %
and ~50 % twitch recovery marked on the figure; mean recovery to spontaneous ventilation after 1 mg/kg ≈ 10 min).
The exact per-patient 90 % times are read from the figure; secondary sources quote healthy ≈8 min, moderately ill
≈5 min, obese ≈3 min (2.7–3.1), child ≈3.7 min, but I could not open the primary figure to confirm the obese/child
values — treat as approximate.

**Rate of fall once below ~90 %:** Hardman/NPS work gives SaO₂ 90→40 % at **~30 %/min** (open airway ~26 %/min,
obstructed ~33 %/min), similar across ages (Hardman & Wills 2006, BJA 97:564, PMID 16873387). LITFL and others
quote "~30 %/min once below 88–90 %". Benumof's curves show the same steepening.

### Modelling papers (use these for the engine)

- **Farmery & Roe 1996** (BJA 76:284, PMID 8777112): closed-form model of SaO₂ vs apnoea time accounting for
  non-steady-state O₂ flux from alveolus, shunt, circulation-time effect on real-time arterial–mixed-venous content
  difference, and Bohr shift from rising FACO₂. Parameters you vary: initial FAO₂, alveolar volume VA, Qs/Qt, V̇O₂,
  blood volume QT, Hb. Worked paediatric, morbidly obese and post-op examples. Good basis for a compact model.
- **Hardman, Wills & Aitkenhead 2000** (Anesth Analg 90:619, PMID 10702447), Nottingham Physiology Simulator (NPS):
  airway obstruction cut time to 50 % SaO₂ from 11→8 min; giving 100 % O₂ (vs air) to an open apnoeic airway extended
  time to 50 % SaO₂ from 11→66 min. Hb, venous admixture, RQ had small effects; reduced FRC, short denitrogenation,
  hypoventilation and raised V̇O₂ all shortened time to desaturation.
- **McNamara & Hardman 2005** (Anaesthesia 60:741, PMID 16029221): open-airway apnoea. Raising inspired O₂ fraction
  from 0.9→1.0 **more than doubled** time to desaturation at all shunt fractions; with high FiO₂ and high shunt, PaO₂
  transiently *rose* during apnoea. A very high ambient O₂ + patent airway greatly delays hypoxaemia.
- **Hardman & Wills 2006** (children, above): SaO₂ 90→40 % ~30 %/min all ages; the age difference is in the *early*
  phase (onset of apnoea to the knee of the curve): 6.6 s in a 1-month-old vs 33.6 s in an 8-yr-old (open airway,
  no pre-ox) because of the high minute-ventilation:FRC ratio in the very young.
- **Tanoubi, Drolet & Donati 2009** (Can J Anesth 56:449, PMID 19399574): review. "Duration of apnoea without
  desaturation" (DAWD) = time to SpO₂ <90 %. Adequate pre-ox = EtO₂ >90 %. DAWD reduced in obese, pregnant, high
  metabolism. Obese benefit from head-up and positive pressure.

### Apnoeic oxygenation / HFNO (THRIVE) and patent vs obstructed airway

- **Patel & Nouraei 2015** (THRIVE, Anaesthesia 70:323, PMID 25388828): 25 difficult-airway patients (12 obese),
  transnasal humidified high-flow O₂; **median apnoea time 14 min (IQR 9–19, range 5–65)**, no SpO₂ <90 %. Mean
  post-apnoea EtCO₂/PaCO₂ 7.8 kPa (58.5 mmHg); **rate of CO₂ rise only 0.15 kPa/min ≈ 1.1 mmHg/min** (much slower
  than classic apnoea, from flow-dependent dead-space flushing + CPAP effect).
- **Gustafsson 2017** (BJA 118:610, PMID 28403407): THRIVE 40–70 L/min, mean apnoea 22.5 min, SpO₂ never <91 %,
  PaCO₂ rise 0.24 kPa/min (1.8 mmHg/min), EtCO₂ rise 0.12 kPa/min (0.9 mmHg/min), BMI <30.
- **Children THRIVE** (Humphreys 2017, BJA 118:232, PMID 28100527): apnoea time roughly doubled (e.g. 0–6 mo 109→192 s;
  6–10 yr 261→430 s) but **no improvement in CO₂ clearance** (tcCO₂ rose ~2.4 mmHg/min in both arms) — HFNO extends
  oxygenation, not ventilation, in kids.
- **Ramachandran 2010** (J Clin Anesth 22:164, PMID 20400000): obese, nasal O₂ 5 L/min during apnoea — SpO₂ ≥95 %
  maintained 5.29 vs 3.49 min; min SpO₂ 94.3 vs 87.7 %.
- **Weingart & Levitan 2012** (Ann Emerg Med 59:165, PMID 22050948): review of pre-ox/apnoeic oxygenation ("NO DESAT"),
  risk stratification; passive apnoeic O₂ up to 15 L/min nasal.
- **Patent vs obstructed airway** (Hardman 2000; McNamara 2005; Hardman & Wills 2006): with 100 % O₂ and a *patent*
  airway, bulk ("mass") flow of O₂ into the alveoli replaces O₂ taken up (~230–250 mL/min) because net gas flux into
  blood exceeds CO₂ added to alveolus, so alveolar pressure falls slightly and gas is drawn in. An *obstructed* airway
  removes this mass-flow supply and adds intrathoracic depressurisation → desaturation markedly faster (50 % SaO₂ at
  8 vs 11 min; child 90→40 % 33 vs 26 %/min).

### Uncertain (§1)
- Exact Benumof per-patient figure values for obese (127 kg) and 10 kg child (secondary sources: ~2.7–3.1 and ~3.7 min)
  — not confirmed from the primary figure.
- "Septic / high V̇O₂" and "low FRC" healthy-adult numbers: no single tidy table; use NPS sensitivity results (raised
  V̇O₂ and reduced FRC both shorten time to desaturation) plus McClelland 2009 sepsis (accelerated de-oxygenation).

---

## 2. CO₂ during apnoea; body CO₂ stores

| Quantity | Value | Source |
|---|---|---|
| PaCO₂ rise, first minute of apnoea | 8–16 mmHg (classic); ~12 mmHg in the airway-obstruction study | Eger & Severinghaus 1961; Stock 1989 |
| PaCO₂ rise, thereafter | ~3 mmHg/min (range 3–3.5); Stock piecewise: **12 mmHg in 1st min, then 3.4 mmHg/min** | Stock 1989 (J Clin Anesth 1:328, PMID 2516732) |
| Frumin apnoeic-oxygenation data | 8 patients, 30 min denitrogenation, apnoea 30–55 min, SaO₂ 98–100 %; peak PaCO₂ up to 250 mmHg, pH to 6.72 (secondary) | Frumin, Epstein & Cohen 1959 |
| CO₂ uptake into alveolus during apnoea | ~21 mL/min (vs ~230 mL/min O₂ removed → net negative gas flux drives mass flow) | Nunn's physiology / IntechOpen review (ref. Baraka & Salem) |
| THRIVE CO₂ rise (patent HFNO) | 0.15 kPa/min ≈ 1.1 mmHg/min (Patel); 0.24 kPa/min ≈ 1.8 mmHg/min PaCO₂ (Gustafsson) | Patel 2015; Gustafsson 2017 |

- **Eger & Severinghaus 1961** (Anesthesiology 22:419, PMID 13725901): "The rate of rise of PaCO₂ in the apneic
  anesthetized patient." Classic source for the first-minute jump (mixing of stored CO₂) then linear ~3 mmHg/min.
  I could not open the primary text to read exact first-minute number; the widely-cited "first-minute jump" of
  ~8–16 mmHg plus ~3 mmHg/min comes from this paper and is restated in many reviews.
- **Stock 1989** (airway obstruction, no apnoeic-O₂ wash-out of CO₂): best logarithmic fit; piecewise-linear
  **+12 mmHg first minute, +3.4 mmHg/min thereafter**. Recommended for an obstructed/clamped-tube scenario; note
  apnoeic oxygenation with high O₂ flow can wash out some CO₂, so classic studies may understate rise.

**Body CO₂ stores model (Farhi & Rahn 1955, J Appl Physiol 7:472, PMID 14367232):** CO₂ stores are large (~120 L
total body CO₂, mostly as bicarbonate in a slow compartment) and asymmetric — PaCO₂ **rises faster than it falls**
for a given ventilation step. Practical multi-compartment picture: a fast (lung + blood + vessel-rich tissue)
compartment equilibrating in minutes, and a slow (muscle, bone, fat) compartment over hours. For a 0.1 s-step
simulator, a 1–2 compartment store is adequate:
- Fast store ~ well-perfused tissue; time constant minutes.
- During apnoea, V̇CO₂ (~200 mL/min, RQ 0.8 × V̇O₂ 250) enters blood; EtCO₂/PaCO₂ rises per the first-minute-jump +
  linear-rate rule above; model the jump as redistribution of CO₂ already in the fast store when gas exchange stops.

### Uncertain (§2)
- Exact Eger & Severinghaus 1961 first-minute figure (primary text not retrieved); "8–16 mmHg first min" is a
  review consensus. Use Stock's 12 mmHg as a defensible default.
- Frumin peak PaCO₂/pH figures are from secondary/historical summaries; verify against the 1959 original if quoted.

---

## 3. Compact gas-exchange model (0.1 s steps) — recommended structure + defaults

### Published simplified models to base it on
- **Nottingham Physiology Simulator (NPS)** — Hardman et al. 1998 (BJA 81:327, PMID 9861113) validated respiratory
  components; predicts PaO₂, SaO₂, PvO₂, SvO₂, PaCO₂, PvCO₂, pH within clinical limits vs ICU patients. Alveolar gas +
  venous admixture + O₂/CO₂ dissociation; drives all the apnoea papers in §1. **Best single reference for a compact,
  validated structure.**
- **Farmery & Roe 1996** (above) — closed-form alveolar-store depletion model; ideal maths for a stepwise simulator.
- **Chiari, Avanzolini & Ursino 1997** (Ann Biomed Eng, PMID 9395044) — comprehensive O₂/CO₂ exchange, transport and
  storage simulator with validation; more detailed, good for parameter values.
- **Pulse Physiology Engine** (Kitware, open source; successor to BioGears) — lumped-parameter RC circuit: airway
  resistors, alveolar + chest-wall compliances, pleural node, muscle pressure source; gas exchange via substance
  transport + blood chemistry; chemoreceptor control (peripheral gain Gp = 30.24, central Gc = 1.44, thresholds
  35.5 mmHg on PaCO₂). Standard 77 kg male: TLC ~6.0 L, FRC ~2.3–2.4 L (30 mL/kg), RV 1.23 L (16 mL/kg), TV 0.54 L,
  RR 16, minute vent ~6.5 L/min, alveolar PO₂ ~104, PCO₂ ~40 mmHg. Open-source equations are directly reusable.
- **Gas Man** (Philip, PMID 3540162) — anaesthetic uptake/distribution (agent compartments), not O₂/CO₂; use it as
  the model for the volatile-agent compartment of the lung store.
- Sá Couto / van Meurs respiratory model (van Meurs, *Modeling & Simulation in Biomedical Engineering:
  Cardiorespiratory Physiology*, 2011) — textbook lumped model for patient simulators. (The specific 2010 Sá Couto
  journal paper was not located; the van Meurs book is the citable source.)

### Recommended engine structure (one lung compartment is enough for teaching)
1. **Lung (alveolar) gas store** of volume = FRC, holding fractional O₂, CO₂, N₂ and volatile agent (sum = 1).
   Update each 0.1 s: inflow from ventilator/airway (tidal flow × inspired fractions), outflow of each gas to/from
   blood.
2. **Alveolar gas equation** for PAO₂: `PAO₂ = FiO₂·(PB − PH₂O) − PACO₂/RQ` (PB 760, PH₂O 47 mmHg at 37 °C; Singapore
   sea level PB ≈ 760). Use PACO₂ from the CO₂ store.
3. **O₂ uptake** = V̇O₂; **CO₂ output** = V̇CO₂ = RQ·V̇O₂. Gas drawn from / added to the alveolar store each step.
4. **Venous admixture / shunt:** arterial content = (1−Qs/Qt)·end-capillary content + Qs/Qt·mixed-venous content;
   convert content→PaO₂ via dissociation curve (§4). This reproduces the shunt plateau and the venous-admixture term
   in Farmery/NPS.
5. **Mixed venous O₂:** CvO₂ = CaO₂ − V̇O₂/Q̇ (Fick). Default CaO₂−CvO₂ ≈ 5 mL/100 mL (SvO₂ ~75 %, PvO₂ ~40 mmHg).
   Circulation delay (lung→finger ~ a few s; arm-to-oximeter) can be a transport lag.
6. **CO₂ store** (§2): fast body compartment buffering, giving the first-minute jump + ~3 mmHg/min apnoea rise.

### Default parameters (70 kg adult unless stated)

| Parameter | Default | Notes / source |
|---|---|---|
| FRC, awake upright | ~30 mL/kg ≈ 2.1–2.4 L | ~35 mL/kg classic; Pulse uses 30 mL/kg |
| FRC supine | ~20 % less than upright | Wahba 1991 (Can J Anaesth 38:384) |
| FRC under GA + paralysis | further ~20 % reduction (≈0.8–1.0 L fall total) | Wahba 1991; Hedenstierna |
| Tidal volume | 6–8 mL/kg (~500 mL) | standard |
| Anatomical dead space | ~2 mL/kg (~150 mL) | classic (Radford); physiological Vd/Vt ~0.3 |
| Respiratory rate | 12–16 /min | standard |
| V̇O₂ awake | ~3.5 mL/kg/min (~250 mL/min at 70 kg) | basal; Brody V̇O₂ = 10·BW^0.75 (static estimate) |
| V̇O₂ under GA | reduced ~25–35 % vs awake | Jakobsson 2021 (EJA 38, PMID 32858583): −34 % at induction, −24 % at 2 h; Hamburg study −27 % |
| V̇O₂ apnoea | ~230 mL/min | Baraka & Salem (via IntechOpen review) |
| RQ | 0.8 | standard |
| V̇CO₂ | ~200 mL/min (RQ·V̇O₂) | standard |
| Shunt (healthy awake) | ~2–5 % of CO | Tokics 1987 (Anesthesiology 66:157): 3 awake had 2–5 %; Gunnarsson awake mean 0.5 % |
| Shunt under GA | rises to ~5–10 % (up to 17 %) with atelectasis | Tokics 1987 (1→17 %); atelectasis in ~90 % of anaesthetised (Hedenstierna) |
| Atelectasis under GA | 15–20 % of basal lung regularly collapses | Hedenstierna & Edmark 2010 (PMID 20608554) |
| Hb | 150 g/L (15 g/dL) | standard; O₂ capacity 1.34–1.39 mL/g |
| Body O₂ stores, breathing air → 100 % O₂ | ~1450–1550 mL → ~3700–4250 mL (lung component 450→3000 mL) | Nunn (via review); table/text disagree — treat as order-of-magnitude |
| Total body CO₂ stores | ~120 L (mostly slow bicarbonate pool) | Farhi & Rahn 1955 |

### Uncertain (§3)
- The "20 % supine, further 20 % GA" FRC reductions are textbook/review approximations (Wahba), not a single trial
  number; acceptable for teaching defaults.
- Body O₂-store table (Nunn) is internally inconsistent across versions; use as rough reserve, not precise.

---

## 4. Oxyhaemoglobin dissociation + pulse oximeter behaviour

### Severinghaus 1979 equations (J Appl Physiol 46:599, PMID 35496) — primary
- **SO₂ from PO₂:** `S = 1 / ( 23400·(PO₂³ + 150·PO₂)⁻¹ + 1 )` (PO₂ in mmHg/Torr). Fits standard human curve to
  ±0.0055 fractional saturation over 0<S<1.
- **PO₂ from SO₂ (reverse):** `ln PO₂ = 0.385·ln((S⁻¹ − 1)⁻¹) + 3.32 − (72·S)⁻¹ − 0.17·S⁶`.
- **Temperature coefficient:** `Δln PO₂/ΔT = 0.058·((0.243·PO₂/100)^3.88 + 1)⁻¹ + 0.013`.
- **Bohr (pH) coefficient:** `Δln PO₂/ΔpH = (PO₂/26.6)^0.184 − 2.2`.
- Standard P50 ≈ 26.6–26.8 mmHg at pH 7.4, 37 °C, PaCO₂ 40.

### "Virtual PO₂" / shift corrections (pH, temperature, base excess)
The compact correction most people call the "Severinghaus virtual PO₂" is the Okada (1977) modification
(Okada, Tyuma, Sugimoto, *Jpn J Physiol* 27:135, DOI 10.2170/jjphysiol.27.135):
`Δlog PO₂ = +0.48·(7.4 − pH) + 0.024·(T − 37) + 0.0013·BE + 0.135·[DPG] − 0.116` (T in °C, BE in mEq/L, [DPG] =
2,3-DPG:Hb molar ratio). Estimates P50 ±2.5 mmHg, SO₂ ±5 %. **Note the sign convention:** the common textbook form
`0.48(pH−7.4) + 0.024(37−T)` is the negative of Okada's pH/T terms (same physics, opposite framing). Implementation:
compute a "virtual" PO₂ at standard conditions, apply the standard curve, then shift. Right shift (↓affinity,
↑P50): acidosis, hyperthermia, ↑CO₂, ↑2,3-DPG. Left shift: alkalosis, hypothermia, ↓CO₂, CO/MetHb.
Reverse SO₂→PO₂: Ellis 1989 (J Appl Physiol 67:902, PMID 2793692) gives an explicit inversion of the Severinghaus
equation if you prefer a closed form over iteration.

### Pulse oximeter response time / lag

| Site / condition | Response time or delay | Source |
|---|---|---|
| Finger vs ear, step desaturation | ear faster than finger; finger on thumb faster than finger | Young 1992 (Anesth Analg 74:189, PMID 1731536) |
| Ear vs hand vs foot, detect SpO₂ <90 % | ear–hand 6 s; hand–foot 57 s; ear–foot 63 s | Hamber 1999 (J Clin Anesth 11:113, PMID 10386281) |
| Finger vs ear (reflectance), bronchoscopy | finger lagged ear by **+36 s** (CI 27–45) at 90 % | Pertzov 2019 (Lung 197:67, PMID 30474708) |
| Finger response, normothermia → mild hypothermia | **130 s → 215 s**; GTN (vasodilatation) 215→187 s; forehead/ear unaffected | MacLeod 2005 (Anaesthesia 60:65, PMID 15601275) |
| Forehead vs finger (apnoea) | forehead reached 90 % at 94 s vs finger 100 s; resaturation 23 vs 29 s | Choi 2010 (in Jubran review) |

Practical model defaults: **ear/forehead probe ~10–20 s lag, finger ~30 s lag, worsening to ~3–4 min with
vasoconstriction / low cardiac output / hypothermia.** The commonly taught "ear ~10 s, finger ~30 s" is consistent
with these data but the exact round numbers are textbook, not a single trial. Review: **Jubran 2015** (Crit Care
19:272, PMID 26179876).

### Accuracy limits
- At SaO₂ ≥90 %: bias <2 %, precision (SD) <3 % (Jubran review).
- Below ~80 %: accuracy degrades; most devices read **too low with finger probes at ~55 % SaO₂**, bias/precision
  worsen and devices diverge (Severinghaus & Naifeh 1987, Anesthesiology 67:551, PMID 3662082; 1989 J Clin Monit
  5:72, PMID 2723709 — "ambiguity" index at ~56 % SaO₂ ranged ~3.3 to >20 across 14 brands).
- Regulatory accuracy: ISO 80601-2-61 and FDA — ARMS ≤3 % (transmittance) / ≤3.5 % (reflectance/ear) over
  70–100 % SaO₂; devices not validated <70 %. (FDA 2013 guidance; ISO 80601-2-61.)
- CO/MetHb: COHb read as O₂Hb → SpO₂ falsely high; MetHb drives SpO₂ toward **~85 %** regardless of true SaO₂
  (classic teaching; co-oximetry needed).
- Skin pigmentation: SpO₂ overestimates SaO₂ in dark skin at low saturation — at 60–70 % SaO₂ bias +3.56 % (dark)
  vs +0.37 % (light) (Bickler 2005, Anesthesiology 102:715, PMID 15791098); occult hypoxaemia missed more often,
  worse at low perfusion (Gudelunas 2024, Anesth Analg 138:552, PMID 38109495: missed hypoxaemia 1.1 % light,
  8.2 % medium, 21.1 % dark skin under low perfusion).
- Signal loss: motion artefact and poor perfusion are the main causes of dropout/false alarms.

### Perfusion index (PI)
From the pulsatile:non-pulsatile ratio of the plethysmographic signal. Normal population median **1.4** (IQR 0.7–3.0,
range 0.3–10); **PI <1.4 indicates poor peripheral perfusion** and correlates with core-to-toe temperature gradient
(Lima 2002, Crit Care Med 30:1210, PMID 12072670). Low PI (<0.5–1 %) markedly worsens SpO₂ accuracy (Gudelunas 2024).

### Uncertain (§4)
- "Ear 10 s / finger 30 s" exact values are textbook rounding of the trial ranges above.
- Okada sign convention — double-check direction when implementing.

---

## 5. Capnography

### Normal gradient and phases
- **PaCO₂ − EtCO₂ gradient:** normally **2–5 mmHg** (EtCO₂ slightly below PaCO₂). In pregnancy/early pregnancy the
  gradient is ~0 or **negative** (EtCO₂ ≥ PaCO₂): mean a-ET difference 0.08 kPa (~0.6 mmHg), 31 % negative values
  (Shankar 1986/1987/1989 — tubal ligation PMID 3109274; caesarean PMID 3092695; early pregnancy PMID 2495859).
- **Phases of the time capnogram** (Bhavani-Shankar & Philip 2000, Anesth Analg 91:973, PMID 11004059): Phase I =
  inspiratory baseline / anatomical dead-space gas (CO₂ ~0); Phase II = rapid upstroke (mixed dead-space + alveolar);
  Phase III = alveolar plateau, slight positive slope; Phase 0 = inspiratory downstroke. (Some texts label an
  occasional Phase IV terminal upswing.) **Alpha angle** (II↔III) normal ~**100–110°**, widens with airflow
  obstruction / prolonged time constants; **beta angle** (III↔descending limb) ~**90°**, increases with rebreathing
  (capnography.com / Kodali). Phase III slope rises with V̇/Q̇ heterogeneity.
- **Kodali 2013** (Anesthesiology 118:192, PMID 23221867) "Capnography outside the operating rooms" — key review for
  waveform teaching; companion resource www.capnography.com.

### Gradient widening
Widens with anything increasing **alveolar dead space**: low cardiac output, hypovolaemia, pulmonary embolism, high
PEEP/over-distension, age, COPD, position. EtCO₂ tracks cardiac output when ventilation is constant
(Isserles & Breen 1991, Anesth Analg 73:808, PMID 1952183: %ΔEtCO₂ ∝ %ΔCO, slope 0.73, r²=0.89).

### Characteristic shapes
| Pattern | Capnogram | Source/notes |
|---|---|---|
| Bronchospasm / obstruction | "shark-fin": prolonged upsloping Phase II/III, loss of plateau, ↑alpha angle | Kodali; classic |
| Oesophageal intubation | a few small CO₂ "breaths" (gastric CO₂, esp. after bag-mask) then → 0 | Linko 1983 (Acta Anaesth Scand 27:199, PMID 6410667) |
| Rebreathing | elevated baseline (Phase I > 0), ↑beta angle | Bhavani-Shankar 2000 |
| Curare cleft | notch in the plateau (Phase III) from returning diaphragmatic activity | classic |
| Cardiac arrest / CPR | very low EtCO₂; **<10 mmHg (<1.3 kPa) = poor CPR / poor prognosis**, goal >20 mmHg | Meaney 2013 (Circulation 128:417, PMID 23801105); AHA |
| ROSC | abrupt sustained rise (e.g. to ~35–40 mmHg) | Falk/Weil 1988 (NEJM 318:607, PMID 3125432): EtCO₂ jump within ~30 s at ROSC |
| Malignant hyperthermia | progressive EtCO₂ rise despite increased minute ventilation | §9; Rosenberg 2015 |

- **Oesophageal-intubation detection (safety-critical):** PUMA consensus (Chrimes 2022, Anaesthesia 77:1395,
  PMID 35977431): "sustained exhaled CO₂" is the mainstay to exclude oesophageal placement; peak CO₂ **<1 kPa
  (7.5 mmHg)** after intubation in a patient with spontaneous output is highly unlikely to be tracheal. Model: after
  mask ventilation a few decreasing CO₂ pulses from stomach then zero (Linko).
- **CPR numbers (Falk/Weil 1988):** at arrest EtCO₂ fell from ~1.4 %→0.4 % (≈10→3 mmHg); chest compressions raised
  it to ~1.0 % (~7.5 mmHg); ROSC heralded by rise to ~3.7 % (~28 mmHg) overshoot within ~30 s. Non-survivors stayed
  ~0.7 % (~5 mmHg). **<10 mmHg at 20 min of ACLS predicts non-survival** (AHA/ILCOR; secondary).

### Uncertain (§5)
- Alpha 100–110° / beta ~90° are textbook/capnography.com values, not from a cited measurement trial.
- "AHA EtCO₂ <10 mmHg / ROSC 35–40 mmHg" wording is from the 2013 AHA CPR-quality consensus (Meaney) carried into
  2015/2020 guidelines; exact 2020 phrasing not re-verified. Falk/Weil 1988 is the primary physiology source.

---

## 6. Respiratory mechanics under GA

| Quantity | Default / value | Source |
|---|---|---|
| Total respiratory system static compliance, GA + paralysis (normal) | ≈ **68 mL/cmH₂O** (series combination of lung Cst,L 106.6 ± 31.7 and chest-wall Cst,w 190.7 ± 45.1; corrected in review) | Pelosi 1996 (Chest 109:144, PMID 8549177) |
| Cst, morbidly obese (GA) | lung 55.3 ± 15.3; chest wall 112.4 ± 47.4 mL/cmH₂O (both markedly reduced) | Pelosi 1996 |
| Airway resistance Rmin,L, normal GA | 1.0 ± 0.8 cmH₂O·L⁻¹·s | Pelosi 1996 |
| Rmin,L, obese GA | 4.7 ± 3.1 cmH₂O·L⁻¹·s | Pelosi 1996 |
| ETT resistance (Rohrer K₂, nonlinear term) | 9.0 mm 2.42; 8.5 mm 3.05; 8.0 mm 4.65; 7.5 mm 6.01; 7.0 mm 9.17; 6.5 mm 12.80 cmH₂O·L⁻²·s² | Flevari 2011 (Anaesth Intensive Care 39:410, PMID 21675060) |

- A reasonable teaching default: **total respiratory-system compliance ~50–80 mL/cmH₂O under GA** (your figure is
  fine; Westbrook 1973 (J Appl Physiol 34:81, PMID 4697382) first showed the fall in compliance with anaesthesia +
  paralysis); **ETT + airway resistance ~5–15 cmH₂O·L⁻¹·s** consistent with Flevari K₂ for a 7.0–8.0 mm tube at
  ~1 L/s plus native airway. ETT resistance is flow-dependent (Rohrer: R = K₁ + K₂·V̇), so model it as rising with
  flow and with smaller tube ID.

### How it changes
| Condition | Effect | Source |
|---|---|---|
| Pneumoperitoneum (12 mmHg) | dynamic compliance ↓~12 mL/cmH₂O; peak +6, plateau +7 cmH₂O; EtCO₂ +5 mmHg | Suh 2010 (Korean J Anesthesiol 59:329, PMID 21179295) |
| Trendelenburg (head-down) | compliance ↓~20 %; pneumoperitoneum adds further ~30 % | Hirvonen 1995 (Anesth Analg 80:961, PMID 7726439) |
| Pneumoperitoneum + laparoscopy, a-etCO₂ gradient | +1.5 mmHg; minute-vent requirement +~30 % | Hirvonen 1995 |
| Obesity | ↓FRC (0.67 vs 1.69 L), ↓lung & chest-wall compliance, ↑resistance, ↓PaO₂ | Pelosi 1996 |
| Bronchospasm | ↑resistance, prolonged expiratory time constant → gas trapping, **auto-PEEP**; shark-fin capnogram | Pelosi/classic |
| Tension pneumothorax (ventilated) | rapid ↑airway pressure, hypoxaemia (91.8 % of ventilated cases vs 50 % spontaneous), hypotension/arrest within minutes (OR hypotension 12.6, arrest 17.7 vs spontaneous) | Roberts 2015 (Ann Surg 261:1068, PMID 25563887) |
| Endobronchial intubation / one-lung ventilation | shunt ↑ (ventilated-lung only), PaO₂ ↓; hypoxaemia predicted by lung function, side (R worse), position | Karzai & Schwarzkopf 2009 (Anesthesiology 110:1402, PMID 19417615) |

### Ventilation equations for the engine
- **VCV:** `Ppeak = PEEP + V̇·R + Vt/C` (end-inspiratory, constant flow); `Pplateau = PEEP + Vt/C` (no flow).
  Peak−plateau gap = resistive component (↑ in bronchospasm / kinked or small ETT).
- **PCV delivered volume:** exponential fill with time constant **τ = R·C**; `Vt = ΔP·C·(1 − e^(−Tinsp/τ))`.
  Short Tinsp or long τ (high R, e.g. bronchospasm) → incomplete filling, lower delivered Vt.
- **Auto-PEEP / gas trapping:** when expiratory time < ~3·τ, lung doesn't empty to FRC; residual volume raises
  end-expiratory alveolar pressure (auto-PEEP). Model as incomplete exponential emptying with τ = R·C.

### Uncertain (§6)
- Single representative "GA total compliance 50–80" is a textbook band; Pelosi partitions lung vs chest wall so the
  combined number depends on how you add series compliances (1/Crs = 1/CL + 1/Cw → combined < either).
- ETT resistance "at 1 L/s" needs K₁ too (Flevari gives K₂ only); at ~1 L/s total R ≈ K₁+K₂, so a 7.0 mm tube is
  roughly ~10–12 cmH₂O·L⁻¹·s at 1 L/s — order-of-magnitude.

---

## 7. Control of breathing

| Quantity | Value | Source |
|---|---|---|
| Awake CO₂ response slope | ~2–3 L/min/mmHg (often quoted ~2); wide normal range | Read rebreathing method (classic); Nieuwenhuijs 2003 baseline |
| Apnoeic threshold | PaCO₂ a few mmHg below resting; under GA apnoea threshold has roughly fixed relation to resting PaCO₂ | Hickey 1971 (Anesthesiology 35:32, PMID 4932620) |
| Volatiles flatten slope | sevoflurane: slope of CO₂ response ↓ and PaCO₂ ↑ with depth; 1.1 MAC ≈ halothane, 1.4 MAC worse | Doi & Ikeda 1987 (Anesth Analg 66:241, PMID 3826666) |
| Volatiles abolish hypoxic drive | 0.1 MAC halothane cuts hypoxic response to <⅓; 1.1 MAC abolishes it; CO₂ response relatively preserved | Knill & Gelb 1978 (Anesthesiology 49:244, PMID 697078) |

- **Opioid model (use this):** Bouillon alfentanil model (Anesthesiology 1999;91:144, PMID 10422940) — indirect-
  response model of PaCO₂: ventilation driven by PaCO₂ with gain F≈4; opioid raises apnoeic threshold / depresses
  drive; EC50 60 µg/L, kel,CO₂ 0.088/min.
- **Propofol model:** Bouillon 2004 (Anesthesiology 100:240, PMID 14739795): indirect-response, C50,propofol
  1.33 µg/mL, gain F 4.37, ke0,CO₂ 0.95/min, kel,CO₂ 0.11/min, baseline PaCO₂ 40.9 mmHg, baseline V̇E 6.45 L/min,
  γ 1.68. Includes a correction because propofol lowers V̇CO₂.
- **Synergy:** remifentanil + propofol depress ventilation **synergistically** (Nieuwenhuijs 2003, Anesthesiology
  98:312, PMID 12552187): at fixed PetCO₂ 55, resting V̇i depressed 44 % by 1 µg/mL propofol, 58 % by 1 ng/mL
  remifentanil; combination strikingly synergistic.
- **Simple engine model:** V̇E = slope·(PaCO₂ − apnoeic_threshold), clamped ≥0. Opioids/propofol/volatiles
  (a) **raise** the apnoeic threshold (right-shift → apnoea at higher PaCO₂) and (b) **reduce the slope** (flatten).
  Hypoxic ventilatory drive is a separate, small add-on term, abolished even at sub-MAC volatile (Knill).

### Upper-airway obstruction / sedation, laryngospasm
- **Upper-airway collapsibility ↑ with propofol depth** (Eastwood 2005, Anesthesiology 103:470, PMID 16129969):
  pharyngeal critical closing pressure Pcrit rose −0.3 → +0.5 → +1.4 cmH₂O at effect-site 2.5/4.0/6.0 µg/mL, with
  profound genioglossus EMG suppression. Hillman 2009 (Anesthesiology 111:63, PMID 19512872): collapsibility jumps
  abruptly around loss of consciousness — vulnerable transition from conscious→unconscious sedation.
- **Laryngospasm** (Visvanathan 2005, Qual Saf Health Care 14:e3, PMID 15933300): 189/4000 AIMS incidents; complete
  glottic closure → obstruction; desaturation in >60 %, bradycardia 6 % (23 % in <1 yr), **pulmonary oedema 4 %**,
  aspiration 3 %. Precipitated by airway stimulation, secretions, light anaesthesia.
- **Negative-pressure pulmonary oedema** (Ma 2023, Exp Ther Med 26:455, PMID 37614417): forceful inspiration against
  a closed glottis → very negative intrapleural pressure (classic figures −50 to −100 cmH₂O) → ↑pulmonary
  microvascular transmural pressure → transudation into alveoli. Commonest trigger = post-extubation laryngospasm.

### Uncertain (§7)
- Awake CO₂ slope "~2 L/min/mmHg" is a textbook central value (Read method); true normal range is wide (~1–6).
- Exact apnoeic-threshold gap (e.g. "4–5 mmHg below resting") not confirmed from Hickey 1971 primary text; the paper
  establishes a fixed relation to resting PaCO₂ but I could not read the numeric offset.

---

## 8. Pre-oxygenation time course (EtO₂)

| Quantity | Value | Source |
|---|---|---|
| Target (adequate pre-ox) | EtO₂ ≥0.9 (or EtN₂ ≤5 %) | Nimmagadda 2017; Tanoubi 2009; DAS 2015 (EtO₂ 0.87–0.9) |
| Tidal-volume breathing, 100 % O₂ tight mask | ≥0.9 after ~3 min | Nimmagadda 2017 (Anesth Analg 124:507, PMID 28099321); Hamilton & Eastwood 1955 |
| 8 deep breaths in 60 s (10 L/min) | equivalent to 3 min TVB (PaO₂ 369 vs 392 mmHg) | Baraka 1999 (Anesthesiology 91:612, PMID 10485768) |
| 4 deep breaths in 30 s | inferior (PaO₂ 256–316 mmHg) — inadequate | Baraka 1999; Tanoubi 2009 |
| Pre-ox time constant | FAO₂ half-time = 0.693·FRC/alveolar ventilation; FRC 2.5 L → ~26 s at 4 L/min, ~13 s at 8 L/min | Benumof 1999 (Anesthesiology 91:603, PMID 10485765) |
| Leaks | main cause of failure (beard, edentulous) | Nimmagadda 2017; Tanoubi 2009 |

Engine model: EtO₂ (and FAO₂) approach ~0.9 as a first-order exponential with time constant ≈ FRC/alveolar
ventilation; denitrogenation washes N₂ out of the FRC store. Head-up/CPAP help obese; labouring/high-V̇/FRC-ratio
patients pre-oxygenate *faster* but also desaturate faster (McClelland 2009). **DAS 2015** (Frerk, BJA 115:827,
PMID 26556848): preoxygenate all; EtO₂ 0.87–0.9; apnoea without desaturation 1–2 min on air, ~8 min preoxygenated;
apnoeic oxygenation up to 15 L/min nasal (or HFNO up to 70 L/min).

### Uncertain (§8): none major — well sourced.

---

## 9. Temperature (perioperative + malignant hyperthermia)

### Perioperative thermoregulation (2-compartment core/periphery)
- **Three-phase GA hypothermia** (Sessler 2000, Anesthesiology 92:578, PMID 10691247; Sessler 2008, Anesthesiology
  109:318, PMID 18648241; Sessler 2016 Lancet 387:2655, PMID 26775126):
  1. **Redistribution (first ~1 h):** core falls **0.5–1.5 °C in first 30 min** (Sessler 2008) from core→peripheral
     heat flow (anaesthetic-induced vasodilatation). Matsukawa 1995 (Anesthesiology 82:662, PMID 7879935): core
     −1.6 ± 0.3 °C in hour 1, **81 % due to redistribution** (46 kcal trunk→limbs).
  2. **Linear phase:** slower ~0.5–1 °C/h from heat loss > production (hours 1–3; Matsukawa: further −1.1 °C over
     hours 2–3, redistribution only 43 %). A "~0.3 °C/h" plateauing rate is a reasonable teaching default for the
     later linear phase under some warming.
  3. **Plateau:** when core reaches the (anaesthetic-lowered) vasoconstriction threshold (~34.5 °C under GA), warm
     core is constrained and core stabilises (Kurz 1995, Anesthesiology 83:491, PMID 7661349).
- **Interthreshold range:** normal 0.2–0.4 °C; GA widens it ~10–20× to ~**2–4 °C** (Sessler 2008). Propofol lowers
  vasoconstriction/shivering thresholds **linearly** (−0.6 °C per µg/mL; Matsukawa 1995 PMID 7741292); volatiles
  nonlinearly (desflurane ~−3 °C at 0.8 MAC; Annadata 1995 PMID 8533913).
- **Real-world pattern with forced-air warming** (Sun 2015, Anesthesiology 122:276, PMID 25603202): even when warmed,
  core falls in hour 1 (mean nadir 35.7 ± 0.6 °C; 64 % <36 °C by 45 min) then rises.
- **Forced-air warming heat transfer:** upper-body blanket 2.6–26.6 W (ΔT-dependent); plus it converts ~37.8 W of
  heat loss to gain → net change in heat balance ~40–64 W (Bräuer 2002, Acta Anaesthesiol Scand 46:965, PMID
  12190797); full-body blankets 30.7–77.3 W at 32 °C surface (Bräuer 2007, PMID 17197466). Clinically the forced-air
  warmer transferred ~35 W more than other devices and best maintained core temperature (Hynson & Sessler 1992,
  J Clin Anesth 4:194, PMID 1610573).
- **2-compartment model for the engine:** core compartment (≈ trunk+head, tightly regulated, ~66 % mass) and
  peripheral compartment (arms+legs, 2–4 °C cooler). At induction, vasodilatation lets heat flow core→periphery
  (redistribution). Mean-body temperature change = ∫(metabolic heat production − cutaneous heat loss). Specific heat
  of human tissue ≈ 0.83 kcal·kg⁻¹·°C⁻¹ (≈3.5 kJ·kg⁻¹·°C⁻¹); evaporated sweat dissipates 0.58 kcal/g; basal
  metabolic heat ≈ 1 kcal·kg⁻¹·h⁻¹ (Sessler 2008).

### Malignant hyperthermia
| Quantity | Value | Source |
|---|---|---|
| Core temperature rise rate | **1–2 °C every 5 min** | Rosenberg 2007 (Orphanet J Rare Dis 2:21, PMID 17456235); Rosenberg 2015 (PMID 26238698) |
| Severe hyperthermia | can exceed 44 °C; >~41 °C → DIC usual cause of death; tissue destruction ~41.5 °C | Rosenberg 2015 |
| EtCO₂ | early, sensitive sign; rises despite ↑minute ventilation; with TIVA/no suxamethonium rise is more gradual | Rosenberg 2015; Glahn 2010 |
| First/early sign | hypercarbia (↑EtCO₂), sinus tachycardia, masseter spasm; temperature often 1st–3rd sign (median max 39.1 °C) | Larach 2010 (Anesth Analg 110:498, PMID 20081135) |
| Dantrolene | 2.5 mg/kg initial, repeat q10–15 min until resolving; upper suggested limit ~10 mg/kg | Rosenberg 2015; Glahn 2010 (EMHG, BJA, PMID 20837722) |
| Risk of complication | ↑2.9× per 2 °C max temperature; ↑1.6× per 30-min dantrolene delay | Larach 2010 |
| Mortality / temp monitoring | death risk 13.8× with no temperature monitoring vs core monitoring | Larach 2014 (Anesth Analg 119:1359, PMID 25268394) |

- **Larach clinical grading scale** (Larach 1994, Anesthesiology 80:771, PMID 8024130) — six processes, point-weighted,
  summed to a raw score → MH rank 1 (almost never) to 6 (almost certain). Indicators (from Rosenberg 2015 Table 1):
  - **Rigidity:** generalised rigidity; masseter spasm after suxamethonium.
  - **Muscle breakdown:** CK >20,000 IU (with suxamethonium) or >10,000 (without); cola-coloured urine; myoglobin
    urine >60 µg/L or serum >170 µg/L; K⁺ >6 mEq/L.
  - **Respiratory acidosis:** EtCO₂ >55 mmHg (controlled vent) or >60 (spontaneous); PaCO₂ >60 (controlled) or >65
    (spontaneous); inappropriate hypercarbia/tachypnoea.
  - **Temperature increase:** rapid inappropriate rise; T >38.8 °C perioperatively.
  - **Cardiac:** inappropriate sinus tachycardia; VT/VF.
  - (**Other/family:** rapid dantrolene reversal; raised resting CK; autosomal-dominant family history.)
  Only one element per process needed to score. Raw-score bands map to ranks (secondary sources: ~0 = rank 1 up to
  ≥50 = rank 6).
- **Guidelines:** Hopkins 2021 (Association of Anaesthetists MH 2020, Anaesthesia 76:655, PMID 33399225);
  Glahn 2010 (EMHG, PMID 20837722); MHAUS for the crisis protocol/hotline.

### Uncertain (§9)
- MH temperature-rise "1–2 °C/5 min" is from review text (Rosenberg), not a measured time-series; real onset is
  highly variable and slower with TIVA/no-suxamethonium. EtCO₂ rise rate in MH not given as a single number.
- Specific point *values* (not just indicators) of the Larach scale not captured from the primary 1994 table; the
  indicator thresholds above are exact (Rosenberg 2015 Table 1).

---

## Master "Uncertain / unverified" list
1. Benumof 1997 exact per-patient 90 % times for the 127 kg obese (~2.7–3.1 min) and 10 kg child (~3.7 min) — from
   secondary sources only; primary figure not opened.
2. Eger & Severinghaus 1961 exact first-minute PaCO₂ jump — review consensus "8–16 mmHg"; Stock's measured 12 mmHg is
   the solid default.
3. Frumin 1959 peak PaCO₂ (~250 mmHg) / pH (6.72) — historical/secondary.
4. Okada/"virtual PO₂" shift equation sign convention — verify direction on implementation.
5. Pulse-oximeter "ear ~10 s / finger ~30 s" — textbook rounding; trial data give finger lag ~36 s and up to
   130–215 s with hypothermia.
6. Capnogram alpha (100–110°)/beta (~90°) angles — capnography.com/textbook, not a measurement trial.
7. AHA CPR EtCO₂ thresholds (<10 mmHg, ROSC 35–40 mmHg) — from 2013 Meaney consensus; exact 2020 wording not
   re-verified. Falk/Weil 1988 is the primary physiology.
8. GA total respiratory compliance "50–80 mL/cmH₂O" and ETT resistance "5–15 cmH₂O·L⁻¹·s at 1 L/s" — reasonable
   bands; Pelosi partitions lung/chest wall (series), Flevari gives K₂ only (need K₁ for absolute R at 1 L/s).
9. Awake CO₂-response slope "~2 L/min/mmHg" and apnoeic-threshold offset — textbook central values; wide real range;
   Hickey 1971 numeric offset not read from primary.
10. FRC "20 % supine / further 20 % GA" — Wahba review approximations.
11. Negative-pressure pulmonary oedema "−50 to −100 cmH₂O" — classic teaching figure, not from the retrieved review's
    own measurement.

---

## Key references (author, year, journal, PMID/DOI)
- Benumof JL, Dagg R, Benumof R. 1997. *Anesthesiology* 87:979–82. PMID 9357902.
- Farmery AD, Roe PG. 1996. *Br J Anaesth* 76:284–91. PMID 8777112.
- Hardman JG, Wills JS, Aitkenhead AR. 2000. *Anesth Analg* 90:619–24. PMID 10702447.
- McNamara MJ, Hardman JG. 2005. *Anaesthesia* 60:741–6. PMID 16029221.
- Hardman JG, Wills JS. 2006. *Br J Anaesth* 97:564–70. PMID 16873387.
- Hardman JG, Bedforth NM, et al. 1998. *Br J Anaesth* 81:327–32. PMID 9861113 (NPS validation).
- Tanoubi I, Drolet P, Donati F. 2009. *Can J Anaesth* 56:449–66. PMID 19399574. DOI 10.1007/s12630-009-9084-z.
- Jense HG, et al. 1991. *Anesth Analg* 72:89–93. PMID 1984382.
- Berthoud MC, Peacock JE, Reilly CS. 1991. *Br J Anaesth* 67:464–6. PMID 1931404.
- Patel R, Lenczyk M, et al. 1994. *Can J Anaesth* 41:771–4. PMID 7954992.
- McClelland SH, Bogod DG, Hardman JG. 2008. *Anaesthesia* 63:264–9. PMID 18289232. / 2009. *Anaesthesia* 64:371–7. PMID 19317700.
- Patel A, Nouraei SAR. 2015 (THRIVE). *Anaesthesia* 70:323–9. PMID 25388828. DOI 10.1111/anae.12923.
- Gustafsson IM, et al. 2017. *Br J Anaesth* 118:610–7. PMID 28403407. DOI 10.1093/bja/aex036.
- Humphreys S, et al. 2017 (THRIVE children). *Br J Anaesth* 118:232–8. PMID 28100527.
- Ramachandran SK, et al. 2010. *J Clin Anesth* 22:164–8. PMID 20400000.
- Weingart SD, Levitan RM. 2012. *Ann Emerg Med* 59:165–75. PMID 22050948.
- Eger EI, Severinghaus JW. 1961. *Anesthesiology* 22:419–25. PMID 13725901.
- Stock MC, Schisler JQ, McSweeney TD. 1989. *J Clin Anesth* 1:328–32. PMID 2516732.
- Farhi LE, Rahn H. 1955. *J Appl Physiol* 7:472–84. PMID 14367232.
- Severinghaus JW. 1979. *J Appl Physiol* 46:599–602. PMID 35496.
- Okada Y, Tyuma I, Sugimoto T. 1977. *Jpn J Physiol* 27:135–44. DOI 10.2170/jjphysiol.27.135.
- Ellis RK. 1989. *J Appl Physiol* 67:902. PMID 2793692 (SO₂→PO₂ inversion).
- Severinghaus JW, Naifeh KH. 1987. *Anesthesiology* 67:551–8. PMID 3662082. / Naifeh, Koh 1989. *J Clin Monit* 5:72–81. PMID 2723709.
- Young D, et al. 1992. *Anesth Analg* 74:189–95. PMID 1731536.
- Hamber EA, et al. 1999. *J Clin Anesth* 11:113–8. PMID 10386281.
- MacLeod DB, et al. 2005. *Anaesthesia* 60:65–71. PMID 15601275.
- Pertzov B, et al. 2019. *Lung* 197:67–72. PMID 30474708.
- Jubran A. 2015. *Crit Care* 19:272. PMID 26179876.
- Lima AP, Beelen P, Bakker J. 2002. *Crit Care Med* 30:1210–3. PMID 12072670 (perfusion index).
- Bickler PE, Feiner JR, Severinghaus JW. 2005. *Anesthesiology* 102:715–9. PMID 15791098. / Gudelunas 2024. *Anesth Analg* 138:552. PMID 38109495.
- Kodali BS. 2013. *Anesthesiology* 118:192–201. PMID 23221867.
- Bhavani-Shankar K, Philip JH. 2000. *Anesth Analg* 91:973–7. PMID 11004059.
- Shankar KB, et al. 1986/1987/1989 (a-etCO₂ in pregnancy). PMID 3092695 / 3109274 / 2495859.
- Linko K, Paloheimo M, Tammisto T. 1983. *Acta Anaesthesiol Scand* 27:199–202. PMID 6410667.
- Chrimes N, et al. 2022 (PUMA). *Anaesthesia* 77:1395–1415. PMID 35977431. DOI 10.1111/anae.15817.
- Falk JL, Rackow EC, Weil MH. 1988. *N Engl J Med* 318:607–11. PMID 3125432.
- Meaney PA, et al. 2013. *Circulation* 128:417–35. PMID 23801105.
- Isserles SA, Breen PH. 1991. *Anesth Analg* 73:808–14. PMID 1952183.
- Pelosi P, et al. 1996. *Chest* 109:144–51. PMID 8549177.
- Westbrook PR, et al. 1973. *J Appl Physiol* 34:81–6. PMID 4697382.
- Flevari AG, et al. 2011. *Anaesth Intensive Care* 39:410–7. PMID 21675060 (ETT Rohrer K₂).
- Wahba RW. 1991. *Can J Anaesth* 38:384–400. PMID 2036700 (perioperative FRC).
- Tokics L, Hedenstierna G, et al. 1987. *Anesthesiology* 66:157–67. PMID 3813078 (shunt/atelectasis).
- Gunnarsson L, et al. 1991. *Br J Anaesth* 66:423–32. PMID 2025468 (age, atelectasis).
- Hedenstierna G, Edmark L. 2010. *Best Pract Res Clin Anaesthesiol* 24:157–69. PMID 20608554.
- Suh MK, et al. 2010. *Korean J Anesthesiol* 59:329–34. PMID 21179295. / Hirvonen EA, et al. 1995. *Anesth Analg* 80:961–6. PMID 7726439.
- Roberts DJ, et al. 2015 (tension pneumothorax). *Ann Surg* 261:1068–78. PMID 25563887.
- Karzai W, Schwarzkopf K. 2009 (OLV hypoxaemia). *Anesthesiology* 110:1402–11. PMID 19417615.
- Nieuwenhuijs DJ, et al. 2003. *Anesthesiology* 98:312–22. PMID 12552187.
- Bouillon T, et al. 1999 (alfentanil). *Anesthesiology* 91:144–55. PMID 10422940. / 2004 (propofol). *Anesthesiology* 100:240–50. PMID 14739795.
- Knill RL, Gelb AW. 1978. *Anesthesiology* 49:244–51. PMID 697078.
- Hickey RF, et al. 1971 (apnoeic thresholds). *Anesthesiology* 35:32–7. PMID 4932620.
- Doi M, Ikeda K. 1987 (sevoflurane). *Anesth Analg* 66:241–4. PMID 3826666.
- Eastwood PR, et al. 2005. *Anesthesiology* 103:470–7. PMID 16129969. / Hillman DR, et al. 2009. *Anesthesiology* 111:63–71. PMID 19512872.
- Visvanathan T, et al. 2005 (laryngospasm). *Qual Saf Health Care* 14:e3. PMID 15933300.
- Ma J, et al. 2023 (NPPE review). *Exp Ther Med* 26:455. PMID 37614417.
- Nimmagadda U, Salem MR, Crystal GJ. 2017. *Anesth Analg* 124:507–17. PMID 28099321. DOI 10.1213/ANE.0000000000001589.
- Baraka AS, et al. 1999. *Anesthesiology* 91:612–6. PMID 10485768. / Benumof JL. 1999 (editorial). *Anesthesiology* 91:603. PMID 10485765.
- Frerk C, et al. 2015 (DAS). *Br J Anaesth* 115:827–48. PMID 26556848. DOI 10.1093/bja/aev371.
- Sessler DI. 2000. *Anesthesiology* 92:578–96. PMID 10691247. / 2008. *Anesthesiology* 109:318–38. PMID 18648241. / 2016. *Lancet* 387:2655–64. PMID 26775126.
- Matsukawa T, et al. 1995 (heat flow induction). *Anesthesiology* 82:662–73. PMID 7879935. / (propofol thresholds) 82:1169–80. PMID 7741292.
- Annadata R, et al. 1995 (desflurane thresholds). *Anesthesiology* 83:1205–11. PMID 8533913.
- Kurz A, et al. 1995 (plateau heat balance). *Anesthesiology* 83:491–9. PMID 7661349.
- Sun Z, et al. 2015. *Anesthesiology* 122:276–85. PMID 25603202. / Bräuer A, et al. 2002 PMID 12190797, 2007 PMID 17197466. / Hynson JM, Sessler DI 1992 PMID 1610573.
- Larach MG, et al. 1994 (grading scale). *Anesthesiology* 80:771–9. PMID 8024130. / 2010. *Anesth Analg* 110:498–507. PMID 20081135. / 2014. *Anesth Analg* 119:1359–66. PMID 25268394.
- Rosenberg H, et al. 2007 *Orphanet J Rare Dis* 2:21 PMID 17456235; 2015 *Orphanet J Rare Dis* 10:93 PMID 26238698.
- Hopkins PM, et al. 2021 (AoA MH 2020). *Anaesthesia* 76:655–64. PMID 33399225. / Glahn KP, et al. 2010 (EMHG). *Br J Anaesth* 105:417–20. PMID 20837722.
- Jakobsson J, et al. 2021 (perioperative V̇O₂). *Eur J Anaesthesiol* 38. PMID 32858583.
- Chiari L, Avanzolini G, Ursino M. 1997. *Ann Biomed Eng*. PMID 9395044. / Philip JH (Gas Man) 1986 PMID 3540162.
- Pulse Physiology Engine (open source): pulse.kitware.com — Respiratory & Substance Transport methodology.
