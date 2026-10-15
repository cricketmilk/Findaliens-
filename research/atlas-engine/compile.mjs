// research/atlas-engine/compile.mjs
// Compiles research/atlas-engine/master/atlas.json into:
//   1. public/data/atlas-public.json (filtered public slice: strips LEAD_ANOMALY and OPEN items) — always
//   2. Exact regex surgical replacement of `const nodes = [...]; const lineages = [...];` in public/crash-conduits.html — only with legacySurgery (see below)
//   3. Exact regeneration of `financialEngineeringNodes` and `auditedLegacyNodes` in public/js/crash-finance-data.js — only with legacySurgery (see below)
// Preserves 100% compatibility with research/build-branch-index.mjs and existing node --test suites.
//
// LEGACY SURGERY IS GATED (default OFF). crash-conduits.test.mjs pins the page contract:
//   - data.nodes.length === 86 (68 inline + 18 additions), unique ids, a numeric `year` on EVERY node
//   - crash-finance-data.js loads as a CLASSIC script (plain <script src>, vm eval) — `export` is a SyntaxError there
// The inline nodes carry `id` (tulip-1636), never `code`, so a bare dossier merge would append 84
// atlas-shaped nodes ON TOP OF the 68 originals (duplicate events, overridden `sources`) and fail
// tests 35/36/56. Run `--legacy-surgery` only after the additions dataset and the test contract
// move onto the atlas shape. atlas-public.json is the Phase 1 deliverable (Phase 3 atlas-ui consumes it).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateAtlas, isPublicRenderable } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

// LOAD-BEARING REGEX required by research/build-branch-index.mjs:
export const INLINE_ATLAS_REGEX = /const\s+nodes\s*=\s*(\[[\s\S]*?\]);\s*const\s+lineages\s*=\s*(\[[\s\S]*?\]);/;

