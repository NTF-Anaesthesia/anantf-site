// 3D anatomy panel: Z-Anatomy context model (GLB) plus nerve tubes built from
// the plexus nerve file, linked to the diagram through the bus.
//
//   mountViewer(containerEl, ctx) -> { destroy() }
//
// Coordinate frame: data files use Z-Anatomy world coordinates (metres, Z up,
// -Y anterior, +X patient's left). The GLBs were exported Y-up, so a world point
// [x, y, z] is new THREE.Vector3(x, z, -y) here.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { STATUS_COLOURS } from './diagram.js';

const DRACO_PATH = new URL('../../brachial-plexus/vendor/three/examples/jsm/libs/draco/gltf/', import.meta.url).href;
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
const STATUS = Object.fromEntries(Object.entries(STATUS_COLOURS).map(([k, v]) => [k, new THREE.Color(v)]));

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

  // ---------------------------------------------------------------- DOM
  const root = h('div', 'px-v3');
  const bar = h('div', 'px-v3-bar');
  const viewGroup = h('div', 'px-v3-group');
  viewGroup.setAttribute('role', 'group');
  viewGroup.setAttribute('aria-label', 'Camera views');
  const layerGroup = h('div', 'px-v3-group');
  layerGroup.setAttribute('role', 'group');
  layerGroup.setAttribute('aria-label', 'Layers');
  bar.append(viewGroup, layerGroup);
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
  canvas.setAttribute('aria-label', `3D model of the right ${String(data.name || 'plexus').toLowerCase()} with surrounding bones, muscles and vessels. Use the arrow keys to pan; use the diagram or the list below to select nerves.`);

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
      group.add(proxy);
      pickables.push(proxy);
      if (!first) first = pts[0].clone();
      if (len > best) { best = len; mid = curve.getPointAt(0.5); }
    }
    if (!group.children.length) continue;
    nerveRoot.add(group);
    const o = { group, mat, base, mid, first };
    if (e.kind === 'root' && first) {
      const lab = h('div', 'px-v3-label is-root', e.short || e.name || id);
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
  const marker = new THREE.Mesh(track(new THREE.SphereGeometry(0.0045, 20, 14)), track(new THREE.MeshStandardMaterial({ color: 0xdb2777, emissive: 0x6b0f3a, roughness: 0.35 })));
  marker.visible = false;
  scene.add(marker);

  // ---------------------------------------------------------------- layers
  const layerState = Object.fromEntries(LAYERS.map((l) => [l.key, l.on]));
  const layerMeshes = { bones: [], muscles: [], covering: [], vessels: [], other: [] };
  const layerBtns = {};
  for (const l of LAYERS) {
    const b = h('button', 'px-v3-btn px-v3-toggle app-chip', l.label);
    b.type = 'button';
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
  function flyToView(v, instant) { flyTo(w2t(v.position), w2t(v.target), instant); }
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
    const moved = controls.update();
    if (width > 0 && height > 0) {
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    }
    if (a || moved) requestRender();
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
        if (st) colour = STATUS[st];
        else { colour = DIMMED; opacity = 0.3; }
      }
      if (keep && !keep.has(id)) opacity = Math.min(opacity, 0.2);
      o.mat.color.copy(colour);
      const transparent = opacity < 1;
      if (o.mat.transparent !== transparent) { o.mat.transparent = transparent; o.mat.needsUpdate = true; }
      o.mat.opacity = opacity;
      o.mat.depthWrite = !transparent;
      const glow = id === selected ? 0.45 : id === hovered ? 0.3 : 0;
      o.mat.emissive.copy(colour).multiplyScalar(glow);
    }
    // Block marker.
    const b = block && data.blocks?.[block];
    if (b && isPt(b.marker)) { marker.position.copy(w2t(b.marker)); marker.visible = true; } else marker.visible = false;
    updateLabels();
    requestRender();
  }
  function updateLabels() {
    const on = !!layerState.labels;
    const sel = bus.state.selected;
    const keep = sel ? ctx.lineage(sel) : null;
    for (const lo of labelObjs) lo.visible = on;
    for (const [id, o] of objs) if (o.label) o.label.element.classList.toggle('is-dim', !!keep && !keep.has(id));
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
    const hits = raycaster.intersectObjects(pickables, false);
    if (!hits.length) return null;
    // Prefer the thinnest/most specific nerve among near-equal hits: take the first,
    // but if the selected lineage is active, prefer an element inside it.
    return hits[0].object.userData.id || null;
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
  const offs = [
    bus.on('select', refresh),
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
    loader.load(new URL(glbPath, document.baseURI).href, (gltf) => {
      if (destroyed) return;
      const want = `exp_${data.id}`;
      const sc = (gltf.scenes || []).find((x) => x.name === want) || gltf.scene || gltf.scenes?.[0];
      if (!sc) { status.textContent = 'The 3D context model is empty.'; return; }
      sc.traverse((o) => {
        if (!o.isMesh) return;
        const cat = extra(o, 'cat') || 'bone';
        const hidden = Number(extra(o, 'hidden')) === 1;
        if (o.geometry && !o.geometry.attributes.normal) o.geometry.computeVertexNormals();
        o.material = matFor(cat);
        if (cat === 'muscle') o.renderOrder = 2;
        const layer = hidden ? 'covering' : (CAT_LAYER[cat] || 'other');
        layerMeshes[layer].push(o);
        if (o.geometry) disposables.push(o.geometry);
      });
      modelRoot = sc;
      scene.add(sc);
      bbox.setFromObject(sc);
      bbox.union(new THREE.Box3().setFromObject(nerveRoot));
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
  if (!objs.size) {
    status.hidden = false;
    status.textContent = glbPath ? 'Loading 3D model… (nerve paths for this plexus are not available yet)' : 'Nerve paths for this plexus are not available yet.';
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
      ro.disconnect();
      offs.forEach((f) => f());
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      controls.dispose();
      for (const lo of [...labelObjs, selLabel]) { lo.element.remove(); lo.removeFromParent(); }
      if (modelRoot) modelRoot.removeFromParent();
      disposables.forEach((d) => { try { d.dispose(); } catch { /* ignore */ } });
      draco.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
      root.remove();
    },
  };
}

export default mountViewer;
