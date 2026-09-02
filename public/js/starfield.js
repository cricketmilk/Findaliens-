// FINDALIENS starfield — 90s screensaver energy, plus page widgets.
(function () {
  var canvas = document.getElementById('starfield');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var stars = [];
  var STAR_COUNT = 160;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (var i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 1.6 + 0.3,          // depth → size & speed
      tw: Math.random() * Math.PI * 2,       // twinkle phase
      hue: Math.random() < 0.08 ? 'gold' : 'white'
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = 0.45 + 0.55 * Math.abs(Math.sin(s.tw + t / 900));
      ctx.fillStyle = s.hue === 'gold'
        ? 'rgba(247, 201, 72, ' + alpha + ')'
        : 'rgba(232, 232, 255, ' + alpha + ')';
      ctx.fillRect(s.x, s.y, s.z * 1.6, s.z * 1.6);
      if (!reduced) {
        s.y += s.z * 0.12;                   // slow drift, like the credits of the cosmos
        if (s.y > canvas.height) { s.y = -2; s.x = Math.random() * canvas.width; }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  // ---- visitor counter ----
  var counter = document.getElementById('hitCounter');
  if (counter) {
    var hits = 0;
    try {
      var stored = parseInt(localStorage.getItem('fa_visits'), 10);
      if (!isNaN(stored)) hits = stored;
      hits += 1;
      localStorage.setItem('fa_visits', String(hits));
    } catch (e) { hits += 1; }
    counter.textContent = String(hits).padStart(7, '0');
  }
})();
