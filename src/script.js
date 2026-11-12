/* TIPS Immigration — small bits of behaviour.
   Everything here degrades gracefully: with JS off the page still reads and the form still posts. */

(function () {
  'use strict';

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- impact figures ----------
     Edit the numbers and labels here. Square brackets mean "not confirmed yet". */
  var SLIDES = [
    {
      label: 'Since 2015',
      stats: [
        ['1,400+', 'Applications prepared and filed since 2015'],
        ['4', 'Licensed consultants on the public register'],
        ['92%', 'Of clients came through a personal referral'],
        ['12', 'Languages spoken across our small team']
      ]
    },
    {
      label: 'Who we help',
      stats: [
        ['380+', 'Families reunited through sponsorship and Super Visas'],
        ['26', 'Countries our clients have arrived from'],
        ['210', 'Study permits handled for college and university'],
        ['95%', 'Of files submitted complete on the first attempt']
      ]
    },
    {
      label: 'Close to home',
      stats: [
        ['11', 'Years with an office on Derry Road, Mississauga'],
        ['600+', 'Consultations held in Punjabi, Hindi or Urdu'],
        ['48h', 'Typical wait for a first assessment call'],
        ['4.9', 'Average Google rating across [000] reviews']
      ]
    }
  ];

  var grid = document.getElementById('statGrid');
  var slideLabel = document.getElementById('slideLabel');
  var dots = document.getElementById('dots');

  var reduceStats = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0, busy = false, auto = null, hold = false;
  function fill(target, slide) {
    target.innerHTML = '';
    slide.stats.forEach(function (s, k) {
      var d = document.createElement('div');
      d.className = 'stat';
      d.style.setProperty('--i', k);
      d.style.setProperty('--r', (k % 2 ? 5 : -5) + 'deg');
      var b = document.createElement('b');
      b.textContent = s[0];
      var sp = document.createElement('span');
      sp.textContent = s[1];
      d.appendChild(b);
      d.appendChild(sp);
      target.appendChild(d);
    });
  }
  function mark(i) {
    Array.prototype.forEach.call(dots.children, function (btn, n) {
      btn.setAttribute('aria-current', n === i ? 'true' : 'false');
    });
  }
  /* the section keeps the height of its tallest set, so nothing jumps when the cards change */
  function lockHeight() {
    if (!grid) return;
    var probe = grid.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('aria-live');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;min-height:0;width:' + grid.getBoundingClientRect().width + 'px';
    grid.parentNode.appendChild(probe);
    var max = 0;
    SLIDES.forEach(function (sl) { fill(probe, sl); max = Math.max(max, probe.offsetHeight); });
    grid.parentNode.removeChild(probe);
    grid.style.minHeight = max + 'px';
  }
  /* cards are dealt out: the old hand lifts away, the new one drops in and settles */
  function drawSlide(i, animate) {
    if (!grid) return;
    var slide = SLIDES[i];
    if (!animate || reduceStats) {
      current = i; mark(i); slideLabel.textContent = slide.label; fill(grid, slide); return;
    }
    if (busy || i === current) return;
    busy = true; current = i; mark(i);
    grid.classList.add('is-out'); slideLabel.classList.add('is-out');
    setTimeout(function () {
      slideLabel.textContent = slide.label;
      fill(grid, slide);
      grid.classList.remove('is-out'); slideLabel.classList.remove('is-out');
      grid.classList.add('is-in'); slideLabel.classList.add('is-in');
      countAll();
      setTimeout(function () { grid.classList.remove('is-in'); slideLabel.classList.remove('is-in'); busy = false; }, 1000);
    }, 400);
  }

  /* numbers count up when they appear (the final text is always the original) */
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(b) {
    var raw = b.textContent;
    var m = raw.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m || reduceMotion) return;
    var target = parseFloat(m[2].replace(/,/g, ''));
    var dec = (m[2].split('.')[1] || '').length;
    var comma = m[2].indexOf(',') > -1;
    function fmt(v) {
      var s = comma ? v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : v.toFixed(dec);
      return m[1] + s + m[3];
    }
    var t0 = null;
    b.textContent = fmt(0);
    (function tick(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min((ts - t0) / 1100, 1);
      b.textContent = k < 1 ? fmt(target * (1 - Math.pow(1 - k, 3))) : raw;
      if (k < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
  function countAll() {
    Array.prototype.forEach.call(grid.querySelectorAll('.stat b'), countUp);
  }

  if (grid && dots) {
    SLIDES.forEach(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show figures: ' + slide.label);
      b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { drawSlide(i, true); restartAuto(); });
      dots.appendChild(b);
    });
    drawSlide(0, false);
    lockHeight();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockHeight);
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(lockHeight, 150); });

    /* plays by itself; pauses while you hover, focus or touch it, and while it is off screen */
    function stopAuto() { if (auto) { clearInterval(auto); auto = null; } }
    function startAuto() {
      if (reduceStats || hold || auto) return;
      auto = setInterval(function () { drawSlide((current + 1) % SLIDES.length, true); }, 6500);
    }
    function restartAuto() { stopAuto(); startAuto(); }
    var zone = grid.parentNode;
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { zone.addEventListener(ev, function () { hold = true; stopAuto(); }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { zone.addEventListener(ev, function () { hold = false; startAuto(); }); });
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!grid.dataset.counted) { grid.dataset.counted = '1'; countAll(); } startAuto(); } else { stopAuto(); }
      }, { threshold: 0.35 });
      seen.observe(grid);
    }
  }

  /* ---------- open / closed, in Toronto time ---------- */
  var openText = document.getElementById('openText');
  if (openText) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Toronto', weekday: 'short', hour: 'numeric', hour12: false
      }).formatToParts(new Date());
      var day = (parts.find(function (p) { return p.type === 'weekday'; }) || {}).value;
      var hour = parseInt((parts.find(function (p) { return p.type === 'hour'; }) || {}).value, 10);
      var weekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].indexOf(day) > -1;
      openText.textContent = (weekday && hour >= 9 && hour < 19) ? 'Open now' : 'Closed right now';

      var row = document.querySelector(weekday ? '.hours-row[data-day="weekday"]' : '.hours-row[data-day="' + day + '"]');
      if (row) row.classList.add('today');
    } catch (e) {
      openText.textContent = 'Mon–Fri, 9 am – 7 pm ET';
    }
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById('lead');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var ok = true;
      [['f-name', 'e-name'], ['f-phone', 'e-phone']].forEach(function (pair) {
        var input = document.getElementById(pair[0]);
        var err = document.getElementById(pair[1]);
        var empty = !input.value.trim();
        err.hidden = !empty;
        input.setAttribute('aria-invalid', empty ? 'true' : 'false');
        if (empty && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;

      var data = new FormData(form);
      var name = (data.get('name') || '').toString().trim();
      var topic = (data.get('topic') || '').toString();
      data.set('subject', 'New assessment request: ' + name + (topic ? ' · ' + topic : '') + ' (#%{submissionId})');

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      fetch('/', { method: 'POST', body: data })
        .then(function () { form.classList.add('sent'); })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Request my assessment'; }
          alert('Sorry — that did not send. Please call 905-874-8477 and we will take your details over the phone.');
        });
    });
  }

  /* ---------- depth + reveal ----------
     The postcards lean away from the cursor, each by its own amount, using the
     separate CSS "translate" property so it stacks on top of their float animation.
     Reveals fade cards in as they scroll into view. Both stay off for reduced motion. */
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var hero = document.getElementById('top');
  var cards = hero ? hero.querySelectorAll('.pc') : [];
  if (hero && cards.length && !calm && window.matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    var depth = [22, 38, 16, 48, 28, 20];
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
      Array.prototype.forEach.call(cards, function (c, i) {
        var d = depth[i % depth.length];
        c.style.translate = (-nx * d).toFixed(1) + 'px ' + (-ny * d).toFixed(1) + 'px';
      });
    });
    hero.addEventListener('pointerleave', function () {
      Array.prototype.forEach.call(cards, function (c) { c.style.translate = '0px 0px'; });
    });
  }

  if (!calm && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.rev-card, .member, .impact-split');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(targets, function (t, i) {
      t.classList.add('reveal');
      t.style.transitionDelay = ((i % 4) * 90) + 'ms';
      io.observe(t);
    });
    var pf = document.getElementById('pf');
    if (pf) io.observe(pf);
  } else {
    var pfc = document.getElementById('pf'); if (pfc) pfc.classList.remove('reveal');
  }

  /* ---------- light that follows the cursor ---------- */
  if (window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.rev-card, .svc, .stat'), function (n) {
      n.setAttribute('data-glow', '');
    });
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('[data-glow]');
      if (!t) return;
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      t.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  if (!calm && window.matchMedia && window.matchMedia('(hover: hover)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        b.style.translate = (dx * 10).toFixed(1) + 'px ' + (dy * 8).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = '0px 0px'; });
    });
  }

  /* ---------- scroll progress ---------- */
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.setProperty('--p', max > 0 ? Math.min(1, Math.max(0, h.scrollTop / max)).toFixed(4) : 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero: fireflies + cursor spotlight ---------- */
  (function () {
    var h = document.getElementById('top'); var cv = h && h.querySelector('.sparks');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, dpr = 1, ps = [], run = false, mx = -999, my = -999;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = h.clientWidth; H = h.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, Math.max(28, W * H / 16000)));
      ps = [];
      for (var i = 0; i < n; i++) ps.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .5, v: Math.random() * .35 + .12, t: Math.random() * 6.28, s: Math.random() * .02 + .008, warm: Math.random() < .18 });
    }
    function draw(still) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        if (!still) {
          p.t += p.s; p.y -= p.v; p.x += Math.sin(p.t) * .35;
          var dx = p.x - mx, dy = p.y - my, d = dx * dx + dy * dy;
          if (d < 14000) { var f = (1 - d / 14000) * 1.6; p.x += dx / 60 * f; p.y += dy / 60 * f; }
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        }
        var a = (.18 + .5 * Math.abs(Math.sin(p.t))) * (p.warm ? .6 : 1);
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        var col = p.warm ? '212,42,47' : '117,128,235';
        g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 6, 0, 6.2832); ctx.fill();
      }
    }
    function loop() { if (!run) return; draw(false); requestAnimationFrame(loop); }
    size();
    if (calm) { draw(true); } else {
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (en) { var on = en[0].isIntersecting; if (on && !run) { run = true; loop(); } else if (!on) run = false; }).observe(h);
      } else { run = true; loop(); }
    }
    var to; window.addEventListener('resize', function () { clearTimeout(to); to = setTimeout(function () { size(); if (calm) draw(true); }, 150); });
    h.addEventListener('pointermove', function (e) {
      var r = h.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      h.style.setProperty('--sx', mx + 'px'); h.style.setProperty('--sy', my + 'px');
    }, { passive: true });
    h.addEventListener('pointerleave', function () { mx = my = -999; });
  })();

  /* ---------- reviews carousel (left to right) ---------- */
  (function () {
    var tr = document.getElementById('revTrack'); if (!tr) return;
    var cards = tr.querySelectorAll('.rev-card'), dots = document.getElementById('revDots');
    var prev = document.getElementById('revPrev'), next = document.getElementById('revNext');
    var timer = null, paused = false;
    function step() { var c = cards[0]; return c ? c.getBoundingClientRect().width + 22 : 300; }
    function perView() { return Math.max(1, Math.round(tr.clientWidth / step())); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function idx() { return Math.round(tr.scrollLeft / step()); }
    function go(i) { tr.scrollTo({ left: i * step(), behavior: calm ? 'auto' : 'smooth' }); }
    function build() {
      dots.innerHTML = '';
      for (var i = 0; i < pages(); i++) (function (n) {
        var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show review ' + (n + 1));
        b.addEventListener('click', function () { go(n); }); dots.appendChild(b);
      })(i);
      mark();
    }
    function mark() {
      var cur = Math.min(idx(), pages() - 1);
      Array.prototype.forEach.call(dots.children, function (b, n) { b.setAttribute('aria-current', n === cur ? 'true' : 'false'); });
    }
    function advance() { var i = idx(); go(i >= pages() - 1 ? 0 : i + 1); }
    prev.addEventListener('click', function () { var i = idx(); go(i <= 0 ? pages() - 1 : i - 1); restart(); });
    next.addEventListener('click', function () { advance(); restart(); });
    tr.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { if (calm || paused || timer) return; timer = setInterval(advance, 5200); }
    function restart() { stop(); start(); }
    var box = document.getElementById('revCar');
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { box.addEventListener(ev, function () { paused = true; stop(); }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (ev) { box.addEventListener(ev, function () { paused = false; start(); }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else stop(); }, { threshold: 0.3 }).observe(box);
    } else { start(); }
    window.addEventListener('resize', build);
    build();
    if ('IntersectionObserver' in window) {
      tr.classList.add('rev-live');
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.target.classList.toggle('is-on', e.intersectionRatio > 0.6); });
      }, { root: tr, threshold: [0, 0.6, 1] });
      Array.prototype.forEach.call(cards, function (c) { io.observe(c); });
    }
  })();

  /* ---------- sliding pill in the main menu ---------- */
  (function () {
    var nv = document.getElementById('nav'); var pill = nv && nv.querySelector('.nav-pill');
    if (!pill || !window.matchMedia('(hover: hover) and (min-width: 781px)').matches) return;
    function to(a) { pill.style.width = a.offsetWidth + 'px'; pill.style.transform = 'translateX(' + a.offsetLeft + 'px)'; nv.classList.add('hot'); }
    Array.prototype.forEach.call(nv.querySelectorAll('a'), function (a) {
      a.addEventListener('mouseenter', function () { if (!nv.classList.contains('hot')) { pill.style.transition = 'none'; to(a); pill.offsetWidth; pill.style.transition = ''; } else to(a); });
      a.addEventListener('focus', function () { to(a); });
    });
    nv.addEventListener('mouseleave', function () { nv.classList.remove('hot'); });
    nv.addEventListener('focusout', function () { nv.classList.remove('hot'); });
  })();

  /* ---------- header shrinks once you scroll ---------- */
  (function () {
    var hd = document.querySelector('.site-header'); if (!hd) return;
    var on = false;
    function chk() { var y = window.pageYOffset || document.documentElement.scrollTop; var n = on ? y > 12 : y > 60; if (n !== on) { on = n; hd.classList.toggle('is-small', on); } }
    window.addEventListener('scroll', chk, { passive: true }); chk();
  })();

  /* footer arc: one headline runs around a big circle on a loop; the TIPS wordmark
     rides along between the phrases. One rAF loop, paused when off screen,
     static for reduced motion. */
  (function () {
    var arc = document.getElementById('footArc'); if (!arc) return;
    var svg = arc.querySelector('.arc-svg'), path = svg && svg.querySelector('#arcPath'), g = svg && svg.querySelector('#arcG'), meas = svg && svg.querySelector('.arc-m');
    if (!svg || !path || !g || !meas || !path.getTotalLength) return;
    var NS = 'http://www.w3.org/2000/svg', XL = 'http://www.w3.org/1999/xlink';
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var SPEED = 105, GAP = 330, UNITS = 3, PHRASES = ['LICENSED GUIDANCE', 'FOR YOUR JOURNEY'];
    var parts = [], unit = 0, s0 = 0, total = 0, lens = [], running = false, t0 = 0, last = 0, drift = 0, raf = 0;

    function measure(str) { meas.textContent = str; return meas.getComputedTextLength(); }
    function build() {
      while (g.firstChild) g.removeChild(g.firstChild);
      parts = []; total = path.getTotalLength();
      lens = PHRASES.map(measure);
      unit = lens[0] + lens[1] + GAP * 2;
      s0 = Math.max(total / 2 - 1000, unit + 20);
      for (var k = 0; k < UNITS; k++) {
        var at = k * unit;
        [0, 1].forEach(function (i) {
          var t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'arc-t');
          var tp = document.createElementNS(NS, 'textPath'); tp.setAttributeNS(XL, 'href', '#arcPath'); tp.setAttribute('href', '#arcPath');
          tp.textContent = PHRASES[i]; t.appendChild(tp); g.appendChild(t);
          var off = at + (i ? lens[0] + GAP : 0);
          parts.push({ el: tp, off: off, kind: 'text' });
          var lg = document.createElementNS(NS, 'use'); lg.setAttribute('class', 'arc-logo-use'); lg.setAttribute('href', '#arcLogo'); lg.setAttributeNS(XL, 'href', '#arcLogo'); g.appendChild(lg);
          parts.push({ el: lg, off: off + lens[i] + GAP / 2, kind: 'logo' });
        });
      }
    }
    function draw(d) {
      var s = s0 - (d % unit);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], pos = s + p.off;
        if (p.kind === 'text') p.el.setAttribute('startOffset', pos.toFixed(1));
        else {
          var L = Math.min(Math.max(pos, 0), total - 2), a = path.getPointAtLength(L), b = path.getPointAtLength(L + 1);
          p.el.setAttribute('transform', 'translate(' + a.x.toFixed(1) + ' ' + a.y.toFixed(1) + ') rotate(' + (Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI).toFixed(2) + ')');
        }
      }
    }
    function tick(now) {
      if (!running) return;
      if (!last) last = now;
      drift += (now - last) / 1000 * SPEED; last = now; draw(drift);
      raf = requestAnimationFrame(tick);
    }
    function start() { if (still || running) return; running = true; last = 0; raf = requestAnimationFrame(tick); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function init() { build(); draw(drift); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init); else init();
    init();

    /* settle-in when first seen, then run only while visible */
    if (!('IntersectionObserver' in window)) { arc.classList.add('is-on'); start(); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (e.isIntersecting) { arc.classList.add('is-on'); start(); } else stop();
    }); }, { threshold: 0.15 }).observe(arc);
  })();
})();
