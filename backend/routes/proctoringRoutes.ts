import { Router } from "express";
import {
  createProctoringSession,
  getProctoringSession,
  getSessionByInterview,
  getViolations,
  getAllSessions,
  recordViolation,
  getSessionReport,
  updateStrictMode,
  dismissViolation,
  uploadCandidatePhoto,
  getCandidatePhoto,
  saveCameraSnapshot,
  saveObjectDetection,
} from "../controllers/proctoringController.ts";

const router = Router();

router.post("/session", createProctoringSession);
router.get("/sessions", getAllSessions);
router.get("/session/:id", getProctoringSession);
router.get("/interview/:interviewId", getSessionByInterview);
router.get("/session/:id/report", getSessionReport);
router.get("/violations/:sessionId", getViolations);

router.post("/violation", recordViolation);
router.post("/photo", uploadCandidatePhoto);
router.get("/photo/:sessionId", getCandidatePhoto);
router.post("/snapshot", saveCameraSnapshot);
router.post("/object-detection", saveObjectDetection);

router.patch("/session/:id/mode", updateStrictMode);
router.patch("/violation/:id/dismiss", dismissViolation);

export default router;
