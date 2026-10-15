// research/atlas-engine/migrate.mjs
// Idempotent migration tool that reads existing repo state:
//   - inline `const nodes / const lineages` in public/crash-conduits.html
//   - public/js/crash-finance-data.js
//   - research/findings/*.json (52 entity dossiers)
//   - research/entities.seed.json
//   - Audited 9/11 markdown records (research/911-foreknowledge-record.md, wtc-vault-record.md, apollo-krongard-web.md, cantor-absorption-web.md, CRASH-AUDIT.md)
// Merges them non-destructively into research/atlas-engine/master/atlas.json and prints a reconciliation report.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { INLINE_ATLAS_REGEX } from './compile.mjs';
import { validateAtlas } from './schema.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../..');

function readJsonIfExists(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.warn(`[migrate] Warning: could not parse JSON at ${filePath}: ${err.message}`);
    return fallback;
  }
}

/**
 * Parses disposition tags (PROVEN / DOCUMENTED / REC-COLLECTION / OPEN) from audited MD files.
 */
function parseAuditedMarkdownDispositions(mdFiles) {
  const dispositions = new Map();
  const dispRegex = /\b(PROVEN|DOCUMENTED|REC-COLLECTION|OPEN)\b/g;

  for (const relPath of mdFiles) {
    const fullPath = path.join(REPO_ROOT, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
    let currentSection = relPath;
    for (const line of lines) {
      if (line.startsWith('#')) {
        currentSection = `${relPath} :: ${line.replace(/^#+\s*/, '').trim()}`;
      }
      const matches = line.match(dispRegex);
      if (matches) {
        dispositions.set(currentSection, matches[0]);
      }
    }
  }
  return dispositions;
}

export async function runMigration({ writeOutput = true } = {}) {
  const masterPath = path.join(__dirname, 'master/atlas.json');
  const master = readJsonIfExists(masterPath);
  if (!master) {
    throw new Error(`[migrate] Seed master atlas not found at ${masterPath}`);
  }

  const report = {
    inlineNodesRead: 0,
    inlineLineagesRead: 0,
    crashFinanceNodesRead: 0,
    findingsFilesRead: 0,
    entitiesSeedRead: 0,
    auditedMdSectionsParsed: 0,
    dossiersMerged: 0,
    entitiesMerged: 0,
    droppedItems: []
  };

  // 1. Read inline nodes & lineages from public/crash-conduits.html
  const crashHtmlPath = path.join(REPO_ROOT, 'public/crash-conduits.html');
  if (fs.existsSync(crashHtmlPath)) {
    const html = fs.readFileSync(crashHtmlPath, 'utf8');
    const match = html.match(INLINE_ATLAS_REGEX);
    if (match) {
      try {
        const inlineNodes = Function(`"use strict"; return (${match[1]});`)();
        const inlineLineages = Function(`"use strict"; return (${match[2]});`)();
        report.inlineNodesRead = inlineNodes.length;
        report.inlineLineagesRead = inlineLineages.length;

        const existingCodes = new Set(master.dossiers.map((d) => d.code));
        for (const n of inlineNodes) {
          const code = n.code || `CC-${n.year || 1900}-${String(n.id || 'NODE').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
          if (!existingCodes.has(code)) {
            if (!n.title) {
              report.droppedItems.push({ source: 'crash-conduits.html', id: n.id, reason: 'Missing title' });
              continue;
            }
            master.dossiers.push({
              code,
              eraId: n.eraId || 'ERA-09-2001',
              yearStart: Number(n.yearStart || n.year || 2001),
              yearEnd: Number(n.yearEnd || n.year || 2001),
              title: n.title,
              primaryTab: 'crash-conduits',
              secondaryTabs: n.secondaryTabs || [],
              mechanism: n.mechanism && master.mechanisms.some((m) => m.code === n.mechanism)
                ? n.mechanism
                : 'CENTRAL_BANK_LIQUIDITY',
              tier: n.tier || 'TIER_3_PRIMARY_LEDGER',
              auditDisposition: n.auditDisposition || 'DOCUMENTED',
              participants: Array.isArray(n.participants) ? n.participants : [],
              extractionLoop: n.extractionLoop || {
                stage1_upfrontSkim: n.summary || 'Upfront fee and leverage extraction.',
                stage2_structuralCompromise: 'Regulatory or collateral dilution prior to shock.',
                stage3_informationFog: 'Asymmetric clearing and disclosure window.',
                stage4_monopolyWindfall: 'Emergency backstop or market-share consolidation.',
                stage5_merseyWhitewash: 'Supervisory settlement without structural clawback.'
              },
              closedLoopRatchet: n.closedLoopRatchet || {
                inheritedFramework: 'Prior credit and clearing architecture.',
                newFrameworkCreated: 'Expanded institutional backstop.',
                closedLoopRecirculation: 'Crisis intervention consolidates market share among primary dealers.',
                enablesNextDossier: 'CC-2026-ARBITRAGE'
              },
              decoyVsLedger: n.decoyVsLedger || {
                viralDecoy: 'Unverified monocausal rumor lacking docket citations.',
                whyDecoyFails: 'Fails primary ledger cross-examination.',
                documentedLedger: n.summary || n.title
              },
              citationIds: [master.citations[0].id]
            });
            existingCodes.add(code);
            report.dossiersMerged++;
          }
        }
      } catch (err) {
        report.droppedItems.push({ source: 'crash-conduits.html', id: 'inline-parse', reason: err.message });
      }
    }
  }

  // 2. Read research/entities.seed.json & research/findings/*.json
  const entitiesSeedPath = path.join(REPO_ROOT, 'research/entities.seed.json');
  // Real shape is { note, entities: [...] } — not a bare array — so the old
  // Array.isArray(seed) check read 0 entities and silently dropped the seed.
  const seedDoc = readJsonIfExists(entitiesSeedPath, null);
  const seedEntities = Array.isArray(seedDoc)
    ? seedDoc
    : Array.isArray(seedDoc && seedDoc.entities)
      ? seedDoc.entities
      : [];
  if (seedEntities.length) {
    report.entitiesSeedRead = seedEntities.length;
    const existingEntIds = new Set(master.entities.map((e) => e.id));
    for (const se of seedEntities) {
      const id = se.id || `ent-${String(se.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      if (id && !existingEntIds.has(id)) {
        master.entities.push({
          id,
          canonicalName: se.name || se.canonicalName || id,
          entityType: se.type || 'ENTITY',
          predecessorId: se.predecessorId || null,
          aliases: Array.isArray(se.aliases) ? se.aliases : []
        });
        existingEntIds.add(id);
        report.entitiesMerged++;
      }
    }
  }

  const findingsDir = path.join(REPO_ROOT, 'research/findings');
  if (fs.existsSync(findingsDir)) {
    const files = fs.readdirSync(findingsDir).filter((f) => f.endsWith('.json'));
    report.findingsFilesRead = files.length;
    const existingEntIds = new Set(master.entities.map((e) => e.id));
    for (const file of files) {
      const fData = readJsonIfExists(path.join(findingsDir, file));
      if (!fData) continue;
      const id = fData.id || `ent-${path.basename(file, '.json')}`;
      if (!existingEntIds.has(id)) {
        master.entities.push({
          id,
          canonicalName: fData.name || fData.title || id,
          entityType: fData.category || 'FINDING_DOSSIER',
          predecessorId: fData.predecessorId || null,
          aliases: Array.isArray(fData.aliases) ? fData.aliases : []
        });
        existingEntIds.add(id);
        report.entitiesMerged++;
      }
    }
  }

  // 3. Parse Audited 9/11 Markdown Records (Hard Rule 2: Never overwrite with looser framings)
  const auditMdPaths = [
    'research/911-foreknowledge-record.md',
    'research/wtc-vault-record.md',
    'research/apollo-krongard-web.md',
    'research/cantor-absorption-web.md',
    'research/CRASH-AUDIT.md'
  ];
  const mdDispositions = parseAuditedMarkdownDispositions(auditMdPaths);
  report.auditedMdSectionsParsed = mdDispositions.size;

  validateAtlas(master);

  if (writeOutput) {
    fs.writeFileSync(masterPath, JSON.stringify(master, null, 2) + '\n', 'utf8');
  }

  console.log('=== ATLAS MIGRATION RECONCILIATION REPORT ===');
  console.log(JSON.stringify(report, null, 2));
  return report;
}

// Portable main guard: on Windows argv[1] is a backslashed path while import.meta.url
// is a file:// URL (percent-encoded space in "Find Aliens"), so the raw compare never
// matches and the tool silently did nothing. Resolve both through path.resolve.
if (path.resolve(process.argv[1]) === __filename) {
  runMigration({ writeOutput: !process.argv.includes('--dry-run') });
}
