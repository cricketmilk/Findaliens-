// Builds public/js/deep-state-data.js — the Deep State page's data, with the
// evidence the re-check verified attached to the claim it supports.
//
//   research/deep-state-dossiers.json   the editorial side: four dossiers, the
//                                       claim text, its status, its source chips
//   research/deep-state-sources.json    glm-recheck.mjs's record: for each claim
//                                       id, every source it opened, the source's
//                                       full publisher line and date as printed,
//                                       and the quotes found on the page as
//                                       fetched — plus `accepted` where a person
//                                       vouched for a claim by hand, and
//                                       `edited` where the rewrite was changed
//
// The two are joined on the claim id (DS-<dossier>-<item>, the argument last).
// A claim whose id is missing from the record, or whose text has drifted from
// the text that was checked, fails the build: the page must never show a quote
// as the evidence for a sentence nobody verified.
//
// The output is a classic script, not JSON fetched at runtime, so the page
// still works opened over file:// — the in-app file view has no server.
//
//   node research/build-deep-state.mjs           write it
//   node research/build-deep-state.mjs --check   verify only, touch nothing
//
import { readFileSync, writeFileSync } from "node:fs";
import { cleanPub, cleanDate } from "./source-labels.mjs";

const CHECK_ONLY = process.argv.includes("--check");
const OUT = "public/js/deep-state-data.js";
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const editorial = read("research/deep-state-dossiers.json");
const record = read("research/deep-state-sources.json");
const byId = new Map(record.map((r) => [r.id, r]));

// every claim, in reading order, the argument last within its dossier
const claims = editorial.dossiers.flatMap((d) => [...d.facts, ...(d.argument ? [d.argument] : [])]);
const problems = [];

// ---------------------------------------------------------------- the join
const evidence = {};
for (const claim of claims) {
  const r = byId.get(claim.id);
  if (!r) { problems.push(`${claim.id}: in the page, not in the record`); continue; }
  if (r.status !== claim.status) problems.push(`${claim.id}: status ${claim.status} on the page, ${r.status} in the record`);
  // The quotes are evidence for the sentence that was checked. If the sentence
  // has been edited since, the quotes may no longer be evidence for it.
  const norm = (s) => String(s).replace(/\s+/g, " ").trim();
  if (norm(r.text) !== norm(claim.text)) problems.push(`${claim.id}: the claim text has changed since it was checked — re-run the re-check, or restore the checked wording`);

  const sources = (r.sources || []).map((s) => ({
    url: s.url,
    publisher: cleanPub(s.url, s.publisher),
    date: cleanDate(s.date || s.dateText),
    // the long forms the page shows once the drawer is open
    publisherFull: s.publisherFull || s.publisher || "",
    dateText: s.dateText || "",
    quotes: (s.quotes || []).map(norm).filter(Boolean),
  }));
  const quoted = sources.filter((s) => s.quotes.length);
  if (!quoted.length && claim.status !== "argument") problems.push(`${claim.id}: no verified quote on any source`);

  evidence[claim.id] = {
    sources,
    quotes: sources.reduce((n, s) => n + s.quotes.length, 0),
    ...(r.accepted ? { accepted: r.accepted } : {}),
    ...(r.edited ? { edited: r.edited } : {}),
  };
}
for (const id of byId.keys()) if (!claims.some((c) => c.id === id)) problems.push(`${id}: in the record, not on the page`);

// A source chip on the page must be a source the record actually opened, or
// the page is crediting a page nobody read.
for (const claim of claims) {
  const ev = evidence[claim.id];
  if (!ev) continue;
  const known = new Set(ev.sources.map((s) => s.url));
  for (const s of claim.sources || []) if (!known.has(s.url)) problems.push(`${claim.id}: cites ${s.url}, which is not in the record`);
}

if (problems.length) {
  console.error(`deep-state build failed — ${problems.length} problem${problems.length > 1 ? "s" : ""}:`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}

// ------------------------------------------------------------- the tallies
// What the page says about its own sourcing, counted rather than asserted.
const urls = new Set();
const hosts = new Set();
let quotes = 0;
for (const ev of Object.values(evidence)) {
  quotes += ev.quotes;
  for (const s of ev.sources) {
    urls.add(s.url);
    try { hosts.add(new URL(s.url).hostname.replace(/^www\./, "")); } catch { /* keep the count honest, drop the host */ }
  }
}
const byStatus = {};
for (const c of claims) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
const vouched = claims.filter((c) => evidence[c.id]?.accepted).map((c) => ({ id: c.id, why: evidence[c.id].accepted }));
const edited = claims.filter((c) => evidence[c.id]?.edited).map((c) => ({ id: c.id, why: evidence[c.id].edited }));

const meta = {
  claims: claims.length,
  dossiers: editorial.dossiers.length,
  sources: urls.size,
  hosts: hosts.size,
  quotes,
  byStatus,
  vouched,
  edited,
  // the register that runs under the masthead: each source once, newest last
  ticker: [...new Set(Object.values(evidence).flatMap((ev) => ev.sources.map((s) => `${s.publisher} ${s.date}`)))].sort(),
};

const data = { status: editorial.status, dossiers: editorial.dossiers, evidence, howto: editorial.howto, meta };
const banner = `// Generated by research/build-deep-state.mjs — do not edit.
// The claims and their sources: research/deep-state-dossiers.json
// The verified quotes:          research/deep-state-sources.json
// ${meta.claims} claims · ${meta.sources} sources · ${meta.hosts} publishers · ${meta.quotes} verified quotes
`;
const js = `${banner}window.DS_DATA = ${JSON.stringify(data, null, 1)};\n`;

if (CHECK_ONLY) {
  const current = (() => { try { return readFileSync(OUT, "utf8"); } catch { return null; } })();
  if (current !== js) { console.error(`${OUT} is out of date — run: node research/build-deep-state.mjs`); process.exit(1); }
  console.log(`${OUT} is current (${meta.claims} claims, ${meta.quotes} quotes).`);
} else {
  writeFileSync(OUT, js);
  console.log(`${OUT}: ${meta.claims} claims, ${meta.sources} sources across ${meta.hosts} publishers, ${meta.quotes} verified quotes.`);
  console.log(`  by status: ${Object.entries(meta.byStatus).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`  ${meta.vouched.length} vouched by hand, ${meta.edited.length} edited after the re-check.`);
}
