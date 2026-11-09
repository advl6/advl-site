/* advl auditory · sound engine, instruments, state, storage and voice tools.
   Loaded by auditory.js (the interface). Everything runs in the visitor's browser. */
(() => {
'use strict';
if (window.AUDX) return;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid = () => Math.random().toString(36).slice(2, 10);
const n01 = v => clamp(v, 0, 100) / 100;

/* ---------------- instruments ---------------- */
const BASE = { pitch: 50, punch: 50, length: 50, tone: 62, drive: 0, swing: 0, glide: 0, vibrato: 0, lfo: 40, a: 4, s: 55, r: 30, res: 18, osc: 'sine' };
const MINOR = [0, 3, 5, 7, 10, 12, 15, 17];
const V = {
  kick: { n: 'Kick', s: 'KCK', g: 'drums', c: '#CFF002', bassy: 1, start: [0, 4, 8, 12],
    styles: { '808': { pitch: 30, punch: 55, length: 70, tone: 45 }, '909': { pitch: 45, punch: 88, length: 38, tone: 72 }, 'Acoustic': { pitch: 55, punch: 66, length: 28, tone: 62, drive: 8 }, 'Lo-fi tape': { pitch: 36, punch: 50, length: 55, tone: 30, drive: 35 }, 'Distorted': { pitch: 40, punch: 82, length: 52, tone: 66, drive: 80 }, 'Soft felt': { pitch: 30, punch: 14, length: 44, tone: 36 } },
    presets: { 'Deep 808': { pitch: 22, length: 86 }, 'Punchy club': { punch: 92, length: 40 }, 'Boom': { pitch: 16, length: 96 }, 'Soft thud': { punch: 18, length: 34 }, 'Clicky': { punch: 100, tone: 86, length: 24 } } },
  snare: { n: 'Snare', s: 'SNR', g: 'drums', c: '#15E681', start: [4, 12],
    styles: { 'Crisp': { tone: 72, punch: 62, length: 34 }, 'Fat': { tone: 46, punch: 48, length: 58, pitch: 38 }, 'Rimshot': { tone: 86, punch: 90, length: 14, pitch: 70 }, 'Brush': { tone: 58, punch: 12, length: 60, a: 18 }, 'Lo-fi': { tone: 34, punch: 50, length: 40, drive: 30 } },
    presets: { 'Tight': { length: 20 }, 'Roomy': { length: 72 }, 'Crack': { punch: 96 }, 'Soft': { punch: 20 } } },
  clap: { n: 'Clap', s: 'CLP', g: 'drums', c: '#1AC3B9', start: [12],
    styles: { 'Wide': { punch: 70, length: 38 }, 'Tight': { punch: 40, length: 18 }, 'Room': { punch: 64, length: 74 }, 'Snap': { punch: 20, length: 12, tone: 86 } },
    presets: { 'Crowd': { punch: 100 }, 'Dry': { length: 14 }, 'Dark': { tone: 30 } } },
  hat: { n: 'Hi-hat', s: 'HAT', g: 'drums', c: '#12A5CA', start: [2, 6, 10, 14],
    styles: { 'Closed': { length: 14, punch: 40, tone: 74 }, 'Open': { length: 62, punch: 46, tone: 70 }, 'Sizzle': { length: 30, punch: 86, tone: 80 }, 'Shaker': { length: 24, punch: 10, tone: 64, a: 12 }, 'Tick': { length: 6, punch: 20, tone: 92 } },
    presets: { 'Shiny': { tone: 92 }, 'Dull': { tone: 40 }, 'Fizzy': { punch: 96 } } },
  kit: { n: 'Drum kit', s: 'KIT', g: 'drums', c: '#5FE0C8', start: [7, 13, 14, 15],
    styles: { 'Low tom': { pitch: 30, length: 50 }, 'Mid tom': { pitch: 48, length: 44 }, 'High tom': { pitch: 66, length: 38 }, 'Crash': { length: 80, tone: 80 }, 'Ride': { length: 60, tone: 86 }, 'Rim': { pitch: 70, length: 10 }, 'Cowbell': { pitch: 55, length: 30 }, 'Conga': { pitch: 52, length: 32 }, 'Shaker': { length: 18, tone: 70 } },
    presets: { 'Tight': { length: 22 }, 'Long': { length: 82 }, 'Bright': { tone: 90 } } },
  bass: { n: 'Bass', s: 'BAS', g: 'melody', c: '#047BFA', bassy: 1, root: 38, osc: ['saw', 'square', 'sine'], start: [0, 3, 6, 8, 11, 14], notes: [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 5, 0, 0, 3, 0],
    styles: { 'Sub': { tone: 34, res: 10, punch: 30, osc: 'sine' }, 'Growl': { tone: 58, res: 60, drive: 40, osc: 'saw' }, 'Rubber': { tone: 46, res: 70, glide: 30, osc: 'square' }, 'Acid': { tone: 52, res: 88, punch: 80, osc: 'saw' }, 'Wobble': { tone: 40, res: 50, vibrato: 60, lfo: 30, osc: 'saw' } },
    presets: { 'Deep': { pitch: 40 }, 'Bouncy': { length: 24 }, 'Held': { length: 82 }, 'Gritty': { drive: 60 } } },
  theremin: { n: 'Theremin', s: 'THR', g: 'melody', c: '#9C6BFF', root: 62, osc: ['sine', 'triangle', 'saw', 'square'], start: [0, 4, 6, 8, 12], notes: [0, 0, 0, 0, 3, 0, 7, 0, 10, 0, 0, 0, 7, 0, 5, 0],
    styles: { 'Glide': { glide: 65, vibrato: 40, a: 20, s: 80, r: 50, osc: 'sine' }, 'Eerie': { glide: 85, vibrato: 70, lfo: 55, a: 40, s: 90, r: 70, osc: 'sine' }, 'Vocal': { glide: 50, vibrato: 30, tone: 48, osc: 'triangle' }, 'Laser': { glide: 95, vibrato: 10, tone: 80, osc: 'saw' } },
    presets: { 'Classic': {}, 'Ghost': { vibrato: 80, tone: 45 }, 'Siren': { glide: 100, lfo: 70 }, 'Warm': { tone: 40, osc: 'triangle' } } },
  handpan: { n: 'Handpan', s: 'HPN', g: 'melody', c: '#C9B8FF', root: 50, start: [0, 2, 5, 8, 10, 13], notes: [0, 0, 7, 0, 0, 3, 0, 0, 5, 0, 10, 0, 0, 7, 0, 0],
    styles: { 'D minor': { length: 70 }, 'Bright': { tone: 84, length: 60 }, 'Muted': { tone: 40, length: 30 } }, presets: { 'Ringing': { length: 90 }, 'Soft': { punch: 20 } } },
  kalimba: { n: 'Kalimba', s: 'KAL', g: 'melody', c: '#6FA8FF', root: 74, start: [0, 3, 6, 10, 12], notes: [0, 0, 0, 5, 0, 0, 7, 0, 0, 0, 3, 0, 10, 0, 0, 0],
    styles: { 'Classic': { length: 45 }, 'Wood box': { tone: 50, length: 35 }, 'Glassy': { tone: 88, length: 60 } }, presets: { 'Short': { length: 20 }, 'Long': { length: 75 } } },
  marimba: { n: 'Marimba', s: 'MRM', g: 'melody', c: '#B48CFF', root: 62, start: [0, 2, 4, 7, 9, 12, 14], notes: [0, 0, 3, 0, 5, 0, 0, 7, 0, 5, 0, 0, 3, 0, 0, 0],
    styles: { 'Rosewood': { length: 38 }, 'Soft mallet': { punch: 20, tone: 44 }, 'Hard mallet': { punch: 90, tone: 80 } }, presets: { 'Dry': { length: 18 }, 'Warm': { tone: 40 } } },
  steel: { n: 'Steel drum', s: 'STL', g: 'melody', c: '#8FD3FF', root: 62, start: [0, 3, 6, 8, 11, 14], notes: [0, 0, 0, 7, 0, 0, 5, 0, 3, 0, 0, 0, 0, 0, 10, 0],
    styles: { 'Island': { length: 50 }, 'Tenor pan': { pitch: 62, length: 45 }, 'Mellow': { tone: 46, length: 55 } }, presets: { 'Sparkle': { tone: 90 }, 'Short': { length: 22 } } },
  bowl: { n: 'Singing bowl', s: 'BWL', g: 'melody', c: '#D7C2FF', root: 50, start: [0], notes: Array(16).fill(0),
    styles: { 'Brass': { length: 95 }, 'Crystal': { tone: 90, length: 95 }, 'Small': { pitch: 70, length: 80 } }, presets: { 'Endless': { length: 100 }, 'Struck': { punch: 90 } } },
  glass: { n: 'Glass', s: 'GLS', g: 'melody', c: '#A6E3FF', root: 74, start: [0, 8], notes: [0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0],
    styles: { 'Rubbed rim': { a: 60, length: 90, s: 85 }, 'Tapped': { a: 2, length: 50 }, 'Harmonica': { a: 40, tone: 80, s: 90 } }, presets: { 'Airy': { tone: 92 }, 'Close': { tone: 50 } } },
  pluck: { n: 'Pluck', s: 'PLK', g: 'melody', c: '#8C9EFF', root: 62, osc: ['saw', 'square', 'triangle'], start: [0, 3, 6, 9, 12, 14], notes: [0, 0, 0, 7, 0, 0, 3, 0, 0, 10, 0, 0, 7, 0, 5, 0],
    styles: { 'Harp': { length: 60, tone: 66, osc: 'triangle' }, 'Guitar-ish': { length: 45, tone: 58, osc: 'saw' }, 'Sparkle': { length: 30, tone: 88, osc: 'square' } }, presets: { 'Short': { length: 18 }, 'Bright': { tone: 90 } } },
  choir: { n: 'Choir', s: 'CHR', g: 'melody', c: '#E0B3FF', root: 62, start: [0, 8], notes: [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    styles: { 'Aah': { a: 50, s: 85, r: 60 }, 'Ooh': { a: 50, s: 85, r: 60, tone: 40 }, 'Eeh': { a: 40, s: 80, r: 50, tone: 80 } }, presets: { 'Swell': { a: 90 }, 'Short': { length: 30, s: 40 } } },
  bell: { n: 'FM bell', s: 'BEL', g: 'melody', c: '#B3C7FF', root: 74, start: [0, 6, 12], notes: [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 3, 0, 0, 0],
    styles: { 'Chime': { length: 70, punch: 60 }, 'Metal': { length: 55, punch: 90, tone: 80 }, 'Soft': { length: 80, punch: 25 } }, presets: { 'Tiny': { pitch: 70 }, 'Church': { pitch: 30, length: 95 } } },
  pad: { n: 'Analog pad', s: 'PAD', g: 'melody', c: '#7A5CFF', root: 50, osc: ['saw', 'square', 'triangle'], start: [0], notes: Array(16).fill(0),
    styles: { 'Wide': { a: 60, s: 90, r: 70, tone: 50, vibrato: 10, osc: 'saw' }, 'Dark': { a: 70, s: 90, r: 80, tone: 30, osc: 'saw' }, 'Shimmer': { a: 50, s: 85, r: 70, tone: 80, osc: 'square' } }, presets: { 'Slow swell': { a: 95 }, 'Short': { a: 20, length: 30 } } }
};
const VOICE_ORDER = ['kick', 'snare', 'clap', 'hat', 'kit', 'bass', 'theremin', 'handpan', 'kalimba', 'marimba', 'steel', 'bowl', 'glass', 'pluck', 'choir', 'bell', 'pad'];
const SOUNDS = { kick: ['Deep 808', 'Punchy kick', 'Clicky kick', 'Boom kick'], snare: ['Crisp snare', 'Fat snare', 'Rimshot'], clap: ['Wide clap', 'Room clap'], hat: ['Closed hat', 'Sizzle hat'], bass: ['Sub bass', 'Acid line'] };
const AUDC = ['#A98BFF', '#B79CFF', '#C9B8FF', '#E3A6FF', '#F2C6FF'];
const VOICEC = ['#E3A6FF', '#F2C6FF', '#D9A8FF'];
const GROUPS = [['drums', 'Drums'], ['melody', 'Bass & melody'], ['voice', 'Voice'], ['audio', 'Your audio']];

/* ---------------- state ---------------- */
const KEY = 'advl-aud-v2';
function synthLayer(v, o = {}) {
  const D = V[v], st = Object.keys(D.styles)[0];
  const p = Object.assign({}, BASE, D.osc ? { osc: D.osc[0] } : {}, D.styles[st]);
  return Object.assign({ id: uid(), kind: 'synth', voice: v, style: st, preset: null, steps: Array.from({ length: 16 }, (_, i) => D.start.includes(i)),
    vel: Array(16).fill(0.8), notes: (D.notes || Array(16).fill(0)).slice(), barsOn: null, p, vol: 70, fadeIn: 0, fadeOut: 0, depth: 20, around: 33, rev: 15, echo: 0, eqLo: 50, eqHi: 50,
    mute: false, solo: false, hidden: false, open: false, auto: null, origin: null }, o);
}
function fresh() {
  return { v: 2, mode: 'casual', bpm: 124, bass: 65, vol: 80, bars: 8, start: 0, end: 128, metro: false, room: 40, cur: null, sel: null,
    fin: { type: 'Smooth (S-curve)', bars: 1 }, fout: { type: 'Smooth (S-curve)', bars: 1 }, win: {},
    layers: ['kick', 'snare', 'hat', 'bass'].map((v, i) => synthLayer(v, { open: i === 0 })) };
}
function fixLayer(L) {
  const len = L.steps.length;
  if (!Array.isArray(L.vel) || L.vel.length !== len) L.vel = Array(len).fill(0.8);
  if (!Array.isArray(L.notes) || L.notes.length !== len) L.notes = Array(len).fill(0);
  L.p = Object.assign({}, BASE, L.p || {});
  ['vol', 'fadeIn', 'fadeOut', 'depth', 'around', 'rev', 'echo', 'eqLo', 'eqHi'].forEach(k => { if (typeof L[k] !== 'number') L[k] = { vol: 70, depth: 20, around: 33, rev: 15, eqLo: 50, eqHi: 50 }[k] || 0; });
  if (L.kind === 'audio') { L.trim = Array.isArray(L.trim) ? L.trim : [0, 1]; L.mode = L.mode === 'steps' ? 'steps' : 'loop'; }
  return L;
}
function valid(s) { return s && Array.isArray(s.layers) && s.layers.every(L => L && L.id && Array.isArray(L.steps) && L.steps.length >= 16 && L.steps.length % 16 === 0 && (L.kind === 'audio' || V[L.voice])); }
function migrate1(o) {
  // version 1 (single-bar beat maker) → version 2
  const s = fresh(); s.bpm = clamp(+o.bpm || 124, 60, 180); s.bass = +o.bass || 65; s.vol = +o.vol || 80; s.layers = [];
  (o.layers || []).forEach(L => {
    if (!L || !Array.isArray(L.steps) || L.steps.length !== 16) return;
    if (L.kind === 'synth' && V[L.voice]) { const n = synthLayer(L.voice, { steps: L.steps.map(Boolean), vol: +L.vol || 70, hidden: !!L.hidden });
      if (Array.isArray(L.params)) { n.p.pitch = +L.params[0]; n.p.punch = +L.params[1]; n.p.length = +L.params[2]; } s.layers.push(n); }
    else if (L.kind === 'audio' && L.file) s.layers.push(fixLayer({ id: uid(), kind: 'audio', file: L.file, name: L.name, color: L.color, mode: L.mode, steps: L.steps.map(Boolean), trim: L.trim, vol: +L.vol || 70, hidden: !!L.hidden, fadeIn: (+L.fade || 0) / 25, p: { pitch: +L.pitch || 50 } }));
  });
  if (!s.layers.length) s.layers = fresh().layers;
  return s;
}
function load() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!valid(s)) { try { const o = JSON.parse(localStorage.getItem('advl-aud-v1') || 'null'); if (o && o.layers) s = migrate1(o); } catch (e) {} }
  if (!valid(s)) s = fresh();
  s = Object.assign(fresh(), s); s.layers.forEach(fixLayer);
  ['fin', 'fout'].forEach(k => { const d = fresh()[k]; s[k] = Object.assign(d, s[k]); s[k].bars = clamp(+s[k].bars || 0, 0, 16); }); if (!s.win || typeof s.win !== 'object') s.win = {};
  s.bars = clamp(+s.bars || 8, 1, 64); s.end = clamp(s.end || s.bars * 16, 1, s.bars * 16); s.start = clamp(s.start || 0, 0, s.end - 1); s.bpm = clamp(+s.bpm || 124, 60, 180);
  return s;
}
let S = load();
let saveT = 0;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 300); };
const byId = id => S.layers.find(L => L.id === id);
const groupOf = L => L.kind === 'audio' ? (L.origin === 'rec' ? 'voice' : 'audio') : (L.origin === 'hum' || L.origin === 'move' ? 'voice' : V[L.voice].g);
const colorOf = L => L.kind === 'audio' ? (L.color || AUDC[0]) : (L.color || V[L.voice].c);
const nameOf = L => L.kind === 'audio' ? (L.name || 'Audio') : (L.label || V[L.voice].n);
const shortOf = L => L.kind === 'audio' ? (L.origin === 'rec' ? 'VOX' : (L.name || 'AUD').replace(/\.[a-z0-9]+$/i, '').replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'AUD') : (L.origin === 'hum' ? 'HUM' : L.origin === 'move' ? 'MOV' : V[L.voice].s);
const bassy = L => L.kind === 'synth' && V[L.voice].bassy;
const stepDur = () => 60 / S.bpm / 4;
const totalSteps = () => S.bars * 16;
function sortLayers() { const order = GROUPS.map(g => g[0]); S.layers.sort((a, b) => order.indexOf(groupOf(a)) - order.indexOf(groupOf(b))); }

