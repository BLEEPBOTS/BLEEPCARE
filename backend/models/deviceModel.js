import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const DeviceSchema = new mongoose.Schema(
  {
    deviceCode: {
      type: String,
      default: randomCode(),
    },
    serialNumber: String,
    hospital: { type: mongoose.Types.ObjectId, ref: "Hospital" },
    patient: { type: mongoose.Types.ObjectId, ref: "Patient" },
    careGiver: { type: mongoose.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Device = mongoose.model("Device", DeviceSchema);

export default Device;
