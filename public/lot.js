/* Parking Lot, desktop (approved 10/27): the messages float as plain text in a small physics world inside a rounded inner frame,
   with a cumulus on the top line, grass, a bush and the door on the ground, and 45° stall lines out front.
   Names and dates take the palette accent, lightened or darkened for the background behind each note.
   The background rotates through Ariana's picks once a minute. With no messages, the drying-sheet drawing fills the space. */
(function () {
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BGS = [{"src": "img/lotbg/04.webp", "name": "Ribbons"}, {"src": "img/lotbg/06.webp", "name": "Sky, purple"}, {"src": "img/lotbg/07.webp", "name": "Dusk, pink"}, {"src": "img/lotbg/08.webp", "name": "Amber petals"}, {"src": "img/lotbg/09.webp", "name": "Lit stair"}, {"src": "img/lotbg/10.webp", "name": "Magenta mesh"}, {"src": "img/lotbg/12.webp", "name": "Road at dusk"}, {"src": "img/lotbg/13.webp", "name": "Blossom"}, {"src": "img/lotbg/14.webp", "name": "Solar"}, {"src": "img/lotbg/16.webp", "name": "Stair render"}, {"src": "img/lotbg/24.webp", "name": "Green anchor"}, {"src": "img/lotbg/25.webp", "name": "Skin study"}, {"src": "img/lotbg/28.webp", "name": "Membrane macro"}, {"src": "img/lotbg/29.webp", "name": "Shell"}, {"src": "img/lotbg/30.webp", "name": "Blue membrane"}, {"src": "img/lotbg/32.webp", "name": "Melon leather"}];
const PALETTES = [
  { name: 'Ultraviolet', line: '#CFF002', hue: 268, sat: 92, tint: '16 8 40', sw: ['#6E2CF2', '#B796FF', '#CFF002'] },
  { name: 'Night garden', line: '#CFF002', hue: 150, sat: 70, tint: '6 26 22', sw: ['#0E3B30', '#15E681', '#CFF002'] },
  { name: 'Bloom', line: '#FFB3E1', hue: 325, sat: 85, tint: '40 8 34', sw: ['#5A1450', '#FF7CC8', '#FFB3E1'] },
  { name: 'Ice', line: '#A6ECFF', hue: 198, sat: 85, tint: '6 18 36', sw: ['#0B2C4A', '#5CC8F2', '#A6ECFF'] }];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let eff = null, low = false, root = null, G = {}, W = 0, H = 0, raf = 0, pal = PALETTES[0], timer = 0, lum = null, bi = 0, front = 0, delFn = null;
try { const p = +localStorage.getItem('advl-lot-pal'); if (PALETTES[p]) pal = PALETTES[p]; } catch (e) {}
const bodies=[];let statics=[];
function box(x,y,w,h,a=0,dyn=true){const m=dyn?w*h/4000:0;return {x,y,a,vx:0,vy:0,w:0,hw:w/2,hh:h/2,im:dyn?1/m:0,iI:dyn?1/(m*(w*w+h*h)/12):0,dyn}}
function corners(b){const c=Math.cos(b.a),s=Math.sin(b.a);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([i,j])=>[b.x+i*b.hw*c-j*b.hh*s,b.y+i*b.hw*s+j*b.hh*c])}
function axes(b){const c=Math.cos(b.a),s=Math.sin(b.a);return [[c,s],[-s,c]]}
function inside(p,b){const c=Math.cos(-b.a),s=Math.sin(-b.a),dx=p[0]-b.x,dy=p[1]-b.y,lx=dx*c-dy*s,ly=dx*s+dy*c;return Math.abs(lx)<=b.hw+.5&&Math.abs(ly)<=b.hh+.5}
function collide(A,B){const ca=corners(A),cb=corners(B);let best=1e9,n=null;
  for(const ax of [...axes(A),...axes(B)]){let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const p of ca){const d=p[0]*ax[0]+p[1]*ax[1];a0=Math.min(a0,d);a1=Math.max(a1,d)}for(const p of cb){const d=p[0]*ax[0]+p[1]*ax[1];b0=Math.min(b0,d);b1=Math.max(b1,d)}
    const o=Math.min(a1,b1)-Math.max(a0,b0);if(o<=0)return null;if(o<best){best=o;n=ax}}
  if((B.x-A.x)*n[0]+(B.y-A.y)*n[1]<0)n=[-n[0],-n[1]];
  const pts=[...ca.filter(p=>inside(p,B)),...cb.filter(p=>inside(p,A))];
  const p=pts.length?pts.reduce((s,q)=>[s[0]+q[0]/pts.length,s[1]+q[1]/pts.length],[0,0]):[(A.x+B.x)/2,(A.y+B.y)/2];
  return {n,d:best,p}}
