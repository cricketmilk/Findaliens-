#!/usr/bin/env node
// build-carbon-class.mjs — write public/js/carbon-class-data.js from the
// AUDITED research in research/carbon-class/*.json.
//
//   node research/build-carbon-class.mjs
//
// The page shows nothing that is not in those files, and those files hold
// nothing the audit did not re-read on its cited page (Kenoma's
// research-audit-cli.js, run strict: every page re-opened, every figure and
// name found on it, the passage kept as "quote"). Charts are drawn from
// facts by id; if the audit removed a fact a chart depends on, this script
// stops and says which, rather than publishing a chart with a hole in it.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, "carbon-class");
const out = path.join(here, "..", "public", "js", "carbon-class-data.js");

const load = (name) => { const p = path.join(dir, `${name}.json`); return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")).facts : []; };
const impacts = load("impacts"), ventures = load("ventures"), absorbed = load("absorb");
// absorb.json: what the original Carbon Ledger page said that Carbon Class
// did not, re-sourced and audited when the two pages became one
const all = [...impacts, ...ventures, ...absorbed];
// plain-English headlines, written and checked by research-gym.js (a script
// for figures and names, a second reader for meaning, conditions and
// certainty). A fact without one shows its full claim instead.
const headlines = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, "headlines.json"), "utf8")); } catch { return {}; } })();
const byId = new Map(all.map((f) => [f.id, f]));
const need = (id) => { const f = byId.get(id); if (!f) throw new Error(`the page needs fact "${id}", which is not in the audited research (removed by the audit, or renamed)`); return f; };

const year = (d) => (String(d || "").match(/\d{4}/) || [""])[0];
const card = (f) => ({
  big: f.big || "",
  headline: headlines[f.id] || null,
  text: f.claim,
  src: `${f.sources[0].publisher || new URL(f.sources[0].url).hostname}${year(f.date) ? ` (${year(f.date)})` : ""}`,
  url: f.sources[0].url,
  quote: f.quote,
  status: f.status === "peer" || f.status === "documented" ? f.status : "reported",
  // the date as a date: the research notes beside it stay in the record
  date: (String(f.date || "").match(/\d{4}(-\d{2}){0,2}/) || [null])[0],
});
const section = (list, s) => list.filter((f) => f.section === s).map(card);

// ---- 01 the split: one study for both charts, so the bars agree -------------
const wirShares = need("wir2022-percap-by-group");   // 12 / 40.4 / 47.6 / 16.8 % and 1.6 / 6.6 / 31 / 110 t
const wirBudget = need("wir2022-1.5C-budget-1.1t");
const split = {
  year: 2019,
  src: `World Inequality Report 2022, ch. 6`, url: wirShares.sources[0].url, quote: wirShares.quote,
  groups: [
    { g: "Bottom 50%", pop: 50, em: 12 },
    { g: "Middle 40%", pop: 40, em: 40.4 },
    { g: "Top 10%", pop: 10, em: 47.6 },
    { g: "Top 1%", pop: 1, em: 16.8 },
  ],
  percap: {
    budget: 1.1, budgetNote: "the equal share of the remaining 1.5 °C budget to 2050 (same report)",
    groups: [{ g: "Bottom 50%", t: 1.6 }, { g: "Middle 40%", t: 6.6 }, { g: "Top 10%", t: 31 }, { g: "Top 1%", t: 110 }],
  },
};
// the figures above must be the ones the quote says
for (const n of ["12%", "40.4%", "47.6%", "16.8%", "1.6 tonnes", "6.6 tonnes", "31 tonnes", "110 tonnes"]) if (!wirShares.quote.includes(n)) throw new Error(`chart figure ${n} is not in the quote it is drawn from`);
if (!wirBudget.quote.includes("1.1 tonne")) throw new Error("the 1.1 t budget is not in its quote");

const data = {
  updated: new Date().toISOString().slice(0, 10),
  split,
  facts: {
    split: [...section(impacts, "shares"), ...section(absorbed, "split"), ...section(impacts, "percap"), ...section(impacts, "history")],
    warming: section(impacts, "warming"),
    impacts: section(impacts, "impacts"),
    forecast: [],
  },
  ventures: [],
};

