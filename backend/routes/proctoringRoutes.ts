import { Router } from "express";
import {
  createProctoringSession,
  getProctoringSession,
  getSessionByInterview,
  getViolations,
  getAllSessions,
  getSessionReport,
  updateStrictMode,
  dismissViolation,
} from "../controllers/proctoringController.ts";

const router = Router();

router.post("/session", createProctoringSession);
router.get("/sessions", getAllSessions);
router.get("/session/:id", getProctoringSession);
router.get("/interview/:interviewId", getSessionByInterview);
router.get("/session/:id/report", getSessionReport);
router.get("/violations/:sessionId", getViolations);
router.patch("/session/:id/mode", updateStrictMode);
router.patch("/violation/:id/dismiss", dismissViolation);

export default router;
