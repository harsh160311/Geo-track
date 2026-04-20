# 🌐 GeoTrack — Real-Time Location Intelligence Platform

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![Leaflet](https://img.shields.io/badge/Leaflet.js-Maps-199900?style=for-the-badge&logo=leaflet)
![Status](https://img.shields.io/badge/Status-Educational%20Project-blue?style=for-the-badge)

> ⚠️ **Ethical Use Notice**  
> GeoTrack is strictly developed for **cybersecurity education**, Digital Forensics learning, OSINT training, and academic research purposes only.  
> Any misuse for unauthorized tracking, surveillance, or illegal activities is strictly prohibited.

---

## 🚀 Overview

**GeoTrack** is a web-based Real-Time Location Intelligence Platform that demonstrates the combination of:

- Browser-based GPS tracking (HTML5 Geolocation API)
- IP address intelligence & metadata extraction
- Interactive mapping using Leaflet.js and OpenStreetMap
- Dual tracking (GPS + IP)
- Cyberpunk-themed forensic dashboard

It is built as an educational project for students of **Diploma in Digital Forensic and Investigation (DDFI)**.

---

## 📸 Key Features

- Real-time GPS location tracking with high accuracy
- IP-based geolocation with ISP, ASN, City, and Proxy detection
- Color-coded markers on map (Green = GPS, Gold = IP)
- Fake "WeatherNow" decoy page for social engineering simulation
- Volatile session management (data auto-clears after 30 minutes)
- Responsive Cyberpunk dark UI
- Fully functional without any permanent database

---

## 🗂️ Project Structure

```bash
GeoTrack/
├── index.html
├── tracker.html
├── ip.html
├── fakelink.html
├── contact.html
├── about.html
├── server.py
├── css/
│   ├── shared.css
│   ├── home.css
│   ├── tracker.css
│   ├── ip.css
│   ├── fakelink.css
│   └── contact.css
└── js/
    ├── config.js
    ├── nav.js
    ├── maps.js
    ├── tracker.js
    ├── ip.js
    ├── fakelink.js
    └── contact.js
```

---

## ⚙️ How to Run Locally

### Step 1: Clone the Repository
```bash
git clone https://github.com/harsh160311/Geo-track
cd Geo-track
```

### Step 2: Install Dependencies
```bash
pip install flask flask-cors requests
```

### Step 3: Start the Server
```bash
python server.py
```

Server will start at **http://localhost:5000**

### Step 4: Open in Browser
Open your browser and visit:  
**http://localhost:5000**

---

> **Note for GPS Functionality**:  
> Modern browsers require a **secure HTTPS connection** to access device GPS location.  
> When running locally, you can use **Ngrok** to create a temporary HTTPS URL:
> ```bash
> ngrok http 5000
> ```
> Then open the HTTPS link provided by Ngrok in your target device.

---

## 🛠️ Tech Stack

**Frontend**: HTML5, CSS3 (Cyberpunk Dark Theme), Vanilla JavaScript (ES6+)  
**Mapping**: Leaflet.js + OpenStreetMap (OSM)  
**Backend**: Python 3 + Flask Framework  
**External Services**: ip-api.com, Nominatim (OSM Geocoding)

---

## 🔐 Security & Ethics

**Allowed Use Cases**:
- Cybersecurity education and learning
- Digital Forensics academic projects
- OSINT training
- Web development and mapping practice

**Strictly Prohibited**:
- Unauthorized tracking of any individual
- Hidden surveillance or stalking
- Any illegal or unethical activity

---

## 👨‍💻 Developer
**Harsh**  
📍 Sirsa, Haryana, India  
Cybersecurity & Full Stack Developer

---

## 📜 License
```
GeoTrack © 2026
Educational & Research Use Only
All Rights Reserved
```

