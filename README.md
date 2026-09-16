# personal-website

Personal website — a static page (HTML + CSS + vanilla ES modules).

## Project layout

```
web/                source — served as-is in development
  index.html
  404.html          branded not-found page
  styles.css
  js/               native ES modules (no bundler)
    main.js         composition root: wires the modules together
    i18n/           dictionary (data) + I18n (DOM application)
    player/         playlist · audio-engine · music-player · music-dock
  assets/           images + audio — NOT in git, hosted on Cloudflare R2 (see below)
scripts/
  dev-server.mjs    local dev server (no deps, no build step) — see Development
  publish-assets.mjs  hash web/assets/**, upload to R2, rewrite asset-manifest.json
build.mjs           minify + asset-manifest fingerprint rewrite (esbuild, no bundling)
wrangler.jsonc      Cloudflare Worker static-assets config (serves dist/)
asset-manifest.json generated map: logical asset path -> content-hashed name
dist/               build output — deployed to Cloudflare (git-ignored)
```

## Development

```bash
npm install        # one-time
npm run dev        # serve web/ at http://localhost:5173 — edit, refresh, done
npm test           # node:test — save format, patcher, i18n key integrity
```

`npm run dev` serves the **source** in `web/` directly. There is no build step
in the loop: the JS is native ES modules and the CSS is plain CSS, so a refresh
is the whole cycle. Add `--port 8080` (or `PORT=8080`) to move it; if the port
is taken it steps to the next free one.

It also **serves images and audio from your local `web/assets/`**, rewriting
`cdn.ericktakeshi.com.br/assets/…` URLs (logical *and* fingerprinted) to a local
`/assets/` route. That is not just a convenience: the CDN has Cloudflare Hotlink
Protection on, so a request carrying a `localhost` Referer comes back **403
(error 1011)** and every image renders broken. Requests from `www` are
same-origin and fine, so this only ever bites in development.

To check the real built output instead — minified, with fingerprinted asset
URLs — use `npm run serve`.

## Build & deploy

Assets follow a "Rails philosophy": HTTP/2 makes bundling pointless, so the JS
ships as individual ES modules. The build **minifies** (JS per-file with imports
intact, plus CSS) into `dist/`, copies the static files, and rewrites logical
`cdn.ericktakeshi.com.br/assets/…` URLs to their content-hashed form using
`asset-manifest.json`.

```bash
npm run build      # web/ -> dist/ (minified + fingerprinted asset URLs)
npm run serve      # build, then serve dist/ locally (http://localhost:5173)
```

Hosting is **Cloudflare Workers static assets**. On push to `main`, Cloudflare
Builds runs `npm run build` then `npx wrangler deploy` (config in
`wrangler.jsonc`), serving `dist/` at `www.ericktakeshi.com.br`.

## Assets (images + audio)

Images and audio are **not committed to git** — they live on Cloudflare R2 and
are served from `cdn.ericktakeshi.com.br` with content-hash fingerprinted,
immutable-cached filenames. Publish new/changed ones locally with:

```bash
npm run publish-assets   # hash web/assets/**, upload to R2, rewrite asset-manifest.json
```

Then commit the updated `asset-manifest.json` so the next build serves the new
hashes. Credentials come from a local `.env` (see `.env.example`).
