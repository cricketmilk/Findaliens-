// Read-only coverage report for repeat Crash Conduits source-audit passes.
// node research/audit-crash.mjs [--pending | --entry <pending-id>]
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../public/crash-conduits.html', import.meta.url), 'utf8');
const additions = fs.readFileSync(new URL('../public/js/crash-finance-data.js', import.meta.url), 'utf8');
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
const boundary = inline.indexOf('let activeNodeId');
if (boundary < 0) throw new Error('Atlas data boundary not found');
const { nodes, auditedLegacyNodes, financialEngineeringNodes } = vm.runInNewContext(
  additions + '\n' + inline.slice(0, boundary) + '\n;({nodes,auditedLegacyNodes,financialEngineeringNodes})',
  {}, { timeout: 3000 }
);
const required = ['id', 'title', 'era', 'year', 'country', 'flag', 'category', 'evidence', 'crisis_window', 'quid_pro_quo', 'theft_mechanism', 'who_gained', 'who_lost', 'legacy', 'caveat'];
const ids = new Set();
for (const entry of nodes) {
  if (ids.has(entry.id)) throw new Error('Duplicate atlas ID: ' + entry.id);
  ids.add(entry.id);
}
for (const entry of auditedLegacyNodes) {
  for (const key of required) if (!entry[key]) throw new Error(entry.id + ': missing ' + key);
  if (!entry.insiders?.length || !entry.insiders.every(name => typeof name === 'string' && name.trim())) throw new Error(entry.id + ': missing participants');
  if (!entry.sources?.length || !entry.sources.every(source => source.publisher && source.title && /^https:\/\//.test(source.url))) throw new Error(entry.id + ': incomplete sources');
  if (nodes.find(node => node.id === entry.id) !== entry) throw new Error(entry.id + ': replacement not applied');
}
const additionIds = new Set(financialEngineeringNodes.map(entry => entry.id));
const legacy = nodes.filter(entry => !additionIds.has(entry.id));
const pending = legacy.filter(entry => !entry.sources?.length);
const entryFlag = process.argv.indexOf('--entry');
if (entryFlag >= 0) {
  const id = process.argv[entryFlag + 1];
  const entry = pending.find(node => node.id === id);
  if (!entry) throw new Error('Expected a pending legacy ID after --entry: ' + (id || '(missing)'));
  const originalClaims = Object.fromEntries([...required, 'insiders'].map(key => [key, entry[key]]).filter(([, value]) => value !== undefined));
  console.log(JSON.stringify({
    id, originalClaims, originalClaimsAreUnverified: true,
    task: 'Research this entry only. Do not treat original claims as evidence. Return a proposal, not edits or a verified label.',
    requiredFields: [...required, 'insiders', 'sources'],
    sourceRules: ['Read actual source text; record URL, publisher, title, date and exact supporting passage.', 'Separate allegations, settlements, supervisory findings and court findings; dated sources do not establish current legal status.', 'Identify supported parties with explicit roles; co-mention is not culpability.', 'Remove unsupported claims; distinguish transaction volume, exposure, loss and recovery.', 'If access or evidence is insufficient, return unresolved rather than inventing support.'],
    returnFormat: { status: 'proposed or unresolved', replacement: 'complete entry object or null', claimSupport: 'array of {field, claim, url, passage, sourceDate, legalStatus}', removedClaims: 'array of unsupported original claims', unresolved: 'array of limitations or open questions' },
    reviewGate: 'A reviewer must compare passages with opened sources before merging. Schema checks do not verify facts.'
  }, null, 2));
} else {
  console.log(`Legacy coverage: ${auditedLegacyNodes.length}/${legacy.length} replaced; ${pending.length} source audits pending`);
  console.log(`Atlas: ${nodes.length} entries; ${financialEngineeringNodes.length} source-linked additions`);
  console.log('Replacement schema and ID checks passed (not factual verification).');
  if (process.argv.includes('--pending')) for (const entry of pending) console.log(entry.id + ' | ' + entry.title);
}
