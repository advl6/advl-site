# ADVL site

Portfolio of Ariana Dorothea Levy, live at https://advl.studio.

The site is static: everything in `public/` is served as-is by a Cloudflare Worker (static assets, configured in `wrangler.jsonc`). Every push to `main` redeploys it through Workers Builds.

- `public/` — the served site (page shell, scripts, `data.json` content, images, films, 3D models).
- `tools/` — build scripts and notes from the original workspace; not deployed.
- `CLAUDE.md` — working notes, standing rules and open items.
