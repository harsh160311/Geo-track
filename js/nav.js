/* ════════════════════════════════════════════
   nav.js — Navigation (Multi-Page version)
   Each page is a separate HTML file.
   Links navigate via href, not showPage().
   GeoTrack v2.0
════════════════════════════════════════════ */
'use strict';

/* ── ACTIVE NAV HIGHLIGHT ────────────────── */
/* Automatically marks current page as active in nav */
(function () {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var map = {
    'index.html':    'nav-home',
    '':              'nav-home',
    'about.html':    'nav-about',
    'tracker.html':  'nav-tracker',
    'fakelink.html': 'nav-fakelink',
    'ip.html':       'nav-ip',
    'contact.html':  'nav-contact'
  };
  var activeId = map[path];
  if (activeId) {
    var el = document.getElementById(activeId);
    if (el) el.classList.add('active');

    /* Also mark mobile nav */
    var mob = document.getElementById('m' + activeId);
    if (mob) mob.classList.add('active');
  }
})();

/* ── HAMBURGER TOGGLE ────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var hb   = document.getElementById('hamburger');
  var mNav = document.getElementById('mobile-nav');
  if (hb && mNav) {
    hb.addEventListener('click', function () {
      mNav.classList.toggle('open');
    });
  }

  /* Close mobile nav on outside click */
  document.addEventListener('click', function (e) {
    if (mNav && !mNav.contains(e.target) && e.target !== hb) {
      mNav.classList.remove('open');
    }
  });

  /* Clock */
  startClock();
});
