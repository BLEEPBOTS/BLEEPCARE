import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const DeviceLogSchema = new mongoose.Schema(
  {
    deviceId: { type: mongoose.Types.ObjectId, ref: "Device" },
    event: {
      type: String,
      enum: ["vitals", "alert"],
      default: "vitals",
    },
    resolved: { type: Boolean, default: false },
    resolvedAt: Date,
    resolvedBy: String,
    data: {
      deviceSn: String, // "BB_001", // device/patient identifier
      eventType: {
        type: String,
        enum: ["FALL", "COLLISION", "SOS", "THRESHOLD", "VITALS"],
        default: "VITALS",
      },
      ts: Date, // 1747391234, // Unix timestamp (seconds)
      hr: Number, //, // heart rate BPM (int)
      spo2: Number, // 98, // blood oxygen % (int)
      temp: Number, // 36.6, // body temperature °C (float, 1dp)
      lat: Number, // 0.347612, // GPS latitude (float)
      lng: Number, // 32.5825, // GPS longitude (float)
      gps_ok: Boolean, // true, // false = no GPS fix yet
      fallScore: Number, // 12, // 0-100, above 60 = fall
      collScore: Number, // 0, // 0-100, above 60 = collision
      motion: {
        type: String,
        enum: ["IDLE", "GESTURE", "FALL", "COLLISION"],
        default: "IDLE",
      }, // "IDLE", // IDLE | GESTURE | FALL | COLLISION
      bat: Number, // 75, // battery % (int)
      sig: Number, // 3, // signal bars 0-4 (int)
      sos: Boolean, // false, // true when SOS button active
    },
  },
  { timestamps: true },
);

const DeviceLog = mongoose.model("DeviceLog", DeviceLogSchema);

export default DeviceLog;
