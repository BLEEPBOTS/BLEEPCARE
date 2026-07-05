import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const HospitalSchema = new mongoose.Schema(
  {
    hospitalCode: {
      type: String,
      default: randomCode(),
    },
    name: String,
    managerId: { type: mongoose.Types.ObjectId, ref: "User" },
    devices: [{ type: mongoose.Types.ObjectId, ref: "Device" }],
    patients: [{ type: mongoose.Types.ObjectId, ref: "Patient" }],
    careGivers: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    location: String,
  },
  { timestamps: true },
);

const Hospital = mongoose.model("Hospital", HospitalSchema);

export default Hospital;
