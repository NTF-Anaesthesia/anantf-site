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

export const REAL_SCANS = {
  interscalene: [],
  supraclavicular: [],
  infraclavicular: [],
  axillary: [],
};

export default REAL_SCANS;
