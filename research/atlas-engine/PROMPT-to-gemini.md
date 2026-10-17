# PROMPT — send to the Gemini chat (the blueprint conversation)
# Saved here so any future session can re-send or adapt it.

You designed the expansion blueprint for my site earlier in this conversation:
the unified 330-year graph behind the five tabs, the 5-Stage Extraction Loop,
the ten-era master timeline (1694–2026), the Deep State OPERATOR-vs-LEDGER
pairing, the lineage cards, the free-API ingestion stack, and the 3-Agent
adversarial verification pipeline. Now stop designing and PRODUCE THE COMPLETE
IMPLEMENTATION.

I am pasting your output directly into my repo as the working scaffold, so
write real, complete, runnable code — not sketches, not summaries, not
"you would…" prose. One code block per file, each block headed with its full
path.

## GROUND TRUTH — MY REPO, AS IT EXISTS TODAY (binding; do not contradict or rename)

- Static site, hand-written HTML/CSS, vanilla JS. Deployed on Cloudflare
  Workers via `npx wrangler deploy` from the repo root (static assets + one
  Durable Object "Wire"). The site MUST stay static: no server-side rendering,
  no runtime database.
- Pages in `public/`: index.html, crash-conduits.html, carbon-class.html,
  deep-state.html, transhumanism.html, consent.html, 911-ledger.html,
  branches.html, web.html, blind-pool.html, climate.html,
  demystification.html, crawler-rules.html, handoffs.html.
- Per-page JS data in `public/js/`: crash-finance-data.js (exports
  `financialEngineeringNodes`, `auditedLegacyNodes`), carbon-class-data.js,
  carbon-ledger-data.js, consent-factory.js, deep-state.js, crash-note.js,
  venture-sprites.js, blind-pool.js.
- The atlas data lives INLINE in crash-conduits.html as
  `const nodes = [...]; const lineages = [...];` and is parsed by
  research/build-branch-index.mjs with exactly this regex:
  `const\s+nodes\s*=\s*(\[[\s\S]*?\]);\s*const\s+lineages\s*=\s*(\[[\s\S]*?\]);`
- Entity convention: aliases seeded in `research/entities.seed.json` →
  `node research/extract-entities.mjs` → `public/data/entities.json`
  (generated output — NEVER hand-edited). Entity dossiers:
  `research/findings/<id>.json` (52 today).
- Per-page source registries already exist:
  research/deep-state-sources.json, research/consent-sources.json,
  research/blind-pool-sources.json, research/demystification-sources.json,
  research/consent-hollywood-influencers-sources.json, research/rejected.json.
- The audited research record for the 9/11 cluster is
  research/911-foreknowledge-record.md (sections A–L), research/wtc-vault-record.md,
  research/apollo-krongard-web.md, research/cantor-absorption-web.md,
  research/CRASH-AUDIT.md. Those dispositions
  (PROVEN / DOCUMENTED / REC-COLLECTION / OPEN) are the SOURCE OF TRUTH for
  9/11-era dossiers: the new master dataset INHERITS them and must never
  overwrite them with looser framings.
- House style for tooling: plain Node ESM scripts under research/, tests run
  with `node --test <file>.mjs`.
- Acceptance gates that MUST pass after every phase:
  `node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs`
  and `node research/check-links.mjs` (0 dead links).
- Theme tokens already defined on the pages as CSS custom properties:
  --ink, --ink-2, --rule, --rule-2, --note, --note-dim, --gold, --gold-dim,
  --red, --paper, --text, --muted, --faint, --pixel; class vocabulary in use:
  .act, .act-head, .act-num, .stamp (with tier modifiers), .verdict, .cite,
  .entry-ref, .dek, .wrap. New UI must reuse this banknote aesthetic.

## DELIVERABLE 0 — file tree
The complete tree of EVERY file you will produce (under research/atlas-engine/,
research/ingest/, research/verify/, public/js/, public/data/), one line per
file saying what it is. Nothing outside this tree may be touched.

## DELIVERABLE 1 — the unified master dataset (all five tabs become filtered views of one graph)
- 1a. `research/atlas-engine/schema.mjs` — plain-JS schema module (no ORM,
  validation is enough for a static site): dossiers, entities, lineages,
  mechanisms, citations, bridges, paired-events. Full field definitions with
  JSDoc, an exported `validateAtlas(dataset)` that throws with precise
  messages, and fixture data for tests.
- 1b. `research/atlas-engine/master/atlas.json` — the master dataset seed:
  era nodes for the full ten-era timeline (1694 South Sea, 1769 Bengal,
  1815 Waterloo, 1845 Irish famine, 1861 Hall carbines, 1910–1915
  Jekyll/Titanic/Lusitania, 1929 BIS/IG Farben, 1953–1991 Cold War/BCCI/PROMIS,
  2001–2008, 2020–2026), plus flagship dossiers for each (CC-1912-IMM,
  DS-1915-LUSITANIA, DS-1912-TITANIC, CC-2001-WTC7, DS-2001-911,
  CC-2008-TARP, DS-1953-AJAX, DS-1982-INSLAW, CC-1914-MORGAN…), each with the
  5-stage extraction_loop fully populated and every claim carrying an evidence
  tier. Where you do not have a real resolvable source, write the literal
  token `{VERIFY: courtlistener docket}` — NEVER invent a URL.
- 1c. `research/atlas-engine/compile.mjs` — compiles master → per-tab slices
  for the five tabs AND regenerates the inline `const nodes/const lineages`
  block in crash-conduits.html plus the `financialEngineeringNodes` /
  `auditedLegacyNodes` exports in public/js/crash-finance-data.js, so
  build-branch-index.mjs and every existing test keep passing. Show the exact
  string surgery (regex boundaries, markers) — the regex above is load-bearing.
