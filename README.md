# BleepCare

Real-time patient monitoring system for caregivers. Devices stream vitals and alerts over MQTT; the bridge ingests them into MongoDB and broadcasts over WebSocket; the Express API serves the frontend; caretakers and hospital staff respond through a React dashboard.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│          React + Vite + shadcn + TanStack Query              │
│          Port 5173 (dev) / vercel (prod)                     │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTP / WebSocket
┌──────────────────────▼───────────────────────────────────────┐
│                     Express API                               │
│          better-auth · Mongoose · MQTT client                 │
│          Port 3500                                            │
└──────┬─────────────────────────────────────────────────┬──────┘
       │ Mongoose                                        │ MQTT
┌──────▼──────────┐                             ┌───────▼─────────┐
│    MongoDB       │                             │  MQTT Bridge    │
│   (Atlas /       │◄────────────────────────────│  Port 8080      │
│    local)        │                             │  WebSocket      │
└─────────────────┘                             └─────────────────┘
                                                        ▲
                                                        │ MQTT
                                                ┌───────┴─────────┐
                                                │   Bleep devices  │
                                                │  (IoT hardware)   │
                                                └─────────────────┘
```

## Project Structure

```
full_project/
├── backend/        # Express API server (port 3500)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── bridge/         # MQTT → MongoDB + WebSocket bridge (port 8080)
│   └── index.js
└── frontend/       # React SPA (port 5173)
    └── src/
        ├── components/
        ├── lib/
        ├── pages/
        └── types/
```

## Quick Start

1. Start MongoDB (local or Atlas connection string)
2. `cd backend && npm install && npm run dev`
3. `cd bridge && npm install && npm start`
4. `cd frontend && npm install && npm run dev`

See each sub-project's README for details.
