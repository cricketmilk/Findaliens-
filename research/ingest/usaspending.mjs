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