// Text art on a character grid. Every glyph sits in a fixed cell, and the
// line characters (_ / \ |) are stroked corner to corner rather than taken
// from a font, so a trace drawn in them joins up the way it does in a
// terminal's mind and rarely in its fonts.
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = { red: "#d8283c", dim: "#7a1422", maroon: "#3b0a12", cream: "#f1c49b", creamDim: "#b88d6c" };
  const FONT = '"IBM Plex Mono", Consolas, "Cascadia Mono", monospace';

  function grid(cv, cw, ch, cols, rows) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cols * cw * dpr);
    cv.height = Math.round(rows * ch * dpr);
    cv.style.aspectRatio = `${cols * cw} / ${rows * ch}`;
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return g;
  }
  // one cell: strokes for the line glyphs, the font for everything else
  function cell(g, glyph, c, r, cw, ch, color, weight, stroke) {
    const x = c * cw, y = r * ch;
    g.strokeStyle = color;
    g.fillStyle = color;
    g.lineWidth = weight || 1.6;
    g.lineCap = "square";
    const line = (x1, y1, x2, y2) => { g.beginPath(); g.moveTo(x + x1, y + y1); g.lineTo(x + x2, y + y2); g.stroke(); };
    if (!stroke) { if (glyph !== " ") g.fillText(glyph, x + cw / 2, y + ch / 2 + 1); return; }
    switch (glyph) {
      case "_": line(0, ch, cw, ch); break;
      case "/": line(0, ch, cw, 0); break;
      case "\\": line(0, 0, cw, ch); break;
      case "|": line(0, 0, 0, ch); break;
      case " ": break;
      default: g.fillText(glyph, x + cw / 2, y + ch / 2 + 1);
    }
  }

  // ---- 1. the vital sign: a heartbeat that becomes a clock signal ----
  const ekg = document.getElementById("ekg");
  if (ekg) {
    // one beat: P wave, the QRS spike with its dip below the line, T wave
    const BEAT = [
      "                /\\                ",
      "               /  \\               ",
      "      __      /    \\       ___    ",
      "_____/  \\____/      \\   __/   \\___",
      "                     \\_/          ",
    ];
    const W = BEAT[0].length, top = 1;           // the beat sits on rows 1..5
    const cw = 10, ch = 17, rows = 8;
    let cols = 0, seam = 0, g = null, t = 0;
    const hash = (a, b, k) => { const x = Math.sin(a * 12.9898 + b * 78.233 + k * 37.719) * 43758.5453; return x - Math.floor(x); };
    const size = () => {
      cols = Math.max(48, Math.floor(ekg.parentElement.clientWidth / cw));
      // a narrow strip moves the converter right, so a whole beat shows first
      seam = Math.floor(cols * (cols < 70 ? 0.7 : 0.56));
      g = grid(ekg, cw, ch, cols, rows);
    };
    const text = (s, c, r, color) => { for (let i = 0; i < s.length; i++) cell(g, s[i], c + i, r, cw, ch, color); };
    function draw() {
      g.clearRect(0, 0, cols * cw, rows * ch);
      g.font = `600 ${ch - 1}px ${FONT}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowBlur = 0;
      // the monitor's graticule
      for (let c = 2; c < cols; c += 4) for (let r = 1; r < rows - 1; r += 2) cell(g, "·", c, r, cw, ch, "rgba(122,20,34,0.55)");
      // the heartbeat flows right, into the converter
      for (let c = 0; c < seam; c++) {
        const k = (((c - t) % W) + W) % W;
        const into = c - (seam - 12);                       // how far into the seam
        for (let r = 0; r < BEAT.length; r++) {
          const gl = BEAT[r][k];
          if (gl === " ") continue;
          if (into > 0 && hash(c, r, (t / 2) | 0) < into / 12) { cell(g, hash(c, r, t) < 0.5 ? "0" : "1", c, top + r, cw, ch, C.creamDim); continue; }
          g.shadowColor = "rgba(241,196,155,0.55)"; g.shadowBlur = 6;
          cell(g, gl, c, top + r, cw, ch, C.cream);
          g.shadowBlur = 0;
        }
      }
      // the converter: a box the beat goes into and the signal comes out of
      const bx = seam, label = "[ CONVERT ]";
      // the clock signal flows out to the right
      const hi = 2, lo = 5, period = 8;
      g.shadowColor = "rgba(216,40,60,0.6)"; g.shadowBlur = 6;
      for (let c = seam + 1; c < cols; c++) {
        const p = (((c - seam - t) % period) + period) % period;
        if (p === 0 || p === period / 2) { for (let r = hi; r <= lo; r++) cell(g, "|", c, r, cw, ch, C.red); }
        else if (p < period / 2) cell(g, "_", c, hi - 1, cw, ch, C.red);
        else cell(g, "_", c, lo, cw, ch, C.red);
      }
      g.shadowBlur = 0;
      for (let c = seam + 1; c < cols; c++) {
        const p = (((c - seam - t) % period) + period) % period;
        if (p === 2 && c > bx + 7) cell(g, (Math.floor((c - seam - t) / period) & 1) ? "1" : "0", c, 0, cw, ch, C.dim);
      }
      // the seam's frame
      for (let r = 1; r < rows - 1; r++) cell(g, "¦", bx, r, cw, ch, C.dim);
      text(label, bx - Math.floor(label.length / 2), 0, C.cream);
      text("BIO.SIGNAL", 1, 0, C.red);
      text("♥ ANALOG", 1, rows - 1, C.creamDim);
      const tag = (cols < 70 ? "" : "DIGITAL ▸ ") + "0x48 0x55 0x4D 0x41 0x4E";      // H U M A N
      text(tag, cols - tag.length - 1, rows - 1, C.creamDim);
    }
    size();
    draw();
    if (document.fonts) document.fonts.ready.then(draw);
    if (!reduced) setInterval(() => { if (!document.hidden) { t++; draw(); } }, 120);
    window.addEventListener("resize", () => { size(); draw(); });
  }

  // ---- 2. the upload: Maizey as coloured text, refusing to go ----
  const up = document.getElementById("upload");
  if (up) {
    const img = new Image();
    img.src = up.dataset.src;
    img.onload = () => {
      const cw = 5, ch = 8;
      const cols = 88, rows = Math.round(cols * (img.height / img.width) * (cw / ch));
      const g = grid(up, cw, ch, cols, rows + 3);
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const o = off.getContext("2d");
      o.drawImage(img, 0, 0, cols, rows);
      const px = o.getImageData(0, 0, cols, rows).data;
      // dense glyphs only: the colour carries the picture, the glyph its weight
      const RAMP = "=+*#%@";
      const cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const i = (r * cols + c) * 4, a = px[i + 3];
        if (a < 110) continue;
        let R = px[i], G = px[i + 1], B = px[i + 2];
        const L = (0.2126 * R + 0.7152 * G + 0.0722 * B) / 255;
        // brighten toward the page's cream so the dark armour still reads on black
        const k = 0.22, lift = (v) => Math.round(v + (255 - v) * k);
        R = lift(R); G = lift(G); B = lift(B);
        const glyph = a < 200 ? "+" : RAMP[Math.min(RAMP.length - 1, Math.floor(L * RAMP.length * 1.15))];
        cells.push({ c, r, glyph, color: `rgb(${R},${G},${B})` });
      }
      let phase = "idle", scan = -1, t0 = performance.now();
      const bits = [];
      const STOP = Math.round(rows * 0.6);
      function status() {
        if (phase === "up") return [`UPLOADING MAIZEY.EXE  ${String(Math.round(scan / rows * 100)).padStart(2, "0")}%`, C.creamDim];
        if (phase === "refused") return ["ERROR · UPLOAD REFUSED", C.red];
        if (phase === "back") return ["RESTORING ORIGINAL", C.creamDim];
        return ["MAIZEY.EXE · NOT A LEGACY SYSTEM", C.cream];
      }
      function draw() {
        g.clearRect(0, 0, cols * cw, (rows + 3) * ch);
        g.font = `700 ${ch + 1}px ${FONT}`;
        g.textAlign = "center";
        g.textBaseline = "middle";
        for (const k of cells) {
          const taken = (phase === "up" || phase === "refused" || phase === "back") && k.r < scan;
          if (taken) continue;
          const edge = (phase === "up" || phase === "back") && k.r === scan;
          cell(g, edge ? (Math.random() < 0.5 ? "0" : "1") : k.glyph, k.c, k.r, cw, ch, edge ? C.red : k.color);
        }
        for (const b of bits) { g.fillStyle = `rgba(216,40,60,${b.life})`; g.fillText(b.v, b.x, b.y); }
        const [msg, color] = status();
        g.font = `500 ${ch + 3}px ${FONT}`;
        g.textAlign = "left";
        g.fillStyle = color;
        g.fillText(msg, 0, (rows + 1.8) * ch);
      }
      draw();
      if (document.fonts) document.fonts.ready.then(draw);
      if (reduced) return;
      let last = 0;
      function tick(now) {
        requestAnimationFrame(tick);
        if (document.hidden || now - last < 50) return;
        last = now;
        const el = now - t0;
        if (phase === "idle" && el > 3200) { phase = "up"; scan = 0; t0 = now; }
        else if (phase === "up" && el > 55) {
          t0 = now;
          for (const k of cells) if (k.r === scan && Math.random() < 0.3) bits.push({ v: Math.random() < 0.5 ? "0" : "1", x: k.c * cw + cw / 2, y: k.r * ch, life: 1 });
          if (++scan >= STOP) { phase = "refused"; t0 = now; }
        } else if (phase === "refused" && el > 1400) { phase = "back"; t0 = now; }
        else if (phase === "back" && el > 22) { t0 = now; if (--scan < 0) { phase = "idle"; } }
        for (const b of bits) { b.y -= 2.4; b.life -= 0.045; }
        while (bits.length && bits[0].life <= 0) bits.shift();
        draw();
      }
      requestAnimationFrame(tick);
    };
  }
})();
