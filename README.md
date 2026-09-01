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

## Unremarkable Human (merged in)

The `unremarkable-human/` folder is the old Unremarkable Human website — the
Express-based parody-site starter that preceded this gazette (See Aliens'
successor, seealiens.net being long dead). Merged here 2026-08-31 so the whole
Find Aliens lineage lives in one repo. Run it locally if you ever want it:

```
cd unremarkable-human
npm install
npm start        # Express on :3000
```

It is excluded from the Cloudflare deployment by `.assetsignore` — the live
site at findaliens.net is the static gazette in the repo root.

## The trapdoor

`robots.txt` disallows one path that does not exist, and `_redirects` sends that
path to the labyrinth at `sixoxis.goblinhouse.net`. `index.html` carries one
matching off-screen `nofollow` link before `</body>`. Both are invisible to
visitors and to compliant crawlers; only a scraper that ignores robots.txt or
harvests it for disallowed paths ever reaches them. Nothing else from that system
is present here — no operational routes, no measurement code. See
`edge/DEPLOY.md` in the Korn Kult repo for the other side.
