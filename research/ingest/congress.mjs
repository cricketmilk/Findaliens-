// research/ingest/congress.mjs
// Congress.gov API v3 provider.
// Endpoint: https://api.congress.gov/v3/bill
// Auth: Free key in env var CONGRESS_API_KEY

export const PROVIDER_NAME = 'congress';
export const BASE_URL = 'https://api.congress.gov/v3/bill';

export function buildQuery({ topic, year }, env = process.env) {
  // DEMO_KEY is not a working search key: api.congress.gov answers it with the API's
  // CANNED DOCUMENTATION SAMPLE (110th-Congress bills unrelated to the query). Fetching
  // those would fabricate topical relevance, so without a real key we throw and let the
  // runner fall back to the {VERIFY} token row instead.
  if (!env.CONGRESS_API_KEY) {
    throw new Error('[congress] no CONGRESS_API_KEY — DEMO_KEY returns canned sample bills, not real search results');
  }
  const apiKey = env.CONGRESS_API_KEY;
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