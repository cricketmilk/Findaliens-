# Blind Pool, The Web, and re-checking facts cheaply

What the October 2026 rebuild of Blind Pool and The Web learned, written so
the next model to open these files starts where this one finished.

**`research/glm-recheck.mjs` trusts the fetched page, never the model.** A cheap
model (z-ai/glm-5.3-flash on OpenRouter, $0.15 per million input tokens)
proposes source URLs, quotes and a rewrite; a quote counts only if
`quoteFound` from the Forge's `research-audit.js` finds 90% of its five-word
runs on the page as fetched, and a rewrite only if every figure in it sits
inside a verified quote. That re-checked Blind Pool's 85 facts in three passes
for under a dollar. The model's word that a page "supports" a claim is never
evidence on its own.

**A source's own typo passes every mechanical check in `research/glm-recheck.mjs`.**
Al Jazeera's wire copy says Binance "paid a penalty of $4.3m"; the real figure
is $4.3 billion (the Justice Department's own release). The quote was on the
page and the figure was in the quote, so the check passed and the model
faithfully wrote "$4.3M". The defences: the WRITE prompt tells the model to
prefer the government, court or company over a press report, `--hints` puts
the primary source in front of it, and a person reads every rewrite before it
ships. A stale figure (Fortune's "$14 billion" Anduril valuation, a year out of
date) gets through the same way.

**`unitClash()` in `research/glm-recheck.mjs` compares units, not just digits.**
The figure check matched "4.3" against "4.3" and never looked at B against M.
A figure the quotes state only with a different unit now fails.

**An empty rewrite passed `research/glm-recheck.mjs` until it had a length floor.**
The model once returned ": " for Próspera's arbitration claim; with no figures
and no names in it, every check passed vacuously. A rewrite under twenty
letters and digits now fails.

**`judge()` in `research/glm-recheck.mjs` checks the audit's strong names only.**
`claimCheck(...).missing` also lists sentence openers and, when a claim has
few figures or names, its long words; Blind Pool's "Funders: ... Hidden: ..."
lines failed on "funders" and "hidden", and an arbitration claim on
"non-union" and "keeping". `claimTokens(text).names` is the right list. And
only a statistic has a headline figure: the model filled `n` with notes on
other lines, so `n` is ignored unless `kind` is "stat".

**Bing answers long queries from this address with junk, so `research/glm-recheck.mjs` asks the model for URLs first.**
Most of the first pass's failures were searches that came back as
dictionaries, calculators and comic strips. The PLAN prompt now asks for up to
six specific pages (the law's text on uscode.house.gov or law.cornell.edu, the
agency's own page, the court opinion, the company's release) before any
search, and the `BAD` host list drops the junk. A URL the model invents costs
one failed fetch. The saved corpus also skips pages over 600,000 characters:
a 10-K names everyone, so it matched every claim and was never the best page.

**`public/js/blind-pool.js` draws text with its own 5x7 face, `F`, and a missing glyph draws as a blank.**
"DEPTH ???" on the pool's coping rendered as "DEPTH" until "?" was added, and
a curly apostrophe still turns "CHICAGO'S" into "CHICAGO S": the lease names
are folded to a straight one before drawing. Add a glyph to `F` before using a
new character in any canvas label.

**Labels in `public/js/blind-pool.js` are laid out for the width they get.**
At phone width the pool keeps three pipes with two-line labels ("PEN-SIONS"),
the lease clocks move "58 YEARS LEFT" down between the dates when it would
collide with the lease's name (`tight`), and the dollar pipeline (`#flowart`)
draws at 1x under 560px, 2x under 900px and 3x above. Each of those overlaps
was found in a 390px screenshot, not in the desktop one.

**`public/web.html` lays the names out on a fixed spider's web, not a force simulation.**
Each spoke is an investigation; a name's ring is how many investigations name
it (`ringOf`) and its angle the circular mean of their spokes (`meanAngle`),
so a name two investigations share hangs between them. The force layout it
replaced drew 260 threads and every "mentioned together" pair into a hairball
whose labels piled on each other; a fixed layout can be labelled, and labels
are placed greedily by ring, each trying four spots before it is dropped.
"Mentioned together" is off by default because it is a lead, not evidence.

**`fitK()` in `public/web.html` must leave room for the spoke names, which sit outside the web.**
Fitting only the web's radius clipped "DEEP STATE DOSSIERS" and "POST-HUMAN
RESOURCES" at the stage's edges. The fit keeps 150px either side on a desktop,
and a phone gets short stacked names (`SHORT`) and 46px. On a phone the
investigation chips sit below the stage, not over it, or they cover the bottom
spokes; and selecting a name pans without zooming, which would push the spoke
names off again.

**The spider in `public/web.html` lights the name she visits and never dims the web.**
Her idle visits first reused the reader's focus, which greys every other name;
a page that keeps going dark on its own reads as broken. A visit now lights
only that name's label and threads. Dimming belongs to a reader's hover or
click.

**`fitK()` measures the spoke names rather than guessing a margin for them.**
The margin was a pair of numbers, 150px on a desktop and 46px on a phone, and
46 was chosen when every short name was a stacked pair like DEEP / STATE. It
broke the first time a one-word name was wider than it: `DEMYSTIFY` is 63px at
7px Press Start 2P, so the Demystification spoke started at x=46 and ran to
x=-17, off the left edge. `widestSpoke()` now measures every spoke's lines at
the size they will be drawn and the fit keeps `max(fixed, widest + 12)`, cached
per canvas width. A desktop is unchanged (the widest is 128px, still under 150);
a phone gets the room it actually needs. Adding a page can now only cost a
little zoom, never a clipped name.

**A label spot off the edge of the stage is not a spot.**
`label()` offers each name four places — outward, inward, above, below — and
took the first that did not overlap another label, without ever asking whether
it was on the canvas. Names at the rim ran off it ("...osit Insurance
Corporation"). The spots are now also tested against the canvas, which mostly
just makes a rim node take the inward spot it already had; the focused name is
slid back inside instead of dropped, because the one name the reader asked for
should never vanish.

**The spoke names have to reserve their space, or labels land on them.**
`drawSpokeLabels()` drew straight to the canvas and pushed nothing to
`labelRects`, and `labelRects` was cleared *after* it ran, so node labels could
not see the spokes at all — "HBGary-Federal" sat on top of "DEMYSTIFY". The
reset moved ahead of the spokes and each spoke now pushes its own box.
