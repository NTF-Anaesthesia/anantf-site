# Brachial plexus V3 model: web export report

Source: `Abducted Brachial Plexus v3.blend`, exported from a copy; the original was not modified.

## Files

| File | Contents | Triangles | Size |
|---|---|---|---|
| `brachial-plexus-v3.glb` | 14 objects: Nerve, Artery, Vein and 11 bones | 285,030 | 0.62 MB |
| `brachial-plexus-v3-nerves-split.glb` | The plexus as 40 separately named nerve segments (see below) | 23,780 | 0.13 MB |

- **Format:** glTF binary with Draco mesh compression (level 7). Your loader needs a `DRACOLoader`.
- **Transforms:** all transforms and modifiers are applied. Every node has an identity transform.
- **Materials:** one plain-colour material per object, with no textures.

## Units and axes

- **Units:** the .blend is in millimetres at life size. **The .glb files are in metres** (scaled by 0.001), so 1 glTF unit = 1 m. The whole model is about 0.23 × 0.18 × 0.23 m.
- **Axes in the .blend:** Z-up. +X is patient-lateral (toward the left arm), +Y is posterior and +Z is superior.
- **Axes in the .glb:** the exporter converted the model to glTF's standard **Y-up**.
  - +X is lateral (toward the left arm).
  - +Y is superior.
  - +Z is **anterior** (glTF +Z is Blender −Y).
- **Camera:** to view from the front, look down −Z from a point on +Z.

## Objects in `brachial-plexus-v3.glb`

Triangle counts are after decimation; the second column is the count in the .blend. Bounding boxes are in **Blender world coordinates, in mm**.

| Object | Triangles (blend → glb) | Bounding box min (x, y, z) | Bounding box max (x, y, z) | Colour (RGB) |
|---|---|---|---|---|
| Nerve | 1,608,220 → 180,000 | −86.9, −9.9, −50.0 | 87.7, 30.7, 77.5 | 0.95, 0.78, 0.10 (yellow) |
| Artery | 388,240 → 24,998 | −81.6, −13.2, −29.8 | 88.4, 13.6, 18.7 | 0.80, 0.06, 0.05 (red) |
| Vein | 483,348 → 25,000 | −73.3, −33.2, −42.4 | 86.6, 5.8, 14.2 | 0.10, 0.25, 0.85 (blue) |
| Humerus | 333,038 → 20,000 | 43.9, −7.2, −9.6 | 92.8, 40.7, 41.1 | 0.89, 0.85, 0.74 (bone) |
| Scapula | 25,324 → 15,000 | −36.8, −9.9, −120.4 | 65.6, 117.4, 46.5 | bone |
| Clavicle | 1,550 | −88.7, −58.4, −23.7 | 44.8, 40.7, 48.0 | bone |
| First rib | 3,210 | −83.5, −44.7, −26.0 | −28.6, 25.9, 33.4 | bone |
| Vertebra C3 | 2,440 | −128.0, −7.8, 79.9 | −71.5, 46.4, 106.6 | bone |
| Vertebra C4 | 1,940 | −128.7, −7.3, 67.4 | −70.7, 45.1, 92.4 | bone |
| Vertebra C5 | 2,336 | −130.5, −6.0, 55.8 | −69.0, 50.4, 78.2 | bone |
| Vertebra C6 | 2,304 | −130.4, −4.4, 40.6 | −69.1, 59.2, 65.2 | bone |
| Vertebra C7 | 2,164 | −135.4, −0.7, 25.4 | −64.2, 69.6, 52.4 | bone |
| Vertebra T1 | 1,946 | −138.6, 3.7, 9.5 | −60.9, 75.9, 40.2 | bone |
| Vertebra T2 | 2,142 | −137.3, 8.7, −10.6 | −62.2, 81.7, 24.4 | bone |

The vertebrae are whole, and their midline is at x ≈ −99.8 mm. The model's origin is offset from Z-Anatomy's world origin by (99.8, 7.6, 1413.1) mm.

## Nerves

