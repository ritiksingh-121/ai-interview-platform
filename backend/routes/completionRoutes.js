import express from "express";
import { handleCompletion } from "../controllers/completionController.js";

const router = express.Router();

router.post("/", handleCompletion);

export default router;
