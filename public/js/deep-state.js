// Deep State: the page's picture, after a black-and-white stipple poster. A
// clearing in a pixel forest; an eye in a pyramid weeping ink, its iris a
// slow hypnotic spiral that turns to watch the reader; the forest's edge
// coming apart into squares; and a road of corrupted colour running in. It
// is drawn into a small pixel buffer and scaled up whole, like the other
// pages' pictures, so every pixel is a block on the screen.
//
//   #eye     the hero
//   .glyph   small emblems beside each dossier, in the same ink
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ticker = (fn, ms) => { if (!reduced) setInterval(() => { if (!document.hidden) fn(); }, ms); };
  const onResize = (fn) => { let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 160); }); };

  // ---------- ink, paper and the colours that leak through ----------
  const hex = (h) => { const n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); };
  const K = hex("#050505"), W = hex("#ffffff"), G = hex("#d9d9d9");
  const GLITCH = ["#00f0ff", "#ff2fd0", "#2b3bff", "#7a3cff", "#ff8ad8", "#3dff9a", "#ff3355", "#ffffff", "#9af7ff"].map(hex);
  const BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map((v) => (v + 0.5) / 64);
  const bayer = (x, y) => BAYER[(y & 7) * 8 + (x & 7)];
  const hash = (a, b, c = 0) => { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  // smooth value noise, for where the leaves clump
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = (t) => t * t * (3 - 2 * t);
    const a = hash(xi, yi, 7), b = hash(xi + 1, yi, 7), c = hash(xi, yi + 1, 7), d = hash(xi + 1, yi + 1, 7);
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
  }
  const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;

  function pixels(cv, scaleFor, heightFor) {
    const st = {};
    st.size = () => {
      const cssW = cv.parentElement.clientWidth;
      st.S = scaleFor(cssW);
      st.W = Math.max(60, Math.floor(cssW / st.S));
      st.H = heightFor(st.W, cssW);
      cv.width = st.W; cv.height = st.H;
      cv.style.width = "100%";
      cv.style.height = st.H * (cssW / st.W) + "px";
      st.g = cv.getContext("2d");
      st.img = st.g.createImageData(st.W, st.H);
      st.buf = new Uint32Array(st.img.data.buffer);
    };
    st.px = (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < st.W && y < st.H) st.buf[y * st.W + x] = c; };
    st.rect = (x, y, w, h, c) => { for (let j = Math.max(0, y | 0); j < Math.min(st.H, (y + h) | 0); j++) for (let i = Math.max(0, x | 0); i < Math.min(st.W, (x + w) | 0); i++) st.buf[j * st.W + i] = c; };
    st.box = (x, y, s, fill, line) => { st.rect(x, y, s, s, line); if (s > 2) st.rect(x + 1, y + 1, s - 2, s - 2, fill); };
    st.show = () => st.g.putImageData(st.img, 0, 0);
    return st;
  }

  // ======================= the eye in the clearing =======================
  (function hero() {
    const cv = document.getElementById("eye");
    if (!cv) return;
    const st = pixels(cv, (w) => (w < 520 ? 3 : 4), (Wb, cssW) => Math.round(cssW < 520 ? Wb * 1.18 : Math.min(Wb * 0.6, 760 / 4)));
    let base, t = 0, L = {}, drips = [], drops = [], blocks = [], tear = null, look = { x: 0, y: 0 }, aim = null, lastAim = -1e9;

    function layout() {
      st.size();
      const { W: Wd, H } = st, cx = Wd / 2, tall = H > Wd;
      L = {
        cx, cy: H * (tall ? 0.36 : 0.4), rx: Wd * (tall ? 0.36 : 0.25), ry: H * (tall ? 0.36 : 0.52),
        apex: H * (tall ? 0.07 : 0.06), baseY: H * (tall ? 0.42 : 0.5), half: Wd * (tall ? 0.28 : 0.15),
        groundY: H * (tall ? 0.78 : 0.76), bushY: H * (tall ? 0.66 : 0.64),
      };
      L.eyeY = L.apex + (L.baseY - L.apex) * 0.64; L.eyeW = L.half * 0.6; L.eyeH = L.eyeW * 0.44;
      base = new Uint32Array(Wd * H);
      // the forest: dense stipple at the edges thinning to the clearing, in
      // clumps where the noise says leaves gather
      for (let y = 0; y < H; y++) for (let x = 0; x < Wd; x++) {
        const ex = (x - cx) / L.rx, ey = (y - L.cy) / L.ry;
        const e = Math.sqrt(ex * ex + ey * ey);
        const leaf = fbm(x * 0.09, y * 0.09), twig = fbm(x * 0.31 + 40, y * 0.31);
        let d = Math.min(0.9, Math.max(0, (e - 0.86) * 1.7)) * (0.35 + leaf * 1.05);
        if (leaf < 0.38) d *= 0.45; // light coming through the canopy
        d += (twig - 0.5) * 0.18;
        if (y > L.bushY) d = Math.max(d, (0.2 + leaf * 0.7) * Math.min(1, (y - L.bushY) / ((L.groundY - L.bushY) * 0.6)));
        d = Math.max(0, Math.min(0.97, d));
        base[y * Wd + x] = d > bayer(x, y) * 0.92 + hash(x, y) * 0.08 ? K : W;
      }
      // trunks, black, leaning out of the canopy on both sides
      for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
        const x0 = cx + side * (L.rx * (1.0 + k * 0.33)), w = Math.max(2, Math.round(Wd * (0.008 + 0.005 * (2 - k))));
        const y0 = Math.round(H * (0.04 + k * 0.06));
        for (let y = y0; y < L.groundY; y++) {
          const lean = side * (Math.sin(y / H * 2.2 + k * 1.7) * Wd * 0.012 + (L.groundY - y) / H * Wd * 0.03);
          const ww = w + Math.round((y - y0) / (L.groundY - y0) * 2);
          for (let i = 0; i < ww; i++) { const x = Math.round(x0 + lean + i); if (x >= 0 && x < Wd) base[y * Wd + x] = K; }
          // a branch now and then, reaching toward the light
          if (hash(k * 31 + (side > 0 ? 7 : 0), y, 5) < 0.035 && y < L.bushY) {
            const len = 4 + ((hash(k, y, 6) * Wd * 0.05) | 0);
            for (let b = 0; b < len; b++) { const x = Math.round(x0 + lean - side * b), yy = y - (b >> 1); if (x >= 0 && x < Wd && yy >= 0) base[yy * Wd + x] = K; }
          }
        }
      }
      // where the forest meets the clearing it breaks into square outlines
      const cell = Wd < 200 ? 4 : 5;
      for (let gy = 0; gy < L.groundY; gy += cell) for (let gx = 0; gx < Wd; gx += cell) {
        const ex = (gx - cx) / L.rx, ey = (gy - L.cy) / L.ry, e = Math.sqrt(ex * ex + ey * ey);
        if (e < 0.8 || e > 1.08) continue;
        const p = 1 - Math.abs(e - 0.94) / 0.14, r = hash(gx, gy, 3);
        if (r > p * 0.42) continue;
        const s = r < 0.04 ? cell * 2 - 1 : cell - (r < 0.25 ? 1 : 2);
        for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
          const x = gx + i, y = gy + j;
          if (x < Wd && y < H) base[y * Wd + x] = i === 0 || j === 0 || i === s - 1 || j === s - 1 ? K : W;
        }
      }
      // flowers in the undergrowth, pixels of colour in the black
      for (let y = Math.round(L.bushY); y < L.groundY; y++) for (let x = 0; x < Wd; x++) {
        if (base[y * Wd + x] === K && hash(x, y, 9) < 0.07) base[y * Wd + x] = GLITCH[(hash(x, y, 11) * 6) | 0];
      }
      // the ink: drips hanging from the pyramid's base
      drips = [];
      const n = Math.round(L.half * 0.75);
      for (let i = 0; i < n; i++) {
        const x = Math.round(L.cx - L.half * 0.92 + (i / (n - 1)) * L.half * 1.84 + (hash(i, 1) - 0.5) * 2);
        const r = hash(i, 2);
        const reach = r < 0.16 ? H * (0.14 + hash(i, 3) * 0.16) : r < 0.45 ? H * (0.04 + hash(i, 3) * 0.06) : H * (0.008 + hash(i, 3) * 0.025);
        drips.push({ x, reach, w: hash(i, 4) < 0.35 ? 2 : 1, ph: hash(i, 5) * 6.28, sp: 0.006 + hash(i, 6) * 0.012, wob: hash(i, 7) * 6.28 });
      }
      // glitch blocks drifting at the forest's edge
      blocks = [];
      for (let i = 0; i < Math.round(Wd * 0.16); i++) {
        const side = i % 2 ? 1 : -1;
        blocks.push({ x: cx + side * (L.rx * (0.7 + hash(i, 21) * 0.75)), y: L.cy + (hash(i, 22) - 0.1) * L.ry * 0.9, s: 3 + ((hash(i, 23) * 7) | 0), c: hash(i, 24) < 0.55 ? -1 : (hash(i, 25) * 5) | 0, ph: hash(i, 26) * 100 });
      }
      drops = [];
    }

    function eye(buf, Wd) {
      const { cx, eyeY, eyeW, eyeH } = L;
      // the pupil drifts toward the reader's pointer, or wanders on its own
      const want = aim && performance.now() - lastAim < 4000 ? aim : { x: Math.sin(t * 0.013) * 0.6, y: Math.sin(t * 0.021) * 0.35 };
      look.x += (want.x - look.x) * 0.12; look.y += (want.y - look.y) * 0.12;
      const px = cx + look.x * eyeW * 0.38, py = eyeY + look.y * eyeH * 0.32;
      for (let y = Math.floor(eyeY - eyeH); y <= eyeY + eyeH; y++) for (let x = Math.floor(cx - eyeW); x <= cx + eyeW; x++) {
        const u = (x - cx) / eyeW, v = (y - eyeY) / eyeH;
        const lid = Math.pow(Math.max(0, 1 - u * u), 0.85);
        if (Math.abs(v) > lid) continue;
        const dx = x - px, dy = (y - py) * 1.35, r = Math.sqrt(dx * dx + dy * dy);
        let c;
        if (Math.abs(Math.abs(v) - lid) < 0.13 / Math.max(0.35, lid)) c = K; // the lid's line
        else if (r < eyeH * 0.32) c = r < eyeH * 0.1 && dx < 0 && dy < 0 ? W : K; // pupil, one glint
        else {
          // a log spiral, turning slowly: the op-art iris
          const a = Math.atan2(dy, dx), s = r / 2.6 + a / Math.PI - t * 0.035;
          c = (s - Math.floor(s)) < 0.5 ? K : W;
        }
        buf[y * Wd + x] = c;
      }
    }

    function road(buf, Wd, H) {
      const top = Math.round(L.groundY);
      for (let y = top; y < H; y++) {
        const depth = (y - top) / (H - top); // 0 far, 1 near
        const seg = 2 + Math.round(3 + depth * 22 + hash(y, 31) * 10);
        let off = Math.floor(t * (0.3 + depth * 2.2) * (hash(y, 32) < 0.5 ? 1 : -1) + hash(y, 33) * 400);
        if (tear && y >= tear.y && y < tear.y + tear.h) off += tear.dx;
        const centre = Wd / 2, spread = Wd * (0.08 + depth * 0.62);
        for (let x = 0; x < Wd; x++) {
          const k = Math.floor((x + off) / seg), h = hash(k, y, 34);
          const onPath = Math.abs(x - centre) < spread;
          let c;
          if (!onPath && depth < 0.35) c = h < 0.6 ? K : GLITCH[(h * 9) | 0];
          else if (h < (onPath ? 0.12 : 0.34)) c = K;
          else if (h < (onPath ? 0.42 - depth * 0.15 : 0.44)) c = W;
          else c = GLITCH[(hash(k, y, 35) * 7) | 0];
          // a scan seam every few rows, the stream catching
          if ((y + (t >> 3)) % 7 === 0 && hash(k, 36) < 0.3) c = K;
          buf[y * Wd + x] = c;
        }
      }
    }

    function draw() {
      const { W: Wd, H, buf } = st;
      buf.set(base);
      // the pyramid
      const { cx, apex, baseY, half } = L;
      for (let y = Math.floor(apex); y < baseY; y++) {
        const w = ((y - apex) / (baseY - apex)) * half;
        for (let x = Math.floor(cx - w); x <= cx + w; x++) buf[y * Wd + x] = K;
      }
      eye(buf, Wd);
      // ink running down, a bulb at each end, some letting go
      for (const d of drips) {
        const len = Math.max(1, d.reach * (0.82 + 0.18 * Math.sin(t * d.sp + d.ph)));
        for (let y = Math.floor(baseY); y < baseY + len; y++) {
          // ink thins as it runs and wavers a pixel either way
          const k = (y - baseY) / len, x = d.x + Math.round(Math.sin(y * 0.35 + d.wob) * 0.6 * k);
          const w = k < 0.3 ? d.w + 1 : d.w;
          for (let i = 0; i < w; i++) st.px(x + i, y, K);
        }
        st.rect(d.x - 1, baseY + len - 2, d.w + 2, 3, K);
      }
      for (const b of blocks) {
        const jx = hash(b.ph | 0, (t >> 4)) < 0.06 ? 1 : 0;
        const y = b.y - ((t * 0.04 + b.ph) % (st.H * 0.25));
        if (b.c < 0) st.box(b.x + jx, y, b.s, W, K); else st.box(b.x + jx, y, b.s, GLITCH[b.c], K);
      }
      for (const d of drops) st.rect(d.x, d.y, d.s, d.s, K);
      road(buf, Wd, H);
      st.show();
    }

    function step() {
      t++;
      if (!reduced && t % 9 === 0 && drops.length < 14) {
        const d = drips[(Math.random() * drips.length) | 0];
        drops.push({ x: d.x, y: L.baseY + d.reach * 0.9, v: 0.15, s: Math.random() < 0.3 ? 3 : 2 });
      }
      for (const d of drops) { d.v = Math.min(1.4, d.v + 0.03); d.y += d.v; }
      drops = drops.filter((d) => d.y < L.groundY - 2);
      if (tear) { if (--tear.life <= 0) tear = null; }
      else if (Math.random() < 0.012) tear = { y: Math.round(L.groundY + Math.random() * (st.H - L.groundY) * 0.8), h: 2 + ((Math.random() * 8) | 0), dx: ((Math.random() - 0.5) * st.W * 0.4) | 0, life: 6 + ((Math.random() * 10) | 0) };
    }

    const toAim = (e) => { const r = cv.getBoundingClientRect(); return { x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2.4)), y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - L.eyeY / st.H) * 3)) }; };
    window.addEventListener("pointermove", (e) => { aim = toAim(e); lastAim = performance.now(); }, { passive: true });
    cv.addEventListener("pointerdown", (e) => { aim = toAim(e); lastAim = performance.now(); tear = { y: Math.round(L.groundY), h: Math.round(st.H - L.groundY), dx: ((Math.random() - 0.5) * st.W * 0.5) | 0, life: 8 }; });

    layout();
    for (let i = 0; i < 40; i++) step();
    draw();
    ticker(() => { step(); draw(); }, 50);
    onResize(() => { layout(); draw(); });
  })();

  // ======================= the dossiers' emblems =======================
  // Each 44 pixels square, ink on paper, one small motion apiece: a column of
  // the civil service coming apart, an eye scanning, a coin splitting into
  // its colours, a drone holding a target.
  const N = 44;
  const GLYPHS = {
    columns(st, t) {
      const fall = Math.floor(t / 40) % 6; // which column is going
      const phase = (t % 40) / 40;
      for (let r = 0; r < 9; r++) st.rect(22 - r * 2 - 1, 6 + r, r * 4 + 3, 1, K);
      st.rect(5, 15, 35, 3, K);
      [8, 15, 22, 29, 36].forEach((x, i) => {
        if (i === fall && phase > 0.15 && phase < 0.85) {
          // the column goes to squares, then comes back
          for (let y = 19; y < 35; y += 3) if (hash(i, y, t >> 2) > 0.35) st.box(x - 1 + (hash(i, y, 2) * 3 | 0) - 1, y, 3, W, K);
        } else { st.rect(x - 1, 19, 3, 16, K); st.px(x + 1, 19, W); }
      });
      st.rect(4, 35, 37, 2, K); st.rect(2, 38, 41, 2, K);
    },
    eye(st, t) {
      for (let y = 8; y < 36; y++) for (let x = 3; x < 41; x++) {
        const u = (x - 22) / 19, v = (y - 22) / 9, lid = Math.pow(Math.max(0, 1 - u * u), 0.85);
        if (Math.abs(v) > lid) continue;
        const dx = x - 22, dy = (y - 22) * 1.3, r = Math.sqrt(dx * dx + dy * dy);
        if (Math.abs(Math.abs(v) - lid) < 0.2 / Math.max(0.35, lid)) { st.px(x, y, K); continue; }
        if (r < 3) { st.px(x, y, K); continue; }
        const s = r / 2.4 + Math.atan2(dy, dx) / Math.PI - t * 0.03;
        st.px(x, y, (s - Math.floor(s)) < 0.5 ? K : W);
      }
      const sy = 8 + (t % 56) / 2;
      if (sy < 36) for (let x = 2; x < 42; x++) if (x % 2 === 0) st.px(x, sy | 0, GLITCH[0]);
    },
    coin(st, t) {
      const split = (t % 70) > 58 ? 1 + ((t % 3) | 0) : 0;
      const ring = (ox, col) => {
        for (let y = 4; y < 40; y++) for (let x = 4; x < 40; x++) {
          const r = Math.hypot(x - 22, y - 22);
          if (r < 17.5 && (r > 15.5 || (r < 12.5 && r > 11.5))) st.px(x + ox, y, col);
        }
        // the dollar sign, in pixels
        const S = ["0111110", "1101011", "1101000", "0111110", "0001011", "1101011", "0111110"];
        S.forEach((row, j) => [...row].forEach((c, i) => { if (c === "1") st.rect(15 + i * 2 + ox, 15 + j * 2, 2, 2, col); }));
        st.rect(22 + ox, 12, 1, 3, col); st.rect(22 + ox, 29, 1, 3, col);
      };
      if (split) { ring(-split, GLITCH[0]); ring(split, GLITCH[1]); }
      ring(0, K);
      if (split) for (let y = 6; y < 38; y += 5) if (hash(y, t) < 0.4) { const dx = ((hash(y, t, 1) - 0.5) * 6) | 0; for (let x = 4; x < 40; x++) { const c = st.buf[y * N + x]; st.px(x + dx, y, c); } }
    },
    drone(st, t) {
      for (let y = 30; y < 44; y += 3) for (let x = (y >> 1) % 3; x < 44; x += 3) st.px(x, y, K);
      const tx = 22 + Math.round(Math.sin(t * 0.05) * 9), ty = 36;
      st.box(tx - 3, ty - 3, 7, W, GLITCH[1]);
      const hy = 13 + Math.round(Math.sin(t * 0.09));
      for (let i = -9; i <= 9; i++) { st.px(22 + i, hy + i * 0.5, K); st.px(22 + i, hy - i * 0.5, K); }
      st.rect(19, hy - 2, 7, 5, K);
      [[-10, -5], [10, -5], [-10, 5], [10, 5]].forEach(([dx, dy], k) => {
        const cx = 22 + dx, cy = hy + dy, a = t * 0.6 + k;
        for (let s = -4; s <= 4; s++) st.px(cx + Math.round(Math.cos(a) * s), cy + Math.round(Math.sin(a) * s * 0.5), K);
      });
      if ((t >> 3) % 2) st.rect(21, hy + 3, 3, 2, GLITCH[1]);
      for (let y = hy + 4; y < ty - 3; y += 2) st.px(22 + Math.round((tx - 22) * (y - hy) / (ty - hy)), y, GLITCH[1]);
    },
  };
  document.querySelectorAll("canvas.glyph").forEach((cv) => {
    const draw = GLYPHS[cv.dataset.glyph];
    if (!draw) return;
    cv.width = N; cv.height = N;
    const g = cv.getContext("2d"), img = g.createImageData(N, N), buf = new Uint32Array(img.data.buffer);
    const st = {
      buf,
      px: (x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < N && y < N) buf[y * N + x] = c; },
      rect: (x, y, w, h, c) => { for (let j = Math.max(0, y | 0); j < Math.min(N, (y + h) | 0); j++) for (let i = Math.max(0, x | 0); i < Math.min(N, (x + w) | 0); i++) buf[j * N + i] = c; },
    };
    st.box = (x, y, s, fill, line) => { st.rect(x, y, s, s, line); if (s > 2) st.rect(x + 1, y + 1, s - 2, s - 2, fill); };
    let t = (Math.random() * 100) | 0;
    const frame = () => { buf.fill(W); draw(st, t); g.putImageData(img, 0, 0); };
    frame();
    ticker(() => { t++; frame(); }, 70);
  });
})();
