# What has not been researched yet

Working memo for the owner, generated 2026-10-09 from `public/data/entities.json`,
`research/findings/*.json`, `research/handoffs/*.json`, the `const nodes` line of
`public/crash-conduits.html`, `public/blind-pool.html` and the five dossier pages.
Read-only audit; no web searches were run. Snapshot taken at 12:55 on 2026-10-09 while Kenoma was still writing files (166 findings files at the final count; eight arrived during the audit, including carbyne, ehud-barak, israel, future-forward, new-knowledge, nso-group, joi-ito, valar-ventures), so re-run the counts before acting on the margins.

## Summary

1. **500** entities in the index; **146** have a findings file, **354** do not (71%). 166 findings files exist in all.
2. 20 findings files have no entry in `entities.json` (re-run `extract-entities.mjs` or seed): steven-hoffenberg, darpa, trump-media-technology-group, ken-howery, opec, reid-hoffman, office-of-personnel-management, paypal-fraud-2000-2002, roelof-botha, luke-nosek, michael-moritz, paypal-bonus-abuse, israel-securities-authority, joi-ito, valar-ventures, mit-media-lab, new-knowledge, nso-group, future-forward (and any written after this snapshot).
3. Of the 354 unresearched ids, ~57 are slug noise or compound ids (section 1, tail); ~297 are real research targets, 225 of them on Crash Conduits alone.
4. **11 government ids** have no file, led by US Department of Justice (10 mentions, 9+3 inbound connections), NY Attorney General (5), NSA (4), EPA (4), NOAA (4).
5. **20 of 68** Crash Conduits nodes have no researched entity at all; every pre-1950 node (tulip to Kreuger) is in that set.
6. Handoffs: 42 records, grading A 33 / B 1 / C 4 / D 4. Two disputed claims are still asserted verbatim on Crash Conduits (HIID "rigged voucher auctions"; "NASA sole-source commercial crew").
7. 761 open questions across 151 files; the dominant themes are unconfirmed dollar figures (223), claims with no source found (170), and primary documents never opened (116).
8. 278 distinct connection targets have no findings file (330 pointers); 228 of them are not even in the index.
9. The five dossier pages name ~80 people, agencies and firms absent from the index (section 6), most of them on recurring-cast and trump-conduit.
10. **Top 10 next targets by inbound connection count:** us-department-of-justice (12 incl. the "u-s-department-of-justice" spelling), usaid (4), saudi-gid (3), government-of-the-u-s-virgin-islands (3), russian-federation (3), u-s-department-of-the-treasury (3), aig (3), apple (3), barclays-plc (2), first-american-bankshares (2).

---

## 1. Entity coverage: indexed entities with no findings file

Sorted by mentions desc within each page. An entity on several pages appears under each. `type` is the index's own tag; `unknown` means the extractor could not type it.

### Government ids without a file (flagged, all pages)

| id | name | mentions | pages |
|---|---|---|---|
| us-department-of-justice | US Department of Justice | 10 | crash-conduits, climate, blind-pool, recurring-cast |
| new-york-attorney-general | New York Attorney General | 5 | crash-conduits, climate, blind-pool |
| nsa | NSA | 4 | crash-conduits, consent |
| epa | EPA | 4 | climate, deep-state |
| noaa | NOAA | 4 | climate |
| ny-fed | NY Fed | 3 | crash-conduits |
| us-air-force | US Air Force | 3 | demystification |
| defense-intelligence-agency | Defense Intelligence Agency | 2 | demystification, recurring-cast |
| ftc | FTC | 1 | consent |
| usaid | USAID | 1 | crash-conduits |
| us-immigration-and-customs-enforcement | ICE | 1 | deep-state |

Untyped agencies that belong with them: department-of-commerce (2), department-of-energy (1), state-of-montana (1), sec-enforcement-division (1), nsa-special-source-operations (1), prism-program-office (1), cia-alec-station (1), csrb (1), nisa-nuclear-regulators (1).

### crash-conduits (225 ids without a file)

Mentions >= 2:

| id | name | type | mentions |
|---|---|---|---|
| us-department-of-justice | US Department of Justice | government | 10 |
| new-york-attorney-general | New York Attorney General | government | 5 |
| omar-al-bayoumi | Omar al-Bayoumi | unknown | 4 |
| nsa | NSA | government | 4 |
| total | Total | unknown | 4 |
| bear-stearns | Bear Stearns | bank | 3 |
| enron | Enron | company | 3 |
| ny-fed | NY Fed | government | 3 |
| department-of-commerce | Department of Commerce | unknown | 2 |
| gm | GM | unknown | 2 |
| jeff-bezos | Jeff Bezos | person | 2 |
| sam-bankman-fried | Sam Bankman-Fried | person | 2 |
| stanford-research-institute | Stanford Research Institute | research institute | 2 |
| aig | AIG | company | 2 |
| alex-karp | Alex Karp | unknown | 2 |
| jane-street | Jane Street | unknown | 2 |
| morgan-stanley | Morgan Stanley | bank | 2 |
| paul-volcker | Paul Volcker | unknown | 2 |
| saudi-gid | Saudi GID | unknown | 2 |
| timothy-geithner | Timothy Geithner | person | 2 |

One mention each (205), grouped; all `unknown` type unless marked:

