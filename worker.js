// The Worker: the wire's two routes ahead of the static asset store.
//
//   POST /mut/say     Müt speaks. Bearer MUT_WIRE_TOKEN (a Wrangler secret),
//                     body ≤ 4 KB, timestamp within 60s of now, id never
//                     seen before — then stored in the Wire Durable Object.
//   GET  /mut/latest  What he last said, for the widget's 3s poll. Token-
//                     free, edge-cached for 2s, CORS only to the known sites.
//   anything else     the gazette, as static assets from public/ (that
//                     includes the widget itself, /mut/mut.js).
//
// This shim also exists for an older reason: an assets-ONLY Worker does not
// execute on zone routes, and zone routes are how findaliens.net answers.

export { Wire } from "./wire/wire.js";

const MAX_BODY = 4096;
const MAX_SKEW_MS = 60000;
const ORIGINS = new Set([
  "https://findaliens.net",
  "https://www.findaliens.net",
  "https://findaliens.crinkle.workers.dev",
  "https://wheattodd.com",
  "https://www.wheattodd.com",
]);
const STATES = new Set([
  "idle", "happy", "confused", "angry", "rage", "sad", "surprised",
  "sleepy", "sick", "lovestruck", "alert", "sleeping", "channel",
]);

function cors(request) {
  const origin = request.headers.get("origin") || "";
  return ORIGINS.has(origin)
    ? { "access-control-allow-origin": origin, "vary": "origin" }
    : {};
}

function json(data, status, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

async function say(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
  const auth = request.headers.get("authorization") || "";
  if (!env.MUT_WIRE_TOKEN || auth !== `Bearer ${env.MUT_WIRE_TOKEN}`) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ ok: false, error: "too large" }, 413);
  let msg;
  try { msg = JSON.parse(raw); } catch { return json({ ok: false, error: "bad json" }, 400); }

  // Shape it here so the DO and the page only ever see a known message.
  const at = Number(msg.at);
  if (!Number.isFinite(at) || Math.abs(Date.now() - at) > MAX_SKEW_MS) {
    return json({ ok: false, error: "clock skew" }, 400);
  }
  const clean = {
    id: String(msg.id || "").slice(0, 64),
    at,
    ttl: Math.max(3000, Math.min(120000, Number(msg.ttl) || 20000)),
    text: String(msg.text || "").slice(0, 280),
    state: STATES.has(msg.state) ? msg.state : "idle",
    via: "host",
  };
  if (!clean.id || !clean.text) return json({ ok: false, error: "empty" }, 400);
  if (typeof msg.graphic === "string" && /^(https:\/\/|\/)/.test(msg.graphic)) {
    clean.graphic = msg.graphic.slice(0, 512);
  }

  const stub = env.WIRE.get(env.WIRE.idFromName("findaliens"));
  const r = await stub.fetch("https://wire/say", { method: "POST", body: JSON.stringify(clean) });
  return new Response(await r.text(), { status: r.status, headers: { "content-type": "application/json" } });
}

async function latest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { ...cors(request), "access-control-allow-methods": "GET" } });
  }
  if (request.method !== "GET") return json({ ok: false, error: "method" }, 405);
  const stub = env.WIRE.get(env.WIRE.idFromName("findaliens"));
  const r = await stub.fetch("https://wire/latest");
  return new Response(await r.text(), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "public, max-age=2",
      ...cors(request),
    },
  });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/mut/say") return say(request, env);
    if (pathname === "/mut/latest") return latest(request, env);
    return env.ASSETS.fetch(request);
  },
};
