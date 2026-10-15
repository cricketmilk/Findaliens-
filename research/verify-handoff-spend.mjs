// verify-handoff-spend.mjs — check every proposed money figure for the Handoff
// Ledger's tally against the page it cites, before it can be used.
//
//     node research/verify-handoff-spend.mjs <proposed.json> [more.json ...]
//
// A figure passes only when (1) its page can be fetched, (2) its quote is on
// that page (90% of the quote's five-word runs, or the whole of a short one),
// and (3) its amount is one of the numbers the quote states. Wikipedia and
// its mirrors are refused outright. Passing figures are merged into
// research/handoff-spend.json; failures are reported with the reason and
// never written. The research agent proposes; this decides.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "research", "handoff-spend.json");
const require = createRequire(import.meta.url);
// The Forge's fetcher reads PDFs and falls back sensibly; its audit owns the
// quote matcher every other research check on this site uses.
const FORGE = process.env.FORGE_DIR || "C:/Forge";
const { fetchText } = require(path.join(FORGE, "tools", "web.js"));
const { quoteFound } = require(path.join(FORGE, "research-audit.js"));

// public-in: spent building it before the handoff; net-public-cost: what the
// handoff itself cost the state; paid-to-successor: paid to the new owner to do
// the job; paid-back: royalties or repayments the public received; the rest
// describe what changed hands and what it became
const KINDS = ["public-in", "net-public-cost", "paid-to-successor", "paid-back", "sale-proceeds", "later-value", "successor-revenue", "discount", "prior-program-cost", "who-benefited"];
const WIKI = /(^|\.)wikipedia\.org|wikiwand|wikimili|dbpedia|everybodywiki|alchetron/i;