function resolve(A,B,c){const {n,d,p}=c,ra=[p[0]-A.x,p[1]-A.y],rb=[p[0]-B.x,p[1]-B.y];
  const va=[A.vx-A.w*ra[1],A.vy+A.w*ra[0]],vb=[B.vx-B.w*rb[1],B.vy+B.w*rb[0]],rv=[vb[0]-va[0],vb[1]-va[1]],vn=rv[0]*n[0]+rv[1]*n[1];
  const cr=(r,v)=>r[0]*v[1]-r[1]*v[0];
  if(vn<0){const ran=cr(ra,n),rbn=cr(rb,n),k=A.im+B.im+ran*ran*A.iI+rbn*rbn*B.iI,j=-(1+.45)*vn/k;
    A.vx-=j*n[0]*A.im;A.vy-=j*n[1]*A.im;A.w-=ran*j*A.iI;B.vx+=j*n[0]*B.im;B.vy+=j*n[1]*B.im;B.w+=rbn*j*B.iI;
    const t=[-n[1],n[0]],vt=rv[0]*t[0]+rv[1]*t[1],rat=cr(ra,t),rbt=cr(rb,t),kt=A.im+B.im+rat*rat*A.iI+rbt*rbt*B.iI;let jt=-vt/kt;const mu=.25*j;jt=Math.max(-mu,Math.min(mu,jt));
    A.vx-=jt*t[0]*A.im;A.vy-=jt*t[1]*A.im;A.w-=rat*jt*A.iI;B.vx+=jt*t[0]*B.im;B.vy+=jt*t[1]*B.im;B.w+=rbt*jt*B.iI}
  const corr=Math.max(d-.3,0)/(A.im+B.im)*.85;A.x-=n[0]*corr*A.im;A.y-=n[1]*corr*A.im;B.x+=n[0]*corr*B.im;B.y+=n[1]*corr*B.im}

const q = s => root.querySelector(s);
function layout() { W = innerWidth; H = innerHeight;
  const x0 = 196, y0 = 92, x1 = W - 44, gy = Math.round(H * .84), R = 64;
  const door = { w: 92, h: Math.min(210, (gy - y0) * .36) }; door.x = x1 - 46 - door.w; door.y = gy - door.h;
  const bush = { cx: door.x - 104, cy: gy - 36, r: 44 };
  const stall = Math.min(78, (H - gy - 30) * 1.2);
  const cloud = { cx: x0 + (x1 - x0) * .45, w: Math.min(340, (x1 - x0) * .27) };
  G = { x0, y0, x1, gy, R, door, bush, cloud, stall }; draw(); statics_(); }
const cumulus = (cx,w,yc)=>{const y=G.y0,a=w*.5;const d=`M${cx-a} ${y} C${cx-a} ${y-26} ${cx-a*.62} ${y-40} ${cx-a*.42} ${y-34} C${cx-a*.4} ${y-70} ${cx-a*.02} ${y-82} ${cx+a*.08} ${y-58} C${cx+a*.22} ${y-80} ${cx+a*.62} ${y-70} ${cx+a*.56} ${y-38} C${cx+a*.8} ${y-42} ${cx+a} ${y-22} ${cx+a} ${y} Z`;
   return `<path class="fill" d="${d}"/><path class="ln" d="${d}"/><path class="ln soft" d="M${cx-a*.5} ${y-14} q${a*.18} -12 ${a*.36} 0 M${cx+a*.06} ${y-30} q${a*.16} -12 ${a*.32} 0"/>`};
