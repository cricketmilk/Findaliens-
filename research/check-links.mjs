// check-links.mjs — request every source URL in the research records and flag
// dead or invented ones before review.
//
//     node research/check-links.mjs                  handoffs + findings
//     node research/check-links.mjs path/a.json ...  specific files
//
// "dead" (404/410, DNS failure) almost always means a fabricated or mistyped
// citation and should be fixed or rejected. "blocked" (401/403/429, bot walls)
// means the site refused an automated request; check those by hand.

import fs from "node:fs";
import path from "node:path";
import { findingFiles, readJson } from "./lib.mjs";
import { handoffFiles } from "./handoff-lib.mjs";

const files = process.argv.slice(2).length ? process.argv.slice(2).map((f) => path.resolve(f)) : [...handoffFiles(), ...findingFiles()];

function urlsIn(v, acc = new Set()) {
  if (Array.isArray(v)) v.forEach((x) => urlsIn(x, acc));
  else if (v && typeof v === "object") {
    if (typeof v.url === "string") acc.add(v.url);
    Object.values(v).forEach((x) => urlsIn(x, acc));
  }
  return acc;
}

// Hosts confirmed (in a real browser) to return 404 to automated requests.
const BOT_404_HOSTS = ["ftc.gov"];

async function probe(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    let r = await fetch(url, { method: "HEAD", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", accept: "text/html,*/*" } });
    if ([404, 405, 410, 501].includes(r.status)) r = await fetch(url, { method: "GET", redirect: "follow", signal: ctl.signal, headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36", accept: "text/html,*/*" } });
    // Some sites answer 404 to anything that isn't a full browser; don't call those dead.
    if ([404, 410].includes(r.status) && BOT_404_HOSTS.some((h) => new URL(url).hostname.endsWith(h))) return `blocked (${r.status}, bot wall: open it in a browser)`;
    if ([404, 410].includes(r.status)) return "dead";
    if ([401, 403, 429, 451].includes(r.status) || r.status >= 500) return `blocked (${r.status})`;
    return "ok";
  } catch (e) {
    return /ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(String(e.cause || e)) ? "dead (no such host)" : "blocked (timeout/refused)";
  } finally { clearTimeout(t); }
}

const all = new Map(); // url -> files
for (const f of files) for (const u of urlsIn(readJson(f, {}))) {
  if (!all.has(u)) all.set(u, []);
  all.get(u).push(path.basename(f));
}

const urls = [...all.keys()];
const results = new Map();
const POOL = 8;
let i = 0;
await Promise.all(Array.from({ length: POOL }, async () => {
  while (i < urls.length) { const u = urls[i++]; results.set(u, await probe(u)); }
}));

const dead = urls.filter((u) => results.get(u).startsWith("dead"));
const blocked = urls.filter((u) => results.get(u).startsWith("blocked"));
for (const u of dead) console.log(`DEAD     ${u}\n         in ${all.get(u).join(", ")}`);
for (const u of blocked) console.log(`blocked  ${results.get(u).replace("blocked ", "")}  ${u}  (${all.get(u).join(", ")})`);
console.log(`\n${urls.length} URLs: ${urls.length - dead.length - blocked.length} ok, ${blocked.length} blocked (check by hand), ${dead.length} dead`);
process.exit(dead.length ? 1 : 0);
