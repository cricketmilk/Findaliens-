// run-kenoma.mjs — ask Kenoma (the Forge agent) to run a research pass.
//
//     node research/run-kenoma.mjs                    research the next 5 entities
//     node research/run-kenoma.mjs --limit 10
//     node research/run-kenoma.mjs --entity peter-thiel
//
// Sends one request to Forge's POST /hook on this machine. Forge must be
// running (node server.js in C:\Forge, port 8890) with a hook token set:
// FORGE_HOOK_TOKEN in Forge's environment, or hooks.token in its config.json.
// This script reads the same token from FORGE_HOOK_TOKEN, or from
// research/.env (one line: FORGE_HOOK_TOKEN=...), which git ignores.
//
// The turn runs in the background in the "gazette-research" session; open
// Forge's cockpit on that session to watch it, answer any approval, and read
// the final report. Afterwards: node research/review.mjs

import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const limit = Number(opt("--limit", 5));
const entity = opt("--entity", null);
const port = Number(opt("--port", process.env.FORGE_PORT || 8890));

function token() {
  if (process.env.FORGE_HOOK_TOKEN) return process.env.FORGE_HOOK_TOKEN;
  try {
    const line = fs.readFileSync(path.join(ROOT, "research", ".env"), "utf8").split(/\r?\n/).find((l) => l.startsWith("FORGE_HOOK_TOKEN="));
    return line ? line.slice("FORGE_HOOK_TOKEN=".length).trim() : "";
  } catch { return ""; }
}

const t = token();
if (!t) {
  console.error("No hook token. Set FORGE_HOOK_TOKEN, or put FORGE_HOOK_TOKEN=... in research/.env (same value as Forge's hooks.token).");
  process.exit(1);
}

const prompt = entity
  ? `Activate the entity-research skill and research the entity "${entity}" (node research/next.mjs --entity ${entity}). Follow the skill's rules exactly, validate the findings file, and finish with the report.`
  : `Activate the entity-research skill and research the next ${limit} entities (node research/next.mjs --limit ${limit}). Follow the skill's rules exactly, validate each findings file, and finish with the report.`;

const res = await fetch(`http://127.0.0.1:${port}/hook`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${t}` },
  body: JSON.stringify({ event: "entity-research", sessionId: "gazette-research", workspace: ROOT, prompt }),
}).catch((e) => ({ ok: false, status: 0, json: async () => ({ error: `could not reach Forge on port ${port}: ${e.message}` }) }));

const body = await res.json().catch(() => ({}));
if (!res.ok) {
  console.error(`Forge said ${res.status}: ${body.error || "unknown error"}`);
  process.exit(1);
}
console.log(`Kenoma is on it: session "${body.sessionId}", turn ${body.turn}, run ${body.runId}.`);
console.log(`Watch it in the Forge cockpit (http://localhost:${port}), then review with: node research/review.mjs`);