/* ---------------- storage for uploads and mixes ---------------- */
const DB = (() => {
  let p = null;
  const open = () => p || (p = new Promise((ok, no) => {
    if (!window.indexedDB) return no(new Error('no storage'));
    const r = indexedDB.open('advl-auditory', 1);
    r.onupgradeneeded = () => { const d = r.result; ['files', 'blobs', 'mixes'].forEach(n => d.objectStoreNames.contains(n) || d.createObjectStore(n, { keyPath: 'id' })); };
    r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); r.onblocked = () => no(new Error('blocked'));
  }));
  const run = (st, mode, fn) => open().then(d => new Promise((ok, no) => { const t = d.transaction(st, mode), q = fn(t.objectStore(st)); t.oncomplete = () => ok(q ? q.result : undefined); t.onerror = () => no(t.error); t.onabort = () => no(t.error); }));
  return { all: st => run(st, 'readonly', s => s.getAll()), get: (st, id) => run(st, 'readonly', s => s.get(id)), put: (st, v) => run(st, 'readwrite', s => s.put(v)), del: (st, id) => run(st, 'readwrite', s => s.delete(id)) };
})();
const LIB = { files: [], mixes: [], ok: true };
const BUF = new Map();
const fileById = id => LIB.files.find(f => f.id === id);
async function loadLibrary() { try { LIB.files = (await DB.all('files')).sort((a, b) => a.added - b.added); LIB.mixes = (await DB.all('mixes')).sort((a, b) => b.saved - a.saved); } catch (e) { LIB.ok = false; } }
async function bufferFor(id) {
  if (BUF.has(id)) return BUF.get(id);
  const rec = await DB.get('blobs', id); if (!rec) return null;
  ensure(true); const b = await ctx.decodeAudioData(rec.data.slice(0)); BUF.set(id, b); return b;
}
function peaksOf(buf, n = 120) {
  const d = buf.getChannelData(0), per = Math.max(1, Math.floor(d.length / n)), out = []; let max = 0.001;
  for (let i = 0; i < n; i++) { let m = 0; for (let j = i * per, e = Math.min(d.length, j + per); j < e; j += 4) { const a = Math.abs(d[j]); if (a > m) m = a; } out.push(m); if (m > max) max = m; }
  return out.map(v => +(v / max).toFixed(3));
}