*People, modern (1970 onward):* abdullah-taha-bakhsh, admiral-john-poindexter, adnan-khashoggi, alexander-acosta, anatoly-chubais, andrew-bailey, andrew-fastow, andy-jassy, angelo-mozilo, anton-valukas, axel-lehmann, bernard-madoff, boris-berezovsky, brad-garlinghouse, brian-armstrong, bruno-iksil, carlos-salinas-de-gortari, caroline-ellison, cofer-black, colm-kelleher, david-boies, david-campbell, elizabeth-holmes, eliot-spitzer, eric-hunsader, eric-mindich, erin-callan, ernesto-zedillo, frank-quattrone, gary-kildall, gary-wang, george-shultz, gerald-fauth, ghaith-pharaon, ghislaine-maxwell, henri-steenkamp, henry-kissinger, ina-drew, jack-grubman, james-mattis, jamie-dimon, jean-claude-trichet, jeffrey-skilling, jeffrey-sprecher, jensen-huang, jes-staley, john-ashcroft, john-meriwether, john-opel, jon-s-corzine, joseph-cassano, justin-kennedy, karin-keller-sutter, ken-griffin (person), kenneth-lay, lawrence-preston-gise, lloyd-blankfein, lucas-papademos, masataka-shimizu, matthew-chamberlain, michael-stamenson, michel-camdessus, mikhail-gorbachev, navinder-singh-sarao, nelson-bunker-hunt, nicholas-nick-leeson, nicholas-brady, nishad-singh, patrick-halligan, pedro-aspe, peter-norris, prescott-bush, rich-blee, richard-breeden, richard-perle, richard-s-fuld-jr, robert-citron, robert-rubin, roger-anderson, ron-baker, rosemary-vrablic, sen-kelly-loeffler, sir-leslie-o-brien, sung-kook-bill-hwang, sunny-balwani, thomas-gottstein, tim-paterson, todd-conover, tsunehisa-katsumata, ulrich-korner, viktor-chebrikov, volodymyr-shcherbytsky, walter-noel, walter-wriston, william-herbert-hunt, william-j-mcdonough, william-m-isaac, william-mcchesney-martin, wolfgang-schauble, yasuo-hamanaka.

*People, historical (pre-1970):* alfred-p-sloan, baron-jacques-de-reinach, baron-rene-de-mackau, chancellor-john-aislabie, charles-de-gaulle, charles-de-lesseps, charles-x-of-france, cornelius-herz, cornelius-vanderbilt, daniel-drew, dany-dattel, david-c-bevan, donald-durant, duke-of-orleans, edward-charles-baring, edward-h-harriman, edward-watkin-edwards, evelyn-baring, ferdinand-de-lesseps, gus-levy, hans-gerling, henry-edmund-gurney, hermann-oppenheim, irenee-du-pont, ivar-kreuger, iwan-david-herstatt, j-pierpont-morgan, j-c-r-licklider, jacob-schiff, james-jim-fisk-jr, jay-gould, john-blunt, john-henry-gurney, john-law, khedive-ismail-pasha, larry-roberts, lord-cromer, lord-revelstoke, mary-maxwell-gates, miguel-juarez-celman, pierre-s-du-pont, stuart-t-saunders, william-lidderdale.

*Companies, banks, funds:* ameriquest, apollo, arthur-andersen, banque-royale, bbn-technologies, benex-worldwide, boies-schiller, cerberus-capital-management, citadel-securities, citigroup (bank), clarium-capital-management, countrywide, db-private-wealth, deltec-bank, deutsche-bank-alex-brown, eton-park (fund), fairfield-greenwich, mohr-davidow-ventures, norilsk-nickel (company), nyse-nasdaq, polychain-capital, ripplewood-holdings, robinhood, sibneft (company), silvergate-and-signature-banks, theranos (company), tremont-group, tsmc, virtu-financial, waddell-and-reed.

*Agencies, states, programmes:* bahamas, cia-alec-station, csrb, iran-contra-darpa-iao, nisa-nuclear-regulators, nsa-special-source-operations, prism-program-office, sec-enforcement-division, usaid (government).

*Collective or role labels (research the underlying institution, not the label):* amsterdam-notaries, bank-of-japan-leadership, dutch-regents, head-of-fx-trading, head-of-kuhn, hyperscalers, ig-farben-leadership, institutional-put-buyers, insurance-magnate, ldi-fund-managers, marc-andreessen-ben-horowitz, mexican-banking-oligarchs, microsoft-founders, ministry-of-finance-officials, offshore-derivatives-desks, partner-at-lee, planter-elite, princes-of-the-yen, russian-oligarchic-networks, suharto-family-and-cronies, unidentified-institutional-short-sellers, voc-merchants.

### climate (57)

| id | name | type | mentions |
|---|---|---|---|
| us-department-of-justice | US Department of Justice | government | 10 |
| new-york-attorney-general | New York Attorney General | government | 5 |
| epa | EPA | government | 4 |
| total | Total | unknown | 4 |
| noaa | NOAA | government | 4 |
| department-of-commerce | Department of Commerce | unknown | 2 |
| stanford-research-institute | Stanford Research Institute | research institute | 2 |
| accuweather | AccuWeather | unknown | 2 |
| chevron | Chevron | company | 2 |
| donors-trust | Donors Trust | fund | 2 |
| exelon | Exelon | unknown | 2 |
| national-association-of-manufacturers | National Association of Manufacturers | trade group | 2 |

