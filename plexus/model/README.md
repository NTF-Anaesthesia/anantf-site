# Plexus model files

The 3D files used by the cervical, lumbar and sacral plexus teaching page (`../index.html`).

## Files

| File | What it holds |
|---|---|
| `cervical.glb`, `lumbar.glb`, `sacral.glb` | Context anatomy: bones, muscles, vessels and ligaments around each plexus. Draco-compressed glTF, no materials. One node per Z-Anatomy object, keeping its Z-Anatomy name (for example `Psoas major.r`). Each node has glTF `extras`: `cat` (`bone`, `muscle`, `artery`, `vein` or `ligament`) and `hidden: 1` for covering muscles that start hidden. |
| `cervical-nerves.json`, `lumbar-nerves.json`, `sacral-nerves.json` | Nerve paths: for each element id in `../js/data/<plexus>.js`, a tube radius `r` (metres, thickened for visibility), a `source` field, and one or more polylines (`paths`) ordered from proximal to distal. |

## Source and licence

- Derived from **Z-Anatomy** (https://www.z-anatomy.com/), licensed **CC BY-SA 4.0**, which is based on
  **BodyParts3D © The Database Center for Life Science (DBCLS)**, licensed **CC BY-SA 2.1 Japan**.
- Changes made here: right-sided structures (plus the midline bones and vessels nearby) were extracted from the
  Z-Anatomy Blender file with Blender 5.2, meshes were decimated (at most about 9,000 triangles per bone,
  7,000 per muscle, 3,000 per vessel and 2,000 per ligament) and exported with Draco compression. Nerve paths were
  sampled from Z-Anatomy curves where they exist, and the rest were drawn for teaching from the surrounding
  landmarks (see below). Tube radii are thicker than real nerves so they can be seen and tapped.
- These model files (the GLBs and the nerve JSON files) are shared under **CC BY-SA 4.0**
  (https://creativecommons.org/licenses/by-sa/4.0/), with the attribution above.
- They are for teaching only. They are not accurate enough for clinical decisions, and anatomy varies between patients.

## Which nerve paths come from Z-Anatomy

`source` in each nerve file says where a path came from:
`z-anatomy` = sampled from a Z-Anatomy curve; `mixed` = a Z-Anatomy curve extended or joined by hand;
`reconstructed` = drawn for teaching because Z-Anatomy has no curve for it.
The page shows "Path drawn for teaching; not in Z-Anatomy" for reconstructed paths.

**Cervical**
- Z-Anatomy: C4 and C5 anterior rami, C4–C5 loop, and the related nerves (hypoglossal, accessory, vagus,
  brachial plexus, sympathetic trunk).
- Reconstructed: C1, C2 and C3 anterior rami, the C1–C2, C2–C3 and C3–C4 loops, lesser occipital,
  great auricular, transverse cervical, supraclavicular, phrenic, both roots of the ansa cervicalis and the ansa,
  prevertebral branches, branches to levator scapulae and the scalenes, and branches to
  sternocleidomastoid and trapezius. Z-Anatomy has no cervical plexus branches.

**Lumbar**
- Z-Anatomy: genitofemoral and its genital and femoral branches, saphenous, infrapatellar branch,
  anterior cutaneous and muscular branches of the femoral nerve, anterior and posterior branches of the obturator nerve.
- Mixed: femoral, obturator, iliohypogastric (extended forwards in the abdominal wall), ilio-inguinal,
  lateral femoral cutaneous, lumbosacral trunk.
- Reconstructed: T12–L4 anterior rami, anterior and posterior divisions of L2–L4, accessory obturator,
  branches to iliacus, psoas and quadratus lumborum, and the articular branches to the hip.

**Sacral**
- Z-Anatomy: L4, L5, S3 and S4 contributions, lumbosacral trunk, sciatic, tibial, common fibular, and the related
  femoral and obturator nerves.
- Mixed: S1 and S2 anterior rami (extended to the foramina), superior gluteal, nerve to piriformis,
  nerve to quadratus femoris, posterior femoral cutaneous, pudendal.
- Reconstructed: the anterior and posterior divisions, inferior gluteal, nerve to obturator internus,
  pelvic splanchnic nerves and the branches to levator ani. The sacral foramina and root starts are placed by estimate.

## Coordinate frame

All coordinates in the nerve files and in the data modules (`views`, block `view` and `marker`) are
**Z-Anatomy world coordinates: metres, Z up, −Y anterior (towards the front of the body), +X the patient's left**.
Every plexus is the **right** side, so it lies at negative X. The GLBs were exported with glTF's Y-up conversion, so in
three.js a world point `[x, y, z]` becomes `new THREE.Vector3(x, z, -y)`; the viewer (`../js/viewer3d.js`) applies
this to nerve points, cameras and markers. Data files never contain three.js coordinates.

## Regenerating

The build scripts are not in this repository; they live in the owner's build folder (`plexus-build`), next to a local
copy of the Z-Anatomy Blender file.

1. **Context meshes and raw inputs:** run `export.py` in Blender in background mode on the Z-Anatomy file:
   `blender -b <Z-Anatomy Startup.blend> -P export.py -- <this model folder> <raw folder>`.
   For each plexus it builds a scene `exp_<plexus>` from a fixed list of objects, decimates them, writes
   `<plexus>.glb` (Draco level 7), and writes raw nerve curves and landmark samples (`<plexus>-curves.json`,
   `<plexus>-landmarks.json`) to the raw folder.
2. **Nerve files:** run each plexus's generator (`cervical-data/gen_cervical.py`, `lumbar-data/gen.py`,
   `sacral-data/gen_sacral.py`) with `python`. Each reads the raw curves and landmarks, samples or reconstructs every
   path, rounds to 4 decimals and writes `<plexus>-nerves.json`. Check the result with the plotting scripts in the
   same folders (front and side projections) before copying it here.
3. **Known issue:** `lumbar.glb` also carries the cervical scene and `sacral.glb` carries the cervical and lumbar
   scenes, because each export ran in the same Blender session. The default scene is the right one and the viewer
   uses the scene named `exp_<plexus>`, but re-exporting each file with only its own scene would roughly halve the
   download.
