// MAIZEY — site guide.
(function () {
  var body = document.getElementById('maizey-body');
  var bubble = document.getElementById('maizey-bubble');
  var text = document.getElementById('maizey-text');
  var closeBtn = document.getElementById('maizey-close');
  if (!body || !bubble || !text) return;

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

  function show(line) {
    text.textContent = line;
    bubble.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 12000);
  }

  function hide() {
    bubble.hidden = true;
    clearTimeout(hideTimer);
  }

  function nextLine() {
    show(LINES[idx % LINES.length]);
    idx++;
  }

  body.addEventListener('click', nextLine);
  closeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    hide();
  });

  // Greet on arrival
  setTimeout(nextLine, 2500);

  // Eyes follow the cursor.
  var pupils = document.querySelectorAll('#maizey-eyes .pupil');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (pupils.length && !reduced) {
    document.addEventListener('mousemove', function (e) {
      var rect = body.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 3;
      var dx = Math.max(-1, Math.min(1, (e.clientX - cx) / 300));
      var dy = Math.max(-1, Math.min(1, (e.clientY - cy) / 300));
      for (var i = 0; i < pupils.length; i++) {
        pupils[i].setAttribute('transform', 'translate(' + (dx * 2.4) + ' ' + (dy * 2.4) + ')');
      }
    });
  }
})();
