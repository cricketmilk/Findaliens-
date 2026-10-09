# Hot-money conduits: where the draft analysis stands against the record

This note maps the seven-chain "hot money never evaporates" analysis onto the
Crash Conduits page and the research records written to test it. It is a
working document for the owner, not site content. The records it cites are
drafts in `research/findings/` and `research/handoffs/` until approved with
`node research/review.mjs`.

The analysis's thesis: *hot money is not destroyed in a crash; it is converted,
moved through a legal or regulatory blind spot, and re-lodged in a new conduit
(physical infrastructure, a sovereign monopoly, a non-depreciating asset).*

Each chain lists the Crash Conduits nodes it touches
(`public/crash-conduits.html#<id>`), the records written for it, and a verdict
on each claim: **supported**, **partly**, **contradicted** or **unsupported**.
The nodes carry no citations of their own; the records are where the sourcing
lives.

How the records were made, and the two caveats that apply to every verdict:

1. Seven research agents, one per chain, each briefed with the repo's
   `entity-research` and `handoff-research` skills and told to treat every
   sentence of the analysis as a claim to test.
2. The session's network policy blocked every outside host, so no page was
   opened. Sources were located with web search and cited verbatim from the
   search results, with the supporting passage copied from what the search
   returned. Quotes may therefore be the search tool's rendering rather than
   the page's exact words. **Run `node research/check-links.mjs` before
   reviewing**, and treat each `openQuestions` entry as the agent's own list
   of what it could not pin down.
3. The search budget ran out for every agent before its list was done. Each
   file's `openQuestions` names the searches that never ran.

---

## 1. Apartheid-era capital → Zip2/Compaq → PayPal/eBay → SpaceX, Tesla, Starlink

Nodes: `musk_apartheid_zip2`, `paypal-mafia-2002`, `dot-com-bubble-2000`.
Handoffs already on the ledger: `nasa-cots-spacex`, `shuttle-commercial-crew`.

Records: new `spacex`, `tesla`, `zip2`, `compaq`, `ebay`, `errol-musk`
findings; one `claims` entry appended to each of the two handoffs.

- Zambian emerald operations "controlled by Errol Musk" that "bypassed South
  African exchange controls" — **unsupported**. No source mentions exchange
  controls, capital flight or syndicates. Errol Musk's own account (via
  Isaacson) is a 1986 plane-for-emeralds trade with mines someone else owned,
  stones imported *into* South Africa and sold abroad, "none of it legal", law
  unspecified. Recorded as open questions, not facts.
- Emerald money "deployed into Zip2 and X.com" — **unsupported**; only the
  family's conflicting statements, already in `elon-musk`.
- Compaq bought Zip2 for $307M cash — **supported** (Compaq 8-K, Feb 1999;
  AltaVista S-1: $340.9M total, $307.2M cash; closed April 1999).
- eBay bought PayPal for $1.5B — **supported** (PayPal 8-Ks, July and
  October 2002; stock-for-stock).
- "Musk syndicate netted $175M+" — **partly**: ~$176M for Musk personally
  (Vance via Wikipedia), in stock value; "syndicate" has no source.
- "Thiel network hundreds of millions" — **contradicted**: Thiel personally
  ~$55M; no source aggregates a "network".
- Proceeds "channeled into SpaceX and Tesla" — **partly**: Tesla Series A
  ~$6.5M from Musk's PayPal proceeds is reported (secondary sources only);
  the ~$100M-into-SpaceX figure appeared only on fan sites.
- "NASA sole-source COTS/Commercial Crew" — **contradicted**: COTS chose
  from 20 applicants; CRS went to two companies; Commercial Crew to Boeing
  ($4.2B) and SpaceX ($2.6B). Handoff claim assessed **false**.
- "Displacing the public Space Shuttle" — **contradicted on cause**: the
  retirement was decided in January 2004, two and a half years before COTS.
  Function transfer is real. Handoff claim assessed **partly-true**.
