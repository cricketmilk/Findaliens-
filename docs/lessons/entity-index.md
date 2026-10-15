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
