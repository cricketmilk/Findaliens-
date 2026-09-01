# FINDALIENS 🌽🛸

**The Cornfield Gazette** — aggregated reporting on aliens, drones, and unexplained phenomena, presented with a 90s space aesthetic.

Every headline links to the original third-party reporting. Headlines and summaries are written here; inclusion is not an endorsement of any claim.

## Sections

- 🚁 **Drone Watch** — airspace incidents and unidentified drone activity
- 👽 **Disclosure Desk** — government UAP file releases, hearings, and official statements
- 🌾 **Crop Circle Corner** — crop formation coverage
- 🌽 **Maizey** — a small site guide in the corner. Click her for navigation tips; each story's corn rating (🌽×1–5) indicates how contested the topic is.

Maizey's sprite (`img/maizey.png`) is 73×96 pixel art displayed at native size, so
one source pixel maps to one CSS pixel. If you resize her, use an integer multiple —
anything else makes the pixel grid uneven even with `image-rendering: pixelated`.

## Running it

It's a static site — open `index.html` in a browser, or serve the folder:

```
python -m http.server 8000
```

## Deploying

Cloudflare Workers static assets, no build step:

```
npx wrangler deploy
```

`findaliens.net` must already be a Cloudflare zone with DNS — `wrangler.jsonc` claims
it as a custom domain. `robots.txt` and `_redirects` are served as-is; `.assetsignore`
keeps the config and this README out of the deployed bundle.
