/* ════════════════════════════════════════════
   maps.js  —  Leaflet Map Init + Markers
   OpenStreetMap tiles only
   (Google Satellite toggle removed — March 19 2026 commit)
════════════════════════════════════════════ */
'use strict';

/* Global map instances */
var MAPS = {};

/* Global marker refs */
var MARKERS = {
  main: null,
  ip:   null,
  cap:  []
};

/* ── OSM TILE LAYER ──────────────────────── */
/* OpenStreetMap tiles (Google Satellite toggle removed in latest version) */
function createOsmLayer() {
  return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  });
}

/* ── MAP INIT ────────────────────────────── */
function initMap(containerId, lat, lng, zoom) {
  if (MAPS[containerId]) return MAPS[containerId];

  var m = L.map(containerId, {
    zoomControl: true,
    attributionControl: true
  }).setView([lat, lng], zoom || 5);

  createOsmLayer().addTo(m);

  /* ResizeObserver — fixes tiles on panel resize / page switch */
  var container = document.getElementById(containerId);
  if (container && typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function () { m.invalidateSize(); }).observe(container);
  }

  MAPS[containerId] = m;
  return m;
}

/* ── PLACE MARKER ────────────────────────── */
function placeMarker(map, lat, lng, label, color) {
  var icon = L.divIcon({
    className: '',
    html: [
      '<div style="',
        'width:14px;height:14px;border-radius:50%;',
        'background:', color, ';',
        'border:2px solid #fff;',
        'box-shadow:0 0 10px ', color,
      '"></div>'
    ].join(''),
    iconSize:   [14, 14],
    iconAnchor: [7,  7]
  });

  var mk = L.marker([lat, lng], { icon: icon }).addTo(map);

  if (label) {
    mk.bindPopup(
      '<span style="font-family:\'Share Tech Mono\',monospace;font-size:.78rem;color:#00f5ff">' +
      label + '</span>'
    );
  }
  return mk;
}

/* ── REMOVE MARKER SAFELY ────────────────── */
function removeMarker(map, mk) {
  if (mk && map) {
    try { map.removeLayer(mk); } catch (e) {}
  }
  return null;
}
