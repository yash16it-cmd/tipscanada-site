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

  if (grid && dots) {
    SLIDES.forEach(function (slide, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show figures: ' + slide.label);
      b.innerHTML = '<i></i>';
      b.addEventListener('click', function () { drawSlide(i); });
      dots.appendChild(b);
    });
    drawSlide(0);
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
})();
