// extract-entities.mjs — build the project-wide entity index for "The Web".
//
//     node research/extract-entities.mjs
//
// Reads every investigation page in public/, pulls each page's data arrays
// (the same objects the page renders), and finds every person, company, fund
// and agency named in them: explicitly, from the `who` / `insiders` lists, and
// in prose, from the aliases in entities.seed.json. Writes
// public/data/entities.json: each entity, every entry that mentions it (with a
// link back to that page and section), and "mentioned together" pairs.
//
// WHAT THIS DOES NOT DO: it does not claim two entities are connected. A
// co-mention only means two names appear in the same entry on this site.
// Researched, sourced connections come from research/findings/ and reach the
// site only through research/review.mjs, after a person approves them.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(PUBLIC, "data", "entities.json");
const SEED = path.join(ROOT, "research", "entities.seed.json");

// Which data arrays each page has, and which section of the page shows them.
const PAGES = {
  "crash-conduits": { title: "Crash Conduits", color: "#ff2e88", collections: { nodes: (item) => "#" + item.id } },
  "climate": { title: "The Carbon Ledger", color: "#cc9fe0", collections: {
    ENTRIES: (item) => (item.cat === "privatize" ? "#privatized" : "#ledger"),
    LOBBY: () => "#lobby", LOBBY_STATS: () => "#lobby", MILESTONES: () => "#emissions",
    TOP10_FACTS: () => "#top10", FUTURE_FACTS: () => "#future" } },
  "transhumanism": { title: "Post-Human Resources", color: "#d8283c", collections: {
    TIMELINE: () => "#origins", STACK: () => "#stack", FUNDERS: () => "#funders", GAP_STATS: () => "#gap",
    WORK_STATS: () => "#workers", CHARGES: () => "#workers", COUNTER: () => "#counter", RESIST: () => "#resist" } },
  "consent": { title: "Manufacturing Consent", color: "#a15cf0", collections: {
    MEDIA: () => "#media", WAR: () => "#war", WAR_STATS: () => "#war", MOVEMENTS: () => "#movements",
    MOVE_STATS: () => "#movements", FAITH: () => "#faith", RECLAIM: () => "#reclaim" } },
  "blind-pool": { title: "Blind Pool", color: "#f4b6f1", collections: {
    FLOW: () => "#money", MONEY_STATS: () => "#money", LPS: () => "#money", VENTURES: () => "#ventures",
    TOOLKIT: () => "#hidden", INFRA: () => "#untouchable", URBIT: () => "#feudal", FEUDAL: () => "#feudal" } },
  // Not html: true — its dossiers are rendered from script into <main id="dossiers">,
  // where htmlSections()'s id="dossier-…" never matched. pageData() reads the
  // generated data file instead, and each claim anchors on its own id.
  "deep-state": { title: "Deep State Dossiers", color: "#39ff14", collections: {
    CLAIMS: (item) => "#" + item.id } },
  "demystification": { title: "Demystification Desk", color: "#4de8ff", html: true },
  // The compiled atlas — 108 dossiers over 1636–2026 and the eight lineages.
  // None of it is duplicated from the tab pages: not one atlas code appears as an
  // id in crash-conduits' data, and the lineage names (Mersey, Benjamin Strong,
  // the Dulles brothers, Lutnick, Tesla, Marconi) appear nowhere else on the site.
  "atlas": { title: "The Atlas", color: "#d4a657", collections: {
    DOSSIERS: (item) => "#" + item.code, LINEAGES: () => "#lineage-title" } },
};

// Labels in the old lists that describe a crowd, not a nameable entity. The
// last six came from the atlas's participant slots: "Abu Dhabi ruling family
// shareholders", "London and Irish encumbrance holders" and "Merchant Shipping
// Act 1876 drafters" are each a class of people, not a body to look up.
const GENERIC = /\b(claimants|unidentified|architects|elite|officials|leadership|networks|desks|executives|oligarchs|merchants|notaries|regents|hyperscalers|institutional|managers|families|investors|users|shareholders|holders|drafters|creditors|depositors|subscribers)\b/i;

// Parentheticals that describe a role, not an organization.
const ROLE_WORDS = /\b(director|chairman|chair|chief|secretary|comptroller|regent|leadership|financier|operating|board|officials|elite|ceo|president|founder|minister|governor|treasury|senate|executive|desk|seed facilitator|venture arm|first secretary|ex-|former)\b/i;