/* ---------------- engine ---------------- */
function irBuffer(c, room) {
  const secs = 0.6 + n01(room) * 3.4, len = Math.floor(c.sampleRate * secs), b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
  return b;
}
function makeEngine(c, live) {
  const len = Math.floor(c.sampleRate * 2), noise = c.createBuffer(1, len, c.sampleRate), d = noise.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const comp = c.createDynamicsCompressor(); comp.threshold.value = -10; comp.knee.value = 8; comp.ratio.value = 4; comp.attack.value = 0.003; comp.release.value = 0.15;
  const master = c.createGain(), bassBus = c.createGain(), mainBus = c.createGain(), an = c.createAnalyser();
  an.fftSize = 2048;
  bassBus.connect(master); mainBus.connect(master); master.connect(comp);
  // the whole piece: fade gain → tape (a delay whose time grows, so pitch falls) → filter → out; echo-out send beside it
  const pg = c.createGain(), tape = c.createDelay(12), pf = c.createBiquadFilter(), eoIn = c.createGain(), eo = c.createDelay(2), eofb = c.createGain(), eolp = c.createBiquadFilter();
  pf.type = 'lowpass'; pf.frequency.value = 20000; pf.Q.value = 0.7; tape.delayTime.value = 0; eoIn.gain.value = 0; eofb.gain.value = 0.58; eolp.type = 'lowpass'; eolp.frequency.value = 3000;
  comp.connect(pg); pg.connect(tape); tape.connect(pf); pf.connect(an); an.connect(c.destination);
  comp.connect(eoIn); eoIn.connect(eo); eo.connect(eolp); eolp.connect(eofb); eofb.connect(eo); eolp.connect(an);
  const rev = c.createConvolver(); rev.buffer = irBuffer(c, S.room); const revOut = c.createGain(); revOut.gain.value = 0.9; rev.connect(revOut); revOut.connect(master);
  const dly = c.createDelay(2), fb = c.createGain(), dlp = c.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 3500; fb.gain.value = 0.38;
  dly.connect(dlp); dlp.connect(fb); fb.connect(dly); dlp.connect(master); dly.delayTime.value = stepDur() * 3;
  eo.delayTime.value = stepDur() * 3;
  const e = { ctx: c, live, noise, master, bassBus, mainBus, an, rev, dly, pg, tape, pf, eoIn, eo, ch: new Map(), loops: new Map(), last: new Map() };
  if (live) { e.metro = c.createGain(); e.metro.gain.value = 0.35; e.metro.connect(c.destination); }
  levels(e, true); return e;
}
function levels(e, now) {
  const b = n01(S.bass) * 1.4, m = n01(S.vol) * 0.8, t = e.ctx.currentTime;
  if (now) { e.bassBus.gain.value = b; e.master.gain.value = m; e.dly.delayTime.value = stepDur() * 3; return; }
  e.bassBus.gain.setTargetAtTime(b, t, 0.03); e.master.gain.setTargetAtTime(m, t, 0.03); e.dly.delayTime.setTargetAtTime(stepDur() * 3, t, 0.05);
}
function setRoom(e) { e.rev.buffer = irBuffer(e.ctx, S.room); }
function driveCurve(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
const anySolo = () => S.layers.some(L => L.solo);
const audible = L => !L.hidden && !L.mute && (!anySolo() || L.solo);
/* one chain per layer: drive → tone filter → EQ → fades → volume → 3D panner → bus, with reverb / echo sends */
function chain(e, L) {
  let k = e.ch.get(L.id);
  if (!k) {
    const c = e.ctx;
    k = { in: c.createGain(), drv: c.createWaveShaper(), flt: c.createBiquadFilter(), lo: c.createBiquadFilter(), hi: c.createBiquadFilter(), fade: c.createGain(), vol: c.createGain(), pan: c.createPanner(), rs: c.createGain(), es: c.createGain(), an: c.createAnalyser() };
    k.flt.type = 'lowpass'; k.lo.type = 'lowshelf'; k.lo.frequency.value = 220; k.hi.type = 'highshelf'; k.hi.frequency.value = 4200;
    k.pan.panningModel = 'HRTF'; k.pan.distanceModel = 'inverse'; k.pan.refDistance = 1; k.pan.rolloffFactor = 0.9;
    k.an.fftSize = 1024; k.an.smoothingTimeConstant = 0.7;
    k.in.connect(k.drv); k.drv.connect(k.flt); k.flt.connect(k.lo); k.lo.connect(k.hi); k.hi.connect(k.fade); k.fade.connect(k.vol); k.vol.connect(k.pan);
    k.pan.connect(bassy(L) ? e.bassBus : e.mainBus); k.vol.connect(k.rs); k.vol.connect(k.es); k.rs.connect(e.rev); k.es.connect(e.dly); k.vol.connect(k.an);
    e.ch.set(L.id, k); apply(e, L, true);
  }
  return k;
}
function apply(e, L, now) {
  const k = e.ch.get(L.id); if (!k) return;
  const t = e.ctx.currentTime, set = (prm, v) => now ? (prm.value = v) : prm.setTargetAtTime(v, t, 0.04);
  const p = L.p;
  k.drv.curve = p.drive > 1 ? driveCurve(n01(p.drive) * 40) : null;
  set(k.flt.frequency, 120 * Math.pow(2, n01(p.tone) * 7.5)); set(k.flt.Q, 0.5 + n01(p.res) * 16);
  set(k.lo.gain, (L.eqLo - 50) / 50 * 12); set(k.hi.gain, (L.eqHi - 50) / 50 * 12);
  set(k.vol.gain, audible(L) ? n01(L.vol) : 0);
  set(k.rs.gain, Math.min(1, n01(L.rev) + n01(L.depth) * 0.35)); set(k.es.gain, n01(L.echo) * 0.8);
  const ang = (n01(L.around) * 270 - 90) * Math.PI / 180, dist = 1 + n01(L.depth) * 9, x = Math.sin(ang) * dist, z = -Math.cos(ang) * dist;
  if (k.pan.positionX) { set(k.pan.positionX, x); set(k.pan.positionY, 0); set(k.pan.positionZ, z); } else k.pan.setPosition(x, 0, z);
}
function applyAll(e, now) { S.layers.forEach(L => { if (e.ch.has(L.id)) apply(e, L, now); }); }
function dropChain(e, id) { const k = e.ch.get(id); if (!k) return; try { k.pan.disconnect(); k.vol.disconnect(); } catch (x) {} e.ch.delete(id); }

function noiseSrc(e, t, dur) { const s = e.ctx.createBufferSource(); s.buffer = e.noise; s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.05); return s; }
function env(p, t, peak, a, d) { p.setValueAtTime(0.0001, t); p.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + Math.max(0.001, a)); p.exponentialRampToValueAtTime(0.0001, t + a + d); }
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const OSC = { saw: 'sawtooth', square: 'square', sine: 'sine', triangle: 'triangle' };

