// research/ingest/hansard.mjs
// UK Parliament Hansard Search API provider (1803–2026 debates & committee inquiries).
// Endpoint: https://hansard-api.parliament.uk/search.json
// Auth: None required (public open API)
// NOTE: the live API returns named collections (Contributions, Members, WrittenAnswers,
// not a single `Results` array); Contributions carry AttributedTo, ItemId, SittingDate,
// House, DebateSection and ContributionText(Full). hansard.parliament.uk sits behind a
// Cloudflare challenge (403 to scripts) — a real browser clears it.
// DEBATE URL FORM VERIFIED LIVE 2026-10-14 (via The Wilds, a real browser): the site's own
// search-result links use
//   /<House>/<YYYY-MM-DD>/debates/<DebateSectionExtId>/<slug>?highlight=<query>#contribution-<ContributionExtId>
// and an end-to-end-constructed URL of this form was observed rendering the real
// contribution page (Lords 1858-05-11, Encumbered Estates third reading). Rows missing
// the section/date fields still emit {VERIFY} tokens rather than a guessed URL.

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
  // Live shape first (Contributions[]), legacy `Results` shape kept as fallback.
  const items = Array.isArray(json?.Contributions)
    ? json.Contributions
    : Array.isArray(json?.Results)
      ? json.Results
      : [];
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
  return items.slice(0, 5).map((item, idx) => {
    const sitting = String(item.SittingDate || year || '').slice(0, 10) || 'n.d.';
    const speaker = item.AttributedTo || item.MemberName || 'A Member';
    const sectionTitle = item.DebateSection || item.Section || topic;
    const text = String(item.ContributionTextFull || item.ContributionText || '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    // VERIFIED URL form (see header): slug = debate section title with spaces stripped,
    // fragment pins the exact contribution. {VERIFY} only if the API shape loses the fields.
    const house = item.House || 'Commons';
    const secExt = item.DebateSectionExtId || '';
    const contribExt = item.ContributionExtId || item.ItemId || idx;
    const slug = String(sectionTitle).replace(/\s+/g, '');
    const url = (secExt && /^\d{4}-\d{2}-\d{2}$/.test(sitting))
      ? `https://hansard.parliament.uk/${house}/${sitting}/debates/${secExt}/${encodeURIComponent(slug)}?highlight=${encodeURIComponent(topic)}#contribution-${contribExt}`
      : '{VERIFY: hansard debate volume and column}';
    return {
      id: `CIT-${year || '0000'}-HANS-${item.ItemId || idx}`,
      tier: 'TIER_2_INQUIRY',
      provider: PROVIDER_NAME,
      title: `UK Parliament Hansard (${item.House || 'Commons'}, ${sitting}): ${sectionTitle}`,
      // URL form VERIFIED 2026-10-14 (header note); {VERIFY} only as a shape-change fallback.
      url,
      quoteOrFact: `${speaker}, ${item.House || 'Commons'}, ${sitting}: "${text.slice(0, 320)}"`
    };
  });
}