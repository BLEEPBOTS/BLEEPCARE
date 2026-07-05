# Bridge — MQTT → MongoDB + WebSocket

Standalone service that subscribes to MQTT device topics, persists incoming vitals and alerts to MongoDB, and broadcasts alerts in real-time to connected WebSocket clients.

## Tech Stack

- Node.js (ESM)
- Mongoose v9 (MongoDB ODM)
- MQTT.js v5
- ws (WebSocket server)

## Setup

```bash
cp .env.example .env
# edit .env with your MongoDB URI
npm install
npm start
```

## Environment Variables

| Var | Required | Default | Description |
|-----|----------|---------|-------------|
| `MONGODB_URL` | Yes | — | MongoDB connection string |
| `MQTT_BROKER_URL` | No | `mqtt://broker.hivemq.com:1883` | MQTT broker address |
| `MQTT_TOPIC_PREFIX` | No | `bleepbots` | Topic prefix for subscribed channels |
| `PORT` | No | `8080` | WebSocket server port |

## How It Works

1. Connects to MongoDB and MQTT broker on startup.
2. Subscribes to `{prefix}/+/vitals` and `{prefix}/+/alert`.
3. On each MQTT message:
   - Parses JSON payload
   - Looks up device by `serialNumber` in MongoDB
   - Creates a `DeviceLog` document
   - If the message is an alert, populates the device ref and broadcasts the full alert document to all connected WebSocket clients.
4. WebSocket clients receive `{ event: "alert", data: { ... } }` frames.

## WebSocket Protocol

**Client connects** → receives `{ event: "bridge_ready" }`

**On alert** → broadcast `{ event: "alert", data: <DeviceLog> }` to all clients
