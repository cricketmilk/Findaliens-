import express from 'express';
import { layout, esc, formatDate } from '../layout.js';
import { listPosts, getPost, renderPost } from '../posts.js';
import { listGuestbook, addGuestbook, listComments, addComment } from '../store.js';

export const publicRouter = express.Router();

const CONSPIRACIES = [
  'Birds are government surveillance drones. This has been true since 1963. Wake up.',
  'The moon is a paid actor. Look into it.',
  'Big Snack Food is hiding the fourth flavor of Pringles.',
  'Gravity is fake. It is just the Earth being clingy.',
  'Every traffic light is timed specifically to ruin YOUR morning.',
  'The Denver Airport murals are just... murals. OR ARE THEY.',
  'Your cat knows where you keep the good treats. It is not telling you.',
  'Wi-Fi signals are why you cannot remember phone numbers anymore. Fact.',
];

function catBadge(category) {
  const c = category || 'Uncategorized';
  return `<span class="cat-badge cat-${esc(c)} cat-${esc(c.toLowerCase())}">${esc(c)}</span>`;
}

function postCard(post) {
  return `
    <div class="post-card">
      <div>${catBadge(post.category)} <span class="post-meta">${esc(formatDate(post.date))}</span></div>
      <a class="post-title" href="/post/${esc(post.slug)}">${esc(post.title)}</a>
      ${post.blurb ? `<p class="post-blurb">${esc(post.blurb)}</p>` : ''}
    </div>`;
}

// ---------- Home ----------
publicRouter.get('/', (req, res) => {
  const posts = listPosts().slice(0, 5);
  const day = Math.floor(Date.now() / 86400000);
  const cotd = CONSPIRACIES[day % CONSPIRACIES.length];

  const body = `
    <div class="construction">🚧 UNDER CONSTRUCTION (permanently) 🚧</div>
    <div class="panel">
      <h2>WELCOME, HUMAN</h2>
      <p class="comic">You have stumbled upon the internet's most average website. Here we publish conspiracy theories of questionable quality, comedy of even more questionable quality, and occasionally just... other things.</p>
      <p class="blink" style="color:var(--neon-pink)">★ NEW CONTENT WHENEVER WE REMEMBER ★</p>
    </div>
    <div class="panel panel-alt">
      <h2>CONSPIRACY OF THE DAY</h2>
      <p class="terminal">${esc(cotd)}</p>
    </div>
    <div class="panel">
      <h2>LATEST TRANSMISSIONS</h2>
      ${posts.length ? posts.map(postCard).join('') : '<p class="muted">No posts yet. The author is probably asleep.</p>'}
    </div>`;

  res.send(layout({ title: 'Home', body, req }));
});

// ---------- Archive ----------
publicRouter.get('/posts', (req, res) => {
  const posts = listPosts();
  const body = `
    <div class="panel">
      <h2>THE ARCHIVE</h2>
      <p class="muted">Every unremarkable transmission, in reverse-chronological order of dubiousness.</p>
    </div>
    ${posts.length ? posts.map(postCard).join('') : '<div class="panel"><p class="muted">Nothing here yet. Impressive emptiness.</p></div>'}`;

  res.send(layout({ title: 'Archive', body, req }));
});

