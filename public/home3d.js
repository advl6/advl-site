/* Desktop home: a minimal 3D stage in the right-hand open space (approved mockup B).
   Wireframe in chartreuse, slow turn, drag to orbit, no zoom or pan, prev/next arrows and a caption.
   Shares three.js with the Artifacts model viewer (window.ADVL_THREE). */
(function () {
  const MODELS = [
    { name: 'Tree Stool', proj: '09', file: 'models/tree-stool.glb.txt' },
    { name: 'C-FAI', proj: '03', file: 'models/attuner.glb.txt' },
    { name: 'Star Headset', proj: '01', file: 'models/star-headset.glb.txt' },
    { name: 'Lovestool', proj: '09', file: 'models/lovestool.glb.txt' },
    { name: 'Dish Brain Texture', proj: '08', file: 'models/dish-brain.glb.txt' },
    { name: 'Finger Anchors', proj: '01', file: 'models/finger-anchors.glb.txt' },
    { name: 'Digifrend', proj: '07', file: 'models/digifrend.glb.txt' },
    { name: 'Double Seat Stool', proj: '09', file: 'models/double-seat.glb.txt' },
    { name: 'Lion Stone', proj: '14', file: 'models/lion-stone.glb.txt' },
    { name: 'Biochip', proj: '01', file: 'models/biochip.glb.txt' },
    { name: 'Circle Cat House', proj: '11', file: 'models/circle-cat-house.glb.txt' },
  ];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cache = {};
  let E = null, idx = 0, raf = 0, cur = null;

  function engine() {
    const T = window.THREE, r = new T.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputEncoding = T.sRGBEncoding;
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .02, 200), ctl = new T.OrbitControls(cam, r.domElement);
    ctl.enableDamping = true; ctl.dampingFactor = .08; ctl.enablePan = false; ctl.enableZoom = false; ctl.autoRotate = !RM; ctl.autoRotateSpeed = 1.1;
    const mat = new T.MeshBasicMaterial({ color: 0xCFF002, wireframe: true, transparent: true, opacity: .55 });
    return { r, scene, cam, ctl, mat, root: null, host: null };
  }
  function size() { if (!E || !E.host) return; const w = E.host.clientWidth, h = E.host.clientHeight; if (!w || !h) return; E.r.setSize(w, h, false); E.cam.aspect = w / h; E.cam.updateProjectionMatrix(); }
  function fit() {
    const T = window.THREE, s = new T.Box3().setFromObject(E.root).getSize(new T.Vector3()), reach = Math.max(s.x, s.y, s.z, 1.2);
    E.ctl.target.set(0, s.y / 2, 0);
    E.cam.position.copy(new T.Vector3(.8, .4, 1).normalize().multiplyScalar(reach * 2.25)).add(E.ctl.target); E.ctl.update();
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    if (!E.host || !E.host.isConnected) { cancelAnimationFrame(raf); raf = 0; return; }
    if (document.body.classList.contains('cine') || !E.host.offsetWidth) return;  // hidden: don't draw
    E.ctl.update(); E.r.render(E.scene, E.cam);
  }
  function show(m) {
    const T = window.THREE, host = E.host, st = host.querySelector('.h3-st');
    cur = m; host.querySelector('.h3-cap').innerHTML = `<b>${m.proj}</b>${m.name}`;
    const put = g => { if (cur !== m) return; if (E.root) E.scene.remove(E.root); E.root = g; g.traverse(o => { if (o.isMesh) o.material = E.mat; }); E.scene.add(g); fit(); st.textContent = ''; };
    if (cache[m.file]) return put(cache[m.file]);
    st.textContent = 'loading ' + m.name.toLowerCase();
    const fail = () => { if (cur === m) st.textContent = 'model could not load'; };
    fetch(m.file).then(r => { if (!r.ok) throw 0; return r.text(); }).then(b64 => {
      const bin = atob(b64.trim()), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      new T.GLTFLoader().parse(u.buffer, '', g => {
        const h = new T.Group(); h.add(g.scene); g.scene.traverse(o => { if (o.isMesh && !o.geometry.attributes.normal) o.geometry.computeVertexNormals(); });
        const s = new T.Box3().setFromObject(h).getSize(new T.Vector3()); h.scale.setScalar(2 / Math.max(s.x, s.y, s.z));
        const bb = new T.Box3().setFromObject(h), c = bb.getCenter(new T.Vector3()); h.position.set(-c.x, -bb.min.y, -c.z);
        cache[m.file] = h; put(h);
      }, fail);
    }).catch(fail);
  }
  function mount(host) {
    host.innerHTML = `<div class="h3-st">loading viewer</div><p class="h3-cap"></p>
      <div class="h3-nx"><button type="button" aria-label="Previous model">‹</button><button type="button" aria-label="Next model">›</button></div>`;
    const [p, n] = host.querySelectorAll('.h3-nx button');
    p.onclick = () => { idx = (idx + MODELS.length - 1) % MODELS.length; E && show(MODELS[idx]); };
    n.onclick = () => { idx = (idx + 1) % MODELS.length; E && show(MODELS[idx]); };
    host.querySelector('.h3-cap').innerHTML = `<b>${MODELS[idx].proj}</b>${MODELS[idx].name}`;
    if (!window.ADVL_THREE) { host.querySelector('.h3-st').textContent = '3D view is not available'; return; }
    window.ADVL_THREE().then(() => {
      if (!host.isConnected) return;
      if (!E) { try { E = engine(); } catch (e) { host.querySelector('.h3-st').textContent = '3D view needs WebGL'; return; } new ResizeObserver(size).observe(document.body); }
      E.host = host; host.insertBefore(E.r.domElement, host.firstChild); size();
      show(MODELS[idx]); if (!raf) loop();
    }).catch(() => { host.querySelector('.h3-st').textContent = '3D view could not load'; });
  }
  window.ADVL_HOME3D = { mount };
})();
