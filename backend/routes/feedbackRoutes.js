import express from "express";
import { handleFeedback, handleInterviewFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", handleFeedback);
router.post("/interview", handleInterviewFeedback);

export default router;
