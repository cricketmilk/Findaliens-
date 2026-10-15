// research/ingest/probe-provider.mjs
// Raw-response probe for provider smoke tests: builds the provider query, fetches it,
// and prints the RAW json (top-level keys + first result objects) BEFORE mapping —
// so mapping bugs (wrong key, silent discard) can be told apart from empty results.
// Read-only: never writes cache, never maps, never fabricates.
// Usage: node research/ingest/probe-provider.mjs --provider govinfo --topic "..." --year 1929

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq > 0 && !(t.slice(0, eq).trim() in process.env)) {
      process.env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

function truncate(v, n = 160) {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  return s.length > n ? s.slice(0, n) + '…' : s;
}

const argv = process.argv.slice(2);
const pick = (flag) => (argv.indexOf(flag) >= 0 ? argv[argv.indexOf(flag) + 1] : undefined);
const name = pick('--provider');
const rawUrl = pick('--url');
const topic = pick('--topic') || '';
const year = pick('--year') ? Number(pick('--year')) : undefined;

if (!name && !rawUrl) {
  console.error('Usage: node research/ingest/probe-provider.mjs --provider <name> --topic "<t>" [--year YYYY] | --url <url>');
  process.exit(1);
}

loadDotEnv();

if (rawUrl) {
  // --url mode: fetch a raw URL (GET), print status + top-level shape + first result.
  try {
    const res = await fetch(rawUrl, { headers: { Accept: 'application/json', 'User-Agent': 'CornfieldGazette-OSINT/2.0' }, signal: AbortSignal.timeout(20000) });
    console.log(`[probe] ${res.status} ${res.statusText} <- ${rawUrl}`);
    const json = JSON.parse(await res.text());
    for (const [k, v] of Object.entries(json)) {
      if (Array.isArray(v)) {
        console.log(`[probe] "${k}": array[${v.length}]`);
        if (v.length && typeof v[0] === 'object') console.log(`[probe]   [0]: ${truncate(v[0], 1200)}`);
      } else {
        console.log(`[probe] "${k}": ${truncate(v, 200)}`);
      }
    }
  } catch (err) {
    console.log(`[probe] FETCH FAILED: ${err && err.message ? err.message : err}`);
  }
  process.exit(0);
}

const mod = await import(`./${name}.mjs`);

const reqSpec = mod.buildQuery({ topic, year }, process.env);
const headers = mod.buildHeaders(process.env);
const url = typeof reqSpec === 'string' ? reqSpec : reqSpec.url;
console.log(`[probe] ${name} -> ${url}`);

try {
  const res = await fetch(url, {
    method: typeof reqSpec === 'string' ? 'GET' : (reqSpec.method || 'GET'),
    headers,
    body: typeof reqSpec === 'string' ? undefined : reqSpec.body,
    signal: AbortSignal.timeout(15000)
  });
  console.log(`[probe] status ${res.status} ${res.statusText}`);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { console.log(`[probe] non-JSON body (first 400 chars):\n${text.slice(0, 400)}`); process.exit(0); }
  const top = Array.isArray(json) ? `array[${json.length}]` : `object keys: ${Object.keys(json).join(', ')}`;
  console.log(`[probe] body ${top}`);
  if (Array.isArray(json)) {
    console.log(`[probe] first item:\n${JSON.stringify(json[0], null, 1).slice(0, 1400)}`);
  } else {
    for (const [k, v] of Object.entries(json)) {
      if (Array.isArray(v)) {
        console.log(`[probe] "${k}": array[${v.length}]`);
        if (v.length) console.log(`[probe]   [0]: ${truncate(v[0], 900)}`);
      } else {
        console.log(`[probe] "${k}": ${truncate(v, 200)}`);
      }
    }
  }
} catch (err) {
  console.log(`[probe] FETCH FAILED: ${err && err.message ? err.message : err}`);
}