One mention: 45q-credit-claimants, alec (trade group), balch-and-bingham, barry-myers, bonner-and-associates, c-quest-capital, comed, david-roberson, department-of-energy, donald-hornig, dow, drummond-company, edward-teller, eu-emissions-trading-system, firstenergy, florida-power-and-light, frank-ikard, hawthorn-group, heritage-foundation (think tank), james-black, joel-gilbert, keith-mccoy, kenneth-newcombe, kevin-marsh, larry-householder, lee-raymond (person), make-sunsets, matrix-llc, michael-madigan, monsanto, national-coal-association, ogilvy-and-mather, peabody-energy, philip-cooney, plastics-industry-trade-groups, rick-santorum, scana, state-of-montana, syngenta, texaco, uc-berkeley, verra (nonprofit), volkswagen, western-fuels-association, willie-soon. Plus, from the slug-noise list but real: american-coalition-for-clean-coal-electricity, charles-g-koch-charitable-foundation, information-council-on-the-environment, us-global-change-research-program.

### transhumanism (5)

icsid (international, 3), jeff-bezos (person, 2), sam-bankman-fried (person, 2), larry-page-google (1, compound: larry-page has a file; google has a file), yuri-milner-jeff-bezos (1, compound: yuri-milner has a file).

### consent (7)

nsa (government, 4), bear-stearns (bank, 3), enron (company, 3), gm (2), david-koch (person, 1), ftc (government, 1), lewis-powell (person, 1).

### blind-pool (14)

us-department-of-justice (10), new-york-attorney-general (5), icsid (international, 3), uber (company, 2), blue-owl (fund, 1), calpers (pension fund, 1), clearview-ai (company, 1), flock-safety (company, 1), greg-brockman (person, 1), mark-zuckerberg (person, 1), ontario-teachers-pension-plan (pension fund, 1), silicon-valley-bank (bank, 1), tether (company, 1), wework (company, 1).

### deep-state (1 + 1)

epa (government, 4); us-immigration-and-customs-enforcement (government, 1; caught by the slug filter, listed here instead).

### demystification (2)

us-air-force (government, 3), defense-intelligence-agency (government, 2).

### saudi-911 (1)

omar-al-bayoumi (unknown, 4). The page's central figure has no file; prince-bandar-bin-sultan and saudi-arabia do.

### recurring-cast (3)

us-department-of-justice (10), omar-al-bayoumi (4), defense-intelligence-agency (government, 2). (carbyne, ehud-barak and israel received files during this audit.)

### trump-conduit (1)

brookfield (company, 1).

### Compound ids: split before researching (not targets as written)

alex-karp-and-peter-thiel, bill-gates-and-paul-allen, jacques-laffitte-and-french-banking-syndicate, jpmorgan-chase-and-citigroup-energy-desks, king-george-i-and-royal-mistresses, larry-page-google, liz-truss-and-kwasi-kwarteng, ltcm-principals-and-1997-nobel-laureates-for-option-pricing-theory, moody-s-and-s-and-p, peter-berlin-and-lucy-edwards, robert-merton-and-myron-scholes, satya-nadella-and-brad-smith, yuri-milner-jeff-bezos, cisa-cyber-safety-review-board (duplicate of csrb). Each should become two or three ids; the extractor is splitting on the wrong token.

### Slug noise, not entities (role descriptions that leaked into the index)

architects-of-the-leveraged-derivative-matching-strategies, assistant-treasurer-who-executed-the-emergency-transfers-of-funds-from-customer-accounts, british-commissioner-of-the-caisse-de-la-dette-1877-79, british-futures-trader-charged-in-2015-with-spoofing-..., brother-and-partner-in-the-silver-accumulation-..., court-appointed-bankruptcy-examiner-who-uncovered-the-repo-105-accounting-scheme, credit-suisse-first-boston-tech-banker-..., digital-research-cp-m-creator, egyptian-ruler-whose-uncontrolled-borrowing-enabled-the-debt-trap, elite-wall-street-hedge-fund-managers, european-merchant-banker-who-arranged-several-of-ismail-s-loans, financial-adviser-who-distributed-bribes-to-legislators-died, french-monarch-who-signed-the-royal-ordinance-enforcing-the-indemnity, french-naval-commander-who-delivered-the-military-ultimatum, general-manager-of-baring-futures-singapore-who-engineered-the-fraud, goldman-sachs-senior-partner-goldman-was-penn-central-s-commercial-paper-dealer, head-of-aig-financial-products-who-built-the-subprime-cds-book, head-of-db-real-estate-securitization, head-of-the-financial-products-group-who-celebrated-leeson-s-phantom-trading-profits, headed-until-1998-by-buzzy-krongard, indonesian-ruling-family-and-associates-..., intermediary-who-pressured-reinach-and-fled-to-england, man-of-business-whom-the-partners-later-blamed-..., merrill-lynch-salesman-who-sold-citron-much-of-the-pool-s-portfolio, mutual-fund-manager-whose-4-1-billion-e-mini-sell-order-..., new-york-attorney-general-whose-investigation-led-to-the-2003-...-settlement, orange-county-treasurer-who-ran-the-leveraged-pool-..., robber-baron-who-attempted-to-corner-erie-shares, salomon-smith-barney-telecom-analyst-barred-for-life-..., seattle-computer-products-qdos-author, secretary-of-state-james-craggs, senior-partner-of-barings-who-drove-the-firm-s-heavy-argentine-underwriting, suez-hero-turned-figurehead-promoter-of-the-panama-company, texas-billionaire-who-led-the-silver-accumulation, the-match-king-who-orchestrated-the-global-fraud-..., the-london-whale-trader-who-built-the-massive-cdx-index-positions, underwriters-of-the-predatory-1825-haitian-loan-float, union-pacific-head-who-launched-the-secret-kuhn-loeb-raid, us-attorney-general-during-the-2001-antitrust-settlement, wall-street-titan-whose-firm-bought-northern-pacific-stock-for-the-hill-camp. Every one of these is the parenthetical after an insider's name in a Crash Conduits node (e.g. `"Robert Citron (Orange County Treasurer who ...)"`); the extractor should drop text inside parentheses. Also plain non-entities: head-of-fx-trading, head-of-kuhn, partner-at-lee, insurance-magnate (truncated fragments of the same parentheticals), and `total` (4 mentions: the word, not the oil company, in at least some hits; check before researching).

