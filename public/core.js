/* ADVL core: routing, the arrival performance (5 s of background, then frame, then everything else),
   frosted backgrounds and video backgrounds, content blocks, charts in the blue schema, cinematic mode,
   mode dials, the Artifacts room and the Parking Lot chat. Each concept passes its own layout functions. */
(function () {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
const A = {};
let D = null, ART = null, CFG = null, route = null, timers = [], cine = false;

/* ---------- arrival performance ---------- */
const HOLD = 5000, FRAME = 1700;
/* returning visitors (seen on an earlier visit) skip the 5 s hold everywhere except Home */
let RETURNING = false; try { RETURNING = localStorage.getItem('advl-visited') === '1'; localStorage.setItem('advl-visited', '1'); } catch (e) {}
/* the first arrival on the site plays in full; every page change after that is the same sequence
   (frosted background, frame, then the rest) compressed into one second */
const STEP = 1000;
let arrived = false, quickT = 0;
(() => { const st = document.createElement('style');
  st.textContent = 'body.quick *,body.quick *::before,body.quick *::after{transition-duration:.3s!important;transition-delay:0s!important}' +
    'body.quick .door-scene.through .door{transition-delay:.12s!important}' +
    'body.snap *,body.snap *::before,body.snap *::after{transition:none!important}' +
    'body.slowin *{transition-duration:1.6s!important;transition-delay:0s!important;transition-timing-function:cubic-bezier(.3,.1,.2,1)!important}' +
    'body.slowin #view{transition-delay:.35s!important}body.slowin #dialwrap,body.slowin .tk{transition-delay:.9s!important}';
  document.head.appendChild(st); })();
function quick(ms) { const b = document.body; clearTimeout(quickT); b.classList.add('quick'); quickT = setTimeout(() => b.classList.remove('quick'), ms); }
function perform() {
  timers.forEach(clearTimeout); timers = [];
  const b = document.body;
  if (A._through) { // through the door: Home fades in slowly, the dial last
    A._through = false; arrived = true; clearTimeout(quickT); b.classList.remove('quick');
    b.classList.add('snap'); b.dataset.phase = 'frame'; void b.offsetWidth; b.classList.remove('snap'); // Home starts hidden, with no fade-out
    b.classList.add('slowin');
    timers.push(setTimeout(() => { b.dataset.phase = 'ui'; CFG.onUI && CFG.onUI(route); }, 160));
    timers.push(setTimeout(() => b.classList.remove('slowin'), 3400)); return; }
  if (arrived) { // the previous page has already left (see go); the new one comes in over the remaining time
    const left = STEP - OUT; quick(left + 60); b.dataset.phase = 'bg';
    timers.push(setTimeout(() => b.dataset.phase = 'frame', 80));
    timers.push(setTimeout(() => { b.dataset.phase = 'ui'; CFG.onUI && CFG.onUI(route); }, left - 300));
    return; }
  arrived = true;
  if (route && route.tab === 'landing') { // the door arrives on its own, two seconds before the frame and the rest
    b.dataset.phase = 'bg';
    timers.push(setTimeout(() => b.dataset.phase = 'door', HOLD));
    timers.push(setTimeout(() => b.dataset.phase = 'frame', HOLD + 2000));
    timers.push(setTimeout(() => { b.dataset.phase = 'ui'; CFG.onUI && CFG.onUI(route); }, HOLD + 2000 + FRAME));
    return;
  }
  const hold = RETURNING && route && route.tab !== 'home' ? 60 : HOLD; b.dataset.phase = 'bg';
  timers.push(setTimeout(() => b.dataset.phase = 'frame', hold));
  timers.push(setTimeout(() => { b.dataset.phase = 'ui'; CFG.onUI && CFG.onUI(route); }, hold + FRAME));
}
function skip() { if (document.body.dataset.phase === 'ui') return; timers.forEach(clearTimeout); timers = []; document.body.dataset.phase = 'ui'; CFG.onUI && CFG.onUI(route); }
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' || /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) || e.target.isContentEditable) return;
  if (document.body.dataset.phase !== 'ui') { e.preventDefault(); skip(); }
});
let lastTap = 0;
document.addEventListener('touchend', e => { const t = Date.now(); if (t - lastTap < 320 && document.body.dataset.phase !== 'ui') { e.preventDefault(); skip(); } lastTap = t; }, { passive: false });
document.addEventListener('dblclick', () => skip());

let frameL = 0;
function fitFrame() { const rs = [...document.querySelectorAll('#frame rect')], r = rs[rs.length - 1]; if (!r || !r.getTotalLength) return; let L = 0; try { L = Math.ceil((r.getTotalLength() + 24) * Math.max(1, window.devicePixelRatio || 1)); /* non-scaling stroke dashes are measured on screen: scaled displays need the longer dash, or the frame keeps a gap at its start (top left) */ } catch (e) { return; }
  if (frameL === -1) return; if (L > 100 && Math.abs(L - frameL) > 8) { frameL = L; rs.forEach(x => x.style.setProperty('--L', L + 'px')); } }
