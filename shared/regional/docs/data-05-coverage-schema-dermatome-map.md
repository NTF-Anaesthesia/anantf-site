Part of the regional data guide; index: ../INDEX.md

## 5. Coverage schema (dermatome map)

```js
coverage: {
  side: 'unilateral' | 'bilateral',        // unilateral is drawn on the patient's right
  areas: [ { levels: ['T10', 'T12'],         // two levels = inclusive range T10–T12; other lists are taken as given
             zones: ['anterior'],            // see below
             density: 'dense' | 'moderate' | 'patchy' } ],
  summary: 'T10–T12, …',                   // "Covers:" line and the at-a-glance strip
  mechanism: HTML, density: HTML, misses: HTML,
}
```
Levels: `T2`…`T12`, `L1`. Zones: `front-mid` (paramedian strip), `front-ant`, `front-lat` (flank), `back-med`,
`back-lat`; groups: `midline`, `anterior` (= mid + ant), `anterolateral`, `lateral` (front-lat + back-lat),
`posterior` (back-med + back-lat), `all`. Density is shown by fill strength **and** pattern (solid / hatched / dotted)
**and** words in the legend.

Torso coordinates (for `scene.probe`): each figure is 170 × 300, midline x = 85; patient's right is viewer-left on the
front, viewer-right on the back. Band centres at the midline: T2 62, T4 96 (nipples), T6 126 (xiphoid), T7 141 (scapula
tip on the back), T10 188 (umbilicus), T12 220, L1 240. Flank edge ≈ x 40/130 at the waist; ASIS (50, 236).
`angle` 0 = transverse probe, 90 = parasagittal; negative angles rotate anticlockwise.
