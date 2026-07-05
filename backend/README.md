# Backend — Express API

Express v5 REST API serving the BleepCare frontend. Handles auth via better-auth, CRUD for patients/devices/hospitals, and optional MQTT device log ingestion.

## Tech Stack

- Express v5
- Mongoose v9 (MongoDB ODM)
- better-auth (email/password + username + admin plugin)
- MQTT.js v5 (device log ingestion)
- jose (JWT verification via JWKS)
- cors, cookie-parser, morgan

## Setup

```bash
cp .env.example .env
# edit .env with your MongoDB URI and secrets
npm install
npm run dev
```

## Environment Variables

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `PORT` | No | `3500` | Server port |
| `MONGODB_URL` | Yes | — | MongoDB connection string |
| `BETTER_AUTH_URL` | Yes | — | Public URL of the auth server (e.g. `http://localhost:3500`) |
| `BETTER_AUTH_SECRET` | Yes | — | Encryption secret for better-auth |
| `FRONTEND_URL` | Yes | — | Allowed CORS origin + JWT issuer/audience |
| `ENVIRONMENT` | No | — | Set to `dev` for permissive CORS |
| `ENV` | No | — | Used in MongoDB connection (both branches currently identical) |
| `ENABLE_MQTT` | No | `false` | Set to `"true"` to start MQTT ingestion service |
| `MQTT_BROKER_URL` | No | `mqtt://broker.hivemq.com:1883` | MQTT broker address |
| `MQTT_TOPIC_PREFIX` | No | `bleepcare` | MQTT topic prefix for device messages |
| `VERCEL` | No | — | Set automatically on Vercel; prevents local `app.listen` |

## API Endpoints

| Prefix | Description |
|--------|-------------|
| `GET /api/auth/*` | better-auth handlers |
| `GET/POST/PUT/DELETE /api/patient/*` | Patient CRUD |
| `GET/POST/PUT/DELETE /api/hospital/*` | Hospital CRUD |
| `GET/POST/PUT/DELETE /api/device/*` | Device CRUD |
| `GET/POST/PUT/DELETE /api/device-logs/*` | Device log / alert CRUD |

## MQTT Ingestion

When `ENABLE_MQTT=true`, the backend subscribes to `{prefix}/+/vitals` and `{prefix}/+/alert`. Incoming messages are parsed and stored as `DeviceLog` documents. The bridge service (`../bridge/`) does the same job as a standalone service and additionally broadcasts over WebSocket.

## Auth

better-auth is mounted at `/api/auth/*`. It uses cookie-based sessions with JWK-verified tokens. The frontend client is configured in `src/lib/auth-client.ts`.
