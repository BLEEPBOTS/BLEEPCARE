# BleepCare - Remote Patient Vitals Monitoring And Emergency Alert System

> Developed by Electronics and Communications Engineering students at the **Uganda Institute of Information and Communications Technology (UICT)** under the **UJ-CONNECT Programme**, supported by the **Ministry of ICT and National Guidance** and **JICA** · 2026

---

## Project Title

**BleepCare** - A wearable IoT health monitor for remote post-discharge patient monitoring in Uganda.

---

## Problem & Solution

### Problem

After hospital discharge, patients managing chronic illnesses including cardiovascular disease, respiratory conditions, diabetes and sepsis have no means of continuous health monitoring. The vitals most critical to these conditions: heart rate, blood oxygen, body temperature, and physical stability, can deteriorate rapidly outside a clinical setting. Caregivers and clinicians cannot detect these changes until the patient physically returns to a facility, often too late for timely intervention.

### Solution

BleepCare is an end-to-end remote patient monitoring system made up of three tightly integrated components:

**1. Wristband Device (ESP32)**
A custom-built wearable that continuously reads heart rate, blood oxygen (SpO₂), body temperature, GPS location and motion state. It publishes live vitals to the cloud every 30 seconds and fires instant alerts on any clinical threshold breach, fall, collision, or SOS button press. The device uses a SIM900 GSM module as the primary data channel over GPRS this is the managed connectivity that forms part of the patient's monthly subscription. WiFi is available as a supplementary path. On any emergency, the device simultaneously publishes an MQTT alert, displays an emergency screen, sounds a buzzer, sends an SMS with a Google Maps GPS link to the caregiver and places a voice call.

**2. Bridge Service (Node.js)**
A standalone service that subscribes to the MQTT broker, persists incoming vitals and alerts to MongoDB and broadcasts real-time alert frames to connected WebSocket clients.

**3. Hospital Dashboard (React)**
A web application for caregivers, hospital staff and administrators to monitor patients, view live vitals, manage devices and respond to alerts. Hospitals access the dashboard under a monthly subscription license.

---

## System Architecture

```
┌─────────────────────────────────┐
│       ESP32 Wristband           │
│  MAX30102 · MPU6050 · LM35      │
│  NEO-6M GPS · ST7789 Display    │
│  SOS Button · Buzzer · SIM900   │
└──────────┬──────────────────────┘
           │ SIM900 GPRS (primary)
           │ WiFi / PubSubClient (supplementary)
           ▼
┌─────────────────────────────────┐
│   HiveMQ Public MQTT Broker     │
│   broker.hivemq.com : 1883      │
│                                 │
│  bleepcare/{deviceId}/vitals    │  ← every 30 s
│  bleepcare/{deviceId}/alert     │  ← on event
└──────────┬──────────────────────┘
           │ MQTT
           ▼
┌─────────────────────────────────┐
│   Bridge Service  (Port 8080)   │
│   Node.js · MQTT.js · Mongoose  │
│   Persists to MongoDB           │
│   Broadcasts alerts via WS      │
└──────────┬──────────────────────┘
           │ HTTP / WebSocket
           ▼
┌─────────────────────────────────┐
│   Express API  (Port 3500)      │
│   better-auth · Mongoose        │
│   Patient / Device / Hospital   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│   React Dashboard  (Port 5173)  │
│   Vite · shadcn · TanStack      │
│   Multi-role: Admin/Hospital/   │
│   Caregiver views               │
└─────────────────────────────────┘
           │ On any alert also:
           ▼
┌─────────────────────────────────┐
│   Caregiver Phone               │
│   SMS (vitals + Maps link)      │
│   Voice call via SIM900         │
└─────────────────────────────────┘
```

---

## Repository Structure

```
bleepcare/
├── backend/
│   ├── README.md              ← backend setup instructions
│   └── ...
├── bridge/
│   ├── README.md              ← bridge setup instructions
│   └── index.js
├── device/
│   ├── README.md              ← device setup instructions
│   └── bleepcare-firmware.ino
└── frontend/
    ├── README.md              ← frontend setup instructions
    └── src/
├──AGENTS.md                   ← AI agent contribution guidelines
├── README.md                  ← you are here — full system overview
```

---

## JSON Payload Shape

Every vitals frame published to `bleepcare/{deviceId}/vitals`:

```json
{
  "deviceId": "BLEEP-1234",
  "ts": 1782657945,
  "hr": 78,
  "spo2": 98,
  "temp": 36.7,
  "lat": 0.354523,
  "lng": 32.637383,
  "gps_ok": true,
  "motion": "IDLE",
  "sos": false,
  "bat": 76,
  "sig": 3
}
```

