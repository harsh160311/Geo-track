# 🌐 GeoTrack — Location Intelligence & OSINT Platform

![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![Leaflet](https://img.shields.io/badge/Leaflet.js-Maps-199900?style=for-the-badge&logo=leaflet)
![Status](https://img.shields.io/badge/Status-Educational%20Project-blue?style=for-the-badge)

> ⚠️ **Ethical Use Notice**  
> GeoTrack is strictly developed for cybersecurity education, OSINT learning, and research purposes.  
> Any misuse for unauthorized tracking, surveillance, or illegal activities is strictly prohibited.

---

## 🚀 Overview

**GeoTrack** is a full-stack geolocation intelligence platform designed to demonstrate how modern web technologies can visualize:

- IP-based geolocation
- GPS coordinate mapping
- OSINT-style data collection
- Real-time tracking dashboards

It combines **frontend mapping visualization**, **backend API services**, and **intelligence modules** into a single unified system.

---

## 🔗 Live Deployment

| Module | URL |
|--------|-----|
| 🌐 Frontend Dashboard | https://ge0track.netlify.app |
| ⚙️ Backend API | https://weatherforecast-live.up.railway.app |

---

## 📸 Key Features

### 🗺️ Advanced Mapping System
- Real-time coordinate plotting
- Reverse geocoding (location → address)
- Interactive zoom and layer control
- OpenStreetMap powered visualization

### 🌐 IP Intelligence Engine
- IP address geolocation lookup
- ISP and region detection
- Map-based IP visualization
- Live metadata extraction

### 🔗 Decoy / Demo Link System
- Fake landing page generator (WeatherNow style)
- Ngrok-based temporary links
- Controlled OSINT simulation environment

### 📡 Live Tracking Logs
- Auto-refresh every 5 seconds
- Session-based tracking logs
- Timestamped event history

### 🔐 Secure Session Handling
- Unique session tokens
- Isolated user tracking sessions
- Temporary data storage

### ✉️ Contact & Communication System
- EmailJS integration
- Contact form backend-free setup
- Instant message delivery

---

## 🧠 System Architecture

```

Frontend (HTML + CSS + JS)
↓
Leaflet Map Engine
↓
Flask Backend API
↓
External APIs (OSM / IP API / Geocoding)
↓
Visualization Layer (Dashboard UI)

````

---

## 🗂️ Project Structure

```bash
GeoTrack/
│
├── index.html
├── about.html
├── tracker.html
├── ip.html
├── fakelink.html
├── contact.html
│
├── server.py
│
├── css/
│   ├── shared.css
│   ├── home.css
│   ├── about.css
│   ├── tracker.css
│   ├── ip.css
│   ├── fakelink.css
│   └── contact.css
│
├── js/
    ├── config.js
    ├── nav.js
    ├── maps.js
    ├── home.js
    ├── tracker.js
    ├── ip.js
    ├── fakelink.js
    └── contact.js

````

---

## 🗺️ Mapping Modules

| Module      | Description                       | Technology          |
| ----------- | --------------------------------- | ------------------- |
| Tracker Map | Live GPS coordinate visualization | Leaflet + OSM       |
| IP Map      | IP geolocation mapping            | Leaflet + IP API    |
| Capture Map | Simulation tracking dashboard     | Leaflet + Custom JS |

---

## ⚙️ Installation Guide

### 🔧 Step 1: Clone Repository

```bash
git clone https://github.com/harsh160311/Geo-track
cd Geo-track
```

### 🔧 Step 2: Install Dependencies

```bash
pip install flask flask-cors requests gunicorn
```

### 🔧 Step 3: Run Server

```bash
python server.py
```

### 🔧 Step 4: Open in Browser

```
http://localhost:5000
```

---

## 🌍 API Endpoints (Backend)

| Endpoint  | Method | Description                |
| --------- | ------ | -------------------------- |
| `/`       | GET    | Home route                 |
| `/track`  | POST   | Store tracking data        |
| `/ipinfo` | GET    | Fetch IP intelligence      |
| `/logs`   | GET    | Retrieve live session logs |

---

## 🛠️ Tech Stack

### 💻 Frontend

* HTML5
* CSS3 (Cyberpunk Dark Theme)
* Vanilla JavaScript (ES6+)

### 🗺️ Mapping

* Leaflet.js 1.9.4
* OpenStreetMap (OSM)

### ⚙️ Backend

* Python 3
* Flask Framework
* Flask-CORS

### 🌐 External APIs

* Nominatim (Geocoding)
* ip-api.com (IP Intelligence)

---

## 🔐 Security & Ethics

GeoTrack is built with a strong focus on ethical usage:

### ✅ Allowed Use Cases

* Cybersecurity learning
* OSINT training environments
* Academic research
* Map visualization studies

### ❌ Strictly Prohibited

* Unauthorized tracking of individuals
* Hidden surveillance
* Illegal data collection
* Privacy violations

---

## 📊 Future Improvements

* [ ] AI-based anomaly detection in location data
* [ ] Encrypted tracking sessions
* [ ] Advanced heatmap analytics
* [ ] Mobile responsive PWA version
* [ ] Role-based access control dashboard

---

## 👨‍💻 Developer

**Harsh**
📍 Sirsa, Haryana, India
💡 Cybersecurity & Full Stack Developer

---

## 📜 License

```
GeoTrack © 2026
Educational & Research Use Only
All Rights Reserved
```
