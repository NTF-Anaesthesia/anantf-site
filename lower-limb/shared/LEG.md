# Lower-limb blocks: section notes and the leg figure API

The lower-limb section (`lower-limb/`) runs on the shared regional engine in `truncal/shared/` (see
`truncal/shared/DATA.md`). Pages supply data; they do not edit `truncal/shared/`. Lower-limb extras live here:

```
lower-limb/shared/
  js/leg.js        leg figures: coverage maps, probe insets, anatomy figures (this file's API)
  js/anim.js       animFigure(slug): Dr Chew Shi Hao's animated block demonstrations, embedded from lower-limb/anim/
  css/lowerlimb.css  section styles (prefix ll-), loaded after truncal.css
lower-limb/anim/   frozen copy of his animation engine and block modules, shown in embed mode inside an iframe
```

Pages: `lower-limb/index.html` (landing and operation chooser), `hip/`, `knee/`, `foot-ankle/`, `thigh/`.
Each page copies the truncal page template (`truncal/abdominal-wall/index.html`) with paths one level deeper for the
engine (`../../truncal/shared/…`), breadcrumbs **Resources / Regional anaesthesia / Lower-limb blocks / <Page>**, and the
credit **"Created by Dr Koh Wenjun and <a href="https://chewshihao.com/">Dr Chew Shi Hao</a>, NTF Anaesthesia"**.

## leg.js API (drop-in partners of the truncal dermatome functions, like `head-neck/shared/js/head.js`)

```js
import { legCoverageMap, legProbeInset, legFigure, LANDMARKS, ZONES } from '../../shared/js/leg.js';
coverage: { map: legCoverageMap, side: 'unilateral', views: ['front','back'],   // views optional (default: those used)
            areas: [{ zones: ['femoral-ant', 'saphenous'], density: 'dense' },
                    { zones: ['knee-ant'], density: 'moderate' }],
            summary, mechanism, density, misses }
scene.probeInset = legProbeInset;
scene.probe = { view: 'front', at: 'inguinal-crease-mid', angle: 0, label: 'Transverse at the inguinal crease' };
//   at: a LANDMARKS name or [x, y] in that view's viewBox; angle 0 = transverse (across the limb), 90 = along the limb.
//   points: [{ at, label }] instead of a probe for landmark (needle-entry) blocks, e.g. the ankle block.
legFigure(view, { zones, density, points, labels }) // one view as an SVG element, for anatomy chapters
```

### Views (right lower limb, schematic, original drawings)
| view | viewBox | orientation |
|---|---|---|
| `front` | `0 0 160 420` | anterior view, iliac crest at the top, toes at the bottom; **lateral on the viewer's left, medial (midline) on the right** |
| `back` | `0 0 160 420` | posterior view; **medial on the viewer's left, lateral on the right** |
| `sole` | `0 0 120 200` | plantar view of the right foot, toes at the top, heel at the bottom; medial on the viewer's right |
| `dorsum` | `0 0 120 200` | top of the right foot, toes at the top; medial on the viewer's left |

### Landmarks (`LANDMARKS[view][name] = [x, y]`)
- `front`: `iliac-crest` [40,10], `asis` [38,40], `aiis` [50,58], `inguinal-crease-mid` [92,70] (femoral pulse),
  `inguinal-ligament-lat` [62,58], `pubic-tubercle` [140,72], `greater-trochanter` [22,100],
  `femoral-triangle-apex` [110,150], `mid-thigh-medial` [112,190], `distal-thigh-medial` [112,230],
  `adductor-hiatus` [110,245], `patella` [78,282], `knee-medial` [112,285], `knee-lateral` [42,285],
  `tibial-tuberosity` [82,312], `fibular-head` [42,305], `mid-calf-anterior` [80,345], `mid-calf-lateral` [52,350],
  `ankle-anterior` [80,392], `medial-malleolus` [104,392], `lateral-malleolus` [56,396], `dorsum-foot` [80,408]
- `back`: `iliac-crest` [118,10], `buttock` [96,60], `ischial-tuberosity` [52,105], `greater-trochanter` [140,95],
  `gluteal-fold` [84,118], `subgluteal` [92,130], `mid-thigh-posterior` [86,190], `popliteal-apex` [84,250],
  `popliteal-crease` [82,282], `fibular-head` [118,300], `mid-calf-posterior` [80,330], `achilles` [82,385],
  `medial-malleolus` [56,392], `lateral-malleolus` [106,394], `heel` [80,412]
- `sole`: `heel` [60,185], `medial-arch` [86,120], `lateral-border` [24,120], `ball` [60,60], `toes` [60,20]

### Zones (`ZONES[name] = { name, area, views }`)
Cutaneous: `lfcn` (lateral thigh), `femoral-ant` (anterior thigh: intermediate and medial femoral cutaneous),
`genitofemoral` (small area below the inguinal ligament), `ilioinguinal` (upper medial thigh), `obturator`
(variable patch of distal medial thigh), `pfcn` (posterior thigh to the popliteal fossa), `saphenous-knee`
(infrapatellar and medial knee), `saphenous-leg` (medial leg), `saphenous-foot` (medial ankle and medial foot; usually ends at the
medial midfoot, short of the first tarsometatarsal joint), `lat-cut-calf` (lateral calf, common peroneal branch), `sural` (posterolateral distal calf and
lateral foot) (split into `sural-calf` and `sural-foot`), `sup-peroneal` (dorsum of the foot), `sup-peroneal-leg` (front and outer side of the lower leg), `deep-peroneal` (first web space), `tibial-sole` (sole, medial and
lateral plantar), `calcaneal` (heel), `cluneal` (buttock).
Deep (drawn as hatched joint and bone glyphs, labelled "deep"): `hip-ant` (anterior hip capsule), `hip-post`,
`knee-ant` (anterior and anteromedial capsule), `knee-post` (posterior capsule), `femur`, `tibia`, `ankle-joint`,
`foot-bones`.
Groups: `saphenous` = the three saphenous zones; `femoral` = `femoral-ant` + `saphenous`;
`sciatic-below-knee` = `lat-cut-calf`, `sural`, `sup-peroneal`, `deep-peroneal`, `tibial-sole`, `calcaneal`.
Density is shown by fill strength, pattern and words, never colour alone (as on the truncal maps).