addEventListener('resize', fitFrame); addEventListener('load', fitFrame);
/* once the frame has drawn itself in, drop the dash entirely so no screen scaling or zoom can leave a gap */
document.addEventListener('transitionend', e => { if (frameL !== -1 && e.target.closest && e.target.closest('#frame') && e.propertyName === 'stroke-dashoffset' && document.body.dataset.phase === 'ui') { frameL = -1; document.querySelectorAll('#frame rect').forEach(x => x.style.setProperty('--L', 'none')); } });

/* ---------- backgrounds ---------- */
let bgFlip = 0;
function setBg(src, video) {
  const layers = $$('#bg .bgi'); const next = layers[bgFlip = 1 - bgFlip], prev = layers[1 - bgFlip];
  if (src) next.style.backgroundImage = `url("${src}")`;
  next.classList.toggle('on', !!src); prev.classList.remove('on');
  const v = $('#bgv');
  if (video && !RM) { if (v.getAttribute('src') !== video) { v.src = video; } v.classList.add('on'); v.play().catch(() => {}); }
  else { v.classList.remove('on'); v.pause(); }
}

/* ---------- routing ---------- */
const TABS = ['landing', 'home', 'projects', 'background', 'about', 'artifacts', 'lot'];
function parse() { const h = location.hash.slice(1) || 'landing'; if (/^p\d\d$/.test(h) && D.projects.find(p => 'p' + p.num === h)) return { tab: 'projects', id: h }; return { tab: TABS.includes(h) ? h : 'home', id: TABS.includes(h) ? h : 'home' }; }
/* a page change first lets the current page leave (it fades and blurs out with the frame), then swaps in the next */
const OUT = 380; let swapT = 0;
function go() {
  if (cine) return;
  clearTimeout(swapT);
  if (!arrived || A._through) return render();
  timers.forEach(clearTimeout); timers = [];
  quick(STEP + 60); document.body.dataset.phase = 'bg';
  $$('[data-nav]').forEach(a => a.toggleAttribute('aria-current', a.dataset.nav === parse().tab));
  swapT = setTimeout(render, OUT);
}
function render() {
  const r = parse(), prev = route; route = r;
  document.body.dataset.tab = r.tab; document.body.dataset.route = r.id;
  $$('[data-nav]').forEach(a => a.toggleAttribute('aria-current', a.dataset.nav === r.tab));
  A.room && (r.tab === 'artifacts' ? null : A.room.stop());
  const view = $('#view'); view.innerHTML = '';
  const p = r.id.startsWith('p') && r.id !== 'projects' ? D.projects.find(x => 'p' + x.num === r.id) : null;
  if (p) { CFG.project(view, p, D); setBg(p.frost, p.video); }
  else { CFG[r.tab](view, D); setBg(CFG.bgFor(r.tab), null); }
  view.scrollTop = 0; window.scrollTo(0, 0);
  CFG.onRoute && CFG.onRoute(r, prev);
  wireBlocks(view);
  perform();
}
window.addEventListener('hashchange', go);