---

## 2. Crash Conduits nodes with no researched insider

68 nodes; 20 have no attached entity with a findings file. "Attached" = entities whose `mentions[].href` points at the node. Sorted by year.

| node id | year | title | insiders (index attached) |
|---|---|---|---|
| tulip-1636 | 1636 | Tulip Mania: The Proto-Derivative Enclosure | Planter Elite; Amsterdam Notaries; Dutch Regents; VOC Merchants (4) |
| south-sea-1720 | 1720 | South Sea Bubble: Sovereign Debt Privatization via Bribes | John Blunt; John Aislabie; James Craggs; King George I (4) |
| mississippi-1720 | 1720 | Mississippi Bubble: Central Bank Fiat Enclosure | John Law; Duke of Orléans; Banque Royale (3) |
| haiti-indemnity-1825 | 1825 | The Haiti Sovereign Gunboat Indemnity & French Bank Refinance | Charles X; Baron René de Mackau; Jacques Laffitte (6) |
| overend-gurney-1866 | 1866 | Overend, Gurney & Co. Collapse & The Bank of England Panic | John Henry Gurney; Henry Edmund Gurney; Edward Watkin Edwards (4) |
| erie-railroad-war-1868 | 1868 | The Erie Railroad War & The Counterfeit Stock Printing Press | Jay Gould; Jim Fisk; Daniel Drew; Cornelius Vanderbilt (5) |
| khedivate-egypt-1876 | 1876 | Khedivate of Egypt Bankruptcy & Anglo-French Debt Condominium | Khedive Ismail; Evelyn Baring; Hermann Oppenheim (7) |
| baring-crisis-1890 | 1890 | The Baring Crisis & The Bank of England Sovereign Guarantee | Edward Charles Baring; William Lidderdale; Miguel Juárez Celman (5) |
| panama-canal-scandal-1892 | 1892 | The Panama Canal Scandal & French Parliamentary Slush Fund | Ferdinand & Charles de Lesseps; Jacques de Reinach; Cornelius Herz (7) |
| northern-pacific-corner-1901 | 1901 | The Northern Pacific Corner & The May 9 Wall Street Panic | J. P. Morgan; E. H. Harriman; Jacob Schiff (6) |
| match-king-swindle-1932 | 1932 | The Kreuger & Toll 'Match King' Swindle & Forged Sovereign Bonds | Ivar Kreuger; Donald Durant (4) |
| herstatt-risk-1974 | 1974 | Bankhaus Herstatt Collapse & Cross-Currency Settlement Risk | Iwan Herstatt; Hans Gerling; Dany Dattel (5) |
| continental-illinois-1984 | 1984 | Continental Illinois Bank Run & The Birth of 'Too Big To Fail' | Roger Anderson; Todd Conover; William Isaac (3) |
| chernobyl_evac_1986 | 1986 | Chernobyl May Day Concealment & Nomenklatura Evacuation | Gorbachev; Shcherbytsky; Chebrikov (3) |
| orange-county-1994 | 1994 | Orange County Bankruptcy & Wall Street Inverse Floater Gambles | Robert Citron; Michael Stamenson (4) |
| barings-leeson-1995 | 1995 | The Collapse of Barings Bank & The Account 88888 Concealment | Nick Leeson; Peter Norris; Ron Baker (6) |
| theranos_2015 | 2003 | Theranos: The National Security Board Shield | Holmes; Balwani; Shultz; Mattis; Kissinger; Boies (8) |
| fukushima_tsunami_2011 | 2008 | Fukushima TEPCO Tsunami Concealment & Meltdown Silence | Katsumata; Shimizu; NISA (3) |
| flash-boys-2010 | 2010 | The Flash Crash of May 6, 2010 & The High-Frequency Trading Meltdown | Eric Hunsader; Waddell & Reed; Navinder Sarao (5) |
| lme-nickel-short-squeeze-2022 | 2022 | The London Metal Exchange Nickel Squeeze & The Midnight Trade Cancellation | Xiang Guangda; Matthew Chamberlain; Nicolas Aguzin (2; Xiang and Aguzin not indexed) |

