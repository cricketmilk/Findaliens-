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
    // SPARQL entity URIs come back http:// (canonical form); the citation schema only
    // accepts https URLs — rewrite the scheme, never the entity.
    const uri = (b.item?.value || '{VERIFY: wikidata entity Q-ID}').replace(/^http:\/\//, 'https://');
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