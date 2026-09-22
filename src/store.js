import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from './config.js';

// JSON-file data store. Synchronous reads/writes are fine here because Node is
// single-threaded and this is a low-traffic hobby site. Writes go through a
// temp file + rename so a crash mid-write can't corrupt the data.

fs.mkdirSync(config.dataDir, { recursive: true });

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

// ---------- Guestbook ----------
const guestbookFile = () => path.join(config.dataDir, 'guestbook.json');

export function listGuestbook() {
  return readJson(guestbookFile(), []).slice().reverse();
}

export function addGuestbook({ name, message }) {
  const entries = readJson(guestbookFile(), []);
  const entry = {
    id: crypto.randomUUID(),
    name: (name || '').trim() || 'Anonymous Human',
    message: (message || '').trim(),
    createdAt: new Date().toISOString(),
  };
  entries.push(entry);
  writeJson(guestbookFile(), entries);
  return entry;
}

export function deleteGuestbook(id) {
  const entries = readJson(guestbookFile(), []);
  const next = entries.filter((e) => e.id !== id);
  writeJson(guestbookFile(), next);
  return next.length !== entries.length;
}

// ---------- Comments (keyed by post slug) ----------
const commentsFile = () => path.join(config.dataDir, 'comments.json');

export function listComments(postSlug) {
  const all = readJson(commentsFile(), {});
  return (all[postSlug] || []).slice().reverse();
}

export function addComment(postSlug, { name, message }) {
  const all = readJson(commentsFile(), {});
  const list = all[postSlug] || [];
  const comment = {
    id: crypto.randomUUID(),
    name: (name || '').trim() || 'Anonymous Human',
    message: (message || '').trim(),
    createdAt: new Date().toISOString(),
  };
  list.push(comment);
  all[postSlug] = list;
  writeJson(commentsFile(), all);
  return comment;
}

export function deleteComment(postSlug, id) {
  const all = readJson(commentsFile(), {});
  const list = (all[postSlug] || []).filter((c) => c.id !== id);
  all[postSlug] = list;
  writeJson(commentsFile(), all);
  return true;
}

// All comments across every post, newest first (for the admin dashboard).
export function listAllComments() {
  const all = readJson(commentsFile(), {});
  const out = [];
  for (const [postSlug, list] of Object.entries(all)) {
    for (const c of list) out.push({ postSlug, ...c });
  }
  out.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return out;
}

// ---------- Hit counter ----------
const counterFile = () => path.join(config.dataDir, 'counter.json');

export function getCounter() {
  return readJson(counterFile(), { visits: 0 }).visits || 0;
}

export function incrementCounter() {
  const data = readJson(counterFile(), { visits: 0 });
  data.visits = (data.visits || 0) + 1;
  writeJson(counterFile(), data);
  return data.visits;
}
