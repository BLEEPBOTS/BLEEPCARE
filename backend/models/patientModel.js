import mongoose from "mongoose";
import { customAlphabet } from "nanoid";
const randomCode = customAlphabet("1234567890ABDCEFG", 8);

const PatientSchema = new mongoose.Schema(
  {
    patientCode: {
      type: String,
      default: randomCode(),
    },
    name: String,
    diagnosis: String,
    dateOfBirth: Date,
    device: {
      type: mongoose.Types.ObjectId,
      ref: "Device",
    },
    hospital: {
      type: mongoose.Types.ObjectId,
      ref: "Hospital",
    },
    careGiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const Patient = mongoose.model("Patient", PatientSchema);

export default Patient;
