// Re-check a page's facts with a cheap model doing the reading and a
// mechanical check doing the trusting. The model proposes source URLs, quotes
// and a rewrite; a quote counts only if 90% of its five-word runs are on the
// fetched page, and a rewrite only if every figure it states is inside a
// verified quote (in the same unit), every name it states is on a cited page,
// and it is not empty. Built for Blind Pool in October 2026: z-ai/glm-5.3-flash
// re-checked 85 facts for under a dollar.
//
//   node research/glm-recheck.mjs --facts f.json --out dir [--hints h.json]
//        [--corpus dir --urlmap m.json] [--retry | --rejudge] [id ...]
//
// facts: [{id, kind?: "stat", n?, text, status, src?, url?}]. A VEN- id keeps
// the "Funders: ... Hidden: ..." shape. Writes <out>/<id>.json per fact (what
// was tried and why it passed or failed), then <out>/verified.json and
// <out>/report.json. --retry redoes the failures; --rejudge re-runs only the
// checks, with no model calls. A person still reads every rewrite: a source's
// own typo passes every mechanical check (Al Jazeera's "$4.3m" for Binance's
// $4.3 billion did), and so does a stale figure.
import fs from "node:fs";
import { createRequire } from "node:module";
import { cleanDate, cleanPub } from "./source-labels.mjs";
const require = createRequire(import.meta.url);
// The Forge's fetcher reads PDFs and asks the phone when this address is
// refused; its audit owns the quote and claim matching; its config holds the
// OpenRouter key, which is never printed.
const FORGE = process.env.FORGE_DIR || "C:/Forge";
const { fetchText, searchWeb } = require(FORGE + "/tools/web.js");
const { quoteFound, claimCheck, claimTokens, norm, isFrontPage, isWiki } = require(FORGE + "/research-audit.js");
const KEY = require(FORGE + "/config.json").keys.openrouter;
const MODEL = process.env.MODEL || "z-ai/glm-5.3-flash";
const BUDGET = Number(process.env.BUDGET || 3);
const ARGV = process.argv.slice(2);
const opt = (k) => { const i = ARGV.indexOf("--" + k); return i >= 0 ? ARGV[i + 1] : null; };
if (!opt("facts") || !opt("out")) { console.error("usage: node research/glm-recheck.mjs --facts f.json --out dir [--hints h.json] [--corpus dir --urlmap m.json] [--retry|--rejudge] [id ...]"); process.exit(2); }
const OUT = opt("out").replace(/[\\/]*$/, "/");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fold = (x) => String(x || "").normalize("NFKC").replace(/--/g, "—").replace(/\u00a0/g, " ");
const BAD = /(^|\.)(wikipedia\.org|wikiwand\.com|wikimili\.com|dbpedia\.org|everybodywiki\.com|alchetron\.com|grokipedia\.com|handwiki\.org|explained\.today|reddit\.com|quora\.com|x\.com|twitter\.com|facebook\.com|instagram\.com|tiktok\.com|youtube\.com|linkedin\.com|pinterest\.com|scribd\.com|coursehero\.com|studocu\.com|answers\.com|merriam-webster\.com|cambridge\.org|dictionary\.com|calculator\.net|gitlab\.com|secsports\.com|nerdwallet\.com|investopedia\.com|ground\.news|comicskingdom\.com|seattletimes\.com|rescue\.org|w3\.org|ontheworldmap\.com|britannica\.com|msn\.com|yahoo\.com)$/i;
// any wiki is out, not only Wikipedia and its copies: WikiDisc turned up for the UFO pages
const refused = (u) => { try { const h = new URL(u).hostname; return BAD.test(h) || /wiki/i.test(h) || isWiki(u) || isFrontPage(u); } catch { return true; } };

// ---- the model -------------------------------------------------------------
let spent = 0, calls = 0;
async function glm(system, user, maxTokens = 2500) {
  if (spent > BUDGET) throw new Error(`budget $${BUDGET} reached`);
  for (let a = 0; a < 3; a++) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: "Bearer " + KEY, "Content-Type": "application/json", "X-Title": "Find Aliens research" },
        body: JSON.stringify({ model: MODEL, temperature: 0.1, max_tokens: maxTokens, response_format: { type: "json_object" }, usage: { include: true }, reasoning: { effort: "low" }, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
        signal: AbortSignal.timeout(240000),
      });
      const j = await r.json().catch(() => null);
      calls++;
      if (j?.usage?.cost) spent += j.usage.cost;
      if (!r.ok || !j?.choices?.[0]) { await sleep(4000 * (a + 1)); continue; }
      const txt = j.choices[0].message.content || "";
      const m = txt.match(/\{[\s\S]*\}/);
      if (m) return JSON.parse(m[0]);
    } catch (e) { await sleep(4000 * (a + 1)); }
  }
  return null;
}