// ---- the short version: five lines a reader can stop after ------------------
// Each line's figures must be in the quotes of the facts it rests on; the line
// links to its section and its first fact's source.
const SHORT = [
  { to: "split", facts: ["wir2022-percap-by-group"], needs: ["47.6%", "12%"],
    text: "The richest 10% of people produce about half of all greenhouse gases (47.6%); the poorest half produce 12%." },
  { to: "warming", facts: ["schongart-two-thirds-warming"], needs: ["two-thirds"],
    text: "Their emissions are behind about two-thirds of the warming between 1990 and 2020, a study in Nature Climate Change finds." },
  { to: "impacts", facts: ["cir2023-bottom50-75pct-losses", "wmo-90pct-deaths-developing"], needs: ["75%", "90%"],
    text: "The damage lands the other way: the poorest half face an estimated 75% of the income lost to climate change, and over 90% of reported disaster deaths are in developing countries." },
  { to: "ventures", facts: ["iea-dc-co2-2035-update", "pa-growth-2019-2023"], needs: ["350 million tonnes", "46.0%"],
    text: "What they are building adds more: data-centre emissions are projected to double to about 350 million tonnes by 2035, and private-jet emissions rose 46% in four years." },
  { to: "ledger", facts: [], needs: [],
    text: "None of it was a surprise: oil companies’ own scientists warned them in the 1970s and 80s, and the industry spent the next decades paying for doubt." },
];
if (impacts.length && ventures.length) {
  data.short = SHORT.map((x) => {
    const fs_ = x.facts.map(need);
    const joined = fs_.map((f) => f.quote).join(" ");
    for (const n of x.needs) if (!joined.includes(n)) throw new Error(`short version "${x.to}": "${n}" is not in the quotes of ${x.facts.join(", ")}`);
    return { to: x.to, text: x.text, src: fs_[0] ? fs_[0].sources[0].publisher : null, url: fs_[0] ? fs_[0].sources[0].url : null };
  });
}

// ---- the planet's numbers, under the counter ---------------------------------
const quoteHas = (f, ...n) => { for (const x of n) if (!f.quote.replace(/\s+/g, " ").includes(x)) throw new Error(`"${f.id}": the quote does not contain "${x}"`); return f; };
if (absorbed.length) {
  const co2 = quoteHas(need("noaa-co2-2025"), "427.35"), co2then = quoteHas(need("noaa-co2-1959"), "315.98");
  const w24 = quoteHas(need("wmo-2024-1.55"), "1.55"), w25 = quoteHas(need("wmo-2025"), "1.43");
  const hw = quoteHas(need("forster-2026-warming-1.37"), "1.37", "0.27");
  const budget = quoteHas(need("forster-2026-budget-130gt"), "130");
  const cell = (k, v, s, f, meter = null) => ({ k, v, s, src: f.sources[0].publisher, url: f.sources[0].url, quote: f.quote, meter });
  data.hero = [
    cell("CO₂ IN THE AIR · 2025", "427.35 ppm", `1959: 315.98 ppm (first year of the record); pre-industrial ≈ 280`, co2, Math.round((427.35 - 280) / 280 * 100)),
    cell("HOTTEST YEAR · 2024", "1.55 °C", "likely the first calendar year above 1.5 °C", w24, 100),
    cell("2025", "1.43 °C", "second or third warmest on record", w25, Math.round(1.43 / 1.5 * 100)),
    cell("HUMAN-CAUSED WARMING · 2025", "1.37 °C", "rising about 0.27 °C a decade", hw, Math.round(1.37 / 1.5 * 100)),
    cell("1.5 °C BUDGET LEFT · JAN 2026", "130 Gt CO₂", "a little over 3 years at 2025 rates (the Global Carbon Budget puts it at 170 Gt)", budget),
  ];
}

// ---- 04 + 05: filled from the ventures research (see ventures.mjs) ----------
let extra = null;
const vpath = path.join(here, "carbon-class-ventures.mjs");
if (fs.existsSync(vpath)) {
  extra = await import(new URL(`file:///${vpath.replace(/\\/g, "/")}`).href);
  Object.assign(data, extra.build({ need, card, section, impacts, ventures }));
  data.facts.forecast = extra.forecastFacts ? extra.forecastFacts({ need, card }) : [];
  // the absorbed outlook: the production gap, the half-degree rule, and the
  // second estimate of the budget, beside the first
  const budgetAt = data.facts.forecast.findIndex((f) => /170 ?GtCO/.test(f.text));
  const extraF = section(absorbed, "forecast");
  const b130 = extraF.filter((f) => /130 ?GtCO/.test(f.text)), rest = extraF.filter((f) => !/130 ?GtCO/.test(f.text));
  if (budgetAt >= 0) data.facts.forecast.splice(budgetAt + 1, 0, ...b130); else data.facts.forecast.push(...b130);
  data.facts.forecast.push(...rest);
}

const js = `// Carbon Class data. GENERATED by research/build-carbon-class.mjs from the
// audited research in research/carbon-class/*.json -- edit those, not this.
window.CARBON_CLASS = ${JSON.stringify(data, null, 1)};
`;
fs.writeFileSync(out, js);
const n = Object.values(data.facts).reduce((a, l) => a + l.length, 0) + data.ventures.reduce((a, v) => a + v.facts.length, 0);
const withHead = [...Object.values(data.facts).flat(), ...data.ventures.flatMap((v) => v.facts)].filter((c) => c.headline).length;
console.log(`headlines on ${withHead} of ${n} cards`);
console.log(`wrote ${path.relative(process.cwd(), out)}: ${n} facts, ${data.ventures.length} ventures, forecast ${data.forecast ? `${data.forecast.streams.length} streams` : "none"}`);
