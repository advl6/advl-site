/* ADVL style panel. Colour coding (the six chapter colours, --ch-*), ink (the colour of dark text:
   there is no black text) and type: three roles (display, text, technical) that every prototype reads as
   --f-disp, --f-text and --f-mono. Pairings are previewed in their own faces; fonts load from
   Google Fonts only when needed; the choice is remembered in this browser. */
(() => {
'use strict';
const SANS = 'ui-sans-serif,system-ui,sans-serif', SERIF = 'ui-serif,Georgia,serif', MONO = 'ui-monospace,Menlo,monospace';
// [name, Google Fonts spec, fallback]
const F = {
  disp: [
    ['Outfit', 'Outfit:wght@100..900', SANS],
    ['Hanken Grotesk', 'Hanken+Grotesk:wght@100..900', SANS],
    ['Bricolage Grotesque', 'Bricolage+Grotesque:opsz,wght@12..96,200..800', SANS],
    ['Space Grotesk', 'Space+Grotesk:wght@300..700', SANS],
    ['Darker Grotesque', 'Darker+Grotesque:wght@300..900', SANS],
    ['Syne', 'Syne:wght@400..800', SANS],
    ['Unbounded', 'Unbounded:wght@200..900', SANS],
    ['Michroma', 'Michroma', SANS],
    ['Instrument Serif', 'Instrument+Serif:ital@0;1', SERIF],
    ['Fraunces', 'Fraunces:opsz,wght@9..144,100..900', SERIF],
    ['Bodoni Moda', 'Bodoni+Moda:opsz,wght@6..96,400..900', SERIF],
    ['Young Serif', 'Young+Serif', SERIF],
    // organic and unusual
    ['Bagel Fat One', 'Bagel+Fat+One', SANS, .92],
    ['Ojuju', 'Ojuju:wght@200..800', SANS],
    ['Gluten', 'Gluten:wght@100..900', SANS],
    ['Kalnia', 'Kalnia:wght@100..700', SERIF],
    ['Shantell Sans', 'Shantell+Sans:wght@300..800', SANS],
    ['Moirai One', 'Moirai+One', SANS],
    ['Darumadrop One', 'Darumadrop+One', SANS],
    ['Climate Crisis', 'Climate+Crisis', SANS, .7],   // very wide: set smaller
    ['Gloock', 'Gloock', SERIF]
  ],
  text: [
    ['Outfit', 'Outfit:wght@100..900', SANS],
    ['Hanken Grotesk', 'Hanken+Grotesk:wght@100..900', SANS],
    ['Geist', 'Geist:wght@100..900', SANS],
    ['Inter Tight', 'Inter+Tight:wght@100..900', SANS],
    ['IBM Plex Sans', 'IBM+Plex+Sans:wght@300;400;500;600', SANS],
    ['Manrope', 'Manrope:wght@200..800', SANS],
    ['Figtree', 'Figtree:wght@300..900', SANS],
    ['Atkinson Hyperlegible', 'Atkinson+Hyperlegible:wght@400;700', SANS],
    ['Newsreader', 'Newsreader:opsz,wght@6..72,200..800', SERIF],
    ['Source Serif 4', 'Source+Serif+4:opsz,wght@8..60,200..900', SERIF],
    ['Fredoka', 'Fredoka:wght@300..700', SANS],
    ['Instrument Sans', 'Instrument+Sans:wght@400..700', SANS],
    ['Sour Gummy', 'Sour+Gummy:wght@100..900', SANS],
    ['Funnel Sans', 'Funnel+Sans:wght@300..800', SANS],
    ['Recursive', 'Recursive:wght@300..1000', SANS]
  ],
  mono: [
    ['Geist Mono', 'Geist+Mono:wght@100..900', MONO],
    ['JetBrains Mono', 'JetBrains+Mono:wght@100..800', MONO],
    ['IBM Plex Mono', 'IBM+Plex+Mono:wght@300;400;500', MONO],
    ['DM Mono', 'DM+Mono:wght@300;400;500', MONO],
    ['Martian Mono', 'Martian+Mono:wght@100..800', MONO],
    ['Space Mono', 'Space+Mono:wght@400;700', MONO],
    ['Fragment Mono', 'Fragment+Mono', MONO],
    ['Red Hat Mono', 'Red+Hat+Mono:wght@300..700', MONO],
    ['Doto', 'Doto:wght@700..900', MONO]   // only the heavy dots load, so small text stays legible
  ]
};
// [label, display, text, technical]; the first is whatever this prototype ships with
const PAIRS = [
  ['As designed', null],
  ['§', 'Organic & unusual'],
  ['Signature: Levy', ['Bricolage Grotesque', 'Geist', 'Geist Mono']],
  ['Bubble Bauhaus', ['Bagel Fat One', 'Fredoka', 'Doto']],
  ['Mycelium', ['Ojuju', 'Instrument Sans', 'DM Mono']],
  ['Agar', ['Gluten', 'Sour Gummy', 'Martian Mono']],
  ['Hothouse', ['Kalnia', 'Newsreader', 'Fragment Mono']],
  ['Sketchbook', ['Shantell Sans', 'Figtree', 'Space Mono']],
  ['Tendril', ['Moirai One', 'Manrope', 'Red Hat Mono']],
  ['Drip', ['Darumadrop One', 'Funnel Sans', 'JetBrains Mono']],
  ['Thaw', ['Climate Crisis', 'Inter Tight', 'Geist Mono']],
  ['Specimen jar', ['Gloock', 'Recursive', 'Fragment Mono']],
  ['§', 'Classic'],
  ['Specimen', ['Instrument Serif', 'Geist', 'Geist Mono']],
  ['Lab bench', ['Space Grotesk', 'IBM Plex Sans', 'IBM Plex Mono']],
  ['Field notes', ['Fraunces', 'Newsreader', 'DM Mono']],
  ['Signal', ['Michroma', 'Inter Tight', 'Martian Mono']],
  ['Soft machine', ['Unbounded', 'Figtree', 'Fragment Mono']],
  ['Gallery wall', ['Bodoni Moda', 'Manrope', 'Red Hat Mono']],
  ['Workshop', ['Bricolage Grotesque', 'Geist', 'JetBrains Mono']],
  ['Exhibit', ['Syne', 'Atkinson Hyperlegible', 'Space Mono']],
  ['Quiet print', ['Young Serif', 'Source Serif 4', 'IBM Plex Mono']],
  ['Narrow', ['Darker Grotesque', 'Hanken Grotesk', 'Geist Mono']]
];
const ROLE = { disp: '--f-disp', text: '--f-text', mono: '--f-mono' }, LABEL = { disp: 'Display', text: 'Text', mono: 'Technical' };
const root = document.documentElement, KEY = 'advl-type-v1', loaded = new Set();
const find = (r, n) => F[r].find(f => f[0] === n);
const stack = f => `"${f[0]}",${f[2]}`;
function load(f) {
  if (!f || loaded.has(f[1])) return; loaded.add(f[1]);
  const l = document.createElement('link'); l.rel = 'stylesheet';
  l.href = `https://fonts.googleapis.com/css2?family=${f[1]}&display=swap`; document.head.appendChild(l);
}
/* colour codings: [key, name, note, six colours home→lot, which of the six take white text] */
const CHROMA = [
  ['lb', 'Learning Bodies', 'the book\'s chapter colours', ['#C4E212', '#5056B8', '#A3D6E7', '#EF3A1F', '#F8D205', '#F774C0'], [1, 3]],
  ['uv', 'Chartreuse to ultraviolet', 'one spectrum, home to parking lot', ['#CFF002', '#15E681', '#1AC3B9', '#12A5CA', '#047BFA', '#6E2CF2'], [4, 5]],
  ['media', 'From the media', 'agar, watermelon, cobalt, moss, orchid, leather', ['#E0A43A', '#CE1724', '#215AAC', '#4F8A02', '#C74F9F', '#8F421E'], [1, 2, 3, 4, 5]]
];
const INKS = [['', 'Ultraviolet ink', '#2B1A72'], ['ox', 'Oxblood ink', '#5B1518']];
const KEYS = ['home', 'projects', 'background', 'about', 'artifacts', 'lot'];
const CD = root.dataset.chromaDefault || 'lb';   // the colour coding this prototype ships with
const BG = window.ADVL_BG || null;                // optional background sets (landing / home / projects)
let state = { disp: '', text: '', mono: '', chroma: '', ink: '', bg: '' };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) state = Object.assign(state, s); } catch (e) { /* storage unavailable */ }
function apply() {
  for (const r in ROLE) { const f = find(r, state[r]); if (f) { load(f); root.style.setProperty(ROLE[r], stack(f)); } else root.style.removeProperty(ROLE[r]); }
  const fd = find('disp', state.disp); if (fd && fd[3]) { root.style.setProperty('--disp-zoom', fd[3]); root.style.setProperty('--disp-zoom-s', (fd[3] < .8 ? fd[3] * .8 : fd[3]).toFixed(3)); } else { root.style.removeProperty('--disp-zoom'); root.style.removeProperty('--disp-zoom-s'); }
  if (state.chroma === CD) state.chroma = '';
  state.chroma ? root.dataset.chroma = state.chroma : delete root.dataset.chroma;
  const bgChanged = (root.dataset.bg || '') !== (state.bg || '');
  state.bg ? root.dataset.bg = state.bg : delete root.dataset.bg;
  if (bgChanged && apply.ready) dispatchEvent(new HashChangeEvent('hashchange'));
  state.ink ? root.dataset.ink = state.ink : delete root.dataset.ink;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
  sync();
}

