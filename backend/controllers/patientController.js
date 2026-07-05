import Patient from "../models/patientModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import _ from "lodash";
import Device from "../models/deviceModel.js";
import { auth } from "../utils/auth.js";
import Hospital from "../models/hospitalModel.js";

const createPatient = async (req, res) => {
  const { name, diagnosis, dateOfBirth, device, hospital, careGiver } =
    req.body;
  if (!name || !diagnosis || !dateOfBirth || !device || !hospital || !careGiver)
    return res.status(400).json({ message: "missing fields" });
  if (
    !mongoose.Types.ObjectId.isValid(device) ||
    !mongoose.Types.ObjectId.isValid(hospital) ||
    !mongoose.Types.ObjectId.isValid(careGiver)
  )
    return res.status(400).json({ message: "invalid id" });

  const patientDevice = await Device.findById(device);
  if (!patientDevice)
    return res.status(404).json({ message: "device not found" });
  if (patientDevice.patient)
    return res
      .status(400)
      .json({ message: "device already assigned to a patient" });

  const patientHospital = await Hospital.findById(hospital);
  if (!patientHospital)
    return res.status(404).json({ message: "hospital not found" });
  if (!patientHospital.careGivers.includes(careGiver))
    return res
      .status(400)
      .json({ message: "care giver not associated with hospital" });

  const newPatient = await Patient.create({
    name,
    diagnosis,
    dateOfBirth,
    device,
    hospital,
    careGiver,
  });

  if (!newPatient)
    return res.status(400).json({ message: "failed to create patient" });

  patientDevice.patient = newPatient._id;
  patientDevice.careGiver = careGiver;
  await patientDevice.save();

  patientHospital.patients.push(newPatient._id);
  await patientHospital.save();

  const baRes = await auth.api.adminUpdateUser({
    body: { userId: careGiver, data: { patientId: newPatient._id.toString() } },
    headers: req.headers,
  });
  if (baRes.error) {
    return res.status(400).json({
      message: "failed to assign patient to care giver.",
    });
  }
  return res.status(201).json({ data: newPatient });
};

const queryPatients = async (req, res) => {
  const { hospitalId, patientId, careGiverId, deviceId } = req.body;
  if (hospitalId) {
    const patients = await Patient.find({ hospital: hospitalId })
      .populate("careGiver", "name email role")
      .populate("device");
    if (!patients)
      return res
        .status(404)
        .json({ message: "no patients found for hospital" });
    return res.status(200).json({ data: patients });
  } else if (patientId) {
    const patient = await Patient.findById(patientId)
      .populate("careGiver", "name email role")
      .populate("device");
    if (!patient)
      return res.status(404).json({ message: "no patient found for id" });
    return res.status(200).json({ data: [patient] });
  } else if (careGiverId) {
    const patients = await Patient.find({ careGiver: careGiverId })
      .populate("careGiver", "name email role")
      .populate("device");
    if (!patients)
      return res
        .status(404)
        .json({ message: "no patients found for care giver" });
    return res.status(200).json({ data: patients });
  } else if (deviceId) {
    const patients = await Patient.find({ device: deviceId })
      .populate("careGiver", "name email role")
      .populate("device");
    if (!patients)
      return res.status(404).json({ message: "no patients found for device" });
    return res.status(200).json({ data: patients });
  } else {
    return res.status(400).json({ message: "missing query parameters" });
  }
};

const getPatientById = async (req, res) => {
  const { patientId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(patientId))
    return res.status(400).json({ message: "invalid id" });
  const patient = await Patient.findById(patientId)
    .populate("careGiver", "name email role")
    .populate("device");
  if (!patient) return res.status(404).json({ message: "patient not found" });
  return res.status(200).json({ data: patient });
};

export default { createPatient, queryPatients, getPatientById };
