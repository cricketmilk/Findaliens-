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

**`deep-state` and `demystification` are indexed by markup that is no longer on them.**
Both are configured `html: true` and so go through `htmlSections()`, which
matches `id="dossier-…"`. Neither page carries such an id any more — both
render their dossiers from script into `<main id="dossiers">` — so both yield
zero sections, while the shipped `public/data/entities.json` still holds the 8
deep-state and 2 demystification mentions from when the markup was static.
Regenerating the index therefore drops them. Same gap as the one in
[deep-state-and-demystification.md](deep-state-and-demystification.md);
neither page was changed to fix it here.

**Regenerating the index is not a refresh of the same numbers.**
The fixed extractor against the current pages gives 242 entries and 718
entities where the shipped file has 719: it adds National Association of
Manufacturers, drops EPA and Flock Safety, changes the mentions of 38 other
entities and moves about 90 co-mention pairs. Most of that is the pages' own
edits since the file was generated on 2026-10-11, not the fix — the fix alone
changes no page's output but blind-pool's, which could not be read before.
`research/README.md` keeps approved connections behind `node
research/review.mjs`, and regenerating the index "does not approve researched
connections", so `public/data/entities.json` and `public/data/web.json` were
left as they are, for a person to regenerate and read.
