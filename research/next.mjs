// next.mjs — which entities to research next, with what the site already says.
//
//     node research/next.mjs              the next 5
//     node research/next.mjs --limit 10
//     node research/next.mjs --entity peter-thiel
//
// Priority: entities on the most pages first, then the most mentions. An
// entity with a findings file is done unless --entity names it.

import fs from "node:fs";
import path from "node:path";
import { ENTITIES, FINDINGS, readJson } from "./lib.mjs";

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const limit = Number(opt("--limit", 5));
const only = opt("--entity", null);

const index = readJson(ENTITIES, null);
if (!index) {
  console.error("public/data/entities.json is missing; run node research/extract-entities.mjs first");
  process.exit(1);
}
const byId = new Map(index.entities.map((e) => [e.id, e]));
const done = (id) => fs.existsSync(path.join(FINDINGS, id + ".json"));

const picks = only
  ? [byId.get(only)].filter(Boolean)
  : index.entities.filter((e) => !done(e.id) && e.type !== "government").slice(0, limit);

if (!picks.length) {
  console.log(only ? `no entity with id "${only}"` : "every entity has a findings file");
  process.exit(0);
}

const together = new Map();
for (const p of index.together) {
  for (const [x, y] of [[p.a, p.b], [p.b, p.a]]) {
    if (!together.has(x)) together.set(x, []);
    together.get(x).push({ id: y, n: p.items.length });
  }
}

for (const e of picks) {
  console.log(`\n=== ${e.name}  [id: ${e.id}]  type: ${e.type}`);
  if (e.aliases.length) console.log(`aliases: ${e.aliases.join(", ")}`);
  console.log(`on ${e.pages.length} page(s): ${e.pages.map((p) => index.pages[p].title).join(", ")}`);
  console.log("what the site says (entries that mention it):");
  for (const m of e.mentions.slice(0, 12)) console.log(`  - ${m.title}  (public/${m.href})`);
  if (e.mentions.length > 12) console.log(`  … and ${e.mentions.length - 12} more`);
  if (e.affiliations.length) console.log(`listed affiliations: ${e.affiliations.map((id) => byId.get(id)?.name || id).join(", ")}`);
  const near = (together.get(e.id) || []).sort((a, b) => b.n - a.n).slice(0, 10)
    .map((t) => `${byId.get(t.id)?.name || t.id} [${t.id}]`);
  if (near.length) console.log(`mentioned alongside: ${near.join(", ")}`);
  console.log(`write findings to: research/findings/${e.id}.json`);
}
