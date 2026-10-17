# Deep State, the Demystification Desk, and a stricter re-check

What the October 2026 rebuild of the last two investigation pages learned,
and what it changed in the re-check tool.

**`research/glm-recheck.mjs --strict-sources` counts only rated sources.**
A quote is as easy to find on a content farm as in the Federal Register. The
Deep State facts first passed on crypto blogs (coinalertnews, nftevening,
gate.com) and the UFO facts on enthusiast sites (disclosurearchives, ufomyst,
uapedia), because the quote was really on those pages. A rated source is a
.gov, .mil, .edu or .int site, a newsroom, watchdog or law firm on the
`RATED_HOSTS` list, or the subject's own site. Unrated pages are hidden when a
rated one says the same thing; a fact only they state fails, and `--retry`
goes looking for better. Pass the flag for every new page.

**`research/glm-recheck.mjs` refuses every wiki host, not only Wikipedia.**
WikiDisc turned up as a source for the Pentagon's UFO program. The `refused()`
test now drops any host containing "wiki" as well as the Wikipedia copies
`isWiki` knows.

**`research/glm-recheck.mjs` reads spelled-out numbers before comparing figures.**
The Investment Company Act says "not more than one hundred persons"; the claim
said 100, and the check failed a correct fact. `numberWords()` turns runs like
"one hundred" into digits on both sides. "A quarter million" is still read as
words, so POGO's line for Stephen Miller's Palantir stock was accepted by hand.

**`research/glm-recheck.mjs` fails a rewrite that talks about its sources.**
GLM wrote "Funders: not named in the sources reviewed" for a sector line, and
it passed: no figure or name was wrong because there were none. The `META`
pattern rejects a rewrite that describes the evidence instead of the world.

**`research/glm-recheck.mjs` asks the model whether the rewrite kept the point.**
The SEC item kept the rule's adoption and lost the court that struck it down;
the U-2 item kept the altitude and lost why people saw lights at dusk. A
second, cheap call (`KEEP`) compares the original and the rewrite and records
what was lost. It never passes or fails a fact; `digest.md` lists those
first, because that is where a person's reading pays most.

**`research/glm-recheck.mjs` takes a claim the rewrite removed back to the pages it came from.**
The re-check dropped that Curtis Yarvin coined "RAGE" (Retire All Government
Employees), and it was wrong: Vox quotes Blake Masters, "One of my friends has
this acronym he calls RAGE," and the very next sentence is "You've probably
guessed who the friend is." The quote stopped one sentence short, and The
Conversation says outright that Yarvin coined it. KEEP now lists each claim a
rewrite removed, and RECOVER asks the same pages for that claim directly,
told that people are often named a sentence away from what they said; found
quotes go back in and the line is rewritten. The model always reasons (it
refuses `effort: "none"`), and on the whole Vox page it spent 5,000 tokens
thinking and answered nothing, so RECOVER reads a 12,000-character window.

**`research/glm-recheck.mjs` tries Internet Archive captures from 2015 and 2010 too.**
The CIA's own UFO history lives at an old CSI address that later captures
record only as a redirect. The 2015 capture has the whole article, and with
it the CIA's own wording: the estimate came from "CIA officials who worked on
the U-2 and OXCART projects", which Wired's 1997 summary had flattened.

**`research/glm-recheck.mjs` asks Goblin Brain before any search engine.**
The Brain's `evidence` power returns what the roost already verified and its
`sources` power searches the Federal Register, GovInfo, CourtListener and
EDGAR directly. The evidence index matches any shared word, so a row is only a
candidate when `claimCheck` scores it 0.45 or more against the claim; without
that it offered Sequoia and PayPal pages for a Roswell claim. GovInfo's big
scanned volumes exceed the fetcher's PDF size cap (one Air Force volume is 87
MB), so a records hit can still come back empty.

**`research/source-labels.mjs` is the one place a source's label is cut down.**
The tool, `deep-state` and `demystification` builds all import it, so a
publisher reads "U.S. Department of Defense", not "U.S. Department of
Defense, All-domain Anomaly Resolution Office (AARO), February 2024 (cleared
for publication March 6, 2024)", and "Publication 550" is not read as the
year 550. A build script importing it on Windows needs a file:// URL; a bare
"C:/..." path is refused as an unknown URL scheme.

