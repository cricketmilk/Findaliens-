// handoff-lib.mjs — schema, validation and grading for "handoffs": a publicly
// funded program that ends, and a private entity that takes its place.
//
// The grade is computed from the typed evidence, never asserted by whoever
// wrote the record. Timing alone can never make a link: a private product
// appearing soon after a public program ends is the starting point of an
// investigation, not its conclusion.

import fs from "node:fs";
import path from "node:path";
import { ROOT, STATUSES, readJson } from "./lib.mjs";

export const HANDOFFS = path.join(ROOT, "research", "handoffs");
export const HANDOFFS_OUT = path.join(ROOT, "public", "data", "handoffs.json");

export const PATTERNS = {
  "spinout": "the program's own team, code or patents became a company",
  "privatization": "a state-owned asset or service was sold or leased to private owners",
  "outsourced-successor": "the program ended and its mission was contracted to private firms",
  "parallel-successor": "a similar private product appeared, with some documented ties",
  "claimed-successor": "a link is widely claimed but not documented",
};

// Link types, strongest first. "transfer" types can carry a handoff on their own.
export const LINK_TYPES = {
  "ip-license": { label: "IP / license", transfer: true, desc: "technology, patents or a spinout agreement passed from the program to the company" },
  "asset-transfer": { label: "asset transfer", transfer: true, desc: "the government sold, leased or handed over assets, data or infrastructure" },
  "contract": { label: "contract", transfer: true, desc: "the government contracted the successor to do the program's job" },
  "stated-successor": { label: "stated successor", transfer: true, desc: "an official or the company said the one replaces the other" },
  "personnel": { label: "personnel", transfer: false, desc: "named people moved from the program to the company" },
  "funding": { label: "funding", transfer: false, desc: "the same agencies or investors funded both" },
  "timing": { label: "timing", transfer: false, desc: "dates only; never enough on its own" },
};

export const END_KINDS = ["completed", "cancelled", "defunded", "privatized", "transferred", "ongoing"];
export const PRECISIONS = ["day", "month", "year"];

export const GRADES = {
  A: "Documented handoff: a transfer, contract or official successor is on the record",
  B: "Strong link: documented people moved plus another tie, or a transfer that is reported but not documented",
  C: "Circumstantial: shared people or funders only",
  D: "Timing only: no documented link",
};

const isUrl = (u) => typeof u === "string" && /^https?:\/\/[^\s]+\.[^\s]+/.test(u);
const strong = (s) => s === "documented" || s === "court";

function checkSources(where, sources, errors) {
  if (!Array.isArray(sources) || !sources.length) return errors.push(`${where}: needs at least one source`);
  sources.forEach((s, i) => {
    if (!s || !isUrl(s.url)) errors.push(`${where}.sources[${i}]: url must be http(s)`);
    if (!s || !s.publisher) errors.push(`${where}.sources[${i}]: publisher required`);
    if (s && /wikipedia\.org/i.test(s.url || "") && !/wikipedia/i.test(s.publisher || "")) errors.push(`${where}.sources[${i}]: a Wikipedia URL must say publisher "Wikipedia" (better: cite its source)`);
  });
}

function checkDate(where, d, errors) {
  if (!d || typeof d.date !== "string" || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(d.date)) return errors.push(`${where}.date: YYYY, YYYY-MM or YYYY-MM-DD`);
  if (!PRECISIONS.includes(d.precision)) errors.push(`${where}.precision: one of ${PRECISIONS.join(", ")}`);
  const parts = d.date.split("-").length;
  if ((d.precision === "day" && parts !== 3) || (d.precision === "month" && parts !== 2) || (d.precision === "year" && parts !== 1)) errors.push(`${where}: precision "${d.precision}" doesn't match "${d.date}"`);
}

