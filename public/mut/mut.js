// Müt's wire, page side. Polls /mut/latest every 3s and hands whatever is
// new to the page's host sprite — window.MutHost.channel(msg) — which is
// how the shell's familiar speaks on this site through Maizey rather than
// appearing himself. The host is released when the message expires.
//
// Nothing here writes HTML. The message's text goes through the host as a
// string (Maizey sets textContent); a graphic is a URL the host may show as
// an <img>. No host on the page: this script does nothing at all.
(function () {
  var POLL_MS = 3000;
  var MAX_TEXT = 280;
  var script = document.currentScript;
  var endpoint = script && script.src ? new URL("latest", script.src).href : "/mut/latest";
  var last = null;          // id of the message the host is currently carrying
  var releaseTimer = null;
  var pollTimer = null;
  var stopped = false;
  var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function host() { return window.MutHost || null; }

  function release(id) {
    if (last !== id) return;
    last = null;
    clearTimeout(releaseTimer);
    var h = host();
    if (h && typeof h.release === "function") h.release();
  }

  function apply(msg) {
    var h = host();
    if (!h || typeof h.channel !== "function") return;
    if (!msg || !msg.id) { if (last) release(last); return; }
    var ttl = Math.min(120000, Math.max(3000, Number(msg.ttl) || 20000));
    var expires = Number(msg.at) + ttl;
    if (!(expires > Date.now())) { if (last === msg.id) release(msg.id); return; }
    if (msg.id === last) return;

    last = msg.id;
    clearTimeout(releaseTimer);
    h.channel({
      id: String(msg.id),
      text: String(msg.text || "").slice(0, MAX_TEXT),
      state: String(msg.state || "idle").replace(/[^a-z]/g, "") || "idle",
      graphic: typeof msg.graphic === "string" && /^(https:\/\/|\/)/.test(msg.graphic) ? msg.graphic : null,
      ttl: ttl,
      reduced: reduced,
    });
    releaseTimer = setTimeout(function () { release(msg.id); }, expires - Date.now());
  }

  function tick() {
    if (stopped) return;
    fetch(endpoint, { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(apply)
      .catch(function () {})   // a blip is a no-op; the host keeps what it has
      .then(function () { pollTimer = setTimeout(tick, POLL_MS); });
  }

  window.__mut = {
    stop: function () { stopped = true; clearTimeout(pollTimer); },
    endpoint: endpoint,
  };
  tick();
})();
