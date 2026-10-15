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
clipping was not new (the shipped index already cut off "Federal Deposit Insurance
Corporation"), but the density made it plain. Fixed in
[page-redesigns-and-recheck.md](page-redesigns-and-recheck.md): the fit measures
the spoke names instead of assuming a margin, label spots are tested against the
canvas, and the spokes reserve their own boxes so nothing lands on them.


## Three defects the crowd filter's own diff turned up

**Restoring a filter is a change to measure, not to assert.** `GENERIC` dropped 34
labels, and calling them all junk was too quick. The filter removes the *whole*
string, so the institution inside one goes with it. Nine of eleven checked
survived anyway, because the body exists independently and the alias matcher
re-finds it — `Bank of Japan Leadership` keeps Bank of Japan, `Enron investors`
keeps Enron. Two did not: `Bank of New York Executives` and `Ministry of Finance
Officials` were the only mention of those bodies on their dossiers, and dropping
the label dropped the body. Check what a filter takes with it, per item, not just
what it removed.

**The seed's own rule is load-bearing: only add an alias that is unambiguous on
this site.** The obvious repair was to seed the two missing bodies, and measuring
it showed why not. Aliases match as whole words with no precedence between
entities, so `Bank of New York` also matches inside **Federal Reserve** Bank of
New York: 10 mentions, 9 of them false, across LTCM, Enron, AIG, Maiden Lane and
the 2019 repo squeeze. `Ministry of Finance` likewise matched the *Saudi*
Ministry of Finance and Economy. Seeded `BoNY` instead, which appears only in the
1998 dossier's own title: 2 mentions, both right. The Japanese Ministry of
Finance has no string on this site that is not also another country's, so it
stays unindexed rather than wrong.

**A parenthetical holding a count is not an organisation.**
`explicitNames()` reads `Name (Org)` and files the parenthetical as an
affiliation, cutting it at the first comma. `Madoff Victim Fund recipients
(40,930 compensated victims in 127 countries as reported in December 2024)`
therefore created an entity called **`40`**, which then matched every bare 40 on
the site — in Madoff, the Flash Crash, "life expectancy at age 40", and Room 40,
the naval intelligence unit on the Lusitania dossier. It had been in the shipped
index all along. A parenthetical starting with a digit is now skipped.

**And the slash in a date is not a separator.** Splitting lineage chain links on
`/` to break up `J.S. Morgan & Co. / J.P. Morgan & Co.` also cut `ATSSSA
Liability Shield & 9/11 Monograph` into `...& 9` and `11 Monograph`, two entities
that are not things — introduced while removing junk entities, and shipped. The
slash now only separates when it is spaced. Arrows still split unconditionally.


## The atlas's citations, and why the re-check cannot fix them

**"85 stub citations" was 13.** The master shares citations across dossiers, so the
compiled file counts the same stub once per dossier that references it. Count
`master/atlas.json`'s `citations`, not `atlas-public.json`'s.

**One citation was a scaffolding default on 70 dossiers, and it was their only one.**
`CIT-1720-HANSARD`, the 1721 Commons report on the South Sea Company, was cited
by Tulip Mania (1636), the Haiti indemnity (1825), the Baring Crisis (1890) and
67 others. Giving it a real URL would have been the worst available outcome: 70
visibly unsourced dossiers would have become 70 that look sourced, with a
citation wrong for 69 of them. A placeholder is safer than a plausible lie.

**The sources were already in the repo.** Those dossiers were migrated from the
legacy crash-conduits nodes, which still carry 63 resolvable source URLs across
48 nodes; the migration dropped them. `research/atlas-engine/repair-citations.mjs`
carries them back (20 dossiers, 25 citations) and re-derives the era from the
dossier's own year — 45 dossiers were in the wrong one, Tulip Mania filed under
ERA-09-2001. Before researching anything, check whether the answer was thrown
away upstream.

**`research/glm-recheck.mjs` cannot resolve an archival citation: 0 of 11, for
3.5 cents.** It verifies a *claim about the world* against a page it can fetch,
and it is very good at that. A citation is a different shape — a document's name
and what it contains — and these documents are pre-digital: an 1849 Act, the 1912
Senate Titanic report, 1913 Hansard, the Nye and Truman committees. They live
behind search interfaces or in scanned PDFs over the fetcher's size cap. Nothing
about the failure was the tool misbehaving; it was the wrong tool.

**What does work is each archive's own interface, one at a time, with the match
checked.** legislation.gov.uk resolved the Encumbered Estates (Ireland) Act 1849
and its own text confirmed the period spelling, "Incumbered Estates in Ireland".
CourtListener's API found `Stevens v. United States` (1866) by name, date and
court — and its record carries **no text**, so whether it is the Hall carbine
case is unconfirmed and it was left unused. Hansard answers a bot with 403.
Metadata agreeing is not the document saying so.


## Resolving an archival citation: what counts as having found it

Seven of the thirteen stub citations now point at the document. The six that do
not are recorded as unresolved rather than filled with something plausible, and
the difference between those two piles was decided the same way every time: the
page itself has to say it is the document.

**A 200 is not confirmation.** `fraser.stlouisfed.org/title/from-farm-boy-to-financier-5744`
returns 200, and it is FRASER's generic "Browse by Title" listing — the item does
not exist and the site falls back rather than 404ing. The slug named the Vanderlip
memoir the citation wants; the page was an alphabetical index. Fetch the page and
look for the document's own words before believing a URL.

**Metadata agreeing is not the document saying so.** CourtListener has
`Stevens v. United States` at the right name, the right court and the right year
(1866), and its record carries **no text at all** — so whether it is the Hall
carbine case is unverified, and it was left as a stub. A citation that is right
by coincidence is indistinguishable from one that is right.

**An official title can differ from the one everybody uses.** legislation.gov.uk
files 13 Geo. 3 c. 63 as the *East India Company Act 1772*, because the session
opened in 1772; it is the act universally cited as the Regulating Act 1773. The
discrepancy belongs in `quoteOrFact`, not hidden by picking whichever name makes
the citation look tidier.

**A description of a document is worth more than a domain root, and less than the
document.** GovInfo's feature page on the Titanic names the thing exactly —
"Senate Report No. 806, 62nd Congress, 2nd Session … pursuant to S. Res. 283" —
so it was used, with `quoteOrFact` saying plainly that it describes the report
rather than being it.

**What the archives answer to.** CourtListener and GovInfo both have usable
APIs — GovInfo's `/search` worked where its `/packages/{id}/summary` rate-limited
on DEMO_KEY, and its package ids are discoverable by search, not guessable
(`SERIALSET-14137_00_00-003-0857-0000` is House Report 102-857). legislation.gov.uk
answers plain GETs. Hansard returns **403** to anything scripted, which is why
both Hansard citations are still stubs.


## Two more found, and why a found document can still not be the fix

**hansard.parliament.uk is unusable to a script, and Parliament's historic archive
is not.** The live site answers curl with 403 and a browser with a Cloudflare
interstitial that does not clear. `api.parliament.uk/historic-hansard` serves the
same debates as plain HTML with no challenge, covering 1803–2005, and its day
pages list each sitting's sections. The 1913 Marconi debate is at
`/historic-hansard/commons/1913/jun/18/marconis-wireless-telegraph-company`, and
its 299,000 characters name Marconi, the Select Committee, Isaacs, Lloyd George,
American Marconi and the Attorney-General.

**Hansard begins in 1803, so a 1721 report was never going to be there.** The
stub's URL was not merely unresolved, it was impossible: `CIT-1720-HANSARD` cited
the Commons Committee of Secrecy on the South Sea Company and pointed at a site
whose record starts eighty years later. The document itself is on the Internet
Archive, catalogued to creator "Great Britain. Parliament. House of Commons" and
date 1721. When a citation will not resolve, check whether the archive could ever
have held it before hunting for the right path inside it.

**Finding the document is not the same as fixing the citation.** That 1721 report
was the placeholder on 50 dossiers. Pointing `CIT-1720-HANSARD` at the archive
scan would have made all 50 look sourced by a real document that is right for two
of them, which is the failure the placeholder was protecting against — a worse
outcome than before, reached by doing the obviously good thing. The scan got its
own id, attached to the two South Sea dossiers, and the other 48 keep an
obviously broken URL until someone sources them.

**A PDF can be a catalogue entry.** FRASER's `17606_01_0004.pdf` is titled
"Vanderlip, Frank A., with Boyden Sparkes From Farm Boy to Financier" and is a
real 11-page PDF that extracts cleanly — to a bibliography line, "N.Y.
Appleton-Century. 1935 307p illus.". It is a page listing the book, not the book,
and contains neither Jekyll Island nor the Saturday Evening Post. Extract the
text and look for the content, not the title.
