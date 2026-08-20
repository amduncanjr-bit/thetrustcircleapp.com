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

/* ── manifesto: split words, fill by scroll progress ── */
(function(){
  var mt = document.getElementById('mtext');
  if(!mt) return;
  var words = mt.textContent.trim().split(/\s+/);
  mt.innerHTML = words.map(function(w){ return '<span class="mw">'+w+'</span>'; }).join(' ');
  var spans = mt.querySelectorAll('.mw');
  var sec = mt.closest('.manifesto');
  var mq = window.matchMedia('(min-width:900px)');
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(rm) { spans.forEach(function(s){ s.classList.add('lit'); }); return; }
  function tick(){
    if(!mq.matches) return;
    var r = sec.getBoundingClientRect();
    var total = r.height - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
    var lit = Math.round(p * spans.length * 1.15);
    spans.forEach(function(s, i){ s.classList.toggle('lit', i < lit); });
  }
  addEventListener('scroll', tick, {passive:true});
  addEventListener('resize', tick);
  tick();
})();

/* ── walkthrough: scroll drives active step + phone shot ── */
(function(){
  var walk = document.getElementById('walk');
  if(!walk) return;
  var steps = walk.querySelectorAll('.wstep');
  var shots = walk.querySelectorAll('.wshot');
  var dots  = walk.querySelectorAll('.wdot');
  var mq = window.matchMedia('(min-width:900px)');
  var cur = 0;
  function setActive(i){
    if(i === cur) return;
    cur = i;
    steps.forEach(function(s, j){ s.classList.toggle('act', j === i); });
    shots.forEach(function(s, j){ s.classList.toggle('on', j === i); });
    dots.forEach(function(d, j){ d.classList.toggle('on', j === i); });
  }
  function tick(){
    if(!mq.matches) return;
    var r = walk.getBoundingClientRect();
    var total = r.height - innerHeight;
    var p = Math.min(0.999, Math.max(0, -r.top / (total || 1)));
    setActive(Math.floor(p * steps.length));
  }
  addEventListener('scroll', tick, {passive:true});
  addEventListener('resize', tick);
  tick();
})();

/* ── hero reel: ensure muted autoplay actually starts ── */
(function(){
  var v = document.querySelector('.hero-phone video');
  if(!v) return;
  var kick = function(){ v.play().catch(function(){}); };
  kick();
  addEventListener('touchstart', kick, {once:true, passive:true});
  addEventListener('click', kick, {once:true});
})();
