// 3D anatomy panel: Z-Anatomy context model (GLB) plus nerve tubes built from
// the plexus nerve file, linked to the diagram through the bus.
//
//   mountViewer(containerEl, ctx) -> { destroy() }
//
// Coordinate frame: data files use Z-Anatomy world coordinates (metres, Z up,
// -Y anterior, +X patient's left). The GLBs were exported Y-up, so a world point
// [x, y, z] is new THREE.Vector3(x, z, -y) here.
//
// Brachial plexus (data.model.frame === 'gltf'): the nerves are named meshes in a second GLB (data.model.nerveGlb,
// mesh name -> element id in data.model.meshes) instead of polylines, and points in the data are in the GLB's own
// Y-up frame. data.model.mirrorX shows that left-sided model as a right side (x -> -x), as the brachial app does.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { STATUS, INJECTION } from '../../shared/regional/js/status.js?v=20261015';

const DRACO_PATH = new URL('../../shared/vendor/three-r160/examples/jsm/libs/draco/gltf/', import.meta.url).href;
const SOURCE = '3d';

const CAT_STYLE = {
  bone: { color: 0xe9e1cf, roughness: 0.75 },
  muscle: { color: 0xb5534c, roughness: 0.6, transparent: true, opacity: 0.35, depthWrite: false },
  artery: { color: 0xc62828, roughness: 0.45 },
  vein: { color: 0x1e4fd1, roughness: 0.45 },
  ligament: { color: 0xcdbf9f, roughness: 0.7 },
};
const CAT_LAYER = { bone: 'bones', ligament: 'bones', muscle: 'muscles', artery: 'vessels', vein: 'vessels' };
const NERVE = new THREE.Color('#e8b923');
const RELATED = new THREE.Color('#9a8f7a');
const DIMMED = new THREE.Color('#b9b2a3');
const ST = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, new THREE.Color(v.color)]));
const ST_OPACITY = { spares: STATUS.spares.opacity };
const HALO = new THREE.Color(STATUS.target.halo);

const LAYERS = [
  { key: 'bones', label: 'Bones', on: true },
  { key: 'muscles', label: 'Muscles', on: true },
  { key: 'covering', label: 'Covering muscles', on: false },
  { key: 'vessels', label: 'Vessels', on: true },
  { key: 'labels', label: 'Labels', on: true },
];

export const w2t = (p) => new THREE.Vector3(p[0], p[2], -p[1]);
const isPt = (p) => Array.isArray(p) && p.length >= 3 && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Number.isFinite(p[2]);

