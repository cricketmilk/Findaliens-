// research/atlas-engine/repair-citations.mjs
//
// Repairs two things the bulk import left in master/atlas.json, both mechanical,
// neither needing research:
//
//   1. ERAS. 40 dossiers carry an eraId whose window does not contain their own
//      yearStart — Tulip Mania (1636) is filed under ERA-09-2001 (1999–2011).
//      The era is re-derived from the dossier's own year.
//
//   2. DROPPED SOURCES. 70 dossiers cite CIT-1720-HANSARD — the 1721 Commons
//      report on the South Sea Company — and for all 70 it is their only
//      citation. It cannot source Tulip Mania or the Haiti indemnity: it is a
//      scaffolding default. The legacy crash-conduits nodes those dossiers were
//      migrated from still carry real, resolvable sources that the migration
//      dropped, so they are carried back across and the placeholder removed
//      from any dossier that gains a real citation.
//
// Wiki-hosted legacy sources are skipped: research/glm-recheck.mjs refuses every
// wiki host, and an atlas citation should not be held to a looser standard than
// a Deep State claim.
//
// The placeholder stays on the dossiers that gain nothing here. Removing it
// would leave them with zero citations, which the schema forbids, and inventing
// a URL is worse than an obviously unsourced one. Those are the research queue.
//
//   node research/atlas-engine/repair-citations.mjs            report only
//   node research/atlas-engine/repair-citations.mjs --write    apply
//
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const MASTER = path.join(HERE, 'master', 'atlas.json');
const WRITE = process.argv.includes('--write');
const PLACEHOLDER = 'CIT-1720-HANSARD';
// the one dossier the 1721 report genuinely sources
const PLACEHOLDER_KEEP = new Set(['CC-1720-SOUTHSEA', 'CC-1720-SOUTH_SEA_1720']);

const atlas = JSON.parse(fs.readFileSync(MASTER, 'utf8'));

// ---------------------------------------------------------------- 1. eras
const eras = [...atlas.eras].sort((a, b) => a.yearStart - b.yearStart);
const eraFor = (year) => {
  if (typeof year !== 'number') return null;
  for (const e of eras) if (year >= e.yearStart && year <= e.yearEnd) return e.id;
  // before the first window or after the last: nearest edge, so nothing is orphaned
  if (year < eras[0].yearStart) return eras[0].id;
  let best = eras[0];
  for (const e of eras) if (year >= e.yearStart) best = e;
  return best.id;
};

const eraFixes = [];
for (const d of atlas.dossiers) {
  const want = eraFor(d.yearStart);
  if (want && want !== d.eraId) eraFixes.push({ code: d.code, year: d.yearStart, from: d.eraId, to: want });
}

// ------------------------------------------------- 2. the legacy node sources
// crash-conduits keeps its data in the page plus public/js/crash-finance-data.js;
// read it the way research/extract-entities.mjs does.
function legacyNodes() {
  const html = fs.readFileSync(path.join(ROOT, 'public', 'crash-conduits.html'), 'utf8');
  const js = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
  let code = (js.match(/^\s*const\s+(nodes|lineages)\s*=.*$/gm) || []).join('\n');
  code = fs.readFileSync(path.join(ROOT, 'public', 'js', 'crash-finance-data.js'), 'utf8') + '\n' + code
    + '\napplyLegacyAudits(nodes); nodes.push(...financialEngineeringNodes);';
  const names = [...code.matchAll(/^\s*(?:(?:const|let)\s+|window\.)([A-Za-z_$][\w$]*)\s*=/gm)].map((m) => m[1]);
  const sandbox = {}; sandbox.window = sandbox;
  const ret = '\n;({' + names.map((n) => `${n}: typeof ${n} === "undefined" ? undefined : ${n}`).join(',') + '})';
  const data = vm.runInNewContext(code + ret, sandbox, { timeout: 6000 });
  return new Map((data.nodes || []).filter((n) => n && n.id).map((n) => [n.id, n]));
}

// CC-1636-TULIP_1636 -> tulip-1636, and the same without a doubled year suffix
const legacyIdsFor = (code) => {
  const m = String(code).match(/^[A-Z]{2}-\d{4}-(.+)$/);
  if (!m) return [];
  const base = m[1].toLowerCase().replace(/_/g, '-');
  return [base, base.replace(/-(\d{4})$/, '')];
};