const CSS = `
.tk{position:fixed;z-index:24;}
.tk.tk-inline{position:relative;z-index:30}
.tk{font:400 .7rem/1 var(--f-mono);color:var(--ink);transition:opacity .6s ease}
body:not([data-phase=ui]) .tk,body[data-route=landing] .tk,body.cine .tk{opacity:0;pointer-events:none}
.tk-btn{all:unset;cursor:pointer;display:flex;align-items:center;gap:8px;padding:7px 12px 7px 9px;border-radius:999px;border:1px solid var(--edge);
  background:var(--glass);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);letter-spacing:.08em;text-transform:uppercase;font:inherit;color:inherit}
.tk-btn b{font:400 .95rem/1 var(--f-disp);letter-spacing:0;text-transform:none;width:22px;height:22px;display:grid;place-items:center;border-radius:50%;border:1px solid var(--acc)}
.tk-btn:hover,.tk-btn[aria-expanded=true]{border-color:var(--acc)}
.tk-btn:focus-visible,.tk-panel :focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.tk-panel{position:absolute;width:min(360px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 120px));overflow:auto;overscroll-behavior:contain;padding:14px;border-radius:14px;
  border:1px solid var(--edge);background:var(--tk-bg,var(--glass));-webkit-backdrop-filter:blur(22px) saturate(1.2);backdrop-filter:blur(22px) saturate(1.2);box-shadow:0 18px 50px rgb(0 0 0/.18)}
.tk-panel[hidden]{display:none}
.tk[data-v=up] .tk-panel{bottom:calc(100% + 10px)}.tk[data-v=down] .tk-panel{top:calc(100% + 10px)}
.tk[data-h=left] .tk-panel{left:0}.tk[data-h=right] .tk-panel{right:0}
.tk-head{display:flex;justify-content:space-between;align-items:center;margin:0 0 10px;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.tk-x{all:unset;cursor:pointer;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;font:300 1.1rem/1 var(--f-mono)}
.tk-x:hover{background:var(--glass2)}
.tk-pairs{list-style:none;margin:0;padding:0;display:grid;gap:6px}
:is(h1,h2,h3,.big,.name,.lead,.no,.t){overflow-wrap:break-word;hyphens:auto}
:is(h1.big,.home .name,.band .no,.lband .no,.front-card .t,.toc .t){zoom:var(--disp-zoom,1)}
@media (max-width:560px){:is(h1.big,.home .name,.band .no,.lband .no,.front-card .t,.toc .t){zoom:var(--disp-zoom-s,1)}} /* wide faces never push a long word off screen */
.tk-sub{margin:8px 0 0;font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.tk-pair{all:unset;box-sizing:border-box;cursor:pointer;display:grid;gap:4px;width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--line)}
.tk-pair:hover{border-color:var(--edge);background:var(--glass2)}
.tk-pair[aria-pressed=true]{border-color:var(--acc);box-shadow:inset 3px 0 0 var(--acc)}
.tk-pair .d{font-size:1.45rem;line-height:1.05;letter-spacing:-.01em;font-weight:300}
.tk-pair .t{font-size:.86rem;line-height:1.35;opacity:.8;letter-spacing:0;text-transform:none}
.tk-pair .m{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6}
.tk-own{margin-top:12px;padding-top:12px;border-top:1px solid var(--line);display:grid;gap:8px}
.tk-own label{display:grid;grid-template-columns:5.6rem minmax(0,1fr);align-items:center;gap:8px;letter-spacing:.1em;text-transform:uppercase;color:var(--soft)}
.tk-own select{font:400 .8rem var(--f-mono);color:var(--ink);background:var(--glass2);border:1px solid var(--line);border-radius:8px;padding:6px 8px;min-width:0;width:100%}
.tk-own select option{color:#111;background:#fff}
.tk-note{margin:10px 0 0;color:var(--soft);letter-spacing:.04em;line-height:1.5}
.tk-sec{margin:0 0 14px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.tk-sec h3{margin:0 0 8px;font:inherit;letter-spacing:.14em;text-transform:uppercase;color:var(--soft)}
.tk-opts{list-style:none;margin:0;padding:0;display:grid;gap:6px}
.tk-opt{all:unset;box-sizing:border-box;cursor:pointer;display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:4px 12px;width:100%;padding:9px 12px;border-radius:10px;border:1px solid var(--line)}
.tk-opt:hover{border-color:var(--edge);background:var(--glass2)}
.tk-opt[aria-pressed=true]{border-color:var(--acc);box-shadow:inset 3px 0 0 var(--acc)}
.tk-opt .sw{display:flex;grid-row:span 2}.tk-opt .sw i{width:14px;height:28px;border-radius:3px;margin-right:2px}
.tk-bg .sw i{width:30px;height:30px;border-radius:4px;background:center/cover no-repeat;margin-right:3px}
.tk-bg .sw.many i{width:13px;height:30px;margin-right:2px;border-radius:3px}
.tk-opt .ink{width:28px;height:28px;border-radius:50%;grid-row:span 2}
.tk-opt b{font:400 .95rem/1.2 var(--f-text);letter-spacing:0;text-transform:none}
.tk-opt small{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;opacity:.65;line-height:1.3}
html[data-chroma=lb]{--ch-home:#C4E212;--ch-projects:#5056B8;--ch-background:#A3D6E7;--ch-about:#EF3A1F;--ch-artifacts:#F8D205;--ch-lot:#F774C0;--ch-home-on:var(--deep);--ch-projects-on:#fff;--ch-background-on:var(--deep);--ch-about-on:#fff;--ch-artifacts-on:var(--deep);--ch-lot-on:var(--deep)}
html[data-chroma=uv]{--ch-home:#CFF002;--ch-projects:#15E681;--ch-background:#1AC3B9;--ch-about:#12A5CA;--ch-artifacts:#047BFA;--ch-lot:#6E2CF2;--ch-home-on:var(--deep);--ch-projects-on:var(--deep);--ch-background-on:var(--deep);--ch-about-on:var(--deep);--ch-artifacts-on:#fff;--ch-lot-on:#fff}
html[data-chroma=media]{--ch-home:#E0A43A;--ch-projects:#CE1724;--ch-background:#215AAC;--ch-about:#4F8A02;--ch-artifacts:#C74F9F;--ch-lot:#8F421E;--ch-home-on:var(--deep);--ch-projects-on:#fff;--ch-background-on:#fff;--ch-about-on:#fff;--ch-artifacts-on:#fff;--ch-lot-on:#fff}
`;
if (!root.lang) root.lang = 'en'; // lets the browser hyphenate long words in headings
const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