Pattern: every node before 1970 is uncovered, so the "400 years" framing rests entirely on unresearched material. Cheapest wins: theranos_2015 (8 indexed insiders, all well documented), erie-railroad-war-1868 and northern-pacific-corner-1901 (people with abundant primary sources), continental-illinois-1984 (FDIC history is online), flash-boys-2010 (SEC/CFTC report).

---

## 3. Handoff gaps

### Records and grades (`node research/validate-handoffs.mjs`, "if all links are approved")

**A (33):** aguas-argentinas, bp-privatisation-uk, braingate-blackrock-synchron, british-rail-privatisation, calo-siri, chile-pension-privatization-1981, cia-c2s-aws, cochabamba-water-bechtel, conrail-privatization, darpa-synapse-ibm-truenorth, dera-qinetiq-privatisation, healthcare-gov-contract, japan-post-privatization, korea-first-bank-newbridge, landsat-eosat-commercialization, mrc-lmb-cambridge-antibody-technology, nasa-cots-spacex, nhs-npfit-cancellation, nih-mrna-moderna, nsf-dli-google, nsfnet-commercial-backbone, petro-canada-privatization (0 claims examined), royal-mail-privatisation, russia-loans-for-shares, sallie-mae-privatization, shuttle-commercial-crew, taxol-nci-bms, telmex-privatization, treuhand-east-germany, uk-national-air-traffic-services, us-weather-data-commercialization, ypf-privatization, zambia-copper-privatization.
**B (1):** korea-exchange-bank-lone-star.
**C (4):** darpa-grand-challenge-waymo, human-genome-celera, keyhole-google-earth, ncsa-mosaic-netscape.
**D (4):** darpa-lifelog-facebook, darpa-tia-programs, futuregen-cancellation (0 links), iraq-cpa-order-39 (0 links).

The four D records are the ones that test popular claims; two of them have no typed links at all, so they cannot rise above D without new research (FutureGen: any private successor? Iraq CPA: which assets actually transferred?).

### `unsupported` / `false` claims still asserted on the site

Checked by grepping each claim's key phrase in `public/crash-conduits.html` and `public/blind-pool.html` (42 claims across the 42 records; most concern programmes the site never mentions, e.g. Telmex, Celera, Japan Post, NPfIT, Taxol, Treuhand, which appear only on handoffs.html if approved).

| handoff | claim (assessment) | site status |
|---|---|---|
| russia-loans-for-shares | "Yukos, Norilsk Nickel and Sibneft were privatized via rigged voucher auctions designed by Harvard HIID advisors and USAID" (unsupported) | **Still asserted verbatim.** Node `russia_hiid_looting_1993` quid_pro_quo: "Western advisors under Harvard HIID and USAID designed 'Loans-for-Shares' voucher auctions ... (Norilsk Nickel, Yukos, Sibneft) for virtually nothing"; theft_mechanism: "Rigged voucher auctions". The record says loans-for-shares (1995) and voucher privatization (1992–94) were different programmes and HIID's documented role was in the voucher/GKI side. |
| nasa-cots-spacex / shuttle-commercial-crew | COTS/CRS were sole-source; SpaceX took the Shuttle's job at retirement (false) | **Still asserted.** The Musk node's legacy/structural_legacy reads "NASA sole-source commercial crew contracts". Both handoffs document competed awards (COTS 2006, CRS 2008, CCtCap 2014 to two vendors). |
| darpa-tia-programs | "Palantir is TIA's private successor" (unsupported) | **Hedged but title still implies it.** Node `darpa-tia-palantir-enclosure-2003` now says "No public evidence shows TIA code or designs were transferred to Palantir", but the title ("Continued in Secret, and the Palantir Parallel"), who_gained and legacy ("moving surveillance research into ... private contractors") carry the migration reading. |
| korea-exchange-bank-lone-star | "10–20 cents on the dollar" (unsupported) | Softened: the Asian-crisis node says buyout funds "bought distressed Korean and other Asian banks at low prices" with no figure. Acceptable. |
| cia-c2s-aws | ordinary public cloud; monopoly at trivial cost (false) | Reconciled: node `bezos-arpa-cia-c2s-cloud-2013` says "private Commercial Cloud Services (C2S) region" and "No documented link connects Gise's government ...". |
| keyhole-google-earth | "Google Earth was created by the CIA" (false) | Not asserted: blind-pool says only that In-Q-Tel "funded Keyhole (which became Google Earth)", which the record supports. |
| darpa-lifelog-facebook, nsf-dli-google, conrail, human-genome-celera and the rest | — | Not on either page (LifeLog, Celera, Mosaic, Order 39, etc. return zero hits; Conrail appears only as the 1976 takeover). |

Two edits are therefore owed to crash-conduits.html before the handoffs go live: the HIID/voucher sentence and the "sole-source commercial crew" phrase.

---

## 4. Open questions by frequency

761 `openQuestions` across 151 files (15 files have none). Files with the most: reid-hoffman 20, peter-thiel 16, bcci 15, keith-rabois 13, roelof-botha 13, blackrock 13, david-sacks 12, fairshake 11, ftx 11, iran 11. Themes below were assigned by keyword; one question can fall in several (about 90% matched at least one). Counts are from the 166-file snapshot.