// ---------- Single post ----------
publicRouter.get('/post/:slug', (req, res) => {
  const post = getPost(req.params.slug);
  if (!post) {
    return res.status(404).send(
      layout({ title: '404', body: '<div class="panel center"><h2>404</h2><p class="comic">That page was abducted.</p></div>', req }),
    );
  }

  const comments = listComments(post.slug);
  const commentsHtml = comments
    .map(
      (c) => `
    <div class="entry">
      <div class="entry-head">${esc(c.name)}</div>
      <div class="entry-date">${esc(formatDate(c.createdAt.slice(0, 10)))}</div>
      <div class="entry-body">${esc(c.message)}</div>
    </div>`,
    )
    .join('');

  const flash = req.query.commented
    ? '<div class="flash">✓ TRANSMISSION RECEIVED</div>'
    : req.query.err === 'empty'
      ? '<div class="flash">✗ You must type something, human.</div>'
      : '';

  const body = `
    ${flash}
    <article class="panel">
      <div>${catBadge(post.category)} <span class="post-meta">${esc(formatDate(post.date))}</span></div>
      <h2 style="font-size:2rem;color:var(--neon-teal);border:none">${esc(post.title)}</h2>
      ${post.tags.length ? `<div class="post-tags">${post.tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
      <div class="post-body">${renderPost(post)}</div>
    </article>
    <div class="panel panel-alt">
      <h3>COMMENTS (${comments.length})</h3>
      ${commentsHtml || '<p class="muted">No comments yet. Be the first to post a highly specific theory.</p>'}
      <form method="post" action="/post/${esc(post.slug)}/comment">
        <div class="field"><label>NAME (optional)</label><input type="text" name="name" maxlength="60"></div>
        <div class="field"><label>YOUR THEORY</label><textarea name="message" required maxlength="2000"></textarea></div>
        <button class="btn" type="submit">TRANSMIT</button>
      </form>
    </div>`;

  res.send(layout({ title: post.title, body, req }));
});

publicRouter.post('/post/:slug/comment', (req, res) => {
  const post = getPost(req.params.slug);
  if (!post) return res.status(404).send('not found');
  const message = (req.body.message || '').trim();
  if (!message) return res.redirect(`/post/${encodeURIComponent(post.slug)}?err=empty`);
  addComment(post.slug, { name: req.body.name, message });
  res.redirect(`/post/${encodeURIComponent(post.slug)}?commented=1`);
});

// ---------- Guestbook ----------
publicRouter.get('/guestbook', (req, res) => {
  const entries = listGuestbook();
  const flash = req.query.signed
    ? '<div class="flash">✓ SIGNED! You are now a permanent part of internet history.</div>'
    : req.query.err === 'empty'
      ? '<div class="flash">✗ You must write something before signing.</div>'
      : '';

  const entriesHtml = entries
    .map(
      (e) => `
    <div class="entry">
      <div class="entry-head">${esc(e.name)}</div>
      <div class="entry-date">${esc(formatDate(e.createdAt.slice(0, 10)))}</div>
      <div class="entry-body">${esc(e.message)}</div>
    </div>`,
    )
    .join('');

  const body = `
    ${flash}
    <div class="panel">
      <h2>SIGN THE GUESTBOOK</h2>
      <p class="comic">Like it's 1998. Leave your mark. Compliment the webmaster. Warn us about the moon.</p>
    </div>
    <div class="panel panel-alt">
      <h3>WRITE SOMETHING</h3>
      <form method="post" action="/guestbook">
        <div class="field"><label>NAME (optional)</label><input type="text" name="name" maxlength="60"></div>
        <div class="field"><label>MESSAGE</label><textarea name="message" required maxlength="2000"></textarea></div>
        <button class="btn" type="submit">SIGN IT</button>
      </form>
    </div>
    <div class="panel">
      <h3>ENTRIES (${entries.length})</h3>
      ${entriesHtml || '<p class="muted">The guestbook is empty. How dare you not sign it.</p>'}
    </div>`;

  res.send(layout({ title: 'Guestbook', body, req }));
});

publicRouter.post('/guestbook', (req, res) => {
  const message = (req.body.message || '').trim();
  if (!message) return res.redirect('/guestbook?err=empty');
  addGuestbook({ name: req.body.name, message });
  res.redirect('/guestbook?signed=1');
});

// ---------- About ----------
publicRouter.get('/about', (req, res) => {
  const body = `
    <div class="panel">
      <h2>ABOUT THE UNREMARKABLE HUMAN</h2>
      <p class="comic">This website is run by one (1) unremarkable human, operating out of a location that is definitely not a government facility.</p>
      <p>It exists to publish:</p>
      <ul class="comic">
        <li><strong>Conspiracy theories</strong> — the kind that make you say "huh" and then immediately forget.</li>
        <li><strong>Comedy / parody</strong> — legally distinct from real journalism.</li>
        <li><strong>Other things</strong> — a legally required catch-all for whatever else happens.</li>
      </ul>
      <p class="muted">Everything here is satire and parody. If you take this seriously, please seek help (or a hobby).</p>
    </div>
    <div class="panel panel-alt terminal">
      &gt; WHO IS WATCHING?<br>
      &gt; Everyone. Especially the birds.<br>
      &gt; _<span class="blink">▌</span>
    </div>`;

  res.send(layout({ title: 'About', body, req }));
});
