import express from "express";
import patientController from "../controllers/patientController.js";

const router = express.Router();

router.post("/", patientController.createPatient);
router.get("/", patientController.getPatientById);
router.post("/query", patientController.queryPatients);

export default router;