| # | theme | count | example (file) |
|---|---|---|---|
| 1 | Exact dollar amount, stake, share count or valuation not confirmed | 223 | barclays-global-investors: CVC "$4.4 billion" passages came from Barclays' SEC filings in search snippets only |
| 2 | Site claim with no source found ("not found / not confirmed / could not verify") | 170 | shell: Rhode Island suit "reported to remain in state court ... date and docket were not confirmed" |
| 3 | Primary document never opened (court filing, agency report, PDF, 403/blocked) | 116 | barclays-global-investors: BGI's pre-sale AUM and history "were not retrieved" |
| 4 | Court docket / judgment / plea details unverified | 92 | shell (as above) |
| 5 | Wikipedia-only or secondary-only sourcing flagged | 92 | world-liberty-financial: $500M Jan-2025 investor "attributed to different vehicles (StringZ; Aryam) across secondary sources" |
| 6 | PayPal-mafia cross-links (Thiel, Levchin, Rabois, Botha, Sacks, Hoffman, Howery, Nosek) | 75 | andreessen-horowitz: no sourced a16z co-investment with Craft/Rabois/Hoffman found |
| 7 | Paywalled outlet unreachable (Reuters, Bloomberg, WSJ, FT, NYT) | 74 | world-liberty-financial (as above); "Reuters unreachable" recurs in 8 files |
| 8 | SEC / EDGAR filing not pulled (S-1, 10-K, 13F, 8-K) | 67 | barclays-global-investors (as above) |
| 9 | Verbatim site passage or quotation not confirmed | 60 | world-liberty-financial: Eric Trump's Token2049 words "not captured verbatim" |
| 10 | Senate / House / congressional report not consulted directly | 52 | world-liberty-financial: OGE response to Warren–Merkley letter not found |
| 11 | Saudi / Gulf money (PIF, Bandar, GID, UAE, Qatar, MGX) | 51 | kamal-adham: Senate report says Saudi-intelligence links "require further investigation" |
| 12 | Thiel / Founders Fund / Palantir / Anduril rounds | 43 | andreessen-horowitz: 2026 Anduril round "led by a16z with a large Founders Fund check" only in aggregators |
| 13 | Musk / SpaceX / Tesla / xAI family claims | 40 | errol-musk: Zambian emerald "bypass South African FX controls" claim unsourced |
| 14 | FEC / super-PAC / campaign-finance records | 38 | fairshake: no source states intent to "conceal cryptocurrency" in ads |
| 15 | Trump family / Kushner / World Liberty / Affinity | 35 | world-liberty-financial (as above) |
| 16 | Russia strand (HIID, Yukos, BoNY, Deutsche mirror trades) | 29 | deutsche-bank: FCA dates mirror trades 2012–14, Fed order 2011–15 |
| 17 | Crypto (FTX, Binance, Coinbase, Ripple, Tether, stablecoins) | 29 | fairshake (as above) |
| 18 | BCCI / Adham / Clifford / First American | 27 | clark-clifford: indictment counts differ (UPI four vs Time eight) |
| 19 | BlackRock / Maiden Lane / Federal Reserve programmes | 26 | clark-clifford: Fed's 29 July 1991 release names BCCI, CCAH, Abedi, Naqvi |
| 20 | Climate / fossil fuel / carbon (Exxon, API, Shell, BP, 45Q) | 26 | shell: confirm date and text of the 1988 "Greenhouse Effect" report |
| 21 | Transhumanism / longevity / AI labs (Altos, OpenAI, Neuralink, Calico) | 25 | yuri-milner: no source for Milner's or Bezos's Altos Labs investment |
| 22 | Date / chronology ambiguity | 24 | shell (as above); dmitry-rybolovlev demolition date March vs April 2016 |
| 23 | Intelligence agencies (CIA, In-Q-Tel, NSA, FBI, DARPA, DIA) | 20 | kamal-adham: Senate chapter 11 on CIA liaison; 1981 Fed hearing |
| 24 | Epstein money (Deutsche, JPMorgan, Carbyne, Barak) | 22 | deutsche-bank: DFS consent-order PDF "not opened in full" |
| 25 | UFO / aerospace (AAWSAP, Bigelow, Mogul, Blue Book) | 8 | project-mogul: 1997 report length and release date to confirm from USAF copy |

Recurring named gaps worth a dedicated pass: Carbyne's cap table (carbyne.json now points at founders-fund and 'Unit 8200'; check it sourced the Founders Fund stake the site asserts), Altos Labs funders (Bezos, Milner), the full text of the Senate BCCI report chapters, the DFS 2017 and 2020 Deutsche Bank orders, FRUS 1969–76 vol. XXXVI (cited in 8 files from secondary quotes), and the CIA IG 9/11 executive summary (cia.json records only press coverage).

---

## 5. Connection targets without a findings file

330 `connections[].to` pointers across all findings resolve to 278 distinct targets with no file (after slugifying free-text targets). 50 of them are ids already in `entities.json`; 228 are not indexed anywhere, which means the files are pointing at nodes `web.html` cannot draw. Top 40 by count:

