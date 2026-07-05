import express from "express";
import hospitalController from "../controllers/hospitalContoller.js";
const router = express.Router();

router.post("/", hospitalController.createHospital);
router.get("/", hospitalController.getHospitalById);
router.get("/all", hospitalController.getAllHospitals);
router.post("/query", hospitalController.queryHospitals);
router.post("/addDevices", hospitalController.addDevicesToHospital);
router.post("/addCareGiver", hospitalController.addCareGiver);
export default router;
