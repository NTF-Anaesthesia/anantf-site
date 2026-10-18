Part of the regional engine guide; index: ../INDEX.md

## 5. Ultrasound look

### The `LOOK` object (`bmode.js`)

The simulated image is built from three mm-unit layers painted from the scene (diffuse echo, specular reflectors,
attenuation), then speckle, point-spread blur, depth gain, noise, log compression and a grey map. `LOOK` holds the
defaults:

| Key | Value | What it does |
|---|---|---|
| `sy`, `sx` | 0.17, 0.24 | speckle point-spread sigma, axial and lateral at the focus (lateral wider, so grain streaks sideways) |
| `spy` | 0.11 | axial blur of specular reflectors (fascia, bone, needle), kept thin so lines stay crisp |
| `cs` | 2.8 | specular gain relative to diffuse scatter |
| `looks` | 2 | compounded speckle realisations |
| `srk`, `srx`, `sry` | 0.6, 0.45, 0.3 | edge-preserving speckle reduction: mix and kernel |
| `iw`, `dr` | 1.4, 28 | log compression reference and dynamic range (dB) |
| `curve`, `knee` | 9-point curve, 0.3 | grey map after compression: dark toe (fluid, fat and shadow are black), even mid-tones, soft shoulder |
| `att` | 0.36 | attenuation over the image depth |
| `near`, `nearW` | 0.5, 0.05 | bright near field (skin and dermis) and how fast it decays |
| `enh` | 0.16 | posterior enhancement under fluid, per mm |
| `noise` | 0.016 | electronic noise floor |
| `skin`, `skinSp`, `derm` | 0.85, 0.12, 0.4 | entry echo, its specular part, the dermis band |
| `mDens`, `mLen`, `mS0`, `mS1`, `mSp` | 1.8, [1, 4.5], 0.25, 0.5, 0.22 | muscle striations: density, length, echo range, specular part |

Per-scene overrides: `scene.dr`, `scene.att`, `scene.enh`, `scene.gain`, `scene.psf` (coarser speckle for curvilinear
scenes), `scene.pxmm` (resolution). Change `LOOK` only to change the look of every scan; change a scene to fix one.

### Target statistics

Measured on modern high-frequency linear-probe scans (grey 0–255, image field only, median across images):

| Measure | Target |
|---|---|
| Percentiles | P5 ≈ 1, P25 ≈ 12, P50 ≈ 38, P75 ≈ 70, P95 ≈ 157, P99 ≈ 202 |
| Mean, SD | 48, 49 (a dark image with strong contrast) |
| Near-black (< 20) | about 31% (fluid, vessels, fat lobules, acoustic shadow) |
| Very bright (> 180) | about 2.4% (fascia, bone cortex, tendon, needle) |
| Speckle grain | autocorrelation half-width ≈ 3.4% of the image width × 1.9% of the height (fine horizontal streaks, not round blobs) |

Qualitatively: crisp thin bright fascia; dark fat lobules with bright septa; honeycomb peripheral nerves; jet-black
vessels with posterior enhancement; bright bone cortex with full black shadow; pure grey, no tint or vignette.

### Re-measuring after a change

1. Serve the repo (`python3 -m http.server 8765`) and, with Playwright, open a few block pages (for example
   `lower-limb/foot-ankle/#popliteal-step-identify`, `lower-limb/hip/`, `truncal/back/#esp-step-identify`,
   `head-neck/cervical/`), wait for `body[data-tb-ready="true"]`, turn labels off and screenshot the ultrasound canvas
   at 390 and 1440 px.
2. Measure each capture in greyscale: percentiles, mean, SD, fraction < 20 and > 180, and the speckle half-width
   (FFT autocorrelation of the mean-subtracted central half of the image; the first lag where it drops below 0.5,
   as a fraction of width and height). For example:

   ```python
   import numpy as np; from PIL import Image
   g = np.asarray(Image.open(f).convert('L'), float); H, W = g.shape
   pct = np.percentile(g, [5, 25, 50, 75, 95, 99]); dark, bright = (g < 20).mean(), (g > 180).mean()
   c = g[H//4:3*H//4, W//4:3*W//4]; c = c - c.mean()
   F = np.fft.fft2(c, s=(2*c.shape[0], 2*c.shape[1])); ac = np.real(np.fft.ifft2(F*np.conj(F))); ac /= ac[0, 0]
   hx = np.argmax(ac[0, :c.shape[1]] < .5) / W; hy = np.argmax(ac[:c.shape[0], 0] < .5) / H
   ```
3. Take the median across captures and match the targets within about ±15%, with the same sideways grain.
4. Look at the result at phone size: labels, needle and LA must stay readable. Never change scene anatomy, labels or
   the needle and spread logic to hit a number.

The brachial plexus app has its own renderer (`brachial-plexus/js/ultrasound.js`); keep the two looking alike.

---