const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- read each page's data ----------

function pageData(name) {
  // The atlas is compiled to public/data/atlas-public.json rather than written
  // into its page, so it is read straight from there. Each dossier already lists
  // its `participants`, which become the item's `who`: names the compiler put
  // there on purpose, not names guessed out of prose.
  //
  // Two fields are deliberately left out of the text entities are matched on.
  // `citations`, for the reason Deep State's sources are left out — a publisher
  // is not a subject. And `decoyVsLedger.viralDecoy`, which holds the claim the
  // dossier exists to refute: indexing it would file a name under a story the
  // atlas says is false. `whyDecoyFails` and `documentedLedger`, which are what
  // the atlas actually asserts, are kept.
  if (name === "atlas") {
    const atlas = JSON.parse(fs.readFileSync(path.join(PUBLIC, "data", "atlas-public.json"), "utf8"));
    const str = (x) => (typeof x === "string" ? x : "");
    // A participant slot sometimes holds the record a claim rests on rather than
    // a body: "1858 Commons and Lords record; Landed Estates Court Acts 1861 and
    // 1866". A citation is not an entity, so anything starting with a year or
    // carrying a semicolon is left out.
    const nameable = (n) => typeof n === "string" && n.trim().length > 1 && !/;/.test(n) && !/^\d{4}\b/.test(n.trim());
    const prose = (d) => [
      d.title,
      ...Object.values(d.extractionLoop || {}),
      ...["inheritedFramework", "newFrameworkCreated", "closedLoopRecirculation"].map((k) => (d.closedLoopRatchet || {})[k]),
      (d.decoyVsLedger || {}).whyDecoyFails, (d.decoyVsLedger || {}).documentedLedger,
    ].map(str).filter(Boolean).join(" \n ");
    return {
      // LEAD_ANOMALY entries stay out of the public DOM; they stay out of the index too
      DOSSIERS: (atlas.dossiers || []).filter((d) => d && d.code && d.tier !== "LEAD_ANOMALY")
        .map((d) => ({ code: d.code, title: str(d.title), year: d.yearStart, who: (d.participants || []).filter(nameable), body: prose(d) })),
      LINEAGES: (atlas.lineages || []).filter((l) => l && l.name).map((l) => ({
        name: l.name,
        // A chain link names the step, not one body: "Nikola Tesla (Wardenclyffe)
        // -> Guglielmo Marconi" is two, and "J.S. Morgan & Co. / J.P. Morgan &
        // Co." is two more. Split them, or each arrow becomes its own "entity".
        who: (l.chain || []).flatMap((c) => str(c && c.entity).split(/\s*(?:->|→|\/)\s*/)).map((s) => s.trim()).filter(nameable),
        body: [l.name, l.closedLoopSummary, ...(l.chain || []).map((c) => c && c.role)].map(str).filter(Boolean).join(" \n "),
      })),
    };
  }
  // Deep State keeps no data in its page at all: research/build-deep-state.mjs
  // generates public/js/deep-state-data.js, the way Crash Conduits keeps its
  // source-linked additions in crash-finance-data.js. Read that file and flatten
  // the dossiers into one item per CLAIM, so a mention links to the claim it came
  // from — deep-state.html routes #DS-2-0 to that claim and opens its record.
  //
  // Each claim's sources are deliberately left behind. `strings()` would sweep
  // every publisher name and URL into the text an entity is matched against, and
  // an entity belongs to the claim, not to the masthead of the paper that
  // reported it: WIRED reporting on Palantir must not make WIRED a subject.
  if (name === "deep-state") {
    const code = fs.readFileSync(path.join(PUBLIC, "js", "deep-state-data.js"), "utf8")
      + "\nconst CLAIMS = DS_DATA.dossiers.flatMap((d) => [...d.facts, ...(d.argument ? [d.argument] : [])]"
      + ".map((c) => ({ id: c.id, title: d.title, text: c.text })));";
    const sandbox = {};
    sandbox.window = sandbox;                       // the file is `window.DS_DATA = {...}`
    return vm.runInNewContext(code + "\n;({ CLAIMS })", sandbox, { timeout: 2000 });
  }
  const html = fs.readFileSync(path.join(PUBLIC, name + ".html"), "utf8");
  const js = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  let code;
  const helpers = js.indexOf("// ---------- helpers");
  if (helpers > 0) {
    code = js.slice(0, helpers);
  } else {
    // Crash Conduits retains its legacy arrays and loads source-linked additions.
    code = (js.match(/^\s*const\s+(nodes|lineages)\s*=.*$/gm) || []).join("\n");
    if (name === "crash-conduits") {
      code = fs.readFileSync(path.join(PUBLIC, "js", "crash-finance-data.js"), "utf8") + "\n" + code
        + "\napplyLegacyAudits(nodes); nodes.push(...financialEngineeringNodes); nodes.sort((a, b) => a.year - b.year || a.id.localeCompare(b.id)); lineages.push(...financialEngineeringLineages);";
    }
  }
  // A data section may hand an array to the browser global instead of declaring
  // it: blind-pool.html closes its data with `window.LEASES = [...]`. So give
  // the sandbox a `window` that is the sandbox itself, the way a browser does,
  // and that assignment becomes a readable global rather than a ReferenceError.
  // Nothing else is stubbed, on purpose: a data section that reaches for
  // `document` still throws, and that is a thing we want to hear about.
  const sandbox = {};
  sandbox.window = sandbox;
  const names = [...code.matchAll(/^\s*(?:(?:const|let)\s+|window\.)([A-Za-z_$][\w$]*)\s*=/gm)].map((m) => m[1]);
  const ret = "\n;({" + names.map((n) => `${n}: typeof ${n} === "undefined" ? undefined : ${n}`).join(",") + "})";
  return vm.runInNewContext(code + ret, sandbox, { timeout: 2000 });
}

