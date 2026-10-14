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