"""
Rebuild landing + chapter templates using SVG ornamental assets.
"""
import markdown, re, json, shutil
from pathlib import Path

MANUSCRIPT = r'C:\Users\Xairi\Demiurgent\demiurgent-manuscript.md'
OUT_DIR = Path(r'C:\Find Aliens\public\book')
IMG_DIR = OUT_DIR / 'img'
IMG_DIR.mkdir(parents=True, exist_ok=True)

# ── Parse manuscript ────────────────────────────────────────────────
with open(MANUSCRIPT, 'r', encoding='utf-8') as f:
    full_text = f.read()

sections = []
current_title = None; current_lines = []
for line in full_text.split('\n'):
    if line.startswith('## '):
        if current_title is not None and current_lines:
            sections.append((current_title, '\n'.join(current_lines)))
        current_title = line[3:].strip(); current_lines = []
    else:
        current_lines.append(line)
if current_title and current_lines:
    sections.append((current_title, '\n'.join(current_lines)))

md = markdown.Markdown(extensions=['extra', 'sane_lists'])

def slugify(s):
    s = s.lower().replace(' ', '-').replace("'", '').replace('—', '-').replace('–', '-')
    s = re.sub(r'[^a-z0-9-]', '', s)
    return re.sub(r'-+', '-', s).strip('-')

chapters = []
for title, body in sections:
    if title.startswith('Part '):
        chapters.append({'type': 'part', 'title': title, 'body': '', 'slug': slugify(title)})
    else:
        chapters.append({'type': 'chapter', 'title': title, 'body': body, 'slug': slugify(title)})

chapter_list = [c for c in chapters if c['type'] == 'chapter']
total = len(chapter_list)

# ── Inline SVG helper ───────────────────────────────────────────────
def svg_img(name):
    """Read an SVG file and return it as an inline <img> tag via data URI."""
    path = IMG_DIR / name
    if path.exists():
        svg = path.read_text(encoding='utf-8')
        svg_escaped = svg.replace('"', "'").replace('\n', '').replace('  ', ' ')
        return f'<img src="data:image/svg+xml,{svg_escaped}" alt="" class="ornament-svg">'
    return ''

def svg_inline(name):
    """Read SVG and return raw inline."""
    path = IMG_DIR / name
    if path.exists():
        return path.read_text(encoding='utf-8')
    return ''

