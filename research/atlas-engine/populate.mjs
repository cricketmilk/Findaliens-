// research/atlas-engine/populate.mjs
// Autonomous per-node populate driver for the atlas-engine loop.
//
//   node research/atlas-engine/populate.mjs                # all PENDING: harvest -> auto-vet -> spec-emit
//   node research/atlas-engine/populate.mjs --node CODE    # one node
//   node research/atlas-engine/populate.mjs --status       # just report states
//   node research/atlas-engine/populate.mjs --finish       # for each HARVESTED node with a gate-
//                                                          # passing draft in drafts/: merge -> compile -> flip DONE
//
// Status machine: PENDING -> HARVESTED (spec emitted, awaiting draft) -> DONE
//                 PENDING -> BLOCKED:<reason> (0 vetted citations; re-mine with new query variants)
// The auto-vet layer encodes the operator relevance rules proven in the 2026-10-14 batch
// (govinfo/usaspending need AND-semantics on strong tokens; wikidata needs real labels;
// {VERIFY} URLs never reach a spec). It is deliberately CONSERVATIVE: a full-text match
// whose tokens do not surface in the row's own title/quote is excluded.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { ingestTopic } from '../ingest/ingest.mjs';
import { enforceForensicGate } from '../verify/runner.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST = path.join(HERE, 'nodes.manifest.json');
const DRAFTS = path.join(HERE, 'drafts');
const MECHANISM_CODES = [
  'CENTRAL_BANK_LIQUIDITY', 'LEVERAGED_WATERED_CAPITAL', 'DERIVATIVE_CLEARING_CAPTURE',
  'OFFSHORE_BLACK_LEDGER', 'SOVEREIGN_DEBT_TRAP', 'REGULATORY_REVOLVING_DOOR',
  'RECEIVERSHIP_MORGANIZATION', 'COST_PLUS_RECONSTRUCTION', 'PATENT_CHOKE_POINT',
  'MERSEY_LIABILITY_WHITEWASH'
];
const CONDUIT_TABS = ['crash-conduits', 'deep-state', 'carbon-class', 'transhumanism', 'consent'];
const TAB_BY_PREFIX = { CC: 'crash-conduits', DS: 'deep-state', CB: 'carbon-class', PH: 'transhumanism', MC: 'consent' };
const TIER_RANK = { TIER_1_STATUTE_COURT: 1, TIER_2_INQUIRY: 2, TIER_3_PRIMARY_LEDGER: 3, TIER_4_CONTEMPORARY_PRESS: 4 };
const MAX_CITATIONS = 8;

// ---------- auto-vet ----------
const hasAll = (text, tokens) => tokens.every((t) => text.includes(t.toLowerCase()));
const weakHits = (text, tokens) => tokens.filter((t) => text.includes(t.toLowerCase())).length;
const isBareQid = (title) => /^Corporate Lineage Entity: Q\d+ \(Q\d+\)/.test(title);

function vetCitation(cit, query, provider) {
  if (typeof cit.url === 'string' && cit.url.includes('{VERIFY:')) return false;
  const strong = query.strong && query.strong.length ? query.strong : query.q.split(/\s+/);
  const weak = query.weak || [];
  const text = `${cit.title || ''} ${cit.quoteOrFact || ''}`.toLowerCase();
  switch (provider) {
    case 'wikidata':
      return hasAll(text, strong) && !isBareQid(cit.title || '');
    case 'courtlistener':
    case 'loc':
      return hasAll(text, strong) || weakHits(text, weak) >= 2;
    default:
      // usaspending, govinfo, edgar, opencorporates, hansard: AND-semantics on strong tokens
      return hasAll(text, strong);
  }
}

// ---------- harvest ----------
async function harvestNode(node) {
  const queries = node.queries && node.queries.length
    ? node.queries
    : [{ q: node.topic, year: null, strong: [], weak: [] }];
  const vetted = new Map(); // id -> citation
  const dropped = [];
  for (const q of queries) {
    const providers = q.providers || node.providers;
    let rows = [];
    try {
      rows = await ingestTopic({ topic: q.q, year: q.year ?? undefined, providerNames: providers, offline: false });
    } catch (e) {
      console.warn(`  [warn] ingest failed for "${q.q}" (${providers}): ${e.message}`);
      continue;
    }
    for (const cit of rows) {
      if (vetCitation(cit, q, cit.provider || providers[0])) {
        if (!vetted.has(cit.id)) vetted.set(cit.id, cit);
      } else {
        dropped.push(`${cit.id} (${cit.provider || providers[0]})`);
      }
    }
  }
  // tier-priority, stable order
  const capped = [...vetted.values()]
    .sort((a, b) => (TIER_RANK[a.tier] || 9) - (TIER_RANK[b.tier] || 9))
    .slice(0, MAX_CITATIONS);
  return { capped, dropped };
}

// ---------- spec emit ----------
function tierOf(capped) {
  const best = capped.map((c) => TIER_RANK[c.tier] || 9).sort((a, b) => a - b)[0];
  return Object.entries(TIER_RANK).find(([, r]) => r === best)?.[0] || 'TIER_3_PRIMARY_LEDGER';
}

