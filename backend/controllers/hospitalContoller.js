import Hospital from "../models/hospitalModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { auth } from "../utils/auth.js";

const createHospital = async (req, res) => {
  const { name, location, managerId } = req.body;
  if (!name || !location || !managerId)
    return res.status(400).json({ message: "missing fields" });
  if (!mongoose.Types.ObjectId.isValid(managerId))
    return res.status(400).json({ message: "invalid id" });
  const managerInfo = await auth.api.getUser({
    query: { id: managerId },
    headers: req.headers,
  });
  if (!managerInfo || managerInfo.error)
    return res.status(404).json({ message: "manager not found" });
  const newHospital = await Hospital.create({
    name,
    location,
    managerId,
  });
  if (!newHospital)
    return res.status(400).json({ message: "failed to create hospital" });

  const roleResult = await auth.api.setRole({
    body: { userId: managerId, role: "hospitalAdmin" },
    headers: req.headers,
  });
  if (!roleResult || roleResult.error) {
    await Hospital.findByIdAndDelete(newHospital._id);
    return res.status(500).json({ message: "failed to set manager role" });
  }

  await auth.api
    .adminUpdateUser({
      body: {
        userId: managerId,
        data: { hospitalId: newHospital._id.toString() },
      },
      headers: req.headers,
    })
    .catch(() => {});

  return res.status(201).json({ data: newHospital });
};

const queryHospitals = async (req, res) => {
  const { managerId, name } = req.body;
  const query = {};
  if (managerId) {
    if (!mongoose.Types.ObjectId.isValid(managerId))
      return res.status(400).json({ message: "invalid id" });
    query.managerId = managerId;
  }
  if (name) {
    query.name = name;
  }
  const hospitals = await Hospital.find(query)
    .populate("managerId", "name email role")
    .populate("careGivers", "name email role")
    .populate("devices")
    .populate("patients");
  if (!hospitals)
    return res.status(404).json({ message: "no hospitals found" });
  return res.status(200).json({ data: hospitals });
};

const getHospitalById = async (req, res) => {
  const { hospitalId } = req.query;
  if (!mongoose.Types.ObjectId.isValid(hospitalId))
    return res.status(400).json({ message: "invalid id" });
  const hospital = await Hospital.findById(hospitalId)
    .populate("managerId", "name email role")
    .populate("careGivers", "name email role")
    .populate("devices")
    .populate("patients");
  if (!hospital) return res.status(404).json({ message: "hospital not found" });
  return res.status(200).json({ data: hospital });
};

const addDevicesToHospital = async (req, res) => {
  const { hospitalId, deviceIds } = req.body;
  if (!mongoose.Types.ObjectId.isValid(hospitalId))
    return res.status(400).json({ message: "invalid id" });
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) return res.status(404).json({ message: "hospital not found" });
  const invalidDeviceIds = deviceIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id),
  );
  if (invalidDeviceIds.length > 0)
    return res.status(400).json({ message: "some device ids areinvalid" });
  const existingDeviceIds = hospital.devices.map((id) => id.toString());
  const newDeviceIds = deviceIds.filter(
    (id) => !existingDeviceIds.includes(id.toString()),
  );
  const updatedHospital = await Hospital.findByIdAndUpdate(
    hospitalId,
    { $addToSet: { deviceIds: newDeviceIds } },
    { new: true },
  );
  if (!updatedHospital)
    return res.status(400).json({ message: "failed to update hospital" });
  return res.status(200).json({ data: updatedHospital });
};

const addCareGiver = async (req, res) => {
  const { hospitalId, careGiverId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(hospitalId))
    return res.status(400).json({ message: "invalid id" });
  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) return res.status(404).json({ message: "hospital not found" });
  if (!mongoose.Types.ObjectId.isValid(careGiverId))
    return res.status(400).json({ message: "invalid care giver id" });

  const roleResult = await auth.api
    .setRole({
      body: { userId: careGiverId, role: "careGiver" },
      headers: req.headers,
    })
    .catch(() => null);
  if (!roleResult || roleResult.error)
    return res.status(500).json({ message: "failed to set care giver role" });

  await auth.api
    .adminUpdateUser({
      body: {
        userId: careGiverId,
        data: { hospitalId: hospitalId },
      },
      headers: req.headers,
    })
    .catch(() => {});

  const updatedHospital = await Hospital.findByIdAndUpdate(
    hospitalId,
    { $addToSet: { careGivers: careGiverId } },
    { new: true },
  ).populate("careGivers", "name email role");
  if (!updatedHospital)
    return res.status(400).json({ message: "failed to update hospital" });
  return res.status(200).json({ data: updatedHospital });
};

const getAllHospitals = async (req, res) => {
  const hospitals = await Hospital.find()
    .populate("managerId", "name email role")
    .populate("careGivers", "name email role")
    .populate("devices")
    .populate("patients");
  return res.status(200).json({ data: hospitals });
};

export default {
  createHospital,
  queryHospitals,
  getHospitalById,
  addDevicesToHospital,
  addCareGiver,
  getAllHospitals,
};
