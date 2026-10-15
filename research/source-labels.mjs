// How a source is shown on a page: a short publisher name and a month.
//
// A model writes a source's date the way the page does ("November 24, 2015",
// "Mon, Nov 7 2023", "Publication 550") and its publisher with every credit it
// can find ("U.S. Department of Defense, All-domain Anomaly Resolution Office
// (AARO), February 2024 (cleared for publication March 6, 2024)"). One place
// cuts both down, for research/glm-recheck.mjs and for every page built from
// what it verifies; the full forms stay in the research files.

export function cleanDate(d) {
  const s = String(d || "").trim();
  const iso = s.match(/^((?:19|20)\d{2})(-\d{2})?(?![\d])/);
  if (iso) return iso[0];
  const t = Date.parse(s.replace(/^[A-Za-z]{3},\s*/, ""));
  // "Publication 550" parses as the year 550
  if (!Number.isNaN(t) && new Date(t).getUTCFullYear() > 1900 && new Date(t).getUTCFullYear() < 2031) return new Date(t).toISOString().slice(0, 7);
  return (s.match(/\b(19|20)\d{2}\b/) || [""])[0];
}

const SHORT_PUB = {
  "uscode.house.gov": "U.S. Code", "www.law.cornell.edu": "Cornell Law (LII)", "www.govinfo.gov": "U.S. Government Publishing Office",
  "www.federalregister.gov": "Federal Register", "www.gao.gov": "GAO", "www.nber.org": "NBER", "www.congress.gov": "Congress.gov",
  "www.archives.gov": "National Archives", "www.cia.gov": "CIA", "www.fec.gov": "FEC", "api.open.fec.gov": "FEC",
  "www.usaspending.gov": "USAspending.gov", "media.defense.gov": "U.S. Department of Defense", "www.af.mil": "U.S. Air Force",
  "www.pogo.org": "POGO", "archive.org": "Internet Archive", "www.gutenberg.org": "Project Gutenberg",
};

export function cleanPub(url, p) {
  try { const h = new URL(url).hostname; if (SHORT_PUB[h]) return SHORT_PUB[h]; } catch {}
  let x = String(p || "").replace(/\s*\([^)]*\)/g, "").replace(/\s+[—–]\s+.*$/, "").replace(/,\s*Inc\.?$/, "").trim();
  if (x.length > 44) x = x.slice(0, 44).replace(/\s+\S*$/, "") + "…";
  return x;
}

export const cleanSources = (list) => (list || []).map(({ url, publisher, date }) => ({ url, publisher: cleanPub(url, publisher), date: cleanDate(date) }));