/* ---------- content blocks ---------- */
const img = k => (k.includes('/') ? k : `g/${k}.webp`);
function chartFrame(inner, cls = '') { return `<figure class="viz ${cls}"><span class="viz-c" aria-hidden="true"></span>${inner}</figure>`; }
function gauges(x) {
  return chartFrame(`<div class="g-row">${x.map(([v, l]) => {
    const r = 42, c = 2 * Math.PI * r, d = c * v / 100;
    return `<div class="g"><svg viewBox="0 0 120 120" role="img" aria-label="${v}% ${esc(strip(l))}"><circle cx="60" cy="60" r="52" class="dash"/><circle cx="60" cy="60" r="${r}" class="track"/>
      <circle cx="60" cy="60" r="${r}" class="arc" stroke-dasharray="${d} ${c}" transform="rotate(-90 60 60)"/><circle cx="60" cy="${60 - r}" r="4.5" class="dot" transform="rotate(${v * 3.6} 60 60)"/>
      <text x="60" y="66" text-anchor="middle">${v}%</text></svg><p>${l}</p></div>`;
  }).join('')}</div>`, 'g-viz');
}
function bars(b) {
  const max = Math.max(...b.x.map(r => r[1])), W = 320, H = 150, bw = W / b.x.length;
  const rows = b.x.map(([k, n], i) => { const h = n / max * (H - 30); return `<g><rect x="${i * bw + bw * .22}" y="${H - h}" width="${bw * .56}" height="${h}" rx="${bw * .28}" class="bar"/>
    <text x="${i * bw + bw / 2}" y="${H + 16}" text-anchor="middle" class="ax">${k}</text>${n ? `<text x="${i * bw + bw / 2}" y="${H - h - 6}" text-anchor="middle" class="val">${n}</text>` : ''}</g>`; }).join('');
  const ax = (b.avg - b.x[0][0] + .5) * bw;
  return chartFrame(`<figcaption>${esc(b.title)}</figcaption><svg viewBox="-6 -10 ${W + 12} ${H + 34}" role="img" aria-label="${esc(b.title)}; ${b.x.map(r => r[0] + ': ' + r[1]).join(', ')}">
    <line x1="0" x2="${W}" y1="${H}" y2="${H}" class="base"/>${rows}<line x1="${ax}" x2="${ax}" y1="-4" y2="${H}" class="avg"/><text x="${W}" y="-2" text-anchor="end" class="ax">┆ ${esc(b.avgLabel)}</text></svg><p class="viz-k">${esc(b.xlab)} · ${esc(b.unit)}</p>`);
}
function timeline(t) {
  const W = 640, row = 22, y0 = 26, span = t.to - t.from, X = v => (v - t.from) / span * W;
  const items = t.x.map(([n, k, a, b, l], i) => { const x0 = X(a), x1 = X(b ?? t.to); const y = y0 + i * row;
    return `<g><rect x="${x0}" y="${y}" width="${Math.max(6, x1 - x0)}" height="12" rx="6" class="${k === 'edu' ? 'edu' : 'work'}"/><text x="${Math.min(x1 + 8, W - 4)}" y="${y + 10}" class="lbl" ${x1 + 8 > W - 150 ? `text-anchor="end" dx="${-(x1 + 8 - x0) - 14}"` : ''}>${esc(strip(n))}</text></g>`; }).join('');
  let ticks = ''; for (let y = Math.ceil(t.from); y <= t.to; y++) ticks += `<line x1="${X(y)}" x2="${X(y)}" y1="14" y2="${y0 + t.x.length * row}" class="tick"/><text x="${X(y)}" y="8" text-anchor="middle" class="ax">${y}</text>`;
  return chartFrame(`<figcaption>${esc(t.title)}</figcaption><div class="viz-scroll"><svg viewBox="-10 -6 ${W + 20} ${y0 + t.x.length * row + 10}" style="min-width:560px" role="img" aria-label="Education and work, ${t.from} to 2026">${ticks}${items}</svg></div>
    <p class="viz-k"><span class="key edu"></span>Education <span class="key work"></span>Work</p>`, 't-viz');
}
function spectrum(b) {
  const n = b.stops.length;
  return chartFrame(`<figcaption>${esc(b.title)}</figcaption><div class="sp-row">${b.stops.map((s, i) => `<div class="sp"><span class="orb" style="--k:${i / (n - 1)}"></span><p>${esc(s)}</p></div>`).join('')}</div>
    <div class="sp-ax"><span>${esc(b.left)}</span><span class="arrow" aria-hidden="true"></span><span>${esc(b.right)}</span></div><p class="viz-k">${esc(b.note)}</p>`, 's-viz');
}
function drops(b) {
  const k = b.n / b.per;
  return chartFrame(`<div class="dr-head"><b>${b.n.toLocaleString('en-US')}</b><span>${esc(b.x)}</span></div><div class="dr" role="img" aria-label="${k} spheres, each ${b.per.toLocaleString('en-US')} liters">${Array.from({ length: k }, () => '<i></i>').join('')}</div>
    <p class="viz-k">Each sphere is ${b.per.toLocaleString('en-US')} liters</p>`, 'd-viz');
}
function stat(b) { return chartFrame(`<div class="st"><b>${esc(b.n)}</b><span>${esc(b.u)}</span></div><p>${esc(b.x)}</p>`, 'st-viz'); }
const R = {
  spec: b => `<dl class="spec">${b.x.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`,
  lead: b => `<p class="lead">${b.x}</p>`, p: b => `<p>${b.x}</p>`, h2: b => `<h2>${b.x}</h2>`, h3: b => `<h3>${b.x}</h3>`,
  tags: b => `<ul class="tags">${b.x.map(t => `<li>${t}</li>`).join('')}</ul>`,
  items: b => `<dl class="items">${b.x.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`,
  process: b => `<ol class="process">${b.x.map(([k, v]) => `<li><b>${esc(k)}</b><span>${esc(v)}</span></li>`).join('')}</ol>`,
  gal: b => `<figure class="gal c${b.cols}">${b.imgs.map(([k, a]) => `<img src="${img(k)}" alt="${esc(a)}" loading="lazy" decoding="async">`).join('')}${b.cap ? `<figcaption>${b.cap}</figcaption>` : ''}</figure>`,
  video: b => b.parts ? `<figure class="vid multi" data-parts='${esc(JSON.stringify(b.parts))}' style="--ar:${b.ar || '16/9'}"><div class="vstack"><video class="on" muted playsinline preload="none" poster="g/${b.poster}.webp" aria-label="${esc(b.title)}"></video><video muted playsinline preload="none" aria-hidden="true"></video></div><figcaption>${esc(b.title)} · ${esc(b.dur)}</figcaption></figure>` :
           `<figure class="vid${b.portrait ? ' port' : ''}"><video muted loop playsinline preload="none" data-src="v/${b.src}.mp4" poster="g/${b.poster}.webp" aria-label="${esc(b.title)}"></video><figcaption>${esc(b.title)} · ${esc(b.dur)}</figcaption></figure>`,
  gauges: b => gauges(b.x), bars, timeline, spectrum, drops, stat,
  responses: b => `<div class="resp">${b.x.map(([f, r]) => `<div><b>${f}</b>${r.map(x => `<span>${x}</span>`).join('')}</div>`).join('')}</div>`,
  quote: b => `<blockquote>${esc(b.x)}</blockquote>`,
  poem: b => `<div class="poem">${b.x.map(l => l ? `<span>${esc(l)}</span>` : '<br>').join('')}</div>`,
};
A.blocks = bl => bl.map(b => (R[b.t] ? R[b.t](b) : '')).join('');
/* a film cut into parts on a project page: two stacked videos, the next part loaded while this one plays,
   handed over on the last frame so the film runs without a gap; it loops back to the first part */
