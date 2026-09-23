// from-trove.mjs — turn clips into Gazette story stubs.
//
//     node from-trove.mjs                 what is new since the last run
//     node from-trove.mjs --all           every clip, ignoring what is already on the page
//     node from-trove.mjs --since 7d      only the last week
//     node from-trove.mjs --section drone what section to stub them into
//     node from-trove.mjs --jar public     only clips from that cookie jar
//     node from-trove.mjs --all-jars       including the collecting ones
//     node from-trove.mjs --write         append the stubs to drafts.html instead of printing
//
// The Gazette is aggregation, which means the job is: read a lot, keep the
// few worth keeping, write a headline and a summary, link the source. The
// Xixoxis shell already does the keeping — browse in The Wilds, right-click,
// "Clip selection" or "Clip link", and the Trove records the URL, the title,
// any text you highlighted, the cookie jar and the time. This turns that pile
// into <article> blocks shaped like the ones already in public/index.html.
//
// WHAT THIS DOES NOT DO, on purpose: it does not write headlines, it does not
// write deks, and it does not set a corn rating. Those are the editorial
// judgments this site is made of — how contested a claim is, and how to say
// what happened without endorsing it. A generated headline would be the one
// part of the Gazette nobody wrote. Every stub is marked TODO where a person
// has to decide, and the source link, which is mechanical, is filled in.
//
// The `curio` jar is skipped by default. That is the jar the registry sets
// aside for boards — Pinterest, Giphy, Tenor, Gemini — where the gesture is
// "look at images, right-click the good ones". Those are reference material
// for Glamoire and Mut, not reporting, and offering a Pinterest pin as a UAP
// story wastes the one thing this script is supposed to save. Research the
// Gazette in any other jar, or pass --all-jars.
//
// DIRECTION MATTERS. This lives here and READS the Trove. The shell does not
// write into this repo: the platform hosts apps, it does not reach into them
// (see C:\xixoxis\docs\separation.md). If the Trove moves, point TROVE at it.

import fs from "node:fs";
import path from "node:path";

const TROVE = process.env.TROVE_INDEX ||
  "C:\\xixoxis\\shell\\data\\trove\\index.jsonl";
const PAGE = path.join(import.meta.dirname, "public", "index.html");
const DRAFTS = path.join(import.meta.dirname, "drafts.html");

const SECTIONS = {
  drone: { icon: "🚁", name: "DRONE WATCH", cls: "glow-cyan" },
  disclosure: { icon: "👽", name: "DISCLOSURE DESK", cls: "glow-cyan" },
  crop: { icon: "🌾", name: "CROP CIRCLE CORNER", cls: "glow-cyan" },
  top: { icon: "▓▓", name: "TOP STORY", cls: "glow-green" },
};

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const val = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};

// "7d", "36h", "90m" — or nothing, meaning all of it.
function since(spec) {
  if (!spec) return 0;
  const m = /^(\d+)([dhm])$/.exec(spec.trim());
  if (!m) { console.error(`--since wants something like 7d, 36h or 90m; got "${spec}"`); process.exit(2); }
  const mult = { d: 86400000, h: 3600000, m: 60000 }[m[2]];
  return Date.now() - Number(m[1]) * mult;
}

