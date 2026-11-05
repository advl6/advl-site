/* advl auditory (project 18): a beat maker with layers, an audio library and saved mixes.
   Drum and bass sounds are synthesized in the browser. Uploaded audio and saved mixes are kept in the
   visitor's own browser (IndexedDB); nothing is sent anywhere. Loaded by core.js only on its page. */
(() => {
'use strict';
if (window.ADVL_AUD) return;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 10);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => matchMedia('(max-width:1023px)').matches;

const VOICE = {
  kick:  { name: 'Kick',   color: '#CFF002', bassy: true, params: [30, 70, 55], start: [0, 4, 8, 12],
    knobs: [['Pitch', 'Low thump to high knock'], ['Punch', 'Soft to hard hit'], ['Length', 'Short to booming']],
    sounds: ['Deep 808', 'Punchy kick', 'Clicky kick', 'Boom kick', 'Rubber kick', 'Tight kick'] },
  snare: { name: 'Snare',  color: '#15E681', params: [55, 60, 35], start: [4, 12],
    knobs: [['Tone', 'Dark to bright'], ['Snap', 'Soft to crackly'], ['Length', 'Tight to roomy']],
    sounds: ['Crisp snare', 'Fat snare', 'Rimshot', 'Noise burst', 'Tin snare', 'Lazy snare'] },
  clap:  { name: 'Clap',   color: '#1AC3B9', params: [50, 60, 35], start: [12],
    knobs: [['Tone', 'Dark to bright'], ['Spread', 'One hand to a crowd'], ['Length', 'Tight to roomy']],
    sounds: ['Wide clap', 'Tight clap', 'Room clap', 'Finger snap', 'Stadium clap', 'Dry clap'] },
  hat:   { name: 'Hi-hat', color: '#12A5CA', params: [70, 40, 15], start: [2, 6, 10, 14],
    knobs: [['Tone', 'Dull to shiny'], ['Sizzle', 'Clean to fizzy'], ['Length', 'Closed to open']],
    sounds: ['Closed hat', 'Sizzle hat', 'Tick', 'Shaker', 'Open hat', 'Glass hat'] },
  bass:  { name: 'Bass',   color: '#047BFA', bassy: true, params: [25, 55, 35], start: [0, 3, 6, 8, 11, 14],
    knobs: [['Pitch', 'Lower to higher note'], ['Growl', 'Smooth to buzzy'], ['Length', 'Short to held']],
    sounds: ['Sub bass', 'Growl bass', 'Rubber bass', 'Acid line', 'Wobble bass', 'Velvet bass'] }
};
const AUDC = ['#A98BFF', '#E3A6FF', '#C9B8FF', '#F2C6FF'];
const FEELS = [['Chill', 90], ['Hip-hop', 95], ['House', 124], ['Techno', 132], ['Drum & bass', 174]];
const NOTES = [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 5, 0, 0, 3, 0];
const SCALE = [0, 0, 3, 5, 7, 10, 12];
const MAX_FILE = 40 * 1024 * 1024, MAX_ALL = 200 * 1024 * 1024;
const LAME = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js';

/* ---------------- state ---------------- */
const KEY = 'advl-aud-v1';
const synthLayer = (v, open) => { const V = VOICE[v]; return { id: uid(), kind: 'synth', voice: v, sound: V.sounds[0], steps: Array.from({ length: 16 }, (_, i) => V.start.includes(i)), params: V.params.slice(), vol: 70, hidden: false, open: !!open }; };
const fresh = () => ({ bpm: 124, bass: 65, vol: 80, notes: NOTES.slice(), cur: null, layers: ['kick', 'snare', 'clap', 'hat', 'bass'].map((v, i) => synthLayer(v, i === 0)) });
let S = fresh();
function valid(s) { return s && Array.isArray(s.layers) && s.layers.every(L => L && L.id && Array.isArray(L.steps) && L.steps.length === 16 && (L.kind === 'audio' || VOICE[L.voice])); }
function loadState() { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (valid(s)) { S = Object.assign(fresh(), s); S.bpm = clamp(+S.bpm || 124, 60, 180); } } catch (e) {} }
let saveT = 0;
function save() { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 300); }
const byId = id => S.layers.find(L => L.id === id);
const color = L => L.kind === 'audio' ? (L.color || AUDC[0]) : VOICE[L.voice].color;
const lname = L => L.kind === 'audio' ? (L.name || 'Audio') : VOICE[L.voice].name;
const bassy = L => L.kind === 'synth' && VOICE[L.voice].bassy;
const stepDur = () => 60 / S.bpm / 4;

/* ---------------- browser storage for uploads and mixes ---------------- */
const DB = (() => {
  let p = null;
  const open = () => p || (p = new Promise((ok, no) => {
    if (!window.indexedDB) return no(new Error('no storage'));
    const r = indexedDB.open('advl-auditory', 1);
    r.onupgradeneeded = () => { const d = r.result; ['files', 'blobs', 'mixes'].forEach(n => d.objectStoreNames.contains(n) || d.createObjectStore(n, { keyPath: 'id' })); };
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('blocked'));
  }));
  const run = (st, mode, fn) => open().then(d => new Promise((ok, no) => {
    const t = d.transaction(st, mode), q = fn(t.objectStore(st));
    t.oncomplete = () => ok(q ? q.result : undefined); t.onerror = () => no(t.error); t.onabort = () => no(t.error);
  }));
  return { all: st => run(st, 'readonly', s => s.getAll()), get: (st, id) => run(st, 'readonly', s => s.get(id)),
           put: (st, v) => run(st, 'readwrite', s => s.put(v)), del: (st, id) => run(st, 'readwrite', s => s.delete(id)) };
})();
let FILES = [], MIXES = [], dbOK = true;
const BUF = new Map();
const fileById = id => FILES.find(f => f.id === id);
async function loadLibrary() {
  try { FILES = (await DB.all('files')).sort((a, b) => a.added - b.added); MIXES = (await DB.all('mixes')).sort((a, b) => b.saved - a.saved); }
  catch (e) { dbOK = false; }
}
async function bufferFor(id) {
  if (BUF.has(id)) return BUF.get(id);
  const rec = await DB.get('blobs', id); if (!rec) return null;
  ensureAudio(true);
  const b = await ctx.decodeAudioData(rec.data.slice(0)); BUF.set(id, b); return b;
}
function peaksOf(buf, n = 120) {
  const d = buf.getChannelData(0), per = Math.max(1, Math.floor(d.length / n)), out = []; let max = 0.001;
  for (let i = 0; i < n; i++) { let m = 0; for (let j = i * per, e = Math.min(d.length, j + per); j < e; j += 4) { const a = Math.abs(d[j]); if (a > m) m = a; } out.push(m); if (m > max) max = m; }
  return out.map(v => +(v / max).toFixed(3));
}