Alert frames on `bleepcare/{deviceId}/alert` add `"type"`: `FALL`, `COLLISION`, `SOS`, or `THRESHOLD`.

---

## Alert Thresholds

| Vital | Low | High |
|---|---|---|
| Heart rate | < 50 BPM | > 120 BPM |
| SpO₂ | < 92% | — |
| Temperature | < 35.0 °C | > 37.5 °C |
| Fall score | > 60 / 100 | — |
| Collision score | > 65 / 100 | — |

---

## Setup Instructions

The system has four components. Each has its own README with full details. Follow this order:

---

### 1. Device (ESP32 Wristband)

> Full instructions in [`device/README.md`](device/README.md)

**Prerequisites**
- Arduino IDE 2.x
- ESP32 board package via Boards Manager:
  `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`

**Libraries to install** via Arduino IDE → Sketch → Manage Libraries:

| Library | Author |
|---|---|
| Adafruit GFX Library | Adafruit |
| Adafruit ST7735 and ST7789 Library | Adafruit |
| TinyGPSPlus | Mikal Hart |
| SparkFun MAX3010x Pulse and Proximity Sensor | SparkFun |
| MPU6050 | Electronic Cats |
| PubSubClient | Nick O'Leary |

**Configure** — open `device/bleepcare-firmware.ino` and set:

```cpp
#define WIFI_SSID        "YourNetworkName"
#define WIFI_PASS        "YourPassword"
#define CAREGIVER_NUMBER "+256XXXXXXXXX"
#define DEVICE_ID        "BB_001"
#define GPRS_APN         "internet"   // MTN/Airtel Uganda default
```

**Flash** - select Board: `ESP32 Dev Module`, choose your COM port, click Upload.

**Verify** - open Serial Monitor at 115200 baud. You should see GSM init, WiFi connect and MQTT connect messages. Data appears on the broker within 30 seconds.

---

### 2. Bridge Service

> Full instructions in [`bridge/README.md`](bridge/README.md)

```bash
cd bridge
cp .env.example .env
# Set MONGODB_URL in .env
npm install
npm start
```

Subscribes to `bleepcare/+/vitals` and `bleepcare/+/alert` on HiveMQ, persists frames to MongoDB and broadcasts alerts over WebSocket on port 8080.

---

### 3. Backend API

> Full instructions in [`backend/README.md`](backend/README.md)

```bash
cd backend
cp .env.example .env
# Set MONGODB_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, FRONTEND_URL in .env
npm install
npm run dev
```

Runs on port 3500. Handles authentication, patient/device/hospital management and device log storage.

---

### 4. Frontend Dashboard

> Full instructions in [`frontend/README.md`](frontend/README.md)

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:3500
npm install
npm run dev
```

Opens at `http://localhost:5173`. Three role levels: Admin, Hospital staff, Caregiver.

---

## Verify the Full Pipeline

Once all four components are running:

1. Power on the wristband
2. Open the [HiveMQ WebSocket Client](https://www.hivemq.com/demos/websocket-client/) and subscribe to `bleepcare/#` vitals frames should appear every 30 seconds
3. Open the dashboard at `http://localhost:5173` patient vitals should update live
4. Hold the SOS button on the device for 3 seconds an alert should appear in the dashboard and an SMS should arrive on the caregiver's phone

---

## Hardware Components

| Component | Role | Interface |
|---|---|---|
| ESP32 Dev Module | Main microcontroller | — |
| MAX30102 | Heart rate + SpO₂ | I2C (GPIO 21/22) |
| MPU6050 | Fall / collision detection | I2C (GPIO 21/22) |
| NEO-6M GPS | Location + UTC time | UART2 (GPIO 16/17) |
| SIM900 GSM | GPRS data + SMS + voice | UART1 (GPIO 25/26) |
| LM35 | Body temperature | Analog (GPIO 34) |
| ST7789 240×280 TFT | Live vitals display | SPI |
| Buzzer | SOS + alert tones | GPIO 14 |
| SOS Button | Emergency trigger | GPIO 13 |

---

## Business Model

Hospitals subscribe to BleepCare on a monthly license covering device provisioning, managed SIM data for continuous GPRS connectivity and dashboard access. Each hospital manages multiple patients, each assigned a unique `deviceId`. When a subscription lapses, dashboard access is suspended the device continues publishing and historical data is preserved.

---


