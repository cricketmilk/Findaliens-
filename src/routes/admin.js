import express from 'express';
import { layout, esc, formatDate } from '../layout.js';
import { config } from '../config.js';
import { listPosts, createPost, deletePost } from '../posts.js';
import { listGuestbook, deleteGuestbook, listAllComments, deleteComment } from '../store.js';

export const adminRouter = express.Router();

function requireAdmin(req, res, next) {
  if (req.session && req.session.authenticated) return next();
  res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
}

// ---------- Login / logout ----------
adminRouter.get('/login', (req, res) => {
  if (req.session.authenticated) return res.redirect('/admin');
  const body = `
    <div class="panel">
      <h2>SECRET LAIR ENTRANCE</h2>
      <p class="comic">Authorized humans only. The rest of you, go read the conspiracy posts.</p>
      ${req.query.err ? '<div class="flash">✗ WRONG PASSWORD, HUMAN</div>' : ''}
      <form method="post" action="/login">
        <div class="field"><label>PASSWORD</label><input type="password" name="password" autofocus required></div>
        <button class="btn" type="submit">ENTER</button>
      </form>
    </div>`;
  res.send(layout({ title: 'Login', body, req }));
});

adminRouter.post('/login', (req, res) => {
  const pw = String(req.body.password || '');
  if (pw === config.adminPassword) {
    req.session.authenticated = true;
    return res.redirect(req.query.next || '/admin');
  }
  res.redirect('/login?err=1');
});

adminRouter.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

// ---------- Dashboard ----------
adminRouter.get('/admin', requireAdmin, (req, res) => {
  const posts = listPosts();
  const comments = listAllComments().slice(0, 30);
  const guestbook = listGuestbook().slice(0, 30);

  const postsHtml = posts
    .map(
      (p) => `
    <tr>
      <td><a href="/post/${esc(p.slug)}">${esc(p.title)}</a></td>
      <td>${esc(p.category)}</td>
      <td>${esc(formatDate(p.date))}</td>
      <td>
        <form class="inline-form" method="post" action="/admin/delete-post/${esc(p.slug)}" onsubmit="return confirm('Delete this post forever?');">
          <button class="btn btn-danger" type="submit">DELETE</button>
        </form>
      </td>
    </tr>`,
    )
    .join('');

  const commentsHtml = comments
    .map(
      (c) => `
    <div class="entry">
      <div class="entry-head">${esc(c.name)} <span class="muted small">on "${esc(c.postSlug)}"</span></div>
      <div class="entry-body">${esc(c.message)}</div>
      <form class="inline-form" method="post" action="/admin/delete-comment/${esc(c.postSlug)}/${esc(c.id)}">
        <button class="btn btn-danger" type="submit">DELETE</button>
      </form>
    </div>`,
    )
    .join('');

  const guestbookHtml = guestbook
    .map(
      (g) => `
    <div class="entry">
      <div class="entry-head">${esc(g.name)}</div>
      <div class="entry-body">${esc(g.message)}</div>
      <form class="inline-form" method="post" action="/admin/delete-guestbook/${esc(g.id)}">
        <button class="btn btn-danger" type="submit">DELETE</button>
      </form>
    </div>`,
    )
    .join('');

  const body = `
    <div class="panel">
      <h2>SECRET LAIR — CONTROL PANEL</h2>
      <p class="muted">Welcome back, unremarkable overlord.</p>
      <a class="btn" href="/admin/new-post">+ NEW POST</a>
    </div>
    <div class="panel">
      <h3>POSTS (${posts.length})</h3>
      ${posts.length ? `<table class="admin-table"><tr><th>TITLE</th><th>CATEGORY</th><th>DATE</th><th></th></tr>${postsHtml}</table>` : '<p class="muted">No posts yet.</p>'}
    </div>
    <div class="panel">
      <h3>RECENT COMMENTS (${comments.length})</h3>
      ${commentsHtml || '<p class="muted">No comments yet.</p>'}
    </div>
    <div class="panel">
      <h3>RECENT GUESTBOOK (${guestbook.length})</h3>
      ${guestbookHtml || '<p class="muted">Guestbook is empty.</p>'}
    </div>`;

  res.send(layout({ title: 'Admin', body, req }));
});

// ---------- New post ----------
adminRouter.get('/admin/new-post', requireAdmin, (req, res) => {
  const body = `
    <div class="panel">
      <h2>NEW TRANSMISSION</h2>
      ${req.query.err ? '<div class="flash">✗ A title and a body are both required.</div>' : ''}
      <form method="post" action="/admin/new-post">
        <div class="field"><label>TITLE</label><input type="text" name="title" required maxlength="140"></div>
        <div class="field"><label>CATEGORY</label><input type="text" name="category" list="categories" value="Conspiracy"></div>
        <datalist id="categories">
          <option value="Conspiracy"><option value="Comedy"><option value="Parody">
          <option value="UFOs"><option value="Technology"><option value="Cryptids"><option value="Other">
        </datalist>
        <div class="field"><label>TAGS (comma separated)</label><input type="text" name="tags" maxlength="200"></div>
        <div class="field"><label>BLURB (short summary)</label><input type="text" name="blurb" maxlength="300"></div>
        <div class="field"><label>BODY (markdown or HTML)</label><textarea name="content" required rows="14"></textarea></div>
        <button class="btn" type="submit">PUBLISH TO THE INTERNET</button>
      </form>
      <p class="muted small">Markdown supported: headings (#), bold (**), italics (*), lists (-), quotes (&gt;), links, images, code.</p>
    </div>`;
  res.send(layout({ title: 'New Post', body, req }));
});

adminRouter.post('/admin/new-post', requireAdmin, (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  if (!title || !content) return res.redirect('/admin/new-post?err=1');
  const { slug } = createPost({
    title,
    category: req.body.category || 'Other',
    tags: req.body.tags,
    blurb: req.body.blurb,
    content,
  });
  res.redirect('/post/' + encodeURIComponent(slug));
});

// ---------- Deletes ----------
adminRouter.post('/admin/delete-post/:slug', requireAdmin, (req, res) => {
  deletePost(req.params.slug);
  res.redirect('/admin');
});

adminRouter.post('/admin/delete-comment/:slug/:id', requireAdmin, (req, res) => {
  deleteComment(req.params.slug, req.params.id);
  res.redirect('/admin');
});

adminRouter.post('/admin/delete-guestbook/:id', requireAdmin, (req, res) => {
  deleteGuestbook(req.params.id);
  res.redirect('/admin');
});