function sheet() { let s = '';
  // the sheet, pinned at all four corners, edges gently uneven from drying
  const edge = `M-128 -88 C-70 -94 40 -92 128 -86 C134 -30 133 30 128 90 C40 98 -60 97 -126 92 C-133 40 -134 -30 -128 -88 Z`;
  s += `<path d="${edge}" style="fill:color-mix(in srgb,var(--line) 7%,transparent);stroke:none"/><path class="ln" d="${edge}"/>`;
  // pins: the shank runs from the head straight into each corner
  [[-128, -88, -1, -1], [128, -86, 1, -1], [-126, 92, -1, 1], [128, 90, 1, 1]].forEach(([x, y, dx, dy]) => { const hx = x + dx * 13, hy = y + dy * 13;
    s += `<path class="ln" d="M${hx} ${hy} L${x} ${y}"/><circle class="ln" cx="${hx}" cy="${hy}" r="5.5" style="fill:color-mix(in srgb,var(--line) 30%,transparent)"/><circle cx="${hx - 1.5}" cy="${hy - 1.5}" r="1.4" style="fill:var(--line)"/><circle cx="${x}" cy="${y}" r="1.6" style="fill:var(--line)"/>`; });
  // two forms from the work: the spiked sphere and a finger anchor
  let h = ''; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; h += `M${(52 + Math.cos(a) * 11).toFixed(1)} ${(24 + Math.sin(a) * 11).toFixed(1)} L${(52 + Math.cos(a) * 17).toFixed(1)} ${(24 + Math.sin(a) * 17).toFixed(1)} `; }
  s += `<g opacity=".8"><circle class="ln" cx="52" cy="24" r="11"/><path class="ln" d="${h}"/>`;
  s += `<circle class="ln" cx="-44" cy="-24" r="13"/><circle class="ln soft" cx="-44" cy="-24" r="8"/><circle cx="-44" cy="-24" r="2.8" style="fill:var(--line)"/>` +
    [0, 2.1, 4.2].map(a => `<circle class="ln" cx="${(-44 + Math.cos(a) * 16).toFixed(1)}" cy="${(-24 + Math.sin(a) * 16).toFixed(1)}" r="2.3"/>`).join('') + '</g>';
  // carbonation: fine bubbles scattered through the sheet, some rising in loose trails, smaller toward the top
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const inside = (x, y) => x > -122 && x < 122 && y > -82 && y < 86 && Math.hypot(x - 52, y - 24) > 22 && Math.hypot(x + 44, y + 24) > 22;
  const bub = (x, y, r) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" style="fill:none;stroke:var(--line);stroke-width:.7;opacity:${(.45 + rnd() * .4).toFixed(2)}"/>`;
  for (let t = 0; t < 7; t++) { let x = -110 + rnd() * 220, y = 70 + rnd() * 14; const n = 5 + (rnd() * 7 | 0);
    for (let k = 0; k < n; k++) { if (inside(x, y)) s += bub(x, y, 2.4 - k * .16 + rnd() * .4); x += (rnd() - .5) * 7; y -= 9 + rnd() * 11; } }
  for (let k = 0; k < 70; k++) { const x = -118 + rnd() * 236, y = -80 + Math.pow(rnd(), .8) * 164; if (inside(x, y)) s += bub(x, y, .6 + rnd() * rnd() * 2.2); }
  for (let k = 0; k < 55; k++) { const x = -118 + rnd() * 236, y = -80 + rnd() * 164; if (inside(x, y)) s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.3 + rnd() * .45).toFixed(2)}" style="fill:none;stroke:var(--line);stroke-width:.5;opacity:${(.4 + rnd() * .35).toFixed(2)}"/>`; }   // the finest fizz
  return s; }