# ── LANDING PAGE CSS ──────────────────────────────────────
LANDING_CSS = r'''
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root {
    --bg: #060402; --text: #b8a88c; --text-dim: #6e6454;
    --gold: #c49a3c; --gold-bright: #e8d070; --gold-pale: #d4b860;
    --border-gold: #3a2c10;
    --font-display: 'Cinzel', 'Georgia', serif;
    --font-decorative: 'Cinzel Decorative', 'Cinzel', 'Georgia', serif;
    --font-body: 'Crimson Text', 'Georgia', serif;
}
body {
    font-family: var(--font-body);
    background: #060402;
    color: var(--text);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    position: relative;
}
.noise {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
    pointer-events: none; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 256px 256px;
}
.ornament-frame { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; pointer-events: none; }
.orn-corn { position: absolute; width: 180px; height: 180px; opacity: 0.55; }
.orn-corn svg { width: 100%; height: 100%; }
.orn-tl { top: 0; left: 0; }
.orn-tr { top: 0; right: 0; }
.orn-bl { bottom: 0; left: 0; }
.orn-br { bottom: 0; right: 0; }
.orn-edge { position: absolute; left: 50%; transform: translateX(-50%); opacity: 0.5; }
.orn-top { top: 0; width: 360px; }
.orn-edge svg { width: 100%; height: auto; }
#landing { position: relative; z-index: 2; text-align: center; padding: 3em 2em 2em; max-width: 560px; width: 100%; }
#topbar { position: fixed; top: 0; left: 0; right: 0; z-index: 99; display: flex; justify-content: flex-end; gap: 6px; padding: 0.5em 1em; }
.tb-btn { background: none; border: 1px solid var(--border-gold); color: var(--text-dim); cursor: pointer; padding: 3px 8px; border-radius: 2px; font-family: var(--font-body); font-size: 11px; transition: all 0.2s; }
.tb-btn:hover { color: var(--gold); border-color: var(--gold); }
.title-ornament { margin: 0.5em auto; opacity: 0.65; max-width: 400px; }
.title-ornament svg { width: 100%; height: auto; }
.logo-title { font-family: var(--font-decorative); font-size: clamp(2.8em, 7vw, 4.2em); font-weight: 900; letter-spacing: 0.2em; color: var(--gold-bright); text-shadow: 0 0 100px rgba(200,160,60,0.3), 0 0 200px rgba(180,130,40,0.12), 0 3px 8px rgba(0,0,0,0.6); line-height: 1.1; margin: 0.3em 0; }
.logo-epigraph { font-style: italic; font-size: 0.9em; color: var(--text-dim); margin: 1em 0 1.5em; line-height: 1.7; }
#toc-section { margin: 2em 0; text-align: left; }
.toc-header { font-family: var(--font-decorative); font-size: 1.1em; color: var(--gold-bright); letter-spacing: 0.12em; text-align: center; margin-bottom: 1.5em; }
.toc-part { font-family: var(--font-display); font-size: 0.88em; color: var(--gold); letter-spacing: 0.08em; margin: 1.1em 0 0.4em; }
.toc-ch { margin: 0.22em 0 0.22em 1.5em; font-size: 0.88em; }
.toc-int { margin: 0.22em 0 0.22em 1.5em; font-size: 0.85em; font-style: italic; }
.toc-link { color: var(--text); text-decoration: none; transition: color 0.2s; }
.toc-link:hover { color: var(--gold-bright); }
.toc-link.read { color: var(--text-dim); }
.toc-link.current { color: var(--gold-bright); font-weight: 600; }
.toc-int .toc-link { color: #b89060; }
.resume-btn { display: inline-block; font-family: var(--font-display); font-size: 0.9em; color: var(--gold-bright); text-decoration: none; letter-spacing: 0.1em; border: 1px solid var(--border-gold); padding: 0.7em 2em; border-radius: 2px; margin: 0.5em 0 2em; transition: all 0.3s; }
.resume-btn:hover { background: rgba(200,160,60,0.1); border-color: var(--gold); }
#resume-note { font-size: 0.78em; color: var(--text-dim); font-style: italic; margin-bottom: 0.3em; }
.landing-footer { margin-top: 2.5em; font-size: 0.72em; color: var(--text-dim); opacity: 0.4; letter-spacing: 0.05em; }
.landing-footer a { color: var(--text-dim); }
body.light { --bg: #f5f0e8; --text: #3d3428; --text-dim: #7a6e5e; --gold: #8b6914; --gold-bright: #5a4010; --gold-pale: #9a7a2e; --border-gold: #b8a070; background: #f5f0e8; }
body.light .logo-title { text-shadow: none; }
body.light .noise { opacity: 0.025; }
@media (max-width: 500px) { #landing { padding: 2em 1em; } .logo-title { font-size: 2em; } .orn-corn { width: 100px; height: 100px; opacity: 0.35; } }
'''

# ── LANDING PAGE ────────────────────────────────────────────────────
# Build the complete landing page HTML with all ornaments

# Read ornament SVGs as inline
frame_tl = svg_inline('frame-tl.svg')
frame_tr = svg_inline('frame-tr.svg')
frame_bl = svg_inline('frame-bl.svg')
frame_br = svg_inline('frame-br.svg')
frame_tc = svg_inline('frame-tc.svg')
title_top = svg_inline('title-ornament-top.svg')
title_bot = svg_inline('title-ornament-bottom.svg')

toc_rows = ''
for ch in chapters:
    if ch['type'] == 'part':
        toc_rows += f'<div class="toc-part">{ch["title"]}</div>\n'
    else:
        cls = 'toc-int' if 'Interlude' in ch['title'] else 'toc-ch'
        toc_rows += f'<div class="{cls}"><a href="{ch["slug"]}.html" class="toc-link" data-slug="{ch["slug"]}">{ch["title"]}</a></div>\n'

landing_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Demiurgent</title>
<meta name="description" content="A thing that is finally, actually stopped was, at every hour of its running, a thing that could have been stopped, by someone.">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
<style>
{LANDING_CSS}
</style>
</head>
<body>

<!-- BACKGROUND FRAME: SVG ornaments positioned at edges -->
<div class="ornament-frame">
  <div class="orn-corn orn-tl">{frame_tl}</div>
  <div class="orn-corn orn-tr">{frame_tr}</div>
  <div class="orn-corn orn-bl">{frame_bl}</div>
  <div class="orn-corn orn-br">{frame_br}</div>
  <div class="orn-edge orn-top">{frame_tc}</div>