**A fact a person accepts by hand records why, in the page's overrides.**
FEC's API gave Thiel's $15 million as three receipts (10,000,000 on
2021-03-12, 3,500,000 and 1,500,000 in April 2022), which no quote showed as a
sum; the Fifth Circuit's ruling and the Archives' "T-1206" were near-misses of
the same kind. Each acceptance carries a `why`, and the page's
research/*-sources.json keeps it as `accepted`, so the next reader can see
which lines a person vouched for.

**`public/js/deep-state.js` keeps the forest textured and the iris broad.**
A forest drawn as density alone went flat black beyond the clearing and hid
the trunks; leaf clumps with light between (`fbm`, then a 0.45 cut where the
noise is low) keep texture to the edge. The eye's spiral reads at 4x pixels
only as a few broad rings, `r / 2.6 + angle / π`; a log spiral was mush. Most
drips are short, a few long: the reference's ink, not a row of poles.

**`public/js/demystify.js` needs a hash whose outputs do not line up.**
The first hash was linear in its arguments, so `hash(i, s)` and `hash(i, s, 2)`
moved together and every starfield came out as diagonal rows of stars.
`Math.imul` mixing fixed it; `deep-state.js` keeps the old one only because its
texture never pairs two calls that way.

**The hand in `public/demystification.html` takes its size from the box beside it.**
The poster's art box is as tall as the kanji column, and a canvas sized by
aspect left a dark band under the hand; it is positioned to fill the box and
reads the box's height. The kanji come from Noto Serif JP loaded with the
Google Fonts `text=` parameter, which ships only the nine glyphs used instead
of a CJK font of several megabytes.

## The October 2026 Deep State rebuild: the page shows its own dig

**`research/build-deep-state.mjs` joins each claim to the quotes verified for it, and refuses to build when they have drifted apart.**
The claims and their source chips live in `research/deep-state-dossiers.json`;
the quotes `glm-recheck.mjs` found on each page as fetched live in
`research/deep-state-sources.json`. The build joins them on the claim id
(`DS-<dossier>-<item>`, the argument last within its dossier) and writes
`public/js/deep-state-data.js`. It exits non-zero if an id is on one side only,
if the two disagree about a claim's status, if a claim cites a URL the record
never opened, or — the one that matters — if the claim's wording has changed
since it was checked. Quotes are evidence for the sentence that was verified,
not for whatever that sentence later became. `--check` asserts the generated
file is current without writing it.

**The output is a classic script, not JSON fetched at runtime.**
`atlas.html` needs an HTTP server and carries a note explaining why, because
`file://` blocks both module scripts and `fetch`. The Deep State page uses
neither, so it should survive being opened straight off disk, which is how the
in-app file view opens it. That was reasoned from the atlas's note rather than
re-tested: the in-app browser pane renders a `file://` URL as a static snapshot
and will not drive it as a live page, so the claim is unverified here — open it
off disk in a real browser if it ever matters. Inlined data at this size
(97 quotes, 160 KB) costs nothing a fetch would have saved.

**`public/deep-state.html` deliberately does not link `atlas-ui.css`.**
That stylesheet's `--paper` is a dark panel colour declared as
`var(--paper, #161813)`; this page's `--paper` is the print's actual paper
white. Linking it and then overriding would make every `.atlas-*` class resolve
its background to white. `atlas.html` solves this by scoping `--paper` to its
mount containers and writing the inverted states as literals; a page that only
wants pills and stamps is better off writing twenty lines of its own CSS than
inheriting that collision.

**`SURFACE` in `public/js/deep-state.js` and `.cut-bands { top }` are the same
number in two files.** THE CUT draws a surface strip and four strata; the page
lays four real `<a>` elements over the same four bands, so the links are
keyboard-reachable, selectable and routable, and the labels are crisp text
rather than canvas glyphs (this file has no bitmap font — `blind-pool.js` is the
one that carries its own). Change the fraction in one place and the labels slide
off the layers they name.

**A pyramid drawn wide and shallow reads as a brick wall.**
The buried pyramid first spanned the bottom two layers at `Wd * 0.165` either
side and looked like masonry coursing, not a structure. Its half-width is now
derived from its own height (`(H - apexY) * 0.62`), so it stays steep at every
canvas size. Its apex sits two layers down on purpose: the trench has to come
through the civil service and the surveillance contracts to reach it, which is
the page's argument, drawn.

**Cut the trench before laying the pyramid in, and stop the bedding planes at
its edge.** The trench is drawn as white over the strata; drawing it after the
pyramid whited out the apex it was supposed to have exposed. The bedding planes
are drawn last and skipped where `digAt(y)` says the cut removed them — which is
what makes the void read as excavated rather than as a blank rectangle.

**The share card is composed in the page and scaled by an integer.**
`public/img/deep-state-og.png` is THE CLEARING's own canvas drawn into a
1200×630 buffer at exactly 5×, with the title and the page's counted tallies
typeset under it. A screenshot would have been resampled by the window's device
pixel ratio and broken the pixel grid, the same rule the README states for
Maizey. Quantised to 64 colours it is 9.6 KB, against 39 KB for the atlas's.

**`research/extract-entities.mjs` cannot run: `public/blind-pool.html` throws
`window is not defined` in its sandbox.** `pageData()` evaluates the page's last
inline script in a bare `vm` context, and Blind Pool's now touches `window`
before the `// ---------- helpers` marker that bounds the slice. This predates
the Deep State rebuild and blocks regenerating `public/data/entities.json` for
every page, not just that one. Deep State is a `html: true` page and contributes
nothing to the index either way, because `htmlSections()` looks for
`id="dossier-…"` and the dossiers are rendered by script into `<main
id="dossiers">`, where that regex never matches.

## Dossier 05, and what the re-check caught on the way in

**The re-check's value showed up as three corrections a person would have shipped.**
Drafting "the dual hat" — In-Q-Tel, JPMorgan's Palantir programme, Signac, Team
Themis — `research/glm-recheck.mjs --strict-sources` passed two of five on the
first run, for three cents, and every failure was real. It struck **"apologised"**
out of the Team Themis line: the quotes have Palantir's chief executive calling
the plans reprehensible and saying "I have directed the company to sever any and
all contacts with HB Gary," and no apology anywhere. It corrected the Team Themis
date from 2011 to late 2010 and then failed the line anyway, because no quote
carried "2010" — the fix was to drop the bare year and let the source chips carry
the dates. And it moved an argument's attribution from "civil-liberties groups"
to **Glenn Greenwald**, because the quotes show him making it and not them.

**A claim that names an agency needs a page that spells the agency that way.**
"the Central Intelligence Agency set up In-Q-Tel" failed on `namesNotOnPages:
['central intelligence']` — the source says "the CIA's investment arm". The claim
was reworded to the source's words rather than hunting for a page that happened
to spell it out, which is the right direction to move in anyway.

**The machine's rewrite can still put the Gazette's gloss in someone's mouth.**
It wrote that Greenwald "argued that a private contractor's proposal ... shows what
intelligence tradecraft becomes once it is available for hire" — a sentence he
never said; that framing was the draft's, and the rewrite kept it while swapping
the subject. The mechanical checks cannot catch this: there is no figure or name
to fail on. It was restated on his quoted words ("quite possibly constitutes
serious crimes", "possibly extortion") and marked `edited`. This is exactly the
case the lesson about reading every rewrite exists for.

**A quote that arrives with the source's own quotation marks must not get a second pair.**
`.quote::before/::after` add typographic marks, and eight of the quotes are
themselves quotations inside the source's prose, so they rendered as `""I have
directed...`. The render now tags those `.quote.bare` and the pseudo-elements are
suppressed for them. Note that `textContent` does not include pseudo-element
content, so a check for doubled marks written against `textContent` reports
clean no matter how broken the page looks.

**THE CUT takes its band count from the dossiers, not from a number in two files.**
Adding the fifth dossier would have meant editing a hardcoded 4 in five places in
`public/js/deep-state.js` plus the CSS grid. Instead `.cut-bands` gets
`--cut-layers` from `DOSSIERS.length` and the canvas reads `.cut-band` back off
the DOM; the canvas height is `0.1 × LAYERS` of its width (0.195 on a phone), so a
band stays 52px tall at 375px however many there are. The pyramid's apex is a
fraction of the ground's depth, not a count of bands, so it does not move when a
layer is added. A new dossier does still need a `glyph` that exists in `GLYPHS`.

**`python -m http.server` caches, and it will hand you a stale page mid-verify.**
An edit to the inline script appeared not to work; the page in the browser was the
previous one. A cache-busting query (`?v=…`) on reload is the quickest way to be
sure you are testing what you just wrote.