function draw() { const { x0, y0, x1, gy, R, door, bush, cloud } = G; let s = '';
  const k = R * .45;
  s += `<path class="ln" d="M${x0} ${gy} V${y0 + R} C${x0} ${y0 + k} ${x0 + k} ${y0} ${x0 + R} ${y0} H${x1 - R} C${x1 - k} ${y0} ${x1} ${y0 + k} ${x1} ${y0 + R} V${gy}"/>`;
  s += cumulus(cloud.cx, cloud.w, y0 + 18);
  s += `<path class="ln" d="M${x0} ${gy} H${x1}"/>`;
  const dd = G.stall * Math.SQRT1_2; for (let i = 0; i < 4; i++) { const x = x0 + 60 + i * 110; s += `<path class="ln dash" d="M${x} ${gy + 10} l${-dd} ${dd}"/>`; }
  const tuft = (x, h) => `<path class="ln soft" d="M${x} ${gy} q-3 ${-h * .6} -7 ${-h} M${x} ${gy} q0 ${-h * .7} 1 ${-h * 1.15} M${x} ${gy} q4 ${-h * .55} 8 ${-h * .9}"/>`;
  [x0 + 18, x0 + 64, x0 + (x1 - x0) * .3, x0 + (x1 - x0) * .46, bush.cx - 78, bush.cx - 56, bush.cx + 50, door.x - 22, door.x + door.w + 12, x1 - 14].forEach((x, i) => s += tuft(x, 9 + (i % 3) * 5));
  const b = bush, bp = []; for (let o = 0; o <= 9; o++) { const a = Math.PI * (1 + o / 9); bp.push([b.cx + Math.cos(a) * b.r * 1.25, b.cy + Math.sin(a) * b.r * .95]); }
  let d = `M${b.cx - b.r * 1.25} ${gy}`; bp.forEach((p, o) => { if (!o) return; const m = bp[o - 1], mx = (p[0] + m[0]) / 2, my = (p[1] + m[1]) / 2, nx = mx - b.cx, ny = my - b.cy, l = Math.hypot(nx, ny); d += ` Q${mx + nx / l * 15} ${my + ny / l * 15} ${p[0]} ${p[1]}`; }); d += ` L${b.cx + b.r * 1.25} ${gy}`;
  s += `<path class="fill" d="${d}Z"/><path class="ln" d="${d}"/><path class="ln soft" d="M${b.cx - 20} ${gy - 28} q10 -10 22 -4 M${b.cx + 8} ${gy - 50} q8 -6 16 0"/>`;
  const o = door, r = o.w / 2;
  s += `<path class="ln" d="M${o.x} ${gy} V${o.y + r} A${r} ${r} 0 0 1 ${o.x + o.w} ${o.y + r} V${gy}"/><path class="ln soft" d="M${o.x + 6} ${gy} V${o.y + r} A${r - 6} ${r - 6} 0 0 1 ${o.x + o.w - 6} ${o.y + r} V${gy}"/>`;
  s += `<path class="fill" d="M${o.x + 6} ${gy} V${o.y + r + 4} L${o.x - o.w * .4} ${o.y + r + 18} V${gy - 2} Z"/><path class="ln" d="M${o.x + 6} ${gy} V${o.y + r + 4} L${o.x - o.w * .4} ${o.y + r + 18} V${gy - 2} Z"/><circle class="ln" cx="${o.x - o.w * .28}" cy="${o.y + o.h * .62}" r="3"/>`;
  if (!bodies.length) { const cx = (x0 + x1) / 2, cy = (y0 + gy) / 2 + 40, sc = Math.min(1.4, (gy - y0) / 520);
    s += `<g transform="translate(${cx} ${cy}) scale(${sc})">${sheet()}</g><text x="${cx}" y="${cy + sc * 170}" text-anchor="middle" class="ld-cap">inherited pattern</text>`; }
  const sv = q('.ld-scene'); sv.setAttribute('viewBox', `0 0 ${W} ${H}`); sv.innerHTML = s; }
function statics_() { const { x0, y0, x1, gy, door, bush } = G, T = 60, cw = Math.min(W * .3, 420);
  statics = [box(x0 - T / 2, H / 2, T, H * 2, 0, false), box(x1 + T / 2, H / 2, T, H * 2, 0, false), box(W / 2, y0 - T / 2, W * 2, T, 0, false), box(W / 2, gy + T / 2, W * 2, T, 0, false),
    box(door.x + door.w / 2, door.y + door.h / 2 + 10, door.w * 1.5, door.h - 20, 0, false), box(bush.cx, bush.cy + 8, bush.r * 2.3, bush.r * 1.3, 0, false), box(bush.cx, bush.cy - 16, bush.r * 1.4, bush.r * 1.1, 0, false),
    box(236 + 170, 112 + 62, 360, 128, 0, false), box(W - Math.max(64, W * .06) - 6 - cw / 2, 112 + 56, cw + 10, 120, 0, false)]; }