- DOE ATVM loan — **supported** ($465M, 2010; repaid May 2013 with a
  $10.8M penalty, per Tesla's 10-K).
- ZEV credits paid by legacy automakers — **partly**: regulatory-credit
  revenue 2020–2025 is in the 10-Ks ($1.47B–$2.76B a year); the passage
  naming the buyers was not retrieved.
- Starlink as sovereign/battlefield telecom (Ukraine/Crimea 2022) —
  **partly**: USAID bought ~1,500 terminals and SpaceX donated ~3,700
  (USAID OIG); the Pentagon confirmed a contract in June 2023; a reported
  $1.8B NRO Starshield contract. The Crimea coverage dispute is recorded as
  three separate facts (Isaacson's claim, Musk's denial, CNN's report of the
  walk-back) and left unresolved.

Round two added: Musk's $100M of his own money into SpaceX (CNBC, 2020) and
his stake through the 2026 IPO filings; Tesla's S-1 exhibits naming Musk's
trust among the Series A stockholders (the round's size stays secondary);
NASA's 2004 sole-source Kistler notice, SpaceX's protest and NASA's withdrawal
(no GAO ruling exists because NASA withdrew first).

## 2. HIID / loans-for-shares → Bank of New York → Deutsche mirror trades → Londongrad

Nodes: `russia_hiid_looting_1993`, `russia_bony_1998`, `deutsche_mirror_trump_2011`.
Handoff already on the ledger: `russia-loans-for-shares` (grade A).

Records: new `harvard-hiid`, `andrei-shleifer`, `jonathan-hay`,
`bank-of-new-york`, `deutsche-bank`, `roman-abramovich`; one `claims` entry
appended to the handoff.

- "IMF loans and central-bank reserves" as the hot money — **unsupported**;
  nothing in the DOJ record ties the Benex flows to IMF money (the IMF/PwC
  FIMACO audit was never reached).
- Yukos, Norilsk Nickel, Sibneft "privatized via rigged voucher auctions" —
  **contradicted on mechanism**: they went through the 1995 loans-for-shares
  auctions, not the 1992–94 voucher programme. "Rigged" holds for Sibneft via
  the approved 2012 judgment.
- "Designed by HIID advisors (Shleifer, Hay) and USAID" — **unsupported**.
  HIID advised Chubais's privatization committee and later capital-markets
  reform; no source says it designed either auction programme. The federal
  case was about personal investments breaching conflict-of-interest rules,
  and settled in 2005 for $26.5M (Harvard), $2M (Shleifer) and $0.5–2M
  (Hay). Handoff claim assessed **unsupported**.
- BoNY conduit "$7B to $10B" — **partly**: ~$7B per DOJ and the 2005
  non-prosecution agreement; $10B is a 1999 press estimate only.
- Through Benex, BECS and Torfinex — **supported** (the entity is Benex
  International, not "Benex Worldwide").
- Edwards and Berlin, BoNY's Eastern European Division — **supported**; both
  pleaded guilty in February 2000.
- "Just before the August 1998 default" — **contradicted**: the sourced
  window is February 1996 to July 1999.
- "Into Cyprus and Liechtenstein" — **unsupported**; neither appears in any
  source opened.
- Deutsche Bank mirror trades, ~$10B, Moscow/London/New York — **supported**
  (NYDFS $425M, January 2017; FCA £163M; Fed $41M, May 2017).
- Deutsche private-wealth loans to Trump — **unsupported this round** (no
  source reached).
- "Londongrad" behind anonymous trusts with zero disclosure — **partly,
  generically**: TI-UK's £1.5B figure (2022) and the Register of Overseas
  Entities (August 2022) are sourced, but nothing ties them to the BoNY flows
  or to Abramovich. Parked as open questions.
- Berezovsky v Abramovich (2012) — **supported**: the claim to half of Sibneft
  was rejected; payments were for protection.

Round two added: the July 1998 package from the IMF's own release (SDR 8.5bn,
first drawing cut by SDR 600m) and its 1999 statements on the PwC audit (the
Board "took note of the findings that the July 1998 tranche ... had not been
misappropriated" and "expressed strong disapproval" of the FIMACO
channelling); the Deutsche mirror-trades probe going dormant with no charge
ever brought; Deutsche's more than $2 billion of lending to the Trump
Organization and Trump v. Deutsche Bank (2d Cir. 2019); new `yukos` and
`mikhail-khodorkovsky` files covering the 1995 auction, the 2004
Yuganskneftegaz sale, the 2006 bankruptcy, the $50bn PCA award and its
annulment, reinstatement and final Dutch dismissal (October 2025).

## 3. Tequilazo and the Asian crisis → Fobaproa / IMF programmes → Lone Star, Newbridge, Carlyle

Nodes: `mexico_tequilazo_1994`, `asian-financial-crisis-1997`, `japan_bubble_vultures_1989`.

Records: new `fobaproa`, `lone-star-funds`, `newbridge-capital`,
`carlyle-group` findings; facts appended to `imf`; new handoffs
`korea-exchange-bank-lone-star` (grade B) and `korea-first-bank-newbridge`
(grade A).

- Chiapas / Colosio → run on reserves — **partly**: a May 1994 Treasury memo
  (via NBER) puts ~$10B spent defending the peso since the Colosio
  assassination; Chiapas is not addressed by any retrieved source.
- Insiders warned, "dumped pesos days before December 20" — **contradicted
  on timing**: the IMF's own history says resident outflows came "in the days
  that followed" the announcement, probably led by those warned at the Pacto
  meeting the night before. No source names insiders. The D'Amato inquiry was
  about what the US Treasury knew.
- Fobaproa "$55B+" — **supported as a 1998–99 floor** (Atlanta Fed); later
  estimates run to 13–22% of GDP.
- Non-performing loans converted into public debt — **supported** (December
  1998 law creating IPAB; the Mackey audit found ~$7.3B of loans outside the
  programme's criteria and related-party lending).
- "Elites kept evacuated offshore dollars" — **unsupported**.
- IMF conditionality closed 56 Thai finance companies — **supported**.
- IMF "broke up Korean chaebols" — **unsupported** in the documents
  retrieved: the December 1997 letter of intent commits to lower debt ratios,
  transparency, bank exits and foreign bank purchases, not break-ups.
- Lone Star bought KEB, "a Tier-1 bank, at 10–20 cents on the dollar" —
  "fifth-largest lender" **supported**; the discount **unsupported** (1.38tn
  won for 51% including new capital; no book value found; the official
  accused of lowering the price was cleared in 2008).
- "Recapitalized on the backs of local taxpayers" — **supported
  system-wide** (168.7tn won of public funds, 72.5% recovered) and **for
  KFB** (5.7tn won injected before the 500bn-won sale to Newbridge, resold to
  Standard Chartered for $3.3B); **unsupported for KEB** specifically.
- Carlyle/KorAm — the deal is **supported** but KorAm was not a public asset,
  so no handoff was written.
- "Evacuating hot money re-entered through these funds" — **unsupported**;
  nothing links 1997 outflows to the funds' capital.
- Lone Star v. Korea at ICSID: the $216.5M award (2022) was **annulled in
  full in November 2025**, with Lone Star ordered to pay costs.

Still open: KEB's pre-2003 shareholding (the Bank of Korea stake in the
draft is unconfirmed); the Korea February 1998 letter of intent; Paul Yoo's
final appeal.

## 4. BCCI → offshore architecture

Nodes: `bcci_1991`, `harken_energy_1990`.

Records: facts appended to `bcci` (now 30 items) and a connection to `cia`;
new `clark-clifford`, `kamal-adham`, `agha-hasan-abedi`.

- BCCI "established the architecture of modern offshore wealth shielding and
  dark-money financing" — **unsupported**; no source states it.
- Luxembourg/Cayman incorporation, London management, Abu Dhabi 77%, First
  American — **supported** (Senate Foreign Relations Committee report, 1992;
  Bank of England report). Saudi Arabia enters only through Kamal Adham
  personally.
- "CIA black-budget financing for the mujahideen" — **unsupported this
  round**. What the Senate found: the CIA held accounts at and used
  BCCI/First American for operations and knew of the secret First American
  purchase by 1985.
- "Dual ledger" — **partly**: the Senate describes ICIC as a "bank within a
  bank" and a two-auditor split designed to hide fraud. Unbacked insider loans
  and nominee/shell structures are **supported**.
- "78 countries" — **contradicted**: the Senate summary says 73.
- "Bank of England and Morgenthau shut it down in 1991" — **partly
  contradicted**: the 5 July 1991 closure was coordinated supervisors led by
  the Bank of England; Morgenthau's indictment came on 29 July, after.
- "Billions missing" — **loosely supported**, but creditors ultimately
  recovered about 90% (2012–13 figures).
- Insiders and Gulf royals "pulled out before the freeze" — **unsupported,
  partly contradicted**: Abu Dhabi was the 77% owner at closure after putting
  in more than $1B in 1989–90.
- Staff and structures "migrated into Swiss desks, Cayman trusts,
  Liechtenstein anstalts" — **unsupported**; a targeted search found nothing.
  What is sourced: the Geneva affiliate was sold in July 1991; BCCI's own
  Cayman/Luxembourg entities were liquidated over two decades.

Round two added: verbatim Senate chapters 9, 10, 11 and 14 (the Morgenthau
indictment, the Sandstorm findings, the CIA's accounts and Abu Dhabi's
stake); the liquidation dividend history to 81% by 2005 (the final 2012
figure is still an unverified lead); Abedi's 1994 UAE conviction in absentia;
Kamal Adham's role per the Senate report.

## 5. 2008 → AIG / Maiden Lane → BlackRock and BGI

Nodes: `aig-goldman-cds-2008`, `blackrock-maidenlane-2008`, `subprime-conveyor-2007`, `repo-105-lehman-2008`, `paulson_eton_park_2008`.

Records: new `maiden-lane`, `barclays-global-investors`, `larry-fink`;
facts appended to `blackrock`, `goldman-sachs`, `federal-reserve`.

- Goldman sold synthetic CDOs while short — **supported** (Senate PSI 2011:
  Hudson, Anderson, Timberwolf, Abacus; peak net short $13.9B). Morgan
  Stanley and "to pension funds" — **unsupported**.
- Collateral demanded from AIG — **supported** (Goldman kept $8.4B collateral
  plus $5.6B from Maiden Lane III; FCIC).
- Maiden Lane III under Geithner — **supported with a nuance**: SIGTARP
  reported Geithner did not take part in the counterparty negotiations.
- "Paid 100 cents on the dollar" — **supported** (SIGTARP: "effectively par",
  $62.1B including ~$35B of collateral already held).
- "$93.2B total payouts" — **partly**: Reuters/NBC reported "$93 billion"
  and Goldman's $12.9B across collateral, Maiden Lane III and securities
  lending; the exact breakdown was not located. The par finding applies to
  the $62.1B of CDS, not the whole $93B.
- Assets "trading at less than 50% of face value" — **supported** (NY Fed:
  fair value ~$29.6B against ~$62.1B face, October 2008).
- "Fed and Treasury lacked the infrastructure to value" — **unsupported**;
  GAO says the Reserve Banks "relied more extensively on vendors".
- "No-bid contracts to BlackRock" — **supported** for Maiden Lane LLC
  (Waxman, April 2008: awarded "without competition"; fees ~$71M in year
  one). The contracting party was the NY Fed, not Treasury.
- BlackRock "leveraged insider visibility to purchase BGI" — **unsupported**;
  GAO found conflict policies could be strengthened; nothing more.
- BGI/iShares bought in 2009 — **supported** (binding offer June 2009,
  ~$13.5B; completed December 2009 at $15.2B; Barclays kept 19.9%; CVC's
  prior iShares deal terminated with a $175M fee).
- "For pennies on the dollar" — **unsupported, contrary in effect**: Barclays
  booked a gain; BlackRock's AUM went from $1.3T to $3.3T.
- "Permanently capitalized BlackRock" — **unsupported**: Maiden Lane fees of
  roughly $71M plus up to ~$50M against $6.6B cash and shares paid for BGI.
- "$10T+ AUM" — **supported and exceeded** ($11.6T end-2024; $14.0T end-2025
  per 10-K). The causal "creating" is not sourced.
- 2020 Fed hiring of BlackRock for corporate-credit facilities — **supported**.

Round two added: AIG's own March 2009 release and the NY Fed's 2010 statement
($22.4B collateral, $26.8B paid for $62.1B par CDOs, $12.1B municipal GIAs;
the components sum to the $93.2B headline, which no source states verbatim);
GAO-11-696 quoted directly (8 of 10 highest-value contracts awarded
noncompetitively "due to exigent circumstances"); Aladdin's scale from
BlackRock's 10-Ks and the Blackstone origin from Blackstone's S-1.

## 6. FTX → political money → Fairshake

Nodes: `ftx_2022`, `fairshake-pac-2024`.

Records: facts appended to `ftx` (now 18) and `fairshake` (now 10); new
`coinbase`, `ripple`.

- Crisis window (Terra, Celsius, Voyager) — **not researched** (budget).
- Customer fiat diverted to Alameda through a backdoor — **supported** as
  allegation, testimony and conviction (CFTC and SEC complaints on the
  liquidation exemption and North Dimension routing; Wang's testimony;
  DOJ sentencing release; SEC consent judgments, December 2025). "To cover
  margin calls, pay off counterparties" — **unsupported** as purposes.
- Bahamian real estate — **supported** (~$300M per FTX counsel; ~38
  properties with a $222M aggregate price sold under court approval, 2024).
- "Over $100M in political donations across party lines" — **partly**: NBC
  reported prosecutors charged more than $100M from customer funds; DOJ's own
  releases say "tens of millions" over 300+ contributions; Salame gave to both
  parties; Bankman-Fried's "all my Republican donations were dark" is quoted.
  His seven convictions do not include the campaign-finance count; Singh and
  Salame pleaded guilty to it.
- "$260M+ pooled into Fairshake" — **matches no single sourced figure**: FEC
  receipts $174.4M and spending $176.9M for 2024; $195.8M spent per
  FactCheck; a reported $193M war chest for 2026. Largest donors Coinbase,
  Ripple and a16z — **supported**.
- Ads "on generic issues, deliberately concealing crypto" — "did not mention
  crypto" **supported** (Washington Post: none of the ads viewed mentioned
  crypto); "deliberately" **unsupported**; "immigration, crime" appeared only
  as an analyst's prediction.
