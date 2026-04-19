/* ════════════════════════════════════════════
   tracker.js  —  Tracker Page Logic
   GPS + Coordinate plotting via OSM Nominatim
   GeoTrack v2.0
════════════════════════════════════════════ */
'use strict';

/* ── INIT TRACKER (called by nav.js on first visit) ── */
function initTracker(map) {
  /* Load IP info for device panel */
  fetch(API.ip)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.status === 'success') {
        setText('my-ip',   d.ip   || '—');
        setText('my-isp',  d.isp  || '—');
        setText('my-city', d.city || '—');

        if (d.lat && d.lon) {
          MARKERS.main = removeMarker(map, MARKERS.main);
          MARKERS.main = placeMarker(map, d.lat, d.lon, 'IP: ' + d.city, '#00f5ff');
          map.setView([d.lat, d.lon], 10);
        }
      }
    })
    .catch(function () {});
}

/* ── PLOT COORDINATES ────────────────────── */
function plotCoord(lat, lng) {
  var map = MAPS['main-map'];
  if (!map) return;

  MARKERS.main = removeMarker(map, MARKERS.main);
  MARKERS.main = placeMarker(map, lat, lng, lat.toFixed(5) + ', ' + lng.toFixed(5), '#00f5ff');
  map.setView([lat, lng], 14);

  setText('r-lat', lat.toFixed(6));
  setText('r-lng', lng.toFixed(6));
  showEl('cres');

  /* Reverse geocode via OSM Nominatim */
  fetch(API.reverse + '?lat=' + lat + '&lon=' + lng)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      setText('r-road',  d.road    || '—');
      setText('r-city',  d.city    || '—');
      setText('r-state', d.state   || '—');
      setText('r-cntry', d.country || '—');
      setText('r-acc',   'OSM Nominatim');

      var popup = (d.city || '') + (d.state ? ', ' + d.state : '');
      if (MARKERS.main) {
        MARKERS.main.bindPopup(
          '<span style="font-family:\'Share Tech Mono\',monospace;font-size:.78rem;color:#00f5ff">' +
          popup + '</span>'
        ).openPopup();
      }
    })
    .catch(function () {
      setText('r-acc', 'Geocode failed');
    });
}

/* ── BUTTON EVENTS ───────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  /* Plot button */
  var plotBtn = document.getElementById('plot-btn');
  if (plotBtn) {
    plotBtn.addEventListener('click', function () {
      var lat = parseFloat(document.getElementById('lat-in').value);
      var lng = parseFloat(document.getElementById('lng-in').value);
      if (isNaN(lat) || isNaN(lng)) {
        toast('Valid lat/lng enter karo', true);
        return;
      }
      plotCoord(lat, lng);
    });
  }

  /* GPS button */
  var gpsBtn = document.getElementById('gps-btn');
  if (gpsBtn) {
    gpsBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        toast('GPS is not supported in this browser', true);
        return;
      }
      gpsBtn.textContent = '📡 LOCATING...';
      gpsBtn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        function (pos) {
          gpsBtn.textContent = '📡 USE MY GPS';
          gpsBtn.disabled = false;

          var lat = pos.coords.latitude;
          var lng = pos.coords.longitude;
          var acc = pos.coords.accuracy;

          document.getElementById('lat-in').value = lat.toFixed(6);
          document.getElementById('lng-in').value = lng.toFixed(6);
          setText('my-lat', lat.toFixed(5));
          setText('my-lng', lng.toFixed(5));
          setText('my-acc', acc ? Math.round(acc) + 'm' : '—');
          setText('c1',     acc ? Math.round(acc) + 'm' : '—');

          plotCoord(lat, lng);
        },
        function () {
          gpsBtn.textContent = '📡 USE MY GPS';
          gpsBtn.disabled = false;
          toast('GPS access denied', true);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }

  /* Enter key on inputs */
  ['lat-in', 'lng-in'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          document.getElementById('plot-btn').click();
        }
      });
    }
  });
});
