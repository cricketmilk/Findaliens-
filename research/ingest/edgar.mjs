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
  return hits.slice(0, 20).map((h, idx) => {
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