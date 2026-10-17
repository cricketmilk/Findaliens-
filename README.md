# FINDALIENS 🌽🛸

**The Cornfield Gazette** — aggregated reporting on aliens, drones, and unexplained phenomena, presented with a 90s space aesthetic.

Every headline links to the original third-party reporting. Headlines and summaries are written here; inclusion is not an endorsement of any claim.

## Sections

- 🚁 **Drone Watch** — airspace incidents and unidentified drone activity
- 👽 **Disclosure Desk** — government UAP file releases, hearings, and official statements
- 🏛️ **Digging Up The Deep State** — documented money/power loops from the public record (Palantir–ICE surveillance, stablecoin bank risks, administrative dismantlement, defense-AI procurement monopolies)
- 🔧 **Demystification Desk** — the documented, declassified aerospace programs behind UFO mythology (Roswell = Project Mogul, Blue Book's actual record, Area 51 = U-2/A-12 test flights, AAWSAP Skinwalker Ranch earmarks). Stripping the mystical cover from classified defense spending.
- 🌾 **Crop Circle Corner** — crop formation coverage
- 🌽 **Maizey** — a small site guide in the corner. Click her for navigation tips; each story's corn rating (🌽×1–5) indicates how contested the topic is.

Maizey's sprite (`img/maizey.png`) is 73×96 pixel art displayed at native size, so
one source pixel maps to one CSS pixel. If you resize her, use an integer multiple —
anything else makes the pixel grid uneven even with `image-rendering: pixelated`.

## Stories from the Trove

Research happens in **The Wilds**, the browser inside the Xixoxis shell:
right-click anything worth a story and pick *Clip link* or *Clip selection*,
and the shell's Trove records the source URL, the title, whatever you
highlighted, the cookie jar and the time.

```
node from-trove.mjs            # what is new, as <article> stubs for index.html
node from-trove.mjs --write    # append them to drafts.html instead of printing
node from-trove.mjs --section disclosure --since 7d
```

It fills in the mechanical part — the source link, the date, a headline
starting from the page title, a dek starting from whatever you highlighted —
and leaves every editorial judgment as a `TODO`: the headline's wording, the
summary, and the corn rating. Those are what the Gazette is made of, and a
generated headline would be the one part of it nobody wrote. Sources already
linked on the page are never offered twice, and the `curio` jar is skipped by
default because that is where boards get collected, not where reporting is
read (`--all-jars` to include it).

Nothing is published until you move a stub into `public/index.html` yourself.

```
node --test from-trove.test.mjs
```

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
path to the labyrinth at `wheattodd.com`. `index.html` carries one
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

Pushes to `main` deploy themselves: `.github/workflows/ci.yml` runs the unit
tests and a `wrangler deploy --dry-run` on every push and pull request, and on
`main` it then runs `npx wrangler deploy` followed by `python check.py
--no-trap`, so a deploy that serves a stale or leaking build fails the workflow
rather than sitting there looking green.

The deploy job needs one repository secret, `CLOUDFLARE_API_TOKEN`, added under
the repo's **Settings → Secrets and variables → Actions**. It is never created
by or stored in the repo. Make the token on the Crinkle account (the one
`account_id` in `wrangler.jsonc` pins — a token from any other account fails
the deploy loudly, which is the point) with **Workers Scripts: Edit** on the
account and **Workers Routes: Edit** on the `findaliens.net` zone, since the
Worker is bound to the zone by routes rather than a custom domain (see the
`routes` comment in `wrangler.jsonc`). Cloudflare's "Edit Cloudflare Workers"
token template carries both.

To deploy by hand (the workflow runs the same two commands):

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

## Crash Conduits

`public/crash-conduits.html` keeps the legacy atlas and loads seventeen source-linked
financial-engineering entries from `public/js/crash-finance-data.js` (85 entries total).
These include petrodollar recycling, U.S.–Saudi economic cooperation, the end of gold
convertibility, offshore dollar funding, benchmark manipulation, leveraged lending,
BEPS, repo stress, AIG, municipal swaps, sovereign holdouts, trade finance and backstops.
Each addition includes exact source links and limits on what those sources establish.
The same data file holds whole-object legacy replacements in `auditedLegacyNodes`,
including historical bubbles, bank rescues, sovereign debt crises and enforcement cases.
Corrections identify source-supported participant roles and distinguish dated charging
accounts, settlements, supervisory findings, sentencing reports and historical synthesis.
Run `node research/audit-crash.mjs` for current coverage or add `--pending` for the
remaining queue; its schema checks are not factual verification. `applyLegacyAudits(nodes)` runs before indexing
in both the browser and extractor, preserving IDs while removing unsupported narratives.
Sources include historical research and explicitly labeled secondary references; a linked
source does not mean every underlying primary record has been independently verified.
Older entries without item-level citations are marked **source audit pending**;
recurring participant counts measure mentions, not culpability. Coverage is not exhaustive.

After changing atlas data, run `node research/extract-entities.mjs` to regenerate
The Web's entity/co-mention index; this does not approve researched connections.
Run `node --test crash-conduits.test.mjs from-trove.test.mjs` for offline regression
checks. For repeat audit passes, read `research/CRASH-AUDIT.md`. Preview by serving `public/`, not the repository root. No deploy is automatic.

## Digging Up the Deep State

`public/deep-state.html` carries five dossiers and twenty-four claims, and under
every claim it will open **the quote from the source that actually says it** —
119 of them, across 33 sources from 26 publishers. That is not prose on the page;
it is the record `research/glm-recheck.mjs` wrote when it checked the claims,
joined back to the claims it checked:

```
node research/build-deep-state.mjs           # write public/js/deep-state-data.js
node research/build-deep-state.mjs --check   # assert it is current, write nothing
```

The editorial side (the claim, its status, its source chips) lives in
`research/deep-state-dossiers.json`; the verified quotes live in
`research/deep-state-sources.json`. The build joins them on the claim id
(`DS-<dossier>-<item>`, the argument last) and **fails loudly** rather than
shipping a mismatch: an id on one side only, a status the two disagree about, a
cited URL the record never opened, or a claim whose wording has drifted since it
was checked. Edit either file, then run the build; it is the only way the page's
counts and quotes change.

Two things on the page are counted rather than asserted — the tallies under the
headline and the chain-of-custody panel, which also names the lines a person
vouched for by hand and the ones that were edited after the re-check, each with
its reason. Claims deep-link: `deep-state.html#DS-2-2` opens that claim's record
and lights the row, bringing it back if a filter had hidden it.

To add a dossier: draft its claims as `[{id, status, text}]`, run them through
`research/glm-recheck.mjs --strict-sources` (it proposes the sources and quotes;
the mechanical check does the trusting), **read every rewrite** in the digest,
then append the entries of its `verified.json` to `research/deep-state-sources.json`
and the dossier itself to `research/deep-state-dossiers.json` and rebuild.
THE CUT grows a stratum on its own: the band count comes from the dossiers, and
`public/js/deep-state.js` reads it back off the DOM — but the dossier needs a
`glyph` that exists in that file's `GLYPHS`.

The output is a classic `<script src>`, not JSON fetched at runtime: the page
uses neither a module script nor `fetch`, which are the two things `atlas.html`'s
own note records as blocked over `file://`. It is built that way so it survives
being opened straight off disk, rather than needing the server note the atlas
carries. Do not link `atlas-ui.css` from this page: its `--paper` is a dark panel
colour and would turn every pill and stamp white.

## Verifying

`check.py` asserts the site serves, the sprite is the pixel one rather than the
old vector, both trapdoor surfaces are wired, the trap is catching, and that
nothing outside `public/` is reachable. Exit code is 0 only if every check
passes, so it can gate a deploy:

```
python check.py && echo ok
```

Every assertion in it is a failure this repo actually had. The deploy job in
`.github/workflows/ci.yml` runs it as `python check.py --no-trap` right after
every deploy from `main`; `--no-trap` skips only the checks against the
external maze host, so an outage over at wheattodd.com cannot block a deploy
here. Run it without the flag locally to check the trap as well. The unit
tests (`node --test from-trove.test.mjs`, Node 20+) run in the same workflow on
every push and pull request.
