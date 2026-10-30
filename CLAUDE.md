# ADVL site — working notes

Portfolio of Ariana Dorothea Levy. Static site served by a Cloudflare Worker (static assets, see `wrangler.jsonc`) from `public/`; live at https://advl.studio (also advl-site.arianadorothealevy.workers.dev). Every push to `main` should redeploy (Workers Builds).

## Layout
- `public/` — exactly what is served. Edit these files directly.
  - `index.html` — the whole page shell + CSS (desktop rules live under `@media (min-width:1024px)`).
  - `core.js` routing, pages, cinematic player, Parking Lot UI · `lot.js` desktop Parking Lot physics · `room.js` Artifacts room · `viewer.js` 3D viewer (three.js from jsDelivr) · `home3d.js`, `mini.js`, `type.js`.
  - `data.json` — all project/page content. `artifacts.json` — Artifacts room. A project may carry `mblocks`: a phone-only block list (≤1023px) used instead of `blocks`; desktop keeps `blocks`. Block types include `mosaic` (moving generations tiled) and `pair` (generated image beside the CAD it became).
  - `config.js` — Parking Lot store (Supabase project URL + public anon key).
  - `v/hq/*.mp4` — full-quality films (split parts play back to back).
- `tools/` — build scripts from the original workspace (`build_data.py` generated `data.json`; it depends on source media that is not in this repo, so for content changes edit `public/data.json` directly). `supabase_parking_lot.sql` creates the message table. `tools/artifact/index.html` is the claude.ai preview version of the page.

## Parking Lot
Supabase table `lot_messages` (id, created_at, name, body, author_token). Visitors post without signing in and can delete only their own messages (RPC `delete_own_message`). Ariana moderates in Supabase > Table Editor.

## Standing rules
- Show mockups / wireframes and get approval before changing a page's design. One page at a time.
- Always ask Ariana for approval before taking actions (changes, pushes, anything outside the conversation).
- Desktop (≥1024px) is the designed format; keep mobile working but unchanged unless asked.
- Never use files from the Physical Intelligence folder on the site. Keep cover letters off the site.
- Never mention the skip gesture on the site.
- Charts: blue schema (sky gradient #8DB6E6 → #7DAAE0 → #6B97D3), white marks, chartreuse corner marks; chartreuse allowed for the selected item.
- Artifacts page: not being changed.
- Transitions stay smooth and slow, matching the rest of the site (fades ~0.9–2.4s).
- Cloudflare Pages limit: 25 MiB per file.

## Open items (as of 2026-10-29)
0. Project pages, in order, each through mockups → approval. 01 Learning Bodies: phone layout live 10/29 (mosaic of the 8 motion studies at top, Generative AI and CAD section with side-by-side callouts, new order). Desktop for 01 not yet approved: Ariana said push mobile only. Stardrum / cybernetic images could become callouts once she says which are generated vs modeled.
1. Mobile: bring the Parking Lot and About pages in line with the new desktop versions (Ariana reviewed mobile on 10/27), plus general mobile tweaks. Show mockups first.
2. Link preview image (`public/img/og.jpg`, referenced as `og.jpg?v=2`): replaced 10/30 with the Chartreuse "Parking Lot" card (Ariana chose it "for now"). Blurred Green anchor background, Syne 800 name in a glowing chartreuse box with a Visit pill, bush and door with a fading ground line, advl.studio top right. Other palettes (Ultraviolet, Bloom, Ice) are in `tools/mockups/og_lot/` in case she switches; bump `?v=` when replacing.
3. Missing media: 06 and 15 images and films, 08 source files, About featured image.
4. Headers: 06, 12, 13, 14, 15 use their stair treads on the Projects card; 10 keeps its first gallery image (decided 10/27).

## Related claude.ai pages
- Original site preview (private): https://claude.ai/artifact/QRuZkZSmwXp2eQUnHmweLe
- Domain advl.studio is registered and active on Cloudflare; Supabase project kytehsjeyzaqfobqyuhx.