function partsPlayer(fig) {
  const parts = JSON.parse(fig.dataset.parts), vs = $$('video', fig); let i = 0, cur = 0, live = false, handing = false;
  const load = (v, k) => { if (v._k === k && v.getAttribute('src')) return; v._k = k; v.preload = 'auto'; v.src = parts[k]; v.load(); };
  const swap = () => { const v = vs[cur], nx = vs[1 - cur]; i = (i + 1) % parts.length; cur = 1 - cur; load(nx, i); nx.currentTime = 0; nx.muted = v.muted;
    nx.play().catch(() => {}); nx.classList.add('on'); v.classList.remove('on'); v.pause(); handing = false; watch(nx); setTimeout(() => load(vs[1 - cur], (i + 1) % parts.length), 300); };
  const watch = v => { const t = () => { if (v !== vs[cur] || !live) return; if (!handing && v.duration && v.duration - v.currentTime < 0.09) { handing = true; swap(); return; }
    v.requestVideoFrameCallback ? v.requestVideoFrameCallback(t) : requestAnimationFrame(t); }; t(); };
  vs.forEach(v => { v.addEventListener('ended', () => { if (v === vs[cur] && !handing) { handing = true; swap(); } }); v.addEventListener('click', () => { const m = !vs[cur].muted; vs.forEach(x => { x.muted = m; }); }); });
  return { on() { if (live) return; live = true; const v = vs[cur]; load(v, i); if (!RM) v.play().then(() => watch(v)).catch(() => {}); setTimeout(() => load(vs[1 - cur], (i + 1) % parts.length), 600); },
           off() { live = false; vs.forEach(v => v.pause()); } };
}
function wireBlocks(root) {
  const multi = $$('figure.vid.multi', root);
  if (multi.length) { const io2 = new IntersectionObserver(es => es.forEach(e => { const f = e.target; f._p = f._p || partsPlayer(f); e.isIntersecting ? f._p.on() : f._p.off(); }), { rootMargin: '200px' }); multi.forEach(f => io2.observe(f)); }
  const vids = $$('video[data-src]', root); if (!vids.length) return;
  const io = new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting) { if (!v.src) v.src = v.dataset.src; if (!RM) v.play().catch(() => {}); } else v.pause(); }), { rootMargin: '200px' });
  vids.forEach(v => { io.observe(v); v.addEventListener('click', () => { v.muted = !v.muted; }); });
}

