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