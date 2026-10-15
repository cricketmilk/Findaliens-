# The entity index, and the pages it cannot see

What fixing `node research/extract-entities.mjs` in October 2026 found: one
crash, and three pages the index has quietly stopped reading.

**`research/extract-entities.mjs` runs a page's data section with a `window`, because a page may keep data there.**
`pageData()` slices the page's last inline `<script>` up to its
`// ---------- helpers` marker and runs that in `vm.runInNewContext`.
`public/blind-pool.html` closes its data with `window.LEASES = [...]`, so the
bare sandbox threw `ReferenceError: window is not defined`: one page's line,
and no page got indexed at all, because the throw killed the whole run before
anything was written. The sandbox's `window` is now the sandbox itself, the way
a browser's is, so `window.LEASES = [...]` lands as a global the extractor can
read. `document` is still absent on purpose — a data section that reaches for
the DOM should be heard about, not patched over — and a genuine
`ReferenceError` in any page still stops the build rather than being caught.

**A page whose data the extractor cannot find yields nothing, and says nothing.**
`collectItems()` reads only the collection names listed for that page in
`PAGES`; a name that is not in the data is skipped without a word. `climate` is
now a 1 KB redirect stub to `carbon-class.html`, so all six of its configured
collections (`ENTRIES`, `LOBBY`, `LOBBY_STATS`, `MILESTONES`, `TOP10_FACTS`,
`FUTURE_FACTS`) resolve to nothing and the Carbon Ledger contributes no
entities at all; `carbon-class` is not in `PAGES`. Verified by running the same
slice-and-run per page: crash-conduits 85 nodes, transhumanism 57 entries,
consent 49, blind-pool 51 (after the fix), climate 0.

**`deep-state` and `demystification` were indexed by markup that is no longer on them.**
Both were configured `html: true` and so went through `htmlSections()`, which
matches `id="dossier-…"`. Neither page carries such an id any more — both render
their dossiers from script into `<main id="dossiers">` — so both yielded zero
sections, while the shipped `public/data/entities.json` still held 8 deep-state
and 2 demystification mentions from when that markup was static.

**All ten of those were dead links.** They point at `#dossier-civil-service`,
`#dossier-palantir`, `#dossier-stablecoin`, `#dossier-drones`,
`#dossier-skinwalker` and `#dossier-black-projects`, and not one of those anchors
is on either page today, so a reader arriving from The Web scrolled nowhere. An
index that has stopped being able to read a page does not merely undercount it:
it goes on serving the links it had when it still could, and they rot silently.
Worth checking the anchors, not just the counts, whenever a page's structure
changes.

`deep-state` is fixed below. `demystification` is not: its `CASES` array is
multi-line and inline with no `// ---------- helpers` marker, so `pageData()`
cannot reach it either way, and the fix has to be to the page — a marker, or a
generated data file of its own — not to the extractor. It still names CIA and
Pentagon that go unindexed. Same gap as the one in
[deep-state-and-demystification.md](deep-state-and-demystification.md).

**The index reads Deep State one claim at a time, and leaves its sources out.**
The page keeps no data at all: `research/build-deep-state.mjs` generates
`public/js/deep-state-data.js`, so `pageData()` special-cases it and reads that
file, the way it already does for Crash Conduits and `crash-finance-data.js`.
The dossiers are flattened to one item per **claim** rather than one per
dossier, because the page routes `#DS-2-0` to that claim and opens its record —
so a reader arriving from The Web lands on the sentence the entity was found in,
with its verified quotes already open, instead of at the top of a section.

Each claim's `sources` are dropped before the item is built. `strings()` sweeps
every string in an item into the text entities are matched against, so leaving
them in would make a publisher a subject of its own story — WIRED reporting on
Palantir would become a WIRED mention on the Deep State page. An entity belongs
to the claim, not to the masthead of the paper that reported it.

**Regenerating the index is not a refresh of the same numbers.**
Against the current pages the extractor gives 266 entries and 718 entities where
the shipped file has 719: it adds National Association of Manufacturers and drops
EPA and Flock Safety. Both drops are correct — EPA's only mention came from the
old scrape of `#dossier-civil-service`, which swept headings and source links
into the matched text, and no claim on the page names it; Flock Safety left
blind-pool's `#ventures` when that section was rewritten. Mentions go 1,048 to
1,065: `consent` +16 with nothing lost, `deep-state` 8 to 21, `crash-conduits`
and `transhumanism` unchanged, `blind-pool` −10 to its own edits and to alias
churn between duplicate ids. `research/README.md` keeps approved connections
behind `node research/review.mjs` and says regenerating the index "does not
approve researched connections", so a person reads the diff before it ships.

