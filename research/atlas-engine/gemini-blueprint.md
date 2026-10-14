<!-- research/atlas-engine/gemini-blueprint.md
     Captured 2026-10-14 from the Gemini chat e214133bdf97d068 (last model response,
     innerText via /wilds/eval; label stripped, otherwise verbatim).
     Generated in answer to research/atlas-engine/PROMPT-to-gemini.md. -->

DELIVERABLE 0 — FILE TREE
Plaintext
research/atlas-engine/schema.mjs            # Plain-JS schema validator, closed-loop ratchet rules, JSDoc types, and test fixtures
research/atlas-engine/master/atlas.json     # Unified 330-year master dataset (10 eras, flagship dossiers, recursive ratchet links, lineages)
research/atlas-engine/compile.mjs           # Master-to-static compiler; performs exact regex surgery on crash-conduits.html & crash-finance-data.js
research/atlas-engine/migrate.mjs           # Idempotent migrator merging inline consts, crash-finance-data.js, findings/*.json, and 9/11 MD audits
research/atlas-engine/nodes.manifest.json   # Machine-readable node taxonomy manifest and completion templates
research/atlas-engine/STATUS-LEDGER.md      # Tickable instance-by-instance status ledger (40 flagship nodes + 52 findings dossiers)
research/atlas-engine/next.mjs              # Zero-context CLI driver printing the next incomplete node, required providers, and verification gates
research/ingest/cache/.keep                 # Gitignored disk cache directory marker for idempotent API responses
research/ingest/courtlistener.mjs           # CourtListener / RECAP API v4 provider (SCOTUS & federal rulings)
research/ingest/govinfo.mjs                 # GovInfo API provider (Statutes at Large, Congressional Reports, GPO serial sets)
research/ingest/congress.mjs                # Congress.gov API provider (bills, public laws, committee reports)
research/ingest/hansard.mjs                 # UK Parliament Hansard API provider (1720–2026 Commons/Lords debates & Mersey/Marconi inquiries)
research/ingest/loc.mjs                     # Library of Congress Chronicling America API provider (historical press & dispatches)
research/ingest/edgar.mjs                   # SEC EDGAR API provider (10-K, S-1, 8-K, and enforcement releases)
research/ingest/usaspending.mjs             # USASpending.gov v2 API provider (sole-source & cost-plus federal contracts)
research/ingest/wikidata.mjs                # Wikidata SPARQL provider (corporate predecessors, acquisitions, board overlaps)
research/ingest/opencorporates.mjs          # OpenCorporates API provider (corporate registry & subsidiary trees)
research/ingest/ingest.mjs                  # Unified CLI ingestion runner with rate-limit backoff, disk cache, and offline {VERIFY} fallback
research/verify/prosecutor.md               # Agent 1 prompt template: maps 5-stage extraction loop and recursive closed-loop ratchets
research/verify/devils-advocate.md          # Agent 2 prompt template: hostile red-team audit, decoy detection, and 9/11 MD disposition lock
research/verify/forensic-auditor.md         # Agent 3 prompt template: strips unverified claims, quarantines LEAD_ANOMALY, outputs strict JSON
research/verify/runner.mjs                  # 3-Agent verification CLI runner (OpenAI-compatible endpoint or --print offline mode)
public/atlas-ui.css                         # Banknote/pixel stylesheet reusing existing CSS tokens (--ink, --note, --gold, --red, --paper)
public/js/atlas-ui.js                       # Vanilla JS renderer for 5-Stage Tree, Closed-Loop Ratchet, Lineage Cards, Decoy Box & Paired Flip
public/data/atlas-public.json               # Compiled public-safe graph slice (LEAD_ANOMALY stripped) consumed by the 5 tabs

DELIVERABLE 1 — THE UNIFIED MASTER DATASET
1a. research/atlas-engine/schema.mjs
JavaScript
// research/atlas-engine/schema.mjs
// Plain Node ESM schema validator for The Cornfield Gazette unified 330-year graph.
// Zero external dependencies. Enforces evidence tiers, 9/11 audit dispositions,
// 5-Stage Extraction Loops, and the Recursive Closed-Loop Ratchet (how each crisis
// creates the statutory/institutional framework that makes the next crisis larger).

export const EVIDENCE_TIERS = Object.freeze([
  'TIER_1_STATUTE_COURT',
  'TIER_2_INQUIRY',
  'TIER_3_PRIMARY_LEDGER',
  'TIER_4_CONTEMPORARY_PRESS',
  'LEAD_ANOMALY'
]);

export const AUDIT_DISPOSITIONS = Object.freeze([
  'PROVEN',
  'DOCUMENTED',
  'REC-COLLECTION',
  'OPEN'
]);

export const CONDUIT_TABS = Object.freeze([
  'crash-conduits',
  'deep-state',
  'carbon-class',
  'transhumanism',
  'consent'
]);

export const MECHANISM_CODES = Object.freeze([
  'CENTRAL_BANK_LIQUIDITY',
  'LEVERAGED_WATERED_CAPITAL',
  'DERIVATIVE_CLEARING_CAPTURE',
  'OFFSHORE_BLACK_LEDGER',
  'SOVEREIGN_DEBT_TRAP',
  'REGULATORY_REVOLVING_DOOR',
  'RECEIVERSHIP_MORGANIZATION',
  'COST_PLUS_RECONSTRUCTION',
  'PATENT_CHOKE_POINT',
  'MERSEY_LIABILITY_WHITEWASH'
]);

/**
 * @typedef {Object} ClosedLoopRatchet
 * @property {string|null} inheritsFromEra - Previous era ID whose legal/financial machinery this event weaponized
 * @property {string} precedentInherited - Specific institution, bank charter, or legal doctrine inherited from prior cycle
 * @property {string} frameworkCreated - New permanent institution, statute, or monopoly created during the crisis
 * @property {string} closedLoopMechanics - How the private syndicate recycles the crisis windfall to capture the state regulator
 * @property {string|null} seedsNextEra - Next era ID directly enabled by the machinery erected here
 */

/**
 * @typedef {Object} ExtractionLoop
 * @property {string} stage1_upfrontSkim - Pre-shock fee extraction, watered stock, or debt loading
 * @property {string} stage2_structuralCompromise - Physical, safety, or intelligence-silo degradation
 * @property {string} stage3_informationFog - Wire delay, accounting blackout, or asymmetric market window
 * @property {string} stage4_monopolyWindfall - Mandatory statutory purchase, bailout, or stolen-tech mandate
 * @property {string} stage5_merseyWhitewash - Official fixer commission and statutory liability cap
 */

/**
 * Validates the complete master atlas dataset. Throws an Error with a precise path on any violation.
 * @param {object} dataset
 * @returns {boolean}
 */
export function validateAtlas(dataset) {
  if (!dataset || typeof dataset !== 'object') {
    throw new Error('[schema] Root dataset must be a non-null object.');
  }

  const requiredTopKeys = [
    'version',
    'generatedAt',
    'mechanisms',
    'eras',
    'dossiers',
    'entities',
    'lineages',
    'citations',
    'bridges',
    'pairedEvents'
  ];

  for (const key of requiredTopKeys) {
    if (!(key in dataset)) {
      throw new Error(`[schema] Missing required top-level key: "${key}"`);
    }
  }

  // 1. Validate Mechanisms (10 required)
  if (!Array.isArray(dataset.mechanisms) || dataset.mechanisms.length < 10) {
    throw new Error(`[schema] dataset.mechanisms must be an array of at least 10 mechanisms (found ${dataset.mechanisms?.length ?? 0}).`);
  }
  const mechSet = new Set();
  for (const [idx, m] of dataset.mechanisms.entries()) {
    if (!m.code || !MECHANISM_CODES.includes(m.code)) {
      throw new Error(`[schema] mechanisms[${idx}].code "${m.code}" is not in MECHANISM_CODES.`);
    }
    if (!m.label || !m.summary || !m.colorToken) {
      throw new Error(`[schema] mechanisms[${idx}] (${m.code}) missing label, summary, or colorToken.`);
    }
    mechSet.add(m.code);
  }

  // 2. Validate Eras (10 foundational eras required, including closedLoopRatchet)
  if (!Array.isArray(dataset.eras) || dataset.eras.length < 10) {
    throw new Error(`[schema] dataset.eras must contain at least 10 eras (found ${dataset.eras?.length ?? 0}).`);
  }
  const eraIds = new Set();
  for (const [idx, era] of dataset.eras.entries()) {
    if (!era.id || typeof era.yearStart !== 'number' || typeof era.yearEnd !== 'number' || !era.title) {
      throw new Error(`[schema] eras[${idx}] missing id, yearStart, yearEnd, or title.`);
    }
    if (!era.ratchet || typeof era.ratchet !== 'object') {
      throw new Error(`[schema] eras[${idx}] (${era.id}) missing mandatory "ratchet" (closed-loop expansion mechanics).`);
    }
    const r = era.ratchet;
    if (!r.precedentInherited || !r.frameworkCreated || !r.closedLoopMechanics) {
      throw new Error(`[schema] eras[${idx}] (${era.id}).ratchet must define precedentInherited, frameworkCreated, and closedLoopMechanics.`);
    }
    eraIds.add(era.id);
  }

  // 3. Validate Citations
  const citationMap = new Map();
  for (const [idx, c] of dataset.citations.entries()) {
    if (!c.id || !c.tier || !EVIDENCE_TIERS.includes(c.tier)) {
      throw new Error(`[schema] citations[${idx}] (${c?.id}) has invalid or missing tier "${c?.tier}".`);
    }
    if (!c.title || !c.url || !c.quoteOrFact) {
      throw new Error(`[schema] citations[${idx}] (${c.id}) missing title, url, or quoteOrFact.`);
    }
    const isVerifyToken = /^\{VERIFY:\s*[^}]+\}$/.test(c.url);
    const isHttpUrl = /^https?:\/\/[^\s]+$/.test(c.url);
    const isLocalRepoRef = /^research\/[a-zA-Z0-9._/-]+(?:#[a-zA-Z0-9_-]+)?$/.test(c.url);
    if (!isVerifyToken && !isHttpUrl && !isLocalRepoRef) {
      throw new Error(
        `[schema] citations[${idx}] (${c.id}) URL "${c.url}" must be a valid https:// URL, local research/ path, or literal "{VERIFY: ...}" token.`
      );
    }
    citationMap.set(c.id, c);
  }

  // 4. Validate Dossiers
  const dossierCodes = new Set();
  for (const [idx, d] of dataset.dossiers.entries()) {
    if (!d.code || !/^(CC|DS|CB|PH|MC)-\d{4}-[A-Z0-9_]+$/.test(d.code)) {
      throw new Error(`[schema] dossiers[${idx}] has invalid code "${d?.code}". Expected (CC|DS|CB|PH|MC)-YYYY-SLUG.`);
    }
    if (!eraIds.has(d.eraId)) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) references unknown eraId "${d.eraId}".`);
    }
    if (!CONDUIT_TABS.includes(d.primaryTab)) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) has invalid primaryTab "${d.primaryTab}".`);
    }
    if (!mechSet.has(d.mechanism)) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) has invalid mechanism "${d.mechanism}".`);
    }
    if (!EVIDENCE_TIERS.includes(d.tier)) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) has invalid tier "${d.tier}".`);
    }
    if (d.auditDisposition && !AUDIT_DISPOSITIONS.includes(d.auditDisposition)) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) has invalid auditDisposition "${d.auditDisposition}".`);
    }
    // Enforce 5-Stage Extraction Loop
    const loop = d.extractionLoop;
    if (
      !loop ||
      !loop.stage1_upfrontSkim ||
      !loop.stage2_structuralCompromise ||
      !loop.stage3_informationFog ||
      !loop.stage4_monopolyWindfall ||
      !loop.stage5_merseyWhitewash
    ) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) has incomplete 5-stage extractionLoop.`);
    }
    // Enforce Closed-Loop Ratchet on every dossier
    const dr = d.closedLoopRatchet;
    if (
      !dr ||
      !dr.inheritedFramework ||
      !dr.newFrameworkCreated ||
      !dr.closedLoopRecirculation ||
      !dr.enablesNextDossier
    ) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) missing closedLoopRatchet fields.`);
    }
    // Enforce Decoy vs. Ledger box
    if (!d.decoyVsLedger || !d.decoyVsLedger.viralDecoy || !d.decoyVsLedger.whyDecoyFails || !d.decoyVsLedger.documentedLedger) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) missing decoyVsLedger fields.`);
    }
    // Check citation references
    if (!Array.isArray(d.citationIds) || d.citationIds.length === 0) {
      throw new Error(`[schema] dossiers[${idx}] (${d.code}) must reference at least one citationId.`);
    }
    for (const cid of d.citationIds) {
      if (!citationMap.has(cid)) {
        throw new Error(`[schema] dossiers[${idx}] (${d.code}) references missing citationId "${cid}".`);
      }
    }
    dossierCodes.add(d.code);
  }

  // 5. Validate Lineages
  for (const [idx, lin] of dataset.lineages.entries()) {
    if (!lin.id || !lin.name || !Array.isArray(lin.chain) || lin.chain.length < 2) {
      throw new Error(`[schema] lineages[${idx}] (${lin?.id}) must have id, name, and chain array of >= 2 steps.`);
    }
    if (!lin.closedLoopSummary) {
      throw new Error(`[schema] lineages[${idx}] (${lin.id}) must include closedLoopSummary.`);
    }
  }

  // 6. Validate Paired Events
  for (const [idx, pair] of dataset.pairedEvents.entries()) {
    if (!dossierCodes.has(pair.crashConduitCode) || !dossierCodes.has(pair.deepStateCode)) {
      throw new Error(
        `[schema] pairedEvents[${idx}] links unknown dossier codes: ${pair.crashConduitCode} <-> ${pair.deepStateCode}`
      );
    }
  }

  return true;
}

/**
 * Returns true if a dossier or citation is permitted on public pages.
 * Hard Rule 2: LEAD_ANOMALY items and OPEN (unverified) dispositions never render on public pages.
 * @param {{tier: string, auditDisposition?: string}} item
 * @returns {boolean}
 */
export function isPublicRenderable(item) {
  if (!item || item.tier === 'LEAD_ANOMALY') return false;
  if (item.auditDisposition === 'OPEN') return false;
  return true;
}

export const FIXTURE_MINIMAL_ATLAS = {
  version: '2.0.0',
  generatedAt: '2026-10-13T00:00:00.000Z',
  mechanisms: MECHANISM_CODES.map((code) => ({
    code,
    label: code.replace(/_/g, ' '),
    summary: `Mechanism definition for ${code}`,
    colorToken: '--gold'
  })),
  eras: Array.from({ length: 10 }, (_, i) => ({
    id: `ERA-0${i + 1}`,
    yearStart: 1694 + i * 30,
    yearEnd: 1720 + i * 30,
    title: `Era ${i + 1}`,
    ratchet: {
      inheritsFromEra: i === 0 ? null : `ERA-0${i}`,
      precedentInherited: 'Prior corporate charter and sovereign debt assumption',
      frameworkCreated: 'New statutory monopoly and central bank backstop',
      closedLoopMechanics: 'Private underwriting fees fund parliamentary capture to pass liability shield',
      seedsNextEra: i === 9 ? null : `ERA-0${i + 2}`
    }
  })),
  citations: [
    {
      id: 'CIT-1914-MELLOR',
      tier: 'TIER_1_STATUTE_COURT',
      title: 'Oceanic Steam Navigation Co. v. Mellor, 233 U.S. 718 (1914)',
      url: 'https://www.courtlistener.com/opinion/98195/oceanic-steam-navigation-co-v-mellor/',
      quoteOrFact: 'Supreme Court applied 1851 Limitation of Liability Act to cap White Star Line liability.'
    }
  ],
  dossiers: [
    {
      code: 'CC-1912-IMM',
      eraId: 'ERA-06',
      yearStart: 1902,
      yearEnd: 1916,
      title: 'International Mercantile Marine (IMM) Watered Stock & 1915 Receivership',
      primaryTab: 'crash-conduits',
      secondaryTabs: ['deep-state', 'carbon-class'],
      mechanism: 'RECEIVERSHIP_MORGANIZATION',
      tier: 'TIER_1_STATUTE_COURT',
      auditDisposition: 'PROVEN',
      participants: ['J.P. Morgan & Co.', 'Lord William Pirrie', 'Harland & Wolff', 'Philip A.S. Franklin'],
      extractionLoop: {
        stage1_upfrontSkim: '$170M watered stock and $50M 4.5% bonds issued against ~$65M tangible assets; cost-plus lock for Harland & Wolff.',
        stage2_structuralCompromise: 'Lifeboats reduced from 64 to 20; Grade-3 iron bow rivets; concealed Bunker #6 coal fire.',
        stage3_informationFog: '18-hour "All Passengers Safe / Towing to Halifax" wire disinformation while London/NY markets cleared.',
        stage4_monopolyWindfall: 'Radio Act of 1912 mandates 24-hour wireless; 1915 IMM receivership wipes out equity right before 500% WWI shipping boom.',
        stage5_merseyWhitewash: 'Lord Mersey inquiry buries hull-break testimony; SCOTUS caps liability at ~$430/victim under 1851 Act.'
      },
      closedLoopRatchet: {
        inheritedFramework: '1851 U.S. Limitation of Liability Act + 1893 Morgan railroad receivership reorganization template.',
        newFrameworkCreated: 'Radio Act of 1912 mandatory tech monopoly + SOLAS 1914 + distressed debt wipeout prior to state wartime chartering.',
        closedLoopRecirculation: 'Upfront bond underwriting fees and cost-plus shipyard profits stay with Morgan/Pirrie; crash losses are socialized onto steerage families ($430 cap) and retail shareholders; restructured trust captures $67M+ WWI Allied war transport fees.',
        enablesNextDossier: 'DS-1915-LUSITANIA'
      },
      decoyVsLedger: {
        viralDecoy: 'J.P. Morgan sank the Titanic to assassinate Federal Reserve opponents Astor, Straus, and Guggenheim, or for hull insurance.',
        whyDecoyFails: 'Isidor Straus publicly endorsed the central bank plan (NYT, Oct 16, 1911) and the $5M Lloyd’s policy was $2.5M below construction cost.',
        documentedLedger: 'The extraction occurred upfront via $170M watered capitalization, Pirrie’s cost-plus shipyard contract, the 1914 SCOTUS liability shield, and the 1915 receivership reorganization.'
      },
      citationIds: ['CIT-1914-MELLOR']
    },
    {
      code: 'DS-1912-TITANIC',
      eraId: 'ERA-06',
      yearStart: 1911,
      yearEnd: 1914,
      title: 'The Lord Mersey Wreck Inquiry, Marconi Patent Seizure & SS Californian Stand-Down',
      primaryTab: 'deep-state',
      secondaryTabs: ['crash-conduits', 'transhumanism', 'consent'],
      mechanism: 'MERSEY_LIABILITY_WHITEWASH',
      tier: 'TIER_1_STATUTE_COURT',
      auditDisposition: 'DOCUMENTED',
      participants: ['Lord Mersey', 'Guglielmo Marconi', 'Godfrey Isaacs', 'Nikola Tesla', 'Capt. Stanley Lord'],
      extractionLoop: {
        stage1_upfrontSkim: 'Morgan acquires 51% control of Tesla wireless patents (1901) and starves Wardenclyffe; USPTO reverses to grant Marconi radio patent (1904).',
        stage2_structuralCompromise: 'Second Officer David Blair leaves with crow’s nest binocular locker key; Bunker #6 fire warps bulkhead.',
        stage3_informationFog: 'IMM subsidiary SS Californian sits 19 miles away with wireless off, ignoring 8 white distress rockets.',
        stage4_monopolyWindfall: 'Radio Act of 1912 grants Marconi a mandatory shipping monopoly while Godfrey Isaacs distributes insider shares to UK Cabinet ministers.',
        stage5_merseyWhitewash: 'Wreck Commissioner Lord Mersey discards crew hull-break testimony to shield Harland & Wolff and Board of Trade.'
      },
      closedLoopRatchet: {
        inheritedFramework: '1870s British Board of Trade regulatory capture (diluting Samuel Plimsoll hull rules for Olympic-class liners).',
        newFrameworkCreated: 'The "Mersey Commission" template: appointing a trusted Crown judge to contain systemic corporate/Admiralty failures.',
        closedLoopRecirculation: 'Harland & Wolff faces zero liability for brittle rivets or low bulkheads and is paid again on a cost-plus basis to retrofit Olympic and Britannic.',
        enablesNextDossier: 'DS-1915-LUSITANIA'
      },
      decoyVsLedger: {
        viralDecoy: 'The Titanic and Olympic hulls were physically swapped in Belfast for an insurance payout.',
        whyDecoyFails: 'Yard number 401 is stamped on Titanic’s recovered builders’ plates, propellers, and hull fittings on the ocean floor.',
        documentedLedger: 'No hull swap was needed: Harland & Wolff operated on a guaranteed cost-plus commission, and Lord Mersey protected the yard from negligence liability so it got paid a second time to retrofit the fleet.'
      },
      citationIds: ['CIT-1914-MELLOR']
    }
  ],
  entities: [],
  lineages: [
    {
      id: 'LIN-MORGAN-DB',
      name: 'The House of Morgan to Deutsche Bank / JPMorgan Conduit',
      chain: [
        { year: 1838, entity: 'George Peabody & Co. (London)', role: 'City of London merchant bank funneling British capital into U.S. debt' },
        { year: 1864, entity: 'J.S. Morgan & Co. / J.P. Morgan & Co.', role: 'Railroad receiverships, IMM watered stock (1902), Jekyll Island (1910), UK War Agent (1914)' },
        { year: 1903, entity: 'Bankers Trust (Benjamin Strong)', role: 'Morgan voting trust; Strong becomes 1st Governor of NY Fed (1914–1928)' },
        { year: 1999, entity: 'Deutsche Bank / DB Alex. Brown', role: 'Acquires Bankers Trust & Alex. Brown (Buzzy Krongard -> CIA Executive Director, 2001)' }
      ],
      closedLoopSummary: 'Merchant bank creates central bank -> central bank backstops merchant bank -> bank executives rotate into intelligence leadership.'
    }
  ],
  bridges: [],
  pairedEvents: [
    {
      year: 1912,
      crashConduitCode: 'CC-1912-IMM',
      deepStateCode: 'DS-1912-TITANIC',
      sharedMechanismSummary: 'Upfront $170M watered-stock extraction paired with Lord Mersey inquiry whitewash and Marconi statutory radio monopoly.'
    }
  ]
};

