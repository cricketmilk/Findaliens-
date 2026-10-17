// research/atlas-engine/check-era-headers.mjs
// Guards the atlas index invariant: exactly one era header per era, in order.
//
//     node research/atlas-engine/check-era-headers.mjs
//
// WHY THIS EXISTS. public/atlas.html builds the index with
//     .sort((a, b) => (a.yearStart || 0) - (b.yearStart || 0))
// and emits an <li class="idx-era"> every time d.eraId differs from the previous
// row's. That sort has NO TIEBREAK, so it is a stable sort: dossiers sharing a
// yearStart keep the order they have in public/data/atlas-public.json, which is
// merge order, not era order. Two consequences, both of which have bitten:
//   1. A dossier whose yearStart sorts it outside its own era's contiguous block
//      splits that block and duplicates headers (CB-2010-MACONDO at yearStart 1990).
//   2. Two dossiers in DIFFERENT eras sharing one yearStart duplicate headers
//      whenever merge order interleaves them (CC-1970-MADOFF_2008 in ERA-08 and
//      CC-1995-BARINGS_LEESON_1995 in ERA-09, both at 1992).
// Neither shows up in npm test, the schema, or check-links. It is only visible in
// the rendered page, and a stale browser cache will hide it there too.
//
// This script replicates the page's exact sort against the compiled file and fails
// if any era header would be emitted more than once.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(HERE, '../../public/data/atlas-public.json');

const atlas = JSON.parse(fs.readFileSync(PUBLIC, 'utf8'));

// exactly as public/atlas.html does it
const dossiers = (atlas.dossiers || [])
  .filter((d) => d && d.code && d.tier !== 'LEAD_ANOMALY')
  .sort((a, b) => (a.yearStart || 0) - (b.yearStart || 0));

const emitted = [];
let era = null;
for (const d of dossiers) {
  if (d.eraId && d.eraId !== era) {
    era = d.eraId;
    emitted.push({ era, year: d.yearStart, code: d.code });
  }
}

const counts = new Map();
for (const e of emitted) counts.set(e.era, (counts.get(e.era) || 0) + 1);
const repeated = [...counts.entries()].filter(([, n]) => n > 1);

console.log(`${dossiers.length} dossiers, ${emitted.length} era headers emitted, ${counts.size} distinct eras`);

if (repeated.length === 0) {
  console.log('OK: every era header is emitted exactly once.');
  process.exit(0);
}

console.error('\nFAIL: an era header is emitted more than once.\n');
for (const [eraId, n] of repeated) {
  console.error(`  ${eraId} appears ${n} times, at:`);
  for (const e of emitted.filter((x) => x.era === eraId)) {
    console.error(`    year ${e.year}  ${e.code}`);
  }
}
// show the collisions that cause it
console.error('\nSame-year rows spanning more than one era (merge order decides these):');
const byYear = new Map();
for (const d of dossiers) {
  if (!byYear.has(d.yearStart)) byYear.set(d.yearStart, []);
  byYear.get(d.yearStart).push(d);
}
for (const [year, rows] of byYear) {
  const eras = new Set(rows.map((r) => r.eraId));
  if (eras.size > 1) {
    console.error(`  ${year}: ${rows.map((r) => `${r.code} (${r.eraId})`).join(', ')}`);
  }
}
console.error('\nFix by adjusting a dossier\'s yearStart or eraId so each era stays contiguous.');
process.exit(1);