/* ---------------- sound engine ---------------- */
function makeEngine(c) {
  const len = Math.floor(c.sampleRate * 2), noise = c.createBuffer(1, len, c.sampleRate), d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
  const master = c.createGain(), bassBus = c.createGain(), mainBus = c.createGain();
  bassBus.connect(master); mainBus.connect(master); master.connect(comp); comp.connect(c.destination);
  const e = { ctx: c, noise, master, bassBus, mainBus, lg: new Map(), loops: new Map() };
  levels(e, true); return e;
}
function levels(e, now) {
  const b = (S.bass / 100) * 1.4, m = (S.vol / 100) * 0.8;
  if (now) { e.bassBus.gain.value = b; e.master.gain.value = m; return; }
  const t = e.ctx.currentTime; e.bassBus.gain.setTargetAtTime(b, t, 0.03); e.master.gain.setTargetAtTime(m, t, 0.03);
}
function out(e, L, now) {
  let g = e.lg.get(L.id);
  if (!g) { g = e.ctx.createGain(); g.gain.value = 0; g.connect(bassy(L) ? e.bassBus : e.mainBus); e.lg.set(L.id, g); now = true; }
  const v = L.hidden ? 0 : L.vol / 100;
  if (now) g.gain.value = v; else g.gain.setTargetAtTime(v, e.ctx.currentTime, 0.04);
  return g;
}
function noiseSrc(e, t, dur) { const s = e.ctx.createBufferSource(); s.buffer = e.noise; s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.05); return s; }
function env(p, t, peak, a, d) { p.setValueAtTime(0.0001, t); p.exponentialRampToValueAtTime(peak, t + a); p.exponentialRampToValueAtTime(0.0001, t + a + d); }
const VOICES = {
  kick(e, t, p, o) {
    const c = e.ctx, osc = c.createOscillator(), g = c.createGain(), dec = 0.12 + p[2] * 0.9;
    osc.frequency.setValueAtTime(80 + p[0] * 170, t); osc.frequency.exponentialRampToValueAtTime(32 + p[0] * 38, t + 0.13 - p[1] * 0.1);
    env(g.gain, t, 1, 0.002, dec); osc.connect(g); g.connect(o); osc.start(t); osc.stop(t + dec + 0.05);
    if (p[1] > 0.05) { const n = noiseSrc(e, t, 0.03), hp = c.createBiquadFilter(), ng = c.createGain(); hp.type = 'highpass'; hp.frequency.value = 2500; env(ng.gain, t, 0.5 * p[1], 0.001, 0.012); n.connect(hp); hp.connect(ng); ng.connect(o); }
  },
  snare(e, t, p, o) {
    const c = e.ctx, dec = 0.07 + p[2] * 0.35, n = noiseSrc(e, t, dec), hp = c.createBiquadFilter(), ng = c.createGain();
    hp.type = 'highpass'; hp.frequency.value = 700 + p[0] * 3200; env(ng.gain, t, 0.35 + p[1] * 0.6, 0.001, dec); n.connect(hp); hp.connect(ng); ng.connect(o);
    const osc = c.createOscillator(), og = c.createGain(); osc.type = 'triangle';
    osc.frequency.setValueAtTime(170 + p[0] * 110, t); osc.frequency.exponentialRampToValueAtTime(120 + p[0] * 60, t + 0.08);
    env(og.gain, t, 0.75 * (1 - p[1] * 0.5), 0.001, 0.09); osc.connect(og); og.connect(o); osc.start(t); osc.stop(t + 0.15);
  },
  clap(e, t, p, o) {
    const c = e.ctx, k = 3 + Math.round(p[1] * 2), gap = 0.007 + p[1] * 0.014, dec = 0.08 + p[2] * 0.45;
    const n = noiseSrc(e, t, (k - 1) * gap + dec), bp = c.createBiquadFilter(), g = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 900 + p[0] * 2300; bp.Q.value = 1.1; g.gain.setValueAtTime(0.0001, t);
    for (let i = 0; i < k - 1; i++) { const ti = t + i * gap; g.gain.setValueAtTime(0.9, ti); g.gain.exponentialRampToValueAtTime(0.06, ti + gap * 0.95); }
    const tl = t + (k - 1) * gap; g.gain.setValueAtTime(0.9, tl); g.gain.exponentialRampToValueAtTime(0.0001, tl + dec);
    n.connect(bp); bp.connect(g); g.connect(o);
  },
  hat(e, t, p, o) {
    const c = e.ctx, dec = 0.025 + p[2] * 0.45, g = c.createGain(); env(g.gain, t, 0.32, 0.001, dec); g.connect(o);
    const n = noiseSrc(e, t, dec), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5500 + p[0] * 3500; n.connect(hp); hp.connect(g);
    if (p[1] > 0.05) {
      const bp = c.createBiquadFilter(), hp2 = c.createBiquadFilter(), mg = c.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 9000 + p[0] * 2000; hp2.type = 'highpass'; hp2.frequency.value = 7000; mg.gain.value = p[1] * 0.6;
      bp.connect(hp2); hp2.connect(mg); mg.connect(g);
      [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(r => { const s = c.createOscillator(); s.type = 'square'; s.frequency.value = 40 * r; s.connect(bp); s.start(t); s.stop(t + dec + 0.05); });
    }
  },
  bass(e, t, p, o, info) {
    const c = e.ctx, f = 41.2 * Math.pow(2, (Math.round(p[0] * 12) + (info.note || 0)) / 12), dur = info.step * (0.6 + p[2] * 3.4);
    const saw = c.createOscillator(), sub = c.createOscillator(), lp = c.createBiquadFilter(), sg = c.createGain(), subg = c.createGain(), g = c.createGain();
    saw.type = 'sawtooth'; saw.frequency.value = f; sub.type = 'sine'; sub.frequency.value = f / 2;
    lp.type = 'lowpass'; lp.Q.value = 2 + p[1] * 10; lp.frequency.setValueAtTime(180 + p[1] * 3200, t); lp.frequency.exponentialRampToValueAtTime(90 + p[1] * 300, t + dur);
    sg.gain.value = 0.25 + p[1] * 0.35; subg.gain.value = 0.7 - p[1] * 0.3;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.005); g.gain.setValueAtTime(0.7, t + dur * 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    saw.connect(sg); sg.connect(lp); lp.connect(g); sub.connect(subg); subg.connect(g); g.connect(o);
    saw.start(t); sub.start(t); saw.stop(t + dur + 0.05); sub.stop(t + dur + 0.05);
  }
};
const P = L => L.params.map(v => v / 100);
const rate = L => Math.pow(2, (L.pitch - 50) * 24 / 100 / 12);
function region(L, b) { const a = clamp(L.trim[0], 0, 1) * b.duration, z = clamp(L.trim[1], 0, 1) * b.duration; return [a, Math.max(0.02, z - a)]; }
function oneShot(e, L, t, b) { if (!b) return; const s = e.ctx.createBufferSource(), [a, d] = region(L, b); s.buffer = b; s.playbackRate.value = rate(L); s.connect(out(e, L)); s.start(t, a, d); }
function loopStart(e, L, t, b, until) {
  if (!b || L.hidden) return;
  const s = e.ctx.createBufferSource(), fg = e.ctx.createGain(), [a, d] = region(L, b);
  s.buffer = b; s.loop = true; s.loopStart = a; s.loopEnd = a + d; s.playbackRate.value = rate(L);
  const f = (L.fade / 100) * 4; fg.gain.setValueAtTime(f > 0.01 ? 0.0001 : 1, t); if (f > 0.01) fg.gain.exponentialRampToValueAtTime(1, t + f);
  s.connect(fg); fg.connect(out(e, L)); s.start(t, a); if (until) s.stop(until);
  e.loops.set(L.id, { s, fg });
}
function loopStop(e, id) { const l = e.loops.get(id); if (!l) return; try { l.fg.gain.setTargetAtTime(0.0001, e.ctx.currentTime, 0.05); l.s.stop(e.ctx.currentTime + 0.3); } catch (x) {} e.loops.delete(id); }
function playStep(e, i, t, sd) {
  for (const L of S.layers) {
    if (L.hidden || !L.steps[i]) continue;
    if (L.kind === 'synth') VOICES[L.voice](e, t, P(L), out(e, L), { note: S.notes[i] || 0, step: sd });
    else if (L.mode === 'steps') oneShot(e, L, t, BUF.get(L.file));
  }
}

let ctx = null, eng = null;
function ensureAudio(quiet) {
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'interactive' }); eng = makeEngine(ctx); }
  if (!quiet && ctx.state === 'suspended') ctx.resume();
}

