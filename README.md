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

## Where it runs — read this before touching deploys

| | |
|---|---|
| domain | `findaliens.net`, `www.findaliens.net` |
| Cloudflare account | **Crinkle@goblinhouse.net** (`ba0a42324c7ad9e1be876bb22a75b113`) |
| nameservers | `donald.ns.cloudflare.com` + `maleah.ns.cloudflare.com` |
| Worker | `findaliens` (also at `findaliens.crinkle.workers.dev`) |
| apex DNS | `AAAA 100::`, **Proxied** — the discard address, so Cloudflare fronts the apex with no origin behind it |

**A Worker can only serve a zone on its own account.** That single fact cost a
full day of 525s: the Worker was deployed to a different account than the zone,
and every symptom downstream — phantom DNS records, dashboard edits with no
effect, routes that bound but never fired — followed from it. `account_id` is
pinned in `wrangler.jsonc` so a deploy under the wrong login now fails loudly
instead of succeeding somewhere useless.

The nameserver pair is assigned *by* the account holding the zone, so a pair
that differs from another domain's proves nothing about correctness. If the pair
Cloudflare shows for this zone ever disagrees with the live delegation
(`nslookup -type=ns findaliens.net`), the domain points at some other account's
zone and nothing here can serve it. Check which account owns the zone before
changing nameservers — repointing them to match a different domain is what broke
this in the first place.

## Deploying

```
npx wrangler deploy
python check.py
```

The wire needs its token once per account (it is a Wrangler secret, never a
file in the repo). Write `{"MUT_WIRE_TOKEN": "…"}` to a file outside the repo
and run `npx wrangler secret bulk <that file>`; the same value lives in the
shell's gitignored `shell/secrets.json`. Bulk from a file, never a piped
`secret put` — on Windows the pipe appends a CR and every request then 401s.

## The wire — Müt speaks here

Müt, the Xixoxis shell's familiar, can say things on this site. He does not
appear himself: Maizey channels him. `worker.js` answers `POST /mut/say`
(bearer token, ≤4 KB, timestamp within a minute, replay-proof) by storing the
message in one SQLite Durable Object (`wire/wire.js`), and `GET /mut/latest`
(public, edge-cached 2s) hands it to `public/mut/mut.js`, which polls every
3s and calls `window.MutHost.channel()`. For the message's duration Maizey is
visibly not herself — his firelight, a pixel ember, his dark stepped bubble —
then she is released. Text only reaches the page through `textContent`.

Only `public/` is published. This used to be the repo root, which shipped a
build source map and `.gitignore` as public assets and left the cached Cloudflare
account id one glob away from going with them. A directory allowlist cannot
regress the way an `.assetsignore` blocklist can — anything not in `public/` is
unreachable by construction.

## Verifying

`check.py` asserts the site serves, the sprite is the pixel one rather than the
old vector, both trapdoor surfaces are wired, the trap is catching, and that
nothing outside `public/` is reachable. Exit code is 0 only if every check
passes, so it can gate a deploy:

```
python check.py && echo ok
```

Every assertion in it is a failure this repo actually had.