/* drums */
const DRUMS = {
  kick(e, t, p, o, v) {
    const c = e.ctx, osc = c.createOscillator(), g = c.createGain(), dec = 0.1 + p.length * 0.95, att = p.a * 0.04;
    osc.frequency.setValueAtTime(70 + p.pitch * 180, t); osc.frequency.exponentialRampToValueAtTime(30 + p.pitch * 40, t + 0.14 - p.punch * 0.1);
    env(g.gain, t, v, 0.002 + att, dec); osc.connect(g); g.connect(o); osc.start(t); osc.stop(t + dec + 0.1);
    if (p.punch > 0.05) { const n = noiseSrc(e, t, 0.03), hp = c.createBiquadFilter(), ng = c.createGain(); hp.type = 'highpass'; hp.frequency.value = 2500; env(ng.gain, t, 0.5 * p.punch * v, 0.001, 0.012); n.connect(hp); hp.connect(ng); ng.connect(o); }
  },
  snare(e, t, p, o, v) {
    const c = e.ctx, dec = 0.06 + p.length * 0.4, n = noiseSrc(e, t, dec), hp = c.createBiquadFilter(), ng = c.createGain(), att = p.a * 0.05;
    hp.type = 'highpass'; hp.frequency.value = 900 + p.tone * 2400; env(ng.gain, t, (0.35 + p.punch * 0.6) * v, 0.001 + att, dec); n.connect(hp); hp.connect(ng); ng.connect(o);
    const osc = c.createOscillator(), og = c.createGain(); osc.type = 'triangle';
    osc.frequency.setValueAtTime(150 + p.pitch * 140, t); osc.frequency.exponentialRampToValueAtTime(110 + p.pitch * 70, t + 0.08);
    env(og.gain, t, 0.75 * (1 - p.punch * 0.5) * v, 0.001, 0.09); osc.connect(og); og.connect(o); osc.start(t); osc.stop(t + 0.16);
  },
  clap(e, t, p, o, v) {
    const c = e.ctx, k = 3 + Math.round(p.punch * 2), gap = 0.007 + p.punch * 0.014, dec = 0.06 + p.length * 0.5;
    const n = noiseSrc(e, t, (k - 1) * gap + dec), bp = c.createBiquadFilter(), g = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 800 + p.tone * 2600; bp.Q.value = 1.1; g.gain.setValueAtTime(0.0001, t);
    for (let i = 0; i < k - 1; i++) { const ti = t + i * gap; g.gain.setValueAtTime(0.9 * v, ti); g.gain.exponentialRampToValueAtTime(0.06, ti + gap * 0.95); }
    const tl = t + (k - 1) * gap; g.gain.setValueAtTime(0.9 * v, tl); g.gain.exponentialRampToValueAtTime(0.0001, tl + dec);
    n.connect(bp); bp.connect(g); g.connect(o);
  },
  hat(e, t, p, o, v) {
    const c = e.ctx, dec = 0.02 + p.length * 0.6, g = c.createGain(); env(g.gain, t, 0.32 * v, 0.001 + p.a * 0.03, dec); g.connect(o);
    const n = noiseSrc(e, t, dec), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4500 + p.tone * 4500; n.connect(hp); hp.connect(g);
    if (p.punch > 0.05) {
      const bp = c.createBiquadFilter(), mg = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = 8500 + p.tone * 2500; mg.gain.value = p.punch * 0.5; bp.connect(mg); mg.connect(g);
      [2, 3, 4.16, 5.43, 6.79, 8.21].forEach(r => { const s = c.createOscillator(); s.type = 'square'; s.frequency.value = (34 + p.pitch * 14) * r; s.connect(bp); s.start(t); s.stop(t + dec + 0.05); });
    }
  },
  kit(e, t, p, o, v, L) {
    const c = e.ctx, st = L.style;
    if (/tom|Conga/.test(st)) {
      const base = st === 'Conga' ? 220 : st === 'Low tom' ? 90 : st === 'Mid tom' ? 130 : 180, f = base * Math.pow(2, (p.pitch - 0.5) * 1.2), dec = 0.12 + p.length * 0.8;
      const osc = c.createOscillator(), g = c.createGain(); osc.frequency.setValueAtTime(f * 1.5, t); osc.frequency.exponentialRampToValueAtTime(f, t + 0.06);
      env(g.gain, t, 0.9 * v, 0.002, st === 'Conga' ? dec * 0.5 : dec); osc.connect(g); g.connect(o); osc.start(t); osc.stop(t + dec + 0.1);
      const n = noiseSrc(e, t, 0.05), bp = c.createBiquadFilter(), ng = c.createGain(); bp.type = 'bandpass'; bp.frequency.value = f * 4; env(ng.gain, t, 0.25 * v, 0.001, 0.04); n.connect(bp); bp.connect(ng); ng.connect(o);
    } else if (st === 'Crash' || st === 'Ride') {
      const dec = (st === 'Crash' ? 0.8 : 0.4) + p.length * 2, g = c.createGain(); env(g.gain, t, (st === 'Crash' ? 0.4 : 0.22) * v, 0.002, dec); g.connect(o);
      const n = noiseSrc(e, t, dec), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = st === 'Crash' ? 3500 : 6000; n.connect(hp); hp.connect(g);
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = st === 'Ride' ? 5200 : 7800; const mg = c.createGain(); mg.gain.value = 0.4; bp.connect(mg); mg.connect(g);
      [2.1, 3.3, 4.7, 5.9, 7.4].forEach(r => { const s = c.createOscillator(); s.type = 'square'; s.frequency.value = 300 * r * (0.8 + p.pitch * 0.4); s.connect(bp); s.start(t); s.stop(t + dec); });
    } else if (st === 'Cowbell') {
      const g = c.createGain(), bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 800 * (0.7 + p.pitch * 0.6); bp.Q.value = 2; env(g.gain, t, 0.5 * v, 0.001, 0.08 + p.length * 0.4);
      [540, 800].forEach(f => { const s = c.createOscillator(); s.type = 'square'; s.frequency.value = f * (0.7 + p.pitch * 0.6); s.connect(bp); s.start(t); s.stop(t + 0.6); }); bp.connect(g); g.connect(o);
    } else if (st === 'Rim') {
      const s = c.createOscillator(), g = c.createGain(); s.type = 'triangle'; s.frequency.value = 1700 * (0.7 + p.pitch * 0.6); env(g.gain, t, 0.6 * v, 0.001, 0.03 + p.length * 0.05); s.connect(g); g.connect(o); s.start(t); s.stop(t + 0.15);
    } else { DRUMS.hat(e, t, Object.assign({}, p, { punch: 0.05, a: 0.3 }), o, v); }
  }
};
/* melodic voices: f = frequency, gate = held seconds */
function adsr(g, t, gate, p, peak) {
  const a = 0.003 + p.a * 1.6, d = 0.05 + p.length * 1.6, s = Math.max(0.0005, p.s * peak), r = 0.03 + p.r * 3;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(s, t + a + d); g.gain.setValueAtTime(s, t + Math.max(a + d, gate));
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(a + d, gate) + r); return t + Math.max(a + d, gate) + r + 0.05;
}
function partials(e, t, f, o, v, list, p, atk = 0.002) {
  const c = e.ctx; let end = t;
  list.forEach(([r, gn, dm]) => { const s = c.createOscillator(), g = c.createGain(), d = (0.1 + p.length * 3) * dm; s.frequency.value = f * r; env(g.gain, t, gn * v, atk + p.a * 0.5, d); s.connect(g); g.connect(o); s.start(t); s.stop(t + atk + d + 0.1); end = Math.max(end, t + d); });
  return end;
}
function vib(e, osc, t, end, p) { if (p.vibrato < 0.02) return; const c = e.ctx, l = c.createOscillator(), g = c.createGain(); l.frequency.value = 2 + p.lfo * 8; g.gain.value = osc.frequency.value * 0.03 * p.vibrato; l.connect(g); g.connect(osc.frequency); l.start(t); l.stop(end); }
const MEL = {
  bass(e, t, f, gate, p, o, v) {
    const c = e.ctx, a = c.createOscillator(), sub = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(), sg = c.createGain();
    a.type = OSC[p.osc] || 'sawtooth'; a.frequency.value = f; sub.type = 'sine'; sub.frequency.value = f / 2; sg.gain.value = 0.7;
    lp.type = 'lowpass'; lp.Q.value = 2 + p.res * 10; lp.frequency.setValueAtTime(160 + p.tone * 3200 * (0.4 + p.punch), t); lp.frequency.exponentialRampToValueAtTime(90 + p.tone * 400, t + gate + 0.05);
    const end = adsr(g, t, gate, Object.assign({}, p, { a: p.a * 0.2 }), 0.6 * v); a.connect(lp); lp.connect(g); sub.connect(sg); sg.connect(g); g.connect(o);
    vib(e, a, t, end, p); a.start(t); sub.start(t); a.stop(end); sub.stop(end); return a;
  },
  theremin(e, t, f, gate, p, o, v, from) {
    const c = e.ctx, a = c.createOscillator(), g = c.createGain(); a.type = OSC[p.osc] || 'sine';
    const gl = p.glide * 0.35; a.frequency.setValueAtTime(from && gl > 0.005 ? from : f, t); if (from && gl > 0.005) a.frequency.exponentialRampToValueAtTime(f, t + gl);
    const end = adsr(g, t, gate, p, 0.45 * v); a.connect(g); g.connect(o); vib(e, a, t, end, Object.assign({}, p, { vibrato: Math.max(p.vibrato, 0.15) })); a.start(t); a.stop(end); return a;
  },
  pad(e, t, f, gate, p, o, v) {
    const c = e.ctx, g = c.createGain(), end = adsr(g, t, gate, p, 0.22 * v); g.connect(o);
    [-7, 0, 7, 1200].forEach((cents, i) => { const a = c.createOscillator(); a.type = OSC[p.osc] || 'sawtooth'; a.frequency.value = f * (i === 3 ? 0.5 : 1); a.detune.value = i === 3 ? 0 : cents; a.connect(g); vib(e, a, t, end, p); a.start(t); a.stop(end); });
  },
  choir(e, t, f, gate, p, o, v, from, L) {
    const c = e.ctx, g = c.createGain(), end = adsr(g, t, gate, p, 0.5 * v);
    const F = L && L.style === 'Ooh' ? [400, 800, 2600] : L && L.style === 'Eeh' ? [300, 2300, 3000] : [730, 1090, 2440];
    const mix = c.createGain(); mix.gain.value = 0.6;
    F.forEach((ff, i) => { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 8; const bg = c.createGain(); bg.gain.value = [1, 0.6, 0.35][i]; mix.connect(bp); bp.connect(bg); bg.connect(g); });
    [-9, 0, 8].forEach(cents => { const a = c.createOscillator(); a.type = 'sawtooth'; a.frequency.value = f; a.detune.value = cents; a.connect(mix); vib(e, a, t, end, Object.assign({}, p, { vibrato: Math.max(0.2, p.vibrato), lfo: 0.3 })); a.start(t); a.stop(end); });
    g.connect(o);
  },
  pluck(e, t, f, gate, p, o, v) {
    const c = e.ctx, a = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain(); a.type = OSC[p.osc] || 'sawtooth'; a.frequency.value = f;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(400 + p.tone * 7000, t); lp.frequency.exponentialRampToValueAtTime(200 + f, t + 0.1 + p.length * 0.6);
    const d = 0.08 + p.length * 1.4; env(g.gain, t, 0.5 * v, 0.002, d); a.connect(lp); lp.connect(g); g.connect(o); a.start(t); a.stop(t + d + 0.1);
  },
  handpan: (e, t, f, g, p, o, v) => partials(e, t, f, o, v * 0.55, [[1, 1, 1], [2, 0.45, 0.6], [2.98, 0.22, 0.4], [4.03, 0.12, 0.25]], p, 0.004),
  kalimba: (e, t, f, g, p, o, v) => partials(e, t, f, o, v * 0.5, [[1, 1, 0.6], [5.4, 0.35, 0.12], [8.9, 0.12, 0.06]], p),
  marimba: (e, t, f, g, p, o, v) => partials(e, t, f, o, v * 0.6, [[1, 1, 0.5], [4, 0.3 * (0.5 + p.punch), 0.15], [9.9, 0.08, 0.06]], p),
  steel: (e, t, f, g, p, o, v) => partials(e, t, f, o, v * 0.45, [[1, 1, 0.7], [2, 0.6, 0.5], [3, 0.35, 0.35], [3.95, 0.3, 0.3], [5.2, 0.12, 0.2]], p),
  bowl(e, t, f, g, p, o, v) { partials(e, t, f, o, v * 0.4, [[1, 1, 3], [2.71, 0.5, 2], [5.18, 0.22, 1.2]], p, 0.01); partials(e, t, f * 1.004, o, v * 0.3, [[1, 1, 3], [2.71, 0.4, 2]], p, 0.01); },
  glass(e, t, f, gate, p, o, v) {
    const c = e.ctx, g = c.createGain(), end = adsr(g, t, gate, Object.assign({}, p, { a: Math.max(p.a, 0.1) }), 0.3 * v); g.connect(o);
    [[1, 1], [2.32, 0.35], [4.25, 0.15]].forEach(([r, gn]) => { const a = c.createOscillator(), ag = c.createGain(); a.frequency.value = f * r; ag.gain.value = gn; a.connect(ag); ag.connect(g); vib(e, a, t, end, Object.assign({}, p, { vibrato: Math.max(0.05, p.vibrato), lfo: 0.2 })); a.start(t); a.stop(end); });
  },
  bell(e, t, f, gate, p, o, v) {
    const c = e.ctx, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = c.createGain(), d = 0.3 + p.length * 3.5;
    car.frequency.value = f; mod.frequency.value = f * 3.5; mg.gain.setValueAtTime(f * (1 + p.punch * 6), t); mg.gain.exponentialRampToValueAtTime(f * 0.1, t + d);
    env(g.gain, t, 0.35 * v, 0.002, d); mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.connect(o); car.start(t); mod.start(t); car.stop(t + d + 0.1); mod.stop(t + d + 0.1);
  }
};
const P01 = L => { const o = {}; for (const k in L.p) o[k] = typeof L.p[k] === 'number' ? n01(L.p[k]) : L.p[k]; return o; };
function autoAt(L, frac) { if (!L.auto || !L.auto.length) return 0; const n = L.auto.length, x = clamp(frac, 0, 1) * (n - 1), i = Math.floor(x), f = x - i; const a = L.auto[i] ?? 0, b = L.auto[Math.min(n - 1, i + 1)] ?? a; return (a + (b - a) * f) * 12; }
function gateSteps(L, idx) { const n = L.steps.length; for (let k = 1; k <= n; k++) if (L.steps[(idx + k) % n]) return k; return n; }
function trigger(e, L, idx, t, g, sd) {
  const p = P01(L), o = chain(e, L).in, v = clamp(L.vel[idx] ?? 0.8, 0.05, 1);
  if (L.kind === 'audio') { if (L.mode === 'steps') oneShot(e, L, t, BUF.get(L.file), autoAt(L, g / totalSteps())); return; }
  const D = V[L.voice];
  if (DRUMS[L.voice]) { DRUMS[L.voice](e, t, p, o, v, L); return; }
  const semis = (p.pitch - 0.5) * 24 + (L.notes[idx] || 0) + autoAt(L, g / totalSteps()), f = mtof(D.root + semis);
  const gate = Math.min(gateSteps(L, idx), 16) * sd * (0.35 + p.length * 0.6);
  const from = e.last.get(L.id); e.last.set(L.id, f);
  MEL[L.voice](e, t, f, gate, p, o, v, from, L);
}
const rate = L => Math.pow(2, ((L.p.pitch || 50) - 50) * 24 / 100 / 12);
function region(L, b) { const a = clamp(L.trim[0], 0, 1) * b.duration, z = clamp(L.trim[1], 0, 1) * b.duration; return [a, Math.max(0.02, z - a)]; }
function oneShot(e, L, t, b, semis = 0) { if (!b) return; const s = e.ctx.createBufferSource(), [a, d] = region(L, b); s.buffer = b; s.playbackRate.value = rate(L) * Math.pow(2, semis / 12); s.connect(chain(e, L).in); s.start(t, a, d); }
function loopStart(e, L, t, b, until, off = 0) {
  if (!b) return; const s = e.ctx.createBufferSource(), [a, d] = region(L, b);
  s.buffer = b; s.loop = true; s.loopStart = a; s.loopEnd = a + d; s.playbackRate.value = rate(L); s.connect(chain(e, L).in); s.start(t, a + (off * rate(L)) % d); if (until) s.stop(until);
  const old = e.loops.get(L.id); if (old && e.live) { try { old.stop(t); } catch (x) {} }
  e.loops.set(L.id, s);
}
function loopStop(e, id, when) { const s = e.loops.get(id); if (!s) return; try { s.stop(when || e.ctx.currentTime + 0.02); } catch (x) {} e.loops.delete(id); }
/* fades are per layer and follow the piece: in from START, out before END */
function fades(e, t, span) {
  const now = Math.max(t, e.ctx.currentTime);
  S.layers.forEach(L => {
    const k = chain(e, L), fi = Math.min(L.fadeIn, span * 0.9), fo = Math.min(L.fadeOut, span * 0.9), gp = k.fade.gain, at = x => clamp(x, 0.0001, 1);
    gp.cancelScheduledValues(now);
    if (fi > 0.01 && now < t + fi) { gp.setValueAtTime(at((now - t) / fi), now); gp.exponentialRampToValueAtTime(1, t + fi); } else gp.setValueAtTime(1, now);
    if (fo > 0.01) { const s0 = t + span - fo; if (now <= s0) { gp.setValueAtTime(1, s0); gp.exponentialRampToValueAtTime(0.0001, t + span); } else if (now < t + span) { gp.setValueAtTime(at(1 - (now - s0) / fo), now); gp.exponentialRampToValueAtTime(0.0001, t + span); } }
  });
}
/* whole-piece fades: in from START, out before END, each with a type */
const sc = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, ex = t => (Math.pow(2, 10 * t) - 1) / 1023, cut = t => 120 * Math.pow(20000 / 120, t);
const FADE = {
  in: { 'Linear': t => ({ g: t }), 'Smooth (S-curve)': t => ({ g: sc(t) }), 'Exponential': t => ({ g: ex(t) }), 'Slow start': t => ({ g: t * t * t }),
    'Filter open': t => ({ g: Math.min(1, t * 2.5), f: cut(t) }), 'Swell': t => ({ g: t * t, f: cut(.45 + t * .55) }) },
  out: { 'Linear': t => ({ g: 1 - t }), 'Smooth (S-curve)': t => ({ g: 1 - sc(t) }), 'Exponential': t => ({ g: ex(1 - t) }), 'Filter close': t => ({ g: 1 - Math.pow(t, 3), f: cut(1 - t) }),
    'Echo out': t => ({ g: Math.max(0, 1 - t * 1.4), echo: Math.min(1, t * 2.2) * (t > .97 ? 0 : 1) }), 'Tape stop': t => ({ g: t < .8 ? 1 : 1 - (t - .8) / .2, tape: true }) }
};
const FADE_IN = Object.keys(FADE.in), FADE_OUT = Object.keys(FADE.out);
function fadeLens() {
  const sd = stepDur(), end = Math.min(S.end, totalSteps()), start = Math.min(S.start, end - 1), n = end - start;
  let a = Math.round(S.fin.bars * 16), b = Math.round(S.fout.bars * 16); if (a + b > n) { const k = n / (a + b); a = Math.floor(a * k); b = Math.floor(b * k); }
  return { start, end, a, b, sd };
}
/* the shape at a position (in steps from START, fractional) */
function shapeAt(x) {
  const { start, end, a, b } = fadeLens(), n = end - start; let o = { g: 1, f: 20000, echo: 0, tape: 0 };
  if (a > 0 && x < a) Object.assign(o, (FADE.in[S.fin.type] || FADE.in.Linear)(clamp(x / a, 0, 1)));
  if (b > 0 && x > n - b) { const t = clamp((x - (n - b)) / b, 0, 1), r = (FADE.out[S.fout.type] || FADE.out.Linear)(t); o.g *= r.g; if (r.f) o.f = Math.min(o.f, r.f); if (r.echo) o.echo = r.echo; if (r.tape) { const T = b * stepDur(), tt = t * T; o.tape = tt * tt / (2 * T); } }
  o.f = o.f || 20000; return o;
}
function pieceShape(e, g, t, sd, jump) {
  const { start } = fadeLens(), x0 = g - start;
  const P = [[e.pg.gain, 'g'], [e.pf.frequency, 'f'], [e.eoIn.gain, 'echo'], [e.tape.delayTime, 'tape']];
  if (jump || x0 === 0) { const o = shapeAt(x0); P.forEach(([p, k]) => { p.cancelScheduledValues(t); p.setValueAtTime(Math.max(k === 'f' ? 40 : 0, o[k]), t); }); }
  for (let i = 1; i <= 4; i++) { const o = shapeAt(x0 + i / 4); P.forEach(([p, k]) => p.linearRampToValueAtTime(Math.max(k === 'f' ? 40 : 0, o[k]), t + sd * i / 4)); }
}
function shapeOff(e) { const t = e.ctx.currentTime; [[e.pg.gain, 1], [e.pf.frequency, 20000], [e.eoIn.gain, 0], [e.tape.delayTime, 0]].forEach(([p, v]) => { p.cancelScheduledValues(t); p.setValueAtTime(p.value, t); p.linearRampToValueAtTime(v, t + 0.03); }); }
function step(e, g, t, sd) {
  const bar = Math.floor(g / 16), sw = sd * 0.5;
  for (const L of S.layers) {
    if (!audible(L) || (L.barsOn && L.barsOn[bar] === false)) continue;
    const idx = g % L.steps.length; if (!L.steps[idx]) continue;
    const tt = t + (idx % 2 ? n01(L.p.swing) * sw : 0);
    trigger(e, L, idx, tt, g, sd);
  }
}
function startLoops(e, t, until, off) { S.layers.forEach(L => { if (L.kind === 'audio' && L.mode === 'loop' && audible(L) && BUF.get(L.file)) loopStart(e, L, t, BUF.get(L.file), until, off); }); }

