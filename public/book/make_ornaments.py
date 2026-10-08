"""
Generate ornamental SVG assets matching Trove Gothic/alchemical aesthetic.
Colors: deep near-black backgrounds, warm golds, amber, muted bronze.
Motifs: pointed arches, tracery, diamonds, celestial circles, filigree.
"""
import sys
from pathlib import Path

# The literal path on Windows, as before; off Windows, img/ beside this script.
OUT = (Path(r'C:\Find Aliens\public\book\img') if sys.platform == 'win32'
       else Path(__file__).resolve().parent / 'img')
OUT.mkdir(parents=True, exist_ok=True)

C = {
    'bg': '#080604',
    'gold': '#c49a3c',
    'gold_dim': '#8a6820',
    'gold_bright': '#e0c878',
    'amber': '#b07030',
    'bronze': '#6b4820',
    'darkline': '#2a1c08',
}

def write_svg(name, content):
    with open(OUT / name, 'w', encoding='utf-8') as f:
        f.write(content)

# ── 1. LANDING PAGE FRAME: Four corner pieces + top/bottom center ──

# Corner: top-left (Gothic tracery corner with pointed arch)
write_svg('frame-tl.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="gf" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="{C['gold']}" stop-opacity="0.8"/><stop offset="100%" stop-color="{C['amber']}" stop-opacity="0.3"/></linearGradient>
  </defs>
  <!-- outer corner bracket -->
  <path d="M10 190 L190 190 L190 10" fill="none" stroke="{C['gold_dim']}" stroke-width="1.2" opacity="0.5"/>
  <path d="M15 190 L190 190 L190 15" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.35"/>
  <!-- Gothic arch in corner -->
  <path d="M40 190 Q40 40 100 30" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.3"/>
  <!-- tracery diamonds -->
  <path d="M25 180 L32 170 L39 180 L32 190 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.4"/>
  <path d="M50 180 L57 170 L64 180 L57 190 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.3"/>
  <!-- small celestial dots -->
  <circle cx="80" cy="175" r="1" fill="{C['gold']}" opacity="0.4"/>
  <circle cx="95" cy="168" r="0.8" fill="{C['gold_bright']}" opacity="0.3"/>
  <circle cx="110" cy="172" r="1.2" fill="{C['gold']}" opacity="0.35"/>
  <!-- corner accent -->
  <circle cx="190" cy="190" r="3" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.5"/>
  <circle cx="190" cy="190" r="1.2" fill="{C['gold_bright']}" opacity="0.4"/>
</svg>''')

# Corner: top-right (mirrored)
write_svg('frame-tr.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="gf" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{C['gold']}" stop-opacity="0.8"/><stop offset="100%" stop-color="{C['amber']}" stop-opacity="0.3"/></linearGradient>
  </defs>
  <path d="M190 190 L10 190 L10 10" fill="none" stroke="{C['gold_dim']}" stroke-width="1.2" opacity="0.5"/>
  <path d="M185 190 L10 190 L10 15" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.35"/>
  <path d="M160 190 Q160 40 100 30" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.3"/>
  <path d="M175 180 L168 170 L161 180 L168 190 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.4"/>
  <path d="M150 180 L143 170 L136 180 L143 190 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.3"/>
  <circle cx="120" cy="175" r="1" fill="{C['gold']}" opacity="0.4"/>
  <circle cx="105" cy="168" r="0.8" fill="{C['gold_bright']}" opacity="0.3"/>
  <circle cx="90" cy="172" r="1.2" fill="{C['gold']}" opacity="0.35"/>
  <circle cx="10" cy="190" r="3" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.5"/>
  <circle cx="10" cy="190" r="1.2" fill="{C['gold_bright']}" opacity="0.4"/>
</svg>''')

