// research/ingest/ingest.mjs
// Unified OSINT ingestion CLI runner with disk caching, exponential backoff, and offline {VERIFY} fallback.
// Usage:
//   node research/ingest/ingest.mjs --topic "1915 Lusitania" --year 1915 --providers courtlistener,hansard
// Never crashes on network failure and never fabricates a URL.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import * as courtlistener from './courtlistener.mjs';
import * as govinfo from './govinfo.mjs';
import * as congress from './congress.mjs';
import * as hansard from './hansard.mjs';
import * as loc from './loc.mjs';
import * as edgar from './edgar.mjs';
import * as usaspending from './usaspending.mjs';
import * as wikidata from './wikidata.mjs';
import * as opencorporates from './opencorporates.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_DIR = path.join(__dirname, 'cache');

const PROVIDERS = {
  courtlistener,
  govinfo,
  congress,
  hansard,
  loc,
  edgar,
  usaspending,
  wikidata,
  opencorporates
};

function loadDotEnv() {
  const envPath = path.resolve(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(k in process.env)) process.env[k] = v;
    }
  }
}

async function fetchWithBackoff(reqSpec, headers, retries = 2, delayMs = 600) {
  const url = typeof reqSpec === 'string' ? reqSpec : reqSpec.url;
  const method = typeof reqSpec === 'string' ? 'GET' : reqSpec.method || 'GET';
  const body = typeof reqSpec === 'string' ? undefined : reqSpec.body;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // 30s, not 8s: loc.gov search routinely takes >8s to return a body (verified live
      // 2026-10-14 — 8s aborted every loc fetch and silently turned real results into {VERIFY}).
      const res = await fetch(url, { method, headers, body, signal: AbortSignal.timeout(30000) });
      if (res.status === 429 && attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, attempt)));
    }
  }
}

export async function ingestTopic({ topic, year, providerNames, offline = false }) {
  loadDotEnv();
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const selected = providerNames.map((n) => n.trim().toLowerCase()).filter(Boolean);
  const allCitations = [];

  for (const name of selected) {
    const mod = PROVIDERS[name];
    if (!mod) {
      throw new Error(`[ingest] Unknown provider "${name}". Available: ${Object.keys(PROVIDERS).join(', ')}`);
    }

    const cacheKey = crypto
      .createHash('sha256')
      .update(`${name}::${topic}::${year || ''}`)
      .digest('hex')
      .slice(0, 16);
    const cacheFile = path.join(CACHE_DIR, `${name}-${cacheKey}.json`);

    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      allCitations.push(...cached);
      continue;
    }

    if (offline) {
      const fallbackRows = mod.mapResponseToCitations(null, { topic, year });
      allCitations.push(...fallbackRows);
      continue;
    }

    try {
      const reqSpec = mod.buildQuery({ topic, year }, process.env);
      const headers = mod.buildHeaders(process.env);
      const rawJson = await fetchWithBackoff(reqSpec, headers);
      const mapped = mod.mapResponseToCitations(rawJson, { topic, year });
      fs.writeFileSync(cacheFile, JSON.stringify(mapped, null, 2), 'utf8');
      allCitations.push(...mapped);
    } catch {
      // Offline / network failure mode: emit {VERIFY} tokens, never crash, never fabricate
      const fallbackRows = mod.mapResponseToCitations(null, { topic, year });
      allCitations.push(...fallbackRows);
    }
  }

  return allCitations;
}

function parseCliArgs(argv) {
  const args = { topic: '', year: undefined, providers: 'courtlistener,hansard', offline: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--topic' && argv[i + 1]) args.topic = argv[++i];
    else if (argv[i] === '--year' && argv[i + 1]) args.year = Number(argv[++i]);
    else if (argv[i] === '--providers' && argv[i + 1]) args.providers = argv[++i];
    else if (argv[i] === '--offline') args.offline = true;
  }
  return args;
}

// Portable main guard (see migrate.mjs): the raw file:// compare never matches on
// Windows paths (the repo path contains a space), so resolve both sides instead.
if (path.resolve(process.argv[1]) === __filename) {
  const cli = parseCliArgs(process.argv);
  if (!cli.topic) {
    console.error('Usage: node research/ingest/ingest.mjs --topic "<topic>" [--year YYYY] [--providers p1,p2] [--offline]');
    process.exit(1);
  }
  const rows = await ingestTopic({
    topic: cli.topic,
    year: cli.year,
    providerNames: cli.providers.split(','),
    offline: cli.offline
  });
  console.log(JSON.stringify(rows, null, 2));
}