/* the accent reads the background under each note */
const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true }); cv.width = 48; cv.height = 30;
function lumMap(img) { const s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * 1.05, dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  cx.clearRect(0, 0, 48, 30); cx.drawImage(img, (W - dw) / 2 / W * 48, (H - dh) / 2 / H * 30, dw / W * 48, dh / H * 30); const d = cx.getImageData(0, 0, 48, 30).data, L = new Float32Array(48 * 30);
  for (let i = 0; i < L.length; i++) L[i] = (.2126 * d[i * 4] + .7152 * d[i * 4 + 1] + .0722 * d[i * 4 + 2]) / 255; return L; }
function tone(force) { if (!lum) return; for (const b of bodies) { const gx = Math.max(0, Math.min(47, Math.floor(b.x / W * 48))), gy = Math.max(0, Math.min(29, Math.floor(b.y / H * 30)));
  const l = lum[gy * 48 + gx] * .7, light = l > .32, key = light ? 1 : 0; if (!force && b.key === key && Math.abs((b.l || 0) - l) < .04) continue; b.key = key; b.l = l;
  const L = light ? Math.max(18, 34 - (l - .32) * 40) : Math.min(88, 72 + (.32 - l) * 40);
  const P = eff || pal; b.el.style.setProperty('--a', `hsl(${P.hue} ${P.sat}% ${L.toFixed(0)}%)`); b.el.style.setProperty('--t', light ? '#1b1236' : '#fff'); b.el.style.setProperty('--ts', light ? 'rgb(255 255 255/.45)' : 'rgb(10 0 30/.55)'); } }
function showBg(k) { if (!root) return; bi = (k + BGS.length) % BGS.length; const it = BGS[bi], img = new Image();
  img.onload = () => { if (!root) return; lum = lumMap(img); low = lowContrast(img); applyPal(); const layers = root.querySelectorAll('.ld-bg'), back = layers[1 - front]; back.style.backgroundImage = `url(${it.src})`; back.classList.add('on'); layers[front].classList.remove('on'); front = 1 - front; tone(true); };
  img.src = it.src; }
/* chartreuse lines can vanish on bright, yellow-green backgrounds: there, the lot borrows Bloom until the background changes */
const relL = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
function lowContrast(img) { const d = cx.getImageData(0, 0, 48, 30).data; let r = 0, g = 0, b = 0, n = 0;
  for (let y = 4; y < 28; y++) for (let x = 3; x < 46; x++) { const i = (y * 48 + x) * 4; r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }, bl = (.2126 * lin(r / n) + .7152 * lin(g / n) + .0722 * lin(b / n)) * .72 + .004;
  const ll = relL('#CFF002'); if ((Math.max(ll, bl) + .05) / (Math.min(ll, bl) + .05) < 2.6) return true;
  // or when much of the picture sits in chartreuse's own neighbourhood: bright yellows and yellow-greens
  let near = 0; for (let i = 0; i < d.length; i += 4) { const R = d[i] / 255, Gn = d[i + 1] / 255, B = d[i + 2] / 255, mx = Math.max(R, Gn, B), mn = Math.min(R, Gn, B), c = mx - mn;
    if (mx < .55 || c < .3) continue; let hh = mx === R ? ((Gn - B) / c) % 6 : mx === Gn ? (B - R) / c + 2 : (R - Gn) / c + 4; hh *= 60; if (hh < 0) hh += 360; if (hh > 40 && hh < 110) near++; }
  return near / (d.length / 4) > .22; }
