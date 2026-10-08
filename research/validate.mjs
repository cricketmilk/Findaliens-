// validate.mjs — check findings files against the schema.
//
//     node research/validate.mjs                      every file in research/findings/
//     node research/validate.mjs research/findings/peter-thiel.json

import path from "node:path";
import { findingFiles, readJson, validateFinding } from "./lib.mjs";

const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : findingFiles();
let bad = 0;
for (const file of files) {
  const data = readJson(file, null);
  const errors = data ? validateFinding(data, file) : ["could not parse JSON"];
  if (errors.length) {
    bad++;
    console.log(`✗ ${path.basename(file)}`);
    for (const e of errors) console.log(`    ${e}`);
  } else {
    const n = (data.facts || []).length + (data.connections || []).length + (data.summary ? 1 : 0);
    console.log(`✓ ${path.basename(file)}  (${n} items)`);
  }
}
if (!files.length) console.log("no findings yet");
process.exit(bad ? 1 : 0);
