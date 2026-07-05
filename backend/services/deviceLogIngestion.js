import mqtt from "mqtt";
import DeviceLog from "../models/deviceLogsModel.js";
import Device from "../models/deviceModel.js";

const MQTT_BROKER =
  process.env.MQTT_BROKER_URL || "mqtt://broker.hivemq.com:1883";
const TOPIC_PREFIX = process.env.MQTT_TOPIC_PREFIX || "bleepbots";
const RECONNECT_DELAY = 5000;

let client;

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

function connect() {
  if (client?.connected) {
    return;
  }

  if (client) {
    client.end(true);
  }

  console.log(`[Ingestion] Connecting to MQTT broker: ${MQTT_BROKER}`);
  client = mqtt.connect(MQTT_BROKER, {
    clientId: `bleepcare_backend_${Math.random().toString(16).slice(2, 8)}`,
    reconnectPeriod: RECONNECT_DELAY,
  });

  client.on("connect", () => {
    console.log("[Ingestion] Connected to MQTT broker");

    client.subscribe(`${TOPIC_PREFIX}/+/vitals`, { qos: 1 }, (err) => {
      if (err)
        console.error("[Ingestion] Subscribe error (vitals):", err.message);
      else console.log(`[Ingestion] Subscribed: ${TOPIC_PREFIX}/+/vitals`);
    });

    client.subscribe(`${TOPIC_PREFIX}/+/alert`, { qos: 1 }, (err) => {
      if (err)
        console.error("[Ingestion] Subscribe error (alert):", err.message);
      else console.log(`[Ingestion] Subscribed: ${TOPIC_PREFIX}/+/alert`);
    });
  });

  client.on("message", async (topic, raw) => {
    // topic: bleepbots/BB_001/vitals  or  bleepbots/BB_001/alert
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch {
      console.warn("[Ingestion] Bad JSON on topic:", topic, raw.toString());
      return;
    }

    const parts = topic.split("/");
    const deviceId = parts[1] || "unknown";
    const frameType = parts[2];

    data.deviceId = deviceId;

    try {
      let device = null;
      if (deviceId) {
        device = await Device.findOne({ serialNumber: deviceId }).lean();
      }

      const isAlert = frameType === "alert";

      await DeviceLog.create({
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
    } catch (err) {
      console.error("[Ingestion] Error saving log:", err.message);
    }
  });

  client.on("reconnect", () => console.log("[Ingestion] Reconnecting..."));
  client.on("error", (err) => console.error("[Ingestion] Error:", err.message));
  client.on("offline", () => console.warn("[Ingestion] Offline"));
}

connect();

process.on("SIGINT", () => {
  if (client) client.end(true);
  process.exit(0);
});