// Every amount a quote states, scaled: "$1.875 billion", "£6.4bn", "DM 256 Mrd.",
// "1,575,087,500", "¥3.05 trillion", "US$7,769 million", "mil millones".
export function amountsIn(text) {
  // NFKC turns full-width digits (\uff18\uff13\uff16\uff17) into ordinary ones
  const t = String(text).normalize("NFKC").replace(/\u00a0/g, " ");
  const out = [];
  // Japanese amounts stack their units: 1,056\u51049,976\u4e075,600\u5186 is 105,699,765,600
  for (const j of t.matchAll(/(?:([\d,]+)\u5146)?(?:([\d,]+)\u5104)?(?:([\d,]+)\u4e07)?([\d,]+)?(?=\u5186|$|[^\d,\u4e07\u5104\u5146])/g)) {
    if (!/[\u5146\u5104\u4e07]/.test(j[0])) continue;
    const n = (x) => Number(String(x || "0").replace(/,/g, ""));
    out.push(n(j[1]) * 1e12 + n(j[2]) * 1e8 + n(j[3]) * 1e4 + n(j[4]));
  }
  const SCALE = [
    [/^(trillion|tn|billion billion|billones)/i, 1e12],
    [/^(billion|bn|b\b|mrd\.?|milliarden?|mil millones|milliards?)/i, 1e9],
    [/^(million|mn|m\b|mio\.?|millionen|millones|millions?)/i, 1e6],
    [/^(thousand|k\b|tausend|mil\b)/i, 1e3],
  ];
  const re = /(\d{1,3}(?:[,.\s]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(?:-|–|to|bis)?\s*/g;
  let m;
  while ((m = re.exec(t))) {
    const raw = m[1];
    // 1,575,087,500 / 1.575.087.500 are thousands; 1.875 / 3,8 are decimals;
    // "7,769" could be either, so both readings are kept
    const readings = [];
    if (/^\d{1,3}[.,]\d{3}$/.test(raw)) readings.push(Number(raw.replace(/[,.]/g, "")), Number(raw.replace(",", ".")));
    else if (/^\d{1,3}([,.\s]\d{3})+$/.test(raw)) readings.push(Number(raw.replace(/[,.\s]/g, "")));
    else readings.push(Number(raw.replace(",", ".")));
    const rest = t.slice(m.index + m[0].length);
    let scale = 1;
    for (const [sre, s] of SCALE) if (sre.test(rest)) { scale = s; break; }
    // Chilean and Spanish ledgers put the unit first: MM$ is millions, M$ thousands
    const before = t.slice(Math.max(0, m.index - 4), m.index);
    if (scale === 1 && /MM\$\s*$/.test(before)) scale = 1e6;
    else if (scale === 1 && /(^|[^M])M\$\s*$/.test(before)) scale = 1e3;
    for (const n of readings) {
      if (!Number.isFinite(n)) continue;
      out.push(n * scale);
      if (scale !== 1) out.push(n);
    }
  }
  return out;
}

const close = (a, b) => Math.abs(a - b) <= Math.max(1, Math.abs(b) * 0.005);

async function check(m) {
  const why = [];
  if (!KINDS.includes(m.kind)) why.push(`unknown kind ${m.kind}`);
  if (!m.url || !/^https?:\/\//.test(m.url)) why.push("no url");
  if (WIKI.test(m.url || "")) why.push("Wikipedia or a mirror");
  if (!m.quote || m.quote.length < 12) why.push("no quote");
  if (m.kind !== "who-benefited") {
    if (!(Number(m.amount) > 0)) why.push("no amount");
    if (!m.currency) why.push("no currency");
    if (!(Number(m.money_year) > 1800)) why.push("no money_year");
    if (m.amount && m.quote && !amountsIn(m.quote).some((a) => close(a, Number(m.amount)))) why.push(`amount ${m.amount} is not a number the quote states`);
  }
  if (why.length) return { ok: false, why };
  let page;
  try { page = await fetchText(m.url, { max: 6_000_000 }); }
  catch (e) { return { ok: false, why: [`fetch failed: ${e.message}`] }; }
  // PDFs keep ligatures (the "fi" in "profits" as one character) and set real
  // dashes where a typed quote has "--"; fold both sides the same way first
  const fold = (x) => String(x || "").normalize("NFKC").replace(/--/g, "—");
  const score = quoteFound(fold(m.quote), fold(page.text));
  if (score < 0.9) return { ok: false, why: [`quote found at ${Math.round(score * 100)}% on the page`] };
  return { ok: true, score, via: page.via || "direct" };
}

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.log("usage: node research/verify-handoff-spend.mjs <proposed.json> ..."); process.exit(1); }
  const store = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { measures: [], rejected: [] };
  const key = (m) => `${m.id}|${m.kind}|${m.url}|${m.amount || ""}|${(m.quote || "").slice(0, 60)}`;
  const have = new Set(store.measures.map(key));
  let pass = 0, fail = 0;
  for (const f of files) {
    const cases = JSON.parse(fs.readFileSync(f, "utf8"));
    for (const c of cases) {
      for (const m0 of c.measures || []) {
        const m = { id: c.id, ...m0 };
        if (have.has(key(m))) continue;
        const r = await check(m);
        if (r.ok) {
          pass++;
          have.add(key(m));
          store.measures.push({ ...m, verified: { at: new Date().toISOString(), quoteScore: Number(r.score.toFixed(2)), via: r.via } });
          console.log(`  ok   ${m.id} ${m.kind} ${m.amount ?? ""} ${m.currency ?? ""}`);
        } else {
          fail++;
          store.rejected = (store.rejected || []).filter((x) => key(x) !== key(m));
          store.rejected.push({ ...m, why: r.why });
          console.log(`  FAIL ${m.id} ${m.kind} ${m.amount ?? ""} ${m.currency ?? ""}: ${r.why.join("; ")}`);
        }
      }
    }
  }
  store.updated = new Date().toISOString();
  fs.writeFileSync(OUT, JSON.stringify(store, null, 1) + "\n");
  console.log(`\n${pass} verified, ${fail} refused; ${store.measures.length} figures on file in research/handoff-spend.json`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
