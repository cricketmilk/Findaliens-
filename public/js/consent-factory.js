// Manufacturing Consent: the page's picture, a factory at night in pixels.
// Raw events ride a conveyor in at the left; what comes out at the right is a
// row of identical glowing screens, each stamped on the way out, while the
// stacks smoke and a billboard by the road runs the page's own lines. Drawn
// into a small buffer and scaled up whole, like the other pages' pictures.
//
//   #factory   the hero
//   .lineicon  a small machine beside each production line's heading
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ticker = (fn, ms) => { if (!reduced) setInterval(() => { if (!document.hidden) fn(); }, ms); };
  const onResize = (fn) => { let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(fn, 160); }); };

  const hex = (h) => { const n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); };
  const P = {
    void: hex("#0b0814"), night: hex("#140f24"), dusk: hex("#22183a"), haze: hex("#33244f"), plum: hex("#4a3470"),
    wall: hex("#2a1d42"), wallHi: hex("#3b2a5c"), brick: hex("#231834"), steel: hex("#6c5f8a"), steelHi: hex("#9a8dbb"),
    violet: hex("#a15cf0"), lav: hex("#cdb4ff"), pale: hex("#efe4ff"), gold: hex("#ffd84d"), amber: hex("#d99a2b"), ember: hex("#7a5420"),
    pink: hex("#ff7ac8"), hot: hex("#ffd1ec"), smoke: hex("#5d5277"), smokeHi: hex("#7e7299"), white: hex("#ffffff"), rust: hex("#8a4b3c"), grey: hex("#4b4560"),
  };
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const bayer = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const hash = (a, b, c = 0) => {
    let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul((b | 0) + 0x5bd1e995, 0x165667b1) ^ Math.imul((c | 0) + 0x1b873593, 0x9e3779b1);
    h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
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
    9: "01110100011000101111000010001001100", " ": "00000000000000000000000000000000000", ".": "00000000000000000000000000110001100",
    ",": "00000000000000000000001100010001000", "'": "00100001000100000000000000000000000", "?": "01110100010000100010001000000000100",
    "!": "00100001000010000100001000000000100", "-": "00000000000000011111000000000000000", "&": "01100100101010001000101011001001101",
    "$": "00100011111010001110001011111000100", ">": "10000010000010000010001000100010000", "·": "00000000000000000100000000000000000", "/": "00001000010001000100010001000010000",
  };
  const textW = (s) => s.length * 6 - 1;

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
    st.px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < st.W && y < st.H) st.buf[y * st.W + x] = c; };
    st.rect = (x, y, w, h, c) => { for (let j = Math.max(0, Math.round(y)); j < Math.min(st.H, Math.round(y + h)); j++) for (let i = Math.max(0, Math.round(x)); i < Math.min(st.W, Math.round(x + w)); i++) st.buf[j * st.W + i] = c; };
    st.text = (s, x, y, c, clip) => [...s.toUpperCase()].forEach((ch, n) => { const g = F[ch] || F[" "]; for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r * 5 + q] === "1") { const xx = Math.round(x + n * 6 + q); if (!clip || (xx >= clip[0] && xx < clip[1])) st.px(xx, y + r, c); } });
    st.show = () => st.g.putImageData(st.img, 0, 0);
    return st;
  }

  // ======================= the factory =======================
  (function factory() {
    const cv = document.getElementById("factory");
    if (!cv) return;
    const LINES = (window.FACTORY_LINES && window.FACTORY_LINES.length ? window.FACTORY_LINES : ["DOUBT IS OUR PRODUCT"]).map((s) => s.toUpperCase());
    const st = pixels(cv, (w) => (w < 560 ? 3 : 4), (W, cssW) => Math.round(cssW < 560 ? W * 0.9 : Math.min(W * 0.4, 132)));
    let L = {}, base, t = 0, items = [], puffs = [], line = 0, scroll = 0, press = 0;

    function layout() {
      st.size();
      const { W, H } = st, narrow = W < 160;
      L = { beltY: Math.round(H * 0.8), x0: Math.round(W * (narrow ? 0.14 : 0.24)), x1: Math.round(W * (narrow ? 0.66 : 0.64)), roof: Math.round(H * 0.42) };
      L.door = Math.round(H * 0.12);
      L.pressX = L.x1 + Math.round(W * 0.05);
      L.bb = narrow ? { x: Math.round(W * 0.06), y: Math.round(H * 0.05), w: Math.round(W * 0.88), h: 13 } : { x: Math.round(W * 0.72), y: Math.round(H * 0.16), w: Math.round(W * 0.25), h: 16 };
      base = new Uint32Array(W * H);
      const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < H) base[y * W + x] = c; };
      // the sky: dithered night, a moon, stars
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const k = y / L.beltY;
        base[y * W + x] = k > 0.62 + bayer(x, y) * 0.35 ? P.haze : k > 0.3 + bayer(x, y) * 0.35 ? P.dusk : P.night;
      }
      for (let i = 0; i < W * H / 70; i++) { const x = (hash(i, 3) * W) | 0, y = (hash(i, 4) * L.roof * 0.9) | 0; put(x, y, i % 5 ? P.plum : P.lav); }
      const mx = Math.round(W * (narrow ? 0.84 : 0.12)), my = Math.round(H * (narrow ? 0.34 : 0.18)), mr = narrow ? 5 : 6;
      for (let y = -mr; y <= mr; y++) for (let x = -mr; x <= mr; x++) { const d = x * x + y * y; if (d <= mr * mr) put(mx + x, my + y, (x + 2) * (x + 2) + y * y <= mr * mr * 0.8 ? P.pale : P.lav); }
      // the city behind: towers in two depths
      for (let x = 0; x < W; x++) {
        const far = Math.round(L.beltY - 16 - hash(x >> 3, 7) * 22), near = Math.round(L.beltY - 8 - hash(x >> 2, 8) * 12);
        for (let y = far; y < L.beltY; y++) put(x, y, P.dusk);
        if ((x >> 2) % 3 !== 1) for (let y = near; y < L.beltY; y++) put(x, y, P.wall);
        if (hash(x, 9) < 0.12) put(x, far + 3 + ((hash(x, 10) * 8) | 0), P.ember);
      }
      // the factory: a brick hall with a sawtooth roof
      const { x0, x1, roof, beltY } = L;
      for (let y = roof; y < beltY; y++) for (let x = x0; x < x1; x++) put(x, y, ((y - roof) % 4 === 0) || (((x + ((y - roof) >> 2) * 3) % 7) === 0) ? P.brick : P.wall);
      const tooth = Math.max(8, Math.round((x1 - x0) / 7));
      for (let x = x0; x < x1; x++) {
        const k = (x - x0) % tooth, h = Math.round((k / tooth) * tooth * 0.55);
        for (let y = roof - h; y < roof; y++) put(x, y, k > tooth - 3 ? P.lav : P.wallHi);
        if (k === tooth - 1) for (let y = roof - h; y < roof; y++) put(x, y, P.gold);
      }
      for (let x = x0; x < x1; x++) put(x, roof, P.steel);
      // stacks
      L.stacks = [];
      const ns = narrow ? 2 : 3;
      for (let i = 0; i < ns; i++) {
        const sx = Math.round(x0 + (x1 - x0) * (0.18 + i * 0.3)), top = Math.round(H * (narrow ? 0.24 : 0.2) + i * 3), w = narrow ? 3 : 4;
        for (let y = top; y < roof; y++) for (let x = sx; x < sx + w; x++) put(x, y, x === sx ? P.steelHi : (y - top) % 9 === 0 ? P.steel : P.grey);
        for (let x = sx - 1; x < sx + w + 1; x++) put(x, top, P.steelHi);
        L.stacks.push({ x: sx + (w >> 1), y: top - 1 });
      }
      // the sign over the door
      const sign = narrow ? "CONSENT CO" : "CONSENT CO.";
      L.sign = { x: Math.round((x0 + x1) / 2 - textW(sign) / 2), y: roof + 4, text: sign };
      for (let y = L.sign.y - 2; y < L.sign.y + 9; y++) for (let x = L.sign.x - 3; x < L.sign.x + textW(sign) + 3; x++) put(x, y, P.void);
      // doors: in at the left, out at the right
      for (let y = beltY - L.door; y < beltY; y++) { for (let x = x0; x < x0 + 6; x++) put(x, y, P.void); for (let x = x1 - 6; x < x1; x++) put(x, y, P.void); }
      // the belt, its frame and rollers, and the yard under it
      for (let y = beltY + 4; y < H; y++) for (let x = 0; x < W; x++) put(x, y, bayer(x, y) < (y - beltY) / (H - beltY) * 0.7 ? P.void : P.night);
      for (let x = 0; x < W; x++) { put(x, beltY, P.steel); put(x, beltY + 3, P.grey); }
      for (let x = 2; x < W; x += 9) for (let y = beltY + 4; y < beltY + 9; y++) put(x, y, P.grey);
      // the billboard's legs
      const bb = L.bb;
      if (!narrow) for (const lx of [bb.x + 5, bb.x + bb.w - 6]) for (let y = bb.y + bb.h; y < beltY; y++) put(lx, y, P.grey);
      // the press frame beside the exit door
      if (!narrow) { for (let y = beltY - 22; y < beltY; y++) { put(L.pressX - 6, y, P.steel); put(L.pressX + 6, y, P.steel); } for (let x = L.pressX - 6; x <= L.pressX + 6; x++) put(x, beltY - 22, P.steelHi); }
      // run the belt long enough that the hall has already filled the right side
      items = []; puffs = [];
      for (let i = 0; i < Math.round(W * 2.6); i++) step(true);
    }

    // what rides the belt: lumps of the world going in, the same screen coming out
    const RAW = ["paper", "lump", "crate", "lump", "paper"];
    function drawItem(it) {
      const { beltY } = L, x = Math.round(it.x), y = beltY - 5;
      if (it.x > L.x0 - 2 && it.x < L.x1 + 2 && it.x < L.x1 - 1) return; // inside the hall
      if (!it.done) {
        if (it.kind === "paper") { st.rect(x, y, 6, 5, P.pale); st.rect(x + 1, y + 1, 4, 1, P.grey); st.rect(x + 1, y + 3, 3, 1, P.grey); }
        else if (it.kind === "crate") { st.rect(x, y, 6, 5, P.rust); st.rect(x, y, 6, 1, P.amber); st.rect(x + 2, y + 1, 1, 4, P.ember); }
        else { st.rect(x, y + 1, 6, 4, P.grey); st.rect(x + 1, y, 3, 1, P.steel); st.px(x + 5, y + 1, P.steel); }
      } else {
        // a little screen, the same face on every one
        st.rect(x, y - 1, 7, 6, P.violet);
        st.rect(x + 1, y, 5, 4, it.flash ? P.white : P.hot);
        st.px(x + 2, y + 1, P.violet); st.px(x + 4, y + 1, P.violet);
        st.px(x + 2, y + 3, P.violet); st.px(x + 3, y + 3, P.violet); st.px(x + 4, y + 3, P.violet);
        st.rect(x + 2, y + 5, 3, 1, P.steel);
      }
    }
    function step(warm) {
      t++;
      // the belt moves a pixel every other tick
      const speed = 0.5;
      if (t % 22 === 0) items.push({ x: -6, kind: RAW[(t / 22) % RAW.length | 0], done: false });
      for (const it of items) {
        it.x += speed;
        if (!it.done && it.x >= L.x1 - 3) { it.done = true; }
        if (it.done && Math.abs(it.x - L.pressX + 3) < 0.5) { press = 6; it.flash = 3; }
        if (it.flash) it.flash--;
      }
      items = items.filter((it) => it.x < st.W + 8);
      if (press) press--;
      if (t % 4 === 0) for (const s of L.stacks) puffs.push({ x: s.x + (hash(t, s.x) - 0.5) * 2, y: s.y, r: 1.5, life: 0 });
      for (const p of puffs) { p.life++; p.y -= 0.32; p.x += 0.28 + Math.sin((p.life + p.x) * 0.15) * 0.15; p.r = Math.min(5.5, p.r + 0.06); }
      puffs = puffs.filter((p) => p.life < 70 && p.y > -6);
      if (!warm) { scroll += 0.6; const tw = textW(LINES[line]) + 30; if (scroll > tw + L.bb.w) { scroll = 0; line = (line + 1) % LINES.length; } }
    }
    function draw() {
      const { W, buf } = st;
      buf.set(base);
      // lit windows, a few going on and off
      const { x0, x1, roof, beltY } = L;
      for (let wy = roof + 14; wy < beltY - L.door - 3; wy += 7) for (let wx = x0 + 9; wx < x1 - 9; wx += 7) {
        const k = hash(wx, wy, (t >> 5) + ((wx * 7) % 5));
        const lit = k > 0.28;
        st.rect(wx, wy, 4, 3, lit ? (k > 0.85 ? P.gold : P.amber) : P.ember);
      }
      // smoke
      for (const p of puffs) {
        const r = p.r, fade = p.life > 45;
        for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
          if (x * x + y * y > r * r) continue;
          if (fade && bayer(Math.round(p.x + x), Math.round(p.y + y)) < (p.life - 45) / 25) continue;
          st.px(p.x + x, p.y + y, x + y < -r * 0.6 ? P.smokeHi : P.smoke);
        }
      }
      // the sign, its letters flickering now and then
      st.text(L.sign.text, L.sign.x, L.sign.y, (t >> 3) % 23 === 0 ? P.violet : P.pink);
      // the belt's surface running
      for (let x = 0; x < W; x++) st.px(x, beltY + 1, ((x - (t >> 1)) & 3) === 0 ? P.steelHi : P.grey);
      for (const it of items) drawItem(it);
      // the press: a head that comes down on each screen
      if (W >= 160) {
        const drop = press > 3 ? 6 - press : press;
        st.rect(L.pressX - 4, beltY - 21, 9, 6 + drop * 2, P.steel);
        st.rect(L.pressX - 4, beltY - 21, 9, 1, P.steelHi);
        st.rect(L.pressX - 3, beltY - 16 + drop * 2, 7, 2, press ? P.gold : P.amber);
      }
      // what goes in, and what comes out
      const ly = beltY + 9;
      if (ly + 7 < st.H) {
        const inL = W < 160 ? "EVENTS >" : "RAW EVENTS >", outL = W < 160 ? "CONSENT >" : "CONSENT, ON EVERY SCREEN >";
        st.text(inL, 3, ly, P.steel);
        st.text(outL, W - textW(outL) - 3, ly, P.pink);
      }
      // the billboard: the page's own lines, crawling
      const bb = L.bb;
      st.rect(bb.x, bb.y, bb.w, bb.h, P.void);
      st.rect(bb.x, bb.y, bb.w, 1, P.violet); st.rect(bb.x, bb.y + bb.h - 1, bb.w, 1, P.violet);
      st.rect(bb.x, bb.y, 1, bb.h, P.violet); st.rect(bb.x + bb.w - 1, bb.y, 1, bb.h, P.violet);
      const ty = bb.y + Math.round((bb.h - 7) / 2);
      st.text(LINES[line], bb.x + bb.w - scroll, ty, P.gold, [bb.x + 2, bb.x + bb.w - 2]);
      for (let x = bb.x + 2; x < bb.x + bb.w - 2; x += 4) st.px(x, bb.y - 1, (x + t) % 8 < 4 ? P.gold : P.ember);
      st.show();
    }
    layout();
    for (let i = 0; i < 60; i++) step();
    draw();
    ticker(() => { step(); draw(); }, 50);
    onResize(() => { layout(); draw(); });
  })();
})();