</div>

<!-- Noise texture overlay -->
<div class="noise"></div>

<!-- TOPBAR -->
<div id="topbar">
  <button class="tb-btn" onclick="toggleTheme()" id="theme-btn">◐</button>
  <button class="tb-btn" onclick="var fs=parseInt(localStorage.getItem('dg-fs')||'18');fs=Math.max(fs-2,14);localStorage.setItem('dg-fs',fs);document.body.style.fontSize=fs+'px';">A-</button>
  <button class="tb-btn" onclick="var fs=parseInt(localStorage.getItem('dg-fs')||'18');fs=Math.min(fs+2,28);localStorage.setItem('dg-fs',fs);document.body.style.fontSize=fs+'px';">A+</button>
</div>

<div id="landing">

<div class="title-ornament">{title_top}</div>

<div class="logo-title">DEMIURGENT</div>

<div class="logo-epigraph">
  &ldquo;A thing that is finally, actually stopped was, at every hour<br>
  of its running, a thing that could have been stopped, by someone.&rdquo;
</div>

<div class="title-ornament">{title_bot}</div>

<div id="toc-section">
  <div class="toc-header">Contents</div>
  {toc_rows}
</div>

<div id="resume-section" style="display:none">
  <p id="resume-note">You have a chapter in progress.</p>
  <a href="#" id="resume-link" class="resume-btn">Continue Reading &rarr;</a>
</div>

<p class="landing-footer"><a href="https://findaliens.net">findaliens.net</a> &mdash; The Cornfield Gazette</p>
</div>

<script>
var read=JSON.parse(localStorage.getItem('dg-read')||'{{}}'),last=localStorage.getItem('dg-last');
document.querySelectorAll('.toc-link').forEach(function(a){{if(read[a.dataset.slug])a.classList.add('read');if(a.dataset.slug===last)a.classList.add('current');}});
if(last){{document.getElementById('resume-section').style.display='block';document.getElementById('resume-link').href=last+'.html';}}
function toggleTheme(){{document.body.classList.toggle('light');var l=document.body.classList.contains('light');localStorage.setItem('dg-theme',l?'light':'dark');document.getElementById('theme-btn').textContent=l?'◑':'◐';}}
if(localStorage.getItem('dg-theme')==='light'){{document.body.classList.add('light');document.getElementById('theme-btn').textContent='◑';}}
var fs=parseInt(localStorage.getItem('dg-fs')||'18');document.body.style.fontSize=fs+'px';
</script>
</body></html>'''

LANDING_CSS = '''
/* ===== FONTS ===== */
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root {
    --bg: #080604; --text: #b8a88c; --text-dim: #6e6454;
    --gold: #c49a3c; --gold-bright: #e8d070; --gold-pale: #d4b860;
    --border-gold: #3a2c10;
    --font-display: 'Cinzel', 'Georgia', serif;
    --font-decorative: 'Cinzel Decorative', 'Cinzel', 'Georgia', serif;
    --font-body: 'Crimson Text', 'Georgia', serif;
}

body {
    font-family: var(--font-body);
    background: #060402;
    color: var(--text);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
    position: relative;
}

/* Noise texture */
.noise {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
    pointer-events: none; opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

/* Ornamental frame */
.ornament-frame { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; pointer-events: none; }
.orn-corn { position: absolute; width: 180px; height: 180px; opacity: 0.55; }
.orn-corn svg { width: 100%; height: 100%; }
.orn-tl { top: 0; left: 0; }
.orn-tr { top: 0; right: 0; }
.orn-bl { bottom: 0; left: 0; }
.orn-br { bottom: 0; right: 0; }
.orn-edge { position: absolute; left: 50%; transform: translateX(-50%); opacity: 0.5; }
.orn-top { top: 0; width: 360px; }
.orn-edge svg { width: 100%; height: auto; }

/* Landing container */
#landing {
    position: relative; z-index: 2;
    text-align: center; padding: 3em 2em 2em;
    max-width: 560px; width: 100%;
}

