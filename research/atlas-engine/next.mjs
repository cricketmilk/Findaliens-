// research/atlas-engine/next.mjs
// Zero-context CLI driver that inspects research/atlas-engine/nodes.manifest.json
// and research/atlas-engine/master/atlas.json, then prints the next incomplete node,
// its exact CLI ingestion command, its 3-Agent verification command, and completion checklist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getNextIncompleteNode() {
  const manifestPath = path.join(__dirname, 'nodes.manifest.json');
  const masterPath = path.join(__dirname, 'master/atlas.json');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
  const completedCodes = new Set(master.dossiers.map((d) => d.code));

  const pending = manifest.plannedQueue.find(
    (item) => item.status !== 'DONE' && !completedCodes.has(item.code)
  );

  return {
    pending,
    completedCount: completedCodes.size,
    totalPlanned: manifest.plannedQueue.length
  };
}

// Portable main guard (see migrate.mjs): the raw file:// compare never matches on
// Windows paths (the repo path contains a space), so resolve both sides instead.
if (path.resolve(process.argv[1]) === __filename) {
  const { pending, completedCount, totalPlanned } = getNextIncompleteNode();

  console.log(`=== THE CORNFIELD GAZETTE · ATLAS ENGINE PROGRESS (${completedCount}/${totalPlanned} DOSSIERS COMPLETE) ===`);
  if (!pending) {
    console.log('ALL PLANNED DOSSIERS COMPLETE. Run `node research/atlas-engine/compile.mjs` and `node research/check-links.mjs`.');
    process.exit(0);
  }

  const yearMatch = pending.code.match(/\d{4}/);
  const year = yearMatch ? yearMatch[0] : 1912;
  const providers = (pending.providers || ['courtlistener', 'govinfo']).join(',');

  console.log(`\nNEXT INCOMPLETE NODE: ${pending.code} (Era: ${pending.era})`);
  console.log('\nSTEP 1 — HARVEST PRIMARY SOURCES:');
  // pending.topic is the human-readable search string (manifest carries it per node);
  // fall back to the dossier code if a manifest entry predates the topic field.
  console.log(`  node research/ingest/ingest.mjs --topic "${pending.topic || pending.code}" --year ${year} --providers ${providers}`);
  console.log('\nSTEP 2 — RUN 3-AGENT ADVERSARIAL AUDIT:');
  console.log(`  node research/verify/runner.mjs --print`);
  console.log('\nSTEP 3 — COMPILE & RUN ACCEPTANCE GATES:');
  console.log(`  node research/atlas-engine/compile.mjs`);
  console.log(`  node --test crash-conduits.test.mjs research/audit-crash.test.mjs from-trove.test.mjs`);
  console.log(`  node research/check-links.mjs`);
  console.log('\nCHECKLIST FOR THIS NODE:');
  console.log('  [ ] 5-Stage extractionLoop populated (Skim -> Compromise -> Fog -> Monopoly -> Mersey Fix)');
  console.log('  [ ] closedLoopRatchet populated (Inherited Precedent -> New Framework -> Recirculation -> Next Dossier)');
  console.log('  [ ] decoyVsLedger populated (Viral Decoy refuted by primary citation)');
  console.log('  [ ] Zero unresolved {VERIFY} tokens or LEAD_ANOMALY claims in public output');
}