// ---- pages: live, else a copy saved earlier, else the Internet Archive -------
// --corpus is a folder of subfolders of .txt page texts; --urlmap maps
// "subfolder/name" to the URL each was fetched from. A site that refuses this
// machine's fetch is often in there, saved by a browser-UA download.
const urlmap = opt("urlmap") ? JSON.parse(fs.readFileSync(opt("urlmap"), "utf8")) : {};
const localOf = new Map();
if (opt("corpus")) for (const dir of fs.readdirSync(opt("corpus"))) {
  const full = opt("corpus") + "/" + dir;
  if (!fs.statSync(full).isDirectory()) continue;
  for (const f of fs.readdirSync(full)) {
    if (!f.endsWith(".txt")) continue;
    const name = f.slice(0, -4), key = dir + "/" + name.replace(/\.(html|pdf)$/, "");
    const url = urlmap[key] || urlmap[dir + "/" + name];
    if (url) localOf.set(url, full + "/" + f);
  }
}
const corpus = [...localOf.entries()].map(([url, p]) => { const text = fold(fs.readFileSync(p, "utf8")); return { url, text }; }).filter((c) => c.text.length > 800 && c.text.length < 600000 && !refused(c.url));
const pages = new Map();
function page(url) {
  if (!pages.has(url)) pages.set(url, (async () => {
    let text = "", via = "";
    try { const r = await fetchText(url, { max: 8_000_000 }); text = fold(r.text); via = r.via || "here"; } catch (e) { /* below */ }
    const local = localOf.get(url);
    if (local) { const t = fold(fs.readFileSync(local, "utf8")); if (t.length > text.length * 1.5 || text.length < 1500) { text = t; via = "saved copy"; } }
    if (text.length < 1500) {
      for (const ts of ["2026", "2024", "2020", "2015", "2010"]) {
        try { const r = await fetchText(`https://web.archive.org/web/${ts}id_/${url}`, { max: 8_000_000 }); const t = fold(r.text); if (t.length > text.length) { text = t; via = `archive ${ts}`; } } catch {}
        if (text.length >= 1500) break;
      }
    }
    return { text, via };
  })());
  return pages.get(url);
}

