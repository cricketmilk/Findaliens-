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
