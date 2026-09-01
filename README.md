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

**This Worker does not serve findaliens.net yet.** It is deployed and correct —
`https://findaliens.milkingcrickets.workers.dev/` carries the sprite and the
trapdoor — but the apex domain still answers with an older build from somewhere
else, and `wrangler deploy` cannot change that.

The proof, rather than an inference from DNS: `/img/maizey.png` returns **404 on
findaliens.net and 200 on the workers.dev URL**. That path has never been cached
at the apex, so this is not staleness; the request simply is not reaching this
Worker.

The cause is the account split. findaliens.net answers on
`donald`/`maleah.ns.cloudflare.com`, while this account's pair — the one
goblinhouse.net uses — is `arnold`/`fatima.ns.cloudflare.com`. A zone gets the
nameserver pair of the account holding it, so the *active* findaliens.net zone
lives on the other account. `wrangler deploy` still reports success and prints
the `findaliens.net/*` routes, because it binds them to this account's own
pending copy of the zone; those routes are inert until the registrar (GoDaddy)
repoints the nameservers to arnold/fatima.

Until then the deploy target is the workers.dev URL, and both trapdoor surfaces
on the apex are unreachable. `nslookup -type=ns findaliens.net` returning
arnold/fatima is the signal that this has changed.

One further hazard for afterwards: `findaliens.net/robots.txt` is answered by
Cloudflare's **Managed robots.txt**. While that is on for the zone it will
shadow the honeytoken `Disallow`, leaving only the hidden link working.
