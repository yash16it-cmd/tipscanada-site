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
        ['[1,400+]', 'Applications prepared and filed since 2015'],
        ['[4]', 'Licensed consultants on the public register'],
        ['[92%]', 'Of clients came through a personal referral'],
        ['[12]', 'Languages spoken across our small team']
      ]
    },
    {
      label: 'Who we help',
      stats: [
        ['[380+]', 'Families reunited through sponsorship and Super Visas'],
        ['[26]', 'Countries our clients have arrived from'],
        ['[210]', 'Study permits handled for college and university'],
        ['[95%]', 'Of files submitted complete on the first attempt']
      ]
    },
    {
      label: 'Close to home',
      stats: [
        ['[11]', 'Years with an office on Derry Road, Mississauga'],
        ['[600+]', 'Consultations held in Punjabi, Hindi or Urdu'],
        ['[48h]', 'Typical wait for a first assessment call'],
        ['[4.9]', 'Average Google rating across [000] reviews']
      ]
    }
  ];

  var grid = document.getElementById('statGrid');
  var slideLabel = document.getElementById('slideLabel');
  var dots = document.getElementById('dots');

  function drawSlide(i) {
    if (!grid) return;
    var slide = SLIDES[i];
    slideLabel.textContent = slide.label;
    grid.innerHTML = '';
    slide.stats.forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'stat';
      var b = document.createElement('b');
      b.textContent = s[0];
      var sp = document.createElement('span');
      sp.textContent = s[1];
      d.appendChild(b);
      d.appendChild(sp);
      grid.appendChild(d);
    });
    Array.prototype.forEach.call(dots.children, function (btn, n) {
      btn.setAttribute('aria-current', n === i ? 'true' : 'false');
    });
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
      b.addEventListener('click', function () { drawSlide(i); countAll(); });
      dots.appendChild(b);
    });
    drawSlide(0);
    if ('IntersectionObserver' in window) {
      var seen = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { countAll(); seen.disconnect(); }
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
        var a = .35 + .65 * Math.abs(Math.sin(p.t));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 6);
        var col = p.warm ? '255,214,150' : '190,247,238';
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
})();