function applyPal() { eff = (low && pal.line === '#CFF002') ? PALETTES[2] : pal; root.style.setProperty('--line', eff.line); root.style.setProperty('--tint', eff.tint);
  root.querySelectorAll('.ld-pal button').forEach((b, i) => b.setAttribute('aria-pressed', String(PALETTES[i] === pal))); tone(true); }
/* the notes */
let drag = null;
function addNote(m, x, y) { const el = document.createElement('div'); el.className = 'ld-note' + (m.fresh ? ' new' : ''); el.dataset.id = m.id;
  const when = new Date(m.ts).toLocaleString('en-US', { month: 'short', day: 'numeric' });
  el.innerHTML = `<p>${esc(m.text)}</p><small>${esc(m.name || 'anonymous')} · ${when}${m.del ? ' <button type="button" class="ld-del" aria-label="Delete this message">delete</button>' : ''}</small>`;
  q('.ld-world').appendChild(el); const r = el.getBoundingClientRect();
  const b = box(x, y, r.width, r.height, (Math.random() - .5) * .3, true); b.el = el; b.m = m; b.ph = Math.random() * 6.28; b.vx = (Math.random() - .5) * 30; b.vy = (Math.random() - .5) * 30; b.w = (Math.random() - .5) * .2; bodies.push(b);
  el.addEventListener('pointerdown', e => { if (e.target.closest('.ld-del')) return; el.setPointerCapture(e.pointerId); const c = Math.cos(-b.a), s = Math.sin(-b.a), dx = e.clientX - b.x, dy = e.clientY - b.y; drag = { b, lx: dx * c - dy * s, ly: dx * s + dy * c, mx: e.clientX, my: e.clientY }; });
  el.addEventListener('pointermove', e => { if (drag && drag.b === b) { drag.mx = e.clientX; drag.my = e.clientY; } });
  el.addEventListener('pointerup', () => { drag = null; }); el.addEventListener('pointercancel', () => { drag = null; });
  const del = el.querySelector('.ld-del'); if (del) del.onclick = () => delFn && delFn(m.u, m.id);
  return b; }
function sync(msgs) { if (!root) return; const had = bodies.length, ids = new Set(msgs.map(m => m.id));
  for (let i = bodies.length - 1; i >= 0; i--) if (!ids.has(bodies[i].m.id)) { bodies[i].el.remove(); bodies.splice(i, 1); }
  const have = new Set(bodies.map(b => b.m.id)), { x0, x1, y0, gy, door } = G;
  msgs.forEach((m, i) => { if (have.has(m.id)) return;
    const fresh = had > 0 || (root._first === false); m.fresh = fresh && i === msgs.length - 1;
    if (m.fresh) { root.querySelectorAll('.ld-note.new').forEach(e => e.classList.remove('new')); const b = addNote(m, door.x - 150, door.y + door.h * .5); b.vx = -260; b.vy = -60; b.w = -.4; }
    else addNote(m, x0 + 90 + ((i * 197) % Math.max(200, x1 - x0 - 320)), y0 + 190 + ((i * 113) % Math.max(120, gy - y0 - 280))); });
  root._first = false; q('.ld-n').textContent = bodies.length; if (!had !== !bodies.length) draw(); tone(true); }
let last = 0, t = 0, tt = 0;
function step(dt) { t += dt;
  for (const b of bodies) { if (!RM) { b.vx += Math.sin(t * .37 + b.hw * .1 + b.ph) * 6 * dt; b.vy += Math.cos(t * .29 + b.hh * .1 + b.ph) * 6 * dt; }
    b.vx *= .995; b.vy *= .995; b.w *= .985; b.w += (-Math.sin(b.a)) * .5 * dt; const sp = Math.hypot(b.vx, b.vy); if (sp > 900) { b.vx *= 900 / sp; b.vy *= 900 / sp; } }
  if (drag) { const b = drag.b, c = Math.cos(b.a), s = Math.sin(b.a), px = b.x + drag.lx * c - drag.ly * s, py = b.y + drag.lx * s + drag.ly * c, ex = drag.mx - px, ey = drag.my - py, r = [px - b.x, py - b.y];
    const fx = ex * 60 - b.vx * 7, fy = ey * 60 - b.vy * 7; b.vx += fx * dt; b.vy += fy * dt; b.w += (r[0] * fy - r[1] * fx) * b.iI * dt * .02; b.w *= .9; }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) { const A = bodies[i], B = bodies[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, R = (A.hw + B.hw) * 1.15;
    if (d < R) { const f = (R - d) / R * 40 * dt; A.vx -= dx / d * f; A.vy -= dy / d * f; B.vx += dx / d * f; B.vy += dy / d * f; } }
  for (const b of bodies) { b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.w * dt; }
  for (let it = 0; it < 5; it++) for (let i = 0; i < bodies.length; i++) { const A = bodies[i]; for (const S of statics) { const c = collide(A, S); if (c) resolve(A, S, c); }
    for (let j = i + 1; j < bodies.length; j++) { const c = collide(A, bodies[j]); if (c) resolve(A, bodies[j], c); } } }