export function validateHandoff(h, file = "") {
  const errors = [];
  const base = path.basename(file, ".json");
  if (!h || typeof h !== "object") return ["not a JSON object"];
  if (!/^[a-z0-9-]+$/.test(h.id || "")) errors.push("id: lowercase-with-dashes");
  else if (base && h.id !== base) errors.push(`id "${h.id}" must match file name "${base}.json"`);
  if (!h.title) errors.push("title: required");
  if (!PATTERNS[h.pattern]) errors.push(`pattern: one of ${Object.keys(PATTERNS).join(", ")}`);
  if (!h.country) errors.push("country: required (or a region like \"European Union\")");
  if (typeof h.summary !== "string" || h.summary.length < 20 || h.summary.length > 900) errors.push("summary: 20–900 characters, neutral");

  const p = h.public || {};
  if (!p.name) errors.push("public.name: required");
  if (!p.funder) errors.push("public.funder: required");
  checkDate("public.start", p.start, errors);
  checkDate("public.end", p.end, errors);
  if (p.end && !END_KINDS.includes(p.end.kind)) errors.push(`public.end.kind: one of ${END_KINDS.join(", ")}`);
  checkSources("public", p.sources, errors);

  const q = h.private || {};
  if (!q.name) errors.push("private.name: required");
  checkDate("private.founded", q.founded, errors);
  checkSources("private", q.sources, errors);

  (h.links || []).forEach((l, i) => {
    if (!LINK_TYPES[l.type]) errors.push(`links[${i}].type: one of ${Object.keys(LINK_TYPES).join(", ")}`);
    if (!STATUSES[l.status]) errors.push(`links[${i}].status: one of ${Object.keys(STATUSES).join(", ")}`);
    if (typeof l.claim !== "string" || l.claim.length < 15 || l.claim.length > 500) errors.push(`links[${i}].claim: 15–500 characters`);
    checkSources(`links[${i}]`, l.sources, errors);
  });
  (h.claims || []).forEach((c, i) => {
    if (typeof c.claim !== "string" || !c.claim) errors.push(`claims[${i}].claim: required`);
    if (!["false", "unsupported", "partly-true", "true"].includes(c.assessment)) errors.push(`claims[${i}].assessment: false, unsupported, partly-true or true`);
    if (typeof c.explanation !== "string" || c.explanation.length < 20) errors.push(`claims[${i}].explanation: required`);
    checkSources(`claims[${i}]`, c.sources, errors);
  });
  if (!Array.isArray(h.links)) errors.push("links: required (may be empty for a claimed successor)");
  return errors;
}

// Days between two partial dates, using the start of the period for each.
function toDate(d) {
  const [y, m = "01", day = "01"] = d.date.split("-");
  return new Date(`${y}-${m}-${day}T00:00:00Z`);
}
export function gap(h) {
  if (!h.public?.end || !h.private?.founded) return null;
  const days = Math.round((toDate(h.private.founded) - toDate(h.public.end)) / 86400000);
  const coarse = [h.public.end.precision, h.private.founded.precision].includes("year") ? "year"
    : [h.public.end.precision, h.private.founded.precision].includes("month") ? "month" : "day";
  return { days, precision: coarse };
}

// Grade from approved evidence only. Triangulation: A and B need at least two
// independent publishers across the links that earn them.
export function grade(links) {
  const real = links.filter((l) => l.type !== "timing");
  const pubs = (ls) => new Set(ls.flatMap((l) => l.sources.map((s) => s.publisher.toLowerCase().replace(/^the\s+/, "")))).size;
  const transfers = real.filter((l) => LINK_TYPES[l.type].transfer);
  const strongTransfers = transfers.filter((l) => strong(l.status));
  const personnel = real.filter((l) => l.type === "personnel");
  const strongPersonnel = personnel.filter((l) => strong(l.status) || l.status === "reported");

  // "Another tie" for B means a different kind of tie (funding or a transfer),
  // not more people: four engineers moving is still one personnel finding.
  const otherKind = real.filter((l) => l.type !== "personnel");

  if (strongTransfers.length && pubs(real) >= 2) return "A";
  if ((transfers.length && pubs(real) >= 2) || (strongPersonnel.length && otherKind.length && pubs(real) >= 2)) return "B";
  if (real.length) return "C";
  return "D";
}

export function handoffFiles() {
  if (!fs.existsSync(HANDOFFS)) return [];
  return fs.readdirSync(HANDOFFS).filter((f) => f.endsWith(".json")).map((f) => path.join(HANDOFFS, f));
}

export const readHandoff = (file) => readJson(file, null);
