// lib.mjs — shared paths and the findings schema for the research tools.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const ENTITIES = path.join(ROOT, "public", "data", "entities.json");
export const WEB = path.join(ROOT, "public", "data", "web.json");
export const FINDINGS = path.join(ROOT, "research", "findings");
export const REVIEW_STATE = path.join(ROOT, "research", "review-state.json");

// The same evidence tags the pages use. "argument" is deliberately absent:
// the agent records what sources say, not interpretations.
export const STATUSES = {
  court: "ruled by a court, regulator or official inquiry; or a guilty plea or settlement",
  documented: "filings, official records, or the entity's own statements",
  peer: "peer-reviewed study",
  reported: "investigative or major-outlet journalism, not tested in court",
  words: "a direct quote from the person or organization",
};

export const RELATIONS = [
  "founded", "co-founded", "funded", "invested in", "owns", "subsidiary of", "executive of",
  "board member of", "employed by", "advised", "lobbied for", "donated to", "contracted with",
  "partnered with", "regulated", "investigated", "sued", "sued by", "settled with", "family of", "other",
];

export function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

export function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export function findingFiles() {
  if (!fs.existsSync(FINDINGS)) return [];
  return fs.readdirSync(FINDINGS).filter((f) => f.endsWith(".json")).map((f) => path.join(FINDINGS, f));
}

export function itemKey(entity, kind, item) {
  const basis = JSON.stringify([item.claim, item.to || "", (item.sources || []).map((s) => s.url)]);
  return `${entity}:${kind}:${crypto.createHash("sha1").update(basis).digest("hex").slice(0, 12)}`;
}

const isUrl = (u) => typeof u === "string" && /^https?:\/\/[^\s]+\.[^\s]+/.test(u);

function checkSources(where, sources, errors) {
  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push(`${where}: needs at least one source`);
    return;
  }
  sources.forEach((s, i) => {
    if (!s || !isUrl(s.url)) errors.push(`${where}.sources[${i}]: url must be an http(s) address`);
    if (!s || !s.publisher) errors.push(`${where}.sources[${i}]: publisher is required (e.g. "Reuters", "SEC")`);
  });
}

function checkClaim(where, item, errors) {
  if (typeof item.claim !== "string" || item.claim.trim().length < 10) errors.push(`${where}: claim is missing or too short`);
  else if (item.claim.length > 700) errors.push(`${where}: claim is over 700 characters; split it`);
  if (!STATUSES[item.status]) errors.push(`${where}: status must be one of ${Object.keys(STATUSES).join(", ")}`);
  checkSources(where, item.sources, errors);
}

// Returns a list of problems; empty means the file is valid.
export function validateFinding(data, file = "") {
  const errors = [];
  const base = path.basename(file, ".json");
  if (!data || typeof data !== "object") return ["not a JSON object"];
  if (typeof data.entity !== "string" || !/^[a-z0-9-]+$/.test(data.entity)) errors.push("entity: must be the entity id (lowercase-with-dashes)");
  else if (base && data.entity !== base) errors.push(`entity "${data.entity}" does not match the file name "${base}.json"`);
  if (typeof data.name !== "string" || !data.name) errors.push("name: required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.researchedAt || "")) errors.push("researchedAt: YYYY-MM-DD");
  if (data.summary != null) {
    if (typeof data.summary.text !== "string" || data.summary.text.length > 1000) errors.push("summary.text: required, at most 1000 characters");
    checkSources("summary", data.summary.sources, errors);
  }
  (data.facts || []).forEach((f, i) => checkClaim(`facts[${i}]`, f, errors));
  (data.connections || []).forEach((c, i) => {
    checkClaim(`connections[${i}]`, c, errors);
    if (typeof c.to !== "string" || !c.to) errors.push(`connections[${i}].to: required (an entity id or a name)`);
    if (!RELATIONS.includes(c.relation)) errors.push(`connections[${i}].relation: one of ${RELATIONS.join(", ")}`);
  });
  if (!Array.isArray(data.facts) && !Array.isArray(data.connections) && !data.summary) errors.push("nothing recorded: add a summary, facts or connections");
  return errors;
}