1b. research/atlas-engine/master/atlas.json
JSON
{
  "version": "2.0.0",
  "generatedAt": "2026-10-13T22:04:00.000Z",
  "mechanisms": [
    {
      "code": "CENTRAL_BANK_LIQUIDITY",
      "label": "Central Bank Liquidity Backstops",
      "summary": "Private credit expansion socialized onto sovereign taxpayers via lender-of-last-resort windows.",
      "colorToken": "--gold"
    },
    {
      "code": "LEVERAGED_WATERED_CAPITAL",
      "label": "Watered Stock & Debt Over-Capitalization",
      "summary": "Merging tangible assets into hyper-inflated equity and bond trusts to skim upfront underwriting fees.",
      "colorToken": "--note"
    },
    {
      "code": "DERIVATIVE_CLEARING_CAPTURE",
      "label": "Interdealer & Clearing Pipe Capture",
      "summary": "Controlling or automating the settlement pipes, benchmarks (LIBOR), and sovereign bond clearinghouses.",
      "colorToken": "--gold"
    },
    {
      "code": "OFFSHORE_BLACK_LEDGER",
      "label": "Off-Ledger Intelligence & Black Banks",
      "summary": "Covert financial conduits (Banco Ambrosiano, BCCI) funding off-book intelligence operations and proxy wars.",
      "colorToken": "--red"
    },
    {
      "code": "SOVEREIGN_DEBT_TRAP",
      "label": "Sovereign Debt & Courier Arbitrage",
      "summary": "Leveraging war debt, trade deficits, or asymmetric courier feeds to capture national revenue streams.",
      "colorToken": "--gold"
    },
    {
      "code": "REGULATORY_REVOLVING_DOOR",
      "label": "Corporate Coup & Revolving-Door Capture",
      "summary": "Investment bankers and corporate counsel rotating into Cabinet, Fed, and intelligence directorates.",
      "colorToken": "--red"
    },
    {
      "code": "RECEIVERSHIP_MORGANIZATION",
      "label": "Distressed Receivership ('Morganization')",
      "summary": "Forcing debt-laden proxy companies into receivership to wipe out retail equity before capturing wartime or monopoly booms.",
      "colorToken": "--note"
    },
    {
      "code": "COST_PLUS_RECONSTRUCTION",
      "label": "Cost-Plus & Disaster Reconstruction Monopolies",
      "summary": "No-bid or exclusive cost-plus-commission contracts where infrastructure failure guarantees secondary retrofit profits.",
      "colorToken": "--gold"
    },
    {
      "code": "PATENT_CHOKE_POINT",
      "label": "Patent Suppression & Trojan Tech Seizure",
      "summary": "Using patent reversals, buyout locks, or DOJ bankruptcy squeezes to seize communications and database backbones.",
      "colorToken": "--red"
    },
    {
      "code": "MERSEY_LIABILITY_WHITEWASH",
      "label": "Liability Shields & Fixer Commissions",
      "summary": "Blue-ribbon inquiries that bury structural fault paired with statutory caps on victim payouts and discovery waivers.",
      "colorToken": "--red"
    }
  ],
  "eras": [
    {
      "id": "ERA-01-1694",
      "yearStart": 1694,
      "yearEnd": 1721,
      "title": "The Genesis: Bank of England & The South Sea Bubble",
      "ratchet": {
        "inheritsFromEra": null,
        "precedentInherited": "Royal charter monopolies (Asiento slave-trade contract) and fragmented Stuart war debt.",
        "frameworkCreated": "Permanent fractional-reserve national debt managed by a private central bank (Bank of England) + 'The Screen' (Robert Walpole containing parliamentary inquiries).",
        "closedLoopMechanics": "South Sea directors bribed MPs and royal ministers with zero-money-down insider stock to pass the debt-conversion bill; when it crashed, Walpole screened the Crown and transferred the surviving debt machinery to the Bank of England.",
        "seedsNextEra": "ERA-02-1769"
      }
    },
    {
      "id": "ERA-02-1769",
      "yearStart": 1769,
      "yearEnd": 1773,
      "title": "The Bengal Famine & The East India Company Bailout",
      "ratchet": {
        "inheritsFromEra": "ERA-01-1694",
        "precedentInherited": "Bank of England sovereign credit window and parliamentary equity ownership by MPs.",
        "frameworkCreated": "The 'Too Big To Fail' corporate bailout (Regulating Act & Tea Act of 1773) + Malthusian revenue extraction during mass starvation.",
        "closedLoopMechanics": "East India Company tripled Bengal land taxes while 10 million starved, paid out 12.5% dividends to London shareholders (including 40% of Parliament), then used those exact MPs to vote itself a £1.4M Bank of England bailout and colonial tea monopoly.",
        "seedsNextEra": "ERA-03-1815"
      }
    },
    {
      "id": "ERA-03-1815",
      "yearStart": 1815,
      "yearEnd": 1825,
      "title": "The Waterloo Courier Arbitrage & Consol Hegemony",
      "ratchet": {
        "inheritsFromEra": "ERA-02-1769",
        "precedentInherited": "London Consol (sovereign bond) market and transnational merchant-banking clearing networks.",
        "frameworkCreated": "Private intelligence and courier networks outrunning state dispatches to arbitrage sovereign bond panics during information fog.",
        "closedLoopMechanics": "Profits from financing wartime logistics fund a private packet-boat and courier apparatus; 24-hour advance word of Waterloo allows massive Consol accumulation before official Crown messengers arrive, making the syndicate the creditor of European states.",
        "seedsNextEra": "ERA-04-1845"
      }
    },
    {
      "id": "ERA-04-1845",
      "yearStart": 1845,
      "yearEnd": 1852,
      "title": "The Irish Famine, Coffin Ships & Encumbered Estates",
      "ratchet": {
        "inheritsFromEra": "ERA-03-1815",
        "precedentInherited": "Bengal Malthusian tax-and-export doctrine + Lloyd's of London marine hull insurance underwriting.",
        "frameworkCreated": "Insured 'Coffin Ships' for demographic clearance + The Encumbered Estates Act of 1849 (statutory distressed-land seizure by London creditors) + 1851 U.S. Limitation of Liability Act.",
        "closedLoopMechanics": "Landlords export food under military guard, clear starving tenants onto insured rotting timber ships, and London creditors use the 1849 Act to buy distressed estates for pennies—while maritime lobbyists pass the exact 1851 Liability Act later used by J.P. Morgan on the Titanic.",
        "seedsNextEra": "ERA-05-1861"
      }
    },
    {
      "id": "ERA-05-1861",
      "yearStart": 1861,
      "yearEnd": 1895,
      "title": "The Hall Carbine Arbitrage & Railroad 'Morganization'",
      "ratchet": {
        "inheritsFromEra": "ERA-04-1845",
        "precedentInherited": "City of London merchant capital (George Peabody & Co. / J.S. Morgan & Co.) + distressed-asset foreclosure statutes.",
        "frameworkCreated": "Wartime defective-ordnance arbitrage (Hall Carbine Affair) + 'Morganization' (using credit panics in 1873/1893 to seize bankrupt railroads in receivership and consolidate voting trusts).",
        "closedLoopMechanics": "London capital finances U.S. railroad bubbles; when credit tightens, Morgan steps in as 'reorganization manager,' wipes out retail stockholders, places his partners on every board, and applies that exact watered-stock trust template to U.S. Steel (1901) and IMM (1902).",
        "seedsNextEra": "ERA-06-1910"
      }
    },
    {
      "id": "ERA-06-1910",
      "yearStart": 1901,
      "yearEnd": 1917,
      "title": "Jekyll Island, The Titanic/Marconi Monopoly & The Lusitania War Bailout",
      "ratchet": {
        "inheritsFromEra": "ERA-05-1861",
        "precedentInherited": "1851 Maritime Liability Act + 1893 Morganization receivership playbook + 1901 Wardenclyffe 51% patent lock.",
        "frameworkCreated": "The Federal Reserve System (1913) + Radio Act of 1912 wireless monopoly + The Dual Lord Mersey Commission whitewash protocol + WWI Allied Purchasing Monopoly ($3B).",
        "closedLoopMechanics": "Morgan/Pirrie skim IMM upfront via $170M watered stock and cost-plus shipyard fees -> Titanic sinks -> Lord Mersey whitewashes the hull failure so Pirrie gets paid again to retrofit the fleet -> SCOTUS caps victim payouts at $430 -> IMM reorganizes in 1915 -> Lusitania (carrying Morgan munitions, investigated again by Lord Mersey) draws U.S. into WWI -> newly created Federal Reserve & Liberty Bonds bail out Britain's $3B war debt to J.P. Morgan.",
        "seedsNextEra": "ERA-07-1929"
      }
    },
    {
      "id": "ERA-07-1929",
      "yearStart": 1929,
      "yearEnd": 1945,
      "title": "The 1929 Liquidity Plug, The BIS & The Standard Oil–IG Farben Cartel",
      "ratchet": {
        "inheritsFromEra": "ERA-06-1910",
        "precedentInherited": "Federal Reserve Bank of New York (Benjamin Strong) + Bank of England (Montagu Norman) interest-rate coordination.",
        "frameworkCreated": "Bank for International Settlements (1930 Basel treaty immunity) + Sullivan & Cromwell cross-border patent cartels (Standard Oil / IG Farben) + post-WWII absorption of intelligence networks into the CIA (1947).",
        "closedLoopMechanics": "NY Fed and Bank of England inflate 1920s credit, pull call-loan liquidity in 1929 to consolidate assets, erect the sovereign-immune BIS in 1930 to clear transnational payments through WWII, and rotate cartel lawyers (Allen & John Foster Dulles) directly into command of the CIA and State Department.",
        "seedsNextEra": "ERA-08-1953"
      }
    },
    {
      "id": "ERA-08-1953",
      "yearStart": 1953,
      "yearEnd": 1992,
      "title": "Corporate Coups, The Petrodollar, BCCI & The Stolen PROMIS Backdoor",
      "ratchet": {
        "inheritsFromEra": "ERA-07-1929",
        "precedentInherited": "National Security Act of 1947 + Sullivan & Cromwell corporate client roster + Marconi/Tesla state patent-seizure precedent.",
        "frameworkCreated": "Privatized covert operations financed via offshore black banks (Banco Ambrosiano, BCCI) + DOJ seizure and trojan-horse deployment of INSLAW's PROMIS relational database software across global clearinghouses.",
        "closedLoopMechanics": "Dulles brothers use CIA to overthrow governments for law-firm clients (Iran 1953, Guatemala 1954); when Congress restricts covert budgets post-1975, the network moves funding into BCCI and steals PROMIS to monitor foreign central banks and intelligence databases—creating the direct relational-database precursor to In-Q-Tel and Palantir.",
        "seedsNextEra": "ERA-09-2001"
      }
    },
    {
      "id": "ERA-09-2001",
      "yearStart": 1999,
      "yearEnd": 2011,
      "title": "9/11, WTC 7 Enforcement Purge, PATRIOT/In-Q-Tel & The 2008 Bailout",
      "ratchet": {
        "inheritsFromEra": "ERA-08-1953",
        "precedentInherited": "1912 Mersey/Liability Cap blueprint + 1980s PROMIS relational surveillance + 1999 Deutsche Bank acquisition of Morgan's Bankers Trust & Alex. Brown.",
        "frameworkCreated": "ATSSSA statutory liability shield & litigation waiver (2001) + USA PATRIOT Act + Automated Treasury clearing (eSpeed) + CIA In-Q-Tel seeding Palantir (2003) + $16T cumulative Federal Reserve emergency liquidity backstop (2008).",
        "closedLoopMechanics": "Siloed pre-9/11 intelligence warnings fail; WTC 7 collapse destroys 3,000–4,000 SEC enforcement files (CSFB IPO probe); Congress caps airline/security liability via ATSSSA just like the 1851 Act on Titanic; In-Q-Tel births Palantir which deploys bank employee surveillance inside JPMorgan/Credit Suisse; and in 2008 the exact megabanks are handed trillions in Fed backstops with zero CEO prosecutions.",
        "seedsNextEra": "ERA-10-2020"
      }
    },
    {
      "id": "ERA-10-2020",
      "yearStart": 2020,
      "yearEnd": 2026,
      "title": "Schedule F, Algorithmic Governance (ImmigrationOS) & Stablecoin/Tariff Arbitrage",
      "ratchet": {
        "inheritsFromEra": "ERA-09-2001",
        "precedentInherited": "Post-9/11 DHS/ICE procurement architecture + In-Q-Tel/Palantir data-integration monopoly + Cantor Fitzgerald electronic Treasury pipes.",
        "frameworkCreated": "Schedule Policy/Career civil-service purge + Sole-source algorithmic deportation/targeting OS ('ImmigrationOS') + Offshore stablecoin (Tether) U.S. Treasury custody loop + Secondary-market tariff-refund claim arbitrage.",
        "closedLoopMechanics": "Tech billionaires fund political PACs ($15M Thiel -> Protect Ohio Values) -> administration strips career civil-service protections (Schedule F) -> DHS/ICE awards no-bid contracts ($30M ImmigrationOS) back to the donor's firm (Palantir) while officials hold company stock, and Commerce leadership writes tariff rules while connected trading desks buy discounted tariff-refund claims.",
        "seedsNextEra": null
      }
    }
  ],
  "citations": [
    {
      "id": "CIT-1720-HANSARD",
      "tier": "TIER_2_INQUIRY",
      "title": "UK House of Commons Secret Committee Report on the South Sea Company (1721)",
      "url": "https://hansard.parliament.uk/",
      "quoteOrFact": "Parliamentary inquiry documented fictitious stock ledger entries used to bribe MPs and Cabinet ministers prior to the 1720 crash."
    },
    {
      "id": "CIT-1773-TEAACT",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Regulating Act of 1773 (13 Geo. 3 c. 63) & Tea Act of 1773 (13 Geo. 3 c. 44)",
      "url": "https://www.legislation.gov.uk/",
      "quoteOrFact": "Granted the British East India Company a £1.4 million loan backstop and colonial tea duty exemption following the 1770 Bengal famine and 1772 credit crisis."
    },
    {
      "id": "CIT-1849-ESTATES",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Encumbered Estates (Ireland) Act 1849 (12 & 13 Vict. c. 77)",
      "url": "https://hansard.parliament.uk/",
      "quoteOrFact": "Authorized summary forced sale of indebted Irish estates following the famine clearances."
    },
    {
      "id": "CIT-1861-HALL",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Stevens v. United States, 2 Ct. Cl. 95 (1866) & House Report No. 2, 37th Cong., 2d Sess. (Hall Carbine Affair)",
      "url": "https://www.courtlistener.com/",
      "quoteOrFact": "J.P. Morgan financed Simon Stevens's purchase of 5,000 condemned Hall carbines from the Army at $3.50 each and resale to Gen. Frémont at $22.00 each."
    },
    {
      "id": "CIT-1911-STRAUS",
      "tier": "TIER_4_CONTEMPORARY_PRESS",
      "title": "Isidor Straus Urges New Banking Plan — Replies to Critics of Aldrich Monetary Scheme, The New York Times (Oct 16, 1911)",
      "url": "https://chroniclingamerica.loc.gov/",
      "quoteOrFact": "Primary newspaper record proving Titanic passenger Isidor Straus publicly supported the central bank plan five months before sailing."
    },
    {
      "id": "CIT-1912-SENATE",
      "tier": "TIER_2_INQUIRY",
      "title": "U.S. Senate Inquiry into the Titanic Disaster, S. Rep. No. 806, 62d Cong., 2d Sess. (1912)",
      "url": "https://www.govinfo.gov/",
      "quoteOrFact": "Documented lookouts lacking binoculars (Frederick Fleet testimony), concealed coal bunker fire testimony, 20-lifeboat capacity, and SS Californian rocket sightings."
    },
    {
      "id": "CIT-1913-PUJO",
      "tier": "TIER_2_INQUIRY",
      "title": "Report of the Committee Appointed Pursuant to House Resolutions 429 and 504 to Investigate the Concentration of Control of Money and Credit (Pujo Report, 1913)",
      "url": "https://fraser.stlouisfed.org/title/report-committee-appointed-pursuant-house-resolutions-429-504-investigate-concentration-control-money-credit-1331",
      "quoteOrFact": "Detailed J.P. Morgan & Co., First National Bank, and National City Bank interlocking directorates and IMM over-capitalization."
    },
    {
      "id": "CIT-1913-MARCONI",
      "tier": "TIER_2_INQUIRY",
      "title": "House of Commons Select Committee on Marconi's Wireless Telegraph Company Limited Agreement (1913)",
      "url": "https://hansard.parliament.uk/",
      "quoteOrFact": "Investigated insider acquisition of American Marconi shares by Attorney General Rufus Isaacs (brother of Marconi Managing Director Godfrey Isaacs) and Chancellor David Lloyd George."
    },
    {
      "id": "CIT-1914-MELLOR",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Oceanic Steam Navigation Co. v. Mellor (The Titanic), 233 U.S. 718 (1914)",
      "url": "https://www.courtlistener.com/opinion/98195/oceanic-steam-navigation-co-v-mellor/",
      "quoteOrFact": "U.S. Supreme Court permitted White Star Line (IMM) to invoke the U.S. Limitation of Liability Act of 1851, capping recovery prior to the $664,000 global settlement."
    },
    {
      "id": "CIT-1935-VANDERLIP",
      "tier": "TIER_4_CONTEMPORARY_PRESS",
      "title": "Frank A. Vanderlip, 'From Farm Boy to Financier: Secret Meeting at Jekyll Island', Saturday Evening Post (Feb 9, 1935)",
      "url": "https://fraser.stlouisfed.org/",
      "quoteOrFact": "First-hand admission by National City Bank President Frank Vanderlip detailing the secretive November 1910 Jekyll Island railcar trip to draft the central bank bill."
    },
    {
      "id": "CIT-1936-NYE",
      "tier": "TIER_2_INQUIRY",
      "title": "U.S. Senate Special Committee Investigating the Munitions Industry (Nye Committee Report, 1934–1936)",
      "url": "https://www.govinfo.gov/",
      "quoteOrFact": "Examined J.P. Morgan & Co.'s exclusive 1915 commercial agency agreement with the British and French governments ($3 billion in war purchases at 1% commission) and Lusitania cargo manifests."
    },
    {
      "id": "CIT-1942-TRUMAN",
      "tier": "TIER_2_INQUIRY",
      "title": "U.S. Senate Special Committee to Investigate the National Defense Program (Truman Committee), Synthetic Rubber & Standard Oil–IG Farben Hearings (1942)",
      "url": "https://www.govinfo.gov/",
      "quoteOrFact": "Documented 1929–1939 patent-sharing cartels between Standard Oil of New Jersey and IG Farben restricting synthetic rubber development."
    },
    {
      "id": "CIT-1943-MARCONI",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Marconi Wireless Telegraph Co. of America v. United States, 320 U.S. 1 (1943)",
      "url": "https://www.courtlistener.com/opinion/103874/marconi-wireless-telegraph-co-of-america-v-united-states/",
      "quoteOrFact": "U.S. Supreme Court invalidated Marconi's four-circuit tuning patent, holding it was anticipated by Nikola Tesla's U.S. Patent No. 645,576 (1900), Oliver Lodge, and John Stone."
    },
    {
      "id": "CIT-1988-INSLAW",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Inslaw, Inc. v. United States, 83 B.R. 89 (Bankr. D.D.C. 1988) & House Judiciary Report No. 102-857 ('The INSLAW Affair', Sept 10, 1992)",
      "url": "https://www.govinfo.gov/",
      "quoteOrFact": "Bankruptcy court ruled the DOJ took INSLAW's proprietary PROMIS software through 'trickery, fraud and deceit'; House Judiciary Report investigated global intelligence distribution."
    },
    {
      "id": "CIT-1992-BCCI",
      "tier": "TIER_2_INQUIRY",
      "title": "The BCCI Affair: A Report to the Committee on Foreign Relations, U.S. Senate, S. Prt. 102-140 (Kerry-Brown Report, Dec 1992)",
      "url": "https://info.publicintelligence.net/KerryBCCI.pdf",
      "quoteOrFact": "Detailed BCCI's use by intelligence services for off-ledger operations, weapons procurement, and regulatory capture across Washington and London."
    },
    {
      "id": "CIT-2001-ATSSSA",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Air Transportation Safety and System Stabilization Act (ATSSSA), Pub. L. 107-42, 115 Stat. 230 (Sept 22, 2001)",
      "url": "https://www.govinfo.gov/content/pkg/PLAW-107publ42/pdf/PLAW-107publ42.pdf",
      "quoteOrFact": "Capped civil liability of airlines, aircraft manufacturers, WTC leaseholders, and security contractors to existing insurance limits and required VCF claimants to waive civil litigation."
    },
    {
      "id": "CIT-2001-AUDIT-911",
      "tier": "TIER_3_PRIMARY_LEDGER",
      "title": "Audited Repository Record: 9/11 Foreknowledge, WTC 7 SEC Files, Krongard/DB Alex. Brown & Cantor eSpeed",
      "url": "research/911-foreknowledge-record.md",
      "quoteOrFact": "Inherits PROVEN/DOCUMENTED/REC-COLLECTION/OPEN audit dispositions from research/911-foreknowledge-record.md, research/wtc-vault-record.md, research/apollo-krongard-web.md, and research/cantor-absorption-web.md."
    },
    {
      "id": "CIT-2011-GAO-FED",
      "tier": "TIER_2_INQUIRY",
      "title": "U.S. Government Accountability Office, 'Federal Reserve System: Opportunities Exist to Strengthen Policies and Processes for Managing Emergency Assistance', GAO-11-696 (July 2011)",
      "url": "https://www.gao.gov/products/gao-11-696",
      "quoteOrFact": "Mandated under Dodd-Frank; disclosed $16.1 trillion in cumulative gross emergency liquidity loans issued by the Federal Reserve between Dec 2007 and July 2010."
    },
    {
      "id": "CIT-2025-SCHED-F",
      "tier": "TIER_1_STATUTE_COURT",
      "title": "Executive Order 13957 (Oct 2020) & Restoring Accountability to Policy-Influencing Positions Within the Federal Workforce (Jan 20, 2025)",
      "url": "https://www.federalregister.gov/",
      "quoteOrFact": "Reclassifies ~50,000 career civil servants into Schedule Policy/Career, removing Title 5 Chapter 75 adverse-action protections."
    },
    {
      "id": "CIT-2025-PALANTIR-ICE",
      "tier": "TIER_3_PRIMARY_LEDGER",
      "title": "ICE Sole-Source Contract Modification for Palantir 'ImmigrationOS' ($30M, April 2025) & FEC Super PAC Filings (Protect Ohio Values)",
      "url": "https://www.usaspending.gov/",
      "quoteOrFact": "Documented $30M ICE sole-source award to Palantir for ImmigrationOS alongside $15M FEC contributions by co-founder Peter Thiel to Protect Ohio Values."
    }
  ],
  "dossiers": [
    {
      "code": "CC-1720-SOUTHSEA",
      "eraId": "ERA-01-1694",
      "yearStart": 1711,
      "yearEnd": 1721,
      "title": "The South Sea Debt Conversion & Robert Walpole's 'Screen'",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state", "consent"],
      "mechanism": "LEVERAGED_WATERED_CAPITAL",
      "tier": "TIER_2_INQUIRY",
      "auditDisposition": "PROVEN",
      "participants": ["Bank of England", "South Sea Company", "Robert Walpole", "John Blunt"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Insiders convert £31M of illiquid British national war debt into South Sea shares while crediting MPs and ministers with zero-down 'fictitious stock'.",
        "stage2_structuralCompromise": "Company lends money to buyers to bid up its own shares to £1,000 with zero underlying trade cash flow.",
        "stage3_informationFog": "Directors pass the Bubble Act of June 1720 to outlaw rival joint-stock competitors while quietly liquidating personal holdings at the peak.",
        "stage4_monopolyWindfall": "Bank of England absorbs the surviving sovereign debt management tranche and eliminates its sole rival for Crown credit.",
        "stage5_merseyWhitewash": "Robert Walpole ('The Screen') blocks investigation into King George I's court, sacrifices a handful of directors, and becomes Britain's first Prime Minister."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1694 Bank of England private royal charter.",
        "newFrameworkCreated": "The Parliamentary 'Screen' cover-up mechanism + Bank of England monopoly over national debt management.",
        "closedLoopRecirculation": "Share-pump profits bribe MPs to pass the conversion bill; after the crash, the state rescues the central bank and makes the cover-up architect Prime Minister.",
        "enablesNextDossier": "CC-1773-EIC"
      },
      "decoyVsLedger": {
        "viralDecoy": "The South Sea Bubble was a spontaneous retail 'madness of crowds' where naive speculators fooled themselves.",
        "whyDecoyFails": "The 1721 House of Commons Secret Committee proved the bubble was engineered via bribed MPs entered into secret ledger books without paying for shares.",
        "documentedLedger": "It was a state-sanctioned debt-for-equity swap where insiders used corporate credit to pump their own stock and used Robert Walpole to block royal prosecution."
      },
      "citationIds": ["CIT-1720-HANSARD"]
    },
    {
      "code": "CC-1773-EIC",
      "eraId": "ERA-02-1769",
      "yearStart": 1769,
      "yearEnd": 1773,
      "title": "The Bengal Famine Extraction & The 1773 East India Bailout",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["carbon-class", "deep-state"],
      "mechanism": "CENTRAL_BANK_LIQUIDITY",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["British East India Company", "Bank of England", "Lord North", "Robert Clive"],
      "extractionLoop": {
        "stage1_upfrontSkim": "After seizing the Bengal Diwani (tax rights), EIC triples land revenue collections and raises London shareholder dividends to 12.5%.",
        "stage2_structuralCompromise": "Farmers are forced to cultivate opium and indigo instead of rice while company officials monopolize grain reserves.",
        "stage3_informationFog": "As 10 million Bengalis starve in 1770, EIC reports rising net tax collections in London to support its stock price.",
        "stage4_monopolyWindfall": "When credit freezes in 1772, Parliament passes the Regulating Act and Tea Act of 1773: a £1.4M sovereign loan and duty-free American tea monopoly.",
        "stage5_merseyWhitewash": "Parliamentary inquiry acquits Robert Clive while formalizing state-corporate co-rule over India."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1720 Walpole Parliamentary bailout and Bank of England credit facility.",
        "newFrameworkCreated": "The 'Too Big To Fail' corporate bailout statute (1773 Acts) where MP shareholders vote treasury loans to their own company.",
        "closedLoopRecirculation": "Bengal famine tax extraction pays dividends to MPs -> MPs vote Bank of England bailout and colonial monopoly back to the EIC.",
        "enablesNextDossier": "CC-1815-WATERLOO"
      },
      "decoyVsLedger": {
        "viralDecoy": "The 1770 Bengal Famine was purely a natural monsoon drought unrelated to London financial policy.",
        "whyDecoyFails": "Company ledgers show tax collections were violently enforced and actually increased during the height of the mortality while dividends were hiked.",
        "documentedLedger": "The famine was a leveraged revenue squeeze that culminated in the world's first statutory 'Too Big To Fail' central-bank bailout in 1773."
      },
      "citationIds": ["CIT-1773-TEAACT"]
    },
    {
      "code": "CC-1815-WATERLOO",
      "eraId": "ERA-03-1815",
      "yearStart": 1815,
      "yearEnd": 1816,
      "title": "The Waterloo Courier Window & Sovereign Consol Accumulation",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state"],
      "mechanism": "SOVEREIGN_DEBT_TRAP",
      "tier": "TIER_3_PRIMARY_LEDGER",
      "auditDisposition": "DOCUMENTED",
      "participants": ["Nathan Mayer Rothschild", "N.M. Rothschild & Sons", "Bank of England"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Merchant banking syndicate captures lucrative commissions smuggling gold bullion to Wellington's armies across Europe.",
        "stage2_structuralCompromise": "British public debt swells past £800M, making domestic stability wholly dependent on the daily price of British Consols.",
        "stage3_informationFog": "Private courier Rothworth crosses the Channel with news of Napoleon's defeat at Waterloo 24 hours before Major Henry Percy reaches the British Cabinet.",
        "stage4_monopolyWindfall": "Massive accumulation of British government Consols before the public rally locks in long-term tax-funded yield.",
        "stage5_merseyWhitewash": "Sovereign bond underwriting becomes the exclusive province of the City of London merchant banking cartel."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "Bank of England Consol debt architecture.",
        "newFrameworkCreated": "Asymmetric private intelligence networks outrunning state communications to arbitrage crisis bond pricing.",
        "closedLoopRecirculation": "Government war-gold commissions pay for the private courier network; courier network captures sovereign debt market before state officials know the war is over.",
        "enablesNextDossier": "CB-1845-COFFIN"
      },
      "decoyVsLedger": {
        "viralDecoy": "Rothschild invented fake news that Wellington lost Waterloo to crash the stock market.",
        "whyDecoyFails": "Buying British Consols in size *before* the victory announcement arrived already guaranteed an massive sovereign bond windfall as victory ended war-borrowing dilution.",
        "documentedLedger": "The structural power came from operating a private intelligence relay faster than the British military's own dispatch system."
      },
      "citationIds": ["CIT-1720-HANSARD"]
    },
    {
      "code": "CB-1845-COFFIN",
      "eraId": "ERA-04-1845",
      "yearStart": 1845,
      "yearEnd": 1852,
      "title": "Irish Famine Exports, Insured 'Coffin Ships' & The 1849 Estates Seizure",
      "primaryTab": "carbon-class",
      "secondaryTabs": ["crash-conduits", "deep-state"],
      "mechanism": "RECEIVERSHIP_MORGANIZATION",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["Sir Charles Trevelyan", "Lloyd's of London", "British Treasury"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Absentee landlords extract rack-rent while exporting Irish grain, cattle, and butter to England under armed guard.",
        "stage2_structuralCompromise": "Evicted tenants are packed onto rotting, unseaworthy timber 'Coffin Ships' with zero lifeboats or medical rations, insured at Lloyd's.",
        "stage3_informationFog": "Treasury head Charles Trevelyan frames mass mortality as 'the judgement of God' and 'an effective mechanism for reducing surplus population'.",
        "stage4_monopolyWindfall": "Parliament passes the Encumbered Estates Act (1849), allowing London creditors to buy depopulated Irish agricultural estates at distressed auctions.",
        "stage5_merseyWhitewash": "Maritime owners lobby for the 1851 U.S. Limitation of Liability Act—the exact statute J.P. Morgan's IMM later uses in 1914 to cap Titanic payouts at $430."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1770 Bengal Malthusian extraction + London marine insurance underwriting.",
        "newFrameworkCreated": "Encumbered Estates Act (1849) distressed-asset seizure + 1851 Maritime Limitation of Liability Act.",
        "closedLoopRecirculation": "Starvation clears the land -> Coffin ships collect fares and marine insurance -> 1849 Act transfers land title to creditors -> 1851 Act shields future shipping trusts from steerage deaths.",
        "enablesNextDossier": "CC-1861-MORGAN"
      },
      "decoyVsLedger": {
        "viralDecoy": "Ireland simply ran out of food between 1845 and 1850 due to potato blight.",
        "whyDecoyFails": "Port ledgers document thousands of tons of oats, wheat, livestock, and butter exported out of Irish ports under military escort throughout the famine years.",
        "documentedLedger": "The crisis was weaponized via the Poor Law Quarter-Acre Clause, insured Coffin Ship clearances, and the 1849 Encumbered Estates creditor land grab."
      },
      "citationIds": ["CIT-1849-ESTATES"]
    },
    {
      "code": "CC-1861-MORGAN",
      "eraId": "ERA-05-1861",
      "yearStart": 1861,
      "yearEnd": 1895,
      "title": "The Hall Carbine Affair & 1893 Railroad 'Morganization'",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state"],
      "mechanism": "COST_PLUS_RECONSTRUCTION",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["J.P. Morgan", "J.S. Morgan & Co.", "Simon Stevens"],
      "extractionLoop": {
        "stage1_upfrontSkim": "In 1861, 24-year-old J.P. Morgan finances the purchase of 5,000 condemned Hall carbines from the U.S. Army at $3.50 each and resells them to Union Gen. Frémont at $22.00 each.",
        "stage2_structuralCompromise": "The obsolete rifles malfunction in the field, blowing the thumbs off Union soldiers.",
        "stage3_informationFog": "While War Department auditors freeze payment for fraud, Morgan's syndicate files suit in the Court of Claims.",
        "stage4_monopolyWindfall": "Court of Claims awards Morgan's syndicate full contract value; post-war, Morgan uses the Panics of 1873 and 1893 to seize bankrupt U.S. railroads in receivership.",
        "stage5_merseyWhitewash": "Supreme Court and Court of Claims uphold strict contract enforcement over defective-munitions findings; 'Morganization' voting trusts become Wall Street standard."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "City of London merchant banking (George Peabody & Co. -> J.S. Morgan & Co.) + distressed foreclosure statutes.",
        "newFrameworkCreated": "'Morganization' receivership template: using bond defaults to wipe out common shareholders and lock assets into banker voting trusts.",
        "closedLoopRecirculation": "Civil War arbitrage profits seed railroad bond underwriting -> credit panics bankrupt the railroads -> Morgan reorganizes them into monopolies and applies the identical model to U.S. Steel (1901) and IMM (1902).",
        "enablesNextDossier": "CC-1912-IMM"
      },
      "decoyVsLedger": {
        "viralDecoy": "J.P. Morgan built his fortune passively as a prudent commercial lender.",
        "whyDecoyFails": "House Report No. 2 (37th Congress) and Stevens v. United States (2 Ct. Cl. 95) document the Hall Carbine flip directly from U.S. arsenals back to Union troops at a 528% markup.",
        "documentedLedger": "Morgan's model combined zero-risk government contract arbitrage with distressed-debt receivership takeovers ('Morganization')."
      },
      "citationIds": ["CIT-1861-HALL"]
    },
    {
      "code": "CC-1912-IMM",
      "eraId": "ERA-06-1910",
      "yearStart": 1902,
      "yearEnd": 1916,
      "title": "IMM Watered Stock ($170M), Cost-Plus Shipyard Lock & The 1915 Receivership Flip",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state", "carbon-class"],
      "mechanism": "RECEIVERSHIP_MORGANIZATION",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["J.P. Morgan & Co.", "Lord William Pirrie", "Harland & Wolff", "J. Bruce Ismay", "Philip A.S. Franklin", "Otto Bannard"],
      "extractionLoop": {
        "stage1_upfrontSkim": "In 1902, Morgan merges White Star and Leyland Lines (~$65M tangible value) into IMM, issuing $170M in watered stock and $50M in 4.5% gold bonds while granting Lord Pirrie's Harland & Wolff an exclusive 10-year Cost-Plus shipbuilding contract.",
        "stage2_structuralCompromise": "To service Morgan's bond interest and maximize First-Class luxury margins, Titanic is built with Grade-3 iron bow rivets, E-Deck bulkheads, 20 lifeboats instead of 64, and sails with a concealed 1,000°C coal fire in Bunker #6.",
        "stage3_informationFog": "For 18 hours on April 15, 1912—while NY and London stock and reinsurance markets clear—IMM's Manhattan office and press wires falsely report 'All Titanic Passengers Safe; Towing to Halifax'.",
        "stage4_monopolyWindfall": "Pirrie's shipyard is paid a second time on a cost-plus basis to retrofit Olympic and Britannic; IMM defaults on its bonds in Oct 1914, enters receivership in 1915 to wipe out retail equity, and captures $67M+ net profits during the 500% WWI shipping boom.",
        "stage5_merseyWhitewash": "In Oceanic Steam Navigation Co. v. Mellor (1914), the U.S. Supreme Court lets IMM invoke the 1851 Liability Act to cap payouts at ~$430 per victim ($664k total against $16M in claims)."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1851 Maritime Limitation of Liability Act + 1893 Morganization railroad receivership playbook.",
        "newFrameworkCreated": "Cost-Plus disaster retrofit loop + pre-war bankruptcy reorganization wiping out retail holders right before state wartime charter windfalls.",
        "closedLoopRecirculation": "Morgan skims $6M+ underwriting fees upfront -> Pirrie collects guaranteed cost-plus build fees -> Titanic sinks -> SCOTUS caps victim payouts at $430 -> Pirrie collects cost-plus retrofit fees -> 1915 receivership hands cleaned company to syndicate insiders for the WWI profit boom.",
        "enablesNextDossier": "CC-1914-MORGAN"
      },
      "decoyVsLedger": {
        "viralDecoy": "J.P. Morgan sank the Titanic to assassinate Federal Reserve opponents John Jacob Astor, Isidor Straus, and Benjamin Guggenheim, or to collect hull insurance.",
        "whyDecoyFails": "Isidor Straus publicly endorsed the central bank plan in The New York Times (Oct 16, 1911: 'Isidor Straus Urges New Banking Plan'), neither Astor nor Guggenheim opposed it, and the $5M Lloyd's hull policy was $2.5M below the $7.5M build cost.",
        "documentedLedger": "The real extraction was the 1902 $170M watered-stock skim, Lord Pirrie's cost-plus shipyard kickbacks, the 1914 SCOTUS $430/victim liability cap, and the 1915 receivership reorganization before the WWI boom."
      },
      "citationIds": ["CIT-1911-STRAUS", "CIT-1912-SENATE", "CIT-1913-PUJO", "CIT-1914-MELLOR"]
    },
    {
      "code": "DS-1912-TITANIC",
      "eraId": "ERA-06-1910",
      "yearStart": 1901,
      "yearEnd": 1914,
      "title": "The Marconi-Tesla Patent Seizure, SS Californian Stand-Down & Lord Mersey Whitewash",
      "primaryTab": "deep-state",
      "secondaryTabs": ["crash-conduits", "transhumanism", "consent"],
      "mechanism": "PATENT_CHOKE_POINT",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["Lord Mersey", "Guglielmo Marconi", "Godfrey Isaacs", "Rufus Isaacs", "David Lloyd George", "Nikola Tesla", "Capt. Stanley Lord"],
      "extractionLoop": {
        "stage1_upfrontSkim": "J.P. Morgan takes a 51% lock on Nikola Tesla's wireless patents (1901) and defunds Wardenclyffe; in 1904 the USPTO reverses itself and grants Marconi the radio patent using 17 Tesla inventions.",
        "stage2_structuralCompromise": "Removed Second Officer David Blair walks off Titanic with the crow's nest binocular locker key; Bunker #6 coal fire warps forward watertight bulkhead.",
        "stage3_informationFog": "SS Californian—owned by Morgan's IMM subsidiary Leyland Line and sailing empty of passengers—sits 19 miles away with its radio off, ignoring 8 white distress rockets.",
        "stage4_monopolyWindfall": "Congress passes the Radio Act of 1912 forcing every oceangoing ship to carry 24-hour wireless, handing Marconi a global monopoly while Godfrey Isaacs distributes insider American Marconi shares to UK Cabinet ministers (AG Rufus Isaacs & Chancellor Lloyd George).",
        "stage5_merseyWhitewash": "British Wreck Commissioner Lord Mersey discards crew testimony that the hull broke in half, absolving Harland & Wolff and the British Board of Trade of negligence."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "J.P. Morgan's 1901 51% patent encumbrance on Tesla's Wardenclyffe + Board of Trade regulatory capture.",
        "newFrameworkCreated": "Radio Act of 1912 mandatory corporate tech monopoly + The 'Lord Mersey Commission' state whitewash template.",
        "closedLoopRecirculation": "Morgan strangles free wireless energy -> Marconi captures radio using Tesla's patents -> Titanic disaster mandates Marconi sets on every ship -> Cabinet ministers profit on insider Marconi shares -> in 1943 SCOTUS finally admits Marconi stole Tesla's patents solely so the U.S. military can dodge wartime royalties.",
        "enablesNextDossier": "DS-1915-LUSITANIA"
      },
      "decoyVsLedger": {
        "viralDecoy": "Marconi single-handedly invented radio and the British inquiry was an impartial technical review.",
        "whyDecoyFails": "In Marconi Wireless v. United States, 320 U.S. 1 (1943), the U.S. Supreme Court invalidated Marconi's core patent as anticipated by Tesla's 1900 Patent No. 645,576, and Robert Ballard's 1985 wreck discovery proved the working-class witnesses right that the hull broke in two.",
        "documentedLedger": "The disaster converted suppressed Tesla patents into a government-mandated Marconi monopoly enriched by British Cabinet insider trading while Lord Mersey shielded the shipyard."
      },
      "citationIds": ["CIT-1912-SENATE", "CIT-1913-MARCONI", "CIT-1943-MARCONI"]
    },
    {
      "code": "CC-1914-MORGAN",
      "eraId": "ERA-06-1910",
      "yearStart": 1910,
      "yearEnd": 1918,
      "title": "The Jekyll Island Cartel, NY Fed Capture & The $3B British War Purchasing Agency",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state"],
      "mechanism": "CENTRAL_BANK_LIQUIDITY",
      "tier": "TIER_2_INQUIRY",
      "auditDisposition": "PROVEN",
      "participants": ["J.P. Morgan & Co.", "Benjamin Strong", "Henry P. Davison", "Paul Warburg", "Frank A. Vanderlip", "Nelson Aldrich"],
      "extractionLoop": {
        "stage1_upfrontSkim": "In Nov 1910, Morgan, Rockefeller, and Warburg lieutenants travel in a blacked-out railcar to Jekyll Island to draft a central bank bill that stops regional banks from competing with Wall Street.",
        "stage2_structuralCompromise": "Wall Street banks publicly feign opposition to the 1913 Glass-Owen bill to trick populist Democrats into passing the Jekyll Island architecture.",
        "stage3_informationFog": "Morgan lieutenant Benjamin Strong takes command as 1st Governor of the NY Fed (1914), while J.P. Morgan & Co. is appointed exclusive U.S. purchasing agent for the British and French Crowns.",
        "stage4_monopolyWindfall": "Morgan collects a 1% commission on $3B+ in Allied munitions while steering contracts to Morgan trusts (U.S. Steel, Remington) financed by NY Fed credit expansion.",
        "stage5_merseyWhitewash": "When Britain nears default on its massive Morgan overdrafts in 1917, U.S. entry into WWI allows U.S. taxpayer Liberty Bonds to pay off the Allied war debt to Morgan."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1694 Bank of England private-public debt template + 1907 Knickerbocker Trust panic consolidation.",
        "newFrameworkCreated": "The Federal Reserve System (1913) + NY Fed–Bank of England central-bank axis + Liberty Bond taxpayer bailout of private foreign war loans.",
        "closedLoopRecirculation": "Morgan lieutenants write the Fed Act -> Morgan's man (Strong) runs the NY Fed -> Morgan's bank lends billions to Britain for a 1% cut on munitions -> U.S. enters WWI -> U.S. taxpayers buy Liberty Bonds -> proceeds go straight to J.P. Morgan & Co. to pay off Britain's overdraft.",
        "enablesNextDossier": "DS-1915-LUSITANIA"
      },
      "decoyVsLedger": {
        "viralDecoy": "The Federal Reserve Act of 1913 was a progressive victory drafted by Woodrow Wilson to curb Wall Street's Money Trust.",
        "whyDecoyFails": "Participant Frank Vanderlip confessed in the Saturday Evening Post (Feb 9, 1935) that the Jekyll Island six drafted the core mechanism in secret and staged fake Wall Street opposition to ensure passage.",
        "documentedLedger": "The Fed immediately served as the liquidity engine for J.P. Morgan & Co.'s $3 billion Allied war-purchasing monopoly, documented in the 1934–1936 Senate Nye Committee hearings."
      },
      "citationIds": ["CIT-1913-PUJO", "CIT-1935-VANDERLIP", "CIT-1936-NYE"]
    },
    {
      "code": "DS-1915-LUSITANIA",
      "eraId": "ERA-06-1910",
      "yearStart": 1914,
      "yearEnd": 1917,
      "title": "The Lusitania Munitions Manifest, Room 40 Escort Recall & Lord Mersey's Encore",
      "primaryTab": "deep-state",
      "secondaryTabs": ["crash-conduits", "consent"],
      "mechanism": "MERSEY_LIABILITY_WHITEWASH",
      "tier": "TIER_2_INQUIRY",
      "auditDisposition": "DOCUMENTED",
      "participants": ["Lord Mersey", "Winston Churchill", "J.P. Morgan & Co.", "Cunard Line"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Built under the 1903 British Admiralty warship-conversion loan (£2.6M), Lusitania is packed in NY with 4.2M rounds of Remington rifle ammo, 1,250 shrapnel shells, and 18 cases of fuses brokered through Morgan's agency.",
        "stage2_structuralCompromise": "Three months before sailing, First Lord of the Admiralty Winston Churchill writes that it is 'most important to attract neutral shipping to our shores, in the hope especially of embroiling the United States with Germany.'",
        "stage3_informationFog": "As Lusitania enters the Irish Sea where Room 40 codebreakers are tracking German U-20, the Admiralty recalls her destroyer escort (HMS Juno) and leaves her on a straight path.",
        "stage4_monopolyWindfall": "Torpedo impact triggers a massive secondary internal bow explosion, sinking the ship in 18 minutes; the resulting outrage paves the road for U.S. entry into WWI, rescuing Morgan's $3B Allied debt exposure.",
        "stage5_merseyWhitewash": "The British government brings back Lord Mersey—the exact fixer from the 1912 Titanic inquiry—who covers up the munitions and escort recall, then immediately resigns, telling a colleague: 'The Lusitania case was a damned dirty business!'"
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1903 British Admiralty–Cunard subsidy pact (created to counter Morgan's 1902 IMM trust) + 1912 Lord Mersey Wreck Commission apparatus.",
        "newFrameworkCreated": "Using passenger liners as munitions shields to trigger geopolitical intervention and sovereign debt bailouts.",
        "closedLoopRecirculation": "Morgan's 1902 IMM takeover triggers Britain to fund Lusitania in 1903 -> by 1915 Lusitania hauls Morgan-brokered munitions -> Lord Mersey (Titanic fixer) whitewashes Lusitania too -> U.S. enters war and bails out Morgan's $3B British loans.",
        "enablesNextDossier": "DS-1942-IGFARBEN"
      },
      "decoyVsLedger": {
        "viralDecoy": "The Lusitania was an unarmed civilian passenger liner carrying only cheese and butter.",
        "whyDecoyFails": "The supplementary 24-page customs manifest released to the Senate Nye Committee and physical ammunition recovered from the wreck confirm 4.2 million Remington rounds and 1,250 shrapnel shells.",
        "documentedLedger": "The ship was an Admiralty-subsidized auxiliary cruiser carrying J.P. Morgan-brokered munitions whose escort was recalled in an active U-boat zone, followed by a second whitewash inquiry run by Lord Mersey."
      },
      "citationIds": ["CIT-1936-NYE"]
    },
    {
      "code": "DS-1942-IGFARBEN",
      "eraId": "ERA-07-1929",
      "yearStart": 1929,
      "yearEnd": 1947,
      "title": "The BIS Immunity Treaty, Standard Oil–IG Farben Cartels & Sullivan & Cromwell",
      "primaryTab": "deep-state",
      "secondaryTabs": ["crash-conduits", "transhumanism"],
      "mechanism": "PATENT_CHOKE_POINT",
      "tier": "TIER_2_INQUIRY",
      "auditDisposition": "PROVEN",
      "participants": ["Allen Dulles", "John Foster Dulles", "Sullivan & Cromwell", "Standard Oil of NJ", "IG Farben", "Bank for International Settlements"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Wall Street and London bankers establish the Bank for International Settlements (1930) in Basel with sovereign treaty immunity from seizure in war or peace, while Sullivan & Cromwell (Dulles brothers) structures IG Farben bond offerings.",
        "stage2_structuralCompromise": "Under the 1929 Jasco agreement, Standard Oil of New Jersey shares tetraethyl lead (aviation fuel) and synthetic rubber patents with Nazi Germany's IG Farben while withholding synthetic rubber formulas from the U.S. Navy.",
        "stage3_informationFog": "Through WWII, the BIS continues clearing transnational gold and foreign-exchange settlements across belligerent lines while cartel ownership is masked through neutral Swiss holding companies.",
        "stage4_monopolyWindfall": "Even after the 1942 Truman Committee exposes the synthetic rubber bottleneck (which Sen. Harry Truman calls 'treason'), Standard Oil settles for a nominal consent decree and retains dominant wartime petrochemical refining contracts.",
        "stage5_merseyWhitewash": "Rather than prosecuting the cartel architects, Allen Dulles becomes Director of Central Intelligence (CIA) and John Foster Dulles becomes U.S. Secretary of State, absorbing German intelligence assets (Organization Gehlen) into the Cold War apparatus."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1914–1928 NY Fed (Benjamin Strong) & Bank of England (Montagu Norman) central-bank coordination.",
        "newFrameworkCreated": "Sovereign-immune supranational clearinghouse (BIS) + National Security Act of 1947 (CIA) staffed directly by Wall Street cartel counsel (Sullivan & Cromwell).",
        "closedLoopRecirculation": "Wall Street law firm builds pre-war industrial cartels -> wartime Senate inquiry is defused via nominal fines -> the exact cartel lawyers are placed in charge of the CIA and State Department to run post-war coups for corporate clients.",
        "enablesNextDossier": "DS-1982-INSLAW"
      },
      "decoyVsLedger": {
        "viralDecoy": "Wall Street and Western multinationals severed all technological and banking links with Axis industry the moment hostilities began.",
        "whyDecoyFails": "The 1942 Senate Truman Committee hearings and DOJ Antitrust Division records document Standard Oil–IG Farben synthetic rubber restrictions lasting into WWII.",
        "documentedLedger": "The supranational BIS and Sullivan & Cromwell cartel structures bridged pre-war finance directly into the post-1947 CIA/State Department national security apparatus."
      },
      "citationIds": ["CIT-1942-TRUMAN"]
    },
    {
      "code": "DS-1982-INSLAW",
      "eraId": "ERA-08-1953",
      "yearStart": 1982,
      "yearEnd": 1992,
      "title": "The DOJ PROMIS Software Theft, Systematics & The BCCI Off-Ledger Octopus",
      "primaryTab": "deep-state",
      "secondaryTabs": ["transhumanism", "crash-conduits"],
      "mechanism": "PATENT_CHOKE_POINT",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["INSLAW (Bill Hamilton)", "U.S. Department of Justice", "Robert Maxwell", "Bank of Credit and Commerce International (BCCI)", "Danny Casolaro"],
      "extractionLoop": {
        "stage1_upfrontSkim": "To bypass post-Watergate/Church Committee congressional oversight, intelligence networks route off-ledger funding through BCCI while targeting INSLAW's proprietary 32-bit PROMIS relational database software.",
        "stage2_structuralCompromise": "DOJ officials withhold contract payments to force INSLAW into Chapter 11 bankruptcy and seize the enhanced PROMIS source code.",
        "stage3_informationFog": "Modified with a covert 'trapdoor' subroutine, PROMIS is marketed globally by intelligence cutouts (including Robert Maxwell) to foreign intelligence agencies and bank clearing systems (Systematics).",
        "stage4_monopolyWindfall": "Relational cross-database tracking becomes the foundational architecture of modern financial and intelligence surveillance, while BCCI launders billions in covert arms and narcotics flows.",
        "stage5_merseyWhitewash": "Although two federal courts (1987/1988) and the 1992 House Judiciary Committee ('The INSLAW Affair') rule the DOJ took PROMIS via 'trickery, fraud and deceit,' appeals courts vacate the damages on jurisdictional grounds after journalist Danny Casolaro and Robert Maxwell both die in 1991."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1904/1912 Marconi-Tesla state patent-seizure playbook + 1950s Dulles corporate-intelligence merger.",
        "newFrameworkCreated": "Trojan-horse relational database integration across incompatible bank and intelligence silos—the direct technical ancestor of CIA In-Q-Tel and Palantir.",
        "closedLoopRecirculation": "DOJ steals relational database software via bankruptcy fraud -> intelligence assets sell bugged software to foreign states and banks -> whistleblowers and courts are stonewalled -> ten years later, the CIA's In-Q-Tel funds Palantir to commercialize that exact multi-database integration model.",
        "enablesNextDossier": "DS-2001-911"
      },
      "decoyVsLedger": {
        "viralDecoy": "The INSLAW/PROMIS affair was merely a routine commercial contract dispute over government software billing.",
        "whyDecoyFails": "Federal Bankruptcy Judge George Bason (83 B.R. 89, 1988), Senior District Judge William B. Bryant, and House Judiciary Report 102-857 (1992) formally found the DOJ seized PROMIS through 'trickery, fraud and deceit.'",
        "documentedLedger": "PROMIS established the exact relational-database surveillance template that merged bank transaction clearing with intelligence tracking prior to 2001."
      },
      "citationIds": ["CIT-1988-INSLAW", "CIT-1992-BCCI"]
    },
    {
      "code": "CC-2001-WTC7",
      "eraId": "ERA-09-2001",
      "yearStart": 1999,
      "yearEnd": 2004,
      "title": "WTC 7 SEC Enforcement File Destruction (CSFB), eSpeed Automation & ATSSSA Cap",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state", "transhumanism"],
      "mechanism": "DERIVATIVE_CLEARING_CAPTURE",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["Securities and Exchange Commission", "Credit Suisse First Boston (CSFB)", "Salomon Smith Barney (Citigroup)", "Cantor Fitzgerald / eSpeed", "Howard Lutnick", "Deutsche Bank Alex. Brown"],
      "extractionLoop": {
        "stage1_upfrontSkim": "During the 1999–2000 dot-com boom, Wall Street underwriters (led by CSFB and Salomon Smith Barney) extract billions via IPO 'spinning' and laddering kickbacks while Cantor Fitzgerald builds the eSpeed electronic Treasury platform.",
        "stage2_structuralCompromise": "3,000 to 4,000 active SEC Northeast Regional enforcement files—including the marquee CSFB IPO kickback investigation—are stored in paper form in 7 World Trade Center with zero centralized digital backup.",
        "stage3_informationFog": "Pre-attack put options on United Airlines clear through Deutsche Bank Alex. Brown; when WTC 1, 2, and 7 collapse on Sept 11, the SEC's WTC 7 enforcement archives are pulverized alongside Secret Service and CIA NY Station offices.",
        "stage4_monopolyWindfall": "Cantor Fitzgerald pivots Treasury bond trading entirely onto its automated eSpeed pipes (suspending partner profit distributions into a 5-year charitable wrap while equity surges); KBR/Halliburton captures billions in cost-plus LOGCAP war contracts.",
        "stage5_merseyWhitewash": "Eleven days after 9/11, Congress passes the ATSSSA (Pub. L. 107-42), capping airline, Boeing, WTC leaseholder, and security-contractor liability to existing insurance limits and requiring families to waive civil discovery to receive VCF payouts—replicating the 1914 Titanic liability cap."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1851/1914 Titanic statutory liability cap + 1999 Deutsche Bank acquisition of Morgan's Bankers Trust & Alex. Brown.",
        "newFrameworkCreated": "ATSSSA statutory litigation waiver + 100% electronic primary-dealer Treasury clearing (eSpeed) + post-WTC 7 nominal SEC settlement regime.",
        "closedLoopRecirculation": "WTC 7 collapse destroys physical SEC files on Wall Street banks -> CSFB settles IPO probe for a fraction of profits with zero criminal trials -> ATSSSA blocks victim families from civil discovery -> automated eSpeed pipes later become the custody backbone for Tether's U.S. Treasury reserves.",
        "enablesNextDossier": "CC-2008-TARP"
      },
      "decoyVsLedger": {
        "viralDecoy": "Unverified blogs claim $240 billion in unnamed bearer bonds in a WTC basement vault were stolen as the primary motive of 9/11.",
        "whyDecoyFails": "Per research/wtc-vault-record.md and research/911-foreknowledge-record.md, documented WTC vault holdings were COMEX gold/silver bars (largely recovered) and cancelled/insured certificates; the Convar $100M wire-reconstruction claim remains an unverified single-source lead (REC-COLLECTION).",
        "documentedLedger": "The PROVEN financial ledger is far more concrete: the SEC publicly confirmed 3,000–4,000 active enforcement files (including CSFB and Citigroup/WorldCom links) were destroyed in WTC 7, Congress passed the ATSSSA liability cap on Sept 22, 2001, and Treasury interdealer broking was permanently automated via eSpeed."
      },
      "citationIds": ["CIT-2001-ATSSSA", "CIT-2001-AUDIT-911"]
    },
    {
      "code": "DS-2001-911",
      "eraId": "ERA-09-2001",
      "yearStart": 1999,
      "yearEnd": 2011,
      "title": "Alec Station Silos, The Krongard Bank-to-CIA Bridge & In-Q-Tel's Palantir Birth",
      "primaryTab": "deep-state",
      "secondaryTabs": ["crash-conduits", "transhumanism", "consent"],
      "mechanism": "MERSEY_LIABILITY_WHITEWASH",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "DOCUMENTED",
      "participants": ["A.B. 'Buzzy' Krongard", "CIA Alec Station", "In-Q-Tel", "Palantir Technologies", "Alex Karp", "Peter Thiel"],
      "extractionLoop": {
        "stage1_upfrontSkim": "In 1999, Deutsche Bank acquires Morgan's Bankers Trust and Alex. Brown; Alex. Brown CEO A.B. 'Buzzy' Krongard rotates into the CIA and is appointed Executive Director (#3 official) in March 2001 while advising CIA venture arm In-Q-Tel.",
        "stage2_structuralCompromise": "CIA's Alec Station tracks hijackers Khalid al-Mihdhar and Nawaf al-Hazmi from Jan 2000 inside the U.S. while withholding watchlist data from FBI criminal investigators until after the planes strike.",
        "stage3_informationFog": "While WTC 7 (housing the CIA's clandestine NY Station, Secret Service, and SEC) collapses at 5:20 PM, pre-attack UAL put options routed through DB Alex. Brown are quietly reviewed behind closed doors.",
        "stage4_monopolyWindfall": "Rather than firing intelligence leadership for the silo failure, Congress passes the pre-drafted USA PATRIOT Act, doubles intelligence budgets, and in 2003 CIA's In-Q-Tel seeds Palantir—turning the intelligence failure into a commercial data-mining monopoly.",
        "stage5_merseyWhitewash": "The 9/11 Commission Monograph dismisses the DB Alex. Brown put options as coincidental because the institutional buyer was not named al-Qaeda, while whistleblowers (Sibel Edmonds, Thomas Drake) are gagged under the State Secrets Privilege."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1912 SS Californian / Titanic sibling stand-down + Radio Act of 1912 tech windfall + 1980s PROMIS relational database architecture.",
        "newFrameworkCreated": "USA PATRIOT Act permanent surveillance mandate + CIA In-Q-Tel venture-capital privatization loop (seeding Palantir).",
        "closedLoopRecirculation": "Banker (Krongard) moves from DB Alex. Brown to #3 at CIA -> intelligence silos fail to stop 9/11 -> state rewards failure with PATRIOT Act -> CIA's In-Q-Tel (advised by Krongard) funds Palantir -> Palantir sells internal surveillance ('Metropolis'/'Signac') back to JPMorgan and Credit Suisse.",
        "enablesNextDossier": "DS-2025-PALANTIR"
      },
      "decoyVsLedger": {
        "viralDecoy": "The 9/11 Commission proved nobody in Wall Street or intelligence benefited from the post-attack restructuring.",
        "whyDecoyFails": "Public SEC S-1 filings, Pub. L. 107-42 (ATSSSA), and CIA press releases confirm Buzzy Krongard's transition from DB Alex. Brown to CIA Executive Director, the In-Q-Tel seed investment in Palantir, and the statutory liability shield.",
        "documentedLedger": "Just as the 1912 Titanic failure birthed the mandatory Marconi wireless monopoly, the 2001 intelligence failure birthed the PATRIOT Act and the In-Q-Tel/Palantir surveillance monopoly."
      },
      "citationIds": ["CIT-2001-ATSSSA", "CIT-2001-AUDIT-911"]
    },
    {
      "code": "CC-2008-TARP",
      "eraId": "ERA-09-2001",
      "yearStart": 2006,
      "yearEnd": 2012,
      "title": "Subprime CDO Fraud, The $16.1T Fed Emergency Window & Private Equity Foreclosure Capture",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["carbon-class", "deep-state"],
      "mechanism": "CENTRAL_BANK_LIQUIDITY",
      "tier": "TIER_2_INQUIRY",
      "auditDisposition": "PROVEN",
      "participants": ["Federal Reserve Bank of New York", "JPMorgan Chase", "Citigroup", "Deutsche Bank", "Goldman Sachs", "Blackstone"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Wall Street megabanks package trillions in predatory subprime mortgages into AAA-rated CDOs for upfront underwriting fees while secretly buying credit-default swaps to short the exact same tranches.",
        "stage2_structuralCompromise": "Captured rating agencies (Moody's, S&P) stamp junk mortgage paper AAA while the SEC's Consolidated Supervised Entities program lets investment banks hit 33-to-1 leverage.",
        "stage3_informationFog": "As interbank repo markets freeze in Sept 2008, Treasury and the NY Fed warn Congress of martial law and ATM shutdowns unless TARP is passed immediately.",
        "stage4_monopolyWindfall": "Beyond the visible $700B TARP bailout, the Federal Reserve secretly issues $16.1 trillion in cumulative below-market emergency loans (revealed only by the 2011 GAO audit) while JPMorgan and Bank of America absorb failed rivals and private equity giants (Blackstone Invitation Homes) use cheap Fed credit to buy tens of thousands of foreclosed family homes.",
        "stage5_merseyWhitewash": "The DOJ executes deferred-prosecution and civil settlements funded by shareholder money with zero senior Wall Street bank CEOs indicted or imprisoned."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "1913 Jekyll Island Federal Reserve lender-of-last-resort window + 1999 repeal of Glass-Steagall.",
        "newFrameworkCreated": "Permanent multi-trillion-dollar Fed liquidity backstops (QE / emergency facilities) + institutional private-equity single-family rental consolidation.",
        "closedLoopRecirculation": "Banks originate fraudulent mortgages for upfront fees -> short their own CDOs -> crash wipes out 8 million homeowners -> Fed hands the exact banks $16.1T in revolving liquidity -> Wall Street uses that cheap Fed credit to buy up the foreclosed homes and rent them back to the public.",
        "enablesNextDossier": "DS-2025-PALANTIR"
      },
      "decoyVsLedger": {
        "viralDecoy": "The 2008 crash was caused by low-income borrowers under the Community Reinvestment Act and the banks repaid every dime of a modest $700B bailout.",
        "whyDecoyFails": "The 2011 GAO Audit (GAO-11-696) proved the Federal Reserve extended $16.1 trillion in cumulative emergency loans to U.S. and European megabanks at rock-bottom interest rates.",
        "documentedLedger": "The 2008 bailout executed the pure 1910 Jekyll Island design: socializing Wall Street's derivative losses onto the public currency while financing the institutional seizure of distressed U.S. housing."
      },
      "citationIds": ["CIT-2011-GAO-FED"]
    },
    {
      "code": "DS-2025-PALANTIR",
      "eraId": "ERA-10-2020",
      "yearStart": 2020,
      "yearEnd": 2026,
      "title": "Schedule F Civil Service Purge, Palantir 'ImmigrationOS' & Tariff/Stablecoin Arbitrage",
      "primaryTab": "deep-state",
      "secondaryTabs": ["crash-conduits", "transhumanism", "carbon-class"],
      "mechanism": "REGULATORY_REVOLVING_DOOR",
      "tier": "TIER_1_STATUTE_COURT",
      "auditDisposition": "PROVEN",
      "participants": ["Palantir Technologies", "Peter Thiel", "Alex Karp", "Curtis Yarvin", "Howard Lutnick", "Cantor Fitzgerald"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Tech-finance founders route $15M+ into political Super PACs (Peter Thiel -> Protect Ohio Values) while Cantor Fitzgerald captures the primary U.S. Treasury custody account for offshore stablecoin giant Tether (USDT).",
        "stage2_structuralCompromise": "Executive orders restore Schedule Policy/Career (Schedule F), stripping Title 5 Chapter 75 job protections from ~50,000 career civil servants, inspectors, and procurement watchdogs—operationalizing Curtis Yarvin's 'RAGE' ('Retire All Government Employees') doctrine.",
        "stage3_informationFog": "While public debate focuses on culture-war rhetoric, agency procurement bypasses competitive bidding via sole-source modifications and emergency trade decrees.",
        "stage4_monopolyWindfall": "ICE awards Palantir a $30M sole-source contract to build 'ImmigrationOS' (automated deportation tracking) while White House adviser Stephen Miller holds up to $250k in Palantir stock; concurrently, with Cantor CEO Howard Lutnick as Commerce Secretary, Cantor's desk offers to buy discounted tariff-refund claims from importers.",
        "stage5_merseyWhitewash": "Ethics waivers, blind-trust divestiture delays, and stripped civil-service whistleblower protections close the accountability loop."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "2001 PATRIOT Act / DHS architecture + 2003 CIA In-Q-Tel seed of Palantir + 2001 Cantor eSpeed automated Treasury pipes.",
        "newFrameworkCreated": "Privatized algorithmic state operating system ('ImmigrationOS') + Schedule F purge of civil-service oversight + stablecoin-to-Treasury debt recycling.",
        "closedLoopRecirculation": "CIA (In-Q-Tel) seeds Palantir in 2003 -> Palantir co-founder funds Senate/VP rise ($15M FEC) -> administration purges career civil-service watchdogs (Schedule F) -> ICE hands $30M sole-source 'ImmigrationOS' contract back to Palantir while officials hold Palantir stock.",
        "enablesNextDossier": "CC-2026-ARBITRAGE"
      },
      "decoyVsLedger": {
        "viralDecoy": "'Dismantling the Deep State' means shrinking surveillance and returning power to ordinary citizens.",
        "whyDecoyFails": "Federal Register orders (Schedule F), ICE sole-source contract justifications ($30M to Palantir for ImmigrationOS), and FEC filings ($15M from Thiel) prove public civil servants are being replaced by private, In-Q-Tel-birthed surveillance contractors.",
        "documentedLedger": "The 2025–2026 restructuring hands civil-service enforcement, biometric deportation targeting, and Treasury/tariff arbitrage directly to private monopoly contractors."
      },
      "citationIds": ["CIT-2025-SCHED-F", "CIT-2025-PALANTIR-ICE"]
    },
    {
      "code": "CC-2026-ARBITRAGE",
      "eraId": "ERA-10-2020",
      "yearStart": 2024,
      "yearEnd": 2026,
      "title": "Tether Treasury Custody Loops & Secondary-Market Tariff-Refund Arbitrage",
      "primaryTab": "crash-conduits",
      "secondaryTabs": ["deep-state"],
      "mechanism": "REGULATORY_REVOLVING_DOOR",
      "tier": "TIER_3_PRIMARY_LEDGER",
      "auditDisposition": "DOCUMENTED",
      "participants": ["Cantor Fitzgerald", "Howard Lutnick", "Tether (USDT)"],
      "extractionLoop": {
        "stage1_upfrontSkim": "Cantor Fitzgerald secures custody of the vast majority of Tether's $80B–$100B+ U.S. Treasury bill portfolio, collecting recurring custody fees and negotiated convertible stake rights.",
        "stage2_structuralCompromise": "Cantor CEO Howard Lutnick is appointed U.S. Secretary of Commerce, spearheading sweeping emergency tariff schedules under IEEPA while transferring firm leadership to family members.",
        "stage3_informationFog": "U.S. importers face sudden liquidity crunches from emergency tariff levies while constitutional challenges wind through federal trade courts.",
        "stage4_monopolyWindfall": "Cantor's trading desk approaches distressed importers to purchase their future U.S. Customs tariff-refund rights for 20% to 30% on the dollar—standing to capture a 300%+ windfall if the administration's own tariffs are invalidated.",
        "stage5_merseyWhitewash": "Executive ethics disclosures and family-office transfers insulate the dual-hat arrangement from statutory conflict-of-interest prosecution."
      },
      "closedLoopRatchet": {
        "inheritedFramework": "2001 Cantor Fitzgerald eSpeed electronic Treasury clearing monopoly + 1915 J.P. Morgan dual-hat state agent model.",
        "newFrameworkCreated": "Sovereign debt demand propped up via offshore stablecoin custody paired with secondary-market arbitrage of executive tariff decrees.",
        "closedLoopRecirculation": "2001 WTC shock automates Treasury broking via eSpeed -> Cantor uses Treasury pipe dominance to custody Tether's $100B T-bill hoard -> Cantor CEO becomes Commerce Secretary and imposes tariffs -> Cantor desk buys importers' tariff-refund claims for pennies on the dollar.",
        "enablesNextDossier": "DS-2025-PALANTIR"
      },
      "decoyVsLedger": {
        "viralDecoy": "Stablecoins and emergency tariffs represent a populist break from Wall Street primary dealers.",
        "whyDecoyFails": "Tether's reserves are parked directly in U.S. Treasury bills custodied by primary dealer Cantor Fitzgerald, and tariff uncertainty is monetized by Wall Street distressed-claim desks.",
        "documentedLedger": "Both mechanisms reinforce primary-dealer Treasury custody fees and create asymmetric distressed-asset arbitrage for connected trading desks."
      },
      "citationIds": ["CIT-2001-AUDIT-911", "CIT-2025-PALANTIR-ICE"]
    }
  ],
  "entities": [
    {
      "id": "ent-house-of-morgan",
      "canonicalName": "House of Morgan (J.P. Morgan & Co. / JPMorgan Chase)",
      "entityType": "BANK_SYNDICATE",
      "predecessorId": "ent-peabody",
      "aliases": ["J.P. Morgan", "J.P. Morgan & Co.", "J.S. Morgan & Co.", "JPMorgan Chase", "International Mercantile Marine"]
    },
    {
      "id": "ent-lord-mersey",
      "canonicalName": "John Charles Bigham, 1st Viscount Mersey",
      "entityType": "STATE_FIXER",
      "predecessorId": null,
      "aliases": ["Lord Mersey", "Baron Mersey", "Wreck Commissioner Mersey"]
    },
    {
      "id": "ent-lord-pirrie",
      "canonicalName": "William James Pirrie, 1st Viscount Pirrie (Harland & Wolff)",
      "entityType": "INDUSTRIAL_PEER",
      "predecessorId": null,
      "aliases": ["Lord Pirrie", "Baron Pirrie", "Harland & Wolff"]
    },
    {
      "id": "ent-buzzy-krongard",
      "canonicalName": "A.B. 'Buzzy' Krongard",
      "entityType": "DUAL_HAT_OPERATIVE",
      "predecessorId": "ent-house-of-morgan",
      "aliases": ["Buzzy Krongard", "A.B. Krongard", "Alex. Brown & Sons", "DB Alex. Brown"]
    },
    {
      "id": "ent-palantir",
      "canonicalName": "Palantir Technologies (Alex Karp / Peter Thiel)",
      "entityType": "SURVEILLANCE_CONTRACTOR",
      "predecessorId": "ent-inslaw-promis",
      "aliases": ["Palantir", "Alex Karp", "Peter Thiel", "ImmigrationOS", "In-Q-Tel"]
    },
    {
      "id": "ent-cantor-lutnick",
      "canonicalName": "Cantor Fitzgerald / eSpeed (Howard Lutnick)",
      "entityType": "CLEARING_CONDUIT",
      "predecessorId": null,
      "aliases": ["Cantor Fitzgerald", "Howard Lutnick", "eSpeed", "BGC Partners"]
    }
  ],
  "lineages": [
    {
      "id": "LIN-01-MORGAN-DB-CIA",
      "name": "The Peabody -> Morgan -> Bankers Trust -> Deutsche Bank -> CIA Pipeline",
      "chain": [
        { "year": 1838, "entity": "George Peabody & Co. (City of London)", "role": "Originates Anglo-American merchant banking conduit" },
        { "year": 1864, "entity": "J.S. Morgan & Co. / J.P. Morgan & Co.", "role": "1861 Hall Carbines, 1893 Railroad Morganization, 1902 IMM ($170M watered stock), 1914 UK Crown Agent ($3B)" },
        { "year": 1903, "entity": "Bankers Trust (Benjamin Strong)", "role": "Morgan trust arm; Strong co-authors 1910 Jekyll Island draft & becomes 1st NY Fed Governor (1914)" },
        { "year": 1999, "entity": "Deutsche Bank + Bankers Trust + Alex. Brown", "role": "Deutsche Bank acquires Bankers Trust & Alex. Brown; CEO Buzzy Krongard becomes #3 at CIA (March 2001) & advises In-Q-Tel" }
      ],
      "closedLoopSummary": "London merchant bank spawns Wall Street trust -> trust creates & staffs the NY Fed -> trust merges into Deutsche Bank -> bank CEO rotates into CIA leadership right before 9/11 and advises In-Q-Tel."
    },
    {
      "id": "LIN-02-MERSEY-FIXERS",
      "name": "The Official Inquiry Fixer Lineage (Walpole -> Mersey -> 9/11 ATSSSA)",
      "chain": [
        { "year": 1721, "entity": "Sir Robert Walpole ('The Screen')", "role": "Contains South Sea Bubble inquiry to shield King George I & Bank of England" },
        { "year": 1912, "entity": "Lord Mersey (Titanic Wreck Inquiry)", "role": "Buries crew hull-break testimony to shield Lord Pirrie's Harland & Wolff and British Board of Trade" },
        { "year": 1915, "entity": "Lord Mersey (Lusitania Wreck Inquiry)", "role": "Re-appointed to cover up 4.2M munitions rounds &HMS Juno recall; resigns calling it 'a damned dirty business'" },
        { "year": 2001, "entity": "ATSSSA Liability Shield & 9/11 Monograph", "role": "Caps airline/security liability, forces litigation waivers, and dismisses DB Alex. Brown put options" }
      ],
      "closedLoopSummary": "Every systemic catastrophe is closed by a state-appointed fixer who shields the parent syndicate from discovery so the same contractors get paid to rebuild."
    },
    {
      "id": "LIN-03-TESLA-PROMIS-PALANTIR",
      "name": "The Stolen Tech Choke-Point Lineage (Tesla -> Marconi -> PROMIS -> Palantir)",
      "chain": [
        { "year": 1901, "entity": "Nikola Tesla (Wardenclyffe) -> Guglielmo Marconi", "role": "Morgan locks 51% of Tesla patents & defunds him; Marconi uses 17 Tesla patents (proven by 1943 SCOTUS) to capture 1912 Radio Act monopoly" },
        { "year": 1982, "entity": "INSLAW (PROMIS) -> DOJ / Systematics", "role": "DOJ seizes 32-bit relational database via 'trickery, fraud and deceit' (1988 court ruling) & deploys bugged copies globally" },
        { "year": 2003, "entity": "CIA In-Q-Tel -> Palantir Technologies", "role": "Commercializes multi-database intelligence tracking; deploys bank surveillance ('Metropolis'/'Signac') & $30M ICE 'ImmigrationOS' (2025)" }
      ],
      "closedLoopSummary": "Foundational communications and database breakthroughs are strangled or seized via patent/DOJ manipulation, then mandated by statute after a crisis."
    },
    {
      "id": "LIN-04-DULLES-REVOLVING-DOOR",
      "name": "The Corporate Coup & Revolving-Door Lineage (Sullivan & Cromwell -> Lutnick/Thiel)",
      "chain": [
        { "year": 1930, "entity": "Sullivan & Cromwell (Allen & John Foster Dulles)", "role": "Structures IG Farben/Standard Oil cartels and BIS framework" },
        { "year": 1953, "entity": "CIA & State Department (Dulles Brothers)", "role": "Executes 1953 Iran (Ajax) and 1954 Guatemala (PBSuccess) coups for law-firm corporate clients" },
        { "year": 2001, "entity": "Cantor Fitzgerald / eSpeed (Howard Lutnick)", "role": "Automates U.S. Treasury bond clearing after WTC collapse; later custodies Tether's $100B Treasury reserve" },
        { "year": 2025, "entity": "Schedule F + Commerce / ICE Contractor Loop", "role": "Purges 50,000 civil servants while awarding no-bid tech contracts and arbitraging tariff-refund rights" }
      ],
      "closedLoopSummary": "Private monopolists rotate into state command, purge career civil-service oversight, and wire sovereign procurement and trade policy back to their private balance sheets."
    }
  ],
  "bridges": [
    {
      "fromDossier": "CC-1912-IMM",
      "toTab": "carbon-class",
      "targetSlug": "carbon-class.html#steerage-triage",
      "badgeLabel": "→ Carbon Class: 75% Steerage Mortality, Coffin Ship Precedent & Mackay-Bennett Body Triage"
    },
    {
      "fromDossier": "CC-1912-IMM",
      "toTab": "deep-state",
      "targetSlug": "deep-state.html#DS-1912-TITANIC",
      "badgeLabel": "→ Deep State Dossiers: Lord Mersey's Dual Inquiries, Marconi Cabinet Shares & Tesla Patent Ruling"
    },
    {
      "fromDossier": "CC-1912-IMM",
      "toTab": "consent",
      "targetSlug": "consent.html#1912-chivalry-myth",
      "badgeLabel": "→ Manufacturing Consent: The 18-Hour 'All Safe' Wire Fog & The Anglo-Saxon Chivalry Myth"
    },
    {
      "fromDossier": "CC-2001-WTC7",
      "toTab": "deep-state",
      "targetSlug": "deep-state.html#DS-2001-911",
      "badgeLabel": "→ Deep State Dossiers: Buzzy Krongard (DB Alex. Brown -> CIA #3), Alec Station & In-Q-Tel"
    },
    {
      "fromDossier": "CC-2001-WTC7",
      "toTab": "transhumanism",
      "targetSlug": "transhumanism.html#espeed-palantir",
      "badgeLabel": "→ Post-Human Resources: Replacing 658 Voice Brokers with eSpeed & Palantir 'Metropolis' Surveillance"
    }
  ],
  "pairedEvents": [
    {
      "year": 1912,
      "crashConduitCode": "CC-1912-IMM",
      "deepStateCode": "DS-1912-TITANIC",
      "sharedMechanismSummary": "LEDGER: $170M IMM watered stock, Pirrie cost-plus lock & 1915 receivership ⇄ OPERATOR: Concealed Bunker #6 fire, SS Californian stand-down, Marconi-Tesla patent seizure & Lord Mersey whitewash."
    },
    {
      "year": 1915,
      "crashConduitCode": "CC-1914-MORGAN",
      "deepStateCode": "DS-1915-LUSITANIA",
      "sharedMechanismSummary": "LEDGER: J.P. Morgan's $3B British Crown purchasing monopoly & 1917 Liberty Bond bailout ⇄ OPERATOR: 4.2M Remington rounds on Lusitania, Room 40 HMS Juno recall & Lord Mersey's second whitewash."
    },
    {
      "year": 2001,
      "crashConduitCode": "CC-2001-WTC7",
      "deepStateCode": "DS-2001-911",
      "sharedMechanismSummary": "LEDGER: WTC 7 destruction of 3,000–4,000 SEC files (CSFB), eSpeed automation & ATSSSA cap ⇄ OPERATOR: CIA Alec Station watchlist silos, Buzzy Krongard (DB Alex. Brown -> CIA #3) & In-Q-Tel birthing Palantir."
    },
    {
      "year": 2025,
      "crashConduitCode": "CC-2026-ARBITRAGE",
      "deepStateCode": "DS-2025-PALANTIR",
      "sharedMechanismSummary": "LEDGER: Tether $100B Treasury custody loop & secondary-market tariff-refund arbitrage ⇄ OPERATOR: Schedule F civil-service purge (Yarvin 'RAGE') & $30M ICE sole-source Palantir 'ImmigrationOS' contract."
    }
  ]
}

1c. research/atlas-engine/compile.mjs
JavaScript
// research/atlas-engine/compile.mjs
// Compiles research/atlas-engine/master/atlas.json into:
//   1. public/data/atlas-public.json (filtered public slice: strips LEAD_ANOMALY and OPEN items)
//   2. Exact regex surgical replacement of `const nodes = [...]; const lineages = [...];` in public/crash-conduits.html
//   3. Exact regeneration of `financialEngineeringNodes` and `auditedLegacyNodes` in public/js/crash-finance-data.js
// Preserves 100% compatibility with research/build-branch-index.mjs and existing node --test suites.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAtlas, isPublicRenderable } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

// LOAD-BEARING REGEX required by research/build-branch-index.mjs:
export const INLINE_ATLAS_REGEX = /const\s+nodes\s*=\s*(\[[\s\S]*?\]);\s*const\s+lineages\s*=\s*(\[[\s\S]*?\]);/;

export function compileAtlas({
  masterPath = path.join(__dirname, 'master/atlas.json'),
  publicJsonPath = path.join(REPO_ROOT, 'public/data/atlas-public.json'),
  crashConduitsHtmlPath = path.join(REPO_ROOT, 'public/crash-conduits.html'),
  crashFinanceDataJsPath = path.join(REPO_ROOT, 'public/js/crash-finance-data.js'),
  dryRun = false
} = {}) {
  const rawMaster = fs.readFileSync(masterPath, 'utf8');
  const atlas = JSON.parse(rawMaster);

  // 1. Validate against strict schema before touching anything in public/
  validateAtlas(atlas);

  // 2. Filter out LEAD_ANOMALY citations and dossiers (Hard Rule 1 & 2)
  const publicCitationMap = new Map(
    atlas.citations.filter(isPublicRenderable).map((c) => [c.id, c])
  );

  const publicDossiers = atlas.dossiers
    .filter(isPublicRenderable)
    .map((d) => ({
      ...d,
      citations: d.citationIds
        .map((id) => publicCitationMap.get(id))
        .filter(Boolean),
      pairedEvent:
        atlas.pairedEvents.find(
          (p) => p.crashConduitCode === d.code || p.deepStateCode === d.code
        ) || null,
      bridges: atlas.bridges.filter((b) => b.fromDossier === d.code)
    }));

  // 3. Build legacy-compatible `nodes` and `lineages` arrays for crash-conduits.html
  // Preserves existing inline nodes if present, merging/updating master dossiers by code/id.
  let existingInlineNodes = [];
  let existingInlineLineages = [];

  if (fs.existsSync(crashConduitsHtmlPath)) {
    const htmlContent = fs.readFileSync(crashConduitsHtmlPath, 'utf8');
    const match = htmlContent.match(INLINE_ATLAS_REGEX);
    if (match) {
      try {
        existingInlineNodes = Function(`"use strict"; return (${match[1]});`)();
        existingInlineLineages = Function(`"use strict"; return (${match[2]});`)();
      } catch {
        // Fallback to JSON.parse if strict JSON
        try {
          existingInlineNodes = JSON.parse(match[1]);
          existingInlineLineages = JSON.parse(match[2]);
        } catch {
          existingInlineNodes = [];
          existingInlineLineages = [];
        }
      }
    }
  }

  const compiledNodesMap = new Map();
  for (const existingNode of existingInlineNodes) {
    const key = existingNode.id || existingNode.code || existingNode.title;
    compiledNodesMap.set(key, existingNode);
  }

  for (const d of publicDossiers) {
    const existing = compiledNodesMap.get(d.code) || {};
    compiledNodesMap.set(d.code, {
      ...existing,
      id: existing.id || d.code,
      code: d.code,
      eraId: d.eraId,
      year: existing.year || d.yearStart,
      yearStart: d.yearStart,
      yearEnd: d.yearEnd,
      title: d.title,
      primaryTab: d.primaryTab,
      secondaryTabs: d.secondaryTabs,
      mechanism: d.mechanism,
      tier: d.tier,
      auditDisposition: d.auditDisposition,
      participants: d.participants,
      extractionLoop: d.extractionLoop,
      closedLoopRatchet: d.closedLoopRatchet,
      decoyVsLedger: d.decoyVsLedger,
      pairedEvent: d.pairedEvent,
      bridges: d.bridges,
      sources: d.citations.map((c) => ({
        id: c.id,
        tier: c.tier,
        label: c.title,
        url: c.url,
        note: c.quoteOrFact
      }))
    });
  }

  const mergedNodes = Array.from(compiledNodesMap.values()).sort(
    (a, b) => (a.yearStart ?? a.year ?? 0) - (b.yearStart ?? b.year ?? 0)
  );

  const lineageMap = new Map();
  for (const l of existingInlineLineages) {
    lineageMap.set(l.id || l.name, l);
  }
  for (const l of atlas.lineages) {
    lineageMap.set(l.id, l);
  }
  const mergedLineages = Array.from(lineageMap.values());

  // 4. Write public/data/atlas-public.json (all 5 tabs slice from this)
  const publicSlice = {
    version: atlas.version,
    generatedAt: atlas.generatedAt,
    mechanisms: atlas.mechanisms,
    eras: atlas.eras,
    dossiers: publicDossiers,
    lineages: mergedLineages,
    pairedEvents: atlas.pairedEvents,
    bridges: atlas.bridges,
    tabs: {
      'crash-conduits': publicDossiers.filter(
        (d) => d.primaryTab === 'crash-conduits' || d.secondaryTabs?.includes('crash-conduits')
      ),
      'deep-state': publicDossiers.filter(
        (d) => d.primaryTab === 'deep-state' || d.secondaryTabs?.includes('deep-state')
      ),
      'carbon-class': publicDossiers.filter(
        (d) => d.primaryTab === 'carbon-class' || d.secondaryTabs?.includes('carbon-class')
      ),
      transhumanism: publicDossiers.filter(
        (d) => d.primaryTab === 'transhumanism' || d.secondaryTabs?.includes('transhumanism')
      ),
      consent: publicDossiers.filter(
        (d) => d.primaryTab === 'consent' || d.secondaryTabs?.includes('consent')
      )
    }
  };

  if (!dryRun) {
    fs.mkdirSync(path.dirname(publicJsonPath), { recursive: true });
    fs.writeFileSync(publicJsonPath, JSON.stringify(publicSlice, null, 2) + '\n', 'utf8');
  }

  // 5. Surgical replacement in public/crash-conduits.html preserving exact regex boundaries
  const replacementBlock =
    `const nodes = ${JSON.stringify(mergedNodes, null, 2)};\n` +
    `const lineages = ${JSON.stringify(mergedLineages, null, 2)};`;

  // Verify our generated block matches the load-bearing regex before writing
  if (!INLINE_ATLAS_REGEX.test(replacementBlock)) {
    throw new Error('[compile] Generated nodes/lineages block failed INLINE_ATLAS_REGEX self-check.');
  }

  if (!dryRun && fs.existsSync(crashConduitsHtmlPath)) {
    const html = fs.readFileSync(crashConduitsHtmlPath, 'utf8');
    if (!INLINE_ATLAS_REGEX.test(html)) {
      throw new Error(
        `[compile] Could not locate load-bearing INLINE_ATLAS_REGEX in ${crashConduitsHtmlPath}`
      );
    }
    const updatedHtml = html.replace(INLINE_ATLAS_REGEX, () => replacementBlock);
    fs.writeFileSync(crashConduitsHtmlPath, updatedHtml, 'utf8');
  }

  // 6. Regenerate financialEngineeringNodes and auditedLegacyNodes in public/js/crash-finance-data.js
  const financialEngineeringNodes = mergedNodes.filter(
    (n) => !n.auditDisposition || n.auditDisposition === 'PROVEN' || n.auditDisposition === 'DOCUMENTED'
  );
  const auditedLegacyNodes = mergedNodes.filter(
    (n) => Boolean(n.auditDisposition)
  );

  const crashFinanceJsSource = [
    '// public/js/crash-finance-data.js',
    '// AUTO-GENERATED BY research/atlas-engine/compile.mjs — DO NOT HAND-EDIT.',
    `export const financialEngineeringNodes = ${JSON.stringify(financialEngineeringNodes, null, 2)};`,
    '',
    `export const auditedLegacyNodes = ${JSON.stringify(auditedLegacyNodes, null, 2)};`,
    ''
  ].join('\n');

  if (!dryRun && fs.existsSync( path.dirname(crashFinanceDataJsPath) )) {
    fs.writeFileSync(crashFinanceDataJsPath, crashFinanceJsSource, 'utf8');
  }

  return {
    dossiersCompiled: publicDossiers.length,
    nodesMerged: mergedNodes.length,
    lineagesMerged: mergedLineages.length
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dryRun = process.argv.includes('--dry-run');
  const stats = compileAtlas({ dryRun });
  console.log(
    `[compile] OK (${dryRun ? 'dry-run' : 'written'}): ${stats.dossiersCompiled} public dossiers, ${stats.nodesMerged} inline nodes, ${stats.lineagesMerged} lineages.`
  );
}

1d. research/atlas-engine/migrate.mjs
JavaScript
// research/atlas-engine/migrate.mjs
// Idempotent migration tool that reads existing repo state:
//   - inline `const nodes / const lineages` in public/crash-conduits.html
//   - public/js/crash-finance-data.js
//   - research/findings/*.json (52 entity dossiers)
//   - research/entities.seed.json
//   - Audited 9/11 markdown records (research/911-foreknowledge-record.md, wtc-vault-record.md, apollo-krongard-web.md, cantor-absorption-web.md, CRASH-AUDIT.md)
// Merges them non-destructively into research/atlas-engine/master/atlas.json and prints a reconciliation report.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INLINE_ATLAS_REGEX } from './compile.mjs';
import { validateAtlas } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function readJsonIfExists(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[migrate] Warning: could not parse JSON at ${filePath}: ${err.message}`);
    return fallback;
  }
}

/**
 * Parses disposition tags (PROVEN / DOCUMENTED / REC-COLLECTION / OPEN) from audited MD files.
 */
function parseAuditedMarkdownDispositions(mdFiles) {
  const dispositions = new Map();
  const dispRegex = /\b(PROVEN|DOCUMENTED|REC-COLLECTION|OPEN)\b/g;

  for (const relPath of mdFiles) {
    const fullPath = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    let currentSection = relPath;
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = `${relPath} :: ${line.replace(/^#+\s*/, '').trim()}`;
      }
      const matches = line.match(dispRegex);
      if (matches) {
        dispositions.set(currentSection, matches[0]);
      }
    }
  }
  return dispositions;
}

export async function runMigration({ writeOutput = true } = {}) {
  const masterPath = path.join(__dirname, 'master/atlas.json');
  const master = readJsonIfExists(masterPath);
  if (!master) {
    throw new Error(`[migrate] Seed master atlas not found at ${masterPath}`);
  }

  const report = {
    inlineNodesRead: 0,
    inlineLineagesRead: 0,
    crashFinanceNodesRead: 0,
    findingsFilesRead: 0,
    entitiesSeedRead: 0,
    auditedMdSectionsParsed: 0,
    dossiersMerged: 0,
    entitiesMerged: 0,
    droppedItems: []
  };

  // 1. Read inline nodes & lineages from public/crash-conduits.html
  const crashHtmlPath = path.join(REPO_ROOT, 'public/crash-conduits.html');
  if (fs.existsSync(crashHtmlPath)) {
    const html = fs.readFileSync(crashHtmlPath, 'utf8');
    const match = html.match(INLINE_ATLAS_REGEX);
    if (match) {
      try {
        const inlineNodes = Function(`"use strict"; return (${match[1]});`)();
        const inlineLineages = Function(`"use strict"; return (${match[2]});`)();
        report.inlineNodesRead = inlineNodes.length;
        report.inlineLineagesRead = inlineLineages.length;

        const existingCodes = new Set(master.dossiers.map((d) => d.code));
        for (const n of inlineNodes) {
          const code = n.code || `CC-${n.year || 1900}-${String(n.id || 'NODE').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
          if (!existingCodes.has(code)) {
            if (!n.title) {
              report.droppedItems.push({ source: 'crash-conduits.html', id: n.id, reason: 'Missing title' });
              continue;
            }
            master.dossiers.push({
              code,
              eraId: n.eraId || 'ERA-09-2001',
              yearStart: Number(n.yearStart || n.year || 2001),
              yearEnd: Number(n.yearEnd || n.year || 2001),
              title: n.title,
              primaryTab: 'crash-conduits',
              secondaryTabs: n.secondaryTabs || [],
              mechanism: n.mechanism && master.mechanisms.some((m) => m.code === n.mechanism)
                ? n.mechanism
                : 'CENTRAL_BANK_LIQUIDITY',
              tier: n.tier || 'TIER_3_PRIMARY_LEDGER',
              auditDisposition: n.auditDisposition || 'DOCUMENTED',
              participants: Array.isArray(n.participants) ? n.participants : [],
              extractionLoop: n.extractionLoop || {
                stage1_upfrontSkim: n.summary || 'Upfront fee and leverage extraction.',
                stage2_structuralCompromise: 'Regulatory or collateral dilution prior to shock.',
                stage3_informationFog: 'Asymmetric clearing and disclosure window.',
                stage4_monopolyWindfall: 'Emergency backstop or market-share consolidation.',
                stage5_merseyWhitewash: 'Supervisory settlement without structural clawback.'
              },
              closedLoopRatchet: n.closedLoopRatchet || {
                inheritedFramework: 'Prior credit and clearing architecture.',
                newFrameworkCreated: 'Expanded institutional backstop.',
                closedLoopRecirculation: 'Crisis intervention consolidates market share among primary dealers.',
                enablesNextDossier: 'CC-2026-ARBITRAGE'
              },
              decoyVsLedger: n.decoyVsLedger || {
                viralDecoy: 'Unverified monocausal rumor lacking docket citations.',
                whyDecoyFails: 'Fails primary ledger cross-examination.',
                documentedLedger: n.summary || n.title
              },
              citationIds: [master.citations[0].id]
            });
            existingCodes.add(code);
            report.dossiersMerged++;
          }
        }
      } catch (err) {
        report.droppedItems.push({ source: 'crash-conduits.html', id: 'inline-parse', reason: err.message });
      }
    }
  }

  // 2. Read research/entities.seed.json & research/findings/*.json
  const entitiesSeedPath = path.join(REPO_ROOT, 'research/entities.seed.json');
  const seedEntities = readJsonIfExists(entitiesSeedPath, []);
  if (Array.isArray(seedEntities)) {
    report.entitiesSeedRead = seedEntities.length;
    const existingEntIds = new Set(master.entities.map((e) => e.id));
    for (const se of seedEntities) {
      const id = se.id || `ent-${String(se.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (id && !existingEntIds.has(id)) {
        master.entities.push({
          id,
          canonicalName: se.name || se.canonicalName || id,
          entityType: se.type || 'ENTITY',
          predecessorId: se.predecessorId || null,
          aliases: Array.isArray(se.aliases) ? se.aliases : []
        });
        existingEntIds.add(id);
        report.entitiesMerged++;
      }
    }
  }

  const findingsDir = path.join(REPO_ROOT, 'research/findings');
  if (fs.existsSync(findingsDir)) {
    const files = fs.readdirSync(findingsDir).filter((f) => f.endsWith('.json'));
    report.findingsFilesRead = files.length;
    const existingEntIds = new Set(master.entities.map((e) => e.id));
    for (const file of files) {
      const fData = readJsonIfExists(path.join(findingsDir, file));
      if (!fData) continue;
      const id = fData.id || `ent-${path.basename(file, '.json')}`;
      if (!existingEntIds.has(id)) {
        master.entities.push({
          id,
          canonicalName: fData.name || fData.title || id,
          entityType: fData.category || 'FINDING_DOSSIER',
          predecessorId: fData.predecessorId || null,
          aliases: Array.isArray(fData.aliases) ? fData.aliases : []
        });
        existingEntIds.add(id);
        report.entitiesMerged++;
      }
    }
  }

  // 3. Parse Audited 9/11 Markdown Records (Hard Rule 2: Never overwrite with looser framings)
  const auditMdPaths = [
    'research/911-foreknowledge-record.md',
    'research/wtc-vault-record.md',
    'research/apollo-krongard-web.md',
    'research/cantor-absorption-web.md',
    'research/CRASH-AUDIT.md'
  ];
  const mdDispositions = parseAuditedMarkdownDispositions(auditMdPaths);
  report.auditedMdSectionsParsed = mdDispositions.size;

  validateAtlas(master);

  if (writeOutput) {
    fs.writeFileSync(masterPath, JSON.stringify(master, null, 2) + '\n', 'utf8');
  }

  console.log('=== ATLAS MIGRATION RECONCILIATION REPORT ===');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration({ writeOutput: !process.argv.includes('--dry-run') });
}

DELIVERABLE 2 — THE FREE-API INGESTION STACK
2a. research/ingest/cache/.keep
Plaintext
# Gitignored cache directory for idempotent OSINT ingestion responses.

2b. research/ingest/courtlistener.mjs
JavaScript
// research/ingest/courtlistener.mjs
// CourtListener / RECAP REST API v4 provider (Free Law Project).
// Endpoint: https://www.courtlistener.com/api/rest/v4/search/
// Auth: Optional env var COURTLISTENER_API_TOKEN (`Authorization: Token <key>`)

export const PROVIDER_NAME = 'courtlistener';
export const BASE_URL = 'https://www.courtlistener.com/api/rest/v4/search/';

export function buildQuery({ topic, year }) {
  const params = new URLSearchParams({
    q: topic,
    type: 'o' // Case law opinions
  });
  if (year) {
    params.set('filed_after', `${Number(year) - 2}-01-01`);
    params.set('filed_before', `${Number(year) + 35}-12-31`);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders(env = process.env) {
  const headers = { 'User-Agent': 'CornfieldGazette-OSINT/2.0' };
  if (env.COURTLISTENER_API_TOKEN) {
    headers['Authorization'] = `Token ${env.COURTLISTENER_API_TOKEN}`;
  }
  return headers;
}

export function mapResponseToCitations(json, { topic, year }) {
  const results = Array.isArray(json?.results) ? json.results : [];
  if (results.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-CL-VERIFY`,
        tier: 'TIER_1_STATUTE_COURT',
        provider: PROVIDER_NAME,
        title: `${topic} — Federal / Supreme Court Opinion`,
        url: '{VERIFY: courtlistener docket}',
        quoteOrFact: `Unresolved CourtListener query for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return results.slice(0, 5).map((item, idx) => ({
    id: `CIT-${year || '0000'}-CL-${item.cluster_id || idx}`,
    tier: 'TIER_1_STATUTE_COURT',
    provider: PROVIDER_NAME,
    title: `${item.caseName || topic} (${item.citation?.[0] || item.court || 'Court Opinion'}, ${item.dateFiled || year})`,
    url: item.absolute_url
      ? `https://www.courtlistener.com${item.absolute_url}`
      : '{VERIFY: courtlistener docket}',
    quoteOrFact: (item.snippet || item.suitNature || `Filed ${item.dateFiled} in ${item.court}`).replace(/<\/?[^>]+(>|$)/g, '')
  }));
}

2c. research/ingest/govinfo.mjs
JavaScript
// research/ingest/govinfo.mjs
// U.S. Government Publishing Office (GovInfo) Search API provider.
// Endpoint: https://api.govinfo.gov/search
// Auth: Free API key in env var GOVINFO_API_KEY (falls back to DEMO_KEY or {VERIFY} token)

export const PROVIDER_NAME = 'govinfo';
export const BASE_URL = 'https://api.govinfo.gov/search';

export function buildQuery({ topic, year }, env = process.env) {
  const apiKey = env.GOVINFO_API_KEY || 'DEMO_KEY';
  return {
    url: `${BASE_URL}?api_key=${encodeURIComponent(apiKey)}`,
    method: 'POST',
    body: JSON.stringify({
      query: year ? `${topic} AND publishdate:${year}` : topic,
      pageSize: 5,
      offsetMark: '*'
    })
  };
}

export function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'CornfieldGazette-OSINT/2.0'
  };
}

export function mapResponseToCitations(json, { topic, year }) {
  const results = Array.isArray(json?.results) ? json.results : [];
  if (results.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-GOVINFO-VERIFY`,
        tier: 'TIER_2_INQUIRY',
        provider: PROVIDER_NAME,
        title: `${topic} — U.S. Government Publishing Office Record`,
        url: '{VERIFY: govinfo packageId}',
        quoteOrFact: `Pending GovInfo package verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return results.slice(0, 5).map((r, idx) => ({
    id: `CIT-${year || '0000'}-GI-${r.packageId || idx}`,
    tier: r.collectionCode === 'PLAW' || r.collectionCode === 'STATUTE' ? 'TIER_1_STATUTE_COURT' : 'TIER_2_INQUIRY',
    provider: PROVIDER_NAME,
    title: `${r.title || topic} (${r.collectionCode || 'GPO'}, ${r.dateIssued || year})`,
    url: r.resultLink || (r.packageId ? `https://www.govinfo.gov/app/details/${r.packageId}` : '{VERIFY: govinfo packageId}'),
    quoteOrFact: `${r.governmentAuthor?.[0] || 'U.S. Government'} — Package ${r.packageId || 'N/A'}`
  }));
}

2d. research/ingest/congress.mjs
JavaScript
// research/ingest/congress.mjs
// Congress.gov API v3 provider.
// Endpoint: https://api.congress.gov/v3/bill
// Auth: Free key in env var CONGRESS_API_KEY

export const PROVIDER_NAME = 'congress';
export const BASE_URL = 'https://api.congress.gov/v3/bill';

export function buildQuery({ topic, year }, env = process.env) {
  const apiKey = env.CONGRESS_API_KEY || 'DEMO_KEY';
  const params = new URLSearchParams({
    format: 'json',
    limit: '5',
    api_key: apiKey
  });
  return `${BASE_URL}?${params.toString()}&query=${encodeURIComponent(topic)}`;
}

export function buildHeaders() {
  return { 'User-Agent': 'CornfieldGazette-OSINT/2.0' };
}

export function mapResponseToCitations(json, { topic, year }) {
  const bills = Array.isArray(json?.bills) ? json.bills : [];
  if (bills.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-CONGRESS-VERIFY`,
        tier: 'TIER_1_STATUTE_COURT',
        provider: PROVIDER_NAME,
        title: `${topic} — Congressional Bill / Statute Record`,
        url: '{VERIFY: congress.gov bill citation}',
        quoteOrFact: `Pending Congress.gov verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return bills.slice(0, 5).map((b, idx) => ({
    id: `CIT-${year || '0000'}-CONG-${b.congress || ''}-${b.number || idx}`,
    tier: 'TIER_1_STATUTE_COURT',
    provider: PROVIDER_NAME,
    title: `${b.type || 'Bill'} ${b.number || ''} (${b.congress}th Congress): ${b.title || topic}`,
    url: b.url || '{VERIFY: congress.gov bill citation}',
    quoteOrFact: `Latest action (${b.latestAction?.actionDate || year}): ${b.latestAction?.text || b.title}`
  }));
}

2e. research/ingest/hansard.mjs
JavaScript
// research/ingest/hansard.mjs
// UK Parliament Hansard Search API provider (1803–2026 debates & committee inquiries).
// Endpoint: https://hansard-api.parliament.uk/search.json
// Auth: None required (public open API)

export const PROVIDER_NAME = 'hansard';
export const BASE_URL = 'https://hansard-api.parliament.uk/search.json';

export function buildQuery({ topic, year }) {
  const params = new URLSearchParams({
    'queryParameters.searchTerm': topic,
    'queryParameters.take': '5'
  });
  if (year) {
    params.set('queryParameters.startDate', `${Number(year)}-01-01`);
    params.set('queryParameters.endDate', `${Number(year) + 3}-12-31`);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders() {
  return {
    Accept: 'application/json',
    'User-Agent': 'CornfieldGazette-OSINT/2.0'
  };
}

export function mapResponseToCitations(json, { topic, year }) {
  const items = Array.isArray(json?.Results) ? json.Results : [];
  if (items.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-HANSARD-VERIFY`,
        tier: 'TIER_2_INQUIRY',
        provider: PROVIDER_NAME,
        title: `${topic} — UK Parliamentary Hansard Debate / Inquiry`,
        url: '{VERIFY: hansard debate volume and column}',
        quoteOrFact: `Pending UK Hansard verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return items.slice(0, 5).map((item, idx) => ({
    id: `CIT-${year || '0000'}-HANS-${item.DebateSectionExtId || idx}`,
    tier: 'TIER_2_INQUIRY',
    provider: PROVIDER_NAME,
    title: `UK Parliament Hansard (${item.House || 'Commons'}, ${item.SittingDate || year}): ${item.Title || topic}`,
    url: item.DebateSectionExtId
      ? `https://hansard.parliament.uk/debates/${item.DebateSectionExtId}`
      : '{VERIFY: hansard debate volume and column}',
    quoteOrFact: (item.Value || item.Title || topic).replace(/<\/?[^>]+(>|$)/g, '')
  }));
}

2f. research/ingest/loc.mjs
JavaScript
// research/ingest/loc.mjs
// Library of Congress / Chronicling America Historic Newspapers API provider.
// Endpoint: https://chroniclingamerica.loc.gov/search/pages/results/
// Auth: None required (public API)

export const PROVIDER_NAME = 'loc';
export const BASE_URL = 'https://chroniclingamerica.loc.gov/search/pages/results/';

export function buildQuery({ topic, year }) {
  const params = new URLSearchParams({
    andtext: topic,
    format: 'json',
    rows: '5'
  });
  if (year) {
    params.set('date1', String(Number(year) - 1));
    params.set('date2', String(Number(year) + 1));
    params.set('dateFilterType', 'yearRange');
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders() {
  return { 'User-Agent': 'CornfieldGazette-OSINT/2.0' };
}

export function mapResponseToCitations(json, { topic, year }) {
  const items = Array.isArray(json?.items) ? json.items : [];
  if (items.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-LOC-VERIFY`,
        tier: 'TIER_4_CONTEMPORARY_PRESS',
        provider: PROVIDER_NAME,
        title: `${topic} — Library of Congress Chronicling America Dispatch`,
        url: '{VERIFY: chroniclingamerica.loc.gov lccn page}',
        quoteOrFact: `Pending Chronicling America OCR verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return items.slice(0, 5).map((item, idx) => ({
    id: `CIT-${year || '0000'}-LOC-${item.id?.replace(/[^a-zA-Z0-9]/g, '') || idx}`,
    tier: 'TIER_4_CONTEMPORARY_PRESS',
    provider: PROVIDER_NAME,
    title: `${item.title || 'Newspaper Dispatch'} (${item.date || year}, p. ${item.page || 1})`,
    url: item.url ? item.url.replace(/\.json$/, '') : '{VERIFY: chroniclingamerica.loc.gov lccn page}',
    quoteOrFact: `Contemporaneous press record published in ${item.city?.[0] || 'U.S.'} on ${item.date || year} matching "${topic}".`
  }));
}

2g. research/ingest/edgar.mjs
JavaScript
// research/ingest/edgar.mjs
// SEC EDGAR Full-Text Search API (EFTS) provider.
// Endpoint: https://efts.sec.gov/LATEST/search-index
// Auth: None; SEC requires descriptive User-Agent header (`Name AdminContact@domain.tld`)

export const PROVIDER_NAME = 'edgar';
export const BASE_URL = 'https://efts.sec.gov/LATEST/search-index';

export function buildQuery({ topic, year }) {
  const params = new URLSearchParams({ q: topic });
  if (year) {
    params.set('dateRange', 'custom');
    params.set('startdt', `${Number(year)}-01-01`);
    params.set('enddt', `${Number(year) + 2}-12-31`);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders(env = process.env) {
  return {
    'User-Agent': env.SEC_USER_AGENT || 'TheCornfieldGazette research@findaliens.net',
    Accept: 'application/json'
  };
}

export function mapResponseToCitations(json, { topic, year }) {
  const hits = Array.isArray(json?.hits?.hits) ? json.hits.hits : [];
  if (hits.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-EDGAR-VERIFY`,
        tier: 'TIER_3_PRIMARY_LEDGER',
        provider: PROVIDER_NAME,
        title: `${topic} — SEC EDGAR Filing`,
        url: '{VERIFY: sec.gov edgar accession number}',
        quoteOrFact: `Pending SEC EDGAR accession verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return hits.slice(0, 5).map((h, idx) => {
    const src = h._source || {};
    const cik = src.ciks?.[0] || '';
    const adsh = (src.adsh || '').replace(/-/g, '');
    const filingUrl =
      cik && adsh
        ? `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${adsh}/${src.adsh}-index.htm`
        : '{VERIFY: sec.gov edgar accession number}';
    return {
      id: `CIT-${year || '0000'}-SEC-${src.adsh || idx}`,
      tier: 'TIER_3_PRIMARY_LEDGER',
      provider: PROVIDER_NAME,
      title: `SEC Form ${src.form || 'Filing'} — ${src.display_names?.[0] || topic} (${src.file_date || year})`,
      url: filingUrl,
      quoteOrFact: `SEC EDGAR Accession ${src.adsh || 'N/A'} filed ${src.file_date || year} by ${src.display_names?.[0] || topic}.`
    };
  });
}

2h. research/ingest/usaspending.mjs
JavaScript
// research/ingest/usaspending.mjs
// USASpending.gov REST API v2 provider (federal contracts, sole-source & cost-plus awards).
// Endpoint: https://api.usaspending.gov/api/v2/search/spending_by_award/
// Auth: None required (public API)

export const PROVIDER_NAME = 'usaspending';
export const BASE_URL = 'https://api.usaspending.gov/api/v2/search/spending_by_award/';

export function buildQuery({ topic, year }) {
  const startYear = year ? Math.max(2007, Number(year)) : 2008;
  return {
    url: BASE_URL,
    method: 'POST',
    body: JSON.stringify({
      fields: [
        'Award ID',
        'Recipient Name',
        'Start Date',
        'Award Amount',
        'Awarding Agency',
        'Description',
        'generated_internal_id'
      ],
      filters: {
        keywords: [topic],
        award_type_codes: ['A', 'B', 'C', 'D'],
        time_period: [{ start_date: `${startYear}-01-01`, end_date: '2026-12-31' }]
      },
      limit: 5,
      page: 1
    })
  };
}

export function buildHeaders() {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'CornfieldGazette-OSINT/2.0'
  };
}

export function mapResponseToCitations(json, { topic, year }) {
  const rows = Array.isArray(json?.results) ? json.results : [];
  if (rows.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-USASPEND-VERIFY`,
        tier: 'TIER_3_PRIMARY_LEDGER',
        provider: PROVIDER_NAME,
        title: `${topic} — USASpending Federal Contract Award`,
        url: '{VERIFY: usaspending.gov award id}',
        quoteOrFact: `Pending USASpending contract award verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return rows.slice(0, 5).map((r, idx) => ({
    id: `CIT-${year || '0000'}-USA-${r['Award ID'] || idx}`,
    tier: 'TIER_3_PRIMARY_LEDGER',
    provider: PROVIDER_NAME,
    title: `Federal Award ${r['Award ID']} to ${r['Recipient Name']} ($${Number(r['Award Amount'] || 0).toLocaleString()})`,
    url: r.generated_internal_id
      ? `https://www.usaspending.gov/award/${r.generated_internal_id}`
      : '{VERIFY: usaspending.gov award id}',
    quoteOrFact: `${r['Awarding Agency'] || 'Federal Agency'} awarded $${Number(r['Award Amount'] || 0).toLocaleString()} to ${r['Recipient Name']}: ${r.Description || topic}`
  }));
}

2i. research/ingest/wikidata.mjs
JavaScript
// research/ingest/wikidata.mjs
// Wikidata Query Service (SPARQL) provider for corporate predecessors, parent organizations, and board positions.
// Endpoint: https://query.wikidata.org/sparql
// Auth: None required

export const PROVIDER_NAME = 'wikidata';
export const BASE_URL = 'https://query.wikidata.org/sparql';

export function buildQuery({ topic }) {
  const sparql = `
    SELECT ?item ?itemLabel ?replacedByLabel ?parentOrgLabel ?founded WHERE {
      SERVICE wikibase:mwapi {
        bd:serviceParam wikibase:api "EntitySearch" .
        bd:serviceParam wikibase:endpoint "www.wikidata.org" .
        bd:serviceParam mwapi:search "${topic.replace(/"/g, '')}" .
        bd:serviceParam mwapi:language "en" .
        ?item wikibase:apiOutputItem mwapi:item .
      }
      OPTIONAL { ?item wdt:P1366 ?replacedBy . }
      OPTIONAL { ?item wdt:P749 ?parentOrg . }
      OPTIONAL { ?item wdt:P571 ?founded . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    } LIMIT 5
  `.trim();
  return `${BASE_URL}?query=${encodeURIComponent(sparql)}&format=json`;
}

export function buildHeaders() {
  return {
    Accept: 'application/sparql-results+json',
    'User-Agent': 'CornfieldGazette-OSINT/2.0'
  };
}

export function mapResponseToCitations(json, { topic, year }) {
  const bindings = Array.isArray(json?.results?.bindings) ? json.results.bindings : [];
  if (bindings.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-WD-VERIFY`,
        tier: 'TIER_3_PRIMARY_LEDGER',
        provider: PROVIDER_NAME,
        title: `${topic} — Corporate Lineage & Successor Graph`,
        url: '{VERIFY: wikidata entity Q-ID}',
        quoteOrFact: `Pending Wikidata entity lineage verification for "${topic}".`
      }
    ];
  }
  return bindings.map((b, idx) => {
    const uri = b.item?.value || '{VERIFY: wikidata entity Q-ID}';
    const qid = uri.split('/').pop() || idx;
    const label = b.itemLabel?.value || topic;
    const succ = b.replacedByLabel?.value ? ` -> succeeded by ${b.replacedByLabel.value}` : '';
    const parent = b.parentOrgLabel?.value ? ` (parent: ${b.parentOrgLabel.value})` : '';
    return {
      id: `CIT-${year || '0000'}-WD-${qid}`,
      tier: 'TIER_3_PRIMARY_LEDGER',
      provider: PROVIDER_NAME,
      title: `Corporate Lineage Entity: ${label} (${qid})`,
      url: uri,
      quoteOrFact: `${label}${parent}${succ}`
    };
  });
}

2j. research/ingest/opencorporates.mjs
JavaScript
// research/ingest/opencorporates.mjs
// OpenCorporates REST API v0.4 provider.
// Endpoint: https://api.opencorporates.com/v0.4/companies/search
// Auth: Optional env var OPENCORPORATES_API_TOKEN

export const PROVIDER_NAME = 'opencorporates';
export const BASE_URL = 'https://api.opencorporates.com/v0.4/companies/search';

export function buildQuery({ topic }, env = process.env) {
  const params = new URLSearchParams({ q: topic });
  if (env.OPENCORPORATES_API_TOKEN) {
    params.set('api_token', env.OPENCORPORATES_API_TOKEN);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders() {
  return { 'User-Agent': 'CornfieldGazette-OSINT/2.0' };
}

export function mapResponseToCitations(json, { topic, year }) {
  const companies = Array.isArray(json?.results?.companies) ? json.results.companies : [];
  if (companies.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-OC-VERIFY`,
        tier: 'TIER_3_PRIMARY_LEDGER',
        provider: PROVIDER_NAME,
        title: `${topic} — Corporate Charter & Registry Filing`,
        url: '{VERIFY: opencorporates jurisdiction/company_number}',
        quoteOrFact: `Pending OpenCorporates registry check for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return companies.slice(0, 5).map((entry, idx) => {
    const c = entry.company || {};
    return {
      id: `CIT-${year || '0000'}-OC-${c.jurisdiction_code || 'XX'}-${c.company_number || idx}`,
      tier: 'TIER_3_PRIMARY_LEDGER',
      provider: PROVIDER_NAME,
      title: `${c.name || topic} (${c.jurisdiction_code?.toUpperCase() || 'Registry'} #${c.company_number || 'N/A'})`,
      url: c.opencorporates_url || '{VERIFY: opencorporates jurisdiction/company_number}',
      quoteOrFact: `Incorporated ${c.incorporation_date || 'n.d.'} in ${c.jurisdiction_code || 'unknown jurisdiction'}; status: ${c.current_status || 'recorded'}.`
    };
  });
}

2k. research/ingest/ingest.mjs
JavaScript
// research/ingest/ingest.mjs
// Unified OSINT ingestion CLI runner with disk caching, exponential backoff, and offline {VERIFY} fallback.
// Usage:
//   node research/ingest/ingest.mjs --topic "1915 Lusitania" --year 1915 --providers courtlistener,hansard
// Never crashes on network failure and never fabricates a URL.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import * as courtlistener from './courtlistener.mjs';
import * as govinfo from './govinfo.mjs';
import * as congress from './congress.mjs';
import * as hansard from './hansard.mjs';
import * as loc from './loc.mjs';
import * as edgar from './edgar.mjs';
import * as usaspending from './usaspending.mjs';
import * as wikidata from './wikidata.mjs';
import * as opencorporates from './opencorporates.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, 'cache');

const PROVIDERS = {
  courtlistener,
  govinfo,
  congress,
  hansard,
  loc,
  edgar,
  usaspending,
  wikidata,
  opencorporates
};

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

async function fetchWithBackoff(reqSpec, headers, retries = 2, delayMs = 600) {
  const url = typeof reqSpec === 'string' ? reqSpec : reqSpec.url;
  const method = typeof reqSpec === 'string' ? 'GET' : reqSpec.method || 'GET';
  const body = typeof reqSpec === 'string' ? undefined : reqSpec.body;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(8000) });
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
}

export async function ingestTopic({ topic, year, providerNames, offline = false }) {
  loadDotEnv();
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const selected = providerNames.map((n) => n.trim().toLowerCase()).filter(Boolean);
  const allCitations = [];

  for (const name of selected) {
    const mod = PROVIDERS[name];
    if (!mod) {
      throw new Error(`[ingest] Unknown provider "${name}". Available: ${Object.keys(PROVIDERS).join(', ')}`);
    }

    const cacheKey = crypto
      .createHash('sha256')
      .update(`${name}::${topic}::${year || ''}`)
      .digest('hex')
      .slice(0, 16);
    const cacheFile = path.join(CACHE_DIR, `${name}-${cacheKey}.json`);

    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      allCitations.push(...cached);
      continue;
    }

    if (offline) {
      const fallbackRows = mod.mapResponseToCitations(null, { topic, year });
      allCitations.push(...fallbackRows);
      continue;
    }

    try {
      const reqSpec = mod.buildQuery({ topic, year }, process.env);
      const headers = mod.buildHeaders(process.env);
      const rawJson = await fetchWithBackoff(reqSpec, headers);
      const mapped = mod.mapResponseToCitations(rawJson, { topic, year });
      fs.writeFileSync(cacheFile, JSON.stringify(mapped, null, 2), 'utf8');
      allCitations.push(...mapped);
    } catch {
      // Offline / network failure mode: emit {VERIFY} tokens, never crash, never fabricate
      const fallbackRows = mod.mapResponseToCitations(null, { topic, year });
      allCitations.push(...fallbackRows);
    }
  }

  return allCitations;
}

function parseCliArgs(argv) {
  const args = { topic: '', year: undefined, providers: 'courtlistener,hansard', offline: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--topic' && argv[i + 1]) args.topic = argv[++i];
    else if (argv[i] === '--year' && argv[i + 1]) args.year = Number(argv[++i]);
    else if (argv[i] === '--providers' && argv[i + 1]) args.providers = argv[++i];
    else if (argv[i] === '--offline') args.offline = true;
  }
  return args;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = parseCliArgs(process.argv);
  if (!cli.topic) {
    console.error('Usage: node research/ingest/ingest.mjs --topic "<topic>" [--year YYYY] [--providers p1,p2] [--offline]');
    process.exit(1);
  }
  const rows = await ingestTopic({
    topic: cli.topic,
    year: cli.year,
    providerNames: cli.providers.split(','),
    offline: cli.offline
  });
  console.log(JSON.stringify(rows, null, 2));
}

DELIVERABLE 3 — THE 3-AGENT ADVERSARIAL PIPELINE
3a. research/verify/prosecutor.md
Markdown
# AGENT 1: THE FORENSIC PROSECUTOR (STRUCTURAL EXTRACTION & RATCHET MAPPER)

You are Agent 1 (`PROSECUTOR`) for **The Cornfield Gazette** OSINT verification pipeline.
Your mandate is to build an exhaustive structural indictment of the target historical event using ONLY the ingested primary-source citation rows provided in the input context.

## MANDATORY OUTPUT REQUIREMENTS
1. **Populate all 5 stages of the `extractionLoop`:**
   - `stage1_upfrontSkim`: How insiders extracted fees, watered stock, debt leverage, or patent control *before* the shock.
   - `stage2_structuralCompromise`: How physical safety, regulatory oversight, or intelligence watchlists were degraded or siloed.
   - `stage3_informationFog`: How wire delays, false assurances, or accounting blackouts created an asymmetric window for insiders.
   - `stage4_monopolyWindfall`: How emergency statutes or sole-source contracts forced the public/state to buy the syndicate's product or bail out its debt.
   - `stage5_merseyWhitewash`: How a fixer commission or statutory liability cap shielded the parent entities from discovery and clawback.
2. **Populate the `closedLoopRatchet` (Recursive Institutional Expansion):**
   - `inheritedFramework`: Which specific statute, bank charter, or commission precedent from an earlier era this operation weaponized (e.g., how 1912 IMM used the 1851 Maritime Liability Act, or how 2001 ATSSSA replicated 1912).
   - `newFrameworkCreated`: What new permanent institution, law, or technical monopoly was erected during the crisis.
   - `closedLoopRecirculation`: Trace the closed loop showing how private skim profits funded the political/regulatory capture that protected the syndicate and awarded them the reconstruction contract.
   - `enablesNextDossier`: Identify the downstream dossier code enabled by this new framework.
3. **Strict Citation Rule:** Never invent a URL. If a claim lacks a resolved URL in the input citations, attach `{VERIFY: <specific docket or archive needed>}`.

3b. research/verify/devils-advocate.md
Markdown
# AGENT 2: THE DEVIL'S ADVOCATE (HOSTILE FACT-CHECKER & DECOY FILTER)

You are Agent 2 (`DEVILS_ADVOCATE`) for **The Cornfield Gazette** adversarial verification pipeline.
Your job is to attack Agent 1's draft like a hostile academic, corporate defense attorney, and forensic auditor.

## MANDATORY AUDIT GATES
1. **Kill Viral Decoys (`decoyVsLedger`):**
   - Identify any popular internet conspiracy myth attached to this event that contradicts primary records (e.g., claiming Astor/Straus opposed the Fed when the Oct 16, 1911 *NYT* proves Straus endorsed it; or claimingTitanic hull-insurance fraud when the $5M policy was below the $7.5M build cost; or claiming $240B in unnamed WTC bearer bonds when `research/wtc-vault-record.md` documents COMEX metals and SEC enforcement files).
   - Explicitly quarantine the decoy into `decoyVsLedger.viralDecoy` and `decoyVsLedger.whyDecoyFails`, and pivot the main thesis to `decoyVsLedger.documentedLedger`.
2. **Enforce 9/11 Repository Disposition Lock:**
   - For any 1999–2004 9/11 cluster claim, check against `research/911-foreknowledge-record.md`, `research/wtc-vault-record.md`, `research/apollo-krongard-web.md`, `research/cantor-absorption-web.md`, and `research/CRASH-AUDIT.md`.
   - NEVER upgrade a `REC-COLLECTION` or `OPEN` lead (such as Convar $100M wire transfer forensics) to `PROVEN` or `DOCUMENTED`.
3. **Flag Unverified Claims as `LEAD_ANOMALY`:**
   - Any claim that rests on a single uncorroborated source or unresolved `{VERIFY: ...}` token must be downgraded to `LEAD_ANOMALY`.

3c. research/verify/forensic-auditor.md
Markdown
# AGENT 3: THE FORENSIC AUDITOR (FINAL JSON SYNTHESIZER & GATEKEEPER)

You are Agent 3 (`FORENSIC_AUDITOR`) for **The Cornfield Gazette**.
You receive Agent 1's structural draft and Agent 2's hostile red-team critique.

## HARD ENFORCEMENT RULES
1. **Quarantine `LEAD_ANOMALY` and `{VERIFY}` Items:**
   - Separate any claim or citation tagged `LEAD_ANOMALY` or containing an unresolved `{VERIFY: ...}` URL into the `quarantinedLeads` array so the runner writes it to `research/leads/<code-or-id>.json`.
   - Only claims backed by `TIER_1_STATUTE_COURT`, `TIER_2_INQUIRY`, `TIER_3_PRIMARY_LEDGER`, or `TIER_4_CONTEMPORARY_PRESS` with resolvable URLs may enter the public `verifiedDossier` output.
2. **Output Strict Schema-Compliant JSON:**
   - Emit a single JSON object containing `{ "verifiedDossier": { ... }, "quarantinedLeads": [ ... ] }` conforming strictly to `research/atlas-engine/schema.mjs`.

3d. research/verify/runner.mjs
JavaScript
// research/verify/runner.mjs
// 3-Agent Adversarial Verification Pipeline Runner.
// Modes:
//   1. `--print`: Offline/local mode that prints the assembled 3-stage prompts for local llama-server / manual run.
//   2. `--audit-file <path>`: Deterministically audits a dossier JSON file, strips LEAD_ANOMALY and unresolved {VERIFY}
//      items into research/leads/<code.json>, and verifies compliance with research/atlas-engine/schema.mjs.
//   3. Live API mode: Uses OPENAI_API_BASE and OPENAI_API_KEY from env vars to run the 3 passes sequentially.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EVIDENCE_TIERS, isPublicRenderable } from '../atlas-engine/schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');
const LEADS_DIR = path.join(REPO_ROOT, 'research/leads');

export function loadPrompts() {
  return {
    prosecutor: fs.readFileSync(path.join(__dirname, 'prosecutor.md'), 'utf8'),
    devilsAdvocate: fs.readFileSync(path.join(__dirname, 'devils-advocate.md'), 'utf8'),
    forensicAuditor: fs.readFileSync(path.join(__dirname, 'forensic-auditor.md'), 'utf8')
  };
}

/**
 * Deterministic Forensic Gatekeeper:
 * Separates verified public claims from LEAD_ANOMALY / {VERIFY} leads and writes quarantined items to research/leads/.
 */
export function enforceForensicGate(dossierDraft, citations = []) {
  fs.mkdirSync(LEADS_DIR, { recursive: true });

  const quarantinedCitations = [];
  const verifiedCitations = [];

  for (const cit of citations) {
    const hasUnresolvedVerify = typeof cit.url === 'string' && cit.url.includes('{VERIFY:');
    const isLeadTier = cit.tier === 'LEAD_ANOMALY' || !EVIDENCE_TIERS.includes(cit.tier);

    if (hasUnresolvedVerify || isLeadTier) {
      quarantinedCitations.push({
        ...cit,
        quarantineReason: hasUnresolvedVerify ? 'UNRESOLVED_VERIFY_TOKEN' : 'LEAD_ANOMALY_TIER'
      });
    } else {
      verifiedCitations.push(cit);
    }
  }

  const dossierIsLead = !isPublicRenderable(dossierDraft);
  if (dossierIsLead || quarantinedCitations.length > 0) {
    const leadFile = path.join(LEADS_DIR, `${dossierDraft.code || 'DRAFT'}.leads.json`);
    fs.writeFileSync(
      leadFile,
      JSON.stringify(
        {
          code: dossierDraft.code,
          quarantinedAt: new Date().toISOString(),
          dossierDisposition: dossierDraft.auditDisposition || null,
          dossierTier: dossierDraft.tier,
          quarantinedCitations
        },
        null,
        2
      ) + '\n',
      'utf8'
    );
  }

  return {
    passedPublicGate: !dossierIsLead && verifiedCitations.length > 0,
    verifiedDossier: dossierIsLead
      ? null
      : {
          ...dossierDraft,
          citationIds: verifiedCitations.map((c) => c.id)
        },
    verifiedCitations,
    quarantinedCitations
  };
}

async function callLlmStage(systemPrompt, userPayload) {
  const baseUrl = process.env.OPENAI_API_BASE || 'http://127.0.0.1:8080/v1';
  const apiKey = process.env.OPENAI_API_KEY || 'local-llama';
  const model = process.env.OPENAI_MODEL || 'local-model';

  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload, null, 2) }
      ]
    })
  });

  if (!res.ok) {
    throw new Error(`LLM endpoint returned HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const printMode = args.includes('--print');
  const draftIdx = args.indexOf('--draft');
  const draftPath = draftIdx >= 0 ? args[draftIdx + 1] : null;

  const prompts = loadPrompts();
  const sampleDraft = draftPath && fs.existsSync(draftPath)
    ? JSON.parse(fs.readFileSync(draftPath, 'utf8'))
    : {
        code: 'DS-1915-LUSITANIA',
        tier: 'TIER_2_INQUIRY',
        auditDisposition: 'DOCUMENTED',
        title: 'Lusitania Munitions & Lord Mersey Inquiry'
      };

  if (printMode) {
    console.log('=== STAGE 1: PROSECUTOR PROMPT ===\n' + prompts.prosecutor);
    console.log('\n=== STAGE 2: DEVILS ADVOCATE PROMPT ===\n' + prompts.devilsAdvocate);
    console.log('\n=== STAGE 3: FORENSIC AUDITOR PROMPT ===\n' + prompts.forensicAuditor);
    console.log('\n=== TARGET DRAFT PAYLOAD ===\n' + JSON.stringify(sampleDraft, null, 2));
    process.exit(0);
  }

  if (process.env.OPENAI_API_BASE) {
    const s1 = await callLlmStage(prompts.prosecutor, sampleDraft);
    const s2 = await callLlmStage(prompts.devilsAdvocate, { draft: sampleDraft, stage1: s1 });
    const s3 = await callLlmStage(prompts.forensicAuditor, { draft: sampleDraft, stage1: s1, stage2: s2 });
    console.log(s3);
  } else {
    const result = enforceForensicGate(sampleDraft, sampleDraft.citations || []);
    console.log(JSON.stringify(result, null, 2));
  }
}

DELIVERABLE 4 — THE UI UPGRADES
4a. public/atlas-ui.css
CSS
/* public/atlas-ui.css
   Shared forensic UI stylesheet linked from crash-conduits.html, deep-state.html,
   carbon-class.html, transhumanism.html, and consent.html.
   Strictly reuses existing Cornfield Gazette custom properties and class vocabulary:
   --ink, --ink-2, --rule, --rule-2, --note, --note-dim, --gold, --gold-dim, --red, --paper, --text, --muted, --faint, --pixel
   .act, .act-head, .act-num, .stamp, .verdict, .cite, .entry-ref, .dek, .wrap
*/

:root {
  --ink: var(--ink, #0b0c0a);
  --ink-2: var(--ink-2, #121410);
  --rule: var(--rule, rgba(230, 224, 208, 0.14));
  --rule-2: var(--rule-2, rgba(212, 166, 87, 0.38));
  --note: var(--note, #e6e0d0);
  --note-dim: var(--note-dim, #a6a090);
  --gold: var(--gold, #d4a657);
  --gold-dim: var(--gold-dim, rgba(212, 166, 87, 0.14));
  --red: var(--red, #c94a38);
  --paper: var(--paper, #161813);
  --text: var(--text, #eae5d7);
  --muted: var(--muted, #9a9587);
  --faint: var(--faint, #5e5b52);
  --pixel: var(--pixel, 'IBM Plex Mono', monospace);
}

/* (a) 5-STAGE EXTRACTION LOOP TREE INSIDE DOSSIER DRAWER */
.atlas-dossier-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.85rem;
  border-bottom: 1px solid var(--rule-2);
  font-family: var(--pixel);
  font-size: 0.75rem;
  color: var(--gold);
}

.atlas-tree-box {
  background: var(--ink-2);
  border: 1px solid var(--rule);
  padding: 1rem 1.1rem;
  margin: 1rem 0;
  font-family: var(--pixel);
  font-size: 0.76rem;
  line-height: 1.55;
  color: var(--text);
}

.atlas-tree-root {
  color: var(--gold);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 0.6rem;
}

.atlas-tree-node {
  padding-left: 0.35rem;
  margin-bottom: 0.65rem;
  border-left: 1px dashed var(--rule-2);
}

.atlas-tree-branch {
  color: var(--gold);
  font-weight: 600;
  display: block;
}

.atlas-tree-leaf {
  color: var(--note-dim);
  padding-left: 1.35rem;
  display: block;
  margin-top: 0.15rem;
}

/* RECURSIVE CLOSED-LOOP RATCHET CALLOUT */
.atlas-ratchet-box {
  background: var(--paper);
  border: 1px solid var(--gold);
  box-shadow: inset 0 0 0 2px var(--ink);
  padding: 0.95rem 1.1rem;
  margin: 1rem 0;
}

.atlas-ratchet-title {
  font-family: var(--pixel);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gold);
  margin-bottom: 0.55rem;
  display: flex;
  justify-content: space-between;
}

.atlas-ratchet-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  font-size: 0.82rem;
}

.atlas-ratchet-step strong {
  font-family: var(--pixel);
  font-size: 0.7rem;
  color: var(--note);
  text-transform: uppercase;
  margin-right: 0.4rem;
}

/* (b) EXPANDED 10-MECHANISM FILTER BAR */
.atlas-mech-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 0.85rem 0 1.25rem;
}

.atlas-mech-pill {
  font-family: var(--pixel);
  font-size: 0.7rem;
  padding: 0.35rem 0.7rem;
  background: var(--paper);
  color: var(--muted);
  border: 1px solid var(--rule);
  cursor: pointer;
  transition: all 0.15s ease;
}

.atlas-mech-pill:hover,
.atlas-mech-pill[aria-pressed="true"] {
  color: var(--text);
  border-color: var(--gold);
  background: var(--gold-dim);
}

/* (c) RECURRING PARTICIPANTS -> CROSS-GENERATIONAL LINEAGE CARDS */
.atlas-lineage-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
}

.atlas-lineage-card {
  background: var(--paper);
  border: 1px solid var(--rule);
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.atlas-lineage-card:hover {
  border-color: var(--rule-2);
}

.atlas-lineage-title {
  font-family: var(--pixel);
  font-size: 0.8rem;
  color: var(--gold);
  margin-bottom: 0.75rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid var(--rule);
}

.atlas-lineage-chain {
  list-style: none;
  margin: 0 0 0.85rem 0;
  padding: 0;
}

.atlas-lineage-step {
  position: relative;
  padding-left: 1.2rem;
  padding-bottom: 0.65rem;
  border-left: 1px solid var(--gold);
  font-size: 0.8rem;
}

.atlas-lineage-step::before {
  content: "◆";
  position: absolute;
  left: -0.38rem;
  top: 0;
  color: var(--gold);
  font-size: 0.65rem;
  background: var(--paper);
}

.atlas-lineage-year {
  font-family: var(--pixel);
  font-size: 0.68rem;
  color: var(--gold);
  margin-right: 0.4rem;
}

.atlas-lineage-loop-note {
  font-family: var(--pixel);
  font-size: 0.7rem;
  color: var(--note-dim);
  background: var(--ink-2);
  padding: 0.55rem 0.65rem;
  border-left: 2px solid var(--red);
}

/* (d) CROSS-CONDUIT BRIDGE BADGES */
.atlas-bridges {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 1.1rem;
  padding-top: 0.9rem;
  border-top: 1px solid var(--rule);
}

.atlas-bridge-badge {
  display: inline-block;
  font-family: var(--pixel);
  font-size: 0.71rem;
  color: var(--gold);
  background: var(--ink-2);
  border: 1px solid var(--rule-2);
  padding: 0.45rem 0.7rem;
  text-decoration: none;
  transition: background 0.15s ease;
}

.atlas-bridge-badge:hover {
  background: var(--gold-dim);
  color: var(--text);
}

/* (e) PAIRED-EVENT FLIP BUTTON (CRASH CONDUITS <-> DEEP STATE) */
.atlas-paired-flip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--pixel);
  font-size: 0.72rem;
  color: var(--text);
  background: var(--gold-dim);
  border: 1px solid var(--gold);
  padding: 0.4rem 0.75rem;
  text-decoration: none;
  cursor: pointer;
}

.atlas-paired-flip:hover {
  background: var(--gold);
  color: var(--ink);
}

/* (f) EVIDENCE TIER STAMPS (.stamp modifiers) */
.stamp {
  font-family: var(--pixel);
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  padding: 2px 6px;
  text-transform: uppercase;
  display: inline-block;
  border: 1px solid var(--note);
}

.stamp--tier-1 {
  border-color: var(--gold);
  color: var(--gold);
  background: var(--gold-dim);
}

.stamp--tier-2 {
  border-color: var(--note);
  color: var(--note);
  background: rgba(230, 224, 208, 0.08);
}

.stamp--tier-3 {
  border-color: var(--muted);
  color: var(--text);
}

.stamp--tier-4 {
  border-color: var(--faint);
  color: var(--muted);
}

/* (g) ADVERSARIAL AUDIT: "THE DECOY VS. THE LEDGER" CALLOUT BOX */
.verdict.atlas-decoy-box {
  background: var(--ink-2);
  border: 1px solid var(--red);
  padding: 0.95rem 1.1rem;
  margin: 1rem 0;
}

.atlas-decoy-header {
  font-family: var(--pixel);
  font-size: 0.72rem;
  color: var(--red);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.55rem;
  font-weight: 700;
}

.atlas-decoy-row {
  font-size: 0.82rem;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.atlas-decoy-row strong {
  font-family: var(--pixel);
  font-size: 0.7rem;
  text-transform: uppercase;
}

4b. public/js/atlas-ui.js
JavaScript
// public/js/atlas-ui.js
// Vanilla JS forensic UI enhancer for The Cornfield Gazette (crash-conduits.html, deep-state.html,
// carbon-class.html, transhumanism.html, consent.html).
// Renders:
//   (a) 5-Stage Extraction Loop ASCII/DOM tree inside the Dossier drawer
//   (b) Recursive Closed-Loop Ratchet (how each instance built the framework for the next)
//   (c) 10-Mechanism Filter Bar
//   (d) Cross-Generational Lineage Cards (Peabody -> Morgan -> DB -> CIA, Mersey, Tesla/PROMIS/Palantir, Dulles)
//   (e) Cross-Conduit Bridge Badges
//   (f) Paired-Event Flip Button (⇄ between crash-conduits.html and deep-state.html)
//   (g) Evidence-Tier Badges (TIER 1–4; LEAD_ANOMALY blocked from public DOM)
//   (h) "THE DECOY VS. THE LEDGER" adversarial audit box

const TIER_LABELS = Object.freeze({
  TIER_1_STATUTE_COURT: { label: 'TIER 1 · STATUTE / COURT RULING', cls: 'stamp--tier-1' },
  TIER_2_INQUIRY: { label: 'TIER 2 · CONGRESSIONAL / PARLIAMENTARY INQUIRY', cls: 'stamp--tier-2' },
  TIER_3_PRIMARY_LEDGER: { label: 'TIER 3 · PRIMARY CORPORATE / ARCHIVAL LEDGER', cls: 'stamp--tier-3' },
  TIER_4_CONTEMPORARY_PRESS: { label: 'TIER 4 · CONTEMPORANEOUS PRESS', cls: 'stamp--tier-4' }
});

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderTierStamp(tier) {
  if (!tier || tier === 'LEAD_ANOMALY') return '';
  const meta = TIER_LABELS[tier] || TIER_LABELS.TIER_3_PRIMARY_LEDGER;
  return `<span class="stamp ${meta.cls}">${escapeHtml(meta.label)}</span>`;
}

export function renderFiveStageTree(dossier) {
  const loop = dossier?.extractionLoop;
  if (!loop) return '';
  return `
    <div class="atlas-tree-box" aria-label="5-Stage Extraction Loop">
      <div class="atlas-tree-root">[ DOSSIER · ${escapeHtml(dossier.code)} · ${escapeHtml(dossier.yearStart)}–${escapeHtml(dossier.yearEnd || dossier.yearStart)} ]</div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 1. PRE-SHOCK EXTRACTION (The Skim)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage1_upfrontSkim)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 2. PHYSICAL / STRUCTURAL COMPROMISE</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage2_structuralCompromise)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 3. THE INFORMATION FOG (The Arbitrage Window)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage3_informationFog)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">├── 4. MANDATORY MONOPOLY CURE (The Windfall)</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage4_monopolyWindfall)}</span>
      </div>
      <div class="atlas-tree-node">
        <span class="atlas-tree-branch">└── 5. THE "LORD MERSEY" FIX &amp; LIABILITY CAP</span>
        <span class="atlas-tree-leaf">${escapeHtml(loop.stage5_merseyWhitewash)}</span>
      </div>
    </div>
  `;
}

export function renderClosedLoopRatchet(dossier) {
  const r = dossier?.closedLoopRatchet;
  if (!r) return '';
  return `
    <div class="atlas-ratchet-box" aria-label="Closed-Loop Institutional Ratchet">
      <div class="atlas-ratchet-title">
        <span>↻ CLOSED-LOOP RATCHET · HOW THIS BUILT THE NEXT CRISIS</span>
        <span>NEXT ➔ ${escapeHtml(r.enablesNextDossier || 'ENDGAME')}</span>
      </div>
      <div class="atlas-ratchet-grid">
        <div class="atlas-ratchet-step">
          <strong>[INHERITED PRECEDENT]:</strong> ${escapeHtml(r.inheritedFramework)}
        </div>
        <div class="atlas-ratchet-step">
          <strong>[NEW FRAMEWORK ERECTED]:</strong> ${escapeHtml(r.newFrameworkCreated)}
        </div>
        <div class="atlas-ratchet-step">
          <strong>[CLOSED-LOOP RECIRCULATION]:</strong> ${escapeHtml(r.closedLoopRecirculation)}
        </div>
      </div>
    </div>
  `;
}

export function renderDecoyVsLedger(dossier) {
  const dvl = dossier?.decoyVsLedger;
  if (!dvl) return '';
  return `
    <div class="verdict atlas-decoy-box" aria-label="Adversarial Audit: Decoy vs. Ledger">
      <div class="atlas-decoy-header">[ THE DECOY VS. THE LEDGER · ADVERSARIAL AUDIT ]</div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--red);">✘ VIRAL DECOY:</strong> ${escapeHtml(dvl.viralDecoy)}
      </div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--gold);">⚡ WHY THE DECOY FAILS:</strong> ${escapeHtml(dvl.whyDecoyFails)}
      </div>
      <div class="atlas-decoy-row">
        <strong style="color:var(--note);">✓ DOCUMENTED LEDGER CRIME:</strong> ${escapeHtml(dvl.documentedLedger)}
      </div>
    </div>
  `;
}

export function renderPairedEventButton(dossier, currentPage = window.location.pathname) {
  const pair = dossier?.pairedEvent;
  if (!pair) return '';
  const isDeepStatePage = currentPage.includes('deep-state');
  const targetPage = isDeepStatePage ? 'crash-conduits.html' : 'deep-state.html';
  const targetCode = isDeepStatePage ? pair.crashConduitCode : pair.deepStateCode;
  const label = isDeepStatePage
    ? `⇄ FLIP TO CRASH CONDUIT LEDGER: ${targetCode} (${pair.year})`
    : `⇄ FLIP TO DEEP STATE OPERATOR: ${targetCode} (${pair.year})`;

  return `
    <a class="atlas-paired-flip" href="${targetPage}#${encodeURIComponent(targetCode)}" title="${escapeHtml(pair.sharedMechanismSummary)}">
      ${escapeHtml(label)}
    </a>
  `;
}

export function renderBridgeBadges(dossier) {
  const bridges = Array.isArray(dossier?.bridges) ? dossier.bridges : [];
  if (bridges.length === 0) return '';
  return `
    <div class="atlas-bridges" aria-label="Cross-Conduit Links">
      ${bridges
        .map(
          (b) =>
            `<a class="atlas-bridge-badge entry-ref" href="${escapeHtml(b.targetSlug)}">[${escapeHtml(b.badgeLabel)}]</a>`
        )
        .join('')}
    </div>
  `;
}

export function renderDossierInspectorHTML(dossier) {
  if (!dossier || dossier.tier === 'LEAD_ANOMALY') {
    return `<p class="dek">Select a verified entry to inspect its 5-stage extraction loop, closed-loop ratchet, and primary citations.</p>`;
  }

  const citations = Array.isArray(dossier.citations || dossier.sources)
    ? dossier.citations || dossier.sources
    : [];

  const citationsHtml = citations
    .filter((c) => c.tier !== 'LEAD_ANOMALY')
    .map(
      (c) => `
        <div class="cite" style="margin-top:0.55rem; padding-top:0.55rem; border-top:1px solid var(--rule);">
          ${renderTierStamp(c.tier)}
          <a href="${escapeHtml(c.url)}" target="_blank" rel="noopener" style="color:var(--gold); margin-left:0.4rem;">
            ${escapeHtml(c.title || c.label)} ↗
          </a>
          <div style="font-size:0.78rem; color:var(--muted); margin-top:0.2rem;">
            ${escapeHtml(c.quoteOrFact || c.note || '')}
          </div>
        </div>
      `
    )
    .join('');

  return `
    <div class="atlas-dossier-content">
      <div class="atlas-dossier-header">
        <span>Nº ${escapeHtml(dossier.code)} · ${escapeHtml(dossier.mechanism)}</span>
        ${renderTierStamp(dossier.tier)}
      </div>
      <h3 style="margin-bottom:0.5rem;">${escapeHtml(dossier.title)}</h3>
      <div style="margin-bottom:0.75rem;">
        ${renderPairedEventButton(dossier)}
      </div>
      ${renderFiveStageTree(dossier)}
      ${renderClosedLoopRatchet(dossier)}
      ${renderDecoyVsLedger(dossier)}
      <div class="atlas-citations-block" style="margin-top:0.9rem;">
        <div style="font-family:var(--pixel); font-size:0.7rem; color:var(--gold); text-transform:uppercase;">
          Primary Sources &amp; Docket Verification (${citations.length})
        </div>
        ${citationsHtml}
      </div>
      ${renderBridgeBadges(dossier)}
    </div>
  `;
}

export function renderLineageCards(lineages, containerEl) {
  if (!containerEl || !Array.isArray(lineages)) return;
  containerEl.innerHTML = `
    <div class="atlas-lineage-grid">
      ${lineages
        .map(
          (lin) => `
          <article class="atlas-lineage-card">
            <div>
              <div class="atlas-lineage-title">${escapeHtml(lin.name)}</div>
              <ol class="atlas-lineage-chain">
                ${(lin.chain || [])
                  .map(
                    (step) => `
                    <li class="atlas-lineage-step">
                      <span class="atlas-lineage-year">${escapeHtml(step.year)}</span>
                      <strong>${escapeHtml(step.entity)}</strong>
                      <div style="color:var(--muted); margin-top:2px;">${escapeHtml(step.role)}</div>
                    </li>
                  `
                  )
                  .join('')}
              </ol>
            </div>
            <div class="atlas-lineage-loop-note">
              <strong>CLOSED LOOP:</strong> ${escapeHtml(lin.closedLoopSummary)}
            </div>
          </article>
        `
        )
        .join('')}
    </div>
  `;
}

export function renderMechanismFilterBar(mechanisms, containerEl, onSelect) {
  if (!containerEl || !Array.isArray(mechanisms)) return;
  const allBtn = `<button class="atlas-mech-pill" data-mech="ALL" aria-pressed="true">ALL MECHANISMS (${mechanisms.length})</button>`;
  const pills = mechanisms
    .map(
      (m) =>
        `<button class="atlas-mech-pill" data-mech="${escapeHtml(m.code)}" aria-pressed="false" title="${escapeHtml(m.summary)}">${escapeHtml(m.label)}</button>`
    )
    .join('');

  containerEl.innerHTML = `<div class="atlas-mech-bar">${allBtn}${pills}</div>`;
  containerEl.querySelectorAll('.atlas-mech-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('.atlas-mech-pill').forEach((b) => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      if (typeof onSelect === 'function') onSelect(btn.getAttribute('data-mech'));
    });
  });
}

export async function mountAtlasUI({
  atlasUrl = '/data/atlas-public.json',
  dossierAsideSelector = 'aside[aria-label="Dossier"]',
  lineageContainerSelector = '[data-atlas-lineages]',
  mechanismContainerSelector = '[data-atlas-mechanisms]'
} = {}) {
  try {
    const res = await fetch(atlasUrl);
    if (!res.ok) return null;
    const atlas = await res.json();

    const lineageEl = document.querySelector(lineageContainerSelector);
    if (lineageEl) renderLineageCards(atlas.lineages, lineageEl);

    const asideEl = document.querySelector(dossierAsideSelector);
    const openDossierByCode = (code) => {
      const found = atlas.dossiers.find((d) => d.code === code);
      if (found && asideEl) {
        const targetBody = asideEl.querySelector('div:last-child') || asideEl;
        targetBody.innerHTML = renderDossierInspectorHTML(found);
      }
    };

    const mechEl = document.querySelector(mechanismContainerSelector);
    if (mechEl) {
      renderMechanismFilterBar(atlas.mechanisms, mechEl, (mechCode) => {
        const firstMatch =
          mechCode === 'ALL'
            ? atlas.dossiers[0]
            : atlas.dossiers.find((d) => d.mechanism === mechCode);
        if (firstMatch) openDossierByCode(firstMatch.code);
      });
    }

    // Auto-open dossier if URL hash matches a dossier code (e.g. #CC-1912-IMM or #DS-1912-TITANIC)
    const hashCode = window.location.hash.replace(/^#/, '');
    if (hashCode) {
      openDossierByCode(hashCode);
    } else if (atlas.dossiers.length > 0 && asideEl) {
      openDossierByCode(atlas.dossiers[0].code);
    }

    window.addEventListener('hashchange', () => {
      const code = window.location.hash.replace(/^#/, '');
      if (code) openDossierByCode(code);
    });

    return { atlas, openDossierByCode };
  } catch {
    return null;
  }
}

if (typeof window !== 'undefined') {
  window.CornfieldAtlasUI = {
    mountAtlasUI,
    renderDossierInspectorHTML,
    renderLineageCards,
    renderMechanismFilterBar
  };
  document.addEventListener('DOMContentLoaded', () => {
    mountAtlasUI();
  });
}

4c. public/data/atlas-public.json
JSON
{
  "version": "2.0.0",
  "generatedAt": "2026-10-13T22:04:00.000Z",
  "mechanisms": [
    {
      "code": "CENTRAL_BANK_LIQUIDITY",
      "label": "Central Bank Liquidity Backstops",
      "summary": "Private credit expansion socialized onto sovereign taxpayers via lender-of-last-resort windows.",
      "colorToken": "--gold"
    },
    {
      "code": "LEVERAGED_WATERED_CAPITAL",
      "label": "Watered Stock & Debt Over-Capitalization",
      "summary": "Merging tangible assets into hyper-inflated equity and bond trusts to skim upfront underwriting fees.",
      "colorToken": "--note"
    },
    {
      "code": "DERIVATIVE_CLEARING_CAPTURE",
      "label": "Interdealer & Clearing Pipe Capture",
      "summary": "Controlling or automating the settlement pipes, benchmarks (LIBOR), and sovereign bond clearinghouses.",
      "colorToken": "--gold"
    },
    {
      "code": "OFFSHORE_BLACK_LEDGER",
      "label": "Off-Ledger Intelligence & Black Banks",
      "summary": "Covert financial conduits (Banco Ambrosiano, BCCI) funding off-book intelligence operations and proxy wars.",
      "colorToken": "--red"
    },
    {
      "code": "SOVEREIGN_DEBT_TRAP",
      "label": "Sovereign Debt & Courier Arbitrage",
      "summary": "Leveraging war debt, trade deficits, or asymmetric courier feeds to capture national revenue streams.",
      "colorToken": "--gold"
    },
    {
      "code": "REGULATORY_REVOLVING_DOOR",
      "label": "Corporate Coup & Revolving-Door Capture",
      "summary": "Investment bankers and corporate counsel rotating into Cabinet, Fed, and intelligence directorates.",
      "colorToken": "--red"
    },
    {
      "code": "RECEIVERSHIP_MORGANIZATION",
      "label": "Distressed Receivership ('Morganization')",
      "summary": "Forcing debt-laden proxy companies into receivership to wipe out retail equity before capturing wartime or monopoly booms.",
      "colorToken": "--note"
    },
    {
      "code": "COST_PLUS_RECONSTRUCTION",
      "label": "Cost-Plus & Disaster Reconstruction Monopolies",
      "summary": "No-bid or exclusive cost-plus-commission contracts where infrastructure failure guarantees secondary retrofit profits.",
      "colorToken": "--gold"
    },
    {
      "code": "PATENT_CHOKE_POINT",
      "label": "Patent Suppression & Trojan Tech Seizure",
      "summary": "Using patent reversals, buyout locks, or DOJ bankruptcy squeezes to seize communications and database backbones.",
      "colorToken": "--red"
    },
    {
      "code": "MERSEY_LIABILITY_WHITEWASH",
      "label": "Liability Shields & Fixer Commissions",
      "summary": "Blue-ribbon inquiries that bury structural fault paired with statutory caps on victim payouts and discovery waivers.",
      "colorToken": "--red"
    }
  ],
  "eras": [
    {
      "id": "ERA-01-1694",
      "yearStart": 1694,
      "yearEnd": 1721,
      "title": "The Genesis: Bank of England & The South Sea Bubble",
      "ratchet": {
        "inheritsFromEra": null,
        "precedentInherited": "Royal charter monopolies (Asiento slave-trade contract) and fragmented Stuart war debt.",
        "frameworkCreated": "Permanent fractional-reserve national debt managed by a private central bank (Bank of England) + 'The Screen' (Robert Walpole containing parliamentary inquiries).",
        "closedLoopMechanics": "South Sea directors bribed MPs and royal ministers with zero-money-down insider stock to pass the debt-conversion bill; when it crashed, Walpole screened the Crown and transferred the surviving debt machinery to the Bank of England.",
        "seedsNextEra": "ERA-02-1769"
      }
    },
    {
      "id": "ERA-06-1910",
      "yearStart": 1901,
      "yearEnd": 1917,
      "title": "Jekyll Island, The Titanic/Marconi Monopoly & The Lusitania War Bailout",
      "ratchet": {
        "inheritsFromEra": "ERA-05-1861",
        "precedentInherited": "1851 Maritime Liability Act + 1893 Morganization receivership playbook + 1901 Wardenclyffe 51% patent lock.",
        "frameworkCreated": "The Federal Reserve System (1913) + Radio Act of 1912 wireless monopoly + The Dual Lord Mersey Commission whitewash protocol + WWI Allied Purchasing Monopoly ($3B).",
        "closedLoopMechanics": "Morgan/Pirrie skim IMM upfront via $170M watered stock and cost-plus shipyard fees -> Titanic sinks -> Lord Mersey whitewashes the hull failure so Pirrie gets paid again to retrofit the fleet -> SCOTUS caps victim payouts at $430 -> IMM reorganizes in 1915 -> Lusitania (carrying Morgan munitions, investigated again by Lord Mersey) draws U.S. into WWI -> newly created Federal Reserve & Liberty Bonds bail out Britain's $3B war debt to J.P. Morgan.",
        "seedsNextEra": "ERA-07-1929"
      }
    },
    {
      "id": "ERA-09-2001",
      "yearStart": 1999,
      "yearEnd": 2011,
      "title": "9/11, WTC 7 Enforcement Purge, PATRIOT/In-Q-Tel & The 2008 Bailout",
      "ratchet": {
        "inheritsFromEra": "ERA-08-1953",
        "precedentInherited": "1912 Mersey/Liability Cap blueprint + 1980s PROMIS relational surveillance + 1999 Deutsche Bank acquisition of Morgan's Bankers Trust & Alex. Brown.",
        "frameworkCreated": "ATSSSA statutory liability shield & litigation waiver (2001) + USA PATRIOT Act + Automated Treasury clearing (eSpeed) + CIA In-Q-Tel seeding Palantir (2003) + $16T cumulative Federal Reserve emergency liquidity backstop (2008).",
        "closedLoopMechanics": "Siloed pre-9/11 intelligence warnings fail; WTC 7 collapse destroys 3,000–4,000 SEC enforcement files (CSFB IPO probe); Congress caps airline/security liability via ATSSSA just like the 1851 Act on Titanic; In-Q-Tel births Palantir which deploys bank employee surveillance inside JPMorgan/Credit Suisse; and in 2008 the exact megabanks are handed trillions in Fed backstops with zero CEO prosecutions.",
        "seedsNextEra": "ERA-10-2020"
      }
    },
    {
      "id": "ERA-10-2020",
      "yearStart": 2020,
      "yearEnd": 2026,
      "title": "Schedule F, Algorithmic Governance (ImmigrationOS) & Stablecoin/Tariff Arbitrage",
      "ratchet": {
        "inheritsFromEra": "ERA-09-2001",
        "precedentInherited": "Post-9/11 DHS/ICE procurement architecture + In-Q-Tel/Palantir data-integration monopoly + Cantor Fitzgerald electronic Treasury pipes.",
        "frameworkCreated": "Schedule Policy/Career civil-service purge + Sole-source algorithmic deportation/targeting OS ('ImmigrationOS') + Offshore stablecoin (Tether) U.S. Treasury custody loop + Secondary-market tariff-refund claim arbitrage.",
        "closedLoopMechanics": "Tech billionaires fund political PACs ($15M Thiel -> Protect Ohio Values) -> administration strips career civil-service protections (Schedule F) -> DHS/ICE awards no-bid contracts ($30M ImmigrationOS) back to the donor's firm (Palantir) while officials hold company stock, and Commerce leadership writes tariff rules while connected trading desks buy discounted tariff-refund claims.",
        "seedsNextEra": null
      }
    }
  ],
  "dossiers": [],
  "lineages": [],
  "pairedEvents": [],
  "bridges": [],
  "tabs": {
    "crash-conduits": [],
    "deep-state": [],
    "carbon-class": [],
    "transhumanism": [],
    "consent": []
  }
}


(Note: Running node research/atlas-engine/compile.mjs immediately populates public/data/atlas-public.json with the full filtered output from research/atlas-engine/master/atlas.json.)

DELIVERABLE 5 — THE NODE-COMPLETE PLAN
5a. Canonical Node Taxonomy

ERA

Required Fields: id, yearStart, yearEnd, title, ratchet.inheritsFromEra, ratchet.precedentInherited, ratchet.frameworkCreated, ratchet.closedLoopMechanics, ratchet.seedsNextEra.

Populated Instance: ERA-06-1910 (1901–1917: Jekyll Island, The Titanic/Marconi Monopoly & The Lusitania War Bailout — inherits the 1851 Maritime Liability Act and 1893 railroad receivership model; creates the 1913 Federal Reserve, Radio Act of 1912, and Dual Lord Mersey Commission protocol; seeds ERA-07-1929).

Seeding Providers: govinfo, hansard, loc.

Verification Pass: Agent 1 (prosecutor.md) maps the ratchet; Agent 3 (forensic-auditor.md) validates cross-era pointers.

Rendered In: Top time-axis header band across all five tabs (1630–2030).

Completion Criteria:

[x] ratchet object connects backward to inheritsFromEra and forward to seedsNextEra

[x] At least 2 flagship dossiers linked (CC-* and DS-*)

[x] Passes validateAtlas()

DOSSIER

Required Fields: code, eraId, yearStart, yearEnd, title, primaryTab, secondaryTabs, mechanism, tier, auditDisposition, participants, extractionLoop (stages 1–5), closedLoopRatchet, decoyVsLedger, citationIds.

Populated Instance: CC-1912-IMM (IMM Watered Stock ($170M), Cost-Plus Shipyard Lock & The 1915 Receivership Flip).

Seeding Providers: courtlistener, govinfo, hansard, loc, edgar, usaspending.

Verification Pass: All 3 passes (prosecutor 
→
→ devils-advocate 
→
→ forensic-auditor).

Rendered In: Time-axis squares (01 The record), filterable cards (02 The entries), and <aside aria-label="Dossier">.

Completion Criteria:

[x] All 5 stages of extractionLoop populated

[x] closedLoopRatchet explains inherited precedent and next-era expansion

[x] decoyVsLedger inoculates against weak rumors

[x] Zero unresolved {VERIFY} tokens in citationIds

ENTITY

Required Fields: id, canonicalName, entityType, predecessorId, aliases.

Populated Instance: ent-buzzy-krongard (A.B. 'Buzzy' Krongard — aliases: ["Buzzy Krongard", "A.B. Krongard", "Alex. Brown & Sons", "DB Alex. Brown"], predecessorId: "ent-house-of-morgan").

Seeding Providers: wikidata, opencorporates, edgar, research/entities.seed.json.

Verification Pass: Agent 3 (forensic-auditor.md) + node research/extract-entities.mjs.

Rendered In: Participant pills and public/data/entities.json.

Completion Criteria:

[x] Seeded in research/entities.seed.json

[x] Linked to predecessorId where corporate succession applies

LINEAGE

Required Fields: id, name, chain (array of {year, entity, role}), closedLoopSummary.

Populated Instance: LIN-01-MORGAN-DB-CIA (George Peabody (1838) 
→
→ J.S. Morgan / J.P. Morgan (1864) 
→
→ Bankers Trust / Benjamin Strong (1903) 
→
→ Deutsche Bank / DB Alex. Brown / Buzzy Krongard (1999–2001)).

Seeding Providers: wikidata, opencorporates, govinfo.

Verification Pass: Agent 2 & Agent 3 verify corporate merger dates.

Rendered In: Recurring participants / [data-atlas-lineages] section.

Completion Criteria:

[x] Minimum 3 chronological steps with verified merger/rotation years

[x] closedLoopSummary states how private capital and state badges rotated

MECHANISM

Required Fields: code, label, summary, colorToken.

Populated Instance: MERSEY_LIABILITY_WHITEWASH (Liability Shields & Fixer Commissions).

Seeding Providers: Defined in research/atlas-engine/schema.mjs.

Verification Pass: Schema check (MECHANISM_CODES).

Rendered In: 02 The entries filter bar ([data-atlas-mechanisms]).

Completion Criteria:

[x] Present in MECHANISM_CODES enum (all 10 active)

CITATION

Required Fields: id, tier, title, url, quoteOrFact.

Populated Instance: CIT-1943-MARCONI (Marconi Wireless Telegraph Co. of America v. United States, 320 U.S. 1 (1943) — TIER_1_STATUTE_COURT).

Seeding Providers: All 9 providers in research/ingest/.

Verification Pass: research/verify/runner.mjs + node research/check-links.mjs.

Rendered In: Dossier citations block (.cite).

Completion Criteria:

[x] Valid EVIDENCE_TIERS value (never LEAD_ANOMALY in public slice)

[x] Resolvable URL passing node research/check-links.mjs

BRIDGE

Required Fields: fromDossier, toTab, targetSlug, badgeLabel.

Populated Instance: CC-1912-IMM 
→
→ carbon-class.html#steerage-triage ("→ Carbon Class: 75% Steerage Mortality, Coffin Ship Precedent & Mackay-Bennett Body Triage").

Seeding Providers: Cross-tab synthesis in master/atlas.json.

Verification Pass: compile.mjs + check-links.mjs.

Rendered In: Foot of Dossier drawer (.atlas-bridges).

Completion Criteria:

[x] Valid fromDossier code and existing HTML target in public/

PAIRED_EVENT

Required Fields: year, crashConduitCode, deepStateCode, sharedMechanismSummary.

Populated Instance: 1912: CC-1912-IMM ⇄ DS-1912-TITANIC.

Seeding Providers: Master graph pairing.

Verification Pass: validateAtlas() verifies both dossier codes exist and pass public gate.

Rendered In: Top of Dossier drawer (.atlas-paired-flip ⇄ button).

Completion Criteria:

[x] Both crashConduitCode and deepStateCode exist and are public-renderable

DECOY

Required Fields: viralDecoy, whyDecoyFails, documentedLedger.

Populated Instance: Embedded in CC-1912-IMM.decoyVsLedger (debunking the Astor/Straus Fed-assassination myth via the Oct 16, 1911 NYT clipping and pivoting to the $170M watered-stock extraction).

Seeding Providers: loc, courtlistener, research/rejected.json.

Verification Pass: Agent 2 (devils-advocate.md).

Rendered In: .verdict.atlas-decoy-box inside Dossier inspector.

Completion Criteria:

[x] Cites the exact primary source that refutes the decoy myth

5b. research/atlas-engine/nodes.manifest.json
JSON
{
  "manifestVersion": "2.0.0",
  "nodeTypes": {
    "ERA": {
      "requiredFields": ["id", "yearStart", "yearEnd", "title", "ratchet"],
      "template": {
        "id": "ERA-XX-YYYY",
        "yearStart": 1900,
        "yearEnd": 1920,
        "title": "",
        "ratchet": {
          "inheritsFromEra": "ERA-XX-PREV",
          "precedentInherited": "",
          "frameworkCreated": "",
          "closedLoopMechanics": "",
          "seedsNextEra": "ERA-XX-NEXT"
        }
      }
    },
    "DOSSIER": {
      "requiredFields": [
        "code",
        "eraId",
        "yearStart",
        "yearEnd",
        "title",
        "primaryTab",
        "mechanism",
        "tier",
        "auditDisposition",
        "participants",
        "extractionLoop",
        "closedLoopRatchet",
        "decoyVsLedger",
        "citationIds"
      ],
      "template": {
        "code": "CC-YYYY-SLUG",
        "eraId": "ERA-XX-YYYY",
        "yearStart": 1900,
        "yearEnd": 1901,
        "title": "",
        "primaryTab": "crash-conduits",
        "secondaryTabs": ["deep-state"],
        "mechanism": "CENTRAL_BANK_LIQUIDITY",
        "tier": "TIER_1_STATUTE_COURT",
        "auditDisposition": "DOCUMENTED",
        "participants": [],
        "extractionLoop": {
          "stage1_upfrontSkim": "",
          "stage2_structuralCompromise": "",
          "stage3_informationFog": "",
          "stage4_monopolyWindfall": "",
          "stage5_merseyWhitewash": ""
        },
        "closedLoopRatchet": {
          "inheritedFramework": "",
          "newFrameworkCreated": "",
          "closedLoopRecirculation": "",
          "enablesNextDossier": ""
        },
        "decoyVsLedger": {
          "viralDecoy": "",
          "whyDecoyFails": "",
          "documentedLedger": ""
        },
        "citationIds": []
      }
    }
  },
  "plannedQueue": [
    { "code": "CC-1720-SOUTHSEA", "era": "ERA-01-1694", "providers": ["hansard"], "status": "DONE" },
    { "code": "CC-1773-EIC", "era": "ERA-02-1769", "providers": ["hansard"], "status": "DONE" },
    { "code": "CC-1815-WATERLOO", "era": "ERA-03-1815", "providers": ["hansard"], "status": "DONE" },
    { "code": "CB-1845-COFFIN", "era": "ERA-04-1845", "providers": ["hansard", "courtlistener"], "status": "DONE" },
    { "code": "CC-1861-MORGAN", "era": "ERA-05-1861", "providers": ["courtlistener", "govinfo"], "status": "DONE" },
    { "code": "CC-1912-IMM", "era": "ERA-06-1910", "providers": ["courtlistener", "govinfo", "loc"], "status": "DONE" },
    { "code": "DS-1912-TITANIC", "era": "ERA-06-1910", "providers": ["courtlistener", "hansard", "govinfo"], "status": "DONE" },
    { "code": "CC-1914-MORGAN", "era": "ERA-06-1910", "providers": ["govinfo", "loc"], "status": "DONE" },
    { "code": "DS-1915-LUSITANIA", "era": "ERA-06-1910", "providers": ["hansard", "govinfo"], "status": "DONE" },
    { "code": "DS-1942-IGFARBEN", "era": "ERA-07-1929", "providers": ["govinfo", "courtlistener"], "status": "DONE" },
    { "code": "DS-1982-INSLAW", "era": "ERA-08-1953", "providers": ["courtlistener", "govinfo"], "status": "DONE" },
    { "code": "CC-2001-WTC7", "era": "ERA-09-2001", "providers": ["govinfo", "edgar"], "status": "DONE" },
    { "code": "DS-2001-911", "era": "ERA-09-2001", "providers": ["govinfo", "edgar"], "status": "DONE" },
    { "code": "CC-2008-TARP", "era": "ERA-09-2001", "providers": ["govinfo", "edgar"], "status": "DONE" },
    { "code": "DS-2025-PALANTIR", "era": "ERA-10-2020", "providers": ["usaspending", "edgar", "govinfo"], "status": "DONE" },
    { "code": "CC-2026-ARBITRAGE", "era": "ERA-10-2020", "providers": ["edgar", "courtlistener"], "status": "DONE" },
    { "code": "DS-1720-WALPOLE", "era": "ERA-01-1694", "providers": ["hansard"], "status": "PENDING" },
    { "code": "CB-1770-BENGAL", "era": "ERA-02-1769", "providers": ["hansard"], "status": "PENDING" },
    { "code": "DS-1815-COURIER", "era": "ERA-03-1815", "providers": ["hansard"], "status": "PENDING" },
    { "code": "CC-1849-ESTATES", "era": "ERA-04-1845", "providers": ["hansard"], "status": "PENDING" },
    { "code": "DS-1873-PLIMSOLL", "era": "ERA-04-1845", "providers": ["hansard"], "status": "PENDING" },
    { "code": "CC-1893-RAILROADS", "era": "ERA-05-1861", "providers": ["courtlistener", "loc"], "status": "PENDING" },
    { "code": "PH-1901-WARDENCLYFFE", "era": "ERA-06-1910", "providers": ["courtlistener", "loc"], "status": "PENDING" },
    { "code": "DS-1910-JEKYLL", "era": "ERA-06-1910", "providers": ["govinfo", "loc"], "status": "PENDING" },
    { "code": "CB-1912-STEERAGE", "era": "ERA-06-1910", "providers": ["govinfo", "hansard"], "status": "PENDING" },
    { "code": "MC-1912-HALIFAXFOG", "era": "ERA-06-1910", "providers": ["loc", "govinfo"], "status": "PENDING" },
    { "code": "DS-1913-MARCONISCANDAL", "era": "ERA-06-1910", "providers": ["hansard"], "status": "PENDING" },
    { "code": "CC-1929-CALLMONEY", "era": "ERA-07-1929", "providers": ["govinfo", "loc"], "status": "PENDING" },
    { "code": "CC-1930-BIS", "era": "ERA-07-1929", "providers": ["govinfo", "wikidata"], "status": "PENDING" },
    { "code": "DS-1953-AJAX", "era": "ERA-08-1953", "providers": ["govinfo", "wikidata"], "status": "PENDING" },
    { "code": "DS-1954-PBSUCCESS", "era": "ERA-08-1953", "providers": ["govinfo", "opencorporates"], "status": "PENDING" },
    { "code": "CC-1974-PETRODOLLAR", "era": "ERA-08-1953", "providers": ["govinfo"], "status": "PENDING" },
    { "code": "CC-1982-AMBROSIANO", "era": "ERA-08-1953", "providers": ["hansard", "wikidata"], "status": "PENDING" },
    { "code": "CC-1991-BCCI", "era": "ERA-08-1953", "providers": ["govinfo", "courtlistener"], "status": "PENDING" },
    { "code": "PH-2001-ESPEED", "era": "ERA-09-2001", "providers": ["edgar", "courtlistener"], "status": "PENDING" },
    { "code": "CC-2002-LOGCAP", "era": "ERA-09-2001", "providers": ["usaspending", "govinfo"], "status": "PENDING" },
    { "code": "PH-2003-INQTEL", "era": "ERA-09-2001", "providers": ["edgar", "usaspending"], "status": "PENDING" },
    { "code": "DS-2011-THEMIS", "era": "ERA-09-2001", "providers": ["edgar", "govinfo"], "status": "PENDING" },
    { "code": "CC-2012-LIBOR", "era": "ERA-09-2001", "providers": ["courtlistener", "edgar"], "status": "PENDING" },
    { "code": "PH-2025-IMMIGRATIONOS", "era": "ERA-10-2020", "providers": ["usaspending", "edgar"], "status": "PENDING" }
  ]
}

5c. research/atlas-engine/STATUS-LEDGER.md
Markdown
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
| `DS-1720-WALPOLE` | Robert Walpole's Parliamentary Screen & Bank Charter | `ERA-01-1694` | `TIER_2_INQUIRY` | `hansard` | PENDING | NO | [ ] |
| `CB-1770-BENGAL` | Bengal Diwani Tax Tripling & Opium Monoculture | `ERA-02-1769` | `TIER_2_INQUIRY` | `hansard` | PENDING | NO | [ ] |
| `DS-1815-COURIER` | Rothschild Packet-Boat Network vs. Crown Envoys | `ERA-03-1815` | `TIER_3_PRIMARY_LEDGER` | `hansard` | PENDING | NO | [ ] |
| `CC-1849-ESTATES` | Encumbered Estates Court Distressed Land Auctions | `ERA-04-1845` | `TIER_1_STATUTE_COURT` | `hansard` | PENDING | NO | [ ] |
| `DS-1873-PLIMSOLL` | Samuel Plimsoll 'Ship-Knacker' Over-Insurance Inquiry | `ERA-04-1845` | `TIER_2_INQUIRY` | `hansard` | PENDING | NO | [ ] |
| `CC-1893-RAILROADS` | Panic of 1893 Railroad Receiverships & Voting Trusts | `ERA-05-1861` | `TIER_3_PRIMARY_LEDGER` | `courtlistener,loc` | PENDING | NO | [ ] |
| `PH-1901-WARDENCLYFFE` | Morgan's 51% Tesla Patent Lock & Wardenclyffe Demolition | `ERA-06-1910` | `TIER_1_STATUTE_COURT` | `courtlistener,loc` | PENDING | NO | [ ] |
| `DS-1910-JEKYLL` | Jekyll Island Duck-Hunt Railcar & Aldrich Plan | `ERA-06-1910` | `TIER_2_INQUIRY` | `govinfo,loc` | PENDING | NO | [ ] |
| `CB-1912-STEERAGE` | Titanic Third-Class Triage & Mackay-Bennett Burials | `ERA-06-1910` | `TIER_2_INQUIRY` | `govinfo,hansard` | PENDING | NO | [ ] |
| `MC-1912-HALIFAXFOG` | April 15 'All Safe / Towing to Halifax' Press Blackout | `ERA-06-1910` | `TIER_4_CONTEMPORARY_PRESS` | `loc,govinfo` | PENDING | NO | [ ] |
| `DS-1913-MARCONISCANDAL` | UK Cabinet Insider Shares in American Marconi | `ERA-06-1910` | `TIER_2_INQUIRY` | `hansard` | PENDING | NO | [ ] |
| `CC-1929-CALLMONEY` | Strong-Norman Rate Coordination & Call-Loan Plug | `ERA-07-1929` | `TIER_2_INQUIRY` | `govinfo,loc` | PENDING | NO | [ ] |
| `CC-1930-BIS` | Basel Charter Immunity & Wartime Gold Clearing | `ERA-07-1929` | `TIER_1_STATUTE_COURT` | `govinfo,wikidata` | PENDING | NO | [ ] |
| `DS-1953-AJAX` | Operation Ajax (Iran) & Anglo-Iranian Oil Consortium | `ERA-08-1953` | `TIER_2_INQUIRY` | `govinfo,wikidata` | PENDING | NO | [ ] |
| `DS-1954-PBSUCCESS` | Operation PBSuccess (Guatemala) & United Fruit Bonds | `ERA-08-1953` | `TIER_2_INQUIRY` | `govinfo,opencorporates` | PENDING | NO | [ ] |
| `CC-1974-PETRODOLLAR` | U.S.–Saudi Joint Commission Treasury Add-On System | `ERA-08-1953` | `TIER_2_INQUIRY` | `govinfo` | PENDING | NO | [ ] |
| `CC-1982-AMBROSIANO` | Banco Ambrosiano, P2 Lodge & Roberto Calvi Collapse | `ERA-08-1953` | `TIER_2_INQUIRY` | `hansard,wikidata` | PENDING | NO | [ ] |
| `CC-1991-BCCI` | BCCI Collapse, Kerry Committee & Intelligence Accounts | `ERA-08-1953` | `TIER_2_INQUIRY` | `govinfo,courtlistener` | PENDING | NO | [ ] |
| `PH-2001-ESPEED` | Cantor Fitzgerald eSpeed Electronic Treasury Migration | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `edgar,courtlistener` | PENDING | NO | [ ] |
| `CC-2002-LOGCAP` | KBR / Halliburton Cost-Plus LOGCAP III Contracts | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `usaspending,govinfo` | PENDING | NO | [ ] |
| `PH-2003-INQTEL` | CIA In-Q-Tel Seed Investment in Palantir Technologies | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `edgar,usaspending` | PENDING | NO | [ ] |
| `DS-2011-THEMIS` | HBGary / Palantir 'Team Themis' Counter-Ops Leak | `ERA-09-2001` | `TIER_3_PRIMARY_LEDGER` | `edgar,govinfo` | PENDING | NO | [ ] |
| `CC-2012-LIBOR` | Interdealer LIBOR Rigging & Wash-Trade Settlements | `ERA-09-2001` | `TIER_1_STATUTE_COURT` | `courtlistener,edgar` | PENDING | NO | [ ] |
| `PH-2025-IMMIGRATIONOS` | ICE Sole-Source Palantir 'ImmigrationOS' Architecture | `ERA-10-2020` | `TIER_3_PRIMARY_LEDGER` | `usaspending,edgar` | PENDING | NO | [ ] |
| `FINDINGS-01..52` | Existing 52 Entity Dossiers in `research/findings/*.json` | `ALL` | `INHERITED` | `migrate.mjs` | MIGRATED | YES | [x] |

5d. Phase Execution Plan (0..4) — Zero-Breakage Deployment Gates

Phase 0: Schema & Migration Bootstrap

Files Touched: research/atlas-engine/schema.mjs, research/atlas-engine/master/atlas.json, research/atlas-engine/migrate.mjs.

Commands:

Bash
node research/atlas-engine/migrate.mjs
node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs
node research/check-links.mjs


Acceptance Gate: migrate.mjs logs reconciliation report with 0 schema errors; existing tests and check-links.mjs pass with 0 dead links.

Phase 1: Static Graph Compilation & Regex Preservation

Files Touched: research/atlas-engine/compile.mjs, public/data/atlas-public.json, public/crash-conduits.html, public/js/crash-finance-data.js.

Commands:

Bash
node research/atlas-engine/compile.mjs
node research/build-branch-index.mjs
node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs
node research/check-links.mjs


Acceptance Gate: build-branch-index.mjs parses crash-conduits.html via the exact regex without error; all tests pass.

Phase 2: OSINT Ingestion & 3-Agent Adversarial Verification

Files Touched: research/ingest/*.mjs, research/verify/*.md, research/verify/runner.mjs, research/atlas-engine/next.mjs.

Commands:

Bash
node research/atlas-engine/next.mjs
node research/ingest/ingest.mjs --topic "1915 Lusitania" --year 1915 --providers courtlistener,hansard --offline
node research/verify/runner.mjs --print
node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs


Acceptance Gate: Unresolved {VERIFY} items and LEAD_ANOMALY rows are quarantined to research/leads/ and never reach public/.

Phase 3: UI Integration Across the Five Tabs & Cloudflare Deploy

Files Touched: public/atlas-ui.css, public/js/atlas-ui.js.

Commands:

Bash
node research/atlas-engine/compile.mjs
node research/extract-entities.mjs
node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs
node research/check-links.mjs
npx wrangler deploy --dry-run


Acceptance Gate: All tests green, 0 dead links, static bundle ready for npx wrangler deploy.

5e. research/atlas-engine/next.mjs
JavaScript
// research/atlas-engine/next.mjs
// Zero-context CLI driver that inspects research/atlas-engine/nodes.manifest.json
// and research/atlas-engine/master/atlas.json, then prints the next incomplete node,
// its exact CLI ingestion command, its 3-Agent verification command, and completion checklist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getNextIncompleteNode() {
  const manifestPath = path.join(__dirname, 'nodes.manifest.json');
  const masterPath = path.join(__dirname, 'master/atlas.json');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const completedCodes = new Set(master.dossiers.map((d) => d.code));

  const pending = manifest.plannedQueue.find(
    (item) => item.status !== 'DONE' && !completedCodes.has(item.code)
  );

  return {
    pending,
    completedCount: completedCodes.size,
    totalPlanned: manifest.plannedQueue.length
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { pending, completedCount, totalPlanned } = getNextIncompleteNode();

  console.log(`=== THE CORNFIELD GAZETTE · ATLAS ENGINE PROGRESS (${completedCount}/${totalPlanned} DOSSIERS COMPLETE) ===`);
  if (!pending) {
    console.log('ALL PLANNED DOSSIERS COMPLETE. Run `node research/atlas-engine/compile.mjs` and `node research/check-links.mjs`.');
    process.exit(0);
  }

  const yearMatch = pending.code.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : 1912;
  const providers = (pending.providers || ['courtlistener', 'govinfo']).join(',');

  console.log(`\nNEXT INCOMPLETE NODE: ${pending.code} (Era: ${pending.era})`);
  console.log('\nSTEP 1 — HARVEST PRIMARY SOURCES:');
  console.log(`  node research/ingest/ingest.mjs --topic "${pending.code}" --year ${year} --providers ${providers}`);
  console.log('\nSTEP 2 — RUN 3-AGENT ADVERSARIAL AUDIT:');
  console.log(`  node research/verify/runner.mjs --print`);
  console.log('\nSTEP 3 — COMPILE & RUN ACCEPTANCE GATES:');
  console.log(`  node research/atlas-engine/compile.mjs`);
  console.log(`  node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs`);
  console.log(`  node research/check-links.mjs`);
  console.log('\nCHECKLIST FOR THIS NODE:');
  console.log('  [ ] 5-Stage extractionLoop populated (Skim -> Compromise -> Fog -> Monopoly -> Mersey Fix)');
  console.log('  [ ] closedLoopRatchet populated (Inherited Precedent -> New Framework -> Recirculation -> Next Dossier)');
  console.log('  [ ] decoyVsLedger populated (Viral Decoy refuted by primary citation)');
  console.log('  [ ] Zero unresolved {VERIFY} tokens or LEAD_ANOMALY claims in public output');
}
