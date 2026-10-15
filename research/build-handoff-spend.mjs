// build-handoff-spend.mjs — the Handoff Ledger's tally, from verified figures.
//
//     node research/build-handoff-spend.mjs [--refresh-rates]
//
// Reads research/handoff-spend.json (figures that passed
// verify-handoff-spend.mjs) and public/data/handoffs.json (the live cases and
// their grades), converts every figure to US dollars of BASE_YEAR, and writes
// public/data/handoff-spend.json for the page.
//
// Conversion: a foreign amount becomes US dollars at that year's average
// market rate (Federal Reserve series via FRED), then US dollars are moved to
// BASE_YEAR with the US consumer price index (CPI-U, BLS via FRED). The rates
// are cached in research/handoff-spend-rates.json so a build is repeatable;
// --refresh-rates fetches them again.
//
// What is added up: only figures of one kind (money in, cost of the handoff,
// paid to the successor) and only for live cases graded A or B, because a
// circumstantial or timing-only case is not a documented handoff. A case
// with several figures of the same kind counts once, by its largest, so
// overlapping counts are never summed. Kinds are never added to each other.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IN = path.join(ROOT, "research", "handoff-spend.json");
const RATES = path.join(ROOT, "research", "handoff-spend-rates.json");
const LIVE = path.join(ROOT, "public", "data", "handoffs.json");
const OUT = path.join(ROOT, "public", "data", "handoff-spend.json");
const BASE_YEAR = 2025;

// FRED series: CPI, and dollars per unit (GBP, EUR) or units per dollar (the rest)
const SERIES = {
  CPI: { id: "CPIAUCNS", fq: "Annual", what: "US CPI-U, all items, not seasonally adjusted (BLS)" },
  GBP: { id: "AEXUSUK", per: "usd-per-unit", what: "US dollars per pound sterling (Federal Reserve)" },
  EUR: { id: "AEXUSEU", per: "usd-per-unit", what: "US dollars per euro (Federal Reserve)" },
  JPY: { id: "AEXJPUS", per: "units-per-usd", what: "Japanese yen per US dollar (Federal Reserve)" },
  CAD: { id: "AEXCAUS", per: "units-per-usd", what: "Canadian dollars per US dollar (Federal Reserve)" },
  MXN: { id: "AEXMXUS", per: "units-per-usd", what: "Mexican pesos per US dollar (Federal Reserve)" },
  DEM: { id: "EXGEUS", per: "units-per-usd", what: "German marks per US dollar, monthly averaged to the year (Federal Reserve)" },
};
const fredUrl = (s) => `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${s.id}&fq=Annual&fam=avg`;

async function loadRates(refresh) {
  if (!refresh && fs.existsSync(RATES)) return JSON.parse(fs.readFileSync(RATES, "utf8"));
  const require = createRequire(import.meta.url);
  const { fetchText } = require(path.join(process.env.FORGE_DIR || "C:/Forge", "tools", "web.js"));
  const out = { fetched: new Date().toISOString(), series: {} };
  for (const [k, s] of Object.entries(SERIES)) {
    const r = await fetchText(fredUrl(s), { max: 2_000_000 });
    const byYear = {};
    for (const line of r.text.trim().split(/\s+/).slice(1)) {
      const [d, v] = line.split(",");
      if (v && v !== "." && !Number.isNaN(Number(v))) byYear[d.slice(0, 4)] = Number(v);
    }
    out.series[k] = { ...s, url: `https://fred.stlouisfed.org/series/${s.id}`, byYear };
  }
  fs.writeFileSync(RATES, JSON.stringify(out, null, 1) + "\n");
  return out;
}

function toUsd(m, rates) {
  const y = String(m.money_year);
  const cpi = rates.series.CPI.byYear;
  // money dated after the base year has no index yet; it is taken as already in base-year dollars
  const cy = cpi[y] || (Number(y) > BASE_YEAR ? cpi[String(BASE_YEAR)] : null);
  if (!cy || !cpi[BASE_YEAR]) return null;
  let usd;
  if (m.currency === "USD") usd = m.amount;
  else {
    const s = rates.series[m.currency];
    const r = s && (s.byYear[y] || (Number(y) > BASE_YEAR ? s.byYear[String(BASE_YEAR)] : null));
    if (!r) return null;                       // no official rate for that year: shown, never totalled
    usd = s.per === "usd-per-unit" ? m.amount * r : m.amount / r;
  }
  return usd * (cpi[String(BASE_YEAR)] / cy);
}