/* ---------- cinematic mode: one borderless playlist across the whole screen ---------- */
const SPAN = 300;
function cinema(on) {
  cine = on; document.body.classList.toggle('cine', on);
  const box = $('#cine'), vs = $$('video', box);
  if (!on) { vs.forEach(v => { cancelAnimationFrame(v._ramp); v.onended = null; v.pause(); }); clearInterval(A._cineT); go(); return; }
  setBg(CFG.bgFor('home'), null);
  /* the reel: D.videos in order. A film cut into parts (same `film`) plays straight through: the next part is
     loaded in the second <video> while this one plays and takes over on the last frame, with no fade and no gap.
     Between different films the pictures crossfade and the outgoing sound fades out. */
  const list = D.videos.slice();
  const films = []; list.forEach((c, k) => { const f = c.film || c.src; if (!films.length || films[films.length - 1].id !== f) films.push({ id: f, start: k }); });
  const filmOf = k => { let n = 0; films.forEach((f, x) => { if (f.start <= k) n = x; }); return n; };
  let i = 0, cur = 0, t0 = performance.now(), paused = false, handing = false;
  const idx = $('.cc-i', box), pp = $('.cc-pp', box), capT = $('.cc-t', box), capF = $('.cc-f', box), capP = $('.cc-parts', box);
  const label = () => { const c = list[i];
    idx.textContent = `${String(filmOf(i) + 1).padStart(2, '0')} / ${String(films.length).padStart(2, '0')}`;
    pp.setAttribute('aria-label', paused ? 'Play' : 'Pause'); pp.dataset.state = paused ? 'paused' : 'playing';
    if (capT) capT.textContent = c.film ? c.filmTitle : c.title;
    if (capF) capF.textContent = c.sub || (c.tags || []).join(' · ');
    if (capP) capP.innerHTML = c.parts > 1 ? `Part ${c.part} of ${c.parts}` + Array.from({ length: c.parts }, (_, k) => `<i class="${k + 1 < c.part ? 'done' : k + 1 === c.part ? 'on' : ''}"></i>`).join('') : ''; };
  const snd = $('.cc-snd', box);
  const sndLabel = () => { if (!snd) return; snd.dataset.state = A._mute ? 'muted' : 'on'; snd.setAttribute('aria-label', A._mute ? 'Unmute' : 'Mute'); snd.setAttribute('aria-pressed', String(!!A._mute)); };
  const ramp = (v, to, ms, then) => { cancelAnimationFrame(v._ramp); const from = v.volume, t0 = performance.now();
    const f = t => { const k = Math.min(1, (t - t0) / ms); v.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) v._ramp = requestAnimationFrame(f); else then && then(); };
    v._ramp = requestAnimationFrame(f); };
  const load = (v, k) => { if (v._k === k && v.getAttribute('src')) return; v._k = k; v.preload = 'auto'; v.src = list[k].src; v.load(); };
  const nextOf = k => (k + 1) % list.length;
  const sameFilm = (a, b) => !!list[a].film && list[a].film === list[b].film;
  /* watch the active clip frame by frame; hand over to the preloaded part just before its last frame */
  const watch = v => { const tick = () => { if (v !== vs[cur] || !cine) return;
      if (!handing && !paused && v.duration && v.duration - v.currentTime < 0.09 && sameFilm(i, nextOf(i))) { handing = true; cut(); return; }
      v._cb = v.requestVideoFrameCallback ? v.requestVideoFrameCallback(tick) : requestAnimationFrame(tick); };
    tick(); };
  const show = (v, other, fade) => { [v, other].forEach(x => x.classList.toggle('cut', !fade)); v.classList.add('on'); other.classList.remove('on'); };
  const start = (v, fade) => { const other = vs[1 - cur]; paused = false; handing = false;
    v.muted = !!A._mute;
    if (fade) { v.volume = 0; v.currentTime = 0; }
    v.play().then(() => { if (fade) ramp(v, 1, 700); }).catch(e => { if (e && e.name === 'NotAllowedError' && !v.muted) { v.muted = true; A._mute = true; sndLabel(); v.volume = 1; v.play().catch(() => {}); } });
    show(v, other, fade);
    if (fade) ramp(other, 0, 1200, () => other.pause()); else { other.pause(); }
    v.onended = () => { if (handing) return; if (sameFilm(i, nextOf(i))) { handing = true; cut(); } else step(1, true); };
    label(); watch(v);
    setTimeout(() => { if (vs[cur] === v) load(other, nextOf(i)); }, fade ? 1700 : 300); };   // get the next clip ready
  const cut = () => { const v = vs[cur], nx = vs[1 - cur]; i = nextOf(i); cur = 1 - cur;
    if (nx._k !== i) load(nx, i);
    nx.currentTime = 0; nx.volume = v.volume; start(nx, false); };
  const play = () => { const v = vs[cur]; load(v, i); v.currentTime = 0; start(v, true); };
  if (snd) snd.onclick = () => { A._mute = !A._mute; vs.forEach(x => { x.muted = A._mute; }); if (!A._mute) ramp(vs[cur], 1, 400); sndLabel(); };
  sndLabel();
  /* prev and next move by film; the end of a film (or a single clip) runs on to the next film with a crossfade */
  const step = (d, auto) => { const f = filmOf(i); const nf = (f + d + films.length) % films.length;
    i = auto ? nextOf(i) : films[nf].start; cur = 1 - cur; play(); };
  $('.cc-prev', box).onclick = () => step(-1); $('.cc-next', box).onclick = () => step(1);
  pp.onclick = () => { const v = vs[cur]; paused = !paused; if (paused) v.pause(); else v.play().catch(() => {}); label(); };
  play();
  const clock = $('#cine-t');
  clearInterval(A._cineT); A._cineT = setInterval(() => { if (paused) { t0 += 500; return; } const s = ((performance.now() - t0) / 1000) % SPAN; if (clock) clock.textContent = `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60 | 0).padStart(2, '0')} / 05:00`; }, 500);
}
A.cinema = cinema;