let ctx = null, eng = null;
function ensure(quiet) {
  /* iPhone: web sound normally follows the silent switch; asking for "playback" lets it play like music does */
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {}
  if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC({ latencyHint: 'interactive' }); eng = makeEngine(ctx, true); }
  if (!quiet && ctx.state !== 'running') ctx.resume();
  return eng;
}
/* the first touch on the page wakes the sound (iOS only starts audio inside a tap): resume and play one silent sample */
(function unlock() {
  const go = () => { try { ensure(false); const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0); } catch (e) {}
    if (ctx && ctx.state === 'running') ['touchend', 'pointerup', 'keydown'].forEach(k => removeEventListener(k, go, true)); };
  ['touchend', 'pointerup', 'keydown'].forEach(k => addEventListener(k, go, true));
})();

/* ---------------- sequencer ---------------- */
const SEQ = { playing: false, g: 0, next: 0, timer: 0, queue: [], listeners: new Set(), meas: [], rec: null };
function click(t, accent) { const c = ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.value = accent ? 2000 : 1400; env(g.gain, t, accent ? 0.9 : 0.55, 0.001, 0.05); o.connect(g); g.connect(eng.metro); o.start(t); o.stop(t + 0.08); }
function tick() {
  const end = Math.min(S.end, totalSteps()), start = Math.min(S.start, end - 1);
  while (SEQ.next < ctx.currentTime + 0.12) {
    const sd = stepDur(), g = SEQ.g;
    if (g === start) { const span = (end - start) * sd; fades(eng, SEQ.next, span); startLoops(eng, SEQ.next, SEQ.next + span); }
    pieceShape(eng, g, SEQ.next, sd, SEQ.jump); SEQ.jump = false;
    step(eng, g, SEQ.next, sd);
    if ((S.metro || SEQ.countIn) && g % 4 === 0) click(SEQ.next, g % 16 === 0);
    SEQ.queue.push({ g, t: SEQ.next }); SEQ.next += sd; SEQ.g = g + 1 >= end ? start : g + 1;
  }
}
async function play(from) {
  ensure();
  await Promise.all(S.layers.filter(L => L.kind === 'audio' && fileById(L.file)).map(L => bufferFor(L.file).catch(() => null)));
  if (SEQ.playing) return;
  levels(eng); applyAll(eng); eng.eo.delayTime.value = stepDur() * 3;
  SEQ.playing = true; SEQ.g = Math.min(S.start, S.end - 1); SEQ.next = ctx.currentTime + 0.08; SEQ.queue.length = 0; SEQ.jump = true;
  if (from != null && from > SEQ.g) { seek(from, true); }
  tick(); SEQ.timer = setInterval(tick, 25); emit('play');
  requestAnimationFrame(frame);
}
/* jump the playhead to step g (play from here, skim) */
function seek(g, quiet) {
  if (!SEQ.playing || !eng) return;
  const end = Math.min(S.end, totalSteps()), start = Math.min(S.start, end - 1); g = clamp(Math.round(g), start, end - 1);
  const sd = stepDur(), t = ctx.currentTime + 0.03, off = (g - start) * sd, span = (end - start) * sd;
  [...eng.loops.keys()].forEach(id => loopStop(eng, id, t));
  fades(eng, t - off, span); startLoops(eng, t, t + span - off, off);
  SEQ.g = g; SEQ.next = t; SEQ.queue.length = 0; SEQ.jump = true; if (!quiet) tick();
}
function stop() {
  if (!SEQ.playing) return; SEQ.playing = false; clearInterval(SEQ.timer); SEQ.queue.length = 0; if (eng) shapeOff(eng);
  if (eng) { [...eng.loops.keys()].forEach(id => loopStop(eng, id)); eng.ch.forEach(k => { k.fade.gain.cancelScheduledValues(ctx.currentTime); k.fade.gain.setTargetAtTime(1, ctx.currentTime, 0.02); }); }
  if (SEQ.rec) SEQ.rec.cancel();
  SEQ.cur = -1; emit('step', -1); emit('stop');
}
const lvl = new Float32Array(1024);
function frame() {
  if (!SEQ.playing) return;
  let g = null; while (SEQ.queue.length && SEQ.queue[0].t <= ctx.currentTime) g = SEQ.queue.shift().g;
  if (g !== null && g !== SEQ.cur) {
    SEQ.cur = g;
    eng.an.getFloatTimeDomainData(lvl); let s = 0; for (let i = 0; i < lvl.length; i++) s += lvl[i] * lvl[i]; SEQ.meas[g] = Math.sqrt(s / lvl.length);
    emit('step', g);
  }
  // movement on audio loops follows the playhead
  S.layers.forEach(L => { if (L.kind === 'audio' && L.auto) { const s = eng.loops.get(L.id); if (s) s.playbackRate.setTargetAtTime(rate(L) * Math.pow(2, autoAt(L, (SEQ.cur || 0) / totalSteps()) / 12), ctx.currentTime, 0.05); } });
  emit('frame'); requestAnimationFrame(frame);
}
function emit(type, d) { SEQ.listeners.forEach(f => { try { f(type, d); } catch (e) { console.error(e); } }); }
function restartLoop(L) { if (!SEQ.playing || !eng) return; loopStop(eng, L.id); if (L.kind === 'audio' && L.mode === 'loop' && audible(L) && BUF.get(L.file)) loopStart(eng, L, ctx.currentTime + 0.03, BUF.get(L.file)); }
function audition(L, idx) {
  if (SEQ.playing || !L || L.hidden) return; const e = ensure(); applyAll(e); const k = chain(e, L); k.fade.gain.value = 1;
  const i = idx ?? Math.max(0, L.steps.indexOf(true));
  if (L.kind === 'synth') trigger(e, L, i, ctx.currentTime + 0.02, 0, stepDur());
  else bufferFor(L.file).then(b => oneShot(e, L, ctx.currentTime + 0.02, b)).catch(() => {});
}
function nextBarTime() { // time of the next bar start while playing
  const sd = stepDur(); let g = SEQ.g, t = SEQ.next; while (g % 16 !== 0) { t += sd; g = g + 1 >= S.end ? S.start : g + 1; } return { t, g };
}

