import { getCounter } from './store.js';

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatDate(s) {
  if (!s) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s));
  if (!m) return String(s);
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  return `${months[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}

// A single reusable little UFO, drawn inline so there are no image assets.
const UFO_SVG = `
  <svg class="ufo-svg" viewBox="0 0 120 72" aria-hidden="true">
    <ellipse cx="60" cy="46" rx="46" ry="9" fill="#9aa5ad"/>
    <path d="M36 46 Q60 24 84 46 Z" fill="#d7e2e8"/>
    <circle cx="60" cy="40" r="6" fill="#7fd6d6"/>
    <path d="M18 52 Q60 62 102 52 L96 58 Q60 66 24 58 Z" fill="#6f7a82"/>
    <g class="ufo-lights">
      <circle cx="32" cy="55" r="2.5" fill="#ff4040"/>
      <circle cx="50" cy="57" r="2.5" fill="#ffe94a"/>
      <circle cx="68" cy="57" r="2.5" fill="#3bff6e"/>
      <circle cx="86" cy="55" r="2.5" fill="#ff40c0"/>
    </g>
    <ellipse cx="60" cy="69" rx="16" ry="3" fill="#33ffcc" opacity="0.25"/>
  </svg>`;

const NAV_LINKS = [
  ['/', 'HOME'],
  ['/posts', 'ARCHIVE'],
  ['/guestbook', 'GUESTBOOK'],
  ['/about', 'ABOUT'],
  ['/admin', 'SECRET LAIR'],
];

export function layout({ title, body, req }) {
  const authed = Boolean(req?.session?.authenticated);
  const visits = getCounter();
  const padded = String(visits).padStart(7, '0');

  const nav = NAV_LINKS.map(
    ([href, label]) => `<a class="nav-link" href="${href}">${label}</a>`,
  ).join('');

  const authControl = authed
    ? `<form class="inline-form" method="post" action="/logout"><button class="nav-link nav-auth" type="submit">LOGOUT</button></form>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="Conspiracy theories, comedy, and other unremarkable human content.">
<title>${esc(title)} — UNREMARKABLE HUMAN WEBSITE</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=VT323&family=Comic+Neue:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/style.css">
</head>
<body>
<div class="bg-stars" aria-hidden="true"></div>
<div class="scanlines" aria-hidden="true"></div>
<div class="ufo ufo-1" aria-hidden="true">${UFO_SVG}</div>
<div class="ufo ufo-2" aria-hidden="true">${UFO_SVG}</div>
<div class="ufo ufo-3" aria-hidden="true">${UFO_SVG}</div>

<div class="page">
  <marquee class="ticker" scrollamount="6" behavior="scroll">
    ★ WELCOME TO THE UNREMARKABLE HUMAN WEBSITE ★ 100% TRUE FACTS (citation needed) ★ THE BIRDS WORK FOR THE BOURGEOISIE ★ PIGEONS ARE JUST GOVERNMENT DRONES WITH PR ★ GEOCITIES NEVER TRULY DIED ★
  </marquee>

  <header class="site-header">
    <h1 class="site-title chrome-text">UNREMARKABLE<br>HUMAN WEBSITE</h1>
    <p class="tagline">conspiracy theories ★ comedy ★ definitely normal content ★ est. 1996 (mentally)</p>
  </header>

  <nav class="navbar">
    ${nav}
    ${authControl}
  </nav>

  <main class="content">
${body}
  </main>

  <footer class="site-footer">
    <div class="hit-counter">
      <span class="counter-label">YOU ARE UNREMARKABLE VISITOR NUMBER</span>
      <span class="counter-digits">
        ${padded.split('').map((d) => `<span class="digit">${d}</span>`).join('')}
      </span>
    </div>
    <div class="badges">
      <span class="badge">BEST VIEWED IN NETSCAPE 800×600</span>
      <span class="badge">MADE WITH NOTEPAD</span>
      <span class="badge">88×31</span>
      <span class="badge">100% HUMAN*</span>
    </div>
    <div class="webring">
      <a href="#">← PREV</a>
      <span class="webring-name">UNREMARKABLE WEB RING</span>
      <a href="#">NEXT →</a>
    </div>
    <p class="disclaimer">*This website is satire and parody. Any resemblance to actual conspiracies is purely coincidental. Probably. The aliens made me say that.</p>
  </footer>
</div>

<script src="/client.js"></script>
</body>
</html>`;
}
