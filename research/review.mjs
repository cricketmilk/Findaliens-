// review.mjs — a person approves or rejects what the research agent found.
//
//     node research/review.mjs            go through everything pending
//     node research/review.mjs --list     counts only
//     node research/review.mjs --rebuild  regenerate public/data/web.json from past decisions
//
// Nothing the agent writes reaches the site on its own. Findings sit in
// research/findings/ (which is not published); each summary, fact and
// connection appears here with its sources, and only what you approve is
// written to public/data/web.json, the file "The Web" page reads.
//
// Keys:  a approve   r reject   e edit the wording, then approve
//        o open the sources in your browser   s skip for now   q save and quit

import { spawn } from "node:child_process";
import readline from "node:readline";
import { ENTITIES, REVIEW_STATE, WEB, STATUSES, findingFiles, itemKey, readJson, validateFinding, writeJson } from "./lib.mjs";
import { HANDOFFS_OUT, LINK_TYPES, handoffFiles, readHandoff, validateHandoff, grade, gap } from "./handoff-lib.mjs";

const args = new Set(process.argv.slice(2));
const state = readJson(REVIEW_STATE, { decisions: {}, edits: {} });

function pendingItems() {
  const out = [];
  for (const file of findingFiles()) {
    const f = readJson(file, null);
    if (!f || validateFinding(f, file).length) {
      console.log(`skipping ${file}: invalid (run node research/validate.mjs)`);
      continue;
    }
    if (f.summary) out.push({ f, kind: "summary", item: { claim: f.summary.text, status: "documented", sources: f.summary.sources } });
    for (const it of f.facts || []) out.push({ f, kind: "fact", item: it });
    for (const it of f.connections || []) out.push({ f, kind: "connection", item: it });
  }
  // Handoffs: the record itself, each typed link, and each examined claim are reviewed separately.
  for (const file of handoffFiles()) {
    const h = readHandoff(file);
    if (!h || validateHandoff(h, file).length) {
      console.log(`skipping ${file}: invalid (run node research/validate-handoffs.mjs)`);
      continue;
    }
    const f = { entity: "handoff:" + h.id, name: `HANDOFF · ${h.title}`, h };
    out.push({ f, kind: "handoff", item: { claim: h.summary, status: "documented", sources: [...h.public.sources, ...h.private.sources] } });
    for (const l of h.links) out.push({ f, kind: "handoff-link", item: l });
    for (const c of h.claims || []) out.push({ f, kind: "handoff-claim", item: { ...c, status: "documented" } });
  }
  return out.map((p) => ({ ...p, key: itemKey(p.f.entity, p.kind, p.item) }));
}

function rebuildHandoffs(items) {
  const approved = (p) => state.decisions[p.key]?.decision === "approved";
  const records = [];
  const byRecord = new Map();
  for (const p of items) {
    if (!p.kind.startsWith("handoff")) continue;
    if (!byRecord.has(p.f.entity)) byRecord.set(p.f.entity, { h: p.f.h, record: null, links: [], claims: [] });
    const r = byRecord.get(p.f.entity);
    if (!approved(p)) continue;
    const text = state.edits[p.key] || p.item.claim;
    if (p.kind === "handoff") r.record = text;
    else if (p.kind === "handoff-link") r.links.push({ ...p.item, claim: text });
    else r.claims.push({ claim: text, assessment: p.item.assessment, explanation: p.item.explanation, sources: p.item.sources });
  }
  for (const { h, record, links, claims } of byRecord.values()) {
    if (!record) continue; // the record itself must be approved before anything about it is published
    records.push({
      id: h.id, title: h.title, pattern: h.pattern, country: h.country, summary: record,
      public: h.public, private: h.private, links, claims,
      grade: grade(links), gap: gap(h),
    });
  }
  records.sort((a, b) => a.public.end.date.localeCompare(b.public.end.date));
  writeJson(HANDOFFS_OUT, { updated: new Date().toISOString(), note: "Grades are computed from approved, typed evidence; timing alone never counts as a link.", records });
  console.log(`public/data/handoffs.json: ${records.length} handoffs (${["A", "B", "C", "D"].map((g) => `${g}:${records.filter((r) => r.grade === g).length}`).join(" ")})`);
}

