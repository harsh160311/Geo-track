/* ════════════════════════════════════════════
   home.js — Home Page Logic
   GeoTrack v2.0 (Multi-page version)
════════════════════════════════════════════ */
'use strict';

document.addEventListener('DOMContentLoaded', function () {
  fetch(API.ip)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.status === 'success') {
        var el = document.getElementById('c1');
        if (el) el.textContent = '~50m';
      }
    })
    .catch(function () {});
});
