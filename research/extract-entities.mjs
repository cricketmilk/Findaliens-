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
  "deep-state": { title: "Deep State Dossiers", color: "#39ff14", html: true },
  "demystification": { title: "Demystification Desk", color: "#4de8ff", html: true },
  "saudi-911": { title: "Saudi Arabia & 9/11", color: "#4de8ff", html: true },
};

// Labels in the old lists that describe a crowd, not a nameable entity.
const GENERIC = /(claimants|unidentified|architects|elite|officials|leadership|networks|desks|executives|oligarchs|merchants|notaries|regents|hyperscalers|institutional|managers|families|investors|users)/i;

// Parentheticals that describe a role, not an organization.
const ROLE_WORDS = /\b(director|chairman|chair|chief|secretary|comptroller|regent|leadership|financier|operating|board|officials|elite|ceo|president|founder|minister|governor|treasury|senate|executive|desk|seed facilitator|venture arm|first secretary|ex-|former)\b/i;

const slug = (s) => s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- read each page's data ----------

function pageData(name) {
  const html = fs.readFileSync(path.join(PUBLIC, name + ".html"), "utf8");
  const js = html.slice(html.lastIndexOf("<script>") + 8, html.lastIndexOf("</script>"));
  let code;
  const helpers = js.indexOf("// ---------- helpers");
  if (helpers > 0) {
    code = js.slice(0, helpers);
  } else {
    // Crash Conduits keeps its data on single const lines.
    code = (js.match(/^\s*const\s+(nodes|lineages)\s*=.*$/gm) || []).join("\n");
  }
  const names = [...code.matchAll(/^\s*(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/gm)].map((m) => m[1]);
  const ret = "\n;({" + names.map((n) => `${n}: typeof ${n} === "undefined" ? undefined : ${n}`).join(",") + "})";
  return vm.runInNewContext(code + ret, {}, { timeout: 2000 });
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
