import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(__dirname, '..');

// Tiny .env loader — KEY=VALUE lines, # comments, no dependencies.
function loadEnv(file) {
  try {
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // no .env file — that's fine, we fall back to defaults
  }
}
loadEnv(path.join(root, '.env'));

const port = Number(process.env.PORT) || 3000;
const adminPassword = process.env.ADMIN_PASSWORD || 'unremarkable';
const sessionSecret =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    '⚠  ADMIN_PASSWORD not set — using default "unremarkable". Set it in .env!',
  );
}

export const config = {
  root,
  postsDir: path.join(root, 'posts'),
  dataDir: path.join(root, 'data'),
  publicDir: path.join(root, 'public'),
  port,
  adminPassword,
  sessionSecret,
};
