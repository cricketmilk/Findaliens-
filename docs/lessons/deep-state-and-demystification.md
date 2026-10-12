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
