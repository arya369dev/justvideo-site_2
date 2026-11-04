(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Header: solid on scroll ---------- */
  var header = document.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-solid', header.hasAttribute('data-solid') || window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector('[data-menu-btn]');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    if (!menuBtn || !nav) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---------- Hero loop ---------- */
  var heroVideo = document.querySelector('[data-hero-video]');
  var toggle = document.querySelector('[data-hero-toggle]');
  var toggleLabel = document.querySelector('[data-hero-toggle-label]');
  var userPaused = false;

  function setToggle(paused) {
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(paused));
    toggleLabel.textContent = paused ? 'Play background video' : 'Pause background video';
  }
  function playHero() {
    if (!heroVideo) return;
    if (heroVideo.preload === 'none') { heroVideo.preload = 'auto'; heroVideo.load(); }
    var p = heroVideo.play();
    if (p && p.catch) p.catch(function () { setToggle(true); });
    setToggle(false);
  }
  function pauseHero() { if (heroVideo) heroVideo.pause(); setToggle(true); }

  if (heroVideo) {
    if (reduceMotion.matches) { setToggle(true); userPaused = true; }
    else { playHero(); }
    toggle && toggle.addEventListener('click', function () {
      if (heroVideo.paused) { userPaused = false; playHero(); } else { userPaused = true; pauseHero(); }
    });
    // Pause when the hero is off screen to save battery.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (userPaused) return;
          if (en.isIntersecting) playHero(); else heroVideo.pause();
        });
      }, { threshold: 0.1 }).observe(heroVideo);
    }
    // Viewfinder timecode follows the loop.
    var tc = document.querySelector('[data-timecode]');
    if (tc) {
      heroVideo.addEventListener('timeupdate', function () {
        var t = heroVideo.currentTime, f = Math.floor((t % 1) * 24), s = Math.floor(t);
        tc.textContent = '00:00:' + String(s).padStart(2, '0') + ':' + String(f).padStart(2, '0');
      });
    }
  }

  /* ---------- Film dialog ---------- */
  var film = document.querySelector('[data-film]');
  var filmVideo = document.querySelector('[data-film-video]');
  var opener = null;
  if (film && typeof film.showModal === 'function') {
    document.querySelectorAll('[data-film-open]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        opener = a;
        if (heroVideo && !heroVideo.paused) heroVideo.pause();
        film.showModal();
        filmVideo.currentTime = 0;
        var p = filmVideo.play(); if (p && p.catch) p.catch(function () {});
      });
    });
    film.addEventListener('close', function () {
      filmVideo.pause();
      if (!userPaused && !reduceMotion.matches) playHero();
      if (opener) opener.focus();
    });
    film.addEventListener('click', function (e) { if (e.target === film) film.close(); });
    document.querySelector('[data-film-close]').addEventListener('click', function () { film.close(); });
  }

  /* ---------- Credits tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-tab]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  if (tabs.length) {
    selectTab(tabs[0], false);
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { selectTab(t, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); selectTab(n, true); }
      });
    });
  }

  /* ---------- Show all posters ---------- */
  var showAll = document.querySelector('[data-show-all]');
  var grid = document.querySelector('[data-collapsible]');
  if (showAll && grid) {
    var label = showAll.textContent;
    showAll.addEventListener('click', function () {
      var open = grid.classList.toggle('is-expanded');
      showAll.setAttribute('aria-expanded', String(open));
      showAll.textContent = open ? 'Show fewer' : label;
    });
  }

  /* ---------- Enquiry form ---------- */
  var form = document.querySelector('[data-enquiry]');
  if (form) {
    var status = form.querySelector('[data-status]');
    var submit = form.querySelector('[data-submit]');
    var checks = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      message: function (v) { return v.trim().length > 4; }
    };
    function validate() {
      var firstBad = null;
      Object.keys(checks).forEach(function (k) {
        var el = form.elements[k], ok = checks[k](el.value), err = document.getElementById('e-' + k);
        el.setAttribute('aria-invalid', String(!ok));
        if (err) { err.hidden = ok; if (!ok) el.setAttribute('aria-describedby', 'e-' + k); else el.removeAttribute('aria-describedby'); }
        if (!ok && !firstBad) firstBad = el;
      });
      return firstBad;
    }
    function fail(msg) {
      status.className = 'form-status bad';
      status.innerHTML = msg + ' Please WhatsApp or call <a href="tel:+919867028666">98670 28666</a>, or email <a href="mailto:justvideobroadcasting@gmail.com">justvideobroadcasting@gmail.com</a>.';
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad) { bad.focus(); status.className = 'form-status bad'; status.textContent = 'Please fix the highlighted fields.'; return; }
      submit.disabled = true; submit.textContent = 'Sending…';
      status.className = 'form-status'; status.textContent = '';
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (res.ok && res.body.ok) {
            form.reset();
            status.className = 'form-status ok';
            status.textContent = 'Thank you. Your enquiry has been sent and we will get back to you soon.';
          } else {
            fail((res.body && res.body.error) || 'Sorry, your enquiry could not be sent.');
          }
        })
        .catch(function () { fail('Sorry, your enquiry could not be sent.'); })
        .then(function () { submit.disabled = false; submit.textContent = 'Send enquiry'; });
    });
  }

  /* ---------- Year ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
