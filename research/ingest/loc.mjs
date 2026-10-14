// research/ingest/loc.mjs
// Library of Congress historic newspapers provider.
// Endpoint: https://loc.gov/search/ — the current home of the Chronicling America
// newspaper corpus. (The legacy chroniclingamerica.loc.gov/search/pages/results/
// endpoint returns 404 — it was retired; loc.gov/search/?q=…&fo=json is its replacement,
// verified live 2026-10-14: real per-issue results with id/title/date/description.)
// Auth: None required (public API)

export const PROVIDER_NAME = 'loc';
export const BASE_URL = 'https://loc.gov/search/';

export function buildQuery({ topic, year }) {
  const params = new URLSearchParams({ q: topic, fo: 'json' });
  if (year) {
    params.set('dates', `${Number(year) - 1}/${Number(year) + 1}`);
  }
  return `${BASE_URL}?${params.toString()}`;
}

export function buildHeaders() {
  return { 'User-Agent': 'CornfieldGazette-OSINT/2.0' };
}

export function mapResponseToCitations(json, { topic, year }) {
  const results = Array.isArray(json?.results) ? json.results : [];
  // TIER_4_CONTEMPORARY_PRESS is the newspaper tier: keep only newspaper-format items
  // so the tier claim is true of every row emitted.
  const news = results.filter((item) => (item.original_format || []).some((f) => /newspaper/i.test(String(f))));
  if (news.length === 0) {
    return [
      {
        id: `CIT-${year || '0000'}-LOC-VERIFY`,
        tier: 'TIER_4_CONTEMPORARY_PRESS',
        provider: PROVIDER_NAME,
        title: `${topic} — Library of Congress Historic Press Dispatch`,
        url: '{VERIFY: loc.gov item page}',
        quoteOrFact: `Pending Library of Congress historic press verification for "${topic}" (${year || 'n.d.'}).`
      }
    ];
  }
  return news.slice(0, 5).map((item, idx) => {
    // loc.gov item ids are http:// canonical; the citation schema demands https://
    const httpsId = String(item.id || '').replace(/^http:\/\//, 'https://');
    // keep the item id tail (sn85049554/1901-08-07/ed-1), not the whole http://www.loc.gov/item/ prefix
    const slug = String((item.id || '').split('/item/')[1] || `${topic}-${idx}`).replace(/[^a-zA-Z0-9]/g, '');
    const title = item.title || item.item?.created_published?.[0] || 'Historic press dispatch';
    const place = (item.description || [])[0] || (item.location_state || [])[0] || '';
    return {
      id: `CIT-${year || '0000'}-LOC-${slug.slice(0, 48)}`,
      tier: 'TIER_4_CONTEMPORARY_PRESS',
      provider: PROVIDER_NAME,
      title: `${title} (${item.date || year})`,
      url: httpsId || '{VERIFY: loc.gov item page}',
      quoteOrFact: `Contemporaneous press record published ${item.date || year}${place ? ` in ${place}` : ''} matching "${topic}".`
    };
  });
}