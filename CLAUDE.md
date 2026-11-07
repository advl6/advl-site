# ADVL site — working notes

Portfolio of Ariana Dorothea Levy. Static site served by a Cloudflare Worker (static assets, see `wrangler.jsonc`) from `public/`; live at https://advl.studio (also advl-site.arianadorothealevy.workers.dev). Every push to `main` should redeploy (Workers Builds).

## Layout
- `public/` — exactly what is served. Edit these files directly.
  - `index.html` — the whole page shell + CSS (desktop rules live under `@media (min-width:1024px)`).
  - `core.js` routing, pages, cinematic player, Parking Lot UI · `lot.js` desktop Parking Lot physics · `room.js` Artifacts room · `viewer.js` 3D viewer (three.js from jsDelivr) · `home3d.js`, `mini.js`, `type.js`.
  - `data.json` — all project/page content. `artifacts.json` — Artifacts room. A project may carry `mblocks`: a phone-only block list (≤1023px) used instead of `blocks`; desktop keeps `blocks`. Block types include `mosaic` (moving generations tiled) and `pair` (generated image beside the CAD it became).
  - `auditory-core.js` + `auditory.js` + `auditory.css` — advl auditory v2 (project 18, block type `auditory`, live 11/6). core.js (`audSync`) loads auditory.js only on that page, which loads auditory-core.js (sound engine, 17 instruments incl. drum kit, theremin, handpan… each with sound styles + presets, sequencer, metronome, fades, depth/around (HRTF), reverb/echo, IndexedDB library + mixes, voice loop recording, hum-to-melody, movement-to-melody, WAV/MP3 export). auditory.js is the interface: Casual/Complex dial. Casual = Stage (transport, whole-piece visualizer with START/END markers + Length/Extend, grouped layers with chartreuse dash: tap hides, drag reorders within group; voice/hands panel; selected-layer card; Library + Mixes). Complex = Console (arrangement lanes per bar, movement automation lane, mixer strips + Master, Sound engine inspector, movement pad, sound card with per-step strength/notes). Phones: casual is lighter (3 buttons open bottom sheets, Expand pop-up), complex uses short codes (KCK, SNR…) with sideways-scrolling arrangement and strips. Added 11/6 (desktop): click the whole piece to play from there, drag to skim; whole-piece fade in/out with draggable frames, type dropdowns (in: Linear, Smooth, Exponential, Slow start, Filter open, Swell; out: … Filter close, Echo out, Tape stop) and length sliders, applied in playback and exports (engine `pieceShape`); "Start recording live mix session" records the master output to the Library's Live sessions (origin `session`; Play / WAV / + Layer); every box is a window with a top-center chartreuse handle: first drag freezes the layout into free positions (`S.win[mode]`, x/w as fractions, y px), resize corner, Reset layout in the transport. Phones keep the old look (those controls hidden). State in localStorage `advl-aud-v2` (migrates v1). Page sits free on its background via `#view:has(.aud)` rules.
  - `mnav.js` — phone navigation (≤720px, live 11/4): faint `goto('<level>')` line under the name opens a code drop-down under it; thumb circle bottom right (slowly crossfades the 16 curated backgrounds, `img/lotbg/t/`, ~20 s each, 6 s fade) opens the levels fanned up above it. Both blur the page while open; the old bottom bar `#levels` is hidden on phones. Phone home shows the stair cascade of six project wireframes (`.mcasc`, in the home view).
  - Desktop nav (≥1024px, live 11/7): the phone's `goto('<level>')` line (mnav.js `.mgl`/`.mtop`) sits top left under the name; it opens `const levels = {…}` over a soft blur. The left level rail `#levels` is hidden on desktop except in cinematic mode; the Style button moved top right. 721–1023px is unchanged.
  - About, desktop (live 11/7, mockup B): `abDesk()` in index.html renders the page as one file pane, `about.md`, with a line-number gutter: lead, `// practice` `// roots` `// now` paragraphs, then `export { email, instagram, linkedin }`; side column holds the featured image and facts (mfa, ba, based, speaks). `cv.json` tab links to Background. `data.json` has `links` and `languages`; phones show both in the About slab.
  - Gallery blocks take `fit: true` to show images at their own proportions instead of square crops (used on 15).
  - `config.js` — Parking Lot store (Supabase project URL + public anon key).
  - `v/hq/*.mp4` — full-quality films (split parts play back to back).
- `tools/` — build scripts from the original workspace (`build_data.py` generated `data.json`; it depends on source media that is not in this repo, so for content changes edit `public/data.json` directly). `supabase_parking_lot.sql` creates the message table. `tools/artifact/index.html` is the claude.ai preview version of the page.

