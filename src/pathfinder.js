/* TIPS Immigration — Pathfinder.
   Three taps, then a typical route draws itself. Nothing here is an eligibility
   assessment: wording stays on "may", "typical" and "depends", on purpose
   (CICC advertising rules). Edit the ROUTES below to change what visitors see.

   Without JavaScript this whole section is hidden (see .pathfinder in styles.css)
   and the page works as before. */

(function () {
  'use strict';

  var root = document.getElementById('pf');
  if (!root) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- content ---------- */
  var GOALS = {
    study:  { label: 'Study',           sub: 'College or university',                      topic: 'Study permit' },
    work:   { label: 'Work',            sub: 'A work permit or a job offer',               topic: 'Work permit or LMIA' },
    visit:  { label: 'Visit',           sub: 'Visitor visa, or Super Visa for parents',    topic: 'Visitor visa or Super Visa' },
    stay:   { label: 'Stay for good',   sub: 'Permanent residence',                        topic: 'Permanent residence' },
    family: { label: 'Bring my family', sub: 'Sponsor a spouse, partner, child or parent', topic: 'Family sponsorship' }
  };

  var WHERE = {
    abroad: { label: 'Outside Canada',  sub: 'Applying from another country' },
    inside: { label: 'Already in Canada', sub: 'Here on a permit or visa today' }
  };

  var WHEN = {
    soon:    { label: 'Within 3 months',   sub: 'I have a date in mind',
               line: 'You are starting soon, so a short call this week can save you time.' },
    mid:     { label: 'In 3 to 12 months', sub: 'Planning ahead',
               line: 'Good timing: enough room to plan the route properly.' },
    explore: { label: 'Just exploring',    sub: 'No rush, I want options',
               line: 'No rush. A first call is free and there is no obligation.' }
  };

  var ROUTES = {
    study: {
      abroad: [
        ['Choose a school and programme', 'Pick a designated learning institution and a programme that fits your goals.'],
        ['Apply for a study permit', 'We prepare the application and the supporting documents with you.'],
        ['Study in Canada', 'Arrive, settle in and keep your status in good order.'],
        ['Post-Graduation Work Permit', 'Eligible graduates may be able to work in Canada after finishing.'],
        ['Permanent residence', 'Canadian study and work experience can open Express Entry and provincial routes.']
      ],
      inside: [
        ['Check your current status', 'Confirm how long your permit lasts and what it allows.'],
        ['Extend or change your permit', 'Keep studying, or switch programme or school, without a gap.'],
        ['Finish your programme', 'Stay on track with the conditions of your permit.'],
        ['Post-Graduation Work Permit', 'Eligible graduates may be able to work in Canada after finishing.'],
        ['Permanent residence', 'Canadian study and work experience can open Express Entry and provincial routes.']
      ]
    },
    work: {
      abroad: [
        ['Find the right permit route', 'Employer-supported, open and programme-specific permits all work differently.'],
        ['Apply for a work permit', 'A complete, well-organised file from the start.'],
        ['Work and build Canadian experience', 'Experience in Canada can strengthen a later permanent residence profile.'],
        ['Express Entry or a provincial nomination', 'Look at the permanent routes your profile may suit.'],
        ['Permanent residence', 'The step many people are working towards.']
      ],
      inside: [
        ['Check your status', 'Confirm the permit you hold, when it expires and its conditions.'],
        ['Extend or change your permit', 'Keep working legally while the next step is planned.'],
        ['Build Canadian experience', 'It counts towards several permanent residence routes.'],
        ['Express Entry or a provincial nomination', 'Look at the permanent routes your profile may suit.'],
        ['Permanent residence', 'The step many people are working towards.']
      ]
    },
    visit: {
      abroad: [
        ['Choose the right visa', 'A visitor visa, or the Super Visa for parents and grandparents.'],
        ['Prepare a strong application', 'Purpose of travel, funds and ties to home, clearly documented.'],
        ['Apply and track', 'We submit it and keep an eye on it with you.'],
        ['Visit, and extend if needed', 'If plans change, an extension may be possible.']
      ],
      inside: [
        ['Check how long you may stay', 'Confirm the date on your status before it matters.'],
        ['Apply to extend your stay', 'Done in good time and with the right documents.'],
        ['Plan what comes next', 'If you hope to stay longer, we look at the other routes together.']
      ]
    },
    stay: {
      abroad: [
        ['See which programmes may suit you', 'Express Entry, provincial nominations and other routes.'],
        ['Build your profile', 'Language tests, credential assessment and documents.'],
        ['Enter the pool or apply', 'Submit once the profile is ready and accurate.'],
        ['Receive an invitation, if selected', 'Invitations depend on your profile and on the draws.'],
        ['Permanent residence', 'Then, in time, Canadian citizenship.']
      ],
      inside: [
        ['See which programmes may suit you', 'Express Entry, provincial nominations and other routes.'],
        ['Use your Canadian experience', 'Work and study in Canada can strengthen your profile.'],
        ['Enter the pool or apply', 'Submit once the profile is ready and accurate.'],
        ['Receive an invitation, if selected', 'Invitations depend on your profile and on the draws.'],
        ['Permanent residence', 'Then, in time, Canadian citizenship.']
      ]
    },
    family: {
      abroad: [
        ['Confirm who can sponsor whom', 'Rules differ for spouses, partners, children and parents.'],
        ['Prepare the sponsorship package', 'Forms, proof of the relationship and financial documents.'],
        ['Submit and track', 'Complete the first time, so there are fewer delays.'],
        ['Reunite in Canada', 'Permanent residence for your family member, once approved.']
      ],
      inside: [
        ['Confirm who can sponsor whom', 'Rules differ for spouses, partners, children and parents.'],
        ['Prepare the sponsorship package', 'Forms, proof of the relationship and financial documents.'],
        ['Keep status in order while you wait', 'Make sure nothing lapses during the process.'],
        ['Permanent residence', 'For your family member, once approved.']
      ]
    }
  };

  /* what the route panel shows before anyone answers */
  var GHOST = [
    ['Where you start', 'Your status, your goals, your timing.'],
    ['The right application', 'The permit or programme that fits.'],
    ['Life and work in Canada', 'Building your foundation here.'],
    ['Permanent residence', 'The destination for many.']
  ];

  var QUESTIONS = [
    { key: 'goal', text: function () { return 'What are you hoping to do in Canada?'; }, options: GOALS },
    { key: 'where', text: function (a) { return a.goal === 'family' ? 'Where is the person being sponsored right now?' : 'Where are you right now?'; }, options: WHERE },
    { key: 'when', text: function () { return 'When would you like to get started?'; }, options: WHEN }
  ];

  /* ---------- elements ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var elStep = $('pfStep'), elQ = $('pfQ'), elOpts = $('pfOptions'), elBack = $('pfBack');
  var elStages = $('pfStages'), elLabel = $('pfRouteLabel'), elTags = $('pfTags');
  var elCta = $('pfCta'), elGo = $('pfGo'), elReset = $('pfReset'), elStatus = $('pfStatus');
  var bars = root.querySelectorAll('.pf-progress i');

  var answers = {};
  var step = 0;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- route panel ---------- */
  function drawStages(list, ghost) {
    elStages.innerHTML = '';
    elStages.className = 'pf-stages' + (ghost ? ' ghost' : ' live');
    list.forEach(function (s, i) {
      var li = el('li', 'pf-stage' + (i === list.length - 1 ? ' last' : ''));
      li.style.setProperty('--i', i);
      var node = el('span', 'pf-node', ghost ? '' : String(i + 1));
      node.setAttribute('aria-hidden', 'true');
      var body = el('div', 'pf-body');
      body.appendChild(el('strong', null, s[0]));
      body.appendChild(el('span', null, s[1]));
      li.appendChild(node);
      li.appendChild(body);
      elStages.appendChild(li);
    });
  }

  function drawTags() {
    elTags.innerHTML = '';
    ['goal', 'where', 'when'].forEach(function (k) {
      if (!answers[k]) return;
      var map = k === 'goal' ? GOALS : k === 'where' ? WHERE : WHEN;
      elTags.appendChild(el('span', 'pf-tag', map[answers[k]].label));
    });
  }

  function updateRoute() {
    if (!answers.goal) {
      elLabel.textContent = 'Your route will draw here';
      elTags.innerHTML = '';
      drawStages(GHOST, true);
      return;
    }
    var variant = answers.where || 'abroad';
    elLabel.textContent = 'Your typical route';
    drawStages(ROUTES[answers.goal][variant], false);
    drawTags();
  }

  /* ---------- question panel ---------- */
  function setProgress(n) {
    Array.prototype.forEach.call(bars, function (b, i) { b.classList.toggle('on', i < n); });
  }

  function renderQuestion() {
    var q = QUESTIONS[step];
    elStep.textContent = 'Question ' + (step + 1) + ' of 3';
    elQ.textContent = q.text(answers);
    elOpts.innerHTML = '';
    Object.keys(q.options).forEach(function (k) {
      var o = q.options[k];
      var b = el('button', 'pf-opt');
      b.type = 'button';
      b.setAttribute('aria-pressed', answers[q.key] === k ? 'true' : 'false');
      b.appendChild(el('strong', null, o.label));
      b.appendChild(el('span', null, o.sub));
      b.addEventListener('click', function () { choose(q.key, k, b); });
      elOpts.appendChild(b);
    });
    elBack.hidden = step === 0;
    elCta.hidden = true;
    elOpts.classList.remove('done');
    setProgress(step);
    elStatus.textContent = 'Question ' + (step + 1) + ' of 3. ' + q.text(answers);
  }

  function choose(key, value, btn) {
    answers[key] = value;
    Array.prototype.forEach.call(elOpts.children, function (c) { c.setAttribute('aria-pressed', c === btn ? 'true' : 'false'); });
    updateRoute();
    setProgress(step + 1);
    window.setTimeout(function () {
      step += 1;
      if (step < QUESTIONS.length) { renderQuestion(); elQ.focus({ preventScroll: true }); }
      else { finish(); }
    }, reduce ? 0 : 320);
  }

  function finish() {
    var w = WHEN[answers.when];
    elStep.textContent = 'Your route is ready';
    elQ.textContent = w.line;
    elOpts.innerHTML = '';
    elOpts.classList.add('done');

    var sum = el('ul', 'pf-sum');
    [['What', GOALS[answers.goal].label], ['From', WHERE[answers.where].label], ['When', w.label]].forEach(function (r) {
      var li = el('li');
      li.appendChild(el('span', null, r[0]));
      li.appendChild(el('strong', null, r[1]));
      sum.appendChild(li);
    });
    elOpts.appendChild(sum);
    var edit = el('button', 'pf-link', 'Change my answers');
    edit.type = 'button';
    edit.addEventListener('click', function () { step = 0; renderQuestion(); });
    elOpts.appendChild(edit);

    elBack.hidden = true;
    elCta.hidden = false;
    setProgress(3);
    elQ.focus({ preventScroll: true });
    elStatus.textContent = 'Your typical route to Canada is ready. ' + w.line;

    /* on a phone the route sits below the answers: bring it into view so the drawing is seen */
    if (window.innerWidth <= 900) {
      var panel = root.querySelector('.pf-route');
      if (panel) panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function reset() {
    answers = {};
    step = 0;
    updateRoute();
    renderQuestion();
    elQ.focus({ preventScroll: true });
  }

  elBack.addEventListener('click', function () {
    if (step === 0) return;
    step -= 1;
    renderQuestion();
  });
  elReset.addEventListener('click', reset);

  /* ---------- hand-off to the booking form ---------- */
  elGo.addEventListener('click', function () {
    var topic = document.querySelector('#lead select[name="topic"]');
    var hidden = $('f-pathway');
    if (topic && answers.goal) {
      Array.prototype.forEach.call(topic.options, function (o) {
        if (o.text === GOALS[answers.goal].topic) topic.value = o.value || o.text;
      });
    }
    if (hidden && answers.goal) {
      hidden.value = [GOALS[answers.goal].label, WHERE[answers.where].label, WHEN[answers.when].label].join(' · ');
    }
    window.setTimeout(function () {
      var name = $('f-name');
      if (name) name.focus({ preventScroll: true });
    }, reduce ? 50 : 800);
  });

  updateRoute();
  renderQuestion();
})();