# Corner: bottom-left
write_svg('frame-bl.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <path d="M10 10 L190 10 L190 190" fill="none" stroke="{C['gold_dim']}" stroke-width="1.2" opacity="0.5"/>
  <path d="M15 10 L190 10 L190 185" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.35"/>
  <path d="M40 10 Q40 160 100 170" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.3"/>
  <path d="M25 20 L32 30 L39 20 L32 10 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.4"/>
  <circle cx="10" cy="10" r="3" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.5"/>
  <circle cx="10" cy="10" r="1.2" fill="{C['gold_bright']}" opacity="0.4"/>
</svg>''')

# Corner: bottom-right
write_svg('frame-br.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <path d="M190 10 L10 10 L10 190" fill="none" stroke="{C['gold_dim']}" stroke-width="1.2" opacity="0.5"/>
  <path d="M185 10 L10 10 L10 185" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.35"/>
  <path d="M160 10 Q160 160 100 170" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.3"/>
  <path d="M175 20 L168 30 L161 20 L168 10 Z" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.4"/>
  <circle cx="190" cy="10" r="3" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.5"/>
  <circle cx="190" cy="10" r="1.2" fill="{C['gold_bright']}" opacity="0.4"/>
</svg>''')

# ── 2. Top center: alchemical/celestial ornament ──
write_svg('frame-tc.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80">
  <!-- central diamond with rays -->
  <path d="M200 10 L220 40 L200 70 L180 40 Z" fill="none" stroke="{C['gold']}" stroke-width="1" opacity="0.5"/>
  <path d="M200 18 L214 40 L200 62 L186 40 Z" fill="none" stroke="{C['gold_bright']}" stroke-width="0.5" opacity="0.35"/>
  <circle cx="200" cy="40" r="4" fill="none" stroke="{C['gold']}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="200" cy="40" r="1.5" fill="{C['gold_bright']}" opacity="0.5"/>
  <!-- line extending from diamond -->
  <line x1="0" y1="40" x2="170" y2="40" stroke="{C['gold_dim']}" stroke-width="0.8" opacity="0.4"/>
  <line x1="230" y1="40" x2="400" y2="40" stroke="{C['gold_dim']}" stroke-width="0.8" opacity="0.4"/>
  <!-- small diamonds along line -->
  <path d="M130 38 L134 40 L130 42 L126 40 Z" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.35"/>
  <path d="M266 38 L270 40 L266 42 L262 40 Z" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.35"/>
  <!-- celestial circles -->
  <circle cx="80" cy="40" r="2" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.4"/>
  <circle cx="320" cy="40" r="2" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.4"/>
</svg>''')

# ── 3. Bottom center ornament ──
write_svg('frame-bc.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 60">
  <line x1="0" y1="30" x2="130" y2="30" stroke="{C['gold_dim']}" stroke-width="0.8" opacity="0.4"/>
  <line x1="270" y1="30" x2="400" y2="30" stroke="{C['gold_dim']}" stroke-width="0.8" opacity="0.4"/>
  <!-- triple diamond center -->
  <path d="M180 22 L188 30 L180 38 L172 30 Z" fill="none" stroke="{C['gold']}" stroke-width="0.7" opacity="0.5"/>
  <path d="M200 22 L208 30 L200 38 L192 30 Z" fill="none" stroke="{C['gold_bright']}" stroke-width="0.7" opacity="0.5"/>
  <path d="M220 22 L228 30 L220 38 L212 30 Z" fill="none" stroke="{C['gold']}" stroke-width="0.7" opacity="0.5"/>
  <circle cx="200" cy="30" r="2" fill="{C['gold_bright']}" opacity="0.45"/>
</svg>''')

