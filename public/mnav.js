/* Phone navigation (≤720px), approved 11/4 (mockup N5 + D1):
   - a faint goto('<level>') line under the name at the top
   - a thumb circle bottom right that slowly cycles the curated backgrounds
   Either one opens the six levels, fanned up above the circle as chartreuse code. */
(function () {
  const LV = [['home', 'Home'], ['projects', 'Projects'], ['works', 'Works'], ['background', 'Background'], ['about', 'About'], ['artifacts', 'Artifacts'], ['lot', 'Parking Lot']];
  const PICS = ['04', '06', '07', '08', '09', '10', '12', '13', '14', '16', '24', '25', '28', '29', '30', '32'];
  const HOLD = 20000;  // each image stays ~20 s; the crossfade itself is 6 s (CSS)
  const mq = matchMedia('(max-width:720px)');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const gl = document.createElement('button');
  gl.type = 'button'; gl.className = 'mgl'; gl.setAttribute('aria-expanded', 'false'); gl.setAttribute('aria-controls', 'mfan');
  const wrap = document.createElement('div'); wrap.className = 'mdial';
  wrap.innerHTML = `<nav class="mfan" id="mfan" aria-label="Levels">${LV.map(([k, n], i) => `<a href="#${k}" data-k="${k}" style="--i:${i}">L${i}: '${n.toLowerCase()}',<span class="c"> // here</span></a>`).join('')}</nav>
    <button type="button" class="hub" aria-expanded="false" aria-controls="mfan" aria-label="Open levels"><span class="pics">${PICS.map((p, k) => `<img alt="" decoding="async" ${k < 2 ? `src="img/lotbg/t/${p}.webp"` : `data-src="img/lotbg/t/${p}.webp"`} class="${k ? '' : 'on'}">`).join('')}</span><b>L0</b></button>`;
  /* the goto line opens its own list, dropping down under the name */
  const top = document.createElement('nav'); top.className = 'mtop'; top.id = 'mtop'; top.setAttribute('aria-label', 'Levels');
  top.innerHTML = `<span class="o">const levels = {</span>${LV.map(([k, n], i) => `<a href="#${k}" data-k="${k}" style="--i:${i}">&nbsp;&nbsp;L${i}: '${n.toLowerCase()}',<span class="c"> // here</span></a>`).join('')}<span class="o">}</span>`;
  gl.setAttribute('aria-controls', 'mtop');
  document.body.append(gl, top, wrap);
  const hub = wrap.querySelector('.hub'), lab = hub.querySelector('b'), fan = wrap.querySelector('.mfan');
  const pics = [...wrap.querySelectorAll('.pics img')];

  const tabOf = () => { const t = document.body.dataset.tab || 'home'; return LV.some(([k]) => k === t) ? t : 'home'; };
  function paint() {
    const t = tabOf(), i = LV.findIndex(([k]) => k === t);
    gl.textContent = `goto('${LV[i][1].toLowerCase()}')`;
    gl.setAttribute('aria-label', `Levels, now on ${LV[i][1]}`);
    lab.textContent = 'L' + i;
    [fan, top].forEach(l => l.querySelectorAll('a').forEach(a => a.toggleAttribute('aria-current', a.dataset.k === t)));
  }
  let where = '';  // '', 'dial' or 'top'
  function setOpen(w) {
    where = w; wrap.classList.toggle('open', w === 'dial'); top.classList.toggle('open', w === 'top');
    document.body.classList.toggle('mnav-open', !!w);
    gl.setAttribute('aria-expanded', w === 'top'); hub.setAttribute('aria-expanded', w === 'dial');
  }
  gl.onclick = e => { e.stopPropagation(); setOpen(where === 'top' ? '' : 'top'); };
  hub.onclick = e => { e.stopPropagation(); setOpen(where === 'dial' ? '' : 'dial'); };
  [fan, top].forEach(l => l.addEventListener('click', () => setOpen('')));
  document.addEventListener('click', e => { if (where && !wrap.contains(e.target) && !top.contains(e.target) && e.target !== gl) setOpen(''); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && where) { const back = where === 'top' ? gl : hub; setOpen(''); back.focus(); } });
  addEventListener('hashchange', () => setOpen(''));
  new MutationObserver(paint).observe(document.body, { attributes: true, attributeFilter: ['data-tab'] });
  paint();

  /* slow crossfade through the curated backgrounds, only while the circle is on screen */
  let k = 0, t = 0;
  function next() {
    const n = (k + 1) % pics.length, nn = (n + 1) % pics.length;
    if (pics[nn].dataset.src) { pics[nn].src = pics[nn].dataset.src; delete pics[nn].dataset.src; }  // fetch one ahead
    pics[k].classList.remove('on'); pics[n].classList.add('on'); k = n;
  }
  function run() { clearInterval(t); if (mq.matches && !still && !document.hidden) t = setInterval(next, HOLD); }
  mq.addEventListener('change', run); document.addEventListener('visibilitychange', run); run();
})();
