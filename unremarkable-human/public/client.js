// UNREMARKABLE HUMAN WEBSITE — client-side retro nonsense.
// Cursor sparkle trail + a few console easter eggs. No frameworks, obviously.

(function () {
  var glyphs = ['\u2726', '\u2727', '\u2605', '\u00b7', '\u2734'];
  var last = 0;

  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - last < 28) return; // throttle so we don't melt the browser
    last = now;

    var spark = document.createElement('span');
    spark.className = 'spark';
    spark.textContent = glyphs[(Math.random() * glyphs.length) | 0];
    spark.style.left = (e.clientX + (Math.random() * 14 - 7)) + 'px';
    spark.style.top = (e.clientY + (Math.random() * 14 - 7)) + 'px';
    document.body.appendChild(spark);

    setTimeout(function () {
      if (spark.parentNode) spark.parentNode.removeChild(spark);
    }, 600);
  });

  console.log(
    '%c\uD83D\uDC7D UNREMARKABLE HUMAN WEBSITE %c\n' +
    'If you can read this, you are already too curious for your own good.\n' +
    'The truth is in the source code. (It is not.)',
    'color:#33ffcc;font-size:16px;font-weight:bold;',
    'color:#cfe0c8;'
  );
})();
