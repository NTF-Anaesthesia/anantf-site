Part of the regional engine guide; index: ../INDEX.md

### Modules in `shared/regional/js/`

| Module | Owns |
|---|---|
| `shell.js` | `bootPage(config)`: the sticky app bar, hub ("I need to…" tiles and chapter list), one chapter at a time, hash routing and deep links, search box, level hints, pager, heading tidy-up, credit (`DEFAULT_CREDIT`). Sets `body[data-tb-ready="true"]` and fires `tb-ready` / `tb-chapter` |
| `block.js` | `renderBlock(block, host)`: one block chapter from data, section order, default tiers (`DEFAULT_TIERS`, `SAFETY_KEYS`, `MO_PEARLS`), dose box + `LAST_LINE`, "Anatomy in 3D" card (lazy `mountExplorer`), "Watch the animation" disclosure |
| `scan.js` | `mountScan(host, scene, {blockId, coverage})`: the scan teacher. Four steps (Scan, Identify, Needle, Inject), views Ultrasound / Diagram / Real, needle and LA animation, tappable structures and chip legend, "See in 3D", "Test me", coverage chips, sticky stage and swipe on phones |
| `scene.js` | scene geometry: shape constructors `E P PS L`, `prepare`, spline and plane helpers, LA spread / tent profiles, `warpY` |
| `bmode.js` | the simulated B-mode image for a scene (`LOOK` defaults, §5). Built once per `scene.id`, in phases off idle time (`buildBModeAsync`), deterministic (random seed from the scene id) |
| `diagram.js` | the idealised labelled diagram of the same scene (`COL` colours) |
| `realscan.js` | the "Real" view: open-licence images from `shared/us/`, label pills, colour-key fills, needle / LA overlay, "Your scan" (a local image, never uploaded) |
| `dermatomes.js` | torso coverage map `coverageMap`, torso probe inset `probeInset`, `OUTLINE` |
| `figures/head.js`, `figures/leg.js`, `figures/arm.js` | head, leg and arm figure providers: coverage maps, probe insets, view figures (§3.3) |
| `levels.js` | the level system (§4) |
| `status.js` | status colours and line styles (target, covers, variable, spares), `INJECTION`, `LA`; twin of `css/status.css` |
| `registry.js` | one entry per block across every region (§3.5) |
| `ops/ops-*.js` | the operations behind each "which block for which operation" chooser (§3.6) |
| `la.js` | local anaesthetic dose data and pure maths, no DOM (node imports it): `AGENTS` (mg/kg plain and with adrenaline, and an absolute mg ceiling), `NOTES`, `FORMULAS`, `maxMg`, `mgFromMl`, `mlForMg`, `bmi`, `leanBodyWeight` (Janmahasatian), `idealBodyWeight` (Devine), `doseWeight` (lean weight when BMI ≥ 30), `combinedFraction`, `fractionStatus`, `parseDose`, `doseQuery`, `parseQuery` |
| `lacalc.js` | `mountLaCalc(host, prefill)`: the dose calculator form; styles in `css/lacalc.css` (prefix `lc-`) |
| `decide.js` | the "If it goes wrong" guides: `mountGuide(host, guide, {idPrefix, headingLevel})`, `guideList(ids, {idPrefix, headingLevel, lazy})`, `openGuideFromHash()`, `ensureDecideCss()` (links `css/decide.css`, prefix `ra-dg-`). No imports |
| `data/decisions.js` | the guide data (§3.8): `GUIDES`, `GUIDE_ORDER`, `CORE_GUIDES`, `EXTRA_GUIDES`, `guidesFor(id, region, extra)`, `validateGuide` |
| `appnav.js` | the app frame (§2 "App frame"): `initAppFeel({bar, search})` (bar auto-hide, "/" and Ctrl+K, speculation rules), `mountRail({main, label, items, spy})` (desktop rail), `headingItems()`, `settingsItem(cls)` / `settingsButton(cls)`, `REGION_NAV` / `TOOL_NAV` (the rail's site map), `getAutoHide` / `setAutoHide`, `getSlash` / `setSlash`, `SETTINGS_URL`; while the app look is on it also draws the bottom tab bar (`TABS`, `currentTab`), adds the top bar's search and Safety buttons and moves the chapter menu under the bar below 480 px (`mountBarActions`, `SAFETY_URL`), and runs the large-title observer (`mountLargeTitle`: html `data-ra-collapsed`). Its only import is `skin.js`. Always imported as `appnav.js?v=20261026` |
| `skin.js` | the two looks (§2 "Skins"): `getSkinPref` / `setSkinPref` (`localStorage` `ra-skin`: `auto` · `app` · `web`), `resolveSkin`, `getSkin`, `applySkin`, `onSkin(fn)`, `openedAsApp`. No imports, no DOM beyond `<html data-skin>`. Always imported as `skin.js?v=20261018` |
| `offline.js` | `registerOffline()` registers `/regional-sw.js` once the page has loaded and gone quiet; `mountAppVersion(host)` draws the version lines at the foot of `/blocks/`. Always imported as `offline.js?v=20261016` |
| `search.js` | page search index and synonyms |
| `ui.js` | DOM helpers (`el`, `sv`, `fill`, `callout`, `table`, `details`, `stepper`, …) |
| `refs.js` | kept for old data; renders nothing (the pages carry no citations) |

CSS in `shared/regional/css/`: `regional.css` (all shared `tb-` styles; imports `levels.css` and `appnav.css`),
`appnav.css` (desktop frame and rail, bar auto-hide, the plain bar `.ra-sbar` of the region landings, cross-document view
transitions; also imported by `truncal/landing.css` and linked by `spinal/` and `brachial-plexus/`), `scan.css` and
`realscan.css` (linked by the scan modules themselves), `status.css`, `levels.css`, `lacalc.css`, `decide.css` (linked by
`decide.js`), and `skin-app.css` (the app look, linked by every regional page; §2 "Skins").

`shared/regional/tools/stamp.mjs` stamps the offline worker `/regional-sw.js` (§6).
