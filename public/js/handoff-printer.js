// The ledger printer: continuous greenbar paper feeding out of a line printer.
// It prints a banner in the old line-printer way (big letters made of
// characters), then the documented handoffs one row at a time, the head
// sweeping as each line is struck, then a perforation, and starts again.
(function () {
  "use strict";
  const paper = document.getElementById("paper"), head = document.getElementById("head"), busy = document.getElementById("busy");
  if (!paper) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 96;                                    // characters per printed line, set to fit the paper
  // a 5x7 banner face, as line printers struck it
  const F = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"], F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"], N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  };
  function banner(word, ink = "#") {
    const rows = [], gap = W < 60 ? " " : "  ";
    for (let r = 0; r < 7; r++) rows.push([...word].map((ch) => (F[ch] || F[" "])[r].replace(/1/g, ink).replace(/0/g, " ")).join(gap));
    return rows;
  }
  const center = (s) => " ".repeat(Math.max(0, Math.floor((W - s.length) / 2))) + s;
  const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s + " ".repeat(n - s.length));
  const dots = (s, n) => (s.length >= n - 1 ? s.slice(0, n - 2) + "… " : s + " " + ".".repeat(n - s.length - 1));
  // the printer's own short names; a case without one is named from its title
  const NAMES = {
    "chile-pension-privatization-1981": ["Chile's public pension funds", "AFPs (private pension funds)"],
    "landsat-eosat-commercialization": ["Landsat (NASA, NOAA)", "EOSAT"],
    "conrail-privatization": ["Conrail", "public shareholders, then CSX/NS"],
    "bp-privatisation-uk": ["UK government stake in BP", "BP plc shareholders"],
    "telmex-privatization": ["Telmex", "Grupo Carso consortium"],
    "aguas-argentinas": ["Obras Sanitarias de la Nación", "Aguas Argentinas (Suez-led)"],
    "ypf-privatization": ["YPF", "private shareholders, then Repsol"],
    "treuhand-east-germany": ["East German state enterprises", "about 14,000 private buyers"],
    "nsfnet-commercial-backbone": ["NSFNET backbone", "commercial Internet backbones"],
    "russia-loans-for-shares": ["Norilsk, Yukos, Sibneft stakes", "loans-for-shares banks"],
    "british-rail-privatisation": ["British Rail", "Railtrack and train operators"],
    "taxol-nci-bms": ["NCI paclitaxel research", "Bristol-Myers Squibb (Taxol)"],
    "nsf-dli-google": ["NSF Digital Libraries grant", "Google"],
    "cochabamba-water-bechtel": ["SEMAPA (Cochabamba water)", "Aguas del Tunari (Bechtel-led)"],
    "zambia-copper-privatization": ["Zambia Consolidated Copper", "Konkola Copper Mines"],
    "uk-national-air-traffic-services": ["National Air Traffic Services", "the Airline Group"],
    "dera-qinetiq-privatisation": ["DERA (UK defence research)", "QinetiQ"],
    "petro-canada-privatization": ["Petro-Canada (Crown corporation)", "public shareholders"],
    "sallie-mae-privatization": ["Sallie Mae (federal charter)", "SLM Corporation"],
    "japan-post-privatization": ["Japan Post", "Japan Post Holdings shareholders"],
    "braingate-blackrock-synchron": ["BrainGate / Utah array research", "Blackrock Microsystems"],
    "nasa-cots-spacex": ["Space Shuttle cargo role", "SpaceX, Orbital (resupply)"],
    "shuttle-commercial-crew": ["Space Shuttle crew role", "SpaceX, Boeing (crew)"],
    "cia-c2s-aws": ["CIA in-house computing", "Amazon Web Services"],
    "healthcare-gov-contract": ["HealthCare.gov (CGI Federal)", "Accenture Federal Services"],
    "darpa-synapse-ibm-truenorth": ["DARPA SyNAPSE", "IBM TrueNorth"],
    "royal-mail-privatisation": ["Royal Mail", "Royal Mail plc shareholders"],
    "us-weather-data-commercialization": ["NOAA COSMIC radio occultation", "Spire, GeoOptics, PlanetiQ"],
    "calo-siri": ["DARPA CALO (SRI)", "Siri, Inc."],
  };
  let ROWS = [], TOTAL = "";
  const short = (s) => s.replace(/\s*\(.*?\)/g, "").trim();
  window.addEventListener("handoffs-ready", (e) => {
    const recs = (e.detail.records || []).filter((r) => r.grade === "A" || r.grade === "B")
      .sort((a, b) => String(a.private.founded.date).localeCompare(String(b.private.founded.date)));
    ROWS = recs.map((r) => {
      const [p, q] = NAMES[r.id] || (r.title.includes("→") ? r.title.split("→").map(short) : [short(r.public.name), short(r.private.name)]);
      return [String(r.private.founded.date).slice(0, 4), p, q, r.grade];
    });
    TOTAL = e.detail.total || "";
    begin();
  });

  // the job: banner, heading, the rows, a total, a tear line
  function job() {
    const out = [];
    const narrow = W < 70, COLW = narrow ? 0 : Math.floor((W - 20) / 2);
    out.push({ t: "" });
    for (const l of banner("HANDOFF")) out.push({ t: center(l), cls: "banner" });
    out.push({ t: "" });
    for (const l of banner("LEDGER")) out.push({ t: center(l), cls: "banner" });
    out.push({ t: "" });
    out.push({ t: center(narrow ? "PUBLIC MONEY ══▶ PRIVATE HANDS" : "PUBLIC MONEY  ══▶  PRIVATE HANDS  ·  DOCUMENTED HANDOFFS ONLY") });
    out.push({ t: "" });
    if (narrow) {
      // a narrow sheet prints each handoff on two lines
      out.push({ t: "═".repeat(W) });
      for (const [y, pub, priv, g] of ROWS) {
        out.push({ t: `${y}  ${pad(pub, W - 9)} ${g}`, g });
        out.push({ t: `      ══▶ ${pad(priv, W - 10)}` });
      }
    } else {
      out.push({ t: `${pad("YEAR", 6)}${pad("PUBLIC PROGRAM", COLW)}${pad("", 6)}${pad("PRIVATE SUCCESSOR", COLW)}${pad("GRADE", 8)}` });
      out.push({ t: "═".repeat(W) });
      for (const [y, pub, priv, g] of ROWS) {
        out.push({ t: `${pad(y, 6)}${dots(pub, COLW)} ══▶  ${dots(priv, COLW)}${pad("  " + g, 8)}`, g });
      }
    }
    out.push({ t: "─".repeat(W) });
    const lead = narrow ? "" : "      ";
    // the total on one line where it fits, on two where it does not
    if (TOTAL) for (const part of (lead + TOTAL).length <= W ? [TOTAL] : TOTAL.split(/\s*\.{3,}\s*/)) out.push({ t: lead + part });
    out.push({ t: `${lead}${ROWS.length} DOCUMENTED HANDOFFS PRINTED.` });
    out.push({ t: `${lead}TIMING ALONE IS NEVER A LINK.` });
    out.push({ t: "" });
    out.push({ perf: true });
    return out;
  }

  const lines = [];
  const LINE_H = 18, KEEP = 40;
  function addLine(spec) {
    const el = document.createElement("div");
    if (spec.perf) el.className = "perf";
    else { el.className = "line" + (spec.cls ? " " + spec.cls : ""); }
    paper.appendChild(el);
    lines.push(el);
    if (lines.length > KEEP) lines.shift().remove();
    return el;
  }
  const html = (spec, upto) => {
    let s = spec.t.slice(0, upto).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    if (spec.g) s = s.replace(/ ([ABCD])\s*$/, (m, g) => ` <span class="${g.toLowerCase()}">${g}</span>`);
    s = s.replace(/══▶/g, '<span class="x">══▶</span>');
    return s;
  };
  // the head sits over the column being struck
  const headAt = (col) => { head.style.left = `calc(${(col / W) * 100}% - 17px)`; };

  let queue = [], cur = null, col = 0, feed = 0;
  function tick() {
    if (!cur) {
      if (!queue.length) queue = job();
      const spec = queue.shift();
      cur = { spec, el: addLine(spec) };
      col = 0;
      feed += LINE_H;
      paper.style.setProperty("--feed", `${-feed}px`);
      if (spec.perf || !spec.t.trim()) { cur = null; return; }
    }
    // a line printer strikes a whole run at once; this one sweeps in bursts
    col = Math.min(cur.spec.t.length, col + 9);
    cur.el.innerHTML = html(cur.spec, col);
    headAt(col);
    if (col >= cur.spec.t.length) cur = null;
  }
  // as many columns as the paper holds, measured in the paper's own face
  function fit() {
    const probe = document.createElement("span");
    probe.textContent = "0".repeat(20);
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:pre";
    paper.appendChild(probe);
    const cw = probe.getBoundingClientRect().width / 20;
    probe.remove();
    const inner = paper.clientWidth - parseFloat(getComputedStyle(paper).paddingLeft) * 2;
    // two columns spare: the arrow is drawn a little wider than one column
    W = Math.max(36, Math.min(110, Math.floor(inner / cw) - 2));
  }
  let timer = null;
  function begin() {
    fit();
    paper.innerHTML = ""; lines.length = 0; cur = null; feed = 0;
    const first = job();
    if (reduced) {
      for (const spec of first) { const el = addLine(spec); if (!spec.perf) el.innerHTML = html(spec, spec.t.length); }
      busy.classList.remove("busy");
      return;
    }
    // the banner is already on the paper when the page opens
    for (const spec of first.slice(0, 18)) { const el = addLine(spec); if (!spec.perf) el.innerHTML = html(spec, spec.t.length); }
    queue = first.slice(18);
    clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden) tick(); }, 45);
  }
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { const w = W; fit(); if (w !== W && ROWS.length) begin(); }, 200); });
})();