async function main() {
  const rates = await loadRates(process.argv.includes("--refresh-rates"));
  const store = JSON.parse(fs.readFileSync(IN, "utf8"));
  const live = JSON.parse(fs.readFileSync(LIVE, "utf8")).records;
  const grade = new Map(live.map((r) => [r.id, r.grade]));
  const counted = (m) => ["A", "B"].includes(grade.get(m.id));
  const measures = store.measures
    .filter((m) => grade.has(m.id))
    .map((m) => ({ ...m, usd: m.kind === "who-benefited" ? null : toUsd(m, rates) }));
  const unconverted = measures.filter((m) => m.kind !== "who-benefited" && m.usd == null);

  // One case, one kind: figures marked "adds" are distinct pieces (separate
  // sales, development rounds, years of subsidy) and are summed; every other
  // figure may overlap the rest, so only the largest counts. The case takes
  // whichever is greater. A ceiling ("up to") is never counted.
  const caseValue = (id, kind) => {
    const ms = measures.filter((m) => m.id === id && m.kind === kind && m.usd != null && !m.ceiling);
    if (!ms.length) return null;
    const parts = ms.filter((m) => m.adds), alone = ms.filter((m) => !m.adds);
    const sum = parts.reduce((s, m) => s + m.usd, 0);
    const top = alone.sort((a, b) => b.usd - a.usd)[0];
    if (parts.length && (!top || sum >= top.usd)) {
      const years = parts.map((m) => Number(m.money_year));
      const cur = new Set(parts.map((m) => m.currency));
      return {
        id, kind, usd: sum, parts: parts.length,
        amount: cur.size === 1 ? parts.reduce((s, m) => s + m.amount, 0) : null, currency: cur.size === 1 ? parts[0].currency : null,
        money_year: Math.max(...years), period: Math.min(...years) === Math.max(...years) ? String(years[0]) : `${Math.min(...years)}–${Math.max(...years)}`,
        what: `${parts.length} separate figures added together`,
        detail: parts.map((m) => m.what.replace(/\.$/, "")).join("; "),
        sources: parts.map((m) => ({ url: m.url, publisher: m.publisher, date: m.date })),
      };
    }
    return { ...top, sources: [{ url: top.url, publisher: top.publisher, date: top.date }] };
  };
  const ab = live.filter((r) => ["A", "B"].includes(r.grade));
  const tally = (kind) => {
    const items = ab.map((r) => caseValue(r.id, kind)).filter(Boolean).sort((a, b) => b.usd - a.usd);
    return { usd: items.reduce((s, m) => s + m.usd, 0), of: ab.length, items };
  };
  // what the state was paid, set beside every documented later value; no
  // multiplier, because a sale and a later price rarely cover the same thing
  const worth = [];
  for (const r of ab) {
    const sold = caseValue(r.id, "sale-proceeds");
    const later = measures.filter((m) => m.id === r.id && m.kind === "later-value").sort((a, b) => a.money_year - b.money_year);
    const discount = measures.filter((m) => m.id === r.id && m.kind === "discount");
    if (sold || later.length || discount.length) worth.push({ id: r.id, sold, later, discount });
  }
  worth.sort((a, b) => (b.sold?.usd || 0) - (a.sold?.usd || 0));

  const method = `Amounts are converted to ${BASE_YEAR} US dollars: a foreign figure at that year's average exchange rate (Federal Reserve, via FRED), then by the US consumer price index (CPI-U). A figure dated after  is taken as already in  dollars. A figure with no official rate for its year is shown in its own currency and left out of every total${unconverted.length ? ` (${unconverted.length} here)` : ""}. Totals count only grade A and B cases, each case once per kind, by its largest documented figure.`;
  const out = {
    updated: new Date().toISOString(),
    base_year: BASE_YEAR,
    method,
    rates: Object.fromEntries(Object.entries(rates.series).map(([k, s]) => [k, { what: s.what, url: s.url }])),
    measures,
    totals: { in: tally("public-in"), net: tally("net-public-cost"), paid: tally("paid-to-successor"), back: tally("paid-back"), worth },
    // one entry per passage: two findings drawn from the same quote are shown once
    benefited: Object.values(measures.filter((m) => m.kind === "who-benefited" && counted(m)).reduce((acc, m) => {
      const k = m.id + "|" + m.quote;
      if (acc[k]) acc[k].what += " " + m.what; else acc[k] = { ...m };
      return acc;
    }, {})),
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
  const f = (n) => "$" + (n / 1e9).toFixed(1) + "B";
  console.log(`public/data/handoff-spend.json: in ${f(out.totals.in.usd)} over ${out.totals.in.items.length}/${out.totals.in.of} cases; cost of handoff ${f(out.totals.net.usd)} (${out.totals.net.items.length}); paid to successors ${f(out.totals.paid.usd)} (${out.totals.paid.items.length}); paid back ${f(out.totals.back.usd)} (${out.totals.back.items.length}); ${worth.length} worth rows; ${out.benefited.length} who-gained; ${unconverted.length} unconverted`);
  for (const k of ["in", "net", "paid"]) for (const m of out.totals[k].items) console.log(`  ${k.padEnd(4)} ${m.id.padEnd(36)} ${f(m.usd).padStart(9)}  ${m.parts ? "(sum of " + m.parts + ")" : ""}`);
}

main();
