/* ADVL model viewer, pulled in from the "ADVL Model Viewer" artifact.
   Opens over the Artifacts room: a list of Ariana's Rhino models (GLB) and an orbitable shaded viewport.
   three.js loads only when the viewer is first opened. */
(function () {
  const MODELS = [   // grouped by project number; kept in step with the approved Artifacts room pieces (10/26 20:56)
    { id: 'headset', name: 'Star Headset', proj: '01 Learning Bodies', file: 'models/star-headset.glb.txt', mb: 4.2 },
    { id: 'starhead', name: 'Star Adapter', proj: '01 Learning Bodies', file: 'models/starhead.glb.txt', mb: 0.4 },
    { id: 'hand', name: 'Hand Implants', proj: '01 Learning Bodies', file: 'models/hand-implants.glb.txt', mb: 0.8 },
    { id: 'fingeranchors', name: 'Finger Anchors', proj: '01 Learning Bodies', file: 'models/finger-anchors.glb.txt', mb: 1.8 },
    { id: 'octopus', name: 'Octopus Dreams', proj: '01 Learning Bodies', file: 'models/octopus-dreams.glb.txt', mb: 2.6 },
    { id: 'biochip', name: 'Biochip', proj: '01 Learning Bodies', file: 'models/biochip.glb.txt', mb: 3.6 },
    { id: 'melonsheet', name: 'Leather Sample Topography', proj: '02 Watermelon Leather', file: 'models/melon-topo-sheet.glb.txt', mb: 1.6 },
    { id: 'melonfruit', name: 'Fruit and Agar Topography', proj: '02 Watermelon Leather', file: 'models/melon-topo-fruit.glb.txt', mb: 0.9 },
    { id: 'attuner', name: 'C-FAI', proj: '03 Speculative Design', file: 'models/attuner.glb.txt', mb: 1.9 },
    { id: 'bunny', name: 'Bunny Head', proj: '04 Non-verbal Gestural Communication', file: 'models/bunny.glb.txt', mb: 1.9 },
    { id: 'mirror', name: 'Mirror Test', proj: '05 Form and Light', file: 'models/mirror-test.glb.txt', mb: 2.5 },
    { id: 'grasstree', name: 'The Grass Tree', proj: '06 The Grass Tree', file: 'models/grass-tree.glb.txt', mb: 0.2 },
    { id: 'digifrend', name: 'Digifrend', proj: '07 digifrends', file: 'models/digifrend.glb.txt', mb: 4.5 },
    { id: 'brain', name: 'Dish Brain Texture', proj: '08 Chaos / a soap dish', file: 'models/dish-brain.glb.txt', mb: 3.5 },
    { id: 'stool', name: 'Tree Stool', proj: '09 The Tree Stool', file: 'models/tree-stool.glb.txt', mb: 0.6 },
    { id: 'lovestool', name: 'Lovestool', proj: '09 The Tree Stool', file: 'models/lovestool.glb.txt', mb: 0.9 },
    { id: 'doubleseat', name: 'Double Seat Stool', proj: '09 The Tree Stool', file: 'models/double-seat.glb.txt', mb: 0.8 },
    { id: 'dress', name: 'The Petrol Dress', proj: '10 The Petrol Dress', file: 'models/petrol-dress.glb.txt', mb: 0.8 },
    { id: 'cathouse', name: 'Stacking Cat House', proj: '11 Lurvig Cat House', file: 'models/cat-house.glb.txt', mb: 1.0 },
    { id: 'circlecat', name: 'Circle Cat House', proj: '11 Lurvig Cat House', file: 'models/circle-cat-house.glb.txt', mb: 1.9 },
    { id: 'sculptprobe', name: 'Sculpt Probe 4', proj: '14 Personal Projects', file: 'models/sculptprobe4.glb.txt', mb: 2.3 },
    { id: 'lion', name: 'Lion Stone', proj: '14 Personal Projects', file: 'models/lion-stone.glb.txt', mb: 3.5 },
    { id: 'nomadn2', name: 'Nomad Study (N2)', proj: '16 Early Projects', file: 'models/nomad-n2.glb.txt', mb: 3.5 },
    { id: 'stair', name: 'Spiral Staircase', proj: '16 Early Projects', file: 'models/spiral-stair.glb.txt', mb: 2.0 },
  ];
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';
  const load = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  let three = null;
  const getThree = () => three || (three = (window.THREE && THREE.OrbitControls && THREE.GLTFLoader) ? Promise.resolve() : load(CDN + 'build/three.min.js').then(() => Promise.all([load(CDN + 'examples/js/controls/OrbitControls.js'), load(CDN + 'examples/js/loaders/GLTFLoader.js')])).catch(e => { three = null; throw e; }));

  let el, stage, status, list, title, renderer, scene, camera, controls, material, root = null, current = null, need = true, mode = 'shaded', raf = 0, open = false;
  const cache = {};
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function build() {
    el = document.createElement('section');
    el.className = 'mv'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Model viewer');
    let groups = '', last = '';
    MODELS.forEach(m => {
      if (m.proj !== last) { groups += `${last ? '</div>' : ''}<p class="mv-proj">${esc(m.proj)}</p><div class="mv-grp">`; last = m.proj; }
      groups += `<button type="button" class="mv-item" data-id="${m.id}" aria-pressed="false">${esc(m.name)}</button>`;
    });
    groups += '</div>';
    el.innerHTML = `<div class="mv-side"><p class="mv-k">Models</p><div class="mv-list">${groups}</div></div>
      <div class="mv-stage"><div class="mv-bar"><div class="mv-seg" role="group" aria-label="Shading">
        <button type="button" data-m="shaded" aria-pressed="true">Shaded</button><button type="button" data-m="wire" aria-pressed="false">Wireframe</button><button type="button" data-m="xray" aria-pressed="false">X-ray</button></div>
        <button type="button" class="mv-tool" data-t="spin" aria-pressed="true">Spin</button><button type="button" class="mv-tool" data-t="reset">Reset view</button>
        <button type="button" class="mv-close" aria-label="Close viewer">Close</button></div>
        <p class="mv-title"></p><div class="mv-status"><span>Loading viewer</span></div></div>`;
    document.body.appendChild(el);
    stage = el.querySelector('.mv-stage'); status = el.querySelector('.mv-status'); list = el.querySelector('.mv-list'); title = el.querySelector('.mv-title');
    list.addEventListener('click', e => { const b = e.target.closest('.mv-item'); if (b) select(b.dataset.id); });
    el.querySelector('.mv-seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { mode = b.dataset.m; applyMode(); } });
    el.querySelector('[data-t=spin]').addEventListener('click', e => { if (!controls) return; controls.autoRotate = !controls.autoRotate; e.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate)); });
    el.querySelector('[data-t=reset]').addEventListener('click', fit);
    el.querySelector('.mv-close').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (open && e.key === 'Escape') close(); });
  }
  function setStatus(msg) { status.hidden = !msg; if (msg) status.firstElementChild.textContent = msg; }

  function init() {
    const T = window.THREE;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { renderer = null; }
    if (!renderer) { setStatus('3D view is not available in this browser.'); return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); renderer.outputEncoding = T.sRGBEncoding;
    stage.insertBefore(renderer.domElement, stage.firstChild);
    scene = new T.Scene(); camera = new T.PerspectiveCamera(35, 1, .02, 200);
    controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .08; controls.minDistance = .4; controls.maxDistance = 30; controls.autoRotate = true; controls.autoRotateSpeed = 1.2;
    controls.addEventListener('change', () => { need = true; });
    material = new T.MeshStandardMaterial({ color: new T.Color('#5D5296').convertSRGBToLinear(), roughness: .45, metalness: .1, side: T.DoubleSide });
    try {   // small studio for soft reflections
      const pm = new T.PMREMGenerator(renderer), es = new T.Scene();
      es.add(new T.Mesh(new T.BoxGeometry(12, 12, 12), new T.MeshBasicMaterial({ color: 0x8a8f99, side: T.BackSide })));
      [[6, 6, 0, 5.6, 0, 3], [3.5, 4.5, -5.6, 2, 2.5, 2.4], [2.5, 5, 5.6, 1, -3, 1.8]].forEach(([w, h, x, y, z, v]) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(v, v, v), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); es.add(m); });
      material.envMap = pm.fromScene(es, .03).texture; pm.dispose();
    } catch (e) {}
    scene.add(new T.HemisphereLight(0xffffff, 0x8b919b, .6));
    const k = new T.DirectionalLight(0xffffff, .7); k.position.set(3, 5, 4); scene.add(k);
    const f = new T.DirectionalLight(0xCFF002, .18); f.position.set(-4, 2, -3); scene.add(f);
    const grid = new T.GridHelper(4, 16, 0x9A90B8, 0xD9D0C2); grid.material.transparent = true; grid.material.opacity = .5; scene.add(grid);
    new ResizeObserver(() => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); need = true; }).observe(stage);
    applyMode();
    return true;
  }
  function loop() { raf = requestAnimationFrame(loop); const moved = controls.update(); if (moved || need) { renderer.render(scene, camera); need = false; } }
  function applyMode() {
    if (material) { material.wireframe = mode === 'wire'; material.transparent = mode === 'xray'; material.opacity = mode === 'xray' ? .3 : 1; material.depthWrite = mode !== 'xray'; material.needsUpdate = true; need = true; }
    el.querySelectorAll('.mv-seg button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
  }
  function fit() {
    if (!root) return; const T = window.THREE;
    const size = new T.Box3().setFromObject(root).getSize(new T.Vector3()), reach = Math.max(size.x, size.y, size.z, 1.2);
    controls.target.set(0, size.y / 2, 0);
    camera.position.copy(new T.Vector3(.75, .45, 1).normalize().multiplyScalar(reach * 2.1)).add(controls.target);
    camera.updateProjectionMatrix(); controls.update(); need = true;
  }
  function place(g) {
    const T = window.THREE, holder = new T.Group(); holder.add(g);
    g.traverse(o => { if (o.isMesh) { if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); o.material = material; } });
    const size = new T.Box3().setFromObject(holder).getSize(new T.Vector3());
    holder.scale.setScalar(2 / Math.max(size.x, size.y, size.z));
    const b = new T.Box3().setFromObject(holder), c = b.getCenter(new T.Vector3());
    holder.position.set(-c.x, -b.min.y, -c.z);
    return holder;
  }
  function select(id) {
    const m = MODELS.find(x => x.id === id) || MODELS[0]; current = m;
    list.querySelectorAll('.mv-item').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === m.id)));
    const btn = list.querySelector(`[data-id="${m.id}"]`); btn && btn.scrollIntoView({ block: 'nearest' });
    title.textContent = `${m.proj} · ${m.name}`;
    if (!renderer) return;
    if (root) { scene.remove(root); root = null; need = true; }
    if (cache[m.id]) { root = cache[m.id]; scene.add(root); setStatus(''); fit(); return; }
    setStatus(`Loading ${m.name}`);
    const fail = () => { if (current === m) setStatus('This model could not be loaded.'); };
    fetch(m.file).then(r => { if (!r.ok) throw 0; return r.text(); }).then(b64 => {
      const bin = atob(b64.trim()), bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      new window.THREE.GLTFLoader().parse(bytes.buffer, '', g => { const h = place(g.scene); cache[m.id] = h; if (current !== m) return; root = h; scene.add(root); setStatus(''); fit(); }, fail);
    }).catch(fail);
  }
  function show(id) {
    if (!el) build();
    el.hidden = false; open = true; document.body.classList.add('mv-open');
    setStatus('Loading viewer');
    getThree().then(() => {
      if (!renderer && !init()) return;
      cancelAnimationFrame(raf); loop();
      select(id || (current && current.id) || MODELS[0].id);
    }).catch(() => setStatus('The 3D viewer could not load. Check the connection and try again.'));
  }
  function close() { if (!el) return; el.hidden = true; open = false; document.body.classList.remove('mv-open'); cancelAnimationFrame(raf); }

  window.ADVL_THREE = getThree;  // shared with the desktop home stage
  window.ADVL_VIEWER = { show, close, has: id => MODELS.some(m => m.id === id), get open() { return open; } };
})();