- 1d. `research/atlas-engine/migrate.mjs` — reads today's inline consts +
  public/js/crash-finance-data.js + research/findings/*.json +
  research/entities.seed.json + the audited record .md files and emits
  `master/atlas.json`. Idempotent; safe to re-run; logs a reconciliation
  report (counts in vs out, anything dropped and why).

## DELIVERABLE 2 — the free-API ingestion stack
`research/ingest/` — one provider module per API: courtlistener.mjs,
govinfo.mjs, congress.mjs, hansard.mjs, loc.mjs (Chronicling America),
edgar.mjs, usaspending.mjs, wikidata.mjs, opencorporates.mjs. Each provider:
exact endpoint URLs, auth (free keys only, read from environment variables /
a gitignored .env file), rate-limit handling with backoff, a query builder for
seed topics, the response→citation-row mapping, and a disk cache under
research/ingest/cache/ (gitignored) so runs are idempotent. CLI:
`node research/ingest/ingest.mjs --topic "1915 Lusitania" --year 1915 --providers courtlistener,hansard`.
Offline mode: network failure must emit citation rows with {VERIFY} tokens,
never crash, never fabricate.

## DELIVERABLE 3 — the 3-agent adversarial pipeline
`research/verify/`: three prompt templates — prosecutor.md,
devils-advocate.md, forensic-auditor.md — plus runner.mjs that reads a dossier
draft, runs the three stages (OpenAI-compatible endpoint from env vars, or
`--print` mode that emits the prompts for local/offline use), writes only the
claims that survive, quarantines failures to research/leads/, assigns evidence
tiers. Encode the rule: LEAD_ANOMALY items never render on public pages;
nothing reaches public/ without passing this pipeline AND check-links.mjs.

## DELIVERABLE 4 — the UI upgrades (complete code, matching the existing aesthetic)
One new stylesheet `public/atlas-ui.css`, linked from the five tabs, reusing
the existing custom properties and class vocabulary listed above. Then:
(a) dossier drawer rendering the 5-Stage Extraction Loop as the tree
mockup you drew (├── 1. PRE-SHOCK EXTRACTION … └── 5. THE "LORD MERSEY" FIX);
(b) mechanism filter taxonomy expanded 8→10 with the new mechanisms
(receivership/"Morganization" bust-outs, cost-plus disaster reconstruction
monopolies, patent suppression/stolen-tech choke points, liability
shield/whitewash);
(c) recurring-participants index upgraded to LINEAGE CARDS with
predecessor chains (George Peabody → J.S. Morgan → J.P. Morgan → Bankers
Trust → Deutsche Bank; Mersey; Strong; Dulles; Krongard; Lutnick; Karp/Thiel);
(d) cross-conduit bridge badges at the foot of each dossier
([→ Carbon Class …] [→ Deep State Dossiers …] [→ Manufacturing Consent …]);
(e) the PAIRED-EVENT FLIP between deep-state.html and crash-conduits.html
(⇄ button, same year, other page's dossier);
(f) evidence-tier badges (TIER 1–4 + LEAD, with LEAD never public);
(g) the adversarial-audit "THE DECOY VS. THE LEDGER" callout box.
Vanilla JS only. Give complete files or exact edits — never prose
descriptions of what code should do.

## DELIVERABLE 5 — the node-complete plan (the part I follow to completion)
- 5a. Canonical node taxonomy: ERA, DOSSIER, ENTITY, LINEAGE, MECHANISM,
  CITATION, BRIDGE, PAIRED_EVENT, DECOY. For EACH type: required fields,
  one fully-populated example instance (real data, not lorem), which
  providers seed it, which agent pass verifies it, which page/section renders
  it, and completion criteria as a checkbox list.
- 5b. `research/atlas-engine/nodes.manifest.json` — machine-readable manifest:
  every node type with required fields and a per-instance template row.
- 5c. `research/atlas-engine/STATUS-LEDGER.md` — the status ledger I tick
  instance by instance: one row per planned node instance (start with the ~40
  you named across the ten eras + the existing 52 findings dossiers to fold
  in), columns: node code / title / evidence tier / providers / verify-pass /
  UI-wired / done.
- 5d. Phase plan 0..N: per phase — files touched, commands to run, and the
  acceptance test that proves the phase complete. Order so every phase ends
  with the gates green and the site deployable.
- 5e. `research/atlas-engine/next.mjs` — driver that prints the next
  incomplete node from the manifest and its checklist, so any future session
  can pick up the thread with zero context.

## HARD RULES (binding; violate one and I reject the output)
1. NO invented citations. A URL is either a real API endpoint pattern or the
   literal token `{VERIFY: …}` for the pipeline to resolve. Nothing enters
   public/ without passing the verification pipeline AND check-links.mjs.
2. Evidence tiers are load-bearing: TIER_1_STATUTE_COURT, TIER_2_INQUIRY,
   TIER_3_PRIMARY_LEDGER, TIER_4_CONTEMPORARY_PRESS, LEAD_ANOMALY. LEAD items
   never render on public pages. The 9/11 dossiers inherit the existing
   audited dispositions verbatim.
3. The site stays static, the deploy command is unchanged, existing URLs do
   not break, and build-branch-index.mjs plus every existing test keep passing
   after every phase.
4. House style: plain Node ESM .mjs, vanilla JS in pages, no frameworks. No
   new runtime dependencies on the deployed site; research tooling may add dev
   dependencies but must justify each.
5. Format: one section per deliverable, complete code blocks, each block
   headed by the full file path. No prose where code belongs.
6. If you run out of output room, end with
   `CONTINUATION MARKER: <next deliverable>` and I will say "continue".

Begin with Deliverable 0, then proceed in order. Write the actual code.