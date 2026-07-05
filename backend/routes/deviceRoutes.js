import express from "express";
import deviceController from "../controllers/deviceController.js";

const router = express.Router();
router.post("/", deviceController.createDevice);
router.get("/", deviceController.findDeviceById);
router.get("/all", deviceController.getAllDevices);
router.get("/hospital/:hospitalId", deviceController.getDevicesByHospital);

export default router;