const isWiki = (u) => /wiki/i.test(String(u));
const tierFor = (url) => {
  const u = String(url);
  if (/courtlistener|supremecourt|law\.cornell|casetext/i.test(u)) return 'TIER_1_STATUTE_COURT';
  if (/govinfo|congress\.gov|federalregister|\.gov(\/|$)|sec\.gov|gao\.gov|archives\.gov/i.test(u)) return 'TIER_3_PRIMARY_LEDGER';
  return 'TIER_4_CONTEMPORARY_PRESS';
};
// an id is read by people; cut it at a word, not mid-name ("...ANNE-GOLDGA")
const slug = (s) => {
  const flat = String(s).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (flat.length <= 28) return flat;
  const cut = flat.slice(0, 28);
  const at = cut.lastIndexOf('-');
  return (at > 8 ? cut.slice(0, at) : cut).replace(/-$/, '');
};

const nodes = legacyNodes();
const byId = new Map(atlas.citations.map((c) => [c.id, c]));
const newCitations = [];
const attached = [];
const skippedWiki = [];
const stillBare = [];

for (const d of atlas.dossiers) {
  const ids = d.citationIds || [];
  const onlyPlaceholder = ids.length === 1 && ids[0] === PLACEHOLDER;
  if (!onlyPlaceholder || PLACEHOLDER_KEEP.has(d.code)) continue;

  const node = legacyIdsFor(d.code).map((i) => nodes.get(i)).find(Boolean);
  const sources = (node?.sources || []).filter((s) => s && (typeof s === 'string' ? s : s.url));
  const usable = [];
  for (const s of sources) {
    const url = typeof s === 'string' ? s : s.url;
    if (!/^https?:\/\//.test(String(url))) continue;
    if (isWiki(url)) { skippedWiki.push({ code: d.code, url }); continue; }
    usable.push({ url, title: (typeof s === 'string' ? '' : s.title) || '', publisher: (typeof s === 'string' ? '' : s.publisher) || '' });
  }
  if (!usable.length) { stillBare.push(d.code); continue; }

  const made = [];
  usable.forEach((s, i) => {
    const id = `CIT-${d.yearStart || '0000'}-${slug(s.publisher || s.title || d.code)}${usable.length > 1 ? `-${i + 1}` : ''}`;
    if (!byId.has(id)) {
      const c = {
        id,
        tier: tierFor(s.url),
        title: [s.title, s.publisher].filter(Boolean).join(' — ') || d.title,
        url: s.url,
        quoteOrFact: `Source carried over from the Crash Conduits entry "${node.id}" for ${d.title}.`,
      };
      byId.set(id, c);
      newCitations.push(c);
    }
    made.push(id);
  });
  attached.push({ code: d.code, from: node.id, ids: made });
}

// ------------------------------------------------------------------ report
const n = (x) => String(x).padStart(3);
console.log(`eras      : ${n(eraFixes.length)} dossiers whose year falls outside their tagged era`);
console.log(`citations : ${n(attached.length)} dossiers gain real sources carried back from their legacy entry`);
console.log(`            ${n(newCitations.length)} citation records created`);
console.log(`            ${n(skippedWiki.length)} wiki-hosted legacy sources skipped (the re-check refuses them)`);
console.log(`            ${n(stillBare.length)} dossiers still have only the placeholder — the research queue`);
if (!WRITE) {
  console.log('\nfirst few era fixes:');
  for (const f of eraFixes.slice(0, 6)) console.log(`   ${f.code.padEnd(32)} ${f.year}  ${f.from} -> ${f.to}`);
  console.log('\nfirst few citation restorations:');
  for (const a of attached.slice(0, 6)) console.log(`   ${a.code.padEnd(32)} <- ${a.from}  (${a.ids.join(', ')})`);
  console.log('\nnothing written. re-run with --write');
  process.exit(0);
}

// ------------------------------------------------------------------- write
for (const f of eraFixes) atlas.dossiers.find((d) => d.code === f.code).eraId = f.to;
for (const a of attached) {
  const d = atlas.dossiers.find((x) => x.code === a.code);
  d.citationIds = a.ids;                                  // the placeholder goes with it
}
atlas.citations.push(...newCitations);
atlas.citations.sort((a, b) => String(a.id).localeCompare(String(b.id)));
fs.writeFileSync(MASTER, JSON.stringify(atlas, null, 2) + '\n');
console.log(`\nwrote ${path.relative(ROOT, MASTER)}`);
console.log(`now run: node research/atlas-engine/compile.mjs`);