/* ---------------- sequencer ---------------- */
let playing = false, cur = 0, nextT = 0, timer = 0, shown = -1; const queue = [];
function tick() { while (nextT < ctx.currentTime + 0.12) { const sd = stepDur(); playStep(eng, cur, nextT, sd); queue.push({ s: cur, t: nextT }); nextT += sd; cur = (cur + 1) % 16; } }
async function start() {
  ensureAudio();
  await Promise.all(S.layers.filter(L => L.kind === 'audio' && fileById(L.file)).map(L => bufferFor(L.file).catch(() => null)));
  if (playing) return;
  playing = true; cur = 0; nextT = ctx.currentTime + 0.06; queue.length = 0;
  S.layers.forEach(L => { if (L.kind === 'audio' && L.mode === 'loop') loopStart(eng, L, nextT, BUF.get(L.file)); });
  tick(); timer = setInterval(tick, 25); paintPlay(); requestAnimationFrame(draw);
}
function stop() {
  if (!playing) return; playing = false; clearInterval(timer); queue.length = 0;
  if (eng) [...eng.loops.keys()].forEach(id => loopStop(eng, id));
  head(-1); paintPlay();
}
function draw() { if (!playing) return; let s = shown; while (queue.length && queue[0].t <= ctx.currentTime) s = queue.shift().s; if (s !== shown) head(s); requestAnimationFrame(draw); }
function restartLoop(L) { if (!playing || !eng) return; loopStop(eng, L.id); if (L.kind === 'audio' && L.mode === 'loop' && !L.hidden) loopStart(eng, L, ctx.currentTime + 0.05, BUF.get(L.file)); }
function audition(L) {
  if (playing || L.hidden) return; ensureAudio();
  if (L.kind === 'synth') VOICES[L.voice](eng, ctx.currentTime + 0.01, P(L), out(eng, L), { note: 0, step: stepDur() });
  else bufferFor(L.file).then(b => oneShot(eng, L, ctx.currentTime + 0.01, b)).catch(() => {});
}

/* ---------------- export ---------------- */
async function render() {
  const sd = stepDur(), bar = sd * 16; let bars = 4;
  for (const L of S.layers) if (L.kind === 'audio' && !L.hidden && fileById(L.file)) { const b = await bufferFor(L.file); BUF.set(L.file, b); if (L.mode === 'loop') bars = Math.max(bars, Math.ceil(region(L, b)[1] / rate(L) / bar)); }
  bars = Math.min(16, bars);
  const sr = 44100, secs = bars * bar + 1.5, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OAC(2, Math.ceil(sr * secs), sr), e = makeEngine(oc);
  S.layers.forEach(L => out(e, L, true));
  S.layers.forEach(L => { if (L.kind === 'audio' && L.mode === 'loop') loopStart(e, L, 0.02, BUF.get(L.file), 0.02 + bars * bar); });
  for (let i = 0; i < bars * 16; i++) playStep(e, i % 16, 0.02 + i * sd, sd);
  return oc.startRendering();
}
function wav(buf) {
  const ch = buf.numberOfChannels, n = buf.length, v = new DataView(new ArrayBuffer(44 + n * ch * 2)), w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + n * ch * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, buf.sampleRate, true); v.setUint32(28, buf.sampleRate * ch * 2, true); v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * ch * 2, true);
  const cs = [...Array(ch)].map((_, c) => buf.getChannelData(c)); let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = clamp(cs[c][i], -1, 1); v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  return new Blob([v], { type: 'audio/wav' });
}
let lameP = null;
const loadLame = () => lameP || (lameP = new Promise((ok, no) => { const s = document.createElement('script'); s.src = LAME; s.onload = () => window.lamejs ? ok(window.lamejs) : no(new Error('mp3')); s.onerror = () => { lameP = null; no(new Error('mp3')); }; document.head.appendChild(s); }));
async function mp3(buf) {
  const lame = await loadLame(), toI = d => { const r = new Int16Array(d.length); for (let i = 0; i < d.length; i++) { const s = clamp(d[i], -1, 1); r[i] = s < 0 ? s * 0x8000 : s * 0x7fff; } return r; };
  const L = toI(buf.getChannelData(0)), R = toI(buf.getChannelData(1)), enc = new lame.Mp3Encoder(2, buf.sampleRate, 192), parts = [];
  for (let i = 0; i < L.length; i += 1152) { const d = enc.encodeBuffer(L.subarray(i, i + 1152), R.subarray(i, i + 1152)); if (d.length) parts.push(new Int8Array(d)); }
  const f = enc.flush(); if (f.length) parts.push(new Int8Array(f));
  return new Blob(parts, { type: 'audio/mpeg' });
}
async function exportMix(fmt) {
  const name = (MIXES.find(m => m.id === S.cur) || {}).name || 'mix';
  msg('mx', `Making your ${fmt.toUpperCase()}…`);
  try {
    const buf = await render(), blob = fmt === 'mp3' ? await mp3(buf) : wav(buf);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `advl-auditory-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mix'}-${S.bpm}bpm.${fmt}`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    msg('mx', `Downloaded ${a.download}`);
  } catch (e) { msg('mx', fmt === 'mp3' ? 'MP3 needs a connection the first time. Try WAV, or try again.' : 'Export didn’t work. Try again.'); }
}