# ── 4. Chapter header ornament (pointed arch with tracery) ──
write_svg('ch-ornament.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 50">
  <!-- outer pillars -->
  <rect x="60" y="20" width="1.5" height="30" fill="{C['gold']}" opacity="0.45"/>
  <rect x="238" y="20" width="1.5" height="30" fill="{C['gold']}" opacity="0.45"/>
  <!-- pointed arch -->
  <path d="M60 25 Q150 0 240 25" fill="none" stroke="{C['gold']}" stroke-width="1" opacity="0.5"/>
  <!-- inner arch -->
  <path d="M75 25 Q150 8 225 25" fill="none" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.35"/>
  <!-- tracery circle at apex -->
  <circle cx="150" cy="14" r="6" fill="none" stroke="{C['gold_bright']}" stroke-width="0.6" opacity="0.5"/>
  <circle cx="150" cy="14" r="2" fill="{C['gold_bright']}" opacity="0.4"/>
  <!-- base line -->
  <line x1="40" y1="48" x2="110" y2="48" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.35"/>
  <line x1="190" y1="48" x2="260" y2="48" stroke="{C['gold_dim']}" stroke-width="0.6" opacity="0.35"/>
  <!-- center ornament -->
  <path d="M140 46 L150 36 L160 46 L150 42 Z" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.5"/>
  <circle cx="150" cy="48" r="1.5" fill="{C['gold']}" opacity="0.4"/>
</svg>''')

# ── 5. Section divider (diamonds + line) ──
write_svg('divider.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 20">
  <line x1="0" y1="10" x2="130" y2="10" stroke="{C['gold_dim']}" stroke-width="0.5" opacity="0.3"/>
  <line x1="270" y1="10" x2="400" y2="10" stroke="{C['gold_dim']}" stroke-width="0.5" opacity="0.3"/>
  <path d="M190 6 L196 10 L190 14 L184 10 Z" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.45"/>
  <path d="M210 6 L216 10 L210 14 L204 10 Z" fill="none" stroke="{C['gold']}" stroke-width="0.5" opacity="0.45"/>
  <circle cx="200" cy="10" r="1.5" fill="{C['gold_bright']}" opacity="0.4"/>
</svg>''')

# ── 6. Landing page title ornament (more elaborate, for below logo) ──
write_svg('title-ornament-top.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 60">
  <!-- two-level ornate divider -->
  <line x1="0" y1="15" x2="140" y2="15" stroke="{C['gold_dim']}" stroke-width="0.7" opacity="0.35"/>
  <line x1="360" y1="15" x2="500" y2="15" stroke="{C['gold_dim']}" stroke-width="0.7" opacity="0.35"/>
  <!-- celestial central motif -->
  <path d="M225 5 L250 30 L225 55 L200 30 Z" fill="none" stroke="{C['gold']}" stroke-width="1" opacity="0.55"/>
  <path d="M235 12 L250 30 L235 48 L220 30 Z" fill="none" stroke="{C['gold_bright']}" stroke-width="0.5" opacity="0.35"/>
  <circle cx="250" cy="30" r="8" fill="none" stroke="{C['gold']}" stroke-width="0.7" opacity="0.5"/>
  <circle cx="250" cy="30" r="2.5" fill="{C['gold_bright']}" opacity="0.45"/>
  <!-- flanking diamonds -->
  <path d="M160 28 L168 30 L160 32 L152 30 Z" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.4"/>
  <path d="M332 28 L340 30 L332 32 L324 30 Z" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.4"/>
  <!-- small celestial dots -->
  <circle cx="120" cy="30" r="1.2" fill="{C['gold']}" opacity="0.35"/>
  <circle cx="380" cy="30" r="1.2" fill="{C['gold']}" opacity="0.35"/>
  <!-- radiating lines from center -->
  <line x1="250" y1="22" x2="250" y2="10" stroke="{C['gold_dim']}" stroke-width="0.4" opacity="0.3"/>
  <line x1="258" y1="24" x2="270" y2="14" stroke="{C['gold_dim']}" stroke-width="0.4" opacity="0.25"/>
  <line x1="242" y1="24" x2="230" y2="14" stroke="{C['gold_dim']}" stroke-width="0.4" opacity="0.25"/>
</svg>''')

write_svg('title-ornament-bottom.svg', f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 40">
  <line x1="0" y1="20" x2="155" y2="20" stroke="{C['gold_dim']}" stroke-width="0.7" opacity="0.35"/>
  <line x1="345" y1="20" x2="500" y2="20" stroke="{C['gold_dim']}" stroke-width="0.7" opacity="0.35"/>
  <path d="M235 12 L250 20 L235 28 L220 20 Z" fill="none" stroke="{C['gold_bright']}" stroke-width="0.6" opacity="0.45"/>
  <path d="M250 12 L265 20 L250 28 L235 20 Z" fill="none" stroke="{C['gold']}" stroke-width="0.6" opacity="0.4"/>
  <circle cx="142" cy="20" r="1.5" fill="{C['gold']}" opacity="0.35"/>
  <circle cx="358" cy="20" r="1.5" fill="{C['gold']}" opacity="0.35"/>
</svg>''')

print("Generated SVG ornamental assets.")
print(f"Output: {OUT}")
for f in sorted(OUT.glob('*.svg')):
    print(f"  {f.name}")