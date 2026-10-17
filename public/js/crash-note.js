// The note's furniture: the ticker, the figures, the guilloche seal and the
// record. Everything is read from the page's own entries (nodes, lineages),
// so every tick and square is a real entry at its real year.
(function note() {
  "use strict";
  if (typeof nodes === "undefined" || !nodes.length) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const sorted = [...nodes].sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  const short = (t) => String(t).split(/[:—]/)[0].trim();

  // ---- opening an entry from anywhere, and the phone sheet ----
  // On a narrow screen any selection a reader makes raises the dossier as a
  // sheet; the page's own selection on load (from the URL hash) ran before
  // this wrapper existed and does not.
  const narrow = window.matchMedia("(max-width: 1180px)");
  const pageSelect = window.selectNode;
  window.selectNode = function (id) {
    pageSelect(id);
    if (window.ccPlot) window.ccPlot.sync();
    // a filter re-selecting the first match is not the reader opening it
    if (!narrow.matches || window.ccQuiet) return;
    document.body.classList.add("sheet-open");
    document.getElementById("inspector").scrollTop = 0;
  };
  const closeSheet = () => document.body.classList.remove("sheet-open");
  const pageSwitch = window.switchView;
  window.switchView = function (view) { pageSwitch(view); closeSheet(); };
  document.querySelector(".sheet-close").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
  const open = (id) => {
    switchView("timeline");
    if (!getFilteredNodes().some((n) => n.id === id)) { searchQuery = ""; document.getElementById("atlas-search").value = ""; activeEntity = null; filterLineage("all"); }
    window.selectNode(id);
    const el = document.getElementById("node-" + id);
    if (el && !narrow.matches) el.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
  };

  // ---- the ticker: every entry by year; it runs twice so it never ends ----
  const items = sorted.map((n) => `<a href="#${esc(n.id)}" data-id="${esc(n.id)}" style="--c:${nodeColor(n)}" title="${esc(n.title)}"><b>${n.year}</b><i></i>${esc(short(n.title)).toUpperCase()}</a>`).join("");
  const run = document.getElementById("ticker-run");
  run.innerHTML = items + items;
  run.addEventListener("click", (ev) => { const a = ev.target.closest("a[data-id]"); if (!a) return; ev.preventDefault(); open(a.dataset.id); });

  // ---- the figures, and the denomination in the corners ----
  const years = sorted.map((n) => n.year);
  const figs = {
    entries: nodes.length,
    linked: nodes.filter((n) => n.sources && n.sources.length).length,
    mechanisms: lineages.length,
    serial: `CC ${years[0]}·${years[years.length - 1]} A`,
    series: `Series ${years[0]} — ${years[years.length - 1]}`,
  };
  document.querySelectorAll("[data-fig]").forEach((el) => { el.textContent = figs[el.dataset.fig]; });

  // ---- microprint: the disclaimer, printed small enough to be texture ----
  const micro = "FREQUENCY IS NOT A VERDICT ✦ CHECK EVERY SOURCE ✦ AN ENTRY IS A LEAD UNTIL ITS SOURCES SAY OTHERWISE ✦ ";
  document.querySelectorAll("[data-microprint]").forEach((el) => { el.textContent = micro.repeat(14); });

  // ---- the seal: a guilloche rosette, cut in pixels ----
  // Bands of phase-shifted sinusoidal circles; where the copies cross is the
  // weave a banknote's engraving is made of. Each band drifts against the
  // next. All the trigonometry is done once: sin(n*th + ph) is expanded so a
  // frame is only multiply-adds.
  const cv = document.getElementById("rosette");
  if (cv) {
    const G = cv.getContext("2d"), W = cv.width, H = cv.height, C = W / 2, S = W * 0.48;
    const GREEN = [95, 224, 138], GOLD = [247, 201, 72];
    const BANDS = [
      { R: 0.92, A: 0.045, n: 32, K: 5, w: 0.05, col: GREEN },
      { R: 0.72, A: 0.11, n: 16, K: 6, w: -0.07, col: GOLD, m: 0.02, mn: 4 },
      { R: 0.46, A: 0.12, n: 10, K: 6, w: 0.09, col: GREEN, m: 0.025, mn: 2 },
      { R: 0.25, A: 0.075, n: 7, K: 4, w: -0.12, col: GOLD },
    ].map((b) => {
      const N = Math.round(b.n * 2 * Math.PI * W * 0.6);
      const ct = new Float32Array(N), st = new Float32Array(N), sn = new Float32Array(N), cn = new Float32Array(N), sm = new Float32Array(N), cm = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        const th = i / N * Math.PI * 2;
        ct[i] = Math.cos(th); st[i] = Math.sin(th); sn[i] = Math.sin(b.n * th); cn[i] = Math.cos(b.n * th);
        if (b.m) { sm[i] = Math.sin(b.mn * th); cm[i] = Math.cos(b.mn * th); }
      }
      return { ...b, N, ct, st, sn, cn, sm, cm };
    });
    const img = G.createImageData(W, H), px = img.data, hits = new Uint8Array(W * H), owner = new Int8Array(W * H);
    const draw = (t) => {
      hits.fill(0); owner.fill(-1);
      BANDS.forEach((b, bi) => {
        const ma = b.m ? -t * b.w * 2 : 0, mc = Math.cos(ma), ms = Math.sin(ma);
        for (let k = 0; k < b.K; k++) {
          const ph = k * Math.PI / b.K + t * b.w, pc = Math.cos(ph), ps = Math.sin(ph);
          let last = -1;
          for (let i = 0; i < b.N; i++) {
            let r = b.R + b.A * (b.sn[i] * pc + b.cn[i] * ps);
            if (b.m) r += b.m * (b.sm[i] * mc + b.cm[i] * ms);
            const x = (C + r * b.ct[i] * S) | 0, y = (C + r * b.st[i] * S) | 0, j = y * W + x;
            if (j === last) continue;
            last = j;
            if (hits[j] < 255) hits[j]++;
            if (owner[j] < 0) owner[j] = bi;
          }
        }
      });
      for (let j = 0, q = 0; j < hits.length; j++, q += 4) {
        if (!hits[j]) { px[q + 3] = 0; continue; }
        const col = BANDS[owner[j]].col;
        px[q] = col[0]; px[q + 1] = col[1]; px[q + 2] = col[2];
        px[q + 3] = Math.min(255, 150 + hits[j] * 50);
      }
      G.putImageData(img, 0, 0);
    };
    let t = 3, seen = true;
    draw(t);
    if (!reduced) {
      if ("IntersectionObserver" in window) new IntersectionObserver((es) => { seen = es[0].isIntersecting; }).observe(cv);
      let prev = 0;
      const tick = (now) => {
        requestAnimationFrame(tick);
        if (!seen || document.hidden || now - prev < 40) return;
        t += (now - prev > 200 ? 40 : now - prev) / 1000 * 0.9;
        prev = now;
        draw(t);
      };
      requestAnimationFrame(tick);
    }
  }

  // ---- the record: every entry as a square on one axis ----
  const plot = document.getElementById("plot"), axis = document.getElementById("plot-axis"), tip = document.getElementById("plot-tip");
  const Y0 = 1630, Y1 = 2030, X = (y) => (y - Y0) / (Y1 - Y0) * 100;
  const dots = sorted.map((n, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "plot-dot";
    b.setAttribute("role", "listitem");
    b.setAttribute("aria-label", `${n.year}: ${n.title}`);
    b.style.setProperty("--c", nodeColor(n));
    b.style.setProperty("--i", i);
    b.style.left = X(n.year) + "%";
    b.addEventListener("click", () => { tip.style.display = "none"; open(n.id); });
    const show = () => {
      const r = b.getBoundingClientRect(), lin = lineagesOf(n)[0];
      tip.style.setProperty("--c", nodeColor(n));
      tip.innerHTML = `<b>${n.year}</b><strong>${esc(n.title)}</strong><span>${lin ? esc(lin.name) : esc(n.category)}</span>`;
      tip.style.display = "block";
      const tw = tip.offsetWidth, th = tip.offsetHeight;
      tip.style.left = Math.max(12, Math.min(innerWidth - tw - 12, r.left + r.width / 2 - tw / 2)) + "px";
      tip.style.top = (r.top - th - 12 < 8 ? r.bottom + 12 : r.top - th - 12) + "px";
    };
    b.addEventListener("mouseenter", show);
    b.addEventListener("focus", show);
    b.addEventListener("mouseleave", () => { tip.style.display = "none"; });
    b.addEventListener("blur", () => { tip.style.display = "none"; });
    plot.appendChild(b);
    return { n, b };
  });
  // the stretch where the atlas thickens, said as a count rather than a shape
  const late = nodes.filter((n) => n.year >= 1970).length;
  const band = document.createElement("div");
  band.setAttribute("aria-hidden", "true");
  band.className = "plot-band";
  band.style.left = X(1970) + "%";
  band.style.right = 100 - X(2030) + "%";
  band.innerHTML = `<span>${late} of ${nodes.length} entries begin in or after 1970</span>`;
  plot.appendChild(band);
  axis.innerHTML = [1650, 1700, 1750, 1800, 1850, 1900, 1950, 2000].map((y) => `<span class="${y % 100 ? "minor" : ""}" style="left:${X(y)}%">${y}</span>`).join("");
  // File the squares in columns a few years wide (as many years as one
  // square spans at this width) and stack each column, grouped by colour.
  // Placing them at their exact year staircased wherever entries crowd.
  const order = new Map(lineages.map((l, i) => [l.id, i]));
  const rank = (n) => { const l = lineagesOf(n)[0]; return l ? order.get(l.id) : 99; };
  const layout = () => {
    const w = plot.clientWidth, size = dots[0].b.offsetWidth || 10, step = size + 3;
    const span = Math.max(2, Math.ceil(step / w * (Y1 - Y0)));
    const cols = new Map();
    for (const d of dots) {
      const c = Math.floor((d.n.year - Y0) / span);
      if (!cols.has(c)) cols.set(c, []);
      cols.get(c).push(d);
    }
    let top = 0;
    for (const [c, list] of cols) {
      list.sort((a, b) => rank(a.n) - rank(b.n) || a.n.year - b.n.year);
      list.forEach((d, lv) => {
        d.b.style.left = X(Y0 + (c + 0.5) * span) + "%";
        d.b.style.bottom = 6 + lv * step + "px";
        d.b.title = "";
      });
      top = Math.max(top, list.length);
    }
    plot.style.height = Math.max(narrow.matches ? 90 : 120, 58 + top * step) + "px";
  };
  layout();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 120); });
  // the squares fall into place the first time the record is seen
  if (!reduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { plot.classList.add("drop"); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(plot);
  }
  // filters dim what they leave out; the open entry is ringed
  window.ccPlot = {
    sync() {
      const keep = new Set(getFilteredNodes().map((n) => n.id));
      for (const d of dots) { d.b.classList.toggle("dim", !keep.has(d.n.id)); d.b.classList.toggle("on", d.n.id === activeNodeId); }
    },
  };
  window.ccPlot.sync();
})();
