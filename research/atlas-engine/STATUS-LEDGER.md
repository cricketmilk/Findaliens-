<!-- research/atlas-engine/STATUS-LEDGER.md
     Extracted verbatim from research/atlas-engine/gemini-blueprint.md (Deliverable 5c),
     captured 2026-10-14 from the Gemini chat e214133bdf97d068.
     Blueprint TARGET state — DONE/verify-pass claims describe the planned atlas build,
     not the current repo.
     ACTUAL 2026-10-14: Phase 0 infrastructure complete — schema.mjs, compile.mjs
     (imported only, not run), migrate.mjs run with 0 schema errors (68 inline nodes
     merged → 84 dossiers; 123 seed + 6 atlas + 11 findings entities = 134;
     0 dropped). Windows main-guard and seed-shape bugs fixed in migrate/compile.
     ACTUAL 2026-10-14: Phase 1 compile run — public/data/atlas-public.json written
     (84 public dossiers, LEAD_ANOMALY/OPEN stripped). LEGACY SURGERY GATED OFF:
     crash-conduits.test.mjs pins nodes.length === 86 / unique ids / classic-script
     crash-finance-data.js (`export` = SyntaxError in vm + plain <script src>), and
     inline nodes carry `id` not `code` — a bare merge would append 84 atlas-shaped
     duplicates and fail tests 35/36/56. compile.mjs defaults to atlas-public.json
     only; --legacy-surgery exists for when the additions dataset and test contract
     move onto the atlas shape. Gates: compile OK, build-branch-index 68/68 filed,
     tests 40/40 pass, check-links 614 ok / 121 blocked (pre-existing) / 0 dead.
     ACTUAL 2026-10-14: Phase 2 extracted — research/ingest/ (cache/.keep +
     9 providers + ingest.mjs runner: offline {VERIFY} fallback verified end-to-end,
     Windows main-guard fix applied) and research/verify/ (prosecutor.md, devils-advocate.md,
     forensic-auditor.md + runner.mjs: offline gate mode and --print mode verified, same
     main-guard fix). research/atlas-engine/next.mjs extracted with the same fix: run
     green (84/40 dossiers, next incomplete node DS-1720-WALPOLE identified).
     ACTUAL 2026-10-14: Phase 3 extracted — public/atlas-ui.css (a-g sections) +
     public/js/atlas-ui.js (mountAtlasUI + renderers; ESM, gracefully no-ops without
     [data-atlas-*] hooks per the phase plan: no page wiring in Phase 3). extract-entities
     re-run (243 entries, 751 entities). Acceptance: tests 40/40, check-links 0 dead,
     npx wrangler deploy --dry-run reads all 107 public/ files, bundle builds, exit 0 —
     static bundle deploy-ready.
     ACTUAL 2026-10-14: per-node loop made drivable — nodes.manifest.json carries a
     "topic" field per PENDING entry (24/24, derived from the 5d ledger titles; the
     recipe's --topic "<code>" could never match a real debate), next.mjs prints
     pending.topic with fallback to the code. LIVE HARVEST PROVEN: Hansard mapping
     fixed (API returns Contributions[] not Results[]; Contributions carry ItemId,
     AttributedTo, SittingDate, House, DebateSection, ContributionText[Full]) — the
     pre-fix mapping silently discarded every real row. Marconi scandal 1913 harvest
     returns Lord Robert Cecil's New Marconi Agreement amendment (1913-08-08),
     Lyttelton/Markham/Bonar Law (1913-06-19) — the exact DS-1913-MARCONISCANDAL
     debates. CourtListener v4 verified live: LIBOR antitrust opinions with real
     resolvable URLs. hansard.parliament.uk sits behind a Cloudflare challenge (403
     to scripts AND the agent jar) so the /debates/<extId> URL form stays UNVERIFIED:
     hansard rows carry {VERIFY} URL tokens until a person confirms the form by hand.
     govinfo/loc/edgar/usaspending/wikidata/opencorporates mappings remain
     blueprint-verbatim, shape-UNVERIFIED against live APIs (same Results-vs-real-key
     bug class possible). Gates: tests 40/40, check-links 0 dead. The dossier rows
     below remain TARGET state until the per-node loop (next.mjs recipe) runs.
     ACTUAL 2026-10-14: all 9 providers live-smoked (4 bugs fixed: govinfo id
     granuleId vs packageId + USREPORTS tier-1; congress honest {VERIFY} without
     CONGRESS_API_KEY; wikidata entity URIs https; loc repointed to loc.gov
     search + 30s timeout — see session ledger). probe-provider.mjs added (raw
     response probe, read-only). FIRST SWARM-DRAFTED BATCH MERGED: CC-2012-LIBOR,
     PH-2001-ESPEED, CC-1991-BCCI, CC-1930-BIS drafted via swarm (glm-5.3) from
     operator-vetted citations only, gate-passed with 0 quarantined citations,
     merged into master/atlas.json by string-splice (merge-drafts.mjs; 88
     dossiers, 41 citations). Relevance vetting: govinfo full-text matches are
     bag-of-words (BIS query returns Shanghai "International Settlement" cases;
     BCCI query returns telemarketing-fraud reports) — operator topical vetting
     is mandatory before citing govinfo rows; none were cited from this batch.
     PH-2025-IMMIGRATIONOS stays PENDING: usaspending keyword search does not
     surface the ICE ImmigrationOS award (only other vendors' ICE awards and
     DoD IDIQ orders — not ICE evidence). CC-1929-CALLMONEY stays PENDING: loc
     returns 0 newspaper hits for "call money" 1928-1930, even via the
     fa=original_format:newspapers facet; needs different search craft
     (e.g. "broker loans"). Gates: compile OK (88 public dossiers), tests
     26/26, check-links 735 URLs 0 dead (default scan). NOTE: a check-links run
     on master/atlas.json itself shows 1 PRE-EXISTING dead URL —
     info.publicintelligence.net/KerryBCCI.pdf (predates this batch; govinfo
     search yields no S.Prt.102-140 replacement; needs a human-verified URL).
     ACTUAL 2026-10-14: AUTONOMOUS POPULATE BUILT — research/atlas-engine/populate.mjs
     (status machine PENDING -> HARVESTED -> DONE | BLOCKED:<reason>; --node/--status/
     --finish) + auto-vet layer (AND-semantics strong tokens for usaspending/govinfo/
     edgar/opencorporates; wikidata bare-Q-id + label test; {VERIFY} never reaches a
     spec; tier-priority cap 8) + manifest query expansion (all 20 PENDING carry
     queries[] with provider-adapted variants; anchors[] where hand-written).
     PROVEN END-TO-END on CC-1982-AMBROSIANO: harvest (4 vetted wikidata entities,
     10 dropped incl. every hansard {VERIFY} row) -> auto-emitted spec -> swarm draft
     (glm-5.3, $0.006) -> operator review -> gate (0 quarantined) -> merge-drafts ->
     compile -> DONE. 89 dossiers, 45 citations. Gates: tests 26/26, atlas check-links
     40 URLs 27 ok / 0 new dead (12 sec.gov bot-wall blocked, 1 pre-existing dead).
     Flow for the remaining 19: node populate.mjs (harvest+spec) -> swarm the specs ->
     populate.mjs --finish (gate+merge+compile+flip) -> hand-file ledger rows.
     ACTUAL 2026-10-15: 12-NODE HISTORICAL BATCH MERGED — WALPOLE, BENGAL,
     COURIER, PLIMSOLL, RAILROADS, WARDENCLYFFE, STEERAGE, HALIFAXFOG,
     MARCONISCANDAL, AJAX, THEMIS, IMMIGRATIONOS. Wikidata legs added to 7
     hansard-dependent nodes so they harvested keylessly; ESTATES stays
     hansard-only 0-entity (parked on the human hansard unlock). Drafts
     swarm-written (glm-5.3) from long-template prompts; citations NEVER
     transcribed — a mechanical inject script forced each draft's citations
     and fixed fields from spec-<code>.md (all 12 byte-identical to spec at
     verify). A first inject run had a yearEnd regex bug (spec writes
     'yearStart: X, yearEnd: Y' on ONE line) that null-then-repaired every
     yearEnd — fixed and re-run; RAILROADS window hand-pinned 1893-1895
     (yearEnd lost when its 1895 query leg was pruned from the manifest).
     HALIFAXFOG: spec fixed primaryTab 'consent' (draft had crash-conduits),
     secondaryTabs ['crash-conduits','deep-state'] (consent invalid as a
     secondary under the spec's option list). AJAX eraId corrected to
     ERA-08-1953. HARVEST NOISE DEDUPED (verified against the live Wikidata
     API, labels+descriptions): BENGAL dropped the 1943 famine (Q522837),
     the Bengal-famine disambiguation page (Q4887665), Dutch VOC (Q159766,
     Q2191443), EIC College (Q142599), duplicate EIC row; STEERAGE kept only
     the ship (Q25173) — dropped the 1997 film (Q44578), 1943 film, German
     magazine; WALPOLE kept only Robert Walpole (Q104190) — all five 'South
     Sea Bubble' rows are derived works (1928 film, Coward play, painting,
     short story), plus two town Walpoles dropped; COURIER kept Battle of
     Waterloo (Q48314) + Rothschild family (Q159386) — dropped the ABBA song
     (Q32503), two towns, London district, Ontario municipality, and both
     Rothschildia MOTH/butterfly rows; PLIMSOLL kept only the man (Q333611)
     — dropped two paintings and the 1873 clipper ship. Drafts AND specs
     updated together; no dropped id was referenced in any dossier body.
     RESULT: --finish merged all 12 with 0 quarantined; atlas at 101 public
     dossiers / 169 merged nodes / 8 lineages (the earlier '95' compile
     claim was stale — 89 was the true pre-batch count). Gates: tests 26/26,
     check-links 735 URLs, 614 ok / 121 bot-wall blocked / 0 dead (the
     KerryBCCI.pdf dead link is now green again). Ledger rows below flipped
     by hand from the --finish templates. STILL OPEN: INQTEL parked — its
     harvested SEC rows are Palantir Capital Inc (CIK 1034643), a homonym,
     NOT Palantir Technologies (CIK 1321655); needs re-harvest against the
     right CIK. BLOCKED (0 vetted citations): JEKYLL, CALLMONEY, PBSUCCESS,
     PETRODOLLAR, LOGCAP — need query re-crafting or new providers; ESTATES
     needs the human hansard unlock.
     ACTUAL 2026-10-15: INQTEL FIXED AND MERGED — the homonym was structural:
     edgar query "Palantir" year 2003 can only ever hit Palantir Capital Inc
     (CIK 1034643); Palantir Technologies (CIK 1321655) filed nothing until
     2020. Re-crafted queries: (1) edgar '"In-Q-Tel" "Palantir
     Technologies"' year 2020, strong ['palantir technologies'] — hits
     exactly one 2020 doc: the S-1 exhibit 4.2, the Amended and Restated
     Investors' Rights Agreement with In-Q-Tel, Inc. as signatory investor
     (accession 0001193125-20-244936); 2021-22 SPAC comp-filings return but
     are vet-dropped (entity names lack the strong token); (2)+(3) wikidata
     legs 'Palantir Technologies' (Q2047336, + France subsidiary Q63380917)
     and 'In-Q-Tel' (Q3109467). Platform fix: edgar.mjs hits.slice(0,5) was
     cutting the Palantir row off at rank 6 behind five Supernova SPAC rows
     — raised to 20 (vet still filters; populate caps at 8 post-vet); the
     ingest cache keyed edgar::topic::year served the stale 5-row result
     until the entry was deleted. Window is now 2003-2020 (seed year vs
     year of documentary proof) — deliberate. Draft narrative swarm-written
     (qwen3:14b local lane; the glm-5.3 api lane and repeat calls were
     unavailable this round — swarm tool rejected parameter-bearing calls),
     operator-tightened, citations mechanically injected from spec. Gate
     passed, merged: atlas at 102 public dossiers / 170 merged nodes.

     ACTUAL 2026-10-14: ALL 5 BLOCKED NODES UNBLOCKED AND MERGED. Probes
     first: usaspending legs return only {VERIFY} fallbacks (dropped —
     useless); loc 'broker loans' and govinfo full-text legs land only
     irrelevant Serial-Set rows (vet drops); wikidata legs harvest clean on
     real labels. Re-crafted queries: wikidata legs per node on proven entity
     labels (JEKYLL: Aldrich–Vreeland Act / National Monetary Commission /
     Nelson W. Aldrich; CALLMONEY: Benjamin Strong / Montagu Norman;
     PBSUCCESS: 1954 Guatemalan coup / United Fruit / Jacobo Árbenz;
     PETRODOLLAR: petrodollar recycling / William E. Simon; LOGCAP:
     Halliburton / KBR / Brown & Root), govinfo/loc/usaspending legs kept.
     Curated 5-item anchors for all 5 (were 0 — drafting from anchorless
     specs is the fabrication risk anchors prevent). Post-harvest dedupe
     (verified against the live Wikidata API): JEKYLL dropped Aldrich House
     (Q14709447) + the NYT obit item re Aldrich Jr. (Q123486674); CALLMONEY
     dropped the Gari-Melchers painting + 2 other homonym Benjamins
     (Q47512368/Q94502486/Q105257928); PBSUCCESS dropped Árbenz's son
     (Q6119696) and accepted that United Fruit Company (Q1771942) has NO
     English label in Wikidata (only 'American corporation' description) —
     the bare-Qid vet rule correctly keeps labelless entities out; the UFC
     Infrastructure item (Q65591387) stands in. PETRODOLLAR dropped Simonds
     (Medal of Honor homonym Q2578591) + Simon School/Prize derived items
     (Q8008308/Q8008309). LOGCAP dropped both Halliburton Field airport
     items (Q5642957/Q7966003), the wikinews article item (Q17657442), and
     the Brown & Root v. Chimo Shipping SCC case item (Q125280567). Swarmed
     all 5 drafts on z-ai/glm-5.3 (fast lane, prefer:api, $0.03 total),
     schema-correct in one pass; citations+fixed fields mechanically
     injected from spec (tmp-inject5.mjs, deleted); gate passed; --finish
     merged 5 with 0 failures: atlas at 107 public dossiers / 175 merged
     nodes / 8 lineages. ESTATES remains the only BLOCKED node (human
     hansard unlock). NOTE: the swarm tool DOES accept parameter-bearing
     calls (inputs+template worked) — the earlier 'rejected parameter-
     bearing calls' diagnosis was my own empty-params serialization, not
     the tool.

     ACTUAL 2026-10-14 (later): ESTATES RETRIED OFF-HANSARD AND MERGED — THE
     QUEUE IS NOW 40/40 DONE. Owner said retry. Probes found: wikidata
     'Encumbered Estates' lands the court itself (Q5375634, label "Encumbered
     Estates' Court" — note the apostrophe is AFTER 'Estates' so token
     'encumbered estates' still substring-matches); wikidata 'Great Famine'
     + strong ['great irish famine'] keeps only Q188371 (Holodomor, the
     1315-17 famine and the Chinese famine rows all vet-dropped); wikidata
     'Landed Estates Court' 1858 returns the successor statute Q106363655
     plus the 1861 (Q106374868) and 1866 (Q106406833) acts — both dropped in
     dedupe as beyond the deliberate window; loc full-text search works: US
     newspapers that reprinted the Irish estates news (National Intelligencer
     June 1849 and Keowee Courier April 1850 kept; Abbeville banner, Lancaster
     Gazette and the weaker rows dropped). loc rows pass vet by construction
     (topic string sits in quoteOrFact) so they are treated as TIER_4 press
     evidence, supplementary to the wikidata entities. WINDOW DELIBERATELY
     1849-1858 (seed court vs successor consolidation act), same precedent as
     INQTEL's 2003-2020. Query order was crafted so the MAX_CITATIONS=8
     tier-stable cap kept exactly the intended press rows. Swarm tool
     serialization glitch returned (10 consecutive empty-params failures),
     so the ESTATES draft was operator-written per the INQTEL precedent,
     grounded strictly in the 5 spec anchors, citations + fixed fields
     mechanically injected from spec (tmp-inject-estates.mjs, deleted).
     Gate passed, merged: atlas at 108 public dossiers / 176 merged nodes /
     8 lineages; queue 40/40 DONE, zero BLOCKED. Hansard remains available
     as a future enrichment leg if the human unlock ever happens, but the
     node no longer depends on it.
     ACTUAL 2026-10-15: ESTATES HANSARD UNLOCK ARRIVED; RE-HARVESTED AND RE-MERGED
     AS TIER_2. The Wilds (a real browser) cleared the hansard.parliament.uk
     Cloudflare challenge that 403s scripts: the site's own search links gave the
     live URL form /<House>/<YYYY-MM-DD>/debates/<DebateSectionExtId>/<slug>?highlight=<query>#contribution-<ContributionExtId>,
     end-to-end verified by constructing URLs and rendering the real pages
     (Lords 1858-05-11 third reading; Lords 1858-08-02 prorogation). hansard.mjs
     patched to emit the verified form ({VERIFY} kept only as a shape-change
     fallback); 13 stale hansard cache entries deleted. Probe-verified legs year
     1855 (window 1855-1858; year 1858 drifted to 1861 rows): q 'Encumbered
     Estates' strong ['encumbered estates'] -> VANCE (Commons 1858-07-13, new
     commissioners of the Encumbered Estates Court) + MALINS (Commons 1858-06-24,
     Sale and Transfer of Land (Ireland) Bill committee); q 'Incumbered Estates'
     strong ['incumbered estates'] (period spelling needed its own leg) -> the
     1858-08-02 Lords prorogation speech ('Transfer of Land Bill ... extends the
     Powers hitherto exercised by the Incumbered Estates Commissioners'). 8
     vetted (9 dropped): 3 TIER2 hansard + 5 TIER3 wikidata (court Q5375634,
     famine Q188371, acts 1858/1861/1866); the tier-stable 8 cap displaced the 2
     LOC press rows — deliberate: primary parliamentary record outranks
     contemporary US press reprints; draft narrative rewoven off the dropped
     press citations onto the parliamentary record; 4 new anchors (incl.
     Cranworth/St Leonards third-reading claims kept as speakers' claims).
     MY BUG THIS ROUND: --finish's merge-drafts.mjs was append-only, so the
     re-merge DUPLICATED ESTATES (109 dossiers) and 3 wikidata citations. Found
     by compile count (108 expected vs 109); deduped master byte-surgically
     (108/101, one ESTATES, TIER_2, 0 VERIFY); merge-drafts.mjs now replaces on
     remerge (faithfulness gate aborts on any byte-mismatched cut target;
     legacy entries predate the serializer and are never cut), proven
     idempotent: re-running the merge on the same draft is byte-identical.
     Gates: tests 26/26, check-links 735 URLs 0 dead. Hansard is now a fully
     unlocked provider for all future nodes.
     ACTUAL 2026-10-15: ATLAS PAGE WIRED (Phase 3.5 — the wiring Phase 3 deferred).
     The operator could SEE nothing of the atlas because the blueprint's Phase 3
     extracted atlas-ui.css + atlas-ui.js with, per its own acceptance note,
     'no page wiring in Phase 3' — the [data-atlas-*] hooks existed in no page,
     and the shell loads this app as kind:"static" = file://, where Chromium
     blocks both ES modules and fetch (so even a wired page stays empty in the
     in-app view; the atlas data needs http). New public/atlas.html: Gazette
     house boilerhead (fonts, :root tokens copied verbatim from
     crash-conduits.html, masthead nav with Atlas marked aria-current) + the
     three mount hooks (aside[aria-label="Dossier"] with .atlas-dossier-body
     as its last child div per the div:last-child mount contract,
     [data-atlas-lineages], [data-atlas-mechanisms]) + atlas-ui.css + module
     js/atlas-ui.js, plus two additions of its own: a dossier index (the one
     piece atlas-ui.js renders nowhere — all 108 public dossiers sorted by year,
     LEAD_ANOMALY excluded, links riding the same #code hash routing) and a
     file:// fallback note (classic script: no .atlas-lineage-grid after 2s ->
     reveal the http/server note, which the module path can never show).
     Legacy pages NOT touched: index.html/deep-state.html/crash-finance-data.js
     carry pre-existing unstaged changes (ownership), and crash-conduits.html
     pins its inline atlas script in tests. VERIFIED END-TO-END (throwaway
     Playwright probe driving a tmp static server rooted at public/, deleted
     after): 17/17 — pills ALL+10, 8 lineage cards, inspector auto-opens
     dossier[0] CC-1720-SOUTHSEA w/ tier stamp, fetch hits /data/atlas-public.json,
     index 108 rows, #CC-1849-ESTATES hash routing + active marking, mechanism
     pill + index link clicks swap the inspector, file:// mounts nothing and
     reveals the fallback note. Gates: crash-conduits tests 26/26, wrangler
     dry-run exit 0. Live at /atlas.html after `npx wrangler deploy`, which
     stays the operator's call.
     ACTUAL 2026-10-15: ATLAS PAGE REDESIGNED TO THE BANKNOTE BRIEF (art
     direction from the operator's Gemini thread, round 2 — closing message
     landed, thread left alone). Atlas before: 9,778px of page scroll with
     the whole index inline; after: 3,528px. CHANGES, all page-local in
     public/atlas.html (no tab page touched — grep proved only atlas.html
     links atlas-ui.css, so the skin rides shared classes): era-first ticker
     bar under the masthead (35 era codes, 64s marquee, off on
     prefers-reduced-motion); banknote-framed head (double-inset hairline,
     ink-2 field, gold corner denominations 108/Ω, red serials
     CC·1636A·2026 / 330-YEAR LEDGER); index ledger grouped under 35 sticky
     era headers with 4-col rows inside a 720px capped scrollbox with its
     own scrollbar (the 6,196px index scrolls inside it); asymmetric grid
     minmax(320px,1fr) minmax(420px,1.25fr) with a sticky inspector column;
     atlas-ui.css linked BEFORE the page style block so page overrides win.
     COHERENCE BUGS FIXED: (1) atlas-ui.css line 19 declares
     --paper: var(--paper, #161813) expecting dark, but the Gazette token is
     --paper: #e9efe9 (light), so every atlas-ui mounted panel rendered
     LIGHT on the dark site — fixed by scoping --paper: #161813 onto the
     three mount containers in atlas.html (page-local; no test pins the CSS,
     no tab page consumes it). (2) the index is year-sorted but atlas-ui
     auto-opened its own array order, so the marked first row (CC-1636-TULIP
     by year) disagreed with the shown dossier (CC-1720-SOUTHSEA by array);
     fixed with a no-hash default of '#'+dossiers[0].code so first paint
     agrees. ART (FLUX.2 Klein via OpenRouter image API, black-forest-labs/
     flux.2-klein-4b, C:\Forge\config.json models.fast): public/img/
     atlas-seal.jpg (1024px guilloche seal, 112px, half-cut on the frame's
     bottom edge) + atlas-vignette.jpg (1600x683 intaglio cornfield, 15%
     cover layer behind the title); corners pure black to blend into ink;
     key read from config at runtime, generated via throwaway atlas-art.mjs
     (deleted); preload + og/twitter meta added. NOTE: *.jpg is
     repo-ignored (.gitignore line 5, maizey-carbon.jpg precedent) so the
     art lives on disk only — it ships in deploys from this machine (dry-run
     read 110 public files incl. both) but is NOT in git; force-adding is
     the operator's call. Gates: functional probe 21/21 (pills, cards, 108
     rows, 35 era headers, ticker, sticky headers, hash routing, seal/
     vignette loaded), node --test crash-conduits from-trove 37/37,
     wrangler dry-run exit 0. Deploy stays the operator's call. -->

<!-- ACTUAL 2026-10-15 (later the same day): BANKNOTE SKIN ABANDONED FOR
     THE CLEARING'S INK. The operator pasted a reference image (the pasted
     upload landed in C:\Forge\data\uploads\1198ead7e85b128c.png); vision
     (gemini-2.5-flash via the OpenRouter key, throwaway describe script,
     deleted) identified it as THE CLEARING — the pixel-art hero of
     public/deep-state.html: canvas #eye rendered by public/js/deep-state.js
     (Bayer 8x8 dither, GLITCH palette, ink-dripping pyramid eye, glitch
     road, square-outline forest edge, 50ms ticker honoring reduced-motion).
     The atlas was re-skinned to that ink. CHANGES: (1) NEW
     public/js/atlas-art.js (~275 lines): a DOM-free cornField() core — the
     corn sibling of the Clearing (row-banded stipple, stalks/tassels,
     square outlines, glitch pixels, two bobbing $-coins, eye pyramid,
     drips, road) mounted onto #atlas-hero via globalThis.__atlasArt.cornField
     (repo package.json is type:module, so the export rides globalThis),
     50ms ticker, pointer aim, tap->tear. (2) public/atlas.html re-skinned:
     tokens -> --ink #050505 / --well #0e0e0e / --panel #141414 / --line
     #262626 / --line-2 #333 / --cyan #00f0ff / --cyan-dim #0b8b9b / --magenta
     #ff2fd0 / --red #ff3355 / --paper #fff / --read #d9d9d9 / --text #e6e6e6 /
     --dim #a3a3a3 / --mute #767676 (gold and green gone); canvas
     image-rendering: pixelated; banknote frame -> figure.print + canvas
     #atlas-hero + caption; h1 white with -3px cyan / +3px magenta split;
     index tiers T1 cyan / T2 magenta / T3 read / T4 mute; mounts scoped
     --paper: #141414; the two FLUX jpgs removed from markup and preload,
     og:image -> the rendered PNG (see 4). (3) TOKEN-COLLISION FIX: the
     mount-scoped --paper (#141414, which makes --paper mean "dark panel"
     where atlas-ui expects light) ate two rules that reached for it from
     inside the mounts — .atlas-mech-pill:hover/aria-pressed rendered dark
     (its "invert to paper" bg came back dark) and .atlas-lineage-title
     rendered #141414-on-#141414 invisible; both now use literals #ffffff /
     #050505, and the probe grew a lineage-title contrast assertion so the
     miss cannot recur. (4) NEW public/img/atlas-og.png (1200x720, 39,264 B):
     rendered from the same cornField core (x5 nearest-neighbour, minimal
     PNG encoder, throwaway script, deleted) — ink 45.1% / paper 41.3% /
     colour 13.6%. PNG is NOT git-ignored, so the art is committable and
     the banknote entry's "disk-only art" concern is dissolved. The two
     unreferenced jpgs (atlas-seal.jpg, atlas-vignette.jpg — grep found no
     markup reference, only this ledger's own prose) were DELETED: *.jpg is
     .gitignore'd (line 5), and they were still inside public/, i.e.
     shipping to the edge as dead assets (dry-run read 112 files incl.
     both; after deletion 110). Gates: functional probe 30/30 against a
     tmp static server rooted at public/ (page errors, hero canvas 280x162
     with 10 distinct colours, zero .jpg requests, 11 pills, 8 lineage
     cards, 108 rows, 35 era headers, ticker era-first, sticky headers,
     720px index scrollbox, hash routing incl. the _1636-suffixed first
     paint, RGB-split title, print frame + hard shadow, og:image, mount
     --paper, lineage-title contrast, art script 200, tap raises no
     error; the "scroll <4200" assertion was re-aimed: hero print is
     intentionally ~703px tall — the Clearing's own aspect — and the
     3,869px dossier column is atlas-ui's own ESTATES rendering, so the
     probe now measures the default-dossier page <5000 = 4427px);
     node --test crash-conduits from-trove 37/37; wrangler dry-run exit 0
     (110 public files). Throwaway scripts (tmp-serve/probe/measure/og.mjs
     in the repo root, tmp-vision-describe.mjs in C:\xixoxis) deleted.
     Legacy pages NOT touched (pre-existing unstaged changes elsewhere
     left unstaged). Commit by filename only: public/atlas.html,
     public/js/atlas-art.js, public/img/atlas-og.png, this ledger.
     Deploy stays the operator's call.
     ACTUAL 2026-10-17: SIX-NODE PRIVATE-FORCE / FORCED-TRADE BATCH MERGED —
     CC-1842-OPIUM, CB-1865-SULTANA, DS-1892-PINKERTON, CB-1914-LUDLOW,
     DS-1928-BANANA, DS-2007-BLACKWATER, taken from the operator's Gemini thread
     of 2026-10-15/16 (Titanic -> the IMM trust -> the Sultana -> the East India
     Company -> United Fruit -> Blackwater / Halliburton / Palantir). The cases in
     that thread the atlas already held — Bengal/EIC, IMM/Titanic, PBSuccess,
     LOGCAP, In-Q-Tel, the Business Plot — were NOT re-added; only the six gaps
     were, and the shape they share is the one the atlas was thinnest on: who
     holds the gun, and who pays for it.
     CITATIONS HAND-RESOLVED, not swarm-harvested. govinfo's DEMO_KEY rate-limits
     at roughly 40 requests an hour and loc.gov serves page OCR only to browsers
     (403 to scripts), so the providers were used as a search index and every URL
     was then opened and read before use — the ac8d030 standard. Each quoteOrFact
     records what its page shows AND what it does not: the two loc.gov issue pages
     say outright that their OCR was not read here. Sources: Treaty of Nanking
     Arts. IV-VII in Mayers 1877 on archive.org (read: "Six Millions of Dollars,
     as the value of the Opium which was delivered up at Canton"), Historic
     Hansard HC Deb 07 April 1840 vol 53 cc669-748, Berry's 1892 Sultana survivor
     volume (read: 2,141 aboard, "over six times her capacity", and the engineers'
     own caution that nothing yet showed the explosion "attributable to the
     imperfect patching"), H. Misc. Doc. 52-335 + H. Rept. 52-2447 + S. Rept.
     52-1105 from the govinfo Serial Set, West's Report on the Colorado Strike
     1915 (read: CF&I controlled "through ownership of approximately 40 per cent
     of its stocks and bonds") + H. Rept. 64-31, FRUS 1928 vol. II d655 (read:
     "postpone further action in the matter until the controversy can be
     judicially determined"), CHRG-110hhrg45219 "Blackwater USA" of 2 October
     2007, and CourtListener's Slough (31 December 2009) and Abtan (611 F. Supp.
     2d 1). Specs and drafts were emitted by one script from one object, so every
     draft's citations are byte-identical to its spec by construction rather than
     by a later inject pass. populate.mjs --finish gated all six with 0
     quarantined citations, merged and compiled.
     VERIFY PASS COLUMN: these six rows read GATE 0-QUAR, not 3/3 PASS. The
     deterministic forensic gate ran and quarantined nothing; the 3-agent
     adversarial audit did not run, and the row says so rather than inheriting the
     --finish template's wording.
     ERA MODEL WIDENED, by the rule set on 2026-10-15: a dossier sits inside the
     era it is tagged with, so the two holes the new years fell into were closed
     rather than the years bent. ERA-04 opens at 1826 and is retitled "Forced
     Trade & Famine Export: The Opium War Indemnity, the Irish Famine, Coffin
     Ships & Encumbered Estates", with the 1842 gunboat indemnity added to
     frameworkCreated. ERA-07 opens at 1918 and is retitled "Dollar Diplomacy,
     The 1929 Liquidity Plug, The BIS & The Standard Oil-IG Farben Cartel" — its
     own closedLoopMechanics already narrated the 1920s credit expansion, so the
     window now matches the story. No new era ids and no dossier re-pointing. The
     index still renders 10 sticky era headers, each era exactly once, in
     chronological order; the two new era-opening dossiers are CC-1842-OPIUM
     (1839) and DS-1928-BANANA (1928).
     NEW LINEAGE LIN-05-PRIVATE-FORCE — Pinkerton 1892 -> Ludlow 1914 -> United
     Fruit 1928 -> PBSuccess 1954 -> Blackwater 2007, five steps, spliced into
     master the same way drafts are. The atlas now carries 9 lineages (4 inline +
     5 master).
     TOOL FIX, merge-drafts.mjs normalizes CRLF on read. core.autocrlf=true checks
     master/atlas.json out with CRLF while every splice anchor and cut target in
     that script is written with \n, so on a fresh Windows checkout the merge
     aborts at "citations array anchor not found". It writes LF back, which is
     what the index already holds, so the fix carries no diff of its own.
     COUNTS: 114 public dossiers, 141 citations, 9 lineages, 182 merged nodes.
     atlas.html's three hardcoded tallies updated (108 -> 114 entries, eight ->
     nine lineages, and the print caption). extract-entities re-run: 389 entries,
     892 entities. Gates: node --test crash-conduits + audit-crash + from-trove
     38/38; check-links across the six drafts, 14 URLs, 12 ok / 2 blocked
     (loc.gov bot wall) / 0 dead; atlas.html served from public/ and measured in
     the browser — 114 index rows, 10 era headers each exactly once, 9 lineage
     cards, all six new dossiers rendering with their citations. Legacy pages and
     crash-finance-data.js untouched; legacy surgery stays off. Deploy stays the
     operator's call.
     ACTUAL 2026-10-17 (second batch the same day): THE FOUR GAPS THE GEMINI
     THREAD RAISED AND NOBODY BUILT — Bhopal, the racket thesis, Standard Oil on
     its own, and OceanGate. Built on a branch cut from the six-node private-force
     batch; that batch was NOT in this worktree's base (it was cut from b60f43a
     plus the Express-app cleanup), so claude/gemini-share-continuation-c721ba was
     merged in first. The merge was clean and kept this branch's deletion of the
     duplicate Express app, because that branch never touched src/.
     SAME STANDARD AS ac8d030 AND THE EARLIER 2026-10-17 ENTRY: providers are a
     search index only; every URL below was opened and read before it was cited;
     each quoteOrFact records what the page shows AND what it does not. Specs and
     drafts were emitted by one scratch script from one object per node, so the
     citations in each spec and each draft are the same objects — byte-identical by
     construction, verified by an assertion in that script rather than by eye.
     `CB-1984-BHOPAL` (ERA-08-1953, MERSEY_LIABILITY_WHITEWASH, TIER_1). Read three
     Second Circuit opinions in full on CourtListener: 809 F.2d 195 (1987), which
     sent the 145 consolidated actions to India on forum non conveniens and DELETED
     TWO of Keenan's three conditions — the consent to enforcement of a final Indian
     judgment and the Federal Rules discovery condition — then affirmed as modified;
     984 F.2d 582 (1993), which holds the individual victims lacked standing to
     challenge the settlement and which is the source for the Bhopal Act of
     29 March 1985, the Supreme Court of India's orders of 14-15 February 1989
     approving $470 million for "all litigations, claims, rights and liabilities",
     and Charan Lal Sahu (22 December 1989) upholding the Act; and 361 F.3d 696
     (2004) for the plant history and the 1982 UCIL pond-leakage documents. That
     2004 opinion also records a 1990 NEERI finding of NO soil or groundwater
     contamination from the ponds — a finding against the plaintiffs, written into
     the citation rather than dropped. indiacode.nic.in returns an Akamai edge error,
     so the 1985 Act is NOT cited directly; its operative effect is taken only as the
     two federal opinions state it. No per-victim figure is claimed: none was read.
     `DS-1935-RACKET` (ERA-07-1929, COST_PLUS_RECONSTRUCTION, TIER_1). The racket
     thesis and Butler's own testimony, deliberately NOT a second Business Plot —
     that stays at CC-1914-DUPONT_GM_1934 and is named in the decoy box as the thing
     this node is not. Read the Vinson-Trammell Act from the govinfo Statutes at
     Large granule (48 Stat. 503, ch. 95, 27 March 1934): s.3(b) caps profit at
     "10 per centum of the total contract price", with sworn contractor reports and
     books open to the Navy, the Treasury "and/or by a duly authorized committee of
     Congress". Read the Nye Committee's own 1935 naval-shipbuilding preliminary
     report (Senate committee print, GPO, archive.org scan of the Boston Public
     Library copy): profits "practically uncontrolled", the 1933-34 adjusted-price
     contracts "in effect, cost-plus contracts" and more profitable than wartime
     terms, the Navy never having examined private costs and making "no pretense of
     doing this", and the cap itself unenforceable "without a huge police force of
     accountants". PRECISION NOTE: the statute says 10 percent of contract price and
     the committee says 11.1 percent of cost; these are the same cap (10/90 = 11.1%)
     and the dossier says so rather than leaving them looking inconsistent.
     `DS-1911-STANDARDOIL` (ERA-06-1910, RECEIVERSHIP_MORGANIZATION, TIER_1).
     Standard Oil out of DS-1942-IGFARBEN and onto its own file. Read 221 U.S. 1
     (1911) on CourtListener through Harlan's separate opinion: the Sherman Act read
     "in the light of reason"; decree para.5 permitting distribution of the subsidiary
     stocks "among the shareholders of the Standard Oil Company of New Jersey"; the
     thirty-day compliance window held "too short" and extended to "at least six
     months"; the para.7 injunction that would have halted the subsidiaries'
     interstate commerce held wrongly awarded; para.6 construed to bar recreating the
     combination "by any device whatever" while preserving normal contracting; and
     Harlan concurring in the affirmance but dissenting from the rule of reason.
     Paired with FRUS 1914 Supplement d767, read in full: William H. Libby for the
     company asking the Secretary of State to "secure the assent of the powers
     engaged in the present conflict to the exemption from seizure and inquiry of
     vessels transferred to the American flag", on the precedent of the six American
     steamers of the International Mercantile Marine Company — which is CC-1912-IMM.
     No post-decree ownership percentage is asserted: the record read shows what the
     decree permitted, not who ended up holding what.
     `CB-2023-TITAN` (ERA-10-2020, MERSEY_LIABILITY_WHITEWASH, TIER_2). JUDGED AND
     BUILT, not padded: the node exists because two formal federal investigations
     closed in 2025 and both are readable. Downloaded and read the NTSB's Marine
     Investigation Report MIR-25-36 (DCA23FM036) for the probable cause verbatim, for
     the vessel particulars recording flag, port of registry, IMO number and
     classification society all "N/A" and the Titan "not registered in any US state,
     documented by the US National Vessel Documentation Center, nor inspected by any
     flag state", for the "mission specialist" framing out of OceanGate's own Project
     Execution Plan, and for the Board's footnote noting "OceanGate's intent to avoid
     safety oversight by assigning tasks to those paying to ride". Read the NTSB
     investigation summary page and the Coast Guard MBI press release of 5 August
     2025 (300-plus pages, 17 recommendations, chair Jason Neubauer: "This marine
     casualty and the loss of five lives was preventable"). Witness statements in the
     NTSB report — including the technician's "you can't just change the title of a
     person when you're receiving compensation" and the CEO's reported "buy himself a
     congressman" remark — are cited as statements the report records, not as Board
     findings. The MBI's Report of Investigation PDF on media.defense.gov is 403 to
     scripts and fires a download rather than rendering, so it was NOT read: the Coast
     Guard citation is the press release and its quoteOrFact says exactly that.
     Neither board determines liability and the dossier claims none.
     SOURCES OPENED AND THEN REJECTED (the part worth keeping): the govinfo harvest
     for Standard Oil returned five `Standard Oil Co. of New Jersey v. United States`
     hits that are customs and patent appeals (1928, 1941, 1945) plus a 1940 South
     Carolina tax case — none is 221 U.S. 1, pure bag-of-words, all dropped. The
     govinfo Congressional Record hit for 1935 is NOT about war profiteering; it is
     the Senate debating the Veracruz 1914 "battle of El Tejar" valour dispute. It is
     still cited, but only for what it actually shows: Butler's own sworn testimony to
     the Committee on Naval Affairs that his troops "could find no enemy" there,
     against General Russell's testimony of five or six hundred Mexicans — and the
     chairman of that committee was Park Trammell, whose name is on the profit cap.
     The citation says in terms that the page says nothing about war profits. The
     archive.org item `WarIsARacket` is metadata-dated 1935 / Round Table Press but
     its text is a later retyping (contents list, bullet biography, Butler's 1940
     death), and the other two candidates are an audio-collection entry with no text
     and a community upload, so NO verifiable 1935 scan of the book was found and the
     book is not cited or quoted anywhere. "Chairman Butler" in the Nye report is a
     shipbuilding officer, not Smedley Butler; two Nye hearings volumes (7.5 MB of
     OCR) contain zero occurrences of "Smedley", so the dossier does not claim he
     testified there. FRUS 1915's "Protection of American oil interests" file
     (documents 1228-1262) contains zero occurrences of "Standard Oil" across the
     whole 1.4 MB papers index, so no Standard Oil gunboat claim is made for Mexico
     in 1914-15 — the company's in-era request to the State Department is about its
     re-flagged tankers, and that is all the dossier says.
     VERIFY PASS COLUMN: these four rows read GATE 0-QUAR, not 3/3 PASS. The
     deterministic forensic gate ran on all four and quarantined nothing — no
     research/leads/ file was written for any of them — but the 3-agent adversarial
     audit did not run, and the rows say so rather than inheriting the --finish
     template's wording.
     NO NEW ERAS AND NO ERA WIDENING NEEDED: every yearStart falls inside its tagged
     era (1984 in ERA-08, 1934 in ERA-07, 1909 in ERA-06, 2023 in ERA-10).
     CB-1984-BHOPAL's yearEnd of 2004 reaches past ERA-08 the way DS-2007-BLACKWATER's
     2020 reaches past ERA-09, and for the same reason: the closure is the point of
     the node. The index still renders 10 era headers, each exactly once, in order.
     COUNTS: 118 public dossiers, 152 citations, 9 lineages, 186 merged nodes.
     atlas.html's hardcoded entry tallies updated (114 -> 118 in the og:description,
     the print caption and the page dek); lineages stay at nine. extract-entities
     re-run: 393 entries, 922 entities. Gates: npm test 38/38 pass; check-links over
     the four new drafts, 11 URLs, 10 ok / 1 blocked / 0 DEAD — the block is
     news.uscg.mil returning 403 to automated requests, a page read by hand in the
     browser. atlas.html served from public/ and measured in the browser: 118 index
     rows, 10 era headers each exactly once, 9 lineage cards, and CB-2023-TITAN
     opened to confirm all three citation links and the quoted findings render.
     The default check-links run over handoffs + findings reports 735 URLs,
     608 ok / 126 blocked / 1 DEAD: https://weforum.org/people/ken-howery, held in
     research/findings/ken-howery.json and three findings-audit snapshots. That is
     pre-existing and belongs to the findings system, not to this batch, and is
     left for whoever owns that record rather than silently repaired here.
     THREE SPECIFICS CUT ON A SECOND PASS, before the drafts were final: Union
     Carbide's head office as "Danbury" (the opinions call UCC "a New York business
     corporation" and Danbury was never read), the Titan's implosion depth as
     "3,800 metres" (neither report states it), and "thirty-four successor
     companies" for Standard Oil (221 U.S. 1 gives no count). Each had slipped in
     from general knowledge rather than from a page, which is the exact failure the
     hand-resolve rule exists to prevent. Re-emitted from the same one-object script
     and re-merged: merge-drafts' replace-on-remerge cut and replaced all four
     entries with the counts unchanged at 118/152.
     Legacy pages and crash-finance-data.js untouched; legacy surgery stays off.
     Not merged to main, not pushed to main, not deployed — deploy stays the
     operator's call. -->

<!-- ACTUAL 2026-10-17: THE FOREKNOWLEDGE NINE — nine Phase-0 stubs about parties
     acting on advance knowledge of a catastrophe, researched against primary
     documents. SIX SURVIVED WITH READ CITATIONS; THREE WERE REMOVED FROM
     master/atlas.json. All nine carried identical boilerplate in decoyVsLedger,
     auditDisposition "DOCUMENTED", and CIT-1720-HANSARD (the 1721 South Sea report)
     as their only citation. Counts: 118 -> 115 public dossiers, 152 -> 167 citations.
     THE SIX THAT SURVIVED, and what was actually read for each:
     CC-2001-WTC7_PUT_OPTIONS_2001 — retitled away from "WTC 7 Evidence Destruction",
     because the record does not support that half and CC-2001-WTC7 already carries the
     SEC-file story with read citations. Read: the 9/11 Commission's Terrorist Financing
     Staff Monograph, Appendix B "Securities Trading" (pp. 145-151), downloaded from
     911commission.gov and read as extracted text; and note 130 to chapter 5 of the
     Commission report (p. 499) from the govinfo PDF. The dossier's ledger is the
     investigation's own scale and method — 103 companies, 32 funds, 9.5 million
     transactions, Large Option Position Reports, the OCC auto-exercise point that kills
     the "uncollected profits" claim — and its finding that every profitable trade
     resolved to a lawful strategy. It also records what is NOT public: no trader, fund
     or newsletter is named anywhere in the documents, and the SEC memorandum the
     finding rests on ("Pre-September 11, 2001 Trading Review", 15 May 2002) has never
     been released. The monograph's own disclaimer — the Commissioners "have not
     approved this text" — is quoted in the citation rather than glossed over.
     CC-2020-SENATE_COVID_DUMP_2020 — retitled from "The January 2020 Senate COVID-19
     Stock Dump": the court record read here is about Senator Burr and about trades
     dated 13 February 2020, not January, and not about the other senators named in
     2020 coverage, whose filings were not read and about whom the dossier asserts
     nothing. Read: the D.D.C. memorandum opinion and order of 29 August 2022 (Chief
     Judge Howell, Misc. No. 21-16), read in full in a browser on CourtListener; the
     D.C. Circuit opinion 28 F.4th 292 (18 March 2022) from media.cadc.uscourts.gov;
     and sections 4 and 6 of the STOCK Act, Pub. L. 112-105, from govinfo. The ledger
     is the disclosed sale ($628,000-$1.72m), the sealed warrant of 13 May 2020, the
     closed criminal review, the parallel SEC matter, and the partial unsealing ordered
     over DOJ's objection.
     CC-2008-PAULSON_ETON_PARK_2008 — the calendar decided this one. Secretary
     Paulson's official July 2008 calendar (a 60-page scan with no text layer, served
     from Treasury's electronic reading room) was read page by page in a browser, and
     page 10 records, for Monday 21 July 2008, 12:00-2:00 PM: "Lunch Roundtable with
     Hedge Fund and Private Equity Firm Managers, Eton Park Capital Management,
     Boardroom 823 3rd Avenue". That is the whole of the primary record for the
     meeting: no attendee is named, no agenda, not one word of what was said. Also
     read: Treasury press release HP-1079 of 13 July 2008 (the GSEs "must continue to
     do so in their current form as shareholder-owned companies"), HERA s.1117 from
     govinfo, and the FHFA Director's statement of 7 September 2008. TWO PRECISION
     CATCHES: the FHFA statement eliminated the dividends but left "the common and all
     preferred stocks ... outstanding" — the equity was not formally wiped out, which
     the popular retelling gets wrong; and a rescue plan was not secret on 21 July,
     having been announced publicly eight days earlier with the legislation then before
     Congress. The dossier says plainly that what was said at that table is not in the
     record and that it does not supply it.
     CC-1986-CHERNOBYL_EVAC_1986 — retitled away from "Nomenklatura Evacuation",
     because nothing read here records one. Read: IAEA Safety Series No. 75-INSAG-7
     (1992) and the Chernobyl Forum's "Chernobyl's Legacy", both from the IAEA's own
     servers. INSAG-7 supplies the real foreknowledge in this file and it is
     engineering foreknowledge: the positive scram effect was identified at Ignalina in
     1983, the Chief Design Engineer circulated it and promised design changes, "he
     made no such changes", the recommended procedural measures "were not adopted", the
     announced restrictions on full rod withdrawal "were never imposed and apparently
     the matter was forgotten" — and the defect was not disclosed to the IAEA's own
     1986 post-accident review ("Certainly the account in INSAG-1 would have been
     different had the features of the control and safety rods been revealed at the
     Post-Accident Review Meeting in 1986"). Chernobyl's Legacy supplies the public
     side: the delayed announcement, information "selective and restrictive", the
     measurable cost in radioiodine countermeasures, Pripyat's ~50,000 evacuated within
     40 hours. It records no separate evacuation of officials or their families and
     does not mention the May Day observances at all, and the dossier says so in terms.
     CC-2008-FUKUSHIMA_TSUNAMI_2011 — read: the NAIIC executive summary (Global
     edition, 2012) from the National Diet Library web archive, the Commission's own
     site being gone; and the IAEA Director General's 2015 report. The two are cited
     together because they differ: the Diet commission finds collusion and measures
     "intentionally postponed", the IAEA finds an absence of regulatory requirement and
     a 2002 JSCE source model that assumed no tsunami-generating earthquake off the
     site. PRECISION CATCH: the viral 15.7-metre in-house TEPCO estimate of 2008
     appears in NEITHER document. It is not stated anywhere in the dossier, and both
     citations say so; what the IAEA gives is a 2009 estimate of 6.1 m against a 3.1 m
     design basis, producing one change (raised pump motors) and no other flood
     protection.
     CC-1995-BARINGS_LEESON_1995 — read: HC 673, the Board of Banking Supervision
     report, a 354-page scan with NO TEXT LAYER served from assets.publishing.service.gov.uk;
     pdftotext returns zero lines on it, so it was read page by page in a browser
     through a local pdf.js viewer (title page, covering letter of 13 July 1995, and
     report pages 3, 78 and 232-233). Account '88888' set up July 1992 and excluded
     from every daily report to London but the margin file on instructions of on or
     around 8 July 1992; losses of some GBP 208 million by 31 December 1994 and some
     GBP 830 million by 27 February 1995; the three summary conclusions at 13.4; Peter
     Baring's "absolute" at 13.10. The Board's own caveat at 13.1 is quoted in the
     citation — very limited access to documents in Singapore, no formal interviews
     with BFS management or auditors, and nothing at all from Leeson — so the report is
     not presented as a finding against people it could not question. Second citation:
     the Bank of England's Banking Act Report 1995/96 (OCR'd scan, used for dates,
     sequence and the Board's own summary rather than fine wording).
     THE THREE REMOVED, with reasons:
     CC-2023-OCT7_SHORT_SELLING_2023 (Pre-October 7 Terror Short-Selling Anomalies) —
     REMOVED. There is no primary document to cite. The underlying study, Jackson and
     Mitts, "Trading on Terror?", sits on SSRN behind a Cloudflare bot wall that was
     not bypassed; the Israel Securities Authority's own statement could not be located
     on isa.gov.il (the site 301s to www.new.isa.gov.il and nothing matching was
     found); everything else available is press summary. On the substance, the headline
     profit figure was corrected by a factor of 100 after a shekels/agorot unit error,
     the ISA said its surveillance found no significant trading abnormalities requiring
     investigation, no trader has been identified, and no enforcement action or inquiry
     finding exists. A dossier here would have had nothing to put in documentedLedger
     and no honest way to fill the five-stage extraction loop.
     CC-1990-HARKEN_ENERGY_1990 (Harken Energy Insider Sale & BCCI Financing Nexus) —
     REMOVED, and the BCCI half is affirmatively contradicted. The Senate Foreign
     Relations Committee's BCCI report (the Kerry Committee's full 23-chapter report,
     all chapters downloaded from irp.fas.org and searched) contains ZERO occurrences
     of "Harken"; Khalid bin Mahfouz and Sheikh Bakhsh appear there as BCCI figures
     with no Harken link stated. The insider-sale half has no readable primary: the
     1990 Form 144 and Form 4 and the SEC's 1991-92 enforcement memoranda predate
     EDGAR (EDGAR's earliest Harken Energy filing, CIK 0000313478, is the 10-K of
     29 March 1994); the Center for Public Integrity's "Harken documents" page lists
     the SEC memoranda but every href on it is the literal template variable
     "{filedir_2}", four guessed paths return 404/403, and the Wayback availability API
     has no snapshot of any of them. CourtListener and govinfo return bag-of-words
     noise only. The node would have stood on journalism alone.
     CC-2000-NINE_ELEVEN_2001 (9/11 Intelligence Asset Withholding & Petrodollar
     Shield) — REMOVED as a Phase-0 duplicate. Both halves are already carried by
     nodes with read citations: the intelligence-withholding half by DS-2001-911 (Alec
     Station silos, 3/3 PASS) and the petrodollar half by CC-1974-PETRODOLLAR (3/3
     PASS). Rebuilding it would have meant writing a different node, not rescuing this
     one. LEFT ON THE TABLE for a future session, and NOT built here: the Joint
     Inquiry's declassified Part Four (the "28 pages",
     https://intelligence.house.gov/UploadedFiles/declasspart4.pdf — downloaded, 34
     pages, no text layer, NOT read) against the Commission report's own chapter 5
     finding, which WAS read here, that "we have found no evidence that the Saudi
     government as an institution or senior Saudi officials individually funded the
     organization. (This conclusion does not exclude the likelihood that charities with
     significant Saudi government sponsorship diverted funds to al Qaeda.)" That is a
     real decoy-versus-ledger node and it needs its own batch.
     PROCESS NOTE — HARVEST AND HAND-RESOLUTION. Of six harvests, three returned
     vetted citations and three returned none. The three that blocked
     (CC-2001-WTC7_PUT_OPTIONS_2001, CC-2008-PAULSON_ETON_PARK_2008,
     CC-1986-CHERNOBYL_EVAC_1986) were set to HARVESTED BY HAND in
     nodes.manifest.json, with a spec-<code>.md written saying exactly that, so that
     --finish would gate and merge the hand-written drafts. Of the three that did
     return rows, the courtlistener harvest for CC-2020-SENATE_COVID_DUMP_2020 was the
     only one that earned its keep: it surfaced CourtListener opinion 7860643, which
     was then opened and read in a browser and is cited under a hand-written id. The
     Barings harvest returned two modern "Barings LLC" asset-management cases with no
     connection to the 1995 collapse (dropped); the Fukushima harvest returned the NRC
     Near-Term Task Force report, which was not read and is not cited. Nothing was
     transcribed from a provider row.
     MERGE NOTE — replace-on-remerge could not cut any of the nine stubs byte-exact
     ("REPLACE-ON-REMERGE FAIL ... existing block not found byte-exact"), because
     migrate.mjs wrote the Phase-0 entries with a different indentation than
     merge-drafts' own serializer produces. All nine were therefore cut first by a
     brace-matching script that verifies, before writing, that the file still parses,
     that exactly the named dossiers are gone, that no other dossier moved, and that
     the citations array is untouched; --finish then merged the six as clean appends.
     SOURCES OPENED AND THEN REJECTED OR NOT READ (the part worth keeping): SSRN and
     the ISA, as above. The Senate eFD portal (efdsearch.senate.gov) gates its filings
     behind a prohibition-agreement form; Burr's periodic transaction reports are
     scanned images behind it and were NOT read, so no eFD record is cited and the
     disclosed sale is taken from the D.C. Circuit's own recital of it instead. The
     Center for Public Integrity Harken archive, as above. CourtListener's API returns
     401 unauthenticated and its plain pages return an empty 202 to scripts, so the
     Burr opinion was read in a browser. The Chernobyl Forum PDF carries a font-
     encoding fault that shifts some runs by three letters; nothing garbled is quoted,
     and where the garbled run contained a number — the hours over which stable iodine
     was distributed in Pripyat — the number is omitted and the citation says why.
     NO NEW ERAS AND ONE DELIBERATE EDGE: CC-1995-BARINGS_LEESON_1995 carries
     yearStart 1992, one year before ERA-09-2001's 1993 start, because account '88888'
     opening in July 1992 is the point of the node — the same licence CB-1984-BHOPAL
     takes at the other end of ERA-08. Every other yearStart falls inside its era.
     COUNTS: 115 public dossiers, 167 citations, 9 lineages, 183 merged nodes.
     atlas.html's hardcoded entry tallies updated (118 -> 115 in the og:description,
     the print caption and the page dek); lineages stay at nine. extract-entities
     re-run: 390 entries, 967 entities. GATES: npm test 38/38 pass; check-links over
     the six new drafts, 15 URLs, 15 ok / 0 blocked / 0 DEAD. atlas.html served from
     public/ and measured in the browser: 115 index rows, 10 era headers each exactly
     once, 9 lineage cards, and CC-1995-BARINGS_LEESON_1995 and
     CC-2008-PAULSON_ETON_PARK_2008 both opened to confirm every citation link renders
     with the right href.
     VERIFY PASS COLUMN: these six rows read GATE 0-QUAR, not 3/3 PASS. The
     deterministic forensic gate ran on all six and quarantined nothing — no
     research/leads/ file was written for any of them — but the 3-agent adversarial
     audit did not run, and the rows say so rather than inheriting the --finish
     template's wording.
     Legacy pages and crash-finance-data.js untouched; legacy surgery stays off.
     Not merged to main, not pushed to main, not deployed — deploy stays the
     operator's call. -->

<!-- ACTUAL 2026-10-17 (later the same day): DS-2002-JOINTINQUIRY — the node the
     foreknowledge batch left on the table, built. The removed stub
     CC-2000-NINE_ELEVEN_2001 was a duplicate of two already-sourced nodes; the real
     node in that area was always the Joint Inquiry's Part Four, and it is now here.
     Counts: 115 -> 116 public dossiers, 167 -> 172 citations.
     WHAT WAS READ. Part Four itself (intelligence.house.gov/UploadedFiles/declasspart4.pdf)
     is a 34-page scan with no text layer; read page by page in a browser through the
     same local pdf.js viewer used for HC 673 and the Paulson calendar — report pages
     415 (the Finding and the start of the Discussion), 416 (the framing paragraph and
     the first individual), 417, 418 (the remaining individuals) and 442 (the last
     page). The centre of the dossier is the document's own sentence at page 416: the
     Joint Inquiry "did not attempt to investigate and assess the accuracy and
     significance of this information independently, recognizing that such a task
     would be beyond the scope of this Joint Inquiry", and referred the compilation to
     the FBI and CIA instead. The Finding at 415 concedes that much of the
     Intelligence Community's information "has yet to be independently verified" and
     that no CIA or FBI witness could say "the extent to which such support, if it
     exists, is knowing or inadvertent in nature". Page 442 carries FBI Executive
     Assistant Director Pasquale D'Amuro: "To date I can't sit here and tell you that
     those ties go back, that we can prove that the Saudi royal family is sponsoring
     terrorism. But there's enough smoke that we are conducting several investigations
     to try to determine what other information is out there."
     Also read: the HPSCI release of 15 July 2016, fetched raw and read in full
     (Nunes: "not vetted conclusions, but rather unverified leads"; Schiff: hoping
     release would "diminish speculation that they contain proof of official Saudi
     Government or senior Saudi official involvement"); the 9/11 Commission Report
     chapter 5 PDF at p. 171 and chapter 7 PDF at p. 218, both from the Commission's
     own site; and JASTA, Pub. L. 114-222 s.3, from govinfo.
     THE DECOY CUTS BOTH WAYS, and the dossier says so. The viral claim — that the
     pages were buried because they prove official Saudi direction of 9/11 — fails on
     the document's own text and on its 2016 publication. But the opposite decoy, the
     one an atlas like this is likelier to slip into, also fails: "no evidence of
     official funding" is NOT "Saudi Arabia had nothing to do with it". The same page
     171 that carries the Commission's finding also calls Saudi Arabia "the primary
     source of al Qaeda funding", says the conclusion "does not exclude the likelihood
     that charities with significant Saudi government sponsorship diverted funds to al
     Qaeda", and records charities in which al Qaeda operatives "controlled the entire
     organization, including access to bank accounts". Both halves are in
     whyDecoyFails.
     NAMED INDIVIDUALS. Part Four names private individuals and summarises unverified
     FBI reporting about them. The dossier does not repeat those allegations as claims.
     It quotes the document's conditional language as language, names only Omar
     al Bayoumi — the individual it treats at greatest length and the subject of a
     published Commission assessment — and attaches that assessment: "we have seen no
     credible evidence that he believed in violent extremism or knowingly aided
     extremist groups", "an unlikely candidate for clandestine involvement with
     Islamist extremists", alongside the Commission's own "We do not know whether the
     lunch encounter occurred by chance or design."
     ONE-URL-ONE-CITATION PRESERVED. The Commission report is already cited in this
     atlas as CIT-2004-911REPORTN130, the govinfo full-report PDF, for note 130 on the
     put options. Rather than cite the same URL twice, the Saudi finding and the
     Bayoumi assessment are cited from the Commission's own per-chapter PDFs
     (911Report_Ch5.pdf, 911Report_Ch7.pdf), which are separate files that were
     separately downloaded and read. master/atlas.json still has 0 duplicate citation
     URLs and 0 duplicate citation ids.
     NOT READ: the declassified executive summary of the 2005 FBI-CIA joint assessment
     on Saudi Government support for terrorism, which the HPSCI release links at
     dni.gov. dni.gov returns 403 "Access Denied" to scripted requests with full
     browser headers, and the browser pane downloads PDFs rather than rendering them.
     It is named in the HPSCI citation as a document that exists and was released, and
     nothing is taken from it. It is the obvious first source for whoever extends this
     node.
     HARVEST: govinfo returned 0 vetted citations (five unrelated USCOURTS and
     USREPORTS packages); status set to HARVESTED by hand with a spec saying so, as
     with three nodes in the batch earlier today.
     COUNTS: 116 public dossiers, 172 citations, 9 lineages, 184 merged nodes.
     atlas.html's hardcoded tallies updated 115 -> 116. extract-entities re-run:
     971 entities. GATES: npm test 38/38; check-links over the new draft, 5 URLs,
     5 ok / 0 blocked / 0 DEAD; schema validates; 0 duplicate codes, 0 duplicate
     citation ids, 0 duplicate citation URLs, 0 orphan citationIds, 0 unused
     citations. atlas.html served from public/ and measured in the browser: 116 index
     rows, 10 era headers each exactly once, 9 lineage cards, and the node opened to
     confirm all five citation links render with the right href.
     VERIFY PASS: GATE 0-QUAR. The deterministic forensic gate ran and quarantined
     nothing (no research/leads/ file); the 3-agent adversarial audit did not run.
     Not merged to main, not pushed to main, not deployed. -->

<!-- ACTUAL 2026-10-17 (third pass): FIVE NEW NODES FROM OUTSIDE THE PHASE-0 QUEUE,
     plus the removal of CC-1815-WATERLOO. These are not stubs being researched; they
     are instances of the atlas's own playbook identified from scratch and then tested
     against primary documents. Counts: 116 -> 120 public dossiers (115 after the
     Waterloo cut, then +5), 172 -> 178 citations.
     CC-1815-WATERLOO REMOVED. It was the one row in the ledger table claiming a verify
     pass whose dossier cited only CIT-1720-HANSARD, the 1721 South Sea report, which
     supports nothing in it. It was not a Phase-0 stub: it carried real written prose
     asserting that "Private courier Rothworth crosses the Channel with news of
     Napoleon's defeat at Waterloo 24 hours before Major Henry Percy reaches the
     British Cabinet" — a named figure and a specific interval, with no citation behind
     either. Its scope is already carried by DS-1815-COURIER, which is sourced and which
     makes the more careful version of the same argument, stating in terms that the
     deception legend "is not contemporaneously documented". Carrying both meant the
     atlas asserted, in one node, what it refuted in another. Removed for duplication,
     and because the stronger claim was the unsourced one. Its ledger row is struck
     from the table below.
     THE FIVE BUILT, and what was read for each:
     CB-1996-PURDUE — Harrington v. Purdue Pharma L.P., No. 23-124 (U.S. 27 June 2024),
     downloaded from supremecourt.gov and read as extracted text. The node exists
     because this is the MERSEY MECHANISM FAILING: a nondebtor release, the instrument
     by which solvent owners of an insolvent company buy a discharge, held unauthorised
     by the bankruptcy code. The opinion also supplies the extraction figures in its own
     words — distributions under 15% of revenue before the 2007 misbranding plea and "as
     much as 70%" after it, approximately $11 billion between 2008 and 2016 "draining
     Purdue's total assets by 75%", much of it to overseas trusts, and an offer of
     $4.325 billion back in exchange for the release. The Court's express self-limitation
     ("we hold only that...", and no view on already-consummated plans) is quoted in the
     citation, because a triumphant retelling drops it.
     CB-2011-BOEING737MAX — the House Transportation and Infrastructure Committee's
     final report of September 2020, read as extracted text. Its five named themes carry
     the whole dossier. The decisive pair of numbers: federal guidelines "assume pilots
     will respond to this condition within four seconds", and Boeing's own simulator data
     showed a Boeing test pilot taking "more than 10 seconds", a condition that pilot
     called "catastrophic" — data the committee found Boeing concealed, adding that while
     Boeing "was not required to share this information", withholding it was
     "inconceivable and inexcusable".
     CB-1999-HORIZON — Hamilton & Ors v Post Office Ltd [2021] EWCA Crim 577. NOTE ON
     SOURCE: BAILII now serves a proof-of-work bot challenge ("Making sure you're not a
     bot!") to scripted requests, and an earlier probe of it returned HTTP 200 for that
     challenge page, which is exactly the trap of treating a status code as a read. The
     judgment was taken instead from the National Archives' Find Case Law service, which
     serves it in full. The court's finding on knowledge uses the verb four times in
     four sentences ("POL knew that there were problems with Horizon...") against
     "On the contrary, it consistently asserted that Horizon was robust and reliable."
     CB-2010-MACONDO — the National Commission's report to the President (January 2011)
     from govinfo, and 33 U.S.C. 2704. PRECISION CATCH WORTH KEEPING: the Statutes at
     Large scan of the same provision (STATUTE-104-Pg484) is an image whose OCR renders
     the offshore-facility cap as "for a n onshore facility", dropping the "ff" and
     inverting the meaning, since onshore facilities are the next paragraph at
     $350,000,000. The United States Code text was fetched and read instead, and the
     corrupt scan is named in the citation and not cited. The dossier also records that
     the cap does not apply to gross negligence, wilful misconduct or regulatory
     violation, and that whether it would have held at Macondo was never adjudicated.
     CB-1970-INFECTEDBLOOD — the Infected Blood Inquiry report, Volume 1 (May 2024),
     from the Inquiry's own site. The chair's conclusion that it "could largely, though
     not entirely, have been avoided. And I have to report that it should have been",
     and the listed harms including "A lack of openness, transparency and candour, shown
     by the NHS and government, such that the truth has been hidden for decades" and
     "Deliberate destruction of some documents and the loss of others".
     A UI INVARIANT THAT IS FRAGILE, FOUND THE HARD WAY. The atlas index sorts dossiers
     by yearStart and emits an era header whenever the era changes, so a dossier whose
     yearStart sorts it outside its own era's contiguous block SILENTLY DUPLICATES ERA
     HEADERS. CB-2010-MACONDO was first written with yearStart 1990 (for the Oil
     Pollution Act, its inherited framework), which placed it between the 1970s ERA-08
     block and a 1991 ERA-08 entry and produced 12 era headers instead of 10 —
     ERA-08-1953 and ERA-09-2001 each appearing twice. Fixed by setting yearStart to
     2010, the year of the blowout, which is the more honest range anyway: 1990 belongs
     in the ratchet, not in the dates. Anyone stretching a year range past an era
     boundary (CB-1984-BHOPAL, CC-1995-BARINGS_LEESON_1995, CB-1970-INFECTEDBLOOD,
     CB-1996-PURDUE all do) must check the rendered index afterwards. A year-sorted pass
     over master now yields exactly 10 era switches.
     ALSO WORTH RECORDING: the first browser check after the fix still showed 12 headers
     because the page was cached from before the recompile. A cache-busted reload showed
     10. A measurement taken before a recompile is not a measurement.
     HARVEST: not used for these five. Earlier probes showed the govinfo index returning
     bag-of-words noise for topics of this kind, so each node was hand-resolved from the
     start; manifest entries were written with status HARVESTED and a spec saying exactly
     that, as with the nodes earlier today.
     COUNTS: 120 public dossiers, 178 citations, 9 lineages, 188 merged nodes, 38
     unsourced Phase-0 stubs still standing. atlas.html's hardcoded tallies updated
     116 -> 120. extract-entities re-run. GATES: npm test 38/38; check-links over the
     five new drafts, 6 URLs, 6 ok / 0 blocked / 0 DEAD; schema validates; 0 duplicate
     codes, ids or citation URLs; 0 orphan citationIds; 0 unused citations. Measured in
     the browser after a cache-busted reload: 130 index rows (120 dossiers + 10 era
     headers), 10 era headers each exactly once, 9 lineage cards, CB-1999-HORIZON and
     CB-2010-MACONDO opened to confirm their citation links render with the right href.
     VERIFY PASS: all five rows read GATE 0-QUAR. The deterministic forensic gate ran and
     quarantined nothing (no research/leads/ file for any of them); the 3-agent
     adversarial audit did not run.
     Not merged to main, not pushed to main, not deployed. -->

# THE CORNFIELD GAZETTE — MASTER NODE STATUS LEDGER

| Node Code | Title / Scope | Era | Evidence Tier | Seeding Providers | Verify Pass | UI Wired | Done |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `CC-1720-SOUTHSEA` | South Sea Debt Conversion & Walpole Screen | `ERA-01-1694` | `TIER_2_INQUIRY` | `hansard` | 3/3 PASS | YES | [x] |
| `CC-1773-EIC` | Bengal Famine Extraction & 1773 EIC Bailout | `ERA-02-1769` | `TIER_1_STATUTE_COURT` | `hansard` | 3/3 PASS | YES | [x] |
| `CB-1845-COFFIN` | Irish Famine Exports, Coffin Ships & 1849 Estates Act | `ERA-04-1845` | `TIER_1_STATUTE_COURT` | `hansard,courtlistener` | 3/3 PASS | YES | [x] |
| `CC-1861-MORGAN` | Hall Carbine Affair & 1893 Railroad Morganization | `ERA-05-1861` | `TIER_1_STATUTE_COURT` | `courtlistener,govinfo` | 3/3 PASS | YES | [x] |
| `CC-1912-IMM` | IMM $170M Watered Stock, Pirrie Lock & 1915 Receivership | `ERA-06-1910` | `TIER_1_STATUTE_COURT` | `courtlistener,govinfo,loc` | 3/3 PASS | YES | [x] |
| `DS-1912-TITANIC` | Marconi-Tesla Patent Seizure, Californian & Mersey Fix | `ERA-06-1910` | `TIER_1_STATUTE_COURT` | `courtlistener,hansard,govinfo` | 3/3 PASS | YES | [x] |
| `CC-1914-MORGAN` | Jekyll Island, NY Fed & $3B UK War Purchasing Agency | `ERA-06-1910` | `TIER_2_INQUIRY` | `govinfo,loc` | 3/3 PASS | YES | [x] |
| `DS-1915-LUSITANIA` | Lusitania Munitions, Room 40 Recall & Mersey Encore | `ERA-06-1910` | `TIER_2_INQUIRY` | `hansard,govinfo` | 3/3 PASS | YES | [x] |
| `DS-1942-IGFARBEN` | BIS Immunity, Standard Oil–IG Farben & Dulles Cartel | `ERA-07-1929` | `TIER_2_INQUIRY` | `govinfo,courtlistener` | 3/3 PASS | YES | [x] |
| `DS-1982-INSLAW` | DOJ PROMIS Software Theft, Systematics & BCCI | `ERA-08-1953` | `TIER_1_STATUTE_COURT` | `courtlistener,govinfo` | 3/3 PASS | YES | [x] |
| `CC-2001-WTC7` | WTC 7 SEC File Loss (CSFB), eSpeed & ATSSSA Cap | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `govinfo,edgar` | 3/3 PASS | YES | [x] |
| `DS-2001-911` | Alec Station Silos, Krongard Bridge & In-Q-Tel/Palantir | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `govinfo,edgar` | 3/3 PASS | YES | [x] |
| `CC-2008-TARP` | Subprime CDO Fraud, $16.1T Fed Window & Foreclosures | `ERA-09-2001` | `TIER_2_INQUIRY` | `govinfo,edgar` | 3/3 PASS | YES | [x] |
| `DS-2025-PALANTIR` | Schedule F Purge, Palantir ImmigrationOS & Thiel PACs | `ERA-10-2020` | `TIER_1_STATUTE_COURT` | `usaspending,edgar,govinfo` | 3/3 PASS | YES | [x] |
| `CC-2026-ARBITRAGE` | Tether Treasury Custody & Tariff-Refund Arbitrage | `ERA-10-2020` | `TIER_3_PRIMARY_LEDGER` | `edgar,courtlistener` | 3/3 PASS | YES | [x] |
| `DS-1720-WALPOLE` | Robert Walpole's Parliamentary Screen & Bank Charter | `ERA-01-1694` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `CB-1770-BENGAL` | Bengal Diwani Tax Tripling & Opium Monoculture | `ERA-02-1769` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `DS-1815-COURIER` | Rothschild Packet-Boat Network vs. Crown Envoys | `ERA-03-1815` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1849-ESTATES` | Encumbered Estates Court Distressed Land Auctions | `ERA-04-1845` | `TIER_2_INQUIRY` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `DS-1873-PLIMSOLL` | Samuel Plimsoll 'Ship-Knacker' Over-Insurance Inquiry | `ERA-04-1845` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1893-RAILROADS` | Panic of 1893 Railroad Receiverships & Voting Trusts | `ERA-05-1861` | `TIER_1_STATUTE_COURT` | `courtlistener,loc` | 3/3 PASS | YES | [x] |
| `PH-1901-WARDENCLYFFE` | Morgan's 51% Tesla Patent Lock & Wardenclyffe Demolition | `ERA-06-1910` | `TIER_1_STATUTE_COURT` | `courtlistener,loc` | 3/3 PASS | YES | [x] |
| `DS-1910-JEKYLL` | Jekyll Island Duck-Hunt Railcar & Aldrich Plan | `ERA-06-1910` | `TIER_3_PRIMARY_LEDGER` | `govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `CB-1912-STEERAGE` | Titanic Third-Class Triage & Mackay-Bennett Burials | `ERA-06-1910` | `TIER_3_PRIMARY_LEDGER` | `govinfo,hansard,wikidata` | 3/3 PASS | YES | [x] |
| `MC-1912-HALIFAXFOG` | April 15 'All Safe / Towing to Halifax' Press Blackout | `ERA-06-1910` | `TIER_4_CONTEMPORARY_PRESS` | `loc,govinfo` | 3/3 PASS | YES | [x] |
| `DS-1913-MARCONISCANDAL` | UK Cabinet Insider Shares in American Marconi | `ERA-06-1910` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1929-CALLMONEY` | Strong-Norman Rate Coordination & Call-Loan Plug | `ERA-07-1929` | `TIER_3_PRIMARY_LEDGER` | `govinfo,loc,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1930-BIS` | Basel Charter Immunity & Wartime Gold Clearing | `ERA-07-1929` | `TIER_3_PRIMARY_LEDGER` | `govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `DS-1953-AJAX` | Operation Ajax (Iran) & Anglo-Iranian Oil Consortium | `ERA-08-1953` | `TIER_3_PRIMARY_LEDGER` | `govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `DS-1954-PBSUCCESS` | Operation PBSuccess (Guatemala) & United Fruit Bonds | `ERA-08-1953` | `TIER_3_PRIMARY_LEDGER` | `govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1974-PETRODOLLAR` | U.S.–Saudi Joint Commission Treasury Add-On System | `ERA-08-1953` | `TIER_3_PRIMARY_LEDGER` | `govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1982-AMBROSIANO` | Banco Ambrosiano, P2 Lodge & Roberto Calvi Collapse | `ERA-08-1953` | `TIER_3_PRIMARY_LEDGER` | `hansard,wikidata` | 3/3 PASS | YES | [x] |
| `CC-1991-BCCI` | BCCI Collapse, Kerry Committee & Intelligence Accounts | `ERA-08-1953` | `TIER_1_STATUTE_COURT` | `govinfo,courtlistener` | 3/3 PASS | YES | [x] |
| `PH-2001-ESPEED` | Cantor Fitzgerald eSpeed Electronic Treasury Migration | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `edgar,courtlistener` | 3/3 PASS | YES | [x] |
| `CC-2002-LOGCAP` | KBR / Halliburton Cost-Plus LOGCAP III Contracts | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `usaspending,govinfo,wikidata` | 3/3 PASS | YES | [x] |
| `PH-2003-INQTEL` | CIA In-Q-Tel Seed Investment in Palantir Technologies | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `edgar,wikidata` | 3/3 PASS | YES | [x] |
| `DS-2011-THEMIS` | HBGary / Palantir 'Team Themis' Counter-Ops Leak | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `edgar,govinfo` | 3/3 PASS | YES | [x] |
| `CC-2012-LIBOR` | Interdealer LIBOR Rigging & Wash-Trade Settlements | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `courtlistener,edgar` | 3/3 PASS | YES | [x] |
| `PH-2025-IMMIGRATIONOS` | ICE Sole-Source Palantir 'ImmigrationOS' Architecture | `ERA-10-2020` | `TIER_3_PRIMARY_LEDGER` | `usaspending,edgar` | 3/3 PASS | YES | [x] |
| `FINDINGS-01..52` | Existing 52 Entity Dossiers in `research/findings/*.json` | `ALL` | `INHERITED` | `migrate.mjs` | MIGRATED | YES | [x] |
| `CC-1842-OPIUM` | Canton Opium Seizure, the 1840 Commons Debate & the Nanking Indemnity | `ERA-04-1845` | `TIER_1_STATUTE_COURT` | `archive.org,hansard` | GATE 0-QUAR | YES | [x] |
| `CB-1865-SULTANA` | War Department Head-Bounty, the Patched Boiler & the Annulled Verdict | `ERA-05-1861` | `TIER_4_CONTEMPORARY_PRESS` | `archive.org,loc` | GATE 0-QUAR | YES | [x] |
| `DS-1892-PINKERTON` | Homestead's Hired Barge, Three Inquiries & the 1893 Federal-Only Proviso | `ERA-05-1861` | `TIER_2_INQUIRY` | `govinfo` | GATE 0-QUAR | YES | [x] |
| `CB-1914-LUDLOW` | CF&I Tent Colonies, Ludlow & the Colorado Industrial Plan | `ERA-06-1910` | `TIER_2_INQUIRY` | `archive.org,govinfo` | GATE 0-QUAR | YES | [x] |
| `DS-1928-BANANA` | State Department 'Good Offices' for United Fruit & the Cienaga Volley | `ERA-07-1929` | `TIER_3_PRIMARY_LEDGER` | `history.state.gov,loc` | GATE 0-QUAR | YES | [x] |
| `DS-2007-BLACKWATER` | WPPS Cost-Reimbursement Guards, CPA Order 17 & the 2020 Pardons | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `govinfo,courtlistener` | GATE 0-QUAR | YES | [x] |
| `DS-1911-STANDARDOIL` | The 1911 Dissolution Decree, Six Months to Comply & the 1914 Flag Request | `ERA-06-1910` | `TIER_1_STATUTE_COURT` | `courtlistener,history.state.gov` | GATE 0-QUAR | YES | [x] |
| `DS-1935-RACKET` | Vinson-Trammell's 10% Profit Cap & the Nye Committee That Called It Unenforceable | `ERA-07-1929` | `TIER_1_STATUTE_COURT` | `govinfo,archive.org` | GATE 0-QUAR | YES | [x] |
| `CB-1984-BHOPAL` | The Bhopal Act's Exclusive Standing, Forum Non Conveniens & the $470M Discharge | `ERA-08-1953` | `TIER_1_STATUTE_COURT` | `courtlistener` | GATE 0-QUAR | YES | [x] |
| `CB-2023-TITAN` | OceanGate's 'Mission Specialists', an Unflagged Submersible & Two 2025 Federal Boards | `ERA-10-2020` | `TIER_2_INQUIRY` | `ntsb.gov,news.uscg.mil` | GATE 0-QUAR | YES | [x] |
| `CC-2001-WTC7_PUT_OPTIONS_2001` | The Pre-9/11 Put Options: 9.5M Transactions, One Bearish Adviser and a Newsletter Faxed on a Sunday | `ERA-09-2001` | `TIER_2_INQUIRY` | `911commission.gov,govinfo` | GATE 0-QUAR | YES | [x] |
| `CC-2020-SENATE_COVID_DUMP_2020` | A Disclosed Sale, a Sealed Warrant and a Closed File: the February 2020 Senate Stock Sales | `ERA-10-2020` | `TIER_1_STATUTE_COURT` | `courtlistener,govinfo,cadc.uscourts.gov` | GATE 0-QUAR | YES | [x] |
| `CC-2008-PAULSON_ETON_PARK_2008` | The Eton Park Lunch: Two Hours in the Secretary’s Calendar, and What It Does Not Record | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `home.treasury.gov,govinfo,fhfa.gov` | GATE 0-QUAR | YES | [x] |
| `CC-1986-CHERNOBYL_EVAC_1986` | Known at Ignalina in 1983: the Scram Defect Nobody Corrected, and the Announcement That Waited | `ERA-08-1953` | `TIER_2_INQUIRY` | `iaea.org` | GATE 0-QUAR | YES | [x] |
| `CC-2008-FUKUSHIMA_TSUNAMI_2011` | Foreseeable Before 11 March: the Diet Commission and the IAEA on What TEPCO and NISA Knew | `ERA-09-2001` | `TIER_2_INQUIRY` | `warp.ndl.go.jp,iaea.org` | GATE 0-QUAR | YES | [x] |
| `CC-1995-BARINGS_LEESON_1995` | Account ‘88888’: Cut Out of the Daily Reports in July 1992, £830M by 27 February 1995 | `ERA-09-2001` | `TIER_2_INQUIRY` | `assets.publishing.service.gov.uk,bankofengland.co.uk` | GATE 0-QUAR | YES | [x] |
| `DS-2002-JOINTINQUIRY` | Part Four: Fourteen Years Classified, and a Section That Says of Itself That It Verified Nothing | `ERA-09-2001` | `TIER_2_INQUIRY` | `intelligence.house.gov,911commission.gov,govinfo` | GATE 0-QUAR | YES | [x] |
| `CB-1996-PURDUE` | The Milking Program: $11B Out, $4.325B Offered Back, and the Release the Supreme Court Refused | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `supremecourt.gov` | GATE 0-QUAR | YES | [x] |
| `CB-2011-BOEING737MAX` | Four Seconds Assumed, Ten Seconds Measured: MCAS and the Authorized Representatives | `ERA-09-2001` | `TIER_2_INQUIRY` | `house.gov` | GATE 0-QUAR | YES | [x] |
| `CB-1999-HORIZON` | Robust and Reliable: a Prosecutor Who Owned the Evidence, and 39 Trials That Could Not Be Fair | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `caselaw.nationalarchives.gov.uk` | GATE 0-QUAR | YES | [x] |
| `CB-2010-MACONDO` | Removal Costs Plus $75 Million: the 1990 Cap and the Blowout the Commission Called Preventable | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `govinfo` | GATE 0-QUAR | YES | [x] |
| `CB-1970-INFECTEDBLOOD` | It Should Have Been Avoided: Forty Years of Defensive Lines, and the Documents That Were Destroyed | `ERA-08-1953` | `TIER_2_INQUIRY` | `infectedbloodinquiry.org.uk` | GATE 0-QUAR | YES | [x] |
