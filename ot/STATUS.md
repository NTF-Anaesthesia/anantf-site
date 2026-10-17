# OT simulator status

Short and current. Lasting rules go in `NOTES.md`. Update with `/save-state`.

Last updated: 2026-10-17. M0.1 to M3.3 are built and merged, plus a usability pass. Nothing in flight: no open PR, no
half-done work.

## Now

Each session keeps its own line in `status/<session>.md`. Read them before starting; edit only yours.

## Waiting on the owner

Answers to the open questions at the end of `DESIGN.md`, a clinical read-through of drug parameters, thresholds and crisis
steps (`MODEL.md` tags every number; `SCENARIOS.md` tags unchecked doses), a review of alarm default limits (`MODEL.md`
section 14) and the Elective GA case text, and a go-ahead to resume scenario work: ask the owner.

## Next

New scenarios (M4 onwards) are paused until the owner says. Order for when building resumes (`DESIGN.md` "PR order" has
each row's tests):

1. M3.3 polish: trainee-set alarm limits as actions (`{type:'alarmLimit', param, lo, hi}`) so replays stay exact; a
   ventilator-disconnection technical alarm.
2. M4.0 scenario drugs and products (`MODEL.md` section 12).
3. M4.1 the crisis engine (`conditions.js`, `events.js`, the scenario format in `SCENARIOS.md`), scenario 1.
4. M4.2 to M4.7 scenarios 2 to 12, two per PR, in the `PLAN.md` order.
5. M5.1 debrief; M5.2 hints, rewind, share a run as a relative link.

Usability ideas: split the long Patient tab (rhythm/resuscitation); alarm-limit settings.

## Recently done

- Usability pass (#650): alarm bar fix, eight tabs as a 4x2 grid, "How it works" on the library, collapsible first-anaesthetic
  guide, "More drugs" fold, Log TCI lines fixed.
- M3.3 alarms (#628, #645) and the Log tab (`ui/log.js`); M3.2 pre-op screen, operation timeline, Examine and Help tabs
  (#608, #612, #614, #622); M3.1 airway (#607). Earlier M0 to M2 (#570 to #604).

To resume: read this file, then `NOTES.md` ("Lessons from the build sessions" first), then `DESIGN.md` "PR order".
Branch from `main`; one small PR per slice; run the simulator's tests before every push.
