import "dotenv/config";
import mongoose from "mongoose";
import mqtt from "mqtt";
import { WebSocketServer } from "ws";

// ── CONFIG ──────────────────────────────────────────────────────
const MONGODB_URL = process.env.MONGODB_URL;
const MQTT_BROKER = process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com:1883";
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || "bleepbots";
const WS_PORT = Number(process.env.PORT) || 8080;

// ── MONGOOSE CONNECTION (cached for resilience) ─────────────────
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      bufferCommands: true,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── MODELS ──────────────────────────────────────────────────────
const DeviceSchema = new mongoose.Schema(
  {
    deviceCode: { type: String, default: () => Math.random().toString(16).slice(2, 10).toUpperCase() },
    serialNumber: String,
    hospital: { type: mongoose.Types.ObjectId, ref: "Hospital" },
    patient: { type: mongoose.Types.ObjectId, ref: "Patient" },
    careGiver: { type: mongoose.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true },
);

const DeviceLogSchema = new mongoose.Schema(
  {
    deviceId: { type: mongoose.Types.ObjectId, ref: "Device" },
    event: { type: String, enum: ["vitals", "alert"], default: "vitals" },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: String,
    data: {
      deviceSn: String,
      eventType: {
        type: String,
        enum: ["FALL", "COLLISION", "SOS", "THRESHOLD", "VITALS"],
        default: "VITALS",
      },
      ts: Date,
      hr: Number,
      spo2: Number,
      temp: Number,
      lat: Number,
      lng: Number,
      gps_ok: Boolean,
      fallScore: Number,
      collScore: Number,
      motion: {
        type: String,
        enum: ["IDLE", "GESTURE", "FALL", "COLLISION"],
        default: "IDLE",
      },
      bat: Number,
      sig: Number,
      sos: Boolean,
    },
  },
  { timestamps: true },
);

const Device = mongoose.model("Device", DeviceSchema);
const DeviceLog = mongoose.model("DeviceLog", DeviceLogSchema);

// ── HELPERS ─────────────────────────────────────────────────────
function mapAlertType(type) {
  if (!type) return "VITALS";
  const upper = type.toUpperCase();
  if (["FALL", "COLLISION", "SOS", "THRESHOLD"].includes(upper)) return upper;
  return "VITALS";
}

function mapMotion(motion) {
  if (!motion) return "IDLE";
  const upper = motion.toUpperCase();
  if (["IDLE", "GESTURE", "FALL", "COLLISION"].includes(upper)) return upper;
  return "IDLE";
}

// ── WEB SOCKET SERVER ───────────────────────────────────────────
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);
  console.log(`[WS] Client connected — ${clients.size} total`);

  ws.send(JSON.stringify({ event: "bridge_ready" }));

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected — ${clients.size} remaining`);
  });

  ws.on("error", (err) => {
    console.error("[WS] Error:", err.message);
    clients.delete(ws);
  });
});

function broadcast(eventName, data) {
  const frame = JSON.stringify({ event: eventName, data });
  for (const ws of clients) {
    if (ws.readyState === 1) ws.send(frame);
  }
}

// ── MQTT CLIENT ─────────────────────────────────────────────────
const mqttClient = mqtt.connect(MQTT_BROKER, {
  clientId: `bleepcare_bridge_${Math.random().toString(16).slice(2, 8)}`,
  reconnectPeriod: 5000,
});

mqttClient.on("connect", () => {
  console.log(`[MQTT] Connected to ${MQTT_BROKER}`);

  mqttClient.subscribe(`${TOPIC_PREFIX}/+/vitals`, { qos: 1 }, (err) => {
    if (err) console.error("[MQTT] Subscribe error (vitals):", err.message);
    else console.log(`[MQTT] Subscribed: ${TOPIC_PREFIX}/+/vitals`);
  });

  mqttClient.subscribe(`${TOPIC_PREFIX}/+/alert`, { qos: 1 }, (err) => {
    if (err) console.error("[MQTT] Subscribe error (alert):", err.message);
    else console.log(`[MQTT] Subscribed: ${TOPIC_PREFIX}/+/alert`);
  });
});

mqttClient.on("message", async (topic, raw) => {
  try {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      console.warn("[MQTT] Bad JSON on topic:", topic, raw.toString());
      return;
    }

    const parts = topic.split("/");
    const deviceId = parts[1] || "unknown";
    const frameType = parts[2];
    data.deviceId = deviceId;

    // Lookup device by serial number
    let device = null;
    if (deviceId) {
      device = await Device.findOne({ serialNumber: deviceId }).lean();
    }

    const isAlert = frameType === "alert";

    const log = await DeviceLog.create({
      event: isAlert ? "alert" : "vitals",
      deviceId: device?._id ?? null,
      data: {
        deviceSn: deviceId,
        eventType: isAlert ? mapAlertType(data.type) : "VITALS",
        ts: data.ts ? new Date(data.ts * 1000) : new Date(),
        hr: data.hr,
        spo2: data.spo2,
        temp: data.temp,
        lat: data.lat,
        lng: data.lng,
        gps_ok: data.gps_ok,
        fallScore: data.fallScore,
        collScore: data.collScore,
        motion: mapMotion(data.motion),
        bat: data.bat,
        sig: data.sig,
        sos: data.sos,
      },
    });

    // Broadcast full alert doc over WebSocket
    if (isAlert) {
      const populated = await DeviceLog.findById(log._id).populate(
        "deviceId",
        "serialNumber deviceCode",
      );
      broadcast("alert", populated);
    }
  } catch (err) {
    console.error("[MQTT] Error processing message:", err.message);
  }
});

mqttClient.on("reconnect", () => console.log("[MQTT] Reconnecting..."));
mqttClient.on("error", (err) => console.error("[MQTT] Error:", err.message));
mqttClient.on("offline", () => console.warn("[MQTT] Offline"));

// ── STARTUP ─────────────────────────────────────────────────────
try {
  await dbConnect();
  console.log("[DB] Connected to MongoDB");

  console.log(`[WS] WebSocket server on port ${WS_PORT}`);
  console.log(`[Bridge] Listening on ${TOPIC_PREFIX}/+/vitals and ${TOPIC_PREFIX}/+/alert`);
} catch (err) {
  console.error("[Bridge] Startup failed:", err);
  process.exit(1);
}
