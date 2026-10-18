Part of the regional engine guide; index: ../INDEX.md

### Outside the engine

- **brachial-plexus/** keeps its own scan teacher (`js/ultrasound.js`, `SCENES_MM`), 3D viewer and real scans
  (`brachial-plexus/us/`, `js/real-scans.js`); the upper-limb engine pages carry the same blocks. It imports
  `levels.js` and `status.js` from the engine and links `css/status.css` and `css/levels.css`.
- **spinal/** imports `levels.js` (its old tiers map to MO / Resident / Consultant; "Pearls only" is Consultant only)
  and links `css/levels.css`. It also imports `realscan.js` (which loads `scan.css` and `realscan.css` itself) for the
  neuraxial real scans at `#us-real`; `spinal/css/ultrasound.css` styles `.ra-rs .tb-btn` because spinal doesn't load
  `regional.css`. Its in-chapter topic navigation is `spinal/js/topics.js`.
- **plexus/** uses `levels.js`, `status.js` and `regional.css`. `plexus/js/explorer.js` is also loaded on demand by
  block pages. Pages without a `three` import map get the explorer in an iframe of `plexus/index.html?embed=1`.
- **three.js** r160 and its Draco decoder live in `shared/vendor/three-r160/`, reached only through the import maps
  in `brachial-plexus/index.html` and `plexus/index.html`. No other page loads three.js until "Open here" is tapped.
- **Animations**: `lower-limb/anim/` is Dr Chew Shi Hao's frozen engine. Don't edit it. Block data reaches it through
  `watch`; `lower-limb/shared/js/anim.js` (`animFigure`) is for sections outside block data. See
  [`lower-limb/shared/LEG.md`](../../../lower-limb/shared/LEG.md).