function rebuild() {
  const index = readJson(ENTITIES, { entities: [] });
  const known = new Map(index.entities.map((e) => [e.id, e.name]));
  const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const web = { updated: new Date().toISOString(), note: "Approved by a person in research/review.mjs. Every item carries its sources.", summaries: {}, facts: [], connections: [], newEntities: {} };

  const items = pendingItems();
  for (const p of items) {
    if (p.kind.startsWith("handoff")) continue;
    if (state.decisions[p.key]?.decision !== "approved") continue;
    const claim = state.edits[p.key] || p.item.claim;
    const at = state.decisions[p.key].at;
    if (p.kind === "summary") {
      web.summaries[p.f.entity] = { text: claim, sources: p.item.sources, researchedAt: p.f.researchedAt, approvedAt: at };
    } else if (p.kind === "fact") {
      web.facts.push({ entity: p.f.entity, claim, status: p.item.status, date: p.item.date || null, sources: p.item.sources, approvedAt: at });
    } else {
      const other = known.has(p.item.to) ? p.item.to : slug(p.item.to);
      if (!known.has(other)) web.newEntities[other] = { name: p.item.toName || p.item.to, type: p.item.toType || "unknown" };
      if (!known.has(p.f.entity)) web.newEntities[p.f.entity] = { name: p.f.name, type: "unknown" };
      // "reverse": the other entity is the subject of the relation (e.g. Thiel invested in Meta, filed under meta)
      const [from, to] = p.item.reverse ? [other, p.f.entity] : [p.f.entity, other];
      web.connections.push({ from, to, relation: p.item.relation, claim, status: p.item.status, date: p.item.date || null, sources: p.item.sources, approvedAt: at });
    }
  }
  writeJson(WEB, web);
  console.log(`public/data/web.json: ${Object.keys(web.summaries).length} summaries, ${web.facts.length} facts, ${web.connections.length} connections`);
  rebuildHandoffs(items);
}

function save() { writeJson(REVIEW_STATE, state); }

function openSources(sources) {
  for (const s of sources) {
    const cmd = process.platform === "win32" ? ["cmd", ["/c", "start", "", s.url]] : process.platform === "darwin" ? ["open", [s.url]] : ["xdg-open", [s.url]];
    spawn(cmd[0], cmd[1], { detached: true, stdio: "ignore" }).unref();
  }
}

async function review() {
  const all = pendingItems();
  const todo = all.filter((p) => !state.decisions[p.key]);
  console.log(`${all.length} items found, ${todo.length} pending\n`);
  if (!todo.length) { rebuild(); return; }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q, prefill = "") => new Promise((res) => { rl.question(q, res); if (prefill) rl.write(prefill); });

  for (let i = 0; i < todo.length; i++) {
    const p = todo[i];
    console.log("─".repeat(72));
    console.log(`[${i + 1}/${todo.length}] ${p.f.name} · ${p.kind.toUpperCase()}${p.item.relation ? ` · ${p.item.relation} → ${p.item.toName || p.item.to}` : ""}${p.kind === "handoff-link" ? ` · ${LINK_TYPES[p.item.type].label}` : ""}${p.kind === "handoff-claim" ? ` · assessed: ${p.item.assessment}` : ""}`);
    if (p.kind === "handoff") console.log(`  public: ${p.f.h.public.name} (${p.f.h.public.funder}) ended ${p.f.h.public.end.date} [${p.f.h.public.end.kind}]
  private: ${p.f.h.private.name}, ${p.f.h.private.founded.date}`);
    if (p.kind === "handoff-claim") console.log(`  explanation: ${p.item.explanation}`);
    console.log(`status: ${p.item.status} (${STATUSES[p.item.status] || "?"})${p.item.date ? ` · date: ${p.item.date}` : ""}`);
    console.log(`\n  ${p.item.claim}\n`);
    for (const s of p.item.sources) console.log(`  source: ${s.publisher}${s.date ? `, ${s.date}` : ""}${s.title ? ` — ${s.title}` : ""}\n          ${s.url}`);
    if (p.item.quote) console.log(`  supporting text: “${p.item.quote}”`);

    for (;;) {
      const k = (await ask("\n[a]pprove [r]eject [e]dit [o]pen [s]kip [q]uit > ")).trim().toLowerCase();
      if (k === "o") { openSources(p.item.sources); continue; }
      if (k === "a") { state.decisions[p.key] = { decision: "approved", at: new Date().toISOString() }; break; }
      if (k === "r") { state.decisions[p.key] = { decision: "rejected", at: new Date().toISOString() }; break; }
      if (k === "e") {
        const text = (await ask("new wording: ", p.item.claim)).trim();
        if (text) { state.edits[p.key] = text; state.decisions[p.key] = { decision: "approved", at: new Date().toISOString(), edited: true }; }
        break;
      }
      if (k === "s") break;
      if (k === "q") { rl.close(); save(); rebuild(); return; }
    }
    save();
  }
  rl.close();
  save();
  rebuild();
}

if (args.has("--list")) {
  const all = pendingItems();
  const count = (d) => all.filter((p) => state.decisions[p.key]?.decision === d).length;
  console.log(`${all.length} items: ${count("approved")} approved, ${count("rejected")} rejected, ${all.length - count("approved") - count("rejected")} pending`);
} else if (args.has("--rebuild")) {
  rebuild();
} else {
  await review();
}