**The seed carries the same body under two ids.**
`SEC` and `Securities and Exchange Commission`, `US Department of Justice` and
`U.S. Department of Justice`, `FDIC` and `Federal Deposit Insurance Corporation`
are each one organisation indexed twice, which splits their mentions and makes
page-to-page churn look like content changes when a page swaps which spelling it
uses. They belong to one `research/entities.seed.json` record with the other
spelling as an alias; not fixed here, because merging ids rewrites mentions
across every page.


## The atlas joins the index, and a filter that never ran

**`GENERIC` had never matched anything, since the day the file was written.**
The line reads `const GENERIC = /\b(claimants|...|users)\b/i;` in a listing, but
the bytes between the slash and the group, and between the group and the closing
slash, are two literal **backspace characters** (`0x08`) — not the two-character
escape. So the regex required a backspace either side of the word and matched
nothing, ever. `ROLE_WORDS` on the very next line is written `\b(...)\b`
correctly, which is what `GENERIC` plainly meant to be. Traced through every
revision back to `182d761`, the commit that created the file: it has been dead
the whole time. Restoring it (and adding the crowd nouns the atlas turned up)
drops **44 entities** that had been in the index all along — `Enron investors`,
`Holdout creditors`, `Elite Wall Street Hedge Fund Managers`, `Workers and users
of public services` — each with exactly one mention.

A regex that never matches is invisible: nothing errors, the filter just never
fires and the junk it was meant to stop flows through looking like data. When a
filter seems not to be doing its job, test the pattern itself before hunting for
inputs it should have caught, and scan the source for control characters
(`[c for c in src if ord(c) < 32 and c not in chr(10)+chr(13)+chr(9)]`).

**A quoted heredoc is not a safe way to write a backslash escape.**
Three attempts to patch that line failed in three different ways: `sed` with `|`
as its delimiter never matched, and `cat > f <<'EOF'` collapsed `\b` in the
Python source it was writing into a backspace — reintroducing the exact bug
being fixed. Build the character explicitly (`chr(92) + 'b'`), write the file
from a script on disk rather than a heredoc, and read the bytes back before
believing the edit landed.

**The atlas is indexed, and it duplicates nothing.**
`public/data/atlas-public.json` holds 108 dossiers over 1636–2026 and the eight
lineages, and **not one of its 108 codes appears as an id in crash-conduits'
data**, nor do the lineage names (Mersey, Benjamin Strong, the Dulles brothers,
Lutnick, Tesla, Marconi, Walpole, Ismay) appear anywhere else on the site. It is
a parallel body of work the tab pages never absorbed, so indexing it is new
ground, not double counting. `pageData()` reads the compiled JSON directly, the
way it reads `crash-finance-data.js` for Crash Conduits.

Three decisions about what an entity may be matched on:
- A dossier's `participants` become the item's `who` — names the compiler put
  there deliberately, rather than names guessed out of prose.
- `citations` are dropped, for the reason Deep State's sources are: a publisher
  is not a subject of its own story.
- `decoyVsLedger.viralDecoy` is dropped too. That field holds the claim the
  dossier exists to refute, and indexing it would file a name under a story the
  atlas says is false. `whyDecoyFails` and `documentedLedger` are kept.

**A lineage chain link names a step, not a body.**
`chain[].entity` holds things like `Nikola Tesla (Wardenclyffe) -> Guglielmo
Marconi` and `J.S. Morgan & Co. / J.P. Morgan & Co.` — two entities each. Split
on the arrow and the slash, or every arrow becomes an "entity" of its own, and
the longer compounds are silently dropped by `explicitNames()`'s six-word limit.
A participant slot also sometimes holds the record a claim rests on rather than a
body (`1858 Commons and Lords record; Landed Estates Court Acts 1861 and 1866`);
anything starting with a year or carrying a semicolon is skipped.

**`public/web.html` places more labels than it has room for.**
With the atlas in, The Web draws 221 names against 158, and entities on more than
one page — the ones it threads together — go from 54 to 124. Labels now run off
both edges of the stage and one collides with the `DEMYSTIFY` spoke name. The
clipping is not new (the shipped index already cut off "Federal Deposit Insurance
Corporation"), but the density makes it plain. `fitK()`'s 150px side margin and
the greedy four-spot label placement were tuned for a sparser web; they need
revisiting, which is a layout decision rather than a data one and was left alone.
