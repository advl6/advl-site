# ADVL site — working notes

Portfolio of Ariana Dorothea Levy. Static site served by Cloudflare Pages from `public/` (build command: none, output directory: `public`). Every push to `main` redeploys.

## Layout
- `public/` — exactly what is served. Edit these files directly.
  - `index.html` — the whole page shell + CSS (desktop rules live under `@media (min-width:1024px)`).
  - `core.js` routing, pages, cinematic player, Parking Lot UI · `lot.js` desktop Parking Lot physics · `room.js` Artifacts room · `viewer.js` 3D viewer (three.js from jsDelivr) · `home3d.js`, `mini.js`, `type.js`.
  - `data.json` — all project/page content. `artifacts.json` — Artifacts room.
  - `config.js` — Parking Lot store (Supabase project URL + public anon key).
  - `v/hq/*.mp4` — full-quality films (split parts play back to back).
- `tools/` — build scripts from the original workspace (`build_data.py` generated `data.json`; it depends on source media that is not in this repo, so for content changes edit `public/data.json` directly). `supabase_parking_lot.sql` creates the message table. `tools/artifact/index.html` is the claude.ai preview version of the page.

## Parking Lot
Supabase table `lot_messages` (id, created_at, name, body, author_token). Visitors post without signing in and can delete only their own messages (RPC `delete_own_message`). Ariana moderates in Supabase > Table Editor.

## Standing rules
- Show mockups / wireframes and get approval before changing a page's design. One page at a time.
- Desktop (≥1024px) is the designed format; keep mobile working but unchanged unless asked.
- Never use files from the Physical Intelligence folder on the site. Keep cover letters off the site.
- Never mention the skip gesture on the site.
- Charts: blue schema (sky gradient #8DB6E6 → #7DAAE0 → #6B97D3), white marks, chartreuse corner marks; chartreuse allowed for the selected item.
- Artifacts page: not being changed.
- Transitions stay smooth and slow, matching the rest of the site (fades ~0.9–2.4s).
- Cloudflare Pages limit: 25 MiB per file.
