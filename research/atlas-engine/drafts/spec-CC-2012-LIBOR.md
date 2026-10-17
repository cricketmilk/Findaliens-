# NODE SPEC: CC-2012-LIBOR

## Fixed fields (use exactly)
- code: "CC-2012-LIBOR"
- eraId: "ERA-09-2001"
- yearStart: 2005, yearEnd: 2016
- primaryTab: "crash-conduits"
- secondaryTabs: pick 1-2 from ["deep-state", "consent"]
- mechanism: "DERIVATIVE_CLEARING_CAPTURE" (you may instead pick a better fit from CENTRAL_BANK_LIQUIDITY, LEVERAGED_WATERED_CAPITAL, DERIVATIVE_CLEARING_CAPTURE, OFFSHORE_BLACK_LEDGER, SOVEREIGN_DEBT_TRAP, REGULATORY_REVOLVING_DOOR)
- tier: "TIER_1_STATUTE_COURT"
- auditDisposition: "DOCUMENTED"

## Historical anchors (established facts you may use)
- LIBOR: the London Interbank Offered Rate, a daily benchmark set from submissions by a panel of major banks (British Bankers' Association from 1986), pricing hundreds of trillions in derivatives, mortgages and loans.
- From at least 2005, derivative traders at panel banks (UBS, Royal Bank of Scotland, Barclays among them) routinely requested submitters move LIBOR fixings to profit interest-rate-swap and other positions; in the 2008 crisis period, banks also lowballed submissions to appear healthier.
- June 2012: Barclays pays roughly £290m (~$450m) to FSA, CFTC and DOJ. December 2012: UBS pays $1.5bn. February 2013: RBS pays ~$612m. UBS trader Tom Hayes convicted 2015 (14 counts).
- The consolidated private antitrust litigation ("In re LIBOR-Based Financial Instruments Antitrust Litigation", MDL 2262, S.D.N.Y.) was dismissed at the pleading stage; the Second Circuit affirmed in May 2016 — plaintiffs could not show antitrust injury from the rate rigging, pushing claims into commodity/fraud theories.
- Aftermath: UK Financial Services (Banking Reform) Act 2013 criminalised benchmark manipulation; administration of LIBOR moved to ICE Benchmark Administration (2014); LIBOR formally retired as an index in stages 2021-2023.
- The rigged compass priced student loans, mortgages and municipal swaps across the world while its custodians traded against it.

## Decoy suggestion (adapt freely, do not invent facts)
- viralDecoy: "Regulators (the Fed / Bank of England) ordered the low submissions in 2008, so the whole scandal was official policy and no one was defrauded."
- whyDecoyFails: the pre-2008 profit-driven rigging is documented independently in DOJ settlement statements and the court record; regulator-awareness of crisis-period lowballing is a separate, narrower fact.
- documentedLedger: extraction ran through the derivative books — panel banks moved the world's reference rate to win their own swaps.

## Citations (reproduce ALL verbatim, byte-identical)
[
  { "id": "CIT-2012-CL-2147688", "tier": "TIER_1_STATUTE_COURT", "title": "In Re Libor-Based Financial Instruments Antitrust Litigation (802 F. Supp. 2d 1380, 2011-08-12)", "url": "https://www.courtlistener.com/opinion/2147688/in-re-libor-based-financial-instruments-antitrust-litigation/", "quoteOrFact": "Filed 2011-08-12 in United States Judicial Panel on Multidistrict Litigation" },
  { "id": "CIT-2012-CL-8724049", "tier": "TIER_1_STATUTE_COURT", "title": "In re Libor-Based Financial Instruments Antitrust Litigation (935 F. Supp. 2d 666, 2013-03-29)", "url": "https://www.courtlistener.com/opinion/8724049/in-re-libor-based-financial-instruments-antitrust-litigation/", "quoteOrFact": "Filed 2013-03-29 in District Court, S.D. New York" },
  { "id": "CIT-2012-CL-3205849", "tier": "TIER_1_STATUTE_COURT", "title": "In re: LIBOR-Based Financial Instruments Antitrust Litigation (Court of Appeals for the Second Circuit, 2016-05-23)", "url": "https://www.courtlistener.com/opinion/3205849/in-re-libor-based-financial-instruments-antitrust-litigation/", "quoteOrFact": "Filed 2016-05-23 in Court of Appeals for the Second Circuit" },
  { "id": "CIT-2012-SEC-0001193125-13-106100", "tier": "TIER_3_PRIMARY_LEDGER", "title": "SEC Form 20-F — UBS AG (CIK 0001114446) (2013-03-14)", "url": "https://www.sec.gov/Archives/edgar/data/1114446/000119312513106100/0001193125-13-106100-index.htm", "quoteOrFact": "SEC EDGAR Accession 0001193125-13-106100 filed 2013-03-14 by UBS AG (CIK 0001114446)." },
  { "id": "CIT-2012-SEC-0001191638-14-001065", "tier": "TIER_3_PRIMARY_LEDGER", "title": "SEC Form 6-K — Lloyds Banking Group plc (CIK 0001160106) (2014-07-28)", "url": "https://www.sec.gov/Archives/edgar/data/1160106/000119163814001065/0001191638-14-001065-index.htm", "quoteOrFact": "SEC EDGAR Accession 0001191638-14-001065 filed 2014-07-28 by Lloyds Banking Group plc (CIK 0001160106)." },
  { "id": "CIT-2012-SEC-0000950103-13-000897", "tier": "TIER_3_PRIMARY_LEDGER", "title": "SEC Form 6-K — ROYAL BANK OF SCOTLAND GROUP PLC (CIK 0000844150) (2013-02-06)", "url": "https://www.sec.gov/Archives/edgar/data/844150/000095010313000897/0000950103-13-000897-index.htm", "quoteOrFact": "SEC EDGAR Accession 0000950103-13-000897 filed 2013-02-06 by ROYAL BANK OF SCOTLAND GROUP PLC (CIK 0000844150)." }
]