| # | target (slug) | n | toName / toType | indexed? | pointed at by |
|---|---|---|---|---|---|
| 1 | us-department-of-justice (+ u-s-department-of-justice) | 9 + 3 | US Department of Justice / government | yes | andrei-shleifer, bank-of-new-york, binance, changpeng-zhao, deutsche-bank, harvard-hiid, jeffrey-epstein, jonathan-hay, richard-burr; google, halliburton, philip-morris |
| 2 | usaid | 4 | USAID / government | yes | andrei-shleifer, harvard-hiid, jonathan-hay, spacex |
| 3 | saudi-gid | 3 | Saudi GID / government | yes | kamal-adham, prince-bandar-bin-sultan, saudi-arabia |
| 4 | government-of-the-u-s-virgin-islands | 3 | government | no | jeffrey-epstein, jpmorgan-chase, leon-black |
| 5 | russian-federation | 3 | government | no | imf, mikhail-khodorkovsky, yukos |
| 6 | u-s-department-of-the-treasury | 3 | agency | no | fobaproa, saudi-arabia, saudi-arabian-monetary-agency |
| 7 | aig | 3 | AIG / company | yes | goldman-sachs, maiden-lane |
| 7b | apple | 3 | company | no | nso-group, reid-hoffman, us-chamber-of-commerce |
| 8 | barclays-plc | 2 | company | no | barclays-global-investors, blackrock |
| 9 | first-american-bankshares | 2 | company | no | clark-clifford, kamal-adham |
| 10 | new-york-state-department-of-financial-services | 2 | agency | no | deutsche-bank |
| 11 | humain | 2 | company | no | nvidia, saudi-public-investment-fund |
| 12 | new-york-attorney-general | 2 | organization | yes | donald-trump, paypal |
| 13 | silvergate-and-signature-banks | 2 | unknown | yes | ftx |
| 14 | qatari-diar | 2 | company | no | qatar-investment-authority, trump-organization |
| 15 | tevfik-arif | 2 | person | no | bayrock-group, felix-sater |
| 16 | anatoly-chubais | 2 | person | yes | andrei-shleifer, harvard-hiid |
| 17 | hongshan | 2 | HongShan (ex-Sequoia China) / company | no | roelof-botha, sequoia-capital |
| 18 | fincen | 2 | government | no | riggs-bank, trump-taj-mahal |
| 19 | u-s-senate-committee-on-finance | 2 | agency | no | kushner-companies, leon-black |
| 20 | ftc | 2 | agency | yes | amazon, cambridge-analytica |
| 22 | menatep | 2 | company | no | mikhail-khodorkovsky, yukos |
| 23 | wpp | 2 | WPP plc / company | no | burson-marsteller, hill-and-knowlton |
| 24 | square | 2 | Square (Block) / company | no | keith-rabois, roelof-botha |
| 25 | vasiliy-gorshkov | 2 | person | no | paypal-bonus-abuse, paypal-fraud-2000-2002 |
| 26 | mckinsey | 2 | company | no | david-sacks, roelof-botha |
| 27 | ny-fed | 2 | NY Fed / government | yes | blackrock, maiden-lane |
| 28 | nokia | 2 | Nokia Ventures / company | no | max-levchin, paypal |
| 29 | national-smokers-alliance | 2 | advocacy group | no | burson-marsteller, philip-morris |
| 30 | the-stanford-review | 2 | organization | no | david-sacks, peter-thiel |
| 31 | federal-customs-service-of-the-russian-federation | 2 | government | no | bank-of-new-york |
| 32 | us-customs-and-border-protection (two spellings) | 1 + 1 | government | no | anduril |
| 33 | cvc-capital-partners | 1 | fund | no | barclays-global-investors |
| 34 | american-fuel-and-petrochemical-manufacturers | 1 | trade group | no | shell |
| 35 | milieudefensie | 1 | organization | no | shell |
| 36 | city-and-county-of-honolulu | 1 | government | no | shell |
| 37 | us-air-force | 1 | government | yes | project-mogul |
| 38 | sheikh-tahnoon-bin-zayed-al-nahyan | 1 | person | no | world-liberty-financial |
| 39 | breakthrough-prize | 1 | foundation | no | yuri-milner |
| 40 | dst-global | 1 | fund | no | yuri-milner |

New targets from the files written during the audit: Unit 8200, Dustin Moskovitz, Michael Bloomberg, Future Forward USA Action, American Engagement Technologies, Jonathon Morgan, U.S. Senate Select Committee on Intelligence (one pointer each, none indexed). Next by one pointer each (all unindexed): vtb-bank, government-and-ruling-family-of-abu-dhabi, uk-financial-conduct-authority, u-s-house-financial-services-and-intelligence-committees, blackstone-group, lucid-group, george-mason-university, harvard-management-company, abdullah-taha-bakhsh (indexed), bahrain-national-oil-company, bass-enterprises-production-company, union-bank-of-switzerland, calico, kimbal-musk, justin-sun (indexed), rosemary-vrablic (indexed), brian-armstrong (indexed), uber (indexed).

Housekeeping: free-text `to` values ("U.S. Department of Justice", "Federal Reserve", "AIG") coexist with slugs ("us-department-of-justice", "ny-fed", "aig"); `validate.mjs` should normalise or reject non-slug targets, or the web graph will show the same agency twice.

---

## 6. Dossier pages: names absent from entities.json

Capitalized phrases were pulled from each page's text and checked against every `name` and `alias` in the index; what follows is the hand-filtered list of plausible entities (people, firms, agencies, inquiries). Products, statutes and places are listed separately where they might still deserve a node. These must be seeded before Kenoma can pick them up.