function htmlSections(name) {
  const html = fs.readFileSync(path.join(PUBLIC, name + ".html"), "utf8");
  const out = [];
  const re = /<(section|div|article)[^>]*id="(dossier-[a-z0-9-]+)"[^>]*>/g;
  const starts = [...html.matchAll(re)];
  starts.forEach((m, i) => {
    const end = i + 1 < starts.length ? starts[i + 1].index : html.indexOf("</main>", m.index);
    const chunk = html.slice(m.index, end > 0 ? end : undefined);
    const text = chunk.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
      .replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
    const h = chunk.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/);
    const title = h ? h[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : m[2];
    out.push({ title, text, href: "#" + m[2], who: [] });
  });
  return out;
}

function strings(v, acc = []) {
  if (typeof v === "string") acc.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, acc));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => strings(x, acc));
  return acc;
}

function titleOf(item) {
  return item.title || item.name || (typeof item.who === "string" ? item.who : "") || item.sector || item.claim || (item.code && `${item.code}: ${item.title || ""}`)
    || item.h || item.g || (item.n && item.t ? `${item.n} ${item.t}` : "") || item.y || item.big || item.text || "";
}

function explicitNames(item) {
  const list = [];
  for (const key of ["who", "insiders"]) {
    if (Array.isArray(item[key])) list.push(...item[key]);
    else if (typeof item[key] === "string") list.push(item[key]);
  }
  return list.filter((x) => typeof x === "string");
}

function collectItems() {
  const items = [];
  for (const [page, cfg] of Object.entries(PAGES)) {
    if (cfg.html) {
      for (const sec of htmlSections(page)) items.push({ page, collection: "dossier", ...sec });
      continue;
    }
    const data = pageData(page);
    for (const [coll, anchor] of Object.entries(cfg.collections)) {
      const arr = data[coll];
      if (!Array.isArray(arr)) continue;
      arr.forEach((item, idx) => {
        if (!item || typeof item !== "object") return;
        // CHARGES and LPS/INFRA nest evidence; take names from their items too
        const nested = [].concat(item.evidence || [], item.items || []);
        const who = explicitNames(item).concat(...nested.map(explicitNames));
        items.push({
          page, collection: coll, index: idx,
          title: String(titleOf(item)).replace(/<[^>]+>/g, "").slice(0, 160),
          text: strings(item).join(" \n ").replace(/<[^>]+>/g, " "),
          href: anchor(item), who,
        });
      });
    }
  }
  return items;
}

// ---------- entities ----------