/* ---------- mode dials (study B: frost knob, study D: orbit) ---------- */
const P = (r, a) => [120 + r * Math.sin(a), 120 - r * Math.cos(a)];
function ticks(r0, r1, n, maj) { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, m = i % maj === 0, [x0, y0] = P(m ? r0 - 6 : r0, a), [x1, y1] = P(r1, a); s += `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="${m ? 'tk acc' : 'tk'}"/>`; } return s; }
const DIALS = {
  B: () => `<defs><radialGradient id="kg" cx="38%" cy="32%"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".55" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".05"/></radialGradient></defs>
    <circle cx="120" cy="120" r="110" class="ring dotted"/><text class="lbl acc" x="134" y="16">PORTFOLIO</text><text class="lbl" x="134" y="232">CINEMATIC</text>
    <circle cx="120" cy="10" r="2.2" class="acc-f"/><circle cx="120" cy="230" r="2.2" class="w-f"/>
    <g class="rot"><circle cx="120" cy="120" r="86" fill="url(#kg)" class="knob"/>${ticks(80, 86, 96, 96)}<circle cx="120" cy="120" r="62" class="ring"/><rect x="117.5" y="38" width="5" height="20" rx="2.5" class="acc-f"/></g>`,
  D: () => `<circle cx="120" cy="120" r="96" class="ring"/><circle cx="120" cy="120" r="60" class="ring acc dashed"/>
    <line x1="120" y1="108" x2="120" y2="132" class="acc-s"/><line x1="108" y1="120" x2="132" y2="120" class="acc-s"/>
    <circle cx="120" cy="24" r="4" class="acc-s nofill"/><circle cx="120" cy="216" r="4" class="w-s nofill"/>
    <text class="lbl acc" x="132" y="27">PORTFOLIO</text><text class="lbl" x="132" y="219">CINEMATIC</text>
    <g class="rot"><circle cx="120" cy="24" r="7.5" class="acc-f"/><circle cx="120" cy="24" r="14" class="acc-s nofill thin"/></g>`
};
A.dial = (host, kind) => {
  host.innerHTML = `<div class="dial" role="slider" tabindex="0" aria-label="Site mode" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${cine ? 1 : 0}" aria-valuetext="${cine ? 'Cinematic' : 'Portfolio'}"><svg viewBox="0 0 240 240">${DIALS[kind]()}</svg></div>`;
  const dial = $('.dial', host), rot = $('.rot', host); let ang = cine ? 180 : 0, drag = null;
  rot.style.transform = `rotate(${ang}deg)`;
  const set = (s, a) => { ang = a ?? (s ? 180 : 0); rot.style.transition = ''; rot.style.transform = `rotate(${ang}deg)`; dial.setAttribute('aria-valuenow', s); dial.setAttribute('aria-valuetext', s ? 'Cinematic' : 'Portfolio');
    if (!!s !== cine) setTimeout(() => cinema(!!s), RM ? 0 : 650); };
  const at = e => { const r = dial.getBoundingClientRect(); return Math.atan2(e.clientX - r.left - r.width / 2, -(e.clientY - r.top - r.height / 2)) * 180 / Math.PI; };
  dial.addEventListener('pointerdown', e => { dial.setPointerCapture(e.pointerId); drag = { a0: at(e), g0: ang, moved: false }; rot.style.transition = 'none'; });
  dial.addEventListener('pointermove', e => { if (!drag) return; const d = at(e) - drag.a0; if (Math.abs(d) > 4) drag.moved = true; drag.cur = drag.g0 + d; rot.style.transform = `rotate(${drag.cur}deg)`; });
  dial.addEventListener('pointerup', () => { if (!drag) return; const a = drag.moved ? drag.cur : ang + 180; drag = null; const n = ((a % 360) + 360) % 360; set(n > 90 && n < 270 ? 1 : 0, Math.round(a / 180) * 180); });
  dial.addEventListener('keydown', e => { const k = e.key; if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Enter', ' '].includes(k)) { e.preventDefault(); e.stopPropagation(); set(['ArrowDown', 'ArrowRight'].includes(k) ? 1 : ['ArrowUp', 'ArrowLeft'].includes(k) ? 0 : (cine ? 0 : 1)); } });
};

/* ---------- the door on the landing page ---------- */
A.door = (host, shape) => {
  const arch = shape === 'arch';
  const outline = arch ? 'M10 330 V100 A90 90 0 0 1 190 100 V330' : 'M10 330 V22 Q10 10 22 10 H178 Q190 10 190 22 V330';
  const leaf = arch ? 'M16 330 V102 A84 84 0 0 1 184 102 V330 Z' : 'M16 330 V24 Q16 16 24 16 H176 Q184 16 184 24 V330 Z';
  host.innerHTML = `<div class="door-scene"><button type="button" class="door" aria-label="Enter the site">
    <span class="door-light" aria-hidden="true"></span>
    <svg class="door-jamb" viewBox="0 0 200 400" aria-hidden="true"><path d="${outline}" class="dl"/><path d="M-30 330 H230" class="dl thin"/>
      <path d="M184 330 A168 46 0 0 1 16 376" class="dl swing"/></svg>
    <span class="door-leaf" aria-hidden="true"><svg viewBox="0 0 200 400"><path d="${leaf}" class="dl leafp"/><circle cx="${arch ? 168 : 166}" cy="196" r="4.5" class="dl knob"/>
      <path d="M40 ${arch ? 128 : 52} H160 M40 300 H160" class="dl thin"/></svg></span></button></div>`;
  host.querySelectorAll('.dl').forEach(p => p.setAttribute('pathLength', '1'));
  const b = $('.door', host), scene = $('.door-scene', host);
  b.addEventListener('click', () => { if (b.classList.contains('open')) return; quick(600); b.classList.add('open'); scene.classList.add('through');
    setTimeout(() => { A._through = true; location.hash = '#home'; }, RM ? 400 : 500); });
};

/* ---------- Artifacts room ---------- */
A.room = null;
A.mountRoom = (el) => { if (!window.MiniGL || !ART) { el.innerHTML = '<p class="soft">The room needs WebGL, which is off in this browser.</p>'; return; }
  A.room = window.ROOM(el, ART); A.room.start(); };

/* ---------- Parking Lot ---------- */
/* Parking Lot storage: claude.ai's shared store inside the artifact; Supabase (REST, no library) on the public site when ADVL_LOT_DB is set */
async function lotStore() {
  const cfg = window.ADVL_LOT_DB;
  if (cfg && cfg.url && cfg.key) {
    const H = { apikey: cfg.key, 'Content-Type': 'application/json' }; /* publishable key goes in apikey only; requests run as the anon role */
    const api = (path, o = {}) => fetch(cfg.url.replace(/\/$/, '') + path, { ...o, headers: { ...H, ...(o.headers || {}) } }).then(r => { if (!r.ok) throw new Error(r.status); return r.status === 204 ? null : r.json(); });
    let tok = '', mine = [];
    try { tok = localStorage.getItem('advl-lot-tok') || ''; if (!tok) { tok = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join(''); localStorage.setItem('advl-lot-tok', tok); } mine = JSON.parse(localStorage.getItem('advl-lot-mine') || '[]'); } catch (e) { tok = tok || Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2); }
    const keep = () => { try { localStorage.setItem('advl-lot-mine', JSON.stringify(mine.slice(-200))); } catch (e) {} };
    let cb = null, fail = null, timer = 0, last = null;
    const pull = async () => { try { const rows = await api('/rest/v1/lot_messages?select=id,created_at,name,body&order=created_at.asc&limit=300');
        const msgs = rows.map(r => ({ id: String(r.id), ts: Date.parse(r.created_at), name: r.name || '', text: r.body, u: 'p', del: mine.includes(String(r.id)) }));
        const sig = msgs.map(m => m.id + (m.del ? '*' : '')).join(','); if (sig !== last) { last = sig; cb && cb(msgs); } }
      catch (e) { fail && fail(e); } };
    try { await api('/rest/v1/lot_messages?select=id&limit=1'); } catch (e) { return null; }
    return { canPost: true,
      subscribe(f, onErr) { cb = f; fail = onErr; pull(); clearInterval(timer); timer = setInterval(() => { if (!document.hidden) pull(); }, 15000); },
      async add(m) { const r = await api('/rest/v1/lot_messages?select=id', { method: 'POST', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name: m.name, body: m.text, author_token: tok }) });
        if (r && r[0]) { mine.push(String(r[0].id)); keep(); } last = null; await pull(); },
      async del(u, id) { await api('/rest/v1/rpc/delete_own_message', { method: 'POST', body: JSON.stringify({ p_id: Number(id), p_token: tok }) }); mine = mine.filter(x => x !== id); keep(); last = null; await pull(); } };
  }
  const db = window.claude ? await window.claude.use('db') : null, user = window.claude ? await window.claude.use('user') : null;
  if (!db || !user) return null;
  const me = await user.id(), owner = await user.isOwner(); let mine = [];
  return { canPost: !!me,
    subscribe(f, onErr) { db.collection('lot').onSnapshot(snap => {
      const all = []; snap.docs.forEach(d => { const b = d.data() || {}; (b.msgs || []).forEach(m => all.push({ ...m, u: d.id, del: d.id === me || owner })); if (d.id === me) mine = (b.msgs || []).slice(); });
      all.sort((a, b) => a.ts - b.ts); f(all); }, onErr); },
    async add(m) { const next = mine.concat(m); await db.doc('lot/' + me).set({ msgs: next }); mine = next; },
    async del(u, id) { const ref = db.doc('lot/' + u), s = await ref.get(); const msgs = ((s.data() || {}).msgs || []).filter(m => m.id !== id); await ref.set({ msgs }); } };
}
A.mountLot = async (el) => {
  const list = $('.lot-list', el), form = $('.lot-form', el), field = $('#lot-text', el), nameIn = $('#lot-name', el), anon = $('#lot-anon', el), status = $('.lot-status', el);
  try { const n = localStorage.getItem('advl-lot-name'); if (n) nameIn.value = n; if (localStorage.getItem('advl-lot-anon') === '1') anon.checked = true; } catch (e) {}
  const show = msgs => {
    list.innerHTML = msgs.length ? msgs.map(m => `<li data-u="${esc(m.u)}" data-id="${esc(m.id)}"><span class="who">${esc(m.name || 'Anonymous')}</span><span class="when">${new Date(m.ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span><p>${esc(m.text)}</p>${m.del ? '<button type="button" class="del">Delete</button>' : ''}</li>`).join('')
      : '<li class="empty"><p>No one has parked here yet. Write the first message below.</p></li>';
    list.scrollTop = list.scrollHeight;
    if (el._desk && window.ADVL_LOT) window.ADVL_LOT.sync(msgs);   // desktop: the same messages float in the lot
  };
  const st = await lotStore();
  if (!st) { status.textContent = window.ADVL_LOT_DB ? 'The Parking Lot is offline right now. Try again later.' : 'Chat is read-only here. Open this page signed in to claude.ai to post.'; form.querySelector('button').disabled = true; field.disabled = true; show([]); return; }
  if (!st.canPost) { status.textContent = 'Chat is read-only for this view.'; field.disabled = true; }
  st.subscribe(show, () => { status.textContent = 'The Parking Lot lost its connection. Reload to reconnect.'; });
  form.addEventListener('submit', async e => { e.preventDefault(); const text = field.value.trim(); if (!text || !st.canPost) return;
    const name = anon.checked ? '' : nameIn.value.trim().slice(0, 40);
    try { localStorage.setItem('advl-lot-name', nameIn.value.trim()); localStorage.setItem('advl-lot-anon', anon.checked ? '1' : '0'); } catch (e) {}
    const msg = { id: Math.random().toString(36).slice(2, 10), ts: Date.now(), text: text.slice(0, 600), name };
    field.value = ''; status.textContent = '';
    try { await st.add(msg); } catch (err) { status.textContent = 'That message didn’t send. Try again.'; field.value = text; }
  });
  const del = async (u, id) => { try { await st.del(u, id); } catch (err) { status.textContent = 'That message couldn’t be deleted.'; } };
  if (window.ADVL_LOT) window.ADVL_LOT.setDelete(del);
  list.addEventListener('click', e => { const b = e.target.closest('.del'); if (!b) return; const li = b.closest('li'); del(li.dataset.u, li.dataset.id); });
};
/* local screen saver: random generation from the site, or the viewer's own image; kept in this browser only */
A.screensaver = (layer, btnRandom, fileIn) => {
  const pool = ['img/homunculus.webp', 'img/collage_alt.webp', 'img/cfai_render.webp', 'img/equip0.webp', 'img/ribbons.webp', 'img/amber_petals.webp', 'img/bubble_arch.webp', 'img/lb/macro_violet.webp', 'img/lb/skin.webp', 'img/grad_solar.webp', 'img/grad_blossom.webp'];
  const apply = src => { layer.style.backgroundImage = src; };
  const randomGen = () => { const pick = () => pool[Math.random() * pool.length | 0]; const a = pick(), b = pick(), c = pick();
    apply(`url("${a}"), url("${b}"), url("${c}")`); layer.style.backgroundSize = `${60 + Math.random() * 60}% auto, ${50 + Math.random() * 70}% auto, cover`;
    layer.style.backgroundPosition = `${Math.random() * 100}% ${Math.random() * 100}%, ${Math.random() * 100}% ${Math.random() * 100}%, center`; layer.style.backgroundRepeat = 'no-repeat';
    try { localStorage.setItem('advl-saver', JSON.stringify({ img: layer.style.backgroundImage, size: layer.style.backgroundSize, pos: layer.style.backgroundPosition })); } catch (e) {} };
  try { const s = JSON.parse(localStorage.getItem('advl-saver') || 'null'); if (s) { layer.style.backgroundImage = s.img; layer.style.backgroundSize = s.size; layer.style.backgroundPosition = s.pos; layer.style.backgroundRepeat = 'no-repeat'; } } catch (e) {}
  btnRandom.onclick = randomGen;
  fileIn.onchange = () => { const f = fileIn.files[0]; if (!f || !/^image\//.test(f.type)) return; const r = new FileReader();
    r.onload = () => { layer.style.backgroundImage = `url("${r.result}")`; layer.style.backgroundSize = 'cover'; layer.style.backgroundPosition = 'center';
      try { localStorage.setItem('advl-saver', JSON.stringify({ img: layer.style.backgroundImage, size: 'cover', pos: 'center' })); } catch (e) { } }; r.readAsDataURL(f); };
};

/* ---------- boot ---------- */
A.boot = async cfg => {
  CFG = cfg;
  try { [D, ART] = await Promise.all([fetch('data.json').then(r => r.json()), fetch('artifacts.json').then(r => r.json()).catch(() => null)]); }
  catch (e) { document.body.dataset.phase = 'ui'; $('#view').innerHTML = '<p class="soft">The site content didn’t load. Reload the page to try again.</p>'; return; }
  A.D = D; cfg.init && cfg.init(D);
  go();
};
A.esc = esc; A.strip = strip; A.RM = RM; A.skip = skip; A.go = go;
window.ADVL = A;
})();