function h(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

export function mountViewer(container, ctx) {
  const { data, bus } = ctx;
  const nerveEls = (ctx.nerves && ctx.nerves.elements) || {};
  const elements = data.elements || {};
  const views = data.views || {};
  const gltfFrame = data.model?.frame === 'gltf';
  const mirror = gltfFrame && !!data.model?.mirrorX;
  // Data point -> three.js point.
  const toV = gltfFrame ? (p) => new THREE.Vector3(mirror ? -p[0] : p[0], p[1], p[2]) : w2t;

  // ---------------------------------------------------------------- DOM
  const root = h('div', 'px-v3');
  const bar = h('div', 'px-v3-bar');
  const viewGroup = h('div', 'px-v3-group');
  viewGroup.setAttribute('role', 'group');
  viewGroup.setAttribute('aria-label', 'Camera views');
  // Layer toggles live in an overflow menu ("Layers ▾") so the bar stays one row.
  const layerWrap = h('div', 'px-v3-layers');
  const layerBtn = h('button', 'px-v3-btn px-v3-layers-btn app-btn app-btn--outline app-btn--compact');
  layerBtn.type = 'button';
  layerBtn.setAttribute('aria-expanded', 'false');
  layerBtn.innerHTML = '<span>Layers</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const layerGroup = h('div', 'px-v3-menu');
  layerGroup.setAttribute('role', 'group');
  layerGroup.setAttribute('aria-label', 'Layers');
  layerGroup.hidden = true;
  layerGroup.id = `px-v3-layers-${Math.random().toString(36).slice(2, 8)}`;
  layerBtn.setAttribute('aria-controls', layerGroup.id);
  layerWrap.append(layerBtn, layerGroup);
  bar.append(viewGroup, layerWrap);
  const setLayerMenu = (open, focusBtn) => {
    layerGroup.hidden = !open;
    layerBtn.setAttribute('aria-expanded', String(open));
    if (open) layerGroup.querySelector('button')?.focus({ preventScroll: true });
    else if (focusBtn) layerBtn.focus({ preventScroll: true });
  };
  layerBtn.addEventListener('click', () => setLayerMenu(layerGroup.hidden));
  const onDocDown = (e) => { if (!layerGroup.hidden && !layerWrap.contains(e.target)) setLayerMenu(false); };
  document.addEventListener('pointerdown', onDocDown);
  layerWrap.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !layerGroup.hidden) { e.preventDefault(); e.stopPropagation(); setLayerMenu(false, true); } });
  layerWrap.addEventListener('focusout', (e) => { if (e.relatedTarget && !layerWrap.contains(e.relatedTarget)) setLayerMenu(false); });
  const stage = h('div', 'px-v3-stage');
  const canvasHost = h('div', 'px-v3-canvas');
  const labelHost = h('div', 'px-v3-labels');
  const tip = h('div', 'px-v3-tip');
  tip.hidden = true;
  const status = h('p', 'px-v3-status', 'Loading 3D model…');
  status.setAttribute('role', 'status');
  const hint = h('p', 'px-v3-hint', 'Drag to rotate, pinch or scroll to zoom, right-drag or two fingers to pan. Tap a nerve to select it.');
  stage.append(canvasHost, labelHost, tip, status);
  root.append(bar, stage, hint);
  container.appendChild(root);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    status.textContent = 'The 3D view needs WebGL, which this browser cannot provide. The diagram still works.';
    return { destroy() { root.remove(); } };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvasHost.appendChild(canvas);
  canvas.setAttribute('tabindex', '0');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', `3D model of the right ${String(data.name || 'plexus').toLowerCase()} with surrounding ${data.model?.context || 'bones, muscles and vessels'}. Use the arrow keys to pan; use the diagram or the list below to select nerves.`);

  const labelRenderer = new CSS2DRenderer({ element: labelHost });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.002, 20);
  scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f78, 1.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(0.4, 0.8, 1);
  camera.add(key);
  const fill = new THREE.DirectionalLight(0xfff4e0, 0.45);
  fill.position.set(-1, -0.3, -0.6);
  scene.add(fill);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.minDistance = 0.03;
  controls.maxDistance = 3;
  controls.zoomSpeed = 0.9;
  controls.rotateSpeed = 0.8;
  controls.listenToKeyEvents(canvas);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  // ---------------------------------------------------------------- nerves
  const nerveRoot = new THREE.Group();
  nerveRoot.name = 'nerves';
  if (mirror) nerveRoot.scale.x = -1;
  scene.add(nerveRoot);
  const labelObjs = [];
  const objs = new Map(); // id -> { group, mat, base, mid }
  const pickables = [];
  const capGeo = track(new THREE.SphereGeometry(1, 14, 10));
  const pickMat = track(new THREE.MeshBasicMaterial({ visible: false }));

  for (const id of Object.keys(nerveEls)) {
    const spec = nerveEls[id];
    const e = elements[id];
    if (!e || !spec || !Array.isArray(spec.paths)) continue;
    const paths = spec.paths.length && isPt(spec.paths[0]) ? [spec.paths] : spec.paths;
    const r = Math.min(0.01, Math.max(0.0005, Number(spec.r) || 0.002));
    const base = e.kind === 'related' ? RELATED : NERVE;
    const mat = track(new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.42, metalness: 0.05, emissive: 0x000000 }));
    const curves = [];
    const group = new THREE.Group();
    group.userData.id = id;
    let first = null; let mid = null; let best = 0;
    for (const path of paths) {
      if (!Array.isArray(path)) continue;
      const pts = [];
      for (const p of path) {
        if (!isPt(p)) continue;
        const v = w2t(p);
        if (!pts.length || pts[pts.length - 1].distanceToSquared(v) > 1e-10) pts.push(v);
      }
      if (pts.length < 2) continue;
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
      const len = curve.getLength();
      if (!(len > 0)) continue;
      const segs = Math.min(400, Math.max(8, Math.ceil(len / 0.0025)));
      const tube = track(new THREE.TubeGeometry(curve, segs, r, 10, false));
      group.add(new THREE.Mesh(tube, mat));
      for (const end of [pts[0], pts[pts.length - 1]]) {
        const cap = new THREE.Mesh(capGeo, mat);
        cap.position.copy(end);
        cap.scale.setScalar(r);
        group.add(cap);
      }
      const proxyGeo = track(new THREE.TubeGeometry(curve, Math.max(6, segs >> 1), Math.max(r * 2.2, r + 0.0035), 6, false));
      const proxy = new THREE.Mesh(proxyGeo, pickMat);
      proxy.userData.id = id;
      proxy.userData.r = r;
      curves.push({ curve, segs });
      group.add(proxy);
      pickables.push(proxy);
      if (!first) first = pts[0].clone();
      if (len > best) { best = len; mid = curve.getPointAt(0.5); }
    }
    if (!group.children.length) continue;
    nerveRoot.add(group);
    const o = { group, mat, base, mid, first, curves, r, halo: null };
    if (e.kind === 'root' && first) {
      const lab = h('div', 'px-v3-labwrap');
      lab.append(h('span', 'px-v3-label is-root', e.short || e.name || id));
      const lo = new CSS2DObject(lab);
      lo.position.copy(first);
      lo.center.set(1.1, 0.5);
      scene.add(lo);
      labelObjs.push(lo);
      o.label = lo;
    }
    objs.set(id, o);
  }
  // Label for the selected nerve.
  const selLabelEl = h('div', 'px-v3-label is-sel');
  const selLabel = new CSS2DObject(selLabelEl);
  selLabel.visible = false;
  scene.add(selLabel);

  // Block marker (needle tip / injection point).
  // Ink sphere with an ivory ring (a camera-facing sprite), the shared injection-marker style.
  const marker = new THREE.Group();
  marker.add(new THREE.Mesh(track(new THREE.SphereGeometry(0.0042, 20, 14)), track(new THREE.MeshStandardMaterial({ color: new THREE.Color(INJECTION.fill), roughness: 0.4 }))));
  const ringCanvas = document.createElement('canvas');
  ringCanvas.width = ringCanvas.height = 128;
  const rc = ringCanvas.getContext('2d');
  if (rc) {
    rc.lineWidth = 16; rc.strokeStyle = INJECTION.fill; rc.beginPath(); rc.arc(64, 64, 50, 0, Math.PI * 2); rc.stroke();
    rc.lineWidth = 10; rc.strokeStyle = INJECTION.ring; rc.beginPath(); rc.arc(64, 64, 50, 0, Math.PI * 2); rc.stroke();
  }
  const ringTex = track(new THREE.CanvasTexture(ringCanvas));
  ringTex.colorSpace = THREE.SRGBColorSpace;
  const ring = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: ringTex, transparent: true, depthTest: false })));
  ring.scale.setScalar(0.0145);
  ring.renderOrder = 10;
  marker.add(ring);
  marker.visible = false;
  scene.add(marker);

  // Wine halo behind target nerves (built on first use for each nerve).
  const haloMat = track(new THREE.MeshBasicMaterial({ color: HALO, transparent: true, opacity: 0.35, side: THREE.BackSide, depthWrite: false }));
  function haloFor(o) {
    if (o.halo) return o.halo;
    const g = new THREE.Group();
    for (const { curve, segs } of o.curves) g.add(new THREE.Mesh(track(new THREE.TubeGeometry(curve, Math.max(6, segs >> 1), o.r * 1.9, 10, false)), haloMat));
    // Mesh nerves (brachial): the same surface pushed out along its normals.
    for (const m of o.meshes || []) {
      const geo = track(m.geometry.clone());
      const pos = geo.attributes.position; const nor = geo.attributes.normal;
      if (pos && nor) for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i) + nor.getX(i) * 0.0016, pos.getY(i) + nor.getY(i) * 0.0016, pos.getZ(i) + nor.getZ(i) * 0.0016);
      g.add(new THREE.Mesh(geo, haloMat));
    }
    g.renderOrder = 1;
    o.group.add(g);
    o.halo = g;
    return g;
  }

  // ---------------------------------------------------------------- layers
  const layerState = Object.fromEntries(LAYERS.map((l) => [l.key, l.on]));
  const layerMeshes = { bones: [], muscles: [], covering: [], vessels: [], other: [] };
  const layerBtns = {};
  for (const l of LAYERS) {
    const b = h('button', 'px-v3-toggle');
    b.type = 'button';
    b.innerHTML = `<span class="px-v3-check" aria-hidden="true"></span><span>${l.label}</span>`;
    b.setAttribute('aria-pressed', String(l.on));
    b.addEventListener('click', () => {
      layerState[l.key] = !layerState[l.key];
      b.setAttribute('aria-pressed', String(layerState[l.key]));
      applyLayers();
    });
    layerBtns[l.key] = b;
    layerGroup.appendChild(b);
  }
  function applyLayers() {
    for (const k of ['bones', 'muscles', 'covering', 'vessels']) layerMeshes[k].forEach((m) => { m.visible = !!layerState[k]; });
    updateLabels();
    requestRender();
  }

  // ---------------------------------------------------------------- views
  const validView = (v) => v && isPt(v.target) && isPt(v.position);
  const viewKeys = Object.keys(views).filter((k) => validView(views[k]));
  for (const k of viewKeys) {
    const b = h('button', 'px-v3-btn app-btn app-btn--outline app-btn--compact', views[k].label || k[0].toUpperCase() + k.slice(1));
    b.type = 'button';
    b.addEventListener('click', () => setView(k));
    viewGroup.appendChild(b);
  }
  const resetBtn = h('button', 'px-v3-btn app-btn app-btn--plain app-btn--compact', 'Reset');
  resetBtn.type = 'button';
  resetBtn.addEventListener('click', () => {
    if (bus.state.block && validView(data.blocks?.[bus.state.block]?.view)) flyToView(data.blocks[bus.state.block].view);
    else homeView();
  });
  viewGroup.appendChild(resetBtn);

  const bbox = new THREE.Box3();
  function fitToBox(instant) {
    const box = bbox.isEmpty() ? new THREE.Box3().setFromObject(nerveRoot) : bbox;
    if (box.isEmpty()) return;
    const c = box.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitH = sphere.radius / Math.sin(fov / 2);
    const fitW = fitH / Math.max(0.3, Math.min(1, camera.aspect));
    const dist = Math.min(controls.maxDistance * 0.95, Math.max(fitH, fitW) * 1.05);
    flyTo(new THREE.Vector3(c.x, c.y, c.z + dist), c, instant);
  }
  function flyToView(v, instant) { flyTo(toV(v.position), toV(v.target), instant); }
  function setView(k, instant) {
    if (validView(views[k])) flyToView(views[k], instant);
    else fitToBox(instant);
  }
  function homeView(instant) {
    const k = validView(views[data.defaultView]) ? data.defaultView : viewKeys[0];
    if (k) setView(k, instant); else fitToBox(instant);
  }

  // ---------------------------------------------------------------- camera animation
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  let anim = null;
  function flyTo(pos, target, instant) {
    if (instant || reduceMq.matches) {
      anim = null;
      camera.position.copy(pos);
      controls.target.copy(target);
      controls.update();
      requestRender();
      return;
    }
    anim = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), start: performance.now(), dur: 750 };
    requestRender();
  }
  function stepAnim(now) {
    if (!anim) return false;
    const u = Math.min(1, (now - anim.start) / anim.dur);
    const e = u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2;
    camera.position.lerpVectors(anim.p0, anim.p1, e);
    controls.target.lerpVectors(anim.t0, anim.t1, e);
    if (u >= 1) anim = null;
    return true;
  }
  controls.addEventListener('start', () => { anim = null; requestRender(); });
  controls.addEventListener('change', () => requestRender());

  // ---------------------------------------------------------------- render loop
  let raf = 0; let destroyed = false; let width = 0; let height = 0;
  function requestRender() { if (!raf && !destroyed) raf = requestAnimationFrame(tick); }
  function tick(now) {
    raf = 0;
    if (destroyed) return;
    const a = stepAnim(now);
    // three r160 clamps the target round the cursor each update; with the cursor at the origin some targets flip in
    // the last bit every frame, so the camera never "settles". Measuring from the target itself keeps it exact.
    controls.cursor.copy(controls.target);
    const moved = controls.update();
    if (width > 0 && height > 0) {
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
    if (a || moved) { clearNudge(); requestRender(); } else scheduleNudge();
  }

  // The collision nudge reads label boxes (a forced layout), so it runs only once the camera has settled,
  // never on every frame of an orbit or a camera flight. While the camera moves, labels sit unnudged.
  let nudgeTimer = 0; let nudged = false;
  function scheduleNudge() {
    if (nudgeTimer || destroyed) return;
    nudgeTimer = setTimeout(() => { nudgeTimer = 0; if (!destroyed && !anim && width > 0 && height > 0) nudgeLabels(); }, 120);
  }
  function clearNudge() {
    clearTimeout(nudgeTimer); nudgeTimer = 0;
    if (!nudged) return;
    nudged = false;
    for (const lo of labelObjs) {
      const inner = lo.element.firstElementChild;
      if (inner && inner.style.transform) { inner.style.transform = ''; inner.classList.remove('is-nudged'); }
    }
  }

  // Root labels: push overlapping labels apart vertically (the label keeps a short leader to its root).
  function nudgeLabels() {
    const items = [];
    for (const lo of labelObjs) {
      const el = lo.element;
      const inner = el.firstElementChild;
      if (!inner) continue;
      if (!lo.visible || el.style.display === 'none') { inner.style.transform = ''; continue; }
      const r = el.getBoundingClientRect();
      if (!r.width) continue;
      items.push({ inner, top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
    items.sort((a, b) => a.top - b.top);
    const placed = [];
    for (const it of items) {
      let dy = 0;
      for (let pass = 0; pass < 3; pass++) {
        let moved = false;
        for (const p of placed) {
          if (it.right <= p.left || it.left >= p.right) continue;
          if (it.top + dy < p.bottom + 2 && it.bottom + dy > p.top - 2) { dy = p.bottom + 2 - it.top; moved = true; }
        }
        if (!moved) break;
      }
      it.inner.style.transform = dy ? `translateY(${Math.round(dy)}px)` : '';
      it.inner.classList.toggle('is-nudged', dy > 0.5);
      if (dy) nudged = true;
      placed.push({ left: it.left, right: it.right, top: it.top + dy, bottom: it.bottom + dy });
    }
  }

  const ro = new ResizeObserver(() => {
    const r = stage.getBoundingClientRect();
    width = Math.max(0, Math.floor(r.width));
    height = Math.max(0, Math.floor(r.height));
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    labelRenderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  });
  ro.observe(stage);

  // ---------------------------------------------------------------- appearance
  const statusColour = (id) => {
    const b = bus.state.block;
    return b ? ctx.status(b, id) : null;
  };
  function refresh() {
    const { selected, hovered, block } = bus.state;
    const keep = selected ? ctx.lineage(selected) : null;
    for (const [id, o] of objs) {
      const st = statusColour(id);
      let colour = o.base;
      let opacity = 1;
      if (block) {
        if (st) { colour = ST[st]; opacity = ST_OPACITY[st] ?? 1; } else { colour = DIMMED; opacity = 0.3; }
      }
      const isTarget = st === 'target' && !(keep && !keep.has(id));
      if (isTarget) haloFor(o).visible = true; else if (o.halo) o.halo.visible = false;
      if (keep && !keep.has(id)) opacity = Math.min(opacity, 0.2);
      o.mat.color.copy(colour);
      const transparent = opacity < 1;
      if (o.mat.transparent !== transparent) { o.mat.transparent = transparent; o.mat.needsUpdate = true; }
      o.mat.opacity = opacity;
      o.mat.depthWrite = !transparent;
      const glow = id === selected ? 0.45 : id === hovered ? 0.3 : st === 'target' ? 0.35 : 0;
      o.mat.emissive.copy(colour).multiplyScalar(glow);
    }
    // Block marker.
    const b = block && data.blocks?.[block];
    if (b && isPt(b.marker)) { marker.position.copy(toV(b.marker)); marker.visible = true; } else marker.visible = false;
    updateLabels();
    requestRender();
  }
  function updateLabels() {
    const on = !!layerState.labels;
    const sel = bus.state.selected;
    const keep = sel ? ctx.lineage(sel) : null;
    for (const lo of labelObjs) lo.visible = on;
    for (const [id, o] of objs) if (o.label) o.label.element.firstElementChild.classList.toggle('is-dim', !!keep && !keep.has(id));
    const o = sel && objs.get(sel);
    if (on && o && o.mid && !(o.label && elements[sel]?.kind === 'root')) {
      selLabelEl.textContent = elements[sel]?.name || sel;
      selLabel.position.copy(o.mid);
      selLabel.visible = true;
    } else selLabel.visible = false;
    requestRender();
  }

  // ---------------------------------------------------------------- picking
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function pick(ev) {
    if (!pickables.length) return null;
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(pickables.filter((p) => p.parent?.visible !== false), false);
    if (!hits.length) return null;
    // Real nerve meshes (brachial): the brachial nerves lie a few millimetres apart, so take the front-most surface hit,
    // as the brachial app does. The tolerance below is only for the thick pick proxies around drawn tubes.
    if (data.model?.nerveGlb) return hits[0].object.userData.id || null;
    // Near-equal hits (within 1.5 cm of the nearest): prefer one in the selected nerve's lineage, then the thinnest.
    const near = hits.filter((x) => x.distance <= hits[0].distance + 0.015 && x.object.userData.id);
    const sel = bus.state.selected;
    const keep = sel ? ctx.lineage(sel) : null;
    let pool = near;
    if (keep) { const inLine = near.filter((x) => keep.has(x.object.userData.id)); if (inLine.length) pool = inLine; }
    pool.sort((a, b) => (a.object.userData.r - b.object.userData.r) || (a.distance - b.distance));
    return (pool[0] || hits[0]).object.userData.id || null;
  }
  let down = null;
  let hoverId = null;
  function showTip(id, ev) {
    if (!id) { tip.hidden = true; return; }
    const e = elements[id];
    tip.textContent = e?.name || id;
    const r = stage.getBoundingClientRect();
    tip.hidden = false;
    const x = Math.min(r.width - tip.offsetWidth - 6, Math.max(6, ev.clientX - r.left + 14));
    const y = Math.max(6, ev.clientY - r.top - tip.offsetHeight - 10);
    tip.style.transform = `translate(${x}px, ${y}px)`;
  }
  const onDown = (ev) => { down = { x: ev.clientX, y: ev.clientY }; };
  const onUp = (ev) => {
    if (!down) return;
    const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
    down = null;
    if (moved > 6) return;
    const id = pick(ev);
    if (id) bus.emit('select', { id: bus.state.selected === id ? null : id, source: SOURCE });
  };
  const onMove = (ev) => {
    if (ev.pointerType !== 'mouse' || ev.buttons) return;
    const id = pick(ev);
    canvas.style.cursor = id ? 'pointer' : '';
    showTip(id, ev);
    if (id !== hoverId) { hoverId = id; bus.emit('hover', { id, source: SOURCE }); }
  };
  const onLeave = () => {
    tip.hidden = true;
    if (hoverId) { hoverId = null; bus.emit('hover', { id: null, source: SOURCE }); }
  };
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);

  // ---------------------------------------------------------------- bus
  // Frame the camera on the selected nerve: keep the viewing direction, centre on its paths and fit them.
  function frameOn(id, instant) {
    const o = id && objs.get(id);
    if (!o) return;
    const box = new THREE.Box3();
    o.group.traverse((m) => { if (m.isMesh && m.userData.id === id && m.geometry) { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld)); } });
    if (box.isEmpty()) return;
    const c = box.getCenter(new THREE.Vector3());
    const radius = Math.max(0.035, box.getBoundingSphere(new THREE.Sphere()).radius);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitH = radius / Math.sin(fov / 2);
    const fitW = fitH / Math.max(0.3, Math.min(1, camera.aspect));
    const dist = Math.min(controls.maxDistance * 0.95, Math.max(0.12, Math.max(fitH, fitW) * 1.1));
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-10) dir.set(0, 0, 1);
    dir.normalize();
    flyTo(c.clone().addScaledVector(dir, dist), c, instant);
  }

  const offs = [
    bus.on('select', (p) => {
      refresh();
      // A tap in the 3D view already shows the nerve; frame it when it was chosen elsewhere.
      if (p.id && p.source !== SOURCE) frameOn(p.id, p.instant);
    }),
    bus.on('hover', refresh),
    bus.on('block', (p) => {
      refresh();
      const b = p.id && data.blocks?.[p.id];
      if (b && validView(b.view)) flyToView(b.view, p.instant);
    }),
  ];

  // ---------------------------------------------------------------- context model
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO_PATH);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  const catMats = {};
  const matFor = (cat) => {
    if (!catMats[cat]) {
      const st = CAT_STYLE[cat] || CAT_STYLE.bone;
      catMats[cat] = track(new THREE.MeshStandardMaterial({ metalness: 0.02, ...st }));
    }
    return catMats[cat];
  };
  const extra = (o, key) => { for (let n = o; n; n = n.parent) if (n.userData && n.userData[key] != null) return n.userData[key]; return null; };
  let modelRoot = null;
  const glbPath = data.model?.glb;
  if (glbPath) {
    loader.load(new URL(glbPath, ctx.baseUrl || document.baseURI).href, (gltf) => {
      if (destroyed) return;
      const want = `exp_${data.id}`;
      const sc = (gltf.scenes || []).find((x) => x.name === want) || gltf.scene || gltf.scenes?.[0];
      if (!sc) { status.textContent = 'The 3D context model is empty.'; return; }
      const cats = data.model?.cats || {};
      const skip = [];
      sc.traverse((o) => {
        if (!o.isMesh) return;
        const named = cats[o.name] ?? cats[String(o.name).replace(/_/g, ' ')];
        if (named === 'skip') { skip.push(o); return; }
        const cat = extra(o, 'cat') || named || 'bone';
        const hidden = Number(extra(o, 'hidden')) === 1;
        if (o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        o.material = matFor(cat);
        if (cat === 'muscle') o.renderOrder = 2;
        const layer = hidden ? 'covering' : (CAT_LAYER[cat] || 'other');
        layerMeshes[layer].push(o);
        if (o.geometry) disposables.push(o.geometry);
      });
      skip.forEach((o) => { o.geometry?.dispose(); o.removeFromParent(); });
      modelRoot = sc;
      if (mirror) { modelRoot = new THREE.Group(); modelRoot.scale.x = -1; modelRoot.add(sc); }
      scene.add(modelRoot);
      bbox.setFromObject(modelRoot);
      bbox.union(new THREE.Box3().setFromObject(nerveRoot));
      // Hide layer toggles this model has nothing for (the brachial model has no muscles).
      for (const k of ['muscles', 'covering', 'vessels']) if (!layerMeshes[k].length && layerBtns[k]) layerBtns[k].hidden = true;
      // Dispose the other scenes the file carries, without adding them.
      (gltf.scenes || []).forEach((x) => {
        if (x === sc) return;
        x.traverse((o) => { if (o.isMesh && o.geometry && !disposables.includes(o.geometry)) o.geometry.dispose(); });
      });
      status.hidden = true;
      applyLayers();
      if (!viewKeys.length && !userMoved) fitToBox(true);
      requestRender();
    }, undefined, (err) => {
      if (destroyed) return;
      console.warn('[viewer3d] context model failed to load', err);
      status.textContent = 'The surrounding anatomy could not be loaded. The nerves are still shown.';
    });
  } else {
    status.hidden = true;
  }
  if (!objs.size && !data.model?.nerveGlb) {
    status.hidden = false;
    status.textContent = glbPath ? 'Loading 3D model… (nerve paths for this plexus are not available yet)' : 'Nerve paths for this plexus are not available yet.';
  }

  // ---------------------------------------------------------------- nerves as named meshes (brachial)
  if (data.model?.nerveGlb) {
    const map = data.model.meshes || {};
    loader.load(new URL(data.model.nerveGlb, ctx.baseUrl || document.baseURI).href, (gltf) => {
      if (destroyed) return;
      const sc = gltf.scene || gltf.scenes?.[0];
      if (!sc) return;
      sc.updateMatrixWorld(true);
      const relatedMat = track(new THREE.MeshStandardMaterial({ color: RELATED.clone(), roughness: 0.5, metalness: 0.02 }));
      const meshes = [];
      sc.traverse((m) => { if (m.isMesh) meshes.push(m); });
      for (const m of meshes) {
        const key = String(m.name).replace(/_/g, ' ');
        const id = Object.prototype.hasOwnProperty.call(map, key) ? map[key] : map[m.name];
        if (m.geometry && !m.geometry.attributes.normal) m.geometry.computeVertexNormals();
        if (m.geometry) disposables.push(m.geometry);
        m.geometry?.applyMatrix4(m.matrixWorld);
        m.position.set(0, 0, 0); m.quaternion.identity(); m.scale.set(1, 1, 1);
        m.removeFromParent();
        if (!id || !elements[id]) { m.material = relatedMat; nerveRoot.add(m); continue; }
        let o = objs.get(id);
        if (!o) {
          const base = elements[id].kind === 'related' ? RELATED : NERVE;
          const mat = track(new THREE.MeshStandardMaterial({ color: base.clone(), roughness: 0.42, metalness: 0.05, emissive: 0x000000 }));
          const group = new THREE.Group();
          group.userData.id = id;
          nerveRoot.add(group);
          o = { group, mat, base, mid: null, first: null, curves: [], meshes: [], r: 0.002, halo: null };
          objs.set(id, o);
        }
        m.material = o.mat;
        m.userData.id = id;
        m.geometry.computeBoundingBox();
        const sz = m.geometry.boundingBox.getSize(new THREE.Vector3());
        m.userData.r = Math.max(0.0008, Math.min(sz.x, sz.y, sz.z) / 2);
        o.group.add(m);
        o.meshes.push(m);
        pickables.push(m);
      }
      nerveRoot.updateMatrixWorld(true);
      for (const [id, o] of objs) {
        if (!o.meshes) continue;
        // Mid point: centre of the largest piece. Roots: their medial (spinal) end carries the level label.
        let best = null; let bestLen = -1;
        for (const m of o.meshes) { const l = m.geometry.boundingBox.getSize(new THREE.Vector3()).length(); if (l > bestLen) { bestLen = l; best = m; } }
        o.mid = best.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(nerveRoot.matrixWorld);
        if (elements[id].kind === 'root') {
          const pos = best.geometry.attributes.position;
          let minI = 0;
          for (let i = 1; i < pos.count; i++) if (pos.getX(i) < pos.getX(minI)) minI = i;
          o.first = new THREE.Vector3().fromBufferAttribute(pos, minI).applyMatrix4(nerveRoot.matrixWorld);
          const lab = h('div', 'px-v3-labwrap');
          lab.append(h('span', 'px-v3-label is-root', elements[id].short || elements[id].name || id));
          const lo = new CSS2DObject(lab);
          lo.position.copy(o.first);
          lo.center.set(mirror ? -0.1 : 1.1, 0.5);
          scene.add(lo);
          labelObjs.push(lo);
          o.label = lo;
        }
      }
      if (bbox.isEmpty()) bbox.setFromObject(nerveRoot); else bbox.union(new THREE.Box3().setFromObject(nerveRoot));
      refresh();
      if (bus.state.selected && !userMoved) frameOn(bus.state.selected, true);
    }, undefined, (err) => {
      if (destroyed) return;
      console.warn('[viewer3d] nerve model failed to load', err);
      status.hidden = false;
      status.textContent = 'The nerves could not be loaded. The diagram still works.';
    });
  }

  let userMoved = false;
  controls.addEventListener('start', () => { userMoved = true; });

  homeView(true);
  refresh();

  return {
    setView,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(nudgeTimer);
      ro.disconnect();
      offs.forEach((f) => f());
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerdown', onDocDown);
      controls.dispose();
      for (const lo of [...labelObjs, selLabel]) { lo.element.remove(); lo.removeFromParent(); }
      if (modelRoot) modelRoot.removeFromParent();
      disposables.forEach((d) => { try { d.dispose(); } catch { /* ignore */ } });
      draco.dispose();
      try { renderer.setAnimationLoop?.(null); } catch { /* ignore */ }
      renderer.dispose();
      renderer.forceContextLoss?.();
      root.remove();
    },
  };
}

export default mountViewer;
