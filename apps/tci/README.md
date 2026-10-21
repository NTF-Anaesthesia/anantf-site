# TCI emulator (anantf.com/tci/)

Propofol target-controlled infusion emulator for teaching: Eleveld, Schnider and Marsh, styled on the B. Braun
Space plus Perfusor TCI, plus an operable pump emulator (`tci/pump/`) with the pump's keys, menus, induction bolus,
alarms and a teaching panel. Main question it answers: **what Schnider Ce gives the same induction bolus as Eleveld Ce X,
for this patient?** Education and planning only; not a substitute for the pump display or clinical judgement.

Unlisted (noindex, no links from the site); the owner shares the link.

## Layout

| Path | What |
|---|---|
| `src/engine/` | Pure PK engine, no DOM: body size, models, exact solver, TCI controller, pump variants |
| `src/main.ts`, `src/ui/`, `src/style.css` | The app (vanilla TypeScript, the shared app kit `assets/app/app.css`, light and dark) |
| `pump/index.html`, `src/pump/` | The Space plus Perfusor emulator (`tci/pump/`): `sim.ts` (pump state machine and real-time TCI run, pure), `screens.ts` (the virtual LCD), `main.ts` (casing, teaching panel), `presets.ts`, `audio.ts`, `pump.css` |
| `oracle/tci_ref.py` | Python oracle (matrix exponential). Source of `test/golden.json` |
| `test/` | Vitest (golden, properties, pump state machine) and the Playwright checks (`e2e.mjs`, `pump.e2e.mjs`) |
| `docs/REFERENCES.md` | Sources and assumptions; builds the app's References and Assumptions screens |
| `docs/RESEARCH_NOTES.md` | Phase 1 research, verification status, real-pump test questions |
| `docs/PUMP.md` | Pump emulator notes: every screen and behaviour, evidence / inferred / unknown |
| `../../tci/` | Built site, committed (GitHub Pages has no build step) |

## Run, test, build

```sh
cd apps/tci
npm ci                      # PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 if a browser is already installed
npm run dev                 # http://localhost:5173 (serves /assets and /fonts from the repo root)
npm test                    # Vitest: engine vs oracle, owner's golden table, mass balance, properties, controller
npm run golden              # regenerate test/golden.json from oracle/tci_ref.py (needs python3 + numpy)
npm run refs                # rebuild src/refs.generated.json after editing docs/REFERENCES.md
npm run build               # typecheck, then build into ../../tci/ (the app and tci/pump/)
(cd ../.. && python3 -m http.server 8080 &) && npm run e2e   # 390 px, light and dark, console errors, no sideways scroll
npm run e2e:pump            # pump emulator: full flow for Schnider and Eleveld, bolus equals the engine, alarms, 390 and 1280 px
```

## Deploy

Merging to `main` publishes `tci/` on anantf.com within a minute or two. Always run `npm run build` and commit the
rebuilt `tci/` with the source change. CI (`.github/workflows/checks.yml`) runs the tests and fails if `tci/` is stale.

## Rules

- Never change a constant without a source in `docs/REFERENCES.md` and a regenerated golden file. If a source and the
  oracle disagree, fix the oracle first, then the engine.
- The BMI above 30 mode reproduces a *reported* pump behaviour and stays labelled "reported, unverified" until a real
  pump or the manufacturer confirms it.
- Phase 2 (later): Minto remifentanil behind the same `Model` interface (`src/engine/models.ts`).