## Parking Lot
Supabase table `lot_messages` (id, created_at, name, body, author_token). Visitors post without signing in and can delete only their own messages (RPC `delete_own_message`). Ariana moderates in Supabase > Table Editor.

## Standing rules
- Show mockups / wireframes and get approval before changing a page's design. One page at a time.
- Always ask Ariana for approval before taking actions (changes, pushes, anything outside the conversation).
- Every change gets a dated entry in the Changelog of the project doc `claude/advl-project-context.md` (claude.ai Project "advl.studio website and repositories"; read it, add the line, write it back).
- Check-ins happen inside the working chat (send_later), never as scheduled tasks that open new chats.
- Desktop (≥1024px) is the designed format; keep mobile working but unchanged unless asked.
- Never use files from the Physical Intelligence folder on the site. Keep cover letters off the site.
- Never mention the skip gesture on the site.
- Charts: blue schema (sky gradient #8DB6E6 → #7DAAE0 → #6B97D3), white marks, chartreuse corner marks; chartreuse allowed for the selected item.
- Artifacts page: not being changed.
- Transitions stay smooth and slow, matching the rest of the site (fades ~0.9–2.4s).
- Cloudflare static assets limit: 25 MiB per file.
- Version history: whenever a page with a `ver` list is updated (now project 18, advl auditory), add a new entry at the top of `ver` on its `spec` block in data.json (`{v, d: 'Mon D, YYYY', n: plain-language notes}`). The details show only the newest; the History pill opens the full list over the same soft blur as the phone nav (core.js `verOpen`, styles `.ver`/`.verpop`/`.verveil` in index.html).

## Open items (as of 2026-11-07)
-1. advl auditory (project 18, v2.1 live 11/6): name kept (Ariana, 11/6). Year row kept, labeled "Created in" (details: Sound, Created in 2026, Version with a History pill). Category: Soundwork. Card wireframe `img/tread/18.webp` (3D beat grid). Decisions about this project were made in the claude.ai chat "DJ mixing software in C++"; check it before asking again.
0. Project pages, in order, each through mockups → approval. 01 Learning Bodies: phone layout live 10/29 (mosaic of the 8 motion studies at top, This Land This Water film right under the project details, Generative AI and CAD section with side-by-side callouts, new order). Desktop for 01 not yet approved: Ariana said push mobile only. Stardrum / cybernetic images could become callouts once she says which are generated vs modeled.
1. Mobile: bring the Parking Lot and About pages in line with the new desktop versions (Ariana reviewed mobile on 10/27), plus general mobile tweaks. Show mockups first.
2. Link preview image (`public/img/og.jpg`, referenced as `og.jpg?v=2`): replaced 10/30 with the Chartreuse "Parking Lot" card (Ariana chose it "for now"). Blurred Green anchor background, Syne 800 name in a glowing chartreuse box with a Visit pill, bush and door with a fading ground line, advl.studio top right. Other palettes (Ultraviolet, Bloom, Ice) are in `tools/mockups/og_lot/` in case she switches; bump `?v=` when replacing.
3. Missing media: 06 images and films, 15 film, 08 source files, About featured image.
4. Headers: 06, 12, 13, 14, 15 use their stair treads on the Projects card; 10 keeps its first gallery image (decided 10/27).
5. Old Squarespace site (arianadorothealevy.com) compared 11/7: what's not yet on the new site is listed in the project doc (done 11/7: social links, languages, 13 and 15 images. 08 inspiration boards and extra renders live 11/7. Charcoal drawings stay out; old About images (portrait, bio collage, spheres render) not used (Ariana, 11/7). Still open: other CV details, 05 weeks 1–2; 16 early renders waiting on branch `preview-08-16`).
6. Unused files: 54 files no page used (old background sets, This Land / Watermelon posters 2–4, extra Frost/Light images, `equip2/3`, 12 Learning Bodies stills) were removed 11/7 after Ariana saved a zip of them. They stay recoverable from git history (commit before the removal).

## Related claude.ai pages
- Full project context and history: the claude.ai Project "advl.studio website and repositories", doc `claude/advl-project-context.md`. It draws on three chats: "Building your own website" (the site), "Rhino 3DM installation" (3D models from `C:\Users\arian\Desktop\Portfolio\projs`, exports follow Rhino layer visibility, backups in `projs\backups`), and "DJ mixing software in C++" (advl auditory). Check those before asking Ariana about past decisions.
- ADVL Model Viewer: https://claude.ai/artifact/9ETgDGyAv58q48za24JkQc
- Original site preview (private): https://claude.ai/artifact/QRuZkZSmwXp2eQUnHmweLe
- Domain advl.studio is registered and active on Cloudflare; Supabase project kytehsjeyzaqfobqyuhx.