- **One mesh in the main file:** in the main .glb and the .blend, the plexus is a **single object, "Nerve"**. It is one watertight body, a smooth union of every nerve, so it has only **one loose part**. Splitting it into loose parts gives nothing useful.
- **Second file with named segments:** I built `brachial-plexus-v3-nerves-split.glb` from the same centrelines and radii that generated the Nerve mesh.
  - Each named segment is its own tube. Tubes overlap at the junctions, which suits highlighting or hover-picking.
  - These tubes are not unioned, so the surface differs slightly from the smooth union.
  - It lines up with the main file in the same frame, so the two can be overlaid; you could hide "Nerve" and show the split tubes instead.
- **The 40 objects:**
  - **Roots:** C5 root, C6 root, C7 root, C8 root, T1 root.
  - **Trunks:** Superior trunk, Middle trunk, Inferior trunk.
  - **Divisions:** Ant div superior/middle/inferior trunk, Post div superior/middle/inferior trunk.
  - **Cords:** Lateral cord, Medial cord, Posterior cord.
  - **Median formation:** Lateral root of median, Medial root of median, Median nerve.
  - **Terminal branches:** Musculocutaneous nerve, Axillary nerve, Radial nerve, Ulnar nerve.
  - **Collateral branches:** Dorsal scapular nerve, Suprascapular nerve, Nerve to subclavius, Lateral pectoral nerve, Medial pectoral nerve, Medial cutaneous nerve of arm, Medial cutaneous nerve of forearm, Upper subscapular nerve, Thoracodorsal nerve, Lower subscapular nerve, First intercostal nerve.
  - **Long thoracic, in 5 pieces:** C5 part, C6 part, C5-C6 stem, C7 part, and "Long thoracic nerve" (the common stem).
- **Branch lengths:** collateral branches are cut to about 15 mm, and the axillary nerve to about 12 mm. The median, ulnar, radial and musculocutaneous nerves continue to the end of the vessels, arranged as they are seen in an axillary block. Seen from the end of the arm:
  - median anterolateral to the artery;
  - ulnar medial, between artery and vein;
  - radial posterior;
  - musculocutaneous anterolateral, leaving the bundle.

## Side and position

- **Side:** this is the **left** side. It runs from the cervical spine (C3–T2) out to the left upper arm.
- **Arm position:** the shoulder is **abducted about 90°**, with the arm horizontal, as for an axillary block.
  - The shoulder girdle (clavicle and scapula) is raised 15° about the sternoclavicular joint.
  - The humerus is rotated about the centre of its head so its shaft runs parallel to the arm part of the neurovascular bundle.
  - The humerus is cut off level with the end of the vessels.
- **Vessels:** the artery runs subclavian → axillary → brachial and the vein runs subclavian → axillary. Their branches are left out.

## Provenance and licence (for the credits)

- **Source:** all geometry derives from **Z-Anatomy** (https://www.z-anatomy.com, https://github.com/LluisV/Z-Anatomy), licensed **CC BY-SA 4.0**. Z-Anatomy's meshes are in turn based on **BodyParts3D** (© The Database Center for Life Science, DBCLS, licensed CC BY-SA 2.1 Japan).
- **Bones:** these are Z-Anatomy's own meshes, left side, placed as above. Two stray triangles were removed from the scapula and the humerus. The humerus was also voxel-remeshed so it is watertight, then cut.
- **Nerves and vessels:** these are new tube meshes generated from Z-Anatomy's left-side centreline curves for the plexus and vessels, so they are a derivative work. The changes were:
  - wiring errors corrected;
  - branches shortened;
  - the shoulder abducted;
  - everything thickened for 3D printing (the thinnest nerve is about 3 mm);
  - paths smoothed and moved clear of the clavicle and first rib.
- **Suggested credit line:** "3D model derived from Z-Anatomy (CC BY-SA 4.0), based on BodyParts3D © DBCLS (CC BY-SA 2.1 JP). Modified." Because of ShareAlike, the model files (and anything built from them) must be shared under CC BY-SA 4.0. The licence covers the model, not the rest of the site's code.
- **Not at life-size accuracy:** the model is a teaching simplification with deliberately thickened structures and is not MRI-accurate. Within the left side of the model:
  - the T1 root dips about 2.4 mm into the first rib;
  - C8 dips about 3 mm into C7;
  - the long thoracic nerve's C7 contribution dips about 2 mm into C7.
