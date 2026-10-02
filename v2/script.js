/* ============================================================
   Shivnath Gujar — v2 interactions. Vanilla JS, no deps.
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) document.body.classList.add('touch');

  // shared state — "calm" disables heavy motion; persisted per visitor
  var state = { calm: false };
  try { state.calm = localStorage.getItem('sg-calm') === '1'; } catch (e) {}
  if (reduce) state.calm = true;
  function applyCalm() {
    document.body.classList.toggle('calm', state.calm);
    var btn = document.getElementById('calmToggle');
    if (btn) btn.setAttribute('aria-pressed', state.calm ? 'true' : 'false');
    if (state.calm) document.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); });
  }
  function offMotion() { return state.calm || reduce; }

  var mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  document.body.classList.add('ready');
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- calm toggle + hamburger ---------- */
  (function controls() {
    var calmBtn = document.getElementById('calmToggle');
    applyCalm();
    if (calmBtn) calmBtn.addEventListener('click', function () {
      state.calm = !state.calm;
      try { localStorage.setItem('sg-calm', state.calm ? '1' : '0'); } catch (e) {}
      applyCalm();
    });
    var hamb = document.getElementById('hamb'), nav = document.getElementById('nav');
    if (hamb && nav) {
      hamb.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      nav.querySelectorAll('.nav-links a').forEach(function (a) {
        a.addEventListener('click', function () { nav.classList.remove('open'); hamb.setAttribute('aria-expanded', 'false'); });
      });
    }
  })();

  /* ---------- custom cursor ---------- */
  (function cursor() {
    if (isTouch) return;
    var ring = document.getElementById('cursor'), dot = document.getElementById('cursorDot');
    var rx = mouse.x, ry = mouse.y;
    function loop() {
      if (!state.calm) {
        rx += (mouse.x - rx) * 0.18; ry += (mouse.y - ry) * 0.18;
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
        dot.style.transform = 'translate(' + mouse.x + 'px,' + mouse.y + 'px) translate(-50%,-50%)';
      }
      requestAnimationFrame(loop);
    }
    loop();
    var sel = 'a,button,[data-magnetic],.card,.frame';
    document.addEventListener('mouseover', function (e) { if (e.target.closest(sel)) ring.classList.add('grow'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest(sel)) ring.classList.remove('grow'); });
  })();

  /* ---------- particle field (lighter + pausable) ---------- */
  (function field() {
    if (reduce) return;
    var cv = document.getElementById('field'), ctx = cv.getContext('2d');
    var dpr = Math.min(devicePixelRatio || 1, 2), w, h, pts;
    function resize() {
      w = cv.width = innerWidth * dpr; h = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
      var n = Math.min(60, Math.floor(innerWidth * innerHeight / 24000));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .22 * dpr, vy: (Math.random() - .5) * .22 * dpr });
    }
    resize();
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); });
    var LINK = 118 * dpr, MR = 140 * dpr;
    function tick() {
      requestAnimationFrame(tick);
      if (state.calm || document.hidden) { ctx.clearRect(0, 0, w, h); return; }
      ctx.clearRect(0, 0, w, h);
      var mx = mouse.x * dpr, my = mouse.y * dpr;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i]; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        var dxm = p.x - mx, dym = p.y - my, dm = Math.hypot(dxm, dym);
        if (dm < MR && dm > 0.1) { var f = (MR - dm) / MR * 0.6; p.x += dxm / dm * f; p.y += dym / dm * f; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 * dpr, 0, 6.2832);
        ctx.fillStyle = 'rgba(255,106,43,.5)'; ctx.fill();
      }
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (1 - d / LINK) * 0.09 + ')'; ctx.lineWidth = dpr * 0.6;
            ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(pts[b].x, pts[b].y); ctx.stroke();
          }
        }
        var dmx = pts[a].x - mx, dmy = pts[a].y - my, dmd = Math.hypot(dmx, dmy);
        if (dmd < LINK * 1.4) {
          ctx.strokeStyle = 'rgba(83,224,198,' + (1 - dmd / (LINK * 1.4)) * 0.2 + ')'; ctx.lineWidth = dpr * 0.7;
          ctx.beginPath(); ctx.moveTo(pts[a].x, pts[a].y); ctx.lineTo(mx, my); ctx.stroke();
        }
      }
    }
    tick();
  })();

  /* ---------- turbine disc ---------- */
  (function turbine() {
    var blades = document.getElementById('blades'), ticks = document.getElementById('ringTicks');
    var disc = document.getElementById('disc');
    if (!blades) return;
    var svgNS = 'http://www.w3.org/2000/svg';
    for (var i = 0; i < 48; i++) {
      var ang = (i / 48) * Math.PI * 2, r1 = 150, r2 = 178, cx = 200, cy = 200;
      var ln = document.createElementNS(svgNS, 'line');
      ln.setAttribute('x1', cx + Math.cos(ang) * r1); ln.setAttribute('y1', cy + Math.sin(ang) * r1);
      ln.setAttribute('x2', cx + Math.cos(ang) * r2); ln.setAttribute('y2', cy + Math.sin(ang) * r2);
      blades.appendChild(ln);
    }
    if (reduce) return;
    var angB = 0, angT = 0, vel = 0, lastY = scrollY, lastT = performance.now();
    window.addEventListener('scroll', function () {
      var now = performance.now(), dy = scrollY - lastY, dt = Math.max(16, now - lastT);
      vel += Math.min(Math.abs(dy) / dt * 14, 24); lastY = scrollY; lastT = now;
    }, { passive: true });
    function spin() {
      requestAnimationFrame(spin);
      if (state.calm) return;
      vel *= 0.94; var speed = 0.25 + vel; angB += speed; angT -= speed * 0.5;
      blades.setAttribute('transform', 'rotate(' + angB + ' 200 200)');
      ticks.setAttribute('transform', 'rotate(' + angT + ' 200 200)');
    }
    spin();
    var hv = document.getElementById('heroVisual');
    if (hv) window.addEventListener('mousemove', function (e) {
      if (state.calm) { disc.style.transform = ''; return; }
      var cx = innerWidth / 2, cy = innerHeight / 2;
      disc.style.transform = 'perspective(900px) rotateX(' + ((e.clientY - cy) / cy * -6) + 'deg) rotateY(' + ((e.clientX - cx) / cx * 6) + 'deg)';
    }, { passive: true });
  })();

  /* ---------- reveal ---------- */
  (function reveal() {
    var els = document.querySelectorAll('.reveal');
    if (offMotion() || !('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          var sib = [].indexOf.call(en.target.parentNode.children, en.target);
          en.target.style.transitionDelay = Math.min(sib * 70, 280) + 'ms';
          en.target.classList.add('in'); io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: .12 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- count up ---------- */
  (function counts() {
    var els = document.querySelectorAll('[data-count]');
    function run(el) {
      var to = parseFloat(el.getAttribute('data-to')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      if (offMotion()) { el.textContent = pre + to.toFixed(dec) + suf; return; }
      var start = performance.now(), dur = 1400;
      function step(now) {
        var t = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - t, 3);
        el.textContent = pre + (to * e).toFixed(dec) + suf;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: .5 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ---------- magnetic ---------- */
  (function magnetic() {
    if (isTouch || reduce) return;
    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (state.calm) return;
        var r = el.getBoundingClientRect();
        el.style.transform = 'translate(' + (e.clientX - (r.left + r.width / 2)) * 0.25 + 'px,' + (e.clientY - (r.top + r.height / 2)) * 0.35 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();

  /* ---------- 3D tilt ---------- */
  (function tilt() {
    if (isTouch || reduce) return;
    document.querySelectorAll('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        if (state.calm) return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(800px) rotateY(' + px * 7 + 'deg) rotateX(' + (-py * 7) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();

  /* ---------- nav stuck + spy + progress ---------- */
  (function nav() {
    var navEl = document.getElementById('nav'), prog = document.getElementById('progress');
    var links = [].slice.call(document.querySelectorAll('.nav-links a'));
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    function onScroll() {
      navEl.classList.toggle('stuck', scrollY > 40);
      var dh = document.documentElement.scrollHeight - innerHeight;
      prog.style.width = (dh > 0 ? scrollY / dh * 100 : 0) + '%';
      var mid = scrollY + innerHeight * 0.35, act = -1;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= mid) act = i; });
      links.forEach(function (l, i) { l.classList.toggle('active', i === act); });
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  })();

  /* ---------- skills ticker ---------- */
  (function ticker() {
    var el = document.getElementById('ticker'); if (!el) return;
    var items = ['Process optimization', 'Problem-solving', 'Business case development',
      'Data analytics', 'Stakeholder management', 'Prompt engineering', 'Performance diagnosis'];
    function block(alt) {
      var s = '';
      items.forEach(function (it, i) { s += '<span class="chip' + ((i + (alt ? 1 : 0)) % 2 ? ' alt' : '') + '">' + it + '</span><span class="dot">✦</span>'; });
      return s;
    }
    el.innerHTML = block(0) + block(1);
    var x = 0, half = 0;
    requestAnimationFrame(function m() {
      requestAnimationFrame(m);
      if (offMotion()) return;
      if (!half) half = el.scrollWidth / 2;
      x -= 0.6; if (-x >= half) x = 0;
      el.style.transform = 'translateX(' + x + 'px)';
    });
  })();

  /* ---------- frames: native scroll + auto-drift + drag + lightbox ---------- */
  (function frames() {
    var track = document.getElementById('mtrack'), wrap = document.getElementById('marquee');
    if (!track) return;
    var base = '../assets/img/gallery/';
    var imgs = [
      ['work-controlroom.jpg', 'Fleet-monitoring control room · Adani'],
      ['dl-award.jpg', 'Receiving the Director’s List certificate'],
      ['isc-team.jpg', 'Team Fourward · The Fresh Connection runner-up'],
      ['work-plantvisit.jpg', 'Guiding a plant visit · Adani'],
      ['ky-team.jpg', 'Karma Yoga field study · Tamil Nadu'],
      ['campus-onam.jpg', 'Onam with the cohort · Great Lakes'],
      ['hyrox.jpg', 'Hyrox · 1st runner-up'],
      ['work-boiler.jpg', 'Inside a coal-fired boiler furnace'],
      ['campus-cohort.jpg', 'The PGPM cohort · Great Lakes'],
      ['sport-cricket.jpg', 'On the cricket pitch'],
      ['dl-group.jpg', 'Director’s List, with faculty & awardees'],
      ['ky-paddy.jpg', 'Paddy fields · Natham Kariyacheri']
    ];
    function build(fig, deco) {
      var f = document.createElement('figure'); f.className = 'frame';
      if (deco) f.setAttribute('aria-hidden', 'true');
      var im = document.createElement('img'); im.src = base + fig[0]; im.alt = deco ? '' : fig[1]; im.loading = 'lazy'; im.draggable = false;
      var cap = document.createElement('figcaption'); cap.textContent = fig[1];
      f.appendChild(im); f.appendChild(cap); return f;
    }
    imgs.forEach(function (fig) { track.appendChild(build(fig, false)); });
    imgs.forEach(function (fig) { track.appendChild(build(fig, true)); });

    var half = 0, dragging = false, startX = 0, startScroll = 0, moved = 0, idle = 0;
    function recalc() { half = track.scrollWidth / 2; }
    recalc(); window.addEventListener('resize', recalc);
    function wrapScroll() { if (!half) return; if (wrap.scrollLeft >= half) wrap.scrollLeft -= half; else if (wrap.scrollLeft <= 0) wrap.scrollLeft += half; }
    requestAnimationFrame(function drift() {
      requestAnimationFrame(drift);
      if (offMotion() || dragging || idle > 0) { if (idle > 0) idle--; return; }
      wrap.scrollLeft += 0.65; wrapScroll();
    });
    function poke() { idle = 110; }
    wrap.addEventListener('mouseenter', poke);
    wrap.addEventListener('scroll', wrapScroll, { passive: true });
    wrap.addEventListener('wheel', function (e) {
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
      if (d) { wrap.scrollLeft += d; poke(); }
    }, { passive: true });
    wrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      dragging = true; moved = 0; startX = e.clientX; startScroll = wrap.scrollLeft;
      wrap.classList.add('drag'); wrap.setPointerCapture(e.pointerId); poke();
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!dragging) return; var d = e.clientX - startX; moved = Math.max(moved, Math.abs(d));
      wrap.scrollLeft = startScroll - d; poke();
    });
    function endDrag() { dragging = false; wrap.classList.remove('drag'); poke(); }
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
    wrap.addEventListener('touchstart', poke, { passive: true });
    wrap.addEventListener('touchmove', poke, { passive: true });

    // lightbox
    var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'), lbX = document.getElementById('lbX');
    var lastFocus = null;
    track.addEventListener('click', function (e) {
      if (moved > 6) return;
      var im = e.target.closest('img'); if (!im || !im.alt) return;
      lastFocus = document.activeElement;
      lbImg.src = im.src; lbImg.alt = im.alt;
      lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden'; lbX.focus();
    });
    function close() {
      lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = '';
      document.body.style.overflow = ''; if (lastFocus) lastFocus.focus();
    }
    lbX.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) close(); });
  })();

})();
