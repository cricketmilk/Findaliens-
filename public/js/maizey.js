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
    "Hi, I'm Maizey — the site guide. Click any green [READ SOURCE] button to open the original reporting behind a headline.",
    "Stories are grouped into three sections: Drone Watch, Disclosure Desk, and Crop Circle Corner.",
    "The corn rating on each story shows how contested it is — five cobs marks the most controversial topics.",
    "Source links open in a new tab, so you won't lose your place.",
    "This site aggregates third-party reporting. Headlines and summaries are written here; the facts come from the linked sources.",
    "Click me again anytime for another tip."
  ];

  var idx = 0;
  var hideTimer = null;
  var channeling = null;   // the message he is speaking through her, or null
  var graphicEl = null;

  function show(line) {
    if (channeling) return;                 // his turn
    text.textContent = line;
    bubble.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 12000);
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
    get busy() { return !!channeling; }
  };
  window.MutHost = window.Maizey;
})();