- Unseating Brown and Porter — Brown **supported** ($40.1M by the affiliated
  Defend American Jobs in 2024; ~$30M against him again in 2026); Porter's
  spending **supported** (>$10M) but she was a House member in a Senate
  primary, not a regulator or chair.
- "Legislative capture, pro-industry SEC leadership, banking-rail access,
  immunity" — **unsupported** as stated; "immunity" is partly contradicted by
  the convictions and consent judgments. The specific 2025 events (Coinbase
  dismissal, Ripple resolution, Atkins, GENIUS Act) were never reached and are
  **not recorded**.

Round two added: SEC v. Coinbase (June 2023 complaint; Judge Failla's March
2024 ruling; the SEC's dismissal with prejudice in February 2025) and SEC v.
Ripple (December 2020; the July 2023 and August 2024 Torres rulings; the 2025
dismissal of cross-appeals with the $125M judgment left standing), each with a
`sec` connection; Atkins's confirmation, the GENIUS Act and the CLARITY Act's
House passage as documented facts with no causal language; the SEC's 2024
Silvergate action naming FTX; Terra, Celsius and Voyager as the crisis
window. No source states a causal link from Fairshake's spending to any of
these outcomes; the files say so.

## 7. Public R&D → venture spin-outs → Próspera and the ICSID claim

Nodes: `darpa-ipto-1971`, `bezos-arpa-cia-c2s-cloud-2013`, `darpa-tia-palantir-enclosure-2003`; the Blind Pool page.
Handoffs already on the ledger: `cia-c2s-aws`, `keyhole-google-earth`, `nih-mrna-moderna`, `nsf-dli-google`, `calo-siri`.

Records: facts appended to `prospera` (now 19 facts, 6 connections); new
`pronomos-capital`; one or two `claims` entries appended to each of the
three handoffs.

- AWS "handed off at trivial cost via the $600M CIA C2S contract" —
  **contradicted**, assessed **false**: a paid procurement with a $600M
  ceiling; the Court of Federal Claims opinion records AWS's evaluated price
  of $148M against IBM's $94M; no CIA technology or data passed to Amazon.
- Google Earth "via In-Q-Tel/Keyhole at trivial cost" — **partly-true**:
  In-Q-Tel invested in 2003, Google bought Keyhole in 2004 for an undisclosed
  sum; Keyhole was private and had raised only ~$0.5M.
- Moderna "via NIH patents at trivial cost" — **partly-true**: a paid,
  non-exclusive NIAID licence with a $400M catch-up payment plus low
  single-digit royalties (~1.1% of 2021–22 sales); the inventorship dispute
  was reported abandoned as part of the deal.
- "Profits redirected through offshore blind pools into Próspera" —
  **unsupported**; no source connects any of the three companies or an
  offshore vehicle to Próspera. Próspera's named investors are Pronomos
  Capital, Coinbase Ventures, North Island Ventures and BoostVC.
- "Backed by Founders Fund and Pronomos Capital" — Pronomos **supported**;
  Founders Fund **unsupported** (Bloomberg names Peter Thiel personally as
  Pronomos's anchor investor; no source names the fund).
- ZEDE repeal and the ICSID claim — **supported with precision**: the 2013
  law; Congress abolished ZEDEs on 20 April 2022; the constitutional repeal
  was never ratified by the next legislature; the claim was registered on
  3 February 2023 as ICSID Case ARB/23/2 under CAFTA-DR; the claimants'
  stated ceiling is "as high as US$10.775 billion"; Próspera now puts
  restitution first and $1.6B as the alternative; the Supreme Court declared
  the law unconstitutional in September 2024.
- "Two-thirds of the national budget" — **supported only as cross-year
  arithmetic**: the 2025 budget (L430.9bn, ~$16.9B) makes $10.775B about
  64%; the $1.63B alternative is about 10%.
- "Legal power to extract sovereign revenues" — **unsupported as stated**:
  a pending claim with no award; the tribunal's February 2025 decision
  rejected only a jurisdictional objection; Honduras denounced the ICSID
  Convention (effective 25 August 2024) and re-signed in March 2026.

Still open: the Founders Fund question; Honduras's 2022/2023 budgets in
dollars; verbatim wording of two Próspera statements.

---

## What held up, and what did not

Across all seven chains the same split appears. The **mechanics** hold:
prices, dates, counterparties, penalties, contract terms and court outcomes
are sourced, often to filings and official reports, and in several places
the record is more precise than the analysis (Maiden Lane's $62.1B at par,
Fobaproa's floor, the Deutsche penalties, the ICSID figures). What does not
hold is the **connective tissue**: "sole-source", "trivial cost", "pennies on
the dollar", "insider visibility", "deliberately concealing", "designed by",
"just before the default", "pulled out before the freeze". Each of those is
either contradicted by a date or a price, or has no source at all. The
analysis also runs several distinct programmes together (vouchers and
loans-for-shares; the 2004 Shuttle decision and the 2006 COTS award; Maiden
Lane III and the whole $93B).

For the site, that suggests the honest shape: keep the nodes as the
editorial reading they are, and let each case file's "On The Web" block show
which of its names have sourced research. The Crash Conduits page now does
that.

## What to run next

1. `node research/check-links.mjs` on the new records: every URL was taken
   verbatim from search results and none was opened here.
2. `node research/review.mjs` to approve, edit or reject each item. The
   `openQuestions` in each file are the agent's own doubts; read them first.
3. A second round (three capped agents) has closed the gaps listed under
   each chain above as "Round two added". What remains is in each file's
   `openQuestions`; the largest are the Tesla S-1 narrative on the 2004
   round, the final BCCI dividend, and anything from Reuters, AP, NYT, FT,
   Guardian or BBC, which the search crawler cannot reach.
4. Re-run `node research/extract-entities.mjs` if a page changes.
