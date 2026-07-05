import express from "express";
import deviceLogController from "../controllers/deviceLogController.js";

const router = express.Router();

router.get("/alerts/:hospitalId", deviceLogController.getAlertsByHospital);
router.get("/", deviceLogController.getDeviceLogs);
router.post("/vitals/latest", deviceLogController.getLatestVitals);
router.post("/alerts/unresolved", deviceLogController.getUnresolvedAlerts);
router.patch("/:logId/resolve", deviceLogController.resolveAlert);
router.post("/alerts/query", deviceLogController.getAlertsByDeviceIds);
router.post("/query", deviceLogController.getLogsByDeviceIds);
router.post("/latest", deviceLogController.getLatestLogsForDevices);

export default router;
