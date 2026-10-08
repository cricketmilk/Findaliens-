// validate-handoffs.mjs — check handoff records and show the grade each would earn.
//
//     node research/validate-handoffs.mjs                       every file in research/handoffs/
//     node research/validate-handoffs.mjs path/to/record.json

import path from "node:path";
import { handoffFiles, readHandoff, validateHandoff, grade, gap } from "./handoff-lib.mjs";

const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : handoffFiles();
let bad = 0;
for (const file of files) {
  const h = readHandoff(file);
  const errors = h ? validateHandoff(h, file) : ["could not parse JSON"];
  if (errors.length) {
    bad++;
    console.log(`✗ ${path.basename(file)}`);
    for (const e of errors) console.log(`    ${e}`);
    continue;
  }
  const g = gap(h);
  const gapText = g ? `${g.days >= 0 ? "+" : ""}${g.days} days (${g.precision} precision)` : "n/a";
  console.log(`✓ ${path.basename(file)}  grade ${grade(h.links)} if all links are approved · gap ${gapText} · ${h.links.length} links, ${(h.claims || []).length} claims examined`);
}
if (!files.length) console.log("no handoff records yet");
process.exit(bad ? 1 : 0);