export function compileAtlas({
  masterPath = path.join(__dirname, 'master/atlas.json'),
  publicJsonPath = path.join(REPO_ROOT, 'public/data/atlas-public.json'),
  crashConduitsHtmlPath = path.join(REPO_ROOT, 'public/crash-conduits.html'),
  crashFinanceDataJsPath = path.join(REPO_ROOT, 'public/js/crash-finance-data.js'),
  dryRun = false,
  legacySurgery = false
} = {}) {
  const rawMaster = fs.readFileSync(masterPath, 'utf8');
  const atlas = JSON.parse(rawMaster);

  // 1. Validate against strict schema before touching anything in public/
  validateAtlas(atlas);

  // 2. Filter out LEAD_ANOMALY citations and dossiers (Hard Rule 1 & 2)
  const publicCitationMap = new Map(
    atlas.citations.filter(isPublicRenderable).map((c) => [c.id, c])
  );

  const publicDossiers = atlas.dossiers
    .filter(isPublicRenderable)
    .map((d) => ({
      ...d,
      citations: d.citationIds
        .map((id) => publicCitationMap.get(id))
        .filter(Boolean),
      pairedEvent:
        atlas.pairedEvents.find(
          (p) => p.crashConduitCode === d.code || p.deepStateCode === d.code
        ) || null,
      bridges: atlas.bridges.filter((b) => b.fromDossier === d.code)
    }));

  // 3. Build legacy-compatible `nodes` and `lineages` arrays for crash-conduits.html
  // Preserves existing inline nodes if present, merging/updating master dossiers by code/id.
  let existingInlineNodes = [];
  let existingInlineLineages = [];

  if (fs.existsSync(crashConduitsHtmlPath)) {
    const htmlContent = fs.readFileSync(crashConduitsHtmlPath, 'utf8');
    const match = htmlContent.match(INLINE_ATLAS_REGEX);
    if (match) {
      try {
        existingInlineNodes = Function(`"use strict"; return (${match[1]});`)();
        existingInlineLineages = Function(`"use strict"; return (${match[2]});`)();
      } catch {
        // Fallback to JSON.parse if strict JSON
        try {
          existingInlineNodes = JSON.parse(match[1]);
          existingInlineLineages = JSON.parse(match[2]);
        } catch {
          existingInlineNodes = [];
          existingInlineLineages = [];
        }
      }
    }
  }

  const compiledNodesMap = new Map();
  for (const existingNode of existingInlineNodes) {
    const key = existingNode.id || existingNode.code || existingNode.title;
    compiledNodesMap.set(key, existingNode);
  }

  for (const d of publicDossiers) {
    const existing = compiledNodesMap.get(d.code) || {};
    compiledNodesMap.set(d.code, {
      ...existing,
      id: existing.id || d.code,
      code: d.code,
      eraId: d.eraId,
      year: existing.year || d.yearStart,
      yearStart: d.yearStart,
      yearEnd: d.yearEnd,
      title: d.title,
      primaryTab: d.primaryTab,
      secondaryTabs: d.secondaryTabs,
      mechanism: d.mechanism,
      tier: d.tier,
      auditDisposition: d.auditDisposition,
      participants: d.participants,
      extractionLoop: d.extractionLoop,
      closedLoopRatchet: d.closedLoopRatchet,
      decoyVsLedger: d.decoyVsLedger,
      pairedEvent: d.pairedEvent,
      bridges: d.bridges,
      sources: d.citations.map((c) => ({
        id: c.id,
        tier: c.tier,
        label: c.title,
        url: c.url,
        note: c.quoteOrFact
      }))
    });
  }

  const mergedNodes = Array.from(compiledNodesMap.values()).sort(
    (a, b) => (a.yearStart ?? a.year ?? 0) - (b.yearStart ?? b.year ?? 0)
  );

  const lineageMap = new Map();
  for (const l of existingInlineLineages) {
    lineageMap.set(l.id || l.name, l);
  }
  for (const l of atlas.lineages) {
    lineageMap.set(l.id, l);
  }
  const mergedLineages = Array.from(lineageMap.values());

  // 4. Write public/data/atlas-public.json (all 5 tabs slice from this)
  const publicSlice = {
    version: atlas.version,
    generatedAt: atlas.generatedAt,
    mechanisms: atlas.mechanisms,
    eras: atlas.eras,
    dossiers: publicDossiers,
    lineages: mergedLineages,
    pairedEvents: atlas.pairedEvents,
    bridges: atlas.bridges,
    tabs: {
      'crash-conduits': publicDossiers.filter(
        (d) => d.primaryTab === 'crash-conduits' || d.secondaryTabs?.includes('crash-conduits')
      ),
      'deep-state': publicDossiers.filter(
        (d) => d.primaryTab === 'deep-state' || d.secondaryTabs?.includes('deep-state')
      ),
      'carbon-class': publicDossiers.filter(
        (d) => d.primaryTab === 'carbon-class' || d.secondaryTabs?.includes('carbon-class')
      ),
      transhumanism: publicDossiers.filter(
        (d) => d.primaryTab === 'transhumanism' || d.secondaryTabs?.includes('transhumanism')
      ),
      consent: publicDossiers.filter(
        (d) => d.primaryTab === 'consent' || d.secondaryTabs?.includes('consent')
      )
    }
  };

  if (!dryRun) {
    fs.mkdirSync(path.dirname(publicJsonPath), { recursive: true });
    fs.writeFileSync(publicJsonPath, JSON.stringify(publicSlice, null, 2) + '\n', 'utf8');
  }

  // 5. Surgical replacement in public/crash-conduits.html preserving exact regex boundaries.
  //    GATED on legacySurgery — the test contract pins the inline block (see header note).
  if (legacySurgery) {
    const replacementBlock =
      `const nodes = ${JSON.stringify(mergedNodes, null, 2)};\n` +
      `const lineages = ${JSON.stringify(mergedLineages, null, 2)};`;

    // Verify our generated block matches the load-bearing regex before writing
    if (!INLINE_ATLAS_REGEX.test(replacementBlock)) {
      throw new Error('[compile] Generated nodes/lineages block failed INLINE_ATLAS_REGEX self-check.');
    }

    if (!dryRun && fs.existsSync(crashConduitsHtmlPath)) {
      const html = fs.readFileSync(crashConduitsHtmlPath, 'utf8');
      if (!INLINE_ATLAS_REGEX.test(html)) {
        throw new Error(
          `[compile] Could not locate load-bearing INLINE_ATLAS_REGEX in ${crashConduitsHtmlPath}`
        );
      }
      const updatedHtml = html.replace(INLINE_ATLAS_REGEX, () => replacementBlock);
      fs.writeFileSync(crashConduitsHtmlPath, updatedHtml, 'utf8');
    }
  }

  // 6. Regenerate financialEngineeringNodes and auditedLegacyNodes in public/js/crash-finance-data.js.
  //    GATED on legacySurgery — that file is a hand-curated CLASSIC script: the page loads it via a
  //    plain <script src> and the test evaluates it in a vm; `export` breaks both (see header note).
  if (legacySurgery) {
    const financialEngineeringNodes = mergedNodes.filter(
      (n) => !n.auditDisposition || n.auditDisposition === 'PROVEN' || n.auditDisposition === 'DOCUMENTED'
    );
    const auditedLegacyNodes = mergedNodes.filter(
      (n) => Boolean(n.auditDisposition)
    );

    const crashFinanceJsSource = [
      '// public/js/crash-finance-data.js',
      '// AUTO-GENERATED BY research/atlas-engine/compile.mjs — DO NOT HAND-EDIT.',
      `export const financialEngineeringNodes = ${JSON.stringify(financialEngineeringNodes, null, 2)};`,
      '',
      `export const auditedLegacyNodes = ${JSON.stringify(auditedLegacyNodes, null, 2)};`,
      ''
    ].join('\n');

    if (!dryRun && fs.existsSync( path.dirname(crashFinanceDataJsPath) )) {
      fs.writeFileSync(crashFinanceDataJsPath, crashFinanceJsSource, 'utf8');
    }
  }

  return {
    dossiersCompiled: publicDossiers.length,
    nodesMerged: mergedNodes.length,
    lineagesMerged: mergedLineages.length
  };
}

// Portable main guard (see migrate.mjs): the raw file:// compare never matches on
// Windows paths, so resolve both sides instead.
if (path.resolve(process.argv[1]) === __filename) {
  const dryRun = process.argv.includes('--dry-run');
  const legacySurgery = process.argv.includes('--legacy-surgery');
  const stats = compileAtlas({ dryRun, legacySurgery });
  console.log(
    `[compile] OK (${dryRun ? 'dry-run' : 'written'}, ` +
    `legacy surgery ${legacySurgery ? 'ON' : 'OFF — crash-conduits.html and crash-finance-data.js untouched'}): ` +
    `${stats.dossiersCompiled} public dossiers, ${stats.nodesMerged} merged nodes, ${stats.lineagesMerged} lineages.`
  );
}
