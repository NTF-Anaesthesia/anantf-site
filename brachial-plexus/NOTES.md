# Brachial plexus notes

Lasting decisions for `brachial-plexus/`. Status and next steps: `STATUS.md`.

## Ownership

- This folder's content is the brachial plexus app: `js/data.js` (blocks, nerves, coverage), `js/ultrasound.js`
  (`SCENES_MM`, drawn to scale), `js/real-scans.js` with `us/`, `js/viewer3d.js`, `js/diagram.js`, `js/coverage.js`.
- `js/data.js` is also read by `plexus/` ("Anatomy in 3D"), so a change there shows on both pages.
- The shared engine (`shared/regional/`) and `plexus/` belong to the regional app work. Ask before changing them.
- Before merging anything here run `node shared/regional/test/run-all.mjs`; it also checks `/plexus/` with the brachial data.

## Owner decisions

- **3D model (10 Oct 2026):** the page always shows the Blender V3 model. There is no model switch button. The
  schematic model stays only as a fallback if the GLB fails to load. Do not bring the switch back.
- **Deck numbers win (10 Oct 2026):** volumes and needle lengths come from the owner's R1 teaching deck. Other
  sources (the owner's own notes, studies) go in as tips or ranges, never over the deck figure.
- **Interscalene and the phrenic nerve:** the phrenic nerve stays under "covers", marked as a side effect.
- **Deck corrections are for the slides, not the site:** "Phrenic" comes off the superior trunk slide; the pectoral
  vessels are the thoraco-acromial artery and vein, not thoracodorsal. The page already uses the right names.
- The brachial app has no quiz (a quiz request in October 2026 was about the spinal page).

## Rules

- **Colours:** nerves yellow, arteries red, veins blue, block-status colours as they are. Never recolour them to the
  brand. The look follows `DESIGN.md`: light only, no theme toggle.
- **Credits:** Dr Koh Wenjun and Dr Chew Shi Hao (content and creation), with the link to https://chewshihao.com/.
- **Model licence:** the model files are derived from Z-Anatomy / BodyParts3D, so they are CC BY-SA 4.0. Keep the
  credit line in the footer.
- **Images:** the owner's teaching-deck images are NYSORA's and the reference plexus diagram is Geeky Medics'. Use them
  as reference only; never copy them or their wording into the site. Real scans in `us/` must be CC BY (or another open
  licence) with the source and licence recorded in `us/sources.json`.
- **Text from the owner's private notes:** rewrite in plain English. Do not copy wording, and do not name colleagues or
  their personal dose preferences on the page.
- **three.js** is vendored (`shared/vendor/three-r160/`); CDNs are blocked in cloud sessions.
- Data is JavaScript, not HTML: edit `js/data.js` (`BLOCKS`: `pearls`, `complications`, `volume`, and so on), not the
  rendered page. A stray quote in a string breaks the whole app, so check the page loads after every edit.

## Lessons

- Check the Block guide tab for all four core blocks at phone width (412 px) after a data change; the new text lists
  are long and the page is mostly used on phones.
- A viewer fix needs a hard refresh on the phone to show: the old script can be cached for several minutes.