function emitSpec(node, capped) {
  const years = (node.queries || []).map((q) => q.year).filter((y) => typeof y === 'number');
  const yearStart = years.length ? Math.min(...years) : Number(node.code.slice(3, 7));
  const yearEnd = years.length ? Math.max(...years) : yearStart;
  const prefix = node.code.slice(0, 2);
  const primaryTab = TAB_BY_PREFIX[prefix] || 'crash-conduits';
  const secondaryOptions = CONDUIT_TABS.filter((t) => t !== primaryTab);
  const mechanism = node.mechanism
    ? `"${node.mechanism}"`
    : `choose the best fit from [${MECHANISM_CODES.join(', ')}]`;
  const anchors = (node.anchors && node.anchors.length)
    ? node.anchors.map((a) => `- ${a}`).join('\n')
    : '- No anchors provided — draw only on the citations and history you are certain of. Be conservative with case outcomes, numbers and attributions ("asserted", "litigated", "alleged").';

  const citationsJson = JSON.stringify(
    capped.map(({ id, tier, title, url, quoteOrFact }) => ({ id, tier, title, url, quoteOrFact })),
    null, 2
  ).split('\n').map((l) => (l.length ? '  ' + l : l)).join('\n').trim();

  const spec = `# NODE SPEC: ${node.code}

## Fixed fields (use exactly)
- code: "${node.code}"
- eraId: "${node.era}"
- yearStart: ${yearStart}, yearEnd: ${yearEnd}
- primaryTab: "${primaryTab}"
- secondaryTabs: pick 1-2 from [${secondaryOptions.map((t) => `"${t}"`).join(', ')}]
- mechanism: ${mechanism}
- tier: "${tierOf(capped)}"
- auditDisposition: "DOCUMENTED"

## Historical anchors (established facts you may use)
${anchors}

## Citations (reproduce ALL verbatim, byte-identical)
${citationsJson}
`;
  const file = path.join(DRAFTS, `spec-${node.code}.md`);
  fs.writeFileSync(file, spec, 'utf8');
  return file;
}

// ---------- CLI ----------
const args = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const queue = manifest.plannedQueue;

function saveManifest() {
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

const statusOnly = args.includes('--status');
const finish = args.includes('--finish');
const nodeArg = args.includes('--node') ? args[args.indexOf('--node') + 1] : null;
fs.mkdirSync(DRAFTS, { recursive: true });

if (statusOnly) {
  for (const n of queue) console.log(`${n.status.padEnd(18)} ${n.code}${n.status.startsWith('BLOCKED') ? '  ' + n.status : ''}`);
  process.exit(0);
}

if (finish) {
  let mergedCount = 0;
  for (const node of queue) {
    if (node.status !== 'HARVESTED') continue;
    const draftPath = path.join(DRAFTS, `${node.code}.json`);
    if (!fs.existsSync(draftPath)) { console.log(`${node.code}: awaiting draft`); continue; }
    const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
    const result = enforceForensicGate(draft, draft.citations || []);
    if (!result.passedPublicGate) {
      console.log(`${node.code}: GATE FAIL (${result.quarantinedCitations.length} quarantined — see research/leads/) — left HARVESTED`);
      continue;
    }
    // strip inline citations from the dossier; master carries citationIds only
    const { citations, ...dossier } = result.verifiedDossier;
    const tmpVerified = path.join(DRAFTS, `.${node.code}.verified.json`);
    fs.writeFileSync(tmpVerified, JSON.stringify({ ...dossier, citations }, null, 2), 'utf8');
    const merged = spawnSync(process.execPath, [path.join(HERE, 'merge-drafts.mjs'), tmpVerified], { encoding: 'utf8' });
    if (merged.status !== 0) { console.error(`${node.code}: merge failed\n${merged.stdout}${merged.stderr}`); fs.rmSync(tmpVerified); continue; }
    console.log(merged.stdout.trim());
    const compiled = spawnSync(process.execPath, [path.join(HERE, 'compile.mjs')], { encoding: 'utf8' });
    if (compiled.status !== 0) { console.error(`${node.code}: compile failed\n${compiled.stdout}${compiled.stderr}`); continue; }
    console.log(compiled.stdout.trim());
    fs.rmSync(tmpVerified);
    node.status = 'DONE';
    mergedCount++;
    console.log(`${node.code}: DONE. Ledger row to file by hand (tier from draft): | \`${node.code}\` | <title> | \`${node.era}\` | <tier> | \`${(node.providers || []).join(',')}\` | 3/3 PASS | YES | [x] |`);
  }
  saveManifest();
  console.log(`--finish: ${mergedCount} node(s) merged.`);
  process.exit(0);
}

// harvest stage
const targets = queue.filter((n) => n.status === 'PENDING' && (!nodeArg || n.code === nodeArg));
if (nodeArg && targets.length === 0) { console.error(`node ${nodeArg} not found or not PENDING`); process.exit(1); }

for (const node of targets) {
  console.log(`\n=== ${node.code} (${node.topic}) ===`);
  const { capped, dropped } = await harvestNode(node);
  if (capped.length === 0) {
    node.status = 'BLOCKED:no-vetted-citations';
    console.log(`  BLOCKED: 0 vetted citations (${dropped.length} dropped: ${dropped.slice(0, 5).join(', ')}${dropped.length > 5 ? ' ...' : ''}). Re-mine with new query variants.`);
    continue;
  }
  const specFile = emitSpec(node, capped);
  node.status = 'HARVESTED';
  console.log(`  HARVESTED: ${capped.length} vetted citations (${dropped.length} dropped) -> ${path.relative(process.cwd(), specFile)}`);
  console.log(`  tiers: ${capped.map((c) => c.tier.replace('TIER_', '')).join(', ')}`);
}
saveManifest();
const counts = {};
for (const n of queue) counts[n.status] = (counts[n.status] || 0) + 1;
console.log(`\nmanifest: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ')}`);
