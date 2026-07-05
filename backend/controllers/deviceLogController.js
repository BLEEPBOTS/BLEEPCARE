import DeviceLog from "../models/deviceLogsModel.js";
import Device from "../models/deviceModel.js";
import mongoose from "mongoose";

const getAlertsByHospital = async (req, res) => {
  const { hospitalId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  if (!mongoose.Types.ObjectId.isValid(hospitalId))
    return res.status(400).json({ message: "invalid hospital id" });

  const devices = await Device.find({ hospital: hospitalId }).select("_id");
  const deviceIds = devices.map((d) => d._id);

  const query = { event: "alert", deviceId: { $in: deviceIds } };

  const [logs, total] = await Promise.all([
    DeviceLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("deviceId", "serialNumber deviceCode"),
    DeviceLog.countDocuments(query),
  ]);

  return res.status(200).json({ data: logs, total, page, limit });
};

const getDeviceLogs = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const [logs, total] = await Promise.all([
    DeviceLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("deviceId", "serialNumber deviceCode"),
    DeviceLog.countDocuments(),
  ]);

  return res.status(200).json({ data: logs, total, page, limit });
};

const getLatestVitals = async (req, res) => {
  const { deviceIds } = req.body;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0)
    return res.status(400).json({ message: "deviceIds required" });

  const objectIds = deviceIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (objectIds.length === 0)
    return res.status(400).json({ message: "no valid device ids" });

  const logs = await DeviceLog.aggregate([
    { $match: { deviceId: { $in: objectIds }, event: "vitals" } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$deviceId", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  return res.status(200).json({ data: logs });
};

const getUnresolvedAlerts = async (req, res) => {
  const { deviceIds } = req.body;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0)
    return res.status(400).json({ message: "deviceIds required" });

  const logs = await DeviceLog.find({
    deviceId: { $in: deviceIds },
    event: "alert",
    resolved: false,
  })
    .sort({ createdAt: -1 })
    .populate("deviceId", "serialNumber deviceCode");

  return res.status(200).json({ data: logs });
};

const resolveAlert = async (req, res) => {
  const { logId } = req.params;
  const { resolvedBy } = req.body;

  if (!mongoose.Types.ObjectId.isValid(logId))
    return res.status(400).json({ message: "invalid log id" });

  const log = await DeviceLog.findByIdAndUpdate(
    logId,
    { resolved: true, resolvedAt: new Date(), resolvedBy },
    { new: true },
  );
  if (!log) return res.status(404).json({ message: "alert not found" });
  return res.status(200).json({ data: log });
};

const paginatedQuery = async (Model, query, page, limit) => {
  const [logs, total] = await Promise.all([
    Model.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("deviceId", "serialNumber deviceCode"),
    Model.countDocuments(query),
  ]);
  return { logs, total, page, limit };
};

const getAlertsByDeviceIds = async (req, res) => {
  const { deviceIds, page: p, limit: l } = req.body;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0)
    return res.status(400).json({ message: "deviceIds required" });

  const page = Math.max(1, Number(p) || 1);
  const limit = Math.min(100, Math.max(1, Number(l) || 20));

  const { logs, total } = await paginatedQuery(DeviceLog, {
    deviceId: { $in: deviceIds },
    event: "alert",
  }, page, limit);

  return res.status(200).json({ data: logs, total, page, limit });
};

const getLogsByDeviceIds = async (req, res) => {
  const { deviceIds, page: p, limit: l } = req.body;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0)
    return res.status(400).json({ message: "deviceIds required" });

  const page = Math.max(1, Number(p) || 1);
  const limit = Math.min(100, Math.max(1, Number(l) || 20));

  const { logs, total } = await paginatedQuery(DeviceLog, {
    deviceId: { $in: deviceIds },
  }, page, limit);

  return res.status(200).json({ data: logs, total, page, limit });
};

const getLatestLogsForDevices = async (req, res) => {
  const { deviceIds } = req.body;
  if (!Array.isArray(deviceIds) || deviceIds.length === 0)
    return res.status(400).json({ message: "deviceIds required" });

  const objectIds = deviceIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (objectIds.length === 0)
    return res.status(400).json({ message: "no valid device ids" });

  const logs = await DeviceLog.aggregate([
    { $match: { deviceId: { $in: objectIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: "$deviceId", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);

  return res.status(200).json({ data: logs });
};

export default { getAlertsByHospital, getDeviceLogs, getLatestVitals, getUnresolvedAlerts, resolveAlert, getAlertsByDeviceIds, getLogsByDeviceIds, getLatestLogsForDevices };
