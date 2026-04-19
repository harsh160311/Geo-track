/* ════════════════════════════════════════════
   config.js  —  Shared Config + Helpers
   GeoTrack v2.0  |  FIXED
════════════════════════════════════════════ */
'use strict';

/* ── API BASE URL ────────────────────────────
   Always use localhost:5000 when running locally.
   server.py serves everything — no separate
   file:// opening needed.
─────────────────────────────────────────── */
var API_BASE = (function () {
  var h = window.location.hostname;
  var p = window.location.port;

  // Running via server.py locally
  if (h === 'localhost' || h === '127.0.0.1' || h === '') {
    return 'http://localhost:5000';
  }
  // Running on Railway / Render / Netlify etc.
  return window.location.origin;
})();

/* ── API ENDPOINTS ───────────────────────── */
var API = {
  ip:       API_BASE + '/api/ip',
  ipLookup: API_BASE + '/api/ip/',
  reverse:  API_BASE + '/api/reverse',
  session:  API_BASE + '/api/session',
  capture:  API_BASE + '/api/capture',
  captures: API_BASE + '/api/captures',
  ngrok:    API_BASE + '/api/ngrok-url',
  weather:  API_BASE + '/forecast/world',
  health:   API_BASE + '/api/health'
};

/* ── EMAILJS CREDENTIALS ─────────────────── */
var EJS_PK  = 'YOUR_PUBLIC_KEY';
var EJS_SID = 'YOUR_SERVICE_ID';
var EJS_TID = 'YOUR_TEMPLATE_ID';

/* ── HELPERS ─────────────────────────────── */
function setText(id, v) {
  var el = document.getElementById(id);
  if (el) el.textContent = v;
}
function showEl(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = '';
}
function hideEl(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function getVal(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ── TOAST ───────────────────────────────── */
var _toastEl = null, _toastTimer = null;
function toast(msg, isErr) {
  if (!_toastEl) _toastEl = document.getElementById('toast');
  if (!_toastEl) return;
  _toastEl.textContent = msg;
  _toastEl.className = 'toast' + (isErr ? ' err' : '');
  _toastEl.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function(){ _toastEl.classList.remove('show'); }, 3500);
}

/* ── CLOCK ───────────────────────────────── */
function startClock() {
  function tick() { setText('sb-time', new Date().toLocaleTimeString('en-IN', {hour12:false})); }
  tick();
  setInterval(tick, 1000);
}
