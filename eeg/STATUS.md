# BIS to DSA status

Short and current. Lasting rules go in `NOTES.md`. Update with `/save-state`.

Last updated: 2026-10-19. Live at anantf.com/eeg/ (the old addresses forward here). Nothing in flight.

## Now

Each session keeps its own line in `status/<session>.md`. Read them before starting; edit only yours.

## Waiting on the owner

Clinical read-through of the wording and BIS ranges, and a check of each skin against a real unit: ask the owner. Known
gaps per skin are in `docs/skin-medtronic.md`, "The three monitor skins at a glance".

## Next (ideas, not agreed)

1. More states: nitrous oxide, opioid-heavy, hypothermia.
2. DSATrainer-inspired additions, built our own (CSA and power-spectrum panels, ECG R-wave bleed-through case, multitaper
   option, burst-suppression parameters).
3. IntelliVue: alarm sounds, SQI triangle / EMG bar (Release L+).

## Recently done

- Awake DSA no longer all blue (eye-movement delta, frontal theta, beta band); SedLine control dock no longer
  overlaps on laptops (19 Oct 2026; `docs/processed-eeg-redesign.md`).

- Philips IntelliVue screen, case timeline (jump 1, 5, 15 min; tap the bar), Medtronic and Advance DSA colours, SedLine
  EEG flicker fix, device cases around each monitor (#585, #588, #591, #595; 15 Oct 2026).
- Medtronic BIS Advance and Masimo SedLine screens rebuilt as near-clones; fidelity pass on the Medtronic screen; final
  integration with all checks green (14 Oct 2026). What is cloned, inferred or unknown per skin: `docs/skin-medtronic.md`.
- Two-sided screens with a right-hemisphere engine, effect-site lag, relaxant and remifentanil rules, new scenarios, a
  "What the trials say" table, graphs-blank-on-phones fix (#495), first version (12-14 Oct 2026).
