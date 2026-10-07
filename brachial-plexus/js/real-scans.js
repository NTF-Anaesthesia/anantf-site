// Real ultrasound images for the "Real scan" view of the Ultrasound tab.
//
// The Ultrasound tab shows a "Real scan" button and panel for a block only when
// that block has at least one entry below. With empty arrays the mode is hidden.
//
// HOW TO ADD AN IMAGE
// 1. Use only images you are allowed to publish: your own de-identified scans,
//    or openly licensed images (for example CC BY 4.0 figures from open-access
//    papers). Check the licence on the source page. Do NOT use NYSORA, textbook
//    or slide-deck images, which are copyrighted. Remove any patient details,
//    dates and hospital names that are burned into the image before adding it.
// 2. Put the file in brachial-plexus/us/ (JPEG or PNG, about 1200-1600 px wide is
//    plenty). Crop away labels or arrows that were drawn on the original if the
//    licence allows changes (CC BY does; say "cropped" in the credit).
// 3. Add an entry to the block's array:
//
//   {
//     src: 'us/interscalene-smith-2021.jpg',      // path relative to index.html
//     credit: 'Smith J et al. Reg Anesth Pain Med 2021. CC BY 4.0. Cropped.',
//     sourceUrl: 'https://doi.org/...',            // where the image came from
//     licence: 'CC BY 4.0',                        // shown with the credit
//     orientation: 'Screen left = medial, right = lateral', // shown in the caption
//     alt: 'Transverse ultrasound of the interscalene groove', // optional
//     labels: [
//       // x, y: the point on the structure (fraction of image width / height, 0-1).
//       // tx, ty: where the label pill sits (same units). Omit them to put the
//       //         pill on the point itself (no leader line).
//       // elementId: an id from js/data.js ELEMENTS (e.g. 'root-c5'), or null.
//       //            Nerves with an id link to the 3D model and diagram.
//       // kind: nerve | artery | vein | muscle | bone | tendon | pleura | fascia | point
//       { text: 'C5', elementId: 'root-c5', kind: 'nerve', x: 0.48, y: 0.30, tx: 0.40, ty: 0.18 },
//       { text: 'AS', elementId: null, kind: 'muscle', x: 0.30, y: 0.40 },
//     ],
//   },
//
// Labels use the same colours as the simulated scan and are switched on and off
// with the "Labels on scan" control. Several entries per block are allowed; the
// panel then shows previous / next buttons.

// Images in us/ come from open-access articles (CC BY); us/sources.json records the
// licence sentence quoted from each article page. Label points sit on the authors'
// own burned-in labels so they become clickable; caption = the original figure legend.