### deep-state.html
People: Stephen Miller. Organisations: Protect Ohio Values (super PAC), Project On Government Oversight (POGO), Consumer Reports, FDA, CFPB, OSHA, FAA, Office of Government Ethics (OGE), Federal Election Commission (FEC, cited on four pages, never indexed). Programmes/products: DoD Replicator initiative, ICE ImmigrationOS contract, Anduril Lattice OS, Autonomous Surveillance Towers, Schedule F, GENIUS Act (Public Law 119-27), Langley AFB.
Already indexed: curtis-yarvin, peter-thiel, jd-vance, palantir, anduril, world-liberty-financial, us-immigration-and-customs-enforcement, epa.

### demystification.html
People: Robert C. Seamans Jr. (USAF Secretary, Blue Book termination), Mac Brazel, Gregory W. Pedlow and Donald E. Welzenbach (CIA historians; source authors rather than targets). Organisations: Lockheed Skunk Works / Lockheed Martin, University of Colorado (Condon Committee), NARA, Wright-Patterson AFB, NYU (Mogul contractor), Alamogordo Army Air Field. Documents: Condon Report, "The CIA and the U-2 Program 1954–1974", Roswell Report (1995), DIA contract HHM402-08-C-0072.
Already indexed: area-51, project-mogul, project-blue-book, bigelow-aerospace (alias BAASS), robert-bigelow, harry-reid, us-air-force, defense-intelligence-agency.

### saudi-911.html
People: Fahad al-Thumairy, Musaed al-Jarrah, Judge George B. Daniels, Devin Nunes, Ambassador Abdullah Al-Saud. Organisations/inquiries: 9/11 Commission (National Commission on Terrorist Attacks), congressional Joint Inquiry (2002), 9/11 Review Commission (2015), House Intelligence Committee, Operation Encore (FBI casefile), Royal Embassy of Saudi Arabia, ProPublica, 60 Minutes. Legal: JASTA, Executive Order 14040, In re Terrorist Attacks (MDL 1570), Foreign Sovereign Immunities Act.
Already indexed: omar-al-bayoumi (no file), prince-bandar-bin-sultan, saudi-arabia, saudi-gid, cia, fbi, kamal-adham, carlyle-group, iraq, sec.

### recurring-cast.html
People: William Simon, Richard Nixon, the Shah (Mohammad Reza Pahlavi), King Faisal, King Fahd, Frank Carlucci, James Baker, George H.W. Bush, Robert Altman, Sheikh Zayed / Abu Dhabi ruling family, Sheikh Tahnoon bin Zayed, Ayatollah Khamenei, Nayirah (al-Sabah). Organisations: SIS/MI6, U.S. Treasury, Bank of England, Citizens for a Free Kuwait, Government of Kuwait, Saudi Binladin Group / bin Laden family, First American Bankshares, KBR (aliased to halliburton; may deserve its own node), U.S. Army Corps of Engineers, ICIJ, Chilcot / Iraq Inquiry, Senate Select Committee on Intelligence, Senate Foreign Relations Committee, NY Department of Financial Services, UK Financial Conduct Authority, BuzzFeed News / FinCEN Files, Haaretz, Reporty (Carbyne's former name), Humain, ODNI / Director of National Intelligence, IAEA. 
Already indexed: cia, bp, kamal-adham, bcci, hill-and-knowlton, carlyle-group, bank-of-new-york, deutsche-bank, halliburton, dick-cheney, softbank, saudi-public-investment-fund, mubadala, jeffrey-epstein, ehud-barak, carbyne, iran, donald-trump, world-liberty-financial, mgx, g42, xai, nvidia, openai, israel, benex-worldwide, peter-berlin-and-lucy-edwards (compound), clark-clifford, henry-kissinger (no file), saudi-arabian-monetary-agency.

### trump-conduit.html
People: Michael Cohen, Dmitry Peskov, Eric Trump, Senator Ron Wyden, Judge Arthur Engoron, Robert Mueller / Special Counsel, Tevfik Arif (named in two findings, section 5). Organisations: Citibank and the 1990 lender group, New Jersey Casino Control Commission, FinCEN, FL Group (Iceland), Anbang Insurance, Lunate (Abu Dhabi), Mazars, CREW, GSA, SBA, House Oversight Committee, Senate Finance Committee, Qatari Diar, Dar Al Arkan (dar-global is indexed; the parent is not), Token2049. Properties worth a node if the conduit thesis is developed: Trump SoHo, Maison de l'Amitié, Old Post Office hotel, Doral, 40 Wall Street, Park Lane hotel, $TRUMP memecoin.
Already indexed: donald-trump, trump-organization, trump-taj-mahal, deutsche-bank, rosemary-vrablic (no file), dmitry-rybolovlev, felix-sater, bayrock-group, kushner-companies, jared-kushner, affinity-partners, brookfield (no file), qatar-investment-authority, world-liberty-financial, mgx, binance, changpeng-zhao, justin-sun, dar-global, steve-witkoff, new-york-attorney-general (alias Letitia James; no file).

### Cross-page agencies that should be seeded once and typed `government`
U.S. Treasury, FinCEN, FEC, OGE, ODNI, Bank of England, Senate Finance Committee, Senate Intelligence Committee, House Oversight Committee, NY DFS, UK FCA. Several already receive inbound `connections[].to` pointers (section 5), so seeding them closes two gaps at once.
