import Device from "../models/deviceModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import _ from "lodash";
import Hospital from "../models/hospitalModel.js";
import Patient from "../models/patientModel.js";
import { auth } from "../utils/auth.js";

const createDevice = async (req, res) => {
  const { serialNumber, hospital, patient, careGiver } = req.body;
  if (!serialNumber || !hospital)
    return res.status(400).json({ message: "missing fields" });
  if (
    !mongoose.Types.ObjectId.isValid(hospital) ||
    (patient && !mongoose.Types.ObjectId.isValid(patient)) ||
    (careGiver && !mongoose.Types.ObjectId.isValid(careGiver))
  )
    return res.status(400).json({ message: "invalid id" });

  const otherDevice = await Device.findOne({ serialNumber });
  if (otherDevice)
    return res.status(400).json({ message: "device already exists" });

  const newDevice = await Device.create({
    serialNumber,
    hospital,
    patient,
    careGiver,
  });

  if (!newDevice)
    return res.status(400).json({ message: "failed to create device" });

  const deviceHospital = await Hospital.findById(hospital);
  deviceHospital.devices.push(newDevice._id);
  await deviceHospital.save();
  if (patient) {
    const devicePatient = await Patient.findById(patient);
    devicePatient.device = newDevice._id;
    await devicePatient.save();
  }
  if (careGiver) {
    const baRes = await auth.api.adminUpdateUser({
      body: { userId: careGiver, data: { deviceId: newDevice._id.toString() } },
      headers: req.headers,
    });
    if (baRes.error) {
      return res.status(400).json({
        message: "failed to assign device to care giver, you can try manually.",
      });
    }
  }
  return res.status(201).json({ data: newDevice });
};

const findDeviceById = async (req, res) => {
  const { deviceId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(deviceId))
    return res.status(400).json({ message: "invalid id" });
  const device = await Device.findById(deviceId)
    .populate("hospital")
    .populate("patient", "-device -hospital -careGiver")
    .populate("careGiver", "-password -device -patient -hospital");
  if (!device) return res.status(404).json({ message: "device not found" });
  return res.status(200).json({ data: device });
};

const getAllDevices = async (req, res) => {
  const devices = await Device.find()
    .populate("hospital", "name location")
    .populate("patient", "name")
    .populate("careGiver", "name email");
  return res.status(200).json({ data: devices });
};

const getDevicesByHospital = async (req, res) => {
  const { hospitalId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(hospitalId))
    return res.status(400).json({ message: "invalid id" });
  const devices = await Device.find({ hospital: hospitalId })
    .populate({
      path: "patient",
      select: "name patientCode",
      populate: { path: "careGiver", select: "name email" },
    })
    .populate("careGiver", "name email");
  return res.status(200).json({ data: devices });
};

export default {
  createDevice,
  findDeviceById,
  getAllDevices,
  getDevicesByHospital,
};
