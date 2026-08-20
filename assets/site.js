/* Trust Circle — motion + interactions (dependency-free) */
(function () {
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* kinetic headlines: wrap words in rise-masks */
  document.querySelectorAll('[data-kin]').forEach(function (el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('i'); i.textContent = tok;
            w.appendChild(i); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add('kin');
    var idx = 0;
    el.querySelectorAll('.w > i').forEach(function (i) {
      i.style.transitionDelay = (idx++ * 50) + 'ms';
    });
  });

  /* reveals */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.rv, .kin').forEach(function (el) { io.observe(el); });

  /* rotating word */
  var rotor = document.querySelector('.rotor i');
  if (rotor && !RM) {
    var words = (rotor.getAttribute('data-words') || '').split('|');
    var wi = 0;
    setInterval(function () {
      rotor.style.transform = 'translateY(-110%)';
      setTimeout(function () {
        wi = (wi + 1) % words.length;
        rotor.textContent = words[wi];
        rotor.style.transition = 'none';
        rotor.style.transform = 'translateY(110%)';
        void rotor.offsetWidth;
        rotor.style.transition = '';
        rotor.style.transform = 'translateY(0)';
      }, 480);
    }, 3000);
  }

  /* reel: play in view, tap for sound */
  var reel = document.querySelector('.reel video');
  if (reel) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) reel.play().catch(function () {});
        else reel.pause();
      });
    }, { threshold: 0.3 }).observe(reel);
    reel.addEventListener('click', function () {
      reel.muted = !reel.muted;
      var hint = document.querySelector('.reel .hint');
      if (hint) hint.textContent = reel.muted ? 'Tap the reel for sound' : 'Tap to mute';
    });
  }

  /* gentle parallax on showcase phones */
  if (!RM) {
    var phones = Array.prototype.slice.call(document.querySelectorAll('.show .phone'));
    var ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        phones.forEach(function (p) {
          var r = p.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          var mid = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          p.style.translate = '0 ' + (mid * -18).toFixed(1) + 'px';
        });
        ticking = false;
      });
    }, { passive: true });
  }
})();
