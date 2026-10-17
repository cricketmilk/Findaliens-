// Blind Pool: the page's pictures, as dithered pixel art in the page's own
// pink and olive. Each is drawn into a small pixel buffer and scaled up whole,
// like the Crash Conduits seal and the Carbon Class globe.
//
//   #pool    the blind pool from above: tiled deck, coping marked "DEPTH: NOT
//            DISCLOSED", pipes along the top edge pouring money in, each coin
//            ringing out across murky water lit by moving caustics. What the
//            money bought is painted on the pool floor and shows only under a
//            light: the reader's cursor, or a sonar sweep when there is none.
//   #flowart a dollar's route by glass pipe: paycheck, pension fund, the
//            fund's vault (the fee drops off into the managers' pile), a
//            startup, the exit, and back along the returns pipe, carry first.
//   #leases  the two 75-year leases on the page as bars, signing to expiry,
//            with the present marked.
//   #feud    Urbit's address space as a stepped pyramid, rent rising to the top.
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const ticker = (fn, ms) => { if (!reduced) setInterval(() => { if (!document.hidden) fn(); }, ms); };
  const onResize = (fn) => { let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 160); }); };

  // ---------- the palette: the page's olive and pink, in steps ----------
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); };
  const P = {
    void: hex("#1d1e1a"), deep: hex("#26272255".slice(0, 7)), shade: hex("#2c2e28"), dark: hex("#33352f"), olive: hex("#3d3f38"),
    base: hex("#44463f"), tile: hex("#4d4f47"), tileHi: hex("#575a51"), grout: hex("#383a33"), stone: hex("#6b6d63"), stoneHi: hex("#85877c"),
    plum: hex("#4a3a49"), mauve: hex("#6e4a6d"), rose: hex("#93608f"), pinkD: hex("#b97fb7"), pink: hex("#f4b6f1"), hot: hex("#ffe3fd"), white: hex("#fff7fe"),
  };
  // water, from murk to light
  const WATER = [P.void, P.shade, P.dark, P.plum, P.mauve, P.rose, P.pinkD, P.pink, P.hot];
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

  // ---------- a 5x7 face ----------
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
    "-": "00000000000000011111000000000000000", ":": "00000011000110000000011000110000000", "$": "00100011111010001110001011111000100",
    "%": "11000110010001000100010001001100011", "~": "00000000000100010101000100000000000", "&": "01100100101010001000101011001001101",
    "+": "00000001000010011111001000010000000", ".": "00000000000000000000000000110001100", "/": "00001000010001000100010001000010000",
    "▸": "01000011000111001111001110011000100", "#": "01010010101111101010111110101001010",
    "?": "01110100010000100010001000000000100", "!": "00100001000010000100001000000000100", ",": "00000000000000000000001100010001000", "'": "00100001000100000000000000000000000",
  };
  const textWidth = (s) => s.length * 6 - 1;

  // a pixel buffer on a canvas, scaled up whole
  function pixels(cv, scaleFor, heightFor) {
    const st = {};
    st.size = () => {
      const cssW = cv.parentElement.clientWidth;
      st.S = scaleFor(cssW);
      st.W = Math.floor(cssW / st.S);
      st.H = heightFor(st.W);
      cv.width = st.W; cv.height = st.H;
      cv.style.width = "100%";
      cv.style.height = (st.H * (cssW / st.W)) + "px";
      st.g = cv.getContext("2d");
      st.img = st.g.createImageData(st.W, st.H);
      st.buf = new Uint32Array(st.img.data.buffer);
    };
    st.px = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < st.W && y < st.H) st.buf[y * st.W + x] = c; };
    st.rect = (x, y, w, h, c) => { for (let j = Math.max(0, y | 0); j < Math.min(st.H, (y + h) | 0); j++) for (let i = Math.max(0, x | 0); i < Math.min(st.W, (x + w) | 0); i++) st.buf[j * st.W + i] = c; };
    st.text = (s, x, y, c, shadow) => {
      [...s].forEach((chr, k) => {
        const g = F[chr] || F[chr.toUpperCase()] || F[" "];
        for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === "1") {
          if (shadow != null) st.px(x + k * 6 + q + 1, y + r + 1, shadow);
          st.px(x + k * 6 + q, y + r, c);
        }
      });
    };
    st.show = () => st.g.putImageData(st.img, 0, 0);
    return st;
  }

  // ======================= the pool =======================
  (function pool() {
    const cv = document.getElementById("pool");
    if (!cv) return;
    const SOURCES = [["PENSIONS"], ["ENDOW-", "MENTS"], ["GULF", "FUNDS"], ["BIG TECH"], ["IN-Q-TEL"], ["FAMILY", "OFFICES"]];
    const FLOOR = ["AI LABS", "DEFENSE TECH", "SURVEILLANCE", "GIG WORK", "CRYPTO", "WEWORK", "STARLINK", "PRIVATE CITY", "FACE SCANS", "DATA CENTERS"];
    const st = pixels(cv, () => 2, (W) => Math.round(Math.min(276, Math.max(190, W * 0.5))));
    let PX, PY, PW, PH, pipes, floor, caust, rings = [], coins = [], t = 0, mouse = null, lastMouse = -1e9, sx, sy, cx, cy;
    // tables for the caustics: sin and cos of each term along each axis
    function tables() {
      const mk = (n, k) => { const s = new Float32Array(n), c = new Float32Array(n); for (let i = 0; i < n; i++) { s[i] = Math.sin(i * k); c[i] = Math.cos(i * k); } return [s, c]; };
      caust = { a: mk(st.W, 0.11), b: mk(st.H, 0.17), d: mk(st.W + st.H, 0.07), e: mk(st.W + st.H, 0.09) };
    }
    function layout() {
      st.size();
      const W = st.W, H = st.H;
      PX = 18; PW = W - 36; PY = 52; PH = H - PY - 22;
      const n = W < 260 ? 3 : SOURCES.length;
      const labels = n < SOURCES.length ? [["PEN-", "SIONS"], ["ENDOW-", "MENTS"], ["GULF", "FUNDS"]] : SOURCES;
      pipes = labels.slice(0, n).map((label, i) => ({ label, x: Math.round(PX + PW * (i + 0.5) / n), next: 6 + i * 7 }));
      // the floor: tiles, lane stripes, and what the money bought
      floor = new Uint8Array(PW * PH);
      for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (x % 12 === 0 || y % 12 === 0) floor[y * PW + x] = 1;
      const lanes = Math.max(3, Math.floor(PH / 24));
      for (let l = 0; l < lanes; l++) {
        const y0 = Math.round((l + 0.5) * PH / lanes) - 1;
        for (let x = 10; x < PW - 10; x++) for (let k = 0; k < 3; k++) floor[(y0 + k) * PW + x] = 2;
        for (const xe of [10, PW - 12]) for (let k = -4; k < 7; k++) for (let w = 0; w < 3; w++) { const yy = y0 + k; if (yy >= 0 && yy < PH) floor[yy * PW + xe + w] = 2; }
      }
      const words = FLOOR.slice(0, W < 260 ? 5 : FLOOR.length);
      words.forEach((w, i) => {
        const cols = W < 260 ? 1 : 2, row = Math.floor(i / cols), col = i % cols;
        const rows = Math.ceil(words.length / cols);
        const x0 = Math.round((col + 0.5) * PW / cols - textWidth(w) / 2 + (row % 2 ? 14 : -14) * (cols > 1 ? 1 : 0));
        const y0 = Math.round((row + 0.5) * PH / rows) - 4;
        [...w].forEach((chr, k) => { const g = F[chr] || F[" "]; for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === "1") { const xx = x0 + k * 6 + q, yy = y0 + r; if (xx >= 0 && xx < PW && yy >= 0 && yy < PH) floor[yy * PW + xx] = 3; } });
        // coins scattered round each, the money that went in
        for (let k = 0; k < 5; k++) { const xx = x0 + ((k * 37 + i * 11) % (textWidth(w) + 10)) - 5, yy = y0 + (k % 2 ? 11 : -6); if (xx > 1 && yy > 1 && xx < PW - 3 && yy < PH - 3) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (!(a === 1 && b === 1) || true) floor[(yy + b) * PW + xx + a] = (a === 1 && b === 1) ? 5 : 4; }
      });
      tables();
      sx = PW / 2; sy = PH / 2;
    }
    function light() {
      if (mouse && performance.now() - lastMouse < 2500) return { x: mouse.x, y: mouse.y, auto: false };
      const a = t * 0.012;
      return { x: PW / 2 + Math.sin(a) * PW * 0.36, y: PH / 2 + Math.sin(a * 1.63 + 1) * PH * 0.3, auto: true };
    }
    function deck() {
      const { W, H, px } = st;
      // deck tiles
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const gx = x % 10, gy = y % 10;
        let c = gx === 0 || gy === 0 ? P.grout : ((x / 10 | 0) + (y / 10 | 0)) % 2 ? P.tile : P.base;
        if (c !== P.grout && gx === 1 && gy > 0 && gy < 9) c = P.tileHi;
        st.buf[y * W + x] = c;
      }
      // coping: a stone band round the water, the pool's marks painted on it
      st.rect(PX - 11, PY - 11, PW + 22, PH + 22, P.stone);
      st.rect(PX - 11, PY - 11, PW + 22, 1, P.stoneHi);
      st.rect(PX - 11, PY - 11, 1, PH + 22, P.stoneHi);
      st.rect(PX - 2, PY - 2, PW + 4, PH + 4, P.shade);
      const MARKS = ["DEPTH ???", "NO LIFEGUARD", "DEPTH ???", "NO LIFEGUARD", "DEPTH ???"];
      for (let i = 0; i + 1 < pipes.length; i++) {
        const m = MARKS[i % MARKS.length], mid = (pipes[i].x + pipes[i + 1].x) >> 1;
        if (pipes[i + 1].x - pipes[i].x - 10 > textWidth(m)) st.text(m, mid - (textWidth(m) >> 1), PY - 9, P.shade);
      }
      const exit = W > 330 ? "DRAINS TO ▸ IPO · ACQUISITION · PRIVATE SALE" : "DRAINS TO ▸ IPO · M&A";
      st.text(exit, PX + PW - textWidth(exit) - 4, PY + PH + 3, P.shade);
      if (W > 460) st.text("MANAGERS PAID FIRST", PX + 4, PY + PH + 3, P.shade);
      // the pipes along the top: a run from the label, a valve wheel, a spout
      for (const p of pipes) {
        const y0 = 4 + p.label.length * 8;
        p.label.forEach((l, k) => st.text(l, p.x - (textWidth(l) >> 1), 2 + (k - p.label.length + 2) * 8 - (p.label.length === 1 ? 4 : 0), P.pink, P.void));
        st.rect(p.x - 2, y0 + 2, 5, PY - y0 - 2, P.stone);
        st.rect(p.x - 2, y0 + 2, 1, PY - y0 - 2, P.stoneHi);
        st.rect(p.x + 2, y0 + 2, 1, PY - y0 - 2, P.grout);
        const vy = y0 + 9;
        st.rect(p.x - 5, vy, 11, 1, P.pink); st.rect(p.x, vy - 5, 1, 11, P.pink);
        st.rect(p.x - 3, vy - 3, 7, 7, P.pinkD); st.rect(p.x - 1, vy - 1, 3, 3, P.pink);
        st.rect(p.x - 3, PY - 1, 7, 3, P.stoneHi);
      }
    }
    function water() {
      const { W, buf } = st, L = light();
      const ts = Math.sin(t * 0.05), tc = Math.cos(t * 0.05), us = Math.sin(t * 0.037), uc = Math.cos(t * 0.037);
      const R = Math.max(30, PW * 0.105);
      for (let y = 0; y < PH; y++) {
        const by = caust.b[0][y], cyy = caust.b[1][y];
        for (let x = 0; x < PW; x++) {
          // caustics: where the summed waves cross zero, light gathers in a web
          const a = caust.a[0][x] * tc + caust.a[1][x] * ts;
          const b = by * uc - cyy * us;
          const d = caust.d[0][x + y] * uc + caust.d[1][x + y] * us;
          const e = caust.e[0][x + (PH - y)] * tc - caust.e[1][x + (PH - y)] * ts;
          const s = a + b + d * 0.8 + e * 0.7;
          const web = Math.max(0, 1 - Math.abs(s) * 1.6);
          let lvl = 1.25 + web * web * 2.4 + (1 - y / PH) * 0.5;
          // rings from the coins
          for (const r of rings) { const dd = Math.hypot(x - r.x, y - r.y) - r.r; if (dd > -2.5 && dd < 2.5) lvl += (2.5 - Math.abs(dd)) * 2.2 * r.a; }
          // the light: inside it the water clears and the floor shows
          const dl = Math.hypot(x - L.x, y - L.y) / R;
          const k = (y & 3) * 4 + (x & 3);
          if (dl < 1) {
            const f = floor[y * PW + x], clear = 1 - dl * dl;
            if (clear > BAYER[k] * 0.9) {
              let c = f === 3 ? P.white : f === 5 ? P.mauve : f === 4 ? P.pink : f === 2 ? P.rose : f === 1 ? P.stone : P.stoneHi;
              // the caustics fall on the floor too
              if (web > 0.6 && f !== 3 && f !== 4) c = f === 2 ? P.pink : P.hot;
              // letters cast a shadow, so they stand off the floor
              if (f !== 3 && x > 0 && y > 0 && floor[(y - 1) * PW + x - 1] === 3) c = P.plum;
              buf[(PY + y) * W + PX + x] = c;
              continue;
            }
          }
          const v = Math.max(0, Math.min(WATER.length - 1.001, lvl));
          const i = Math.floor(v);
          buf[(PY + y) * W + PX + x] = WATER[(v - i) > BAYER[k] ? i + 1 : i];
        }
      }
      // the drain: always faintly there, with money circling it
      const dx = PW - 30, dy = PH - 14;
      for (let j = -4; j <= 4; j++) for (let i = -7; i <= 7; i++) if (Math.abs(i) === 7 || Math.abs(j) === 4 || (i % 3 === 0)) { const xx = dx + i, yy = dy + j; buf[(PY + yy) * W + PX + xx] = P.void; }
      for (let k = 0; k < 4; k++) { const a = t * 0.15 + k * Math.PI / 2, rr = 10 + 2 * Math.sin(t * 0.05 + k); const xx = Math.round(dx + Math.cos(a) * rr * 1.4), yy = Math.round(dy + Math.sin(a) * rr * 0.7); if (yy >= 0 && yy < PH) { buf[(PY + yy) * W + PX + xx] = P.pink; buf[(PY + yy) * W + PX + xx + 1] = P.hot; } }
      // the rim of the light, dotted
      const steps = Math.round(R * 6.3);
      for (let k = 0; k < steps; k += 2) {
        const a = (k / steps) * Math.PI * 2, x = Math.round(L.x + Math.cos(a) * R), y = Math.round(L.y + Math.sin(a) * R);
        if (x >= 0 && y >= 0 && x < PW && y < PH) buf[(PY + y) * W + PX + x] = P.hot;
      }
      const tag = L.auto ? "SONAR" : "YOUR LIGHT";
      const tx = Math.round(L.x - textWidth(tag) / 2), ty = Math.round(L.y - R - 10);
      if (ty > 0) st.text(tag, PX + tx, PY + ty, P.hot, P.void);
    }
    function sprites() {
      for (const c of coins) {
        const x = Math.round(c.x), y = Math.round(c.y);
        // a coin, turning as it falls
        const w = [3, 2, 0, 2][(t + c.k) % 4];
        const rows = [w - 1, w, w, w, w, w, w - 1];
        rows.forEach((hw, j) => { const ww = Math.max(0, hw); st.rect(x - ww, y - 3 + j, ww * 2 + 1, 1, j < 2 ? P.hot : P.pink); });
        if (w >= 2) { st.px(x, y - 1, P.mauve); st.px(x, y, P.mauve); st.px(x, y + 1, P.mauve); }
        st.rect(x - Math.max(0, w), y + 4, Math.max(0, w) * 2 + 1, 1, P.void);
      }
    }
    function draw() { deck(); water(); sprites(); st.show(); }
    function step() {
      t++;
      for (const p of pipes) if (--p.next <= 0) { coins.push({ x: p.x, y: PY + 2, v: 0.5, k: Math.floor(Math.random() * 4), land: PY + 6 + Math.random() * PH * 0.45 }); p.next = 14 + Math.floor(Math.random() * 24); }
      for (const c of coins) { c.y += c.v; c.v = Math.min(3.2, c.v + 0.18); if (c.y >= c.land) { c.done = true; rings.push({ x: c.x - PX, y: c.y - PY, r: 1, a: 1 }); } }
      coins = coins.filter((c) => !c.done);
      for (const r of rings) { r.r += 1.1; r.a *= 0.955; }
      rings = rings.filter((r) => r.a > 0.06).slice(-14);
    }
    const toPool = (e) => { const b = cv.getBoundingClientRect(), k = st.W / b.width; return { x: (e.clientX - b.left) * k - PX, y: (e.clientY - b.top) * k - PY }; };
    cv.addEventListener("pointermove", (e) => {
      const p = toPool(e);
      if (p.x >= 0 && p.y >= 0 && p.x < PW && p.y < PH) { mouse = p; lastMouse = performance.now(); }
    });
    cv.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") lastMouse = -1e9; });
    cv.addEventListener("pointerdown", (e) => {
      const p = toPool(e);
      if (p.x >= 0 && p.y >= 0 && p.x < PW && p.y < PH) { rings.push({ x: p.x, y: p.y, r: 1, a: 1.2 }); mouse = p; lastMouse = performance.now(); }
    });
    layout();
    for (let i = 0; i < 90; i++) step();
    draw();
    ticker(() => { step(); draw(); }, 60);
    onResize(() => { layout(); draw(); });
  })();

  // ======================= the lease clocks =======================
  (function leases() {
    const cv = document.getElementById("leases");
    const LEASES = window.LEASES || [];
    if (!cv || !LEASES.length) return;
    const NOW = 2026;
    const st = pixels(cv, () => 2, () => 6 + LEASES.length * 46);
    let fill = reduced ? 1 : 0, t = 0;
    function draw() {
      const { W } = st;
      st.rect(0, 0, W, st.H, P.shade);
      LEASES.forEach((L, i) => {
        const y = 6 + i * 46, x0 = 4, x1 = W - 4, span = x1 - x0;
        if (i) for (let x = x0; x < x1; x += 3) st.px(x, y - 8, P.plum);
        const name = L.name.toUpperCase().replace(/[‘’]/g, "'"), left = `${L.to - NOW} YEARS LEFT`;
        const tight = textWidth(name) + textWidth(left) + 10 > span;
        st.text(name, x0, y, P.hot, P.void);
        if (!tight) st.text(left, x1 - textWidth(left), y, P.pink, P.void);
        // the bar, in blocks: years gone solid, years to come dim
        const by = y + 11, cells = Math.floor(span / 4), done = Math.round(((NOW - L.from) / (L.to - L.from)) * cells * fill);
        for (let c = 0; c < cells; c++) st.rect(x0 + c * 4, by, 3, 8, c < done ? (c === done - 1 && (t >> 2) % 2 ? P.hot : P.pink) : P.plum);
        const nx = x0 + Math.round(((NOW - L.from) / (L.to - L.from)) * span);
        st.text(String(L.from), x0, by + 11, P.pinkD, P.void);
        const now = `NOW ${NOW}`;
        if (tight) st.text(left, x0 + Math.round((span - textWidth(left)) / 2), by + 11, P.pink, P.void);
        else if (fill >= 1) st.text(now, Math.max(x0 + 30, Math.min(x1 - 60, nx - textWidth(now) / 2)), by + 11, P.hot, P.void);
        // a padlock, then the year it opens
        const lx = x1 - textWidth(String(L.to)) - 12, ly = by + 10;
        st.rect(lx + 1, ly, 5, 2, P.pink); st.rect(lx, ly + 1, 1, 3, P.pink); st.rect(lx + 6, ly + 1, 1, 3, P.pink);
        st.rect(lx - 1, ly + 3, 9, 6, P.pink); st.px(lx + 3, ly + 5, P.shade); st.px(lx + 3, ly + 6, P.shade);
        st.text(String(L.to), x1 - textWidth(String(L.to)), by + 11, P.pink, P.void);
      });
      st.show();
    }
    st.size(); draw();
    if (!reduced && "IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); const go = setInterval(() => { fill = Math.min(1, fill + 0.035); draw(); if (fill >= 1) clearInterval(go); }, 30); } }, { threshold: 0.4 });
      io.observe(cv);
    } else { fill = 1; draw(); }
    ticker(() => { t++; if (fill >= 1) draw(); }, 140);
    onResize(() => { st.size(); draw(); });
  })();

  // ======================= follow a dollar =======================
  // Five stations on a glass pipe: paycheck, pension fund, the fund's vault,
  // a startup, the exit. Coins run right along the lower pipe; the fund's
  // management fee drops off them into the managers' pile as they pass. What
  // comes out of the exit climbs and runs back along the upper pipe, and the
  // 20% carry drops into the vault before the rest reaches the pension fund.
  (function flow() {
    const cv = document.getElementById("flowart");
    if (!cv) return;
    const st = pixels(cv, (w) => (w < 560 ? 1 : w < 900 ? 2 : 3), () => 62);
    const TY = 40, RY = 10; // the two pipes' top edges; interiors are the 3 rows under them
    let t = 0, coins = [], chips = [], pile = 0, flash = [0, 0, 0, 0, 0];
    let cx = [];
    function layout() { st.size(); cx = [0, 1, 2, 3, 4].map((i) => Math.round(st.W * (i + 0.5) / 5)); }
    // a pipe whose inside shows: stone walls, dark glass
    function hpipe(x0, x1, y) { st.rect(x0, y, x1 - x0, 1, P.stoneHi); st.rect(x0, y + 1, x1 - x0, 3, P.void); st.rect(x0, y + 4, x1 - x0, 1, P.stone); for (let x = x0 + 10; x < x1 - 4; x += 22) st.rect(x, y - 1, 2, 7, P.stone); }
    function vpipe(x, y0, y1) { st.rect(x - 2, y0, 1, y1 - y0, P.stoneHi); st.rect(x - 1, y0, 3, y1 - y0, P.void); st.rect(x + 2, y0, 1, y1 - y0, P.stone); }
    function coinAt(x, y, back) { x = Math.round(x); y = Math.round(y); st.rect(x - 1, y, 3, 3, back ? P.white : P.pink); st.px(x, y, back ? P.hot : P.hot); if (!back) st.px(x + 1, y + 2, P.pinkD); }
    // the stations, drawn over the pipes so coins pass behind them
    function paycheck(c) {
      st.rect(c - 14, 24, 22, 13, P.hot); st.rect(c - 14, 24, 22, 1, P.white); st.rect(c - 14, 36, 22, 1, P.pinkD);
      st.rect(c - 11, 27, 9, 1, P.rose); st.rect(c - 11, 30, 14, 1, P.rose); st.rect(c - 11, 33, 6, 1, P.rose); st.rect(c + 1, 32, 5, 2, P.pinkD);
      for (let k = 0; k < 4; k++) { const y = 49 - k * 3; st.rect(c - 1, y, 13, 3, P.pink); st.rect(c - 1, y, 13, 1, P.hot); st.rect(c - 1, y + 2, 13, 1, P.pinkD); }
      st.rect(c - 3, 52, 17, 1, P.void);
    }
    function pension(c) {
      for (let r = 0; r < 7; r++) st.rect(c - 1 - r * 2, 22 + r, 3 + r * 4, 1, r ? P.stoneHi : P.pink);
      st.rect(c - 15, 29, 31, 2, P.stone);
      for (const x of [c - 13, c - 6, c + 1, c + 8]) { st.rect(x, 31, 5, 17, P.stoneHi); st.rect(x + 4, 31, 1, 17, P.stone); }
      st.rect(c - 16, 48, 33, 2, P.stone); st.rect(c - 18, 50, 37, 2, P.stoneHi); st.rect(c - 18, 52, 37, 1, P.void);
      if (flash[1]) st.rect(c - 1, 23, 3, 1, P.white);
    }
    function vault(c) {
      st.rect(c - 14, 24, 29, 28, P.stone); st.rect(c - 14, 24, 29, 1, P.stoneHi); st.rect(c - 12, 26, 25, 24, P.dark); st.rect(c - 14, 51, 29, 1, P.void);
      st.rect(c - 14, 29, 2, 4, P.stoneHi); st.rect(c - 14, 43, 2, 4, P.stoneHi);
      const lit = flash[2] ? P.hot : P.pinkD, a = t * 0.08;
      for (let k = 0; k < 28; k++) { const q = (k / 28) * Math.PI * 2; st.px(c + Math.round(Math.cos(q) * 7), 38 + Math.round(Math.sin(q) * 7), lit); }
      for (let k = 0; k < 3; k++) { const q = a + k * 2.09; for (let r = 2; r < 6; r++) st.px(c + Math.round(Math.cos(q) * r), 38 + Math.round(Math.sin(q) * r), P.pink); }
      st.rect(c - 1, 37, 3, 3, P.hot);
      // the managers' pile, fed by the fee
      const n = 3 + Math.min(4, pile >> 2);
      for (let k = 0; k < n; k++) { const y = 50 - k * 2; st.rect(c + 18, y, 9, 2, k % 2 ? P.pink : P.pinkD); st.rect(c + 18, y, 9, 1, P.hot); }
      st.text("2%", c + 18, 33, P.pink);
      st.text("20%", c + 5, RY + 6, P.pink);
    }
    function rocket(c) {
      const b = (t >> 3) % 2;
      st.rect(c - 12, 51, 25, 2, P.stone); st.rect(c - 12, 53, 25, 1, P.void);
      const y = 22 + b;
      st.rect(c - 1, y, 3, 1, P.hot); st.rect(c - 2, y + 1, 5, 1, P.hot); st.rect(c - 3, y + 2, 7, 2, P.hot);
      st.rect(c - 4, y + 4, 9, 16, P.hot); st.rect(c + 3, y + 4, 2, 16, P.pink);
      st.rect(c - 1, y + 7, 3, 3, P.mauve); st.px(c - 1, y + 7, P.rose);
      st.rect(c - 8, y + 14, 4, 6, P.pinkD); st.rect(c + 5, y + 14, 4, 6, P.pinkD);
      const fl = 2 + ((t >> 1) % 3);
      st.rect(c - 2, y + 20, 5, fl, P.pink); st.rect(c - 1, y + 20, 3, fl + 2, P.hot);
    }
    function exit(c) {
      st.rect(c - 14, 19, 29, 10, P.pink); st.rect(c - 14, 28, 29, 1, P.pinkD);
      st.text("EXIT", c - 11, 20, P.void);
      st.rect(c - 9, 30, 19, 22, P.stone); st.rect(c - 7, 32, 15, 20, P.void);
      const open = 4 + Math.round(2 * Math.sin(t * 0.06));
      st.rect(c - 7, 32, 15 - open, 20, P.mauve); st.rect(c + 8 - open, 32, open, 20, flash[4] ? P.white : P.hot);
      st.px(c + 4 - open, 42, P.pink);
      st.rect(c - 11, 52, 23, 1, P.void);
    }
    // a coin's route: right along the lower pipe, up the riser past the exit,
    // left along the upper pipe, down into the pension fund
    function route() {
      const up = cx[4] + 20;
      return [[cx[0] + 8, TY + 1], [up, TY + 1], [up, RY + 1], [cx[1], RY + 1], [cx[1], 21]];
    }
    function where(d) {
      const pts = route();
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], len = Math.abs(x1 - x0) + Math.abs(y1 - y0);
        if (d <= len) { const f = d / len; return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f, leg: i }; }
        d -= len;
      }
      return null;
    }
    function step() {
      t++;
      if (t % 26 === 0) coins.push({ d: 0, fee: false, carry: false });
      for (const c of coins) {
        c.d += 1.1;
        const p = where(c.d);
        if (!p) { c.done = true; flash[1] = 6; continue; }
        c.p = p;
        if (!c.fee && p.leg === 1 && p.x >= cx[2] + 4) { c.fee = true; chips.push({ x: cx[2] + 14, y: TY + 1, vx: 0.35, vy: -1.1, to: "pile" }); }
        if (p.leg === 2) flash[4] = 3;
        if (!c.carry && p.leg === 3 && p.x <= cx[2]) { c.carry = true; chips.push({ x: cx[2], y: RY + 4, vx: 0, vy: 0.9, to: "vault" }); }
      }
      coins = coins.filter((c) => !c.done);
      for (const q of chips) {
        if (q.to === "pile") { q.vy += 0.12; q.x += q.vx; q.y += q.vy; if (q.y >= 46) { q.done = true; pile = (pile + 1) % 24; } }
        else { q.y += q.vy; if (q.y >= 25) { q.done = true; flash[2] = 8; } }
      }
      chips = chips.filter((q) => !q.done);
      for (let i = 0; i < 5; i++) if (flash[i]) flash[i]--;
    }
    function draw() {
      const { W, H } = st;
      st.rect(0, 0, W, H, P.shade);
      for (let y = 0; y < H; y += 2) for (let x = (y >> 1) & 1; x < W; x += 6) st.px(x, y, P.deep);
      const up = cx[4] + 20;
      hpipe(cx[0] + 4, up + 3, TY);
      vpipe(up, RY, TY + 5);
      hpipe(cx[1] - 2, up + 3, RY);
      vpipe(cx[1], RY + 4, 23);
      vpipe(cx[2], RY + 4, 25);
      if (W >= 300) st.text("RETURNS", Math.round((cx[3] + cx[4]) / 2) - 20, 1, P.rose);
      for (const c of coins) if (c.p) coinAt(c.p.x, c.p.y, c.p.leg >= 2);
      paycheck(cx[0]); pension(cx[1]); vault(cx[2]); rocket(cx[3]); exit(cx[4]);
      for (const q of chips) { st.px(q.x, q.y, P.white); st.px(q.x, q.y + 1, P.pink); }
      st.show();
    }
    layout();
    for (let i = 0; i < 400; i++) step();
    draw();
    ticker(() => { step(); draw(); }, 40);
    onResize(() => { layout(); draw(); });
  })();

  // ======================= Urbit's pyramid =======================
  (function feud() {
    const cv = document.getElementById("feud");
    if (!cv) return;
    const st = pixels(cv, () => 2, (W) => Math.round(W * 0.92));
    let t = 0, tokens = [];
    const TIERS = [
      { label: "256", sub: "GALAXIES", c: P.hot, d: P.pink },
      { label: "65,536", sub: "STARS", c: P.pink, d: P.rose },
      { label: "~4B", sub: "PLANETS", c: P.rose, d: P.plum },
    ];
    function geometry() {
      const { W, H } = st;
      const base = H - 8, top = 22, steps = 9, sh = (base - top) / steps;
      const L0 = 62, AW = W - L0 - 6;
      const out = [];
      for (let i = 0; i < steps; i++) {
        const w = Math.round(AW * 0.18 + AW * 0.82 * (i / (steps - 1)));
        out.push({ x: L0 + Math.round((AW - w) / 2), y: Math.round(top + i * sh), w, h: Math.ceil(sh), tier: i < 2 ? 0 : i < 4 ? 1 : 2 });
      }
      return out;
    }
    function draw() {
      const { W, H } = st;
      st.rect(0, 0, W, H, P.shade);
      // stars in the sky behind it
      for (let k = 0; k < 40; k++) { const x = (k * 97) % W, y = (k * 53) % Math.round(H * 0.45); if (((k + (t >> 3)) % 7) !== 0) st.px(x, y, k % 3 ? P.plum : P.mauve); }
      const steps = geometry();
      for (const s of steps) {
        const tier = TIERS[s.tier];
        for (let y = s.y; y < s.y + s.h; y++) for (let x = s.x; x < s.x + s.w; x++) {
          // lit from the left: dither across each step
          const f = (x - s.x) / s.w, k = (y & 3) * 4 + (x & 3);
          st.px(x, y, f < 0.08 ? tier.c : f > 0.7 + BAYER[k] * 0.25 ? P.plum : f > 0.45 + BAYER[k] * 0.3 ? tier.d : tier.c);
        }
        st.rect(s.x, s.y, s.w, 1, P.hot);
        // the planets are a crowd of tiny windows
        if (s.tier === 2) for (let x = s.x + 3; x < s.x + s.w - 3; x += 4) if (((x * 7 + s.y + (t >> 2)) % 11) > 2) st.px(x, s.y + (s.h >> 1), P.shade);
      }
      // the galaxies: 256 lights along the apex
      const apex = steps[0];
      for (let x = apex.x + 2; x < apex.x + apex.w - 2; x += 2) st.px(x, apex.y - 2, ((x + (t >> 1)) % 5) ? P.white : P.pink);
      // rent rising
      for (const q of tokens) { st.rect(Math.round(q.x) - 1, Math.round(q.y) - 1, 3, 3, P.hot); st.px(Math.round(q.x), Math.round(q.y), P.mauve); }
      // labels
      const lab = [steps[0], steps[2], steps[6]];
      TIERS.forEach((tier, i) => {
        const s = lab[i], y = s.y + 1;
        st.text(tier.label, 3, y, P.white, P.void);
        st.text(tier.sub, 3, y + 9, P.pink, P.void);
        for (let x = Math.max(textWidth(tier.label), textWidth(tier.sub)) + 6; x < s.x - 2; x += 2) st.px(x, y + 4, P.mauve);
      });
      st.show();
    }
    function step() {
      t++;
      const steps = geometry(), b = steps[steps.length - 1];
      if (t % 5 === 0) tokens.push({ x: b.x + Math.random() * b.w, y: b.y + 2, tx: steps[0].x + steps[0].w / 2 + (Math.random() - 0.5) * steps[0].w * 0.6, ty: steps[0].y - 3 });
      for (const q of tokens) { q.y -= 0.9; q.x += (q.tx - q.x) * 0.035; if (q.y <= q.ty) q.done = true; }
      tokens = tokens.filter((q) => !q.done);
    }
    st.size();
    for (let i = 0; i < 60; i++) step();
    draw();
    ticker(() => { step(); draw(); }, 70);
    onResize(() => { st.size(); draw(); });
  })();
})();
