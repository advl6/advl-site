/* advl auditory (project 18) · the interface. Casual (Stage) and Complex (Console), desktop and phone.
   The sound engine, instruments and storage live in auditory-core.js, loaded first. */
(() => {
'use strict';
if (window.ADVL_AUD) return;

let X = null;
const loadCore = () => window.AUDX ? Promise.resolve(window.AUDX) : new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'auditory-core.js'; s.onload = () => window.AUDX ? ok(window.AUDX) : no(); s.onerror = no; document.head.appendChild(s); });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const phone = () => matchMedia('(max-width:1023px)').matches;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const S = () => X.S;
const ACC = '#CFF002';

/* ---------- icons ---------- */
const I = {
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z" fill="currentColor"/></svg>',
  rec: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" fill="currentColor"/></svg>',
  metro: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M9 3h6l4 18H5z"/><path d="M12 17l5-10"/><path d="M8 17h8"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  hum: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 12c2-6 4 6 6 0s4 6 6 0 4 6 6 0"/></svg>',
  move: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/></svg>',
  film: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/></svg>',
  up: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg>',
  chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  exp: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ---------- interface state (not saved) ---------- */
let root = null, pop = null, sheet = null, dim = null;
const ui = { sessPlay: null, voices: false, tab: 'rec', sheet: null, rec: null, hum: null, humBars: 1, humTo: 'handpan', loopBars: 2, move: { path: [], bars: 1, to: 'theremin' }, moveRec: false, saving: false, exp: false, confirm: null, dd: null, msg: { lib: '', mx: '', rec: '' }, err: { lib: false, mx: false, rec: false } };

/* ---------- small builders ---------- */
const fmtDur = s => { s = s > 0 ? Math.max(1, Math.round(s)) : 0; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const fmtMB = b => `${(b / 1048576).toFixed(1)} MB`;
const sel = () => X.byId(S().sel) || S().layers[0] || null;
const col = L => X.colorOf(L);
const isMel = L => L && L.kind === 'synth' && !!X.V[L.voice].root;
function waveD(peaks, w, h, vertical) {
  if (!peaks || !peaks.length) return ''; const n = peaks.length, bw = (vertical ? h : w) / n; let d = '';
  for (let i = 0; i < n; i++) { const s = Math.max(1.5, peaks[i] * (vertical ? w : h) * 0.92);
    d += vertical ? `M${((w - s) / 2).toFixed(1)} ${(i * bw + bw * .2).toFixed(1)}h${s.toFixed(1)}v${(bw * .6).toFixed(1)}h-${s.toFixed(1)}z` : `M${(i * bw + bw * .2).toFixed(1)} ${((h - s) / 2).toFixed(1)}h${(bw * .6).toFixed(1)}v${s.toFixed(1)}h-${(bw * .6).toFixed(1)}z`; }
  return d;
}
const cellCls = (on, i) => 'cell' + (on ? ' on' + (i % 4 ? ' d' : '') : (Math.floor(i / 4) % 2 ? ' b' : ''));
const steps = (L, from = 0, n = L.steps.length) => `<div class="st">${L.steps.slice(from, from + n).map((on, j) => { const i = from + j; return `<button type="button" class="${cellCls(on, i)}" data-act="cell" data-l="${L.id}" data-i="${i}" aria-pressed="${on}" aria-label="${esc(X.nameOf(L))}, step ${i + 1}"></button>`; }).join('')}</div>`;
const pct = (k, v) => /^l\.fade/.test(k) ? `${(+v).toFixed(1)} s` : `${Math.round(v)}%`;
function slider(label, key, v, c, L, o = {}) {
  const max = o.max ?? 100, step = o.step ?? 1, f = (v / max) * 100;
  return `<label class="sl${o.cls ? ' ' + o.cls : ''}"><span><em>${label}</em><b>${pct(key, v)}</b></span><input type="range" min="0" max="${max}" step="${step}" value="${v}" data-in="${key}"${L ? ` data-l="${L.id}"` : ''} style="--c:${c};--fill:${f}%"></label>`;
}
function knob(label, key, v, c, L, size = 40) {
  const r = size / 2 - 5, C = 2 * Math.PI * r;
  return `<div class="kn" role="slider" tabindex="0" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v)}" data-kn="${key}"${L ? ` data-l="${L.id}"` : ''} style="--c:${c}"><svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgb(255 255 255/.18)" stroke-width="3" stroke-dasharray="${C * .75} ${C}" transform="rotate(135 ${size / 2} ${size / 2})" stroke-linecap="round"/><circle data-arc cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="${C * .75 * v / 100} ${C}" transform="rotate(135 ${size / 2} ${size / 2})" stroke-linecap="round" style="filter:drop-shadow(0 0 3px ${c})"/><text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="${size > 40 ? 11 : 10}" fill="#EEF3EC">${Math.round(v)}</text></svg><span>${label}</span></div>`;
}
function ring(label, key, v) {
  const r = 26, C = 2 * Math.PI * r;
  return `<label class="ring"><svg viewBox="0 0 70 70" aria-hidden="true"><circle cx="35" cy="35" r="${r}" fill="none" stroke="rgb(255 255 255/.2)" stroke-width="4" stroke-dasharray="${C * .75} ${C}" transform="rotate(135 35 35)" stroke-linecap="round"/><circle data-arc cx="35" cy="35" r="${r}" fill="none" stroke="var(--t)" stroke-width="4" stroke-dasharray="${C * .75 * v / 100} ${C}" transform="rotate(135 35 35)" stroke-linecap="round" style="filter:drop-shadow(0 0 4px var(--t))"/><text x="35" y="40" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="13" fill="#EEF3EC">${v}</text></svg><span>${label}</span><input type="range" min="0" max="100" value="${v}" data-in="${key}" aria-label="${label}"></label>`;
}
function dd(id, label, val, opts, c) {
  const open = ui.dd === id;
  return `<div class="dd${open ? ' open' : ''}" style="--c:${c}"><span class="k">${label}</span><button type="button" data-act="dd" data-v="${id}" aria-haspopup="listbox" aria-expanded="${open}">${esc(val)}${I.chev}</button>${open ? `<ul role="listbox">${opts.map(o => `<li><button type="button" role="option" data-act="ddpick" data-v="${id}" data-o="${esc(o)}" aria-selected="${o === val}">${esc(o)}</button></li>`).join('')}</ul>` : ''}</div>`;
}
const chips = (act, arr, cur, c, extra = '') => `<div class="chips" style="--c:${c}">${arr.map(x => `<button type="button" data-act="${act}" data-v="${esc(x)}"${extra} aria-pressed="${x === cur}">${esc(x)}</button>`).join('')}</div>`;

/* ---------- the casual / complex dial (drawn like the homepage dial) ---------- */
function modeDial() {
  const cx = S().mode === 'complex';
  return `<button type="button" class="mode-dial" data-act="mode" role="switch" aria-checked="${cx}" aria-label="Mode: ${cx ? 'Complex' : 'Casual'}. Switch to ${cx ? 'Casual' : 'Complex'}"><svg viewBox="0 0 240 240" aria-hidden="true">
    <circle cx="120" cy="120" r="96" fill="none" stroke="rgb(255 255 255/.4)" stroke-width="1.4"/><circle cx="120" cy="120" r="60" fill="none" stroke="${ACC}" stroke-width="1.4" stroke-dasharray="2 4"/>
    <g class="rot" style="transform:rotate(${cx ? 180 : 0}deg)"><path d="M120 108v24M108 120h24" stroke="${ACC}" stroke-width="1.8"/><line x1="120" y1="64" x2="120" y2="40" stroke="${ACC}" stroke-width="1.6"/></g>
    <circle cx="120" cy="24" r="${cx ? 6 : 10}" ${cx ? 'fill="none" stroke="#fff" stroke-width="1.6"' : `fill="${ACC}" style="filter:drop-shadow(0 0 8px ${ACC})"`}/>
    <circle cx="120" cy="216" r="${cx ? 10 : 6}" ${cx ? `fill="${ACC}" style="filter:drop-shadow(0 0 8px ${ACC})"` : 'fill="none" stroke="#fff" stroke-width="1.6"'}/>
    <text x="138" y="30" font-family="JetBrains Mono, monospace" font-size="17" letter-spacing="2" fill="${cx ? '#fff' : ACC}">CASUAL</text>
    <text x="138" y="222" font-family="JetBrains Mono, monospace" font-size="17" letter-spacing="2" fill="${cx ? ACC : '#fff'}">COMPLEX</text></svg></button>`;
}

/* ---------- transport ---------- */
const FEELS = [['Chill', 90], ['Hip-hop', 95], ['House', 124], ['Techno', 132], ['Drum & bass', 174]];
function transport() {
  const s = S(), pl = X.SEQ.playing;
  return `<div class="tr">
    <button type="button" class="play${pl ? ' on' : ''}" data-act="play" aria-label="${pl ? 'Stop' : 'Play'}">${pl ? I.stop : I.play}</button>
    <div class="big"><b data-bpm>${s.bpm}</b><div class="pm"><button type="button" data-act="bpm" data-v="1" aria-label="Faster">+</button><button type="button" data-act="bpm" data-v="-1" aria-label="Slower">−</button></div><span class="k">BPM</span></div>
    <button type="button" class="metro" data-act="metro" aria-pressed="${!!s.metro}">${I.metro}<span><b>Metronome</b><em>${s.metro ? 'On' : 'Off'} · count-in 1 bar when recording</em></span></button>
    <div class="feel" role="group" aria-label="Pick a feel">${FEELS.map(([l, b]) => `<button type="button" data-act="feel" data-v="${b}" aria-pressed="${s.bpm === b}">${esc(l)} ${b}</button>`).join('')}</div>
    <span class="grow"></span>
    <button type="button" class="pill sm" data-act="undo">Undo</button><button type="button" class="pill sm clr${ui.clearArm ? ' arm' : ''}" data-act="clearall">${ui.clearArm ? 'Tap again to clear everything' : 'Clear all'}</button>${isFree() ? '<button type="button" class="pill sm" data-act="resetwin">Reset layout</button>' : ''}<div class="rings">${ring('Bass', 'g.bass', s.bass)}${ring('Volume', 'g.vol', s.vol)}</div>
    ${modeDial()}
  </div>`;
}

/* ---------- the whole piece ---------- */
function piece() {
  const s = S(), T = X.totalSteps(), secs = (s.end - s.start) * X.stepDur();
  return `<div class="pviz">
    <div class="vhead"><span class="blh">The whole piece</span><span class="k" data-meta>${s.bars} bars · ${fmtDur(secs)} between the markers · ${s.bpm} BPM</span><span class="grow"></span>${sessBtn()}
      <div class="len" role="group" aria-label="Length in bars"><span class="k">Length</span>${[2, 4, 8, 16, 32].map(b => `<button type="button" data-act="bars" data-v="${b}" aria-pressed="${s.bars === b}">${b}</button>`).join('')}<span class="k">bars</span><button type="button" class="pill sm" data-act="extend">+ Extend</button></div></div>
    <div class="ruler" aria-hidden="true">${Array.from({ length: s.bars }, (_, i) => (s.bars <= 16 || i % 4 === 0) ? `<span style="left:${i / s.bars * 100}%">${i + 1}</span>` : '').join('')}</div>
    <div class="vbox${X.SESS.mr ? ' recording' : ''}" data-vbox data-scrub><canvas data-viz aria-hidden="true"></canvas><div class="fxw" data-fx>${fadeSvg()}</div>
      <span class="dimL" style="width:${s.start / T * 100}%"></span><span class="dimR" style="left:${s.end / T * 100}%"></span>
      <button type="button" class="mk" data-mk="start" style="left:${s.start / T * 100}%" aria-label="Start marker, bar ${Math.floor(s.start / 16) + 1}"><b>START</b></button>
      <button type="button" class="mk end" data-mk="end" style="left:${s.end / T * 100}%" aria-label="End marker, bar ${Math.ceil(s.end / 16)}"><b>END</b></button>
      ${frames()}<span class="ghost" data-ghost hidden><span></span></span>
      <span class="ph" data-ph></span></div>${fadesRow()}</div>`;
}
/* ---------- whole-piece fades, live sessions ---------- */
const FR = { 0: '', .25: '¼', .5: '½', .75: '¾' };
const barsLabel = b => { if (!b) return 'off'; const w = Math.floor(b), f = FR[Math.round((b - w) * 4) / 4] || ''; return `${w || ''}${f} bar${b > 1 ? 's' : ''}`; };
function fadeSvg() {
  const T = X.totalSteps(), { start, end, a, b } = X.fadeLens(), sh = 'fill="rgb(24 16 20/.7)"', ln = `fill="none" stroke="${ACC}" stroke-width="1.6" vector-effect="non-scaling-stroke"`;
  const part = (x0, x1) => { if (x1 - x0 < 0.01) return ''; let top = '', bot = '', et = '', eb = ''; const N = 48;
    for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N, g = Math.min(1, X.shapeAt(x).g), px = ((start + x) / T * 1000).toFixed(1); top += `L${px} ${(50 - 50 * g).toFixed(1)}`; bot += `L${px} ${(50 + 50 * g).toFixed(1)}`; et += (i ? 'L' : 'M') + `${px} ${(50 - 48 * g).toFixed(1)}`; eb += (i ? 'L' : 'M') + `${px} ${(50 + 48 * g).toFixed(1)}`; }
    const p0 = ((start + x0) / T * 1000).toFixed(1), p1 = ((start + x1) / T * 1000).toFixed(1);
    return `<path d="M${p0} 0${top}L${p1} 0Z" ${sh}/><path d="M${p0} 100${bot}L${p1} 100Z" ${sh}/><path d="${et}" ${ln}/><path d="${eb}" ${ln}/>`; };
  return `<svg class="fx" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">${part(0, a)}${part(end - start - b, end - start)}</svg>`;
}
function framePos(which) { const T = X.totalSteps(), { start, end, a, b } = X.fadeLens(); return which === 'in' ? [(start + a) / T * 100, a ? 0 : 14] : [(end - b) / T * 100, b ? 0 : -14]; }
function frames() {
  const S_ = S();
  return ['in', 'out'].map(w => { const [l, off] = framePos(w), f = w === 'in' ? S_.fin : S_.fout;
    return `<div class="fr" data-fr="${w}" style="left:calc(${l}% + ${off}px)" role="slider" tabindex="0" aria-label="Fade ${w} length" aria-valuetext="${barsLabel(f.bars)}"><span class="grip" aria-hidden="true"></span><span class="tab">FADE ${w.toUpperCase()} · ${barsLabel(f.bars).toUpperCase()}</span></div>`; }).join('');
}
function maxFade() { const s = S(); return Math.max(0.25, Math.min(8, Math.floor((s.end - s.start) / 16 * 4) / 4)); }
const fadeVal = f => `${barsLabel(f.bars)}${f.bars ? ` · ${(f.bars * 16 * X.stepDur()).toFixed(1)} s` : ''}`;
function fadeSlider(w) { const f = w === 'in' ? S().fin : S().fout, mx = maxFade(), v = Math.min(f.bars, mx);
  return `<label class="sl"><span><em>Fade ${w} length</em><b>${fadeVal(f)}</b></span><input type="range" min="0" max="${mx}" step="0.25" value="${v}" data-in="f.${w}" style="--c:${ACC};--fill:${v / mx * 100}%"></label>`; }
function fadesRow() {
  const s = S();
  return `<div class="fades"><div class="fade1">${dd('fi:x', 'Fade in · type', s.fin.type, X.FADE_IN, ACC)}${fadeSlider('in')}</div>
    <div class="fade1">${dd('fo:x', 'Fade out · type', s.fout.type, X.FADE_OUT, ACC)}${fadeSlider('out')}</div></div>`;
}
function updateFades() {
  [root].forEach(r => { if (!r) return;
    r.querySelectorAll('[data-fx]').forEach(el => { el.innerHTML = fadeSvg(); });
    r.querySelectorAll('[data-fr]').forEach(el => { const w = el.dataset.fr, [l, off] = framePos(w), f = w === 'in' ? S().fin : S().fout; el.style.left = `calc(${l}% + ${off}px)`; el.querySelector('.tab').textContent = `FADE ${w.toUpperCase()} · ${barsLabel(f.bars).toUpperCase()}`; el.setAttribute('aria-valuetext', barsLabel(f.bars)); });
    ['in', 'out'].forEach(w => r.querySelectorAll(`[data-in="f.${w}"]`).forEach(o => { const f = w === 'in' ? S().fin : S().fout; if (document.activeElement !== o) o.value = f.bars; o.style.setProperty('--fill', f.bars / +o.max * 100 + '%'); const b = o.closest('label').querySelector('span b'); if (b) b.textContent = fadeVal(f); })); });
}
const sessTime = () => fmtDur((Date.now() - X.SESS.t0) / 1000);
function sessBtn() {
  return X.SESS.mr ? `<span class="recstrip">REC <b data-rectime>${sessTime()}</b> · recording everything you hear</span><button type="button" class="pill sm rec-on" data-act="sess"><i></i>Stop &amp; save session</button>`
    : `<button type="button" class="pill sm rec-live" data-act="sess"><i></i>Start recording live mix session</button>`;
}
function sessions() {
  const ss = X.LIB.files.filter(f => f.origin === 'session').slice().reverse(), used = new Set(S().layers.filter(L => L.kind === 'audio').map(L => L.file));
  const live = X.SESS.mr ? `<div class="file live"><span class="fic">${I.rec}</span><div><b>Session ${ss.length + 1}</b><span class="k"><span data-rectime>${sessTime()}</span> so far · ${X.SESS.bpm} BPM</span></div><span class="acts"><span class="k" style="color:#FF8A7E">Recording…</span></span></div>` : '';
  return `<div class="sess"><div class="row" style="margin-top:14px"><span class="blh">Live sessions</span><span class="grow"></span><span class="k">Saved in this browser</span></div>${live}
    ${ss.map(f => `<div class="file"><span class="fic">${I.rec}</span><div><b title="${esc(f.name)}">${esc(f.name)}</b><span class="k">${fmtDur(f.dur)}${f.bpm ? ` · ${f.bpm} BPM` : ''} · ${fmtMB(f.size)}</span></div>
      <span class="acts"><button type="button" class="add sec" data-act="sessplay" data-v="${f.id}">${ui.sessPlay && ui.sessPlay.id === f.id ? '■ Stop' : '▶ Play'}</button><button type="button" class="add sec" data-act="sesswav" data-v="${f.id}">WAV</button>${used.has(f.id) ? '<span class="k" style="color:var(--acc)">In mix</span>' : `<button type="button" class="add" data-act="addfile" data-v="${f.id}">+ Layer</button>`}${ui.confirm === f.id ? `<button type="button" class="add" data-act="delfile" data-v="${f.id}">Remove</button>` : `<button type="button" class="x" data-act="askdel" data-v="${f.id}" aria-label="Remove ${esc(f.name)}">×</button>`}</span></div>`).join('')}
    ${!ss.length && !live ? '<p class="k">Press “Start recording live mix session” on the whole piece to record what you play.</p>' : ''}</div>`;
}

/* ---------- layers ---------- */
function preview(L) {
  if (L.hidden) return '<span class="k" style="color:var(--dim)">Hidden · not playing</span>';
  if (L.kind === 'audio' && L.mode === 'loop') { const f = X.fileById(L.file); return f ? `<div class="clip"><svg viewBox="0 0 600 22" preserveAspectRatio="none" aria-hidden="true"><path d="${waveD(f.peaks, 600, 22)}"/></svg></div>` : '<span class="k" style="color:#FFB4A0">File missing</span>'; }
  return steps(L, 0, 16);
}
function clipBig(L, f) {
  const t = L.trim;
  return `<div class="clip big" data-clip="${L.id}"><svg viewBox="0 0 600 52" preserveAspectRatio="none" aria-hidden="true"><path d="${waveD(f.peaks, 600, 52)}"/></svg>
    <span class="shade" style="left:0;width:${t[0] * 100}%"></span><span class="shade" style="right:0;width:${(1 - t[1]) * 100}%"></span>
    <span class="trim" data-trim="0" style="left:${t[0] * 100}%" role="slider" tabindex="0" aria-label="Start of the clip" aria-valuenow="${Math.round(t[0] * 100)}"></span><span class="trim" data-trim="1" style="left:${t[1] * 100}%" role="slider" tabindex="0" aria-label="End of the clip" aria-valuenow="${Math.round(t[1] * 100)}"></span></div>`;
}
function layerBody(L) {
  const c = col(L);
  if (L.kind === 'audio') {
    const f = X.fileById(L.file);
    if (!f) return `<p class="msg err">This file isn’t in this browser’s library any more. Remove the layer, or upload the file again.</p><div class="row"><button type="button" class="pill sm" data-act="remove" data-l="${L.id}">Remove layer</button></div>`;
    return `${clipBig(L, f)}<div class="row"><div class="seg" style="--c:${c}" role="group" aria-label="How it plays"><button type="button" data-act="amode" data-l="${L.id}" data-v="loop" aria-pressed="${L.mode === 'loop'}">Loop</button><button type="button" data-act="amode" data-l="${L.id}" data-v="steps" aria-pressed="${L.mode === 'steps'}">On steps</button></div><button type="button" class="pill sm" data-act="hear" data-l="${L.id}">Hear it</button></div>
      ${L.mode === 'steps' ? steps(L) : ''}
      <div class="g2">${slider('Pitch', 'p.pitch', L.p.pitch, c, L)}${slider('Volume', 'l.vol', L.vol, c, L)}</div>
      <div class="g2">${slider('Fade in', 'l.fadeIn', L.fadeIn, c, L, { max: 8, step: 0.1 })}${slider('Fade out', 'l.fadeOut', L.fadeOut, c, L, { max: 8, step: 0.1 })}</div>
      <div class="adv">${movePad(L, 110)}</div>${extras(L)}
      <div class="row"><span class="grow"></span><button type="button" class="pill sm" data-act="remove" data-l="${L.id}">Remove layer</button></div>`;
  }
  const D = X.V[L.voice];
  return `<div class="row" style="align-items:flex-end;gap:14px">${dd('st:' + L.id, 'Sound style', L.style, Object.keys(D.styles), c)}<button type="button" class="pill sm" data-act="newsound" data-l="${L.id}">New sound from scratch</button></div>
    <span class="k">Presets</span>${chips('preset', Object.keys(D.presets), L.preset, c, ` data-l="${L.id}"`)}
    ${steps(L)}
    <div class="g3">${slider('Pitch', 'p.pitch', L.p.pitch, c, L)}${slider('Length', 'p.length', L.p.length, c, L)}${slider('Volume', 'l.vol', L.vol, c, L)}</div>
    <div class="g2">${slider('Fade in', 'l.fadeIn', L.fadeIn, c, L, { max: 8, step: 0.1 })}${slider('Fade out', 'l.fadeOut', L.fadeOut, c, L, { max: 8, step: 0.1 })}</div>
    ${isMel(L) ? `<div class="adv">${movePad(L, 110)}</div>` : ''}${extras(L)}
    <div class="row"><span class="grow"></span><button type="button" class="pill sm" data-act="remove" data-l="${L.id}">Remove layer</button></div>`;
}
function layerRow(L) {
  const c = col(L), open = L.open && !L.hidden, nm = X.nameOf(L), f = L.kind === 'audio' ? X.fileById(L.file) : null;
  const sub = L.kind === 'audio' ? `${f && f.from ? I.film : ''}${L.mode === 'loop' ? 'Loop' : 'On steps'}${f ? ' · ' + fmtDur(f.dur) : ''}` : esc(L.style) + (L.origin === 'hum' ? ' · from humming' : L.origin === 'move' ? ' · from movement' : '');
  return `<div class="ly${open ? ' open' : ''}${L.hidden ? ' off' : ''}${S().sel === L.id ? ' sel' : ''}" style="--c:${c}" data-ly="${L.id}">
    <div class="lh"><button type="button" class="dash" data-dash="${L.id}" aria-pressed="${L.hidden}" aria-label="${esc(nm)}: tap to ${L.hidden ? 'show' : 'hide'}, drag to reorder"><i></i></button>
      <button type="button" class="nm" data-act="select" data-l="${L.id}"><b title="${esc(nm)}">${esc(nm)}</b><span>${sub}</span></button>
      <div class="prev">${open ? '<span class="k hint">' + (L.kind === 'audio' ? 'Your audio' : 'Tap squares to place hits') + '</span>' : preview(L)}</div>
      <button type="button" class="ex" data-act="open" data-l="${L.id}" aria-expanded="${open}" aria-label="${open ? 'Close' : 'Open'} ${esc(nm)}">${I.chev}</button></div>
    ${open ? `<div class="body">${layerBody(L)}</div>` : ''}</div>`;
}
function layerList() {
  const s = S(); X.sortLayers();
  return X.GROUPS.map(([g, label]) => { const ls = s.layers.filter(L => X.groupOf(L) === g); if (!ls.length) return ''; return `<div class="gh" data-group="${g}"><span>${label}</span><i></i><span class="k">${ls.length}</span></div>` + ls.map(layerRow).join(''); }).join('');
}
function voicesMenu() {
  if (!ui.voices) return '';
  const g = (name, keys) => `<span class="k vg">${name}</span>` + keys.map(k => `<button type="button" data-act="addsynth" data-v="${k}" style="--c:${X.V[k].c}">${X.V[k].n}</button>`).join('');
  return `<div class="voices">${g('Drums', ['kick', 'snare', 'clap', 'hat', 'kit'])}${g('Bass & melody', ['bass', 'theremin', 'handpan', 'kalimba', 'marimba', 'steel', 'bowl', 'glass', 'pluck', 'choir', 'bell', 'pad'])}</div>`;
}
function layersHead() {
  return `<div class="row"><span class="blh">Layers · ${S().layers.length}</span><span class="grow"></span><button type="button" class="pill acc sm xp" data-act="expand">${I.exp}Expand</button><button type="button" class="pill sm" data-act="voices" aria-expanded="${ui.voices}">+ Add layer</button><button type="button" class="pill sm" data-act="surprise">Surprise me</button></div>${voicesMenu()}`;
}

/* ---------- movement pad: across = the piece, up/down = pitch ---------- */
function autoPath(L, w, h) {
  if (!L.auto) return ''; const n = L.auto.length; let d = '';
  L.auto.forEach((v, i) => { if (v === null || v === undefined) return; d += (d && L.auto[i - 1] != null ? 'L' : 'M') + (i / (n - 1) * w).toFixed(1) + ' ' + (h / 2 - v * h * 0.45).toFixed(1); });
  return d;
}
function movePad(L, h = 150, label) {
  const c = col(L), w = 600, s = S(), T = X.totalSteps();
  const ticks = Array.from({ length: s.bars + 1 }, (_, i) => `<line x1="${i / s.bars * w}" y1="0" x2="${i / s.bars * w}" y2="${h}" stroke="rgb(255 255 255/${i % 4 ? .07 : .18})" vector-effect="non-scaling-stroke"/>`).join('');
  return `<div class="pad" style="--c:${c}"><div class="padh"><span class="blh" style="color:${c}">${I.move}${label || 'Pitch from movement'}</span><span class="k">Up/down = pitch · across = the ${s.bars} bars</span></div>
    <div class="padbox" data-pad="${L.id}"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" style="height:${h}px">${ticks}<line x1="0" y1="${h / 2}" x2="${w}" y2="${h / 2}" stroke="rgb(255 255 255/.25)" stroke-dasharray="3 4" vector-effect="non-scaling-stroke"/>
      <path data-autopath d="${autoPath(L, w, h)}" fill="none" stroke="${c}" stroke-width="2.4" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 5px ${c})"/><line data-padph x1="-10" y1="0" x2="-10" y2="${h}" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke"/></svg>
      <span class="ax t">+12</span><span class="ax b">−12</span><span class="ax r">bar ${s.bars}</span></div>
    <div class="row"><button type="button" class="pill sm" data-act="moverec" data-l="${L.id}" aria-pressed="${ui.moveRec === L.id}">${I.rec}${ui.moveRec === L.id ? 'Recording: move up/down' : 'Record while playing'}</button><button type="button" class="pill sm" data-act="snap" data-l="${L.id}">Snap to scale</button><button type="button" class="pill sm" data-act="clearauto" data-l="${L.id}">Clear</button></div></div>`;
}

/* ---------- space: depth and around, as a room seen from above ---------- */
function room(L, size = 130) {
  const c = col(L), r = size / 2 - 8, ang = (L.around / 100 * 270 - 90) * Math.PI / 180, d = 0.18 + L.depth / 100 * 0.82, x = size / 2 + Math.sin(ang) * r * d, y = size / 2 - Math.cos(ang) * r * d;
  return `<svg class="room" data-room="${L.id}" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Where ${esc(X.nameOf(L))} sits around you">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="rgb(0 0 0/.15)" stroke="rgb(255 255 255/.25)"/><circle cx="${size / 2}" cy="${size / 2}" r="${r * .6}" fill="none" stroke="rgb(255 255 255/.12)" stroke-dasharray="2 4"/>
    <path d="M${size / 2 - 7} ${size / 2 + 5}l7-14 7 14z" fill="#EEF3EC"/><line data-rl x1="${size / 2}" y1="${size / 2}" x2="${x}" y2="${y}" stroke="${c}" stroke-dasharray="3 3"/>
    <circle data-rd cx="${x}" cy="${y}" r="8" fill="${c}" style="filter:drop-shadow(0 0 7px ${c})"/>
    <text x="${size / 2}" y="11" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="rgb(238 243 236/.7)">FRONT</text><text x="${size / 2}" y="${size - 2}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="8" fill="rgb(238 243 236/.7)">BEHIND</text></svg>`;
}
const space = L => `<div class="space">${room(L)}<div class="spc">${slider('Depth', 'l.depth', L.depth, col(L), L)}<span class="hint">Near ↔ far</span>${slider('Around', 'l.around', L.around, col(L), L)}<span class="hint">Left · front · right · behind</span></div></div>`;

/* isolate, speed and space effect for one sound (11/9) */
const SPL = [[0.25, '¼×'], [0.5, '½×'], [1, '1×'], [1.5, '1½×'], [2, '2×']];
function extras(L) {
  const c = col(L), sp = (SPL.find(x => x[0] === (L.speed || 1)) || SPL[2])[1], fx = (X.FX.find(f => f[0] === L.fx) || X.FX[0])[1];
  return `<div class="xtr"><div class="row"><button type="button" class="pill sm iso" data-act="solo" data-l="${L.id}" aria-pressed="${!!L.solo}" style="--c:${c}">${L.solo ? 'Isolated · tap to hear all' : 'Isolate'}</button></div>
    <span class="k">Speed</span>${chips('speed', SPL.map(x => x[1]), sp, c, ` data-l="${L.id}"`)}
    <span class="k">Space effect</span>${chips('fx', X.FX.map(f => f[1]), fx, c, ` data-l="${L.id}"`)}
    ${L.fx && L.fx !== 'none' ? slider('Effect amount', 'l.fxAmt', L.fxAmt ?? 60, c, L) : ''}</div>`;
}
/* ---------- casual: selected sound card ---------- */
function selCard() {
  const L = sel(); if (!L) return '';
  const c = col(L);
  if (L.kind === 'audio') return `<div class="det" style="--c:${c}"><div class="deth"><div><span class="k">Selected layer</span><h3>${esc(X.nameOf(L))}</h3></div></div>
    ${slider('Pitch', 'p.pitch', L.p.pitch, c, L)}${slider('Tone', 'p.tone', L.p.tone, c, L)}${slider('Drive', 'p.drive', L.p.drive, c, L)}
    <div class="g2">${slider('Fade in', 'l.fadeIn', L.fadeIn, c, L, { max: 8, step: 0.1 })}${slider('Fade out', 'l.fadeOut', L.fadeOut, c, L, { max: 8, step: 0.1 })}</div>${extras(L)}${space(L)}</div>`;
  const D = X.V[L.voice];
  return `<div class="det" style="--c:${c}"><div class="deth"><div><span class="k">Selected layer</span><h3>${esc(X.nameOf(L))}</h3></div>${dd('st2:' + L.id, 'Sound style', L.style, Object.keys(D.styles), c)}</div>
    <canvas class="kw" data-kw="${L.id}" aria-hidden="true"></canvas>
    <span class="k">Presets</span>${chips('preset', Object.keys(D.presets), L.preset, c, ` data-l="${L.id}"`)}
    <div class="g3">${slider('Pitch', 'p.pitch', L.p.pitch, c, L)}${slider('Punch', 'p.punch', L.p.punch, c, L)}${slider('Length', 'p.length', L.p.length, c, L)}${slider('Tone', 'p.tone', L.p.tone, c, L)}${slider('Drive', 'p.drive', L.p.drive, c, L)}${slider('Swing', 'p.swing', L.p.swing, c, L)}</div>
    ${isMel(L) ? `<div class="g2">${slider('Glide', 'p.glide', L.p.glide, c, L)}${slider('Vibrato', 'p.vibrato', L.p.vibrato, c, L)}</div>` : ''}
    <div class="g2">${slider('Reverb', 'l.rev', L.rev, c, L)}${slider('Echo', 'l.echo', L.echo, c, L)}</div>
    <div class="g2">${slider('Fade in', 'l.fadeIn', L.fadeIn, c, L, { max: 8, step: 0.1 })}${slider('Fade out', 'l.fadeOut', L.fadeOut, c, L, { max: 8, step: 0.1 })}</div>
    ${extras(L)}${space(L)}</div>`;
}

/* ---------- make a sound with your voice or hands ---------- */
const MEL_TO = [['handpan', 'Handpan'], ['theremin', 'Theremin'], ['bass', 'Bass line'], ['kalimba', 'Kalimba'], ['pluck', 'Pluck'], ['choir', 'Choir'], ['drums', 'Drum beat']];
function recPanel() {
  const r = ui.rec, active = r && r.kind === 'loop' && (r.phase === 'count' || r.phase === 'rec');
  const takes = X.LIB.files.filter(f => f.origin === 'rec').slice(-3).reverse();
  return `<div class="recbox"><button type="button" class="recbtn${active ? ' on' : ''}" data-act="recloop" aria-label="${active ? 'Stop recording' : 'Record a loop'}">${active ? I.stop : I.rec}</button>
    <div class="recinfo"><b>${active ? (r.phase === 'count' ? 'Count-in…' : `Recording · bar ${Math.floor((r.step || 0) / 16) + 1} of ${r.bars}`) : 'Record a loop'}</b><span class="k">Starts on the next bar after a count-in · loops when it’s done</span>
      <div class="meter" data-meter>${Array.from({ length: 24 }, () => '<i></i>').join('')}</div></div></div>
    <div class="row"><span class="k">Loop</span>${chips('loopbars', ['1', '2', '4', '8'], String(ui.loopBars), ACC)}<span class="k">bars</span></div>
    <p class="msg${ui.err.rec ? ' err' : ''}" aria-live="polite">${esc(ui.msg.rec)}</p>
    ${takes.length ? `<div class="k">Recent takes</div>${takes.map(f => `<div class="file" style="--c:#E3A6FF"><div><b>${esc(f.name)}</b><span class="k">${fmtDur(f.dur)}</span></div><button type="button" class="add" data-act="addfile" data-v="${f.id}">${S().layers.some(L => L.file === f.id) ? 'In mix' : '+ Add layer'}</button></div>`).join('')}` : ''}`;
}
function humPanel() {
  const r = ui.rec, active = r && r.kind === 'hum' && (r.phase === 'count' || r.phase === 'rec'), h = ui.hum;
  let viz = '';
  if (h) {
    const ns = h.notes, n = ns.length, mn = Math.min(...ns, 0), mx = Math.max(...ns, 1);
    viz = `<div class="humviz" aria-hidden="true">${h.steps.map((on, i) => { if (!on) return ''; let k = i + 1; while (k < n && !h.steps[k] && ns[k] === ns[i]) k++; return `<i style="left:${i / n * 100}%;width:${(k - i) / n * 100 - 0.6}%;bottom:${10 + (ns[i] - mn) / (mx - mn || 1) * 72}%"></i>`; }).join('')}</div>`;
  }
  return `<div class="recbox"><button type="button" class="recbtn${active ? ' on' : ''}" data-act="rechum" aria-label="${active ? 'Stop' : 'Hum a melody'}" style="color:#F2C6FF">${active ? I.stop : I.hum}</button>
    <div class="recinfo"><b>${active ? (r.phase === 'count' ? 'Count-in…' : 'Listening… hum along') : 'Hum a melody or a beat'}</b><span class="k">${h ? `Heard: ${h.heard.length ? h.heard.join(' · ') : 'nothing clear — try a steadier hum'}` : 'A clear, steady hum works best'}</span>
      <div class="meter" data-meter>${Array.from({ length: 24 }, () => '<i></i>').join('')}</div></div></div>
    <div class="row"><span class="k">Length</span>${chips('humbars', ['1', '2'], String(ui.humBars), '#F2C6FF')}<span class="k">bars</span></div>
    <p class="msg${ui.err.rec ? ' err' : ''}" aria-live="polite">${esc(ui.msg.rec)}</p>
    ${h ? `${viz}<span class="k">Turn it into</span>${chips('humto', MEL_TO.map(m => m[1]), (MEL_TO.find(m => m[0] === ui.humTo) || [])[1], '#F2C6FF')}<div class="row"><button type="button" class="pill sm" data-act="humplay">Hear it</button><span class="grow"></span><button type="button" class="pill solid sm" data-act="humadd">Add layer</button></div>` : ''}`;
}
function movePanel() {
  const m = ui.move, w = 600, h = 160, n = m.bars * 16;
  const d = m.path.map((p, i) => (i ? 'L' : 'M') + (p.x * w).toFixed(1) + ' ' + (h / 2 - p.y * h * 0.45).toFixed(1)).join('');
  const ticks = Array.from({ length: n + 1 }, (_, i) => `<line x1="${i / n * w}" y1="0" x2="${i / n * w}" y2="${h}" stroke="rgb(255 255 255/${i % 4 ? .06 : .16})" vector-effect="non-scaling-stroke"/>`).join('');
  return `<span class="k">Draw a line: across is time, up is higher. It becomes notes on a scale.</span>
    <div class="padbox tall" data-movedraw style="--c:#9C6BFF"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true" style="height:${h}px">${ticks}<path data-mpath d="${d}" fill="none" stroke="#9C6BFF" stroke-width="2.4" vector-effect="non-scaling-stroke" style="filter:drop-shadow(0 0 5px #9C6BFF)"/></svg><span class="ax t">higher</span><span class="ax b">lower</span></div>
    <div class="row"><span class="k">Length</span>${chips('movebars', ['1', '2', '4'], String(m.bars), '#9C6BFF')}<span class="k">bars</span></div>
    <span class="k">Play it on</span>${chips('moveto', MEL_TO.filter(x => x[0] !== 'drums').map(x => x[1]), (MEL_TO.find(x => x[0] === m.to) || [])[1], '#9C6BFF')}
    <div class="row"><button type="button" class="pill sm" data-act="moveclear">Clear</button><span class="grow"></span><button type="button" class="pill solid sm" data-act="moveadd"${m.path.length < 3 ? ' disabled' : ''}>Add layer</button></div>`;
}
function createPanel(onlyTab) {
  const t = onlyTab || ui.tab;
  return `<div class="create"><span class="blh">Make a sound with your voice or hands</span>
    ${onlyTab ? '' : `<div class="ctabs" role="tablist">${[['rec', 'Record a loop', 'mic'], ['hum', 'Hum a melody', 'hum'], ['move', 'Move a melody', 'move']].map(([k, l, i]) => `<button type="button" role="tab" data-act="tab" data-v="${k}" aria-pressed="${t === k}" aria-selected="${t === k}">${I[i]}${l}</button>`).join('')}</div>`}
    ${t === 'rec' ? recPanel() : t === 'hum' ? humPanel() : movePanel()}</div>`;
}
const mk3 = () => `<div class="mk3">${[['rec', 'Record a loop', 'mic'], ['hum', 'Hum a melody', 'hum'], ['move', 'Move a melody', 'move']].map(([k, l, i]) => `<button type="button" data-act="sheet" data-v="${k}">${I[i]}<span>${l}</span></button>`).join('')}</div>`;

/* ---------- library and mixes ---------- */
function library() {
  const used = new Set(S().layers.filter(L => L.kind === 'audio').map(L => L.file));
  const fc = id => { const L = S().layers.find(x => x.kind === 'audio' && x.file === id); return L ? col(L) : '#ffffff'; };
  const cur = X.LIB.mixes.find(m => m.id === S().cur);
  return `<div class="lib">
    <div class="row"><span class="blh">Library</span><span class="grow"></span><span class="k">${X.LIB.ok ? `Audio and video · ${fmtMB(X.usedBytes())} of 200 MB` : 'Browser storage is off here'}</span></div>
    <label class="drop" data-drop>${I.up}<b>Drop audio or video</b><span class="k">MP3 · WAV · M4A · MP4 · MOV · WEBM — sound is pulled from videos</span><span class="k dk">or click to choose files</span>
      <input type="file" multiple accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.mp4,.mov,.m4v,.webm" data-in="files"></label>
    <p class="msg${ui.err.lib ? ' err' : ''}" aria-live="polite">${esc(ui.msg.lib)}</p>
    ${X.LIB.files.filter(f => f.origin !== 'session').map(f => { const u = used.has(f.id), c = fc(f.id); return `<div class="file" style="--c:${c}">${f.from ? `<span class="fic">${I.film}</span>` : f.origin === 'rec' ? `<span class="fic">${I.mic}</span>` : ''}<div><b title="${esc(f.name)}">${esc(f.name)}</b><span class="k">${fmtDur(f.dur)} · ${fmtMB(f.size)} · ${f.from ? `video → ${esc(f.type)}` : esc(f.type)}</span></div>
      <span class="acts">${u ? '<span class="k" style="color:var(--acc)">In mix</span>' : `<button type="button" class="add" data-act="addfile" data-v="${f.id}">+ Add layer</button>`}${ui.confirm === f.id ? `<button type="button" class="add" data-act="delfile" data-v="${f.id}">Remove</button>` : `<button type="button" class="x" data-act="askdel" data-v="${f.id}" aria-label="Remove ${esc(f.name)}">×</button>`}</span></div>`; }).join('')}
    <div class="store"><i style="--u:${Math.min(100, X.usedBytes() / X.MAX_ALL * 100)}%"></i></div>
    ${sessions()}
    <div class="row" style="margin-top:14px"><span class="blh">Mixes</span><span class="grow"></span><button type="button" class="pill solid sm" data-act="savebox">Save mix</button><button type="button" class="pill acc sm" data-act="exp" aria-expanded="${ui.exp}">Export ▾</button></div>
    ${ui.saving ? `<form class="savebox" data-form="save"><input name="n" maxlength="40" aria-label="Mix name" value="${esc(cur ? cur.name : `Mix ${X.LIB.mixes.length + 1}`)}"><button type="submit" class="pill solid sm">Save</button></form>` : ''}
    ${ui.exp ? `<div class="row"><span class="k">Between the markers</span><button type="button" class="pill sm" data-act="export" data-v="wav">WAV</button><button type="button" class="pill sm" data-act="export" data-v="mp3">MP3</button></div>` : ''}
    <p class="msg${ui.err.mx ? ' err' : ''}" aria-live="polite">${esc(ui.msg.mx)}</p>
    ${X.LIB.mixes.map(m => `<div class="mix${m.id === S().cur ? ' cur' : ''}"><div><b>${esc(m.name)}</b><span class="k">${m.bpm} BPM · ${m.n} layers${m.bars ? ` · ${m.bars} bars` : ''} · ${new Date(m.saved).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span></div>
      <span class="acts"><button type="button" class="add" style="border-color:rgb(255 255 255/.3);color:var(--ink)" data-act="openmix" data-v="${m.id}">${m.id === S().cur ? 'Open now' : 'Open'}</button>${ui.confirm === m.id ? `<button type="button" class="add" data-act="delmix" data-v="${m.id}">Delete</button>` : `<button type="button" class="x" data-act="askdel" data-v="${m.id}" aria-label="Delete ${esc(m.name)}">×</button>`}</span></div>`).join('') || '<p class="k">Saved mixes appear here.</p>'}
  </div>`;
}

/* ---------- complex: arrangement ---------- */
function laneTrack(L) {
  const s = S(), c = col(L);
  if (L.kind === 'audio' && L.mode === 'loop') {
    const f = X.fileById(L.file);
    return Array.from({ length: s.bars }, (_, b) => `<button type="button" class="bar" data-act="bar" data-l="${L.id}" data-b="${b}" aria-pressed="${!(L.barsOn && L.barsOn[b] === false)}" aria-label="${esc(X.nameOf(L))} bar ${b + 1}">${f && s.bars <= 16 ? `<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="${waveD(f.peaks.slice(Math.floor(b % 4 / 4 * f.peaks.length), Math.floor((b % 4 + 1) / 4 * f.peaks.length)), 100, 20)}"/></svg>` : ''}</button>`).join('');
  }
  const len = L.steps.length;
  return Array.from({ length: s.bars }, (_, b) => {
    const marks = s.bars <= 16 ? Array.from({ length: 16 }, (_, i) => L.steps[(b * 16 + i) % len] ? `<i style="left:${(i + .3) / 16 * 100}%${isMel(L) ? `;top:${40 - (L.notes[(b * 16 + i) % len] || 0) * 1.6}%;bottom:auto;height:4px;width:${100 / 16 * .8}%` : ''}"></i>` : '').join('') : '';
    return `<button type="button" class="bar" data-act="bar" data-l="${L.id}" data-b="${b}" aria-pressed="${!(L.barsOn && L.barsOn[b] === false)}" aria-label="${esc(X.nameOf(L))} bar ${b + 1}">${marks}</button>`;
  }).join('');
}
function arrangement() {
  const s = S(), T = X.totalSteps();
  const lanes = s.layers.map(L => `<div class="lane${L.hidden ? ' off' : ''}${L.mute ? ' mut' : ''}${s.sel === L.id ? ' sel' : ''}" style="--c:${col(L)}" data-ly="${L.id}">
      <div class="lname"><button type="button" class="dash" data-dash="${L.id}" aria-pressed="${L.hidden}" aria-label="${esc(X.nameOf(L))}: tap to hide, drag to reorder"><i></i></button><b data-act="select" data-l="${L.id}" title="${esc(X.nameOf(L))}"><span class="full">${esc(X.nameOf(L))}</span><span class="sh">${X.shortOf(L)}</span></b>
        <span class="ms"><button type="button" class="m" data-act="mute" data-l="${L.id}" aria-pressed="${!!L.mute}" aria-label="Mute">M</button><button type="button" class="s" data-act="solo" data-l="${L.id}" aria-pressed="${!!L.solo}" aria-label="Solo">S</button></span></div>
      <div class="ltrack">${laneTrack(L)}</div></div>
    ${L.auto ? `<div class="lane auto" style="--c:${col(L)}"><div class="lname"><span class="k">↳ <span class="full">Pitch</span><span class="sh">PIT</span></span></div><div class="ltrack" style="display:block"><svg viewBox="0 0 600 36" preserveAspectRatio="none"><path d="${autoPath(L, 600, 36)}" fill="none" stroke="${col(L)}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></div></div>` : ''}`).join('');
  return `<div class="arr"><div class="arrh"><span class="blh">Arrangement · ${s.bars} bars</span><span class="k">Tap a bar to drop it out · drag START / END</span><span class="grow"></span>
      <div class="len"><span class="k">Length</span>${[4, 8, 16, 32].map(b => `<button type="button" data-act="bars" data-v="${b}" aria-pressed="${s.bars === b}">${b}</button>`).join('')}<button type="button" class="pill sm" data-act="extend">+ Extend</button></div>
      ${sessBtn()}<button type="button" class="pill acc sm" data-act="voices" aria-expanded="${ui.voices}">+ Add layer</button></div>${voicesMenu()}
    <div class="arrin" data-arr>
      <div class="lane rul"><div class="lname"></div><div class="ltrack" data-vbox data-scrub>${Array.from({ length: s.bars }, (_, i) => (s.bars <= 16 || i % 4 === 0) ? `<span style="left:${i / s.bars * 100}%">${i + 1}</span>` : '').join('')}
        <button type="button" class="mk" data-mk="start" style="left:${s.start / T * 100}%" aria-label="Start marker"><b>START</b></button><button type="button" class="mk end" data-mk="end" style="left:${s.end / T * 100}%" aria-label="End marker"><b>END</b></button></div></div>
      ${lanes}<span class="ph" data-aph></span></div>${fadesRow()}</div>`;
}
function strips() {
  const s = S();
  return `<div class="strips">${s.layers.map(L => { const c = col(L);
    return `<div class="strip${L.hidden ? ' off' : ''}${s.sel === L.id ? ' sel' : ''}" style="--c:${c}" data-strip="${L.id}"><button type="button" class="sn" data-act="select" data-l="${L.id}"><span class="full">${esc(X.nameOf(L))}</span><span class="sh">${X.shortOf(L)}</span></button><span class="k">${esc(L.kind === 'audio' ? (L.mode === 'loop' ? 'Loop' : 'Steps') : L.style)}</span>
      ${knob('EQ lo', 'l.eqLo', L.eqLo, c, L, 38)}${knob('EQ hi', 'l.eqHi', L.eqHi, c, L, 38)}${knob('Reverb', 'l.rev', L.rev, c, L, 38)}${knob('Echo', 'l.echo', L.echo, c, L, 38)}${knob('Depth', 'l.depth', L.depth, c, L, 38)}
      <label class="aroundsl"><span class="k">Around</span><input type="range" min="0" max="100" value="${L.around}" data-in="l.around" data-l="${L.id}" style="--c:${c};--fill:${L.around}%" aria-label="${esc(X.nameOf(L))} around"></label>
      <div class="fader"><div class="meterv"><s data-meterl="${L.id}"></s></div><div class="vf"><input type="range" min="0" max="100" value="${L.vol}" data-in="l.vol" data-l="${L.id}" style="--c:${c};--fill:${L.vol}%" aria-label="${esc(X.nameOf(L))} volume"></div></div>
      <span class="k" data-db="${L.id}">${L.vol ? (20 * Math.log10(L.vol / 100)).toFixed(0) + ' dB' : '−∞'}</span>
      <div class="ms"><button type="button" class="m" data-act="mute" data-l="${L.id}" aria-pressed="${!!L.mute}" aria-label="Mute">M</button><button type="button" class="s" data-act="solo" data-l="${L.id}" aria-pressed="${!!L.solo}" aria-label="Solo">S</button></div>
      <span class="k">In ${L.fadeIn.toFixed(1)}s · Out ${L.fadeOut.toFixed(1)}s</span></div>`; }).join('')}
    <div class="strip master"><button type="button" class="sn">Master</button><span class="k">Limiter on</span>${knob('Room', 'g.room', s.room, ACC, null, 38)}
      <div class="fader"><div class="meterv"><s data-meterm></s></div><div class="vf"><input type="range" min="0" max="100" value="${s.vol}" data-in="g.vol" style="--c:${ACC};--fill:${s.vol}%" aria-label="Master volume"></div></div><span class="k">Volume</span></div></div>`;
}
/* the sound engine panel (what Ariana circled): style, character, oscillator, envelope, filter, dials, fades, space, spectrum */
function adsrGraph(L) {
  const p = L.p, w = 300, h = 90, a = 6 + p.a / 100 * 70, d = a + 6 + p.length / 100 * 90, sy = h - 6 - p.s / 100 * (h - 14), rl = Math.min(w - 4, d + 60 + p.r / 100 * 90);
  return `<svg class="graph" data-adsr="${L.id}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Envelope"><path d="M0 ${h - 2} L${a} 6 L${d} ${sy} L${rl - 50} ${sy} L${rl} ${h - 2}" fill="color-mix(in srgb,${col(L)} 15%,transparent)" stroke="${col(L)}" stroke-width="2" vector-effect="non-scaling-stroke"/>
    <circle data-h="a" cx="${a}" cy="6" r="6" fill="${col(L)}"/><circle data-h="d" cx="${d}" cy="${sy}" r="6" fill="${col(L)}"/><circle data-h="r" cx="${rl}" cy="${h - 4}" r="6" fill="${col(L)}"/></svg>`;
}
function filterGraph(L) {
  const p = L.p, w = 300, h = 90, x = 20 + p.tone / 100 * 260, peak = 40 - p.res / 100 * 34;
  return `<svg class="graph" data-filt="${L.id}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Filter"><path d="M0 40 L${x - 30} 40 Q${x - 6} ${peak} ${x} ${peak + 2} T${Math.min(w, x + 70)} ${h - 2}" fill="none" stroke="${col(L)}" stroke-width="2" vector-effect="non-scaling-stroke"/><circle data-h="f" cx="${x}" cy="${peak + 2}" r="6" fill="${col(L)}"/></svg>`;
}
function engine() {
  const L = sel(); if (!L) return '';
  const c = col(L), D = L.kind === 'synth' ? X.V[L.voice] : null;
  return `<div class="eng" style="--c:${c}"><div class="row" style="align-items:flex-end"><div><span class="blh" style="color:${c}">Sound engine</span><h3 style="margin:2px 0 0;font:300 1.5rem var(--f-disp);color:color-mix(in srgb,${c} 52%,white);text-transform:none;letter-spacing:0">${esc(X.nameOf(L))}</h3></div><span class="grow"></span>
      ${D ? dd('st3:' + L.id, 'Style', L.style, Object.keys(D.styles), c) : `<div class="seg" style="--c:${c}"><button type="button" data-act="amode" data-l="${L.id}" data-v="loop" aria-pressed="${L.mode === 'loop'}">Loop</button><button type="button" data-act="amode" data-l="${L.id}" data-v="steps" aria-pressed="${L.mode === 'steps'}">On steps</button></div>`}</div>
    ${D ? `<span class="k">Character</span>${chips('preset', Object.keys(D.presets), L.preset, c, ` data-l="${L.id}"`)}` : ''}
    ${D && D.osc ? `<span class="k">Oscillator</span>${chips('osc', D.osc.map(o => o[0].toUpperCase() + o.slice(1)), L.p.osc[0].toUpperCase() + L.p.osc.slice(1), c, ` data-l="${L.id}"`)}` : ''}
    ${D ? `<span class="k">Envelope · attack · decay · sustain · release</span>${adsrGraph(L)}` : ''}
    <span class="k" data-filtlbl>Filter · cutoff ${Math.round(120 * Math.pow(2, L.p.tone / 100 * 7.5))} Hz · resonance ${Math.round(L.p.res)}%</span>${filterGraph(L)}
    <div class="g3">${D && D.root ? knob('Vibrato', 'p.vibrato', L.p.vibrato, c, L, 50) + knob('LFO rate', 'p.lfo', L.p.lfo, c, L, 50) + knob('Glide', 'p.glide', L.p.glide, c, L, 50) : knob('Pitch', 'p.pitch', L.p.pitch, c, L, 50) + knob('Punch', 'p.punch', L.p.punch, c, L, 50) + knob('Swing', 'p.swing', L.p.swing, c, L, 50)}${knob('Drive', 'p.drive', L.p.drive, c, L, 50)}${knob('Reverb', 'l.rev', L.rev, c, L, 50)}${knob('Echo', 'l.echo', L.echo, c, L, 50)}</div>
    <div class="g2">${slider('Fade in', 'l.fadeIn', L.fadeIn, c, L, { max: 8, step: 0.1 })}${slider('Fade out', 'l.fadeOut', L.fadeOut, c, L, { max: 8, step: 0.1 })}</div>
    ${extras(L)}${space(L)}
    <span class="k">Spectrum</span><canvas class="au-spec" data-spec aria-hidden="true"></canvas></div>`;
}
function soundCard() {
  const L = sel(); if (!L) return ''; const c = col(L), D = L.kind === 'synth' ? X.V[L.voice] : null, mel = isMel(L);
  const len = Math.min(16, L.steps.length), bars = Array.from({ length: len }, (_, i) => { const on = L.steps[i]; const v = mel && ui.stepMode === 'notes' ? ((L.notes[i] || 0) + 12) / 24 : (L.vel[i] ?? .8); return `<i class="${on ? '' : 'off'}" style="height:${Math.max(4, v * 100)}%"></i>`; }).join('');
  return `<div class="det" style="--c:${c}"><div class="row"><span class="blh" style="color:${c}">${X.shortOf(L)} · Sound</span><span class="grow"></span>${D ? '' : ''}</div>
    ${D ? `<span class="k">Presets</span>${chips('preset', Object.keys(D.presets), L.preset, c, ` data-l="${L.id}"`)}` : ''}
    <div class="g3">${slider('Pitch', 'p.pitch', L.p.pitch, c, L)}${slider('Punch', 'p.punch', L.p.punch, c, L)}${slider('Length', 'p.length', L.p.length, c, L)}${slider('Tone', 'p.tone', L.p.tone, c, L)}${slider('Drive', 'p.drive', L.p.drive, c, L)}${slider('Swing', 'p.swing', L.p.swing, c, L)}</div>
    ${L.kind === 'synth' || L.mode === 'steps' ? `<div class="row"><span class="k">Per step</span><span class="grow"></span>${mel ? `<div class="seg" style="--c:${c}"><button type="button" data-act="stepmode" data-v="vel" aria-pressed="${ui.stepMode !== 'notes'}">Strength</button><button type="button" data-act="stepmode" data-v="notes" aria-pressed="${ui.stepMode === 'notes'}">Notes</button></div>` : '<span class="k">Strength</span>'}</div>
    <div class="bars" data-bars="${L.id}" role="img" aria-label="${ui.stepMode === 'notes' && mel ? 'Notes' : 'Strength'} for each step">${bars}</div>` : ''}</div>`;
}

/* ---------- page, and windows you can move around (desktop) ---------- */
const BARE = new Set(['piece', 'layers', 'lib', 'arr', 'strips', 'sound']);
const WNAME = { piece: 'the whole piece', layers: 'layers', create: 'voice and hands', sel: 'selected layer', lib: 'library', arr: 'arrangement', strips: 'mixer', engine: 'sound engine', sound: 'movement and sound' };
function winBody(id) {
  const L = sel();
  switch (id) {
    case 'piece': return piece(); case 'layers': return `${layersHead()}<div class="layers">${layerList()}</div>`; case 'create': return createPanel();
    case 'sel': return selCard(); case 'lib': return library(); case 'arr': return arrangement(); case 'strips': return strips(); case 'engine': return engine();
    case 'sound': return `${L ? movePad(L, 150, `${X.shortOf(L)} · pitch from movement`) : ''}${soundCard()}`;
  }
  return '';
}
const grip = id => `<button type="button" class="wgrip" data-wgrip="${id}" aria-label="Move the ${WNAME[id]} window. Drag, or use the arrow keys." title="Drag to move"><i></i></button>`;
const winIds = () => S().mode === 'complex' ? ['arr', 'strips', 'engine', 'sound', 'create', 'lib'] : ['piece', 'layers', 'create', 'sel', 'lib'];
const freeMap = () => (S().win || {})[S().mode];
const isFree = () => !phone() && !!freeMap() && winIds().every(id => freeMap()[id]);
function html() {
  const s = S(), cx = s.mode === 'complex', w = (id, cls = '') => `<div class="win${cls ? ' ' + cls : ''}" data-win="${id}">${grip(id)}${winBody(id)}</div>`;
  if (isFree()) {
    const m = freeMap();
    return `${transport()}${cx ? '' : mk3()}<div class="desk" data-desk>${winIds().map(id => { const p = m[id];
      return `<div class="win free${BARE.has(id) ? ' bare' : ''}" data-win="${id}" style="left:${(p.x * 100).toFixed(3)}%;top:${Math.round(p.y)}px;width:${(p.w * 100).toFixed(3)}%;z-index:${p.z || 1}">${grip(id)}${winBody(id)}<span class="wsize" data-wsize="${id}" title="Drag to resize" aria-hidden="true"></span></div>`; }).join('')}</div>`;
  }
  if (!cx) return `${transport()}${w('piece')}${mk3()}
    <div class="cols3">${w('layers', 'colA')}${w('create', 'colB')}<div class="colC">${w('sel')}${w('lib')}</div></div>`;
  return `${transport()}<div class="cx">${w('arr')}
    <div class="cxmore">${w('sound')}${w('create')}${w('lib')}</div>
    <div class="cxlow">${w('strips')}${w('engine', 'insp')}</div></div>`;
}
/* the first move freezes every window where it sits now; after that each one moves on its own */
function freeze() {
  const tr = root.querySelector('.tr'), rr = root.getBoundingClientRect(), W = root.clientWidth, top0 = tr.getBoundingClientRect().bottom + 28, m = {};
  winIds().forEach((id, i) => { const el = root.querySelector(`[data-win="${id}"]`); if (!el) return; const r = el.getBoundingClientRect(); m[id] = { x: Math.max(0, (r.left - rr.left) / W), y: Math.max(0, Math.round(r.top - top0)), w: Math.min(1, r.width / W), z: i + 1 }; });
  S().win = S().win || {}; S().win[S().mode] = m; X.save(); paint(); settle();
}
/* after freezing, windows grow a little (their glass padding): push any that now overlap down below the one above */
function settle() {
  const m = freeMap(), d = root && root.querySelector('[data-desk]'); if (!m || !d) return; const W = d.clientWidth, placed = [];
  winIds().slice().sort((a, b) => m[a].y - m[b].y || m[a].x - m[b].x).forEach(id => {
    const el = d.querySelector(`.win[data-win="${id}"]`); if (!el) return; const p = m[id], x0 = p.x * W, x1 = x0 + p.w * W, h = el.offsetHeight; let y = p.y, moved = true;
    while (moved) { moved = false; for (const q of placed) if (x0 < q.x1 - 1 && x1 > q.x0 + 1 && y < q.y + q.h + 28 && y + h > q.y - 28) { y = q.y + q.h + 28; moved = true; } }
    p.y = Math.round(y); el.style.top = p.y + 'px'; placed.push({ x0, x1, y: p.y, h });
  });
  X.save(); deskHeight();
}
let ro = null;
function deskHeight() {
  const d = root && root.querySelector('[data-desk]'); if (!d) return;
  let h = 0; d.querySelectorAll(':scope > .win').forEach(w => { h = Math.max(h, w.offsetTop + w.offsetHeight); }); d.style.height = h + 60 + 'px';
}
function watchDesk() {
  if (ro) ro.disconnect(); const d = root.querySelector('[data-desk]'); if (!d || !window.ResizeObserver) return deskHeight();
  ro = new ResizeObserver(() => deskHeight()); d.querySelectorAll(':scope > .win').forEach(w => ro.observe(w)); deskHeight();
}
function front(id) { const m = freeMap(); if (!m) return; const z = Math.max(...Object.values(m).map(p => p.z || 1)); if ((m[id].z || 1) < z) { m[id].z = z + 1; const el = root.querySelector(`.win[data-win="${id}"]`); if (el) el.style.zIndex = z + 1; } }
function winDown(e, kind, id) {
  if (!isFree()) freeze();
  const el = root.querySelector(`.win[data-win="${id}"]`); if (!el) return;
  front(id); const d = root.querySelector('[data-desk]'), W = d.clientWidth, p = freeMap()[id];
  drag = { type: kind, id, el, W, sx: e.clientX, sy: e.clientY, x0: p.x * W, y0: p.y, w0: p.w * W };
  el.classList.add('lift'); document.body.classList.add('au-moving');
  addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
}
function paint() {
  if (!root || !root.isConnected) return;
  const y = window.scrollY, a = document.activeElement, fk = a && root.contains(a) ? ['act', 'in', 'kn', 'l', 'v', 'i', 'dash'].map(k => a.dataset[k] !== undefined ? `[data-${k}="${a.dataset[k]}"]` : '').join('') : '';
  root.classList.toggle('casual', S().mode !== 'complex'); root.classList.toggle('complex', S().mode === 'complex');
  root.innerHTML = html();
  if (fk) { const el = root.querySelector(fk); el && el.focus({ preventScroll: true }); }
  if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
  root.querySelectorAll('canvas[data-kw]').forEach(kick);
  drawViz(); if (X.SEQ.cur >= 0) head(X.SEQ.cur); if (root.querySelector('[data-desk]')) watchDesk();
  if (pop) popPaint(); if (sheet) sheetPaint();
}
function msg(k, t, err) { ui.msg[k] = t; ui.err[k] = !!err; paintMsgs(); }
function paintMsgs() {
  [root, sheet, pop].forEach(r => { if (!r) return;
    const libs = r.querySelectorAll('.lib .msg'); if (libs[0]) { libs[0].textContent = ui.msg.lib; libs[0].classList.toggle('err', ui.err.lib); } if (libs[1]) { libs[1].textContent = ui.msg.mx; libs[1].classList.toggle('err', ui.err.mx); }
    r.querySelectorAll('.create .msg').forEach(el => { el.textContent = ui.msg.rec; el.classList.toggle('err', ui.err.rec); }); });
}

/* ---------- live drawing: playhead, the whole piece, meters, spectrum ---------- */
function estimate(g) {
  let e = 0;
  for (const L of S().layers) { if (!X.audible(L)) continue; const bar = Math.floor(g / 16); if (L.barsOn && L.barsOn[bar] === false) continue;
    if (L.kind === 'audio' && L.mode === 'loop') { const f = X.fileById(L.file); e += (f ? f.peaks[g % f.peaks.length] * 0.5 : 0.3) * L.vol / 100; continue; }
    const i = g % L.steps.length; if (L.steps[i]) e += (L.vel[i] ?? .8) * L.vol / 100 * (X.V[L.voice] && X.V[L.voice].g === 'drums' ? 1 : .7); }
  return e;
}
function drawViz() {
  const cv = root && root.querySelector('canvas[data-viz]'); if (!cv) return;
  const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 600, H = cv.clientHeight || 150; if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
  const T = X.totalSteps(), per = Math.max(1, Math.ceil(T / (W / 4))), n = Math.ceil(T / per), bw = W / n;
  const vals = []; let max = 0.15;
  for (let k = 0; k < n; k++) { let m = 0, est = 0; for (let j = k * per; j < Math.min(T, (k + 1) * per); j++) { if (X.SEQ.meas[j]) m = Math.max(m, X.SEQ.meas[j] * 3); est = Math.max(est, estimate(j)); } vals.push([m, est]); max = Math.max(max, m || est); }
  vals.forEach(([m, est], k) => {
    const v = (m || est) / max, h = Math.max(2, v * H * 0.86), t = k / n;
    g.fillStyle = t < .5 ? `color-mix(in srgb, ${ACC} ${Math.round(100 - t * 120)}%, #6E2CF2)` : `color-mix(in srgb, #9C6BFF ${Math.round(140 - t * 100)}%, #047BFA)`;
    if (!g.fillStyle || g.fillStyle === '#000000') g.fillStyle = t < .5 ? ACC : '#9C6BFF';
    g.globalAlpha = m ? 1 : 0.55; g.fillRect(k * bw + bw * .2, (H - h) / 2, Math.max(1, bw * .6), h);
  });
  g.globalAlpha = 1;
}
function head(gs) {
  const s = S(), T = X.totalSteps();
  [root, pop].forEach(r => { if (!r) return; r.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now'));
    if (gs >= 0) s.layers.forEach(L => { const i = gs % L.steps.length; r.querySelectorAll(`.cell[data-l="${L.id}"][data-i="${i}"]`).forEach(c => c.classList.add('now')); }); });
  if (!root) return;
  const ph = root.querySelector('[data-ph]'); if (ph) { ph.classList.toggle('on', gs >= 0); ph.style.left = (gs + .5) / T * 100 + '%'; }
  const aph = root.querySelector('[data-aph]'); if (aph) { aph.classList.toggle('on', gs >= 0); const tr = root.querySelector('.arrin .lane:not(.rul) .ltrack'); if (tr) { const lw = tr.offsetLeft; aph.style.left = `calc(${lw}px + (100% - ${lw}px) * ${(gs + .5) / T})`; } }
  root.querySelectorAll('[data-padph]').forEach(l => { const x = gs >= 0 ? (gs + .5) / T * 600 : -10; l.setAttribute('x1', x); l.setAttribute('x2', x); });
  if (pop) { const hl = pop.querySelector('.hl'), n = pop.querySelector(`.n[data-r="${gs % 16}"]`); if (hl) { hl.classList.toggle('on', gs >= 0 && !!n); if (n) hl.style.top = (n.offsetTop + n.offsetHeight / 2 - 1) + 'px'; } }
}
const tdbuf = new Float32Array(1024), fbuf = new Uint8Array(512);
function frame() {
  if (!root || !X.eng) return;
  if (S().mode === 'complex') {
    X.eng.ch.forEach((k, id) => { const el = root.querySelector(`[data-meterl="${id}"]`); if (!el) return; k.an.getFloatTimeDomainData(tdbuf); let s = 0; for (let i = 0; i < tdbuf.length; i++) s += tdbuf[i] * tdbuf[i]; el.style.height = Math.min(100, Math.sqrt(s / tdbuf.length) * 340) + '%'; });
    const mm = root.querySelector('[data-meterm]'); if (mm) { X.eng.an.getFloatTimeDomainData(tdbuf); let s = 0; for (let i = 0; i < 1024; i++) s += tdbuf[i] * tdbuf[i]; mm.style.height = Math.min(100, Math.sqrt(s / 1024) * 300) + '%'; }
    const cv = root.querySelector('canvas[data-spec]'), L = sel(), k = L && X.eng.ch.get(L.id);
    if (cv && k) { const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 300, H = cv.clientHeight || 100; if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); k.an.getByteFrequencyData(fbuf); const n = 64, bw = W / n;
      for (let i = 0; i < n; i++) { const idx = Math.floor(Math.pow(i / n, 2) * 400), v = fbuf[idx] / 255, h = Math.max(2, v * H * .92); g.fillStyle = i < n / 2 ? ACC : '#9C6BFF'; g.globalAlpha = 0.45 + v * 0.55; g.fillRect(i * bw + 1, H - h, bw - 2, h); } g.globalAlpha = 1; }
  }
}
function meters(level) { [root, sheet].forEach(r => r && r.querySelectorAll('[data-meter]').forEach(m => { const n = Math.round(level * 24); [...m.children].forEach((c, i) => { c.className = i < n ? (i > 18 ? 'on hot' : 'on') : ''; }); })); }
/* the selected synth's sound picture, rendered offline from the real voice */
const kwT = new Map();
function kick(cv) {
  clearTimeout(kwT.get(cv)); kwT.set(cv, setTimeout(async () => {
    const L = X.byId(cv.dataset.kw); if (!L || !cv.isConnected || L.kind !== 'synth') return;
    let d; try { d = (await X.renderHit(L)).getChannelData(0); } catch (err) { return; } if (!cv.isConnected) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 300, H = cv.clientHeight || 60; cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); let max = 0.05; for (let i = 0; i < d.length; i += 8) max = Math.max(max, Math.abs(d[i]));
    g.strokeStyle = col(L); g.lineWidth = 1.6; g.shadowColor = col(L); g.shadowBlur = 6; g.beginPath();
    const n = Math.min(W * 2, 500), per = Math.floor(d.length / n);
    for (let i = 0; i < n; i++) { const v = d[i * per] / max, x = i / n * W, y = H / 2 - v * H * .44; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }, 80));
}

/* ---------- actions ---------- */
function setBpm(v) { S().bpm = clamp(Math.round(v), 60, 180); X.save(); if (X.eng) X.levels(X.eng); [root, pop].forEach(r => { if (!r) return; r.querySelectorAll('[data-bpm]').forEach(b => { b.textContent = S().bpm; }); r.querySelectorAll('[data-act="feel"]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === S().bpm)); const m = r.querySelector('[data-meta]'); if (m) m.textContent = `${S().bars} bars · ${fmtDur((S().end - S().start) * X.stepDur())} between the markers · ${S().bpm} BPM`; }); }
function setBars(b) {
  const s = S(), old = s.bars; b = clamp(b, 1, 64); if (b === old) return;
  const wasFull = s.end >= old * 16; s.bars = b; s.end = wasFull ? b * 16 : Math.min(s.end, b * 16); s.start = Math.min(s.start, s.end - 1);
  s.layers.forEach(L => { if (L.barsOn) L.barsOn = Array.from({ length: b }, (_, i) => L.barsOn[i] !== false); if (L.auto) { const n = 64; L.auto = Array.from({ length: n }, (_, i) => { const src = i / (n - 1) * (b / old); return src <= 1 ? L.auto[Math.round(src * (L.auto.length - 1))] : null; }); } });
  X.SEQ.meas = []; X.save(); paint();
}
function setStyle(L, st) { const D = X.V[L.voice]; L.style = st; L.preset = null; Object.assign(L.p, X.BASE, D.osc ? { osc: D.osc[0] } : {}, D.styles[st]); X.save(); if (X.eng) X.apply(X.eng, L); paint(); X.audition(L); }
function setPreset(L, name) { const D = X.V[L.voice]; Object.assign(L.p, D.styles[L.style], D.presets[name]); L.preset = name; X.save(); if (X.eng) X.apply(X.eng, L); paint(); X.audition(L); }
function surprise() {
  S().layers.forEach(L => {
    if (L.kind === 'audio' && L.mode === 'loop') return; const v = L.voice, n = L.steps.length;
    L.steps = L.steps.map((_, i) => v === 'kick' ? (i % 4 === 0 || Math.random() < .12) : v === 'snare' ? (i % 16 === 4 || i % 16 === 12 || Math.random() < .06) : v === 'clap' ? Math.random() < .12
      : v === 'hat' ? (i % 2 === 0 ? Math.random() < .85 : Math.random() < .35) : v === 'kit' ? Math.random() < .14 : Math.random() < (v === 'bass' ? .4 : .28));
    if (isMel(L)) L.notes = L.notes.map(() => [0, 0, 3, 5, 7, 10, 12][Math.floor(Math.random() * 7)]);
    L.vel = L.vel.map(() => .55 + Math.random() * .45);
  });
  X.save(); paint();
}
async function exportMix(fmt) {
  const cur = X.LIB.mixes.find(m => m.id === S().cur), name = cur ? cur.name : 'mix';
  msg('mx', `Making your ${fmt.toUpperCase()}…`);
  try {
    const F = fmt.toUpperCase(), buf = await X.renderPiece(p => msg('mx', `Making your ${F}… ${Math.round(p * (fmt === 'mp3' ? 60 : 100))}%`)), blob = fmt === 'mp3' ? await X.mp3(buf, 192, p => msg('mx', `Making your ${F}… ${60 + Math.round(p * 40)}%`)) : X.wav(buf), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `advl-auditory-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mix'}-${S().bpm}bpm.${fmt}`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); msg('mx', `Downloaded ${a.download}`);
  } catch (e) { msg('mx', fmt === 'mp3' ? 'MP3 needs a connection the first time. Try WAV, or try again.' : 'Export didn’t work. Try again.', true); }
}
async function upload(files) {
  let added = 0;
  for (const f of files) { try { await X.addFile(f, t => msg('lib', t)); added++; } catch (e) { msg('lib', e.message || `Couldn’t add ${f.name}.`, true); } }
  if (added) msg('lib', `${added === 1 ? 'File' : added + ' files'} added. Use “+ Add layer” to put it in the mix.`);
  paint();
}
function addLayer(L) { S().layers.forEach(x => { x.open = false; }); L.open = true; S().layers.push(L); S().sel = L.id; X.sortLayers(); X.save(); paint(); }
async function startRec(kind) {
  if (ui.rec && (ui.rec.phase === 'count' || ui.rec.phase === 'rec')) { X.SEQ.rec && X.SEQ.rec.cancel(); ui.rec = null; msg('rec', 'Stopped.'); paint(); return; }
  msg('rec', kind === 'hum' ? 'Get ready to hum after the count-in…' : 'Get ready: recording starts after a one-bar count-in.');
  if (kind === 'hum') ui.hum = null;
  try {
    ui.rec = await X.record(kind === 'hum' ? 'hum' : 'loop', kind === 'hum' ? ui.humBars : ui.loopBars, st => {
      const prev = ui.rec && ui.rec.phase; ui.rec = st; meters(st.level || 0);
      if (st.phase !== prev && st.phase !== 'saved' && st.phase !== 'error') paintCreate();
      if (st.phase === 'saved') {
        if (st.file) { msg('rec', `${st.file.name} saved to your library and added as a layer.`); addLayer(X.audioLayer(st.file, { mode: 'loop', origin: 'rec' })); }
        if (st.hum) { ui.hum = st.hum; msg('rec', st.hum.voiced ? 'Here’s what I heard. Choose what to turn it into.' : 'I couldn’t hear a clear pitch. Try humming louder and steadier.', !st.hum.voiced); }
        ui.rec = null; paint();
      }
      if (st.phase === 'error') { msg('rec', st.error, true); ui.rec = null; paint(); }
    });
    paintCreate();
  } catch (e) { ui.rec = null; msg('rec', e.message || 'The microphone isn’t available.', true); paintCreate(); }
}
function paintCreate() { [root, sheet].forEach(r => { if (!r) return; r.querySelectorAll('.create').forEach(c => { const only = sheet && sheet.contains(c) ? ui.sheet : null; const w = document.createElement('div'); w.innerHTML = createPanel(only); c.replaceWith(w.firstElementChild); }); }); }
function humAdd() {
  const h = ui.hum; if (!h) return;
  if (ui.humTo === 'drums') {
    const k = X.melodyLayer('kick', h.kick, [], 'hum', 'Hummed kick'), sn = X.melodyLayer('snare', h.snare, [], 'hum', 'Hummed snare');
    if (!h.kick.some(Boolean)) k.steps = k.steps.map((_, i) => i % 4 === 0);
    addLayer(k); addLayer(sn);
  } else addLayer(X.melodyLayer(ui.humTo, h.steps, h.notes, 'hum', `Hummed ${X.V[ui.humTo].n.toLowerCase()}`));
  ui.hum = null; closeSheet(); msg('rec', 'Added to your layers.');
}
function moveAdd() {
  const m = ui.move; if (m.path.length < 3) return; const r = X.pathToMelody(m.path, m.bars * 16);
  addLayer(X.melodyLayer(m.to, r.steps, r.notes, 'move', `Moved ${X.V[m.to].n.toLowerCase()}`)); m.path = []; closeSheet();
}
function act(b, e) {
  const a = b.dataset.act, L = b.dataset.l ? X.byId(b.dataset.l) : null, v = b.dataset.v, s = S();
  if (!['askdel', 'delfile', 'delmix'].includes(a)) ui.confirm = null;
  if (a !== 'dd' && a !== 'ddpick' && ui.dd) { ui.dd = null; if (a === undefined) { paint(); return; } }
  switch (a) {
    case 'play': X.SEQ.playing ? X.stop() : X.play(); break;
    case 'bpm': setBpm(s.bpm + +v); break;
    case 'feel': setBpm(+v); break;
    case 'metro': s.metro = !s.metro; X.save(); paint(); break;
    case 'mode': s.mode = s.mode === 'complex' ? 'casual' : 'complex'; if (!s.sel && s.layers[0]) s.sel = s.layers[0].id; X.save(); ui.dd = null; paint(); break;
    case 'bars': setBars(+v); break;
    case 'extend': setBars(s.bars + 4); break;
    case 'cell': { if (!L) return; const i = +b.dataset.i; L.steps[i] = !L.steps[i]; X.save();
      [root, pop].forEach(r => r && r.querySelectorAll(`.cell[data-l="${L.id}"][data-i="${i}"]`).forEach(c => { c.className = cellCls(L.steps[i], i); c.setAttribute('aria-pressed', L.steps[i]); }));
      if (L.steps[i]) X.audition(L, i); drawViz(); break; }
    case 'select': if (!L) return; s.sel = L.id; X.save(); paint(); break;
    case 'open': if (!L) return; if (L.hidden) { L.hidden = false; X.eng && X.apply(X.eng, L); X.restartLoop(L); } L.open = !L.open; s.sel = L.id; X.save(); paint(); break;
    case 'voices': ui.voices = !ui.voices; paint(); break;
    case 'addsynth': ui.voices = false; addLayer(X.synthLayer(v, { open: true })); break;
    case 'surprise': surprise(); break;
    case 'newsound': { if (!L) return; L.p = Object.assign(L.p, Object.fromEntries(['pitch', 'punch', 'length', 'tone', 'drive'].map(k => [k, 5 + Math.round(Math.random() * 18) * 5]))); L.preset = null; X.save(); X.eng && X.apply(X.eng, L); paint(); X.audition(L); break; }
    case 'preset': if (L) setPreset(L, v); break;
    case 'osc': if (L) { L.p.osc = v.toLowerCase(); X.save(); paint(); X.audition(L); } break;
    case 'dd': ui.dd = ui.dd === v ? null : v; paint(); break;
    case 'ddpick': { const [kind, id] = v.split(':'); ui.dd = null;
      if (kind === 'fi' || kind === 'fo') { (kind === 'fi' ? s.fin : s.fout).type = b.dataset.o; X.save(); paint(); break; }
      const T = X.byId(id); if (T) setStyle(T, b.dataset.o); break; }
    case 'speed': { if (!L) return; const m = SPL.find(x => x[1] === v); if (!m) return; L.speed = m[0]; X.save(); X.eng && X.apply(X.eng, L); X.restartLoop(L); paint(); break; }
    case 'fx': { if (!L) return; const f = X.FX.find(x => x[1] === v); if (!f) return; L.fx = f[0]; if (typeof L.fxAmt !== 'number') L.fxAmt = 60; X.save(); X.eng && X.apply(X.eng, L); if (!X.SEQ.playing && f[0] !== 'none') X.audition(L); paint(); break; }
    case 'undo': msg('mx', X.undo() ? 'Undone.' : 'Nothing to undo.'); paint(); break;
    case 'clearall': if (!ui.clearArm) { ui.clearArm = true; paint(); clearTimeout(ui.clearT); ui.clearT = setTimeout(() => { ui.clearArm = false; paint(); }, 4000); break; }
      ui.clearArm = false; X.clearAll(); msg('mx', 'Cleared. Add a layer to start again, or Undo to bring it back.'); paint(); break;
    case 'resetwin': if (s.win) delete s.win[s.mode]; X.save(); paint(); break;
    case 'sess':
      if (X.SESS.mr) { msg('mx', 'Saving your session…'); X.sessionStop().then(r => { if (r && r.error) msg('mx', r.error, true); else if (r) msg('mx', `${r.name} saved · ${fmtDur(r.dur)}.`); paint(); }); }
      else X.sessionStart().then(() => { msg('mx', 'Recording. Play, change and mute things — everything you hear is kept.'); paint(); }).catch(err => msg('mx', err.message || 'Couldn’t start recording.', true));
      break;
    case 'sessplay': sessPlay(v); break;
    case 'sesswav': { const f = X.fileById(v); if (!f) break; msg('mx', `Making ${f.name}.wav…`); X.bufferFor(v).then(buf => { const a = document.createElement('a'); a.href = URL.createObjectURL(X.wav(buf)); a.download = `advl-auditory-${f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.wav`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); msg('mx', `Downloaded ${a.download}`); }).catch(() => msg('mx', 'That session couldn’t be read.', true)); break; }
    case 'amode': if (!L) return; L.mode = v; X.save(); paint(); X.restartLoop(L); break;
    case 'hear': if (L) { X.ensure(); X.audition(L); } break;
    case 'remove': if (!L) return; if (X.eng) { X.loopStop(X.eng, L.id); X.dropChain(X.eng, L.id); } s.layers = s.layers.filter(x => x !== L); if (s.sel === L.id) s.sel = s.layers[0] ? s.layers[0].id : null; X.save(); paint(); break;
    case 'mute': if (!L) return; L.mute = !L.mute; X.save(); X.eng && X.applyAll(X.eng); paint(); break;
    case 'solo': if (!L) return; L.solo = !L.solo; X.save(); X.eng && X.applyAll(X.eng); paint(); break;
    case 'bar': { if (!L) return; const bi = +b.dataset.b; L.barsOn = L.barsOn || Array(s.bars).fill(true); L.barsOn[bi] = L.barsOn[bi] === false; b.setAttribute('aria-pressed', L.barsOn[bi]); X.save(); drawViz(); break; }
    case 'moverec': if (!L) return; ui.moveRec = ui.moveRec === L.id ? false : L.id; if (ui.moveRec && !X.SEQ.playing) X.play(); paint(); break;
    case 'snap': if (L && L.auto) { L.auto = L.auto.map(x => x == null ? x : Math.round(x * 12) / 12); X.save(); paint(); } break;
    case 'clearauto': if (L) { L.auto = null; X.save(); paint(); } break;
    case 'stepmode': ui.stepMode = v; paint(); break;
    case 'tab': ui.tab = v; paint(); break;
    case 'sheet': openSheet(v); break;
    case 'loopbars': ui.loopBars = +v; paintCreate(); break;
    case 'humbars': ui.humBars = +v; paintCreate(); break;
    case 'recloop': startRec('loop'); break;
    case 'rechum': startRec('hum'); break;
    case 'humto': ui.humTo = (MEL_TO.find(m => m[1] === v) || ['handpan'])[0]; paintCreate(); break;
    case 'humplay': if (ui.hum) { const T = ui.humTo === 'drums' ? X.melodyLayer('kick', ui.hum.kick, [], 'hum') : X.melodyLayer(ui.humTo, ui.hum.steps, ui.hum.notes, 'hum'); previewLayer(T); } break;
    case 'humadd': humAdd(); break;
    case 'movebars': ui.move.bars = +v; ui.move.path = []; paintCreate(); break;
    case 'moveto': ui.move.to = (MEL_TO.find(m => m[1] === v) || ['theremin'])[0]; paintCreate(); break;
    case 'moveclear': ui.move.path = []; paintCreate(); break;
    case 'moveadd': moveAdd(); break;
    case 'addfile': { const f = X.fileById(v); if (f && !s.layers.some(x => x.file === f.id)) { X.ensure(); X.bufferFor(f.id).catch(() => {}).then(() => { addLayer(X.audioLayer(f)); X.restartLoop(X.byId(s.sel)); }); } break; }
    case 'askdel': ui.confirm = v; paint(); break;
    case 'delfile': X.removeFile(v).then(paint); break;
    case 'delmix': X.removeMix(v).then(paint); break;
    case 'openmix': if (X.openMix(v)) { msg('mx', 'Mix opened.'); paint(); } else msg('mx', 'That mix couldn’t be opened.', true); break;
    case 'savebox': ui.saving = !ui.saving; ui.exp = false; paint(); if (ui.saving) { const i = root.querySelector('.savebox input'); i && (i.focus(), i.select()); } break;
    case 'exp': ui.exp = !ui.exp; ui.saving = false; paint(); break;
    case 'export': ui.exp = false; paint(); exportMix(v); break;
    case 'expand': openPop(); break;
    case 'close': closePop(); closeSheet(); break;
    case 'quicksave': X.saveMix((X.LIB.mixes.find(m => m.id === s.cur) || {}).name || `Mix ${X.LIB.mixes.length + 1}`).then(() => { const k = pop && pop.querySelector('.foot .k'); if (k) k.textContent = 'Saved'; paint(); }); break;
  }
}
function sessPlay(id) {
  const cur = ui.sessPlay; if (cur) { try { cur.src.stop(); } catch (e) {} ui.sessPlay = null; }
  if (cur && cur.id === id) { paint(); return; }
  if (X.SEQ.playing) X.stop(); X.ensure();
  X.bufferFor(id).then(buf => { const src = X.ctx.createBufferSource(); src.buffer = buf; src.connect(X.ctx.destination); src.start(); ui.sessPlay = { id, src }; src.onended = () => { if (ui.sessPlay && ui.sessPlay.src === src) { ui.sessPlay = null; paint(); } }; paint(); }).catch(() => msg('mx', 'That session couldn’t be read.', true));
}
/* play a not-yet-added layer once through, for "Hear it" */
function previewLayer(T) { X.previewOnce(T); }

/* ---------- inputs, knobs, drags ---------- */
function setVal(key, L, v) {
  const s = S(), [scope, k] = key.split('.');
  if (scope === 'g') { s[k] = v; if (X.eng) { if (k === 'room') X.setRoom(X.eng); else X.levels(X.eng); } }
  else if (scope === 'p' && L) { L.p[k] = v; L.preset = null; if (X.eng) X.apply(X.eng, L); const cv = root.querySelector(`canvas[data-kw="${L.id}"]`); cv && kick(cv);
    if (k === 'pitch' && L.kind === 'audio' && X.eng) { const sN = X.eng.loops.get(L.id); sN && sN.playbackRate.setTargetAtTime(Math.pow(2, (v - 50) * 24 / 100 / 12), X.ctx.currentTime, 0.05); } }
  else if (scope === 'l' && L) { L[k] = v; if (X.eng) X.apply(X.eng, L); }
  X.save();
}
function syncInputs(key, L, v, except) {
  const sel = `[data-in="${key}"]${L ? `[data-l="${L.id}"]` : ''}`;
  [root, sheet].forEach(r => r && r.querySelectorAll(sel).forEach(o => { if (o === except) return; o.value = v; o.style.setProperty('--fill', (v / +o.max) * 100 + '%'); const b = o.closest('label') && o.closest('label').querySelector('span b'); if (b) b.textContent = pct(key, v); }));
  [root].forEach(r => r && r.querySelectorAll(`[data-kn="${key}"]${L ? `[data-l="${L.id}"]` : ''}`).forEach(kn => knobShow(kn, v)));
  if (key === 'l.depth' || key === 'l.around') root.querySelectorAll(`[data-room="${L.id}"]`).forEach(rm => { const w = document.createElement('div'); w.innerHTML = room(L); rm.replaceWith(w.firstElementChild); });
  if (key === 'l.vol' && L) { const db = root.querySelector(`[data-db="${L.id}"]`); if (db) db.textContent = v ? (20 * Math.log10(v / 100)).toFixed(0) + ' dB' : '−∞'; }
  if ((key === 'p.tone' || key === 'p.res') && L) { const lb = root.querySelector('[data-filtlbl]'); if (lb) lb.textContent = `Filter · cutoff ${Math.round(120 * Math.pow(2, L.p.tone / 100 * 7.5))} Hz · resonance ${Math.round(L.p.res)}%`; }
}
function knobShow(kn, v) { const arc = kn.querySelector('[data-arc]'), r = +arc.getAttribute('r'), C = 2 * Math.PI * r; arc.setAttribute('stroke-dasharray', `${C * .75 * v / 100} ${C}`); kn.querySelector('text').textContent = Math.round(v); kn.setAttribute('aria-valuenow', Math.round(v)); }
function onInput(e) {
  const t = e.target, key = t.dataset.in; if (!key || key === 'files') return;
  if (key === 'feel') { if (t.value) setBpm(+t.value); return; }
  if (key === 'f.in' || key === 'f.out') { (key === 'f.in' ? S().fin : S().fout).bars = +t.value; X.save(); updateFades(); return; }
  const v = +t.value, L = t.dataset.l ? X.byId(t.dataset.l) : null; t.style.setProperty('--fill', (v / +t.max) * 100 + '%');
  const b = t.closest('label') && t.closest('label').querySelector('span b'); if (b) b.textContent = pct(key, v);
  if (key === 'g.bass' || key === 'g.vol') { const lab = t.closest('.ring'); if (lab) { const arc = lab.querySelector('[data-arc]'), C = 2 * Math.PI * 26; arc.setAttribute('stroke-dasharray', `${C * .75 * v / 100} ${C}`); lab.querySelector('text').textContent = v; } }
  setVal(key, L, v); syncInputs(key, L, v, t);
}
function onChange(e) {
  const t = e.target;
  if (t.dataset.in === 'files') { upload([...t.files]); t.value = ''; return; }
  const L = t.dataset.l ? X.byId(t.dataset.l) : null;
  if (L && /^p\./.test(t.dataset.in) && !X.SEQ.playing) X.audition(L);
  if (L && (t.dataset.in === 'p.pitch' || /^l\.fade/.test(t.dataset.in))) X.restartLoop(L);
}
let drag = null;
function svgPt(svg, e) { const r = svg.getBoundingClientRect(), vb = svg.viewBox.baseVal; return { x: (e.clientX - r.left) / r.width * vb.width, y: (e.clientY - r.top) / r.height * vb.height, fx: clamp((e.clientX - r.left) / r.width, 0, 1), fy: clamp((e.clientY - r.top) / r.height, 0, 1) }; }
function stepAt(box, e) { const r = box.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width, 0, 1) * X.totalSteps(); }
function scrubTo(g) { const s = S(); g = clamp(g, s.start, s.end - 1); if (!X.SEQ.playing) { if (ui.sessPlay) sessPlay(ui.sessPlay.id); X.play(g); } else X.seek(g); }
function ghost(e) {
  const box = e.target.closest && e.target.closest('[data-scrub]'), gh = root && root.querySelector('[data-ghost]');
  if (!gh) return; if (!box || !box.querySelector('[data-ghost]') || e.target.closest('[data-mk],[data-fr]')) { gh.hidden = true; return; }
  const r = box.getBoundingClientRect(), f = clamp((e.clientX - r.left) / r.width, 0, 1), s = S(), g = clamp(f * X.totalSteps(), s.start, s.end - 1);
  gh.hidden = false; gh.style.left = g / X.totalSteps() * 100 + '%'; const sp = gh.firstElementChild; sp.textContent = `▶ Click to play from bar ${(g / 16 + 1).toFixed(1)} · drag to skim`;
  sp.style.left = f > .7 ? 'auto' : '8px'; sp.style.right = f > .7 ? '8px' : 'auto';
}
function onDown(e) {
  const t = e.target;
  const wg = t.closest('[data-wgrip]'); if (wg && !phone()) { e.preventDefault(); winDown(e, 'win', wg.dataset.wgrip); return; }
  const ws = t.closest('[data-wsize]'); if (ws) { e.preventDefault(); winDown(e, 'wsize', ws.dataset.wsize); return; }
  const fr = t.closest('[data-fr]'); if (fr) { drag = { type: 'fr', which: fr.dataset.fr, box: fr.parentElement }; fr.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const kn = t.closest('[data-kn]'); if (kn) { const L = kn.dataset.l ? X.byId(kn.dataset.l) : null, key = kn.dataset.kn; drag = { type: 'kn', kn, L, key, y: e.clientY, v: key.startsWith('g.') ? S()[key.slice(2)] : key.startsWith('p.') ? L.p[key.slice(2)] : L[key.slice(2)] }; kn.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const dash = t.closest('[data-dash]'); if (dash) { drag = { type: 'dash', el: dash, L: X.byId(dash.dataset.dash), y: e.clientY, moved: false }; dash.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const mk = t.closest('[data-mk]'); if (mk) { drag = { type: 'mk', which: mk.dataset.mk, box: mk.parentElement }; mk.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const sb = t.closest('[data-scrub]'); if (sb && !t.closest('[data-mk]')) { drag = { type: 'scrub', box: sb, last: 0, g: -1 }; sb.setPointerCapture(e.pointerId); e.preventDefault(); const g = Math.floor(stepAt(sb, e)); drag.g = g; drag.last = performance.now(); scrubTo(g); return; }
  const trim = t.closest('.trim'); if (trim) { const c = trim.closest('[data-clip]'); drag = { type: 'trim', c, L: X.byId(c.dataset.clip), side: +trim.dataset.trim }; trim.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const pad = t.closest('[data-pad]'); if (pad) { const L = X.byId(pad.dataset.pad); drag = { type: 'pad', pad, L, svg: pad.querySelector('svg') }; pad.setPointerCapture(e.pointerId); e.preventDefault(); onMove(e); return; }
  const md = t.closest('[data-movedraw]'); if (md) { ui.move.path = []; drag = { type: 'movedraw', box: md, svg: md.querySelector('svg') }; md.setPointerCapture(e.pointerId); e.preventDefault(); onMove(e); return; }
  const rm = t.closest('[data-room]'); if (rm) { drag = { type: 'room', svg: rm, L: X.byId(rm.dataset.room) }; rm.setPointerCapture(e.pointerId); e.preventDefault(); onMove(e); return; }
  const gr = t.closest('[data-adsr],[data-filt]'); if (gr) { const h = t.closest('[data-h]') || null; drag = { type: gr.dataset.adsr ? 'adsr' : 'filt', svg: gr, L: X.byId(gr.dataset.adsr || gr.dataset.filt), h: h ? h.dataset.h : (gr.dataset.filt ? 'f' : null) }; if (!drag.h) { drag = null; return; } gr.setPointerCapture(e.pointerId); e.preventDefault(); return; }
  const bars = t.closest('[data-bars]'); if (bars) { drag = { type: 'bars', el: bars, L: X.byId(bars.dataset.bars) }; bars.setPointerCapture(e.pointerId); e.preventDefault(); onMove(e); return; }
}
function onMove(e) {
  if (!drag) { ghost(e); return; } const d = drag, s = S();
  if (d.type === 'win') { const x = clamp(d.x0 + e.clientX - d.sx, 0, d.W - d.el.offsetWidth), y = Math.max(0, d.y0 + e.clientY - d.sy); d.el.style.left = x / d.W * 100 + '%'; d.el.style.top = y + 'px'; d.x = x; d.y = y; deskHeight(); return; }
  if (d.type === 'wsize') { const x = d.x0, w = clamp(d.w0 + e.clientX - d.sx, Math.min(300, d.W - x), d.W - x); d.el.style.width = w / d.W * 100 + '%'; d.w = w; if (d.id === 'piece') drawViz(); return; }
  if (d.type === 'fr') { const g = stepAt(d.box, e), { start, end } = X.fadeLens(), mx = maxFade(); let bars = (d.which === 'in' ? g - start : end - g) / 16; bars = clamp(Math.round(bars * 4) / 4, 0, mx);
    const f = d.which === 'in' ? s.fin : s.fout; if (f.bars !== bars) { f.bars = bars; updateFades(); } return; }
  if (d.type === 'scrub') { const g = Math.floor(stepAt(d.box, e)), now = performance.now(); ghost(e); if (g !== d.g && now - d.last > 70) { d.g = g; d.last = now; scrubTo(g); } return; }
  if (d.type === 'kn') { const v = clamp(d.v + (d.y - e.clientY) * 0.6, 0, 100); setVal(d.key, d.L, v); knobShow(d.kn, v); syncInputs(d.key, d.L, v); }
  else if (d.type === 'dash') {
    if (Math.abs(e.clientY - d.y) > 6) d.moved = true; if (!d.moved) return;
    const row = d.el.closest('[data-ly]'); row.classList.add('dragging'); row.style.transform = `translateY(${e.clientY - d.y}px)`;
  }
  else if (d.type === 'mk') { const r = d.box.getBoundingClientRect(), T = X.totalSteps(); let st = Math.round(clamp((e.clientX - r.left) / r.width, 0, 1) * T);
    if (d.which === 'start') s.start = clamp(st, 0, s.end - 1); else s.end = clamp(st, s.start + 1, T);
    root.querySelectorAll(`[data-mk="${d.which}"]`).forEach(m => { m.style.left = (d.which === 'start' ? s.start : s.end) / T * 100 + '%'; });
    const dl = root.querySelector('.dimL'), dr = root.querySelector('.dimR'); if (dl) dl.style.width = s.start / T * 100 + '%'; if (dr) dr.style.left = s.end / T * 100 + '%'; }
  else if (d.type === 'trim') { const r = d.c.getBoundingClientRect(), f = clamp((e.clientX - r.left) / r.width, 0, 1), L = d.L;
    if (d.side === 0) L.trim[0] = Math.min(f, L.trim[1] - .02); else L.trim[1] = Math.max(f, L.trim[0] + .02);
    const [s0, s1] = d.c.querySelectorAll('.shade'), [t0, t1] = d.c.querySelectorAll('.trim'); s0.style.width = L.trim[0] * 100 + '%'; s1.style.width = (1 - L.trim[1]) * 100 + '%'; t0.style.left = L.trim[0] * 100 + '%'; t1.style.left = L.trim[1] * 100 + '%'; }
  else if (d.type === 'pad') { const p = svgPt(d.svg, e), L = d.L, n = 64; L.auto = L.auto || Array(n).fill(null);
    const y = clamp(1 - p.fy * 2, -1, 1), fx = ui.moveRec === L.id && X.SEQ.playing ? (X.SEQ.cur + .5) / X.totalSteps() : p.fx, i = Math.round(fx * (n - 1));
    if (d.last != null && Math.abs(i - d.last) > 1) { const a = Math.min(i, d.last), b = Math.max(i, d.last); for (let k = a; k <= b; k++) L.auto[k] = y; } else L.auto[i] = y; d.last = i;
    const path = d.pad.querySelector('[data-autopath]'); path && path.setAttribute('d', autoPath(L, 600, +d.svg.viewBox.baseVal.height)); }
  else if (d.type === 'movedraw') { const p = svgPt(d.svg, e); ui.move.path.push({ x: p.fx, y: clamp(1 - p.fy * 2, -1, 1) }); const w = 600, h = 160;
    d.box.querySelector('[data-mpath]').setAttribute('d', ui.move.path.slice().sort((a, b) => a.x - b.x).map((q, i) => (i ? 'L' : 'M') + (q.x * w).toFixed(1) + ' ' + (h / 2 - q.y * h * .45).toFixed(1)).join('')); }
  else if (d.type === 'room') { const p = svgPt(d.svg, e), size = d.svg.viewBox.baseVal.width, dx = p.x - size / 2, dy = size / 2 - p.y, r = size / 2 - 8;
    const dist = clamp(Math.hypot(dx, dy) / r, 0, 1), deg = Math.atan2(dx, dy) * 180 / Math.PI; let ar = (deg + 90) / 270 * 100; if (deg < -90) ar = (deg + 450) / 270 * 100; ar = clamp(ar, 0, 100);
    d.L.depth = Math.round(clamp((dist - .18) / .82, 0, 1) * 100); d.L.around = Math.round(ar); X.eng && X.apply(X.eng, d.L); X.save();
    const ang = (d.L.around / 100 * 270 - 90) * Math.PI / 180, dd2 = .18 + d.L.depth / 100 * .82, x = size / 2 + Math.sin(ang) * r * dd2, y = size / 2 - Math.cos(ang) * r * dd2;
    const dot = d.svg.querySelector('[data-rd]'), ln = d.svg.querySelector('[data-rl]'); dot.setAttribute('cx', x); dot.setAttribute('cy', y); ln.setAttribute('x2', x); ln.setAttribute('y2', y);
    ['l.depth', 'l.around'].forEach(k => root.querySelectorAll(`[data-in="${k}"][data-l="${d.L.id}"]`).forEach(o => { const v = d.L[k.slice(2)]; o.value = v; o.style.setProperty('--fill', v + '%'); const b = o.closest('label').querySelector('span b'); if (b) b.textContent = v + '%'; })); }
  else if (d.type === 'adsr') { const p = svgPt(d.svg, e), L = d.L;
    if (d.h === 'a') L.p.a = clamp((p.x - 6) / 70 * 100, 0, 100);
    if (d.h === 'd') { L.p.length = clamp((p.x - 12 - L.p.a / 100 * 70) / 90 * 100, 0, 100); L.p.s = clamp((90 - 6 - p.y) / (90 - 14) * 100, 0, 100); }
    if (d.h === 'r') L.p.r = clamp((p.x - (18 + L.p.a / 100 * 70 + L.p.length / 100 * 90) - 60) / 90 * 100, 0, 100);
    X.save(); const w = document.createElement('div'); w.innerHTML = adsrGraph(L); const n = w.firstElementChild; d.svg.replaceWith(n); d.svg = n; }
  else if (d.type === 'filt') { const p = svgPt(d.svg, e), L = d.L; L.p.tone = clamp((p.x - 20) / 260 * 100, 0, 100); L.p.res = clamp((40 - (p.y - 2)) / 34 * 100, 0, 100); X.eng && X.apply(X.eng, L); X.save();
    const w = document.createElement('div'); w.innerHTML = filterGraph(L); const n = w.firstElementChild; d.svg.replaceWith(n); d.svg = n; syncInputs('p.tone', L, L.p.tone); syncInputs('p.res', L, L.p.res); }
  else if (d.type === 'bars') { const r = d.el.getBoundingClientRect(), L = d.L, i = clamp(Math.floor((e.clientX - r.left) / r.width * 16), 0, 15), v = clamp(1 - (e.clientY - r.top) / r.height, 0.05, 1);
    if (ui.stepMode === 'notes' && isMel(L)) L.notes[i] = Math.round(v * 24 - 12); else L.vel[i] = v; X.save(); const bar = d.el.children[i]; if (bar) bar.style.height = Math.max(4, v * 100) + '%'; }
}
function onUp(e) {
  if (!drag) return; const d = drag; drag = null; const s = S();
  if (d.type === 'win' || d.type === 'wsize') {
    removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp);
    d.el.classList.remove('lift'); document.body.classList.remove('au-moving'); const p = freeMap()[d.id], snap = v => Math.round(v / 8) * 8;
    if (d.type === 'win' && d.x != null) { p.x = clamp(snap(d.x), 0, d.W - d.el.offsetWidth) / d.W; p.y = snap(d.y); d.el.style.left = p.x * 100 + '%'; d.el.style.top = p.y + 'px'; }
    if (d.type === 'wsize' && d.w != null) { p.w = snap(d.w) / d.W; d.el.style.width = p.w * 100 + '%'; drawViz(); }
    X.save(); deskHeight(); return;
  }
  if (d.type === 'fr') { X.save(); return; }
  if (d.type === 'scrub') { const gh = root && root.querySelector('[data-ghost]'); if (gh && e.type === 'pointercancel') gh.hidden = true; return; }
  if (d.type === 'dash') {
    const row = d.el.closest('[data-ly]');
    if (!d.moved) { const L = d.L; L.hidden = !L.hidden; X.eng && X.apply(X.eng, L); X.restartLoop(L); X.save(); paint(); return; }
    // drop: reorder within the layer's own group
    const g = X.groupOf(d.L), rows = [...root.querySelectorAll(row.classList.contains('lane') ? '.lane[data-ly]' : '.ly[data-ly]')].filter(r => r !== row && X.groupOf(X.byId(r.dataset.ly)) === g);
    const y = e.clientY; let before = null; for (const r of rows) { const b = r.getBoundingClientRect(); if (y < b.top + b.height / 2) { before = r.dataset.ly; break; } }
    s.layers = s.layers.filter(L => L !== d.L); const idx = before ? s.layers.findIndex(L => L.id === before) : (() => { const last = rows[rows.length - 1]; return last ? s.layers.findIndex(L => L.id === last.dataset.ly) + 1 : s.layers.length; })();
    s.layers.splice(idx < 0 ? s.layers.length : idx, 0, d.L); X.save(); paint();
  }
  else if (d.type === 'mk') { X.SEQ.meas = []; X.save(); paint(); }
  else if (d.type === 'trim') { X.save(); X.restartLoop(d.L); }
  else if (d.type === 'pad') { X.save(); }
  else if (d.type === 'movedraw') { ui.move.path.sort((a, b) => a.x - b.x); paintCreate(); }
  else if (d.type === 'kn' && d.L && !X.SEQ.playing && d.key.startsWith('p.')) X.audition(d.L);
  else if (d.type === 'adsr' || d.type === 'filt') { if (!X.SEQ.playing) X.audition(d.L); }
  else if (d.type === 'bars') drawViz();
}
function onKey(e) {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) { e.preventDefault(); msg('mx', X.undo() ? 'Undone.' : 'Nothing to undo.'); paint(); return; }
  const kn = e.target.closest && e.target.closest('[data-kn]');
  if (kn && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(e.key)) {
    e.preventDefault(); const L = kn.dataset.l ? X.byId(kn.dataset.l) : null, key = kn.dataset.kn, cur = key.startsWith('g.') ? S()[key.slice(2)] : key.startsWith('p.') ? L.p[key.slice(2)] : L[key.slice(2)];
    const step = /Page/.test(e.key) ? 10 : 2, v = clamp(cur + (/Up|Right/.test(e.key) ? step : -step), 0, 100); setVal(key, L, v); knobShow(kn, v); syncInputs(key, L, v); return;
  }
  const tr = e.target.closest && e.target.closest('.trim');
  if (tr && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { const c = tr.closest('[data-clip]'), L = X.byId(c.dataset.clip), sd = +tr.dataset.trim, dlt = e.key === 'ArrowLeft' ? -.02 : .02; e.preventDefault();
    if (sd === 0) L.trim[0] = clamp(L.trim[0] + dlt, 0, L.trim[1] - .02); else L.trim[1] = clamp(L.trim[1] + dlt, L.trim[0] + .02, 1); X.save(); paint(); X.restartLoop(L); }
  const mk = e.target.closest && e.target.closest('[data-mk]');
  if (mk && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const s = S(), dl = e.key === 'ArrowLeft' ? -16 : 16;
    if (mk.dataset.mk === 'start') s.start = clamp(s.start + dl, 0, s.end - 1); else s.end = clamp(s.end + dl, s.start + 1, X.totalSteps()); X.save(); paint(); root.querySelector(`[data-mk="${mk.dataset.mk}"]`).focus(); }
  const frk = e.target.closest && e.target.closest('[data-fr]');
  if (frk && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); const f = frk.dataset.fr === 'in' ? S().fin : S().fout, dir = (e.key === 'ArrowRight') === (frk.dataset.fr === 'in') ? 1 : -1; f.bars = clamp(f.bars + dir * .25, 0, maxFade()); X.save(); updateFades(); return; }
  const wgk = e.target.closest && e.target.closest('[data-wgrip]');
  if (wgk && /^Arrow/.test(e.key) && !phone()) { e.preventDefault(); const id = wgk.dataset.wgrip; if (!isFree()) freeze(); const p = freeMap()[id], d = root.querySelector('[data-desk]'), W = d.clientWidth, n = e.shiftKey ? 80 : 16;
    if (e.key === 'ArrowLeft') p.x = Math.max(0, p.x - n / W); if (e.key === 'ArrowRight') p.x = Math.min(1 - p.w, p.x + n / W); if (e.key === 'ArrowUp') p.y = Math.max(0, p.y - n); if (e.key === 'ArrowDown') p.y += n;
    front(id); X.save(); paint(); const g = root.querySelector(`[data-wgrip="${id}"]`); g && g.focus({ preventScroll: true }); return; }
  const dash = e.target.closest && e.target.closest('[data-dash]');
  if (dash && ['ArrowUp', 'ArrowDown'].includes(e.key) && e.altKey) { e.preventDefault(); const s = S(), L = X.byId(dash.dataset.dash), g = X.groupOf(L), same = s.layers.filter(x => X.groupOf(x) === g), i = same.indexOf(L), j = i + (e.key === 'ArrowUp' ? -1 : 1);
    if (j >= 0 && j < same.length) { const a = s.layers.indexOf(L), b = s.layers.indexOf(same[j]); [s.layers[a], s.layers[b]] = [s.layers[b], s.layers[a]]; X.save(); paint(); root.querySelector(`[data-dash="${L.id}"]`).focus(); } }
  if (e.key === 'Escape') { if (ui.dd) { ui.dd = null; paint(); } closePop(); closeSheet(); }
}
function bind(el) {
  el.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && el.contains(b) && !b.disabled) act(b, e); else if (ui.dd && !e.target.closest('.dd')) { ui.dd = null; paint(); } });
  el.addEventListener('input', onInput); el.addEventListener('change', onChange);
  el.addEventListener('submit', e => { if (e.target.dataset.form === 'save') { e.preventDefault(); ui.saving = false; X.saveMix(e.target.n.value.trim()).then(r => { msg('mx', `Saved “${r.name}”.`); paint(); }).catch(() => msg('mx', 'Saving needs browser storage, which is off here.', true)); } });
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);
  el.addEventListener('keydown', onKey);
  el.addEventListener('pointerleave', () => { const gh = root && root.querySelector('[data-ghost]'); if (gh) gh.hidden = true; });
  el.addEventListener('dragover', e => { const d = e.target.closest('[data-drop]'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  el.addEventListener('dragleave', e => { const d = e.target.closest('[data-drop]'); if (d) d.classList.remove('over'); });
  el.addEventListener('drop', e => { const d = e.target.closest('[data-drop]'); if (!d) return; e.preventDefault(); d.classList.remove('over'); upload([...e.dataTransfer.files].filter(f => /^(audio|video)\//.test(f.type) || /\.(mp3|wav|m4a|aac|ogg|mp4|mov|m4v|webm)$/i.test(f.name))); });
}

/* ---------- phone: Expand pop-up (every showing layer on one screen) and sheets ---------- */
function popHTML() {
  const s = S(), cols = s.layers.filter(L => !L.hidden && (L.kind === 'synth' || X.fileById(L.file)));
  let g = '<span style="grid-column:1;grid-row:1"></span>';
  cols.forEach((L, ci) => { g += `<div class="h" style="--c:${col(L)};grid-column:${ci + 2};grid-row:1">${X.shortOf(L)}</div>`; });
  for (let i = 0; i < 16; i++) {
    g += `<span class="n" data-r="${i}" style="grid-column:1;grid-row:${i + 2};${i % 4 === 0 ? 'color:var(--soft)' : ''}">${i % 4 === 0 ? i / 4 + 1 : '·'}</span>`;
    cols.forEach((L, ci) => { if (L.kind === 'synth' || L.mode === 'steps') g += `<button type="button" class="${cellCls(L.steps[i], i)}" data-act="cell" data-l="${L.id}" data-i="${i}" aria-pressed="${L.steps[i]}" aria-label="${esc(X.nameOf(L))}, step ${i + 1}" style="--c:${col(L)};grid-column:${ci + 2};grid-row:${i + 2}"></button>`; });
  }
  cols.forEach((L, ci) => { if (L.kind === 'audio' && L.mode === 'loop') g += `<div class="vclip" style="--c:${col(L)};grid-column:${ci + 2};grid-row:2 / span 16"><svg viewBox="0 0 40 400" preserveAspectRatio="none" aria-hidden="true"><path d="${waveD(X.fileById(L.file).peaks, 40, 400, true)}"/></svg></div>`; });
  const hid = s.layers.length - cols.length, pl = X.SEQ.playing;
  return `<div class="hd"><b>01 · advl auditory</b><button type="button" class="cl" data-act="close" aria-label="Close">${I.close}</button></div>
    <div class="trp"><button type="button" class="play${pl ? ' on' : ''}" data-act="play" aria-label="${pl ? 'Stop' : 'Play'}">${pl ? I.stop : I.play}</button><div class="bpm"><b data-bpm>${s.bpm}</b><span> BPM</span></div>
      <button type="button" class="rb" data-act="bpm" data-v="-1" aria-label="Slower">−</button><button type="button" class="rb" data-act="bpm" data-v="1" aria-label="Faster">+</button>
      <select data-in="feel" aria-label="Pick a feel"><option value="">Feel</option>${FEELS.map(([l, b]) => `<option value="${b}"${s.bpm === b ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
    <div class="pg" style="grid-template-columns:14px repeat(${Math.max(1, cols.length)},minmax(0,1fr))"><span class="hl" aria-hidden="true"></span>${g}</div>
    <div class="foot"><span class="k">${cols.length} showing${hid ? ` · ${hid} hidden` : ''}</span><button type="button" class="pill sm" data-act="close">Layers</button><button type="button" class="pill solid sm" data-act="quicksave">Save mix</button></div>`;
}
function popPaint() { if (pop) { pop.innerHTML = popHTML(); if (X.SEQ.cur >= 0) head(X.SEQ.cur); } }
function overlay(cls, label) {
  dim = dim || Object.assign(document.createElement('div'), { className: 'au-dim' }); dim.onclick = () => { closePop(); closeSheet(); };
  const el = document.createElement('div'); el.className = cls; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', label);
  if (!dim.isConnected) document.body.append(dim); document.body.append(el); document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => { dim.classList.add('in'); el.classList.add('in'); const c = el.querySelector('.cl'); c && c.focus(); });
  bind(el); return el;
}
function openPop() { if (pop) return; pop = overlay('au-pop', 'advl auditory, all layers'); popPaint(); }
function closePop() { if (!pop) return; const p = pop; pop = null; fade(p); }
function sheetPaint() { if (!sheet) return; sheet.innerHTML = `<div class="aud in-sheet"><div class="row"><span class="grow"></span><button type="button" class="cl" data-act="close" aria-label="Close">${I.close}</button></div>${createPanel(ui.sheet)}</div>`; }
function openSheet(tab) { ui.sheet = tab; if (!sheet) sheet = overlay('au-sheet', tab === 'rec' ? 'Record a loop' : tab === 'hum' ? 'Hum a melody' : 'Move a melody'); sheetPaint(); }
function closeSheet() { if (!sheet) return; const s = sheet; sheet = null; ui.sheet = null; fade(s); }
function fade(el) { el.classList.remove('in'); const last = !pop && !sheet; if (last && dim) { const d = dim; dim = null; d.classList.remove('in'); setTimeout(() => d.remove(), RM ? 0 : 900); document.documentElement.style.overflow = ''; } setTimeout(() => el.remove(), RM ? 0 : 900); paint(); }

/* ---------- mount ---------- */
function css() { if (document.querySelector('link[data-aud-css]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'auditory.css'; l.dataset.audCss = ''; document.head.appendChild(l); }
let bound = false;
window.ADVL_AUD = {
  async mount(el) {
    if (root === el) return; css();
    X = await loadCore(); root = el; ui.dd = null; ui.voices = false;
    if (!X.S.sel && X.S.layers[0]) X.S.sel = X.S.layers[0].id;
    if (!bound) { bound = true; X.SEQ.listeners.add((type, g) => { if (type === 'step') { head(g); if (g >= 0 && g % 4 === 0) drawViz(); } else if (type === 'frame') frame(); else if (type === 'session') paint(); else if (type === 'play' || type === 'stop') { [root, pop].forEach(r => r && r.querySelectorAll('[data-act="play"]').forEach(b => { b.innerHTML = X.SEQ.playing ? I.stop : I.play; b.classList.toggle('on', X.SEQ.playing); b.setAttribute('aria-label', X.SEQ.playing ? 'Stop' : 'Play'); })); if (type === 'stop') { ui.moveRec = false; head(-1); } } });
      let wasPhone = phone(); setInterval(() => { if (X.SESS.mr && root) root.querySelectorAll('[data-rectime]').forEach(t => { t.textContent = sessTime(); }); }, 500);
      addEventListener('resize', () => { if (phone() !== wasPhone) { wasPhone = phone(); paint(); } drawViz(); if (pop && !phone()) closePop(); if (sheet && !phone()) closeSheet(); });
      document.addEventListener('visibilitychange', () => { if (document.hidden) X.stop(); }); }
    bind(el); paint(); await X.loadLibrary(); paint();
  },
  unmount() { if (X) { if (X.SESS.mr) X.sessionStop(); if (ui.sessPlay) { try { ui.sessPlay.src.stop(); } catch (e) {} ui.sessPlay = null; } X.stop(); } if (ro) ro.disconnect(); closePop(); closeSheet(); root = null; },
  get X() { return X; }
};
})();
