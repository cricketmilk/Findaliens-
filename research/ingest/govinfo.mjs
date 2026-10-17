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
    // granuleId (e.g. USREPORTS-279-692) is the per-document id; packageId is the
    // per-volume id and collides across every case in a volume — never cite it as the id.
    id: `CIT-${year || '0000'}-GI-${r.granuleId || r.packageId || idx}`,
    tier: ['PLAW', 'STATUTE', 'USREPORTS'].includes(r.collectionCode) ? 'TIER_1_STATUTE_COURT' : 'TIER_2_INQUIRY',
    provider: PROVIDER_NAME,
    title: `${r.title || topic} (${r.collectionCode || 'GPO'}, ${r.dateIssued || year})`,
    url: r.resultLink || (r.packageId ? `https://www.govinfo.gov/app/details/${r.packageId}` : '{VERIFY: govinfo packageId}'),
    quoteOrFact: `${r.governmentAuthor?.[0] || 'U.S. Government'} — "${r.title}" issued ${r.dateIssued || year}`
  }));
}