function frame(now) { if (!root || !root.isConnected) { stop(); return; } const dt = Math.min(.033, (now - last) / 1000 || 0); last = now; for (let k = 0; k < 3; k++) step(dt / 3);
  for (const b of bodies) b.el.style.transform = `translate(${b.x - b.hw}px,${b.y - b.hh}px) rotate(${b.a}rad)`;
  if ((tt += dt) > .4) { tt = 0; tone(false); } raf = requestAnimationFrame(frame); }
let idleT = 0, IDLE = 120000;
const IDLE_EV = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'focusin'];
function wake() { document.body.classList.remove('lot-idle'); clearTimeout(idleT); idleT = setTimeout(doze, IDLE); }
function doze() { document.body.classList.add('lot-idle'); }
function idleOn() { IDLE_EV.forEach(e => addEventListener(e, wake, { passive: true })); wake(); }
function idleOff() { IDLE_EV.forEach(e => removeEventListener(e, wake)); clearTimeout(idleT); idleT = 0; document.body.classList.remove('lot-idle'); }
function stop() { idleOff(); cancelAnimationFrame(raf); raf = 0; clearInterval(timer); timer = 0; removeEventListener('resize', onResize); root = null; bodies.length = 0; }
function onResize() { if (!root) return; layout(); for (const b of bodies) { b.x = Math.max(G.x0 + b.hw, Math.min(G.x1 - b.hw, b.x)); b.y = Math.max(G.y0 + b.hh, Math.min(G.gy - b.hh, b.y)); } }
window.ADVL_LOT = {
  mount(view, compose) { stop(); root = document.createElement('div'); root.className = 'lotd'; root._first = true;
    root.innerHTML = `<div class="ld-bg"></div><div class="ld-bg"></div><div class="ld-shade"></div><svg class="ld-scene" aria-hidden="true"></svg>
      <div class="ld-head"><p class="lvl">L5 · Parking Lot</p><h1 class="big">Parking Lot</h1><p class="ld-count"><b class="ld-n">0</b> messages parked</p></div>
      <div class="ld-world" aria-label="Messages" aria-live="polite"></div><div class="ld-compose"></div>
      <div class="ld-tools"><div class="ld-pal" role="group" aria-label="Palette">${PALETTES.map((p, i) => `<button type="button" title="${p.name}" aria-label="${p.name} palette">${p.sw.map(c => `<i style="background:${c}"></i>`).join('')}</button>`).join('')}</div></div>`;
    view.appendChild(root); compose.forEach(n => n && q('.ld-compose').appendChild(n));
    q('.ld-pal').onclick = e => { const b = e.target.closest('button'); if (!b) return; pal = PALETTES[[...q('.ld-pal').children].indexOf(b)]; try { localStorage.setItem('advl-lot-pal', PALETTES.indexOf(pal)); } catch (e) {} applyPal(); };
    layout(); applyPal(); showBg(Math.floor(Math.random() * BGS.length)); if (!RM) timer = setInterval(() => showBg(bi + 1), 60000);
    addEventListener('resize', onResize); idleOn(); last = performance.now(); raf = requestAnimationFrame(frame); },
  sync, setDelete(fn) { delFn = fn; }, next() { showBg(bi + 1); }, _idle(ms) { IDLE = ms; wake(); }
};
})();