export const REAL_SCANS = {
  "interscalene": [
    {
      "src": "us/interscalene-1.jpg",
      "credit": "Griffith JF. BJR|Open 2025, Figure 3. CC BY 4.0. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1093/bjro/tzaf003",
      "licence": "CC BY 4.0",
      "alt": "Transverse ultrasound of the interscalene gap showing the upper, middle and lower trunks between the scalene muscles",
      "caption": "(A) Transverse ultrasound of the interscalene gap shows the monofascicular upper (U), middle (M), and lower (L) trunks of the brachial plexus. The classic “traffic light sign” is not always seen. The phrenic nerve is shown (open arrow). (B) Transverse ultrasound of the interscalene gap shows the dorsal scapular artery (arrowhead) passing through the middle and upper trunks of the brachial plexus. The suprascapular nerve is shown (block arrow). Abbreviations: Sa = scalenus anterior muscle; Sm = scalenus medius muscle.",
      "labels": [
        {
          "text": "U",
          "elementId": "trunk-sup",
          "kind": "nerve",
          "x": 0.155,
          "y": 0.31
        },
        {
          "text": "M",
          "elementId": "trunk-mid",
          "kind": "nerve",
          "x": 0.25,
          "y": 0.5
        },
        {
          "text": "L",
          "elementId": "trunk-inf",
          "kind": "nerve",
          "x": 0.316,
          "y": 0.75
        },
        {
          "text": "Sa",
          "elementId": null,
          "kind": "muscle",
          "x": 0.39,
          "y": 0.31
        },
        {
          "text": "Sm",
          "elementId": null,
          "kind": "muscle",
          "x": 0.12,
          "y": 0.66
        },
        {
          "text": "ScA",
          "elementId": null,
          "kind": "artery",
          "x": 0.525,
          "y": 0.8
        },
        {
          "text": "Phr",
          "elementId": "n-phrenic",
          "kind": "nerve",
          "x": 0.245,
          "y": 0.22
        }
      ]
    }
  ],
  "supraclavicular": [
    {
      "src": "us/supraclavicular-1.jpg",
      "credit": "Griffith JF. BJR|Open 2025, Figure 4. CC BY 4.0. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1093/bjro/tzaf003",
      "licence": "CC BY 4.0",
      "alt": "Transverse ultrasound of the supraclavicular fossa showing the bunch-of-grapes divisions next to the subclavian artery",
      "caption": "(A) Transverse ultrasound of the posterior triangle showing the “bunch of grapes” appearance of the divisions (arrows) aligned superomedial to the subclavian artery (ScA). (B) Transverse colour Doppler ultrasound shows the transverse cervical artery passing over the divisions of the brachial plexus.",
      "labels": [
        {
          "text": "ScA",
          "elementId": null,
          "kind": "artery",
          "x": 0.167,
          "y": 0.71
        },
        {
          "text": "Divisions",
          "elementId": null,
          "kind": "nerve",
          "x": 0.184,
          "y": 0.46
        }
      ]
    }
  ],
  "infraclavicular": [
    {
      "src": "us/infraclavicular-1.jpg",
      "credit": "Griffith JF. BJR|Open 2025, Figure 6. CC BY 4.0. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1093/bjro/tzaf003",
      "licence": "CC BY 4.0",
      "alt": "Transverse infraclavicular ultrasound showing the cords around the axillary artery beneath pectoralis major and minor",
      "caption": "(A) Schematic diagram of infraclavicular area. (B) Transverse ultrasound examination showing the cords (arrows) aligned alongside the axillary artery (AxA). Abbreviations: Pmi = pectoralis minor; Pmj = pectoralis major; AxV = axillary vein.",
      "labels": [
        {
          "text": "Pmj",
          "elementId": null,
          "kind": "muscle",
          "x": 0.694,
          "y": 0.255
        },
        {
          "text": "Pmi",
          "elementId": null,
          "kind": "muscle",
          "x": 0.78,
          "y": 0.525
        },
        {
          "text": "AxA",
          "elementId": null,
          "kind": "artery",
          "x": 0.69,
          "y": 0.67
        },
        {
          "text": "AxV",
          "elementId": null,
          "kind": "vein",
          "x": 0.867,
          "y": 0.755
        },
        {
          "text": "Cord",
          "elementId": null,
          "kind": "nerve",
          "x": 0.643,
          "y": 0.547
        },
        {
          "text": "Cord",
          "elementId": null,
          "kind": "nerve",
          "x": 0.632,
          "y": 0.82
        },
        {
          "text": "Cord",
          "elementId": null,
          "kind": "nerve",
          "x": 0.747,
          "y": 0.727
        }
      ]
    },
    {
      "src": "us/infraclavicular-2.jpg",
      "credit": "Beh ZY, Hasan MS, Lai HY, Kassim NM, Md Zin SR, Chin KF. BMC Anesthesiology 2015, Fig. 6. CC BY 4.0. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1186/s12871-015-0090-0",
      "licence": "CC BY 4.0",
      "alt": "Parasagittal infraclavicular block: needle approaching the axillary artery, then local anaesthetic double-bubble spread",
      "caption": "Ultrasound guided posterior parasagittal in-plane infraclavicular brachial plexus block (a) needle trajectory - horizontal, easy direction towards target point, good needle visualization in most cases (b) LA deposit on posterolateral aspect of axillary artery, creating double bubble sign",
      "labels": [
        {
          "text": "AA",
          "elementId": null,
          "kind": "artery",
          "x": 0.36,
          "y": 0.375
        },
        {
          "text": "Needle",
          "elementId": null,
          "kind": "point",
          "x": 0.165,
          "y": 0.51
        },
        {
          "text": "Pec",
          "elementId": null,
          "kind": "muscle",
          "x": 0.333,
          "y": 0.215
        },
        {
          "text": "Lung",
          "elementId": null,
          "kind": "pleura",
          "x": 0.41,
          "y": 0.65
        }
      ],
      "orientation": "Parasagittal: cranial (clavicle) on screen left, caudal on right; skin at top, posterior at bottom (as labelled on image)"
    }
  ],
  "axillary": [
    {
      "src": "us/axillary-1.jpg",
      "credit": "Griffith JF. BJR|Open 2025, Figure 7. CC BY 4.0. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1093/bjro/tzaf003",
      "licence": "CC BY 4.0",
      "alt": "Transverse ultrasound of the axilla showing the median, ulnar, radial and musculocutaneous nerves around the axillary artery",
      "caption": "Transverse ultrasound of axillary fossa showing the musculocutaneous nerve (MCN) lying between the biceps (B) and coracobrachialis (Cb) muscles. The median nerve (M) consistently lies closest to the biceps muscle. The radial nerve (R) tends to lie towards the posterior of the axillary artery while the ulnar nerve lies superomedial to the axillary artery between the radial and medial nerves.",
      "labels": [
        {
          "text": "M",
          "elementId": "n-median",
          "kind": "nerve",
          "x": 0.486,
          "y": 0.27
        },
        {
          "text": "U",
          "elementId": "n-ulnar",
          "kind": "nerve",
          "x": 0.687,
          "y": 0.31
        },
        {
          "text": "R",
          "elementId": "n-radial",
          "kind": "nerve",
          "x": 0.73,
          "y": 0.538
        },
        {
          "text": "MCN",
          "elementId": "n-musculocutaneous",
          "kind": "nerve",
          "x": 0.093,
          "y": 0.757
        },
        {
          "text": "AxA",
          "elementId": null,
          "kind": "artery",
          "x": 0.557,
          "y": 0.486
        },
        {
          "text": "V",
          "elementId": null,
          "kind": "vein",
          "x": 0.4,
          "y": 0.375
        },
        {
          "text": "V",
          "elementId": null,
          "kind": "vein",
          "x": 0.62,
          "y": 0.234
        },
        {
          "text": "V",
          "elementId": null,
          "kind": "vein",
          "x": 0.89,
          "y": 0.33
        },
        {
          "text": "B",
          "elementId": null,
          "kind": "muscle",
          "x": 0.108,
          "y": 0.397
        },
        {
          "text": "CB",
          "elementId": null,
          "kind": "muscle",
          "x": 0.243,
          "y": 0.74
        }
      ]
    },
    {
      "src": "us/axillary-2.jpg",
      "credit": "Satapathy AR, Coventry DM. Anesthesiology Research and Practice 2011, Figure 2. CC BY. Labels and arrows on the image are the authors'.",
      "sourceUrl": "https://doi.org/10.1155/2011/173796",
      "licence": "CC BY",
      "alt": "In-plane axillary block with local anaesthetic spreading around the axillary artery",
      "caption": "Ultrasound scan of axilla. AA: axillary artery, LA: local anaesthetics, r: radial nerve, mu: musculocutaneous nerve, m: median nerve, and u: ulnar nerve. This is an in-plane approach, with the whole length of the needle shaft visible under ultrasound.",
      "labels": [
        {
          "text": "m",
          "elementId": "n-median",
          "kind": "nerve",
          "x": 0.462,
          "y": 0.215
        },
        {
          "text": "u",
          "elementId": "n-ulnar",
          "kind": "nerve",
          "x": 0.655,
          "y": 0.248
        },
        {
          "text": "r",
          "elementId": "n-radial",
          "kind": "nerve",
          "x": 0.607,
          "y": 0.356
        },
        {
          "text": "mu",
          "elementId": "n-musculocutaneous",
          "kind": "nerve",
          "x": 0.38,
          "y": 0.56
        },
        {
          "text": "AA",
          "elementId": null,
          "kind": "artery",
          "x": 0.504,
          "y": 0.356
        },
        {
          "text": "LA",
          "elementId": null,
          "kind": "point",
          "x": 0.233,
          "y": 0.52
        },
        {
          "text": "Humerus",
          "elementId": null,
          "kind": "bone",
          "x": 0.212,
          "y": 0.81
        }
      ]
    }
  ]
};

export default REAL_SCANS;
