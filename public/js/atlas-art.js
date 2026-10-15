// Atlas: the page's picture, after THE CLEARING's ink (deep-state.js).
// A clearing in a pixel CORNfield — the Gazette's own field — with the eye
// in the pyramid weeping ink over the planted rows, coins of glitch colour
// glinting in the corn, and a road of corrupted money running in. Drawn
// into a small pixel buffer and scaled up whole, so every pixel is a block.
//
//   #atlas-hero   the masthead print
//
// The dither, noise, pixel-buffer and eye/road machinery are the house
// style deep-state.js established; the scene is the corn sibling. The core
// is DOM-free and exported under Node (module.exports), so the og:image
// PNG is rendered from this exact code — no binary art asset in the repo.
(function () {
  "use strict";

  // ---------- ink, paper and the colours that leak through ----------
  var hex = function (h) { var n = parseInt(h.slice(1), 16); return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16); };
  var K = hex("#050505"), W = hex("#ffffff"), G = hex("#d9d9d9");
  var GLITCH = ["#00f0ff", "#ff2fd0", "#2b3bff", "#7a3cff", "#ff8ad8", "#3dff9a", "#ff3355", "#ffffff", "#9af7ff"].map(hex);
  var BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(function (v) { return (v + 0.5) / 64; });
  var bayer = function (x, y) { return BAYER[(y & 7) * 8 + (x & 7)]; };
  var hash = function (a, b, c) { c = c || 0; var h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function noise(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var s = function (t) { return t * t * (3 - 2 * t); };
    var a = hash(xi, yi, 7), b = hash(xi + 1, yi, 7), c = hash(xi, yi + 1, 7), d = hash(xi + 1, yi + 1, 7);
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
  }
  var fbm = function (x, y) { return noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15; };

  // ======================= the cornfield clearing =======================
  // DOM-free core: size(W,H) builds the base scene; step()/draw() animate.
  // aim/look/tear are frame state the caller sets (pointer or og render).
  function cornField() {
    var st = { W: 0, H: 0, buf: null, t: 0, aim: null, lastAim: -1e9, look: { x: 0, y: 0 }, tear: null };
    var base = null, L = null, drips = [], blocks = [], drops = [], coins = [];

    st.size = function (W, H) {
      st.W = Math.max(60, Math.floor(W)); st.H = Math.max(40, Math.floor(H));
      st.buf = new Uint32Array(st.W * st.H);
      layout(); st.draw();
      return st;
    };

    function layout() {
      var Wd = st.W, H = st.H, cx = Wd / 2, tall = H > Wd;
      L = {
        cx: cx, cy: H * (tall ? 0.36 : 0.4), rx: Wd * (tall ? 0.36 : 0.25), ry: H * (tall ? 0.36 : 0.52),
        apex: H * (tall ? 0.07 : 0.06), baseY: H * (tall ? 0.42 : 0.5), half: Wd * (tall ? 0.28 : 0.15),
        groundY: H * (tall ? 0.78 : 0.76), bushY: H * (tall ? 0.66 : 0.64)
      };
      L.eyeY = L.apex + (L.baseY - L.apex) * 0.64; L.eyeW = L.half * 0.6; L.eyeH = L.eyeW * 0.44;
      base = new Uint32Array(Wd * H);
      // the corn: planted rows, dense stipple at the edges thinning to the
      // clearing. Vertical streaking (the stalk/gap rhythm of a field) via
      // a slow sine along x; clumps where the noise says the stand thickens
      for (var y = 0; y < H; y++) for (var x = 0; x < Wd; x++) {
        var ex = (x - cx) / L.rx, ey = (y - L.cy) / L.ry;
        var e = Math.sqrt(ex * ex + ey * ey);
        var leaf = fbm(x * 0.09, y * 0.09), twig = fbm(x * 0.31 + 40, y * 0.31);
        var row = Math.abs(Math.sin(x * 0.55 + fbm(x * 0.03, y * 0.05) * 3));
        var d = Math.min(0.9, Math.max(0, (e - 0.86) * 1.7)) * (0.35 + leaf * 1.05);
        if (leaf < 0.38) d *= 0.45; // light coming through the rows
        d *= 0.6 + 0.4 * Math.pow(row, 0.7); // the stalk/gap banding
        d += (twig - 0.5) * 0.18;
        if (y > L.bushY) d = Math.max(d, (0.2 + leaf * 0.7) * Math.min(1, (y - L.bushY) / ((L.groundY - L.bushY) * 0.6)));
        d = Math.max(0, Math.min(0.97, d));
        base[y * Wd + x] = d > bayer(x, y) * 0.92 + hash(x, y) * 0.08 ? K : W;
      }
      // stalks, black, leaning out of the stand on both sides
      for (var side = -1; side <= 1; side += 2) for (var k = 0; k < 4; k++) {
        var x0 = cx + side * (L.rx * (1.0 + k * 0.28)), w = Math.max(1, Math.round(Wd * (0.006 + 0.003 * (3 - k))));
        var y0 = Math.round(H * (0.04 + k * 0.05));
        for (var y2 = y0; y2 < L.groundY; y2++) {
          var lean = side * (Math.sin(y2 / H * 2.2 + k * 1.7) * Wd * 0.012 + (L.groundY - y2) / H * Wd * 0.03);
          var ww = w + Math.round((y2 - y0) / (L.groundY - y0) * 1.5);
          for (var i = 0; i < ww; i++) { var xs = Math.round(x0 + lean + i); if (xs >= 0 && xs < Wd) base[y2 * Wd + xs] = K; }
          // a tassel now and then, a few pixels against the sky
          if (hash(k * 31 + (side > 0 ? 7 : 0), y2, 5) < 0.03 && y2 < L.bushY) {
            for (var b2 = 0; b2 < 4; b2++) { var xt = Math.round(x0 + lean + (hash(y2, b2) - 0.5) * 4), yt = y2 - (b2 >> 1) - 1; if (xt >= 0 && xt < Wd && yt >= 0) base[yt * Wd + xt] = K; }
          }
        }
      }
      // where the corn meets the clearing it breaks into square outlines
      var cell = Wd < 200 ? 4 : 5;
      for (var gy = 0; gy < L.groundY; gy += cell) for (var gx = 0; gx < Wd; gx += cell) {
        var exq = (gx - cx) / L.rx, eyq = (gy - L.cy) / L.ry, eq = Math.sqrt(exq * exq + eyq * eyq);
        if (eq < 0.8 || eq > 1.08) continue;
        var p = 1 - Math.abs(eq - 0.94) / 0.14, r = hash(gx, gy, 3);
        if (r > p * 0.42) continue;
        var s = r < 0.04 ? cell * 2 - 1 : cell - (r < 0.25 ? 1 : 2);
        for (var i2 = 0; i2 < s; i2++) for (var j = 0; j < s; j++) {
          var xq = gx + i2, yq = gy + j;
          if (xq < Wd && yq < H) base[yq * Wd + xq] = i2 === 0 || j === 0 || i2 === s - 1 || j === s - 1 ? K : W;
        }
      }
      // coins in the corn, pixels of colour in the black
      for (var y3 = Math.round(L.bushY); y3 < L.groundY; y3++) for (var x3 = 0; x3 < Wd; x3++) {
        if (base[y3 * Wd + x3] === K && hash(x3, y3, 9) < 0.07) base[y3 * Wd + x3] = GLITCH[(hash(x3, y3, 11) * 6) | 0];
      }
      // the ink: drips hanging from the pyramid's base
      drips = [];
      var n = Math.max(6, Math.round(L.half * 0.75));
      for (var i3 = 0; i3 < n; i3++) {
        var xd = Math.round(L.cx - L.half * 0.92 + (i3 / (n - 1)) * L.half * 1.84 + (hash(i3, 1) - 0.5) * 2);
        var r3 = hash(i3, 2);
        var reach = r3 < 0.16 ? H * (0.14 + hash(i3, 3) * 0.16) : r3 < 0.45 ? H * (0.04 + hash(i3, 3) * 0.06) : H * (0.008 + hash(i3, 3) * 0.025);
        drips.push({ x: xd, reach: reach, w: hash(i3, 4) < 0.35 ? 2 : 1, ph: hash(i3, 5) * 6.28, sp: 0.006 + hash(i3, 6) * 0.012, wob: hash(i3, 7) * 6.28 });
      }
      // glitch blocks drifting at the corn's edge
      blocks = [];
      for (var i4 = 0; i4 < Math.round(Wd * 0.16); i4++) {
        var side2 = i4 % 2 ? 1 : -1;
        blocks.push({ x: cx + side2 * (L.rx * (0.7 + hash(i4, 21) * 0.75)), y: L.cy + (hash(i4, 22) - 0.1) * L.ry * 0.9, s: 3 + ((hash(i4, 23) * 7) | 0), c: hash(i4, 24) < 0.55 ? -1 : (hash(i4, 25) * 5) | 0, ph: hash(i4, 26) * 100 });
      }
      // two coins hang in the corn, one on each side, and bob
      coins = [
        { x: Math.round(cx - Wd * 0.34), y: Math.round(H * 0.42), c: GLITCH[0], ph: 0 },
        { x: Math.round(cx + Wd * 0.33), y: Math.round(H * 0.36), c: GLITCH[1], ph: 2.1 }
      ];
      drops = [];
    }

    st.px = function (x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < st.W && y < st.H) st.buf[y * st.W + x] = c; };
    st.rect = function (x, y, w, h, c) { for (var j2 = Math.max(0, y | 0); j2 < Math.min(st.H, (y + h) | 0); j2++) for (var i5 = Math.max(0, x | 0); i5 < Math.min(st.W, (x + w) | 0); i5++) st.buf[j2 * st.W + i5] = c; };
    st.box = function (x, y, s, fill, line) { st.rect(x, y, s, s, line); if (s > 2) st.rect(x + 1, y + 1, s - 2, s - 2, fill); };

    function coin(cxq, cyq, col, ph) {
      // a coin: a ring and a dollar sign, in the colours that leak through
      var cy2 = cyq + Math.round(Math.sin(st.t * 0.05 + ph) * 2), r = 7, i, j;
      for (var yy = cyq - r; yy <= cy2 + r; yy++) for (var xx = cxq - r; xx <= cxq + r; xx++) {
        var rr = Math.hypot(xx - cxq, yy - cyq);
        if (rr < r - 1.5 && rr > r - 3) st.px(xx, yy, col);
      }
      var S = ["0111110", "1101011", "1101000", "0111110", "0001011", "1101011", "0111110"];
      for (j = 0; j < S.length; j++) for (i = 0; i < 7; i++) if (S[j][i] === "1") st.px(cxq - 3 + i, cyq - 3 + j, col);
      st.px(cxq, cyq - 4, col); st.px(cxq, cyq + 3, col);
    }

    function eye() {
      var cx = L.cx, eyeY = L.eyeY, eyeW = L.eyeW, eyeH = L.eyeH;
      // the pupil drifts toward the reader's pointer, or wanders on its own
      var want = st.aim && st.now() - st.lastAim < 4000 ? st.aim : { x: Math.sin(st.t * 0.013) * 0.6, y: Math.sin(st.t * 0.021) * 0.35 };
      st.look.x += (want.x - st.look.x) * 0.12; st.look.y += (want.y - st.look.y) * 0.12;
      var px = cx + st.look.x * eyeW * 0.38, py2 = eyeY + st.look.y * eyeH * 0.32;
      for (var y = Math.floor(eyeY - eyeH); y <= eyeY + eyeH; y++) for (var x = Math.floor(cx - eyeW); x <= cx + eyeW; x++) {
        var u = (x - cx) / eyeW, v = (y - eyeY) / eyeH;
        var lid = Math.pow(Math.max(0, 1 - u * u), 0.85);
        if (Math.abs(v) > lid) continue;
        var dx = x - px, dy = (y - py2) * 1.35, r = Math.sqrt(dx * dx + dy * dy);
        var c;
        if (Math.abs(Math.abs(v) - lid) < 0.13 / Math.max(0.35, lid)) c = K; // the lid's line
        else if (r < eyeH * 0.32) c = r < eyeH * 0.1 && dx < 0 && dy < 0 ? W : K; // pupil, one glint
        else {
          var a = Math.atan2(dy, dx), s = r / 2.6 + a / Math.PI - st.t * 0.035;
          c = (s - Math.floor(s)) < 0.5 ? K : W; // a log spiral, turning slowly
        }
        st.buf[y * st.W + x] = c;
      }
    }

    function road() {
      var top = Math.round(L.groundY), H = st.H, Wd = st.W;
      for (var y = top; y < H; y++) {
        var depth = (y - top) / (H - top); // 0 far, 1 near
        var seg = 2 + Math.round(3 + depth * 22 + hash(y, 31) * 10);
        var off = Math.floor(st.t * (0.3 + depth * 2.2) * (hash(y, 32) < 0.5 ? 1 : -1) + hash(y, 33) * 400);
        if (st.tear && y >= st.tear.y && y < st.tear.y + st.tear.h) off += st.tear.dx;
        var centre = Wd / 2, spread = Wd * (0.08 + depth * 0.62);
        for (var x = 0; x < Wd; x++) {
          var k = Math.floor((x + off) / seg), h = hash(k, y, 34);
          var onPath = Math.abs(x - centre) < spread;
          var c;
          if (!onPath && depth < 0.35) c = h < 0.6 ? K : GLITCH[(h * 9) | 0];
          else if (h < (onPath ? 0.12 : 0.34)) c = K;
          else if (h < (onPath ? 0.42 - depth * 0.15 : 0.44)) c = W;
          else c = GLITCH[(hash(k, y, 35) * 7) | 0];
          if ((y + (st.t >> 3)) % 7 === 0 && hash(k, 36) < 0.3) c = K; // a scan seam
          st.buf[y * Wd + x] = c;
        }
      }
    }

    st.step = function () {
      st.t++;
      if (st.t % 9 === 0 && drops.length < 14) {
        var d = drips[(Math.random() * drips.length) | 0];
        if (d) drops.push({ x: d.x, y: L.baseY + d.reach * 0.9, v: 0.15, s: Math.random() < 0.3 ? 3 : 2 });
      }
      for (var i = 0; i < drops.length; i++) { drops[i].v = Math.min(1.4, drops[i].v + 0.03); drops[i].y += drops[i].v; }
      drops = drops.filter(function (d) { return d.y < L.groundY - 2; });
      if (st.tear) { if (--st.tear.life <= 0) st.tear = null; }
      else if (Math.random() < 0.012) st.tear = { y: Math.round(L.groundY + Math.random() * (st.H - L.groundY) * 0.8), h: 2 + ((Math.random() * 8) | 0), dx: ((Math.random() - 0.5) * st.W * 0.4) | 0, life: 6 + ((Math.random() * 10) | 0) };
    };

    st.draw = function () {
      var Wd = st.W, H2 = st.H;
      st.buf.set(base);
      // the pyramid, black on the clearing, an eye in its face
      var apex = Math.round(L.apex), baseY = Math.round(L.baseY);
      for (var y = apex; y <= baseY; y++) {
        var w2 = ((y - apex) / (baseY - apex)) * L.half;
        for (var x = Math.floor(L.cx - w2); x <= L.cx + w2; x++) st.buf[y * Wd + x] = K;
      }
      eye();
      // ink running down, a bulb at each end, some letting go
      for (var di = 0; di < drips.length; di++) {
        var d = drips[di];
        var len = Math.max(1, d.reach * (0.82 + 0.18 * Math.sin(st.t * d.sp + d.ph)));
        for (var y2 = Math.floor(baseY); y2 < baseY + len; y2++) {
          var kk = (y2 - baseY) / len, x2 = d.x + Math.round(Math.sin(y2 * 0.35 + d.wob) * 0.6 * kk);
          var ww = kk < 0.3 ? d.w + 1 : d.w;
          for (var i2 = 0; i2 < ww; i2++) st.px(x2 + i2, y2, K);
        }
        st.rect(d.x - 1, baseY + len - 2, d.w + 2, 3, K);
      }
      for (var bi = 0; bi < blocks.length; bi++) {
        var b = blocks[bi];
        var jx = hash(b.ph | 0, (st.t >> 4)) < 0.06 ? 1 : 0;
        var y3 = b.y - ((st.t * 0.04 + b.ph) % (H2 * 0.25));
        if (b.c < 0) st.box(b.x + jx, y3, b.s, W, K); else st.box(b.x + jx, y3, b.s, GLITCH[b.c], K);
      }
      for (var dr = 0; dr < drops.length; dr++) st.rect(drops[dr].x, drops[dr].y, drops[dr].s, drops[dr].s, K);
      for (var ci = 0; ci < coins.length; ci++) coin(coins[ci].x, coins[ci].y, coins[ci].c, coins[ci].ph);
      road();
    };

    st.now = function () { return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now(); };
    st.eyeY = function () { return L ? L.eyeY : 0; };
    st.K = K; st.Wc = W; st.G = G; st.GLITCH = GLITCH;
    return st;
  }

  // ---------- export the core under Node; mount in the browser ----------
  // (the repo is "type": "module", so a plain require() sees the file as ESM —
  // the globalThis hook is the one path that works for both module systems)
  if (typeof globalThis !== "undefined") globalThis.__atlasArt = { cornField: cornField };
  if (typeof module === "object" && module.exports) { module.exports = { cornField: cornField, hex: hex, K: K, W: W, G: G, GLITCH: GLITCH }; return; }
  if (typeof document === "undefined") return;

  (function mount() {
    var cv = document.getElementById("atlas-hero");
    if (!cv) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var ticker = function (fn, ms) { if (!reduced) setInterval(function () { if (!document.hidden) fn(); }, ms); };
    var onResize = function (fn) { var t2; window.addEventListener("resize", function () { clearTimeout(t2); t2 = setTimeout(fn, 160); }); };

    var st = cornField();
    var g = null, img = null;

    function size() {
      var cssW = cv.parentElement.clientWidth;
      var S = cssW < 520 ? 3 : 4;
      var Wb = Math.max(60, Math.floor(cssW / S));
      var Hb = Math.round(Wb * (cssW < 520 ? 1.18 : 0.58));
      st.size(Wb, Hb);
      cv.width = st.W; cv.height = st.H;
      cv.style.width = "100%"; cv.style.height = st.H * (cssW / st.W) + "px";
      g = cv.getContext("2d");
      img = g.createImageData(st.W, st.H);
      img.data.set(new Uint8Array(st.buf.buffer));
      g.putImageData(img, 0, 0);
    }
    var show = function () { img.data.set(new Uint8Array(st.buf.buffer)); g.putImageData(img, 0, 0); };

    var toAim = function (e) { var r = cv.getBoundingClientRect(); return { x: Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2.4)), y: Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - st.eyeY() / st.H) * 3)) }; };
    window.addEventListener("pointermove", function (e) { st.aim = toAim(e); st.lastAim = st.now(); }, { passive: true });
    cv.addEventListener("pointerdown", function (e) { st.aim = toAim(e); st.lastAim = st.now(); st.tear = { y: Math.round(st.H * 0.76), h: Math.round(st.H * 0.24), dx: ((Math.random() - 0.5) * st.W * 0.5) | 0, life: 8 }; });

    size();
    for (var i = 0; i < 40; i++) st.step();
    st.draw(); show();
    ticker(function () { st.step(); st.draw(); show(); }, 50);
    onResize(function () { size(); st.draw(); show(); });
  })();
})();