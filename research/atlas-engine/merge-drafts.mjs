// research/atlas-engine/merge-drafts.mjs
// Idempotent merge: appends gate-passed dossier drafts + their citations into
// master/atlas.json by STRING SPLICING at the array boundaries (no re-serialization
// of the existing file). REPLACE-ON-REMERGE (2026-10-15): the original append-only
// splice duplicated CC-1849-ESTATES when a DONE node was re-harvested and re-merged.
// A draft whose code already exists in master now REPLACES it: the stale entry and
// its superseded or orphaned citations are cut byte-exact first, so re-running the
// merge on the same draft is a byte-identical no-op.
// Usage: node research/atlas-engine/merge-drafts.mjs draft1.json draft2.json ...

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MASTER = path.join(HERE, 'master', 'atlas.json');

const draftPaths = process.argv.slice(2);
if (draftPaths.length === 0) {
  console.error('usage: merge-drafts.mjs <draft.json> [...]');
  process.exit(1);
}

// CRLF: git is configured core.autocrlf=true on Windows, so master/atlas.json is LF
// in the index and CRLF in the working tree. Every anchor and every cut target below
// is written with \n, so a CRLF checkout matches none of them and the merge dies on
// "citations array anchor not found" (or, worse, on a cut that silently finds nothing).
// Normalize on read and write LF back: that is what the index already holds, so it
// produces no diff of its own.
let master = fs.readFileSync(MASTER, 'utf8').replace(/\r\n/g, '\n');

const indent = (json2spaced) => json2spaced.split('\n').map((l) => (l.length ? '  ' + l : l)).join('\n');

const newCitationBlocks = [];
const newDossierBlocks = [];
const drafts = []; // { path, dossier, citations } — for the replace-on-remerge pass

for (const p of draftPaths) {
  const draft = JSON.parse(fs.readFileSync(p, 'utf8'));
  const { citations, ...dossier } = draft;
  if (!Array.isArray(citations) || citations.length === 0) {
    throw new Error(`${p}: draft has no citations — did it pass the gate?`);
  }
  drafts.push({ path: p, dossier, citations });
  // citation must have exactly the 5 master fields
  for (const c of citations) {
    newCitationBlocks.push(indent(JSON.stringify({
      id: c.id, tier: c.tier, title: c.title, url: c.url, quoteOrFact: c.quoteOrFact
    }, null, 2)));
  }
  newDossierBlocks.push(indent(JSON.stringify(dossier, null, 2)));
}

// --- replace-on-remerge: cut stale entries + their superseded/orphaned citations ---
// A citation is cut when the incoming drafts re-cite its id (the append re-adds the
// fresh block below) or when no OTHER dossier references it (orphaned by the
// replacement). Faithfulness gate: every cut target must be re-derivable byte-exact
// by this script's own serializer — anything hand-formatted or absent aborts the
// merge before the file is touched.
const cutBlock = (label, txt) => {
  const withComma = ',\n    ' + txt;
  const at = master.indexOf(withComma);
  if (at >= 0) {
    master = master.slice(0, at) + master.slice(at + withComma.length);
    return;
  }
  const firstItem = '\n    ' + txt + ','; // first item in an array: no leading comma
  const atFirst = master.indexOf(firstItem);
  if (atFirst < 0) throw new Error(`REPLACE-ON-REMERGE FAIL (${label}): existing block not found byte-exact`);
  master = master.slice(0, atFirst) + master.slice(atFirst + firstItem.length);
};
const parsedMaster = JSON.parse(master);
const incomingIds = new Set(drafts.flatMap((x) => x.citations.map((c) => c.id)));
for (const { dossier } of drafts) {
  const existing = parsedMaster.dossiers.find((d) => d.code === dossier.code);
  if (!existing) continue;
  console.log(`remerge: replacing existing ${dossier.code} entry (and superseded/orphaned citations)`);
  for (const id of existing.citationIds || []) {
    const otherRefs = parsedMaster.dossiers.filter((d) => d !== existing && (d.citationIds || []).includes(id));
    if (!incomingIds.has(id) && otherRefs.length > 0) continue; // still cited elsewhere: keep
    for (const c of parsedMaster.citations.filter((x) => x.id === id)) {
      cutBlock(`citation ${id}`, indent(JSON.stringify({
        id: c.id, tier: c.tier, title: c.title, url: c.url, quoteOrFact: c.quoteOrFact
      }, null, 2)));
    }
  }
  cutBlock(`dossier ${dossier.code}`, indent(JSON.stringify(existing, null, 2)));
}

// --- splice citations: before the end of the top-level "citations" array ---
const citAnchor = '\n  ],\n  "dossiers": [';
if (!master.includes(citAnchor)) throw new Error('citations array anchor not found');
master = master.replace(
  citAnchor,
  ',\n    ' + newCitationBlocks.join(',\n    ') + '\n  ],\n  "dossiers": ['
);

// --- splice dossiers: before the end of the top-level "dossiers" array ---
const dosAnchor = '\n  ],\n  "entities": [';
if (!master.includes(dosAnchor)) throw new Error('dossiers array anchor not found');
master = master.replace(
  dosAnchor,
  ',\n    ' + newDossierBlocks.join(',\n    ') + '\n  ],\n  "entities": ['
);

// sanity: parse the result before writing
const parsed = JSON.parse(master);

fs.writeFileSync(MASTER, master, 'utf8');
console.log(`merged ${draftPaths.length} dossiers, ${newCitationBlocks.length} citations`);
console.log(`totals: dossiers=${parsed.dossiers.length} citations=${parsed.citations.length}`);