/* ---------------- library and mixes ---------------- */
const fmtDur = s => { s = s > 0 ? Math.max(1, Math.round(s)) : 0; return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const fmtMB = b => `${(b / 1048576).toFixed(1)} MB`;
const used = () => FILES.reduce((a, f) => a + f.size, 0);
async function upload(list) {
  if (!dbOK) return msg('lib', 'Uploads need browser storage, which is turned off here.');
  ensureAudio(true);
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  let added = 0;
  for (const f of list) {
    if (f.size > MAX_FILE) { msg('lib', `${f.name} is over 40 MB.`); continue; }
    if (used() + f.size > MAX_ALL) { msg('lib', 'The library is full (200 MB). Remove a file to add more.'); break; }
    msg('lib', `Reading ${f.name}…`);
    try {
      const data = await f.arrayBuffer(), b = await ctx.decodeAudioData(data.slice(0));
      const rec = { id: uid(), name: f.name, size: f.size, type: (f.name.split('.').pop() || '').toUpperCase().slice(0, 4), dur: b.duration, peaks: peaksOf(b), added: Date.now() };
      await DB.put('blobs', { id: rec.id, data }); await DB.put('files', rec);
      FILES.push(rec); BUF.set(rec.id, b); added++;
    } catch (e) { msg('lib', `Couldn’t read ${f.name}. Try an MP3, WAV or M4A file.`); }
  }
  if (added) msg('lib', `${added === 1 ? 'File' : added + ' files'} added. Use “+ Add layer” to put it in the mix.`);
  paint();
}
function addAudioLayer(f) {
  const n = S.layers.filter(L => L.kind === 'audio').length;
  const L = { id: uid(), kind: 'audio', file: f.id, name: f.name, color: AUDC[n % AUDC.length], mode: f.dur > stepDur() * 4 ? 'loop' : 'steps',
    steps: Array.from({ length: 16 }, (_, i) => i === 0 || i === 8), pitch: 50, fade: 0, vol: 70, trim: [0, 1], hidden: false, open: true };
  S.layers.push(L); save(); paint(); restartLoop(L);
}
async function removeFile(id) {
  try { await DB.del('files', id); await DB.del('blobs', id); } catch (e) {}
  FILES = FILES.filter(f => f.id !== id); BUF.delete(id); paint();
}
async function saveMix(name) {
  if (!dbOK) return msg('mx', 'Saving needs browser storage, which is turned off here.');
  const id = S.cur && MIXES.find(m => m.id === S.cur && m.name === name) ? S.cur : uid();
  const rec = { id, name: name || `Mix ${MIXES.length + 1}`, saved: Date.now(), bpm: S.bpm, n: S.layers.length, state: JSON.parse(JSON.stringify(Object.assign({}, S, { cur: id }))) };
  await DB.put('mixes', rec); MIXES = [rec, ...MIXES.filter(m => m.id !== id)]; S.cur = id; save(); msg('mx', `Saved “${rec.name}”.`); paint();
}
function openMix(id) {
  const m = MIXES.find(x => x.id === id); if (!m || !valid(m.state)) return;
  const was = playing; stop(); S = Object.assign(fresh(), JSON.parse(JSON.stringify(m.state)), { cur: id }); save();
  if (eng) { eng.lg.forEach(g => g.disconnect()); eng.lg.clear(); levels(eng); }
  paint(); if (was) start();
}
async function removeMix(id) { try { await DB.del('mixes', id); } catch (e) {} MIXES = MIXES.filter(m => m.id !== id); if (S.cur === id) S.cur = null; save(); paint(); }

/* ---------------- drawing ---------------- */
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';
const STOP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z" fill="currentColor"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const UP = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></svg>';
const EXP = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const CLOSE = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
function wavePath(peaks, w, h, vertical) {
  if (!peaks || !peaks.length) return ''; const n = peaks.length, bw = (vertical ? h : w) / n; let d = '';
  for (let i = 0; i < n; i++) { const s = Math.max(1.5, peaks[i] * (vertical ? w : h) * 0.92);
    d += vertical ? `M${((w - s) / 2).toFixed(1)} ${(i * bw + bw * .2).toFixed(1)}h${s.toFixed(1)}v${(bw * .6).toFixed(1)}h-${s.toFixed(1)}z`
                  : `M${(i * bw + bw * .2).toFixed(1)} ${((h - s) / 2).toFixed(1)}h${(bw * .6).toFixed(1)}v${s.toFixed(1)}h-${(bw * .6).toFixed(1)}z`; }
  return d;
}
const cellCls = (on, i) => 'cell' + (on ? ' on' + (i % 4 ? ' d' : '') : (Math.floor(i / 4) % 2 ? ' b' : ''));
const steps = L => `<div class="stp">${L.steps.map((on, i) => `<button type="button" class="${cellCls(on, i)}" data-act="cell" data-l="${L.id}" data-i="${i}" aria-pressed="${on}" aria-label="${esc(lname(L))}, step ${i + 1}"></button>`).join('')}</div>`;
const slider = (label, key, val, L, c, extra = '') => `<label class="sl${extra}"><span class="sl-top"><span>${label}</span><b>${val}%</b></span><input type="range" min="0" max="100" value="${val}" data-in="${key}"${L ? ` data-l="${L.id}"` : ''} style="--c:${c};--fill:${val}%"></label>`;
function ring(key, v, label) {
  const r = 28, C = 2 * Math.PI * r;
  return `<label class="ring"><svg viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="${r}" fill="none" stroke="rgb(255 255 255/.2)" stroke-width="4" stroke-dasharray="${C * .75} ${C}" transform="rotate(135 37 37)" stroke-linecap="round"/><circle data-arc cx="37" cy="37" r="${r}" fill="none" stroke="var(--t)" stroke-width="4" stroke-dasharray="${C * .75 * v / 100} ${C}" transform="rotate(135 37 37)" stroke-linecap="round" style="filter:drop-shadow(0 0 4px var(--t))"/><text x="37" y="42" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="14" fill="#EEF3EC">${v}</text></svg><span>${label}</span><input type="range" min="0" max="100" value="${v}" data-in="${key}" aria-label="${label}"></label>`;
}
function clip(L, f, mini) {
  const t = L.trim, p = wavePath(f.peaks, 600, mini ? 18 : 52);
  return `<div class="clip${mini ? ' mini' : ''}" data-clip="${L.id}"><svg viewBox="0 0 600 ${mini ? 18 : 52}" preserveAspectRatio="none" aria-hidden="true"><path d="${p}"/></svg>
    <span class="shade" style="left:0;width:${t[0] * 100}%"></span><span class="shade" style="right:0;width:${(1 - t[1]) * 100}%"></span>
    ${mini ? '' : `<span class="trim" data-trim="0" style="left:${t[0] * 100}%" role="slider" tabindex="0" aria-label="Start of ${esc(lname(L))}" aria-valuenow="${Math.round(t[0] * 100)}"></span><span class="trim" data-trim="1" style="left:${t[1] * 100}%" role="slider" tabindex="0" aria-label="End of ${esc(lname(L))}" aria-valuenow="${Math.round(t[1] * 100)}"></span>`}</div>`;
}
function layerHTML(L) {
  const c = color(L), audio = L.kind === 'audio', f = audio ? fileById(L.file) : null, open = L.open && !L.hidden, nm = lname(L);
  const sub = audio ? (f ? `${L.mode === 'loop' ? 'Loop' : 'Hits on steps'} · ${fmtDur(f.dur)}` : 'File missing') : L.sound;
  let prev;
  if (L.hidden) prev = '<span class="k" style="color:var(--dim)">Hidden · not playing</span>';
  else if (open) prev = `<span class="k hint">${audio ? (L.mode === 'loop' ? 'Your audio · plays as a loop' : 'Your audio · plays on the steps you tap') : 'Tap squares to place hits'}</span>`;
  else if (audio && L.mode === 'loop') prev = f ? clip(L, f, true) : '<span class="miss">File missing</span>';
  else prev = steps(L);
  let body = '';
  if (open && !audio) {
    const V = VOICE[L.voice];
    body = `${steps(L)}<div class="knobs"><canvas class="kw" data-kw="${L.id}" aria-hidden="true"></canvas>${V.knobs.map(([k], i) => slider(k, 'p' + i, L.params[i], L, c)).join('')}
      <button type="button" class="pill" data-act="newsound" data-l="${L.id}" style="border-color:${c}">New ${esc(V.name.toLowerCase())} from scratch</button></div>`;
  } else if (open && audio) {
    body = f ? `${clip(L, f)}<div class="beats" aria-hidden="true"><span>Start</span><span></span><span></span><span style="text-align:right">End</span></div>
      <div class="aopts"><div class="seg" role="group" aria-label="How it plays"><button type="button" data-act="mode" data-l="${L.id}" data-v="loop" aria-pressed="${L.mode === 'loop'}">Loop</button><button type="button" data-act="mode" data-l="${L.id}" data-v="steps" aria-pressed="${L.mode === 'steps'}">On steps</button></div>
      ${slider('Pitch', 'pitch', L.pitch, L, c)}${L.mode === 'loop' ? slider('Fade in', 'fade', L.fade, L, c) : '<span></span>'}<button type="button" class="pill sm" data-act="hear" data-l="${L.id}">Hear it</button></div>
      ${L.mode === 'steps' ? steps(L) : ''}` : `<p class="miss">This file isn’t in this browser’s library any more. Remove the layer, or upload the file again.</p>`;
  }
  if (open) body += `<div class="row">${slider('Volume', 'lvol', L.vol, L, c, ' lvolb')}<button type="button" class="pill sm" data-act="remove" data-l="${L.id}">Remove layer</button></div>`;
  return `<div class="ly${open ? ' open' : ''}${L.hidden ? ' off' : ''}" style="--c:${c}" data-ly="${L.id}">
    <div class="lh"><button type="button" class="hide" data-act="hide" data-l="${L.id}" aria-pressed="${L.hidden}" aria-label="${L.hidden ? 'Show' : 'Hide'} ${esc(nm)}"><span class="dash"></span></button>
      <div class="nm"><b title="${esc(nm)}">${esc(nm)}</b><span>${esc(sub)}<span class="tag">${audio ? 'Audio' : 'Synth'}</span></span></div>
      <div class="prev">${prev}</div>
      <label class="lvol"><input type="range" min="0" max="100" value="${L.vol}" data-in="lvol" data-l="${L.id}" aria-label="${esc(nm)} volume" style="--c:${c};--fill:${L.vol}%"><small>${L.vol}</small></label>
      <button type="button" class="ex" data-act="open" data-l="${L.id}" aria-expanded="${open}" aria-label="${open ? 'Close' : 'Open'} ${esc(nm)}">${CHEV}</button></div>
    ${open ? `<div class="body">${body}</div>` : ''}</div>`;
}
let root = null, ui = { voices: false, saving: false, exp: false, confirm: null }, msgs = { lib: '', mx: '' };
function html() {
  const usedIds = new Set(S.layers.filter(L => L.kind === 'audio').map(L => L.file));
  const fileColor = id => { const L = S.layers.find(x => x.kind === 'audio' && x.file === id); return L ? color(L) : '#ffffff'; };
  return `
  <div class="au-top">
    <button type="button" class="play${playing ? ' on' : ''}" data-act="play" aria-label="${playing ? 'Stop' : 'Play'}">${playing ? STOP : PLAY}</button>
    <div class="big"><b data-bpm>${S.bpm}</b><div class="pm"><button type="button" class="rb" data-act="bpm" data-v="1" aria-label="Faster">+</button><button type="button" class="rb" data-act="bpm" data-v="-1" aria-label="Slower">−</button></div><span class="k">BPM</span></div>
    <div class="feel" role="group" aria-label="Pick a feel">${FEELS.map(([l, b]) => `<button type="button" data-act="feel" data-v="${b}" aria-pressed="${S.bpm === b}">${esc(l)} ${b}</button>`).join('')}</div>
    <div class="rings">${ring('bass', S.bass, 'Bass')}${ring('vol', S.vol, 'Volume')}</div>
  </div>
  <div class="rule"></div>
  <div class="au-main">
    <section aria-label="Layers">
      <div class="row"><span class="au-h">Layers · ${S.layers.length}</span><div class="gap"><button type="button" class="pill acc xp" data-act="expand">${EXP}Expand</button><button type="button" class="pill" data-act="voices" aria-expanded="${ui.voices}">+ Synth layer</button><button type="button" class="pill" data-act="surprise">Surprise me</button></div></div>
      ${ui.voices ? `<div class="voices">${Object.entries(VOICE).map(([k, V]) => `<button type="button" data-act="addsynth" data-v="${k}" style="--c:${V.color}">${V.name}</button>`).join('')}</div>` : ''}
      <div class="list">${S.layers.map(layerHTML).join('') || '<p class="k">No layers yet. Add a synth layer or one of your files.</p>'}</div>
    </section>
    <aside class="au-side">
      <section aria-label="Library"><span class="au-h">Library</span>
        <label class="drop" data-drop style="margin-top:10px">${UP}<b class="dk">Drop audio here</b><b class="ph">Choose audio files</b><span class="dk">MP3, WAV, M4A · or <u>choose files</u></span><span class="ph">MP3, WAV, M4A</span>
          <input type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg" multiple data-in="files" style="position:absolute;width:1px;height:1px;opacity:0"></label>
        <p class="msg" aria-live="polite">${esc(msgs.lib)}</p>
        <div class="files">${FILES.map(f => { const u = usedIds.has(f.id), c = fileColor(f.id); return `<div class="file${u ? ' used' : ''}" style="--c:${c};--c-ink:color-mix(in srgb,${c} 52%,white)"><b title="${esc(f.name)}">${esc(f.name)}</b>
          <span class="acts">${u ? '<span class="inmix">In mix</span>' : `<button type="button" class="add" data-act="addfile" data-v="${f.id}">+ Add layer</button>`}${ui.confirm === f.id ? `<button type="button" class="add" data-act="delfile" data-v="${f.id}">Remove</button>` : `<button type="button" class="x" data-act="askdel" data-v="${f.id}" aria-label="Remove ${esc(f.name)}">×</button>`}</span>
          <small>${fmtDur(f.dur)} · ${fmtMB(f.size)} · ${esc(f.type)}</small><span></span><svg class="fw" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="${wavePath(f.peaks.filter((_, i) => i % 2 === 0), 300, 20)}"/></svg></div>`; }).join('')}</div>
        <div class="store"><span>${dbOK ? `Stored in this browser · ${fmtMB(used())} of 200 MB` : 'Browser storage is turned off here'}</span><i style="--u:${Math.min(100, used() / MAX_ALL * 100)}%"></i></div>
      </section>
      <section aria-label="Mixes"><span class="au-h">Mixes</span>
        <div class="gap" style="display:flex;gap:8px;margin-top:10px"><button type="button" class="pill solid" data-act="savebox">Save mix</button><button type="button" class="pill acc" data-act="exp" aria-expanded="${ui.exp}">Export ▾</button></div>
        ${ui.saving ? `<form class="savebox" data-form="save"><input name="n" maxlength="40" aria-label="Mix name" value="${esc((MIXES.find(m => m.id === S.cur) || {}).name || `Mix ${MIXES.length + 1}`)}"><button type="submit" class="pill solid sm">Save</button></form>` : ''}
        ${ui.exp ? `<div class="expmenu"><button type="button" class="pill sm" data-act="export" data-v="wav">WAV</button><button type="button" class="pill sm" data-act="export" data-v="mp3">MP3</button></div>` : ''}
        <p class="msg" aria-live="polite">${esc(msgs.mx)}</p>
        <div class="mixes">${MIXES.map(m => `<div class="mix${m.id === S.cur ? ' cur' : ''}"><div><b>${esc(m.name)}</b><small>${m.bpm} BPM · ${m.n} layers · ${new Date(m.saved).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></div>
          <span class="acts"><button type="button" class="add" style="border-color:rgb(255 255 255/.3);color:var(--ink)" data-act="openmix" data-v="${m.id}">${m.id === S.cur ? 'Open now' : 'Open'}</button>${ui.confirm === m.id ? `<button type="button" class="add" data-act="delmix" data-v="${m.id}">Delete</button>` : `<button type="button" class="x" data-act="askdel" data-v="${m.id}" aria-label="Delete ${esc(m.name)}">×</button>`}</span></div>`).join('') || '<p class="k" style="margin-top:6px">Saved mixes appear here.</p>'}</div>
      </section>
    </aside>
  </div>`;
}
function paint() {
  if (!root || !root.isConnected) return;
  const y = window.scrollY, f = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset : null;
  root.innerHTML = html();
  if (f && (f.act || f.in)) { const sel = f.act ? `[data-act="${f.act}"]` : `[data-in="${f.in}"]`; const el = root.querySelector(sel + (f.l ? `[data-l="${f.l}"]` : '') + (f.i ? `[data-i="${f.i}"]` : '') + (f.v ? `[data-v="${f.v}"]` : '')); el && el.focus({ preventScroll: true }); }
  if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
  root.querySelectorAll('canvas[data-kw]').forEach(cv => kick(cv));
  if (shown >= 0) head(shown, true);
  if (pop) popPaint();
}
function msg(k, t) { msgs[k] = t; const el = root && root.querySelectorAll('.msg')[k === 'lib' ? 0 : 1]; if (el) el.textContent = t; }
function paintPlay() { [root, pop].forEach(r => { if (!r) return; r.querySelectorAll('[data-act="play"]').forEach(b => { b.innerHTML = playing ? STOP : PLAY; b.classList.toggle('on', playing); b.setAttribute('aria-label', playing ? 'Stop' : 'Play'); }); }); }
function head(s, keep) {
  [root, pop].forEach(r => { if (!r) return; r.querySelectorAll('.cell.now').forEach(c => c.classList.remove('now')); if (s >= 0) r.querySelectorAll(`.cell[data-i="${s}"]`).forEach(c => c.classList.add('now')); });
  if (!keep) shown = s;
  if (pop) { const hl = pop.querySelector('.hl'), n = pop.querySelector(`.n[data-r="${s}"]`); if (hl) { hl.classList.toggle('on', s >= 0 && !!n); if (n) hl.style.top = (n.offsetTop + n.offsetHeight / 2 - 1) + 'px'; } }
}
/* the sound picture of a synth layer, rendered offline from the real voice */
const kwT = new Map();
function kick(cv) {
  clearTimeout(kwT.get(cv.dataset.kw)); kwT.set(cv.dataset.kw, setTimeout(async () => {
    const L = byId(cv.dataset.kw), OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!L || !OAC || !cv.isConnected) return;
    const sr = 22050, oc = new OAC(1, sr * 0.8, sr), e = makeEngine(oc); e.bassBus.gain.value = 1; e.master.gain.value = 1;
    VOICES[L.voice](e, 0.005, P(L), e.mainBus, { note: 0, step: stepDur() });
    const d = (await oc.startRendering()).getChannelData(0); if (!cv.isConnected) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth || 200, H = cv.clientHeight || 52; cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    let max = 0.05; for (let i = 0; i < d.length; i += 8) max = Math.max(max, Math.abs(d[i]));
    g.strokeStyle = color(L); g.lineWidth = 1.6; g.shadowColor = color(L); g.shadowBlur = 6; g.beginPath();
    const n = Math.min(W * 2, 400), per = Math.floor(d.length / n);
    for (let i = 0; i < n; i++) { const v = d[i * per] / max, x = i / n * W, y = H / 2 - v * H * 0.44; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }, 60));
}

/* ---------------- interaction ---------------- */
function setCell(L, i) {
  const on = L.steps[i];
  [root, pop].forEach(r => r && r.querySelectorAll(`.cell[data-l="${L.id}"][data-i="${i}"]`).forEach(c => { c.className = cellCls(on, i) + (i === shown ? ' now' : ''); c.setAttribute('aria-pressed', on); }));
}
function setBpm(v) { S.bpm = clamp(Math.round(v), 60, 180); save(); [root, pop].forEach(r => { if (!r) return; r.querySelectorAll('[data-bpm]').forEach(b => { b.textContent = S.bpm; }); r.querySelectorAll('[data-act="feel"]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === S.bpm)); const sel = r.querySelector('select[data-in="feel"]'); if (sel) sel.value = FEELS.some(f => f[1] === S.bpm) ? S.bpm : ''; }); }
function surprise() {
  S.layers.forEach(L => {
    if (L.kind === 'audio' && L.mode === 'loop') return;
    const v = L.voice;
    L.steps = L.steps.map((_, i) => v === 'kick' ? (i % 4 === 0 || Math.random() < 0.12) : v === 'snare' ? (i === 4 || i === 12 || Math.random() < 0.06)
      : v === 'clap' ? Math.random() < 0.12 : v === 'hat' ? (i % 2 === 0 ? Math.random() < 0.85 : Math.random() < 0.35) : v === 'bass' ? Math.random() < 0.4 : Math.random() < 0.2);
  });
  S.notes = S.notes.map(() => SCALE[Math.floor(Math.random() * SCALE.length)]); save(); paint();
}
function act(b, e) {
  const a = b.dataset.act, L = b.dataset.l ? byId(b.dataset.l) : null, v = b.dataset.v;
  if (a !== 'askdel' && a !== 'delfile' && a !== 'delmix') ui.confirm = null;
  switch (a) {
    case 'play': playing ? stop() : start(); break;
    case 'bpm': setBpm(S.bpm + +v); break;
    case 'feel': setBpm(+v); break;
    case 'cell': if (!L) return; L.steps[+b.dataset.i] = !L.steps[+b.dataset.i]; setCell(L, +b.dataset.i); save();
      if (L.steps[+b.dataset.i] && !playing) audition(L); break;
    case 'hide': if (!L) return; L.hidden = !L.hidden; save(); if (eng) { out(eng, L); restartLoop(L); } paint(); break;
    case 'open': if (!L) return; if (L.hidden) { L.hidden = false; if (eng) { out(eng, L); restartLoop(L); } } L.open = !L.open; save(); paint(); break;
    case 'voices': ui.voices = !ui.voices; paint(); break;
    case 'addsynth': S.layers.forEach(x => { x.open = false; }); S.layers.push(synthLayer(v, true)); ui.voices = false; save(); paint(); break;
    case 'surprise': surprise(); break;
    case 'newsound': { if (!L) return; const V = VOICE[L.voice]; L.params = [0, 1, 2].map(() => 5 + Math.round(Math.random() * 18) * 5);
      const o = V.sounds.filter(n => n !== L.sound); L.sound = o[Math.floor(Math.random() * o.length)]; save(); paint(); audition(L); break; }
    case 'mode': if (!L) return; L.mode = v; save(); paint(); restartLoop(L); break;
    case 'hear': if (L) { ensureAudio(); audition(L); } break;
    case 'remove': if (!L) return; if (eng) { loopStop(eng, L.id); const g = eng.lg.get(L.id); g && g.disconnect(); eng.lg.delete(L.id); } S.layers = S.layers.filter(x => x !== L); save(); paint(); break;
    case 'addfile': { const f = fileById(v); if (f) { ensureAudio(); bufferFor(f.id).catch(() => {}).then(() => addAudioLayer(f)); } break; }
    case 'askdel': ui.confirm = v; paint(); break;
    case 'delfile': ui.confirm = null; removeFile(v); break;
    case 'delmix': ui.confirm = null; removeMix(v); break;
    case 'openmix': openMix(v); break;
    case 'savebox': ui.saving = !ui.saving; ui.exp = false; paint(); if (ui.saving) { const i = root.querySelector('.savebox input'); i && (i.focus(), i.select()); } break;
    case 'exp': ui.exp = !ui.exp; ui.saving = false; paint(); break;
    case 'export': ui.exp = false; paint(); exportMix(v); break;
    case 'quicksave': saveMix((MIXES.find(m => m.id === S.cur) || {}).name || `Mix ${MIXES.length + 1}`).then(() => { const k = pop && pop.querySelector('.foot .k'); if (k) k.textContent = 'Saved'; }); break;
    case 'expand': openPop(); break;
    case 'close': closePop(); break;
  }
}
function onInput(e) {
  const t = e.target, k = t.dataset.in; if (!k) return;
  if (k === 'files') return;
  if (k === 'feel') { if (t.value) setBpm(+t.value); return; }
  const v = +t.value, L = t.dataset.l ? byId(t.dataset.l) : null;
  t.style.setProperty('--fill', v + '%');
  const lab = t.closest('label'); const b = lab && lab.querySelector('.sl-top b, small'); if (b) b.textContent = k === 'lvol' && b.tagName === 'SMALL' ? v : v + '%';
  if (k === 'bass' || k === 'vol') { S[k] = v; const C = 2 * Math.PI * 28; lab.querySelector('[data-arc]').setAttribute('stroke-dasharray', `${C * .75 * v / 100} ${C}`); lab.querySelector('text').textContent = v; if (eng) levels(eng); }
  else if (L && /^p\d$/.test(k)) { L.params[+k[1]] = v; const cv = root.querySelector(`canvas[data-kw="${L.id}"]`); cv && kick(cv); }
  else if (L && k === 'lvol') { L.vol = v; if (eng) out(eng, L); root.querySelectorAll(`input[data-in="lvol"][data-l="${L.id}"]`).forEach(o => { if (o !== t) { o.value = v; o.style.setProperty('--fill', v + '%'); } }); }
  else if (L && (k === 'pitch' || k === 'fade')) { L[k] = v; if (k === 'pitch' && eng) { const l = eng.loops.get(L.id); l && l.s.playbackRate.setTargetAtTime(rate(L), ctx.currentTime, 0.05); } }
  save();
}
function onChange(e) {
  const t = e.target;
  if (t.dataset.in === 'files') { upload([...t.files]); t.value = ''; return; }
  const L = t.dataset.l ? byId(t.dataset.l) : null;
  if (L && /^p\d$/.test(t.dataset.in)) audition(L);
  if (L && t.dataset.in === 'fade') restartLoop(L);
}
/* dragging the start and end of an audio clip */
let drag = null;
function onDown(e) {
  const h = e.target.closest('.trim'); if (!h) return;
  const c = h.closest('[data-clip]'), L = byId(c.dataset.clip); if (!L) return;
  drag = { h, c, L, side: +h.dataset.trim }; h.setPointerCapture(e.pointerId); e.preventDefault();
}
function onMove(e) {
  if (!drag) return; const r = drag.c.getBoundingClientRect(), f = clamp((e.clientX - r.left) / r.width, 0, 1), L = drag.L;
  if (drag.side === 0) L.trim[0] = Math.min(f, L.trim[1] - 0.02); else L.trim[1] = Math.max(f, L.trim[0] + 0.02);
  const [s0, s1] = drag.c.querySelectorAll('.shade'), [t0, t1] = drag.c.querySelectorAll('.trim');
  s0.style.width = L.trim[0] * 100 + '%'; s1.style.width = (1 - L.trim[1]) * 100 + '%'; t0.style.left = L.trim[0] * 100 + '%'; t1.style.left = L.trim[1] * 100 + '%';
}
function onUp() { if (!drag) return; const L = drag.L; drag = null; save(); restartLoop(L); }
function onKey(e) {
  const h = e.target.closest && e.target.closest('.trim'); if (!h || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const L = byId(h.closest('[data-clip]').dataset.clip), s = +h.dataset.trim, d = e.key === 'ArrowLeft' ? -0.02 : 0.02; e.preventDefault();
  if (s === 0) L.trim[0] = clamp(L.trim[0] + d, 0, L.trim[1] - 0.02); else L.trim[1] = clamp(L.trim[1] + d, L.trim[0] + 0.02, 1);
  save(); paint(); restartLoop(L); const n = root.querySelector(`[data-clip="${L.id}"] .trim[data-trim="${s}"]`); n && n.focus();
}
function bind(el) {
  el.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && el.contains(b)) act(b, e); });
  el.addEventListener('input', onInput); el.addEventListener('change', onChange);
  el.addEventListener('submit', e => { if (e.target.dataset.form === 'save') { e.preventDefault(); ui.saving = false; saveMix(e.target.n.value.trim()); } });
  el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onUp);
  el.addEventListener('keydown', onKey);
  el.addEventListener('dragover', e => { const d = e.target.closest('[data-drop]'); if (d) { e.preventDefault(); d.classList.add('over'); } });
  el.addEventListener('dragleave', e => { const d = e.target.closest('[data-drop]'); if (d) d.classList.remove('over'); });
  el.addEventListener('drop', e => { const d = e.target.closest('[data-drop]'); if (!d) return; e.preventDefault(); d.classList.remove('over'); upload([...e.dataTransfer.files].filter(f => /^audio\//.test(f.type) || /\.(mp3|wav|m4a|aac|ogg)$/i.test(f.name))); });
}

/* ---------------- phone pop-up: every showing layer on one screen ---------------- */
let pop = null, dim = null;
function popHTML() {
  const cols = S.layers.filter(L => !L.hidden && (L.kind === 'synth' || fileById(L.file)));
  let g = `<span style="grid-column:1;grid-row:1"></span>`;
  cols.forEach((L, ci) => { g += `<div class="h" style="--c:${color(L)};grid-column:${ci + 2};grid-row:1">${esc(L.kind === 'audio' ? lname(L).replace(/\.[a-z0-9]+$/i, '') : lname(L))}</div>`; });
  for (let i = 0; i < 16; i++) {
    g += `<span class="n${i % 4 === 0 ? ' beat' : ''}" data-r="${i}" style="grid-column:1;grid-row:${i + 2}">${i % 4 === 0 ? i / 4 + 1 : '·'}</span>`;
    cols.forEach((L, ci) => { if (L.kind === 'synth' || L.mode === 'steps') g += `<button type="button" class="${cellCls(L.steps[i], i)}" data-act="cell" data-l="${L.id}" data-i="${i}" aria-pressed="${L.steps[i]}" aria-label="${esc(lname(L))}, step ${i + 1}" style="--c:${color(L)};grid-column:${ci + 2};grid-row:${i + 2}"></button>`; });
  }
  cols.forEach((L, ci) => { if (L.kind === 'audio' && L.mode === 'loop') g += `<div class="vclip" style="--c:${color(L)};grid-column:${ci + 2};grid-row:2 / span 16"><svg viewBox="0 0 40 400" preserveAspectRatio="none" aria-hidden="true"><path d="${wavePath(fileById(L.file).peaks, 40, 400, true)}"/></svg></div>`; });
  const hid = S.layers.length - cols.length;
  return `<div class="hd"><b>18 · advl auditory</b><button type="button" class="cl" data-act="close" aria-label="Close">${CLOSE}</button></div>
  <div class="tr"><button type="button" class="play${playing ? ' on' : ''}" data-act="play" aria-label="${playing ? 'Stop' : 'Play'}">${playing ? STOP : PLAY}</button><div class="bpm"><b data-bpm>${S.bpm}</b><span> BPM</span></div>
    <button type="button" class="rb" data-act="bpm" data-v="-1" aria-label="Slower">−</button><button type="button" class="rb" data-act="bpm" data-v="1" aria-label="Faster">+</button>
    <select data-in="feel" aria-label="Pick a feel"><option value="">Feel</option>${FEELS.map(([l, b]) => `<option value="${b}"${S.bpm === b ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
  <div class="pg" style="grid-template-columns:14px repeat(${Math.max(1, cols.length)},1fr)"><span class="hl" aria-hidden="true"></span>${g}</div>
  <div class="foot"><span class="k">${cols.length} showing${hid ? ` · ${hid} hidden` : ''}</span><button type="button" class="pill" data-act="close">Layers</button><button type="button" class="pill solid" data-act="quicksave">Save mix</button></div>`;
}
function popPaint() { if (pop) { pop.innerHTML = popHTML(); if (shown >= 0) head(shown, true); } }
function openPop() {
  if (pop) return;
  dim = document.createElement('div'); dim.className = 'au-dim'; dim.addEventListener('click', closePop);
  pop = document.createElement('div'); pop.className = 'au-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); pop.setAttribute('aria-label', 'advl auditory, all layers');
  pop.innerHTML = popHTML(); bind(pop); pop.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
  document.body.append(dim, pop); document.documentElement.style.overflow = 'hidden';
  requestAnimationFrame(() => { dim.classList.add('in'); pop.classList.add('in'); const c = pop.querySelector('.cl'); c && c.focus(); if (shown >= 0) head(shown, true); });
}
function closePop() {
  if (!pop) return; const p = pop, d = dim; pop = dim = null; document.documentElement.style.overflow = '';
  p.classList.remove('in'); d.classList.remove('in'); setTimeout(() => { p.remove(); d.remove(); }, RM ? 0 : 900);
  paint(); const x = root && root.querySelector('[data-act="expand"]'); x && x.focus({ preventScroll: true });
}

/* ---------------- mount ---------------- */
function css() { if (document.querySelector('link[data-aud-css]')) return; const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'auditory.css'; l.dataset.audCss = ''; document.head.appendChild(l); }
let loaded = false;
window.ADVL_AUD = {
  async mount(el) {
    if (root === el) return;
    css(); root = el; ui = { voices: false, saving: false, exp: false, confirm: null }; msgs = { lib: '', mx: '' };
    if (!loaded) { loadState(); loaded = true; }
    bind(el); paint();
    await loadLibrary(); paint();
  },
  unmount() { stop(); closePop(); root = null; },
  _state: () => S, _render: render, _wav: wav, _mp3: mp3
};
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
addEventListener('resize', () => { if (pop && !phone()) closePop(); });
})();