// The parts of a long page that can bear on the claim, in page order.
function windows(text, claim, budget = 60000) {
  if (text.length <= budget) return text;
  const nums = (claim.match(/\d[\d,.]*\d|\d{2,}/g) || []).map((n) => n.replace(/,/g, ""));
  const words = [...new Set(claim.toLowerCase().match(/[a-z][a-z'-]{5,}/g) || [])];
  const names = [...new Set(claim.match(/\b[A-Z][a-zA-Z&.-]{2,}/g) || [])];
  const chunks = [];
  for (let i = 0; i < text.length; i += 1500) chunks.push({ i, t: text.slice(Math.max(0, i - 150), i + 1650) });
  for (const c of chunks) {
    const low = c.t.toLowerCase(), flat = c.t.replace(/,/g, "");
    c.s = nums.filter((n) => flat.includes(n)).length * 4 + names.filter((n) => c.t.includes(n)).length * 2 + words.filter((w) => low.includes(w)).length;
  }
  const pick = [...chunks].sort((a, b) => b.s - a.s).filter((c) => c.s > 0);
  const keep = [];
  let size = 0;
  for (const c of pick) { if (size + c.t.length > budget) break; keep.push(c); size += c.t.length; }
  return keep.sort((a, b) => a.i - b.i).map((c) => c.t).join("\n[…]\n");
}

// ---- prompts ---------------------------------------------------------------
const PLAN = `You plan web research for a fact-checker. Given a claim, return JSON {"urls": [up to six full URLs of specific pages you are confident exist and state the claim's facts: the law's text (uscode.house.gov, law.cornell.edu, govinfo.gov), the agency's own page (irs.gov, sec.gov, fincen.gov, federalregister.gov...), a court opinion, the company's own press release, or a reputable news article], "queries": [two or three search-engine queries that would find such pages]}. Use the claim's distinctive names and numbers. Never Wikipedia, never a site's front page, never crypto or SEO content sites; prefer the primary record, then major newsrooms (Reuters, AP, the New York Times, Bloomberg, NPR...) and recognised watchdogs.`;
const READ = `You are a meticulous fact-checker. You are given a CLAIM and the TEXT of one web page. Decide whether the page states the claim's facts, and copy the exact sentences that show it.
Return JSON:
{"supports": "yes" | "partly" | "no",
 "quotes": [1 to 4 passages copied CHARACTER FOR CHARACTER from the page text, each 15-60 words, each one a contiguous run of the text with nothing added, removed or reworded; empty if "no"],
 "covers": "which parts of the claim the quotes state",
 "contradicts": "any figure or fact on the page that conflicts with the claim, else empty",
 "publisher": "who published the page (organisation or outlet)",
 "date": "the page's publication date as written on it, else empty"}
Rules: never paraphrase inside a quote; never stitch passages; prefer passages containing the claim's figures, dates and names. A page that merely mentions the topic is "no".`;
const WRITE = `You edit one line of a public explainer page so that it is exactly as strong as its evidence. You get the ORIGINAL line and VERIFIED QUOTES from source pages.
Return JSON {"text": "...", "n": "...", "dropped": "what you removed or changed and why"}.
Rules:
- Every figure, date, name and fact in "text" must be stated in the quotes. Drop or soften any part the quotes do not state; do not add facts that are not in the quotes.
- Fix any figure the quotes contradict, using the quotes' figure.
- When quotes disagree, trust the primary source (the government, court or company itself) over a press report, and never pass on a figure that looks like a typo in one source.
- Keep the original's plain, neutral register and roughly its length or shorter. No hype, no "notably", no hedging filler. Use the original's units style ($1.15B, $40B, 43%).
- Write for a general reader; one to three sentences.
- If the quotes support the original as written, return it unchanged.`;
const FORMAT = {
  stat: `This line is a statistic: "n" is the headline figure shown big (like "$100B" or "23.8%") and "text" is the sentence fragment that follows it, starting lower-case. "n" must appear in the quotes.`,
  ven: `This line must keep the exact shape "Funders: A, B, C. <one or two sentences of example> Hidden: <what is not disclosed>." Funders must be named as investors in the quotes. The Hidden clause may restate, in general terms, what such companies are not required to disclose; keep it short.`,
  plain: `Return "n" as an empty string.`,
  argument: `This line is an argument, an interpretation, not a fact. Keep it as an argument and say whose it is ("Critics argue...", "Watchdogs warn..."): the quotes must show someone making it. Return "n" as an empty string.`,
};
const formatFor = (f) => (f.kind === "stat" ? FORMAT.stat : f.status === "argument" ? FORMAT.argument : /^VEN-/.test(f.id) ? FORMAT.ven : FORMAT.plain);
// A cheap rewrite drops the point as readily as it drops a wrong figure: the
// SEC item kept the rule's adoption and lost the court that struck it down.
// A second look flags that for the person reading the rewrites; it never
// passes or fails a fact on its own.
const KEEP = `You compare an ORIGINAL line from an explainer page with its fact-checked REWRITE. Return JSON {"kept": true or false, "lost": "the main point of the original that the rewrite no longer makes, or empty", "removed": [each specific claim of the original that the rewrite left out, as a short standalone sentence naming who and what], "corrected": "any fact the rewrite corrected, or empty"}. "kept" is false only when the rewrite drops what the original was mainly saying, not when it trims detail or fixes a figure.`;
// A dropped claim is often on the page after all, a sentence or two from the
// quote that was taken. Vox has Blake Masters say "one of my friends has this
// acronym he calls RAGE" and, in the next sentence, "You've probably guessed
// who the friend is": Yarvin. The quote stopped before the answer, and the
// rewrite dropped that Yarvin coined RAGE, which two sources state outright.
// So a removed claim gets one more read of the same pages, asked for directly,
// on a tight window: this model always reasons, and handed the whole Vox page
// it thought through 5,000 tokens and answered nothing; 12,000 characters
// around the claim's words come back in about 700.
const RECOVER = `You are a meticulous fact-checker. You are given one CLAIM and the TEXT of a page that was already found to support related facts. Decide whether this page states the CLAIM, and copy the exact sentences that show it. People in quotes are often named a sentence or two away ("one of my friends", "he", "the founder"): when the claim turns on who someone is, copy the sentence that names them too.
Return JSON {"supports": "yes" | "partly" | "no", "quotes": [1 to 3 passages copied character for character from the page text, each a contiguous run]}.`;

// ---- whose word it is ---------------------------------------------------------
// A quote can be found on a content farm as easily as in the Federal Register.
// With --strict-sources a source counts only if it is rated: a government,
// court, international or university site, a recognised newsroom, watchdog or
// law firm, or the subject's own site (a fact about Anduril on anduril.com).
// Unrated pages are hidden when a rated one says the same thing; a fact that
// only unrated pages state fails, and --retry goes looking for better.
const STRICT = ARGV.includes("--strict-sources");
const RATED_TLD = /\.(gov|mil|edu|int)(\.[a-z]{2})?$|\.gov\.[a-z]{2}$|\.gc\.ca$|\.europa\.eu$/;
const RATED_HOSTS = new Set(("nytimes.com washingtonpost.com wsj.com reuters.com apnews.com bloomberg.com news.bloomberglaw.com news.bloombergtax.com ft.com economist.com " +
  "cnbc.com cbsnews.com nbcnews.com abcnews.go.com cnn.com npr.org wbur.org pbs.org bbc.com bbc.co.uk theguardian.com latimes.com usatoday.com time.com " +
  "politico.com axios.com propublica.org theatlantic.com newyorker.com vox.com wired.com techcrunch.com theverge.com arstechnica.com 404media.co " +
  "businessinsider.com forbes.com fortune.com marketwatch.com barrons.com nature.com science.org scientificamerican.com statnews.com " +
  "federalnewsnetwork.com govexec.com defensescoop.com defenseone.com breakingdefense.com fedscoop.com lawfaremedia.org justsecurity.org " +
  "coindesk.com theblock.co pogo.org aclu.org eff.org brennancenter.org epic.org consumerreports.org ourfinancialsecurity.org brookings.edu cfr.org rand.org urban.org " +
  "law.cornell.edu courtlistener.com oyez.org supremecourt.gov congress.gov archives.gov loc.gov ballotpedia.org opensecrets.org " +
  "mintz.com foley.com debevoise.com gibsondunn.com ballardspahr.com hunton.com sullcrom.com skadden.com wilmerhale.com lw.com davispolk.com " +
  "telegeography.com nber.org imf.org worldbank.org bis.org oecd.org un.org " +
  // fact-checkers, the film and culture trades, and outlets that publish the documents themselves
  "snopes.com politifact.com factcheck.org fullfact.org pen.org variety.com hollywoodreporter.com deadline.com rollingstone.com vanityfair.com vice.com theconversation.com " +
  // defence journalism and the scholarly publishers
  "twz.com thedrive.com journals.sagepub.com tandfonline.com jstor.org academic.oup.com link.springer.com muse.jhu.edu " +
  // libraries that hold the primary documents themselves
  "archive.org gutenberg.org " +
  // Central banks and their documentary archives, which publish the record of
  // their own actions the way bis.org and imf.org already do here. They are not
  // .gov (the Reserve Banks use .org, the Bank of England .co.uk), and the
  // "subject's own site" fallback below only fires when the claim happens to
  // name the bank: a claim about Overend Gurney failed on the Bank of England's
  // own PDF while the claims either side of it passed on the same page.
  "bankofengland.co.uk stlouisfed.org federalreservehistory.org newyorkfed.org bundesbank.de banque-france.fr ecb.europa.eu").split(" "));
function rated(url, claim) {
  let h = "";
  try { h = new URL(url).hostname.toLowerCase().replace(/^www\./, ""); } catch { return false; }
  if (RATED_TLD.test(h) || RATED_HOSTS.has(h) || [...RATED_HOSTS].some((r) => h.endsWith("." + r))) return true;
  // the subject's own site: a name in the claim that the host is built from
  const names = (claimTokens(claim).names || []).map((n) => n.toLowerCase().replace(/[^a-z0-9]/g, "")).filter((n) => n.length >= 4);
  const bare = h.split(".").slice(0, -1).join("").replace(/[^a-z0-9]/g, "");
  return names.some((n) => bare.includes(n) || (bare.length >= 5 && n.includes(bare)));
}

// ---- the Brain, asked before the web ------------------------------------------
// Goblin Brain already holds what the roost has verified (its `evidence`
// index, which reads every page's research/*-sources.json) and searches the
// records' own APIs (`sources`: Federal Register, GovInfo, CourtListener,
// EDGAR) with no search engine between. Both are asked first; a Bing query
// from this address mostly returned dictionaries. The Brain being down costs
// nothing but this head start; --no-brain skips it.
const BRAIN = process.env.GOBLIN_BRAIN_URL || "http://127.0.0.1:3001";
const BRAIN_DIR = process.env.GOBLIN_BRAIN_DIR || "C:/Goblin Brain";
let brainToken = process.env.GOBLIN_BRAIN_TOKEN || "";
try { if (!brainToken) brainToken = fs.readFileSync(BRAIN_DIR + "/.brain-dev-token", "utf8").trim(); } catch {}
let brainUp = !ARGV.includes("--no-brain");
async function brain(id, verb, body) {
  if (!brainUp) return null;
  try {
    const r = await fetch(`${BRAIN}/api/powers/${id}/${verb}`, { method: "POST", headers: { authorization: `Bearer ${brainToken}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { if (/ECONNREFUSED|fetch failed/i.test(String(e && (e.cause?.code || e.message)))) brainUp = false; return null; }
}
const RECORD_KINDS = ["federalRegister", "govinfo", "courtlistener", "edgar"];

// ---- one fact --------------------------------------------------------------
const HINTS = opt("hints") ? JSON.parse(fs.readFileSync(opt("hints"), "utf8")) : {};
// $4.3m in a source is not $4.3B: a figure the quotes state only with another
// unit is a clash, whichever side made the typo
const UNIT = (u) => (/^(b|bn|billion)$/i.test(u) ? "B" : /^(m|mn|million)$/i.test(u) ? "M" : /^(t|tn|trillion)$/i.test(u) ? "T" : /^(k|thousand)$/i.test(u) ? "K" : null);
function money(text) { const out = [], re = /(\d[\d,]*(?:\.\d+)?)\s?(billion|million|trillion|thousand|bn|mn|tn|[BMKT])\b/gi; let m; while ((m = re.exec(String(text)))) out.push({ n: m[1].replace(/,/g, ""), u: UNIT(m[2]) }); return out; }
function unitClash(said, quoted) { const q = money(quoted); return money(said).filter((a) => a.u && q.some((b) => b.n === a.n) && !q.some((b) => b.n === a.n && b.u === a.u)).map((a) => a.n + a.u); }
function corpusFor(claim) {
  return corpus.map((c) => ({ url: c.url, s: claimCheck(claim, c.text).score })).filter((c) => c.s >= 0.5).sort((a, b) => b.s - a.s).slice(0, 3).map((c) => c.url);
}
async function research(f) {
  const claim = (f.n ? f.n + " " : "") + f.text;
  const log = { id: f.id, claim, tried: [], sources: [] };
  const cands = [];
  const add = (u, why) => { if (u && !refused(u) && !cands.some((c) => c.url === u)) cands.push({ url: u, why }); };
  if (f.url) add(f.url, "cited");
  for (const u of HINTS[f.id] || []) add(u, "hint");
  // what the roost already verified, then the records themselves
  const held = await brain("evidence", "search", { q: claim, limit: 6 });
  // the index matches any shared word; a row counts only if it carries the
  // claim's own names and figures
  for (const row of (held?.rows || []).filter((x) => x.url && /verified|fact|connection|clip/.test(x.kind) && claimCheck(claim, x.text || "").score >= 0.45).sort((a, b) => (b.kind === "verified") - (a.kind === "verified")).slice(0, 3)) add(row.url, "roost");
  if (held) log.tried.push({ brain: "evidence", hits: (held.rows || []).length });
  const plan = await glm(PLAN, `CLAIM: ${claim}\nCurrently cited: ${f.src || "nothing"}`, 900);
  for (const q of (plan?.queries || []).slice(0, 2)) {
    const rec = await brain("sources", "search", { q, kinds: RECORD_KINDS, limit: 3 });
    if (rec) { log.tried.push({ brain: "sources", q, hits: (rec.results || []).length }); for (const x of (rec.results || []).slice(0, 4)) add(x.url, "records"); }
  }
  for (const u of (plan?.urls || []).slice(0, 6)) add(u, "suggested");
  for (const u of corpusFor(claim)) add(u, "saved");
  for (const q of (plan?.queries || []).slice(0, 3)) {
    try {
      const r = await searchWeb(q, { phone: null });
      log.tried.push({ search: q, engine: r.engine, n: r.results.length });
      for (const x of r.results.slice(0, 4)) add(x.url, "search");
    } catch (e) { log.tried.push({ search: q, error: e.message }); }
  }
  for (const c of cands.slice(0, 12)) {
    if (log.sources.length >= 2 && log.sources.some((s) => s.supports === "yes")) break;
    const pg = await page(c.url);
    if (pg.text.length < 600) { log.tried.push({ url: c.url, why: c.why, skip: `thin page (${pg.text.length})` }); continue; }
    const r = await glm(READ, `CLAIM: ${claim}\n\nPAGE URL: ${c.url}\nPAGE TEXT:\n${windows(pg.text, claim)}`);
    if (!r || r.supports === "no" || !(r.quotes || []).length) { log.tried.push({ url: c.url, why: c.why, supports: r?.supports || "error" }); continue; }
    const ok = r.quotes.filter((q) => quoteFound(fold(q), pg.text) >= 0.9);
    log.tried.push({ url: c.url, why: c.why, via: pg.via, supports: r.supports, quotes: `${ok.length}/${r.quotes.length} on page`, contradicts: r.contradicts || "" });
    if (ok.length) log.sources.push({ url: c.url, publisher: r.publisher || "", date: r.date || "", quotes: ok, supports: r.supports, covers: r.covers || "", contradicts: r.contradicts || "", via: pg.via });
  }
  if (!log.sources.length) { log.pass = false; log.why = "no source with a verified quote"; return log; }
  const write = async () => {
    const quotes = log.sources.flatMap((s, i) => s.quotes.map((q) => `[${i + 1}] ${q}`)).join("\n");
    const quoted = log.sources.flatMap((s) => s.quotes).join(" ");
    let w = null, missing = [];
    for (let a = 0; a < 2; a++) {
      const nudge = a && missing.length ? `\nYour last version stated ${missing.join(", ")}, which no quote contains. Remove or correct them.` : "";
      w = await glm(WRITE + "\n" + formatFor(f), `ORIGINAL: ${claim}\n\nVERIFIED QUOTES:\n${quotes}${nudge}`, 1200);
      if (!w?.text) continue;
      const said = (f.kind === "stat" && w.n ? w.n + " " : "") + w.text;
      const T = claimCheck(said, quoted);
      missing = (T.missing || []).filter((m) => /\d/.test(m));
      if (!missing.length) break;
    }
    return w;
  };
  let w = await write();
  if (!w?.text) { log.pass = false; log.why = "no rewrite"; return log; }
  log.text = w.text; log.n = f.kind === "stat" ? w.n || "" : ""; log.dropped = w.dropped || "";
  let k = await glm(KEEP, `ORIGINAL: ${claim}\n\nREWRITE: ${(log.n ? log.n + " " : "") + log.text}`, 700);
  // what the rewrite left out gets one direct look on the pages already found
  const removed = (k?.removed || []).filter((x) => typeof x === "string" && x.length > 12).slice(0, 2);
  if (removed.length) {
    let found = 0;
    for (const part of removed) for (const src of log.sources) {
      const pg = await page(src.url);
      const r = await glm(RECOVER, `CLAIM: ${part}\n\nPAGE URL: ${src.url}\nPAGE TEXT:\n${windows(pg.text, part, 12000)}`, 3000);
      if (!r || r.supports === "no") continue;
      const ok = (r.quotes || []).filter((q) => quoteFound(fold(q), pg.text) >= 0.9 && !src.quotes.includes(q));
      if (ok.length) { src.quotes.push(...ok); found += ok.length; }
    }
    log.recovered = { asked: removed, quotes: found };
    if (found) {
      const w2 = await write();
      if (w2?.text) {
        w = w2; log.text = w.text; log.n = f.kind === "stat" ? w.n || "" : ""; log.dropped = w.dropped || "";
        k = await glm(KEEP, `ORIGINAL: ${claim}\n\nREWRITE: ${(log.n ? log.n + " " : "") + log.text}`, 700);
      }
    }
  }
  if (k && k.kept === false) log.lost = k.lost || "the original's point";
  if (k?.corrected) log.corrected = k.corrected;
  return judge(log, f);
}

// "not more than one hundred persons" is the claim's "100": spelled-out numbers
// become digits on both sides before figures are compared.
const SMALL = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const WORD = "(?:" + Object.keys(SMALL).join("|") + "|hundred|thousand)";
const NUMRUN = new RegExp(`\\b${WORD}(?:[\\s-]+(?:and[\\s-]+)?${WORD})*\\b`, "gi");
function numberWords(text) {
  return String(text).replace(NUMRUN, (m) => {
    let total = 0, cur = 0;
    for (const t of m.toLowerCase().split(/[\s-]+/)) {
      if (t === "and") continue;
      if (t === "hundred") cur = (cur || 1) * 100;
      else if (t === "thousand") { total += (cur || 1) * 1000; cur = 0; }
      else cur += SMALL[t];
    }
    return String(total + cur);
  });
}
// The model describing its evidence instead of the world ("Funders: not named
// in the sources reviewed") is a failed rewrite, whatever the checks say.
const META = /\b(not (?:named|specified|stated|identified|mentioned|given)(?: in the (?:sources?|quotes?)(?: reviewed)?)|in the (?:sources?|quotes?) reviewed|the quotes? (?:do not|don't|say|state)|according to the quotes?)\b/i;

// Every figure the line states must be inside a verified quote; every name
// (the audit's strong names, not the words that open a sentence) must be on a
// cited page.
async function judge(log, f) {
  if (STRICT) {
    for (const s of log.sources) s.rated = rated(s.url, log.claim || f.text);
    const good = log.sources.filter((s) => s.rated);
    log.unrated = log.sources.filter((s) => !s.rated).map((s) => s.url);
    if (good.length) log.sources = good;
    log.weak = !good.length;
  }
  const said = (log.n ? log.n + " " : "") + log.text;
  const quoted = log.sources.flatMap((s) => s.quotes).join(" ");
  const onQuotes = claimCheck(numberWords(said), numberWords(quoted));
  const pagesText = norm((await Promise.all(log.sources.map(async (s) => (await page(s.url)).text))).join("\n"));
  log.numbersNotQuoted = (onQuotes.missing || []).filter((m) => /\d/.test(m));
  // a line's own labels ("Funders:", "Hidden:") are not names
  const named = claimTokens(said.replace(/\b(?:Funders|Hidden|Critics argue|Watchdogs warn):/g, "")).names || [];
  log.namesNotOnPages = named.filter((nm) => !pagesText.includes(norm(nm)));
  log.namesNotQuoted = named.filter((nm) => !norm(quoted).includes(norm(nm)));
  log.unitClash = unitClash(said, quoted);
  const short = String(log.text || "").replace(/[^A-Za-z0-9]/g, "").length < 20;
  const meta = META.test(String(log.text || ""));
  log.pass = !log.weak && !short && !meta && !log.unitClash.length && !log.numbersNotQuoted.length && !log.namesNotOnPages.length && (f.kind !== "stat" || !!log.n);
  log.why = log.pass ? "" : log.weak ? "only unrated sources state it" : short ? "rewrite too short" : meta ? "the rewrite talks about its sources, not the subject" : log.unitClash.length ? "unit differs from the quote: " + log.unitClash.join(", ") : log.numbersNotQuoted.length ? "figures not in any quote" : log.namesNotOnPages.length ? "names not on the cited pages" : "no headline figure";
  return log;
}

// ---- run -------------------------------------------------------------------
const facts = JSON.parse(fs.readFileSync(opt("facts"), "utf8"));
const args = ARGV, want = ARGV.filter((a, i) => !a.startsWith("--") && !(i && /^--(facts|out|hints|corpus|urlmap)$/.test(ARGV[i - 1])));
const logOf = (f) => (fs.existsSync(OUT + f.id + ".json") ? JSON.parse(fs.readFileSync(OUT + f.id + ".json", "utf8")) : null);
// --rejudge: re-run the checks on what is already researched, no model calls
if (args.includes("--rejudge")) {
  for (const f of facts) {
    const r = logOf(f);
    if (!r || !r.text || !(r.sources || []).length) continue;
    if (f.kind !== "stat") r.n = "";
    const was = r.pass;
    await judge(r, f);
    fs.writeFileSync(OUT + f.id + ".json", JSON.stringify(r, null, 1));
    if (was !== r.pass) console.log(`${r.pass ? "now ok" : "now FAIL"} ${f.id} ${r.why}`);
  }
}
// --retry: everything not yet passed
const retry = args.includes("--retry");
const todo = args.includes("--rejudge") ? [] : facts.filter((f) => (want.length ? want.includes(f.id) : retry ? !(logOf(f)?.pass) : !logOf(f)));
console.log(`${todo.length} facts, model ${MODEL}, ${corpus.length} saved pages`);
let next = 0;
async function worker() {
  while (next < todo.length) {
    const f = todo[next++];
    let r;
    try { r = await research(f); } catch (e) { r = { id: f.id, pass: false, why: e.message }; if (/budget/.test(e.message)) { console.log(e.message); return; } }
    fs.writeFileSync(OUT + f.id + ".json", JSON.stringify(r, null, 1));
    console.log(`${r.pass ? "ok  " : "FAIL"} ${f.id.padEnd(11)} ${r.sources?.length || 0} src  $${spent.toFixed(3)}  ${r.why || ""}`);
  }
}
await Promise.all(Array.from({ length: Number(process.env.WORKERS || 3) }, worker));

// ---- collect: build.mjs's verified.json and a report ------------------------
// short publisher names and month dates: research/source-labels.mjs
const verified = [], report = [];
for (const f of facts) {
  const p = OUT + f.id + ".json";
  if (!fs.existsSync(p)) continue;
  const r = JSON.parse(fs.readFileSync(p, "utf8"));
  report.push({ id: r.id, pass: r.pass, why: r.why || "", was: r.claim, now: r.text ? (r.n ? r.n + " " : "") + r.text : "", dropped: r.dropped || "", lost: r.lost || "", corrected: r.corrected || "", sources: (r.sources || []).map((s) => `${s.supports} ${s.url} (${s.via})`), namesNotQuoted: r.namesNotQuoted || [] });
  if (!r.pass) continue;
  const label = r.sources.map((s) => [s.publisher, s.date && `(${s.date})`].filter(Boolean).join(" ")).filter(Boolean).join("; ");
  verified.push({ id: r.id, text: r.text, ...(r.n ? { n: r.n } : {}), status: f.status, src_label: label || f.src, ...(r.lost ? { lost: r.lost } : {}), sources: r.sources.map(({ url, publisher, date, quotes }) => ({ url, publisher: cleanPub(url, publisher), date: cleanDate(date), publisherFull: publisher, dateText: date, quotes })) });
}
// The digest is what a person reads before anything ships: the rewrites that
// lost their point first, then the failures, then everything that changed.
const digest = ["# Re-check digest", ""];
const line = (r) => `## ${r.id} ${r.pass ? "PASS" : "FAIL: " + r.why}\n- was: ${r.was}\n- now: ${r.now || "(none)"}${r.lost ? "\n- LOST: " + r.lost : ""}${r.corrected ? "\n- corrected: " + r.corrected : ""}${r.dropped ? "\n- dropped: " + r.dropped : ""}\n- sources: ${r.sources.join(" ; ") || "none"}\n`;
for (const r of report.filter((x) => x.pass && x.lost)) digest.push(line(r));
for (const r of report.filter((x) => !x.pass)) digest.push(line(r));
for (const r of report.filter((x) => x.pass && !x.lost && x.now.replace(/\s+/g, " ") !== x.was.replace(/\s+/g, " "))) digest.push(line(r));
fs.writeFileSync(OUT + "digest.md", digest.join("\n"));
fs.writeFileSync(OUT + "verified.json", JSON.stringify(verified, null, 1));
fs.writeFileSync(OUT + "report.json", JSON.stringify(report, null, 1));
console.log(`\n${verified.length} verified of ${report.length} researched; ${calls} model calls, $${spent.toFixed(3)}`);