function buildEntities(items) {
  const seed = JSON.parse(fs.readFileSync(SEED, "utf8"));
  const byId = new Map();
  const aliasToId = new Map();

  function ensure(name, type = "unknown", aliases = []) {
    const id = slug(name);
    if (!id) return null;
    if (!byId.has(id)) byId.set(id, { id, name, type, aliases: new Set(), mentions: [], affiliations: new Set() });
    const e = byId.get(id);
    if (type !== "unknown" && e.type === "unknown") e.type = type;
    for (const a of [name, ...aliases]) { e.aliases.add(a); aliasToId.set(a.toLowerCase(), id); }
    return e;
  }

  for (const s of seed.entities) ensure(s.name, s.type, s.aliases || []);

  // Explicit names: "Larry Fink (BlackRock)" → Larry Fink, affiliated with BlackRock.
  const parsed = [];
  for (const it of items) {
    for (const raw of it.who) {
      const base = raw.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
      const parens = [...raw.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
      if (!base || GENERIC.test(base) || base.split(" ").length > 6 || /^[a-z]/.test(base)) continue;
      const id = aliasToId.get(base.toLowerCase()) || ensure(base)?.id;
      if (!id) continue;
      parsed.push({ it, id });
      for (const p of parens) {
        const org = p.replace(/,.*$/, "").trim();
        if (!org || ROLE_WORDS.test(org) || org.length < 2) continue;
        const orgId = aliasToId.get(org.toLowerCase()) || ensure(org)?.id;
        if (orgId && orgId !== id) byId.get(id).affiliations.add(orgId);
      }
    }
  }

  // Mentions: explicit listing, or any alias appearing in the entry's text.
  // Aliases are matched case-sensitively as whole words; they are proper nouns.
  const matchers = [...byId.values()].map((e) => ({
    e, re: new RegExp("(?<![\\w-])(" + [...e.aliases].sort((a, b) => b.length - a.length).map(escapeRe).join("|") + ")(?![\\w-])"),
  }));
  items.forEach((it, i) => {
    const hit = new Set(parsed.filter((p) => p.it === it).map((p) => p.id));
    for (const { e, re } of matchers) if (re.test(it.text)) hit.add(e.id);
    it.entities = [...hit];
    for (const id of hit) {
      byId.get(id).mentions.push({ page: it.page, href: `${it.page}.html${it.href}`, title: it.title, item: i });
    }
  });

  return { byId, items };
}

// ---------- write ----------

function main() {
  const items = collectItems();
  const { byId } = buildEntities(items);

  const entities = [...byId.values()]
    .filter((e) => e.mentions.length > 0)
    .map((e) => ({
      id: e.id, name: e.name, type: e.type,
      aliases: [...e.aliases].filter((a) => a !== e.name),
      pages: [...new Set(e.mentions.map((m) => m.page))],
      mentions: e.mentions.map(({ page, href, title }) => ({ page, href, title })),
      affiliations: [...e.affiliations].filter((id) => byId.get(id)?.mentions.length),
    }))
    .sort((a, b) => b.pages.length - a.pages.length || b.mentions.length - a.mentions.length || a.name.localeCompare(b.name));

  const keep = new Set(entities.map((e) => e.id));
  const pairs = new Map();
  for (const it of items) {
    const ids = (it.entities || []).filter((id) => keep.has(id)).sort();
    for (let a = 0; a < ids.length; a++) for (let b = a + 1; b < ids.length; b++) {
      const k = ids[a] + "|" + ids[b];
      if (!pairs.has(k)) pairs.set(k, { a: ids[a], b: ids[b], items: [] });
      pairs.get(k).items.push({ page: it.page, href: `${it.page}.html${it.href}`, title: it.title });
    }
  }

  const out = {
    generated: new Date().toISOString(),
    note: "Generated by research/extract-entities.mjs from the site's own pages. 'together' pairs mean two names appear in the same entry on this site, not that they are connected.",
    pages: Object.fromEntries(Object.entries(PAGES).map(([k, v]) => [k, { title: v.title, color: v.color, href: k + ".html" }])),
    entities,
    together: [...pairs.values()],
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");

  const multi = entities.filter((e) => e.pages.length > 1);
  console.log(`${items.length} entries across ${Object.keys(PAGES).length} pages`);
  console.log(`${entities.length} entities (${multi.length} on more than one page), ${out.together.length} co-mention pairs`);
  console.log("most connected: " + multi.slice(0, 12).map((e) => `${e.name} (${e.pages.length})`).join(", "));
  console.log("wrote " + path.relative(ROOT, OUT));
}

main();
