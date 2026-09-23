// from-trove.mjs, against a fixture Trove.
//
//     node --test from-trove.test.mjs
//
// Runs the real CLI in a subprocess with TROVE_INDEX pointed at a fixture, so
// what is tested is the thing you actually run, flags and all.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const HERE = import.meta.dirname;
const SCRIPT = path.join(HERE, "from-trove.mjs");

function trove(rows) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "trove-fx-"));
  const file = path.join(dir, "index.jsonl");
  fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
  return { dir, file };
}

const clip = (url, extra = {}) => ({
  v: 1, id: "c" + Math.random().toString(36).slice(2), t: Date.now(),
  at: new Date().toISOString(), kind: "link", persona: "roam",
  src: { url, pageUrl: url, pageTitle: null }, text: null, agent: "context-menu",
  ...extra,
});

function run(file, args = []) {
  try {
    return execFileSync(process.execPath, [SCRIPT, ...args], {
      env: { ...process.env, TROVE_INDEX: file },
      encoding: "utf8", cwd: HERE, stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    return String(e.stdout || "") + String(e.stderr || "");
  }
}

test("a clipped source becomes a story stub with its link filled in", () => {
  const { dir, file } = trove([
    clip("https://example.com/drones-over-el-paso", { src: { url: "https://example.com/drones-over-el-paso", pageTitle: "Drones over El Paso" } }),
  ]);
  try {
    const out = run(file);
    assert.match(out, /<article class="story">/);
    assert.match(out, /href="https:\/\/example\.com\/drones-over-el-paso"/);
    // The headline comes from the page title, upper-cased, as a starting point.
    assert.match(out, /DRONES OVER EL PASO/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("the judgments a person has to make are left as TODOs", () => {
  const { dir, file } = trove([clip("https://example.com/a")]);
  try {
    const out = run(file);
    // A generated headline would be the one part of the Gazette nobody wrote.
    assert.match(out, /TODO — WRITE THE HEADLINE/);
    assert.match(out, /TODO — write the summary/);
    assert.match(out, /TODO — 1 settled, 5 heavily contested/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("selected text seeds the dek, but is marked as the source's words", () => {
  const { dir, file } = trove([
    clip("https://example.com/b", { kind: "selection", text: "The FAA closed the airspace over El Paso." }),
  ]);
  try {
    const out = run(file);
    assert.match(out, /The FAA closed the airspace over El Paso\./);
    assert.match(out, /SOURCE's wording/);
    assert.match(out, /Rewrite it/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("a source already linked on the page is not offered again", () => {
  // This URL is in public/index.html already.
  const onPage = "https://defensescoop.com/2026/07/21/pentagon-investigating-ufo-uap-event-near-virginia-coast/";
  const { dir, file } = trove([clip(onPage)]);
  try {
    assert.match(run(file), /Nothing new/);
    // …but --all overrides the dedupe.
    assert.match(run(file, ["--all"]), /<article class="story">/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("one source clipped several times is one story", () => {
  const u = "https://example.com/same";
  const { dir, file } = trove([clip(u), clip(u + "?utm_source=x"), clip(u + "/")]);
  try {
    const out = run(file);
    assert.equal(out.match(/<article class="story">/g).length, 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("reference material from the collecting jar is skipped by default", () => {
  const { dir, file } = trove([
    clip("https://www.pinterest.com/pin/123/", { persona: "curio", kind: "download" }),
    clip("https://example.com/real-story"),
  ]);
  try {
    const out = run(file);
    assert.doesNotMatch(out, /pinterest/i, "a pin is not a UAP story");
    assert.match(out, /real-story/);
    // …unless you ask for it.
    assert.match(run(file, ["--all-jars"]), /pinterest/i);
    // …or name the jar.
    assert.match(run(file, ["--jar", "curio"]), /pinterest/i);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("local files and the Gazette's own pages are never candidates", () => {
  const { dir, file } = trove([
    clip("file:///C:/McScrapey/assets/gallery.html"),
    clip("https://findaliens.net/whatever"),
    clip("http://localhost:8080/preview"),
  ]);
  try {
    assert.match(run(file), /Nothing new/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("--since narrows to recent clips", () => {
  const old = Date.now() - 40 * 86400000;
  const { dir, file } = trove([
    clip("https://example.com/ancient", { t: old, at: new Date(old).toISOString() }),
    clip("https://example.com/fresh"),
  ]);
  try {
    const out = run(file, ["--since", "7d"]);
    assert.match(out, /fresh/);
    assert.doesNotMatch(out, /ancient/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("a truncated final line does not stop the rest being read", () => {
  const { dir, file } = trove([clip("https://example.com/good")]);
  try {
    fs.appendFileSync(file, '{"v":1,"src":{"url":"https://example.com/trunc', "utf8");
    assert.match(run(file), /good/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("html in a clip is escaped, not injected into the page", () => {
  const { dir, file } = trove([
    clip("https://example.com/x", {
      kind: "selection",
      text: '</p><script>alert(1)</script><p class="dek">',
      src: { url: "https://example.com/x", pageTitle: '<img onerror=alert(2)>' },
    }),
  ]);
  try {
    const out = run(file);
    // A clip is somebody else's text. It lands in a file you paste into a
    // published page, so it has to arrive inert.
    assert.doesNotMatch(out, /<script>/);
    assert.doesNotMatch(out, /<img onerror/);
    assert.match(out, /&lt;script&gt;/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test("a missing Trove says where it looked", () => {
  const out = run(path.join(os.tmpdir(), "definitely-not-here", "index.jsonl"));
  assert.match(out, /No Trove at/);
  assert.match(out, /TROVE_INDEX/);
});
