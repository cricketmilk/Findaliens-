import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { config } from './config.js';

// Posts are plain Markdown files in /posts with simple YAML-ish frontmatter:
//
//   ---
//   title: My Very Real Conspiracy
//   date: 2026-08-16
//   category: Conspiracy
//   tags: aliens, birds, wifi
//   blurb: One weird trick the government HATES
//   ---
//   ...markdown body...

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/\.md$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, content: raw };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) data[key] = value;
  }
  return { data, content: raw.slice(match[0].length) };
}

function parseTags(raw) {
  return String(raw || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export function listPosts() {
  if (!fs.existsSync(config.postsDir)) return [];
  const files = fs.readdirSync(config.postsDir).filter((f) => f.endsWith('.md'));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(config.postsDir, file), 'utf8');
    const { data, content } = parseFrontmatter(raw);
    return {
      slug: slugify(data.title || file),
      file,
      title: data.title || slugify(file),
      date: data.date || '',
      category: data.category || 'Uncategorized',
      tags: parseTags(data.tags),
      blurb: data.blurb || '',
      content,
    };
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}

export function getPost(slug) {
  return listPosts().find((p) => p.slug === slug) || null;
}

export function renderPost(post) {
  return marked.parse(post.content);
}

export function createPost({ title, category, tags, blurb, content }) {
  const slug = slugify(title) || 'untitled';
  const date = new Date().toISOString().slice(0, 10);
  const lines = ['---', `title: ${title}`, `date: ${date}`];
  if (category) lines.push(`category: ${category}`);
  if (tags) lines.push(`tags: ${tags}`);
  if (blurb) lines.push(`blurb: ${blurb}`);
  lines.push('---', '', content || '');

  let file = `${slug}.md`;
  let n = 1;
  while (fs.existsSync(path.join(config.postsDir, file))) {
    file = `${slug}-${n}.md`;
    n += 1;
  }
  fs.writeFileSync(path.join(config.postsDir, file), lines.join('\n'), 'utf8');
  return { slug, file };
}

export function deletePost(slug) {
  const post = getPost(slug);
  if (!post) return false;
  fs.unlinkSync(path.join(config.postsDir, post.file));
  return true;
}