function readTrove() {
  let raw;
  try { raw = fs.readFileSync(TROVE, "utf8"); }
  catch {
    console.error(`No Trove at ${TROVE}.`);
    console.error("Set TROVE_INDEX if the shell lives somewhere else, or clip something first.");
    process.exit(1);
  }
  const rows = [];
  for (const line of raw.split(/\r?\n/)) {
    const s = line.trim();
    if (!s) continue;
    // A crash mid-write can leave one truncated final line. Skipping it is why
    // the archive is JSONL in the first place.
    try { rows.push(JSON.parse(s)); } catch {}
  }
  return rows;
}

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const canon = (u) => String(u).replace(/[#?].*$/, "").replace(/\/+$/, "").toLowerCase();

// Every source already linked on the page, so a clip is only ever offered once.
function alreadyOnPage() {
  let html = "";
  try { html = fs.readFileSync(PAGE, "utf8"); } catch {}
  let drafts = "";
  try { drafts = fs.readFileSync(DRAFTS, "utf8"); } catch {}
  const seen = new Set();
  for (const src of [html, drafts]) {
    for (const m of src.matchAll(/href="(https?:\/\/[^"]+)"/g)) seen.add(canon(m[1]));
  }
  return seen;
}

const COLLECTING_JARS = new Set(["curio"]);

// A clip is a candidate if it points at somebody else's page. The Gazette
// links out to original reporting — that is the whole editorial stance — so a
// clip with no source URL is not a story, and a clip of the Gazette itself is
// certainly not one.
function candidates(rows, { from, onlyNew, seen, jars, allJars }) {
  const out = [];
  const byUrl = new Map();
  for (const r of rows) {
    const url = (r.src || {}).url || "";
    if (!/^https?:\/\//i.test(url)) continue;
    if ((r.t || 0) < from) continue;
    if (/findaliens\.net|localhost|127\.0\.0\.1/i.test(url)) continue;
    if (onlyNew && seen.has(canon(url))) continue;
    const jar = r.persona || null;
    if (jars.length) { if (!jars.includes(jar)) continue; }
    else if (!allJars && COLLECTING_JARS.has(jar)) continue;
    // One row per source: a page clipped three times is one story.
    const key = canon(url);
    const prev = byUrl.get(key);
    if (prev) {
      // Keep whichever row knows most — a later clip may have caught a title,
      // an earlier one may have caught the selected text.
      prev.title ||= (r.src || {}).pageTitle || "";
      prev.text ||= r.text || "";
      continue;
    }
    const entry = {
      url,
      title: (r.src || {}).pageTitle || "",
      text: r.text || "",
      when: r.at || new Date(r.t || Date.now()).toISOString(),
      persona: r.persona || null,
      agent: r.agent || null,
      kind: r.kind,
    };
    byUrl.set(key, entry);
    out.push(entry);
  }
  return out;
}

function host(u) {
  try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; }
}

function stub(c, section) {
  const s = SECTIONS[section] || SECTIONS.drone;
  const headline = c.title ? c.title.toUpperCase() : "TODO — WRITE THE HEADLINE";
  // Whatever you highlighted is the best first draft of a dek there is, but it
  // is the source's words, not yours. Say so, so it never ships as written.
  const dek = c.text
    ? c.text.replace(/\s+/g, " ").trim().slice(0, 400)
    : "TODO — write the summary. Say what happened, attribute it, and do not endorse it.";
  const quoted = c.text ? " <!-- ^ this is the SOURCE's wording, quoted from your clip. Rewrite it. -->" : "";
  return [
    `      <!-- from the Trove: ${esc(host(c.url))}, clipped ${esc(c.when.slice(0, 10))}${c.persona ? ` in the ${esc(c.persona)} jar` : ""} -->`,
    `      <article class="story">`,
    `        <h4 class="headline-sm ${s.cls}">${esc(headline)}</h4>`,
    `        <p class="dek">${esc(dek)}</p>${quoted}`,
    `        <div class="story-meta">`,
    `          <span class="controversy">CONTROVERSY: 🌽🌽🌽 <!-- TODO — 1 settled, 5 heavily contested --></span>`,
    `          <span class="tag">#TODO</span>`,
    `          <a class="src-btn" href="${esc(c.url)}" target="_blank" rel="noopener">[ READ SOURCE ➤ ]</a>`,
    `        </div>`,
    `      </article>`,
    ``,
  ].join("\n");
}

// ------------------------------------------------------------------- run --

const section = (val("section", "drone") || "drone").toLowerCase();
if (!SECTIONS[section]) {
  console.error(`--section wants one of: ${Object.keys(SECTIONS).join(", ")}`);
  process.exit(2);
}

const rows = readTrove();
const seen = alreadyOnPage();
const jars = (val("jar") || "").split(",").map((x) => x.trim()).filter(Boolean);
const found = candidates(rows, {
  from: since(val("since")),
  onlyNew: !flag("all"),
  seen,
  jars,
  allJars: flag("all-jars"),
});
const limit = Number(val("limit", "0")) || 0;
const use = limit ? found.slice(0, limit) : found;

if (!use.length) {
  const skipped = rows.filter((r) => COLLECTING_JARS.has(r.persona)).length;
  console.log(`Nothing new. ${rows.length} clip(s) in the Trove, ${seen.size} source(s) already on the page.`);
  if (skipped && !flag("all-jars") && !jars.length) {
    console.log(`(${skipped} skipped as reference material from the ${[...COLLECTING_JARS].join(", ")} jar — --all-jars to include them.)`);
  }
  console.log("Browse in The Wilds and right-click → Clip link / Clip selection on anything worth a story.");
  process.exit(0);
}

const body = use.map((c) => stub(c, section)).join("\n");
const header = [
  `<!-- ${use.length} stub(s) from the Trove, ${new Date().toISOString().slice(0, 10)}, for ${SECTIONS[section].icon} ${SECTIONS[section].name}.`,
  `     Every TODO is a decision only you can make. Move the ones worth keeping into`,
  `     public/index.html and delete the rest — nothing here is published until you do. -->`,
  ``,
].join("\n");

if (flag("write")) {
  fs.appendFileSync(DRAFTS, (fs.existsSync(DRAFTS) ? "\n" : "") + header + body, "utf8");
  console.log(`${use.length} stub(s) appended to ${DRAFTS}`);
  console.log("They are drafts: nothing is on the site until you move it into public/index.html.");
} else {
  process.stdout.write(header + body);
  console.error(`\n${use.length} stub(s) above. --write appends them to drafts.html instead.`);
}
