// Manufacturing Consent: the station's furniture.
//
//   #ledsign  the masthead, a broadcast LED board: MANUFACTURING / CONSENT in
//             lit dots, a light sweep across them, and a marquee underneath
//   #tvwall   a control room's monitor wall: the programme monitor and four
//             camera monitors. Each screen is a studio portrait drawn on a
//             hidden canvas and printed as text in a fine character ramp; the
//             anchors differ, but every mouth moves on the same beat and every
//             chyron crawls the same line
//   #signoff  colour bars and the page's question, and now and then the set
//             switching off the old way
//
// Text art is cached: each screen frame is printed once to its own canvas and
// then stamped, so the wall costs a handful of drawImage calls per frame.
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FONT = '"IBM Plex Mono", Consolas, "Cascadia Mono", monospace';
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const ticker = (fn, ms) => { if (!reduced) setInterval(() => { if (!document.hidden) fn(); }, ms); };
  const onResize = (fn) => { let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 160); }); };
  const ready = (fn) => (document.fonts ? document.fonts.ready.then(fn) : fn());

  // ---------- a 5x7 face, as broadcast LED boards and line printers used ----------
  const F = {
    A: "01110100011000111111100011000110001", B: "11110100011000111110100011000111110", C: "01111100001000010000100001000001111",
    D: "11110100011000110001100011000111110", E: "11111100001000011110100001000011111", F: "11111100001000011110100001000010000",
    G: "01111100001000010011100011000101111", H: "10001100011000111111100011000110001", I: "01110001000010000100001000010001110",
    J: "00111000100001000010000101001001100", K: "10001100101010011000101001001010001", L: "10000100001000010000100001000011111",
    M: "10001110111010110101100011000110001", N: "10001110011010110011100011000110001", O: "01110100011000110001100011000101110",
    P: "11110100011000111110100001000010000", Q: "01110100011000110001101011001001101", R: "11110100011000111110101001001010001",
    S: "01111100001000001110000010000111110", T: "11111001000010000100001000010000100", U: "10001100011000110001100011000101110",
    V: "10001100011000110001100010101000100", W: "10001100011000110101101011010101010", X: "10001100010101000100010101000110001",
    Y: "10001100010101000100001000010000100", Z: "11111000010001000100010001000011111",
    0: "01110100011001110101110011000101110", 1: "00100011000010000100001000010001110", 2: "01110100010000100010001000100011111",
    3: "11110000010000101110000010000111110", 4: "00010001100101010010111110001000010", 5: "11111100001111000001000011000101110",
    6: "00110010001000011110100011000101110", 7: "11111000010001000100010000100001000", 8: "01110100011000101110100011000101110",
    9: "01110100011000101111000010001001100", " ": "00000000000000000000000000000000000", "·": "00000000000000000100000000000000000",
    "?": "01110100010000100010001000000000100", "!": "00100001000010000100001000000000100", "-": "00000000000000011111000000000000000",
    ",": "00000000000000000000001100010001000", ".": "00000000000000000000000000110001100", "'": "00100001000100000000000000000000000",
    ":": "00000011000110000000011000110000000", "/": "00001000010001000100010001000010000", "&": "01100100101010001000101011001001101",
    "$": "00100011111010001110001011111000100", "%": "11000110010001000100010001001100011",
  };
  const glyph = (ch) => F[ch] || F[ch.toUpperCase()] || F[" "];
  // a string as a grid of lit cells, one column of space between letters
  function bitmap(text) {
    const cols = text.length * 6 - 1, cells = [];
    [...text].forEach((ch, i) => { const g = glyph(ch); for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) if (g[r * 5 + c] === "1") cells.push([i * 6 + c, r]); });
    return { cols, cells };
  }

  // ======================= the LED board =======================
  (function ledsign() {
    const cv = document.getElementById("ledsign");
    if (!cv) return;
    const TOP = "MANUFACTURING", BIG = "CONSENT";
    const MARQUEE = "PAID MEDIA · WAR & MONEY · BOUGHT MOVEMENTS · FAITH, WEAPONIZED · WHO PAID FOR THIS? · ";
    const top = bitmap(TOP), big = bitmap(BIG), mq = bitmap(MARQUEE + MARQUEE);
    let g, W, H, p, layout, t = 0;
    function size() {
      W = cv.parentElement.clientWidth;
      // the big word sets the pitch: its 41 columns fill the board less a margin
      p = Math.max(6, Math.floor((W - 24) / (big.cols + 4)));
      const sp = Math.max(3, Math.round(p * 0.42)), mp = Math.max(3, Math.round(p * 0.36));
      const rows = [
        { bm: top, pitch: sp, y: Math.round(p * 1.1) },
        { bm: big, pitch: p, y: 0 },
        { bm: mq, pitch: mp, y: 0, marquee: true },
      ];
      rows[1].y = rows[0].y + 7 * sp + Math.round(p * 1.1);
      rows[2].y = rows[1].y + 7 * p + Math.round(p * 1.3);
      H = rows[2].y + 7 * mp + Math.round(p * 1.1);
      layout = rows;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.height = H + "px";
      g = cv.getContext("2d"); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function dot(x, y, r, lit, boost) {
      if (lit) {
        g.fillStyle = boost > 0.2 ? "#ffffff" : "#b77cff";
        g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        g.fillStyle = boost > 0.2 ? "#ffffff" : "#ead9ff";
        g.beginPath(); g.arc(x - r * 0.18, y - r * 0.18, r * 0.45, 0, Math.PI * 2); g.fill();
      } else {
        g.fillStyle = "rgba(106,59,163,0.13)";
        g.beginPath(); g.arc(x, y, r * 0.75, 0, Math.PI * 2); g.fill();
      }
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      for (const row of layout) {
        const pitch = row.pitch, r = pitch * 0.36;
        const span = row.marquee ? Math.floor((W - 24) / pitch) : row.bm.cols;
        const x0 = row.marquee ? 12 + (W - 24 - span * pitch) / 2 : (W - row.bm.cols * pitch) / 2;
        const shift = row.marquee ? Math.floor(t * 0.6) % Math.floor(row.bm.cols / 2) : 0;
        const lit = new Set();
        for (const [c, rr] of row.bm.cells) { const cc = c - shift; if (cc >= 0 && cc < span) lit.add(cc * 8 + rr); }
        // the sweep: a band of light that crosses the big word now and then
        const sweep = ((t * 1.4) % (span + 60)) - 20;
        for (let c = 0; c < span; c++) for (let rr = 0; rr < 7; rr++) {
          const on = lit.has(c * 8 + rr);
          const d = Math.abs(c - rr * 0.5 - sweep);
          const boost = !row.marquee && on && d < 3 ? (3 - d) / 6 : 0;
          dot(x0 + c * pitch + pitch / 2, row.y + rr * pitch + pitch / 2, r, on, boost);
        }
      }
      // a bloom over the lit dots, cheaper than a blur on every one
      g.globalCompositeOperation = "lighter";
      g.globalAlpha = 0.5;
      g.filter = `blur(${Math.max(3, p * 0.35)}px)`;
      g.drawImage(cv, 0, 0, W, H);
      g.filter = "none";
      g.globalAlpha = 1;
      g.globalCompositeOperation = "source-over";
    }
    size(); draw();
    ticker(() => { t++; draw(); }, 70);
    onResize(() => { size(); draw(); });
  })();

  // ======================= the control room =======================
  // A gallery's monitor wall: the programme monitor in the middle, four camera
  // monitors around it. Every anchor is different; every mouth moves on the
  // same beat, every blink lands on the same frame, every chyron crawls the
  // same line, fed from the prompter above. The programme monitor is printed
  // large enough for a face to read in characters.
  (function controlRoom() {
    const cv = document.getElementById("tvwall");
    if (!cv) return;
    const LINES = (window.TV_LINES && window.TV_LINES.length ? window.TV_LINES : ["SAME SCRIPT", "EVERY CHANNEL"]).map((s) => s.toUpperCase());
    const RAMP = " .`'-:,_\";^~=+!<>/\\|i?l1rcvzxsjtf7JyunoeaYTL2SFCZ3VXIk4h5wqpdbgOm6UK90PGHAQER8DN%B$#&MW@";
    const PAL = [[20, 12, 28], [54, 32, 80], [104, 58, 160], [161, 92, 240], [205, 165, 255], [246, 240, 255]];
    const shade = (v) => {
      const x = Math.max(0, Math.min(0.9999, v)) * (PAL.length - 1), i = Math.floor(x), f = x - i, a = PAL[i], b = PAL[i + 1];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * f)},${Math.round(a[1] + (b[1] - a[1]) * f)},${Math.round(a[2] + (b[2] - a[2]) * f)})`;
    };

    // ---- a studio portrait in grey on a hidden canvas ----
    // variant 0-3 sets hair and tie; mouth 0 shut, 1 ajar, 2 open, 3 round
    function portrait(ctx, w, h, variant, mouth, blink) {
      const L = (v) => { const k = Math.max(0, Math.min(255, v * 255 | 0)); return `rgb(${k},${k},${k})`; };
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, L(0.08)); bg.addColorStop(1, L(0.02));
      ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // the set: a station globe and light bars behind the desk
      ctx.strokeStyle = L(0.22); ctx.lineWidth = Math.max(1, w * 0.008);
      const gx = w * (variant % 2 ? 0.17 : 0.83), gy = h * 0.34, gr = h * 0.25;
      ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
      for (const k of [0.4, 0.75]) { ctx.beginPath(); ctx.ellipse(gx, gy, gr * k, gr, 0, 0, Math.PI * 2); ctx.stroke(); }
      for (const k of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.ellipse(gx, gy + gr * k, gr * Math.sqrt(1 - k * k), gr * 0.1, 0, 0, Math.PI * 2); ctx.stroke(); }
      const cx = w * 0.5, cy = h * 0.42, hw = h * 0.235, hh = h * 0.3;   // head half-width/height: a close shot
      // a soft key light behind the anchor, so the silhouette separates
      const halo = ctx.createRadialGradient(cx, cy + hh * 0.6, hh * 0.5, cx, cy + hh * 0.6, hh * 2.6);
      halo.addColorStop(0, L(0.34)); halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo; ctx.fillRect(0, 0, w, h);
      // shoulders: suit with a lit edge
      const sh = cy + hh * 1.45;
      ctx.fillStyle = L(0.5);
      ctx.beginPath(); ctx.moveTo(cx - hw * 3.3, h); ctx.quadraticCurveTo(cx - hw * 3.0, sh, cx - hw * 0.7, sh - hh * 0.08); ctx.lineTo(cx + hw * 0.7, sh - hh * 0.08); ctx.quadraticCurveTo(cx + hw * 3.0, sh, cx + hw * 3.3, h); ctx.fill();
      ctx.fillStyle = L(0.3);
      ctx.beginPath(); ctx.moveTo(cx - hw * 3.1, h); ctx.quadraticCurveTo(cx - hw * 2.8, sh + hh * 0.08, cx - hw * 0.7, sh); ctx.lineTo(cx + hw * 0.7, sh); ctx.quadraticCurveTo(cx + hw * 2.8, sh + hh * 0.08, cx + hw * 3.1, h); ctx.fill();
      // shirt, lapels, tie
      ctx.fillStyle = L(0.96);
      ctx.beginPath(); ctx.moveTo(cx - hw * 0.62, sh); ctx.lineTo(cx, h * 0.98); ctx.lineTo(cx + hw * 0.62, sh); ctx.fill();
      ctx.fillStyle = L(0.18);
      ctx.beginPath(); ctx.moveTo(cx - hw * 0.7, sh); ctx.lineTo(cx - hw * 0.08, h); ctx.lineTo(cx - hw * 1.5, h); ctx.lineTo(cx - hw * 1.2, sh + hh * 0.5); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + hw * 0.7, sh); ctx.lineTo(cx + hw * 0.08, h); ctx.lineTo(cx + hw * 1.5, h); ctx.lineTo(cx + hw * 1.2, sh + hh * 0.5); ctx.fill();
      const tie = [0.42, 0.62, 0.3, 0.55][variant % 4];
      ctx.fillStyle = L(tie);
      ctx.beginPath(); ctx.moveTo(cx - hw * 0.16, sh + hh * 0.05); ctx.lineTo(cx + hw * 0.16, sh + hh * 0.05); ctx.lineTo(cx + hw * 0.24, h * 0.96); ctx.lineTo(cx, h); ctx.lineTo(cx - hw * 0.24, h * 0.96); ctx.fill();
      ctx.fillStyle = L(tie - 0.2);
      if (variant % 2 === 0) for (let i = 1; i < 5; i++) ctx.fillRect(cx - hw * 0.22, sh + hh * (0.12 + i * 0.18), hw * 0.44, hh * 0.05);
      ctx.fillStyle = L(0.55); ctx.fillRect(cx - hw * 0.12, sh + hh * 0.02, hw * 0.24, hh * 0.1);   // knot
      // neck, lit from the left
      const neck = ctx.createLinearGradient(cx - hw * 0.5, 0, cx + hw * 0.5, 0);
      neck.addColorStop(0, L(0.62)); neck.addColorStop(1, L(0.38));
      ctx.fillStyle = neck; ctx.fillRect(cx - hw * 0.48, cy + hh * 0.6, hw * 0.96, hh * 0.85);
      // long hair falls behind the head
      ctx.fillStyle = L(0.06);
      if (variant === 3) { ctx.beginPath(); ctx.ellipse(cx, cy + hh * 0.35, hw * 1.32, hh * 1.32, 0, 0, Math.PI * 2); ctx.fill(); }
      // ears
      ctx.fillStyle = L(0.6);
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + s * hw * 0.98, cy + hh * 0.08, hw * 0.16, hh * 0.22, 0, 0, Math.PI * 2); ctx.fill(); }
      // the face: key light from the upper left
      const skin = ctx.createRadialGradient(cx - hw * 0.35, cy - hh * 0.3, hh * 0.1, cx, cy, hh * 1.15);
      skin.addColorStop(0, L(0.86)); skin.addColorStop(0.55, L(0.66)); skin.addColorStop(1, L(0.42));
      ctx.fillStyle = skin;
      ctx.beginPath(); ctx.ellipse(cx, cy, hw, hh, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = L(0.05); ctx.lineWidth = Math.max(1.5, w * 0.012);
      ctx.beginPath(); ctx.ellipse(cx, cy, hw, hh, 0, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      // jaw shadow
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath(); ctx.ellipse(cx + hw * 0.1, cy + hh * 0.72, hw * 0.75, hh * 0.25, 0, 0, Math.PI); ctx.fill();
      // hair
      ctx.fillStyle = L(0.06);
      if (variant === 0) {            // side part
        ctx.beginPath(); ctx.ellipse(cx, cy - hh * 0.45, hw * 1.05, hh * 0.62, 0, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx - hw * 1.05, cy - hh * 0.45); ctx.quadraticCurveTo(cx - hw * 0.2, cy - hh * 0.62, cx + hw * 1.05, cy - hh * 0.3); ctx.lineTo(cx + hw * 1.05, cy - hh * 0.55); ctx.fill();
        ctx.fillRect(cx - hw * 1.05, cy - hh * 0.5, hw * 0.16, hh * 0.45);
        ctx.fillStyle = L(0.3); ctx.fillRect(cx - hw * 0.45, cy - hh * 1.0, hw * 0.06, hh * 0.45);   // the parting
      } else if (variant === 1) {     // curls
        for (let a = Math.PI * 0.92; a < Math.PI * 2.08; a += 0.24) { ctx.beginPath(); ctx.arc(cx + Math.cos(a) * hw * 0.98, cy - hh * 0.12 + Math.sin(a) * hh * 0.92, hw * 0.32, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = L(0.2); for (let a = Math.PI * 1.0; a < Math.PI * 2; a += 0.24) { ctx.beginPath(); ctx.arc(cx + Math.cos(a) * hw * 0.98 - hw * 0.08, cy - hh * 0.12 + Math.sin(a) * hh * 0.92 - hh * 0.08, hw * 0.08, 0, Math.PI * 2); ctx.fill(); }
      } else if (variant === 2) {     // flat top
        ctx.fillRect(cx - hw * 1.0, cy - hh * 1.2, hw * 2.0, hh * 0.62);
        ctx.fillStyle = L(0.18); for (let i = 0; i < 9; i++) ctx.fillRect(cx - hw * 0.95 + i * hw * 0.22, cy - hh * 1.18, hw * 0.05, hh * 0.5);
      } else {                        // swept, long
        ctx.beginPath(); ctx.ellipse(cx, cy - hh * 0.42, hw * 1.12, hh * 0.66, 0, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx + hw * 0.2, cy - hh * 1.05); ctx.quadraticCurveTo(cx - hw * 0.7, cy - hh * 0.5, cx - hw * 1.12, cy - hh * 0.05); ctx.lineTo(cx - hw * 1.12, cy - hh * 0.5); ctx.fill();
      }
      const sheen = ctx.createRadialGradient(cx - hw * 0.4, cy - hh * 0.9, 1, cx - hw * 0.4, cy - hh * 0.9, hw * 0.9);
      sheen.addColorStop(0, "rgba(255,255,255,0.32)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save(); ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = sheen; ctx.fillRect(cx - hw * 1.4, cy - hh * 1.4, hw * 2.8, hh * 0.9);
      ctx.restore();
      // brows
      ctx.fillStyle = L(0.06);
      for (const s of [-1, 1]) ctx.fillRect(cx + s * hw * 0.42 - hw * 0.26, cy - hh * 0.28, hw * 0.52, hh * 0.08);
      // eyes, every one on the same blink
      for (const s of [-1, 1]) {
        const ex = cx + s * hw * 0.42, ey = cy - hh * 0.1;
        if (blink) { ctx.fillStyle = L(0.1); ctx.fillRect(ex - hw * 0.24, ey - hh * 0.01, hw * 0.48, hh * 0.05); continue; }
        ctx.fillStyle = L(0.05); ctx.beginPath(); ctx.ellipse(ex, ey, hw * 0.3, hh * 0.13, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = L(1); ctx.beginPath(); ctx.ellipse(ex, ey, hw * 0.25, hh * 0.1, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = L(0.02); ctx.beginPath(); ctx.arc(ex + hw * 0.03, ey, hh * 0.085, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = L(1); ctx.beginPath(); ctx.arc(ex - hw * 0.02, ey - hh * 0.03, hh * 0.022, 0, Math.PI * 2); ctx.fill();
      }
      // nose: the shadow side and the tip
      ctx.fillStyle = L(0.4);
      ctx.beginPath(); ctx.moveTo(cx + hw * 0.05, cy - hh * 0.02); ctx.lineTo(cx + hw * 0.2, cy + hh * 0.3); ctx.lineTo(cx - hw * 0.1, cy + hh * 0.33); ctx.fill();
      ctx.fillStyle = L(0.2); ctx.fillRect(cx - hw * 0.14, cy + hh * 0.33, hw * 0.1, hh * 0.04); ctx.fillRect(cx + hw * 0.06, cy + hh * 0.33, hw * 0.1, hh * 0.04);
      // mouth
      const my = cy + hh * 0.56;
      ctx.fillStyle = L(0.04);
      if (mouth === 0) { ctx.fillRect(cx - hw * 0.36, my - hh * 0.03, hw * 0.72, hh * 0.075); }
      else {
        const mh = [0, 0.1, 0.17, 0.14][mouth], mw = [0, 0.32, 0.34, 0.2][mouth];
        ctx.beginPath(); ctx.ellipse(cx, my + hh * 0.02, hw * mw, hh * mh, 0, 0, Math.PI * 2); ctx.fill();
        if (mouth === 2) { ctx.fillStyle = L(0.92); ctx.fillRect(cx - hw * 0.22, my - hh * 0.12, hw * 0.44, hh * 0.055); }
      }
      // the desk edge catching the light
      ctx.fillStyle = L(0.26); ctx.fillRect(0, h * 0.9, w, h * 0.1);
      ctx.fillStyle = L(0.85); ctx.fillRect(0, h * 0.9, w, h * 0.014);
    }

    // print a portrait as text into its own canvas, once per pose and size
    let cw = 6, ch = 10, scale = 1;
    const frames = new Map(), hidden = document.createElement("canvas");
    function printFrame(variant, mouth, blink, SC, SR) {
      const key = `${variant}|${mouth}|${blink ? 1 : 0}|${SC}x${SR}|${scale.toFixed(3)}`;
      if (frames.has(key)) return frames.get(key);
      const PW = SC * 3, PH = SR * 5;
      hidden.width = PW; hidden.height = PH;
      const hx = hidden.getContext("2d", { willReadFrequently: true });
      portrait(hx, PW, PH, variant, mouth, blink);
      const px = hx.getImageData(0, 0, PW, PH).data;
      const out = document.createElement("canvas");
      out.width = Math.ceil(SC * cw * scale * DPR); out.height = Math.ceil(SR * ch * scale * DPR);
      const o = out.getContext("2d");
      o.setTransform(scale * DPR, 0, 0, scale * DPR, 0, 0);
      o.fillStyle = "#120b19"; o.fillRect(0, 0, SC * cw, SR * ch);
      o.font = `600 ${ch * 0.96}px ${FONT}`; o.textAlign = "center"; o.textBaseline = "middle";
      // one brightness per cell, then an unsharp mask across the cells, so the
      // eyes, brows and mouth stay distinct at one character per few pixels
      const lum = new Float32Array(SC * SR);
      for (let r = 0; r < SR; r++) for (let c = 0; c < SC; c++) {
        let sum = 0;
        for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) sum += px[((r * 5 + y) * PW + c * 3 + x) * 4];
        lum[r * SC + c] = sum / 15 / 255;
      }
      const at = (c, r) => lum[Math.max(0, Math.min(SR - 1, r)) * SC + Math.max(0, Math.min(SC - 1, c))];
      for (let r = 0; r < SR; r++) for (let c = 0; c < SC; c++) {
        const here = at(c, r);
        const blur = (at(c - 1, r) + at(c + 1, r) + at(c, r - 1) + at(c, r + 1) + at(c - 1, r - 1) + at(c + 1, r + 1) + at(c - 1, r + 1) + at(c + 1, r - 1) + here) / 9;
        const v = Math.pow(Math.max(0, Math.min(1, here + 1.1 * (here - blur))), 0.85);
        const k = Math.min(RAMP.length - 1, Math.floor(v * RAMP.length));
        if (k === 0) continue;
        o.fillStyle = shade(Math.min(1, v * 1.1));
        o.fillText(RAMP[k], c * cw + cw / 2, r * ch + ch / 2);
      }
      o.fillStyle = "rgba(0,0,0,0.1)";
      for (let y = 0; y < SR * ch; y += 3) o.fillRect(0, y, SC * cw, 1);
      if (frames.size > 160) frames.clear();
      frames.set(key, out);
      return out;
    }

    // ---- the gallery: monitors in character units ----
    let g, W, H, staticLayer, mons = [], cols, rows, t = 0, line = 0, crawl = 0, lost = -1, lostT = 0;
    function layout() {
      W = cv.parentElement.clientWidth;
      mons = [];
      if (W >= 760) {
        // programme in the middle, two cameras each side
        const S = { sc: 40, sr: 17 }, P = { sc: 96, sr: 40 };
        const side = S.sc + 4, prog = P.sc + 4, gap = 3;
        cols = side * 2 + prog + gap * 2;
        const top = 3;
        mons.push({ x: 0, y: top, ...S, label: "CAM 1", v: 0 }, { x: 0, y: top + S.sr + 6, ...S, label: "CAM 2", v: 1 });
        mons.push({ x: side + gap, y: top, ...P, label: "PGM · PROGRAMME", v: -1, pgm: true });
        mons.push({ x: side + gap + prog + gap, y: top, ...S, label: "CAM 3", v: 2 }, { x: side + gap + prog + gap, y: top + S.sr + 6, ...S, label: "CAM 4", v: 3 });
        rows = top + P.sr + 5;
      } else {
        // a phone: the programme monitor, and two cameras under it
        const P = { sc: 64, sr: 28 }, S = { sc: 29, sr: 13 };
        cols = P.sc + 4;
        mons.push({ x: 0, y: 3, ...P, label: "PGM", v: -1, pgm: true });
        mons.push({ x: 0, y: 3 + P.sr + 5, ...S, label: "CAM 1", v: 0 }, { x: cols - (S.sc + 4), y: 3 + P.sr + 5, ...S, label: "CAM 2", v: 1 });
        rows = 3 + P.sr + 5 + S.sr + 5;
      }
      scale = W / (cols * cw);
      H = rows * ch * scale;
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
      cv.style.height = H + "px";
      g = cv.getContext("2d");
      // the bezels never change: draw them once
      staticLayer = document.createElement("canvas");
      staticLayer.width = cv.width; staticLayer.height = cv.height;
      const s = staticLayer.getContext("2d");
      s.setTransform(scale * DPR, 0, 0, scale * DPR, 0, 0);
      for (const m of mons) {
        const x = m.x * cw, y = m.y * ch, w = (m.sc + 4) * cw, h = (m.sr + 4) * ch;
        // the housing: a dark box, a double rule, screws in the corners
        s.fillStyle = "#17121d"; s.fillRect(x, y, w, h);
        s.strokeStyle = m.pgm ? "#c79bff" : "#a15cf0"; s.lineWidth = 1.1;
        s.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        s.strokeStyle = "#6a3ba3"; s.strokeRect(x + 3, y + 3, w - 6, h - 6);
        s.fillStyle = "#6a3ba3";
        for (const [a, b] of [[x + 7, y + 7], [x + w - 7, y + 7], [x + 7, y + h - 7], [x + w - 7, y + h - 7]]) { s.beginPath(); s.arc(a, b, 1.6, 0, Math.PI * 2); s.fill(); }
        // the label plate under the screen
        s.font = `700 ${ch * 0.85}px ${FONT}`; s.textBaseline = "middle"; s.textAlign = "left";
        s.fillStyle = m.pgm ? "#efe4ff" : "#a88bd0";
        s.fillText(m.label, x + 2 * cw, y + (m.sr + 3) * ch);
        s.textAlign = "right"; s.fillStyle = "#6a3ba3";
        s.fillText(m.pgm ? "1080i · 29.97" : "PREVIEW", x + w - 2 * cw, y + (m.sr + 3) * ch);
      }
      // the rule under the prompter
      s.fillStyle = "#3a2c4c"; s.fillRect(0, 1.9 * ch, cols * cw, 1);
    }

    function screen(m, pose) {
      const sx = (m.x + 2) * cw, sy = (m.y + 1.5) * ch, sw = m.sc * cw, sh = m.sr * ch;
      if (m === mons[lost]) {
        g.fillStyle = "#120b19"; g.fillRect(sx, sy, sw, sh);
        g.font = `600 ${ch * 0.96}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
        for (let r = 0; r < m.sr; r++) for (let c = 0; c < m.sc; c++) {
          const v = Math.random();
          if (v < 0.4) continue;
          g.fillStyle = shade(v * 0.75);
          g.fillText(v < 0.65 ? "·" : v < 0.82 ? "░" : "▒", sx + c * cw + cw / 2, sy + r * ch + ch / 2);
        }
        g.fillStyle = "#120b19"; g.fillRect(sx + sw / 2 - cw * 8, sy + sh / 2 - ch * 1.2, cw * 16, ch * 2.4);
        g.fillStyle = "#efe4ff"; g.font = `700 ${ch * 1.2}px ${FONT}`; g.fillText("NO SIGNAL", sx + sw / 2, sy + sh / 2);
        return;
      }
      const variant = m.pgm ? line % 4 : m.v;
      g.drawImage(printFrame(variant, pose.mouth, pose.blink, m.sc, m.sr), sx, sy, sw, sh);
      // lower third: a LIVE flag and the crawl
      const barH = Math.max(2, Math.round(m.sr * 0.11)) * ch, by = sy + sh - barH;
      g.fillStyle = "#ffd84d"; g.fillRect(sx, by, sw, barH);
      g.fillStyle = "#1b1220"; g.fillRect(sx, by, barH * 1.9, barH);
      g.font = `700 ${barH * 0.42}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#ffd84d";
      g.fillText("LIVE", sx + barH * 0.95, by + barH / 2);
      g.save(); g.beginPath(); g.rect(sx + barH * 1.9, by, sw - barH * 1.9, barH); g.clip();
      g.font = `700 ${barH * 0.5}px ${FONT}`; g.textAlign = "left"; g.fillStyle = "#1b1220";
      const crawlText = `${pose.text}   ◆   `, unit = g.measureText(crawlText).width;
      const off = (crawl * barH * 0.12) % unit;
      for (let x = sx + barH * 2.2 - off; x < sx + sw; x += unit) g.fillText(crawlText, x, by + barH / 2 + 0.5);
      g.restore();
      if ((t >> 3) % 2) { g.fillStyle = "#ff5a6e"; g.beginPath(); g.arc(sx + sw - cw * 2, sy + ch * 1.2, ch * 0.4, 0, Math.PI * 2); g.fill(); }
    }

    function draw() {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(staticLayer, 0, 0);
      g.setTransform(scale * DPR, 0, 0, scale * DPR, 0, 0);
      const text = LINES[line];
      const typed = text.slice(0, Math.min(text.length, Math.floor(crawl / 1.1) + 1));
      g.font = `600 ${ch * 1.15}px ${FONT}`; g.textAlign = "left"; g.textBaseline = "middle";
      g.fillStyle = "#8a6bb8"; g.fillText("PROMPTER ▸", 0, ch * 0.75);
      g.fillStyle = "#efe4ff"; g.fillText(typed + ((t >> 2) % 2 ? "█" : " "), cw * 13, ch * 0.75);
      g.textAlign = "right"; g.fillStyle = "#8a6bb8"; g.fillText(cols > 100 ? "SAME SCRIPT · EVERY CHANNEL" : "EVERY CHANNEL", cols * cw, ch * 0.75);
      const beat = Math.floor(t / 2);
      const pose = { text, mouth: [0, 2, 1, 3, 2, 0, 1, 2][beat % 8], blink: t % 41 < 2 };
      for (const m of mons) screen(m, pose);
    }
    function step() {
      t++; crawl++;
      if (crawl > 130) { crawl = 0; line = (line + 1) % LINES.length; }
      if (lost >= 0 && t - lostT > 14) lost = -1;
      if (lost < 0 && Math.random() < 0.01) { const k = Math.floor(Math.random() * mons.length); if (!mons[k].pgm) { lost = k; lostT = t; } }
    }
    layout(); draw();
    ready(() => { frames.clear(); layout(); draw(); });
    ticker(() => { step(); draw(); }, 110);
    onResize(() => { frames.clear(); layout(); draw(); });
  })();

  // ======================= the sign-off =======================
  (function signoff() {
    const cv = document.getElementById("signoff");
    if (!cv) return;
    const BARS = ["#efe4ff", "#d7bcff", "#c79bff", "#a15cf0", "#8346c9", "#6a3ba3", "#4b2a75"];
    const LOW = ["#4b2a75", "#262527", "#8346c9", "#262527", "#c79bff", "#262527", "#efe4ff"];
    let g, W, H, t = 0;
    const msg = bitmap("WHO PAID FOR THIS?");
    function size() {
      W = cv.parentElement.clientWidth; H = Math.round(Math.min(230, Math.max(150, W * 0.2)));
      cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.height = H + "px";
      g = cv.getContext("2d"); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    function picture() {
      const bw = W / BARS.length, top = H * 0.66;
      BARS.forEach((c, k) => { g.fillStyle = c; g.fillRect(Math.floor(k * bw), 0, Math.ceil(bw) + 1, top); });
      LOW.forEach((c, k) => { g.fillStyle = c; g.fillRect(Math.floor(k * bw), top, Math.ceil(bw) + 1, H * 0.08); });
      for (let k = 0; k < BARS.length * 2; k++) { g.fillStyle = k % 2 ? "#1b1220" : "#2e2d30"; g.fillRect(Math.floor(k * bw / 2), top + H * 0.08, Math.ceil(bw / 2) + 1, H); }
      // the card, its message in LED dots
      const pitch = Math.max(3, Math.min(6, Math.floor((W * 0.5) / msg.cols)));
      const cwd = msg.cols * pitch + pitch * 6, chd = 7 * pitch + pitch * 9;
      const x0 = (W - cwd) / 2, y0 = (top - chd) / 2;
      g.fillStyle = "#1b1220"; g.fillRect(x0, y0, cwd, chd);
      g.fillStyle = "#ffd84d";
      for (const [c, r] of msg.cells) { g.beginPath(); g.arc(x0 + pitch * 3 + c * pitch + pitch / 2, y0 + pitch * 2.5 + r * pitch + pitch / 2, pitch * 0.4, 0, Math.PI * 2); g.fill(); }
      g.font = `600 ${Math.max(9, pitch * 1.8)}px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillStyle = (t >> 3) % 2 ? "#c79bff" : "#6a3ba3";
      g.fillText("PLEASE  STAND  BY", W / 2, y0 + chd - pitch * 2.6);
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      const cycle = t % 150;
      if (reduced || cycle < 126) { picture(); return; }
      // switch-off: fold to a line, shrink to a dot, then dark, then back
      const k = cycle - 126, mid = H / 2;
      g.fillStyle = "#151417"; g.fillRect(0, 0, W, H);
      if (k < 5) { const h = H * (1 - k / 5) * 0.5; g.save(); g.beginPath(); g.rect(0, mid - h, W, h * 2); g.clip(); picture(); g.restore(); }
      else if (k < 11) { const w = W * (1 - (k - 5) / 6); g.fillStyle = "#efe4ff"; g.fillRect((W - w) / 2, mid - 1, w, 2); }
      else if (k < 17) { const r = 3 * (1 - (k - 11) / 6); g.fillStyle = "#efe4ff"; g.beginPath(); g.arc(W / 2, mid, Math.max(0.5, r), 0, Math.PI * 2); g.fill(); }
    }
    size(); draw();
    ready(draw);
    ticker(() => { t++; draw(); }, 110);
    onResize(() => { size(); draw(); });
  })();
})();