/* ---------------- live mix sessions: record everything you hear ---------------- */
const SESS = { mr: null, t0: 0, dest: null, chunks: [] };
async function sessionStart() {
  if (SESS.mr) return; ensure(); if (!window.MediaRecorder) throw new Error('Recording isn’t supported in this browser.');
  if (!LIB.ok) throw new Error('Saving sessions needs browser storage, which is turned off here.');
  const dest = ctx.createMediaStreamDestination(); eng.an.connect(dest);
  const type = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
  const mr = new MediaRecorder(dest.stream, type ? { mimeType: type, audioBitsPerSecond: 160000 } : undefined);
  SESS.chunks = []; mr.ondataavailable = ev => ev.data && ev.data.size && SESS.chunks.push(ev.data);
  mr.start(1000); Object.assign(SESS, { mr, dest, t0: Date.now(), bpm: S.bpm });
  if (!SEQ.playing) await play();
  emit('session');
}
function sessionStop() {
  const { mr, dest } = SESS; if (!mr) return Promise.resolve(null);
  return new Promise(ok => {
    mr.onstop = async () => {
      try { eng.an.disconnect(dest); } catch (e) {}
      SESS.mr = null; emit('session');
      const n = LIB.files.filter(f => f.origin === 'session').length + 1, blob = new Blob(SESS.chunks, { type: mr.mimeType || 'audio/webm' }); SESS.chunks = [];
      try { const rec = await addBlobFile(blob, `Session ${n}`, 'session'); rec.bpm = SESS.bpm; DB.put('files', rec).catch(() => {}); ok(rec); } catch (e) { ok({ error: e.message || 'Couldn’t save the session.' }); }
    };
    try { mr.requestData(); mr.stop(); } catch (e) { SESS.mr = null; ok(null); }
  });
}

