// Demystification Desk: the page's pictures, after a mystic poster in
// lavender and violet on grainy black, and pixelized. Each is drawn into a
// small buffer and scaled up whole. The joke the page is built on: the poster
// promises magic, and every panel turns out to be paperwork.
//
//   #title   DEMYSTIFIED in a pixel-cut serif, an orbit through it, stars
//   #reach   a hand reaching for a star that, every few seconds, resolves
//            into a U-2 at 70,000 feet
//   .scene   one picture per case: the U-2 at dusk, a Mogul balloon train,
//            a $22M coin over a ranch, the Blue Book card drawer
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ticker = (fn, ms) => { if (!reduced) setInterval(() => { if (!document.hidden) fn(); }, ms); };
  const onResize = (fn) => { let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 160); }); };

  const hex = (h) => { const n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); };
  const P = {
    void: hex("#0b0a0e"), dark: hex("#16131f"), plum: hex("#251f38"), dusk: hex("#3a3159"), violet: hex("#6a5aa6"),
    peri: hex("#8d92d9"), lav: hex("#cdbde6"), pale: hex("#efe7fb"), white: hex("#ffffff"), ember: hex("#d9b8f0"),
  };
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const hash = (a, b, c = 0) => {
    let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul((b | 0) + 0x5bd1e995, 0x165667b1) ^ Math.imul((c | 0) + 0x1b873593, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };

  // a 5x7 face for the labels
  const F = {
    A: "01110100011000111111100011000110001", B: "11110100011000111110100011000111110", C: "01111100001000010000100001000001111",
    D: "11110100011000110001100011000111110", E: "11111100001000011110100001000011111", F: "11111100001000011110100001000010000",
    G: "01111100001000010011100011000101111", H: "10001100011000111111100011000110001", I: "01110001000010000100001000010001110",
    K: "10001100101010011000101001001010001", L: "10000100001000010000100001000011111", M: "10001110111010110101100011000110001",
    N: "10001110011010110011100011000110001", O: "01110100011000110001100011000101110", P: "11110100011000111110100001000010000",
    R: "11110100011000111110101001001010001", S: "01111100001000001110000010000111110", T: "11111001000010000100001000010000100",
    U: "10001100011000110001100011000101110", W: "10001100011000110101101011010101010", Y: "10001100010101000100001000010000100",
    0: "01110100011001110101110011000101110", 1: "00100011000010000100001000010001110", 2: "01110100010000100010001000100011111",
    3: "11110000010000101110000010000111110", 4: "00010001100101010010111110001000010", 5: "11111100001111000001000011000101110",
    6: "00110010001000011110100011000101110", 7: "11111000010001000100010000100001000", 8: "01110100011000101110100011000101110",
    9: "01110100011000101111000010001001100", " ": "00000000000000000000000000000000000", "-": "00000000000000011111000000000000000",
    "$": "00100011111010001110001011111000100", ",": "00000000000000000000001100010001000", ".": "00000000000000000000000000110001100",
    "·": "00000000000000000100000000000000000",
  };
  const textW = (s) => s.length * 6 - 1;

  function pixels(cv, scaleFor, heightFor) {
    const st = {};
    st.size = () => {
      const cssW = cv.parentElement.clientWidth;
      st.S = scaleFor(cssW);
      st.W = Math.max(40, Math.floor(cssW / st.S));
      st.H = heightFor(st.W, cssW);
      cv.width = st.W; cv.height = st.H;
      cv.style.width = "100%";
      cv.style.height = st.H * (cssW / st.W) + "px";
      st.g = cv.getContext("2d");
      st.img = st.g.createImageData(st.W, st.H);
      st.buf = new Uint32Array(st.img.data.buffer);
    };
    st.px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < st.W && y < st.H) st.buf[y * st.W + x] = c; };
    st.rect = (x, y, w, h, c) => { for (let j = Math.max(0, Math.round(y)); j < Math.min(st.H, Math.round(y + h)); j++) for (let i = Math.max(0, Math.round(x)); i < Math.min(st.W, Math.round(x + w)); i++) st.buf[j * st.W + i] = c; };
    st.text = (s, x, y, c, k = 1) => [...s].forEach((ch, n) => { const g = F[ch] || F[" "]; for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === "1") st.rect(x + (n * 6 + q) * k, y + r * k, k, k, c); });
    st.line = (x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) | 0; for (let i = 0; i <= n; i++) st.px(x0 + (x1 - x0) * i / (n || 1), y0 + (y1 - y0) * i / (n || 1), c); };
    st.show = () => st.g.putImageData(st.img, 0, 0);
    return st;
  }
  // a night sky, dithered from plum at the horizon to void overhead
  function sky(st, t, horizon, seed = 1) {
    const { W, H } = st;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = y / horizon;
      st.buf[y * W + x] = k > 0.55 + bayer(x, y) * 0.45 ? (k > 0.85 + bayer(x, y) * 0.3 ? P.dusk : P.plum) : k > 0.2 + bayer(x, y) * 0.4 ? P.dark : P.void;
    }
    for (let i = 0; i < W * H / 90; i++) {
      const x = (hash(i, seed) * W) | 0, y = (hash(i, seed, 2) * horizon * 0.95) | 0;
      st.px(x, y, ((t >> 3) + i) % 9 ? (i % 3 ? P.violet : P.lav) : P.dusk);
    }
  }
  // a four-point star with short diagonals: the poster's sparkle
  function sparkle(st, x, y, r, c, c2) {
    for (let i = -r; i <= r; i++) { st.px(x + i, y, Math.abs(i) > r * 0.5 ? c2 : c); st.px(x, y + i, Math.abs(i) > r * 0.5 ? c2 : c); }
    const d = Math.max(1, (r * 0.35) | 0);
    for (let i = 1; i <= d; i++) { st.px(x + i, y + i, c2); st.px(x - i, y - i, c2); st.px(x + i, y - i, c2); st.px(x - i, y + i, c2); }
    st.px(x, y, P.white);
  }
  // the U-2: wings far longer than the body
  function u2(st, x, y, k, c, glint) {
    x = Math.round(x); y = Math.round(y);
    const span = 17 * k;
    for (let i = -span; i <= span; i++) {
      // long straight wings, thinning toward the tips
      st.px(x + i, y, c);
      if (Math.abs(i) < span * 0.55) st.px(x + i, y + 1, c);
    }
    st.rect(x, y - 6 * k, 1, 13 * k, c); // the body, nose up
    st.px(x - 1, y - 6 * k + 1, c); st.px(x + 1, y - 6 * k + 1, c);
    for (let i = -4 * k; i <= 4 * k; i++) st.px(x + i, y + 6 * k, c); // tailplane
    if (glint) sparkle(st, x + Math.round(span * 0.6), y, 2 + k, P.white, P.lav);
  }

  // ======================= DEMYSTIFIED =======================
  (function title() {
    const cv = document.getElementById("title");
    if (!cv) return;
    const st = pixels(cv, (w) => (w < 560 ? 2 : 3), (W) => Math.round(W * 0.27));
    let mask = null, t = 0;
    const word = cv.dataset.word || "DEMYSTIFIED";
    function cut() {
      // the word set in a serif on a hidden canvas, read back pixel by pixel,
      // and worn: grain eats the strokes the way ink wears on a print
      const { W, H } = st, c = document.createElement("canvas");
      c.width = W; c.height = H;
      const g = c.getContext("2d");
      let size = H * 0.78;
      g.font = `700 ${size}px "Cormorant Garamond", Georgia, serif`;
      while (g.measureText(word).width > W * 0.86 && size > 8) { size -= 1; g.font = `700 ${size}px "Cormorant Garamond", Georgia, serif`; }
      g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(word, W / 2, H * 0.56);
      const d = g.getImageData(0, 0, W, H).data;
      mask = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const a = d[i * 4] / 255, x = i % W, y = (i / W) | 0;
        const wear = hash(x >> 1, y >> 1, 4) < 0.1 || hash(x, y, 5) < 0.06;
        mask[i] = a > 0.45 ? (wear ? 1 : 2) : a > 0.2 ? 1 : 0;
      }
    }
    function draw() {
      const { W, H, buf } = st;
      buf.fill(P.void);
      for (let i = 0; i < W * H / 50; i++) st.px(hash(i, 9) * W, hash(i, 10) * H, i % 7 ? P.dark : P.plum);
      const cx = W / 2, cy = H * 0.56, rx = W * 0.47, ry = H * 0.22, tilt = -0.09;
      const orbit = (front) => {
        for (let k = 0; k < 900; k++) {
          const a = (k / 900) * Math.PI * 2, isFront = Math.sin(a) > 0;
          if (isFront !== front) continue;
          const ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
          const x = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), y = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
          st.px(x, y, front ? P.peri : P.dusk);
          if (front && k % 3 === 0) st.px(x, y + 1, P.violet);
        }
      };
      orbit(false);
      for (let i = 0; i < W * H; i++) {
        if (!mask[i]) continue;
        const x = i % W, y = (i / W) | 0;
        if (mask[i] === 2) { buf[i] = (x + y) % 11 === 0 ? P.pale : P.lav; if (y + 1 < H && !mask[i + W]) buf[i + W] = P.violet; }
        else if (bayer(x, y) < 0.5) buf[i] = P.violet;
      }
      orbit(true);
      // a moon riding the orbit
      const a = t * 0.02, ex = Math.cos(a) * rx, ey = Math.sin(a) * ry;
      const mx = cx + ex * Math.cos(tilt) - ey * Math.sin(tilt), my = cy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
      if (Math.sin(a) > 0 || !mask[(Math.round(my) * W + Math.round(mx)) | 0]) { st.rect(mx - 1, my - 1, 3, 3, P.pale); st.px(mx, my, P.white); }
      [[0.9, 0.18, 5], [0.08, 0.3, 3], [0.95, 0.72, 3], [0.18, 0.86, 2]].forEach(([fx, fy, r], i) => {
        const tw = Math.round(r * (0.7 + 0.3 * Math.sin(t * 0.08 + i * 2)));
        sparkle(st, Math.round(W * fx), Math.round(H * fy), tw, P.pale, P.violet);
      });
      st.show();
    }
    const go = () => { st.size(); cut(); draw(); };
    (document.fonts && document.fonts.load ? document.fonts.load('700 40px "Cormorant Garamond"').catch(() => {}) : Promise.resolve()).then(go);
    ticker(() => { t++; if (mask) draw(); }, 80);
    onResize(go);
  })();

  // ======================= the hand and the star =======================
  (function reach() {
    const cv = document.getElementById("reach");
    if (!cv) return;
    // the box is as tall as the column beside it; the picture fills it
    const st = pixels(cv, (w) => (w < 560 ? 2 : 3), (W, cssW) => Math.max(Math.round(W * 0.55), Math.round(cv.parentElement.clientHeight / (cssW / W))));
    let t = 0;
    function hand(cx, base, k) {
      const { W, H } = st, id = new Int8Array(W * H).fill(-1);
      // each part a capsule: [base x, base y, angle from upright, length, width]
      const parts = [
        [cx - 6.2 * k, base - 13 * k, -0.17, 17 * k, 2.3 * k], // index
        [cx - 1.4 * k, base - 14 * k, -0.03, 20 * k, 2.4 * k], // middle
        [cx + 3.4 * k, base - 13.5 * k, 0.1, 18 * k, 2.3 * k], // ring
        [cx + 7.6 * k, base - 11.5 * k, 0.26, 13 * k, 2.0 * k], // little
        [cx - 9.5 * k, base - 5 * k, -0.95, 12 * k, 2.6 * k], // thumb
      ];
      const mark = (x, y, v) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H && id[y * W + x] < 0) id[y * W + x] = v; };
      parts.forEach(([bx, by, a, len, w], f) => {
        const ex = bx + Math.sin(a) * len, ey = by - Math.cos(a) * len;
        for (let y = Math.floor(Math.min(by, ey) - w - 1); y <= Math.max(by, ey) + w + 1; y++) for (let x = Math.floor(Math.min(bx, ex) - w - 1); x <= Math.max(bx, ex) + w + 1; x++) {
          const vx = ex - bx, vy = ey - by, tt = Math.max(0, Math.min(1, ((x - bx) * vx + (y - by) * vy) / (vx * vx + vy * vy)));
          const d = Math.hypot(x - (bx + vx * tt), y - (by + vy * tt));
          if (d <= w * (1 - tt * 0.22)) mark(x, y, f);
        }
      });
      for (let y = Math.round(base - 15 * k); y < H; y++) for (let x = Math.round(cx - 11 * k); x <= cx + 11 * k; x++) {
        const u = (x - cx) / (10.5 * k), v = (y - (base - 6.5 * k)) / (9 * k);
        if (y > base - 2 * k ? Math.abs(x - cx) < 7.5 * k + (y - base) * 0.08 : u * u + v * v < 1) mark(x, y, 5);
      }
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const f = id[y * W + x];
        if (f < 0) continue;
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const xx = x + a, yy = y + b; return xx < 0 || yy < 0 || xx >= W || yy >= H || id[yy * W + xx] !== f; });
        const other = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const xx = x + a, yy = y + b; return xx >= 0 && yy >= 0 && xx < W && yy < H && id[yy * W + xx] >= 0 && id[yy * W + xx] !== f; });
        // light from the upper left: the right of each form is hatched
        const shade = (x - cx) / (12 * k) + (y - base) / (40 * k);
        let c = P.lav;
        if (other) c = P.dusk;
        else if (edge) c = P.violet;
        else if (shade > 0.25 && (x + y) % 3 === 0) c = P.violet;
        else if (shade > 0.55 && (x - y) % 3 === 0) c = P.violet;
        else if ((x * 7 + y * 3) % 23 === 0) c = P.pale;
        st.buf[y * W + x] = c;
      }
    }
    function draw() {
      const { W, H } = st;
      sky(st, t, H, 3);
      const k = H / 92;
      const sx = Math.round(W / 2), sy = Math.round(H * 0.25);
      // the cycle: a star for a while, then the truth, then a star again
      const cyc = t % 140, seeing = cyc > 90 && cyc < 132;
      for (let a = 0; a < 360; a += 3) st.px(sx + Math.cos(a * Math.PI / 180) * H * 0.2, sy + Math.sin(a * Math.PI / 180) * H * 0.2, P.dusk);
      st.line(sx - H * 0.27, sy, sx + H * 0.27, sy, P.plum); st.line(sx, sy - H * 0.25, sx, sy + H * 0.25, P.plum);
      if (!seeing) {
        const r = Math.round(H * 0.11 * (0.85 + 0.15 * Math.sin(t * 0.15)));
        sparkle(st, sx, sy, r, P.pale, P.lav);
        sparkle(st, sx, sy, Math.round(r * 0.45), P.white, P.pale);
      } else {
        const f = Math.min(1, (cyc - 90) / 8);
        u2(st, sx, sy, Math.max(1, Math.round(k)), f < 1 && (t & 1) ? P.violet : P.pale, true);
        const label = "U-2 · 70,000 FT";
        st.line(sx + 6, sy + 4, sx + 16, sy + 12, P.violet);
        st.text(label, Math.min(W - textW(label) - 2, sx + 18), sy + 10, P.lav);
      }
      hand(Math.round(W / 2), Math.round(H * 0.86), k);
      st.show();
    }
    st.size(); draw();
    ticker(() => { t++; draw(); }, 70);
    onResize(() => { st.size(); draw(); });
  })();

  // ======================= the four cases =======================
  const SCENES = {
    u2(st, t) {
      const { W, H } = st, horizon = Math.round(H * 0.74);
      sky(st, t, horizon, 5);
      for (let y = horizon; y < H; y++) for (let x = 0; x < W; x++) st.buf[y * W + x] = bayer(x, y) < (y - horizon) / (H - horizon) * 0.6 ? P.void : P.dark;
      for (let i = 0; i < 12; i++) st.px((hash(i, 40) * W) | 0, horizon + 3 + ((hash(i, 41) * (H - horizon - 4)) | 0), (t >> 4) % 5 === i % 5 ? P.ember : P.lav);
      const x = ((t * 0.4) % (W + 60)) - 30;
      u2(st, x, Math.round(H * 0.3), 1, P.pale, (t >> 2) % 4 !== 0);
      st.text("60,000 FT", 3, 3, P.violet);
    },
    mogul(st, t) {
      const { W, H } = st, horizon = Math.round(H * 0.84);
      sky(st, t, horizon, 6);
      st.rect(0, horizon, W, H - horizon, P.dark);
      for (let x = 4; x < W; x += 9) st.rect(x, horizon - 4, 1, 4, P.dusk);
      st.line(0, horizon - 3, W, horizon - 3, P.dusk);
      const ax = Math.round(W * 0.22), top = 4;
      let prev = null;
      for (let y = horizon - 4; y > top; y--) {
        const k = (horizon - y) / (horizon - top);
        const x = ax + k * W * 0.42 + Math.sin(t * 0.05 + k * 3) * 3 * k;
        if (prev) st.line(prev[0], prev[1], x, y, P.violet);
        prev = [x, y];
        const n = (horizon - y);
        if (n % 14 === 7) { const r = 3; for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) if (i * i + j * j <= r * r) st.px(x + i, y + j, i < 0 && j < 0 ? P.pale : P.lav); }
        else if (n % 14 === 0 && n > 0) { for (let i = -3; i <= 3; i++) { const h = 3 - Math.abs(i); st.line(x + i, y - h, x + i, y + h, P.peri); } st.px(x, y, P.pale); }
      }
      st.text("FLIGHT 4", 3, 3, P.violet);
    },
    ranch(st, t) {
      const { W, H } = st, horizon = Math.round(H * 0.8);
      sky(st, t, horizon, 7);
      for (let x = 0; x < W; x++) {
        const m = Math.round(horizon - 8 - Math.max(0, Math.sin(x / W * 3.1) * 10 + (x > W * 0.6 ? 6 : 0)) + (hash(x >> 2, 1) * 2 | 0));
        for (let y = m; y < H; y++) st.px(x, y, y > horizon ? P.void : P.dark);
      }
      const hx = Math.round(W * 0.62), hy = horizon - 1;
      st.rect(hx - 8, hy - 7, 16, 7, P.plum);
      for (let r = 0; r < 5; r++) st.rect(hx - 9 + r, hy - 8 - r, 18 - r * 2, 1, P.dusk);
      st.rect(hx - 4, hy - 5, 3, 3, (t >> 3) % 6 ? P.ember : P.lav);
      for (let x = 2; x < W; x += 6) st.rect(x, horizon - 2, 1, 3, P.dusk);
      // the coin hovering like a saucer, its beam on the house
      const cx = Math.round(W * 0.5 + Math.sin(t * 0.03) * 6), cy = Math.round(H * 0.3 + Math.sin(t * 0.07) * 2);
      for (let y = cy + 7; y < hy - 7; y++) { const w = (y - cy) * 0.55; for (let x = -w; x <= w; x++) if (bayer(cx + x, y) < 0.22) st.px(cx + x + (hx - cx) * (y - cy) / (hy - cy), y, P.violet); }
      for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) { const r = Math.hypot(i, j); if (r <= 8) st.px(cx + i, cy + j, r > 6.6 ? P.peri : r > 5.5 ? P.violet : P.lav); }
      st.text("$", cx - 2, cy - 3, P.void);
      st.text("$22M", Math.min(W - 26, cx + 12), cy - 3, P.lav);
    },
    bluebook(st, t) {
      const { W, H } = st;
      st.buf.fill(P.void);
      for (let i = 0; i < W * H / 60; i++) st.px(hash(i, 51) * W, hash(i, 52) * H, P.dark);
      const n = Math.min(12618, Math.floor((t % 260) * 70));
      const s = n.toLocaleString("en-US"), k = Math.max(1, Math.round(H / 48));
      st.text(s, Math.round((W - textW(s) * k) / 2), 6, P.pale, k);
      const u = "701 UNIDENTIFIED";
      st.text(u, Math.round((W - textW(u)) / 2), 8 + 8 * k, n >= 12618 ? P.ember : P.dusk);
      // the drawer, cards standing in it, one lifting now and then
      const dx = Math.round(W * 0.18), dw = Math.round(W * 0.64), dy = Math.round(H * 0.58), dh = H - dy - 3;
      st.rect(dx, dy, dw, dh, P.plum); st.rect(dx + 1, dy + 1, dw - 2, 2, P.dusk);
      const lift = (t >> 4) % 9;
      for (let x = dx + 3; x < dx + dw - 3; x += 3) {
        const up = Math.floor((x - dx) / 3) % 9 === lift ? 5 : 0;
        st.rect(x, dy - 6 - up, 2, 8 + up, x % 6 ? P.lav : P.pale);
      }
      st.rect(dx + dw / 2 - 6, dy + dh / 2, 12, 4, P.violet); st.rect(dx + dw / 2 - 2, dy + dh / 2 + 1, 4, 2, P.pale);
    },
  };
  document.querySelectorAll("canvas.scene").forEach((cv) => {
    const draw = SCENES[cv.dataset.scene];
    if (!draw) return;
    const st = pixels(cv, (w) => (w < 400 ? 2 : 3), (W) => Math.round(W * 0.62));
    let t = (Math.random() * 200) | 0;
    const frame = () => { draw(st, t); st.show(); };
    st.size(); frame();
    ticker(() => { t++; frame(); }, 80);
    onResize(() => { st.size(); frame(); });
  });
})();
