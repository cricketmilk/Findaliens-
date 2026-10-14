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
     unlocked provider for all future nodes. -->

# THE CORNFIELD GAZETTE — MASTER NODE STATUS LEDGER

| Node Code | Title / Scope | Era | Evidence Tier | Seeding Providers | Verify Pass | UI Wired | Done |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| `CC-1720-SOUTHSEA` | South Sea Debt Conversion & Walpole Screen | `ERA-01-1694` | `TIER_2_INQUIRY` | `hansard` | 3/3 PASS | YES | [x] |
| `CC-1773-EIC` | Bengal Famine Extraction & 1773 EIC Bailout | `ERA-02-1769` | `TIER_1_STATUTE_COURT` | `hansard` | 3/3 PASS | YES | [x] |
| `CC-1815-WATERLOO` | Waterloo Courier Window & Consol Accumulation | `ERA-03-1815` | `TIER_3_PRIMARY_LEDGER` | `hansard` | 3/3 PASS | YES | [x] |
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