/* Topbar */
#topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 99;
    display: flex; justify-content: flex-end; gap: 6px;
    padding: 0.5em 1em;
}
.tb-btn {
    background: none; border: 1px solid var(--border-gold);
    color: var(--text-dim); cursor: pointer;
    padding: 3px 8px; border-radius: 2px;
    font-family: var(--font-body); font-size: 11px;
    transition: all 0.2s;
}
.tb-btn:hover { color: var(--gold); border-color: var(--gold); }

/* Logo */
.title-ornament { margin: 0.5em auto; opacity: 0.65; }
.title-ornament svg { max-width: 400px; width: 80%; height: auto; }
.logo-title {
    font-family: var(--font-decorative);
    font-size: clamp(2.8em, 7vw, 4.2em);
    font-weight: 900; letter-spacing: 0.2em;
    color: var(--gold-bright);
    text-shadow: 0 0 100px rgba(200,160,60,0.3), 0 0 200px rgba(180,130,40,0.12), 0 3px 8px rgba(0,0,0,0.6);
    line-height: 1.1; margin: 0.3em 0;
}
.logo-epigraph {
    font-style: italic; font-size: 0.9em; color: var(--text-dim);
    margin: 1em 0 1.5em; line-height: 1.7;
}

/* TOC */
#toc-section { margin: 2em 0; text-align: left; }
.toc-header {
    font-family: var(--font-decorative); font-size: 1.1em;
    color: var(--gold-bright); letter-spacing: 0.12em;
    text-align: center; margin-bottom: 1.5em;
}
.toc-part { font-family: var(--font-display); font-size: 0.88em; color: var(--gold); letter-spacing: 0.08em; margin: 1.1em 0 0.4em; }
.toc-ch { margin: 0.22em 0 0.22em 1.5em; font-size: 0.88em; }
.toc-int { margin: 0.22em 0 0.22em 1.5em; font-size: 0.85em; font-style: italic; }
.toc-link { color: var(--text); text-decoration: none; transition: color 0.2s; }
.toc-link:hover { color: var(--gold-bright); }
.toc-link.read { color: var(--text-dim); }
.toc-link.current { color: var(--gold-bright); font-weight: 600; }
.toc-int .toc-link { color: #b89060; }

/* Resume */
.resume-btn {
    display: inline-block; font-family: var(--font-display);
    font-size: 0.9em; color: var(--gold-bright); text-decoration: none;
    letter-spacing: 0.1em; border: 1px solid var(--border-gold);
    padding: 0.7em 2em; border-radius: 2px;
    margin: 0.5em 0 2em; transition: all 0.3s;
}
.resume-btn:hover { background: rgba(200,160,60,0.1); border-color: var(--gold); }
#resume-note { font-size: 0.78em; color: var(--text-dim); font-style: italic; margin-bottom: 0.3em; }
.landing-footer { margin-top: 2.5em; font-size: 0.72em; color: var(--text-dim); opacity: 0.4; letter-spacing: 0.05em; }
.landing-footer a { color: var(--text-dim); }

body.light {
    --bg: #f5f0e8; --text: #3d3428; --text-dim: #7a6e5e;
    --gold: #8b6914; --gold-bright: #5a4010; --gold-pale: #9a7a2e;
    --border-gold: #b8a070;
}
body.light .logo-title { text-shadow: none; }
body.light .noise { opacity: 0.025; }

@media (max-width: 500px) {
    #landing { padding: 2em 1em; }
    .logo-title { font-size: 2em; }
    .orn-corn { width: 100px; height: 100px; opacity: 0.35; }
}
'''

# ── CHAPTER PAGES ──────────────────────────────────────────────────
# Read common CSS
with open(OUT_DIR / 'common.css', 'r', encoding='utf-8') as f:
    COMMON_CSS = f.read()

ch_ornament_svg = svg_inline('ch-ornament.svg')
divider_svg = svg_inline('divider.svg')

ch_slugs_json = json.dumps([c['slug'] for c in chapter_list])
ch_titles_json = json.dumps([c['title'] for c in chapter_list])
ch_ints_json = json.dumps(['Interlude' in c['title'] for c in chapter_list])

def chapter_page(ch, prev_slug, next_slug, idx):
    body_html = md.convert(ch['body']) if ch['body'] else ''
    title = ch['title']
    is_interlude = 'Interlude' in title
    hc = 'ch-interlude' if is_interlude else ''

    part_label = ''
    for i in range(len(chapters)):
        if chapters[i] == ch:
            for j in range(i-1, -1, -1):
                if chapters[j]['type'] == 'part':
                    part_label = chapters[j]['title']
                    break
            break
    pl = f'<div class="ch-part-label">{part_label}</div>' if part_label else ''

    plink = f'<a href="{prev_slug}.html">&larr; Previous</a>' if prev_slug else '<span></span>'
    nlink = f'<a href="{next_slug}.html">Next &rarr;</a>' if next_slug else '<span></span>'

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title} — Demiurgent</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>">
<style>{COMMON_CSS}</style>
</head>
<body>
<div class="noise"></div>
<div class="ornament-frame">
  <div class="orn-corn orn-tl">{frame_tl}</div>
  <div class="orn-corn orn-tr">{frame_tr}</div>
  <div class="orn-corn orn-bl">{frame_bl}</div>
  <div class="orn-corn orn-br">{frame_br}</div>
</div>
<div id="progress-bar"></div>
<div id="topnav">
  <span class="tn-title">DEMIURGENT</span>
  <div class="tn-btns">
    <button class="nav-btn" id="theme-btn" onclick="toggleTheme()">◐</button>
    <button class="nav-btn" onclick="toggleToc()">☷</button>
    <a href="index.html" class="nav-btn">⌂</a>
  </div>
</div>
<div id="toc-overlay"><button id="toc-close" onclick="toggleToc()">&times;</button><h3>Contents</h3><div class="toc-inner" id="toc-inner"></div></div>
<div id="content">
<div class="ch-header {hc}">
  <div class="ch-ornament-inner">{ch_ornament_svg}</div>
  {pl}
  <div class="ch-title">{title}</div>
</div>
{body_html}
<div class="bottom-nav">{plink}<span class="bn-center">{idx} of {total}</span>{nlink}</div>
</div>
<script>
var slugs={ch_slugs_json},titles={ch_titles_json},ints={ch_ints_json},current='{ch["slug"]}';
var read=JSON.parse(localStorage.getItem('dg-read')||'{{}}');read[current]=true;
localStorage.setItem('dg-read',JSON.stringify(read));localStorage.setItem('dg-last',current);
function buildToc(){{var h='';for(var i=0;i<slugs.length;i++){{var c=ints[i]?'toc-int':'toc-ch',a='';if(slugs[i]===current)a='current';else if(read[slugs[i]])a='read';h+='<div class="'+c+'"><a href="'+slugs[i]+'.html" class="'+a+'">'+titles[i]+'</a></div>';}}document.getElementById('toc-inner').innerHTML=h;}}buildToc();
function toggleToc(){{document.getElementById('toc-overlay').classList.toggle('open');}}document.getElementById('toc-overlay').addEventListener('click',function(e){{if(e.target===this)this.classList.remove('open');}});
function toggleTheme(){{document.body.classList.toggle('light');var l=document.body.classList.contains('light');localStorage.setItem('dg-theme',l?'light':'dark');document.getElementById('theme-btn').textContent=l?'◑':'◐';}}
if(localStorage.getItem('dg-theme')==='light'){{document.body.classList.add('light');document.getElementById('theme-btn').textContent='◑';}}
window.addEventListener('scroll',function(){{var p=window.scrollY||document.documentElement.scrollTop;var d=document.documentElement.scrollHeight-window.innerHeight;document.getElementById('progress-bar').style.width=d>0?Math.min((p/d)*100,100)+'%':'0';}});
document.addEventListener('keydown',function(e){{if(e.key==='ArrowRight'&&'{next_slug}')window.location='{next_slug}.html';if(e.key==='ArrowLeft'&&'{prev_slug}')window.location='{prev_slug}.html';}});
var fs=parseInt(localStorage.getItem('dg-fs')||'18');document.body.style.fontSize=fs+'px';
</script>
</body></html>'''

# ── WRITE FILES ────────────────────────────────────────────────────
with open(OUT_DIR / 'index.html', 'w', encoding='utf-8') as f:
    f.write(landing_html)

for i, ch in enumerate(chapter_list):
    prev_slug = chapter_list[i-1]['slug'] if i > 0 else ''
    next_slug = chapter_list[i+1]['slug'] if i < total - 1 else ''
    html = chapter_page(ch, prev_slug, next_slug, i+1)
    with open(OUT_DIR / f'{ch["slug"]}.html', 'w', encoding='utf-8') as f:
        f.write(html)

print(f"Built index + {total} chapter pages with SVG ornaments.")