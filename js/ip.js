/* ════════════════════════════════════════════
   ip.js  —  IP Lookup Page Logic
   GeoTrack v2.0
════════════════════════════════════════════ */
'use strict';

/* ── LOOKUP IP ───────────────────────────── */
function lookupIP(ipAddr) {
  var url = ipAddr ? (API.ipLookup + ipAddr) : API.ip;

  fetch(url)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.status !== 'success') {
        toast('IP lookup failed: ' + (d.message || 'unknown error'), true);
        return;
      }

      /* Populate result panel */
      setText('ir-ip',     d.ip       || '—');
      setText('ir-city',   d.city     || '—');
      setText('ir-region', d.region   || '—');
      setText('ir-cntry',  d.country  || '—');
      setText('ir-lat',    d.lat != null ? String(d.lat) : '—');
      setText('ir-lng',    d.lon != null ? String(d.lon) : '—');
      setText('ir-isp',    d.isp      || '—');
      setText('ir-org',    d.org      || '—');
      setText('ir-tz',     d.timezone || '—');
      setText('ir-zip',    d.zip      || '—');
      showEl('ip-res');

      /* Plot on map */
      var map = MAPS['ip-map'];
      if (map && d.lat && d.lon) {
        MARKERS.ip = removeMarker(map, MARKERS.ip);
        var label = (d.city || '') + (d.country ? ', ' + d.country : '');
        MARKERS.ip = placeMarker(map, d.lat, d.lon, label || d.ip, '#00f5ff');
        map.setView([d.lat, d.lon], 10);
      }
    })
    .catch(function (e) {
      toast('Network error — server offline?', true);
    });
}

/* ── BUTTON EVENTS ───────────────────────── */
document.addEventListener('DOMContentLoaded', function () {

  /* Lookup button */
  var ipBtn = document.getElementById('ip-btn');
  if (ipBtn) {
    ipBtn.addEventListener('click', function () {
      var v = document.getElementById('ip-in').value.trim();
      lookupIP(v || null);
    });
  }

  /* My IP button */
  var myIpBtn = document.getElementById('myip-btn');
  if (myIpBtn) {
    myIpBtn.addEventListener('click', function () {
      lookupIP(null);
    });
  }

  /* Enter key on IP input */
  var ipInput = document.getElementById('ip-in');
  if (ipInput) {
    ipInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var v = ipInput.value.trim();
        lookupIP(v || null);
      }
    });
  }
});
