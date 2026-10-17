# Manufacturing Consent: the factory redesign and the new channels

**public/consent.html is built, never hand-edited.** The page comes from a
template and a build script kept outside the repo, which put the case data in
place of `/*DATA*/`. Its Hollywood and influencer cases (October 2026) came
through `research/glm-recheck.mjs --strict-sources`, and every quote they rest
on, along with each accepted near-miss and its reason, is in
`research/consent-hollywood-influencers-sources.json`. An edit made straight
to consent.html is lost on the next build. Change the template, or the facts
and overrides, then rebuild.

**public/js/consent-factory.js draws the hero and reads its slogans from the page.**
Raw events go in on the left and identical smiling screens come out on the
right; a billboard crawls `window.FACTORY_LINES`. The page sets that list from
the cases' own `tv` lines before the deferred script runs, so a new case with a
`tv` field shows up on the billboard without touching the script. The old TV
wall (`js/consent-tv.js`) is gone. Do not bring back a second hero script
alongside this one.

**A Press Start 2P title needs a column as wide as its longest word.** Every
character of the pixel font is one em wide, so "MANUFACTURING" at 46px is about
600px wide. In a `1fr 1fr` grid it ran over the paragraph beside it. The head is
now `max-content minmax(0, 1fr)` with the size clamped to 40px, and it stacks
below 1000px. Any pixel-font heading in a grid on these pages needs the same
treatment: size the column from the word, not the word from the column.

**Turn off smooth scrolling before screenshotting a section.** With `html {
scroll-behavior: smooth }`, `scrollIntoView()` in a screenshot's `--eval`
animates, and the capture lands mid-scroll. That leaves half-painted blank
bands and a wrong section lit in the rail. Set
`document.documentElement.style.scrollBehavior = 'auto'` first in the same eval.

**In a two-up card grid, an odd last card takes the whole row.** Without
`.case:last-child:nth-child(odd) { grid-column: 1 / -1 }` a nine-case line ends
in a hole. The filtered Media list changes its count, so the rule must stay
generic rather than being keyed to a section.

**A living person's case states only what the cited reports state, dated.**
The Clavicular case (INFL-11, joined with INFL-12) gives what he has said
himself and the platform pay that was reported, and it states the September
2026 charges as charges, with his spokesperson's denial. A charge is never
written as a finding. If an outcome is reported later, update the line from a
new source, through the overrides file, with a why.