/* ---------------- export ---------------- */
/* one hit of a synth layer, rendered offline: for the selected sound's picture */
function renderHit(L, secs = 1.2) {
  const sr = 22050, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OAC(1, Math.floor(sr * secs), sr), e = makeEngine(oc, false);
  const k = chain(e, { ...L, rev: 0, echo: 0, fadeIn: 0, fadeOut: 0, depth: 0, around: 50, mute: false, solo: false, hidden: false }); k.fade.gain.value = 1;
  const i = Math.max(0, L.steps.indexOf(true)); trigger(e, { ...L, auto: null }, i, 0.01, 0, stepDur()); return oc.startRendering();
}
/* play a layer that isn't in the mix yet, once through */
function previewOnce(L) {
  const e = ensure(); const k = chain(e, L); k.fade.gain.value = 1; apply(e, L); const sd = stepDur(), t0 = ctx.currentTime + 0.05;
  for (let i = 0; i < L.steps.length; i++) if (L.steps[i]) trigger(e, L, i, t0 + i * sd, i, sd);
  setTimeout(() => dropChain(e, L.id), (L.steps.length * sd + 3) * 1000);
}
async function renderPiece() {
  const sd = stepDur(), start = S.start, end = Math.min(S.end, totalSteps()), span = (end - start) * sd;
  for (const L of S.layers) if (L.kind === 'audio' && fileById(L.file)) { try { await bufferFor(L.file); } catch (e) {} }
  const sr = 44100, OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext, oc = new OAC(2, Math.ceil(sr * (span + 2.5)), sr), e = makeEngine(oc, false);
  S.layers.forEach(L => chain(e, L)); fades(e, 0.02, span); startLoops(e, 0.02, 0.02 + span);
  for (let g = start; g < end; g++) { pieceShape(e, g, 0.02 + (g - start) * sd, sd, g === start); step(e, g, 0.02 + (g - start) * sd, sd); }
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
const loadLame = () => lameP || (lameP = new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js'; s.onload = () => window.lamejs ? ok(window.lamejs) : no(new Error('mp3')); s.onerror = () => { lameP = null; no(new Error('mp3')); }; document.head.appendChild(s); }));
async function mp3(buf, kbps = 192) {
  const lame = await loadLame(), toI = d => { const r = new Int16Array(d.length); for (let i = 0; i < d.length; i++) { const s = clamp(d[i], -1, 1); r[i] = s < 0 ? s * 0x8000 : s * 0x7fff; } return r; };
  const ch = Math.min(2, buf.numberOfChannels), L = toI(buf.getChannelData(0)), R = ch > 1 ? toI(buf.getChannelData(1)) : null, enc = new lame.Mp3Encoder(ch, buf.sampleRate, kbps), parts = [];
  for (let i = 0; i < L.length; i += 1152) { const d = R ? enc.encodeBuffer(L.subarray(i, i + 1152), R.subarray(i, i + 1152)) : enc.encodeBuffer(L.subarray(i, i + 1152)); if (d.length) parts.push(new Int8Array(d)); }
  const f = enc.flush(); if (f.length) parts.push(new Int8Array(f));
  return new Blob(parts, { type: 'audio/mpeg' });
}

/* ---------------- library: audio and video ---------------- */
const MAX_AUDIO = 40 * 1048576, MAX_VIDEO = 250 * 1048576, MAX_ALL = 200 * 1048576;
const usedBytes = () => LIB.files.reduce((a, f) => a + f.size, 0);
const isVideo = f => /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(f.name);
async function addFile(f, msg) {
  if (!LIB.ok) throw new Error('Uploads need browser storage, which is turned off here.');
  const video = isVideo(f);
  if (f.size > (video ? MAX_VIDEO : MAX_AUDIO)) throw new Error(`${f.name} is too large (${video ? '250' : '40'} MB max).`);
  ensure(true); try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) {}
  msg && msg(video ? `Pulling the sound out of ${f.name}…` : `Reading ${f.name}…`);
  let data = await f.arrayBuffer(), b;
  try { b = await ctx.decodeAudioData(data.slice(0)); } catch (e) { throw new Error(video ? `Couldn’t find a soundtrack in ${f.name}. Try an MP4, MOV or WEBM with audio.` : `Couldn’t read ${f.name}. Try MP3, WAV or M4A.`); }
  let type = (f.name.split('.').pop() || '').toUpperCase().slice(0, 4), from = null;
  if (video) { // keep only the sound, as an MP3 (WAV if the encoder can’t load)
    from = type; try { const blob = await mp3(b, 160); data = await blob.arrayBuffer(); type = 'MP3'; } catch (e) { const blob = wav(b); data = await blob.arrayBuffer(); type = 'WAV'; }
  }
  if (usedBytes() + data.byteLength > MAX_ALL) throw new Error('The library is full (200 MB). Remove a file to add more.');
  const rec = { id: uid(), name: f.name, size: data.byteLength, type, from, dur: b.duration, peaks: peaksOf(b), added: Date.now() };
  await DB.put('blobs', { id: rec.id, data }); await DB.put('files', rec); LIB.files.push(rec); BUF.set(rec.id, b);
  return rec;
}
async function addBlobFile(blob, name, origin) {
  const data = await blob.arrayBuffer(); ensure(true);
  if (usedBytes() + data.byteLength > MAX_ALL) throw new Error('The library is full (200 MB). Remove a file to make room.');
  const b = await ctx.decodeAudioData(data.slice(0));
  const rec = { id: uid(), name, size: data.byteLength, type: origin === 'rec' ? 'REC' : origin === 'session' ? 'LIVE' : 'AUD', origin, dur: b.duration, peaks: peaksOf(b), added: Date.now() };
  await DB.put('blobs', { id: rec.id, data }); await DB.put('files', rec); LIB.files.push(rec); BUF.set(rec.id, b); return rec;
}
async function removeFile(id) { try { await DB.del('files', id); await DB.del('blobs', id); } catch (e) {} LIB.files = LIB.files.filter(f => f.id !== id); BUF.delete(id); }
function audioLayer(f, o = {}) {
  const n = S.layers.filter(L => L.kind === 'audio').length;
  return fixLayer(Object.assign({ id: uid(), kind: 'audio', file: f.id, name: f.name, color: f.origin === 'rec' ? VOICEC[n % VOICEC.length] : AUDC[n % AUDC.length], origin: f.origin || null,
    mode: f.dur > stepDur() * 4 ? 'loop' : 'steps', steps: Array.from({ length: 16 }, (_, i) => i === 0 || i === 8), trim: [0, 1], p: { pitch: 50, tone: 100 }, vol: 75, open: true }, o));
}
async function saveMix(name) {
  const id = S.cur && LIB.mixes.find(m => m.id === S.cur && m.name === name) ? S.cur : uid();
  const rec = { id, v: 2, name: name || `Mix ${LIB.mixes.length + 1}`, saved: Date.now(), bpm: S.bpm, n: S.layers.length, bars: S.bars, state: JSON.parse(JSON.stringify(Object.assign({}, S, { cur: id }))) };
  await DB.put('mixes', rec); LIB.mixes = [rec, ...LIB.mixes.filter(m => m.id !== id)]; S.cur = id; save(); return rec;
}
function openMix(id) {
  const m = LIB.mixes.find(x => x.id === id); if (!m) return false;
  let st = m.state; if (!st) return false; if (!st.v) st = migrate1(st); if (!valid(st)) return false;
  const was = SEQ.playing; stop(); S = Object.assign(fresh(), JSON.parse(JSON.stringify(st)), { cur: id, win: S.win }); S.layers.forEach(fixLayer);
  if (eng) { eng.ch.forEach((k, lid) => dropChain(eng, lid)); levels(eng); }
  save(); if (was) play(); return true;
}
async function removeMix(id) { try { await DB.del('mixes', id); } catch (e) {} LIB.mixes = LIB.mixes.filter(m => m.id !== id); if (S.cur === id) S.cur = null; save(); }

/* ---------------- voice: loop recorder and hum-to-melody ---------------- */
let micP = null;
async function mic() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('This browser can’t use a microphone here.');
  if (!micP) micP = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } }).catch(e => { micP = null; throw new Error('Microphone access was not allowed.'); });
  return micP;
}
function autocorr(buf, sr) {
  let rms = 0; for (let i = 0; i < buf.length; i++) rms += buf[i] * buf[i]; rms = Math.sqrt(rms / buf.length);
  if (rms < 0.012) return { f: 0, rms };
  const n = buf.length, minL = Math.floor(sr / 1000), maxL = Math.floor(sr / 75); let best = -1, bestL = 0, prev = 1;
  for (let L = minL; L <= maxL; L++) { let s = 0; for (let i = 0; i < n - L; i++) s += buf[i] * buf[i + L]; s /= (n - L); if (s > best) { best = s; bestL = L; } prev = s; }
  if (best < rms * rms * 0.3) return { f: 0, rms };
  let zc = 0; for (let i = 1; i < n; i++) if ((buf[i - 1] < 0) !== (buf[i] < 0)) zc++;
  return { f: sr / bestL, rms, zcr: zc / n };
}
/* record `bars` bars, starting on the next bar after a one-bar count-in. kind: 'loop' | 'hum' */
async function record(kind, bars, cb) {
  const stream = await mic(); ensure();
  if (!SEQ.playing) await play();
  const src = ctx.createMediaStreamSource(stream), an = ctx.createAnalyser(); an.fftSize = 2048; src.connect(an);
  const sd = stepDur(); let { t: t0 } = nextBarTime(); if (t0 - ctx.currentTime < 0.3) t0 += sd * 16; // count-in bar
  const tStart = t0 + sd * 16, tEnd = tStart + bars * 16 * sd;
  SEQ.countIn = true; let cancelled = false, mr = null, chunks = [];
  const pitches = [], buf = new Float32Array(an.fftSize);
  const state = { kind, bars, tStart, tEnd, phase: 'count', level: 0 };
  SEQ.rec = { cancel() { cancelled = true; try { mr && mr.state !== 'inactive' && mr.stop(); } catch (e) {} done(); } };
  const done = () => { SEQ.countIn = false; SEQ.rec = null; clearInterval(iv); try { src.disconnect(); } catch (e) {} };
  if (kind === 'loop' && window.MediaRecorder) {
    mr = new MediaRecorder(stream); mr.ondataavailable = ev => ev.data && ev.data.size && chunks.push(ev.data);
    setTimeout(() => { if (!cancelled) try { mr.start(); } catch (e) {} }, Math.max(0, (tStart - ctx.currentTime) * 1000 - 40));
  }
  const iv = setInterval(() => {
    const now = ctx.currentTime; an.getFloatTimeDomainData(buf); const r = autocorr(buf, ctx.sampleRate); state.level = Math.min(1, r.rms * 6);
    state.phase = now < tStart ? 'count' : now < tEnd ? 'rec' : 'done';
    if (state.phase === 'rec') { const st = Math.floor((now - tStart) / sd); (pitches[st] = pitches[st] || []).push(r); state.step = st; }
    cb && cb(state);
    if (now >= tEnd + 0.15 && !cancelled) {
      clearInterval(iv); SEQ.countIn = false;
      if (kind === 'loop') {
        if (!mr) { done(); cb && cb(Object.assign(state, { phase: 'error', error: 'Recording isn’t supported in this browser.' })); return; }
        mr.onstop = async () => {
          done();
          try {
            const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' }), raw = await blob.arrayBuffer(), dec = await ctx.decodeAudioData(raw.slice(0));
            const want = Math.floor(bars * 16 * sd * dec.sampleRate), out = ctx.createBuffer(dec.numberOfChannels, Math.min(want, dec.length), dec.sampleRate);
            for (let c = 0; c < dec.numberOfChannels; c++) out.copyToChannel(dec.getChannelData(c).subarray(0, out.length), c);
            const takes = LIB.files.filter(f => f.origin === 'rec').length + 1;
            const rec = await addBlobFile(wav(out), `Voice take ${takes}`, 'rec');
            cb && cb(Object.assign(state, { phase: 'saved', file: rec }));
          } catch (e) { cb && cb(Object.assign(state, { phase: 'error', error: 'Couldn’t save the recording.' })); }
        };
        try { mr.stop(); } catch (e) { done(); }
      } else { done(); cb && cb(Object.assign(state, { phase: 'saved', hum: analyseHum(pitches, bars * 16) })); }
    }
  }, 16);
  return state;
}
const NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function analyseHum(pitches, n) {
  const per = Array.from({ length: n }, (_, i) => {
    const xs = (pitches[i] || []).filter(r => r.f > 0); const loud = (pitches[i] || []).reduce((a, r) => Math.max(a, r.rms), 0);
    if (!xs.length) return { m: null, loud, zcr: 0 };
    const ms = xs.map(r => 69 + 12 * Math.log2(r.f / 440)).sort((a, b) => a - b); return { m: ms[Math.floor(ms.length / 2)], loud, zcr: xs.reduce((a, r) => a + (r.zcr || 0), 0) / xs.length };
  });
  const voiced = per.filter(x => x.m !== null).map(x => x.m).sort((a, b) => a - b);
  const root = voiced.length ? Math.round(voiced[0]) : 60;
  const snap = s => { const o = Math.floor(s / 12) * 12, r = ((s % 12) + 12) % 12; const best = [0, 2, 3, 5, 7, 8, 10, 12].reduce((a, b) => Math.abs(b - r) < Math.abs(a - r) ? b : a, 0); return o + best; };
  const steps = [], notes = [], heard = []; let prev = null;
  per.forEach((x, i) => {
    if (x.m === null) { steps.push(false); notes.push(prev ?? 0); prev = null; return; }
    const s = snap(Math.round(x.m - root)), on = prev === null || s !== prev; steps.push(on); notes.push(s); if (on) heard.push(NOTE[((Math.round(root + s) % 12) + 12) % 12]); prev = s;
  });
  // beats: onsets by loudness jumps; low/dull = kick, bright = snare
  const kick = [], snare = []; let last = 0;
  per.forEach((x, i) => { const on = x.loud > 0.03 && x.loud > last * 1.6; kick.push(on && (x.zcr || 0) < 0.08); snare.push(on && (x.zcr || 0) >= 0.08); last = x.loud; });
  return { steps, notes, heard: heard.slice(0, 16), voiced: voiced.length, kick, snare, len: n };
}
function melodyLayer(voice, steps, notes, origin, label) {
  const L = synthLayer(voice, { origin, label, open: true }), n = Math.max(16, Math.ceil(steps.length / 16) * 16);
  L.steps = Array.from({ length: n }, (_, i) => !!steps[i]); L.notes = Array.from({ length: n }, (_, i) => notes[i] || 0); L.vel = Array(n).fill(0.85);
  if (!L.steps.some(Boolean)) L.steps[0] = true;
  return L;
}
/* move a melody: a drawn path (0..1 across, -1..1 up/down) becomes notes on a scale */
function pathToMelody(path, n) {
  const steps = [], notes = []; let prev = null; const scale = [-12, -9, -7, -5, -2, 0, 3, 5, 7, 10, 12];
  for (let i = 0; i < n; i++) {
    const pts = path.filter(p => Math.floor(p.x * n) === i); if (!pts.length) { steps.push(false); notes.push(prev ?? 0); continue; }
    const y = pts.reduce((a, p) => a + p.y, 0) / pts.length, s = scale[Math.round((y + 1) / 2 * (scale.length - 1))];
    steps.push(prev === null || s !== prev); notes.push(s); prev = s;
  }
  return { steps, notes };
}

window.AUDX = {
  V, VOICE_ORDER, GROUPS, BASE, SOUNDS, AUDC, get S() { return S; }, set S(v) { S = v; }, save, load, fresh, synthLayer, audioLayer, melodyLayer, fixLayer, sortLayers,
  byId, groupOf, colorOf, nameOf, shortOf, stepDur, totalSteps, LIB, BUF, fileById, loadLibrary, bufferFor, addFile, removeFile, saveMix, openMix, removeMix,
  ensure, get eng() { return eng; }, get ctx() { return ctx; }, chain, apply, applyAll, levels, setRoom, dropChain, SEQ, play, stop, restartLoop, audition, loopStop,
  renderPiece, renderHit, previewOnce, seek, shapeAt, fadeLens, FADE_IN, FADE_OUT, SESS, sessionStart, sessionStop, wav, mp3, record, pathToMelody, autoAt, audible, mic, n01, clamp, uid, isVideo, usedBytes, MAX_ALL
};
})();
