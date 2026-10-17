// Venture sprites: six small pixel scenes for Carbon Class, drawn on a
// 116x72 canvas and shown at exactly 2x, so every pixel is a crisp square.
// Fades are Bayer-dithered like the globe, not alpha-blended. Each scene is a
// function of time with its own particles, so nothing loops visibly.
window.VentureSprites = (function () {
  "use strict";
  const W = 116, H = 72;
  const PAL = {
    k: [13, 11, 16], b: [24, 21, 29], n: [36, 31, 46], N: [52, 45, 66],
    p: [142, 157, 226], P: [91, 101, 150], l: [204, 159, 224], L: [130, 98, 148],
    h: [255, 143, 184], H: [150, 76, 108], e: [255, 196, 143], E: [178, 120, 82],
    y: [255, 232, 170], w: [221, 215, 232], d: [138, 130, 153], D: [70, 64, 82],
  };
  const B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const rnd = (() => { let s = 1234567; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; })();

  function surface(ctx) {
    const img = ctx.createImageData(W, H), d = img.data;
    const g = {
      img,
      px(x, y, c) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 4, col = PAL[c]; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; },
      // level 0..1: drawn on the Bayer pixels it beats, so 0.5 is a checker
      dot(x, y, level, c) { x |= 0; y |= 0; if (level > (B4[y & 3][x & 3] + 0.5) / 16) g.px(x, y, c); },
      rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) g.px(x + i, y + j, c); },
      sky(top, bottom, y0, y1, bias = 0) { for (let y = y0; y < y1; y++) { const f = (y - y0) / Math.max(1, y1 - y0 - 1) + bias; for (let x = 0; x < W; x++) g.px(x, y, f > (B4[y & 3][x & 3] + 0.5) / 16 ? bottom : top); } },
      disc(cx, cy, r, c, level = 1) { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + r * 0.6) g.dot(cx + x, cy + y, level, c); },
      sprite(rows, x, y) { rows.forEach((row, j) => { for (let i = 0; i < row.length; i++) { const c = row[i]; if (c !== ".") g.px(x + i, y + j, c); } }); },
      line(x0, y0, x1, y1, c) { x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { g.px(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } },
      clear(c) { g.rect(0, 0, W, H, c); },
    };
    return g;
  }
  // a particle: drawn dithered by how much life it has left, colour by age
  function particles() {
    const list = [];
    return {
      add(p) { if (list.length < 420) list.push(p); },
      step(g) {
        for (let i = list.length - 1; i >= 0; i--) {
          const p = list[i];
          p.x += p.vx; p.y += p.vy; p.vx *= p.drag || 1; p.vy = p.vy * (p.drag || 1) + (p.g || 0); p.life -= p.decay;
          if (p.life <= 0 || p.x < -6 || p.x > W + 6 || p.y < -6 || p.y > H + 6) { list.splice(i, 1); continue; }
          const c = p.cols[Math.min(p.cols.length - 1, Math.floor((1 - p.life) * p.cols.length))];
          const r = p.r ? Math.max(0, Math.round(p.r * (p.grow ? 1 + (1 - p.life) * p.grow : 1))) : 0;
          if (r) g.disc(p.x, p.y, r, c, p.life * (p.dense || 0.9)); else g.dot(p.x, p.y, Math.max(0.2, p.life), c);
        }
      },
    };
  }
  function stars(g, t, n, seed, y1) { for (let i = 0; i < n; i++) { const x = (i * 37 + seed * 11) % W, y = (i * 53 + seed * 7) % y1; if (((i * 7 + t) >> 3) % 5) g.px(x, y, (i & 3) ? "D" : "d"); } }

  // ---------------------------------------------------------------- scenes --
  const JET = [
    "ll......................",
    "lll.....................",
    "llNwwwwwwwwwwwwwwwwww...",
    "wwwwwlwlwlwlwlwlwwwwwwp.",
    "wwwwwwwwwwwwwwwwwwwwwwwp",
    ".DDNwwwwwwwwwwwwwwwwwp..",
    ".........llllll.........",
    "..........llll..........",
  ];
  const YACHT = [
    "...............l................",
    "..............lll...............",
    "............wwwwwww.............",
    "..........wwlNlNlNlww...........",
    "........wwwwwwwwwwwwwwwww.......",
    ".....wwwlNlNlNlNlNlNlNwwwwwww...",
    "..hhhhhhhhhhhhhhhhhhhhhhhhhhhhhh",
    "...wwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    ".....wwwwwwwwwwwwwwwwwwwwwwwwww.",
    "........PPPPPPPPPPPPPPPPPPPPP...",
  ];
  const ROCKET = [
    "...w...", "..www..", "..www..", ".wwwww.", ".wlllw.", ".wwwww.", ".wwwww.",
    ".hhhhh.", ".wwwww.", ".wwwww.", ".wwwww.", "lwwwwwl", "lwwwwwl", "ll.D.ll",
  ];
  const B_GLYPH = ["llll.", "l...l", "l...l", "llll.", "l...l", "l...l", "llll."];

  const SCENES = {
    ai(g, t, s) {
      g.sky("k", "n", 0, 52, -0.25);
      stars(g, t, 22, 1, 30);
      // gas turbines feeding the hall: two stacks, smoke drifting downwind
      for (const sx of [86, 97]) {
        g.rect(sx, 20, 6, 32, "N"); g.rect(sx, 20, 6, 2, "H"); g.rect(sx + 1, 26, 4, 1, "D");
        if (t % 2 === 0) s.smoke.add({ x: sx + 3 + rnd() * 2 - 1, y: 19, vx: 0.18 + rnd() * 0.15, vy: -0.32 - rnd() * 0.18, life: 1, decay: 0.012, cols: ["d", "D", "D"], r: 1, grow: 2.5, dense: 0.6 });
      }
      s.smoke.step(g);
      // heat shimmer off the roof
      if (t % 2) s.heat.add({ x: 12 + rnd() * 62, y: 33, vx: (rnd() - 0.5) * 0.15, vy: -0.25 - rnd() * 0.2, life: 1, decay: 0.03, cols: ["h", "H", "D"] });
      s.heat.step(g);
      // the hall: front, roof units, rows of server lights
      g.rect(8, 34, 70, 18, "N"); g.rect(8, 34, 70, 1, "P"); g.rect(8, 51, 70, 1, "D");
      for (let i = 0; i < 4; i++) { g.rect(14 + i * 16, 30, 8, 4, "D"); const fan = (t >> 1) % 2; g.px(16 + i * 16 + fan, 31, "d"); g.px(19 + i * 16 - fan, 32, "d"); }
      for (let r = 0; r < 4; r++) for (let c = 0; c < 21; c++) {
        const x = 11 + c * 3, y = 37 + r * 4, v = Math.sin(c * 12.9 + r * 78.2 + Math.floor(t / 3) * 3.7) * 43758.5;
        const f = v - Math.floor(v);
        g.px(x, y, f > 0.82 ? "h" : f > 0.45 ? "p" : "P");
      }
      // ground and the line in
      g.sky("k", "b", 52, H, 0); g.line(0, 40, 8, 44, "P"); g.rect(0, 52, W, 1, "D");
    },
    jets(g, t, s) {
      g.sky("n", "L", 0, 50, -0.3);
      g.sky("L", "H", 40, 50, -0.1);
      // the land far below: a dusk ridge, then the lights of a town
      for (let x = 0; x < W; x++) {
        const ridge = 47 + Math.round(Math.sin(x / 11) * 2 + Math.sin(x / 4.3 + 1) * 1);
        for (let y = ridge; y < H; y++) g.px(x, y, y < ridge + 3 ? "N" : "k");
        if (x % 3 === 0) { const ly = 55 + ((x * 7) % 13); if (((x * 13 + ly + (t >> 2)) % 11) > 2) g.px(x, ly, (x * 5) % 4 ? "e" : "h"); }
      }
      // clouds at three depths
      for (const [k, speed, y, r, c] of [[0, 0.35, 12, 5, "D"], [1, 0.6, 40, 6, "L"], [2, 0.9, 30, 4, "P"]]) {
        const x = ((W + 30) - ((t * speed + k * 47) % (W + 60))) - 10;
        g.disc(x, y, r, c, 0.55); g.disc(x + r, y + 1, r - 1, c, 0.55); g.disc(x - r, y + 1, r - 2, c, 0.5);
      }
      const bob = Math.round(Math.sin(t / 7) * 1.5);
      // two contrails stream back from the engines, widening and thinning
      // with distance, and wavering where the air has moved them
      const jx = 44, jy = 26 + bob;
      for (let x = jx; x >= 0; x--) {
        const age = jx - x, spread = 0.4 + age / 16, level = Math.max(0, 1 - age / 70);
        for (const base of [jy + 4, jy + 6]) {
          const cyy = base + Math.sin((x + t * 1.3) / 9) * Math.min(1.5, age / 30);
          for (let y = Math.floor(cyy - spread); y <= Math.ceil(cyy + spread); y++) {
            const edge = 1 - Math.abs(y - cyy) / (spread + 0.6);
            if (edge > 0) g.dot(x, y, level * edge, age < 18 ? "w" : "d");
          }
        }
      }
      g.sprite(JET, jx, jy);
    },
    yachts(g, t, s) {
      g.sky("n", "H", 0, 40, -0.15);
      // a low sun, half under the sea line
      g.disc(84, 40, 10, "e", 0.9); g.disc(84, 40, 7, "y", 1);
      g.sky("P", "k", 40, H, -0.1);
      const wave = (x) => Math.sin(x / 7 + t / 5) * 1.6 + Math.sin(x / 3.1 - t / 3) * 0.6;
      for (let x = 0; x < W; x++) {
        const y = 41 + Math.round(wave(x));
        g.px(x, y, "p"); if ((x + t) % 9 < 2) g.px(x, y - 1, "w");
        for (let yy = y + 1; yy < H; yy++) if ((x * 3 + yy * 5 + (t >> 1)) % 23 === 0) g.px(x, yy, "P");
      }
      // sun's reflection
      for (let yy = 43; yy < 60; yy += 2) { const w = 7 - ((yy - 43) >> 2); for (let x = -w; x <= w; x++) if (((x + yy + (t >> 1)) & 3) === 0) g.px(84 + x, yy, "e"); }
      const bx = 30, by = 31 + Math.round(wave(bx + 16));
      if (t % 2 === 0) s.wake.add({ x: bx + 2, y: by + 9, vx: -0.6 - rnd() * 0.3, vy: (rnd() - 0.3) * 0.15, life: 1, decay: 0.035, cols: ["w", "p", "P"] });
      s.wake.step(g);
      g.sprite(YACHT, bx, by);
    },
    space(g, t, s) {
      // the stratosphere band holds what earlier launches left in it
      g.sky("k", "n", 0, 50, -0.3);
      stars(g, t, 26, 3, 36);
      for (const p of s.soot) g.dot(p.x, p.y, p.a, "D");
      for (let x = (t >> 2) % 4; x < W; x += 4) g.px(x, 13, "N");   // where the stratosphere starts
      const cyc = 150, ph = t % cyc;
      const y = 50 - Math.pow(ph / cyc, 1.8) * 90;
      const x = 52;
      if (y > -16) {
        // flame and exhaust: hot at the nozzle, smoke by the time it slows
        for (let k = 0; k < 4; k++) s.ex.add({ x: x + 3 + (rnd() - 0.5) * 2, y: y + 14, vx: (rnd() - 0.5) * 0.5, vy: 0.9 + rnd() * 0.6, life: 1, decay: 0.06 + rnd() * 0.03, cols: ["y", "e", "h", "d"], r: 0 });
        if (y > 30) for (let k = 0; k < 3; k++) s.ex.add({ x: x + 3 + (rnd() - 0.5) * 6, y: 52, vx: (rnd() - 0.5) * 1.6, vy: -0.15 - rnd() * 0.2, life: 1, decay: 0.012, cols: ["w", "d", "D"], r: 1, grow: 2, drag: 0.97, dense: 0.7 });
        if (y > 6 && y < 22 && s.soot.length < 380) for (let k = 0; k < 3; k++) s.soot.push({ x: x + 3 + (rnd() - 0.5) * 4, y: y + 10 + rnd() * 4, a: 0.9 });
      }
      // soot spreads along the band and lingers
      for (const p of s.soot) { p.x += (rnd() - 0.5) * 0.6 + 0.05; p.y += (rnd() - 0.5) * 0.15; if (p.x > W) p.x -= W; p.a = Math.max(0.25, p.a - 0.0006); }
      s.ex.step(g);
      g.sky("k", "D", 52, H, 0); g.rect(44, 52, 20, 2, "P"); g.rect(47, 40, 1, 12, "D");
      if (y > -16) g.sprite(ROCKET, x, Math.round(y));
    },
    crypto(g, t, s) {
      g.clear("k");
      for (let y = 3; y < H; y += 6) for (let x = 3; x < W; x += 6) g.px(x, y, "n");
      // the chain: a block is mined every so often and joins the row, which
      // slides left as it grows
      const every = 40, mined = Math.floor(t / every), slide = (t % every) / every;
      for (let i = 0; i < 9; i++) {
        const bx = W - 12 - (i + slide) * 14, n = mined - i;
        if (bx < -12) continue;
        g.rect(Math.round(bx), 60, 9, 7, i === 0 && slide < 0.15 ? "h" : "N");
        g.rect(Math.round(bx) + 2, 62, 5, 1, "P"); g.rect(Math.round(bx) + 2, 64, 3 + (n & 1), 1, "P");
        if (i < 8) g.line(Math.round(bx) - 5, 63, Math.round(bx) - 1, 63, "D");
      }
      // circuit traces with current running along them
      const traces = [[0, 14, 30, 14, 30, 30], [116, 18, 86, 18, 86, 34], [0, 58, 24, 58, 24, 46], [116, 56, 92, 56, 92, 46]];
      for (const tr of traces) { g.line(tr[0], tr[1], tr[2], tr[3], "D"); g.line(tr[2], tr[3], tr[4], tr[5], "D"); }
      for (const [i, tr] of traces.entries()) {
        const len = Math.abs(tr[2] - tr[0]) + Math.abs(tr[5] - tr[3]), k = (t * 1.5 + i * 17) % len;
        const seg = Math.abs(tr[2] - tr[0]);
        const px = k < seg ? tr[0] + Math.sign(tr[2] - tr[0]) * k : tr[2], py = k < seg ? tr[1] : tr[3] + Math.sign(tr[5] - tr[3]) * (k - seg);
        g.px(px, py, "h"); g.px(px - Math.sign(tr[2] - tr[0] || 1), py, "H");
      }
      // mining rigs, lights blinking
      for (const rx of [6, 92]) { g.rect(rx, 30, 18, 12, "N"); for (let i = 0; i < 4; i++) g.px(rx + 3 + i * 4, 33 + ((t + i * 3 + rx) >> 2) % 2 * 4, (t + i) % 5 ? "p" : "h"); }
      // the coin: its width is the cosine of its turn, shaded by dithering
      const th = t / 16, cw = Math.cos(th), R = 19, cx = 58, cy = 30;
      // a glow behind it, strongest when a block has just been found
      const fresh = 1 - Math.min(1, (t % 40) / 14);
      g.disc(cx, cy, R + 5, "H", 0.18 + fresh * 0.35);
      const rw = Math.max(1.5, Math.abs(cw) * R);
      for (let y = -R; y <= R; y++) for (let x = -Math.ceil(rw); x <= Math.ceil(rw); x++) {
        const nx = x / rw, ny = y / R; if (nx * nx + ny * ny > 1) continue;
        const shade = 0.45 + 0.55 * (-nx * 0.6 * Math.sign(cw || 1) - ny * 0.4);
        const rim = nx * nx + ny * ny > 0.78;
        g.px(cx + x, cy + y, rim ? "E" : shade > (B4[(cy + y) & 3][(cx + x) & 3] + 0.5) / 16 ? "y" : "e");
      }
      if (Math.abs(cw) > 0.55) B_GLYPH.forEach((row, j) => { for (let i = 0; i < 5; i++) if (row[i] === "l") g.px(cx + Math.round((cw > 0 ? i - 2 : 2 - i) * Math.abs(cw)), cy - 3 + j, "E"); });
      // sparks, and a burst when a block is found
      const burst = t % 40 === 0 ? 24 : (t % 4 === 0 ? 1 : 0);
      for (let k = 0; k < burst; k++) { const a = rnd() * 6.28, v = 0.6 + rnd() * (burst > 1 ? 1.2 : 0.3); s.sp.add({ x: cx + Math.cos(a) * (R + 2), y: cy + Math.sin(a) * (R + 2), vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, decay: 0.05, cols: ["y", "e", "h"] }); }
      s.sp.step(g);
    },
    portfolios(g, t, s) {
      g.sky("n", "N", 0, 56, -0.4);
      // smoke from the stacks, thickening as the line climbs
      const cyc = 160, ph = (t % cyc) / cyc;
      for (const sx of [14, 30, 64]) if (rnd() < 0.35 + ph * 0.6) s.sm.add({ x: sx + 2, y: 24, vx: 0.25 + rnd() * 0.2, vy: -0.28 - rnd() * 0.15, life: 1, decay: 0.011, cols: ["d", "D", "D"], r: 1, grow: 2.6, dense: 0.7 });
      s.sm.step(g);
      // skyline: towers and the stacks
      for (const [x, w, h] of [[2, 10, 22], [40, 12, 30], [54, 8, 18], [76, 14, 26], [92, 10, 34], [104, 10, 20]]) {
        g.rect(x, 56 - h, w, h, "N");
        for (let yy = 56 - h + 3; yy < 54; yy += 4) for (let xx = x + 2; xx < x + w - 1; xx += 3) if (((xx * 7 + yy * 3 + (t >> 4)) % 5) > 1) g.px(xx, yy, "P");
      }
      for (const sx of [14, 30, 64]) { g.rect(sx, 24, 4, 32, "D"); g.rect(sx, 24, 4, 1, "H"); }
      g.sky("k", "b", 56, H, 0);
      // the line: drawn across as the cycle runs, area dithered beneath
      const pts = []; for (let i = 0; i <= 20; i++) pts.push([4 + i * 5.4, 46 - i * 1.5 - Math.sin(i * 1.7) * 3 - (i > 14 ? (i - 14) * 1.6 : 0)]);
      const n = Math.max(2, Math.floor(ph * 1.25 * pts.length));
      for (let i = 0; i < Math.min(n, pts.length) - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
        for (let x = Math.round(x0); x <= Math.round(x1); x++) { const yy = Math.round(y0 + (y1 - y0) * (x - x0) / (x1 - x0 || 1)); for (let y2 = yy + 1; y2 < 56; y2++) g.dot(x, y2, 0.22, "H"); }
        g.line(x0, y0, x1, y1, "h"); g.line(x0, y0 + 1, x1, y1 + 1, "h");
      }
      const last = pts[Math.min(n, pts.length) - 1];
      g.px(last[0], last[1] - 2, "y"); g.px(last[0] - 1, last[1] - 1, "y"); g.px(last[0] + 1, last[1] - 1, "y");
    },
  };

  function mount(canvas, id) {
    const scene = SCENES[id];
    if (!scene) return null;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const state = { smoke: particles(), heat: particles(), trail: particles(), wake: particles(), ex: particles(), sp: particles(), sm: particles(), soot: [] };
    let t = 0;
    const draw = () => { const g = surface(ctx); scene(g, t, state); ctx.putImageData(g.img, 0, 0); };
    // warm the particles up so the first frame is not empty
    for (let i = 0; i < 60; i++) { t++; const g = surface(ctx); scene(g, t, state); }
    draw();
    return { tick() { t++; draw(); } };
  }
  return { mount, W, H };
})();
