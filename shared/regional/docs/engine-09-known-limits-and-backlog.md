Part of the regional engine guide; index: ../INDEX.md

## 9. Known limits and backlog

In rough priority order. Done on 17 Oct 2026: the desktop layout (rail, container queries for the scan teacher), view
transitions and prefetch between pages, the Settings page with "Hide the bar while scrolling down" and the "/" key
(§2 "App frame"). Done since 15 Oct 2026: upper-limb blocks on the engine with their chooser and real scans,
offline use (`/regional-sw.js`), the dose calculator and structured maxima (`la.js`), the "If it goes wrong" guides
(on the engine blocks, `/blocks/`, and since 17 Oct 2026 the brachial plexus app and `spinal/`), a `var(--ra-bar, 56px)`
fallback everywhere the bar height is used (Firefox ESR 115 has no `:has()`, which sets it),
spinal topic navigation and real scans, and the scalp, glossopharyngeal and V2/V3 diagram and ultrasound scenes
(`hn-sc-temple`, `hn-aw-gpn`, `hn-fa-deep`, `hn-sc-atn`, `hn-aw-gpus`, `hn-fa-ppf`).

1. **Brachial plexus app still has its own scan teacher.** `brachial-plexus/js/ultrasound.js` keeps its own 7
   `SCENES_MM`, renderer and `brachial-plexus/us/` scans; the same blocks are now on the upper-limb engine pages. The
   app has no link to them yet, and the cervical plexus chooser's "brachial plexus" link still goes to the app.
2. **No single-page app.** Pages are separate; a `#/block/<id>` app with redirect stubs is not built (offline use is).
3. **Block dose text is free text.** The calculator has structured maxima, but dose text is still repeated in the
   block, glance, ops, planners and animation headers and kept in step by `data.mjs`. Next step: structured
   `{agent, pct, ml}` dose fields.
4. **Long spinal chapters are not split** into per-topic screens; they have in-chapter topic navigation
   (`spinal/js/topics.js`).
5. **Real scans: one image only for some blocks.** On 16 Oct 2026, 20 images were added: costoclavicular,
   suprascapular, axillary nerve and median nerve in the forearm (two each), ulnar nerve in the forearm and radial nerve
   at the elbow (one each), auriculotemporal and peristyloid glossopharyngeal (two each), pterygopalatine fossa (one),
   inferomedial genicular, proximal obturator and transgluteal sciatic (one each), and transverse paravertebral (two more).
   Still one image: `pvb`, `parasternal`, `rsb`, `iih`, `scp`, `dcp`, `saphenous`, `sciatic`, `genicular` (SMGN),
   `gen-slgn`, `gen-imgn`, `acb-canal`, `obturator`, `sciatic-tg`, `ulnar-forearm`, `radial-elbow`, `ppf` (the ulnar,
   radial and sciatic-tg images are photographs of the screen; replace them when a cleaner open-licence scan turns up).
   No real scan, by design for now: the diagram-only scenes (scalp block at the temple, intraoral glossopharyngeal,
   maxillary and mandibular nerves at the coronoid notch, peribulbar and sub-Tenon's, below-knee saphenous field block,
   wrist block). Searched without success on 16 Oct 2026 (Europe PMC, open-access CC BY): a second superficial cervical
   plexus, rectus sheath and ilioinguinal image.
6. **Animations** for iPACK, genicular, obturator, saphenous and sciatic blocks (Dr Chew Shi Hao's call).
7. Problems inside `lower-limb/anim/`, `popliteal-animation/` and `exams/` are reported to Dr Chew Shi Hao, not fixed.

---
