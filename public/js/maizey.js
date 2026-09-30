// MAIZEY — site guide.
//
// Also Müt's host. The Xixoxis shell's familiar can speak on this site, and
// he does it through her: mut/mut.js polls the wire and calls
// window.MutHost.channel(msg); for the message's ttl she is visibly not
// herself (the .channeling state in css/style.css) and says his words. While
// he has her, her own lines wait — the greeting timer and the 12s hide timer
// cannot talk over him, and clicking her does nothing until he lets go.
(function () {
  var root = document.getElementById('maizey');
  var body = document.getElementById('maizey-body');
  var bubble = document.getElementById('maizey-bubble');
  var text = document.getElementById('maizey-text');
  var closeBtn = document.getElementById('maizey-close');
  if (!root || !body || !bubble || !text) return;

  var LINES = [
    "INTEL ADVISORY: Power systems use 'mysticism' and sensationalism to disguise classified aerospace test flights, automated surveillance, and no-bid procurement.",
    "INVESTIGATIVE TOOL: Click any dossier's [ANALYZE WITH MAIZEY] button to trigger a live breakdown of the mechanism, money trail, and human impact.",
    "COUNTER-MEASURE: Check the PRIMARY EVIDENCE drawer at the bottom of each file to inspect direct SEC, FEC, or Congressional citations.",
    "CRITICAL CONTEXT: Stablecoin deregulation (GENIUS Act) authorizes synthetic private banking without FDIC backstops. The cost falls on ordinary depositors.",
    "ARCHIVAL FACT: Project Mogul balloon microphones in 1947 created the Roswell saucer myth. Classified nuclear detection was the real mission.",
    "CIVIL SERVICE PURGES: Bypassing civil service protections via 'RAGE' removes independent regulatory inspections across aviation, water, and pharmaceuticals."
  ];

  var idx = 0;
  var hideTimer = null;
  var channeling = null;   // the message he is speaking through her, or null
  var graphicEl = null;

  function show(line, customTitle, actions) {
    if (channeling) return;                 // his turn
    text.innerHTML = '';
    
    var header = document.createElement('div');
    header.className = 'console-header';
    header.innerHTML = '<span>🌽</span> ' + (customTitle || 'MAIZEY INTEL CONSOLE');
    text.appendChild(header);

    var bodyEl = document.createElement('div');
    bodyEl.className = 'console-body';
    bodyEl.textContent = line;
    text.appendChild(bodyEl);

    if (actions && actions.length) {
      var actWrap = document.createElement('div');
      actWrap.className = 'console-actions';
      actions.forEach(function(act) {
        var btn = document.createElement('button');
        btn.className = 'console-btn';
        btn.textContent = act.label;
        btn.onclick = function(e) {
          e.stopPropagation();
          act.onClick();
        };
        actWrap.appendChild(btn);
      });
      text.appendChild(actWrap);
    }

    bubble.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 16000);
  }

  function analyzeDossier(id, title, takeaway, sourceUrl) {
    if (channeling) return;
    // Highlight the card on page
    var allCards = document.querySelectorAll('.dossier-card');
    allCards.forEach(function(c) { c.classList.remove('active-target'); });
    var target = document.getElementById(id);
    if (target) {
      target.classList.add('active-target');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    show(takeaway, 'DOSSIER ANALYSIS: ' + title.slice(0, 24) + '...', [
      {
        label: 'OPEN SOURCE ↗',
        onClick: function() { window.open(sourceUrl, '_blank'); }
      },
      {
        label: 'EXPAND EVIDENCE 🔍',
        onClick: function() {
          if (target) {
            var drawer = target.querySelector('.evidence-drawer');
            if (drawer) drawer.open = true;
          }
        }
      },
      {
        label: 'DISMISS',
        onClick: hide
      }
    ]);
  }

  function hide() {
    if (channeling) return;                 // a broadcast outlives her timer
    bubble.hidden = true;
    clearTimeout(hideTimer);
  }

  function nextLine() {
    show(LINES[idx % LINES.length]);
    idx++;
  }

  // ---- channeling -------------------------------------------------------
  var STATES = ['idle', 'happy', 'confused', 'angry', 'rage', 'sad', 'surprised',
                'sleepy', 'sick', 'lovestruck', 'alert', 'sleeping', 'channel'];

  function clearStateClasses() {
    var names = [];
    for (var i = 0; i < root.classList.length; i++) {
      if (root.classList[i].indexOf('s-') === 0) names.push(root.classList[i]);
    }
    for (var j = 0; j < names.length; j++) root.classList.remove(names[j]);
  }

  function channel(msg) {
    msg = msg || {};
    channeling = msg;
    clearTimeout(hideTimer);
    clearStateClasses();
    var state = STATES.indexOf(msg.state) >= 0 ? msg.state : 'idle';
    root.classList.add('channeling', 's-' + state);
    text.textContent = String(msg.text || '');
    if (graphicEl) { graphicEl.remove(); graphicEl = null; }
    if (msg.graphic) {
      // A URL the wire already restricted to https or this origin. Shown as
      // an image, never as markup.
      graphicEl = document.createElement('img');
      graphicEl.className = 'mut-graphic';
      graphicEl.alt = '';
      graphicEl.referrerPolicy = 'no-referrer';
      graphicEl.src = msg.graphic;
      bubble.insertBefore(graphicEl, text);
    }
    bubble.hidden = false;
  }

  function release() {
    if (!channeling) return;
    channeling = null;
    clearStateClasses();
    root.classList.remove('channeling');
    if (graphicEl) { graphicEl.remove(); graphicEl = null; }
    bubble.hidden = true;
  }

  body.addEventListener('click', function () {
    if (channeling) return;
    nextLine();
  });
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (channeling) release(); else hide();
  });

  // Greet on arrival
  setTimeout(nextLine, 2500);

  window.Maizey = {
    show: show,
    hide: hide,
    channel: channel,
    release: release,
    analyzeDossier: analyzeDossier,
    get busy() { return !!channeling; }
  };
  window.MutHost = window.Maizey;

  // Global scanner listener for [ANALYZE WITH MAIZEY] buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.maizey-scan-btn');
    if (!btn) return;
    e.preventDefault();
    var card = btn.closest('.dossier-card');
    if (!card) return;
    var id = card.id;
    var title = card.dataset.title || 'CLASSIFIED DOSSIER';
    var takeaway = card.dataset.takeaway || 'Analysis in progress...';
    var sourceUrl = card.dataset.source || 'https://goblinhouse.net';
    analyzeDossier(id, title, takeaway, sourceUrl);
  });
})();
