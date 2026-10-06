/* N-FINIT DEVELOPMENT — shared interactions (nav, reveals, 3D effects, carousels) */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function onVisible(el, cb, opts) {
    if (!('IntersectionObserver' in window)) { cb(true); return null; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { cb(en.isIntersecting, en); });
    }, opts || { threshold: 0 });
    io.observe(el);
    return io;
  }

  /* ── Navigation ─────────────────────────────────────────────── */
  function initNav() {
    var ham = document.getElementById('ham-btn');
    var menu = document.getElementById('mobile-menu');
    if (ham && menu) {
      var setOpen = function (open) {
        menu.classList.toggle('open', open);
        ham.classList.toggle('open', open);
        ham.setAttribute('aria-expanded', String(open));
        ham.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      };
      ham.addEventListener('click', function () { setOpen(!menu.classList.contains('open')); });
      all('a', menu).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    }

    var links = all('.nav-links .nav-link[href^="#"]');
    var byId = {};
    links.forEach(function (l) {
      var id = l.getAttribute('href').slice(1);
      if (id && document.getElementById(id)) byId[id] = l;
    });
    var ids = Object.keys(byId);
    if (ids.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('active'); });
          byId[en.target.id].classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ids.forEach(function (id) { spy.observe(document.getElementById(id)); });
    }
  }

  /* ── Split headings into animated words ─────────────────────── */
  function splitText(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/([ \t\n\r]+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^[ \t\n\r]+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            var w = document.createElement('span');
            w.className = 'w';
            var wi = document.createElement('span');
            wi.className = 'wi';
            wi.style.setProperty('--i', i++);
            wi.textContent = p;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(el);
    el.classList.add('split');
  }

  /* ── Scroll reveals ─────────────────────────────────────────── */
  function initReveal() {
    if (!reduce) all('[data-split]').forEach(splitText);
    all('.stack-tags').forEach(function (g) {
      all('.tag-pill', g).forEach(function (p, i) { p.style.setProperty('--i', i); });
    });

    var els = all('.fade-up, .rise-3d, .split, .why-row');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ── Count-up numbers ───────────────────────────────────────── */
  function initCounters() {
    all('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (reduce || isNaN(target)) return;
      el.textContent = '0';
      var done = false;
      var io = onVisible(el, function (vis) {
        if (!vis || done) return;
        done = true;
        if (io) io.disconnect();
        var t0 = performance.now(), dur = 1600;
        (function step(now) {
          var p = clamp((now - t0) / dur, 0, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: 0.6 });
    });
  }

  /* ── 3D tilt, spotlight, magnetic buttons ───────────────────── */
  function initPointerFx() {
    if (reduce || !finePointer) return;

    all('[data-tilt]').forEach(function (el) {
      var max = parseFloat(el.getAttribute('data-tilt')) || 6;
      var raf = 0;
      el.addEventListener('pointerenter', function () { el.classList.add('is-tilting'); });
      el.addEventListener('pointermove', function (e) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          var r = el.getBoundingClientRect();
          var x = clamp((e.clientX - r.left) / r.width, 0, 1);
          var y = clamp((e.clientY - r.top) / r.height, 0, 1);
          el.style.setProperty('--ry', ((x - 0.5) * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--rx', ((0.5 - y) * max * 2).toFixed(2) + 'deg');
          el.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.classList.remove('is-tilting');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });

    all('[data-spotlight]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    all('[data-magnetic]').forEach(function (el) {
      el.style.transition = (getComputedStyle(el).transition || '') + ', transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mgx', ((e.clientX - (r.left + r.width / 2)) * 0.22).toFixed(1) + 'px');
        el.style.setProperty('--mgy', ((e.clientY - (r.top + r.height / 2)) * 0.3).toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mgx', '0px');
        el.style.setProperty('--mgy', '0px');
      });
    });
  }

  /* ── Rotating word carousel ─────────────────────────────────── */
  function initRotators() {
    all('[data-rotator]').forEach(function (win) {
      var words = all('.rotator-word', win);
      if (words.length < 2) return;
      var idx = 0;
      var size = function () { win.style.width = Math.ceil(words[idx].getBoundingClientRect().width) + 'px'; };
      win.classList.add('is-ready');
      words[0].classList.add('is-active');
      size();
      window.addEventListener('resize', size, { passive: true });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
      if (reduce) return;
      setInterval(function () {
        if (document.hidden) return;
        var cur = words[idx];
        idx = (idx + 1) % words.length;
        var nxt = words[idx];
        cur.classList.remove('is-active');
        cur.classList.add('is-leaving');
        nxt.classList.remove('is-leaving');
        nxt.classList.add('is-active');
        size();
        setTimeout(function () { cur.classList.remove('is-leaving'); }, 750);
      }, 2600);
    });
  }

  /* ── Hero 3D image orbit ────────────────────────────────────── */
  function initOrbit() {
    var orbit = document.querySelector('[data-orbit]');
    if (!orbit) return;
    var tilt = orbit.querySelector('.orbit-tilt');
    var path = orbit.querySelector('.orbit-path');
    var cards = all('.orbit-card', orbit);
    var dims = cards.map(function (c) { return c.querySelector('.orbit-dim'); });
    var n = cards.length, step = 360 / n;
    var R = 300, angle = 0, base = reduce ? 0 : 0.085, vel = base;
    var dragging = false, lastX = 0, visible = true, raf = 0;

    function layout() {
      var w = orbit.clientWidth;
      var cw = clamp(w * 0.32, 128, 205);
      orbit.style.setProperty('--cw', cw + 'px');
      R = clamp(w * 0.44, 165, 330);
      if (path) {
        path.style.width = path.style.height = (R * 2) + 'px';
        path.style.marginLeft = path.style.marginTop = (-R) + 'px';
        path.style.transform = 'translateY(' + (cw * 0.72) + 'px) rotateX(90deg)';
      }
      render();
    }
    function render() {
      for (var i = 0; i < n; i++) {
        var a = angle + i * step;
        var front = (Math.cos(a * Math.PI / 180) + 1) / 2;
        cards[i].style.transform = 'rotateY(' + a.toFixed(2) + 'deg) translateZ(' + R + 'px)';
        if (dims[i]) dims[i].style.opacity = ((1 - front) * 0.72).toFixed(3);
      }
    }
    function tick() {
      if (!dragging) { angle += vel; vel += (base - vel) * 0.03; }
      render();
      raf = visible ? requestAnimationFrame(tick) : 0;
    }
    function start() { if (!raf) raf = requestAnimationFrame(tick); }

    orbit.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; vel = 0;
      orbit.classList.add('is-dragging');
      try { orbit.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      start();
    });
    orbit.addEventListener('pointermove', function (e) {
      if (dragging) {
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        angle += dx * 0.28;
        vel = dx * 0.28;
        if (reduce) render();
      }
    });
    var end = function () {
      if (!dragging) return;
      dragging = false;
      orbit.classList.remove('is-dragging');
      if (reduce) { vel = 0; render(); }
    };
    orbit.addEventListener('pointerup', end);
    orbit.addEventListener('pointercancel', end);

    var hero = document.getElementById('hero');
    if (hero && finePointer && !reduce && tilt) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.setProperty('--otx', (-7 + y * -10).toFixed(2) + 'deg');
        tilt.style.setProperty('--oty', (x * 16).toFixed(2) + 'deg');
      });
      hero.addEventListener('pointerleave', function () {
        tilt.style.setProperty('--otx', '-7deg');
        tilt.style.setProperty('--oty', '0deg');
      });
    }

    window.addEventListener('resize', layout, { passive: true });
    layout();
    if (reduce) return;
    onVisible(orbit, function (vis) { visible = vis; if (vis) start(); });
    start();
  }

  /* ── Coverflow carousel ─────────────────────────────────────── */
  function initCoverflow() {
    all('[data-coverflow]').forEach(function (root) {
      var cards = all('.cf-card', root);
      var n = cards.length;
      if (n < 2) return;
      var dots = all('.cf-dot', root);
      var prevBtn = root.querySelector('.cf-prev');
      var nextBtn = root.querySelector('.cf-next');
      var INTERVAL = 5500;
      var active = 0, timer = null, inView = false, paused = false;

      root.classList.add('is-ready');
      root.style.setProperty('--cf-int', INTERVAL + 'ms');
      if (reduce) root.classList.add('no-auto');

      function norm(off) { off = ((off % n) + n) % n; if (off > n / 2) off -= n; return off; }
      function apply(card, off, instant) {
        var abs = Math.abs(off);
        var spread = root.clientWidth < 700 ? 74 : 60;
        if (instant) card.style.transition = 'none';
        card.style.transform = 'translateX(' + (off * spread) + '%) translateZ(' + (-abs * 220) + 'px) rotateY(' + (-off * 24) + 'deg)';
        card.style.opacity = abs === 0 ? '1' : (abs === 1 ? '0.6' : '0');
        card.style.zIndex = String(10 - abs);
        card.style.pointerEvents = abs > 1 ? 'none' : 'auto';
        card.classList.toggle('is-active', abs === 0);
        card._off = off;
        if (instant) { void card.offsetWidth; card.style.transition = ''; }
      }
      function render(initial) {
        cards.forEach(function (card, i) {
          var target = norm(i - active);
          clearTimeout(card._t);
          if (initial || card._off === undefined) { apply(card, target, true); return; }
          var prev = card._off;
          var cand = [target - n, target, target + n].reduce(function (a, b) {
            return Math.abs(b - prev) < Math.abs(a - prev) ? b : a;
          });
          if (cand === target) { apply(card, target); return; }
          if (Math.abs(prev) >= 2) {
            apply(card, target + (target >= 0 ? 1 : -1), true);
            apply(card, target);
          } else {
            apply(card, cand);
            card._t = setTimeout(function () { apply(card, target, true); }, 950);
          }
        });
        dots.forEach(function (d, i) {
          var on = i === active;
          d.classList.remove('is-active');
          if (on) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
          if (on) { void d.offsetWidth; d.classList.add('is-active'); }
        });
      }
      function stop() { clearInterval(timer); timer = null; }
      function start() {
        stop();
        if (reduce || !inView || paused) return;
        timer = setInterval(function () { go(active + 1); }, INTERVAL);
      }
      function go(i) {
        active = ((i % n) + n) % n;
        render(false);
        if (timer) start();
      }

      cards.forEach(function (card, i) {
        card.addEventListener('click', function () {
          if (root._dragged) return;
          if (i !== active) { go(i); start(); }
        });
      });
      dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); start(); }); });
      if (prevBtn) prevBtn.addEventListener('click', function () { go(active - 1); start(); });
      if (nextBtn) nextBtn.addEventListener('click', function () { go(active + 1); start(); });
      root.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
      });

      var downX = null;
      root.addEventListener('pointerdown', function (e) { downX = e.clientX; root._dragged = false; });
      root.addEventListener('pointerup', function (e) {
        if (downX === null) return;
        var dx = e.clientX - downX;
        downX = null;
        if (Math.abs(dx) > 45) {
          root._dragged = true;
          go(dx < 0 ? active + 1 : active - 1);
          start();
          setTimeout(function () { root._dragged = false; }, 50);
        }
      });

      var pause = function () { paused = true; root.classList.add('is-paused'); stop(); };
      var resume = function () { paused = false; root.classList.remove('is-paused'); render(false); start(); };
      root.addEventListener('mouseenter', pause);
      root.addEventListener('mouseleave', resume);
      root.addEventListener('focusin', pause);
      root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) resume(); });

      window.addEventListener('resize', function () { render(true); }, { passive: true });
      render(true);
      onVisible(root, function (vis) {
        inView = vis;
        if (vis) { render(false); start(); } else stop();
      }, { threshold: 0.35 });
    });
  }

  /* ── Scroll-linked effects ──────────────────────────────────── */
  function initScrollFx() {
    var navbar = document.getElementById('navbar');
    var bar = document.getElementById('scroll-progress');
    var heroMedia = document.querySelector('.hero-media');
    var heroCopy = document.querySelector('.hero-copy');
    var parallax = all('[data-parallax]');
    var devices = all('[data-device]');
    var stepsEls = all('[data-steps]');
    var mqNarrow = window.matchMedia('(max-width: 1000px)');
    var ticking = false;

    function update() {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      var vh = window.innerHeight;

      if (navbar) {
        var solid = y > 40;
        navbar.classList.toggle('solid', solid);
        navbar.classList.toggle('transparent', !solid);
      }
      if (bar) {
        var max = document.documentElement.scrollHeight - vh;
        bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0).toFixed(4) + ')';
      }

      if (!reduce) {
        if (heroMedia && y < vh * 1.2) heroMedia.style.setProperty('--py', (y * 0.32).toFixed(1) + 'px');
        if (heroCopy && y < vh * 1.2) {
          var hp = clamp(y / (vh * 0.8), 0, 1);
          heroCopy.style.transform = 'translate3d(0,' + (hp * 60).toFixed(1) + 'px,0)';
          heroCopy.style.opacity = (1 - hp * 0.85).toFixed(3);
        }
        parallax.forEach(function (el) {
          var r = el.parentElement.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
          var offset = (r.top + r.height / 2) - vh / 2;
          el.style.setProperty('--py', (-offset * speed).toFixed(1) + 'px');
        });
        devices.forEach(function (el) {
          var r = el.parentElement.getBoundingClientRect();
          var p = clamp((vh - r.top) / (vh * 0.85), 0, 1);
          el.style.setProperty('--dev-rx', ((1 - p) * 24).toFixed(2) + 'deg');
          el.style.setProperty('--dev-s', (0.88 + p * 0.12).toFixed(4));
        });
      }

      stepsEls.forEach(function (list) {
        var r = list.getBoundingClientRect();
        var p;
        if (reduce) p = 1;
        else if (mqNarrow.matches) p = clamp((vh * 0.62 - r.top) / Math.max(r.height - 60, 1), 0, 1);
        else p = clamp((vh * 0.88 - r.top) / (vh * 0.5), 0, 1);
        list.style.setProperty('--p', p.toFixed(4));
        var items = list._items || (list._items = all('.step', list));
        var last = items.length - 1;
        items.forEach(function (s, i) {
          s.classList.toggle('is-on', p >= (last ? i / last : 0) - 0.02);
        });
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  function init() {
    initNav();
    initReveal();
    initCounters();
    initPointerFx();
    initRotators();
    initOrbit();
    initCoverflow();
    initScrollFx();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