const base = () => { const cs = getComputedStyle(root); return { disp: cs.getPropertyValue('--f-disp'), text: cs.getPropertyValue('--f-text'), mono: cs.getPropertyValue('--f-mono') }; };
const box = document.createElement('div'); box.className = 'tk'; box.dataset.v = 'up'; box.dataset.h = 'left';
const opts = r => `<option value="">As designed</option>` + F[r].map(f => `<option>${f[0]}</option>`).join('');
const hasChroma = !!getComputedStyle(root).getPropertyValue('--ch-home').trim();
box.innerHTML = `<button type="button" class="tk-btn" aria-expanded="false" aria-controls="tk-panel"><b aria-hidden="true">Aa</b>Style</button>
<div class="tk-panel" id="tk-panel" role="dialog" aria-label="Style" hidden>
  <div class="tk-head"><span>Style</span><button type="button" class="tk-x" aria-label="Close">&times;</button></div>
  ${hasChroma ? `<section class="tk-sec"><h3>Colour coding</h3><ul class="tk-opts">${CHROMA.map(c => `<li><button type="button" class="tk-opt" data-chroma="${c[0]}" aria-pressed="false">
    <span class="sw" aria-hidden="true">${c[3].map(x => `<i style="background:${x}"></i>`).join('')}</span><b>${c[1]}</b><small>${c[2]}</small></button></li>`).join('')}</ul></section>` : ''}
  ${BG ? `<section class="tk-sec"><h3>Backgrounds</h3><ul class="tk-opts">${BG.sets.map(b => `<li><button type="button" class="tk-opt tk-bg" data-bg="${b.key}" aria-pressed="false">
    <span class="sw${Object.keys(b.map).length > 3 ? ' many' : ''}" aria-hidden="true">${Object.keys(b.map).map(k => `<i style="background-image:url('${b.map[k]}')"></i>`).join('')}</span><b>${b.name}</b><small>${b.note}</small></button></li>`).join('')}</ul></section>` : ''}
  <section class="tk-sec"><h3>Ink</h3><ul class="tk-opts">${INKS.map(c => `<li><button type="button" class="tk-opt" data-ink="${c[0]}" aria-pressed="false">
    <span class="ink" aria-hidden="true" style="background:${c[2]}"></span><b style="color:${c[2]}">${c[1]}</b><small>replaces black text</small></button></li>`).join('')}</ul></section>
  <div class="tk-head"><span>Typefaces</span></div>
  <ul class="tk-pairs">${PAIRS.map((p, i) => p[0] === '§' ? `<li class="tk-sub">${p[1]}</li>` : `<li><button type="button" class="tk-pair" data-i="${i}" aria-pressed="false">
    <span class="d">Learning Bodies</span><span class="t">Multimedia industrial and graphic design</span><span class="m">${p[0]}${p[1] ? ' · ' + p[1].join(' / ') : ''}</span></button></li>`).join('')}</ul>
  <div class="tk-own">${Object.keys(ROLE).map(r => `<label>${LABEL[r]}<select data-r="${r}">${opts(r)}</select></label>`).join('')}</div>
  <p class="tk-note">Remembered in this browser.</p>
</div>`;
const btn = box.querySelector('.tk-btn'), panel = box.querySelector('.tk-panel');
const pairs = [...box.querySelectorAll('.tk-pair')], sels = [...box.querySelectorAll('.tk-own select')];
function sync() {
  const i = PAIRS.findIndex(p => p[0] === '§' ? false : p[1] ? p[1][0] === state.disp && p[1][1] === state.text && p[1][2] === state.mono : !state.disp && !state.text && !state.mono);
  pairs.forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
  sels.forEach(s => { s.value = state[s.dataset.r] || ''; });
  box.querySelectorAll('[data-chroma]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.chroma === (state.chroma || CD))));
  box.querySelectorAll('[data-bg]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.bg === (state.bg || ''))));
  box.querySelectorAll('[data-ink]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ink === state.ink)));
}
function preview() { // each pairing is shown in its own faces
  const b0 = base();
  pairs.forEach(b => { const p = PAIRS[+b.dataset.i][1], f = p ? [find('disp', p[0]), find('text', p[1]), find('mono', p[2])] : null;
    if (f) f.forEach(load);
    b.querySelector('.d').style.fontFamily = f ? stack(f[0]) : b0.disp; b.querySelector('.t').style.fontFamily = f ? stack(f[1]) : b0.text; b.querySelector('.m').style.fontFamily = f ? stack(f[2]) : b0.mono; });
}
function place() { const r = btn.getBoundingClientRect(); box.dataset.v = r.top > innerHeight / 2 ? 'up' : 'down'; box.dataset.h = r.left > innerWidth / 2 ? 'right' : 'left'; }
function toggle(open) { if (open) { place(); preview(); } panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); }
btn.addEventListener('click', () => toggle(panel.hidden));
box.querySelector('.tk-x').addEventListener('click', () => { toggle(false); btn.focus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { e.stopPropagation(); toggle(false); btn.focus(); } }, true);
document.addEventListener('pointerdown', e => { if (!panel.hidden && !box.contains(e.target)) toggle(false); });
pairs.forEach(b => b.addEventListener('click', () => { const p = PAIRS[+b.dataset.i][1] || ['', '', '']; Object.assign(state, { disp: p[0], text: p[1], mono: p[2] }); apply(); }));
box.querySelectorAll('[data-chroma]').forEach(b => b.addEventListener('click', () => { state.chroma = b.dataset.chroma === CD ? '' : b.dataset.chroma; apply(); }));
box.querySelectorAll('[data-bg]').forEach(b => b.addEventListener('click', () => { state.bg = b.dataset.bg; apply(); }));
box.querySelectorAll('[data-ink]').forEach(b => b.addEventListener('click', () => { state.ink = b.dataset.ink; apply(); }));
sels.forEach(s => s.addEventListener('change', () => { state[s.dataset.r] = s.value; apply(); }));
const slot = document.querySelector('[data-tk-slot]');
if (slot) { box.classList.add('tk-inline'); slot.appendChild(box); } else document.body.appendChild(box);
apply(); apply.ready = true;
})();
